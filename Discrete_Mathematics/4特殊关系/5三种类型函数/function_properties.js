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
let conceptName = document.getElementById('conceptName');
let conceptMath = document.getElementById('conceptMath');
let conceptDesc = document.getElementById('conceptDesc');
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
    mountConceptCard();
    setupNav();
    renderNodes();
    loadExample();
    updateMode('bijective');

    // Add resize listener to redraw lines
    window.addEventListener('resize', renderConnections);
}

function mountConceptCard() {
    const bottomPanel = document.querySelector('.bottom-panel');
    const oldOverlay = document.querySelector('.app-container > .concept-overlay');
    const card = document.createElement('div');

    card.className = 'concept-overlay';
    card.innerHTML = `
        <h4 id="conceptNameLive"></h4>
        <div class="math-def" id="conceptMathLive"></div>
        <p class="concept-desc" id="conceptDescLive"></p>
    `;

    bottomPanel.appendChild(card);
    if (oldOverlay) oldOverlay.setAttribute('aria-hidden', 'true');

    conceptName = document.getElementById('conceptNameLive');
    conceptMath = document.getElementById('conceptMathLive');
    conceptDesc = document.getElementById('conceptDescLive');
}

function setupNav() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            updateMode(btn.dataset.mode);
        });
    });

    resetBtn.addEventListener('click', () => {
        loadExample();
        selectedSource = null;
        document.querySelectorAll('.node-item').forEach(el => el.classList.remove('selected'));
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
        overlay.style.borderLeftColor = '#D63B1D';
    } else if (mode === 'surjective') {
        conceptName.textContent = '满射 (Surjective)';
        conceptName.style.textAlign = 'center';
        conceptMath.textContent = 'ran f = Y，即 ∀y∈Y ∃x∈X, f(x)=y';
        conceptDesc.textContent = '陪域中的每个元素都至少有一个原像。这意味着"全覆盖"，没有遗漏的需求。';
        insightText.textContent = '满射强调"一个都不能少"。无论是健康、教育还是养老，每一项社区需求都有对应的团队负责，实现公共服务的全面覆盖。';
        overlay.style.borderLeftColor = '#FFB400';
    } else {
        conceptName.textContent = '双射 (Bijective)';
        conceptName.style.textAlign = 'center';
        conceptMath.textContent = '双射 = 单射 + 满射 ⇔ f⁻¹ 存在';
        conceptDesc.textContent = '既单又满，一一对应。只有双射才有逆函数 f⁻¹：把每支箭头反向，得到的仍是函数。有限集 |X| = |Y| 时，单射 ⇔ 满射 ⇔ 双射。';
        insightText.textContent = '双射代表「精准匹配」：既没有职能重叠（单射），也没有需求落空（满射），而且可以反向追溯——每项需求都能找到唯一的负责团队（逆函数）。';
        overlay.style.borderLeftColor = '#1F9D55';
    }

    checkStatus();
}

// 初始示例：科技组、社工站都连到「数字农业」——不是单射，「养老服务」无人负责——不是满射
function loadExample() {
    mappings = new Map([['x1', 'y1'], ['x2', 'y2'], ['x3', 'y3'], ['x4', 'y3']]);
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
    const width = Math.max(360, Math.round(svgRect.width || connectionsSvg.clientWidth || 720));
    const height = Math.max(280, Math.round(svgRect.height || connectionsSvg.clientHeight || 420));

    connectionsSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    connectionsSvg.setAttribute('preserveAspectRatio', 'none');

    mappings.forEach((targetId, sourceId) => {
        const sourceEl = domainNodes.querySelector(`[data-id="${sourceId}"]`);
        const targetEl = codomainNodes.querySelector(`[data-id="${targetId}"]`);

        if (sourceEl && targetEl) {
            const sRect = sourceEl.getBoundingClientRect();
            const tRect = targetEl.getBoundingClientRect();

            const x1 = clamp(sRect.right - svgRect.left + 8, 12, width - 12);
            const y1 = clamp(sRect.top - svgRect.top + sRect.height / 2, 12, height - 12);
            const x2 = clamp(tRect.left - svgRect.left - 12, 12, width - 12);
            const y2 = clamp(tRect.top - svgRect.top + tRect.height / 2, 12, height - 12);
            const dx = Math.max(24, Math.abs(x2 - x1) * 0.45);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            line.setAttribute('d', `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`);
            const clash = [...mappings.values()].filter(v => v === targetId).length > 1;
            line.setAttribute('class', 'connection-line' + (clash ? ' clash' : ''));

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

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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

    // 陪域节点状态：多个原像（冲突）/ 无原像（遗漏）
    NEEDS.forEach(n => {
        const el = codomainNodes.querySelector(`[data-id="${n.id}"]`);
        const k = values.filter(v => v === n.id).length;
        el.classList.toggle('clash', k > 1);
        el.classList.toggle('uncovered', isTotal && k === 0);
    });
    renderInverse(isTotal, isInjective, isSurjective);

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

// 逆函数面板：双射时列出 f⁻¹；否则说明为何不可逆
function renderInverse(isTotal, isInjective, isSurjective) {
    const box = document.getElementById('inverseBox');
    if (!box) return;
    const nameX = id => TEAMS.find(t => t.id === id).name;
    const nameY = id => NEEDS.find(n => n.id === id).name;
    if (!isTotal) {
        box.innerHTML = '<b>逆函数 f⁻¹</b>：先让每个团队都有且只有一项任务（f 必须是函数）。';
        box.className = 'inverse-box';
        return;
    }
    if (isInjective && isSurjective) {
        const rows = [...mappings.entries()].sort((a, b) => a[1].localeCompare(b[1]))
            .map(([x, y]) => `<span>f⁻¹(${nameY(y)}) = ${nameX(x)}</span>`).join('');
        box.innerHTML = `<b>f 是双射，f⁻¹ 存在</b>：把箭头全部反向，仍是函数。<div class="inv-list">${rows}</div>`;
        box.className = 'inverse-box ok';
    } else {
        const why = [];
        if (!isInjective) {
            const y = [...mappings.values()].find((v, i, a) => a.indexOf(v) !== i);
            const xs = [...mappings.entries()].filter(([, v]) => v === y).map(([x]) => nameX(x));
            why.push(`反向后「${nameY(y)}」会对应 ${xs.join('、')} 两个值（违反单值）`);
        }
        if (!isSurjective) {
            const miss = NEEDS.filter(n => ![...mappings.values()].includes(n.id)).map(n => n.name);
            why.push(`「${miss.join('、')}」没有原像，反向后无定义（违反全定义）`);
        }
        box.innerHTML = `<b>f 不可逆</b>：${why.join('；')}。`;
        box.className = 'inverse-box bad';
    }
}

// Start
init();
