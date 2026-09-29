/**
 * 3.4 二元关系的运算 · 逆运算专项练习：关系图箭头反向 + 矩阵转置
 */

// DOM Elements
const invertBtn = document.getElementById('invertBtn');
const editModeToggle = document.getElementById('editModeToggle');
const graphSvg = document.getElementById('graphSvg');
const nodesLayer = document.getElementById('nodesLayer');
const matrixGrid = document.getElementById('matrixGrid');
const insightTitle = document.getElementById('insightTitle');
const insightText = document.getElementById('insightText');
const mathBadge = document.getElementById('mathBadge');
const appContainer = document.querySelector('.app-container');

// Data
const NODES = [
    { id: 1, label: '1921', x: 0, y: 0.46 },
    { id: 2, label: '1949', x: 0.34, y: 0.46 },
    { id: 3, label: '1978', x: 0.68, y: 0.46 },
    { id: 4, label: '2025', x: 1, y: 0.46 }
];

// State
let relation = new Set(['1-2', '2-3', '3-4']); // "u-v"
let isInverted = false;
let isEditing = false;
let nodePositions = {}; // Calculated pixel positions
let layoutFrame = null;

// Config
const NODE_RADIUS = 26;

// Initialization
function init() {
    calculateLayout();
    renderGraph();
    renderMatrix();
    updateInsight();
}

// Layout
function calculateLayout() {
    const container = document.getElementById('graphContainer');
    const rect = container.getBoundingClientRect();
    const width = Math.max(320, Math.round(rect.width || container.clientWidth || 640));
    const height = Math.max(280, Math.round(rect.height || container.clientHeight || 420));
    const padX = NODE_RADIUS + 18;
    const padY = NODE_RADIUS + 34;

    graphSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    graphSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    NODES.forEach(node => {
        nodePositions[node.id] = {
            x: padX + node.x * (width - padX * 2),
            y: padY + node.y * (height - padY * 2)
        };
    });
}

// Rendering - Topology
function renderNodes() {
    nodesLayer.innerHTML = '';
    NODES.forEach(node => {
        const pos = nodePositions[node.id];
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', `svg-node ${isInverted ? 'inverted' : ''}`);
        g.setAttribute('transform', `translate(${pos.x} ${pos.y})`);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', NODE_RADIUS);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.textContent = node.label;

        g.appendChild(circle);
        g.appendChild(text);
        graphSvg.appendChild(g);
    });
}

function renderGraph() {
    // Clear SVG but keep defs
    const defs = graphSvg.querySelector('defs');
    graphSvg.innerHTML = '';
    graphSvg.appendChild(defs);

    // Render all possible connections as ghost edges for editing
    if (isEditing) {
        NODES.forEach(u => {
            NODES.forEach(v => {
                if (u.id !== v.id) renderEdge(u.id, v.id, true);
            });
        });
    }

    // Render active edges
    relation.forEach(key => {
        const [u, v] = key.split('-').map(Number);
        // If inverted, we render v->u but visually styled as inverse
        if (isInverted) {
            renderEdge(u, v, false, true);
        } else {
            renderEdge(u, v, false, false);
        }
    });

    renderNodes();
}

function renderEdge(u, v, isGhost, isInverseDisplay) {
    const posU = nodePositions[u];
    const posV = nodePositions[v];
    if (!posU || !posV) return;

    // If we are displaying inverse, the logical relation is u->v (in R^-1), 
    // which corresponds to v->u in R.
    // Wait, if R has (1,2), R^-1 has (2,1).
    // If isInverted is true, we iterate R's keys (1,2), and we want to draw 2->1.
    // So u=1, v=2. We draw v->u.

    // Actual start and end points for drawing
    let start, end;
    if (isInverseDisplay) {
        start = nodePositions[v];
        end = nodePositions[u];
    } else {
        start = nodePositions[u];
        end = nodePositions[v];
    }

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (!dist) return;
    const offset = NODE_RADIUS + 1;

    const startX = start.x + (dx / dist) * offset;
    const startY = start.y + (dy / dist) * offset;
    const endX = end.x - (dx / dist) * offset;
    const endY = end.y - (dy / dist) * offset;

    // Curve
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const chord = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    const arc = Math.min(72, Math.max(34, chord * 0.34));
    const controlX = midX;
    const controlY = midY - arc;

    const d = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);

    if (isGhost) {
        path.setAttribute('class', 'ghost-edge');
        path.addEventListener('click', () => toggleConnection(u, v));
    } else {
        path.setAttribute('class', `graph-edge ${isInverted ? 'inverted' : ''}`);
        // Animate the path drawing
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        // Trigger reflow
        path.getBoundingClientRect();
        path.style.transition = 'stroke-dashoffset 1s ease-in-out';
        path.style.strokeDashoffset = '0';
    }

    graphSvg.appendChild(path);
}

// Rendering - Algebra
function renderMatrix() {
    matrixGrid.innerHTML = '';
    const size = NODES.length;
    matrixGrid.style.gridTemplateColumns = `auto repeat(${size}, 1fr)`;
    const hdr = (text, extra) => {
        const h = document.createElement('div');
        h.className = 'matrix-hdr' + (extra ? ' ' + extra : '');
        h.textContent = text;
        matrixGrid.appendChild(h);
    };
    hdr(isInverted ? 'R⁻¹' : 'R', 'corner');
    NODES.forEach(nd => hdr(nd.label));

    // We render the matrix of the CURRENT view (R or R^-1)
    // If R has (1,2), M[1][2] = 1.
    // If Inverted, we show M^T. So M[2][1] = 1.

    for (let i = 0; i < size; i++) {
        hdr(NODES[i].label);
        for (let j = 0; j < size; j++) {
            const u = NODES[i].id;
            const v = NODES[j].id;

            // Check if (u,v) exists in the CURRENT view
            let isActive;
            if (isInverted) {
                // In R^-1, (u,v) exists if (v,u) is in R
                isActive = relation.has(`${v}-${u}`);
            } else {
                // In R, (u,v) exists if (u,v) is in R
                isActive = relation.has(`${u}-${v}`);
            }

            const cell = document.createElement('div');
            cell.className = `matrix-cell ${isActive ? 'active' : ''} ${isInverted ? 'inverted' : ''}`;
            cell.textContent = isActive ? '1' : '0';

            // Animation for Transposition
            // We assign a unique ID based on the R-relation pair it represents
            // If R has (1,2), the cell at (0,1) in Normal view represents it.
            // In Inverted view, the cell at (1,0) represents it.
            // We can use FLIP animation concept here if we want complex movement,
            // but simple CSS class switching with grid position is easier for now.
            // To make it look like flying, we'd need absolute positioning.
            // Let's stick to fade/color transition for robustness, as requested "Visuals" mentioned flying but code complexity might be high.
            // Actually, let's try a simple transform trick.

            matrixGrid.appendChild(cell);
        }
    }
}

// Logic
function toggleConnection(u, v) {
    // We always edit R, even if viewing Inverse (conceptually harder, so let's disable edit in inverse)
    if (isInverted) return;

    const key = `${u}-${v}`;
    if (relation.has(key)) {
        relation.delete(key);
    } else {
        relation.add(key);
    }
    renderGraph();
    renderMatrix();
}

function toggleInversion() {
    if (isEditing) {
        // Turn off edit mode first
        isEditing = false;
        editModeToggle.checked = false;
        appContainer.classList.remove('editing');
    }

    isInverted = !isInverted;

    // Update UI
    if (isInverted) {
        invertBtn.classList.add('inverted');
        invertBtn.querySelector('.btn-text').textContent = "再求逆：回到 R";
    } else {
        invertBtn.classList.remove('inverted');
        invertBtn.querySelector('.btn-text').textContent = "求逆：回望历史";
    }

    // Re-render
    renderGraph(); // Update arrows
    renderMatrix(); // Update grid
    updateInsight();
}

function updateInsight() {
    if (isInverted) {
        insightTitle.textContent = "当前：逆关系 R⁻¹（回望历史）";
        insightTitle.style.color = "var(--accent-blue)";
        insightText.textContent = "R⁻¹ 的每条箭头都指向过去，矩阵是 M_R 的转置。饮水思源：从今天回望来时路，追溯发展的源头。再求一次逆又回到 R，即 (R⁻¹)⁻¹ = R。";
        mathBadge.textContent = "R⁻¹";
    } else {
        insightTitle.textContent = "当前：关系 R（向前发展）";
        insightTitle.style.color = "var(--accent-red)";
        insightText.textContent = "R 的每条箭头都从先指向后：从先辈到吾辈，薪火相传。按「求逆」观察箭头掉头、矩阵沿主对角线翻转。";
        mathBadge.textContent = "R";
    }
}

// Event Listeners
invertBtn.addEventListener('click', toggleInversion);

editModeToggle.addEventListener('change', (e) => {
    isEditing = e.target.checked;
    if (isEditing && isInverted) {
        // Auto switch back to normal to edit
        toggleInversion();
    }
    if (isEditing) {
        appContainer.classList.add('editing');
    } else {
        appContainer.classList.remove('editing');
    }
    renderGraph();
});

window.addEventListener('resize', () => {
    relayoutGraph();
});

// 只有容器尺寸真的变化才重排：共享框架会反复派发 resize，无条件重绘会让连线的描绘动画永远重播
let lastGraphSize = '';
function relayoutGraph() {
    if (layoutFrame) cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(() => {
        layoutFrame = null;
        const c = document.getElementById('graphContainer');
        const size = Math.round(c.clientWidth) + 'x' + Math.round(c.clientHeight);
        if (size === lastGraphSize) return;
        lastGraphSize = size;
        calculateLayout();
        renderGraph();
    });
}

if ('ResizeObserver' in window) {
    const graphObserver = new ResizeObserver(() => relayoutGraph());
    graphObserver.observe(document.getElementById('graphContainer'));
    graphObserver.observe(document.querySelector('.app-container'));
}

// Init
init();
setTimeout(relayoutGraph, 80);
setTimeout(relayoutGraph, 320);
