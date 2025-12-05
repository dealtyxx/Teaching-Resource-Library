/**
 * 鸽巢原理可视化 - 思政教育版
 */

// DOM 元素
const scenarioSelect = document.getElementById('scenarioSelect');
const holesSlider = document.getElementById('holesSlider');
const pigeonsSlider = document.getElementById('pigeonsSlider');
const holesCount = document.getElementById('holesCount');
const pigeonsCount = document.getElementById('pigeonsCount');
const principleDesc = document.getElementById('principleDesc');
const politicalMeaning = document.getElementById('politicalMeaning');
const resultHoles = document.getElementById('resultHoles');
const resultPigeons = document.getElementById('resultPigeons');
const minPerHole = document.getElementById('minPerHole');
const strategyBtns = document.querySelectorAll('.strategy-btn');
const distributeBtn = document.getElementById('distributeBtn');
const resetBtn = document.getElementById('resetBtn');
const pigeonsholesContainer = document.getElementById('pigeonsholesContainer');
const pigeonsList = document.getElementById('pigeonsList');
const statHoles = document.getElementById('statHoles');
const statPigeons = document.getElementById('statPigeons');
const statMax = document.getElementById('statMax');

// 状态
let currentScenario = 'resource';
let numHoles = 5;
let numPigeons = 8;
let currentStrategy = 'balanced';
let isAnimating = false;

// 思政场景数据
const scenarios = {
    resource: {
        name: '资源分配',
        holeName: '区域',
        pigeonName: '项目',
        items: [
            '教育项目', '医疗项目', '基建项目', '环保项目',
            '科技项目', '文化项目', '体育项目', '扶贫项目',
            '就业项目', '住房项目', '交通项目', '水利项目',
            '能源项目', '通信项目', '农业项目', '工业项目',
            '服务项目', '创新项目', '协调项目', '绿色项目'
        ],
        meaning: '有限的资源投入多个区域，必然有区域获得更多资源支持'
    },
    talent: {
        name: '人才培养',
        holeName: '岗位',
        pigeonName: '人才',
        items: [
            '张工程师', '李医生', '王教师', '赵研究员',
            '孙律师', '周经理', '吴设计师', '郑分析师',
            '陈程序员', '刘会计', '杨顾问', '朱专家',
            '徐技师', '马主管', '胡策划', '林翻译',
            '黄编辑', '梁培训师', '韩咨询师', '秦科学家'
        ],
        meaning: '培养的人才多于岗位数，必然有岗位接纳多位人才或产生竞争'
    },
    region: {
        name: '区域发展',
        holeName: '发展模式',
        pigeonName: '城市',
        items: [
            '北京', '上海', '广州', '深圳',
            '杭州', '成都', '重庆', '武汉',
            '西安', '南京', '天津', '苏州',
            '长沙', '郑州', '青岛', '济南',
            '合肥', '南昌', '福州', '厦门'
        ],
        meaning: '多个城市选择有限的发展模式，必然有模式被多个城市采用'
    },
    team: {
        name: '团队协作',
        holeName: '小组',
        pigeonName: '成员',
        items: [
            '项目A成员', '项目B成员', '项目C成员', '项目D成员',
            '研发人员', '测试人员', '设计人员', '运营人员',
            '市场专员', '销售代表', '客服人员', '培训师',
            '分析师', '策划师', '协调员', '顾问',
            '技术员', '管理员', '监督员', '执行员'
        ],
        meaning: '成员多于小组数，必然有小组包含多个成员，体现团队合作'
    }
};

// 鸽子颜色
const pigeonColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24',
    '#6c5ce7', '#fd79a8', '#00b894', '#e17055'
];

// 初始化
function init() {
    updateValues();
    createPigeonholes();
    createPigeons();
    updateStats();
    attachEventListeners();
}

// 更新数值
function updateValues() {
    numHoles = parseInt(holesSlider.value);
    numPigeons = parseInt(pigeonsSlider.value);

    holesCount.textContent = numHoles;
    pigeonsCount.textContent = numPigeons;
    resultHoles.textContent = numHoles;
    resultPigeons.textContent = numPigeons;

    // 计算最少包含数：向上取整(鸽子数 / 鸽巢数)
    const minCount = Math.ceil(numPigeons / numHoles);
    minPerHole.textContent = minCount;

    // 更新场景说明
    const scenario = scenarios[currentScenario];
    politicalMeaning.textContent = scenario.meaning;
}

// 创建鸽巢
function createPigeonholes() {
    pigeonsholesContainer.innerHTML = '';
    const scenario = scenarios[currentScenario];

    for (let i = 0; i < numHoles; i++) {
        const hole = document.createElement('div');
        hole.className = 'pigeonhole';
        hole.setAttribute('data-hole-id', i);

        const header = document.createElement('div');
        header.className = 'hole-header';

        const title = document.createElement('div');
        title.className = 'hole-title';
        title.textContent = `${scenario.holeName}${i + 1}`;

        const count = document.createElement('div');
        count.className = 'hole-count';
        count.textContent = '0';

        header.appendChild(title);
        header.appendChild(count);

        const content = document.createElement('div');
        content.className = 'hole-content';

        hole.appendChild(header);
        hole.appendChild(content);
        pigeonsholesContainer.appendChild(hole);
    }
}

// 创建鸽子
function createPigeons() {
    pigeonsList.innerHTML = '';
    const scenario = scenarios[currentScenario];

    for (let i = 0; i < numPigeons; i++) {
        const pigeon = document.createElement('div');
        pigeon.className = 'pigeon';
        pigeon.setAttribute('data-pigeon-id', i);

        const icon = document.createElement('span');
        icon.className = 'pigeon-icon';
        icon.textContent = '🎯';

        const text = document.createElement('span');
        text.textContent = scenario.items[i % scenario.items.length];

        pigeon.style.background = pigeonColors[i % pigeonColors.length];

        pigeon.appendChild(icon);
        pigeon.appendChild(text);
        pigeonsList.appendChild(pigeon);
    }
}

// 分配鸽子
async function distributePigeons() {
    if (isAnimating) return;
    isAnimating = true;

    distributeBtn.disabled = true;
    distributeBtn.textContent = '分配中...';

    // 清空所有鸽巢
    document.querySelectorAll('.hole-content').forEach(content => {
        content.innerHTML = '';
    });
    document.querySelectorAll('.hole-count').forEach(count => {
        count.textContent = '0';
    });

    let distribution = [];

    if (currentStrategy === 'balanced') {
        // 均衡分配
        distribution = balancedDistribution();
    } else {
        // 随机分配
        distribution = randomDistribution();
    }

    // 执行动画分配
    for (let i = 0; i < numPigeons; i++) {
        await sleep(300);

        const pigeonElement = document.querySelector(`[data-pigeon-id="${i}"]`);
        const targetHole = distribution[i];

        // 添加飞行动画
        pigeonElement.classList.add('flying');

        await sleep(300);

        // 移动到目标鸽巢
        const holeContent = document.querySelector(`[data-hole-id="${targetHole}"] .hole-content`);
        const holeCount = document.querySelector(`[data-hole-id="${targetHole}"] .hole-count`);

        const newPigeon = pigeonElement.cloneNode(true);
        newPigeon.classList.remove('flying');
        holeContent.appendChild(newPigeon);

        // 更新计数
        const currentCount = parseInt(holeCount.textContent);
        holeCount.textContent = currentCount + 1;

        // 如果达到最小值，高亮显示
        const minCount = Math.ceil(numPigeons / numHoles);
        if (currentCount + 1 >= minCount) {
            holeCount.style.animation = 'pulse 1s ease infinite';
        }

        pigeonElement.remove();
    }

    // 更新统计
    updateStatsAfterDistribution();

    distributeBtn.disabled = false;
    distributeBtn.textContent = '🎯 开始分配';
    isAnimating = false;
}

// 均衡分配算法
function balancedDistribution() {
    const distribution = [];
    for (let i = 0; i < numPigeons; i++) {
        distribution.push(i % numHoles);
    }
    return distribution;
}

// 随机分配算法
function randomDistribution() {
    const distribution = [];
    for (let i = 0; i < numPigeons; i++) {
        distribution.push(Math.floor(Math.random() * numHoles));
    }
    return distribution;
}

// 更新统计
function updateStats() {
    statHoles.textContent = numHoles;
    statPigeons.textContent = numPigeons;
    statMax.textContent = '0';
}

// 分配后更新统计
function updateStatsAfterDistribution() {
    const counts = [];
    document.querySelectorAll('.hole-count').forEach(count => {
        counts.push(parseInt(count.textContent));
    });

    const maxCount = Math.max(...counts);
    statMax.textContent = maxCount;

    // 高亮最大的鸽巢
    document.querySelectorAll('.pigeonhole').forEach((hole, index) => {
        if (counts[index] === maxCount) {
            hole.style.borderColor = '#ffb400';
            hole.style.borderWidth = '4px';
            hole.style.boxShadow = '0 0 20px rgba(255, 180, 0, 0.5)';
        } else {
            hole.style.borderColor = '#d63b1d';
            hole.style.borderWidth = '3px';
            hole.style.boxShadow = 'var(--shadow-sm)';
        }
    });
}

// 重置
function reset() {
    if (isAnimating) return;

    createPigeonholes();
    createPigeons();
    updateStats();
}

// 工具函数：延迟
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 事件监听
function attachEventListeners() {
    // 场景选择
    scenarioSelect.addEventListener('change', () => {
        currentScenario = scenarioSelect.value;
        updateValues();
        reset();
    });

    // 鸽巢数量
    holesSlider.addEventListener('input', () => {
        updateValues();
        reset();
    });

    // 鸽子数量
    pigeonsSlider.addEventListener('input', () => {
        updateValues();
        reset();
    });

    // 策略选择
    strategyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            strategyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStrategy = btn.getAttribute('data-strategy');
        });
    });

    // 分配按钮
    distributeBtn.addEventListener('click', distributePigeons);

    // 重置按钮
    resetBtn.addEventListener('click', reset);
}

// 启动应用
init();
