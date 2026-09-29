/**
 * 2.3 集合运算 · 进阶层：复合运算
 * 全集 U（12 个主题词）中取集合 A、B，元素按「只属于 A / A∩B / 只属于 B / A、B 之外」四个区域排布；
 * 基本运算 ∪ ∩ A−B B−A ⊕ ~A 高亮结果区域与元素；复合表达式分步求值，辨析对称差、差的方向性、补依赖全集。
 */

const $ = id => document.getElementById(id);
const themeSelect = $('themeSelect');
const exprSelect = $('exprSelect');
const operationBtns = document.querySelectorAll('.operation-btn');
const setASlider = $('setASlider');
const setBSlider = $('setBSlider');
const elementsGroup = $('elementsGroup');
const exprPanel = $('exprPanel');

const themes = {
    revolutionary: ['自力更生', '艰苦奋斗', '勤俭节约', '实事求是', '团结协作', '开拓创新', '爱国主义', '集体主义', '为人民服务', '解放思想', '与时俱进', '清正廉洁'],
    development: ['创新驱动', '协调发展', '绿色发展', '开放合作', '共享成果', '科技强国', '生态文明', '共同富裕', '高质量发展', '乡村振兴', '区域协调', '数字中国'],
    culture: ['仁义礼智信', '诚信友善', '尊师重道', '敬老爱幼', '天人合一', '自强不息', '厚德载物', '知行合一', '修身齐家', '经世致用', '格物致知', '民为邦本']
};

const OPS = {
    union:        { t: 'A ∪ B', f: 'A ∪ B = {x | x ∈ A ∨ x ∈ B}', r: ['a', 'i', 'b'] },
    intersection: { t: 'A ∩ B', f: 'A ∩ B = {x | x ∈ A ∧ x ∈ B}', r: ['i'] },
    diffAB:       { t: 'A − B', f: 'A − B = {x | x ∈ A ∧ x ∉ B}', r: ['a'] },
    diffBA:       { t: 'B − A', f: 'B − A = {x | x ∈ B ∧ x ∉ A}', r: ['b'] },
    symmetric:    { t: 'A ⊕ B', f: 'A ⊕ B = (A − B) ∪ (B − A)', r: ['a', 'b'] },
    compA:        { t: '~A', f: '~A = U − A = {x | x ∈ U ∧ x ∉ A}', r: ['b', 'o'] }
};
const NOTES = {
    union: '并集：至少属于一个集合。两个集合的公共元素在并集中只出现一次。',
    intersection: '交集：同时属于两个集合，是二者的「最大公约数」。',
    diffAB: '差集有方向：A − B 只保留 A 独有的部分。试试 B − A，结果完全不同。',
    diffBA: '差集有方向：B − A 只保留 B 独有的部分，一般 A − B ≠ B − A。',
    symmetric: '对称差：恰好属于一个集合的元素。A ⊕ B = (A − B) ∪ (B − A) = (A ∪ B) − (A ∩ B)，且 A ⊕ B = B ⊕ A。',
    compA: '补集依赖全集：~A = U − A 包含「A、B 之外」的元素。换一个主题（全集），~A 就随之改变。'
};
// 复合表达式：每步 [说明, 表达式, 区域]
const EXPRS = {
    sym1: { t: '(A − B) ∪ (B − A)', steps: [['先算左括号', 'A − B', ['a']], ['再算右括号', 'B − A', ['b']], ['两部分取并', '(A − B) ∪ (B − A)', ['a', 'b']]],
        end: '结果与 A ⊕ B 完全相同——这正是对称差的定义。' },
    sym2: { t: '(A ∪ B) − (A ∩ B)', steps: [['先算被减数', 'A ∪ B', ['a', 'i', 'b']], ['再算减数', 'A ∩ B', ['i']], ['从并集中去掉交集', '(A ∪ B) − (A ∩ B)', ['a', 'b']]],
        end: '与上一个表达式结果相同：对称差的两种等价写法。' },
    dm: { t: '~(A ∪ B) 与 ~A ∩ ~B', steps: [['先算括号内', 'A ∪ B', ['a', 'i', 'b']], ['取补（相对 U）', '~(A ∪ B)', ['o']], ['另一边：~A', '~A', ['b', 'o']], ['另一边：~B', '~B', ['a', 'o']], ['求交', '~A ∩ ~B', ['o']]],
        end: '两边结果一致：~(A ∪ B) = ~A ∩ ~B（德摩根律，2.4 节）。注意 ~A ∩ ~B ≠ ~A ∪ ~B。' },
    absorb: { t: 'A − (A ∩ B) 与 A − B', steps: [['先算括号内', 'A ∩ B', ['i']], ['从 A 中去掉', 'A − (A ∩ B)', ['a']], ['对照 A − B', 'A − B', ['a']]],
        end: '两者相等：A − (A ∩ B) = A − B。从 A 里去掉「B 的部分」与去掉「A、B 公共部分」效果一样。' }
};

let U = [], A = [], B = [], seed = 1;
let currentOp = 'union', step = 0, timer = null;

function rng() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const has = (s, x) => s.includes(x);
function region(x) { return has(A, x) ? (has(B, x) ? 'i' : 'a') : (has(B, x) ? 'b' : 'o'); }
function members(regs) { return U.filter(x => regs.includes(region(x))); }
const setText = arr => arr.length ? '{' + arr.join(', ') + '}' : '∅';

function generateSets() {
    U = themes[themeSelect.value].slice();
    const a = +setASlider.value, b = +setBSlider.value;
    const overlap = Math.max(1, Math.floor(Math.min(a, b) / 2));
    const pool = shuffle(U);
    A = pool.slice(0, a);
    B = A.slice(0, overlap).concat(pool.slice(a, a + b - overlap));
    $('setACount').textContent = a;
    $('setBCount').textContent = b;
}

// 各区域的元素槽位（viewBox 760×440；A 圆心 (290,230)，B 圆心 (470,230)，r=160）
const SLOTS = {
    a: [[215, 150], [215, 196], [215, 242], [215, 288], [215, 334], [245, 104]],
    i: [[380, 190], [380, 235], [380, 280]],
    b: [[545, 150], [545, 196], [545, 242], [545, 288], [545, 334], [515, 104]],
    o: [[80, 70], [680, 70], [80, 380], [680, 380], [80, 150], [680, 150], [80, 300], [680, 300], [380, 44], [380, 404]]
};

function currentRegions() {
    if (exprSelect.value) { const E = EXPRS[exprSelect.value]; return step ? E.steps[step - 1][2] : []; }
    return OPS[currentOp].r;
}

function render() {
    const regs = currentRegions();
    ['a', 'b', 'i'].forEach(k => $('hl' + k.toUpperCase()).classList.toggle('on', regs.includes(k)));
    $('hlOut').classList.toggle('on', regs.includes('o'));
    const used = { a: 0, i: 0, b: 0, o: 0 };
    elementsGroup.innerHTML = U.map(x => {
        const r = region(x), p = SLOTS[r][used[r]++] || [380, 230];
        const w = x.length * 14 + 18, hot = regs.includes(r);
        return '<g class="element' + (hot ? ' highlighted' : '') + ' in-' + r + '" transform="translate(' + p[0] + ',' + p[1] + ')">' +
            '<rect class="element-pill" x="' + (-w / 2) + '" y="-14" width="' + w + '" height="28" rx="14"/>' +
            '<text class="element-text" dy=".35em">' + x + '</text><title>' + x + '</title></g>';
    }).join('');
    const res = members(regs);
    $('statU').textContent = U.length;
    $('statA').textContent = A.length;
    $('statB').textContent = B.length;
    $('statResult').textContent = res.length;
    if (exprSelect.value) renderExpr(res); else renderOp(res);
}

function renderOp(res) {
    const O = OPS[currentOp];
    $('stageTitle').textContent = O.t + ' = ' + setText(res);
    $('stageFormula').textContent = O.f;
    exprPanel.innerHTML = '<div class="expr-note"><b>' + O.t + '</b>：' + NOTES[currentOp] + '</div>' +
        '<div class="expr-sets"><span>A = ' + setText(U.filter(x => has(A, x))) + '</span><span>B = ' + setText(U.filter(x => has(B, x))) + '</span></div>';
}

function renderExpr(res) {
    const E = EXPRS[exprSelect.value];
    $('stageTitle').textContent = E.t;
    $('stageFormula').textContent = step ? E.steps[step - 1][1] + ' = ' + setText(res) : '点「下一步」开始分步求值';
    exprPanel.innerHTML = '<ol class="expr-steps">' + E.steps.map((s, i) => {
        const val = setText(members(s[2]));
        const cls = i + 1 === step ? 'cur' : (i + 1 < step ? 'done' : 'todo');
        return '<li class="' + cls + '"><span class="st-no">' + (i + 1) + '</span><span class="st-desc">' + s[0] + '</span><code>' + s[1] + '</code><span class="st-val">' + (i < step ? '= ' + val : '…') + '</span></li>';
    }).join('') + '</ol>' + (step === E.steps.length ? '<div class="expr-note ok">✓ ' + E.end + '</div>' : '');
}

function stopPlay() { if (timer) { clearInterval(timer); timer = null; } $('playBtn').textContent = '自动播放'; }
function maxStep() { return exprSelect.value ? EXPRS[exprSelect.value].steps.length : 0; }
function go(d) { if (!exprSelect.value) { exprSelect.value = 'sym1'; step = 0; operationBtns.forEach(b => b.classList.remove('active')); } step = Math.max(0, Math.min(maxStep(), step + d)); render(); }

operationBtns.forEach(btn => btn.addEventListener('click', () => {
    stopPlay();
    operationBtns.forEach(b => b.classList.toggle('active', b === btn));
    currentOp = btn.dataset.operation;
    exprSelect.value = '';
    render();
}));
exprSelect.addEventListener('change', () => {
    stopPlay();
    step = exprSelect.value ? 1 : 0;
    operationBtns.forEach(b => b.classList.toggle('active', !exprSelect.value && b.dataset.operation === currentOp));
    render();
});
$('prevBtn').addEventListener('click', () => { stopPlay(); go(-1); });
$('nextBtn').addEventListener('click', () => { stopPlay(); go(1); });
$('playBtn').addEventListener('click', () => {
    if (timer) { stopPlay(); return; }
    if (!exprSelect.value) { exprSelect.value = 'sym1'; }
    if (step >= maxStep()) step = 0;
    operationBtns.forEach(b => b.classList.remove('active'));
    $('playBtn').textContent = '暂停';
    const ms = [0, 1600, 1100, 700, 400][+$('speedSlider').value];
    go(1);
    timer = setInterval(() => { if (step >= maxStep()) { stopPlay(); return; } go(1); }, ms);
});
$('speedSlider').addEventListener('input', () => { $('speedVal').textContent = $('speedSlider').value; });
themeSelect.addEventListener('change', () => { generateSets(); render(); });
[setASlider, setBSlider].forEach(s => s.addEventListener('input', () => { generateSets(); render(); }));
$('randomBtn').addEventListener('click', () => {
    seed = Math.floor(Math.random() * 233280);
    setASlider.value = 3 + Math.floor(Math.random() * 5);
    setBSlider.value = 3 + Math.floor(Math.random() * 5);
    generateSets();
    render();
});
$('resetBtn').addEventListener('click', () => {
    stopPlay();
    seed = 1; step = 0; currentOp = 'union';
    themeSelect.value = 'revolutionary'; exprSelect.value = '';
    setASlider.value = 5; setBSlider.value = 5; $('speedSlider').value = 2; $('speedVal').textContent = 2;
    operationBtns.forEach(b => b.classList.toggle('active', b.dataset.operation === 'union'));
    generateSets();
    render();
});

generateSets();
render();
