/* =====================================================================
 * 6.7 谓词逻辑推理系统及性质 —— 三层统一交互引擎（一阶系统性质仪表盘）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与本章其它小节同形）：选择系统 → 逐项判定命题样本
 *   点一步判定一个命题：是否『有效 ⊨』、是否『可证 ⊢』、判定 / 证明搜索能否停机
 *   → 看分类反馈（定理 / 完备性缺口 / 可靠性破坏 / 正常排除）+ 半可判定提示
 *   → 看语义×语法维恩图高亮 → 给出元性质结论（可靠 / 完备 / 可判定）。
 *   完成后可点任意命题样本 / 维恩点回看。
 *
 * 说明：样本只作演示。『成立 ✓』表示本组样本中未见反例、与定理一致；
 *   严格结论来自可靠性定理、哥德尔完备性定理、丘奇–图灵不可判定性定理。
 *
 * 难度梯度：
 *   基础层：推理系统的构成（规则），命题逻辑可判定 vs 一阶逻辑不可判定，缺规则则不完备。
 *   进阶层：完备但不可判定（哥德尔完备性 vs 丘奇–图灵）、半可判定；与算术理论的不完备区分。
 *   拓展层：证明助手（核验可判定、找证明不可判定）、自动定理证明与 AI 推理的边界。
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
  var KIND_SHORT = { theorem: "定理", gap: "缺口", unsound: "破坏", excluded: "排除" };

  /* search：dec = 可判定系统中判定算法停机；found = 枚举证明找到证明并停机；open = 找不到证明、不会停机 */
  function computeCase(c) {
    var decidable = !!c.decidable;
    var kindLabel = {};
    for (var k in KIND_LABEL) kindLabel[k] = (c.kindLabel && c.kindLabel[k]) || KIND_LABEL[k];
    var fs = c.formulas.map(function (f, i) {
      return { i: i, f: f.f, valid: f.valid, provable: f.provable, note: f.note || "", kind: classify(f),
        search: decidable ? "dec" : (f.provable ? "found" : "open") };
    });
    var sound = !fs.some(function (f) { return f.provable && !f.valid; });
    var complete = !fs.some(function (f) { return f.valid && !f.provable; });
    var key = (!sound) ? "bad" : (!complete ? "partial" : (!decidable ? "semidec" : "good"));
    var label = (sound ? "可靠✓" : "不可靠✗") + " · " + (complete ? "完备✓" : "不完备✗") + " · " + (decidable ? "可判定✓" : "不可判定✗");
    return { system: c.system, formulas: fs, sound: sound, complete: complete, decidable: decidable, key: key, label: label,
      reason: c.verdict || "", insight: c.insight || "",
      sem: c.sem || ["有效 ⊨", "无效 ⊭"], semSet: c.semSet || "有效 ⊨（语义）", kindLabel: kindLabel };
  }

  /* 含算术理论的样本：⊨ 列指『在标准模型 ℕ 中为真』，而不是逻辑有效 */
  var ARITH = {
    sem: ["ℕ 中为真", "ℕ 中为假"],
    semSet: "ℕ 中为真（标准模型）",
    kindLabel: { theorem: "定理（可证且为真）", gap: "真而不可证（理论不完备）" }
  };
  function arith(c) { for (var k in ARITH) c[k] = ARITH[k]; return c; }

  var LEVELS = {
    basic: {
      introStatus: "选择一个推理系统，逐项判定命题样本：是否有效 ⊨、是否可证 ⊢、判定能否停机，认识推理系统的构成与可判定性。",
      legend: [
        ["规则", "推理系统：前提引入、MP 等 + 量词规则"],
        ["量词规则", "UI、UG、EI、EG：全称 / 存在的指定与推广"],
        ["⊢ 可证", "系统能从无前提推出"],
        ["⊨ 有效", "在一切解释下为真"],
        ["可判定", "有算法对任意公式判定是否有效"],
        ["不可判定", "一阶逻辑无通用判定算法（丘奇、图灵）"]
      ],
      cases: [
        { label: "命题逻辑系统（可判定）", decidable: true,
          system: "命题逻辑推理系统：前提引入、MP（假言推理）、附加前提等规则；任一公式是否永真，都可用真值表机械判定。",
          verdict: "可证的都是永真式（可靠），永真式都可证（完备），且真值表给出判定算法——可靠、完备、可判定。",
          insight: "n 个命题变元只有 2ⁿ 种赋值，逐行检查必然结束——这就是判定算法。",
          formulas: [
            { f: "A → A", valid: true, provable: true, note: "永真式，由附加前提规则可证。" },
            { f: "A ∨ ¬A", valid: true, provable: true, note: "排中律，永真且可证。" },
            { f: "A → B", valid: false, provable: false, note: "非永真：A 真、B 假时为假，真值表判定停机——正常排除。" }
          ] },
        { label: "一阶逻辑系统（不可判定）", decidable: false,
          system: "一阶逻辑自然推理系统：命题逻辑的全部推理规则 + 四条量词规则 UI、UG、EI、EG。",
          verdict: "可靠性定理：可证 ⇒ 有效；哥德尔完备性定理：有效 ⇒ 可证。但有效性问题<b>不可判定</b>（丘奇、图灵，1936）——可靠、完备，却不可判定。",
          insight: "一阶逻辑的论域可以无穷、解释有无穷多种，无法像真值表那样逐一检查——表达力增强的代价是失去通用判定算法。",
          formulas: [
            { f: "∀x P(x) → ∃x P(x)", valid: true, provable: true, note: "有效（一阶逻辑约定论域非空）：UI 得 P(c)，再 EG 得 ∃x P(x)，可证。" },
            { f: "∀x ( P(x) → P(x) )", valid: true, provable: true, note: "对任意 x，P(x) → P(x) 可证，再由 UG 推广，可证。" },
            { f: "P(a) → ∃x P(x)", valid: true, provable: true, note: "由 EG 直接得到，可证。" },
            { f: "∃x P(x) → ∀x P(x)", valid: false, provable: false, note: "非有效：论域 {1, 2} 中令 P(1) 真、P(2) 假即得反模型。它没有证明，单靠枚举证明永远找不到、不会停机——正常排除。" }
          ] },
        { label: "缺少 UG 的简化系统（不完备）", decidable: false,
          system: "假想的简化系统：只保留前提引入、附加前提、MP、UI、EG，删去 UG 等能得出全称结论的规则。",
          verdict: "仍<b>可靠</b>（规则变少不会推出无效式），但有效式 ∀x ( P(x) → P(x) ) 推不出——<b>不完备</b>。有效性问题仍不可判定：这是一阶逻辑本身的性质，与系统规则多少无关。",
          insight: "完备性依赖完整的规则集：少了能引入 ∀ 的规则，就有逻辑真理够不着。",
          formulas: [
            { f: "∀x P(x) → ∃x P(x)", valid: true, provable: true, note: "只用附加前提、UI、EG 仍可证。" },
            { f: "∀x ( P(x) → P(x) )", valid: true, provable: false, note: "有效，但本系统没有任何能引入 ∀ 的规则，推不出——完备性缺口。" },
            { f: "∃x P(x) → ∀x P(x)", valid: false, provable: false, note: "非有效（同一反模型）——正常排除。" }
          ] }
      ]
    },
    advanced: {
      introStatus: "选择一个系统，逐项判定命题样本，辨析『完备』与『可判定』之别，体会一阶逻辑的半可判定，并与算术理论的『不完备』区分。",
      legend: [
        ["可靠", "可证 ⇒ 有效"],
        ["完备", "有效 ⇒ 可证（哥德尔完备性定理）"],
        ["不可判定", "无通用判定算法（丘奇、图灵 1936）"],
        ["半可判定", "有效式终能证出；无效式可能不停机"],
        ["不完备", "足够强的算术理论有真而不可证的语句（哥德尔 1931）"],
        ["⊢ / ⊨", "可证 / 有效"]
      ],
      cases: [
        { label: "一阶逻辑：完备但不可判定", decidable: false,
          system: "一阶逻辑（纯逻辑，不加非逻辑公理）：可靠性定理 + 哥德尔完备性定理（1929 年证明，1930 年发表）；丘奇、图灵（1936）证明其有效性不可判定。",
          verdict: "可靠 + 完备，但<b>不可判定</b>。它是<b>半可判定</b>的：若公式有效，逐一枚举所有证明终会找到一个并停机；若公式无效，枚举永远找不到证明，而且不存在对一切公式都能停机答『无效』的算法。",
          insight: "『完备』≠『可判定』：完备说有效式都有证明；可判定说有算法对任意公式在有限步内答『是 / 否』。一阶逻辑前者成立、后者不成立。个别无效式可以靠构造反模型否定，但没有通用方法。",
          formulas: [
            { f: "∀x P(x) → ∃x P(x)", valid: true, provable: true, note: "有效且可证；枚举证明终会找到它。" },
            { f: "∃y∀x R(x,y) → ∀x∃y R(x,y)", valid: true, provable: true, note: "有效：EI 得 ∀x R(x,c)，UI 得 R(x,c)，EG 得 ∃y R(x,y)，再 UG 即得。可证。" },
            { f: "∀x∃y R(x,y) → ∃y∀x R(x,y)", valid: false, provable: false, note: "非有效：论域 {1, 2}，R 取『相等』——每个 x 都有 y = x，却没有一个 y 等于所有 x，得反模型。枚举证明不会停机。" },
            { f: "¬∀x P(x) ↔ ∃x ¬P(x)", valid: true, provable: true, note: "量词否定律，有效且可证。" }
          ] },
        { label: "命题逻辑：可判定（对照）", decidable: true,
          system: "命题逻辑：可靠、完备，且真值表给出判定算法。",
          verdict: "可靠 + 完备 + <b>可判定</b>——与一阶逻辑对照，差别正在于『可判定性』。",
          insight: "有限种赋值（真值表）使命题逻辑可判定；一阶逻辑的解释有无穷多种，打破了这一点。",
          formulas: [
            { f: "A → A", valid: true, provable: true, note: "永真且可证。" },
            { f: "(A → B) ∨ (B → A)", valid: true, provable: true, note: "永真：B 真时前一析取项真，B 假时后一析取项真。可证。" },
            { f: "A → B", valid: false, provable: false, note: "真值表判定为非永真，判定停机。" }
          ] },
        arith({ label: "含算术的一阶理论（哥德尔不完备）", decidable: false,
          system: "一阶逻辑 + 算术公理（如皮亚诺算术 PA）：一致、公理集可能行枚举、足以表达基本算术。可构造哥德尔句 G，大意是『G 在本理论中不可证』。本例 ⊨ 列指『在标准模型 ℕ 中为真』。",
          verdict: "该理论<b>不完备</b>（哥德尔第一不完备定理，1931）：若 PA 一致，则 G 不可证，而 G 在 ℕ 中为真；¬G 在 ℕ 中为假，也不可证。这里的『完备』指理论能否证明或否证每个语句，与一阶逻辑的完备性定理不是一回事；该理论的可证性同样不可判定。",
          insight: "两个『完备』别混淆：一阶逻辑的完备性定理说『逻辑有效 ⇒ 可证』，依然成立；不完备定理针对足够强的算术理论，说『在 ℕ 中为真 ⇏ 可证』。G 并非 PA 公理的逻辑推论（存在使 G 为假的非标准模型），两者并不矛盾。",
          formulas: [
            { f: "∀x ( x = x )", valid: true, provable: true, note: "等词的自反性，逻辑有效，可证。" },
            { f: "∀x ( x + 0 = x )", valid: true, provable: true, note: "PA 的公理之一，在 ℕ 中为真，可证。" },
            { f: "G：『G 不可证』", valid: true, provable: false, note: "在 ℕ 中为真，却在 PA 中不可证——理论的不完备。" }
          ] })
      ]
    },
    extend: {
      introStatus: "选择一个机器证明场景，逐项判定命题样本，体会『核验证明可判定、寻找证明不可判定』，以及自动推理触及的边界。",
      legend: [
        ["证明助手", "如 Lean、Coq：内核核验 · 人机协同找证明"],
        ["核验 / 搜索", "检查给定证明可判定；找证明无通用算法"],
        ["半可判定", "有效式终能证出；无效式可能不停机"],
        ["不可判定", "无通用判定算法（丘奇、图灵）"],
        ["不完备", "算术理论有真而不可证的语句（哥德尔）"],
        ["⊢ / ⊨", "可证 / 有效"]
      ],
      cases: [
        { label: "证明助手（如 Lean、Coq）", decidable: false,
          system: "证明助手（如 Lean、Coq）：基于依赖类型论，表达力强于一阶逻辑；由小型可信内核逐步检查证明。检查一个给定证明是机械的、可判定的；而『找到证明』没有通用算法。",
          verdict: "内核只接受通过检查的证明，在内核实现正确、底层逻辑一致的前提下<b>可靠</b>；就一阶逻辑片段而言，有效式都存在证明（<b>完备</b>性定理）；但有效性<b>不可判定</b>——自动化策略对无效式可能永不停机，实践中由人编写 tactic 引导、机器补全细节。",
          insight: "证明助手的分工：『核验』交给极小内核（可判定、可信），『发现』交给人与自动化（半可判定）。这正是可靠性、完备性与不可判定性在工程上的落点。",
          formulas: [
            { f: "∀x ( P(x) → P(x) )", valid: true, provable: true, note: "自动化可找到证明，内核核验通过。" },
            { f: "P(a) → ∃x P(x)", valid: true, provable: true, note: "EG 一步，内核核验通过。" },
            { f: "∃x P(x) → ∀x P(x)", valid: false, provable: false, note: "非有效：没有证明可找；自动搜索找不到证明，若不设时限会一直运行。" }
          ] },
        { label: "自动定理证明的边界", decidable: false,
          system: "一阶自动定理证明器（如基于归结原理的证明器）：对有效式，完备的搜索策略终能找到证明；但丘奇–图灵定理表明，不存在对一切公式都停机的判定算法。",
          verdict: "<b>半可判定</b>：有效式终能找到证明并停机；无效式可能永远等不到答案。任何以算法实现的推理系统（包括 AI）都受这一边界约束——实践中只能设定时限，超时即答『未知』。",
          insight: "边界来自数学而非算力：再快的机器、再大的模型，只要是算法，就不能对任意一阶公式判定其有效性。",
          formulas: [
            { f: "∃y∀x R(x,y) → ∀x∃y R(x,y)", valid: true, provable: true, note: "有效（∃∀ 蕴含 ∀∃），可找到证明——停机。" },
            { f: "∀x∃y R(x,y) → ∃y∀x R(x,y)", valid: false, provable: false, note: "非有效（反模型：论域 {1, 2}，R 取『相等』）；证明搜索不会停机。" },
            { f: "∀x ( P(x) ∨ ¬P(x) )", valid: true, provable: true, note: "有效且可证——停机。" }
          ] },
        arith({ label: "形式化算术（哥德尔边界）", decidable: false,
          system: "在证明助手中形式化一个一致、可能行公理化、足够强的算术理论（如 PA）。本例 ⊨ 列指『在标准模型 ℕ 中为真』。",
          verdict: "机器只是忠实执行形式系统的规则，逃不出系统本身的限制：该理论<b>不完备</b>（哥德尔第一不完备定理）——存在在 ℕ 中为真、却在该理论内不可证的语句；其可证性也不可判定。",
          insight: "不完备针对的是『某一个固定的形式系统』：把 G 作为新公理加入即可证出 G，但新系统又会有新的不可证真语句——对真理的探索没有终点。",
          formulas: [
            { f: "∀x ( x + 0 = x )", valid: true, provable: true, note: "PA 的公理之一，可证。" },
            { f: "∀x∀y ( x + y = y + x )", valid: true, provable: true, note: "加法交换律：借助归纳公理可证，机器核验通过。" },
            { f: "G：『G 不可证』", valid: true, provable: false, note: "在 ℕ 中为真，却在该理论内不可证——机器同样证不出。" }
          ] })
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
            '<button class="sym-step-btn sym-ghost" id="spReset">↺ 重置</button>' +
          '</div>' +
          '<div class="sym-speed"><span>慢</span><input type="range" id="spSpeed" min="1" max="100" value="55" aria-label="自动播放速度"><span>快</span></div>' +
        '</div>' +
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
      byId("spSpeed").addEventListener("input", function () { if (autoTimer) { stopAuto(); toggleAuto(); } });
    }
    function autoDelay() { var sp = byId("spSpeed"); return Math.max(280, 1500 - Number(sp ? sp.value : 55) * 12); }

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
        '<div class="sys-row">逐项判定下方命题样本是否 <b>' + esc(st.sem[0]) + '</b>、是否 <b>可证 ⊢</b>、判定 / 证明搜索能否停机，再综合 可靠 / 完备 / 可判定。</div>';
    }

    function renderFormulas() {
      formulasEl.innerHTML = "";
      cardEls = st.formulas.map(function (f, i) {
        var d = document.createElement("div");
        d.className = "sp-formula k-" + f.kind;
        d.dataset.row = i;
        d.innerHTML = '<span class="sf-f">' + esc(f.f) + '</span>' +
          '<span class="sf-tag ' + (f.valid ? "t-valid" : "t-invalid") + '">' + esc(f.valid ? st.sem[0] : st.sem[1]) + '</span>' +
          '<span class="sf-tag ' + (f.provable ? "t-prov" : "t-unprov") + '">' + (f.provable ? "可证 ⊢" : "不可证 ⊬") + '</span>' +
          '<span class="sf-tag">' + esc(KIND_SHORT[f.kind]) + '</span>';
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
      var l1 = svgEl("text", { x: 24, y: 34, fill: "#2f5f9f", "font-size": 15, "font-weight": "800" }); l1.textContent = st.semSet; g.appendChild(l1);
      var l2 = svgEl("text", { x: 736, y: 34, "text-anchor": "end", fill: "#2f7d57", "font-size": 15, "font-weight": "800" }); l2.textContent = "可证 ⊢（语法）"; g.appendChild(l2);
      var anchors = { theorem: { x: 380, y: cy }, gap: { x: 236, y: cy }, unsound: { x: 524, y: cy }, excluded: { x: 96, y: 262 } };
      var l3 = svgEl("text", { x: 96, y: 206, "text-anchor": "middle", fill: "#6a6f76", "font-size": 13, "font-weight": "700" }); l3.textContent = "两圈之外"; g.appendChild(l3);
      var counts = { theorem: 0, gap: 0, unsound: 0, excluded: 0 };
      dotEls = st.formulas.map(function (f, i) {
        var a = anchors[f.kind], n = counts[f.kind]++;
        var col = [0, -1, 1][n % 3], rowi = Math.floor(n / 3);
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
      autoTimer = setInterval(function () { if (p >= total()) { stopAuto(); return; } manualFocus = null; p += 1; render(); }, autoDelay());
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
      if (focusRow == null && !verdictShown) return '<span style="color:#6b4a38">点「下一步」逐项判定命题样本：先看是否' + esc(st.sem[0]) + '，再看本系统是否可证 ⊢，归类并观察判定 / 证明搜索能否停机。</span>';
      if (focusRow == null && verdictShown) return '已判定全部 <b>' + st.formulas.length + '</b> 个样本，下方综合给出可靠性、完备性、可判定性结论。可点任意样本回看。';
      var f = st.formulas[focusRow];
      var searchLine = {
        dec: '<span style="color:#1d6b43;font-weight:800">真值表判定停机 ✓（可判定）</span>',
        found: '<span style="color:#1d6b43;font-weight:800">找到证明，停机 ✓</span>',
        open: '<span style="color:#9a6a12;font-weight:800">找不到证明，搜索不停机 ⏳</span>（一般情形下没有算法能保证答出『否』）'
      }[f.search];
      return '<div>判定 <span class="ev-f">' + esc(f.f) + '</span>：' + esc(f.valid ? st.sem[0] : st.sem[1]) + '，' + (f.provable ? "可证 ⊢" : "不可证 ⊬") + '</div>' +
        '<div style="margin-top:4px">归类 <span class="ev-k k-' + f.kind + '">' + esc(st.kindLabel[f.kind]) + '</span>：' + esc(f.note) + '</div>' +
        '<div style="margin-top:4px">' + (f.search === "dec" ? "判定算法：" : "枚举证明：") + searchLine + '</div>';
    }

    function renderVerdict(show) {
      function prop(name, val) {
        return '<div class="sp-prop ' + (show ? (val ? "v-yes" : "v-no") : "sym-pending") + '"><div class="p-name">' + name + '</div><div class="p-val">' + (show ? (val ? "成立 ✓" : "不成立 ✗") : "…") + '</div></div>';
      }
      var props = '<div class="sp-props">' + prop("可靠性 (Sound)", st.sound) + prop("完备性 (Complete)", st.complete) + prop("可判定性 (Decidable)", st.decidable) + '</div>';
      var concl = '<div class="sp-conclusion k-' + st.key + (show ? "" : " sym-pending") + '">' +
        '<span class="c-chip">系统判定：' + esc(st.label) + '</span>' +
        '<div class="c-reason">' + (show ? st.reason : "逐项判定完成后给出结论…") + '</div>' +
        (show && st.insight ? '<div class="c-insight">💡 ' + esc(st.insight) + '</div>' : "") +
        (show ? '<div class="c-note">注：「成立 ✓」只表示本组样本中未出现反例，与定理一致；可靠性、完备性、不可判定性的严格结论来自定理证明，而非样本检验。「不成立 ✗」则由样本中的反例直接说明。</div>' : "") + '</div>';
      verdictEl.innerHTML = props + concl;
    }

    function statusHTML(pp, focusRow, verdictShown) {
      if (pp === 0) return cfg.introStatus;
      if (focusRow != null) {
        var f = st.formulas[focusRow];
        return '样本 <b>' + esc(f.f) + '</b>：' + esc(f.valid ? st.sem[0] : st.sem[1]) + ' / ' + (f.provable ? "可证 ⊢" : "不可证 ⊬") + ' → <b>' + esc(st.kindLabel[f.kind].replace(/（.*$/, "")) + '</b>' + (f.search === "open" ? '（证明搜索不停机 ⏳）' : '') + '。';
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
