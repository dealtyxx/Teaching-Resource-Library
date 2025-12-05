/**
 * Inference Rules System
 * 谓词逻辑推理规则系统 - US, ES, EG, UG
 */

// DOM Elements
const caseSelect = document.getElementById('caseSelect');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const stepCount = document.getElementById('stepCount');
const ruleCount = document.getElementById('ruleCount');
const currentCase = document.getElementById('currentCase');
const inferenceSteps = document.getElementById('inferenceSteps');
const inferenceDiagram = document.getElementById('inferenceDiagram');
const conclusionDisplay = document.getElementById('conclusionDisplay');
const philosophyPanel = document.getElementById('philosophyPanel');

// 思政主题推理案例
const CASES = [
    {
        name: "为人民服务 - US规则应用",
        rule: "US",
        premise: "∀x(党员(x) → 为人民服务(x))",
        conclusion: "党员(张三) → 为人民服务(张三)",
        context: "中国共产党的根本宗旨是全心全意为人民服务",
        steps: [
            {
                num: 1,
                statement: "∀x(党员(x) → 为人民服务(x))",
                justification: "前提(普遍原则)",
                rule: null
            },
            {
                num: 2,
                statement: "党员(张三) → 为人民服务(张三)",
                justification: "US规则,将x实例化为张三",
                rule: "US"
            }
        ],
        philosophy: "这个推理体现了从普遍原则到具体实践的过程。'为人民服务'是中国共产党的根本宗旨,适用于每一位党员。通过US规则,我们将这个普遍真理应用到具体的个体(张三)身上。这启示我们:理论的生命力在于指导实践,普遍原则必须落实到每个人的具体行动中。毛泽东同志指出'全心全意为人民服务',就是要求每个共产党员都身体力行这一宗旨。",
        theme: "理论与实践",
        diagram: {
            type: "downward",
            nodes: [
                { level: 0, text: "∀x(党员(x) → 为人民服务(x))", label: "普遍原则" },
                { level: 1, text: "党员(张三) → 为人民服务(张三)", label: "具体实践" }
            ]
        }
    },
    {
        name: "英雄榜样 - ES规则应用",
        rule: "ES",
        premise: "∃x(英雄(x) ∧ 奉献(x))",
        conclusion: "英雄(雷锋) ∧ 奉献(雷锋)",
        context: "中华民族涌现出无数英雄人物",
        steps: [
            {
                num: 1,
                statement: "∃x(英雄(x) ∧ 奉献(x))",
                justification: "前提(存在性断言)",
                rule: null
            },
            {
                num: 2,
                statement: "英雄(雷锋) ∧ 奉献(雷锋)",
                justification: "ES规则,引入特殊常量'雷锋'",
                rule: "ES"
            }
        ],
        philosophy: "这个推理体现了从抽象存在到具体榜样的过程。我们知道'存在英雄',但这是抽象的;通过ES规则,我们引入具体的英雄人物——雷锋,使抽象概念具象化。习近平总书记强调'崇尚英雄才会产生英雄,争做英雄才能英雄辈出'。这个推理告诉我们:理想不是空洞的,每个时代都有具体的英雄榜样;学习英雄,就要从学习具体的英雄事迹开始,让抽象的英雄主义精神在具体人物身上闪光。",
        theme: "榜样的力量",
        diagram: {
            type: "downward",
            nodes: [
                { level: 0, text: "∃x(英雄(x) ∧ 奉献(x))", label: "抽象存在" },
                { level: 1, text: "英雄(雷锋) ∧ 奉献(雷锋)", label: "具体榜样" }
            ]
        }
    },
    {
        name: "个人奋斗 - EG规则应用",
        rule: "EG",
        premise: "奋斗(李明) ∧ 成功(李明)",
        conclusion: "∃x(奋斗(x) ∧ 成功(x))",
        context: "个人的成功证明了成功的可能性",
        steps: [
            {
                num: 1,
                statement: "奋斗(李明) ∧ 成功(李明)",
                justification: "前提(个案事实)",
                rule: null
            },
            {
                num: 2,
                statement: "∃x(奋斗(x) ∧ 成功(x))",
                justification: "EG规则,从个案推广到存在",
                rule: "EG"
            }
        ],
        philosophy: "这个推理体现了从个别到一般的认识过程。李明通过奋斗获得成功,这是一个具体的事实;通过EG规则,我们得出'存在通过奋斗获得成功的人'这一普遍结论。这体现了马克思主义认识论:认识始于个别,但不止于个别,而要上升到一般。习近平总书记说'幸福都是奋斗出来的',无数个人的成功案例证明了这一真理。每个成功者的故事,都为后来者提供了可能性的证明,激励更多人通过奋斗改变命运。",
        theme: "个别与一般",
        diagram: {
            type: "upward",
            nodes: [
                { level: 1, text: "奋斗(李明) ∧ 成功(李明)", label: "个案事实" },
                { level: 0, text: "∃x(奋斗(x) ∧ 成功(x))", label: "存在命题" }
            ]
        }
    },
    {
        name: "普遍真理 - UG规则应用",
        rule: "UG",
        premise: "学习(x₀) → 进步(x₀) [x₀任意]",
        conclusion: "∀x(学习(x) → 进步(x))",
        context: "从任意个体验证到普遍规律",
        steps: [
            {
                num: 1,
                statement: "设x₀为任意个体",
                justification: "引入任意元素",
                rule: null
            },
            {
                num: 2,
                statement: "学习(x₀) → 进步(x₀)",
                justification: "对x₀成立(经验证)",
                rule: null
            },
            {
                num: 3,
                statement: "∀x(学习(x) → 进步(x))",
                justification: "UG规则,x₀是任意的",
                rule: "UG"
            }
        ],
        philosophy: "这个推理体现了科学规律的形成过程。我们对任意一个人验证:如果学习,就会进步。由于验证对象是任意选取的,不依赖于特殊性质,因此可以推广到所有人。这体现了实践是检验真理的唯一标准:一个命题,只有对任意个体都成立,才能上升为普遍规律。毛泽东同志在《实践论》中指出:'通过实践而发现真理,又通过实践而证实真理'。这个推理告诉我们:真理不是臆想,而是经过反复验证的普遍规律。",
        theme: "实践与真理",
        diagram: {
            type: "upward",
            nodes: [
                { level: 1, text: "学习(x₀) → 进步(x₀)", label: "任意个体" },
                { level: 0, text: "∀x(学习(x) → 进步(x))", label: "普遍规律" }
            ]
        }
    },
    {
        name: "完整推理链 - 综合应用",
        rule: "ALL",
        premise: "∀x(青年(x) → 有理想(x)), 青年(小王)",
        conclusion: "∃x 有理想(x)",
        context: "综合运用US和EG规则",
        steps: [
            {
                num: 1,
                statement: "∀x(青年(x) → 有理想(x))",
                justification: "前提1(普遍原则)",
                rule: null
            },
            {
                num: 2,
                statement: "青年(小王)",
                justification: "前提2(个案事实)",
                rule: null
            },
            {
                num: 3,
                statement: "青年(小王) → 有理想(小王)",
                justification: "US规则,从1实例化",
                rule: "US"
            },
            {
                num: 4,
                statement: "有理想(小王)",
                justification: "假言推理,由2和3",
                rule: "MP"
            },
            {
                num: 5,
                statement: "∃x 有理想(x)",
                justification: "EG规则,从4概括",
                rule: "EG"
            }
        ],
        philosophy: "这个完整推理链展示了理论指导实践、实践验证理论的完整过程。首先,我们有普遍原则'所有青年都有理想'(全称命题);然后,我们识别出小王是青年(个案);通过US规则,我们将普遍原则应用到小王身上;通过逻辑推理,得出小王有理想;最后通过EG规则,从小王这个具体例子上升到'存在有理想的人'。这体现了辩证唯物主义的认识过程:从一般到个别,再从个别回到一般,螺旋上升,不断深化。习近平总书记对青年寄语'立鸿鹄志,做奋斗者',每个有理想的青年,都在用行动证明这一真理。",
        theme: "认识的螺旋上升",
        diagram: {
            type: "complex",
            nodes: [
                { level: 0, text: "∀x(青年(x) → 有理想(x))", label: "普遍原则", pos: "left" },
                { level: 0, text: "青年(小王)", label: "个案事实", pos: "right" },
                { level: 1, text: "青年(小王) → 有理想(小王)", label: "US应用", pos: "center" },
                { level: 2, text: "有理想(小王)", label: "推理结论", pos: "center" },
                { level: 3, text: "∃x 有理想(x)", label: "EG概括", pos: "center" }
            ]
        }
    }
];

// State
let currentCaseData = null;
let selectedRule = 'US';
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

// 渲染当前案例
function renderCurrentCase(caseData) {
    currentCase.innerHTML = `
        <div class="case-card">
            <div class="case-title">
                <h3>${caseData.name}</h3>
                <span class="case-rule-badge ${caseData.rule.toLowerCase()}">${caseData.rule}</span>
            </div>
            <div class="case-content">
                <div class="case-item premise">
                    <div class="item-label">前提:</div>
                    <div class="item-value">${caseData.premise}</div>
                </div>
                <div class="inference-arrow">⟹</div>
                <div class="case-item conclusion">
                    <div class="item-label">结论:</div>
                    <div class="item-value">${caseData.conclusion}</div>
                </div>
            </div>
            <div class="case-context">
                <strong>背景:</strong> ${caseData.context}
            </div>
        </div>
    `;
}

// 渲染推理步骤
async function renderInferenceSteps(steps) {
    inferenceSteps.innerHTML = '';

    statusText.textContent = '正在执行推理步骤...';

    const usedRules = new Set();

    for (let i = 0; i < steps.length; i++) {
        if (shouldStop) break;

        const step = steps[i];
        await sleep(getDelay());

        const stepEl = document.createElement('div');
        stepEl.className = 'inference-step';

        if (step.rule) {
            usedRules.add(step.rule);
        }

        stepEl.innerHTML = `
            <div class="step-num">${step.num}</div>
            <div class="step-content">
                <div class="step-statement">${step.statement}</div>
                <div class="step-justification">
                    ${step.justification}
                    ${step.rule ? `<span class="rule-tag ${step.rule.toLowerCase()}">${step.rule}</span>` : ''}
                </div>
            </div>
        `;

        inferenceSteps.appendChild(stepEl);

        setTimeout(() => stepEl.classList.add('visible'), 10);

        stepCount.textContent = i + 1;
        ruleCount.textContent = usedRules.size;
    }
}

// 渲染推理图示
async function renderInferenceDiagram(diagram) {
    inferenceDiagram.innerHTML = '';

    statusText.textContent = '正在构建推理图...';
    await sleep(getDelay());

    const diagramEl = document.createElement('div');
    diagramEl.className = `diagram-flow ${diagram.type}`;

    if (diagram.type === 'complex') {
        // 复杂图示(多个前提)
        const levels = {};
        diagram.nodes.forEach(node => {
            if (!levels[node.level]) levels[node.level] = [];
            levels[node.level].push(node);
        });

        Object.keys(levels).sort().forEach(level => {
            const levelEl = document.createElement('div');
            levelEl.className = 'diagram-level';

            levels[level].forEach(node => {
                const nodeEl = document.createElement('div');
                nodeEl.className = `diagram-node ${node.pos || 'center'}`;
                nodeEl.innerHTML = `
                    <div class="node-content">${node.text}</div>
                    <div class="node-label">${node.label}</div>
                `;
                levelEl.appendChild(nodeEl);
            });

            diagramEl.appendChild(levelEl);

            if (parseInt(level) < Object.keys(levels).length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'diagram-arrow';
                arrow.textContent = '⬇';
                diagramEl.appendChild(arrow);
            }
        });

    } else {
        // 简单图示(单一推理链)
        diagram.nodes.forEach((node, idx) => {
            const nodeEl = document.createElement('div');
            nodeEl.className = 'diagram-node';
            nodeEl.innerHTML = `
                <div class="node-content">${node.text}</div>
                <div class="node-label">${node.label}</div>
            `;
            diagramEl.appendChild(nodeEl);

            setTimeout(() => nodeEl.classList.add('visible'), idx * 300);

            if (idx < diagram.nodes.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'diagram-arrow';
                arrow.textContent = diagram.type === 'upward' ? '⬆' : '⬇';
                diagramEl.appendChild(arrow);
            }
        });
    }

    inferenceDiagram.appendChild(diagramEl);
    setTimeout(() => diagramEl.classList.add('visible'), 10);
}

// 渲染结论
async function renderConclusion(caseData) {
    conclusionDisplay.innerHTML = '';

    statusText.textContent = '正在生成推理结论...';
    await sleep(getDelay());

    const conclusionEl = document.createElement('div');
    conclusionEl.className = 'conclusion-card';

    conclusionEl.innerHTML = `
        <div class="conclusion-header">
            <span class="conclusion-icon">✓</span>
            <h3>推理有效</h3>
        </div>
        <div class="conclusion-body">
            <div class="conclusion-formula">
                ${caseData.conclusion}
            </div>
            <div class="conclusion-explanation">
                <p>通过 <strong>${caseData.rule}</strong> 规则,我们成功从前提推导出结论。</p>
                <p>该推理过程遵循了谓词逻辑的形式规则,结论必然为真。</p>
            </div>
            <div class="conclusion-validity">
                <div class="validity-badge">✓ 形式有效</div>
                <div class="validity-badge">✓ 逻辑严密</div>
                <div class="validity-badge">✓ 结论可靠</div>
            </div>
        </div>
    `;

    conclusionDisplay.appendChild(conclusionEl);
    setTimeout(() => conclusionEl.classList.add('visible'), 10);
}

// 渲染哲学解读
async function renderPhilosophy(caseData) {
    philosophyPanel.innerHTML = '';

    statusText.textContent = '正在生成思政解读...';
    await sleep(getDelay());

    const philEl = document.createElement('div');
    philEl.className = 'philosophy-panel-content';

    philEl.innerHTML = `
        <div class="phil-header">
            <span class="phil-icon">📚</span>
            <h3>${caseData.theme}</h3>
        </div>
        <div class="phil-body">
            <p class="phil-text">${caseData.philosophy}</p>
        </div>
        <div class="phil-footer">
            <div class="phil-tags">
                <span class="phil-tag">马克思主义认识论</span>
                <span class="phil-tag">辩证法</span>
                <span class="phil-tag">${caseData.theme}</span>
            </div>
        </div>
    `;

    philosophyPanel.appendChild(philEl);
    setTimeout(() => philEl.classList.add('visible'), 10);
}

// 主流程
async function startInference() {
    if (isRunning) return;

    isRunning = true;
    shouldStop = false;
    startBtn.disabled = true;
    caseSelect.disabled = true;

    try {
        const caseData = CASES[parseInt(caseSelect.value)];
        currentCaseData = caseData;

        // 渲染案例
        renderCurrentCase(caseData);
        await sleep(500);

        // 推理步骤
        await renderInferenceSteps(caseData.steps);
        await sleep(300);

        if (!shouldStop) {
            // 推理图示
            await renderInferenceDiagram(caseData.diagram);
            await sleep(300);

            // 结论
            await renderConclusion(caseData);
            await sleep(300);

            // 哲学解读
            await renderPhilosophy(caseData);

            statusText.textContent = '推理完成!';
        }

    } catch (error) {
        console.error('推理错误:', error);
        statusText.textContent = '推理出错: ' + error.message;
    }

    isRunning = false;
    startBtn.disabled = false;
    caseSelect.disabled = false;
}

function resetInference() {
    shouldStop = true;
    isRunning = false;

    currentCase.innerHTML = '';
    inferenceSteps.innerHTML = '';
    inferenceDiagram.innerHTML = '';
    conclusionDisplay.innerHTML = '';
    philosophyPanel.innerHTML = '';

    stepCount.textContent = '0';
    ruleCount.textContent = '0';
    statusText.textContent = '准备推理';

    startBtn.disabled = false;
    caseSelect.disabled = false;
}

// 事件监听
caseSelect.addEventListener('change', () => {
    resetInference();
});

document.querySelectorAll('.rule-type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.rule-type-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        selectedRule = e.currentTarget.dataset.rule;
    });
});

startBtn.addEventListener('click', startInference);
resetBtn.addEventListener('click', resetInference);

// 初始化
window.addEventListener('load', () => {
    currentCaseData = CASES[0];
    renderCurrentCase(currentCaseData);
});
