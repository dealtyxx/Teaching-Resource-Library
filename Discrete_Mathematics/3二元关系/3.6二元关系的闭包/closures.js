/**
 * Red Mathematics - Relation Closures Visualizer
 */

// DOM Elements
const closureBtns = document.querySelectorAll('.closure-btn');
const resetBtn = document.getElementById('resetBtn');
const svgOriginal = document.getElementById('svgOriginal');
const svgClosure = document.getElementById('svgClosure');
const nodesOriginal = document.getElementById('nodesOriginal');
const nodesClosure = document.getElementById('nodesClosure');
const closureTitle = document.getElementById('closureTitle');
const closureSub = document.getElementById('closureSub');
const originalCount = document.getElementById('originalCount');
const addedCount = document.getElementById('addedCount');
const totalCount = document.getElementById('totalCount');
const insightTitle = document.getElementById('insightTitle');
const insightText = document.getElementById('insightText');

// Data
const NODES = [1, 2, 3, 4];
const ORIGINAL_EDGES = [
    [1, 2],
    [2, 3],
    [3, 4]
];

// State
let currentClosure = null;
let nodePositions = {};
let graphSize = { width: 0, height: 0, centerX: 0, centerY: 0 };

// Config
const NODE_RADIUS = 22;

// Initialization
function init() {
    calculateLayout();
    renderOriginalGraph();
    renderClosureGraph([]);
}

// Layout (Circular) — 依据「指定图容器」的实际尺寸做圆形布局，
// 每个图各自按自己的容器居中、自适应半径，确保四个节点与所有边完整落在容器内。
function layoutFor(container, svg) {
    const rect = container ? container.getBoundingClientRect() : { width: 360, height: 360 };
    const w = Math.max(180, Math.round(rect.width || (container && container.clientWidth) || 360));
    const h = Math.max(260, Math.round(rect.height || (container && container.clientHeight) || 360));
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.max(42, Math.min(w * 0.28, h * 0.28, w / 2 - NODE_RADIUS - 34, h / 2 - NODE_RADIUS - 34));
    const pos = {};

    graphSize = { width: w, height: h, centerX: cx, centerY: cy };
    if (svg) {
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }

    NODES.forEach((val, idx) => {
        const a = (idx / NODES.length) * 2 * Math.PI - Math.PI / 2;
        pos[val] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
    return pos;
}
function calculateLayout() { /* 兼容旧调用：实际布局在各自渲染时按容器计算 */ }

// Rendering
function renderOriginalGraph() {
    nodePositions = layoutFor(document.getElementById('graphOriginal'), svgOriginal);
    nodesOriginal.innerHTML = '';

    // Edges
    const defs = svgOriginal.querySelector('defs');
    svgOriginal.innerHTML = '';
    svgOriginal.appendChild(defs);

    ORIGINAL_EDGES.forEach(([u, v]) => {
        const edge = createEdge(u, v, 'edge-original');
        svgOriginal.appendChild(edge);
    });

    NODES.forEach(val => {
        const pos = nodePositions[val];
        const node = createNode(val, pos, 'original');
        svgOriginal.appendChild(node);
    });
}

function renderClosureGraph(addedEdges) {
    nodePositions = layoutFor(document.getElementById('graphClosure'), svgClosure);
    nodesClosure.innerHTML = '';

    // Edges
    const defs = svgClosure.querySelector('defs');
    svgClosure.innerHTML = '';
    svgClosure.appendChild(defs);

    // Original edges (faint)
    ORIGINAL_EDGES.forEach(([u, v]) => {
        const edge = createEdge(u, v, 'edge-original-c');
        svgClosure.appendChild(edge);
    });

    // Added edges (animated with delay)
    addedEdges.forEach(([u, v], idx) => {
        const edge = createEdge(u, v, 'edge-added');
        edge.style.animationDelay = `${idx * 0.1}s`;
        svgClosure.appendChild(edge);
    });

    NODES.forEach(val => {
        const pos = nodePositions[val];
        const node = createNode(val, pos, 'closure');
        svgClosure.appendChild(node);
    });

    // Update stats
    originalCount.textContent = ORIGINAL_EDGES.length;
    addedCount.textContent = addedEdges.length;
    totalCount.textContent = ORIGINAL_EDGES.length + addedEdges.length;
}

function createNode(value, pos, type) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    node.setAttribute('class', `svg-node node-${type}`);
    node.setAttribute('transform', `translate(${pos.x} ${pos.y})`);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', NODE_RADIUS);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.textContent = value;

    node.appendChild(circle);
    node.appendChild(text);
    return node;
}

function createEdge(u, v, className) {
    const posU = nodePositions[u];
    const posV = nodePositions[v];

    let d;
    if (u === v) {
        const away = getOutwardVector(posU);
        const tangent = { x: -away.y, y: away.x };
        const start = {
            x: posU.x + away.x * NODE_RADIUS + tangent.x * (NODE_RADIUS * 0.62),
            y: posU.y + away.y * NODE_RADIUS + tangent.y * (NODE_RADIUS * 0.62)
        };
        const end = {
            x: posU.x + away.x * NODE_RADIUS - tangent.x * (NODE_RADIUS * 0.62),
            y: posU.y + away.y * NODE_RADIUS - tangent.y * (NODE_RADIUS * 0.62)
        };
        const lift = Math.min(46, Math.max(28, Math.min(graphSize.width, graphSize.height) * 0.15));
        const c1 = {
            x: clamp(start.x + away.x * lift + tangent.x * 22, NODE_RADIUS, graphSize.width - NODE_RADIUS),
            y: clamp(start.y + away.y * lift + tangent.y * 22, NODE_RADIUS, graphSize.height - NODE_RADIUS)
        };
        const c2 = {
            x: clamp(end.x + away.x * lift - tangent.x * 22, NODE_RADIUS, graphSize.width - NODE_RADIUS),
            y: clamp(end.y + away.y * lift - tangent.y * 22, NODE_RADIUS, graphSize.height - NODE_RADIUS)
        };
        d = `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;
    } else {
        // Regular edge
        const dx = posV.x - posU.x;
        const dy = posV.y - posU.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (!dist) return document.createElementNS('http://www.w3.org/2000/svg', 'path');

        const offset = NODE_RADIUS + 3;
        const startX = posU.x + (dx / dist) * offset;
        const startY = posU.y + (dy / dist) * offset;
        const endX = posV.x - (dx / dist) * offset;
        const endY = posV.y - (dy / dist) * offset;

        // Slight curve for visibility
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const perpX = -dy / dist * 15;
        const perpY = dx / dist * 15;

        d = `M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', `graph-edge ${className} ${u === v ? 'edge-self-loop' : ''}`);
    return path;
}

function getOutwardVector(pos) {
    let dx = pos.x - graphSize.centerX;
    let dy = pos.y - graphSize.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= dist;
    dy /= dist;
    return { x: dx, y: dy };
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

// Closure Algorithms
function reflexiveClosure() {
    const added = [];
    NODES.forEach(n => {
        // Check if self-loop exists in original
        const hasSelfLoop = ORIGINAL_EDGES.some(([u, v]) => u === n && v === n);
        if (!hasSelfLoop) {
            added.push([n, n]);
        }
    });
    return added;
}

function symmetricClosure() {
    const added = [];
    ORIGINAL_EDGES.forEach(([u, v]) => {
        // Check if reverse exists
        const hasReverse = ORIGINAL_EDGES.some(([a, b]) => a === v && b === u);
        if (!hasReverse && u !== v) {
            added.push([v, u]);
        }
    });
    return added;
}

function transitiveClosure() {
    // Warshall's Algorithm
    const n = NODES.length;
    const matrix = Array(n).fill(0).map(() => Array(n).fill(false));

    // Initialize with original edges
    ORIGINAL_EDGES.forEach(([u, v]) => {
        matrix[u - 1][v - 1] = true;
    });

    // Warshall
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                matrix[i][j] = matrix[i][j] || (matrix[i][k] && matrix[k][j]);
            }
        }
    }

    // Find added edges
    const added = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (matrix[i][j]) {
                const u = i + 1;
                const v = j + 1;
                const isOriginal = ORIGINAL_EDGES.some(([a, b]) => a === u && b === v);
                if (!isOriginal) {
                    added.push([u, v]);
                }
            }
        }
    }
    return added;
}

// UI Updates
function updateClosure(type) {
    currentClosure = type;

    // Update active button
    closureBtns.forEach(btn => {
        if (btn.dataset.closure === type) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    let addedEdges = [];
    let title = '';
    let sub = '';
    let insightT = '';
    let insightP = '';

    if (type === 'reflexive') {
        addedEdges = reflexiveClosure();
        title = '自反闭包 r(R)';
        sub = 'Reflexive Closure: Universal Self-Sufficiency';
        insightT = '全民自立 (Universal Self-Sufficiency)';
        insightP = '通过添加自环，每个元素都建立了与自己的关系。象征着每个人都拥有自我完善的能力和资源。';
    } else if (type === 'symmetric') {
        addedEdges = symmetricClosure();
        title = '对称闭包 s(R)';
        sub = 'Symmetric Closure: Reciprocal Rights';
        insightT = '权利对等 (Reciprocal Rights)';
        insightP = '通过添加反向边，关系变为双向。象征着互惠互利的平等关系，你敬我一尺，我敬你一丈。';
    } else if (type === 'transitive') {
        addedEdges = transitiveClosure();
        title = '传递闭包 t(R)';
        sub = 'Transitive Closure: Connected Communities';
        insightT = '互联互通 (Connected Communities)';
        insightP = '通过添加传递边，间接联系被直接贯通。象征着高铁网络将各城市紧密连接，形成命运共同体。';
    }

    closureTitle.textContent = title;
    closureSub.textContent = sub;
    insightTitle.textContent = insightT;
    insightText.textContent = insightP;

    renderClosureGraph(addedEdges);
}

// Event Listeners
closureBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        updateClosure(btn.dataset.closure);
    });
});

function resetClosureView() {
    currentClosure = null;
    closureBtns.forEach(btn => btn.classList.remove('active'));

    closureTitle.textContent = '闭包结果 (Closure Result)';
    closureSub.textContent = '选择一个闭包操作';
    insightTitle.textContent = '准备就绪';
    insightText.textContent = '点击闭包按钮，探索三种闭包如何完善网络，构建更加紧密的联系。';

    renderClosureGraph([]);
}

document.querySelectorAll('#resetBtn').forEach(btn => {
    btn.addEventListener('click', resetClosureView);
});

window.addEventListener('resize', () => {
    calculateLayout();
    renderOriginalGraph();
    if (currentClosure) {
        updateClosure(currentClosure);
    } else {
        renderClosureGraph([]);
    }
});

// 重新渲染（保留当前选择的闭包）；各图渲染时按各自容器实时布局
function relayout() {
    renderOriginalGraph();
    if (currentClosure) updateClosure(currentClosure);
    else renderClosureGraph([]);
}

// Init
init();
// 容器尺寸任何变化（字体加载 / 屏幕自适配缩放 / 窗口缩放 / 布局稳定）都自动重新布局，
// 用 ResizeObserver 取代「猜时间」的延时，确保图形始终完整不被裁切。
if (window.ResizeObserver) {
    const _ro = new ResizeObserver(function () { relayout(); });
    const _co = document.getElementById('graphOriginal');
    const _cc = document.getElementById('graphClosure');
    if (_co) _ro.observe(_co);
    if (_cc) _ro.observe(_cc);
}
window.addEventListener('load', relayout);
[200, 600, 1300].forEach(function (d) { setTimeout(relayout, d); });
