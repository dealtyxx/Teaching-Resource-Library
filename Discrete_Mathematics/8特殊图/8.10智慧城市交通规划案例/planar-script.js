/**
 * 智慧城市 - 交通网络规划
 * Smart City - Traffic Network Planning (Planar Graph)
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const levelSelect = document.getElementById('levelSelect');
const resetBtn = document.getElementById('resetBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const statusText = document.getElementById('statusText');
const statusIndicator = document.getElementById('statusIndicator');
const intersectionCountEl = document.getElementById('intersectionCount');
const progressValueEl = document.getElementById('progressValue');
const gameOverlay = document.getElementById('gameOverlay');

// Euler Formula Elements
const vCountEl = document.getElementById('vCount');
const eCountEl = document.getElementById('eCount');
const fCountEl = document.getElementById('fCount');
const eulerResultEl = document.getElementById('eulerResult');

// State
let nodes = [];
let edges = [];
let nodeElements = new Map();
let edgeElements = [];
let isDragging = false;
let draggedNodeId = null;
let dragOffset = { x: 0, y: 0 };
let intersectionCount = 0;

// Constants
const NODE_RADIUS = 24;
const CITY_ICONS = ["🏢", "🏥", "🏫", "🏭", "🏪", "🏟️", "🏛️", "🏨", "🚉", "🌲"];
const CITY_NAMES = ["CBD", "医院", "学校", "工厂", "商场", "体育馆", "政府", "酒店", "车站", "公园"];

// Levels
const LEVELS = {
    level1: { // K4 (Complete Graph with 4 vertices) - Planar
        name: "基础路网",
        nodes: 4,
        edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]],
        layout: 'cross' // Intentionally crossed
    },
    level2: { // Random Planar Graph
        name: "复杂枢纽",
        type: 'random_planar',
        nodes: 6,
        extraEdges: 3
    },
    level3: { // More Complex Random Planar
        name: "高密度区",
        type: 'random_planar',
        nodes: 8,
        extraEdges: 6
    },
    k33: { // K3,3 (Complete Bipartite) - Non-planar
        name: "供水供电问题",
        nodes: 6,
        edges: [[0, 3], [0, 4], [0, 5], [1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5]],
        layout: 'bipartite'
    },
    k5: { // K5 (Complete Graph with 5 vertices) - Non-planar
        name: "五城互通问题",
        nodes: 5,
        edges: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]],
        layout: 'pentagon'
    }
};

// Helper Functions
function createSVGElement(type, attributes = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    return el;
}

// Line Segment Intersection
function doIntersect(p1, q1, p2, q2) {
    // Orientation triplet (p, q, r)
    // 0 -> colinear, 1 -> clockwise, 2 -> counterclockwise
    function orientation(p, q, r) {
        const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (Math.abs(val) < 0.1) return 0;
        return (val > 0) ? 1 : 2;
    }

    function onSegment(p, q, r) {
        return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    }

    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    // General case
    if (o1 !== o2 && o3 !== o4) return true;

    // Special Cases (colinear) - usually not needed for this game but good for robustness
    // We ignore endpoint touches for graph planarity (edges sharing a vertex is fine)
    return false;
}

// Check if two edges intersect (excluding shared vertices)
function checkEdgeIntersection(edge1, edge2) {
    // If they share a vertex, they don't "intersect" in the bad way
    if (edge1.u === edge2.u || edge1.u === edge2.v ||
        edge1.v === edge2.u || edge1.v === edge2.v) {
        return false;
    }

    const u1 = nodes[edge1.u];
    const v1 = nodes[edge1.v];
    const u2 = nodes[edge2.u];
    const v2 = nodes[edge2.v];

    return doIntersect(u1, v1, u2, v2);
}

// Generate Level
function generateLevel() {
    nodes = [];
    edges = [];
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    nodeElements.clear();
    edgeElements = [];
    gameOverlay.classList.remove('active');

    const levelKey = levelSelect.value;
    const level = LEVELS[levelKey];
    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.35;

    if (level.type === 'random_planar') {
        generateRandomPlanar(level.nodes, level.extraEdges, width, height);
    } else {
        // Fixed layout generation
        for (let i = 0; i < level.nodes; i++) {
            let x, y;

            if (level.layout === 'bipartite') {
                // K3,3 specific layout
                x = (i < 3) ? cx - 150 : cx + 150;
                y = cy - 150 + (i % 3) * 150;
            } else if (level.layout === 'cross') {
                // K4 crossed layout
                const angle = (i * Math.PI * 2) / level.nodes;
                // Swap 2 nodes to force cross
                const idx = (i === 2) ? 3 : (i === 3 ? 2 : i);
                const a = (idx * Math.PI * 2) / level.nodes;
                x = cx + radius * Math.cos(a);
                y = cy + radius * Math.sin(a);
            } else {
                // Circle layout
                const angle = (i * Math.PI * 2) / level.nodes - Math.PI / 2;
                x = cx + radius * Math.cos(angle);
                y = cy + radius * Math.sin(angle);
            }

            nodes.push({
                id: i,
                name: CITY_NAMES[i % CITY_NAMES.length],
                icon: CITY_ICONS[i % CITY_ICONS.length],
                x, y
            });
        }

        level.edges.forEach(([u, v]) => {
            edges.push({ u, v, id: `${u}-${v}`, isIntersecting: false });
        });
    }

    renderGraph();
    checkIntersections();
    updateEulerFormula();
}

// Generate Random Planar Graph (and then shuffle positions)
function generateRandomPlanar(n, extraEdges, width, height) {
    // 1. Create random points
    for (let i = 0; i < n; i++) {
        nodes.push({
            id: i,
            name: CITY_NAMES[i % CITY_NAMES.length],
            icon: CITY_ICONS[i % CITY_ICONS.length],
            x: Math.random() * (width - 100) + 50,
            y: Math.random() * (height - 100) + 50
        });
    }

    // 2. Create a spanning tree (guarantees connectivity)
    const visited = new Set([0]);
    const unvisited = new Set();
    for (let i = 1; i < n; i++) unvisited.add(i);

    while (unvisited.size > 0) {
        const u = Array.from(visited)[Math.floor(Math.random() * visited.size)];
        const v = Array.from(unvisited)[Math.floor(Math.random() * unvisited.size)];

        edges.push({ u, v, id: `${Math.min(u, v)}-${Math.max(u, v)}`, isIntersecting: false });
        visited.add(v);
        unvisited.delete(v);
    }

    // 3. Add random edges
    let added = 0;
    let attempts = 0;
    while (added < extraEdges && attempts < 100) {
        const u = Math.floor(Math.random() * n);
        const v = Math.floor(Math.random() * n);

        if (u !== v && !edges.find(e => (e.u === u && e.v === v) || (e.u === v && e.v === u))) {
            edges.push({ u, v, id: `${Math.min(u, v)}-${Math.max(u, v)}`, isIntersecting: false });
            added++;
        }
        attempts++;
    }

    // Note: We create a graph that MIGHT be planar, but we scramble positions
    // The user has to untangle it. For levels 2/3 we don't strictly guarantee planarity
    // but with low edge count it's highly likely to be planar.
}

// Render Graph
function renderGraph() {
    // Render Edges
    edges.forEach(edge => {
        const uNode = nodes[edge.u];
        const vNode = nodes[edge.v];

        const line = createSVGElement('line', {
            x1: uNode.x, y1: uNode.y,
            x2: vNode.x, y2: vNode.y,
            class: 'edge-line safe'
        });
        edgesGroup.appendChild(line);
        edgeElements.push({ line, edge });
    });

    // Render Nodes
    nodes.forEach(node => {
        const g = createSVGElement('g', {
            class: 'node-group',
            transform: `translate(${node.x}, ${node.y})`,
            'data-id': node.id
        });

        const circle = createSVGElement('circle', {
            r: NODE_RADIUS,
            class: 'node-circle'
        });

        const icon = createSVGElement('text', {
            class: 'node-icon',
            'text-anchor': 'middle',
            'dy': '.35em'
        });
        icon.textContent = node.icon;

        const label = createSVGElement('text', {
            class: 'node-label',
            'text-anchor': 'middle',
            'dy': '2.2em'
        });
        label.textContent = node.name;

        g.appendChild(circle);
        g.appendChild(icon);
        g.appendChild(label);
        nodesGroup.appendChild(g);

        // Drag Events
        g.addEventListener('mousedown', startDrag);
        g.addEventListener('touchstart', startDrag, { passive: false });

        nodeElements.set(node.id, { g, circle });
    });
}

// Drag Logic
function startDrag(e) {
    e.preventDefault();
    if (gameOverlay.classList.contains('active')) return;

    const id = parseInt(e.currentTarget.getAttribute('data-id'));
    draggedNodeId = id;
    isDragging = true;

    const pt = getEventPoint(e);
    const node = nodes[id];
    dragOffset.x = pt.x - node.x;
    dragOffset.y = pt.y - node.y;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();

    const pt = getEventPoint(e);
    const node = nodes[draggedNodeId];

    // Boundary check
    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;
    const padding = 30;

    node.x = Math.max(padding, Math.min(width - padding, pt.x - dragOffset.x));
    node.y = Math.max(padding, Math.min(height - padding, pt.y - dragOffset.y));

    // Update Node Position
    const el = nodeElements.get(draggedNodeId);
    el.g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

    // Update Connected Edges
    edgeElements.forEach(({ line, edge }) => {
        if (edge.u === draggedNodeId) {
            line.setAttribute('x1', node.x);
            line.setAttribute('y1', node.y);
        } else if (edge.v === draggedNodeId) {
            line.setAttribute('x2', node.x);
            line.setAttribute('y2', node.y);
        }
    });

    checkIntersections();
}

function endDrag() {
    isDragging = false;
    draggedNodeId = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', endDrag);

    updateEulerFormula();
}

function getEventPoint(e) {
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// Check Intersections
function checkIntersections() {
    intersectionCount = 0;
    const intersectingEdges = new Set();

    // Reset all edges to safe first
    edgeElements.forEach(({ line, edge }) => {
        edge.isIntersecting = false;
        line.setAttribute('class', 'edge-line safe');
    });

    // Check every pair
    for (let i = 0; i < edges.length; i++) {
        for (let j = i + 1; j < edges.length; j++) {
            if (checkEdgeIntersection(edges[i], edges[j])) {
                edges[i].isIntersecting = true;
                edges[j].isIntersecting = true;
                intersectingEdges.add(i);
                intersectingEdges.add(j);
                intersectionCount++;
            }
        }
    }

    // Update Visuals
    intersectingEdges.forEach(idx => {
        edgeElements[idx].line.setAttribute('class', 'edge-line danger');
    });

    // Update UI
    intersectionCountEl.textContent = intersectionCount;

    // Progress (Inverse of intersection ratio roughly)
    const maxIntersections = (edges.length * (edges.length - 1)) / 2; // Worst case
    const progress = Math.max(0, 100 - Math.min(100, (intersectionCount * 5))); // Heuristic
    progressValueEl.textContent = (intersectionCount === 0 ? 100 : progress.toFixed(0)) + '%';

    // Status
    const level = levelSelect.value;
    if (intersectionCount === 0) {
        statusText.textContent = '交通网络畅通!';
        statusIndicator.className = 'status-indicator'; // Reset
        statusIndicator.querySelector('.status-dot').className = 'status-dot safe';

        // Show success if not K3,3 or K5 (which are impossible to fully solve usually, but if user did it, great!)
        // Actually K3,3 and K5 are non-planar, so intersectionCount will never be 0 in 2D.
        // Unless we cheat or nodes overlap.

        if (!gameOverlay.classList.contains('active')) {
            setTimeout(() => {
                if (intersectionCount === 0) {
                    gameOverlay.classList.add('active');
                }
            }, 500);
        }
    } else {
        if (level === 'k33' || level === 'k5') {
            statusText.textContent = '存在不可消除的交叉 (非平面图)';
        } else {
            statusText.textContent = '检测到道路交叉拥堵!';
        }
        statusIndicator.querySelector('.status-dot').className = 'status-dot danger';
        gameOverlay.classList.remove('active');
    }
}

// Update Euler Formula
function updateEulerFormula() {
    const V = nodes.length;
    const E = edges.length;
    // F = E - V + 2 (for connected planar graph)
    // This is theoretical F if the graph is planar.
    // If graph has intersections, this formula holds for the PLANAR embedding.
    // Here we just show the calculation.

    const F = E - V + 2;

    vCountEl.textContent = V;
    eCountEl.textContent = E;
    fCountEl.textContent = F;

    const result = V - E + F;
    eulerResultEl.textContent = result;

    if (result === 2) {
        eulerResultEl.style.color = 'var(--success-green)';
    } else {
        eulerResultEl.style.color = 'var(--text-primary)';
    }
}

// Event Listeners
levelSelect.addEventListener('change', generateLevel);
resetBtn.addEventListener('click', generateLevel);
nextLevelBtn.addEventListener('click', () => {
    const opts = levelSelect.options;
    if (levelSelect.selectedIndex < opts.length - 1) {
        levelSelect.selectedIndex++;
        generateLevel();
    } else {
        gameOverlay.classList.remove('active');
        alert("恭喜! 你已完成所有挑战!");
    }
});

// Init
window.addEventListener('load', () => {
    generateLevel();
});
