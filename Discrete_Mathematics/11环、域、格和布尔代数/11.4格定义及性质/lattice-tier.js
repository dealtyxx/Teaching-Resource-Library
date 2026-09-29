/* =====================================================================
 * 11.4 格定义及性质 —— 基础层 / 拓展层 场景（由 ../ch11-engine.js 与 ../ch11-poset.js 驱动）
 *   基础层：格的偏序定义——任两元都有最小上界 a∨b 与最大下界 a∧b；对比一个“不是格”的偏序集
 *   拓展层：格的建模与对偶——权限格（幂集）、类型格、安全等级链；把 Hasse 图倒过来看对偶原理
 * ===================================================================== */
(function () {
  "use strict";
  var H = CH11.H, esc = CH11.esc, P = CH11P;
  var dvd = function (a, b) { return b % a === 0; };
  var sub = function (A, B) { return A.split("").every(function (c) { return B.indexOf(c) >= 0; }); };
  function setLab(s) { return s === "" ? "∅" : "{" + s.split("").join(",") + "}"; }

  /* ---------- 偏序集示例 ---------- */
  var D12 = P.make({ els: [1, 2, 3, 4, 6, 12], leq: dvd,
    pos: { 1: [360, 360], 2: [290, 270], 3: [430, 270], 4: [290, 170], 6: [430, 170], 12: [360, 80] } });
  var PAB = P.make({ els: ["", "a", "b", "ab"], leq: sub, labels: { "": "∅", a: "{a}", b: "{b}", ab: "{a,b}" },
    pos: { "": [360, 340], a: [270, 225], b: [450, 225], ab: [360, 110] } });
  var CH4 = P.make({ els: [1, 2, 3, 4], leq: function (a, b) { return a <= b; },
    pos: { 1: [360, 360], 2: [360, 270], 3: [360, 180], 4: [360, 90] } });
  var BUT = P.make({ els: ["a", "b", "c", "d"], leq: function (x, y) { return x === y || ((x === "a" || x === "b") && (y === "c" || y === "d")); },
    pos: { a: [280, 320], b: [440, 320], c: [280, 130], d: [440, 130] } });

  function pickRow(st, key, Pz, lab, cls) {
    return '<div class="ctrl-row"><label>' + lab + '</label><div class="chip-row">' + Pz.els.map(function (x) {
      return '<button type="button" class="pick' + (String(st.p[key]) === String(x) ? " " + cls : "") + '" data-pick="' + key + '" data-val="' + esc(x === "" ? "∅" : x) + '">' + esc(Pz.lab(x)) + "</button>";
    }).join("") + "</div></div>";
  }
  function norm(Pz, v) { if (v === "∅") v = ""; var f = Pz.els.filter(function (x) { return String(x) === String(v); }); return f.length ? f[0] : Pz.els[0]; }

  var basic = {
    stepTitle: "四步找上下确界",
    stepHint: "上界 → 最小上界 → 下确界 → 是不是格",
    mission: "格是这样的偏序集：任意两个元素 a、b 都有最小上界 a∨b 与最大下界 a∧b。在 Hasse 图上挑两个元素，先找出全部上界，再看其中有没有“最小”的那一个。",
    badge: "偏序 · 上下确界",
    caseLabel: "选择偏序集",
    cases: [
      { label: "整除关系 D₁₂ = ⟨{1,2,3,4,6,12}, |⟩", P: D12, a: 4, b: 6, name: "D₁₂" },
      { label: "幂集 P({a,b}) 按 ⊆", P: PAB, a: "a", b: "b", name: "P({a,b})" },
      { label: "链 1 ≤ 2 ≤ 3 ≤ 4", P: CH4, a: 2, b: 3, name: "链" },
      { label: "反例：“蝴蝶”偏序集 a,b < c,d", P: BUT, a: "a", b: "b", name: "蝴蝶偏序集" }
    ],
    init: function (st) { st.p.a = st.c.a; st.p.b = st.c.b; },
    onPick: function (st, k, v) { st.p[k] = norm(st.c.P, v); },
    steps: [
      { t: "读 Hasse 图", s: "越高越“大”", tok: 0 },
      { t: "找全部上界", s: "a ≤ u 且 b ≤ u", tok: 1 },
      { t: "最小上界", s: "a ∨ b", tok: 2 },
      { t: "下确界与结论", s: "a ∧ b · 是否为格", tok: 3 }
    ],
    tokens: ["⟨L, ≤⟩", "UB(a,b)", "a ∨ b = lub", "a ∧ b = glb"],
    legend: [["cur", "所选 a、b"], ["key", "上/下界"], ["ok", "确界"], ["bad", "无确界"]],
    controls: function (st) { return pickRow(st, "a", st.c.P, "元素 a", "on2") + pickRow(st, "b", st.c.P, "元素 b", "on2"); },
    title: function (st) { return st.c.label.replace(/^反例：/, ""); },
    sub: function (st) {
      return ["Hasse 图只画“紧挨着”的覆盖关系，沿线向上就是变大；传递得到的关系省略不画。",
        "上界：同时位于 a 和 b 上方（或等于它们）的元素，红色标出。",
        "在所有上界中，若有一个比其余上界都小，它就是最小上界 a∨b（绿色）。",
        "对偶地找最大下界 a∧b。任意两元都有 ∨ 和 ∧ ⇒ 这个偏序集是格。"][st.step];
    },
    draw: function (st) {
      var Q = st.c.P, a = st.p.a, b = st.p.b, kinds = {}, ek = {}, s = "";
      var U = Q.ub(a, b), L = Q.lb(a, b), j = Q.lub(a, b), m = Q.glb(a, b);
      if (st.step >= 1) U.forEach(function (x) { kinds[x] = "key"; });
      if (st.step >= 2) { if (j != null) kinds[j] = "ok"; else Q.minimal(U).forEach(function (x) { kinds[x] = "bad"; }); }
      if (st.step >= 3) { L.forEach(function (x) { if (!kinds[x]) kinds[x] = "key"; }); if (m != null) kinds[m] = "ok"; else Q.maximal(L).forEach(function (x) { kinds[x] = "bad"; }); }
      kinds[a] = kinds[b] = "cur";
      if (st.step >= 2 && j != null && (j === a || j === b)) kinds[j] = "ok";
      s += P.hasse(Q, H, kinds, ek, { r: 24 });
      var msg = [
        "选中 a = " + Q.lab(a) + "，b = " + Q.lab(b),
        "上界 UB = " + (U.length ? "{" + U.map(Q.lab).join(", ") + "}" : "∅（没有上界）"),
        j != null ? "a ∨ b = " + Q.lab(j) + "（最小上界）" : "上界 " + Q.minimal(U).map(Q.lab).join("、") + " 互不可比 ⇒ 没有最小上界",
        (j != null ? "a∨b = " + Q.lab(j) : "a∨b 不存在") + "，" + (m != null ? "a∧b = " + Q.lab(m) : "a∧b 不存在") + " ⇒ " + (Q.isLattice() ? "是格" : "不是格")
      ][st.step];
      s += H.text(360, 420, msg, { size: 16, weight: 800, color: /不存在|没有|不是/.test(msg) ? "#c0392b" : "#4e362d" });
      return H.svg(s, 720, 440);
    },
    feedback: function (st) {
      var Q = st.c.P, a = st.p.a, b = st.p.b, j = Q.lub(a, b), m = Q.glb(a, b), bad = Q.badPair();
      return [
        "<b>偏序</b>：" + esc(st.c.label.replace(/^反例：/, "")) + "。自反、反对称、传递三条都满足。",
        "<b>上界</b>：满足 " + Q.lab(a) + " ≤ u 且 " + Q.lab(b) + " ≤ u 的 u 共 " + Q.ub(a, b).length + " 个。",
        "<b>最小上界</b>：" + (j != null ? "a ∨ b = <b>" + Q.lab(j) + "</b>，它在所有上界之下。" : '<span class="bad">上界 ' + Q.minimal(Q.ub(a, b)).map(Q.lab).join("、") + " 都是“最小的”却互不可比，没有唯一的最小上界。</span>"),
        "<b>结论</b>：" + (bad ? '<span class="bad">元素对 (' + Q.lab(bad[0]) + ", " + Q.lab(bad[1]) + ") 缺少确界 ⇒ 不是格。</span>" : "任意两元都有 ∨、∧（" + (m != null ? "本例 a∧b = " + Q.lab(m) : "") + "）⇒ <b>是格</b>。")
      ][st.step];
    },
    result: function (st) {
      var Q = st.c.P, a = st.p.a, b = st.p.b, j = Q.lub(a, b), m = Q.glb(a, b);
      return "<b>" + esc(st.c.name) + "</b>　a = " + esc(Q.lab(a)) + "，b = " + esc(Q.lab(b)) + "<br>a ∨ b：" + (j != null ? "<span class=\"mono\">" + esc(Q.lab(j)) + "</span>" : '<span class="bad">不存在</span>') +
        "　a ∧ b：" + (m != null ? "<span class=\"mono\">" + esc(Q.lab(m)) + "</span>" : '<span class="bad">不存在</span>') + "<br>是否为格：" + H.verdict(Q.isLattice(), "是格", "不是格");
    },
    knowledge: [
      "格（偏序定义）：偏序集 ⟨L,≤⟩ 中任意两元都有最小上界 a∨b 与最大下界 a∧b。",
      "D₁₂ 中 a∨b = lcm(a,b)，a∧b = gcd(a,b)；幂集格中 ∨ = ∪，∧ = ∩。",
      "全序集（链）一定是格：a∨b = max，a∧b = min。",
      "偏序集不一定是格：可能没有上界，或有多个互不可比的极小上界。"
    ],
    insight: {
      title: "🤝 总能找到共同目标与共同基础",
      text: "格的要求是：任意两个元素，既能找到“恰好够用”的共同上界，也能找到最大的共同下界。“蝴蝶”偏序集说明，并不是任何层级结构都有这样的性质——有了唯一的最小上界，协商才有明确的落点。",
      badges: ["求同存异", "统筹协调"]
    }
  };

  /* ---------- 拓展层 ---------- */
  var PERM = P.make({ els: ["", "r", "w", "x", "rw", "rx", "wx", "rwx"], leq: sub,
    labels: { "": "∅", r: "r", w: "w", x: "x", rw: "rw", rx: "rx", wx: "wx", rwx: "rwx" },
    pos: { "": [360, 370], r: [240, 275], w: [360, 275], x: [480, 275], rw: [240, 170], rx: [360, 170], wx: [480, 170], rwx: [360, 75] } });
  var TYPE = P.make({ els: ["Never", "Int", "Float", "String", "Number", "Any"],
    leq: function (x, y) {
      if (x === y || x === "Never" || y === "Any") return true;
      return (x === "Int" || x === "Float") && y === "Number";
    },
    pos: { Never: [360, 370], Int: [230, 270], Float: [360, 270], String: [510, 220], Number: [290, 170], Any: [360, 75] } });
  var SEC = P.make({ els: ["公开", "内部", "秘密", "机密"], leq: function (x, y) { var o = ["公开", "内部", "秘密", "机密"]; return o.indexOf(x) <= o.indexOf(y); },
    pos: { "公开": [360, 360], "内部": [360, 265], "秘密": [360, 170], "机密": [360, 75] } });
  var APP = {
    perm: { join: "合并两个角色的权限（∪）", meet: "两个角色共同拥有的权限（∩）", ex: "给同时属于两个角色的用户授权" },
    type: { join: "最小公共超类型：if-else 两个分支类型的“汇合”", meet: "最大公共子类型：同时满足两个类型约束的值", ex: "编译器类型推断" },
    sec: { join: "两份数据合并后的密级（取较高者）", meet: "两者都能公开到的最高级别（取较低者）", ex: "信息流安全：密级只能向上流动" }
  };
  var extend = {
    stepTitle: "四步用格建模",
    stepHint: "元素与序 → ∨ 的含义 → ∧ 的含义 → 对偶原理",
    mission: "格不只是抽象结构：文件权限按包含关系构成幂集格，编程语言的类型按“子类型”关系构成类型格，数据密级构成链。求 ∨、∧ 就是在回答“合并后是什么”“共同部分是什么”。",
    badge: "权限格 · 类型格 · 对偶",
    caseLabel: "选择应用模型",
    cases: [
      { label: "权限格 P({r,w,x})（读/写/执行）", P: PERM, a: "rw", b: "rx", key: "perm", name: "权限格" },
      { label: "类型格（子类型关系）", P: TYPE, a: "Int", b: "String", key: "type", name: "类型格" },
      { label: "安全等级链（公开 < 内部 < 秘密 < 机密）", P: SEC, a: "内部", b: "秘密", key: "sec", name: "安全等级链" }
    ],
    init: function (st) { st.p.a = st.c.a; st.p.b = st.c.b; },
    onPick: function (st, k, v) { st.p[k] = norm(st.c.P, v); },
    steps: [
      { t: "建模", s: "元素与偏序", tok: 0 },
      { t: "求 a ∨ b", s: "合并 / 汇合", tok: 1 },
      { t: "求 a ∧ b", s: "共同部分", tok: 2 },
      { t: "对偶原理", s: "≤ 反向，∨ ↔ ∧", tok: 3 }
    ],
    tokens: ["⟨L, ≤⟩", "a ∨ b", "a ∧ b", "L 的对偶 L^∂"],
    legend: [["cur", "所选 a、b"], ["ok", "运算结果"], ["key", "顶 1 / 底 0"], ["norm", "其余元素"]],
    controls: function (st) { return pickRow(st, "a", st.c.P, "元素 a", "on2") + pickRow(st, "b", st.c.P, "元素 b", "on2"); },
    title: function (st) { return st.c.label; },
    sub: function (st) {
      var A = APP[st.c.key];
      return ["先把应用对象画成 Hasse 图：" + (st.c.key === "perm" ? "权限集合越大越高。" : st.c.key === "type" ? "子类型在下、超类型在上（Never 是空类型，Any 是顶类型）。" : "密级越高越靠上。"),
        "a ∨ b：" + A.join + "。", "a ∧ b：" + A.meet + "。",
        "把 Hasse 图上下翻转得到对偶格：原来的 ∨ 变成 ∧；任何格的定理把 ≤/≥、∨/∧、0/1 互换后仍成立。"][st.step];
    },
    draw: function (st) {
      var Q = st.c.P, a = st.p.a, b = st.p.b, j = Q.lub(a, b), m = Q.glb(a, b), kinds = {};
      kinds[Q.top()] = "key"; kinds[Q.bottom()] = "key";
      if (st.step === 1) kinds[j] = "ok";
      if (st.step === 2) kinds[m] = "ok";
      kinds[a] = kinds[b] = "cur";
      if (st.step === 1 && (j === a || j === b)) kinds[j] = "ok";
      if (st.step === 2 && (m === a || m === b)) kinds[m] = "ok";
      var fs = st.c.key === "type" ? 10 : st.c.key === "sec" ? 12 : null;
      if (st.step < 3) {
        var s = P.hasse(Q, H, kinds, {}, { r: 28, fs: fs });
        var line = st.step === 0 ? "顶元 1 = " + Q.lab(Q.top()) + "，底元 0 = " + Q.lab(Q.bottom()) :
          st.step === 1 ? Q.lab(a) + " ∨ " + Q.lab(b) + " = " + Q.lab(j) : Q.lab(a) + " ∧ " + Q.lab(b) + " = " + Q.lab(m);
        s += H.text(360, 420, line, { size: 17, weight: 800, color: "#4e362d", mono: true });
        return H.svg(s, 720, 440);
      }
      // 对偶：左原图，右翻转图
      var k2 = {}; k2[a] = k2[b] = "cur"; k2[j] = "ok";
      var k3 = {}; k3[a] = k3[b] = "cur"; k3[j] = "ok";
      var left = P.hasse(Q, H, k2, {}, { r: 22, fs: fs, dx: -180 });
      var right = P.hasse(Q, H, k3, {}, { r: 22, fs: fs, dx: 180, flip: true, h: 440 });
      return H.svg(H.text(180, 30, "原格 L：" + Q.lab(a) + " ∨ " + Q.lab(b) + " = " + Q.lab(j), { size: 14, color: "#d63b1d", weight: 800 }) +
        H.text(540, 30, "对偶格 L^∂：同一元素变成 " + Q.lab(a) + " ∧ " + Q.lab(b), { size: 14, color: "#b8321a", weight: 800 }) +
        H.line(360, 50, 360, 400, "dim") + left + right, 720, 440) +
        '<div class="calc-card">对偶原理：若 “a ∨ (a ∧ b) = a” 对一切格成立，则把 ∨、∧ 互换得到的 “a ∧ (a ∨ b) = a” 也对一切格成立。</div>';
    },
    feedback: function (st) {
      var Q = st.c.P, a = st.p.a, b = st.p.b, A = APP[st.c.key];
      return [
        "<b>建模</b>：" + esc(st.c.name) + " 共 " + Q.els.length + " 个元素，" + (Q.isLattice() ? "任意两元都有确界，是格" : "不是格") + "。应用场景：" + A.ex + "。",
        "<b>a ∨ b</b> = " + esc(Q.lab(Q.lub(a, b))) + "：" + A.join + "。",
        "<b>a ∧ b</b> = " + esc(Q.lab(Q.glb(a, b))) + "：" + A.meet + "。",
        "<b>对偶</b>：翻转后顶底互换，原来的最小上界成为最大下界——所以格论定理总是成对出现，证明一条就得到另一条。"
      ][st.step];
    },
    result: function (st) {
      var Q = st.c.P, a = st.p.a, b = st.p.b;
      return "<b>" + esc(st.c.name) + "</b><br><span class=\"mono\">" + esc(Q.lab(a)) + " ∨ " + esc(Q.lab(b)) + " = " + esc(Q.lab(Q.lub(a, b))) + "</span><br><span class=\"mono\">" + esc(Q.lab(a)) + " ∧ " + esc(Q.lab(b)) + " = " + esc(Q.lab(Q.glb(a, b))) + "</span>";
    },
    knowledge: [
      "幂集格 ⟨P(S), ⊆⟩：∨ = ∪，∧ = ∩，顶 S，底 ∅；Linux 的 rwx 权限位正是 P({r,w,x})。",
      "类型格：a ∨ b 是最小公共超类型，类型推断中条件表达式的结果类型就取它。",
      "对偶原理：格的命题把 ≤ 与 ≥、∨ 与 ∧、0 与 1 互换，得到的对偶命题同样成立。",
      "链是最简单的格；安全等级链用于“不上读、不下写”的访问控制模型。"
    ],
    insight: {
      title: "🔐 用结构守住安全底线",
      text: "访问控制中，一份材料合并了“秘密”和“内部”两类信息，它的密级就应取两者的上确界“秘密”。把规则建成格，“合并后应受多高保护”就有了唯一、可计算的答案，安全管理由经验判断走向可验证的规则。",
      badges: ["底线思维", "规则意识", "工程思维"]
    }
  };

  CH11.mount({ basic: basic, extend: extend });
})();
