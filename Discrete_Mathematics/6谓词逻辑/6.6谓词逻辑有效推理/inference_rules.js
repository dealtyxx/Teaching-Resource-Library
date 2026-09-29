/* =====================================================================
 * 6.6 谓词逻辑有效推理 —— 三层统一交互引擎（谓词推理规则步进器）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与本章其它小节同形）：选择推证 → 逐步演证
 *   点一步推出一行 → 看反馈（用了什么规则、引用了哪些前提行）
 *   → 看推证记录中当前行高亮、被引用行高亮 → 看推理图节点 / 依赖边高亮
 *   → 抵达结论行即证毕 QED。完成后可点任意行 / 图节点回看依赖。
 *
 * 难度梯度：
 *   基础层：全称指定 UI + 假言推理，从普遍原则推个别情形（苏格拉底三段论，2~4 行）。
 *   进阶层：四条量词规则 UI/EI/UG/EG 及其限制（先 EI 后 UI、UG 只推广任意变项，6~9 行）。
 *   拓展层：专家系统前向链 / 后向链 + 归结反演（含 Skolem 常项 / 函数与合一，5~8 行）。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* 每个推证：lines[] 顺序排列；前提行 refs:[]；派生行 refs 为所引用行的 0 基下标。
   * query:true 表示后向链中的「待证目标 / 子目标」行；与规则「¬结论」行一样，不列入任务区的前提。
   * 规则约定（与教材一致）：
   *   UI：∀xA(x) ⊢ A(y) 或 A(c)（代入项不得被 A 中量词捕获）；
   *   EI：∃xA(x) ⊢ A(c)，c 必须是此前未出现的新常项 —— 同一常项既要 EI 又要 UI 时，先 EI 后 UI；
   *   UG：A(y) ⊢ ∀xA(x)，y 须为任意个体变项：不在前提中自由出现，也不能是 EI 常项所依赖的变项；
   *   EG：A(c) ⊢ ∃xA(x)，x 不得在 A(c) 中出现。 */
  var LEVELS = {
    basic: {
      introStatus: "选择一个推证，点「下一步」逐行推演：用全称指定 UI 把普遍原则落到个别个体，再用假言推理 MP 得出结论。",
      legend: [
        ["UI", "全称指定：∀xA(x) ⊢ A(c)"],
        ["前提", "引入前提（P 规则）"],
        ["MP", "假言推理：A→B, A ⊢ B"],
        ["c / a", "个体常项：论域中确定的个体"],
        ["⊢", "由前提推出结论"]
      ],
      cases: [
        { label: "∀xP(x) ⊢ P(a)（UI 最小例）", goal: "P(a)", goalDesc: "从『所有个体都具有性质 P』推出『个体 a 具有性质 P』。",
          lines: [
            { f: "∀x P(x)", rule: "前提", refs: [], note: "引入前提：论域中所有个体都满足 P。" },
            { f: "P(a)", rule: "UI", refs: [0], note: "全称指定：既然对每个个体都成立，对论域中的个体 a 当然也成立。" }
          ] },
        { label: "苏格拉底三段论", goal: "会死(苏格拉底)", goalDesc: "所有人都会死，苏格拉底是人，所以苏格拉底会死。",
          lines: [
            { f: "∀x ( 人(x) → 会死(x) )", rule: "前提", refs: [], note: "大前提：所有人都会死。全称量词配蕴含 →。" },
            { f: "人(苏格拉底)", rule: "前提", refs: [], note: "小前提：苏格拉底是人（个体常项 苏格拉底）。" },
            { f: "人(苏格拉底) → 会死(苏格拉底)", rule: "UI", refs: [0], note: "全称指定：把普遍规则用到个体 苏格拉底。" },
            { f: "会死(苏格拉底)", rule: "MP", refs: [2, 1], note: "假言推理：由第 3 行与第 2 行得出结论——苏格拉底会死。" }
          ] },
        { label: "∀x(P(x)→Q(x)), P(a) ⊢ Q(a)（一般形式）", goal: "Q(a)", goalDesc: "上一例的一般形式：把普遍规则用到个体 a，再假言推理。",
          lines: [
            { f: "∀x ( P(x) → Q(x) )", rule: "前提", refs: [], note: "引入前提（普遍规则）。" },
            { f: "P(a)", rule: "前提", refs: [], note: "引入前提（个别事实）。" },
            { f: "P(a) → Q(a)", rule: "UI", refs: [0], note: "全称指定：把规则用到个体 a。" },
            { f: "Q(a)", rule: "MP", refs: [2, 1], note: "假言推理：由 P(a)→Q(a) 与 P(a) 得 Q(a)。" }
          ] },
        { label: "党员模范带头（三段论）", goal: "应模范带头(张三)", goalDesc: "从普遍原则推出：党员张三应模范带头。",
          lines: [
            { f: "∀x ( 党员(x) → 应模范带头(x) )", rule: "前提", refs: [], note: "普遍原则：所有党员都应模范带头。" },
            { f: "党员(张三)", rule: "前提", refs: [], note: "个别事实：张三是党员。" },
            { f: "党员(张三) → 应模范带头(张三)", rule: "UI", refs: [0], note: "全称指定：把原则落实到张三。" },
            { f: "应模范带头(张三)", rule: "MP", refs: [2, 1], note: "假言推理：由规则与事实推出——张三应模范带头。" }
          ] }
      ]
    },
    advanced: {
      introStatus: "选择一个推证，逐行演证：综合运用 UI、EI、UG、EG 四条量词规则，严守「EI 用新常项、先 EI 后 UI、UG 只推广任意变项」等限制。",
      legend: [
        ["UI", "全称指定：∀xA(x) ⊢ A(y) 或 A(c)"],
        ["EI", "存在指定：∃xA(x) ⊢ A(c)，c 为新常项"],
        ["UG", "全称推广：A(y) ⊢ ∀xA(x)，y 任意"],
        ["EG", "存在推广：A(c) ⊢ ∃xA(x)"],
        ["次序", "先 EI 后 UI：EI 须用新常项，再对同一常项 UI"],
        ["UG 限", "y 不在前提中自由出现，不能推广 EI 常项"],
        ["MP", "假言推理；HS 为假言三段论"]
      ],
      cases: [
        { label: "∀x(P(x)→Q(x)), ∃xP(x) ⊢ ∃xQ(x)", goal: "∃x Q(x)", goalDesc: "先 EI 引入新常项 c，再对同一 c 做 UI，最后 EG。",
          lines: [
            { f: "∀x ( P(x) → Q(x) )", rule: "前提", refs: [], note: "引入前提（普遍规则）。" },
            { f: "∃x P(x)", rule: "前提", refs: [], note: "引入前提（存在断言）。" },
            { f: "P(c)", rule: "EI", refs: [1], note: "存在指定：引入此前未出现的新常项 c。必须先做 EI——若先对 c 做 UI，c 就已出现，EI 不能再用 c。" },
            { f: "P(c) → Q(c)", rule: "UI", refs: [0], note: "全称指定：全称前提对任何个体都成立，可以对同一常项 c 实例化。" },
            { f: "Q(c)", rule: "MP", refs: [3, 2], note: "假言推理：由 P(c)→Q(c) 与 P(c) 得 Q(c)。" },
            { f: "∃x Q(x)", rule: "EG", refs: [4], note: "存在推广：由 Q(c) 得 ∃xQ(x)。" }
          ] },
        { label: "∀x(P(x)→Q(x)), ∀xP(x) ⊢ ∀xQ(x)", goal: "∀x Q(x)", goalDesc: "UI 取任意个体变项 y，推出 Q(y)，再 UG 推广。",
          lines: [
            { f: "∀x ( P(x) → Q(x) )", rule: "前提", refs: [], note: "引入前提。" },
            { f: "∀x P(x)", rule: "前提", refs: [], note: "引入前提。" },
            { f: "P(y) → Q(y)", rule: "UI", refs: [0], note: "全称指定到个体变项 y（y 代表任意个体）。" },
            { f: "P(y)", rule: "UI", refs: [1], note: "全称指定到同一变项 y。" },
            { f: "Q(y)", rule: "MP", refs: [2, 3], note: "假言推理得 Q(y)。" },
            { f: "∀x Q(x)", rule: "UG", refs: [4], note: "全称推广：y 不在前提中自由出现，也不是 EI 引入的常项，Q(y) 对任意个体成立，可推广为 ∀xQ(x)。" }
          ] },
        { label: "三段论：所有人会死，所有哲学家是人", goal: "∀x ( 哲学家(x) → 会死(x) )", goalDesc: "全称结论（Barbara 式三段论）：UI 取任意 y，假言三段论 HS 连接，再 UG。",
          lines: [
            { f: "∀x ( 人(x) → 会死(x) )", rule: "前提", refs: [], note: "大前提：所有人都会死。" },
            { f: "∀x ( 哲学家(x) → 人(x) )", rule: "前提", refs: [], note: "小前提：所有哲学家都是人。" },
            { f: "哲学家(y) → 人(y)", rule: "UI", refs: [1], note: "全称指定到任意个体变项 y。" },
            { f: "人(y) → 会死(y)", rule: "UI", refs: [0], note: "全称指定到同一变项 y。" },
            { f: "哲学家(y) → 会死(y)", rule: "HS", refs: [2, 3], note: "假言三段论：A→B, B→C ⊢ A→C。" },
            { f: "∀x ( 哲学家(x) → 会死(x) )", rule: "UG", refs: [4], note: "全称推广：y 是任意的（不在前提中自由出现），故结论对所有个体成立。若这里用常项『苏格拉底』则不能 UG。" }
          ] },
        { label: "∀x(F(x)→G(x)), ∃x(F(x)∧H(x)) ⊢ ∃x(G(x)∧H(x))", goal: "∃x ( G(x) ∧ H(x) )", goalDesc: "所有 F 都是 G，有的 F 是 H ⊢ 有的 G 是 H：先 EI 后 UI 的典型例题。",
          lines: [
            { f: "∀x ( F(x) → G(x) )", rule: "前提", refs: [], note: "引入前提（全称）。" },
            { f: "∃x ( F(x) ∧ H(x) )", rule: "前提", refs: [], note: "引入前提（存在）。" },
            { f: "F(c) ∧ H(c)", rule: "EI", refs: [1], note: "存在指定：先 EI，引入新常项 c。" },
            { f: "F(c) → G(c)", rule: "UI", refs: [0], note: "全称指定到同一常项 c（UI 对任何个体都可用）。" },
            { f: "F(c)", rule: "化简", refs: [2], note: "合取化简：A∧B ⊢ A。" },
            { f: "H(c)", rule: "化简", refs: [2], note: "合取化简：A∧B ⊢ B。" },
            { f: "G(c)", rule: "MP", refs: [3, 4], note: "假言推理：由 F(c)→G(c) 与 F(c) 得 G(c)。" },
            { f: "G(c) ∧ H(c)", rule: "合取", refs: [6, 5], note: "合取引入：A, B ⊢ A∧B。" },
            { f: "∃x ( G(x) ∧ H(x) )", rule: "EG", refs: [7], note: "存在推广：c 是 EI 常项，只能 EG，不能 UG 推出 ∀x(G(x)∧H(x))。" }
          ] }
      ]
    },
    extend: {
      introStatus: "选择一个机械推理任务，逐步执行：专家系统前向链 / 后向链，或归结反演（Skolem 化 + 合一，导出空子句）。",
      legend: [
        ["前向链", "数据驱动：事实匹配规则前件 → 推出新事实"],
        ["后向链", "目标驱动：目标匹配规则后件 → 转证前件"],
        ["归结", "互补文字 + 合一 → 归结式"],
        ["合一", "代入 x := c 使两文字相同"],
        ["Skolem", "∃ 化为常项或函数（只保持可满足性）"],
        ["□", "空子句：子句集不可满足 ⇒ 结论成立"]
      ],
      cases: [
        { label: "专家系统 · 前向链推理", goal: "需检测(张三)", goalDesc: "数据驱动：事实触发规则 1，新事实再触发规则 2，链式推出结论。",
          lines: [
            { f: "∀x ( 发烧(x) → 疑似(x) )", rule: "规则", refs: [], note: "知识库规则 1。" },
            { f: "∀x ( 疑似(x) → 需检测(x) )", rule: "规则", refs: [], note: "知识库规则 2。" },
            { f: "发烧(张三)", rule: "事实", refs: [], note: "知识库中的事实。" },
            { f: "发烧(张三) → 疑似(张三)", rule: "UI", refs: [0], note: "事实与规则 1 前件匹配（合一 x := 张三），即把规则 1 实例化到张三。" },
            { f: "疑似(张三)", rule: "前向链(MP)", refs: [3, 2], note: "前向链：规则 1 被触发，新事实加入知识库。" },
            { f: "疑似(张三) → 需检测(张三)", rule: "UI", refs: [1], note: "新事实与规则 2 前件匹配，实例化规则 2。" },
            { f: "需检测(张三)", rule: "前向链(MP)", refs: [5, 4], note: "前向链：规则 2 被触发，推出结论。" }
          ] },
        { label: "专家系统 · 后向链推理", goal: "需检测(张三)", goalDesc: "目标驱动：从待证目标出发，匹配规则后件，逐层转为子目标，直到落到事实。",
          lines: [
            { f: "∀x ( 发烧(x) → 疑似(x) )", rule: "规则", refs: [], note: "知识库规则 1。" },
            { f: "∀x ( 疑似(x) → 需检测(x) )", rule: "规则", refs: [], note: "知识库规则 2。" },
            { f: "发烧(张三)", rule: "事实", refs: [], note: "知识库中的事实。" },
            { f: "? 需检测(张三)", rule: "目标", refs: [], query: true, note: "提出待证目标（查询）。" },
            { f: "? 疑似(张三)", rule: "后向链", refs: [3, 1], query: true, note: "目标与规则 2 后件合一（x := 张三），转而去证规则 2 的前件。" },
            { f: "? 发烧(张三)", rule: "后向链", refs: [4, 0], query: true, note: "子目标与规则 1 后件合一，再转证规则 1 的前件。" },
            { f: "发烧(张三) ✓", rule: "匹配事实", refs: [5, 2], note: "子目标与知识库事实一致，得到证实。" },
            { f: "需检测(张三)", rule: "回代", refs: [6, 4, 3], note: "子目标链全部满足，逐层回代：疑似(张三) 成立，于是 需检测(张三) 成立。" }
          ] },
        { label: "归结反演 · 苏格拉底", goal: "会死(苏格拉底)", goalDesc: "把前提化为子句，加入否定的结论，归结出空子句。",
          lines: [
            { f: "{ ¬人(x), 会死(x) }", rule: "前提子句", refs: [], note: "前提 ∀x(人(x)→会死(x)) ≡ ∀x(¬人(x)∨会死(x))，化为子句。" },
            { f: "{ 人(苏格拉底) }", rule: "前提子句", refs: [], note: "前提事实子句。" },
            { f: "{ ¬会死(苏格拉底) }", rule: "¬结论", refs: [], note: "反演：把待证结论取否定，加入子句集。" },
            { f: "{ 会死(苏格拉底) }", rule: "归结", refs: [0, 1], note: "归结：合一 x := 苏格拉底，消去互补文字 ¬人 / 人。" },
            { f: "□（空子句）", rule: "归结", refs: [2, 3], note: "与 ¬会死(苏格拉底) 归结得空子句：子句集不可满足，故结论成立。" }
          ] },
        { label: "归结反演 · 含 ∃（Skolem 常项）", goal: "∃x Q(x)", goalDesc: "∃ 经 Skolem 化为新常项 c，归结出空子句。",
          lines: [
            { f: "{ ¬P(x), Q(x) }", rule: "前提子句", refs: [], note: "前提 ∀x(P(x)→Q(x)) 化为子句。" },
            { f: "{ P(c) }", rule: "Skolem子句", refs: [], note: "前提 ∃xP(x) 经 Skolem 化：用新常项 c 代替 x。Skolem 化只保持可满足性（不保持等价），反演只需判定不可满足，故可用。" },
            { f: "{ ¬Q(y) }", rule: "¬结论", refs: [], note: "反演：¬∃xQ(x) ≡ ∀x¬Q(x)，化为子句（变元改名为 y，与其他子句分离）。" },
            { f: "{ Q(c) }", rule: "归结", refs: [0, 1], note: "归结：合一 x := c，消去 ¬P / P。" },
            { f: "□（空子句）", rule: "归结", refs: [2, 3], note: "归结：合一 y := c，得空子句——证毕。" }
          ] },
        { label: "归结反演 · Skolem 函数", goal: "∃y 老师(y, a)", goalDesc: "∀x∃y 中的 y 依赖 x，Skolem 化为函数 f(x)；合一时代入 f(a)。",
          lines: [
            { f: "{ ¬学生(x), 老师(f(x), x) }", rule: "前提子句", refs: [], note: "前提 ∀x(学生(x)→∃y 老师(y,x))：每个学生都有老师。y 依赖于 x，Skolem 化为函数 f(x)。" },
            { f: "{ 学生(a) }", rule: "前提子句", refs: [], note: "前提事实：a 是学生。" },
            { f: "{ ¬老师(z, a) }", rule: "¬结论", refs: [], note: "反演：¬∃y 老师(y,a) ≡ ∀y¬老师(y,a)，变元改名为 z。" },
            { f: "{ 老师(f(a), a) }", rule: "归结", refs: [0, 1], note: "归结：合一 x := a，消去 ¬学生 / 学生。" },
            { f: "□（空子句）", rule: "归结", refs: [2, 3], note: "归结：合一 z := f(a)，得空子句——a 的老师就是 f(a)，结论成立。" }
          ] }
      ]
    }
  };

  function computeCase(c) {
    var lines = c.lines.map(function (ln, i) {
      return {
        i: i, f: ln.f, rule: ln.rule, refs: ln.refs || [], note: ln.note || "",
        isPrem: (ln.refs || []).length === 0,
        isQuery: !!ln.query,
        isFinal: i === c.lines.length - 1,
        isContra: /□|矛盾/.test(ln.f)
      };
    });
    return { goal: c.goal, goalDesc: c.goalDesc, premises: lines.filter(function (l) { return l.isPrem && !l.isQuery && l.rule !== "¬结论"; }), lines: lines };
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
            '<button class="sym-step-btn sym-ghost" id="ipReset">↺ 重置</button>' +
          '</div>' +
          '<div class="sym-speed"><span>慢</span><input type="range" id="ipSpeed" min="1" max="100" value="55" aria-label="自动播放速度"><span>快</span></div>' +
          '</div>' +
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
      byId("ipSpeed").addEventListener("input", function () { if (autoTimer) { stopAuto(); toggleAuto(); } });
    }

    function autoDelay() { var sp = byId("ipSpeed"); return Math.max(280, 1500 - Number(sp ? sp.value : 55) * 12); }

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
      tableEl.innerHTML = '<table class="ip-table"><thead><tr><th>步</th><th>公式 / 子句</th><th>依据（引用行）</th></tr></thead><tbody>' + body + '</tbody></table>';
      rowEls = Array.prototype.slice.call(tableEl.querySelectorAll("tr.ip-row"));
      rowEls.forEach(function (tr, i) { tr.addEventListener("click", function () { clickRow(i); }); });
    }

    function renderGraph() {
      graphEl.innerHTML = "";
      var n = pr.lines.length, VW = 760, pad = 12, rowH = 50, nodeW = 360, nodeH = 36;
      var cx = VW * 0.42, leftArc = cx - nodeW / 2;
      var H = pad * 2 + n * rowH;
      var svg = svgEl("svg", { viewBox: "0 0 " + VW + " " + H, width: "100%", height: H });
      var g = svgEl("g"); svg.appendChild(g);
      function yOf(i) { return pad + i * rowH + nodeH / 2; }

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
      autoTimer = setInterval(function () { if (p >= total()) { stopAuto(); return; } manualFocus = null; p += 1; render(); }, autoDelay());
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
      if (done && l.isFinal) body += '<div style="margin-top:6px;color:#1d6b43;font-weight:800">✅ ' +
        (l.isContra ? '导出空子句，子句集不可满足，故结论 ' + esc(pr.goal) + ' 成立，证毕（QED）。' : '抵达结论 ' + esc(pr.goal) + '，证毕（QED）。') + '</div>';
      return head + body;
    }

    function statusHTML(pp, focusLine, done) {
      if (pp === 0) return cfg.introStatus + (pr.goalDesc ? '<br><b>目标：</b>' + esc(pr.goal) + ' —— ' + esc(pr.goalDesc) : "");
      if (focusLine != null) {
        var l = pr.lines[focusLine];
        var via = l.isPrem ? '（' + esc(l.rule) + '）' : '（' + esc(l.rule) + ' · 引用 ' + refStr(l.refs) + '）';
        var msg = '第 <b>' + (focusLine + 1) + '</b> 行：<b>' + esc(l.f) + '</b> ' + via + '。';
        if (done && l.isFinal) msg = '✅ <b>证毕</b>：' + (l.isContra ? '导出空子句，结论 ' + esc(pr.goal) + ' 得证' : '已推出结论 ' + esc(pr.goal)) + '。可点任意行回看依赖。';
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
