/* =============================================================================
 * set-layer.js —— 第2章 集合及其运算 · 基础层 / 拓展层统一交互引擎
 * 页面在引入本文件前声明：window.SET_LAYER = { kind: 'set_builder', level: 'basic' | 'extend' };
 * 页面骨架（见任一 *-basic.html）：侧栏 #slControls / #slResult / #slKnow，舞台 #slMission / #slLegend / #vizArea / #slExplain。
 * 案例单元的 kind 带 case 字段，舞台改由 case-flow.js 渲染六段式（#cfTop / #slSolve / #cfBottom）。
 * ========================================================================== */
(function () {
  'use strict';
  var CFG = window.SET_LAYER || {};
  var $ = function (id) { return document.getElementById(id); };
  function esc(x) { return String(x).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }

  /* ---------- 集合工具（用数组保序，便于按全集顺序展示） ---------- */
  function has(a, x) { return a.indexOf(x) >= 0; }
  function uniq(a) { var r = []; a.forEach(function (x) { if (!has(r, x)) r.push(x); }); return r; }
  function union() { var r = []; for (var i = 0; i < arguments.length; i++) r = r.concat(arguments[i]); return uniq(r); }
  function inter(a, b) { return a.filter(function (x) { return has(b, x); }); }
  function diff(a, b) { return a.filter(function (x) { return !has(b, x); }); }
  function same(a, b) { return a.length === b.length && a.every(function (x) { return has(b, x); }); }
  function subset(a, b) { return a.every(function (x) { return has(b, x); }); }
  function order(a, U) { return U ? U.filter(function (x) { return has(a, x); }) : a; }
  function setText(a, U) { a = order(uniq(a), U); return a.length ? '{' + a.join(', ') + '}' : '∅'; }
  function pill(t, cls, attrs) { return '<span class="pill ' + (cls || '') + '"' + (attrs || '') + '>' + esc(t) + '</span>'; }
  function pillBtn(t, cls, data) { return '<button type="button" class="pill ' + (cls || '') + '" ' + (data || '') + '>' + esc(t) + '</button>'; }
  function comb(n, k) { if (k < 0 || k > n) return 0; k = Math.min(k, n - k); var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
  function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function fmtNum(n) { return Number(n).toLocaleString('en-US'); }
  function sub(n) { return String(n).replace(/\d/g, function (d) { return '₀₁₂₃₄₅₆₇₈₉'[d]; }); }
  function frac(p, q) { var g = gcd(p, q) || 1; return (p / g) + '/' + (q / g); }
  function card(title, body, extra) { return '<div class="sl-card sl-pop"><h4>' + title + (extra ? ' <small>' + extra + '</small>' : '') + '</h4>' + body + '</div>'; }
  function slider(id, label, min, max, val) {
    return '<label class="sl-slider"><span>' + label + '：<b id="' + id + 'Val">' + val + '</b></span><input type="range" id="' + id + '" min="' + min + '" max="' + max + '" value="' + val + '"></label>';
  }
  function select(id, opts, label) {
    return (label ? '<label for="' + id + '">' + label + '</label>' : '') + '<select id="' + id + '" class="sl-select">' +
      opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select>';
  }
  function group(label, body) { return '<div class="control-group"><label>' + label + '</label>' + body + '</div>'; }
  function seg(name, opts, cur) {
    return '<div class="sl-seg" role="group">' + opts.map(function (o) {
      return '<button type="button" class="sl-btn' + (o[0] === cur ? ' on' : '') + '" data-act="' + name + '" data-v="' + o[0] + '" aria-pressed="' + (o[0] === cur) + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  }
  function val(id) { var e = $(id); return e ? e.value : null; }
  function num(id) { return +val(id); }
  function syncSliders() {
    document.querySelectorAll('#slControls input[type=range]').forEach(function (r) { var o = $(r.id + 'Val'); if (o) o.textContent = r.value; });
  }
  function setSeg(name, v) {
    document.querySelectorAll('[data-act="' + name + '"]').forEach(function (b) { var on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }

  /* ---------- 页面输出 ---------- */
  var ui = {
    viz: function (html) { var el = $('slViz') || $('vizArea'); el.innerHTML = html; },
    explain: function (html) { if (K && K.case && window.CaseFlow) { CaseFlow.read(html); } else { $('slExplain').innerHTML = html; } },
    result: function (formula, value, cls, extra) {
      $('slResult').innerHTML = '<div class="sl-formula">' + formula + '</div><span class="sl-value ' + (cls || '') + '">' + value + '</span>' + (extra ? '<p class="sl-extra">' + extra + '</p>' : '');
    }
  };

  /* ---------- 分步播放器 ---------- */
  var P = { step: 0, max: 0, timer: null };
  function playerHtml() {
    return '<div class="sl-player">' +
      '<button type="button" class="sl-btn ghost" data-act="p-prev">上一步</button>' +
      '<button type="button" class="sl-btn primary" data-act="p-next">下一步</button>' +
      '<button type="button" class="sl-btn" data-act="p-play">自动播放</button>' +
      '<label class="sl-slider sl-speed"><span>播放速度：<b id="pSpeedVal">2</b> 档</span><input type="range" id="pSpeed" min="1" max="4" value="2"></label>' +
      '<span class="sl-progress" id="pProg"></span></div>';
  }
  function pStop() { if (P.timer) { clearInterval(P.timer); P.timer = null; } var b = document.querySelector('[data-act="p-play"]'); if (b) b.textContent = '自动播放'; }
  function pAct(a) {
    if (a === 'p-prev') { pStop(); P.step = Math.max(0, P.step - 1); }
    else if (a === 'p-next') { pStop(); P.step = Math.min(P.max, P.step + 1); }
    else if (a === 'p-play') {
      if (P.timer) { pStop(); return; }
      if (P.step >= P.max) P.step = 0;
      var b = document.querySelector('[data-act="p-play"]'); if (b) b.textContent = '暂停';
      var ms = [0, 1400, 900, 550, 280][num('pSpeed') || 2];
      P.timer = setInterval(function () { if (P.step >= P.max) { pStop(); return; } P.step++; render(); }, ms);
    }
    render();
  }
  function pProg(txt) { var e = $('pProg'); if (e) e.textContent = txt || ('第 ' + P.step + ' / ' + P.max + ' 步'); }

  /* ---------- 三圆文氏图（2.7 / 2.8 案例共用） ---------- */
  function venn3(opt) {
    // opt: {labels:[A,B,C], names, elems:[{n,s:['A','B']}], lit:fn(e)->bool, dim:fn(e)->bool, region: fn(key)->bool (高亮区域)}
    var C = { A: [250, 150], B: [175, 275], C: [325, 275] }, R = 115;
    var REG = { A: [250, 90], B: [120, 318], C: [380, 318], AB: [185, 214], AC: [315, 214], BC: [250, 332], ABC: [250, 250], '': [250, 425] };
    var cols = { A: '214,59,29', B: '201,138,0', C: '47,125,87' };
    var groups = {};
    opt.elems.forEach(function (e) { var k = e.s.slice().sort().join(''); (groups[k] = groups[k] || []).push(e); });
    var svg = '<svg class="sl-svg" viewBox="0 0 500 450" role="img" aria-label="三集合文氏图">';
    svg += '<rect x="6" y="6" width="488" height="438" rx="18" fill="rgba(255,255,255,.55)" stroke="rgba(214,59,29,.2)"/>';
    svg += '<text x="22" y="30" font-size="14" fill="#6B4A38" font-weight="700">U</text>';
    ['A', 'B', 'C'].forEach(function (L) {
      svg += '<circle cx="' + C[L][0] + '" cy="' + C[L][1] + '" r="' + R + '" fill="rgba(' + cols[L] + ',.10)" stroke="rgba(' + cols[L] + ',.6)" stroke-width="2.5"/>';
    });
    if (opt.region) {
      // 用多边形采样近似高亮区域：逐像素块判断（8px 网格）
      var cells = '';
      for (var x = 10; x < 490; x += 8) for (var y = 10; y < 440; y += 8) {
        var inA = Math.hypot(x + 4 - C.A[0], y + 4 - C.A[1]) <= R, inB = Math.hypot(x + 4 - C.B[0], y + 4 - C.B[1]) <= R, inC = Math.hypot(x + 4 - C.C[0], y + 4 - C.C[1]) <= R;
        if (opt.region({ A: inA, B: inB, C: inC })) cells += 'M' + x + ' ' + y + 'h8v8h-8z';
      }
      if (cells) svg += '<path d="' + cells + '" fill="rgba(255,180,0,.42)" shape-rendering="crispEdges"/>';
    }
    svg += '<text x="250" y="24" text-anchor="middle" font-size="17" font-weight="800" fill="#B8321A">' + esc(opt.labels[0]) + '</text>';
    svg += '<text x="58" y="300" text-anchor="middle" font-size="17" font-weight="800" fill="#8a5d00">' + esc(opt.labels[1]) + '</text>';
    svg += '<text x="442" y="300" text-anchor="middle" font-size="17" font-weight="800" fill="#2F7D57">' + esc(opt.labels[2]) + '</text>';
    Object.keys(groups).forEach(function (k) {
      var arr = groups[k], c = REG[k] || REG[''];
      arr.forEach(function (e, i) {
        var off = i - (arr.length - 1) / 2, w = e.n.length * 14 + 14;
        var ex = c[0] + (k.length === 1 || k === '' ? off * 0 : off * (w + 4)), ey = c[1];
        if (k.length === 1 || k === '') { ey = c[1] + off * 28; ex = c[0]; }
        var lit = opt.lit && opt.lit(e), dim = opt.dim && opt.dim(e);
        svg += '<g opacity="' + (dim ? .28 : 1) + '"><rect x="' + (ex - w / 2) + '" y="' + (ey - 12) + '" width="' + w + '" height="24" rx="12" fill="' + (lit ? '#D63B1D' : 'rgba(255,255,255,.95)') + '" stroke="' + (lit ? '#B8321A' : 'rgba(116,55,31,.3)') + '" stroke-width="1.5"/>' +
          '<text x="' + ex + '" y="' + (ey + 4.5) + '" text-anchor="middle" font-size="12.5" font-weight="700" fill="' + (lit ? '#fff' : '#5b4136') + '">' + esc(e.n) + '</text></g>';
      });
    });
    return svg + '</svg>';
  }

  /* =======================================================================
   * 各 kind 定义：mission / badge / legend / know / controls / render / act
   * ===================================================================== */
  var KINDS = {};

  /* ---------- 2.1 基础层：集合与元素 ---------- */
  var U21 = ['2', '3', '4', '5', '8', '12', '月饼', '桂花', '灯谜', '诗词', '数据库', '传感器', 'AI模型', '卫星', '志愿者', '网格员'];
  var TAG21 = { '2': 'even num', '3': 'num', '4': 'even num', '5': 'num', '8': 'even num', '12': 'even num', '月饼': 'culture', '桂花': 'culture', '灯谜': 'culture', '诗词': 'culture', '数据库': 'tech', '传感器': 'tech', 'AI模型': 'tech', '卫星': 'tech', '志愿者': 'people', '网格员': 'people' };
  var PRED21 = {
    even: { t: 'x 是偶数', f: function (x) { return /even/.test(TAG21[x]); } },
    num: { t: 'x 是整数', f: function (x) { return /num/.test(TAG21[x]); } },
    culture: { t: 'x 是中秋习俗或意象', f: function (x) { return TAG21[x] === 'culture'; } },
    tech: { t: 'x 是信息技术产品', f: function (x) { return TAG21[x] === 'tech'; } },
    fuzzy: { t: 'x 很重要（模糊标准）', f: null }
  };
  KINDS.set_builder = {
    mission: '换一个谓词 P(x)，点选任意元素，说出它为什么 ∈ A 或 ∉ A；再试试「模糊标准」为什么构不成集合。',
    badge: '元素 ∈ / ∉ 集合',
    legend: [['#D63B1D', 'x ∈ A'], ['#f2ebe6', 'x ∉ A'], ['#FFB400', '当前点选']],
    know: ['集合的元素具有<b>确定性</b>（能判定 ∈ 或 ∉）、<b>互异性</b>（不重复计入）、<b>无序性</b>（与书写顺序无关）。',
      '<b>列举法</b>：A = {2, 4, 8}；<b>描述法</b>：A = {x ∈ U | P(x)}。',
      '空集 ∅ 不含任何元素；|A| 表示有限集 A 的元素个数。'],
    state: { pick: null, dup: false, shuffle: 0 },
    controls: function () {
      return group('谓词 P(x)', select('pred', Object.keys(PRED21).map(function (k) { return [k, PRED21[k].t]; }))) +
        group('全集规模', slider('uSize', '候选对象数 |U|', 8, 16, 12)) +
        group('互异性与无序性', '<label class="sl-check"><input type="checkbox" id="dup">记录单里出现重复元素</label>' +
          '<div class="sl-btn-row"><button type="button" class="sl-btn" data-act="shuffle">打乱书写顺序</button><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>');
    },
    act: function (a) { if (a === 'shuffle') this.state.shuffle++; },
    render: function () {
      var st = this.state, pk = val('pred'), P = PRED21[pk], U = U21.slice(0, num('uSize'));
      if (st.pick && !has(U, st.pick)) st.pick = null;
      st.dup = $('dup').checked;
      var fuzzy = !P.f;
      var A = fuzzy ? [] : U.filter(P.f);
      var inside = A.map(function (x) { return pillBtn(x, 'hot' + (st.pick === x ? ' picked' : ''), 'data-pick="' + esc(x) + '"'); }).join('');
      var outside = (fuzzy ? U : diff(U, A)).map(function (x) { return pillBtn(fuzzy ? x + ' ?' : x, (fuzzy ? 'warn' : 'muted') + (st.pick === x ? ' picked' : ''), 'data-pick="' + esc(x) + '"'); }).join('');
      var venn = '<div class="sl-venn-box"><div style="width:100%;max-width:640px;position:relative;border:2px dashed rgba(214,59,29,.25);border-radius:18px;padding:14px 14px 12px;background:rgba(255,255,255,.5)">' +
        '<div style="font-weight:800;color:#6B4A38;font-size:.85rem;margin-bottom:6px">全集 U（|U| = ' + U.length + '）</div>' +
        (fuzzy ? '' : '<div style="margin:0 auto 10px;max-width:420px;min-height:110px;border-radius:50%/42%;border:3px solid rgba(214,59,29,.55);background:rgba(214,59,29,.08);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px 34px;text-align:center"><div style="font-weight:800;color:#B8321A;margin-bottom:4px">A = {x ∈ U | ' + esc(P.t) + '}</div><div>' + (inside || '<span class="pill muted">∅（没有元素满足）</span>') + '</div></div>') +
        '<div style="text-align:center">' + outside + '</div></div></div>';
      var listed = A.slice();
      if (st.shuffle) { for (var i = listed.length - 1; i > 0; i--) { var j = (i * 7 + st.shuffle * 3) % (i + 1); var t = listed[i]; listed[i] = listed[j]; listed[j] = t; } }
      var records = A.slice(); if (st.dup && A.length) records = A.concat([A[0], A[A.length - 1]]);
      var reps = fuzzy ? card('不能写成集合', '<p>「很重要」因人而异，同一个对象有人认为 ∈、有人认为 ∉ —— 不满足<b>确定性</b>，因此不能构成集合。</p>') :
        '<div class="sl-grid2">' +
        card('列举法', '<div class="sl-set">A = {' + listed.join(', ') + '}</div>' + (st.shuffle ? '<p style="margin-top:6px">顺序打乱后仍是同一个集合（<b>无序性</b>）。</p>' : '')) +
        card('描述法', '<div class="sl-set">A = {x ∈ U | ' + esc(P.t) + '}</div><p style="margin-top:6px">|A| = ' + A.length + '</p>') + '</div>' +
        (st.dup && A.length ? card('记录单 → 集合', '<div class="sl-set">记录：' + records.join(', ') + '</div><div class="sl-set" style="margin-top:4px">集合：' + setText(records, U) + '</div><p style="margin-top:6px">重复出现的元素只计一次（<b>互异性</b>），所以 |A| 仍为 ' + A.length + '。</p>') : '');
      ui.viz(venn + reps);
      var pick = st.pick, msg = '点选任意元素，查看它与集合 A 的关系。';
      if (pick) {
        if (fuzzy) msg = '「' + esc(pick) + '」重要吗？标准不清，无法确定 ∈ 还是 ∉。';
        else msg = has(A, pick) ? '<b>' + esc(pick) + ' ∈ A</b>：P(' + esc(pick) + ') 为真，「' + esc(P.t.replace('x ', '')) + '」成立。' : '<b>' + esc(pick) + ' ∉ A</b>：P(' + esc(pick) + ') 为假。';
      }
      if (fuzzy) ui.result('P(x)：' + esc(P.t), '不构成集合', 'bad', msg);
      else ui.result('A = {x ∈ U | ' + esc(P.t) + '}', 'A = ' + setText(A, U), 'ok', msg);
      ui.explain(fuzzy ? '集合的第一要求是<b>确定性</b>：任给一个对象，必须能明确判定它属于还是不属于。换成「偶数」「信息技术产品」这类清晰谓词，集合就确定了。'
        : '共有 <b>' + A.length + '</b> 个元素满足「' + esc(P.t) + '」。拖动 |U| 滑块，全集变大，A 也可能随之变化——<b>描述法</b>中的谓词不变，但集合依赖于所取的全集 U。');
    },
    click: function (e) { var b = e.target.closest('[data-pick]'); if (b) { this.state.pick = b.dataset.pick; render(); } },
    reset: function () { this.state = { pick: null, dup: false, shuffle: 0 }; }
  };

  /* ---------- 2.1 拓展层：集合即数据与类型 ---------- */
  var ROWS = [
    { name: '张明', col: '计算机', svc: '助老' }, { name: '李华', col: '数学', svc: '支教' }, { name: '王芳', col: '计算机', svc: '支教' },
    { name: '张明', col: '计算机', svc: '支教' }, { name: '赵磊', col: '电子', svc: '助老' }, { name: '王芳', col: '计算机', svc: '助老' },
    { name: '陈静', col: '数学', svc: '助老' }, { name: '刘洋', col: '电子', svc: '支教' }
  ];
  var TYPES = {
    bool: { t: 'bool', set: '{true, false}', size: '2', has: function (v) { return v === 'true' || v === 'false'; } },
    Day: { t: 'Day（枚举）', set: '{Mon, Tue, …, Sun}', size: '7', has: function (v) { return /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.test(v); } },
    Weekend: { t: 'Weekend（枚举）', set: '{Sat, Sun}', size: '2', has: function (v) { return v === 'Sat' || v === 'Sun'; } },
    uint8: { t: 'uint8', set: '{0, 1, …, 255}', size: '256', has: function (v) { return /^\d+$/.test(v) && +v <= 255; } },
    int16: { t: 'int16', set: '{−32768, …, 32767}', size: '65536', has: function (v) { return /^-?\d+$/.test(v) && +v >= -32768 && +v <= 32767; } }
  };
  var VALUES = ['true', 'Sat', 'Mon', '0', '255', '256', '-1'];
  var DOCS = [
    { id: 'D1', t: '中秋诗词选读', tags: ['文化', '诗词'] }, { id: 'D2', t: '社区助老指南', tags: ['服务', '社区'] },
    { id: 'D3', t: '月饼制作非遗', tags: ['文化', '非遗'] }, { id: 'D4', t: 'AI 助教设计', tags: ['科技', '教育'] },
    { id: 'D5', t: '园林诗词赏析', tags: ['文化', '诗词', '园林'] }, { id: 'D6', t: '社区数字化治理', tags: ['科技', '社区'] }
  ];
  KINDS.data_type = {
    mission: '切换三种工程视角：数据库去重对应互异性，类型的合法值对应「∈」，标签检索对应描述法与运算。',
    badge: '集合 → 数据与程序',
    legend: [['#D63B1D', '属于结果集'], ['#1F9D55', '合法 / 成立'], ['#f2ebe6', '被排除']],
    know: ['数据库的表是记录的<b>多重集</b>（可重复），<code>SELECT DISTINCT</code> 把结果变成集合（互异性）。',
      '编程语言的<b>类型</b>可看作合法值的集合：值 v 合法 ⇔ v ∈ T；Weekend ⊆ Day 对应子类型关系。',
      '标签检索：满足条件的文档集合 = {d | P(d)}，多条件对应 ∩（AND）、∪（OR）、−（NOT）。'],
    controls: function () {
      return group('工程视角', seg('view', [['db', '数据库表'], ['type', '类型系统'], ['tag', '标签检索']], 'db')) +
        '<div id="viewCtl"></div>' +
        '<div class="sl-btn-row"><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>';
    },
    state: { view: 'db' },
    act: function (a, b) { if (a === 'view') { this.state.view = b.dataset.v; setSeg('view', b.dataset.v); this.viewCtl(); } },
    viewCtl: function () {
      var v = this.state.view, h = '';
      if (v === 'db') h = group('WHERE 条件', select('dbWhere', [['cs', "学院 = '计算机'"], ['old', "服务 = '助老'"], ['all', '（无条件）']])) +
        '<label class="sl-check"><input type="checkbox" id="distinct" checked>使用 DISTINCT 去重</label>';
      if (v === 'type') h = group('查看类型', select('ty', Object.keys(TYPES).map(function (k) { return [k, TYPES[k].t]; })));
      if (v === 'tag') h = group('检索式', select('tag1', [['文化', '文化'], ['科技', '科技'], ['社区', '社区'], ['诗词', '诗词']]) +
        select('tagOp', [['AND', 'AND（∩）'], ['OR', 'OR（∪）'], ['NOT', 'AND NOT（−）']]) + select('tag2', [['诗词', '诗词'], ['社区', '社区'], ['科技', '科技'], ['文化', '文化']]));
      $('viewCtl').innerHTML = h;
    },
    init: function () { this.viewCtl(); },
    render: function () {
      var v = this.state.view;
      if (v === 'db') {
        var w = val('dbWhere'), dis = $('distinct').checked;
        var rows = ROWS.filter(function (r) { return w === 'all' || (w === 'cs' ? r.col === '计算机' : r.svc === '助老'); });
        var names = rows.map(function (r) { return r.name; }), setN = uniq(names);
        var table = '<div class="sl-table-wrap"><table class="sl-table"><thead><tr><th>#</th><th>姓名</th><th>学院</th><th>服务</th><th>满足 WHERE</th></tr></thead><tbody>' +
          ROWS.map(function (r, i) { var ok = has(rows, r); return '<tr' + (ok ? ' class="cur"' : '') + '><td>' + (i + 1) + '</td><td class="l">' + r.name + '</td><td class="l">' + r.col + '</td><td class="l">' + r.svc + '</td><td class="' + (ok ? 'y' : 'n') + '">' + (ok ? '✓' : '·') + '</td></tr>'; }).join('') + '</tbody></table></div>';
        var sql = 'SELECT ' + (dis ? 'DISTINCT ' : '') + '姓名 FROM 志愿者报名表' + (w === 'all' ? '' : ' WHERE ' + (w === 'cs' ? "学院 = '计算机'" : "服务 = '助老'"));
        var out = dis ? setN : names;
        ui.viz(card('报名表（记录可重复）', table) + '<div class="sl-grid2">' + card('查询语句', '<div class="sl-set">' + esc(sql) + '</div>') +
          card('查询结果' + (dis ? '（集合）' : '（含重复）'), '<div>' + out.map(function (x) { return pill(x, dis ? 'hot' : 'warn'); }).join('') + '</div><p style="margin-top:6px">共 ' + out.length + ' 行</p>') + '</div>');
        ui.result(esc(sql), dis ? '{' + setN.join(', ') + '}' : out.length + ' 行（有重复）', dis ? 'ok' : '', dis ? 'DISTINCT 保证互异性：同一人多次报名只出现一次。' : '去掉 DISTINCT 后同名记录重复出现——这是多重集，不是集合。');
        ui.explain('WHERE 条件相当于<b>描述法</b>中的谓词 P(x)，DISTINCT 相当于集合的<b>互异性</b>。满足条件的记录有 ' + rows.length + ' 条，去重后得到 ' + setN.length + ' 个不同的人。');
      } else if (v === 'type') {
        var tk = val('ty'), T = TYPES[tk];
        var mat = '<div class="sl-table-wrap"><table class="sl-table"><thead><tr><th>值 v</th>' + Object.keys(TYPES).map(function (k) { return '<th' + (k === tk ? ' style="background:rgba(255,180,0,.32)"' : '') + '>' + TYPES[k].t.replace('（枚举）', '') + '</th>'; }).join('') + '</tr></thead><tbody>' +
          VALUES.map(function (x) { return '<tr><td>' + x + '</td>' + Object.keys(TYPES).map(function (k) { var ok = TYPES[k].has(x); return '<td class="' + (ok ? 'y' : 'n') + '">' + (ok ? '∈' : '∉') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
        var legal = VALUES.filter(T.has);
        ui.viz('<div class="sl-grid2">' + card('类型 = 合法值的集合', '<div class="sl-set">' + T.t + ' = ' + T.set + '</div><p style="margin-top:6px">|' + T.t.replace('（枚举）', '') + '| = ' + T.size + '</p>') +
          card('子类型 = 子集', '<div class="sl-set">Weekend ⊆ Day<br>uint8 ⊆ int16</div><p style="margin-top:6px">Weekend 的每个值都是合法的 Day，反之不然。</p>') + '</div>' +
          card('成员判定表：值 v 是否属于类型 T', mat));
        ui.result('v ∈ ' + T.t.replace('（枚举）', '') + ' ?', legal.length ? '合法值：' + legal.join(', ') : '示例值都不合法', 'ok', '赋值 x: T = v 能通过类型检查 ⇔ v ∈ T。');
        ui.explain('类型检查本质是成员判定：<b>256 ∉ uint8</b> 会溢出，<b>Mon ∉ Weekend</b> 会被编译器拒绝。子类型关系就是集合的包含关系 ⊆。');
      } else {
        var t1 = val('tag1'), op = val('tagOp'), t2 = val('tag2');
        var S1 = DOCS.filter(function (d) { return has(d.tags, t1); }).map(function (d) { return d.id; });
        var S2 = DOCS.filter(function (d) { return has(d.tags, t2); }).map(function (d) { return d.id; });
        var R = op === 'AND' ? inter(S1, S2) : op === 'OR' ? union(S1, S2) : diff(S1, S2);
        var sym = { AND: '∩', OR: '∪', NOT: '−' }[op], ids = DOCS.map(function (d) { return d.id; });
        ui.viz('<div class="sl-grid-auto">' + DOCS.map(function (d) { var on = has(R, d.id); return '<div class="sl-card sl-pop" style="' + (on ? 'border-color:#D63B1D;box-shadow:0 0 0 2px rgba(214,59,29,.25)' : 'opacity:.7') + '"><h4>' + d.id + ' <small>' + d.t + '</small></h4><div>' + d.tags.map(function (t) { return pill(t, on ? 'hot' : ''); }).join('') + '</div></div>'; }).join('') + '</div>' +
          '<div class="sl-grid3">' + card('S₁ = 含「' + t1 + '」', '<div class="sl-set">' + setText(S1, ids) + '</div>') + card('S₂ = 含「' + t2 + '」', '<div class="sl-set">' + setText(S2, ids) + '</div>') + card('结果 S₁ ' + sym + ' S₂', '<div class="sl-set">' + setText(R, ids) + '</div>') + '</div>');
        ui.result('「' + t1 + '」 ' + op + ' 「' + t2 + '」 = S₁ ' + sym + ' S₂', setText(R, ids), 'ok', '检索命中 ' + R.length + ' 篇文档。');
        ui.explain('每个标签定义一个文档集合；检索式中的 AND / OR / NOT 恰好是集合的交、并、差。' + (t1 === t2 ? '两个标签相同时，S₁ ∩ S₁ = S₁ ∪ S₁ = S₁（幂等），S₁ − S₁ = ∅。' : ''));
      }
    },
    reset: function () { this.state = { view: 'db' }; setSeg('view', 'db'); this.viewCtl(); }
  };

  /* ---------- 2.2 基础层：子集枚举 ---------- */
  function subsetsBySize(els) {
    var n = els.length, all = [];
    for (var m = 0; m < (1 << n); m++) { var s = els.filter(function (_, i) { return m & (1 << i); }); all.push(s); }
    all.sort(function (a, b) { return a.length - b.length || a.join('').localeCompare(b.join('')); });
    return all;
  }
  KINDS.subset_enum = {
    mission: '点「下一步」按元素个数从少到多逐个列出子集；数一数每一层有几个，最后看总数是不是 2ⁿ。',
    badge: '按大小逐层枚举',
    legend: [['#FFB400', '刚列出的子集'], ['#D63B1D', '已列出'], ['#1F9D55', '∅ 与 A 本身']],
    know: ['B ⊆ A：B 的每个元素都属于 A。∅ ⊆ A 与 A ⊆ A 对任何集合都成立。',
      '含 k 个元素的子集有 C(n, k) 个，按 k = 0,1,…,n 分层列举不重不漏。',
      'A 的全部子集构成<b>幂集</b> P(A)，|P(A)| = C(n,0)+…+C(n,n) = 2ⁿ（进阶层推导）。'],
    controls: function () {
      return group('集合 A', slider('n', '元素个数 n', 1, 4, 3) + '<p class="sl-hint">A 取 {a, b, c, d} 的前 n 个元素。</p>') +
        group('逐个列举', playerHtml()) +
        '<div class="sl-btn-row"><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>';
    },
    init: function () { P.step = 99; },
    onInput: function (e) { if (e.target.id === 'n') { pStop(); P.step = 99; } },
    render: function () {
      var n = num('n'), els = ['a', 'b', 'c', 'd'].slice(0, n), all = subsetsBySize(els);
      P.max = all.length; if (P.step > P.max) P.step = P.max;
      var shown = P.step, rows = '';
      for (var k = 0; k <= n; k++) {
        var cells = '', idxs = [];
        all.forEach(function (s, i) { if (s.length === k) idxs.push(i); });
        var doneInRow = idxs.filter(function (i) { return i < shown; }).length;
        idxs.forEach(function (i) {
          var s = all[i], txt = s.length ? '{' + s.join(', ') + '}' : '∅', cls = i >= shown ? 'pending' : (i === shown - 1 ? 'gold' : ((s.length === 0 || s.length === n) ? 'good' : 'hot'));
          var note = s.length === 0 ? '空集' : (s.length === n ? 'A 本身' : '');
          cells += '<div class="sl-cell ' + cls + '">' + (i < shown ? txt : '?') + (note && i < shown ? '<small>' + note + '</small>' : '') + '</div>';
        });
        rows += '<div class="sl-card sl-pop"><h4>含 ' + k + ' 个元素 <small>C(' + n + ', ' + k + ') = ' + comb(n, k) + ' 个 · 已列 ' + doneInRow + '</small></h4><div class="sl-cellgrid">' + cells + '</div></div>';
      }
      ui.viz(card('A = {' + els.join(', ') + '}', '<p>从 ∅ 开始，一层层加入元素。每一层内按字母顺序列出，保证不重不漏。</p>') + rows);
      pProg('已列出 ' + shown + ' / ' + all.length + ' 个子集');
      var done = shown === all.length;
      ui.result('|P(A)| = ' + [...Array(n + 1).keys()].map(function (k) { return 'C(' + n + ',' + k + ')'; }).join(' + '), done ? all.length + ' = 2^' + n : '已列出 ' + shown + ' 个', done ? 'ok' : '', shown ? '刚列出：' + (all[shown - 1].length ? '{' + all[shown - 1].join(', ') + '}' : '∅') : '点「下一步」开始列举。');
      ui.explain(done ? '全部列完：共 <b>' + all.length + '</b> 个子集，恰好是 2<sup>' + n + '</sup>。其中 <span class="ok">∅</span> 和 <span class="ok">A 本身</span> 都是 A 的子集，初学时最容易漏掉。' :
        '一个含 ' + n + ' 个元素的集合有多少个子集？先猜一个数，再逐个列出来验证。');
    },
    reset: function () { pStop(); P.step = 0; }
  };

  /* ---------- 2.2 拓展层：状态空间与特征选择 ---------- */
  var FEAT = ['年龄', '收入', '学历', '地区', '兴趣', '设备', '时段', '渠道'];
  KINDS.feature_space = {
    mission: '把特征数 n 调大，看 2ⁿ 如何爆炸；再限制最多选 k 个特征，看搜索空间缩小多少。下方再用位运算完成子集的并、交、对称差。',
    badge: '幂集 = 状态空间',
    legend: [['#D63B1D', '选中（位 = 1）'], ['#f2ebe6', '未选（位 = 0）'], ['#1F9D55', '运算结果']],
    know: ['n 个特征各「选 / 不选」，全部特征子集构成幂集，共 2ⁿ 种——这就是<b>组合爆炸</b>。',
      '限制最多选 k 个时，候选数为 C(n,0)+C(n,1)+…+C(n,k)，常用来缩小搜索空间。',
      '用 n 位二进制数（位掩码）表示子集：<code>S&amp;T</code> ↔ ∩，<code>S|T</code> ↔ ∪，<code>S^T</code> ↔ ⊕，<code>~S</code> ↔ 补集。'],
    controls: function () {
      return group('状态空间', slider('fn', '特征数 n', 1, 30, 12) + slider('fk', '最多选 k 个', 0, 30, 3)) +
        group('位运算：点特征切换 S / T', '<p class="sl-hint">在右侧舞台的两行按钮中点选特征。</p>') +
        '<div class="sl-btn-row"><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>';
    },
    state: { S: [0, 1, 3], T: [1, 2, 3, 5] },
    act: function (a, b) {
      if (a === 'bit') { var arr = this.state[b.dataset.set], i = +b.dataset.i; var p = arr.indexOf(i); if (p >= 0) arr.splice(p, 1); else arr.push(i); }
    },
    render: function () {
      var n = num('fn'), kEl = $('fk'); kEl.max = n; if (+kEl.value > n) kEl.value = n; syncSliders();
      var k = +kEl.value, total = Math.pow(2, n), lim = 0; for (var i = 0; i <= k; i++) lim += comb(n, i);
      var bars = [5, 10, 15, 20, 25, 30].map(function (m) { var w = (m / 30) * 100; return '<div class="sl-bar-row"><span>n = ' + m + '</span><div class="sl-bar"><span style="width:' + w + '%"></span></div><strong>' + fmtNum(Math.pow(2, m)) + '</strong></div>'; }).join('');
      var st = this.state, mask = function (a) { return FEAT.map(function (_, i) { return has(a, i) ? 1 : 0; }); };
      var S = st.S, T = st.T, row = function (name, arr) {
        return '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:4px 0"><b style="width:22px;color:#B8321A">' + name + '</b>' + FEAT.map(function (f, i) {
          return '<button type="button" class="sl-cell ' + (has(arr, i) ? 'hot' : 'muted') + '" style="min-height:44px;min-width:58px;flex:1 1 58px" data-act="bit" data-set="' + name + '" data-i="' + i + '">' + (has(arr, i) ? 1 : 0) + '<small>' + f + '</small></button>';
        }).join('') + '</div>';
      };
      var bits = function (a) { return mask(a).slice().reverse().join(''); };
      var names = function (a) { return a.length ? '{' + FEAT.filter(function (_, i) { return has(a, i); }).join(', ') + '}' : '∅'; };
      var all8 = FEAT.map(function (_, i) { return i; });
      var ops = [['S & T', 'S ∩ T', inter(S, T)], ['S | T', 'S ∪ T', union(S, T)], ['S ^ T', 'S ⊕ T', union(diff(S, T), diff(T, S))], ['~S', '~S', diff(all8, S)]];
      ui.viz('<div class="sl-grid3">' + card('全部特征子集', '<div class="sl-set" style="font-size:1.25rem;color:#B8321A">2^' + n + ' = ' + fmtNum(total) + '</div>') +
        card('最多选 ' + k + ' 个', '<div class="sl-set" style="font-size:1.25rem;color:#1F9D55">' + fmtNum(lim) + '</div>') +
        card('搜索空间缩小为', '<div class="sl-set" style="font-size:1.25rem">' + (total ? (lim / total * 100).toPrecision(3) : 0) + '%</div>') + '</div>' +
        card('组合爆炸：2ⁿ 随 n 增长', '<div class="sl-bars">' + bars + '</div><p style="margin-top:6px">条长按 n 线性画出，右侧数字却每 +1 翻一倍。n = 30 时已超过 10 亿种组合。</p>') +
        card('位掩码表示子集（8 个特征）', row('S', S) + row('T', T) +
          '<div class="sl-table-wrap" style="margin-top:8px"><table class="sl-table"><thead><tr><th>位运算</th><th>集合运算</th><th>掩码（高位在左）</th><th>对应特征子集</th></tr></thead><tbody>' +
          ops.map(function (o) { return '<tr><td>' + o[0] + '</td><td>' + o[1] + '</td><td>' + bits(o[2]) + '</td><td class="l">' + names(o[2]) + '</td></tr>'; }).join('') + '</tbody></table></div>'));
      ui.result('Σ C(' + n + ', i), i = 0…' + k, fmtNum(lim) + ' / ' + fmtNum(total), 'ok', 'S = ' + bits(S) + '₂，T = ' + bits(T) + '₂');
      ui.explain('特征选择要在 <b>2<sup>' + n + '</sup></b> 个子集里找最优，穷举代价随 n 指数增长。限制子集大小（k ≤ ' + k + '）、贪心或启发式搜索，都是在幂集这个巨大空间里「抓主要矛盾」。');
    },
    reset: function () { this.state = { S: [0, 1, 3], T: [1, 2, 3, 5] }; }
  };

  /* ---------- 2.3 基础层：并交差补 ---------- */
  var U23 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], A23 = ['1', '2', '3', '5', '8'], B23 = ['2', '4', '5', '6', '8'];
  var REG23 = { a: diff(A23, B23), ab: inter(A23, B23), b: diff(B23, A23), o: diff(U23, union(A23, B23)) };
  var OPS23 = {
    union: { t: 'A ∪ B', f: '{x | x∈A ∨ x∈B}', r: ['a', 'ab', 'b'], d: '属于 A <b>或</b> 属于 B（至少属于一个）' },
    inter: { t: 'A ∩ B', f: '{x | x∈A ∧ x∈B}', r: ['ab'], d: '既属于 A <b>又</b> 属于 B' },
    diffAB: { t: 'A − B', f: '{x | x∈A ∧ x∉B}', r: ['a'], d: '属于 A 但<b>不</b>属于 B' },
    diffBA: { t: 'B − A', f: '{x | x∈B ∧ x∉A}', r: ['b'], d: '属于 B 但<b>不</b>属于 A（与 A − B 不同）' },
    compA: { t: '~A', f: '{x | x∈U ∧ x∉A}', r: ['b', 'o'], d: '全集 U 中<b>不</b>属于 A 的元素，~A = U − A' },
    compB: { t: '~B', f: '{x | x∈U ∧ x∉B}', r: ['a', 'o'], d: '全集 U 中<b>不</b>属于 B 的元素，~B = U − B' }
  };
  var RNAME = { a: '① 只属于 A', ab: '② A 与 B 公共', b: '③ 只属于 B', o: '④ A、B 之外' };
  function venn2(hl, labelA, labelB, elems) {
    var fill = function (k) { return has(hl, k) ? 'rgba(255,180,0,.62)' : 'rgba(255,255,255,0)'; };
    var s = '<svg class="sl-svg" viewBox="0 0 520 300" role="img" aria-label="两集合文氏图"><defs>' +
      '<clipPath id="v2A"><circle cx="205" cy="150" r="105"/></clipPath>' +
      '<mask id="v2Ao"><rect width="520" height="300" fill="#fff"/><circle cx="315" cy="150" r="105" fill="#000"/></mask>' +
      '<mask id="v2Bo"><rect width="520" height="300" fill="#fff"/><circle cx="205" cy="150" r="105" fill="#000"/></mask>' +
      '<mask id="v2O"><rect width="520" height="300" fill="#fff"/><circle cx="205" cy="150" r="105" fill="#000"/><circle cx="315" cy="150" r="105" fill="#000"/></mask></defs>' +
      '<rect x="8" y="8" width="504" height="284" rx="18" fill="rgba(255,255,255,.55)" stroke="rgba(214,59,29,.25)"/>' +
      '<rect x="8" y="8" width="504" height="284" rx="18" fill="' + fill('o') + '" mask="url(#v2O)"/>' +
      '<circle cx="205" cy="150" r="105" fill="rgba(214,59,29,.08)"/><circle cx="315" cy="150" r="105" fill="rgba(201,138,0,.08)"/>' +
      '<circle cx="205" cy="150" r="105" fill="' + fill('a') + '" mask="url(#v2Ao)"/>' +
      '<circle cx="315" cy="150" r="105" fill="' + fill('b') + '" mask="url(#v2Bo)"/>' +
      '<circle cx="315" cy="150" r="105" fill="' + fill('ab') + '" clip-path="url(#v2A)"/>' +
      '<circle cx="205" cy="150" r="105" fill="none" stroke="#D63B1D" stroke-width="2.5"/><circle cx="315" cy="150" r="105" fill="none" stroke="#C98A00" stroke-width="2.5"/>' +
      '<text x="26" y="34" font-size="15" font-weight="800" fill="#6B4A38">U</text>' +
      '<text x="150" y="44" font-size="16" font-weight="800" fill="#B8321A">' + labelA + '</text><text x="352" y="44" font-size="16" font-weight="800" fill="#8a5d00">' + labelB + '</text>';
    if (elems) {
      var pos = { a: [150, 150], ab: [260, 150], b: [370, 150], o: [470, 150] };
      Object.keys(elems).forEach(function (k) {
        var arr = elems[k];
        arr.forEach(function (x, i) {
          var off = (i - (arr.length - 1) / 2) * 30, px = pos[k][0], py = pos[k][1] + off;
          if (k === 'o') { px = 470; py = 60 + i * 34; }
          s += '<text class="mono" x="' + px + '" y="' + (py + 6) + '" text-anchor="middle" font-size="18" font-weight="800" fill="#2C1810">' + esc(x) + '</text>';
        });
      });
    }
    return s + '</svg>';
  }
  KINDS.venn_ops = {
    mission: '选一种运算，先在下方四个区域按钮中猜出结果区域，再点「检查答案」；关闭猜测模式可直接看高亮。',
    badge: '文氏图区域',
    legend: [['#FFB400', '运算结果区域'], ['#D63B1D', '集合 A 边界'], ['#C98A00', '集合 B 边界']],
    know: ['A ∪ B = {x | x∈A ∨ x∈B}；A ∩ B = {x | x∈A ∧ x∈B}。',
      'A − B = {x | x∈A ∧ x∉B}，差运算有方向：A − B 一般 ≠ B − A。',
      '补集 ~A = U − A 依赖全集 U；两个集合把 U 分成 4 个区域。'],
    state: { op: 'union', guess: [], checked: false },
    controls: function () {
      return group('选择运算', seg('op', Object.keys(OPS23).map(function (k) { return [k, OPS23[k].t]; }), 'union')) +
        group('先猜后看', '<label class="sl-check"><input type="checkbox" id="quiz">猜测模式（隐藏答案）</label><div class="sl-btn-row"><button type="button" class="sl-btn primary" data-act="check">检查答案</button><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>');
    },
    act: function (a, b) {
      var st = this.state;
      if (a === 'op') { st.op = b.dataset.v; st.guess = []; st.checked = false; setSeg('op', st.op); }
      if (a === 'reg') { var k = b.dataset.k, i = st.guess.indexOf(k); if (i >= 0) st.guess.splice(i, 1); else st.guess.push(k); st.checked = false; }
      if (a === 'check') st.checked = true;
    },
    render: function () {
      var st = this.state, O = OPS23[st.op], quiz = $('quiz').checked, ans = O.r;
      var show = !quiz || st.checked, hl = show ? ans : st.guess;
      var result = [].concat.apply([], ans.map(function (k) { return REG23[k]; }));
      var right = same(st.guess, ans);
      var regBtns = '<div class="sl-grid-auto">' + ['a', 'ab', 'b', 'o'].map(function (k) {
        var inAns = has(ans, k), g = has(st.guess, k), cls = quiz ? (st.checked ? (inAns ? 'good' : (g ? 'hot' : '')) : (g ? 'gold' : '')) : (inAns ? 'gold' : '');
        return '<button type="button" class="sl-cell ' + cls + '" data-act="reg" data-k="' + k + '" aria-pressed="' + g + '">' + RNAME[k] + '<small>{' + REG23[k].join(', ') + '}</small></button>';
      }).join('') + '</div>';
      ui.viz('<div class="sl-venn-box">' + venn2(hl, 'A', 'B', REG23) + '</div>' + card('四个区域' + (quiz ? '（点选你认为属于 ' + O.t + ' 的区域）' : ''), regBtns) +
        '<div class="sl-grid3">' + card('A', '<div class="sl-set">' + setText(A23, U23) + '</div>') + card('B', '<div class="sl-set">' + setText(B23, U23) + '</div>') + card('U', '<div class="sl-set">' + setText(U23, U23) + '</div>') + '</div>');
      ui.result(O.t + ' = ' + O.f, O.t + ' = ' + setText(result, U23), 'ok', quiz ? (st.checked ? (right ? '✓ 猜对了！' : '× 还不对：绿色为正确区域，红色为多选。') : '已选 ' + st.guess.length + ' 个区域。') : '');
      ui.explain('<b>' + O.t + '</b>：' + O.d + '。结果由区域 ' + ans.map(function (k) { return RNAME[k].slice(0, 1); }).join('、') + ' 组成。' + (st.op === 'diffAB' || st.op === 'diffBA' ? '对比 A − B 与 B − A，体会差运算的方向性。' : '') + (st.op.indexOf('comp') === 0 ? '补集包含区域 ④——若不给全集 U，补集就无从谈起。' : ''));
    },
    reset: function () { this.state = { op: 'union', guess: [], checked: false }; setSeg('op', 'union'); }
  };

  /* ---------- 2.3 拓展层：集合运算工程化 ---------- */
  var REC = [
    { id: 'R1', t: 'AI 助教', tags: ['ai', 'edu'] }, { id: 'R2', t: '红色文化图谱', tags: ['culture', 'data'] },
    { id: 'R3', t: '社区调研', tags: ['public', 'field'] }, { id: 'R4', t: '智慧养老', tags: ['ai', 'public'] },
    { id: 'R5', t: '研学路线', tags: ['culture', 'field'] }, { id: 'R6', t: '数据治理台账', tags: ['public', 'data'] },
    { id: 'R7', t: '古籍检索', tags: ['culture', 'ai', 'data'] }, { id: 'R8', t: '志愿服务档案', tags: ['public', 'data'] }
  ];
  var TAGN = { ai: '人工智能', culture: '文化', public: '公共服务', data: '数据', field: '实地', edu: '教育' };
  var EV = { even: ['偶数点', [2, 4, 6]], gt3: ['点数大于 3', [4, 5, 6]], prime: ['点数为质数', [2, 3, 5]], le2: ['点数不超过 2', [1, 2]], odd: ['奇数点', [1, 3, 5]] };
  KINDS.sql_filter = {
    mission: '数据库视角：切换 UNION / INTERSECT / EXCEPT，看结果集为何变多或变少；概率视角：选两个事件，验证加法公式。',
    badge: '运算 → 查询 / 事件',
    legend: [['#D63B1D', '结果集中的记录'], ['#FFB400', '事件的样本点'], ['#1F9D55', '公式验证通过']],
    know: ['SQL 集合运算：<code>UNION</code> ↔ ∪，<code>INTERSECT</code> ↔ ∩，<code>EXCEPT</code> ↔ −（结果自动去重；<code>UNION ALL</code> 保留重复）。',
      '概率中事件是样本空间 Ω 的子集：A∪B「A 或 B 发生」，A∩B「同时发生」，~A「A 不发生」。',
      '加法公式 P(A∪B) = P(A) + P(B) − P(A∩B)，互斥时 A∩B = ∅。'],
    state: { view: 'sql' },
    controls: function () {
      return group('应用视角', seg('view', [['sql', '数据库查询'], ['prob', '概率事件']], 'sql')) + '<div id="viewCtl"></div>' +
        '<div class="sl-btn-row"><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>';
    },
    viewCtl: function () {
      var tagOpts = Object.keys(TAGN).map(function (k) { return [k, TAGN[k]]; });
      $('viewCtl').innerHTML = this.state.view === 'sql' ?
        group('左查询：含标签', select('lt', tagOpts)) + group('集合运算', select('sop', [['UNION', 'UNION（∪）'], ['INTERSECT', 'INTERSECT（∩）'], ['EXCEPT', 'EXCEPT（−）']])) + group('右查询：含标签', select('rt', [['data', '数据'], ['public', '公共服务'], ['culture', '文化'], ['ai', '人工智能'], ['field', '实地'], ['edu', '教育']])) :
        group('事件 A', select('ea', Object.keys(EV).map(function (k) { return [k, EV[k][0]]; }))) + group('事件 B', select('eb', [['gt3', EV.gt3[0]], ['even', EV.even[0]], ['prime', EV.prime[0]], ['le2', EV.le2[0]], ['odd', EV.odd[0]]]));
    },
    init: function () { this.viewCtl(); },
    act: function (a, b) { if (a === 'view') { this.state.view = b.dataset.v; setSeg('view', b.dataset.v); this.viewCtl(); } },
    render: function () {
      if (this.state.view === 'sql') {
        var lt = val('lt'), rt = val('rt'), op = val('sop'), ids = REC.map(function (r) { return r.id; });
        var L = REC.filter(function (r) { return has(r.tags, lt); }).map(function (r) { return r.id; });
        var R = REC.filter(function (r) { return has(r.tags, rt); }).map(function (r) { return r.id; });
        var res = op === 'UNION' ? union(L, R) : op === 'INTERSECT' ? inter(L, R) : diff(L, R), sym = { UNION: '∪', INTERSECT: '∩', EXCEPT: '−' }[op];
        var sql = "SELECT id FROM 项目 WHERE 标签 = '" + TAGN[lt] + "'\n" + op + "\nSELECT id FROM 项目 WHERE 标签 = '" + TAGN[rt] + "';";
        ui.viz('<div class="sl-grid-auto">' + REC.map(function (r) {
          var on = has(res, r.id), tag = (has(L, r.id) ? 'L' : '') + (has(R, r.id) ? 'R' : '');
          return '<div class="sl-card sl-pop" style="' + (on ? 'border-color:#D63B1D;box-shadow:0 0 0 2px rgba(214,59,29,.25)' : 'opacity:.72') + '"><h4>' + r.id + ' <small>' + r.t + '</small></h4><div>' + r.tags.map(function (t) { return pill(TAGN[t], on ? 'hot' : ''); }).join('') + '</div><p style="margin-top:4px;font-size:.74rem">' + (tag === 'LR' ? '左右都命中' : tag === 'L' ? '仅左命中' : tag === 'R' ? '仅右命中' : '都未命中') + '</p></div>';
        }).join('') + '</div>' + '<div class="sl-grid2">' + card('查询语句', '<pre class="sl-set" style="margin:0;white-space:pre-wrap">' + esc(sql) + '</pre>') +
          card('集合视角', '<div class="sl-set">L = ' + setText(L, ids) + '<br>R = ' + setText(R, ids) + '<br>L ' + sym + ' R = ' + setText(res, ids) + '</div>') + '</div>');
        ui.result('L ' + sym + ' R', res.length + ' 条：' + setText(res, ids), 'ok', op === 'EXCEPT' ? 'EXCEPT 有方向：交换左右查询，结果会变成 R − L = ' + setText(diff(R, L), ids) + '。' : '');
        ui.explain('查询结果是记录 id 的集合。' + op + ' 与 ' + sym + ' 一一对应，数据库会自动<b>去重</b>，因此同时命中左右的记录只出现一次。' + (lt === rt ? '左右条件相同，结果体现幂等律。' : ''));
      } else {
        var ea = val('ea'), eb = val('eb'), A = EV[ea][1], B = EV[eb][1], O = [1, 2, 3, 4, 5, 6];
        var AB = inter(A, B), AuB = union(A, B), pA = A.length, pB = B.length, pI = AB.length, pU = AuB.length;
        var die = O.map(function (x) {
          var a = has(A, x), b = has(B, x), cls = a && b ? 'gold' : (a ? 'hot' : (b ? 'good' : 'muted'));
          return '<div class="sl-cell ' + cls + '" style="min-height:64px;font-size:1.3rem">' + x + '<small>' + (a && b ? 'A∩B' : a ? '仅 A' : b ? '仅 B' : '都不') + '</small></div>';
        }).join('');
        ui.viz(card('掷一枚骰子：Ω = {1, 2, 3, 4, 5, 6}', '<div class="sl-cellgrid" style="grid-template-columns:repeat(6,minmax(0,1fr))">' + die + '</div>') +
          '<div class="sl-grid3">' + card('A：' + EV[ea][0], '<div class="sl-set">A = {' + A.join(', ') + '}<br>P(A) = ' + frac(pA, 6) + '</div>') +
          card('B：' + EV[eb][0], '<div class="sl-set">B = {' + B.join(', ') + '}<br>P(B) = ' + frac(pB, 6) + '</div>') +
          card('A ∩ B', '<div class="sl-set">A∩B = ' + (AB.length ? '{' + AB.join(', ') + '}' : '∅') + '<br>P(A∩B) = ' + (pI ? frac(pI, 6) : '0') + '</div>') + '</div>' +
          card('加法公式验证', '<div class="sl-flow"><div><b>P(A) + P(B)</b><span>' + (pA + pB) + '/6</span></div><div class="arrow">−</div><div><b>P(A∩B)</b><span>' + pI + '/6</span></div><div class="arrow">=</div><div class="cur"><b>P(A∪B)</b><span>' + pU + '/6</span></div></div>'));
        ui.result('P(A∪B) = P(A)+P(B)−P(A∩B)', 'P(A∪B) = ' + frac(pU, 6), 'ok', '直接数 A∪B = {' + AuB.join(', ') + '} 共 ' + pU + ' 个样本点，与公式一致。');
        ui.explain(pI === 0 ? 'A 与 B <b>互斥</b>（A∩B = ∅），加法公式退化为 P(A∪B) = P(A) + P(B)。' : 'A 与 B 有公共样本点 {' + AB.join(', ') + '}，直接相加会把它们算两次，所以要减去 P(A∩B)——这正是 2.6 节<b>容斥原理</b>的概率形式。');
      }
    },
    reset: function () { this.state = { view: 'sql' }; setSeg('view', 'sql'); this.viewCtl(); }
  };

  /* ---------- 2.4 基础层：基本运算律（逐元素验证 + 反例） ---------- */
  var U24 = ['1', '2', '3', '4', '5', '6'];
  var LAWS24 = {
    commU: { t: '交换律（∪）', f: 'A ∪ B = B ∪ A', L: function (a, b) { return a || b; }, R: function (a, b) { return b || a; } },
    commI: { t: '交换律（∩）', f: 'A ∩ B = B ∩ A', L: function (a, b) { return a && b; }, R: function (a, b) { return b && a; } },
    assocU: { t: '结合律（∪）', f: '(A ∪ B) ∪ C = A ∪ (B ∪ C)', L: function (a, b, c) { return (a || b) || c; }, R: function (a, b, c) { return a || (b || c); } },
    assocI: { t: '结合律（∩）', f: '(A ∩ B) ∩ C = A ∩ (B ∩ C)', L: function (a, b, c) { return (a && b) && c; }, R: function (a, b, c) { return a && (b && c); } },
    idemU: { t: '幂等律（∪）', f: 'A ∪ A = A', L: function (a) { return a || a; }, R: function (a) { return a; } },
    idemI: { t: '幂等律（∩）', f: 'A ∩ A = A', L: function (a) { return a && a; }, R: function (a) { return a; } },
    fakeD: { t: '⚠ 差运算可交换？', f: 'A − B = B − A', L: function (a, b) { return a && !b; }, R: function (a, b) { return b && !a; } }
  };
  KINDS.law_verify = {
    mission: '选一条定律，点表格中的 ∈ 按钮随意改动 A、B、C —— 真定律怎么改都成立；最后一项「差运算可交换？」会被你找到反例。',
    badge: '逐元素验证',
    legend: [['#D63B1D', 'x ∈ 集合（可点切换）'], ['#1F9D55', '两端一致'], ['#C0392B', '反例']],
    know: ['证明集合等式 X = Y：对任意元素 x，x ∈ X ⇔ x ∈ Y（逐元素法 / 成员表法）。',
      '交换律：A∪B = B∪A，A∩B = B∩A；结合律：(A∪B)∪C = A∪(B∪C)，∩ 同理。',
      '幂等律：A∪A = A，A∩A = A。差运算<b>不满足</b>交换律，一个反例即可否定。'],
    state: { A: ['1', '2', '4'], B: ['2', '3', '4', '5'], C: ['1', '3', '6'], law: 'commU' },
    controls: function () {
      return group('选择定律', select('law', Object.keys(LAWS24).map(function (k) { return [k, LAWS24[k].t + '：' + LAWS24[k].f]; }))) +
        group('随机试验', '<div class="sl-btn-row"><button type="button" class="sl-btn primary" data-act="rand">随机生成 A、B、C</button><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>');
    },
    act: function (a, b) {
      var st = this.state;
      if (a === 'tg') { var s = st[b.dataset.s], x = b.dataset.x, i = s.indexOf(x); if (i >= 0) s.splice(i, 1); else s.push(x); }
      if (a === 'rand') ['A', 'B', 'C'].forEach(function (k) { st[k] = U24.filter(function () { return Math.random() < .5; }); });
    },
    render: function () {
      var st = this.state, L = LAWS24[val('law')], bad = 0;
      var rows = U24.map(function (x) {
        var a = has(st.A, x), b = has(st.B, x), c = has(st.C, x), l = !!L.L(a, b, c), r = !!L.R(a, b, c), ok = l === r; if (!ok) bad++;
        var tg = function (s, on) { return '<button type="button" class="tg' + (on ? ' on' : '') + '" data-act="tg" data-s="' + s + '" data-x="' + x + '" aria-pressed="' + on + '">' + (on ? '∈' : '∉') + '</button>'; };
        return '<tr' + (ok ? '' : ' class="cur"') + '><td>' + x + '</td><td>' + tg('A', a) + '</td><td>' + tg('B', b) + '</td><td>' + tg('C', c) + '</td><td class="' + (l ? 'y' : 'n') + '">' + (l ? '∈' : '∉') + '</td><td class="' + (r ? 'y' : 'n') + '">' + (r ? '∈' : '∉') + '</td><td class="' + (ok ? 'y' : 'bad') + '">' + (ok ? '✓' : '× 反例') + '</td></tr>';
      }).join('');
      var parts = L.f.split(' = ');
      ui.viz(card(L.t + '：' + L.f, '<div class="sl-table-wrap"><table class="sl-table"><thead><tr><th>元素 x</th><th>A</th><th>B</th><th>C</th><th>左端 ' + parts[0] + '</th><th>右端 ' + parts[1] + '</th><th>一致？</th></tr></thead><tbody>' + rows + '</tbody></table></div>') +
        '<div class="sl-grid3">' + ['A', 'B', 'C'].map(function (k) { return card(k, '<div class="sl-set">' + setText(st[k], U24) + '</div>'); }).join('') + '</div>');
      ui.result(L.f, bad ? '找到 ' + bad + ' 个反例' : '6 个元素两端全部一致', bad ? 'bad' : 'ok', bad ? '只要一个元素在两端的归属不同，等式就不成立。' : '改动 A、B、C 再试——真正的定律对任何集合都成立。');
      ui.explain(val('law') === 'fakeD' ? (bad ? '<span class="bad">反例已出现</span>：属于 A 不属于 B 的元素在左端，却不在右端。所以差运算<b>不满足交换律</b>。' : '当前 A 与 B 恰好相等，两端都是 ∅。点 ∈ 按钮让 A ≠ B，反例立刻出现。')
        : '表中每一行是一个元素的「成员资格」。左右两列逐行相同，说明 ' + L.f + ' 对这组 A、B、C 成立；由于判定只依赖 ∨、∧ 的真值规律，对任意集合都成立。');
    },
    reset: function () { this.state = { A: ['1', '2', '4'], B: ['2', '3', '4', '5'], C: ['1', '3', '6'] }; }
  };

  /* ---------- 2.4 拓展层：布尔代数同构 ---------- */
  var LAWS24E = {
    dm1: { t: '德摩根律 ①', set: '~(A ∪ B) = ~A ∩ ~B', logic: '¬(p ∨ q) ⇔ ¬p ∧ ¬q', sql: 'NOT (a OR b)  ⇔  NOT a AND NOT b', three: false, L: function (a, b) { return !(a || b); }, R: function (a, b) { return !a && !b; }, gL: 2, gR: 3, gl: 'OR + NOT', gr: 'NOT ×2 + AND' },
    dm2: { t: '德摩根律 ②', set: '~(A ∩ B) = ~A ∪ ~B', logic: '¬(p ∧ q) ⇔ ¬p ∨ ¬q', sql: 'NOT (a AND b)  ⇔  NOT a OR NOT b', three: false, L: function (a, b) { return !(a && b); }, R: function (a, b) { return !a || !b; }, gL: 2, gR: 3, gl: 'AND + NOT（一个与非门）', gr: 'NOT ×2 + OR' },
    dist: { t: '分配律', set: 'A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)', logic: 'p ∧ (q ∨ r) ⇔ (p ∧ q) ∨ (p ∧ r)', sql: 'a AND (b OR c)  ⇔  (a AND b) OR (a AND c)', three: true, L: function (a, b, c) { return a && (b || c); }, R: function (a, b, c) { return (a && b) || (a && c); }, gL: 2, gR: 3, gl: 'OR + AND', gr: 'AND ×2 + OR' },
    absorb: { t: '吸收律', set: 'A ∪ (A ∩ B) = A', logic: 'p ∨ (p ∧ q) ⇔ p', sql: 'a OR (a AND b)  ⇔  a', three: false, L: function (a, b) { return a || (a && b); }, R: function (a) { return a; }, gL: 2, gR: 0, gl: 'AND + OR', gr: '直接连线' }
  };
  KINDS.boolean_truth = {
    mission: '选一条定律，对照「集合 — 逻辑 — 电路 — 查询」四种写法；成员表与真值表逐行一致，定律就在四个领域同时成立。',
    badge: '集合 ≅ 逻辑 ≅ 电路',
    legend: [['#1F9D55', '1：属于 / 真 / 高电平'], ['#f2ebe6', '0：不属于 / 假 / 低电平'], ['#FFB400', '当前应用视角']],
    know: ['对应关系：∪ ↔ ∨ ↔ OR，∩ ↔ ∧ ↔ AND，~ ↔ ¬ ↔ NOT，∅ ↔ 0，U ↔ 1。',
      '把「x ∈ A」看成命题 p，集合的成员表就是命题公式的真值表，集合恒等式 ⇔ 逻辑等值式。',
      '这种共同结构称为<b>布尔代数</b>（第 11 章）；电路化简、查询优化都在用同一组定律。'],
    controls: function () {
      return group('选择定律', select('bl', Object.keys(LAWS24E).map(function (k) { return [k, LAWS24E[k].t + '：' + LAWS24E[k].set]; }))) +
        group('应用视角', seg('app', [['logic', '命题逻辑'], ['circuit', '电路化简'], ['sql', '查询优化']], 'logic')) +
        '<div class="sl-btn-row"><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>';
    },
    state: { app: 'logic' },
    act: function (a, b) { if (a === 'app') { this.state.app = b.dataset.v; setSeg('app', b.dataset.v); } },
    render: function () {
      var L = LAWS24E[val('bl')], app = this.state.app, rows = [], allOk = true;
      [0, 1].forEach(function (a) { [0, 1].forEach(function (b) { (L.three ? [0, 1] : [0]).forEach(function (c) { var l = +!!L.L(a, b, c), r = +!!L.R(a, b, c); if (l !== r) allOk = false; rows.push([a, b, c, l, r]); }); }); });
      var bit = function (v) { return '<td class="' + (v ? 'y' : 'n') + '">' + v + '</td>'; };
      var table = '<div class="sl-table-wrap"><table class="sl-table"><thead><tr><th>x∈A / p</th><th>x∈B / q</th>' + (L.three ? '<th>x∈C / r</th>' : '') + '<th>左端</th><th>右端</th><th>一致</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr>' + bit(r[0]) + bit(r[1]) + (L.three ? bit(r[2]) : '') + bit(r[3]) + bit(r[4]) + '<td class="y">' + (r[3] === r[4] ? '✓' : '×') + '</td></tr>'; }).join('') + '</tbody></table></div>';
      var map = '<div class="sl-table-wrap"><table class="sl-table"><thead><tr><th>集合</th><th>命题逻辑</th><th>数字电路</th><th>SQL 条件</th></tr></thead><tbody>' +
        [['A ∪ B', 'p ∨ q', 'OR 门', 'a OR b'], ['A ∩ B', 'p ∧ q', 'AND 门', 'a AND b'], ['~A', '¬p', 'NOT 门', 'NOT a'], ['∅ / U', '假 / 真', '0 / 1', 'FALSE / TRUE']].map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
      var view = app === 'logic' ? card('命题逻辑写法', '<div class="sl-set" style="font-size:1.05rem">' + L.logic + '</div><p style="margin-top:6px">成员表中的 0/1 就是命题 p、q' + (L.three ? '、r' : '') + ' 的真值。</p>') :
        app === 'circuit' ? card('电路化简', '<div class="sl-flow"><div><b>左端</b><span>' + L.gL + ' 个门</span><p style="margin:4px 0 0;font-size:.76rem">' + L.gl + '</p></div><div class="arrow">⇔</div><div' + (L.gR < L.gL ? ' class="cur"' : '') + '><b>右端</b><span>' + L.gR + ' 个门</span><p style="margin:4px 0 0;font-size:.76rem">' + L.gr + '</p></div></div><p style="margin-top:8px">两端功能相同，工程上选门数少、延迟低的一端实现' + (L.gR < L.gL ? '：吸收律让整块逻辑化为一根导线。' : '；德摩根律还能把电路统一改写为与非门 / 或非门。') + '</p>') :
          card('查询优化', '<div class="sl-set">' + esc(L.sql) + '</div><p style="margin-top:6px">数据库优化器用这些等价式改写 WHERE 条件，例如把 NOT 下推到每个条件、消去冗余条件，从而更好地利用索引。</p>');
      ui.viz(card(L.t + '：' + L.set, table) + view + card('四个领域的对应', map));
      ui.result(L.set, allOk ? '成员表 ' + rows.length + ' 行全部一致' : '存在不一致', allOk ? 'ok' : 'bad', '逻辑形式：' + L.logic);
      ui.explain('成员表只有 ' + rows.length + ' 行，却覆盖了所有元素的全部情况：每个元素对 A、B' + (L.three ? '、C' : '') + ' 的归属只有这 ' + rows.length + ' 种组合。因此 <b>' + L.set + '</b> 对任意集合成立，也同时证明了逻辑等值式 ' + L.logic + '。');
    },
    reset: function () { this.state = { app: 'logic' }; setSeg('app', 'logic'); }
  };

  /* ---------- 2.5 基础层：覆盖与划分 ---------- */
  var U25 = ['东区', '南区', '西区', '北区', '中心', '湖畔'];
  var PRE25 = {
    partition: { t: '方案一：三片网格', b: [['东区', '南区'], ['西区', '北区'], ['中心', '湖畔']] },
    overlap: { t: '方案二：中心被两片同管', b: [['东区', '南区', '中心'], ['中心', '湖畔'], ['西区', '北区']] },
    gap: { t: '方案三：北区无人负责', b: [['东区', '南区'], ['西区', '中心'], ['湖畔']] },
    empty: { t: '方案四：含一个空块', b: [['东区', '南区', '西区'], ['北区', '中心', '湖畔'], []] }
  };
  KINDS.partition_cover = {
    mission: '选一个分片方案，或直接点表格里的格子把区域分给 S₁/S₂/S₃，看三条检查何时全部通过——那才是划分。',
    badge: '不重不漏',
    legend: [['#1F9D55', '条件满足'], ['#C0392B', '条件不满足'], ['#FFB400', '被重复分配']],
    know: ['<b>覆盖</b>：一组非空子集，它们的并等于全集 U（不漏）。',
      '<b>划分</b>：覆盖 + 任意两块不相交（不重）；每一块称为一个<b>划分块</b>。',
      '划分一定是覆盖，覆盖不一定是划分。'],
    state: { blocks: null },
    controls: function () {
      return group('预设方案', select('pre', Object.keys(PRE25).map(function (k) { return [k, PRE25[k].t]; }))) +
        '<p class="sl-hint">也可以在舞台的分配表中点 ∈/∉ 自己设计方案。</p>' +
        '<div class="sl-btn-row"><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>';
    },
    onInput: function (e) { if (e.target.id === 'pre') this.state.blocks = null; },
    act: function (a, b) {
      if (a === 'tg') { var s = this.state.blocks[+b.dataset.s], x = b.dataset.x, i = s.indexOf(x); if (i >= 0) s.splice(i, 1); else s.push(x); }
    },
    render: function () {
      var st = this.state; if (!st.blocks) st.blocks = PRE25[val('pre')].b.map(function (b) { return b.slice(); });
      var B = st.blocks, cnt = {}; U25.forEach(function (x) { cnt[x] = B.filter(function (b) { return has(b, x); }).length; });
      var nonEmpty = B.every(function (b) { return b.length > 0; }), cover = U25.every(function (x) { return cnt[x] >= 1; }), disj = U25.every(function (x) { return cnt[x] <= 1; });
      var missing = U25.filter(function (x) { return !cnt[x]; }), dup = U25.filter(function (x) { return cnt[x] > 1; });
      var rows = U25.map(function (x) {
        return '<tr' + (cnt[x] !== 1 ? ' class="cur"' : '') + '><td class="l">' + x + '</td>' + B.map(function (b, i) { var on = has(b, x); return '<td><button type="button" class="tg' + (on ? ' on' : '') + '" data-act="tg" data-s="' + i + '" data-x="' + x + '" aria-pressed="' + on + '">' + (on ? '∈' : '∉') + '</button></td>'; }).join('') +
          '<td class="' + (cnt[x] === 1 ? 'y' : 'bad') + '">' + cnt[x] + '</td></tr>';
      }).join('');
      var chk = function (ok, t, d) { return '<div class="' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? '✓' : '×') + '</b><span><strong>' + t + '</strong>　' + d + '</span></div>'; };
      var verdict = nonEmpty && cover && disj ? '是划分' : (nonEmpty && cover ? '是覆盖，但不是划分' : '不是覆盖');
      ui.viz('<div class="sl-grid2">' + card('分配表：区域 × 子集', '<div class="sl-table-wrap"><table class="sl-table"><thead><tr><th>区域</th><th>S₁</th><th>S₂</th><th>S₃</th><th>被分配次数</th></tr></thead><tbody>' + rows + '</tbody></table></div>') +
        card('三条检查', '<div class="sl-checks">' + chk(nonEmpty, '每块非空', nonEmpty ? 'S₁、S₂、S₃ 都有元素' : '存在空块 ∅') + chk(cover, '并为全集', cover ? 'S₁ ∪ S₂ ∪ S₃ = U' : '遗漏：' + missing.join('、')) + chk(disj, '两两不交', disj ? '任意 Sᵢ ∩ Sⱼ = ∅' : '重复：' + dup.join('、')) + '</div>') + '</div>' +
        '<div class="sl-grid3">' + B.map(function (b, i) { return card('S' + '₁₂₃'[i], '<div>' + (b.length ? order(b, U25).map(function (x) { return pill(x, cnt[x] > 1 ? 'warn' : 'good'); }).join('') : pill('∅', 'muted')) + '</div>'); }).join('') + '</div>');
      ui.result('{S₁, S₂, S₃} 是否为 U 的划分？', verdict, nonEmpty && cover && disj ? 'ok' : 'bad', '覆盖：' + (nonEmpty && cover ? '是' : '否') + '；两两不交：' + (disj ? '是' : '否') + '。');
      ui.explain(nonEmpty && cover && disj ? '三条全部通过：每个区域<b>恰好</b>属于一个子集，责任「不重不漏」。' : (!cover ? '有区域没人负责（<span class="bad">漏</span>），连覆盖都不是。' : (!nonEmpty ? '划分块要求非空：空块 ∅ 没有实际意义。' : '所有区域都有人负责，但有区域被重复分配（<span class="bad">重</span>），只是覆盖。')));
    },
    reset: function () { this.state = { blocks: null }; }
  };

  /* ---------- 2.5 拓展层：网格化 · 聚类 · 分片 ---------- */
  KINDS.cluster_shard = {
    mission: '调分片数 k 与策略，比较负载均衡；再打开「热点副本」，看为什么副本方案只是覆盖、不再是划分。',
    badge: '划分 → 分布式系统',
    legend: [['#1F9D55', '只在一个分片'], ['#FFB400', '热点副本（重复）'], ['#D63B1D', '负载条']],
    know: ['数据分片要求每条数据<b>恰好</b>落在一个分片：分片集合是全体数据的划分。',
      '取模 id mod k 通常最均衡；按范围切分利于区间查询；按主题聚类利于业务但可能倾斜。',
      '为容灾把热点数据复制到多个节点，得到的是<b>覆盖</b>而非划分——一致性维护代价随之上升。'],
    controls: function () {
      return group('分片方式', slider('k', '分片数 k', 2, 4, 3) + select('strat', [['mod', '取模：id mod k'], ['range', '范围：按编号区间'], ['topic', '主题：按业务类型']])) +
        group('容灾', '<label class="sl-check"><input type="checkbox" id="replica">热点数据 D1、D2 各多存一份副本</label>') +
        '<div class="sl-btn-row"><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>';
    },
    render: function () {
      var k = num('k'), strat = val('strat'), rep = $('replica').checked, topics = ['文化', '服务', '科技'];
      var items = Array.from({ length: 12 }, function (_, i) { return { id: 'D' + (i + 1), topic: topics[i % 3], n: i + 1 }; });
      var shards = Array.from({ length: k }, function () { return []; });
      var per = Math.ceil(12 / k);
      items.forEach(function (it) {
        var idx = strat === 'mod' ? it.n % k : strat === 'range' ? Math.floor((it.n - 1) / per) : topics.indexOf(it.topic) % k;
        shards[idx].push(it);
      });
      if (rep) [0, 1].forEach(function (i) { var it = items[i], home = shards.findIndex(function (s) { return s.indexOf(it) >= 0; }); shards[(home + 1) % k].push(Object.assign({ copy: true }, it)); });
      var loads = shards.map(function (s) { return s.length; }), mx = Math.max.apply(null, loads), mn = Math.min.apply(null, loads);
      var isPart = !rep;
      ui.viz('<div class="sl-grid-auto" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">' + shards.map(function (s, i) {
        return card('分片 S' + sub(i + 1), '<div>' + s.map(function (x) { return pill(x.id + ' ' + x.topic, x.copy ? 'warn' : 'good'); }).join('') + '</div>', s.length + ' 条');
      }).join('') + '</div>' +
        card('负载', '<div class="sl-bars">' + shards.map(function (s, i) { return '<div class="sl-bar-row"><span>S' + sub(i + 1) + '</span><div class="sl-bar"><span style="width:' + (s.length / 12 * 100 * k / 2) + '%"></span></div><strong>' + s.length + '</strong></div>'; }).join('') + '</div>') +
        card('划分检查', '<div class="sl-checks"><div class="ok"><b>✓</b><span>并为全集：12 条数据都有归属</span></div><div class="' + (isPart ? 'ok' : 'no') + '"><b>' + (isPart ? '✓' : '×') + '</b><span>两两不交：' + (isPart ? '每条数据只在一个分片' : 'D1、D2 同时出现在两个分片') + '</span></div></div>'));
      ui.result('U = S₁ ∪ … ∪ S' + sub(k) + (isPart ? '，Sᵢ ∩ Sⱼ = ∅' : ''), isPart ? '是划分 · 负载差 ' + (mx - mn) : '是覆盖（含副本）', isPart ? 'ok' : 'bad', '最大负载 ' + mx + '，最小负载 ' + mn + '。');
      ui.explain((strat === 'topic' && k !== 3 ? '按主题分片时主题数 3 与 k = ' + k + ' 不匹配，出现<b>数据倾斜</b>。' : strat === 'mod' ? '取模把编号均匀散开，负载最均衡。' : '按范围切分保持编号连续，便于区间查询。') +
        '同样的「划分」思想也用于社区<b>网格化治理</b>（每户属于且仅属于一个网格）与<b>聚类</b>（每个样本属于且仅属于一个簇）。');
    }
  };

  /* ---------- 2.6 基础层：两集合容斥 ---------- */
  KINDS.inclusion_two = {
    mission: '全班 50 人，调节参加数学竞赛 |A|、程序设计竞赛 |B| 与两项都参加 |A∩B| 的人数，分三步看清「多算了谁、怎样修正」。',
    badge: '先加后减',
    legend: [['#D63B1D', '只参加数学'], ['#FFB400', '两项都参加（被数两次）'], ['#C98A00', '只参加程序设计']],
    know: ['|A ∪ B| = |A| + |B| − |A ∩ B|。',
      '|A| + |B| 把 A∩B 中每个人数了两次，减去一次后每人恰好计一次。',
      '两项都没参加：|~(A∪B)| = |U| − |A ∪ B|。A、B 不相交时 |A∪B| = |A| + |B|。'],
    controls: function () {
      return group('人数（|U| = 50）', slider('ia', '|A| 数学竞赛', 0, 40, 22) + slider('ib', '|B| 程序设计竞赛', 0, 40, 18) + slider('ii', '|A∩B| 两项都参加', 0, 40, 7)) +
        group('分步理解', playerHtml()) + '<div class="sl-btn-row"><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>';
    },
    init: function () { P.step = 3; },
    onInput: function (e) {
      var a = num('ia'), b = num('ib'), iE = $('ii');
      if (+iE.value > Math.min(a, b)) iE.value = Math.min(a, b);
      if (a + b - +iE.value > 50) iE.value = a + b - 50;
      syncSliders();
    },
    render: function () {
      P.max = 3;
      var a = num('ia'), b = num('ib'), i = num('ii'), u = a + b - i, s = P.step;
      var reg = { a: [a - i + ' 人'], ab: [i + ' 人'], b: [b - i + ' 人'], o: [] };
      var svg = venn2(s >= 2 ? ['ab'] : [], '数学 A', '程序 B', reg).replace('</svg>', '<text x="470" y="278" text-anchor="middle" font-size="13" fill="#6B4A38">都没参加 ' + (50 - u) + '</text></svg>');
      var steps = [
        ['① 简单相加', '|A| + |B| = ' + a + ' + ' + b + ' = ' + (a + b)],
        ['② 发现重叠', '两项都参加的 ' + i + ' 人在 |A| 和 |B| 中各被数了一次，共数了两次'],
        ['③ 减去一次', '|A∪B| = ' + (a + b) + ' − ' + i + ' = ' + u]
      ];
      ui.viz('<div class="sl-venn-box">' + svg + '</div>' +
        '<div class="sl-flow">' + steps.map(function (t, k) { return '<div class="' + (s === k + 1 ? 'cur' : '') + '" style="opacity:' + (s > k ? 1 : .38) + '"><b>' + t[0] + '</b><p style="margin:0;font-size:.82rem;color:#2C1810;line-height:1.5">' + t[1] + '</p></div>'; }).join('<div class="arrow">→</div>') + '</div>' +
        card('人数条', '<div class="sl-bars"><div class="sl-bar-row"><span>|A| + |B|</span><div class="sl-bar"><span style="width:' + (a + b) / 80 * 100 + '%"></span></div><strong>' + (a + b) + '</strong></div>' +
          '<div class="sl-bar-row"><span>|A∪B|</span><div class="sl-bar green"><span style="width:' + u / 80 * 100 + '%"></span></div><strong>' + u + '</strong></div>' +
          '<div class="sl-bar-row"><span>都没参加</span><div class="sl-bar"><span style="width:' + (50 - u) / 80 * 100 + '%"></span></div><strong>' + (50 - u) + '</strong></div></div>'));
      pProg('第 ' + s + ' / 3 步');
      ui.result('|A∪B| = |A| + |B| − |A∩B|', s >= 3 ? '|A∪B| = ' + u + ' 人' : '（进行到第 ' + s + ' 步）', s >= 3 ? 'ok' : '', '都没参加：50 − ' + u + ' = ' + (50 - u) + ' 人。');
      ui.explain(i === 0 ? '两项没有共同参加者（A∩B = ∅），直接相加就是准确人数。' : '若只做第 ① 步，会得到 ' + (a + b) + ' 人，比实际多出 <b>' + i + '</b> 人——正是被数了两次的那部分。');
    },
    reset: function () { pStop(); P.step = 3; }
  };

  /* ---------- 2.6 拓展层：容斥的应用 ---------- */
  function perms(arr) { if (arr.length <= 1) return [arr]; var r = []; arr.forEach(function (x, i) { perms(arr.slice(0, i).concat(arr.slice(i + 1))).forEach(function (p) { r.push([x].concat(p)); }); }); return r; }
  function primeFactors(n) { var ps = []; for (var p = 2; p * p <= n; p++) if (n % p === 0) { ps.push(p); while (n % p === 0) n /= p; } if (n > 1) ps.push(n); return ps; }
  KINDS.ie_apps = {
    mission: '三个经典应用都用「奇加偶减」：错位排列数 Dₙ、欧拉函数 φ(n)、多个事件的并的概率。选一个应用，调参数并与直接枚举结果对照。',
    badge: '容斥 → 排列 · 数论 · 概率',
    legend: [['#D63B1D', '被计入（+）'], ['#1F9D55', '最终满足条件'], ['#FFB400', '被扣除 / 加回的项']],
    know: ['一般容斥：|A₁∪…∪Aₙ| = Σ|Aᵢ| − Σ|Aᵢ∩Aⱼ| + Σ|Aᵢ∩Aⱼ∩Aₖ| − … + (−1)ⁿ⁺¹|A₁∩…∩Aₙ|。',
      '错位排列：Dₙ = n!·Σₖ₌₀ⁿ (−1)ᵏ/k!，Dₙ/n! → 1/e ≈ 0.3679。',
      '欧拉函数：φ(n) = n·∏(1 − 1/p)（p 取 n 的全部不同质因子）。'],
    state: { app: 'derange' },
    controls: function () {
      return group('应用', seg('app', [['derange', '错位排列'], ['phi', '欧拉函数'], ['prob', '概率加法']], 'derange')) + '<div id="viewCtl"></div>' +
        '<div class="sl-btn-row"><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>';
    },
    viewCtl: function () {
      var a = this.state.app;
      $('viewCtl').innerHTML = a === 'derange' ? group('参数', slider('dn', '人数 n（信封与信）', 1, 8, 4)) :
        a === 'phi' ? group('参数', slider('pn', '整数 n', 2, 120, 60)) : group('参数', slider('qn', '从 1…N 中随机取一个数，N', 10, 120, 30));
    },
    init: function () { this.viewCtl(); },
    act: function (a, b) { if (a === 'app') { this.state.app = b.dataset.v; setSeg('app', b.dataset.v); this.viewCtl(); } },
    render: function () {
      var app = this.state.app;
      if (app === 'derange') {
        var n = num('dn'), terms = [], D = 0;
        for (var k = 0; k <= n; k++) { var t = comb(n, k) * fact(n - k) * (k % 2 ? -1 : 1); D += t; terms.push([k, comb(n, k), fact(n - k), t]); }
        var list = '';
        if (n <= 4) {
          var ps = perms(Array.from({ length: n }, function (_, i) { return i + 1; }));
          list = card('直接枚举 ' + fact(n) + ' 种排列（绿色为错位排列）', '<div class="sl-cellgrid">' + ps.map(function (p) { var ok = p.every(function (v, i) { return v !== i + 1; }); return '<div class="sl-cell ' + (ok ? 'good' : 'muted') + '">' + p.join('') + '</div>'; }).join('') + '</div>');
        }
        ui.viz(card('n 封信装进 n 个信封，全部装错有几种？', '<p>设 Aᵢ = 「第 i 封信装对」的排列集合，则任意 k 封同时装对的排列有 (n−k)! 种，错位排列数 Dₙ = n! − |A₁∪…∪Aₙ|。</p>') +
          card('容斥展开', '<div class="sl-table-wrap"><table class="sl-table"><thead><tr><th>k（固定装对的封数）</th><th>C(n,k)</th><th>(n−k)!</th><th>符号</th><th>项</th></tr></thead><tbody>' +
            terms.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + (r[0] % 2 ? '−' : '+') + '</td><td class="' + (r[0] % 2 ? 'bad' : 'y') + '">' + (r[3] > 0 ? '+' : '') + fmtNum(r[3]) + '</td></tr>'; }).join('') +
            '<tr class="cur"><td colspan="4">D' + sub(n) + ' =</td><td class="y">' + fmtNum(D) + '</td></tr></tbody></table></div>') + list);
        ui.result('Dₙ = Σ (−1)ᵏ C(n,k)(n−k)!', 'D' + sub(n) + ' = ' + fmtNum(D), 'ok', 'D' + sub(n) + ' / ' + n + '! = ' + (D / fact(n)).toFixed(4) + '（1/e ≈ 0.3679）');
        ui.explain('n = ' + n + ' 时共有 ' + fmtNum(fact(n)) + ' 种排列，其中 <b>' + fmtNum(D) + '</b> 种全部装错。' + (n <= 4 ? '上方枚举结果与公式一致。' : '（n ≤ 4 时可显示全部排列作对照。）') + '随着 n 增大，「全部装错」的概率迅速接近 1/e。');
      } else if (app === 'phi') {
        var m = num('pn'), ps = primeFactors(m), cop = 0, cells = '';
        for (var x = 1; x <= m; x++) { var c = gcd(x, m) === 1; if (c) cop++; var dv = ps.filter(function (p) { return x % p === 0; }); cells += '<div class="sl-cell ' + (c ? 'good' : (dv.length > 1 ? 'gold' : 'muted')) + '" style="min-height:40px">' + x + '</div>'; }
        var ieRows = [], sum = 0;
        for (var mask = 0; mask < (1 << ps.length); mask++) {
          var ds = ps.filter(function (_, i) { return mask & (1 << i); }), d = ds.reduce(function (s, p) { return s * p; }, 1), sgn = ds.length % 2 ? -1 : 1;
          sum += sgn * (m / d); ieRows.push([ds.length ? ds.join('·') : '1', m / d, sgn]);
        }
        ui.viz(card('φ(' + m + ')：1…' + m + ' 中与 ' + m + ' 互素的数', '<p>' + m + ' = ' + (function () { var r = [], t = m; ps.forEach(function (p) { var e = 0; while (t % p === 0) { t /= p; e++; } r.push(p + (e > 1 ? '^' + e : '')); }); return r.join(' × '); })() + '，设 Aₚ = 「能被 p 整除的数」，则 φ(n) = n − |⋃Aₚ|。</p>') +
          card('容斥展开', '<div class="sl-table-wrap"><table class="sl-table"><thead><tr><th>整除条件 d</th><th>⌊n/d⌋</th><th>符号</th></tr></thead><tbody>' +
            ieRows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td class="' + (r[2] < 0 ? 'bad' : 'y') + '">' + (r[2] < 0 ? '−' : '+') + '</td></tr>'; }).join('') + '<tr class="cur"><td>φ(' + m + ') =</td><td colspan="2" class="y">' + sum + '</td></tr></tbody></table></div>') +
          card('逐个验证（绿色 = 互素）', '<div class="sl-cellgrid" style="grid-template-columns:repeat(auto-fill,minmax(46px,1fr))">' + cells + '</div>'));
        ui.result('φ(n) = n·∏(1 − 1/p)', 'φ(' + m + ') = ' + sum, sum === cop ? 'ok' : 'bad', '直接数 gcd(x, ' + m + ') = 1 的个数：' + cop + (sum === cop ? '，与公式一致。' : '。'));
        ui.explain('质因子 ' + ps.join('、') + ' 各对应一个「被整除」集合。同时被两个质数整除的数先被减了两次，所以要加回一次——' + (ps.length >= 3 ? '三个质因子时还要再减去三重交集。' : '这就是「奇加偶减」。') + '欧拉函数是第 1 章数论与第 10 章 RSA 密码的基础。');
      } else {
        var N = num('qn'), ds3 = [2, 3, 5], cnt = function (d) { return Math.floor(N / d); };
        var s1 = cnt(2) + cnt(3) + cnt(5), s2 = cnt(6) + cnt(10) + cnt(15), s3 = cnt(30), U = s1 - s2 + s3, brute = 0, cells2 = '';
        for (var y = 1; y <= N; y++) { var hit = ds3.some(function (d) { return y % d === 0; }); if (hit) brute++; cells2 += '<div class="sl-cell ' + (hit ? 'hot' : 'muted') + '" style="min-height:38px">' + y + '</div>'; }
        ui.viz(card('从 1…' + N + ' 随机取一个数，能被 2、3 或 5 整除的概率', '<p>A、B、C 分别为「被 2、3、5 整除」。P(A∪B∪C) = P(A)+P(B)+P(C) − P(AB) − P(AC) − P(BC) + P(ABC)。</p>') +
          '<div class="sl-flow"><div><b>一阶相加</b><span>' + s1 + '</span></div><div class="arrow">−</div><div><b>两两交</b><span>' + s2 + '</span></div><div class="arrow">+</div><div><b>三重交</b><span>' + s3 + '</span></div><div class="arrow">=</div><div class="cur"><b>|A∪B∪C|</b><span>' + U + '</span></div></div>' +
          card('逐个验证（红色 = 能被 2、3 或 5 整除）', '<div class="sl-cellgrid" style="grid-template-columns:repeat(auto-fill,minmax(44px,1fr))">' + cells2 + '</div>'));
        ui.result('P(A∪B∪C)', frac(U, N) + ' ≈ ' + (U / N).toFixed(4), U === brute ? 'ok' : 'bad', '逐个计数得 ' + brute + ' 个，' + (U === brute ? '与容斥结果一致。' : '与容斥不符。'));
        ui.explain('把「计数」除以 N 就是「概率」：概率加法公式就是容斥原理。N 为 30 的倍数时，结果恰好是 1 − (1−1/2)(1−1/3)(1−1/5) = 11/15。');
      }
    },
    reset: function () { this.state = { app: 'derange' }; setSeg('app', 'derange'); this.viewCtl(); }
  };

  /* ---------- 2.9 案例：社区服务（基础层 / 拓展层） ---------- */
  var RES = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12'];
  var SVC = {
    elder: { t: '养老服务', s: ['R1', 'R4', 'R8', 'R11'] },
    child: { t: '托幼服务', s: ['R2', 'R5', 'R12'] },
    disabled: { t: '助残服务', s: ['R3', 'R7', 'R8'] },
    health: { t: '健康服务', s: ['R1', 'R3', 'R5', 'R9', 'R11'] }
  };
  KINDS.service_sets = {
    case: {
      tier: '认识模型',
      scene: '<p>某社区有 12 户重点关注居民（R1–R12），街道开设了<b>养老、托幼、助残、健康</b>四项服务。社工需要回答：每项服务惠及哪些居民？每户居民享受了哪些服务？还有谁没被照顾到？</p>',
      model: [['12 户居民', '全集 U = {R1, …, R12}'], ['一项服务的受益居民', '子集 E、C、D、H ⊆ U'], ['某户享受某项服务', 'Rᵢ ∈ E'], ['至少享受一项服务', 'E ∪ C ∪ D ∪ H'], ['未被覆盖的居民', 'U − (E ∪ C ∪ D ∪ H)']],
      solve: '选服务看受益集合，点居民看归属',
      transfer: ['如果一户居民同时享受养老与健康服务，统计「服务总人次」与「受益总户数」有何不同？（进阶层用容斥回答）', '学校的奖助学金、宿舍分配、课程选修，能否用同样的「对象全集 + 服务子集」来建模？']
    },
    mission: '选一项服务，看它的受益居民集合；点任意居民，查看他属于哪些服务集合。',
    badge: '服务 = 居民子集',
    legend: [['#D63B1D', '属于当前服务'], ['#1F9D55', '被其他服务覆盖'], ['#f2ebe6', '尚未覆盖']],
    know: ['全集 U：12 户居民；每项服务的受益者构成 U 的一个子集。', '居民 Rᵢ ∈ E 表示 Rᵢ 享受养老服务；一户可同时属于多个服务集合。', '被覆盖居民 = 各服务集合的<b>并</b>；未覆盖居民 = U 与并集之<b>差</b>。'],
    state: { pick: 'R8' },
    controls: function () {
      return group('选择服务', seg('svc', Object.keys(SVC).map(function (k) { return [k, SVC[k].t]; }), 'elder')) +
        '<div class="sl-btn-row"><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>';
    },
    act: function (a, b) { if (a === 'svc') { this.state.svc = b.dataset.v; setSeg('svc', b.dataset.v); } if (a === 'res') this.state.pick = b.dataset.v; },
    render: function () {
      var st = this.state, sk = st.svc || 'elder', S = SVC[sk].s, all = union(SVC.elder.s, SVC.child.s, SVC.disabled.s, SVC.health.s), gap = diff(RES, all);
      var grid = '<div class="sl-cellgrid">' + RES.map(function (r) {
        var mine = Object.keys(SVC).filter(function (k) { return has(SVC[k].s, r); });
        var cls = has(S, r) ? 'hot' : (mine.length ? 'good' : 'muted');
        return '<button type="button" class="sl-cell ' + cls + '" data-act="res" data-v="' + r + '" style="' + (st.pick === r ? 'box-shadow:0 0 0 3px #FFB400' : '') + '">' + r + '<small>' + (mine.length ? mine.map(function (k) { return SVC[k].t.slice(0, 2); }).join('·') : '无') + '</small></button>';
      }).join('') + '</div>';
      var mine = Object.keys(SVC).filter(function (k) { return has(SVC[k].s, st.pick); });
      ui.viz(card('居民名册 U（点居民查看归属）', grid) +
        '<div class="sl-grid-auto" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">' + Object.keys(SVC).map(function (k) { return '<div class="sl-card sl-pop" style="' + (k === sk ? 'border-color:#D63B1D;box-shadow:0 0 0 2px rgba(214,59,29,.2)' : '') + '"><h4>' + SVC[k].t + ' <small>|·| = ' + SVC[k].s.length + '</small></h4><div class="sl-set">{' + SVC[k].s.join(', ') + '}</div></div>'; }).join('') + '</div>' +
        card('居民 ' + st.pick + ' 的归属', '<div>' + Object.keys(SVC).map(function (k) { var i = has(SVC[k].s, st.pick); return pill(st.pick + (i ? ' ∈ ' : ' ∉ ') + SVC[k].t, i ? 'good' : 'muted'); }).join('') + '</div>'));
      ui.result(SVC[sk].t + '受益集合', '{' + S.join(', ') + '}（' + S.length + ' 户）', 'ok', st.pick + ' 享受 ' + (mine.length ? mine.length + ' 项服务' : '0 项服务'));
      ui.explain('四项服务覆盖了 <b>' + all.length + '</b> 户（并集），仍有 <b>' + gap.length + '</b> 户（' + gap.join('、') + '）不属于任何服务集合——这就是需要上门走访的<b>服务缺口</b>。注意四个集合大小之和为 ' + (SVC.elder.s.length + SVC.child.s.length + SVC.disabled.s.length + SVC.health.s.length) + '，比 ' + all.length + ' 大，因为有居民同属多项服务。');
    },
    reset: function () { this.state = { pick: 'R8', svc: 'elder' }; setSeg('svc', 'elder'); }
  };
  var PROJ = {
    P1: { t: '日间照料中心', s: ['R1', 'R4', 'R8', 'R11'] },
    P2: { t: '家庭医生签约', s: ['R1', 'R3', 'R5', 'R9', 'R11'] },
    P3: { t: '四点半课堂', s: ['R2', 'R5', 'R12'] },
    P4: { t: '无障碍改造', s: ['R3', 'R7', 'R8'] },
    P5: { t: '独居老人巡访', s: ['R4', 'R6', 'R10'] }
  };
  function greedyCover(sets, U, k) {
    var chosen = [], left = U.slice(), log = [];
    for (var i = 0; i < k; i++) {
      var best = null, gain = -1;
      Object.keys(sets).forEach(function (p) { if (has(chosen, p)) return; var g = inter(sets[p], left).length; if (g > gain) { gain = g; best = p; } });
      if (!best || gain <= 0) break;
      chosen.push(best); left = diff(left, sets[best]); log.push([best, gain]);
    }
    return { chosen: chosen, left: left, log: log };
  }
  function bestCover(sets, U, k) {
    var keys = Object.keys(sets), best = null, bc = -1;
    for (var m = 0; m < (1 << keys.length); m++) {
      var ks = keys.filter(function (_, i) { return m & (1 << i); }); if (ks.length > k) continue;
      var c = union.apply(null, ks.map(function (p) { return sets[p]; })).length;
      if (c > bc || (c === bc && ks.length < best.length)) { bc = c; best = ks; }
    }
    return { chosen: best, covered: bc };
  }
  KINDS.service_opt = {
    case: {
      tier: '拓展模型',
      scene: '<p>街道年度预算只够新开 <b>k</b> 个服务项目。五个候选项目各自惠及一部分居民（来自民生普查的「一人一档」）。怎样选项目，才能让<b>受益户数最多</b>、不漏掉困难群众？</p>',
      model: [['一人一档（12 户）', '全集 U'], ['候选项目 Pᵢ 的受益户', '子集 Sᵢ ⊆ U'], ['预算只够 k 个项目', '选 ≤ k 个子集'], ['受益户数', '|S_{i₁} ∪ … ∪ S_{iₖ}|'], ['目标', '最大覆盖问题']],
      solve: '调预算 k，逐步看贪心选择，并与穷举最优对照',
      transfer: ['如果每个项目费用不同（预算约束 Σ费用 ≤ B），贪心规则应如何改为「单位费用新增覆盖」？', '穷举 5 个项目的所有组合只有 2⁵ = 32 种；若候选项目有 50 个呢？这与 2.2 节幂集的规模有何联系？']
    },
    mission: '调节预算 k，按「每步选新增覆盖最多的项目」逐步决策；再看穷举全部组合得到的最优方案。',
    badge: '最大覆盖 · 贪心',
    legend: [['#D63B1D', '本步新增覆盖'], ['#1F9D55', '已覆盖'], ['#f2ebe6', '尚未覆盖']],
    know: ['<b>最大覆盖问题</b>：从若干子集中选 k 个，使它们的并尽可能大。', '<b>贪心法</b>：每步选「新增覆盖」最多的子集；速度快，一般不保证最优，但有 (1 − 1/e) 的近似保证。', '受益户数用<b>并集</b>计算，不能把各项目人数直接相加（有交叠）。'],
    controls: function () {
      return group('预算', slider('budget', '可开设项目数 k', 1, 5, 2)) + group('逐步决策', playerHtml()) +
        '<div class="sl-btn-row"><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>';
    },
    init: function () { P.step = 99; },
    onInput: function (e) { if (e.target.id === 'budget') { pStop(); P.step = 99; } },
    render: function () {
      var k = num('budget'), sets = {}; Object.keys(PROJ).forEach(function (p) { sets[p] = PROJ[p].s; });
      var g = greedyCover(sets, RES, k); P.max = g.log.length; if (P.step > P.max) P.step = P.max;
      var s = P.step, chosen = g.chosen.slice(0, s), covered = union.apply(null, chosen.map(function (p) { return sets[p]; }).concat([[]]));
      var newest = s ? inter(sets[chosen[s - 1]], diff(RES, union.apply(null, chosen.slice(0, s - 1).map(function (p) { return sets[p]; }).concat([[]])))) : [];
      var opt = bestCover(sets, RES, k);
      var grid = '<div class="sl-cellgrid">' + RES.map(function (r) { return '<div class="sl-cell ' + (has(newest, r) ? 'hot' : has(covered, r) ? 'good' : 'muted') + '">' + r + '</div>'; }).join('') + '</div>';
      var cards = '<div class="sl-grid-auto" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">' + Object.keys(PROJ).map(function (p) {
        var idx = chosen.indexOf(p), gain = inter(sets[p], diff(RES, union.apply(null, chosen.slice(0, idx < 0 ? s : idx).map(function (q) { return sets[q]; }).concat([[]])))).length;
        return '<div class="sl-card sl-pop" style="' + (idx >= 0 ? 'border-color:#1F9D55;box-shadow:0 0 0 2px rgba(31,157,85,.25)' : '') + '"><h4>' + p + ' ' + PROJ[p].t + '</h4><div class="sl-set">{' + PROJ[p].s.join(', ') + '}</div><p style="margin-top:4px">' + (idx >= 0 ? '第 ' + (idx + 1) + ' 步选中，新增 ' + g.log[idx][1] + ' 户' : '若现在加入可新增 ' + gain + ' 户') + '</p></div>';
      }).join('') + '</div>';
      ui.viz(card('一人一档：受益覆盖图', grid) + cards +
        '<div class="sl-grid2">' + card('贪心方案（' + g.chosen.length + ' 个项目）', '<div class="sl-set">' + g.chosen.join(' → ') + '</div><p style="margin-top:4px">覆盖 ' + (RES.length - g.left.length) + ' / 12 户</p>') +
        card('穷举最优（检查 2⁵ = 32 种组合）', '<div class="sl-set">{' + opt.chosen.join(', ') + '}</div><p style="margin-top:4px">覆盖 ' + opt.covered + ' / 12 户</p>') + '</div>');
      pProg('第 ' + s + ' / ' + P.max + ' 步');
      var sumSize = chosen.reduce(function (t, p) { return t + sets[p].length; }, 0);
      ui.result('受益户数 = |⋃ Sᵢ|', covered.length + ' / 12 户', 'ok', '各项目人数之和 ' + sumSize + '，去重后 ' + covered.length + ' 户。');
      ui.explain('预算 k = ' + k + '：贪心方案覆盖 <b>' + (RES.length - g.left.length) + '</b> 户，穷举最优覆盖 <b>' + opt.covered + '</b> 户，' + (opt.covered === RES.length - g.left.length ? '本例贪心恰好达到最优。' : '贪心略逊于最优——这就是近似算法的代价。') + (g.left.length ? '仍未覆盖：' + g.left.join('、') + '。' : '全部居民都已覆盖。'));
    },
    reset: function () { pStop(); P.step = 99; }
  };

  /* ---------- 2.10 案例：科技创新（基础层 / 拓展层） ---------- */
  var MEM = {
    '算法': ['建模', '算法', '论文'], '硬件': ['传感器', '嵌入式', '测试'], '数据': ['采集', '清洗', '可视化'],
    '产品': ['需求', '交互', '汇报'], '安全': ['加密', '风控', '合规']
  };
  KINDS.skill_sets = {
    case: {
      tier: '认识模型',
      scene: '<p>学院组建一支参加「智慧社区」科创竞赛的学生团队。五位候选同学各有所长。指导老师先要把每人的能力说清楚：<b>谁会什么？团队合起来会什么？</b></p>',
      model: [['一位同学的技能', '集合 Sᵢ（如 S算法 = {建模, 算法, 论文}）'], ['某同学会某技能', 'x ∈ Sᵢ'], ['入选团队的同学', '被选中的子集族'], ['团队整体能力', '并集 S₁ ∪ S₂ ∪ …'], ['团队技能数', '|并集|']],
      solve: '点选同学加入 / 移出团队，观察并集变化',
      transfer: ['两位同学的技能有交集，说明什么？交集过大或为空各有什么利弊？（进阶层讨论）', '把「课程—知识点」「岗位—能力」也写成集合，能回答哪些问题？']
    },
    mission: '点选同学加入团队，观察团队技能集合如何由成员技能「并」出来。',
    badge: '技能 = 集合',
    legend: [['#D63B1D', '已入队成员的技能'], ['#f2ebe6', '未入队'], ['#1F9D55', '团队技能并集']],
    know: ['每位同学的技能是一个集合 Sᵢ，元素是技能名称，满足互异、无序。', '团队能力 = 入队成员技能集合的<b>并</b>：S₁ ∪ S₂ ∪ … ∪ Sₖ。', '同一技能多人都会，在并集中只出现一次（互异性）。'],
    state: { team: ['算法', '硬件'] },
    controls: function () {
      return group('候选同学', '<div class="sl-seg" style="grid-template-columns:1fr 1fr">' + Object.keys(MEM).map(function (m) { return '<button type="button" class="sl-btn" data-act="mem" data-v="' + m + '">' + m + '同学</button>'; }).join('') + '</div>') +
        '<div class="sl-btn-row"><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>';
    },
    act: function (a, b) { if (a === 'mem') { var t = this.state.team, i = t.indexOf(b.dataset.v); if (i >= 0) t.splice(i, 1); else t.push(b.dataset.v); } },
    render: function () {
      var t = this.state.team, tot = union.apply(null, t.map(function (m) { return MEM[m]; }).concat([[]]));
      document.querySelectorAll('[data-act="mem"]').forEach(function (b) { var on = has(t, b.dataset.v); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      ui.viz('<div class="sl-grid-auto" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">' + Object.keys(MEM).map(function (m) {
        var on = has(t, m); return '<div class="sl-card sl-pop" style="' + (on ? 'border-color:#D63B1D;box-shadow:0 0 0 2px rgba(214,59,29,.2)' : 'opacity:.72') + '"><h4>' + m + '同学 <small>' + (on ? '已入队' : '候选') + '</small></h4><div class="sl-set">S' + m + ' = {' + MEM[m].join(', ') + '}</div><div style="margin-top:4px">' + MEM[m].map(function (x) { return pill(x, on ? 'hot' : 'muted'); }).join('') + '</div></div>';
      }).join('') + '</div>' +
        card('团队技能并集', '<div class="sl-set">' + (t.length ? t.map(function (m) { return 'S' + m; }).join(' ∪ ') : '（空团队）') + ' = ' + (tot.length ? '{' + tot.join(', ') + '}' : '∅') + '</div><div style="margin-top:6px">' + tot.map(function (x) { return pill(x, 'good'); }).join('') + '</div>'));
      ui.result('团队能力 = ⋃ Sᵢ', tot.length + ' 项技能', 'ok', '团队成员 ' + t.length + ' 人：' + (t.join('、') || '无'));
      ui.explain(t.length ? '团队由 ' + t.length + ' 位同学组成，合起来掌握 <b>' + tot.length + '</b> 项技能。加入一位技能完全不同的同学，并集就增加 3 项——这就是「优势互补」的集合含义。' : '先选至少一位同学。空团队的技能集合是空集 ∅。');
    },
    reset: function () { this.state = { team: ['算法', '硬件'] }; }
  };
  var MEM2 = {
    '多面手': ['算法', '硬件', '建模', '测试'],
    '软件方向': ['算法', '建模', '数据'],
    '硬件方向': ['硬件', '测试', '交互'],
    '设计方向': ['交互', '汇报'],
    '法学方向': ['合规', '汇报']
  };
  KINDS.team_cover = {
    case: {
      tier: '拓展模型',
      scene: '<p>一项跨学科攻关任务需要若干关键技能。团队人数越少，沟通成本越低。问题是：<b>最少需要几个人</b>，才能让每项关键技能都有人会？</p>',
      model: [['任务需要的技能', '目标集合 T'], ['候选人 i 的技能', '子集 Sᵢ'], ['组队方案', '候选人的子集族'], ['技能全部有人会', 'T ⊆ ⋃ Sᵢ'], ['人数最少', '最小集合覆盖问题']],
      solve: '逐步看贪心组队，并与穷举最优对照',
      transfer: ['本例中贪心先选「多面手」，结果反而多用了一个人。你能说出贪心为什么会「短视」吗？', '集合覆盖还出现在基站选址、测试用例精简、课程排班中——试举一例写出它的 T 与 Sᵢ。']
    },
    mission: '选择目标技能，逐步观察贪心法每一步选「新增技能最多」的人；再与穷举全部 2⁵ 种组队方案得到的最优解比较。',
    badge: '最小集合覆盖',
    legend: [['#D63B1D', '本步新覆盖的技能'], ['#1F9D55', '已覆盖'], ['#f2ebe6', '尚未覆盖']],
    know: ['<b>集合覆盖问题</b>：给定目标集合 T 与子集族 {Sᵢ}，选最少的子集使其并包含 T；它是著名的 NP 难问题。', '<b>贪心近似</b>：每步选新增覆盖最多的子集，结果最多是最优解的约 ln|T| + 1 倍。', '小规模时可以穷举所有组合（幂集）求最优，规模一大就不可行。'],
    controls: function () {
      return group('目标技能 T', select('tgt', [['core', '核心六项：算法 硬件 建模 测试 数据 交互'], ['full', '再加合规：共七项']])) + group('逐步组队', playerHtml()) +
        '<div class="sl-btn-row"><button type="button" class="sl-btn ghost" data-act="reset">重置</button></div>';
    },
    init: function () { P.step = 99; },
    onInput: function (e) { if (e.target.id === 'tgt') { pStop(); P.step = 99; } },
    render: function () {
      var T = ['算法', '硬件', '建模', '测试', '数据', '交互'].concat(val('tgt') === 'full' ? ['合规'] : []);
      var sets = {}; Object.keys(MEM2).forEach(function (m) { sets[m] = inter(MEM2[m], T); });
      var g = greedyCover(sets, T, 5); P.max = g.log.length; if (P.step > P.max) P.step = P.max;
      var s = P.step, chosen = g.chosen.slice(0, s), prev = union.apply(null, chosen.slice(0, Math.max(0, s - 1)).map(function (m) { return sets[m]; }).concat([[]]));
      var cov = union.apply(null, chosen.map(function (m) { return sets[m]; }).concat([[]])), newest = s ? diff(sets[chosen[s - 1]], prev) : [];
      var best = null; var keys = Object.keys(MEM2);
      for (var m = 0; m < 32; m++) { var ks = keys.filter(function (_, i) { return m & (1 << i); }); if (subset(T, union.apply(null, ks.map(function (k) { return sets[k]; }).concat([[]]))) && (!best || ks.length < best.length)) best = ks; }
      ui.viz(card('目标技能 T（|T| = ' + T.length + '）', '<div class="sl-cellgrid">' + T.map(function (x) { return '<div class="sl-cell ' + (has(newest, x) ? 'hot' : has(cov, x) ? 'good' : 'muted') + '">' + x + '</div>'; }).join('') + '</div>') +
        '<div class="sl-grid-auto" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">' + keys.map(function (k) {
          var idx = chosen.indexOf(k); return '<div class="sl-card sl-pop" style="' + (idx >= 0 ? 'border-color:#1F9D55;box-shadow:0 0 0 2px rgba(31,157,85,.25)' : '') + '"><h4>' + k + (idx >= 0 ? ' <small>第 ' + (idx + 1) + ' 步</small>' : '') + '</h4><div>' + MEM2[k].map(function (x) { return pill(x, has(T, x) ? (has(cov, x) ? 'good' : '') : 'muted'); }).join('') + '</div></div>';
        }).join('') + '</div>' +
        '<div class="sl-grid2">' + card('贪心方案：' + g.chosen.length + ' 人', '<div class="sl-set">' + g.log.map(function (l) { return l[0] + '（+' + l[1] + '）'; }).join(' → ') + '</div>') +
        card('穷举最优：' + best.length + ' 人', '<div class="sl-set">{' + best.join(', ') + '}</div><p style="margin-top:4px">检查了全部 2⁵ = 32 种组队方案</p>') + '</div>');
      pProg('第 ' + s + ' / ' + P.max + ' 步');
      ui.result('T ⊆ ⋃ Sᵢ，人数最少', '贪心 ' + g.chosen.length + ' 人 / 最优 ' + best.length + ' 人', g.chosen.length === best.length ? 'ok' : 'bad', '已覆盖 ' + cov.length + ' / ' + T.length + ' 项。');
      ui.explain(g.chosen.length > best.length ? '贪心第一步被技能最多的「多面手」吸引，剩下的技能却分散在不同人身上，只好每项再各找一人；而最优方案 {' + best.join('、') + '} 彼此恰好互补。<b>局部最优 ≠ 全局最优</b>，这正是集合覆盖问题难在哪里。' : '本例贪心结果与最优一致。');
    },
    reset: function () { pStop(); P.step = 99; }
  };

  /* =======================================================================
   * 启动
   * ===================================================================== */
  var K = KINDS[CFG.kind];
  function render() { if (!K) return; syncSliders(); K.render(); }
  window.SetLayer = { render: render, venn3: venn3, venn2: venn2, register: function (name, def) { KINDS[name] = def; } };

  function boot() {
    K = KINDS[CFG.kind];
    if (!K) return;
    var viz = $('vizArea');
    if (K.case && window.CaseFlow) {
      viz.innerHTML = '<div id="cfTop" class="cf-top"></div><div id="slSolve" style="display:flex;flex-direction:column;gap:12px"><div id="slViz" style="display:flex;flex-direction:column;gap:12px"></div></div><div id="cfBottom" class="cf-bottom"></div>';
      var mis = $('slMission'); $('slSolve').insertBefore(mis, $('slViz'));
      var ex = $('slExplain'); if (ex) ex.remove();
      CaseFlow.mount(Object.assign({ solveId: 'slSolve' }, K.case));
    }
    $('slMission').innerHTML = '<span><b>互动任务：</b>' + K.mission + '</span><span class="sl-badge">' + K.badge + '</span>';
    $('slLegend').innerHTML = (K.legend || []).map(function (l) { return '<span><i style="background:' + l[0] + '"></i>' + l[1] + '</span>'; }).join('');
    $('slKnow').innerHTML = '<ul>' + K.know.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>';
    var ctl = $('slControls');
    ctl.innerHTML = K.controls();
    var defaults = {};
    function snapshot() { ctl.querySelectorAll('input,select').forEach(function (e) { defaults[e.id] = e.type === 'checkbox' ? e.checked : e.value; }); }
    if (K.init) K.init();
    snapshot();
    ctl.addEventListener('input', function (e) { if (K.onInput) K.onInput.call(K, e); render(); });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (b && (ctl.contains(b) || viz.contains(b))) {
        var a = b.dataset.act;
        if (a === 'reset') {
          pStop();
          if (K.reset) K.reset.call(K);
          ctl.querySelectorAll('input,select').forEach(function (el) { if (el.id in defaults) { if (el.type === 'checkbox') el.checked = defaults[el.id]; else el.value = defaults[el.id]; } });
          if (K.viewCtl) { K.viewCtl(); }
          render(); return;
        }
        if (a.indexOf('p-') === 0) { pAct(a); return; }
        if (K.act) K.act.call(K, a, b);
        render(); return;
      }
      if (K.click && viz.contains(e.target)) K.click.call(K, e);
    });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
