/**
 * Red Mathematics - Order Relations Visualization
 */

// DOM Elements
const navBtns = document.querySelectorAll('.nav-btn');
const modeViews = document.querySelectorAll('.mode-view');
const conceptTitle = document.getElementById('conceptTitle');
const conceptDesc = document.getElementById('conceptDesc');
const conceptMath = document.getElementById('conceptMath');
const conceptIcon = document.getElementById('conceptIcon');
const insightText = document.getElementById('insightText');
const conceptCard = document.getElementById('conceptCard');
const resetBtn = document.getElementById('resetBtn');

// --- Total Order Logic ---
const totalEvents = [
    { id: 't1', name: '建党', year: 1921, desc: '开天辟地' },
    { id: 't2', name: '建国', year: 1949, desc: '改天换地' },
    { id: 't3', name: '改革开放', year: 1978, desc: '翻天覆地' },
    { id: 't4', name: '新时代', year: 2012, desc: '惊天动地' },
    { id: 't5', name: '强国', year: 2050, desc: '伟大复兴' }
];

let draggedItem = null;

function initTotalOrder() {
    const dropZones = document.getElementById('dropZones');
    const cardPool = document.getElementById('cardPool');

    dropZones.innerHTML = '';
    cardPool.innerHTML = '';

    // Create Drop Zones (Timeline)
    totalEvents.forEach((evt, index) => {
        const zone = document.createElement('div');
        zone.className = 'drop-zone';
        zone.dataset.index = index;
        zone.innerHTML = `<span class="zone-label">${evt.year}</span>`;

        zone.addEventListener('dragover', e => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            if (draggedItem) {
                // Check if correct
                const cardYear = parseInt(draggedItem.dataset.year);
                if (cardYear === evt.year) {
                    zone.appendChild(draggedItem);
                    zone.classList.add('correct');
                    draggedItem.draggable = false;
                    checkTotalCompletion();
                } else {
                    showTotalFeedback('❌ 时间顺序错误，请重新思考历史进程。', 'error');
                }
            }
        });

        dropZones.appendChild(zone);
    });

    // Create Draggable Cards (Shuffled)
    const shuffled = [...totalEvents].sort(() => Math.random() - 0.5);
    shuffled.forEach(evt => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.draggable = true;
        card.dataset.year = evt.year;
        card.innerHTML = `<h4>${evt.name}</h4><p>${evt.desc}</p>`;

        card.addEventListener('dragstart', () => {
            draggedItem = card;
            card.style.opacity = '0.5';
        });

        card.addEventListener('dragend', () => {
            draggedItem = null;
            card.style.opacity = '1';
        });

        cardPool.appendChild(card);
    });
}

function checkTotalCompletion() {
    const correct = document.querySelectorAll('.drop-zone.correct').length;
    if (correct === totalEvents.length) {
        showTotalFeedback('✅ 历史的车轮滚滚向前，顺序井然！', 'success');
    } else {
        showTotalFeedback('请继续完善历史时间轴...', 'neutral');
    }
}

function showTotalFeedback(msg, type) {
    const el = document.getElementById('totalFeedback');
    el.textContent = msg;
    el.style.color = type === 'error' ? '#c0392b' : (type === 'success' ? '#27ae60' : '#2c3e50');
}

// --- Well Order Logic ---
const wellTasks = [
    { id: 'w1', name: '脱贫攻坚', priority: 1, desc: '全面小康底线任务' },
    { id: 'w2', name: '疫情防控', priority: 2, desc: '人民至上，生命至上' }, // Contextual priority
    { id: 'w3', name: '科技创新', priority: 3, desc: '第一动力' },
    { id: 'w4', name: '乡村振兴', priority: 4, desc: '农业农村现代化' },
    { id: 'w5', name: '绿色发展', priority: 5, desc: '绿水青山就是金山银山' },
    { id: 'w6', name: '共同富裕', priority: 6, desc: '本质要求' }
];

let selectedTasks = new Set();

function initWellOrder() {
    const grid = document.getElementById('taskGrid');
    grid.innerHTML = '';
    selectedTasks.clear();
    updateLeastElement();

    wellTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.dataset.id = task.id;
        card.innerHTML = `<h4>${task.name}</h4><p>${task.desc}</p>`;

        card.addEventListener('click', () => {
            if (selectedTasks.has(task.id)) {
                selectedTasks.delete(task.id);
                card.classList.remove('selected');
            } else {
                selectedTasks.add(task.id);
                card.classList.add('selected');
            }
            updateLeastElement();
        });

        grid.appendChild(card);
    });
}

function updateLeastElement() {
    const display = document.getElementById('leastElementBox');
    document.querySelectorAll('.task-card').forEach(c => c.classList.remove('least-element'));

    if (selectedTasks.size === 0) {
        display.textContent = '请选择任务子集...';
        return;
    }

    // Find min priority among selected
    let minTask = null;
    let minP = Infinity;

    selectedTasks.forEach(id => {
        const task = wellTasks.find(t => t.id === id);
        if (task.priority < minP) {
            minP = task.priority;
            minTask = task;
        }
    });

    if (minTask) {
        display.textContent = `⭐ ${minTask.name} (优先级最高)`;
        const card = document.querySelector(`.task-card[data-id="${minTask.id}"]`);
        if (card) card.classList.add('least-element');
    }
}

// --- Quasi Order Logic ---
let nodes = [];
let edges = [];
let nodeIdCounter = 1;

function initQuasiOrder() {
    nodes = [];
    edges = [];
    nodeIdCounter = 1;
    renderGraph();

    document.getElementById('btnAddNode').onclick = addNode;
    document.getElementById('btnClearGraph').onclick = () => {
        nodes = [];
        edges = [];
        nodeIdCounter = 1;
        renderGraph();
        validateQuasi();
    };
}

function addNode() {
    if (nodes.length >= 6) return; // Limit size
    const id = nodeIdCounter++;
    nodes.push({ id, x: 50 + Math.random() * 300, y: 50 + Math.random() * 200 });
    renderGraph();
}

function renderGraph() {
    const svg = document.getElementById('quasiSvg');
    svg.innerHTML = `
        <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="19" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#999" />
            </marker>
        </defs>
    `;

    // Edges
    edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', source.x);
        line.setAttribute('y1', source.y);
        line.setAttribute('x2', target.x);
        line.setAttribute('y2', target.y);
        line.setAttribute('class', 'edge-path');
        svg.appendChild(line);
    });

    // Nodes
    nodes.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', 15);
        circle.setAttribute('class', 'node-circle');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('dy', 5);
        text.setAttribute('class', 'node-text');
        text.textContent = String.fromCharCode(64 + node.id); // A, B, C...

        // Simple drag (not full implementation for brevity, just click to link)
        g.addEventListener('click', (e) => handleNodeClick(node.id));

        g.appendChild(circle);
        g.appendChild(text);
        svg.appendChild(g);
    });
}

let selectedNodeId = null;

function handleNodeClick(id) {
    if (selectedNodeId === null) {
        selectedNodeId = id;
        // Highlight selection
        document.querySelectorAll('.node-circle').forEach((c, i) => {
            if (nodes[i].id === id) c.style.fill = '#f39c12';
        });
    } else {
        if (selectedNodeId !== id) {
            // Add edge
            if (!edges.some(e => e.source === selectedNodeId && e.target === id)) {
                edges.push({ source: selectedNodeId, target: id });
                validateQuasi();
            }
        }
        selectedNodeId = null;
        renderGraph();
    }
}

function validateQuasi() {
    const box = document.getElementById('quasiValidation');

    // Check Irreflexive (No self loops - prevented by UI logic, but good to check)
    // Check Transitive? Quasi is strict partial order.
    // Key property: Irreflexive + Transitive => Asymmetric (No cycles)

    // Cycle detection
    if (hasCycle()) {
        box.textContent = '❌ 错误：检测到循环！拟序关系必须是反自反的（无环）。';
        box.className = 'validation-box error';
    } else {
        box.textContent = '✅ 状态：正常 (严格的先后依赖，无逻辑死循环)';
        box.className = 'validation-box';
    }
}

function hasCycle() {
    // DFS for cycle
    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => adj[e.source].push(e.target));

    const visited = new Set();
    const recStack = new Set();

    function dfs(u) {
        visited.add(u);
        recStack.add(u);

        for (const v of adj[u]) {
            if (!visited.has(v)) {
                if (dfs(v)) return true;
            } else if (recStack.has(v)) {
                return true;
            }
        }

        recStack.delete(u);
        return false;
    }

    for (const node of nodes) {
        if (!visited.has(node.id)) {
            if (dfs(node.id)) return true;
        }
    }
    return false;
}

// --- Navigation & Content Switching ---
function switchMode(mode) {
    // Update Nav
    navBtns.forEach(btn => {
        if (btn.dataset.mode === mode) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Update View
    modeViews.forEach(view => {
        if (view.id === `view${mode.charAt(0).toUpperCase() + mode.slice(1)}`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    // Update Insight
    updateInsight(mode);
}

function updateInsight(mode) {
    if (mode === 'total') {
        conceptTitle.textContent = '全序关系 (Total Order)';
        conceptIcon.textContent = '🏹';
        conceptDesc.textContent = '集合中任意两个元素都可以比较大小。在历史观中，这代表了时间的一维性和不可逆性。';
        conceptMath.textContent = '∀x,y∈S, x≤y ∨ y≤x';
        conceptCard.style.borderTopColor = '#2980b9';
        insightText.textContent = '历史的车轮滚滚向前。从站起来、富起来到强起来，中华民族的复兴之路是一条不可逆转的历史轨迹（全序）。我们要顺应历史大势，勇担时代使命。';
    } else if (mode === 'well') {
        conceptTitle.textContent = '良序关系 (Well Order)';
        conceptIcon.textContent = '⭐';
        conceptDesc.textContent = '集合的任意非空子集都有最小元。这意味着在任何复杂的任务集合中，总能找到一个"第一优先"的任务。';
        conceptMath.textContent = '∀A⊆S, A≠∅ ⇒ ∃m∈A, ∀x∈A, m≤x';
        conceptCard.style.borderTopColor = '#c0392b';
        insightText.textContent = '在复杂的国内外形势下，我们要善于抓主要矛盾（最小元）。无论是脱贫攻坚还是科技创新，在不同阶段都有其核心任务，纲举目张，执本末从。';
    } else if (mode === 'quasi') {
        conceptTitle.textContent = '拟序关系 (Quasi Order)';
        conceptIcon.textContent = '⛓️';
        conceptDesc.textContent = '反自反且传递的关系。通常用于描述严格的"先决条件"或"依赖关系"，不能有循环依赖。';
        conceptMath.textContent = 'Irreflexive: ¬(x<x); Transitive: x<y ∧ y<z ⇒ x<z';
        conceptCard.style.borderTopColor = '#f39c12';
        insightText.textContent = '政策制定和战略部署需要严谨的逻辑（拟序）。基础不牢，地动山摇。我们必须遵循客观规律，一步一个脚印，不能搞"大跃进"式的逻辑循环。';
    }
}

// Event Listeners
navBtns.forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

resetBtn.addEventListener('click', () => {
    initTotalOrder();
    initWellOrder();
    initQuasiOrder();
});

// Init
initTotalOrder();
initWellOrder();
initQuasiOrder();
