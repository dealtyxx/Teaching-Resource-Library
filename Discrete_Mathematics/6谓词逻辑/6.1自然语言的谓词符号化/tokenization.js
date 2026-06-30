/* =====================================================================
 * 6.1 自然语言的谓词符号化 —— 三层统一交互引擎
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（三层一致）：选择语句 → 逐步演示
 *   点一步 → 看反馈（当前符号说明）→ 看符号序列高亮 → 看公式项高亮 → 看结构树高亮
 *   完成后可点击任意词块 / 原子公式 / 树叶，跨视图联动高亮对应关系。
 *
 * 难度梯度：
 *   基础层：一元谓词，∀x(P→Q) / ∃x(P∧Q)，综合 1 步，2 层树，精简图例。
 *   进阶层：含否定等价、二元关系与辖域，综合 3 步，完整图例。
 *   拓展层：知识库 / 数据库映射（EXISTS / NOT EXISTS / ALL 约束、外键、本体树），综合 3~4 步。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* ---------- 词类（个体词/谓词/量词/联结词） ---------- */
  var CATS = {
    quant: { name: "量词", color: "#b42318" },
    ind:   { name: "个体词", color: "#2f5f9f" },
    pred:  { name: "谓词", color: "#c58a1f" },
    conn:  { name: "联结词", color: "#2f7d57" }
  };

  /* 工具：把含 (x,y) 的语句段拆给 seg 用 */
  function seg(x, i) { return { x: x, i: (i === undefined ? -1 : i) }; }

  /* ---------- 三层数据 ---------- */
  var LEVELS = {
    /* ================= 基础层 ================= */
    basic: {
      introStatus: "选择一句判断，点击「下一步」逐词识别量词、个体词与谓词，拼出 ∀/∃ 公式。",
      legend: [
        ["∀x", "全称量词 · 所有个体"],
        ["∃x", "存在量词 · 存在个体"],
        ["P(x)", "谓词 · 描述性质"],
        ["→", "蕴含 · 若…则…"],
        ["∧", "合取 · 并且"]
      ],
      treeGroups: [
        { cat: "quant", label: "量词", color: "#b42318" },
        { cat: "ind", label: "个体词", color: "#2f5f9f" },
        { cat: "pred", label: "谓词", color: "#c58a1f" },
        { cat: "conn", label: "联结词", color: "#2f7d57" }
      ],
      sentences: [
        {
          label: "所有君子都讲诚信",
          tokens: [
            { t: "所有", c: "quant", sym: "∀x", note: "全称量词：论域里每个个体都要满足后件。" },
            { t: "君子", c: "ind", sym: "君子(x)", note: "个体词→主词谓词：x 是君子（前提条件）。" },
            { t: "都", c: "conn", sym: "→", note: "系词『都』对应蕴含 →：是君子，则……" },
            { t: "讲诚信", c: "pred", sym: "讲诚信(x)", note: "谓词：x 讲诚信（结论性质）。" }
          ],
          synthesis: [
            { label: "整句符号化", segs: [seg("∀x(", 0), seg("君子(x)", 1), seg(" → ", 2), seg("讲诚信(x)", 3), seg(")", 0)],
              note: "读法：对任意个体 x，如果 x 是君子，那么 x 讲诚信。" }
          ]
        },
        {
          label: "有些学子热爱经典",
          tokens: [
            { t: "有些", c: "quant", sym: "∃x", note: "存在量词：论域中至少存在一个个体满足。" },
            { t: "学子", c: "ind", sym: "学子(x)", note: "个体词：x 是学子。" },
            { t: "热爱经典", c: "pred", sym: "热爱经典(x)", note: "谓词：x 热爱经典。" }
          ],
          synthesis: [
            { label: "整句符号化", segs: [seg("∃x(", 0), seg("学子(x)", 1), seg(" ∧ ", -1), seg("热爱经典(x)", 2), seg(")", 0)],
              note: "读法：存在某个 x，x 是学子并且 x 热爱经典。存在量词用合取 ∧，不用 →。" }
          ]
        },
        {
          label: "并非所有观点都正确",
          tokens: [
            { t: "并非所有", c: "quant", sym: "¬∀x", note: "受限全称的否定：不是每个个体都满足。" },
            { t: "观点", c: "ind", sym: "观点(x)", note: "个体词：x 是观点。" },
            { t: "都", c: "conn", sym: "→", note: "原句的蕴含结构。" },
            { t: "正确", c: "pred", sym: "正确(x)", note: "谓词：x 正确。" }
          ],
          synthesis: [
            { label: "整句符号化", segs: [seg("¬∀x(", 0), seg("观点(x)", 1), seg(" → ", 2), seg("正确(x)", 3), seg(")", 0)],
              note: "读法：并非所有观点都正确。由量词否定律可改写为『存在不正确的观点』：∃x(观点(x) ∧ ¬正确(x))。" }
          ]
        }
      ]
    },

    /* ================= 进阶层 ================= */
    advanced: {
      introStatus: "选择一句判断，逐步辨析量词、辖域与联结词，体会 ∀→ 与 ∃∧ 的正确搭配。",
      legend: [
        ["∀x", "全称量词 · 所有个体"],
        ["∃x", "存在量词 · 存在个体"],
        ["P(x)", "谓词 · 性质"],
        ["R(x,y)", "二元谓词 · 关系"],
        ["→", "蕴含"],
        ["∧", "合取（并且）"],
        ["∨", "析取（或）"],
        ["¬", "否定（非）"]
      ],
      treeGroups: [
        { cat: "quant", label: "量词", color: "#b42318" },
        { cat: "ind", label: "个体词", color: "#2f5f9f" },
        { cat: "pred", label: "谓词", color: "#c58a1f" },
        { cat: "conn", label: "联结词", color: "#2f7d57" }
      ],
      sentences: [
        {
          label: "所有爱国者都努力奋斗",
          tokens: [
            { t: "所有", c: "quant", sym: "∀x", note: "全称量词，主导整句辖域。" },
            { t: "爱国者", c: "ind", sym: "爱国者(x)", note: "个体词→前件谓词。" },
            { t: "都", c: "conn", sym: "→", note: "『都』把前件与后件用蕴含连接。" },
            { t: "努力奋斗", c: "pred", sym: "奋斗(x)", note: "后件谓词。" }
          ],
          synthesis: [
            { label: "① 量词骨架", text: "∀x( ▢(x) → ▢(x) )", note: "先确定全称量词与蕴含骨架（所有…都…）。" },
            { label: "② 代入谓词", segs: [seg("∀x(", 0), seg("爱国者(x)", 1), seg(" → ", 2), seg("奋斗(x)", 3), seg(")", 0)],
              note: "把个体词与谓词代入骨架的前后件。" },
            { label: "③ 自然语言读法", text: "对任意 x，若 x 是爱国者，则 x 努力奋斗。", note: "回译验证：符号化是否忠实于原意。" }
          ]
        },
        {
          label: "有些科学家既严谨又创新",
          tokens: [
            { t: "有些", c: "quant", sym: "∃x", note: "存在量词。" },
            { t: "科学家", c: "ind", sym: "科学家(x)", note: "个体词。" },
            { t: "既严谨", c: "pred", sym: "严谨(x)", note: "谓词一。" },
            { t: "又创新", c: "pred", sym: "创新(x)", note: "谓词二，与谓词一并列。" }
          ],
          synthesis: [
            { label: "① 量词骨架", text: "∃x( ▢(x) ∧ ▢(x) ∧ ▢(x) )", note: "存在量词以合取 ∧ 串联多个性质。" },
            { label: "② 代入谓词", segs: [seg("∃x(", 0), seg("科学家(x)", 1), seg(" ∧ ", -1), seg("严谨(x)", 2), seg(" ∧ ", -1), seg("创新(x)", 3), seg(")", 0)],
              note: "『既…又…』表示多个谓词同时成立。" },
            { label: "③ 易错提醒", text: "∃x 用 ∧；写成 ∃x(P(x) → Q(x)) 会被空前件轻易满足。", note: "存在量词必须配合取，蕴含会改变原意。" }
          ]
        },
        {
          label: "并非所有传言都可信",
          tokens: [
            { t: "并非所有", c: "quant", sym: "¬∀x", note: "对全称命题整体否定。" },
            { t: "传言", c: "ind", sym: "传言(x)", note: "个体词。" },
            { t: "都", c: "conn", sym: "→", note: "原句蕴含结构。" },
            { t: "可信", c: "pred", sym: "可信(x)", note: "谓词。" }
          ],
          synthesis: [
            { label: "① 否定式", segs: [seg("¬∀x(", 0), seg("传言(x)", 1), seg(" → ", 2), seg("可信(x)", 3), seg(")", 0)],
              note: "直接否定整个全称命题。" },
            { label: "② 量词否定律改写", text: "⇔ ∃x( 传言(x) ∧ ¬可信(x) )", note: "¬∀x(P→Q) ⇔ ∃x(P ∧ ¬Q)：『并非都』即『存在例外』。" },
            { label: "③ 自然语言读法", text: "存在某条传言，它并不可信。", note: "把否定深入到量词内部，视角更具操作性。" }
          ]
        },
        {
          label: "每位老师都教过一些学生",
          tokens: [
            { t: "每位", c: "quant", sym: "∀x", note: "全称量词，约束老师 x。" },
            { t: "老师", c: "ind", sym: "老师(x)", note: "个体词 x。" },
            { t: "教过", c: "pred", sym: "教(x,y)", note: "二元关系谓词，连接 x 与 y。" },
            { t: "一些", c: "quant", sym: "∃y", note: "存在量词，约束学生 y。" },
            { t: "学生", c: "ind", sym: "学生(y)", note: "个体词 y。" }
          ],
          synthesis: [
            { label: "① 量词骨架", text: "∀x( 老师(x) → ∃y( ▢ ∧ ▢ ) )", note: "先全称后存在：每位老师各自对应一些学生。" },
            { label: "② 代入二元谓词", segs: [seg("∀x(", 0), seg("老师(x)", 1), seg(" → ∃y(", 3), seg("学生(y)", 4), seg(" ∧ ", -1), seg("教(x,y)", 2), seg(") )", 0)],
              note: "教(x,y) 是二元关系，连接老师 x 与学生 y。" },
            { label: "③ 辖域提醒", text: "∀x∃y 与 ∃y∀x 含义不同！", note: "量词顺序决定『各自的学生』还是『同一个学生』。" }
          ]
        }
      ]
    },

    /* ================= 拓展层 ================= */
    extend: {
      introStatus: "把谓词公式迁移到知识库与数据库：逐步读出 EXISTS / NOT EXISTS / 全称约束 与外键。",
      legend: [
        ["∀x", "全称量词 · 全覆盖约束"],
        ["∃y", "存在量词 · 存在性"],
        ["R(x,y)", "二元关系 · 关系表"],
        ["→", "蕴含 · 规则"],
        ["∧", "合取"],
        ["¬", "否定"],
        ["EXISTS", "存在量化查询"],
        ["NOT EXISTS", "全称约束（无反例）"]
      ],
      treeGroups: [
        { cat: "ind", label: "概念 Class", color: "#2f5f9f" },
        { cat: "pred", label: "关系 / 属性", color: "#c58a1f" },
        { cat: "quant", label: "量化约束", color: "#b42318" },
        { cat: "conn", label: "逻辑联结", color: "#2f7d57" }
      ],
      sentences: [
        {
          label: "所有重点文物都须有责任人",
          tokens: [
            { t: "所有", c: "quant", sym: "∀x", note: "全称约束：覆盖知识库中每条记录。" },
            { t: "重点文物", c: "ind", sym: "重点文物(x)", note: "概念/个体：x 属于『重点文物』类。" },
            { t: "须有", c: "conn", sym: "→∃y", note: "规则蕴含 + 存在：必须存在某个 y。" },
            { t: "责任人", c: "pred", sym: "责任(y,x)", note: "二元关系：y 是 x 的责任人。" }
          ],
          synthesis: [
            { label: "① 谓词规则", segs: [seg("∀x(", 0), seg("重点文物(x)", 1), seg(" → ∃y(", 2), seg("责任人(y)", 3), seg(" ∧ ", -1), seg("责任(y,x)", 3), seg(") )", 0)],
              note: "完整性规则：每件重点文物都须存在一名责任人。" },
            { label: "② 关系视图", text: "责任(责任人_id, 文物_id)　—　外键约束", note: "谓词 → 数据库关系表：责任人对文物的负责关系。" },
            { label: "③ SQL · 查违规", text: "SELECT * FROM 文物 r\nWHERE r.级别 = '重点'\n  AND NOT EXISTS (SELECT 1 FROM 责任 d WHERE d.文物 = r.id);",
              note: "∀…∃ 的否定 = NOT EXISTS：查出『没有责任人』的重点文物。" },
            { label: "④ 读法", text: "每件重点文物都必须落实到具体责任人。", note: "把制度要求形式化为可校验的数据库约束。" }
          ]
        },
        {
          label: "存在一条记录尚未审核",
          tokens: [
            { t: "存在", c: "quant", sym: "∃x", note: "存在量化查询：是否有满足条件的记录。" },
            { t: "记录", c: "ind", sym: "记录(x)", note: "个体：x 是一条记录。" },
            { t: "尚未审核", c: "pred", sym: "¬审核(x)", note: "谓词的否定：x 未通过审核。" }
          ],
          synthesis: [
            { label: "① 存在公式", segs: [seg("∃x(", 0), seg("记录(x)", 1), seg(" ∧ ", -1), seg("¬审核(x)", 2), seg(")", 0)],
              note: "存在某条未审核的记录。" },
            { label: "② SQL · EXISTS", text: "SELECT EXISTS (\n  SELECT 1 FROM 记录 WHERE 已审核 = false\n);", note: "∃ 直接对应 SQL 的 EXISTS 子查询。" },
            { label: "③ 读法", text: "只要存在未审核记录，就触发复核流程。", note: "存在量词驱动『发现异常』的治理动作。" }
          ]
        },
        {
          label: "任何用户都不得越权访问",
          tokens: [
            { t: "任何", c: "quant", sym: "∀x", note: "全称约束：覆盖所有用户。" },
            { t: "用户", c: "ind", sym: "用户(x)", note: "个体：x 是用户。" },
            { t: "都不得", c: "conn", sym: "→¬", note: "蕴含 + 否定：是用户则不得……" },
            { t: "越权访问", c: "pred", sym: "越权(x)", note: "谓词：x 发生越权访问。" }
          ],
          synthesis: [
            { label: "① 安全规则", segs: [seg("∀x(", 0), seg("用户(x)", 1), seg(" → ", 2), seg("¬越权(x)", 3), seg(")", 0)],
              note: "等价于 ¬∃x(用户(x) ∧ 越权(x))：不存在越权用户。" },
            { label: "② 访问策略", text: "DENY 越权 FOR ALL 用户（默认拒绝 + 最小授权）", note: "全称否定 → 访问控制策略：默认不允许。" },
            { label: "③ 读法", text: "系统中不允许任何用户越权访问。", note: "把安全底线写成可执行的全称约束。" }
          ]
        },
        {
          label: "每个项目至少有一个负责人",
          tokens: [
            { t: "每个", c: "quant", sym: "∀x", note: "全称：覆盖所有项目。" },
            { t: "项目", c: "ind", sym: "项目(x)", note: "个体 x。" },
            { t: "至少有一个", c: "quant", sym: "∃y", note: "存在量词：至少一名。" },
            { t: "负责人", c: "pred", sym: "负责(y,x)", note: "二元关系：y 负责 x。" }
          ],
          synthesis: [
            { label: "① 完整性约束", segs: [seg("∀x(", 0), seg("项目(x)", 1), seg(" → ∃y(", 2), seg("负责人(y)", 3), seg(" ∧ ", -1), seg("负责(y,x)", 3), seg(") )", 0)],
              note: "ALL 项目 + EXISTS 负责人：先全称后存在。" },
            { label: "② 关系 / 外键", text: "项目.负责人_id → 负责人.id　NOT NULL", note: "∀∃ 关系常落地为『非空外键』约束。" },
            { label: "③ 读法", text: "任何项目都至少落实一名负责人，不留空挡。", note: "量词组合 = 数据库里的存在性 + 全覆盖。" }
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

  /* 导出纯逻辑供 Node 测试 */
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

    /* 运行态 */
    var sentence = null, tokens = [], syn = [];
    var p = 0;                 // 0..N+S
    var manualFocus = null;    // 完成后点击聚焦的词索引
    var autoTimer = null;
    /* DOM 引用 */
    var origToks = [], chipEls = [], atomEls = [], synEls = [], segEls = [], leafEls = [], groupEls = [], leafGroup = [];
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    /* ---------- 侧栏控制 ---------- */
    function renderControls() {
      var opts = cfg.sentences.map(function (s, i) {
        return '<option value="' + i + '">' + esc(s.label) + '</option>';
      }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label><span>选择语句</span><small>自然语言判断</small></label>' +
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

    /* ---------- 载入语句 ---------- */
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

    /* 原文词块 */
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

    /* 符号序列积木 */
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

    /* 原子公式行 */
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

    /* 综合 / 整句公式 */
    function renderSyn() {
      synEl.innerHTML = "";
      segEls = [];
      synEls = syn.map(function (s, j) {
        var d = document.createElement("div");
        d.className = "sym-syn";
        var body;
        if (s.segs) {
          body = s.segs.map(function (sg) {
            if (sg.i >= 0) {
              return '<span class="sym-seg" data-i="' + sg.i + '">' + esc(sg.x) + '</span>';
            }
            return '<span class="sym-seg">' + esc(sg.x) + '</span>';
          }).join("");
        } else {
          body = esc(s.text).replace(/\n/g, "<br>");
        }
        d.innerHTML = '<div class="syn-label">' + esc(s.label) + '</div>' +
          '<div class="syn-body">' + body + '</div>' +
          (s.note ? '<div class="syn-note">' + esc(s.note) + '</div>' : "");
        synEl.appendChild(d);
        // 收集可高亮的公式项
        Array.prototype.forEach.call(d.querySelectorAll(".sym-seg[data-i]"), function (sp) {
          var ti = +sp.dataset.i;
          segEls.push({ el: sp, i: ti, synIndex: j });
          sp.addEventListener("click", function () { clickToken(ti); });
        });
        return d;
      });
    }

    /* 结构树 */
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

      // 边：root -> group ；group -> leaf
      groups.forEach(function (grp, gi) {
        var gx = (gi + 0.5) * slot;
        g.appendChild(svgEl("path", { d: "M " + rootX + " " + (rootY + 24) + " Q " + rootX + " " + ((rootY + groupY) / 2) + " " + gx + " " + (groupY - 22), stroke: grp.color, "stroke-width": 2, fill: "none", opacity: 0.55 }));
        grp.leaves.forEach(function (lf, li) {
          var ly = leafTop + li * leafGap;
          g.appendChild(svgEl("path", { d: "M " + gx + " " + (groupY + 22) + " L " + gx + " " + (ly - 12), stroke: grp.color, "stroke-width": 1.5, fill: "none", opacity: 0.4 }));
        });
      });

      // 根节点
      var rootG = svgEl("g");
      rootG.appendChild(svgEl("circle", { cx: rootX, cy: rootY, r: 24, fill: "#8b0000", stroke: "#fff", "stroke-width": 3 }));
      var rt = svgEl("text", { x: rootX, y: rootY, "text-anchor": "middle", "dominant-baseline": "central", fill: "#fff", "font-size": 13, "font-weight": "bold" });
      rt.textContent = "符号化";
      rootG.appendChild(rt);
      g.appendChild(rootG);

      // 组节点 + 叶
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

    /* ---------- 步进 ---------- */
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

    /* ---------- 渲染状态 ---------- */
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

      // 进度 + 按钮
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

    /* ---------- 启动 ---------- */
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
