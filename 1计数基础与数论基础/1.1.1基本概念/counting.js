/**
 * 计数原理可视化 - 思政教育版
 */

// DOM 元素
const principleBtns = document.querySelectorAll('.principle-btn');
const scenarioSelect = document.getElementById('scenarioSelect');
const parameterControls = document.getElementById('parameterControls');
const principleTitle = document.getElementById('principleTitle');
const principleDesc = document.getElementById('principleDesc');
const politicalMeaning = document.getElementById('politicalMeaning');
const formulaText = document.getElementById('formulaText');
const resultValue = document.getElementById('resultValue');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const vizArea = document.getElementById('vizArea');
const legendContent = document.getElementById('legendContent');

// 状态
let currentPrinciple = 'addition';
let currentScenario = 'development';
let parameters = {};
let isAnimating = false;

// 场景数据
const scenarios = {
    development: {
        name: '发展道路',
        addition: {
            categories: ['经济发展', '社会进步', '生态保护'],
            items: {
                '经济发展': ['市场经济', '计划经济', '混合经济'],
                '社会进步': ['教育优先', '医疗优先', '就业优先'],
                '生态保护': ['绿色能源', '循环经济', '碳中和']
            }
        },
        multiplication: {
            step1: { name: '发展阶段', items: ['初级阶段', '中级阶段', '高级阶段'] },
            step2: { name: '发展模式', items: ['创新驱动', '协调发展', '绿色发展', '开放合作'] }
        },
        permutation: {
            items: ['脱贫攻坚', '乡村振兴', '共同富裕', '高质量发展']
        },
        combination: {
            items: ['创新', '协调', '绿色', '开放', '共享']
        }
    },
    policy: {
        name: '政策方针',
        addition: {
            categories: ['经济政策', '社会政策', '外交政策'],
            items: {
                '经济政策': ['财政政策', '货币政策', '产业政策'],
                '社会政策': ['教育政策', '医疗政策', '养老政策'],
                '外交政策': ['睦邻友好', '多边主义', '互利共赢']
            }
        },
        multiplication: {
            step1: { name: '政策领域', items: ['国内政策', '国际政策'] },
            step2: { name: '政策类型', items: ['长期规划', '中期目标', '短期措施', '应急预案'] }
        },
        permutation: {
            items: ['调研', '制定', '实施', '评估']
        },
        combination: {
            items: ['民主', '法治', '公平', '正义', '和谐']
        }
    },
    culture: {
        name: '文化建设',
        addition: {
            categories: ['传统文化', '革命文化', '社会主义先进文化'],
            items: {
                '传统文化': ['儒家思想', '道家智慧', '诗词歌赋'],
                '革命文化': ['红色精神', '长征精神', '抗战精神'],
                '社会主义先进文化': ['时代精神', '工匠精神', '创新精神']
            }
        },
        multiplication: {
            step1: { name: '文化形式', items: ['物质文化', '精神文化', '制度文化'] },
            step2: { name: '传播方式', items: ['教育传承', '媒体宣传', '实践体验'] }
        },
        permutation: {
            items: ['传承', '创新', '融合', '传播']
        },
        combination: {
            items: ['自信', '包容', '创新', '传承', '发展']
        }
    },
    team: {
        name: '团队组建',
        addition: {
            categories: ['技术团队', '管理团队', '服务团队'],
            items: {
                '技术团队': ['研发工程师', '测试工程师', '运维工程师'],
                '管理团队': ['项目经理', '产品经理', '团队主管'],
                '服务团队': ['客服专员', '培训讲师', '咨询顾问']
            }
        },
        multiplication: {
            step1: { name: '部门', items: ['研发部', '市场部', '运营部'] },
            step2: { name: '岗位级别', items: ['初级', '中级', '高级', '专家'] }
        },
        permutation: {
            items: ['组长', '副组长', '技术骨干', '协调员']
        },
        combination: {
            items: ['张三', '李四', '王五', '赵六', '孙七']
        }
    }
};

// 原理说明
const principleInfo = {
    addition: {
        title: '加法法则',
        desc: '分类相加：完成一件事有 n 类方法，各类方法数相加',
        meaning: '象征多元化发展路径的选择与包容，条条大路通罗马',
        formula: 'n₁ + n₂ + ... + nₖ'
    },
    multiplication: {
        title: '乘法法则',
        desc: '分步相乘：完成一件事需要 n 个步骤，各步骤方法数相乘',
        meaning: '象征系统化进程的协同配合，环环相扣、步步为营',
        formula: 'n₁ × n₂ × ... × nₖ'
    },
    permutation: {
        title: '排列',
        desc: '有序选择：从 n 个元素中选出 m 个进行排列，顺序不同算不同方案',
        meaning: '象征有序组织与优先级设定，合理安排、统筹兼顾',
        formula: 'Pₙᵐ = n!/(n-m)!'
    },
    combination: {
        title: '组合',
        desc: '无序选择：从 n 个元素中选出 m 个进行组合，顺序相同算相同方案',
        meaning: '象征团队协作与人才选拔，不分先后、共同发展',
        formula: 'Cₙᵐ = n!/[m!(n-m)!]'
    }
};

// 初始化
function init() {
    updatePrincipleInfo();
    updateParameterControls();
    attachEventListeners();
    calculate();
}

// 更新原理说明
function updatePrincipleInfo() {
    const info = principleInfo[currentPrinciple];
    principleTitle.textContent = info.title;
    principleDesc.textContent = info.desc;
    politicalMeaning.textContent = info.meaning;
    formulaText.textContent = info.formula;
}

// 更新参数控件
function updateParameterControls() {
    parameterControls.innerHTML = '';

    if (currentPrinciple === 'permutation' || currentPrinciple === 'combination') {
        const scenarioData = scenarios[currentScenario][currentPrinciple];
        const n = scenarioData.items.length;

        const paramDiv = document.createElement('div');
        paramDiv.className = 'param-item';

        const label = document.createElement('div');
        label.className = 'param-label';
        label.innerHTML = `选取数量 m: <span class="value" id="mValue">2</span>`;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = 'mSlider';
        slider.min = '1';
        slider.max = n.toString();
        slider.value = Math.min(2, n).toString();

        slider.addEventListener('input', (e) => {
            document.getElementById('mValue').textContent = e.target.value;
            calculate();
        });

        paramDiv.appendChild(label);
        paramDiv.appendChild(slider);
        parameterControls.appendChild(paramDiv);

        parameters.n = n;
        parameters.m = parseInt(slider.value);
    }
}

// 计算结果
function calculate() {
    const scenarioData = scenarios[currentScenario][currentPrinciple];
    let result = 0;

    switch (currentPrinciple) {
        case 'addition':
            // 加法：各类别元素数量相加
            result = Object.values(scenarioData.items).reduce((sum, arr) => sum + arr.length, 0);
            break;

        case 'multiplication':
            // 乘法：各步骤元素数量相乘
            result = scenarioData.step1.items.length * scenarioData.step2.items.length;
            break;

        case 'permutation':
            // 排列：P(n, m)
            const mSlider = document.getElementById('mSlider');
            if (mSlider) {
                parameters.m = parseInt(mSlider.value);
                result = permutation(parameters.n, parameters.m);
            }
            break;

        case 'combination':
            // 组合：C(n, m)
            const mSlider2 = document.getElementById('mSlider');
            if (mSlider2) {
                parameters.m = parseInt(mSlider2.value);
                result = combination(parameters.n, parameters.m);
            }
            break;
    }

    resultValue.textContent = result;
}

// 阶乘
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// 排列数
function permutation(n, m) {
    if (m > n) return 0;
    return factorial(n) / factorial(n - m);
}

// 组合数
function combination(n, m) {
    if (m > n) return 0;
    return factorial(n) / (factorial(m) * factorial(n - m));
}

// 可视化
async function visualize() {
    if (isAnimating) return;
    isAnimating = true;

    vizArea.innerHTML = '';
    legendContent.innerHTML = '';

    const scenarioData = scenarios[currentScenario][currentPrinciple];

    switch (currentPrinciple) {
        case 'addition':
            await visualizeAddition(scenarioData);
            break;
        case 'multiplication':
            await visualizeMultiplication(scenarioData);
            break;
        case 'permutation':
            await visualizePermutation(scenarioData);
            break;
        case 'combination':
            await visualizeCombination(scenarioData);
            break;
    }

    isAnimating = false;
}

// 加法可视化
async function visualizeAddition(data) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
    let colorIndex = 0;

    for (const [category, items] of Object.entries(data.items)) {
        const section = document.createElement('div');
        section.className = 'category-section';

        const title = document.createElement('div');
        title.className = 'category-title';
        title.textContent = `${category} (${items.length} 种)`;
        section.appendChild(title);

        const row = document.createElement('div');
        row.className = 'items-row';

        for (const item of items) {
            await sleep(100);
            const box = document.createElement('div');
            box.className = 'item-box';
            box.textContent = item;
            box.style.background = colors[colorIndex % colors.length];
            row.appendChild(box);
        }

        section.appendChild(row);
        vizArea.appendChild(section);

        // 添加加号（除了最后一个）
        if (colorIndex < Object.keys(data.items).length - 1) {
            const symbol = document.createElement('div');
            symbol.className = 'operation-symbol';
            symbol.textContent = '+';
            vizArea.appendChild(symbol);
        }

        colorIndex++;
    }

    // 更新图例
    colorIndex = 0;
    for (const category of Object.keys(data.items)) {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background: ${colors[colorIndex % colors.length]}"></div>
            <span>${category}</span>
        `;
        legendContent.appendChild(legendItem);
        colorIndex++;
    }
}

// 乘法可视化
async function visualizeMultiplication(data) {
    const step1Section = document.createElement('div');
    step1Section.className = 'category-section';

    const step1Title = document.createElement('div');
    step1Title.className = 'category-title';
    step1Title.textContent = `${data.step1.name} (${data.step1.items.length} 种)`;
    step1Section.appendChild(step1Title);

    const step1Row = document.createElement('div');
    step1Row.className = 'items-row';

    for (const item of data.step1.items) {
        await sleep(100);
        const box = document.createElement('div');
        box.className = 'item-box';
        box.textContent = item;
        box.style.background = '#ff6b6b';
        step1Row.appendChild(box);
    }

    step1Section.appendChild(step1Row);
    vizArea.appendChild(step1Section);

    // 乘号
    const symbol = document.createElement('div');
    symbol.className = 'operation-symbol';
    symbol.textContent = '×';
    vizArea.appendChild(symbol);

    // 第二步
    const step2Section = document.createElement('div');
    step2Section.className = 'category-section';

    const step2Title = document.createElement('div');
    step2Title.className = 'category-title';
    step2Title.textContent = `${data.step2.name} (${data.step2.items.length} 种)`;
    step2Section.appendChild(step2Title);

    const step2Row = document.createElement('div');
    step2Row.className = 'items-row';

    for (const item of data.step2.items) {
        await sleep(100);
        const box = document.createElement('div');
        box.className = 'item-box';
        box.textContent = item;
        box.style.background = '#4ecdc4';
        step2Row.appendChild(box);
    }

    step2Section.appendChild(step2Row);
    vizArea.appendChild(step2Section);

    // 图例
    legendContent.innerHTML = `
        <div class="legend-item">
            <div class="legend-color" style="background: #ff6b6b"></div>
            <span>${data.step1.name}</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #4ecdc4"></div>
            <span>${data.step2.name}</span>
        </div>
    `;
}

// 排列可视化
async function visualizePermutation(data) {
    const m = parameters.m;
    const items = data.items.slice(0, parameters.n);

    // 生成几个示例排列
    const exampleCount = Math.min(8, permutation(items.length, m));
    const examples = generatePermutations(items, m, exampleCount);

    const container = document.createElement('div');
    container.className = 'tree-container';

    const title = document.createElement('div');
    title.className = 'category-title';
    title.textContent = `从 ${items.length} 个元素中选 ${m} 个的排列示例`;
    container.appendChild(title);

    for (const example of examples) {
        await sleep(150);
        const level = document.createElement('div');
        level.className = 'tree-level';

        for (let i = 0; i < example.length; i++) {
            const node = document.createElement('div');
            node.className = 'tree-node';
            node.textContent = `${i + 1}. ${example[i]}`;
            level.appendChild(node);
        }

        container.appendChild(level);
    }

    vizArea.appendChild(container);

    // 图例
    legendContent.innerHTML = `
        <div class="legend-item">
            <span>顺序不同视为不同方案</span>
        </div>
        <div class="legend-item">
            <span>共有 ${permutation(items.length, m)} 种排列</span>
        </div>
    `;
}

// 组合可视化
async function visualizeCombination(data) {
    const m = parameters.m;
    const items = data.items.slice(0, parameters.n);

    // 生成几个示例组合
    const exampleCount = Math.min(10, combination(items.length, m));
    const examples = generateCombinations(items, m, exampleCount);

    const container = document.createElement('div');
    container.className = 'tree-container';

    const title = document.createElement('div');
    title.className = 'category-title';
    title.textContent = `从 ${items.length} 个元素中选 ${m} 个的组合示例`;
    container.appendChild(title);

    for (const example of examples) {
        await sleep(150);
        const level = document.createElement('div');
        level.className = 'tree-level';

        for (const item of example) {
            const node = document.createElement('div');
            node.className = 'tree-node';
            node.textContent = item;
            level.appendChild(node);
        }

        container.appendChild(level);
    }

    vizArea.appendChild(container);

    // 图例
    legendContent.innerHTML = `
        <div class="legend-item">
            <span>顺序相同视为相同方案</span>
        </div>
        <div class="legend-item">
            <span>共有 ${combination(items.length, m)} 种组合</span>
        </div>
    `;
}

// 生成排列示例
function generatePermutations(arr, m, count) {
    const results = [];
    const used = new Array(arr.length).fill(false);

    function backtrack(path) {
        if (path.length === m) {
            results.push([...path]);
            return;
        }

        for (let i = 0; i < arr.length && results.length < count; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.push(arr[i]);
            backtrack(path);
            path.pop();
            used[i] = false;
        }
    }

    backtrack([]);
    return results.slice(0, count);
}

// 生成组合示例
function generateCombinations(arr, m, count) {
    const results = [];

    function backtrack(start, path) {
        if (path.length === m) {
            results.push([...path]);
            return;
        }

        for (let i = start; i < arr.length && results.length < count; i++) {
            path.push(arr[i]);
            backtrack(i + 1, path);
            path.pop();
        }
    }

    backtrack(0, []);
    return results.slice(0, count);
}

// 工具函数：延迟
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 事件监听
function attachEventListeners() {
    // 原理选择
    principleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            principleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPrinciple = btn.getAttribute('data-principle');
            updatePrincipleInfo();
            updateParameterControls();
            calculate();
            vizArea.innerHTML = '';
        });
    });

    // 场景选择
    scenarioSelect.addEventListener('change', () => {
        currentScenario = scenarioSelect.value;
        updateParameterControls();
        calculate();
        vizArea.innerHTML = '';
    });

    // 计算按钮
    calculateBtn.addEventListener('click', visualize);

    // 重置按钮
    resetBtn.addEventListener('click', () => {
        vizArea.innerHTML = '';
        updateParameterControls();
        calculate();
    });
}

// 启动应用
init();
