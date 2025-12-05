/**
 * 红色纽带 - 最小生成树可视化
 * Revolutionary Bond - Minimum Spanning Tree (Prim/Kruskal)
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const generateBtn = document.getElementById('generateBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const algorithmSelect = document.getElementById('algorithmSelect');
const nodeCount = document.getElementById('nodeCount');
const nodeCountValue = document.getElementById('nodeCountValue');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const vertexCount = document.getElementById('vertexCount');
const edgeCount = document.getElementById('edgeCount');
const mstEdgeCount = document.getElementById('mstEdgeCount');
const totalWeight = document.getElementById('totalWeight');
const mstEdgeList = document.getElementById('mstEdgeList');

// State
let nodes = [];
let edges = [];
let adjacency = new Map();
let isRunning = false;
let nodeElements = new Map();
let edgeElements = [];
let mstEdges = [];

// Constants
const NODE_RADIUS = 26;
const SITES = [
    "上海", "嘉兴", "瑞金", "遵义", "延安",
    "西柏坡", "北京", "深圳", "浦东", "雄安"
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
    return Math.max(100, 1000 - (val * 9));
}

// Generate Weighted Graph
function generateGraph() {
    nodes = [];
    edges = [];
    adjacency = new Map();
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    nodeElements.clear();
    edgeElements = [];
    mstEdges = [];

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;
    const n = parseInt(nodeCount.value);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Create nodes in circular layout
    for (let i = 0; i < n; i++) {
        const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        nodes.push({
            id: i,
            name: SITES[i % SITES.length],
            x, y
        });
        adjacency.set(i, []);
    }

    // Create edges with weights - ensure connected graph
    for (let i = 0; i < n; i++) {
        const next = (i + 1) % n;
        addEdge(i, next);
    }

    // Add additional edges for variety
    const extraEdges = Math.floor(n * 0.5);
    for (let i = 0; i < extraEdges; i++) {
        const u = Math.floor(Math.random() * n);
        let v = Math.floor(Math.random() * n);

        // Ensure not same, not adjacent
        while (v === u || Math.abs(u - v) === 1 || (u === 0 && v === n - 1) || (u === n - 1 && v === 0)) {
            v = Math.floor(Math.random() * n);
        }

        addEdge(u, v);
    }

    renderGraph();
    updateStats();
}

function addEdge(u, v) {
    const id = `${Math.min(u, v)}-${Math.max(u, v)}`;
    if (!edges.find(e => e.id === id)) {
        const weight = Math.floor(Math.random() * 20) + 1;
        edges.push({ u, v, id, weight });
        adjacency.get(u).push(v);
        adjacency.get(v).push(u);
    }
}

// Rendering with Weight Display
function renderGraph() {
    // Render edges with weights
    edges.forEach(edge => {
        const uNode = nodes[edge.u];
        const vNode = nodes[edge.v];

        const line = createSVGElement('line', {
            x1: uNode.x, y1: uNode.y,
            x2: vNode.x, y2: vNode.y,
            class: 'edge-line',
            'data-edge-id': edge.id
        });
        edgesGroup.appendChild(line);

        // Add weight label - prominently displayed
        const midX = (uNode.x + vNode.x) / 2;
        const midY = (uNode.y + vNode.y) / 2;

        const text = createSVGElement('text', {
            x: midX, y: midY,
            class: 'edge-weight',
            'text-anchor': 'middle',
            'dy': '.35em'
        });
        text.textContent = edge.weight;
        edgesGroup.appendChild(text);

        edgeElements.push({ line, edge, weight: text });
    });

    // Render nodes
    nodes.forEach(node => {
        const g = createSVGElement('g', {
            class: 'node-group',
            transform: `translate(${node.x}, ${node.y})`,
            'data-id': node.id
        });

        const circle = createSVGElement('circle', {
            r: NODE_RADIUS,
            class: 'node-circle'
        });

        const text = createSVGElement('text', {
            class: 'node-text',
            'text-anchor': 'middle',
            'dy': '.35em'
        });
        text.textContent = node.name;

        g.appendChild(circle);
        g.appendChild(text);
        nodesGroup.appendChild(g);
        nodeElements.set(node.id, { g, circle, text });
    });
}

function updateStats() {
    vertexCount.textContent = nodes.length;
    edgeCount.textContent = edges.length;
}

// Start Algorithm
async function startAlgorithm() {
    if (isRunning) return;

    isRunning = true;
    startBtn.disabled = true;
    generateBtn.disabled = true;

    reset();

    const algorithm = algorithmSelect.value;

    if (algorithm === 'prim') {
        await primMST();
    } else {
        await kruskalMST();
    }

    updateMSTInfo();
    statusText.textContent = `MST构建完成! 总权重: ${mstEdges.reduce((sum, e) => sum + e.weight, 0)}`;

    isRunning = false;
    startBtn.disabled = false;
    generateBtn.disabled = false;
}

// Prim's Algorithm
async function primMST() {
    const visited = new Set();
    mstEdges = [];

    const start = 0;
    visited.add(start);
    nodeElements.get(start).circle.classList.add('start');
    statusText.textContent = `Prim起点: ${nodes[start].name}`;
    await sleep(getDelay());

    while (visited.size < nodes.length) {
        let minEdge = null;
        let minWeight = Infinity;

        // Show all candidate edges
        edgeElements.forEach(({ edge, line }) => {
            const uVisited = visited.has(edge.u);
            const vVisited = visited.has(edge.v);

            if (uVisited !== vVisited) {
                line.classList.add('candidate');
            }
        });

        await sleep(getDelay() / 2);

        // Find minimum edge
        for (const { edge } of edgeElements) {
            const uVisited = visited.has(edge.u);
            const vVisited = visited.has(edge.v);

            if (uVisited !== vVisited && edge.weight < minWeight) {
                minEdge = edge;
                minWeight = edge.weight;
            }
        }

        if (!minEdge) break;

        // Add to MST
        const edgeEl = edgeElements.find(e => e.edge.id === minEdge.id);
        edgeEl.line.classList.remove('candidate');
        edgeEl.line.classList.add('mst');
        mstEdges.push(minEdge);

        const newNode = visited.has(minEdge.u) ? minEdge.v : minEdge.u;
        visited.add(newNode);

        const newEl = nodeElements.get(newNode);
        newEl.circle.classList.add('current');
        statusText.textContent = `Prim添加边: ${nodes[minEdge.u].name}-${nodes[minEdge.v].name} (权重:${minEdge.weight})`;
        await sleep(getDelay());

        newEl.circle.classList.remove('current');
        newEl.circle.classList.add('visited');

        // Clear other candidate edges
        edgeElements.forEach(({ line }) => {
            line.classList.remove('candidate');
        });

        updateMSTInfo();
    }
}

// Kruskal's Algorithm
async function kruskalMST() {
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const parent = new Array(nodes.length).fill(0).map((_, i) => i);
    mstEdges = [];

    function find(x) {
        if (parent[x] !== x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    }

    function union(x, y) {
        parent[find(x)] = find(y);
    }

    for (const edge of sortedEdges) {
        const edgeEl = edgeElements.find(e => e.edge.id === edge.id);
        edgeEl.line.classList.add('candidate');

        const uNode = nodeElements.get(edge.u);
        const vNode = nodeElements.get(edge.v);
        uNode.circle.classList.add('current');
        vNode.circle.classList.add('current');

        statusText.textContent = `Kruskal检查: ${nodes[edge.u].name}-${nodes[edge.v].name} (权重:${edge.weight})`;
        await sleep(getDelay());

        if (find(edge.u) !== find(edge.v)) {
            // Accept edge
            union(edge.u, edge.v);
            edgeEl.line.classList.remove('candidate');
            edgeEl.line.classList.add('mst');
            mstEdges.push(edge);

            statusText.textContent = `✓ 接受: ${nodes[edge.u].name}-${nodes[edge.v].name} (${edge.weight})`;
            updateMSTInfo();
        } else {
            // Reject edge
            edgeEl.line.classList.remove('candidate');
            edgeEl.line.classList.add('rejected');

            statusText.textContent = `✗ 拒绝: ${nodes[edge.u].name}-${nodes[edge.v].name} (形成环)`;
        }

        await sleep(getDelay());

        uNode.circle.classList.remove('current');
        vNode.circle.classList.remove('current');
        uNode.circle.classList.add('visited');
        vNode.circle.classList.add('visited');
    }
}

function updateMSTInfo() {
    mstEdgeCount.textContent = mstEdges.length;

    const weight = mstEdges.reduce((sum, edge) => sum + edge.weight, 0);
    totalWeight.textContent = weight;

    mstEdgeList.innerHTML = '';
    mstEdges.forEach(edge => {
        const item = document.createElement('div');
        item.className = 'edge-item';
        item.textContent = `${nodes[edge.u].name}-${nodes[edge.v].name} (${edge.weight})`;
        mstEdgeList.appendChild(item);
    });
}

function reset() {
    mstEdges = [];
    mstEdgeCount.textContent = '0';
    totalWeight.textContent = '0';
    mstEdgeList.innerHTML = '';

    nodeElements.forEach(({ circle }) => {
        circle.className = 'node-circle';
    });

    edgeElements.forEach(({ line }) => {
        line.className = 'edge-line';
    });
}

// Event Listeners
nodeCount.addEventListener('input', () => {
    nodeCountValue.textContent = nodeCount.value;
});

generateBtn.addEventListener('click', generateGraph);
startBtn.addEventListener('click', startAlgorithm);

resetBtn.addEventListener('click', () => {
    reset();
    statusText.textContent = '已重置';
});

// Init
window.addEventListener('load', () => {
    nodeCountValue.textContent = nodeCount.value;
    generateGraph();
});
