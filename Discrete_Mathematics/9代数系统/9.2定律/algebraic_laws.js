// ============================================
// 全局状态管理
// ============================================
let currentLaw = 'associative';
let currentCaseIndex = 0;
let animationSpeed = 1000;
let isAnimating = false;
let currentManualStep = -1;
let currentSequence = [];

// ============================================
// 定律定义数据
// ============================================
const LAW_DEFINITIONS = {
    'associative': {
        title: '结合律 (Associative Law)',
        content: '结合律描述了运算的分组方式不影响结果。无论先计算哪两个，最终结果相同。',
        formula: '(a ∘ b) ∘ c = a ∘ (b ∘ c)',
        meaning: '体现了"整体观念"——部分如何组合不改变整体效果',
        example: '(1+2)+3 = 1+(2+3) = 6'
    },
    'commutative': {
        title: '交换律 (Commutative Law)',
        content: '交换律描述了运算对象的顺序不影响结果。先后顺序可以互换。',
        formula: 'a ∘ b = b ∘ a',
        meaning: '体现了"平等性"——双方地位对等，不分先后',
        example: '2 + 3 = 3 + 2 = 5'
    },
    'distributive': {
        title: '分配律 (Distributive Law)',
        content: '分配律描述一个运算对另一个运算的分配性质：∘ 对 * 满足左分配律 a∘(b*c)=(a∘b)*(a∘c) 与右分配律 (b*c)∘a=(b∘a)*(c∘a)。',
        formula: 'a ∘ (b * c) = (a ∘ b) * (a ∘ c)',
        meaning: '体现了"系统性"——整体作用可分解为对各部分的作用',
        example: '2 × (3 + 4) = 2×3 + 2×4 = 14'
    },
    'absorption': {
        title: '吸收律 (Absorption Law)',
        content: '吸收律涉及两个运算 ∘ 与 *：a ∘ (a * b) = a 且 a * (a ∘ b) = a 同时成立，才称 ∘ 与 * 满足吸收律（如集合的 ∪ 与 ∩、逻辑的 ∨ 与 ∧）。',
        formula: 'a ∘ (a * b) = a,  a * (a ∘ b) = a',
        meaning: '体现了"主导性"——核心要素吸收次要因素',
        example: 'a ∨ (a ∧ b) = a (逻辑或吸收与)'
    },
    'idempotent': {
        title: '幂等律 (Idempotent Law)',
        content: '幂等律描述了元素与自身运算的结果仍为自身，体现稳定性。',
        formula: 'a ∘ a = a',
        meaning: '体现了"稳定性"——重复操作不改变状态',
        example: 'a ∨ a = a (开关重复按)'
    },
    'cancellation': {
        title: '消去律 (Cancellation Law)',
        content: '若 a ∘ b = a ∘ c 蕴含 b = c，称 a 可左消去；若 b ∘ a = c ∘ a 蕴含 b = c，称 a 可右消去。消去律要求（非零元）都可左右消去；乘法中 0 不可消去：0×2 = 0×3 但 2 ≠ 3。',
        formula: 'a ∘ b = a ∘ c ⇒ b = c,  b ∘ a = c ∘ a ⇒ b = c',
        meaning: '体现了"可追溯"——相同作用下结果相同，则作用对象必相同',
        example: '若 2+x = 2+3, 则 x = 3'
    }
};

// ============================================
// 案例数据
// ============================================
const CASES = [
    {
        law: 'associative',
        name: '三级联动决策 - 结合律',
        elements: { a: '中央政策', b: '省级细则', c: '市级实施' },
        operation: (x, y) => `${x}+${y}`,
        description: '政策传导的层级组合',
        philosophy: '政策从中央到省、市逐级细化，先把哪两级衔接起来，最终都应形成同一个完整的执行体系——这像结合律：分组方式不影响结果。它提醒我们：传导路径可以因地制宜，政策的整体性和一致性不能走样。',
        verification: {
            left: '(中央政策+省级细则)+市级实施',
            right: '中央政策+(省级细则+市级实施)',
            leftSteps: [
                { expr: '中央政策+省级细则', desc: '形成省级工作方案' },
                { expr: '(中央政策+省级细则)+市级实施', desc: '形成完整执行体系' }
            ],
            rightSteps: [
                { expr: '省级细则+市级实施', desc: '形成地方执行方案' },
                { expr: '中央政策+(省级细则+市级实施)', desc: '形成完整执行体系' }
            ]
        }
    },
    {
        law: 'associative',
        name: '产业链整合 - 结合律',
        elements: { a: '上游供应', b: '中游制造', c: '下游销售' },
        operation: (x, y) => `${x}→${y}`,
        description: '产业链环节的整合顺序',
        philosophy: '产业链可以先整合上中游再接下游，也可以先整合中下游再对接上游，最终形成同一条完整链条，体现“殊途同归”。结合律保证了整合路径的灵活性，但每个环节本身都不能缺。',
        verification: {
            left: '(上游供应→中游制造)→下游销售',
            right: '上游供应→(中游制造→下游销售)',
            leftSteps: [
                { expr: '上游供应→中游制造', desc: '形成生产体系' },
                { expr: '(上游供应→中游制造)→下游销售', desc: '形成完整产业链' }
            ],
            rightSteps: [
                { expr: '中游制造→下游销售', desc: '形成销售体系' },
                { expr: '上游供应→(中游制造→下游销售)', desc: '形成完整产业链' }
            ]
        }
    },
    {
        law: 'commutative',
        name: '平等协商 - 交换律',
        elements: { a: '甲方提案', b: '乙方提案' },
        operation: (x, y) => `综合(${x},${y})`,
        description: '双方意见的平等对待',
        philosophy: '协商中无论先听甲方还是先听乙方，综合后的决议应当相同，这正是交换律“顺序无关”的含义：各方地位平等，发言先后不应左右结果。若结果依赖顺序，就要警惕“先入为主”。',
        verification: {
            left: '综合(甲方提案,乙方提案)',
            right: '综合(乙方提案,甲方提案)',
            leftSteps: [
                { expr: '甲方提案', desc: '甲方先发言' },
                { expr: '综合(甲方提案,乙方提案)', desc: '形成综合方案' }
            ],
            rightSteps: [
                { expr: '乙方提案', desc: '乙方先发言' },
                { expr: '综合(乙方提案,甲方提案)', desc: '形成综合方案' }
            ]
        }
    },
    {
        law: 'commutative',
        name: '东西部协作 - 交换律',
        elements: { a: '东部资金', b: '西部资源' },
        operation: (x, y) => `交换(${x},${y})`,
        description: '区域协作的互惠性',
        philosophy: '东部资金与西部资源互为补充，谁先谁后不改变协作的结果，可类比交换律；它强调东西部协作是优势互补、互利共赢。',
        verification: {
            left: '交换(东部资金,西部资源)',
            right: '交换(西部资源,东部资金)',
            leftSteps: [
                { expr: '东部资金', desc: '东部提供资金' },
                { expr: '交换(东部资金,西部资源)', desc: '完成协作交换' }
            ],
            rightSteps: [
                { expr: '西部资源', desc: '西部提供资源' },
                { expr: '交换(西部资源,东部资金)', desc: '完成协作交换' }
            ]
        }
    },
    {
        law: 'distributive',
        name: '政策惠及群体 - 分配律',
        elements: { a: '优惠政策', b: '农民', c: '工人' },
        operation1: '×',
        operation2: '+',
        description: '政策对不同群体的作用',
        philosophy: '一项普惠政策作用于（农民+工人），效果等于分别作用于农民、工人再汇总，这是分配律 a×(b+c)=a×b+a×c 的类比：统一的大政方针可以分解为面向各群体的具体措施，普遍性寓于特殊性之中。',
        verification: {
            left: '优惠政策×(农民+工人)',
            right: '(优惠政策×农民)+(优惠政策×工人)',
            leftSteps: [
                { expr: '农民+工人', desc: '确定惠及群体' },
                { expr: '优惠政策×(农民+工人)', desc: '政策整体作用' }
            ],
            rightSteps: [
                { expr: '优惠政策×农民', desc: '政策惠及农民' },
                { expr: '优惠政策×工人', desc: '政策惠及工人' },
                { expr: '(优惠政策×农民)+(优惠政策×工人)', desc: '效果汇总' }
            ]
        }
    },
    {
        law: 'distributive',
        name: '资源分配正义 - 分配律',
        elements: { a: '公共资源', b: '城市', c: '农村' },
        operation1: '分配',
        operation2: '覆盖',
        description: '公共资源的公平分配',
        philosophy: '公共资源统筹覆盖城乡，等于分别落实到城市和农村，可类比分配律：统筹不是只顾一头，而是每一部分都要落到实处——“小康不小康，关键看老乡”，农村这一项不能缺席。',
        verification: {
            left: '公共资源分配(城市覆盖农村)',
            right: '(公共资源分配城市)覆盖(公共资源分配农村)',
            leftSteps: [
                { expr: '城市覆盖农村', desc: '确定覆盖范围' },
                { expr: '公共资源分配(城市覆盖农村)', desc: '整体分配资源' }
            ],
            rightSteps: [
                { expr: '公共资源分配城市', desc: '资源分配到城市' },
                { expr: '公共资源分配农村', desc: '资源分配到农村' },
                { expr: '(公共资源分配城市)覆盖(公共资源分配农村)', desc: '全面覆盖' }
            ]
        }
    },
    {
        law: 'absorption',
        name: '核心价值观主导 - 吸收律',
        elements: { a: '社会主义核心价值观', b: '其他文化' },
        operation1: '∪',
        operation2: '∩',
        description: '核心价值的主导作用',
        philosophy: '核心价值观 ∪（核心价值观 ∩ 其他文化）= 核心价值观：与其他文化的共同部分本就包含在核心价值观之中，吸收进来不会改变主体。这可以类比文化建设中“以我为主、为我所用”的立场。',
        verification: {
            left: '社会主义核心价值观∪(社会主义核心价值观∩其他文化)',
            right: '社会主义核心价值观',
            leftSteps: [
                { expr: '社会主义核心价值观∩其他文化', desc: '寻找文化共同点' },
                { expr: '社会主义核心价值观∪(社会主义核心价值观∩其他文化)', desc: '包容共同文化' }
            ],
            rightSteps: [
                { expr: '社会主义核心价值观', desc: '核心价值主导地位不变' }
            ]
        }
    },
    {
        law: 'absorption',
        name: '数据去重 - 吸收律',
        elements: { a: '已帮扶名单', b: '新申报名单' },
        operation1: '∪',
        operation2: '∩',
        description: '名单合并时的去重',
        philosophy: '统计帮扶对象时，已帮扶名单 ∪（已帮扶名单 ∩ 新申报名单）= 已帮扶名单：交集里的对象早已在名单中，再并进来也不会多出新人。吸收律正是数据去重、防止重复统计和虚报的逻辑依据——实事求是从数据真实开始。',
        verification: {
            left: '已帮扶名单∪(已帮扶名单∩新申报名单)',
            right: '已帮扶名单',
            leftSteps: [
                { expr: '已帮扶名单∩新申报名单', desc: '找出重复申报的对象' },
                { expr: '已帮扶名单∪(已帮扶名单∩新申报名单)', desc: '并入后没有新增对象' }
            ],
            rightSteps: [
                { expr: '已帮扶名单', desc: '名单保持不变' }
            ]
        }
    },
    {
        law: 'idempotent',
        name: '制度自信 - 幂等律',
        elements: { a: '中国特色社会主义制度' },
        operation: '∪',
        description: '制度的稳定性与自信',
        philosophy: '制度 ∪ 制度 = 制度：同一项制度重复确认，不会变成别的东西，这是幂等律“重复作用不改变状态”的类比，对应制度的稳定性与连续性。',
        verification: {
            left: '中国特色社会主义制度∪中国特色社会主义制度',
            right: '中国特色社会主义制度',
            leftSteps: [
                { expr: '中国特色社会主义制度', desc: '制度第一次实践' },
                { expr: '中国特色社会主义制度∪中国特色社会主义制度', desc: '制度重复实践' }
            ],
            rightSteps: [
                { expr: '中国特色社会主义制度', desc: '制度本质不变' }
            ]
        }
    },
    {
        law: 'idempotent',
        name: '真理的反复实践 - 幂等律',
        elements: { a: '实事求是' },
        operation: '∩',
        description: '真理经得起反复检验',
        philosophy: '实事求是 ∩ 实事求是 = 实事求是：用同一标准反复检验，结论保持不变，可类比幂等律。它提醒我们：经得起反复实践检验的认识才可靠。',
        verification: {
            left: '实事求是∩实事求是',
            right: '实事求是',
            leftSteps: [
                { expr: '实事求是', desc: '坚持实事求是' },
                { expr: '实事求是∩实事求是', desc: '反复坚持实事求是' }
            ],
            rightSteps: [
                { expr: '实事求是', desc: '真理本质不变' }
            ]
        }
    },
    {
        law: 'cancellation',
        name: '公平竞争 - 消去律',
        elements: { a: '起跑线', b: '选手A', c: '选手B' },
        operation: '+',
        description: '消除外部条件后的公平比较',
        philosophy: '若在同一起跑线上两名选手成绩相同，消去共同的起跑线，就能判断两人实力相当——这是消去律的类比，对应“机会平等”：只有外部条件真正相同，比较的才是能力本身。消去律成立是有前提的，前提不满足时不能简单下结论。',
        verification: {
            left: '起跑线+选手A',
            right: '起跑线+选手B',
            assumption: '假设两式相等',
            conclusion: '选手A = 选手B (实力相当)',
            leftSteps: [
                { expr: '起跑线+选手A', desc: '选手A的总成绩' }
            ],
            rightSteps: [
                { expr: '起跑线+选手B', desc: '选手B的总成绩' }
            ],
            cancelSteps: [
                { expr: '起跑线+选手A = 起跑线+选手B', desc: '成绩相等' },
                { expr: '消去"起跑线"', desc: '消除外部条件' },
                { expr: '选手A = 选手B', desc: '内在实力相同' }
            ]
        }
    },
    {
        law: 'cancellation',
        name: '对照实验 - 消去律',
        elements: { a: '相同基础条件', b: '方案A', c: '方案B' },
        operation: '+',
        description: '控制变量后比较方案本身',
        philosophy: '对照实验把共同条件“消去”，只比较变量本身：若在完全相同的条件下两种方案效果一致，就能判断两种方案本身效果相同。消去律依赖前提——共同条件必须真正相同、运算必须可消去（如乘法中不能是 0），这正是科学实验“控制变量”的思想。',
        verification: {
            left: '相同基础条件+方案A',
            right: '相同基础条件+方案B',
            assumption: '两组实验效果相同',
            conclusion: '方案A = 方案B（方案本身效果相同）',
            leftSteps: [
                { expr: '相同基础条件+方案A', desc: '实验组 A 的效果' }
            ],
            rightSteps: [
                { expr: '相同基础条件+方案B', desc: '实验组 B 的效果' }
            ],
            cancelSteps: [
                { expr: '观测：相同基础条件+方案A = 相同基础条件+方案B', desc: '两组效果一致' },
                { expr: '消去“相同基础条件”', desc: '控制变量：共同条件可消去' },
                { expr: '方案A = 方案B', desc: '方案本身效果相同' }
            ]
        }
    }
];

// ============================================
// 验证动画
// ============================================
function buildVerificationSequence(caseData) {
    const verification = caseData.verification;
    const sequence = [];
    verification.leftSteps.forEach(step => {
        sequence.push({ side: 'left', expr: step.expr, desc: `左侧: ${step.desc}` });
    });
    verification.rightSteps.forEach(step => {
        sequence.push({ side: 'right', expr: step.expr, desc: `右侧: ${step.desc}` });
    });
    (verification.cancelSteps || []).forEach(step => {
        sequence.push({ side: 'cancel', expr: step.expr, desc: step.desc });
    });
    sequence.push({
        side: 'done',
        expr: '验证完成',
        desc: verification.conclusion || '两侧表达式相等，定律成立'
    });
    return sequence;
}

function prepareVerification(caseData) {
    const stepsList = document.getElementById('stepsList');
    const comparisonDisplay = document.getElementById('comparisonDisplay');
    const equalsSign = document.getElementById('equalsSign');
    const verification = caseData.verification;

    currentSequence = buildVerificationSequence(caseData);
    currentManualStep = -1;

    stepsList.innerHTML = currentSequence.map((step, index) => `
        <div class="step-item" data-step="${index}" style="cursor:pointer;">
            <div class="step-expression">${step.expr}</div>
            <div class="step-description">${step.desc}</div>
        </div>
    `).join('');
    comparisonDisplay.style.display = 'grid';
    equalsSign.textContent = '=';
    equalsSign.classList.remove('not-equal');

    document.getElementById('leftValue').textContent = '-';
    document.getElementById('rightValue').textContent = '-';
    document.getElementById('lawFormulaDisplay').className = 'law-formula-display';
    document.getElementById('lawFormulaDisplay').innerHTML = `
        <h3>${caseData.name}</h3>
        <div class="formula-box">
            <div class="formula" data-side="left">${verification.left}</div>
            <div class="formula" style="color: var(--accent-gold); margin: 0.5rem 0;">=</div>
            <div class="formula" data-side="right">${verification.right}</div>
        </div>
    `;
}

function renderVerificationStep(index) {
    if (!currentSequence.length) return;
    currentManualStep = Math.max(0, Math.min(index, currentSequence.length - 1));
    const step = currentSequence[currentManualStep];
    const leftValue = document.getElementById('leftValue');
    const rightValue = document.getElementById('rightValue');
    const equalsSign = document.getElementById('equalsSign');
    const formulaBox = document.getElementById('lawFormulaDisplay');
    const verification = CASES[currentCaseIndex].verification;

    document.querySelectorAll('#stepsList .step-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === currentManualStep);
        item.classList.toggle('success', idx < currentManualStep || (idx === currentManualStep && step.side === 'done'));
    });

    formulaBox.classList.remove('left-hot', 'right-hot', 'compare-hot');
    if (step.side === 'left') {
        formulaBox.classList.add('left-hot');
        leftValue.textContent = step.expr.substring(0, 20) + (step.expr.length > 20 ? '...' : '');
    } else if (step.side === 'right') {
        formulaBox.classList.add('right-hot');
        rightValue.textContent = step.expr.substring(0, 20) + (step.expr.length > 20 ? '...' : '');
    } else {
        formulaBox.classList.add('compare-hot');
    }

    if (step.side === 'done') {
        leftValue.textContent = verification.left.substring(0, 20) + (verification.left.length > 20 ? '...' : '');
        rightValue.textContent = verification.right.substring(0, 20) + (verification.right.length > 20 ? '...' : '');
    }

    if (verification.conclusion && verification.conclusion.includes('≠')) {
        equalsSign.textContent = '≠';
        equalsSign.classList.add('not-equal');
    } else {
        equalsSign.textContent = '=';
        equalsSign.classList.remove('not-equal');
    }
}

function advanceManualStep() {
    if (isAnimating) return;
    const caseData = CASES[currentCaseIndex];
    if (!currentSequence.length) {
        prepareVerification(caseData);
    }
    renderVerificationStep(Math.min(currentManualStep + 1, currentSequence.length - 1));
}

function resetVerificationView() {
    // 重置后直接展示本案例的待验证等式与步骤清单（不留空白舞台）
    prepareVerification(CASES[currentCaseIndex]);
}

async function verifyLaw(caseData) {
    prepareVerification(caseData);

    for (let i = 0; i < currentSequence.length; i++) {
        renderVerificationStep(i);
        await sleep(animationSpeed);
    }
}

// ============================================
// 辅助函数
// ============================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateDefinitionPanel(law) {
    const def = LAW_DEFINITIONS[law];
    const panel = document.getElementById('definitionPanel');

    panel.innerHTML = `
        <h3>${def.title}</h3>
        <p>${def.content}</p>
        <div class="law-formula">${def.formula}</div>
        <p style="font-size: 0.85rem; line-height: 1.5;">
            <strong style="color: var(--accent-gold);">意义:</strong> ${def.meaning}
        </p>
        <p style="font-size: 0.8rem; color: var(--text-secondary);">
            <strong>例子:</strong> ${def.example}
        </p>
    `;
}

function updateExamplesList(law) {
    const examples = CASES.filter(c => c.law === law);
    const list = document.getElementById('examplesList');

    list.innerHTML = examples.map((ex, index) => {
        const globalIndex = CASES.indexOf(ex);
        return `
            <div class="example-item" onclick="loadCase(${globalIndex})" style="cursor: pointer;">
                <div class="example-title">${ex.name}</div>
                <div class="example-desc">${ex.description}</div>
            </div>
        `;
    }).join('');
}

function loadCase(index) {
    currentCaseIndex = index;
    const caseData = CASES[index];
    currentLaw = caseData.law;

    // 更新定律按钮
    document.querySelectorAll('.law-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.law === currentLaw);
    });

    // 更新案例选择器
    const selector = document.getElementById('caseSelector');
    selector.innerHTML = CASES.map((c, i) =>
        `<option value="${i}" ${i === index ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    // 更新定义面板
    updateDefinitionPanel(currentLaw);

    // 更新案例列表
    updateExamplesList(currentLaw);

    // 更新价值内涵
    document.getElementById('philosophyPanel').innerHTML =
        `<p style="font-size: 0.85rem; line-height: 1.6;">${caseData.philosophy}</p>`;

    // 重置显示
    resetVerificationView();
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 定律切换
    document.querySelectorAll('.law-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const law = btn.dataset.law;
            currentLaw = law;

            updateDefinitionPanel(law);
            updateExamplesList(law);

            const firstCase = CASES.findIndex(c => c.law === law);
            if (firstCase !== -1) {
                loadCase(firstCase);
            }
        });
    });

    // 案例选择
    document.getElementById('caseSelector').addEventListener('change', (e) => {
        loadCase(parseInt(e.target.value));
    });

    // 速度控制
    document.getElementById('speed').addEventListener('input', (e) => {
        animationSpeed = 2000 - (e.target.value * 18);
    });

    // 验证按钮
    document.getElementById('verifyBtn').addEventListener('click', async () => {
        if (isAnimating) return;

        isAnimating = true;
        document.getElementById('verifyBtn').disabled = true;
        const nextBtn = document.getElementById('nextStepBtn');
        if (nextBtn) nextBtn.disabled = true;

        const caseData = CASES[currentCaseIndex];
        await verifyLaw(caseData);

        isAnimating = false;
        document.getElementById('verifyBtn').disabled = false;
        if (nextBtn) nextBtn.disabled = false;
    });

    const nextStepBtn = document.getElementById('nextStepBtn');
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', advanceManualStep);
    }

    document.getElementById('stepsList').addEventListener('click', (event) => {
        if (isAnimating) return;
        const step = event.target.closest('[data-step]');
        if (!step) return;
        renderVerificationStep(Number(step.dataset.step));
    });

    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (!isAnimating) {
            resetVerificationView();
        }
    });

    // 初始加载
    loadCase(0);
});
