/**
 * 2.1 集合概述 · 进阶层：子集与集合相等
 * 拖放（或点选后「放入 A / B」）构造两个集合，实时判定 A ⊆ B、B ⊆ A、A = B（外延公理）、真子集与空集。
 */

// ── DOM ───────────────────────────────────────────────────────
const elementPool     = document.getElementById('elementPool');
const setA            = document.getElementById('setA');
const setB            = document.getElementById('setB');
const setIntersect    = document.getElementById('setIntersect');
const notationDisplay = document.getElementById('notationDisplay');
const resultText      = document.getElementById('resultText');
const szTitle         = document.getElementById('szTitle');
const szDesc          = document.getElementById('szDesc');
const relList         = document.getElementById('relList');
const opLabel         = document.getElementById('opLabel');
const toA             = document.getElementById('toA');
const toB             = document.getElementById('toB');

const svgHlA   = document.getElementById('svgHlA');   // A − B 区域
const svgHlI   = document.getElementById('svgHlI');   // 公共区
const svgHlB   = document.getElementById('svgHlB');   // B − A 区域
const svgDragA = document.getElementById('svgDragA');
const svgDragB = document.getElementById('svgDragB');

// ── 数据 ──────────────────────────────────────────────────────
const ELEMENT_MAP = { worker: '👷', farmer: '🌾', soldier: '🪖', scholar: '🎓', youth: '🚩' };
const NAME_MAP    = { worker: '工人', farmer: '农民', soldier: '军人', scholar: '知识分子', youth: '青年' };
const PRESETS = {
    proper: { A: ['worker', 'farmer'], B: ['worker', 'farmer', 'scholar'] },
    equal:  { A: ['worker', 'farmer'], B: ['farmer', 'worker'] },
    empty:  { A: [], B: ['youth', 'soldier'] },
    cross:  { A: ['worker', 'soldier'], B: ['farmer', 'soldier', 'youth'] }
};

// 用数组保留加入顺序，便于演示「列举顺序不同仍是同一集合」
let listA = [];
let listB = [];
let picked = null;
let draggedType = null;

const has = (arr, x) => arr.includes(x);
const fmt = arr => arr.length ? '{' + arr.map(t => NAME_MAP[t]).join(', ') + '}' : '∅';

// ── 选择 / 放入 ───────────────────────────────────────────────
function pick(type) {
    picked = picked === type ? null : type;
    elementPool.querySelectorAll('.element-item').forEach(b => {
        const on = b.dataset.type === picked;
        b.classList.toggle('selected', on);
        b.setAttribute('aria-pressed', on);
    });
    toA.disabled = toB.disabled = !picked;
}

function addTo(which, type) {
    const list = which === 'A' ? listA : listB;
    if (!has(list, type)) list.push(type);
    update();
}

function removeFrom(type, where) {
    if (where !== 'B') listA = listA.filter(t => t !== type);
    if (where !== 'A') listB = listB.filter(t => t !== type);
    update();
}

elementPool.addEventListener('click', e => {
    const b = e.target.closest('.element-item');
    if (b) pick(b.dataset.type);
});
toA.addEventListener('click', () => { if (picked) addTo('A', picked); });
toB.addEventListener('click', () => { if (picked) addTo('B', picked); });

// ── 拖放 ──────────────────────────────────────────────────────
elementPool.addEventListener('dragstart', e => {
    const b = e.target.closest('.element-item');
    if (b) { draggedType = b.dataset.type; e.dataTransfer.effectAllowed = 'copy'; }
});

[setA, setB].forEach(zone => {
    const dragEl = zone.id === 'setA' ? svgDragA : svgDragB;
    zone.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; dragEl.style.opacity = '1'; });
    zone.addEventListener('dragleave', () => { dragEl.style.opacity = '0'; });
    zone.addEventListener('drop', e => {
        e.preventDefault();
        dragEl.style.opacity = '0';
        if (draggedType) { addTo(zone.id === 'setA' ? 'A' : 'B', draggedType); draggedType = null; }
    });
});

// ── 渲染 ──────────────────────────────────────────────────────
function renderSets() {
    const contentA = setA.querySelector('.set-content');
    const contentB = setB.querySelector('.set-content');
    contentA.innerHTML = '';
    contentB.innerHTML = '';
    setIntersect.innerHTML = '';
    [...new Set([...listA, ...listB])].forEach(type => {
        const inA = has(listA, type), inB = has(listB, type);
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'dropped-item';
        el.textContent = ELEMENT_MAP[type];
        const where = inA && inB ? 'both' : (inA ? 'A' : 'B');
        el.title = NAME_MAP[type] + '（点击移出' + (where === 'both' ? ' A 与 B' : ' ' + where) + '）';
        el.setAttribute('aria-label', el.title);
        el.addEventListener('click', () => removeFrom(type, where));
        (where === 'both' ? setIntersect : where === 'A' ? contentA : contentB).appendChild(el);
    });
}

function relations() {
    const AminusB = listA.filter(t => !has(listB, t));
    const BminusA = listB.filter(t => !has(listA, t));
    const AsubB = AminusB.length === 0;
    const BsubA = BminusA.length === 0;
    return { AminusB, BminusA, AsubB, BsubA, eq: AsubB && BsubA };
}

function row(ok, sym, text) {
    return '<div class="rel-row ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? '✓' : '×') + '</b><span class="rel-sym">' + sym + '</span><span>' + text + '</span></div>';
}

function update() {
    renderSets();
    const r = relations();
    notationDisplay.textContent = 'A = ' + fmt(listA) + '　B = ' + fmt(listB);

    relList.innerHTML =
        row(r.AsubB, 'A ⊆ B', r.AsubB ? (listA.length ? 'A 的每个元素都属于 B' : '空集是任何集合的子集') : '反例：' + r.AminusB.map(t => NAME_MAP[t]).join('、') + ' ∈ A 但 ∉ B') +
        row(r.BsubA, 'B ⊆ A', r.BsubA ? (listB.length ? 'B 的每个元素都属于 A' : '空集是任何集合的子集') : '反例：' + r.BminusA.map(t => NAME_MAP[t]).join('、') + ' ∈ B 但 ∉ A') +
        row(r.eq, 'A = B', r.eq ? '互为子集（外延公理）' : '至少一个方向不包含') +
        row(r.AsubB && !r.eq, 'A ⊊ B', r.AsubB && !r.eq ? 'A ⊆ B 且 A ≠ B' : (r.eq ? '相等时不是真子集' : 'A ⊄ B'));

    // 区域高亮：非空的差集区域就是反例所在
    svgHlA.style.opacity = r.AminusB.length ? '1' : '0';
    svgHlB.style.opacity = r.BminusA.length ? '1' : '0';
    svgHlI.style.opacity = r.eq && listA.length ? '1' : '0';

    let badge, label, title, desc;
    if (!listA.length && !listB.length) {
        badge = 'A = B = ∅';
        label = '两个集合都是空集：∅ = ∅，空集是唯一的。';
        title = '从零开始';
        desc = '拖入或点选元素开始构造集合。空集 ∅ 不含任何元素，却是一切集合的子集。';
    } else if (r.eq) {
        badge = 'A = B';
        label = 'A − B 与 B − A 都为空：A ⊆ B 且 B ⊆ A，所以 A = B（外延公理）。';
        title = '看实质，不看写法';
        desc = '外延公理：元素完全相同的集合就相等，与列举的顺序、次数无关。认识一个群体，要看它的实际构成，而不是排列和标签——这正是实事求是。';
    } else if (r.AsubB) {
        badge = listA.length ? 'A ⊊ B' : '∅ ⊆ B';
        label = listA.length ? 'A − B 为空，A ⊆ B；B − A 非空，所以 A 是 B 的真子集。' : 'A 为空集，没有任何元素能作为反例，所以 ∅ ⊆ B 恒成立。';
        title = '画出最大同心圆';
        desc = listA.length ? 'A 的每一位成员都在 B 中，B 又容纳了更多成员。统一战线就是在共同目标下不断扩大「同心圆」，把更多力量纳入进来。'
            : '∅ ⊆ B 对任何集合都成立：「没有反例」本身就是成立的理由。这也提醒我们：判断要以事实为据，而不是凭印象。';
    } else if (r.BsubA) {
        badge = 'B ⊊ A';
        label = 'B − A 为空，B ⊆ A；A − B 非空（红色区域中的元素就是 A ⊄ B 的反例）。';
        title = '画出最大同心圆';
        desc = 'B 的每一位成员都在 A 中。判断包含关系只需逐个核对元素：一个反例就足以否定 ⊆。';
    } else {
        badge = 'A ⊄ B，B ⊄ A';
        label = '两个差集都非空：各有对方没有的成员，谁也不包含谁。';
        title = '求同存异';
        desc = '互不包含的两个集合仍可能有公共元素（交集）。先找共同点，再尊重各自的差异，是求同存异的集合表达。';
    }
    resultText.textContent = badge;
    opLabel.textContent = label;
    szTitle.textContent = title;
    szDesc.textContent = desc;
}

function loadPreset(key) {
    listA = PRESETS[key].A.slice();
    listB = PRESETS[key].B.slice();
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === key));
    update();
}

document.querySelectorAll('.preset-btn').forEach(btn => btn.addEventListener('click', () => loadPreset(btn.dataset.preset)));
document.getElementById('clearA').addEventListener('click', () => { listA = []; update(); });
document.getElementById('clearB').addEventListener('click', () => { listB = []; update(); });
document.getElementById('resetBtn').addEventListener('click', () => { pick(null); picked = null; toA.disabled = toB.disabled = true; loadPreset('proper'); });

// ── 初始化：加载「真子集」示例，舞台不留空 ─────────────────────
loadPreset('proper');
