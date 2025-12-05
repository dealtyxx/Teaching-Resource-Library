/**
 * 灾害响应 - 救援调度系统
 * Disaster Response Rescue Scheduling (Dijkstra's Algorithm)
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const coveredCountEl = document.getElementById('coveredCount');
const currentNodeEl = document.getElementById('currentNode');
const distanceTableBody = document.querySelector('#distanceTable tbody');
const nodeInfoPopup = document.getElementById('nodeInfoPopup');
const popupTitle = document.getElementById('popupTitle');
const popupDesc = document.getElementById('popupDesc');

// State
let nodes = [];
let edges = [];
let adjacencyList = new Map();
let isRunning = false;
let distances = {};
let previous = {};
let visited = new Set();
let nodeElements = new Map();
let edgeElements = new Map(); // id -> {line, labelBg, label}

// Constants
const NODE_RADIUS = 20;
const INF = 999;

// Disaster Response Nodes
const RESCUE_NODES = [
    { id: 0, name: "救援中心", desc: "应急指挥调度中心", type: "center", x: 400, y: 300, icon: "🏥" },
    { id: 1, name: "A区", desc: "受灾小区 (积水严重)", type: "target", x: 250, y: 150, icon: "🏢" },
    { id: 2, name: "B区", desc: "受灾小区 (电力中断)", type: "target", x: 550, y: 150, icon: "🏢" },
    { id: 3, name: "C区", desc: "受灾小区 (人员被困)", type: "target", x: 150, y: 300, icon: "🆘" },
    { id: 4, name: "D区", desc: "受灾小区 (道路受阻)", type: "target", x: 650, y: 300, icon: "🚧" },
    { id: 5, name: "E区", desc: "受灾小区 (物资短缺)", type: "target", x: 250, y: 450, icon: "📦" },
    { id: 6, name: "F区", desc: "受灾小区 (通讯中断)", type: "target", x: 550, y: 450, icon: "📡" },
    { id: 7, name: "G区", desc: "临时安置点", type: "target", x: 400, y: 550, icon: "⛺" },
    { id: 8, name: "H区", desc: "医疗救护点", type: "target", x: 400, y: 50, icon: "🚑" }
];

// Weighted Edges (Time in minutes)
const RESCUE_EDGES = [
    { u: 0, v: 1, weight: 15 },
    { u: 0, v: 2, weight: 20 },
    { u: 0, v: 3, weight: 25 },
    { u: 0, v: 4, weight: 30 },
    { u: 0, v: 5, weight: 18 },
    { u: 0, v: 6, weight: 22 },
    { u: 1, v: 3, weight: 10 },
    { u: 1, v: 8, weight: 12 },
    { u: 2, v: 4, weight: 15 },
    { u: 2, v: 8, weight: 18 },
    { u: 3, v: 5, weight: 14 },
    { u: 4, v: 6, weight: 16 },
    { u: 5, v: 7, weight: 20 },
    { u: 6, v: 7, weight: 25 },
    { u: 1, v: 2, weight: 35 } // A-B connection
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
    nodes = [...RESCUE_NODES];
    edges = [...RESCUE_EDGES];
    adjacencyList.clear();

    // Build Adjacency List
    nodes.forEach(n => adjacencyList.set(n.id, []));
    edges.forEach(e => {
        adjacencyList.get(e.u).push({ to: e.v, weight: e.weight, id: getEdgeId(e.u, e.v) });
        adjacencyList.get(e.v).push({ to: e.u, weight: e.weight, id: getEdgeId(e.u, e.v) });
    });

    renderGraph();
    initDistanceTable();
    updateStats(0, "-");
}

function getEdgeId(u, v) {
    return `${Math.min(u, v)}-${Math.max(u, v)}`;
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
        const edgeId = getEdgeId(edge.u, edge.v);

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
            class: `node-circle ${node.type}`
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

        // Distance label
        const distText = createSVGElement('text', {
            class: 'node-dist',
            'text-anchor': 'middle',
            'dy': '-1.8em'
        });
        distText.textContent = "∞";

        g.appendChild(circle);
        g.appendChild(icon);
        g.appendChild(text);
        g.appendChild(distText);
        nodesGroup.appendChild(g);

        // Hover events
        g.addEventListener('mouseenter', (e) => showPopup(e, node));
        g.addEventListener('mouseleave', hidePopup);

        nodeElements.set(node.id, { g, circle, distText });
    });
}

function initDistanceTable() {
    distanceTableBody.innerHTML = '';
    nodes.forEach(node => {
        const tr = document.createElement('tr');
        tr.id = `row-${node.id}`;
        tr.innerHTML = `
            <td>${node.name}</td>
            <td class="dist-val">∞</td>
            <td class="status-val">等待</td>
        `;
        distanceTableBody.appendChild(tr);
    });
}

function updateTable(id, dist, status, isCurrent = false) {
    const tr = document.getElementById(`row-${id}`);
    if (!tr) return;

    const distCell = tr.querySelector('.dist-val');
    const statusCell = tr.querySelector('.status-val');

    if (dist !== undefined) distCell.textContent = dist === INF ? '∞' : dist + '分';
    if (status !== undefined) statusCell.textContent = status;

    if (isCurrent) {
        tr.classList.add('active');
        tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        tr.classList.remove('active');
    }

    if (status === '已确认') {
        tr.classList.add('visited');
    }
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

function updateStats(count, current) {
    coveredCountEl.textContent = `${count}/${nodes.length}`;
    currentNodeEl.textContent = current;
}

// Dijkstra Algorithm
async function runDijkstra() {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;
    resetGraph();

    // Init
    nodes.forEach(n => {
        distances[n.id] = INF;
        previous[n.id] = null;
    });
    distances[0] = 0; // Start node (Rescue Center)

    updateNodeDist(0, 0);
    updateTable(0, 0, '起点');

    let unvisited = new Set(nodes.map(n => n.id));

    statusText.textContent = "救援调度开始，计算最短路径...";

    while (unvisited.size > 0) {
        // Find min distance node in unvisited
        let minNode = null;
        let minDist = Infinity;

        for (let id of unvisited) {
            if (distances[id] < minDist) {
                minDist = distances[id];
                minNode = id;
            }
        }

        if (minNode === null || minDist === INF) break; // Remaining nodes unreachable

        unvisited.delete(minNode);
        visited.add(minNode);

        // Visual Update: Current Node
        const currentName = nodes.find(n => n.id === minNode).name;
        statusText.textContent = `当前处理: ${currentName} (累计耗时 ${minDist}分)`;
        updateStats(visited.size, currentName);

        const nodeEl = nodeElements.get(minNode);
        nodeEl.circle.classList.add('current');
        updateTable(minNode, minDist, '处理中', true);

        await sleep(getDelay());

        // Relax neighbors
        const neighbors = adjacencyList.get(minNode);
        for (let neighbor of neighbors) {
            if (visited.has(neighbor.to)) continue;

            const edgeEl = edgeElements.get(neighbor.id);
            edgeEl.line.classList.add('scanning');

            const alt = distances[minNode] + neighbor.weight;
            if (alt < distances[neighbor.to]) {
                distances[neighbor.to] = alt;
                previous[neighbor.to] = minNode;

                updateNodeDist(neighbor.to, alt);
                updateTable(neighbor.to, alt, '更新');

                statusText.textContent = `发现更优路径 -> ${nodes[neighbor.to].name}`;
                await sleep(getDelay() / 2);
            }

            edgeEl.line.classList.remove('scanning');
        }

        nodeEl.circle.classList.remove('current');
        nodeEl.circle.classList.add('visited');
        updateTable(minNode, minDist, '已确认', false);

        // Highlight path to this node
        if (previous[minNode] !== null) {
            const edgeId = getEdgeId(previous[minNode], minNode);
            edgeElements.get(edgeId).line.classList.add('path');
        }
    }

    statusText.textContent = "所有区域最短路径计算完成!";
    currentNodeEl.textContent = "完成";
    isRunning = false;
    startBtn.disabled = false;
}

function updateNodeDist(id, dist) {
    const el = nodeElements.get(id);
    el.distText.textContent = dist + "分";
}

function resetGraph() {
    visited.clear();
    distances = {};
    previous = {};

    nodeElements.forEach(el => {
        el.circle.classList.remove('visited', 'current');
        el.distText.textContent = "∞";
    });

    edgeElements.forEach(el => {
        el.line.classList.remove('path', 'scanning');
    });

    initDistanceTable();
    updateStats(0, "-");
}

// Event Listeners
startBtn.addEventListener('click', runDijkstra);
resetBtn.addEventListener('click', () => {
    resetGraph();
    statusText.textContent = "系统已重置";
});

// Init
window.addEventListener('load', () => {
    initGraph();
});
