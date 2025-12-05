/**
 * 集合论运算可视化 - 思政教育版
 */

// DOM 元素
const themeSelect = document.getElementById('themeSelect');
const operationBtns = document.querySelectorAll('.operation-btn');
const setASlider = document.getElementById('setASlider');
const setBSlider = document.getElementById('setBSlider');
const setACountSpan = document.getElementById('setACount');
const setBCountSpan = document.getElementById('setBCount');
const operationDesc = document.getElementById('operationDesc');
const statA = document.getElementById('statA');
const statB = document.getElementById('statB');
const statResult = document.getElementById('statResult');
const executeBtn = document.getElementById('executeBtn');
const randomBtn = document.getElementById('randomBtn');

const setACircle = document.getElementById('setACircle');
const setBCircle = document.getElementById('setBCircle');
const elementsGroup = document.getElementById('elementsGroup');
const resultGroup = document.getElementById('resultGroup');

// 状态
let currentTheme = 'revolutionary';
let currentOperation = 'union';
let setA = [];
let setB = [];
let resultSet = [];
let isAnimating = false;

// 思政主题数据
const themes = {
    revolutionary: {
        name: '革命精神',
        elements: [
            '自力更生', '艰苦奋斗', '勤俭节约', '服务人民',
            '实事求是', '团结协作', '开拓创新', '爱国主义',
            '集体主义', '社会主义', '为人民服务', '解放思想',
            '与时俱进', '求真务实', '清正廉洁', '公正法治'
        ]
    },
    development: {
        name: '发展理念',
        elements: [
            '创新驱动', '协调发展', '绿色发展', '开放合作',
            '共享成果', '科技强国', '文化自信', '生态文明',
            '共同富裕', '高质量发展', '乡村振兴', '区域协调',
            '数字中国', '智能制造', '绿水青山', '金山银山'
        ]
    },
    culture: {
        name: '文化传承',
        elements: [
            '仁义礼智信', '温良恭俭让', '忠孝节义', '诚信友善',
            '尊师重道', '敬老爱幼', '和谐共处', '天人合一',
            '自强不息', '厚德载物', '知行合一', '修身齐家',
            '经世致用', '格物致知', '民为邦本', '以德治国'
        ]
    }
};

// 运算说明
const operationDescriptions = {
    union: '并集（A ∪ B）：两个集合所有元素的合并，象征着团结的力量，凝聚共识，形成合力',
    intersection: '交集（A ∩ B）：两个集合共同拥有的元素，象征着共同目标和价值观的交汇',
    difference: '差集（A − B）：属于A但不属于B的元素，象征着特色与差异，保持独特性',
    symmetric: '对称差（A △ B）：只属于其中一个集合的元素，象征着互补与多元化发展'
};

// 初始化
function init() {
    generateSets();
    updateDisplay();
    attachEventListeners();
}

// 生成集合
function generateSets() {
    const themeData = themes[currentTheme];
    const elements = [...themeData.elements];

    // 打乱数组
    for (let i = elements.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [elements[i], elements[j]] = [elements[j], elements[i]];
    }

    const countA = parseInt(setASlider.value);
    const countB = parseInt(setBSlider.value);

    // 生成集合A
    setA = elements.slice(0, countA);

    // 生成集合B（保证有部分交集）
    const overlapCount = Math.floor(Math.min(countA, countB) / 2);
    const uniqueB = elements.slice(countA, countA + countB - overlapCount);
    const overlap = setA.slice(0, overlapCount);
    setB = [...overlap, ...uniqueB];

    // 打乱集合B
    for (let i = setB.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [setB[i], setB[j]] = [setB[j], setB[i]];
    }
}

// 计算运算结果
function calculateResult() {
    switch (currentOperation) {
        case 'union':
            resultSet = [...new Set([...setA, ...setB])];
            break;
        case 'intersection':
            resultSet = setA.filter(item => setB.includes(item));
            break;
        case 'difference':
            resultSet = setA.filter(item => !setB.includes(item));
            break;
        case 'symmetric':
            const onlyA = setA.filter(item => !setB.includes(item));
            const onlyB = setB.filter(item => !setA.includes(item));
            resultSet = [...onlyA, ...onlyB];
            break;
    }
}

// 更新显示
function updateDisplay() {
    calculateResult();

    // 更新统计
    setACountSpan.textContent = setA.length;
    setBCountSpan.textContent = setB.length;
    statA.textContent = setA.length;
    statB.textContent = setB.length;
    statResult.textContent = resultSet.length;

    // 更新说明
    operationDesc.textContent = operationDescriptions[currentOperation];

    // 渲染元素
    renderElements();
}

// 渲染元素
function renderElements() {
    elementsGroup.innerHTML = '';

    const svg = document.getElementById('mainSvg');
    const width = svg.clientWidth || 700;
    const height = svg.clientHeight || 500;

    // 获取集合圆心位置
    const centerA = { x: width * 0.35, y: height * 0.5 };
    const centerB = { x: width * 0.65, y: height * 0.5 };
    const radius = Math.min(width, height) * 0.25;

    // 更新圆圈位置
    setACircle.setAttribute('cx', centerA.x);
    setACircle.setAttribute('cy', centerA.y);
    setACircle.setAttribute('r', radius);

    setBCircle.setAttribute('cx', centerB.x);
    setBCircle.setAttribute('cy', centerB.y);
    setBCircle.setAttribute('r', radius);

    // 渲染集合A元素
    setA.forEach((element, index) => {
        const angle = (index / setA.length) * 2 * Math.PI;
        const distance = radius * 0.6;
        const x = centerA.x + Math.cos(angle) * distance;
        const y = centerA.y + Math.sin(angle) * distance;

        const inBoth = setB.includes(element);
        let elementX = x;

        // 如果在交集中，向右偏移
        if (inBoth) {
            elementX = centerA.x + (centerB.x - centerA.x) * 0.5 + (Math.random() - 0.5) * 20;
        }

        createElementNode(element, elementX, y, 'a', inBoth);
    });

    // 渲染集合B独有元素
    const uniqueB = setB.filter(item => !setA.includes(item));
    uniqueB.forEach((element, index) => {
        const angle = (index / uniqueB.length) * 2 * Math.PI;
        const distance = radius * 0.6;
        const x = centerB.x + Math.cos(angle) * distance;
        const y = centerB.y + Math.sin(angle) * distance;

        createElementNode(element, x, y, 'b', false);
    });
}

// 创建元素节点
function createElementNode(text, x, y, setType, inBoth) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('element');

    if (inBoth) {
        g.classList.add('in-both');
    } else if (setType === 'a') {
        g.classList.add('in-a');
    } else {
        g.classList.add('in-b');
    }

    g.setAttribute('data-element', text);
    g.setAttribute('transform', `translate(${x}, ${y})`);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.classList.add('element-circle');
    circle.setAttribute('r', 22);

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.classList.add('element-text');
    textEl.setAttribute('y', '0');
    textEl.setAttribute('dy', '.35em');
    textEl.textContent = text.length > 4 ? text.substring(0, 4) : text;

    g.appendChild(circle);
    g.appendChild(textEl);
    elementsGroup.appendChild(g);

    // 添加悬停提示
    g.addEventListener('mouseenter', function () {
        showTooltip(text, x, y);
    });

    g.addEventListener('mouseleave', function () {
        hideTooltip();
    });
}

// 工具提示
let tooltipElement = null;

function showTooltip(text, x, y) {
    hideTooltip();

    const svg = document.getElementById('mainSvg');
    tooltipElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    tooltipElement.classList.add('tooltip');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x - 40);
    rect.setAttribute('y', y - 50);
    rect.setAttribute('width', 80);
    rect.setAttribute('height', 30);
    rect.setAttribute('rx', 6);
    rect.setAttribute('fill', 'rgba(139, 0, 0, 0.9)');
    rect.setAttribute('stroke', '#ffb400');
    rect.setAttribute('stroke-width', 2);

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', x);
    textEl.setAttribute('y', y - 30);
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('fill', '#fff');
    textEl.setAttribute('font-size', '12px');
    textEl.setAttribute('font-weight', '600');
    textEl.textContent = text;

    tooltipElement.appendChild(rect);
    tooltipElement.appendChild(textEl);
    svg.appendChild(tooltipElement);
}

function hideTooltip() {
    if (tooltipElement) {
        tooltipElement.remove();
        tooltipElement = null;
    }
}

// 执行运算动画
async function executeOperation() {
    if (isAnimating) return;
    isAnimating = true;

    executeBtn.disabled = true;
    executeBtn.textContent = '运算中...';

    // 清除之前的高亮
    document.querySelectorAll('.element').forEach(el => {
        el.classList.remove('highlighted');
    });

    // 等待一下让用户看到状态变化
    await sleep(300);

    // 高亮结果元素
    for (const element of resultSet) {
        const elementNode = document.querySelector(`.element[data-element="${element}"]`);
        if (elementNode) {
            elementNode.classList.add('highlighted');
            await sleep(150);
        }
    }

    executeBtn.disabled = false;
    executeBtn.textContent = '执行运算';
    isAnimating = false;
}

// 工具函数：延迟
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 事件监听
function attachEventListeners() {
    // 主题选择
    themeSelect.addEventListener('change', () => {
        currentTheme = themeSelect.value;
        generateSets();
        updateDisplay();
    });

    // 运算类型选择
    operationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            operationBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentOperation = btn.getAttribute('data-operation');
            updateDisplay();
        });
    });

    // 滑块
    setASlider.addEventListener('input', () => {
        generateSets();
        updateDisplay();
    });

    setBSlider.addEventListener('input', () => {
        generateSets();
        updateDisplay();
    });

    // 按钮
    executeBtn.addEventListener('click', executeOperation);

    randomBtn.addEventListener('click', () => {
        // 随机选择主题
        const themeKeys = Object.keys(themes);
        const randomTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
        themeSelect.value = randomTheme;
        currentTheme = randomTheme;

        // 随机设置集合大小
        const randomA = Math.floor(Math.random() * 6) + 4;
        const randomB = Math.floor(Math.random() * 6) + 4;
        setASlider.value = randomA;
        setBSlider.value = randomB;

        generateSets();
        updateDisplay();
    });

    // 窗口调整
    window.addEventListener('resize', () => {
        updateDisplay();
    });
}

// 启动应用
init();
