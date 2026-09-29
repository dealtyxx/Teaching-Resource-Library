/* =====================================================================
 * 5.2 命题公式定义与符号化 —— 三层统一交互引擎
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（三层一致，与 6.1 谓词符号化同形）：选择语句 → 逐步演示
 *   点一步 → 看反馈（当前符号说明）→ 看符号序列高亮 → 看公式项高亮 → 看结构树高亮
 *   完成后可点击任意词块 / 原子公式 / 树叶，跨视图联动高亮对应关系。
 *
 * 难度梯度：
 *   基础层：单联结词（∧ ∨ →，含「虽然…但是」「只要…就」），原子 p/q，综合 1 步；
 *           另有「合式公式判定」小练习（递归定义）。
 *   进阶层：当且仅当 ↔、只有…才（必要条件）、除非、排斥或、否定辖域与括号，综合 3 步。
 *   拓展层：形式规约、合同条款、矛盾/可满足性（UNSAT）、嵌套括号，综合 3 步。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* ---------- 词类（原子命题 / 联结词 / 否定）：本章节点配色（金 / 红 / 次墨） ---------- */
  var CATS = {
    prop: { name: "原子命题", color: "#8a5d0b" },
    conn: { name: "联结词", color: "#d63b1d" },
    neg:  { name: "否定", color: "#6b4a38" }
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
        ["∧", "合取 · 并且 / 虽然…但是"],
        ["∨", "析取 · 或者（相容或）"],
        ["→", "蕴含 · 如果…那么 / 只要…就"]
      ],
      treeGroups: [
        { cat: "prop", label: "原子命题" },
        { cat: "conn", label: "联结词" },
        { cat: "neg", label: "否定" }
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
          label: "虽然下雨但是比赛照常进行",
          tokens: [
            { t: "虽然", c: "conn", sym: "∧", note: "『虽然…但是…』只带转折语气，逻辑上两件事都成立，仍是合取 ∧。" },
            { t: "下雨", c: "prop", sym: "p", note: "原子命题 p：下雨。" },
            { t: "但是", c: "conn", sym: "∧", note: "『但是』与『虽然』共同构成合取 ∧。" },
            { t: "比赛照常进行", c: "prop", sym: "q", note: "原子命题 q：比赛照常进行。" }
          ],
          synthesis: [
            { label: "整句符号化", segs: [seg("p", 1), seg(" ∧ ", 2), seg("q", 3)],
              note: "p ∧ q：下雨与比赛照常同时为真。转折语气在命题逻辑中不体现，只保留『都成立』。" }
          ]
        },
        {
          label: "可以乘公交或者乘地铁",
          tokens: [
            { t: "可以乘公交", c: "prop", sym: "p", note: "原子命题 p：（可以）乘公交。" },
            { t: "或者", c: "conn", sym: "∨", note: "联结词『或者』对应析取 ∨：至少一个成立，两者都成立也算（相容或）。" },
            { t: "乘地铁", c: "prop", sym: "q", note: "原子命题 q：（可以）乘地铁。" }
          ],
          synthesis: [
            { label: "整句符号化", segs: [seg("p", 0), seg(" ∨ ", 1), seg("q", 2)],
              note: "读法：p 或 q——两种方式可以都行，至少一种成立。『只能二选一』的排斥或见进阶层。" }
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
          label: "只要认真复习就能通过考试",
          tokens: [
            { t: "只要", c: "conn", sym: "→", note: "『只要…就…』引出充分条件，与『如果…那么…』同为 →。" },
            { t: "认真复习", c: "prop", sym: "p", note: "命题 p：认真复习（充分条件，作前件）。" },
            { t: "就", c: "conn", sym: "→", note: "『就』引出后件。" },
            { t: "能通过考试", c: "prop", sym: "q", note: "命题 q：能通过考试（后件）。" }
          ],
          synthesis: [
            { label: "整句符号化", segs: [seg("p", 1), seg(" → ", 0), seg("q", 3)],
              note: "p → q：p 是 q 的充分条件。进阶层将对比方向相反的『只有…才…』。" }
          ]
        }
      ],
      /* 合式公式判定练习（仅基础层页面含 #symWff 时渲染） */
      wff: [
        { f: "¬(p ∧ q)", ok: true, why: "p、q 是公式（规则①）⟹ (p∧q)（规则③）⟹ ¬(p∧q)（规则②）。" },
        { f: "(p → q) ∧ ¬r", ok: true, why: "(p→q) 与 ¬r 都是公式，再用规则③ 合取。" },
        { f: "p ∨ q → r", ok: true, why: "按优先级 ∨ 先于 →，读作 (p∨q)→r，省略的括号可按约定补回。" },
        { f: "p ∧ ∨ q", ok: false, why: "∧ 与 ∨ 相邻：∨ 的左侧缺少公式，任何规则都生成不了。" },
        { f: "(p ∨ q", ok: false, why: "左右括号不配对。" },
        { f: "p ¬ q", ok: false, why: "¬ 是一元联结词，只能加在公式前；p 与 ¬q 之间缺少二元联结词。" },
        { f: "(p → q) ↔ (¬q → ¬p)", ok: true, why: "两侧都是蕴含式，再用 ↔ 连接（规则③）。" }
      ]
    },

    /* ================= 进阶层 ================= */
    advanced: {
      introStatus: "选择一句陈述，逐步辨析『当且仅当 / 只有…才 / 除非 / 排斥或』与否定辖域，必要时加括号消歧。",
      legend: [
        ["p, q", "原子命题"],
        ["¬", "否定 · 非"],
        ["∧", "合取 · 并且"],
        ["∨", "析取 · 或（相容或）"],
        ["→", "蕴含 · 如果…那么"],
        ["↔", "等价 · 当且仅当"],
        ["( )", "括号 · 改变优先级"],
        ["优先级", "¬ > ∧ > ∨ > → > ↔"]
      ],
      treeGroups: [
        { cat: "prop", label: "原子命题" },
        { cat: "conn", label: "联结词" },
        { cat: "neg", label: "否定" }
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
            { label: "① 识别联结词", text: "『当且仅当』 ⟹ ↔（双向）", note: "p ↔ q 与 (p→q) ∧ (q→p) 等值。" },
            { label: "② 整句符号化", segs: [seg("p", 0), seg(" ↔ ", 1), seg("q", 2)],
              note: "p ↔ q：人民幸福与国家富强互为充要条件。" },
            { label: "③ 易错提醒", text: "↔ ≠ →：等价是双向，蕴含是单向。", note: "『当且仅当』不能只写成 →。" }
          ]
        },
        {
          label: "只有努力才能成功",
          tokens: [
            { t: "只有", c: "conn", sym: "→(必要)", note: "『只有 p 才 q』：p 是 q 的必要条件。" },
            { t: "努力", c: "prop", sym: "p", note: "命题 p：努力（必要条件）。" },
            { t: "才能", c: "conn", sym: "→", note: "『才』强调必要性，决定箭头方向。" },
            { t: "成功", c: "prop", sym: "q", note: "命题 q：成功。" }
          ],
          synthesis: [
            { label: "① 辨析方向", text: "只有 p 才 q　⟹　q → p", note: "必要条件：成功必须努力，故 成功→努力。" },
            { label: "② 整句符号化", segs: [seg("q", 3), seg(" → ", 2), seg("p", 1)],
              note: "成功 → 努力（q→p），也可写成 ¬p→¬q。方向与『如果…那么』相反，最易错。" },
            { label: "③ 对照", text: "只要 p 就 q ⟹ p→q；只有 p 才 q ⟹ q→p", note: "充分条件 vs 必要条件，箭头方向不同。" }
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
            { label: "① 改写『除非』", text: "除非 p 否则 q　⟺　¬p → q", note: "『除非』后面的条件不成立时，结果才被保证。" },
            { label: "② 整句符号化", segs: [seg("¬", 0), seg("p", 1), seg(" → ", 2), seg("q", 3)],
              note: "¬下雨 → 比赛照常：只要不下雨，比赛就照常。" },
            { label: "③ 等价形式", text: "¬p → q　⟺　p ∨ q", note: "下雨或比赛照常，至少其一成立（下雨时比赛照常与否，本句未作断言）。" }
          ]
        },
        {
          label: "只能派小王或小李中的一人去开会",
          tokens: [
            { t: "只能派小王", c: "prop", sym: "p", note: "命题 p：派小王去开会。" },
            { t: "或", c: "conn", sym: "∨", note: "这里的『或』不能两者都取：排斥或（不可兼或）。" },
            { t: "小李", c: "prop", sym: "q", note: "命题 q：派小李去开会。" },
            { t: "中的一人去开会", c: "conn", sym: "恰一", note: "『只能…中的一人』说明 p、q 恰有一个成立，排除两者都成立。" }
          ],
          synthesis: [
            { label: "① 判断相容 / 排斥", text: "p、q 可以同真吗？——不可以 ⟹ 排斥或", note: "若写成 p ∨ q，会把『两人都去』也算作符合要求。" },
            { label: "② 整句符号化", segs: [seg("(", -1), seg("p", 0), seg(" ∧ ", -1), seg("¬", -1), seg("q", 2), seg(")", -1), seg(" ∨ ", 1), seg("(", -1), seg("¬", -1), seg("p", 0), seg(" ∧ ", -1), seg("q", 2), seg(")", -1)],
              note: "(p∧¬q) ∨ (¬p∧q)：恰好派其中一人。" },
            { label: "③ 等价形式", text: "(p∧¬q) ∨ (¬p∧q)　⟺　¬(p ↔ q)", note: "排斥或 = 两者真值不同；相容或 p∨q 在 p、q 同真时也为真。" }
          ]
        },
        {
          label: "并非既努力又幸运",
          tokens: [
            { t: "并非", c: "neg", sym: "¬", note: "否定作用于其后整个合取式，必须加括号锁定辖域。" },
            { t: "既", c: "conn", sym: "∧", note: "『既…又…』对应合取 ∧。" },
            { t: "努力", c: "prop", sym: "p", note: "命题 p：努力。" },
            { t: "又", c: "conn", sym: "∧", note: "『又』与『既』共同构成合取 ∧。" },
            { t: "幸运", c: "prop", sym: "q", note: "命题 q：幸运。" }
          ],
          synthesis: [
            { label: "① 默认优先级", text: "¬ 优先级最高：¬p ∧ q 读作 (¬p) ∧ q", note: "不加括号会被理解成『不努力，且幸运』。" },
            { label: "② 加括号消歧", segs: [seg("¬", 0), seg("(", -1), seg("p", 2), seg(" ∧ ", 3), seg("q", 4), seg(")", -1)],
              note: "原意是『并非(努力且幸运)』，必须写 ¬(p ∧ q)。" },
            { label: "③ 真值对比", text: "p=F, q=F 时：¬p∧q = F，而 ¬(p∧q) = T", note: "两式真值不同，说明一个括号就改变了含义。" }
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
        { cat: "prop", label: "命题 / 条款" },
        { cat: "conn", label: "逻辑联结" },
        { cat: "neg", label: "否定 / 排除" }
      ],
      sentences: [
        {
          label: "登录成功当且仅当用户名和密码都正确",
          tokens: [
            { t: "登录成功", c: "prop", sym: "r", note: "命题 r：登录成功（结果）。" },
            { t: "当且仅当", c: "conn", sym: "↔", note: "充要条件 ↔。" },
            { t: "用户名", c: "prop", sym: "p", note: "命题 p：用户名正确（『和…都正确』把谓语分配给两个主语）。" },
            { t: "和", c: "conn", sym: "∧", note: "『和…都』表示两者同时成立：合取 ∧。" },
            { t: "密码都正确", c: "prop", sym: "q", note: "命题 q：密码正确。" }
          ],
          synthesis: [
            { label: "① 形式规约", segs: [seg("r", 0), seg(" ↔ ", 1), seg("(", -1), seg("p", 2), seg(" ∧ ", 3), seg("q", 4), seg(")", -1)],
              note: "r ↔ (p ∧ q)：登录成功 当且仅当 用户名与密码都正确。" },
            { label: "② 真值约束", text: "p=F 或 q=F ⟹ r=F；p=q=T ⟹ r=T", note: "等价式保证『缺一不可』且『两者都对必能登录』，杜绝绕过校验。" },
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
            { label: "② 可满足性检验", text: "p=T ⟹ T∧F = F；p=F ⟹ F∧T = F（恒假 / 矛盾式）", note: "真值表两行皆假：无论如何都不成立。" },
            { label: "③ 结论", text: "条款集不可满足（UNSAT）⟹ 合同自相矛盾", note: "形式化让条款冲突可被自动检测，避免纠纷。" }
          ]
        },
        {
          label: "只有安全并且合规才能上线",
          tokens: [
            { t: "只有", c: "conn", sym: "→(必要)", note: "『只有…才…』：其后是上线的必要条件。" },
            { t: "安全", c: "prop", sym: "p", note: "命题 p：系统安全。" },
            { t: "并且", c: "conn", sym: "∧", note: "合取 ∧。" },
            { t: "合规", c: "prop", sym: "q", note: "命题 q：系统合规。" },
            { t: "才能", c: "conn", sym: "→", note: "『才能』决定必要条件方向。" },
            { t: "上线", c: "prop", sym: "r", note: "命题 r：系统上线。" }
          ],
          synthesis: [
            { label: "① 必要条件方向", text: "只有 (p∧q) 才 r　⟹　r → (p ∧ q)", note: "上线 ⟹ 必然安全且合规。" },
            { label: "② 形式规约", segs: [seg("r", 5), seg(" → ", 4), seg("(", -1), seg("p", 1), seg(" ∧ ", 2), seg("q", 3), seg(")", -1)],
              note: "r → (p ∧ q)：→ 的优先级低于 ∧，括号可省，但写出更清晰。" },
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
            { label: "② 双向拆分", text: "(p∧q)→r 且 r→(p∧q)", note: "等价拆成两个方向的蕴含，分别审查每一方向是否符合约定。" },
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
      if (leaves.length) groups.push({ label: g.label, color: CATS[g.cat].color, leaves: leaves });
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
    var p = 0, manualFocus = null, autoTimer = null, autoDelay = 1000;
    var origToks = [], chipEls = [], atomEls = [], synEls = [], segEls = [], leafEls = [], groupEls = [], leafGroup = [];
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.sentences.map(function (s, i) {
        return '<option value="' + i + '">' + esc(s.label) + '</option>';
      }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label for="symSentence"><span>选择语句</span><small>自然语言陈述</small></label>' +
          '<select id="symSentence">' + opts + '</select></div>' +
        '<div class="control-group"><label><span>逐步演示</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button type="button" class="sym-step-btn" id="symPrev">◀ 上一步</button>' +
            '<button type="button" class="sym-step-btn sym-primary" id="symNext">下一步 ▶</button>' +
            '<button type="button" class="sym-step-btn" id="symAuto">⏵ 自动播放</button>' +
            '<button type="button" class="sym-step-btn sym-reset" id="symReset">重置</button>' +
          '</div>' +
          '<div class="sym-speed-row"><label for="symSpeed">播放速度</label>' +
            '<select id="symSpeed"><option value="1600">慢</option><option value="1000" selected>中</option><option value="550">快</option></select></div>' +
        '</div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="symProgBar"></i></div>' +
          '<span class="sym-progress-num" id="symProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="symStatus" aria-live="polite"></div></div>';

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
      byId("symSpeed").addEventListener("change", function (e) {
        autoDelay = +e.target.value || 1000;
        if (autoTimer) { stopAuto(); toggleAuto(); }
      });
    }

    function renderLegend() {
      var box = byId("legendPanel");
      if (!box) return;
      var cats = '<div class="legend-cats">' + ["prop", "conn", "neg"].map(function (k) {
        return '<span class="legend-cat" style="--c:' + CATS[k].color + '">' + esc(CATS[k].name) + '</span>';
      }).join("") + '<span class="legend-cat is-cur">当前步骤</span></div>';
      box.innerHTML = '<div class="legend-title">符号体系说明</div>' + cats + '<div class="legend-grid">' +
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

    /* 结构树：viewBox 宽度随容器变化（手机上不再整体缩成小字） */
    function renderTree() {
      treeWrapEl.innerHTML = "";
      leafEls = []; groupEls = []; leafGroup = [];
      tokens.forEach(function () { leafEls.push(null); leafGroup.push(-1); });

      var groups = buildTreeData(tokens, cfg.treeGroups);
      var cw = treeWrapEl.clientWidth || 760;
      var VW = Math.max(330, Math.min(760, cw - 2));
      var maxLeaves = groups.reduce(function (m, g) { return Math.max(m, g.leaves.length); }, 1);
      var rootY = 42, groupY = 132, leafTop = 200, leafGap = 44;
      var H = leafTop + maxLeaves * leafGap + 16;

      var svg = svgEl("svg", { id: "symTree", viewBox: "0 0 " + VW + " " + H, width: "100%", height: H, role: "img", "aria-label": "命题公式的词类结构树" });
      var g = svgEl("g");
      svg.appendChild(g);

      var rootX = VW / 2;
      var slot = VW / groups.length;
      var fontLeaf = VW < 480 ? 12 : 13;
      var perChar = VW < 480 ? 13 : 17;

      groups.forEach(function (grp, gi) {
        var gx = (gi + 0.5) * slot;
        g.appendChild(svgEl("path", { d: "M " + rootX + " " + (rootY + 31) + " Q " + rootX + " " + ((rootY + groupY) / 2) + " " + gx + " " + (groupY - 17), stroke: grp.color, "stroke-width": 2, fill: "none", opacity: 0.55 }));
        grp.leaves.forEach(function (lf, li) {
          var ly = leafTop + li * leafGap;
          g.appendChild(svgEl("path", { d: "M " + gx + " " + (groupY + 17) + " L " + gx + " " + (ly - 12), stroke: grp.color, "stroke-width": 1.5, fill: "none", opacity: 0.4 }));
        });
      });

      var rootG = svgEl("g");
      rootG.appendChild(svgEl("circle", { cx: rootX, cy: rootY, r: 31, fill: "#b8321a", stroke: "#fff", "stroke-width": 3 }));
      var rt = svgEl("text", { x: rootX, y: rootY, "text-anchor": "middle", "dominant-baseline": "central", fill: "#fff", "font-size": 12, "font-weight": "bold" });
      rt.textContent = "命题公式";
      rootG.appendChild(rt);
      g.appendChild(rootG);

      groups.forEach(function (grp, gi) {
        var gx = (gi + 0.5) * slot;
        var grpG = svgEl("g");
        grpG.setAttribute("class", "sym-group");
        var gw = Math.min(slot - 10, grp.label.length * 12 + 24);
        grpG.appendChild(svgEl("rect", { x: gx - gw / 2, y: groupY - 16, width: gw, height: 32, rx: 16, fill: grp.color, stroke: "#fff", "stroke-width": 3 }));
        var gt = svgEl("text", { x: gx, y: groupY, "text-anchor": "middle", "dominant-baseline": "central", fill: "#fff", "font-size": 12, "font-weight": "bold" });
        gt.textContent = grp.label;
        grpG.appendChild(gt);
        g.appendChild(grpG);
        groupEls.push(grpG);

        grp.leaves.forEach(function (lf, li) {
          var ly = leafTop + li * leafGap;
          var w = Math.min(slot - 8, Math.max(52, lf.text.length * perChar + 16));
          var leafG = svgEl("g");
          leafG.setAttribute("class", "sym-leaf");
          leafG.dataset.i = lf.i;
          leafG.appendChild(svgEl("rect", { x: gx - w / 2, y: ly - 15, width: w, height: 30, rx: 8, fill: "#fff", stroke: grp.color, "stroke-width": 1.6 }));
          var lt = svgEl("text", { x: gx, y: ly, "text-anchor": "middle", "dominant-baseline": "central", fill: "#2c1810", "font-size": fontLeaf, "font-weight": "600" });
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
      autoBtn.textContent = "⏸ 暂停播放";
      autoTimer = setInterval(function () {
        if (p >= total()) { stopAuto(); return; }
        manualFocus = null; p += 1; render();
      }, autoDelay);
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

    /* ---------- 基础层：合式公式判定练习 ---------- */
    function renderWff() {
      var box = byId("symWff");
      if (!box || !cfg.wff) return;
      var card = box.closest ? box.closest(".sym-stage-card") : null;
      if (card) card.hidden = false;
      var answered = {};
      box.innerHTML =
        '<ol class="wff-rules">' +
          '<li>单个命题变元（p、q、r…）与命题常元 0、1 是合式公式；</li>' +
          '<li>若 A 是合式公式，则 (¬A) 也是合式公式；</li>' +
          '<li>若 A、B 是合式公式，则 (A∧B)、(A∨B)、(A→B)、(A↔B) 也是合式公式；</li>' +
          '<li>只有有限次地应用 ①～③ 得到的符号串才是合式公式。</li>' +
        '</ol>' +
        '<p class="wff-conv">约定：最外层括号可省略；按优先级 ¬ &gt; ∧ &gt; ∨ &gt; → &gt; ↔ 可再省去部分括号。</p>' +
        '<div class="wff-list">' + cfg.wff.map(function (w, i) {
          return '<div class="wff-item" data-i="' + i + '">' +
            '<code class="wff-f">' + esc(w.f) + '</code>' +
            '<div class="wff-btns"><button type="button" class="wff-btn" data-v="1">是合式公式</button>' +
            '<button type="button" class="wff-btn" data-v="0">不是</button></div>' +
            '<div class="wff-fb" aria-live="polite"></div></div>';
        }).join("") + '</div>' +
        '<div class="wff-foot"><span class="wff-score" id="symWffScore"></span>' +
        '<button type="button" class="sym-step-btn sym-reset wff-reset" id="symWffReset">重做练习</button></div>';

      function score() {
        var n = 0, right = 0;
        Object.keys(answered).forEach(function (k) { n++; if (answered[k]) right++; });
        byId("symWffScore").textContent = n ? ("已判定 " + n + " / " + cfg.wff.length + "，答对 " + right + " 题") : ("共 " + cfg.wff.length + " 个符号串，逐个判断是否为合式公式。");
      }
      Array.prototype.forEach.call(box.querySelectorAll(".wff-item"), function (item) {
        var i = +item.dataset.i, w = cfg.wff[i];
        var fb = item.querySelector(".wff-fb");
        Array.prototype.forEach.call(item.querySelectorAll(".wff-btn"), function (btn) {
          btn.addEventListener("click", function () {
            var guess = btn.dataset.v === "1";
            var right = guess === w.ok;
            answered[i] = right;
            Array.prototype.forEach.call(item.querySelectorAll(".wff-btn"), function (b) { b.classList.remove("is-picked"); });
            btn.classList.add("is-picked");
            item.classList.remove("is-right", "is-wrong");
            item.classList.add(right ? "is-right" : "is-wrong");
            fb.innerHTML = (right ? '<b class="ok">✓ 判断正确</b>' : '<b class="bad">✗ 再想想</b>') +
              '：它' + (w.ok ? '<b>是</b>' : '<b>不是</b>') + '合式公式。' + esc(w.why);
            score();
          });
        });
      });
      byId("symWffReset").addEventListener("click", function () { renderWff(); });
      score();
    }

    renderControls();
    renderLegend();
    loadSentence(0);
    renderWff();

    var lastW = treeWrapEl.clientWidth, rT = null;
    global.addEventListener("resize", function () {
      clearTimeout(rT);
      rT = setTimeout(function () {
        if (Math.abs(treeWrapEl.clientWidth - lastW) < 24) return;
        lastW = treeWrapEl.clientWidth;
        renderTree();
        render();
      }, 160);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})(typeof window !== "undefined" ? window : globalThis);
