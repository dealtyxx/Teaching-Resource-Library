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
        content: '同态是保持代数运算的映射。若f: <A,∘> → <B,⊙>满足f(a∘b)=f(a)⊙f(b)，则f是同态映射。',
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
        properties: ['保持运算', '单射性', '一一对应', '无信息损失'],
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
        content: '同构是双射的同态映射。既单又满，结构完全相同。',
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
// 思政案例数据
// ============================================
const CASES = [
    {
        type: 'homomorphism',
        name: '理论宣讲 - 同态传播',
        domainSet: {
            name: '理论体系',
            elements: ['马克思主义', '毛泽东思想', '中国特色理论', '习近平思想']
        },
        codomainSet: {
            name: '群众语言',
            elements: ['通俗故事', '生动比喻', '通俗故事', '生动比喻']
        },
        mapping: {
            '马克思主义': '通俗故事',
            '毛泽东思想': '生动比喻',
            '中国特色理论': '通俗故事',
            '习近平思想': '生动比喻'
        },
        properties: ['保持运算', '多对一映射'],
        philosophy: '理论宣讲是同态映射的典范。把高深的马克思主义理论体系f→群众喜闻乐见的语言，保持了理论的逻辑运算（推理链条），但表现形式不同。f(理论A∩理论B) = f(理论A)∩f(理论B)，两个理论的交集映射后仍是交集——这保证了宣讲的逻辑自洽。同态允许"多对一"，多个理论概念可以用同一个生动故事说明，这是"深入浅出"的数学本质。习近平总书记强调"让党的创新理论飞入寻常百姓家"，同态映射就是这种"飞入"的数学机制——换语言不换逻辑。'
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
            elements: ['具体措施', '实施细则', '具体措施', '实施细则']
        },
        mapping: {
            '顶层设计': '具体措施',
            '战略规划': '实施细则',
            '重大决策': '具体措施',
            '改革方案': '实施细则'
        },
        properties: ['保持运算', '可能简化'],
        philosophy: '政策落实过程是同态映射。中央政策f→地方措施，保持了政策的内在逻辑，但表现形式因地制宜。同态的"保运算性"保证了"上下同心"：中央的政策组合逻辑，在地方层面必须保持一致。同态允许"简化"，地方可以把多个中央精神综合成一套措施——这是"因地制宜"的数学依据。但同态的底线是"保持运算"，地方措施的组合效果f(政策A+政策B)必须等于f(政策A)+f(政策B)，否则就是"上有政策下有对策"的变形走样。这是"不折不扣"的数学含义。'
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
        philosophy: '精准扶贫体现了满同态思想。扶贫措施f→贫困类型，必须是满射——"全面小康路上一个都不能少"。满同态的满射性保证了"不漏一户不落一人"，每种致贫原因都有对应措施。满同态允许"多对一"：多种措施可以针对同一类贫困，这是"综合施策"的数学基础。习近平总书记强调"精准扶贫、精准脱贫"，满同态的"满射"是"精准"的充分条件——措施全覆盖，贫困无死角。满同态保证了"一个都不能少"的可实现性，这是中国特色社会主义制度优越性的数学证明。'
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
        philosophy: '民意反馈机制是满同态。反馈渠道f→民意类型，必须满射——"让人民监督权力，让权力在阳光下运行"。满同态保证了"民意畅通无阻"，任何类型的民意都能找到表达渠道。满同态的"多对一"体现了"多渠道汇聚"：同一个民意可以通过多种渠道表达，这增加了民主的鲁棒性。习近平总书记强调"江山就是人民，人民就是江山"，满同态的满射性保证了"人民当家作主"不是口号——每一种民意都有通达路径。这是社会主义民主政治的数学保障。'
    },
    {
        type: 'injective',
        name: '干部考核 - 单同态区分',
        domainSet: {
            name: '干部表现',
            elements: ['德', '能', '勤', '绩', '廉']
        },
        codomainSet: {
            name: '考核等级',
            elements: ['优秀', '良好', '合格', '基本合格', '不合格', '特别优秀']
        },
        mapping: {
            '德': '优秀',
            '能': '良好',
            '勤': '合格',
            '绩': '特别优秀',
            '廉': '优秀'
        },
        properties: ['保持运算', '单射性', '精准区分'],
        philosophy: '干部考核体系体现了单同态思想。干部表现f→考核等级，应该单射（理想情况）——不同表现对应不同评价，避免"大锅饭"。单同态的单射性保证了"精准识人"，优秀干部不会被埋没，平庸干部也无法蒙混。单同态的"保运算"体现了考核的科学性：德能勤绩廉的综合f(德+能+勤+绩+廉)应该等于各项单独考核的综合f(德)+f(能)+...——这是"综合考核"的数学基础。习近平总书记强调"让有为者有位、能干者能上、优秀者优先"，单同态的单射性是这种"让"的制度保障。单同态避免了"不同表现同等对待"的不公平，这是激励干部担当作为的数学前提。'
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
        philosophy: '法律责任追究是单同态。违法行为f→法律后果，必须单射——不同性质、不同程度的违法对应不同处罚，"罪刑法定、罪刑相当"。单同态的单射性保证了法律的威慑力和公正性，相同行为必受相同惩罚，不同行为必受不同对待。单同态的"保运算"体现了"数罪并罚"的科学性：f(罪行A+罪行B)的处罚应该等于f(罪行A)+f(罪行B)的某种合理组合。习近平法治思想强调"让人民群众在每一个司法案件中感受到公平正义"，单同态的单射性是"公平正义"的数学保障——不会出现"同罪异罚"或"异罪同罚"。单同态确保了法律面前人人平等。'
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
        philosophy: '党的自我革命是自同态的典范。党的建设f→党的建设，系统映射到自身，这是"刀刃向内"的数学表达。自同态的"自映射"体现了"自我净化、自我完善、自我革新、自我提高"——不依赖外力，自我演化。自同态的"可迭代性"至关重要：f(f(党建))、f(f(f(党建)))...可以无限迭代，党的自我革命是持续的、永恒的，"永远在路上"。自同态的"保运算"保证了自我革命的一致性：革命后的党仍然保持原有的运算规则（初心使命）。习近平总书记强调"勇于自我革命是中国共产党区别于其他政党的显著标志"，自同态的数学结构说明了这种"区别"——多数组织的变革是外部推动（异态），唯有中国共产党能实现真正的自同态（自我革命）。'
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
        philosophy: '文化传承创新是自同态。中华文化f→中华文化，文化在时间维度上自我映射，代代相传。自同态的"自映射"体现了"守正创新"：形式可以变化（传统文化→革命文化→先进文化），但文化的核心运算（价值观逻辑）保持不变。自同态的"保运算"是文化认同的基础：传承后的文化f(传统+革命)仍然满足传统和革命的内在逻辑关系。自同态的"可迭代性"说明文化传承是永续的：五千年文明f^5000(原初文化)仍然可以追溯到源头。习近平总书记强调"坚定文化自信"，自同态的数学结构说明了这种"自信"的来源——我们的文化是自我演化的封闭系统，具有强大的内生动力，不会因外部冲击而改变本质。'
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
        philosophy: '理论与实践的统一是同构映射的最高形态。理论f⟷实践，双射且保运算，本质完全一致。同构的"双射性"保证了"知行合一"：每个理论对应唯一实践，每个实践对应唯一理论，理论与实践一一对应、相互印证。同构的"可逆性"体现了"实践-认识-再实践-再认识"：f是理论→实践，f⁻¹是实践→理论，可以双向转换。同构的"保运算"是知行合一的数学保障：理论推导f(理论A→理论B)在实践中必然体现为f(理论A)→f(理论B)，即实践A→实践B，逻辑链条完全对应。习近平新时代中国特色社会主义思想既是理论体系又是实践体系，两者同构，这是"21世纪马克思主义"的数学特征——理论与实践达到了最高程度的统一。'
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
        philosophy: '国家制度与治理体系是同构的。制度体系f⟷治理体系，结构完全对应。同构的"双射性"说明了"制度优势转化为治理效能"的机制：制度和治理一一对应，有什么样的制度就有什么样的治理，反之亦然。同构的"保运算"保证了"系统性"：制度的层次结构（根本-基本-重要-具体）在治理中完全对应（战略-系统-专项-日常），制度之间的逻辑关系在治理中精确复现。同构的"可逆性"体现了"制度-治理"的良性循环：好的治理实践可以逆向映射为制度创新。习近平总书记强调"推进国家治理体系和治理能力现代化"，同构的数学结构说明了"体系"和"能力"的关系——体系是结构（制度），能力是映射（治理），现代化就是让这个映射达到同构的完美状态。'
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
        philosophy: '改革开放是自同构映射的伟大实践。社会主义制度f⟷社会主义制度，自己映射自己且同构。自同构的"双射性"保证了改革的彻底性：改革不是局部修补，而是全面深化，每个领域都被触及。自同构的"自映射"体现了改革的方向性："改革开放是社会主义制度的自我完善和发展"，改革后仍然是社会主义，不会改旗易帜。自同构的"保运算"是改革底线：基本制度的运算规则（公有制主体、党的领导等）必须保持，改革是结构优化而非本质改变。自同构的"对称性"说明了改革的系统性：经济改革、政治改革、文化改革...相互对称、相互支撑。习近平总书记强调"改革开放是决定当代中国命运的关键一招"，自同构的数学本质说明了这一招的"关键"所在——既改革又开放，既变革又坚守，在自同构的对称变换中实现社会主义的跃升。这是中国特色社会主义道路自信的数学基础。'
    },
    {
        type: 'automorphism',
        name: '对外开放 - 自同构融合',
        domainSet: {
            name: '中国发展模式',
            elements: ['市场经济', '对外开放', '共同富裕', '和平发展']
        },
        codomainSet: {
            name: '中国发展模式',
            elements: ['市场经济', '对外开放', '共同富裕', '和平发展']
        },
        mapping: {
            '市场经济': '市场经济',
            '对外开放': '对外开放',
            '共同富裕': '共同富裕',
            '和平发展': '和平发展'
        },
        properties: ['保持运算', '双射', '对称', '内外统一'],
        philosophy: '对外开放中的中国模式是自同构。中国发展模式在全球化中f⟷自己，既融入世界又保持独立。自同构的"自映射"体现了"在开放中坚守"：与世界接轨f(中国特色)后仍然是中国特色，不会"全盘西化"。自同构的"双射性"说明了开放的双向性：引进来与走出去一一对应，学习借鉴与贡献智慧相互映射。自同构的"保运算"是开放的底线："社会主义市场经济"中"社会主义"的运算规则不能变，这是"在开放中发展、在发展中开放"的数学保障。自同构的"对称性"体现了"人类命运共同体"理念：中国的发展f(中国)与世界的发展f(世界)形成对称映射，共赢共享。习近平总书记强调"中国开放的大门只会越开越大"，自同构的数学结构说明了这种"开放"的安全性——开放是自同构映射，不会失去自我，反而在对称变换中更加强大。这是中国外交自信的数学基础。'
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
        <div class="property-badges">
            ${caseData.properties.map(prop =>
                `<span class="badge">${prop}</span>`
            ).join('')}
        </div>
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
                <p style="margin-bottom: 0.5rem;"><strong style="color: var(--accent-red);">思政启示：</strong></p>
                <p style="margin-bottom: 0.3rem;">同态→同构：从一般到特殊，从形式相似到本质相同</p>
                <p style="margin-bottom: 0.3rem;">同态→自同态：从外部变换到内部演化，自我革命</p>
                <p>自同构：最高形式，既保持本质又实现变革</p>
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

    // 更新思政内涵
    document.getElementById('philosophyPanel').innerHTML =
        `<p style="font-size: 0.85rem; line-height: 1.6;">${caseData.philosophy}</p>`;

    // 重置显示区域
    document.getElementById('mappingDisplay').innerHTML = '<h3>点击"展示映射"开始</h3>';
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
});
