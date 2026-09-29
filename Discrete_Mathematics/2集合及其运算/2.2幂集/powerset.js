/**
 * 2.2 幂集 · 进阶层：幂集规模 2ⁿ
 * 勾选基础集合 A 的元素 → 按二进制编码 0…2ⁿ−1 列出全部子集（每位 1=取、0=不取），推导 |P(A)| = 2ⁿ；
 * 「组建工作专班」任务：按要求在幂集中找出对应子集。
 */

const checkboxes = document.querySelectorAll('.checkbox-item input');
const mobilizeBtn = document.getElementById('mobilizeBtn');
const resetBtn = document.getElementById('resetBtn');
const startMissionBtn = document.getElementById('startMissionBtn');
const subsetsContainer = document.getElementById('subsetsContainer');
const nValue = document.getElementById('nValue');
const powersetValue = document.getElementById('powersetValue');
const scoreValue = document.getElementById('scoreValue');
const missionBanner = document.getElementById('missionBanner');
const missionTarget = document.getElementById('missionTarget');
const deriveRow = document.getElementById('deriveRow');
const codeHead = document.getElementById('codeHead');
const pickInfo = document.getElementById('pickInfo');
const szTitle = document.getElementById('szTitle');
const szDesc = document.getElementById('szDesc');

const ORDER = ['worker', 'farmer', 'soldier', 'scholar'];
const ICON = { worker: '👷', farmer: '🌾', soldier: '🪖', scholar: '🎓' };
const NAME = { worker: '工人', farmer: '农民', soldier: '军人', scholar: '知识分子' };
const NAMED_COMBOS = {
    'farmer,worker': '工农联盟',
    'soldier,worker': '军民融合',
    'scholar,worker': '产学研结合',
    'farmer,scholar': '科技兴农',
    'farmer,soldier,worker': '工农兵',
    'farmer,scholar,worker': '科教兴国',
    'farmer,scholar,soldier,worker': '全体力量'
};
const MISSIONS = [
    { title: '巩固工农联盟：需要 {工人, 农民}', target: ['worker', 'farmer'] },
    { title: '推动科技兴农：需要 {农民, 知识分子}', target: ['farmer', 'scholar'] },
    { title: '推进军民融合：需要 {工人, 军人}', target: ['worker', 'soldier'] },
    { title: '抢险救灾先锋：只需要 {军人}', target: ['soldier'] },
    { title: '科教兴国专班：需要 {工人, 农民, 知识分子}', target: ['worker', 'farmer', 'scholar'] },
    { title: '全面动员：需要 A 中全部力量', target: 'ALL' }
];

let selected = [];
let subsets = [];          // 每项 { mask, members }
let isAnimating = false;
let currentMission = null;
let totalScore = 0;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const code = (mask, n) => Array.from({ length: n }, (_, i) => (mask >> i) & 1 ? '1' : '0').join('');
const setText = arr => arr.length ? '{' + arr.map(k => NAME[k]).join(', ') + '}' : '∅';
function comboTitle(members) {
    if (!members.length) return '空集 ∅';
    if (members.length === selected.length && members.length > 1) return 'A 本身';
    return NAMED_COMBOS[members.slice().sort().join(',')] || (members.length === 1 ? '单一力量' : '联合行动');
}

function readSelection() {
    selected = ORDER.filter(k => [...checkboxes].some(cb => cb.value === k && cb.checked));
    const n = selected.length;
    nValue.textContent = n;
    powersetValue.textContent = Math.pow(2, n);
    subsets = [];
    for (let m = 0; m < (1 << n); m++) subsets.push({ mask: m, members: selected.filter((_, i) => (m >> i) & 1) });
    // 推导条：每个元素两种选择，相乘
    deriveRow.innerHTML = n
        ? selected.map(k => '<div class="derive-chip"><span>' + ICON[k] + ' ' + NAME[k] + '</span><small>取 / 不取</small><b>× 2</b></div>').join('') +
          '<div class="derive-eq">= ' + Array(n).fill('2').join(' × ') + ' = 2<sup>' + n + '</sup> = <b>' + (1 << n) + '</b></div>'
        : '<div class="derive-eq">A = ∅ 时只有一个子集 ∅：2<sup>0</sup> = <b>1</b></div>';
    codeHead.innerHTML = n ? '编码位（从左到右）：' + selected.map(k => '<span>' + ICON[k] + NAME[k] + '</span>').join('') : '';
}

function boxHtml(s, n) {
    const full = n > 0 && s.members.length === n;
    return '<button type="button" class="subset-box' + (full ? ' full-set' : '') + (s.members.length === 0 ? ' empty-set' : '') + '" data-mask="' + s.mask + '">' +
        '<span class="subset-code">' + (n ? code(s.mask, n) : '—') + '</span>' +
        '<span class="subset-elements">' + (s.members.length ? s.members.map(k => '<span class="element-icon" title="' + NAME[k] + '">' + ICON[k] + '</span>').join('') : '<span class="empty-set-symbol">∅</span>') + '</span>' +
        '<span class="combo-title">' + comboTitle(s.members) + '</span></button>';
}

function renderAll() {
    const n = selected.length;
    subsetsContainer.innerHTML = subsets.map(s => boxHtml(s, n)).join('');
    subsetsContainer.querySelectorAll('.subset-box').forEach(b => b.classList.add('shown'));
}

async function animateAll() {
    if (isAnimating) return;
    isAnimating = true;
    mobilizeBtn.disabled = true;
    const n = selected.length;
    subsetsContainer.innerHTML = subsets.map(s => boxHtml(s, n)).join('');
    const boxes = subsetsContainer.querySelectorAll('.subset-box');
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].classList.add('shown');
        pickInfo.innerHTML = '生成第 ' + (i + 1) + ' / ' + boxes.length + ' 个子集：编码 <b>' + (n ? code(subsets[i].mask, n) : '—') + '</b> → ' + setText(subsets[i].members);
        await sleep(n >= 4 ? 120 : 220);
    }
    pickInfo.innerHTML = '共生成 <b>' + boxes.length + '</b> 个子集，恰好是 2<sup>' + n + '</sup>。每个 n 位 0/1 编码对应唯一一个子集，反之亦然。';
    isAnimating = false;
    mobilizeBtn.disabled = false;
}

function explainPick(s) {
    const n = selected.length;
    if (!n) { pickInfo.innerHTML = 'A = ∅，唯一的子集就是 ∅。'; return; }
    const parts = selected.map((k, i) => NAME[k] + ((s.mask >> i) & 1 ? '<b class="take">取</b>' : '<span class="skip">不取</span>'));
    pickInfo.innerHTML = '编码 <b>' + code(s.mask, n) + '</b>：' + parts.join('，') + ' → ' + setText(s.members) + '（' + comboTitle(s.members) + '）';
}

function startMission() {
    const available = MISSIONS.filter(m => m.target === 'ALL' ? selected.length > 0 : m.target.every(t => selected.includes(t)));
    missionBanner.classList.remove('hidden', 'success', 'warn');
    if (!available.length) {
        currentMission = null;
        missionBanner.classList.add('warn');
        missionTarget.textContent = '当前 A 中的力量不足以组建任何专班，请先勾选更多元素。';
        return;
    }
    let m = available[Math.floor(Math.random() * available.length)];
    if (available.length > 1 && currentMission && m.title === currentMission.title) m = available.find(x => x !== m);
    currentMission = m;
    missionTarget.textContent = m.title;
    szTitle.textContent = '精准调配';
    szDesc.textContent = '任务明确了需要哪些力量：在全部 ' + subsets.length + ' 种组合中找到恰好对应的那一个子集，多一个、少一个都不行。';
}

function checkMission(s, box) {
    if (!currentMission) return false;
    const target = currentMission.target === 'ALL' ? selected : currentMission.target;
    const ok = s.members.length === target.length && s.members.every(v => target.includes(v));
    if (ok) {
        box.classList.add('correct');
        missionBanner.classList.add('success');
        missionTarget.textContent = '任务完成：' + setText(s.members) + ' ✓';
        totalScore += 10;
        scoreValue.textContent = totalScore;
        currentMission = null;
        szTitle.textContent = '任务完成';
        szDesc.textContent = '你在 ' + subsets.length + ' 个子集中准确找到了「' + comboTitle(s.members) + '」。子集编码 ' + code(s.mask, selected.length) + ' 精确记录了每种力量的取舍。';
        setTimeout(() => box.classList.remove('correct'), 1600);
    } else {
        box.classList.add('wrong');
        missionTarget.textContent = currentMission.title + '　（' + setText(s.members) + ' 不对，再找找）';
        setTimeout(() => box.classList.remove('wrong'), 500);
    }
    return true;
}

subsetsContainer.addEventListener('click', e => {
    const box = e.target.closest('.subset-box');
    if (!box || isAnimating) return;
    const s = subsets[+box.dataset.mask];
    subsetsContainer.querySelectorAll('.subset-box').forEach(b => b.classList.toggle('picked', b === box));
    explainPick(s);
    checkMission(s, box);
});

checkboxes.forEach(cb => cb.addEventListener('change', () => {
    if (isAnimating) { cb.checked = !cb.checked; return; }
    currentMission = null;
    missionBanner.classList.add('hidden');
    readSelection();
    renderAll();
    pickInfo.textContent = '点任一子集，查看它的二进制编码含义。';
    szTitle.textContent = '统揽全局 · 不漏一隅';
    szDesc.textContent = selected.length + ' 种基础力量各有「参加 / 不参加」两种选择，组合出 ' + subsets.length + ' 种方案。n 每增加 1，方案数翻一倍——可能性空间增长极快，统筹谋划必须抓住主要矛盾。';
}));

mobilizeBtn.addEventListener('click', animateAll);
startMissionBtn.addEventListener('click', startMission);
resetBtn.addEventListener('click', () => {
    if (isAnimating) return;
    checkboxes.forEach(cb => { cb.checked = cb.value !== 'scholar'; });
    currentMission = null;
    missionBanner.classList.add('hidden');
    totalScore = 0;
    scoreValue.textContent = 0;
    readSelection();
    renderAll();
    pickInfo.textContent = '点任一子集，查看它的二进制编码含义。';
    szTitle.textContent = '统揽全局 · 不漏一隅';
    szDesc.textContent = '幂集把全部可能的力量组合纳入统一视野：每个子集是一种工作专班，一个都不遗漏，才能做到统筹兼顾。';
});

// 初始化：直接展示 3 元集合的全部 8 个子集
readSelection();
renderAll();
