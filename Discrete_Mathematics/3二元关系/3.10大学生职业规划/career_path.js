/**
 * Red Mathematics - Career Development Path Planning System
 */

// DOM Elements
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

// Career Data (Hierarchical)
const CAREERS = [
    // Level 1: Entry
    { id: 'c1', name: '软件工程师', level: 1 },
    { id: 'c2', name: '基层公务员', level: 1 },
    { id: 'c3', name: '助教', level: 1 },
    { id: 'c4', name: '管理培训生', level: 1 },

    // Level 2: Mid
    { id: 'c5', name: '技术专家', level: 2 },
    { id: 'c6', name: '项目经理', level: 2 },
    { id: 'c7', name: '科长', level: 2 },
    { id: 'c8', name: '讲师', level: 2 },
    { id: 'c9', name: '部门主管', level: 2 },

    // Level 3: Senior
    { id: 'c10', name: '技术总监', level: 3 },
    { id: 'c11', name: '处长', level: 3 },
    { id: 'c12', name: '副教授', level: 3 },
    { id: 'c13', name: '部门总监', level: 3 },

    // Level 4: Leadership
    { id: 'c14', name: 'CTO', level: 4 },
    { id: 'c15', name: '厅长', level: 4 },
    { id: 'c16', name: '教授', level: 4 },
    { id: 'c17', name: 'VP', level: 4 }
];

// Career Transitions (R)
const TRANSITIONS = [
    // Tech Track
    ['c1', 'c5'],  // 软件工程师 → 技术专家
    ['c5', 'c10'], // 技术专家 → 技术总监
    ['c10', 'c14'], // 技术总监 → CTO

    // Management Track (from tech)
    ['c1', 'c6'],  // 软件工程师 → 项目经理
    ['c6', 'c13'], // 项目经理 → 部门总监
    ['c13', 'c17'], // 部门总监 → VP

    // Public Service Track
    ['c2', 'c7'],  // 基层公务员 → 科长
    ['c7', 'c11'], // 科长 → 处长
    ['c11', 'c15'], // 处长 → 厅长

    // Education Track
    ['c3', 'c8'],  // 助教 → 讲师
    ['c8', 'c12'], // 讲师 → 副教授
    ['c12', 'c16'], // 副教授 → 教授

    // Business Track
    ['c4', 'c9'],  // 管理培训生 → 部门主管
    ['c9', 'c13'], // 部门主管 → 部门总监
    ['c13', 'c17'], // 部门总监 → VP

    // Cross transitions
    ['c5', 'c6'],  // 技术专家 → 项目经理 (tech to management)
    ['c10', 'c13'] // 技术总监 → 部门总监 (senior cross)
];

// Build map
const careerMap = {};
CAREERS.forEach(c => {
    careerMap[c.id] = c;
});

// State
let selectedStart = null;
let selectedGoal = null;
let foundPaths = [];
let nodePositions = {};

// Layout
function calculateLayout() {
    const width = 800;
    const height = 550;
    const levels = 4;
    const levelWidth = width / (levels + 1);

    // Group by level
    const byLevel = {};
    CAREERS.forEach(c => {
        if (!byLevel[c.level]) byLevel[c.level] = [];
        byLevel[c.level].push(c);
    });

    // Position
    Object.entries(byLevel).forEach(([level, careers]) => {
        const x = levelWidth * parseInt(level);
        const itemHeight = height / (careers.length + 1);

        careers.forEach((career, idx) => {
            nodePositions[career.id] = {
                x: x,
                y: itemHeight * (idx + 1)
            };
        });
    });
}

// Initialize Selects
function initializeSelects() {
    CAREERS.forEach(c => {
        const opt1 = document.createElement('option');
        opt1.value = c.id;
        opt1.textContent = `${c.name} (L${c.level})`;
        startSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = c.id;
        opt2.textContent = `${c.name} (L${c.level})`;
        goalSelect.appendChild(opt2);
    });
}

// Rendering
function renderGraph() {
    renderNodes();
    renderEdges();
}

function renderNodes() {
    nodesLayer.innerHTML = '';

    CAREERS.forEach(c => {
        const pos = nodePositions[c.id];
        const node = document.createElement('div');
        node.className = `career-node level${c.level}`;
        node.id = `node-${c.id}`;
        node.textContent = c.name;

        node.style.left = `${pos.x - 45}px`;
        node.style.top = `${pos.y - 20}px`;

        nodesLayer.appendChild(node);
    });
}

function renderEdges() {
    const defs = graphSvg.querySelector('defs');
    graphSvg.innerHTML = '';
    graphSvg.appendChild(defs);

    TRANSITIONS.forEach(([from, to]) => {
        const edge = createEdge(from, to);
        graphSvg.appendChild(edge);
    });
}

function createEdge(fromId, toId) {
    const from = nodePositions[fromId];
    const to = nodePositions[toId];

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Bezier curve for better visualization
    const midX = (from.x + to.x) / 2;
    const d = `M ${from.x} ${from.y} Q ${midX} ${from.y} ${to.x} ${to.y}`;

    path.setAttribute('d', d);
    path.setAttribute('class', 'career-edge');
    path.dataset.edgeId = `${fromId}-${toId}`;

    return path;
}

// Path Finding (BFS - finds all paths)
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

        // Avoid cycles and limit path length
        if (path.length > 6) continue;

        // Find next steps
        TRANSITIONS.forEach(([from, to]) => {
            if (from === current && !path.includes(to)) {
                queue.push([...path, to]);
            }
        });
    }

    return paths;
}

// Query
function handleFindPaths() {
    if (!selectedStart || !selectedGoal) return;

    foundPaths = findAllPaths(selectedStart, selectedGoal);

    if (foundPaths.length === 0) {
        displayNoPath();
    } else {
        displayPaths();
        highlightPaths();
    }
}

function displayPaths() {
    pathCount.textContent = `找到 ${foundPaths.length} 条路径`;

    let html = '';
    foundPaths.slice(0, 3).forEach((path, idx) => {
        const pathClass = `path${idx + 1}`;
        html += `
            <div class="path-card ${pathClass}">
                <div class="path-header">
                    <span class="path-title">路径 ${idx + 1}</span>
                    <span class="path-badge">${path.length - 1} 步</span>
                </div>
                <div class="path-steps">
                    ${path.map((id, i) => `
                        <span class="path-step">${careerMap[id].name}</span>
                        ${i < path.length - 1 ? '<span class="path-arrow">→</span>' : ''}
                    `).join('')}
                </div>
            </div>
        `;
    });

    if (foundPaths.length > 3) {
        html += `<p style="text-align:center; color:#7a7a7a; font-size:0.85rem; margin-top:10px;">还有 ${foundPaths.length - 3} 条路径...</p>`;
    }

    resultsContainer.innerHTML = html;

    // Show insight
    showInsight();
}

function displayNoPath() {
    pathCount.textContent = '未找到路径';
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <span class="empty-icon">🚫</span>
            <p>从 ${careerMap[selectedStart].name} 到 ${careerMap[selectedGoal].name} 暂无直接发展路径</p>
            <p style="font-size:0.8rem; margin-top:10px; color:#7a7a7a;">尝试选择其他职业组合</p>
        </div>
    `;
    insightSection.style.display = 'none';
}

function highlightPaths() {
    // Reset
    document.querySelectorAll('.career-node').forEach(n => {
        n.classList.remove('start', 'goal', 'on-path');
    });
    document.querySelectorAll('.career-edge').forEach(e => {
        e.classList.remove('path1', 'path2', 'path3');
    });

    // Mark start and goal
    document.getElementById(`node-${selectedStart}`).classList.add('start');
    document.getElementById(`node-${selectedGoal}`).classList.add('goal');

    // Highlight paths
    foundPaths.slice(0, 3).forEach((path, pathIdx) => {
        const pathClass = `path${pathIdx + 1}`;

        // Nodes on path
        path.forEach(id => {
            if (id !== selectedStart && id !== selectedGoal) {
                document.getElementById(`node-${id}`).classList.add('on-path');
            }
        });

        // Edges on path
        for (let i = 0; i < path.length - 1; i++) {
            const edgeId = `${path[i]}-${path[i + 1]}`;
            const edge = document.querySelector(`[data-edge-id="${edgeId}"]`);
            if (edge) edge.classList.add(pathClass);
        }
    });
}

function showInsight() {
    const shortestPath = foundPaths.reduce((min, p) => p.length < min.length ? p : min, foundPaths[0]);
    const steps = shortestPath.length - 1;

    const insights = [
        `职业发展需要循序渐进、艰苦奋斗。最短路径需要 ${steps} 步，每一步都是成长的积累。`,
        `不同的发展路径体现了"条条大路通罗马"的智慧。选择适合自己的路径，坚持不懈，终能达成目标。`,
        `个人发展与国家需要相结合。无论选择技术、管理还是公共服务，都要以为人民服务为宗旨。`
    ];

    insightText.textContent = insights[Math.floor(Math.random() * insights.length)];
    insightSection.style.display = 'block';
}

// Event Listeners
startSelect.addEventListener('change', (e) => {
    selectedStart = e.target.value;
    checkSelection();
});

goalSelect.addEventListener('change', (e) => {
    selectedGoal = e.target.value;
    checkSelection();
});

function checkSelection() {
    findPathsBtn.disabled = !(selectedStart && selectedGoal && selectedStart !== selectedGoal);
}

findPathsBtn.addEventListener('click', handleFindPaths);

resetBtn.addEventListener('click', () => {
    selectedStart = null;
    selectedGoal = null;
    foundPaths = [];

    startSelect.value = '';
    goalSelect.value = '';
    findPathsBtn.disabled = true;

    pathCount.textContent = '等待查询...';
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <span class="empty-icon">🎯</span>
            <p>选择起点和目标，开始职业规划之旅</p>
        </div>
    `;
    insightSection.style.display = 'none';

    renderGraph();
});

window.addEventListener('resize', () => {
    calculateLayout();
    renderGraph();
});

// Init
calculateLayout();
initializeSelects();
renderGraph();
