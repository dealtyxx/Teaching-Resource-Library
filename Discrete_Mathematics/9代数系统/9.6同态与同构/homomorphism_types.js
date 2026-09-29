// ============================================
// 全局状态管理
// ============================================
let currentType = 'homomorphism';
let currentCaseIndex = 0;

// ============================================
// 同态类型定义
// ============================================
const HOMOMORPHISM_DEFINITIONS = {
    'homomorphism': {
        title: '同态映射 (Homomorphism)',
        content: '同态是保持代数运算的映射。若 f: ⟨A,∘⟩ → ⟨B,⊙⟩ 满足f(a∘b)=f(a)⊙f(b)，则f是同态映射。',
        formula: 'f: A → B\nf(a₁∘a₂) = f(a₁)⊙f(a₂)\n保持运算结构',
        properties: ['保持运算', '映射关系', '可以多对一', '可以不满射'],
        meaning: '形式可以不同，但运算规则一致'
    },
    'surjective': {
        title: '满同态 (Surjective Homomorphism)',
        content: '满同态是满射的同态映射。每个B中的元素都有A中的原像。',
        formula: 'f: A → B (同态)\n∀b∈B, ∃a∈A: f(a)=b\n满射 + 同态',
        properties: ['保持运算', '满射性', '覆盖目标集', 'B中无遗漏'],
        meaning: '映射覆盖所有目标，无遗漏'
    },
    'injective': {
        title: '单同态 (Injective Homomorphism)',
        content: '单同态是单射的同态映射。不同元素映射到不同元素。',
        formula: 'f: A → B (同态)\n∀a₁,a₂∈A: a₁≠a₂ → f(a₁)≠f(a₂)\n单射 + 同态',
        properties: ['保持运算', '单射性', '不同元素像不同', '可以不满射'],
        meaning: '保持区分性，不会混淆'
    },
    'endomorphism': {
        title: '自同态 (Endomorphism)',
        content: '自同态是系统到自身的同态映射。自己映射自己。',
        formula: 'f: A → A (同态)\n定义域 = 值域\n自我映射',
        properties: ['保持运算', '自映射', '内部变换', '可迭代'],
        meaning: '自我变换，内部演化'
    },
    'isomorphism': {
        title: '同构 (Isomorphism)',
        content: '同构是双射的同态映射。既单又满，两个系统的运算结构完全相同。',
        formula: 'f: A → B (同态)\n单射 + 满射 = 双射\n结构完全一致',
        properties: ['保持运算', '双射性', '可逆映射', '本质相同'],
        meaning: '本质完全相同的系统'
    },
    'automorphism': {
        title: '自同构 (Automorphism)',
        content: '自同构是系统到自身的同构映射。既是自同态又是同构。',
        formula: 'f: A → A (同构)\n自同态 ∩ 同构\n对称变换',
        properties: ['保持运算', '双射性', '自映射', '对称性'],
        meaning: '系统的对称变换'
    }
};

// ============================================
// 价值引领案例数据
// ============================================
const CASES = [
    {
        type: 'homomorphism',
        name: '理论宣讲 - 同态传播',
        domainSet: {
            name: '理论体系',
            elements: ['基本原理', '立场观点', '科学方法', '实践要求']
        },
        codomainSet: {
            name: '群众语言',
            elements: ['通俗故事', '生动比喻']
        },
        mapping: {
            '基本原理': '通俗故事',
            '立场观点': '生动比喻',
            '科学方法': '通俗故事',
            '实践要求': '生动比喻'
        },
        properties: ['保持运算', '多对一映射'],
        philosophy: '理论宣讲像一个“多对一”的同态：不同的理论要点可以用同一种通俗形式来讲，形式被压缩了，但要点之间的逻辑关系必须保住——这正是同态“保运算”的要求。“深入浅出”的分寸在于：可以简化表达，不能改变逻辑。'
    },
    {
        type: 'homomorphism',
        name: '政策落实 - 层级同态',
        domainSet: {
            name: '中央政策',
            elements: ['顶层设计', '战略规划', '重大决策', '改革方案']
        },
        codomainSet: {
            name: '地方实施',
            elements: ['具体措施', '实施细则']
        },
        mapping: {
            '顶层设计': '具体措施',
            '战略规划': '实施细则',
            '重大决策': '具体措施',
            '改革方案': '实施细则'
        },
        properties: ['保持运算', '可能简化'],
        philosophy: '中央政策到地方措施的对应可以看成同态：多项顶层部署可以落到同一类具体措施上（多对一），关键是政策之间的内在逻辑在落实中不走样。同态提醒我们：因地制宜可以变形式，不能变原则。'
    },
    {
        type: 'surjective',
        name: '全面小康 - 满同态覆盖',
        domainSet: {
            name: '扶贫措施',
            elements: ['产业扶贫', '教育扶贫', '医疗扶贫', '就业扶贫', '生态扶贫', '金融扶贫']
        },
        codomainSet: {
            name: '贫困类型',
            elements: ['因病致贫', '因学致贫', '缺乏产业', '生态恶劣']
        },
        mapping: {
            '产业扶贫': '缺乏产业',
            '教育扶贫': '因学致贫',
            '医疗扶贫': '因病致贫',
            '就业扶贫': '缺乏产业',
            '生态扶贫': '生态恶劣',
            '金融扶贫': '缺乏产业'
        },
        properties: ['保持运算', '满射性', '全覆盖'],
        philosophy: '把扶贫措施映到致贫原因：满射意味着每一类致贫原因都至少有一项措施对应，没有被遗漏的类型；多项措施对应同一类原因，体现“综合施策”。这是对“精准扶贫、一个都不能少”的结构化理解。'
    },
    {
        type: 'surjective',
        name: '民意反馈 - 满同态通达',
        domainSet: {
            name: '反馈渠道',
            elements: ['信访', '网络问政', '人大代表', '政协委员', '新闻媒体', '基层调研']
        },
        codomainSet: {
            name: '民意类型',
            elements: ['政策建议', '利益诉求', '监督批评', '信息反馈']
        },
        mapping: {
            '信访': '利益诉求',
            '网络问政': '政策建议',
            '人大代表': '利益诉求',
            '政协委员': '政策建议',
            '新闻媒体': '监督批评',
            '基层调研': '信息反馈'
        },
        properties: ['保持运算', '满射性', '畅通无阻'],
        philosophy: '把反馈渠道映到民意类型：满射意味着每一类民意都有渠道可以表达；同一类民意可以经由多条渠道汇聚（多对一），渠道冗余让表达更加畅通可靠。'
    },
    {
        type: 'injective',
        name: '干部考核 - 单同态区分',
        domainSet: {
            name: '干部表现档次',
            elements: ['表现突出', '表现良好', '表现一般', '表现较差']
        },
        codomainSet: {
            name: '考核等级',
            elements: ['特别优秀', '优秀', '合格', '基本合格', '不合格']
        },
        mapping: {
            '表现突出': '优秀',
            '表现良好': '合格',
            '表现一般': '基本合格',
            '表现较差': '不合格'
        },
        properties: ['保持运算', '单射性', '精准区分'],
        philosophy: '考核映射的单射性要求：表现不同的档次得到不同的评价，避免“干好干坏一个样”。等级集合中还有“特别优秀”无人对应，说明单射不必是满射。'
    },
    {
        type: 'injective',
        name: '法律责任 - 单同态追究',
        domainSet: {
            name: '违法行为',
            elements: ['轻微违法', '一般违法', '严重违法', '犯罪行为']
        },
        codomainSet: {
            name: '法律后果',
            elements: ['警告', '罚款', '拘留', '有期徒刑', '无期徒刑', '死刑']
        },
        mapping: {
            '轻微违法': '警告',
            '一般违法': '罚款',
            '严重违法': '拘留',
            '犯罪行为': '有期徒刑'
        },
        properties: ['保持运算', '单射性', '罪刑相当'],
        philosophy: '不同性质、不同程度的违法行为对应不同的法律后果，是“罪责刑相适应”原则的结构化表达：映射是单射，不会“异罪同罚”；它不是满射，并非每一种法律后果都在这里出现。'
    },
    {
        type: 'endomorphism',
        name: '自我革命 - 自同态演化',
        domainSet: {
            name: '党的建设',
            elements: ['政治建设', '思想建设', '组织建设', '作风建设', '纪律建设', '制度建设']
        },
        codomainSet: {
            name: '党的建设',
            elements: ['政治建设', '思想建设', '组织建设', '作风建设', '纪律建设', '制度建设']
        },
        mapping: {
            '政治建设': '政治建设',
            '思想建设': '思想建设',
            '组织建设': '组织建设',
            '作风建设': '作风建设',
            '纪律建设': '纪律建设',
            '制度建设': '制度建设'
        },
        properties: ['保持运算', '自映射', '内部演化', '可迭代'],
        philosophy: '把党的建设各方面映到自身，是一个自同态（这里取恒等映射作示意）：“刀刃向内”的自我革命不依赖外力，革新之后初心使命这一根本规则保持不变；自同态可以反复作用，对应自我革命“永远在路上”。'
    },
    {
        type: 'endomorphism',
        name: '文化传承 - 自同态赓续',
        domainSet: {
            name: '中华文化',
            elements: ['传统文化', '革命文化', '社会主义先进文化', '民族精神', '时代精神']
        },
        codomainSet: {
            name: '中华文化',
            elements: ['传统文化', '革命文化', '社会主义先进文化', '民族精神', '时代精神']
        },
        mapping: {
            '传统文化': '革命文化',
            '革命文化': '社会主义先进文化',
            '社会主义先进文化': '社会主义先进文化',
            '民族精神': '时代精神',
            '时代精神': '时代精神'
        },
        properties: ['保持运算', '自映射', '代际传承', '守正创新'],
        philosophy: '文化在代际传承中映射到自身：传统文化孕育革命文化，革命文化发展为社会主义先进文化，民族精神在新时代焕发为时代精神。映射不是单射（多种来源汇入同一形态），但始终落在中华文化自身之内，对应自同态“映到自身、保持结构”的特点，也就是“守正创新”。'
    },
    {
        type: 'isomorphism',
        name: '理论与实践 - 同构统一',
        domainSet: {
            name: '理论体系',
            elements: ['解放思想', '实事求是', '与时俱进', '求真务实']
        },
        codomainSet: {
            name: '实践体系',
            elements: ['改革开放', '调查研究', '开拓创新', '真抓实干']
        },
        mapping: {
            '解放思想': '改革开放',
            '实事求是': '调查研究',
            '与时俱进': '开拓创新',
            '求真务实': '真抓实干'
        },
        properties: ['保持运算', '双射性', '可逆', '本质相同'],
        philosophy: '“解放思想—改革开放”“实事求是—调查研究”……一一对应、可以双向转化，可作为同构的类比：理论指导实践，实践又反过来检验和丰富理论（同构可逆）。现实中二者未必处处一一对应，这里强调的是“知行合一”的理想形态。'
    },
    {
        type: 'isomorphism',
        name: '制度与治理 - 同构对应',
        domainSet: {
            name: '制度体系',
            elements: ['根本制度', '基本制度', '重要制度', '具体制度']
        },
        codomainSet: {
            name: '治理体系',
            elements: ['战略治理', '系统治理', '专项治理', '日常治理']
        },
        mapping: {
            '根本制度': '战略治理',
            '基本制度': '系统治理',
            '重要制度': '专项治理',
            '具体制度': '日常治理'
        },
        properties: ['保持运算', '双射性', '结构一致'],
        philosophy: '制度层次（根本、基本、重要、具体）与治理层次一一对应、层级关系保持不变，可作为同构的类比：制度优势要转化为治理效能，两套结构必须对得上。'
    },
    {
        type: 'automorphism',
        name: '改革开放 - 自同构变革',
        domainSet: {
            name: '社会主义制度',
            elements: ['公有制', '按劳分配', '人民民主', '党的领导']
        },
        codomainSet: {
            name: '社会主义制度',
            elements: ['公有制', '按劳分配', '人民民主', '党的领导']
        },
        mapping: {
            '公有制': '公有制',
            '按劳分配': '按劳分配',
            '人民民主': '人民民主',
            '党的领导': '党的领导'
        },
        properties: ['保持运算', '双射', '自映射', '对称变换'],
        philosophy: '恒等映射是最简单的自同构：每个元素都映到自己。改革开放中，公有制主体地位、党的领导等根本制度保持不变，变化的是具体体制机制——“变”与“不变”的辩证统一，是在保持根本结构的前提下自我完善。'
    },
    {
        type: 'automorphism',
        name: '纹样对称 - 自同构旋转',
        domainSet: {
            name: '四方连续纹样（方位）',
            elements: ['上', '右', '下', '左']
        },
        codomainSet: {
            name: '四方连续纹样（方位）',
            elements: ['上', '右', '下', '左']
        },
        mapping: {
            '上': '右',
            '右': '下',
            '下': '左',
            '左': '上'
        },
        properties: ['保持相邻关系', '双射', '自映射', '对称变换'],
        philosophy: '把四方连续纹样旋转 90°，四个方位一一对换且相邻关系保持不变，这是纹样结构的一个非平凡自同构。一个图案的自同构越多，对称性就越高——湖湘织锦、剪纸窗花等传统纹样之美，正源于这种“变中有不变”的对称结构。'
    }
];

// ============================================
// 展示映射关系
// ============================================
function displayMapping(caseData) {
    const display = document.getElementById('mappingDisplay');
    const type = caseData.type;

    // 特殊处理自同态和自同构（定义域=值域）
    const isSelfMap = type === 'endomorphism' || type === 'automorphism';

    const images = Object.values(caseData.mapping);
    const inj = new Set(images).size === images.length;
    const surj = caseData.codomainSet.elements.every(e => images.includes(e));
    let arrowSymbol = '→';
    let arrowLabel = '同态映射f';

    if (type === 'isomorphism' || type === 'automorphism') {
        arrowSymbol = '⟷';
        arrowLabel = '同构映射f (可逆)';
    }

    display.innerHTML = `
        <h3>${caseData.name}</h3>
        <div class="mapping-visual">
            <div class="set-box">
                <div class="title">${caseData.domainSet.name} ${isSelfMap ? '(变换前)' : ''}</div>
                <div class="element-grid">
                    ${caseData.domainSet.elements.map(e =>
                        `<div class="element">${e}</div>`
                    ).join('')}
                </div>
            </div>
            <div class="arrow-container">
                <div class="arrow-symbol">${arrowSymbol}</div>
                <div class="arrow-label">${arrowLabel}</div>
            </div>
            <div class="set-box">
                <div class="title">${caseData.codomainSet.name} ${isSelfMap ? '(变换后)' : ''}</div>
                <div class="element-grid">
                    ${caseData.codomainSet.elements.map(e =>
                        `<div class="element">${e}</div>`
                    ).join('')}
                </div>
            </div>
        </div>
        <div class="mapping-pairs">
            ${Object.entries(caseData.mapping).map(([a, b]) =>
                `<span class="pair">${a} → ${b}</span>`
            ).join('')}
        </div>
        <div class="property-badges">
            <span class="badge check ${inj ? 'ok' : 'no'}">单射 ${inj ? '✓' : '✗'}</span>
            <span class="badge check ${surj ? 'ok' : 'no'}">满射 ${surj ? '✓' : '✗'}</span>
            <span class="badge check ${isSelfMap ? 'ok' : 'no'}">映到自身 ${isSelfMap ? '✓' : '✗'}</span>
            ${caseData.properties.map(prop =>
                `<span class="badge">${prop}</span>`
            ).join('')}
        </div>
        <p class="mapping-note">说明：这里的集合只是现实对象的结构类比，“保持运算”指保持对象之间的关系；单射、满射由上面的对应关系自动判定。</p>
    `;
}

// ============================================
// 展示层次关系
// ============================================
function showHierarchy() {
    const content = document.getElementById('hierarchyContent');

    content.innerHTML = `
        <div class="hierarchy-chart">
            <div class="hierarchy-level">
                <div class="icon">1</div>
                <div class="text">
                    <div class="name">同态映射 (基础)</div>
                    <div class="desc">保持运算的映射，最一般的概念</div>
                </div>
            </div>
            <div class="hierarchy-level">
                <div class="icon">2</div>
                <div class="text">
                    <div class="name">满同态 / 单同态</div>
                    <div class="desc">满同态：加满射条件 | 单同态：加单射条件</div>
                </div>
            </div>
            <div class="hierarchy-level">
                <div class="icon">3</div>
                <div class="text">
                    <div class="name">自同态 / 同构</div>
                    <div class="desc">自同态：同态+自映射 | 同构：同态+双射</div>
                </div>
            </div>
            <div class="hierarchy-level">
                <div class="icon">4</div>
                <div class="text">
                    <div class="name">自同构 (最特殊)</div>
                    <div class="desc">同时满足：自同态+同构=自映射+双射</div>
                </div>
            </div>
        </div>

        <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(255, 180, 0, 0.1); border-radius: 8px; border-left: 4px solid var(--accent-gold);">
            <div style="font-size: 0.85rem; line-height: 1.8; color: var(--text-secondary);">
                <p style="margin-bottom: 0.5rem;"><strong style="color: var(--accent-red);">包含关系：</strong></p>
                <p style="margin-bottom: 0.3rem;">• 自同构 ⊂ 同构 ⊂ 同态</p>
                <p style="margin-bottom: 0.3rem;">• 自同构 ⊂ 自同态 ⊂ 同态</p>
                <p style="margin-bottom: 0.3rem;">• 同构 ⊂ 单同态 ⊂ 同态</p>
                <p>• 同构 ⊂ 满同态 ⊂ 同态</p>
            </div>
        </div>

        <div style="margin-top: 1rem; padding: 1rem; background: linear-gradient(135deg, rgba(214, 59, 29, 0.1), rgba(255, 180, 0, 0.1)); border-radius: 8px; border: 2px solid var(--accent-red);">
            <div style="font-size: 0.85rem; line-height: 1.8; color: var(--text-secondary);">
                <p style="margin-bottom: 0.5rem;"><strong style="color: var(--accent-red);">价值启示：</strong></p>
                <p style="margin-bottom: 0.3rem;">同态→同构：从一般到特殊，从形式相似到本质相同</p>
                <p style="margin-bottom: 0.3rem;">同态→自同态：从外部变换到内部演化，自我革命</p>
                <p>自同构：映到自身且保持结构的对称变换，刻画对象的对称性</p>
            </div>
        </div>
    `;
}

// ============================================
// 更新定义面板
// ============================================
function updateDefinitionPanel(type) {
    const def = HOMOMORPHISM_DEFINITIONS[type];
    const panel = document.getElementById('definitionPanel');

    panel.innerHTML = `
        <h3>${def.title}</h3>
        <p>${def.content}</p>
        <div class="formula-box">${def.formula.replace(/\n/g, '<br>')}</div>
        <div style="margin-top: 1rem;">
            <strong style="color: var(--accent-red); font-size: 0.85rem;">关键性质：</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem;">
                ${def.properties.map(p =>
                    `<span style="background: rgba(214, 59, 29, 0.1); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; color: var(--accent-red); font-weight: 600;">${p}</span>`
                ).join('')}
            </div>
        </div>
        <p style="font-size: 0.85rem; line-height: 1.5; margin-top: 0.8rem;">
            <strong style="color: var(--accent-gold);">核心意义：</strong> ${def.meaning}
        </p>
    `;
}

// ============================================
// 更新案例列表
// ============================================
function updateCasesList(type) {
    const cases = CASES.filter(c => c.type === type);
    const list = document.getElementById('casesList');

    list.innerHTML = cases.map((c, index) => {
        const globalIndex = CASES.indexOf(c);
        return `
            <div class="case-card" onclick="loadCase(${globalIndex})">
                <div class="title">${c.name}</div>
                <div class="desc">${c.philosophy.substring(0, 60)}...</div>
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

    // 更新树形按钮
    document.querySelectorAll('.tree-node').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === currentType);
    });

    // 更新案例选择器
    const selector = document.getElementById('caseSelector');
    selector.innerHTML = CASES.map((c, i) =>
        `<option value="${i}" ${i === index ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    // 更新各个面板
    updateDefinitionPanel(currentType);
    updateCasesList(currentType);

    // 更新价值内涵
    document.getElementById('philosophyPanel').innerHTML =
        `<p style="font-size: 0.85rem; line-height: 1.6;">${caseData.philosophy}</p>`;

    // 加载即展示映射（不留空白舞台）
    displayMapping(caseData);
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 树形节点点击
    document.querySelectorAll('.tree-node').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            currentType = type;

            updateDefinitionPanel(type);
            updateCasesList(type);

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
        displayMapping(caseData);
    });

    // 层次关系按钮
    document.getElementById('hierarchyBtn').addEventListener('click', () => {
        showHierarchy();
    });

    // 初始加载
    loadCase(0);
    showHierarchy();
});
