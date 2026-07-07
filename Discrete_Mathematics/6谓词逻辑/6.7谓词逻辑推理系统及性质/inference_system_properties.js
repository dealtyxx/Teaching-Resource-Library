/* =====================================================================
 * 6.7 谓词逻辑推理系统及性质 —— 三层统一交互引擎（一阶系统性质仪表盘）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与本章其它小节同形）：选择系统 → 逐项判定命题样本
 *   点一步判定一个命题：是否『有效 ⊨』、是否『可证 ⊢』、枚举证明是否终止
 *   → 看分类反馈（定理 / 完备性缺口 / 可靠性破坏 / 正常排除）+ 半可判定提示
 *   → 看语义×语法维恩图高亮 → 给出元性质结论（可靠 / 完备 / 可判定）。
 *   完成后可点任意命题样本 / 维恩点回看。
 *
 * 难度梯度：
 *   基础层：一阶形式系统的构成（公理/规则），命题逻辑可判定 vs 一阶不可判定。
 *   进阶层：完备但不可判定——哥德尔完备性 vs 丘奇不可判定、半可判定；含算术则不完备。
 *   拓展层：证明助手 Lean/Coq 与 AI 推理的边界——半可判定即机械推理的极限。
 * ===================================================================== */
(function (global) {
  "use strict";

  function classify(f) {
    if (f.provable && f.valid) return "theorem";
    if (f.valid && !f.provable) return "gap";
    if (f.provable && !f.valid) return "unsound";
    return "excluded";
  }
  var KIND_LABEL = {
    theorem: "定理（可证且有效）", gap: "完备性缺口（有效却不可证）",
    unsound: "可靠性破坏（可证却无效）", excluded: "正常排除（不可证也无效）"
  };

  function computeCase(c) {
    var decidable = !!c.decidable;
    var fs = c.formulas.map(function (f, i) {
      return { i: i, f: f.f, valid: f.valid, provable: f.provable, note: f.note || "", kind: classify(f),
        search: (decidable || f.valid) ? "term" : "maybe" };
    });
    var sound = !fs.some(function (f) { return f.provable && !f.valid; });
    var complete = !fs.some(function (f) { return f.valid && !f.provable; });
    var key = (!sound) ? "bad" : (!complete ? "partial" : (!decidable ? "semidec" : "good"));
    var label = (sound ? "可靠✓" : "不可靠✗") + " · " + (complete ? "完备✓" : "不完备✗") + " · " + (decidable ? "可判定✓" : "不可判定✗");
    return { system: c.system, formulas: fs, sound: sound, complete: complete, decidable: decidable, key: key, label: label, reason: c.verdict || "", insight: c.insight || "" };
  }

  var LEVELS = {
    basic: {
      introStatus: "选择一个推理系统，逐项判定命题样本：是否有效 ⊨、是否可证 ⊢、枚举搜索是否终止，理解一阶系统的构成与可判定性。",
      legend: [
        ["公理 / 规则", "一阶系统：公理 + UI/EI/UG/EG + MP"],
        ["⊢ 可证", "系统能证出"], ["⊨ 有效", "在一切解释下为真（逻辑有效）"],
        ["可判定", "存在算法判定有效性"],
        ["不可判定", "一阶逻辑无通用判定算法"]
      ],
      cases: [
        { label: "命题逻辑系统（可判定）", decidable: true,
          system: "命题逻辑：公理 + MP，可用真值表机械判定任意公式是否有效。",
          verdict: "可证皆有效（可靠）、有效皆可证（完备），且有真值表算法可判定——可靠、完备、可判定。",
          insight: "命题逻辑只有有限种真值组合，真值表给出判定算法。",
          formulas: [
            { f: "A → A", valid: true, provable: true, note: "可证的定理。" },
            { f: "A ∨ ¬A", valid: true, provable: true, note: "排中律，可证定理。" },
            { f: "A → B", valid: false, provable: false, note: "非有效式，真值表可判定其非有效——正常排除。" }
          ] },
        { label: "一阶逻辑系统（不可判定）", decidable: false,
          system: "一阶逻辑：公理 + UI/EI/UG/EG + MP。哥德尔完备性定理：逻辑有效式都可证。",
          verdict: "可证皆有效（可靠）、有效皆可证（完备）；但有效性不可判定（丘奇定理）——可靠、完备、却不可判定。",
          insight: "一阶逻辑表达力远强于命题逻辑，代价是失去了通用判定算法。",
          formulas: [
            { f: "∀x P(x) → ∃x P(x)", valid: true, provable: true, note: "非空论域下可证的定理。" },
            { f: "∀x ( P(x) → P(x) )", valid: true, provable: true, note: "可证定理。" },
            { f: "P(a) → ∃x P(x)", valid: true, provable: true, note: "存在推广 EG，可证。" },
            { f: "∃x P(x) → ∀x P(x)", valid: false, provable: false, note: "非有效式：无证明，搜索可能不终止——正常排除。" }
          ] },
        { label: "缺推理规则的一阶系统", decidable: false,
          system: "去掉部分推理规则的一阶系统：有的逻辑有效式证不出来。",
          verdict: "可靠（不证假），但缺规则导致有有效式证不出——不完备，也不可判定。",
          insight: "推理规则不全，则有真理够不到——可证性依赖完整的规则集。",
          formulas: [
            { f: "∀x P(x) → ∃x P(x)", valid: true, provable: true, note: "仍可证的定理。" },
            { f: "∀x ( P(x) → P(x) )", valid: true, provable: false, note: "有效，但缺规则证不出——完备性缺口。" },
            { f: "∃x P(x) → ∀x P(x)", valid: false, provable: false, note: "非有效式——正常排除。" }
          ] }
      ]
    },
    advanced: {
      introStatus: "选择一个系统，逐项判定命题样本，辨析『完备』与『可判定』之别，体会一阶逻辑的半可判定。",
      legend: [
        ["完备", "有效 ⇒ 可证（哥德尔完备性）"],
        ["可判定", "存在判定算法（命题逻辑有）"],
        ["不可判定", "丘奇定理：一阶逻辑无判定算法"],
        ["半可判定", "有效式枚举可证，无效式可能不终止"],
        ["不完备", "含算术理论存在真而不可证（哥德尔不完备）"], ["⊢ / ⊨", "可证 / 有效"]
      ],
      cases: [
        { label: "一阶逻辑：完备但不可判定", decidable: false,
          system: "一阶逻辑（纯逻辑）：哥德尔完备性——有效式都可证；丘奇定理——有效性不可判定。",
          verdict: "可靠 + 完备，但<b>不可判定</b>。半可判定：有效式枚举终能找到证明，无效式可能永远等不到答案。",
          insight: "『完备』≠『可判定』：完备说真理都可证，可判定说能用算法一键判别——一阶逻辑前者成立、后者不成立。",
          formulas: [
            { f: "∀x P(x) → ∃x P(x)", valid: true, provable: true, note: "有效且可证；枚举证明会终止。" },
            { f: "∀x∃y R(x,y) → ∃y∀x R(x,y)", valid: false, provable: false, note: "非有效式：无证明，判定搜索可能不终止。" },
            { f: "¬∀x P(x) ↔ ∃x ¬P(x)", valid: true, provable: true, note: "量词否定律，可证定理。" }
          ] },
        { label: "命题逻辑：可判定（对照）", decidable: true,
          system: "命题逻辑：可靠、完备，且真值表给出判定算法。",
          verdict: "可靠 + 完备 + <b>可判定</b>——与一阶逻辑对照，差别正在于『可判定性』。",
          insight: "有限可枚举（真值表）使命题逻辑可判定；一阶逻辑的无限论域打破了这一点。",
          formulas: [
            { f: "A → A", valid: true, provable: true, note: "可证定理。" },
            { f: "(A → B) ∨ (B → A)", valid: true, provable: true, note: "有效且可证。" },
            { f: "A → B", valid: false, provable: false, note: "真值表判定为非有效——终止。" }
          ] },
        { label: "含算术的一阶理论（哥德尔不完备）", decidable: false,
          system: "一阶逻辑 + 算术公理（足够强且一致）：存在哥德尔句 G『本句不可证』。",
          verdict: "可靠，但含算术的强理论<b>不完备</b>（哥德尔不完备定理：G 真而不可证），且不可判定。",
          insight: "注意区分：一阶逻辑（纯逻辑）是完备的；加上算术公理的『理论』则不完备——两个不同的『完备』。",
          formulas: [
            { f: "∀x ( x = x )", valid: true, provable: true, note: "可证的真命题。" },
            { f: "0 = 0", valid: true, provable: true, note: "可证。" },
            { f: "G：『G 不可证』", valid: true, provable: false, note: "为真却不可证——哥德尔不完备的核心，完备性缺口。" }
          ] }
      ]
    },
    extend: {
      introStatus: "选择一个机器证明场景，逐项判定命题样本，体会证明助手与 AI 自动推理触及的不可判定边界。",
      legend: [
        ["Lean/Coq", "证明助手 · 内核可靠"],
        ["半可判定", "有效式可枚举证明，无效式可能不终止"],
        ["不可判定", "无通用判定算法（丘奇）"],
        ["AI 边界", "机械推理的根本极限"],
        ["不完备", "含算术存在真而不可证（哥德尔）"], ["⊢ / ⊨", "可证 / 有效"]
      ],
      cases: [
        { label: "证明助手 Lean / Coq", decidable: false,
          system: "Lean/Coq：可信内核保证每条定理可靠；一阶层面完备，但有效性不可判定，自动找证明可能不终止。",
          verdict: "内核<b>可靠</b>、一阶<b>完备</b>；但<b>不可判定</b>——自动证明可能不终止，需人工用 tactics 引导。",
          insight: "证明助手把可靠交给极小内核，但『找证明』触及不可判定边界——这正是 AI 自动推理的根本限制。",
          formulas: [
            { f: "∀x ( P(x) → P(x) )", valid: true, provable: true, note: "机器可证的定理（终止）。" },
            { f: "P(a) → ∃x P(x)", valid: true, provable: true, note: "EG，内核核验通过。" },
            { f: "∃x P(x) → ∀x P(x)", valid: false, provable: false, note: "非有效式：自动搜索可能不终止。" }
          ] },
        { label: "AI 自动定理证明的边界", decidable: false,
          system: "自动定理证明器：有效式可枚举证明（终止），但无通用判定算法（丘奇定理）。",
          verdict: "<b>半可判定</b>：有效式终能找到证明，无效式可能永远等不到答案——这是 AI 推理的能力边界。",
          insight: "再强的 AI 也不能对任意一阶命题『一键判定』——这是数学定下的边界，而非工程能力不足。",
          formulas: [
            { f: "∀x∃y R(x,y) ← ∃y∀x R(x,y)", valid: true, provable: true, note: "有效（∃∀⇒∀∃），可枚举证明——终止。" },
            { f: "∀x∃y R(x,y) → ∃y∀x R(x,y)", valid: false, provable: false, note: "非有效式：搜索可能永不终止。" },
            { f: "∀x ( P(x) ∨ ¬P(x) )", valid: true, provable: true, note: "有效且可证——终止。" }
          ] },
        { label: "含算术 + 机器证明（哥德尔边界）", decidable: false,
          system: "含算术的强系统 + 机器证明：存在真而机器也永不可证的命题（哥德尔不完备）。",
          verdict: "可靠，但<b>不完备</b>：存在真却不可证的命题，机器同样证不出——理性与 AI 的共同边界。",
          insight: "真理的高峰没有终点：机器与人都要面对不可证的真——既坚信真理可知，也保持谦逊与求索。",
          formulas: [
            { f: "0 = 0", valid: true, provable: true, note: "机器可证的真命题。" },
            { f: "∀x ( x = x )", valid: true, provable: true, note: "可证。" },
            { f: "G：『G 不可证』", valid: true, provable: false, note: "为真却不可证——机器也够不到，完备性缺口。" }
          ] }
      ]
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { LEVELS: LEVELS, computeCase: computeCase, classify: classify, KIND_LABEL: KIND_LABEL };
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
  var KIND_COLOR = { theorem: "#2f7d57", gap: "#c58a1f", unsound: "#d63b1d", excluded: "#9aa0a6" };

  function run() {
    var levelKey = global.SYMBOLIZE_LEVEL || "basic";
    var cfg = LEVELS[levelKey] || LEVELS.basic;

    var controlsEl = byId("controls");
    var systemEl = byId("spSystem");
    var formulasEl = byId("spFormulas");
    var evalEl = byId("spEval");
    var vennEl = byId("spVenn");
    var verdictEl = byId("spVerdict");
    if (!controlsEl || !systemEl) return;

    var st = null;
    var p = 0, manualFocus = null, autoTimer = null;
    var cardEls = [], dotEls = [];
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.cases.map(function (c, i) { return '<option value="' + i + '">' + esc(c.label) + '</option>'; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label><span>选择系统 / 场景</span><small>形式推理系统</small></label>' +
          '<select id="spSelect">' + opts + '</select></div>' +
        '<div class="control-group"><label><span>逐项判定</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button class="sym-step-btn" id="spPrev">◀ 上一步</button>' +
            '<button class="sym-step-btn sym-primary" id="spNext">下一步 ▶</button>' +
            '<button class="sym-step-btn" id="spAuto">⏵ 自动播放</button>' +
            '<button class="sym-step-btn" id="spReset">↺ 重置</button>' +
          '</div></div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="spProgBar"></i></div>' +
          '<span class="sym-progress-num" id="spProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="spStatus"></div></div>';
      statusEl = byId("spStatus"); progBar = byId("spProgBar"); progNum = byId("spProgNum");
      prevBtn = byId("spPrev"); nextBtn = byId("spNext"); autoBtn = byId("spAuto");
      byId("spSelect").addEventListener("change", function (e) { loadCase(+e.target.value); });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("spReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
    }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      box.innerHTML = '<div class="legend-title">系统性质说明</div><div class="legend-grid">' +
        cfg.legend.map(function (it) { return '<div class="legend-item"><span class="sym">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + '</span></div>'; }).join("") + '</div>';
    }

    function loadCase(idx) {
      stopAuto();
      st = computeCase(cfg.cases[idx]);
      p = 0; manualFocus = null;
      renderSystem(); renderFormulas(); renderVenn();
      evalEl.innerHTML = "";
      render();
    }

    function renderSystem() {
      systemEl.innerHTML = '<div class="sys-row"><b>系统配置：</b>' + esc(st.system) + '</div>' +
        '<div class="sys-row">逐项判定下方命题样本是否 <b>有效 ⊨</b>、是否 <b>可证 ⊢</b>、枚举搜索是否终止，再综合 可靠 / 完备 / 可判定。</div>';
    }

    function renderFormulas() {
      formulasEl.innerHTML = "";
      cardEls = st.formulas.map(function (f, i) {
        var d = document.createElement("div");
        d.className = "sp-formula k-" + f.kind;
        d.dataset.row = i;
        d.innerHTML = '<span class="sf-f">' + esc(f.f) + '</span>' +
          '<span class="sf-tag ' + (f.valid ? "t-valid" : "t-invalid") + '">' + (f.valid ? "有效 ⊨" : "无效 ⊭") + '</span>' +
          '<span class="sf-tag ' + (f.provable ? "t-prov" : "t-unprov") + '">' + (f.provable ? "可证 ⊢" : "不可证 ⊬") + '</span>' +
          '<span class="sf-tag">' + esc({ theorem: "定理", gap: "缺口", unsound: "破坏", excluded: "排除" }[f.kind]) + '</span>';
        d.addEventListener("click", function () { clickRow(i); });
        formulasEl.appendChild(d);
        return d;
      });
    }

    function renderVenn() {
      vennEl.innerHTML = "";
      var VW = 760, H = 300;
      var svg = svgEl("svg", { id: "spVenn", viewBox: "0 0 " + VW + " " + H, width: "100%", height: H });
      var g = svgEl("g"); svg.appendChild(g);
      var vx = 312, px = 448, cy = 150, r = 132;
      g.appendChild(svgEl("circle", { cx: vx, cy: cy, r: r, fill: "rgba(47,95,159,0.10)", stroke: "#2f5f9f", "stroke-width": 2 }));
      g.appendChild(svgEl("circle", { cx: px, cy: cy, r: r, fill: "rgba(47,125,87,0.10)", stroke: "#2f7d57", "stroke-width": 2 }));
      var l1 = svgEl("text", { x: 150, y: 34, fill: "#2f5f9f", "font-size": 15, "font-weight": "800" }); l1.textContent = "有效 ⊨（语义真集）"; g.appendChild(l1);
      var l2 = svgEl("text", { x: 610, y: 34, "text-anchor": "end", fill: "#2f7d57", "font-size": 15, "font-weight": "800" }); l2.textContent = "可证 ⊢（语法证集）"; g.appendChild(l2);
      var anchors = { theorem: { x: 380, y: cy }, gap: { x: 232, y: cy }, unsound: { x: 528, y: cy }, excluded: { x: 380, y: 270 } };
      var counts = { theorem: 0, gap: 0, unsound: 0, excluded: 0 };
      dotEls = st.formulas.map(function (f, i) {
        var a = anchors[f.kind], n = counts[f.kind]++;
        var col = (n % 3 - 1), rowi = Math.floor(n / 3);
        var x = a.x + col * 52, y = a.y - 30 + rowi * 34;
        var dg = svgEl("g"); dg.setAttribute("class", "sp-dot"); dg.dataset.row = i;
        var c = svgEl("circle", { cx: x, cy: y, r: 15, fill: KIND_COLOR[f.kind], stroke: "#fff", "stroke-width": 2 });
        var t = svgEl("text", { x: x, y: y, "text-anchor": "middle", "dominant-baseline": "central", fill: "#fff", "font-size": 12, "font-weight": "800", "font-family": "JetBrains Mono, monospace" }); t.textContent = (i + 1);
        dg.appendChild(c); dg.appendChild(t);
        dg.addEventListener("click", function () { clickRow(i); });
        g.appendChild(dg);
        return { g: dg, c: c };
      });
      vennEl.appendChild(svg);
    }

    function total() { return st.formulas.length + 1; }
    function step(dir) { manualFocus = null; p = Math.max(0, Math.min(total(), p + dir)); render(); }
    function clickRow(i) {
      stopAuto();
      var n = st.formulas.length;
      if (p <= n) { p = i + 1; manualFocus = null; }
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
      var n = st.formulas.length, T = n + 1;
      var shown = Math.min(p, n);
      var verdictShown = p > n;
      var stepRow = (p >= 1 && p <= n) ? p - 1 : null;
      var focusRow = (manualFocus != null) ? manualFocus : stepRow;

      for (var k = 0; k < n; k++) {
        var revealed = k < shown || verdictShown;
        var isCur = (k === focusRow);
        if (cardEls[k]) { cardEls[k].classList.toggle("sym-pending", !revealed); cardEls[k].classList.toggle("sym-cur", isCur); }
        if (dotEls[k]) { dotEls[k].g.classList.toggle("sym-pending", !revealed); dotEls[k].g.classList.toggle("sym-cur", isCur); }
      }

      evalEl.innerHTML = evalHTML(focusRow, verdictShown);
      renderVerdict(verdictShown);

      progNum.textContent = p + " / " + T;
      progBar.style.width = (T ? (p / T * 100) : 0) + "%";
      prevBtn.disabled = (p <= 0 && manualFocus == null);
      nextBtn.disabled = (p >= T);
      statusEl.innerHTML = statusHTML(p, focusRow, verdictShown);
    }

    function evalHTML(focusRow, verdictShown) {
      if (focusRow == null && !verdictShown) return '<span style="color:#6b4a38">点「下一步」逐项判定命题样本：先看是否有效 ⊨，再看本系统是否可证 ⊢，归类并观察枚举搜索是否终止。</span>';
      if (focusRow == null && verdictShown) return '已判定全部 <b>' + st.formulas.length + '</b> 个样本，下方综合给出可靠性、完备性、可判定性结论。可点任意样本回看。';
      var f = st.formulas[focusRow];
      var searchLine = f.search === "term"
        ? '<span style="color:#1d6b43;font-weight:800">判定 / 证明搜索终止 ✓</span>'
        : '<span style="color:#9a6a12;font-weight:800">搜索可能不终止 ⏳（半可判定）</span>';
      return '<div>判定 <span class="ev-f">' + esc(f.f) + '</span>：' + (f.valid ? "有效 ⊨" : "无效 ⊭") + '，' + (f.provable ? "可证 ⊢" : "不可证 ⊬") + '</div>' +
        '<div style="margin-top:4px">归类 <span class="ev-k k-' + f.kind + '">' + esc(KIND_LABEL[f.kind]) + '</span>：' + esc(f.note) + '</div>' +
        '<div style="margin-top:4px">枚举证明：' + searchLine + '</div>';
    }

    function renderVerdict(show) {
      function prop(name, val) {
        return '<div class="sp-prop ' + (show ? (val ? "v-yes" : "v-no") : "sym-pending") + '"><div class="p-name">' + name + '</div><div class="p-val">' + (show ? (val ? "成立 ✓" : "不成立 ✗") : "…") + '</div></div>';
      }
      var props = '<div class="sp-props">' + prop("可靠性 (Sound)", st.sound) + prop("完备性 (Complete)", st.complete) + prop("可判定性 (Decidable)", st.decidable) + '</div>';
      var concl = '<div class="sp-conclusion k-' + st.key + (show ? "" : " sym-pending") + '">' +
        '<span class="c-chip">系统判定：' + esc(st.label) + '</span>' +
        '<div class="c-reason">' + (show ? st.reason : "逐项判定完成后给出结论…") + '</div>' +
        (show && st.insight ? '<div class="c-insight">💡 ' + esc(st.insight) + '</div>' : "") + '</div>';
      verdictEl.innerHTML = props + concl;
    }

    function statusHTML(pp, focusRow, verdictShown) {
      if (pp === 0) return cfg.introStatus;
      if (focusRow != null) {
        var f = st.formulas[focusRow];
        return '样本 <b>' + esc(f.f) + '</b>：' + (f.valid ? "⊨" : "⊭") + ' / ' + (f.provable ? "⊢" : "⊬") + ' → <b>' + esc({ theorem: "定理", gap: "完备性缺口", unsound: "可靠性破坏", excluded: "正常排除" }[f.kind]) + '</b>' + (f.search === "maybe" ? '（搜索可能不终止 ⏳）' : '') + '。';
      }
      if (verdictShown) return '✅ <b>' + esc(st.label) + '</b>　可点任意样本 / 维恩点回看。';
      return "";
    }

    renderControls();
    renderLegend();
    loadCase(0);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})(typeof window !== "undefined" ? window : globalThis);
