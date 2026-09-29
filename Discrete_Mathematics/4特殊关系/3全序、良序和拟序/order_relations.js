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
            placeCard(draggedItem, zone, evt);
        });
        // 触屏/键盘：先点卡片，再点时间节点
        zone.addEventListener('click', () => {
            const picked = document.querySelector('.event-card.picked');
            if (picked) placeCard(picked, zone, evt);
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

        card.addEventListener('click', () => {
            if (!card.draggable) return;
            document.querySelectorAll('.event-card.picked').forEach(c => { if (c !== card) c.classList.remove('picked'); });
            card.classList.toggle('picked');
            if (card.classList.contains('picked')) showTotalFeedback(`已选中「${card.querySelector('h4').textContent}」，再点它所在年份的时间节点。`, 'neutral');
        });

        cardPool.appendChild(card);
    });
}

function placeCard(card, zone, evt) {
    if (!card || zone.classList.contains('correct')) return;
    const cardYear = parseInt(card.dataset.year);
    if (cardYear === evt.year) {
        card.classList.remove('picked');
        zone.appendChild(card);
        zone.classList.add('correct');
        card.draggable = false;
        checkTotalCompletion();
    } else {
        showTotalFeedback(`❌ 「${card.querySelector('h4').textContent}」不在 ${evt.year} 年，按时间先后再想一想。`, 'error');
    }
}

// 演示：按年份（全序 ≤）依次把所有卡片放好
function autoSortTotal() {
    totalEvents.forEach((evt, i) => {
        const zone = document.querySelector(`.drop-zone[data-index="${i}"]`);
        const card = document.querySelector(`.event-card[data-year="${evt.year}"]`);
        if (zone && card && !zone.classList.contains('correct')) placeCard(card, zone, evt);
    });
}

function checkTotalCompletion() {
    const correct = document.querySelectorAll('.drop-zone.correct').length;
    if (correct === totalEvents.length) {
        showTotalFeedback('✅ 排序完成：年份的 ≤ 是全序，任意两件大事都能比较先后，所以只有唯一的排法。', 'success');
    } else {
        showTotalFeedback('请继续完善历史时间轴...', 'neutral');
    }
}

function showTotalFeedback(msg, type) {
    const el = document.getElementById('totalFeedback');
    el.textContent = msg;
    el.style.color = type === 'error' ? '#C0392B' : (type === 'success' ? '#1F9D55' : '#2C1810');
}

// --- Well Order Logic ---
const wellTasks = [
    { id: 'w1', name: '脱贫攻坚', priority: 1, desc: '全面小康底线任务' },
    { id: 'w2', name: '防范化解重大风险', priority: 2, desc: '守住不发生系统性风险底线' },
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

    // 预选一个子集，加载即可看到「最小元」
    ['w3', 'w5', 'w6'].forEach(id => {
        selectedTasks.add(id);
        const c = grid.querySelector(`.task-card[data-id="${id}"]`);
        if (c) c.classList.add('selected');
    });
    updateLeastElement();
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
        display.textContent = `⭐ ${minTask.name}（子集 {${[...selectedTasks].map(id => wellTasks.find(t => t.id === id).name).join('，')}} 的最小元）`;
        const card = document.querySelector(`.task-card[data-id="${minTask.id}"]`);
        if (card) card.classList.add('least-element');
    }
}

// --- Quasi Order Logic ---
let nodes = [];
let edges = [];
let nodeIdCounter = 1;

const QUASI_POS = [[80, 70], [230, 50], [360, 110], [340, 240], [180, 260], [60, 190]];

function initQuasiOrder() {
    // 预置示例：A≺B≺C 且 A≺C（传递）、A≺D —— 一个合法的拟序
    nodes = [1, 2, 3, 4].map(id => ({ id, x: QUASI_POS[id - 1][0], y: QUASI_POS[id - 1][1] }));
    edges = [{ source: 1, target: 2 }, { source: 2, target: 3 }, { source: 1, target: 3 }, { source: 1, target: 4 }];
    nodeIdCounter = 5;
    selectedNodeId = null;
    renderGraph();
    validateQuasi();

    document.getElementById('btnAddNode').onclick = addNode;
    document.getElementById('btnClearGraph').onclick = () => {
        nodes = [];
        edges = [];
        nodeIdCounter = 1;
        selectedNodeId = null;
        renderGraph();
        validateQuasi();
    };
}

function addNode() {
    if (nodes.length >= 6) {
        ch4Toast('最多 6 个节点，足够观察拟序的性质。');
        return;
    }
    const id = nodeIdCounter++;
    const p = QUASI_POS[(id - 1) % QUASI_POS.length];
    nodes.push({ id, x: p[0], y: p[1] });
    renderGraph();
    validateQuasi();
}

const nodeName = id => String.fromCharCode(64 + id);

function renderGraph() {
    const svg = document.getElementById('quasiSvg');
    svg.setAttribute('viewBox', '0 0 420 300');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = `
        <defs>
            <marker id="arrow" viewBox="0 0 10 10" markerWidth="8" markerHeight="8" refX="10" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="#B8321A" />
            </marker>
        </defs>
    `;

    edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) return;
        const dx = target.x - source.x, dy = target.y - source.y, L = Math.hypot(dx, dy) || 1;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', source.x + dx / L * 17);
        line.setAttribute('y1', source.y + dy / L * 17);
        line.setAttribute('x2', target.x - dx / L * 19);
        line.setAttribute('y2', target.y - dy / L * 19);
        line.setAttribute('class', 'edge-path' + (edge.bad ? ' bad' : ''));
        svg.appendChild(line);
    });

    nodes.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        g.setAttribute('class', 'quasi-node' + (node.id === selectedNodeId ? ' picked' : ''));
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', '节点 ' + nodeName(node.id));

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', 16);
        circle.setAttribute('class', 'node-circle');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('dy', 5);
        text.setAttribute('class', 'node-text');
        text.textContent = nodeName(node.id);

        g.addEventListener('click', () => handleNodeClick(node.id));
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNodeClick(node.id); } });

        g.appendChild(circle);
        g.appendChild(text);
        svg.appendChild(g);
    });
}

let selectedNodeId = null;

// 先点起点、再点终点：添加 x≺y；若该边已存在则删除；点同一节点取消选择（拟序不允许自环）
function handleNodeClick(id) {
    if (selectedNodeId === null) {
        selectedNodeId = id;
    } else {
        if (selectedNodeId === id) {
            ch4Toast('拟序是反自反的：不能有 x≺x 的自环。');
        } else {
            const k = edges.findIndex(e => e.source === selectedNodeId && e.target === id);
            if (k >= 0) edges.splice(k, 1);
            else edges.push({ source: selectedNodeId, target: id });
            validateQuasi();
        }
        selectedNodeId = null;
    }
    renderGraph();
}

function validateQuasi() {
    const box = document.getElementById('quasiValidation');
    const has = (a, b) => edges.some(e => e.source === a && e.target === b);
    edges.forEach(e => { e.bad = false; });

    if (hasCycle()) {
        box.innerHTML = '❌ 出现有向环：由传递性会推出 x≺x，违反反自反性——这不是拟序。';
        box.className = 'validation-box error';
        return;
    }
    const missing = [];
    edges.forEach(e1 => edges.forEach(e2 => {
        if (e1.target === e2.source && e1.source !== e2.target && !has(e1.source, e2.target)) {
            const k = nodeName(e1.source) + '≺' + nodeName(e2.target);
            if (!missing.includes(k)) missing.push(k);
        }
    }));
    if (missing.length) {
        box.innerHTML = `⚠️ 无环但<b>不传递</b>：还缺 ${missing.join('、')}。补上这些边（即取传递闭包）才是拟序。`;
        box.className = 'validation-box warn';
    } else {
        box.innerHTML = `✅ 反自反 ✓ 传递 ✓：这是一个拟序（共 ${edges.length} 对 x≺y）。加上自环 I<sub>A</sub> 就得到对应的偏序 ≼。`;
        box.className = 'validation-box';
    }
}

function hasCycle() {
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
        if (!visited.has(node.id) && dfs(node.id)) return true;
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
        conceptDesc.textContent = '偏序 + 任意两元素可比 = 全序（线序），其哈斯图是一条链。年份的 ≤ 就是全序：任意两件大事都能分出先后。';
        conceptMath.textContent = '∀x,y∈S, x≤y ∨ y≤x';
        conceptCard.style.borderTopColor = '#B8321A';
        insightText.textContent = '历史的车轮滚滚向前。从站起来、富起来到强起来，中华民族的复兴之路是一条不可逆转的历史轨迹（全序）。我们要顺应历史大势，勇担时代使命。';
    } else if (mode === 'well') {
        conceptTitle.textContent = '良序关系 (Well Order)';
        conceptIcon.textContent = '⭐';
        conceptDesc.textContent = '全序且任意非空子集都有最小元，称为良序。有限全序集一定是良序；⟨ℕ, ≤⟩ 是良序；⟨ℤ, ≤⟩、⟨ℚ⁺, ≤⟩ 是全序但不是良序（如 {…, −2, −1} 或 {1/n} 无最小元）。点选任务子集，看它的最小元。';
        conceptMath.textContent = '∀A⊆S, A≠∅ ⇒ ∃m∈A ∀x∈A (m≤x)';
        conceptCard.style.borderTopColor = '#D63B1D';
        insightText.textContent = '在复杂的国内外形势下，我们要善于抓主要矛盾（最小元）。无论是脱贫攻坚还是科技创新，在不同阶段都有其核心任务，纲举目张，执本末从。';
    } else if (mode === 'quasi') {
        conceptTitle.textContent = '拟序关系 (Quasi Order)';
        conceptIcon.textContent = '⛓️';
        conceptDesc.textContent = '反自反且传递的关系称为拟序（严格偏序），记作 ≺；它必然反对称，因此关系图中不会出现环。拟序 ≺ 与偏序 ≼ 一一对应：≼ = ≺ ∪ I_A。点两个节点可添加/删除一条有向边。';
        conceptMath.textContent = '反自反：¬(x≺x)；传递：x≺y ∧ y≺z ⇒ x≺z';
        conceptCard.style.borderTopColor = '#E39B0B';
        insightText.textContent = '工作部署要讲先后依赖（拟序）：基础不牢，地动山摇。依赖关系一旦出现循环，就谁也无法先开始——遵循客观规律，一步一个脚印。';
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

document.getElementById('btnAutoSort')?.addEventListener('click', autoSortTotal);

// Init：本页为「良序与拟序」层，默认打开良序
initTotalOrder();
initWellOrder();
initQuasiOrder();
switchMode('well');
