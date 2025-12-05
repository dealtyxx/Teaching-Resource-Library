/**
 * Formula Interpretation Explorer
 * 谓词公式解释系统 - 永真式、永假式、可满足式判定
 */

// DOM Elements
const formulaSelect = document.getElementById('formulaSelect');
const customInputGroup = document.getElementById('customInputGroup');
const customInput = document.getElementById('customInput');
const domainInput = document.getElementById('domainInput');
const setDomainBtn = document.getElementById('setDomainBtn');
const currentDomain = document.getElementById('currentDomain');
const predicateAssignments = document.getElementById('predicateAssignments');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const interpretationCount = document.getElementById('interpretationCount');
const truthCount = document.getElementById('truthCount');
const originalFormula = document.getElementById('originalFormula');
const formulaInfo = document.getElementById('formulaInfo');
const interpretationTable = document.getElementById('interpretationTable');
const tautologyResult = document.getElementById('tautologyResult');
const contradictionResult = document.getElementById('contradictionResult');
const satisfiableResult = document.getElementById('satisfiableResult');
const truthChart = document.getElementById('truthChart');
const philosophyContent = document.getElementById('philosophyContent');

// 思政主题公式库
const FORMULAS = [
    {
        formula: "∀x(努力(x) ∨ ¬努力(x))",
        type: "tautology",
        description: "永真式 - 排中律的体现",
        context: "每个人要么努力,要么不努力,这是客观规律,体现了辩证法中的矛盾对立统一",
        philosophy: "这体现了马克思主义哲学中'矛盾是普遍存在的'这一基本原理。无论在任何情况下,努力与不努力构成了一对矛盾的两个方面,不存在中间状态。这启示我们:人生道路上,我们必须做出选择,没有模糊地带。",
        theme: "辩证唯物主义"
    },
    {
        formula: "∀x(诚信(x) ∧ ¬诚信(x))",
        type: "contradiction",
        description: "永假式 - 矛盾律的体现",
        context: "一个人不可能既诚信又不诚信,这揭示了逻辑矛盾的本质",
        philosophy: "这体现了形式逻辑的矛盾律:同一个人在同一时间、同一方面不能既具有某种性质又不具有这种性质。在道德建设中,我们必须坚守底线,诚信就是诚信,欺骗就是欺骗,不能自相矛盾。",
        theme: "社会主义核心价值观"
    },
    {
        formula: "∃x(奋斗(x) ∧ 成功(x))",
        type: "satisfiable",
        description: "可满足式 - 理想可实现",
        context: "存在通过奋斗获得成功的人,这个命题在合适的解释下为真",
        philosophy: "这体现了历史唯物主义的实践观:通过主观努力(奋斗)可以改变客观现实(成功)。无数革命先辈和时代楷模用实践证明了这一点。这启示青年一代:理想不是空想,通过脚踏实地的奋斗,理想是可以实现的。",
        theme: "中国梦与奋斗精神"
    },
    {
        formula: "∀x(学习(x) → 进步(x))",
        type: "satisfiable",
        description: "条件式 - 因果规律",
        context: "所有学习的人都会进步,这在特定解释下可以为真",
        philosophy: "这体现了认识论中'实践是认识的来源'的原理。学习是一种认识活动,通过学习获取知识,通过知识指导实践,从而实现进步。毛泽东同志指出'学习的目的全在于运用',只有将学习与进步联系起来,才能真正掌握真理。",
        theme: "终身学习"
    }
];

// State
let currentFormulaData = null;
let domain = ['个体1', '个体2'];
let predicates = new Map(); // 谓词名 -> 真值赋值
let interpretations = [];
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

// 解析公式中的谓词
function extractPredicates(formula) {
    const predicatePattern = /([一-龟\u4e00-\u9fa5a-zA-Z]+)\(([a-z])\)/g;
    const predicatesSet = new Set();
    let match;

    while ((match = predicatePattern.exec(formula)) !== null) {
        predicatesSet.add(match[1]);
    }

    return Array.from(predicatesSet);
}

// 生成所有可能的真值赋值
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

// 简化的公式求值函数
function evaluateFormula(formula, assignment, domain) {
    try {
        // 处理全称量词 ∀x
        if (formula.includes('∀x')) {
            const innerFormula = formula.match(/∀x\((.*)\)/)?.[1];
            if (!innerFormula) return false;

            // 对论域中每个元素都要为真
            return domain.every((elem, idx) => {
                return evaluateSimpleFormula(innerFormula, assignment, idx);
            });
        }

        // 处理存在量词 ∃x
        if (formula.includes('∃x')) {
            const innerFormula = formula.match(/∃x\((.*)\)/)?.[1];
            if (!innerFormula) return false;

            // 至少存在一个元素使其为真
            return domain.some((elem, idx) => {
                return evaluateSimpleFormula(innerFormula, assignment, idx);
            });
        }

        // 处理简单公式
        return evaluateSimpleFormula(formula, assignment, 0);

    } catch (error) {
        console.error('求值错误:', error);
        return false;
    }
}

// 求值简单公式(不含量词)
function evaluateSimpleFormula(formula, assignment, elementIndex) {
    let result = formula;

    // 替换谓词为真值
    assignment.forEach((values, predName) => {
        const regex = new RegExp(`${predName}\\([a-z]\\)`, 'g');
        result = result.replace(regex, values[elementIndex] ? 'true' : 'false');
    });

    // 替换逻辑符号
    result = result.replace(/∧/g, '&&')
        .replace(/∨/g, '||')
        .replace(/¬/g, '!')
        .replace(/→/g, '<=')  // A→B 等价于 ¬A∨B
        .replace(/↔/g, '==');

    // 处理蕴含: A→B 转换为 !A||B
    result = result.replace(/([^<>=!&|]+)<=([^<>=!&|]+)/g, '(!($1)||($2))');

    try {
        // 求值
        return eval(result);
    } catch (e) {
        console.error('求值表达式错误:', result, e);
        return false;
    }
}

// 设置论域
function setDomain() {
    const input = domainInput.value.trim();
    if (!input) {
        alert('请输入论域元素!');
        return;
    }

    domain = input.split(',').map(s => s.trim()).filter(s => s);

    if (domain.length === 0) {
        alert('论域不能为空!');
        return;
    }

    currentDomain.innerHTML = `
        <div class="domain-display">
            <span class="domain-label">当前论域 D =</span>
            <span class="domain-values">{${domain.join(', ')}}</span>
            <span class="domain-size">(|D| = ${domain.length})</span>
        </div>
    `;

    statusText.textContent = `论域已设置: ${domain.length} 个元素`;
}

// 渲染谓词赋值界面
function renderPredicateAssignments(predicateNames) {
    predicateAssignments.innerHTML = '';

    if (predicateNames.length === 0) {
        predicateAssignments.innerHTML = '<p class="no-predicates">公式中无谓词</p>';
        return;
    }

    predicateNames.forEach(predName => {
        const container = document.createElement('div');
        container.className = 'predicate-assignment';

        const header = document.createElement('div');
        header.className = 'assignment-header';
        header.textContent = `谓词 ${predName}(x)`;

        const checkboxes = document.createElement('div');
        checkboxes.className = 'assignment-checkboxes';

        domain.forEach((elem, idx) => {
            const label = document.createElement('label');
            label.className = 'checkbox-label';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.predicate = predName;
            checkbox.dataset.index = idx;
            checkbox.addEventListener('change', updatePredicateAssignment);

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(`${elem}`));
            checkboxes.appendChild(label);
        });

        container.appendChild(header);
        container.appendChild(checkboxes);
        predicateAssignments.appendChild(container);
    });
}

// 更新谓词赋值
function updatePredicateAssignment(e) {
    const predName = e.target.dataset.predicate;
    const index = parseInt(e.target.dataset.index);

    if (!predicates.has(predName)) {
        predicates.set(predName, new Array(domain.length).fill(false));
    }

    const values = predicates.get(predName);
    values[index] = e.target.checked;
    predicates.set(predName, values);
}

// 渲染原始公式
function renderOriginalFormula(data) {
    originalFormula.innerHTML = `
        <div class="formula-text">${data.formula}</div>
    `;

    formulaInfo.innerHTML = `
        <div class="info-row">
            <span class="info-label">类型:</span>
            <span class="info-value type-${data.type}">${getTypeName(data.type)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">描述:</span>
            <span class="info-value">${data.description}</span>
        </div>
        <div class="info-row context">
            ${data.context}
        </div>
    `;
}

function getTypeName(type) {
    const names = {
        'tautology': '永真式',
        'contradiction': '永假式',
        'satisfiable': '可满足式'
    };
    return names[type] || '未知';
}

// 生成并渲染解释表格
async function renderInterpretationTable(formula, predicateNames) {
    interpretationTable.innerHTML = '';
    interpretations = generateAllAssignments(predicateNames, domain.length);

    statusText.textContent = `生成了 ${interpretations.length} 个可能的解释`;
    interpretationCount.textContent = interpretations.length;

    // 创建表格
    const table = document.createElement('table');
    table.className = 'interpretation-table';

    // 表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    headerRow.innerHTML = `
        <th>解释 #</th>
        ${predicateNames.map(p => `<th colspan="${domain.length}">${p}(x)</th>`).join('')}
        <th>真值</th>
    `;

    // 第二行表头 - 论域元素
    const subHeaderRow = document.createElement('tr');
    subHeaderRow.innerHTML = `
        <th></th>
        ${predicateNames.map(() =>
        domain.map(d => `<th class="domain-header">${d}</th>`).join('')
    ).join('')}
        <th></th>
    `;

    thead.appendChild(headerRow);
    thead.appendChild(subHeaderRow);
    table.appendChild(thead);

    // 表体
    const tbody = document.createElement('tbody');

    let trueCount = 0;

    for (let i = 0; i < interpretations.length; i++) {
        if (shouldStop) break;

        await sleep(getDelay() * 0.3);

        const assignment = interpretations[i];
        const truthValue = evaluateFormula(formula, assignment, domain);

        if (truthValue) trueCount++;

        const row = document.createElement('tr');
        row.className = truthValue ? 'true-row' : 'false-row';

        let cellsHTML = `<td class="index-cell">I${i + 1}</td>`;

        // 谓词赋值单元格
        predicateNames.forEach(predName => {
            const values = assignment.get(predName);
            values.forEach(val => {
                cellsHTML += `<td class="value-cell ${val ? 'true' : 'false'}">${val ? 'T' : 'F'}</td>`;
            });
        });

        // 真值单元格
        cellsHTML += `<td class="truth-cell ${truthValue ? 'true' : 'false'}">${truthValue ? '真' : '假'}</td>`;

        row.innerHTML = cellsHTML;
        tbody.appendChild(row);

        // 触发动画
        setTimeout(() => row.classList.add('visible'), 10);

        // 更新统计
        truthCount.textContent = `${trueCount}/${i + 1}`;
    }

    table.appendChild(tbody);
    interpretationTable.appendChild(table);

    return { total: interpretations.length, trueCount };
}

// 判定公式类型并渲染结果
async function classifyAndRender(stats) {
    const { total, trueCount } = stats;

    statusText.textContent = '正在判定公式类型...';
    await sleep(getDelay());

    const isTautology = trueCount === total;
    const isContradiction = trueCount === 0;
    const isSatisfiable = trueCount > 0;

    // 永真式
    tautologyResult.innerHTML = `
        <div class="result-badge ${isTautology ? 'yes' : 'no'}">
            ${isTautology ? '✓ 是永真式' : '✗ 不是永真式'}
        </div>
        ${isTautology ? '<p class="result-detail">在所有 ' + total + ' 个解释下都为真</p>' : ''}
    `;
    tautologyResult.parentElement.parentElement.classList.toggle('active', isTautology);

    await sleep(getDelay() * 0.5);

    // 永假式
    contradictionResult.innerHTML = `
        <div class="result-badge ${isContradiction ? 'yes' : 'no'}">
            ${isContradiction ? '✓ 是永假式' : '✗ 不是永假式'}
        </div>
        ${isContradiction ? '<p class="result-detail">在所有 ' + total + ' 个解释下都为假</p>' : ''}
    `;
    contradictionResult.parentElement.parentElement.classList.toggle('active', isContradiction);

    await sleep(getDelay() * 0.5);

    // 可满足式
    satisfiableResult.innerHTML = `
        <div class="result-badge ${isSatisfiable ? 'yes' : 'no'}">
            ${isSatisfiable ? '✓ 是可满足式' : '✗ 不可满足'}
        </div>
        ${isSatisfiable ? '<p class="result-detail">在 ' + trueCount + ' 个解释下为真(' + (trueCount / total * 100).toFixed(1) + '%)</p>' : ''}
    `;
    satisfiableResult.parentElement.parentElement.classList.toggle('active', isSatisfiable);
}

// 渲染真值分布图
async function renderTruthChart(stats) {
    truthChart.innerHTML = '';

    statusText.textContent = '正在生成统计图表...';
    await sleep(getDelay());

    const { total, trueCount } = stats;
    const falseCount = total - trueCount;
    const truePercent = (trueCount / total * 100).toFixed(1);
    const falsePercent = (falseCount / total * 100).toFixed(1);

    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';

    chartContainer.innerHTML = `
        <div class="chart-bars">
            <div class="chart-bar-group">
                <div class="chart-label">真</div>
                <div class="chart-bar-wrapper">
                    <div class="chart-bar true-bar" style="height: ${truePercent}%">
                        <span class="bar-value">${trueCount}</span>
                    </div>
                </div>
                <div class="chart-percent">${truePercent}%</div>
            </div>
            <div class="chart-bar-group">
                <div class="chart-label">假</div>
                <div class="chart-bar-wrapper">
                    <div class="chart-bar false-bar" style="height: ${falsePercent}%">
                        <span class="bar-value">${falseCount}</span>
                    </div>
                </div>
                <div class="chart-percent">${falsePercent}%</div>
            </div>
        </div>
        <div class="chart-summary">
            <p>总解释数: <strong>${total}</strong></p>
            <p>真值率: <strong>${truePercent}%</strong></p>
        </div>
    `;

    truthChart.appendChild(chartContainer);

    // 触发动画
    setTimeout(() => {
        chartContainer.querySelectorAll('.chart-bar').forEach(bar => {
            bar.classList.add('animated');
        });
    }, 100);
}

// 渲染哲学寓意
async function renderPhilosophy(data) {
    philosophyContent.innerHTML = '';

    statusText.textContent = '正在生成哲学解读...';
    await sleep(getDelay());

    const content = document.createElement('div');
    content.className = 'philosophy-box';

    content.innerHTML = `
        <div class="philosophy-header">
            <span class="philosophy-icon">💡</span>
            <h3>${data.theme}</h3>
        </div>
        <div class="philosophy-body">
            <p class="philosophy-text">${data.philosophy}</p>
        </div>
        <div class="philosophy-footer">
            <div class="insight-tag">深度解读</div>
        </div>
    `;

    philosophyContent.appendChild(content);

    setTimeout(() => content.classList.add('visible'), 10);
}

// 主流程
async function startInterpretation() {
    if (isRunning) return;

    if (domain.length === 0) {
        alert('请先设置论域!');
        return;
    }

    isRunning = true;
    shouldStop = false;
    startBtn.disabled = true;
    formulaSelect.disabled = true;

    try {
        // 获取公式
        let formulaData;
        if (formulaSelect.value === 'custom') {
            const customFormula = customInput.value.trim();
            if (!customFormula) {
                alert('请输入公式!');
                resetInterpretation();
                return;
            }
            formulaData = {
                formula: customFormula,
                type: 'unknown',
                description: '自定义公式',
                context: '用户输入',
                philosophy: '通过解释分析,我们可以理解公式的逻辑性质。',
                theme: '逻辑探索'
            };
        } else {
            formulaData = FORMULAS[parseInt(formulaSelect.value)];
        }

        currentFormulaData = formulaData;

        // 渲染公式
        renderOriginalFormula(formulaData);
        await sleep(500);

        // 提取谓词
        const predicateNames = extractPredicates(formulaData.formula);
        if (predicateNames.length === 0) {
            alert('公式中未找到谓词!');
            resetInterpretation();
            return;
        }

        // 生成解释表格
        statusText.textContent = '正在生成所有可能的解释...';
        const stats = await renderInterpretationTable(formulaData.formula, predicateNames);

        if (!shouldStop) {
            // 分类判定
            await classifyAndRender(stats);

            // 统计图表
            await renderTruthChart(stats);

            // 哲学寓意
            await renderPhilosophy(formulaData);

            statusText.textContent = '解释完成!';
        }

    } catch (error) {
        console.error('解释错误:', error);
        statusText.textContent = '解释出错: ' + error.message;
    }

    isRunning = false;
    startBtn.disabled = false;
    formulaSelect.disabled = false;
}

function resetInterpretation() {
    shouldStop = true;
    isRunning = false;

    originalFormula.innerHTML = '';
    formulaInfo.innerHTML = '';
    interpretationTable.innerHTML = '';
    tautologyResult.innerHTML = '';
    contradictionResult.innerHTML = '';
    satisfiableResult.innerHTML = '';
    truthChart.innerHTML = '';
    philosophyContent.innerHTML = '';

    document.querySelectorAll('.classification-card').forEach(card => {
        card.classList.remove('active');
    });

    interpretationCount.textContent = '0';
    truthCount.textContent = '0/0';
    statusText.textContent = '准备开始解释';

    startBtn.disabled = false;
    formulaSelect.disabled = false;
}

// 事件监听
formulaSelect.addEventListener('change', () => {
    if (formulaSelect.value === 'custom') {
        customInputGroup.style.display = 'flex';
    } else {
        customInputGroup.style.display = 'none';
    }
    resetInterpretation();
});

setDomainBtn.addEventListener('click', () => {
    setDomain();
    if (currentFormulaData) {
        const predicateNames = extractPredicates(currentFormulaData.formula);
        renderPredicateAssignments(predicateNames);
    }
});

startBtn.addEventListener('click', startInterpretation);
resetBtn.addEventListener('click', resetInterpretation);

// 初始化
window.addEventListener('load', () => {
    domain = ['个体a', '个体b'];
    domainInput.value = domain.join(',');
    setDomain();

    currentFormulaData = FORMULAS[0];
    renderOriginalFormula(currentFormulaData);
});
