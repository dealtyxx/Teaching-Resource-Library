/**
 * 红色配对 - 二部图匹配可视化
 * Revolutionary Pairing - Bipartite Graph Matching Visualizer
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const generateBtn = document.getElementById('generateBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const leftSizeInput = document.getElementById('leftSize');
const rightSizeInput = document.getElementById('rightSize');
const nodeSizeLabel = document.getElementById('nodeSizeLabel');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const matchList = document.getElementById('matchList');
const algorithmSelect = document.getElementById('algorithmSelect');
const matchCountDisplay = document.getElementById('matchCount');
const maxPossibleDisplay = document.getElementById('maxPossible');

// State
let leftNodes = [];
let rightNodes = [];
let edges = [];
let matching = new Map(); // leftId -> rightId
let isRunning = false;
let shouldStop = false;
let currentGraphType = 'bipartite';
let nodeElements = new Map();
let edgeElements = new Map();

// Constants
const NODE_RADIUS = 30;
const LEFT_CADRES = [
    "李大钊", "毛泽东", "周恩来", "朱德", "邓小平", "陈云"
];
const RIGHT_TASKS = [
    "组织建设", "宣传工作", "军事指挥", "经济建设", "外交事务", "文化教育"
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

// Graph Generation
function generateGraph() {
    if (isRunning) return;

    leftNodes = [];
    rightNodes = [];
    edges = [];
    matching.clear();

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;

    const leftSize = parseInt(leftSizeInput.value);
    const rightSize = parseInt(rightSizeInput.value);

    const leftX = width * 0.25;
    const rightX = width * 0.75;

    // Generate left nodes (革命干部)
    const leftSpacing = height / (leftSize + 1);
    for (let i = 0; i < leftSize; i++) {
        const y = leftSpacing * (i + 1);
        leftNodes.push({
            id: `L${i}`,
            name: LEFT_CADRES[i % LEFT_CADRES.length],
            x: leftX,
            y: y,
            type: 'left'
        });
    }

    // Generate right nodes (革命任务)
    const rightSpacing = height / (rightSize + 1);
    for (let i = 0; i < rightSize; i++) {
        const y = rightSpacing * (i + 1);
        rightNodes.push({
            id: `R${i}`,
            name: RIGHT_TASKS[i % RIGHT_TASKS.length],
            x: rightX,
            y: y,
            type: 'right'
        });
    }

    // Generate edges
    if (currentGraphType === 'complete-bipartite') {
        // Complete bipartite: every left connects to every right
        leftNodes.forEach(left => {
            rightNodes.forEach(right => {
                addEdge(left.id, right.id);
            });
        });
    } else {
        // Regular bipartite: random connections
        leftNodes.forEach(left => {
            const numConnections = Math.floor(Math.random() * 3) + 2;
            const shuffled = [...rightNodes].sort(() => Math.random() - 0.5);

            for (let i = 0; i < Math.min(numConnections, rightNodes.length); i++) {
                addEdge(left.id, shuffled[i].id);
            }
        });
    }

    renderGraph();
    resetState();
    updateStats();
}

function addEdge(leftId, rightId) {
    const id = `${leftId}-${rightId}`;
    if (!edges.find(e => e.id === id)) {
        edges.push({ leftId, rightId, id });
    }
}

function getNode(id) {
    return leftNodes.find(n => n.id === id) || rightNodes.find(n => n.id === id);
}

// Rendering
function renderGraph() {
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    nodeElements.clear();
    edgeElements.clear();

    // Render Edges
    edges.forEach(edge => {
        const leftNode = getNode(edge.leftId);
        const rightNode = getNode(edge.rightId);

        const line = createSVGElement('line', {
            x1: leftNode.x, y1: leftNode.y,
            x2: rightNode.x, y2: rightNode.y,
            class: 'edge-line',
            'data-edge-id': edge.id
        });

        edgesGroup.appendChild(line);
        edgeElements.set(edge.id, line);
    });

    // Render Left Nodes
    leftNodes.forEach(node => {
        const g = createSVGElement('g', {
            class: 'node-group left',
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

    // Render Right Nodes
    rightNodes.forEach(node => {
        const g = createSVGElement('g', {
            class: 'node-group right',
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
    const maxPossible = Math.min(leftNodes.length, rightNodes.length);
    maxPossibleDisplay.textContent = maxPossible;
    matchCountDisplay.textContent = matching.size;
}

function addToMatchDisplay(leftId, rightId) {
    const leftNode = getNode(leftId);
    const rightNode = getNode(rightId);

    const item = document.createElement('div');
    item.className = 'match-item';
    item.textContent = `${leftNode.name}→${rightNode.name}`;
    matchList.appendChild(item);
}

function clearMatchDisplay() {
    matchList.innerHTML = '';
}

// Reset State
function resetState() {
    matching.clear();
    clearMatchDisplay();

    nodeElements.forEach(el => {
        el.classList.remove('matched', 'current');
    });

    edgeElements.forEach(el => {
        el.classList.remove('matched', 'augmenting', 'alternating');
    });

    statusText.textContent = '准备就绪';
    matchCountDisplay.textContent = '0';
}

// Find augmenting path using DFS
async function findAugmentingPath(start, visited, matchedRight) {
    visited.add(start);

    const leftNode = getNode(start);
    const leftEl = nodeElements.get(start);
    leftEl.classList.add('current');

    statusText.textContent = `探索: ${leftNode.name}`;
    await sleep(getDelay() / 2);

    // Get all edges from this left node
    const currentEdges = edges.filter(e => e.leftId === start);

    for (const edge of currentEdges) {
        if (shouldStop) return null;

        const rightId = edge.rightId;
        const edgeEl = edgeElements.get(edge.id);

        // Highlight edge being explored
        edgeEl.classList.add('augmenting');
        await sleep(getDelay() / 3);

        if (!matchedRight.has(rightId)) {
            // Found unmatched right node - augmenting path found!
            statusText.textContent = `找到增广路径! ${rightNodes.find(n => n.id === rightId).name} 未匹配`;
            return [edge];
        } else {
            // Right node is matched, follow the matching edge
            const matchedLeft = matchedRight.get(rightId);

            if (!visited.has(matchedLeft)) {
                edgeEl.classList.add('alternating');

                const path = await findAugmentingPath(matchedLeft, visited, matchedRight);

                if (path) {
                    return [edge, ...path];
                }

                edgeEl.classList.remove('alternating');
            }
        }

        edgeEl.classList.remove('augmenting');
    }

    leftEl.classList.remove('current');
    return null;
}

// Hungarian Algorithm (Augmenting Path Method)
async function hungarianAlgorithm() {
    statusText.textContent = '匈牙利算法: 寻找最大匹配...';
    matching.clear();

    const matchedRight = new Map(); // rightId -> leftId

    for (const leftNode of leftNodes) {
        if (shouldStop) break;

        statusText.textContent = `为 ${leftNode.name} 寻找匹配...`;

        const visited = new Set();
        const path = await findAugmentingPath(leftNode.id, visited, matchedRight);

        if (path) {
            // Apply the augmenting path
            for (let i = 0; i < path.length; i++) {
                const edge = path[i];

                if (i % 2 === 0) {
                    // Add to matching
                    matching.set(edge.leftId, edge.rightId);
                    matchedRight.set(edge.rightId, edge.leftId);

                    const edgeEl = edgeElements.get(edge.id);
                    edgeEl.classList.remove('augmenting', 'alternating');
                    edgeEl.classList.add('matched');

                    nodeElements.get(edge.leftId).classList.add('matched');
                    nodeElements.get(edge.rightId).classList.add('matched');

                    addToMatchDisplay(edge.leftId, edge.rightId);
                } else {
                    // Remove from matching
                    matching.delete(edge.leftId);
                    matchedRight.delete(edge.rightId);

                    const edgeEl = edgeElements.get(edge.id);
                    edgeEl.classList.remove('matched');
                }

                await sleep(getDelay() / 2);
            }

            updateStats();
            statusText.textContent = `成功匹配 ${leftNode.name}! 当前匹配数: ${matching.size}`;
            await sleep(getDelay());
        } else {
            statusText.textContent = `${leftNode.name} 无法找到匹配`;
            await sleep(getDelay() / 2);
        }

        // Clear current states
        nodeElements.forEach(el => el.classList.remove('current'));
        edgeElements.forEach(el => el.classList.remove('augmenting', 'alternating'));
    }

    if (!shouldStop) {
        const maxPossible = Math.min(leftNodes.length, rightNodes.length);
        if (matching.size === maxPossible) {
            statusText.textContent = `完美匹配! 达到最大匹配数 ${matching.size}`;
        } else {
            statusText.textContent = `最大匹配完成! 匹配数: ${matching.size}/${maxPossible}`;
        }
    }
}

// Augmenting Path Visualization
async function augmentingPathVisualization() {
    statusText.textContent = '增广路径算法: 逐步可视化...';
    matching.clear();

    const matchedRight = new Map();

    for (const leftNode of leftNodes) {
        if (shouldStop) break;

        statusText.textContent = `为 ${leftNode.name} 寻找增广路径...`;

        const visited = new Set();
        const path = await findAugmentingPath(leftNode.id, visited, matchedRight);

        if (path) {
            statusText.textContent = `找到增广路径! 长度: ${path.length}`;

            // Visualize the entire path
            for (const edge of path) {
                const edgeEl = edgeElements.get(edge.id);
                edgeEl.classList.add('augmenting');
            }

            await sleep(getDelay() * 1.5);

            // Apply the path
            for (let i = 0; i < path.length; i++) {
                const edge = path[i];
                const edgeEl = edgeElements.get(edge.id);

                edgeEl.classList.remove('augmenting');

                if (i % 2 === 0) {
                    matching.set(edge.leftId, edge.rightId);
                    matchedRight.set(edge.rightId, edge.leftId);

                    edgeEl.classList.add('matched');
                    nodeElements.get(edge.leftId).classList.add('matched');
                    nodeElements.get(edge.rightId).classList.add('matched');

                    addToMatchDisplay(edge.leftId, edge.rightId);
                }

                await sleep(getDelay() / 2);
            }

            updateStats();
            await sleep(getDelay());
        }

        nodeElements.forEach(el => el.classList.remove('current'));
    }

    if (!shouldStop) {
        const maxPossible = Math.min(leftNodes.length, rightNodes.length);
        if (matching.size === maxPossible) {
            statusText.textContent = `完美匹配! 所有${leftNodes.length}个干部都有任务!`;
        } else {
            statusText.textContent = `最大匹配: ${matching.size}/${maxPossible} - 资源优化配置完成!`;
        }
    }
}

// Main Algorithm Runner
async function runMatchingAlgorithm() {
    if (isRunning) return;

    isRunning = true;
    shouldStop = false;
    startBtn.disabled = true;
    generateBtn.disabled = true;
    leftSizeInput.disabled = true;
    rightSizeInput.disabled = true;

    resetState();

    const algorithm = algorithmSelect.value;

    if (algorithm === 'hungarian') {
        await hungarianAlgorithm();
    } else {
        await augmentingPathVisualization();
    }

    if (shouldStop) {
        statusText.textContent = '算法已暂停';
    }

    isRunning = false;
    startBtn.disabled = false;
    generateBtn.disabled = false;
    leftSizeInput.disabled = false;
    rightSizeInput.disabled = false;
}

// Event Listeners
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (isRunning) return;

        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentGraphType = btn.getAttribute('data-type');
        generateGraph();
    });
});

generateBtn.addEventListener('click', generateGraph);
startBtn.addEventListener('click', runMatchingAlgorithm);

resetBtn.addEventListener('click', () => {
    shouldStop = true;
    setTimeout(() => {
        isRunning = false;
        resetState();
        startBtn.disabled = false;
        generateBtn.disabled = false;
        leftSizeInput.disabled = false;
        rightSizeInput.disabled = false;
    }, 100);
});

function updateNodeSizeLabel() {
    nodeSizeLabel.textContent = `${leftSizeInput.value}-${rightSizeInput.value}`;
}

leftSizeInput.addEventListener('input', updateNodeSizeLabel);
rightSizeInput.addEventListener('input', updateNodeSizeLabel);

leftSizeInput.addEventListener('change', () => {
    if (!isRunning) generateGraph();
});

rightSizeInput.addEventListener('change', () => {
    if (!isRunning) generateGraph();
});

// Init
window.addEventListener('load', () => {
    updateNodeSizeLabel();
    generateGraph();
});
