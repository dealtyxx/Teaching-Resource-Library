/**
 * Red Mathematics - Function Properties Visualization
 */

// DOM Elements
const domainNodes = document.getElementById('domainNodes');
const codomainNodes = document.getElementById('codomainNodes');
const connectionsSvg = document.getElementById('connectionsSvg');
const statusBar = document.getElementById('statusBar');
const statusMessage = document.getElementById('statusMessage');
const statusIcon = document.querySelector('.status-icon');
const insightText = document.getElementById('insightText');
const conceptName = document.getElementById('conceptName');
const conceptMath = document.getElementById('conceptMath');
const conceptDesc = document.getElementById('conceptDesc');
const navBtns = document.querySelectorAll('.nav-btn');
const resetBtn = document.getElementById('resetBtn');

// Data
const TEAMS = [
    { id: 'x1', name: '医疗队', icon: '👨‍⚕️' },
    { id: 'x2', name: '支教团', icon: '👩‍🏫' },
    { id: 'x3', name: '科技组', icon: '👨‍💻' },
    { id: 'x4', name: '社工站', icon: '🧡' }
];

const NEEDS = [
    { id: 'y1', name: '健康医疗', icon: '🏥' },
    { id: 'y2', name: '基础教育', icon: '📚' },
    { id: 'y3', name: '数字农业', icon: '🌾' },
    { id: 'y4', name: '养老服务', icon: '👵' }
];

// State
let currentMode = 'injective'; // injective, surjective, bijective
let mappings = new Map(); // x_id -> y_id
let selectedSource = null;

// Initialization
function init() {
    setupNav();
    renderNodes();
    updateMode('injective');

    // Add resize listener to redraw lines
    window.addEventListener('resize', renderConnections);
}

function setupNav() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            updateMode(btn.dataset.mode);
        });
    });

    resetBtn.addEventListener('click', () => {
        mappings.clear();
        selectedSource = null;
        renderConnections();
        checkStatus();
    });
}

function updateMode(mode) {
    currentMode = mode;

    // Update Nav UI
    navBtns.forEach(btn => {
        if (btn.dataset.mode === mode) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Update Concept Overlay
    const overlay = document.querySelector('.concept-overlay');
    if (mode === 'injective') {
        conceptName.textContent = '单射 (Injective)';
        conceptName.style.textAlign = 'center';
        conceptMath.textContent = 'f(x₁) = f(x₂) ⇒ x₁ = x₂';
        conceptDesc.textContent = '不同的输入必须对应不同的输出。在服务中，这意味着"专人专责"，避免职能交叉冲突。';
        insightText.textContent = '单射强调"各司其职"。医疗队专注健康，支教团专注教育，分工明确，责任到人，避免资源浪费和推诿扯皮。';
        overlay.style.borderLeftColor = '#e17055';
    } else if (mode === 'surjective') {
        conceptName.textContent = '满射 (Surjective)';
        conceptName.style.textAlign = 'center';
        conceptMath.textContent = 'Range(f) = Y';
        conceptDesc.textContent = '陪域中的每个元素都至少有一个原像。这意味着"全覆盖"，没有遗漏的需求。';
        insightText.textContent = '满射强调"一个都不能少"。无论是健康、教育还是养老，每一项社区需求都有对应的团队负责，实现公共服务的全面覆盖。';
        overlay.style.borderLeftColor = '#74b9ff';
    } else {
        conceptName.textContent = '双射 (Bijective)';
        conceptName.style.textAlign = 'center';
        conceptMath.textContent = 'Injective + Surjective';
        conceptDesc.textContent = '既是单射又是满射。一一对应，完美匹配。';
        insightText.textContent = '双射代表"精准匹配"。资源配置达到最优状态，既没有职能重叠（单射），也没有需求落空（满射），是供给侧改革的理想目标。';
        overlay.style.borderLeftColor = '#6c5ce7';
    }

    checkStatus();
}

function renderNodes() {
    // Domain
    domainNodes.innerHTML = '';
    TEAMS.forEach(t => {
        const el = document.createElement('div');
        el.className = 'node-item';
        el.dataset.id = t.id;
        el.innerHTML = `<span class="node-icon">${t.icon}</span><span class="node-label">${t.name}</span>`;

        el.addEventListener('click', () => handleSourceClick(t.id));
        domainNodes.appendChild(el);
    });

    // Codomain
    codomainNodes.innerHTML = '';
    NEEDS.forEach(n => {
        const el = document.createElement('div');
        el.className = 'node-item';
        el.dataset.id = n.id;
        el.innerHTML = `<span class="node-icon">${n.icon}</span><span class="node-label">${n.name}</span>`;

        el.addEventListener('click', () => handleTargetClick(n.id));
        codomainNodes.appendChild(el);
    });
}

function handleSourceClick(id) {
    if (selectedSource === id) {
        selectedSource = null;
        document.querySelectorAll('.node-item').forEach(el => el.classList.remove('selected'));
    } else {
        selectedSource = id;
        document.querySelectorAll('.node-item').forEach(el => el.classList.remove('selected'));
        domainNodes.querySelector(`[data-id="${id}"]`).classList.add('selected');
    }
}

function handleTargetClick(id) {
    if (selectedSource) {
        // Create/Update Mapping
        mappings.set(selectedSource, id);
        selectedSource = null;
        document.querySelectorAll('.node-item').forEach(el => el.classList.remove('selected'));
        renderConnections();
        checkStatus();
    }
}

function renderConnections() {
    // Clear lines (keep defs)
    while (connectionsSvg.children.length > 1) {
        connectionsSvg.lastChild.remove();
    }

    const svgRect = connectionsSvg.getBoundingClientRect();

    mappings.forEach((targetId, sourceId) => {
        const sourceEl = domainNodes.querySelector(`[data-id="${sourceId}"]`);
        const targetEl = codomainNodes.querySelector(`[data-id="${targetId}"]`);

        if (sourceEl && targetEl) {
            const sRect = sourceEl.getBoundingClientRect();
            const tRect = targetEl.getBoundingClientRect();

            const x1 = sRect.right - svgRect.left;
            const y1 = sRect.top - svgRect.top + sRect.height / 2;
            const x2 = tRect.left - svgRect.left;
            const y2 = tRect.top - svgRect.top + tRect.height / 2;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('class', 'connection-line');

            // Allow removing connection by clicking line
            line.addEventListener('click', (e) => {
                e.stopPropagation();
                mappings.delete(sourceId);
                renderConnections();
                checkStatus();
            });

            connectionsSvg.appendChild(line);
        }
    });
}

function checkStatus() {
    // 1. Check Function Validity (Each input maps to at most one output - enforced by Map structure)
    const isTotal = mappings.size === TEAMS.length;

    // 2. Check Injective (One-to-One)
    // No two inputs map to same output
    const values = Array.from(mappings.values());
    const uniqueValues = new Set(values);
    const isInjective = values.length === uniqueValues.size;

    // 3. Check Surjective (Onto)
    // Every element in codomain is mapped to
    const isSurjective = uniqueValues.size === NEEDS.length;

    // Update UI based on mode
    statusBar.className = 'status-bar';
    statusIcon.textContent = '❓';

    if (!isTotal) {
        statusMessage.textContent = '请先为所有服务团队分配任务...';
        return;
    }

    if (currentMode === 'injective') {
        if (isInjective) {
            statusMessage.textContent = '✅ 判定成功：单射！每个团队都有独特的职责，无冲突。';
            statusBar.classList.add('success');
            statusIcon.textContent = '✓';
        } else {
            statusMessage.textContent = '❌ 判定失败：非单射。存在多个团队负责同一个需求，职能重叠。';
            statusBar.classList.add('error');
            statusIcon.textContent = '✗';
        }
    } else if (currentMode === 'surjective') {
        if (isSurjective) {
            statusMessage.textContent = '✅ 判定成功：满射！所有需求都得到了响应，全覆盖。';
            statusBar.classList.add('success');
            statusIcon.textContent = '✓';
        } else {
            statusMessage.textContent = '❌ 判定失败：非满射。仍有需求未被覆盖（遗漏）。';
            statusBar.classList.add('error');
            statusIcon.textContent = '✗';
        }
    } else if (currentMode === 'bijective') {
        if (isInjective && isSurjective) {
            statusMessage.textContent = '✅ 判定成功：双射！精准匹配，资源配置最优。';
            statusBar.classList.add('success');
            statusIcon.textContent = '✓';
        } else {
            let msg = '❌ 判定失败：';
            if (!isInjective) msg += '存在职能重叠。';
            if (!isSurjective) msg += '存在需求遗漏。';
            statusMessage.textContent = msg;
            statusBar.classList.add('error');
            statusIcon.textContent = '✗';
        }
    }
}

// Start
init();
