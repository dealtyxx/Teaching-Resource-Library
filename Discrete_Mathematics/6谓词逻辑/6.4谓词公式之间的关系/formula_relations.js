/* =====================================================================
 * 6.4 谓词公式之间的关系 —— 三层统一交互引擎（量词关系翻转器）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与本章其它小节同形）：选择关系 → 逐一核验解释模型
 *   点一步看一个解释（论域 + 谓词/关系赋值）→ 看反馈（A、B 在该模型的真值是否一致）
 *   → 看解释卡高亮、真值指纹图高亮 → 判定 等价 / 蕴含 / 不等价（反例模型）。
 *   完成后可点任意模型 / 指纹格回看。
 *
 * 难度梯度：
 *   基础层：量词否定律（¬∀=∃¬、¬∃=∀¬）以及易错的『¬∀ ≠ ∀¬』，一元谓词 4 模型。
 *   进阶层：量词分配（∀对∧、∃对∨）、∀对∨不分配（蕴含非等价）、∀∃≠∃∀（二元关系反例）。
 *   拓展层：辖域移动与前束范式等值改写（查询优化 / 嵌套子查询改写）。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* 由模型构造解释 I：I.P(x) / I.Q(x) / I.R(x,y) / I.prop(name) */
  function makeI(model) {
    return {
      P: function (x) { return !!(model.P && model.P[x]); },
      Q: function (x) { return !!(model.Q && model.Q[x]); },
      R: function (x, y) { return !!(model.R && model.R[x] && model.R[x][y]); },
      prop: function (name) { return !!(model.props && model.props[name]); }
    };
  }

  var LEVELS = {
    basic: {
      simple: true,
      introStatus: "选择一组量词等值式，点「下一步」逐一核验有限论域上的解释，看 A、B 真值是否处处一致——判断是否逻辑等价。",
      legend: [
        ["¬∀=∃¬", "并非都 P = 存在不 P"],
        ["¬∃=∀¬", "不存在 P = 都不是 P"],
        ["≡", "逻辑等价 · 真值处处相同"],
        ["≠", "存在反例 · 不等价"],
        ["反例", "使 A、B 取值不同的模型"]
      ],
      domain: ["a", "b"], domainLabel: "D = {a, b}",
      cases: [
        { label: "¬∀xP(x)  与  ∃x¬P(x)", A: "¬∀x P(x)", B: "∃x ¬P(x)", claim: "equiv",
          insight: "量词否定律：『并非所有都 P』就是『存在某个不 P』——普遍与存在在否定下相互转化。",
          evalA: function (I, D) { return !D.every(function (x) { return I.P(x); }); },
          evalB: function (I, D) { return D.some(function (x) { return !I.P(x); }); },
          models: pModels() },
        { label: "¬∃xP(x)  与  ∀x¬P(x)", A: "¬∃x P(x)", B: "∀x ¬P(x)", claim: "equiv",
          insight: "另一条量词否定律：『不存在 P』等于『所有都不是 P』。",
          evalA: function (I, D) { return !D.some(function (x) { return I.P(x); }); },
          evalB: function (I, D) { return D.every(function (x) { return !I.P(x); }); },
          models: pModels() },
        { label: "¬∀xP(x)  与  ∀x¬P(x)  ✗易错", A: "¬∀x P(x)", B: "∀x ¬P(x)", claim: "notequiv",
          insight: "常见错误：『并非都 P』并不等于『都不是 P』——前者只要有一个反例，后者要求全体都不是。",
          evalA: function (I, D) { return !D.every(function (x) { return I.P(x); }); },
          evalB: function (I, D) { return D.every(function (x) { return !I.P(x); }); },
          models: pModels() }
      ]
    },
    advanced: {
      introStatus: "选择一组量词等值/次序问题，逐一核验解释模型，判定是等价、单向蕴含，还是用反例否定。",
      legend: [
        ["∀(∧)", "全称对合取可分配"],
        ["∃(∨)", "存在对析取可分配"],
        ["∀(∨)", "全称对析取不分配（仅蕴含）"],
        ["∀∃≠∃∀", "量词次序不可随意交换"],
        ["⇒", "单向蕴含"], ["反例", "否定等价的模型"]
      ],
      domain: ["a", "b"], domainLabel: "D = {a, b}",
      cases: [
        { label: "∀x(P(x)∧Q(x))  与  ∀xP(x) ∧ ∀xQ(x)", A: "∀x ( P(x) ∧ Q(x) )", B: "∀x P(x)  ∧  ∀x Q(x)", claim: "equiv",
          insight: "全称量词对合取可分配：『人人既 P 又 Q』= 『人人 P 且 人人 Q』。",
          evalA: function (I, D) { return D.every(function (x) { return I.P(x) && I.Q(x); }); },
          evalB: function (I, D) { return D.every(function (x) { return I.P(x); }) && D.every(function (x) { return I.Q(x); }); },
          models: pqModels() },
        { label: "∃x(P(x)∨Q(x))  与  ∃xP(x) ∨ ∃xQ(x)", A: "∃x ( P(x) ∨ Q(x) )", B: "∃x P(x)  ∨  ∃x Q(x)", claim: "equiv",
          insight: "存在量词对析取可分配：『有人 P 或 Q』=『有人 P 或 有人 Q』。",
          evalA: function (I, D) { return D.some(function (x) { return I.P(x) || I.Q(x); }); },
          evalB: function (I, D) { return D.some(function (x) { return I.P(x); }) || D.some(function (x) { return I.Q(x); }); },
          models: pqModels() },
        { label: "∀xP(x) ∨ ∀xQ(x)  与  ∀x(P(x)∨Q(x))", A: "∀x P(x)  ∨  ∀x Q(x)", B: "∀x ( P(x) ∨ Q(x) )", claim: "imp",
          insight: "全称对析取『不』分配：左 ⇒ 右，但右不一定推左——反例：有人只 P、有人只 Q。",
          evalA: function (I, D) { return D.every(function (x) { return I.P(x); }) || D.every(function (x) { return I.Q(x); }); },
          evalB: function (I, D) { return D.every(function (x) { return I.P(x) || I.Q(x); }); },
          models: pqModels() },
        { label: "∀x∃yR(x,y)  与  ∃y∀xR(x,y)  ✗次序", A: "∀x ∃y R(x,y)", B: "∃y ∀x R(x,y)", claim: "notequiv",
          insight: "量词次序不可交换：『人人都有所求』推不出『有一个被所有人求』——对角关系即反例。",
          evalA: function (I, D) { return D.every(function (x) { return D.some(function (y) { return I.R(x, y); }); }); },
          evalB: function (I, D) { return D.some(function (y) { return D.every(function (x) { return I.R(x, y); }); }); },
          models: rModels() }
      ]
    },
    extend: {
      introStatus: "选择一条前束/辖域等值改写，逐一核验模型，确认改写在语义上等价——这是查询优化与前束范式的基础。",
      legend: [
        ["辖域移动", "把量词提到最前（前束化）"],
        ["前束范式", "所有量词在最外层"],
        ["≡", "等价 · 可安全改写"],
        ["Q 闭式", "不含约束变元的子式"],
        ["查询优化", "嵌套子查询改写"]
      ],
      domain: ["a", "b"], domainLabel: "D = {a, b}",
      cases: [
        { label: "∀xP(x) ∧ Q  与  ∀x(P(x) ∧ Q)", A: "∀x P(x)  ∧  Q", B: "∀x ( P(x) ∧ Q )", claim: "equiv",
          insight: "Q 不含 x（闭式），可自由移进/移出 ∀ 的辖域——前束化的基本一步（如把过滤条件并入子查询）。",
          evalA: function (I, D) { return D.every(function (x) { return I.P(x); }) && I.prop("Q"); },
          evalB: function (I, D) { return D.every(function (x) { return I.P(x) && I.prop("Q"); }); },
          models: pQpropModels() },
        { label: "(∀xP(x)) → Q  与  ∃x(P(x) → Q)", A: "( ∀x P(x) )  →  Q", B: "∃x ( P(x) → Q )", claim: "equiv",
          insight: "前件里的 ∀ 移到外层会翻成 ∃（蕴含的前件取反）——前束化的关键易错点。",
          evalA: function (I, D) { return (!D.every(function (x) { return I.P(x); })) || I.prop("Q"); },
          evalB: function (I, D) { return D.some(function (x) { return !I.P(x) || I.prop("Q"); }); },
          models: pQpropModels() },
        { label: "∃xP(x) → ∀yQ(y)  与  ∀x∀y(P(x)→Q(y))", A: "∃x P(x)  →  ∀y Q(y)", B: "∀x ∀y ( P(x) → Q(y) )", claim: "equiv",
          insight: "把两个量词都提到最前得到前束范式——嵌套『子查询』改写为统一的全称约束。",
          evalA: function (I, D) { return (!D.some(function (x) { return I.P(x); })) || D.every(function (y) { return I.Q(y); }); },
          evalB: function (I, D) { return D.every(function (x) { return D.every(function (y) { return !I.P(x) || I.Q(y); }); }); },
          models: pqModels() }
      ]
    }
  };

  /* ---- 模型集合（curated） ---- */
  function pModels() {
    return [
      { disp: "P(a)=T, P(b)=T", P: { a: true, b: true } },
      { disp: "P(a)=T, P(b)=F", P: { a: true, b: false } },
      { disp: "P(a)=F, P(b)=T", P: { a: false, b: true } },
      { disp: "P(a)=F, P(b)=F", P: { a: false, b: false } }
    ];
  }
  function pqModels() {
    return [
      { disp: "P:TT  Q:TT", P: { a: true, b: true }, Q: { a: true, b: true } },
      { disp: "P:TT  Q:TF", P: { a: true, b: true }, Q: { a: true, b: false } },
      { disp: "P:TF  Q:FT", P: { a: true, b: false }, Q: { a: false, b: true } },
      { disp: "P:FF  Q:TT", P: { a: false, b: false }, Q: { a: true, b: true } }
    ];
  }
  function rModels() {
    return [
      { disp: "R: 对角(a→a, b→b)", R: { a: { a: true, b: false }, b: { a: false, b: true } } },
      { disp: "R: 全真(都相关)", R: { a: { a: true, b: true }, b: { a: true, b: true } } },
      { disp: "R: 全假(都无关)", R: { a: { a: false, b: false }, b: { a: false, b: false } } },
      { disp: "R: 都指向 a", R: { a: { a: true, b: false }, b: { a: true, b: false } } }
    ];
  }
  function pQpropModels() {
    return [
      { disp: "P:TT  Q=T", P: { a: true, b: true }, props: { Q: true } },
      { disp: "P:TT  Q=F", P: { a: true, b: true }, props: { Q: false } },
      { disp: "P:TF  Q=T", P: { a: true, b: false }, props: { Q: true } },
      { disp: "P:FF  Q=F", P: { a: false, b: false }, props: { Q: false } }
    ];
  }

  function computeCase(c, domain) {
    var D = domain || c.domain || ["a", "b"];
    var rows = c.models.map(function (m, i) {
      var I = makeI(m);
      var a = !!c.evalA(I, D), b = !!c.evalB(I, D);
      return { i: i, disp: m.disp, a: a, b: b, same: a === b };
    });
    var allMatch = rows.every(function (r) { return r.same; });
    var aImpB = rows.every(function (r) { return !r.a || r.b; });
    var bImpA = rows.every(function (r) { return !r.b || r.a; });
    var counter = null;
    for (var j = 0; j < rows.length; j++) { if (!rows[j].same) { counter = j; break; } }
    return { domain: D, rows: rows, allMatch: allMatch, aImpB: aImpB, bImpA: bImpA, counter: counter, claim: c.claim, insight: c.insight, A: c.A, B: c.B };
  }

  function verdictOf(st, simple) {
    if (st.allMatch) {
      return { key: "equiv", chip: "逻辑等价  A ≡ B",
        reason: "在全部 " + st.rows.length + " 个解释模型下，A 与 B 取值<b>完全相同</b> ⟹ <b>逻辑等价</b>（量词等值式）。" };
    }
    if (simple) {
      return { key: "notequiv", chip: "不等价（真值不同）",
        reason: "存在反例（模型 " + (st.counter + 1) + "）使 A、B 取值<b>不同</b> ⟹ 二者<b>不等价</b>。" };
    }
    if (st.aImpB) {
      return { key: "imp", chip: "A ⇒ B（蕴含）",
        reason: "凡 A 真处 B 亦真（A ⇒ B），但模型 " + (st.counter + 1) + " 使两者取值不同 ⟹ <b>蕴含但不等价</b>。" };
    }
    if (st.bImpA) {
      return { key: "imp", chip: "B ⇒ A（蕴含）",
        reason: "凡 B 真处 A 亦真（B ⇒ A），但并不处处相同 ⟹ <b>蕴含但不等价</b>。" };
    }
    return { key: "notequiv", chip: "不等价（无单向蕴含）",
      reason: "存在反例（模型 " + (st.counter + 1) + "）使 A、B 取值不同，且无单向蕴含 ⟹ <b>不等价</b>。" };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { LEVELS: LEVELS, computeCase: computeCase, verdictOf: verdictOf };
  }

  /* ====================== 以下仅浏览器运行 ====================== */
  if (typeof document === "undefined") return;

  var SVGNS = "http://www.w3.org/2000/svg";
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function svgEl(type, attrs) { var el = document.createElementNS(SVGNS, type); if (attrs) for (var k in attrs) el.setAttribute(k, attrs[k]); return el; }
  function byId(id) { return document.getElementById(id); }
  function TF(v) { return v ? "T" : "F"; }

  function run() {
    var levelKey = global.SYMBOLIZE_LEVEL || "basic";
    var cfg = LEVELS[levelKey] || LEVELS.basic;
    var simple = !!cfg.simple;

    var controlsEl = byId("controls");
    var pairEl = byId("frPair");
    var interpsEl = byId("frInterps");
    var evalEl = byId("frEval");
    var chartEl = byId("frChart");
    var verdictEl = byId("frVerdict");
    if (!controlsEl || !pairEl) return;

    var st = null, vd = null;
    var p = 0, manualFocus = null, autoTimer = null;
    var rowEls = [], cellEls = [], resA = null, resB = null, midEl = null;
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.cases.map(function (c, i) { return '<option value="' + i + '">' + esc(c.label) + '</option>'; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label><span>选择关系</span><small>A 与 B</small></label>' +
          '<select id="frSelect">' + opts + '</select></div>' +
        '<div class="control-group"><label><span>逐一核验模型</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button class="sym-step-btn" id="frPrev">◀ 上一步</button>' +
            '<button class="sym-step-btn sym-primary" id="frNext">下一步 ▶</button>' +
            '<button class="sym-step-btn" id="frAuto">⏵ 自动播放</button>' +
            '<button class="sym-step-btn" id="frReset">↺ 重置</button>' +
          '</div></div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="frProgBar"></i></div>' +
          '<span class="sym-progress-num" id="frProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="frStatus"></div></div>';
      statusEl = byId("frStatus"); progBar = byId("frProgBar"); progNum = byId("frProgNum");
      prevBtn = byId("frPrev"); nextBtn = byId("frNext"); autoBtn = byId("frAuto");
      byId("frSelect").addEventListener("change", function (e) { loadCase(+e.target.value); });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("frReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
    }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      box.innerHTML = '<div class="legend-title">量词关系说明</div><div class="legend-grid">' +
        cfg.legend.map(function (it) { return '<div class="legend-item"><span class="sym">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + '</span></div>'; }).join("") + '</div>';
    }

    function loadCase(idx) {
      stopAuto();
      st = computeCase(cfg.cases[idx], cfg.domain);
      vd = verdictOf(st, simple);
      p = 0; manualFocus = null;
      renderPair(); renderInterps(); renderChart();
      evalEl.innerHTML = "";
      render();
    }

    function renderPair() {
      var claimSym = st.claim === "equiv" ? "≡ ?" : st.claim === "imp" ? "⇒ ?" : "≡ ?";
      pairEl.innerHTML =
        '<div class="fr-card is-A"><span class="fr-name">公式 A</span><div class="fr-formula">' + esc(st.A) + '</div><span class="fr-result" id="frResA">A = ?</span></div>' +
        '<div class="fr-mid" id="frMid">' + claimSym + '</div>' +
        '<div class="fr-card is-B"><span class="fr-name">公式 B</span><div class="fr-formula">' + esc(st.B) + '</div><span class="fr-result" id="frResB">B = ?</span></div>' +
        '<div class="fr-claim">论域 <code>' + esc(cfg.domainLabel) + '</code>，逐一核验 <b>' + st.rows.length + '</b> 个解释模型，比较 A、B 是否处处同真值。</div>';
      resA = byId("frResA"); resB = byId("frResB"); midEl = byId("frMid");
    }

    function renderInterps() {
      interpsEl.innerHTML = "";
      rowEls = st.rows.map(function (r, i) {
        var d = document.createElement("div");
        d.className = "fr-interp " + (r.same ? "m-same" : "m-diff");
        d.dataset.row = i;
        d.innerHTML = '<span class="mi-disp">模型 ' + (i + 1) + '：' + esc(r.disp) + '</span>' +
          '<span class="mi-tag t-a">A=' + TF(r.a) + '</span>' +
          '<span class="mi-tag t-b">B=' + TF(r.b) + '</span>' +
          '<span class="mi-tag t-cmp ' + (r.same ? "same" : "diff") + '">' + (r.same ? "一致 =" : "不同 ≠") + '</span>';
        d.addEventListener("click", function () { clickRow(i); });
        interpsEl.appendChild(d);
        return d;
      });
    }

    function renderChart() {
      chartEl.innerHTML = "";
      var N = st.rows.length, VW = 760, x0 = 86, cw = Math.min(110, (VW - x0 - 14) / N);
      var H = 132, yA = 30, yB = 78, ch = 36;
      var svg = svgEl("svg", { id: "frChart", viewBox: "0 0 " + VW + " " + H, width: "100%", height: H });
      var g = svgEl("g"); svg.appendChild(g);
      [["A", yA, "#2f5f9f"], ["B", yB, "#9a6a12"]].forEach(function (lab) {
        var t = svgEl("text", { x: 14, y: lab[1] + ch / 2, "dominant-baseline": "central", fill: lab[2], "font-size": 15, "font-weight": "800", "font-family": "JetBrains Mono, monospace" });
        t.textContent = "公式 " + lab[0]; g.appendChild(t);
      });
      cellEls = st.rows.map(function (r, i) {
        var x = x0 + i * cw;
        function cell(val, y) {
          var rect = svgEl("rect", { x: x, y: y, width: cw - 8, height: ch, rx: 6, fill: val ? "#cdebd9" : "#f6d3ce", stroke: val ? "#2f7d57" : "#d63b1d", "stroke-width": 1.5 });
          var t = svgEl("text", { x: x + (cw - 8) / 2, y: y + ch / 2, "text-anchor": "middle", "dominant-baseline": "central", fill: val ? "#1d6b43" : "#97180f", "font-size": 13, "font-weight": "800", "font-family": "JetBrains Mono, monospace" }); t.textContent = TF(val);
          return [rect, t];
        }
        var ca = cell(r.a, yA), cb = cell(r.b, yB);
        var wrap = svgEl("g"); wrap.setAttribute("class", "fr-cell"); wrap.dataset.row = i;
        wrap.appendChild(ca[0]); wrap.appendChild(ca[1]); wrap.appendChild(cb[0]); wrap.appendChild(cb[1]);
        var lab = svgEl("text", { x: x + (cw - 8) / 2, y: 18, "text-anchor": "middle", fill: "#6b4a38", "font-size": 11, "font-weight": "700" }); lab.textContent = "模型" + (i + 1);
        g.appendChild(lab);
        if (!r.same) { var mk = svgEl("text", { x: x + (cw - 8) / 2, y: yB + ch + 14, "text-anchor": "middle", fill: "#d63b1d", "font-size": 13, "font-weight": "800" }); mk.textContent = "≠"; g.appendChild(mk); }
        wrap.addEventListener("click", function () { clickRow(i); });
        g.appendChild(wrap);
        return { wrap: wrap, ra: ca[0], rb: cb[0] };
      });
      chartEl.appendChild(svg);
    }

    function total() { return st.rows.length + 1; }
    function step(dir) { manualFocus = null; p = Math.max(0, Math.min(total(), p + dir)); render(); }
    function clickRow(i) {
      stopAuto();
      var n = st.rows.length;
      if (p <= n) { p = i + 1; manualFocus = null; }
      else { manualFocus = (manualFocus === i ? null : i); }
      render();
    }
    function toggleAuto() {
      if (autoTimer) { stopAuto(); return; }
      if (p >= total()) { p = 0; manualFocus = null; render(); }
      autoBtn.classList.add("sym-playing"); autoBtn.textContent = "⏸ 暂停";
      autoTimer = setInterval(function () { if (p >= total()) { stopAuto(); return; } manualFocus = null; p += 1; render(); }, 1000);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } if (autoBtn) { autoBtn.classList.remove("sym-playing"); autoBtn.textContent = "⏵ 自动播放"; } }

    function render() {
      var n = st.rows.length, T = n + 1;
      var shown = Math.min(p, n);
      var verdictShown = p > n;
      var stepRow = (p >= 1 && p <= n) ? p - 1 : null;
      var focusRow = (manualFocus != null) ? manualFocus : stepRow;

      for (var k = 0; k < n; k++) {
        var revealed = k < shown || verdictShown;
        var isCur = (k === focusRow);
        if (rowEls[k]) { rowEls[k].classList.toggle("sym-pending", !revealed); rowEls[k].classList.toggle("sym-cur", isCur); }
        if (cellEls[k]) { cellEls[k].wrap.classList.toggle("sym-pending", !revealed); cellEls[k].wrap.classList.toggle("sym-cur", isCur); }
      }

      if (focusRow != null) {
        var r = st.rows[focusRow];
        setRes(resA, "A = " + TF(r.a), r.a); setRes(resB, "B = " + TF(r.b), r.b);
        if (midEl) midEl.textContent = r.same ? "=" : "≠";
      } else { setRes(resA, "A = ?", null); setRes(resB, "B = ?", null); if (midEl) midEl.textContent = st.claim === "imp" ? "⇒ ?" : "≡ ?"; }

      evalEl.innerHTML = evalHTML(focusRow, verdictShown);
      renderVerdict(verdictShown);

      progNum.textContent = p + " / " + T;
      progBar.style.width = (T ? (p / T * 100) : 0) + "%";
      prevBtn.disabled = (p <= 0 && manualFocus == null);
      nextBtn.disabled = (p >= T);
      statusEl.innerHTML = statusHTML(p, focusRow, verdictShown);
    }

    function setRes(el, txt, v) { el.textContent = txt; el.classList.remove("r-true", "r-false"); if (v === true) el.classList.add("r-true"); else if (v === false) el.classList.add("r-false"); }

    function evalHTML(focusRow, verdictShown) {
      if (focusRow == null && !verdictShown) return '<span style="color:#6b4a38">点「下一步」逐一核验解释模型。每个模型给谓词/关系一组赋值，分别算出 A、B 的真值并比较。</span>';
      if (focusRow == null && verdictShown) return '已核验全部 <b>' + st.rows.length + '</b> 个模型，下方给出关系判定。可点任意模型回看。';
      var r = st.rows[focusRow];
      return '<div>模型 <span class="ev-m">' + (focusRow + 1) + '：' + esc(r.disp) + '</span></div>' +
        '<div class="ev-line" style="margin-top:4px">A = <span class="ev-' + (r.a ? "t" : "f") + '">' + TF(r.a) + '</span>，B = <span class="ev-' + (r.b ? "t" : "f") + '">' + TF(r.b) + '</span> → ' +
        (r.same ? '<span class="ev-t">一致（=）</span>' : '<span class="ev-f">不同（≠）—— 反例！可否定『等价』</span>') + '</div>';
    }

    function renderVerdict(show) {
      verdictEl.className = "fr-verdict k-" + vd.key + (show ? "" : " sym-pending");
      verdictEl.innerHTML = '<span class="v-chip">关系判定：' + esc(vd.chip) + '</span>' +
        '<div class="v-reason">' + (show ? vd.reason : "逐一核验完成后给出结论…") + '</div>' +
        (show && st.insight ? '<div class="v-insight">💡 ' + esc(st.insight) + '</div>' : "");
    }

    function statusHTML(pp, focusRow, verdictShown) {
      if (pp === 0) return cfg.introStatus;
      if (focusRow != null) {
        var r = st.rows[focusRow];
        return '模型 <b>' + (focusRow + 1) + '</b>（' + esc(r.disp) + '）：A=' + TF(r.a) + '，B=' + TF(r.b) + '，' + (r.same ? '一致 =' : '<b>不同 ≠</b>') + '。';
      }
      if (verdictShown) return '✅ <b>' + esc(vd.chip) + '</b>　可点任意模型 / 指纹格回看。';
      return "";
    }

    renderControls();
    renderLegend();
    loadCase(0);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})(typeof window !== "undefined" ? window : globalThis);
