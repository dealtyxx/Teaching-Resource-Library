/* =====================================================================
 * 5.6 命题演算推证 —— 三层统一交互引擎（推理规则步进器）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与本章其它小节同形）：选择推证 → 逐步演证
 *   点一步推出一行 → 看反馈（用了什么规则、引用了哪些前提行）
 *   → 看推证记录中当前行高亮、被引用行高亮 → 看推理图节点 / 依赖边高亮
 *   → 抵达结论行即证毕 QED。完成后可点任意行 / 图节点回看依赖。
 *
 * 难度梯度：
 *   基础层：有效推理，MP / MT 短证明（3~5 行）。
 *   进阶层：MP/MT/HS/DS + 反证(归谬) + 附加前提 CP（5~7 行）。
 *   拓展层：自动定理证明——归结法(resolution)、Hoare 逻辑程序验证（5~7 行）。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* 每个推证：lines[] 顺序排列；前提行 refs:[]；派生行 refs 为所引用行的 0 基下标 */
  var LEVELS = {
    basic: {
      introStatus: "选择一个推证，点「下一步」逐行推演：每一行要么是前提，要么由规则从前面的行推出。看清『有据可依』。",
      legend: [
        ["MP", "A→B, A ⇒ B（假言推理）"],
        ["MT", "A→B, ¬B ⇒ ¬A（拒取式）"],
        ["前提", "P 规则 · 引入前提"],
        ["⊢", "由前提推出结论"],
        ["有效", "前提真则结论必真"]
      ],
      cases: [
        { label: "P→Q, P ⊢ Q（MP）", goal: "Q", goalDesc: "由蕴含与前件，推出后件。",
          lines: [
            { f: "P → Q", rule: "前提", refs: [], note: "引入前提：若 P 则 Q。" },
            { f: "P", rule: "前提", refs: [], note: "引入前提：P 成立。" },
            { f: "Q", rule: "MP", refs: [0, 1], note: "假言推理：由『P→Q』与『P』，得 Q。" }
          ] },
        { label: "P→Q, ¬Q ⊢ ¬P（MT）", goal: "¬P", goalDesc: "否定后件，推出否定前件。",
          lines: [
            { f: "P → Q", rule: "前提", refs: [], note: "引入前提。" },
            { f: "¬Q", rule: "前提", refs: [], note: "引入前提：Q 不成立。" },
            { f: "¬P", rule: "MT", refs: [0, 1], note: "拒取式：后件假则前件假，得 ¬P。" }
          ] },
        { label: "P→Q, Q→R, P ⊢ R（MP×2）", goal: "R", goalDesc: "沿蕴含链一步步推进。",
          lines: [
            { f: "P → Q", rule: "前提", refs: [], note: "引入前提。" },
            { f: "Q → R", rule: "前提", refs: [], note: "引入前提。" },
            { f: "P", rule: "前提", refs: [], note: "引入前提。" },
            { f: "Q", rule: "MP", refs: [0, 2], note: "由『P→Q』与『P』得 Q。" },
            { f: "R", rule: "MP", refs: [1, 3], note: "再由『Q→R』与『Q』得 R。" }
          ] }
      ]
    },
    advanced: {
      introStatus: "选择一个推证，逐行演证：综合运用 MP/MT/HS/DS、反证与附加前提 CP，搭建严密的证明链。",
      legend: [
        ["MP", "A→B, A ⇒ B"], ["MT", "A→B, ¬B ⇒ ¬A"],
        ["HS", "A→B, B→C ⇒ A→C"], ["DS", "A∨B, ¬A ⇒ B"],
        ["CP", "附加前提 ⇒ 蕴含式"], ["反证", "归谬 · 假设导出矛盾"], ["⊢", "推出"]
      ],
      cases: [
        { label: "P∨Q, ¬P, Q→R ⊢ R（DS+MP）", goal: "R", goalDesc: "先用析取三段论，再用假言推理。",
          lines: [
            { f: "P ∨ Q", rule: "前提", refs: [], note: "引入前提。" },
            { f: "¬P", rule: "前提", refs: [], note: "引入前提。" },
            { f: "Q → R", rule: "前提", refs: [], note: "引入前提。" },
            { f: "Q", rule: "DS", refs: [0, 1], note: "析取三段论：P∨Q 且 ¬P，得 Q。" },
            { f: "R", rule: "MP", refs: [2, 3], note: "假言推理：Q→R 且 Q，得 R。" }
          ] },
        { label: "P→Q, Q→R, R→S, P ⊢ S（HS+MP）", goal: "S", goalDesc: "用假言三段论压缩蕴含链。",
          lines: [
            { f: "P → Q", rule: "前提", refs: [], note: "引入前提。" },
            { f: "Q → R", rule: "前提", refs: [], note: "引入前提。" },
            { f: "R → S", rule: "前提", refs: [], note: "引入前提。" },
            { f: "P", rule: "前提", refs: [], note: "引入前提。" },
            { f: "P → R", rule: "HS", refs: [0, 1], note: "假言三段论：P→Q, Q→R 得 P→R。" },
            { f: "P → S", rule: "HS", refs: [4, 2], note: "再与 R→S 得 P→S。" },
            { f: "S", rule: "MP", refs: [5, 3], note: "由 P→S 与 P，得 S。" }
          ] },
        { label: "P→Q, P→¬Q ⊢ ¬P（反证）", goal: "¬P", goalDesc: "假设 P，导出矛盾，故 ¬P。",
          lines: [
            { f: "P → Q", rule: "前提", refs: [], note: "引入前提。" },
            { f: "P → ¬Q", rule: "前提", refs: [], note: "引入前提。" },
            { f: "P", rule: "假设(反证)", refs: [], note: "归谬法：先假设结论之反 P 成立。" },
            { f: "Q", rule: "MP", refs: [0, 2], note: "由 P→Q 与 P 得 Q。" },
            { f: "¬Q", rule: "MP", refs: [1, 2], note: "由 P→¬Q 与 P 得 ¬Q。" },
            { f: "Q ∧ ¬Q", rule: "合取(矛盾)", refs: [3, 4], note: "Q 与 ¬Q 同时成立——矛盾！" },
            { f: "¬P", rule: "反证", refs: [2, 5], note: "假设 P 导出矛盾，故 P 不成立，得 ¬P。" }
          ] },
        { label: "P→Q, Q→R ⊢ P→R（CP）", goal: "P → R", goalDesc: "用附加前提法证明蕴含式。",
          lines: [
            { f: "P → Q", rule: "前提", refs: [], note: "引入前提。" },
            { f: "Q → R", rule: "前提", refs: [], note: "引入前提。" },
            { f: "P", rule: "附加前提(CP)", refs: [], note: "CP 规则：为证 P→R，临时假设前件 P。" },
            { f: "Q", rule: "MP", refs: [0, 2], note: "由 P→Q 与 P 得 Q。" },
            { f: "R", rule: "MP", refs: [1, 3], note: "由 Q→R 与 Q 得 R。" },
            { f: "P → R", rule: "CP", refs: [2, 4], note: "由假设 P 推出 R，故 P→R 成立（撤销假设）。" }
          ] }
      ]
    },
    extend: {
      introStatus: "选择一个机械推理任务，逐步执行：归结法消去互补文字得空子句，或 Hoare 逻辑逐条验证程序断言。",
      legend: [
        ["归结", "互补文字消去得 resolvent"],
        ["□", "空子句 · 矛盾 ⇒ 原结论成立"],
        ["子句", "CNF clause（前提化）"],
        ["¬结论", "反证：先否定待证结论"],
        ["Hoare", "{P} S {Q} 程序验证"],
        ["wp", "最弱前置条件"]
      ],
      cases: [
        { label: "归结法证 P→Q, P ⊢ Q", goal: "Q", goalDesc: "否定结论得 ¬Q，归结出空子句□，反证 Q。",
          lines: [
            { f: "{¬P, Q}", rule: "子句", refs: [], note: "前提 P→Q 化为子句 ¬P∨Q。" },
            { f: "{P}", rule: "子句", refs: [], note: "前提 P 化为子句。" },
            { f: "{¬Q}", rule: "¬结论", refs: [], note: "反证：否定待证结论 Q。" },
            { f: "{Q}", rule: "归结", refs: [0, 1], note: "{¬P,Q} 与 {P} 消去互补文字 P/¬P，得 {Q}。" },
            { f: "□（空子句）", rule: "归结", refs: [2, 3], note: "{¬Q} 与 {Q} 归结得空子句——矛盾，故原结论 Q 成立。" }
          ] },
        { label: "归结法证 P∨Q, ¬P, Q→R ⊢ R", goal: "R", goalDesc: "多子句归结，导出空子句□。",
          lines: [
            { f: "{P, Q}", rule: "子句", refs: [], note: "前提 P∨Q。" },
            { f: "{¬P}", rule: "子句", refs: [], note: "前提 ¬P。" },
            { f: "{¬Q, R}", rule: "子句", refs: [], note: "前提 Q→R 化为 ¬Q∨R。" },
            { f: "{¬R}", rule: "¬结论", refs: [], note: "反证：否定结论 R。" },
            { f: "{Q}", rule: "归结", refs: [0, 1], note: "{P,Q} 与 {¬P} 消去 P，得 {Q}。" },
            { f: "{R}", rule: "归结", refs: [2, 4], note: "{¬Q,R} 与 {Q} 消去 Q，得 {R}。" },
            { f: "□（空子句）", rule: "归结", refs: [3, 5], note: "{¬R} 与 {R} 归结得空子句——证毕，R 成立。" }
          ] },
        { label: "Hoare 逻辑验证 {x≥0} y:=x+1 {y≥1}", goal: "{y ≥ 1}", goalDesc: "由赋值公理与验证条件，证明程序满足规约。",
          lines: [
            { f: "{ x ≥ 0 }", rule: "前置条件", refs: [], note: "程序执行前的断言（规约前件）。" },
            { f: "y := x + 1", rule: "程序语句", refs: [], note: "待验证的赋值语句。" },
            { f: "{ y = x + 1 }", rule: "赋值公理", refs: [0, 1], note: "赋值公理：执行后 y 的值由 x 决定。" },
            { f: "x ≥ 0 → x + 1 ≥ 1", rule: "验证条件", refs: [0], note: "算术蕴含：前置条件保证 x+1≥1。" },
            { f: "{ y ≥ 1 }", rule: "蕴含弱化", refs: [2, 3], note: "由 y=x+1 与 x+1≥1 弱化得后置条件，程序正确。" }
          ] }
      ]
    }
  };

  function computeCase(c) {
    var lines = c.lines.map(function (ln, i) {
      return {
        i: i, f: ln.f, rule: ln.rule, refs: ln.refs || [], note: ln.note || "",
        isPrem: (ln.refs || []).length === 0,
        isFinal: i === c.lines.length - 1,
        isContra: /□|矛盾/.test(ln.f)
      };
    });
    return { goal: c.goal, goalDesc: c.goalDesc, premises: lines.filter(function (l) { return l.isPrem; }), lines: lines };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { LEVELS: LEVELS, computeCase: computeCase };
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
  function refStr(refs) { return refs.map(function (r) { return r + 1; }).join(","); }

  function run() {
    var levelKey = global.SYMBOLIZE_LEVEL || "basic";
    var cfg = LEVELS[levelKey] || LEVELS.basic;

    var controlsEl = byId("controls");
    var goalEl = byId("ipGoal");
    var tableEl = byId("ipTable");
    var evalEl = byId("ipEval");
    var graphEl = byId("ipGraph");
    if (!controlsEl || !tableEl) return;

    var pr = null;
    var p = 0, manualFocus = null, autoTimer = null;
    var rowEls = [], nodeEls = [], arcEls = [];
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.cases.map(function (c, i) { return '<option value="' + i + '">' + esc(c.label) + '</option>'; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label><span>选择推证</span><small>前提 ⊢ 结论</small></label>' +
          '<select id="ipSelect">' + opts + '</select></div>' +
        '<div class="control-group"><label><span>逐步演证</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button class="sym-step-btn" id="ipPrev">◀ 上一步</button>' +
            '<button class="sym-step-btn sym-primary" id="ipNext">下一步 ▶</button>' +
            '<button class="sym-step-btn" id="ipAuto">⏵ 自动播放</button>' +
            '<button class="sym-step-btn" id="ipReset">↺ 重置</button>' +
          '</div></div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="ipProgBar"></i></div>' +
          '<span class="sym-progress-num" id="ipProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="ipStatus"></div></div>';
      statusEl = byId("ipStatus"); progBar = byId("ipProgBar"); progNum = byId("ipProgNum");
      prevBtn = byId("ipPrev"); nextBtn = byId("ipNext"); autoBtn = byId("ipAuto");
      byId("ipSelect").addEventListener("change", function (e) { loadCase(+e.target.value); });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("ipReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
    }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      box.innerHTML = '<div class="legend-title">推理规则速查</div><div class="legend-grid">' +
        cfg.legend.map(function (it) { return '<div class="legend-item"><span class="sym">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + '</span></div>'; }).join("") + '</div>';
    }

    function loadCase(idx) {
      stopAuto();
      pr = computeCase(cfg.cases[idx]);
      p = 0; manualFocus = null;
      renderGoal(); renderTable(); renderGraph();
      evalEl.innerHTML = "";
      render();
    }

    function renderGoal() {
      var prem = pr.premises.map(function (l) { return "<code>" + esc(l.f) + "</code>"; }).join("，");
      goalEl.innerHTML = '<div class="g-premises"><b>前提：</b>' + prem + '　<b>⊢</b></div>' +
        '<div class="g-goal">' + esc(pr.goal) + '</div>' +
        '<div class="g-desc">' + esc(pr.goalDesc) + '</div>';
    }

    function renderTable() {
      var body = pr.lines.map(function (l, i) {
        var reason = l.isPrem ? '<span class="r-rule">' + esc(l.rule) + '</span>' :
          '<span class="r-rule">' + esc(l.rule) + '</span> <span class="r-refs">(' + refStr(l.refs) + ')</span>';
        return '<tr class="ip-row' + (l.isPrem ? " is-prem" : "") + (l.isFinal ? " is-final" : "") + '" data-row="' + i + '">' +
          '<td class="c-no">' + (i + 1) + '</td><td class="c-f">' + esc(l.f) + '</td><td class="c-r">' + reason + '</td></tr>';
      }).join("");
      tableEl.innerHTML = '<table class="ip-table"><thead><tr><th>步</th><th>命题公式</th><th>依据（引用行）</th></tr></thead><tbody>' + body + '</tbody></table>';
      rowEls = Array.prototype.slice.call(tableEl.querySelectorAll("tr.ip-row"));
      rowEls.forEach(function (tr, i) { tr.addEventListener("click", function () { clickRow(i); }); });
    }

    function renderGraph() {
      graphEl.innerHTML = "";
      var n = pr.lines.length, VW = 760, pad = 12, rowH = 50, nodeW = 360, nodeH = 36;
      var cx = VW * 0.42, leftArc = cx - nodeW / 2;
      var H = pad * 2 + n * rowH;
      var svg = svgEl("svg", { id: "ipGraph", viewBox: "0 0 " + VW + " " + H, width: "100%", height: H });
      var g = svgEl("g"); svg.appendChild(g);
      function yOf(i) { return pad + i * rowH + nodeH / 2; }

      // 依赖弧（从被引用行 → 当前行，画在右侧）
      arcEls = [];
      pr.lines.forEach(function (l, i) {
        l.refs.forEach(function (r) {
          var x = cx + nodeW / 2, y1 = yOf(r), y2 = yOf(i);
          var bulge = 30 + Math.min(70, (i - r) * 12);
          var path = svgEl("path", { d: "M " + x + " " + y1 + " C " + (x + bulge) + " " + y1 + " " + (x + bulge) + " " + y2 + " " + x + " " + y2,
            stroke: "#2f5f9f", "stroke-width": 1.8, fill: "none" });
          path.setAttribute("class", "ip-arc"); path.dataset.to = i;
          g.appendChild(path);
          arcEls.push({ el: path, to: i, from: r });
        });
      });

      // 节点
      nodeEls = pr.lines.map(function (l, i) {
        var y = pad + i * rowH;
        var fill = l.isContra ? "#f6d3ce" : l.isFinal ? "#cdebd9" : l.isPrem ? "#dbe6f3" : "#fdeccd";
        var stroke = l.isContra ? "#d63b1d" : l.isFinal ? "#2f7d57" : l.isPrem ? "#2f5f9f" : "#c58a1f";
        var ng = svgEl("g"); ng.setAttribute("class", "ip-node"); ng.dataset.row = i;
        var rect = svgEl("rect", { x: leftArc, y: y, width: nodeW, height: nodeH, rx: 8, fill: fill, stroke: stroke, "stroke-width": 1.6 });
        var num = svgEl("text", { x: leftArc + 16, y: y + nodeH / 2, "text-anchor": "middle", "dominant-baseline": "central", fill: "#6b4a38", "font-size": 12, "font-weight": "800", "font-family": "JetBrains Mono, monospace" }); num.textContent = (i + 1);
        var tf = svgEl("text", { x: leftArc + 34, y: y + nodeH / 2, "dominant-baseline": "central", fill: "#2c1810", "font-size": 13, "font-weight": "700", "font-family": "JetBrains Mono, monospace" }); tf.textContent = l.f;
        var tr = svgEl("text", { x: leftArc + nodeW - 10, y: y + nodeH / 2, "text-anchor": "end", "dominant-baseline": "central", fill: stroke, "font-size": 11, "font-weight": "800" }); tr.textContent = l.rule;
        ng.appendChild(rect); ng.appendChild(num); ng.appendChild(tf); ng.appendChild(tr);
        ng.addEventListener("click", function () { clickRow(i); });
        g.appendChild(ng);
        return { g: ng, rect: rect };
      });
      graphEl.appendChild(svg);
    }

    function total() { return pr.lines.length; }
    function step(dir) { manualFocus = null; p = Math.max(0, Math.min(total(), p + dir)); render(); }
    function clickRow(i) {
      stopAuto();
      var L = pr.lines.length;
      if (p < L) { p = i + 1; manualFocus = null; }
      else { manualFocus = (manualFocus === i ? null : i); }
      render();
    }
    function toggleAuto() {
      if (autoTimer) { stopAuto(); return; }
      if (p >= total()) { p = 0; manualFocus = null; render(); }
      autoBtn.classList.add("sym-playing"); autoBtn.textContent = "⏸ 暂停";
      autoTimer = setInterval(function () { if (p >= total()) { stopAuto(); return; } manualFocus = null; p += 1; render(); }, 1050);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } if (autoBtn) { autoBtn.classList.remove("sym-playing"); autoBtn.textContent = "⏵ 自动播放"; } }

    function render() {
      var L = pr.lines.length;
      var linesShown = p;
      var done = p >= L;
      var stepLine = (p >= 1 && p <= L) ? p - 1 : null;
      var focusLine = (manualFocus != null) ? manualFocus : stepLine;
      var citedSet = {};
      if (focusLine != null) pr.lines[focusLine].refs.forEach(function (r) { citedSet[r] = true; });

      for (var k = 0; k < L; k++) {
        var revealed = k < linesShown;
        var isCur = (k === focusLine);
        var isCited = !!citedSet[k] && revealed;
        if (rowEls[k]) {
          rowEls[k].classList.toggle("sym-pending", !revealed);
          rowEls[k].classList.toggle("sym-cur", isCur);
          rowEls[k].classList.toggle("is-cited", isCited && !isCur);
        }
        if (nodeEls[k]) {
          nodeEls[k].g.classList.toggle("sym-pending", !revealed);
          nodeEls[k].g.classList.toggle("sym-cur", isCur);
          nodeEls[k].g.classList.toggle("is-cited", isCited && !isCur);
        }
      }
      arcEls.forEach(function (a) {
        a.el.classList.toggle("is-active", focusLine != null && a.to === focusLine);
        a.el.style.opacity = (a.to < linesShown) ? "" : "0";
      });

      evalEl.innerHTML = evalHTML(focusLine, done);
      progNum.textContent = p + " / " + L;
      progBar.style.width = (L ? (p / L * 100) : 0) + "%";
      prevBtn.disabled = (p <= 0 && manualFocus == null);
      nextBtn.disabled = (p >= L);
      statusEl.innerHTML = statusHTML(p, focusLine, done);
    }

    function evalHTML(focusLine, done) {
      if (focusLine == null) return '<span style="color:#6b4a38">点「下一步」逐行推演。前提行直接引入；派生行由推理规则从已得的行推出。</span>';
      var l = pr.lines[focusLine];
      var head = '<div>第 <b>' + (focusLine + 1) + '</b> 行：<span class="ev-f">' + esc(l.f) + '</span></div>';
      var body;
      if (l.isPrem) body = '<div style="margin-top:4px"><span class="ev-rule">' + esc(l.rule) + '</span>：' + esc(l.note) + '</div>';
      else body = '<div style="margin-top:4px">规则 <span class="ev-rule">' + esc(l.rule) + '</span>，引用第 <span class="ev-ref">' + refStr(l.refs) + '</span> 行：' + esc(l.note) + '</div>';
      if (done && l.isFinal) body += '<div style="margin-top:6px;color:#1d6b43;font-weight:800">✅ 抵达结论 ' + esc(pr.goal) + '，证毕（QED）。</div>';
      return head + body;
    }

    function statusHTML(pp, focusLine, done) {
      if (pp === 0) return cfg.introStatus + (pr.goalDesc ? '<br><b>目标：</b>' + esc(pr.goal) + ' —— ' + esc(pr.goalDesc) : "");
      if (focusLine != null) {
        var l = pr.lines[focusLine];
        var via = l.isPrem ? '（' + esc(l.rule) + '）' : '（' + esc(l.rule) + ' · 引用 ' + refStr(l.refs) + '）';
        var msg = '第 <b>' + (focusLine + 1) + '</b> 行：<b>' + esc(l.f) + '</b> ' + via + '。';
        if (done && l.isFinal) msg = '✅ <b>证毕</b>：已推出结论 ' + esc(pr.goal) + '。可点任意行回看依赖。';
        return msg;
      }
      return "";
    }

    renderControls();
    renderLegend();
    loadCase(0);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})(typeof window !== "undefined" ? window : globalThis);
