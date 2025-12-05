/**
 * 航天通信 - 网络优化系统
 * Aerospace Communication Network Optimization (Kruskal's Algorithm)
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const startBtn = document.getElementById('startBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const connectedCountEl = document.getElementById('connectedCount');
const totalCostEl = document.getElementById('totalCost');
const edgeListEl = document.getElementById('edgeList');
const nodeInfoPopup = document.getElementById('nodeInfoPopup');
const popupTitle = document.getElementById('popupTitle');
const popupDesc = document.getElementById('popupDesc');

// State
let nodes = [];
let edges = [];
let sortedEdges = [];
let mstEdges = [];
let parent = []; // Union-Find parent array
let isRunning = false;
let currentEdgeIndex = 0;
let nodeElements = new Map();
let edgeElements = new Map(); // id -> {line, labelBg, label}
let edgeListItems = [];

// Constants
const NODE_RADIUS = 24;

// Aerospace Nodes
const AEROSPACE_NODES = [
    { id: 0, name: "北京中心", desc: "航天飞行控制中心", x: 400, y: 500, icon: "🏢" },
    { id: 1, name: "西安中心", desc: "卫星测控中心", x: 200, y: 450, icon: "📡" },
    { id: 2, name: "天链一号", desc: "中继卫星系统", x: 150, y: 200, icon: "🛰️" },
    { id: 3, name: "天链二号", desc: "新一代中继卫星", x: 650, y: 200, icon: "🛰️" },
    { id: 4, name: "神舟飞船", desc: "载人飞船", x: 300, y: 100, icon: "🚀" },
    { id: 5, name: "天宫空间站", desc: "国家太空实验室", x: 500, y: 80, icon: "🌌" },
    { id: 6, name: "北斗卫星", desc: "全球导航系统", x: 700, y: 350, icon: "🧭" },
    { id: 7, name: "远望号", desc: "航天测量船", x: 600, y: 500, icon: "🚢" }
];

// Weighted Edges (Communication Link Cost)
const AEROSPACE_EDGES = [
    { u: 0, v: 1, weight: 10 }, // 北京-西安 (地面光纤，成本低)
    { u: 0, v: 7, weight: 25 }, // 北京-远望
    { u: 1, v: 7, weight: 30 }, // 西安-远望
    { u: 0, v: 2, weight: 45 }, // 北京-天链一
    { u: 0, v: 3, weight: 50 }, // 北京-天链二
    { u: 2, v: 4, weight: 15 }, // 天链一-神舟 (太空短距)
    { u: 3, v: 5, weight: 20 }, // 天链二-天宫
    { u: 4, v: 5, weight: 12 }, // 神舟-天宫 (交会对接)
    { u: 2, v: 5, weight: 35 }, // 天链一-天宫
    { u: 3, v: 6, weight: 40 }, // 天链二-北斗
    { u: 6, v: 7, weight: 55 }, // 北斗-远望
    { u: 1, v: 2, weight: 60 }, // 西安-天链一
    { u: 5, v: 6, weight: 70 }  // 天宫-北斗
];

// Helper Functions
function createSVGElement(type, attributes = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    return el;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDelay() {
    const val = parseInt(speedInput.value);
    return Math.max(200, 2000 - (val * 18));
}

// Union-Find Operations
function makeSet(n) {
    parent = new Array(n).fill(0).map((_, i) => i);
}

function find(i) {
    if (parent[i] === i) return i;
    return parent[i] = find(parent[i]); // Path compression
}

function union(i, j) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
        parent[rootI] = rootJ;
        return true;
    }
    return false;
}

// Initialize Graph
function initGraph() {
    nodes = [...AEROSPACE_NODES];
    edges = [...AEROSPACE_EDGES];

    // Sort edges for Kruskal's
    sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

    renderGraph();
    renderEdgeList();
    updateStats(0, 0);
}

// Render Graph
function renderGraph() {
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    nodeElements.clear();
    edgeElements.clear();

    // Render Edges
    edges.forEach(edge => {
        const uNode = nodes.find(n => n.id === edge.u);
        const vNode = nodes.find(n => n.id === edge.v);
        const edgeId = `${Math.min(edge.u, edge.v)}-${Math.max(edge.u, edge.v)}`;

        const g = createSVGElement('g');

        const line = createSVGElement('line', {
            x1: uNode.x, y1: uNode.y,
            x2: vNode.x, y2: vNode.y,
            class: 'edge-line'
        });

        // Edge Weight Label
        const midX = (uNode.x + vNode.x) / 2;
        const midY = (uNode.y + vNode.y) / 2;

        const labelBg = createSVGElement('rect', {
            x: midX - 10, y: midY - 7,
            width: 20, height: 14,
            rx: 2, ry: 2,
            class: 'edge-label-bg'
        });

        const label = createSVGElement('text', {
            x: midX, y: midY,
            dy: '.35em',
            class: 'edge-label'
        });
        label.textContent = edge.weight;

        g.appendChild(line);
        g.appendChild(labelBg);
        g.appendChild(label);
        edgesGroup.appendChild(g);

        edgeElements.set(edgeId, { line, labelBg, label });
    });

    // Render Nodes
    nodes.forEach(node => {
        const g = createSVGElement('g', {
            class: 'node-group',
            transform: `translate(${node.x}, ${node.y})`
        });

        const circle = createSVGElement('circle', {
            r: NODE_RADIUS,
            class: 'node-circle'
        });

        const icon = createSVGElement('text', {
            class: 'node-icon',
            'text-anchor': 'middle',
            'dy': '.35em'
        });
        icon.textContent = node.icon;

        const text = createSVGElement('text', {
            class: 'node-text',
            'text-anchor': 'middle',
            'dy': '2.5em'
        });
        text.textContent = node.name;

        g.appendChild(circle);
        g.appendChild(icon);
        g.appendChild(text);
        nodesGroup.appendChild(g);

        // Hover events
        g.addEventListener('mouseenter', (e) => showPopup(e, node));
        g.addEventListener('mouseleave', hidePopup);

        nodeElements.set(node.id, { g, circle });
    });
}

// Render Edge List in Sidebar
function renderEdgeList() {
    edgeListEl.innerHTML = '';
    edgeListItems = [];

    sortedEdges.forEach((edge, index) => {
        const div = document.createElement('div');
        div.className = 'edge-item';

        const uName = nodes.find(n => n.id === edge.u).name;
        const vName = nodes.find(n => n.id === edge.v).name;

        div.innerHTML = `
            <span>${uName} - ${vName}</span>
            <span class="cost">${edge.weight}</span>
        `;

        edgeListEl.appendChild(div);
        edgeListItems.push(div);
    });
}

function showPopup(e, node) {
    popupTitle.textContent = node.name;
    popupDesc.textContent = node.desc;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    nodeInfoPopup.style.left = `${x + 20}px`;
    nodeInfoPopup.style.top = `${y - 20}px`;
    nodeInfoPopup.style.opacity = '1';
}

function hidePopup() {
    nodeInfoPopup.style.opacity = '0';
}

function updateStats(cost, count) {
    totalCostEl.textContent = cost;
    connectedCountEl.textContent = `${count}/${nodes.length}`;
}

// Kruskal's Algorithm Step
async function kruskalStep() {
    if (currentEdgeIndex >= sortedEdges.length || mstEdges.length >= nodes.length - 1) {
        statusText.textContent = "优化完成! 最小生成树已构建。";
        isRunning = false;
        startBtn.disabled = false;
        stepBtn.disabled = true;
        return;
    }

    const edge = sortedEdges[currentEdgeIndex];
    const edgeId = `${Math.min(edge.u, edge.v)}-${Math.max(edge.u, edge.v)}`;
    const edgeEl = edgeElements.get(edgeId);
    const listItem = edgeListItems[currentEdgeIndex];

    // Highlight current edge being considered
    edgeEl.line.classList.add('scanning');
    listItem.classList.add('current');
    listItem.scrollIntoView({ behavior: 'smooth', block: 'center' });

    statusText.textContent = `检查链路: ${nodes[edge.u].name} - ${nodes[edge.v].name} (成本: ${edge.weight})`;
    await sleep(getDelay());

    // Check cycle using Union-Find
    if (find(edge.u) !== find(edge.v)) {
        // No cycle, add to MST
        union(edge.u, edge.v);
        mstEdges.push(edge);

        edgeEl.line.classList.remove('scanning');
        edgeEl.line.classList.add('mst');
        listItem.classList.remove('current');
        listItem.classList.add('accepted');

        // Update nodes visual state
        nodeElements.get(edge.u).circle.classList.add('connected');
        nodeElements.get(edge.v).circle.classList.add('connected');

        statusText.textContent = `链路已建立!`;

        // Calculate current cost
        const currentCost = mstEdges.reduce((sum, e) => sum + e.weight, 0);
        // Count connected nodes (approximate for visual feedback)
        const connectedNodes = new Set();
        mstEdges.forEach(e => { connectedNodes.add(e.u); connectedNodes.add(e.v); });

        updateStats(currentCost, connectedNodes.size);
    } else {
        // Cycle detected, reject
        edgeEl.line.classList.remove('scanning');
        edgeEl.line.classList.add('rejected');
        listItem.classList.remove('current');
        listItem.classList.add('rejected');

        statusText.textContent = `检测到环路! 链路冗余，已排除。`;
    }

    currentEdgeIndex++;

    if (mstEdges.length === nodes.length - 1) {
        statusText.textContent = "全网连通! 优化完成。";
        isRunning = false;
        startBtn.disabled = false;
        stepBtn.disabled = true;
    }
}

// Auto Run
async function runKruskal() {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;
    stepBtn.disabled = true;

    // If starting from scratch
    if (currentEdgeIndex === 0) {
        resetGraph();
    }

    while (isRunning && currentEdgeIndex < sortedEdges.length && mstEdges.length < nodes.length - 1) {
        await kruskalStep();
        await sleep(getDelay() / 2);
    }
}

function resetGraph() {
    isRunning = false;
    currentEdgeIndex = 0;
    mstEdges = [];
    makeSet(nodes.length);

    // Reset visuals
    edgeElements.forEach(el => {
        el.line.classList.remove('mst', 'scanning', 'rejected');
    });
    nodeElements.forEach(el => {
        el.circle.classList.remove('connected');
    });
    edgeListItems.forEach(item => {
        item.className = 'edge-item';
    });

    updateStats(0, 0);
    statusText.textContent = "系统就绪，等待指令...";
    startBtn.disabled = false;
    stepBtn.disabled = false;
}

// Event Listeners
startBtn.addEventListener('click', runKruskal);
stepBtn.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        startBtn.disabled = true;
    }
    kruskalStep().then(() => {
        if (mstEdges.length < nodes.length - 1) {
            // Allow next step if not finished
            // Note: isRunning logic is a bit simple here, but sufficient for single thread JS
        }
    });
});

resetBtn.addEventListener('click', resetGraph);

// Init
window.addEventListener('load', () => {
    initGraph();
    makeSet(nodes.length);
});
