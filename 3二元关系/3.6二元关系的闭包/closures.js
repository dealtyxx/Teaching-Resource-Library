/**
 * Red Mathematics - Relation Closures Visualizer
 */

// DOM Elements
const closureBtns = document.querySelectorAll('.closure-btn');
const resetBtn = document.getElementById('resetBtn');
const svgOriginal = document.getElementById('svgOriginal');
const svgClosure = document.getElementById('svgClosure');
const nodesOriginal = document.getElementById('nodesOriginal');
const nodesClosure = document.getElementById('nodesClosure');
const closureTitle = document.getElementById('closureTitle');
const closureSub = document.getElementById('closureSub');
const originalCount = document.getElementById('originalCount');
const addedCount = document.getElementById('addedCount');
const totalCount = document.getElementById('totalCount');
const insightTitle = document.getElementById('insightTitle');
const insightText = document.getElementById('insightText');

// Data
const NODES = [1, 2, 3, 4];
const ORIGINAL_EDGES = [
    [1, 2],
    [2, 3],
    [3, 4]
];

// State
let currentClosure = null;
let nodePositions = {};

// Config
const NODE_RADIUS = 25;

// Initialization
function init() {
    calculateLayout();
    renderOriginalGraph();
    renderClosureGraph([]);
}

// Layout (Circular)
function calculateLayout() {
    const width = 400; // Approximate panel width
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 120;

    NODES.forEach((val, idx) => {
        const angle = (idx / NODES.length) * 2 * Math.PI - Math.PI / 2;
        nodePositions[val] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });
}

// Rendering
function renderOriginalGraph() {
    // Nodes
    nodesOriginal.innerHTML = '';
    NODES.forEach(val => {
        const pos = nodePositions[val];
        const node = createNode(val, pos, 'original');
        nodesOriginal.appendChild(node);
    });

    // Edges
    const defs = svgOriginal.querySelector('defs');
    svgOriginal.innerHTML = '';
    svgOriginal.appendChild(defs);

    ORIGINAL_EDGES.forEach(([u, v]) => {
        const edge = createEdge(u, v, 'edge-original');
        svgOriginal.appendChild(edge);
    });
}

function renderClosureGraph(addedEdges) {
    // Nodes
    nodesClosure.innerHTML = '';
    NODES.forEach(val => {
        const pos = nodePositions[val];
        const node = createNode(val, pos, 'closure');
        nodesClosure.appendChild(node);
    });

    // Edges
    const defs = svgClosure.querySelector('defs');
    svgClosure.innerHTML = '';
    svgClosure.appendChild(defs);

    // Original edges (faint)
    ORIGINAL_EDGES.forEach(([u, v]) => {
        const edge = createEdge(u, v, 'edge-original-c');
        svgClosure.appendChild(edge);
    });

    // Added edges (animated with delay)
    addedEdges.forEach(([u, v], idx) => {
        const edge = createEdge(u, v, 'edge-added');
        edge.style.animationDelay = `${idx * 0.1}s`;
        svgClosure.appendChild(edge);
    });

    // Update stats
    originalCount.textContent = ORIGINAL_EDGES.length;
    addedCount.textContent = addedEdges.length;
    totalCount.textContent = ORIGINAL_EDGES.length + addedEdges.length;
}

function createNode(value, pos, type) {
    const node = document.createElement('div');
    node.className = 'graph-node';
    node.textContent = value;
    node.style.left = `${pos.x - NODE_RADIUS}px`;
    node.style.top = `${pos.y - NODE_RADIUS}px`;
    return node;
}

function createEdge(u, v, className) {
    const posU = nodePositions[u];
    const posV = nodePositions[v];

    let d;
    if (u === v) {
        // Self-loop
        const loopSize = 30;
        d = `M ${posU.x} ${posU.y - NODE_RADIUS} 
             Q ${posU.x + loopSize} ${posU.y - NODE_RADIUS - loopSize} 
               ${posU.x} ${posU.y - NODE_RADIUS}`;
    } else {
        // Regular edge
        const dx = posV.x - posU.x;
        const dy = posV.y - posU.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const startX = posU.x + (dx / dist) * NODE_RADIUS;
        const startY = posU.y + (dy / dist) * NODE_RADIUS;
        const endX = posV.x - (dx / dist) * NODE_RADIUS;
        const endY = posV.y - (dy / dist) * NODE_RADIUS;

        // Slight curve for visibility
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const perpX = -dy / dist * 15;
        const perpY = dx / dist * 15;

        d = `M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', `graph-edge ${className} ${u === v ? 'edge-self-loop' : ''}`);
    return path;
}

// Closure Algorithms
function reflexiveClosure() {
    const added = [];
    NODES.forEach(n => {
        // Check if self-loop exists in original
        const hasSelfLoop = ORIGINAL_EDGES.some(([u, v]) => u === n && v === n);
        if (!hasSelfLoop) {
            added.push([n, n]);
        }
    });
    return added;
}

function symmetricClosure() {
    const added = [];
    ORIGINAL_EDGES.forEach(([u, v]) => {
        // Check if reverse exists
        const hasReverse = ORIGINAL_EDGES.some(([a, b]) => a === v && b === u);
        if (!hasReverse && u !== v) {
            added.push([v, u]);
        }
    });
    return added;
}

function transitiveClosure() {
    // Warshall's Algorithm
    const n = NODES.length;
    const matrix = Array(n).fill(0).map(() => Array(n).fill(false));

    // Initialize with original edges
    ORIGINAL_EDGES.forEach(([u, v]) => {
        matrix[u - 1][v - 1] = true;
    });

    // Warshall
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                matrix[i][j] = matrix[i][j] || (matrix[i][k] && matrix[k][j]);
            }
        }
    }

    // Find added edges
    const added = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (matrix[i][j]) {
                const u = i + 1;
                const v = j + 1;
                const isOriginal = ORIGINAL_EDGES.some(([a, b]) => a === u && b === v);
                if (!isOriginal) {
                    added.push([u, v]);
                }
            }
        }
    }
    return added;
}

// UI Updates
function updateClosure(type) {
    currentClosure = type;

    // Update active button
    closureBtns.forEach(btn => {
        if (btn.dataset.closure === type) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    let addedEdges = [];
    let title = '';
    let sub = '';
    let insightT = '';
    let insightP = '';

    if (type === 'reflexive') {
        addedEdges = reflexiveClosure();
        title = '自反闭包 r(R)';
        sub = 'Reflexive Closure: Universal Self-Sufficiency';
        insightT = '全民自立 (Universal Self-Sufficiency)';
        insightP = '通过添加自环，每个元素都建立了与自己的关系。象征着每个人都拥有自我完善的能力和资源。';
    } else if (type === 'symmetric') {
        addedEdges = symmetricClosure();
        title = '对称闭包 s(R)';
        sub = 'Symmetric Closure: Reciprocal Rights';
        insightT = '权利对等 (Reciprocal Rights)';
        insightP = '通过添加反向边，关系变为双向。象征着互惠互利的平等关系，你敬我一尺，我敬你一丈。';
    } else if (type === 'transitive') {
        addedEdges = transitiveClosure();
        title = '传递闭包 t(R)';
        sub = 'Transitive Closure: Connected Communities';
        insightT = '互联互通 (Connected Communities)';
        insightP = '通过添加传递边，间接联系被直接贯通。象征着高铁网络将各城市紧密连接，形成命运共同体。';
    }

    closureTitle.textContent = title;
    closureSub.textContent = sub;
    insightTitle.textContent = insightT;
    insightText.textContent = insightP;

    renderClosureGraph(addedEdges);
}

// Event Listeners
closureBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        updateClosure(btn.dataset.closure);
    });
});

resetBtn.addEventListener('click', () => {
    currentClosure = null;
    closureBtns.forEach(btn => btn.classList.remove('active'));

    closureTitle.textContent = '闭包结果 (Closure Result)';
    closureSub.textContent = '选择一个闭包操作';
    insightTitle.textContent = '准备就绪';
    insightText.textContent = '点击上方按钮，探索三种闭包如何完善社会网络，构建更加紧密的联系。';

    renderClosureGraph([]);
});

window.addEventListener('resize', () => {
    calculateLayout();
    renderOriginalGraph();
    if (currentClosure) {
        updateClosure(currentClosure);
    } else {
        renderClosureGraph([]);
    }
});

// Init
init();
