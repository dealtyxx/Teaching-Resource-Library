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
    const msgBox = gameOverlay.querySelector('.success-message');
    msgBox.querySelector('h2').textContent = '🎉 规划完成！';
    msgBox.querySelector('p').textContent = '交通网络畅通无阻';
    nextLevelBtn.style.display = '';

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
    // 先在“答案布局”上生成一张保证无交叉的平面图，再打乱顶点位置交给学生理顺。
    // （原实现随机加边，可能含 K₃,₃ 细分而永远无法理顺，却被当作可平面关卡）
    const sol = [];
    for (let i = 0; i < n; i++) {
        let best = null, bestGap = -1;
        for (let t = 0; t < 40; t++) {
            const p = { x: Math.random() * (width - 140) + 70, y: Math.random() * (height - 140) + 70 };
            const gap = sol.reduce((m, q) => Math.min(m, Math.hypot(q.x - p.x, q.y - p.y)), Infinity);
            if (gap > bestGap) { best = p; bestGap = gap; }
        }
        sol.push(best);
    }
    const crossesExisting = (u, v) => edges.some(e =>
        e.u !== u && e.u !== v && e.v !== u && e.v !== v &&
        doIntersect(sol[u], sol[v], sol[e.u], sol[e.v]));
    const addEdge = (u, v) => edges.push({ u, v, id: `${Math.min(u, v)}-${Math.max(u, v)}`, isIntersecting: false });

    // 1. 欧氏最小生成树（Prim）：保证连通，且直线段两两不交叉
    const inTree = new Set([0]);
    while (inTree.size < n) {
        let bu = -1, bv = -1, bd = Infinity;
        inTree.forEach(u => {
            for (let v = 0; v < n; v++) {
                if (inTree.has(v)) continue;
                const d = Math.hypot(sol[u].x - sol[v].x, sol[u].y - sol[v].y);
                if (d < bd) { bd = d; bu = u; bv = v; }
            }
        });
        addEdge(bu, bv);
        inTree.add(bv);
    }

    // 2. 再加若干条不与已有边交叉的边（在答案布局中检查）
    const pairs = [];
    for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) pairs.push([u, v]);
    pairs.sort(() => Math.random() - 0.5);
    let added = 0;
    for (const [u, v] of pairs) {
        if (added >= extraEdges) break;
        if (edges.find(e => (e.u === u && e.v === v) || (e.u === v && e.v === u))) continue;
        if (crossesExisting(u, v)) continue;
        addEdge(u, v);
        added++;
    }

    // 3. 打乱：顶点放到圆周上的随机位置，制造交叉
    const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.36;
    const order = [...Array(n).keys()].sort(() => Math.random() - 0.5);
    for (let i = 0; i < n; i++) {
        const a = (order[i] * 2 * Math.PI) / n - Math.PI / 2;
        nodes.push({
            id: i,
            name: CITY_NAMES[i % CITY_NAMES.length],
            icon: CITY_ICONS[i % CITY_ICONS.length],
            x: cx + r * Math.cos(a),
            y: cy + r * Math.sin(a)
        });
    }
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
        statusText.textContent = '已无交叉：得到平面嵌入，交通网络畅通。';
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
            statusText.textContent = '存在无法消除的交叉：非平面图，需要立交分层。';
        } else {
            statusText.textContent = '检测到道路交叉，拖动路口试着理顺。';
        }
        statusIndicator.querySelector('.status-dot').className = 'status-dot danger';
        gameOverlay.classList.remove('active');
    }
}

// Update Euler Formula
// 只有“可平面且当前已无交叉”时才能按平面嵌入数面：F = E − V + 2；非平面图没有平面嵌入，F 无定义。
function updateEulerFormula() {
    const V = nodes.length;
    const E = edges.length;
    const level = levelSelect.value;
    const nonPlanar = level === 'k33' || level === 'k5';

    vCountEl.textContent = V;
    eCountEl.textContent = E;

    if (nonPlanar) {
        fCountEl.textContent = '—';
        eulerResultEl.textContent = '×';
        eulerResultEl.style.color = 'var(--danger-red, #C0392B)';
        eulerResultEl.title = level === 'k5'
            ? 'K₅：E = 10 > 3V − 6 = 9，不是平面图，没有平面嵌入，面数无定义'
            : 'K₃,₃：无三角形，平面时应有 E ≤ 2V − 4 = 8，而 E = 9，不是平面图';
        return;
    }
    if (intersectionCount > 0) {
        fCountEl.textContent = '?';
        eulerResultEl.textContent = '?';
        eulerResultEl.style.color = 'var(--text-primary)';
        eulerResultEl.title = '先拖动路口消除全部交叉，得到平面嵌入后再数面';
        return;
    }
    const F = E - V + 2; // 连通平面图的面数（含外部无界面）
    fCountEl.textContent = F;
    eulerResultEl.textContent = V - E + F;
    eulerResultEl.style.color = 'var(--success-green)';
    eulerResultEl.title = '无交叉的平面嵌入：面数（含外部面）F = ' + F;
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
        // 最后一关：改为页内提示（不再使用 alert）
        const msg = gameOverlay.querySelector('.success-message');
        msg.querySelector('h2').textContent = '🎉 全部场景已完成';
        msg.querySelector('p').textContent = '可平面的路网都已理顺；K₃,₃、K₅ 无法消除交叉，只能靠立交分层。';
        nextLevelBtn.style.display = 'none';
    }
});

// Init
window.addEventListener('load', () => {
    generateLevel();
});
