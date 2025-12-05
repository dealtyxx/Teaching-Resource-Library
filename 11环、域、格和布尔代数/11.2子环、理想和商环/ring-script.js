/**
 * Unity Ring Visualizer - Ring Theory with Ideological Elements
 * 团结之环 - 环论可视化
 */

// DOM Elements
const ringType = document.getElementById('ringType');
const subringBtn = document.getElementById('subringBtn');
const idealBtn = document.getElementById('idealBtn');
const quotientBtn = document.getElementById('quotientBtn');
const extensionBtn = document.getElementById('extensionBtn');
const input1 = document.getElementById('input1');
const input2 = document.getElementById('input2');
const operation = document.getElementById('operation');
const calculateBtn = document.getElementById('calculateBtn');
const resultValue = document.getElementById('resultValue');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const visualizationArea = document.getElementById('visualizationArea');
const vizTitle = document.getElementById('vizTitle');
const vizSubtitle = document.getElementById('vizSubtitle');
const propertiesList = document.getElementById('propertiesList');
const ideologyCard = document.getElementById('ideologyCard');

// State
let currentRing = 'integers';
let currentConcept = null;
let modulus = 12; // For modular rings

// Ideological messages for different concepts
const ideologicalMessages = {
    integers: {
        title: "整数环 - 团结的基石",
        message: "整数环体现全体人民的团结，每个整数都是社会主义建设的参与者",
        icon: "★"
    },
    modular: {
        title: "模环 - 周期性协作",
        message: "模运算展现循环往复的发展规律，体现团结协作的周期性特征",
        icon: "⟲"
    },
    polynomial: {
        title: "多项式环 - 持续发展",
        message: "多项式环象征着不断累积的力量，每一项都为整体贡献价值",
        icon: "∑"
    },
    matrix: {
        title: "矩阵环 - 组织力量",
        message: "矩阵环体现组织的严密性，每个元素协同工作形成强大力量",
        icon: "▦"
    },
    subring: {
        title: "子环 - 基层组织",
        message: "子环就像基层组织，虽小但完整，是大集体不可或缺的组成部分",
        icon: "⊆"
    },
    ideal: {
        title: "理想 - 共同目标",
        message: "理想吸收外部影响，体现集体对个体的包容性与引导作用",
        icon: "◁"
    },
    quotient: {
        title: "商环 - 升华提炼",
        message: "商环通过模去理想得到新结构，象征去粗取精、提炼升华的过程",
        icon: "⊘"
    },
    extension: {
        title: "扩环 - 开放包容",
        message: "扩环展现开放包容的精神，在保持原有结构下不断扩大团结面",
        icon: "⊇"
    }
};

// Ring definitions
const rings = {
    integers: {
        name: "整数环 ℤ",
        elements: [0, 1, -1, 2, -2, 3, -3, 4],
        operation: (a, b, op) => op === '+' ? a + b : a * b
    },
    modular: {
        name: `模环 ℤ/${modulus}ℤ`,
        elements: Array.from({ length: modulus }, (_, i) => i),
        operation: (a, b, op) => {
            const result = op === '+' ? (a + b) % modulus : (a * b) % modulus;
            return result < 0 ? result + modulus : result;
        }
    },
    polynomial: {
        name: "多项式环 ℝ[x]",
        elements: ["1", "x", "x²", "2x", "x+1", "x²+1", "2x+3"],
        operation: null // Simplified for display
    },
    matrix: {
        name: "2×2 矩阵环",
        elements: ["I", "A", "B", "C", "D"],
        operation: null // Simplified for display
    }
};

// Initialize
function init() {
    updateIdeology(currentRing);
    updateProperties();
}

// Update ideology card
function updateIdeology(key) {
    const msg = ideologicalMessages[key];
    if (msg) {
        ideologyCard.querySelector('.card-icon').textContent = msg.icon;
        ideologyCard.querySelector('.card-title').textContent = msg.title;
        ideologyCard.querySelector('.card-content').textContent = msg.message;
        ideologyCard.classList.add('active');
        setTimeout(() => ideologyCard.classList.remove('active'), 300);
        setTimeout(() => ideologyCard.classList.add('active'), 310);
    }
}

// Update properties panel
function updateProperties(props = null) {
    if (!props) {
        props = {
            "环类型": rings[currentRing].name,
            "封闭性": "✓",
            "结合律": "✓",
            "单位元": currentRing === 'integers' || currentRing === 'modular' ? "1" : "存在"
        };
    }

    propertiesList.innerHTML = '';
    for (const [key, value] of Object.entries(props)) {
        const item = document.createElement('div');
        item.className = 'property-item';
        item.innerHTML = `
            <span class="prop-key">${key}</span>
            <span class="prop-value">${value}</span>
        `;
        propertiesList.appendChild(item);
    }
}

// Calculate ring operation
function calculate() {
    const a = input1.value.trim();
    const b = input2.value.trim();
    const op = operation.value;

    if (!a || !b) {
        resultValue.textContent = '请输入元素';
        resultValue.style.color = 'var(--text-secondary)';
        return;
    }

    try {
        const numA = parseInt(a);
        const numB = parseInt(b);

        if (isNaN(numA) || isNaN(numB)) {
            resultValue.textContent = '无效输入';
            resultValue.style.color = 'var(--danger-red)';
            return;
        }

        const ring = rings[currentRing];
        if (ring.operation) {
            const result = ring.operation(numA, numB, op);
            resultValue.textContent = result;
            resultValue.style.color = 'var(--accent-red)';

            // Add animation
            resultValue.style.transform = 'scale(1.2)';
            setTimeout(() => {
                resultValue.style.transform = 'scale(1)';
            }, 200);
        } else {
            resultValue.textContent = `${a} ${op} ${b}`;
            resultValue.style.color = 'var(--accent-red)';
        }
    } catch (e) {
        resultValue.textContent = '计算错误';
        resultValue.style.color = 'var(--danger-red)';
    }
}

// Visualization functions
function visualizeRingStructure() {
    currentConcept = null;
    deactivateAllConceptBtns();

    vizTitle.textContent = rings[currentRing].name;
    vizSubtitle.textContent = '基本环结构可视化';

    const container = document.createElement('div');
    container.className = 'ring-container';

    const circle = document.createElement('div');
    circle.className = 'ring-circle';

    const label = document.createElement('div');
    label.className = 'ring-label';
    label.textContent = rings[currentRing].name;
    circle.appendChild(label);

    const elements = rings[currentRing].elements;
    const angleStep = (2 * Math.PI) / elements.length;
    const radius = 180;

    elements.forEach((elem, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const elemDiv = document.createElement('div');
        elemDiv.className = 'ring-element';
        elemDiv.textContent = elem;
        elemDiv.style.left = `calc(50% + ${x}px - 25px)`;
        elemDiv.style.top = `calc(50% + ${y}px - 25px)`;
        elemDiv.style.animationDelay = `${index * 0.1}s`;

        elemDiv.addEventListener('click', () => {
            input1.value = elem;
            elemDiv.style.background = 'var(--accent-gold)';
            setTimeout(() => {
                elemDiv.style.background = 'var(--ring-element)';
            }, 500);
        });

        circle.appendChild(elemDiv);
    });

    container.appendChild(circle);
    visualizationArea.innerHTML = '';
    visualizationArea.appendChild(container);

    updateIdeology(currentRing);
    updateProperties();
}

function visualizeSubring() {
    currentConcept = 'subring';
    setActiveConceptBtn(subringBtn);

    vizTitle.textContent = '子环结构';
    vizSubtitle.textContent = '子环是环的子集且自身构成环';

    const container = document.createElement('div');
    container.className = 'subring-container';

    const nested = document.createElement('div');
    nested.className = 'nested-rings';

    const outerRing = document.createElement('div');
    outerRing.className = 'outer-ring';

    const outerLabel = document.createElement('div');
    outerLabel.className = 'ring-annotation';
    outerLabel.textContent = '环 R (全体力量)';
    outerLabel.style.top = '10px';
    outerLabel.style.right = '30px';

    const innerRing = document.createElement('div');
    innerRing.className = 'inner-ring';

    const innerLabel = document.createElement('div');
    innerLabel.className = 'ring-annotation';
    innerLabel.textContent = '子环 S (基层组织)';
    innerLabel.style.bottom = '30px';
    innerLabel.style.left = 'calc(50% - 60px)';

    // Add elements to outer ring
    const outerElems = currentRing === 'modular' ?
        Array.from({ length: modulus }, (_, i) => i) :
        [0, 1, -1, 2, -2, 3, -3, 4, -4, 5];

    const outerRadius = 210;
    const outerStep = (2 * Math.PI) / outerElems.length;

    outerElems.forEach((elem, i) => {
        const angle = i * outerStep - Math.PI / 2;
        const x = outerRadius * Math.cos(angle);
        const y = outerRadius * Math.sin(angle);

        const div = document.createElement('div');
        div.className = 'ring-element';
        div.textContent = elem;
        div.style.position = 'absolute';
        div.style.left = `calc(50% + ${x}px - 25px)`;
        div.style.top = `calc(50% + ${y}px - 25px)`;
        div.style.animationDelay = `${i * 0.08}s`;

        nested.appendChild(div);
    });

    // Add elements to inner ring (subring)
    const innerElems = currentRing === 'modular' ? [0, 3, 6, 9] : [0, 2, -2, 4];
    const innerRadius = 130;
    const innerStep = (2 * Math.PI) / innerElems.length;

    innerElems.forEach((elem, i) => {
        const angle = i * innerStep - Math.PI / 2;
        const x = innerRadius * Math.cos(angle);
        const y = innerRadius * Math.sin(angle);

        const div = document.createElement('div');
        div.className = 'ring-element';
        div.textContent = elem;
        div.style.position = 'absolute';
        div.style.left = `calc(50% + ${x}px - 25px)`;
        div.style.top = `calc(50% + ${y}px - 25px)`;
        div.style.background = 'var(--accent-gold)';
        div.style.animationDelay = `${(i + 0.5) * 0.08}s`;

        nested.appendChild(div);
    });

    nested.appendChild(outerRing);
    nested.appendChild(innerRing);
    nested.appendChild(outerLabel);
    nested.appendChild(innerLabel);
    container.appendChild(nested);

    visualizationArea.innerHTML = '';
    visualizationArea.appendChild(container);

    updateIdeology('subring');
    updateProperties({
        "母环": rings[currentRing].name,
        "子环示例": currentRing === 'modular' ? `{0, ${modulus / 4}, ${modulus / 2}, ${3 * modulus / 4}}` : "{0, ±2, ±4, ...}",
        "封闭性": "✓",
        "包含关系": "S ⊆ R"
    });
}

function visualizeIdeal() {
    currentConcept = 'ideal';
    setActiveConceptBtn(idealBtn);

    vizTitle.textContent = '理想结构';
    vizSubtitle.textContent = '理想满足吸收律：I·R ⊆ I';

    const container = document.createElement('div');
    container.className = 'ideal-container';

    // Ring R
    const ringSet = document.createElement('div');
    ringSet.className = 'ideal-set';

    const ringBox = document.createElement('div');
    ringBox.className = 'ideal-box';
    ringBox.style.borderColor = 'var(--ring-main)';

    const ringTitle = document.createElement('div');
    ringTitle.className = 'ideal-title';
    ringTitle.textContent = '环 R';
    ringTitle.style.color = 'var(--ring-main)';

    const ringElems = document.createElement('div');
    ringElems.className = 'ideal-elements';

    const rElems = currentRing === 'modular' ?
        Array.from({ length: Math.min(6, modulus) }, (_, i) => i) :
        [0, 1, 2, 3, 4, 5];

    rElems.forEach(e => {
        const elem = document.createElement('div');
        elem.className = 'ideal-elem';
        elem.textContent = e;
        elem.style.background = 'var(--ring-main)';
        ringElems.appendChild(elem);
    });

    ringBox.appendChild(ringTitle);
    ringBox.appendChild(ringElems);
    ringSet.appendChild(ringBox);

    // Arrow
    const arrow = document.createElement('div');
    arrow.className = 'absorption-arrow';
    arrow.textContent = '◀';

    // Ideal I
    const idealSet = document.createElement('div');
    idealSet.className = 'ideal-set';

    const idealBox = document.createElement('div');
    idealBox.className = 'ideal-box';

    const idealTitle = document.createElement('div');
    idealTitle.className = 'ideal-title';
    idealTitle.textContent = '理想 I';

    const idealElems = document.createElement('div');
    idealElems.className = 'ideal-elements';

    const iElems = currentRing === 'modular' ? [0, 2, 4] : [0, 2, 4];

    iElems.forEach(e => {
        const elem = document.createElement('div');
        elem.className = 'ideal-elem';
        elem.textContent = e;
        idealElems.appendChild(elem);
    });

    idealBox.appendChild(idealTitle);
    idealBox.appendChild(idealElems);
    idealSet.appendChild(idealBox);

    container.appendChild(ringSet);
    container.appendChild(arrow);
    container.appendChild(idealSet);

    visualizationArea.innerHTML = '';
    visualizationArea.appendChild(container);

    updateIdeology('ideal');
    updateProperties({
        "环": rings[currentRing].name,
        "理想示例": currentRing === 'modular' ? "偶数集" : "2ℤ = {...,-2,0,2,4,...}",
        "吸收律": "I·R ⊆ I",
        "特性": "I + I ⊆ I"
    });
}

function visualizeQuotient() {
    currentConcept = 'quotient';
    setActiveConceptBtn(quotientBtn);

    vizTitle.textContent = '商环结构';
    vizSubtitle.textContent = '商环 = 环 / 理想';

    const container = document.createElement('div');
    container.className = 'ideal-container';
    container.style.flexDirection = 'column';
    container.style.gap = '2rem';

    // Original Ring
    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.gap = '2rem';
    topRow.style.alignItems = 'center';

    const ringBox = document.createElement('div');
    ringBox.className = 'ideal-box';
    ringBox.style.borderColor = 'var(--ring-main)';

    const ringTitle = document.createElement('div');
    ringTitle.className = 'ideal-title';
    ringTitle.textContent = rings[currentRing].name;
    ringTitle.style.color = 'var(--ring-main)';

    ringBox.appendChild(ringTitle);

    const divSymbol = document.createElement('div');
    divSymbol.style.fontSize = '3rem';
    divSymbol.style.color = 'var(--accent-red)';
    divSymbol.textContent = '÷';

    const idealBox = document.createElement('div');
    idealBox.className = 'ideal-box';
    idealBox.style.width = '120px';
    idealBox.style.height = '120px';

    const idealTitle = document.createElement('div');
    idealTitle.className = 'ideal-title';
    idealTitle.textContent = '理想 I';
    idealTitle.style.fontSize = '0.9rem';

    idealBox.appendChild(idealTitle);

    topRow.appendChild(ringBox);
    topRow.appendChild(divSymbol);
    topRow.appendChild(idealBox);

    // Arrow down
    const arrowDown = document.createElement('div');
    arrowDown.style.fontSize = '2.5rem';
    arrowDown.style.color = 'var(--accent-gold)';
    arrowDown.textContent = '⬇';

    // Quotient Ring
    const quotientBox = document.createElement('div');
    quotientBox.className = 'ideal-box';
    quotientBox.style.borderColor = 'var(--accent-gold)';
    quotientBox.style.width = '220px';
    quotientBox.style.background = 'linear-gradient(135deg, rgba(255, 180, 0, 0.15), rgba(255, 180, 0, 0.08))';

    const quotientTitle = document.createElement('div');
    quotientTitle.className = 'ideal-title';
    quotientTitle.textContent = 'R / I';

    const cosets = document.createElement('div');
    cosets.style.fontSize = '0.75rem';
    cosets.style.color = 'var(--text-secondary)';
    cosets.style.marginTop = '0.5rem';
    cosets.textContent = '陪集集合';

    quotientBox.appendChild(quotientTitle);
    quotientBox.appendChild(cosets);

    container.appendChild(topRow);
    container.appendChild(arrowDown);
    container.appendChild(quotientBox);

    visualizationArea.innerHTML = '';
    visualizationArea.appendChild(container);

    updateIdeology('quotient');
    updateProperties({
        "商环": "R / I",
        "元素": "陪集 r + I",
        "运算": "(a+I) + (b+I) = (a+b)+I",
        "意义": "提炼升华新结构"
    });
}

function visualizeExtension() {
    currentConcept = 'extension';
    setActiveConceptBtn(extensionBtn);

    vizTitle.textContent = '扩环结构';
    vizSubtitle.textContent = '扩环包含原环并保持其结构';

    const container = document.createElement('div');
    container.className = 'subring-container';

    const nested = document.createElement('div');
    nested.className = 'nested-rings';

    const innerRing = document.createElement('div');
    innerRing.className = 'inner-ring';
    innerRing.style.borderColor = 'var(--ring-main)';
    innerRing.style.background = 'radial-gradient(circle, rgba(214, 59, 29, 0.1), transparent 70%)';

    const innerLabel = document.createElement('div');
    innerLabel.className = 'ring-annotation';
    innerLabel.textContent = '原环 R (核心)';
    innerLabel.style.top = '30px';
    innerLabel.style.left = 'calc(50% - 50px)';

    const outerRing = document.createElement('div');
    outerRing.className = 'outer-ring';
    outerRing.style.borderColor = 'var(--accent-gold)';
    outerRing.style.borderStyle = 'solid';
    outerRing.style.borderWidth = '3px';
    outerRing.style.opacity = '0.8';

    const outerLabel = document.createElement('div');
    outerLabel.className = 'ring-annotation';
    outerLabel.textContent = '扩环 S (包容扩展)';
    outerLabel.style.bottom = '10px';
    outerLabel.style.right = '30px';

    // Inner ring elements
    const innerElems = [0, 1, -1];
    const innerRadius = 100;
    const innerStep = (2 * Math.PI) / innerElems.length;

    innerElems.forEach((elem, i) => {
        const angle = i * innerStep - Math.PI / 2;
        const x = innerRadius * Math.cos(angle);
        const y = innerRadius * Math.sin(angle);

        const div = document.createElement('div');
        div.className = 'ring-element';
        div.textContent = elem;
        div.style.position = 'absolute';
        div.style.left = `calc(50% + ${x}px - 25px)`;
        div.style.top = `calc(50% + ${y}px - 25px)`;
        div.style.background = 'var(--ring-main)';
        div.style.color = 'white';
        div.style.animationDelay = `${i * 0.1}s`;

        nested.appendChild(div);
    });

    // Extension elements
    const extElems = ['√2', 'π', 'i', 'e'];
    const extRadius = 200;
    const extStep = (2 * Math.PI) / extElems.length;

    extElems.forEach((elem, i) => {
        const angle = i * extStep;
        const x = extRadius * Math.cos(angle);
        const y = extRadius * Math.sin(angle);

        const div = document.createElement('div');
        div.className = 'ring-element';
        div.textContent = elem;
        div.style.position = 'absolute';
        div.style.left = `calc(50% + ${x}px - 25px)`;
        div.style.top = `calc(50% + ${y}px - 25px)`;
        div.style.background = 'var(--accent-gold)';
        div.style.animationDelay = `${(i + 0.5) * 0.1}s`;

        nested.appendChild(div);
    });

    nested.appendChild(innerRing);
    nested.appendChild(outerRing);
    nested.appendChild(innerLabel);
    nested.appendChild(outerLabel);
    container.appendChild(nested);

    visualizationArea.innerHTML = '';
    visualizationArea.appendChild(container);

    updateIdeology('extension');
    updateProperties({
        "原环": "ℤ (整数)",
        "扩环示例": "ℝ (实数)",
        "包含关系": "R ⊆ S",
        "精神": "开放包容发展"
    });
}

// Helper functions
function deactivateAllConceptBtns() {
    [subringBtn, idealBtn, quotientBtn, extensionBtn].forEach(btn => {
        btn.classList.remove('active');
    });
}

function setActiveConceptBtn(btn) {
    deactivateAllConceptBtns();
    btn.classList.add('active');
}

function reset() {
    visualizationArea.innerHTML = `
        <div class="welcome-state">
            <div class="star-container">
                <svg viewBox="0 0 100 100" class="red-star">
                    <polygon points="50,15 61,40 88,40 67,57 74,82 50,65 26,82 33,57 12,40 39,40"
                        fill="#d63b1d" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#d63b1d" stroke-width="2"
                        stroke-dasharray="5,5" />
                </svg>
            </div>
            <p class="welcome-text">点击"可视化结构"开始探索团结之环</p>
        </div>
    `;

    vizTitle.textContent = '环结构可视化';
    vizSubtitle.textContent = '选择概念开始探索';

    input1.value = '';
    input2.value = '';
    resultValue.textContent = '—';
    resultValue.style.color = 'var(--accent-red)';

    currentConcept = null;
    deactivateAllConceptBtns();

    updateIdeology(currentRing);
    updateProperties();
}

// Event Listeners
ringType.addEventListener('change', (e) => {
    currentRing = e.target.value;
    updateIdeology(currentRing);
    reset();
});

subringBtn.addEventListener('click', visualizeSubring);
idealBtn.addEventListener('click', visualizeIdeal);
quotientBtn.addEventListener('click', visualizeQuotient);
extensionBtn.addEventListener('click', visualizeExtension);

calculateBtn.addEventListener('click', calculate);

input1.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculate();
});

input2.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculate();
});

visualizeBtn.addEventListener('click', () => {
    if (currentConcept) {
        // Re-visualize current concept
        switch (currentConcept) {
            case 'subring': visualizeSubring(); break;
            case 'ideal': visualizeIdeal(); break;
            case 'quotient': visualizeQuotient(); break;
            case 'extension': visualizeExtension(); break;
        }
    } else {
        visualizeRingStructure();
    }
});

resetBtn.addEventListener('click', reset);

// Initialize
init();
