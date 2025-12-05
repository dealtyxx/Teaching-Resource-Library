/**
 * Red Mathematics - Special Binary Relations Visualizer
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

// Initialization
function init() {
    // Initial Layout (Circular)
    calculateLayout('circular');
    renderNodes();

    // Default to Empty
    selectRelation('empty');
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
                y: centerY
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
            // Self Loop
            // Draw a loop above the node
            const r = NODE_RADIUS;
            const d = `M ${posU.x} ${posU.y - r} 
                       C ${posU.x - 30} ${posU.y - r - 50}, 
                         ${posU.x + 30} ${posU.y - r - 50}, 
                         ${posU.x + 5} ${posU.y - r - 2}`;
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
            const perpX = -dy * 0.1;
            const perpY = dx * 0.1;

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

function updateInsight(type) {
    const insights = {
        'empty': {
            title: "一张白纸 (Empty Relation)",
            text: "空关系 R = ∅。没有任何元素发生联系。这象征着发展的起点，虽然当前是一张白纸，但蕴含着无限的建设潜力和可能性。",
            def: "R = {}"
        },
        'universal': {
            title: "天下大同 (Universal Relation)",
            text: "全域关系 R = A × A。所有元素之间都建立了联系。象征着高度融合、全面互通的理想社会状态，万物互联。",
            def: "R = {(x,y) | x,y ∈ A}"
        },
        'identity': {
            title: "不忘初心 (Identity Relation)",
            text: "恒等关系 I_A。每个元素只与自己发生联系。象征着个体的自省与坚守，'反求诸己'，是构建复杂关系的基石。",
            def: "R = {(x,x) | x ∈ A}"
        },
        'leq': {
            title: "循序渐进 (Less Than or Equal)",
            text: "小于等于关系 (≤)。体现了线性增长和积累的过程。事物的发展往往是由小到大、由弱到强，每一步都是前一步的积累。",
            def: "R = {(1,1), (1,2)... (1,6), (2,2)...}"
        },
        'divides': {
            title: "薪火相传 (Divisibility)",
            text: "整除关系 (|)。体现了结构化的传承与支撑。1是所有数的根基，大数包含小数的因子。象征着文化与精神的代代相传、根深叶茂。",
            def: "R = {(1,1), (1,2), (1,3), (1,4), (1,6), (2,2), (2,4), (2,6), (3,3), (3,6)...}"
        }
    };

    const info = insights[type];
    insightTitle.textContent = info.title;
    insightText.textContent = info.text;
    mathDef.textContent = info.def;
}

// Event Listeners
relationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        selectRelation(btn.dataset.type);
    });
});

// Handle resize
window.addEventListener('resize', () => {
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
