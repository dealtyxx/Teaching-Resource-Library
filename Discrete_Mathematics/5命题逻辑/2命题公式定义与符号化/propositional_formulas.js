/* =====================================================================
 * 5.2 命题公式定义与符号化 —— 三层统一交互引擎
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（三层一致，与 6.1 谓词符号化同形）：选择语句 → 逐步演示
 *   点一步 → 看反馈（当前符号说明）→ 看符号序列高亮 → 看公式项高亮 → 看结构树高亮
 *   完成后可点击任意词块 / 原子公式 / 树叶，跨视图联动高亮对应关系。
 *
 * 难度梯度：
 *   基础层：单联结词（∧ ∨ →），原子 p/q，综合 1 步，精简图例。
 *   进阶层：当且仅当 ↔、只有…才（必要条件）、除非、否定辖域与括号，综合 3 步。
 *   拓展层：形式规约、合同条款、矛盾/可满足性（UNSAT）、嵌套括号，综合 3~4 步。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* ---------- 词类（原子命题 / 联结词 / 否定） ---------- */
  var CATS = {
    prop: { name: "原子命题", color: "#2f5f9f" },
    conn: { name: "联结词", color: "#2f7d57" },
    neg:  { name: "否定", color: "#b42318" }
  };

  function seg(x, i) { return { x: x, i: (i === undefined ? -1 : i) }; }

  /* ---------- 三层数据 ---------- */
  var LEVELS = {
    /* ================= 基础层 ================= */
    basic: {
      introStatus: "选择一句陈述，点击「下一步」逐段抽出原子命题 p/q，识别联结词，拼出命题公式。",
      legend: [
        ["p, q", "原子命题（命题变元）"],
        ["¬", "否定 · 非 / 并非"],
        ["∧", "合取 · 并且"],
        ["∨", "析取 · 或者"],
        ["→", "蕴含 · 如果…那么"]
      ],
      treeGroups: [
        { cat: "prop", label: "原子命题", color: "#2f5f9f" },
        { cat: "conn", label: "联结词", color: "#2f7d57" },
        { cat: "neg", label: "否定", color: "#b42318" }
      ],
      sentences: [
        {
          label: "坚持党的领导并且依法治国",
          tokens: [
            { t: "坚持党的领导", c: "prop", sym: "p", note: "原子命题 p：一个不再分解的简单陈述。" },
            { t: "并且", c: "conn", sym: "∧", note: "联结词『并且』对应合取 ∧：两者都要成立。" },
            { t: "依法治国", c: "prop", sym: "q", note: "原子命题 q。" }
          ],
          synthesis: [
            { label: "整句符号化", segs: [seg("p", 0), seg(" ∧ ", 1), seg("q", 2)],
              note: "读法：p 且 q——坚持党的领导，并且依法治国，两者同时成立。" }
          ]
        },
        {
          label: "如果经济发展那么保护环境",
          tokens: [
            { t: "如果", c: "conn", sym: "→", note: "『如果…那么…』是蕴含 →，引出前件。" },
            { t: "经济发展", c: "prop", sym: "p", note: "前件命题 p。" },
            { t: "那么", c: "conn", sym: "→", note: "『那么』引出后件，与『如果』共同构成 →。" },
            { t: "保护环境", c: "prop", sym: "q", note: "后件命题 q。" }
          ],
          synthesis: [
            { label: "整句符号化", segs: [seg("p", 1), seg(" → ", 0), seg("q", 3)],
              note: "读法：如果 p 则 q。注意箭头方向——前件在左，后件在右，不能写反。" }
          ]
        },
        {
          label: "可以乘公交或者乘地铁",
          tokens: [
            { t: "乘公交", c: "prop", sym: "p", note: "原子命题 p：乘公交。" },
            { t: "或者", c: "conn", sym: "∨", note: "联结词『或者』对应析取 ∨：至少一个成立（相容或）。" },
            { t: "乘地铁", c: "prop", sym: "q", note: "原子命题 q：乘地铁。" }
          ],
          synthesis: [
            { label: "整句符号化", segs: [seg("p", 0), seg(" ∨ ", 1), seg("q", 2)],
              note: "读法：p 或 q——可以乘公交，或者乘地铁，至少选其一。" }
          ]
        }
      ]
    },

    /* ================= 进阶层 ================= */
    advanced: {
      introStatus: "选择一句陈述，逐步辨析『当且仅当 / 只有…才 / 除非』与否定辖域，必要时加括号消歧。",
      legend: [
        ["p, q", "原子命题"],
        ["¬", "否定 · 非"],
        ["∧", "合取 · 并且"],
        ["∨", "析取 · 或"],
        ["→", "蕴含 · 如果…那么"],
        ["↔", "等价 · 当且仅当"],
        ["( )", "括号 · 改变优先级"],
        ["优先级", "¬ > ∧ > ∨ > → > ↔"]
      ],
      treeGroups: [
        { cat: "prop", label: "原子命题", color: "#2f5f9f" },
        { cat: "conn", label: "联结词", color: "#2f7d57" },
        { cat: "neg", label: "否定", color: "#b42318" }
      ],
      sentences: [
        {
          label: "人民幸福当且仅当国家富强",
          tokens: [
            { t: "人民幸福", c: "prop", sym: "p", note: "原子命题 p。" },
            { t: "当且仅当", c: "conn", sym: "↔", note: "『当且仅当』对应等价 ↔：双向蕴含，同真同假。" },
            { t: "国家富强", c: "prop", sym: "q", note: "原子命题 q。" }
          ],
          synthesis: [
            { label: "① 识别联结词", text: "『当且仅当』 ⟹ ↔（双向）", note: "等价 = (p→q) ∧ (q→p)。" },
            { label: "② 整句符号化", segs: [seg("p", 0), seg(" ↔ ", 1), seg("q", 2)],
              note: "p ↔ q：人民幸福与国家富强互为充要条件。" },
            { label: "③ 易错提醒", text: "↔ ≠ →：等价是双向，蕴含是单向。", note: "『当且仅当』不能只写成 →。" }
          ]
        },
        {
          label: "只有努力才能成功",
          tokens: [
            { t: "只有", c: "conn", sym: "→(必要)", note: "『只有…才…』：其后是结论的必要条件。" },
            { t: "努力", c: "prop", sym: "p", note: "命题 p：努力（必要条件）。" },
            { t: "才能", c: "conn", sym: "→", note: "『才』强调必要性，决定箭头方向。" },
            { t: "成功", c: "prop", sym: "q", note: "命题 q：成功。" }
          ],
          synthesis: [
            { label: "① 辨析方向", text: "只有 p 才 q　⟹　q → p", note: "必要条件：成功必须努力，故 成功→努力。" },
            { label: "② 整句符号化", segs: [seg("q", 3), seg(" → ", 2), seg("p", 1)],
              note: "成功 → 努力（q→p）。方向与『如果…那么』相反，最易错。" },
            { label: "③ 对照", text: "如果 p 那么 q ⟹ p→q；只有 p 才 q ⟹ q→p", note: "充分条件 vs 必要条件，箭头方向不同。" }
          ]
        },
        {
          label: "除非下雨否则比赛照常",
          tokens: [
            { t: "除非", c: "conn", sym: "¬…→", note: "『除非 p 否则 q』⟺ ¬p → q ⟺ p ∨ q。" },
            { t: "下雨", c: "prop", sym: "p", note: "命题 p：下雨。" },
            { t: "否则", c: "conn", sym: "→", note: "引出『否则』之后的结果。" },
            { t: "比赛照常", c: "prop", sym: "q", note: "命题 q：比赛照常举行。" }
          ],
          synthesis: [
            { label: "① 改写『除非』", text: "除非 p 否则 q　⟺　¬p → q", note: "也等价于 p ∨ q。" },
            { label: "② 整句符号化", segs: [seg("¬", 0), seg("p", 1), seg(" → ", 2), seg("q", 3)],
              note: "¬下雨 → 比赛照常：只要不下雨，比赛就照常。" },
            { label: "③ 等价形式", text: "¬p → q　⟺　p ∨ q", note: "下雨或比赛照常，至少其一成立。" }
          ]
        },
        {
          label: "并非既努力又幸运",
          tokens: [
            { t: "并非", c: "neg", sym: "¬", note: "否定作用于其后整个合取式，必须加括号锁定辖域。" },
            { t: "努力", c: "prop", sym: "p", note: "命题 p：努力。" },
            { t: "并且", c: "conn", sym: "∧", note: "『既…又…』对应合取 ∧。" },
            { t: "幸运", c: "prop", sym: "q", note: "命题 q：幸运。" }
          ],
          synthesis: [
            { label: "① 默认优先级", text: "¬ 优先级最高：¬p ∧ q = (¬p) ∧ q", note: "不加括号会被理解成『不努力，且幸运』。" },
            { label: "② 加括号消歧", segs: [seg("¬", 0), seg("(", -1), seg("p", 1), seg(" ∧ ", 2), seg("q", 3), seg(")", -1)],
              note: "原意是『并非(努力且幸运)』，必须写 ¬(p ∧ q)。" },
            { label: "③ 价值提醒", text: "一个括号改变含义。", note: "符号化要字斟句酌，消除歧义。" }
          ]
        }
      ]
    },

    /* ================= 拓展层 ================= */
    extend: {
      introStatus: "把制度 / 合同表述编码为命题公式：逐步嵌套括号，用真值表 / 可满足性检测条款矛盾。",
      legend: [
        ["p, q, r", "命题 / 条款"],
        ["¬", "否定 / 排除"],
        ["∧", "合取（且）"],
        ["∨", "析取（或）"],
        ["→", "蕴含（规则）"],
        ["↔", "等价（充要）"],
        ["( )", "括号 · 嵌套辖域"],
        ["UNSAT", "不可满足 · 条款矛盾"]
      ],
      treeGroups: [
        { cat: "prop", label: "命题 / 条款", color: "#2f5f9f" },
        { cat: "conn", label: "逻辑联结", color: "#2f7d57" },
        { cat: "neg", label: "否定 / 排除", color: "#b42318" }
      ],
      sentences: [
        {
          label: "登录成功当且仅当用户名和密码都正确",
          tokens: [
            { t: "登录成功", c: "prop", sym: "r", note: "命题 r：登录成功（结果）。" },
            { t: "当且仅当", c: "conn", sym: "↔", note: "充要条件 ↔。" },
            { t: "用户名正确", c: "prop", sym: "p", note: "命题 p。" },
            { t: "并且", c: "conn", sym: "∧", note: "合取 ∧。" },
            { t: "密码正确", c: "prop", sym: "q", note: "命题 q。" }
          ],
          synthesis: [
            { label: "① 形式规约", segs: [seg("r", 0), seg(" ↔ ", 1), seg("(", -1), seg("p", 2), seg(" ∧ ", 3), seg("q", 4), seg(")", -1)],
              note: "r ↔ (p ∧ q)：登录成功 当且仅当 用户名与密码都正确。" },
            { label: "② 真值约束", text: "p=F 或 q=F ⟹ r=F（任一错误则登录失败）", note: "等价式保证『缺一不可』，杜绝绕过校验。" },
            { label: "③ 验证", text: "用真值表 / SAT 检查规约是否自洽（可满足）", note: "形式规约可被自动验证，消除二义性。" }
          ]
        },
        {
          label: "该方案可行并且该方案不可行",
          tokens: [
            { t: "该方案可行", c: "prop", sym: "p", note: "命题 p：该方案可行。" },
            { t: "并且", c: "conn", sym: "∧", note: "合取 ∧：两个条款同时要求成立。" },
            { t: "该方案不可行", c: "neg", sym: "¬p", note: "命题 p 的否定 ¬p：与前一条款直接冲突。" }
          ],
          synthesis: [
            { label: "① 条款符号化", segs: [seg("p", 0), seg(" ∧ ", 1), seg("¬", 2), seg("p", 2)],
              note: "p ∧ ¬p：同一命题既肯定又否定。" },
            { label: "② 可满足性检验", text: "p=T ⟹ F；p=F ⟹ F（恒假 / 矛盾式）", note: "真值表两行皆假：无论如何都不成立。" },
            { label: "③ 结论", text: "条款集不可满足（UNSAT）⟹ 合同自相矛盾", note: "形式化让条款冲突可被自动检测，避免纠纷。" },
            { label: "④ 价值", text: "字斟句酌、表里如一。", note: "严谨立法与拟约，杜绝自相矛盾的条款。" }
          ]
        },
        {
          label: "只有安全并且合规系统才能上线",
          tokens: [
            { t: "只有", c: "conn", sym: "→(必要)", note: "『只有…才…』：其后是上线的必要条件。" },
            { t: "安全", c: "prop", sym: "p", note: "命题 p：安全。" },
            { t: "并且", c: "conn", sym: "∧", note: "合取 ∧。" },
            { t: "合规", c: "prop", sym: "q", note: "命题 q：合规。" },
            { t: "才能上线", c: "conn", sym: "→", note: "『才能』决定必要条件方向。" },
            { t: "系统上线", c: "prop", sym: "r", note: "命题 r：系统上线。" }
          ],
          synthesis: [
            { label: "① 必要条件方向", text: "只有 (p∧q) 才 r　⟹　r → (p ∧ q)", note: "上线 ⟹ 必然安全且合规。" },
            { label: "② 形式规约", segs: [seg("r", 5), seg(" → ", 4), seg("(", -1), seg("p", 1), seg(" ∧ ", 2), seg("q", 3), seg(")", -1)],
              note: "r → (p ∧ q)：合取作后件需加括号。" },
            { label: "③ 充分 vs 必要", text: "是否还需 (p∧q)→r？视业务是否充要", note: "区分必要 / 充分，避免规约过强或过弱。" }
          ]
        },
        {
          label: "甲方供货且乙方付款当且仅当合同生效",
          tokens: [
            { t: "甲方供货", c: "prop", sym: "p", note: "命题 p：甲方供货。" },
            { t: "且", c: "conn", sym: "∧", note: "合取 ∧。" },
            { t: "乙方付款", c: "prop", sym: "q", note: "命题 q：乙方付款。" },
            { t: "当且仅当", c: "conn", sym: "↔", note: "充要条件 ↔。" },
            { t: "合同生效", c: "prop", sym: "r", note: "命题 r：合同生效。" }
          ],
          synthesis: [
            { label: "① 条款符号化", segs: [seg("(", -1), seg("p", 0), seg(" ∧ ", 1), seg("q", 2), seg(")", -1), seg(" ↔ ", 3), seg("r", 4)],
              note: "(p ∧ q) ↔ r：供货且付款 当且仅当 合同生效。" },
            { label: "② 双向义务", text: "r→(p∧q) 且 (p∧q)→r", note: "等价拆成两个方向，明确双方义务。" },
            { label: "③ 一致性", text: "可用真值表检验与其他条款是否冲突", note: "形式化条款便于自动审查矛盾。" }
          ]
        }
      ]
    }
  };

  /* ---------- 纯函数：构造树数据 ---------- */
  function buildTreeData(tokens, treeGroups) {
    var groups = [];
    treeGroups.forEach(function (g) {
      var leaves = [];
      tokens.forEach(function (tk, i) {
        if (tk.c === g.cat) leaves.push({ i: i, text: tk.t });
      });
      if (leaves.length) groups.push({ label: g.label, color: g.color, leaves: leaves });
    });
    return groups;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { CATS: CATS, LEVELS: LEVELS, buildTreeData: buildTreeData };
  }

  /* ====================== 以下仅浏览器运行 ====================== */
  if (typeof document === "undefined") return;

  var SVGNS = "http://www.w3.org/2000/svg";
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function svgEl(type, attrs) {
    var el = document.createElementNS(SVGNS, type);
    if (attrs) for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function byId(id) { return document.getElementById(id); }

  function run() {
    var levelKey = global.SYMBOLIZE_LEVEL || "basic";
    var cfg = LEVELS[levelKey] || LEVELS.basic;

    var controlsEl = byId("controls");
    var origEl = byId("symOriginal");
    var tokWrapEl = byId("symTokens");
    var atomsEl = byId("symAtoms");
    var synEl = byId("symSyn");
    var treeWrapEl = byId("symTreeWrap");
    if (!controlsEl || !origEl) return;

    var sentence = null, tokens = [], syn = [];
    var p = 0, manualFocus = null, autoTimer = null;
    var origToks = [], chipEls = [], atomEls = [], synEls = [], segEls = [], leafEls = [], groupEls = [], leafGroup = [];
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.sentences.map(function (s, i) {
        return '<option value="' + i + '">' + esc(s.label) + '</option>';
      }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label><span>选择语句</span><small>自然语言陈述</small></label>' +
          '<select id="symSentence">' + opts + '</select></div>' +
        '<div class="control-group"><label><span>逐步演示</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button class="sym-step-btn" id="symPrev">◀ 上一步</button>' +
            '<button class="sym-step-btn sym-primary" id="symNext">下一步 ▶</button>' +
            '<button class="sym-step-btn" id="symAuto">⏵ 自动播放</button>' +
            '<button class="sym-step-btn" id="symReset">↺ 重置</button>' +
          '</div></div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="symProgBar"></i></div>' +
          '<span class="sym-progress-num" id="symProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="symStatus"></div></div>';

      statusEl = byId("symStatus");
      progBar = byId("symProgBar");
      progNum = byId("symProgNum");
      prevBtn = byId("symPrev");
      nextBtn = byId("symNext");
      autoBtn = byId("symAuto");

      byId("symSentence").addEventListener("change", function (e) { loadSentence(+e.target.value); });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("symReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
    }

    function renderLegend() {
      var box = byId("legendPanel");
      if (!box) return;
      box.innerHTML = '<div class="legend-title">符号体系说明</div><div class="legend-grid">' +
        cfg.legend.map(function (it) {
          return '<div class="legend-item"><span class="sym">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + '</span></div>';
        }).join("") + '</div>';
    }

    function loadSentence(idx) {
      stopAuto();
      sentence = cfg.sentences[idx];
      tokens = sentence.tokens;
      syn = sentence.synthesis;
      p = 0;
      manualFocus = null;
      renderOriginal();
      renderTokens();
      renderAtoms();
      renderSyn();
      renderTree();
      render();
    }

    function renderOriginal() {
      origEl.innerHTML = "";
      origToks = tokens.map(function (tk, i) {
        var s = document.createElement("span");
        s.className = "sym-otok";
        s.textContent = tk.t;
        s.dataset.i = i;
        s.addEventListener("click", function () { clickToken(i); });
        origEl.appendChild(s);
        return s;
      });
    }

    function renderTokens() {
      tokWrapEl.innerHTML = "";
      chipEls = tokens.map(function (tk, i) {
        var d = document.createElement("div");
        d.className = "sym-tok";
        d.style.setProperty("--c", CATS[tk.c].color);
        d.dataset.i = i;
        d.innerHTML = '<span class="tok-text">' + esc(tk.t) + '</span><span class="tok-cat">' + esc(CATS[tk.c].name) + '</span>';
        d.addEventListener("click", function () { clickToken(i); });
        tokWrapEl.appendChild(d);
        return d;
      });
    }

    function renderAtoms() {
      atomsEl.innerHTML = "";
      atomEls = tokens.map(function (tk, i) {
        var d = document.createElement("div");
        d.className = "sym-atom";
        d.style.setProperty("--c", CATS[tk.c].color);
        d.dataset.i = i;
        d.innerHTML = '<span class="a-word">' + esc(tk.t) + '</span><span class="a-arrow">⟹</span><span class="a-sym">' + esc(tk.sym) + '</span>';
        d.addEventListener("click", function () { clickToken(i); });
        atomsEl.appendChild(d);
        return d;
      });
    }

    function renderSyn() {
      synEl.innerHTML = "";
      segEls = [];
      synEls = syn.map(function (s, j) {
        var d = document.createElement("div");
        d.className = "sym-syn";
        var body;
        if (s.segs) {
          body = s.segs.map(function (sg) {
            if (sg.i >= 0) return '<span class="sym-seg" data-i="' + sg.i + '">' + esc(sg.x) + '</span>';
            return '<span class="sym-seg">' + esc(sg.x) + '</span>';
          }).join("");
        } else {
          body = esc(s.text).replace(/\n/g, "<br>");
        }
        d.innerHTML = '<div class="syn-label">' + esc(s.label) + '</div>' +
          '<div class="syn-body">' + body + '</div>' +
          (s.note ? '<div class="syn-note">' + esc(s.note) + '</div>' : "");
        synEl.appendChild(d);
        Array.prototype.forEach.call(d.querySelectorAll(".sym-seg[data-i]"), function (sp) {
          var ti = +sp.dataset.i;
          segEls.push({ el: sp, i: ti, synIndex: j });
          sp.addEventListener("click", function () { clickToken(ti); });
        });
        return d;
      });
    }

    function renderTree() {
      treeWrapEl.innerHTML = "";
      leafEls = []; groupEls = []; leafGroup = [];
      tokens.forEach(function () { leafEls.push(null); leafGroup.push(-1); });

      var groups = buildTreeData(tokens, cfg.treeGroups);
      var VW = 760;
      var maxLeaves = groups.reduce(function (m, g) { return Math.max(m, g.leaves.length); }, 1);
      var rootY = 42, groupY = 132, leafTop = 200, leafGap = 44;
      var H = leafTop + maxLeaves * leafGap + 16;

      var svg = svgEl("svg", { id: "symTree", viewBox: "0 0 " + VW + " " + H, width: "100%", height: H });
      var g = svgEl("g");
      svg.appendChild(g);

      var rootX = VW / 2;
      var slot = VW / groups.length;

      groups.forEach(function (grp, gi) {
        var gx = (gi + 0.5) * slot;
        g.appendChild(svgEl("path", { d: "M " + rootX + " " + (rootY + 24) + " Q " + rootX + " " + ((rootY + groupY) / 2) + " " + gx + " " + (groupY - 22), stroke: grp.color, "stroke-width": 2, fill: "none", opacity: 0.55 }));
        grp.leaves.forEach(function (lf, li) {
          var ly = leafTop + li * leafGap;
          g.appendChild(svgEl("path", { d: "M " + gx + " " + (groupY + 22) + " L " + gx + " " + (ly - 12), stroke: grp.color, "stroke-width": 1.5, fill: "none", opacity: 0.4 }));
        });
      });

      var rootG = svgEl("g");
      rootG.appendChild(svgEl("circle", { cx: rootX, cy: rootY, r: 24, fill: "#8b0000", stroke: "#fff", "stroke-width": 3 }));
      var rt = svgEl("text", { x: rootX, y: rootY, "text-anchor": "middle", "dominant-baseline": "central", fill: "#fff", "font-size": 13, "font-weight": "bold" });
      rt.textContent = "命题公式";
      rootG.appendChild(rt);
      g.appendChild(rootG);

      groups.forEach(function (grp, gi) {
        var gx = (gi + 0.5) * slot;
        var grpG = svgEl("g");
        grpG.setAttribute("class", "sym-group");
        grpG.appendChild(svgEl("circle", { cx: gx, cy: groupY, r: 22, fill: grp.color, stroke: "#fff", "stroke-width": 3 }));
        var gt = svgEl("text", { x: gx, y: groupY, "text-anchor": "middle", "dominant-baseline": "central", fill: "#fff", "font-size": 11.5, "font-weight": "bold" });
        gt.textContent = grp.label;
        grpG.appendChild(gt);
        g.appendChild(grpG);
        groupEls.push(grpG);

        grp.leaves.forEach(function (lf, li) {
          var ly = leafTop + li * leafGap;
          var w = Math.max(56, lf.text.length * 17 + 18);
          var leafG = svgEl("g");
          leafG.setAttribute("class", "sym-leaf");
          leafG.dataset.i = lf.i;
          leafG.appendChild(svgEl("rect", { x: gx - w / 2, y: ly - 15, width: w, height: 30, rx: 8, fill: "#fff", stroke: grp.color, "stroke-width": 1.6 }));
          var lt = svgEl("text", { x: gx, y: ly, "text-anchor": "middle", "dominant-baseline": "central", fill: "#2d211d", "font-size": 13, "font-weight": "600" });
          lt.textContent = lf.text;
          leafG.appendChild(lt);
          leafG.addEventListener("click", function () { clickToken(lf.i); });
          g.appendChild(leafG);
          leafEls[lf.i] = leafG;
          leafGroup[lf.i] = gi;
        });
      });

      treeWrapEl.appendChild(svg);
    }

    function total() { return tokens.length + syn.length; }
    function step(dir) {
      manualFocus = null;
      p = Math.max(0, Math.min(total(), p + dir));
      render();
    }
    function clickToken(i) {
      stopAuto();
      var N = tokens.length;
      if (p < N) { p = i + 1; manualFocus = null; }
      else { manualFocus = (manualFocus === i ? null : i); }
      render();
    }
    function toggleAuto() {
      if (autoTimer) { stopAuto(); return; }
      if (p >= total()) { p = 0; manualFocus = null; render(); }
      autoBtn.classList.add("sym-playing");
      autoBtn.textContent = "⏸ 暂停";
      autoTimer = setInterval(function () {
        if (p >= total()) { stopAuto(); return; }
        manualFocus = null; p += 1; render();
      }, 950);
    }
    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
      if (autoBtn) { autoBtn.classList.remove("sym-playing"); autoBtn.textContent = "⏵ 自动播放"; }
    }

    function render() {
      var N = tokens.length, S = syn.length, T = N + S;
      var tokensShown = Math.min(p, N);
      var synShown = Math.max(0, p - N);
      var stepTok = (p >= 1 && p <= N) ? p - 1 : null;
      var focusTok = (manualFocus != null) ? manualFocus : stepTok;

      for (var k = 0; k < N; k++) {
        var revealed = k < tokensShown || (manualFocus != null);
        var cur = (k === focusTok);
        setState(origToks[k], revealed, cur);
        setState(chipEls[k], revealed, cur);
        setState(atomEls[k], revealed, cur);
        if (leafEls[k]) {
          leafEls[k].classList.toggle("sym-pending", !revealed);
          leafEls[k].classList.toggle("sym-cur", cur);
        }
      }
      groupEls.forEach(function (gel, gi) {
        gel.classList.toggle("sym-cur", focusTok != null && leafGroup[focusTok] === gi);
      });
      for (var j = 0; j < S; j++) {
        var rev = j < synShown;
        var sc = (manualFocus == null) && (j === synShown - 1) && synShown > 0;
        synEls[j].classList.toggle("sym-pending", !rev);
        synEls[j].classList.toggle("sym-cur", sc);
      }
      segEls.forEach(function (s) {
        s.el.classList.toggle("sym-hl", focusTok != null && s.i === focusTok && s.synIndex < synShown);
      });

      progNum.textContent = p + " / " + T;
      progBar.style.width = (T ? (p / T * 100) : 0) + "%";
      prevBtn.disabled = (p <= 0 && manualFocus == null);
      nextBtn.disabled = (p >= T);
      statusEl.innerHTML = statusHTML(p, focusTok, synShown);
    }

    function setState(el, revealed, cur) {
      if (!el) return;
      el.classList.toggle("sym-pending", !revealed);
      el.classList.toggle("sym-cur", !!cur);
    }

    function statusHTML(pp, focusTok, synShown) {
      if (pp === 0) return cfg.introStatus;
      if (focusTok != null) {
        var t = tokens[focusTok];
        return '解析 <b>「' + esc(t.t) + '」</b>（' + esc(CATS[t.c].name) + ' · ' + esc(t.sym) + '）：' + esc(t.note);
      }
      var j = synShown - 1;
      if (j >= 0) {
        var s = syn[j];
        if (pp >= total()) {
          return '✅ <b>符号化完成！</b>' + esc(s.note || "") + '　可点击任意词块 / 公式 / 树叶回看对应关系。';
        }
        return '<b>' + esc(s.label) + '</b>：' + esc(s.note || "");
      }
      return "";
    }

    renderControls();
    renderLegend();
    loadSentence(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})(typeof window !== "undefined" ? window : globalThis);
