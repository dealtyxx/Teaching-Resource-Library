/**
 * Red Mathematics - Random Number Generator (LCG) Visualizer
 */

// DOM Elements
const modInput = document.getElementById('modInput');
const mulInput = document.getElementById('mulInput');
const incInput = document.getElementById('incInput');
const seedInput = document.getElementById('seedInput');

const modValue = document.getElementById('modValue');
const mulValue = document.getElementById('mulValue');
const incValue = document.getElementById('incValue');
const seedValue = document.getElementById('seedValue');

const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const graphContainer = document.getElementById('graphContainer');
const coverageBar = document.getElementById('coverageBar');
const coverageText = document.getElementById('coverageText');
const statusBadge = document.getElementById('statusBadge');
const szTitle = document.getElementById('szTitle');
const szDesc = document.getElementById('szDesc');

// State
let m, a, c, seed;
let isRunning = false;
let visited = new Set();
let nodes = []; // Array of DOM elements
let radius = 0;

const lcgInfo = document.getElementById('lcgInfo');
function gcdN(x, y) { while (y) { [x, y] = [y, x % y]; } return x; }
function primeFactors(n) { const f = []; for (let d = 2; d * d <= n; d++) if (n % d === 0) { f.push(d); while (n % d === 0) n /= d; } if (n > 1) f.push(n); return f; }
// 即时分析：序列、尾长与周期、Hull–Dobell 三条件
function analyze() {
    const seen = {}, seq = []; let x = seed;
    while (seen[x] === undefined) { seen[x] = seq.length; seq.push(x); x = (a * x + c) % m; }
    const tail = seen[x], period = seq.length - tail, ps = primeFactors(m);
    const h1 = gcdN(c, m) === 1, h2 = ps.every(p => (a - 1) % p === 0), h3 = m % 4 !== 0 || (a - 1) % 4 === 0;
    const chk = (ok, t) => `<span class="hd ${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'} ${t}</span>`;
    lcgInfo.innerHTML = `<div class="seq">序列：${seq.join(', ')}, <b>${x}</b> …（第 ${seq.length} 项回到 X<sub>${tail}</sub>）</div>
        <div class="per">周期 <b>${period}</b> / m = ${m}${tail ? `，前 ${tail} 项为“尾巴”` : ''}${period === m ? '，<b class="okc">满周期</b>' : ''}</div>
        <div class="hds">${chk(h1, `gcd(c, m) = ${gcdN(c, m)}`)}${chk(h2, `m 的素因子 ${ps.join('、')} 整除 a−1 = ${a - 1}`)}${chk(h3, m % 4 === 0 ? '4 | m，需 4 | a−1' : '4 ∤ m（自动满足）')}</div>
        <p class="hd-note">Hull–Dobell 定理：c ≠ 0 时，周期为 m ⇔ 三条同时成立。${h1 && h2 && h3 ? '当前参数全部满足。' : '当前参数不全满足，周期一般小于 m。'}${a === 1 ? ' 注意 a = 1 时序列只是等差数列，虽满周期但毫无“随机感”——周期长只是好生成器的必要条件。' : ''}</p>`;
}

// Helper Functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateValues() {
    m = parseInt(modInput.value);
    a = parseInt(mulInput.value);
    c = parseInt(incInput.value);
    seed = parseInt(seedInput.value);

    modValue.textContent = m;
    mulValue.textContent = a;
    incValue.textContent = c;
    seedValue.textContent = seed;

    // Update seed max based on mod
    seedInput.max = m - 1;
    if (seed >= m) {
        seed = m - 1;
        seedInput.value = seed;
        seedValue.textContent = seed;
    }
}

function initGraph() {
    graphContainer.innerHTML = '';
    nodes = [];
    visited.clear();

    const containerRect = graphContainer.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    radius = Math.min(centerX, centerY) - 40;

    for (let i = 0; i < m; i++) {
        const angle = (i / m) * 2 * Math.PI - Math.PI / 2; // Start from top
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const node = document.createElement('div');
        node.className = 'site-node';
        node.textContent = i;
        node.style.left = `${x - 20}px`;
        node.style.top = `${y - 20}px`;

        graphContainer.appendChild(node);
        nodes.push(node);
    }

    // Reset stats
    coverageBar.style.width = '0%';
    coverageText.textContent = '0%';
    statusBadge.className = 'status-badge pending';
    statusBadge.textContent = '准备就绪';
}

function drawLine(fromIdx, toIdx) {
    const fromNode = nodes[fromIdx];
    const toNode = nodes[toIdx];

    const x1 = parseFloat(fromNode.style.left) + 20;
    const y1 = parseFloat(fromNode.style.top) + 20;
    const x2 = parseFloat(toNode.style.left) + 20;
    const y2 = parseFloat(toNode.style.top) + 20;

    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    const line = document.createElement('div');
    line.className = 'connection-line';
    line.style.width = `${length}px`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.transform = `rotate(${angle}deg)`;

    graphContainer.appendChild(line);

    // 保留轨迹：旧线条淡化，最后能看到完整的循环
    graphContainer.querySelectorAll('.connection-line.latest').forEach(l => l.classList.remove('latest'));
    line.classList.add('latest');
}

async function runInvestigation() {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;

    // Disable inputs
    modInput.disabled = true;
    mulInput.disabled = true;
    incInput.disabled = true;
    seedInput.disabled = true;

    initGraph();

    let current = seed;
    let path = [];
    let loopDetected = false;

    // Initial State
    nodes[current].classList.add('current');
    visited.add(current);
    path.push(current);

    statusBadge.textContent = '调研进行中...';

    while (!loopDetected) {
        await sleep(600);

        // Calculate next
        const next = (a * current + c) % m;

        // Draw path
        drawLine(current, next);

        // Update nodes
        nodes[current].classList.remove('current');
        nodes[current].classList.add('visited');

        // Check loop
        if (path.includes(next)) {
            loopDetected = true;
            nodes[next].classList.add('current'); // Highlight loop point
        } else {
            current = next;
            path.push(current);
            visited.add(current);
            nodes[current].classList.add('current');
        }

        // Update Stats
        const coverage = Math.round((visited.size / m) * 100);
        coverageBar.style.width = `${coverage}%`;
        coverageText.textContent = `${coverage}%`;
    }

    // Final Result
    const coverage = visited.size / m;
    if (coverage === 1) {
        statusBadge.className = 'status-badge success';
        statusBadge.textContent = '全面覆盖';
        szTitle.textContent = '全面覆盖';
        szDesc.textContent = '调研工作深入扎实，足迹遍布所有站点，真正做到了全覆盖、无死角，体现了优良的工作作风。';
    } else {
        statusBadge.className = 'status-badge fail';
        statusBadge.textContent = '覆盖不全';
        szTitle.textContent = '存在盲区';
        szDesc.textContent = '序列过早进入循环，部分站点从未被访问。调整参数（方法）才能实现全覆盖——做事要遵循规律、讲究方法。';
    }

    isRunning = false;
    startBtn.disabled = false;

    // Re-enable inputs
    modInput.disabled = false;
    mulInput.disabled = false;
    incInput.disabled = false;
    seedInput.disabled = false;
}

// Event Listeners
[modInput, mulInput, incInput, seedInput].forEach(input => {
    input.addEventListener('input', () => {
        updateValues();
        analyze();
        if (!isRunning) initGraph();
    });
});

startBtn.addEventListener('click', runInvestigation);
resetBtn.addEventListener('click', () => {
    if (isRunning) return;
    modInput.value = 16; mulInput.value = 5; incInput.value = 3; seedInput.value = 0;
    updateValues(); analyze(); initGraph();
    szTitle.textContent = '全面覆盖';
    szDesc.textContent = '满周期意味着每个站点都会被访问到：调研要遍布每一个基层站点，做到情况明、底数清、不留死角。';
});

window.addEventListener('resize', () => {
    if (!isRunning) initGraph();
});

// Init
updateValues();
analyze();
// Wait for layout
setTimeout(initGraph, 100);
