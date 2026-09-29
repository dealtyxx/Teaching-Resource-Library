/**
 * 3.4 二元关系的运算 · 复合运算专项练习（左复合记法：S∘R 表示先 R 后 S）
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
    container.style.gridTemplateColumns = `auto repeat(${cols.length}, 1fr)`;
    const sub = id => id[0] + '₁₂₃₄₅₆₇₈₉'[+id.slice(1) - 1];
    const hdr = text => { const h = document.createElement('div'); h.className = 'matrix-hdr'; h.textContent = text; container.appendChild(h); };
    hdr('');
    cols.forEach(c => hdr(sub(c.id)));

    rows.forEach(r => {
        hdr(sub(r.id));
        cols.forEach(c => {
            const key = `${r.id}-${c.id}`;
            const isActive = relation.has(key);

            const cell = document.createElement('div');
            cell.className = `matrix-cell ${isActive && isVisible ? 'active' : ''}`;
            cell.textContent = isActive && isVisible ? '1' : '0';
            cell.dataset.key = key;

            cell.title = `(${sub(r.id)} ${r.label}, ${sub(c.id)} ${c.label})`;
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
    // Dim everything first
    document.querySelectorAll('.graph-node').forEach(el => {
        el.style.opacity = '0.35';
        el.style.transform = '';
        el.style.boxShadow = '';
    });
    document.querySelectorAll('.graph-edge').forEach(el => {
        el.style.opacity = '0.1';
    });

    const GLOW = '0 0 12px 4px rgba(255,180,0,0.8)';
    const isA = nodeId.startsWith('a');
    const isB = nodeId.startsWith('b');
    const isC = nodeId.startsWith('c');

    let pathEdgeIds = [];
    let pathNodes = new Set([nodeId]);

    if (isA) {
        // Forward: A →R→ B →S→ C
        relationR.forEach(key => {
            const [a, b] = key.split('-');
            if (a === nodeId) {
                pathNodes.add(b);
                pathEdgeIds.push(`edge-${a}-${b}`);
                relationS.forEach(skey => {
                    const [sb, sc] = skey.split('-');
                    if (sb === b) { pathNodes.add(sc); pathEdgeIds.push(`edge-${sb}-${sc}`); }
                });
            }
        });
    } else if (isB) {
        // Both directions: A→B and B→C
        relationR.forEach(key => {
            const [a, b] = key.split('-');
            if (b === nodeId) { pathNodes.add(a); pathEdgeIds.push(`edge-${a}-${b}`); }
        });
        relationS.forEach(key => {
            const [b, c] = key.split('-');
            if (b === nodeId) { pathNodes.add(c); pathEdgeIds.push(`edge-${b}-${c}`); }
        });
    } else if (isC) {
        // Backward: C ←S← B ←R← A
        relationS.forEach(key => {
            const [b, c] = key.split('-');
            if (c === nodeId) {
                pathNodes.add(b);
                pathEdgeIds.push(`edge-${b}-${c}`);
                relationR.forEach(rkey => {
                    const [a, rb] = rkey.split('-');
                    if (rb === b) { pathNodes.add(a); pathEdgeIds.push(`edge-${a}-${rb}`); }
                });
            }
        });
    }

    // Light up path nodes
    pathNodes.forEach(nid => {
        const el = document.getElementById(`node-${nid}`);
        if (el) {
            el.style.opacity = '1';
            el.style.boxShadow = GLOW;
            if (nid === nodeId) el.style.transform = 'scale(1.12)';
        }
    });

    // Light up path edges
    pathEdgeIds.forEach(eid => {
        const el = document.getElementById(eid);
        if (el) el.style.opacity = '1';
    });

    // Fallback: just highlight the clicked node if nothing connected
    if (pathNodes.size === 1) {
        const el = document.getElementById(`node-${nodeId}`);
        if (el) { el.style.opacity = '1'; el.style.transform = 'scale(1.1)'; }
    }

    // Auto-reset after 2.5s
    setTimeout(() => {
        document.querySelectorAll('.graph-node').forEach(el => {
            el.style.opacity = '1'; el.style.transform = ''; el.style.boxShadow = '';
        });
        document.querySelectorAll('.graph-edge').forEach(el => { el.style.opacity = '0.6'; });
    }, 2500);
}

function updateInsight(synthesized) {
    if (synthesized) {
        const comp = calculateComposition();
        const names = Object.fromEntries([...SET_A, ...SET_C].map(n => [n.id, n.label]));
        insightTitle.textContent = "愿景实现：S∘R 共 " + comp.size + " 个有序对";
        insightText.textContent = "复合 S∘R 把战略目标与现实成果直接联系起来：" + [...comp].map(k => { const [a, c] = k.split('-'); return names[a] + ' → ' + names[c]; }).join('，') + "。每条金色弧线都对应一条「目标 → 举措 → 成果」的两步路径。";
    } else {
        insightTitle.textContent = "准备就绪";
        insightText.textContent = "点击矩阵格子可调整部署方案 R 或落实方案 S；点击「求复合 S∘R」查看目标与成果之间的复合关系。";
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

// 尺寸真的变化才重排（共享框架会反复派发 resize，否则点击高亮会被立即清掉）
let lastGraphSize = '';
window.addEventListener('resize', () => {
    const panel = document.querySelector('.graph-panel');
    const size = panel.clientWidth + 'x' + panel.clientHeight;
    if (size === lastGraphSize) return;
    lastGraphSize = size;
    calculateLayout();
    renderNodes();
    renderEdges();
});

// Init
init();
