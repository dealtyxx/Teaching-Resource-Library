/**
 * 红色古镇 - 修复路径规划  
 * Revolutionary Town - Restoration Path Planning (Euler Circuit)
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const townSelect = document.getElementById('townSelect');
const generateBtn = document.getElementById('generateBtn');
const checkBtn = document.getElementById('checkBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const connectivityStatus = document.getElementById('connectivityStatus');
const degreeStatus = document.getElementById('degreeStatus');
const eulerStatus = document.getElementById('eulerStatus');
const nodeCount = document.getElementById('nodeCount');
const edgeCount = document.getElementById('edgeCount');
const visitedEdges = document.getElementById('visitedEdges');
const pathLength = document.getElementById('pathLength');
const pathList = document.getElementById('pathList');
const townName = document.getElementById('townName');
const townDesc = document.getElementById('townDesc');

// Custom edit controls
const customControls = document.getElementById('customControls');
const addNodeMode = document.getElementById('addNodeMode');
const addEdgeMode = document.getElementById('addEdgeMode');
const clearGraph = document.getElementById('clearGraph');
const editHint = document.getElementById('editHint');

// State
let nodes = [];
let edges = [];
let adjacency = new Map();
let isRunning = false;
let nodeElements = new Map();
let edgeElements = [];
let eulerCircuit = [];
let isEulerian = false;

// Custom editing state
let editMode = null; // 'node', 'edge', or null
let selectedNodeForEdge = null;
let nextNodeId = 0;

// Constants
const NODE_RADIUS = 26;
const BUILDING_NAMES = [
    "城门", "钟楼", "鼓楼", "会议旧址", "革命纪念堂",
    "古戏台", "文昌阁", "东城墙", "西城墙", "南城门",
    "北城门", "望江楼", "书院", "祠堂", "古井"
];

const TOWNS = {
    preset1: { name: "遵义古城", desc: "遵义会议 · 转折之城" },
    preset2: { name: "延安古镇", desc: "革命圣地 · 窑洞岁月" },
    preset3: { name: "井冈山古村", desc: "星火燎原 · 红色摇篮" },
    custom: { name: "自定义古镇", desc: "点击画布自由编辑" }
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
    return Math.max(100, 1200 - (val * 11));
}

// Toggle Custom Controls
function toggleCustomControls() {
    const selected = townSelect.value;
    if (selected === 'custom') {
        customControls.style.display = 'flex';
        generateBtn.textContent = '🔄 重置为空图';
    } else {
        customControls.style.display = 'none';
        generateBtn.innerHTML = '<span class="icon">🏛️</span> 生成古镇布局';
        exitEditMode();
    }
}

// Edit Mode Functions
function enterNodeMode() {
    editMode = 'node';
    selectedNodeForEdge = null;

    addNodeMode.classList.add('active');
    addEdgeMode.classList.remove('active');

    editHint.textContent = '点击画布添加建筑角点';
    statusText.textContent = '节点添加模式';
}

function enterEdgeMode() {
    editMode = 'edge';
    selectedNodeForEdge = null;

    addNodeMode.classList.remove('active');
    addEdgeMode.classList.add('active');

    editHint.textContent = '点击两个节点来添加通道';
    statusText.textContent = '通道添加模式';
}

function exitEditMode() {
    editMode = null;
    selectedNodeForEdge = null;

    addNodeMode.classList.remove('active');
    addEdgeMode.classList.remove('active');

    edith = '点击按钮开始编辑';
    statusText.textContent = '准备就绪';
}

// SVG Click Handler
function handleSVGClick(event) {
    if (townSelect.value !== 'custom') return;
    if (isRunning) return;

    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (editMode === 'node') {
        addNode(x, y);
    }
}

// Add Node
function addNode(x, y) {
    const id = nextNodeId++;
    const name = BUILDING_NAMES[id % BUILDING_NAMES.length];

    nodes.push({ id, name, x, y });
    adjacency.set(id, []);

    renderSingleNode({ id, name, x, y });
    updateStats();
    resetEulerCheck();

    statusText.textContent = `添加节点: ${name}`;
}

// Node Click Handler
function handleNodeClick(nodeId) {
    if (townSelect.value !== 'custom') return;
    if (editMode !== 'edge') return;
    if (isRunning) return;

    if (selectedNodeForEdge === null) {
        selectedNodeForEdge = nodeId;
        const node = nodeElements.get(nodeId);
        node.circle.classList.add('current');
        statusText.textContent = `选中节点: ${nodes.find(n => n.id === nodeId).name}, 点击另一个节点`;
    } else {
        if (selectedNodeForEdge === nodeId) {
            // Deselect
            const node = nodeElements.get(nodeId);
            node.circle.classList.remove('current');
            selectedNodeForEdge = null;
            statusText.textContent = '通道添加模式';
        } else {
            // Add edge
            const success = addEdgeWithRender(selectedNodeForEdge, nodeId);

            const node1 = nodeElements.get(selectedNodeForEdge);
            node1.circle.classList.remove('current');

            selectedNodeForEdge = null;

            if (success) {
                const uName = nodes.find(n => n.id === selectedNodeForEdge || n.id === nodeId).name;
                const vName = nodes.find(n => n.id === nodeId).name;
                statusText.textContent = `通道已添加: ${uName}-${vName}`;
            } else {
                statusText.textContent = '该通道已存在!';
            }
        }
    }
}

// Clear Graph
function clearCustomGraph() {
    nodes = [];
    edges = [];
    adjacency = new Map();
    nodeElements.clear();
    edgeElements = [];
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    nextNodeId = 0;
    selectedNodeForEdge = null;

    updateStats();
    resetEulerCheck();
    statusText.textContent = '图已清空';
}

// Generate Graph
function generateGraph() {
    nodes = [];
    edges = [];
    adjacency = new Map();
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    nodeElements.clear();
    edgeElements = [];
    eulerCircuit = [];
    isEulerian = false;
    nextNodeId = 0;
    selectedNodeForEdge = null;

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;

    const selected = townSelect.value;
    const townInfo = TOWNS[selected];
    townName.textContent = townInfo.name;
    townDesc.textContent = townInfo.desc;

    // Generate different layouts
    if (selected === 'custom') {
        // Start with empty graph for custom
        statusText.textContent = '自定义模式: 点击按钮开始添加节点和边';
    } else {
        switch (selected) {
            case 'preset1':
                generateZunyiLayout(width, height);
                break;
            case 'preset2':
                generateYananLayout(width, height);
                break;
            case 'preset3':
                generateJinggangshanLayout(width, height);
                break;
        }
        renderGraph();
        nextNodeId = nodes.length;
    }

    updateStats();
    resetEulerCheck();
}

// 遵义古城布局 - 方形城墙
function generateZunyiLayout(width, height) {
    const cx = width / 2;
    const cy = height / 2;
    const size = Math.min(width, height) * 0.35;

    // 8个节点形成方形
    const positions = [
        [cx - size, cy - size], // 0 左上
        [cx, cy - size],        // 1 上中
        [cx + size, cy - size], // 2 右上
        [cx + size, cy],        // 3 右中
        [cx + size, cy + size], // 4 右下
        [cx, cy + size],        // 5 下中
        [cx - size, cy + size], // 6 左下
        [cx - size, cy]         // 7 左中
    ];

    positions.forEach((pos, i) => {
        nodes.push({
            id: i,
            name: BUILDING_NAMES[i],
            x: pos[0],
            y: pos[1]
        });
        adjacency.set(i, []);
    });

    // 外围城墙（形成欧拉回路）
    for (let i = 0; i < 8; i++) {
        addEdge(i, (i + 1) % 8);
    }

    // 对角连接（保持所有顶点度数为偶数）
    addEdge(0, 4);
    addEdge(2, 6);
}

// 延安古镇布局 - 窑洞式
function generateYananLayout(width, height) {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.3;

    // 6个节点圆形布局
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        nodes.push({
            id: i,
            name: BUILDING_NAMES[i],
            x, y
        });
        adjacency.set(i, []);
    }

    // 外环
    for (let i = 0; i < 6; i++) {
        addEdge(i, (i + 1) % 6);
    }

    // 内部三角形连接
    addEdge(0, 2);
    addEdge(2, 4);
    addEdge(4, 0);
}

// 井冈山古村布局 - 不规则
function generateJinggangshanLayout(width, height) {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.32;

    // 10个节点
    const angleOffsets = [0, 0.7, 1.3, 2.0, 2.6, 3.3, 4.0, 4.6, 5.2, 5.8];
    angleOffsets.forEach((offset, i) => {
        const r = radius * (0.8 + Math.random() * 0.4);
        const x = cx + r * Math.cos(offset);
        const y = cy + r * Math.sin(offset);

        nodes.push({
            id: i,
            name: BUILDING_NAMES[i],
            x, y
        });
        adjacency.set(i, []);
    });

    // 外环
    for (let i = 0; i < 10; i++) {
        addEdge(i, (i + 1) % 10);
    }

    // 五角星内部连接（保持欧拉性）
    addEdge(0, 5);
    addEdge(1, 6);
    addEdge(2, 7);
    addEdge(3, 8);
    addEdge(4, 9);
}

function addEdge(u, v) {
    const id = `${Math.min(u, v)}-${Math.max(u, v)}`;
    if (!edges.find(e => e.id === id)) {
        edges.push({ u, v, id, visited: false });
        adjacency.get(u).push(v);
        adjacency.get(v).push(u);
    }
}

// Add edge with immediate rendering for custom mode
function addEdgeWithRender(u, v) {
    const id = `${Math.min(u, v)}-${Math.max(u, v)}`;

    // Check if edge already exists
    if (edges.find(e => e.id === id)) {
        return false;
    }

    // Add to data structures
    const edge = { u, v, id, visited: false };
    edges.push(edge);
    adjacency.get(u).push(v);
    adjacency.get(v).push(u);

    // Render the edge
    const uNode = nodes.find(n => n.id === u);
    const vNode = nodes.find(n => n.id === v);

    const line = createSVGElement('line', {
        x1: uNode.x, y1: uNode.y,
        x2: vNode.x, y2: vNode.y,
        class: 'edge-line',
        'data-edge-id': edge.id
    });
    edgesGroup.appendChild(line);
    edgeElements.push({ line, edge });

    // Update stats
    updateStats();
    resetEulerCheck();

    return true;
}

// Render Graph
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
        renderSingleNode(node);
    });
}

// Render Single Node
function renderSingleNode(node) {
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

    // Add click handler
    g.addEventListener('click', (e) => {
        e.stopPropagation();
        handleNodeClick(node.id);
    });

    nodeElements.set(node.id, { g, circle, text });
}

function updateStats() {
    nodeCount.textContent = nodes.length;
    edgeCount.textContent = edges.length;
    visitedEdges.textContent = edges.filter(e => e.visited).length;
    pathLength.textContent = eulerCircuit.length;
}

// Check Euler Circuit
function checkEulerianGraph() {
    // 1. Check connectivity
    const isConnected = isGraphConnected();
    connectivityStatus.textContent = isConnected ? '✓ 连通' : '✗ 不连通';
    connectivityStatus.className = isConnected ? 'check-value valid' : 'check-value invalid';

    // 2. Check degree
    let allEvenDegree = true;
    for (const [nodeId, neighbors] of adjacency) {
        if (neighbors.length % 2 !== 0) {
            allEvenDegree = false;
            break;
        }
    }

    degreeStatus.textContent = allEvenDegree ? '✓ 全偶' : '✗ 有奇度';
    degreeStatus.className = allEvenDegree ? 'check-value valid' : 'check-value invalid';

    // 3. Determine Eulerian
    isEulerian = isConnected && allEvenDegree;
    eulerStatus.textContent = isEulerian ? '✓ 存在' : '✗ 不存在';
    eulerStatus.className = isEulerian ? 'result-value valid' : 'result-value invalid';

    if (isEulerian) {
        statusText.textContent = '欧拉回路存在! 可以进行路径规划';
        startBtn.disabled = false;
    } else {
        statusText.textContent = '不是欧拉图, 无法形成闭合回路';
        startBtn.disabled = true;
    }
}

// Check if graph is connected (DFS)
function isGraphConnected() {
    if (nodes.length === 0) return false;

    const visited = new Set();
    const stack = [nodes[0].id];

    while (stack.length > 0) {
        const current = stack.pop();
        if (visited.has(current)) continue;

        visited.add(current);

        for (const neighbor of adjacency.get(current)) {
            if (!visited.has(neighbor)) {
                stack.push(neighbor);
            }
        }
    }

    return visited.size === nodes.length;
}

// Find Euler Circuit (Hierholzer's Algorithm)
function findEulerCircuit() {
    if (!isEulerian) return [];

    // Make a copy of adjacency list
    const adjCopy = new Map();
    adjacency.forEach((neighbors, nodeId) => {
        adjCopy.set(nodeId, [...neighbors]);
    });

    const circuit = [];
    const stack = [nodes[0].id]; // Start from first node

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = adjCopy.get(current);

        if (neighbors.length === 0) {
            circuit.push(stack.pop());
        } else {
            const next = neighbors.pop();

            // Remove edge from both directions
            const nextNeighbors = adjCopy.get(next);
            const idx = nextNeighbors.indexOf(current);
            if (idx !== -1) {
                nextNeighbors.splice(idx, 1);
            }

            stack.push(next);
        }
    }

    return circuit.reverse();
}

// Animate Euler Circuit
async function animateEulerCircuit() {
    if (isRunning || !isEulerian) return;

    isRunning = true;
    startBtn.disabled = true;
    checkBtn.disabled = true;
    generateBtn.disabled = true;

    // Reset
    edges.forEach(e => e.visited = false);
    edgeElements.forEach(({ line }) => {
        line.classList.remove('visited', 'current');
    });
    nodeElements.forEach(({ circle }) => {
        circle.classList.remove('current', 'visited');
    });
    pathList.innerHTML = '';

    // Find Euler circuit
    eulerCircuit = findEulerCircuit();

    if (eulerCircuit.length === 0) {
        statusText.textContent = '无法找到欧拉回路!';
        isRunning = false;
        startBtn.disabled = false;
        checkBtn.disabled = false;
        generateBtn.disabled = false;
        return;
    }

    statusText.textContent = '开始修复路径规划...';

    // Animate
    for (let i = 0; i < eulerCircuit.length - 1; i++) {
        const current = eulerCircuit[i];
        const next = eulerCircuit[i + 1];

        // Highlight current node
        const currentNode = nodeElements.get(current);
        currentNode.circle.classList.add('current');

        // Add to path list
        const pathNode = document.createElement('div');
        pathNode.className = 'path-node';
        pathNode.textContent = nodes.find(n => n.id === current).name;
        pathList.appendChild(pathNode);

        // Highlight edge
        const edgeId = `${Math.min(current, next)}-${Math.max(current, next)}`;
        const edgeEl = edgeElements.find(e => e.edge.id === edgeId);

        if (edgeEl) {
            edgeEl.line.classList.add('current');
            edgeEl.edge.visited = true;

            const currentName = nodes.find(n => n.id === current).name;
            const nextName = nodes.find(n => n.id === next).name;
            statusText.textContent = `修复: ${currentName} → ${nextName}`;
            await sleep(getDelay());

            edgeEl.line.classList.remove('current');
            edgeEl.line.classList.add('visited');
        }

        currentNode.circle.classList.remove('current');
        currentNode.circle.classList.add('visited');

        updateStats();
    }

    // Final node
    const finalNode = eulerCircuit[eulerCircuit.length - 1];
    const pathNode = document.createElement('div');
    pathNode.className = 'path-node';
    pathNode.textContent = nodes.find(n => n.id === finalNode).name;
    pathList.appendChild(pathNode);

    statusText.textContent = `修复路径规划完成! 共走${eulerCircuit.length}个点, ${edges.length}条通道`;

    isRunning = false;
    startBtn.disabled = false;
    checkBtn.disabled = false;
    generateBtn.disabled = false;
}

// Reset
function reset() {
    edges.forEach(e => e.visited = false);
    edgeElements.forEach(({ line }) => {
        line.classList.remove('visited', 'current');
    });
    nodeElements.forEach(({ circle }) => {
        circle.classList.remove('current', 'visited');
    });
    pathList.innerHTML = '';
    eulerCircuit = [];

    updateStats();
    statusText.textContent = '已重置';
}

function resetEulerCheck() {
    connectivityStatus.textContent = '-';
    connectivityStatus.className = 'check-value';
    degreeStatus.textContent = '-';
    degreeStatus.className = 'check-value';
    eulerStatus.textContent = '未检测';
    eulerStatus.className = 'result-value';
    startBtn.disabled = true;
}

// Event Listeners
townSelect.addEventListener('change', () => {
    toggleCustomControls();
    generateGraph();
});

generateBtn.addEventListener('click', () => {
    if (townSelect.value === 'custom') {
        clearCustomGraph();
    } else {
        generateGraph();
    }
});

checkBtn.addEventListener('click', checkEulerianGraph);
startBtn.addEventListener('click', animateEulerCircuit);
resetBtn.addEventListener('click', reset);

// Custom edit mode listeners
addNodeMode.addEventListener('click', enterNodeMode);
addEdgeMode.addEventListener('click', enterEdgeMode);
clearGraph.addEventListener('click', clearCustomGraph);

// SVG canvas click
svg.addEventListener('click', handleSVGClick);

// Init
window.addEventListener('load', () => {
    toggleCustomControls();
    generateGraph();
});
