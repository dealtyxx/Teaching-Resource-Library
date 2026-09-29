/* 10.5 陪集和拉格朗日定理 —— 三层模块（由 ../group-lab/group-lab.js 渲染）
 *   基础层：陪集划分（逐个取代表元，aH 等大、互不相交、覆盖 G）
 *   进阶层：拉格朗日定理（S₃ 左右陪集、阶整除 |G| 的推论、逆命题反例 A₄）
 *   拓展层：陪集译码与商群（重复码标准阵、汉明码 (7,4) 校验子译码、Z₁₂/⟨4⟩ 陪集加法）
 */
(function () {
  "use strict";
  var GL = window.GroupLab, U = GL.U, G = GL.G, D = GL.D, P = GL.P;

  /* ---------------- 基础层 ---------------- */
  function partition(S, H, right) {
    var n = S.n, cs = S.cosets(H, right), m = cs.reps.length;
    var steps = cs.reps.map(function (a, i) {
      var nm = S.cosetName(a, H, right);
      return { t: nm + " = " + S.set(cs.list[i]), d: "取还没被覆盖的最小元素 " + U.m(S.lab(a)) + " 作代表，" + (S.additive ? "把它加到 H 的每个元素上" : right ? "用 H 的每个元素左乘它" : "用它左乘 H 的每个元素") + "：" + U.m(nm + " = " + S.set(cs.list[i])) + "，恰有 " + H.length + " 个元素。" };
    });
    steps.push({ t: "划分完成：" + m + " 块 × " + H.length + " = " + n, d: "这 " + m + " 个陪集两两不交、并起来是整个 G：" + U.m(n + " = " + m + " × " + H.length) + "。" });
    return {
      titles: { struct: [(right ? "右" : "左") + "陪集表", "H = " + S.set(H)], viz: [S.name + " 的陪集划分", "同色 = 同一陪集"] },
      intro: "陪集 aH = {a∘h | h ∈ H} 是把子群 H 整体「平移」到 a。点「下一步」逐块染色。",
      steps: steps,
      struct: function (k) {
        return D.sets(cs.reps.map(function (a, i) {
          return { name: S.cosetName(a, H, right), body: k >= i ? S.set(cs.list[i]) : "…", cls: k >= i ? "c" + (i % 6) + (i === k ? " cur" : "") : "dim", note: i === 0 ? "= H 本身" : "" };
        })) + (k >= m ? D.note("指数 " + U.m("[G : H] = " + m) + "，每块大小 " + H.length + "。") : "");
      },
      viz: function (k) {
        var cls = U.range(n).map(function (x) { var c = cs.cls[x]; return c <= k ? "c" + (c % 6) : ""; });
        if (k >= 0 && k < m) cs.list[k].forEach(function (x) { cls[x] = "c" + (k % 6) + " ring"; });
        return D.ring({ labels: U.range(n).map(S.lab), cls: cls, arrows: [], center: ["H = " + S.set(H).replace(/, /g, ","), k >= m ? m + " 个陪集" : "染色中"] });
      },
      verdict: { kind: "ok", chip: "[G:H] = " + m, reason: "H 的 " + m + " 个" + (right ? "右" : "左") + "陪集把 " + S.name + " 分成大小相同、互不相交的 " + m + " 块，所以 " + U.m("|G| = [G:H]·|H|") + "，即 " + U.m(n + " = " + m + " × " + H.length) + "。",
        insight: "「不重不漏、大小相同」是陪集的两个关键性质：a ∈ aH 保证不漏；aH 与 bH 要么相同要么不交保证不重；h ↦ ah 是双射保证大小相同。" }
    };
  }
  var basic = {
    legend: [["aH", "左陪集 {ah | h∈H}"], ["a + H", "加法群中的陪集"], ["[G:H]", "指数：陪集个数"], ['<i class="dot c0"></i>', "每种颜色 = 一个陪集"], ["H", "陪集之一（代表元 e）"]],
    caseLabel: "选择群与子群",
    cases: [
      { label: "Z₁₂ 中的子群 H = ⟨d⟩", params: [{ id: "d", label: "生成元 d", type: "select", value: 4, options: [[2, "H = ⟨2⟩（6 个元素）"], [3, "H = ⟨3⟩（4 个元素）"], [4, "H = ⟨4⟩（3 个元素）"], [6, "H = ⟨6⟩（2 个元素）"]] }],
        build: function (p) { var S = G.Zadd(12); return partition(S, S.powers(p.d).sort(function (a, b) { return a - b; })); } },
      { label: "S₃ 中的子群 H = {e,(12)}", build: function () { return partition(G.S3(), [0, 1]); } },
      { label: "U(15) 中的子群 H = {1, 4}", build: function () { var S = G.U(15); return partition(S, [S.indexOf(1), S.indexOf(4)]); } }
    ]
  };

  /* ---------------- 进阶层 ---------------- */
  function leftRight(hk) {
    var S = G.S3(), H = hk === "a3" ? [0, 4, 5] : [0, 1], n = 6;
    var steps = U.range(n).map(function (g) {
      var l = S.leftCoset(g, H), r = S.rightCoset(g, H), same = l.join() === r.join();
      return { t: "g = " + S.lab(g) + "：gH 与 Hg", d: U.m(S.lab(g) + "H = " + S.set(l)) + "，" + U.m("H" + S.lab(g) + " = " + S.set(r)) + "，" + (same ? U.ok("相同") : U.bad("不同")) + "。", same: same };
    });
    var L = S.cosets(H), R = S.cosets(H, true), allSame = steps.every(function (s) { return s.same; });
    steps.push({ t: "拉格朗日定理", d: "左、右陪集各有 " + L.reps.length + " 个" + (allSame ? "且完全相同" : "，划分方式不同但个数相同") + "：" + U.m("|G| = [G:H]·|H| ⇒ 6 = " + L.reps.length + " × " + H.length) + "，所以 " + U.m("|H| 整除 |G|") + "。" });
    return {
      titles: { struct: ["左陪集 vs 右陪集", "H = " + S.set(H)], viz: ["S₃ 的左陪集划分", "同色 = 同一左陪集"] },
      intro: "在非交换群中 gH 与 Hg 可能不同；但无论左右，陪集个数都是 |G|/|H|。",
      steps: steps,
      struct: function (k) {
        var rows = U.range(n).map(function (g) {
          return [U.m(S.lab(g)), k >= g ? U.m(S.set(S.leftCoset(g, H))) : "…", k >= g ? U.m(S.set(S.rightCoset(g, H))) : "…", k >= g ? (steps[g].same ? "=" : "≠") : ""];
        });
        return D.table(["g", "gH", "Hg", ""], rows, { compact: true, rowCls: function (r) { return r === k ? "cur" : ""; }, cls: function (r, c) { return c === 3 && k >= r ? (steps[r].same ? "ok" : "bad") : ""; } });
      },
      viz: function (k) {
        var g = Math.max(0, Math.min(k, n - 1));
        var cls = U.range(n).map(function (x) { return "c" + (L.cls[x] % 6); }), arrows = [];
        if (k >= 0 && k < n) {
          var r = S.rightCoset(g, H);
          r.forEach(function (x) { if (S.leftCoset(g, H).indexOf(x) < 0) arrows.push({ a: g, b: x, cls: "bad", bend: 14 }); });
          cls[g] += " ring";
        }
        return D.ring({ labels: U.range(n).map(S.lab), cls: cls, arrows: arrows, center: ["左陪集", k >= 0 && k < n ? "虚线 = Hg 独有" : L.reps.length + " 块"] });
      },
      verdict: { kind: "ok", chip: "|H| = " + H.length + " 整除 6", reason: allSame ? "H = " + U.m(S.set(H)) + " 的左右陪集完全一致（它是正规子群，见 10.6）。" : "H = " + U.m(S.set(H)) + " 的左、右陪集不同，但都把 S₃ 分成 " + L.reps.length + " 块。",
        insight: "拉格朗日定理只用到「陪集等大且不交」，与群是否交换无关。它给子群的阶加了一道硬约束：6 阶群不可能有 4 阶或 5 阶子群。" }
    };
  }

  function corollary(key) {
    var S = key === "d4" ? G.D(4) : key === "u15" ? G.U(15) : G.Zadd(7), n = S.n;
    var steps = U.range(n).map(function (a) {
      var o = S.order(a);
      return { t: "ord(" + S.lab(a) + ") = " + o, d: U.m("|⟨" + S.lab(a) + "⟩| = ord(" + S.lab(a) + ") = " + o) + "，" + U.m(n + " ÷ " + o + " = " + n / o) + " ✓（⟨a⟩ 是子群，由拉格朗日定理其阶整除 |G|）。" };
    });
    var prime = U.divisors(n).length === 2;
    steps.push({ t: prime ? "素数阶 ⇒ 循环" : "推论：aⁿ = e", d: prime ? "|G| = " + n + " 是素数，非单位元的阶只能是 " + n + "，所以每个非单位元都是生成元，G 是循环群。" : "由 ord(a) | |G| 得 " + U.m("a^|G| = e") + "；在 U(n) 中这就是欧拉定理 " + U.m("a^φ(n) ≡ 1 (mod n)") + "。" });
    return {
      titles: { struct: ["元素的阶", S.name + "，|G| = " + n], viz: ["当前元素生成的子群", "金 = ⟨a⟩"] },
      intro: "拉格朗日定理的推论：有限群中每个元素的阶都整除群的阶。",
      steps: steps,
      struct: function (k) {
        return D.table(["a"].concat(U.range(n).map(S.lab)), [["ord(a)"].concat(U.range(n).map(function (a) { return k >= a ? S.order(a) : "…"; }))], { compact: true,
          cls: function (r, c) { return c - 1 === k ? "hl" : ""; } }) + D.note("|G| = " + n + " 的因子：" + U.m(U.set(U.divisors(n))));
      },
      viz: function (k) {
        var a = Math.max(0, Math.min(k, n - 1)), pw = S.powers(a), arrows = [];
        for (var i = 1; i <= pw.length && pw.length > 1; i++) arrows.push({ a: pw[i - 1], b: pw[i % pw.length], cls: "on" });
        var cls = U.range(n).map(function (x) { return pw.indexOf(x) >= 0 ? "on" : ""; });
        cls[a] = "cur";
        return D.ring({ labels: U.range(n).map(S.lab), cls: cls, arrows: arrows, center: ["⟨" + S.lab(a) + "⟩", "阶 " + pw.length] });
      },
      verdict: { kind: "ok", chip: "ord(a) | " + n, reason: S.name + " 中元素的阶为 " + U.m(U.set(U.range(n).map(function (a) { return S.order(a); }).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).sort(function (x, y) { return x - y; }))) + "，全部整除 " + n + "。",
        insight: "费马小定理 aᵖ⁻¹ ≡ 1 (mod p) 就是拉格朗日定理用在 Z_p* 上的特例——群论把数论里的零散结论统一了起来。" }
    };
  }

  function a4Converse() {
    var S = G.An(4), subs = S.subgroups(), byOrd = {};
    subs.forEach(function (H) { (byOrd[H.length] = byOrd[H.length] || []).push(H); });
    var ords = Object.keys(byOrd).map(Number).sort(function (a, b) { return a - b; });
    var steps = ords.map(function (o) {
      return { t: o + " 阶子群：" + byOrd[o].length + " 个", d: byOrd[o].map(function (H) { return U.m(S.set(H)); }).join("；") + "。" };
    });
    var threes = S.elems.map(function (_, i) { return i; }).filter(function (i) { return S.order(i) === 3; });
    steps.push({ t: "6 阶子群？不存在", d: "12 的因子有 1,2,3,4,6,12，但 A₄ 没有 6 阶子群。原因：若 |H| = 6，则 [A₄:H] = 2，H 必为正规子群，于是对每个 3 阶元 g 有 g²H = (gH)² = H，得 g² ∈ H，从而 g = (g²)² ∈ H；A₄ 的 " + threes.length + " 个 3 阶元都在 H 中，与 |H| = 6 矛盾。" });
    return {
      titles: { struct: ["A₄ 的全部子群", "|A₄| = 12"], viz: ["A₄ 元素的阶", "金 = 3 阶元"] },
      intro: "拉格朗日定理的逆命题「d 整除 |G| ⇒ 存在 d 阶子群」成立吗？在 A₄ 中逐一检查。",
      steps: steps,
      struct: function (k) {
        return D.table(["阶", "个数", "例"], [1, 2, 3, 4, 6, 12].map(function (o, i) {
          var list = byOrd[o] || [];
          var shown = o === 6 ? k >= ords.length : ords.indexOf(o) >= 0 && ords.indexOf(o) <= k;
          return [o, shown ? list.length : "?", shown ? (list.length ? U.m(S.set(list[0])) : U.bad("无")) : ""];
        }), { compact: true, rowCls: function (r) { var o = [1, 2, 3, 4, 6, 12][r]; return (o === 6 && k >= ords.length) ? "cur" : ords[k] === o ? "cur" : ""; } });
      },
      viz: function () {
        var cls = S.elems.map(function (_, i) { var o = S.order(i); return o === 1 ? "ok" : o === 3 ? "on" : "c3"; });
        return D.ring({ labels: S.elems.map(function (_, i) { return S.lab(i); }), cls: cls, arrows: [], center: ["A₄", "1 + 3 + 8"] });
      },
      verdict: { kind: "bad", chip: "逆命题不成立", reason: "6 整除 12，但 A₄ 没有 6 阶子群。拉格朗日定理只是必要条件。",
        insight: "对循环群逆命题成立（每个因子恰一个子群）；对一般有限群，素数幂阶子群一定存在（西罗定理），但其他因子不保证。" }
    };
  }

  var advanced = {
    legend: [["gH / Hg", "左陪集 / 右陪集"], ["[G:H]", "= |G| / |H|"], ["ord(a)", "整除 |G|"], ["A₄", "S₄ 中的 12 个偶置换"], ['<i class="dot on"></i>', "当前子群 ⟨a⟩ / 3 阶元"]],
    caseLabel: "选择主题",
    cases: [
      { label: "S₃ 的左陪集与右陪集", params: [{ id: "h", label: "子群 H", type: "select", value: "t", options: [["t", "H = {e, (12)}"], ["a3", "H = A₃ = {e, (123), (132)}"]] }],
        build: function (p) { return leftRight(p.h); } },
      { label: "推论：元素的阶整除 |G|", params: [{ id: "g", label: "群", type: "select", value: "d4", options: [["d4", "D₄（8 阶）"], ["u15", "U(15)（8 阶）"], ["z7", "Z₇（素数阶）"]] }],
        build: function (p) { return corollary(p.g); } },
      { label: "逆命题反例：A₄ 无 6 阶子群", build: a4Converse }
    ]
  };

  /* ---------------- 拓展层 ---------------- */
  function repetition(r) {
    var S = G.Z2k(3), C = [0, 7], cs = [[0, 7], [4, 3], [2, 5], [1, 6]];   // 陪集首：000,100,010,001
    var ci = cs.findIndex(function (c) { return c.indexOf(r) >= 0; }), lead = cs[ci][0], dec = r ^ lead;
    var steps = [
      { t: "码 C = {000, 111} 是子群", d: "重复码把 0 编成 000、1 编成 111；C 在 ⊕ 下封闭，是 Z₂³ 的 2 阶子群。" },
      { t: "标准阵：C 的 4 个陪集", d: cs.map(function (c) { return U.m(U.bits(c[0], 3) + " + C = {" + U.bits(c[0], 3) + ", " + U.bits(c[1], 3) + "}"); }).join("；") + "。每行第一列取重量最小的元素作陪集首。" },
      { t: "收到 r = " + U.bits(r, 3), d: "r 落在第 " + (ci + 1) + " 行，陪集首 " + U.m(U.bits(lead, 3)) + "——它就是最可能的错误图样。" },
      { t: "译码 c = r ⊕ 陪集首", d: U.m(U.bits(r, 3) + " ⊕ " + U.bits(lead, 3) + " = " + U.bits(dec, 3)) + "，原信息为 " + U.m(dec ? "1" : "0") + "（多数表决）。" }
    ];
    return {
      titles: { struct: ["标准阵", "行 = 陪集，首列 = 陪集首"], viz: ["Z₂³ 的陪集划分", "同色 = 同一陪集"] },
      intro: "译码的本质：收到的 r 属于码 C 的哪个陪集？减去该陪集的「首」就得到最可能的码字。",
      steps: steps,
      struct: function (k) {
        var rows = cs.map(function (c, i) { return [U.m(U.bits(c[0], 3)), U.m(U.bits(c[1], 3))]; });
        return k < 1 ? D.sets([{ name: "C", body: "{000, 111}", cls: "ok" }]) :
          D.table(["陪集首（错误图样）", "另一元素"], rows, { rowCls: function (i) { return k >= 2 && i === ci ? "cur" : ""; }, cls: function (i, c) { return k >= 2 && cs[i][c] === r ? "hl" : ""; } }) +
          (k >= 3 ? D.sets([{ name: "收到 r", body: U.bits(r, 3), cls: "cur" }, { name: "陪集首", body: U.bits(lead, 3), cls: lead ? "bad" : "ok" }, { name: "译码 c", body: U.bits(dec, 3), cls: "ok" }]) : "");
      },
      viz: function (k) {
        var cls = U.range(8).map(function (x) { var i = cs.findIndex(function (c) { return c.indexOf(x) >= 0; }); return k >= 1 ? "c" + i : C.indexOf(x) >= 0 ? "ok" : ""; });
        if (k >= 2) cls[r] += " ring";
        return D.ring({ labels: U.range(8).map(function (v) { return U.bits(v, 3); }), cls: cls, arrows: k >= 3 && r !== dec ? [{ a: r, b: dec, cls: "ok" }] : [], center: ["Z₂³ / C", "4 个陪集"] });
      },
      verdict: { kind: "ok", chip: "译码为 " + U.bits(dec, 3), reason: "r = " + U.m(U.bits(r, 3)) + " 所在陪集的首为 " + U.m(U.bits(lead, 3)) + "，译码 " + U.m(U.bits(dec, 3)) + "。重复码能纠正任意 1 位错误。",
        insight: "8 个串被 C 的 4 个陪集「不重不漏」地瓜分——拉格朗日定理保证 8 = 4 × 2，这就是标准阵的行数。" }
    };
  }

  function hamming(msg, pos) {
    var d = U.bits(msg, 4).split("").map(Number);          // d1 d2 d3 d4
    var c = [0, 0, 0, 0, 0, 0, 0];                          // 位置 1..7 → 下标 0..6
    c[2] = d[0]; c[4] = d[1]; c[5] = d[2]; c[6] = d[3];
    c[0] = c[2] ^ c[4] ^ c[6]; c[1] = c[2] ^ c[5] ^ c[6]; c[3] = c[4] ^ c[5] ^ c[6];
    var r = c.slice(); if (pos) r[pos - 1] ^= 1;
    var s1 = r[0] ^ r[2] ^ r[4] ^ r[6], s2 = r[1] ^ r[2] ^ r[5] ^ r[6], s4 = r[3] ^ r[4] ^ r[5] ^ r[6], syn = s4 * 4 + s2 * 2 + s1;
    var fixed = r.slice(); if (syn) fixed[syn - 1] ^= 1;
    var str = function (a) { return a.join(""); };
    var pcls = function (a, extra) { return a.map(function (_, i) { return [0, 1, 3].indexOf(i) >= 0 ? "p" : ""; }).map(function (x, i) { return extra && extra(i) || x; }); };
    var steps = [
      { t: "编码：4 位信息 → 7 位码字", d: "信息 " + U.m(str(d)) + " 放在第 3,5,6,7 位；校验位 " + U.m("p₁ = d₁⊕d₂⊕d₄ = " + c[0] + "，p₂ = d₁⊕d₃⊕d₄ = " + c[1] + "，p₄ = d₂⊕d₃⊕d₄ = " + c[3]) + "，码字 " + U.m(str(c)) + "。" },
      { t: "码字集合是 16 元子群", d: "全体码字在 ⊕ 下封闭，构成 Z₂⁷（128 元）的 16 阶子群 C；于是 C 有 " + U.m("128 / 16 = 8") + " 个陪集。" },
      { t: pos ? "第 " + pos + " 位出错" : "无错传输", d: "收到 " + U.m("r = " + str(r)) + (pos ? "（第 " + pos + " 位被翻转）" : "") + "。" },
      { t: "校验子 s = " + s4 + s2 + s1, d: U.m("s₁ = r₁⊕r₃⊕r₅⊕r₇ = " + s1 + "，s₂ = r₂⊕r₃⊕r₆⊕r₇ = " + s2 + "，s₄ = r₄⊕r₅⊕r₆⊕r₇ = " + s4) + "；读作二进制 " + U.m("s₄s₂s₁ = " + s4 + s2 + s1 + " = " + syn) + "。" },
      { t: syn ? "陪集首 = 第 " + syn + " 位的单位错误" : "s = 0：r 就在 C 中", d: syn ? "8 个校验子 ↔ 8 个陪集 ↔ 陪集首 {0, e₁,…,e₇}；s = " + syn + " 指向陪集首 e" + U.sub(syn) + "，翻转第 " + syn + " 位得 " + U.m(str(fixed)) + "。" : "无需纠正。" },
      { t: "取出信息位", d: "第 3,5,6,7 位：" + U.m([fixed[2], fixed[4], fixed[5], fixed[6]].join("")) + (str(fixed) === str(c) ? " ✓ 与原信息一致。" : "。") }
    ];
    return {
      titles: { struct: ["校验子 ↔ 陪集首", "汉明码 (7,4)"], viz: ["码字的传输与纠正", "金 = 校验位 · 红 = 出错位"] },
      intro: "汉明码 (7,4) 是 Z₂⁷ 的 16 元子群；它的 8 个陪集恰好对应「无错」与「第 1…7 位出错」。",
      steps: steps,
      struct: function (k) {
        var rows = U.range(8).map(function (s) { return [U.m(U.bits(s, 3)), s === 0 ? "0000000（无错）" : U.m(U.range(7).map(function (i) { return i === s - 1 ? 1 : 0; }).join("")), s === 0 ? "—" : "第 " + s + " 位"]; });
        return D.table(["s₄s₂s₁", "陪集首", "含义"], rows, { compact: true, rowCls: function (i) { return k >= 3 && i === syn ? "cur" : k >= 1 ? "" : "dim"; } });
      },
      viz: function (k) {
        var h = '<div class="gl-sets">';
        h += '<div class="gl-set ok"><b>码字 c</b>' + D.bits(str(c), pcls(c)) + "<em>位 1–7</em></div>";
        if (k >= 2) h += '<div class="gl-set cur"><b>收到 r</b>' + D.bits(str(r), pcls(r, function (i) { return pos && i === pos - 1 ? "err" : ""; })) + "</div>";
        if (k >= 3) h += '<div class="gl-set"><b>校验子</b>' + D.bits("" + s4 + s2 + s1) + "<em>= " + syn + "</em></div>";
        if (k >= 4) h += '<div class="gl-set ok"><b>纠正后</b>' + D.bits(str(fixed), pcls(fixed, function (i) { return syn && i === syn - 1 ? "fix" : ""; })) + "</div>";
        return h + "</div>";
      },
      verdict: { kind: "ok", chip: pos ? "纠正第 " + syn + " 位" : "无错", reason: "校验子是陪集的标签：s = " + U.m("" + s4 + s2 + s1) + " 对应陪集首 " + (syn ? "e" + U.sub(syn) : "0") + "，译码结果 " + U.m(str(fixed)) + "。",
        insight: "北斗 B1I 导航电文使用的 BCH(15,11) 码与汉明码同属「纠 1 位错」的一类码，原理相同：用校验子定位陪集首（见 10.7 案例）。" }
    };
  }

  function quotientPrelude() {
    var S = G.Zadd(12), H = [0, 4, 8], cs = S.cosets(H), m = 4;
    var steps = [
      { t: "四个陪集", d: cs.list.map(function (c, i) { return U.m(i + " + H = " + U.set(c)); }).join("；") + "。" },
      { t: "陪集相加：(1+H) + (2+H)", d: "用代表 1、2 算得 3 + H；换代表 5 ∈ 1+H、10 ∈ 2+H：" + U.m("5 + 10 = 15 ≡ 3") + "，仍落在 3 + H。结果与代表的选取无关。" },
      { t: "陪集加法表", d: "按 " + U.m("(a+H) + (b+H) = (a+b) + H") + " 填表：它是一个 4 阶循环群，即商群 " + U.m("Z₁₂/⟨4⟩ ≅ Z₄") + "。" },
      { t: "为什么良定义", d: "若 a′ = a + h₁，b′ = b + h₂，则 a′ + b′ = (a+b) + (h₁+h₂)，而 h₁ + h₂ ∈ H——交换群的子群都「正规」，下一节 10.6 将看到非交换群中这一步可能失败。" }
    ];
    return {
      titles: { struct: ["陪集加法表", "Z₁₂ / ⟨4⟩"], viz: ["Z₁₂ 的陪集", "同色 = 同一陪集"] },
      intro: "把每个陪集看成一个「新元素」，能否在陪集之间定义运算？这就是商群的前奏。",
      steps: steps,
      struct: function (k) {
        if (k < 2) return D.sets(cs.list.map(function (c, i) { return { name: i + " + H", body: U.set(c), cls: "c" + i }; }));
        var rows = U.range(m).map(function (a) { return ["<b>" + a + "+H</b>"].concat(U.range(m).map(function (b) { return ((a + b) % m) + "+H"; })); });
        return D.table(["+"].concat(U.range(m).map(function (b) { return b + "+H"; })), rows, { compact: true, cls: function (r, c) { return c > 0 ? "" : ""; } });
      },
      viz: function (k) {
        var cls = U.range(12).map(function (x) { return "c" + (x % 4); }), arrows = [];
        if (k === 1) { cls[1] += " ring"; cls[2] += " ring"; cls[5] += " ring"; cls[10] += " ring"; arrows.push({ a: 5, b: 3, cls: "cur", bend: 20 }, { a: 10, b: 3, cls: "cur", bend: -20 }); }
        return D.ring({ labels: U.range(12).map(String), cls: cls, arrows: arrows, center: ["Z₁₂/⟨4⟩", "≅ Z₄"] });
      },
      verdict: { kind: "ok", chip: "Z₁₂/⟨4⟩ ≅ Z₄", reason: "4 个陪集在「代表相加」下构成 4 阶循环群，且运算与代表选取无关。",
        insight: "陪集译码时把 r 归入陪集，本质上就是在商群 Z₂ⁿ/C 中计算——这正是 10.6 商群的工程原型。" }
    };
  }

  var extend = {
    legend: [["C", "码字构成的子群"], ["r + C", "收到串所在陪集"], ["陪集首", "陪集中重量最小者 = 错误图样"], ["s", "校验子 = 陪集标签"], ["a + H", "商群的元素"]],
    caseLabel: "选择场景",
    cases: [
      { label: "重复码的标准阵译码", params: [{ id: "r", label: "收到的串 r", type: "select", value: 5, options: U.range(8).map(function (v) { return [v, U.bits(v, 3)]; }) }],
        build: function (p) { return repetition(p.r); } },
      { label: "汉明码 (7,4) 校验子译码", params: [
          { id: "m", label: "信息 d₁d₂d₃d₄", type: "select", value: 11, options: [[11, "1011"], [6, "0110"], [15, "1111"], [0, "0000"]] },
          { id: "e", label: "出错位置", type: "range", min: 0, max: 7, value: 5, fmt: function (v) { return v ? "第 " + v + " 位" : "无错"; } }],
        build: function (p) { return hamming(p.m, p.e); } },
      { label: "商群前奏：Z₁₂ / ⟨4⟩", build: quotientPrelude }
    ]
  };

  GL.define({ basic: basic, advanced: advanced, extend: extend });
})();
