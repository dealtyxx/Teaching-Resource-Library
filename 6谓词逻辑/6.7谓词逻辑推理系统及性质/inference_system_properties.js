// ============================================
// 全局状态管理
// ============================================
let currentProperty = 'soundness';
let currentCaseIndex = 0;
let animationSpeed = 800;
let isAnimating = false;

// ============================================
// 案例数据 - 融入丰富思政元素
// ============================================
const CASES = [
    {
        property: 'soundness',
        name: '理论与实践的统一 - 可靠性体现',
        description: '马克思主义理论的可靠性在于它能够正确指导实践',

        context: {
            theory: '马克思主义基本原理',
            axioms: [
                '生产力决定生产关系',
                '经济基础决定上层建筑',
                '人民群众是历史的创造者'
            ],
            rules: [
                '辩证唯物主义',
                '历史唯物主义',
                '实践检验真理'
            ]
        },

        proofSteps: [
            {
                num: 1,
                statement: '理论前提:中国特色社会主义理论体系',
                type: 'axiom',
                justification: '基本理论公理'
            },
            {
                num: 2,
                statement: '推理规则:实践是检验真理的唯一标准',
                type: 'rule',
                justification: '推理规则应用'
            },
            {
                num: 3,
                statement: '推导结论:改革开放政策符合国情',
                type: 'inference',
                justification: '理论推导'
            },
            {
                num: 4,
                statement: '实践验证:40余年经济社会发展成就',
                type: 'verification',
                justification: '语义为真 ⊨'
            }
        ],

        soundnessCheck: {
            provable: '⊢ 改革开放符合中国国情',
            valid: '⊨ 改革开放符合中国国情',
            conclusion: '理论可证(⊢) ⇒ 实践为真(⊨)',
            result: '✓ 系统可靠'
        },

        philosophy: '可靠性要求理论必须经得起实践检验。马克思主义中国化的过程,就是不断确保理论可靠性的过程。我们的每一个重大决策,都必须建立在科学理论基础上,确保"能证明的必然正确"。这体现了我们党实事求是、理论联系实际的优良传统。'
    },

    {
        property: 'consistency',
        name: '思想统一与方向一致 - 一致性原则',
        description: '党的理论体系的一致性确保不会出现自相矛盾',

        context: {
            theory: '新时代中国特色社会主义思想',
            principles: [
                '坚持党的全面领导',
                '坚持以人民为中心',
                '坚持全面深化改革',
                '坚持新发展理念'
            ]
        },

        consistencyTests: [
            {
                test: '党的领导 vs 人民当家作主',
                statement1: '坚持党的领导',
                statement2: '坚持人民当家作主',
                analysis: '两者统一于社会主义民主政治',
                result: '✓ 不矛盾'
            },
            {
                test: '市场经济 vs 社会主义制度',
                statement1: '发挥市场决定性作用',
                statement2: '坚持社会主义制度',
                analysis: '社会主义市场经济有机结合',
                result: '✓ 不矛盾'
            },
            {
                test: '效率 vs 公平',
                statement1: '提高经济效率',
                statement2: '实现共同富裕',
                analysis: '效率与公平的辩证统一',
                result: '✓ 不矛盾'
            }
        ],

        consistencyCheck: {
            formula: '¬(⊢ φ ∧ ⊢ ¬φ)',
            explanation: '理论体系内不存在命题φ和其否定¬φ同时可证',
            conclusion: '思想理论体系保持高度一致性',
            result: '✓ 系统一致'
        },

        philosophy: '一致性确保理论体系内部不会产生矛盾。中国特色社会主义理论体系的一致性,体现在各项方针政策的协调统一上。"五位一体"总体布局、"四个全面"战略布局,都是相互支撑、有机统一的整体,不会出现自相矛盾的情况。这种一致性是我们制度优势的重要体现。'
    },

    {
        property: 'completeness',
        name: '全面发展与真理追求 - 完备性目标',
        description: '全面建设社会主义现代化国家需要理论的完备性',

        context: {
            theory: '社会主义现代化理论',
            dimensions: [
                '物质文明',
                '政治文明',
                '精神文明',
                '社会文明',
                '生态文明'
            ]
        },

        completenessAspects: [
            {
                aspect: '经济建设',
                valid: '⊨ 高质量发展是真理',
                provable: '⊢ 高质量发展可证明',
                status: '✓ 完备'
            },
            {
                aspect: '政治建设',
                valid: '⊨ 全过程民主是真理',
                provable: '⊢ 全过程民主可证明',
                status: '✓ 完备'
            },
            {
                aspect: '文化建设',
                valid: '⊨ 文化自信是真理',
                provable: '⊢ 文化自信可证明',
                status: '✓ 完备'
            },
            {
                aspect: '社会建设',
                valid: '⊨ 共同富裕是真理',
                provable: '⊢ 共同富裕可证明',
                status: '✓ 完备'
            },
            {
                aspect: '生态建设',
                valid: '⊨ 绿色发展是真理',
                provable: '⊢ 绿色发展可证明',
                status: '✓ 完备'
            }
        ],

        completenessCheck: {
            formula: '⊨ φ → ⊢ φ',
            explanation: '凡是符合客观规律的真理,都能在理论体系中找到支撑',
            conclusion: '理论体系具备完备性,全面覆盖发展需要',
            result: '✓ 趋向完备'
        },

        philosophy: '完备性追求理论对真理的全面把握。"五位一体"总体布局体现了我们对社会主义建设规律认识的完备性——凡是客观上正确的发展方向,都能在理论体系中找到依据。但我们也认识到,理论的完备性是相对的,需要在实践中不断丰富和发展。'
    },

    {
        property: 'godel',
        name: '实践检验与认识局限 - 哥德尔定理的启示',
        description: '哥德尔不完全定理揭示了理论认识的边界与实践的重要性',

        context: {
            theory: '认识论与实践论',
            godelInsight: '任何足够强大的形式系统,如果是一致的,就必然是不完备的'
        },

        godelTheorems: [
            {
                theorem: '第一不完全定理',
                statement: '存在真命题无法在系统内证明',
                formula: '∃φ (⊨ φ ∧ ⊬ φ)',
                interpretation: '理论认识存在局限性'
            },
            {
                theorem: '第二不完全定理',
                statement: '系统无法证明自身的一致性',
                formula: '⊬ Con(系统)',
                interpretation: '需要实践检验理论'
            }
        ],

        practicalExamples: [
            {
                situation: '改革开放初期',
                theoreticalLimit: '传统理论无法完全解释市场经济',
                practiceDiscovery: '实践中发现社会主义可以搞市场经济',
                breakthrough: '理论突破:社会主义市场经济理论',
                lesson: '实践突破了原有理论的局限'
            },
            {
                situation: '精准扶贫',
                theoreticalLimit: '传统扶贫理论难以解决深度贫困',
                practiceDiscovery: '实践中创新精准识别、精准施策',
                breakthrough: '理论突破:精准扶贫思想',
                lesson: '实践是理论创新的源泉'
            },
            {
                situation: '生态文明建设',
                theoreticalLimit: '传统发展观难以平衡发展与保护',
                practiceDiscovery: '实践中探索"两山"理论',
                breakthrough: '理论突破:绿水青山就是金山银山',
                lesson: '实践拓展了理论边界'
            }
        ],

        dialecticalUnderstanding: {
            limitation: '认识的局限性',
            points: [
                '理论不可能穷尽所有真理',
                '总有新问题超出现有理论范围',
                '认识具有历史阶段性'
            ],
            solution: '实践的决定性',
            practices: [
                '实践是认识的来源',
                '实践是检验真理的标准',
                '实践推动理论不断发展'
            ]
        },

        philosophy: '哥德尔不完全定理从数理逻辑角度证明了:任何形式系统都有其局限性。这与马克思主义认识论高度契合——我们的理论认识总是有限的,总会遇到无法在现有框架内解决的新问题。这正说明了"实践是检验真理的唯一标准"的深刻性。我们要保持理论谦逊,勇于实践创新,在实践中不断突破认识局限,丰富和发展理论。解放思想、实事求是、与时俱进,就是对哥德尔定理的最好回应。'
    }
];

// ============================================
// 工具函数
// ============================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'none';
        const content = section.querySelector('[id$="Content"]');
        if (content) content.innerHTML = '';
    }
}

function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    }
}

// ============================================
// 渲染案例内容
// ============================================
async function renderCaseDisplay(caseData) {
    const container = document.getElementById('caseContent');
    container.innerHTML = '';

    // 案例描述
    const descCard = document.createElement('div');
    descCard.className = 'case-description';
    descCard.innerHTML = `
        <div class="desc-icon">📚</div>
        <p>${caseData.description}</p>
    `;
    container.appendChild(descCard);
    await sleep(animationSpeed * 0.5);

    // 理论背景
    const contextCard = document.createElement('div');
    contextCard.className = 'case-context';

    if (caseData.property === 'soundness') {
        contextCard.innerHTML = `
            <h3>理论体系: ${caseData.context.theory}</h3>
            <div class="context-grid">
                <div class="context-col">
                    <h4>基本公理</h4>
                    ${caseData.context.axioms.map(ax => `<div class="axiom-item">• ${ax}</div>`).join('')}
                </div>
                <div class="context-col">
                    <h4>推理规则</h4>
                    ${caseData.context.rules.map(rule => `<div class="rule-item">• ${rule}</div>`).join('')}
                </div>
            </div>
        `;
    } else if (caseData.property === 'consistency') {
        contextCard.innerHTML = `
            <h3>理论体系: ${caseData.context.theory}</h3>
            <div class="principles-list">
                ${caseData.context.principles.map(p => `<div class="principle-item">✓ ${p}</div>`).join('')}
            </div>
        `;
    } else if (caseData.property === 'completeness') {
        contextCard.innerHTML = `
            <h3>理论体系: ${caseData.context.theory}</h3>
            <div class="dimensions-grid">
                ${caseData.context.dimensions.map(dim => `
                    <div class="dimension-badge">${dim}</div>
                `).join('')}
            </div>
        `;
    } else if (caseData.property === 'godel') {
        contextCard.innerHTML = `
            <h3>理论体系: ${caseData.context.theory}</h3>
            <div class="godel-insight">
                <div class="insight-icon">💡</div>
                <p>${caseData.context.godelInsight}</p>
            </div>
        `;
    }

    container.appendChild(contextCard);
    await sleep(animationSpeed * 0.5);
}

// ============================================
// 渲染验证过程
// ============================================
async function renderVerificationProcess(caseData) {
    const container = document.getElementById('verificationSteps');
    container.innerHTML = '';

    if (caseData.property === 'soundness') {
        // 可靠性验证步骤
        for (let i = 0; i < caseData.proofSteps.length; i++) {
            const step = caseData.proofSteps[i];
            const stepDiv = document.createElement('div');
            stepDiv.className = `verification-step step-${step.type}`;
            stepDiv.style.animationDelay = `${i * 0.1}s`;
            stepDiv.innerHTML = `
                <div class="step-number">${step.num}</div>
                <div class="step-content">
                    <div class="step-statement">${step.statement}</div>
                    <div class="step-justification">${step.justification}</div>
                </div>
                <div class="step-type-badge">${step.type}</div>
            `;
            container.appendChild(stepDiv);
            await sleep(animationSpeed);
        }

        // 可靠性检查结果
        const checkDiv = document.createElement('div');
        checkDiv.className = 'soundness-check-result';
        checkDiv.innerHTML = `
            <div class="check-row">
                <span class="check-label">理论可证:</span>
                <span class="check-formula">${caseData.soundnessCheck.provable}</span>
            </div>
            <div class="check-arrow">⇓</div>
            <div class="check-row">
                <span class="check-label">实践为真:</span>
                <span class="check-formula">${caseData.soundnessCheck.valid}</span>
            </div>
            <div class="check-conclusion">${caseData.soundnessCheck.conclusion}</div>
            <div class="check-result">${caseData.soundnessCheck.result}</div>
        `;
        container.appendChild(checkDiv);
        await sleep(animationSpeed);

    } else if (caseData.property === 'consistency') {
        // 一致性测试
        for (let i = 0; i < caseData.consistencyTests.length; i++) {
            const test = caseData.consistencyTests[i];
            const testDiv = document.createElement('div');
            testDiv.className = 'consistency-test';
            testDiv.style.animationDelay = `${i * 0.1}s`;
            testDiv.innerHTML = `
                <h4>${test.test}</h4>
                <div class="test-statements">
                    <div class="statement-box stmt-a">
                        <div class="stmt-label">命题 A:</div>
                        <div class="stmt-text">${test.statement1}</div>
                    </div>
                    <div class="vs-symbol">vs</div>
                    <div class="statement-box stmt-b">
                        <div class="stmt-label">命题 B:</div>
                        <div class="stmt-text">${test.statement2}</div>
                    </div>
                </div>
                <div class="test-analysis">
                    <strong>分析:</strong> ${test.analysis}
                </div>
                <div class="test-result">${test.result}</div>
            `;
            container.appendChild(testDiv);
            await sleep(animationSpeed);
        }

        // 一致性检查结果
        const checkDiv = document.createElement('div');
        checkDiv.className = 'consistency-check-result';
        checkDiv.innerHTML = `
            <div class="check-formula-large">${caseData.consistencyCheck.formula}</div>
            <div class="check-explanation">${caseData.consistencyCheck.explanation}</div>
            <div class="check-conclusion">${caseData.consistencyCheck.conclusion}</div>
            <div class="check-result">${caseData.consistencyCheck.result}</div>
        `;
        container.appendChild(checkDiv);
        await sleep(animationSpeed);

    } else if (caseData.property === 'completeness') {
        // 完备性检验
        for (let i = 0; i < caseData.completenessAspects.length; i++) {
            const aspect = caseData.completenessAspects[i];
            const aspectDiv = document.createElement('div');
            aspectDiv.className = 'completeness-aspect';
            aspectDiv.style.animationDelay = `${i * 0.1}s`;
            aspectDiv.innerHTML = `
                <div class="aspect-header">${aspect.aspect}</div>
                <div class="aspect-checks">
                    <div class="check-item">
                        <span class="check-icon">⊨</span>
                        <span class="check-text">${aspect.valid}</span>
                    </div>
                    <div class="check-arrow-down">⇓</div>
                    <div class="check-item">
                        <span class="check-icon">⊢</span>
                        <span class="check-text">${aspect.provable}</span>
                    </div>
                </div>
                <div class="aspect-status">${aspect.status}</div>
            `;
            container.appendChild(aspectDiv);
            await sleep(animationSpeed * 0.8);
        }

        // 完备性检查结果
        const checkDiv = document.createElement('div');
        checkDiv.className = 'completeness-check-result';
        checkDiv.innerHTML = `
            <div class="check-formula-large">${caseData.completenessCheck.formula}</div>
            <div class="check-explanation">${caseData.completenessCheck.explanation}</div>
            <div class="check-conclusion">${caseData.completenessCheck.conclusion}</div>
            <div class="check-result">${caseData.completenessCheck.result}</div>
        `;
        container.appendChild(checkDiv);
        await sleep(animationSpeed);

    } else if (caseData.property === 'godel') {
        // 哥德尔定理展示
        for (let i = 0; i < caseData.godelTheorems.length; i++) {
            const theorem = caseData.godelTheorems[i];
            const theoremDiv = document.createElement('div');
            theoremDiv.className = 'godel-theorem';
            theoremDiv.style.animationDelay = `${i * 0.1}s`;
            theoremDiv.innerHTML = `
                <h4>${theorem.theorem}</h4>
                <div class="theorem-statement">${theorem.statement}</div>
                <div class="theorem-formula">${theorem.formula}</div>
                <div class="theorem-interpretation">
                    <strong>哲学解释:</strong> ${theorem.interpretation}
                </div>
            `;
            container.appendChild(theoremDiv);
            await sleep(animationSpeed);
        }
    }
}

// ============================================
// 渲染可视化图示
// ============================================
async function renderVisualDiagram(caseData) {
    const container = document.getElementById('diagramContent');
    container.innerHTML = '';

    if (caseData.property === 'soundness') {
        // 可靠性图示
        const diagram = document.createElement('div');
        diagram.className = 'soundness-diagram';
        diagram.innerHTML = `
            <div class="diagram-flow">
                <div class="diagram-node theory-node">
                    <div class="node-label">理论层面</div>
                    <div class="node-content">⊢ φ<br/>可证明</div>
                </div>
                <div class="diagram-arrow">
                    <div class="arrow-label">可靠性保证</div>
                </div>
                <div class="diagram-node practice-node">
                    <div class="node-label">实践层面</div>
                    <div class="node-content">⊨ φ<br/>为真</div>
                </div>
            </div>
            <div class="diagram-explanation">
                理论推导的结论必然符合实践真理
            </div>
        `;
        container.appendChild(diagram);

    } else if (caseData.property === 'consistency') {
        // 一致性图示
        const diagram = document.createElement('div');
        diagram.className = 'consistency-diagram';
        diagram.innerHTML = `
            <div class="venn-container">
                <div class="venn-circle circle-provable">
                    <div class="circle-label">可证明命题集</div>
                </div>
                <div class="venn-circle circle-negation">
                    <div class="circle-label">其否定可证集</div>
                </div>
                <div class="venn-intersection">∅<br/>空集</div>
            </div>
            <div class="diagram-explanation">
                命题φ与其否定¬φ不可能同时被证明
            </div>
        `;
        container.appendChild(diagram);

    } else if (caseData.property === 'completeness') {
        // 完备性图示
        const diagram = document.createElement('div');
        diagram.className = 'completeness-diagram';
        diagram.innerHTML = `
            <div class="set-diagram">
                <div class="outer-set">
                    <div class="set-label">有效命题集 (⊨)</div>
                    <div class="inner-set">
                        <div class="set-label-inner">可证命题集 (⊢)</div>
                    </div>
                </div>
                <div class="set-relation">⊢ ⊆ ⊨ (可靠性)<br/>⊨ ⊆ ⊢ (完备性)</div>
            </div>
            <div class="diagram-explanation">
                完备系统:所有真理都能被证明
            </div>
        `;
        container.appendChild(diagram);

    } else if (caseData.property === 'godel') {
        // 哥德尔定理图示
        const diagram = document.createElement('div');
        diagram.className = 'godel-diagram';
        diagram.innerHTML = `
            <div class="godel-space">
                <div class="space-provable">
                    <div class="space-label">可证明</div>
                    <div class="space-content">⊢ φ</div>
                </div>
                <div class="space-undecidable">
                    <div class="space-label">不可判定</div>
                    <div class="space-content">⊬ φ ∧ ⊬ ¬φ</div>
                    <div class="space-note">存在真命题无法证明</div>
                </div>
                <div class="space-disprovable">
                    <div class="space-label">可证伪</div>
                    <div class="space-content">⊢ ¬φ</div>
                </div>
            </div>
            <div class="diagram-explanation">
                一致系统必然存在不可判定命题
            </div>
        `;
        container.appendChild(diagram);
    }

    await sleep(animationSpeed);
}

// ============================================
// 渲染结论
// ============================================
async function renderConclusion(caseData) {
    const container = document.getElementById('conclusionContent');
    container.innerHTML = '';

    if (caseData.property === 'godel') {
        // 哥德尔定理的实践案例
        const examplesDiv = document.createElement('div');
        examplesDiv.className = 'practical-examples';

        for (let i = 0; i < caseData.practicalExamples.length; i++) {
            const example = caseData.practicalExamples[i];
            const exampleDiv = document.createElement('div');
            exampleDiv.className = 'practice-example';
            exampleDiv.style.animationDelay = `${i * 0.1}s`;
            exampleDiv.innerHTML = `
                <h4>案例 ${i + 1}: ${example.situation}</h4>
                <div class="example-flow">
                    <div class="example-step limit-step">
                        <div class="step-label">理论局限</div>
                        <div class="step-text">${example.theoreticalLimit}</div>
                    </div>
                    <div class="example-arrow">→</div>
                    <div class="example-step practice-step">
                        <div class="step-label">实践发现</div>
                        <div class="step-text">${example.practiceDiscovery}</div>
                    </div>
                    <div class="example-arrow">→</div>
                    <div class="example-step breakthrough-step">
                        <div class="step-label">理论突破</div>
                        <div class="step-text">${example.breakthrough}</div>
                    </div>
                </div>
                <div class="example-lesson">
                    <strong>启示:</strong> ${example.lesson}
                </div>
            `;
            examplesDiv.appendChild(exampleDiv);
            await sleep(animationSpeed);
        }
        container.appendChild(examplesDiv);

        // 辩证理解
        const dialecticalDiv = document.createElement('div');
        dialecticalDiv.className = 'dialectical-understanding';
        dialecticalDiv.innerHTML = `
            <div class="understanding-grid">
                <div class="understanding-col">
                    <h4>${caseData.dialecticalUnderstanding.limitation}</h4>
                    ${caseData.dialecticalUnderstanding.points.map(p => `
                        <div class="point-item">• ${p}</div>
                    `).join('')}
                </div>
                <div class="understanding-arrow">⇌</div>
                <div class="understanding-col">
                    <h4>${caseData.dialecticalUnderstanding.solution}</h4>
                    ${caseData.dialecticalUnderstanding.practices.map(p => `
                        <div class="point-item">• ${p}</div>
                    `).join('')}
                </div>
            </div>
        `;
        container.appendChild(dialecticalDiv);
        await sleep(animationSpeed);

    } else {
        // 其他性质的结论
        const conclusionBox = document.createElement('div');
        conclusionBox.className = 'conclusion-box';
        conclusionBox.innerHTML = `
            <div class="conclusion-icon">✨</div>
            <div class="conclusion-text">
                <h3>性质验证完成</h3>
                <p>${caseData.name} 的分析展示了 ${
                    caseData.property === 'soundness' ? '可靠性' :
                    caseData.property === 'consistency' ? '一致性' :
                    '完备性'
                } 在实际中的重要意义。</p>
            </div>
        `;
        container.appendChild(conclusionBox);
        await sleep(animationSpeed * 0.5);
    }
}

// ============================================
// 渲染哲学解读
// ============================================
async function renderPhilosophy(caseData) {
    const container = document.getElementById('philosophyContent');
    container.innerHTML = '';

    const philosophyBox = document.createElement('div');
    philosophyBox.className = 'philosophy-box';
    philosophyBox.innerHTML = `
        <div class="philosophy-icon">🏛️</div>
        <div class="philosophy-text">${caseData.philosophy}</div>
    `;
    container.appendChild(philosophyBox);
    await sleep(animationSpeed * 0.5);
}

// ============================================
// 主演示流程
// ============================================
async function runInferenceDemo() {
    if (isAnimating) return;
    isAnimating = true;

    const caseData = CASES[currentCaseIndex];

    // 隐藏介绍,显示案例
    clearSection('propertiesIntro');

    // 1. 显示案例
    showSection('caseDisplay');
    document.getElementById('caseTitle').textContent = caseData.name;
    await renderCaseDisplay(caseData);

    // 2. 验证过程
    showSection('verificationProcess');
    await renderVerificationProcess(caseData);

    // 3. 可视化图示
    showSection('visualDiagram');
    await renderVisualDiagram(caseData);

    // 4. 结论
    showSection('conclusionSection');
    await renderConclusion(caseData);

    // 5. 哲学解读
    showSection('philosophySection');
    await renderPhilosophy(caseData);

    isAnimating = false;
}

// ============================================
// 重置函数
// ============================================
function resetVisualization() {
    isAnimating = false;

    // 清空所有section
    clearSection('caseDisplay');
    clearSection('verificationProcess');
    clearSection('visualDiagram');
    clearSection('conclusionSection');
    clearSection('philosophySection');

    // 显示介绍
    showSection('propertiesIntro');
}

// ============================================
// 事件监听器
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 性质按钮点击
    document.querySelectorAll('.property-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.property-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentProperty = btn.dataset.property;

            // 更新信息面板
            const propertyNames = {
                'soundness': '可靠性',
                'consistency': '一致性',
                'completeness': '完备性',
                'godel': '哥德尔定理'
            };

            const propertyInfos = {
                'soundness': '可靠性确保推理过程的正确性,正如实事求是的思想路线。',
                'consistency': '一致性保证理论体系内部不矛盾,如同思想统一的重要性。',
                'completeness': '完备性追求理论对真理的全面把握,体现全面发展理念。',
                'godel': '哥德尔定理揭示认识局限,强调实践是检验真理的唯一标准。'
            };

            document.getElementById('currentProperty').textContent = propertyNames[currentProperty];
            document.getElementById('propertyInfo').textContent = propertyInfos[currentProperty];

            // 更新案例选择器
            updateCaseSelector();
            resetVisualization();
        });
    });

    // 案例选择
    document.getElementById('caseSelector').addEventListener('change', (e) => {
        currentCaseIndex = parseInt(e.target.value);
        resetVisualization();
    });

    // 速度控制
    document.getElementById('speedControl').addEventListener('input', (e) => {
        animationSpeed = parseInt(e.target.value);
        document.getElementById('speedValue').textContent = animationSpeed + 'ms';
    });

    // 开始按钮
    document.getElementById('startBtn').addEventListener('click', () => {
        runInferenceDemo();
    });

    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', () => {
        resetVisualization();
    });

    // 初始化案例选择器
    updateCaseSelector();
});

// 更新案例选择器
function updateCaseSelector() {
    const selector = document.getElementById('caseSelector');
    const filteredCases = CASES.filter(c => c.property === currentProperty);

    selector.innerHTML = filteredCases.map((c, index) => {
        const originalIndex = CASES.indexOf(c);
        return `<option value="${originalIndex}">${c.name}</option>`;
    }).join('');

    currentCaseIndex = filteredCases.length > 0 ? CASES.indexOf(filteredCases[0]) : 0;
}
