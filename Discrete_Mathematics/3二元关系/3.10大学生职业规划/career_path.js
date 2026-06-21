/**
 * Career Development Path Planning System
 */

const startSelect = document.getElementById('startSelect');
const goalSelect = document.getElementById('goalSelect');
const findPathsBtn = document.getElementById('findPathsBtn');
const resetBtn = document.getElementById('resetBtn');
const graphSvg = document.getElementById('graphSvg');
const nodesLayer = document.getElementById('nodesLayer');
const pathCount = document.getElementById('pathCount');
const resultsContainer = document.getElementById('resultsContainer');
const insightSection = document.getElementById('insightSection');
const insightText = document.getElementById('insightText');

const CAREERS = [
    { id: 'c1', name: '软件工程师', level: 1 },
    { id: 'c2', name: '基层公务员', level: 1 },
    { id: 'c3', name: '助教', level: 1 },
    { id: 'c4', name: '管理培训生', level: 1 },
    { id: 'c5', name: '技术专家', level: 2 },
    { id: 'c6', name: '项目经理', level: 2 },
    { id: 'c7', name: '科长', level: 2 },
    { id: 'c8', name: '讲师', level: 2 },
    { id: 'c9', name: '部门主管', level: 2 },
    { id: 'c10', name: '技术总监', level: 3 },
    { id: 'c11', name: '处长', level: 3 },
    { id: 'c12', name: '副教授', level: 3 },
    { id: 'c13', name: '部门总监', level: 3 },
    { id: 'c14', name: 'CTO', level: 4 },
    { id: 'c15', name: '厅长', level: 4 },
    { id: 'c16', name: '教授', level: 4 },
    { id: 'c17', name: 'VP', level: 4 }
];

const TRANSITIONS = [
    ['c1', 'c5'],
    ['c5', 'c10'],
    ['c10', 'c14'],
    ['c1', 'c6'],
    ['c6', 'c13'],
    ['c13', 'c17'],
    ['c2', 'c7'],
    ['c7', 'c11'],
    ['c11', 'c15'],
    ['c3', 'c8'],
    ['c8', 'c12'],
    ['c12', 'c16'],
    ['c4', 'c9'],
    ['c9', 'c13'],
    ['c13', 'c17'],
    ['c5', 'c6'],
    ['c10', 'c13']
];

const NODE_WIDTH = 118;
const NODE_HEIGHT = 42;
const SVG_NS = 'http://www.w3.org/2000/svg';

const careerMap = {};
CAREERS.forEach(career => {
    careerMap[career.id] = career;
});

let selectedStart = null;
let selectedGoal = null;
let foundPaths = [];
let nodePositions = {};

function calculateLayout() {
    const container = document.getElementById('graphContainer');
    const rect = container.getBoundingClientRect();
    const width = Math.max(520, Math.round(rect.width || container.clientWidth || 800));
    const height = Math.max(460, Math.round(rect.height || container.clientHeight || 550));
    const padX = NODE_WIDTH / 2 + 28;
    const padY = NODE_HEIGHT / 2 + 22;
    const levelWidth = (width - padX * 2) / 3;

    graphSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    graphSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const byLevel = {};
    CAREERS.forEach(career => {
        if (!byLevel[career.level]) byLevel[career.level] = [];
        byLevel[career.level].push(career);
    });

    nodePositions = {};
    Object.entries(byLevel).forEach(([level, careers]) => {
        const x = padX + levelWidth * (Number(level) - 1);
        const gapY = (height - padY * 2) / Math.max(1, careers.length - 1);

        careers.forEach((career, index) => {
            nodePositions[career.id] = {
                x,
                y: careers.length === 1 ? height / 2 : padY + gapY * index
            };
        });
    });
}

function initializeSelects() {
    CAREERS.forEach(career => {
        const startOption = document.createElement('option');
        startOption.value = career.id;
        startOption.textContent = `${career.name} (L${career.level})`;
        startSelect.appendChild(startOption);

        const goalOption = document.createElement('option');
        goalOption.value = career.id;
        goalOption.textContent = `${career.name} (L${career.level})`;
        goalSelect.appendChild(goalOption);
    });
}

function renderGraph() {
    renderEdges();
    renderNodes();
    applyCurrentHighlights();
}

function renderNodes() {
    nodesLayer.innerHTML = '';
    graphSvg.querySelectorAll('.career-node').forEach(node => node.remove());

    CAREERS.forEach(career => {
        const pos = nodePositions[career.id];
        const group = document.createElementNS(SVG_NS, 'g');
        group.id = `node-${career.id}`;
        group.setAttribute('class', `career-node level${career.level}`);
        group.setAttribute('transform', `translate(${pos.x} ${pos.y})`);
        group.addEventListener('click', () => selectCareerNode(career.id));

        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('x', -NODE_WIDTH / 2);
        rect.setAttribute('y', -NODE_HEIGHT / 2);
        rect.setAttribute('width', NODE_WIDTH);
        rect.setAttribute('height', NODE_HEIGHT);
        rect.setAttribute('rx', 10);
        rect.setAttribute('ry', 10);

        const text = document.createElementNS(SVG_NS, 'text');
        text.textContent = career.name;
        text.setAttribute('x', 0);
        text.setAttribute('y', 0);

        group.appendChild(rect);
        group.appendChild(text);
        graphSvg.appendChild(group);
    });
}

function renderEdges() {
    const defs = graphSvg.querySelector('defs');
    graphSvg.innerHTML = '';
    graphSvg.appendChild(defs);

    TRANSITIONS.forEach(([from, to]) => {
        graphSvg.appendChild(createEdge(from, to));
    });
}

function createEdge(fromId, toId) {
    const from = nodePositions[fromId];
    const to = nodePositions[toId];
    const points = edgeEndpoints(from, to);
    const path = document.createElementNS(SVG_NS, 'path');
    const midX = (points.start.x + points.end.x) / 2;
    const d = `M ${points.start.x} ${points.start.y} Q ${midX} ${points.start.y} ${points.end.x} ${points.end.y}`;

    path.setAttribute('d', d);
    path.setAttribute('class', 'career-edge');
    path.dataset.edgeId = `${fromId}-${toId}`;

    return path;
}

function edgeEndpoints(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const startOffset = rectBoundaryOffset(ux, uy);
    const endOffset = rectBoundaryOffset(-ux, -uy);

    return {
        start: {
            x: from.x + ux * startOffset,
            y: from.y + uy * startOffset
        },
        end: {
            x: to.x - ux * endOffset,
            y: to.y - uy * endOffset
        }
    };
}

function rectBoundaryOffset(ux, uy) {
    const tx = Math.abs(ux) > 0.0001 ? (NODE_WIDTH / 2) / Math.abs(ux) : Infinity;
    const ty = Math.abs(uy) > 0.0001 ? (NODE_HEIGHT / 2) / Math.abs(uy) : Infinity;
    return Math.min(tx, ty) + 3;
}

function findAllPaths(start, goal) {
    const paths = [];
    const queue = [[start]];

    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];

        if (current === goal) {
            paths.push(path);
            continue;
        }

        if (path.length > 6) continue;

        TRANSITIONS.forEach(([from, to]) => {
            if (from === current && !path.includes(to)) {
                queue.push([...path, to]);
            }
        });
    }

    return paths;
}

function selectCareerNode(id) {
    if (!selectedStart || selectedGoal) {
        selectedStart = id;
        selectedGoal = null;
        foundPaths = [];
        startSelect.value = id;
        goalSelect.value = '';
        resetResults();
    } else if (id !== selectedStart) {
        selectedGoal = id;
        goalSelect.value = id;
        handleFindPaths();
    }

    checkSelection();
    applyCurrentHighlights();
}

function handleFindPaths() {
    if (!selectedStart || !selectedGoal) return;

    foundPaths = findAllPaths(selectedStart, selectedGoal);

    if (foundPaths.length === 0) {
        displayNoPath();
    } else {
        displayPaths();
    }

    applyCurrentHighlights();
}

function displayPaths() {
    pathCount.textContent = `找到 ${foundPaths.length} 条路径`;

    let html = '';
    foundPaths.slice(0, 3).forEach((path, index) => {
        const pathClass = `path${index + 1}`;
        html += `
            <div class="path-card ${pathClass}">
                <div class="path-header">
                    <span class="path-title">路径 ${index + 1}</span>
                    <span class="path-badge">${path.length - 1} 步</span>
                </div>
                <div class="path-steps">
                    ${path.map((id, stepIndex) => `
                        <span class="path-step">${careerMap[id].name}</span>
                        ${stepIndex < path.length - 1 ? '<span class="path-arrow">→</span>' : ''}
                    `).join('')}
                </div>
            </div>
        `;
    });

    if (foundPaths.length > 3) {
        html += `<p class="more-paths">还有 ${foundPaths.length - 3} 条路径...</p>`;
    }

    resultsContainer.innerHTML = html;
    showInsight();
}

function displayNoPath() {
    pathCount.textContent = '未找到路径';
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <span class="empty-icon">!</span>
            <p>从 ${careerMap[selectedStart].name} 到 ${careerMap[selectedGoal].name} 暂无直接发展路径</p>
            <p class="empty-tip">尝试选择其他职业组合</p>
        </div>
    `;
    insightSection.style.display = 'none';
}

function applyCurrentHighlights() {
    document.querySelectorAll('.career-node').forEach(node => {
        node.classList.remove('start', 'goal', 'on-path');
    });
    document.querySelectorAll('.career-edge').forEach(edge => {
        edge.classList.remove('path1', 'path2', 'path3');
    });

    if (selectedStart) {
        document.getElementById(`node-${selectedStart}`)?.classList.add('start');
    }

    if (selectedGoal) {
        document.getElementById(`node-${selectedGoal}`)?.classList.add('goal');
    }

    foundPaths.slice(0, 3).forEach((path, pathIndex) => {
        const pathClass = `path${pathIndex + 1}`;

        path.forEach(id => {
            if (id !== selectedStart && id !== selectedGoal) {
                document.getElementById(`node-${id}`)?.classList.add('on-path');
            }
        });

        for (let i = 0; i < path.length - 1; i++) {
            const edgeId = `${path[i]}-${path[i + 1]}`;
            document.querySelector(`[data-edge-id="${edgeId}"]`)?.classList.add(pathClass);
        }
    });
}

function showInsight() {
    const shortestPath = foundPaths.reduce((min, path) => path.length < min.length ? path : min, foundPaths[0]);
    const steps = shortestPath.length - 1;
    const insights = [
        `职业发展需要循序渐进。当前最短路径需要 ${steps} 步，每一步都是能力积累。`,
        '同一目标可能有多条发展路径，适合自己的路径才最可持续。',
        '职业规划要看清当下位置、目标方向和中间能力节点。'
    ];

    insightText.textContent = insights[Math.floor(Math.random() * insights.length)];
    insightSection.style.display = 'block';
}

function checkSelection() {
    findPathsBtn.disabled = !(selectedStart && selectedGoal && selectedStart !== selectedGoal);
}

function resetResults() {
    pathCount.textContent = '等待查询...';
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <span class="empty-icon">◎</span>
            <p>选择起点和目标，开始职业规划之旅</p>
        </div>
    `;
    insightSection.style.display = 'none';
}

startSelect.addEventListener('change', event => {
    selectedStart = event.target.value;
    foundPaths = [];
    resetResults();
    checkSelection();
    applyCurrentHighlights();
});

goalSelect.addEventListener('change', event => {
    selectedGoal = event.target.value;
    foundPaths = [];
    resetResults();
    checkSelection();
    applyCurrentHighlights();
});

findPathsBtn.addEventListener('click', handleFindPaths);

resetBtn.addEventListener('click', () => {
    selectedStart = null;
    selectedGoal = null;
    foundPaths = [];
    startSelect.value = '';
    goalSelect.value = '';
    findPathsBtn.disabled = true;
    resetResults();
    renderGraph();
});

window.addEventListener('resize', () => {
    calculateLayout();
    renderGraph();
});

calculateLayout();
initializeSelects();
renderGraph();
