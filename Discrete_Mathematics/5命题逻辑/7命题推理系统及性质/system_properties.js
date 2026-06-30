/* =====================================================================
 * 5.7 命题推理系统及性质 —— 三层统一交互引擎（推理系统性质仪表盘）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与本章其它小节同形）：选择系统 → 逐项判定命题样本
 *   点一步判定一个命题：是否『有效 ⊨』（语义真）、是否『可证 ⊢』（语法证）
 *   → 看分类反馈（定理 / 完备性缺口 / 可靠性破坏 / 正常排除）
 *   → 看语义×语法维恩图中对应点高亮 → 给出元性质结论（可靠/完备/一致）。
 *   完成后可点任意命题样本 / 维恩点回看。
 *
 * 难度梯度：
 *   基础层：形式系统的构成（公理/规则/可证性），看可证与有效的关系。
 *   进阶层：可靠性、完备性、一致性的判定与意义（含不可靠/不完备/不一致系统）。
 *   拓展层：证明助手(Coq/Lean) 与哥德尔不完备——真而不可证、理性边界。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* 命题样本：valid=语义有效(⊨)，provable=本系统可证(⊢)，contra=是否为矛盾式 */
  function classify(f) {
    if (f.provable && f.valid) return "theorem";    // 定理：可证且有效
    if (f.valid && !f.provable) return "gap";       // 完备性缺口：有效却不可证
    if (f.provable && !f.valid) return "unsound";   // 可靠性破坏：可证却无效
    return "excluded";                               // 正常排除：既不可证也无效
  }
  var KIND_LABEL = {
    theorem: "定理（可证且有效）", gap: "完备性缺口（有效却不可证）",
    unsound: "可靠性破坏（可证却无效）", excluded: "正常排除（不可证也无效）"
  };

  function computeCase(c) {
    var fs = c.formulas.map(function (f, i) {
      return { i: i, f: f.f, valid: f.valid, provable: f.provable, contra: !!f.contra, note: f.note || "", kind: classify(f) };
    });
    var sound = !fs.some(function (f) { return f.provable && !f.valid; });
    var complete = !fs.some(function (f) { return f.valid && !f.provable; });
    var consistent = !fs.some(function (f) { return f.provable && f.contra; });
    var key = (!sound || !consistent) ? "bad" : (!complete ? "partial" : "good");
    var label = (sound ? "可靠✓" : "不可靠✗") + " · " + (complete ? "完备✓" : "不完备✗") + " · " + (consistent ? "一致✓" : "不一致✗");
    var reason = c.verdict || "";
    return { system: c.system, formulas: fs, sound: sound, complete: complete, consistent: consistent, key: key, label: label, reason: reason, insight: c.insight || "" };
  }

  var LEVELS = {
    basic: {
      introStatus: "选择一个形式系统，点「下一步」逐个判定命题样本：它是否有效 ⊨、是否可证 ⊢，理解公理、规则与可证性。",
      legend: [
        ["公理", "无需证明 · 系统出发点"], ["规则", "MP 等 · 由已知推新"],
        ["⊢ 可证", "系统能证出"], ["⊨ 有效", "语义为真（重言式）"], ["定理", "可证且有效"]
      ],
      cases: [
        { label: "标准系统（公理 + MP 规则）",
          system: "公理：A→(B→A)、(A→(B→C))→((A→B)→(A→C)) 等；规则：MP（A→B, A ⟹ B）。",
          verdict: "公理皆有效、规则保持有效，故凡可证皆有效（可靠）；命题逻辑可证出全部重言式（完备）。",
          insight: "公理是出发点、规则是阶梯——二者合起来决定『什么是定理（可证）』。",
          formulas: [
            { f: "A → A", valid: true, provable: true, note: "由公理与 MP 可证，是定理。" },
            { f: "A → (B → A)", valid: true, provable: true, note: "本身就是一条公理。" },
            { f: "A ∨ ¬A", valid: true, provable: true, note: "排中律，可证的重言式。" },
            { f: "A → B", valid: false, provable: false, note: "不是重言式，系统也证不出——正常排除。" }
          ] },
        { label: "缺规则系统（只有公理）",
          system: "只保留公理，去掉 MP 规则：无法由已知推出新定理。",
          verdict: "公理仍有效（可靠），但缺少推理规则，许多有效式无法证出——不完备。",
          insight: "没有推理规则，再多公理也搭不出真理的阶梯：可证性依赖规则。",
          formulas: [
            { f: "A → (B → A)", valid: true, provable: true, note: "公理本身，可证。" },
            { f: "A → A", valid: true, provable: false, note: "有效，但缺 MP 推不出——完备性缺口。" },
            { f: "A ∨ ¬A", valid: true, provable: false, note: "有效，却证不出——缺口。" }
          ] },
        { label: "公理不足系统",
          system: "缺少与否定相关的公理：与 ¬ 有关的重言式难以证出。",
          verdict: "可靠（不证假），但表达/证明能力不足，部分有效式不可证——不完备。",
          insight: "公理选取决定系统的『地基』，地基不全则有真理够不到。",
          formulas: [
            { f: "A → A", valid: true, provable: true, note: "可证的定理。" },
            { f: "(A → B) → (A → B)", valid: true, provable: true, note: "可证。" },
            { f: "¬¬A → A", valid: true, provable: false, note: "有效，但缺否定公理证不出——缺口。" }
          ] }
      ]
    },
    advanced: {
      introStatus: "选择一个系统，逐项判定命题样本，综合得出可靠性、完备性、一致性三大元性质。",
      legend: [
        ["可靠", "可证 ⇒ 有效（不证假）"], ["完备", "有效 ⇒ 可证（不漏真）"],
        ["一致", "不证出矛盾"], ["⊢ / ⊨", "可证 / 有效"],
        ["缺口", "有效但不可证"], ["破坏", "可证但无效"]
      ],
      cases: [
        { label: "命题逻辑标准系统（理想）",
          system: "公理 + MP，命题逻辑的标准形式系统。",
          verdict: "可证皆有效（可靠）、有效皆可证（完备）、不证矛盾（一致）——可靠完备一致的典范。",
          insight: "既守正（不出错）又固本（不遗漏），是形式系统的理想状态。",
          formulas: [
            { f: "A → A", valid: true, provable: true, note: "定理。" },
            { f: "A ∨ ¬A", valid: true, provable: true, note: "定理（排中律）。" },
            { f: "(A → B) ∨ (B → A)", valid: true, provable: true, note: "有效且可证。" },
            { f: "A ∧ ¬A", valid: false, provable: false, note: "矛盾式，不可证——一致。" }
          ] },
        { label: "不可靠系统（含错误规则）",
          system: "误加了一条『A→B, B ⟹ A』的错误规则（肯定后件），会证出无效式。",
          verdict: "证出了无效式 A→B（可靠性破坏）；一旦证出无效式，系统也不再一致。",
          insight: "错误的规则会把谬误当真理——可靠性是底线，决不能破。",
          formulas: [
            { f: "A → A", valid: true, provable: true, note: "定理。" },
            { f: "A → B", valid: false, provable: true, contra: false, note: "无效却被错误规则证出——可靠性破坏！" },
            { f: "A ∧ ¬A", valid: false, provable: true, contra: true, note: "不可靠系统进而证出矛盾——不一致。" }
          ] },
        { label: "不完备系统（规则偏弱）",
          system: "规则集偏弱，部分有效式无法证出，但绝不证假。",
          verdict: "可证皆有效（可靠、一致），但有有效式证不出——不完备。",
          insight: "守住了底线（可靠），却未能覆盖全部真理（完备）——制度建设也需兼顾两者。",
          formulas: [
            { f: "A → A", valid: true, provable: true, note: "定理。" },
            { f: "A ∨ ¬A", valid: true, provable: false, note: "有效却证不出——完备性缺口。" },
            { f: "¬¬A → A", valid: true, provable: false, note: "有效却证不出——缺口。" }
          ] },
        { label: "不一致系统（自相矛盾）",
          system: "前提集自相矛盾，可证出 A∧¬A，进而（爆炸原理）证出一切。",
          verdict: "证出矛盾 A∧¬A（不一致）；不一致系统能证出任意命题，可靠性随之崩塌。",
          insight: "自相矛盾的体系会推出一切、失去意义——一致性是系统存续的根基。",
          formulas: [
            { f: "A", valid: false, provable: true, note: "由矛盾前提可证（爆炸原理）。" },
            { f: "A ∧ ¬A", valid: false, provable: true, contra: true, note: "证出矛盾式——不一致！" },
            { f: "¬A", valid: false, provable: true, note: "矛盾系统连 ¬A 也能证——什么都能证。" }
          ] }
      ]
    },
    extend: {
      introStatus: "选择一个系统/任务，逐项判定命题样本，体会机器证明的可靠性与哥德尔不完备带来的理性边界。",
      legend: [
        ["Coq/Lean", "证明助手 · 内核可靠"], ["不完备", "存在真而不可证"],
        ["G", "哥德尔句 · 自指『我不可证』"], ["⊢ / ⊨", "可证 / 有效"],
        ["理性边界", "真理不能被完全形式化"]
      ],
      cases: [
        { label: "证明助手 Coq / Lean（内核可靠）",
          system: "机器检查的形式系统：每条定理都由可信内核（kernel）按规则核验。",
          verdict: "凡机器证出的都经内核核验、皆有效（可靠、一致）；命题逻辑层面完备。",
          insight: "Coq/Lean 把『可靠性』交给极小可信内核，是软硬件形式验证的基石。",
          formulas: [
            { f: "A → A", valid: true, provable: true, note: "机器可证的定理。" },
            { f: "(A ∧ B) → A", valid: true, provable: true, note: "内核核验通过。" },
            { f: "A → B", valid: false, provable: false, note: "非重言式，内核拒绝——可靠。" }
          ] },
        { label: "含算术的丰富系统（哥德尔不完备）",
          system: "足够强（含初等算术）且一致的系统：存在哥德尔句 G『本句不可证』。",
          verdict: "G 为真（有效）却不可证——系统<b>不完备</b>，且这种不完备无法靠『更努力证明』消除。",
          insight: "真理的高峰没有终点：任何足够强的一致系统都有够不到的真。这是理性的边界，也是创新的起点。",
          formulas: [
            { f: "0 = 0", valid: true, provable: true, note: "可证的真命题。" },
            { f: "A → A", valid: true, provable: true, note: "可证定理。" },
            { f: "G：『G 不可证』", valid: true, provable: false, note: "为真却不可证——哥德尔不完备的核心。" }
          ] },
        { label: "加新公理后仍不完备",
          system: "把 G 当作新公理加入，得到更强的系统 S′。",
          verdict: "S′ 能证 G 了，但又出现新的哥德尔句 G′ 真而不可证——<b>永远不完备</b>。",
          insight: "实践创新可引入新公理、攀上新高度，但真理之塔永无封顶——保持谦逊与求索。",
          formulas: [
            { f: "G（已作为新公理）", valid: true, provable: true, note: "在 S′ 中成为可证。" },
            { f: "0 = 0", valid: true, provable: true, note: "可证。" },
            { f: "G′：『G′ 不可证』", valid: true, provable: false, note: "S′ 的新哥德尔句，仍真而不可证——缺口再现。" }
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
  var KIND_COLOR = { theorem: "#2f7d57", gap: "#c58a1f", unsound: "#b42318", excluded: "#9aa0a6" };

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
        '<div class="control-group"><label><span>选择系统 / 任务</span><small>形式推理系统</small></label>' +
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
        '<div class="sys-row">逐项判定下方命题样本是否 <b>有效 ⊨</b>（语义真）与 <b>可证 ⊢</b>（本系统能证出），再综合三大元性质。</div>';
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
      // region anchors
      var anchors = { theorem: { x: 380, y: cy }, gap: { x: 232, y: cy }, unsound: { x: 528, y: cy }, excluded: { x: 380, y: 270 } };
      var counts = { theorem: 0, gap: 0, unsound: 0, excluded: 0 };
      dotEls = st.formulas.map(function (f, i) {
        var a = anchors[f.kind], n = counts[f.kind]++;
        var col = (n % 3 - 1), rowi = Math.floor(n / 3);
        var x = a.x + col * 52, y = a.y - 30 + rowi * 34 + (f.kind === "excluded" ? 0 : 0);
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
      if (focusRow == null && !verdictShown) return '<span style="color:#6c5a52">点「下一步」逐项判定命题样本：先看是否有效 ⊨，再看本系统是否可证 ⊢，归类为定理/缺口/破坏/排除。</span>';
      if (focusRow == null && verdictShown) return '已判定全部 <b>' + st.formulas.length + '</b> 个样本，下方综合给出可靠性、完备性、一致性结论。可点任意样本回看。';
      var f = st.formulas[focusRow];
      return '<div>判定 <span class="ev-f">' + esc(f.f) + '</span>：' + (f.valid ? "有效 ⊨" : "无效 ⊭") + '，' + (f.provable ? "可证 ⊢" : "不可证 ⊬") + '</div>' +
        '<div style="margin-top:4px">归类 <span class="ev-k k-' + f.kind + '">' + esc(KIND_LABEL[f.kind]) + '</span>：' + esc(f.note) + '</div>';
    }

    function renderVerdict(show) {
      function prop(name, val) {
        return '<div class="sp-prop ' + (show ? (val ? "v-yes" : "v-no") : "sym-pending") + '"><div class="p-name">' + name + '</div><div class="p-val">' + (show ? (val ? "成立 ✓" : "不成立 ✗") : "…") + '</div></div>';
      }
      var props = '<div class="sp-props">' + prop("可靠性 (Sound)", st.sound) + prop("完备性 (Complete)", st.complete) + prop("一致性 (Consistent)", st.consistent) + '</div>';
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
        return '样本 <b>' + esc(f.f) + '</b>：' + (f.valid ? "⊨" : "⊭") + ' / ' + (f.provable ? "⊢" : "⊬") + ' → <b>' + esc({ theorem: "定理", gap: "完备性缺口", unsound: "可靠性破坏", excluded: "正常排除" }[f.kind]) + '</b>。';
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
