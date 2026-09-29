/**
 * 2.5 集合的划分与覆盖 · 进阶层：划分与等价类
 * 工作组 = 子集，六个网格区域 = 全集 A。检查覆盖 / 划分；由分组诱导关系 R（x R y ⇔ 同组），
 * 检查自反、对称、传递，是等价关系时给出商集 A/R —— 体会「划分 ↔ 等价关系」一一对应。
 */

const $ = id => document.getElementById(id);
const modeBtns = document.querySelectorAll('.mode-btn');
const zoneItems = document.querySelectorAll('.zone-item');
const ZONES = [1, 2, 3, 4, 5, 6];
const ZONE_NAME = { 1: '红星社区', 2: '解放路', 3: '建设里', 4: '复兴苑', 5: '团结村', 6: '先锋岗' };
const TEAM_COLORS = ['#D63B1D', '#C98A00', '#2F7D57', '#8B5A2B'];   // 与本章 A 红 / B 金 / C 绿一致，第 4 组用赭石
const MAX_TEAMS = TEAM_COLORS.length;

const RULES = {
    street: { t: '同一条街道', blocks: [[1, 2, 6], [3, 4, 5]], d: 'x R y ⇔ x、y 位于同一条街道。' },
    mod3:   { t: '编号 mod 3 同余', blocks: [[1, 4], [2, 5], [3, 6]], d: 'x R y ⇔ x ≡ y (mod 3)。' },
    parity: { t: '编号奇偶相同', blocks: [[1, 3, 5], [2, 4, 6]], d: 'x R y ⇔ x ≡ y (mod 2)。' },
    overlap:{ t: '有重叠的覆盖', blocks: [[1, 2, 3], [3, 4, 5], [5, 6]], d: '三个工作组有交叉区域。' }
};

let currentMode = 'partition';
let teams = [];
let activeIdx = 0;
let ruleNote = '';

function setTeams(blocks) {
    teams = blocks.map((z, i) => ({ name: '工作组 ' + String.fromCharCode(65 + i), color: TEAM_COLORS[i], zones: z.slice() }));
    activeIdx = 0;
}
function hexToRgba(hex, a) { return 'rgba(' + parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16) + ',' + a + ')'; }
const setText = arr => arr.length ? '{' + arr.slice().sort((a, b) => a - b).join(', ') + '}' : '∅';

// ── 模式 ────────────────────────────────────────────────────
modeBtns.forEach(btn => btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.toggle('active', b === btn));
    currentMode = btn.dataset.mode;
    render();
}));

// ── 规则生成 ────────────────────────────────────────────────
document.querySelectorAll('.rule-btn').forEach(btn => btn.addEventListener('click', () => {
    const R = RULES[btn.dataset.rule];
    setTeams(R.blocks);
    ruleNote = '已按「' + R.t + '」分组：' + R.d;
    document.querySelectorAll('.rule-btn').forEach(b => b.classList.toggle('active', b === btn));
    render();
}));

// ── 工作组管理 ──────────────────────────────────────────────
$('teamList').addEventListener('click', e => {
    const b = e.target.closest('.team-card'); if (!b) return;
    activeIdx = +b.dataset.i; render();
});
$('addTeamBtn').addEventListener('click', () => {
    if (teams.length >= MAX_TEAMS) { ruleNote = '最多 ' + MAX_TEAMS + ' 个工作组（6 个区域已足够演示）。'; render(); return; }
    teams.push({ name: '工作组 ' + String.fromCharCode(65 + teams.length), color: TEAM_COLORS[teams.length], zones: [] });
    activeIdx = teams.length - 1;
    ruleNote = '';
    render();
});
$('delTeamBtn').addEventListener('click', () => {
    if (teams.length <= 1) { ruleNote = '至少保留一个工作组。'; render(); return; }
    teams.splice(activeIdx, 1);
    teams.forEach((t, i) => { t.name = '工作组 ' + String.fromCharCode(65 + i); t.color = TEAM_COLORS[i]; });
    activeIdx = Math.max(0, activeIdx - 1);
    ruleNote = '';
    render();
});
zoneItems.forEach(zone => zone.addEventListener('click', () => {
    const z = +zone.dataset.id, t = teams[activeIdx];
    t.zones = t.zones.includes(z) ? t.zones.filter(x => x !== z) : t.zones.concat(z);
    ruleNote = '';
    document.querySelectorAll('.rule-btn').forEach(b => b.classList.remove('active'));
    render();
}));

// ── 渲染 ────────────────────────────────────────────────────
function render() {
    $('teamList').innerHTML = teams.map((t, i) =>
        '<button type="button" class="team-card' + (i === activeIdx ? ' active' : '') + '" data-i="' + i + '">' +
        '<span class="team-color-dot" style="background:' + t.color + '"></span><span class="team-name">' + t.name + '</span>' +
        '<span class="team-count">' + setText(t.zones) + '</span></button>').join('');
    $('teamHint').textContent = ruleNote || '当前选中：' + teams[activeIdx].name + '。点地图区域可加入 / 移出该组。';

    zoneItems.forEach(zone => {
        const z = +zone.dataset.id, cover = teams.filter(t => t.zones.includes(z));
        const bg = zone.querySelector('.zone-bg');
        zone.querySelector('.zone-badges').innerHTML = cover.map(t => '<span class="team-badge" style="background:' + t.color + '" title="' + t.name + '"></span>').join('');
        zone.classList.toggle('conflict', cover.length > 1 && currentMode === 'partition');
        zone.classList.toggle('empty', cover.length === 0);
        if (cover.length === 1) {
            bg.style.background = hexToRgba(cover[0].color, .22);
            zone.style.borderColor = cover[0].color;
        } else if (cover.length > 1) {
            const c1 = cover[0].color, c2 = cover[1].color;
            bg.style.background = currentMode === 'partition'
                ? 'repeating-linear-gradient(45deg,' + hexToRgba(c1, .35) + ' 0 10px,' + hexToRgba(c2, .35) + ' 10px 20px)'
                : 'linear-gradient(135deg,' + hexToRgba(c1, .3) + ',' + hexToRgba(c2, .3) + ')';
            zone.style.borderColor = currentMode === 'partition' ? '#C0392B' : '#1F9D55';
        } else {
            bg.style.background = 'transparent';
            zone.style.borderColor = '';
        }
    });
    validate();
    renderRelation();
}

function validate() {
    const covered = ZONES.filter(z => teams.some(t => t.zones.includes(z)));
    const missing = ZONES.filter(z => !covered.includes(z));
    const overlap = ZONES.filter(z => teams.filter(t => t.zones.includes(z)).length > 1);
    const emptyTeams = teams.filter(t => !t.zones.length);
    $('coverageBar').style.width = (covered.length / 6 * 100) + '%';
    $('coverageBar').style.backgroundColor = covered.length === 6 ? '#1F9D55' : '#FFB400';
    $('coverageText').textContent = covered.length + '/6';

    const banner = $('statusBanner'), icon = document.querySelector('.status-icon');
    let cls, ic, txt;
    if (currentMode === 'partition') {
        $('stageTitle').textContent = '社区网格地图';
        if (missing.length) { cls = 'info'; ic = 'ℹ️'; txt = '漏：区域 ' + missing.join('、') + ' 无人负责——不是覆盖，更不是划分。'; }
        else if (overlap.length) { cls = 'error'; ic = '⚠️'; txt = '重：区域 ' + overlap.join('、') + ' 被多个组同时负责——是覆盖，但不是划分。'; }
        else if (emptyTeams.length) { cls = 'error'; ic = '⚠️'; txt = emptyTeams.map(t => t.name).join('、') + ' 为空块，划分要求每块非空。'; }
        else { cls = 'success'; ic = '✅'; txt = '是划分：非空、并为全集、两两不交——每个区域恰好属于一个工作组。'; }
        $('szTitle').textContent = '网格化治理 · 不重不漏';
        $('szDesc').textContent = '划分要求每个区域有且只有一个责任主体：既不留「三不管」空白，也不出现多头管理。基层网格化治理追求的正是这种清晰的责任划分。';
    } else {
        $('stageTitle').textContent = '便民服务网络';
        if (missing.length) { cls = 'info'; ic = 'ℹ️'; txt = '服务缺位：区域 ' + missing.join('、') + ' 尚未覆盖。'; }
        else { cls = 'success'; ic = '✅'; txt = '已全覆盖' + (overlap.length ? '（区域 ' + overlap.join('、') + ' 有多项服务叠加，覆盖允许重叠）' : '，且恰好没有重叠——这时覆盖也是划分') + '。'; }
        $('szTitle').textContent = '服务全覆盖 · 一个不少';
        $('szDesc').textContent = '覆盖只要求「不漏」：民生服务可以叠加，但不能让任何区域缺位。覆盖与划分的差别就在是否允许重叠。';
    }
    banner.className = 'status-banner ' + cls;
    icon.textContent = ic;
    $('statusText').textContent = txt;
}

function renderRelation() {
    const R = (x, y) => teams.some(t => t.zones.includes(x) && t.zones.includes(y));
    let refl = true, trans = true, badTrans = null, badRefl = [];
    ZONES.forEach(x => { if (!R(x, x)) { refl = false; badRefl.push(x); } });
    ZONES.forEach(x => ZONES.forEach(y => ZONES.forEach(z => {
        if (trans && R(x, y) && R(y, z) && !R(x, z)) { trans = false; badTrans = [x, y, z]; }
    })));
    let head = '<tr><th></th>' + ZONES.map(y => '<th>' + y + '</th>').join('') + '</tr>';
    let body = ZONES.map(x => '<tr><th>' + x + '</th>' + ZONES.map(y => {
        const v = R(x, y), team = teams.find(t => t.zones.includes(x) && t.zones.includes(y));
        return '<td class="' + (v ? 'on' : '') + (x === y && !v ? ' miss' : '') + '" style="' + (v && team ? 'background:' + hexToRgba(team.color, .28) : '') + '">' + (v ? 1 : 0) + '</td>';
    }).join('') + '</tr>').join('');
    $('eqMatrix').innerHTML = '<table>' + head + body + '</table>';

    const chk = (ok, name, desc) => '<div class="' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? '✓' : '×') + '</b><span><strong>' + name + '</strong>　' + desc + '</span></div>';
    $('eqChecks').innerHTML =
        chk(refl, '自反性', refl ? '每个区域都与自己同组' : '区域 ' + badRefl.join('、') + ' 不属于任何组，(x, x) ∉ R') +
        chk(true, '对称性', '同组关系天然对称：x 与 y 同组 ⇔ y 与 x 同组') +
        chk(trans, '传递性', trans ? 'x R y 且 y R z ⇒ x R z' : badTrans[0] + ' R ' + badTrans[1] + '，' + badTrans[1] + ' R ' + badTrans[2] + '，但 ' + badTrans[0] + ' 与 ' + badTrans[2] + ' 不同组（重叠区域造成）');
    if (refl && trans) {
        const classes = [];
        ZONES.forEach(x => { const c = ZONES.filter(y => R(x, y)); if (!classes.some(k => k.join() === c.join())) classes.push(c); });
        $('eqQuotient').innerHTML = '<p><b>R 是等价关系</b>，等价类：' + ZONES.map(x => '[' + x + '] = ' + setText(ZONES.filter(y => R(x, y)))).join('；') + '。</p>' +
            '<p class="q">商集 A/R = {' + classes.map(setText).join(', ') + '}，恰好就是这组工作组构成的划分。</p>';
    } else {
        $('eqQuotient').innerHTML = '<p>R 不是等价关系，因此没有商集。只有<b>划分</b>才能诱导出等价关系；反过来，每个等价关系的全部等价类也构成一个划分。</p>';
    }
}

$('resetBtn').addEventListener('click', () => {
    currentMode = 'partition';
    modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === 'partition'));
    setTeams(RULES.mod3.blocks);
    ruleNote = '已按「编号 mod 3 同余」分组：' + RULES.mod3.d;
    document.querySelectorAll('.rule-btn').forEach(b => b.classList.toggle('active', b.dataset.rule === 'mod3'));
    render();
});

// 初始化：展示 mod 3 同余诱导的划分
$('resetBtn').click();
