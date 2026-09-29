/**
 * 3.3 二元关系的表示 · 进阶层：集合 / 关系矩阵 / 关系图 三视图联动 + 布尔积计算 R∘R
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
const sampleBtn = document.getElementById('sampleBtn');
const powerBtn = document.getElementById('powerBtn');
const powerPanel = document.getElementById('powerPanel');
const graphContent = document.getElementById('graphContent');

// Data
const ELEMENTS = [1, 2, 3, 4];
const SIZE = ELEMENTS.length;

// State
const SAMPLE = ['1-2', '2-3', '3-1', '3-3', '4-2'];
let relation = new Set(SAMPLE); // Set of strings "u-v"
let showPower = false;

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
        updateInsight(`删除有序对 (${u}, ${v})`, `集合中去掉该元素；矩阵第 ${u} 行第 ${v} 列置 0；关系图删去边 ${u} → ${v}${u === v ? '（自环）' : ''}。`);
    } else {
        relation.add(key);
        updateInsight(`加入有序对 (${u}, ${v})`, `集合中新增该元素；矩阵第 ${u} 行第 ${v} 列置 1；关系图添加边 ${u} → ${v}${u === v ? '（自环）' : ''}。`);
    }
    renderAll();
}

function renderAll() {
    renderSet();
    renderMatrix();
    renderGraph();
    renderPower();
}

// R∘R：布尔矩阵乘法 (M⊙M)_ij = ∨_k (m_ik ∧ m_kj)，并记录中间点 k
function composeSelf() {
    const out = new Map(); // "i-j" -> [k...]
    ELEMENTS.forEach(i => ELEMENTS.forEach(j => {
        const ks = ELEMENTS.filter(k => relation.has(`${i}-${k}`) && relation.has(`${k}-${j}`));
        if (ks.length) out.set(`${i}-${j}`, ks);
    }));
    return out;
}

function renderPower() {
    powerPanel.hidden = !showPower;
    powerBtn.textContent = showPower ? '收起 R∘R' : '计算 R∘R（布尔积 M·M）';
    if (!showPower) return;
    const r2 = composeSelf();
    const pm = document.getElementById('powerMatrix');
    pm.innerHTML = '';
    pm.style.gridTemplateColumns = `auto repeat(${SIZE}, 40px)`;
    pm.appendChild(createMatrixHeader('M²'));
    ELEMENTS.forEach(el => pm.appendChild(createMatrixHeader(el)));
    ELEMENTS.forEach(i => {
        pm.appendChild(createMatrixHeader(i));
        ELEMENTS.forEach(j => {
            const key = `${i}-${j}`;
            const cell = document.createElement('div');
            const on = r2.has(key);
            cell.className = 'matrix-cell static' + (on ? (relation.has(key) ? ' active' : ' new2') : '');
            cell.textContent = on ? '1' : '0';
            if (on) cell.title = r2.get(key).map(k => `${i} → ${k} → ${j}`).join('；');
            pm.appendChild(cell);
        });
    });
    const list = document.getElementById('powerList');
    const keys = Array.from(r2.keys()).map(k => k.split('-').map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (!keys.length) {
        list.innerHTML = 'R∘R = ∅：图中不存在长度为 2 的通路。';
        return;
    }
    list.innerHTML = `<div><b>R∘R</b> = {${keys.map(([i, j]) => `(${i},${j})`).join(', ')}}，共 ${keys.length} 个有序对。</div>`
        + '<div style="margin-top:6px">每个 1 都对应至少一条长度为 2 的通路：</div>'
        + keys.map(([i, j]) => r2.get(`${i}-${j}`).map(k => `<span class="path">${i}→${k}→${j}</span>`).join('')).join('');
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
    matrixWrapper.style.gridTemplateColumns = `auto repeat(${SIZE}, 40px)`;

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
    const width = graphContent.clientWidth;
    const height = graphContent.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.32;

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
        edge.style.stroke = active ? '#c58a1f' : '';
    }
}

function updateInsight(action, detail) {
    insightText.innerHTML = `<strong>${action}</strong>：${detail}<br>三种表示形式不同，描述的是同一个关系——改动任一视图，其余视图同步变化。`;
}

// Buttons
clearBtn.addEventListener('click', () => {
    relation.clear();
    renderAll();
    updateInsight("清空", "R = ∅：集合为空、矩阵全 0、关系图没有边。");
});

randomBtn.addEventListener('click', () => {
    relation.clear();
    ELEMENTS.forEach(u => {
        ELEMENTS.forEach(v => {
            if (Math.random() > 0.7) relation.add(`${u}-${v}`);
        });
    });
    renderAll();
    updateInsight("随机生成", `得到含 ${relation.size} 个有序对的关系。`);
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
    updateInsight("对称化", "补上每条边的反向边，得到 R ∪ R⁻¹（包含 R 的最小对称关系，即对称闭包）：矩阵关于主对角线对称，边都成对出现。");
});

sampleBtn.addEventListener('click', () => {
    relation = new Set(SAMPLE);
    renderAll();
    updateInsight("载入示例", "R = {(1,2), (2,3), (3,1), (3,3), (4,2)}。");
});

powerBtn.addEventListener('click', () => {
    showPower = !showPower;
    renderAll();
    if (showPower) {
        updateInsight("计算 R∘R", "按行乘列做布尔运算：第 i 行与第 j 列对应位置同时为 1（存在 k 使 i→k 且 k→j）时结果为 1。金色格是 R 中没有、经两步才连通的新有序对。");
        powerPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

// Handle Resize：尺寸真的变化才重绘（规避共享框架 resize 循环）
let lastGraphSize = '';
window.addEventListener('resize', () => {
    const size = graphContent.clientWidth + 'x' + graphContent.clientHeight;
    if (size === lastGraphSize) return;
    lastGraphSize = size;
    renderGraph();
});

// Init
init();
