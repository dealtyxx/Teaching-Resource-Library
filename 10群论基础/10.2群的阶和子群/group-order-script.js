/**
 * 群的阶与子群可视化系统
 * Group Order and Subgroups Visualization System
 */

// DOM Elements
const conceptButtons = document.querySelectorAll('.concept-btn');
const groupSelect = document.getElementById('groupSelect');
const groupOrderValue = document.getElementById('groupOrderValue');
const groupType = document.getElementById('groupType');
const elementButtons = document.querySelectorAll('.element-btn');
const calcResult = document.getElementById('calcResult');
const conceptTitle = document.getElementById('conceptTitle');
const conceptContent = document.getElementById('conceptContent');
const mainTitle = document.getElementById('mainTitle');
const mainSubtitle = document.getElementById('mainSubtitle');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const ideologyTitle = document.getElementById('ideologyTitle');
const ideologyText = document.getElementById('ideologyText');
const analogyText = document.getElementById('analogyText');
const svg = document.getElementById('treeSvg');
const nodesGroup = document.getElementById('nodesGroup');
const linesGroup = document.getElementById('linesGroup');
const resetBtn = document.getElementById('resetBtn');
const demoInfo = document.getElementById('demoInfo');
const elementButtonsContainer = document.getElementById('elementButtons');
const calcHint = document.querySelector('.calc-hint');

// State
let currentConcept = null;
let currentGroup = 'z5';

// Concept Data
const CONCEPTS = {
    order: {
        name: '群的阶',
        nameEn: 'Group Order',
        icon: '📏',
        color: '#ff6b6b',
        title: '组织规模',
        quote: '"众人拾柴火焰高，团结就是力量。"',
        author: '— 民谚',
        ideology: '群的阶代表组织的规模大小。规模适当的组织既能保持灵活性，又具备足够的实力完成目标。',
        analogy: '如同一个团队的人数，既不能过少导致力量不足，也不能过多造成协调困难。合理的规模是成功的基础。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 群G的阶记为|G|，表示群中元素的个数。</p>
            <p><strong>社会意义:</strong> 组织规模决定整体实力。</p>
            <p><strong>核心价值:</strong> 众人拾柴火焰高。</p>
        `
    },
    'element-order': {
        name: '元素的阶',
        nameEn: 'Element Order',
        icon: '🔢',
        color: '#ffb400',
        title: '个体贡献周期',
        quote: '"术业有专攻，各尽所能。"',
        author: '— 韩愈',
        ideology: '元素的阶反映了个体完成一个工作循环的能力。每个成员都有自己的专长和节奏，合理安排才能发挥最大效能。',
        analogy: '就像每个员工都有自己的工作周期和专业特长，了解每个人的"阶"有助于合理分工和任务安排。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 元素g的阶是使g^n=e的最小正整数n。</p>
            <p><strong>社会意义:</strong> 每个人完成工作循环的时间。</p>
            <p><strong>核心价值:</strong> 术业有专攻，各尽所能。</p>
        `
    },
    finite: {
        name: '有限群',
        nameEn: 'Finite Group',
        icon: '🎯',
        color: '#10b981',
        title: '精干团队',
        quote: '"麻雀虽小，五脏俱全。"',
        author: '— 俗语',
        ideology: '有限群象征着精干高效的团队。虽然规模有限，但结构完整、功能齐全，能够高效完成特定任务。',
        analogy: '如同特种作战小队或项目攻坚组，人数虽少但专业性强，灵活机动，能够快速应对挑战。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 元素个数有限的群。</p>
            <p><strong>社会意义:</strong> 小而精的专业团队。</p>
            <p><strong>核心价值:</strong> 麻雀虽小，五脏俱全。</p>
        `
    },
    infinite: {
        name: '无限群',
        nameEn: 'Infinite Group',
        icon: '♾️',
        color: '#4ecdc4',
        title: '持续发展',
        quote: '"长江后浪推前浪，世上新人换旧人。"',
        author: '— 刘斧',
        ideology: '无限群代表着持续发展、生生不息的组织力量。新成员不断加入，组织永葆活力和创新能力。',
        analogy: '如同一个不断成长的组织，新人辈出，薪火相传，保持着旺盛的生命力和持续的发展动力。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 元素个数无限的群。</p>
            <p><strong>社会意义:</strong> 持续发展的组织力量。</p>
            <p><strong>核心价值:</strong> 长江后浪推前浪。</p>
        `
    },
    trivial: {
        name: '平凡子群',
        nameEn: 'Trivial Subgroup',
        icon: '⭐',
        color: '#8b5cf6',
        title: '初心起点',
        quote: '"不忘初心，方得始终。"',
        author: '— 《华严经》',
        ideology: '平凡子群只包含单位元，象征着组织的初心和根本价值观。无论如何发展，都不能忘记最初的使命。',
        analogy: '如同组织的核心理念和创始初衷，是一切发展的起点和归宿，必须始终坚守。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 只包含单位元e的子群{e}。</p>
            <p><strong>社会意义:</strong> 组织的核心价值观和初心。</p>
            <p><strong>核心价值:</strong> 不忘初心，方得始终。</p>
        `
    },
    proper: {
        name: '真子群',
        nameEn: 'Proper Subgroup',
        icon: '🔧',
        color: '#ff69b4',
        title: '专业分工',
        quote: '"各司其职，协同共进。"',
        author: '— 现代管理理念',
        ideology: '真子群代表组织内的专业部门和职能团队。它们既保持独立性，又服务于整体目标，体现了专业分工的智慧。',
        analogy: '如同企业中的各个部门，既有各自的专业特色和运作方式，又共同为组织的总体目标而努力。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 满足H⊂G且H≠G的子群H。</p>
            <p><strong>社会意义:</strong> 组织内的专业部门。</p>
            <p><strong>核心价值:</strong> 各司其职，协同共进。</p>
        `
    }
};

// Group Examples
const GROUPS = {
    z5: {
        name: 'ℤ₅',
        fullName: '整数模5加法群 (ℤ₅, +)',
        order: 5,
        type: '有限交换群',
        elements: [0, 1, 2, 3, 4],
        elementOrders: { 0: 1, 1: 5, 2: 5, 3: 5, 4: 5 },
        operation: (a, b) => (a + b) % 5
    },
    z6: {
        name: 'ℤ₆',
        fullName: '整数模6加法群 (ℤ₆, +)',
        order: 6,
        type: '有限交换群',
        elements: [0, 1, 2, 3, 4, 5],
        elementOrders: { 0: 1, 1: 6, 2: 3, 3: 2, 4: 3, 5: 6 },
        operation: (a, b) => (a + b) % 6
    },
    s3: {
        name: 'S₃',
        fullName: '对称群 S₃',
        order: 6,
        type: '有限非交换群',
        elements: ['e', 'r', 'r²', 's', 'sr', 'sr²'],
        elementOrders: { 'e': 1, 'r': 3, 'r²': 3, 's': 2, 'sr': 2, 'sr²': 2 },
        operation: null // 复杂操作，不在此实现
    },
    z: {
        name: 'ℤ',
        fullName: '无限整数群 (ℤ, +)',
        order: Infinity,
        type: '无限交换群',
        elements: '所有整数',
        elementOrders: '除0外均为无限',
        operation: (a, b) => a + b
    }
};

// Tree Structure
const TREE_DATA = {
    id: 'root',
    label: '群的阶和子群',
    labelEn: 'Group Order & Subgroups',
    color: '#d63b1d',
    children: [
        { id: 'order', label: '群的阶', labelEn: 'Group Order', color: '#ff6b6b' },
        { id: 'element-order', label: '元素的阶', labelEn: 'Element Order', color: '#ffb400' },
        { id: 'finite', label: '有限群', labelEn: 'Finite Group', color: '#10b981' },
        { id: 'infinite', label: '无限群', labelEn: 'Infinite Group', color: '#4ecdc4' },
        { id: 'trivial', label: '平凡子群', labelEn: 'Trivial Subgroup', color: '#8b5cf6' },
        { id: 'proper', label: '真子群', labelEn: 'Proper Subgroup', color: '#ff69b4' }
    ]
};

// Initialization
window.addEventListener('load', () => {
    renderTree();
    updateGroupInfo('z5');
    attachEventListeners();
});

// Render Tree
function renderTree() {
    const WIDTH = svg.clientWidth || 800;
    const HEIGHT = svg.clientHeight || 500;

    const rootX = WIDTH / 2;
    const rootY = 80;
    const childrenY = 250;
    const childSpacing = WIDTH / 7;

    // Draw lines
    TREE_DATA.children.forEach((child, i) => {
        const childX = (i + 1) * childSpacing;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', rootX);
        line.setAttribute('y1', rootY + 40);
        line.setAttribute('x2', childX);
        line.setAttribute('y2', childrenY - 40);
        line.setAttribute('class', 'tree-line');
        line.setAttribute('data-concept', child.id);
        linesGroup.appendChild(line);
    });

    // Draw root node
    drawNode(rootX, rootY, TREE_DATA, true);

    // Draw children
    TREE_DATA.children.forEach((child, i) => {
        const childX = (i + 1) * childSpacing;
        drawNode(childX, childrenY, child, false);
    });
}

function drawNode(x, y, data, isRoot) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'tree-node');
    g.setAttribute('transform', `translate(${x}, ${y})`);
    g.setAttribute('data-concept', data.id);

    const radius = isRoot ? 60 : 50;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', radius);
    circle.setAttribute('class', 'node-bg');
    circle.setAttribute('fill', data.color);
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', 2);
    circle.setAttribute('filter', 'url(#glow)');

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('y', isRoot ? 5 : 3);
    label.setAttribute('class', 'node-label');
    label.setAttribute('font-size', isRoot ? '16' : '13');
    label.textContent = data.label;

    const sublabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    sublabel.setAttribute('y', isRoot ? 20 : 18);
    sublabel.setAttribute('class', 'node-sublabel');
    sublabel.textContent = data.labelEn;

    g.appendChild(circle);
    g.appendChild(label);
    g.appendChild(sublabel);
    nodesGroup.appendChild(g);

    if (!isRoot) {
        g.addEventListener('click', () => updateConcept(data.id));
    }
}

// Update Concept Display
function updateConcept(conceptId) {
    currentConcept = conceptId;
    const data = CONCEPTS[conceptId];

    // Update button states
    conceptButtons.forEach(btn => {
        if (btn.dataset.concept === conceptId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update tree highlights  
    document.querySelectorAll('.tree-line').forEach(line => {
        if (line.dataset.concept === conceptId) {
            line.classList.add('active');
        } else {
            line.classList.remove('active');
        }
    });

    // Update content
    conceptTitle.textContent = data.title;
    conceptContent.innerHTML = data.conceptInfo;
    quoteText.textContent = data.quote;
    quoteAuthor.textContent = data.author;
    ideologyTitle.textContent = data.name + ' - ' + data.title;
    ideologyText.innerHTML = `<p>${data.ideology}</p>`;
    analogyText.textContent = data.analogy;

    // Render concept-specific visualization
    renderConceptVisualization(conceptId);
}

// Render visualization based on concept
function renderConceptVisualization(conceptId) {
    nodesGroup.innerHTML = '';
    linesGroup.innerHTML = '';

    if (conceptId === 'order') {
        renderOrderVisualization();
    } else if (conceptId === 'element-order') {
        renderElementOrderVisualization();
    } else if (conceptId === 'finite') {
        renderFiniteGroupVisualization();
    } else if (conceptId === 'infinite') {
        renderInfiniteGroupVisualization();
    } else if (conceptId === 'trivial') {
        renderTrivialSubgroupVisualization();
    } else if (conceptId === 'proper') {
        renderProperSubgroupVisualization();
    } else {
        renderTree(); // Default tree
    }
}

// 群的阶：显示不同大小的群
function renderOrderVisualization() {
    const WIDTH = svg.clientWidth || 800;
    const HEIGHT = svg.clientHeight || 500;

    const groups = [
        { name: 'ℤ₂', order: 2, x: 150, y: 200, color: '#ff6b6b' },
        { name: 'ℤ₃', order: 3, x: 300, y: 200, color: '#ffb400' },
        { name: 'ℤ₅', order: 5, x: 450, y: 200, color: '#10b981' },
        { name: 'S₃', order: 6, x: 600, y: 200, color: '#4ecdc4' }
    ];

    groups.forEach(group => {
        const radius = 20 + group.order * 5;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${group.x}, ${group.y})`);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', group.color);
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', 2);
        circle.setAttribute('filter', 'url(#glow)');

        const label1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label1.setAttribute('class', 'node-label');
        label1.setAttribute('y', -5);
        label1.textContent = group.name;

        const label2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label2.setAttribute('class', 'node-sublabel');
        label2.setAttribute('y', 10);
        label2.textContent = `|G|=${group.order}`;

        g.appendChild(circle);
        g.appendChild(label1);
        g.appendChild(label2);
        nodesGroup.appendChild(g);
    });
}

// 元素的阶：显示循环结构
function renderElementOrderVisualization() {
    const WIDTH = svg.clientWidth || 800;
    const HEIGHT = svg.clientHeight || 500;
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2 - 20;

    const group = GROUPS[currentGroup];
    if (!Array.isArray(group.elements)) return;

    const radius = 100;
    const n = group.elements.length;

    // Draw cycle
    group.elements.forEach((el, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const order = group.elementOrders[el];
        const isIdentity = order === 1;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${x}, ${y})`);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', isIdentity ? 25 : 20);
        circle.setAttribute('fill', isIdentity ? '#ffb400' : '#4ecdc4');
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', 2);
        circle.setAttribute('filter', 'url(#glow)');

        const label1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label1.setAttribute('class', 'node-label');
        label1.setAttribute('y', -3);
        label1.textContent = el;

        const label2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label2.setAttribute('class', 'node-sublabel');
        label2.setAttribute('y', 12);
        label2.setAttribute('font-size', '10');
        label2.textContent = `ord=${order}`;

        g.appendChild(circle);
        g.appendChild(label1);
        g.appendChild(label2);
        nodesGroup.appendChild(g);
    });

    // Draw circle outline
    const outline = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outline.setAttribute('cx', centerX);
    outline.setAttribute('cy', centerY);
    outline.setAttribute('r', radius);
    outline.setAttribute('fill', 'none');
    outline.setAttribute('stroke', '#ffb400');
    outline.setAttribute('stroke-width', 2);
    outline.setAttribute('stroke-dasharray', '8,4');
    outline.setAttribute('opacity', 0.4);
    linesGroup.appendChild(outline);
}

// 有限群：紧凑排列
function renderFiniteGroupVisualization() {
    const WIDTH = svg.clientWidth || 800;
    const HEIGHT = svg.clientHeight || 500;
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;

    const finiteGroups = [
        { name: 'ℤ₃', order: 3, x: centerX - 150, y: centerY - 80, color: '#10b981' },
        { name: 'ℤ₄', order: 4, x: centerX + 150, y: centerY - 80, color: '#10b981' },
        { name: 'ℤ₅', order: 5, x: centerX - 150, y: centerY + 80, color: '#10b981' },
        { name: 'S₃', order: 6, x: centerX + 150, y: centerY + 80, color: '#10b981' }
    ];

    // Title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', centerX);
    title.setAttribute('y', 60);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', '24');
    title.setAttribute('font-weight', '700');
    title.setAttribute('fill', '#10b981');
    title.textContent = '有限群集合';
    nodesGroup.appendChild(title);

    finiteGroups.forEach(group => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${group.x}, ${group.y})`);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', -50);
        rect.setAttribute('y', -30);
        rect.setAttribute('width', 100);
        rect.setAttribute('height', 60);
        rect.setAttribute('rx', 10);
        rect.setAttribute('fill', 'rgba(16, 185, 129, 0.2)');
        rect.setAttribute('stroke', group.color);
        rect.setAttribute('stroke-width', 3);

        const label1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label1.setAttribute('class', 'node-label');
        label1.setAttribute('y', -5);
        label1.textContent = group.name;

        const label2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label2.setAttribute('class', 'node-sublabel');
        label2.setAttribute('y', 12);
        label2.textContent = `有限, |G|=${group.order}`;

        g.appendChild(rect);
        g.appendChild(label1);
        g.appendChild(label2);
        nodesGroup.appendChild(g);
    });
}

// 无限群：可扩展模式
function renderInfiniteGroupVisualization() {
    const WIDTH = svg.clientWidth || 800;
    const HEIGHT = svg.clientHeight || 500;
    const centerY = HEIGHT / 2;

    // Draw infinite sequence pattern
    const spacing = 80;
    const startX = 80;

    for (let i = -3; i <= 3; i++) {
        const x = startX + (i + 3) * spacing + WIDTH * 0.1;
        const y = centerY;

        if (i === -3 || i === 3) {
            // Ellipsis
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('font-size', '36');
            text.setAttribute('fill', '#4ecdc4');
            text.textContent = '...';
            nodesGroup.appendChild(text);
        } else {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${x}, ${y})`);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', i === 0 ? 28 : 22);
            circle.setAttribute('fill', i === 0 ? '#ffb400' : '#4ecdc4');
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', 2);
            circle.setAttribute('filter', 'url(#glow)');

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('class', 'node-label');
            label.textContent = i;

            g.appendChild(circle);
            g.appendChild(label);
            nodesGroup.appendChild(g);
        }
    }

    // Title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', WIDTH / 2);
    title.setAttribute('y', 80);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', '20');
    title.setAttribute('font-weight', '700');
    title.setAttribute('fill', '#4ecdc4');
    title.textContent = '无限群 (ℤ, +) - 持续扩展';
    nodesGroup.appendChild(title);
}

// 平凡子群：最小集合
function renderTrivialSubgroupVisualization() {
    const WIDTH = svg.clientWidth || 800;
    const HEIGHT = svg.clientHeight || 500;
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;

    // Draw large group circle
    const largeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    largeCircle.setAttribute('cx', centerX);
    largeCircle.setAttribute('cy', centerY);
    largeCircle.setAttribute('r', 120);
    largeCircle.setAttribute('fill', 'rgba(214, 59, 29, 0.1)');
    largeCircle.setAttribute('stroke', '#d63b1d');
    largeCircle.setAttribute('stroke-width', 3);
    largeCircle.setAttribute('stroke-dasharray', '8,4');
    nodesGroup.appendChild(largeCircle);

    // Group label
    const groupLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    groupLabel.setAttribute('x', centerX);
    groupLabel.setAttribute('y', centerY - 140);
    groupLabel.setAttribute('text-anchor', 'middle');
    groupLabel.setAttribute('font-size', '18');
    groupLabel.setAttribute('fill', '#d63b1d');
    groupLabel.textContent = '群 G';
    nodesGroup.appendChild(groupLabel);

    // Trivial subgroup - identity element
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${centerX}, ${centerY})`);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', 35);
    circle.setAttribute('fill', '#8b5cf6');
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', 3);
    circle.setAttribute('filter', 'url(#glow)');

    const label1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label1.setAttribute('class', 'node-label');
    label1.setAttribute('y', -8);
    label1.setAttribute('font-size', '20');
    label1.textContent = '{e}';

    const label2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label2.setAttribute('class', 'node-sublabel');
    label2.setAttribute('y', 10);
    label2.textContent = '平凡子群';

    g.appendChild(circle);
    g.appendChild(label1);
    g.appendChild(label2);
    nodesGroup.appendChild(g);
}

// 真子群：层级结构
function renderProperSubgroupVisualization() {
    const WIDTH = svg.clientWidth || 800;
    const HEIGHT = svg.clientHeight || 500;
    const centerX = WIDTH / 2;
    const baseY = 120;

    // Hierarchy structure
    const levels = [
        { label: 'G (ℤ₆)', size: 100, y: baseY, color: '#d63b1d' },
        { label: 'H₂={0,2,4}', size: 70, y: baseY + 140, color: '#ff69b4', x: centerX - 120 },
        { label: 'H₃={0,3}', size: 70, y: baseY + 140, color: '#ff69b4', x: centerX + 120 },
        { label: '{e}={0}', size: 40, y: baseY + 260, color: '#8b5cf6' }
    ];

    // Draw containment lines
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', centerX);
    line1.setAttribute('y1', baseY + 50);
    line1.setAttribute('x2', centerX - 120);
    line1.setAttribute('y2', baseY + 140 - 35);
    line1.setAttribute('stroke', '#ff69b4');
    line1.setAttribute('stroke-width', 2);
    line1.setAttribute('opacity', 0.5);
    linesGroup.appendChild(line1);

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', centerX);
    line2.setAttribute('y1', baseY + 50);
    line2.setAttribute('x2', centerX + 120);
    line2.setAttribute('y2', baseY + 140 - 35);
    line2.setAttribute('stroke', '#ff69b4');
    line2.setAttribute('stroke-width', 2);
    line2.setAttribute('opacity', 0.5);
    linesGroup.appendChild(line2);

    const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line3.setAttribute('x1', centerX - 120);
    line3.setAttribute('y1', baseY + 140 + 35);
    line3.setAttribute('x2', centerX);
    line3.setAttribute('y2', baseY + 260 - 20);
    line3.setAttribute('stroke', '#8b5cf6');
    line3.setAttribute('stroke-width', 2);
    line3.setAttribute('opacity', 0.5);
    linesGroup.appendChild(line3);

    const line4 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line4.setAttribute('x1', centerX + 120);
    line4.setAttribute('y1', baseY + 140 + 35);
    line4.setAttribute('x2', centerX);
    line4.setAttribute('y2', baseY + 260 - 20);
    line4.setAttribute('stroke', '#8b5cf6');
    line4.setAttribute('stroke-width', 2);
    line4.setAttribute('opacity', 0.5);
    linesGroup.appendChild(line4);

    // Draw nodes
    levels.forEach((level, index) => {
        const x = level.x || centerX;
        const y = level.y;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${x}, ${y})`);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', level.size / 2);
        circle.setAttribute('fill', level.color);
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', 3);
        circle.setAttribute('filter', 'url(#glow)');

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('class', 'node-label');
        label.setAttribute('font-size', level.size > 60 ? '14' : '12');
        label.textContent = level.label;

        g.appendChild(circle);
        g.appendChild(label);
        nodesGroup.appendChild(g);
    });
}

// Update Group Info
function updateGroupInfo(groupId) {
    currentGroup = groupId;
    const group = GROUPS[groupId];

    groupOrderValue.textContent = group.order === Infinity ? '∞' : group.order;
    groupType.textContent = group.type;

    // Update element buttons
    elementButtonsContainer.innerHTML = '';
    calcHint.textContent = `在 ${group.name} 中计算元素的阶`;

    if (Array.isArray(group.elements)) {
        group.elements.forEach(el => {
            const btn = document.createElement('button');
            btn.className = 'element-btn';
            btn.dataset.element = el;
            btn.textContent = el;
            btn.addEventListener('click', () => calculateElementOrder(el));
            elementButtonsContainer.appendChild(btn);
        });
    } else {
        calcResult.innerHTML = '<p>无限群包含无穷多个元素</p>';
    }
}

// Calculate Element Order
function calculateElementOrder(element) {
    const group = GROUPS[currentGroup];

    // Clear active states
    document.querySelectorAll('.element-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Set active
    document.querySelector(`[data-element="${element}"]`).classList.add('active');

    const order = group.elementOrders[element];

    if (order === 1) {
        calcResult.innerHTML = `
            <p><strong>元素:</strong> ${element}</p>
            <p><strong>阶:</strong> ${order}</p>
            <p><strong>说明:</strong> 这是单位元，阶为1</p>
        `;
    } else {
        calcResult.innerHTML = `
            <p><strong>元素:</strong> ${element}</p>
            <p><strong>阶:</strong> ${order}</p>
            <p><strong>验证:</strong> ${element} 重复运算 ${order} 次后回到单位元</p>
        `;
    }
}

// Event Listeners
function attachEventListeners() {
    conceptButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const concept = btn.dataset.concept;
            updateConcept(concept);
        });
    });

    groupSelect.addEventListener('change', (e) => {
        updateGroupInfo(e.target.value);
    });

    resetBtn.addEventListener('click', () => {
        location.reload();
    });
}
