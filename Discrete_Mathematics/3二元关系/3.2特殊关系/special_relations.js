/**
 * 3.2 特殊关系 · 进阶层：空关系、全域关系、恒等关系、小于等于关系、整除关系
 */

// DOM Elements
const relationBtns = document.querySelectorAll('.relation-btn');
const insightTitle = document.getElementById('insightTitle');
const insightText = document.getElementById('insightText');
const mathDef = document.getElementById('mathDef');
const nodesLayer = document.getElementById('nodesLayer');
const graphSvg = document.getElementById('graphSvg');
const graphContainer = document.getElementById('graphContainer');

// Data
const SET_A = [1, 2, 3, 4, 6];

// Config
const NODE_RADIUS = 25;

// State
let currentType = null;
let nodePositions = {}; // { id: {x, y} }
let currentLayout = 'circular';

// Initialization
function init() {
    // Initial Layout (Circular)
    calculateLayout('circular');
    renderNodes();

    // 默认展示本层主角：恒等关系 I<sub>A</sub>
    selectRelation('identity');
}

// Layout Logic
function calculateLayout(type) {
    const width = graphContainer.clientWidth;
    const height = graphContainer.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    if (type === 'circular') {
        const radius = Math.min(width, height) * 0.35;
        const angleStep = (2 * Math.PI) / SET_A.length;

        SET_A.forEach((val, idx) => {
            // Start from top (-PI/2)
            const angle = -Math.PI / 2 + idx * angleStep;
            nodePositions[val] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
    } else if (type === 'linear') {
        // Linear horizontal layout
        const step = width * 0.8 / (SET_A.length - 1);
        const startX = width * 0.1;

        // Sort for linear (1, 2, 3, 4, 6)
        const sorted = [...SET_A].sort((a, b) => a - b);

        sorted.forEach((val, idx) => {
            nodePositions[val] = {
                x: startX + idx * step,
                y: height * 0.3   // 弧线向下展开，结点行放在上部
            };
        });
    } else if (type === 'hierarchical') {
        // Tree-like for Divisibility
        // Level 1: 1
        // Level 2: 2, 3
        // Level 3: 4, 6

        nodePositions[1] = { x: centerX, y: height * 0.2 };
        nodePositions[2] = { x: centerX - 100, y: height * 0.5 };
        nodePositions[3] = { x: centerX + 100, y: height * 0.5 };
        nodePositions[4] = { x: centerX - 120, y: height * 0.8 };
        nodePositions[6] = { x: centerX + 50, y: height * 0.8 };
    }
}

// Rendering
function renderNodes() {
    nodesLayer.innerHTML = '';

    SET_A.forEach(val => {
        const pos = nodePositions[val];
        const node = document.createElement('div');
        node.className = 'graph-node';
        node.textContent = val;
        node.style.left = `${pos.x - NODE_RADIUS}px`;
        node.style.top = `${pos.y - NODE_RADIUS}px`;
        node.id = `node-${val}`;
        nodesLayer.appendChild(node);
    });
}

function updateNodePositions() {
    SET_A.forEach(val => {
        const pos = nodePositions[val];
        const node = document.getElementById(`node-${val}`);
        if (node) {
            node.style.left = `${pos.x - NODE_RADIUS}px`;
            node.style.top = `${pos.y - NODE_RADIUS}px`;
        }
    });
}

function renderEdges(pairs) {
    // Clear existing edges
    // Keep defs
    const defs = graphSvg.querySelector('defs');
    graphSvg.innerHTML = '';
    graphSvg.appendChild(defs);

    pairs.forEach(pair => {
        const [u, v] = pair;
        const posU = nodePositions[u];
        const posV = nodePositions[v];

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        if (u === v) {
            // 自环：从结点左上方出发、绕到右上方回到结点
            const r = NODE_RADIUS;
            const sx = posU.x - r * 0.6, sy = posU.y - r * 0.8;
            const ex = posU.x + r * 0.6, ey = posU.y - r * 0.8;
            const d = `M ${sx} ${sy} C ${posU.x - r * 1.9} ${posU.y - r * 3}, ${posU.x + r * 1.9} ${posU.y - r * 3}, ${ex} ${ey}`;
            path.setAttribute('class', 'edge loop');
            path.setAttribute('d', d);
        } else {
            // Directed Edge
            // Calculate intersection with node boundary
            const dx = posV.x - posU.x;
            const dy = posV.y - posU.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Shorten line by radius + padding
            const padding = 5;
            const offset = NODE_RADIUS + padding;

            const startX = posU.x + (dx / dist) * offset;
            const startY = posU.y + (dy / dist) * offset;
            const endX = posV.x - (dx / dist) * offset;
            const endY = posV.y - (dy / dist) * offset;

            // Add slight curve
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            // Perpendicular offset for curve
            // 线性排列时所有边共线，改用按距离加大的弧线（嵌套弧，互不遮挡）
            const bend = currentLayout === 'linear' ? 0.28 : 0.1;
            const perpX = -dy * bend;
            const perpY = dx * bend;

            const d = `M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`;

            path.setAttribute('class', 'edge');
            path.setAttribute('d', d);
        }

        graphSvg.appendChild(path);
    });
}

// Relation Logic
function getRelationPairs(type) {
    const pairs = [];

    if (type === 'empty') {
        // None
    } else if (type === 'universal') {
        SET_A.forEach(u => {
            SET_A.forEach(v => pairs.push([u, v]));
        });
    } else if (type === 'identity') {
        SET_A.forEach(u => pairs.push([u, u]));
    } else if (type === 'leq') {
        SET_A.forEach(u => {
            SET_A.forEach(v => {
                if (u <= v) pairs.push([u, v]);
            });
        });
    } else if (type === 'divides') {
        SET_A.forEach(u => {
            SET_A.forEach(v => {
                if (v % u === 0) pairs.push([u, v]);
            });
        });
    }

    return pairs;
}

function selectRelation(type) {
    currentType = type;

    // Update UI Buttons
    relationBtns.forEach(btn => {
        if (btn.dataset.type === type) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Update Layout based on type
    let layoutType = 'circular';
    if (type === 'leq') layoutType = 'linear';
    if (type === 'divides') layoutType = 'hierarchical';

    currentLayout = layoutType;
    calculateLayout(layoutType);
    updateNodePositions();

    // Wait for transition (optional, or render immediately)
    // Rendering edges immediately might look weird during node transition
    // But SVG lines don't auto-update with CSS transition of divs.
    // For simplicity, we re-render edges immediately. 
    // Ideally, we would animate SVG points, but that's complex.
    // We'll use a small timeout to let nodes start moving, then draw edges at new final positions.
    // Actually, drawing edges at final positions while nodes move looks disconnected.
    // Let's just render edges at final positions.

    const pairs = getRelationPairs(type);
    renderEdges(pairs);

    // Update Insight
    updateInsight(type);
}

const INSIGHTS = {
    'empty': {
        title: "空关系 ∅（一张白纸）",
        text: "空关系不含任何有序对，是 A×A 的最小子集。它是关系世界的下边界：一张白纸，一切联系尚待建立。",
        def: "∅ = { }",
        stage: "空关系 ∅：没有任何边"
    },
    'universal': {
        title: "全域关系 E<sub>A</sub>（天下一家）",
        text: "全域关系 E<sub>A</sub> = A×A 包含全部有序对，是 A×A 的最大子集，也是关系世界的上边界：任意两个元素（包括自身）都有联系。",
        def: "E<sub>A</sub> = {(x,y) | x,y ∈ A} = A×A",
        stage: "全域关系 E<sub>A</sub>：每两点之间都有双向边，每点都有自环"
    },
    'identity': {
        title: "恒等关系 I<sub>A</sub>（不忘初心）",
        text: "恒等关系 I<sub>A</sub> 中每个元素只与自身相关，关系图只有自环、关系矩阵是单位矩阵。它在关系复合中充当单位元：R∘I<sub>A</sub> = I<sub>A</sub>∘R = R，就像坚守初心，是一切变化的基准。",
        def: "I<sub>A</sub> = {(x,x) | x ∈ A}",
        stage: "恒等关系 I<sub>A</sub>：只有自环（单位矩阵）"
    },
    'leq': {
        title: "小于等于关系 L<sub>A</sub>（循序渐进）",
        text: "L<sub>A</sub> = {(x,y) | x ≤ y}。按大小排成一行，所有边都从小指向大：发展由小到大、步步积累，既不能倒退，也不能跳过前面的每一级。",
        def: "L<sub>A</sub> = {(x,y) | x,y ∈ A, x ≤ y}",
        stage: "小于等于关系 L<sub>A</sub>：从小指向大"
    },
    'divides': {
        title: "整除关系 D<sub>A</sub>（薪火相传）",
        text: "D<sub>A</sub> = {(x,y) | x 整除 y}。1 整除一切元素，是整个结构的根基；1 | 2 | 4、1 | 3 | 6 层层相连，如同薪火一代代传递。注意 4 与 6 互不整除——整除关系不是每两个元素都可比较。",
        def: "D<sub>A</sub> = {(x,y) | x,y ∈ A, x | y}",
        stage: "整除关系 D<sub>A</sub>：按整除层次排列"
    }
};

// 关系的五种基本性质（3.5 节会系统学习，这里先观察特殊关系的「性质画像」）
function relationProps(pairs) {
    const has = (x, y) => pairs.some(([u, v]) => u === x && v === y);
    const reflexive = SET_A.every(x => has(x, x));
    const irreflexive = SET_A.every(x => !has(x, x));
    const symmetric = pairs.every(([x, y]) => has(y, x));
    const antisymmetric = pairs.every(([x, y]) => x === y || !has(y, x));
    const transitive = pairs.every(([x, y]) => pairs.every(([u, v]) => u !== y || has(x, v)));
    return [['自反', reflexive], ['反自反', irreflexive], ['对称', symmetric], ['反对称', antisymmetric], ['传递', transitive]];
}

function updateInsight(type) {
    const info = INSIGHTS[type];
    const pairs = getRelationPairs(type);
    insightTitle.innerHTML = info.title;
    insightText.innerHTML = info.text;
    const list = pairs.length ? '{' + pairs.map(([x, y]) => `(${x},${y})`).join(', ') + '}' : '∅';
    mathDef.innerHTML = `<div>${info.def}</div><div class="def-list">R = ${list}</div><div class="def-count">|R| = ${pairs.length}（A×A 共 ${SET_A.length * SET_A.length} 个有序对）</div>`;
    const badges = document.getElementById('propBadges');
    if (badges) {
        badges.innerHTML = relationProps(pairs).map(([name, ok]) =>
            `<span class="prop-badge ${ok ? 'yes' : 'no'}">${ok ? '✓' : '✗'} ${name}</span>`).join('');
    }
    const sub = document.getElementById('stageSubtitle');
    if (sub) sub.innerHTML = `${info.stage} · |R| = ${pairs.length}`;
}

// Event Listeners
relationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        selectRelation(btn.dataset.type);
    });
});

// 窗口尺寸变化时重新布局（尺寸未变则跳过，避免共享框架派发的 resize 反复重绘）
let lastSize = '';
window.addEventListener('resize', () => {
    const size = graphContainer.clientWidth + 'x' + graphContainer.clientHeight;
    if (size === lastSize) return;
    lastSize = size;
    // Re-calculate current layout
    let layoutType = 'circular';
    if (currentType === 'leq') layoutType = 'linear';
    if (currentType === 'divides') layoutType = 'hierarchical';

    calculateLayout(layoutType);
    updateNodePositions();
    renderEdges(getRelationPairs(currentType));
});

// Init
init();
