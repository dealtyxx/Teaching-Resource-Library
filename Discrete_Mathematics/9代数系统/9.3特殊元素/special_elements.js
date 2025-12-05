// ============================================
// 全局状态管理
// ============================================
let currentElement = 'idempotent';
let currentCaseIndex = 0;
let animationSpeed = 1000;
let isAnimating = false;

// ============================================
// 元素定义数据
// ============================================
const ELEMENT_DEFINITIONS = {
    'idempotent': {
        title: '幂等元 (Idempotent Element)',
        content: '幂等元是指与自身运算的结果仍为自身的元素，体现了稳定性和不变性。',
        formula: 'a ∘ a = a',
        meaning: '重复操作不改变状态，达到稳定平衡',
        symbol: 'e',
        examples: '开关(重复按)、集合并(A∪A=A)、逻辑或(p∨p=p)'
    },
    'identity': {
        title: '单位元 (Identity Element)',
        content: '单位元是运算的"中性元素"，任何元素与它运算都保持不变，是运算的基准点。',
        formula: 'e ∘ a = a ∘ e = a, ∀a∈A',
        meaning: '不改变其他元素，是系统的基准和起点',
        symbol: 'e',
        examples: '加法的0、乘法的1、集合并的空集'
    },
    'zero': {
        title: '零元 (Zero Element)',
        content: '零元是运算的"吸收元素"，任何元素与它运算都变成零元，具有强制性。',
        formula: 'θ ∘ a = a ∘ θ = θ, ∀a∈A',
        meaning: '吸收所有元素，使结果归零',
        symbol: 'θ',
        examples: '乘法的0、集合交的空集、逻辑与的假'
    },
    'inverse': {
        title: '逆元 (Inverse Element)',
        content: '逆元是使运算结果回到单位元的"对称元素"，体现了可逆性和互补性。',
        formula: 'a ∘ a⁻¹ = a⁻¹ ∘ a = e',
        meaning: '相互抵消，回归基准状态',
        symbol: 'a⁻¹',
        examples: '加法的相反数、乘法的倒数、逻辑的非'
    }
};

// ============================================
// 案例数据
// ============================================
const CASES = [
    {
        element: 'idempotent',
        name: '制度稳定性 - 幂等元',
        symbol: '制度',
        set: ['党的领导', '人民代表大会', '多党合作', '民族区域自治'],
        operation: '∪',
        idempotentElements: ['党的领导', '人民代表大会'],
        description: '根本制度的稳定性',
        philosophy: '幂等元体现了"制度稳定性"。党的领导制度∪党的领导制度=党的领导制度，无论重复强调多少次，制度本质不变。这是"四个自信"中"制度自信"的数学基础——制度经得起反复实践检验，满足幂等律。邓小平说"稳定压倒一切"，幂等元正是"稳定性"的形式化表达。制度建设不能朝令夕改，要保持定力。幂等元告诉我们:好的制度应该是"重复使用不耗损"的——每次运用都强化而非改变。这是历史唯物主义的制度观。',
        demonstrations: [
            { expr: '党的领导 ∪ 党的领导', result: '党的领导', desc: '根本制度的稳定性' },
            { expr: '人民代表大会 ∪ 人民代表大会', result: '人民代表大会', desc: '根本政治制度的确定性' },
            { expr: '多党合作 ∪ 党的领导', result: '党的领导', desc: '其他制度服从根本制度' }
        ]
    },
    {
        element: 'idempotent',
        name: '真理的反复检验 - 幂等元',
        symbol: '真理',
        set: ['实事求是', '教条主义', '经验主义', '实用主义'],
        operation: '∩',
        idempotentElements: ['实事求是'],
        description: '真理的客观性',
        philosophy: '实事求是∩实事求是=实事求是。幂等律证明了真理的客观性——真理不因反复检验而改变。"实践是检验真理的唯一标准"，多次实践(∩操作)不改变真理本身。这是马克思主义认识论的核心。教条主义不满足幂等律——一检验就露馅；经验主义也不满足——只在特定条件下成立。只有"实事求是"满足幂等律，所以能成为思想路线。毛泽东说"真理只有一个"，幂等元的唯一性正是这句话的数学证明。',
        demonstrations: [
            { expr: '实事求是 ∩ 实事求是', result: '实事求是', desc: '真理经得起反复检验' },
            { expr: '教条主义 ∩ 实践', result: '失败', desc: '教条不是幂等元' },
            { expr: '实事求是 ∩ 实践', result: '实事求是', desc: '实践验证真理' }
        ]
    },
    {
        element: 'identity',
        name: '人民主体地位 - 单位元',
        symbol: 'e',
        set: ['人民', '政策A', '政策B', '政策C'],
        operation: '服务',
        identityElement: '人民',
        description: '人民是一切工作的出发点',
        philosophy: '单位元体现了"人民中心论"。在"为人民服务"这个运算中，"人民"是单位元:政策A服务人民=政策A(政策本质不变)，人民服务人民=人民(人民地位不变)。单位元的特性——"不改变其他元素"——正是人民的主体地位:一切工作围绕人民，但人民自身不因工作而改变其主体性。习近平总书记说"人民是历史的创造者"，单位元的基准性正是这种"创造者"地位的体现。单位元的唯一性保证了人民中心论的排他性——不能有第二个"中心"。',
        demonstrations: [
            { expr: '政策A 服务 人民', result: '政策A', desc: '政策为人民服务不改变政策本质' },
            { expr: '人民 服务 政策B', result: '政策B', desc: '人民是所有政策的出发点' },
            { expr: '人民 服务 人民', result: '人民', desc: '人民主体地位不变' }
        ]
    },
    {
        element: 'identity',
        name: '实事求是基准 - 单位元',
        symbol: 'e',
        set: ['实事求是', '左倾', '右倾', '中间路线'],
        operation: '矫正',
        identityElement: '实事求是',
        description: '实事求是是检验的基准',
        philosophy: '实事求是是"矫正"运算的单位元。左倾经实事求是矫正=左倾暴露问题；实事求是经实事求是矫正=实事求是(基准不变)。单位元的"不变性"体现了实事求是的基准地位——它是衡量一切路线正确与否的标准。邓小平的改革开放，就是用"实事求是"这个单位元来矫正"两个凡是"。单位元的唯一性保证了标准的统一性——不能有多个"真理标准"。这是辩证唯物主义方法论的数学表达。',
        demonstrations: [
            { expr: '左倾 矫正 实事求是', result: '左倾', desc: '暴露左倾错误' },
            { expr: '实事求是 矫正 右倾', result: '右倾', desc: '揭示右倾问题' },
            { expr: '实事求是 矫正 实事求是', result: '实事求是', desc: '基准自身不需矫正' }
        ]
    },
    {
        element: 'zero',
        name: '一票否决制 - 零元',
        symbol: 'θ',
        set: ['优秀', '良好', '合格', '不合格'],
        operation: '∧',
        zeroElement: '不合格',
        description: '底线思维的数学表达',
        philosophy: '零元体现了"底线思维"。在考核中，任何成绩∧不合格=不合格。零元的"吸收性"正是"一票否决"的数学基础——某项关键指标不合格，全盘否定。这看似严苛，实则必要:安全生产、党风廉政、环境保护等领域的"一票否决"，防止了"木桶效应"——短板太短，整个木桶失效。零元的存在是对"唯结果论"的纠正——过程中的重大失误(零元)会使结果无效。习近平总书记强调"守住底线"，零元就是这条不可触碰的"底线"。',
        demonstrations: [
            { expr: '优秀 ∧ 不合格', result: '不合格', desc: '一票否决全盘' },
            { expr: '良好 ∧ 不合格', result: '不合格', desc: '零元吸收所有成绩' },
            { expr: '不合格 ∧ 优秀', result: '不合格', desc: '底线不可逾越' }
        ]
    },
    {
        element: 'zero',
        name: '腐败的破坏性 - 零元',
        symbol: 'θ',
        set: ['政绩', '口碑', '能力', '腐败'],
        operation: '×',
        zeroElement: '腐败',
        description: '腐败归零一切成就',
        philosophy: '腐败是"乘法运算"中的零元。再大的政绩×腐败=腐败(一切归零)，能力×腐败=腐败(能力失效)。零元的毁灭性体现了"腐败猛于虎"——它使一切功绩化为泡影。这是对"功大于过论"的数学反驳:在道德评价的乘法系统中，腐败是零元，任何"功"乘以零都归零。王岐山说"不能让好干部带着污点退休"，就是要避免"×腐败"这个零元操作。零元警示我们:某些错误(如腐败)不是"减分项"而是"归零项"，性质完全不同。',
        demonstrations: [
            { expr: '政绩 × 腐败', result: '腐败', desc: '政绩因腐败归零' },
            { expr: '口碑 × 腐败', result: '腐败', desc: '口碑毁于腐败' },
            { expr: '能力 × 腐败', result: '腐败', desc: '能力为腐败所用' }
        ]
    },
    {
        element: 'inverse',
        name: '批评与自我批评 - 逆元',
        symbol: 'a⁻¹',
        set: ['骄傲', '自满', '懈怠', '脱离群众'],
        operation: '+',
        identityElement: '实事求是',
        inverses: [
            { element: '骄傲', inverse: '批评', result: '实事求是' },
            { element: '自满', inverse: '自我批评', result: '实事求是' },
            { element: '懈怠', inverse: '自我革命', result: '实事求是' }
        ],
        description: '自我革命的数学机制',
        philosophy: '逆元体现了"自我革命"。骄傲+批评=实事求是(回归基准)，自满+自我批评=实事求是(纠正偏差)。逆元的"相消性"正是"批评与自我批评"的作用机制——用批评抵消错误，回到正确轨道。毛泽东说"有则改之，无则加勉"，逆元就是这个"改之"的操作。逆元的存在性保证了"可纠错性"——每个错误都有对应的批评(逆元)来消除。这是党的自我净化、自我完善能力的数学基础。无逆元的错误(如叛党)无法通过批评纠正，只能开除。',
        demonstrations: [
            { expr: '骄傲 + 批评', result: '实事求是', desc: '批评消除骄傲' },
            { expr: '自满 + 自我批评', result: '实事求是', desc: '自我批评克服自满' },
            { expr: '懈怠 + 自我革命', result: '实事求是', desc: '革命精神战胜懈怠' }
        ]
    },
    {
        element: 'inverse',
        name: '改革与守成 - 逆元',
        symbol: 'a⁻¹',
        set: ['保守', '激进', '平衡'],
        operation: '综合',
        identityElement: '平衡',
        inverses: [
            { element: '保守', inverse: '改革', result: '平衡' },
            { element: '激进', inverse: '稳健', result: '平衡' }
        ],
        description: '改革与稳定的辩证关系',
        philosophy: '逆元揭示了"改革与稳定"的辩证法。保守综合改革=平衡(中道)，激进综合稳健=平衡(适度)。逆元的互补性体现了"对立统一"——改革是保守的逆元，稳健是激进的逆元。邓小平的"摸着石头过河"，就是在保守与激进之间寻找平衡(单位元)。逆元的对称性说明:既要反保守(用改革作为逆元)，也要防激进(用稳健作为逆元)。这是"两点论与重点论"的统一。逆元的可逆性保证了政策的灵活性——既能"放"(改革)也能"收"(稳健)。',
        demonstrations: [
            { expr: '保守 综合 改革', result: '平衡', desc: '改革打破保守' },
            { expr: '激进 综合 稳健', result: '平衡', desc: '稳健遏制激进' },
            { expr: '平衡 综合 平衡', result: '平衡', desc: '平衡即为最优' }
        ]
    }
];

// ============================================
// 元素演示
// ============================================
async function demonstrateElement(caseData) {
    const demoList = document.getElementById('demoList');
    demoList.innerHTML = '';

    for (let i = 0; i < caseData.demonstrations.length; i++) {
        const demo = caseData.demonstrations[i];

        const demoDiv = document.createElement('div');
        demoDiv.className = 'demo-item active';
        demoDiv.innerHTML = `
            <div class="demo-expression">${demo.expr}</div>
            <div class="demo-result">= ${demo.result}</div>
            <div class="demo-result" style="margin-top: 0.3rem; color: var(--accent-gold);">
                ${demo.desc}
            </div>
        `;
        demoList.appendChild(demoDiv);

        await sleep(animationSpeed);
        demoDiv.classList.remove('active');
    }
}

// ============================================
// 更新元素显示
// ============================================
function updateElementDisplay(caseData) {
    const display = document.getElementById('elementDisplay');
    const def = ELEMENT_DEFINITIONS[caseData.element];

    let elementSymbol = '';
    if (caseData.element === 'idempotent') {
        elementSymbol = caseData.idempotentElements ? caseData.idempotentElements[0].substring(0, 2) : caseData.symbol;
    } else if (caseData.element === 'identity') {
        elementSymbol = caseData.identityElement ? caseData.identityElement.substring(0, 2) : def.symbol;
    } else if (caseData.element === 'zero') {
        elementSymbol = caseData.zeroElement ? caseData.zeroElement.substring(0, 2) : def.symbol;
    } else if (caseData.element === 'inverse') {
        elementSymbol = 'a⁻¹';
    }

    display.innerHTML = `
        <h3>${caseData.name}</h3>
        <div class="element-circle">${elementSymbol}</div>
        <div class="element-description">
            <strong style="color: var(--accent-red);">${def.title.split('(')[0]}</strong>
            <br>${caseData.description}
        </div>
    `;
}

// ============================================
// 更新定义面板
// ============================================
function updateDefinitionPanel(element) {
    const def = ELEMENT_DEFINITIONS[element];
    const panel = document.getElementById('definitionPanel');

    panel.innerHTML = `
        <h3>${def.title}</h3>
        <p>${def.content}</p>
        <div class="formula-box">${def.formula}</div>
        <p style="font-size: 0.85rem; line-height: 1.5;">
            <strong style="color: var(--accent-gold);">意义:</strong> ${def.meaning}
        </p>
        <p style="font-size: 0.8rem; color: var(--text-secondary);">
            <strong>数学例子:</strong> ${def.examples}
        </p>
    `;
}

// ============================================
// 更新性质列表
// ============================================
function updatePropertiesList(element) {
    const properties = {
        'idempotent': [
            { icon: '∞', text: '稳定性: 重复操作不改变状态' },
            { icon: '=', text: '自等性: 元素与自身运算等于自身' },
            { icon: '⚖', text: '平衡性: 达到稳定平衡点' },
            { icon: '🔒', text: '锁定性: 状态锁定不再变化' }
        ],
        'identity': [
            { icon: 'e', text: '中性: 不改变其他元素' },
            { icon: '0', text: '基准: 运算的起点和参照' },
            { icon: '1', text: '唯一: 单位元唯一存在' },
            { icon: '↔', text: '对称: 左右单位元相同' }
        ],
        'zero': [
            { icon: 'θ', text: '吸收性: 吸收所有元素' },
            { icon: '⚠', text: '毁灭性: 使结果归零' },
            { icon: '🚫', text: '终结性: 运算终止于零元' },
            { icon: '⚖', text: '唯一性: 零元唯一存在' }
        ],
        'inverse': [
            { icon: '↔', text: '互补性: 元素成对互为逆元' },
            { icon: '=e', text: '消解性: 运算回到单位元' },
            { icon: '⟲', text: '可逆性: 操作可以撤销' },
            { icon: '±', text: '对称性: 正负相抵' }
        ]
    };

    const list = document.getElementById('propertiesList');
    const props = properties[element] || [];

    list.innerHTML = props.map(prop => `
        <div class="property-item">
            <div class="icon">${prop.icon}</div>
            <div class="text">${prop.text}</div>
        </div>
    `).join('');
}

// ============================================
// 加载案例
// ============================================
function loadCase(index) {
    currentCaseIndex = index;
    const caseData = CASES[index];
    currentElement = caseData.element;

    // 更新元素按钮
    document.querySelectorAll('.element-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.element === currentElement);
    });

    // 更新案例选择器
    const selector = document.getElementById('caseSelector');
    selector.innerHTML = CASES.map((c, i) =>
        `<option value="${i}" ${i === index ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    // 更新各个面板
    updateDefinitionPanel(currentElement);
    updatePropertiesList(currentElement);
    updateElementDisplay(caseData);

    // 更新思政内涵
    document.getElementById('philosophyPanel').innerHTML =
        `<p style="font-size: 0.85rem; line-height: 1.6;">${caseData.philosophy}</p>`;

    // 清空演示区
    document.getElementById('demoList').innerHTML =
        '<p style="color: var(--text-secondary); font-size: 0.85rem;">点击"演示运算"开始</p>';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 元素类型切换
    document.querySelectorAll('.element-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const element = btn.dataset.element;
            currentElement = element;

            updateDefinitionPanel(element);
            updatePropertiesList(element);

            const firstCase = CASES.findIndex(c => c.element === element);
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

    // 演示按钮
    document.getElementById('demoBtn').addEventListener('click', async () => {
        if (isAnimating) return;

        isAnimating = true;
        document.getElementById('demoBtn').disabled = true;

        const caseData = CASES[currentCaseIndex];
        await demonstrateElement(caseData);

        isAnimating = false;
        document.getElementById('demoBtn').disabled = false;
    });

    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (!isAnimating) {
            document.getElementById('demoList').innerHTML =
                '<p style="color: var(--text-secondary); font-size: 0.85rem;">点击"演示运算"开始</p>';
        }
    });

    // 初始加载
    loadCase(0);
});
