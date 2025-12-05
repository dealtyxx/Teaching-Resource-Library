/**
 * Prenex Normal Form Converter
 * 前束范式转换系统
 */

// DOM Elements
const caseSelect = document.getElementById('caseSelect');
const customInputGroup = document.getElementById('customInputGroup');
const customFormula = document.getElementById('customFormula');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const stepCount = document.getElementById('stepCount');
const quantifierCount = document.getElementById('quantifierCount');
const originalFormula = document.getElementById('originalFormula');
const conversionSteps = document.getElementById('conversionSteps');
const finalResult = document.getElementById('finalResult');
const structureVisualization = document.getElementById('structureVisualization');
const philosophyContent = document.getElementById('philosophyContent');

// 思政主题案例
const CASES = [
    {
        formula: "∀x 团结(x) ∧ ∃y 协作(y)",
        name: "团结协作 - 平凡前束范式",
        type: "prenex",
        description: "将所有量词提到最前,体现统一领导",
        context: "集体中每个人都团结,且存在协作者",
        philosophy: "这个转换过程体现了组织管理中的层级原则。通过将量词统一提到前面,我们清晰地看到了'全局规划(∀x)'和'具体执行(∃y)'的层次关系。在党的领导下,既要有全局观念(所有成员都团结),也要有具体措施(存在协作机制)。这启示我们:要坚持集中统一领导,同时发挥基层的主动性和创造性。",
        theme: "组织原则",
        steps: [
            { desc: "识别量词位置", formula: "∀x 团结(x) ∧ ∃y 协作(y)" },
            { desc: "提取第一个量词", formula: "∀x (团结(x) ∧ ∃y 协作(y))" },
            { desc: "提取第二个量词", formula: "∀x ∃y (团结(x) ∧ 协作(y))" },
            { desc: "得到前束范式", formula: "∀x ∃y (团结(x) ∧ 协作(y))" }
        ]
    },
    {
        formula: "(∀x 理论(x)) → (∃y 实践(y))",
        name: "实践检验 - 前束合取范式",
        type: "pcnf",
        description: "理论指导实践,实践检验理论",
        context: "如果掌握理论,就要进行实践",
        philosophy: "这体现了马克思主义认识论的基本原理:理论与实践的辩证关系。通过转换为前束合取范式,我们看到了'理论普遍性(∀x)'与'实践特殊性(∃y)'的结合。毛泽东同志指出:'实践是检验真理的唯一标准'。这个公式告诉我们:理论学习不是目的,将理论应用于实践,在实践中检验和发展理论,才是学习的真谛。",
        theme: "理论与实践",
        steps: [
            { desc: "消除蕴含符号", formula: "¬(∀x 理论(x)) ∨ (∃y 实践(y))" },
            { desc: "应用德摩根律", formula: "(∃x ¬理论(x)) ∨ (∃y 实践(y))" },
            { desc: "统一量词(换名)", formula: "(∃x ¬理论(x)) ∨ (∃z 实践(z))" },
            { desc: "提取量词", formula: "∃x ∃z (¬理论(x) ∨ 实践(z))" },
            { desc: "转换为合取范式", formula: "∃x ∃z (¬理论(x) ∨ 实践(z))" }
        ]
    },
    {
        formula: "∃x (天赋(x) ∨ 努力(x)) ∧ ∀y 机遇(y)",
        name: "多元发展 - 前束析取范式",
        type: "pdnf",
        description: "成功有多条路径,机遇对所有人开放",
        context: "存在通过天赋或努力成功的人,且每个人都有机遇",
        philosophy: "这体现了唯物辩证法中'事物发展的多样性'原理。通过前束析取范式,我们看到了成功路径的多元性:天赋与努力都是可能的途径(析取)。同时,机遇的普遍性(∀y)告诉我们:时代为每个人提供了机会,关键在于是否把握。习近平总书记强调'奋斗是青春最亮丽的底色',这启示我们:无论天赋如何,努力奋斗都是通往成功的重要路径。",
        theme: "多元发展",
        steps: [
            { desc: "识别量词和结构", formula: "∃x (天赋(x) ∨ 努力(x)) ∧ ∀y 机遇(y)" },
            { desc: "提取存在量词", formula: "∃x ((天赋(x) ∨ 努力(x)) ∧ ∀y 机遇(y))" },
            { desc: "提取全称量词", formula: "∃x ∀y ((天赋(x) ∨ 努力(x)) ∧ 机遇(y))" },
            { desc: "分配律转析取范式", formula: "∃x ∀y ((天赋(x) ∧ 机遇(y)) ∨ (努力(x) ∧ 机遇(y)))" }
        ]
    },
    {
        formula: "(∀x 学习(x) → ∃y 进步(y)) ∧ (∃z 坚持(z))",
        name: "辩证统一 - 复杂转换",
        type: "prenex",
        description: "学习、进步、坚持的辩证关系",
        context: "学习导致进步,且需要坚持",
        philosophy: "这个复杂公式体现了辩证唯物主义的核心思想。学习(量变)通过坚持(质的保证)实现进步(质变)。通过前束范式转换,我们将复杂的逻辑关系梳理清晰:全局的学习要求(∀x)、个体的进步结果(∃y)、必要的坚持条件(∃z)。这启示我们:个人成长不是孤立的,而是在集体学习的大环境下,通过个人的坚持不懈,最终实现进步。这体现了'集体主义'与'个人奋斗'的统一。",
        theme: "辩证统一",
        steps: [
            { desc: "消除蕴含", formula: "(¬∀x 学习(x) ∨ ∃y 进步(y)) ∧ (∃z 坚持(z))" },
            { desc: "应用德摩根律", formula: "(∃x ¬学习(x) ∨ ∃y 进步(y)) ∧ (∃z 坚持(z))" },
            { desc: "换名避免冲突", formula: "(∃x ¬学习(x) ∨ ∃y 进步(y)) ∧ (∃z 坚持(z))" },
            { desc: "提取所有量词", formula: "∃x ∃y ∃z ((¬学习(x) ∨ 进步(y)) ∧ 坚持(z))" },
            { desc: "得到前束范式", formula: "∃x ∃y ∃z ((¬学习(x) ∨ 进步(y)) ∧ 坚持(z))" }
        ]
    }
];

// State
let currentCase = null;
let targetFormType = 'prenex';
let isRunning = false;
let shouldStop = false;

// Helper Functions
function getDelay() {
    const val = parseInt(speedInput.value);
    return Math.max(50, 1000 - (val * 10));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 提取量词
function extractQuantifiers(formula) {
    const quantifiers = [];
    const pattern = /[∀∃]([a-z])/g;
    let match;

    while ((match = pattern.exec(formula)) !== null) {
        quantifiers.push({
            type: match[0][0],
            variable: match[1]
        });
    }

    return quantifiers;
}

// 渲染原始公式
function renderOriginalFormula(caseData) {
    originalFormula.innerHTML = `
        <div class="formula-card">
            <div class="formula-header">
                <h3>${caseData.name}</h3>
                <span class="formula-type-badge ${caseData.type}">
                    ${getFormTypeName(caseData.type)}
                </span>
            </div>
            <div class="formula-content">
                <div class="formula-text">${caseData.formula}</div>
            </div>
            <div class="formula-meta">
                <p><strong>描述:</strong> ${caseData.description}</p>
                <p><strong>语境:</strong> ${caseData.context}</p>
            </div>
        </div>
    `;

    // 更新量词统计
    const quantifiers = extractQuantifiers(caseData.formula);
    quantifierCount.textContent = quantifiers.length;
}

function getFormTypeName(type) {
    const names = {
        'prenex': '平凡前束范式',
        'pcnf': '前束合取范式',
        'pdnf': '前束析取范式'
    };
    return names[type] || '前束范式';
}

// 渲染转换步骤
async function renderConversionSteps(steps) {
    conversionSteps.innerHTML = '';

    statusText.textContent = '正在执行转换步骤...';

    for (let i = 0; i < steps.length; i++) {
        if (shouldStop) break;

        const step = steps[i];
        await sleep(getDelay());

        const stepEl = document.createElement('div');
        stepEl.className = 'step-item';

        stepEl.innerHTML = `
            <div class="step-header">
                <span class="step-number">${i + 1}</span>
                <span class="step-description">${step.desc}</span>
            </div>
            <div class="step-formula">
                ${step.formula}
            </div>
            ${i < steps.length - 1 ? '<div class="step-arrow">⬇</div>' : ''}
        `;

        conversionSteps.appendChild(stepEl);

        setTimeout(() => stepEl.classList.add('visible'), 10);

        stepCount.textContent = i + 1;
    }
}

// 渲染最终结果
async function renderFinalResult(caseData) {
    finalResult.innerHTML = '';

    statusText.textContent = '正在生成最终结果...';
    await sleep(getDelay());

    const lastStep = caseData.steps[caseData.steps.length - 1];
    const quantifiers = extractQuantifiers(lastStep.formula);

    const resultEl = document.createElement('div');
    resultEl.className = 'result-card';

    // 分离量词前缀和矩阵
    const quantifierPrefix = quantifiers.map(q => `${q.type}${q.variable}`).join(' ');
    const matrix = lastStep.formula.replace(/[∀∃][a-z]\s*/g, '').trim();

    resultEl.innerHTML = `
        <div class="result-header">
            <span class="result-icon">✓</span>
            <h3>转换完成</h3>
        </div>
        <div class="result-body">
            <div class="result-formula-section">
                <div class="result-label">最终前束范式:</div>
                <div class="result-formula">${lastStep.formula}</div>
            </div>
            <div class="result-structure">
                <div class="structure-item">
                    <div class="structure-label">量词前缀:</div>
                    <div class="structure-content quantifier-prefix">${quantifierPrefix}</div>
                </div>
                <div class="structure-item">
                    <div class="structure-label">无量词矩阵:</div>
                    <div class="structure-content matrix">${matrix}</div>
                </div>
            </div>
            <div class="result-stats">
                <div class="stat-box">
                    <div class="stat-value">${quantifiers.length}</div>
                    <div class="stat-label">量词总数</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${quantifiers.filter(q => q.type === '∀').length}</div>
                    <div class="stat-label">全称量词</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${quantifiers.filter(q => q.type === '∃').length}</div>
                    <div class="stat-label">存在量词</div>
                </div>
            </div>
        </div>
    `;

    finalResult.appendChild(resultEl);
    setTimeout(() => resultEl.classList.add('visible'), 10);
}

// 渲染结构可视化
async function renderStructureVisualization(caseData) {
    structureVisualization.innerHTML = '';

    statusText.textContent = '正在构建结构可视化...';
    await sleep(getDelay());

    const lastStep = caseData.steps[caseData.steps.length - 1];
    const quantifiers = extractQuantifiers(lastStep.formula);

    const structureEl = document.createElement('div');
    structureEl.className = 'structure-diagram';

    // 量词层
    const quantifierLayer = document.createElement('div');
    quantifierLayer.className = 'diagram-layer quantifier-layer';
    quantifierLayer.innerHTML = '<div class="layer-title">量词前缀</div>';

    const quantifierBoxes = document.createElement('div');
    quantifierBoxes.className = 'quantifier-boxes';

    quantifiers.forEach((q, idx) => {
        const box = document.createElement('div');
        box.className = `quantifier-box ${q.type === '∀' ? 'universal' : 'existential'}`;
        box.innerHTML = `
            <div class="q-symbol">${q.type}</div>
            <div class="q-variable">${q.variable}</div>
        `;
        quantifierBoxes.appendChild(box);

        setTimeout(() => box.classList.add('visible'), idx * 200);
    });

    quantifierLayer.appendChild(quantifierBoxes);
    structureEl.appendChild(quantifierLayer);

    // 箭头
    const arrow = document.createElement('div');
    arrow.className = 'layer-arrow';
    arrow.textContent = '⬇';
    structureEl.appendChild(arrow);

    // 矩阵层
    const matrixLayer = document.createElement('div');
    matrixLayer.className = 'diagram-layer matrix-layer';
    matrixLayer.innerHTML = `
        <div class="layer-title">无量词矩阵</div>
        <div class="matrix-box">
            ${lastStep.formula.replace(/[∀∃][a-z]\s*/g, '').trim()}
        </div>
    `;
    structureEl.appendChild(matrixLayer);

    structureVisualization.appendChild(structureEl);
    setTimeout(() => structureEl.classList.add('visible'), 10);
}

// 渲染哲学解读
async function renderPhilosophy(caseData) {
    philosophyContent.innerHTML = '';

    statusText.textContent = '正在生成思政解读...';
    await sleep(getDelay());

    const philEl = document.createElement('div');
    philEl.className = 'philosophy-card';

    philEl.innerHTML = `
        <div class="phil-header">
            <span class="phil-icon">💭</span>
            <h3>${caseData.theme}</h3>
        </div>
        <div class="phil-body">
            <p class="phil-text">${caseData.philosophy}</p>
        </div>
        <div class="phil-footer">
            <div class="phil-tags">
                <span class="phil-tag">马克思主义哲学</span>
                <span class="phil-tag">辩证法</span>
                <span class="phil-tag">${caseData.theme}</span>
            </div>
        </div>
    `;

    philosophyContent.appendChild(philEl);
    setTimeout(() => philEl.classList.add('visible'), 10);
}

// 主流程
async function startConversion() {
    if (isRunning) return;

    isRunning = true;
    shouldStop = false;
    startBtn.disabled = true;
    caseSelect.disabled = true;

    try {
        // 获取案例
        let caseData;
        if (caseSelect.value === 'custom') {
            const formula = customFormula.value.trim();
            if (!formula) {
                alert('请输入公式!');
                resetConversion();
                return;
            }

            // 简单的自定义转换(演示用)
            caseData = {
                formula: formula,
                name: '自定义公式转换',
                type: targetFormType,
                description: '用户自定义的谓词公式',
                context: '自定义转换',
                philosophy: '通过前束范式转换,我们将复杂的逻辑结构规范化,使其更易于分析和理解。',
                theme: '逻辑规范',
                steps: [
                    { desc: '原始公式', formula: formula },
                    { desc: '转换为前束范式', formula: formula }
                ]
            };
        } else {
            caseData = CASES[parseInt(caseSelect.value)];
        }

        currentCase = caseData;

        // 渲染原始公式
        renderOriginalFormula(caseData);
        await sleep(500);

        // 转换步骤
        await renderConversionSteps(caseData.steps);
        await sleep(300);

        if (!shouldStop) {
            // 最终结果
            await renderFinalResult(caseData);
            await sleep(300);

            // 结构可视化
            await renderStructureVisualization(caseData);
            await sleep(300);

            // 哲学解读
            await renderPhilosophy(caseData);

            statusText.textContent = '转换完成!';
        }

    } catch (error) {
        console.error('转换错误:', error);
        statusText.textContent = '转换出错: ' + error.message;
    }

    isRunning = false;
    startBtn.disabled = false;
    caseSelect.disabled = false;
}

function resetConversion() {
    shouldStop = true;
    isRunning = false;

    originalFormula.innerHTML = '';
    conversionSteps.innerHTML = '';
    finalResult.innerHTML = '';
    structureVisualization.innerHTML = '';
    philosophyContent.innerHTML = '';

    stepCount.textContent = '0';
    quantifierCount.textContent = '0';
    statusText.textContent = '准备转换';

    startBtn.disabled = false;
    caseSelect.disabled = false;
}

// 事件监听
caseSelect.addEventListener('change', () => {
    if (caseSelect.value === 'custom') {
        customInputGroup.style.display = 'flex';
    } else {
        customInputGroup.style.display = 'none';
    }
    resetConversion();
});

document.querySelectorAll('.form-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.form-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        targetFormType = e.currentTarget.dataset.type;
        resetConversion();
    });
});

startBtn.addEventListener('click', startConversion);
resetBtn.addEventListener('click', resetConversion);

// 初始化
window.addEventListener('load', () => {
    currentCase = CASES[0];
    renderOriginalFormula(currentCase);
});
