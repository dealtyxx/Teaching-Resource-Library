/**
 * Red Mathematics - Function Operations (Enhanced)
 */

const COMP_DATA = [
    {
        id: 'x1',
        input: '乡村振兴愿景',
        intermediate: '产业扶持政策',
        output: '现代化农业强镇'
    },
    {
        id: 'x2',
        input: '科技强国梦想',
        intermediate: '创新驱动战略',
        output: '载人航天突破'
    },
    {
        id: 'x3',
        input: '绿水青山向往',
        intermediate: '生态文明建设',
        output: '美丽中国画卷'
    },
    {
        id: 'x4',
        input: '教育公平期盼',
        intermediate: '义务教育均衡',
        output: '学有所教实现'
    }
];

const INV_DATA = [
    { id: 'y1', output: '全面小康社会', input: '为人民谋幸福的初心' },
    { id: 'y2', output: '深圳特区奇迹', input: '改革开放关键一招' },
    { id: 'y3', output: '抗疫重大胜利', input: '人民至上生命至上' },
    { id: 'y4', output: '脱贫攻坚成就', input: '一个都不能少的承诺' }
];

let currentMode = 'composition';
let animating = false;

// Initialize
function init() {
    setupNav();
    renderCompositionInputs();
    renderInverseInputs();
    updateInsights('composition');
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

    document.querySelectorAll('.operation-view').forEach(view => {
        view.classList.toggle('active', view.id === `view${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
    });

    updateInsights(mode);
    reset();
}

function reset() {
    document.querySelectorAll('.list-item').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.flow-connector').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.progress-step').forEach(el => el.classList.remove('active'));

    const compInter = document.getElementById('compInterDisplay');
    const compOut = document.getElementById('compOutputDisplay');
    const invOut = document.getElementById('invOutputDisplay');

    compInter.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    compOut.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    invOut.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';

    animating = false;
}

function updateInsights(mode) {
    const card = document.getElementById('conceptCard');
    const title = document.getElementById('conceptTitle');
    const mathDef = document.getElementById('mathDef');
    const desc = document.getElementById('conceptDesc');
    const insight = document.getElementById('insightText');

    if (mode === 'composition') {
        card.style.borderLeftColor = '#0984e3';
        title.textContent = '复合运算';
        mathDef.textContent = '(g ∘ f)(x) = g(f(x))';
        desc.textContent = '将一个函数的输出作为另一个函数的输入，形成连续的执行链条。';
        insight.textContent = '"一张蓝图绘到底"。从人民的愿景到国家战略，再到基层落实，这是一个环环相扣的执行链条。只有每个环节都精准衔接，才能将美好蓝图变为现实。';
    } else {
        card.style.borderLeftColor = '#d63031';
        title.textContent = '逆运算';
        mathDef.textContent = 'f⁻¹(y) = x ⟺ f(x) = y';
        desc.textContent = '反向追踪映射关系。若 f(x) = y，则 f⁻¹(y) = x。用于寻找结果的源头。';
        insight.textContent = '"饮水思源，不忘来路"。当我们面对全面小康、抗疫胜利等伟大成就时，要运用逆向思维，追溯其根本原因——那就是中国共产党的领导和为人民服务的初心。';
    }
}

// Composition
function renderCompositionInputs() {
    const list = document.getElementById('compInputList');
    list.innerHTML = '';

    COMP_DATA.forEach(item => {
        const el = document.createElement('div');
        el.className = 'list-item';
        el.textContent = item.input;
        el.addEventListener('click', () => runComposition(item, el));
        list.appendChild(el);
    });
}

async function runComposition(item, el) {
    if (animating) return;
    animating = true;

    // Reset
    reset();
    el.classList.add('selected');

    const steps = document.querySelectorAll('.progress-step');
    const connectors = document.querySelectorAll('#viewComposition .flow-connector');
    const interDisplay = document.getElementById('compInterDisplay');
    const outDisplay = document.getElementById('compOutputDisplay');

    // Step 1: Input selected
    steps[0].classList.add('active');
    await sleep(500);

    // Step 2: f(x) -> y
    connectors[0].classList.add('active');
    await sleep(800);

    steps[1].classList.add('active');
    interDisplay.innerHTML = `<strong>${item.intermediate}</strong>`;
    await sleep(600);

    // Step 3: g(y) -> z
    connectors[1].classList.add('active');
    await sleep(800);

    steps[2].classList.add('active');
    outDisplay.innerHTML = `<strong>${item.output}</strong>`;

    animating = false;
}

// Inverse
function renderInverseInputs() {
    const list = document.getElementById('invInputList');
    list.innerHTML = '';

    INV_DATA.forEach(item => {
        const el = document.createElement('div');
        el.className = 'list-item';
        el.textContent = item.output;
        el.addEventListener('click', () => runInverse(item, el));
        list.appendChild(el);
    });
}

async function runInverse(item, el) {
    if (animating) return;
    animating = true;

    // Reset
    reset();
    el.classList.add('selected');

    const steps = document.querySelectorAll('.progress-step');
    const connector = document.querySelector('#viewInverse .flow-connector');
    const outDisplay = document.getElementById('invOutputDisplay');

    // Step 1: Output selected
    steps[0].classList.add('active');
    await sleep(500);

    // Step 2: Trace back
    connector.classList.add('active');
    await sleep(800);

    steps[1].classList.add('active');
    outDisplay.innerHTML = `<strong>${item.input}</strong>`;

    animating = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start
init();
