/**
 * Red Mathematics - Hasse Diagram & Order Theory Visualization
 */

// DOM Elements
const diagramSvg = document.getElementById('diagramSvg');
const tooltip = document.getElementById('tooltip');
const conceptTitle = document.getElementById('conceptTitle');
const conceptDesc = document.getElementById('conceptDesc');
const conceptMath = document.getElementById('conceptMath');
const conceptIcon = document.getElementById('conceptIcon');
const insightText = document.getElementById('insightText');
const selectionInfo = document.getElementById('selectionInfo');
const selectedList = document.getElementById('selectedList');
const actionHint = document.getElementById('actionHint');
const resetBtn = document.getElementById('resetBtn');

// Data: Strategic Framework (Poset)
// Relation: "Supports" or "Prerequisite" (x <= y means x supports y)
const STRATEGIES = [
    { id: 's0', name: '党的领导', desc: '中国特色社会主义最本质的特征，最大优势', level: 0 },
    { id: 's1', name: '社会稳定', desc: '国家长治久安，发展的前提', level: 1 },
    { id: 's2', name: '经济建设', desc: '中心工作，物质基础', level: 2 },
    { id: 's3', name: '政治建设', desc: '人民当家作主，制度保障', level: 2 },
    { id: 's4', name: '文化建设', desc: '精神动力，文化自信', level: 2 },
    { id: 's5', name: '社会建设', desc: '民生福祉，公平正义', level: 2 },
    { id: 's6', name: '生态文明', desc: '绿色发展，永续发展', level: 2 },
    { id: 's7', name: '现代化', desc: '富强民主文明和谐美丽', level: 3 },
    { id: 's8', name: '伟大复兴', desc: '中华民族近代以来最伟大的梦想', level: 4 }
];

// Relations (Covering Relations for Hasse Diagram)
// s0 -> s1
// s1 -> s2, s3, s4, s5, s6
// s2..s6 -> s7
// s7 -> s8
const RELATIONS = [
    ['s0', 's1'],
    ['s1', 's2'], ['s1', 's3'], ['s1', 's4'], ['s1', 's5'], ['s1', 's6'],
    ['s2', 's7'], ['s3', 's7'], ['s4', 's7'], ['s5', 's7'], ['s6', 's7'],
    ['s7', 's8']
];

const NODE_WIDTH = 120;
const NODE_HEIGHT = 40;
const NODE_GAP = 18;

// Graph State
let nodes = [];
let edges = [];
let selectedNodes = new Set();
let width, height;

// Initialization
function init() {
    setupResize();
    calculateLayout();
    renderDiagram();
    setupInteractions();
}

function calculateLayout() {
    const container = document.getElementById('diagramContainer');
    const rect = container.getBoundingClientRect();
    width = Math.max(620, Math.round(rect.width || container.clientWidth || 760));
    height = Math.max(430, Math.round(rect.height || container.clientHeight || 520));

    diagramSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    diagramSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Hasse Layout: Levels
    const padX = NODE_WIDTH / 2 + 28;
    const padTop = NODE_HEIGHT / 2 + 30;
    const padBottom = NODE_HEIGHT / 2 + 34;
    const maxLevel = Math.max(...STRATEGIES.map(s => s.level));
    const levelHeight = (height - padTop - padBottom) / Math.max(1, maxLevel);
    const levelCounts = {};
    STRATEGIES.forEach(s => {
        levelCounts[s.level] = (levelCounts[s.level] || 0) + 1;
    });

    const levelCurrent = {};

    nodes = STRATEGIES.map(s => {
        const count = levelCounts[s.level];
        const idx = levelCurrent[s.level] || 0;
        levelCurrent[s.level] = idx + 1;

        const availableWidth = width - padX * 2;
        const minNeeded = count > 1 ? (count - 1) * (NODE_WIDTH + NODE_GAP) : 0;
        const spread = Math.min(availableWidth, Math.max(minNeeded, availableWidth * 0.9));
        const x = count === 1
            ? width / 2
            : width / 2 - spread / 2 + (spread * idx) / (count - 1);
        const y = height - padBottom - s.level * levelHeight;

        return { ...s, x, y };
    });

    edges = RELATIONS.map(([sourceId, targetId]) => {
        const source = nodes.find(n => n.id === sourceId);
        const target = nodes.find(n => n.id === targetId);
        return { source, target, id: `${sourceId}-${targetId}` };
    });
}

function renderDiagram() {
    diagramSvg.innerHTML = '';

    // Draw Edges
    edges.forEach(edge => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const points = edgeEndpoints(edge.source, edge.target);
        line.setAttribute('x1', points.start.x);
        line.setAttribute('y1', points.start.y);
        line.setAttribute('x2', points.end.x);
        line.setAttribute('y2', points.end.y);
        line.setAttribute('class', 'edge');
        line.dataset.id = edge.id;
        diagramSvg.appendChild(line);
    });

    // Draw Nodes
    nodes.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        g.setAttribute('class', 'node-group');
        g.dataset.id = node.id;
        if (selectedNodes.has(node.id)) {
            g.classList.add('selected');
        }

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', -60);
        rect.setAttribute('y', -20);
        rect.setAttribute('width', NODE_WIDTH);
        rect.setAttribute('height', NODE_HEIGHT);
        rect.setAttribute('class', 'node-rect');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('dy', 5);
        text.setAttribute('class', 'node-text');
        text.textContent = node.name;

        g.appendChild(rect);
        g.appendChild(text);

        // Events
        g.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSelection(node.id);
        });
        g.addEventListener('mouseenter', (e) => showTooltip(e, node));
        g.addEventListener('mouseleave', hideTooltip);

        diagramSvg.appendChild(g);
    });
}

function edgeEndpoints(source, target) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const startOffset = rectBoundaryOffset(ux, uy);
    const endOffset = rectBoundaryOffset(-ux, -uy);

    return {
        start: {
            x: source.x + ux * startOffset,
            y: source.y + uy * startOffset
        },
        end: {
            x: target.x - ux * endOffset,
            y: target.y - uy * endOffset
        }
    };
}

function rectBoundaryOffset(ux, uy) {
    const tx = Math.abs(ux) > 0.0001 ? (NODE_WIDTH / 2) / Math.abs(ux) : Infinity;
    const ty = Math.abs(uy) > 0.0001 ? (NODE_HEIGHT / 2) / Math.abs(uy) : Infinity;
    return Math.min(tx, ty) + 2;
}

// Interaction
function toggleSelection(id) {
    if (selectedNodes.has(id)) {
        selectedNodes.delete(id);
        document.querySelector(`.node-group[data-id="${id}"]`).classList.remove('selected');
    } else {
        selectedNodes.add(id);
        document.querySelector(`.node-group[data-id="${id}"]`).classList.add('selected');
    }
    updateSelectionUI();
}

function updateSelectionUI() {
    if (selectedNodes.size > 0) {
        selectedList.className = '';
        selectedList.innerHTML = Array.from(selectedNodes).map(id => {
            const node = nodes.find(n => n.id === id);
            return `<span class="selected-tag">${node.name}</span>`;
        }).join('');

        if (selectedNodes.size >= 2) {
            actionHint.textContent = '提示：可查找这些战略的共同基础(下界)或共同目标(上界)';
        } else {
            actionHint.textContent = '';
        }
    } else {
        selectedList.className = 'empty-selection';
        selectedList.textContent = '请点击节点选择子集...';
        actionHint.textContent = '';
    }
}

// Order Theory Logic
function handleAction(action) {
    clearHighlights();

    switch (action) {
        case 'extremes':
            showExtremes();
            break;
        case 'antichain':
            showAntichain();
            break;
        case 'upper-bound':
            showBounds('upper');
            break;
        case 'lower-bound':
            showBounds('lower');
            break;
    }
}

function showExtremes() {
    // Minimal: s0 (Party Leadership)
    // Maximal: s8 (Great Rejuvenation)
    highlightNode('s0', 'red');
    highlightNode('s8', 'gold');

    updateConcept('极值元 (Extremal Elements)',
        '最小元(Minimum)：集合中所有元素都以其为基础，即"党的领导"是各项事业的根本保证。<br>最大元(Maximum)：集合中所有元素都指向的最终目标，即"伟大复兴"。',
        'Min: ∀x∈S, min≼x; Max: ∀x∈S, x≼max',
        '🏔️',
        '办好中国的事情，关键在党。党的领导是复兴大业的定海神针（最小元）；中华民族伟大复兴是近代以来最伟大的梦想（最大元）。'
    );
}

function showAntichain() {
    // The "Five Spheres" (s2-s6)
    ['s2', 's3', 's4', 's5', 's6'].forEach(id => highlightNode(id, 'green'));

    updateConcept('反链 (Antichain)',
        '反链是集合中互不可比的元素子集。在战略中，代表"五位一体"（经济、政治、文化、社会、生态）并行不悖、协同推进。',
        '∀x,y∈A, x≠y ⇒ ¬(x≼y) ∧ ¬(y≼x)',
        '⚡',
        '五位一体总体布局是一个有机整体。经济、政治、文化、社会、生态文明建设互为条件、相互促进，不能厚此薄彼，体现了系统观念。'
    );
}

function showBounds(type) {
    if (selectedNodes.size === 0) {
        alert('请先选择至少一个节点');
        return;
    }

    const selectedIds = Array.from(selectedNodes);

    // Simple reachability for this specific tree-like DAG
    // Ancestors (Lower Bounds candidates)
    // Descendants (Upper Bounds candidates)

    // Hardcoded reachability for simplicity and robustness in this demo
    const ancestors = {
        's0': [],
        's1': ['s0'],
        's2': ['s1', 's0'], 's3': ['s1', 's0'], 's4': ['s1', 's0'], 's5': ['s1', 's0'], 's6': ['s1', 's0'],
        's7': ['s2', 's3', 's4', 's5', 's6', 's1', 's0'],
        's8': ['s7', 's2', 's3', 's4', 's5', 's6', 's1', 's0']
    };

    const descendants = {
        's8': [],
        's7': ['s8'],
        's2': ['s7', 's8'], 's3': ['s7', 's8'], 's4': ['s7', 's8'], 's5': ['s7', 's8'], 's6': ['s7', 's8'],
        's1': ['s2', 's3', 's4', 's5', 's6', 's7', 's8'],
        's0': ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']
    };

    let bounds = null;

    if (type === 'lower') {
        // Intersection of ancestors (plus self)
        selectedIds.forEach(id => {
            const set = new Set([...ancestors[id], id]);
            if (!bounds) bounds = set;
            else bounds = new Set([...bounds].filter(x => set.has(x)));
        });

        if (bounds && bounds.size > 0) {
            bounds.forEach(id => highlightNode(id, 'red'));
            // GLB is the one with highest level
            const glb = Array.from(bounds).sort((a, b) => nodes.find(n => n.id === b).level - nodes.find(n => n.id === a).level)[0];

            updateConcept('下界与最大下界 (Lower Bound & GLB)',
                '下界是所有选定元素的共同基础。最大下界(GLB)是其中最"紧"的基础。',
                'GLB(S) = max{x | ∀s∈S, x≼s}',
                '⬇️',
                `对于选定的战略，${nodes.find(n => n.id === glb).name}是它们共同的、最直接的支撑基础。`
            );
        }
    } else {
        // Intersection of descendants (plus self)
        selectedIds.forEach(id => {
            const set = new Set([...descendants[id], id]);
            if (!bounds) bounds = set;
            else bounds = new Set([...bounds].filter(x => set.has(x)));
        });

        if (bounds && bounds.size > 0) {
            bounds.forEach(id => highlightNode(id, 'gold'));
            // LUB is the one with lowest level
            const lub = Array.from(bounds).sort((a, b) => nodes.find(n => n.id === a).level - nodes.find(n => n.id === b).level)[0];

            updateConcept('上界与最小上界 (Upper Bound & LUB)',
                '上界是所有选定元素的共同目标。最小上界(LUB)是其中最"近"的目标。',
                'LUB(S) = min{x | ∀s∈S, s≼x}',
                '⬆️',
                `选定的战略最终都汇聚于${nodes.find(n => n.id === lub).name}，这是它们共同的奋斗指向。`
            );
        }
    }
}

// Helpers
function highlightNode(id, color) {
    const el = document.querySelector(`.node-group[data-id="${id}"]`);
    if (el) el.classList.add(`highlight-${color}`);
}

function clearHighlights() {
    document.querySelectorAll('.node-group').forEach(el => {
        el.classList.remove('highlight-gold', 'highlight-red', 'highlight-green');
    });
}

function updateConcept(title, desc, math, icon, insight) {
    conceptTitle.textContent = title;
    conceptDesc.innerHTML = desc;
    conceptMath.textContent = math;
    conceptIcon.textContent = icon;
    insightText.textContent = insight;
}

function showTooltip(e, node) {
    const left = Math.min(width - 240, node.x + NODE_WIDTH / 2 + 12);
    const top = Math.max(8, node.y - NODE_HEIGHT / 2 - 12);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.opacity = 1;

    tooltip.innerHTML = `
        <h4 style="margin-bottom:4px;color:#2c3e50">${node.name}</h4>
        <p style="color:#7f8c8d;font-size:0.8rem">${node.desc}</p>
    `;
}

function hideTooltip() {
    tooltip.style.opacity = 0;
}

function setupResize() {
    window.addEventListener('resize', () => {
        calculateLayout();
        renderDiagram();
    });
}

function setupInteractions() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => handleAction(btn.dataset.action));
    });

    resetBtn.addEventListener('click', () => {
        selectedNodes.clear();
        document.querySelectorAll('.node-group').forEach(n => n.classList.remove('selected'));
        updateSelectionUI();
        clearHighlights();

        updateConcept('偏序集 (Poset)',
            '偏序集是一个集合，其中定义了元素之间的"前驱"或"支撑"关系。在国家战略中，这表现为基础与目标、局部与整体的逻辑架构。',
            '(S, ≼)',
            '🏛️',
            '国家战略是一个严密的逻辑体系。党的领导是根本保证（最小元），伟大复兴是最终目标（最大元）。"五位一体"总体布局（反链）体现了全面发展的系统观念。'
        );
    });
}

// Start
init();
