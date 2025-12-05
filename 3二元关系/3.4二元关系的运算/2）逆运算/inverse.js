/**
 * Red Mathematics - Inverse Relation Visualizer
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
    { id: 1, label: '1921', x: 0.1, y: 0.5 },
    { id: 2, label: '1949', x: 0.4, y: 0.5 },
    { id: 3, label: '1978', x: 0.7, y: 0.5 },
    { id: 4, label: '2025', x: 0.9, y: 0.5 }
];

// State
let relation = new Set(['1-2', '2-3', '3-4']); // "u-v"
let isInverted = false;
let isEditing = false;
let nodePositions = {}; // Calculated pixel positions

// Config
const NODE_RADIUS = 30;

// Initialization
function init() {
    calculateLayout();
    renderNodes();
    renderGraph();
    renderMatrix();
    updateInsight();
}

// Layout
function calculateLayout() {
    const width = document.querySelector('.topology-panel').clientWidth;
    const height = document.querySelector('.topology-panel').clientHeight - 60;

    NODES.forEach(node => {
        nodePositions[node.id] = {
            x: node.x * width,
            y: node.y * height + 30
        };
    });
}

// Rendering - Topology
function renderNodes() {
    nodesLayer.innerHTML = '';
    NODES.forEach(node => {
        const pos = nodePositions[node.id];
        const el = document.createElement('div');
        el.className = `graph-node ${isInverted ? 'inverted' : ''}`;
        el.textContent = node.label;
        el.style.left = `${pos.x - NODE_RADIUS}px`;
        el.style.top = `${pos.y - NODE_RADIUS}px`;
        nodesLayer.appendChild(el);
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
            renderEdge(v, u, false, true);
        } else {
            renderEdge(u, v, false, false);
        }
    });
}

function renderEdge(u, v, isGhost, isInverseDisplay) {
    const posU = nodePositions[u];
    const posV = nodePositions[v];

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
    const offset = NODE_RADIUS + 5;

    const startX = start.x + (dx / dist) * offset;
    const startY = start.y + (dy / dist) * offset;
    const endX = end.x - (dx / dist) * offset;
    const endY = end.y - (dy / dist) * offset;

    // Curve
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    // Arc amount
    const arc = 40;
    // Direction of arc depends on u,v to avoid overlap for bi-directional
    // Simple heuristic: always arc "up" relative to the line
    const perpX = -dy / dist * arc;
    const perpY = dx / dist * arc;

    const d = `M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`;

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
    matrixGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    // We render the matrix of the CURRENT view (R or R^-1)
    // If R has (1,2), M[1][2] = 1.
    // If Inverted, we show M^T. So M[2][1] = 1.

    for (let i = 0; i < size; i++) {
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
        invertBtn.querySelector('.btn-text').textContent = "重返未来 (Return)";
    } else {
        invertBtn.classList.remove('inverted');
        invertBtn.querySelector('.btn-text').textContent = "回望历史 (Invert Time)";
    }

    // Re-render
    renderNodes(); // Update colors
    renderGraph(); // Update arrows
    renderMatrix(); // Update grid
    updateInsight();
}

function updateInsight() {
    if (isInverted) {
        insightTitle.textContent = "当前状态: 回望 (Inverse)";
        insightTitle.style.color = "var(--accent-blue)";
        insightText.textContent = "关系 R⁻¹ 指向过去 (Mᵀ)。通过转置矩阵与反转箭头，我们追溯发展的源头，铭记历史的馈赠。";
        mathBadge.textContent = "R⁻¹";
    } else {
        insightTitle.textContent = "当前状态: 发展 (Forward)";
        insightTitle.style.color = "var(--accent-red)";
        insightText.textContent = "关系 R 指向未来 (M)。象征着从先辈到吾辈，薪火相传，不断开拓新的征程。";
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
    calculateLayout();
    renderNodes();
    renderGraph();
});

// Init
init();
