/**
 * 红色志愿 - 志愿服务配对系统
 * Revolutionary Service - Volunteer Matching System (Hungarian Algorithm)
 */

// DOM Elements
const svg = document.getElementById('graphSvg');
const edgesGroup = document.getElementById('edgesGroup');
const volunteersGroup = document.getElementById('volunteersGroup');
const projectsGroup = document.getElementById('projectsGroup');
const scenarioSelect = document.getElementById('scenarioSelect');
const generateBtn = document.getElementById('generateBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const volunteerCount = document.getElementById('volunteerCount');
const projectCount = document.getElementById('projectCount');
const matchCount = document.getElementById('matchCount');
const matchRate = document.getElementById('matchRate');
const matchList = document.getElementById('matchList');

// Custom edit controls
const customControls = document.getElementById('customControls');
const addVolunteerBtn = document.getElementById('addVolunteerBtn');
const addProjectBtn = document.getElementById('addProjectBtn');
const addEdgeBtn = document.getElementById('addEdgeBtn');
const editHint = document.getElementById('editHint');

// State
let volunteers = [];
let projects = [];
let edges = [];
let adjacencyList = new Map(); // volunteer -> [projects]
let matching = new Map(); // volunteer id -> project id
let reverseMatching = new Map(); // project id -> volunteer id
let isRunning = false;
let volunteerElements = new Map();
let projectElements = new Map();
let edgeElements = [];

// Custom edit state
let editMode = null; // 'volunteer', 'project', 'edge', or null
let selectedForEdge = null; // {type: 'volunteer'|'project', id: number}
let nextVolunteerId = 0;
let nextProjectId = 0;

// Constants
const NODE_RADIUS = 28;
const VOLUNTEER_NAMES = [
    "张明 (教育)", "李华 (医疗)", "王芳 (环保)",
    "刘强 (科技)", "陈静 (文艺)", "赵伟 (助老)",
    "孙丽 (法律)", "周杰 (心理)"
];

const PROJECT_NAMES = [
    "社区支教", "敬老院服务", "环保宣传",
    "科技下乡", "文艺演出", "法律援助",
    "心理辅导", "医疗义诊"
];

const SCENARIOS = {
    scenario1: {
        name: "社区服务",
        volunteers: 5,
        projects: 5,
        edges: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [3, 4], [4, 4]]
    },
    scenario2: {
        name: "敬老助残",
        volunteers: 6,
        projects: 5,
        edges: [[0, 0], [0, 1], [1, 1], [2, 2], [2, 3], [3, 3], [4, 4], [5, 4]]
    },
    scenario3: {
        name: "环保行动",
        volunteers: 4,
        projects: 6,
        edges: [[0, 0], [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [2, 4], [3, 4], [3, 5]]
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDelay() {
    const val = parseInt(speedInput.value);
    return Math.max(100, 1000 - (val * 9));
}

// Toggle Custom Controls
function toggleCustomControls() {
    if (scenarioSelect.value === 'custom') {
        customControls.style.display = 'flex';
    } else {
        customControls.style.display = 'none';
        exitEditMode();
    }
}

// Edit Mode Functions
function enterVolunteerMode() {
    editMode = 'volunteer';
    selectedForEdge = null;

    addVolunteerBtn.classList.add('active');
    addProjectBtn.classList.remove('active');
    addEdgeBtn.classList.remove('active');

    clearSelectedStyles();

    editHint.textContent = '点击左半区域添加志愿者';
    statusText.textContent = '志愿者添加模式';
}

function enterProjectMode() {
    editMode = 'project';
    selectedForEdge = null;

    addVolunteerBtn.classList.remove('active');
    addProjectBtn.classList.add('active');
    addEdgeBtn.classList.remove('active');

    clearSelectedStyles();

    editHint.textContent = '点击右半区域添加服务项目';
    statusText.textContent = '项目添加模式';
}

function enterEdgeMode() {
    editMode = 'edge';
    selectedForEdge = null;

    addVolunteerBtn.classList.remove('active');
    addProjectBtn.classList.remove('active');
    addEdgeBtn.classList.add('active');

    clearSelectedStyles();

    editHint.textContent = '点击志愿者和项目建立连线';
    statusText.textContent = '连线添加模式';
}

function exitEditMode() {
    editMode = null;
    selectedForEdge = null;

    addVolunteerBtn.classList.remove('active');
    addProjectBtn.classList.remove('active');
    addEdgeBtn.classList.remove('active');

    clearSelectedStyles();

    editHint.textContent = '点击按钮开始编辑';
    statusText.textContent = '准备就绪';
}

function clearSelectedStyles() {
    volunteerElements.forEach(({ circle }) => {
        circle.classList.remove('selected');
    });
    projectElements.forEach(({ circle }) => {
        circle.classList.remove('selected');
    });
}

// SVG Click Handler
function handleSVGClick(event) {
    if (scenarioSelect.value !== 'custom') return;
    if (isRunning) return;
    if (!editMode) return;

    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;

    if (editMode === 'volunteer' && x < centerX) {
        addVolunteer(x, y);
    } else if (editMode === 'project' && x > centerX) {
        addProject(x, y);
    }
}

// Add Volunteer
function addVolunteer(x, y) {
    const id = nextVolunteerId++;
    const name = VOLUNTEER_NAMES[id % VOLUNTEER_NAMES.length];

    volunteers.push({ id, name, x, y });
    adjacencyList.set(id, []);

    renderSingleVolunteer({ id, name, x, y });
    updateStats();

    statusText.textContent = `添加志愿者: ${name}`;
}

// Add Project
function addProject(x, y) {
    const id = nextProjectId++;
    const name = PROJECT_NAMES[id % PROJECT_NAMES.length];

    projects.push({ id, name, x, y });

    renderSingleProject({ id, name, x, y });
    updateStats();

    statusText.textContent = `添加项目: ${name}`;
}

// Handle Node Click
function handleNodeClick(type, id) {
    if (scenarioSelect.value !== 'custom') return;
    if (editMode !== 'edge') return;
    if (isRunning) return;

    if (selectedForEdge === null) {
        // First selection
        selectedForEdge = { type, id };

        if (type === 'volunteer') {
            const el = volunteerElements.get(id);
            el.circle.classList.add('selected');
            statusText.textContent = `选中志愿者,点击项目建立连线`;
        } else {
            const el = projectElements.get(id);
            el.circle.classList.add('selected');
            statusText.textContent = `选中项目,点击志愿者建立连线`;
        }
    } else {
        // Second selection
        if (selectedForEdge.type === type) {
            // Same type, deselect
            clearSelectedStyles();
            selectedForEdge = null;
            statusText.textContent = '连线添加模式';
        } else {
            // Different types, create edge
            const vId = selectedForEdge.type === 'volunteer' ? selectedForEdge.id : id;
            const pId = selectedForEdge.type === 'project' ? selectedForEdge.id : id;

            addEdgeWithRender(vId, pId);
            clearSelectedStyles();
            selectedForEdge = null;
        }
    }
}

// Add Edge with Render
function addEdgeWithRender(vId, pId) {
    // Check if edge already exists
    const exists = edges.some(e => e.volunteer === vId && e.project === pId);
    if (exists) {
        statusText.textContent = '该连线已存在!';
        return;
    }

    // Add edge
    const edge = { volunteer: vId, project: pId, matched: false };
    edges.push(edge);

    if (!adjacencyList.has(vId)) {
        adjacencyList.set(vId, []);
    }
    adjacencyList.get(vId).push(pId);

    // Render edge
    const v = volunteers.find(vol => vol.id === vId);
    const p = projects.find(proj => proj.id === pId);

    if (v && p) {
        const line = createSVGElement('line', {
            x1: v.x + NODE_RADIUS, y1: v.y,
            x2: p.x - NODE_RADIUS, y2: p.y,
            class: 'edge-line'
        });
        edgesGroup.appendChild(line);
        edgeElements.push({ line, edge });

        statusText.textContent = `连线已添加: ${v.name.split(' ')[0]} - ${p.name}`;
    }
}

// Generate Scenario
function generateScenario() {
    volunteers = [];
    projects = [];
    edges = [];
    adjacencyList = new Map();
    matching = new Map();
    reverseMatching = new Map();
    volunteersGroup.innerHTML = '';
    projectsGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    volunteerElements.clear();
    projectElements.clear();
    edgeElements = [];
    nextVolunteerId = 0;
    nextProjectId = 0;

    const scenario = SCENARIOS[scenarioSelect.value];
    if (!scenario) {
        statusText.textContent = '自定义模式: 点击按钮添加志愿者和项目';
        updateStats();
        return;
    }

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;

    const vCount = scenario.volunteers;
    const pCount = scenario.projects;

    const leftX = width * 0.25;
    const rightX = width * 0.75;
    const vSpacing = (height - 120) / (vCount + 1);
    const pSpacing = (height - 120) / (pCount + 1);

    // Create volunteers
    for (let i = 0; i < vCount; i++) {
        volunteers.push({
            id: i,
            name: VOLUNTEER_NAMES[i],
            x: leftX,
            y: 60 + vSpacing * (i + 1)
        });
        adjacencyList.set(i, []);
    }

    // Create projects
    for (let i = 0; i < pCount; i++) {
        projects.push({
            id: i,
            name: PROJECT_NAMES[i],
            x: rightX,
            y: 60 + pSpacing * (i + 1)
        });
    }

    // Create edges
    scenario.edges.forEach(([v, p]) => {
        edges.push({ volunteer: v, project: p, matched: false });
        adjacencyList.get(v).push(p);
    });

    nextVolunteerId = vCount;
    nextProjectId = pCount;

    renderGraph();
    updateStats();
}

// Render Graph
function renderGraph() {
    // Render edges
    edges.forEach(edge => {
        const v = volunteers[edge.volunteer];
        const p = projects[edge.project];

        const line = createSVGElement('line', {
            x1: v.x + NODE_RADIUS, y1: v.y,
            x2: p.x - NODE_RADIUS, y2: p.y,
            class: 'edge-line'
        });
        edgesGroup.appendChild(line);

        edgeElements.push({ line, edge });
    });

    // Render volunteers
    volunteers.forEach(v => {
        renderSingleVolunteer(v);
    });

    // Render projects
    projects.forEach(p => {
        renderSingleProject(p);
    });
}

// Render Single Volunteer
function renderSingleVolunteer(v) {
    const g = createSVGElement('g', {
        class: 'volunteer-node',
        transform: `translate(${v.x}, ${v.y})`
    });

    const circle = createSVGElement('circle', {
        r: NODE_RADIUS,
        class: 'volunteer-circle'
    });

    const text = createSVGElement('text', {
        class: 'node-text',
        'text-anchor': 'middle',
        'dy': '.35em'
    });
    text.textContent = `V${v.id}`;

    const label = createSVGElement('text', {
        class: 'node-label',
        'text-anchor': 'middle',
        'dy': '3.5em'
    });
    label.textContent = v.name;

    g.appendChild(circle);
    g.appendChild(text);
    g.appendChild(label);
    volunteersGroup.appendChild(g);

    // Add click handler
    g.addEventListener('click', (e) => {
        e.stopPropagation();
        handleNodeClick('volunteer', v.id);
    });

    volunteerElements.set(v.id, { g, circle, text });
}

// Render Single Project
function renderSingleProject(p) {
    const g = createSVGElement('g', {
        class: 'project-node',
        transform: `translate(${p.x}, ${p.y})`
    });

    const circle = createSVGElement('circle', {
        r: NODE_RADIUS,
        class: 'project-circle'
    });

    const text = createSVGElement('text', {
        class: 'node-text',
        'text-anchor': 'middle',
        'dy': '.35em'
    });
    text.textContent = `P${p.id}`;

    const label = createSVGElement('text', {
        class: 'node-label',
        'text-anchor': 'middle',
        'dy': '3.5em'
    });
    label.textContent = p.name;

    g.appendChild(circle);
    g.appendChild(text);
    g.appendChild(label);
    projectsGroup.appendChild(g);

    // Add click handler
    g.addEventListener('click', (e) => {
        e.stopPropagation();
        handleNodeClick('project', p.id);
    });

    projectElements.set(p.id, { g, circle, text });
}

function updateStats() {
    volunteerCount.textContent = volunteers.length;
    projectCount.textContent = projects.length;
    matchCount.textContent = matching.size;

    const rate = volunteers.length > 0
        ? ((matching.size / volunteers.length) * 100).toFixed(0)
        : 0;
    matchRate.textContent = rate + '%';
}

// DFS to find augmenting path
async function dfs(v, visited) {
    const vEl = volunteerElements.get(v);
    if (vEl) {
        vEl.circle.classList.add('current');
        await sleep(getDelay() / 3);
    }

    const adjacentProjects = adjacencyList.get(v) || [];

    for (const p of adjacentProjects) {
        if (visited.has(p)) continue;
        visited.add(p);

        // Highlight edge
        const edgeEl = edgeElements.find(el =>
            el.edge.volunteer === v && el.edge.project === p
        );
        if (edgeEl) {
            edgeEl.line.classList.add('exploring');
            await sleep(getDelay() / 3);
        }

        // If project is unmatched or we can find augmenting path from matched volunteer
        if (!reverseMatching.has(p) || await dfs(reverseMatching.get(p), visited)) {
            // Found augmenting path
            if (edgeEl) {
                edgeEl.line.classList.remove('exploring');
                edgeEl.line.classList.add('augmenting');
            }

            await sleep(getDelay());

            // Update matching
            const oldMatch = matching.get(v);
            if (oldMatch !== undefined) {
                const oldEdge = edgeElements.find(el =>
                    el.edge.volunteer === v && el.edge.project === oldMatch
                );
                if (oldEdge) {
                    oldEdge.line.classList.remove('matched');
                }
                reverseMatching.delete(oldMatch);
            }

            matching.set(v, p);
            reverseMatching.set(p, v);

            if (edgeEl) {
                edgeEl.line.classList.remove('augmenting');
                edgeEl.line.classList.add('matched');
                edgeEl.edge.matched = true;
            }

            if (vEl) {
                vEl.circle.classList.remove('current');
                vEl.circle.classList.add('matched');
            }

            const pEl = projectElements.get(p);
            if (pEl) {
                pEl.circle.classList.add('matched');
            }

            return true;
        }

        if (edgeEl) {
            edgeEl.line.classList.remove('exploring');
        }
    }

    if (vEl) {
        vEl.circle.classList.remove('current');
    }
    return false;
}

// Hungarian Algorithm - Main
async function hungarianAlgorithm() {
    if (isRunning) return;

    isRunning = true;
    startBtn.disabled = true;
    generateBtn.disabled = true;

    reset();

    statusText.textContent = '开始匈牙利算法匹配...';
    await sleep(getDelay());

    // Try to find augmenting paths for each volunteer
    for (let i = 0; i < volunteers.length; i++) {
        const v = volunteers[i];
        statusText.textContent = `为志愿者 ${v.name} 寻找配对...`;

        const visited = new Set();
        const found = await dfs(v.id, visited);

        if (found) {
            updateMatchList();
            updateStats();
            await sleep(getDelay());
        } else {
            statusText.textContent = `志愿者 ${v.name} 无法找到合适项目`;
            await sleep(getDelay());
        }
    }

    statusText.textContent = `匹配完成! 共匹配${matching.size}对`;

    isRunning = false;
    startBtn.disabled = false;
    generateBtn.disabled = false;
}

// Update Match List
function updateMatchList() {
    matchList.innerHTML = '';

    matching.forEach((projectId, volunteerId) => {
        const vol = volunteers.find(v => v.id === volunteerId);
        const proj = projects.find(p => p.id === projectId);

        if (!vol || !proj) return;

        const item = document.createElement('div');
        item.className = 'match-item';

        const vName = document.createElement('span');
        vName.className = 'volunteer-name';
        vName.textContent = vol.name.split(' ')[0];

        const arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.textContent = '→';

        const pName = document.createElement('span');
        pName.className = 'project-name';
        pName.textContent = proj.name;

        item.appendChild(vName);
        item.appendChild(arrow);
        item.appendChild(pName);
        matchList.appendChild(item);
    });
}

// Reset
function reset() {
    matching.clear();
    reverseMatching.clear();
    matchList.innerHTML = '';

    edges.forEach(e => e.matched = false);

    edgeElements.forEach(({ line }) => {
        line.classList.remove('matched', 'augmenting', 'exploring');
    });

    volunteerElements.forEach(({ circle }) => {
        circle.classList.remove('matched', 'current');
    });

    projectElements.forEach(({ circle }) => {
        circle.classList.remove('matched', 'current');
    });

    updateStats();
}

// Event Listeners
scenarioSelect.addEventListener('change', () => {
    toggleCustomControls();
    generateScenario();
});

generateBtn.addEventListener('click', generateScenario);
startBtn.addEventListener('click', hungarianAlgorithm);
resetBtn.addEventListener('click', () => {
    reset();
    statusText.textContent = '已重置';
});

// Custom edit mode listeners
addVolunteerBtn.addEventListener('click', enterVolunteerMode);
addProjectBtn.addEventListener('click', enterProjectMode);
addEdgeBtn.addEventListener('click', enterEdgeMode);

// SVG canvas click
svg.addEventListener('click', handleSVGClick);

// Init
window.addEventListener('load', () => {
    toggleCustomControls();
    generateScenario();
});
