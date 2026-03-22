/**
 * 数论基础：整除性与模算术 - 思政可视化
 * 主题：周期循环，顺序轮换
 */

// DOM 元素
const themeSelect = document.getElementById('themeSelect');
const periodSlider = document.getElementById('periodSlider');
const daysSlider = document.getElementById('daysSlider');
const periodValue = document.getElementById('periodValue');
const daysValue = document.getElementById('daysValue');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const vizArea = document.getElementById('vizArea');
const legendPanel = document.getElementById('legendPanel');
const resultPeriod = document.getElementById('resultPeriod');
const resultDays = document.getElementById('resultDays');
const resultCycles = document.getElementById('resultCycles');
const principleExplanation = document.getElementById('principleExplanation');
const politicalMeaning = document.getElementById('politicalMeaning');
const stageTitle = document.getElementById('stageTitle');
const stageDescription = document.getElementById('stageDescription');

// 状态
let currentTheme = 'rotation';
let period = 7;
let totalDays = 30;
let isAnimating = false;

// 思政主题数据
const themes = {
    rotation: {
        name: '干部轮岗制度',
        description: '展示轮岗岗位如何按周期顺序重复',
        people: [
            '党委书记',
            '副书记',
            '组织部长',
            '宣传部长',
            '纪检书记',
            '统战部长',
            '政法书记',
            '工会主席',
            '团委书记',
            '妇联主席',
            '人大主任',
            '政协主席'
        ],
        colors: [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24',
            '#6c5ce7', '#fd79a8', '#00b894', '#e17055',
            '#fab1a0', '#a29bfe', '#55efc4', '#fdcb6e'
        ],
        politicalMeaning: '体现轮岗制度的周期性，岗位按固定顺序重复出现'
    },
    scheduling: {
        name: '任务周期安排',
        description: '展示任务列表如何按周期循环执行',
        people: [
            '政策调研',
            '理论学习',
            '组织生活',
            '民主评议',
            '群众服务',
            '监督检查',
            '经验总结',
            '成果推广',
            '队伍培训',
            '考核评估',
            '文件起草',
            '会议组织'
        ],
        colors: [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12',
            '#9b59b6', '#1abc9c', '#34495e', '#16a085',
            '#27ae60', '#2980b9', '#8e44ad', '#d35400'
        ],
        politicalMeaning: '体现任务安排的周期性，确保工作有序推进'
    },
    distribution: {
        name: '资源循环利用',
        description: '展示资源投放位置如何按周期轮转',
        people: [
            '东部地区',
            '西部地区',
            '南部地区',
            '北部地区',
            '中部地区',
            '沿海地区',
            '内陆地区',
            '边疆地区',
            '老区',
            '新区',
            '特区',
            '自贸区'
        ],
        colors: [
            '#e67e22', '#3498db', '#2ecc71', '#e74c3c',
            '#9b59b6', '#f39c12', '#1abc9c', '#34495e',
            '#d35400', '#c0392b', '#8e44ad', '#27ae60'
        ],
        politicalMeaning: '体现资源分配的循环性，投放位置按固定周期重复出现'
    }
};

function getActiveCycle(theme) {
    const cycleLength = Math.min(period, theme.people.length, theme.colors.length);
    return {
        length: cycleLength,
        people: theme.people.slice(0, cycleLength),
        colors: theme.colors.slice(0, cycleLength)
    };
}

function getThemeMeaning(cycleLength) {
    switch (currentTheme) {
        case 'rotation':
            return `当前以前 ${cycleLength} 个岗位构成轮换周期；每完成一个完整周期，这些岗位各出现一次。`;
        case 'scheduling':
            return `当前以前 ${cycleLength} 项任务构成循环序列；若总天数不是周期倍数，前几项会多执行一次。`;
        case 'distribution':
            return `当前以前 ${cycleLength} 个投放位置构成资源轮转周期；模运算决定每天落在哪个位置。`;
        default:
            return '';
    }
}

// 初始化
function init() {
    attachEventListeners();
    updateValues();
}

// 事件监听
function attachEventListeners() {
    themeSelect.addEventListener('change', () => {
        currentTheme = themeSelect.value;
        updateThemeInfo();
        updateValues();
    });

    periodSlider.addEventListener('input', () => {
        period = parseInt(periodSlider.value);
        periodValue.textContent = period;
        updateValues();
    });

    daysSlider.addEventListener('input', () => {
        totalDays = parseInt(daysSlider.value);
        daysValue.textContent = totalDays;
        updateValues();
    });

    visualizeBtn.addEventListener('click', visualize);
    resetBtn.addEventListener('click', reset);
}

// 更新主题信息
function updateThemeInfo() {
    const theme = themes[currentTheme];
    const cycle = getActiveCycle(theme);
    stageTitle.textContent = theme.name;
    stageDescription.textContent = `${theme.description} 当前展示前 ${cycle.length} 个对象组成的周期序列。`;
    politicalMeaning.textContent = getThemeMeaning(cycle.length);
}

// 更新数值
function updateValues() {
    resultPeriod.textContent = period;
    resultDays.textContent = totalDays;
    const cycles = Math.floor(totalDays / period);
    const remainderDays = totalDays % period;
    resultCycles.textContent = cycles;
    principleExplanation.textContent = `第 n 天对应周期中的第 ((n - 1) mod ${period}) + 1 个位置；共 ${totalDays} 天，完成 ${cycles} 个完整周期，余 ${remainderDays} 天。`;
    updateThemeInfo();
}

// 可视化
async function visualize() {
    if (isAnimating) return;
    isAnimating = true;
    visualizeBtn.disabled = true;
    visualizeBtn.textContent = '生成中...';

    vizArea.innerHTML = '';
    legendPanel.innerHTML = '';

    const theme = themes[currentTheme];
    const cycle = getActiveCycle(theme);

    // 创建日历网格
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    vizArea.appendChild(grid);

    // 生成每一天的卡片
    for (let day = 1; day <= totalDays; day++) {
        await sleep(20);

        const slotIndex = (day - 1) % cycle.length;
        const colorIndex = slotIndex % cycle.colors.length;

        const card = document.createElement('div');
        card.className = 'day-card';
        card.style.backgroundColor = cycle.colors[colorIndex];
        card.style.color = '#fff';
        card.style.borderColor = cycle.colors[colorIndex];
        card.style.animationDelay = `${day * 0.01}s`;

        const dayNum = document.createElement('div');
        dayNum.className = 'day-number';
        dayNum.textContent = `第${day}天`;

        const person = document.createElement('div');
        person.className = 'day-person';
        person.textContent = cycle.people[slotIndex];

        card.appendChild(dayNum);
        card.appendChild(person);
        grid.appendChild(card);
    }

    // 生成图例
    generateLegend(cycle);

    visualizeBtn.disabled = false;
    visualizeBtn.textContent = '🎯 开始可视化';
    isAnimating = false;
}

// 生成图例
function generateLegend(cycle) {
    legendPanel.innerHTML = '';

    for (let i = 0; i < cycle.length; i++) {
        const item = document.createElement('div');
        item.className = 'legend-item';

        const color = document.createElement('div');
        color.className = 'legend-color';
        color.style.backgroundColor = cycle.colors[i % cycle.colors.length];

        const text = document.createElement('span');
        text.textContent = cycle.people[i];

        item.appendChild(color);
        item.appendChild(text);
        legendPanel.appendChild(item);
    }

    // 添加说明
    const explanation = document.createElement('div');
    explanation.className = 'legend-item';
    explanation.style.width = '100%';
    explanation.style.justifyContent = 'center';
    explanation.style.fontWeight = '600';
    explanation.style.color = 'var(--accent-red)';
    explanation.innerHTML = `💡 当前周期长度为 ${cycle.length}，第 n 天落在第 ((n - 1) mod ${cycle.length}) + 1 个位置`;
    legendPanel.appendChild(explanation);
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
updateThemeInfo();
