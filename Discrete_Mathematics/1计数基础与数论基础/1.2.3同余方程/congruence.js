/**
 * 同余方程 - 思政可视化
 * 主题：平衡协调·和谐统一
 */

// DOM 元素
const themeSelect = document.getElementById('themeSelect');
const aSlider = document.getElementById('aSlider');
const bSlider = document.getElementById('bSlider');
const mSlider = document.getElementById('mSlider');
const aDisplay = document.getElementById('aDisplay');
const bDisplay = document.getElementById('bDisplay');
const mDisplay = document.getElementById('mDisplay');
const aValue = document.getElementById('aValue');
const bValue = document.getElementById('bValue');
const mValue = document.getElementById('mValue');
const solveBtn = document.getElementById('solveBtn');
const resetBtn = document.getElementById('resetBtn');
const vizArea = document.getElementById('vizArea');
const legendPanel = document.getElementById('legendPanel');
const resultPanel = document.getElementById('resultPanel');
const politicalMeaning = document.getElementById('politicalMeaning');
const stageTitle = document.getElementById('stageTitle');
const stageDescription = document.getElementById('stageDescription');

// 状态
let a = 3, b = 2, m = 7;
let currentTheme = 'balance';
let isAnimating = false;

// 思政主题数据
const themes = {
    balance: {
        name: '平衡分配',
        description: '在资源有限的情况下寻找平衡点',
        meaning: '象征平衡分配，寻找满足条件的平衡点x',
        scenarios: [
            '资源在各部门间的平衡分配',
            '任务在各团队间的合理分工',
            '经费在各项目间的统筹安排',
            '人员在各岗位间的优化配置',
            '时间在各事项间的科学规划'
        ],
        application: '通过同余方程找到平衡分配方案，确保公平公正'
    },
    coordination: {
        name: '协调发展',
        description: '多方协调，寻找共同发展路径',
        meaning: '象征协调发展，找到多方都能接受的解决方案',
        scenarios: [
            '东西部地区协调发展',
            '城乡之间统筹规划',
            '各行业之间协同推进',
            '上下级之间高效协作',
            '新老干部之间平稳过渡'
        ],
        application: '寻找协调发展的平衡点，实现多方共赢'
    },
    harmony: {
        name: '和谐统一',
        description: '在多样性中寻求统一',
        meaning: '象征和谐统一，在差异中寻找共同点',
        scenarios: [
            '不同意见中寻求共识',
            '多元文化中保持统一',
            '个人利益与集体利益统一',
            '经济发展与生态保护和谐',
            '传统文化与现代文明融合'
        ],
        application: '用同余方程找到和谐统一的平衡点'
    },
    resolution: {
        name: '矛盾解决',
        description: '化解矛盾，找到解决方案',
        meaning: '象征矛盾解决，通过数学方法化解矛盾',
        scenarios: [
            '群众诉求与现实条件的平衡',
            '发展速度与质量效益的统一',
            '改革力度与社会承受的协调',
            '长远目标与当前利益的兼顾',
            '宏观调控与市场机制的结合'
        ],
        application: '通过求解方程找到化解矛盾的关键点'
    }
};

// 初始化
function init() {
    attachEventListeners();
    updateEquation();
    updateThemeInfo();
    updateResults();
}

// 事件监听
function attachEventListeners() {
    themeSelect.addEventListener('change', () => {
        currentTheme = themeSelect.value;
        updateThemeInfo();
    });

    aSlider.addEventListener('input', () => {
        a = parseInt(aSlider.value);
        aDisplay.textContent = a;
        updateEquation();
        updateResults();
    });

    bSlider.addEventListener('input', () => {
        b = parseInt(bSlider.value);
        bDisplay.textContent = b;
        updateEquation();
        updateResults();
    });

    mSlider.addEventListener('input', () => {
        m = parseInt(mSlider.value);
        mDisplay.textContent = m;
        updateEquation();
        updateResults();
    });

    solveBtn.addEventListener('click', solve);
    resetBtn.addEventListener('click', reset);
}

// 更新方程显示
function updateEquation() {
    aValue.textContent = a;
    bValue.textContent = b;
    mValue.textContent = m;
}

// 更新主题信息
function updateThemeInfo() {
    const theme = themes[currentTheme];
    politicalMeaning.textContent = theme.meaning;
    stageTitle.textContent = `同余方程求解 - ${theme.name}`;
    stageDescription.textContent = theme.description;
}

// 计算最大公约数
function gcd(a, b) {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// 扩展欧几里得算法
function extendedGCD(a, b) {
    if (b === 0) {
        return { gcd: a, x: 1, y: 0 };
    }
    const result = extendedGCD(b, a % b);
    const x = result.y;
    const y = result.x - Math.floor(a / b) * result.y;
    return { gcd: result.gcd, x, y };
}

// 求解同余方程 ax ≡ b (mod m)
function solveCongruence(a, b, m) {
    const g = gcd(a, m);

    // 检查是否有解
    if (b % g !== 0) {
        return { hasSolution: false };
    }

    // 简化方程
    const a1 = a / g;
    const b1 = b / g;
    const m1 = m / g;

    // 使用扩展欧几里得算法求解
    const result = extendedGCD(a1, m1);
    let x0 = (result.x * b1) % m1;

    // 确保基础解为非负数
    if (x0 < 0) x0 += m1;

    // 找出所有解（mod m）
    const solutions = [];
    for (let i = 0; i < g; i++) {
        solutions.push((x0 + i * m1) % m);
    }

    return {
        hasSolution: true,
        gcd: g,
        solutions: solutions.sort((a, b) => a - b),
        basicSolution: x0
    };
}

// 更新结果
function updateResults() {
    const result = solveCongruence(a, b, m);

    resultPanel.innerHTML = '';

    if (result.hasSolution) {
        resultPanel.innerHTML = `
            <div class="result-item">
                <span class="result-label">方程状态</span>
                <span class="result-value" style="color: var(--accent-green);">有解</span>
            </div>
            <div class="result-item">
                <span class="result-label">解的个数</span>
                <span class="result-value">${result.solutions.length}</span>
            </div>
            <div class="result-item">
                <span class="result-label">最小非负解</span>
                <span class="result-value">x = ${result.solutions[0]}</span>
            </div>
        `;
    } else {
        resultPanel.innerHTML = `
            <div class="result-item">
                <span class="result-label">方程状态</span>
                <span class="result-value" style="color: #e74c3c;">无解</span>
            </div>
            <div class="result-item" style="grid-column: 1 / -1;">
                <span class="result-label" style="font-size: 0.75rem;">条件：gcd(${a}, ${m}) = ${gcd(a, m)} 不能整除 ${b}</span>
            </div>
        `;
    }
}

// 求解并可视化
async function solve() {
    if (isAnimating) return;
    isAnimating = true;
    solveBtn.disabled = true;
    solveBtn.textContent = '求解中...';

    vizArea.innerHTML = '';
    legendPanel.innerHTML = '';

    const result = solveCongruence(a, b, m);
    const theme = themes[currentTheme];

    const container = document.createElement('div');
    container.className = 'solution-container';
    vizArea.appendChild(container);

    // 步骤1：显示原方程
    await sleep(300);
    const step1 = createStepCard(1, '原方程',
        `求解同余方程：${a}x ≡ ${b} (mod ${m})`,
        `${a}x ≡ ${b} (mod ${m})`);
    container.appendChild(step1);

    // 步骤2：检查是否有解
    await sleep(500);
    const g = gcd(a, m);
    const step2 = createStepCard(2, '检查可解性',
        `计算 gcd(${a}, ${m}) = ${g}<br>检查：${b} ÷ ${g} ${b % g === 0 ? '✓ 可以整除' : '✗ 不能整除'}`,
        `gcd(${a}, ${m}) = ${g}`);
    container.appendChild(step2);

    if (!result.hasSolution) {
        // 无解情况
        await sleep(500);
        const noSolution = document.createElement('div');
        noSolution.className = 'political-application';
        noSolution.innerHTML = `
            <h3>⚠️ 方程无解</h3>
            <p>gcd(${a}, ${m}) = ${g} 不能整除 ${b}</p>
            <p style="margin-top: 1rem;">思政寓意：某些条件下可能没有完美的平衡点，需要调整参数或重新规划方案</p>
        `;
        container.appendChild(noSolution);
    } else {
        // 有解情况
        await sleep(500);
        const step3 = createStepCard(3, '求解过程',
            `使用扩展欧几里得算法求解<br>基础解：x₀ = ${result.basicSolution}`,
            `x₀ = ${result.basicSolution}`);
        container.appendChild(step3);

        // 步骤4：展示所有解
        await sleep(500);
        const step4 = document.createElement('div');
        step4.className = 'step-card';
        step4.style.animationDelay = '0.3s';
        step4.innerHTML = `
            <div class="step-header">
                <div class="step-number">4</div>
                <div class="step-title">验证所有解（在 mod ${m} 下）</div>
            </div>
            <div class="step-content">
                共有 ${result.solutions.length} 个解，测试 x = 0 到 ${m - 1}：
            </div>
        `;

        const grid = document.createElement('div');
        grid.className = 'solution-grid';

        for (let x = 0; x < m; x++) {
            await sleep(50);
            const card = document.createElement('div');
            card.className = 'test-card';

            const isSolution = result.solutions.includes(x);
            card.classList.add(isSolution ? 'solution' : 'non-solution');

            const leftSide = (a * x) % m;
            const rightSide = b % m;
            const check = leftSide === rightSide;

            card.innerHTML = `
                <div class="test-number">x = ${x}</div>
                <div class="test-label">${leftSide} ${check ? '✓' : '≠'} ${rightSide}</div>
            `;
            grid.appendChild(card);
        }

        step4.appendChild(grid);
        container.appendChild(step4);

        // 思政应用
        await sleep(500);
        const scenarioIndex = result.solutions[0] % theme.scenarios.length;
        const application = document.createElement('div');
        application.className = 'political-application';
        application.innerHTML = `
            <h3>💡 ${theme.name}应用</h3>
            <p><strong>解：x = ${result.solutions.join(', ')}</strong></p>
            <p style="margin-top: 1rem;">${theme.scenarios[scenarioIndex]}</p>
            <p style="margin-top: 0.5rem;">${theme.application}</p>
        `;
        container.appendChild(application);
    }

    // 图例
    legendPanel.innerHTML = `
        <div class="legend-item">
            <div class="legend-color" style="background: linear-gradient(135deg, var(--accent-green) 0%, #20a037 100%);"></div>
            <span>✅ 方程的解 - 满足平衡条件的点</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #ecf0f1;"></div>
            <span>❌ 不是解 - 不满足平衡条件</span>
        </div>
        <div class="legend-item" style="width: 100%; justify-content: center; font-weight: 600; color: var(--accent-purple);">
            💡 ${theme.meaning}
        </div>
    `;

    solveBtn.disabled = false;
    solveBtn.textContent = '🎯 求解方程';
    isAnimating = false;
}

// 创建步骤卡片
function createStepCard(number, title, content, formula) {
    const card = document.createElement('div');
    card.className = 'step-card';
    card.style.animationDelay = `${number * 0.1}s`;

    card.innerHTML = `
        <div class="step-header">
            <div class="step-number">${number}</div>
            <div class="step-title">${title}</div>
        </div>
        <div class="step-content">${content}</div>
        ${formula ? `<div class="step-formula">${formula}</div>` : ''}
    `;

    return card;
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
