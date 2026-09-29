// ============================================
// 全局状态管理
// ============================================
let currentType = 'finite';
let currentCaseIndex = 0;

// ============================================
// 系统类型定义
// ============================================
const TYPE_DEFINITIONS = {
    'finite': {
        title: '有限代数系统 (Finite Algebraic System)',
        content: '载体集合元素个数有限的代数系统。系统规模可控，运算表可完整列举。',
        formula: '⟨A, ∘⟩，其中 |A| = n（n 为正整数）',
        characteristics: '可枚举性、完备性、确定性',
        examples: '模运算、有限群、离散决策系统'
    },
    'infinite': {
        title: '无限代数系统 (Infinite Algebraic System)',
        content: '载体集合元素个数无限的代数系统。系统规模无界，需要用规则定义运算。',
        formula: '⟨A, ∘⟩，其中 A 为无限集',
        characteristics: '无穷性、规则性、抽象性',
        examples: '⟨N, +⟩、⟨Z, +⟩、⟨R, ·⟩'
    },
    'set': {
        title: '集合代数系统 (Set Algebraic System)',
        content: '以集合及其运算为基础的代数系统。研究集合间的并、交、补等运算。',
        formula: '⟨P(U), ∪, ∩, ∼⟩，U 为全集',
        characteristics: '包含关系、布尔性、对偶性',
        examples: '幂集、集合运算、分类管理'
    },
    'boolean': {
        title: '命题代数系统 (Propositional Algebra)',
        content: '以命题及其逻辑运算为基础的代数系统。研究命题间的与、或、非等逻辑关系。',
        formula: '⟨{T, F}, ∧, ∨, ¬⟩',
        characteristics: '二值性、逻辑性、对偶性',
        examples: '逻辑电路、决策规则、真假判断'
    }
};

// ============================================
// 案例数据
// ============================================
const CASES = [
    {
        type: 'finite',
        name: '五级岗位体系 - 有限系统',
        set: ['科员', '副科', '正科', '副处', '正处'],
        operation: '取较高职级 max',
        cardinality: 5,
        description: '五个职级在“取较高者”运算下构成有限代数系统',
        philosophy: '五个职级在“取两者中较高者”（max）运算下封闭：任意两级比较，结果仍是这五级之一，所以构成有限代数系统，运算表可以完整列出。“晋升一级”则不是这个集合上的运算——最高一级无法再晋升，结果会跑出集合。层级清楚、规则明确、边界封闭，体系才可预期、可管理。',
        structure: {
            elements: ['科员', '副科', '正科', '副处', '正处'],
            operation: 'max（取较高职级）',
            properties: ['封闭性', '可枚举', '有最大元']
        }
    },
    {
        type: 'finite',
        name: '五年规划周期 - 有限系统',
        set: ['第1年', '第2年', '第3年', '第4年', '第5年'],
        operation: '顺延（模 5 循环）',
        cardinality: 5,
        description: '一个规划期内的年份与“顺延 k 年”构成循环结构',
        philosophy: '把一个五年规划期内的年份看作 Z₅，“顺延 k 年”按模 5 循环，运算封闭、元素有限，是典型的有限代数系统。一个规划期有限、可分解、可考核；期与期首尾相接、接续推进，体现“一张蓝图绘到底”的连续性。',
        structure: {
            elements: ['第1年', '第2年', '第3年', '第4年', '第5年'],
            operation: '+ (mod 5)',
            properties: ['封闭性', '周期性', '可枚举']
        }
    },
    {
        type: 'infinite',
        name: '日积月累 - 无限系统',
        set: ['0', '1', '2', '3'],
        operation: '+',
        cardinality: Infinity,
        description: '天数集合 N 与加法：没有最后一天',
        philosophy: '天数集合 N={0,1,2,…} 在加法下封闭，但没有最大元，任何有限的运算表都列不完，只能用规则 a+b 来定义运算——这就是无限代数系统。学习与奋斗的积累也没有“最后一天”：“不积跬步，无以至千里”，靠的是持续累加的规律，而不是一次性的清单。',
        structure: {
            elements: ['0', '1', '2', '3', '…'],
            operation: '+',
            properties: ['封闭性', '无最大元', '规则定义']
        }
    },
    {
        type: 'infinite',
        name: '永不停歇的发展 - 无限系统',
        set: ['发展阶段的无限序列'],
        operation: '超越',
        cardinality: Infinity,
        description: '社会主义发展的无限进程',
        philosophy: '把发展阶段看作一个不断延伸的序列，每一阶段在前一阶段基础上继续推进，序列没有预设的终点，可类比无限代数系统：元素无法穷举，但可以用统一规则（发展规律）来刻画。它提醒我们：取得的成绩只是新的起点，既要把握规律，也要永不自满。',
        structure: {
            elements: ['初级阶段', '...', '高级阶段', '...'],
            operation: '超越',
            properties: ['永续性', '规律性', '进步性']
        }
    },
    {
        type: 'set',
        name: '统一战线 - 集合系统',
        set: 'P(各界人士)',
        operations: ['并集(团结)', '交集(共识)', '补集(差异)'],
        description: '统战工作的集合表达',
        philosophy: '把各界人士看作全集 U 的子集，“并”对应团结联合，“交”对应共同点，“补”对应尊重差异，这些运算都落在幂集 P(U) 之内，构成集合代数系统。求同存异，就是在找交集的同时承认并尊重补集——“最大公约数”越大，“同心圆”就越大。',
        structure: {
            universe: '全体中国人',
            subsets: ['工人', '农民', '知识分子', '...'],
            operations: ['∪(团结)', '∩(共识)', '′(差异)'],
            properties: ['包含性', '对偶性', '全局性']
        }
    },
    {
        type: 'set',
        name: '精准扶贫分类 - 集合系统',
        set: 'P(贫困户)',
        operations: ['分类', '合并', '退出'],
        description: '扶贫对象的集合管理',
        philosophy: '按致贫原因把对象划分为若干子集：划分要求各子集互不相交、并起来恰为全体，对应“不重不漏”；脱贫退出对应差集运算。交叉致贫的情况需要看子集的交，提醒我们分类施策时不能机械地只贴一个标签。',
        structure: {
            universe: '全体农村人口',
            subsets: ['因病致贫', '因学致贫', '因灾致贫', '...'],
            operations: ['分类', '合并', '退出'],
            properties: ['精准性', '完备性', '动态性']
        }
    },
    {
        type: 'boolean',
        name: '党性原则 - 命题系统',
        set: '{坚持党的领导, 维护核心, 执行决议, 严守纪律}',
        operations: ['∧(同时满足)', '∨(至少一项)', '¬(违反)'],
        description: '党员标准的逻辑判断',
        philosophy: '把几条基本要求看作命题 P1…P4，“合格”就是合取式 P1∧P2∧P3∧P4 为真：任何一项为假，合取式即为假。命题代数的二值性提醒我们，原则问题要讲清是非、守住底线。',
        structure: {
            propositions: ['P1: 坚持党的领导', 'P2: 维护核心', 'P3: 执行决议', 'P4: 严守纪律'],
            operations: ['∧(与)', '∨(或)', '¬(非)'],
            formula: 'P1 ∧ P2 ∧ P3 ∧ P4 = 合格党员',
            properties: ['二值性', '严格性', '明确性']
        }
    },
    {
        type: 'boolean',
        name: '依法治国判断 - 命题系统',
        set: '{合法, 合规, 合理, 合情}',
        operations: ['∧(完全符合)', '∨(部分符合)', '→(蕴含)'],
        description: '法治评价的逻辑体系',
        philosophy: '把“合法、合规、合理、合情”看作四个命题，评价就是命题代数运算：合法 ∧ 合规是底线要求，四者同时为真是理想状态。德摩根律 ¬(P1∧P2) ⇔ ¬P1∨¬P2 说明：只要有一项不满足，“合法合规”这一整体判断就不成立——法、理、情相统一，需要逐项检验而不能以偏概全。',
        structure: {
            propositions: ['P1: 合法', 'P2: 合规', 'P3: 合理', 'P4: 合情'],
            operations: ['∧', '∨', '→'],
            rules: ['P1 ∧ P2（合法合规是底线）', 'P1 ∧ P2 ∧ P3 ∧ P4（理想状态）'],
            properties: ['逻辑性', '层次性', '关联性']
        }
    }
];

// ============================================
// 系统展示
// ============================================
function displaySystem(caseData) {
    const diagram = document.getElementById('systemDiagram');
    const def = TYPE_DEFINITIONS[caseData.type];

    let cardinalityText = '';
    if (caseData.cardinality === Infinity) {
        cardinalityText = '∞ (无限)';
    } else if (typeof caseData.cardinality === 'number') {
        cardinalityText = caseData.cardinality;
    } else {
        cardinalityText = '2^|U| (幂集)';
    }

    diagram.innerHTML = `
        <h3>${caseData.name}</h3>
        <div class="system-box">
            <div class="system-formula">⟨${typeof caseData.set === 'string' ? caseData.set : caseData.set.slice(0, 3).join(', ') + ', …'}, ${caseData.operation || caseData.operations[0]}⟩</div>
            <div class="system-description">${caseData.description}</div>
            <div class="cardinality-display">
                <div class="label">系统规模 (基数)</div>
                <div class="value">${cardinalityText}</div>
            </div>
        </div>
    `;
}

// ============================================
// 系统对比
// ============================================
function compareSystemTypes() {
    const content = document.getElementById('comparisonContent');

    const comparisonData = [
        { feature: '载体规模', finite: '有限', infinite: '无限', set: '幂集', boolean: '2元' },
        { feature: '可枚举性', finite: '完全可枚举', infinite: '不可枚举', set: '子集可枚举', boolean: '完全可枚举' },
        { feature: '运算表', finite: '可列出', infinite: '用规则定义', set: '真值表', boolean: '真值表' },
        { feature: '应用场景', finite: '离散管理', infinite: '连续发展', set: '分类统计', boolean: '逻辑判断' },
        { feature: '典型例子', finite: '岗位体系', infinite: '为民服务', set: '统一战线', boolean: '党性原则' }
    ];

    let html = '<table class="comparison-table">';
    html += '<tr><th>特征</th><th>有限系统</th><th>无限系统</th><th>集合系统</th><th>命题系统</th></tr>';

    comparisonData.forEach(row => {
        html += `<tr>
            <td><strong>${row.feature}</strong></td>
            <td${currentType === 'finite' ? ' class="highlight"' : ''}>${row.finite}</td>
            <td${currentType === 'infinite' ? ' class="highlight"' : ''}>${row.infinite}</td>
            <td${currentType === 'set' ? ' class="highlight"' : ''}>${row.set}</td>
            <td${currentType === 'boolean' ? ' class="highlight"' : ''}>${row.boolean}</td>
        </tr>`;
    });

    html += '</table>';
    content.innerHTML = html;
}

// ============================================
// 更新定义面板
// ============================================
function updateDefinitionPanel(type) {
    const def = TYPE_DEFINITIONS[type];
    const panel = document.getElementById('definitionPanel');

    panel.innerHTML = `
        <h3>${def.title}</h3>
        <p>${def.content}</p>
        <div class="formula-box">${def.formula}</div>
        <p style="font-size: 0.85rem; line-height: 1.5;">
            <strong style="color: var(--accent-gold);">关键特征:</strong> ${def.characteristics}
        </p>
        <p style="font-size: 0.8rem; color: var(--text-secondary);">
            <strong>数学例子:</strong> ${def.examples}
        </p>
    `;
}

// ============================================
// 更新案例列表
// ============================================
function updateExamplesList(type) {
    const examples = CASES.filter(c => c.type === type);
    const list = document.getElementById('examplesList');

    list.innerHTML = examples.map((ex, index) => {
        const globalIndex = CASES.indexOf(ex);
        return `
            <div class="example-card" onclick="loadCase(${globalIndex})">
                <div class="title">${ex.name}</div>
                <div class="desc">${ex.description}</div>
            </div>
        `;
    }).join('');
}

// ============================================
// 加载案例
// ============================================
function loadCase(index) {
    currentCaseIndex = index;
    const caseData = CASES[index];
    currentType = caseData.type;

    // 更新类型按钮
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === currentType);
    });

    // 更新案例选择器
    const selector = document.getElementById('caseSelector');
    selector.innerHTML = CASES.map((c, i) =>
        `<option value="${i}" ${i === index ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    // 更新各个面板
    updateDefinitionPanel(currentType);
    updateExamplesList(currentType);
    displaySystem(caseData);

    // 更新价值内涵
    document.getElementById('philosophyPanel').innerHTML =
        `<p style="font-size: 0.85rem; line-height: 1.6;">${caseData.philosophy}</p>`;

    // 清空对比区
    document.getElementById('comparisonContent').innerHTML =
        '<p style="color: var(--text-secondary); font-size: 0.85rem;">点击"系统对比"查看</p>';
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 类型切换
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            currentType = type;

            updateDefinitionPanel(type);
            updateExamplesList(type);

            const firstCase = CASES.findIndex(c => c.type === type);
            if (firstCase !== -1) {
                loadCase(firstCase);
            }
        });
    });

    // 案例选择
    document.getElementById('caseSelector').addEventListener('change', (e) => {
        loadCase(parseInt(e.target.value));
    });

    // 展示按钮
    document.getElementById('showBtn').addEventListener('click', () => {
        const caseData = CASES[currentCaseIndex];
        displaySystem(caseData);
    });

    // 对比按钮
    document.getElementById('compareBtn').addEventListener('click', () => {
        compareSystemTypes();
    });

    // 初始加载
    loadCase(0);
});
