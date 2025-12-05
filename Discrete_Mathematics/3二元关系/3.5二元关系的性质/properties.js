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

// Config
const NODE_RADIUS = 25;

// Initialization
function init() {
    calculateLayout();
    renderNodes();
    renderEdges();
    updateAllProperties();
}

// Layout (Circular)
function calculateLayout() {
    const container = document.querySelector('.graph-panel');
    const width = container.clientWidth;
    const height = container.clientHeight - 60;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    NODES.forEach((val, idx) => {
        const angle = (idx / NODES.length) * 2 * Math.PI - Math.PI / 2;
        nodePositions[val] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });
}

// Rendering
function renderNodes() {
    nodesLayer.innerHTML = '';
    NODES.forEach(val => {
        const pos = nodePositions[val];
        const el = document.createElement('div');
        el.className = 'graph-node';
        el.textContent = val;
        el.style.left = `${pos.x - NODE_RADIUS}px`;
        el.style.top = `${pos.y - NODE_RADIUS}px`;
        el.id = `node-${val}`;

        el.addEventListener('click', () => handleNodeClick(val));

        nodesLayer.appendChild(el);
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
}

function renderEdge(u, v) {
    const posU = nodePositions[u];
    const posV = nodePositions[v];

    let d;
    if (u === v) {
        // Self-loop
        const loopSize = 30;
        d = `M ${posU.x} ${posU.y - NODE_RADIUS} 
             Q ${posU.x + loopSize} ${posU.y - NODE_RADIUS - loopSize} 
               ${posU.x} ${posU.y - NODE_RADIUS}`;
    } else {
        // Regular edge with slight curve for bi-directional visibility
        const dx = posV.x - posU.x;
        const dy = posV.y - posU.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Start and End points (edge of circles)
        const startX = posU.x + (dx / dist) * NODE_RADIUS;
        const startY = posU.y + (dy / dist) * NODE_RADIUS;
        const endX = posV.x - (dx / dist) * NODE_RADIUS;
        const endY = posV.y - (dy / dist) * NODE_RADIUS;

        // Add slight curve
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const perpX = -dy / dist * 10;
        const perpY = dx / dist * 10;

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
    edges.forEach(key => {
        const [u, v] = key.split('-');
        if (u !== v) {
            const reverse = `${v}-${u}`;
            if (edges.has(reverse)) {
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
            if (y === y2 && x !== z) {
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
    document.querySelectorAll('.graph-node').forEach(n => n.classList.remove('selecting'));
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
    calculateLayout();
    renderNodes();
    renderEdges();
});

// Init
init();
