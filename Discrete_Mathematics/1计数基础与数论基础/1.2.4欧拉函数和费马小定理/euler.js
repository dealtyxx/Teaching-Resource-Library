/**
 * Red Mathematics - Euler & Fermat Visualizer
 */

// DOM Elements
const eulerControls = document.getElementById('eulerControls');
const fermatControls = document.getElementById('fermatControls');
const modeTabs = document.querySelectorAll('.mode-tab');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const visualizationArea = document.getElementById('visualizationArea');
const resultPanel = document.getElementById('resultPanel');
const vizTitle = document.getElementById('vizTitle');
const vizSubtitle = document.getElementById('vizSubtitle');
const szTitle = document.getElementById('szTitle');
const szDesc = document.getElementById('szDesc');
const calcResult = document.getElementById('calcResult');
const szResult = document.getElementById('szResult');

// Inputs
const eulerInput = document.getElementById('eulerInput');
const eulerValue = document.getElementById('eulerValue');
const fermatBase = document.getElementById('fermatBase');
const fermatBaseValue = document.getElementById('fermatBaseValue');
const fermatPrime = document.getElementById('fermatPrime');

// State
let currentMode = 'euler';
let isRunning = false;

// Ideological Keywords (思政关键词)
const SZ_KEYWORDS = {
    coprime: ['团结', '互助', '平等', '和谐', '友善', '诚信', '敬业', '爱国'],
    nonCoprime: [],
    fermat: ['不忘初心', '方得始终', '坚定信念', '砥砺前行', '循环往复', '螺旋上升']
};

// Helper Functions
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function powerMod(base, exp, mod) {
    let res = 1;
    base = base % mod;
    while (exp > 0) {
        if (exp % 2 === 1) res = (res * base) % mod;
        base = (base * base) % mod;
        exp = Math.floor(exp / 2);
    }
    return res;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Mode Switching
modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.dataset.mode;

        if (currentMode === 'euler') {
            eulerControls.classList.remove('hidden');
            fermatControls.classList.add('hidden');
            vizTitle.textContent = '欧拉函数 φ(n)';
            vizSubtitle.textContent = '寻找与 n 互质的数';
            szTitle.textContent = '群众路线';
            szDesc.textContent = '互质关系象征着党和人民群众的紧密联系，不可分割。';
        } else {
            eulerControls.classList.add('hidden');
            fermatControls.classList.remove('hidden');
            vizTitle.textContent = '费马小定理';
            vizSubtitle.textContent = 'a^(p-1) ≡ 1 (mod p)';
            szTitle.textContent = '理想信念';
            szDesc.textContent = '无论经历多少次乘方运算（磨砺），最终都要回归本心（余数为1）。';
        }

        resetViz();
    });
});

// Input Listeners
eulerInput.addEventListener('input', (e) => {
    eulerValue.textContent = e.target.value;
    if (!isRunning) resetViz();
});

fermatBase.addEventListener('input', (e) => {
    fermatBaseValue.textContent = e.target.value;
    if (!isRunning) resetViz();
});

fermatPrime.addEventListener('change', () => {
    if (!isRunning) resetViz();
});

// Visualization Logic
async function runEuler() {
    const n = parseInt(eulerInput.value);
    visualizationArea.innerHTML = '';
    resultPanel.classList.add('hidden');

    const grid = document.createElement('div');
    grid.className = 'coprime-grid';
    visualizationArea.appendChild(grid);

    let count = 0;

    for (let i = 1; i < n; i++) {
        const card = document.createElement('div');
        card.className = 'number-card';
        card.innerHTML = `<span class="card-number">${i}</span>`;
        grid.appendChild(card);

        await sleep(50);

        if (gcd(i, n) === 1) {
            card.classList.add('coprime');
            const keyword = SZ_KEYWORDS.coprime[count % SZ_KEYWORDS.coprime.length];
            card.innerHTML += `<span class="sz-badge">${keyword}</span>`;
            count++;
        } else {
            card.classList.add('non-coprime');
        }
    }

    calcResult.textContent = count;
    szResult.textContent = "紧密联系";
    resultPanel.classList.remove('hidden');
    isRunning = false;
    startBtn.disabled = false;
}

async function runFermat() {
    const a = parseInt(fermatBase.value);
    const p = parseInt(fermatPrime.value);

    if (a % p === 0) {
        alert(`${a} 和 ${p} 不互质，费马小定理不适用`);
        isRunning = false;
        startBtn.disabled = false;
        return;
    }

    visualizationArea.innerHTML = '';
    resultPanel.classList.add('hidden');

    const container = document.createElement('div');
    container.className = 'fermat-sequence';
    visualizationArea.appendChild(container);

    for (let i = 1; i < p; i++) {
        const val = powerMod(a, i, p); // Calculate a^i mod p
        // Actually we want to show the sequence a^1, a^2 ... a^(p-1)
        // But for visualization, let's show the power and the result

        const item = document.createElement('div');
        item.className = 'sequence-item';
        item.innerHTML = `
            <span class="seq-exp">${a}^${i} mod ${p}</span>
            <span class="seq-val">${val}</span>
        `;
        container.appendChild(item);

        await sleep(200);

        if (i === p - 1) {
            item.classList.add('highlight');
            item.innerHTML += `<span class="sz-badge">回归初心</span>`;
        }
    }

    calcResult.textContent = "1";
    szResult.textContent = "坚定信念";
    resultPanel.classList.remove('hidden');
    isRunning = false;
    startBtn.disabled = false;
}

function resetViz() {
    visualizationArea.innerHTML = '';
    resultPanel.classList.add('hidden');
    isRunning = false;
    startBtn.disabled = false;
}

startBtn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;

    if (currentMode === 'euler') {
        runEuler();
    } else {
        runFermat();
    }
});

resetBtn.addEventListener('click', resetViz);

// Init
resetViz();
