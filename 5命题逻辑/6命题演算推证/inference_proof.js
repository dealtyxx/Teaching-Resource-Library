/**
 * Logic Inference & Proof Visualization (Enhanced)
 * 红色数理 - 推理与论证
 */

document.addEventListener('DOMContentLoaded', () => {
    init();
});

// --- State ---
let currentLevel = 'direct';
let proofSteps = [];
let selectedLines = [];
let isSolved = false;
let hintIndex = 0;

// --- Helper: Format Formula for MathJax ---
function formatFormula(formula) {
    return formula
        .replace(/->/g, '\\to ')
        .replace(/&/g, '\\land ')
        .replace(/\|/g, '\\lor ')
        .replace(/!/g, '\\neg ');
}

// --- Rule Descriptions ---
const RULE_DESCRIPTIONS = {
    'MP': { name: '假言推理 (Modus Ponens)', desc: 'A→B, A ⇒ B', example: '如果坚持改革则发展, 坚持改革 → 发展' },
    'MT': { name: '拒取式 (Modus Tollens)', desc: 'A→B, ¬B ⇒ ¬A', example: '如果坚持改革则发展, 未发展 → 未坚持改革' },
    'HS': { name: '假言三段论 (Hypothetical Syllogism)', desc: 'A→B, B→C ⇒ A→C', example: '政策传导链' },
    'DS': { name: '析取三段论 (Disjunctive Syllogism)', desc: 'A∨B, ¬A ⇒ B', example: '非此即彼' },
    'Simp': { name: '化简律 (Simplification)', desc: 'A∧B ⇒ A', example: '提取关键' },
    'Add': { name: '附加律 (Addition)', desc: 'A ⇒ A∨B', example: '扩大范围' },
    'Conj': { name: '合取律 (Conjunction)', desc: 'A, B ⇒ A∧B', example: '整合统一' },
    'CD': { name: '构造性二难 (Constructive Dilemma)', desc: '(A→B)∧(C→D), A∨C ⇒ B∨D', example: '政策选择' },
    'DD': { name: '破坏性二难 (Destructive Dilemma)', desc: '(A→B)∧(C→D), ¬B∨¬D ⇒ ¬A∨¬C', example: '风险预警' },
    'DM': { name: '德摩根律 (De Morgan)', desc: '¬(A∧B) ⇔ ¬A∨¬B', example: '逻辑等价' }
};

// --- Levels Configuration (Enhanced) ---
const LEVELS = {
    'direct': {
        name: '正面攻坚',
        difficulty: '⭐',
        goal: 'A -> C',
        goalDesc: '证明：如果坚持改革(A)，就能实现复兴(C)。',
        ideology: '步步为营，从顶层设计到基层落实，每一步都有据可循。',
        premises: [
            { id: 'p1', formula: 'A -> B', desc: '坚持改革(A) → 经济发展(B)' },
            { id: 'p2', formula: 'B -> C', desc: '经济发展(B) → 实现复兴(C)' }
        ],
        target: 'A -> C',
        cpAllowed: false,
        hints: [
            '提示1：这是一个典型的传导链，需要使用假言三段论(HS)。',
            '提示2：先引入两个前提，然后对它们应用HS规则。',
            '提示3：选择步骤(1)和(2)，点击HS按钮。'
        ]
    },
    'indirect': {
        name: '反腐辩证',
        difficulty: '⭐⭐',
        goal: '!C',
        goalDesc: '证明：腐败(C)是不可能的（反证法）。\n已知：如果腐败(C)，则失去民心(L)；如果失去民心(L)，则政权不稳(U)；但政权是稳固的(!U)。',
        ideology: '自我革命，勇于刀刃向内。通过逻辑推理，论证腐败在健康政治生态中的不可能性。',
        premises: [
            { id: 'p1', formula: 'C -> L', desc: '腐败(C) → 失去民心(L)' },
            { id: 'p2', formula: 'L -> U', desc: '失去民心(L) → 政权不稳(U)' },
            { id: 'p3', formula: '!U', desc: '政权稳固(!U)' }
        ],
        target: '!C',
        cpAllowed: false,
        hints: [
            '提示1：先用HS将(1)和(2)连接起来，得到C→U。',
            '提示2：然后使用MT（拒取式）：如果C→U且¬U，则¬C。',
            '提示3：这就是反证法的逻辑结构！'
        ]
    },
    'cp': {
        name: '制度探索',
        difficulty: '⭐⭐',
        goal: 'P -> Q',
        goalDesc: '证明：如果进行试点(P)，则能推广经验(Q)。\n已知：试点(P)能发现问题(D)；发现问题(D)能解决问题(S)；解决问题(S)能推广经验(Q)。',
        ideology: '大胆假设，小心求证。通过CP规则（附加前提法），模拟"试点-推广"的科学决策过程。',
        premises: [
            { id: 'p1', formula: 'P -> D', desc: '试点(P) → 发现问题(D)' },
            { id: 'p2', formula: 'D -> S', desc: '发现问题(D) → 解决问题(S)' },
            { id: 'p3', formula: 'S -> Q', desc: '解决问题(S) → 推广经验(Q)' }
        ],
        target: 'P -> Q',
        cpAllowed: true,
        hints: [
            '提示1：点击"假设(Assume)"按钮，引入P作为临时前提。',
            '提示2：从P出发，通过三次MP或HS推导出Q。',
            '提示3：最后点击"结论(Conclude)"，完成CP推理。'
        ]
    },
    'complex1': {
        name: '全面发展',
        difficulty: '⭐⭐⭐',
        goal: 'E & F',
        goalDesc: '证明：经济发展(E)与社会进步(F)可以同时实现。\n已知：改革开放(R)；改革开放蕴含经济发展(R→E)；改革开放蕴含社会进步(R→F)。',
        ideology: '统筹兼顾，既要又要。用逻辑证明"两手抓"的可行性。',
        premises: [
            { id: 'p1', formula: 'R', desc: '改革开放(R)' },
            { id: 'p2', formula: 'R -> E', desc: '改革开放(R) → 经济发展(E)' },
            { id: 'p3', formula: 'R -> F', desc: '改革开放(R) → 社会进步(F)' }
        ],
        target: 'E & F',
        cpAllowed: false,
        hints: [
            '提示1：先用MP从(1)和(2)推出E，再用MP从(1)和(3)推出F。',
            '提示2：最后使用Conj（合取律）将E和F合并为E∧F。',
            '提示3：这体现了"五位一体"总体布局的整体性。'
        ]
    },
    'complex2': {
        name: '路径选择',
        difficulty: '⭐⭐⭐',
        goal: 'G | H',
        goalDesc: '证明：要么走创新之路(G)，要么走改革之路(H)。\n已知：不发展就倒退(!D→B)；倒退则危机(B→C)；危机则必须创新或改革(C→(G|H))；事实上我们不发展(!D)。',
        ideology: '居安思危，主动求变。逻辑推演国家发展的必然选择。',
        premises: [
            { id: 'p1', formula: '!D -> B', desc: '不发展(!D) → 倒退(B)' },
            { id: 'p2', formula: 'B -> C', desc: '倒退(B) → 危机(C)' },
            { id: 'p3', formula: 'C -> (G | H)', desc: '危机(C) → (创新(G) | 改革(H))' },
            { id: 'p4', formula: '!D', desc: '不发展(!D)' }
        ],
        target: 'G | H',
        cpAllowed: false,
        hints: [
            '提示1：这是一个四步推理链：!D → B → C → (G|H)。',
            '提示2：先对(1)(2)用HS得到!D→C，再对结果与(3)用HS。',
            '提示3：最后用MP加上前提(4)!D，推出G|H。'
        ]
    }
};

function init() {
    setupTabs();
    setupToolbox();
    setupHintSystem();
    loadLevel('direct');
}

// --- Enhanced Logic Engine ---
function checkRule(rule, lines) {
    if (lines.length === 0) return null;

    const f1 = lines[0].formula;
    const f2 = lines.length > 1 ? lines[1].formula : null;

    // Helper functions
    const parseImp = (s) => {
        const parts = s.split('->').map(x => x.trim());
        return parts.length === 2 ? { left: parts[0], right: parts[1] } : null;
    };

    const parseAnd = (s) => {
        // Simple check for A & B pattern
        const parts = s.split('&').map(x => x.trim());
        return parts.length === 2 ? { left: parts[0], right: parts[1] } : null;
    };

    const parseOr = (s) => {
        // Check for patterns like (A | B)
        const match = s.match(/^\((.+?)\s*\|\s*(.+?)\)$/) || s.match(/^(.+?)\s*\|\s*(.+?)$/);
        return match ? { left: match[1].trim(), right: match[2].trim() } : null;
    };

    switch (rule) {
        case 'MP': // A->B, A => B
            if (!f2) return null;
            let imp = parseImp(f1);
            if (imp && imp.left === f2) return imp.right;
            imp = parseImp(f2);
            if (imp && imp.left === f1) return imp.right;
            return null;

        case 'MT': // A->B, !B => !A
            if (!f2) return null;
            imp = parseImp(f1);
            if (imp && f2 === '!' + imp.right) return '!' + imp.left;
            imp = parseImp(f2);
            if (imp && f1 === '!' + imp.right) return '!' + imp.left;
            return null;

        case 'HS': // A->B, B->C => A->C
            if (!f2) return null;
            const i1 = parseImp(f1);
            const i2 = parseImp(f2);
            if (i1 && i2) {
                if (i1.right === i2.left) return `${i1.left} -> ${i2.right}`;
                if (i2.right === i1.left) return `${i2.left} -> ${i1.right}`;
            }
            return null;

        case 'DS': // A|B, !A => B
            if (!f2) return null;
            const or1 = parseOr(f1);
            if (or1) {
                if (f2 === '!' + or1.left) return or1.right;
                if (f2 === '!' + or1.right) return or1.left;
            }
            const or2 = parseOr(f2);
            if (or2) {
                if (f1 === '!' + or2.left) return or2.right;
                if (f1 === '!' + or2.right) return or2.left;
            }
            return null;

        case 'Simp': // A&B => A (or B)
            const and1 = parseAnd(f1);
            if (and1) {
                // User chooses which side to simplify to
                // For now, return left (can be made interactive)
                return and1.left;
            }
            return null;

        case 'Add': // A => A|B (user input B needed, skip for now)
            return null;

        case 'Conj': // A, B => A&B
            if (!f2) return null;
            return `${f1} & ${f2}`;

        case 'CD': // (A->B)&(C->D), A|C => B|D
            // Complex, skip for this demo
            return null;

        case 'DD': // (A->B)&(C->D), !B|!D => !A|!C
            // Complex, skip for this demo
            return null;

        case 'DM': // De Morgan's Laws (equivalence, not inference)
            // Could implement but needs input from user
            return null;

        default:
            return null;
    }
}

// --- UI Interaction ---

function setupTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadLevel(btn.dataset.tab);
        });
    });
}

function setupHintSystem() {
    // Create hint button
    const hintBtn = document.createElement('button');
    hintBtn.id = 'hintBtn';
    hintBtn.className = 'control-btn';
    hintBtn.textContent = '💡 提示';
    hintBtn.onclick = showHint;

    const actionRow = document.querySelector('.action-row');
    if (actionRow) {
        const old = document.getElementById('hintBtn');
        if (old) old.remove();
        actionRow.insertBefore(hintBtn, actionRow.firstChild);
    }
}

function showHint() {
    const config = LEVELS[currentLevel];
    if (!config.hints || hintIndex >= config.hints.length) {
        alert('已无更多提示！');
        return;
    }

    alert(config.hints[hintIndex]);
    hintIndex++;
}

function loadLevel(levelId) {
    currentLevel = levelId;
    const config = LEVELS[levelId];
    if (!config) return;

    // Reset State
    proofSteps = [];
    selectedLines = [];
    isSolved = false;
    hintIndex = 0;

    // Update UI
    document.getElementById('goalFormula').innerHTML = `$$ ${formatFormula(config.goal)} $$`;
    document.getElementById('goalDesc').innerHTML = `
        <div style="margin-bottom: 8px;">${config.goalDesc}</div>
        <div style="background: #fff5f5; padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 0.95rem; border-left: 3px solid #de2910;">
            <strong>🚩 思政启示：</strong>${config.ideology}
        </div>
        <div style="margin-top: 8px; color: #999; font-size:0.85rem;">难度: ${config.difficulty}</div>
    `;
    document.getElementById('proofStatus').innerHTML = '<span class="status-text">正在推演中...</span>';
    document.getElementById('cpSection').classList.toggle('hidden', !config.cpAllowed);

    // Render Premises
    const pList = document.getElementById('premiseList');
    pList.innerHTML = '';
    config.premises.forEach(p => {
        const btn = document.createElement('div');
        btn.className = 'premise-btn';
        // Display premises in simple text or MathJax? Let's keep simple text for toolbox readability, 
        // or use formatFormula but inside $$? Toolbox is narrow, $$ might be too big.
        // Let's stick to text but maybe replace -> with arrow symbol for better look?
        const displayFormula = p.formula.replace(/->/g, '→').replace(/&/g, '∧').replace(/\|/g, '∨').replace(/!/g, '¬');
        btn.innerHTML = `<strong>${displayFormula}</strong><br><small>${p.desc}</small>`;
        btn.onclick = () => addStep(p.formula, 'P (前提)');
        pList.appendChild(btn);
    });

    renderProofTable();
    if (window.MathJax) MathJax.typesetPromise();
}

function setupToolbox() {
    // Rule Buttons with tooltips
    document.querySelectorAll('.rule-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'cpStartBtn') {
                handleCPStart();
                return;
            }
            if (btn.id === 'cpEndBtn') {
                handleCPEnd();
                return;
            }

            const rule = btn.dataset.rule;
            applyRule(rule);
        });

        // Add tooltip
        const rule = btn.dataset.rule;
        if (rule && RULE_DESCRIPTIONS[rule]) {
            btn.title = RULE_DESCRIPTIONS[rule].desc;
        }
    });

    // Controls
    document.getElementById('undoBtn').onclick = () => {
        if (proofSteps.length > 0) {
            proofSteps.pop();
            selectedLines = [];
            renderProofTable();
        }
    };
    document.getElementById('resetBtn').onclick = () => loadLevel(currentLevel);
}

function addStep(formula, reason) {
    if (isSolved) return;

    proofSteps.push({
        id: proofSteps.length + 1,
        formula: formula,
        reason: reason
    });

    selectedLines = [];
    renderProofTable();
    checkWinCondition();
}

function applyRule(rule) {
    if (selectedLines.length === 0) {
        alert("请先在右侧表格中点击选择要引用的步骤（1-2行）");
        return;
    }

    const lines = selectedLines.map(idx => proofSteps[idx]);
    const result = checkRule(rule, lines);

    if (result) {
        const lineNums = selectedLines.map(i => i + 1).join(', ');
        const ruleName = RULE_DESCRIPTIONS[rule]?.name || rule;
        addStep(result, `T (${ruleName}) on ${lineNums}`);
    } else {
        const ruleName = RULE_DESCRIPTIONS[rule]?.name || rule;
        alert(`无法应用"${ruleName}"。\n${RULE_DESCRIPTIONS[rule]?.desc || ''}\n请检查选择的步骤是否符合规则。`);
        selectedLines = [];
        renderProofTable();
    }
}

function handleCPStart() {
    const config = LEVELS[currentLevel];
    if (config.goal.includes('->')) {
        const parts = config.goal.split('->').map(s => s.trim());
        const assumption = parts[0];
        addStep(assumption, 'P (CP假设 - 临时前提)');
    }
}

function handleCPEnd() {
    const config = LEVELS[currentLevel];
    if (config.goal.includes('->')) {
        const parts = config.goal.split('->').map(s => s.trim());
        const consequent = parts[1];

        const lastStep = proofSteps[proofSteps.length - 1];
        if (lastStep.formula === consequent) {
            addStep(`${parts[0]} -> ${parts[1]}`, 'CP (附加前提法完成)');
        } else {
            alert(`CP规则要求最后一步必须是结论 "${consequent}"`);
        }
    }
}

function renderProofTable() {
    const tbody = document.querySelector('#proofTable tbody');
    tbody.innerHTML = '';

    proofSteps.forEach((step, index) => {
        const tr = document.createElement('tr');
        if (selectedLines.includes(index)) {
            tr.classList.add('selected');
        }

        tr.innerHTML = `
            <td>(${step.id})</td>
            <td>$$ ${formatFormula(step.formula)} $$</td>
            <td>${step.reason}</td>
        `;

        tr.onclick = () => {
            if (selectedLines.includes(index)) {
                selectedLines = selectedLines.filter(i => i !== index);
            } else {
                if (selectedLines.length < 2) {
                    selectedLines.push(index);
                } else {
                    selectedLines.shift();
                    selectedLines.push(index);
                }
            }
            renderProofTable();
        };

        tbody.appendChild(tr);
    });

    if (window.MathJax) MathJax.typesetPromise();
}

function checkWinCondition() {
    const config = LEVELS[currentLevel];
    const lastStep = proofSteps[proofSteps.length - 1];

    if (lastStep && lastStep.formula === config.target) {
        isSolved = true;
        const quotes = [
            '"真理是时间的女儿，不是权威的女儿。" —— 培根',
            '"实践是检验真理的唯一标准。" —— 马克思主义哲学',
            '"逻辑是思维的规律，也是探寻真理的阶梯。" —— 亚里士多德',
            '"求真务实，是我们的根本要求。"',
            '"步步为营，才能登顶真理。"'
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        document.getElementById('proofStatus').innerHTML = `
            <span class="status-text success">🎉 推演成功！真理已证！</span>
            <div style="font-size: 0.9rem; margin-top: 10px; color: #7f8c8d;">
                ${randomQuote}
            </div>
            <div style="margin-top: 15px;">
                <button onclick="loadLevel(currentLevel)" style="padding: 8px 20px; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer;">再试一次</button>
            </div>
        `;
    }
}
