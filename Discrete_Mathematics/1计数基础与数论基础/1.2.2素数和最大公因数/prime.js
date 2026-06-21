/**
 * 素数与最大公因数 - 价值引领可视化
 * 主题：不可分割·求同存异
 */

// DOM 元素
const modeTabs = document.querySelectorAll('.mode-tab');
const themeSelect = document.getElementById('themeSelect');
const rangeSlider = document.getElementById('rangeSlider');
const num1Slider = document.getElementById('num1Slider');
const num2Slider = document.getElementById('num2Slider');
const rangeValue = document.getElementById('rangeValue');
const num1Value = document.getElementById('num1Value');
const num2Value = document.getElementById('num2Value');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const vizArea = document.getElementById('vizArea');
const legendPanel = document.getElementById('legendPanel');
const primeControls = document.getElementById('primeControls');
const gcdControls = document.getElementById('gcdControls');
const principleTitle = document.getElementById('principleTitle');
const principleFormula = document.getElementById('principleFormula');
const principleExplanation = document.getElementById('principleExplanation');
const politicalMeaning = document.getElementById('politicalMeaning');
const resultPanel = document.getElementById('resultPanel');
const stageTitle = document.getElementById('stageTitle');
const stageDescription = document.getElementById('stageDescription');

// 状态
let currentMode = 'prime';
let currentTheme = 'core';
let maxRange = 50;
let num1 = 48;
let num2 = 36;
let isAnimating = false;

// 价值主题数据
const themes = {
    prime: {
        core: {
            title: '核心价值观',
            description: '展示核心价值的不可分割性',
            items: [
                '富强', '民主', '文明', '和谐', '自由',
                '平等', '公正', '法治', '爱国', '敬业',
                '诚信', '友善', '创新', '协调', '绿色',
                '开放', '共享', '自信', '包容', '进取'
            ],
            meaning: '核心价值观如同素数，不可分割，是社会的基石'
        },
        foundation: {
            title: '基层基础',
            description: '展示基层组织的基础性',
            items: [
                '党支部', '党小组', '工会', '团支部', '妇联',
                '村委会', '居委会', '人大代表', '政协委员', '基层干部',
                '社区服务', '志愿者', '党员先锋', '群众骨干', '调解员',
                '网格员', '协管员', '监督员', '指导员', '联络员'
            ],
            meaning: '基层组织如同素数，是最基本的单位，不可再分'
        },
        unity: {
            title: '团结协作',
            description: '展示团队的独特价值',
            items: [
                '张书记', '李部长', '王主任', '赵科长', '孙处长',
                '周局长', '吴主席', '郑委员', '陈干事', '刘专员',
                '杨教授', '朱研究员', '徐工程师', '马医生', '胡律师',
                '林经理', '黄会计', '梁分析师', '韩顾问', '秦策划'
            ],
            meaning: '每个人都有独特价值，不可替代'
        },
        consensus: {
            title: '求同存异',
            description: '展示共识的基础性',
            items: [
                '发展理念', '奋斗目标', '价值追求', '使命担当', '责任意识',
                '大局观念', '服务精神', '创新思维', '实干作风', '廉洁自律',
                '群众路线', '民主集中', '批评自我', '团结奋进', '改革创新',
                '依法治国', '以人为本', '科学发展', '和谐社会', '共同富裕'
            ],
            meaning: '基本共识如同素数，是合作的基础'
        }
    },
    gcd: {
        unity: {
            title: '团结协作',
            description: '寻找共同基础，团结合作',
            meaning: '不同团队间寻找最大公约数，实现协同发展'
        },
        consensus: {
            title: '求同存异',
            description: '求同存异，寻找共识',
            meaning: '在分歧中寻找最大共识，团结一切可以团结的力量'
        },
        core: {
            title: '核心价值观',
            description: '提炼共同价值',
            meaning: '从多元价值中提炼核心价值，形成最大公约数'
        },
        foundation: {
            title: '基层基础',
            description: '找到共同基础',
            meaning: '不同基层组织找到共同基础，协调发展'
        }
    }
};

// 初始化
function init() {
    attachEventListeners();
    updatePrincipleInfo();
    updateResults();
}

// 事件监听
function attachEventListeners() {
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentMode = tab.getAttribute('data-mode');
            switchMode();
        });
    });

    themeSelect.addEventListener('change', () => {
        currentTheme = themeSelect.value;
        updatePrincipleInfo();
        updateResults();
    });

    rangeSlider.addEventListener('input', () => {
        maxRange = parseInt(rangeSlider.value);
        rangeValue.textContent = maxRange;
        updateResults();
    });

    num1Slider.addEventListener('input', () => {
        num1 = parseInt(num1Slider.value);
        num1Value.textContent = num1;
        updateResults();
    });

    num2Slider.addEventListener('input', () => {
        num2 = parseInt(num2Slider.value);
        num2Value.textContent = num2;
        updateResults();
    });

    visualizeBtn.addEventListener('click', visualize);
    resetBtn.addEventListener('click', reset);
}

// 切换模式
function switchMode() {
    if (currentMode === 'prime') {
        primeControls.classList.remove('hidden');
        gcdControls.classList.add('hidden');
    } else {
        primeControls.classList.add('hidden');
        gcdControls.classList.remove('hidden');
    }

    updatePrincipleInfo();
    updateResults();
    reset();
}

// 更新原理说明
function updatePrincipleInfo() {
    if (currentMode === 'prime') {
        const theme = themes.prime[currentTheme];
        principleTitle.textContent = `素数与${theme.title}`;
        principleFormula.textContent = '只能被1和自身整除的自然数';
        principleExplanation.textContent = theme.description;
        politicalMeaning.textContent = theme.meaning;
        stageTitle.textContent = `素数分布 - ${theme.title}`;
        stageDescription.textContent = theme.description;
    } else {
        const theme = themes.gcd[currentTheme];
        principleTitle.textContent = `最大公因数与${theme.title}`;
        principleFormula.textContent = 'GCD(a,b) = 最大的能同时整除a和b的数';
        principleExplanation.textContent = theme.description;
        politicalMeaning.textContent = theme.meaning;
        stageTitle.textContent = `最大公因数 - ${theme.title}`;
        stageDescription.textContent = theme.description;
    }
}

// 更新结果
function updateResults() {
    resultPanel.innerHTML = '';

    if (currentMode === 'prime') {
        const primes = findPrimes(maxRange);
        resultPanel.innerHTML = `
            <div class="result-item">
                <span class="result-label">数值范围</span>
                <span class="result-value">2 - ${maxRange}</span>
            </div>
            <div class="result-item">
                <span class="result-label">素数个数</span>
                <span class="result-value">${primes.length}</span>
            </div>
            <div class="result-item">
                <span class="result-label">合数个数</span>
                <span class="result-value">${maxRange - 1 - primes.length}</span>
            </div>
        `;
    } else {
        const gcd = findGCD(num1, num2);
        resultPanel.innerHTML = `
            <div class="result-item">
                <span class="result-label">第一个数</span>
                <span class="result-value">${num1}</span>
            </div>
            <div class="result-item">
                <span class="result-label">第二个数</span>
                <span class="result-value">${num2}</span>
            </div>
            <div class="result-item">
                <span class="result-label">最大公因数</span>
                <span class="result-value">${gcd}</span>
            </div>
        `;
    }
}

// 判断素数
function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}

// 找出范围内的所有素数
function findPrimes(max) {
    const primes = [];
    for (let i = 2; i <= max; i++) {
        if (isPrime(i)) primes.push(i);
    }
    return primes;
}

// 计算最大公因数（欧几里得算法）
function findGCD(a, b) {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// 找出一个数的所有因数
function findFactors(n) {
    const factors = [];
    for (let i = 1; i <= n; i++) {
        if (n % i === 0) factors.push(i);
    }
    return factors;
}

// 可视化
async function visualize() {
    if (isAnimating) return;
    isAnimating = true;
    visualizeBtn.disabled = true;
    visualizeBtn.textContent = '生成中...';

    vizArea.innerHTML = '';
    legendPanel.innerHTML = '';

    if (currentMode === 'prime') {
        await visualizePrimes();
    } else {
        await visualizeGCD();
    }

    visualizeBtn.disabled = false;
    visualizeBtn.textContent = '🎯 开始可视化';
    isAnimating = false;
}

// 可视化素数
async function visualizePrimes() {
    const theme = themes.prime[currentTheme];
    const primes = findPrimes(maxRange);
    const primeSet = new Set(primes);

    const grid = document.createElement('div');
    grid.className = 'number-grid';
    vizArea.appendChild(grid);

    for (let i = 2; i <= maxRange; i++) {
        await sleep(15);

        const card = document.createElement('div');
        card.className = 'number-card';

        const isPrimeNum = primeSet.has(i);
        card.classList.add(isPrimeNum ? 'prime' : 'composite');
        card.style.animationDelay = `${i * 0.01}s`;

        const number = document.createElement('div');
        number.className = 'card-number';
        number.textContent = i;

        const label = document.createElement('div');
        label.className = 'card-label';

        if (isPrimeNum) {
            const itemIndex = (primes.indexOf(i)) % theme.items.length;
            label.textContent = theme.items[itemIndex];
        } else {
            label.textContent = '合数';
        }

        card.appendChild(number);
        card.appendChild(label);
        grid.appendChild(card);
    }

    // 图例
    legendPanel.innerHTML = `
        <div class="legend-item">
            <div class="legend-color" style="background: linear-gradient(135deg, #d63b1d 0%, #b32b12 100%);"></div>
            <span>✨ 素数（${primes.length}个）- ${theme.title}的基础元素</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #ecf0f1;"></div>
            <span>⚪ 合数（${maxRange - 1 - primes.length}个）- 可分解的复合元素</span>
        </div>
        <div class="legend-item" style="width: 100%; justify-content: center; font-weight: 600; color: var(--accent-red);">
            💡 素数占比: ${(primes.length / (maxRange - 1) * 100).toFixed(1)}%
        </div>
    `;
}

// 可视化最大公因数
async function visualizeGCD() {
    const container = document.createElement('div');
    container.className = 'gcd-container';
    vizArea.appendChild(container);

    const factors1 = findFactors(num1);
    const factors2 = findFactors(num2);
    const gcd = findGCD(num1, num2);

    // 第一个数的因数
    const box1 = document.createElement('div');
    box1.className = 'number-box';
    box1.innerHTML = `<h3>数值 ${num1} 的因数</h3>`;
    const grid1 = document.createElement('div');
    grid1.className = 'factors-grid';

    for (let factor of factors1) {
        await sleep(50);
        const badge = document.createElement('div');
        badge.className = 'factor-badge';
        if (factors2.includes(factor)) {
            badge.classList.add('common');
        }
        badge.textContent = factor;
        grid1.appendChild(badge);
    }
    box1.appendChild(grid1);
    container.appendChild(box1);

    // 第二个数的因数
    const box2 = document.createElement('div');
    box2.className = 'number-box';
    box2.innerHTML = `<h3>数值 ${num2} 的因数</h3>`;
    const grid2 = document.createElement('div');
    grid2.className = 'factors-grid';

    for (let factor of factors2) {
        await sleep(50);
        const badge = document.createElement('div');
        badge.className = 'factor-badge';
        if (factors1.includes(factor)) {
            badge.classList.add('common');
        }
        badge.textContent = factor;
        grid2.appendChild(badge);
    }
    box2.appendChild(grid2);
    container.appendChild(box2);

    // GCD结果
    await sleep(500);
    const resultBox = document.createElement('div');
    resultBox.className = 'gcd-result';
    resultBox.innerHTML = `
        <h3>最大公因数</h3>
        <div class="gcd-value">${gcd}</div>
        <div class="gcd-explanation">GCD(${num1}, ${num2}) = ${gcd}</div>
        <div class="gcd-explanation" style="margin-top: 1rem;">这是两个数共有的最大因数，代表最大的共同基础</div>
    `;
    container.appendChild(resultBox);

    // 图例
    const theme = themes.gcd[currentTheme];
    legendPanel.innerHTML = `
        <div class="legend-item">
            <div class="legend-color" style="background: var(--accent-red);"></div>
            <span>⭐ 共同因数 - ${theme.title}的共同基础</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: var(--accent-blue);"></div>
            <span>📌 独有因数 - 各自的特色</span>
        </div>
        <div class="legend-item" style="width: 100%; justify-content: center; font-weight: 600; color: var(--accent-red);">
            💡 ${theme.meaning}
        </div>
    `;
}

// 重置
function reset() {
    vizArea.innerHTML = '';
    legendPanel.innerHTML = '';
}

// 工具函数：延迟
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 启动应用
init();
