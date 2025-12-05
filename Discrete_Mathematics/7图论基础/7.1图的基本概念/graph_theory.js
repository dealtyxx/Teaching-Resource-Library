/**
 * Graph Theory - Basic Concepts Visualization
 * 红色数理 - 图的基本概念：连接你我，构建和谐网络
 */

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        init();
    }, 100);
});

// ===== Graph Types Data =====
const GRAPH_TYPES = {
    undirected: {
        title: '无向图 - 平等互联',
        definition: '无向图是一种图，其中的边没有方向，表示节点之间的双向关系。',
        mathDef: 'G = (V, E)，其中V是顶点集，E是无序对集合，e = {u, v}表示u和v之间的无向边。',
        ideology: {
            title: '🤝 平等协作',
            content: '无向图中的边是双向的，就像平等的合作关系。没有高低之分，只有相互支持、共同进步。这正是社会主义核心价值观中"平等"的体现。'
        },
        applications: [
            { title: '社交网络', desc: '朋友关系是对等的，A是B的朋友，B也是A的朋友' },
            { title: '交通网络', desc: '双向道路连接城市，体现互联互通' },
            { title: '协作网络', desc: '团队成员之间平等协作，共同完成任务' }
        ],
        properties: [
            { title: '对称性', desc: '如果(u,v)是边，则(v,u)也是边' },
            { title: '度数', desc: '每个顶点的度数等于与其相连的边数' },
            { title: '连通性', desc: '任意两点间存在路径则称为连通图' }
        ]
    },
    directed: {
        title: '有向图 - 明确分工',
        definition: '有向图的边具有方向性，从一个节点指向另一个节点，表示单向关系或影响。',
        mathDef: 'G = (V, E)，其中E是有序对集合，e = (u, v)表示从u到v的有向边。',
        ideology: {
            title: '📋 组织层级',
            content: '有向图体现了明确的方向和流程，如组织架构中的责任链、工作流程中的先后顺序。这是科学管理、分工协作的体现，确保工作高效有序进行。'
        },
        applications: [
            { title: '任务依赖', desc: '项目管理中任务的先后顺序和依赖关系' },
            { title: '知识传播', desc: '信息从源头向外传播的路径' },
            { title: '组织架构', desc: '上下级关系和指挥链条' }
        ],
        properties: [
            { title: '入度与出度', desc: '入度是指向该点的边数，出度是从该点出发的边数' },
            { title: '强连通性', desc: '任意两点间双向可达' },
            { title: '拓扑排序', desc: '可以对有向无环图进行拓扑排序' }
        ]
    },
    mixed: {
        title: '混合图 - 灵活兼顾',
        definition: '混合图同时包含有向边和无向边，兼具两种关系类型。',
        mathDef: 'G = (V, E_u, E_d)，其中E_u是无向边集，E_d是有向边集。',
        ideology: {
            title: '🔄 灵活应变',
            content: '混合图体现了灵活性和适应性。在实际工作中，既有平等的合作关系，也有明确的责任分工，刚柔并济，灵活应对各种情况。'
        },
        applications: [
            { title: '交通系统', desc: '既有双向道路，也有单行道' },
            { title: '组织关系', desc: '既有平等协作，又有汇报关系' },
            { title: '复杂网络', desc: '多种关系类型并存的综合网络' }
        ],
        properties: [
            { title: '复合特性', desc: '同时具备有向图和无向图的特点' },
            { title: '混合度', desc: '需要分别计算有向度和无向度' },
            { title: '复杂连通', desc: '连通性判定更加复杂' }
        ]
    },
    weighted: {
        title: '加权图 - 突出重点',
        definition: '加权图的每条边都赋予了权值，表示连接的强度、距离或成本等。',
        mathDef: 'G = (V, E, W)，其中W: E → ℝ是权重函数，w(e)表示边e的权重。',
        ideology: {
            title: '⚖️ 抓住重点',
            content: '加权图体现了"重点论"的思想。在工作中要分清主次，抓住重点，合理分配资源和精力，确保关键任务得到优先保障。'
        },
        applications: [
            { title: '路径规划', desc: '根据距离或时间成本选择最优路径' },
            { title: '资源分配', desc: '按权重分配资源，优先保障重点' },
            { title: '影响力网络', desc: '不同关系的重要程度不同' }
        ],
        properties: [
            { title: '最短路径', desc: '可计算两点间权重和最小的路径' },
            { title: '最小生成树', desc: '连接所有顶点的最小权重边集' },
            { title: '权重优化', desc: '可进行各种基于权重的优化' }
        ]
    },
    'null': {
        title: '零图 - 独立个体',
        definition: '零图是没有任何边的图，所有节点都是孤立的。',
        mathDef: 'G = (V, ∅)，边集E = ∅，即不存在任何边。',
        ideology: {
            title: '⚪ 个体独立',
            content: '零图虽然没有连接，但每个节点都是独立存在的个体。这提醒我们，在强调团结协作的同时，也要尊重个体的独立性和主体地位。'
        },
        applications: [
            { title: '初始状态', desc: '系统刚建立时，节点间尚未建立连接' },
            { title: '隔离分析', desc: '研究节点的独立属性' },
            { title: '对比基准', desc: '作为最简单的图结构进行对比' }
        ],
        properties: [
            { title: '无边', desc: '边集为空，边数为0' },
            { title: '完全不连通', desc: '任意两点间不存在路径' },
            { title: '最小图', desc: '是最简单的图结构' }
        ]
    },
    trivial: {
        title: '平凡图 - 基本单元',
        definition: '平凡图只包含一个节点，没有边。',
        mathDef: 'G = ({v}, ∅)，仅有一个顶点v，无边。',
        ideology: {
            title: '🔵 基础单元',
            content: '平凡图是最基本的单元，就像社会中的每一个个体。虽然简单，但却是构建复杂网络的基础。提醒我们重视基层、重视个体的作用。'
        },
        applications: [
            { title: '基础模型', desc: '作为最简单的图论研究对象' },
            { title: '单点系统', desc: '只有一个实体的系统' },
            { title: '理论基础', desc: '图论定理的边界情况' }
        ],
        properties: [
            { title: '单顶点', desc: '只有一个顶点' },
            { title: '无边', desc: '没有任何边' },
            { title: '最简图', desc: '最简单的非空图' }
        ]
    },
    multi: {
        title: '多重图 - 多元连接',
        definition: '多重图允许两个节点之间存在多条边，表示多种不同类型的关系。',
        mathDef: 'G = (V, E)，允许重复边，即∃u,v ∈ V，可有多条边连接u和v。',
        ideology: {
            title: '🔗 多元关系',
            content: '多重图体现了关系的多样性。人与人之间不仅有一种连接，而是多重关系交织。这正如"人类命运共同体"理念，多维度、多层次紧密相连。'
        },
        applications: [
            { title: '社会网络', desc: '同事关系、朋友关系、亲属关系等多重连接' },
            { title: '交通网络', desc: '不同交通工具形成的多种连接' },
            { title: '通信网络', desc: '多条通信线路提供冗余和备份' }
        ],
        properties: [
            { title: '重复边', desc: '两点间可以有多条边' },
            { title: '增强连接', desc: '提高网络的鲁棒性和可靠性' },
            { title: '关系多样', desc: '表达更丰富的关系类型' }
        ]
    }
};

// ===== Canvas State =====
let canvas, ctx;
let nodes = [];
let edges = [];
let selectedNode = null;
let currentType = 'undirected';
let nodeIdCounter = 0;

// ===== Initialize =====
function init() {
    canvas = document.getElementById('graphCanvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Setup event listeners
    setupEventListeners();

    // Load initial type
    loadGraphType('undirected');
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Set canvas size via DOM properties (not CSS)
    canvas.width = width;
    canvas.height = height;

    // Redraw after resize
    drawGraph();
}

function setupEventListeners() {
    // Type buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.dataset.type;
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadGraphType(type);
        });
    });

    // Canvas click
    canvas.addEventListener('click', handleCanvasClick);

    // Control buttons
    document.getElementById('addNodeBtn').addEventListener('click', addRandomNode);
    document.getElementById('addEdgeBtn').addEventListener('click', addRandomEdge);
    document.getElementById('clearBtn').addEventListener('click', clearGraph);
    document.getElementById('randomBtn').addEventListener('click', generateRandomGraph);
}

// ===== Load Graph Type =====
function loadGraphType(type) {
    currentType = type;
    const data = GRAPH_TYPES[type];

    // Update title
    document.getElementById('graphTitle').textContent = data.title;

    // Update ideology
    const ideologyContent = document.getElementById('ideologyContent');
    ideologyContent.innerHTML = `
        <h4>${data.ideology.title}</h4>
        <p>${data.ideology.content}</p>
    `;

    // Update definition
    const defBox = document.getElementById('definitionBox');
    defBox.innerHTML = `
        <div class="def-title">📖 图的定义</div>
        <div class="def-content">${data.definition}</div>
    `;

    // Update math definition
    const mathDef = document.getElementById('mathDefinition');
    mathDef.innerHTML = `
        <div class="math-formula">${data.mathDef}</div>
    `;

    // Update applications
    const appList = document.getElementById('applicationList');
    appList.innerHTML = data.applications.map(app => `
        <div class="app-item">
            <div class="app-title">${app.title}</div>
            <div class="app-desc">${app.desc}</div>
        </div>
    `).join('');

    // Update properties
    const propList = document.getElementById('propertiesList');
    propList.innerHTML = data.properties.map(prop => `
        <div class="prop-item">
            <div class="prop-title">${prop.title}</div>
            <div class="prop-desc">${prop.desc}</div>
        </div>
    `).join('');

    // Generate example graph after a small delay
    setTimeout(() => {
        generateExampleGraph();
    }, 100);
}

// ===== Canvas Interaction =====
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on existing node
    const clickedNode = nodes.find(n => {
        const dx = x - n.x;
        const dy = y - n.y;
        return Math.sqrt(dx * dx + dy * dy) < 20;
    });

    if (clickedNode) {
        if (selectedNode === null) {
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
        // Add new node at click position
        addNode(x, y);
        if (selectedNode) {
            selectedNode.selected = false;
            selectedNode = null;
        }
    }

    drawGraph();
    updateStats();
}

// ===== Graph Operations =====
function addNode(x, y) {
    nodes.push({
        id: nodeIdCounter++,
        x: x,
        y: y,
        label: String.fromCharCode(65 + nodes.length),
        selected: false
    });
}

function addEdge(from, to, isDirected = null, offset = 0) {
    const existing = edges.find(e =>
        (e.from === from && e.to === to) ||
        (currentType === 'undirected' && e.from === to && e.to === from)
    );

    // For multigraph, allow multiple edges
    if (!existing || currentType === 'multi') {
        // Determine if edge should be directed
        let directed = isDirected;
        if (directed === null) {
            if (currentType === 'directed') directed = true;
            else if (currentType === 'undirected') directed = false;
            else if (currentType === 'mixed') directed = Math.random() > 0.5; // Random for mixed
        }

        edges.push({
            from: from,
            to: to,
            weight: currentType === 'weighted' ? Math.floor(Math.random() * 10) + 1 : null,
            directed: directed,
            offset: offset
        });
    }
}

function addRandomNode() {
    const x = Math.random() * (canvas.width - 100) + 50;
    const y = Math.random() * (canvas.height - 100) + 50;
    addNode(x, y);
    drawGraph();
    updateStats();
}

function addRandomEdge() {
    if (nodes.length < 2) return;
    const from = nodes[Math.floor(Math.random() * nodes.length)];
    const to = nodes[Math.floor(Math.random() * nodes.length)];
    if (from !== to) {
        addEdge(from, to);
        drawGraph();
        updateStats();
    }
}

function clearGraph() {
    nodes = [];
    edges = [];
    selectedNode = null;
    nodeIdCounter = 0;
    drawGraph();
    updateStats();
}

function generateExampleGraph() {
    clearGraph();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;

    if (currentType === 'null') {
        // Just add isolated nodes
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * 2 * Math.PI;
            addNode(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
        }
    } else if (currentType === 'trivial') {
        // Just one node
        addNode(centerX, centerY);
    } else if (currentType === 'multi') {
        // Add nodes for multigraph with multiple edges
        const numNodes = 4;
        for (let i = 0; i < numNodes; i++) {
            const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
            addNode(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
        }

        // Add multiple edges between some pairs
        addEdge(nodes[0], nodes[1], false, 0);
        addEdge(nodes[0], nodes[1], false, 20);  // Offset for visibility
        addEdge(nodes[1], nodes[2], false, 0);
        addEdge(nodes[1], nodes[2], false, 20);
        addEdge(nodes[1], nodes[2], false, -20); // Three edges
        addEdge(nodes[2], nodes[3], false, 0);
        addEdge(nodes[3], nodes[0], false, 0);
        addEdge(nodes[3], nodes[0], false, 20);
    } else if (currentType === 'mixed') {
        // Add nodes for mixed graph
        const numNodes = 5;
        for (let i = 0; i < numNodes; i++) {
            const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
            addNode(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
        }

        // Add mixed directed and undirected edges
        addEdge(nodes[0], nodes[1], false); // Undirected
        addEdge(nodes[1], nodes[2], true);  // Directed
        addEdge(nodes[2], nodes[3], false); // Undirected
        addEdge(nodes[3], nodes[4], true);  // Directed
        addEdge(nodes[4], nodes[0], false); // Undirected
        addEdge(nodes[0], nodes[2], true);  // Directed
        addEdge(nodes[1], nodes[3], false); // Undirected
    } else {
        // Add nodes in circle for other types
        const numNodes = 5;
        for (let i = 0; i < numNodes; i++) {
            const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
            addNode(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
        }

        // Add appropriate edges
        for (let i = 0; i < numNodes; i++) {
            addEdge(nodes[i], nodes[(i + 1) % numNodes]);
            if (i < numNodes - 2 && currentType !== 'null') {
                addEdge(nodes[i], nodes[(i + 2) % numNodes]);
            }
        }
    }

    drawGraph();
    updateStats();
}

function generateRandomGraph() {
    clearGraph();

    const numNodes = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numNodes; i++) {
        addRandomNode();
    }

    const numEdges = currentType === 'null' ? 0 :
        currentType === 'trivial' ? 0 :
            numNodes + Math.floor(Math.random() * numNodes);

    for (let i = 0; i < numEdges; i++) {
        addRandomEdge();
    }
}

// ===== Drawing =====
function drawGraph() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach(edge => {
        drawEdge(edge.from, edge.to, edge.weight, edge.directed, edge.offset || 0);
    });

    // Draw nodes
    nodes.forEach(node => {
        drawNode(node);
    });
}

function drawEdge(from, to, weight, directed, offset = 0) {
    // Calculate control point for curved edge if offset exists
    if (offset !== 0) {
        // Draw curved edge
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;

        // Calculate perpendicular offset
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / len * offset;
        const perpY = dx / len * offset;

        const cpX = midX + perpX;
        const cpY = midY + perpY;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo(cpX, cpY, to.x, to.y);
        ctx.strokeStyle = '#1890ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw arrow for directed edges on curved line
        if (directed) {
            // Calculate point on curve at t=0.7
            const t = 0.7;
            const curveX = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cpX + t * t * to.x;
            const curveY = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cpY + t * t * to.y;

            // Calculate tangent angle
            const t2 = t + 0.01;
            const curve2X = (1 - t2) * (1 - t2) * from.x + 2 * (1 - t2) * t2 * cpX + t2 * t2 * to.x;
            const curve2Y = (1 - t2) * (1 - t2) * from.y + 2 * (1 - t2) * t2 * cpY + t2 * t2 * to.y;
            const angle = Math.atan2(curve2Y - curveY, curve2X - curveX);

            const arrowLength = 15;
            ctx.beginPath();
            ctx.moveTo(curveX, curveY);
            ctx.lineTo(
                curveX - arrowLength * Math.cos(angle - Math.PI / 6),
                curveY - arrowLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(curveX, curveY);
            ctx.lineTo(
                curveX - arrowLength * Math.cos(angle + Math.PI / 6),
                curveY - arrowLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.strokeStyle = '#1890ff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw weight on curved edge
        if (weight !== null) {
            ctx.fillStyle = 'white';
            ctx.fillRect(cpX - 12, cpY - 10, 24, 20);
            ctx.fillStyle = '#722ed1';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(weight, cpX, cpY);
        }
    } else {
        // Draw straight edge
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = '#1890ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw arrow for directed edges
        if (directed) {
            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            const arrowLength = 15;

            const endX = to.x - 25 * Math.cos(angle);
            const endY = to.y - 25 * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - arrowLength * Math.cos(angle - Math.PI / 6),
                endY - arrowLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - arrowLength * Math.cos(angle + Math.PI / 6),
                endY - arrowLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.strokeStyle = '#1890ff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw weight
        if (weight !== null) {
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            ctx.fillStyle = 'white';
            ctx.fillRect(midX - 12, midY - 10, 24, 20);
            ctx.fillStyle = '#722ed1';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(weight, midX, midY);
        }
    }
}

function drawNode(node) {
    // Draw shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);
    ctx.fillStyle = node.selected ? '#ff6b6b' : '#e6f7ff';
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw border
    ctx.strokeStyle = node.selected ? '#ff0000' : '#1890ff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw label
    ctx.fillStyle = node.selected ? '#ffffff' : '#2c3e50';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);
}

// ===== Update Stats =====
function updateStats() {
    document.getElementById('nodeCount').textContent = nodes.length;
    document.getElementById('edgeCount').textContent = edges.length;
}
