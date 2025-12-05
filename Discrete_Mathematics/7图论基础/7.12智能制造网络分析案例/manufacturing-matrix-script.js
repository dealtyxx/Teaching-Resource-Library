/**
 * 智能制造 - 网络结构分析
 * Smart Manufacturing Network Analysis (Graph Matrices)
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const matrixContainer = document.getElementById('matrixContainer');
const tabBtns = document.querySelectorAll('.tab-btn');
const optimizeBtn = document.getElementById('optimizeBtn');
const resetBtn = document.getElementById('resetBtn');
const nodeCountEl = document.getElementById('nodeCount');
const edgeCountEl = document.getElementById('edgeCount');
const densityEl = document.getElementById('density');

// State
let nodes = [];
let edges = [];
let currentTab = 'adjacency';
let isOptimized = false;
let nodeElements = new Map();
let edgeElements = new Map();
let matrixCells = new Map(); // key -> cell element

// Drag State
let isDragging = false;
let dragNodeId = null;
let dragOffset = { x: 0, y: 0 };

// Constants
const NODE_RADIUS = 18;

// Manufacturing Network Data Generators
const NODE_TYPES = [
    "原材料仓", "加工中心A", "加工中心B", "精加工单元",
    "装配线", "质检站", "包装区", "成品库", "AGV充电站", "废料回收"
];

// Helper Functions
function createSVGElement(type, attributes = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    return el;
}

// Initialize Graph
function initGraph() {
    generateRandomGraph();
    isOptimized = false;

    renderGraph();
    renderMatrix();
    updateStats();
    setupDragEvents();
}

function generateRandomGraph() {
    nodes = [];
    edges = [];

    // 1. Generate Nodes (5-8 nodes)
    const nodeCount = Math.floor(Math.random() * 4) + 5;
    const usedNames = new Set();

    for (let i = 0; i < nodeCount; i++) {
        let name;
        do {
            name = NODE_TYPES[Math.floor(Math.random() * NODE_TYPES.length)];
        } while (usedNames.has(name));
        usedNames.add(name);

        // Random position with padding
        const x = 100 + Math.random() * 700;
        const y = 80 + Math.random() * 300;

        nodes.push({ id: i, name: name, x: Math.round(x), y: Math.round(y) });
    }

    // 2. Generate Edges (Random connections)
    // Create a base path to ensure some flow
    for (let i = 0; i < nodeCount - 1; i++) {
        if (Math.random() > 0.3) { // 70% chance to follow sequence
            addEdge(i, i + 1);
        }
    }

    // Add random edges
    const extraEdges = Math.floor(nodeCount * 0.8);
    for (let i = 0; i < extraEdges; i++) {
        const u = Math.floor(Math.random() * nodeCount);
        const v = Math.floor(Math.random() * nodeCount);
        if (u !== v) {
            addEdge(u, v);
        }
    }
}

function addEdge(u, v) {
    if (edges.some(e => e.u === u && e.v === v)) return;

    edges.push({
        u,
        v,
        id: `e_${u}_${v}_${Date.now()}`,
        isNew: false
    });
}

// Setup Drag Events (Global mouse events)
function setupDragEvents() {
    svg.addEventListener('mousemove', handleDrag);
    svg.addEventListener('mouseup', handleDragEnd);
    svg.addEventListener('mouseleave', handleDragEnd);
}

function handleDragStart(e, node) {
    if (isOptimized) return; // Disable drag during optimization demo to keep layout clean
    isDragging = true;
    dragNodeId = node.id;

    const rect = svg.getBoundingClientRect();
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    dragOffset.x = svgP.x - node.x;
    dragOffset.y = svgP.y - node.y;

    nodeElements.get(node.id).g.classList.add('dragging');
    e.stopPropagation();
}

function handleDrag(e) {
    if (!isDragging || dragNodeId === null) return;

    const rect = svg.getBoundingClientRect();
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    const node = nodes.find(n => n.id === dragNodeId);
    if (node) {
        node.x = svgP.x - dragOffset.x;
        node.y = svgP.y - dragOffset.y;
        updateGraphPositions();
    }
}

function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    if (dragNodeId !== null) {
        nodeElements.get(dragNodeId).g.classList.remove('dragging');
    }
    dragNodeId = null;
}

function updateGraphPositions() {
    // Update Node Position
    nodes.forEach(node => {
        const el = nodeElements.get(node.id);
        el.g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
    });

    // Update Edge Positions
    edges.forEach(edge => {
        const uNode = nodes.find(n => n.id === edge.u);
        const vNode = nodes.find(n => n.id === edge.v);
        const el = edgeElements.get(edge.id);

        el.line.setAttribute('x1', uNode.x);
        el.line.setAttribute('y1', uNode.y);
        el.line.setAttribute('x2', vNode.x);
        el.line.setAttribute('y2', vNode.y);
    });
}

// Toggle Edge Logic (Adjacency)
function toggleEdge(u, v) {
    if (u === v) return; // No self-loops for this demo

    const existingIndex = edges.findIndex(e => e.u === u && e.v === v);

    if (existingIndex >= 0) {
        // Remove edge
        edges.splice(existingIndex, 1);
    } else {
        // Add edge
        const newId = `e_${u}_${v}_${Date.now()}`;
        edges.push({ u, v, id: newId, isNew: true });
    }

    renderGraph();
    renderMatrix();
    updateStats();
}

// Incidence Matrix Interaction
function updateEdgeEndpoint(edgeIndex, nodeIndex, role) {
    const edge = edges[edgeIndex];
    if (!edge) return;

    if (role === 'source') {
        // Set nodeIndex as new Source (u)
        if (edge.u === nodeIndex) return; // Already source
        edge.u = nodeIndex;
    } else if (role === 'target') {
        // Set nodeIndex as new Target (v)
        if (edge.v === nodeIndex) return; // Already target
        edge.v = nodeIndex;
    }

    renderGraph();
    renderMatrix();
    updateStats();
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

        const line = createSVGElement('line', {
            x1: uNode.x, y1: uNode.y,
            x2: vNode.x, y2: vNode.y,
            class: 'edge-line'
        });

        if (edge.isNew) line.classList.add('active');

        edgesGroup.appendChild(line);
        edgeElements.set(edge.id, { line, edge });
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

        const text = createSVGElement('text', {
            class: 'node-text',
            'text-anchor': 'middle',
            'dy': '2.5em'
        });
        text.textContent = node.name;

        const idText = createSVGElement('text', {
            class: 'node-text',
            'text-anchor': 'middle',
            'dy': '.35em',
            'fill': '#fff'
        });
        idText.textContent = node.id;

        g.appendChild(circle);
        g.appendChild(text);
        g.appendChild(idText);
        nodesGroup.appendChild(g);

        // Hover events for graph -> matrix
        g.addEventListener('mouseenter', () => highlightFromGraph(node.id, 'node'));
        g.addEventListener('mouseleave', clearHighlights);

        // Drag events
        g.addEventListener('mousedown', (e) => handleDragStart(e, node));

        nodeElements.set(node.id, { g, circle });
    });

    // Edge Hover events
    edgeElements.forEach(({ line, edge }, id) => {
        line.addEventListener('mouseenter', () => highlightFromGraph(id, 'edge'));
        line.addEventListener('mouseleave', clearHighlights);
    });
}

// Render Matrix
function renderMatrix() {
    matrixContainer.innerHTML = '';
    matrixCells.clear();

    if (currentTab === 'adjacency') {
        renderAdjacencyMatrix();
    } else {
        renderIncidenceMatrix();
    }
}

function renderAdjacencyMatrix() {
    const n = nodes.length;
    matrixContainer.style.gridTemplateColumns = `40px repeat(${n}, 40px)`;

    // Header Row
    matrixContainer.appendChild(createHeaderCell(''));
    nodes.forEach(node => {
        matrixContainer.appendChild(createHeaderCell(`V${node.id}`));
    });

    // Matrix Rows
    nodes.forEach((rowNode, i) => {
        // Row Header
        matrixContainer.appendChild(createHeaderCell(`V${rowNode.id}`));

        nodes.forEach((colNode, j) => {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell editable'; // Add editable class

            // Check connection
            const edge = edges.find(e => e.u === i && e.v === j);
            const hasConnection = !!edge;

            cell.textContent = hasConnection ? '1' : '0';
            if (hasConnection) {
                cell.classList.add('active');
                cell.dataset.edgeId = edge.id;
            }

            cell.dataset.row = i;
            cell.dataset.col = j;

            // Hover events for matrix -> graph
            cell.addEventListener('mouseenter', () => highlightFromMatrix(i, j, edge?.id));
            cell.addEventListener('mouseleave', clearHighlights);

            // Click event for editing
            cell.addEventListener('click', () => toggleEdge(i, j));

            matrixContainer.appendChild(cell);
            matrixCells.set(`adj-${i}-${j}`, cell);
        });
    });
}

function renderIncidenceMatrix() {
    const n = nodes.length;
    const m = edges.length;
    matrixContainer.style.gridTemplateColumns = `40px repeat(${m}, 40px)`;

    // Header Row (Edges)
    matrixContainer.appendChild(createHeaderCell(''));
    edges.forEach((edge, i) => {
        matrixContainer.appendChild(createHeaderCell(`E${i}`));
    });

    // Matrix Rows (Nodes)
    nodes.forEach((node, i) => {
        // Row Header
        matrixContainer.appendChild(createHeaderCell(`V${node.id}`));

        edges.forEach((edge, j) => {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell editable'; // Editable

            let val = '0';
            if (edge.u === i) val = '1'; // Outgoing
            else if (edge.v === i) val = '-1'; // Incoming
            if (edge.u === i && edge.v === i) val = '2'; // Self-loop

            cell.textContent = val;
            if (val !== '0') {
                cell.classList.add('active');
                cell.dataset.edgeId = edge.id;
            }

            cell.dataset.row = i;
            cell.dataset.col = j;

            // Hover events
            cell.addEventListener('mouseenter', () => highlightFromMatrix(i, null, edge.id));
            cell.addEventListener('mouseleave', clearHighlights);

            // Interaction: Left Click (Set Source/1), Right Click (Set Target/-1)
            cell.addEventListener('click', () => updateEdgeEndpoint(j, i, 'source'));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                updateEdgeEndpoint(j, i, 'target');
            });

            matrixContainer.appendChild(cell);
            matrixCells.set(`inc-${i}-${j}`, cell);
        });
    });
}

function createHeaderCell(text) {
    const div = document.createElement('div');
    div.className = 'matrix-header-cell';
    div.textContent = text;
    return div;
}

// Interaction Logic
function highlightFromMatrix(rowId, colId, edgeId) {
    // Highlight Graph
    if (rowId !== null) nodeElements.get(rowId).circle.classList.add('active');
    if (colId !== null && currentTab === 'adjacency') nodeElements.get(colId).circle.classList.add('active');

    if (edgeId) {
        edgeElements.get(edgeId).line.classList.add('active');
    }

    // Highlight Matrix Row/Col
    matrixCells.forEach((cell, key) => {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);

        if (r === rowId) cell.classList.add('highlight-row');
        if (currentTab === 'adjacency' && c === colId) cell.classList.add('highlight-col');
        if (currentTab === 'incidence' && c === edges.findIndex(e => e.id === edgeId)) cell.classList.add('highlight-col');
    });
}

function highlightFromGraph(id, type) {
    if (isDragging) return; // Don't highlight while dragging to avoid flicker

    if (type === 'node') {
        nodeElements.get(id).circle.classList.add('active');

        // Highlight Matrix Row
        matrixCells.forEach((cell) => {
            if (parseInt(cell.dataset.row) === id) cell.classList.add('highlight-row');
            if (currentTab === 'adjacency' && parseInt(cell.dataset.col) === id) cell.classList.add('highlight-col');
        });
    } else if (type === 'edge') {
        const edge = edges.find(e => e.id === id);
        if (edge) {
            edgeElements.get(id).line.classList.add('active');
            nodeElements.get(edge.u).circle.classList.add('active');
            nodeElements.get(edge.v).circle.classList.add('active');

            // Highlight Matrix Cell(s)
            if (currentTab === 'adjacency') {
                const cell = matrixCells.get(`adj-${edge.u}-${edge.v}`);
                if (cell) cell.classList.add('active', 'highlight-row', 'highlight-col');
            } else {
                const edgeIdx = edges.findIndex(e => e.id === id);
                matrixCells.forEach(cell => {
                    if (parseInt(cell.dataset.col) === edgeIdx) cell.classList.add('highlight-col');
                });
            }
        }
    }
}

function clearHighlights() {
    nodeElements.forEach(el => el.circle.classList.remove('active'));
    edgeElements.forEach(el => {
        // Keep active if it's a new optimized edge
        if (!el.edge.isNew) el.line.classList.remove('active');
    });

    document.querySelectorAll('.matrix-cell').forEach(cell => {
        cell.classList.remove('highlight-row', 'highlight-col');
    });
}

function updateStats() {
    nodeCountEl.textContent = nodes.length;
    edgeCountEl.textContent = edges.length;

    const maxEdges = nodes.length * (nodes.length - 1); // Directed
    const density = edges.length / maxEdges;
    densityEl.textContent = density.toFixed(2);
}

// Optimization Logic
function optimizeNetwork() {
    if (isOptimized) return;
    isOptimized = true;

    // Add a shortcut edge between two random unconnected nodes
    // Find unconnected pair
    let u, v;
    let found = false;
    for (let i = 0; i < 100; i++) { // Try 100 times
        u = Math.floor(Math.random() * nodes.length);
        v = Math.floor(Math.random() * nodes.length);
        if (u !== v && !edges.some(e => e.u === u && e.v === v)) {
            found = true;
            break;
        }
    }

    if (found) {
        const newId = `e_opt_${Date.now()}`;
        edges.push({ u, v, id: newId, isNew: true });

        renderGraph();
        renderMatrix();
        updateStats();

        // Animate the new edge
        setTimeout(() => {
            highlightFromGraph(newId, 'edge');
        }, 100);
    } else {
        alert("网络已饱和，无法添加优化路径");
    }
}

// Event Listeners
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        renderMatrix();
    });
});

optimizeBtn.addEventListener('click', optimizeNetwork);
resetBtn.addEventListener('click', initGraph);

// Init
window.addEventListener('load', () => {
    initGraph();
});
