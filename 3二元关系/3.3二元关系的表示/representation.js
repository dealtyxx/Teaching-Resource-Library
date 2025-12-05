/**
 * Red Mathematics - Relation Representations Visualizer
 */

// DOM Elements
const setList = document.getElementById('setList');
const matrixWrapper = document.getElementById('matrixWrapper');
const graphSvg = document.getElementById('graphSvg');
const nodesLayer = document.getElementById('nodesLayer');
const clearBtn = document.getElementById('clearBtn');
const randomBtn = document.getElementById('randomBtn');
const closureBtn = document.getElementById('closureBtn');
const insightText = document.getElementById('insightText');

// Data
const ELEMENTS = [1, 2, 3, 4];
const SIZE = ELEMENTS.length;

// State
let relation = new Set(); // Set of strings "u-v"

// Config
const NODE_RADIUS = 20;

// Initialization
function init() {
    renderAll();
}

// Core Logic
function toggleRelation(u, v) {
    const key = `${u}-${v}`;
    if (relation.has(key)) {
        relation.delete(key);
        updateInsight(`移除关系 (${u}, ${v})`, `Set: 删除记录 | Matrix: 置0 | Graph: 移除连线`);
    } else {
        relation.add(key);
        updateInsight(`添加关系 (${u}, ${v})`, `Set: 新增记录 | Matrix: 置1 | Graph: 添加连线`);
    }
    renderAll();
}

function renderAll() {
    renderSet();
    renderMatrix();
    renderGraph();
}

// View 1: Set Renderer
function renderSet() {
    setList.innerHTML = '';

    if (relation.size === 0) {
        setList.innerHTML = '<div class="empty-state">R = ∅</div>';
        return;
    }

    // Sort for display
    const pairs = Array.from(relation).map(k => k.split('-').map(Number)).sort((a, b) => {
        if (a[0] !== b[0]) return a[0] - b[0];
        return a[1] - b[1];
    });

    pairs.forEach(([u, v]) => {
        const el = document.createElement('div');
        el.className = 'set-pair';
        el.innerHTML = `(${u}, ${v}) <span class="pair-remove">×</span>`;
        el.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent re-triggering if we add click to container
            toggleRelation(u, v);
        });
        // Hover effect sync
        el.addEventListener('mouseenter', () => highlightPair(u, v, true));
        el.addEventListener('mouseleave', () => highlightPair(u, v, false));

        setList.appendChild(el);
    });
}

// View 2: Matrix Renderer
function renderMatrix() {
    matrixWrapper.innerHTML = '';
    matrixWrapper.style.gridTemplateColumns = `auto repeat(${SIZE}, 1fr)`;

    // Header Row
    matrixWrapper.appendChild(createMatrixHeader('M'));
    ELEMENTS.forEach(el => matrixWrapper.appendChild(createMatrixHeader(el)));

    // Rows
    ELEMENTS.forEach(u => {
        // Row Header
        matrixWrapper.appendChild(createMatrixHeader(u));

        // Cells
        ELEMENTS.forEach(v => {
            const key = `${u}-${v}`;
            const isActive = relation.has(key);

            const cell = document.createElement('div');
            cell.className = isActive ? 'matrix-cell active' : 'matrix-cell';
            cell.id = `cell-${u}-${v}`;
            cell.textContent = isActive ? '1' : '0';

            cell.addEventListener('click', () => toggleRelation(u, v));
            cell.addEventListener('mouseenter', () => highlightPair(u, v, true));
            cell.addEventListener('mouseleave', () => highlightPair(u, v, false));

            matrixWrapper.appendChild(cell);
        });
    });
}

function createMatrixHeader(text) {
    const el = document.createElement('div');
    el.className = 'matrix-header-cell';
    el.textContent = text;
    return el;
}

// View 3: Graph Renderer
function renderGraph() {
    // Calculate Layout (Circular)
    const width = document.querySelector('.graph-panel').clientWidth;
    const height = document.querySelector('.graph-panel').clientHeight - 60; // minus header
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    const nodePositions = {};
    const angleStep = (2 * Math.PI) / SIZE;

    ELEMENTS.forEach((val, idx) => {
        const angle = -Math.PI / 2 + idx * angleStep;
        nodePositions[val] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });

    // Render Nodes
    nodesLayer.innerHTML = '';
    ELEMENTS.forEach(val => {
        const pos = nodePositions[val];
        const node = document.createElement('div');
        node.className = 'graph-node';
        node.textContent = val;
        node.style.left = `${pos.x - NODE_RADIUS}px`;
        node.style.top = `${pos.y - NODE_RADIUS}px`;
        nodesLayer.appendChild(node);
    });

    // Render Edges
    // We render ALL possible edges as ghost edges for interaction, 
    // and active edges on top.

    // Clear SVG (keep defs)
    const defs = graphSvg.querySelector('defs');
    graphSvg.innerHTML = '';
    graphSvg.appendChild(defs);

    ELEMENTS.forEach(u => {
        ELEMENTS.forEach(v => {
            const key = `${u}-${v}`;
            const isActive = relation.has(key);
            const posU = nodePositions[u];
            const posV = nodePositions[v];

            // Path calculation
            let d = '';
            if (u === v) {
                // Loop
                const r = NODE_RADIUS;
                // Direction depends on position relative to center to point outward
                const dx = posU.x - centerX;
                const dy = posU.y - centerY;
                const len = Math.sqrt(dx * dx + dy * dy);
                const nx = dx / len;
                const ny = dy / len;

                // Control points outward
                const cp1x = posU.x + nx * 50 - ny * 30;
                const cp1y = posU.y + ny * 50 + nx * 30;
                const cp2x = posU.x + nx * 50 + ny * 30;
                const cp2y = posU.y + ny * 50 - nx * 30;

                d = `M ${posU.x + nx * r} ${posU.y + ny * r} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${posU.x + nx * r + ny * 5} ${posU.y + ny * r - nx * 5}`;
            } else {
                // Edge
                const dx = posV.x - posU.x;
                const dy = posV.y - posU.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const offset = NODE_RADIUS + 5;

                const startX = posU.x + (dx / dist) * offset;
                const startY = posU.y + (dy / dist) * offset;
                const endX = posV.x - (dx / dist) * offset;
                const endY = posV.y - (dy / dist) * offset;

                // Curve for bidirectionality visibility
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                const perpX = -dy * 0.15;
                const perpY = dx * 0.15;

                d = `M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`;
            }

            // Ghost Edge (Clickable area)
            const ghost = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            ghost.setAttribute('d', d);
            ghost.setAttribute('class', 'ghost-edge');
            ghost.addEventListener('click', () => toggleRelation(u, v));
            ghost.addEventListener('mouseenter', () => highlightPair(u, v, true));
            ghost.addEventListener('mouseleave', () => highlightPair(u, v, false));
            graphSvg.appendChild(ghost);

            // Active Edge
            if (isActive) {
                const edge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                edge.setAttribute('d', d);
                edge.setAttribute('class', u === v ? 'graph-edge loop' : 'graph-edge');
                edge.id = `edge-${u}-${v}`;
                graphSvg.appendChild(edge);
            }
        });
    });
}

// Interaction Helpers
function highlightPair(u, v, active) {
    // Highlight Matrix Cell
    const cell = document.getElementById(`cell-${u}-${v}`);
    if (cell) {
        cell.style.transform = active ? 'scale(1.1)' : '';
        cell.style.zIndex = active ? '10' : '';
        cell.style.boxShadow = active ? '0 0 10px rgba(0,0,0,0.2)' : '';
    }

    // Highlight Edge
    const edge = document.getElementById(`edge-${u}-${v}`);
    if (edge) {
        edge.style.strokeWidth = active ? '4' : '';
        edge.style.stroke = active ? '#c5a059' : '';
    }
}

function updateInsight(action, detail) {
    insightText.innerHTML = `<strong>${action}</strong>: ${detail}<br>辩证统一：三种表示法虽然形式不同，但描述的是同一个客观实体。`;
}

// Buttons
clearBtn.addEventListener('click', () => {
    relation.clear();
    renderAll();
    updateInsight("清空", "所有关系已移除");
});

randomBtn.addEventListener('click', () => {
    relation.clear();
    ELEMENTS.forEach(u => {
        ELEMENTS.forEach(v => {
            if (Math.random() > 0.7) relation.add(`${u}-${v}`);
        });
    });
    renderAll();
    updateInsight("随机生成", "创建了新的随机关系网络");
});

closureBtn.addEventListener('click', () => {
    // Symmetrize
    const newR = new Set(relation);
    relation.forEach(key => {
        const [u, v] = key.split('-');
        newR.add(`${v}-${u}`);
    });
    relation = newR;
    renderAll();
    updateInsight("对称化", "添加了所有逆关系，使图变为无向图(双向)");
});

// Handle Resize
window.addEventListener('resize', renderGraph);

// Init
init();
