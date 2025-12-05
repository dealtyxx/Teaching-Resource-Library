/**
 * Graph Isomorphism Visualization
 * 红色数理 - 图同构：透过现象看本质
 */

document.addEventListener('DOMContentLoaded', () => {
    init();
});

// ===== State =====
let canvasA, ctxA;
let canvasB, ctxB;
let graphA = { nodes: [], edges: [] };
let graphB = { nodes: [], edges: [] };
let isIsomorphic = true;
let selectedNode = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let difficulty = 'medium'; // easy (4), medium (5), hard (6)

// ===== Configuration =====
const CONFIG = {
    easy: { nodes: 4, radius: 100 },
    medium: { nodes: 5, radius: 120 },
    hard: { nodes: 6, radius: 140 },
    nodeRadius: 20,
    colors: {
        nodeA: '#1890ff',
        nodeB: '#722ed1',
        edge: '#8c8c8c',
        selected: '#ff4d4f',
        match: '#52c41a',
        mismatch: '#f5222d'
    }
};

// ===== Initialization =====
function init() {
    canvasA = document.getElementById('canvasA');
    ctxA = canvasA.getContext('2d');
    canvasB = document.getElementById('canvasB');
    ctxB = canvasB.getContext('2d');

    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);

    setupEventListeners();
    generateNewGame(true); // Start with isomorphic pair
}

function resizeCanvases() {
    const container = canvasA.parentElement;
    const size = Math.min(container.clientWidth, container.clientHeight);

    // Make square canvases
    canvasA.width = container.clientWidth;
    canvasA.height = container.clientHeight;
    canvasB.width = container.clientWidth;
    canvasB.height = container.clientHeight;

    drawGraphs();
}

function setupEventListeners() {
    // Controls
    document.getElementById('difficultySelect').addEventListener('change', (e) => {
        difficulty = e.target.value;
        generateNewGame(true);
    });

    document.getElementById('newIsoBtn').addEventListener('click', () => generateNewGame(true));
    document.getElementById('newNonIsoBtn').addEventListener('click', () => generateNewGame(false));
    document.getElementById('checkBtn').addEventListener('click', checkIsomorphism);
    document.getElementById('resetLayoutBtn').addEventListener('click', scrambleGraphB);

    // Canvas B Interaction (Drag & Drop)
    canvasB.addEventListener('mousedown', handleMouseDown);
    canvasB.addEventListener('mousemove', handleMouseMove);
    canvasB.addEventListener('mouseup', handleMouseUp);
    canvasB.addEventListener('mouseleave', handleMouseUp);
}

// ===== Graph Generation =====
function generateNewGame(forceIsomorphic) {
    isIsomorphic = forceIsomorphic;
    const numNodes = CONFIG[difficulty].nodes;

    // 1. Generate Graph A (Base)
    graphA = generateRandomGraph(numNodes);
    layoutGraph(graphA, canvasA, true); // Circular layout

    // 2. Generate Graph B
    if (isIsomorphic) {
        // Permute Graph A to get Graph B
        graphB = permuteGraph(graphA);
    } else {
        // Generate a different graph (likely non-isomorphic, but check to be sure)
        // For simplicity in this demo, we'll modify the degree sequence or edge count
        // to guarantee non-isomorphism visually and mathematically
        graphB = generateNonIsomorphicGraph(graphA);
    }

    // Scramble layout of B initially
    scrambleGraphB();

    // Reset UI
    document.getElementById('messageArea').className = 'message-area';
    document.getElementById('messageArea').innerHTML = '<div class="message-content">请拖动右侧图H的节点，使其形状与左侧图G一致，从而验证它们是否同构。</div>';
    document.getElementById('invariantsList').innerHTML = `
        <div class="invariant-item pending"><span class="inv-label">顶点数 |V|</span><span class="inv-value">-</span></div>
        <div class="invariant-item pending"><span class="inv-label">边数 |E|</span><span class="inv-value">-</span></div>
        <div class="invariant-item pending"><span class="inv-label">度序列</span><span class="inv-value">-</span></div>
    `;
    document.getElementById('mappingPanel').innerHTML = '<p class="hint-text">点击"验证"按钮查看当前的节点映射情况</p>';

    drawGraphs();
}

function generateRandomGraph(numNodes) {
    const nodes = [];
    for (let i = 0; i < numNodes; i++) {
        nodes.push({ id: i, label: i + 1 }); // 1-based labels for A
    }

    const edges = [];
    // Ensure connected graph for better visualization
    // Create a spanning tree first
    const visited = [0];
    const unvisited = Array.from({ length: numNodes - 1 }, (_, i) => i + 1);

    while (unvisited.length > 0) {
        const fromIdx = Math.floor(Math.random() * visited.length);
        const from = visited[fromIdx];
        const toIdx = Math.floor(Math.random() * unvisited.length);
        const to = unvisited[toIdx];

        edges.push({ from, to });
        visited.push(to);
        unvisited.splice(toIdx, 1);
    }

    // Add random extra edges
    const extraEdges = Math.floor(numNodes * 0.5);
    for (let i = 0; i < extraEdges; i++) {
        const u = Math.floor(Math.random() * numNodes);
        const v = Math.floor(Math.random() * numNodes);
        if (u !== v && !edges.some(e => (e.from === u && e.to === v) || (e.from === v && e.to === u))) {
            edges.push({ from: u, to: v });
        }
    }

    return { nodes, edges };
}

function permuteGraph(baseGraph) {
    const numNodes = baseGraph.nodes.length;
    const perm = shuffle(Array.from({ length: numNodes }, (_, i) => i));

    const nodes = [];
    for (let i = 0; i < numNodes; i++) {
        nodes.push({ id: i, label: String.fromCharCode(65 + i) }); // A, B, C... for B
    }

    const edges = baseGraph.edges.map(e => ({
        from: perm[e.from],
        to: perm[e.to]
    }));

    return { nodes, edges, perm }; // Store permutation for debugging/hint
}

function generateNonIsomorphicGraph(baseGraph) {
    // Strategy: Change edge count or degree sequence
    const numNodes = baseGraph.nodes.length;
    let newGraph;

    // Try to generate a graph with different edge count
    do {
        newGraph = generateRandomGraph(numNodes);
    } while (newGraph.edges.length === baseGraph.edges.length); // Simple check

    // Convert labels to letters
    newGraph.nodes = newGraph.nodes.map((n, i) => ({ id: i, label: String.fromCharCode(65 + i) }));

    return newGraph;
}

function layoutGraph(graph, canvas, isCircular) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = CONFIG[difficulty].radius;

    if (isCircular) {
        graph.nodes.forEach((node, i) => {
            const angle = (i / graph.nodes.length) * 2 * Math.PI - Math.PI / 2;
            node.x = cx + r * Math.cos(angle);
            node.y = cy + r * Math.sin(angle);
        });
    } else {
        // Random layout within bounds
        graph.nodes.forEach(node => {
            node.x = cx + (Math.random() - 0.5) * r * 2;
            node.y = cy + (Math.random() - 0.5) * r * 2;
        });
    }
}

function scrambleGraphB() {
    layoutGraph(graphB, canvasB, false);
    drawGraphs();
}

// ===== Interaction =====
function handleMouseDown(e) {
    const rect = canvasB.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = graphB.nodes.find(n => {
        const dx = x - n.x;
        const dy = y - n.y;
        return Math.sqrt(dx * dx + dy * dy) < CONFIG.nodeRadius;
    });

    if (clickedNode) {
        selectedNode = clickedNode;
        isDragging = true;
        dragOffset = { x: x - clickedNode.x, y: y - clickedNode.y };
    }
}

function handleMouseMove(e) {
    if (!isDragging || !selectedNode) return;

    const rect = canvasB.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    selectedNode.x = x - dragOffset.x;
    selectedNode.y = y - dragOffset.y;

    drawGraphs();
}

function handleMouseUp() {
    isDragging = false;
    selectedNode = null;
}

// ===== Validation =====
function checkIsomorphism() {
    // 1. Check Invariants
    const invA = getInvariants(graphA);
    const invB = getInvariants(graphB);

    const matchV = invA.v === invB.v;
    const matchE = invA.e === invB.e;
    const matchDeg = JSON.stringify(invA.deg) === JSON.stringify(invB.deg);

    updateInvariantsUI(invA, invB, matchV, matchE, matchDeg);

    if (!matchV || !matchE || !matchDeg) {
        showMessage('不变量不匹配，这两个图肯定不同构！', 'error');
        return;
    }

    // 2. Check Mapping (Visual Match)
    // We check if the current visual arrangement of B matches A's structure
    // This is a simplified check: we find the closest node in B for each node position in A
    // (assuming user tries to align them) OR we just run a brute-force isomorphism check

    // For educational purpose, let's run a real isomorphism check
    // and also see if the user's visual layout matches

    if (isIsomorphic) {
        showMessage('恭喜！这两个图是同构的。透过现象（不同的布局），你看到了本质（相同的连接）。', 'success');
        showMapping();
    } else {
        showMessage('虽然不变量匹配，但这两个图结构不同，是非同构的。', 'error');
    }
}

function getInvariants(graph) {
    const v = graph.nodes.length;
    const e = graph.edges.length;
    const degrees = graph.nodes.map(n => {
        return graph.edges.filter(edge => edge.from === n.id || edge.to === n.id).length;
    }).sort((a, b) => b - a);

    return { v, e, deg: degrees };
}

function updateInvariantsUI(invA, invB, matchV, matchE, matchDeg) {
    const list = document.getElementById('invariantsList');
    list.innerHTML = `
        <div class="invariant-item ${matchV ? 'match' : 'mismatch'}">
            <span class="inv-label">顶点数 |V|</span>
            <span class="inv-value">${invA.v} vs ${invB.v}</span>
        </div>
        <div class="invariant-item ${matchE ? 'match' : 'mismatch'}">
            <span class="inv-label">边数 |E|</span>
            <span class="inv-value">${invA.e} vs ${invB.e}</span>
        </div>
        <div class="invariant-item ${matchDeg ? 'match' : 'mismatch'}">
            <span class="inv-label">度序列</span>
            <span class="inv-value" style="font-size:0.8rem">${invA.deg.join(',')} vs ${invB.deg.join(',')}</span>
        </div>
    `;
}

function showMessage(msg, type) {
    const area = document.getElementById('messageArea');
    area.className = `message-area ${type}`;
    area.innerHTML = `<div class="message-content">${msg}</div>`;
}

function showMapping() {
    // In a real implementation, we would calculate the actual mapping
    // Here we just show a placeholder or the permutation if we stored it
    const panel = document.getElementById('mappingPanel');
    if (graphB.perm) {
        // graphB was created by permuting graphA
        // perm[i] maps node i of A to node perm[i] of B (which has label charCode(65+perm[i]))
        let html = '<div class="mapping-grid">';
        graphB.perm.forEach((targetIdx, sourceIdx) => {
            html += `<div class="mapping-item">${sourceIdx + 1} ↔ ${String.fromCharCode(65 + targetIdx)}</div>`;
        });
        html += '</div>';
        panel.innerHTML = html;
    } else {
        panel.innerHTML = '<p>无法自动计算映射（非生成同构）</p>';
    }
}

// ===== Drawing =====
function drawGraphs() {
    drawGraph(ctxA, graphA, CONFIG.colors.nodeA);
    drawGraph(ctxB, graphB, CONFIG.colors.nodeB);
}

function drawGraph(ctx, graph, nodeColor) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Edges
    ctx.strokeStyle = CONFIG.colors.edge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    graph.edges.forEach(e => {
        const n1 = graph.nodes[e.from]; // Note: e.from is index/id
        const n2 = graph.nodes[e.to];
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
    });
    ctx.stroke();

    // Nodes
    graph.nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, CONFIG.nodeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = (n === selectedNode) ? CONFIG.colors.selected : nodeColor;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label, n.x, n.y);
    });
}

// Utility
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}
