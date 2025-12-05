/**
 * 智慧农业 - 监测决策系统
 * Smart Agriculture Monitoring System (Rooted Tree, DFS/BFS)
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const dfsBtn = document.getElementById('dfsBtn');
const bfsBtn = document.getElementById('bfsBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const scannedCountEl = document.getElementById('scannedCount');
const alertCountEl = document.getElementById('alertCount');
const systemLog = document.getElementById('systemLog');
const decisionPopup = document.getElementById('decisionPopup');
const decisionContent = document.getElementById('decisionContent');

// State
let treeData = null;
let nodeElements = new Map(); // id -> {g, circle}
let edgeElements = new Map(); // id -> line
let isRunning = false;
let scannedNodes = new Set();
let alerts = 0;

// Constants
const NODE_RADIUS = 24;
const LEVEL_HEIGHT = 120;

// Tree Data Structure (Rooted Tree)
const FARM_DATA = {
    id: 'root',
    name: '指挥中心',
    type: 'root',
    icon: '🏢',
    children: [
        {
            id: 'r1',
            name: 'A区 稻田',
            type: 'region',
            icon: '🌾',
            children: [
                { id: 's1', name: '土壤湿度', type: 'sensor', icon: '💧', value: '35%', status: 'low' },
                { id: 's2', name: '水温', type: 'sensor', icon: '🌡️', value: '24℃', status: 'normal' },
                { id: 's3', name: 'PH值', type: 'sensor', icon: '🧪', value: '6.5', status: 'normal' }
            ]
        },
        {
            id: 'r2',
            name: 'B区 果园',
            type: 'region',
            icon: '🍎',
            children: [
                { id: 's4', name: '光照强度', type: 'sensor', icon: '☀️', value: '45k lx', status: 'normal' },
                { id: 's5', name: '空气湿度', type: 'sensor', icon: '🌫️', value: '60%', status: 'normal' },
                { id: 's6', name: '虫情监测', type: 'sensor', icon: '🦋', value: '无', status: 'normal' }
            ]
        },
        {
            id: 'r3',
            name: 'C区 大棚',
            type: 'region',
            icon: '🥬',
            children: [
                { id: 's7', name: 'CO2浓度', type: 'sensor', icon: '☁️', value: '800ppm', status: 'normal' },
                { id: 's8', name: '室温', type: 'sensor', icon: '🌡️', value: '28℃', status: 'high' },
                { id: 's9', name: '滴灌状态', type: 'sensor', icon: '🚰', value: '开启', status: 'normal' }
            ]
        }
    ]
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
    return Math.max(200, 2000 - (val * 18));
}

function log(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] ${message}`;
    systemLog.appendChild(entry);
    systemLog.scrollTop = systemLog.scrollHeight;
}

// Layout Calculation (Simple Tree Layout)
function calculateLayout(node, x, y, level, width) {
    node.x = x;
    node.y = y;

    if (node.children && node.children.length > 0) {
        const step = width / node.children.length;
        const startX = x - width / 2 + step / 2;

        node.children.forEach((child, index) => {
            calculateLayout(child, startX + index * step, y + LEVEL_HEIGHT, level + 1, step);
        });
    }
}

// Initialize Graph
function initGraph() {
    treeData = JSON.parse(JSON.stringify(FARM_DATA)); // Deep copy
    const width = svg.clientWidth || 800;

    // Calculate positions
    calculateLayout(treeData, width / 2, 60, 0, width * 0.9);

    renderGraph(treeData);
    updateStats();
}

// Render Graph (Recursive)
function renderGraph(node) {
    if (node.id === 'root') {
        nodesGroup.innerHTML = '';
        edgesGroup.innerHTML = '';
        nodeElements.clear();
        edgeElements.clear();
    }

    // Render Children and Edges
    if (node.children) {
        node.children.forEach(child => {
            // Edge
            const edgeId = `${node.id}-${child.id}`;
            const line = createSVGElement('line', {
                x1: node.x, y1: node.y,
                x2: child.x, y2: child.y,
                class: 'edge-line'
            });
            edgesGroup.appendChild(line);
            edgeElements.set(edgeId, line);

            renderGraph(child);
        });
    }

    // Render Node
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

    const label = createSVGElement('text', {
        class: 'node-label',
        'text-anchor': 'middle',
        'dy': '2.5em'
    });
    label.textContent = node.name;

    // Value label (for sensors)
    if (node.value) {
        const valueText = createSVGElement('text', {
            class: 'node-value',
            'text-anchor': 'middle',
            'dy': '-1.8em'
        });
        valueText.textContent = node.value;
        g.appendChild(valueText);
    }

    g.appendChild(circle);
    g.appendChild(icon);
    g.appendChild(label);
    nodesGroup.appendChild(g);

    nodeElements.set(node.id, { g, circle, node });
}

function updateStats() {
    scannedCountEl.textContent = `${scannedNodes.size}/13`;
    alertCountEl.textContent = alerts;
    if (alerts > 0) {
        alertCountEl.className = 'stat-value danger';
    } else {
        alertCountEl.className = 'stat-value safe';
    }
}

// Show Decision
function showDecision(message) {
    decisionContent.textContent = message;
    decisionPopup.classList.add('active');
    setTimeout(() => {
        decisionPopup.classList.remove('active');
    }, 4000);
}

// DFS Algorithm (Recursive)
async function runDFS() {
    if (isRunning) return;
    isRunning = true;
    resetGraph();
    statusText.textContent = "正在执行精准诊断 (DFS)...";
    log("启动深度优先遍历...", "dfs");

    await dfsVisit(treeData);

    statusText.textContent = "精准诊断完成";
    log("诊断结束，生成决策建议。", "dfs");
    isRunning = false;
}

async function dfsVisit(node) {
    // Visit Node
    const el = nodeElements.get(node.id);
    el.circle.classList.add('active');
    scannedNodes.add(node.id);
    updateStats();

    log(`访问节点: ${node.name}`, "dfs");

    // Analyze Data
    if (node.type === 'sensor') {
        if (node.status !== 'normal') {
            alerts++;
            log(`⚠️ 异常: ${node.name} - ${node.value}`, "dfs");
            showDecision(`检测到 ${node.name} 异常 (${node.value})，建议采取干预措施。`);
            await sleep(getDelay() * 1.5);
        }
    } else if (node.type === 'region') {
        showDecision(`正在深入分析 ${node.name} 的各项指标...`);
    }

    await sleep(getDelay());
    el.circle.classList.remove('active');
    el.circle.classList.add('visited');

    // Visit Children
    if (node.children) {
        for (const child of node.children) {
            // Highlight Edge
            const edge = edgeElements.get(`${node.id}-${child.id}`);
            edge.classList.add('active');
            await sleep(getDelay() / 2);

            await dfsVisit(child);

            // Backtrack visual
            edge.classList.remove('active');
            edge.classList.add('visited');
        }
    }
}

// BFS Algorithm (Queue)
async function runBFS() {
    if (isRunning) return;
    isRunning = true;
    resetGraph();
    statusText.textContent = "正在执行全局巡检 (BFS)...";
    log("启动广度优先遍历...", "bfs");

    const queue = [treeData];
    scannedNodes.add(treeData.id);

    // Mark root as visited initially for BFS visual logic
    const rootEl = nodeElements.get(treeData.id);
    rootEl.circle.classList.add('active');
    await sleep(getDelay());
    rootEl.circle.classList.remove('active');
    rootEl.circle.classList.add('visited');

    while (queue.length > 0) {
        const node = queue.shift();
        log(`巡检节点: ${node.name}`, "bfs");

        if (node.children) {
            // Highlight all outgoing edges first (Level traversal feel)
            for (const child of node.children) {
                const edge = edgeElements.get(`${node.id}-${child.id}`);
                edge.classList.add('active');
            }
            await sleep(getDelay());

            for (const child of node.children) {
                const edge = edgeElements.get(`${node.id}-${child.id}`);
                edge.classList.remove('active');
                edge.classList.add('visited');

                const childEl = nodeElements.get(child.id);
                childEl.circle.classList.add('active');
                scannedNodes.add(child.id);
                updateStats();

                // Quick check
                if (child.type === 'sensor' && child.status !== 'normal') {
                    alerts++;
                    log(`⚠️ 发现异常: ${child.name}`, "bfs");
                }

                queue.push(child);
            }
            await sleep(getDelay());

            // Clear active state for this level
            for (const child of node.children) {
                const childEl = nodeElements.get(child.id);
                childEl.circle.classList.remove('active');
                childEl.circle.classList.add('visited');
            }
        }
    }

    statusText.textContent = "全局巡检完成";
    if (alerts > 0) {
        showDecision(`巡检结束，发现 ${alerts} 处异常，请查看日志。`);
    } else {
        showDecision("巡检结束，全园运行正常。");
    }
    log("巡检结束，生成全局报告。", "bfs");
    isRunning = false;
}

function resetGraph() {
    scannedNodes.clear();
    alerts = 0;
    systemLog.innerHTML = '';

    nodeElements.forEach(el => {
        el.circle.classList.remove('active', 'visited');
    });

    edgeElements.forEach(el => {
        el.classList.remove('active', 'visited');
    });

    updateStats();
}

// Event Listeners
dfsBtn.addEventListener('click', runDFS);
bfsBtn.addEventListener('click', runBFS);
resetBtn.addEventListener('click', () => {
    resetGraph();
    statusText.textContent = "系统已重置";
    log("系统重置完成");
});

// Init
window.addEventListener('load', () => {
    initGraph();
    log("系统初始化完成，等待指令...");
});

// Resize handler
window.addEventListener('resize', () => {
    if (!isRunning) initGraph();
});
