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
 *   基础层：2 个谓词（S 技能、N 国家需求），把推荐要素抽象为谓词。
 *   进阶层：3 个谓词（S∧N∧B），∀x∀j 规则推理推荐，家国情怀主线。
 *   拓展层：4 个谓词、招聘/择校/分诊/志愿多领域、可解释（指出失配条件）。
 * ===================================================================== */
(function (global) {
  "use strict";

  function computeCase(c) {
    var conds = c.conds;
    var recommend = conds.every(function (q) { return q.value; });
    var fails = conds.filter(function (q) { return !q.value; });
    var action = c.action || "Recommend";
    var verdict;
    if (recommend) {
      verdict = { key: "yes", label: c.yes || "推荐",
        reason: "全部前件条件成立 ⟹ 规则触发，<b>" + action + "(" + c.who + ", " + c.job + ")</b> 为真。" };
    } else {
      verdict = { key: "no", label: c.no || "暂不推荐",
        reason: "条件 <b>" + fails.map(function (q) { return q.pred; }).join("、") + "</b>（" + fails.map(function (q) { return q.name; }).join("、") + "）不满足 ⟹ 规则前件为假，不触发 " + action + "。" };
    }
    verdict.insight = c.insight || "";
    return { conds: conds, recommend: recommend, fails: fails, action: action, verdict: verdict };
  }
  function ruleText(c) {
    return "∀x∀j(( " + c.conds.map(function (q) { return q.pred; }).join(" ∧ ") + " ) → " + (c.action || "Recommend") + "(x,j) )";
  }

  /* ---------- 三层数据 ---------- */
  var LEVELS = {
    basic: {
      introStatus: "选择一位学生，点「下一步」逐项核验谓词条件，看推荐规则如何由前件推出岗位建议。",
      cases: [
        { label: "张明 → 人工智能工程师", who: "张明", job: "人工智能工程师",
          scenario: "把『有技能』『国家需要』抽象成谓词 S(x)、N(j)。",
          action: "Recommend", yes: "推荐上岗", no: "暂不推荐",
          insight: "技能对接国家需求，个人成长汇入时代洪流。",
          conds: [
            { pred: "S(x)", name: "具备核心技能", detail: "算法设计 + 编程开发", value: true, note: "个人努力：x 掌握岗位所需技能。" },
            { pred: "N(j)", name: "国家战略需求", detail: "人工智能 ★★★★★", value: true, note: "时代方向：岗位 j 属国家急需领域。" }
          ] },
        { label: "李华 → 网红带货岗", who: "李华", job: "网红带货岗",
          scenario: "当『国家需求』谓词为假时，规则前件不成立。",
          action: "Recommend", yes: "推荐上岗", no: "暂不推荐",
          insight: "个人能力之外，更要看是否对接国家与人民需要。",
          conds: [
            { pred: "S(x)", name: "具备核心技能", detail: "具备相关技能", value: true, note: "x 有一定技能。" },
            { pred: "N(j)", name: "国家战略需求", detail: "非国家战略急需", value: false, note: "该岗位不属国家战略急需领域，N(j) 为假。" }
          ] },
        { label: "王芳 → 航空航天", who: "王芳", job: "航空航天工程师",
          scenario: "两个谓词都为真，规则推出推荐。",
          action: "Recommend", yes: "推荐上岗", no: "暂不推荐",
          insight: "把所学投向国家重大工程，正是成才的舞台。",
          conds: [
            { pred: "S(x)", name: "具备核心技能", detail: "材料科学 + 工程实施", value: true, note: "x 掌握岗位所需技能。" },
            { pred: "N(j)", name: "国家战略需求", detail: "航空航天 ★★★★★", value: true, note: "岗位 j 属国家急需领域。" }
          ] }
      ]
    },
    advanced: {
      introStatus: "选择一位学生，逐项核验 S(x)、N(j)、B(x)，用规则 ∀x∀j((S∧N∧B)→Recommend) 做匹配推荐。",
      cases: [
        { label: "张明 → 人工智能", who: "张明", job: "人工智能工程师",
          scenario: "三个谓词都为真，规则推出推荐。",
          action: "Recommend", yes: "推荐上岗", no: "暂不推荐",
          insight: "技能、国家需求、奉献意愿统一，人岗相适、人尽其才。",
          conds: [
            { pred: "S(x)", name: "具备核心技能", detail: "算法 + 系统架构", value: true, note: "个人努力。" },
            { pred: "N(j)", name: "国家战略需求", detail: "人工智能 ★★★★★", value: true, note: "时代方向。" },
            { pred: "B(x)", name: "奉献服务意愿", detail: "愿到国家重点单位", value: true, note: "人民需要：愿把理想融入国家发展。" }
          ] },
        { label: "赵磊 → 金融投机岗", who: "赵磊", job: "金融投机岗",
          scenario: "国家战略需求 N(j) 为假，规则前件不成立。",
          action: "Recommend", yes: "推荐上岗", no: "暂不推荐",
          insight: "能力强也要看方向——是否服务国家与人民的真实需要。",
          conds: [
            { pred: "S(x)", name: "具备核心技能", detail: "数据分析能力强", value: true, note: "x 能力达标。" },
            { pred: "N(j)", name: "国家战略需求", detail: "短期投机、非战略", value: false, note: "岗位不属国家战略急需，N(j) 假。" },
            { pred: "B(x)", name: "奉献服务意愿", detail: "愿服务", value: true, note: "意愿尚可。" }
          ] },
        { label: "陈静 → 数字乡村", who: "陈静", job: "数字乡村建设",
          scenario: "扎根基层、对接国家需求，规则推出推荐。",
          action: "Recommend", yes: "推荐上岗", no: "暂不推荐",
          insight: "把论文写在祖国大地上——基层也是成才舞台。",
          conds: [
            { pred: "S(x)", name: "具备核心技能", detail: "工程实施 + 数据分析", value: true, note: "技能达标。" },
            { pred: "N(j)", name: "国家战略需求", detail: "乡村振兴 ★★★★", value: true, note: "国家重点方向。" },
            { pred: "B(x)", name: "奉献服务意愿", detail: "愿扎根基层乡村", value: true, note: "愿服务人民。" }
          ] },
        { label: "孙浩 → 航天（暂缓）", who: "孙浩", job: "航天工程师",
          scenario: "技能与需求都满足，但奉献意愿 B(x) 为假，规则暂不触发。",
          action: "Recommend", yes: "推荐上岗", no: "暂缓推荐",
          insight: "个人理想若不愿融入国家需要，再好的能力也难尽其才。",
          conds: [
            { pred: "S(x)", name: "具备核心技能", detail: "航天系统设计", value: true, note: "技能很强。" },
            { pred: "N(j)", name: "国家战略需求", detail: "航空航天 ★★★★★", value: true, note: "国家急需。" },
            { pred: "B(x)", name: "奉献服务意愿", detail: "暂不愿离开大城市", value: false, note: "奉献意愿不足，B(x) 假。" }
          ] }
      ]
    },
    extend: {
      introStatus: "选择一个匹配场景，逐项核验谓词约束，用规则推理给出可解释的匹配结论。",
      cases: [
        { label: "招聘 · 候选人李工 → 后端岗", who: "李工", job: "后端工程师岗",
          scenario: "招聘匹配 = 多谓词合取的规则推理，每一步可解释。",
          action: "Hire", yes: "录用推荐", no: "不予录用",
          insight: "智能招聘的内核是谓词规则推理：可追溯、可解释。",
          conds: [
            { pred: "Q(x)", name: "资格达标", detail: "学历/经验满足 JD", value: true, note: "硬性资格通过。" },
            { pred: "R(j)", name: "岗位在招", detail: "该岗位开放招聘", value: true, note: "岗位有效。" },
            { pred: "M(x,j)", name: "技能匹配", detail: "技能与岗位匹配度高", value: true, note: "二元谓词：人岗匹配。" },
            { pred: "C(x,j)", name: "无冲突约束", detail: "到岗时间/地点无冲突", value: true, note: "约束满足。" }
          ] },
        { label: "择校 · 考生小林 → 计算机专业", who: "小林", job: "某校计算机专业",
          scenario: "可解释匹配会指出究竟哪一条约束未满足。",
          action: "Admit", yes: "建议填报", no: "暂不建议",
          insight: "好的匹配系统不仅给结论，更能解释为何不匹配。",
          conds: [
            { pred: "G(x)", name: "成绩达线", detail: "分数过投档线", value: true, note: "成绩满足。" },
            { pred: "P(x,j)", name: "专业匹配兴趣", detail: "兴趣与专业一致", value: true, note: "人专业匹配。" },
            { pred: "D(j)", name: "招生政策允许", detail: "地域/批次允许", value: true, note: "政策允许。" },
            { pred: "F(x)", name: "家庭可承担", detail: "学费/生活费超出预算", value: false, note: "经济约束未满足，F(x) 假。" }
          ] },
        { label: "医疗 · 患者王女士 → 心内科", who: "王女士", job: "心内科",
          scenario: "约束（床位容量）不满足时，应给出可解释的替代方案。",
          action: "Triage", yes: "分诊到该科", no: "改派 / 转诊",
          insight: "容量约束触发改派——规则推理让分诊透明、可问责。",
          conds: [
            { pred: "Sy(x,j)", name: "症状匹配科室", detail: "症状指向心内科", value: true, note: "症状匹配。" },
            { pred: "U(x)", name: "紧急度达标", detail: "需优先处理", value: true, note: "紧急度高。" },
            { pred: "Cap(j)", name: "科室有床位", detail: "暂无床位", value: false, note: "容量约束不满足，Cap(j) 假。" },
            { pred: "Ref(j)", name: "可转诊", detail: "可转上级医院", value: true, note: "存在替代路径。" }
          ] },
        { label: "志愿 · 周同学 → 国家重点实验室", who: "周同学", job: "国家重点实验室",
          scenario: "能力、国家需求、兴趣、奉献四者统一，规则推出推荐。",
          action: "Recommend", yes: "推荐填报", no: "暂不推荐",
          insight: "把论文写在祖国大地上——能力、兴趣、国家需要与奉献的统一。",
          conds: [
            { pred: "S(x)", name: "能力达标", detail: "科研创新能力强", value: true, note: "能力。" },
            { pred: "N(j)", name: "国家急需", detail: "关键核心技术攻关", value: true, note: "国家需求。" },
            { pred: "I(x)", name: "兴趣志向", detail: "立志科技报国", value: true, note: "兴趣志向。" },
            { pred: "B(x)", name: "奉献意愿", detail: "愿坐冷板凳长期攻关", value: true, note: "奉献。" }
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
            '<button class="sym-step-btn" id="carReset">↺ 重置</button>' +
          '</div></div>' +
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
    }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      box.innerHTML = '<div class="legend-title">谓词与规则说明</div><div class="legend-grid">' +
        [["∀x∀j", "对所有学生 x 与岗位 j"],
         ["P(x)", "一元谓词 · x 的属性"],
         ["R(x,j)", "二元谓词 · x 与 j 的关系"],
         ["∧", "合取 · 条件都要满足"],
         ["→", "蕴含 · 前件成立则推荐"],
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
        g.appendChild(svgEl("path", { d: "M " + (16 + nodeW) + " " + y + " Q " + (gateX - 60) + " " + y + " " + (gateX - gateR) + " " + centerY, stroke: "#b39", "stroke-width": 1.6, fill: "none", opacity: 0.4, "stroke-dasharray": "" }));
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
      autoTimer = setInterval(function () { if (p >= total()) { stopAuto(); return; } manualFocus = null; p += 1; render(); }, 1000);
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
          recNode.txt.textContent = cur.recommend ? "成立 ✓ 推荐" : "前件假 ✗";
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
    }

    function statusHTML(pp, focusCond, verdictShown) {
      if (pp === 0) return cfg.introStatus + (scenario ? '<br><b>情境：</b>' + esc(scenario) : "");
      if (focusCond != null) {
        var q = cur.conds[focusCond];
        return '核验第 <b>' + (focusCond + 1) + '</b> 个谓词 ' + esc(q.pred) + '（' + esc(q.name) + '）→ ' + (q.value ? '满足 ✓' : '<b>不满足 ✗</b>') + '。';
      }
      if (verdictShown) return '✅ <b>' + esc(cur.verdict.label) + '</b>　可点任意条件 / 谓词 / 图节点回看。';
      return "";
    }

    renderControls();
    renderLegend();
    loadCase(0);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})(typeof window !== "undefined" ? window : globalThis);
