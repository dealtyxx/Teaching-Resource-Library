/* =====================================================================
 * 5.4 命题公式之间的关系 —— 三层统一交互引擎（公式关系比对器）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与 6.1 同形）：选择公式对 → 逐步演示
 *   点一步逐行扫描真值表 → 看反馈（该行两式取值）→ 看公式项高亮（变元按真值着色、A/B 求值）
 *   → 看真值指纹图高亮 → 给出关系判定（等价 / 蕴含 / 相容 / 矛盾）与等值演算。
 *   完成后可点任意真值行 / 指纹格，跨视图联动高亮。
 *
 * 难度梯度：
 *   基础层：等价判定（A⇔B 真值表是否相同），2 变元，蕴含等值式 / 德摩根律 / 假言易位 / 逆命题。
 *   进阶层：等价 + 蕴含 + 相容 + 矛盾，关系清单（A↔B、A→B 是否重言，A∧B 是否可满足），
 *           并给出等值演算过程（输出律、双重否定律等）。
 *   拓展层：查询条件改写（德摩根律、分配律、吸收律）、知识库一致性与矛盾检测（UNSAT）。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* ---------- 命题公式求值器（¬ ∧ ∨ → ↔，变元 a-z，括号） ---------- */
  function parse(expr) {
    var i = 0, s = expr;
    function peek() { while (i < s.length && s[i] === " ") i++; return s[i]; }
    function next() { var c = peek(); i++; return c; }
    function parseIff() {
      var l = parseImp();
      while (peek() === "↔") { next(); l = { op: "↔", l: l, r: parseImp() }; }
      return l;
    }
    function parseImp() {
      var l = parseOr();
      if (peek() === "→") { next(); return { op: "→", l: l, r: parseImp() }; } // 右结合
      return l;
    }
    function parseOr() {
      var l = parseAnd();
      while (peek() === "∨") { next(); l = { op: "∨", l: l, r: parseAnd() }; }
      return l;
    }
    function parseAnd() {
      var l = parseNot();
      while (peek() === "∧") { next(); l = { op: "∧", l: l, r: parseNot() }; }
      return l;
    }
    function parseNot() {
      if (peek() === "¬") { next(); return { op: "¬", r: parseNot() }; }
      return parseAtom();
    }
    function parseAtom() {
      var c = peek();
      if (c === "(") { next(); var e = parseIff(); if (peek() === ")") next(); return e; }
      next();
      return { v: c };
    }
    return parseIff();
  }
  function evalAst(n, env) {
    if (n.v !== undefined) return !!env[n.v];
    switch (n.op) {
      case "¬": return !evalAst(n.r, env);
      case "∧": return evalAst(n.l, env) && evalAst(n.r, env);
      case "∨": return evalAst(n.l, env) || evalAst(n.r, env);
      case "→": return !evalAst(n.l, env) || evalAst(n.r, env);
      case "↔": return evalAst(n.l, env) === evalAst(n.r, env);
    }
    return false;
  }
  function makeEval(expr) { var ast = parse(expr); return function (env) { return evalAst(ast, env); }; }

  /* ---------- 计算关系 ---------- */
  function computeCase(c) {
    var vars = c.vars, n = vars.length;
    var fa = makeEval(c.A.expr), fb = makeEval(c.B.expr);
    var rows = [];
    for (var m = 0; m < (1 << n); m++) {
      var env = {};
      for (var k = 0; k < n; k++) env[vars[k]] = !!(m & (1 << (n - 1 - k)));
      var a = fa(env), b = fb(env);
      rows.push({ env: env, a: a, b: b, same: a === b, both: a && b });
    }
    var equiv = rows.every(function (r) { return r.same; });
    var aImpB = rows.every(function (r) { return !r.a || r.b; });
    var bImpA = rows.every(function (r) { return !r.b || r.a; });
    var compatible = rows.some(function (r) { return r.both; });
    var negation = rows.every(function (r) { return !r.same; });   // B ⇔ ¬A
    var rel = { equiv: equiv, aImpB: aImpB, bImpA: bImpA, compatible: compatible, negation: negation };
    var verdict = classify(rel, rows);
    return { vars: vars, rows: rows, equiv: equiv, aImpB: aImpB, bImpA: bImpA, compatible: compatible, negation: negation, verdict: verdict };
  }
  function rowIndex(rows, pred) { for (var i = 0; i < rows.length; i++) if (pred(rows[i])) return i + 1; return 0; }
  function classify(rel, rows) {
    var nDiff = rows.filter(function (r) { return !r.same; }).length;
    if (rel.equiv) {
      return { key: "equiv", label: "逻辑等价  A ⇔ B",
        reason: "全部 " + rows.length + " 个解释下，A 与 B 取值<b>完全相同</b>，即 A↔B 是重言式，故 <b>A ⇔ B</b>。" };
    }
    if (rel.aImpB) {
      return { key: "imp", label: "A 蕴含 B（A ⇒ B）",
        reason: "没有「A 真 B 假」的行，即 A→B 是重言式，故 <b>A ⇒ B</b>；但有 " + nDiff + " 个解释两式取值不同（A 假 B 真），故 B ⇏ A，两式不等价。" };
    }
    if (rel.bImpA) {
      return { key: "imp", label: "B 蕴含 A（B ⇒ A）",
        reason: "没有「B 真 A 假」的行，即 B→A 是重言式，故 <b>B ⇒ A</b>；但两式并不处处相同，故不等价。" };
    }
    if (rel.compatible) {
      var bi = rowIndex(rows, function (r) { return r.both; });
      return { key: "compat", label: "相容但不等价",
        reason: "存在解释使两式<b>同真</b>（第 " + bi + " 行），即 A∧B 可满足，故<b>相容</b>；但既有 A真B假、又有 B真A假 的行，两个方向的蕴含都不成立，也不等价。" };
    }
    return { key: "contra", label: "矛盾（不可同真）",
      reason: "<b>不存在</b>使两式同真的解释，A∧B 是矛盾式（恒假 / UNSAT），故两式<b>矛盾</b>" +
        (rel.negation ? "；且每一行两式取值都相反，即 B ⇔ ¬A。" : "。") };
  }
  /* 基础层：只区分『等价 / 不等价』，不引入蕴含/相容等进阶概念 */
  function simpleEquivVerdict(tbl) {
    if (tbl.equiv) {
      return { key: "equiv", label: "逻辑等价  A ⇔ B",
        reason: "全部 " + tbl.rows.length + " 个解释下，A 与 B 取值<b>完全相同</b>，故 A ⇔ B（真值表相同）。" };
    }
    var di = 0;
    for (var i = 0; i < tbl.rows.length; i++) { if (!tbl.rows[i].same) { di = i + 1; break; } }
    return { key: "noteq", label: "不等价（真值表不同）",
      reason: "存在解释使两式取值<b>不同</b>（第 " + di + " 行），故二者<b>不等价</b>——一行反例即可否定等价。" };
  }

  /* ---------- 三层数据 ----------
   * calc：等值演算过程，每步 [关系符号, 公式, 依据]；关系符号为 "⇔" 或 "⇒"（首行为 ""）。 */
  var LEVELS = {
    basic: {
      equivOnly: true,
      introStatus: "选择一对公式，点「下一步」逐行扫描真值表，判断两式真值是否处处相同——即是否逻辑等价。",
      legend: [
        ["⇔", "逻辑等价 · 真值表相同"],
        ["T", "真"], ["F", "假"],
        ["=", "该行两式取值相同"],
        ["≠", "该行两式取值不同"]
      ],
      laws: [
        ["蕴含等值式", "A→B ⇔ ¬A∨B"],
        ["德摩根律", "¬(A∧B) ⇔ ¬A∨¬B"],
        ["假言易位", "A→B ⇔ ¬B→¬A"]
      ],
      cases: [
        { label: "p→q  与  ¬p∨q", vars: ["p", "q"],
          A: { expr: "p → q" }, B: { expr: "¬p ∨ q" },
          scenario: "蕴含等值式：把『如果 p 则 q』改写为『非 p 或 q』，二者是否等价？",
          law: "蕴含等值式：A→B ⇔ ¬A∨B（蕴含只在『前真后假』时为假，¬A∨B 也只在此时为假）。" },
        { label: "¬(p∧q)  与  ¬p∨¬q", vars: ["p", "q"],
          A: { expr: "¬(p ∧ q)" }, B: { expr: "¬p ∨ ¬q" },
          scenario: "德摩根律：『并非(p 且 q)』与『非 p 或 非 q』。",
          law: "德摩根律：¬(A∧B) ⇔ ¬A∨¬B，对偶地 ¬(A∨B) ⇔ ¬A∧¬B。" },
        { label: "p→q  与  ¬q→¬p", vars: ["p", "q"],
          A: { expr: "p → q" }, B: { expr: "¬q → ¬p" },
          scenario: "原命题与逆否命题：『如果 p 则 q』与『如果非 q 则非 p』是否等价？",
          law: "假言易位：A→B ⇔ ¬B→¬A（原命题与逆否命题同真同假）。" },
        { label: "p→q  与  q→p", vars: ["p", "q"],
          A: { expr: "p → q" }, B: { expr: "q → p" },
          scenario: "原命题与逆命题：把箭头方向倒过来，意思还一样吗？",
          law: "原命题与逆命题一般不等价——这正是『只有…才…』不能写成 p→q 的原因（见 5.2）。" },
        { label: "p∨q  与  p∧q", vars: ["p", "q"],
          A: { expr: "p ∨ q" }, B: { expr: "p ∧ q" },
          scenario: "『或』与『且』是否等价？找一行反例即可否定。",
          law: "只要找到一行真值不同，就能否定等价。" }
      ]
    },
    advanced: {
      introStatus: "选择一对公式，逐行扫描真值表，判定它们是等价、单向蕴含、相容还是矛盾，再看等值演算如何得出同一结论。",
      legend: [
        ["⇔", "逻辑等价 · A↔B 重言"],
        ["⇒", "逻辑蕴含 · A→B 重言"],
        ["相容", "A∧B 可满足（有同真行）"],
        ["矛盾", "A∧B 恒假（无同真行）"],
        ["T", "真"], ["F", "假"],
        ["≠", "该行两式取值不同"]
      ],
      laws: [
        ["蕴含等值式", "A→B ⇔ ¬A∨B"],
        ["等价等值式", "A↔B ⇔ (A→B)∧(B→A)"],
        ["德摩根律", "¬(A∧B) ⇔ ¬A∨¬B"],
        ["双重否定律", "¬¬A ⇔ A"],
        ["输出律", "(A∧B)→C ⇔ A→(B→C)"],
        ["分配律", "A∨(B∧C) ⇔ (A∨B)∧(A∨C)"],
        ["排中律 / 矛盾律", "A∨¬A ⇔ 1，A∧¬A ⇔ 0"],
        ["同一律 / 零律", "A∨0 ⇔ A，A∨1 ⇔ 1"]
      ],
      cases: [
        { label: "p∧q  与  p∨q", vars: ["p", "q"],
          A: { expr: "p ∧ q" }, B: { expr: "p ∨ q" },
          scenario: "合取强于析取：p∧q 是否蕴含 p∨q？",
          calcTitle: "等值演算：验证 A→B 是重言式",
          calc: [
            ["", "(p∧q) → (p∨q)", ""],
            ["⇔", "¬(p∧q) ∨ (p∨q)", "蕴含等值式"],
            ["⇔", "(¬p∨¬q) ∨ (p∨q)", "德摩根律"],
            ["⇔", "(¬p∨p) ∨ (¬q∨q)", "交换律、结合律"],
            ["⇔", "1 ∨ 1", "排中律"],
            ["⇔", "1", "零律"]
          ],
          calcEnd: "A→B 是重言式，所以 A ⇒ B。" },
        { label: "p→(q→r)  与  (p∧q)→r", vars: ["p", "q", "r"],
          A: { expr: "p → (q → r)" }, B: { expr: "(p ∧ q) → r" },
          scenario: "输出律：8 行真值表是否处处相同？再用等值演算推一遍。",
          calcTitle: "等值演算：由 B 推出 A",
          calc: [
            ["", "(p∧q) → r", ""],
            ["⇔", "¬(p∧q) ∨ r", "蕴含等值式"],
            ["⇔", "(¬p∨¬q) ∨ r", "德摩根律"],
            ["⇔", "¬p ∨ (¬q∨r)", "结合律"],
            ["⇔", "¬p ∨ (q→r)", "蕴含等值式"],
            ["⇔", "p → (q→r)", "蕴含等值式"]
          ],
          calcEnd: "这就是输出律 (A∧B)→C ⇔ A→(B→C)。" },
        { label: "¬(p→q)  与  p∧¬q", vars: ["p", "q"],
          A: { expr: "¬(p → q)" }, B: { expr: "p ∧ ¬q" },
          scenario: "蕴含的否定：¬(p→q) 等值于什么？",
          calcTitle: "等值演算：化简 A",
          calc: [
            ["", "¬(p→q)", ""],
            ["⇔", "¬(¬p∨q)", "蕴含等值式"],
            ["⇔", "¬¬p ∧ ¬q", "德摩根律"],
            ["⇔", "p ∧ ¬q", "双重否定律"]
          ],
          calcEnd: "『如果 p 则 q』为假，当且仅当 p 真而 q 假。" },
        { label: "p∨q  与  p→q", vars: ["p", "q"],
          A: { expr: "p ∨ q" }, B: { expr: "p → q" },
          scenario: "相容但不等价、且无单向蕴含的典型例。",
          calcTitle: "等值演算：化简 A∧B，看能否同真",
          calc: [
            ["", "(p∨q) ∧ (p→q)", ""],
            ["⇔", "(p∨q) ∧ (¬p∨q)", "蕴含等值式"],
            ["⇔", "(p∧¬p) ∨ q", "交换律、分配律"],
            ["⇔", "0 ∨ q", "矛盾律"],
            ["⇔", "q", "同一律"]
          ],
          calcEnd: "A∧B ⇔ q，q 为真时两式同真，故相容。" },
        { label: "p↔q  与  (p∧¬q)∨(¬p∧q)", vars: ["p", "q"],
          A: { expr: "p ↔ q" }, B: { expr: "(p ∧ ¬q) ∨ (¬p ∧ q)" },
          scenario: "等价式与『排斥或』（见 5.2）：两式能否同真？",
          calcTitle: "等值演算：化简 ¬A",
          calc: [
            ["", "¬(p↔q)", ""],
            ["⇔", "¬((p→q) ∧ (q→p))", "等价等值式"],
            ["⇔", "¬((¬p∨q) ∧ (¬q∨p))", "蕴含等值式"],
            ["⇔", "¬(¬p∨q) ∨ ¬(¬q∨p)", "德摩根律"],
            ["⇔", "(p∧¬q) ∨ (q∧¬p)", "德摩根律、双重否定律"],
            ["⇔", "(p∧¬q) ∨ (¬p∧q)", "交换律"]
          ],
          calcEnd: "B ⇔ ¬A，所以 A∧B ⇔ A∧¬A ⇔ 0（矛盾律），两式不可同真。" }
      ]
    },
    extend: {
      introStatus: "把公式关系迁移到查询优化与知识库一致性：逐行比对，判断条件改写是否等价、规则是否矛盾。",
      legend: [
        ["⇔", "等价 · 可安全改写"],
        ["⇒", "蕴含 · A→B 重言"],
        ["相容", "可同真 · 一致"],
        ["矛盾", "不可同真 · 冲突"],
        ["T", "真"], ["F", "假"],
        ["≠", "存在反例行"],
        ["SQL", "查询条件 AND / OR / NOT"]
      ],
      laws: [
        ["德摩根律", "¬(A∧B) ⇔ ¬A∨¬B"],
        ["分配律", "A∧(B∨C) ⇔ (A∧B)∨(A∧C)"],
        ["吸收律", "A∨(A∧B) ⇔ A"],
        ["蕴含等值式", "A→B ⇔ ¬A∨B"],
        ["矛盾律", "A∧¬A ⇔ 0"]
      ],
      cases: [
        { label: "¬(p∧q)  与  ¬p∨¬q", vars: ["p", "q"],
          A: { expr: "¬(p ∧ q)" }, B: { expr: "¬p ∨ ¬q" },
          scenario: "查询条件改写：WHERE NOT (p AND q) 改写为 WHERE NOT p OR NOT q（德摩根律），等价才能放心改写。",
          calcTitle: "改写依据",
          calc: [
            ["", "NOT (p AND q)　即　¬(p∧q)", ""],
            ["⇔", "¬p ∨ ¬q　即　NOT p OR NOT q", "德摩根律"]
          ],
          calcEnd: "改写后可分别利用 p、q 上的索引做判断，结果集不变。" },
        { label: "(p∧q)∨(p∧r)  与  p∧(q∨r)", vars: ["p", "q", "r"],
          A: { expr: "(p ∧ q) ∨ (p ∧ r)" }, B: { expr: "p ∧ (q ∨ r)" },
          scenario: "查询优化：提取公因子（分配律），条件 p 只需判断一次——前提是必须等价。",
          calcTitle: "改写依据",
          calc: [
            ["", "(p∧q) ∨ (p∧r)", ""],
            ["⇔", "p ∧ (q∨r)", "分配律（提取公因子 p）"]
          ],
          calcEnd: "改写后 p 只出现一次，减少重复判断。" },
        { label: "p∨(p∧q)  与  p", vars: ["p", "q"],
          A: { expr: "p ∨ (p ∧ q)" }, B: { expr: "p" },
          scenario: "冗余条件消除：WHERE p OR (p AND q) 能否直接化简为 WHERE p？",
          calcTitle: "改写依据",
          calc: [
            ["", "p ∨ (p∧q)", ""],
            ["⇔", "(p∧1) ∨ (p∧q)", "同一律"],
            ["⇔", "p ∧ (1∨q)", "分配律"],
            ["⇔", "p ∧ 1", "零律"],
            ["⇔", "p", "同一律（合起来即吸收律）"]
          ],
          calcEnd: "q 是冗余条件，删去后查询结果不变。" },
        { label: "p→q  与  p∧¬q", vars: ["p", "q"],
          A: { expr: "p → q" }, B: { expr: "p ∧ ¬q" },
          scenario: "知识库一致性：规则『p→q』与事实『p 且 非 q』能否同真？",
          calcTitle: "一致性检验：化简 A∧B",
          calc: [
            ["", "(p→q) ∧ (p∧¬q)", ""],
            ["⇔", "(¬p∨q) ∧ p ∧ ¬q", "蕴含等值式、结合律"],
            ["⇔", "(¬p∧p∧¬q) ∨ (q∧p∧¬q)", "分配律"],
            ["⇔", "0 ∨ 0", "矛盾律、零律"],
            ["⇔", "0", "同一律"]
          ],
          calcEnd: "A∧B 恒假（UNSAT）：规则与事实冲突，必须修正其一。" },
        { label: "(p→q)∧(q→r)  与  p∧¬r", vars: ["p", "q", "r"],
          A: { expr: "(p → q) ∧ (q → r)" }, B: { expr: "p ∧ ¬r" },
          scenario: "规则链冲突：知识库已有规则『p→q』『q→r』，能否再录入事实『p 且 非 r』？",
          calcTitle: "一致性检验：A∧B 能否为真",
          calc: [
            ["", "(p→q) ∧ (q→r) ∧ p ∧ ¬r", ""],
            ["⇒", "(p→r) ∧ p ∧ ¬r", "假言三段论：(p→q)∧(q→r) ⇒ p→r"],
            ["⇔", "(¬p∨r) ∧ ¬(¬p∨r)", "蕴含等值式、德摩根律、双重否定律"],
            ["⇔", "0", "矛盾律"]
          ],
          calcEnd: "A∧B 蕴含矛盾式，只能恒假：新事实与规则链冲突，录入前就应拦截。" }
      ]
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { parse: parse, makeEval: makeEval, computeCase: computeCase, LEVELS: LEVELS };
  }

  /* ====================== 以下仅浏览器运行 ====================== */
  if (typeof document === "undefined") return;

  var SVGNS = "http://www.w3.org/2000/svg";
  var C_T = "#2f7d57", C_F = "#c0392b";
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

    var controlsEl = byId("controls");
    var pairEl = byId("relPair");
    var tableEl = byId("relTable");
    var evalEl = byId("relEval");
    var chartEl = byId("relChart");
    var verdictEl = byId("relVerdict");
    if (!controlsEl || !pairEl) return;

    var tbl = null, scenario = "", curCase = null;
    var p = 0, manualFocus = null, autoTimer = null, autoDelay = 1000;
    var varSpansA = [], varSpansB = [], resA = null, resB = null;
    var rowEls = [], cellEls = [];
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.cases.map(function (c, i) { return '<option value="' + i + '">' + esc(c.label) + '</option>'; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label for="relSelect"><span>选择公式对</span><small>A 与 B</small></label>' +
          '<select id="relSelect">' + opts + '</select></div>' +
        '<div class="control-group"><label><span>逐行演示</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button type="button" class="sym-step-btn" id="relPrev">◀ 上一步</button>' +
            '<button type="button" class="sym-step-btn sym-primary" id="relNext">下一步 ▶</button>' +
            '<button type="button" class="sym-step-btn" id="relAuto">⏵ 自动播放</button>' +
            '<button type="button" class="sym-step-btn sym-reset" id="relReset">↺ 重置</button>' +
          '</div>' +
          '<div class="sym-speed-row"><label for="relSpeed">播放速度</label>' +
            '<select id="relSpeed"><option value="1600">慢</option><option value="1000" selected>中</option><option value="550">快</option></select></div>' +
        '</div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="relProgBar"></i></div>' +
          '<span class="sym-progress-num" id="relProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="relStatus" aria-live="polite"></div></div>';
      statusEl = byId("relStatus"); progBar = byId("relProgBar"); progNum = byId("relProgNum");
      prevBtn = byId("relPrev"); nextBtn = byId("relNext"); autoBtn = byId("relAuto");
      byId("relSelect").addEventListener("change", function (e) { loadCase(+e.target.value); });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("relReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
      byId("relSpeed").addEventListener("change", function (e) {
        autoDelay = +e.target.value || 1000;
        if (autoTimer) { stopAuto(); toggleAuto(); }
      });
    }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      var html = '<div class="legend-title">关系符号说明</div><div class="legend-grid">' +
        cfg.legend.map(function (it) {
          var cls = it[0] === "T" ? " is-T" : (it[0] === "F" ? " is-F" : "");
          return '<div class="legend-item"><span class="sym' + cls + '">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + '</span></div>';
        }).join("") + '</div>';
      if (cfg.laws && cfg.laws.length) {
        html += '<div class="legend-title legend-sub">本层常用等值式</div><div class="law-list">' +
          cfg.laws.map(function (l) { return '<div class="law-item"><span class="law-name">' + esc(l[0]) + '</span><code>' + esc(l[1]) + '</code></div>'; }).join("") + '</div>';
      }
      box.innerHTML = html;
    }

    function renderFormulaInto(el, expr) {
      el.innerHTML = ""; var spans = [];
      for (var i = 0; i < expr.length; i++) {
        var ch = expr[i];
        if (ch === " ") { el.appendChild(document.createTextNode(" ")); continue; }
        var sp = document.createElement("span");
        if (/[a-z]/.test(ch)) { sp.className = "rel-var"; sp.dataset.var = ch; sp.textContent = ch; spans.push(sp); }
        else { sp.className = "rel-op"; sp.textContent = ch; }
        el.appendChild(sp);
      }
      return spans;
    }

    function loadCase(idx) {
      stopAuto();
      var c = cfg.cases[idx];
      curCase = c;
      scenario = c.scenario || "";
      tbl = computeCase(c);
      if (cfg.equivOnly) tbl.verdict = simpleEquivVerdict(tbl);
      p = 0; manualFocus = null;
      renderPair(c);
      renderTable();
      renderChart();
      evalEl.innerHTML = "";
      render();
    }

    function renderPair(c) {
      pairEl.innerHTML =
        '<div class="rel-card is-A"><span class="rel-name">公式 A</span><div class="rel-formula" id="relFa"></div><span class="rel-result" id="relResA">A = ?</span></div>' +
        '<div class="rel-mid">？</div>' +
        '<div class="rel-card is-B"><span class="rel-name">公式 B</span><div class="rel-formula" id="relFb"></div><span class="rel-result" id="relResB">B = ?</span></div>';
      varSpansA = renderFormulaInto(byId("relFa"), c.A.expr);
      varSpansB = renderFormulaInto(byId("relFb"), c.B.expr);
      resA = byId("relResA"); resB = byId("relResB");
      var vrow = document.createElement("div");
      vrow.className = "rel-vars";
      vrow.innerHTML = "命题变元：" + tbl.vars.map(function (v) { return "<b>" + esc(v) + "</b>"; }).join("、") + "　·　共 " + tbl.rows.length + " 个解释（真值表 " + tbl.rows.length + " 行）";
      pairEl.appendChild(vrow);
    }

    function renderTable() {
      var head = '<tr><th class="col-no">行</th>' + tbl.vars.map(function (v) { return "<th>" + esc(v) + "</th>"; }).join("") +
        '<th class="col-a">A</th><th class="col-b">B</th><th>比较</th></tr>';
      var body = tbl.rows.map(function (r, i) {
        var cells = '<td class="col-no">' + (i + 1) + '</td>';
        cells += tbl.vars.map(function (v) { return '<td class="cell-' + TF(r.env[v]) + '">' + TF(r.env[v]) + "</td>"; }).join("");
        cells += '<td class="cell-' + TF(r.a) + '">' + TF(r.a) + "</td>";
        cells += '<td class="cell-' + TF(r.b) + '">' + TF(r.b) + "</td>";
        cells += '<td class="rel-cmp ' + (r.same ? "same" : "diff") + '">' + (r.same ? "=" : "≠") + "</td>";
        return '<tr class="rel-row" data-row="' + i + '">' + cells + "</tr>";
      }).join("");
      tableEl.innerHTML = '<table class="rel-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table>";
      rowEls = Array.prototype.slice.call(tableEl.querySelectorAll("tr.rel-row"));
      rowEls.forEach(function (tr, i) { tr.addEventListener("click", function () { clickRow(i); }); });
    }

    /* 真值指纹图：viewBox 宽度随容器变化，手机上字号不被整体缩小 */
    function renderChart() {
      chartEl.innerHTML = "";
      var N = tbl.rows.length;
      var VW = Math.max(320, Math.min(760, (chartEl.clientWidth || 760) - 14));
      var x0 = VW < 480 ? 64 : 86;
      var cw = Math.min(72, (VW - x0 - 10) / N);
      var H = 132, yA = 30, yB = 78, ch = 36;
      var svg = svgEl("svg", { id: "relChartSvg", viewBox: "0 0 " + VW + " " + H, width: "100%", height: H, role: "img", "aria-label": "公式 A、B 各行真值指纹" });
      var g = svgEl("g"); svg.appendChild(g);
      [["A", yA, "#2f5f9f"], ["B", yB, "#8a5d0b"]].forEach(function (lab) {
        var t = svgEl("text", { x: 8, y: lab[1] + ch / 2, "dominant-baseline": "central", fill: lab[2], "font-size": VW < 480 ? 13 : 15, "font-weight": "800", "font-family": "JetBrains Mono, monospace" });
        t.textContent = "公式 " + lab[0]; g.appendChild(t);
      });
      cellEls = [];
      tbl.rows.forEach(function (r, i) {
        var x = x0 + i * cw;
        function cell(v, y) {
          var rect = svgEl("rect", { x: x, y: y, width: cw - 6, height: ch, rx: 6, fill: v ? "#d6efe1" : "#f8d9d5", stroke: v ? C_T : C_F, "stroke-width": 1.4 });
          var t = svgEl("text", { x: x + (cw - 6) / 2, y: y + ch / 2, "text-anchor": "middle", "dominant-baseline": "central", fill: v ? "#1f6a45" : "#a3281c", "font-size": 13, "font-weight": "800", "font-family": "JetBrains Mono, monospace" });
          t.textContent = TF(v);
          var w = svgEl("g", {}); w.setAttribute("class", "rel-cell"); w.appendChild(rect); w.appendChild(t);
          w.addEventListener("click", function () { clickRow(i); });
          g.appendChild(w);
          return w;
        }
        var wa = cell(r.a, yA), wb = cell(r.b, yB);
        if (!r.same) {
          var mark = svgEl("text", { x: x + (cw - 6) / 2, y: yB + ch + 14, "text-anchor": "middle", fill: C_F, "font-size": 13, "font-weight": "800" }); mark.textContent = "≠";
          g.appendChild(mark);
        }
        cellEls.push({ wa: wa, wb: wb });
      });
      chartEl.appendChild(svg);
    }

    function total() { return tbl.rows.length + 1; }
    function step(dir) { manualFocus = null; p = Math.max(0, Math.min(total(), p + dir)); render(); }
    function clickRow(i) {
      stopAuto();
      var N = tbl.rows.length;
      if (p <= N) { p = i + 1; manualFocus = null; }
      else { manualFocus = (manualFocus === i ? null : i); }
      render();
    }
    function toggleAuto() {
      if (autoTimer) { stopAuto(); return; }
      if (p >= total()) { p = 0; manualFocus = null; render(); }
      autoBtn.classList.add("sym-playing"); autoBtn.textContent = "⏸ 暂停播放";
      autoTimer = setInterval(function () { if (p >= total()) { stopAuto(); return; } manualFocus = null; p += 1; render(); }, autoDelay);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } if (autoBtn) { autoBtn.classList.remove("sym-playing"); autoBtn.textContent = "⏵ 自动播放"; } }

    function render() {
      var N = tbl.rows.length, T = N + 1;
      var rowsShown = Math.min(p, N);
      var verdictShown = p > N;
      var stepRow = (p >= 1 && p <= N) ? p - 1 : null;
      var focusRow = (manualFocus != null) ? manualFocus : stepRow;

      // 真值表 + 指纹格
      for (var k = 0; k < N; k++) {
        var revealed = k < rowsShown || verdictShown;
        var cur = (k === focusRow);
        if (rowEls[k]) {
          rowEls[k].classList.toggle("sym-pending", !revealed);
          rowEls[k].classList.toggle("sym-cur", cur);
        }
        if (cellEls[k]) {
          cellEls[k].wa.classList.toggle("sym-pending", !revealed);
          cellEls[k].wb.classList.toggle("sym-pending", !revealed);
          cellEls[k].wa.classList.toggle("sym-cur", cur);
          cellEls[k].wb.classList.toggle("sym-cur", cur);
        }
      }

      // 公式项高亮（按 focusRow 的取值给变元着色）
      var env = focusRow != null ? tbl.rows[focusRow].env : null;
      colorVars(varSpansA, env); colorVars(varSpansB, env);
      var mid = pairEl.querySelector(".rel-mid");
      if (focusRow != null) {
        var r = tbl.rows[focusRow];
        setRes(resA, "A = " + TF(r.a), r.a);
        setRes(resB, "B = " + TF(r.b), r.b);
        if (mid) { mid.textContent = r.same ? "=" : "≠"; mid.className = "rel-mid " + (r.same ? "is-same" : "is-diff"); }
      } else {
        setRes(resA, "A = ?", null); setRes(resB, "B = ?", null);
        if (mid) { mid.textContent = "？"; mid.className = "rel-mid"; }
      }

      evalEl.innerHTML = evalHTML(focusRow, verdictShown);
      renderVerdict(verdictShown);

      progNum.textContent = p + " / " + T;
      progBar.style.width = (T ? (p / T * 100) : 0) + "%";
      prevBtn.disabled = (p <= 0 && manualFocus == null);
      nextBtn.disabled = (p >= T);
      statusEl.innerHTML = statusHTML(p, focusRow, verdictShown);
    }

    function colorVars(spans, env) {
      spans.forEach(function (sp) {
        sp.classList.remove("rel-true", "rel-false");
        if (env) sp.classList.add(env[sp.dataset.var] ? "rel-true" : "rel-false");
      });
    }
    function setRes(el, txt, v) {
      el.textContent = txt;
      el.classList.remove("rel-true", "rel-false");
      if (v === true) el.classList.add("rel-true"); else if (v === false) el.classList.add("rel-false");
    }

    function evalHTML(focusRow, verdictShown) {
      if (focusRow == null && !verdictShown) return '<span class="ev-hint">点「下一步」开始逐行扫描真值表。每行给一组真值指派，分别算出 A、B 的值并比较。</span>';
      if (focusRow == null && verdictShown) return '已逐行检查全部 <b>' + tbl.rows.length + '</b> 个解释，下方给出关系判定。可点任意行回看。';
      var r = tbl.rows[focusRow];
      var interp = tbl.vars.map(function (v) { return v + "=" + TF(r.env[v]); }).join(", ");
      var extra = "";
      if (!cfg.equivOnly) {
        if (r.a && !r.b) extra = '<div class="ev-line ev-note">这一行 A 真 B 假：A→B 在此为假，是 A ⇒ B 的反例。</div>';
        else if (r.b && !r.a) extra = '<div class="ev-line ev-note">这一行 B 真 A 假：B→A 在此为假，是 B ⇒ A 的反例。</div>';
        else if (r.a && r.b) extra = '<div class="ev-line ev-note">这一行两式同真：它是两式<b>相容</b>的见证。</div>';
      }
      return '<div><span class="ev-interp">解释 I' + (focusRow + 1) + '：' + esc(interp) + '</span></div>' +
        '<div class="ev-line">公式 A 在该行 = <span class="ev-val ' + TF(r.a) + '">' + TF(r.a) + '</span>，公式 B = <span class="ev-val ' + TF(r.b) + '">' + TF(r.b) + '</span></div>' +
        '<div class="ev-line">' + (r.same ? '<span class="ev-same">两式取值相同（=）</span>' : '<span class="ev-diff">两式取值不同（≠）—— 这一行就能否定『等价』</span>') + '</div>' + extra;
    }

    /* 关系清单：四项检查各给出是否成立及见证行 */
    function checklistHTML() {
      var rows = tbl.rows;
      function firstRow(pred) { for (var i = 0; i < rows.length; i++) if (pred(rows[i])) return i + 1; return 0; }
      var dRow = firstRow(function (r) { return !r.same; });
      var abRow = firstRow(function (r) { return r.a && !r.b; });
      var baRow = firstRow(function (r) { return r.b && !r.a; });
      var bothRow = firstRow(function (r) { return r.both; });
      var items = [
        [tbl.equiv, "A ⇔ B", "A↔B 是重言式", tbl.equiv ? "每行取值相同" : "第 " + dRow + " 行取值不同"],
        [tbl.aImpB, "A ⇒ B", "A→B 是重言式", tbl.aImpB ? "无 A真B假 的行" : "第 " + abRow + " 行 A真B假"],
        [tbl.bImpA, "B ⇒ A", "B→A 是重言式", tbl.bImpA ? "无 B真A假 的行" : "第 " + baRow + " 行 B真A假"],
        [tbl.compatible, "相容", "A∧B 可满足", tbl.compatible ? "第 " + bothRow + " 行两式同真" : "没有同真的行"]
      ];
      return '<div class="v-checks">' + items.map(function (it) {
        return '<div class="v-check ' + (it[0] ? "yes" : "no") + '"><span class="v-mark">' + (it[0] ? "✓" : "✗") + '</span>' +
          '<span class="v-rel">' + esc(it[1]) + '</span><span class="v-def">' + esc(it[2]) + '？</span>' +
          '<span class="v-why">' + esc(it[3]) + '</span></div>';
      }).join("") + '</div>';
    }

    function calcHTML() {
      var c = curCase;
      var html = "";
      if (c.calc && c.calc.length) {
        html += '<div class="v-calc"><div class="v-calc-title">' + esc(c.calcTitle || "等值演算") + '</div>' +
          c.calc.map(function (st) {
            return '<div class="calc-row"><span class="calc-rel">' + esc(st[0]) + '</span><code class="calc-f">' + esc(st[1]) + '</code>' +
              (st[2] ? '<span class="calc-why">' + esc(st[2]) + '</span>' : '<span class="calc-why"></span>') + '</div>';
          }).join("") +
          (c.calcEnd ? '<div class="calc-end">' + esc(c.calcEnd) + '</div>' : "") + '</div>';
      }
      if (c.law) html += '<div class="v-law">📘 ' + esc(c.law) + '</div>';
      return html;
    }

    function renderVerdict(show) {
      var v = tbl.verdict;
      verdictEl.className = "rel-verdict " + (show ? "k-" + v.key : "sym-pending");
      verdictEl.innerHTML = '<span class="v-chip">关系判定：' + (show ? esc(v.label) : "待逐行检查") + '</span>' +
        '<div class="v-reason">' + (show ? v.reason : "逐行检查完全部解释后给出结论…") + '</div>' +
        (show ? (cfg.equivOnly ? "" : checklistHTML()) + calcHTML() : "");
    }

    function statusHTML(pp, focusRow, verdictShown) {
      if (pp === 0) return cfg.introStatus + (scenario ? '<br><b>情境：</b>' + esc(scenario) : "");
      if (focusRow != null) {
        var r = tbl.rows[focusRow];
        return '第 <b>' + (focusRow + 1) + '</b> 行：' + esc(tbl.vars.map(function (v) { return v + "=" + TF(r.env[v]); }).join(", ")) +
          ' → A=' + TF(r.a) + '，B=' + TF(r.b) + '，' + (r.same ? '相同 =' : '<b>不同 ≠</b>') + '。';
      }
      if (verdictShown) return '✅ <b>判定完成：' + esc(tbl.verdict.label) + '</b>　可点任意真值行 / 指纹格回看。';
      return "";
    }

    renderControls();
    renderLegend();
    loadCase(0);

    var lastW = chartEl.clientWidth, rT = null;
    global.addEventListener("resize", function () {
      clearTimeout(rT);
      rT = setTimeout(function () {
        if (Math.abs(chartEl.clientWidth - lastW) < 24) return;
        lastW = chartEl.clientWidth;
        renderChart();
        render();
      }, 160);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})(typeof window !== "undefined" ? window : globalThis);
