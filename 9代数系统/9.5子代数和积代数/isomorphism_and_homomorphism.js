// ============================================
// 全局状态管理
// ============================================
let currentConcept = 'isomorphic';
let currentCaseIndex = 0;

// ============================================
// 概念定义
// ============================================
const CONCEPT_DEFINITIONS = {
    'isomorphic': {
        title: '同类型和同种代数系统',
        content: '同类型代数系统指运算个数和元数相同的系统。同构(同种)指存在双射映射保持运算结构，本质相同。',
        formula: '同类型: 运算数相同\n同构(同种): ∃双射f, f(a∘b) = f(a)⊙f(b)',
        meaning: '形式相同是同类型，本质相同是同构'
    },
    'subsystem': {
        title: '子代数系统',
        content: '子系统的载体是原系统载体的非空子集，且对原系统的所有运算封闭。',
        formula: 'B⊆A (B≠∅)\n对∀b₁,b₂∈B, b₁∘b₂∈B (封闭性)',
        meaning: '继承父系统结构，自成完整体系'
    },
    'product': {
        title: '积代数系统',
        content: '多个代数系统的笛卡尔积构成新系统，运算按分量逐个进行。',
        formula: '<A₁×A₂, ∘>\n(a₁,a₂)∘(b₁,b₂) = (a₁∘₁b₁, a₂∘₂b₂)',
        meaning: '组合多个系统，协同运算'
    },
    'multisort': {
        title: '多类型代数系统',
        content: '载体包含多种类型的元素，运算可以跨越不同类型。',
        formula: '<A₁∪A₂∪...∪Aₙ, ∘₁, ∘₂, ...>',
        meaning: '多元异构，类型协同'
    }
};

// ============================================
// 案例数据
// ============================================
const CASES = [
    {
        concept: 'isomorphic',
        name: '中央与地方治理 - 同构系统',
        system1: {
            name: '中央层面',
            elements: ['重大决策', '统筹协调', '督查问责']
        },
        system2: {
            name: '地方层面',
            elements: ['具体规划', '组织实施', '自查整改']
        },
        mapping: {
            '重大决策': '具体规划',
            '统筹协调': '组织实施',
            '督查问责': '自查整改'
        },
        philosophy: '同构体现了"上下同欲者胜"的治理智慧。中央与地方虽然层级不同，但治理结构是同构的——都有决策-执行-监督三环节。同构映射f(重大决策)=具体规划，保持了治理逻辑的一致性。这是"中央统一领导、地方分级负责"的数学基础。同构的本质相同性确保了政令畅通:中央的运算规则在地方同构复现。习近平总书记强调"层层传导压力"，同构映射就是这种"传导"的数学机制——不走样、不变形。'
    },
    {
        concept: 'isomorphic',
        name: '理论与实践 - 同构关系',
        system1: {
            name: '理论体系',
            elements: ['基本原理', '重要论述', '实践指南']
        },
        system2: {
            name: '实践体系',
            elements: ['总体布局', '战略举措', '工作方法']
        },
        mapping: {
            '基本原理': '总体布局',
            '重要论述': '战略举措',
            '实践指南': '工作方法'
        },
        philosophy: '理论与实践的同构体现了"知行合一"。马克思主义理论系统与中国特色社会主义实践系统是同构的——理论有多深刻，实践就有多丰富。同构保证了"理论联系实际":基本原理→总体布局，这个映射保持运算(推导→落实)。毛泽东说"实践、认识、再实践、再认识"，正是在理论-实践两个同构系统间往返。同构的双射性说明:每个理论对应唯一实践，每个实践对应唯一理论。这是"实事求是"的数学保证。'
    },
    {
        concept: 'subsystem',
        name: '党员群体 - 人民的子系统',
        parent: {
            name: '全体人民',
            elements: ['群众甲', '群众乙', '党员丙', '党员丁', '群众戊']
        },
        child: {
            name: '党员队伍',
            elements: ['党员丙', '党员丁']
        },
        philosophy: '子代数系统体现了"先锋队"的数学本质。党员⊆人民，但党员对"为人民服务"这个运算封闭——党员服务党员=党员（不脱离队伍）。子系统不是分裂，而是核心。列宁说"党是工人阶级先锋队"，子系统的封闭性保证了先进性：党内运算不产生非党员。子系统的非空性保证了"党的领导不能削弱"。子系统继承父系统性质：党员有人民的一切权利，但承担更多义务。这是"从群众中来，到群众中去"的数学结构——子集中提炼，再作用于全集。'
    },
    {
        concept: 'subsystem',
        name: '核心价值观 - 文化的子系统',
        parent: {
            name: '中华文化',
            elements: ['传统文化', '革命文化', '社会主义先进文化', '核心价值观']
        },
        child: {
            name: '核心价值观',
            elements: ['富强民主', '文明和谐', '自由平等', '公正法治', '爱国敬业', '诚信友善']
        },
        philosophy: '核心价值观是中华文化的子系统。它是从5000年文化中提炼的精华，对"文化传承"运算封闭——核心价值观指导下的创作仍符合核心价值观。子系统的封闭性保证了"守正创新":在核心价值观框架内创新，不会偏离方向。习近平总书记强调"培育和践行社会主义核心价值观"，子系统的完备性说明这24个字足以指导一切文化活动。子系统小于父系统，但包含父系统精髓——这是"浓缩的都是精华"的数学证明。'
    },
    {
        concept: 'product',
        name: '党政军民学 - 积代数系统',
        systems: [
            {name: '党', elements: ['政治领导', '思想领导', '组织领导']},
            {name: '政', elements: ['行政管理', '公共服务', '社会治理']},
            {name: '军', elements: ['国防建设', '军队建设', '战备训练']},
            {name: '民', elements: ['经济发展', '民生改善', '社会建设']},
            {name: '学', elements: ['教育培养', '科研创新', '文化传承']}
        ],
        productOperation: '协同运作',
        philosophy: '积代数系统体现了"五位一体"总体布局。党×政×军×民×学的笛卡尔积形成完整治理系统，每个"积元"(党的某方面, 政的某方面, ...)代表一种协同方式。积系统的分量运算保证了各系统既独立又协同：(党的领导, 政府执行)这个积元，运算是"领导+执行"。习近平总书记说"党政军民学，东西南北中，党是领导一切的"，积系统的第一分量(党)具有主导作用。积系统的笛卡尔积本质说明：只有党政军民学全面协同，才能实现治理现代化。'
    },
    {
        concept: 'product',
        name: '经济×社会×生态 - 三位一体积',
        systems: [
            {name: '经济系统', elements: ['生产', '分配', '消费']},
            {name: '社会系统', elements: ['公平', '正义', '福利']},
            {name: '生态系统', elements: ['保护', '修复', '利用']}
        ],
        productOperation: '可持续发展',
        philosophy: '经济×社会×生态的积系统体现了"绿水青山就是金山银山"。积元(生产方式, 分配制度, 环境保护)代表一种发展模式。积系统的协同运算：经济增长∘社会公平∘生态保护 = 可持续发展。积系统警示"顾此失彼"：只发展经济(积的一个分量)，忽略社会和生态(其他分量)，整个积系统失衡。习近平生态文明思想正是要求"三个分量协同优化"。积系统的结构性说明：可持续发展不是单一目标，而是多维度的积。'
    },
    {
        concept: 'multisort',
        name: '依法治国 - 多类型权力系统',
        types: [
            {name: '立法权', elements: ['制定法律', '修改宪法', '监督实施'], type: 'legislative'},
            {name: '执法权', elements: ['行政执法', '司法裁判', '检察监督'], type: 'executive'},
            {name: '监督权', elements: ['人大监督', '政协监督', '舆论监督'], type: 'supervisory'}
        ],
        crossTypeOperations: [
            {from: 'legislative', to: 'executive', operation: '法律约束执法'},
            {from: 'supervisory', to: 'executive', operation: '监督制约权力'}
        ],
        philosophy: '多类型代数系统体现了"权力制约"。立法/执法/监督是不同类型的载体，跨类型运算"监督制约"保证了"把权力关进笼子"。多类型系统不同于西方三权分立(三个独立系统)，而是统一于党的领导下的多类型协同。跨类型运算"法律约束执法"体现了"依法治国、依法执政、依法行政"。习近平法治思想强调"坚持依法治国、依法执政、依法行政共同推进"，多类型系统的类型协同正是这种"共同推进"的数学结构。各类型既有分工又有合作，这是中国特色社会主义法治体系的独特优势。'
    },
    {
        concept: 'multisort',
        name: '新发展格局 - 多类型经济系统',
        types: [
            {name: '生产要素', elements: ['劳动', '资本', '技术', '数据'], type: 'factors'},
            {name: '产业链', elements: ['上游', '中游', '下游'], type: 'industry'},
            {name: '市场主体', elements: ['国企', '民企', '外企'], type: 'entities'},
            {name: '分配机制', elements: ['按劳', '按资', '按技'], type: 'distribution'}
        ],
        crossTypeOperations: [
            {from: 'factors', to: 'industry', operation: '要素配置'},
            {from: 'entities', to: 'distribution', operation: '利益分配'}
        ],
        philosophy: '新发展格局是多类型代数系统。不同类型要素(劳动/资本/技术/数据)在不同类型产业链(上中下游)中配置，不同类型市场主体(国民外企)参与不同类型分配(按劳资技)。跨类型运算"要素配置"和"利益分配"构成复杂的经济运行机制。多类型系统的异构性体现了"社会主义市场经济":既有市场类型(竞争)又有社会主义类型(公有制)，跨类型协调。习近平经济思想强调"构建新发展格局"，多类型系统的系统性正是这个"格局"的数学基础——不是单一类型，而是多类型协同的有机整体。'
    }
];

// ============================================
// 展示映射关系
// ============================================
function displayMapping(caseData) {
    const diagram = document.getElementById('mappingDiagram');

    if (caseData.concept === 'isomorphic') {
        // 同构映射展示
        diagram.innerHTML = `
            <h3>${caseData.name}</h3>
            <div class="systems-row">
                <div class="system-box">
                    <div class="title">${caseData.system1.name}</div>
                    <div class="elements">
                        ${caseData.system1.elements.map(e => `<div class="element-item">${e}</div>`).join('')}
                    </div>
                </div>
                <div class="arrow-section">
                    <div class="arrow">⟷</div>
                    <div class="arrow-label">同构映射f</div>
                </div>
                <div class="system-box">
                    <div class="title">${caseData.system2.name}</div>
                    <div class="elements">
                        ${caseData.system2.elements.map(e => `<div class="element-item">${e}</div>`).join('')}
                    </div>
                </div>
            </div>
            <div class="formula-display">
                <div class="formula">双射保持运算: f(a∘b) = f(a)⊙f(b)</div>
            </div>
        `;
    } else if (caseData.concept === 'subsystem') {
        // 子系统展示
        diagram.innerHTML = `
            <h3>${caseData.name}</h3>
            <div class="systems-row">
                <div class="system-box">
                    <div class="title">${caseData.parent.name} (父系统)</div>
                    <div class="elements">
                        ${caseData.parent.elements.map(e => `<div class="element-item">${e}</div>`).join('')}
                    </div>
                </div>
                <div class="arrow-section">
                    <div class="arrow">⊇</div>
                    <div class="arrow-label">包含关系</div>
                </div>
                <div class="system-box">
                    <div class="title">${caseData.child.name} (子系统)</div>
                    <div class="elements">
                        ${caseData.child.elements.map(e => `<div class="element-item">${e}</div>`).join('')}
                    </div>
                </div>
            </div>
            <div class="formula-display">
                <div class="formula">封闭性: ∀a,b∈子系统, a∘b∈子系统</div>
            </div>
        `;
    } else if (caseData.concept === 'product') {
        // 积系统展示
        diagram.innerHTML = `
            <h3>${caseData.name}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
                ${caseData.systems.map(sys => `
                    <div class="system-box" style="padding: 1rem;">
                        <div class="title" style="font-size: 0.9rem;">${sys.name}</div>
                        <div class="elements">
                            ${sys.elements.map(e => `<div class="element-item" style="font-size: 0.75rem; padding: 4px 6px;">${e}</div>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="formula-display">
                <div class="formula">积运算: (a₁,a₂,...)∘(b₁,b₂,...) = (a₁∘b₁, a₂∘b₂, ...)</div>
            </div>
        `;
    } else if (caseData.concept === 'multisort') {
        // 多类型系统展示
        diagram.innerHTML = `
            <h3>${caseData.name}</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0;">
                ${caseData.types.map(type => `
                    <div class="system-box" style="padding: 1rem;">
                        <div class="title" style="font-size: 0.9rem;">${type.name} [${type.type}]</div>
                        <div class="elements">
                            ${type.elements.map(e => `<div class="element-item" style="font-size: 0.75rem; padding: 4px 6px;">${e}</div>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="formula-display">
                <div class="formula">跨类型运算: Type₁ ∘ Type₂ → Result</div>
            </div>
        `;
    }

    showProperties(caseData.concept);
}

// ============================================
// 展示性质
// ============================================
function showProperties(concept) {
    const content = document.getElementById('propertiesContent');

    const properties = {
        'isomorphic': [
            {title: '双射性', desc: '一一对应，不重不漏'},
            {title: '保运算性', desc: 'f(a∘b) = f(a)⊙f(b)'},
            {title: '结构相同', desc: '本质完全一致'}
        ],
        'subsystem': [
            {title: '包含性', desc: '子集⊆父集'},
            {title: '封闭性', desc: '运算不出子集'},
            {title: '继承性', desc: '保持父系统性质'}
        ],
        'product': [
            {title: '笛卡尔积', desc: '元素是有序对'},
            {title: '分量运算', desc: '按坐标逐个运算'},
            {title: '协同性', desc: '多系统同时工作'}
        ],
        'multisort': [
            {title: '类型多样', desc: '多种载体类型'},
            {title: '跨类型运算', desc: '不同类型可交互'},
            {title: '异构协同', desc: '类型间相互作用'}
        ]
    };

    const props = properties[concept] || [];
    content.innerHTML = props.map(p => `
        <div class="property-card">
            <div class="prop-title">${p.title}</div>
            <div class="prop-desc">${p.desc}</div>
        </div>
    `).join('');
}

// ============================================
// 更新定义面板
// ============================================
function updateDefinitionPanel(concept) {
    const def = CONCEPT_DEFINITIONS[concept];
    const panel = document.getElementById('definitionPanel');

    panel.innerHTML = `
        <h3>${def.title}</h3>
        <p>${def.content}</p>
        <div class="formula-box">${def.formula.replace(/\n/g, '<br>')}</div>
        <p style="font-size: 0.85rem; line-height: 1.5;">
            <strong style="color: var(--accent-gold);">核心意义:</strong> ${def.meaning}
        </p>
    `;
}

// ============================================
// 更新案例列表
// ============================================
function updateExamplesList(concept) {
    const examples = CASES.filter(c => c.concept === concept);
    const list = document.getElementById('examplesList');

    list.innerHTML = examples.map((ex, index) => {
        const globalIndex = CASES.indexOf(ex);
        return `
            <div class="example-card" onclick="loadCase(${globalIndex})" style="cursor: pointer;">
                <div class="title">${ex.name}</div>
                <div class="desc">${ex.philosophy.substring(0, 60)}...</div>
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
    currentConcept = caseData.concept;

    // 更新概念按钮
    document.querySelectorAll('.concept-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.concept === currentConcept);
    });

    // 更新案例选择器
    const selector = document.getElementById('caseSelector');
    selector.innerHTML = CASES.map((c, i) =>
        `<option value="${i}" ${i === index ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    // 更新各个面板
    updateDefinitionPanel(currentConcept);
    updateExamplesList(currentConcept);

    // 更新思政内涵
    document.getElementById('philosophyPanel').innerHTML =
        `<p style="font-size: 0.85rem; line-height: 1.6;">${caseData.philosophy}</p>`;

    // 重置显示区域
    document.getElementById('mappingDiagram').innerHTML = '<h3>点击"展示映射"开始</h3>';
    document.getElementById('propertiesContent').innerHTML =
        '<p style="color: var(--text-secondary); font-size: 0.85rem;">展示映射后显示性质</p>';
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 概念切换
    document.querySelectorAll('.concept-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const concept = btn.dataset.concept;
            currentConcept = concept;

            updateDefinitionPanel(concept);
            updateExamplesList(concept);

            const firstCase = CASES.findIndex(c => c.concept === concept);
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

    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('mappingDiagram').innerHTML = '<h3>点击"展示映射"开始</h3>';
        document.getElementById('propertiesContent').innerHTML =
            '<p style="color: var(--text-secondary); font-size: 0.85rem;">展示映射后显示性质</p>';
    });

    // 对比按钮
    document.getElementById('compareBtn').addEventListener('click', () => {
        showConceptComparison();
    });

    // 初始加载
    loadCase(0);
});

// ============================================
// 概念对比功能
// ============================================
function showConceptComparison() {
    const diagram = document.getElementById('mappingDiagram');

    diagram.innerHTML = `
        <h3 style="font-family: var(--font-title); font-size: 1.5rem; color: var(--accent-red); margin-bottom: 1.5rem; text-align: center;">
            代数系统概念对比
        </h3>
        <div style="overflow-x: auto;">
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>概念</th>
                        <th>核心特征</th>
                        <th>数学表示</th>
                        <th>关键条件</th>
                        <th>思政意义</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="highlight">同类型/同构</td>
                        <td>结构一致，形式对应</td>
                        <td>f: A→B, f(a∘b)=f(a)⊙f(b)</td>
                        <td>双射+保运算</td>
                        <td>中央与地方同构，政令畅通</td>
                    </tr>
                    <tr>
                        <td class="highlight">子代数系统</td>
                        <td>部分包含，独立完整</td>
                        <td>B⊆A, ∀b₁,b₂∈B → b₁∘b₂∈B</td>
                        <td>非空+封闭性</td>
                        <td>党员是人民的先锋队</td>
                    </tr>
                    <tr>
                        <td class="highlight">积代数系统</td>
                        <td>多元组合，协同运作</td>
                        <td>A₁×A₂×...×Aₙ</td>
                        <td>分量独立运算</td>
                        <td>党政军民学，五位一体</td>
                    </tr>
                    <tr>
                        <td class="highlight">多类型系统</td>
                        <td>异构融合，跨类运算</td>
                        <td>A₁∪A₂∪...∪Aₙ</td>
                        <td>多类型载体+跨类运算</td>
                        <td>依法治国，多种权力制约</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div style="margin-top: 2rem; background: rgba(255, 255, 255, 0.8); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--accent-gold);">
            <h4 style="font-family: var(--font-title); font-size: 1.1rem; color: var(--accent-red); margin-bottom: 1rem;">
                概念关系图
            </h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
                <div style="text-align: center;">
                    <div style="font-weight: 700; color: var(--accent-red); margin-bottom: 0.5rem;">同构 vs 子系统</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
                        同构：两个<strong>独立</strong>系统的结构对应<br>
                        子系统：一个系统<strong>包含</strong>另一个系统
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="font-weight: 700; color: var(--accent-red); margin-bottom: 0.5rem;">积系统 vs 多类型</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
                        积系统：同类型元素的<strong>笛卡尔积</strong><br>
                        多类型：异类元素的<strong>并集协同</strong>
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="font-weight: 700; color: var(--accent-red); margin-bottom: 0.5rem;">水平关系 vs 垂直关系</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
                        同构/积系统：<strong>水平</strong>的平等协同<br>
                        子系统：<strong>垂直</strong>的包含继承
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="font-weight: 700; color: var(--accent-red); margin-bottom: 0.5rem;">单一 vs 复合</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
                        同构/子系统：<strong>单一</strong>载体类型<br>
                        积系统/多类型：<strong>复合</strong>多元结构
                    </div>
                </div>
            </div>
        </div>

        <div style="margin-top: 1.5rem; background: linear-gradient(135deg, rgba(214, 59, 29, 0.1), rgba(255, 180, 0, 0.1)); padding: 1.5rem; border-radius: 12px; border: 2px solid var(--accent-red);">
            <h4 style="font-family: var(--font-title); font-size: 1.1rem; color: var(--accent-red); margin-bottom: 1rem;">
                思政综合：中国特色社会主义制度的代数结构
            </h4>
            <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.8;">
                <p style="margin-bottom: 0.8rem;">
                    <strong style="color: var(--accent-red);">同构性：</strong>
                    理论与实践同构、中央与地方同构，确保"一盘棋"布局
                </p>
                <p style="margin-bottom: 0.8rem;">
                    <strong style="color: var(--accent-red);">子系统性：</strong>
                    党是人民先锋队、核心价值观是文化精华，体现"核心引领"
                </p>
                <p style="margin-bottom: 0.8rem;">
                    <strong style="color: var(--accent-red);">积系统性：</strong>
                    党政军民学、东西南北中，党是领导一切的，实现"全面协同"
                </p>
                <p>
                    <strong style="color: var(--accent-red);">多类型性：</strong>
                    立法执法监督、经济社会生态，不同类型相互制约，保证"平衡发展"
                </p>
            </div>
        </div>
    `;

    // 更新性质面板显示对比总结
    const content = document.getElementById('propertiesContent');
    content.innerHTML = `
        <div class="property-card" style="background: rgba(214, 59, 29, 0.15);">
            <div class="prop-title">核心区别</div>
            <div class="prop-desc">同构看对应，子系统看包含，积看组合，多类型看异构</div>
        </div>
        <div class="property-card">
            <div class="prop-title">共同本质</div>
            <div class="prop-desc">都是构建复杂系统的数学工具</div>
        </div>
        <div class="property-card">
            <div class="prop-title">应用场景</div>
            <div class="prop-desc">从不同角度描述系统间关系</div>
        </div>
        <div class="property-card" style="background: rgba(255, 180, 0, 0.15);">
            <div class="prop-title">治理启示</div>
            <div class="prop-desc">系统思维是国家治理现代化的数学基础</div>
        </div>
    `;
}
