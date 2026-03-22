/**
 * Formula Relations Explorer
 * 谓词逻辑关系验证系统 - 等价与蕴含
 */

// DOM Elements
const caseSelect = document.getElementById('caseSelect');
const customInputGroup = document.getElementById('customInputGroup');
const formulaA = document.getElementById('formulaA');
const formulaB = document.getElementById('formulaB');
const domainInput = document.getElementById('domainInput');
const setDomainBtn = document.getElementById('setDomainBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const testCount = document.getElementById('testCount');
const matchCount = document.getElementById('matchCount');
const currentCase = document.getElementById('currentCase');
const truthTableContainer = document.getElementById('truthTableContainer');
const verificationResult = document.getElementById('verificationResult');
const relationChain = document.getElementById('relationChain');
const philosophyInterpretation = document.getElementById('philosophyInterpretation');

// 思政主题案例库
const CASES = [
    {
        type: 'equivalence',
        formulaA: "¬∀x P(x)",
        formulaB: "∃x ¬P(x)",
        name: "德摩根律 - 集体与个体",
        description: "否定全部等价于存在反例",
        context: "体现个体与集体的辩证关系:'不是所有人都X' 等价于 '存在某个人不X'",
        philosophy: "这揭示了马克思主义哲学中整体与部分的关系。否定整体的某种属性,就意味着部分个体不具有该属性。在集体建设中,我们不能简单地说'所有人都完美',而要承认个体差异的存在。同时,这也启示我们:要想反驳一个全称命题,只需找到一个反例即可。这体现了实践是检验真理的唯一标准。",
        theme: "整体与部分",
        chain: [
            "¬∀x P(x)",
            "¬∀x P(x) ≡ ∃x ¬P(x)",
            "∃x ¬P(x)"
        ]
    },
    {
        type: 'equivalence',
        formulaA: "¬∃x P(x)",
        formulaB: "∀x ¬P(x)",
        name: "量词转换 - 否定之否定",
        description: "不存在即全部否定",
        context: "'不存在P的个体' 等价于 '所有个体都不P'",
        philosophy: "这体现了辩证法的否定之否定规律。通过两次否定,我们从'不存在'回到'全部不'。在实际工作中,这告诉我们:要彻底消除某种消极现象,就需要确保每个环节、每个个体都不出现该现象。正如反腐败工作,'不存在腐败分子'就意味着'所有干部都廉洁'。",
        theme: "否定之否定",
        chain: [
            "¬∃x P(x)",
            "¬∃x P(x) ≡ ∀x ¬P(x)",
            "∀x ¬P(x)"
        ]
    },
    {
        type: 'implication',
        formulaA: "∀x(学习(x) → 进步(x))",
        formulaB: "∀x 学习(x) → ∀x 进步(x)",
        name: "蕴含传递 - 因果链条",
        description: "条件普遍性的传递",
        context: "如果每个人学习都会进步,那么所有人学习则所有人进步",
        philosophy: "这体现了唯物辩证法的因果联系观。个体的因果关系可以推导出集体的因果关系。在教育工作中,这启示我们:只要为每个学生创造学习条件(全称前提),那么整个班级的进步就是必然的(全称结论)。这也揭示了'量变引起质变'的道理:个体的普遍学习(量变)导致集体的整体进步(质变)。",
        theme: "因果必然性",
        chain: [
            "∀x(学习(x) → 进步(x))",
            "假设: ∀x 学习(x)",
            "由全称实例化 ⇒ ∀x 进步(x)",
            "结论: ∀x 学习(x) → ∀x 进步(x)"
        ]
    },
    {
        type: 'equivalence',
        formulaA: "∀x P(x) ∧ ∀x Q(x)",
        formulaB: "∀x(P(x) ∧ Q(x))",
        name: "等价链 - 辩证统一",
        description: "全称分配律",
        context: "'所有人都P且所有人都Q' 等价于 '所有人既P又Q'",
        philosophy: "这体现了矛盾的普遍性原理。两个普遍真理的结合,等价于一个综合性的普遍真理。在社会主义核心价值观建设中,这启示我们:'所有公民都自由'且'所有公民都平等'等价于'所有公民既自由又平等'。多个优秀品质的统一,构成了全面发展的人。这也体现了'两点论'与'重点论'的统一。",
        theme: "矛盾的统一性",
        chain: [
            "∀x P(x) ∧ ∀x Q(x)",
            "全称分配 ≡",
            "∀x(P(x) ∧ Q(x))",
            "逆向分配 ≡",
            "∀x P(x) ∧ ∀x Q(x)"
        ]
    }
];

// State
let currentCaseData = null;
let domain = ['a', 'b', 'c'];
let relationType = 'equivalence';
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

// 简化的公式求值 (复用之前的逻辑)
function evaluateFormula(formula, assignment, domain) {
    try {
        // 处理全称量词
        if (formula.includes('∀x')) {
            const match = formula.match(/∀x[\s]*(.+)/);
            if (!match) return false;
            let innerFormula = match[1].trim();

            // 移除最外层括号
            if (innerFormula.startsWith('(') && innerFormula.endsWith(')')) {
                innerFormula = innerFormula.slice(1, -1);
            }

            return domain.every((elem, idx) => {
                return evaluateSimpleFormula(innerFormula, assignment, idx);
            });
        }

        // 处理存在量词
        if (formula.includes('∃x')) {
            const match = formula.match(/∃x[\s]*(.+)/);
            if (!match) return false;
            let innerFormula = match[1].trim();

            if (innerFormula.startsWith('(') && innerFormula.endsWith(')')) {
                innerFormula = innerFormula.slice(1, -1);
            }

            return domain.some((elem, idx) => {
                return evaluateSimpleFormula(innerFormula, assignment, idx);
            });
        }

        // 处理否定
        if (formula.startsWith('¬')) {
            const innerFormula = formula.substring(1).trim();
            return !evaluateFormula(innerFormula, assignment, domain);
        }

        return evaluateSimpleFormula(formula, assignment, 0);

    } catch (error) {
        console.error('求值错误:', error, formula);
        return false;
    }
}

function evaluateSimpleFormula(formula, assignment, elementIndex) {
    let result = formula;

    // 替换中文谓词
    assignment.forEach((values, predName) => {
        const regex = new RegExp(`${predName}\\([a-z]\\)`, 'g');
        result = result.replace(regex, values[elementIndex] ? 'true' : 'false');
    });

    // 替换逻辑符号
    result = result.replace(/∧/g, '&&')
        .replace(/∨/g, '||')
        .replace(/¬/g, '!')
        .replace(/↔/g, '==');

    // 处理蕴含: A→B 使用 <= 运算符（对布尔0/1值等价于蕴含真值表）
    result = result.replace(/→/g, '<=');

    try {
        return eval(result);
    } catch (e) {
        console.error('求值错误:', result, e);
        return false;
    }
}

// 提取谓词
function extractPredicates(formula) {
    const predicatePattern = /([一-龟\u4e00-\u9fa5a-zA-Z]+)\(([a-z])\)/g;
    const predicatesSet = new Set();
    let match;

    while ((match = predicatePattern.exec(formula)) !== null) {
        predicatesSet.add(match[1]);
    }

    return Array.from(predicatesSet);
}

// 生成所有解释
function generateAllAssignments(predicateNames, domainSize) {
    const assignments = [];
    const totalCombinations = Math.pow(2, predicateNames.length * domainSize);

    for (let i = 0; i < totalCombinations; i++) {
        const assignment = new Map();
        let bitMask = i;

        predicateNames.forEach(predName => {
            const values = [];
            for (let j = 0; j < domainSize; j++) {
                values.push((bitMask & 1) === 1);
                bitMask >>= 1;
            }
            assignment.set(predName, values);
        });

        assignments.push(assignment);
    }

    return assignments;
}

// 设置论域
function setDomain() {
    const input = domainInput.value.trim();
    if (!input) return;

    domain = input.split(',').map(s => s.trim()).filter(s => s);
    statusText.textContent = `论域已设置: {${domain.join(', ')}}`;
}

// 渲染当前案例
function renderCurrentCase(caseData) {
    currentCase.innerHTML = `
        <div class="case-card ${caseData.type}">
            <div class="case-header">
                <h3>${caseData.name}</h3>
                <span class="case-type-badge ${caseData.type}">
                    ${caseData.type === 'equivalence' ? '逻辑等价 ≡' : '逻辑蕴含 ⇒'}
                </span>
            </div>
            <div class="case-formulas">
                <div class="formula-item formula-a">
                    <div class="formula-label">公式 A:</div>
                    <div class="formula-content">${caseData.formulaA}</div>
                </div>
                <div class="relation-symbol">
                    ${caseData.type === 'equivalence' ? '≡' : '⇒'}
                </div>
                <div class="formula-item formula-b">
                    <div class="formula-label">公式 B:</div>
                    <div class="formula-content">${caseData.formulaB}</div>
                </div>
            </div>
            <div class="case-description">
                <p><strong>说明:</strong> ${caseData.description}</p>
                <p><strong>语境:</strong> ${caseData.context}</p>
            </div>
        </div>
    `;
}

// 生成并渲染真值表
async function renderTruthTable(caseData, predicateNames) {
    truthTableContainer.innerHTML = '';

    const interpretations = generateAllAssignments(predicateNames, domain.length);
    testCount.textContent = interpretations.length;

    statusText.textContent = `正在生成 ${interpretations.length} 个解释的真值表...`;

    // 创建表格
    const table = document.createElement('table');
    table.className = 'truth-comparison-table';

    // 表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th rowspan="2">解释 #</th>
        <th colspan="${predicateNames.length * domain.length}">谓词赋值</th>
        <th rowspan="2">A 真值</th>
        <th rowspan="2">B 真值</th>
        <th rowspan="2">关系检验</th>
    `;

    const subHeaderRow = document.createElement('tr');
    predicateNames.forEach(p => {
        domain.forEach(d => {
            subHeaderRow.innerHTML += `<th class="pred-header">${p}(${d})</th>`;
        });
    });

    thead.appendChild(headerRow);
    thead.appendChild(subHeaderRow);
    table.appendChild(thead);

    // 表体
    const tbody = document.createElement('tbody');
    let matchedCount = 0;

    for (let i = 0; i < interpretations.length; i++) {
        if (shouldStop) break;

        await sleep(getDelay() * 0.4);

        const assignment = interpretations[i];
        const truthA = evaluateFormula(caseData.formulaA, assignment, domain);
        const truthB = evaluateFormula(caseData.formulaB, assignment, domain);

        let relationHolds = false;
        if (caseData.type === 'equivalence') {
            relationHolds = (truthA === truthB);
        } else { // implication
            relationHolds = (!truthA || truthB); // A→B
        }

        if (relationHolds) matchedCount++;

        const row = document.createElement('tr');
        row.className = relationHolds ? 'valid-row' : 'invalid-row';

        let cellsHTML = `<td class="index-cell">I${i + 1}</td>`;

        // 谓词赋值
        predicateNames.forEach(predName => {
            const values = assignment.get(predName);
            values.forEach(val => {
                cellsHTML += `<td class="value-cell ${val ? 'true' : 'false'}">${val ? 'T' : 'F'}</td>`;
            });
        });

        // A真值
        cellsHTML += `<td class="truth-cell ${truthA ? 'true' : 'false'}">${truthA ? '真' : '假'}</td>`;

        // B真值
        cellsHTML += `<td class="truth-cell ${truthB ? 'true' : 'false'}">${truthB ? '真' : '假'}</td>`;

        // 关系检验
        const relationText = caseData.type === 'equivalence' ?
            (truthA === truthB ? 'A ≡ B ✓' : 'A ≠ B ✗') :
            (!truthA || truthB ? 'A ⇒ B ✓' : 'A ⇏ B ✗');

        cellsHTML += `<td class="relation-cell ${relationHolds ? 'valid' : 'invalid'}">${relationText}</td>`;

        row.innerHTML = cellsHTML;
        tbody.appendChild(row);

        setTimeout(() => row.classList.add('visible'), 10);

        matchCount.textContent = `${matchedCount}/${i + 1}`;
    }

    table.appendChild(tbody);
    truthTableContainer.appendChild(table);

    return { total: interpretations.length, matchedCount };
}

// 渲染验证结果
async function renderVerificationResult(stats, caseData) {
    verificationResult.innerHTML = '';

    statusText.textContent = '正在生成验证结论...';
    await sleep(getDelay());

    const { total, matchedCount } = stats;
    const isValid = matchedCount === total;
    const percentage = (matchedCount / total * 100).toFixed(1);

    const resultDiv = document.createElement('div');
    resultDiv.className = `result-box ${isValid ? 'valid' : 'invalid'}`;

    const relationName = caseData.type === 'equivalence' ? '逻辑等价' : '逻辑蕴含';
    const relationSymbol = caseData.type === 'equivalence' ? '≡' : '⇒';

    resultDiv.innerHTML = `
        <div class="result-icon">${isValid ? '✓' : '✗'}</div>
        <div class="result-content">
            <div class="result-title ${isValid ? 'success' : 'fail'}">
                ${isValid ? `验证成功: A ${relationSymbol} B` : `验证失败: A ${relationSymbol} B 不成立`}
            </div>
            <div class="result-stats">
                <div class="stat-row">
                    <span class="stat-name">测试解释数:</span>
                    <span class="stat-num">${total}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-name">满足关系:</span>
                    <span class="stat-num">${matchedCount} (${percentage}%)</span>
                </div>
            </div>
            <div class="result-explanation">
                ${isValid ?
                    `在所有 ${total} 个解释下,公式A与B的${relationName}关系都成立,因此 <strong>A ${relationSymbol} B</strong> 是有效的。` :
                    `在 ${total - matchedCount} 个解释下关系不成立,因此该${relationName}关系无效。`
                }
            </div>
        </div>
    `;

    verificationResult.appendChild(resultDiv);
    setTimeout(() => resultDiv.classList.add('visible'), 10);
}

// 渲染关系链
async function renderRelationChain(caseData) {
    relationChain.innerHTML = '';

    statusText.textContent = '正在构建关系链...';
    await sleep(getDelay());

    const chainContainer = document.createElement('div');
    chainContainer.className = 'chain-visualization';

    caseData.chain.forEach((item, index) => {
        const node = document.createElement('div');
        node.className = 'chain-node';
        node.innerHTML = `
            <div class="node-content">${item}</div>
        `;

        chainContainer.appendChild(node);

        if (index < caseData.chain.length - 1) {
            const arrow = document.createElement('div');
            arrow.className = 'chain-arrow';
            arrow.innerHTML = caseData.type === 'equivalence' ? '≡' : '⇒';
            chainContainer.appendChild(arrow);
        }

        setTimeout(() => node.classList.add('visible'), index * 200);
    });

    relationChain.appendChild(chainContainer);
}

// 渲染哲学解读
async function renderPhilosophy(caseData) {
    philosophyInterpretation.innerHTML = '';

    statusText.textContent = '正在生成思政解读...';
    await sleep(getDelay());

    const philBox = document.createElement('div');
    philBox.className = 'philosophy-content';

    philBox.innerHTML = `
        <div class="phil-header">
            <span class="phil-icon">🎓</span>
            <h3>${caseData.theme}</h3>
        </div>
        <div class="phil-body">
            <p class="phil-text">${caseData.philosophy}</p>
        </div>
        <div class="phil-footer">
            <div class="phil-tag">马克思主义哲学</div>
            <div class="phil-tag">辩证法</div>
        </div>
    `;

    philosophyInterpretation.appendChild(philBox);
    setTimeout(() => philBox.classList.add('visible'), 10);
}

// 主流程
async function startVerification() {
    if (isRunning) return;

    setDomain();

    isRunning = true;
    shouldStop = false;
    startBtn.disabled = true;
    caseSelect.disabled = true;

    try {
        // 获取案例
        let caseData;
        if (caseSelect.value === 'custom') {
            const fA = formulaA.value.trim();
            const fB = formulaB.value.trim();
            if (!fA || !fB) {
                alert('请输入两个公式!');
                resetVerification();
                return;
            }
            caseData = {
                type: relationType,
                formulaA: fA,
                formulaB: fB,
                name: '自定义验证',
                description: '用户自定义的逻辑关系验证',
                context: '自定义案例',
                philosophy: '通过验证,我们可以深入理解逻辑关系的本质。',
                theme: '逻辑探索',
                chain: [fA, relationType === 'equivalence' ? '≡' : '⇒', fB]
            };
        } else {
            caseData = CASES[parseInt(caseSelect.value)];
        }

        currentCaseData = caseData;

        // 渲染案例
        renderCurrentCase(caseData);
        await sleep(500);

        // 提取谓词
        const predicatesA = extractPredicates(caseData.formulaA);
        const predicatesB = extractPredicates(caseData.formulaB);
        const allPredicates = [...new Set([...predicatesA, ...predicatesB])];

        if (allPredicates.length === 0) {
            alert('公式中无谓词!');
            resetVerification();
            return;
        }

        // 生成真值表
        const stats = await renderTruthTable(caseData, allPredicates);

        if (!shouldStop) {
            // 验证结果
            await renderVerificationResult(stats, caseData);

            // 关系链
            await renderRelationChain(caseData);

            // 哲学解读
            await renderPhilosophy(caseData);

            statusText.textContent = '验证完成!';
        }

    } catch (error) {
        console.error('验证错误:', error);
        statusText.textContent = '验证出错: ' + error.message;
    }

    isRunning = false;
    startBtn.disabled = false;
    caseSelect.disabled = false;
}

function resetVerification() {
    shouldStop = true;
    isRunning = false;

    currentCase.innerHTML = '';
    truthTableContainer.innerHTML = '';
    verificationResult.innerHTML = '';
    relationChain.innerHTML = '';
    philosophyInterpretation.innerHTML = '';

    testCount.textContent = '0';
    matchCount.textContent = '0/0';
    statusText.textContent = '准备验证';

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
    resetVerification();
});

document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        relationType = e.currentTarget.dataset.type;
        resetVerification();
    });
});

setDomainBtn.addEventListener('click', setDomain);
startBtn.addEventListener('click', startVerification);
resetBtn.addEventListener('click', resetVerification);

// 初始化
window.addEventListener('load', () => {
    setDomain();
    currentCaseData = CASES[0];
    renderCurrentCase(currentCaseData);
});
