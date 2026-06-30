/* =====================================================================
 * 5.4 命题公式之间的关系 —— 三层统一交互引擎（公式关系比对器）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与 6.1 同形）：选择公式对 → 逐步演示
 *   点一步逐行扫描真值表 → 看反馈（该行两式取值）→ 看公式项高亮（变元按真值着色、A/B 求值）
 *   → 看真值指纹图高亮 → 给出关系判定（等价 / 蕴含 / 相容 / 矛盾）。
 *   完成后可点任意真值行 / 指纹格，跨视图联动高亮。
 *
 * 难度梯度：
 *   基础层：等价判定（A⇔B 真值表是否相同），2 变元，蕴含/德摩根等值式。
 *   进阶层：等价 + 蕴含 + 相容，含 3 变元等值演算（输出律等）。
 *   拓展层：查询条件改写（分配律）、知识库一致性与矛盾检测（UNSAT），3 变元。
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
    var verdict = classify({ equiv: equiv, aImpB: aImpB, bImpA: bImpA, compatible: compatible }, rows);
    return { vars: vars, rows: rows, equiv: equiv, aImpB: aImpB, bImpA: bImpA, compatible: compatible, verdict: verdict };
  }
  function rowIndex(rows, pred) { for (var i = 0; i < rows.length; i++) if (pred(rows[i])) return i + 1; return 0; }
  function classify(rel, rows) {
    var nDiff = rows.filter(function (r) { return !r.same; }).length;
    if (rel.equiv) {
      return { key: "equiv", label: "逻辑等价  A ⇔ B",
        reason: "全部 " + rows.length + " 个解释下，A 与 B 取值<b>完全相同</b>，故 A ⇔ B（真值表相同 / 等值式）。" };
    }
    if (rel.aImpB) {
      return { key: "imp", label: "A 蕴含 B（A ⇒ B）",
        reason: "凡使 A 为真的解释都使 B 为真（无 A真B假 反例），故 <b>A ⇒ B</b>；但有 " + nDiff + " 个解释两式取值不同，故不等价。" };
    }
    if (rel.bImpA) {
      return { key: "imp", label: "B 蕴含 A（B ⇒ A）",
        reason: "凡使 B 为真的解释都使 A 为真，故 <b>B ⇒ A</b>；但两式并不处处相同，故不等价。" };
    }
    if (rel.compatible) {
      var bi = rowIndex(rows, function (r) { return r.both; });
      return { key: "compat", label: "相容但不等价",
        reason: "存在解释使两式<b>同真</b>（第 " + bi + " 行），故<b>相容</b>；但既有 A真B假、又有 B真A假 的行，无单向蕴含，也不等价。" };
    }
    return { key: "contra", label: "矛盾（不可同真）",
      reason: "<b>不存在</b>使两式同真的解释，A∧B 恒假，故两式<b>矛盾</b>（不可同真 / UNSAT）。" };
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

  /* ---------- 三层数据 ---------- */
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
      cases: [
        { label: "p→q  与  ¬p∨q", vars: ["p", "q"],
          A: { expr: "p → q" }, B: { expr: "¬p ∨ q" },
          scenario: "蕴含等值式：把『如果 p 则 q』改写为『非 p 或 q』，二者是否等价？" },
        { label: "¬(p∧q)  与  ¬p∨¬q", vars: ["p", "q"],
          A: { expr: "¬(p ∧ q)" }, B: { expr: "¬p ∨ ¬q" },
          scenario: "德摩根律：『并非(p且q)』与『非p 或 非q』。" },
        { label: "p∨q  与  p∧q", vars: ["p", "q"],
          A: { expr: "p ∨ q" }, B: { expr: "p ∧ q" },
          scenario: "『或』与『且』是否等价？找一行反例即可否定。" }
      ]
    },
    advanced: {
      introStatus: "选择一对公式，逐行扫描真值表，判定它们是等价、单向蕴含、相容还是矛盾。",
      legend: [
        ["⇔", "逻辑等价 · 真值表相同"],
        ["⇒", "逻辑蕴含 · A真则B真"],
        ["相容", "存在同真行"],
        ["矛盾", "无同真行"],
        ["T", "真"], ["F", "假"],
        ["≠", "存在取值不同的行"]
      ],
      cases: [
        { label: "p∧q  与  p∨q", vars: ["p", "q"],
          A: { expr: "p ∧ q" }, B: { expr: "p ∨ q" },
          scenario: "合取强于析取：p∧q 是否蕴含 p∨q？" },
        { label: "p→(q→r)  与  (p∧q)→r", vars: ["p", "q", "r"],
          A: { expr: "p → (q → r)" }, B: { expr: "(p ∧ q) → r" },
          scenario: "输出律（等值演算）：8 行真值表是否处处相同？" },
        { label: "¬(p→q)  与  p∧¬q", vars: ["p", "q"],
          A: { expr: "¬(p → q)" }, B: { expr: "p ∧ ¬q" },
          scenario: "蕴含的否定：¬(p→q) 等值于什么？" },
        { label: "p∨q  与  p→q", vars: ["p", "q"],
          A: { expr: "p ∨ q" }, B: { expr: "p → q" },
          scenario: "相容但不等价、且无单向蕴含的典型例。" }
      ]
    },
    extend: {
      introStatus: "把公式关系迁移到查询优化与知识库一致性：逐行比对，判断条件改写是否等价、规则是否矛盾。",
      legend: [
        ["⇔", "等价 · 条件改写"],
        ["⇒", "蕴含"],
        ["相容", "可同真 · 一致"],
        ["矛盾", "不可同真 · 冲突"],
        ["T", "真"], ["F", "假"],
        ["≠", "存在反例行"],
        ["SQL", "查询条件优化"]
      ],
      cases: [
        { label: "¬(p∧q)  与  ¬p∨¬q", vars: ["p", "q"],
          A: { expr: "¬(p ∧ q)" }, B: { expr: "¬p ∨ ¬q" },
          scenario: "查询条件改写：WHERE NOT(p AND q) ⇔ NOT p OR NOT q（德摩根），等价才能放心改写。" },
        { label: "(p∧q)∨(p∧r)  与  p∧(q∨r)", vars: ["p", "q", "r"],
          A: { expr: "(p ∧ q) ∨ (p ∧ r)" }, B: { expr: "p ∧ (q ∨ r)" },
          scenario: "查询优化：提取公因子（分配律），减少重复计算——必须等价。" },
        { label: "p→q  与  p∧¬q", vars: ["p", "q"],
          A: { expr: "p → q" }, B: { expr: "p ∧ ¬q" },
          scenario: "知识库一致性：规则『p→q』与事实『p 且 非 q』能否同真？" },
        { label: "p∨q  与  p→q", vars: ["p", "q"],
          A: { expr: "p ∨ q" }, B: { expr: "p → q" },
          scenario: "约束系统：两条件相容但不等价，哪些解释是可行模型？" }
      ]
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { parse: parse, makeEval: makeEval, computeCase: computeCase, LEVELS: LEVELS };
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

    var controlsEl = byId("controls");
    var pairEl = byId("relPair");
    var tableEl = byId("relTable");
    var evalEl = byId("relEval");
    var chartEl = byId("relChart");
    var verdictEl = byId("relVerdict");
    if (!controlsEl || !pairEl) return;

    var tbl = null, scenario = "";
    var p = 0, manualFocus = null, autoTimer = null;
    var varSpansA = [], varSpansB = [], resA = null, resB = null;
    var rowEls = [], cellEls = [];
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.cases.map(function (c, i) { return '<option value="' + i + '">' + esc(c.label) + '</option>'; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label><span>选择公式对</span><small>A 与 B</small></label>' +
          '<select id="relSelect">' + opts + '</select></div>' +
        '<div class="control-group"><label><span>逐行演示</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button class="sym-step-btn" id="relPrev">◀ 上一步</button>' +
            '<button class="sym-step-btn sym-primary" id="relNext">下一步 ▶</button>' +
            '<button class="sym-step-btn" id="relAuto">⏵ 自动播放</button>' +
            '<button class="sym-step-btn" id="relReset">↺ 重置</button>' +
          '</div></div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="relProgBar"></i></div>' +
          '<span class="sym-progress-num" id="relProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="relStatus"></div></div>';
      statusEl = byId("relStatus"); progBar = byId("relProgBar"); progNum = byId("relProgNum");
      prevBtn = byId("relPrev"); nextBtn = byId("relNext"); autoBtn = byId("relAuto");
      byId("relSelect").addEventListener("change", function (e) { loadCase(+e.target.value); });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("relReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
    }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      box.innerHTML = '<div class="legend-title">关系符号说明</div><div class="legend-grid">' +
        cfg.legend.map(function (it) { return '<div class="legend-item"><span class="sym">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + '</span></div>'; }).join("") + '</div>';
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
      var head = "<tr>" + tbl.vars.map(function (v) { return "<th>" + esc(v) + "</th>"; }).join("") +
        '<th class="col-a">A</th><th class="col-b">B</th><th>比较</th></tr>';
      var body = tbl.rows.map(function (r, i) {
        var cells = tbl.vars.map(function (v) { return '<td class="cell-' + TF(r.env[v]) + '">' + TF(r.env[v]) + "</td>"; }).join("");
        cells += '<td class="cell-' + TF(r.a) + '">' + TF(r.a) + "</td>";
        cells += '<td class="cell-' + TF(r.b) + '">' + TF(r.b) + "</td>";
        cells += '<td class="rel-cmp ' + (r.same ? "same" : "diff") + '">' + (r.same ? "=" : "≠") + "</td>";
        return '<tr class="rel-row" data-row="' + i + '">' + cells + "</tr>";
      }).join("");
      tableEl.innerHTML = '<table class="rel-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table>";
      rowEls = Array.prototype.slice.call(tableEl.querySelectorAll("tr.rel-row"));
      rowEls.forEach(function (tr, i) { tr.addEventListener("click", function () { clickRow(i); }); });
    }

    function renderChart() {
      chartEl.innerHTML = "";
      var N = tbl.rows.length, VW = 760, x0 = 86, cw = Math.min(72, (VW - x0 - 14) / N);
      var H = 132, yA = 30, yB = 78, ch = 36;
      var svg = svgEl("svg", { id: "relChart", viewBox: "0 0 " + VW + " " + H, width: "100%", height: H });
      var g = svgEl("g"); svg.appendChild(g);
      [["A", yA, "#2f5f9f"], ["B", yB, "#9a6a12"]].forEach(function (lab) {
        var t = svgEl("text", { x: 14, y: lab[1] + ch / 2, "dominant-baseline": "central", fill: lab[2], "font-size": 15, "font-weight": "800", "font-family": "JetBrains Mono, monospace" });
        t.textContent = "公式 " + lab[0]; g.appendChild(t);
      });
      cellEls = [];
      tbl.rows.forEach(function (r, i) {
        var x = x0 + i * cw;
        var rectA = svgEl("rect", { x: x, y: yA, width: cw - 6, height: ch, rx: 6, fill: r.a ? "#cdebd9" : "#f6d3ce", stroke: r.a ? "#2f7d57" : "#b42318", "stroke-width": 1.4 });
        var rectB = svgEl("rect", { x: x, y: yB, width: cw - 6, height: ch, rx: 6, fill: r.b ? "#cdebd9" : "#f6d3ce", stroke: r.b ? "#2f7d57" : "#b42318", "stroke-width": 1.4 });
        var tA = svgEl("text", { x: x + (cw - 6) / 2, y: yA + ch / 2, "text-anchor": "middle", "dominant-baseline": "central", fill: r.a ? "#1d6b43" : "#97180f", "font-size": 13, "font-weight": "800", "font-family": "JetBrains Mono, monospace" }); tA.textContent = TF(r.a);
        var tB = svgEl("text", { x: x + (cw - 6) / 2, y: yB + ch / 2, "text-anchor": "middle", "dominant-baseline": "central", fill: r.b ? "#1d6b43" : "#97180f", "font-size": 13, "font-weight": "800", "font-family": "JetBrains Mono, monospace" }); tB.textContent = TF(r.b);
        var wrapA = svgEl("g", {}); wrapA.setAttribute("class", "rel-cell"); wrapA.appendChild(rectA); wrapA.appendChild(tA);
        var wrapB = svgEl("g", {}); wrapB.setAttribute("class", "rel-cell"); wrapB.appendChild(rectB); wrapB.appendChild(tB);
        wrapA.addEventListener("click", function () { clickRow(i); });
        wrapB.addEventListener("click", function () { clickRow(i); });
        g.appendChild(wrapA); g.appendChild(wrapB);
        // 差异标记
        if (!r.same) {
          var mark = svgEl("text", { x: x + (cw - 6) / 2, y: yB + ch + 14, "text-anchor": "middle", fill: "#b42318", "font-size": 13, "font-weight": "800" }); mark.textContent = "≠";
          g.appendChild(mark);
        }
        cellEls.push({ a: rectA, b: rectB, wa: wrapA, wb: wrapB });
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
      autoBtn.classList.add("sym-playing"); autoBtn.textContent = "⏸ 暂停";
      autoTimer = setInterval(function () { if (p >= total()) { stopAuto(); return; } manualFocus = null; p += 1; render(); }, 1000);
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
      if (focusRow != null) {
        var r = tbl.rows[focusRow];
        setRes(resA, "A = " + TF(r.a), r.a);
        setRes(resB, "B = " + TF(r.b), r.b);
        var mid = pairEl.querySelector(".rel-mid"); if (mid) mid.textContent = r.same ? "=" : "≠";
      } else {
        setRes(resA, "A = ?", null); setRes(resB, "B = ?", null);
        var mid2 = pairEl.querySelector(".rel-mid"); if (mid2) mid2.textContent = "？";
      }

      // 逐行判定文字
      evalEl.innerHTML = evalHTML(focusRow, verdictShown);

      // 关系结论
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
      if (focusRow == null && !verdictShown) return '<span style="color:#6c5a52">点「下一步」开始逐行扫描真值表。每行给一组真值指派，分别算出 A、B 的值并比较。</span>';
      if (focusRow == null && verdictShown) return '已逐行检查全部 <b>' + tbl.rows.length + '</b> 个解释，下方给出关系判定。可点任意行回看。';
      var r = tbl.rows[focusRow];
      var interp = tbl.vars.map(function (v) { return v + "=" + TF(r.env[v]); }).join(", ");
      return '<div><span class="ev-interp">解释 I' + (focusRow + 1) + '：' + esc(interp) + '</span></div>' +
        '<div class="ev-line">公式 A 在该行 = <span class="ev-val ' + TF(r.a) + '">' + TF(r.a) + '</span>，公式 B = <span class="ev-val ' + TF(r.b) + '">' + TF(r.b) + '</span></div>' +
        '<div class="ev-line">' + (r.same ? '<span class="ev-same">两式取值相同（=）</span>' : '<span class="ev-diff">两式取值不同（≠）—— 这一行就能否定『等价』</span>') + '</div>';
    }

    function renderVerdict(show) {
      var v = tbl.verdict;
      verdictEl.className = "rel-verdict k-" + v.key + (show ? "" : " sym-pending");
      verdictEl.innerHTML = '<span class="v-chip">关系判定：' + esc(v.label) + '</span>' +
        '<div class="v-reason">' + (show ? v.reason : "逐行检查完成后给出结论…") + '</div>';
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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})(typeof window !== "undefined" ? window : globalThis);
