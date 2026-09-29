/* =====================================================================
 * 6.9 国家历史文化遗产保护 —— 三层统一交互引擎（遗产保护规则判定台）
 * 与 6.8 案例同构：基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态：点选遗产 / 记录 / 项目 → 逐项核验规则前件 → UI + 假言推理给出结论（推出 / 推不出）。
 * 难度梯度：
 *   基础层（认识模型）：真实遗产，析取规则 ∀x((W(x) ∨ K(x)) → List(x))。
 *   进阶层（求解模型）：巡查记录，合取 + 否定谓词 ∀x((K(x) ∧ D(x) ∧ ¬A(x)) → Repair(x))。
 *   拓展层（拓展模型）：建设项目合规，二元谓词与双量词 ∀p∀x((In(p,x) ∧ K(x) ∧ ¬Appr(p)) → Alert(p))。
 * 舞台按案例六段式：情境背景 → 数学建模 → 交互求解 → 结果解读 → 价值引领 → 迁移思考。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* 规则前件可为合取（∧，缺一不可）或析取（∨，满足其一即可） */
  function computeCase(c) {
    var conds = c.conds, op = c.op || "∧";
    var fired = op === "∨" ? conds.some(function (q) { return q.value; }) : conds.every(function (q) { return q.value; });
    var fails = conds.filter(function (q) { return !q.value; });
    var wits = conds.filter(function (q) { return q.value; });
    var action = c.action;
    var inst = action + "(" + c.args.replace(/[a-z]/g, function (v) { return (c.bind && c.bind[v]) || v; }) + ")";
    var verdict;
    if (fired) {
      verdict = { key: "yes", label: c.yes,
        reason: (op === "∨" ? "析取前件中 <b>" + wits.map(function (q) { return q.pred; }).join("、") + "</b> 为真，前件即为真" : "合取前件全部为真") +
          "。用全称指定（UI）把规则实例化，再用假言推理得 <b>" + inst + "</b>。" };
    } else {
      verdict = { key: "no", label: c.no,
        reason: (op === "∨" ? "析取前件的每一项都为假" : "前件 <b>" + fails.map(function (q) { return q.pred; }).join("、") + "</b> 为假") +
          " ⟹ 前件为假。规则实例（蕴含式）仍为真，但<b>推不出</b> " + inst + "；平台按『推不出即不执行』处理。" };
    }
    verdict.insight = c.insight || "";
    return { conds: conds, op: op, recommend: fired, fails: fails, action: action, verdict: verdict, who: c.who, job: c.job };
  }
  function ruleText(c) {
    return c.q + "(( " + c.conds.map(function (q) { return q.pred; }).join(" " + (c.op || "∧") + " ") + " ) → " + c.action + "(" + c.args + ") )";
  }

  /* ---------- 三层数据（六段式：情境背景 → 数学建模 → 交互求解 → 结果解读 → 价值引领 → 迁移思考）
   * 基础层用真实遗产与可核实的事实（是否列入《世界遗产名录》、是否为全国重点文物保护单位）；
   * 进阶层 / 拓展层的巡查记录与建设项目为教学虚构数据，规则为教学简化规则（非法规原文）。 ---------- */
  var LEVELS = {
    basic: {
      introStatus: "点选一处遗产，逐项核验两个谓词，看析取规则能否推出『纳入重点保护名录』。",
      caption: "真实遗产 · 事实可核实",
      story: {
        context: "某省文物数字化平台要建立『重点保护名录』。政策写道：列入《世界遗产名录》的，或者是全国重点文物保护单位的，都纳入名录。面对成百上千处遗产，怎样把这句话写成人人能核对、机器能执行的规则？",
        model: [["遗产", "个体 x（论域：平台收录的遗产）"], ["列入《世界遗产名录》", "谓词 W(x)"], ["全国重点文物保护单位", "谓词 K(x)"], ["『或者』", "析取 ∨：满足其一即可"], ["入名录政策", "∀x((W(x) ∨ K(x)) → List(x))"]],
        read: "析取前件只要一项为真就能推出结论；两项都假时推不出——这不等于『不值得保护』，只是不属于本名录，按其他级别的规定管理。",
        value: { title: "守护文明 · 赓续根脉", text: "世界遗产与全国重点文物保护单位，都是中华文明的实物见证。把保护政策写成清晰的谓词规则，名录纳入有据可查，让『保护好文化遗产』落到每一处遗产、每一条记录上。" },
        transfer: ["若政策改为『既是世界遗产又是全国重点文物保护单位』才纳入，规则应怎样改写？结论会变吗？", "『存在未纳入名录的全国重点文物保护单位』如何符号化？它与本规则矛盾吗？"]
      },
      cases: [
        { label: "故宫", icon: "🏯", who: "故宫", q: "∀x", args: "x", bind: { x: "故宫" }, action: "List", op: "∨", yes: "纳入名录", no: "不属本名录",
          scenario: "两个析取项都为真。", insight: "1987 年列入《世界遗产名录》，1961 年公布为全国重点文物保护单位。",
          conds: [
            { pred: "W(x)", name: "列入《世界遗产名录》", detail: "明清故宫（北京故宫）", value: true, note: "W(故宫) 为真。" },
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "第一批全国重点文物保护单位", value: true, note: "K(故宫) 为真。" }
          ] },
        { label: "岳阳楼", icon: "🏮", who: "岳阳楼", q: "∀x", args: "x", bind: { x: "岳阳楼" }, action: "List", op: "∨", yes: "纳入名录", no: "不属本名录",
          scenario: "未列入世界遗产，但为全国重点文物保护单位。", insight: "只要有一个析取项为真，前件就为真——这正是『或者』的逻辑含义。",
          conds: [
            { pred: "W(x)", name: "列入《世界遗产名录》", detail: "未列入", value: false, note: "W(岳阳楼) 为假。" },
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "湖南岳阳 · 全国重点文物保护单位", value: true, note: "K(岳阳楼) 为真。" }
          ] },
        { label: "岳麓书院", icon: "📜", who: "岳麓书院", q: "∀x", args: "x", bind: { x: "岳麓书院" }, action: "List", op: "∨", yes: "纳入名录", no: "不属本名录",
          scenario: "千年学府，全国重点文物保护单位。", insight: "『惟楚有材，于斯为盛』——书院文脉同样是需要守护的文化遗产。",
          conds: [
            { pred: "W(x)", name: "列入《世界遗产名录》", detail: "未列入", value: false, note: "W(岳麓书院) 为假。" },
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "湖南长沙 · 全国重点文物保护单位", value: true, note: "K(岳麓书院) 为真。" }
          ] },
        { label: "武陵源", icon: "⛰️", who: "武陵源", q: "∀x", args: "x", bind: { x: "武陵源" }, action: "List", op: "∨", yes: "纳入名录", no: "不属本名录",
          scenario: "世界自然遗产，不属于文物保护单位。", insight: "1992 年作为自然遗产列入《世界遗产名录》。W 为真、K 为假，析取前件依然为真。",
          conds: [
            { pred: "W(x)", name: "列入《世界遗产名录》", detail: "武陵源风景名胜区 · 世界自然遗产", value: true, note: "W(武陵源) 为真。" },
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "自然遗产，不属文物保护单位", value: false, note: "K(武陵源) 为假。" }
          ] },
        { label: "老司城遗址", icon: "🏛️", who: "老司城遗址", q: "∀x", args: "x", bind: { x: "老司城遗址" }, action: "List", op: "∨", yes: "纳入名录", no: "不属本名录",
          scenario: "湖南首处世界文化遗产（土司遗址的组成部分）。", insight: "2015 年作为『土司遗址』的组成部分列入《世界遗产名录》。",
          conds: [
            { pred: "W(x)", name: "列入《世界遗产名录》", detail: "土司遗址 · 湖南永顺", value: true, note: "W(老司城遗址) 为真。" },
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "全国重点文物保护单位", value: true, note: "K(老司城遗址) 为真。" }
          ] },
        { label: "某村新修祠堂（示例）", icon: "🏠", who: "某村新修祠堂", q: "∀x", args: "x", bind: { x: "某村新修祠堂" }, action: "List", op: "∨", yes: "纳入名录", no: "不属本名录",
          scenario: "教学虚构对象：近年新修的建筑，两个谓词都为假。", insight: "规则推不出纳入名录；它是否需要保护，要看其他规定——逻辑结论只在规则的范围内有效。",
          conds: [
            { pred: "W(x)", name: "列入《世界遗产名录》", detail: "未列入", value: false, note: "W 为假。" },
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "不是", value: false, note: "K 为假。" }
          ] }
      ]
    },
    advanced: {
      introStatus: "选择一条巡查记录，逐项核验合取前件（含否定谓词 ¬A(x)），判断能否推出『列入修缮计划』。",
      caption: "巡查记录 · 教学虚构数据",
      story: {
        context: "文物巡查平台每天汇总巡查记录。平台规则：全国重点文物保护单位中，巡查发现结构病害、且尚未立项修缮的，自动列入年度修缮计划。规则里出现了『尚未』——否定也要写进公式。",
        model: [["巡查对象", "个体 x"], ["全国重点文物保护单位", "K(x)"], ["发现结构病害", "D(x)"], ["已立项修缮", "A(x)，『尚未』写作 ¬A(x)"], ["平台规则", "∀x((K(x) ∧ D(x) ∧ ¬A(x)) → Repair(x))"]],
        read: "合取前件缺一不可：不是国保单位、没有病害、或已经立项，都推不出 Repair(x)。推不出不代表不管——已立项的正在修，其他级别的按各自程序处理。",
        value: { title: "规则守护 · 责任落实", text: "把『发现问题—判断责任—列入计划』写成统一规则，每一次判定都能追溯到具体条件：既避免遗漏急需修缮的遗产，也避免重复立项，让保护责任清晰可追踪。" },
        transfer: ["若再加一条规则 ∀x((D(x) ∧ ¬K(x)) → Report(x))（非国保单位发现病害须上报），两条规则会冲突吗？", "如何用存在量词表示『存在已立项但尚未开工的修缮项目』？"]
      },
      cases: [
        { label: "甲县古戏台（示例）", icon: "🎭", who: "甲县古戏台", q: "∀x", args: "x", bind: { x: "甲县古戏台" }, action: "Repair", op: "∧", yes: "列入修缮计划", no: "不列入",
          scenario: "三个前件都为真。", insight: "国保单位 + 结构病害 + 尚未立项：规则触发，列入年度修缮计划。",
          conds: [
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "是", value: true, note: "K 为真。" },
            { pred: "D(x)", name: "发现结构病害", detail: "梁架出现开裂", value: true, note: "D 为真。" },
            { pred: "¬A(x)", name: "尚未立项修缮", detail: "无在册修缮项目", value: true, note: "A 为假，所以 ¬A 为真。" }
          ] },
        { label: "乙县石窟（示例）", icon: "🗿", who: "乙县石窟", q: "∀x", args: "x", bind: { x: "乙县石窟" }, action: "Repair", op: "∧", yes: "列入修缮计划", no: "不列入（已在修）",
          scenario: "有病害，但修缮已经立项，¬A(x) 为假。", insight: "否定谓词让规则避免重复立项：推不出 Repair，是因为修缮已在进行。",
          conds: [
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "是", value: true, note: "K 为真。" },
            { pred: "D(x)", name: "发现结构病害", detail: "岩体渗水", value: true, note: "D 为真。" },
            { pred: "¬A(x)", name: "尚未立项修缮", detail: "去年已立项", value: false, note: "A 为真，所以 ¬A 为假。" }
          ] },
        { label: "丙镇石桥（示例）", icon: "🌉", who: "丙镇石桥", q: "∀x", args: "x", bind: { x: "丙镇石桥" }, action: "Repair", op: "∧", yes: "列入修缮计划", no: "本规则不适用",
          scenario: "省级文物保护单位，K(x) 为假。", insight: "本规则只管国保单位；省级文保单位的病害按省级程序处理（见迁移思考中的另一条规则）。",
          conds: [
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "省级文物保护单位", value: false, note: "K 为假。" },
            { pred: "D(x)", name: "发现结构病害", detail: "桥面石板松动", value: true, note: "D 为真。" },
            { pred: "¬A(x)", name: "尚未立项修缮", detail: "无在册项目", value: true, note: "¬A 为真。" }
          ] },
        { label: "丁城城墙段（示例）", icon: "🧱", who: "丁城城墙段", q: "∀x", args: "x", bind: { x: "丁城城墙段" }, action: "Repair", op: "∧", yes: "列入修缮计划", no: "常规维护",
          scenario: "巡查未发现结构病害，D(x) 为假。", insight: "没有病害就推不出修缮，按常规维护——规则让资源用在最需要的地方。",
          conds: [
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "是", value: true, note: "K 为真。" },
            { pred: "D(x)", name: "发现结构病害", detail: "本次巡查未发现", value: false, note: "D 为假。" },
            { pred: "¬A(x)", name: "尚未立项修缮", detail: "无在册项目", value: true, note: "¬A 为真。" }
          ] }
      ]
    },
    extend: {
      introStatus: "选择一个建设项目，逐项核验含二元谓词的合规规则，判断是否触发违规预警。",
      caption: "建设项目 · 教学虚构数据",
      story: {
        context: "城市建设与遗产保护常有交集。合规审查系统把相关规定简化为规则：建设项目位于某全国重点文物保护单位的保护范围内、且未获审批的，发出违规预警。（教学简化规则，非法规原文。）",
        model: [["建设项目", "个体 p"], ["文物保护单位", "个体 x"], ["项目位于其保护范围内", "二元谓词 In(p,x)"], ["x 为全国重点文物保护单位", "K(x)"], ["项目已获审批", "Appr(p)"], ["合规规则", "∀p∀x((In(p,x) ∧ K(x) ∧ ¬Appr(p)) → Alert(p))"]],
        read: "两个量词 ∀p∀x 同时约束项目与遗产；预警的每一条都能指出成立的前件，结论不成立时能指出哪一项不满足——这就是规则引擎的可解释性。",
        value: { title: "依法保护 · 发展与保护相协调", text: "把法规精神转化为可执行、可审计的规则，让城市发展与遗产保护在同一套透明规则下协调推进：该审批的必须审批，依法合规的项目也不被误伤。" },
        transfer: ["若同一项目同时位于两处文物保护单位的保护范围内，规则会被实例化几次？", "规则引擎如何在『刚性统一』与『个案裁量』之间取得平衡？"]
      },
      cases: [
        { label: "项目 A · 新建游客中心", icon: "🏗️", who: "项目A", job: "某国保古城", q: "∀p∀x", args: "p", bind: { p: "项目A" }, action: "Alert", op: "∧", yes: "违规预警", no: "不预警",
          scenario: "位于某国保单位保护范围内，尚未获批。", insight: "三个前件都成立，系统发出预警，并列出依据：In、K、¬Appr。",
          conds: [
            { pred: "In(p,x)", name: "位于保护范围内", detail: "项目红线落入保护范围", value: true, note: "In(项目A, 某国保古城) 为真。" },
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "是", value: true, note: "K 为真。" },
            { pred: "¬Appr(p)", name: "未获审批", detail: "未提交审批材料", value: true, note: "Appr 为假，¬Appr 为真。" }
          ] },
        { label: "项目 B · 展陈改造", icon: "🖼️", who: "项目B", job: "某国保古城", q: "∀p∀x", args: "p", bind: { p: "项目B" }, action: "Alert", op: "∧", yes: "违规预警", no: "合规 · 不预警",
          scenario: "同在保护范围内，但已依法获批。", insight: "¬Appr 为假，推不出预警——依法合规的项目不被误伤。",
          conds: [
            { pred: "In(p,x)", name: "位于保护范围内", detail: "是", value: true, note: "In 为真。" },
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "是", value: true, note: "K 为真。" },
            { pred: "¬Appr(p)", name: "未获审批", detail: "已取得批准文件", value: false, note: "Appr 为真，¬Appr 为假。" }
          ] },
        { label: "项目 C · 城郊道路", icon: "🛣️", who: "项目C", job: "某国保古城", q: "∀p∀x", args: "p", bind: { p: "项目C" }, action: "Alert", op: "∧", yes: "违规预警", no: "不预警",
          scenario: "项目在保护范围之外。", insight: "In(p,x) 为假，本规则不适用；其他规定（如建设控制地带）另有规则。",
          conds: [
            { pred: "In(p,x)", name: "位于保护范围内", detail: "位于范围外", value: false, note: "In 为假。" },
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "是", value: true, note: "K 为真。" },
            { pred: "¬Appr(p)", name: "未获审批", detail: "未审批", value: true, note: "¬Appr 为真。" }
          ] },
        { label: "项目 D · 老街修缮", icon: "🏘️", who: "项目D", job: "某市级文保单位", q: "∀p∀x", args: "p", bind: { p: "项目D" }, action: "Alert", op: "∧", yes: "违规预警", no: "本规则不适用",
          scenario: "位于某市县级文物保护单位范围内，K(x) 为假。", insight: "本规则只针对国保单位；市县级文保单位适用各自的规定，需要另写规则并检查规则库一致性。",
          conds: [
            { pred: "In(p,x)", name: "位于保护范围内", detail: "是", value: true, note: "In 为真。" },
            { pred: "K(x)", name: "全国重点文物保护单位", detail: "市县级文物保护单位", value: false, note: "K 为假。" },
            { pred: "¬Appr(p)", name: "未获审批", detail: "未审批", value: true, note: "¬Appr 为真。" }
          ] }
      ]
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { computeCase: computeCase, ruleText: ruleText, LEVELS: LEVELS };
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
    var whoEl = byId("hpWho");
    var ruleEl = byId("hpRule");
    var condsEl = byId("hpConds");
    var evalEl = byId("hpEval");
    var graphEl = byId("hpGraph");
    var verdictEl = byId("hpVerdict");
    var storyEl = byId("hpStory"), modelEl = byId("hpModel"), valueEl = byId("hpValue"), transferEl = byId("hpTransfer"), readEl = byId("hpRead");
    if (!controlsEl || !whoEl) return;

    var cur = null, scenario = "", action = "", curCase = null, curIdx = 0;
    var p = 0, manualFocus = null, autoTimer = null;
    var predSpans = [], condEls = [], nodeEls = [], recNode = null;
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.cases.map(function (c, i) { return '<option value="' + i + '">' + esc(c.label) + '</option>'; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label><span>选择对象</span><small>或点舞台图谱卡片</small></label>' +
          '<select id="hpSelect">' + opts + '</select></div>' +
        '<div class="control-group"><label><span>逐项核验</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button class="sym-step-btn" id="hpPrev">◀ 上一步</button>' +
            '<button class="sym-step-btn sym-primary" id="hpNext">下一步 ▶</button>' +
            '<button class="sym-step-btn" id="hpAuto">⏵ 自动播放</button>' +
            '<button class="sym-step-btn sym-ghost" id="hpReset">↺ 重置</button>' +
          '</div>' +
          '<div class="sym-speed"><span>慢</span><input type="range" id="hpSpeed" min="1" max="100" value="55" aria-label="自动播放速度"><span>快</span></div>' +
        '</div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="hpProgBar"></i></div>' +
          '<span class="sym-progress-num" id="hpProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="hpStatus"></div></div>';
      statusEl = byId("hpStatus"); progBar = byId("hpProgBar"); progNum = byId("hpProgNum");
      prevBtn = byId("hpPrev"); nextBtn = byId("hpNext"); autoBtn = byId("hpAuto");
      byId("hpSelect").addEventListener("change", function (e) { loadCase(+e.target.value); });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("hpReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
      byId("hpSpeed").addEventListener("input", function () { if (autoTimer) { stopAuto(); toggleAuto(); } });
    }
    function autoDelay() { var sp = byId("hpSpeed"); return Math.max(280, 1500 - Number(sp ? sp.value : 55) * 12); }

    /* 六段式中的静态段：情境背景 / 数学建模映射 / 价值引领 / 迁移思考 */
    function renderStory() {
      var st = cfg.story || {};
      if (storyEl) storyEl.innerHTML = '<p>' + esc(st.context || "") + '</p>';
      if (modelEl) modelEl.innerHTML = (st.model || []).map(function (m) {
        return '<div class="hp-map"><span class="m-real">' + esc(m[0]) + '</span><span class="m-arrow">→</span><span class="m-math">' + esc(m[1]) + '</span></div>';
      }).join("");
      if (valueEl && st.value) valueEl.innerHTML = '<div class="hp-value-title">🚩 ' + esc(st.value.title) + '</div><p>' + esc(st.value.text) + '</p>';
      if (transferEl) transferEl.innerHTML = '<ol>' + (st.transfer || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ol>';
    }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      box.innerHTML = '<div class="legend-title">谓词与规则说明</div><div class="legend-grid">' +
        (({ basic: [["W(x)", "x 列入《世界遗产名录》"], ["K(x)", "x 为全国重点文物保护单位"], ["∨", "析取 · 满足其一即可"], ["→", "蕴含 · 前件为真才能推出结论"], ["UI", "全称指定：把 ∀x 规则用到具体遗产"]],
           advanced: [["K(x)", "全国重点文物保护单位"], ["D(x)", "巡查发现结构病害"], ["¬A(x)", "尚未立项修缮（A 的否定）"], ["∧", "合取 · 缺一不可"], ["UI + MP", "实例化规则 + 假言推理"]],
           extend: [["∀p∀x", "对所有项目 p 与遗产 x"], ["In(p,x)", "二元谓词 · p 位于 x 的保护范围内"], ["¬Appr(p)", "项目未获审批"], ["Alert(p)", "对项目 p 发出预警"], ["可解释", "列出成立 / 不成立的前件"]] })[global.SYMBOLIZE_LEVEL] || []).map(function (it) {
          return '<div class="legend-item"><span class="sym">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + '</span></div>';
        }).join("") + '</div>';
    }

    function loadCase(idx) {
      stopAuto();
      cur = computeCase(cfg.cases[idx]);
      var c = cfg.cases[idx]; curCase = c; curIdx = idx;
      var sel = byId("hpSelect"); if (sel && +sel.value !== idx) sel.value = String(idx);
      renderGallery();
      scenario = c.scenario || ""; action = cur.action;
      p = 0; manualFocus = null;
      if (storyEl) storyEl.innerHTML = '<p>' + esc((cfg.story || {}).context || "") + '</p><p class="hp-case-line"><b>本例：</b>' + esc(c.label) + ' —— ' + esc(scenario) + '</p>';
      renderWho(c);
      renderRule(c);
      renderConds();
      renderGraph();
      evalEl.innerHTML = "";
      render();
    }

    /* 对象图谱：点卡片即选中该例（保留原页『点击遗迹卡片』的交互） */
    function renderGallery() {
      var g = byId("hpGallery"); if (!g) return;
      g.innerHTML = '<div class="hp-gal-cap">' + esc(cfg.caption || "") + '</div>' + cfg.cases.map(function (c, i) {
        return '<button type="button" class="hp-gal' + (i === curIdx ? " on" : "") + '" data-i="' + i + '"><span class="gi">' + esc(c.icon || "") + '</span><span class="gn">' + esc(c.label) + '</span></button>';
      }).join("");
      Array.prototype.forEach.call(g.querySelectorAll(".hp-gal"), function (b) {
        b.addEventListener("click", function () { var i = +b.getAttribute("data-i"); if (i !== curIdx) loadCase(i); });
      });
    }

    function renderWho(c) {
      var b = Object.keys(c.bind || {}).map(function (v) { return v + " = " + c.bind[v]; });
      if (c.job) b.push("x = " + c.job);
      whoEl.innerHTML = '<span class="who-name">' + esc(c.icon || "") + ' ' + esc(c.who) + '</span>' +
        '<span class="who-tag">实例化：' + esc(b.join("，")) + ' · 共 ' + cur.conds.length + ' 个前件（' + (cur.op === "∨" ? "析取，满足其一即可" : "合取，缺一不可") + '）</span>';
    }

    function renderRule(c) {
      ruleEl.innerHTML = "";
      ruleEl.appendChild(document.createTextNode(c.q + "(( "));
      cur.conds.forEach(function (q, k) {
        if (k > 0) ruleEl.appendChild(document.createTextNode(" " + cur.op + " "));
        var sp = document.createElement("span");
        sp.className = "hp-pred"; sp.dataset.k = k; sp.textContent = q.pred;
        sp.addEventListener("click", function () { clickCond(k); });
        ruleEl.appendChild(sp);
        predSpans[k] = sp;
      });
      predSpans.length = cur.conds.length;
      var tail = document.createElement("span");
      tail.className = "hp-head-q";
      tail.textContent = " ) → " + action + "(" + c.args + ") )";
      ruleEl.appendChild(tail);
    }

    function renderConds() {
      condsEl.innerHTML = "";
      condEls = cur.conds.map(function (q, k) {
        var d = document.createElement("div");
        d.className = "hp-cond"; d.dataset.k = k;
        d.innerHTML = '<span class="c-pred">' + esc(q.pred) + '</span>' +
          '<div class="c-body"><div class="c-name">' + esc(q.name) + '</div><div class="c-detail">' + esc(q.detail) + '</div></div>' +
          '<span class="c-badge">待核验</span>';
        d.addEventListener("click", function () { clickCond(k); });
        condsEl.appendChild(d);
        return d;
      });
    }

    function renderGraph() {
      graphEl.innerHTML = "";
      var n = cur.conds.length;
      var VW = 760, nodeW = 212, nodeH = 44, gap = 14, topPad = 14;
      var colH = n * nodeH + (n - 1) * gap;
      var H = Math.max(colH + topPad * 2, 150);
      var centerY = topPad + colH / 2;
      var gateX = 430, gateR = 26, recX = 548, recW = 196, recH = 64;
      var svg = svgEl("svg", { id: "hpGraph", viewBox: "0 0 " + VW + " " + H, width: "100%", height: H });
      var g = svgEl("g"); svg.appendChild(g);

      // 边：条件 -> 联结词门 -> 结论
      nodeEls = [];
      cur.conds.forEach(function (q, k) {
        var y = topPad + k * (nodeH + gap) + nodeH / 2;
        g.appendChild(svgEl("path", { d: "M " + (16 + nodeW) + " " + y + " Q " + (gateX - 60) + " " + y + " " + (gateX - gateR) + " " + centerY, stroke: "#c9a99a", "stroke-width": 1.6, fill: "none", opacity: 0.4, "stroke-dasharray": "" }));
      });
      g.appendChild(svgEl("path", { d: "M " + (gateX + gateR) + " " + centerY + " L " + recX + " " + centerY, stroke: "#c58a1f", "stroke-width": 2, fill: "none", opacity: 0.7 }));

      // 条件节点
      cur.conds.forEach(function (q, k) {
        var y = topPad + k * (nodeH + gap);
        var ng = svgEl("g"); ng.setAttribute("class", "hp-node"); ng.dataset.k = k;
        var rect = svgEl("rect", { x: 16, y: y, width: nodeW, height: nodeH, rx: 9, fill: "#eee", stroke: "#cfc3bb", "stroke-width": 1.6 });
        var t1 = svgEl("text", { x: 28, y: y + 17, fill: "#2f5f9f", "font-size": 13, "font-weight": "800", "font-family": "JetBrains Mono, monospace" }); t1.textContent = q.pred;
        var t2 = svgEl("text", { x: 28, y: y + 34, fill: "#4e362d", "font-size": 12 }); t2.textContent = q.name;
        ng.appendChild(rect); ng.appendChild(t1); ng.appendChild(t2);
        ng.addEventListener("click", function () { clickCond(k); });
        g.appendChild(ng);
        nodeEls.push({ g: ng, rect: rect });
      });

      // 合取门
      var gate = svgEl("g");
      gate.appendChild(svgEl("circle", { cx: gateX, cy: centerY, r: gateR, fill: "#fff", stroke: "#d63b1d", "stroke-width": 2 }));
      var gt = svgEl("text", { x: gateX, y: centerY, "text-anchor": "middle", "dominant-baseline": "central", fill: "#d63b1d", "font-size": 22, "font-weight": "800" }); gt.textContent = cur.op;
      gate.appendChild(gt); g.appendChild(gate);

      // 结论节点
      var rg = svgEl("g"); rg.setAttribute("class", "hp-node");
      var rrect = svgEl("rect", { x: recX, y: centerY - recH / 2, width: recW, height: recH, rx: 11, fill: "#eee", stroke: "#cfc3bb", "stroke-width": 2 });
      var rt1 = svgEl("text", { x: recX + recW / 2, y: centerY - 8, "text-anchor": "middle", fill: "#2c1810", "font-size": 14, "font-weight": "800", "font-family": "JetBrains Mono, monospace" }); rt1.textContent = action + "(" + curCase.args + ")";
      var rt2 = svgEl("text", { x: recX + recW / 2, y: centerY + 14, "text-anchor": "middle", fill: "#6b4a38", "font-size": 12.5, "font-weight": "700" }); rt2.textContent = "待判定";
      rg.appendChild(rrect); rg.appendChild(rt1); rg.appendChild(rt2);
      g.appendChild(rg);
      recNode = { g: rg, rect: rrect, txt: rt2 };

      graphEl.appendChild(svg);
    }

    function total() { return cur.conds.length + 1; }
    function step(dir) { manualFocus = null; p = Math.max(0, Math.min(total(), p + dir)); render(); }
    function clickCond(i) {
      stopAuto();
      var n = cur.conds.length;
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
      var n = cur.conds.length, T = n + 1;
      var condsShown = Math.min(p, n);
      var verdictShown = p > n;
      var stepCond = (p >= 1 && p <= n) ? p - 1 : null;
      var focusCond = (manualFocus != null) ? manualFocus : stepCond;

      for (var k = 0; k < n; k++) {
        var revealed = k < condsShown || verdictShown;
        var v = cur.conds[k].value;
        var isCur = (k === focusCond);
        // 条件卡
        if (condEls[k]) {
          condEls[k].classList.toggle("sym-pending", !revealed);
          condEls[k].classList.toggle("sym-cur", isCur);
          condEls[k].classList.toggle("c-true", revealed && v);
          condEls[k].classList.toggle("c-false", revealed && !v);
          var badge = condEls[k].querySelector(".c-badge");
          if (badge) badge.textContent = revealed ? (v ? "满足 ✓" : "不满足 ✗") : "待核验";
        }
        // 规则公式谓词项
        if (predSpans[k]) {
          predSpans[k].classList.toggle("p-true", revealed && v);
          predSpans[k].classList.toggle("p-false", revealed && !v);
          predSpans[k].classList.toggle("sym-cur", isCur);
        }
        // 决策图节点
        if (nodeEls[k]) {
          nodeEls[k].g.classList.toggle("sym-pending", !revealed);
          nodeEls[k].g.classList.toggle("sym-cur", isCur);
          nodeEls[k].rect.setAttribute("fill", revealed ? (v ? "#cdebd9" : "#f6d3ce") : "#eee");
          nodeEls[k].rect.setAttribute("stroke", revealed ? (v ? "#2f7d57" : "#d63b1d") : "#cfc3bb");
        }
      }

      // 结论节点
      if (recNode) {
        if (verdictShown) {
          recNode.rect.setAttribute("fill", cur.recommend ? "#cdebd9" : "#f6d3ce");
          recNode.rect.setAttribute("stroke", cur.recommend ? "#2f7d57" : "#d63b1d");
          recNode.txt.textContent = cur.recommend ? "推出 ✓" : "推不出 ✗";
          recNode.txt.setAttribute("fill", cur.recommend ? "#1d6b43" : "#97180f");
        } else {
          recNode.rect.setAttribute("fill", "#eee");
          recNode.rect.setAttribute("stroke", "#cfc3bb");
          recNode.txt.textContent = "待判定";
          recNode.txt.setAttribute("fill", "#6b4a38");
        }
      }

      evalEl.innerHTML = evalHTML(focusCond, verdictShown);
      renderVerdict(verdictShown);

      progNum.textContent = p + " / " + T;
      progBar.style.width = (T ? (p / T * 100) : 0) + "%";
      prevBtn.disabled = (p <= 0 && manualFocus == null);
      nextBtn.disabled = (p >= T);
      statusEl.innerHTML = statusHTML(p, focusCond, verdictShown);
    }

    function evalHTML(focusCond, verdictShown) {
      if (focusCond == null && !verdictShown) return '<span style="color:#6b4a38">点「下一步」逐项核验谓词条件。每个条件成立与否，决定规则前件是否为真。</span>';
      if (focusCond == null && verdictShown) return '已核验全部 <b>' + cur.conds.length + '</b> 个条件，下方给出判定结论。可点任意条件回看。';
      var q = cur.conds[focusCond];
      return '<div>核验 <span class="ev-pred">' + esc(q.pred) + '</span>（' + esc(q.name) + '）：' + esc(cur.who) + ' — ' + esc(q.detail) +
        ' → ' + (q.value ? '<span class="ev-ok">满足 ✓</span>' : '<span class="ev-no">不满足 ✗</span>') + '</div>' +
        '<div style="margin-top:4px">' + esc(q.note) + '</div>';
    }

    function renderVerdict(show) {
      var v = cur.verdict;
      verdictEl.className = "hp-verdict k-" + v.key + (show ? "" : " sym-pending");
      verdictEl.innerHTML = '<span class="v-chip">判定结论：' + esc(v.label) + '</span>' +
        '<div class="v-reason">' + (show ? v.reason : "逐项核验完成后给出判定结论…") + '</div>' +
        (show && v.insight ? '<div class="v-insight">💡 ' + esc(v.insight) + '</div>' : "");
      if (readEl) readEl.innerHTML = '<span class="hp-read-k">解读</span>' + esc((cfg.story || {}).read || "");
    }

    function statusHTML(pp, focusCond, verdictShown) {
      if (pp === 0) return cfg.introStatus + (scenario ? '<br><b>情境：</b>' + esc(scenario) : "");
      if (focusCond != null) {
        var q = cur.conds[focusCond];
        return '核验第 <b>' + (focusCond + 1) + '</b> 个前件 ' + esc(q.pred) + '（' + esc(q.name) + '）→ ' + (q.value ? '满足 ✓' : '<b>不满足 ✗</b>') + '。';
      }
      if (verdictShown) return '✅ <b>' + esc(cur.verdict.label) + '</b>　可点任意条件 / 谓词 / 图节点回看。';
      return "";
    }

    renderControls();
    renderLegend();
    renderStory();
    loadCase(0);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})(typeof window !== "undefined" ? window : globalThis);
