/**
 * Graph Operations Visualization
 * 红色数理 - 图的运算：变革的辩证法
 */

document.addEventListener('DOMContentLoaded', () => {
    init();
});

// ===== State =====
let canvas, ctx;
let currentMode = 'subgraph';
let graph = { nodes: [], edges: [] };
let secondaryGraph = null; // For Union mode
let selectedNodes = new Set();
let selectedEdges = new Set();
let isDragging = false;
let draggedNode = null;
let showComplement = false;

// ===== Data & Config =====
const MODES = {
    'subgraph': {
        title: '子图与母图 (Subgraph & Supergraph)',
        ideology: {
            title: '🧩 局部与整体',
            content: '子图是原图的一部分，母图是包含原图的图。这反映了"局部与整体"的辩证关系。个人（节点）和关系（边）既是独立的个体，又是集体（母图）的有机组成部分。'
        },
        definition: '设G=(V,E)，若V\'⊆V且E\'⊆E，则G\'=(V\',E\')是G的子图。若E\'包含V\'中所有在G中的边，则称G\'为G的导出子图。',
        controls: [
            { type: 'btn', text: '重置选择', action: 'resetSelection' },
            { type: 'btn', text: '导出子图', action: 'showInduced' }
        ]
    },
    'complement': {
        title: '补图 (Complement Graph)',
        ideology: {
            title: '🌗 逆向思维',
            content: '补图展示了原图中"不存在"的连接。这启示我们要有逆向思维，看到事物的另一面。在社会治理中，不仅要关注已建立的联系，还要关注潜在的、尚未建立的联系（补短板）。'
        },
        definition: '图G的补图~G具有与G相同的顶点集，但两个顶点相邻当且仅当它们在G中不相邻。',
        controls: [
            { type: 'btn', text: '切换视角', action: 'toggleComplement' }
        ]
    },
    'contraction': {
        title: '删除与收缩 (Deletion & Contraction)',
        ideology: {
            title: '📉 去繁就简',
            content: '删除是去掉冗余，收缩是合并同类。这是"去繁就简"的改革过程。通过精简机构（合并节点）和优化流程（删除边），实现系统的高效运转。'
        },
        definition: '删除：从G中去掉顶点v或边e。收缩：将边e=(u,v)的两个端点合并为一个新顶点，并删除e。',
        controls: [
            { type: 'info', text: '拖拽节点到另一个节点进行收缩' },
            { type: 'btn', text: '重置', action: 'resetGraph' }
        ]
    },
    'union': {
        title: '并图与差图 (Union & Difference)',
        ideology: {
            title: '🤝 团结与求异',
            content: '并图是两个图的叠加，象征"求同存异、团结协作"。差图是两个图的差异，象征"保留特色"。在融合中寻找共同点，在差异中保持独特性。'
        },
        definition: '并图：G1∪G2 = (V1∪V2, E1∪E2)。差图：G1-G2 = (V1, E1-E2)。',
        controls: [
            { type: 'btn', text: '显示并图', action: 'showUnion' },
            { type: 'btn', text: '显示差图', action: 'showDifference' }
        ]
    }
};

// ===== Initialization =====
function init() {
    canvas = document.getElementById('graphCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    setupNavigation();
    setupInteraction();
    loadMode('subgraph');
}

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    if (currentMode) draw();
}

function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadMode(btn.dataset.mode);
        });
    });
}

function setupInteraction() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);
}

// ===== Logic =====
function loadMode(mode) {
    currentMode = mode;
    const config = MODES[mode];

    // Update UI
    document.getElementById('opTitle').textContent = config.title;
    document.getElementById('definitionContent').innerHTML = `
        <p>${config.definition}</p>
    `;
    document.getElementById('ideologyBox').innerHTML = `
        <div class="ideology-title">${config.ideology.title}</div>
        <div class="ideology-content">${config.ideology.content}</div>
    `;

    // Setup Controls
    const controlsDiv = document.getElementById('canvasControls');
    controlsDiv.innerHTML = '';
    config.controls.forEach(ctrl => {
        if (ctrl.type === 'btn') {
            const btn = document.createElement('button');
            btn.className = 'control-btn';
            btn.textContent = ctrl.text;
            btn.onclick = () => executeAction(ctrl.action);
            controlsDiv.appendChild(btn);
        } else if (ctrl.type === 'info') {
            const span = document.createElement('span');
            span.className = 'control-label';
            span.textContent = ctrl.text;
            controlsDiv.appendChild(span);
        }
    });

    // Reset State
    selectedNodes.clear();
    selectedEdges.clear();
    showComplement = false;
    secondaryGraph = null;

    // Generate Initial Graph
    generateBaseGraph();

    if (mode === 'union') {
        generateSecondaryGraph();
    }

    draw();
    updateStats();
}

function generateBaseGraph() {
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    graph = { nodes: [], edges: [] };
    const n = 6;
    const r = 120;

    for (let i = 0; i < n; i++) {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        graph.nodes.push({
            id: i,
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
            label: String.fromCharCode(65 + i)
        });
    }

    // Add some edges
    const edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3]];
    edges.forEach(e => graph.edges.push({ from: e[0], to: e[1] }));
}

function generateSecondaryGraph() {
    // A slightly different graph for Union
    secondaryGraph = { nodes: [], edges: [] };
    // Clone nodes but shift positions slightly for visual effect if needed, 
    // but for Union usually V1 U V2. Here we assume same V for simplicity or subset.
    // Let's add a new node and different edges.

    // Copy existing nodes
    graph.nodes.forEach(n => {
        secondaryGraph.nodes.push({ ...n });
    });

    // Different edges: [0,2], [2,4], [4,0] (Triangle)
    const edges = [[0, 2], [2, 4], [4, 0], [1, 5]];
    edges.forEach(e => secondaryGraph.edges.push({ from: e[0], to: e[1] }));
}

function executeAction(action) {
    if (action === 'resetSelection') {
        selectedNodes.clear();
        selectedEdges.clear();
        draw();
    } else if (action === 'showInduced') {
        // Auto select edges between selected nodes
        selectedEdges.clear();
        graph.edges.forEach((e, idx) => {
            if (selectedNodes.has(e.from) && selectedNodes.has(e.to)) {
                selectedEdges.add(idx);
            }
        });
        draw();
        showOverlay('已导出子图 (Induced Subgraph)');
    } else if (action === 'toggleComplement') {
        showComplement = !showComplement;
        draw();
    } else if (action === 'resetGraph') {
        generateBaseGraph();
        draw();
    } else if (action === 'showUnion') {
        showComplement = false; // reuse flag for mode state if needed, but here just draw
        // Logic handled in draw
        currentMode = 'union_display'; // Temporary sub-mode for drawing
        draw();
        showOverlay('显示并图 G1 ∪ G2');
    } else if (action === 'showDifference') {
        currentMode = 'diff_display';
        draw();
        showOverlay('显示差图 G1 - G2');
    }
}

function showOverlay(msg) {
    const el = document.getElementById('overlayMessage');
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 2000);
}

// ===== Interaction Handlers =====
function handleMouseDown(e) {
    if (currentMode !== 'contraction') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nodeIdx = graph.nodes.findIndex(n => Math.hypot(n.x - x, n.y - y) < 20);
    if (nodeIdx !== -1) {
        isDragging = true;
        draggedNode = nodeIdx;
    }
}

function handleMouseMove(e) {
    if (!isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    graph.nodes[draggedNode].x = x;
    graph.nodes[draggedNode].y = y;
    draw();
}

function handleMouseUp(e) {
    if (!isDragging) return;

    // Check for merge
    const targetIdx = graph.nodes.findIndex((n, i) =>
        i !== draggedNode && Math.hypot(n.x - graph.nodes[draggedNode].x, n.y - graph.nodes[draggedNode].y) < 30
    );

    if (targetIdx !== -1) {
        // Contract!
        contractNodes(targetIdx, draggedNode);
    }

    isDragging = false;
    draggedNode = null;
    draw();
}

function handleClick(e) {
    if (currentMode !== 'subgraph') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Toggle Node
    const nodeIdx = graph.nodes.findIndex(n => Math.hypot(n.x - x, n.y - y) < 20);
    if (nodeIdx !== -1) {
        if (selectedNodes.has(nodeIdx)) selectedNodes.delete(nodeIdx);
        else selectedNodes.add(nodeIdx);
        draw();
        return;
    }
}

function contractNodes(target, source) {
    // Merge source into target
    const sourceId = graph.nodes[source].id;
    const targetId = graph.nodes[target].id;

    // Update edges
    graph.edges = graph.edges.map(e => {
        if (e.from === source) e.from = target;
        if (e.to === source) e.to = target;
        return e;
    }).filter(e => e.from !== e.to); // Remove self-loops

    // Remove source node
    graph.nodes.splice(source, 1);

    // Fix indices in edges
    graph.edges.forEach(e => {
        if (e.from > source) e.from--;
        if (e.to > source) e.to--;
    });

    showOverlay('节点已收缩合并');
}

// ===== Drawing =====
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentMode === 'union_display' || currentMode === 'diff_display') {
        drawUnionDiff();
        return;
    }

    // Draw Edges
    if (currentMode === 'complement' && showComplement) {
        // Draw Complement Edges
        ctx.strokeStyle = '#fa8c16';
        ctx.setLineDash([5, 5]);
        const n = graph.nodes.length;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                // Check if edge exists in G
                const exists = graph.edges.some(e =>
                    (e.from === i && e.to === j) || (e.from === j && e.to === i)
                );
                if (!exists) {
                    const n1 = graph.nodes[i];
                    const n2 = graph.nodes[j];
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.stroke();
                }
            }
        }
        ctx.setLineDash([]);

        // Draw original edges faintly
        ctx.strokeStyle = 'rgba(24, 144, 255, 0.2)';
        graph.edges.forEach(e => {
            const n1 = graph.nodes[e.from];
            const n2 = graph.nodes[e.to];
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
        });
    } else {
        // Normal Draw
        graph.edges.forEach((e, idx) => {
            const n1 = graph.nodes[e.from];
            const n2 = graph.nodes[e.to];

            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);

            if (currentMode === 'subgraph') {
                if (selectedEdges.has(idx)) {
                    ctx.strokeStyle = '#52c41a';
                    ctx.lineWidth = 3;
                } else {
                    ctx.strokeStyle = '#e8e8e8';
                    ctx.lineWidth = 1;
                }
            } else {
                ctx.strokeStyle = '#1890ff';
                ctx.lineWidth = 2;
            }
            ctx.stroke();
        });
    }

    // Draw Nodes
    graph.nodes.forEach((n, idx) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 20, 0, 2 * Math.PI);

        if (currentMode === 'subgraph' && selectedNodes.has(idx)) {
            ctx.fillStyle = '#f6ffed';
            ctx.strokeStyle = '#52c41a';
        } else {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = '#1890ff';
        }

        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label, n.x, n.y);
    });
}

function drawUnionDiff() {
    // Draw Union: G1 edges + G2 edges
    // Draw Diff: G1 edges - G2 edges (assuming G2 is subset or just diff logic)
    // Here: G1 is Base, G2 is Secondary

    // Draw G1 (Base)
    graph.edges.forEach(e => {
        const n1 = graph.nodes[e.from];
        const n2 = graph.nodes[e.to];

        // Check if in G2
        const inG2 = secondaryGraph.edges.some(e2 =>
            (e2.from === e.from && e2.to === e.to) || (e2.from === e.to && e2.to === e.from)
        );

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);

        if (currentMode === 'union_display') {
            ctx.strokeStyle = '#1890ff'; // G1 color
            if (inG2) ctx.strokeStyle = '#722ed1'; // Overlap
        } else {
            // Diff: G1 - G2
            if (inG2) {
                ctx.strokeStyle = 'rgba(0,0,0,0.05)'; // Removed
            } else {
                ctx.strokeStyle = '#1890ff'; // Kept
            }
        }
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    if (currentMode === 'union_display') {
        // Draw G2 exclusive edges
        secondaryGraph.edges.forEach(e => {
            const inG1 = graph.edges.some(e1 =>
                (e1.from === e.from && e1.to === e.to) || (e1.from === e.to && e1.to === e.from)
            );

            if (!inG1) {
                const n1 = graph.nodes[e.from];
                const n2 = graph.nodes[e.to];
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.strokeStyle = '#fa8c16'; // G2 color
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    }

    // Draw Nodes
    graph.nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#2c3e50';
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#2c3e50';
        ctx.fillText(n.label, n.x, n.y);
    });
}

function updateStats() {
    const list = document.getElementById('statsList');
    const n = graph.nodes.length;
    const m = graph.edges.length;

    list.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">当前顶点数</span>
            <span class="stat-value">${n}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">当前边数</span>
            <span class="stat-value">${m}</span>
        </div>
    `;
}
