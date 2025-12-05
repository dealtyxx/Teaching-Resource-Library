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
    if (proofSteps) proofSteps.textContent = '';
}

function updateInsights(mode) {
    const card = document.querySelector('.concept-card');
    const title = document.getElementById('conceptTitle');
    const mathDef = document.getElementById('mathDef');
    const desc = document.getElementById('conceptDesc');
    const insight = document.getElementById('insightText');

    if (mode === 'countable') {
        card.style.borderLeftColor = '#0984e3';
        title.textContent = '可数无限集合';
        mathDef.innerHTML = '$|S| = |\\mathbb{N}| = \\aleph_0$';
        desc.textContent = '存在与自然数的双射，可以"数出来"，如年份、里程碑。';
        insight.textContent = '中华民族的复兴之路是一步一个脚印的（可数），但每一步中蕴含的奋斗故事和人民幸福是无限丰富的（不可数）。我们既要珍惜每个里程碑，也要理解进步的深度与广度。';
        if (window.MathJax) MathJax.typesetPromise([mathDef]);
    } else if (mode === 'uncountable') {
        card.style.borderLeftColor = '#d63031';
        title.textContent = '不可数无限集合';
        mathDef.innerHTML = '$|\\mathbb{R}| = 2^{\\aleph_0} > \\aleph_0$';
        desc.textContent = '无法与自然数建立双射，"数不过来"的无限。实数集是典型例子。';
        insight.textContent = '任意两个历史节点之间，都有无数个可能的发展路径（如实数之于自然数）。历史的丰富性和人民创造力的深度，远超我们能够"数清楚"的范畴。';
        if (window.MathJax) MathJax.typesetPromise([mathDef]);
    } else if (mode === 'equipotence') {
        card.style.borderLeftColor = '#f39c12';
        title.textContent = '等势关系';
        mathDef.innerHTML = '$|A| = |B| \\Leftrightarrow \\exists$ 双射 $f: A \\to B$';
        desc.textContent = '两个集合具有相同的基数，可以建立一一对应。';
        insight.textContent = '56个民族虽然人口、文化各异（集合形式不同），但在中华民族大家庭中地位平等（等势）。这是"异形同质"的中国智慧。';
        if (window.MathJax) MathJax.typesetPromise([mathDef]);
    } else if (mode === 'cantor') {
        card.style.borderLeftColor = '#8e44ad';
        title.textContent = '康托定理';
        mathDef.innerHTML = '$|\\mathcal{P}(S)| > |S|$';
        desc.textContent = '任意集合的幂集严格大于原集合。总有更高的层次。';
        insight.textContent = '从全面小康到共同富裕，从富起来到强起来，每个目标的实现都会衍生出更高远的追求。这是"永无止境"的辩证法，也是"中国梦"的无限展开。';
        if (window.MathJax) MathJax.typesetPromise([mathDef]);
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
        line.style.background = '#0984e3';
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

async function animateDiagonalProof() {
    if (animating) return;
    animating = true;

    const table = document.getElementById('proofTable');
    const steps = document.getElementById('proofSteps');

    table.innerHTML = '';
    steps.textContent = '步骤 1: 假设实数可数，列出所有实数...';

    // Simplified diagonal proof visualization
    const numbers = [
        '0.1415926...',
        '0.2718281...',
        '0.5772156...',
        '0.6180339...',
        '0.7071067...'
    ];

    for (let i = 0; i < numbers.length; i++) {
        await sleep(500);
        const row = document.createElement('div');
        row.style.marginBottom = '8px';
        row.textContent = `r${i + 1} = ${numbers[i]}`;
        table.appendChild(row);
    }

    await sleep(800);
    steps.textContent = '步骤 2: 构造对角线上的数字...';

    await sleep(1000);
    steps.textContent = '步骤 3: 修改对角线数字，得到新数 x...';

    await sleep(1000);
    steps.textContent = '步骤 4: x 与列表中每个数都不同！';

    await sleep(1000);
    const conclusion = document.getElementById('proofConclusion');
    conclusion.style.background = 'rgba(214, 48, 49, 0.2)';

    await sleep(500);
    conclusion.style.background = 'rgba(214, 48, 49, 0.1)';

    animating = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start
init();
