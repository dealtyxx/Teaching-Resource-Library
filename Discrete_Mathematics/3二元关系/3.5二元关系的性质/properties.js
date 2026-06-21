/**
 * Red Mathematics - Relation Properties Visualizer
 */

// DOM Elements
const analyzeBtn = document.getElementById('analyzeBtn');
const exampleSelect = document.getElementById('exampleSelect');
const resetBtn = document.getElementById('resetBtn');
const graphSvg = document.getElementById('graphSvg');
const nodesLayer = document.getElementById('nodesLayer');

// Data
const NODES = [1, 2, 3, 4];
let edges = new Set(); // "u-v" format
let selectedNode = null;
let nodePositions = {};
let graphSize = { width: 0, height: 0, centerX: 0, centerY: 0 };
let layoutFrame = null;

// Config
const NODE_RADIUS = 20;

// Initialization
function init() {
    calculateLayout();
    renderEdges();
    updateAllProperties();
}

// Layout (Circular)
function calculateLayout() {
    const container = document.getElementById('graphContainer');
    const rect = container.getBoundingClientRect();
    const width = Math.max(180, Math.round(rect.width || container.clientWidth || 420));
    const height = Math.max(260, Math.round(rect.height || container.clientHeight || 520));
    const centerX = width / 2;
    const centerY = height / 2;
    const padding = NODE_RADIUS + 20;
    const availableRadius = Math.max(42, Math.min(width - padding * 2, height - padding * 2) / 2);
    const radiusX = Math.max(34, Math.min(availableRadius * 0.78, width / 2 - NODE_RADIUS - 36));
    const radiusY = availableRadius;

    graphSize = { width, height, centerX, centerY };
    graphSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    graphSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    NODES.forEach((val, idx) => {
        const angle = (idx / NODES.length) * 2 * Math.PI - Math.PI / 2;
        nodePositions[val] = {
            x: centerX + radiusX * Math.cos(angle),
            y: centerY + radiusY * Math.sin(angle)
        };
    });
}

// Rendering
function renderNodes() {
    nodesLayer.innerHTML = '';
    NODES.forEach(val => {
        const pos = nodePositions[val];
        if (!pos) return;

        const el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        el.setAttribute('class', `svg-node ${selectedNode === val ? 'selecting' : ''}`);
        el.setAttribute('transform', `translate(${pos.x} ${pos.y})`);
        el.id = `node-${val}`;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', NODE_RADIUS);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.textContent = val;

        el.appendChild(circle);
        el.appendChild(text);
        el.addEventListener('click', () => handleNodeClick(val));

        graphSvg.appendChild(el);
    });
}

function renderEdges() {
    const defs = graphSvg.querySelector('defs');
    graphSvg.innerHTML = '';
    graphSvg.appendChild(defs);

    edges.forEach(key => {
        const [u, v] = key.split('-').map(Number);
        renderEdge(u, v);
    });

    renderNodes();
}

function renderEdge(u, v) {
    const posU = nodePositions[u];
    const posV = nodePositions[v];
    if (!posU || !posV) return;

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
        const dx = posV.x - posU.x;
        const dy = posV.y - posU.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (!dist) return;

        const offset = NODE_RADIUS + 3;
        const startX = posU.x + (dx / dist) * offset;
        const startY = posU.y + (dy / dist) * offset;
        const endX = posV.x - (dx / dist) * offset;
        const endY = posV.y - (dy / dist) * offset;

        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const reverseExists = edges.has(`${v}-${u}`);
        const pairSign = u < v ? 1 : -1;
        const hop = Math.abs(NODES.indexOf(u) - NODES.indexOf(v));
        const arc = reverseExists ? 34 * pairSign : (hop > 1 ? 26 : 18) * pairSign;
        const perpX = -dy / dist * arc;
        const perpY = dx / dist * arc;

        d = `M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', `graph-edge ${u === v ? 'self-loop' : ''}`);
    path.setAttribute('data-edge', `${u}-${v}`);

    path.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleEdge(u, v);
    });

    graphSvg.appendChild(path);
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

// Interaction
function handleNodeClick(nodeId) {
    if (selectedNode === null) {
        // First selection
        selectedNode = nodeId;
        document.getElementById(`node-${nodeId}`).classList.add('selecting');
    } else {
        // Second selection - toggle edge
        const from = selectedNode;
        const to = nodeId;

        toggleEdge(from, to);

        // Clear selection
        document.getElementById(`node-${selectedNode}`).classList.remove('selecting');
        selectedNode = null;
    }
}

function toggleEdge(u, v) {
    const key = `${u}-${v}`;
    if (edges.has(key)) {
        edges.delete(key);
    } else {
        edges.add(key);
    }
    renderEdges();
}

// Property Checking
function checkReflexive() {
    for (const node of NODES) {
        if (!edges.has(`${node}-${node}`)) {
            return { satisfied: false, violations: [`节点 ${node} 缺少自环`] };
        }
    }
    return { satisfied: true, violations: [] };
}

function checkIrreflexive() {
    const violations = [];
    for (const node of NODES) {
        if (edges.has(`${node}-${node}`)) {
            violations.push(`节点 ${node} 存在自环`);
        }
    }
    return { satisfied: violations.length === 0, violations };
}

function checkSymmetric() {
    const violations = [];
    edges.forEach(key => {
        const [u, v] = key.split('-');
        if (u !== v) { // Skip self-loops
            const reverse = `${v}-${u}`;
            if (!edges.has(reverse)) {
                violations.push(`(${u},${v}) 存在但 (${v},${u}) 不存在`);
            }
        }
    });
    return { satisfied: violations.length === 0, violations };
}

function checkAntisymmetric() {
    const violations = [];
    const reported = new Set(); // avoid duplicate reports for each pair
    edges.forEach(key => {
        const [u, v] = key.split('-');
        if (u !== v) {
            const reverse = `${v}-${u}`;
            const pairKey = [u, v].sort().join(',');
            if (edges.has(reverse) && !reported.has(pairKey)) {
                reported.add(pairKey);
                violations.push(`(${u},${v}) 和 (${v},${u}) 同时存在`);
            }
        }
    });
    return { satisfied: violations.length === 0, violations };
}

function checkTransitive() {
    const violations = [];
    edges.forEach(edge1 => {
        const [x, y] = edge1.split('-').map(Number);
        edges.forEach(edge2 => {
            const [y2, z] = edge2.split('-').map(Number);
            // Transitivity requires: if (x,y)∈R and (y,z)∈R then (x,z)∈R
            // This must hold for ALL cases including x===z (e.g. (1,2),(2,1) requires (1,1))
            if (y === y2) {
                const closure = `${x}-${z}`;
                if (!edges.has(closure)) {
                    violations.push(`(${x},${y}) 和 (${y},${z}) 存在但 (${x},${z}) 不存在`);
                }
            }
        });
    });
    return { satisfied: violations.length === 0, violations };
}

function updateProperty(propName, checker) {
    const result = checker();
    const card = document.getElementById(`card-${propName}`);
    const status = document.getElementById(`status-${propName}`);
    const feedback = document.getElementById(`feedback-${propName}`);

    if (result.satisfied) {
        card.classList.remove('violated');
        card.classList.add('satisfied');
        status.textContent = '✓';
        status.className = 'card-status check';
        feedback.classList.remove('show', 'error');
    } else {
        card.classList.remove('satisfied');
        card.classList.add('violated');
        status.textContent = '✗';
        status.className = 'card-status cross';

        if (result.violations.length > 0) {
            feedback.className = 'card-feedback show error';
            feedback.textContent = '违反: ' + result.violations.slice(0, 2).join('; ') +
                (result.violations.length > 2 ? '...' : '');
        }
    }
}

function updateAllProperties() {
    updateProperty('reflexive', checkReflexive);
    updateProperty('irreflexive', checkIrreflexive);
    updateProperty('symmetric', checkSymmetric);
    updateProperty('antisymmetric', checkAntisymmetric);
    updateProperty('transitive', checkTransitive);
}

// Examples
function loadExample(type) {
    edges.clear();

    if (type === 'equivalence') {
        // Reflexive + Symmetric + Transitive
        NODES.forEach(n => edges.add(`${n}-${n}`));
        edges.add('1-2'); edges.add('2-1');
        edges.add('3-4'); edges.add('4-3');
    } else if (type === 'partial') {
        // Reflexive + Antisymmetric + Transitive
        NODES.forEach(n => edges.add(`${n}-${n}`));
        edges.add('1-2'); edges.add('2-3'); edges.add('1-3');
    } else if (type === 'total') {
        // Partial Order + Totally Connected
        NODES.forEach(n => edges.add(`${n}-${n}`));
        edges.add('1-2'); edges.add('2-3'); edges.add('3-4');
        edges.add('1-3'); edges.add('2-4'); edges.add('1-4');
    } else if (type === 'empty') {
        // Empty relation
        edges.clear();
    }

    renderEdges();
    updateAllProperties();
}

// Event Listeners
analyzeBtn.addEventListener('click', updateAllProperties);

exampleSelect.addEventListener('change', (e) => {
    if (e.target.value) {
        loadExample(e.target.value);
        e.target.value = '';
    }
});

resetBtn.addEventListener('click', () => {
    edges.clear();
    selectedNode = null;
    document.querySelectorAll('.svg-node').forEach(n => n.classList.remove('selecting'));
    renderEdges();

    // Reset all cards
    document.querySelectorAll('.property-card').forEach(card => {
        card.classList.remove('satisfied', 'violated');
    });
    document.querySelectorAll('.card-status').forEach(s => {
        s.textContent = '—';
        s.className = 'card-status';
    });
    document.querySelectorAll('.card-feedback').forEach(f => {
        f.classList.remove('show');
    });
});

window.addEventListener('resize', () => {
    relayoutGraph();
});

// Init
init();
setTimeout(relayoutGraph, 80);
setTimeout(relayoutGraph, 320);

function relayoutGraph() {
    if (layoutFrame) cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(() => {
        calculateLayout();
        renderEdges();
        layoutFrame = null;
    });
}

if ('ResizeObserver' in window) {
    const graphObserver = new ResizeObserver(() => relayoutGraph());
    graphObserver.observe(document.getElementById('graphContainer'));
    graphObserver.observe(document.querySelector('.content-area'));
    graphObserver.observe(document.querySelector('.app-container'));
}
