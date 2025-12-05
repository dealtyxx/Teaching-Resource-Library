/**
 * Normal Forms & Unification
 * 范式与统一：思想的标准化
 */

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    setupTabs();
    setupGalaxy();
    setupGenerator();
    setupUnification();
}

// --- Logic Parser ---
const Logic = {
    tokenize: (formula) => {
        let s = formula.replace(/\s+/g, '');
        const tokens = [];
        let i = 0;
        while (i < s.length) {
            const c = s[i];
            if (s.startsWith('<->', i)) { tokens.push('<->'); i += 3; }
            else if (s.startsWith('->', i)) { tokens.push('->'); i += 2; }
            else if ('&|!()'.includes(c)) { tokens.push(c); i++; }
            else {
                let j = i;
                while (j < s.length && /[a-zA-Z0-9]/.test(s[j])) j++;
                if (j === i) { i++; }
                else { tokens.push(s.slice(i, j)); i = j; }
            }
        }
        return tokens;
    },
    parse: (tokens) => {
        let pos = 0;
        const peek = () => tokens[pos];
        const consume = () => tokens[pos++];
        const parseExpression = () => parseIff();
        const parseIff = () => {
            let left = parseImplies();
            while (peek() === '<->') { consume(); const right = parseImplies(); left = { type: 'IFF', left, right }; }
            return left;
        };
        const parseImplies = () => {
            let left = parseOr();
            if (peek() === '->') { consume(); const right = parseImplies(); left = { type: 'IMP', left, right }; }
            return left;
        };
        const parseOr = () => {
            let left = parseAnd();
            while (peek() === '|') { consume(); const right = parseAnd(); left = { type: 'OR', left, right }; }
            return left;
        };
        const parseAnd = () => {
            let left = parseNot();
            while (peek() === '&') { consume(); const right = parseNot(); left = { type: 'AND', left, right }; }
            return left;
        };
        const parseNot = () => {
            if (peek() === '!') { consume(); return { type: 'NOT', operand: parseNot() }; }
            return parseFactor();
        };
        const parseFactor = () => {
            const t = peek();
            if (t === '(') { consume(); const expr = parseExpression(); if (peek() === ')') consume(); return expr; }
            if (t && /[a-zA-Z0-9]/.test(t)) { return { type: 'VAR', value: consume() }; }
            return { type: 'VAR', value: 'FALSE' };
        };
        return parseExpression();
    },
    evaluateTree: (node, assignment) => {
        if (!node) return false;
        switch (node.type) {
            case 'VAR': return node.value === 'FALSE' ? false : !!assignment[node.value];
            case 'NOT': return !Logic.evaluateTree(node.operand, assignment);
            case 'AND': return Logic.evaluateTree(node.left, assignment) && Logic.evaluateTree(node.right, assignment);
            case 'OR': return Logic.evaluateTree(node.left, assignment) || Logic.evaluateTree(node.right, assignment);
            case 'IMP': return !Logic.evaluateTree(node.left, assignment) || Logic.evaluateTree(node.right, assignment);
            case 'IFF': return Logic.evaluateTree(node.left, assignment) === Logic.evaluateTree(node.right, assignment);
            default: return false;
        }
    },
    evaluate: (formula, assignment) => {
        try {
            const tokens = Logic.tokenize(formula);
            if (tokens.length === 0) return false;
            const ast = Logic.parse(tokens);
            return Logic.evaluateTree(ast, assignment);
        } catch (e) { return false; }
    },
    getVariables: (formula) => {
        const tokens = Logic.tokenize(formula);
        const vars = new Set();
        tokens.forEach(t => { if (!['&', '|', '!', '->', '<->', '(', ')'].includes(t)) vars.add(t); });
        return Array.from(vars).sort();
    },
    // Generate PDNF (Minterms)
    getPDNF: (formula) => {
        const vars = Logic.getVariables(formula);
        if (vars.length === 0) return { pdnf: '', minterms: [] };
        const rows = 1 << vars.length;
        const minterms = [];
        for (let i = 0; i < rows; i++) {
            const assignment = {};
            for (let j = 0; j < vars.length; j++) { assignment[vars[j]] = !!((i >> j) & 1); }
            if (Logic.evaluate(formula, assignment)) {
                const parts = vars.map(v => assignment[v] ? v : `\\neg ${v}`);
                minterms.push(`(${parts.join(' \\land ')})`);
            }
        }
        if (minterms.length === 0) return { pdnf: '\\text{False}', minterms: [] };
        return { pdnf: minterms.join(' \\lor '), minterms };
    }
};

// --- Tab Switching ---
function setupTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + 'Tab').classList.add('active');
        });
    });
}

// --- Galaxy (Minterms & Maxterms) ---
function setupGalaxy() {
    const select = document.getElementById('varCountSelect');
    const grid = document.getElementById('starsGrid');
    const formulaDisplay = document.getElementById('galaxyFormula');
    const noteDisplay = document.getElementById('galaxyNote');
    const titleDisplay = document.getElementById('galaxyTitle');
    const descDisplay = document.getElementById('galaxyDesc');
    const formulaTitle = document.getElementById('formulaTitle');
    const noteIcon = document.getElementById('noteIcon');
    const modeBtns = document.querySelectorAll('.mode-btn');

    let activeIndices = new Set();
    let currentMode = 'minterm';

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            activeIndices.clear();
            updateUI();
            renderGrid();
        });
    });

    function updateUI() {
        if (currentMode === 'minterm') {
            titleDisplay.textContent = '极小项星空：聚是一团火';
            descDisplay.textContent = '每一个极小项 ($m_i$) 都是一个"基层单元"。点亮它们，汇聚成真理的火焰。';
            formulaTitle.textContent = '当前构成的公式 (主析取范式 PDNF)';
            noteIcon.textContent = '🔥';
        } else {
            titleDisplay.textContent = '极大项黑洞：严谨无漏洞';
            descDisplay.textContent = '每一个极大项 ($M_i$) 代表一种"可能得漏洞"。填补它们，构建严密无懈的理论体系。';
            formulaTitle.textContent = '当前构成的公式 (主合取范式 PCNF)';
            noteIcon.textContent = '🛡️';
        }
    }

    function renderGrid() {
        const varCount = parseInt(select.value);
        const vars = varCount === 2 ? ['p', 'q'] : ['p', 'q', 'r'];
        const rows = 1 << varCount;

        grid.innerHTML = '';
        updateFormula(vars);

        for (let i = 0; i < rows; i++) {
            const card = document.createElement('div');
            card.className = 'star-card';
            if (activeIndices.has(i)) card.classList.add('active');

            const assignment = [];
            for (let j = 0; j < varCount; j++) { assignment.push(!!((i >> j) & 1)); }

            let labelStr, expr;
            if (currentMode === 'minterm') {
                labelStr = `m_{${i}}`;
                expr = vars.map((v, idx) => assignment[idx] ? v : `!${v}`).join(' & ');
            } else {
                labelStr = `M_{${i}}`;
                expr = vars.map((v, idx) => assignment[idx] ? `!${v}` : v).join(' | ');
            }

            card.innerHTML = `
                <div class="star-icon">${currentMode === 'minterm' ? '★' : '⚫'}</div>
                <div class="star-label">$${labelStr}$</div>
                <div class="star-binary">${expr}</div>
            `;

            card.addEventListener('click', () => {
                if (activeIndices.has(i)) {
                    activeIndices.delete(i);
                    card.classList.remove('active');
                } else {
                    activeIndices.add(i);
                    card.classList.add('active');
                }
                updateFormula(vars);
            });
            grid.appendChild(card);
        }
        if (window.MathJax) MathJax.typesetPromise();
    }

    function updateFormula(vars) {
        if (activeIndices.size === 0) {
            formulaDisplay.textContent = '$$ \\emptyset $$';
            noteDisplay.textContent = currentMode === 'minterm' ? '请点亮至少一个极小项...' : '请选择至少一个极大项...';
            return;
        }

        const sortedIndices = Array.from(activeIndices).sort((a, b) => a - b);

        if (currentMode === 'minterm') {
            const parts = sortedIndices.map(i => {
                const assignment = [];
                for (let j = 0; j < vars.length; j++) { assignment.push(!!((i >> j) & 1)); }
                const term = vars.map((v, idx) => assignment[idx] ? v : `\\neg ${v}`).join(' \\land ');
                return `(${term})`;
            });
            formulaDisplay.textContent = `$$ ${parts.join(' \\lor ')} $$`;
            noteDisplay.textContent = `已汇聚 ${activeIndices.size} 个星火，形成主析取范式。`;
        } else {
            const parts = sortedIndices.map(i => {
                const assignment = [];
                for (let j = 0; j < vars.length; j++) { assignment.push(!!((i >> j) & 1)); }
                const term = vars.map((v, idx) => assignment[idx] ? `\\neg ${v}` : v).join(' \\lor ');
                return `(${term})`;
            });
            formulaDisplay.textContent = `$$ ${parts.join(' \\land ')} $$`;
            noteDisplay.textContent = `已填补 ${activeIndices.size} 个漏洞，形成主合取范式。`;
        }
        if (window.MathJax) MathJax.typesetPromise();
    }

    select.addEventListener('change', renderGrid);
    renderGrid();
}

// --- Generator ---
function setupGenerator() {
    const input = document.getElementById('genInput');
    const pdnfBtn = document.getElementById('genPdnfBtn');
    const pcnfBtn = document.getElementById('genPcnfBtn');
    const tableDiv = document.getElementById('genTable');
    const termsDiv = document.getElementById('genTerms');
    const resultDiv = document.getElementById('genResult');

    function generate(mode) {
        const formula = input.value.trim();
        if (!formula) return;
        const vars = Logic.getVariables(formula);
        if (vars.length === 0 || vars.length > 4) { alert("请使用1-4个变量"); return; }

        const rows = 1 << vars.length;
        let tableHtml = '<table><tr>' + vars.map(v => `<th>${v}</th>`).join('') + '<th>Result</th></tr>';
        let termsHtml = '';
        let resultParts = [];

        for (let i = 0; i < rows; i++) {
            const assignment = {};
            for (let j = 0; j < vars.length; j++) { assignment[vars[j]] = !!((i >> j) & 1); }
            const res = Logic.evaluate(formula, assignment);

            // PDNF uses True rows, PCNF uses False rows
            const isTarget = mode === 'PDNF' ? res : !res;

            tableHtml += `<tr class="${isTarget ? (mode === 'PDNF' ? 'row-true' : 'row-false') : ''}">`;
            vars.forEach(v => tableHtml += `<td>${assignment[v] ? '1' : '0'}</td>`);
            tableHtml += `<td>${res ? '1' : '0'}</td></tr>`;

            if (isTarget) {
                let term;
                if (mode === 'PDNF') {
                    // Minterm: 1->v, 0->!v
                    term = vars.map(v => assignment[v] ? v : `\\neg ${v}`).join(' \\land ');
                    termsHtml += `<div class="minterm-item">$m_{${i}} = (${term})$</div>`;
                    resultParts.push(`(${term})`);
                } else {
                    // Maxterm: 0->v, 1->!v
                    term = vars.map(v => assignment[v] ? `\\neg ${v}` : v).join(' \\lor ');
                    termsHtml += `<div class="minterm-item" style="border-color:#34495e">$M_{${i}} = (${term})$</div>`;
                    resultParts.push(`(${term})`);
                }
            }
        }
        tableHtml += '</table>';
        tableDiv.innerHTML = tableHtml;
        termsDiv.innerHTML = termsHtml || '<div style="color:#999">无对应项</div>';

        const joiner = mode === 'PDNF' ? ' \\lor ' : ' \\land ';
        const latex = resultParts.length > 0 ? resultParts.join(joiner) : (mode === 'PDNF' ? '\\text{False}' : '\\text{True}');
        resultDiv.textContent = `$$ ${latex} $$`;
        if (window.MathJax) MathJax.typesetPromise();
    }

    pdnfBtn.addEventListener('click', () => generate('PDNF'));
    pcnfBtn.addEventListener('click', () => generate('PCNF'));
}

// --- Unification ---
function setupUnification() {
    const btn = document.getElementById('uniCheckBtn');
    const inputA = document.getElementById('uniInputA');
    const inputB = document.getElementById('uniInputB');
    const previewA = document.getElementById('uniPdnfA');
    const previewB = document.getElementById('uniPdnfB');
    const statusIcon = document.getElementById('uniStatusIcon');
    const statusText = document.getElementById('uniStatusText');

    btn.addEventListener('click', () => {
        const fA = inputA.value.trim();
        const fB = inputB.value.trim();
        if (!fA || !fB) return;

        const resA = Logic.getPDNF(fA);
        const resB = Logic.getPDNF(fB);

        previewA.textContent = `PDNF: ${resA.pdnf.replace(/\\land/g, '&').replace(/\\lor/g, '|').replace(/\\neg/g, '!')}`;
        previewB.textContent = `PDNF: ${resB.pdnf.replace(/\\land/g, '&').replace(/\\lor/g, '|').replace(/\\neg/g, '!')}`;

        const allVars = Array.from(new Set([...Logic.getVariables(fA), ...Logic.getVariables(fB)])).sort();
        const rows = 1 << allVars.length;
        let equivalent = true;

        for (let i = 0; i < rows; i++) {
            const assignment = {};
            for (let j = 0; j < allVars.length; j++) { assignment[allVars[j]] = !!((i >> j) & 1); }
            if (Logic.evaluate(fA, assignment) !== Logic.evaluate(fB, assignment)) {
                equivalent = false;
                break;
            }
        }

        if (equivalent) {
            statusIcon.textContent = '🤝';
            statusText.textContent = '殊途同归 (统一)';
            statusText.style.color = '#27ae60';
        } else {
            statusIcon.textContent = '≠';
            statusText.textContent = '本质不同';
            statusText.style.color = '#c0392b';
        }
    });
}
