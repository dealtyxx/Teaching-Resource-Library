/**
 * 红色平面 - 平面图可视化
 * Revolutionary Plane - Planar Graph Visualizer
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const facesGroup = document.getElementById('facesGroup');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const generateBtn = document.getElementById('generateBtn');
const testPlanarity = document.getElementById('testPlanarity');
const resetBtn = document.getElementById('resetBtn');
const graphSelect = document.getElementById('graphSelect');
const highlightOuter = document.getElementById('highlightOuter');
const highlightInner = document.getElementById('highlightInner');
const clearHighlight = document.getElementById('clearHighlight');
const statusText = document.getElementById('statusText');
const vertexCountDisplay = document.getElementById('vertexCount');
const edgeCountDisplay = document.getElementById('edgeCount');
const faceCountDisplay = document.getElementById('faceCount');
const eulerResultDisplay = document.getElementById('eulerResult');
const planarityResultDisplay = document.getElementById('planarityResult');

// State
let nodes = [];
let edges = [];
let faces = [];
let currentRepresentation = 'plane';
let nodeElements = new Map();
let edgeElements = new Map();
let faceElements = new Map();

// Constants
const NODE_RADIUS = 28;
const REVOLUTIONARY_BASES = [
    "上海", "井冈山", "瑞金", "遵义", "延安",
    "西柏坡", "北京", "深圳", "浦东", "雄安"
];

// Helper Functions
function createSVGElement(type, attributes = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    return el;
}

// Graph Generation
function generateGraph() {
    nodes = [];
    edges = [];
    faces = [];
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    facesGroup.innerHTML = '';
    nodeElements.clear();
    edgeElements.clear();
    faceElements.clear();

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const graphType = graphSelect.value;

    switch (graphType) {
        case 'k4':
            generateK4(centerX, centerY);
            break;
        case 'wheel':
            generateWheel(centerX, centerY);
            break;
        case 'fan':
            generateFan(centerX, centerY);
            break;
        case 'tree':
            generateTree(centerX, centerY);
            break;
        case 'k33':
            generateK33(centerX, centerY);
            break;
        case 'k5':
            generateK5(centerX, centerY);
            break;
        case 'octahedron':
            generateOctahedron(centerX, centerY);
            break;
        case 'custom':
            generateCustomPlanar(centerX, centerY);
            break;
    }

    renderGraph();
    detectFaces();
    updateEulerFormula();
    updatePlanarityDisplay();
}

// Generate K4
function generateK4(cx, cy) {
    const radius = 150;

    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI / 2) - Math.PI / 4;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        nodes.push({
            id: i,
            name: REVOLUTIONARY_BASES[i],
            x, y
        });
    }

    for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
            addEdge(i, j);
        }
    }
}

// Generate Wheel Graph W5
function generateWheel(cx, cy) {
    const radius = 150;

    nodes.push({
        id: 0,
        name: REVOLUTIONARY_BASES[0],
        x: cx,
        y: cy
    });

    for (let i = 1; i <= 5; i++) {
        const angle = ((i - 1) * 2 * Math.PI / 5) - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        nodes.push({
            id: i,
            name: REVOLUTIONARY_BASES[i],
            x, y
        });
    }

    for (let i = 1; i <= 5; i++) {
        addEdge(0, i);
    }

    for (let i = 1; i <= 5; i++) {
        addEdge(i, i === 5 ? 1 : i + 1);
    }
}

// Generate Fan Graph F5
function generateFan(cx, cy) {
    const spacing = 120;
    const startX = cx - spacing * 2;

    nodes.push({
        id: 0,
        name: REVOLUTIONARY_BASES[0],
        x: cx,
        y: cy - 100
    });

    for (let i = 1; i <= 5; i++) {
        nodes.push({
            id: i,
            name: REVOLUTIONARY_BASES[i],
            x: startX + (i - 1) * spacing,
            y: cy + 50
        });
    }

    for (let i = 1; i <= 5; i++) {
        addEdge(0, i);
    }

    for (let i = 1; i < 5; i++) {
        addEdge(i, i + 1);
    }
}

// Generate Tree Graph T6
function generateTree(cx, cy) {
    nodes.push({
        id: 0,
        name: REVOLUTIONARY_BASES[0],
        x: cx,
        y: cy - 120
    });

    nodes.push({
        id: 1,
        name: REVOLUTIONARY_BASES[1],
        x: cx - 100,
        y: cy
    });
    nodes.push({
        id: 2,
        name: REVOLUTIONARY_BASES[2],
        x: cx + 100,
        y: cy
    });

    nodes.push({
        id: 3,
        name: REVOLUTIONARY_BASES[3],
        x: cx - 140,
        y: cy + 120
    });
    nodes.push({
        id: 4,
        name: REVOLUTIONARY_BASES[4],
        x: cx,
        y: cy + 120
    });
    nodes.push({
        id: 5,
        name: REVOLUTIONARY_BASES[5],
        x: cx + 140,
        y: cy + 120
    });

    addEdge(0, 1);
    addEdge(0, 2);
    addEdge(1, 3);
    addEdge(1, 4);
    addEdge(2, 5);
}

// Generate K3,3
function generateK33(cx, cy) {
    const leftX = cx - 200;
    const rightX = cx + 200;
    const spacing = 120;

    for (let i = 0; i < 3; i++) {
        const y = cy - spacing + (i * spacing);
        nodes.push({
            id: i,
            name: REVOLUTIONARY_BASES[i],
            x: leftX,
            y
        });
    }

    for (let i = 0; i < 3; i++) {
        const y = cy - spacing + (i * spacing);
        nodes.push({
            id: i + 3,
            name: REVOLUTIONARY_BASES[i + 3],
            x: rightX,
            y
        });
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 3; j < 6; j++) {
            addEdge(i, j);
        }
    }
}

// Generate K5
function generateK5(cx, cy) {
    const radius = 160;

    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        nodes.push({
            id: i,
            name: REVOLUTIONARY_BASES[i],
            x, y
        });
    }

    for (let i = 0; i < 5; i++) {
        for (let j = i + 1; j < 5; j++) {
            addEdge(i, j);
        }
    }
}

// Generate Octahedron Graph
function generateOctahedron(cx, cy) {
    const outerRadius = 140;
    const innerRadius = 70;

    nodes.push({
        id: 0,
        name: REVOLUTIONARY_BASES[0],
        x: cx,
        y: cy - outerRadius
    });

    for (let i = 1; i <= 4; i++) {
        const angle = ((i - 1) * Math.PI / 2) - Math.PI / 4;
        const x = cx + innerRadius * Math.cos(angle);
        const y = cy + innerRadius * Math.sin(angle);

        nodes.push({
            id: i,
            name: REVOLUTIONARY_BASES[i],
            x, y
        });
    }

    nodes.push({
        id: 5,
        name: REVOLUTIONARY_BASES[5],
        x: cx,
        y: cy + outerRadius
    });

    for (let i = 1; i <= 4; i++) {
        addEdge(0, i);
    }

    for (let i = 1; i <= 4; i++) {
        addEdge(i, i === 4 ? 1 : i + 1);
    }

    for (let i = 1; i <= 4; i++) {
        addEdge(i, 5);
    }
}

// Generate Custom Planar Graph
function generateCustomPlanar(cx, cy) {
    const radius = 160;

    for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI / 6) - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        nodes.push({
            id: i,
            name: REVOLUTIONARY_BASES[i],
            x, y
        });
    }

    for (let i = 0; i < 6; i++) {
        addEdge(i, (i + 1) % 6);
    }

    addEdge(0, 2);
    addEdge(2, 4);
    addEdge(4, 0);
}

function addEdge(u, v) {
    const id = `${Math.min(u, v)}-${Math.max(u, v)}`;
    if (!edges.find(e => e.id === id)) {
        edges.push({ u, v, id });
    }
}

// Face Detection Algorithm
function detectFaces() {
    faces = [];

    if (nodes.length === 0) return;

    const adjacency = new Map();
    nodes.forEach(node => adjacency.set(node.id, []));

    edges.forEach(edge => {
        adjacency.get(edge.u).push(edge.v);
        adjacency.get(edge.v).push(edge.u);
    });

    adjacency.forEach((neighbors, nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        neighbors.sort((a, b) => {
            const nodeA = nodes.find(n => n.id === a);
            const nodeB = nodes.find(n => n.id === b);

            const angleA = Math.atan2(nodeA.y - node.y, nodeA.x - node.x);
            const angleB = Math.atan2(nodeB.y - node.y, nodeB.x - node.x);

            return angleA - angleB;
        });
    });

    const visitedEdges = new Set();

    edges.forEach(edge => {
        const edgeId1 = `${edge.u}-${edge.v}`;
        const edgeId2 = `${edge.v}-${edge.u}`;

        [edgeId1, edgeId2].forEach(edgeId => {
            if (!visitedEdges.has(edgeId)) {
                const face = traceFace(edgeId, adjacency, visitedEdges);
                if (face && face.length >= 3) {
                    faces.push(face);
                }
            }
        });
    });

    if (faces.length > 0) {
        faces.sort((a, b) => calculateArea(b) - calculateArea(a));
        faces[0].isOuter = true;
    }

    renderFaces();
}

function traceFace(startEdge, adjacency, visitedEdges) {
    const [startU, startV] = startEdge.split('-').map(Number);
    const face = [startU];
    let current = startV;
    let previous = startU;

    while (current !== startU) {
        face.push(current);

        const edgeId = `${previous}-${current}`;
        visitedEdges.add(edgeId);

        const neighbors = adjacency.get(current);
        const prevIndex = neighbors.indexOf(previous);

        const nextIndex = (prevIndex + 1) % neighbors.length;
        const next = neighbors[nextIndex];

        if (face.length > nodes.length) {
            return null;
        }

        previous = current;
        current = next;
    }

    return face;
}

function calculateArea(face) {
    let area = 0;
    for (let i = 0; i < face.length; i++) {
        const j = (i + 1) % face.length;
        const nodeI = nodes.find(n => n.id === face[i]);
        const nodeJ = nodes.find(n => n.id === face[j]);
        area += nodeI.x * nodeJ.y - nodeJ.x * nodeI.y;
    }
    return Math.abs(area / 2);
}

// Rendering
function renderGraph() {
    edges.forEach(edge => {
        const uNode = nodes.find(n => n.id === edge.u);
        const vNode = nodes.find(n => n.id === edge.v);

        const line = createSVGElement('line', {
            x1: uNode.x, y1: uNode.y,
            x2: vNode.x, y2: vNode.y,
            class: 'edge-line',
            'data-edge-id': edge.id
        });

        edgesGroup.appendChild(line);
        edgeElements.set(edge.id, line);
    });

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

        const text = createSVGElement('text', {
            class: 'node-text',
            'text-anchor': 'middle',
            'dy': '.35em'
        });
        text.textContent = node.name;

        g.appendChild(circle);
        g.appendChild(text);
        nodesGroup.appendChild(g);
        nodeElements.set(node.id, g);
    });
}

// 修正后的面渲染函数 - 关键修改!
function renderFaces() {
    facesGroup.innerHTML = '';
    faceElements.clear();

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;

    faces.forEach((face, index) => {
        if (face.isOuter) {
            // 外部面:整个画布 - 图形轮廓 = 无界区域
            const facePoints = face.map(nodeId => {
                const node = nodes.find(n => n.id === nodeId);
                return `${node.x},${node.y}`;
            });

            // 使用path和fill-rule: evenodd创建镂空效果
            let pathD = `M 0,0 L ${width},0 L ${width},${height} L 0,${height} Z `;
            pathD += 'M ' + facePoints.join(' L ') + ' Z';

            const path = createSVGElement('path', {
                d: pathD,
                'fill-rule': 'evenodd',
                class: 'face-polygon outer',
                'data-face-index': index
            });

            facesGroup.appendChild(path);
            faceElements.set(index, path);
        } else {
            // 内部面:普通有界多边形
            const points = face.map(nodeId => {
                const node = nodes.find(n => n.id === nodeId);
                return `${node.x},${node.y}`;
            }).join(' ');

            const polygon = createSVGElement('polygon', {
                points: points,
                class: 'face-polygon inner',
                'data-face-index': index
            });

            facesGroup.appendChild(polygon);
            faceElements.set(index, polygon);
        }
    });
}

// Euler Formula
function updateEulerFormula() {
    const V = nodes.length;
    const E = edges.length;
    const F = faces.length;
    const result = V - E + F;

    vertexCountDisplay.textContent = V;
    edgeCountDisplay.textContent = E;
    faceCountDisplay.textContent = F;
    eulerResultDisplay.textContent = result;

    if (result === 2 && F > 0) {
        eulerResultDisplay.style.color = '#27c93f';
        statusText.textContent = '✓ 欧拉公式验证成功: V-E+F=2';
        statusText.style.color = '#27c93f';
    } else if (F > 0) {
        eulerResultDisplay.style.color = '#ff3b30';
        statusText.textContent = '⚠ 欧拉公式不满足,可能存在错误';
        statusText.style.color = '#ff3b30';
    } else {
        statusText.textContent = '请先检测面';
        statusText.style.color = '#8b0000';
    }
}

// Planarity Detection
function updatePlanarityDisplay() {
    const graphType = graphSelect.value;
    let isPlanar = false;
    let reason = '';

    if (graphType === 'k4' || graphType === 'custom' || graphType === 'wheel' ||
        graphType === 'fan' || graphType === 'tree' || graphType === 'octahedron') {
        isPlanar = true;
        reason = '✓ 平面图';
    } else if (graphType === 'k5') {
        isPlanar = false;
        reason = '✗ 非平面 (包含K₅)';
    } else if (graphType === 'k33') {
        isPlanar = false;
        reason = '✗ 非平面 (包含K₃,₃)';
    }

    planarityResultDisplay.textContent = reason;
    planarityResultDisplay.className = isPlanar ? 'planar' : 'non-planar';
}

// Face Highlighting
function highlightOuterFace() {
    clearAllHighlights();
    faces.forEach((face, index) => {
        if (face.isOuter) {
            const element = faceElements.get(index);
            element.classList.add('highlight');
        }
    });
    statusText.textContent = '外部面(无界面): 延伸到画布边界,包围整个图';
}

function highlightInnerFaces() {
    clearAllHighlights();
    faces.forEach((face, index) => {
        if (!face.isOuter) {
            const element = faceElements.get(index);
            element.classList.add('highlight');
        }
    });
    statusText.textContent = `内部面(有界面): 共${faces.length - 1}个封闭区域`;
}

function clearAllHighlights() {
    faceElements.forEach(element => {
        element.classList.remove('highlight');
    });
}

// Representation Toggle
document.querySelectorAll('.repr-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.repr-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentRepresentation = btn.getAttribute('data-repr');

        if (currentRepresentation === 'sphere') {
            document.body.classList.add('sphere-mode');
            statusText.textContent = '球面表示: 3D球面投影,外部面映射为球的一个区域';
        } else {
            document.body.classList.remove('sphere-mode');
            statusText.textContent = '平面表示: 标准的二维平面嵌入';
        }
    });
});

// Event Listeners
graphSelect.addEventListener('change', generateGraph);
generateBtn.addEventListener('click', generateGraph);

highlightOuter.addEventListener('click', highlightOuterFace);
highlightInner.addEventListener('click', highlightInnerFaces);
clearHighlight.addEventListener('click', () => {
    clearAllHighlights();
    statusText.textContent = '清除高亮';
});

testPlanarity.addEventListener('click', () => {
    detectFaces();
    updateEulerFormula();
    statusText.textContent = '平面性检测完成,查看欧拉公式结果';
});

resetBtn.addEventListener('click', () => {
    clearAllHighlights();
    statusText.textContent = '已重置';
    statusText.style.color = '#8b0000';
});

// Init
window.addEventListener('load', () => {
    generateGraph();
});
