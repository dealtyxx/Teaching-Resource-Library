/**
 * 红色征程 - 哈密顿回路/通路可视化
 * Revolutionary Journey - Hamiltonian Circuit/Path Visualizer
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const generateBtn = document.getElementById('generateBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const pathList = document.getElementById('pathList');
const algorithmSelect = document.getElementById('algorithmSelect');
const nodeCountDisplay = document.getElementById('nodeCount');
const visitedCountDisplay = document.getElementById('visitedCount');
const conceptInfo = document.getElementById('conceptInfo');

// State
let nodes = [];
let edges = [];
let adjacencyList = new Map();
let isRunning = false;
let shouldStop = false;
let currentGraphType = 'hamiltonian-circuit';
let nodeElements = new Map();
let edgeElements = new Map();
let pathOrder = [];

// Constants
const NODE_RADIUS = 32;
const REVOLUTIONARY_SITES = [
    { name: "上海", desc: "建党伟业" },
    { name: "井冈山", desc: "星火燎原" },
    { name: "遵义", desc: "伟大转折" },
    { name: "延安", desc: "革命圣地" },
    { name: "西柏坡", desc: "进京赶考" },
    { name: "北京", desc: "开国大典" },
    { name: "深圳", desc: "改革春雷" },
    { name: "浦东", desc: "开发开放" }
];

// Graph Type Info
const GRAPH_INFO = {
    'hamiltonian-circuit': {
        title: '哈密顿回路',
        description: '访问每个革命地点恰好一次,最终回到起点的完整征程。',
        condition: '图中存在一条回路,经过每个顶点恰好一次。',
        meaning: '象征革命事业的完整性,从人民中来,到人民中去。'
    },
    'hamiltonian-path': {
        title: '哈密顿通路',
        description: '访问每个革命地点恰好一次,但不回到起点。',
        condition: '图中存在一条路径,经过每个顶点恰好一次。',
        meaning: '体现革命征程有起点有终点,从旧社会走向新社会。'
    },
    'hamiltonian-graph': {
        title: '哈密顿图',
        description: '存在哈密顿回路的图。',
        condition: '所有顶点度数≥n/2(Dirac定理)或其他充分条件。',
        meaning: '代表革命根据地紧密联系,形成完整闭环。'
    },
    'non-hamiltonian': {
        title: '非哈密顿图',
        description: '不存在哈密顿回路的图,用于对比学习。',
        condition: '图中存在割点或桥,或不满足哈密顿条件。',
        meaning: '对比理解完整革命道路的重要性。'
    }
};

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
    return Math.max(80, 1000 - (val * 9));
}

// Update Info Panel
function updateConceptInfo(type) {
    const info = GRAPH_INFO[type];
    conceptInfo.innerHTML = `
        <p><strong>${info.title}:</strong> ${info.description}</p>
        <p><strong>判定条件:</strong> ${info.condition}</p>
        <p><strong>象征意义:</strong> ${info.meaning}</p>
    `;
}

// Graph Generation
function generateGraphByType(type) {
    nodes = [];
    edges = [];
    adjacencyList.clear();

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    switch (type) {
        case 'hamiltonian-circuit':
        case 'hamiltonian-graph':
            generateHamiltonianCircuit(centerX, centerY);
            break;
        case 'hamiltonian-path':
            generateHamiltonianPath(centerX, centerY);
            break;
        case 'non-hamiltonian':
            generateNonHamiltonian(centerX, centerY);
            break;
    }

    buildAdjacencyList();
    renderGraph();
    resetState();
    updateStats();
}

// Generate Hamiltonian Circuit Graph
function generateHamiltonianCircuit(cx, cy) {
    const count = 6;
    const radius = Math.min(cx, cy) * 0.6;

    // Create nodes in circle
    for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI / count) - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        nodes.push({
            id: i,
            name: REVOLUTIONARY_SITES[i].name,
            desc: REVOLUTIONARY_SITES[i].desc,
            x, y
        });
    }

    // Create a Hamiltonian circuit (ring + some chords)
    for (let i = 0; i < count; i++) {
        addEdge(i, (i + 1) % count); // Ring
    }

    // Add chords for complexity
    addEdge(0, 2);
    addEdge(1, 4);
    addEdge(2, 5);
}

// Generate Hamiltonian Path Graph
function generateHamiltonianPath(cx, cy) {
    const count = 6;
    const radius = Math.min(cx, cy) * 0.6;

    for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI / count) - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        nodes.push({
            id: i,
            name: REVOLUTIONARY_SITES[i].name,
            desc: REVOLUTIONARY_SITES[i].desc,
            x, y
        });
    }

    // Create path structure
    for (let i = 0; i < count - 1; i++) {
        addEdge(i, (i + 1) % count);
    }
    addEdge(0, 3);
    addEdge(1, 4);
}

// Generate Non-Hamiltonian Graph (with articulation point)
function generateNonHamiltonian(cx, cy) {
    const count = 7;
    const radius = Math.min(cx, cy) * 0.6;

    for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI / count) - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        nodes.push({
            id: i,
            name: REVOLUTIONARY_SITES[i % REVOLUTIONARY_SITES.length].name,
            desc: REVOLUTIONARY_SITES[i % REVOLUTIONARY_SITES.length].desc,
            x, y
        });
    }

    // Create structure with bottleneck (node 3 is articulation point)
    addEdge(0, 1);
    addEdge(1, 2);
    addEdge(2, 0);
    addEdge(2, 3); // Bottleneck
    addEdge(3, 4);
    addEdge(4, 5);
    addEdge(5, 6);
    addEdge(6, 4);
}

function addEdge(u, v) {
    const id = `${Math.min(u, v)}-${Math.max(u, v)}`;
    if (!edges.find(e => e.id === id)) {
        edges.push({ u, v, id });
    }
}

function buildAdjacencyList() {
    adjacencyList.clear();
    nodes.forEach(node => adjacencyList.set(node.id, []));

    edges.forEach(edge => {
        adjacencyList.get(edge.u).push(edge.v);
        adjacencyList.get(edge.v).push(edge.u);
    });
}

// Rendering
function renderGraph() {
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    nodeElements.clear();
    edgeElements.clear();

    // Render Edges
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
        edgeElements.set(edge.id, line);
        edgeElements.set(`${edge.v}-${edge.u}`, line);
    });

    // Render Nodes
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
        nodeElements.set(node.id, g);
    });
}

function updateStats() {
    nodeCountDisplay.textContent = nodes.length;
}

// Path Display
function addToPath(nodeId, order) {
    const item = document.createElement('div');
    item.className = 'path-item';
    item.textContent = `${order}. ${nodes[nodeId].name}`;
    pathList.appendChild(item);
}

function clearPath() {
    pathList.innerHTML = '';
}

// Add order badge to node
function addOrderBadge(nodeId, order) {
    const g = nodeElements.get(nodeId);

    const badgeBg = createSVGElement('circle', {
        cx: NODE_RADIUS - 8,
        cy: -NODE_RADIUS + 8,
        r: 11,
        class: 'order-badge-bg'
    });

    const badgeText = createSVGElement('text', {
        x: NODE_RADIUS - 8,
        y: -NODE_RADIUS + 8,
        class: 'order-badge',
        'text-anchor': 'middle',
        'dy': '.35em'
    });
    badgeText.textContent = order;

    g.appendChild(badgeBg);
    g.appendChild(badgeText);
}

// Reset State
function resetState() {
    pathOrder = [];
    clearPath();

    nodeElements.forEach(el => {
        el.classList.remove('visited', 'current', 'start', 'backtrack');
        // Remove order badges
        const badges = el.querySelectorAll('.order-badge, .order-badge-bg');
        badges.forEach(badge => badge.remove());
    });

    edgeElements.forEach(el => {
        el.classList.remove('visited', 'current');
    });

    statusText.textContent = '准备就绪';
    visitedCountDisplay.textContent = '0';
}

// Backtracking Algorithm for Hamiltonian Path/Circuit
async function backtrackingAlgorithm(requireCircuit = false) {
    statusText.textContent = '回溯算法: 深度优先搜索中...';

    const startNode = 0;
    const path = [startNode];
    const visited = new Set([startNode]);

    // Mark start
    const startEl = nodeElements.get(startNode);
    startEl.classList.add('start', 'current');
    addToPath(startNode, 1);
    addOrderBadge(startNode, 1);
    visitedCountDisplay.textContent = '1';
    await sleep(getDelay());

    const found = await backtrack(startNode, path, visited, requireCircuit);

    if (found) {
        statusText.textContent = requireCircuit
            ? '成功! 找到哈密顿回路,革命征程圆满闭环!'
            : '成功! 找到哈密顿通路,革命征程胜利完成!';
    } else {
        statusText.textContent = '未找到哈密顿路径,该图可能不存在哈密顿回路/通路';
    }

    return found;
}

async function backtrack(current, path, visited, requireCircuit) {
    if (shouldStop) return false;

    // Check if we've visited all nodes
    if (path.length === nodes.length) {
        if (requireCircuit) {
            // Check if we can return to start
            const neighbors = adjacencyList.get(current);
            if (neighbors.includes(path[0])) {
                // Complete the circuit
                const edgeId = getEdgeId(current, path[0]);
                const edgeEl = edgeElements.get(edgeId);
                if (edgeEl) {
                    edgeEl.classList.add('current');
                    await sleep(getDelay() / 2);
                    edgeEl.classList.remove('current');
                    edgeEl.classList.add('visited');
                }
                return true;
            }
            return false;
        } else {
            return true; // Found Hamiltonian path
        }
    }

    const neighbors = adjacencyList.get(current);

    for (const next of neighbors) {
        if (shouldStop) return false;

        if (!visited.has(next)) {
            // Try this node
            const edgeId = getEdgeId(current, next);
            const edgeEl = edgeElements.get(edgeId);
            const nextEl = nodeElements.get(next);

            // Visualize edge
            if (edgeEl) {
                edgeEl.classList.add('current');
                await sleep(getDelay() / 2);
            }

            // Move to next node
            nodeElements.get(current).classList.remove('current');
            visited.add(next);
            path.push(next);
            nextEl.classList.add('current');
            addToPath(next, path.length);
            addOrderBadge(next, path.length);
            visitedCountDisplay.textContent = path.length;

            if (edgeEl) {
                edgeEl.classList.remove('current');
                edgeEl.classList.add('visited');
            }

            statusText.textContent = `访问: ${nodes[next].name} (${nodes[next].desc})`;
            await sleep(getDelay());

            // Recursive call
            const result = await backtrack(next, path, visited, requireCircuit);

            if (result) {
                nodeElements.get(next).classList.remove('current');
                nodeElements.get(next).classList.add('visited');
                return true;
            }

            // Backtrack
            if (!shouldStop) {
                statusText.textContent = `回溯: 从 ${nodes[next].name} 返回`;
                nextEl.classList.add('backtrack');
                await sleep(getDelay() / 2);
                nextEl.classList.remove('current', 'backtrack');

                visited.delete(next);
                path.pop();
                nodeElements.get(current).classList.add('current');
                visitedCountDisplay.textContent = path.length;

                if (edgeEl) {
                    edgeEl.classList.remove('visited');
                }

                // Remove last path item
                const lastItem = pathList.lastElementChild;
                if (lastItem) lastItem.remove();

                // Remove order badge
                const badges = nextEl.querySelectorAll('.order-badge, .order-badge-bg');
                badges.forEach(badge => badge.remove());

                await sleep(getDelay() / 3);
            }
        }
    }

    return false;
}

// Greedy Algorithm (Nearest Neighbor)
async function greedyAlgorithm() {
    statusText.textContent = '贪心算法: 最近邻居优先...';

    const startNode = 0;
    const path = [startNode];
    const visited = new Set([startNode]);
    let current = startNode;

    // Mark start
    const startEl = nodeElements.get(startNode);
    startEl.classList.add('start', 'current');
    addToPath(startNode, 1);
    addOrderBadge(startNode, 1);
    visitedCountDisplay.textContent = '1';
    await sleep(getDelay());

    while (visited.size < nodes.length && !shouldStop) {
        const neighbors = adjacencyList.get(current).filter(n => !visited.has(n));

        if (neighbors.length === 0) {
            statusText.textContent = '贪心算法失败: 陷入死胡同,无法继续';
            return false;
        }

        // Choose first unvisited neighbor (greedy)
        const next = neighbors[0];

        // Visualize edge
        const edgeId = getEdgeId(current, next);
        const edgeEl = edgeElements.get(edgeId);
        const nextEl = nodeElements.get(next);

        if (edgeEl) {
            edgeEl.classList.add('current');
            await sleep(getDelay() / 2);
        }

        // Move to next node
        nodeElements.get(current).classList.remove('current');
        nodeElements.get(current).classList.add('visited');
        visited.add(next);
        path.push(next);
        nextEl.classList.add('current');
        addToPath(next, path.length);
        addOrderBadge(next, path.length);
        visitedCountDisplay.textContent = path.length;

        if (edgeEl) {
            edgeEl.classList.remove('current');
            edgeEl.classList.add('visited');
        }

        statusText.textContent = `贪心选择: ${nodes[next].name} (${nodes[next].desc})`;
        await sleep(getDelay());

        current = next;
    }

    nodeElements.get(current).classList.remove('current');
    nodeElements.get(current).classList.add('visited');

    if (visited.size === nodes.length) {
        statusText.textContent = '贪心算法成功! 找到一条哈密顿通路!';
        return true;
    }

    return false;
}

function getEdgeId(u, v) {
    return `${Math.min(u, v)}-${Math.max(u, v)}`;
}

// Main Algorithm Runner
async function runHamiltonianAlgorithm() {
    if (isRunning) return;

    isRunning = true;
    shouldStop = false;
    startBtn.disabled = true;
    generateBtn.disabled = true;

    resetState();

    const algorithm = algorithmSelect.value;
    const requireCircuit = currentGraphType === 'hamiltonian-circuit' || currentGraphType === 'hamiltonian-graph';

    let success = false;

    if (algorithm === 'backtracking') {
        success = await backtrackingAlgorithm(requireCircuit);
    } else {
        success = await greedyAlgorithm();
    }

    if (shouldStop) {
        statusText.textContent = '算法已暂停';
    }

    isRunning = false;
    startBtn.disabled = false;
    generateBtn.disabled = false;
}

// Event Listeners
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (isRunning) return;

        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentGraphType = btn.getAttribute('data-type');
        updateConceptInfo(currentGraphType);
        generateGraphByType(currentGraphType);
    });
});

generateBtn.addEventListener('click', () => {
    if (!isRunning) {
        generateGraphByType(currentGraphType);
    }
});

startBtn.addEventListener('click', runHamiltonianAlgorithm);

resetBtn.addEventListener('click', () => {
    shouldStop = true;
    setTimeout(() => {
        isRunning = false;
        resetState();
        startBtn.disabled = false;
        generateBtn.disabled = false;
    }, 100);
});

// Init
window.addEventListener('load', () => {
    updateConceptInfo(currentGraphType);
    generateGraphByType(currentGraphType);
});
