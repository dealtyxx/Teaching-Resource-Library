/* =====================================================================
 * 6.2 谓词公式的解释 —— 三层统一交互引擎（解释求值器）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与本章其它小节同形）：选择解释 + 公式 → 逐步求值
 *   点一步 → 看反馈 → 看公式项高亮、论域对象高亮、量词展开式累计真值 → 得出该解释下的真值。
 *
 * 难度梯度：
 *   基础层：解释的构成（非空论域 D / 个体常项指派 / 谓词赋值），单谓词 P，
 *           ∃ 找见证、∀ 找反例即可定论；可「换个解释」看真值变化。
 *   进阶层：双谓词 P、Q，有限论域上 ∀ 展开为合取、∃ 展开为析取，逐个体累计求值（含数学解释）。
 *   拓展层：同一公式放进多个解释（模型）对照真值，并把解释写成数据库实例、用 SQL 复算。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* ---------- 公式库：body(d) 为 φ(x) 在个体 d 上的真值 ---------- */
  function tm(v) { return v ? "T" : "F"; }
  var FORMULAS = {
    constP: {
      q: null, label: "P(a)", meaning: "个体常项 a 所指的对象满足 P",
      parts: [{ k: "p", t: "P(" }, { k: "c", t: "a" }, { k: "p", t: ")" }],
      bodyTerms: ["p", "c"], body: function (d) { return d.P; }, bodyStr: function (d) { return "P = " + tm(d.P); }
    },
    someP: {
      q: "∃", label: "∃xP(x)", phi: "P(x)", meaning: "论域中存在一个对象满足 P",
      parts: [{ k: "q", t: "∃x" }, { k: "p", t: "P(x)" }],
      bodyTerms: ["p"], body: function (d) { return d.P; }, bodyStr: function (d) { return "P = " + tm(d.P); },
      sql: "SELECT EXISTS (\n  SELECT 1 FROM D WHERE P = 1\n);", sqlNote: "∃xP(x) 为真 ⇔ 存在 P 为真的行。"
    },
    allP: {
      q: "∀", label: "∀xP(x)", phi: "P(x)", meaning: "论域中每个对象都满足 P",
      parts: [{ k: "q", t: "∀x" }, { k: "p", t: "P(x)" }],
      bodyTerms: ["p"], body: function (d) { return d.P; }, bodyStr: function (d) { return "P = " + tm(d.P); },
      sql: "SELECT NOT EXISTS (\n  SELECT 1 FROM D WHERE P = 0\n);", sqlNote: "∀xP(x) 为真 ⇔ 不存在 P 为假的行。"
    },
    impAll: {
      q: "∀", label: "∀x(P(x)→Q(x))", phi: "(P(x)→Q(x))", meaning: "凡满足 P 的对象都满足 Q",
      parts: [{ k: "q", t: "∀x" }, { k: "o", t: "(" }, { k: "p", t: "P(x)" }, { k: "c", t: " → " }, { k: "r", t: "Q(x)" }, { k: "o", t: ")" }],
      bodyTerms: ["p", "c", "r"], body: function (d) { return !d.P || d.Q; },
      bodyStr: function (d) { return "P→Q = " + tm(d.P) + "→" + tm(d.Q); },
      sql: "SELECT NOT EXISTS (\n  SELECT 1 FROM D WHERE P = 1 AND Q = 0\n);", sqlNote: "∀x(P→Q) 为真 ⇔ 不存在『P 真而 Q 假』的反例行。"
    },
    andSome: {
      q: "∃", label: "∃x(P(x)∧Q(x))", phi: "(P(x)∧Q(x))", meaning: "存在一个对象同时满足 P 和 Q",
      parts: [{ k: "q", t: "∃x" }, { k: "o", t: "(" }, { k: "p", t: "P(x)" }, { k: "c", t: " ∧ " }, { k: "r", t: "Q(x)" }, { k: "o", t: ")" }],
      bodyTerms: ["p", "c", "r"], body: function (d) { return d.P && d.Q; },
      bodyStr: function (d) { return "P∧Q = " + tm(d.P) + "∧" + tm(d.Q); },
      sql: "SELECT EXISTS (\n  SELECT 1 FROM D WHERE P = 1 AND Q = 1\n);", sqlNote: "∃x(P∧Q) 为真 ⇔ 存在一行 P、Q 同时为真。"
    }
  };

  /* ---------- 三层数据 ---------- */
  var LEVELS = {
    basic: {
      mode: "short",
      introStatus: "一个解释 I 由三部分构成：非空论域 D、个体常项的指派、谓词的赋值。点「下一步」逐项给出解释，再读出公式真值。",
      formulaKeys: ["someP", "allP", "constP"],
      interpLabel: "选择解释（论域 + 赋值）",
      legend: [
        ["D", "非空论域 · 个体的全体"],
        ["a ↦ 孔子", "个体常项的指派"],
        ["P(x)", "谓词的赋值 · 每个个体取 T/F"],
        ["∃x", "找到一个见证即为真"],
        ["∀x", "找到一个反例即为假"]
      ],
      scenarios: [
        { name: "先秦人物", Pname: "x 是先秦时期的人物", aTo: "a",
          domain: [{ id: "a", label: "孔子", P: true }, { id: "b", label: "屈原", P: true }, { id: "c", label: "李白", P: false }],
          alts: [{ Pname: "x 以诗歌名世", P: [false, true, true], aTo: "c" }, { Pname: "x 是唐代人物", P: [false, false, true], aTo: "b" }] },
        { name: "奋斗的青年", Pname: "x 正在为目标奋斗", aTo: "b",
          domain: [{ id: "a", label: "青年甲", P: true }, { id: "b", label: "青年乙", P: false }, { id: "c", label: "青年丙", P: true }],
          alts: [{ Pname: "x 参加了志愿服务", P: [false, true, false], aTo: "a" }, { Pname: "x 已考取资格证", P: [false, false, false], aTo: "c" }] },
        { name: "岗位奉献", Pname: "x 在岗位上默默奉献", aTo: "b",
          domain: [{ id: "a", label: "战士", P: true }, { id: "b", label: "医者", P: true }, { id: "c", label: "教师", P: true }],
          alts: [{ Pname: "x 在医院工作", P: [false, true, false], aTo: "c" }, { Pname: "x 在学校工作", P: [false, false, true], aTo: "a" }] }
      ]
    },
    advanced: {
      mode: "full",
      introStatus: "选择解释与公式，点「下一步」：把量词在有限论域上展开（∀ → 合取，∃ → 析取），逐个体代入求值，累计出公式在该解释下的真值。",
      formulaKeys: ["impAll", "andSome", "allP", "someP"],
      interpLabel: "选择解释（论域 + 赋值）",
      legend: [
        ["∀x φ(x)", "≡ φ(a₁) ∧ … ∧ φ(aₙ)（有限论域）"],
        ["∃x φ(x)", "≡ φ(a₁) ∨ … ∨ φ(aₙ)（有限论域）"],
        ["P→Q", "前件假则真"],
        ["解释 I", "论域 + 谓词赋值"]
      ],
      scenarios: [
        { name: "数的世界", Pname: "x 是偶数", Qname: "x > 1",
          domain: [{ id: "a", label: "1", P: false, Q: false }, { id: "b", label: "2", P: true, Q: true }, { id: "c", label: "3", P: false, Q: true }, { id: "d", label: "4", P: true, Q: true }] },
        { name: "团结·力量", Pname: "x 是团结的集体", Qname: "x 能攻坚克难",
          domain: [{ id: "a", label: "班集体", P: true, Q: true }, { id: "b", label: "科研组", P: true, Q: true }, { id: "c", label: "临时小组", P: false, Q: false }, { id: "d", label: "施工队", P: true, Q: true }] },
        { name: "奋斗·成功", Pname: "x 在奋斗", Qname: "x 已达成目标",
          domain: [{ id: "a", label: "创业者", P: true, Q: true }, { id: "b", label: "追梦学子", P: true, Q: false }, { id: "c", label: "运动员", P: true, Q: true }, { id: "d", label: "旁观者", P: false, Q: false }] }
      ]
    },
    extend: {
      mode: "full", multi: true,
      introStatus: "同一公式放进不同解释（模型）真值可能不同。逐一评估各解释，对照表自动累计；最后把解释写成数据库实例，用 SQL 复算。",
      formulaKeys: ["impAll", "andSome", "allP", "someP"],
      interpLabel: "当前解释（模型）",
      legend: [
        ["模型", "使公式为真的解释"],
        ["实例", "数据库的一个状态 ≅ 一个解释"],
        ["EXISTS", "∃ 的 SQL 形式"],
        ["NOT EXISTS", "∀：不存在反例行"],
        ["可满足", "有解释为真、有解释为假 ⟹ 非永真"]
      ],
      scenarios: [
        { name: "社区·志愿", Pname: "x 是社区志愿者", Qname: "x 参加了本周服务",
          domain: [{ id: "a", label: "王组长", P: true, Q: true }, { id: "b", label: "李大姐", P: true, Q: true }, { id: "c", label: "张同学", P: false, Q: true }] },
        { name: "校园·学风", Pname: "x 是本课程学生", Qname: "x 按时提交作业",
          domain: [{ id: "a", label: "小李", P: true, Q: true }, { id: "b", label: "小明", P: true, Q: false }, { id: "c", label: "助教", P: false, Q: true }] },
        { name: "工程·攻关", Pname: "x 是项目工程师", Qname: "x 参与了技术攻关",
          domain: [{ id: "a", label: "总师", P: true, Q: true }, { id: "b", label: "助理", P: false, Q: false }, { id: "c", label: "技工", P: false, Q: true }] }
      ]
    }
  };

  /* ---------- 纯逻辑：构造步骤 ---------- */
  function evalFormula(f, scen) {
    if (!f.q) return !!f.body(scen.domain.filter(function (d) { return d.id === scen.aTo; })[0]);
    var b = scen.domain.map(f.body);
    return f.q === "∀" ? b.every(Boolean) : b.some(Boolean);
  }

  function buildSteps(level, scen, fk) {
    var f = FORMULAS[fk], D = scen.domain, list = [];
    var hasQ = scen.Qname != null;
    var names = "{ " + D.map(function (d) { return d.label; }).join(", ") + " }";
    if (level.mode === "short") {
      var aObj = D.filter(function (d) { return d.id === scen.aTo; })[0];
      list.push({ reveal: 1, status: "① <b>非空论域</b> D = " + names + "。论域必须非空，量词才有对象可谈。", terms: [], sub: "D = " + names });
      list.push({ reveal: 2, status: "② <b>个体常项的指派</b>：a ↦ " + aObj.label + "。公式中的常项 a 从此指代论域里这个确定的对象。", terms: ["c"], sub: "a ↦ " + aObj.label });
      list.push({ reveal: 3, status: "③ <b>谓词的赋值</b>：P(x)：" + scen.Pname + "。绿色 = P 真，米色 = P 假。三部分齐备，解释 I 就确定了。", terms: ["p"],
        sub: "满足 P 的对象：{ " + (D.filter(function (d) { return d.P; }).map(function (d) { return d.label; }).join(", ") || "（空）") + " }" });
      if (!f.q) {
        var v0 = aObj.P;
        list.push({ reveal: 3, active: aObj.id, status: "读公式 <b>P(a)</b>：a 指派为 <b>" + aObj.label + "</b>，查 P 的赋值得 P(" + aObj.label + ") = " + (v0 ? "真" : "假") + "。不含量词，直接求值。",
          terms: ["p", "c"], sub: "P(a) = P(" + aObj.label + ") = " + tm(v0), checked: [aObj.id], acc: { done: [aObj.id] } });
        list.push({ reveal: 3, verdict: v0, status: "<b>结论：P(a) 在该解释下为" + (v0 ? "真" : "假") + "。</b>换一个指派（例如 a ↦ 另一个对象）或换一组赋值，真值就可能改变。",
          terms: ["p", "c"], sub: "P(a) = " + tm(v0), checked: [aObj.id], acc: { done: [aObj.id] } });
        return list;
      }
      list.push({ reveal: 3, status: f.q === "∃"
        ? "读公式 <b>∃xP(x)</b>：论域中<b>是否存在</b>一个对象满足 P？找到一个<b>见证</b>即为真。"
        : "读公式 <b>∀xP(x)</b>：论域中<b>是否每个</b>对象都满足 P？找到一个<b>反例</b>即为假。",
        terms: ["q"], sub: "量词 " + f.q + "x 的辖域是 P(x)，要在整个论域 D 上检验。" });
      var result = f.q === "∀", done = [];
      for (var i = 0; i < D.length; i++) {
        var d = D[i], hit = f.q === "∃" ? d.P : !d.P;
        done = done.concat([d.id]);
        if (hit) {
          result = f.q === "∃";
          list.push({ reveal: 3, active: d.id, checked: done.slice(), acc: { done: done.slice(), key: d.id },
            status: "检验 <b>" + d.label + "</b>：P(" + d.label + ") = " + (d.P ? "真" : "假") + "。<b>找到" + (f.q === "∃" ? "见证" : "反例") + "！</b>" + (f.q === "∃" ? "∃ 一真即真" : "∀ 一假即假") + "，结论已定，其余对象不必再查。",
            terms: ["q", "p"], sub: "P(" + d.label + ") = " + tm(d.P) + " ⟹ " + f.label + " = " + tm(result) });
          break;
        }
        list.push({ reveal: 3, active: d.id, checked: done.slice(), acc: { done: done.slice() },
          status: "检验 <b>" + d.label + "</b>：P(" + d.label + ") = " + (d.P ? "真" : "假") + "，" + (f.q === "∃" ? "还不是见证，继续找……" : "暂时成立，继续检验……"),
          terms: ["q", "p"], sub: "P(" + d.label + ") = " + tm(d.P) });
      }
      list.push({ reveal: 3, verdict: result, checked: done.slice(), acc: { done: done.slice(), key: list[list.length - 1].acc.key },
        status: "<b>结论：" + f.label + " 在该解释下为" + (result ? "真" : "假") + "。</b>" + (f.q === "∃" ? (result ? "有见证。" : "全部检验完也没有见证。") : (result ? "全部检验完没有反例。" : "有反例。")) + "点「↻ 换个解释」换一组谓词赋值与常项指派，看同一公式真值是否改变。",
        terms: ["q", "p"], sub: f.label + " = " + tm(result) });
      return list;
    }

    /* 进阶 / 拓展：全展开 + 累计 */
    list.push({ reveal: 3, status: "给定解释 <b>" + scen.name + "</b>：论域 D = " + names + "；P(x)：" + scen.Pname + (hasQ ? "；Q(x)：" + scen.Qname : "") + "。",
      terms: [], sub: "D = " + names });
    list.push({ reveal: 3, expand: true, status: "量词展开：在有限论域上，<b>" + f.label + "</b> 等价于把 φ(x) = " + f.phi + " 对每个个体做" + (f.q === "∀" ? "<b>合取 ∧</b>（全真才真）" : "<b>析取 ∨</b>（一真即真）") + "。含义：" + f.meaning + "。",
      terms: ["q"], sub: f.label + " ≡ " + D.map(function (d) { return "φ(" + d.label + ")"; }).join(f.q === "∀" ? " ∧ " : " ∨ ") });
    var run = f.q === "∀", dn = [];
    for (var j = 0; j < D.length; j++) {
      var e = D[j], b = f.body(e);
      run = f.q === "∀" ? (run && b) : (run || b);
      dn = dn.concat([e.id]);
      list.push({ reveal: 3, expand: true, active: e.id, checked: dn.slice(), acc: { done: dn.slice(), cur: e.id, run: run },
        status: "代入 <b>" + e.label + "</b>：" + f.bodyStr(e) + " = " + (b ? "真" : "假") + "，并入" + (f.q === "∀" ? "合取" : "析取") + "后累计 = <b>" + (run ? "真" : "假") + "</b>。",
        terms: ["q"].concat(f.bodyTerms), sub: "φ(" + e.label + ") = " + f.bodyStr(e) + " = " + tm(b) });
    }
    list.push({ reveal: 3, expand: true, verdict: run, writeResult: true, checked: dn.slice(), acc: { done: dn.slice(), run: run },
      status: "<b>结论：" + f.label + " 在解释「" + scen.name + "」下为" + (run ? "真" : "假") + "。</b>" + (level.multi ? "结果已写入对照表；切换左侧解释继续评估。" : "切换左侧解释，同一公式的真值可能改变——真值总是相对于具体解释而言。"),
      terms: ["q"].concat(f.bodyTerms), sub: f.label + " = " + tm(run) });
    if (level.multi) {
      list.push({ reveal: 3, expand: true, db: true, verdict: run, checked: dn.slice(), acc: { done: dn.slice(), run: run },
        status: "<b>数据库实例 ≅ 解释。</b>把论域写成关系表 D（每行一个个体，列为 P、Q），公式译为 SQL 在该实例上求值——查询结果与逻辑真值一致。",
        terms: f.bodyTerms, sub: f.sqlNote });
    }
    return list;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { FORMULAS: FORMULAS, LEVELS: LEVELS, buildSteps: buildSteps, evalFormula: evalFormula };
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
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function tfHtml(v) { return v ? '<span class="pf-t">真 T</span>' : '<span class="pf-f">假 F</span>'; }

  function run() {
    var levelKey = global.SYMBOLIZE_LEVEL || "basic";
    var cfg = LEVELS[levelKey] || LEVELS.basic;
    var controlsEl = byId("controls");
    var formulaEl = byId("pfFormula"), compEl = byId("pfComp"), svgWrap = byId("pfDomain"), accEl = byId("pfAcc"), verdictEl = byId("pfVerdict");
    if (!controlsEl || !formulaEl) return;

    var scenIdx = 0, scen = clone(cfg.scenarios[0]), fk = cfg.formulaKeys[0];
    var steps = [], p = 0, autoTimer = null, results = {};
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn, speedEl;

    function renderControls() {
      var sOpts = cfg.scenarios.map(function (s, i) { return '<option value="' + i + '">' + esc(s.name) + '</option>'; }).join("");
      var fOpts = cfg.formulaKeys.map(function (k) { return '<option value="' + k + '">' + esc(FORMULAS[k].label) + '</option>'; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label><span>' + esc(cfg.interpLabel) + '</span><small>论域 D + 赋值</small></label>' +
          '<select id="pfScen">' + sOpts + '</select></div>' +
        '<div class="control-group"><label><span>选择公式</span><small>' + (cfg.mode === "short" ? "∃ 找见证 / ∀ 找反例" : "∀=合取 / ∃=析取") + '</small></label>' +
          '<select id="pfForm">' + fOpts + '</select></div>' +
        '<div class="control-group"><label><span>逐步求值</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button class="sym-step-btn" id="pfPrev">◀ 上一步</button>' +
            '<button class="sym-step-btn sym-primary" id="pfNext">下一步 ▶</button>' +
            '<button class="sym-step-btn" id="pfAuto">⏵ 自动播放</button>' +
            '<button class="sym-step-btn sym-ghost" id="pfReset">↺ 重置</button>' +
            (cfg.mode === "short" ? '<button class="sym-step-btn sym-wide" id="pfReinterp">↻ 换个解释（换谓词含义与常项指派）</button>' : "") +
          '</div>' +
          '<div class="sym-speed"><span>慢</span><input type="range" id="pfSpeed" min="1" max="100" value="55" aria-label="自动播放速度"><span>快</span></div>' +
        '</div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="pfProgBar"></i></div><span class="sym-progress-num" id="pfProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label><div class="sym-status" id="pfStatus"></div></div>';
      statusEl = byId("pfStatus"); progBar = byId("pfProgBar"); progNum = byId("pfProgNum");
      prevBtn = byId("pfPrev"); nextBtn = byId("pfNext"); autoBtn = byId("pfAuto"); speedEl = byId("pfSpeed");
      byId("pfScen").addEventListener("change", function (e) { selectScen(+e.target.value); });
      byId("pfForm").addEventListener("change", function (e) { fk = e.target.value; results = {}; rebuild(); });
      prevBtn.addEventListener("click", function () { stopAuto(); go(p - 1); });
      nextBtn.addEventListener("click", function () { stopAuto(); go(p + 1); });
      byId("pfReset").addEventListener("click", function () { stopAuto(); go(0); });
      autoBtn.addEventListener("click", toggleAuto);
      speedEl.addEventListener("input", function () { if (autoTimer) { stopAuto(); toggleAuto(); } });
      var re = byId("pfReinterp");
      if (re) re.addEventListener("click", reinterpret);
    }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      box.innerHTML = '<div class="legend-title">解释与符号说明</div><div class="legend-grid">' +
        cfg.legend.map(function (it) { return '<div class="legend-item"><span class="sym">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + '</span></div>'; }).join("") + '</div>';
    }

    function selectScen(i) {
      scenIdx = i; scen = clone(cfg.scenarios[i]); altIdx = 0;
      var sel = byId("pfScen"); if (sel && +sel.value !== i) sel.value = String(i);
      rebuild();
    }
    /* 换个解释：论域不变，依次换一组「谓词含义 + 常项指派」（均为真实赋值），看同一公式真值是否改变 */
    var altIdx = 0;
    function reinterpret() {
      stopAuto();
      var base = cfg.scenarios[scenIdx], alts = [{ Pname: base.Pname, P: base.domain.map(function (d) { return d.P; }), aTo: base.aTo }].concat(base.alts || []);
      altIdx = (altIdx + 1) % alts.length;
      var A = alts[altIdx], D = scen.domain;
      scen.Pname = A.Pname; scen.aTo = A.aTo;
      D.forEach(function (d, i) { d.P = A.P[i]; });
      steps = buildSteps(cfg, scen, fk);
      go(Math.min(3, steps.length));
      statusEl.innerHTML = "↻ <b>解释已改变！</b>论域不变，P(x) 改为「" + esc(A.Pname) + "」，a ↦ " +
        esc(D.filter(function (d) { return d.id === A.aTo; })[0].label) + "。满足 P 的对象：{ " +
        esc(D.filter(function (d) { return d.P; }).map(function (d) { return d.label; }).join(", ") || "（空）") + " }。继续点「下一步」，看同一公式的真值是否随之改变。";
    }
    function rebuild() { stopAuto(); steps = buildSteps(cfg, scen, fk); go(0); }

    /* ---------- 渲染 ---------- */
    function renderFormula(st) {
      var f = FORMULAS[fk], hot = st.terms || [];
      formulaEl.innerHTML = '<div class="pf-fline">' + f.parts.map(function (pt) {
        return '<span class="pf-term' + (hot.length ? (hot.indexOf(pt.k) >= 0 ? " hot" : " dim") : "") + '">' + esc(pt.t) + '</span>';
      }).join("") + '</div><div class="pf-sub">' + esc(st.sub || "") + '</div>';
    }

    function renderComp(st) {
      var aObj = scen.aTo ? scen.domain.filter(function (d) { return d.id === scen.aTo; })[0] : null;
      var items = [["论域 D", "{ " + scen.domain.map(function (d) { return d.label; }).join(", ") + " }", 1]];
      if (aObj) items.push(["个体常项", "a ↦ " + aObj.label, 2]);
      items.push(["谓词 P", "P(x)：" + scen.Pname, 3]);
      if (scen.Qname) items.push(["谓词 Q", "Q(x)：" + scen.Qname, 3]);
      compEl.innerHTML = items.map(function (it) {
        return '<div class="pf-comp' + (st.reveal >= it[2] ? "" : " sym-pending") + '"><span class="k">' + esc(it[0]) + '</span><span class="v">' + esc(st.reveal >= it[2] ? it[1] : "待给出…") + '</span></div>';
      }).join("");
    }

    function renderGraph(st) {
      svgWrap.innerHTML = "";
      var D = scen.domain, n = D.length, VW = 760, gap = Math.min(180, (VW - 120) / Math.max(1, n - 1));
      var hasQ = !!scen.Qname, colored = st.reveal >= 3;
      var svg = svgEl("svg", { viewBox: "0 0 " + VW + " 200", width: "100%", role: "img", "aria-label": "论域对象与谓词赋值" });
      if (!st.reveal) {
        var t0 = svgEl("text", { x: VW / 2, y: 100, "text-anchor": "middle", fill: "#a48a7c", "font-size": 18 });
        t0.textContent = "论域 D 尚未给出……"; svg.appendChild(t0); svgWrap.appendChild(svg); return;
      }
      var startX = VW / 2 - (n - 1) * gap / 2;
      D.forEach(function (d, i) {
        var x = startX + i * gap, y = 88;
        var g = svgEl("g", { transform: "translate(" + x + "," + y + ")", "class": "pf-node" });
        var isActive = st.active === d.id, isChecked = (st.checked || []).indexOf(d.id) >= 0;
        if (isActive) {
          var pulse = svgEl("circle", { r: 50, fill: "none", stroke: "#ffb400", "stroke-width": 4, opacity: 0.9 });
          pulse.appendChild(svgEl("animate", { attributeName: "r", values: "48;58;48", dur: "1.4s", repeatCount: "indefinite" }));
          g.appendChild(pulse);
        }
        g.appendChild(svgEl("circle", { r: 40, fill: colored ? (d.P ? "#2f7d57" : "#efe2d3") : "#ece0d4", stroke: colored ? (d.P ? "#256346" : "#c9a99a") : "#cbb6a6", "stroke-width": isActive ? 3 : 2 }));
        if (hasQ && colored) g.appendChild(svgEl("circle", { r: 27, fill: "none", stroke: d.Q ? "#2f5f9f" : "#b9c4d8", "stroke-width": 5, "stroke-dasharray": d.Q ? "0" : "5 5" }));
        var name = svgEl("text", { x: 0, y: 1, "text-anchor": "middle", "dominant-baseline": "central", fill: (colored && d.P) ? "#fff" : "#3a2a22", "font-size": d.label.length > 3 ? 13 : 15, "font-weight": "700" });
        name.textContent = d.label; g.appendChild(name);
        if (scen.aTo === d.id && st.reveal >= 2) {
          var tag = svgEl("g", { transform: "translate(-44,-44)" });
          tag.appendChild(svgEl("rect", { x: 0, y: -11, width: 26, height: 22, rx: 11, fill: "#2f5f9f" }));
          var tt = svgEl("text", { x: 13, y: 1, "text-anchor": "middle", "dominant-baseline": "central", fill: "#fff", "font-size": 13, "font-weight": "800", "font-family": "JetBrains Mono, Consolas, monospace" });
          tt.textContent = "a"; tag.appendChild(tt); g.appendChild(tag);
        }
        if (isChecked && !isActive) {
          var tick = svgEl("text", { x: 34, y: -30, "text-anchor": "middle", fill: "#c58a1f", "font-size": 18, "font-weight": "800" });
          tick.textContent = "✓"; g.appendChild(tick);
        }
        if (colored) {
          var badge = svgEl("text", { x: 0, y: 64, "text-anchor": "middle", fill: "#5e4338", "font-size": 12.5, "font-weight": "800", "font-family": "JetBrains Mono, Consolas, monospace" });
          badge.textContent = "P=" + tm(d.P) + (hasQ ? "  Q=" + tm(d.Q) : ""); g.appendChild(badge);
        }
        svg.appendChild(g);
      });
      svgWrap.appendChild(svg);
    }

    function renderAcc(st) {
      var f = FORMULAS[fk], D = scen.domain, acc = st.acc || { done: [] };
      if (!f.q) {
        var aObj = D.filter(function (d) { return d.id === scen.aTo; })[0], ok = acc.done.indexOf(aObj.id) >= 0;
        accEl.innerHTML = '<div class="pf-acc-line"><span class="lead">P(a) = P(' + esc(aObj.label) + ') =</span>' +
          '<span class="pf-term-box' + (ok ? (aObj.P ? " t" : " f") : " pending") + '">' + (ok ? tm(aObj.P) : "?") + '</span></div>' +
          '<div class="pf-acc-note">个体常项不需要量词展开：先查指派，再查谓词赋值。</div>';
        return;
      }
      var conn = f.q === "∀" ? "∧" : "∨";
      var boxes = D.map(function (d) {
        var done = acc.done.indexOf(d.id) >= 0, b = f.body(d);
        var cls = "pf-term-box" + (done ? (b ? " t" : " f") : " pending") + (acc.cur === d.id || acc.key === d.id ? " cur" : "");
        return '<span class="' + cls + '">φ(' + esc(d.label) + ')' + (done ? "=" + tm(b) : "=?") + '</span>';
      }).join('<span class="pf-conn">' + conn + '</span>');
      var runLine = "";
      if (cfg.mode === "full" && acc.done.length) {
        runLine = '<div class="pf-acc-run">当前累计（' + (f.q === "∀" ? "合取" : "析取") + '）= ' + tfHtml(acc.run) + '　已算 ' + acc.done.length + ' / ' + D.length + ' 个个体</div>';
      } else if (cfg.mode === "short") {
        runLine = '<div class="pf-acc-note">' + (f.q === "∃" ? "∃：析取中出现一个 T 即为真（见证）" : "∀：合取中出现一个 F 即为假（反例）") + '，其余项不必再算。</div>';
      }
      accEl.innerHTML = '<div class="pf-acc-line"><span class="lead">' + esc(f.q + "x " + f.phi) + ' ≡</span>' + boxes + '</div>' + runLine;
    }

    function renderVerdict(st) {
      var f = FORMULAS[fk];
      if (!cfg.multi) {
        var shown = typeof st.verdict === "boolean";
        verdictEl.className = "pf-verdict" + (shown ? (st.verdict ? " v-true" : " v-false") : " sym-pending");
        verdictEl.innerHTML = shown
          ? '<span class="c-chip">' + esc(f.label) + ' 在解释「' + esc(scen.name) + '」下' + (st.verdict ? "为真 T" : "为假 F") + '</span>' +
            '<div class="c-reason">真值是相对于解释而言的：换论域、换指派或换赋值，同一公式可能变真或变假。</div>'
          : '<span class="c-chip">真值待定</span><div class="c-reason">逐步给出解释并求值后，这里显示结论。</div>';
        return;
      }
      if (st.writeResult) results[scenIdx] = st.verdict;
      var rows = cfg.scenarios.map(function (s, i) {
        var r = results[i];
        return '<tr class="' + (i === scenIdx ? "cur" : "") + '" data-i="' + i + '"><td class="nm">' + esc(s.name) + '</td><td class="ds">' + esc(s.Pname) + ' / ' + esc(s.Qname) + '</td><td>' +
          (r === undefined ? '<span class="pf-wait">待评估</span>' : tfHtml(r)) + '</td></tr>';
      }).join("");
      var vals = cfg.scenarios.map(function (s, i) { return results[i]; }).filter(function (v) { return typeof v === "boolean"; });
      var concl;
      if (vals.length < 2) concl = "已评估 <b>" + vals.length + " / " + cfg.scenarios.length + "</b> 个解释。点表格行或左侧下拉切换解释，走完推演后结果自动写入。";
      else if (vals.some(Boolean) && vals.some(function (v) { return !v; })) concl = "有解释为真、也有解释为假 ⟹ 该公式<b>可满足但非永真</b>（结论严格：一个成真解释 + 一个成假解释即可）。";
      else if (vals.every(Boolean)) concl = "已评估的解释中<b>都为真</b>。注意：要断言<b>永真</b>须对一切解释成立——有限几个模型只能提供支持，不能代替证明。";
      else concl = "已评估的解释中<b>都为假</b>。断言<b>永假（不可满足）</b>同样须对一切解释论证；换一个解释也许就能使它为真。";
      var db = "";
      if (st.db) {
        var r0 = evalFormula(f, scen);
        db = '<div class="pf-db"><div><div class="pf-db-cap">关系实例 D（每行一个个体）</div><table class="pf-tbl"><thead><tr><th>x</th><th>P</th><th>Q</th></tr></thead><tbody>' +
          scen.domain.map(function (d) { return '<tr><td class="nm">' + esc(d.label) + '</td><td>' + (d.P ? 1 : 0) + '</td><td>' + (d.Q ? 1 : 0) + '</td></tr>'; }).join("") +
          '</tbody></table></div><div><div class="pf-db-cap">公式 → SQL，对该实例求值</div><pre class="pf-sql">' + esc(f.sql) + '\n<span class="res">-- 结果：' + (r0 ? "TRUE" : "FALSE") + ' ≡ 逻辑真值 ' + (r0 ? "真" : "假") + '</span></pre></div></div>';
      }
      verdictEl.className = "pf-verdict pf-multi";
      verdictEl.innerHTML = '<table class="pf-tbl pf-cmp"><thead><tr><th>解释（模型）</th><th>P / Q 的含义</th><th>' + esc(f.label) + '</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '<div class="pf-cmp-concl">' + concl + '</div>' + db;
      Array.prototype.forEach.call(verdictEl.querySelectorAll("tbody tr[data-i]"), function (tr) {
        tr.addEventListener("click", function () { var i = +tr.getAttribute("data-i"); if (i !== scenIdx) selectScen(i); });
      });
    }

    function go(to) {
      p = Math.max(0, Math.min(steps.length, to));
      var st = p === 0 ? { reveal: cfg.mode === "short" ? 0 : 3, terms: [], sub: cfg.mode === "short" ? "" : ("D = { " + scen.domain.map(function (d) { return d.label; }).join(", ") + " }") } : steps[p - 1];
      renderFormula(st); renderComp(st); renderGraph(st); renderAcc(st); renderVerdict(st);
      statusEl.innerHTML = p === 0 ? cfg.introStatus : st.status;
      progNum.textContent = p + " / " + steps.length;
      progBar.style.width = (steps.length ? p / steps.length * 100 : 0) + "%";
      prevBtn.disabled = p <= 0;
      nextBtn.disabled = p >= steps.length;
    }
    function autoDelay() { return Math.max(280, 1500 - Number(speedEl ? speedEl.value : 55) * 12); }
    function toggleAuto() {
      if (autoTimer) { stopAuto(); return; }
      if (p >= steps.length) go(0);
      autoBtn.classList.add("sym-playing"); autoBtn.textContent = "⏸ 暂停";
      autoTimer = setInterval(function () { if (p >= steps.length) { stopAuto(); return; } go(p + 1); }, autoDelay());
    }
    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
      if (autoBtn) { autoBtn.classList.remove("sym-playing"); autoBtn.textContent = "⏵ 自动播放"; }
    }

    renderControls();
    renderLegend();
    rebuild();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})(typeof window !== "undefined" ? window : globalThis);
