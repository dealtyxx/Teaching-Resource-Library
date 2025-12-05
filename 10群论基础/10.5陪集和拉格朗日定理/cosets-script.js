/**
 * 陪集和拉格朗日定理可视化系统
 * Cosets and Lagrange's Theorem Visualization System
 */

// DOM Elements
const typeButtons = document.querySelectorAll('.type-btn');
const groupSelect = document.getElementById('groupSelect');
const groupOrderValue = document.getElementById('groupOrderValue');
const subgroupOrderValue = document.getElementById('subgroupOrderValue');
const cosetCountValue = document.getElementById('cosetCountValue');
const subgroupSelector = document.getElementById('subgroupSelector');
const elementSelector = document.getElementById('elementSelector');
const resultDisplay = document.getElementById('resultDisplay');
const conceptTitle = document.getElementById('conceptTitle');
const conceptContent = document.getElementById('conceptContent');
const mainTitle = document.getElementById('mainTitle');
const mainSubtitle = document.getElementById('mainSubtitle');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const ideologyTitle = document.getElementById('ideologyTitle');
const ideologyText = document.getElementById('ideologyText');
const analogyText = document.getElementById('analogyText');
const cosetSvg = document.getElementById('cosetSvg');
const cosetGroup = document.getElementById('cosetGroup');
const cosetTableContent = document.getElementById('cosetTableContent');
const formulaExplanation = document.getElementById('formulaExplanation');
const calculationDisplay = document.getElementById('calculationDisplay');
const demonstrateBtn = document.getElementById('demonstrateBtn');
const resetBtn = document.getElementById('resetBtn');

// State
let currentType = 'left';
let currentGroup = 's3';
let currentSubgroup = null;
let selectedElement = null;

// Coset Colors
const COSET_COLORS = [
    '#10b981', '#4ecdc4', '#ff6b6b', '#f59e0b', '#8b5cf6', '#ec4899'
];

// Type Data
const TYPES = {
    left: {
        name: '左陪集',
        nameEn: 'Left Cosets',
        title: '团结协作',
        quote: '"众人拾柴火焰高，团结就是力量。"',
        author: '— 中国谚语',
        ideology: '左陪集体现了"以人为本"的组织理念。每个成员（群元素）与团队（子群）结合，形成新的工作单元，展现了个体与集体的和谐统一。',
        analogy: '如同党支部建设，每位党员带领一个小组（子群），形成不同的支部（左陪集），各司其职但目标一致。',
        conceptInfo: `
            <p><strong>左陪集:</strong> gH = {gh | h ∈ H}</p>
            <p><strong>核心思想:</strong> 群元素左乘子群。</p>
            <p><strong>社会意义:</strong> 个人带领团队协作。</p>
        `,
        notation: (g, H) => `${g}H`
    },
    right: {
        name: '右陪集',
        nameEn: 'Right Cosets',
        title: '分工合作',
        quote: '"各尽所能，各取所需。"',
        author: '— 马克思主义原则',
        ideology: '右陪集展现了"因地制宜"的工作方法。团队（子群）根据不同情况（群元素）调整策略，体现了灵活应变与统筹兼顾的智慧。',
        analogy: '如同项目团队，核心团队（子群）根据不同项目需求（群元素）调整配置，形成不同的项目组（右陪集）。',
        conceptInfo: `
            <p><strong>右陪集:</strong> Hg = {hg | h ∈ H}</p>
            <p><strong>核心思想:</strong> 子群右乘群元素。</p>
            <p><strong>社会意义:</strong> 团队适应不同任务。</p>
        `,
        notation: (g, H) => `H${g}`
    },
    lagrange: {
        name: '拉格朗日定理',
        nameEn: "Lagrange's Theorem",
        title: '整体规律',
        quote: '"不谋全局者，不足以谋一域。"',
        author: '— 陈澹然',
        ideology: '拉格朗日定理揭示了整体与部分的辩证关系。部分的规模决定了整体的结构，体现了"量变引起质变"的哲学思想。',
        analogy: '如同组织架构设计，企业总人数必然是部门人数的整数倍，这是组织管理的基本规律，体现了科学管理的必然性。',
        conceptInfo: `
            <p><strong>定理:</strong> |G| = |H| × [G:H]</p>
            <p><strong>核心思想:</strong> 子群阶数整除群阶数。</p>
            <p><strong>社会意义:</strong> 整体与部分的和谐统一。</p>
        `,
        notation: null
    }
};

// Group Definitions
const GROUPS = {
    s3: {
        name: 'S₃',
        fullName: '对称群 S₃',
        order: 6,
        elements: ['e', 'r', 'r²', 's', 'sr', 'sr²'],
        operation: (x, y) => {
            const table = {
                'e': { 'e': 'e', 'r': 'r', 'r²': 'r²', 's': 's', 'sr': 'sr', 'sr²': 'sr²' },
                'r': { 'e': 'r', 'r': 'r²', 'r²': 'e', 's': 'sr', 'sr': 'sr²', 'sr²': 's' },
                'r²': { 'e': 'r²', 'r': 'e', 'r²': 'r', 's': 'sr²', 'sr': 's', 'sr²': 'sr' },
                's': { 'e': 's', 'r': 'sr²', 'r²': 'sr', 's': 'e', 'sr': 'r²', 'sr²': 'r' },
                'sr': { 'e': 'sr', 'r': 's', 'r²': 'sr²', 's': 'r', 'sr': 'e', 'sr²': 'r²' },
                'sr²': { 'e': 'sr²', 'r': 'sr', 'r²': 's', 's': 'r²', 'sr': 'r', 'sr²': 'e' }
            };
            return table[x][y];
        },
        subgroups: [
            { name: 'H₁', elements: ['e'], description: '平凡子群' },
            { name: 'H₂', elements: ['e', 'r', 'r²'], description: '旋转子群' },
            { name: 'H₃', elements: ['e', 's'], description: '对称子群' }
        ]
    },
    z6: {
        name: 'ℤ₆',
        fullName: '循环群 ℤ₆',
        order: 6,
        elements: [0, 1, 2, 3, 4, 5],
        operation: (a, b) => (a + b) % 6,
        subgroups: [
            { name: 'H₁', elements: [0], description: '平凡子群' },
            { name: 'H₂', elements: [0, 2, 4], description: '子群 {0,2,4}' },
            { name: 'H₃', elements: [0, 3], description: '子群 {0,3}' }
        ]
    },
    z8: {
        name: 'ℤ₈',
        fullName: '循环群 ℤ₈',
        order: 8,
        elements: [0, 1, 2, 3, 4, 5, 6, 7],
        operation: (a, b) => (a + b) % 8,
        subgroups: [
            { name: 'H₁', elements: [0], description: '平凡子群' },
            { name: 'H₂', elements: [0, 2, 4, 6], description: '偶数子群' },
            { name: 'H₃', elements: [0, 4], description: '子群 {0,4}' }
        ]
    },
    d4: {
        name: 'D₄',
        fullName: '二面体群 D₄',
        order: 8,
        elements: ['e', 'r', 'r²', 'r³', 's', 'sr', 'sr²', 'sr³'],
        operation: (x, y) => {
            // Simplified D4 operation table
            const rotations = ['e', 'r', 'r²', 'r³'];
            const reflections = ['s', 'sr', 'sr²', 'sr³'];

            // This is a simplified version
            if (x === 'e') return y;
            if (y === 'e') return x;

            // Rotation composition
            if (rotations.includes(x) && rotations.includes(y)) {
                const i = rotations.indexOf(x);
                const j = rotations.indexOf(y);
                return rotations[(i + j) % 4];
            }

            // Simplified for demo
            return 'e';
        },
        subgroups: [
            { name: 'H₁', elements: ['e'], description: '平凡子群' },
            { name: 'H₂', elements: ['e', 'r', 'r²', 'r³'], description: '旋转子群' },
            { name: 'H₃', elements: ['e', 'r²'], description: '子群 {e,r²}' }
        ]
    }
};

// Initialization
window.addEventListener('load', () => {
    updateType('left');
    updateGroup('s3');
    attachEventListeners();
});

// Update Type
function updateType(type) {
    currentType = type;
    const data = TYPES[type];

    typeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    conceptTitle.textContent = data.title;
    conceptContent.innerHTML = data.conceptInfo;
    mainTitle.textContent = `${data.name} - ${data.title}的组织智慧`;
    mainSubtitle.textContent = data.nameEn;
    quoteText.textContent = data.quote;
    quoteAuthor.textContent = data.author;
    ideologyTitle.textContent = data.name + ' · ' + data.title;
    ideologyText.innerHTML = `<p>${data.ideology}</p>`;
    analogyText.textContent = data.analogy;

    if (currentSubgroup) {
        renderCosets();
    }
}

// Update Group
function updateGroup(groupId) {
    currentGroup = groupId;
    const group = GROUPS[groupId];

    groupOrderValue.textContent = group.order;

    // Render subgroup selector
    renderSubgroupSelector(group);

    // Render element selector
    renderElementSelector(group);

    // Select first non-trivial subgroup by default
    if (group.subgroups.length > 1) {
        selectSubgroup(group.subgroups[1]);
    }
}

// Render Subgroup Selector
function renderSubgroupSelector(group) {
    subgroupSelector.innerHTML = '';

    group.subgroups.forEach((subgroup, index) => {
        const div = document.createElement('div');
        div.className = 'subgroup-item';
        div.innerHTML = `
            <strong>${subgroup.name}</strong>: {${subgroup.elements.join(', ')}}
            <br><small>${subgroup.description}</small>
        `;
        div.addEventListener('click', () => selectSubgroup(subgroup));
        subgroupSelector.appendChild(div);
    });
}

// Select Subgroup
function selectSubgroup(subgroup) {
    currentSubgroup = subgroup;

    // Update UI
    document.querySelectorAll('.subgroup-item').forEach((item, index) => {
        const group = GROUPS[currentGroup];
        item.classList.toggle('selected', group.subgroups.indexOf(subgroup) === index);
    });

    subgroupOrderValue.textContent = subgroup.elements.length;

    const group = GROUPS[currentGroup];
    const cosetCount = group.order / subgroup.elements.length;
    cosetCountValue.textContent = cosetCount;

    // Update Lagrange calculation
    calculationDisplay.textContent = `${group.order} = ${subgroup.elements.length} × ${cosetCount}`;

    // Highlight subgroup elements
    document.querySelectorAll('.element-item').forEach(item => {
        const element = item.dataset.value;
        const isInSubgroup = subgroup.elements.includes(element) ||
            subgroup.elements.includes(parseInt(element));
        item.classList.toggle('in-subgroup', isInSubgroup);
    });

    renderCosets();
}

// Render Element Selector
function renderElementSelector(group) {
    elementSelector.innerHTML = '';

    group.elements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';
        div.textContent = el;
        div.dataset.value = el;
        div.addEventListener('click', () => selectElement(el));
        elementSelector.appendChild(div);
    });
}

// Select Element
function selectElement(element) {
    selectedElement = element;

    document.querySelectorAll('.element-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.value == element);
    });

    if (!currentSubgroup) {
        resultDisplay.innerHTML = '<p style="color: var(--text-secondary);">请先选择一个子群</p>';
        return;
    }

    const coset = computeCoset(element, currentSubgroup);
    displayCosetInfo(element, coset);
    highlightCoset(coset);
}

// Compute Coset
function computeCoset(g, subgroup) {
    const group = GROUPS[currentGroup];
    const coset = [];

    subgroup.elements.forEach(h => {
        let result;
        if (currentType === 'left') {
            result = group.operation(g, h);
        } else {
            result = group.operation(h, g);
        }
        coset.push(result);
    });

    return coset;
}

// Display Coset Info
function displayCosetInfo(g, coset) {
    const notation = currentType === 'left' ? `${g}H` : `H${g}`;

    resultDisplay.innerHTML = `
        <p style="font-size: 1rem; margin-bottom: 8px;">
            <strong style="color: var(--accent-red);">陪集 ${notation}</strong>
        </p>
        <p style="font-size: 0.9rem;">
            元素: <strong style="color: var(--accent-gold);">{${coset.join(', ')}}</strong>
        </p>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">
            💡 ${currentType === 'left' ? '左陪集' : '右陪集'}通过${currentType === 'left' ? '左乘' : '右乘'}子群元素获得
        </p>
    `;
}

// Render Cosets Visualization
function renderCosets() {
    if (!currentSubgroup) return;

    const group = GROUPS[currentGroup];
    const cosets = getAllCosets(group, currentSubgroup);

    // Render SVG
    renderCosetsSVG(cosets);

    // Render Table
    renderCosetsTable(cosets);
}

// Get All Cosets
function getAllCosets(group, subgroup) {
    const cosets = [];
    const covered = new Set();

    group.elements.forEach(g => {
        if (covered.has(g.toString())) return;

        const coset = computeCoset(g, subgroup);
        cosets.push({
            representative: g,
            elements: coset
        });

        coset.forEach(el => covered.add(el.toString()));
    });

    return cosets;
}

// Render Cosets SVG
function renderCosetsSVG(cosets) {
    cosetGroup.innerHTML = '';

    const WIDTH = cosetSvg.clientWidth || 600;
    const HEIGHT = cosetSvg.clientHeight || 400;
    const padding = 60;

    const numCosets = cosets.length;
    const cosetWidth = (WIDTH - 2 * padding) / numCosets;
    const cosetHeight = HEIGHT - 2 * padding;

    cosets.forEach((coset, i) => {
        const x = padding + i * cosetWidth;
        const y = padding;
        const color = COSET_COLORS[i % COSET_COLORS.length];

        // Draw boundary
        const boundary = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        boundary.setAttribute('x', x + 10);
        boundary.setAttribute('y', y);
        boundary.setAttribute('width', cosetWidth - 20);
        boundary.setAttribute('height', cosetHeight);
        boundary.setAttribute('class', 'coset-boundary');
        boundary.setAttribute('stroke', color);
        boundary.setAttribute('rx', 15);
        cosetGroup.appendChild(boundary);

        // Draw label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x + cosetWidth / 2);
        label.setAttribute('y', y - 15);
        label.setAttribute('class', 'coset-label');
        label.setAttribute('fill', color);
        const notation = currentType === 'left'
            ? `${coset.representative}H`
            : `H${coset.representative}`;
        label.textContent = notation;
        cosetGroup.appendChild(label);

        // Draw elements
        const numElements = coset.elements.length;
        coset.elements.forEach((el, j) => {
            const elementY = y + (j + 0.5) * (cosetHeight / numElements);
            const elementX = x + cosetWidth / 2;

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'coset-element');
            g.setAttribute('transform', `translate(${elementX}, ${elementY})`);
            g.dataset.element = el;
            g.dataset.cosetIndex = i;

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', 20);
            circle.setAttribute('class', 'element-circle');
            circle.setAttribute('fill', color);
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', 2);
            circle.setAttribute('filter', 'url(#glow)');

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('class', 'element-label');
            text.textContent = el;

            g.appendChild(circle);
            g.appendChild(text);
            cosetGroup.appendChild(g);

            // Click event
            g.addEventListener('click', () => {
                selectElement(coset.representative);
            });
        });
    });
}

// Render Cosets Table
function renderCosetsTable(cosets) {
    cosetTableContent.innerHTML = '';

    cosets.forEach((coset, i) => {
        const div = document.createElement('div');
        div.className = 'coset-item';
        div.style.borderLeftColor = COSET_COLORS[i % COSET_COLORS.length];

        const notation = currentType === 'left'
            ? `${coset.representative}H`
            : `H${coset.representative}`;

        div.innerHTML = `
            <div class="coset-item-header">
                <span>${notation}</span>
                <span style="color: ${COSET_COLORS[i % COSET_COLORS.length]};">●</span>
            </div>
            <div class="coset-item-elements">
                {${coset.elements.join(', ')}}
            </div>
        `;

        div.addEventListener('click', () => {
            selectElement(coset.representative);
        });

        cosetTableContent.appendChild(div);
    });
}

// Highlight Coset
function highlightCoset(cosetElements) {
    document.querySelectorAll('.coset-element').forEach(el => {
        const element = el.dataset.element;
        const isInCoset = cosetElements.includes(element) ||
            cosetElements.includes(parseInt(element));

        const circle = el.querySelector('.element-circle');
        if (isInCoset) {
            circle.setAttribute('stroke', '#ffb400');
            circle.setAttribute('stroke-width', 4);
            circle.style.filter = 'drop-shadow(0 0 10px #ffb400)';
        } else {
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', 2);
            circle.style.filter = '';
        }
    });
}

// Demonstrate Coset Decomposition
async function demonstrateCosetDecomposition() {
    if (!currentSubgroup) {
        resultDisplay.innerHTML = '<p style="color: var(--danger-red);">请先选择一个子群</p>';
        return;
    }

    demonstrateBtn.disabled = true;
    demonstrateBtn.textContent = '演示中...';

    const group = GROUPS[currentGroup];
    const cosets = getAllCosets(group, currentSubgroup);

    resultDisplay.innerHTML = `
        <p style="font-size: 0.95rem; color: var(--accent-red); margin-bottom: 8px;">
            <strong>🎯 陪集分解演示</strong>
        </p>
        <p style="font-size: 0.85rem;">
            将群 ${group.name} 分解为 ${cosets.length} 个互不相交的陪集
        </p>
    `;

    for (let i = 0; i < cosets.length; i++) {
        const coset = cosets[i];

        // Highlight current coset
        document.querySelectorAll('.coset-element').forEach(el => {
            const isInCurrentCoset = parseInt(el.dataset.cosetIndex) === i;
            const circle = el.querySelector('.element-circle');

            if (isInCurrentCoset) {
                circle.setAttribute('r', 25);
                circle.setAttribute('stroke-width', 4);
                circle.style.filter = 'drop-shadow(0 0 15px currentColor)';
            } else {
                circle.setAttribute('r', 20);
                circle.setAttribute('stroke-width', 2);
                circle.style.filter = '';
            }
        });

        const notation = currentType === 'left'
            ? `${coset.representative}H`
            : `H${coset.representative}`;

        resultDisplay.innerHTML = `
            <p style="font-size: 0.95rem; color: var(--accent-red); margin-bottom: 8px;">
                <strong>🎯 陪集分解演示</strong>
            </p>
            <p style="font-size: 0.9rem; margin: 8px 0;">
                第 ${i + 1} 个陪集: <strong style="color: ${COSET_COLORS[i % COSET_COLORS.length]};">${notation}</strong>
            </p>
            <p style="font-size: 0.85rem;">
                元素: {${coset.elements.join(', ')}}
            </p>
        `;

        await sleep(1500);
    }

    // Reset highlighting
    document.querySelectorAll('.coset-element').forEach(el => {
        const circle = el.querySelector('.element-circle');
        circle.setAttribute('r', 20);
        circle.setAttribute('stroke-width', 2);
        circle.style.filter = '';
    });

    resultDisplay.innerHTML = `
        <p style="color: var(--color-coset-1);">✓ 演示完成！</p>
        <p style="font-size: 0.85rem; margin-top: 6px;">
            群 ${group.name} 被完美分解为 ${cosets.length} 个互不重叠的陪集，
            每个陪集包含 ${currentSubgroup.elements.length} 个元素。
        </p>
        <p style="font-size: 0.85rem; margin-top: 6px; color: var(--accent-red);">
            <strong>拉格朗日定理:</strong> ${group.order} = ${currentSubgroup.elements.length} × ${cosets.length}
        </p>
    `;

    demonstrateBtn.disabled = false;
    demonstrateBtn.textContent = '▶ 演示陪集分解';
}

// Helper function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event Listeners
function attachEventListeners() {
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => updateType(btn.dataset.type));
    });

    groupSelect.addEventListener('change', (e) => {
        updateGroup(e.target.value);
    });

    demonstrateBtn.addEventListener('click', demonstrateCosetDecomposition);

    resetBtn.addEventListener('click', () => {
        location.reload();
    });
}
