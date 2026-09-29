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
    { id: 'y3', output: '疫情防控重大决定性胜利', input: '人民至上、生命至上' },
    { id: 'y4', output: '脱贫攻坚成就', input: '一个都不能少的承诺' }
];

let currentMode = 'inverse';
let animating = false;

// Initialize
function init() {
    setupNav();
    renderCompositionInputs();
    renderInverseInputs();
    updateInsights('inverse');
    initMathLab();
    // 加载即演示一例
    const first = document.querySelector('#invInputList .list-item');
    if (first) runInverse(INV_DATA[0], first);
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
        card.style.borderLeftColor = '#FFB400';
        title.textContent = '复合运算';
        mathDef.textContent = '(g ∘ f)(x) = g(f(x))';
        desc.textContent = '把 f 的输出作为 g 的输入：(g∘f)(x) = g(f(x))，先做 f 再做 g。复合满足结合律，但一般不满足交换律：g∘f ≠ f∘g。';
        insight.textContent = '"一张蓝图绘到底"。从人民的愿景到国家战略，再到基层落实，这是一个环环相扣的执行链条。只有每个环节都精准衔接，才能将美好蓝图变为现实。';
    } else {
        card.style.borderLeftColor = '#D63B1D';
        title.textContent = '逆运算';
        mathDef.textContent = 'f⁻¹(y) = x ⟺ f(x) = y';
        desc.textContent = '只有双射才有逆函数：f⁻¹(y) = x ⟺ f(x) = y。且 f⁻¹∘f = I_A，f∘f⁻¹ = I_B；复合的逆「先脱鞋、后脱袜」：(g∘f)⁻¹ = f⁻¹∘g⁻¹。';
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

// ===== 数学验证：A = {1,2,3,4} 上的复合与逆 =====
const LAB_FUNCS = {
    s: { name: 's(x) = x mod 4 + 1（循环移位）', v: [2, 3, 4, 1] },
    r: { name: 'r(x) = 5 − x（反转）', v: [4, 3, 2, 1] },
    t: { name: 't：交换 1 和 2', v: [2, 1, 3, 4] },
    h: { name: 'h(x) = ⌈x/2⌉（非双射）', v: [1, 1, 2, 2] }
};
function initMathLab() {
    const fs = document.getElementById('labF'), gs = document.getElementById('labG');
    if (!fs) return;
    const opts = Object.entries(LAB_FUNCS).map(([k, o]) => `<option value="${k}">${o.name}</option>`).join('');
    fs.innerHTML = opts; gs.innerHTML = opts;
    fs.value = 's'; gs.value = 't';
    fs.addEventListener('change', renderMathLab);
    gs.addEventListener('change', renderMathLab);
    renderMathLab();
}
function inv(v) {
    if (new Set(v).size !== v.length) return null;
    const r = []; v.forEach((y, i) => { r[y - 1] = i + 1; }); return r;
}
function renderMathLab() {
    const f = LAB_FUNCS[document.getElementById('labF').value].v;
    const g = LAB_FUNCS[document.getElementById('labG').value].v;
    const X = [1, 2, 3, 4];
    const gf = X.map(x => g[f[x - 1] - 1]), fg = X.map(x => f[g[x - 1] - 1]);
    const fi = inv(f), gi = inv(g), gfi = inv(gf);
    const cell = v => v == null ? '<td class="na">—</td>' : `<td>${v}</td>`;
    const row = (lab, arr, cls) => `<tr class="${cls || ''}"><th>${lab}</th>${X.map((_, i) => cell(arr ? arr[i] : null)).join('')}</tr>`;
    const fiGi = fi && gi ? X.map(x => fi[gi[x - 1] - 1]) : null;
    const same = gfi && fiGi && gfi.every((v, i) => v === fiGi[i]);
    const comm = gf.every((v, i) => v === fg[i]);
    document.getElementById('labBody').innerHTML = `
        <div class="lab-table-wrap"><table class="lab-table">
            <tr><th>x</th>${X.map(x => `<th>${x}</th>`).join('')}</tr>
            ${row('f(x)', f)}${row('g(x)', g)}
            ${row('(g∘f)(x)', gf, 'hl')}${row('(f∘g)(x)', fg)}
            ${row('f⁻¹(x)', fi)}${row('g⁻¹(x)', gi)}
            ${row('(g∘f)⁻¹(x)', gfi, 'hl')}${row('(f⁻¹∘g⁻¹)(x)', fiGi, 'hl')}
        </table></div>
        <ul class="lab-notes">
            <li>${comm ? '本例 g∘f = f∘g（巧合）。' : 'g∘f ≠ f∘g：复合一般<b>不可交换</b>，顺序很重要。'}</li>
            <li>${fi ? 'f 是双射，f⁻¹ 存在。' : 'f 不是双射（有两个元素映到同一值），<b>f⁻¹ 不存在</b>。'}
                ${gi ? 'g 是双射，g⁻¹ 存在。' : 'g 不是双射，<b>g⁻¹ 不存在</b>。'}</li>
            <li>${same ? '<b class="ok">验证成立：(g∘f)⁻¹ = f⁻¹∘g⁻¹</b>（注意不是 g⁻¹∘f⁻¹）。' : 'g∘f 不是双射，(g∘f)⁻¹ 不存在——双射是可逆的前提。'}</li>
        </ul>`;
}

// Start
init();
