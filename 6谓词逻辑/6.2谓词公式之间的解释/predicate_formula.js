/**
 * Predicate Formula Interpreter
 * 谓词公式解析器 - 思政教育可视化
 */

// DOM Elements
const formulaSelect = document.getElementById('formulaSelect');
const customInputGroup = document.getElementById('customInputGroup');
const customInput = document.getElementById('customInput');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const quantifierCount = document.getElementById('quantifierCount');
const variableCount = document.getElementById('variableCount');
const originalFormula = document.getElementById('originalFormula');
const formulaDescription = document.getElementById('formulaDescription');
const scopeVisualization = document.getElementById('scopeVisualization');
const boundVariables = document.getElementById('boundVariables');
const freeVariables = document.getElementById('freeVariables');
const closedFormCheck = document.getElementById('closedFormCheck');
const renameDemo = document.getElementById('renameDemo');
const treeSvg = document.getElementById('treeSvg');
const treeGroup = document.getElementById('treeGroup');

// 思政主题公式库
const FORMULAS = [
    {
        formula: "∀x(团结(x) → 力量(x))",
        description: "团结就是力量:所有团结的集体都具有强大力量",
        context: "体现集体主义精神,强调团结协作的重要性",
        theme: "集体主义"
    },
    {
        formula: "∃x(英雄(x) ∧ 奉献(x) ∧ 无私(x))",
        description: "存在英雄人物:有人既是英雄,又具备奉献和无私的品质",
        context: "弘扬英雄主义精神,学习榜样力量",
        theme: "英雄主义"
    },
    {
        formula: "∀x(奋斗(x) → (坚持(x) ∧ 成功(x)))",
        description: "奋斗与成功:所有奋斗者只要坚持就能成功",
        context: "倡导艰苦奋斗精神,激励青年追求梦想",
        theme: "奋斗精神"
    },
    {
        formula: "∀x∃y(需要帮助(x) → (愿意帮助(y) ∧ 帮助(y,x)))",
        description: "互助友爱:对于任何需要帮助的人,都存在愿意帮助他的人",
        context: "弘扬社会主义核心价值观,构建和谐社会",
        theme: "友善互助"
    }
];

// State
let currentFormula = null;
let parsedFormula = null;
let isRunning = false;
let shouldStop = false;
let analysisMode = 'scope';

// Helper Functions
function getDelay() {
    const val = parseInt(speedInput.value);
    return Math.max(50, 1000 - (val * 10));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 谓词公式解析器
class FormulaParser {
    constructor(formula) {
        this.formula = formula;
        this.tokens = [];
        this.quantifiers = [];
        this.variables = new Set();
        this.boundVars = new Map(); // 变元 -> 量词位置
        this.freeVars = new Set();
        this.scopeMap = new Map(); // 量词 -> 辖域范围
    }

    // Token化
    tokenize() {
        const pattern = /∀|∃|∧|∨|¬|→|↔|\(|\)|[a-zA-Z_][a-zA-Z0-9_]*|[,]/g;
        this.tokens = this.formula.match(pattern) || [];
        return this.tokens;
    }

    // 解析公式结构
    parse() {
        this.tokenize();
        this.analyzeQuantifiers();
        this.analyzeVariables();
        this.analyzeScopeRanges();
        this.identifyBoundAndFreeVars();

        return {
            formula: this.formula,
            quantifiers: this.quantifiers,
            variables: Array.from(this.variables),
            boundVars: Array.from(this.boundVars.keys()),
            freeVars: Array.from(this.freeVars),
            scopeMap: this.scopeMap,
            isClosed: this.freeVars.size === 0
        };
    }

    // 分析量词
    analyzeQuantifiers() {
        this.quantifiers = [];
        for (let i = 0; i < this.tokens.length; i++) {
            if (this.tokens[i] === '∀' || this.tokens[i] === '∃') {
                const variable = this.tokens[i + 1];
                this.quantifiers.push({
                    type: this.tokens[i],
                    variable: variable,
                    position: i,
                    scopeStart: -1,
                    scopeEnd: -1
                });
            }
        }
    }

    // 分析所有变元
    analyzeVariables() {
        this.variables = new Set();
        for (let i = 0; i < this.tokens.length; i++) {
            const token = this.tokens[i];
            // 单字母变元
            if (/^[a-z]$/.test(token)) {
                this.variables.add(token);
            }
        }
    }

    // 分析辖域范围
    analyzeScopeRanges() {
        for (const q of this.quantifiers) {
            const start = q.position;
            let depth = 0;
            let scopeStart = -1;
            let scopeEnd = -1;

            // 找到量词后的第一个'('作为辖域开始
            for (let i = start; i < this.tokens.length; i++) {
                if (this.tokens[i] === '(') {
                    if (scopeStart === -1) {
                        scopeStart = i;
                    }
                    depth++;
                } else if (this.tokens[i] === ')') {
                    depth--;
                    if (depth === 0 && scopeStart !== -1) {
                        scopeEnd = i;
                        break;
                    }
                }
            }

            q.scopeStart = scopeStart;
            q.scopeEnd = scopeEnd;

            // 提取辖域内容
            if (scopeStart !== -1 && scopeEnd !== -1) {
                const scopeTokens = this.tokens.slice(scopeStart, scopeEnd + 1);
                this.scopeMap.set(q.variable, {
                    quantifier: q.type,
                    range: scopeTokens.join(''),
                    start: scopeStart,
                    end: scopeEnd
                });
            }
        }
    }

    // 识别约束变元和自由变元
    identifyBoundAndFreeVars() {
        // 先标记所有约束变元
        for (const q of this.quantifiers) {
            this.boundVars.set(q.variable, q);
        }

        // 找出自由变元
        for (const v of this.variables) {
            if (!this.boundVars.has(v)) {
                this.freeVars.add(v);
            }
        }
    }

    // 生成换名后的公式
    generateRenamedFormula(oldVar, newVar) {
        if (!this.boundVars.has(oldVar)) {
            return { success: false, message: `${oldVar} 不是约束变元` };
        }

        if (this.variables.has(newVar)) {
            return { success: false, message: `${newVar} 已存在,会产生冲突` };
        }

        const quantifier = this.boundVars.get(oldVar);
        const scope = this.scopeMap.get(oldVar);

        // 只在辖域内替换
        let newFormula = this.formula;
        const scopeText = this.tokens.slice(scope.start, scope.end + 1).join('');
        const newScopeText = scopeText.replace(new RegExp(`\\b${oldVar}\\b`, 'g'), newVar);

        // 替换量词处的变元
        newFormula = newFormula.replace(
            new RegExp(`${quantifier.type}${oldVar}`, 'g'),
            `${quantifier.type}${newVar}`
        );

        // 替换辖域内的变元
        const beforeScope = this.tokens.slice(0, scope.start).join('');
        const afterScope = this.tokens.slice(scope.end + 1).join('');
        newFormula = beforeScope + newScopeText + afterScope;

        return {
            success: true,
            newFormula: newFormula,
            message: `成功将 ${oldVar} 换名为 ${newVar}`
        };
    }
}

// 渲染原始公式
function renderOriginalFormula(data) {
    originalFormula.innerHTML = `<span class="formula-highlight">${data.formula}</span>`;
    formulaDescription.innerHTML = `
        <p class="desc-title">${data.description}</p>
        <p class="desc-context">${data.context}</p>
        <span class="theme-tag">${data.theme}</span>
    `;
}

// 渲染辖域可视化
async function renderScopeVisualization(parsed) {
    scopeVisualization.innerHTML = '';

    if (parsed.quantifiers.length === 0) {
        scopeVisualization.innerHTML = '<p class="no-data">此公式不包含量词</p>';
        return;
    }

    statusText.textContent = '正在分析辖域...';

    for (const q of parsed.quantifiers) {
        await sleep(getDelay());

        const scopeItem = document.createElement('div');
        scopeItem.className = 'scope-item';

        const scope = parsed.scopeMap.get(q.variable);
        const quantifierName = q.type === '∀' ? '全称量词' : '存在量词';

        scopeItem.innerHTML = `
            <div class="scope-header">
                <span class="scope-quantifier">${q.type}${q.variable}</span>
                <span class="scope-type">${quantifierName}</span>
            </div>
            <div class="scope-range">
                <div class="range-label">辖域范围:</div>
                <div class="range-content">${scope ? scope.range : '未找到辖域'}</div>
            </div>
            <div class="scope-visual">
                <div class="scope-bar" style="animation-delay: ${parsed.quantifiers.indexOf(q) * 0.2}s"></div>
            </div>
        `;

        scopeVisualization.appendChild(scopeItem);

        // 触发动画
        setTimeout(() => scopeItem.classList.add('visible'), 10);
    }
}

// 渲染变元分析
async function renderVariableAnalysis(parsed) {
    boundVariables.innerHTML = '';
    freeVariables.innerHTML = '';

    statusText.textContent = '正在分析变元...';

    // 约束变元
    if (parsed.boundVars.length > 0) {
        for (const v of parsed.boundVars) {
            await sleep(getDelay() * 0.5);

            const item = document.createElement('div');
            item.className = 'variable-item bound';

            const quantifier = parsed.scopeMap.get(v)?.quantifier || '';
            item.innerHTML = `
                <span class="var-symbol">${v}</span>
                <span class="var-info">被 ${quantifier} 约束</span>
            `;

            boundVariables.appendChild(item);
            setTimeout(() => item.classList.add('visible'), 10);
        }
    } else {
        boundVariables.innerHTML = '<p class="no-vars">无约束变元</p>';
    }

    // 自由变元
    if (parsed.freeVars.length > 0) {
        for (const v of parsed.freeVars) {
            await sleep(getDelay() * 0.5);

            const item = document.createElement('div');
            item.className = 'variable-item free';

            item.innerHTML = `
                <span class="var-symbol">${v}</span>
                <span class="var-info">自由变元</span>
            `;

            freeVariables.appendChild(item);
            setTimeout(() => item.classList.add('visible'), 10);
        }
    } else {
        freeVariables.innerHTML = '<p class="no-vars">无自由变元</p>';
    }
}

// 渲染闭式检测
async function renderClosedFormCheck(parsed) {
    closedFormCheck.innerHTML = '';

    statusText.textContent = '正在检测闭式...';
    await sleep(getDelay());

    const isClosed = parsed.isClosed;
    const resultDiv = document.createElement('div');
    resultDiv.className = `closed-result ${isClosed ? 'is-closed' : 'not-closed'}`;

    resultDiv.innerHTML = `
        <div class="result-icon">${isClosed ? '✓' : '✗'}</div>
        <div class="result-content">
            <div class="result-title">${isClosed ? '这是一个闭式' : '这不是闭式'}</div>
            <div class="result-desc">
                ${isClosed
                    ? '所有变元都被量词约束,公式具有确定的真值'
                    : `存在 ${parsed.freeVars.length} 个自由变元: ${Array.from(parsed.freeVars).join(', ')}`
                }
            </div>
            <div class="result-explanation">
                ${isClosed
                    ? '闭式公式在任何解释下都有确定的真值,适合表达普遍规律和真理'
                    : '含有自由变元的公式其真值依赖于变元的赋值'
                }
            </div>
        </div>
    `;

    closedFormCheck.appendChild(resultDiv);
    setTimeout(() => resultDiv.classList.add('visible'), 10);
}

// 渲染变元换名演示
async function renderRenameDemo(parsed) {
    renameDemo.innerHTML = '';

    if (parsed.boundVars.length === 0) {
        renameDemo.innerHTML = '<p class="no-data">此公式无约束变元,无法演示换名</p>';
        return;
    }

    statusText.textContent = '正在生成换名示例...';
    await sleep(getDelay());

    const parser = new FormulaParser(parsed.formula);
    parser.parse();

    // 为每个约束变元生成换名示例
    const newVars = ['u', 'v', 'w', 't', 's'];
    let varIndex = 0;

    for (const oldVar of parsed.boundVars) {
        if (varIndex >= newVars.length) break;

        const newVar = newVars[varIndex++];
        const result = parser.generateRenamedFormula(oldVar, newVar);

        await sleep(getDelay() * 0.6);

        const renameItem = document.createElement('div');
        renameItem.className = 'rename-item';

        renameItem.innerHTML = `
            <div class="rename-header">
                <span class="rename-old">${oldVar}</span>
                <span class="rename-arrow">→</span>
                <span class="rename-new">${newVar}</span>
            </div>
            <div class="rename-formulas">
                <div class="rename-original">
                    <div class="rename-label">原公式:</div>
                    <div class="rename-formula">${parsed.formula}</div>
                </div>
                <div class="rename-result">
                    <div class="rename-label">换名后:</div>
                    <div class="rename-formula">${result.success ? result.newFormula : result.message}</div>
                </div>
            </div>
            <div class="rename-note ${result.success ? 'success' : 'error'}">
                ${result.message}
            </div>
        `;

        renameDemo.appendChild(renameItem);
        setTimeout(() => renameItem.classList.add('visible'), 10);
    }
}

// 渲染语法树
async function renderSyntaxTree(parsed) {
    treeGroup.innerHTML = '';

    statusText.textContent = '正在构建语法树...';
    await sleep(getDelay());

    const width = treeSvg.clientWidth || 800;
    const height = 400;

    // 根节点 - 公式
    const rootX = width / 2;
    const rootY = 60;

    drawTreeNode(rootX, rootY, '公式', '#8b0000', 45);

    // 第一层:量词和主体
    const hasQuantifiers = parsed.quantifiers.length > 0;

    if (hasQuantifiers) {
        // 量词节点
        const quantX = rootX - 150;
        const quantY = 180;
        drawTreeEdge(rootX, rootY + 45, quantX, quantY - 35);
        drawTreeNode(quantX, quantY, '量词部分', '#d63b1d', 35);

        // 绘制每个量词
        parsed.quantifiers.forEach((q, idx) => {
            const qX = quantX + (idx - parsed.quantifiers.length / 2 + 0.5) * 80;
            const qY = 280;
            drawTreeEdge(quantX, quantY + 35, qX, qY - 30);
            drawTreeNode(qX, qY, `${q.type}${q.variable}`, '#ff8c75', 30);
        });

        // 主体节点
        const bodyX = rootX + 150;
        const bodyY = 180;
        drawTreeEdge(rootX, rootY + 45, bodyX, bodyY - 35);
        drawTreeNode(bodyX, bodyY, '主体公式', '#ffb400', 35);
    }

    // 变元节点
    const varY = hasQuantifiers ? 340 : 180;
    const boundVarX = rootX - 180;
    const freeVarX = rootX + 180;

    if (parsed.boundVars.length > 0) {
        const startY = hasQuantifiers ? 280 : rootY + 45;
        drawTreeEdge(hasQuantifiers ? rootX - 150 : rootX, startY, boundVarX, varY - 25);
        drawTreeNode(boundVarX, varY, `约束变元\n{${parsed.boundVars.join(',')}}`, '#d63b1d', 30);
    }

    if (parsed.freeVars.length > 0) {
        const startY = hasQuantifiers ? 215 : rootY + 45;
        drawTreeEdge(hasQuantifiers ? rootX + 150 : rootX, startY, freeVarX, varY - 25);
        drawTreeNode(freeVarX, varY, `自由变元\n{${Array.from(parsed.freeVars).join(',')}}`, '#ffb400', 30);
    }
}

function drawTreeNode(x, y, text, color, r) {
    const circle = createSVGElement('circle', {
        cx: x,
        cy: y,
        r: r,
        fill: color,
        stroke: '#fff',
        'stroke-width': 3,
        filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))'
    });

    const textLines = text.split('\n');
    const textGroup = createSVGElement('g');

    textLines.forEach((line, idx) => {
        const textEl = createSVGElement('text', {
            x: x,
            y: y + (idx - textLines.length / 2 + 0.5) * 16,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            fill: '#fff',
            'font-size': r > 35 ? '14' : '12',
            'font-weight': 'bold',
            'font-family': 'Noto Serif SC, sans-serif'
        });
        textEl.textContent = line;
        textGroup.appendChild(textEl);
    });

    treeGroup.appendChild(circle);
    treeGroup.appendChild(textGroup);
}

function drawTreeEdge(x1, y1, x2, y2) {
    const path = createSVGElement('path', {
        d: `M ${x1} ${y1} Q ${x1} ${(y1 + y2) / 2} ${x2} ${y2}`,
        stroke: '#d63b1d',
        'stroke-width': 2,
        fill: 'none',
        opacity: 0.6,
        'marker-end': 'url(#arrowhead)'
    });
    treeGroup.appendChild(path);
}

function createSVGElement(type, attributes = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    return el;
}

// 主流程
async function startAnalysis() {
    if (isRunning) return;

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
                alert('请输入谓词公式!');
                resetAnalysis();
                return;
            }
            formulaData = {
                formula: customFormula,
                description: '自定义公式',
                context: '用户输入的谓词公式',
                theme: '自定义'
            };
        } else {
            formulaData = FORMULAS[parseInt(formulaSelect.value)];
        }

        currentFormula = formulaData;

        // 渲染原始公式
        renderOriginalFormula(formulaData);
        await sleep(500);

        // 解析公式
        statusText.textContent = '正在解析公式结构...';
        const parser = new FormulaParser(formulaData.formula);
        parsedFormula = parser.parse();

        // 更新统计
        quantifierCount.textContent = parsedFormula.quantifiers.length;
        variableCount.textContent = parsedFormula.variables.length;

        await sleep(500);

        if (!shouldStop) {
            // 辖域分析
            await renderScopeVisualization(parsedFormula);
            await sleep(300);

            // 变元分析
            await renderVariableAnalysis(parsedFormula);
            await sleep(300);

            // 闭式检测
            await renderClosedFormCheck(parsedFormula);
            await sleep(300);

            // 换名演示
            await renderRenameDemo(parsedFormula);
            await sleep(300);

            // 语法树
            await renderSyntaxTree(parsedFormula);

            statusText.textContent = '解析完成!';
        }
    } catch (error) {
        console.error('解析错误:', error);
        statusText.textContent = '解析出错: ' + error.message;
    }

    isRunning = false;
    startBtn.disabled = false;
    formulaSelect.disabled = false;
}

function resetAnalysis() {
    shouldStop = true;
    isRunning = false;

    originalFormula.innerHTML = '';
    formulaDescription.innerHTML = '';
    scopeVisualization.innerHTML = '';
    boundVariables.innerHTML = '';
    freeVariables.innerHTML = '';
    closedFormCheck.innerHTML = '';
    renameDemo.innerHTML = '';
    treeGroup.innerHTML = '';

    quantifierCount.textContent = '0';
    variableCount.textContent = '0';
    statusText.textContent = '准备解析';

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
    resetAnalysis();
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        analysisMode = e.target.dataset.mode;
    });
});

startBtn.addEventListener('click', startAnalysis);
resetBtn.addEventListener('click', resetAnalysis);

// 键盘快捷键
customInput.addEventListener('keydown', (e) => {
    if (e.altKey) {
        switch (e.key.toLowerCase()) {
            case 'a': e.preventDefault(); insertSymbol('∀'); break;
            case 'e': e.preventDefault(); insertSymbol('∃'); break;
            case 'v': e.preventDefault(); insertSymbol('∧'); break;
            case '7': e.preventDefault(); insertSymbol('∨'); break;
            case 'n': e.preventDefault(); insertSymbol('¬'); break;
            case 'r': e.preventDefault(); insertSymbol('→'); break;
        }
    }
});

function insertSymbol(symbol) {
    const start = customInput.selectionStart;
    const end = customInput.selectionEnd;
    const text = customInput.value;
    customInput.value = text.substring(0, start) + symbol + text.substring(end);
    customInput.selectionStart = customInput.selectionEnd = start + symbol.length;
    customInput.focus();
}

// 初始化
window.addEventListener('load', () => {
    currentFormula = FORMULAS[0];
    renderOriginalFormula(currentFormula);
});
