/* =====================================================================
 * 5.7 命题推理系统及性质 —— 三层统一交互引擎（推理系统性质仪表盘）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取难度。
 *
 * 交互形态（与本章其它小节同形）：选择系统 → 逐项判定命题样本
 *   点一步判定一个命题：语义上是否『有效 ⊨』、本系统中是否『可证 ⊢』
 *   → 看分类反馈（定理 / 完备性缺口 / 可靠性破坏 / 正常排除）
 *   → 看语义 × 语法集合图中对应点高亮 → 给出元性质结论（可靠 / 完备 / 一致）。
 *   完成后可点任意命题样本 / 圆点回看。
 *
 * 难度梯度：
 *   基础层：形式系统的组成（字母表、合式公式、公理、推理规则）与可证性。
 *   进阶层：可靠性、完备性、一致性的定义、判定与相互关系。
 *   拓展层：证明助手（Coq / Lean）、哥德尔完备性定理与不完备定理的区分。
 *
 * 说明：样本中的 p、q、r 为命题变元；公理中的 A、B、C 为可代入任意公式的元变元。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* 命题样本：valid = 语义真（⊨），provable = 本系统可证（⊢），contra = 是否为矛盾式 */
  function classify(f) {
    if (f.provable && f.valid) return "theorem";    // 定理：可证且有效
    if (f.valid && !f.provable) return "gap";       // 完备性缺口：有效却不可证
    if (f.provable && !f.valid) return "unsound";   // 可靠性破坏：可证却无效
    return "excluded";                               // 正常排除：既不可证也无效
  }
  var KIND_SHORT = { theorem: "定理", gap: "缺口", unsound: "破坏", excluded: "排除" };
  var KIND_LABEL = {
    theorem: "定理（可证且有效）", gap: "完备性缺口（有效却不可证）",
    unsound: "可靠性破坏（可证却无效）", excluded: "正常排除（不可证也无效）"
  };

  /* 语义一侧的说法：命题逻辑里是「有效（重言式）」，算术理论里是「在 ℕ 中为真」 */
  var SEM_TAUT = { yes: "有效 ⊨", no: "无效 ⊭", set: "有效 ⊨（重言式）", word: "有效" };
  var SEM_FOL = { yes: "有效 ⊨", no: "无效 ⊭", set: "有效 ⊨（所有解释下真）", word: "有效" };
  var SEM_NAT = { yes: "ℕ 中为真", no: "ℕ 中为假", set: "在 ℕ 中为真", word: "为真" };

  function computeCase(c) {
    var fs = c.formulas.map(function (f, i) {
      return { i: i, f: f.f, valid: f.valid, provable: f.provable, contra: !!f.contra, note: f.note || "", proof: f.proof || null, kind: classify(f) };
    });
    var sound = !fs.some(function (f) { return f.provable && !f.valid; });
    var complete = !fs.some(function (f) { return f.valid && !f.provable; });
    var consistent = !fs.some(function (f) { return f.provable && f.contra; });
    var key = (!sound || !consistent) ? "bad" : (!complete ? "partial" : "good");
    var label = (sound ? "可靠 ✓" : "不可靠 ✗") + " · " + (complete ? "完备 ✓" : "不完备 ✗") + " · " + (consistent ? "一致 ✓" : "不一致 ✗");
    return {
      system: c.system || "", parts: c.parts || [], sem: c.sem || SEM_TAUT, formulas: fs,
      sound: sound, complete: complete, consistent: consistent, key: key, label: label,
      reason: c.verdict || "", insight: c.insight || "", propNotes: c.propNotes || {}
    };
  }

  /* ---- 常用系统组成 ---- */
  var P_ALPHA = ["字母表", "命题变元 p, q, r, …；联结词 ¬、→；括号 ( )"];
  var P_WFF = ["合式公式", "命题变元是公式；若 A、B 是公式，则 ¬A、(A → B) 也是公式。A ∨ B 记作 ¬A → B，A ∧ B 记作 ¬(A → ¬B)"];
  var P_AX = ["公理（模式）", "A1  A → (B → A)\nA2  (A → (B → C)) → ((A → B) → (A → C))\nA3  (¬A → ¬B) → (B → A)\n（A、B、C 可代入任意公式）"];
  var P_MP = ["推理规则", "MP（假言推理 / 分离规则）：由 A 与 A → B 推出 B"];

  /* p → p 在 A1、A2 + MP 中的 5 行证明（逐行已核对代入） */
  var PROOF_PP = [
    ["(p → ((p → p) → p)) → ((p → (p → p)) → (p → p))", "A2（A := p，B := p → p，C := p）"],
    ["p → ((p → p) → p)", "A1（A := p，B := p → p）"],
    ["(p → (p → p)) → (p → p)", "由 2、1 用 MP"],
    ["p → (p → p)", "A1（A := p，B := p）"],
    ["p → p", "由 4、3 用 MP"]
  ];

  var LEVELS = {
    basic: {
      introStatus: "选择一个形式系统，点「下一步」逐个判定命题样本：它是否有效 ⊨、能否在本系统中证出 ⊢。",
      knowledge: [
        "<b>形式系统</b>由四部分组成：字母表、合式公式（形成规则）、公理、推理规则。",
        "<b>证明</b>：公式序列，每一行要么是公理（的代入实例），要么由前面的行按推理规则得到；最后一行就是被证明的<b>定理</b>，记作 ⊢ A。",
        "<b>有效</b> ⊨ A：A 在所有赋值下都为真，即 A 是重言式。⊢ 讲“能不能推出来”，⊨ 讲“是不是真的”。",
        "公理是出发点、推理规则是阶梯：去掉任何一部分，能证出的定理都会变少。"
      ],
      cases: [
        { label: "标准公理系统（A1–A3 + MP）",
          parts: [P_ALPHA, P_WFF, P_AX, P_MP],
          verdict: "三条公理都是重言式，MP 把真前提变成真结论，所以凡可证者皆有效（<b>可靠</b>）；可以证明该系统能证出全部重言式（<b>完备</b>）。四个样本与之相符。",
          insight: "公理是出发点、规则是阶梯——二者合起来决定哪些公式是定理。",
          formulas: [
            { f: "p → p", valid: true, provable: true, proof: PROOF_PP, note: "用 A1、A2 与两次 MP 证得，是定理（证明序列见下）。" },
            { f: "p → (q → p)", valid: true, provable: true, note: "它就是 A1 的代入实例（A := p，B := q），一行即证。" },
            { f: "p ∨ ¬p", valid: true, provable: true, note: "按缩写就是 ¬p → ¬p，把上面 p → p 的证明中 p 全换成 ¬p 即得，可证。" },
            { f: "p → q", valid: false, provable: false, note: "p = 1、q = 0 时取值为 0，不是重言式；系统也证不出它——正常排除。" }
          ] },
        { label: "去掉推理规则（只有公理）",
          parts: [P_ALPHA, P_WFF, P_AX, ["推理规则", "无（去掉 MP）"]],
          verdict: "没有规则，能证出的只剩公理的代入实例。公理都有效，所以仍然<b>可靠</b>；但大量重言式证不出——<b>不完备</b>。",
          insight: "没有推理规则，再多公理也搭不出阶梯：可证性离不开规则。",
          formulas: [
            { f: "p → (q → p)", valid: true, provable: true, note: "A1 的代入实例，仍然可证。" },
            { f: "p → p", valid: true, provable: false, note: "有效，但它不是任何一条公理的代入实例，没有 MP 推不出——完备性缺口。" },
            { f: "p ∨ ¬p", valid: true, provable: false, note: "即 ¬p → ¬p，同样不是公理实例——缺口。" }
          ] },
        { label: "去掉公理 A3（只有 A1、A2 + MP）",
          parts: [P_ALPHA, P_WFF, ["公理（模式）", "A1  A → (B → A)\nA2  (A → (B → C)) → ((A → B) → (A → C))\n（去掉与否定有关的 A3）"], P_MP],
          verdict: "A1、A2 有效，MP 保真，所以仍然<b>可靠</b>；但缺了关于 ¬ 的公理，¬¬p → p 这类重言式证不出——<b>不完备</b>。",
          insight: "公理是系统的地基：地基不全，就有真命题够不到。",
          formulas: [
            { f: "p → p", valid: true, provable: true, proof: PROOF_PP, note: "证明只用到 A1、A2 与 MP，仍可证。" },
            { f: "(p → q) → (p → q)", valid: true, provable: true, note: "把 p → p 证明中的 p 换成 p → q 即得。" },
            { f: "¬¬p → p", valid: true, provable: false, note: "有效却证不出：把 ¬ 解释成“恒取 1”，A1、A2 仍恒真、MP 仍保真，而 ¬¬p → p 在 p = 0 时为 0，所以它不可能被证出——缺口。" }
          ] }
      ]
    },
    advanced: {
      introStatus: "选择一个系统，逐项判定命题样本，综合得出可靠性、完备性、一致性三大元性质。",
      knowledge: [
        "<b>可靠性</b>：Γ ⊢ A ⇒ Γ ⊨ A。可证必有效，不会证出假结论。",
        "<b>完备性</b>：Γ ⊨ A ⇒ Γ ⊢ A。有效必可证，不会漏掉真结论。",
        "<b>一致性</b>：不存在公式 A，使 ⊢ A 与 ⊢ ¬A 同时成立。",
        "<b>关系</b>：可靠 ⇒ 一致（矛盾式不是重言式，证不出来）；不一致 ⇒ 任意公式都可证（爆炸原理）；但不可靠未必不一致。",
        "命题逻辑的公理系统与自然推理系统<b>既可靠又完备</b>：⊢ A 当且仅当 ⊨ A。"
      ],
      cases: [
        { label: "标准系统（A1–A3 + MP）",
          parts: [["公理", "A1  A → (B → A)\nA2  (A → (B → C)) → ((A → B) → (A → C))\nA3  (¬A → ¬B) → (B → A)"], P_MP],
          verdict: "可靠性定理与完备性定理保证：⊢ A 当且仅当 ⊨ A；由可靠性又得一致性。样本判定与定理相符。",
          insight: "既不证假（可靠）、又不漏真（完备）、且不自相矛盾（一致）——形式系统的理想状态。",
          formulas: [
            { f: "p → p", valid: true, provable: true, note: "定理。" },
            { f: "p ∨ ¬p", valid: true, provable: true, note: "定理（排中律）。" },
            { f: "(p → q) ∨ (q → p)", valid: true, provable: true, note: "重言式；由完备性，它一定可证。" },
            { f: "p ∧ ¬p", valid: false, provable: false, contra: true, note: "矛盾式（永假），证不出；可证的是它的否定 ¬(p ∧ ¬p)。" }
          ] },
        { label: "不可靠系统（误加“肯定后件”）",
          parts: [["公理", "A1–A3"], ["推理规则", "MP；另误加一条错误规则：由 A → B 与 B 推出 A（肯定后件）"]],
          propNotes: { complete: "平凡成立" },
          verdict: "错误规则不保真：它证出了非重言式 p → q（<b>不可靠</b>）；而且同样的手法能证出任意公式，连 p ∧ ¬p 也可证（<b>不一致</b>）。注意：一般而言“不可靠”未必“不一致”，本例是因为这条规则过强才两者兼失；既然什么都能证，“完备”也只是平凡成立。",
          insight: "一条不保真的规则就足以让谬误混进定理——可靠性是底线。",
          formulas: [
            { f: "p → p", valid: true, provable: true, note: "定理。" },
            { f: "p → q", valid: false, provable: true, note: "记 X 为 p → q。r → r 是定理，由 A1 与 MP 得 X → (r → r)，再套错误规则即得 X。无效却被证出——可靠性破坏！" },
            { f: "p ∧ ¬p", valid: false, provable: true, contra: true, note: "把 X 换成 p ∧ ¬p 照做一遍，矛盾式也被证出——不一致。" }
          ] },
        { label: "直觉主义命题逻辑（不含排中律）",
          parts: [["系统", "构造性（直觉主义）命题逻辑：不承认排中律 p ∨ ¬p，也不承认双重否定消去 ¬¬p → p"], ["语义约定", "本例的“有效”指经典真值表下的重言式"]],
          verdict: "它证出的都是经典重言式（<b>可靠</b>、<b>一致</b>），但排中律等经典重言式证不出——相对真值表语义<b>不完备</b>。（相对专门的构造性语义，如 Kripke 语义，它是完备的。）",
          insight: "守住了底线（可靠），却没覆盖全部经典真理（不完备）；拓展层会看到，Coq 默认采用的正是构造性逻辑。",
          formulas: [
            { f: "p → p", valid: true, provable: true, note: "定理。" },
            { f: "p → ¬¬p", valid: true, provable: true, note: "构造性地可证：由 p 与 ¬p 可得矛盾。" },
            { f: "p ∨ ¬p", valid: true, provable: false, note: "经典重言式，构造性逻辑证不出——完备性缺口。" },
            { f: "¬¬p → p", valid: true, provable: false, note: "双重否定消去也证不出——缺口。" }
          ] },
        { label: "不一致系统（把 p 与 ¬p 都设为公理）",
          parts: [["公理", "A1–A3，另加 p 与 ¬p 两条公理"], P_MP],
          propNotes: { complete: "平凡成立" },
          verdict: "p 与 ¬p 同时可证（<b>不一致</b>）；由爆炸原理任意公式都可证，因而<b>不可靠</b>；“完备”在这里只是平凡成立——什么都能证，也就毫无意义。注意区分：若只是推理的前提 Γ 互相矛盾，则对任意 A 都有 Γ ⊢ A 且 Γ ⊨ A，这并不违反可靠性。",
          insight: "自相矛盾的体系什么都能推出，也就什么都说明不了——一致性是体系存续的根基。",
          formulas: [
            { f: "p ∧ ¬p", valid: false, provable: true, contra: true, note: "p、¬p 都是公理，合起来就证出矛盾式——不一致！" },
            { f: "q", valid: false, provable: true, note: "¬p → (p → q) 是定理，连用两次 MP 得 q（爆炸原理）；q 不是重言式——不可靠。" },
            { f: "¬q", valid: false, provable: true, note: "同理 ¬q 也可证：什么都能证。" }
          ] }
      ]
    },
    extend: {
      introStatus: "选择一个系统，逐项判定命题样本：看证明助手如何保证可靠，再区分逻辑的完备性与算术理论的不完备性。",
      knowledge: [
        "<b>证明助手</b>（Coq、Lean 等）基于类型论：证明写成程序，由很小的可信内核逐步检查。",
        "<b>哥德尔完备性定理</b>（1929 年证明，1930 年发表）：一阶逻辑中，有效的公式都可证。命题逻辑同样可靠且完备。",
        "<b>哥德尔第一不完备定理</b>（1931 年发表）：包含初等算术、一致且递归可公理化的形式系统 S 中，存在在 ℕ 中为真却在 S 中不可证的句子。",
        "<b>第二不完备定理</b>：这样的 S 证不出表达自身一致性的句子 Con(S)。",
        "<b>别混淆</b>：不完备定理说的是含算术的<b>理论</b>无法穷尽算术真理，不是说逻辑推理本身不完备或不可靠。"
      ],
      cases: [
        { label: "证明助手 Coq / Lean（命题逻辑片段）",
          parts: [
            ["逻辑基础", "类型论：Coq 用归纳构造演算，Lean 用依值类型论；“命题即类型，证明即程序”"],
            ["可信内核", "证明可由人或自动化策略生成，但都要交给一个很小的内核检查——只需信任这个内核"],
            ["经典推理", "Coq 默认是构造性逻辑，排中律需导入 Classical 库中的公理；Lean 4 核心库提供定理 Classical.em"]
          ],
          verdict: "凡通过内核检查的命题都有效——可靠性归结为信任一个很小的内核及其所依据的逻辑；在经典推理下，命题逻辑的全部重言式都可证（<b>可靠</b>、<b>完备</b>、<b>一致</b>）。",
          insight: "“小内核 + 机器逐步核验”已用于编译器（如用 Coq 验证的 CompCert）等关键软件的形式化验证。",
          formulas: [
            { f: "p → p", valid: true, provable: true, note: "Lean 中写 fun h => h 即可：恒等函数就是证明。" },
            { f: "p ∧ q → p", valid: true, provable: true, note: "取合取的左分量：Lean 中写 fun h => h.1。" },
            { f: "p ∨ ¬p", valid: true, provable: true, note: "Lean 中即 Classical.em p；Coq 需先 Require Import Classical，再用 classic。" },
            { f: "p → q", valid: false, provable: false, note: "不是重言式，写不出能通过内核检查的证明——内核拒绝，守住可靠性。" }
          ] },
        { label: "一阶逻辑（哥德尔完备性定理）",
          sem: SEM_FOL,
          parts: [
            ["系统", "一阶谓词逻辑的标准推理系统（公理 + MP + 概括规则）"],
            ["语义约定", "“有效”指在所有解释下都为真"],
            ["定理", "完备性定理（哥德尔，1929 年证明，1930 年发表）：有效 ⇒ 可证；加上可靠性，⊢ A 当且仅当 ⊨ A"]
          ],
          verdict: "一阶逻辑作为推理系统<b>可靠且完备</b>，和命题逻辑一样。下一个例子里的“不完备”针对的是含算术的具体理论，两者不矛盾。",
          insight: "“完备”一词两用：逻辑的完备性（有效必可证）与理论的完备性（每个句子或其否定可证），先分清再讨论哥德尔。",
          formulas: [
            { f: "∀x P(x) → P(c)", valid: true, provable: true, note: "全称特指，有效且可证。" },
            { f: "P(c) → ∃x P(x)", valid: true, provable: true, note: "存在推广，有效且可证。" },
            { f: "∃x P(x) → ∀x P(x)", valid: false, provable: false, note: "个体域中只有部分个体满足 P 时为假，不是有效式，也证不出——正常排除。" }
          ] },
        { label: "含初等算术的系统 S（第一不完备定理）",
          sem: SEM_NAT,
          parts: [
            ["前提条件", "S 包含初等算术（以皮亚诺算术 PA 为例）、一致、递归可公理化（能机械判定一条公式是不是公理）"],
            ["语义约定", "“真”指在标准自然数模型 ℕ 中为真，不是“逻辑有效”"],
            ["哥德尔句", "借助哥德尔编码构造句子 G，S 能证明：G 成立当且仅当 G 在 S 中不可证"]
          ],
          propNotes: { consistent: "定理的前提" },
          verdict: "以 PA 为例：它证出的都在 ℕ 中为真（<b>可靠</b>），也<b>一致</b>，却存在真而不可证的 G——S <b>不完备</b>。这是理论的不完备，与命题逻辑、一阶逻辑作为推理系统的完备性是两回事。",
          insight: "不完备定理划出的边界是：没有哪个一致、可机械检查的公理体系能证出全部算术真理——这并不是说逻辑推理不可靠。",
          formulas: [
            { f: "0 = 0", valid: true, provable: true, note: "可证的真命题。" },
            { f: "∀x (x + 0 = x)", valid: true, provable: true, note: "PA 的加法公理之一，直接可证。" },
            { f: "1 + 1 = 2", valid: true, provable: true, note: "1、2 是 s(0)、s(s(0)) 的缩写（s 为后继），由加法公理几步可证。" },
            { f: "G", valid: true, provable: false, note: "若 S 一致，则 G 不可证；而 G 说的恰是“G 不可证”，所以 G 在 ℕ 中为真——真而不可证。" }
          ] },
        { label: "加入新公理：S′ = S + G",
          sem: SEM_NAT,
          parts: [
            ["构造", "把 G 作为新公理加入 S，得到更强的系统 S′"],
            ["条件", "G 在 ℕ 中为真，ℕ 仍是 S′ 的模型，所以 S′ 一致；S′ 仍含初等算术、递归可公理化"],
            ["结论", "不完备定理对 S′ 同样适用：S′ 有自己的哥德尔句 G′"]
          ],
          verdict: "S′ 能证 G，却又出现新的真而不可证的 G′，也证不出 Con(S′)。只要保持一致且递归可公理化，无论怎样添加公理都补不完——算术理论<b>本质不完备</b>。",
          insight: "新公理带来新定理，也带来新问题：承认边界，恰是持续求索的起点。",
          formulas: [
            { f: "G", valid: true, provable: true, note: "在 S′ 中它就是公理，当然可证。" },
            { f: "0 = 0", valid: true, provable: true, note: "仍可证。" },
            { f: "G′", valid: true, provable: false, note: "S′ 的哥德尔句：真而不可证——缺口再现。" },
            { f: "Con(S′)", valid: true, provable: false, note: "第二不完备定理：S′ 一致，所以 Con(S′) 为真，但 S′ 证不出它。" }
          ] }
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
  function svgText(attrs, txt) { var t = svgEl("text", attrs); t.textContent = txt; return t; }
  function byId(id) { return document.getElementById(id); }
  var KIND_COLOR = { theorem: "#2F7D57", gap: "#C58A1F", unsound: "#C0392B", excluded: "#9A8A80" };
  var SPEEDS = [["慢速", 1700], ["中速", 1100], ["快速", 650]];

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
    var p = 0, manualFocus = null, autoTimer = null, speed = SPEEDS[1][1], compact = null;
    var cardEls = [], dotEls = [];
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.cases.map(function (c, i) { return '<option value="' + i + '">' + esc(c.label) + '</option>'; }).join("");
      var sp = SPEEDS.map(function (s) { return '<option value="' + s[1] + '"' + (s[1] === speed ? " selected" : "") + '>' + s[0] + '</option>'; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label for="spSelect"><span>选择系统</span><small>形式推理系统</small></label>' +
          '<select id="spSelect">' + opts + '</select></div>' +
        '<div class="control-group"><label><span>逐项判定</span><small>一步判定一个样本</small></label>' +
          '<div class="sym-step-row">' +
            '<button type="button" class="sym-step-btn sym-secondary" id="spPrev">◀ 上一步</button>' +
            '<button type="button" class="sym-step-btn sym-primary" id="spNext">下一步 ▶</button>' +
            '<button type="button" class="sym-step-btn sym-secondary" id="spAuto">▶ 自动播放</button>' +
            '<button type="button" class="sym-step-btn sym-reset" id="spReset">↺ 重置</button>' +
          '</div>' +
          '<div class="sym-speed"><label for="spSpeed">播放速度</label><select id="spSpeed">' + sp + '</select></div>' +
        '</div>' +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="spProgBar"></i></div>' +
          '<span class="sym-progress-num" id="spProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="spStatus" aria-live="polite"></div></div>';
      statusEl = byId("spStatus"); progBar = byId("spProgBar"); progNum = byId("spProgNum");
      prevBtn = byId("spPrev"); nextBtn = byId("spNext"); autoBtn = byId("spAuto");
      byId("spSelect").addEventListener("change", function (e) { loadCase(+e.target.value); });
      byId("spSpeed").addEventListener("change", function (e) {
        speed = +e.target.value || 1100;
        if (autoTimer) { clearInterval(autoTimer); autoTimer = setInterval(tick, speed); }
      });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("spReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
    }

    function renderKnowledge() {
      var box = byId("spKnow"); if (!box) return;
      box.innerHTML = '<div class="legend-title">知识要点</div><ul class="know-list">' +
        cfg.knowledge.map(function (k) { return '<li>' + k + '</li>'; }).join("") + '</ul>';
    }

    function loadCase(idx) {
      stopAuto();
      st = computeCase(cfg.cases[idx]);
      p = 0; manualFocus = null;
      renderSystem(); renderFormulas(); renderVenn(true);
      render();
    }

    function renderSystem() {
      var rows = st.parts.map(function (pt) {
        return '<div class="sys-part"><span class="sys-k">' + esc(pt[0]) + '</span><span class="sys-v">' + esc(pt[1]).replace(/\n/g, "<br>") + '</span></div>';
      }).join("");
      systemEl.innerHTML = '<div class="sys-parts">' + rows + '</div>' +
        '<div class="sys-row">逐项判定下方样本：语义上是否 <b>' + esc(st.sem.word) + '</b>（' + esc(st.sem.set) + '），本系统中是否 <b>可证 ⊢</b>，再综合三大元性质。</div>';
    }

    function renderFormulas() {
      formulasEl.innerHTML = "";
      cardEls = st.formulas.map(function (f, i) {
        var d = document.createElement("button");
        d.type = "button";
        d.className = "sp-formula k-" + f.kind;
        d.dataset.row = i;
        d.innerHTML = '<span class="sf-no">' + (i + 1) + '</span><span class="sf-f">' + esc(f.f) + '</span>' +
          '<span class="sf-tags">' +
          '<span class="sf-tag ' + (f.valid ? "t-valid" : "t-invalid") + '">' + esc(f.valid ? st.sem.yes : st.sem.no) + '</span>' +
          '<span class="sf-tag ' + (f.provable ? "t-prov" : "t-unprov") + '">' + (f.provable ? "可证 ⊢" : "不可证 ⊬") + '</span>' +
          '<span class="sf-tag t-kind k-' + f.kind + '">' + KIND_SHORT[f.kind] + '</span></span>';
        d.addEventListener("click", function () { clickRow(i); });
        formulasEl.appendChild(d);
        return d;
      });
    }

    /* 语义 × 语法 集合图：左圆 = 语义真集，右圆 = 可证集；桌面宽版 / 手机紧凑版两套几何 */
    function geometry(isCompact) {
      if (isCompact) return { W: 400, H: 400, cy: 196, r: 120, vx: 145, px: 255, fs: 16.5, lf: 14, dr: 14, dx: 32, dy: 34,
        reg: { gap: 88, theorem: 200, unsound: 312 }, lblY: 270, exc: { x: 336, y: 372, ly: 346 } };
      return { W: 760, H: 350, cy: 182, r: 130, vx: 305, px: 455, fs: 15, lf: 12.5, dr: 15, dx: 36, dy: 36,
        reg: { gap: 236, theorem: 380, unsound: 524 }, lblY: 258, exc: { x: 672, y: 318, ly: 286 } };
    }
    function renderVenn(force) {
      var w = vennEl.clientWidth || 760;
      var isCompact = w < 560;
      if (!force && isCompact === compact) return;
      compact = isCompact;
      var G = geometry(isCompact);
      vennEl.innerHTML = "";
      var svg = svgEl("svg", { viewBox: "0 0 " + G.W + " " + G.H, role: "img", "aria-label": "语义真集与可证集的集合图" });
      var g = svgEl("g"); svg.appendChild(g);
      g.appendChild(svgEl("circle", { cx: G.vx, cy: G.cy, r: G.r, fill: "rgba(47,125,87,0.10)", stroke: "#2F7D57", "stroke-width": 2 }));
      g.appendChild(svgEl("circle", { cx: G.px, cy: G.cy, r: G.r, fill: "rgba(214,59,29,0.08)", stroke: "#D63B1D", "stroke-width": 2 }));
      g.appendChild(svgText({ x: 12, y: 26, fill: "#1F6B47", "font-size": G.fs, "font-weight": "800" }, st.sem.set));
      g.appendChild(svgText({ x: G.W - 12, y: 26, "text-anchor": "end", fill: "#B8321A", "font-size": G.fs, "font-weight": "800" }, "可证 ⊢（本系统）"));
      [["gap", "只真不可证"], ["theorem", "定理"], ["unsound", "只可证不真"]].forEach(function (it) {
        g.appendChild(svgText({ x: G.reg[it[0]], y: G.lblY, "text-anchor": "middle", fill: KIND_COLOR[it[0]], "font-size": G.lf, "font-weight": "800" }, it[1]));
      });
      g.appendChild(svgText({ x: G.exc.x, y: G.exc.ly, "text-anchor": "middle", fill: "#6B4A38", "font-size": G.lf, "font-weight": "700" }, "两者之外"));

      var groups = { theorem: [], gap: [], unsound: [], excluded: [] };
      st.formulas.forEach(function (f, i) { groups[f.kind].push(i); });
      dotEls = [];
      Object.keys(groups).forEach(function (kind) {
        var list = groups[kind], n = list.length; if (!n) return;
        var cols = kind === "excluded" ? Math.min(n, 3) : Math.min(n, 2), rows = Math.ceil(n / cols);
        var cx = kind === "excluded" ? G.exc.x : G.reg[kind];
        var y0 = kind === "excluded" ? G.exc.y - (rows - 1) * G.dy : G.cy - 22 - (rows - 1) * G.dy / 2;
        list.forEach(function (idx, k) {
          var row = Math.floor(k / cols), col = k % cols, inRow = Math.min(cols, n - row * cols);
          var x = cx + (col - (inRow - 1) / 2) * G.dx, y = y0 + row * G.dy;
          var dg = svgEl("g", { "class": "sp-dot", tabindex: "0", role: "button", "aria-label": "样本 " + (idx + 1) + "：" + st.formulas[idx].f });
          var c = svgEl("circle", { cx: x, cy: y, r: G.dr, fill: KIND_COLOR[kind], stroke: "#fff", "stroke-width": 2 });
          var t = svgText({ x: x, y: y, "text-anchor": "middle", "dominant-baseline": "central", fill: "#fff", "font-size": 13, "font-weight": "800", "font-family": "JetBrains Mono, Consolas, monospace" }, String(idx + 1));
          dg.appendChild(c); dg.appendChild(t);
          dg.addEventListener("click", function () { clickRow(idx); });
          dg.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); clickRow(idx); } });
          g.appendChild(dg);
          dotEls[idx] = { g: dg, c: c };
        });
      });
      vennEl.appendChild(svg);
      if (st && progNum) render();
    }

    function kindLabel(kind) { return KIND_LABEL[kind].replace(/有效/g, st.sem.word).replace("可证却无效", "可证却" + (st.sem.word === "有效" ? "无效" : "不真")).replace("不可证也无效", "不可证也" + (st.sem.word === "有效" ? "无效" : "不真")); }
    function total() { return st.formulas.length + 1; }
    function step(dir) { manualFocus = null; p = Math.max(0, Math.min(total(), p + dir)); render(); }
    function clickRow(i) {
      stopAuto();
      var n = st.formulas.length;
      if (p <= n) { p = i + 1; manualFocus = null; }
      else { manualFocus = (manualFocus === i ? null : i); }
      render();
    }
    function tick() { if (p >= total()) { stopAuto(); return; } manualFocus = null; p += 1; render(); }
    function toggleAuto() {
      if (autoTimer) { stopAuto(); return; }
      if (p >= total()) { p = 0; manualFocus = null; render(); }
      autoBtn.classList.add("sym-playing"); autoBtn.textContent = "⏸ 暂停播放";
      autoTimer = setInterval(tick, speed);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } if (autoBtn) { autoBtn.classList.remove("sym-playing"); autoBtn.textContent = "▶ 自动播放"; } }

    function render() {
      var n = st.formulas.length, T = n + 1;
      var shown = Math.min(p, n);
      var verdictShown = p > n;
      var stepRow = (p >= 1 && p <= n) ? p - 1 : null;
      var focusRow = (manualFocus != null) ? manualFocus : stepRow;

      for (var k = 0; k < n; k++) {
        var revealed = k < shown || verdictShown;
        var isCur = (k === focusRow);
        if (cardEls[k]) { cardEls[k].classList.toggle("sym-pending", !revealed); cardEls[k].classList.toggle("sym-cur", isCur); cardEls[k].setAttribute("aria-pressed", isCur ? "true" : "false"); }
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

    function proofHTML(proof) {
      return '<div class="ev-proof"><div class="ev-proof-title">证明序列（每行是公理实例或由 MP 得到）</div><div class="ev-proof-scroll"><table>' +
        proof.map(function (ln, i) { return '<tr><td class="pn">' + (i + 1) + '</td><td class="pf">' + esc(ln[0]) + '</td><td class="pr">' + esc(ln[1]) + '</td></tr>'; }).join("") +
        '</table></div></div>';
    }

    function evalHTML(focusRow, verdictShown) {
      if (focusRow == null && !verdictShown) return '<span class="ev-hint">点「下一步」逐项判定命题样本：先看语义上是否' + esc(st.sem.word) + '，再看本系统能否证出，归类为定理 / 缺口 / 破坏 / 排除。</span>';
      if (focusRow == null && verdictShown) return '已判定全部 <b>' + st.formulas.length + '</b> 个样本，下方给出可靠性、完备性、一致性结论。可点任意样本回看。';
      var f = st.formulas[focusRow];
      return '<div>判定 <span class="ev-f">' + esc(f.f) + '</span>：' + esc(f.valid ? st.sem.yes : st.sem.no) + '，' + (f.provable ? "可证 ⊢" : "不可证 ⊬") + '</div>' +
        '<div class="ev-line">归类 <span class="ev-k k-' + f.kind + '">' + esc(kindLabel(f.kind)) + '</span>：' + esc(f.note) + '</div>' +
        (f.proof ? proofHTML(f.proof) : "");
    }

    function renderVerdict(show) {
      function prop(name, def, val, noteKey) {
        var extra = show && st.propNotes[noteKey] ? '<div class="p-note">' + esc(st.propNotes[noteKey]) + '</div>' : "";
        return '<div class="sp-prop ' + (show ? (val ? "v-yes" : "v-no") : "sym-pending") + '"><div class="p-name">' + name + '</div><div class="p-def">' + def + '</div><div class="p-val">' + (show ? (val ? "成立 ✓" : "不成立 ✗") : "待判定") + '</div>' + extra + '</div>';
      }
      var props = '<div class="sp-props">' +
        prop("可靠性", "可证 ⇒ " + esc(st.sem.word), st.sound, "sound") +
        prop("完备性", esc(st.sem.word) + " ⇒ 可证", st.complete, "complete") +
        prop("一致性", "不同时证 A 与 ¬A", st.consistent, "consistent") + '</div>';
      var concl = '<div class="sp-conclusion k-' + st.key + (show ? "" : " sym-pending") + '">' +
        '<span class="c-chip">系统判定：' + esc(show ? st.label : "待判定") + '</span>' +
        '<div class="c-reason">' + (show ? st.reason : "逐项判定完成后给出结论。") + '</div>' +
        (show && st.insight ? '<div class="c-insight">💡 ' + esc(st.insight) + '</div>' : "") + '</div>' +
        '<p class="sp-footnote">说明：元性质针对系统的全部公式。样本只作演示——一个反例足以否定某条性质，肯定的结论则来自定理。</p>';
      verdictEl.innerHTML = props + concl;
    }

    function statusHTML(pp, focusRow, verdictShown) {
      if (pp === 0) return cfg.introStatus;
      if (focusRow != null) {
        var f = st.formulas[focusRow];
        return '样本 <b>' + esc(f.f) + '</b>：' + esc(f.valid ? st.sem.yes : st.sem.no) + '，' + (f.provable ? "可证 ⊢" : "不可证 ⊬") + ' → <b>' + esc(kindLabel(f.kind).replace(/（.*）/, "")) + '</b>。';
      }
      if (verdictShown) return '✅ <b>' + esc(st.label) + '</b>。可点任意样本或圆点回看。';
      return "";
    }

    renderControls();
    renderKnowledge();
    loadCase(0);

    var rt = null;
    global.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { renderVenn(false); }, 150); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})(typeof window !== "undefined" ? window : globalThis);
