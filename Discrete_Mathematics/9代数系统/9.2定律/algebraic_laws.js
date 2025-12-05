// ============================================
// 全局状态管理
// ============================================
let currentLaw = 'associative';
let currentCaseIndex = 0;
let animationSpeed = 1000;
let isAnimating = false;

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
        content: '分配律描述了一个运算对另一个运算的分配性质，体现运算间的相互作用。',
        formula: 'a ∘ (b * c) = (a ∘ b) * (a ∘ c)',
        meaning: '体现了"系统性"——整体作用可分解为对各部分的作用',
        example: '2 × (3 + 4) = 2×3 + 2×4 = 14'
    },
    'absorption': {
        title: '吸收律 (Absorption Law)',
        content: '吸收律描述了某些运算中，一个元素可以"吸收"另一个元素的性质。',
        formula: 'a ∘ (a * b) = a',
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
        content: '消去律描述了在等式两边同时作用某个元素时，可以消去该元素。',
        formula: '若 a ∘ b = a ∘ c, 则 b = c',
        meaning: '体现了"唯一性"——相同原因导致相同结果',
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
        philosophy: '结合律体现了"上下贯通、整体联动"的工作机制。无论是先将中央政策与省级细则结合，再与市级实施结合，还是先将省级细则与市级实施结合，再与中央政策结合，最终形成的完整政策体系是一致的。这说明:政策的传导路径可以灵活调整，但政策的整体性和一致性不变。习近平总书记强调"上下一般粗"，结合律就是这种系统观念的数学表达。中央统筹、地方负责、各级联动，形成政策执行的"结合律闭环"。',
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
        philosophy: '产业链整合满足结合律，无论先整合哪两个环节，最终形成的产业链是一致的。这体现了"系统集成"思想:可以先垂直整合上中游(供应+制造)，再连接下游；也可以先整合中下游(制造+销售)，再对接上游。结合律保证了产业链整合路径的灵活性。"链长制"改革中，各地根据实际情况选择不同的整合路径，但最终都要形成完整的产业闭环。这是辩证法中"殊途同归"的体现。',
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
        philosophy: '交换律体现了"平等性"原则。在民主协商中，无论先听甲方还是先听乙方，综合后的决议应该相同。这是"协商民主"的数学基础:各方地位平等，发言顺序不影响决策结果。如果违反交换律，说明存在"顺序歧视"——先发言者占优势。毛泽东说"团结—批评—团结"，强调的就是平等讨论。交换律告诉我们:民主不是形式，而是实质——无论谁先说，都应被平等对待。这也是"求同存异"的前提:只有交换律成立，才能真正"求同"。',
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
        philosophy: '东西部协作满足交换律，体现了"互利共赢"。无论是"东部资金换西部资源"还是"西部资源换东部资金"，交易的本质相同。交换律保证了协作的对等性:东部不是"施舍"，西部不是"依附"，而是平等的资源互换。这打破了"先富帮后富"的单向思维，建立了双向互动的新型关系。交换律在经济学上对应"比较优势理论"，在政治上对应"共同富裕"——不是劫富济贫，而是优势互补。',
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
        philosophy: '分配律揭示了"普惠性政策"的内在逻辑。一项优惠政策作用于(农民+工人)，等同于分别作用于农民和工人，再汇总效果。这体现了"以人民为中心"的系统性:政策面向全体人民，实质是作用于每个具体群体。分配律保证了政策的"可分解性"——宏观政策可以细化为针对各群体的具体措施。这也是"精准施策"的数学基础:既要有统一的大政方针(a×(b+c))，又要有分类指导的具体措施((a×b)+(a×c))。分配律连接了"普遍性"与"特殊性"。',
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
        philosophy: '公共资源分配满足分配律，体现了"分配正义"。资源分配给(城市+农村)，等同于分别分配给城市和农村。这确保了"一碗水端平"——不能因为先照顾城市，就忽略农村。分配律是"统筹城乡发展"的数学保障:公共服务要城乡一体化，基础设施要城乡同步建。违反分配律意味着"顾此失彼"。习近平总书记强调"小康不小康，关键看老乡"，就是要求资源分配严格遵循分配律，确保城乡共享发展成果。',
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
        philosophy: '吸收律体现了"核心价值观"的主导地位。社会主义核心价值观∪(核心价值观∩其他文化)=核心价值观。这说明:在吸纳多元文化时，核心价值观始终占主导。"∩"表示取交集(共同点)，"∪"表示并集(包容)。吸收律告诉我们:即使包容其他文化的部分内容，整体仍由核心价值观主导。这是"文化自信"的数学表达——不是排斥多元，而是"以我为主、为我所用"。习近平总书记强调"不忘本来、吸收外来、面向未来"，吸收律正是这一方针的形式化。',
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
        name: '党的领导吸收群众意见 - 吸收律',
        elements: { a: '党的领导', b: '群众意见' },
        operation1: '∪',
        operation2: '∩',
        description: '党的领导与群众路线',
        philosophy: '党的领导∪(党的领导∩群众意见)=党的领导。这并非忽视群众意见，而是说明:党的领导已经包含了群众的根本利益。"∩"是倾听民意，"∪"是综合决策，吸收律保证了决策主体的统一性。这是"民主集中制"的体现:充分发扬民主(听取意见)，但决策权归党(领导不变)。吸收律避免了"群龙无首"——如果决策主体因吸收意见而改变，就失去了领导核心。党的领导不是专断，而是"为人民服务的领导"，已经内含了人民利益。',
        verification: {
            left: '党的领导∪(党的领导∩群众意见)',
            right: '党的领导',
            leftSteps: [
                { expr: '党的领导∩群众意见', desc: '倾听群众声音' },
                { expr: '党的领导∪(党的领导∩群众意见)', desc: '吸收合理意见' }
            ],
            rightSteps: [
                { expr: '党的领导', desc: '领导核心不变' }
            ]
        }
    },
    {
        law: 'idempotent',
        name: '制度自信 - 幂等律',
        elements: { a: '中国特色社会主义制度' },
        operation: '∪',
        description: '制度的稳定性与自信',
        philosophy: '幂等律体现了"制度自信"。中国特色社会主义制度∪中国特色社会主义制度=中国特色社会主义制度。这说明制度不因重复强调而改变，体现了稳定性和确定性。"四个自信"中的"制度自信"，数学上就是幂等律——制度经得起反复检验，重复实践不改变其本质。幂等律也意味着"不折腾":已经确立的正确制度，不需要朝令夕改。邓小平说"稳定压倒一切"，幂等律是稳定性的数学保证。制度∪制度=制度，体现了"咬定青山不放松"的战略定力。',
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
        philosophy: '实事求是∩实事求是=实事求是。幂等律说明真理不怕反复检验。"实践是检验真理的唯一标准"，多次实践(∩操作)不改变真理本身。这体现了马克思主义认识论:真理具有客观性，不因主观重复而改变。幂等律也警示"本本主义":如果理论经不起重复检验(不满足幂等律)，说明不是真理。毛泽东批评"教条主义"，就是因为教条不满足幂等律——一实践就露馅。"实事求是"满足幂等律，所以能成为党的思想路线。',
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
        philosophy: '消去律体现了"公平正义"。若"起跑线+选手A=起跑线+选手B"，则"选手A=选手B"(实力相当)。这说明:在相同的起跑线(外部条件)下，才能公平比较。消去律是"机会平等"的数学表达——消除外部差异，比较内在实力。教育公平、就业公平、司法公平，本质都是"消去律":消去家庭背景、地域差异、权力干扰等外部因素，让能力成为唯一变量。如果不满足消去律(消不掉外部因素)，说明存在不公。习近平总书记强调"起跑线公平"，就是要确保社会满足消去律。',
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
        name: '反腐倡廉 - 消去律',
        elements: { a: '个人利益', b: '清官', c: '贪官' },
        operation: '+',
        description: '消除私利后的本质区别',
        philosophy: '消去律是"反腐倡廉"的数学依据。若"个人利益+清官=个人利益+贪官"(外在表现相同)，按消去律应有"清官=贪官"，但这显然不成立！这说明:不能仅看外在(加上个人利益后的行为)，要"消去"私利因素，看本质(为谁服务)。反腐就是"消去私利"的过程:剥离利益链，显现真面目。满足消去律的是真清官——消去外部诱惑，初心不变；不满足消去律的是伪装——一旦利益消失，本质暴露。"打铁还需自身硬"，就是要求党员干部内在过硬，而非靠外部约束。',
        verification: {
            left: '个人利益+清官',
            right: '个人利益+贪官',
            assumption: '表面行为相似',
            conclusion: '消去个人利益后，清官≠贪官',
            leftSteps: [
                { expr: '个人利益+清官', desc: '清官的外在行为' }
            ],
            rightSteps: [
                { expr: '个人利益+贪官', desc: '贪官的外在行为' }
            ],
            cancelSteps: [
                { expr: '假设：个人利益+清官 = 个人利益+贪官', desc: '外在相似' },
                { expr: '消去"个人利益"', desc: '剥离利益因素' },
                { expr: '清官 ≠ 贪官', desc: '本质不同！' }
            ]
        }
    }
];

// ============================================
// 验证动画
// ============================================
async function verifyLaw(caseData) {
    const stepsList = document.getElementById('stepsList');
    const comparisonDisplay = document.getElementById('comparisonDisplay');
    const leftValue = document.getElementById('leftValue');
    const rightValue = document.getElementById('rightValue');
    const equalsSign = document.getElementById('equalsSign');

    stepsList.innerHTML = '';
    comparisonDisplay.style.display = 'grid';

    const verification = caseData.verification;

    // 显示公式
    document.getElementById('lawFormulaDisplay').innerHTML = `
        <h3>${caseData.name}</h3>
        <div class="formula-box">
            <div class="formula">${verification.left}</div>
            <div class="formula" style="color: var(--accent-gold); margin: 0.5rem 0;">=</div>
            <div class="formula">${verification.right}</div>
        </div>
    `;

    // 左侧计算步骤
    for (let i = 0; i < verification.leftSteps.length; i++) {
        const step = verification.leftSteps[i];
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item active';
        stepDiv.innerHTML = `
            <div class="step-expression">${step.expr}</div>
            <div class="step-description">左侧: ${step.desc}</div>
        `;
        stepsList.appendChild(stepDiv);

        leftValue.textContent = step.expr.substring(0, 20) + (step.expr.length > 20 ? '...' : '');

        await sleep(animationSpeed);
        stepDiv.classList.remove('active');
    }

    // 右侧计算步骤
    for (let i = 0; i < verification.rightSteps.length; i++) {
        const step = verification.rightSteps[i];
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item active';
        stepDiv.innerHTML = `
            <div class="step-expression">${step.expr}</div>
            <div class="step-description">右侧: ${step.desc}</div>
        `;
        stepsList.appendChild(stepDiv);

        rightValue.textContent = step.expr.substring(0, 20) + (step.expr.length > 20 ? '...' : '');

        await sleep(animationSpeed);
        stepDiv.classList.remove('active');
    }

    // 消去律特殊处理
    if (verification.cancelSteps) {
        for (let i = 0; i < verification.cancelSteps.length; i++) {
            const step = verification.cancelSteps[i];
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step-item active';
            stepDiv.innerHTML = `
                <div class="step-expression">${step.expr}</div>
                <div class="step-description">${step.desc}</div>
            `;
            stepsList.appendChild(stepDiv);

            await sleep(animationSpeed);
            stepDiv.classList.remove('active');
        }

        // 检查是否相等
        const isEqual = verification.conclusion.includes('=') && !verification.conclusion.includes('≠');
        if (!isEqual) {
            equalsSign.textContent = '≠';
            equalsSign.classList.add('not-equal');
        }
    }

    // 最终结果
    const resultDiv = document.createElement('div');
    resultDiv.className = 'step-item success';
    resultDiv.innerHTML = `
        <div class="step-expression">验证完成!</div>
        <div class="step-description">
            ${verification.conclusion || '两侧表达式相等，定律成立'}
        </div>
    `;
    stepsList.appendChild(resultDiv);

    await sleep(animationSpeed * 1.5);
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

    // 更新思政内涵
    document.getElementById('philosophyPanel').innerHTML =
        `<p style="font-size: 0.85rem; line-height: 1.6;">${caseData.philosophy}</p>`;

    // 重置显示
    document.getElementById('lawFormulaDisplay').innerHTML = '<h3>点击"验证定律"开始</h3>';
    document.getElementById('comparisonDisplay').style.display = 'none';
    document.getElementById('stepsList').innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">点击"验证定律"开始</p>';
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

        // 重置等号
        document.getElementById('equalsSign').textContent = '=';
        document.getElementById('equalsSign').classList.remove('not-equal');

        const caseData = CASES[currentCaseIndex];
        await verifyLaw(caseData);

        isAnimating = false;
        document.getElementById('verifyBtn').disabled = false;
    });

    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (!isAnimating) {
            document.getElementById('lawFormulaDisplay').innerHTML = '<h3>点击"验证定律"开始</h3>';
            document.getElementById('comparisonDisplay').style.display = 'none';
            document.getElementById('stepsList').innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">点击"验证定律"开始</p>';
        }
    });

    // 初始加载
    loadCase(0);
});
