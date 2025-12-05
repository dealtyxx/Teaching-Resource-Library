/**
 * 智慧城市综合管理系统
 * Smart City Integrated Management System
 */

// DOM Elements
const svg = document.getElementById('citySvg');
const nodesGroup = document.getElementById('nodesGroup');
const edgesGroup = document.getElementById('edgesGroup');
const navBtns = document.querySelectorAll('.nav-btn');
const modeControls = document.querySelectorAll('.mode-specific-controls');
const legendGrid = document.getElementById('legendGrid');
const logList = document.getElementById('logList');
const themeTitle = document.getElementById('themeTitle');
const themeText = document.getElementById('themeText');
const metricLabel = document.getElementById('metricLabel');
const metricValue = document.getElementById('metricValue');
const nodeCountEl = document.getElementById('nodeCount');
const edgeCountEl = document.getElementById('edgeCount');
const guideText = document.getElementById('guideText');
const tooltip = document.getElementById('tooltip');

// State
let currentMode = 'traffic'; // traffic, manufacturing, emergency
let nodes = [];
let edges = [];

// Constants
const NODE_COUNT = 15;
const WIDTH = svg.clientWidth || 800;
const HEIGHT = svg.clientHeight || 600;

// Theme Content
const THEMES = {
    traffic: {
        title: "以人为本 · 绿色发展",
        text: "坚持人民城市人民建，人民城市为人民。通过科学规划交通网络，减少拥堵与排放，构建宜居、韧性、智慧城市。",
        color: "#10b981",
        metric: "通行效率",
        guide: "请点击地图上的节点，将其标记为<b style='color:#ef4444'>交通拥堵</b>区域。系统将自动重新规划路线。"
    },
    manufacturing: {
        title: "新质生产力 · 工匠精神",
        text: "推动制造业高端化、智能化、绿色化发展。利用数字孪生技术优化生产网络，弘扬精益求精的工匠精神。",
        color: "#06b6d4",
        metric: "生产协同度",
        guide: "点击下方<b style='color:#06b6d4'>结构优化模拟</b>按钮，系统将自动分析并建立新的高效物流通道。"
    },
    emergency: {
        title: "生命至上 · 科学救援",
        text: "坚持人民至上、生命至上。构建全方位、立体化的城市安全网，确保灾害发生时救援通道畅通无阻。",
        color: "#f59e0b",
        metric: "响应速度",
        guide: "请点击地图上的任意节点模拟<b style='color:#f59e0b'>突发灾害</b>。系统将自动调度最近的救援中心 (N0/N4/N14)。"
    }
};

// Initialization
window.addEventListener('load', () => {
    initGraph();
    updateModeUI('traffic');
    startClock();
});

// Mode Switching
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode === currentMode) return;

        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.body.setAttribute('data-mode', mode);
        updateModeUI(mode);
    });
});

function updateModeUI(mode) {
    currentMode = mode;

    // Update Controls
    modeControls.forEach(el => el.classList.add('hidden'));
    document.getElementById(`${mode}Controls`).classList.remove('hidden');

    // Update Theme Box
    const theme = THEMES[mode];
    themeTitle.textContent = theme.title;
    themeText.innerHTML = `<p>${theme.text}</p>`;
    themeTitle.style.color = theme.color;
    metricLabel.textContent = theme.metric;
    guideText.innerHTML = theme.guide;

    // Update Legend
    updateLegend(mode);

    // Reset Graph Visuals for new mode
    resetGraphVisuals();

    addLog(`切换至 [${getModeName(mode)}] 模式`);
}

function getModeName(mode) {
    const names = { traffic: "交通治理", manufacturing: "智能制造", emergency: "应急指挥" };
    return names[mode];
}

// Graph Generation
function initGraph() {
    nodes = [];
    edges = [];

    // Generate Nodes (Grid-like but perturbed)
    const cols = 5;
    const rows = 3;
    const xStep = WIDTH / (cols + 1);
    const yStep = HEIGHT / (rows + 1);

    for (let i = 0; i < NODE_COUNT; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);

        nodes.push({
            id: i,
            x: xStep * (c + 1) + (Math.random() - 0.5) * 50,
            y: yStep * (r + 1) + (Math.random() - 0.5) * 50,
            type: 'normal', // normal, jam, factory, rescue_center
            label: `N${i}`
        });
    }

    // Generate Edges (Connect neighbors)
    for (let i = 0; i < NODE_COUNT; i++) {
        // Connect to right
        if ((i + 1) % cols !== 0) addEdge(i, i + 1);
        // Connect to bottom
        if (i + cols < NODE_COUNT) addEdge(i, i + cols);
        // Random diagonals
        if (Math.random() > 0.7 && i + cols + 1 < NODE_COUNT) addEdge(i, i + cols + 1);
    }

    renderGraph();
    updateStats();
}

function addEdge(u, v) {
    const weight = Math.floor(Math.random() * 10) + 1;
    edges.push({ u, v, weight, id: `e_${u}_${v}` });
}

function renderGraph() {
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';

    // Edges
    edges.forEach(edge => {
        const uNode = nodes[edge.u];
        const vNode = nodes[edge.v];

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', uNode.x);
        line.setAttribute('y1', uNode.y);
        line.setAttribute('x2', vNode.x);
        line.setAttribute('y2', vNode.y);
        line.setAttribute('class', 'edge-line');
        line.setAttribute('id', edge.id);

        edgesGroup.appendChild(line);
    });

    // Nodes
    nodes.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node-group');
        g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        g.onclick = () => handleNodeClick(node);

        // Tooltip events
        g.addEventListener('mouseenter', (e) => showTooltip(e, node));
        g.addEventListener('mousemove', (e) => moveTooltip(e));
        g.addEventListener('mouseleave', hideTooltip);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', 12);
        circle.setAttribute('class', 'node-circle');
        circle.setAttribute('id', `n_${node.id}`);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('dy', -20);
        text.setAttribute('class', 'node-label');
        text.textContent = node.label;

        g.appendChild(circle);
        g.appendChild(text);
        nodesGroup.appendChild(g);
    });
}

function updateStats() {
    nodeCountEl.textContent = nodes.length;
    edgeCountEl.textContent = edges.length;
}

// Tooltip Logic
function showTooltip(e, node) {
    tooltip.classList.remove('hidden');
    let content = `<strong>节点 ${node.label}</strong><br>`;

    if (currentMode === 'traffic') {
        content += node.type === 'jam' ? "状态: <span style='color:#ef4444'>严重拥堵</span>" : "状态: 畅通";
        content += "<br><small>点击切换状态</small>";
    } else if (currentMode === 'emergency') {
        const isCenter = [0, 4, 14].includes(node.id);
        if (isCenter) content += "类型: <span style='color:#f59e0b'>救援中心</span>";
        else content += node.type === 'disaster' ? "状态: <span style='color:#ef4444'>灾害发生中</span>" : "状态: 安全";

        if (!isCenter) content += "<br><small>点击模拟灾害</small>";
    } else {
        content += "制造单元";
    }

    tooltip.innerHTML = content;
    moveTooltip(e);
}

function moveTooltip(e) {
    tooltip.style.left = (e.pageX + 2) + 'px';
    tooltip.style.top = (e.pageY + 2) + 'px';
}

function hideTooltip() {
    tooltip.classList.add('hidden');
}

// Interaction
function handleNodeClick(node) {
    if (currentMode === 'traffic') {
        // Toggle Congestion
        node.type = node.type === 'jam' ? 'normal' : 'jam';
        updateNodeVisuals();
        const status = node.type === 'jam' ? '拥堵' : '畅通';
        addLog(`操作：节点 N${node.id} 状态更新为 [${status}]`);
        runDijkstra(0); // Re-calc from hub
    } else if (currentMode === 'emergency') {
        // Prevent clicking rescue centers
        if ([0, 4, 14].includes(node.id)) {
            addLog("提示：该节点为救援中心，请点击其他节点模拟灾害。");
            return;
        }

        // Set Disaster Point
        nodes.forEach(n => n.type = n.type === 'disaster' ? 'normal' : n.type);
        node.type = 'disaster';
        updateNodeVisuals();
        addLog(`警报：节点 N${node.id} 发生模拟灾害，正在调度救援！`);
        runEmergencyResponse(node.id);
    }
}

function updateNodeVisuals() {
    nodes.forEach(node => {
        const el = document.getElementById(`n_${node.id}`);
        if (currentMode === 'traffic') {
            el.style.fill = node.type === 'jam' ? '#ef4444' : '#1e293b';
            el.style.stroke = node.type === 'jam' ? '#ef4444' : '#10b981';
        } else if (currentMode === 'emergency') {
            const isCenter = [0, 4, 14].includes(node.id);
            if (isCenter) {
                el.style.fill = '#f59e0b';
                el.style.stroke = '#fff';
            } else {
                el.style.fill = node.type === 'disaster' ? '#ef4444' : '#1e293b';
                el.style.stroke = node.type === 'disaster' ? '#ef4444' : '#f59e0b';
            }
        } else {
            el.style.fill = '#1e293b';
            el.style.stroke = '#06b6d4';
        }
    });
}

function resetGraphVisuals() {
    document.querySelectorAll('.edge-line').forEach(el => {
        el.setAttribute('class', 'edge-line');
        el.style.stroke = '';
        el.classList.remove('active');
    });
    document.querySelectorAll('.node-circle').forEach(el => {
        el.setAttribute('r', 12);
    });
    updateNodeVisuals();
}

// Algorithms
async function runDijkstra(startId) {
    // Reset edges
    document.querySelectorAll('.edge-line').forEach(el => el.classList.remove('active'));

    const dist = new Array(NODE_COUNT).fill(Infinity);
    const prev = new Array(NODE_COUNT).fill(null);
    dist[startId] = 0;

    const pq = [{ id: startId, dist: 0 }];

    while (pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);
        const { id: u } = pq.shift();

        // Find neighbors
        const neighbors = edges.filter(e => e.u === u || e.v === u);
        for (const edge of neighbors) {
            const v = edge.u === u ? edge.v : edge.u;
            // Congestion weight penalty
            const penalty = nodes[v].type === 'jam' ? 50 : 0;
            const alt = dist[u] + edge.weight + penalty;

            if (alt < dist[v]) {
                dist[v] = alt;
                prev[v] = { u, edgeId: edge.id };
                pq.push({ id: v, dist: alt });
            }
        }
    }

    // Visualize paths to all nodes (Spanning Tree effect)
    for (let i = 0; i < NODE_COUNT; i++) {
        if (i !== startId && prev[i]) {
            const edgeEl = document.getElementById(prev[i].edgeId);
            if (edgeEl) {
                edgeEl.style.stroke = '#10b981';
                edgeEl.classList.add('active');
            }
        }
    }
    metricValue.textContent = "92%";
}

async function runEmergencyResponse(targetId) {
    // Reset visuals
    document.querySelectorAll('.edge-line').forEach(el => {
        el.classList.remove('active');
        el.style.stroke = '';
    });

    // Define Rescue Centers
    const centers = [0, 4, 14];

    // Find nearest center using Dijkstra from each center
    let bestCenter = -1;
    let minTime = Infinity;
    let bestPathMap = null; // To store 'prev' map for reconstruction

    for (const startId of centers) {
        const { dist, prev } = calculateDijkstra(startId);
        if (dist[targetId] < minTime) {
            minTime = dist[targetId];
            bestCenter = startId;
            bestPathMap = prev;
        }
    }

    if (bestCenter !== -1) {
        // Highlight Path
        let curr = targetId;
        while (curr !== bestCenter && bestPathMap[curr]) {
            const { u, edgeId } = bestPathMap[curr];
            const edgeEl = document.getElementById(edgeId);
            if (edgeEl) {
                edgeEl.style.stroke = '#f59e0b'; // Emergency Orange
                edgeEl.classList.add('active');
            }
            curr = u;
        }

        // Highlight Center
        const centerEl = document.getElementById(`n_${bestCenter}`);
        centerEl.style.fill = '#f59e0b';
        centerEl.style.stroke = '#fff';

        addLog(`调度中心 N${bestCenter} 响应，预计 ${minTime} 分钟抵达 N${targetId}`);
        metricValue.textContent = `${minTime} min`;
    } else {
        addLog(`警告：无法找到通往 N${targetId} 的救援路径！`);
    }
}

// Helper for pure calculation without visual side effects
function calculateDijkstra(startId) {
    const dist = new Array(NODE_COUNT).fill(Infinity);
    const prev = new Array(NODE_COUNT).fill(null);
    dist[startId] = 0;
    const pq = [{ id: startId, dist: 0 }];

    while (pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);
        const { id: u } = pq.shift();

        const neighbors = edges.filter(e => e.u === u || e.v === u);
        for (const edge of neighbors) {
            const v = edge.u === u ? edge.v : edge.u;
            const alt = dist[u] + edge.weight;
            if (alt < dist[v]) {
                dist[v] = alt;
                prev[v] = { u, edgeId: edge.id };
                pq.push({ id: v, dist: alt });
            }
        }
    }
    return { dist, prev };
}

// Legend Helper
function updateLegend(mode) {
    legendGrid.innerHTML = '';
    const items = [];
    if (mode === 'traffic') {
        items.push({ color: '#10b981', text: '畅通道路' });
        items.push({ color: '#ef4444', text: '拥堵节点 (点击设置)' });
    } else if (mode === 'manufacturing') {
        items.push({ color: '#06b6d4', text: '物流路径' });
        items.push({ color: '#1e293b', text: '制造单元' });
        items.push({ color: '#fff', text: '点击按钮优化' });
    } else {
        items.push({ color: '#f59e0b', text: '救援通道' });
        items.push({ color: '#ef4444', text: '灾害点 (点击设置)' });
        items.push({ color: '#f59e0b', text: '救援中心 (N0,N4,N14)' });
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'legend-item';
        div.innerHTML = `<span class="l-dot" style="background:${item.color}"></span><span>${item.text}</span>`;
        legendGrid.appendChild(div);
    });
}

// Utils
function addLog(msg) {
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = 'log-item';
    div.innerHTML = `<span>[${time}]</span> ${msg}`;
    logList.insertBefore(div, logList.firstChild);
}

function startClock() {
    setInterval(() => {
        document.getElementById('dateTime').textContent = new Date().toLocaleString();
    }, 1000);
}

// Global Buttons
document.getElementById('resetBtn').addEventListener('click', () => {
    initGraph();
    addLog("系统重置：生成新的城市网络拓扑");
});

document.getElementById('actionBtn').addEventListener('click', () => {
    if (currentMode === 'traffic') {
        runDijkstra(0);
        addLog("正在计算全城最优绿色出行方案...");
    } else if (currentMode === 'manufacturing') {
        addLog("正在分析生产网络协同效率...");
        analyzeManufacturing();
    } else if (currentMode === 'emergency') {
        addLog("正在扫描全城安全隐患...");
        analyzeEmergency();
    }
});

function analyzeManufacturing() {
    // Calculate Degree Centrality to find the busiest node (Core Unit)
    let maxDegree = -1;
    let coreNodeId = -1;

    nodes.forEach(node => {
        const degree = edges.filter(e => e.u === node.id || e.v === node.id).length;
        if (degree > maxDegree) {
            maxDegree = degree;
            coreNodeId = node.id;
        }
    });

    if (coreNodeId !== -1) {
        // Highlight Core Node
        resetGraphVisuals();
        const el = document.getElementById(`n_${coreNodeId}`);
        el.style.fill = '#00f0ff';
        el.style.stroke = '#fff';
        el.setAttribute('r', 16); // Make it bigger

        // Highlight connected edges
        edges.forEach(edge => {
            if (edge.u === coreNodeId || edge.v === coreNodeId) {
                const edgeEl = document.getElementById(edge.id);
                edgeEl.style.stroke = '#00f0ff';
                edgeEl.classList.add('active');
            }
        });

        addLog(`分析完成：N${coreNodeId} 是当前核心制造单元 (连接数: ${maxDegree})`);
        metricValue.textContent = `${(maxDegree / (nodes.length - 1) * 100).toFixed(0)}%`;
    }
}

function analyzeEmergency() {
    // Simulate a random disaster if none exists
    const existingDisaster = nodes.find(n => n.type === 'disaster');

    if (existingDisaster) {
        runEmergencyResponse(existingDisaster.id);
    } else {
        // Pick a random node (not a rescue center)
        const nonCenters = nodes.filter(n => ![0, 4, 14].includes(n.id));
        const target = nonCenters[Math.floor(Math.random() * nonCenters.length)];

        target.type = 'disaster';
        updateNodeVisuals();
        addLog(`模拟演练：N${target.id} 突发模拟灾情`);
        runEmergencyResponse(target.id);
    }
}

document.getElementById('optMfgBtn').addEventListener('click', () => {
    // Add random shortcut
    const u = Math.floor(Math.random() * NODE_COUNT);
    const v = Math.floor(Math.random() * NODE_COUNT);
    if (u !== v && !edges.some(e => (e.u === u && e.v === v) || (e.u === v && e.u === u))) {
        addEdge(u, v);
        renderGraph();
        addLog(`优化成功：新增 N${u} -> N${v} 高效物流通道`);
        metricValue.textContent = "99%";
    } else {
        addLog("优化尝试：网络已饱和或连接无效");
    }
});
