/* =====================================================================
 * 5.5 对偶与范式 —— 三层统一交互引擎
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取层级。
 *
 *   基础层（dual 模式）：对偶原理。给一条等值式 A⇔B，
 *       ① 先把 →、↔ 化为 ¬ ∧ ∨；② ∧↔∨、0↔1 互换（¬ 不变）得对偶式 A*、B*；
 *       ③ 逐行扫描真值表比对 A、B、A*、B*；④ 验证 A*⇔B*，
 *       并观察 A*(p,q,…) = ¬A(¬p,¬q,…)：A* 的真值列 = A 的真值列倒序再取反。
 *   进阶层（nf 模式）：主析取 / 主合取范式。3 变元真值表逐行提取
 *       极小项 m_i（成真赋值）与极大项 M_i（成假赋值），编号互补，主范式唯一。
 *   拓展层（nf 模式）：电路综合与 SAT。PDNF = 积之和（两级与–或电路），
 *       CNF 子句集 = SAT 求解器的标准输入，真行 = 可满足赋值（模型）。
 *
 * 编号约定（与教材一致）：变元按字母序排列，变元取真记 1；
 *   m_i：成真赋值对应的二进制数为 i，变元为 1 取原形、为 0 取否定；
 *   M_i：成假赋值对应的二进制数为 i，变元为 0 取原形、为 1 取否定。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* ---------- 命题公式求值器（¬ ∧ ∨ → ↔，变元 a-z，常元 0/1，括号） ---------- */
  function parse(expr) {
    var i = 0, s = expr;
    function peek() { while (i < s.length && s[i] === " ") i++; return s[i]; }
    function next() { var c = peek(); i++; return c; }
    function pIff() { var l = pImp(); while (peek() === "↔") { next(); l = { op: "↔", l: l, r: pImp() }; } return l; }
    function pImp() { var l = pOr(); if (peek() === "→") { next(); return { op: "→", l: l, r: pImp() }; } return l; }
    function pOr() { var l = pAnd(); while (peek() === "∨") { next(); l = { op: "∨", l: l, r: pAnd() }; } return l; }
    function pAnd() { var l = pNot(); while (peek() === "∧") { next(); l = { op: "∧", l: l, r: pNot() }; } return l; }
    function pNot() { if (peek() === "¬") { next(); return { op: "¬", r: pNot() }; } return pAtom(); }
    function pAtom() {
      var c = peek();
      if (c === "(") { next(); var e = pIff(); if (peek() === ")") next(); return e; }
      next();
      if (c === "0" || c === "1") return { c: c === "1" };
      return { v: c };
    }
    return pIff();
  }
  function ev(n, env) {
    if (n.c !== undefined) return n.c;
    if (n.v !== undefined) return !!env[n.v];
    switch (n.op) {
      case "¬": return !ev(n.r, env);
      case "∧": return ev(n.l, env) && ev(n.r, env);
      case "∨": return ev(n.l, env) || ev(n.r, env);
      case "→": return !ev(n.l, env) || ev(n.r, env);
      case "↔": return ev(n.l, env) === ev(n.r, env);
    }
    return false;
  }
  function makeEval(expr) { var ast = parse(expr); return function (env) { return ev(ast, env); }; }

  /* 对偶（供自检）：先消去 →、↔，再 ∧↔∨、0↔1 互换，¬ 不变 */
  function dualAst(n) {
    if (n.c !== undefined) return { c: !n.c };
    if (n.v !== undefined) return { v: n.v };
    switch (n.op) {
      case "¬": return { op: "¬", r: dualAst(n.r) };
      case "∧": return { op: "∨", l: dualAst(n.l), r: dualAst(n.r) };
      case "∨": return { op: "∧", l: dualAst(n.l), r: dualAst(n.r) };
      case "→": return dualAst({ op: "∨", l: { op: "¬", r: n.l }, r: n.r });
      case "↔": return dualAst({ op: "∧", l: { op: "∨", l: { op: "¬", r: n.l }, r: n.r }, r: { op: "∨", l: n.l, r: { op: "¬", r: n.r } } });
    }
    return n;
  }

  function envOf(vars, m) {
    var env = {}, n = vars.length;
    for (var k = 0; k < n; k++) env[vars[k]] = !!(m & (1 << (n - 1 - k)));
    return env;
  }
  function bitsOf(vars, env) { return vars.map(function (v) { return env[v] ? "1" : "0"; }).join(""); }

  /* ---------- 主范式：真值表 + 极小项/极大项 ---------- */
  function computeCase(c) {
    var vars = c.vars, n = vars.length, f = makeEval(c.expr);
    var rows = [];
    for (var m = 0; m < (1 << n); m++) {
      var env = envOf(vars, m);
      var val = f(env);
      var minterm = "(" + vars.map(function (v) { return env[v] ? v : "¬" + v; }).join(" ∧ ") + ")";
      var maxterm = "(" + vars.map(function (v) { return env[v] ? "¬" + v : v; }).join(" ∨ ") + ")";
      rows.push({ i: m, env: env, val: val, minterm: minterm, maxterm: maxterm, bits: bitsOf(vars, env) });
    }
    var ones = rows.filter(function (r) { return r.val; });
    var zeros = rows.filter(function (r) { return !r.val; });
    return { vars: vars, rows: rows, ones: ones, zeros: zeros };
  }

  /* ---------- 对偶：真值表四列 A、B、A*、B* ---------- */
  function computeDual(c) {
    var vars = c.vars, n = vars.length;
    var fA = makeEval(c.A), fB = makeEval(c.B), fAd = makeEval(c.Ad), fBd = makeEval(c.Bd);
    var rows = [];
    for (var m = 0; m < (1 << n); m++) {
      var env = envOf(vars, m);
      rows.push({ i: m, env: env, bits: bitsOf(vars, env), A: fA(env), B: fB(env), Ad: fAd(env), Bd: fBd(env) });
    }
    return {
      vars: vars, rows: rows,
      eqAB: rows.every(function (r) { return r.A === r.B; }),
      eqDual: rows.every(function (r) { return r.Ad === r.Bd; })
    };
  }

  /* ---------- 三层数据 ---------- */
  var LEVELS = {
    basic: {
      mode: "dual",
      selectLabel: "选择等值式",
      selectHint: "A ⇔ B",
      introStatus: "选一条等值式，点「下一步」：先化去 →、↔，再把 ∧↔∨、0↔1 互换（¬ 不变）写出对偶式，最后逐行验证对偶原理。",
      legendTitle: "对偶符号说明",
      legend: [
        ["A*", "A 的对偶式"], ["∧ ↔ ∨", "合取、析取互换"], ["0 ↔ 1", "常元互换"],
        ["¬", "否定联结词保持不变"], ["→ ↔", "先化为 ¬ ∧ ∨ 再对偶"], ["1 / 0", "真 / 假"]
      ],
      cases: [
        { label: "德摩根律 ¬(p∧q) ⇔ ¬p∨¬q", law: "德摩根律", dualLaw: "德摩根律的另一半", vars: ["p", "q"],
          A: "¬(p ∧ q)", B: "¬p ∨ ¬q", Ad: "¬(p ∨ q)", Bd: "¬p ∧ ¬q",
          scenario: "由德摩根律的一半，对偶原理直接给出另一半：¬(p∨q) ⇔ ¬p∧¬q。" },
        { label: "吸收律 p∨(p∧q) ⇔ p", law: "吸收律", dualLaw: "另一条吸收律", vars: ["p", "q"],
          A: "p ∨ (p ∧ q)", B: "p", Ad: "p ∧ (p ∨ q)", Bd: "p",
          scenario: "单个变元 p 没有联结词可换，对偶后不变；左边 ∧、∨ 互换，得到另一条吸收律。" },
        { label: "排中律 p∨¬p ⇔ 1", law: "排中律", dualLaw: "矛盾律", vars: ["p"],
          A: "p ∨ ¬p", B: "1", Ad: "p ∧ ¬p", Bd: "0",
          scenario: "常元也要互换：1 变 0。排中律的对偶正是矛盾律 p∧¬p ⇔ 0。" },
        { label: "含蕴含 p∧(p→q) ⇔ p∧q", law: "蕴含化简式", dualLaw: "对偶等值式", vars: ["p", "q"],
          A: "p ∧ (p → q)", B: "p ∧ q", elimA: "p ∧ (¬p ∨ q)", Ad: "p ∨ (¬p ∧ q)", Bd: "p ∨ q",
          scenario: "对偶式只对 ¬ ∧ ∨ 定义：必须先用 p→q ⇔ ¬p∨q 消去 →，再互换 ∧、∨。直接把 → 当作不变是常见错误。" },
        { label: "分配律 p∧(q∨r) ⇔ (p∧q)∨(p∧r)", law: "∧ 对 ∨ 的分配律", dualLaw: "∨ 对 ∧ 的分配律", vars: ["p", "q", "r"],
          A: "p ∧ (q ∨ r)", B: "(p ∧ q) ∨ (p ∧ r)", Ad: "p ∨ (q ∧ r)", Bd: "(p ∨ q) ∧ (p ∨ r)",
          scenario: "3 个变元、8 行真值表：一条分配律经对偶得到另一条分配律。" }
      ]
    },
    advanced: {
      mode: "nf",
      selectLabel: "选择公式",
      selectHint: "目标真值函数",
      introStatus: "选择一个公式，逐行扫描真值表：成真赋值 → 极小项 m_i → 主析取范式；成假赋值 → 极大项 M_i → 主合取范式。",
      legendTitle: "范式符号说明",
      legend: [
        ["m_i", "极小项：成真赋值编号 i"], ["M_i", "极大项：成假赋值编号 i"],
        ["Σ", "主析取范式 = 极小项之析取"], ["Π", "主合取范式 = 极大项之合取"],
        ["M_i=¬m_i", "同编号极大项与极小项互为否定"], ["1 / 0", "真 / 假"]
      ],
      note: "<b>编号规则：</b>变元按字母序排列，变元取真记 1。m<sub>i</sub> 中变元为 1 取原形、为 0 取否定；M<sub>i</sub> 中变元为 0 取原形、为 1 取否定，于是 M<sub>i</sub> ⇔ ¬m<sub>i</sub>。" +
        "<br><b>唯一性：</b>主析取范式的编号 = 成真赋值集，主合取范式的编号 = 成假赋值集，二者互补、合起来恰为 0…2<sup>n</sup>−1。同一真值函数不论原式如何变形，主范式都相同。" +
        "<br><b>另一条路：</b>也可用等值演算求主范式——消去 →、↔，否定内移，用分配律化为析取/合取范式，再用 A ⇔ A∧(q∨¬q)（或 A∨(q∧¬q)）补齐缺失变元。",
      cases: [
        { label: "(p → q) ∧ (q → r)", vars: ["p", "q", "r"], expr: "(p → q) ∧ (q → r)",
          scenario: "蕴含链：p→q 与 q→r 同时成立。" },
        { label: "(p ∧ q) ∨ r", vars: ["p", "q", "r"], expr: "(p ∧ q) ∨ r",
          scenario: "已是析取范式但不是主析取范式：第一项缺 r，第二项缺 p、q，需补齐。" },
        { label: "(p ∨ q) → r", vars: ["p", "q", "r"], expr: "(p ∨ q) → r",
          scenario: "析取前件的蕴含：只要 p、q 有一个为真而 r 为假，公式就为假。" },
        { label: "p → (q → r)", vars: ["p", "q", "r"], expr: "p → (q → r)",
          scenario: "蕴含嵌套：只有 p=1, q=1, r=0 一行为假，主合取范式只有 M₆ 一项。" },
        { label: "(p → q) ↔ (¬q → ¬p)", vars: ["p", "q"], expr: "(p → q) ↔ (¬q → ¬p)",
          scenario: "逆否等值：这是重言式，全部 4 行为真——主析取范式含全部极小项，主合取范式为 1。" }
      ]
    },
    extend: {
      mode: "nf",
      selectLabel: "选择电路 / 约束",
      selectHint: "目标布尔函数",
      introStatus: "选择一个电路或约束函数，逐行扫描：真行 → 极小项（积之和，电路综合），假行 → 极大项子句（和之积，CNF）。",
      legendTitle: "工程符号说明",
      legend: [
        ["SOP", "积之和 = 析取范式 → 与–或电路"], ["POS", "和之积 = 合取范式 → 或–与电路"],
        ["子句", "文字的析取（CNF 的一项）"], ["SAT", "是否存在使公式为真的赋值"],
        ["模型", "使公式为真的赋值 = 真行"], ["1 / 0", "真 / 假"]
      ],
      note: "<b>电路综合：</b>主析取范式是『积之和』，每个极小项对应一个与门，再由一个或门汇总，直接得到两级与–或电路；工程上还会先用卡诺图、Quine–McCluskey 等方法化简再综合。" +
        "<br><b>SAT：</b>SAT 求解器的标准输入是 CNF（子句的合取，如 DIMACS 格式），但不必是主合取范式——主范式可能有指数多项；实践中常用 Tseitin 变换引入新变元，在线性规模内得到等可满足的 CNF。真值表法要查 2<sup>n</sup> 行，SAT 是 NP 完全问题，求解器靠 DPLL / CDCL 等搜索与剪枝。",
      cases: [
        { label: "多数表决器 maj(p,q,r)", vars: ["p", "q", "r"], expr: "(p ∧ q) ∨ (q ∧ r) ∨ (p ∧ r)",
          scenario: "三取二表决：至少两票赞成即通过。",
          insight: "主析取范式 m₃∨m₅∨m₆∨m₇ 直接综合需 4 个三输入与门 + 1 个四输入或门；化简后 (p∧q)∨(q∧r)∨(p∧r) 只需 3 个二输入与门 + 1 个三输入或门——同一函数，化简让电路更省。" },
        { label: "二选一数据选择器 MUX", vars: ["s", "a", "b"], expr: "(¬s ∧ a) ∨ (s ∧ b)",
          scenario: "数据选择器：s=0 输出 a，s=1 输出 b（变元按 s、a、b 顺序编号）。",
          insight: "主析取范式含 4 个极小项，而化简式 (¬s∧a)∨(s∧b) 只要 2 个与门——这正是 MUX 的标准门级结构。" },
        { label: "约束系统 (p∨q)∧(¬p∨r)∧(¬q∨¬r)", vars: ["p", "q", "r"], expr: "(p ∨ q) ∧ (¬p ∨ r) ∧ (¬q ∨ ¬r)",
          scenario: "三条约束子句：真行就是满足全部约束的赋值（模型）。",
          insight: "原式本身已是 3 个子句的 CNF，可直接交给 SAT 求解器；它的主合取范式是与之等值、但有 6 个极大项的『完全展开』形式。真行只有 010、101 两行：可满足，模型为 p=0,q=1,r=0 与 p=1,q=0,r=1。" },
        { label: "不可满足 (p∨q)∧(p∨¬q)∧¬p", vars: ["p", "q"], expr: "(p ∨ q) ∧ (p ∨ ¬q) ∧ ¬p",
          scenario: "三条子句互相冲突：找不到让它为真的赋值。",
          insight: "没有真行，主析取范式为 0（矛盾式），SAT 求解器报告 UNSAT；主合取范式含全部 4 个极大项。" }
      ]
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { parse: parse, ev: ev, makeEval: makeEval, dualAst: dualAst, computeCase: computeCase, computeDual: computeDual, LEVELS: LEVELS };
  }

  /* ====================== 以下仅浏览器运行 ====================== */
  if (typeof document === "undefined") return;

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function byId(id) { return document.getElementById(id); }
  function tv(b) { return b ? "1" : "0"; }
  function tvCell(b, extra) { return '<td class="cell-' + tv(b) + (extra ? " " + extra : "") + '">' + tv(b) + "</td>"; }
  var SUB = "₀₁₂₃₄₅₆₇₈₉";
  function sub(n) { return String(n).split("").map(function (d) { return SUB[+d]; }).join(""); }
  function ok(b) { return b ? '<span class="ok">✓</span>' : '<span class="bad">✗</span>'; }
  /* 对偶式中被互换的符号（∧ ∨ 0 1）加亮 */
  function markSwap(s) {
    return esc(s).replace(/[∧∨01]/g, function (ch) { return '<span class="du-swap">' + ch + "</span>"; });
  }
  function markImp(s) {
    return esc(s).replace(/[→↔]/g, function (ch) { return '<span class="du-imp">' + ch + "</span>"; });
  }

  function run() {
    var levelKey = global.SYMBOLIZE_LEVEL || "basic";
    var cfg = LEVELS[levelKey] || LEVELS.basic;
    var controlsEl = byId("controls");
    if (!controlsEl) return;

    var p = 0, manualFocus = null, autoTimer = null, speed = 1000;
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn, mode;

    /* ---------------- 控件（两种模式共用） ---------------- */
    function renderControls() {
      var opts = cfg.cases.map(function (c, i) { return '<option value="' + i + '">' + esc(c.label) + "</option>"; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label for="nfSelect"><span>' + esc(cfg.selectLabel) + "</span><small>" + esc(cfg.selectHint) + "</small></label>" +
          '<select id="nfSelect">' + opts + "</select></div>" +
        '<div class="control-group"><label><span>逐步演示</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button type="button" class="sym-step-btn" id="nfPrev">◀ 上一步</button>' +
            '<button type="button" class="sym-step-btn sym-primary" id="nfNext">下一步 ▶</button>' +
            '<button type="button" class="sym-step-btn" id="nfAuto">⏵ 自动播放</button>' +
            '<button type="button" class="sym-step-btn sym-reset" id="nfReset">↺ 重置</button>' +
          "</div>" +
          '<div class="sym-speed"><label for="nfSpeed">播放速度</label><select id="nfSpeed">' +
            '<option value="1600">慢速</option><option value="1000" selected>标准</option><option value="550">快速</option>' +
          "</select></div></div>" +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="nfProgBar"></i></div>' +
          '<span class="sym-progress-num" id="nfProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="nfStatus" aria-live="polite"></div></div>';
      statusEl = byId("nfStatus"); progBar = byId("nfProgBar"); progNum = byId("nfProgNum");
      prevBtn = byId("nfPrev"); nextBtn = byId("nfNext"); autoBtn = byId("nfAuto");
      byId("nfSelect").addEventListener("change", function (e) { loadCase(+e.target.value); });
      byId("nfSpeed").addEventListener("change", function (e) {
        speed = +e.target.value || 1000;
        if (autoTimer) { stopAuto(); toggleAuto(); }
      });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("nfReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
    }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      box.innerHTML = '<div class="legend-title">' + esc(cfg.legendTitle) + '</div><div class="legend-grid">' +
        cfg.legend.map(function (it) { return '<div class="legend-item"><span class="sym">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + "</span></div>"; }).join("") + "</div>";
    }

    function loadCase(idx) {
      stopAuto();
      p = 0; manualFocus = null;
      mode.load(idx);
      render();
    }
    function step(dir) { manualFocus = null; p = Math.max(0, Math.min(mode.total(), p + dir)); render(); }
    function clickRow(i) {
      stopAuto();
      if (p < mode.total()) { p = mode.stepOfRow(i); manualFocus = null; }
      else { manualFocus = (manualFocus === i ? null : i); }
      render();
    }
    function toggleAuto() {
      if (autoTimer) { stopAuto(); return; }
      if (p >= mode.total()) { p = 0; manualFocus = null; render(); }
      autoBtn.classList.add("sym-playing"); autoBtn.textContent = "⏸ 暂停";
      autoTimer = setInterval(function () {
        if (p >= mode.total()) { stopAuto(); return; }
        manualFocus = null; p += 1; render();
        if (p >= mode.total()) stopAuto();
      }, speed);
    }
    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
      if (autoBtn) { autoBtn.classList.remove("sym-playing"); autoBtn.textContent = "⏵ 自动播放"; }
    }
    function render() {
      var T = mode.total();
      mode.draw(p, manualFocus);
      progNum.textContent = p + " / " + T;
      progBar.style.width = (T ? (p / T * 100) : 0) + "%";
      prevBtn.disabled = (p <= 0);
      nextBtn.disabled = (p >= T);
      statusEl.innerHTML = mode.status(p, manualFocus);
    }

    /* ---------------- 基础层：对偶原理 ---------------- */
    function dualMode() {
      var formulaEl = byId("duFormula"), tableEl = byId("nfTable"), evalEl = byId("nfEval"), printEl = byId("duPrint");
      var c = null, d = null, N = 0, rowEls = [], fpA = [], fpD = [];
      var S_ELIM = 1, S_DUAL = 2, S_ROW0 = 3;

      function load(idx) {
        c = cfg.cases[idx]; d = computeDual(c); N = d.rows.length;
        var elimB = c.elimB || c.B;
        var hasImp = !!(c.elimA || c.elimB);
        formulaEl.innerHTML =
          '<div class="du-line du-orig"><span class="du-tag">原等值式 · ' + esc(c.law) + '</span>' +
            '<div class="du-eq"><span class="du-f">A = ' + markImp(c.A) + '</span><span class="du-iff">⇔</span><span class="du-f">B = ' + markImp(c.B) + "</span></div></div>" +
          '<div class="du-line du-elim" data-s="1"><span class="du-tag">① 化为只含 ¬ ∧ ∨</span>' +
            (hasImp
              ? '<div class="du-eq"><span class="du-f">' + esc(c.elimA || c.A) + '</span><span class="du-iff">⇔</span><span class="du-f">' + esc(elimB) + '</span></div><div class="du-hint">用蕴含等值式 p→q ⇔ ¬p∨q 消去 →，对偶式才有定义。</div>'
              : '<div class="du-hint">式中只有 ¬、∧、∨ 和常元，无需改写，可直接对偶。</div>') + "</div>" +
          '<div class="du-line du-dual" data-s="2"><span class="du-tag">② ∧↔∨、0↔1 互换，¬ 与变元不变</span>' +
            '<div class="du-eq"><span class="du-f">A* = ' + markSwap(c.Ad) + '</span><span class="du-iff">⇔ ?</span><span class="du-f">B* = ' + markSwap(c.Bd) + "</span></div></div>" +
          '<div class="du-line du-verdict" data-s="end"></div>';

        var head = "<tr>" + d.vars.map(function (v) { return "<th>" + esc(v) + "</th>"; }).join("") +
          '<th class="col-a">A</th><th class="col-a">B</th><th class="col-d">A*</th><th class="col-d">B*</th><th>A,B 同</th><th>A*,B* 同</th></tr>';
        var body = d.rows.map(function (r, i) {
          return '<tr class="nf-row" data-row="' + i + '">' +
            d.vars.map(function (v) { return tvCell(r.env[v]); }).join("") +
            tvCell(r.A, "f-" + tv(r.A)) + tvCell(r.B, "f-" + tv(r.B)) + tvCell(r.Ad, "f-" + tv(r.Ad)) + tvCell(r.Bd, "f-" + tv(r.Bd)) +
            "<td>" + ok(r.A === r.B) + "</td><td>" + ok(r.Ad === r.Bd) + "</td></tr>";
        }).join("");
        tableEl.innerHTML = '<div class="nf-key"><span>A = ' + esc(c.A) + '</span><span>B = ' + esc(c.B) + '</span><span>A* = ' + esc(c.Ad) + '</span><span>B* = ' + esc(c.Bd) + "</span></div>" +
          '<table class="nf-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table>";
        rowEls = Array.prototype.slice.call(tableEl.querySelectorAll("tr.nf-row"));
        rowEls.forEach(function (tr, i) { tr.addEventListener("click", function () { clickRow(i); }); });

        function strip(label, key, arr) {
          var html = '<div class="fp-row"><div class="fp-label">' + label + '</div><div class="fp-cells" style="--n:' + N + '">';
          d.rows.forEach(function (r, i) {
            html += '<button type="button" class="fp-cell v-' + tv(r[key]) + '" data-row="' + i + '" data-k="' + key + '"><b>' + tv(r[key]) + "</b><small>" + r.bits + "</small></button>";
          });
          return html + "</div></div>";
        }
        printEl.innerHTML = strip("A 的真值列", "A", fpA) + strip("A* 的真值列", "Ad", fpD) +
          '<div class="fp-note" id="duFpNote"></div>';
        fpA = Array.prototype.slice.call(printEl.querySelectorAll('.fp-cell[data-k="A"]'));
        fpD = Array.prototype.slice.call(printEl.querySelectorAll('.fp-cell[data-k="Ad"]'));
        fpA.concat(fpD).forEach(function (b) { b.addEventListener("click", function () { clickRow(+b.dataset.row); }); });
      }

      function total() { return N + S_ROW0; }
      function focusOf(pp, mf) {
        if (mf != null) return mf;
        return (pp >= S_ROW0 && pp < S_ROW0 + N) ? pp - S_ROW0 : null;
      }

      function draw(pp, mf) {
        var done = pp >= total();
        var rowsShown = Math.max(0, Math.min(N, pp - S_ROW0 + 1));
        if (done) rowsShown = N;
        var f = focusOf(pp, mf);
        Array.prototype.forEach.call(formulaEl.querySelectorAll(".du-line[data-s]"), function (el) {
          var s = el.dataset.s;
          var shown = s === "end" ? done : pp >= +s;
          el.classList.toggle("sym-pending", !shown);
          el.classList.toggle("sym-cur", s !== "end" && pp === +s);
        });
        var verdict = formulaEl.querySelector(".du-verdict");
        verdict.innerHTML = done
          ? '<span class="du-tag">③ 对偶原理</span><div class="du-concl">A ⇔ B（' + N + ' 行全同）<span class="du-arrow">⟹</span>A* ⇔ B*（' + N + ' 行全同）</div>' +
            '<div class="du-hint">由「' + esc(c.law) + "」直接得到「" + esc(c.dualLaw) + "」：" + esc(c.Ad) + " ⇔ " + esc(c.Bd) + "。</div>"
          : '<span class="du-tag">③ 对偶原理</span><div class="du-hint">扫描完真值表后给出结论。</div>';
        var dualIff = formulaEl.querySelector(".du-dual .du-iff");
        if (dualIff) dualIff.textContent = done ? "⇔" : "⇔ ?";

        var mirror = f != null ? N - 1 - f : null;
        for (var k = 0; k < N; k++) {
          var rev = k < rowsShown;
          rowEls[k].classList.toggle("sym-pending", !rev);
          rowEls[k].classList.toggle("sym-cur", k === f);
          fpA[k].classList.toggle("sym-pending", !rev);
          fpD[k].classList.toggle("sym-pending", !rev);
          fpA[k].classList.toggle("sym-cur", k === f);
          fpD[k].classList.toggle("sym-cur", k === f);
          fpA[k].classList.toggle("fp-mirror", k === mirror && mirror !== f);
        }
        var note = byId("duFpNote");
        if (f != null) {
          var r = d.rows[f], rm = d.rows[mirror];
          note.innerHTML = "A*(" + r.bits.split("").join(",") + ") = <b>" + tv(r.Ad) + "</b>，而 A 在「每个变元取反」的赋值 " + rm.bits + " 处为 " + tv(rm.A) +
            " —— 恰好相反：<b>A*(p,…) = ¬A(¬p,…)</b>。";
        } else {
          note.innerHTML = "对照两行：把 A 的真值列<b>倒过来再取反</b>，就得到 A* 的真值列，即 A*(p,…) ⇔ ¬A(¬p,…)。点任一格查看配对。";
        }

        evalEl.innerHTML = evalText(pp, f, done);
      }

      function evalText(pp, f, done) {
        if (f != null) {
          var r = d.rows[f];
          var interp = d.vars.map(function (v) { return v + "=" + tv(r.env[v]); }).join(", ");
          return "<div>第 <b>" + (f + 1) + "</b> 行（" + interp + "）</div>" +
            '<div class="ev-grid"><span>A = <b class="v' + tv(r.A) + '">' + tv(r.A) + '</b></span><span>B = <b class="v' + tv(r.B) + '">' + tv(r.B) + "</b></span><span>" + ok(r.A === r.B) + "</span>" +
            '<span>A* = <b class="v' + tv(r.Ad) + '">' + tv(r.Ad) + '</b></span><span>B* = <b class="v' + tv(r.Bd) + '">' + tv(r.Bd) + "</b></span><span>" + ok(r.Ad === r.Bd) + "</span></div>";
        }
        if (done) {
          return '<div class="ev-done">✅ 全部 ' + N + " 行：A 与 B 处处相同，A* 与 B* 也处处相同——对偶原理成立：<b>若 A ⇔ B，则 A* ⇔ B*</b>。</div>";
        }
        if (pp === S_DUAL) return "<div>对偶式已写出：注意只有 ∧、∨、0、1 被互换（加亮处），¬ 与变元原样保留。下一步开始逐行比对真值。</div>";
        if (pp === S_ELIM) return "<div>对偶的前提：公式只含 ¬、∧、∨（及常元 0、1）。含 → 或 ↔ 时必须先等值改写。</div>";
        return '<div class="ev-idle">点「下一步」开始：先改写，再写对偶式，然后逐行比对 A、B、A*、B* 的真值。</div>';
      }

      function status(pp, mf) {
        var f = focusOf(pp, mf);
        if (pp === 0) return cfg.introStatus + "<br><b>情境：</b>" + esc(c.scenario);
        if (pp === S_ELIM) return "① " + ((c.elimA || c.elimB) ? "消去 →：<b>" + esc(c.elimA || c.A) + "</b>。" : "无 →、↔，直接进入对偶。");
        if (pp === S_DUAL) return "② 写出对偶式：<b>A* = " + esc(c.Ad) + "</b>，<b>B* = " + esc(c.Bd) + "</b>。";
        if (f != null) {
          var r = d.rows[f];
          return "第 <b>" + (f + 1) + "</b> 行 (" + r.bits + ")：A=" + tv(r.A) + "，B=" + tv(r.B) + "，A*=" + tv(r.Ad) + "，B*=" + tv(r.Bd) + "。";
        }
        if (pp >= total()) return "✅ <b>验证完成</b>：「" + esc(c.law) + "」的对偶式 " + esc(c.Ad) + " ⇔ " + esc(c.Bd) + " 同样成立。";
        return "";
      }
      return { load: load, total: total, stepOfRow: function (i) { return i + S_ROW0; }, draw: draw, status: status };
    }

    /* ---------------- 进阶层 / 拓展层：主范式 ---------------- */
    function nfMode() {
      var tableEl = byId("nfTable"), termsEl = byId("nfTerms"), formsEl = byId("nfForms"), starEl = byId("nfStar"), evalEl = byId("nfEval");
      var c = null, tbl = null, n = 0, rowEls = [], termEls = [], cellEls = [], segMap = {};
      var isExt = levelKey === "extend";

      function load(idx) {
        c = cfg.cases[idx]; tbl = computeCase(c); n = tbl.rows.length;
        renderTable(); renderTerms(); renderForms(); renderStar();
      }

      function renderTable() {
        var head = "<tr>" + tbl.vars.map(function (v) { return "<th>" + esc(v) + "</th>"; }).join("") +
          '<th class="col-f">f</th><th>编号</th><th>提取</th></tr>';
        var body = tbl.rows.map(function (r, i) {
          return '<tr class="nf-row" data-row="' + i + '">' +
            tbl.vars.map(function (v) { return tvCell(r.env[v]); }).join("") +
            tvCell(r.val, "f-" + tv(r.val)) +
            '<td class="nf-idx">' + r.bits + "₂ = " + i + "</td>" +
            '<td class="nf-kind ' + (r.val ? "k-m" : "k-M") + '">' + (r.val ? "m" : "M") + sub(i) + "</td></tr>";
        }).join("");
        tableEl.innerHTML = '<div class="nf-key"><span>f = ' + esc(c.expr) + "</span><span>变元顺序：" + tbl.vars.join(", ") + "</span></div>" +
          '<table class="nf-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table>";
        rowEls = Array.prototype.slice.call(tableEl.querySelectorAll("tr.nf-row"));
        rowEls.forEach(function (tr, i) { tr.addEventListener("click", function () { clickRow(i); }); });
      }

      function renderTerms() {
        termsEl.innerHTML = "";
        termEls = tbl.rows.map(function (r, i) {
          var d = document.createElement("button");
          d.type = "button";
          d.className = "nf-term " + (r.val ? "t-min" : "t-max");
          d.dataset.row = i;
          d.innerHTML = '<span class="nt-label">' + (r.val ? "极小项 m" : (isExt ? "子句 M" : "极大项 M")) + sub(i) + "</span>" +
            '<span class="nt-body">' + esc(r.val ? r.minterm : r.maxterm) + "</span>";
          d.addEventListener("click", function () { clickRow(i); });
          termsEl.appendChild(d);
          return d;
        });
      }

      function renderForms() {
        segMap = {};
        var oneIdx = tbl.ones.map(function (r) { return r.i; }), zeroIdx = tbl.zeros.map(function (r) { return r.i; });
        function buildForm(label, kind, rowsArr, cls, conn, empty, code) {
          var body;
          if (!rowsArr.length) { body = '<span class="nf-seg">' + esc(empty) + "</span>"; }
          else {
            body = rowsArr.map(function (r) {
              return '<span class="nf-seg ' + cls + '" data-row="' + r.i + '">' + esc(kind === "min" ? r.minterm : r.maxterm) + "</span>";
            }).join('<span class="nf-conn"> ' + conn + " </span>");
          }
          return '<div class="nf-form ' + (kind === "min" ? "f-pdnf" : "f-pcnf") + '"><div class="nf-form-label">' + label +
            '</div><div class="nf-form-body">' + body + '</div><div class="nf-code">' + code + "</div></div>";
        }
        var codeMin = oneIdx.length ? "= " + oneIdx.map(function (i) { return "m" + sub(i); }).join(" ∨ ") + " = Σ(" + oneIdx.join(", ") + ")" : "无成真赋值";
        var codeMax = zeroIdx.length ? "= " + zeroIdx.map(function (i) { return "M" + sub(i); }).join(" ∧ ") + " = Π(" + zeroIdx.join(", ") + ")" : "无成假赋值";
        formsEl.innerHTML =
          buildForm(isExt ? "主析取范式 · 积之和（与–或电路）" : "主析取范式（成真赋值 → 极小项之析取）", "min", tbl.ones, "t-min", "∨", "0（矛盾式，无成真赋值）", codeMin) +
          buildForm(isExt ? "主合取范式 · 和之积（每个极大项是一条子句）" : "主合取范式（成假赋值 → 极大项之合取）", "max", tbl.zeros, "t-max", "∧", "1（重言式，无成假赋值）", codeMax) +
          '<div class="nf-comp nf-final">编号互补：{' + oneIdx.join(", ") + "} ∪ {" + zeroIdx.join(", ") + "} = {0, …, " + (n - 1) + "}，交集为空。" +
            (tbl.zeros.length === 0 ? "　公式是<b>重言式</b>。" : tbl.ones.length === 0 ? "　公式是<b>矛盾式</b>。" : "　公式是可满足式（非重言式）。") + "</div>" +
          (c.insight ? '<div class="nf-insight nf-final"><b>工程解读：</b>' + esc(c.insight) + "</div>" : "") +
          '<div class="nf-note">' + cfg.note + "</div>";
        Array.prototype.forEach.call(formsEl.querySelectorAll(".nf-seg[data-row]"), function (sp) {
          var ri = +sp.dataset.row;
          (segMap[ri] = segMap[ri] || []).push(sp);
          sp.addEventListener("click", function () { clickRow(ri); });
        });
      }

      function renderStar() {
        var cols = Math.min(4, n);
        starEl.innerHTML = '<div class="nf-grid" style="--cols:' + cols + '">' + tbl.rows.map(function (r, i) {
          return '<button type="button" class="nf-cell v-' + tv(r.val) + '" data-row="' + i + '"><b>' + r.bits + "</b><small>" +
            (r.val ? "m" : "M") + sub(i) + " · f=" + tv(r.val) + (isExt && r.val ? " · 模型" : "") + "</small></button>";
        }).join("") + "</div>";
        cellEls = Array.prototype.slice.call(starEl.querySelectorAll(".nf-cell"));
        cellEls.forEach(function (b, i) { b.addEventListener("click", function () { clickRow(i); }); });
      }

      function total() { return n + 1; }
      function draw(pp, mf) {
        var rowsShown = Math.min(pp, n), assembled = pp > n;
        var stepRow = (pp >= 1 && pp <= n) ? pp - 1 : null;
        var f = (mf != null) ? mf : stepRow;
        for (var k = 0; k < n; k++) {
          var rev = k < rowsShown || assembled, cur = (k === f);
          [rowEls[k], termEls[k], cellEls[k]].forEach(function (el) {
            if (!el) return; el.classList.toggle("sym-pending", !rev); el.classList.toggle("sym-cur", cur);
          });
          if (segMap[k]) segMap[k].forEach(function (sp) { sp.classList.toggle("sym-pending", !rev); sp.classList.toggle("sym-cur", cur); });
        }
        Array.prototype.forEach.call(formsEl.querySelectorAll(".nf-final"), function (el) { el.classList.toggle("sym-hide", !assembled); });
        evalEl.innerHTML = evalText(f, assembled);
      }

      function evalText(f, assembled) {
        if (f == null && !assembled) return '<div class="ev-idle">点「下一步」逐行扫描真值表。f=1 的行提取极小项并入主析取范式，f=0 的行提取极大项并入主合取范式。</div>';
        if (f == null) {
          return '<div class="ev-done">✅ 已扫描全部 <b>' + n + "</b> 行：" + tbl.ones.length + " 个成真赋值 → 主析取范式 " + tbl.ones.length + " 项；" +
            tbl.zeros.length + " 个成假赋值 → 主合取范式 " + tbl.zeros.length + " 项。可点任意元素回看。</div>";
        }
        var r = tbl.rows[f];
        var interp = tbl.vars.map(function (v) { return v + "=" + tv(r.env[v]); }).join(", ");
        var why;
        if (r.val) {
          why = "变元为 1 取原形、为 0 取否定，得极小项 <span class=\"ev-min\">m" + sub(f) + " = " + esc(r.minterm) + "</span>，它只在这一行为真，并入<b>主析取范式</b>。";
        } else {
          why = "变元为 0 取原形、为 1 取否定，得极大项 <span class=\"ev-max\">M" + sub(f) + " = " + esc(r.maxterm) + "</span>，它只在这一行为假，并入<b>主合取范式</b>" + (isExt ? "（一条 CNF 子句）" : "") + "。";
        }
        return "<div>第 <b>" + (f + 1) + "</b> 行（" + interp + "）：二进制 " + r.bits + " = " + f + "，f = <b class=\"v" + tv(r.val) + "\">" + tv(r.val) + "</b></div>" +
          '<div style="margin-top:4px">' + why + "</div>";
      }

      function status(pp, mf) {
        var stepRow = (pp >= 1 && pp <= n) ? pp - 1 : null;
        var f = (mf != null) ? mf : stepRow;
        if (pp === 0) return cfg.introStatus + (c.scenario ? "<br><b>情境：</b>" + esc(c.scenario) : "");
        if (f != null) {
          var r = tbl.rows[f];
          return "第 <b>" + (f + 1) + "</b> 行 (" + r.bits + ") · f=" + tv(r.val) + " → " +
            (r.val ? '<span class="st-min">极小项 m' + sub(f) + "</span>" : '<span class="st-max">极大项 M' + sub(f) + "</span>") + "。";
        }
        if (pp > n) {
          var sm = tbl.ones.length ? "主析取范式 Σ(" + tbl.ones.map(function (r) { return r.i; }).join(", ") + ")" : "主析取范式为 0（矛盾式）";
          var pm = tbl.zeros.length ? "主合取范式 Π(" + tbl.zeros.map(function (r) { return r.i; }).join(", ") + ")" : "主合取范式为 1（重言式）";
          return "✅ <b>主范式拼装完成</b>：" + sm + "；" + pm + "。";
        }
        return "";
      }
      return { load: load, total: total, stepOfRow: function (i) { return i + 1; }, draw: draw, status: status };
    }

    mode = cfg.mode === "dual" ? dualMode() : nfMode();
    renderControls();
    renderLegend();
    loadCase(0);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})(typeof window !== "undefined" ? window : globalThis);
