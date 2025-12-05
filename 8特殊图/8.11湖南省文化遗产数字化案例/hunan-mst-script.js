/**
 * 湖湘文化 - 数字化连接项目
 * Hunan Cultural Heritage - Digital Connection (Prim's Algorithm)
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const startNodeSelect = document.getElementById('startNodeSelect');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const connectedCountEl = document.getElementById('connectedCount');
const totalCostEl = document.getElementById('totalCost');
const currentStepEl = document.getElementById('currentStep');
const nodeInfoPopup = document.getElementById('nodeInfoPopup');
const popupTitle = document.getElementById('popupTitle');
const popupDesc = document.getElementById('popupDesc');

// State
let nodes = [];
let edges = [];
let adjacencyList = new Map();
let mstEdges = [];
let visited = new Set();
let isRunning = false;
let nodeElements = new Map();
let edgeElements = new Map(); // id -> {line, labelBg, label}

// Constants
const NODE_RADIUS = 20;

// Hunan Cultural Heritage Nodes
const HERITAGE_NODES = [
    { id: 0, name: "长沙", desc: "岳麓书院 · 千年学府", x: 600, y: 200, icon: "🏫" },
    { id: 1, name: "韶山", desc: "毛泽东故居 · 红色圣地", x: 500, y: 250, icon: "🚩" },
    { id: 2, name: "张家界", desc: "武陵源 · 奇峰三千", x: 250, y: 150, icon: "⛰️" },
    { id: 3, name: "湘西", desc: "凤凰古城 · 边城风情", x: 150, y: 250, icon: "🏰" },
    { id: 4, name: "岳阳", desc: "岳阳楼 · 洞庭天下水", x: 650, y: 100, icon: "🏯" },
    { id: 5, name: "衡阳", desc: "南岳衡山 · 五岳独秀", x: 550, y: 400, icon: "🏔️" },
    { id: 6, name: "常德", desc: "桃花源 · 世外桃源", x: 400, y: 150, icon: "🌸" },
    { id: 7, name: "株洲", desc: "炎帝陵 · 华夏始祖", x: 650, y: 300, icon: "🔥" }
];

// Weighted Edges (Cost in 10k RMB)
// Designed to form a connected graph
const HERITAGE_EDGES = [
    { u: 0, v: 1, weight: 80 },  // 长沙-韶山
    { u: 0, v: 4, weight: 150 }, // 长沙-岳阳
    { u: 0, v: 6, weight: 180 }, // 长沙-常德
    { u: 0, v: 7, weight: 60 },  // 长沙-株洲
    { u: 1, v: 5, weight: 120 }, // 韶山-衡阳
    { u: 1, v: 6, weight: 140 }, // 韶山-常德
    { u: 1, v: 7, weight: 90 },  // 韶山-株洲
    { u: 2, v: 3, weight: 100 }, // 张家界-湘西
    { u: 2, v: 6, weight: 130 }, // 张家界-常德
    { u: 3, v: 6, weight: 200 }, // 湘西-常德
    { u: 4, v: 6, weight: 160 }, // 岳阳-常德
    { u: 5, v: 7, weight: 110 }, // 衡阳-株洲
    { u: 0, v: 5, weight: 170 }  // 长沙-衡阳
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

// Initialize Graph
function initGraph() {
    nodes = [...HERITAGE_NODES];
    edges = [...HERITAGE_EDGES];
    adjacencyList.clear();

    // Build Adjacency List
    nodes.forEach(n => adjacencyList.set(n.id, []));
    edges.forEach(e => {
        adjacencyList.get(e.u).push({ to: e.v, weight: e.weight, id: `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}` });
        adjacencyList.get(e.v).push({ to: e.u, weight: e.weight, id: `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}` });
    });

    renderGraph();
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
            x: midX - 12, y: midY - 8,
            width: 24, height: 16,
            rx: 4, ry: 4,
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

        edgeElements.set(edgeId, { line, labelBg, label, weight: edge.weight });
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

        nodeElements.set(node.id, { g, circle, icon });
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

// Prim's Algorithm
async function runPrimAlgorithm() {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;
    startNodeSelect.disabled = true;
    resetGraph();

    let startNodeId;
    if (startNodeSelect.value === 'random') {
        startNodeId = Math.floor(Math.random() * nodes.length);
    } else {
        startNodeId = parseInt(startNodeSelect.value);
    }

    statusText.textContent = `从 ${nodes[startNodeId].name} 开始构建网络...`;

    visited.add(startNodeId);
    markNodeConnected(startNodeId);
    updateStats(0, 1);

    let totalCost = 0;

    // Priority Queue simulation (list of candidate edges)
    let candidateEdges = [];

    // Add initial candidates
    addCandidates(startNodeId, candidateEdges);

    while (visited.size < nodes.length) {
        if (candidateEdges.length === 0) {
            statusText.textContent = "图不连通，无法连接所有节点!";
            break;
        }

        currentStepEl.textContent = "寻找权重最小的候选连接...";
        await sleep(getDelay());

        // Find min weight edge
        candidateEdges.sort((a, b) => a.weight - b.weight);
        const bestEdge = candidateEdges.shift();

        // If destination already visited, skip (cycle prevention)
        if (visited.has(bestEdge.to)) {
            // Remove visual highlight if it was a candidate
            const edgeEl = edgeElements.get(bestEdge.id);
            if (edgeEl.line.classList.contains('candidate')) {
                edgeEl.line.classList.remove('candidate');
            }
            continue;
        }

        // Connect
        const uName = nodes.find(n => n.id === bestEdge.from).name;
        const vName = nodes.find(n => n.id === bestEdge.to).name;

        statusText.textContent = `连接 ${uName} - ${vName} (成本: ${bestEdge.weight})`;
        currentStepEl.textContent = `选择最小边: ${bestEdge.weight}万`;

        const edgeEl = edgeElements.get(bestEdge.id);
        edgeEl.line.classList.remove('candidate');
        edgeEl.line.classList.add('mst');

        visited.add(bestEdge.to);
        markNodeConnected(bestEdge.to);
        totalCost += bestEdge.weight;
        updateStats(totalCost, visited.size);

        await sleep(getDelay());

        // Add new candidates
        addCandidates(bestEdge.to, candidateEdges);
    }

    statusText.textContent = "数字化网络构建完成!";
    currentStepEl.textContent = "最小生成树已生成";
    isRunning = false;
    startBtn.disabled = false;
    startNodeSelect.disabled = false;
}

function addCandidates(nodeId, list) {
    const neighbors = adjacencyList.get(nodeId);
    neighbors.forEach(neighbor => {
        if (!visited.has(neighbor.to)) {
            list.push({
                from: nodeId,
                to: neighbor.to,
                weight: neighbor.weight,
                id: neighbor.id
            });

            // Visual highlight
            const edgeEl = edgeElements.get(neighbor.id);
            if (!edgeEl.line.classList.contains('mst')) {
                edgeEl.line.classList.add('candidate');
            }
        }
    });
}

function markNodeConnected(id) {
    const el = nodeElements.get(id);
    el.circle.classList.add('connected');
}

function resetGraph() {
    visited.clear();
    mstEdges = [];
    edgeElements.forEach(el => {
        el.line.classList.remove('mst', 'candidate');
    });
    nodeElements.forEach(el => {
        el.circle.classList.remove('connected');
    });
    updateStats(0, 0);
}

// Event Listeners
startBtn.addEventListener('click', runPrimAlgorithm);
resetBtn.addEventListener('click', () => {
    resetGraph();
    statusText.textContent = "已重置";
    currentStepEl.textContent = "-";
});

// Init
window.addEventListener('load', () => {
    initGraph();
});
