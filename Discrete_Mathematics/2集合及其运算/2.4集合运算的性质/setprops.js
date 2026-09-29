/**
 * 2.4 集合运算的性质 · 进阶层：分配与德摩根律
 * 「真理天平」：选定律 → 构造 A、B、C（点选或拖放）→ 称一称：两端结果相等则天平平衡，否则向元素多的一端倾斜；
 * 成员表逐元素证明；「化简演练」逐步用定律化简表达式。
 */

const $ = id => document.getElementById(id);
const U = ['worker', 'farmer', 'soldier', 'scholar'];
const ICON = { worker: '👷', farmer: '🌾', soldier: '🪖', scholar: '🎓' };
const NAME = { worker: '工人', farmer: '农民', soldier: '军人', scholar: '知识分子' };

const LAWS = {
    dist1:  { name: '分配律 ①', L: 'A ∩ ( B ∪ C )', R: '( A ∩ B ) ∪ ( A ∩ C )', f: (a, b, c) => [a && (b || c), (a && b) || (a && c)],
              t: '落细落实', d: '∩ 对 ∪ 分配：对「B 或 C」提出的整体要求 A，等于分别落实到 B、C 再汇总。整体部署要落到每个具体部分。' },
    dist2:  { name: '分配律 ②', L: 'A ∪ ( B ∩ C )', R: '( A ∪ B ) ∩ ( A ∪ C )', f: (a, b, c) => [a || (b && c), (a || b) && (a || c)],
              t: '落细落实', d: '∪ 对 ∩ 也可分配——与数的运算不同，集合的两种分配律同时成立，这是集合代数的对称之美。' },
    dm1:    { name: '德摩根律 ①', L: '~( A ∪ B )', R: '~A ∩ ~B', f: (a, b) => [!(a || b), !a && !b],
              t: '辩证转化', d: '「既不属于 A、也不属于 B」等于「不属于 A 且不属于 B」：否定一个整体，要否定每个部分，同时 ∪ 与 ∩ 互换。' },
    dm2:    { name: '德摩根律 ②', L: '~( A ∩ B )', R: '~A ∪ ~B', f: (a, b) => [!(a && b), !a || !b],
              t: '辩证转化', d: '「并非同时属于 A 与 B」等于「不属于 A 或不属于 B」。否定的对象变了，联结词也要随之改变。' },
    abs1:   { name: '吸收律 ①', L: 'A ∪ ( A ∩ B )', R: 'A', f: (a, b) => [a || (a && b), a],
              t: '统筹包容', d: 'A ∩ B 本来就在 A 之中，并进来不会增加任何元素——局部已被整体涵盖，统筹时无需重复计入。' },
    abs2:   { name: '吸收律 ②', L: 'A ∩ ( A ∪ B )', R: 'A', f: (a, b) => [a && (a || b), a],
              t: '统筹包容', d: 'A 总是 A ∪ B 的子集，二者取交仍是 A。抓住核心 A，外围的扩展不改变核心。' },
    commU:  { name: '交换律', L: 'A ∪ B', R: 'B ∪ A', f: (a, b) => [a || b, b || a],
              t: '平等协作', d: '顺序不影响结果：参与合作的各方地位平等，不分先后。' },
    assocU: { name: '结合律', L: '( A ∪ B ) ∪ C', R: 'A ∪ ( B ∪ C )', f: (a, b, c) => [(a || b) || c, a || (b || c)],
              t: '统一部署', d: '先合并哪两组都一样，整体结果不变：分组方式可以灵活，目标和总量保持一致。' },
    idem:   { name: '幂等律', L: 'A ∪ A', R: 'A', f: a => [a || a, a],
              t: '重在落实', d: '把同一个集合并上自己不会多出元素——反复强调同一件事不会凭空增加内容，贵在落实。' },
    double: { name: '双重否定律', L: '~(~ A )', R: 'A', f: a => [!!a, a],
              t: '否定之否定', d: '补集的补集回到原集合：两次否定回到出发点。' },
    contra: { name: '矛盾律', L: 'A ∩ ~A', R: '∅', f: a => [a && !a, false],
              t: '判断一致', d: '没有元素能既属于 A 又不属于 A：同一标准下的判断必须前后一致。' },
    excl:   { name: '排中律', L: 'A ∪ ~A', R: 'U', f: a => [a || !a, true],
              t: '标准清晰', d: '在确定的全集中，任一元素要么属于 A，要么不属于 A——前提是 A 的标准清晰（集合的确定性）。' },
    ident:  { name: '同一律', L: 'A ∪ ∅', R: 'A', f: a => [a || false, a],
              t: '保持本色', d: '并上空集不改变 A：没有实质内容的「加法」不会带来任何变化。' },
    zero:   { name: '零律', L: 'A ∪ U', R: 'U', f: a => [a || true, true],
              t: '融入大局', d: '任何集合与全集的并都是全集：局部融入整体，整体始终完整。' },
    fake:   { name: '⚠ 常见错误', L: 'A ∪ ( B ∩ C )', R: '( A ∪ B ) ∩ C', f: (a, b, c) => [a || (b && c), (a || b) && c], fake: true,
              t: '一个反例就够', d: '括号不能随意移动：只要找到一个元素两端归属不同，等式就不成立。试着让 A 中含有 C 之外的元素。' }
};

const SIMPS = {
    s1: [['(A ∪ B) ∩ (A ∪ ~B)', '原式', (a, b) => (a || b) && (a || !b)],
         ['A ∪ (B ∩ ~B)', '分配律（∪ 对 ∩，逆用）', (a, b) => a || (b && !b)],
         ['A ∪ ∅', '矛盾律 B ∩ ~B = ∅', a => a],
         ['A', '同一律', a => a]],
    s2: [['~(~A ∩ ~B) ∩ A', '原式', (a, b) => !(!a && !b) && a],
         ['(~~A ∪ ~~B) ∩ A', '德摩根律', (a, b) => (a || b) && a],
         ['(A ∪ B) ∩ A', '双重否定律', (a, b) => (a || b) && a],
         ['A', '吸收律（及交换律）', a => a]],
    s3: [['~(A ∪ B) ∪ (~A ∩ B)', '原式', (a, b) => !(a || b) || (!a && b)],
         ['(~A ∩ ~B) ∪ (~A ∩ B)', '德摩根律', (a, b) => (!a && !b) || (!a && b)],
         ['~A ∩ (~B ∪ B)', '分配律（∩ 对 ∪，逆用）', (a, b) => !a && (!b || b)],
         ['~A ∩ U', '排中律 ~B ∪ B = U', a => !a],
         ['~A', '同一律 X ∩ U = X', a => !a]]
};

let sets = { A: ['worker', 'farmer'], B: ['farmer', 'soldier'], C: ['soldier', 'scholar'] };
let currentLaw = 'dist1', simpStep = 1, draggedType = null;

const fmt = arr => arr.length ? '{' + U.filter(x => arr.includes(x)).map(x => ICON[x]).join(' ') + '}' : '∅';
const mem = (x, S) => sets[S].includes(x);
function evalLaw(law) {
    const L = [], R = [];
    U.forEach(x => { const r = law.f(mem(x, 'A'), mem(x, 'B'), mem(x, 'C')); if (r[0]) L.push(x); if (r[1]) R.push(x); });
    return { L, R, eq: L.length === R.length && L.every(x => R.includes(x)) };
}

// ── 定律按钮 ────────────────────────────────────────────────
$('lawSelector').innerHTML = Object.keys(LAWS).map(k =>
    '<button type="button" class="apple-btn law-btn' + (k === currentLaw ? ' active' : '') + (LAWS[k].fake ? ' fake' : '') + '" data-law="' + k + '"><span class="law-name">' + LAWS[k].name + '</span></button>').join('');
$('lawSelector').addEventListener('click', e => {
    const b = e.target.closest('.law-btn'); if (!b) return;
    currentLaw = b.dataset.law;
    document.querySelectorAll('.law-btn').forEach(x => x.classList.toggle('active', x === b));
    renderLaw();
});

// ── 天平盘内容 ──────────────────────────────────────────────
function panHtml(expr) {
    return expr.split(' ').map(tok => {
        const m = tok.match(/^(~?)([ABC])$/);
        if (m) return (m[1] ? '<span class="op-symbol">~</span>' : '') + '<div class="set-slot" data-slot="' + m[2] + '">' + m[2] + '</div>';
        if (tok === 'U' || tok === '∅') return '<div class="set-slot filled fixed">' + (tok === 'U' ? 'U' : '∅') + '</div>';
        return '<span class="op-symbol">' + tok + '</span>';
    }).join('');
}

function renderLaw() {
    const law = LAWS[currentLaw];
    $('lawTitle').textContent = law.name + '：' + law.L.replace(/\( /g, '(').replace(/ \)/g, ')') + ' = ' + law.R.replace(/\( /g, '(').replace(/ \)/g, ')') + (law.fake ? '　？' : '');
    $('leftEq').textContent = '左端';
    $('rightEq').textContent = '右端';
    document.querySelector('#leftPan .pan-content').innerHTML = panHtml(law.L);
    document.querySelector('#rightPan .pan-content').innerHTML = panHtml(law.R);
    $('szTitle').textContent = law.t;
    $('szDesc').textContent = law.d;
    bindSlots();
    refresh();
}

function refresh() {
    document.querySelectorAll('.set-slot[data-slot]').forEach(slot => {
        const S = slot.dataset.slot;
        slot.classList.toggle('filled', sets[S].length > 0);
        slot.textContent = S + (sets[S].length ? ' ' + sets[S].map(x => ICON[x]).join('') : ' ∅');
    });
    renderTable();
    renderProof();
    resetVerification();
}

function renderTable() {
    $('memberTable').innerHTML = '<table><thead><tr><th>元素</th><th>A</th><th>B</th><th>C</th></tr></thead><tbody>' +
        U.map(x => '<tr><td>' + ICON[x] + ' ' + NAME[x] + '</td>' + ['A', 'B', 'C'].map(S => {
            const on = mem(x, S);
            return '<td><button type="button" class="tg' + (on ? ' on' : '') + '" data-x="' + x + '" data-s="' + S + '" aria-pressed="' + on + '" aria-label="' + NAME[x] + (on ? ' ∈ ' : ' ∉ ') + S + '">' + (on ? '∈' : '∉') + '</button></td>';
        }).join('') + '</tr>').join('') + '</tbody></table>';
}
$('memberTable').addEventListener('click', e => {
    const b = e.target.closest('.tg'); if (!b) return;
    const S = b.dataset.s, x = b.dataset.x;
    sets[S] = mem(x, S) ? sets[S].filter(y => y !== x) : sets[S].concat(x);
    refresh();
});

function renderProof() {
    const law = LAWS[currentLaw], r = evalLaw(law);
    const rows = U.map(x => {
        const v = law.f(mem(x, 'A'), mem(x, 'B'), mem(x, 'C')), ok = !!v[0] === !!v[1];
        const c = b => '<td class="' + (b ? 'y' : 'n') + '">' + (b ? '∈' : '∉') + '</td>';
        return '<tr' + (ok ? '' : ' class="bad-row"') + '><td>' + ICON[x] + ' ' + NAME[x] + '</td>' + c(mem(x, 'A')) + c(mem(x, 'B')) + c(mem(x, 'C')) + c(v[0]) + c(v[1]) + '<td class="' + (ok ? 'y' : 'bad') + '">' + (ok ? '✓' : '× 反例') + '</td></tr>';
    }).join('');
    $('proofPanel').innerHTML = '<div class="proof-head">成员表证明：对 U 中每个元素，看它在左、右两端的归属是否一致</div>' +
        '<div class="table-wrap"><table class="proof-table"><thead><tr><th>元素</th><th>A</th><th>B</th><th>C</th><th>左端</th><th>右端</th><th>一致</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<p class="proof-foot">' + (r.eq ? (law.fake ? '当前集合恰好没有反例——换一组集合（如让 A 含有 C 之外的元素）试试。' : '4 个元素全部一致。由于每个元素对 A、B、C 的归属只有 8 种组合，且每种组合下两端都相同，所以等式对任意集合成立。')
            : '出现反例，等式<b>不成立</b>。') + '</p>';
}

// ── 称一称 ──────────────────────────────────────────────────
const beam = document.querySelector('.scale-beam');
const leftPanEl = document.querySelector('.left-pan');
const rightPanEl = document.querySelector('.right-pan');
function tilt(deg) {
    beam.style.transform = 'rotate(' + deg + 'deg)';
    leftPanEl.style.transform = rightPanEl.style.transform = 'rotate(' + (-deg) + 'deg)';
}
function resetVerification() {
    $('verificationBadge').classList.add('hidden');
    $('leftResult').classList.add('hidden');
    $('rightResult').classList.add('hidden');
    $('leftPan').classList.remove('ok', 'no');
    $('rightPan').classList.remove('ok', 'no');
    tilt(-4);
}
$('verifyBtn').addEventListener('click', () => {
    const r = evalLaw(LAWS[currentLaw]);
    $('leftResult').textContent = '= ' + fmt(r.L);
    $('rightResult').textContent = '= ' + fmt(r.R);
    $('leftResult').classList.remove('hidden');
    $('rightResult').classList.remove('hidden');
    if (r.eq) tilt(0); else tilt(r.L.length > r.R.length ? -8 : r.L.length < r.R.length ? 8 : 5);
    ['leftPan', 'rightPan'].forEach(id => $(id).classList.add(r.eq ? 'ok' : 'no'));
    $('badgeText').textContent = r.eq ? '两端相等' : '两端不等：找到反例';
    $('verificationBadge').classList.toggle('bad', !r.eq);
    $('verificationBadge').classList.remove('hidden');
});

// ── 拖放到槽位 ───────────────────────────────────────────────
$('elementPool').addEventListener('dragstart', e => { const b = e.target.closest('.element-item'); if (b) { draggedType = b.dataset.type; e.dataTransfer.effectAllowed = 'copy'; } });
function bindSlots() {
    document.querySelectorAll('.set-slot[data-slot]').forEach(slot => {
        slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('highlight'); });
        slot.addEventListener('dragleave', () => slot.classList.remove('highlight'));
        slot.addEventListener('drop', e => {
            e.preventDefault(); slot.classList.remove('highlight');
            const S = slot.dataset.slot;
            if (draggedType && !mem(draggedType, S)) { sets[S] = sets[S].concat(draggedType); refresh(); }
            draggedType = null;
        });
    });
}

// ── 化简演练 ────────────────────────────────────────────────
function renderSimp() {
    const steps = SIMPS[$('simpSelect').value];
    simpStep = Math.max(1, Math.min(steps.length, simpStep));
    $('simpSteps').innerHTML = steps.map((s, i) => {
        const vals = U.filter(x => s[2](mem(x, 'A'), mem(x, 'B')));
        return '<li class="' + (i < simpStep ? (i === simpStep - 1 ? 'cur' : 'done') : 'todo') + '"><code>' + (i ? '= ' : '') + s[0] + '</code><span class="why">' + (i ? '（' + s[1] + '）' : '') + '</span>' +
            (i < simpStep ? '<span class="val">当前集合下 = ' + fmt(vals) + '</span>' : '') + '</li>';
    }).join('');
    $('simpPrev').disabled = simpStep <= 1;
    $('simpNext').disabled = simpStep >= steps.length;
}
$('simpSelect').addEventListener('change', () => { simpStep = 1; renderSimp(); });
$('simpPrev').addEventListener('click', () => { simpStep--; renderSimp(); });
$('simpNext').addEventListener('click', () => { simpStep++; renderSimp(); });

const refreshAll = () => { refresh(); renderSimp(); };
$('memberTable').addEventListener('click', renderSimp);
$('randomBtn').addEventListener('click', () => {
    ['A', 'B', 'C'].forEach(S => { sets[S] = U.filter(() => Math.random() < 0.5); });
    refreshAll();
});
$('resetBtn').addEventListener('click', () => {
    sets = { A: ['worker', 'farmer'], B: ['farmer', 'soldier'], C: ['soldier', 'scholar'] };
    currentLaw = 'dist1'; simpStep = 1; $('simpSelect').value = 's1';
    document.querySelectorAll('.law-btn').forEach(x => x.classList.toggle('active', x.dataset.law === 'dist1'));
    renderLaw(); renderSimp();
});

renderLaw();
renderSimp();
