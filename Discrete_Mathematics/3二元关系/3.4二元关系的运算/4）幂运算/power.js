/**
 * Red Mathematics - Relation Power Visualizer
 */

// DOM Elements
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const autoBtn = document.getElementById('autoBtn');
const resetBtn = document.getElementById('resetBtn');
const powerDisplay = document.getElementById('powerDisplay');
const graphSvg = document.getElementById('graphSvg');
const nodesLayer = document.getElementById('nodesLayer');
const matrixGrid = document.getElementById('matrixGrid');
const insightTitle = document.getElementById('insightTitle');
const insightText = document.getElementById('insightText');
const progressFill = document.getElementById('progressFill');

// Data: A directed graph (6 nodes)
// Designed to have paths of length 1, 2, 3, 4, 5
const NODES = [1, 2, 3, 4, 5, 6];
const BASE_RELATION = [
    [1, 2], [1, 3],
    [2, 4],
    [3, 4], [3, 5],
    [4, 6],
    [5, 6],
    [6, 1] // Cycle to make it interesting (infinite powers?)
];

// State
let currentPower = 1;
let maxPower = 6; // Limit for demo
let isAutoPlaying = false;
let autoInterval = null;
let nodePositions = {};
let layoutFrame = null;

// Config
const NODE_RADIUS = 25;

// Initialization
function init() {
    calculateLayout();
    updateView();
}

// Layout (Circular)
function calculateLayout() {
    const container = document.getElementById('graphContainer');
    const rect = container.getBoundingClientRect();
    const width = Math.max(260, Math.round(rect.width || container.clientWidth || 520));
    const height = Math.max(300, Math.round(rect.height || container.clientHeight || 420));
    const centerX = width / 2;
    const centerY = height / 2;
    const safePad = NODE_RADIUS + 24;
    const radius = Math.max(42, (Math.min(width, height) / 2) - safePad);

    graphSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    graphSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    NODES.forEach((val, idx) => {
        const angle = (idx / NODES.length) * 2 * Math.PI - Math.PI / 2;
        nodePositions[val] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });
}

// Logic - Matrix Multiplication
function multiplyMatrices(m1, m2) {
    const size = NODES.length;
    const result = Array(size).fill(0).map(() => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            for (let k = 0; k < size; k++) {
                if (m1[i][k] && m2[k][j]) {
                    result[i][j] = 1;
                    break; // Boolean multiplication
                }
            }
        }
    }
    return result;
}

function getMatrixForPower(n) {
    const size = NODES.length;
    // Base matrix
    let baseM = Array(size).fill(0).map(() => Array(size).fill(0));
    BASE_RELATION.forEach(([u, v]) => {
        baseM[u - 1][v - 1] = 1;
    });

    if (n === 1) return baseM;

    let currentM = baseM;
    for (let i = 1; i < n; i++) {
        currentM = multiplyMatrices(currentM, baseM);
    }
    return currentM;
}

function getPreviousMatrix(n) {
    if (n <= 1) return null;
    return getMatrixForPower(n - 1);
}

// Rendering
function renderNodes() {
    nodesLayer.innerHTML = '';
    NODES.forEach(val => {
        const pos = nodePositions[val];
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'svg-node');
        g.setAttribute('transform', `translate(${pos.x} ${pos.y})`);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', NODE_RADIUS);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.textContent = val;

        g.appendChild(circle);
        g.appendChild(text);
        graphSvg.appendChild(g);
    });
}

function updateView() {
    // 1. Calculate Matrix
    const matrix = getMatrixForPower(currentPower);
    const prevMatrix = getPreviousMatrix(currentPower);

    // 2. Render Graph Edges
    const defs = graphSvg.querySelector('defs');
    graphSvg.innerHTML = '';
    graphSvg.appendChild(defs);

    // Render base edges faintly
    BASE_RELATION.forEach(([u, v]) => {
        renderEdge(u, v, 'graph-edge');
    });

    // Render active power edges
    // If n=1, they are the same.
    // If n>1, we show the "shortcuts" created by power n
    for (let i = 0; i < NODES.length; i++) {
        for (let j = 0; j < NODES.length; j++) {
            if (matrix[i][j]) {
                const u = i + 1;
                const v = j + 1;

                // Check if this is "new" in this power (not present in n-1? No, power n is specific length n)
                // But visually, we want to highlight what R^n means.
                // It means there is a path of length n.

                // Let's highlight edges that represent R^n
                // If n=1, highlight base edges.
                // If n>1, draw curved "shortcuts".

                if (currentPower === 1) {
                    // Already drawn base edges, just make them active
                    const existing = document.getElementById(`edge-${u}-${v}`); // Wait, I didn't ID them above
                    // Re-draw active on top
                    renderEdge(u, v, 'graph-edge active');
                } else {
                    // Draw shortcut
                    renderEdge(u, v, 'graph-edge new-path', true);
                }
            }
        }
    }

    renderNodes();

    // 3. Render Matrix Grid
    renderMatrixGrid(matrix, prevMatrix);

    // 4. Update UI Text
    powerDisplay.textContent = `R${toSuperscript(currentPower)}`;
    updateInsight();

    // 5. Controls
    prevBtn.disabled = currentPower <= 1;
    nextBtn.disabled = currentPower >= maxPower;

    // 6. Progress
    progressFill.style.width = `${(currentPower / maxPower) * 100}%`;
}

function renderEdge(u, v, className, isCurved = false) {
    const start = nodePositions[u];
    const end = nodePositions[v];

    let d;
    if (u === v) {
        const loopR = NODE_RADIUS + 16;
        const sx = start.x + NODE_RADIUS * 0.4;
        const sy = start.y - NODE_RADIUS * 0.9;
        const ex = start.x + NODE_RADIUS * 0.9;
        const ey = start.y - NODE_RADIUS * 0.35;
        d = `M ${sx} ${sy} C ${start.x + loopR} ${start.y - loopR}, ${start.x - loopR} ${start.y - loopR}, ${ex} ${ey}`;
    } else {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const ux = dx / dist;
        const uy = dy / dist;
        const sourceInset = NODE_RADIUS;
        const targetInset = NODE_RADIUS;
        const sx = start.x + ux * sourceInset;
        const sy = start.y + uy * sourceInset;
        const ex = end.x - ux * targetInset;
        const ey = end.y - uy * targetInset;

        if (isCurved) {
            const midX = (sx + ex) / 2;
            const midY = (sy + ey) / 2;
            const curve = 34 + dist * 0.08;
            const cx = midX - uy * curve;
            const cy = midY + ux * curve;
            d = `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
        } else {
            d = `M ${sx} ${sy} L ${ex} ${ey}`;
        }
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', className);
    graphSvg.appendChild(path);
}

function renderMatrixGrid(matrix, prevMatrix) {
    matrixGrid.innerHTML = '';
    const size = NODES.length;
    matrixGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const val = matrix[i][j];
            const cell = document.createElement('div');
            let className = 'matrix-cell';

            if (val) {
                className += ' active';
                // Highlight if it's "newly reachable" compared to n-1? 
                // R^n is strictly paths of length n.
                // But often we care about Transitive Closure (R U R^2 U ...).
                // Let's stick to strict R^n for now, but highlight it as "Active".
                // If we want to show "New Reach", we'd compare to Union(R...R^(n-1)).
                // Let's just highlight all 1s in R^n.

                // To make it pop, if it wasn't in R^(n-1), maybe give it a special glow?
                // But R^n might lose connections R^(n-1) had.
                // e.g. 1->2 (R), 1->3 (R^2). 1->2 is NOT in R^2.

                className += ' newly-active';
            }

            cell.className = className;
            cell.textContent = val;
            matrixGrid.appendChild(cell);
        }
    }
}

function updateInsight() {
    const n = currentPower;
    if (n === 1) {
        insightTitle.textContent = "初始阶段 (Initial Stage)";
        insightText.textContent = "R¹ 代表直接的影响力。思想的火种刚刚点燃，开始照亮周围。";
    } else if (n === 2) {
        insightTitle.textContent = "次级传播 (Secondary Propagation)";
        insightText.textContent = "R² 代表影响力的延伸。通过一个中间人，思想传达给了更远的人。";
    } else if (n >= 3 && n < 6) {
        insightTitle.textContent = "深远影响 (Deep Reach)";
        insightText.textContent = `R${toSuperscript(n)} 代表跨越 ${n} 代的传承。思想在时间的长河中流淌，历久弥新。`;
    } else {
        insightTitle.textContent = "生生不息 (Infinite Cycle)";
        insightText.textContent = "随着迭代的继续，如果存在回路，影响力将生生不息，形成闭环。";
    }
}

function toSuperscript(n) {
    const supers = "⁰¹²³⁴⁵⁶⁷⁸⁹";
    return n.toString().split('').map(d => supers[d]).join('');
}

// Event Listeners
nextBtn.addEventListener('click', () => {
    if (currentPower < maxPower) {
        currentPower++;
        updateView();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentPower > 1) {
        currentPower--;
        updateView();
    }
});

resetBtn.addEventListener('click', () => {
    currentPower = 1;
    stopAutoPlay();
    updateView();
});

autoBtn.addEventListener('click', () => {
    if (isAutoPlaying) stopAutoPlay();
    else startAutoPlay();
});

function startAutoPlay() {
    isAutoPlaying = true;
    autoBtn.classList.add('active'); // Add visual state if needed
    autoBtn.querySelector('.btn-text').textContent = "暂停 (Pause)";
    autoBtn.querySelector('.btn-icon').textContent = "⏸️";

    if (currentPower >= maxPower) currentPower = 0; // Loop

    autoInterval = setInterval(() => {
        if (currentPower < maxPower) {
            currentPower++;
            updateView();
        } else {
            // Loop or stop? Let's loop
            currentPower = 1;
            updateView();
        }
    }, 1500);
}

function stopAutoPlay() {
    isAutoPlaying = false;
    clearInterval(autoInterval);
    autoBtn.querySelector('.btn-text').textContent = "演进 (Auto)";
    autoBtn.querySelector('.btn-icon').textContent = "▶️";
}

window.addEventListener('resize', () => {
    relayoutGraph();
});

function relayoutGraph() {
    if (layoutFrame) cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(() => {
        calculateLayout();
        updateView();
        layoutFrame = null;
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
