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
        formula: '<A, ∘>, 其中 |A| = n (n为有限数)',
        characteristics: '可枚举性、完备性、确定性',
        examples: '模运算、有限群、离散决策系统'
    },
    'infinite': {
        title: '无限代数系统 (Infinite Algebraic System)',
        content: '载体集合元素个数无限的代数系统。系统规模无界，需要用规则定义运算。',
        formula: '<A, ∘>, 其中 |A| = ∞',
        characteristics: '无穷性、规则性、抽象性',
        examples: '整数加法、实数乘法、连续发展过程'
    },
    'set': {
        title: '集合代数系统 (Set Algebraic System)',
        content: '以集合及其运算为基础的代数系统。研究集合间的并、交、补等运算。',
        formula: '<P(U), ∪, ∩, ′>, U为全集',
        characteristics: '包含关系、布尔性、对偶性',
        examples: '幂集、集合运算、分类管理'
    },
    'boolean': {
        title: '命题代数系统 (Boolean Algebraic System)',
        content: '以命题及其逻辑运算为基础的代数系统。研究命题间的与、或、非等逻辑关系。',
        formula: '<{T, F}, ∧, ∨, ¬>',
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
        operation: '晋升',
        cardinality: 5,
        description: '公务员职级晋升系统',
        philosophy: '有限代数系统体现了"层级管理"的组织原则。五级岗位体系形成有限集合，每个级别都有明确定义。有限性保证了系统的可控性——不会无限晋升，避免官僚主义膨胀。系统的完备性体现了"能上能下"——每个岗位都有晋升和降级规则。这是辩证法中"质量互变"的体现:通过有限的质变(晋升)实现能力的量变积累。有限系统的封闭性对应"干部队伍建设"——从内部选拔，形成梯队。毛泽东说"又红又专"，有限系统确保了专业化和规范化的统一。',
        structure: {
            elements: ['科员', '副科', '正科', '副处', '正处'],
            operation: '晋升',
            properties: ['封闭性', '可枚举', '层级性']
        }
    },
    {
        type: 'finite',
        name: '五年计划周期 - 有限系统',
        set: ['一五', '二五', '三五', '四五', '五五', '...', '十四五'],
        operation: '递进',
        cardinality: 14,
        description: '国家发展规划的周期系统',
        philosophy: '五年计划是有限代数系统在宏观管理中的应用。每个五年是一个元素，"递进"是运算。有限性体现了"阶段论"——发展不是一蹴而就，要分阶段推进。系统的可枚举性对应"规划的具体性"——每个五年都有明确目标。习近平总书记强调"一张蓝图绘到底"，有限系统的结构化正是这种连续性的保证。虽然整体是无限的(可以有无限多个五年)，但每个当下是有限的(聚焦当前五年)。这是"战略定力"的数学基础——在有限中把握无限。',
        structure: {
            elements: ['一五', '二五', '三五', '...'],
            operation: '递进',
            properties: ['周期性', '连续性', '目标性']
        }
    },
    {
        type: 'infinite',
        name: '全心全意为人民服务 - 无限系统',
        set: ['14亿人民'],
        operation: '服务',
        cardinality: Infinity,
        description: '服务对象的无限广度',
        philosophy: '无限代数系统体现了"人民性"的无限广度。14亿人民构成无限大的集合(个体需求无穷多样)，"服务"是运算。无限性意味着服务永无止境——不能说"人民够多了"。系统的开放性对应"以人民为中心"——始终有新的人民需求产生。毛泽东说"为人民服务"，这个"人民"是无限集合，不是有限样本。无限系统的抽象性要求用"原则"而非"清单"来定义服务——不可能列举所有服务内容，只能遵循"人民至上"原则。这是共产党先进性的体现——面向无限的服务对象。',
        structure: {
            elements: ['人民1', '人民2', '...', '人民n', '...'],
            operation: '服务',
            properties: ['无穷性', '开放性', '普遍性']
        }
    },
    {
        type: 'infinite',
        name: '永不停歇的发展 - 无限系统',
        set: ['发展阶段的无限序列'],
        operation: '超越',
        cardinality: Infinity,
        description: '社会主义发展的无限进程',
        philosophy: '社会主义发展是无限代数系统。发展阶段形成无限序列，每个阶段"超越"上一个阶段。无限性体现了"永续发展"——社会主义没有终点。邓小平说"发展是硬道理"，这个"发展"是无限过程，不能满足于任何既有成就。无限系统的规则性对应"发展规律"——虽然具体内容无限，但遵循共同规律(如生产力发展规律)。这是历史唯物主义的数学表达:社会形态的演进是无限的，但有规律可循。无限系统警示"骄傲自满"——永远有更高阶段等待超越。',
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
        philosophy: '统一战线是集合代数系统的政治应用。各界人士形成全集U，统战工作就是集合运算。"并集"是团结——把各个集合联合起来；"交集"是求同存异——找共识；"补集"是照顾差异——尊重特殊性。集合系统的包含关系对应"大团结大联合"——小集合被大集合包含，最终都包含于"中华民族"这个全集。习近平总书记强调"最大公约数"，集合的"交集"正是这个"公约数"。集合系统的对偶性启示我们:既要看"并"(团结面)，也要看"交"(共识面)，两者对偶互补。',
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
        philosophy: '精准扶贫是集合代数系统在社会治理中的典范。贫困户形成集合，按致贫原因分成子集(因病、因学、因灾...)。集合的"分割"对应"精准识别"——不重不漏；"并集"对应"整体推进"——所有子集的并是全体贫困户；"差集"对应"动态管理"——脱贫户从贫困集合中移除。习近平总书记强调"精准扶贫、精准脱贫"，"精准"的数学含义就是集合的精确划分。集合系统的幂集思想启示我们:要考虑所有可能的子集组合(交叉致贫因素)，确保"应扶尽扶"。',
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
        philosophy: '党性原则是命题代数系统。每个原则是一个命题(真/假)，党员资格是这些命题的逻辑运算结果。"∧"表示所有原则都要满足——党的领导∧维护核心∧执行决议∧严守纪律，全为真才合格。命题系统的二值性体现了"原则问题不能含糊"——要么坚持，要么违反，没有中间地带。"¬"运算对应"违纪违规"——任何一项的否定都导致不合格。这是"底线思维"的逻辑表达。命题系统的逻辑性保证了标准的明确性——不能模棱两可。习近平总书记强调"旗帜鲜明讲政治"，二值逻辑正是这种"鲜明"的数学基础。',
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
        philosophy: '依法治国是命题代数系统在法治中的应用。行为的合法性是命题(真/假)，法治评价是逻辑运算。"合法∧合规∧合理∧合情"是最高标准(全真)；"合法∨合理"是基本要求(至少一真)。命题系统的蕴含关系"→"体现了法律逻辑:合法→合理(合法必然合理)。这是"法理相通"的体现。命题系统的对偶律启示我们:¬(合法∧合规)=¬合法∨¬合规——只要有一项违法，整体就违法。这是"木桶原理"的逻辑版。命题系统的真值表对应"案例库"——列举各种情况的真假判断，指导司法实践。',
        structure: {
            propositions: ['P1: 合法', 'P2: 合规', 'P3: 合理', 'P4: 合情'],
            operations: ['∧', '∨', '→'],
            rules: ['P1 → P3 (合法必然合理)', 'P1 ∧ P2 ∧ P3 ∧ P4 (理想状态)'],
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
            <div class="system-formula">&lt;${typeof caseData.set === 'string' ? caseData.set : caseData.set.slice(0, 3).join(', ') + '...'}, ${caseData.operation || caseData.operations[0]}&gt;</div>
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

    // 更新思政内涵
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
