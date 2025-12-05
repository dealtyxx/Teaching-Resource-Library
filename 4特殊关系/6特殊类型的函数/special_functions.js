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
let mouseX = 0;
let animationId = null;
let time = 0;

// Parameters
let params = {
    slope: 1,
    growth: 0.5,
    constant: 2,
    period: 2,
    amplitude: 2
};

// Initialization
function init() {
    setupResize();
    setupNav();
    updateMode('identity');
    startAnimation();

    canvas.addEventListener('mousemove', handleMouseMove);
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
        params = { slope: 1, growth: 0.5, constant: 2, period: 2, amplitude: 2 };
        updateControls();
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
}

function updateControls() {
    controlsBar.innerHTML = '';

    if (currentMode === 'identity') {
        // No params for pure identity, maybe just visual scale?
        // Or "Deviation" to show what happens if not identity?
        // Let's keep it simple: No controls, just pure truth.
        controlsBar.innerHTML = '<div style="color:#666;font-style:italic">恒等函数无需参数调节，它代表绝对的真理与初心。</div>';
    } else if (currentMode === 'monotonic') {
        createSlider('增长速率 (Growth Rate)', 0.1, 2, params.growth, 0.1, val => params.growth = parseFloat(val));
    } else if (currentMode === 'constant') {
        createSlider('定力值 (Constant Value)', -4, 4, params.constant, 0.5, val => params.constant = parseFloat(val));
    } else if (currentMode === 'periodic') {
        createSlider('周期频率 (Frequency)', 0.5, 4, params.period, 0.5, val => params.period = parseFloat(val));
        createSlider('发展幅度 (Amplitude)', 0.5, 3, params.amplitude, 0.5, val => params.amplitude = parseFloat(val));
    }
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

    input.addEventListener('input', (e) => {
        callback(e.target.value);
        labelEl.querySelector('span:last-child').textContent = e.target.value;
    });

    group.appendChild(labelEl);
    group.appendChild(input);
    controlsBar.appendChild(group);
}

function updateInsight() {
    if (currentMode === 'identity') {
        conceptTitle.textContent = '恒等函数 (Identity)';
        conceptIcon.textContent = '⚓';
        conceptMath.textContent = 'f(x) = x';
        conceptDesc.textContent = '输入永远等于输出。无论外界如何变化，本质始终如一。';
        conceptCard.style.borderTopColor = '#d63031';
        insightText.textContent = '"不忘初心，方得始终"。恒等函数象征着中国共产党人的初心和使命。无论走得多远，都不能忘记来时的路，行动（输出）必须始终与初心（输入）保持一致。';
    } else if (currentMode === 'monotonic') {
        conceptTitle.textContent = '单调函数 (Monotonic)';
        conceptIcon.textContent = '📈';
        conceptMath.textContent = 'x₁ < x₂ ⇒ f(x₁) ≤ f(x₂)';
        conceptDesc.textContent = '随着输入增加，输出从不下降。代表持续的增长和进步。';
        conceptCard.style.borderTopColor = '#00b894';
        insightText.textContent = '"稳中求进"是工作总基调。单调递增象征着国家综合国力和人民生活水平的持续提升。虽然增速（导数）可能有快有慢，但总体趋势始终向上，没有倒退。';
    } else if (currentMode === 'constant') {
        conceptTitle.textContent = '常数函数 (Constant)';
        conceptIcon.textContent = '🏔️';
        conceptMath.textContent = 'f(x) = C';
        conceptDesc.textContent = '无论输入如何变化，输出保持不变。代表绝对的稳定和定力。';
        conceptCard.style.borderTopColor = '#fdcb6e';
        insightText.textContent = '"战略定力"是治国理政的重要品质。面对国际局势的风云变幻（输入x的波动），我们坚持和平发展的原则立场（输出y）始终不变，任凭风浪起，稳坐钓鱼台。';
    } else if (currentMode === 'periodic') {
        conceptTitle.textContent = '周期函数 (Periodic)';
        conceptIcon.textContent = '🔄';
        conceptMath.textContent = 'f(x) = f(x + T)';
        conceptDesc.textContent = '每隔一定间隔，规律重复出现。代表循环往复、螺旋上升的规律。';
        conceptCard.style.borderTopColor = '#0984e3';
        insightText.textContent = '"五年规划"是周期性的生动体现。从"一五"到"十四五"，我们遵循客观规律，一轮接一轮地规划、建设、总结，在循环中实现螺旋式上升，不断迈向新台阶。';
    }
}

// Drawing
function startAnimation() {
    const loop = () => {
        draw();
        time += 0.02;
        animationId = requestAnimationFrame(loop);
    };
    loop();
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw Grid
    drawGrid();

    // Draw Function
    ctx.beginPath();
    ctx.lineWidth = 3;

    // Color based on mode
    if (currentMode === 'identity') ctx.strokeStyle = '#d63031';
    else if (currentMode === 'monotonic') ctx.strokeStyle = '#00b894';
    else if (currentMode === 'constant') ctx.strokeStyle = '#fdcb6e';
    else if (currentMode === 'periodic') ctx.strokeStyle = '#0984e3';

    let first = true;
    for (let px = 0; px < width; px += 2) {
        const x = (px - originX) / scale;
        let y;

        if (currentMode === 'identity') {
            y = x;
        } else if (currentMode === 'monotonic') {
            // Exponential-ish growth but flattened for visual
            y = (Math.exp(params.growth * x) - 1) * 0.5;
            // Or simple cubic? Let's do cubic for better negative handling
            // y = params.growth * Math.pow(x, 3) * 0.1 + x * 0.5;
            // Let's do a logistic-like or simple increasing curve
            y = x * params.growth + (x > 0 ? Math.pow(x, 1.5) * 0.1 : -Math.pow(Math.abs(x), 1.5) * 0.1);
        } else if (currentMode === 'constant') {
            y = params.constant;
        } else if (currentMode === 'periodic') {
            // Sine wave + slight upward trend for "Spiral Ascent"?
            // Pure periodic for now
            y = params.amplitude * Math.sin(params.period * x + time);
            // Add spiral ascent visual?
            // y += x * 0.2; // Makes it not strictly periodic f(x)=f(x+T), but "Quasi-periodic"
            // Let's stick to strict definition but maybe animate phase
        }

        const py = originY - y * scale;

        if (first) {
            ctx.moveTo(px, py);
            first = false;
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();

    // Draw Mouse Point
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
    const x = (mouseX - originX) / scale;
    let y;

    if (currentMode === 'identity') y = x;
    else if (currentMode === 'monotonic') y = x * params.growth + (x > 0 ? Math.pow(x, 1.5) * 0.1 : -Math.pow(Math.abs(x), 1.5) * 0.1);
    else if (currentMode === 'constant') y = params.constant;
    else if (currentMode === 'periodic') y = params.amplitude * Math.sin(params.period * x + time);

    const py = originY - y * scale;

    // Draw Point
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(mouseX, py, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw Dashed Lines
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(mouseX, originY);
    ctx.lineTo(mouseX, py);
    ctx.lineTo(originX, py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Update Stats
    valInput.textContent = x.toFixed(2);
    valOutput.textContent = y.toFixed(2);

    // Overlay Text Logic
    updateOverlay(x, y);
}

function updateOverlay(x, y) {
    let text = '';
    if (currentMode === 'identity') {
        if (Math.abs(x) < 0.5) text = '初心 (Origin)';
        else text = '行动 = 初心';
    } else if (currentMode === 'monotonic') {
        if (x > 2) text = '持续增长 (Growth)';
        else if (x < -2) text = '积累阶段 (Accumulation)';
    } else if (currentMode === 'constant') {
        text = '战略定力 (Determination)';
    } else if (currentMode === 'periodic') {
        // Identify peaks
        const phase = (params.period * x + time) % (2 * Math.PI);
        if (Math.abs(phase - Math.PI / 2) < 0.5) text = '规划高潮 (Peak)';
        else if (Math.abs(phase - 3 * Math.PI / 2) < 0.5) text = '总结蓄力 (Valley)';
    }

    if (text) {
        overlayText.textContent = text;
        overlayText.style.opacity = 1;
        overlayText.style.left = `${mouseX + 15}px`;
        overlayText.style.top = `${originY - y * scale - 40}px`;
    } else {
        overlayText.style.opacity = 0;
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
}

// Start
init();
