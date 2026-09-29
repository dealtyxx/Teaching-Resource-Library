/* =====================================================================
 * 5.6 命题演算推证 —— 三层统一交互引擎（推理规则步进器）
 * 基础层 / 进阶层 / 拓展层 共用本引擎，按 window.SYMBOLIZE_LEVEL 取层级。
 *
 * 交互：选择推证 → 逐行演证（上一步 / 下一步 / 自动播放 + 速度 / 重置）
 *   每行给出「公式 + 依据（规则名 + 引用行号）」，推证记录与推理图联动高亮，
 *   抵达结论即证毕。基础层与进阶层另用真值表验证推理有效：
 *   前提全真的赋值下结论必真 ⇔ (前提合取) → 结论 为重言式。
 *
 * 规则名称与教材一致：前提引入、结论引入、置换、假言推理(MP)、附加、化简、
 *   拒取式(MT)、假言三段论(HS)、析取三段论(DS)、构造性二难、合取引入；
 *   附加前提证明法（CP 规则）、归谬法（结论否定引入 → 导出矛盾）。
 *
 * 行数据：{ f 公式, rule 规则名, ab 英文缩写, refs 引用行(0 基), kind, note, range }
 *   kind: "prem" 前提引入 | "assume" 附加前提引入 / 结论否定引入 | "derive" 推出
 *   range: true 时依据写成「①–⑤」（CP 规则、归谬法引用整段子证明）
 * ===================================================================== */
(function (global) {
  "use strict";

  /* ---------- 命题公式求值器（用于有效性验证） ---------- */
  function parse(expr) {
    var i = 0, s = expr;
    function peek() { while (i < s.length && s[i] === " ") i++; return s[i]; }
    function next() { var c = peek(); i++; return c; }
    function pIff() { var l = pImp(); while (peek() === "↔") { next(); l = { op: "↔", l: l, r: pImp() }; } return l; }
    function pImp() { var l = pOr(); if (peek() === "→") { next(); return { op: "→", l: l, r: pImp() }; } return l; }
    function pOr() { var l = pAnd(); while (peek() === "∨") { next(); l = { op: "∨", l: l, r: pAnd() }; } return l; }
    function pAnd() { var l = pNot(); while (peek() === "∧") { next(); l = { op: "∧", l: l, r: pNot() }; } return l; }
    function pNot() { if (peek() === "¬") { next(); return { op: "¬", r: pNot() }; } return pAtom(); }
    function pAtom() { var c = peek(); if (c === "(") { next(); var e = pIff(); if (peek() === ")") next(); return e; } next(); return { v: c }; }
    return pIff();
  }
  function ev(n, env) {
    if (n.v !== undefined) return !!env[n.v];
    switch (n.op) {
      case "¬": return !ev(n.r, env);
      case "∧": return ev(n.l, env) && ev(n.r, env);
      case "∨": return ev(n.l, env) || ev(n.r, env);
      case "→": return !ev(n.l, env) || ev(n.r, env);
      case "↔": return ev(n.l, env) === ev(n.r, env);
    }
    return false;
  }
  function varsIn(list) {
    var set = {};
    list.forEach(function (f) { (f.match(/[A-Z]/g) || []).forEach(function (v) { set[v] = 1; }); });
    return Object.keys(set).sort();
  }
  function clauseToFormula(c) { return "(" + c.replace(/[{}]/g, "").split(",").map(function (s) { return s.trim(); }).join(" ∨ ") + ")"; }

  /* 有效性：枚举全部赋值，找前提全真的行，检查结论 */
  function checkValidity(premises, goal) {
    var vars = varsIn(premises.concat([goal]));
    var P = premises.map(parse), G = parse(goal), n = vars.length, rows = [];
    for (var m = 0; m < (1 << n); m++) {
      var env = {};
      for (var k = 0; k < n; k++) env[vars[k]] = !!(m & (1 << (n - 1 - k)));
      if (P.every(function (a) { return ev(a, env); })) {
        rows.push({ bits: vars.map(function (v) { return env[v] ? "1" : "0"; }).join(""), g: ev(G, env) });
      }
    }
    return { vars: vars, total: 1 << n, rows: rows, valid: rows.every(function (r) { return r.g; }) };
  }
  /* 子句集可满足性（拓展层归结） */
  function checkClauses(clauses) {
    var fs = clauses.map(clauseToFormula);
    var vars = varsIn(fs), A = fs.map(parse), n = vars.length, models = 0;
    for (var m = 0; m < (1 << n); m++) {
      var env = {};
      for (var k = 0; k < n; k++) env[vars[k]] = !!(m & (1 << (n - 1 - k)));
      if (A.every(function (a) { return ev(a, env); })) models++;
    }
    return { vars: vars, total: 1 << n, models: models };
  }

  function L(f, rule, ab, refs, kind, note, range) { return { f: f, rule: rule, ab: ab || "", refs: refs || [], kind: kind || "derive", note: note || "", range: !!range }; }
  function PR(f, note) { return L(f, "前提引入", "", [], "prem", note || "引入前提。"); }

  var LEVELS = {
    basic: {
      introStatus: "选择一个推证，点「下一步」逐行推演：每一行要么是引入的前提，要么由推理规则从前面的行推出，并注明引用了哪几行。",
      legendTitle: "推理规则速查",
      legend: [
        ["前提引入", "在证明任何一步都可引入前提"],
        ["结论引入", "已推出的公式可被后续引用"],
        ["MP", "假言推理：A→B, A ⇒ B"],
        ["MT", "拒取式：A→B, ¬B ⇒ ¬A"],
        ["化简", "A∧B ⇒ A（或 B）"],
        ["合取引入", "A, B ⇒ A∧B"],
        ["附加", "A ⇒ A∨B"]
      ],
      cases: [
        { label: "P→Q, P ⊢ Q（假言推理）", goal: "Q", goalDesc: "由蕴含式与它的前件，推出后件。",
          contrast: "对照（无效推理）：P→Q, Q ⊬ P（肯定后件）。反例 P=0, Q=1：两个前提都真，结论 P 却为假。",
          lines: [
            PR("P → Q", "引入前提：若 P 则 Q。"),
            PR("P", "引入前提：P 成立。"),
            L("Q", "假言推理", "MP", [0, 1], "derive", "由 P→Q 与 P，得 Q。")
          ] },
        { label: "P→Q, ¬Q ⊢ ¬P（拒取式）", goal: "¬P", goalDesc: "否定后件，推出否定前件。",
          contrast: "对照（无效推理）：P→Q, ¬P ⊬ ¬Q（否定前件）。反例 P=0, Q=1：两个前提都真，结论 ¬Q 却为假。",
          lines: [
            PR("P → Q"),
            PR("¬Q", "引入前提：Q 不成立。"),
            L("¬P", "拒取式", "MT", [0, 1], "derive", "后件 Q 为假，则前件 P 必为假（否则由 P→Q 得 Q，矛盾），得 ¬P。")
          ] },
        { label: "P→Q, Q→R, P ⊢ R（两次假言推理）", goal: "R", goalDesc: "沿蕴含链一步步推进；已推出的 Q 可作为结论引入再使用。",
          contrast: "有效推理只保证『前提真则结论真』；若前提本身为假，结论可能为假——有效 ≠ 结论真实。",
          lines: [
            PR("P → Q"),
            PR("P"),
            L("Q", "假言推理", "MP", [0, 1], "derive", "由 P→Q 与 P，得 Q。"),
            PR("Q → R", "需要时再引入前提 Q→R。"),
            L("R", "假言推理", "MP", [3, 2], "derive", "由 Q→R 与第 ③ 行推出的 Q（结论引入），得 R。")
          ] },
        { label: "P∧Q, P→R ⊢ R∧Q（化简·合取引入）", goal: "R ∧ Q", goalDesc: "先把合取式拆开，再把需要的部分合起来。",
          contrast: "化简与合取引入互为『拆』与『合』：A∧B 为真当且仅当 A、B 都为真。",
          lines: [
            PR("P ∧ Q"),
            L("P", "化简", "", [0], "derive", "由 P∧Q 取出 P。"),
            L("Q", "化简", "", [0], "derive", "由 P∧Q 取出 Q。"),
            PR("P → R"),
            L("R", "假言推理", "MP", [3, 1], "derive", "由 P→R 与 P，得 R。"),
            L("R ∧ Q", "合取引入", "", [4, 2], "derive", "R 与 Q 都已推出，合取得 R∧Q。")
          ] },
        { label: "P, P→Q ⊢ Q∨R（附加）", goal: "Q ∨ R", goalDesc: "推出 Q 后，析取上任意公式仍然成立。",
          contrast: "附加规则 A ⇒ A∨B：A 真时 A∨B 必真，而与 B 的真假无关。",
          lines: [
            PR("P"),
            PR("P → Q"),
            L("Q", "假言推理", "MP", [1, 0], "derive", "由 P→Q 与 P，得 Q。"),
            L("Q ∨ R", "附加", "", [2], "derive", "由 Q 附加 R，得 Q∨R。")
          ] }
      ]
    },
    advanced: {
      introStatus: "选择一个推证，逐行演证：综合运用三段论、构造性二难、置换规则，以及附加前提证明法（CP 规则）与归谬法。",
      legendTitle: "推理规则速查",
      legend: [
        ["DS", "析取三段论：A∨B, ¬A ⇒ B"],
        ["HS", "假言三段论：A→B, B→C ⇒ A→C"],
        ["二难", "构造性二难：A→B, C→D, A∨C ⇒ B∨D"],
        ["置换", "用等值式替换子公式"],
        ["CP", "证 A→B：把 A 作附加前提，推出 B"],
        ["归谬", "引入结论的否定，推出矛盾式"],
        ["MP / MT", "假言推理 / 拒取式"]
      ],
      cases: [
        { label: "P∨Q, ¬P, Q→R ⊢ R∨S（析取三段论）", goal: "R ∨ S", goalDesc: "先排除 P 得 Q，再推出 R，最后附加 S。",
          lines: [
            PR("P ∨ Q"),
            PR("¬P"),
            L("Q", "析取三段论", "DS", [0, 1], "derive", "P∨Q 为真而 P 为假，只能 Q 为真。"),
            PR("Q → R"),
            L("R", "假言推理", "MP", [3, 2], "derive", "由 Q→R 与 Q，得 R。"),
            L("R ∨ S", "附加", "", [4], "derive", "由 R 附加 S，得 R∨S。")
          ] },
        { label: "¬P∨Q, Q→R, R→S, P ⊢ S（置换·假言三段论）", goal: "S", goalDesc: "先用蕴含等值式置换，再用假言三段论压缩蕴含链。",
          lines: [
            PR("¬P ∨ Q"),
            L("P → Q", "置换", "", [0], "derive", "蕴含等值式 ¬P∨Q ⇔ P→Q。"),
            PR("Q → R"),
            L("P → R", "假言三段论", "HS", [1, 2], "derive", "由 P→Q 与 Q→R，得 P→R。"),
            PR("R → S"),
            L("P → S", "假言三段论", "HS", [3, 4], "derive", "由 P→R 与 R→S，得 P→S。"),
            PR("P"),
            L("S", "假言推理", "MP", [5, 6], "derive", "由 P→S 与 P，得 S。")
          ] },
        { label: "P→R, Q→S, P∨Q ⊢ R∨S（构造性二难）", goal: "R ∨ S", goalDesc: "两条路各通向一个结果，而两条路至少走一条。",
          lines: [
            PR("P → R", "引入前提：若走 P 这条路，则得 R。"),
            PR("Q → S", "引入前提：若走 Q 这条路，则得 S。"),
            PR("P ∨ Q", "引入前提：P、Q 至少一个成立。"),
            L("R ∨ S", "构造性二难", "", [0, 1, 2], "derive", "P 真则 R 真，Q 真则 S 真，而 P、Q 至少一真，故 R∨S。")
          ] },
        { label: "P→(Q→R), Q ⊢ P→R（附加前提证明法）", goal: "P → R", goalDesc: "结论是蕴含式：把前件 P 作附加前提，只需推出 R。",
          lines: [
            L("P", "附加前提引入", "", [], "assume", "CP 规则：要证 P→R，把前件 P 作为附加前提引入。"),
            PR("P → (Q → R)"),
            L("Q → R", "假言推理", "MP", [1, 0], "derive", "由 P→(Q→R) 与 P，得 Q→R。"),
            PR("Q"),
            L("R", "假言推理", "MP", [2, 3], "derive", "由 Q→R 与 Q，得 R。"),
            L("P → R", "CP 规则", "", [0, 4], "derive", "在附加前提 P 下推出了 R，由附加前提证明法得 P→R。", true)
          ] },
        { label: "奇偶判定：P→¬Q, R→Q ⊢ R→¬P（CP·拒取式）", goal: "R → ¬P", goalDesc: "P：a 是奇数；Q：a 能被 2 整除；R：a 是偶数。证明：若 a 是偶数，则 a 不是奇数。",
          lines: [
            L("R", "附加前提引入", "", [], "assume", "要证 R→¬P，把 R（a 是偶数）作为附加前提。"),
            PR("R → Q", "引入前提：若 a 是偶数，则 a 能被 2 整除。"),
            L("Q", "假言推理", "MP", [1, 0], "derive", "由 R→Q 与 R，得 Q。"),
            PR("P → ¬Q", "引入前提：若 a 是奇数，则 a 不能被 2 整除。"),
            L("¬P", "拒取式", "MT", [3, 2], "derive", "P→¬Q 的后件 ¬Q 为假（因 Q 真），故前件 P 为假。"),
            L("R → ¬P", "CP 规则", "", [0, 4], "derive", "在附加前提 R 下推出 ¬P，得 R→¬P：偶数不是奇数。", true)
          ] },
        { label: "P→Q, P→¬Q ⊢ ¬P（归谬法）", goal: "¬P", goalDesc: "引入结论的否定，推出矛盾式，从而结论成立。",
          lines: [
            L("¬¬P", "结论否定引入", "", [], "assume", "归谬法：把结论 ¬P 的否定 ¬¬P 作为附加前提引入。"),
            L("P", "置换", "", [0], "derive", "双重否定律 ¬¬P ⇔ P。"),
            PR("P → Q"),
            L("Q", "假言推理", "MP", [2, 1], "derive", "由 P→Q 与 P，得 Q。"),
            PR("P → ¬Q"),
            L("¬Q", "假言推理", "MP", [4, 1], "derive", "由 P→¬Q 与 P，得 ¬Q。"),
            Object.assign(L("Q ∧ ¬Q", "合取引入", "", [3, 5], "derive", "Q 与 ¬Q 合取得矛盾式 Q∧¬Q。"), { contra: true }),
            L("¬P", "归谬法", "", [0, 6], "derive", "引入结论的否定后推出了矛盾式，故推理正确，结论 ¬P 成立。", true)
          ] }
      ]
    },
    extend: {
      introStatus: "选择一个机械推理任务：归结反演把前提与结论的否定化为子句集，反复归结直到得出空子句 □；Hoare 逻辑用公理与推论规则验证程序。",
      legendTitle: "机械推理速查",
      legend: [
        ["子句", "文字的析取，记作集合 {…}"],
        ["归结", "C₁∨l, C₂∨¬l ⇒ C₁∨C₂"],
        ["□", "空子句：不可满足"],
        ["反演", "S∪{¬G} 归结出 □ ⇒ S ⊨ G"],
        ["{P}S{Q}", "Hoare 三元组（部分正确性）"],
        ["赋值公理", "{Q[E/x]} x:=E {Q}"]
      ],
      cases: [
        { label: "归结：P→Q, P ⊢ Q", goal: "Q", goalDesc: "把前提与结论的否定化成子句集，归结出 □。",
          clauses: true,
          lines: [
            L("{¬P, Q}", "前提子句", "", [], "prem", "前提 P→Q ⇔ ¬P∨Q，化为子句 {¬P, Q}。"),
            L("{P}", "前提子句", "", [], "prem", "前提 P 化为单元子句 {P}。"),
            L("{¬Q}", "结论否定子句", "", [], "assume", "归结反演：加入结论的否定 ¬Q。"),
            L("{Q}", "归结", "", [0, 1], "derive", "{¬P, Q} 与 {P} 关于互补文字 ¬P / P 归结，得 {Q}。"),
            L("□", "归结", "", [2, 3], "derive", "{¬Q} 与 {Q} 归结得空子句 □：子句集不可满足，故 Q 成立。")
          ] },
        { label: "归结：P∨Q, ¬P, Q→R ⊢ R", goal: "R", goalDesc: "多条子句依次归结，导出空子句 □。",
          clauses: true,
          lines: [
            L("{P, Q}", "前提子句", "", [], "prem", "前提 P∨Q。"),
            L("{¬P}", "前提子句", "", [], "prem", "前提 ¬P。"),
            L("{¬Q, R}", "前提子句", "", [], "prem", "前提 Q→R ⇔ ¬Q∨R。"),
            L("{¬R}", "结论否定子句", "", [], "assume", "加入结论的否定 ¬R。"),
            L("{Q}", "归结", "", [0, 1], "derive", "{P, Q} 与 {¬P} 关于 P 归结，得 {Q}。"),
            L("{R}", "归结", "", [2, 4], "derive", "{¬Q, R} 与 {Q} 关于 Q 归结，得 {R}。"),
            L("□", "归结", "", [3, 5], "derive", "{¬R} 与 {R} 归结得空子句 □，证毕。")
          ] },
        { label: "归结：P→Q, Q→R ⊢ P→R", goal: "P → R", goalDesc: "结论的否定 ¬(P→R) ⇔ P∧¬R，化为两个单元子句。",
          clauses: true,
          lines: [
            L("{¬P, Q}", "前提子句", "", [], "prem", "前提 P→Q ⇔ ¬P∨Q。"),
            L("{¬Q, R}", "前提子句", "", [], "prem", "前提 Q→R ⇔ ¬Q∨R。"),
            L("{P}", "结论否定子句", "", [], "assume", "¬(P→R) ⇔ P∧¬R，拆成子句 {P}……"),
            L("{¬R}", "结论否定子句", "", [], "assume", "……与子句 {¬R}。"),
            L("{Q}", "归结", "", [0, 2], "derive", "{¬P, Q} 与 {P} 关于 P 归结，得 {Q}。"),
            L("{R}", "归结", "", [1, 4], "derive", "{¬Q, R} 与 {Q} 关于 Q 归结，得 {R}。"),
            L("□", "归结", "", [3, 5], "derive", "{¬R} 与 {R} 归结得空子句 □，故 P→R 成立。")
          ] },
        { label: "Hoare 逻辑：{x≥0} y:=x+1 {y≥1}", goal: "{x ≥ 0} y := x+1 {y ≥ 1}", goalDesc: "用赋值公理与推论规则，证明程序满足规约。",
          given: "程序 y := x+1；前置条件 x ≥ 0；后置条件 y ≥ 1",
          lines: [
            L("{x+1 ≥ 1} y := x+1 {y ≥ 1}", "赋值公理", "", [], "prem", "赋值公理 {Q[E/y]} y:=E {Q}：把后置条件 y≥1 中的 y 换成 x+1，得前置条件 x+1≥1。"),
            L("x ≥ 0 → x+1 ≥ 1", "验证条件", "", [], "prem", "由算术事实成立，可交给自动判定程序检查。"),
            L("{x ≥ 0} y := x+1 {y ≥ 1}", "推论规则", "", [1, 0], "derive", "推论规则（加强前置条件）：P→P′ 且 {P′}S{Q}，则 {P}S{Q}。程序满足规约。")
          ] }
      ]
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { LEVELS: LEVELS, parse: parse, ev: ev, checkValidity: checkValidity, checkClauses: checkClauses, clauseToFormula: clauseToFormula };
  }

  /* ====================== 以下仅浏览器运行 ====================== */
  if (typeof document === "undefined") return;

  var SVGNS = "http://www.w3.org/2000/svg";
  var CIRC = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮";
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function svgEl(type, attrs) { var el = document.createElementNS(SVGNS, type); if (attrs) for (var k in attrs) el.setAttribute(k, attrs[k]); return el; }
  function byId(id) { return document.getElementById(id); }
  function cn(i) { return CIRC[i] || "(" + (i + 1) + ")"; }
  function refStr(l) {
    if (!l.refs.length) return "";
    if (l.range) return cn(l.refs[0]) + "–" + cn(l.refs[l.refs.length - 1]);
    return l.refs.slice().sort(function (a, b) { return a - b; }).map(cn).join("");
  }
  function ruleText(l) { return l.rule + (l.ab ? "（" + l.ab + "）" : ""); }

  /* 节点配色：前提 = 纸色，附加前提/结论否定 = 金，推出 = 暖白红边，结论 = 绿，矛盾/□ = 红 */
  var NODE = {
    prem: ["#fffaf0", "#8a6a55"], assume: ["#fff1c7", "#c58a1f"], derive: ["#fff", "#d63b1d"],
    final: ["#e3f3ea", "#2f7d57"], contra: ["#fbe4e0", "#c0392b"]
  };

  function run() {
    var levelKey = global.SYMBOLIZE_LEVEL || "basic";
    var cfg = LEVELS[levelKey] || LEVELS.basic;
    var controlsEl = byId("controls"), goalEl = byId("ipGoal"), tableEl = byId("ipTable"), evalEl = byId("ipEval"), graphEl = byId("ipGraph");
    if (!controlsEl || !tableEl) return;

    var pr = null, c = null;
    var p = 0, manualFocus = null, autoTimer = null, speed = 1100, lastW = 0;
    var rowEls = [], nodeEls = [], arcEls = [];
    var statusEl, progBar, progNum, prevBtn, nextBtn, autoBtn;

    function renderControls() {
      var opts = cfg.cases.map(function (cc, i) { return '<option value="' + i + '">' + esc(cc.label) + "</option>"; }).join("");
      controlsEl.innerHTML =
        '<div class="control-group"><label for="ipSelect"><span>选择推证</span><small>前提 ⊢ 结论</small></label>' +
          '<select id="ipSelect">' + opts + "</select></div>" +
        '<div class="control-group"><label><span>逐步演证</span><small>点一步 · 看反馈</small></label>' +
          '<div class="sym-step-row">' +
            '<button type="button" class="sym-step-btn" id="ipPrev">◀ 上一步</button>' +
            '<button type="button" class="sym-step-btn sym-primary" id="ipNext">下一步 ▶</button>' +
            '<button type="button" class="sym-step-btn" id="ipAuto">⏵ 自动播放</button>' +
            '<button type="button" class="sym-step-btn sym-reset" id="ipReset">↺ 重置</button>' +
          "</div>" +
          '<div class="sym-speed"><label for="ipSpeed">播放速度</label><select id="ipSpeed">' +
            '<option value="1700">慢速</option><option value="1100" selected>标准</option><option value="600">快速</option>' +
          "</select></div></div>" +
        '<div class="control-group"><label><span>进度</span></label>' +
          '<div class="sym-progress-wrap"><div class="sym-progress"><i id="ipProgBar"></i></div>' +
          '<span class="sym-progress-num" id="ipProgNum">0 / 0</span></div></div>' +
        '<div class="control-group"><label><span>当前反馈</span></label>' +
          '<div class="sym-status" id="ipStatus" aria-live="polite"></div></div>';
      statusEl = byId("ipStatus"); progBar = byId("ipProgBar"); progNum = byId("ipProgNum");
      prevBtn = byId("ipPrev"); nextBtn = byId("ipNext"); autoBtn = byId("ipAuto");
      byId("ipSelect").addEventListener("change", function (e) { loadCase(+e.target.value); });
      byId("ipSpeed").addEventListener("change", function (e) { speed = +e.target.value || 1100; if (autoTimer) { stopAuto(); toggleAuto(); } });
      prevBtn.addEventListener("click", function () { stopAuto(); step(-1); });
      nextBtn.addEventListener("click", function () { stopAuto(); step(1); });
      byId("ipReset").addEventListener("click", function () { stopAuto(); p = 0; manualFocus = null; render(); });
      autoBtn.addEventListener("click", toggleAuto);
    }

    function renderLegend() {
      var box = byId("legendPanel"); if (!box) return;
      box.innerHTML = '<div class="legend-title">' + esc(cfg.legendTitle) + '</div><div class="legend-grid">' +
        cfg.legend.map(function (it) { return '<div class="legend-item"><span class="sym">' + esc(it[0]) + '</span><span class="desc">' + esc(it[1]) + "</span></div>"; }).join("") + "</div>";
    }

    function loadCase(idx) {
      stopAuto();
      c = cfg.cases[idx];
      var lines = c.lines.map(function (ln, i) {
        return {
          i: i, f: ln.f, rule: ln.rule, ab: ln.ab, refs: ln.refs, kind: ln.kind, note: ln.note, range: ln.range,
          isFinal: i === c.lines.length - 1,
          isContra: /□/.test(ln.f) || !!ln.contra
        };
      });
      pr = { lines: lines, premises: lines.filter(function (l) { return l.kind === "prem"; }) };
      p = 0; manualFocus = null;
      renderGoal(); renderTable(); renderGraph();
      render();
    }

    function renderGoal() {
      var given = c.given ? esc(c.given) : pr.premises.map(function (l) { return "<code>" + esc(l.f) + "</code>"; }).join("，");
      var html = '<div class="g-premises"><b>' + (c.given ? "已知：" : "前提：") + "</b>" + given + "</div>" +
        '<div class="g-goal"><span class="g-turn">' + (c.given ? "待证" : "⊢") + "</span>" + esc(c.goal) + "</div>" +
        '<div class="g-desc">' + esc(c.goalDesc) + "</div>";
      if (!c.given && !c.clauses) {
        var v = checkValidity(pr.premises.map(function (l) { return l.f; }), c.goal);
        html += '<div class="g-valid"><div class="gv-head">有效性 · 真值表验证</div>' +
          "<div>变元 " + v.vars.join(", ") + " 共 " + v.total + " 组赋值，前提全真的只有 " + v.rows.length + " 组：" +
          v.rows.map(function (r) { return '<span class="gv-chip ' + (r.g ? "t" : "f") + '">' + r.bits + " → 结论 " + (r.g ? "1" : "0") + "</span>"; }).join("") + "</div>" +
          '<div class="gv-verdict ' + (v.valid ? "ok" : "bad") + '">' + (v.valid ? "✓ 前提全真时结论必真，(前提合取) → 结论 是重言式，推理有效。" : "✗ 存在前提全真而结论为假的赋值，推理无效。") + "</div>" +
          (c.contrast ? '<div class="gv-contrast">' + esc(c.contrast) + "</div>" : "") + "</div>";
      }
      if (c.clauses) {
        var cl = pr.lines.filter(function (l) { return l.kind !== "derive"; }).map(function (l) { return l.f; });
        var s = checkClauses(cl);
        html += '<div class="g-valid"><div class="gv-head">子句集 S∪{¬G} · 可满足性</div>' +
          "<div>子句集 " + cl.map(function (x) { return "<code>" + esc(x) + "</code>"; }).join(" ") + " 在全部 " + s.total + " 组赋值下有 " + s.models + " 个模型。</div>" +
          '<div class="gv-verdict ' + (s.models === 0 ? "ok" : "bad") + '">' + (s.models === 0 ? "✓ 不可满足，这正是归结能推出空子句 □ 的原因（归结对不可满足子句集是反驳完备的）。" : "✗ 子句集可满足，推不出 □。") + "</div></div>";
      }
      if (c.given) {
        html += '<div class="g-valid"><div class="gv-head">说明</div><div>Hoare 三元组 {P} S {Q} 表示：若执行前 P 成立且 S 执行终止，则执行后 Q 成立（部分正确性）。每一步都是可机械检查的规则实例。</div></div>';
      }
      goalEl.innerHTML = html;
    }

    function renderTable() {
      var body = pr.lines.map(function (l, i) {
        var reason = '<span class="r-rule">' + esc(l.rule) + "</span>" + (l.ab ? ' <span class="r-ab">' + esc(l.ab) + "</span>" : "") +
          (l.refs.length ? ' <span class="r-refs">' + refStr(l) + "</span>" : "");
        return '<tr class="ip-row k-' + l.kind + (l.isFinal ? " is-final" : "") + (l.isContra ? " is-contra" : "") + '" data-row="' + i + '">' +
          '<td class="c-no">' + cn(i) + '</td><td class="c-f">' + esc(l.f) + '</td><td class="c-r">' + reason + "</td></tr>";
      }).join("");
      tableEl.innerHTML = '<table class="ip-table"><thead><tr><th>行</th><th>公式</th><th>依据（规则 · 引用行）</th></tr></thead><tbody>' + body + "</tbody></table>";
      rowEls = Array.prototype.slice.call(tableEl.querySelectorAll("tr.ip-row"));
      rowEls.forEach(function (tr, i) { tr.addEventListener("click", function () { clickRow(i); }); });
    }

    function renderGraph() {
      graphEl.innerHTML = "";
      var W = Math.max(320, Math.min(820, (graphEl.clientWidth || 760) - 14));
      lastW = W;
      var n = pr.lines.length, pad = 10, rowH = 46, nodeH = 34;
      var arcRoom = Math.min(150, Math.max(70, W * 0.2));
      var nodeW = W - pad * 2 - arcRoom;
      var x0 = pad;
      var H = pad * 2 + n * rowH - (rowH - nodeH);
      var small = W < 480;
      var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img", "aria-label": "推理依赖图" });
      function yOf(i) { return pad + i * rowH + nodeH / 2; }
      arcEls = [];
      pr.lines.forEach(function (l, i) {
        l.refs.forEach(function (r) {
          var x = x0 + nodeW, y1 = yOf(r), y2 = yOf(i);
          var bulge = 18 + Math.min(arcRoom - 22, (i - r) * 14);
          var path = svgEl("path", { d: "M " + x + " " + y1 + " C " + (x + bulge) + " " + y1 + " " + (x + bulge) + " " + y2 + " " + (x + 4) + " " + y2, fill: "none" });
          path.setAttribute("class", "ip-arc");
          svg.appendChild(path);
          arcEls.push({ el: path, to: i, from: r });
        });
      });
      nodeEls = pr.lines.map(function (l, i) {
        var y = pad + i * rowH;
        var col = l.isContra ? NODE.contra : l.isFinal ? NODE.final : NODE[l.kind];
        var ng = svgEl("g"); ng.setAttribute("class", "ip-node"); ng.dataset.row = i;
        ng.appendChild(svgEl("rect", { x: x0, y: y, width: nodeW, height: nodeH, rx: 8, fill: col[0], stroke: col[1], "stroke-width": 1.6 }));
        var num = svgEl("text", { x: x0 + 15, y: y + nodeH / 2, "text-anchor": "middle", "dominant-baseline": "central", fill: "#6b4a38", "font-size": 13, "font-weight": "800" }); num.textContent = cn(i);
        var tf = svgEl("text", { x: x0 + 32, y: y + nodeH / 2, "dominant-baseline": "central", fill: "#2c1810", "font-size": small ? 12 : 13.5, "font-weight": "700", "font-family": "JetBrains Mono, Consolas, monospace" }); tf.textContent = l.f;
        var tr = svgEl("text", { x: x0 + nodeW - 9, y: y + nodeH / 2, "text-anchor": "end", "dominant-baseline": "central", fill: col[1], "font-size": small ? 11 : 12, "font-weight": "800" });
        tr.textContent = small ? (l.ab || l.rule) : ruleText(l);
        ng.appendChild(num); ng.appendChild(tf); ng.appendChild(tr);
        ng.addEventListener("click", function () { clickRow(i); });
        svg.appendChild(ng);
        return { g: ng };
      });
      graphEl.appendChild(svg);
    }

    function total() { return pr.lines.length; }
    function step(dir) { manualFocus = null; p = Math.max(0, Math.min(total(), p + dir)); render(); }
    function clickRow(i) {
      stopAuto();
      if (p < total()) { p = i + 1; manualFocus = null; }
      else { manualFocus = (manualFocus === i ? null : i); }
      render();
    }
    function toggleAuto() {
      if (autoTimer) { stopAuto(); return; }
      if (p >= total()) { p = 0; manualFocus = null; render(); }
      autoBtn.classList.add("sym-playing"); autoBtn.textContent = "⏸ 暂停";
      autoTimer = setInterval(function () {
        if (p >= total()) { stopAuto(); return; }
        manualFocus = null; p += 1; render();
        if (p >= total()) stopAuto();
      }, speed);
    }
    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
      if (autoBtn) { autoBtn.classList.remove("sym-playing"); autoBtn.textContent = "⏵ 自动播放"; }
    }

    function render() {
      var n = pr.lines.length, done = p >= n;
      var focus = manualFocus != null ? manualFocus : (p >= 1 ? p - 1 : null);
      var cited = {};
      if (focus != null) pr.lines[focus].refs.forEach(function (r) { cited[r] = true; });
      for (var k = 0; k < n; k++) {
        var rev = k < p, cur = k === focus, ct = !!cited[k] && rev && !cur;
        [rowEls[k], nodeEls[k] && nodeEls[k].g].forEach(function (el) {
          if (!el) return;
          el.classList.toggle("sym-pending", !rev); el.classList.toggle("sym-cur", cur); el.classList.toggle("is-cited", ct);
        });
      }
      arcEls.forEach(function (a) {
        a.el.classList.toggle("is-active", focus != null && a.to === focus);
        a.el.classList.toggle("is-hidden", a.to >= p);
      });
      evalEl.innerHTML = evalHTML(focus, done);
      progNum.textContent = p + " / " + n;
      progBar.style.width = (n ? p / n * 100 : 0) + "%";
      prevBtn.disabled = p <= 0;
      nextBtn.disabled = p >= n;
      statusEl.innerHTML = statusHTML(focus, done);
    }

    function evalHTML(focus, done) {
      if (focus == null) return '<div class="ev-idle">点「下一步」逐行推演。前提行直接引入；其余各行由推理规则从已得到的行推出，并写明引用行号。</div>';
      var l = pr.lines[focus];
      var html = "<div>第 <b>" + cn(focus) + "</b> 行：<span class=\"ev-f\">" + esc(l.f) + "</span></div>" +
        '<div class="ev-why">依据 <span class="ev-rule">' + esc(ruleText(l)) + "</span>" +
        (l.refs.length ? "，引用 <span class=\"ev-ref\">" + refStr(l) + "</span>" : "") + "：" + esc(l.note) + "</div>";
      if (done && l.isFinal) html += '<div class="ev-done">✅ 得到 ' + esc(c.goal) + "，证毕。</div>";
      return html;
    }
    function statusHTML(focus, done) {
      if (p === 0) return cfg.introStatus + "<br><b>目标：</b>" + esc(c.goal) + " —— " + esc(c.goalDesc);
      if (done && manualFocus == null) return "✅ <b>证毕</b>：" + (c.clauses ? "归结出空子句 □，故 " + esc(c.goal) + " 成立" : "已推出 " + esc(c.goal)) + "。可点任意行回看它引用了哪些行。";
      var l = pr.lines[focus];
      return "第 <b>" + cn(focus) + "</b> 行：<b>" + esc(l.f) + "</b>（" + esc(l.rule) + (l.refs.length ? " " + refStr(l) : "") + "）。";
    }

    renderControls();
    renderLegend();
    loadCase(0);
    var rt = null;
    global.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var w = Math.max(320, Math.min(820, (graphEl.clientWidth || 760) - 14));
        if (Math.abs(w - lastW) > 8) { renderGraph(); render(); }
      }, 150);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})(typeof window !== "undefined" ? window : globalThis);
