/* 10.2 群的阶和子群 —— 三层模块（由 ../group-lab/group-lab.js 渲染）
 *   基础层：群的阶与元素的阶（逐次求幂直到回到单位元，观察 ord(a) | |G|）
 *   进阶层：子群与循环群（子群判定定理 ab⁻¹∈H、⟨a⟩ 生成与循环群判定、Z₁₂ 的全部子群）
 *   拓展层：循环群与密码（本原根判定、离散对数穷举、快速幂——正向易、反向难）
 */
(function () {
  "use strict";
  var GL = window.GroupLab, U = GL.U, G = GL.G, D = GL.D;

  function powLab(S, a, k) {
    if (k === 0) return "e";
    if (k === 1) return S.lab(a);
    return S.additive ? k + "·" + S.lab(a) : S.lab(a) + U.sup(k);
  }

  /* ---------------- 基础层 ---------------- */
  function orderOf(S, a) {
    var pw = S.powers(a), m = pw.length, n = S.n;
    var steps = [];
    for (var k = 1; k <= m; k++) {
      var v = S.pow(a, k);
      steps.push({ t: powLab(S, a, k) + " = " + S.lab(v), d: k === 1 ? "从 " + U.m(powLab(S, a, 1) + " = " + S.lab(a)) + " 出发，" + (S.additive ? "每次再加一个 " + S.lab(a) : "每次再乘一个 " + S.lab(a)) + "。"
        : U.m(powLab(S, a, k) + " = " + powLab(S, a, k - 1) + " " + S.sym + " " + S.lab(a) + " = " + S.lab(S.pow(a, k - 1)) + " " + S.sym + " " + S.lab(a) + " = " + S.lab(v)) + (v === S.e ? "，" + U.ok("回到单位元") + "！" : "。") });
    }
    var dist = {};
    U.range(n).forEach(function (i) { var o = S.order(i); (dist[o] = dist[o] || []).push(S.lab(i)); });
    steps.push({ t: "ord(" + S.lab(a) + ") = " + m + "，整除 |G| = " + n, d: "使 " + U.m(S.additive ? "k·a = 0" : "aᵏ = e") + " 的最小正整数 k 就是元素的阶。" + U.m(n + " ÷ " + m + " = " + n / m) + "，阶整除群的阶（拉格朗日定理的推论，见 10.5）。" });
    steps.push({ t: "全体元素的阶", d: Object.keys(dist).sort(function (x, y) { return x - y; }).map(function (o) { return "阶 " + o + "：" + U.m(U.set(dist[o])); }).join("；") + "。" });
    return {
      titles: { struct: ["幂序列表 · " + S.name, "|G| = " + n], viz: ["幂的轨道", "红=当前幂 · 金=已到达"] },
      intro: "反复用 a 运算自身，直到回到单位元 e——走过的步数就是 a 的阶。",
      steps: steps,
      struct: function (k) {
        var rows = [];
        for (var i = 0; i <= Math.min(k + 1, m); i++) rows.push([U.m(powLab(S, a, i)), U.m(S.lab(S.pow(a, i))), i > 0 && S.pow(a, i) === S.e ? U.ok("= e") : ""]);
        var tbl = D.table(["幂", "值", ""], rows, { rowCls: function (r) { return r === k + 1 && k < m ? "cur" : ""; }, compact: true });
        if (k >= m + 1) {
          tbl += D.table(["元素"].concat(U.range(n).map(S.lab)), [["阶"].concat(U.range(n).map(function (i) { return S.order(i); }))], {
            compact: true, cls: function (r, c) { return c > 0 && U.range(n)[c - 1] === a ? "hl" : ""; } });
        }
        return tbl;
      },
      viz: function (k) {
        var cls = U.range(n).map(function () { return ""; }), arrows = [];
        cls[S.e] = "ok";
        for (var i = 1; i <= Math.min(k + 1, m); i++) {
          var from = S.pow(a, i - 1), to = S.pow(a, i);
          arrows.push({ a: from, b: to, cls: i === k + 1 ? "cur" : "on" });
          if (to !== S.e) cls[to] = i === k + 1 ? "cur" : "on";
        }
        if (k >= m + 1) U.range(n).forEach(function (i) { if (pw.indexOf(i) < 0) cls[i] = "dim"; });
        return D.ring({ labels: U.range(n).map(S.lab), cls: cls, arrows: arrows, center: ["a = " + S.lab(a), k >= m - 1 ? "ord(a) = " + m : "…"] });
      },
      verdict: { kind: "info", chip: "ord(" + S.lab(a) + ") = " + m, reason: "在 " + S.name + " 中 " + U.m(powLab(S, a, m) + " = e") + " 且更小的正幂都不是 e，所以 " + U.m("ord(" + S.lab(a) + ") = " + m) + "，它整除 " + U.m("|G| = " + n) + "。",
        insight: S.additive ? "在 Zₙ 中有公式 ord(a) = n / gcd(a, n)：本例 " + n + " / gcd(" + a + ", " + n + ") = " + n / U.gcd(a, n) + "。" : "有限群中每个元素的阶都有限，且都是 |G| 的因子；阶为 2 的元素满足 a = a⁻¹。" }
    };
  }

  var S3 = [[0, "e"], [1, "(12)"], [2, "(13)"], [3, "(23)"], [4, "(123)"], [5, "(132)"]];
  var basic = {
    legend: [["|G|", "群的阶：元素个数"], ["ord(a)", "使 aᵏ=e 的最小正整数 k"], ["k·a", "加法群中 a 的 k 倍"], ['<i class="dot cur"></i>', "当前的幂"], ['<i class="dot ok"></i>', "单位元 e"]],
    caseLabel: "选择群",
    cases: [
      { label: "⟨Z₁₂, +⟩ 钟面加法", params: [{ id: "a", label: "元素 a", type: "range", min: 0, max: 11, value: 8 }], build: function (p) { return orderOf(G.Zadd(12), p.a); } },
      { label: "U(7) = {1,…,6}，×₇", params: [{ id: "a", label: "元素 a", type: "select", value: 2, options: [[0, "1"], [1, "2"], [2, "3"], [3, "4"], [4, "5"], [5, "6"]] }], build: function (p) { return orderOf(G.U(7), p.a); } },
      { label: "S₃ 三元置换群", params: [{ id: "a", label: "元素 a", type: "select", value: 4, options: S3 }], build: function (p) { return orderOf(G.S3(), p.a); } }
    ]
  };

  /* ---------------- 进阶层 ---------------- */
  var CANDS = {
    z1: { g: "z12", H: [0, 4, 8] }, z2: { g: "z12", H: [0, 3, 6, 9] }, z3: { g: "z12", H: [0, 2, 5] }, z4: { g: "z12", H: [1, 5, 9] },
    s1: { g: "s3", H: [0, 1] }, s2: { g: "s3", H: [0, 1, 2] }, s3: { g: "s3", H: [0, 4, 5] }
  };
  function subgroupTest(key) {
    var c = CANDS[key], S = c.g === "z12" ? G.Zadd(12) : G.S3(), H = c.H, n = S.n;
    var inH = function (x) { return H.indexOf(x) >= 0; };
    var q = function (a, b) { return S.T[a][S.inv(b)]; };
    var steps = [{ t: "H 非空", d: "H = " + U.m(S.set(H)) + " 含 " + H.length + " 个元素，非空。" + (inH(S.e) ? "" : "（注意：H 不含单位元 " + S.lab(S.e) + "，已预示它不是子群。）") }];
    var firstBad = null;
    H.forEach(function (a) {
      var bad = H.filter(function (b) { return !inH(q(a, b)); });
      if (bad.length && !firstBad) firstBad = [a, bad[0]];
      steps.push({ t: "a = " + S.lab(a) + "：检验 a" + (S.additive ? "−b" : "∘b⁻¹"),
        d: H.map(function (b) { var v = q(a, b); return U.m(S.lab(a) + (S.additive ? " − " + S.lab(b) : "∘" + S.lab(b) + "⁻¹") + " = " + S.lab(v)) + (inH(v) ? " ✓" : " " + U.bad("∉ H")); }).join("，") + "。" });
    });
    var ok = !firstBad;
    return {
      titles: { struct: ["判定表 a" + (S.additive ? "−b" : "∘b⁻¹"), "行 a ∈ H，列 b ∈ H"], viz: ["H 在 " + S.name + " 中的位置", "金 = H 的元素"] },
      intro: "子群判定定理：H 是 G 的非空子集，且对任意 a, b ∈ H 都有 " + (S.additive ? "a − b" : "a∘b⁻¹") + " ∈ H ⇔ H ≤ G。",
      steps: steps,
      struct: function (k) {
        var rows = H.map(function (a, ri) {
          return [U.m(S.lab(a))].concat(H.map(function (b) {
            if (ri + 1 > k) return "…";
            var v = q(a, b); return U.m(S.lab(v));
          }));
        });
        return D.table([S.additive ? "a − b" : "a∘b⁻¹"].concat(H.map(S.lab)), rows, {
          rowCls: function (r) { return r + 1 === k ? "cur" : ""; },
          cls: function (r, ci) { if (ci === 0 || r + 1 > k) return ""; return inH(q(H[r], H[ci - 1])) ? "ok" : "bad"; } }) +
          D.note("候选子集 H = " + U.m(S.set(H)) + "，|H| = " + H.length + "，|G| = " + n + "。");
      },
      viz: function (k) {
        var cls = U.range(n).map(function (i) { return inH(i) ? "on" : ""; }), arrows = [];
        if (k >= 1) {
          var a = H[k - 1];
          H.forEach(function (b) { var v = q(a, b); if (!inH(v)) cls[v] = "bad"; });
          cls[a] = "cur";
        }
        return D.ring({ labels: U.range(n).map(S.lab), cls: cls, arrows: arrows, center: ["H ⊆ " + S.name, k >= steps.length - 1 ? (ok ? "H ≤ G" : "H 不是子群") : "检验中"] });
      },
      verdict: ok ? { kind: "ok", chip: "H 是子群", reason: "对 H 中任意两元素都有 " + U.m(S.additive ? "a − b ∈ H" : "a∘b⁻¹ ∈ H") + "，由判定定理 H = " + U.m(S.set(H)) + " 是 " + S.name + " 的子群。|H| = " + H.length + " 整除 |G| = " + n + "。",
          insight: "一个条件同时保证了：单位元 a∘a⁻¹ ∈ H、逆元 e∘b⁻¹ ∈ H、封闭 a∘(b⁻¹)⁻¹ ∈ H。" }
        : { kind: "bad", chip: "不是子群", reason: "反例：" + U.m(S.lab(firstBad[0]) + (S.additive ? " − " + S.lab(firstBad[1]) : "∘" + S.lab(firstBad[1]) + "⁻¹") + " = " + S.lab(q(firstBad[0], firstBad[1]))) + " ∉ H。",
          insight: H.length && S.n % H.length !== 0 ? "|H| = " + H.length + " 不整除 |G| = " + n + "——由拉格朗日定理，它本来就不可能是子群。" : "元素个数整除 |G| 只是必要条件，不是充分条件。" }
    };
  }

  var GENG = { z12: function () { return G.Zadd(12); }, u8: function () { return G.U(8); }, u10: function () { return G.U(10); }, s3: function () { return G.S3(); } };
  function cyclicTest(key) {
    var S = GENG[key](), n = S.n;
    var subs = U.range(n).map(function (a) { return S.powers(a).slice().sort(function (x, y) { return x - y; }); });
    var gens = U.range(n).filter(function (a) { return subs[a].length === n; });
    var steps = U.range(n).map(function (a) {
      return { t: "⟨" + S.lab(a) + "⟩ = " + S.set(subs[a]), d: "从 e 出发反复" + (S.additive ? "加 " : "乘 ") + S.lab(a) + "：" + U.m(S.powers(a).map(S.lab).join(" → ") + " → e") + "，" + U.m("|⟨" + S.lab(a) + "⟩| = " + subs[a].length) + (subs[a].length === n ? "，" + U.ok("生成整个群") : "") + "。" };
    });
    steps.push({ t: gens.length ? "循环群：生成元 " + U.set(gens.map(S.lab)) : "不是循环群", d: gens.length ? "存在元素生成全群，" + S.name + " 是循环群，共 " + gens.length + " 个生成元。" : "每个 ⟨a⟩ 都比 G 小，" + S.name + " 不是循环群。" });
    return {
      titles: { struct: ["循环子群一览", S.name + "，|G| = " + n], viz: ["⟨a⟩ 的生成轨道", "红=当前 a · 金=⟨a⟩"] },
      intro: "⟨a⟩ = {aᵏ | k ∈ Z} 是包含 a 的最小子群；若某个 ⟨a⟩ = G，则 G 是循环群，a 是生成元。",
      steps: steps,
      struct: function (k) {
        var rows = U.range(n).map(function (a) { return [U.m(S.lab(a)), k >= a ? U.m(S.set(subs[a])) : "…", k >= a ? subs[a].length : "", k >= a ? (subs[a].length === n ? U.ok("生成元") : "") : ""]; });
        return D.table(["a", "⟨a⟩", "阶", ""], rows, { compact: true, rowCls: function (r) { return r === k ? "cur" : k === n && gens.indexOf(r) >= 0 ? "cur" : ""; } });
      },
      viz: function (k) {
        var a = k >= 0 && k < n ? k : (gens[0] != null ? gens[0] : 0);
        var pw = S.powers(a), cls = U.range(n).map(function (i) { return pw.indexOf(i) >= 0 ? "on" : "dim"; }), arrows = [];
        for (var i = 1; i <= pw.length; i++) arrows.push({ a: pw[i - 1], b: pw[i % pw.length], cls: "on" });
        cls[a] = "cur"; cls[S.e] = "ok";
        return D.ring({ labels: U.range(n).map(S.lab), cls: cls, arrows: arrows, center: ["⟨" + S.lab(a) + "⟩", "阶 " + pw.length] });
      },
      verdict: gens.length ? { kind: "ok", chip: "循环群", reason: S.name + " = ⟨" + S.lab(gens[0]) + "⟩，生成元为 " + U.m(U.set(gens.map(S.lab))) + "。循环群一定是交换群。",
          insight: S.additive ? "Zₙ 中 k 是生成元 ⇔ gcd(k, n) = 1，生成元个数为 φ(n) = " + U.phi(n) + "。" : "U(n) 是循环群当且仅当 n = 1, 2, 4, pᵏ 或 2pᵏ（p 为奇素数）。" }
        : { kind: "bad", chip: "非循环群", reason: S.name + " 中每个元素生成的子群都是真子群，没有生成元。" + (S.isAbelian() ? "它是交换群却不是循环群——交换 ⇏ 循环。" : "它甚至不是交换群。"),
          insight: key === "u8" ? "U(8) = {1,3,5,7} 中每个非单位元的平方都是 1，它就是克莱因四元群 K₄。" : "S₃ 的元素阶只有 1、2、3，没有 6 阶元。" }
    };
  }

  function allSubgroups(n) {
    var S = G.Zadd(n), ds = U.divisors(n);
    var steps = ds.map(function (d) {
      var g = (n / d) % n, H = S.powers(g).slice().sort(function (x, y) { return x - y; });
      return { t: "|H| = " + d + "：⟨" + g + "⟩ = " + U.set(H), d: "由 " + U.m(n + "/" + d + " = " + g) + " 生成，" + U.m("⟨" + g + "⟩ = " + U.set(H)) + "。Zₙ 中阶为 " + d + " 的子群只有这一个。", H: H, g: g };
    });
    steps.push({ t: "子群与因子一一对应", d: "Z" + U.sub(n) + " 有 " + ds.length + " 个因子 " + U.m(U.set(ds)) + "，恰有 " + ds.length + " 个子群；且 d₁ 阶子群包含于 d₂ 阶子群 ⇔ d₁ 整除 d₂。" });
    return {
      titles: { struct: ["因子 ↔ 子群", "Z" + U.sub(n)], viz: ["子群在钟面上的位置", "金 = 当前子群"] },
      intro: "循环群 Zₙ 的子群都是循环群，并且对 n 的每个正因子 d 恰有一个 d 阶子群。",
      steps: steps,
      struct: function (k) {
        var rows = ds.map(function (d, i) { var s = steps[i]; return [d, k >= i ? U.m("⟨" + s.g + "⟩") : "…", k >= i ? U.m(U.set(s.H)) : ""]; });
        return D.table(["阶 d", "生成元", "子群"], rows, { rowCls: function (r) { return r === k ? "cur" : ""; } });
      },
      viz: function (k) {
        var s = steps[Math.max(0, Math.min(k, ds.length - 1))], H = s.H;
        var cls = U.range(n).map(function (i) { return H.indexOf(i) >= 0 ? "on" : ""; }), arrows = [];
        for (var i = 0; i < H.length && H.length > 1; i++) arrows.push({ a: H[i], b: H[(i + 1) % H.length], cls: "on" });
        cls[0] = "ok";
        return D.ring({ labels: U.range(n).map(String), cls: cls, arrows: arrows, center: ["⟨" + s.g + "⟩", "阶 " + H.length] });
      },
      verdict: { kind: "ok", chip: ds.length + " 个子群", reason: "Z" + U.sub(n) + " 的子群恰为 " + ds.map(function (d) { return U.m("⟨" + (n / d) % n + "⟩"); }).join("、") + "，与 " + n + " 的 " + ds.length + " 个因子一一对应。",
        insight: "这条「因子—子群」对应是循环群最漂亮的结构定理；一般的群（如 S₃）不具备——S₃ 有 3 个不同的 2 阶子群。" }
    };
  }

  var advanced = {
    legend: [["H ≤ G", "H 是 G 的子群"], ["ab⁻¹∈H", "子群判定定理"], ["⟨a⟩", "a 生成的循环子群"], ['<i class="dot on"></i>', "子群 / 候选集元素"], ['<i class="dot bad"></i>', "跑出 H 的结果"]],
    caseLabel: "选择任务",
    cases: [
      { label: "子群判定定理", params: [{ id: "h", label: "候选子集 H", type: "select", value: "z1", options: [
          ["z1", "Z₁₂ 中 {0,4,8}"], ["z2", "Z₁₂ 中 {0,3,6,9}"], ["z3", "Z₁₂ 中 {0,2,5}"], ["z4", "Z₁₂ 中 {1,5,9}"],
          ["s1", "S₃ 中 {e,(12)}"], ["s2", "S₃ 中 {e,(12),(13)}"], ["s3", "S₃ 中 {e,(123),(132)}"]] }],
        build: function (p) { return subgroupTest(p.h); } },
      { label: "⟨a⟩ 生成与循环群判定", params: [{ id: "g", label: "群", type: "select", value: "z12", options: [["z12", "⟨Z₁₂,+⟩"], ["u10", "U(10) = {1,3,7,9}"], ["u8", "U(8) = {1,3,5,7}"], ["s3", "S₃"]] }],
        build: function (p) { return cyclicTest(p.g); } },
      { label: "循环群 Zₙ 的全部子群", params: [{ id: "n", label: "n", type: "select", value: 12, options: [[12, "Z₁₂"], [18, "Z₁₈"], [8, "Z₈"], [7, "Z₇（素数阶）"]] }],
        build: function (p) { return allSubgroups(p.n); } }
    ]
  };

  /* ---------------- 拓展层 ---------------- */
  function primitive(p, g) {
    var S = G.U(p), n = p - 1, pw = [], v = 1;
    do { v = v * g % p; pw.push(v); } while (v !== 1);
    var ord = pw.length, isPrim = ord === n;
    var roots = U.range(n, 1).filter(function (x) { var o = 1, y = x; while (y !== 1) { y = y * x % p; o++; } return o === n; });
    var steps = pw.map(function (val, i) {
      return { t: g + U.sup(i + 1) + " ≡ " + val + " (mod " + p + ")", d: i === 0 ? "起点 " + U.m(g + "¹ = " + g) + "。" : U.m(g + U.sup(i + 1) + " ≡ " + pw[i - 1] + " × " + g + " = " + pw[i - 1] * g + " ≡ " + val) + (val === 1 ? "，" + U.ok("回到 1") + "。" : "。") };
    });
    steps.push({ t: isPrim ? g + " 是本原根" : g + " 不是本原根", d: "ord(" + g + ") = " + ord + (isPrim ? " = p − 1，" + g + " 生成了整个 Z" + U.sub(p) + "*。" : " < p − 1 = " + n + "，只生成了 " + ord + " 阶子群。") + "模 " + p + " 的全部本原根：" + U.m(U.set(roots)) + "，共 φ(" + n + ") = " + U.phi(n) + " 个。" });
    var labs = U.range(n, 1).map(String);
    return {
      titles: { struct: ["幂表 g^k mod p", "p = " + p + "，g = " + g], viz: ["Z" + U.sub(p) + "* 上的轨道", "箭头 = 再乘一次 g"] },
      intro: "Z_p* = {1,…,p−1} 在模 p 乘法下是 p−1 阶循环群；能生成全体的 g 叫本原根（生成元）。",
      steps: steps,
      struct: function (k) {
        var rows = [["g" + U.sup("k")].concat(pw.map(function (x, i) { return i <= k ? "<b>" + x + "</b>" : "…"; }))];
        return D.table(["k"].concat(pw.map(function (_, i) { return i + 1; })), rows, { compact: true, cls: function (r, c) { return c === k + 1 ? "hl" : ""; } }) +
          D.note("ord(" + g + ") 必整除 p − 1 = " + n + "（因子：" + U.set(U.divisors(n)) + "）。");
      },
      viz: function (k) {
        var cls = labs.map(function () { return ""; }), arrows = [];
        for (var i = 0; i <= Math.min(k, ord - 1); i++) {
          var a = i === 0 ? 1 : pw[i - 1], b = pw[i];
          arrows.push({ a: a - 1, b: b - 1, cls: i === k ? "cur" : "on" });
          cls[b - 1] = i === k ? "cur" : "on";
        }
        cls[0] = "ok";
        if (k >= ord) labs.forEach(function (_, i) { if (pw.indexOf(i + 1) < 0) cls[i] = "dim"; });
        return D.ring({ labels: labs, cls: cls, arrows: arrows, center: ["g = " + g, k >= ord - 1 ? "ord = " + ord : "…"] });
      },
      verdict: { kind: isPrim ? "ok" : "bad", chip: isPrim ? "本原根 · 生成元" : "非本原根", reason: "在 Z" + U.sub(p) + "* 中 " + U.m("ord(" + g + ") = " + ord) + (isPrim ? "，g 的幂遍历全部 " + n + " 个非零剩余。" : "，g 的幂只覆盖 " + ord + " 个元素。"),
        insight: "密钥交换要求 g 的幂覆盖足够大的子群，否则可能的密钥太少、容易被穷举——生成元的选择是安全参数的一部分。" }
    };
  }

  function dlog(y) {
    var p = 23, g = 5, v = 1, trials = [];
    for (var x = 1; x <= p - 1; x++) { v = v * g % p; trials.push(v); if (v === y) break; }
    var X = trials.length;
    var steps = trials.map(function (val, i) {
      return { t: "试 x = " + (i + 1) + "：5" + U.sup(i + 1) + " ≡ " + val, d: val === y ? U.ok("命中！") + U.m(" 5" + U.sup(i + 1) + " ≡ " + y + " (mod 23)") + "，离散对数 " + U.m("log₅ " + y + " = " + (i + 1)) + "。" : U.m(val + " ≠ " + y) + "，继续尝试。" };
    });
    steps.push({ t: "代价对比", d: "穷举最多要试 p − 1 = 22 次；而正向计算 5ˣ 用「快速幂」只需约 2·log₂x 次乘法。p 增大时，正向仍然很快，反向穷举的次数随 p 线性增长。" });
    return {
      titles: { struct: ["穷举记录", "p = 23，g = 5（本原根）"], viz: ["在 Z₂₃* 上搜索 y", "红 = 当前尝试 · 绿 = 目标"] },
      intro: "已知 y ≡ 5ˣ (mod 23)，求 x——这就是离散对数问题。小模数下可以穷举。",
      steps: steps,
      struct: function (k) {
        var rows = trials.map(function (val, i) { return [i + 1, i <= k ? U.m(val) : "…", i <= k ? (val === y ? U.ok("= y") : "") : ""]; });
        return D.table(["x", "5ˣ mod 23", ""], rows, { compact: true, rowCls: function (r) { return r === k ? "cur" : ""; } });
      },
      viz: function (k) {
        var labs = U.range(22, 1).map(String), cls = labs.map(function () { return ""; });
        cls[y - 1] = "ok";
        trials.forEach(function (val, i) { if (i < k) cls[val - 1] = val === y ? "ok" : "on"; if (i === k) cls[val - 1] = val === y ? "ok" : "cur"; });
        return D.ring({ labels: labs, cls: cls, arrows: [], center: ["求 x：5ˣ ≡ " + y, k >= X - 1 ? "x = " + X : "已试 " + Math.max(0, Math.min(k + 1, X)) + " 次"] });
      },
      verdict: { kind: "info", chip: "log₅ " + y + " = " + X, reason: "试了 " + X + " 次找到 " + U.m("5" + U.sup(X) + " ≡ " + y + " (mod 23)") + "。",
        insight: "当 p 取 2048 位以上的大素数时，已知的最好算法也无法在可行时间内求出离散对数——「正向容易、反向困难」的单向性正是 Diffie–Hellman 与 ElGamal 的安全基础。" }
    };
  }

  function fastPow(x) {
    var p = 23, g = 5, bits = x.toString(2), steps = [], acc = 1, base = g;
    var rows = [];
    for (var i = bits.length - 1, j = 0; i >= 0; i--, j++) {
      var b = bits[i] === "1";
      var before = acc;
      if (b) acc = acc * base % p;
      rows.push([j, bits[i], U.m("5^" + (1 << j) + " ≡ " + base), b ? U.m(before + "×" + base + " ≡ " + acc) : "跳过"]);
      steps.push({ t: "第 " + j + " 位 = " + bits[i], d: "当前平方项 " + U.m("5^" + (1 << j) + " ≡ " + base + " (mod 23)") + (b ? "；该位为 1，累乘得 " + U.m(acc) + "。" : "；该位为 0，不乘。") });
      base = base * base % p;
    }
    steps.push({ t: "5" + U.sup(x) + " ≡ " + acc + " (mod 23)", d: "x = " + x + " = " + U.m(bits + "₂") + "，只用了 " + (bits.length - 1) + " 次平方和 " + (bits.split("1").length - 2) + " 次乘法（逐次相乘需 " + (x - 1) + " 次）。" });
    return {
      titles: { struct: ["平方-乘算法", "x = " + x + " = " + bits + "₂"], viz: ["指数的二进制位", "金 = 为 1 的位"] },
      intro: "快速幂：把指数写成二进制，从低位起，平方项每步平方一次，遇到 1 就累乘。",
      steps: steps,
      struct: function (k) {
        return D.table(["位", "b", "平方项", "累乘"], rows.map(function (r, i) { return i <= k ? r : [r[0], r[1], "…", "…"]; }), { compact: true, rowCls: function (r) { return r === k ? "cur" : ""; } });
      },
      viz: function (k) {
        var cls = bits.split("").reverse().map(function (c, i) { return i > k ? "dim" : c === "1" ? "p" : ""; }).reverse();
        return '<div style="display:grid;gap:12px;place-items:center;padding:18px 0">' + D.bits(bits, cls) +
          '<div class="gl-note">' + (k >= bits.length ? "结果 " + U.m("5" + U.sup(x) + " mod 23 = " + acc) : "从右往左处理，已处理 " + Math.max(0, Math.min(k + 1, bits.length)) + " 位") + "</div></div>";
      },
      verdict: { kind: "ok", chip: "5" + U.sup(x) + " ≡ " + acc, reason: "正向计算只需 O(log x) 次模乘；指数有 2048 位时也不过几千次乘法。",
        insight: "同一个循环群里，「求幂」极快、「求对数」极难——把难易不对称变成安全性，是公钥密码的核心思想。" }
    };
  }

  var extend = {
    legend: [["Z_p*", "模 p 非零剩余乘法群"], ["本原根", "生成 Z_p* 的元素"], ["logᵍ y", "离散对数：gˣ≡y 的 x"], ['<i class="dot cur"></i>', "当前幂 / 尝试"], ['<i class="dot ok"></i>', "1 或目标 y"]],
    caseLabel: "选择任务",
    cases: [
      { label: "本原根判定", params: [
          { id: "p", label: "素数 p", type: "select", value: 11, options: [[11, "11"], [13, "13"], [19, "19"], [23, "23"]] },
          { id: "g", label: "底数 g", type: "range", min: 2, max: 10, value: 2 }],
        build: function (p) { return primitive(p.p, p.g); } },
      { label: "离散对数：穷举求 x", params: [{ id: "y", label: "目标 y（5ˣ ≡ y mod 23）", type: "range", min: 2, max: 22, value: 11 }],
        build: function (p) { return dlog(p.y); } },
      { label: "快速幂：正向很容易", params: [{ id: "x", label: "指数 x", type: "range", min: 2, max: 22, value: 13 }],
        build: function (p) { return fastPow(p.x); } }
    ]
  };

  GL.define({ basic: basic, advanced: advanced, extend: extend });
})();
