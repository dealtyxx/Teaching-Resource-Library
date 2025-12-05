/**
 * 城市交通 - 网络优化系统
 * Urban Traffic Network Optimization (Graph Set Operations)
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const viewButtons = document.querySelectorAll('.apple-btn[data-view]');
const statusText = document.getElementById('statusText');
const bikeCoverageEl = document.getElementById('bikeCoverage');
const carCoverageEl = document.getElementById('carCoverage');
const conflictCountEl = document.getElementById('conflictCount');
const potentialCountEl = document.getElementById('potentialCount');
const suggestionText = document.getElementById('suggestionText');
const viewTitle = document.getElementById('viewTitle');
const viewSubtitle = document.getElementById('viewSubtitle');

// State
let nodes = [];
let edges = []; // All possible edges in the grid
let g1Edges = new Set(); // Bike lanes (edge ids)
let g2Edges = new Set(); // Car lanes (edge ids)
let currentView = 'original';
let edgeElements = new Map(); // id -> line element

// Constants
const GRID_ROWS = 5;
const GRID_COLS = 6;
const NODE_SPACING_X = 120;
const NODE_SPACING_Y = 100;
const START_X = 100;
const START_Y = 100;

// Initialize Graph Data (Grid Layout)
function initGraphData() {
    nodes = [];
    edges = [];
    g1Edges.clear();
    g2Edges.clear();

    // Create Nodes
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            nodes.push({
                id: `n${r}_${c}`,
                x: START_X + c * NODE_SPACING_X,
                y: START_Y + r * NODE_SPACING_Y
            });
        }
    }

    // Create All Possible Edges (Grid)
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const u = `n${r}_${c}`;

            // Horizontal
            if (c < GRID_COLS - 1) {
                const v = `n${r}_${c + 1}`;
                edges.push({ u, v, id: getEdgeId(u, v) });
            }
            // Vertical
            if (r < GRID_ROWS - 1) {
                const v = `n${r + 1}_${c}`;
                edges.push({ u, v, id: getEdgeId(u, v) });
            }
        }
    }

    // Define G1 (Bike Network) - Green Corridors
    // Simulate some specific bike paths
    const bikePaths = [
        // Top horizontal
        ['n0_0', 'n0_1'], ['n0_1', 'n0_2'], ['n0_2', 'n0_3'],
        // Middle horizontal
        ['n2_0', 'n2_1'], ['n2_1', 'n2_2'], ['n2_2', 'n2_3'], ['n2_3', 'n2_4'], ['n2_4', 'n2_5'],
        // Vertical connectors
        ['n0_2', 'n1_2'], ['n1_2', 'n2_2'], ['n2_2', 'n3_2'], ['n3_2', 'n4_2'],
        ['n0_4', 'n1_4'], ['n1_4', 'n2_4']
    ];
    bikePaths.forEach(p => g1Edges.add(getEdgeId(p[0], p[1])));

    // Define G2 (Car Network) - Main Roads
    // Simulate arterial roads
    const carPaths = [
        // Bottom horizontal
        ['n4_0', 'n4_1'], ['n4_1', 'n4_2'], ['n4_2', 'n4_3'], ['n4_3', 'n4_4'], ['n4_4', 'n4_5'],
        // Middle horizontal (Shared with bike)
        ['n2_0', 'n2_1'], ['n2_1', 'n2_2'], ['n2_2', 'n2_3'], ['n2_3', 'n2_4'], ['n2_4', 'n2_5'],
        // Vertical main
        ['n0_0', 'n1_0'], ['n1_0', 'n2_0'], ['n2_0', 'n3_0'], ['n3_0', 'n4_0'],
        ['n0_5', 'n1_5'], ['n1_5', 'n2_5'], ['n2_5', 'n3_5'], ['n3_5', 'n4_5']
    ];
    carPaths.forEach(p => g2Edges.add(getEdgeId(p[0], p[1])));
}

function getEdgeId(u, v) {
    return [u, v].sort().join('-');
}

// Render Graph
function renderGraph() {
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    edgeElements.clear();

    // Render Edges
    edges.forEach(edge => {
        const uNode = nodes.find(n => n.id === edge.u);
        const vNode = nodes.find(n => n.id === edge.v);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', uNode.x);
        line.setAttribute('y1', uNode.y);
        line.setAttribute('x2', vNode.x);
        line.setAttribute('y2', vNode.y);
        line.setAttribute('class', 'edge-line'); // Base class

        // Determine initial class based on sets
        const isBike = g1Edges.has(edge.id);
        const isCar = g2Edges.has(edge.id);

        if (isBike && isCar) {
            line.classList.add('shared');
        } else if (isBike) {
            line.classList.add('bike');
        } else if (isCar) {
            line.classList.add('car');
        } else {
            line.classList.add('potential');
        }

        edgesGroup.appendChild(line);
        edgeElements.set(edge.id, line);
    });

    // Render Nodes
    nodes.forEach(node => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', 4);
        circle.setAttribute('class', 'node-circle');
        nodesGroup.appendChild(circle);
    });
}

// Analysis & View Logic
function updateView(view) {
    currentView = view;
    document.body.className = `view-${view}`; // For CSS scoping if needed, though we use class on container usually

    // Update Buttons
    viewButtons.forEach(btn => {
        if (btn.dataset.view === view) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Reset all edge classes for the view state
    // Actually, we use CSS classes on the container to filter visibility
    // So we just need to update the container class
    const container = document.querySelector('.glass-pane');
    container.className = `glass-pane view-${view}`;

    // Update Text Info
    updateInfoPanel(view);
}

function updateInfoPanel(view) {
    // Calculate Stats
    const totalEdges = edges.length;
    const bikeCount = g1Edges.size;
    const carCount = g2Edges.size;

    let conflictCount = 0;
    let potentialCount = 0;

    edges.forEach(e => {
        const isBike = g1Edges.has(e.id);
        const isCar = g2Edges.has(e.id);
        if (isBike && isCar) conflictCount++;
        if (!isBike && !isCar) potentialCount++;
    });

    // Update Stats DOM
    bikeCoverageEl.textContent = Math.round((bikeCount / totalEdges) * 100) + '%';
    carCoverageEl.textContent = Math.round((carCount / totalEdges) * 100) + '%';
    conflictCountEl.textContent = conflictCount;
    potentialCountEl.textContent = potentialCount;

    // View Specific Text
    switch (view) {
        case 'original':
            viewTitle.textContent = "城市交通综合网络 (G1 ∪ G2)";
            viewSubtitle.textContent = "Urban Integrated Traffic Network";
            statusText.textContent = "展示城市交通全貌，包含所有自行车道和汽车道。";
            suggestionText.innerHTML = `
                <strong>整体规划建议：</strong><br>
                当前网络覆盖率较高，但存在多处混合交通路段。建议进一步细化路权分配，提升路网连通性。
            `;
            break;
        case 'intersection':
            viewTitle.textContent = "共用路段识别 (G1 ∩ G2)";
            viewSubtitle.textContent = "Shared Road Segments Analysis";
            statusText.textContent = `识别出 ${conflictCount} 处机非混行路段，存在安全隐患。`;
            suggestionText.innerHTML = `
                <strong>安全整改建议：</strong><br>
                高亮路段为机非混行区，事故风险高。建议增设<strong>物理隔离带</strong>或<strong>彩色铺装</strong>，明确路权，保障骑行安全。
            `;
            break;
        case 'diff-bike':
            viewTitle.textContent = "自行车专用网络 (G1 - G2)";
            viewSubtitle.textContent = "Dedicated Bicycle Network";
            statusText.textContent = "展示仅供自行车通行的绿色长廊。";
            suggestionText.innerHTML = `
                <strong>慢行系统优化：</strong><br>
                高亮路段为自行车专用道，环境较好。建议打造为<strong>城市绿道</strong>，增加遮阳设施和休憩点，鼓励市民绿色出行。
            `;
            break;
        case 'diff-car':
            viewTitle.textContent = "汽车专用网络 (G2 - G1)";
            viewSubtitle.textContent = "Dedicated Motor Vehicle Network";
            statusText.textContent = "展示仅供汽车通行的快速路网。";
            suggestionText.innerHTML = `
                <strong>快速路网提速：</strong><br>
                高亮路段无非机动车干扰。建议优化信号灯配时，设立<strong>绿波带</strong>，提高机动车通行效率。
            `;
            break;
        case 'complement':
            viewTitle.textContent = "潜在路段发现 (~(G1 ∪ G2))";
            viewSubtitle.textContent = "Potential Route Discovery";
            statusText.textContent = `发现 ${potentialCount} 处未开发或未利用的潜在连接。`;
            suggestionText.innerHTML = `
                <strong>路网拓展建议：</strong><br>
                虚线所示为潜在连接通道。建议评估这些区域的开发价值，用于<strong>打通断头路</strong>或建设<strong>微循环路网</strong>，缓解主干道压力。
            `;
            break;
    }
}

// Event Listeners
viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        updateView(btn.dataset.view);
    });
});

// Init
window.addEventListener('load', () => {
    initGraphData();
    renderGraph();
    updateView('original');
});
