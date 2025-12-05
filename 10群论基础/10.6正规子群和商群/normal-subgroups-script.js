/**
 * 正规子群和商群可视化系统
 * Normal Subgroups and Quotient Groups Visualization System
 */

// DOM Elements
const typeButtons = document.querySelectorAll('.type-btn');
const groupSelect = document.getElementById('groupSelect');
const groupOrderValue = document.getElementById('groupOrderValue');
const subgroupCountValue = document.getElementById('subgroupCountValue');
const normalCountValue = document.getElementById('normalCountValue');
const subgroupSelector = document.getElementById('subgroupSelector');
const elementSelector = document.getElementById('elementSelector');
const testResult = document.getElementById('testResult');
const conceptTitle = document.getElementById('conceptTitle');
const conceptContent = document.getElementById('conceptContent');
const mainTitle = document.getElementById('mainTitle');
const mainSubtitle = document.getElementById('mainSubtitle');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const ideologyTitle = document.getElementById('ideologyTitle');
const ideologyText = document.getElementById('ideologyText');
const analogyText = document.getElementById('analogyText');
const normalSvg = document.getElementById('normalSvg');
const mainGroup = document.getElementById('mainGroup');
const criteriaList = document.getElementById('criteriaList');
const quotientContainer = document.getElementById('quotientContainer');
const quotientTableContent = document.getElementById('quotientTableContent');
const conjugacyResult = document.getElementById('conjugacyResult');
const conjugacyExplanation = document.getElementById('conjugacyExplanation');
const demonstrateBtn = document.getElementById('demonstrateBtn');
const constructBtn = document.getElementById('constructBtn');
const resetBtn = document.getElementById('resetBtn');

// State
let currentType = 'normal';
let currentGroup = 's3';
let currentSubgroup = null;
let selectedElement = null;

// Type Data
const TYPES = {
    normal: {
        name: '正规子群',
        nameEn: 'Normal Subgroup',
        title: '和谐统一',
        quote: '"求同存异，和而不同，共建和谐。"',
        author: '— 中国传统智慧',
        ideology: '正规子群体现了组织的核心价值观念。它在任何变换下都保持不变，象征着组织的核心理念应当坚守不移。无论外部环境如何变化（群元素的共轭作用），核心价值始终如一。',
        analogy: '如同党的领导核心地位，无论形势如何变化，党的领导始终是中国特色社会主义最本质的特征。正规子群的不变性，正如核心价值观的坚定性，是组织团结统一的基石。',
        conceptInfo: `
            <p><strong>正规子群:</strong> 满足 gHg⁻¹ = H 的子群。</p>
            <p><strong>核心思想:</strong> 内部对称，外部和谐。</p>
            <p><strong>社会意义:</strong> 组织的核心价值观。</p>
        `
    },
    quotient: {
        name: '商群',
        nameEn: 'Quotient Group',
        title: '层级管理',
        quote: '"纲举目张，有条不紊。"',
        author: '— 管理智慧',
        ideology: '商群体现了层级管理的组织智慧。通过正规子群将复杂的群结构简化为更高层次的抽象，实现了"化繁为简"的管理艺术。每个陪集代表一个管理层级，层级之间的运算体现了协调配合。',
        analogy: '如同企业的层级管理结构，将员工按部门（陪集）划分，部门之间的协作（商群运算）遵循统一的规则，实现了组织的高效运转。',
        conceptInfo: `
            <p><strong>商群:</strong> G/H = {gH | g ∈ G}</p>
            <p><strong>核心思想:</strong> 层级抽象，化繁为简。</p>
            <p><strong>社会意义:</strong> 科学的层级管理。</p>
        `
    },
    relation: {
        name: '关系演示',
        nameEn: 'Relationship Demo',
        title: '内外统一',
        quote: '"正其本，清其源。"',
        author: '— 管理原则',
        ideology: '正规子群与商群的关系体现了"内外统一"的哲学思想。内部的稳定性（正规性）决定了外部结构的合理性（商群存在），只有内部和谐统一，才能形成良好的组织架构。',
        analogy: '如同企业文化建设，只有核心价值观（正规子群）被全体成员认同，才能在此基础上构建有效的管理体系（商群），实现企业的可持续发展。',
        conceptInfo: `
            <p><strong>关系:</strong> H ⊲ G ⟺ G/H 存在</p>
            <p><strong>核心思想:</strong> 内部稳定，外部有序。</p>
            <p><strong>社会意义:</strong> 内外兼修，和谐发展。</p>
        `
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
        inverse: (x) => {
            const inv = { 'e': 'e', 'r': 'r²', 'r²': 'r', 's': 's', 'sr': 'sr²', 'sr²': 'sr' };
            return inv[x];
        },
        subgroups: [
            { name: 'H₁', elements: ['e'], isNormal: true, description: '平凡子群（正规）' },
            { name: 'H₂', elements: ['e', 'r', 'r²'], isNormal: true, description: '旋转子群（正规）' },
            { name: 'H₃', elements: ['e', 's'], isNormal: false, description: '反射子群（非正规）' },
            { name: 'H₄', elements: ['e', 'sr'], isNormal: false, description: '反射子群（非正规）' }
        ]
    },
    d4: {
        name: 'D₄',
        fullName: '二面体群 D₄',
        order: 8,
        elements: ['e', 'r', 'r²', 'r³', 's', 'sr', 'sr²', 'sr³'],
        operation: (x, y) => {
            // Simplified operation for demo
            if (x === 'e') return y;
            if (y === 'e') return x;
            // Full D4 table would be here
            return 'e'; // Simplified
        },
        inverse: (x) => {
            const inv = { 'e': 'e', 'r': 'r³', 'r²': 'r²', 'r³': 'r', 's': 's', 'sr': 'sr³', 'sr²': 'sr²', 'sr³': 'sr' };
            return inv[x];
        },
        subgroups: [
            { name: 'H₁', elements: ['e'], isNormal: true, description: '平凡子群（正规）' },
            { name: 'H₂', elements: ['e', 'r', 'r²', 'r³'], isNormal: true, description: '旋转子群（正规）' },
            { name: 'H₃', elements: ['e', 'r²'], isNormal: true, description: '180°旋转（正规）' }
        ]
    },
    z6: {
        name: 'ℤ₆',
        fullName: '循环群 ℤ₆',
        order: 6,
        elements: [0, 1, 2, 3, 4, 5],
        operation: (a, b) => (a + b) % 6,
        inverse: (a) => (6 - a) % 6,
        subgroups: [
            { name: 'H₁', elements: [0], isNormal: true, description: '平凡子群（正规）' },
            { name: 'H₂', elements: [0, 2, 4], isNormal: true, description: '子群{0,2,4}（正规）' },
            { name: 'H₃', elements: [0, 3], isNormal: true, description: '子群{0,3}（正规）' }
        ]
    },
    a4: {
        name: 'A₄',
        fullName: '交错群 A₄',
        order: 12,
        elements: ['e', 'a', 'b', 'c', 'd', 'f', 'g', 'h', 'i', 'j', 'k', 'l'],
        operation: (x, y) => {
            if (x === 'e') return y;
            if (y === 'e') return x;
            return 'e'; // Simplified for demo
        },
        inverse: (x) => x === 'e' ? 'e' : 'e', // Simplified
        subgroups: [
            { name: 'H₁', elements: ['e'], isNormal: true, description: '平凡子群（正规）' },
            { name: 'H₂', elements: ['e', 'a', 'b', 'c'], isNormal: true, description: '克莱因四元群（正规）' }
        ]
    }
};

// Initialization
window.addEventListener('load', () => {
    updateType('normal');
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
    mainTitle.textContent = `${data.name} - ${data.title}的组织核心`;
    mainSubtitle.textContent = data.nameEn;
    quoteText.textContent = data.quote;
    quoteAuthor.textContent = data.author;
    ideologyTitle.textContent = data.name + ' · ' + data.title;
    ideologyText.innerHTML = `<p>${data.ideology}</p>`;
    analogyText.textContent = data.analogy;

    if (type === 'quotient') {
        quotientContainer.style.display = 'block';
    } else {
        quotientContainer.style.display = 'none';
    }

    if (currentSubgroup) {
        renderVisualization();
    }
}

// Update Group
function updateGroup(groupId) {
    currentGroup = groupId;
    const group = GROUPS[groupId];

    groupOrderValue.textContent = group.order;
    subgroupCountValue.textContent = group.subgroups.length;

    const normalCount = group.subgroups.filter(sg => sg.isNormal).length;
    normalCountValue.textContent = normalCount;

    renderSubgroupSelector(group);
    renderElementSelector(group);

    // Select first normal subgroup by default
    const firstNormal = group.subgroups.find(sg => sg.isNormal && sg.elements.length > 1);
    if (firstNormal) {
        selectSubgroup(firstNormal);
    } else if (group.subgroups.length > 0) {
        selectSubgroup(group.subgroups[0]);
    }
}

// Render Subgroup Selector
function renderSubgroupSelector(group) {
    subgroupSelector.innerHTML = '';

    group.subgroups.forEach((subgroup) => {
        const div = document.createElement('div');
        div.className = 'subgroup-item' + (subgroup.isNormal ? ' is-normal' : '');
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

    document.querySelectorAll('.subgroup-item').forEach((item) => {
        const group = GROUPS[currentGroup];
        const sg = group.subgroups.find(s =>
            item.textContent.includes(s.name) && item.textContent.includes(s.description)
        );
        item.classList.toggle('selected', sg === subgroup);
    });

    updateCriteriaBox(subgroup);
    renderVisualization();

    if (currentType === 'quotient' && subgroup.isNormal) {
        renderQuotientGroup(subgroup);
    }
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
        testResult.innerHTML = '<p style="color: var(--text-secondary);">请先选择一个子群</p>';
        return;
    }

    performConjugacyTest(element, currentSubgroup);
}

// Perform Conjugacy Test: gHg⁻¹
function performConjugacyTest(g, subgroup) {
    const group = GROUPS[currentGroup];
    const gInv = group.inverse(g);

    const conjugatedSet = new Set();
    subgroup.elements.forEach(h => {
        // Compute g * h * g⁻¹
        const gh = group.operation(g, h);
        const ghg_inv = group.operation(gh, gInv);
        conjugatedSet.add(ghg_inv.toString());
    });

    const originalSet = new Set(subgroup.elements.map(e => e.toString()));
    const isInvariant = areSetsEqual(conjugatedSet, originalSet);

    conjugacyResult.textContent = isInvariant ? 'H ✓' : '≠ H ✗';
    conjugacyResult.style.color = isInvariant ? 'var(--color-normal)' : 'var(--color-non-normal)';

    conjugacyExplanation.innerHTML = `
        <strong>g = ${g}, g⁻¹ = ${gInv}</strong><br>
        gHg⁻¹ = {${Array.from(conjugatedSet).join(', ')}}<br>
        ${isInvariant ?
            '<span style="color: var(--color-normal);">✓ 共轭不变，满足正规性</span>' :
            '<span style="color: var(--color-non-normal);">✗ 共轭改变，不满足正规性</span>'}
    `;

    testResult.innerHTML = `
        <p style="font-size: 0.95rem; margin-bottom: 8px;">
            <strong style="color: var(--accent-red);">共轭检验</strong>
        </p>
        <p style="font-size: 0.9rem;">
            元素 g = <strong>${g}</strong>, g⁻¹ = <strong>${gInv}</strong>
        </p>
        <p style="font-size: 0.85rem; margin-top: 6px;">
            gHg⁻¹ = {${Array.from(conjugatedSet).join(', ')}}
        </p>
        <p style="font-size: 0.85rem; color: ${isInvariant ? 'var(--color-normal)' : 'var(--color-non-normal)'}; margin-top: 6px;">
            ${isInvariant ? '✓ 满足正规性条件' : '✗ 不满足正规性条件'}
        </p>
    `;
}

// Update Criteria Box
function updateCriteriaBox(subgroup) {
    criteriaList.innerHTML = '';

    const criteria = [
        { text: '左陪集 = Right陪集', passed: subgroup.isNormal },
        { text: 'gHg⁻¹ ⊆ H, ∀g∈G', passed: subgroup.isNormal },
        { text: '商群 G/H 存在', passed: subgroup.isNormal }
    ];

    criteria.forEach(criterion => {
        const div = document.createElement('div');
        div.className = 'criteria-item' + (criterion.passed ? '' : ' failed');
        div.innerHTML = `
            <span class="criteria-icon">${criterion.passed ? '✓' : '✗'}</span>
            <span>${criterion.text}</span>
        `;
        criteriaList.appendChild(div);
    });
}

// Render Visualization
function renderVisualization() {
    if (!currentSubgroup) return;

    mainGroup.innerHTML = '';
    const arrowsGroup = document.getElementById('arrowsGroup');
    arrowsGroup.innerHTML = '';

    const group = GROUPS[currentGroup];

    const WIDTH = normalSvg.clientWidth || 600;
    const HEIGHT = normalSvg.clientHeight || 350;

    // 根据不同视图模式渲染不同的可视化
    if (currentType === 'normal') {
        renderNormalSubgroupView(group, WIDTH, HEIGHT);
    } else if (currentType === 'quotient') {
        renderQuotientGroupView(group, WIDTH, HEIGHT);
    } else if (currentType === 'relation') {
        renderRelationshipView(group, WIDTH, HEIGHT);
    }
}

// 正规子群视图：显示群结构和正规子群边界
function renderNormalSubgroupView(group, WIDTH, HEIGHT) {
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;
    const radius = Math.min(WIDTH, HEIGHT) / 3;
    const n = group.elements.length;

    // 绘制正规子群边界
    if (currentSubgroup.isNormal && currentSubgroup.elements.length > 1) {
        const boundaryPoints = [];
        currentSubgroup.elements.forEach(el => {
            const idx = group.elements.indexOf(el);
            const angle = (2 * Math.PI * idx) / n - Math.PI / 2;
            const x = centerX + (radius + 15) * Math.cos(angle);
            const y = centerY + (radius + 15) * Math.sin(angle);
            boundaryPoints.push(`${x},${y}`);
        });

        if (boundaryPoints.length > 2) {
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', boundaryPoints.join(' '));
            polygon.setAttribute('class', 'subgroup-boundary');
            mainGroup.appendChild(polygon);
        }
    }

    // 绘制群元素
    group.elements.forEach((el, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'group-node');
        g.setAttribute('transform', `translate(${x}, ${y})`);
        g.dataset.element = el;

        const isInSubgroup = currentSubgroup.elements.includes(el) ||
            currentSubgroup.elements.includes(parseInt(el));

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', 22);
        circle.setAttribute('class', 'node-circle');
        circle.setAttribute('fill', isInSubgroup ? '#10b981' : '#d63b1d');
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', 2);
        circle.setAttribute('filter', 'url(#glow)');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'node-label');
        text.textContent = el;

        g.appendChild(circle);
        g.appendChild(text);
        mainGroup.appendChild(g);

        g.addEventListener('click', () => selectElement(el));
    });
}

// 商群视图：显示陪集分解
function renderQuotientGroupView(group, WIDTH, HEIGHT) {
    const cosets = getAllCosets(group, currentSubgroup);
    const numCosets = cosets.length;
    const padding = 60;
    const cosetWidth = (WIDTH - 2 * padding) / numCosets;
    const cosetHeight = HEIGHT - 2 * padding;

    const COSET_COLORS = ['#10b981', '#4ecdc4', '#ff6b6b', '#f59e0b', '#8b5cf6', '#ec4899'];

    cosets.forEach((coset, i) => {
        const x = padding + i * cosetWidth;
        const y = padding;
        const color = COSET_COLORS[i % COSET_COLORS.length];

        // 陪集边界框
        const boundary = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        boundary.setAttribute('x', x + 10);
        boundary.setAttribute('y', y);
        boundary.setAttribute('width', cosetWidth - 20);
        boundary.setAttribute('height', cosetHeight);
        boundary.setAttribute('fill', 'none');
        boundary.setAttribute('stroke', color);
        boundary.setAttribute('stroke-width', 3);
        boundary.setAttribute('stroke-dasharray', '8,4');
        boundary.setAttribute('rx', 15);
        boundary.setAttribute('opacity', 0.6);
        mainGroup.appendChild(boundary);

        // 陪集标签
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x + cosetWidth / 2);
        label.setAttribute('y', y - 15);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '16px');
        label.setAttribute('font-weight', '700');
        label.setAttribute('fill', color);
        label.textContent = `${coset.representative}H`;
        mainGroup.appendChild(label);

        // 陪集元素
        const numElements = coset.elements.length;
        coset.elements.forEach((el, j) => {
            const elementY = y + (j + 0.5) * (cosetHeight / numElements);
            const elementX = x + cosetWidth / 2;

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${elementX}, ${elementY})`);
            g.setAttribute('class', 'group-node');
            g.dataset.element = el;

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', 20);
            circle.setAttribute('class', 'node-circle');
            circle.setAttribute('fill', color);
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', 2);
            circle.setAttribute('filter', 'url(#glow)');

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('class', 'node-label');
            text.textContent = el;

            g.appendChild(circle);
            g.appendChild(text);
            mainGroup.appendChild(g);

            g.addEventListener('click', () => selectElement(coset.representative));
        });
    });

    // 自动显示商群运算表
    if (currentSubgroup.isNormal) {
        renderQuotientGroup(currentSubgroup);
    }
}

// 关系演示视图：显示G到G/H的映射
function renderRelationshipView(group, WIDTH, HEIGHT) {
    const leftX = WIDTH * 0.25;
    const rightX = WIDTH * 0.75;
    const centerY = HEIGHT / 2;
    const radius = Math.min(WIDTH, HEIGHT) / 4;

    // 左侧：原群G
    const leftLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    leftLabel.setAttribute('x', leftX);
    leftLabel.setAttribute('y', 30);
    leftLabel.setAttribute('text-anchor', 'middle');
    leftLabel.setAttribute('font-size', '20px');
    leftLabel.setAttribute('font-weight', '700');
    leftLabel.setAttribute('fill', '#d63b1d');
    leftLabel.textContent = `群 ${group.name}`;
    mainGroup.appendChild(leftLabel);

    // 绘制原群元素
    const n = group.elements.length;
    group.elements.forEach((el, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const x = leftX + radius * 0.8 * Math.cos(angle);
        const y = centerY + radius * 0.8 * Math.sin(angle);

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${x}, ${y})`);
        g.setAttribute('class', 'group-node');
        g.dataset.element = el;

        const isInSubgroup = currentSubgroup.elements.includes(el) ||
            currentSubgroup.elements.includes(parseInt(el));

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', 18);
        circle.setAttribute('class', 'node-circle');
        circle.setAttribute('fill', isInSubgroup ? '#10b981' : '#d63b1d');
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', 2);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'node-label');
        text.setAttribute('font-size', '12px');
        text.textContent = el;

        g.appendChild(circle);
        g.appendChild(text);
        mainGroup.appendChild(g);
    });

    // 右侧：商群G/H
    if (currentSubgroup.isNormal) {
        const cosets = getAllCosets(group, currentSubgroup);
        const rightLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rightLabel.setAttribute('x', rightX);
        rightLabel.setAttribute('y', 30);
        rightLabel.setAttribute('text-anchor', 'middle');
        rightLabel.setAttribute('font-size', '20px');
        rightLabel.setAttribute('font-weight', '700');
        rightLabel.setAttribute('fill', '#4ecdc4');
        rightLabel.textContent = `商群 ${group.name}/${currentSubgroup.name}`;
        mainGroup.appendChild(rightLabel);

        const COSET_COLORS = ['#10b981', '#4ecdc4', '#ff6b6b', '#f59e0b', '#8b5cf6', '#ec4899'];
        const numCosets = cosets.length;

        // 绘制商群元素（陪集）
        cosets.forEach((coset, i) => {
            const angle = (2 * Math.PI * i) / numCosets - Math.PI / 2;
            const x = rightX + radius * 0.8 * Math.cos(angle);
            const y = centerY + radius * 0.8 * Math.sin(angle);
            const color = COSET_COLORS[i % COSET_COLORS.length];

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${x}, ${y})`);
            g.setAttribute('class', 'group-node');

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', 28);
            circle.setAttribute('fill', color);
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', 3);
            circle.setAttribute('filter', 'url(#glow)');

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('font-size', '14px');
            text.setAttribute('font-weight', '700');
            text.setAttribute('fill', '#fff');
            text.textContent = `${coset.representative}H`;

            g.appendChild(circle);
            g.appendChild(text);
            mainGroup.appendChild(g);
        });

        // 绘制映射箭头
        const arrowsGroup = document.getElementById('arrowsGroup');
        group.elements.forEach((el, i) => {
            const angle1 = (2 * Math.PI * i) / n - Math.PI / 2;
            const x1 = leftX + radius * 0.8 * Math.cos(angle1);
            const y1 = centerY + radius * 0.8 * Math.sin(angle1);

            // 找到该元素所属的陪集
            const cosetIndex = cosets.findIndex(c =>
                c.elements.includes(el) || c.elements.includes(parseInt(el))
            );

            if (cosetIndex >= 0) {
                const angle2 = (2 * Math.PI * cosetIndex) / numCosets - Math.PI / 2;
                const x2 = rightX + radius * 0.8 * Math.cos(angle2);
                const y2 = centerY + radius * 0.8 * Math.sin(angle2);

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const d = `M ${x1 + 18} ${y1} Q ${WIDTH / 2} ${centerY} ${x2 - 28} ${y2}`;
                path.setAttribute('d', d);
                path.setAttribute('stroke', COSET_COLORS[cosetIndex % COSET_COLORS.length]);
                path.setAttribute('stroke-width', '1.5');
                path.setAttribute('fill', 'none');
                path.setAttribute('opacity', '0.4');
                path.setAttribute('marker-end', 'url(#arrowGold)');
                arrowsGroup.appendChild(path);
            }
        });

        // 添加映射符号
        const mapSymbol = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mapSymbol.setAttribute('x', WIDTH / 2);
        mapSymbol.setAttribute('y', HEIGHT - 20);
        mapSymbol.setAttribute('text-anchor', 'middle');
        mapSymbol.setAttribute('font-size', '18px');
        mapSymbol.setAttribute('font-weight', '700');
        mapSymbol.setAttribute('fill', '#ffb400');
        mapSymbol.textContent = 'π: G → G/H (自然同态)';
        mainGroup.appendChild(mapSymbol);
    } else {
        // 非正规子群提示
        const warningText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        warningText.setAttribute('x', rightX);
        warningText.setAttribute('y', centerY);
        warningText.setAttribute('text-anchor', 'middle');
        warningText.setAttribute('font-size', '16px');
        warningText.setAttribute('fill', '#ff6b6b');
        warningText.textContent = '该子群不是正规子群';
        mainGroup.appendChild(warningText);

        const warningText2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        warningText2.setAttribute('x', rightX);
        warningText2.setAttribute('y', centerY + 25);
        warningText2.setAttribute('text-anchor', 'middle');
        warningText2.setAttribute('font-size', '14px');
        warningText2.setAttribute('fill', '#ff6b6b');
        warningText2.textContent = '商群不存在';
        mainGroup.appendChild(warningText2);
    }
}

// Render Quotient Group
function renderQuotientGroup(subgroup) {
    if (!subgroup.isNormal) {
        quotientTableContent.innerHTML = '<p style="color: var(--color-non-normal); text-align: center; padding: 20px;">该子群不是正规子群，无法构造商群</p>';
        return;
    }

    const group = GROUPS[currentGroup];
    const cosets = getAllCosets(group, subgroup);

    const table = document.createElement('table');

    // Header row
    const headerRow = table.insertRow();
    headerRow.insertCell().textContent = '*';
    cosets.forEach(coset => {
        const th = document.createElement('th');
        th.textContent = `${coset.representative}H`;
        headerRow.appendChild(th);
    });

    // Data rows
    cosets.forEach(coset1 => {
        const row = table.insertRow();
        const th = document.createElement('th');
        th.textContent = `${coset1.representative}H`;
        row.appendChild(th);

        cosets.forEach(coset2 => {
            const cell = row.insertCell();
            // Compute coset product
            const product = group.operation(coset1.representative, coset2.representative);
            const resultCoset = cosets.find(c =>
                c.elements.includes(product) || c.elements.includes(parseInt(product))
            );
            cell.textContent = resultCoset ? `${resultCoset.representative}H` : '?';
        });
    });

    quotientTableContent.innerHTML = '';
    quotientTableContent.appendChild(table);
}

// Get All Cosets
function getAllCosets(group, subgroup) {
    const cosets = [];
    const covered = new Set();

    group.elements.forEach(g => {
        if (covered.has(g.toString())) return;

        const coset = [];
        subgroup.elements.forEach(h => {
            const gh = group.operation(g, h);
            coset.push(gh);
        });

        cosets.push({
            representative: g,
            elements: coset
        });

        coset.forEach(el => covered.add(el.toString()));
    });

    return cosets;
}

// Demonstrate Normality
async function demonstrateNormality() {
    if (!currentSubgroup) {
        testResult.innerHTML = '<p style="color: var(--danger-red);">请先选择一个子群</p>';
        return;
    }

    demonstrateBtn.disabled = true;
    demonstrateBtn.textContent = '演示中...';

    const group = GROUPS[currentGroup];

    testResult.innerHTML = `
        <p style="font-size: 0.95rem; color: var(--accent-red); margin-bottom: 8px;">
            <strong>🎯 正规性验证演示</strong>
        </p>
        <p style="font-size: 0.85rem;">
            检验子群 ${currentSubgroup.name} 的正规性
        </p>
    `;

    let allPassed = true;

    for (let i = 0; i < Math.min(group.elements.length, 4); i++) {
        const g = group.elements[i];
        const gInv = group.inverse(g);

        // Highlight element
        document.querySelectorAll('.group-node').forEach(node => {
            const circle = node.querySelector('.node-circle');
            if (node.dataset.element == g) {
                circle.setAttribute('r', 28);
                circle.classList.add('pulse');
            } else {
                circle.setAttribute('r', 22);
                circle.classList.remove('pulse');
            }
        });

        const conjugatedSet = new Set();
        currentSubgroup.elements.forEach(h => {
            const gh = group.operation(g, h);
            const ghg_inv = group.operation(gh, gInv);
            conjugatedSet.add(ghg_inv.toString());
        });

        const originalSet = new Set(currentSubgroup.elements.map(e => e.toString()));
        const isInvariant = areSetsEqual(conjugatedSet, originalSet);

        if (!isInvariant) allPassed = false;

        testResult.innerHTML = `
            <p style="font-size: 0.95rem; color: var(--accent-red); margin-bottom: 8px;">
                <strong>🎯 正规性验证演示</strong>
            </p>
            <p style="font-size: 0.9rem; margin: 8px 0;">
                步骤 ${i + 1}: 检验 g = <strong style="color: var(--accent-gold);">${g}</strong>
            </p>
            <p style="font-size: 0.85rem;">
                g${currentSubgroup.name}g⁻¹ = {${Array.from(conjugatedSet).join(', ')}}
            </p>
            <p style="font-size: 0.85rem; color: ${isInvariant ? 'var(--color-normal)' : 'var(--color-non-normal)'};">
                ${isInvariant ? '✓ 满足条件' : '✗ 不满足条件'}
            </p>
        `;

        conjugacyResult.textContent = isInvariant ? 'H ✓' : '≠ H ✗';
        conjugacyResult.style.color = isInvariant ? 'var(--color-normal)' : 'var(--color-non-normal)';

        await sleep(1500);
    }

    // Reset highlighting
    document.querySelectorAll('.group-node').forEach(node => {
        const circle = node.querySelector('.node-circle');
        circle.setAttribute('r', 22);
        circle.classList.remove('pulse');
    });

    testResult.innerHTML = `
        <p style="color: ${allPassed ? 'var(--color-normal)' : 'var(--color-non-normal)'};">
            ${allPassed ? '✓ 验证完成！该子群是正规子群' : '✗ 该子群不是正规子群'}
        </p>
        <p style="font-size: 0.85rem; margin-top: 6px;">
            ${allPassed ?
            '所有群元素的共轭作用都保持子群不变，满足正规性条件。' :
            '存在群元素的共轭作用改变了子群，不满足正规性条件。'}
        </p>
    `;

    demonstrateBtn.disabled = false;
    demonstrateBtn.textContent = '▶ 演示正规性';
}

// Construct Quotient Group
function constructQuotientGroup() {
    if (!currentSubgroup) {
        testResult.innerHTML = '<p style="color: var(--danger-red);">请先选择一个子群</p>';
        return;
    }

    if (!currentSubgroup.isNormal) {
        testResult.innerHTML = '<p style="color: var(--danger-red);">该子群不是正规子群，无法构造商群</p>';
        return;
    }

    updateType('quotient');
    renderQuotientGroup(currentSubgroup);

    testResult.innerHTML = `
        <p style="color: var(--color-normal);">
            ✓ 商群构造成功！
        </p>
        <p style="font-size: 0.85rem; margin-top: 6px;">
            商群 G/${currentSubgroup.name} 的运算表已显示在右侧。
        </p>
    `;
}

// Helper Functions
function areSetsEqual(set1, set2) {
    if (set1.size !== set2.size) return false;
    for (let item of set1) {
        if (!set2.has(item)) return false;
    }
    return true;
}

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

    demonstrateBtn.addEventListener('click', demonstrateNormality);

    constructBtn.addEventListener('click', constructQuotientGroup);

    resetBtn.addEventListener('click', () => {
        location.reload();
    });
}
