/**
 * Spring Festival Population Migration Visualization
 * 春运：函数复合与逆运算
 */

const canvas = document.getElementById('migrationCanvas');
const ctx = canvas.getContext('2d');

// State
let currentMode = 'outbound'; // outbound, inbound, composition
let currentTime = 0;

// Functions
function f(x) {
    // Outbound: City to Rural
    return 2 * x + 3;
}

function g(x) {
    // Inbound: Rural to City
    return (x - 3) / 2;
}

function fInverse(y) {
    // Inverse of f
    return (y - 3) / 2;
}

function gInverse(y) {
    // Inverse of g
    return 2 * y + 3;
}

// Initialize
function init() {
    setupCanvas();
    setupControls();
    updateVisualization();
}

function setupCanvas() {
    function resize() {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();

        // Set display size
        canvas.style.width = (rect.width - 40) + 'px';
        canvas.style.height = (rect.height - 40) + 'px';

        // Set actual size in memory (scaled for retina displays)
        const scale = window.devicePixelRatio || 1;
        canvas.width = Math.floor((rect.width - 40) * scale);
        canvas.height = Math.floor((rect.height - 40) * scale);

        // Normalize coordinate system
        ctx.scale(scale, scale);

        drawGraph();
    }
    resize();
    window.addEventListener('resize', resize);
}

function setupControls() {
    const slider = document.getElementById('timeSlider');
    slider.addEventListener('input', e => {
        currentTime = parseFloat(e.target.value);
        updateVisualization();
    });

    document.getElementById('outboundBtn').addEventListener('click', () => setMode('outbound'));
    document.getElementById('inboundBtn').addEventListener('click', () => setMode('inbound'));
    document.getElementById('compositionBtn').addEventListener('click', () => setMode('composition'));
}

function setMode(mode) {
    currentMode = mode;

    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (mode === 'outbound') {
        document.getElementById('outboundBtn').classList.add('active');
    } else if (mode === 'inbound') {
        document.getElementById('inboundBtn').classList.add('active');
    } else {
        document.getElementById('compositionBtn').classList.add('active');
    }

    updateVisualization();
}

function updateVisualization() {
    // Update time display
    document.getElementById('timeDisplay').textContent = currentTime.toFixed(1);
    document.getElementById('dayValue').textContent = currentTime.toFixed(1);

    // Calculate population based on mode
    let population;
    let direction;
    let functionDisplay;

    if (currentMode === 'outbound') {
        // Before festival: city to rural
        population = f(currentTime);
        direction = '城 → 乡';
        functionDisplay = `
            <div class="function-card outbound">
                <h4>返乡函数 (Outbound)</h4>
                <div class="formula">$f(x) = 2x + 3$</div>
                <p>城市 → 农村</p>
            </div>
        `;
    } else if (currentMode === 'inbound') {
        // After festival: rural to city
        population = gInverse(currentTime);
        direction = '乡 → 城';
        functionDisplay = `
            <div class="function-card inbound">
                <h4>返城函数 (Inbound)</h4>
                <div class="formula">$g(x) = \\frac{x-3}{2}$</div>
                <p>农村 → 城市</p>
            </div>
        `;
    } else {
        // Composition
        const intermediate = f(currentTime);
        population = g(intermediate);
        direction = '循环';
        functionDisplay = `
            <div class="function-card outbound">
                <h4>复合函数</h4>
                <div class="formula">$(g \\circ f)(x) = g(f(x))$</div>
                <p>$= g(2x+3) = \\frac{(2x+3)-3}{2} = x$</p>
            </div>
        `;
    }

    // Update stats
    document.getElementById('currentDay').textContent = `第 ${currentTime.toFixed(1)} 天`;
    document.getElementById('direction').textContent = direction;
    document.getElementById('population').textContent = `${population.toFixed(1)} 万人`;
    document.getElementById('popValue').textContent = population.toFixed(1);

    // Update function display
    document.getElementById('functionDisplay').innerHTML = functionDisplay;

    // Redraw graph
    drawGraph();

    // Trigger MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

function drawGraph() {
    // Use style dimensions for drawing
    const w = parseFloat(canvas.style.width) || 600;
    const h = parseFloat(canvas.style.height) || 400;

    ctx.clearRect(0, 0, w, h);

    // Draw grid
    ctx.save();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;

    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
    ctx.restore();

    // Draw axes
    const originX = 60;
    const originY = h - 60;
    const scaleX = 25; // pixels per day
    const scaleY = 12; // pixels per person (万人)

    ctx.save();
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(w - 20, originY);
    ctx.stroke();

    // Arrow
    ctx.beginPath();
    ctx.moveTo(w - 20, originY);
    ctx.lineTo(w - 30, originY - 5);
    ctx.lineTo(w - 30, originY + 5);
    ctx.closePath();
    ctx.fill();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, 20);
    ctx.stroke();

    // Arrow
    ctx.beginPath();
    ctx.moveTo(originX, 20);
    ctx.lineTo(originX - 5, 30);
    ctx.lineTo(originX + 5, 30);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Labels
    ctx.fillStyle = '#636e72';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('时间 (天)', w - 40, originY + 30);
    ctx.save();
    ctx.translate(25, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('人口 (万人)', 0, 0);
    ctx.restore();

    // Draw function curve
    ctx.save();
    ctx.strokeStyle = currentMode === 'outbound' ? '#0984e3' :
        currentMode === 'inbound' ? '#fd79a8' : '#6c5ce7';
    ctx.lineWidth = 3;
    ctx.beginPath();

    let first = true;
    for (let x = -7; x <= 14; x += 0.1) {
        let y;

        if (currentMode === 'outbound') {
            y = f(x);
        } else if (currentMode === 'inbound') {
            y = gInverse(x);
        } else {
            y = x; // g(f(x)) = x (identity)
        }

        const px = originX + x * scaleX;
        const py = originY - y * scaleY;

        // Check bounds
        if (px >= originX && px <= w - 20 && py >= 20 && py <= originY) {
            if (first) {
                ctx.moveTo(px, py);
                first = false;
            } else {
                ctx.lineTo(px, py);
            }
        } else if (!first) {
            first = true;
        }
    }
    ctx.stroke();
    ctx.restore();

    // Draw current point
    let currentY;
    if (currentMode === 'outbound') {
        currentY = f(currentTime);
    } else if (currentMode === 'inbound') {
        currentY = gInverse(currentTime);
    } else {
        currentY = currentTime;
    }

    const pointX = originX + currentTime * scaleX;
    const pointY = originY - currentY * scaleY;

    // Draw dashed lines to axes
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(214, 48, 49, 0.5)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(pointX, pointY);
    ctx.lineTo(pointX, originY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pointX, pointY);
    ctx.lineTo(originX, pointY);
    ctx.stroke();
    ctx.restore();

    // Highlight point
    ctx.save();
    ctx.fillStyle = '#d63031';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pointX, pointY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Tick marks
    ctx.save();
    ctx.fillStyle = '#636e72';
    ctx.font = '11px Arial';
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 1;

    // X-axis ticks
    ctx.textAlign = 'center';
    for (let x = -7; x <= 14; x += 7) {
        const px = originX + x * scaleX;
        ctx.fillText(x, px, originY + 18);
        ctx.beginPath();
        ctx.moveTo(px, originY - 4);
        ctx.lineTo(px, originY + 4);
        ctx.stroke();
    }

    // Y-axis ticks
    ctx.textAlign = 'right';
    for (let y = 0; y <= 30; y += 10) {
        const py = originY - y * scaleY;
        if (py > 20 && py <= originY) {
            ctx.fillText(y, originX - 8, py + 4);
            ctx.beginPath();
            ctx.moveTo(originX - 4, py);
            ctx.lineTo(originX + 4, py);
            ctx.stroke();
        }
    }
    ctx.restore();
}

// Start
init();
