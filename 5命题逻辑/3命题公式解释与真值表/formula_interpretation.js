/**
 * Formula Interpretation & Truth Values
 * 命题解释与真值：求真务实的逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    setupTabs();
    setupAssignments();
    setupClassifier();
    setupSimulator();
}

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

// --- Logic Parser & Evaluator ---
const Logic = {
    // Tokenizer
    tokenize: (formula) => {
        // Remove spaces but keep operators intact
        let s = formula.replace(/\s+/g, '');
        const tokens = [];
        let i = 0;
        while (i < s.length) {
            const c = s[i];
            if (s.startsWith('<->', i)) { tokens.push('<->'); i += 3; }
            else if (s.startsWith('->', i)) { tokens.push('->'); i += 2; }
            else if ('&|!()'.includes(c)) { tokens.push(c); i++; }
            else {
                // Variable (alphanumeric)
                let j = i;
                while (j < s.length && /[a-zA-Z0-9]/.test(s[j])) j++;
                if (j === i) { i++; } // Skip unknown char
                else { tokens.push(s.slice(i, j)); i = j; }
            }
        }
        return tokens;
    },

    // Recursive Descent Parser
    parse: (tokens) => {
        let pos = 0;
        const peek = () => tokens[pos];
        const consume = () => tokens[pos++];

        // Expression: Iff
        const parseExpression = () => parseIff();

        // Iff: Implies (<-> Implies)*
        const parseIff = () => {
            let left = parseImplies();
            while (peek() === '<->') {
                consume();
                const right = parseImplies();
                left = { type: 'IFF', left, right };
            }
            return left;
        };

        // Implies: Or (-> Implies)? (Right Associative)
        const parseImplies = () => {
            let left = parseOr();
            if (peek() === '->') {
                consume();
                const right = parseImplies(); // Recursion for right associativity
                left = { type: 'IMP', left, right };
            }
            return left;
        };

        // Or: And (| And)*
        const parseOr = () => {
            let left = parseAnd();
            while (peek() === '|') {
                consume();
                const right = parseAnd();
                left = { type: 'OR', left, right };
            }
            return left;
        };

        // And: Not (& Not)*
        const parseAnd = () => {
            let left = parseNot();
            while (peek() === '&') {
                consume();
                const right = parseNot();
                left = { type: 'AND', left, right };
            }
            return left;
        };

        // Not: ! Not | Factor
        const parseNot = () => {
            if (peek() === '!') {
                consume();
                return { type: 'NOT', operand: parseNot() };
            }
            return parseFactor();
        };

        // Factor: ( Expression ) | Variable
        const parseFactor = () => {
            const t = peek();
            if (t === '(') {
                consume();
                const expr = parseExpression();
                if (peek() === ')') consume();
                return expr;
            }
            if (t && /[a-zA-Z0-9]/.test(t)) {
                return { type: 'VAR', value: consume() };
            }
            // Fallback for syntax errors or empty
            return { type: 'VAR', value: 'FALSE' };
        };

        return parseExpression();
    },

    // Evaluator
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
        } catch (e) {
            console.error("Parse/Eval Error", e);
            return false;
        }
    },

    getVariables: (formula) => {
        const tokens = Logic.tokenize(formula);
        const vars = new Set();
        tokens.forEach(t => {
            if (!['&', '|', '!', '->', '<->', '(', ')'].includes(t)) {
                vars.add(t);
            }
        });
        return Array.from(vars).sort();
    }
};

// --- Assignments Tab ---
function setupAssignments() {
    const input = document.getElementById('formulaInput');
    const btn = document.getElementById('analyzeBtn');
    const container = document.getElementById('truthTableContainer');
    const presets = document.querySelectorAll('.preset-btn');
    const currentConnective = document.getElementById('currentConnective');

    presets.forEach(p => {
        p.addEventListener('click', () => {
            // Remove active class from all presets
            presets.forEach(btn => btn.classList.remove('active'));
            p.classList.add('active');

            input.value = p.dataset.formula;
            currentConnective.innerHTML = `当前选择: <strong>${p.dataset.desc}</strong>`;
            generateTable();
        });
    });

    btn.addEventListener('click', generateTable);

    // Allow Enter key to generate table
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateTable();
    });

    function generateTable() {
        const formula = input.value.trim();
        if (!formula) return;

        const vars = Logic.getVariables(formula);
        if (vars.length === 0) {
            container.innerHTML = '<div style="padding: 40px; text-align: center; color: #e74c3c; font-size: 1.1rem;">⚠️ 请输入包含变元的公式 (如 p, q)</div>';
            return;
        }

        // Limit variables to prevent crashing (max 5 variables = 32 rows)
        if (vars.length > 5) {
            container.innerHTML = '<div style="padding: 40px; text-align: center; color: #e74c3c; font-size: 1.1rem;">⚠️ 变元过多，请控制在5个以内</div>';
            return;
        }

        const rows = 1 << vars.length; // 2^n

        let html = '<table class="truth-table"><thead><tr>';
        vars.forEach(v => html += `<th>${v.toUpperCase()}</th>`);
        html += `<th style="background: #fef5e7; color: #e67e22; font-weight: bold;">公式结果</th></tr></thead><tbody>`;

        let trueCount = 0;
        let falseCount = 0;

        for (let i = 0; i < rows; i++) {
            const assignment = {};
            for (let j = 0; j < vars.length; j++) {
                // Generate truth values. We usually want T first, so we invert the bit check
                const val = rows - 1 - i;
                const isTrue = (val >> (vars.length - 1 - j)) & 1;
                assignment[vars[j]] = !!isTrue;
            }

            const result = Logic.evaluate(formula, assignment);
            if (result) trueCount++;
            else falseCount++;

            const rowClass = result ? 'row-true' : 'row-false';

            html += `<tr class="${rowClass}">`;
            vars.forEach(v => {
                html += `<td>${assignment[v] ? 'T' : 'F'}</td>`;
            });
            html += `<td style="font-weight: bold; font-size: 1.1rem;">${result ? 'T' : 'F'}</td></tr>`;
        }

        html += '</tbody></table>';

        // Add summary
        html += `<div style="margin-top: 20px; padding: 16px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid var(--primary-red);">`;
        html += `<strong>统计摘要：</strong><br>`;
        html += `共 ${rows} 种可能情况（解释），其中 <span style="color: #28a745; font-weight: bold;">${trueCount} 种成真赋值</span>，`;
        html += `<span style="color: #dc3545; font-weight: bold;">${falseCount} 种成假赋值</span>。`;
        html += `</div>`;

        container.innerHTML = html;
    }

    // Initial generation
    generateTable();
}

// --- Classifier Tab ---
function setupClassifier() {
    const input = document.getElementById('classInput');
    const btn = document.getElementById('classBtn');
    const resultDisplay = document.getElementById('classResult');

    // Allow Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') classify();
    });

    btn.addEventListener('click', classify);

    function classify() {
        const formula = input.value.trim();
        if (!formula) {
            resultDisplay.innerHTML = '<div class="placeholder-text" style="color: #e74c3c;">⚠️ 请输入公式</div>';
            return;
        }

        const vars = Logic.getVariables(formula);
        if (vars.length === 0) {
            resultDisplay.innerHTML = '<div class="placeholder-text" style="color: #e74c3c;">⚠️ 公式中没有变元</div>';
            return;
        }

        const rows = 1 << vars.length;
        let trueCount = 0;
        let falseCount = 0;

        for (let i = 0; i < rows; i++) {
            const assignment = {};
            for (let j = 0; j < vars.length; j++) {
                assignment[vars[j]] = !!((i >> j) & 1); // Order doesn't matter for classification
            }
            if (Logic.evaluate(formula, assignment)) {
                trueCount++;
            } else {
                falseCount++;
            }
        }

        let type = '';
        let desc = '';
        let icon = '';
        let color = '';
        let ideologyNote = '';

        if (falseCount === 0) {
            type = '永真式 (Tautology)';
            desc = `该公式在所有 ${rows} 种赋值情况下都为真。`;
            icon = '☀️';
            color = '#f1c40f';
            ideologyNote = '象征着绝对真理与核心价值观。如"为人民服务"、"人民至上"等永恒命题，在任何条件下都成立。';
        } else if (trueCount === 0) {
            type = '永假式 (Contradiction)';
            desc = `该公式在所有 ${rows} 种赋值情况下都为假。`;
            icon = '🌑';
            color = '#e74c3c';
            ideologyNote = '象征着逻辑谬误与根本错误。如"既要...又不要..."的自相矛盾命题，在任何条件下都无法实现。';
        } else {
            type = '可满足式 (Satisfiable)';
            desc = `在 ${rows} 种可能情况中，有 ${trueCount} 种为真，${falseCount} 种为假。`;
            icon = '🌤️';
            color = '#3498db';
            ideologyNote = '象征着具体政策需要特定条件才能成功。体现"具体问题具体分析"的辩证思维，需要创造"成真"的条件。';
        }

        resultDisplay.innerHTML = `
            <div style="text-align: center; animation: fadeIn 0.5s; padding: 20px;">
                <div style="font-size: 4rem; margin-bottom: 16px;">${icon}</div>
                <h3 style="color: ${color}; margin-bottom: 12px; font-size: 1.8rem;">${type}</h3>
                <p style="color: #34495e; font-size: 1.1rem; margin-bottom: 16px;">${desc}</p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 5px solid ${color}; text-align: left;">
                    <h4 style="margin-bottom: 8px; color: ${color};">💡 思政解读</h4>
                    <p style="color: #7f8c8d; line-height: 1.6; margin: 0;">${ideologyNote}</p>
                </div>
            </div>
        `;
    }
}

// --- Simulator Tab ---
function setupSimulator() {
    const levels = {
        1: {
            name: '乡村振兴',
            formula: '(p & q) | (r & s)',
            desc: '只有当(产业兴旺p 且 生态宜居q)，或者(乡风文明r 且 治理有效s)时，才能实现目标。',
            vars: { p: '产业兴旺', q: '生态宜居', r: '乡风文明', s: '治理有效' }
        },
        2: {
            name: '科技强国',
            formula: 'p & (q | r)',
            desc: '必须坚持党的领导(p)，并且(基础研究突破q 或者 关键技术攻关r)。',
            vars: { p: '党的领导', q: '基础研究', r: '技术攻关' }
        },
        3: {
            name: '民族复兴',
            formula: '(p & q & r) -> s',
            desc: '如果(经济发展p 且 文化繁荣q 且 社会和谐r)，则实现民族复兴(s)。(提示：要让蕴含式为真，或者前件假，或者后件真。但在实践中我们追求前件真且后件真)',
            vars: { p: '经济发展', q: '文化繁荣', r: '社会和谐', s: '民族复兴' }
        }
    };

    let currentLevel = 1;
    const controlsArea = document.getElementById('variableControls');
    const statusIndicator = document.getElementById('missionStatus');
    const levelBtns = document.querySelectorAll('.level-btn');

    function loadLevel(levelId) {
        currentLevel = levelId;
        const level = levels[levelId];

        document.getElementById('missionName').textContent = level.name;
        document.getElementById('missionFormula').textContent = `$$ ${level.formula.replace(/&/g, '\\land').replace(/\|/g, '\\lor').replace(/->/g, '\\rightarrow')} $$`;
        document.querySelector('.mission-desc').textContent = level.desc;

        // Generate controls
        controlsArea.innerHTML = '';
        Object.entries(level.vars).forEach(([key, label]) => {
            const div = document.createElement('div');
            div.className = 'switch-control';
            div.innerHTML = `
                <div class="switch-label">${label} (${key})</div>
                <label class="switch">
                    <input type="checkbox" data-var="${key}">
                    <span class="slider"></span>
                </label>
            `;
            controlsArea.appendChild(div);
        });

        // Re-render MathJax
        if (window.MathJax) {
            MathJax.typesetPromise();
        }

        checkStatus();

        // Add listeners
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', checkStatus);
        });
    }

    function checkStatus() {
        const level = levels[currentLevel];
        const assignment = {};

        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            assignment[cb.dataset.var] = cb.checked;
        });

        const result = Logic.evaluate(level.formula, assignment);
        const icon = document.querySelector('.status-icon');
        const text = document.querySelector('.status-text');

        if (result) {
            statusIndicator.className = 'status-indicator success';
            icon.textContent = '🎉';
            text.textContent = '目标达成！(成真赋值)';
        } else {
            statusIndicator.className = 'status-indicator fail';
            icon.textContent = '⚠️';
            text.textContent = '尚未实现 (成假赋值)';
        }
    }

    levelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            levelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadLevel(btn.dataset.level);
        });
    });

    // Init
    loadLevel(1);
}
