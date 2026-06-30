/* =====================================================================
 * 5.5 对偶与范式 —— 三层统一交互引擎（对偶与范式拼图）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与本章其它小节同形）：选择公式 → 逐行扫描真值表
 *   点一步看一行 → 看反馈（真行提取极小项 m_i，假行提取极大项 M_i）
 *   → 看主范式公式中对应项高亮 → 看星图格高亮 → 拼出 PDNF / PCNF。
 *   完成后可点任意真值行 / 小项卡 / 星图格 / 公式项，跨视图联动高亮。
 *
 * 难度梯度：
 *   基础层：对偶原理，2 变元（4 行），观察 ∧↔∨、M_i=¬m_i 的对称之美。
 *   进阶层：主范式，3 变元（8 行），PDNF/PCNF 的唯一标准形。
 *   拓展层：电路综合与 SAT，3 变元，CNF 子句 = SAT 输入、PDNF = 电路综合。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* ---------- 命题公式求值器（¬ ∧ ∨ → ↔，变元 a-z，括号） ---------- */
  function parse(expr) {
    var i = 0, s = expr;
    function peek() { while (i < s.length && s[i] === " ") i++; return s[i]; }
    function next() { var c = peek(); i++; return c; }
    function pIff() { var l = pImp(); while (peek() === "↔") { next(); l = { op: "↔", l: l, r: pImp() }; } return l; }
    function pImp() { var l = pOr(); if (peek() === "→") { next(); return { op: "→", l: l, r: pImp() }; } return l; }
    function pOr() { var l = pAnd(); while (peek() === "∨") { next(); l = { op: "∨", l: l, r: pAnd() }; } return l; }
    function pAnd() { var l = pNot(); while (peek() === "∧") { next(); l = { op: "∧", l: l, r: pNot() }; } return l; }
    function pNot() { if (peek() === "¬") { next(); return { op: "¬", r: pNot() }; } return pAtom(); }
    function pAtom() { var c = peek(); if (c === "(") { next(); var e = pIff(); if (peek() === ")") next(); return e; } next(); return { v: c }; }
    return pIff();
  }
  function ev(n, env) {
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

  /* ---------- 计算真值表 + 极小项/极大项 + 主范式 ---------- */
  function computeCase(c) {
    var vars = c.vars, n = vars.length, f = makeEval(c.expr);
    var rows = [];
    for (var m = 0; m < (1 << n); m++) {
      var env = {};
      for (var k = 0; k < n; k++) env[vars[k]] = !!(m & (1 << (n - 1 - k)));
      var val = f(env);
      var minterm = "(" + vars.map(function (v) { return env[v] ? v : "¬" + v; }).join(" ∧ ") + ")";
      var maxterm = "(" + vars.map(function (v) { return env[v] ? "¬" + v : v; }).join(" ∨ ") + ")";
      var bits = vars.map(function (v) { return env[v] ? "1" : "0"; }).join("");
      rows.push({ i: m, env: env, val: val, minterm: minterm, maxterm: maxterm, bits: bits });
    }
    var ones = rows.filter(function (r) { return r.val; });
    var zeros = rows.filter(function (r) { return !r.val; });
    var pdnf = ones.length ? ones.map(function (r) { return r.minterm; }).join(" ∨ ") : "0（矛盾式）";
    var pcnf = zeros.length ? zeros.map(function (r) { return r.maxterm; }).join(" ∧ ") : "1（重言式）";
    return { vars: vars, rows: rows, ones: ones, zeros: zeros, pdnf: pdnf, pcnf: pcnf };
  }

  /* ---------- 三层数据 ---------- */
  var LEVELS = {
    basic: {
      introStatus: "选择一个公式，点「下一步」逐行扫描真值表：真行提取极小项 m_i，假行提取极大项 M_i，体会 ∧↔∨ 对偶之美。",
      note: "<b>对偶原理：</b>极小项用 ∧、极大项用 ∨，且文字极性相反——这正是 ∧↔∨、T↔F 的对偶。可证 <b>M_i = ¬m_i</b>：PDNF 收真行、PCNF 收假行，二者对称共生。",
      legend: [
        ["m_i", "极小项 · 真行的合取"], ["M_i", "极大项 · 假行的析取"],
        ["∧↔∨", "对偶：合取/析取互换"], ["T↔F", "对偶：真/假互换"],
        ["M_i=¬m_i", "极大极小项互补"]
      ],
      cases: [
        { label: "p ∧ q", vars: ["p", "q"], expr: "p ∧ q",
          scenario: "只有一行为真——PDNF 仅 1 个极小项；它的对偶 p∨q 则只有 1 个极大项。" },
        { label: "p ∨ q", vars: ["p", "q"], expr: "p ∨ q",
          scenario: "p∨q 是 p∧q 的对偶：真假行数互换，极小/极大项个数互换。" },
        { label: "p → q", vars: ["p", "q"], expr: "p → q",
          scenario: "只有 p=T,q=F 一行为假——PCNF 仅 1 个极大项 (¬p∨q)，正是 p→q 的等值式。" }
      ]
    },
    advanced: {
      introStatus: "选择一个公式，逐行扫描真值表：真行→极小项→PDNF，假行→极大项→PCNF，得到唯一的主范式。",
      note: "<b>唯一性：</b>主析取范式（极小项之或）与主合取范式（极大项之合）都由真值表唯一确定——同一真值函数，无论原式如何变形，主范式恒定不变。",
      legend: [
        ["PDNF", "主析取范式 · ∨ 极小项"], ["PCNF", "主合取范式 · ∧ 极大项"],
        ["m_i", "极小项（真行）"], ["M_i", "极大项（假行）"],
        ["唯一", "主范式唯一"], ["T / F", "真 / 假"]
      ],
      cases: [
        { label: "(p → q) ∧ (q → r)", vars: ["p", "q", "r"], expr: "(p → q) ∧ (q → r)",
          scenario: "传递性公式的主范式：真行给 PDNF，假行给 PCNF。" },
        { label: "(p ∧ q) ∨ r", vars: ["p", "q", "r"], expr: "(p ∧ q) ∨ r",
          scenario: "积之和形式，化为唯一主范式。" },
        { label: "(p ∨ q) → r", vars: ["p", "q", "r"], expr: "(p ∨ q) → r",
          scenario: "析取前件的蕴含：化为唯一主范式。" },
        { label: "p → (q → r)", vars: ["p", "q", "r"], expr: "p → (q → r)",
          scenario: "蕴含嵌套：仅 1 行为假，PCNF 只有 1 个极大项。" }
      ]
    },
    extend: {
      introStatus: "选择一个电路/约束函数，逐行扫描：真行→PDNF（积之和，电路综合），假行→极大项=CNF 子句（SAT 输入）。",
      note: "<b>电路综合与 SAT：</b>PDNF 是『积之和』，对应两级与–或门电路；PCNF 是『和之积』，每个极大项就是一条 <b>CNF 子句</b>——正是 SAT 求解器的标准输入。范式标准化让逻辑可综合、可判定。",
      legend: [
        ["CNF", "合取范式 · SAT 输入"], ["子句", "clause · 极大项"],
        ["PDNF", "主析取 · 电路综合"], ["SAT", "可满足性"],
        ["m_i / M_i", "极小 / 极大项"], ["T / F", "真 / 假"]
      ],
      cases: [
        { label: "多数表决器 maj(p,q,r)", vars: ["p", "q", "r"], expr: "(p ∧ q) ∨ (q ∧ r) ∨ (p ∧ r)",
          scenario: "三取二表决电路：PDNF 给与–或门综合，PCNF 给 CNF 子句。" },
        { label: "二选一选择器 MUX", vars: ["s", "a", "b"], expr: "(¬s ∧ a) ∨ (s ∧ b)",
          scenario: "数据选择器：s=0 选 a，s=1 选 b。主范式给出标准电路结构。" },
        { label: "约束系统 (SAT)", vars: ["p", "q", "r"], expr: "(p ∨ q) ∧ (¬p ∨ r) ∧ (¬q ∨ ¬r)",
          scenario: "三条约束子句：真行即为可满足的赋值（模型），PCNF 即子句集。" }
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

  function run() {
    var levelKey = global.SYMBOLIZE_LEVEL || "basic";
    var cfg = LEVELS[levelKey] || LEVELS.basic;

    var controlsEl = byId("controls");
    var tableEl = byId("nfTable");
    var termsEl = byId("nfTerms");
    var formsEl = byId("nfForms");
    var starEl = byId("nfStar");
    var evalEl = byId("nfEval");
    if (!controlsEl || !tableEl) return;

    var tbl = null, scenario = "";
    var p = 0, manualFocus = null, autoTimer = null;
    var rowEls = [], termEls = [], cellEls = [], segMap = {};
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.cases.map(function (c, i) { return '<option value="' + i + '">' + esc(c.label) + '</option>'; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label><span>选择公式</span><small>目标真值函数</small></label>' +
          '<select id="nfSelect">' + opts + '</select></div>' +
        '<div class="control-group"><label><span>逐行扫描</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button class="sym-step-btn" id="nfPrev">◀ 上一步</button>' +
            '<button class="sym-step-btn sym-primary" id="nfNext">下一步 ▶</button>' +
            '<button class="sym-step-btn" id="nfAuto">⏵ 自动播放</button>' +
            '<button class="sym-step-btn" id="nfReset">↺ 重置</button>' +
          '</div></div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="nfProgBar"></i></div>' +
          '<span class="sym-progress-num" id="nfProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="nfStatus"></div></div>';
      statusEl = byId("nfStatus"); progBar = byId("nfProgBar"); progNum = byId("nfProgNum");
      prevBtn = byId("nfPrev"); nextBtn = byId("nfNext"); autoBtn = byId("nfAuto");
      byId("nfSelect").addEventListener("change", function (e) { loadCase(+e.target.value); });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("nfReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
    }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      box.innerHTML = '<div class="legend-title">范式符号说明</div><div class="legend-grid">' +
        cfg.legend.map(function (it) { return '<div class="legend-item"><span class="sym">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + '</span></div>'; }).join("") + '</div>';
    }

    function loadCase(idx) {
      stopAuto();
      tbl = computeCase(cfg.cases[idx]);
      scenario = cfg.cases[idx].scenario || "";
      p = 0; manualFocus = null;
      renderTable(); renderTerms(); renderForms(); renderStar();
      evalEl.innerHTML = "";
      render();
    }

    function renderTable() {
      var head = "<tr>" + tbl.vars.map(function (v) { return "<th>" + esc(v) + "</th>"; }).join("") +
        '<th class="col-f">f</th><th>提取</th></tr>';
      var body = tbl.rows.map(function (r, i) {
        var cells = tbl.vars.map(function (v) { return '<td class="cell-' + (r.env[v] ? "1" : "0") + '">' + (r.env[v] ? "1" : "0") + "</td>"; }).join("");
        cells += '<td class="f-' + (r.val ? "1" : "0") + ' cell-' + (r.val ? "1" : "0") + '">' + (r.val ? "1" : "0") + "</td>";
        cells += '<td class="nf-kind ' + (r.val ? "k-m" : "k-M") + '">' + (r.val ? "m" : "M") + "<sub>" + i + "</sub></td>";
        return '<tr class="nf-row" data-row="' + i + '">' + cells + "</tr>";
      }).join("");
      tableEl.innerHTML = '<table class="nf-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table>";
      rowEls = Array.prototype.slice.call(tableEl.querySelectorAll("tr.nf-row"));
      rowEls.forEach(function (tr, i) { tr.addEventListener("click", function () { clickRow(i); }); });
    }

    function renderTerms() {
      termsEl.innerHTML = "";
      termEls = tbl.rows.map(function (r, i) {
        var d = document.createElement("div");
        d.className = "nf-term " + (r.val ? "t-min" : "t-max");
        d.dataset.row = i;
        d.innerHTML = '<span class="nt-label">' + (r.val ? "极小项 m" : "极大项 M") + "<sub>" + i + "</sub></span>" +
          '<span class="nt-body">' + esc(r.val ? r.minterm : r.maxterm) + "</span>";
        d.addEventListener("click", function () { clickRow(i); });
        termsEl.appendChild(d);
        return d;
      });
    }

    function renderForms() {
      segMap = {};
      function buildForm(label, kind, rowsArr, cls, conn, empty) {
        var body;
        if (!rowsArr.length) { body = '<span class="nf-seg">' + esc(empty) + "</span>"; }
        else {
          body = rowsArr.map(function (r) {
            return '<span class="nf-seg ' + cls + '" data-row="' + r.i + '">' + esc(r.val ? r.minterm : r.maxterm) + "</span>";
          }).join('<span class="nf-conn"> ' + conn + " </span>");
        }
        return '<div class="nf-form ' + (kind === "min" ? "f-pdnf" : "f-pcnf") + '"><div class="nf-form-label">' + label + '</div><div class="nf-form-body">' + body + "</div></div>";
      }
      formsEl.innerHTML =
        buildForm("主析取范式 PDNF（真行 → 极小项之 ∨）", "min", tbl.ones, "t-min", "∨", "0（矛盾式，无真行）") +
        buildForm("主合取范式 PCNF（假行 → 极大项之 ∧）", "max", tbl.zeros, "t-max", "∧", "1（重言式，无假行）") +
        '<div class="nf-note">' + cfg.note + "</div>";
      Array.prototype.forEach.call(formsEl.querySelectorAll(".nf-seg[data-row]"), function (sp) {
        var ri = +sp.dataset.row;
        (segMap[ri] = segMap[ri] || []).push(sp);
        sp.addEventListener("click", function () { clickRow(ri); });
      });
    }

    function renderStar() {
      starEl.innerHTML = "";
      var n = tbl.rows.length, cols = Math.min(4, n), rowsN = Math.ceil(n / cols);
      var VW = 760, pad = 12, cw = (VW - pad * 2) / cols, chh = 60;
      var H = pad * 2 + rowsN * chh;
      var svg = svgEl("svg", { id: "nfStar", viewBox: "0 0 " + VW + " " + H, width: "100%", height: H });
      var g = svgEl("g"); svg.appendChild(g);
      cellEls = tbl.rows.map(function (r, i) {
        var col = i % cols, row = Math.floor(i / cols);
        var x = pad + col * cw, y = pad + row * chh;
        var cg = svgEl("g"); cg.setAttribute("class", "nf-cell"); cg.dataset.row = i;
        var rect = svgEl("rect", { x: x + 5, y: y + 5, width: cw - 10, height: chh - 12, rx: 9,
          fill: r.val ? "#cdebd9" : "#f6d3ce", stroke: r.val ? "#2f7d57" : "#b42318", "stroke-width": 1.6 });
        var t1 = svgEl("text", { x: x + cw / 2, y: y + 24, "text-anchor": "middle", fill: "#2d211d", "font-size": 14, "font-weight": "800", "font-family": "JetBrains Mono, monospace" }); t1.textContent = r.bits;
        var t2 = svgEl("text", { x: x + cw / 2, y: y + 42, "text-anchor": "middle", fill: r.val ? "#1d6b43" : "#97180f", "font-size": 12.5, "font-weight": "800" });
        t2.textContent = (r.val ? "m" : "M") + i + " · f=" + (r.val ? "1" : "0");
        cg.appendChild(rect); cg.appendChild(t1); cg.appendChild(t2);
        cg.addEventListener("click", function () { clickRow(i); });
        g.appendChild(cg);
        return { g: cg, rect: rect };
      });
      starEl.appendChild(svg);
    }

    function total() { return tbl.rows.length + 1; }
    function step(dir) { manualFocus = null; p = Math.max(0, Math.min(total(), p + dir)); render(); }
    function clickRow(i) {
      stopAuto();
      var n = tbl.rows.length;
      if (p <= n) { p = i + 1; manualFocus = null; }
      else { manualFocus = (manualFocus === i ? null : i); }
      render();
    }
    function toggleAuto() {
      if (autoTimer) { stopAuto(); return; }
      if (p >= total()) { p = 0; manualFocus = null; render(); }
      autoBtn.classList.add("sym-playing"); autoBtn.textContent = "⏸ 暂停";
      autoTimer = setInterval(function () { if (p >= total()) { stopAuto(); return; } manualFocus = null; p += 1; render(); }, 950);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } if (autoBtn) { autoBtn.classList.remove("sym-playing"); autoBtn.textContent = "⏵ 自动播放"; } }

    function render() {
      var n = tbl.rows.length, T = n + 1;
      var rowsShown = Math.min(p, n);
      var assembleShown = p > n;
      var stepRow = (p >= 1 && p <= n) ? p - 1 : null;
      var focusRow = (manualFocus != null) ? manualFocus : stepRow;

      for (var k = 0; k < n; k++) {
        var revealed = k < rowsShown || assembleShown;
        var isCur = (k === focusRow);
        if (rowEls[k]) { rowEls[k].classList.toggle("sym-pending", !revealed); rowEls[k].classList.toggle("sym-cur", isCur); }
        if (termEls[k]) { termEls[k].classList.toggle("sym-pending", !revealed); termEls[k].classList.toggle("sym-cur", isCur); }
        if (cellEls[k]) { cellEls[k].g.classList.toggle("sym-pending", !revealed); cellEls[k].g.classList.toggle("sym-cur", isCur); }
        if (segMap[k]) segMap[k].forEach(function (sp) { sp.classList.toggle("sym-pending", !revealed); sp.classList.toggle("sym-cur", isCur); });
      }

      evalEl.innerHTML = evalHTML(focusRow, assembleShown);
      progNum.textContent = p + " / " + T;
      progBar.style.width = (T ? (p / T * 100) : 0) + "%";
      prevBtn.disabled = (p <= 0 && manualFocus == null);
      nextBtn.disabled = (p >= T);
      statusEl.innerHTML = statusHTML(p, focusRow, assembleShown);
    }

    function evalHTML(focusRow, assembleShown) {
      if (focusRow == null && !assembleShown) return '<span style="color:#6c5a52">点「下一步」逐行扫描真值表。f=1 的行提取极小项并入 PDNF，f=0 的行提取极大项并入 PCNF。</span>';
      if (focusRow == null && assembleShown) {
        return '✅ 已扫描全部 <b>' + tbl.rows.length + '</b> 行：' + tbl.ones.length + ' 个真行 → PDNF（' + tbl.ones.length + ' 项），' +
          tbl.zeros.length + ' 个假行 → PCNF（' + tbl.zeros.length + ' 项）。主范式唯一确定。可点任意元素回看。';
      }
      var r = tbl.rows[focusRow];
      var interp = tbl.vars.map(function (v) { return v + "=" + (r.env[v] ? "1" : "0"); }).join(", ");
      if (r.val) {
        return '<div>第 <b>' + (focusRow + 1) + '</b> 行（' + esc(interp) + '）→ f=<b>1</b></div>' +
          '<div style="margin-top:4px">提取极小项 <span class="ev-min">m' + focusRow + ' = ' + esc(r.minterm) + '</span>，并入 <b>PDNF</b>。</div>';
      }
      return '<div>第 <b>' + (focusRow + 1) + '</b> 行（' + esc(interp) + '）→ f=<b>0</b></div>' +
        '<div style="margin-top:4px">提取极大项 <span class="ev-max">M' + focusRow + ' = ' + esc(r.maxterm) + '</span>，并入 <b>PCNF</b>。</div>';
    }

    function statusHTML(pp, focusRow, assembleShown) {
      if (pp === 0) return cfg.introStatus + (scenario ? '<br><b>情境：</b>' + esc(scenario) : "");
      if (focusRow != null) {
        var r = tbl.rows[focusRow];
        return '第 <b>' + (focusRow + 1) + '</b> 行 (' + esc(r.bits) + ') · f=' + (r.val ? "1" : "0") + ' → ' +
          (r.val ? '<span style="color:#1d6b43;font-weight:800">极小项 m' + focusRow + '</span>' : '<span style="color:#97180f;font-weight:800">极大项 M' + focusRow + '</span>') + '。';
      }
      if (assembleShown) return '✅ <b>主范式拼装完成</b>　PDNF=' + tbl.ones.length + ' 项 · PCNF=' + tbl.zeros.length + ' 项。';
      return "";
    }

    renderControls();
    renderLegend();
    loadCase(0);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})(typeof window !== "undefined" ? window : globalThis);
