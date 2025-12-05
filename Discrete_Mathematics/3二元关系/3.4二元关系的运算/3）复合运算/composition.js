/**
 * Red Mathematics - Relation Composition Visualizer
 */

// DOM Elements
const synthesizeBtn = document.getElementById('synthesizeBtn');
const resetBtn = document.getElementById('resetBtn');
const graphSvg = document.getElementById('graphSvg');
const nodesLayer = document.getElementById('nodesLayer');
const gridR = document.getElementById('gridR');
const gridS = document.getElementById('gridS');
const gridRes = document.getElementById('gridRes');
const insightTitle = document.getElementById('insightTitle');
const insightText = document.getElementById('insightText');

// Data
const SET_A = [
    { id: 'a1', label: '共同富裕', icon: '💰' },
    { id: 'a2', label: '绿色发展', icon: '🌱' },
    { id: 'a3', label: '科技强国', icon: '🚀' }
];

const SET_B = [
    { id: 'b1', label: '乡村振兴', icon: '🌾' },
    { id: 'b2', label: '碳中和', icon: '♻️' },
    { id: 'b3', label: '数字基建', icon: '📡' }
];

const SET_C = [
    { id: 'c1', label: '收入提升', icon: '📈' },
    { id: 'c2', label: '蓝天白云', icon: '☁️' },
    { id: 'c3', label: '智慧生活', icon: '📱' }
];

// Initial Relations
// R: A -> B
let relationR = new Set(['a1-b1', 'a2-b2', 'a3-b3']);
// S: B -> C
let relationS = new Set(['b1-c1', 'b2-c2', 'b3-c3', 'b1-c2']); // b1 also contributes to c2 (rural env)

// State
let isSynthesized = false;
let nodePositions = {};

// Config
const NODE_WIDTH = 100;
const NODE_HEIGHT = 60;

// Initialization
function init() {
    calculateLayout();
    renderNodes();
    renderEdges();
    renderMatrices();
}

// Layout
function calculateLayout() {
    const container = document.querySelector('.graph-panel');
    const width = container.clientWidth;
    const height = container.clientHeight - 60;

    const colWidth = width / 3;
    const rowHeightA = height / (SET_A.length + 1);
    const rowHeightB = height / (SET_B.length + 1);
    const rowHeightC = height / (SET_C.length + 1);

    SET_A.forEach((n, i) => {
        nodePositions[n.id] = { x: colWidth * 0.5, y: rowHeightA * (i + 1) + 30 };
    });
    SET_B.forEach((n, i) => {
        nodePositions[n.id] = { x: colWidth * 1.5, y: rowHeightB * (i + 1) + 30 };
    });
    SET_C.forEach((n, i) => {
        nodePositions[n.id] = { x: colWidth * 2.5, y: rowHeightC * (i + 1) + 30 };
    });
}

// Rendering - Graph
function renderNodes() {
    nodesLayer.innerHTML = '';

    const renderSet = (set, layerClass) => {
        set.forEach(n => {
            const pos = nodePositions[n.id];
            const el = document.createElement('div');
            el.className = `graph-node ${layerClass}`;
            el.innerHTML = `<div class="node-icon">${n.icon}</div><div>${n.label}</div>`;
            el.style.left = `${pos.x - NODE_WIDTH / 2}px`;
            el.style.top = `${pos.y - NODE_HEIGHT / 2}px`;
            el.id = `node-${n.id}`;

            // Interaction: Click to toggle edges (simplified: click A then B to toggle R)
            // For now, let's just make them clickable to highlight paths
            el.addEventListener('click', () => highlightPath(n.id));

            nodesLayer.appendChild(el);
        });
    };

    renderSet(SET_A, 'layer-a');
    renderSet(SET_B, 'layer-b');
    renderSet(SET_C, 'layer-c');
}

function renderEdges() {
    const defs = graphSvg.querySelector('defs');
    graphSvg.innerHTML = '';
    graphSvg.appendChild(defs);

    // Render R (A -> B)
    relationR.forEach(key => {
        const [u, v] = key.split('-');
        renderEdge(u, v, 'edge-r');
    });

    // Render S (B -> C)
    relationS.forEach(key => {
        const [u, v] = key.split('-');
        renderEdge(u, v, 'edge-s');
    });

    // Render Composition (A -> C) if synthesized
    if (isSynthesized) {
        const comp = calculateComposition();
        comp.forEach(key => {
            const [u, v] = key.split('-');
            renderEdge(u, v, 'edge-comp');
        });
    }
}

function renderEdge(u, v, className) {
    const start = nodePositions[u];
    const end = nodePositions[v];

    // Offset for box boundary
    // Simple approx: connect centers, but hide overlap with z-index or just let it be
    // Better: connect edges.

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // If composite, curve high
    let d;
    if (className === 'edge-comp') {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        // Curve upwards significantly to bypass B
        d = `M ${start.x} ${start.y} Q ${midX} ${Math.min(start.y, end.y) - 150} ${end.x} ${end.y}`;
    } else {
        // Straight line
        d = `M ${start.x + (dx > 0 ? NODE_WIDTH / 2 : -NODE_WIDTH / 2)} ${start.y} L ${end.x - (dx > 0 ? NODE_WIDTH / 2 : -NODE_WIDTH / 2)} ${end.y}`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', `graph-edge ${className}`);
    path.id = `edge-${u}-${v}`;
    graphSvg.appendChild(path);
}

// Logic - Composition
function calculateComposition() {
    const result = new Set();
    relationR.forEach(rKey => {
        const [a, b] = rKey.split('-');
        relationS.forEach(sKey => {
            const [b2, c] = sKey.split('-');
            if (b === b2) {
                result.add(`${a}-${c}`);
            }
        });
    });
    return result;
}

// Rendering - Matrices
function renderMatrices() {
    renderMatrix(gridR, SET_A, SET_B, relationR, 'R');
    renderMatrix(gridS, SET_B, SET_C, relationS, 'S');

    const compRelation = calculateComposition();
    renderMatrix(gridRes, SET_A, SET_C, compRelation, 'Res', isSynthesized);
}

function renderMatrix(container, rows, cols, relation, type, isVisible = true) {
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${cols.length}, 1fr)`;

    rows.forEach(r => {
        cols.forEach(c => {
            const key = `${r.id}-${c.id}`;
            const isActive = relation.has(key);

            const cell = document.createElement('div');
            cell.className = `matrix-cell ${isActive && isVisible ? 'active' : ''}`;
            cell.textContent = isActive && isVisible ? '1' : '0';
            cell.dataset.key = key;

            // Interaction: Toggle R or S
            if (type !== 'Res') {
                cell.style.cursor = 'pointer';
                cell.addEventListener('click', () => {
                    if (relation.has(key)) relation.delete(key);
                    else relation.add(key);

                    // Reset synthesis if base changes
                    if (isSynthesized) {
                        isSynthesized = false;
                        updateInsight(false);
                    }

                    renderEdges();
                    renderMatrices();
                });
            }

            container.appendChild(cell);
        });
    });
}

function highlightPath(nodeId) {
    // Reset highlights
    document.querySelectorAll('.graph-node').forEach(el => el.style.opacity = '1');
    document.querySelectorAll('.graph-edge').forEach(el => el.style.opacity = '0.6');

    // Simple highlight logic: find connected edges
    // If A clicked: show A->B and B->C
    // If B clicked: show A->B and B->C
    // If C clicked: show B->C and A->B leading to it

    // TODO: Implement full path tracing if needed. 
    // For now, just a visual feedback that node was clicked.
    const node = document.getElementById(`node-${nodeId}`);
    node.style.transform = 'scale(1.1)';
    setTimeout(() => node.style.transform = '', 200);
}

function updateInsight(synthesized) {
    if (synthesized) {
        insightTitle.textContent = "愿景实现 (Realized)";
        insightText.textContent = "通过复合运算 S ∘ R，我们将战略目标与现实成果直接关联。每一条金色连线，都代表着从蓝图到现实的成功跨越。";
    } else {
        insightTitle.textContent = "准备就绪 (Ready)";
        insightText.textContent = "点击矩阵单元格可调整部署(R)或落实(S)方案。点击'实现愿景'查看最终成效。";
    }
}

// Event Listeners
synthesizeBtn.addEventListener('click', () => {
    isSynthesized = true;
    renderEdges();
    renderMatrices();
    updateInsight(true);
});

resetBtn.addEventListener('click', () => {
    relationR = new Set(['a1-b1', 'a2-b2', 'a3-b3']);
    relationS = new Set(['b1-c1', 'b2-c2', 'b3-c3', 'b1-c2']);
    isSynthesized = false;
    renderEdges();
    renderMatrices();
    updateInsight(false);
});

window.addEventListener('resize', () => {
    calculateLayout();
    renderNodes();
    renderEdges();
});

// Init
init();
