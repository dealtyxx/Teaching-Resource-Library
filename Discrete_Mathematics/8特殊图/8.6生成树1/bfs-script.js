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
let stopRequested = false; // 运行中点「重置」时中止动画

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

    // 随机位置生成节点（与已有节点保持最小间距，避免重叠）
    for (let i = 0; i < n; i++) {
        const { x, y } = placeNode(margin, width - margin, margin, height - margin);

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

    // 添加额外的边（连向较近的顶点），保证图中有圈，生成树才需要“舍弃”边
    addExtraEdges([...Array(n).keys()], Math.max(2, Math.floor(n * (0.3 + Math.random() * 0.3))));
}

// 在矩形内随机取点，尽量与已有节点保持 2.8 倍半径以上的间距
function placeNode(x0, x1, y0, y1) {
    let best = null, bestGap = -1;
    for (let t = 0; t < 60; t++) {
        const x = x0 + Math.random() * (x1 - x0);
        const y = y0 + Math.random() * (y1 - y0);
        const gap = nodes.reduce((m, nd) => Math.min(m, Math.hypot(nd.x - x, nd.y - y)), Infinity);
        if (gap > bestGap) { best = { x, y }; bestGap = gap; }
        if (gap >= NODE_RADIUS * 2.8) break;
    }
    return best;
}

// 在给定顶点集合内加 count 条新边：随机选一点，连向离它最近的若干个未相邻顶点之一
function addExtraEdges(ids, count) {
    let added = 0;
    for (let tries = 0; added < count && tries < count * 20; tries++) {
        const u = ids[Math.floor(Math.random() * ids.length)];
        const cand = ids.filter(v => v !== u && !adjacency.get(u).includes(v))
            .sort((a, b) => distance(nodes[u], nodes[a]) - distance(nodes[u], nodes[b]))
            .slice(0, 3);
        if (!cand.length) continue;
        addEdge(u, cand[Math.floor(Math.random() * cand.length)]);
        added++;
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
            const { x, y } = placeNode(regionX, regionX + regionWidth * 0.8, margin, height - margin);

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

        // 添加额外的边，使每个分量（≥3 点时）都含圈
        if (size >= 3) addExtraEdges(compNodes, Math.max(1, Math.floor(size * 0.3)));
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
    stopRequested = false;
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
    if (stopRequested) {
        reset();
        statusText.textContent = '已重置';
    } else {
        const k = Number(forestCount.textContent);
        const name = algorithm === 'bfs' ? 'BFS' : 'DFS';
        statusText.textContent = k === 1
            ? `${name} 完成：得到一棵生成树，树边 ${spanningTreeEdges.length} = n − 1 条。`
            : `${name} 完成：图有 ${k} 个连通分支，得到由 ${k} 棵树组成的生成森林，树边 ${spanningTreeEdges.length} = n − ${k} 条。`;
    }

    isRunning = false;
    startBtn.disabled = false;
    generateBtn.disabled = false;
}

// BFS Spanning Tree
async function bfsSpanningTree() {
    const visited = new Set();
    let componentCount = 0;

    for (let start = 0; start < nodes.length; start++) {
        if (stopRequested) return;
        if (visited.has(start)) continue;

        componentCount++;
        const queue = [start];
        visited.add(start);

        nodeElements.get(start).circle.classList.add('start');
        statusText.textContent = `BFS 第 ${componentCount} 棵树：起点 ${nodes[start].name}`;
        await sleep(getDelay());

        while (queue.length > 0) {
            if (stopRequested) return;
            const u = queue.shift();
            const uEl = nodeElements.get(u);
            uEl.circle.classList.add('current');
            uEl.circle.classList.remove('queue');

            statusText.textContent = `BFS 出队访问：${nodes[u].name}`;
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
        if (stopRequested) return;
        if (visited.has(start)) continue;

        componentCount++;
        nodeElements.get(start).circle.classList.add('start');
        statusText.textContent = `DFS 第 ${componentCount} 棵树：起点 ${nodes[start].name}`;
        await sleep(getDelay());

        await dfsRecursive(start, visited);
    }

    forestCount.textContent = componentCount;
}

async function dfsRecursive(u, visited) {
    if (stopRequested) return;
    visited.add(u);

    const uEl = nodeElements.get(u);
    uEl.circle.classList.add('current');

    statusText.textContent = `DFS 访问：${nodes[u].name}`;
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
    if (isRunning) stopRequested = true;
    reset();
    statusText.textContent = '已重置';
});

// Init
window.addEventListener('load', () => {
    nodeCountValue.textContent = nodeCount.value;
    generateGraph();
});
