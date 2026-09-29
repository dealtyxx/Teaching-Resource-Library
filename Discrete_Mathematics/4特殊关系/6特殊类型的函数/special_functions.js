/**
 * Red Mathematics - Special Functions Visualization
 */

// DOM Elements
const canvas = document.getElementById('functionCanvas');
const ctx = canvas.getContext('2d');
const controlsBar = document.getElementById('controlsBar');
const overlayText = document.getElementById('overlayText');
const conceptTitle = document.getElementById('conceptTitle');
const conceptDesc = document.getElementById('conceptDesc');
const conceptMath = document.getElementById('conceptMath');
const conceptIcon = document.getElementById('conceptIcon');
const insightText = document.getElementById('insightText');
const conceptCard = document.getElementById('conceptCard');
const valInput = document.getElementById('valInput');
const valOutput = document.getElementById('valOutput');
const navBtns = document.querySelectorAll('.nav-btn');
const resetBtn = document.getElementById('resetBtn');

// State
let currentMode = 'identity';
let width, height;
let originX, originY;
let scale = 40; // pixels per unit
let probeX = 2.3;           // 探针位置（坐标单位，与画布尺寸无关）
let animationId = null;

// Parameters
const DEFAULT_PARAMS = { growth: 0.5, monoKind: 'floor', constant: 2, setKind: 'even', lo: -2, hi: 3 };
let params = { ...DEFAULT_PARAMS };

// Initialization
function init() {
    setupResize();
    setupNav();
    updateMode('monotonic');

    // 鼠标、触屏、笔统一用 pointer 事件移动探针
    canvas.addEventListener('pointermove', handleMouseMove);
    canvas.addEventListener('pointerdown', handleMouseMove);
}

function setupResize() {
    const resize = () => {
        const container = canvas.parentElement;
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
        originX = width / 2;
        originY = height / 2;
        draw();
    };
    window.addEventListener('resize', resize);
    resize();
}

function setupNav() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            updateMode(btn.dataset.mode);
        });
    });

    resetBtn.addEventListener('click', () => {
        params = { ...DEFAULT_PARAMS };
        probeX = 2.3;
        updateControls();
        draw();
    });
}

function updateMode(mode) {
    currentMode = mode;

    // Update UI
    navBtns.forEach(btn => {
        if (btn.dataset.mode === mode) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    updateControls();
    updateInsight();
    draw();
}

function updateControls() {
    controlsBar.innerHTML = '';

    if (currentMode === 'identity') {
        controlsBar.innerHTML = '<div class="controls-note">恒等函数 I<sub>A</sub>(x) = x 没有参数：移动探针，输出总等于输入。</div>';
    } else if (currentMode === 'monotonic') {
        createSelect('函数', [['floor', '下取整 ⌊x⌋（单调不减）'], ['strict', '增长曲线（严格单调递增）']], params.monoKind, v => { params.monoKind = v; updateControls(); updateInsight(); });
        if (params.monoKind === 'strict') createSlider('增长速率', 0.1, 2, params.growth, 0.1, val => params.growth = parseFloat(val));
    } else if (currentMode === 'constant') {
        createSlider('常数值 c', -4, 4, params.constant, 0.5, val => params.constant = parseFloat(val));
    } else if (currentMode === 'characteristic') {
        createSelect('子集 S ⊆ ℤ', [['even', '偶数集'], ['interval', '区间内的整数 [a, b]'], ['prime', '素数集']], params.setKind, v => { params.setKind = v; updateControls(); updateInsight(); });
        if (params.setKind === 'interval') {
            createSlider('a', -8, 8, params.lo, 1, val => { params.lo = Math.min(parseInt(val, 10), params.hi); });
            createSlider('b', -8, 8, params.hi, 1, val => { params.hi = Math.max(parseInt(val, 10), params.lo); });
        }
    }
}

function createSelect(label, options, value, callback) {
    const group = document.createElement('div');
    group.className = 'control-group';
    const labelEl = document.createElement('div');
    labelEl.className = 'control-label';
    labelEl.innerHTML = `<span>${label}</span>`;
    const sel = document.createElement('select');
    sel.className = 'control-select';
    sel.setAttribute('aria-label', label);
    sel.innerHTML = options.map(([v, t]) => `<option value="${v}"${v === value ? ' selected' : ''}>${t}</option>`).join('');
    sel.addEventListener('change', e => { callback(e.target.value); draw(); });
    group.appendChild(labelEl);
    group.appendChild(sel);
    controlsBar.appendChild(group);
}

function createSlider(label, min, max, val, step, callback) {
    const group = document.createElement('div');
    group.className = 'control-group';

    const labelEl = document.createElement('div');
    labelEl.className = 'control-label';
    labelEl.innerHTML = `<span>${label}</span><span>${val}</span>`;

    const input = document.createElement('input');
    input.type = 'range';
    input.min = min;
    input.max = max;
    input.value = val;
    input.step = step;

    input.setAttribute('aria-label', label);
    input.addEventListener('input', (e) => {
        callback(e.target.value);
        labelEl.querySelector('span:last-child').textContent = e.target.value;
        draw();
    });

    group.appendChild(labelEl);
    group.appendChild(input);
    controlsBar.appendChild(group);
}

function updateInsight() {
    if (currentMode === 'identity') {
        conceptTitle.textContent = '恒等函数 (Identity)';
        conceptIcon.textContent = '⚓';
        conceptMath.textContent = 'I_A(x) = x；f∘I_A = f，I_B∘f = f';
        conceptDesc.textContent = '每个元素都映射到自身。恒等函数是双射，也是函数复合的「单位元」，与逆函数的关系：f⁻¹∘f = I_A。';
        conceptCard.style.borderTopColor = '#D63B1D';
        insightText.textContent = '「不忘初心，方得始终」：恒等函数让输出始终等于输入，像一面镜子照见本来的样子；它在复合运算中地位特殊——任何函数与它复合都保持不变。';
    } else if (currentMode === 'monotonic') {
        conceptTitle.textContent = '单调函数 (Monotonic)';
        conceptIcon.textContent = '📈';
        conceptMath.textContent = params.monoKind === 'floor' ? 'x₁ ≤ x₂ ⇒ ⌊x₁⌋ ≤ ⌊x₂⌋' : 'x₁ < x₂ ⇒ f(x₁) < f(x₂)';
        conceptDesc.textContent = params.monoKind === 'floor'
            ? '下取整 ⌊x⌋ 是不大于 x 的最大整数。它单调不减但不严格（同一段内输出相同），因此不是单射；它是从 ℝ 到 ℤ 的满射。单调函数又称「保序」函数：x ≤ y ⇒ f(x) ≤ f(y)。'
            : '严格单调递增：输入变大，输出一定变大。严格单调函数一定是单射。';
        conceptCard.style.borderTopColor = '#1F9D55';
        insightText.textContent = '「稳中求进」：单调不减意味着总体趋势不倒退；而取整告诉我们，积累在一段区间内看似不变，跨过门槛才会跃升——量变到质变。';
    } else if (currentMode === 'constant') {
        conceptTitle.textContent = '常函数 (Constant)';
        conceptIcon.textContent = '🏔️';
        conceptMath.textContent = 'f(x) = c，∀x∈A';
        conceptDesc.textContent = '所有输入都映射到同一个值 c。|A| ≥ 2 时常函数不是单射；值域只有一个元素 {c}，|B| ≥ 2 时不是满射。';
        conceptCard.style.borderTopColor = '#FFB400';
        insightText.textContent = '「战略定力」：外界输入如何波动，输出始终保持在 c——常函数是「以不变应万变」的数学形象。';
    } else if (currentMode === 'characteristic') {
        conceptTitle.textContent = '特征函数 (Characteristic)';
        conceptIcon.textContent = '🎯';
        conceptMath.textContent = 'χ_S(x) = 1（x∈S），0（x∉S）';
        conceptDesc.textContent = '集合 E 的子集 S 与特征函数 χ_S : E → {0, 1} 一一对应；集合运算变成函数运算：χ_{A∩B} = χ_A·χ_B，χ_{A∪B} = χ_A + χ_B − χ_A·χ_B，χ_{~A} = 1 − χ_A。';
        conceptCard.style.borderTopColor = '#B8321A';
        insightText.textContent = '「是否归属」用 0/1 表达得清清楚楚：特征函数把定性的判断变成可计算的数值，是数据库查询、位图索引与机器学习特征编码的基础。';
    }
}

// Drawing
const isPrime = n => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
function inS(n) {
    if (params.setKind === 'even') return n % 2 === 0;
    if (params.setKind === 'prime') return isPrime(n);
    return n >= params.lo && n <= params.hi;
}
function valueAt(x) {
    if (currentMode === 'identity') return x;
    if (currentMode === 'constant') return params.constant;
    if (currentMode === 'monotonic') {
        if (params.monoKind === 'floor') return Math.floor(x);
        return x * params.growth + (x > 0 ? Math.pow(x, 1.5) * 0.1 : -Math.pow(Math.abs(x), 1.5) * 0.1);
    }
    return inS(Math.round(x)) ? 1 : 0; // 特征函数：定义域为整数，探针取最近的整数
}

function draw() {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    drawGrid();

    const colors = { identity: '#D63B1D', monotonic: '#1F9D55', constant: '#E39B0B', characteristic: '#B8321A' };
    ctx.strokeStyle = colors[currentMode];
    ctx.fillStyle = colors[currentMode];
    ctx.lineWidth = 3;

    const xmin = -originX / scale, xmax = (width - originX) / scale;
    if (currentMode === 'characteristic') {
        // 离散：每个整数画一根「火柴杆」，高度 0 或 1
        for (let n = Math.ceil(xmin); n <= Math.floor(xmax); n++) {
            const px = originX + n * scale, v = inS(n) ? 1 : 0, py = originY - v * scale;
            ctx.globalAlpha = v ? 1 : 0.45;
            ctx.beginPath(); ctx.moveTo(px, originY); ctx.lineTo(px, py); ctx.stroke();
            ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
        }
    } else if (currentMode === 'monotonic' && params.monoKind === 'floor') {
        // 阶梯：每段 [n, n+1) 左端实心、右端空心
        for (let n = Math.floor(xmin); n <= Math.ceil(xmax); n++) {
            const x1 = originX + n * scale, x2 = originX + (n + 1) * scale, py = originY - n * scale;
            ctx.beginPath(); ctx.moveTo(x1, py); ctx.lineTo(x2, py); ctx.stroke();
            ctx.beginPath(); ctx.arc(x1, py, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.save(); ctx.fillStyle = '#fff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x2, py, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
        }
    } else {
        ctx.beginPath();
        for (let px = 0; px <= width; px += 2) {
            const py = originY - valueAt((px - originX) / scale) * scale;
            if (px === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    drawMousePoint();
}

function drawGrid() {
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;

    // Vertical
    for (let x = originX % scale; x < width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Horizontal
    for (let y = originY % scale; y < height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();
}

function drawMousePoint() {
    let x = probeX;
    if (currentMode === 'characteristic') x = Math.round(x);
    const y = valueAt(x);
    const px = originX + x * scale;
    const py = originY - y * scale;

    ctx.fillStyle = '#2C1810';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#9B7A68';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, originY);
    ctx.lineTo(px, py);
    ctx.lineTo(originX, py);
    ctx.stroke();
    ctx.setLineDash([]);

    valInput.textContent = currentMode === 'characteristic' ? String(x) : x.toFixed(2);
    valOutput.textContent = currentMode === 'characteristic' || (currentMode === 'monotonic' && params.monoKind === 'floor') ? String(y) : y.toFixed(2);

    updateOverlay(x, y, px, py);
}

function updateOverlay(x, y, px, py) {
    let text = '';
    if (currentMode === 'identity') text = `I(${x.toFixed(1)}) = ${x.toFixed(1)}`;
    else if (currentMode === 'monotonic') text = params.monoKind === 'floor' ? `⌊${x.toFixed(2)}⌋ = ${y}` : '输入越大，输出越大';
    else if (currentMode === 'constant') text = `f(${x.toFixed(1)}) = ${params.constant}`;
    else if (currentMode === 'characteristic') text = `χ_S(${x}) = ${y}：${y ? x + ' ∈ S' : x + ' ∉ S'}`;

    overlayText.textContent = text;
    overlayText.style.opacity = text ? 1 : 0;
    overlayText.style.left = `${Math.min(px + 15, width - 190)}px`;
    overlayText.style.top = `${Math.max(8, py - 40)}px`;
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    probeX = (e.clientX - rect.left - originX) / scale;
    draw();
}

// Start
init();
