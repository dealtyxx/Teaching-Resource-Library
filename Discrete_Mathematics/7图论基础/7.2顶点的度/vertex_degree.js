/**
 * Vertex Degree Visualization
 * 红色数理 - 顶点的度：贡献与影响的度量
 */

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        init();
    }, 100);
});

// ===== Concepts Data =====
const CONCEPTS = {
    maxmin: {
        title: '最大度与最小度',
        definition: '顶点的度(Degree)是与该顶点相连的边的数目。最大度Δ(G)是图中所有顶点度的最大值，最小度δ(G)是最小值。',
        mathDef: 'deg(v) = |{e ∈ E | v ∈ e}|<br>Δ(G) = max{deg(v) | v ∈ V}<br>δ(G) = min{deg(v) | v ∈ V}',
        ideology: {
            title: '📊 群体特征与个体贡献',
            content: '在社会网络中，顶点的度代表了个体的连接广度和影响力。最大度反映了核心人物的凝聚力，最小度则提醒我们要关注边缘群体，实现"一个都不能少"的全面发展。'
        },
        applications: [
            { title: '社交影响力', desc: '度数高的人是社交中心，具有更大影响力' },
            { title: '网络鲁棒性', desc: '攻击最大度节点对网络破坏最大' },
            { title: '资源分配', desc: '根据度数分配资源，提高效率' }
        ],
        isDirected: false
    },
    inout: {
        title: '入度与出度',
        definition: '在有向图中，入度deg⁻(v)是指向该顶点的边数，出度deg⁺(v)是从该顶点出发的边数。',
        mathDef: 'deg⁻(v) = |{(u, v) ∈ E}|<br>deg⁺(v) = |{(v, u) ∈ E}|<br>deg(v) = deg⁻(v) + deg⁺(v)',
        ideology: {
            title: '➡️ 权利与义务',
            content: '入度代表接受的支持和资源（权利），出度代表对他人的贡献和付出（义务）。健康的社会关系中，权利与义务应当是对等的，既要善于学习（入），也要乐于奉献（出）。'
        },
        applications: [
            { title: '网页排名', desc: 'PageRank算法基于入度衡量网页重要性' },
            { title: '引文分析', desc: '论文被引用次数（入度）反映学术影响力' },
            { title: '贸易顺逆差', desc: '进出口贸易流向分析' }
        ],
        isDirected: true
    },
    handshake: {
        title: '握手定理',
        definition: '图论基本定理：图中所有顶点的度数之和等于边数的两倍。这意味着奇数度顶点的个数必为偶数。',
        mathDef: '∑ deg(v) = 2|E|<br>v∈V',
        ideology: {
            title: '🤝 互助共赢',
            content: '握手定理揭示了"连接"的双向性：每一次握手都涉及两个人，每一份付出都有回应。这象征着互助共赢的社会关系，体现了"团结就是力量"的深刻哲理。'
        },
        applications: [
            { title: '网络校验', desc: '用于检验网络结构的合法性' },
            { title: '化学分子', desc: '分子结构中键的连接规律' },
            { title: '社交聚会', desc: '握手次数总和必为偶数' }
        ],
        isDirected: false
    }
};

// ===== State =====
let canvas, ctx;
let nodes = [];
let edges = [];
let currentConcept = 'maxmin';
let nodeIdCounter = 0;
let selectedNode = null;
let canvasResizeObserver = null;
let isExampleGraph = false;

const NODE_RADIUS = 18;
const NODE_HIT_RADIUS = 22;
const EDGE_WIDTH = 1.7;
const ARROW_LENGTH = 11;

// ===== Initialize =====
function init() {
    canvas = document.getElementById('graphCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    if ('ResizeObserver' in window) {
        canvasResizeObserver = new ResizeObserver(() => {
            resizeCanvas();
        });
        canvasResizeObserver.observe(canvas.parentElement);
    }

    setupEventListeners();
    loadConcept('maxmin');
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const oldWidth = canvas.width || width;
    const oldHeight = canvas.height || height;

    if (canvas.width === width && canvas.height === height) {
        drawGraph();
        return;
    }

    if (nodes.length && isExampleGraph) {
        canvas.width = width;
        canvas.height = height;
        generateExampleGraph();
        return;
    }

    if (nodes.length && oldWidth > 1 && oldHeight > 1) {
        const scaleX = width / oldWidth;
        const scaleY = height / oldHeight;
        nodes.forEach(node => {
            node.x *= scaleX;
            node.y *= scaleY;
        });
    }

    canvas.width = width;
    canvas.height = height;
    drawGraph();
}

function setupEventListeners() {
    // Concept buttons
    document.querySelectorAll('.concept-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const concept = btn.dataset.concept;
            document.querySelectorAll('.concept-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadConcept(concept);
        });
    });

    // Canvas interaction
    canvas.addEventListener('click', handleCanvasClick);

    // Controls
    document.getElementById('addNodeBtn').addEventListener('click', addRandomNode);
    document.getElementById('addEdgeBtn').addEventListener('click', addRandomEdge);
    document.getElementById('clearBtn').addEventListener('click', clearGraph);
    document.getElementById('randomBtn').addEventListener('click', generateRandomGraph);
}

// ===== Load Concept =====
function loadConcept(concept) {
    currentConcept = concept;
    const data = CONCEPTS[concept];

    // Update UI
    document.getElementById('conceptTitle').textContent = data.title;

    document.getElementById('ideologyContent').innerHTML = `
        <h4>${data.ideology.title}</h4>
        <p>${data.ideology.content}</p>
    `;

    document.getElementById('mathDefinition').innerHTML = `
        <div class="math-formula">${data.mathDef}</div>
        <p style="font-size:0.85rem; color:#666; margin-top:8px;">${data.definition}</p>
    `;

    document.getElementById('applicationList').innerHTML = data.applications.map(app => `
        <div class="app-item">
            <div class="app-title">${app.title}</div>
            <div class="app-desc">${app.desc}</div>
        </div>
    `).join('');

    // Regenerate graph suitable for concept
    generateExampleGraph();
}

// ===== Graph Logic =====
function addNode(x, y) {
    nodes.push({
        id: nodeIdCounter++,
        x: x,
        y: y,
        label: String.fromCharCode(65 + nodes.length),
        selected: false
    });
}

function addEdge(from, to) {
    const isDirected = CONCEPTS[currentConcept].isDirected;

    // Check existing
    const existing = edges.find(e =>
        (e.from === from && e.to === to) ||
        (!isDirected && e.from === to && e.to === from)
    );

    if (!existing) {
        edges.push({ from, to });
    }
}

function addRandomNode() {
    isExampleGraph = false;
    const margin = NODE_RADIUS + 32;
    const x = Math.random() * (canvas.width - margin * 2) + margin;
    const y = Math.random() * (canvas.height - margin * 2) + margin;
    addNode(x, y);
    drawGraph();
    updateAnalysis();
}

function addRandomEdge() {
    isExampleGraph = false;
    if (nodes.length < 2) return;
    const from = nodes[Math.floor(Math.random() * nodes.length)];
    const to = nodes[Math.floor(Math.random() * nodes.length)];
    if (from !== to) {
        addEdge(from, to);
        drawGraph();
        updateAnalysis();
    }
}

function clearGraph() {
    isExampleGraph = false;
    nodes = [];
    edges = [];
    nodeIdCounter = 0;
    selectedNode = null;
    drawGraph();
    updateAnalysis();
}

function generateRandomGraph() {
    isExampleGraph = false;
    clearGraph();
    const numNodes = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numNodes; i++) addRandomNode();

    const numEdges = numNodes + Math.floor(Math.random() * numNodes);
    for (let i = 0; i < numEdges; i++) addRandomEdge();
}

function generateExampleGraph() {
    clearGraph();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const minSide = Math.min(canvas.width, canvas.height);
    const radius = Math.max(92, Math.min(minSide * 0.38, minSide / 2 - NODE_RADIUS - 28));
    const numNodes = 5;

    for (let i = 0; i < numNodes; i++) {
        const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
        addNode(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
    }

    // Add edges to create interesting degree distribution
    const pairs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [0, 3]];
    pairs.forEach(p => addEdge(nodes[p[0]], nodes[p[1]]));

    isExampleGraph = true;
    drawGraph();
    updateAnalysis();
}

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find(n => {
        const dx = x - n.x;
        const dy = y - n.y;
        return Math.sqrt(dx * dx + dy * dy) < NODE_HIT_RADIUS;
    });

    if (clickedNode) {
        if (!selectedNode) {
            selectedNode = clickedNode;
            clickedNode.selected = true;
        } else if (selectedNode !== clickedNode) {
            addEdge(selectedNode, clickedNode);
            selectedNode.selected = false;
            selectedNode = null;
        } else {
            selectedNode.selected = false;
            selectedNode = null;
        }
    } else {
        isExampleGraph = false;
        addNode(x, y);
        if (selectedNode) {
            selectedNode.selected = false;
            selectedNode = null;
        }
    }

    drawGraph();
    updateAnalysis();
}

// ===== Analysis & Calculation =====
function getDegrees(node) {
    const isDirected = CONCEPTS[currentConcept].isDirected;
    if (isDirected) {
        const inDeg = edges.filter(e => e.to === node).length;
        const outDeg = edges.filter(e => e.from === node).length;
        return { in: inDeg, out: outDeg, total: inDeg + outDeg };
    } else {
        const deg = edges.filter(e => e.from === node || e.to === node).length;
        return { deg, total: deg };
    }
}

function updateAnalysis() {
    // Update stats
    document.getElementById('nodeCount').textContent = nodes.length;
    document.getElementById('edgeCount').textContent = edges.length;

    const calcPanel = document.getElementById('calculationPanel');
    const analysisBox = document.getElementById('analysisBox');

    if (nodes.length === 0) {
        calcPanel.innerHTML = '<div style="text-align:center;color:#999">暂无数据</div>';
        analysisBox.innerHTML = '<div class="analysis-content">请添加节点和边开始分析</div>';
        return;
    }

    let html = '';
    let analysisHtml = '';

    if (currentConcept === 'maxmin') {
        const degrees = nodes.map(n => getDegrees(n).total);
        const maxDeg = Math.max(...degrees);
        const minDeg = Math.min(...degrees);
        const maxNodes = nodes.filter(n => getDegrees(n).total === maxDeg).map(n => n.label).join(', ');
        const minNodes = nodes.filter(n => getDegrees(n).total === minDeg).map(n => n.label).join(', ');

        html += `<div class="calc-row"><span class="calc-label">最大度 Δ(G)</span><span class="calc-value">${maxDeg}</span></div>`;
        html += `<div class="calc-row"><span class="calc-label">最小度 δ(G)</span><span class="calc-value">${minDeg}</span></div>`;

        analysisHtml += `<div class="analysis-title">📊 度数分析</div>`;
        analysisHtml += `<div class="analysis-content">
            <p><strong>核心节点 (${maxNodes})：</strong>拥有最多的连接(${maxDeg})，是网络中的关键枢纽。</p>
            <p><strong>边缘节点 (${minNodes})：</strong>连接较少(${minDeg})，需要更多的关注和支持。</p>
        </div>`;

    } else if (currentConcept === 'inout') {
        const totalIn = nodes.reduce((sum, n) => sum + getDegrees(n).in, 0);
        const totalOut = nodes.reduce((sum, n) => sum + getDegrees(n).out, 0);

        html += `<div class="calc-row"><span class="calc-label">总入度 ∑deg⁻</span><span class="calc-value">${totalIn}</span></div>`;
        html += `<div class="calc-row"><span class="calc-label">总出度 ∑deg⁺</span><span class="calc-value">${totalOut}</span></div>`;

        analysisHtml += `<div class="analysis-title">➡️ 流量分析</div>`;
        analysisHtml += `<div class="analysis-content">
            <p><strong>平衡性验证：</strong>总入度 (${totalIn}) 等于 总出度 (${totalOut})。</p>
            <p>这验证了有向图中"有出必有入"的守恒定律。</p>
        </div>`;

    } else if (currentConcept === 'handshake') {
        const totalDegree = nodes.reduce((sum, n) => sum + getDegrees(n).total, 0);
        const numEdges = edges.length;

        html += `<div class="calc-row"><span class="calc-label">度数总和 ∑deg(v)</span><span class="calc-value">${totalDegree}</span></div>`;
        html += `<div class="calc-row"><span class="calc-label">边数 |E|</span><span class="calc-value">${numEdges}</span></div>`;
        html += `<div class="calc-row"><span class="calc-label">2 × |E|</span><span class="calc-value">${2 * numEdges}</span></div>`;

        analysisHtml += `<div class="analysis-title">🤝 握手定理验证</div>`;
        analysisHtml += `<div class="analysis-content">
            <p><strong>验证结果：</strong>${totalDegree} = 2 × ${numEdges}</p>
            <p>度数总和确实等于边数的两倍！</p>
            <p>每条边贡献了2个度数，体现了连接的双向性和互助性。</p>
        </div>`;
    }

    calcPanel.innerHTML = html;
    analysisBox.innerHTML = analysisHtml;
}

// ===== Drawing =====
function drawGraph() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const isDirected = CONCEPTS[currentConcept].isDirected;

    // Draw edges
    edges.forEach(edge => {
        drawEdge(edge.from, edge.to, isDirected);
    });

    // Draw nodes
    nodes.forEach(node => {
        drawNode(node);
    });
}

function getTrimmedEndpoints(from, to, inset = NODE_RADIUS + 1) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const ux = dx / len;
    const uy = dy / len;
    return {
        startX: from.x + ux * inset,
        startY: from.y + uy * inset,
        endX: to.x - ux * inset,
        endY: to.y - uy * inset
    };
}

function drawEdge(from, to, directed) {
    const endpoints = getTrimmedEndpoints(from, to);
    ctx.beginPath();
    ctx.moveTo(endpoints.startX, endpoints.startY);
    ctx.lineTo(endpoints.endX, endpoints.endY);
    ctx.strokeStyle = '#1683ee';
    ctx.lineWidth = EDGE_WIDTH;
    ctx.stroke();

    if (directed) {
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const endX = endpoints.endX;
        const endY = endpoints.endY;

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - ARROW_LENGTH * Math.cos(angle - Math.PI / 6), endY - ARROW_LENGTH * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - ARROW_LENGTH * Math.cos(angle + Math.PI / 6), endY - ARROW_LENGTH * Math.sin(angle + Math.PI / 6));
        ctx.fillStyle = '#1683ee';
        ctx.fill();
    }
}

function drawNode(node) {
    // Shadow
    ctx.shadowColor = 'rgba(22, 131, 238, 0.16)';
    ctx.shadowBlur = 7;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = node.selected ? '#ff6b6b' : '#f2f8ff';
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Border
    ctx.strokeStyle = node.selected ? '#e03131' : '#1683ee';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Label
    ctx.fillStyle = node.selected ? '#fff' : '#2c3e50';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);

    // Degree Badge
    const deg = getDegrees(node);
    let badgeText = '';
    if (currentConcept === 'inout') {
        badgeText = `-${deg.in}/+${deg.out}`;
    } else {
        badgeText = `${deg.total}`;
    }

    ctx.fillStyle = '#722ed1';
    ctx.font = '11px Arial';
    ctx.fillText(badgeText, node.x, node.y + 31);
}
