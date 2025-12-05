/**
 * 红色足迹 - 欧拉回路探索
 * Revolutionary Journey - Euler Path Explorer
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const pathList = document.getElementById('pathList');
const algorithmSelect = document.getElementById('algorithmSelect');
const nodeCountDisplay = document.getElementById('nodeCount');
const edgeCountDisplay = document.getElementById('edgeCount');
const conceptInfo = document.getElementById('conceptInfo');

// State
let nodes = [];
let edges = [];
let adjacencyList = new Map();
let isRunning = false;
let shouldStop = false;
let currentGraphType = 'euler-circuit';
let nodeElements = new Map();
let edgeElements = new Map();
let visitedEdges = new Set();

// Constants
const NODE_RADIUS = 35;
const REVOLUTIONARY_SITES = [
    { name: "上海", meaning: "中共一大" },
    { name: "嘉兴", meaning: "红船精神" },
    { name: "井冈山", meaning: "革命摇篮" },
    { name: "瑞金", meaning: "红色政权" },
    { name: "遵义", meaning: "伟大转折" },
    { name: "泸定桥", meaning: "飞夺天险" },
    { name: "延安", meaning: "革命圣地" },
    { name: "西柏坡", meaning: "进京赶考" },
    { name: "北京", meaning: "新中国" },
    { name: "南昌", meaning: "八一起义" }
];

// Graph Type Info
const GRAPH_INFO = {
    'euler-circuit': {
        title: '欧拉回路',
        description: '从任意顶点出发,经过每条边恰好一次,最终回到起点的闭合回路。',
        condition: '所有顶点的度数均为偶数。',
        meaning: '象征革命道路的完整性与必然性,从人民中来,到人民中去。'
    },
    'euler-path': {
        title: '欧拉通路',
        description: '从某一顶点出发,经过每条边恰好一次,到达另一顶点(不回到起点)。',
        condition: '恰有两个顶点的度数为奇数(起点和终点)。',
        meaning: '体现革命征程的起点与终点,从旧中国走向新中国。'
    },
    'semi-euler': {
        title: '半欧拉图',
        description: '存在欧拉通路但不存在欧拉回路的图。',
        condition: '恰有2个奇数度顶点,其余为偶数度。',
        meaning: '代表革命道路的曲折性,有起点有终点,但不回头。'
    },
    'non-euler': {
        title: '非欧拉图',
        description: '既不存在欧拉回路也不存在欧拉通路的图。',
        condition: '有3个及以上奇数度顶点。',
        meaning: '用于对比学习,理解欧拉图的特殊性与科学性。'
    }
};

// Helper: Create SVG Element
function createSVGElement(type, attributes = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    return el;
}

// Helper: Sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDelay() {
    const val = parseInt(speedInput.value);
    return Math.max(50, 1000 - (val * 10));
}

// Update Info Panel
function updateConceptInfo(type) {
    const info = GRAPH_INFO[type];
    conceptInfo.innerHTML = `
        <p><strong>${info.title}:</strong> ${info.description}</p>
        <p><strong>判定条件:</strong> ${info.condition}</p>
        <p><strong>思政寓意:</strong> ${info.meaning}</p>
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
    
    switch(type) {
        case 'euler-circuit':
            generateEulerCircuit(centerX, centerY);
            break;
        case 'euler-path':
            generateEulerPath(centerX, centerY);
            break;
        case 'semi-euler':
            generateSemiEuler(centerX, centerY);
            break;
        case 'non-euler':
            generateNonEuler(centerX, centerY);
            break;
    }
    
    buildAdjacencyList();
    renderGraph();
    resetState();
    updateStats();
}

// Generate Euler Circuit (所有顶点度数为偶数)
function generateEulerCircuit(cx, cy) {
    const count = 6;
    const radius = Math.min(cx, cy) * 0.6;
    
    // Create nodes in a circle
    for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI / count) - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        
        nodes.push({
            id: i,
            name: REVOLUTIONARY_SITES[i].name,
            meaning: REVOLUTIONARY_SITES[i].meaning,
            x, y
        });
    }
    
    // Create edges to ensure all vertices have even degree
    // Each vertex connects to its two neighbors + across connections
    for (let i = 0; i < count; i++) {
        // Connect to next vertex (ring)
        addEdge(i, (i + 1) % count);
        // Connect to vertex 2 steps away (every other vertex has degree 4)
        if (i % 2 === 0) {
            addEdge(i, (i + 2) % count);
        }
    }
}

// Generate Euler Path (恰有2个奇数度顶点)
function generateEulerPath(cx, cy) {
    const count = 6;
    const radius = Math.min(cx, cy) * 0.6;
    
    // Create nodes in a circle
    for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI / count) - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        
        nodes.push({
            id: i,
            name: REVOLUTIONARY_SITES[i].name,
            meaning: REVOLUTIONARY_SITES[i].meaning,
            x, y
        });
    }
    
    // Create edges: make vertices 0 and 3 have odd degree
    for (let i = 0; i < count; i++) {
        addEdge(i, (i + 1) % count);
    }
    // Additional edges to make most vertices even degree except 0 and 3
    addEdge(1, 4);
    addEdge(2, 5);
    // Vertices 0 and 3 now have degree 3 (odd), others have degree 4 (even)
}

// Generate Semi-Euler (same as Euler Path for this example)
function generateSemiEuler(cx, cy) {
    generateEulerPath(cx, cy); // Same as Euler path
}

// Generate Non-Euler (多个奇数度顶点)
function generateNonEuler(cx, cy) {
    const count = 6;
    const radius = Math.min(cx, cy) * 0.6;
    
    for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI / count) - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        
        nodes.push({
            id: i,
            name: REVOLUTIONARY_SITES[i].name,
            meaning: REVOLUTIONARY_SITES[i].meaning,
            x, y
        });
    }
    
    // Create edges to have multiple odd-degree vertices
    addEdge(0, 1);
    addEdge(1, 2);
    addEdge(2, 3);
    addEdge(3, 4);
    addEdge(4, 5);
    addEdge(0, 3); // Vertices 0,2,3,5 have odd degree
}

function addEdge(u, v) {
    edges.push({ u, v, id: `${u}-${v}` });
}

function buildAdjacencyList() {
    adjacencyList.clear();
    nodes.forEach(node => adjacencyList.set(node.id, []));
    
    edges.forEach(edge => {
        adjacencyList.get(edge.u).push({ to: edge.v, edgeId: edge.id });
        adjacencyList.get(edge.v).push({ to: edge.u, edgeId: edge.id });
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
        edgeElements.set(`${edge.v}-${edge.u}`, line); // Bidirectional
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
            'dy': '.3em'
        });
        text.textContent = node.name;
        
        // Add degree badge
        const degree = adjacencyList.get(node.id).length;
        const badgeBg = createSVGElement('circle', {
            cx: NODE_RADIUS - 10,
            cy: -NODE_RADIUS + 10,
            r: 10,
            class: 'degree-badge-bg'
        });
        
        const badgeText = createSVGElement('text', {
            x: NODE_RADIUS - 10,
            y: -NODE_RADIUS + 10,
            class: 'degree-badge',
            'text-anchor': 'middle',
            'dy': '.3em'
        });
        badgeText.textContent = degree;
        
        g.appendChild(circle);
        g.appendChild(text);
        g.appendChild(badgeBg);
        g.appendChild(badgeText);
        nodesGroup.appendChild(g);
        nodeElements.set(node.id, g);
    });
}

function updateStats() {
    nodeCountDisplay.textContent = nodes.length;
    edgeCountDisplay.textContent = edges.length;
}

// Path Display
function addToPath(nodeId) {
    const item = document.createElement('div');
    item.className = 'path-item';
    item.textContent = nodes[nodeId].name;
    pathList.appendChild(item);
}

function clearPath() {
    pathList.innerHTML = '';
}

// Reset State
function resetState() {
    visitedEdges.clear();
    clearPath();
    
    nodeElements.forEach(el => {
        el.classList.remove('visited', 'current', 'start');
    });
    
    edgeElements.forEach(el => {
        el.classList.remove('visited', 'current');
    });
    
    statusText.textContent = '准备就绪';
}

// Check if graph has Euler Circuit/Path
function checkEulerProperty() {
    let oddDegreeCount = 0;
    let oddVertices = [];
    
    nodes.forEach(node => {
        const degree = adjacencyList.get(node.id).length;
        if (degree % 2 !== 0) {
            oddDegreeCount++;
            oddVertices.push(node.id);
        }
    });
    
    if (oddDegreeCount === 0) {
        return { type: 'circuit', start: 0 };
    } else if (oddDegreeCount === 2) {
        return { type: 'path', start: oddVertices[0], end: oddVertices[1] };
    } else {
        return { type: 'none', oddCount: oddDegreeCount };
    }
}

// Fleury's Algorithm
async function fleuryAlgorithm(startNode) {
    statusText.textContent = '使用Fleury算法探索...';
    
    const tempEdges = new Set(edges.map(e => e.id));
    const tempAdj = new Map();
    
    // Deep copy adjacency list
    adjacencyList.forEach((neighbors, nodeId) => {
        tempAdj.set(nodeId, [...neighbors]);
    });
    
    let currentNode = startNode;
    const path = [currentNode];
    
    // Mark start
    const startEl = nodeElements.get(currentNode);
    startEl.classList.add('current');
    addToPath(currentNode);
    await sleep(getDelay());
    
    while (tempAdj.get(currentNode).length > 0) {
        if (shouldStop) break;
        
        const neighbors = tempAdj.get(currentNode);
        let nextEdge = null;
        let nextNode = null;
        
        // Try to find a non-bridge edge
        for (const neighbor of neighbors) {
            const edgeId = neighbor.edgeId;
            if (!isBridge(currentNode, neighbor.to, tempAdj, tempEdges)) {
                nextEdge = edgeId;
                nextNode = neighbor.to;
                break;
            }
        }
        
        // If all edges are bridges, take any edge
        if (nextEdge === null) {
            nextEdge = neighbors[0].edgeId;
            nextNode = neighbors[0].to;
        }
        
        // Traverse edge
        const edgeEl = edgeElements.get(nextEdge);
        edgeEl.classList.add('current');
        await sleep(getDelay() / 2);
        
        edgeEl.classList.remove('current');
        edgeEl.classList.add('visited');
        visitedEdges.add(nextEdge);
        
        // Remove edge from temp graph
        removeEdge(tempAdj, currentNode, nextNode, nextEdge);
        tempEdges.delete(nextEdge);
        
        // Move to next node
        const prevEl = nodeElements.get(currentNode);
        prevEl.classList.remove('current');
        prevEl.classList.add('visited');
        
        currentNode = nextNode;
        path.push(currentNode);
        addToPath(currentNode);
        
        const nextEl = nodeElements.get(currentNode);
        nextEl.classList.add('current');
        
        statusText.textContent = `访问: ${nodes[currentNode].name} (${nodes[currentNode].meaning})`;
        await sleep(getDelay());
    }
    
    const finalEl = nodeElements.get(currentNode);
    finalEl.classList.remove('current');
    finalEl.classList.add('visited');
    
    return path;
}

// Check if edge is a bridge using DFS
function isBridge(u, v, tempAdj, tempEdges) {
    // Temporarily remove edge and check connectivity
    const edgeId = findEdgeId(u, v);
    const tempAdjCopy = new Map();
    
    tempAdj.forEach((neighbors, nodeId) => {
        tempAdjCopy.set(nodeId, neighbors.filter(n => n.edgeId !== edgeId));
    });
    
    // DFS from u, check if we can reach v
    const visited = new Set();
    const stack = [u];
    visited.add(u);
    
    while (stack.length > 0) {
        const node = stack.pop();
        if (node === v) return false; // Can still reach v, not a bridge
        
        for (const neighbor of tempAdjCopy.get(node)) {
            if (!visited.has(neighbor.to)) {
                visited.add(neighbor.to);
                stack.push(neighbor.to);
            }
        }
    }
    
    return true; // Cannot reach v, it's a bridge
}

function findEdgeId(u, v) {
    return `${Math.min(u, v)}-${Math.max(u, v)}`;
}

function removeEdge(adj, u, v, edgeId) {
    adj.set(u, adj.get(u).filter(n => n.edgeId !== edgeId));
    adj.set(v, adj.get(v).filter(n => n.edgeId !== edgeId));
}

// Hierholzer's Algorithm
async function hierholzerAlgorithm(startNode) {
    statusText.textContent = '使用Hierholzer算法探索...';
    
    const tempAdj = new Map();
    adjacencyList.forEach((neighbors, nodeId) => {
        tempAdj.set(nodeId, [...neighbors]);
    });
    
    const stack = [startNode];
    const circuit = [];
    
    // Mark start
    let currentNode = startNode;
    const startEl = nodeElements.get(currentNode);
    startEl.classList.add('current');
    addToPath(currentNode);
    await sleep(getDelay());
    
    while (stack.length > 0) {
        if (shouldStop) break;
        
        currentNode = stack[stack.length - 1];
        const neighbors = tempAdj.get(currentNode);
        
        if (neighbors.length > 0) {
            // Take an edge
            const neighbor = neighbors[0];
            const nextNode = neighbor.to;
            const edgeId = neighbor.edgeId;
            
            // Visualize
            const edgeEl = edgeElements.get(edgeId);
            edgeEl.classList.add('current');
            await sleep(getDelay() / 2);
            
            edgeEl.classList.remove('current');
            edgeEl.classList.add('visited');
            visitedEdges.add(edgeId);
            
            // Remove edge
            removeEdge(tempAdj, currentNode, nextNode, edgeId);
            
            // Move to next node
            const prevEl = nodeElements.get(currentNode);
            prevEl.classList.remove('current');
            prevEl.classList.add('visited');
            
            stack.push(nextNode);
            const nextEl = nodeElements.get(nextNode);
            nextEl.classList.add('current');
            addToPath(nextNode);
            
            statusText.textContent = `访问: ${nodes[nextNode].name} (${nodes[nextNode].meaning})`;
            await sleep(getDelay());
        } else {
            // Backtrack
            circuit.push(stack.pop());
        }
    }
    
    return circuit.reverse();
}

// Main Algorithm Runner
async function runEulerAlgorithm() {
    if (isRunning) return;
    
    isRunning = true;
    shouldStop = false;
    startBtn.disabled = true;
    
    resetState();
    
    const eulerCheck = checkEulerProperty();
    
    if (eulerCheck.type === 'none') {
        statusText.textContent = `该图有${eulerCheck.oddCount}个奇数度顶点,不存在欧拉回路或通路`;
        isRunning = false;
        startBtn.disabled = false;
        return;
    }
    
    const startNode = eulerCheck.start;
    const algorithm = algorithmSelect.value;
    
    let path;
    if (algorithm === 'fleury') {
        path = await fleuryAlgorithm(startNode);
    } else {
        path = await hierholzerAlgorithm(startNode);
    }
    
    if (!shouldStop) {
        statusText.textContent = eulerCheck.type === 'circuit' 
            ? '欧拉回路探索完成! 革命之路圆满闭环!' 
            : '欧拉通路探索完成! 从起点到终点,革命征程胜利!';
    } else {
        statusText.textContent = '探索已暂停';
    }
    
    isRunning = false;
    startBtn.disabled = false;
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

startBtn.addEventListener('click', runEulerAlgorithm);

resetBtn.addEventListener('click', () => {
    shouldStop = true;
    setTimeout(() => {
        isRunning = false;
        resetState();
        startBtn.disabled = false;
    }, 100);
});

// Init
window.addEventListener('load', () => {
    updateConceptInfo(currentGraphType);
    generateGraphByType(currentGraphType);
});
