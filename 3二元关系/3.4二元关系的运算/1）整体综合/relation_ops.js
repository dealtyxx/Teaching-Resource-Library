/**
 * Red Mathematics - Relation Operations Visualizer
 */

// DOM Elements
const opBtns = document.querySelectorAll('.op-btn');
const resetBtn = document.getElementById('resetBtn');
const logTitle = document.getElementById('logTitle');
const logText = document.getElementById('logText');
const mathDisplay = document.getElementById('mathDisplay');
const nodesLayer = document.getElementById('nodesLayer');
const graphSvg = document.getElementById('graphSvg');
const graphContainer = document.getElementById('graphContainer');

// Data: A linear path 1 -> 2 -> 3 -> 4 -> 5
const NODES = [1, 2, 3, 4, 5];
const BASE_RELATION = [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5]
];

// Config
const NODE_RADIUS = 25;

// State
let currentOp = null;
let nodePositions = {};

// Initialization
function init() {
    calculateLayout();
    renderNodes();
    renderEdges(BASE_RELATION);
}

// Layout (Linear for "Relay")
function calculateLayout() {
    const width = graphContainer.clientWidth;
    const height = graphContainer.clientHeight;
    const centerY = height / 2;
    const startX = width * 0.1;
    const step = (width * 0.8) / (NODES.length - 1);

    NODES.forEach((val, idx) => {
        nodePositions[val] = {
            x: startX + idx * step,
            y: centerY
        };
    });
}

// Rendering
function renderNodes() {
    nodesLayer.innerHTML = '';
    NODES.forEach(val => {
        const pos = nodePositions[val];
        const node = document.createElement('div');
        node.className = 'graph-node';
        node.textContent = val;
        node.style.left = `${pos.x - NODE_RADIUS}px`;
        node.style.top = `${pos.y - NODE_RADIUS}px`;
        node.id = `node-${val}`;
        nodesLayer.appendChild(node);
    });
}

function renderEdges(pairs, type = 'normal') {
    // Keep defs
    const defs = graphSvg.querySelector('defs');
    graphSvg.innerHTML = '';
    graphSvg.appendChild(defs);

    pairs.forEach(pair => {
        const [u, v] = pair;
        const posU = nodePositions[u];
        const posV = nodePositions[v];

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // Calculate intersection
        const dx = posV.x - posU.x;
        const dy = posV.y - posU.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const offset = NODE_RADIUS + 5;

        const startX = posU.x + (dx / dist) * offset;
        const startY = posU.y + (dy / dist) * offset;
        const endX = posV.x - (dx / dist) * offset;
        const endY = posV.y - (dy / dist) * offset;

        // Curve
        let d;
        if (type === 'composite') {
            // Arc higher for composite
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            d = `M ${startX} ${startY} Q ${midX} ${midY - 80} ${endX} ${endY}`;
        } else {
            d = `M ${startX} ${startY} L ${endX} ${endY}`;
        }

        path.setAttribute('d', d);

        let className = 'edge';
        if (type === 'inverse') className += ' inverse';
        if (type === 'composite') className += ' composite';
        if (type === 'normal') className += ' active';

        path.setAttribute('class', className);
        graphSvg.appendChild(path);
    });
}

function highlightNodes(ids, type) {
    // Reset first
    document.querySelectorAll('.graph-node').forEach(el => {
        el.classList.remove('active-domain', 'active-range', 'active-field');
    });

    ids.forEach(id => {
        const node = document.getElementById(`node-${id}`);
        if (node) {
            if (type === 'domain') node.classList.add('active-domain');
            else if (type === 'range') node.classList.add('active-range');
            else if (type === 'field') node.classList.add('active-field');
        }
    });
}

// Operations
function handleOp(op) {
    currentOp = op;

    // UI Update
    opBtns.forEach(btn => {
        if (btn.dataset.op === op) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    if (op === 'domain') {
        const domain = new Set(BASE_RELATION.map(p => p[0]));
        highlightNodes(Array.from(domain), 'domain');
        renderEdges(BASE_RELATION); // Restore normal edges
        updateLog("定义域 (Domain)", "先行者 (Pioneers)", "关系中作为起点的元素集合。在接力中，他们是传递火炬的第一棒。", `dom(R) = {${Array.from(domain).join(', ')}}`);

    } else if (op === 'range') {
        const range = new Set(BASE_RELATION.map(p => p[1]));
        highlightNodes(Array.from(range), 'range');
        renderEdges(BASE_RELATION);
        updateLog("值域 (Range)", "继任者 (Successors)", "关系中作为终点的元素集合。他们是接过火炬、继续前行的力量。", `ran(R) = {${Array.from(range).join(', ')}}`);

    } else if (op === 'field') {
        const field = new Set([...BASE_RELATION.map(p => p[0]), ...BASE_RELATION.map(p => p[1])]);
        highlightNodes(Array.from(field), 'field');
        renderEdges(BASE_RELATION);
        updateLog("域 (Field)", "全体参与者 (All Participants)", "定义域和值域的并集。所有参与到这场伟大接力中的成员。", `fld(R) = {${Array.from(field).join(', ')}}`);

    } else if (op === 'inverse') {
        const inverseR = BASE_RELATION.map(p => [p[1], p[0]]);
        highlightNodes([], '');
        renderEdges(inverseR, 'inverse');
        updateLog("逆运算 (Inverse)", "回望历史 (Reflection)", "将关系的箭头反转。R⁻¹ 让我们追溯源头，不忘来时路。", `R⁻¹ = {${inverseR.map(p => `(${p[0]},${p[1]})`).join(', ')}}`);

    } else if (op === 'composition') {
        // R o R
        // Find (x,z) where (x,y) in R and (y,z) in R
        const compR = [];
        BASE_RELATION.forEach(([x, y]) => {
            BASE_RELATION.forEach(([y2, z]) => {
                if (y === y2) compR.push([x, z]);
            });
        });

        highlightNodes([], '');
        // Render base faintly? Or just composite?
        // Let's render composite on top of base
        renderEdges(BASE_RELATION); // Base
        // Add composite edges
        compR.forEach(pair => {
            const [u, v] = pair;
            const posU = nodePositions[u];
            const posV = nodePositions[v];

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const dx = posV.x - posU.x;
            const dy = posV.y - posU.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const offset = NODE_RADIUS + 5;

            const startX = posU.x + (dx / dist) * offset;
            const startY = posU.y + (dy / dist) * offset;
            const endX = posV.x - (dx / dist) * offset;
            const endY = posV.y - (dy / dist) * offset;

            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const d = `M ${startX} ${startY} Q ${midX} ${midY - 60} ${endX} ${endY}`;

            path.setAttribute('d', d);
            path.setAttribute('class', 'edge composite');
            graphSvg.appendChild(path);
        });

        updateLog("复合运算 (Composition)", "接力传递 (Relay)", "R ∘ R 表示经过一次中间传递后的关系。例如 1->2->3 形成了 1->3 的间接联系。", `R ∘ R = {${compR.map(p => `(${p[0]},${p[1]})`).join(', ')}}`);

    } else if (op === 'power') {
        // R^3
        // R o R o R
        // 1->2->3->4 => 1->4
        const power3 = [];
        // First compute R^2
        const r2 = [];
        BASE_RELATION.forEach(([x, y]) => {
            BASE_RELATION.forEach(([y2, z]) => {
                if (y === y2) r2.push([x, z]);
            });
        });
        // Then R^2 o R
        r2.forEach(([x, y]) => {
            BASE_RELATION.forEach(([y2, z]) => {
                if (y === y2) power3.push([x, z]);
            });
        });

        highlightNodes([], '');
        renderEdges(BASE_RELATION);

        power3.forEach(pair => {
            const [u, v] = pair;
            const posU = nodePositions[u];
            const posV = nodePositions[v];

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const dx = posV.x - posU.x;
            const dy = posV.y - posU.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const offset = NODE_RADIUS + 5;

            const startX = posU.x + (dx / dist) * offset;
            const startY = posU.y + (dy / dist) * offset;
            const endX = posV.x - (dx / dist) * offset;
            const endY = posV.y - (dy / dist) * offset;

            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const d = `M ${startX} ${startY} Q ${midX} ${midY - 90} ${endX} ${endY}`;

            path.setAttribute('d', d);
            path.setAttribute('class', 'edge composite');
            graphSvg.appendChild(path);
        });

        updateLog("幂运算 (Power)", "深远影响 (Deep Influence)", "R³ 表示跨越三代的联系。思想的光芒穿越时空，依然照耀着后人。", `R³ = {${power3.map(p => `(${p[0]},${p[1]})`).join(', ')}}`);
    }
}

function updateLog(title, subtitle, text, math) {
    logTitle.innerHTML = `${title} <span style="font-size:0.8em; color:#888">${subtitle}</span>`;
    logText.textContent = text;
    mathDisplay.textContent = math;
}

// Event Listeners
opBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        handleOp(btn.dataset.op);
    });
});

resetBtn.addEventListener('click', () => {
    currentOp = null;
    opBtns.forEach(b => b.classList.remove('active'));
    highlightNodes([], '');
    renderEdges(BASE_RELATION);
    updateLog("就绪 Ready", "", "点击上方按钮，探索二元关系的运算性质及其在'薪火相传'中的体现。", "R = {(1,2), (2,3), (3,4), (4,5)}");
});

window.addEventListener('resize', () => {
    calculateLayout();
    renderNodes();
    if (currentOp) handleOp(currentOp);
    else renderEdges(BASE_RELATION);
});

// Init
init();
