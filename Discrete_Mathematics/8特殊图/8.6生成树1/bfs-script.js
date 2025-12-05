/**
 * 红色搜索 - BFS/DFS生成树可视化
 * Revolutionary Search - BFS/DFS Spanning Tree
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const generateBtn = document.getElementById('generateBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const algorithmSelect = document.getElementById('algorithmSelect');
const graphType = document.getElementById('graphType');
const nodeCount = document.getElementById('nodeCount');
const nodeCountValue = document.getElementById('nodeCountValue');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const vertexCount = document.getElementById('vertexCount');
const edgeCount = document.getElementById('edgeCount');
const treeEdgeCount = document.getElementById('treeEdgeCount');
const forestCount = document.getElementById('forestCount');
const treeEdgeList = document.getElementById('treeEdgeList');

// State
let nodes = [];
let edges = [];
let adjacency = new Map();
let isRunning = false;
let nodeElements = new Map();
let edgeElements = [];
let spanningTreeEdges = [];

// Constants
const NODE_RADIUS = 26;
const SITES = [
    "上海", "嘉兴", "井冈山", "瑞金", "遵义", "延安",
    "西柏坡", "北京", "深圳", "浦东", "雄安", "杭州", "南昌", "武汉"
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

// 更随机的图生成
function generateGraph() {
    nodes = [];
    edges = [];
    adjacency = new Map();
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    nodeElements.clear();
    edgeElements = [];
    spanningTreeEdges = [];

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;
    const n = parseInt(nodeCount.value);

    const type = graphType.value;

    if (type === 'disconnected') {
        generateRandomDisconnected(width, height, n);
    } else {
        generateRandomConnected(width, height, n);
    }

    renderGraph();
    updateStats();
}

// 生成随机连通图 - 更随机的布局
function generateRandomConnected(width, height, n) {
    const margin = 80;

    // 随机位置生成节点
    for (let i = 0; i < n; i++) {
        const x = margin + Math.random() * (width - 2 * margin);
        const y = margin + Math.random() * (height - 2 * margin);

        nodes.push({
            id: i,
            name: SITES[i % SITES.length],
            x, y
        });
        adjacency.set(i, []);
    }

    // 先生成最小生成树保证连通性
    const visited = new Set([0]);
    const mstEdges = [];

    while (visited.size < n) {
        let minDist = Infinity;
        let bestEdge = null;

        for (const u of visited) {
            for (let v = 0; v < n; v++) {
                if (!visited.has(v)) {
                    const dist = distance(nodes[u], nodes[v]);
                    if (dist < minDist) {
                        minDist = dist;
                        bestEdge = { u, v };
                    }
                }
            }
        }

        if (bestEdge) {
            mstEdges.push(bestEdge);
            visited.add(bestEdge.v);
        }
    }

    // 添加MST边
    mstEdges.forEach(({ u, v }) => addEdge(u, v));

    // 添加额外的随机边
    const extraEdges = Math.floor(n * (0.3 + Math.random() * 0.4));
    for (let i = 0; i < extraEdges; i++) {
        const u = Math.floor(Math.random() * n);
        const v = Math.floor(Math.random() * n);
        if (u !== v) {
            addEdge(u, v);
        }
    }
}

// 生成随机非连通图(森林)
function generateRandomDisconnected(width, height, n) {
    const components = 2;
    const margin = 60;

    // 随机划分节点到各个连通分量
    const componentSizes = [];
    let remaining = n;
    for (let i = 0; i < components - 1; i++) {
        const size = Math.floor(remaining / (components - i) * (0.7 + Math.random() * 0.6));
        componentSizes.push(Math.max(2, size));
        remaining -= componentSizes[i];
    }
    componentSizes.push(remaining);

    const regionWidth = (width - 2 * margin) / components;
    let nodeId = 0;

    for (let c = 0; c < components; c++) {
        const size = componentSizes[c];
        const regionX = margin + c * regionWidth;

        const compNodes = [];

        // 在区域内随机放置节点
        for (let i = 0; i < size; i++) {
            const x = regionX + Math.random() * regionWidth * 0.8;
            const y = margin + Math.random() * (height - 2 * margin);

            nodes.push({
                id: nodeId,
                name: SITES[nodeId % SITES.length],
                x, y
            });
            adjacency.set(nodeId, []);
            compNodes.push(nodeId);
            nodeId++;
        }

        // 连通当前分量
        const visited = new Set([compNodes[0]]);
        while (visited.size < compNodes.length) {
            let minDist = Infinity;
            let bestEdge = null;

            for (const u of visited) {
                for (const v of compNodes) {
                    if (!visited.has(v)) {
                        const dist = distance(nodes[u], nodes[v]);
                        if (dist < minDist) {
                            minDist = dist;
                            bestEdge = { u, v };
                        }
                    }
                }
            }

            if (bestEdge) {
                addEdge(bestEdge.u, bestEdge.v);
                visited.add(bestEdge.v);
            }
        }

        // 添加随机边
        const extraEdges = Math.floor(size * 0.3);
        for (let i = 0; i < extraEdges; i++) {
            const u = compNodes[Math.floor(Math.random() * compNodes.length)];
            const v = compNodes[Math.floor(Math.random() * compNodes.length)];
            if (u !== v) {
                addEdge(u, v);
            }
        }
    }
}

function distance(n1, n2) {
    const dx = n1.x - n2.x;
    const dy = n1.y - n2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function addEdge(u, v) {
    const id = `${Math.min(u, v)}-${Math.max(u, v)}`;
    if (!edges.find(e => e.id === id)) {
        edges.push({ u, v, id });
        adjacency.get(u).push(v);
        adjacency.get(v).push(u);
    }
}

// Rendering
function renderGraph() {
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

        edgeElements.push({ line, edge });
    });

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

    if (algorithm === 'bfs') {
        await bfsSpanningTree();
    } else {
        await dfsSpanningTree();
    }

    updateTreeInfo();
    statusText.textContent = '搜索完成!';

    isRunning = false;
    startBtn.disabled = false;
    generateBtn.disabled = false;
}

// BFS Spanning Tree
async function bfsSpanningTree() {
    const visited = new Set();
    let componentCount = 0;

    for (let start = 0; start < nodes.length; start++) {
        if (visited.has(start)) continue;

        componentCount++;
        const queue = [start];
        visited.add(start);

        nodeElements.get(start).circle.classList.add('start');
        statusText.textContent = `BFS第${componentCount}棵树: 起点 ${nodes[start].name}`;
        await sleep(getDelay());

        while (queue.length > 0) {
            const u = queue.shift();
            const uEl = nodeElements.get(u);
            uEl.circle.classList.add('current');
            uEl.circle.classList.remove('queue');

            statusText.textContent = `BFS访问: ${nodes[u].name}`;
            await sleep(getDelay());

            for (const v of adjacency.get(u)) {
                if (!visited.has(v)) {
                    visited.add(v);
                    queue.push(v);

                    const vEl = nodeElements.get(v);
                    vEl.circle.classList.add('queue');

                    const edgeId = `${Math.min(u, v)}-${Math.max(u, v)}`;
                    const edgeEl = edgeElements.find(e => e.edge.id === edgeId);
                    if (edgeEl) {
                        edgeEl.line.classList.add('tree');
                        spanningTreeEdges.push(edgeEl.edge);
                    }

                    await sleep(getDelay() / 2);
                }
            }

            uEl.circle.classList.remove('current');
            uEl.circle.classList.add('visited');
        }
    }

    forestCount.textContent = componentCount;
}

// DFS Spanning Tree
async function dfsSpanningTree() {
    const visited = new Set();
    let componentCount = 0;

    for (let start = 0; start < nodes.length; start++) {
        if (visited.has(start)) continue;

        componentCount++;
        nodeElements.get(start).circle.classList.add('start');
        statusText.textContent = `DFS第${componentCount}棵树: 起点 ${nodes[start].name}`;
        await sleep(getDelay());

        await dfsRecursive(start, visited);
    }

    forestCount.textContent = componentCount;
}

async function dfsRecursive(u, visited) {
    visited.add(u);

    const uEl = nodeElements.get(u);
    uEl.circle.classList.add('current');

    statusText.textContent = `DFS访问: ${nodes[u].name}`;
    await sleep(getDelay());

    for (const v of adjacency.get(u)) {
        if (!visited.has(v)) {
            const edgeId = `${Math.min(u, v)}-${Math.max(u, v)}`;
            const edgeEl = edgeElements.find(e => e.edge.id === edgeId);
            if (edgeEl) {
                edgeEl.line.classList.add('tree');
                spanningTreeEdges.push(edgeEl.edge);
            }

            await dfsRecursive(v, visited);
        }
    }

    uEl.circle.classList.remove('current');
    uEl.circle.classList.add('visited');
}

function updateTreeInfo() {
    treeEdgeCount.textContent = spanningTreeEdges.length;

    treeEdgeList.innerHTML = '';
    spanningTreeEdges.forEach(edge => {
        const item = document.createElement('div');
        item.className = 'edge-item';
        item.textContent = `${nodes[edge.u].name}-${nodes[edge.v].name}`;
        treeEdgeList.appendChild(item);
    });
}

function reset() {
    spanningTreeEdges = [];
    treeEdgeCount.textContent = '0';
    forestCount.textContent = '1';
    treeEdgeList.innerHTML = '';

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

graphType.addEventListener('change', generateGraph);
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
