/* =====================================================================
 * 6.3 谓词公式的类型 —— 三层统一交互引擎（谓词公式类型侦测器）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与本章其它小节同形）：选择公式 → 逐一核验有限论域上的解释
 *   点一步看一个解释（谓词赋值）→ 看反馈（该解释下公式真/假）
 *   → 看解释卡高亮、真值分布图格高亮 → 综合判定类型。
 *   注意：有限论域上「全真 / 全假」只说明与永真 / 永假一致，严格结论由
 *   case.proof 的一般性论证给出；「有真有假」（找到反模型）则是严格结论。
 *   完成后可点任意解释 / 图格回看。
 *
 * 难度梯度：
 *   基础层：2 元论域，单谓词，分类 永真/永假/可满足（建立直觉）。
 *   进阶层：2 元论域，逻辑有效 vs 反模型（找到使其为假的解释否定永真）。
 *   拓展层：3 元论域（8 解释），判定边界——有限样本全真≠永真，半可判定只有单向。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* 每个公式给一个语义求值器 evalFn(P, D)：P(x) 为谓词在元素 x 的真值，D 为论域数组。
   * proof：对「任意非空论域、任意解释」的一般性论证（仅永真/永假的公式给出），
   * 有限论域核验只能说明「与永真/永假一致」，严格结论由 proof 保证。 */
  var LEVELS = {
    basic: {
      introStatus: "选择一个公式，点「下一步」逐一核验 2 元论域上的解释（谓词赋值），看公式在每个解释下的真值，再归类为永真 / 永假 / 可满足。",
      legend: [
        ["永真 ⊤", "一切解释下皆真（逻辑有效）"],
        ["永假 ⊥", "一切解释下皆假（矛盾式）"],
        ["可满足 ◇", "至少一个解释为真（永真式也属可满足式）"],
        ["解释 I", "非空论域 + 谓词赋值"],
        ["∀ / ∃", "对所有 / 存在"]
      ],
      domainLabel: "D = {a, b}",
      cases: [
        { label: "∀x(P(x) ∨ ¬P(x))  排中律", formula: "∀x ( P(x) ∨ ¬P(x) )", domain: ["a", "b"],
          insight: "排中律不依赖论域大小和 P 的具体含义——这是逻辑本身保证的真理，即永真式。",
          proof: "任取非空论域 D 与谓词 P，对每个 x∈D，P(x) 与 ¬P(x) 恰有一个为真，故 P(x)∨¬P(x) 为真，从而 ∀x(P(x)∨¬P(x)) 为真。",
          evalFn: function (P, D) { return D.every(function (x) { return P(x) || !P(x); }); } },
        { label: "∀x(P(x) ∧ ¬P(x))  矛盾律", formula: "∀x ( P(x) ∧ ¬P(x) )", domain: ["a", "b"],
          insight: "要求同一对象既是又不是，逻辑上不可能——永假式（矛盾式）。",
          proof: "任取非空论域 D 与谓词 P，取 D 中任一元素 x，P(x)∧¬P(x) 为假，故 ∀x(P(x)∧¬P(x)) 为假。",
          evalFn: function (P, D) { return D.every(function (x) { return P(x) && !P(x); }); } },
        { label: "∃x P(x)  存在断言", formula: "∃x P(x)", domain: ["a", "b"],
          insight: "真假取决于论域里有没有满足 P 的对象——有的解释为真、有的为假，是可满足式但非永真。",
          evalFn: function (P, D) { return D.some(function (x) { return P(x); }); } }
      ]
    },
    advanced: {
      introStatus: "选择一个公式，逐一核验解释：要否定『永真』，只需找到一个使其为假的解释（反模型）；若全部为真，还需一般性论证才能断言永真。",
      legend: [
        ["永真 ⊤", "须对一切非空论域与解释论证"],
        ["反模型", "使公式为假的解释 ⟹ 非永真"],
        ["可满足 ◇", "存在使其真的解释"],
        ["∀x→∃x", "全称蕴含存在（非空论域）"],
        ["¬∀ ↔ ∃¬", "量词否定律"]
      ],
      domainLabel: "D = {a, b}",
      cases: [
        { label: "∀xP(x) → ∃xP(x)", formula: "∀x P(x)  →  ∃x P(x)", domain: ["a", "b"],
          insight: "非空论域下『所有』必能推出『存在』——永真式，找不到反模型。",
          proof: "任取非空论域 D 与谓词 P：若 ∀xP(x) 为真，任取 a∈D（D 非空），有 P(a) 为真，故 ∃xP(x) 为真；若 ∀xP(x) 为假，蕴含式前件假而整体为真。",
          evalFn: function (P, D) { return (!D.every(function (x) { return P(x); })) || D.some(function (x) { return P(x); }); } },
        { label: "∃xP(x) → ∀xP(x)", formula: "∃x P(x)  →  ∀x P(x)", domain: ["a", "b"],
          insight: "『有些』推不出『所有』：P(a)=F, P(b)=T（或 P(a)=T, P(b)=F）即为反模型——非永真；它又有为真的解释，故为可满足式。",
          evalFn: function (P, D) { return (!D.some(function (x) { return P(x); })) || D.every(function (x) { return P(x); }); } },
        { label: "¬∀xP(x) ↔ ∃x¬P(x)  量词否定", formula: "¬∀x P(x)  ↔  ∃x ¬P(x)", domain: ["a", "b"],
          insight: "『并非都』等价于『存在不』——量词否定律，永真式。",
          proof: "任取非空论域 D 与谓词 P：¬∀xP(x) 为真 ⟺ 并非每个 x 都有 P(x) ⟺ 存在 x 使 P(x) 为假 ⟺ ∃x¬P(x) 为真。两边在任意解释下同真同假，故双条件式永真。",
          evalFn: function (P, D) { var l = !D.every(function (x) { return P(x); }); var r = D.some(function (x) { return !P(x); }); return l === r; } },
        { label: "∀xP(x) ∨ ∀x¬P(x)", formula: "∀x P(x)  ∨  ∀x ¬P(x)", domain: ["a", "b"],
          insight: "『全是 P 或全不是 P』并不总成立：P(a)=T, P(b)=F 即反模型——非永真。注意它与永真的 ∀x(P(x)∨¬P(x)) 不同：∀ 对 ∨ 不能分配。",
          evalFn: function (P, D) { return D.every(function (x) { return P(x); }) || D.every(function (x) { return !P(x); }); } }
      ]
    },
    extend: {
      introStatus: "选择一个公式，在 3 元论域（8 个解释）上逐一枚举：体会有限核验能做什么、不能做什么，以及一阶逻辑有效性的判定边界。",
      legend: [
        ["不可判定", "丘奇定理：无通用算法判定任意公式是否永真"],
        ["半可判定", "永真式必能在有限步内被证明；非永真式未必能被发现"],
        ["枚举", "逐一遍历有限论域上的解释（有限核验）"],
        ["反模型", "一个假解释即严格否定永真"],
        ["∀ / ∃", "对所有 / 存在"]
      ],
      domainLabel: "D = {a, b, c}",
      cases: [
        { label: "∀x(P(x) → P(x))  自反蕴含", formula: "∀x ( P(x) → P(x) )", domain: ["a", "b", "c"],
          insight: "8 个解释皆真，只说明它在本论域上与永真一致。半可判定的『正向』靠的不是枚举解释（无限论域上的解释无法穷尽），而是枚举形式证明：由哥德尔完备性定理，永真式必有证明，逐一枚举证明总能在有限步内找到它。",
          proof: "任取非空论域 D 与谓词 P，对每个 x∈D，P(x)→P(x) 恒为真，故 ∀x(P(x)→P(x)) 为真。",
          evalFn: function (P, D) { return D.every(function (x) { return !P(x) || P(x); }); } },
        { label: "∃xP(x) → ∀xP(x)", formula: "∃x P(x)  →  ∀x P(x)", domain: ["a", "b", "c"],
          insight: "本例有有限反模型（如 P(a)=F, P(b)=F, P(c)=T），一个即可严格否定永真。但一般地，有的非永真公式只有无限论域上的反模型，程序可能永远找不到——所以『非永真』不是半可判定的，半可判定只有单向。",
          evalFn: function (P, D) { return (!D.some(function (x) { return P(x); })) || D.every(function (x) { return P(x); }); } },
        { label: "∀xP(x) ∨ ∃x¬P(x)", formula: "∀x P(x)  ∨  ∃x ¬P(x)", domain: ["a", "b", "c"],
          insight: "只含一元谓词、不含等号的公式属于可判定片段（含 k 个一元谓词时，只需检查元素个数不超过 2^k 的论域）；不可判定性来自二元及以上谓词。例如 ¬(∀x¬R(x,x) ∧ ∀x∀y∀z(R(x,y)∧R(y,z)→R(x,z)) ∧ ∀x∃yR(x,y)) 在一切有限论域上皆真，却在自然数集上取 R 为 < 时为假——有限样本全真 ≠ 永真。",
          proof: "任取非空论域 D 与谓词 P：若 ∀xP(x) 为真，析取式为真；否则存在 x 使 P(x) 为假，即 ∃x¬P(x) 为真。故本式永真（它正是量词否定律 ¬∀xP(x) → ∃x¬P(x) 的变形）。",
          evalFn: function (P, D) { return D.every(function (x) { return P(x); }) || D.some(function (x) { return !P(x); }); } }
      ]
    }
  };

  function computeCase(c) {
    var D = c.domain, n = D.length, N = 1 << n;
    var interps = [];
    for (var m = 0; m < N; m++) {
      var assign = {};
      for (var k = 0; k < n; k++) assign[D[k]] = !!(m & (1 << (n - 1 - k)));
      var P = (function (a) { return function (x) { return a[x]; }; })(assign);
      var val = c.evalFn(P, D);
      var bits = D.map(function (x) { return assign[x] ? "T" : "F"; }).join("");
      interps.push({ m: m, assign: assign, val: val, bits: bits });
    }
    var trues = interps.filter(function (i) { return i.val; }).length;
    var type = trues === N ? "valid" : trues === 0 ? "contra" : "sat";
    var counter = null, witness = null;
    for (var j = 0; j < interps.length; j++) { if (!interps[j].val && counter === null) counter = j; if (interps[j].val && witness === null) witness = j; }
    return { domain: D, interps: interps, total: N, trues: trues, falses: N - trues, type: type, counter: counter, witness: witness };
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
  var TYPE = {
    valid: { key: "valid", label: "各解释皆真，与永真式一致", chip: "与永真式 ⊤ 一致" },
    contra: { key: "contra", label: "各解释皆假，与永假式一致", chip: "与永假式 ⊥ 一致" },
    sat: { key: "sat", label: "可满足式 ◇（非永真，也非永假）", chip: "可满足式 ◇（非永真）" }
  };

  function run() {
    var levelKey = global.SYMBOLIZE_LEVEL || "basic";
    var cfg = LEVELS[levelKey] || LEVELS.basic;

    var controlsEl = byId("controls");
    var formulaEl = byId("fiFormula");
    var interpsEl = byId("fiInterps");
    var evalEl = byId("fiEval");
    var chartEl = byId("fiChart");
    var verdictEl = byId("fiVerdict");
    if (!controlsEl || !formulaEl) return;

    var fc = null, cur = null;
    var p = 0, manualFocus = null, autoTimer = null;
    var interpEls = [], cellEls = [];
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.cases.map(function (c, i) { return '<option value="' + i + '">' + esc(c.label) + '</option>'; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label><span>选择公式</span><small>谓词公式</small></label>' +
          '<select id="fiSelect">' + opts + '</select></div>' +
        '<div class="control-group"><label><span>逐一核验解释</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button class="sym-step-btn" id="fiPrev">◀ 上一步</button>' +
            '<button class="sym-step-btn sym-primary" id="fiNext">下一步 ▶</button>' +
            '<button class="sym-step-btn" id="fiAuto">⏵ 自动播放</button>' +
            '<button class="sym-step-btn sym-ghost" id="fiReset">↺ 重置</button>' +
          '</div>' +
          '<div class="sym-speed"><span>慢</span><input type="range" id="fiSpeed" min="1" max="100" value="55" aria-label="自动播放速度"><span>快</span></div>' +
        '</div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="fiProgBar"></i></div>' +
          '<span class="sym-progress-num" id="fiProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="fiStatus"></div></div>';
      statusEl = byId("fiStatus"); progBar = byId("fiProgBar"); progNum = byId("fiProgNum");
      prevBtn = byId("fiPrev"); nextBtn = byId("fiNext"); autoBtn = byId("fiAuto");
      byId("fiSelect").addEventListener("change", function (e) { loadCase(+e.target.value); });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("fiReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
      byId("fiSpeed").addEventListener("input", function () { if (autoTimer) { stopAuto(); toggleAuto(); } });
    }
    function autoDelay() { var sp = byId("fiSpeed"); return Math.max(280, 1500 - Number(sp ? sp.value : 55) * 12); }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      box.innerHTML = '<div class="legend-title">类型与符号说明</div><div class="legend-grid">' +
        cfg.legend.map(function (it) { return '<div class="legend-item"><span class="sym">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + '</span></div>'; }).join("") + '</div>';
    }

    function loadCase(idx) {
      stopAuto();
      fc = cfg.cases[idx];
      cur = computeCase(fc);
      p = 0; manualFocus = null;
      renderFormula(); renderInterps(); renderChart();
      evalEl.innerHTML = "";
      render();
    }

    function renderFormula() {
      formulaEl.innerHTML = '<div class="ff-f">' + esc(fc.formula) + '</div>' +
        '<div class="ff-meta">论域 <code>' + esc(cfg.domainLabel) + '</code>，谓词 <b>P</b>（一元）；共 <b>' + cur.total + '</b> 个解释（' + cur.domain.length + ' 个对象的真值赋值）。逐一核验每个解释下公式的真值。</div>';
    }

    function renderInterps() {
      interpsEl.innerHTML = "";
      interpEls = cur.interps.map(function (it, i) {
        var assignStr = cur.domain.map(function (x) { return "P(" + x + ")=" + (it.assign[x] ? "T" : "F"); }).join("  ");
        var d = document.createElement("div");
        d.className = "fi-interp " + (it.val ? "v-true" : "v-false");
        d.dataset.row = i;
        d.innerHTML = '<span class="fi-assign">I' + (i + 1) + ': ' + esc(assignStr) + '</span>' +
          '<span class="fi-val">公式 = ' + (it.val ? "真 T" : "假 F") + '</span>';
        d.addEventListener("click", function () { clickRow(i); });
        interpsEl.appendChild(d);
        return d;
      });
    }

    function renderChart() {
      chartEl.innerHTML = "";
      chartNarrow = isNarrow();
      var N = cur.interps.length, cols = Math.min(chartNarrow ? 2 : 4, N), rowsN = Math.ceil(N / cols);
      var VW = chartNarrow ? 380 : 760, pad = 12, cw = (VW - pad * 2) / cols, chh = 64;
      var H = pad * 2 + rowsN * chh;
      var svg = svgEl("svg", { id: "fiChart", viewBox: "0 0 " + VW + " " + H, width: "100%", height: H });
      var g = svgEl("g"); svg.appendChild(g);
      cellEls = cur.interps.map(function (it, i) {
        var col = i % cols, row = Math.floor(i / cols);
        var x = pad + col * cw, y = pad + row * chh;
        var cg = svgEl("g"); cg.setAttribute("class", "fi-cell"); cg.dataset.row = i;
        var rect = svgEl("rect", { x: x + 5, y: y + 5, width: cw - 10, height: chh - 14, rx: 9,
          fill: it.val ? "#cdebd9" : "#f6d3ce", stroke: it.val ? "#2f7d57" : "#d63b1d", "stroke-width": 1.6 });
        var t1 = svgEl("text", { x: x + cw / 2, y: y + 26, "text-anchor": "middle", fill: "#2c1810", "font-size": 14, "font-weight": "800", "font-family": "JetBrains Mono, monospace" }); t1.textContent = "I" + (i + 1) + " · " + it.bits;
        var t2 = svgEl("text", { x: x + cw / 2, y: y + 45, "text-anchor": "middle", fill: it.val ? "#1d6b43" : "#97180f", "font-size": 13, "font-weight": "800" }); t2.textContent = it.val ? "真 T" : "假 F";
        cg.appendChild(rect); cg.appendChild(t1); cg.appendChild(t2);
        cg.addEventListener("click", function () { clickRow(i); });
        g.appendChild(cg);
        return { g: cg, rect: rect };
      });
      chartEl.appendChild(svg);
    }

    var chartNarrow = null;
    function isNarrow() { var w = chartEl.clientWidth || (global.innerWidth || 1024); return w < 560; }
    global.addEventListener("resize", function () { if (cur && isNarrow() !== chartNarrow) { renderChart(); render(); } });

    function total() { return cur.interps.length + 1; }
    function step(dir) { manualFocus = null; p = Math.max(0, Math.min(total(), p + dir)); render(); }
    function clickRow(i) {
      stopAuto();
      var n = cur.interps.length;
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
      var n = cur.interps.length, T = n + 1;
      var shown = Math.min(p, n);
      var verdictShown = p > n;
      var stepRow = (p >= 1 && p <= n) ? p - 1 : null;
      var focusRow = (manualFocus != null) ? manualFocus : stepRow;

      for (var k = 0; k < n; k++) {
        var revealed = k < shown || verdictShown;
        var isCur = (k === focusRow);
        if (interpEls[k]) { interpEls[k].classList.toggle("sym-pending", !revealed); interpEls[k].classList.toggle("sym-cur", isCur); }
        if (cellEls[k]) { cellEls[k].g.classList.toggle("sym-pending", !revealed); cellEls[k].g.classList.toggle("sym-cur", isCur); }
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
      if (focusRow == null && !verdictShown) return '<span style="color:#6b4a38">点「下一步」逐一核验解释。每个解释给谓词 P 一组真值赋值，算出公式在该解释下的真/假。</span>';
      if (focusRow == null && verdictShown) {
        return '已核验全部 <b>' + cur.total + '</b> 个解释：' + cur.trues + ' 真 / ' + cur.falses + ' 假。下方给出类型判定。可点任意解释回看。';
      }
      var it = cur.interps[focusRow];
      var assignStr = cur.domain.map(function (x) { return "P(" + x + ")=" + (it.assign[x] ? "T" : "F"); }).join(", ");
      return '<div>解释 <span class="ev-i">I' + (focusRow + 1) + '：' + esc(assignStr) + '</span></div>' +
        '<div style="margin-top:4px">公式在该解释下 = ' + (it.val ? '<span class="ev-t">真 T</span>' : '<span class="ev-f">假 F（反模型：说明非永真）</span>') + '</div>';
    }

    function renderVerdict(show) {
      var t = TYPE[cur.type];
      function stat(name, val) { return '<div class="fi-stat ' + (show ? "" : "sym-pending") + '"><div class="s-name">' + name + '</div><div class="s-val">' + (show ? val : "…") + '</div></div>'; }
      var stats = '<div class="fi-stats">' + stat("解释总数", cur.total) + stat("为真解释", cur.trues) + stat("为假解释", cur.falses) + '</div>';
      var dl = esc(cfg.domainLabel), reason;
      if (cur.type === "valid") reason = "在 " + dl + " 上全部 " + cur.total + " 个解释下公式皆<b>真</b>，与<b>永真式</b>一致。但这只是有限核验：严格断言永真，需对<b>任意非空论域</b>上的任意解释论证（见下方论证）。永真式也是可满足式。";
      else if (cur.type === "contra") reason = "在 " + dl + " 上全部 " + cur.total + " 个解释下公式皆<b>假</b>，与<b>永假式</b>一致。但这只是有限核验：严格断言永假，需对<b>任意非空论域</b>上的任意解释论证（见下方论证）。";
      else reason = "存在为真解释（I" + (cur.witness + 1) + "）⟹ 可满足、非永假；又存在<b>反模型</b>（I" + (cur.counter + 1) + " 使其为假）⟹ <b>非永真</b>。一个反模型即可严格否定永真，故本式是<b>可满足式</b>（且非永真）。";
      var concl = '<div class="fi-conclusion ' + (show ? "k-" + t.key : "sym-pending") + '">' +
        '<span class="c-chip">' + (show ? "类型判定：" + esc(t.chip) : "类型判定：待核验") + '</span>' +
        '<div class="c-reason">' + (show ? reason : "逐一核验完成后给出类型…") + '</div>' +
        (show && fc.proof ? '<div class="c-proof"><b>一般性论证：</b>' + esc(fc.proof) + '</div>' : "") +
        (show && fc.insight ? '<div class="c-insight">💡 ' + esc(fc.insight) + '</div>' : "") + '</div>';
      verdictEl.innerHTML = stats + concl;
    }

    function statusHTML(pp, focusRow, verdictShown) {
      if (pp === 0) return cfg.introStatus;
      if (focusRow != null) {
        var it = cur.interps[focusRow];
        return '解释 <b>I' + (focusRow + 1) + '</b>（' + esc(it.bits) + '）下，公式 = ' + (it.val ? '真 T' : '<b>假 F（反模型）</b>') + '。';
      }
      if (verdictShown) {
        var tail = cur.type === "sat" ? "（找到反模型，结论严格）" : "（严格结论见一般性论证）";
        return '✅ <b>' + esc(TYPE[cur.type].label) + '</b>' + tail + '　可点任意解释 / 图格回看。';
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
