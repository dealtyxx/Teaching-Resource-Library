/* =====================================================================
 * 6.8 个人进步和国家发展案例 —— 三层统一交互引擎（人岗匹配谓词盘）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与本章其它小节同形）：选择个体 → 逐步核验
 *   点一步核验一个谓词条件 → 看反馈 → 看规则公式中对应谓词高亮
 *   → 看决策图节点高亮 → 应用推荐规则给出结论（推荐 / 暂不推荐）。
 *   完成后可点任意条件 / 谓词 / 图节点，跨视图联动高亮。
 *
 * 难度梯度：
 *   基础层（认识模型）：2 个谓词 S(x,j)、N(j)，把推荐要素抽象为谓词。
 *   进阶层（求解模型）：3 个谓词 S∧N∧W，UI + 假言推理；推不出 ≠ 推出否定（封闭世界假设）。
 *   拓展层（拓展模型）：4 个谓词、招聘/升学/分诊/科研多领域、可解释（指出失配条件）。
 * 舞台按案例六段式：情境背景 → 数学建模 → 交互求解 → 结果解读 → 价值引领 → 迁移思考。
 * ===================================================================== */
(function (global) {
  "use strict";

  function computeCase(c) {
    var conds = c.conds;
    var recommend = conds.every(function (q) { return q.value; });
    var fails = conds.filter(function (q) { return !q.value; });
    var action = c.action || "Recommend";
    var inst = action + "(" + c.who + ", " + c.job + ")";
    var verdict;
    if (recommend) {
      verdict = { key: "yes", label: c.yes || "推荐",
        reason: "规则前件在 x=" + c.who + "、j=" + c.job + " 上全部成立。先用全称指定（UI）把规则实例化，再用假言推理得 <b>" + inst + "</b>。" };
    } else {
      verdict = { key: "no", label: c.no || "暂不推荐",
        reason: "条件 <b>" + fails.map(function (q) { return q.pred; }).join("、") + "</b>（" + fails.map(function (q) { return q.name; }).join("、") + "）不成立 ⟹ 前件为假。此时规则实例（蕴含式）仍为真，但<b>推不出</b> " + inst + "；系统按『封闭世界假设』（推不出即视为否）输出「" + (c.no || "暂不推荐") + "」。" };
    }
    verdict.insight = c.insight || "";
    return { conds: conds, recommend: recommend, fails: fails, action: action, verdict: verdict, who: c.who, job: c.job };
  }
  function ruleText(c) {
    return "∀x∀j(( " + c.conds.map(function (q) { return q.pred; }).join(" ∧ ") + " ) → " + (c.action || "Recommend") + "(x,j) )";
  }

  /* ---------- 三层数据（六段式：情境背景 → 数学建模 → 交互求解 → 结果解读 → 价值引领 → 迁移思考） ---------- */
  var LEVELS = {
    basic: {
      introStatus: "选择一位同学，点「下一步」逐项核验两个谓词条件，看推荐规则能否推出结论。",
      story: {
        context: "学校就业指导中心设立『重点领域专项推荐』：把专业能力与岗位要求匹配、且岗位属于国家重点发展领域的同学，优先推荐到相应单位。怎样把这条政策写成计算机能执行、人人能核对的规则？",
        model: [["同学", "个体 x（论域 D₁）"], ["岗位", "个体 j（论域 D₂）"], ["能力与岗位匹配", "二元谓词 S(x,j)"], ["岗位属重点领域", "一元谓词 N(j)"], ["推荐政策", "∀x∀j((S(x,j) ∧ N(j)) → Recommend(x,j))"]],
        read: "规则只回答『由已知条件能否推出推荐』，前件缺一不可。它不评判个人选择，只让政策执行透明、可核对。",
        value: { title: "个人成长 · 融入国家发展", text: "谓词 S(x,j) 刻画个人所学，N(j) 刻画国家所需——两者同时为真，推荐才成立。把个人的专业积累投向国家重点领域，个人成长与国家发展就能同频共振。" },
        transfer: ["若再加一个条件『本人有意向 W(x,j)』，规则应如何改写？（见进阶层）", "『至少有一个岗位适合张明』如何用存在量词表达？"]
      },
      cases: [
        { label: "张明 → 人工智能工程师", who: "张明", job: "人工智能工程师",
          scenario: "两个谓词都为真，规则推出推荐。", action: "Recommend", yes: "推荐", no: "暂不推荐",
          insight: "所学对接所需，推荐顺理成章。",
          conds: [
            { pred: "S(x,j)", name: "能力与岗位匹配", detail: "修读机器学习、算法设计，有项目经历", value: true, note: "能力与岗位要求匹配，S(张明, 人工智能工程师) 为真。" },
            { pred: "N(j)", name: "岗位属重点领域", detail: "人工智能 · 在专项清单内", value: true, note: "岗位在重点领域清单内，N(人工智能工程师) 为真。" }
          ] },
        { label: "刘洋 → 集成电路设计", who: "刘洋", job: "集成电路设计岗", 
          scenario: "岗位属重点领域，但能力尚未匹配。", action: "Recommend", yes: "推荐", no: "暂不推荐",
          insight: "S(x,j) 为假不是终点——补修课程、参加实践后，谓词的真值会改变。",
          conds: [
            { pred: "S(x,j)", name: "能力与岗位匹配", detail: "尚未修读数字电路设计相关课程", value: false, note: "能力暂未达到岗位要求，S(刘洋, 集成电路设计岗) 为假。" },
            { pred: "N(j)", name: "岗位属重点领域", detail: "集成电路 · 在专项清单内", value: true, note: "N(集成电路设计岗) 为真。" }
          ] },
        { label: "李华 → 电商运营岗", who: "李华", job: "电商运营岗",
          scenario: "能力匹配，但岗位不在本专项的领域清单内。", action: "Recommend", yes: "推荐", no: "不在本专项范围",
          insight: "规则推不出推荐，只说明它不属于本专项；该岗位可走学校的常规就业推荐渠道。",
          conds: [
            { pred: "S(x,j)", name: "能力与岗位匹配", detail: "有运营实习经历", value: true, note: "S(李华, 电商运营岗) 为真。" },
            { pred: "N(j)", name: "岗位属重点领域", detail: "不在本专项清单内", value: false, note: "N(电商运营岗) 为假。" }
          ] }
      ]
    },
    advanced: {
      introStatus: "选择一位同学，逐项核验 S(x,j)、N(j)、W(x,j)，用规则 ∀x∀j((S∧N∧W)→Recommend(x,j)) 做推理。",
      story: {
        context: "专项推荐升级：除能力匹配、重点领域外，还要尊重本人意愿——本人有意向到该单位工作才推荐。三个条件如何组合成一条可推理的规则？",
        model: [["同学 / 岗位", "个体 x ∈ D₁，j ∈ D₂"], ["能力匹配", "S(x,j)"], ["重点领域", "N(j)"], ["本人意向", "W(x,j)"], ["推荐政策", "∀x∀j((S(x,j) ∧ N(j) ∧ W(x,j)) → Recommend(x,j))"]],
        read: "推理过程＝UI 实例化规则 + 逐项核验前件 + 假言推理。任一前件为假，规则仍成立但推不出结论——『推不出』与『推出否定』不是一回事。",
        value: { title: "个人成长 · 融入国家发展", text: "规则把能力、国家需要与个人意愿三者合取：国家发展需要人才主动投身，个人意愿同样被尊重。当三者统一，人岗相适、人尽其才。" },
        transfer: ["如果某条规则推出 Recommend，另一条规则推出 ¬Recommend，如何发现这种不一致？", "把规则库交给程序逐条执行，就是专家系统的前向推理（见 6.6 拓展层）。"]
      },
      cases: [
        { label: "张明 → 人工智能工程师", who: "张明", job: "人工智能工程师",
          scenario: "三个谓词都为真，规则推出推荐。", action: "Recommend", yes: "推荐", no: "暂不推荐",
          insight: "能力、领域、意愿统一，人岗相适。",
          conds: [
            { pred: "S(x,j)", name: "能力与岗位匹配", detail: "算法 + 系统开发", value: true, note: "S(张明, 人工智能工程师) 为真。" },
            { pred: "N(j)", name: "岗位属重点领域", detail: "人工智能", value: true, note: "N(人工智能工程师) 为真。" },
            { pred: "W(x,j)", name: "本人有意向", detail: "志愿表第一意向", value: true, note: "W(张明, 人工智能工程师) 为真。" }
          ] },
        { label: "陈静 → 数字乡村建设", who: "陈静", job: "数字乡村建设岗",
          scenario: "扎根基层的岗位同样属于重点领域。", action: "Recommend", yes: "推荐", no: "暂不推荐",
          insight: "基层一线同样是施展所学的舞台。",
          conds: [
            { pred: "S(x,j)", name: "能力与岗位匹配", detail: "数据分析 + 项目实施", value: true, note: "S 为真。" },
            { pred: "N(j)", name: "岗位属重点领域", detail: "乡村振兴", value: true, note: "N 为真。" },
            { pred: "W(x,j)", name: "本人有意向", detail: "主动报名基层项目", value: true, note: "W 为真。" }
          ] },
        { label: "赵磊 → 量化交易岗", who: "赵磊", job: "量化交易岗",
          scenario: "岗位不在本专项的领域清单内，N(j) 为假。", action: "Recommend", yes: "推荐", no: "不在本专项范围",
          insight: "推不出专项推荐，不等于否定这份职业选择；规则的边界要看清。",
          conds: [
            { pred: "S(x,j)", name: "能力与岗位匹配", detail: "数据分析能力强", value: true, note: "S 为真。" },
            { pred: "N(j)", name: "岗位属重点领域", detail: "不在本专项清单内", value: false, note: "N(量化交易岗) 为假。" },
            { pred: "W(x,j)", name: "本人有意向", detail: "有意向", value: true, note: "W 为真。" }
          ] },
        { label: "孙浩 → 航天工程师", who: "孙浩", job: "航天工程师",
          scenario: "能力与领域都满足，但本人已与其他单位签约，W(x,j) 为假。", action: "Recommend", yes: "推荐", no: "暂不推荐",
          insight: "规则尊重个人意愿：W(x,j) 为假时不推荐，体现『合取前件缺一不可』。",
          conds: [
            { pred: "S(x,j)", name: "能力与岗位匹配", detail: "航天系统设计", value: true, note: "S 为真。" },
            { pred: "N(j)", name: "岗位属重点领域", detail: "航空航天", value: true, note: "N 为真。" },
            { pred: "W(x,j)", name: "本人有意向", detail: "已与其他单位签约", value: false, note: "W(孙浩, 航天工程师) 为假。" }
          ] }
      ]
    },
    extend: {
      introStatus: "选择一个匹配场景，逐项核验谓词约束，用规则推理给出可解释的匹配结论。",
      story: {
        context: "招聘、升学志愿、医院分诊……各类『智能匹配系统』背后都是同一种结构：一组谓词条件的合取蕴含一个动作。系统不仅要给出结论，还要能解释『为什么匹配 / 为什么不匹配』。",
        model: [["候选对象 / 目标", "个体 x、j"], ["属性条件", "一元谓词 P(x)、P(j)"], ["匹配关系", "二元谓词 M(x,j)"], ["匹配规则", "∀x∀j(条件合取 → Action(x,j))"], ["解释", "列出为假的前件（失配条件）"]],
        read: "可解释性来自逻辑本身：结论为『否』时，指出哪一个前件为假，就是最直接的解释；多条规则并存时还要检查彼此是否一致。",
        value: { title: "规则透明 · 公平可问责", text: "把匹配标准写成公开的谓词规则，每一次结论都能追溯到具体条件——这让算法决策透明、公平、可问责，也让技术更好地服务国家发展与人民需要。" },
        transfer: ["分诊场景中，¬Cap(j) ∧ Ref(j) → Transfer(x,j) 是另一条规则，两条规则会冲突吗？", "如何把规则库与机器学习打分结合，同时保持可解释？"]
      },
      cases: [
        { label: "招聘 · 李工 → 后端工程师岗", who: "李工", job: "后端工程师岗",
          scenario: "招聘匹配 = 多谓词合取的规则推理，每一步可解释。", action: "Hire", yes: "录用推荐", no: "不予录用",
          insight: "四个约束全部满足，结论可逐条追溯。",
          conds: [
            { pred: "Q(x)", name: "资格达标", detail: "学历 / 经验满足岗位说明", value: true, note: "硬性资格通过。" },
            { pred: "R(j)", name: "岗位在招", detail: "该岗位开放招聘", value: true, note: "岗位有效。" },
            { pred: "M(x,j)", name: "技能匹配", detail: "技能与岗位匹配度高", value: true, note: "二元谓词：人岗匹配。" },
            { pred: "C(x,j)", name: "无时间地点冲突", detail: "到岗时间 / 地点无冲突", value: true, note: "约束满足。" }
          ] },
        { label: "升学 · 小林 → 某校计算机专业", who: "小林", job: "某校计算机专业",
          scenario: "可解释匹配会指出究竟哪一条约束未满足。", action: "Suggest", yes: "建议填报", no: "暂不建议",
          insight: "结论为否时，失配条件 L(x,j) 就是解释：可换校区或专业方向后重新匹配。",
          conds: [
            { pred: "G(x)", name: "成绩达线", detail: "分数过往年投档线", value: true, note: "成绩满足。" },
            { pred: "P(x,j)", name: "兴趣与专业匹配", detail: "兴趣与专业方向一致", value: true, note: "二元谓词：人与专业匹配。" },
            { pred: "D(j)", name: "招生计划允许", detail: "省份 / 批次有招生计划", value: true, note: "政策允许。" },
            { pred: "L(x,j)", name: "校区与学制可接受", detail: "该专业在异地校区，本人不接受", value: false, note: "L(小林, 某校计算机专业) 为假。" }
          ] },
        { label: "分诊 · 王女士 → 心内科", who: "王女士", job: "心内科",
          scenario: "床位约束不满足时，本规则推不出分诊，由另一条转诊规则接手。", action: "Triage", yes: "分诊到该科", no: "本规则不触发",
          insight: "Cap(j) 为假导致本规则不触发；另一条规则 ¬Cap(j) ∧ Ref(j) → Transfer(x,j) 给出转诊方案——多条规则分工协作。",
          conds: [
            { pred: "Sy(x,j)", name: "症状匹配科室", detail: "症状指向心内科", value: true, note: "症状匹配。" },
            { pred: "U(x)", name: "需优先处理", detail: "紧急度评估为高", value: true, note: "紧急度高。" },
            { pred: "Doc(j)", name: "有值班医生", detail: "心内科值班医生在岗", value: true, note: "Doc(心内科) 为真。" },
            { pred: "Cap(j)", name: "科室有床位", detail: "当前无空床", value: false, note: "容量约束不满足，Cap(心内科) 为假。" }
          ] },
        { label: "科研 · 周同学 → 重点实验室", who: "周同学", job: "重点实验室",
          scenario: "能力、领域、志向、坚持四者统一，规则推出推荐。", action: "Recommend", yes: "推荐报考", no: "暂不推荐",
          insight: "关键核心技术攻关需要长期投入，能力与志向缺一不可。",
          conds: [
            { pred: "S(x,j)", name: "科研能力匹配", detail: "有相关科研训练", value: true, note: "能力。" },
            { pred: "N(j)", name: "关键核心技术方向", detail: "实验室承担攻关任务", value: true, note: "国家需要。" },
            { pred: "I(x,j)", name: "志向与方向一致", detail: "立志从事该方向研究", value: true, note: "志向。" },
            { pred: "B(x)", name: "愿长期投入", detail: "愿坐『冷板凳』长期攻关", value: true, note: "坚持。" }
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
    var whoEl = byId("carWho");
    var ruleEl = byId("carRule");
    var condsEl = byId("carConds");
    var evalEl = byId("carEval");
    var graphEl = byId("carGraph");
    var verdictEl = byId("carVerdict");
    var storyEl = byId("carStory"), modelEl = byId("carModel"), valueEl = byId("carValue"), transferEl = byId("carTransfer"), readEl = byId("carRead");
    if (!controlsEl || !whoEl) return;

    var cur = null, scenario = "", action = "Recommend";
    var p = 0, manualFocus = null, autoTimer = null;
    var predSpans = [], condEls = [], nodeEls = [], recNode = null;
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.cases.map(function (c, i) { return '<option value="' + i + '">' + esc(c.label) + '</option>'; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label><span>选择个体 / 场景</span><small>x → j</small></label>' +
          '<select id="carSelect">' + opts + '</select></div>' +
        '<div class="control-group"><label><span>逐项核验</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button class="sym-step-btn" id="carPrev">◀ 上一步</button>' +
            '<button class="sym-step-btn sym-primary" id="carNext">下一步 ▶</button>' +
            '<button class="sym-step-btn" id="carAuto">⏵ 自动播放</button>' +
            '<button class="sym-step-btn sym-ghost" id="carReset">↺ 重置</button>' +
          '</div>' +
          '<div class="sym-speed"><span>慢</span><input type="range" id="carSpeed" min="1" max="100" value="55" aria-label="自动播放速度"><span>快</span></div>' +
        '</div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="carProgBar"></i></div>' +
          '<span class="sym-progress-num" id="carProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="carStatus"></div></div>';
      statusEl = byId("carStatus"); progBar = byId("carProgBar"); progNum = byId("carProgNum");
      prevBtn = byId("carPrev"); nextBtn = byId("carNext"); autoBtn = byId("carAuto");
      byId("carSelect").addEventListener("change", function (e) { loadCase(+e.target.value); });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("carReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
      byId("carSpeed").addEventListener("input", function () { if (autoTimer) { stopAuto(); toggleAuto(); } });
    }
    function autoDelay() { var sp = byId("carSpeed"); return Math.max(280, 1500 - Number(sp ? sp.value : 55) * 12); }

    /* 六段式中的静态段：情境背景 / 数学建模映射 / 价值引领 / 迁移思考 */
    function renderStory() {
      var st = cfg.story || {};
      if (storyEl) storyEl.innerHTML = '<p>' + esc(st.context || "") + '</p>';
      if (modelEl) modelEl.innerHTML = (st.model || []).map(function (m) {
        return '<div class="car-map"><span class="m-real">' + esc(m[0]) + '</span><span class="m-arrow">→</span><span class="m-math">' + esc(m[1]) + '</span></div>';
      }).join("");
      if (valueEl && st.value) valueEl.innerHTML = '<div class="car-value-title">🚩 ' + esc(st.value.title) + '</div><p>' + esc(st.value.text) + '</p>';
      if (transferEl) transferEl.innerHTML = '<ol>' + (st.transfer || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ol>';
    }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      box.innerHTML = '<div class="legend-title">谓词与规则说明</div><div class="legend-grid">' +
        [["∀x∀j", "对所有个体 x 与目标 j"],
         ["P(x)", "一元谓词 · 个体的属性"],
         ["R(x,j)", "二元谓词 · x 与 j 的关系"],
         ["∧", "合取 · 条件都要满足"],
         ["→", "蕴含 · 前件全真才能推出结论"],
         ["✓ / ✗", "条件满足 / 不满足"]].map(function (it) {
          return '<div class="legend-item"><span class="sym">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + '</span></div>';
        }).join("") + '</div>';
    }

    function loadCase(idx) {
      stopAuto();
      cur = computeCase(cfg.cases[idx]);
      var c = cfg.cases[idx];
      scenario = c.scenario || ""; action = cur.action;
      p = 0; manualFocus = null;
      if (storyEl) storyEl.innerHTML = '<p>' + esc((cfg.story || {}).context || "") + '</p><p class="car-case-line"><b>本例：</b>' + esc(c.label) + ' —— ' + esc(scenario) + '</p>';
      renderWho(c);
      renderRule(c);
      renderConds();
      renderGraph();
      evalEl.innerHTML = "";
      render();
    }

    function renderWho(c) {
      whoEl.innerHTML = '<span class="who-name">' + esc(c.who) + '</span><span class="who-job">→ ' + esc(c.job) + '</span>' +
        '<span class="who-tag">个体 x，候选岗位 j · 共 ' + cur.conds.length + ' 个谓词条件</span>';
    }

    function renderRule(c) {
      ruleEl.innerHTML = "";
      ruleEl.appendChild(document.createTextNode("∀x∀j(( "));
      cur.conds.forEach(function (q, k) {
        if (k > 0) ruleEl.appendChild(document.createTextNode(" ∧ "));
        var sp = document.createElement("span");
        sp.className = "car-pred"; sp.dataset.k = k; sp.textContent = q.pred;
        sp.addEventListener("click", function () { clickCond(k); });
        ruleEl.appendChild(sp);
        predSpans[k] = sp;
      });
      predSpans.length = cur.conds.length;
      var tail = document.createElement("span");
      tail.className = "car-head-q";
      tail.textContent = " ) → " + action + "(x,j) )";
      ruleEl.appendChild(tail);
    }

    function renderConds() {
      condsEl.innerHTML = "";
      condEls = cur.conds.map(function (q, k) {
        var d = document.createElement("div");
        d.className = "car-cond"; d.dataset.k = k;
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
      var svg = svgEl("svg", { id: "carGraph", viewBox: "0 0 " + VW + " " + H, width: "100%", height: H });
      var g = svgEl("g"); svg.appendChild(g);

      // 边：条件 -> 合取门 -> 推荐
      nodeEls = [];
      cur.conds.forEach(function (q, k) {
        var y = topPad + k * (nodeH + gap) + nodeH / 2;
        g.appendChild(svgEl("path", { d: "M " + (16 + nodeW) + " " + y + " Q " + (gateX - 60) + " " + y + " " + (gateX - gateR) + " " + centerY, stroke: "#c9a99a", "stroke-width": 1.6, fill: "none", opacity: 0.4, "stroke-dasharray": "" }));
      });
      g.appendChild(svgEl("path", { d: "M " + (gateX + gateR) + " " + centerY + " L " + recX + " " + centerY, stroke: "#c58a1f", "stroke-width": 2, fill: "none", opacity: 0.7 }));

      // 条件节点
      cur.conds.forEach(function (q, k) {
        var y = topPad + k * (nodeH + gap);
        var ng = svgEl("g"); ng.setAttribute("class", "car-node"); ng.dataset.k = k;
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
      var gt = svgEl("text", { x: gateX, y: centerY, "text-anchor": "middle", "dominant-baseline": "central", fill: "#d63b1d", "font-size": 22, "font-weight": "800" }); gt.textContent = "∧";
      gate.appendChild(gt); g.appendChild(gate);

      // 推荐节点
      var rg = svgEl("g"); rg.setAttribute("class", "car-node");
      var rrect = svgEl("rect", { x: recX, y: centerY - recH / 2, width: recW, height: recH, rx: 11, fill: "#eee", stroke: "#cfc3bb", "stroke-width": 2 });
      var rt1 = svgEl("text", { x: recX + recW / 2, y: centerY - 8, "text-anchor": "middle", fill: "#2c1810", "font-size": 14, "font-weight": "800", "font-family": "JetBrains Mono, monospace" }); rt1.textContent = action + "(x,j)";
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

      // 推荐节点
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
      if (focusCond == null && verdictShown) return '已核验全部 <b>' + cur.conds.length + '</b> 个条件，下方给出推荐结论。可点任意条件回看。';
      var q = cur.conds[focusCond];
      return '<div>核验 <span class="ev-pred">' + esc(q.pred) + '</span>（' + esc(q.name) + '）：' + esc(cur.who) + ' — ' + esc(q.detail) +
        ' → ' + (q.value ? '<span class="ev-ok">满足 ✓</span>' : '<span class="ev-no">不满足 ✗</span>') + '</div>' +
        '<div style="margin-top:4px">' + esc(q.note) + '</div>';
    }

    function renderVerdict(show) {
      var v = cur.verdict;
      verdictEl.className = "car-verdict k-" + v.key + (show ? "" : " sym-pending");
      verdictEl.innerHTML = '<span class="v-chip">推荐结论：' + esc(v.label) + '</span>' +
        '<div class="v-reason">' + (show ? v.reason : "逐项核验完成后给出推荐结论…") + '</div>' +
        (show && v.insight ? '<div class="v-insight">💡 ' + esc(v.insight) + '</div>' : "");
      if (readEl) readEl.innerHTML = '<span class="car-read-k">解读</span>' + esc((cfg.story || {}).read || "");
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
