/* =====================================================================
 * 6.4 谓词公式之间的关系 —— 三层统一交互引擎（量词关系翻转器）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与本章其它小节同形）：选择关系 → 逐一核验解释模型
 *   点一步看一个解释（论域 + 谓词/关系赋值）→ 看反馈（A、B 在该模型的真值是否一致）
 *   → 看解释卡高亮、真值指纹图高亮 → 给出结论：反例可严格否定等价/蕴含；
 *   所核验模型中处处同值只说明与等值式一致，等价性由等值式对一切解释成立来保证。
 *   完成后可点任意模型 / 指纹格回看。
 *
 * 难度梯度：
 *   基础层：量词否定律（¬∀=∃¬、¬∃=∀¬）以及易错的『¬∀ ≠ ∀¬』，一元谓词 4 模型。
 *   进阶层：量词分配（∀对∧、∃对∨）、∀对∨不分配（蕴含非等价）、∃y∀x ⇒ ∀x∃y 单向成立（二元关系反例）。
 *   拓展层：辖域收缩与扩张、前件量词外提翻转、前束化等值改写（查询优化 / 嵌套子查询改写）。
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
      introStatus: "选择一组公式，点「下一步」逐一核验有限论域上的解释，看 A、B 真值是否处处一致：找到反例即可否定等价，处处一致则与量词否定律相印证。",
      legend: [
        ["¬∀=∃¬", "并非都 P = 存在不 P"],
        ["¬∃=∀¬", "不存在 P = 都不是 P"],
        ["≡", "逻辑等价 · 任一解释下真值相同"],
        ["反例", "使 A、B 取值不同的解释 · 否定等价"],
        ["核验", "有限模型只能印证，不能代替证明"]
      ],
      domain: ["a", "b"], domainLabel: "D = {a, b}",
      cases: [
        { label: "¬∀xP(x)  与  ∃x¬P(x)", A: "¬∀x P(x)", B: "∃x ¬P(x)", claim: "equiv",
          insight: "量词否定律：『并非所有都 P』就是『存在某个不 P』——否定号越过量词时，∀ 与 ∃ 互换。",
          evalA: function (I, D) { return !D.every(function (x) { return I.P(x); }); },
          evalB: function (I, D) { return D.some(function (x) { return !I.P(x); }); },
          models: pModels() },
        { label: "¬∃xP(x)  与  ∀x¬P(x)", A: "¬∃x P(x)", B: "∀x ¬P(x)", claim: "equiv",
          insight: "另一条量词否定律：『不存在 P』等于『所有都不是 P』。",
          evalA: function (I, D) { return !D.some(function (x) { return I.P(x); }); },
          evalB: function (I, D) { return D.every(function (x) { return !I.P(x); }); },
          models: pModels() },
        { label: "¬∀xP(x)  与  ∀x¬P(x)  ✗易错", A: "¬∀x P(x)", B: "∀x ¬P(x)", claim: "notequiv",
          insight: "常见错误：『并非都 P』并不等于『都不是 P』——前者只要有一个例外，后者要求全体都不是。反方向 ∀x¬P(x) ⇒ ¬∀xP(x) 成立（论域非空），但反之不成立。",
          evalA: function (I, D) { return !D.every(function (x) { return I.P(x); }); },
          evalB: function (I, D) { return D.every(function (x) { return !I.P(x); }); },
          models: pModels() }
      ]
    },
    advanced: {
      introStatus: "选择一组量词分配/次序问题，逐一核验解释模型：反例可严格否定等价或某一方向的蕴含，处处同值则与等值式相印证。",
      legend: [
        ["∀(∧)", "全称对合取可分配"],
        ["∃(∨)", "存在对析取可分配"],
        ["∀(∨)", "全称对析取不分配（仅蕴含）"],
        ["∃∀⇒∀∃", "∃y∀x ⇒ ∀x∃y，反之不成立"],
        ["⇒", "单向蕴含 · A 真的解释下 B 必真"], ["反例", "否定等价/蕴含的解释"]
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
          insight: "全称对析取『不』分配：∀xP(x)∨∀xQ(x) ⇒ ∀x(P(x)∨Q(x))，反之不成立——反例：a 只 P、b 只 Q，人人 P 或 Q，却既非人人 P 也非人人 Q。",
          evalA: function (I, D) { return D.every(function (x) { return I.P(x); }) || D.every(function (x) { return I.Q(x); }); },
          evalB: function (I, D) { return D.every(function (x) { return I.P(x) || I.Q(x); }); },
          models: pqModels() },
        { label: "∃y∀xR(x,y)  与  ∀x∃yR(x,y)  ✗次序", A: "∃y ∀x R(x,y)", B: "∀x ∃y R(x,y)", claim: "imp",
          insight: "量词次序不可随意交换：∃y∀xR(x,y) ⇒ ∀x∃yR(x,y) 成立（有一个 y 被所有 x 关联，则每个 x 都有关联的 y）；反之不成立——对角关系 R(a,a)、R(b,b) 即反例：人人都有所求，却没有一个被所有人所求。",
          evalA: function (I, D) { return D.some(function (y) { return D.every(function (x) { return I.R(x, y); }); }); },
          evalB: function (I, D) { return D.every(function (x) { return D.some(function (y) { return I.R(x, y); }); }); },
          models: rModels() }
      ]
    },
    extend: {
      introStatus: "选择一条辖域/前束改写，逐一核验模型：找到反例说明改写错误；处处同值则与等值式相印证——改写的安全性由等值式对一切解释成立来保证。",
      legend: [
        ["辖域扩张", "把不含 x 的子式移入 ∀x/∃x 的辖域"],
        ["前束范式", "所有量词在最前，辖域延伸到公式末尾"],
        ["≡", "等价 · 由等值式保证，可安全改写"],
        ["Q 不含 x", "x 不在 Q 中自由出现，可移入/移出辖域"],
        ["前件外提", "(∀xP)→Q ≡ ∃x(P→Q)，∀、∃ 互换"]
      ],
      domain: ["a", "b"], domainLabel: "D = {a, b}",
      cases: [
        { label: "∀xP(x) ∧ Q  与  ∀x(P(x) ∧ Q)", A: "∀x P(x)  ∧  Q", B: "∀x ( P(x) ∧ Q )", claim: "equiv",
          insight: "x 不在 Q 中自由出现，Q 可以移入/移出 ∀x 的辖域——辖域扩张/收缩是前束化的基本一步（如把与 x 无关的过滤条件并入子查询）。",
          evalA: function (I, D) { return D.every(function (x) { return I.P(x); }) && I.prop("Q"); },
          evalB: function (I, D) { return D.every(function (x) { return I.P(x) && I.prop("Q"); }); },
          models: pQpropModels() },
        { label: "(∀xP(x)) → Q  与  ∃x(P(x) → Q)", A: "( ∀x P(x) )  →  Q", B: "∃x ( P(x) → Q )", claim: "equiv",
          insight: "前件里的 ∀ 移到外层会翻成 ∃：(∀xP(x))→Q ≡ ¬∀xP(x)∨Q ≡ ∃x¬P(x)∨Q ≡ ∃x(P(x)→Q)——前束化的关键易错点。",
          evalA: function (I, D) { return (!D.every(function (x) { return I.P(x); })) || I.prop("Q"); },
          evalB: function (I, D) { return D.some(function (x) { return !I.P(x) || I.prop("Q"); }); },
          models: pQpropModels() },
        { label: "(∀xP(x)) → Q  与  ∀x(P(x) → Q)  ✗错改", A: "( ∀x P(x) )  →  Q", B: "∀x ( P(x) → Q )", claim: "notequiv",
          insight: "错误改写：前件中的 ∀ 外提时没有翻成 ∃。实际上 ∀x(P(x)→Q) ≡ (∃xP(x))→Q，只蕴含 (∀xP(x))→Q，二者不等价——模型 P(a)=T、P(b)=F、Q=F 即反例（A 真 B 假）。",
          evalA: function (I, D) { return (!D.every(function (x) { return I.P(x); })) || I.prop("Q"); },
          evalB: function (I, D) { return D.every(function (x) { return !I.P(x) || I.prop("Q"); }); },
          models: pQpropModels() },
        { label: "∃xP(x) → ∀yQ(y)  与  ∀x∀y(P(x)→Q(y))", A: "∃x P(x)  →  ∀y Q(y)", B: "∀x ∀y ( P(x) → Q(y) )", claim: "equiv",
          insight: "前件的 ∃x 外提翻成 ∀x，后件的 ∀y 外提保持 ∀y（x、y 不同名，无需换名），得到前束范式——嵌套『子查询』改写为统一的全称约束。",
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
      { disp: "P:TF  Q=F", P: { a: true, b: false }, props: { Q: false } },
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

  /* 结论措辞：有限个模型上处处同值只能「印证」，不能证明等价/蕴含；
   * 而一个反例可以严格否定等价（或某一方向的蕴含）。 */
  function firstRow(st, fn) { for (var j = 0; j < st.rows.length; j++) { if (fn(st.rows[j])) return j; } return null; }
  function verdictOf(st, simple) {
    var N = st.rows.length;
    if (st.allMatch) {
      return { key: "equiv", chip: "处处同值 · 与 A ≡ B 一致",
        reason: "所核验的 " + N + " 个解释模型中，A 与 B <b>处处同值</b>，与量词等值式 A ≡ B 一致。" +
          "（有限个模型只能印证，<b>等价性由该等值式对一切解释成立来保证</b>。）" };
    }
    var k = st.counter + 1;
    if (simple) {
      return { key: "notequiv", chip: "反例 · A、B 不等价",
        reason: "模型 " + k + " 使 A、B 取值<b>不同</b>——一个反例即可严格说明二者<b>不等价</b>。" };
    }
    if (st.aImpB) {
      return { key: "imp", chip: "A ⇒ B，但不等价",
        reason: "模型 " + k + " 使 A 假而 B 真，是反例 ⟹ <b>B ⇏ A，二者不等价</b>（严格）。" +
          "另一方向：所核验模型中凡 A 真处 B 亦真，与 A ⇒ B 一致（蕴含性需对一切解释证明）。" };
    }
    if (st.bImpA) {
      return { key: "imp", chip: "B ⇒ A，但不等价",
        reason: "模型 " + k + " 使 B 假而 A 真，是反例 ⟹ <b>A ⇏ B，二者不等价</b>（严格）。" +
          "另一方向：所核验模型中凡 B 真处 A 亦真，与 B ⇒ A 一致（蕴含性需对一切解释证明）。" };
    }
    var i1 = firstRow(st, function (r) { return r.a && !r.b; }) + 1;
    var i2 = firstRow(st, function (r) { return r.b && !r.a; }) + 1;
    return { key: "notequiv", chip: "反例 · 互不蕴含",
      reason: "模型 " + i1 + " 使 A 真 B 假、模型 " + i2 + " 使 B 真 A 假 ⟹ 两个方向的蕴含都被反例否定，<b>A、B 不等价</b>（严格）。" };
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
            '<button class="sym-step-btn sym-ghost" id="frReset">↺ 重置</button>' +
          '</div>' +
          '<div class="sym-speed"><span>慢</span><input type="range" id="frSpeed" min="1" max="100" value="55" aria-label="自动播放速度"><span>快</span></div>' +
        '</div>' +
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
      byId("frSpeed").addEventListener("input", function () { if (autoTimer) { stopAuto(); toggleAuto(); } });
    }
    function autoDelay() { var sp = byId("frSpeed"); return Math.max(280, 1500 - Number(sp ? sp.value : 55) * 12); }

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
      var svg = svgEl("svg", { id: "frChartSvg", role: "img", "aria-label": "A、B 两式在各模型下的真值指纹", viewBox: "0 0 " + VW + " " + H, width: "100%", height: H });
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
      autoTimer = setInterval(function () { if (p >= total()) { stopAuto(); return; } manualFocus = null; p += 1; render(); }, autoDelay());
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
      if (focusRow == null && verdictShown) return '已核验全部 <b>' + st.rows.length + '</b> 个模型，下方给出结论。可点任意模型回看。';
      var r = st.rows[focusRow];
      return '<div>模型 <span class="ev-m">' + (focusRow + 1) + '：' + esc(r.disp) + '</span></div>' +
        '<div class="ev-line" style="margin-top:4px">A = <span class="ev-' + (r.a ? "t" : "f") + '">' + TF(r.a) + '</span>，B = <span class="ev-' + (r.b ? "t" : "f") + '">' + TF(r.b) + '</span> → ' +
        (r.same ? '<span class="ev-t">一致（=）</span>' : '<span class="ev-f">不同（≠）—— 反例！可严格否定『等价』</span>') + '</div>';
    }

    function renderVerdict(show) {
      verdictEl.className = "fr-verdict k-" + vd.key + (show ? "" : " sym-pending");
      verdictEl.innerHTML = '<span class="v-chip">结论：' + esc(vd.chip) + '</span>' +
        '<div class="v-reason">' + (show ? vd.reason : "逐一核验完成后给出结论…") + '</div>' +
        (show && st.insight ? '<div class="v-insight">💡 ' + esc(st.insight) + '</div>' : "");
    }

    function statusHTML(pp, focusRow, verdictShown) {
      if (pp === 0) return cfg.introStatus;
      if (focusRow != null) {
        var r = st.rows[focusRow];
        return '模型 <b>' + (focusRow + 1) + '</b>（' + esc(r.disp) + '）：A=' + TF(r.a) + '，B=' + TF(r.b) + '，' + (r.same ? '一致 =' : '<b>不同 ≠</b>（反例）') + '。';
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
