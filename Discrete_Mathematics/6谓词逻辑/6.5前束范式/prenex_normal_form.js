/* =====================================================================
 * 6.5 前束范式 —— 三层统一交互引擎（前束范式流水线）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与本章其它小节同形）：选择公式 → 逐步转换
 *   点一步执行一次等值改写（消蕴含 / 否定深入 / 改名 / 量词外提 / Skolem 化）
 *   → 看反馈（用了什么规则）→ 看转换记录当前行高亮
 *   → 看前束结构图：量词前缀区与母式区随步骤变化（量词逐步迁入前缀）。
 *   完成后可点任意步回看。
 *
 * 难度梯度：
 *   基础层：认识前束形式（量词前缀 + 无量词母式），1~2 步短转换。
 *   进阶层：完整流程 消蕴含→否定深入→改名→外提（3~5 步，含变元改名）。
 *   拓展层：PNF → Skolem 化 → 子句形，迁移到归结定理证明预处理。
 * ===================================================================== */
(function (global) {
  "use strict";

  var LEVELS = {
    basic: {
      introStatus: "选择一个公式，点「下一步」执行等值改写：看量词如何逐步迁到最前，最终得到『量词前缀 + 无量词母式』的前束形式。",
      legend: [
        ["前束范式", "量词全在最前 + 无量词母式"],
        ["量词前缀", "Q1x1 … Qnxn"],
        ["母式", "不含量词的部分"],
        ["¬∀=∃¬", "量词否定（否定深入）"],
        ["外提", "把量词提到最前"]
      ],
      cases: [
        { label: "∀x¬∀yR(x,y)", goal: "∀x∃y · ¬R(x,y)",
          steps: [
            { f: "∀x ¬∀y R(x,y)", rule: "原式", note: "∀x 之后还有 ¬∀y，量词未集中到最前。", prefix: ["∀x"], matrix: "¬∀y R(x,y)" },
            { f: "∀x ∃y ¬R(x,y)", rule: "量词否定", note: "¬∀y ⇔ ∃y¬：否定深入到 R，∃y 进入前缀。", prefix: ["∀x", "∃y"], matrix: "¬R(x,y)" }
          ] },
        { label: "∀xP(x) ∧ ∃yQ(y)", goal: "∀x∃y · (P(x)∧Q(y))",
          steps: [
            { f: "∀x P(x) ∧ ∃y Q(y)", rule: "原式", note: "两个量词分别在合取两侧，未在最前。", prefix: [], matrix: "∀x P(x) ∧ ∃y Q(y)" },
            { f: "∀x ∃y ( P(x) ∧ Q(y) )", rule: "量词外提", note: "x、y 是不同变元，可把 ∀x、∃y 提到最前。", prefix: ["∀x", "∃y"], matrix: "P(x) ∧ Q(y)" }
          ] },
        { label: "∃x(P(x) → Q(x))  已是前束", goal: "∃x · (P(x)→Q(x))",
          steps: [
            { f: "∃x ( P(x) → Q(x) )", rule: "原式 / 已是前束", note: "前缀 ∃x，母式 P(x)→Q(x) 不含量词——本就是前束范式。", prefix: ["∃x"], matrix: "P(x) → Q(x)" }
          ] }
      ]
    },
    advanced: {
      introStatus: "选择一个公式，逐步执行 消蕴含 → 否定深入 → 变元改名 → 量词外提，得到等价的前束范式。",
      legend: [
        ["消蕴含", "A→B ⇔ ¬A∨B"],
        ["否定深入", "¬∀=∃¬, ¬∃=∀¬"],
        ["变元改名", "避免量词外提时约束捕获"],
        ["量词外提", "把量词提到最前"],
        ["前束范式", "量词前缀 + 无量词母式"], ["⇔", "等价转换"]
      ],
      cases: [
        { label: "∀x(P(x) → ∃yQ(x,y))", goal: "∀x∃y · (¬P(x)∨Q(x,y))",
          steps: [
            { f: "∀x ( P(x) → ∃y Q(x,y) )", rule: "原式", note: "∃y 还埋在 → 内。", prefix: ["∀x"], matrix: "P(x) → ∃y Q(x,y)" },
            { f: "∀x ( ¬P(x) ∨ ∃y Q(x,y) )", rule: "消蕴含", note: "A→B ⇔ ¬A∨B。", prefix: ["∀x"], matrix: "¬P(x) ∨ ∃y Q(x,y)" },
            { f: "∀x ∃y ( ¬P(x) ∨ Q(x,y) )", rule: "量词外提", note: "y 不在 ¬P(x) 中自由，∃y 可提到前缀。", prefix: ["∀x", "∃y"], matrix: "¬P(x) ∨ Q(x,y)" }
          ] },
        { label: "¬∃x∀yR(x,y)", goal: "∀x∃y · ¬R(x,y)",
          steps: [
            { f: "¬∃x ∀y R(x,y)", rule: "原式", note: "否定在最外层。", prefix: [], matrix: "¬∃x ∀y R(x,y)" },
            { f: "∀x ¬∀y R(x,y)", rule: "否定深入", note: "¬∃x ⇔ ∀x¬。", prefix: ["∀x"], matrix: "¬∀y R(x,y)" },
            { f: "∀x ∃y ¬R(x,y)", rule: "否定深入", note: "¬∀y ⇔ ∃y¬。", prefix: ["∀x", "∃y"], matrix: "¬R(x,y)" }
          ] },
        { label: "∀xP(x) → ∀xQ(x)  ⚠需改名", goal: "∃x∀z · (¬P(x)∨Q(z))",
          steps: [
            { f: "∀x P(x) → ∀x Q(x)", rule: "原式", note: "两处都用变元 x，直接外提会发生约束捕获！", prefix: [], matrix: "∀x P(x) → ∀x Q(x)" },
            { f: "¬∀x P(x) ∨ ∀x Q(x)", rule: "消蕴含", note: "A→B ⇔ ¬A∨B。", prefix: [], matrix: "¬∀x P(x) ∨ ∀x Q(x)" },
            { f: "∃x ¬P(x) ∨ ∀x Q(x)", rule: "否定深入", note: "¬∀x ⇔ ∃x¬。", prefix: [], matrix: "∃x ¬P(x) ∨ ∀x Q(x)" },
            { f: "∃x ¬P(x) ∨ ∀z Q(z)", rule: "变元改名", note: "把后一个 x 改名为 z，避免外提时把两个 x 混为一谈。", prefix: [], matrix: "∃x ¬P(x) ∨ ∀z Q(z)" },
            { f: "∃x ∀z ( ¬P(x) ∨ Q(z) )", rule: "量词外提", note: "改名后量词互不干扰，提到最前。", prefix: ["∃x", "∀z"], matrix: "¬P(x) ∨ Q(z)" }
          ] }
      ]
    },
    extend: {
      introStatus: "选择一个公式，先化前束范式，再 Skolem 化消去存在量词、去全称前缀得子句形——这是归结定理证明的标准预处理。",
      legend: [
        ["前束范式", "量词前缀 + 母式"],
        ["Skolem化", "∃ 用函数/常量替换"],
        ["Skolem函数", "f(x)：依赖前面的全称变元"],
        ["Skolem常量", "c：不在任何 ∀ 辖域内"],
        ["子句形", "去全称前缀的 CNF"], ["归结", "自动证明"]
      ],
      cases: [
        { label: "∀x∃yP(x,y)  →  Skolem", goal: "子句 P(x, f(x))",
          steps: [
            { f: "∀x ∃y P(x,y)", rule: "前束范式", note: "已是前束，准备 Skolem 化。", prefix: ["∀x", "∃y"], matrix: "P(x,y)" },
            { f: "∀x P(x, f(x))", rule: "Skolem化", note: "∃y 在 ∀x 辖域内 → 用 Skolem 函数 y = f(x)。", prefix: ["∀x"], matrix: "P(x, f(x))" },
            { f: "P(x, f(x))", rule: "去全称 · 子句", note: "去掉全称前缀（隐含全称），得子句，可用于归结。", prefix: [], matrix: "P(x, f(x))" }
          ] },
        { label: "∃x∀yP(x,y)  →  Skolem", goal: "子句 P(c, y)",
          steps: [
            { f: "∃x ∀y P(x,y)", rule: "前束范式", note: "准备 Skolem 化。", prefix: ["∃x", "∀y"], matrix: "P(x,y)" },
            { f: "∀y P(c, y)", rule: "Skolem化", note: "∃x 不在任何 ∀ 辖域内 → 用 Skolem 常量 c。", prefix: ["∀y"], matrix: "P(c, y)" },
            { f: "P(c, y)", rule: "去全称 · 子句", note: "得子句形。", prefix: [], matrix: "P(c, y)" }
          ] },
        { label: "∀x(P(x)→∃yQ(x,y))  →  子句", goal: "子句 ¬P(x)∨Q(x,f(x))",
          steps: [
            { f: "∀x ( P(x) → ∃y Q(x,y) )", rule: "原式", note: "待前束化与 Skolem 化。", prefix: ["∀x"], matrix: "P(x) → ∃y Q(x,y)" },
            { f: "∀x ∃y ( ¬P(x) ∨ Q(x,y) )", rule: "前束范式", note: "消蕴含 + 外提得 PNF。", prefix: ["∀x", "∃y"], matrix: "¬P(x) ∨ Q(x,y)" },
            { f: "∀x ( ¬P(x) ∨ Q(x, f(x)) )", rule: "Skolem化", note: "∃y → f(x)（依赖 ∀x）。", prefix: ["∀x"], matrix: "¬P(x) ∨ Q(x, f(x))" },
            { f: "¬P(x) ∨ Q(x, f(x))", rule: "子句形 (CNF)", note: "去全称前缀，得归结所需的子句。", prefix: [], matrix: "¬P(x) ∨ Q(x, f(x))" }
          ] }
      ]
    }
  };

  function computeCase(c) {
    var steps = c.steps.map(function (s, i) {
      var prev = i > 0 ? c.steps[i - 1].prefix : [];
      var added = (s.prefix || []).filter(function (q) { return prev.indexOf(q) < 0; });
      return { i: i, f: s.f, rule: s.rule, note: s.note, prefix: s.prefix || [], matrix: s.matrix, added: added,
        isLast: i === c.steps.length - 1, isPNF: (s.matrix && !/[∀∃]/.test(s.matrix)) };
    });
    return { goal: c.goal, steps: steps, start: c.steps[0].f };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { LEVELS: LEVELS, computeCase: computeCase };
  }

  /* ====================== 以下仅浏览器运行 ====================== */
  if (typeof document === "undefined") return;

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function byId(id) { return document.getElementById(id); }

  function run() {
    var levelKey = global.SYMBOLIZE_LEVEL || "basic";
    var cfg = LEVELS[levelKey] || LEVELS.basic;

    var controlsEl = byId("controls");
    var goalEl = byId("pnGoal");
    var stepsEl = byId("pnSteps");
    var evalEl = byId("pnEval");
    var structEl = byId("pnStruct");
    if (!controlsEl || !goalEl) return;

    var cc = null;
    var p = 0, manualFocus = null, autoTimer = null;
    var rowEls = [];
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.cases.map(function (c, i) { return '<option value="' + i + '">' + esc(c.label) + '</option>'; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label><span>选择公式</span><small>待转换</small></label>' +
          '<select id="pnSelect">' + opts + '</select></div>' +
        '<div class="control-group"><label><span>逐步转换</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button class="sym-step-btn" id="pnPrev">◀ 上一步</button>' +
            '<button class="sym-step-btn sym-primary" id="pnNext">下一步 ▶</button>' +
            '<button class="sym-step-btn" id="pnAuto">⏵ 自动播放</button>' +
            '<button class="sym-step-btn" id="pnReset">↺ 重置</button>' +
          '</div></div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="pnProgBar"></i></div>' +
          '<span class="sym-progress-num" id="pnProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="pnStatus"></div></div>';
      statusEl = byId("pnStatus"); progBar = byId("pnProgBar"); progNum = byId("pnProgNum");
      prevBtn = byId("pnPrev"); nextBtn = byId("pnNext"); autoBtn = byId("pnAuto");
      byId("pnSelect").addEventListener("change", function (e) { loadCase(+e.target.value); });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("pnReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
    }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      box.innerHTML = '<div class="legend-title">前束范式说明</div><div class="legend-grid">' +
        cfg.legend.map(function (it) { return '<div class="legend-item"><span class="sym">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + '</span></div>'; }).join("") + '</div>';
    }

    function loadCase(idx) {
      stopAuto();
      cc = computeCase(cfg.cases[idx]);
      p = 0; manualFocus = null;
      renderGoal(); renderSteps();
      evalEl.innerHTML = "";
      render();
    }

    function renderGoal() {
      goalEl.innerHTML = '<div class="pg-f">' + esc(cc.start) + '</div>' +
        '<div class="pg-meta"><b>目标：</b>化为等价的<b>前束范式</b>（量词全部前缀 + 无量词母式）　·　' + cc.steps.length + ' 步　·　' + esc(cc.goal) + '</div>';
    }

    function renderSteps() {
      var body = cc.steps.map(function (s, i) {
        return '<tr class="pn-row' + (s.isLast ? " is-last" : "") + '" data-row="' + i + '">' +
          '<td class="c-no">' + (i + 1) + '</td><td class="c-f">' + esc(s.f) + '</td><td class="c-r"><span class="r-rule">' + esc(s.rule) + '</span></td></tr>';
      }).join("");
      stepsEl.innerHTML = '<table class="pn-steps"><thead><tr><th>步</th><th>公式</th><th>规则</th></tr></thead><tbody>' + body + '</tbody></table>';
      rowEls = Array.prototype.slice.call(stepsEl.querySelectorAll("tr.pn-row"));
      rowEls.forEach(function (tr, i) { tr.addEventListener("click", function () { clickRow(i); }); });
    }

    function renderStruct(focusStep) {
      var s = (focusStep != null) ? cc.steps[focusStep] : null;
      if (!s) {
        structEl.innerHTML = '<div class="pn-struct"><div class="pn-zone z-prefix"><span class="z-label">量词前缀</span><div class="pn-prefix-chips"><span class="pn-prefix-empty">尚未开始</span></div></div><span class="pn-arrow">▸</span><div class="pn-zone z-matrix"><span class="z-label">母式</span><div class="pn-matrix-body">—</div></div></div>';
        return;
      }
      var chips = s.prefix.length
        ? s.prefix.map(function (q) { return '<span class="pn-qchip' + (s.added.indexOf(q) >= 0 ? " q-new" : "") + '">' + esc(q) + '</span>'; }).join("")
        : '<span class="pn-prefix-empty">（暂无量词在前缀）</span>';
      var done = s.isLast && s.isPNF;
      structEl.innerHTML =
        '<div class="pn-struct">' +
          '<div class="pn-zone z-prefix"><span class="z-label">量词前缀</span><div class="pn-prefix-chips">' + chips + '</div></div>' +
          '<span class="pn-arrow">▸</span>' +
          '<div class="pn-zone z-matrix"><span class="z-label">母式' + (/[∀∃]/.test(s.matrix) ? '（仍含量词）' : '（无量词）') + '</span><div class="pn-matrix-body">' + esc(s.matrix) + '</div></div>' +
        '</div>' +
        '<div class="pn-struct-note' + (done ? " is-pnf" : "") + '">' +
          (done ? '✅ 已得前束范式：所有量词在前缀，母式不含量词。' :
            (/[∀∃]/.test(s.matrix) ? '母式中仍有量词，需继续否定深入 / 外提。' : '母式已无量词，继续把前缀补齐即成前束范式。')) +
        '</div>';
    }

    function total() { return cc.steps.length; }
    function step(dir) { manualFocus = null; p = Math.max(0, Math.min(total(), p + dir)); render(); }
    function clickRow(i) {
      stopAuto();
      var L = cc.steps.length;
      if (p < L) { p = i + 1; manualFocus = null; }
      else { manualFocus = (manualFocus === i ? null : i); }
      render();
    }
    function toggleAuto() {
      if (autoTimer) { stopAuto(); return; }
      if (p >= total()) { p = 0; manualFocus = null; render(); }
      autoBtn.classList.add("sym-playing"); autoBtn.textContent = "⏸ 暂停";
      autoTimer = setInterval(function () { if (p >= total()) { stopAuto(); return; } manualFocus = null; p += 1; render(); }, 1100);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } if (autoBtn) { autoBtn.classList.remove("sym-playing"); autoBtn.textContent = "⏵ 自动播放"; } }

    function render() {
      var L = cc.steps.length;
      var shown = p;
      var stepRow = (p >= 1 && p <= L) ? p - 1 : null;
      var focusRow = (manualFocus != null) ? manualFocus : stepRow;

      for (var k = 0; k < L; k++) {
        var revealed = k < shown;
        var isCur = (k === focusRow);
        if (rowEls[k]) { rowEls[k].classList.toggle("sym-pending", !revealed); rowEls[k].classList.toggle("sym-cur", isCur); }
      }
      renderStruct(focusRow);
      evalEl.innerHTML = evalHTML(focusRow, p >= L);
      progNum.textContent = p + " / " + L;
      progBar.style.width = (L ? (p / L * 100) : 0) + "%";
      prevBtn.disabled = (p <= 0 && manualFocus == null);
      nextBtn.disabled = (p >= L);
      statusEl.innerHTML = statusHTML(p, focusRow);
    }

    function evalHTML(focusRow, done) {
      if (focusRow == null) return '<span style="color:#6b4a38">点「下一步」逐步执行等值改写。每一步把量词向最前移动，或把否定深入到谓词。</span>';
      var s = cc.steps[focusRow];
      var head = '<div>第 <b>' + (focusRow + 1) + '</b> 步：<span class="ev-f">' + esc(s.f) + '</span></div>';
      var body = '<div style="margin-top:4px">规则 <span class="ev-rule">' + esc(s.rule) + '</span>：' + esc(s.note) + '</div>';
      if (done && s.isLast) body += '<div style="margin-top:6px;color:#1d6b43;font-weight:800">✅ 转换完成：' + esc(cc.goal) + '。</div>';
      return head + body;
    }

    function statusHTML(pp, focusRow) {
      if (pp === 0) return cfg.introStatus;
      if (focusRow != null) {
        var s = cc.steps[focusRow];
        var msg = '第 <b>' + (focusRow + 1) + '</b> 步（' + esc(s.rule) + '）：<b>' + esc(s.f) + '</b>。';
        if (pp >= total() && s.isLast) msg = '✅ <b>转换完成</b>：' + esc(cc.goal) + '。可点任意步回看。';
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
