/**
 * Red Mathematics - Infinite Sets Visualization
 */

let currentMode = 'countable';
let animating = false;

// Initialize
function init() {
    setupNav();
    setupBijection();
    setupDiagonal();
    updateInsights('countable');
    // 加载即演示：双射映射与对角线表格
    animateBijectionMapping().then(() => animateDiagonalProof());
}

function setupNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    document.getElementById('resetBtn').addEventListener('click', reset);
}

function switchMode(mode) {
    if (animating) return;
    currentMode = mode;

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    document.querySelectorAll('.demo-view').forEach(view => {
        view.classList.toggle('active', view.id === `view${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
    });

    updateInsights(mode);
}

function reset() {
    // Reset various states
    animating = false;
    const arrows = document.getElementById('mappingArrows');
    if (arrows) arrows.innerHTML = '';

    const proofTable = document.getElementById('proofTable');
    if (proofTable) proofTable.innerHTML = '';

    const proofSteps = document.getElementById('proofSteps');
    if (proofSteps) proofSteps.textContent = '点「开始证明」重新演示对角线论证。';
    const c = document.getElementById('proofConclusion');
    if (c) c.classList.remove('shown');
}

function updateInsights(mode) {
    const card = document.querySelector('.concept-card');
    const title = document.getElementById('conceptTitle');
    const mathDef = document.getElementById('mathDef');
    const desc = document.getElementById('conceptDesc');
    const insight = document.getElementById('insightText');

    if (mode === 'countable') {
        card.style.borderLeftColor = '#FFB400';
        title.textContent = '可数无限集合';
        mathDef.innerHTML = '$|S| = |\\mathbb{N}| = \\aleph_0$';
        desc.textContent = '与自然数集 ℕ 之间存在双射，即可以排成一列 a₀, a₁, a₂, … 。ℤ、ℚ 都是可数集（ℚ 用对角线蛇形枚举）。';
        insight.textContent = '面对无限，数学不回避也不畏惧，而是找到一种「编号规则」把它排成一列——化繁为简、有章可循，这正是科学方法的力量。';
        if (window.MathJax && window.MathJax.typesetPromise) MathJax.typesetPromise([mathDef]).catch(() => {});
    } else if (mode === 'uncountable') {
        card.style.borderLeftColor = '#D63B1D';
        title.textContent = '不可数无限集合';
        mathDef.innerHTML = '$|\\mathbb{R}| = 2^{\\aleph_0} > \\aleph_0$';
        desc.textContent = '与 ℕ 之间不存在双射。康托对角线法：任给一列实数，总能构造一个不在列表中的实数，故 (0,1) 与 ℝ 不可数。';
        insight.textContent = '对角线法用「反证 + 构造」证明了一件看似无法验证的事：无限也分大小。敢于挑战直觉、用严密推理说话，是理性精神的典范。';
        if (window.MathJax && window.MathJax.typesetPromise) MathJax.typesetPromise([mathDef]).catch(() => {});
    } else if (mode === 'equipotence') {
        card.style.borderLeftColor = '#E39B0B';
        title.textContent = '等势关系';
        mathDef.innerHTML = '$|A| = |B| \\Leftrightarrow \\exists$ 双射 $f: A \\to B$';
        desc.textContent = '两个集合具有相同的基数，可以建立一一对应。';
        insight.textContent = '「比大小」不必逐个去数，只要能一一配对——等势用双射给出了公平、可验证的比较标准。';
        if (window.MathJax && window.MathJax.typesetPromise) MathJax.typesetPromise([mathDef]).catch(() => {});
    } else if (mode === 'cantor') {
        card.style.borderLeftColor = '#B8321A';
        title.textContent = '康托定理';
        mathDef.innerHTML = '$|\\mathcal{P}(S)| > |S|$';
        desc.textContent = '任意集合的幂集严格大于原集合。总有更高的层次。';
        insight.textContent = '幂集永远比原集合大：每达到一个层次，都有更高的层次在前方。认识无止境，奋斗也无止境。';
        if (window.MathJax && window.MathJax.typesetPromise) MathJax.typesetPromise([mathDef]).catch(() => {});
    }
}

// Bijection Animation
function setupBijection() {
    const btn = document.getElementById('animateBijection');
    if (!btn) return;

    btn.addEventListener('click', animateBijectionMapping);
}

async function animateBijectionMapping() {
    if (animating) return;
    animating = true;

    const arrows = document.getElementById('mappingArrows');
    arrows.innerHTML = '';

    // Mapping: 0→0, 1→-1, 2→1, 3→-2, 4→2, 5→-3
    const mapping = [
        { n: 0, z: 0, x1: 0, x2: 0 },
        { n: 1, z: -1, x1: 1, x2: 1 },
        { n: 2, z: 1, x1: 2, x2: 2 },
        { n: 3, z: -2, x1: 3, x2: 3 },
        { n: 4, z: 2, x1: 4, x2: 4 },
        { n: 5, z: -3, x1: 5, x2: 5 }
    ];

    for (let i = 0; i < mapping.length; i++) {
        await sleep(400);

        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.width = '90px';
        line.style.height = '2px';
        line.style.background = '#D63B1D';
        line.style.top = `${30 + i * 30}px`;
        line.style.left = '5px';
        line.style.transformOrigin = 'left';
        line.style.opacity = '0';
        line.style.transition = 'opacity 0.5s';

        arrows.appendChild(line);

        setTimeout(() => {
            line.style.opacity = '0.6';
        }, 10);
    }

    animating = false;
}

// Diagonal Argument
function setupDiagonal() {
    const btn = document.getElementById('startDiagonal');
    if (!btn) return;

    btn.addEventListener('click', animateDiagonalProof);
}

// 对角线论证：列出 5 个实数，逐位取对角线数字并改写（d ≠ 5 时改为 5，d = 5 时改为 4，避开 0/9 的双重表示）
const DIAG_NUMS = ['1415926', '2718281', '5772156', '6180339', '7071067'];
async function animateDiagonalProof() {
    if (animating) return;
    animating = true;
    const table = document.getElementById('proofTable');
    const steps = document.getElementById('proofSteps');
    const conclusion = document.getElementById('proofConclusion');
    conclusion.classList.remove('shown');
    steps.textContent = '步骤 1：假设 (0,1) 中的实数可以排成一列 r₁, r₂, r₃, …';
    const n = DIAG_NUMS.length;
    const rowHtml = (i, upto) => `<div class="diag-row"><span class="lab">r${i + 1} = 0.</span>` +
        DIAG_NUMS[i].split('').map((d, j) => `<span class="dg${j === i && i < upto ? ' on' : ''}">${d}</span>`).join('') + '<span>…</span></div>';
    table.innerHTML = '';
    for (let i = 0; i < n; i++) {
        table.innerHTML = DIAG_NUMS.slice(0, i + 1).map((_, k) => rowHtml(k, 0)).join('');
        await sleep(260);
    }
    steps.textContent = '步骤 2：沿对角线取第 n 个数的第 n 位数字。';
    let x = '';
    for (let i = 0; i < n; i++) {
        const d = DIAG_NUMS[i][i];
        const nd = d === '5' ? '4' : '5';
        x += nd;
        table.innerHTML = DIAG_NUMS.map((_, k) => rowHtml(k, i + 1)).join('') +
            `<div class="diag-row new"><span class="lab">x = 0.</span>${x.split('').map(c => `<span class="dg on">${c}</span>`).join('')}<span>…</span></div>`;
        steps.textContent = `步骤 3：r${i + 1} 的第 ${i + 1} 位是 ${d}，x 的第 ${i + 1} 位取 ${nd}（≠ ${d}）。`;
        await sleep(520);
    }
    steps.textContent = '步骤 4：x 与每个 rₙ 至少在第 n 位不同，所以 x 不在列表中。';
    conclusion.classList.add('shown');
    animating = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start
init();
