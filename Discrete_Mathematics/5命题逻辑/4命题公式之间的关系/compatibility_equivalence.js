/**
 * Compatibility & Equivalence Visualization
 * 红色数理 - 逻辑关系：一致性与推导
 */

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    setupTabs();
    setupEquivalence();
    setupImplication();
    setupChallenge();
}

// --- Logic Parser (Reused from previous task for robustness) ---
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

// --- Equivalence Checker ---
function setupEquivalence() {
    const btn = document.getElementById('checkEqBtn');
    const resultPanel = document.getElementById('eqResult');

    btn.addEventListener('click', () => {
        const f1 = document.getElementById('eqInputA').value.trim();
        const f2 = document.getElementById('eqInputB').value.trim();

        if (!f1 || !f2) {
            resultPanel.innerHTML = '<div style="color:red">请输入两个公式</div>';
            return;
        }

        const vars = Array.from(new Set([...Logic.getVariables(f1), ...Logic.getVariables(f2)])).sort();
        const rows = 1 << vars.length;
        let isEquivalent = true;
        let counterExample = null;

        for (let i = 0; i < rows; i++) {
            const assignment = {};
            for (let j = 0; j < vars.length; j++) {
                assignment[vars[j]] = !!((i >> j) & 1);
            }
            const res1 = Logic.evaluate(f1, assignment);
            const res2 = Logic.evaluate(f2, assignment);
            if (res1 !== res2) {
                isEquivalent = false;
                counterExample = assignment;
                break;
            }
        }

        if (isEquivalent) {
            resultPanel.innerHTML = `
                <div class="result-content">
                    <div class="result-icon">🤝</div>
                    <div class="result-title" style="color: #27ae60;">逻辑等价 (一致)</div>
                    <div class="result-desc">无论环境如何变化（变量赋值），两者的结果始终一致。</div>
                    <div style="color: #27ae60; font-weight: bold;">${f1} $\\Leftrightarrow$ ${f2}</div>
                </div>
            `;
        } else {
            let exampleStr = Object.entries(counterExample).map(([k, v]) => `${k}=${v ? 'T' : 'F'}`).join(', ');
            resultPanel.innerHTML = `
                <div class="result-content">
                    <div class="result-icon">⚡</div>
                    <div class="result-title" style="color: #c0392b;">逻辑不等价 (不一致)</div>
                    <div class="result-desc">存在不一致的情况，即"理论"与"实践"脱节。</div>
                    <div class="counter-example">
                        <strong>反例：</strong> 当 ${exampleStr} 时，<br>
                        公式A为 ${Logic.evaluate(f1, counterExample) ? 'T' : 'F'}，但公式B为 ${Logic.evaluate(f2, counterExample) ? 'T' : 'F'}。
                    </div>
                </div>
            `;
        }
        if (window.MathJax) window.MathJax&&window.MathJax.typesetPromise&&MathJax.typesetPromise();
    });
}

// --- Implication Analyzer ---
function setupImplication() {
    const btn = document.getElementById('checkImpBtn');
    const resultPanel = document.getElementById('impResult');

    btn.addEventListener('click', () => {
        const f1 = document.getElementById('impInputA').value.trim();
        const f2 = document.getElementById('impInputB').value.trim();

        if (!f1 || !f2) {
            resultPanel.innerHTML = '<div style="color:red">请输入两个公式</div>';
            return;
        }

        const vars = Array.from(new Set([...Logic.getVariables(f1), ...Logic.getVariables(f2)])).sort();
        const rows = 1 << vars.length;
        let isImplied = true;
        let counterExample = null;

        for (let i = 0; i < rows; i++) {
            const assignment = {};
            for (let j = 0; j < vars.length; j++) {
                assignment[vars[j]] = !!((i >> j) & 1);
            }
            const res1 = Logic.evaluate(f1, assignment);
            const res2 = Logic.evaluate(f2, assignment);

            // Implication fails if A is True and B is False
            if (res1 && !res2) {
                isImplied = false;
                counterExample = assignment;
                break;
            }
        }

        if (isImplied) {
            resultPanel.innerHTML = `
                <div class="result-content">
                    <div class="result-icon">🚀</div>
                    <div class="result-title" style="color: #27ae60;">逻辑蕴含 (成立)</div>
                    <div class="result-desc">前提必然导致结论。措施到位，目标必达。</div>
                    <div style="color: #27ae60; font-weight: bold;">${f1} $\\Rightarrow$ ${f2}</div>
                </div>
            `;
        } else {
            let exampleStr = Object.entries(counterExample).map(([k, v]) => `${k}=${v ? 'T' : 'F'}`).join(', ');
            resultPanel.innerHTML = `
                <div class="result-content">
                    <div class="result-icon">🚧</div>
                    <div class="result-title" style="color: #c0392b;">逻辑蕴含 (不成立)</div>
                    <div class="result-desc">存在"前提真但结论假"的情况，说明措施不足以保证结果。</div>
                    <div class="counter-example">
                        <strong>反例：</strong> 当 ${exampleStr} 时，<br>
                        前提A为真 (T)，但结论B为假 (F)。
                    </div>
                </div>
            `;
        }
        if (window.MathJax) window.MathJax&&window.MathJax.typesetPromise&&MathJax.typesetPromise();
    });
}

// --- Challenge Mode ---
function setupChallenge() {
    const questions = [
        {
            level: '基础篇',
            text: '根据德摩根律 (De Morgan\'s Laws)，以下哪个公式与题目等价？',
            formula: '!(p & q)', // Not (p and q)
            options: [
                { text: '!p & !q', correct: false },
                { text: '!p | !q', correct: true }, // Correct: Not p or Not q
                { text: 'p | q', correct: false },
                { text: '!(p | q)', correct: false }
            ],
            explanation: '!(p & q) 等价于 !p | !q。即"并非既要p又要q" 等于 "要么不要p，要么不要q"。'
        },
        {
            level: '进阶篇',
            text: '蕴含式 (Implication) 可以转换为析取式。以下哪个等价？',
            formula: 'p -> q',
            options: [
                { text: 'p & !q', correct: false },
                { text: '!p | q', correct: true }, // Correct: Not p or q
                { text: 'q -> p', correct: false },
                { text: '!p & q', correct: false }
            ],
            explanation: 'p -> q 等价于 !p | q。即"如果p则q" 等于 "非p或者q"。'
        },
        {
            level: '应用篇',
            text: '如果"国家强盛(p)则人民幸福(q)"，那么它的逆否命题（等价）是？',
            formula: 'p -> q',
            options: [
                { text: 'q -> p', correct: false },
                { text: '!p -> !q', correct: false },
                { text: '!q -> !p', correct: true }, // Correct: Contrapositive
                { text: '!q & p', correct: false }
            ],
            explanation: '逆否命题 !q -> !p 与原命题等价。"如果人民不幸福，则国家不强盛"。'
        }
    ];

    let currentQ = 0;
    let score = 0;

    const card = document.getElementById('questionCard');
    const grid = document.getElementById('optionsGrid');
    const feedback = document.getElementById('feedbackArea');
    const nextBtn = document.getElementById('nextLevelBtn');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('levelName');

    function loadQuestion() {
        const q = questions[currentQ];
        levelDisplay.textContent = q.level;

        card.innerHTML = `
            <div class="question-text">${q.text}</div>
            <div class="question-formula">$$ ${q.formula.replace(/&/g, '\\land').replace(/\|/g, '\\lor').replace(/->/g, '\\rightarrow').replace(/!/g, '\\neg ')} $$</div>
        `;

        grid.innerHTML = '';
        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt.text;
            btn.onclick = () => checkAnswer(idx, btn);
            grid.appendChild(btn);
        });

        feedback.textContent = '';
        nextBtn.classList.add('hidden');
        if (window.MathJax) window.MathJax&&window.MathJax.typesetPromise&&MathJax.typesetPromise();
    }

    function checkAnswer(idx, btn) {
        const q = questions[currentQ];
        const isCorrect = q.options[idx].correct;

        // Disable all buttons
        const allBtns = document.querySelectorAll('.option-btn');
        allBtns.forEach(b => b.disabled = true);

        if (isCorrect) {
            btn.classList.add('correct');
            feedback.innerHTML = `<span style="color:#27ae60">✅ 回答正确！</span> ${q.explanation}`;
            score += 10;
            scoreDisplay.textContent = score;
        } else {
            btn.classList.add('wrong');
            // Highlight correct one
            q.options.forEach((opt, i) => {
                if (opt.correct) allBtns[i].classList.add('correct');
            });
            feedback.innerHTML = `<span style="color:#c0392b">❌ 回答错误。</span> ${q.explanation}`;
        }

        if (currentQ < questions.length - 1) {
            nextBtn.classList.remove('hidden');
        } else {
            nextBtn.textContent = '挑战完成';
            nextBtn.classList.remove('hidden');
            nextBtn.onclick = () => alert(`恭喜！最终得分：${score}`);
            return;
        }
    }

    nextBtn.addEventListener('click', () => {
        currentQ++;
        loadQuestion();
    });

    loadQuestion();
}
