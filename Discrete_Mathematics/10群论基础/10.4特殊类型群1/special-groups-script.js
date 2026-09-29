/* 10.4 特殊类型群（一）—— 三层模块（由 ../group-lab/group-lab.js 渲染）
 *   基础层：循环群（Zₙ 的生成轨道、ord(g)=n/gcd(g,n)、φ(n) 个生成元）
 *   进阶层：对称群与二面体群（S₃ 的 3! 个置换、正方形的对称 D₄、凯莱定理）
 *   拓展层：密钥与置换密码（Diffie–Hellman 密钥交换、分组置换密码）
 */
(function () {
  "use strict";
  var GL = window.GroupLab, U = GL.U, G = GL.G, D = GL.D, P = GL.P;

  /* ---------------- 基础层：循环群 ---------------- */
  function cyclic(n, g) {
    var S = G.Zadd(n), orbit = S.powers(g), m = orbit.length, d = U.gcd(g, n) || n;
    var gens = U.range(n).filter(function (k) { return U.gcd(k, n) === 1; });
    var steps = [];
    for (var i = 1; i <= m; i++) {
      var v = (i * g) % n;
      steps.push({ t: i + "·" + g + " ≡ " + v, d: i === 1 ? "从 0 出发走一步 " + g + "，到达 " + v + "。" : U.m((i - 1) * g % n + " + " + g + " ≡ " + v + " (mod " + n + ")") + (v === 0 ? "，" + U.ok("回到 0") + "，轨道闭合。" : "。") });
    }
    steps.push({ t: "ord(" + g + ") = n / gcd(g, n) = " + m, d: U.m("gcd(" + g + ", " + n + ") = " + d) + "，所以 " + U.m("ord(" + g + ") = " + n + " / " + d + " = " + m) + "。" + (m === n ? U.ok(g + " 是生成元") + "：" + U.m("Z" + U.sub(n) + " = ⟨" + g + "⟩") + "。" : "⟨" + g + "⟩ 只是 " + m + " 阶子群。") });
    steps.push({ t: "全部生成元：gcd(k, n) = 1", d: "Z" + U.sub(n) + " 的生成元为 " + U.m(U.set(gens)) + "，共 " + U.m("φ(" + n + ") = " + gens.length) + " 个。" });
    return {
      titles: { struct: ["轨道 0 → g → 2g → …", "Z" + U.sub(n) + "，步长 g = " + g], viz: ["钟面上的星形轨道", "红 = 当前一步"] },
      intro: "循环群由一个元素反复运算得到。在钟面 Zₙ 上每次走 g 格，看能否走遍所有点。",
      steps: steps,
      struct: function (k) {
        var rows = orbit.map(function (v, i) { return [i, U.m(i + "·" + g), i <= k + 1 ? U.m(v) : "…"]; });
        var h = D.table(["步", "倍数", "位置"], rows, { compact: true, rowCls: function (r) { return r === k + 1 && k < m ? "cur" : ""; } });
        if (k >= m + 1) h += D.sets([{ name: "生成元", body: U.set(gens), cls: "ok", note: "φ(" + n + ") = " + gens.length }, { name: "非生成元", body: U.set(U.range(n).filter(function (x) { return gens.indexOf(x) < 0; })), cls: "dim" }]);
        return h;
      },
      viz: function (k) {
        var cls = U.range(n).map(function () { return ""; }), arrows = [];
        if (k >= m + 1) { cls = U.range(n).map(function (x) { return gens.indexOf(x) >= 0 ? "ok" : ""; }); cls[g] = "cur"; }
        for (var i = 1; i <= Math.min(k + 1, m); i++) {
          arrows.push({ a: orbit[i - 1], b: orbit[i % m], cls: i === k + 1 ? "cur" : "on" });
          if (k < m + 1) cls[orbit[i % m]] = i === k + 1 ? "cur" : "on";
        }
        if (k < m + 1) cls[0] = cls[0] || "ok";
        return D.ring({ labels: U.range(n).map(String), cls: cls, arrows: arrows, center: ["⟨" + g + "⟩", k >= m - 1 ? "阶 " + m : "…"] });
      },
      verdict: { kind: m === n ? "ok" : "info", chip: m === n ? g + " 生成 Z" + U.sub(n) : "⟨" + g + "⟩ 为 " + m + " 阶子群",
        reason: "在 Z" + U.sub(n) + " 中 " + U.m("ord(" + g + ") = " + n + "/gcd(" + g + "," + n + ") = " + m) + "；k 是生成元当且仅当 gcd(k, n) = 1。",
        insight: "任何 n 阶循环群都同构于 Zₙ，任何无限循环群都同构于整数加法群 ⟨Z, +⟩ = ⟨1⟩ = ⟨−1⟩——循环群是结构最简单、被研究得最透彻的一类群。" }
    };
  }
  var basic = {
    legend: [["⟨g⟩", "g 生成的循环群"], ["ord(g)", "= n / gcd(g, n)"], ["φ(n)", "生成元个数"], ['<i class="dot on"></i>', "轨道上已到达的点"], ['<i class="dot ok"></i>', "单位元 0 / 生成元"]],
    caseLabel: "选择循环群",
    cases: [
      { label: "Z₁₂（钟面）", params: [{ id: "g", label: "步长 g", type: "range", min: 1, max: 11, value: 5 }], build: function (p) { return cyclic(12, p.g); } },
      { label: "Z₁₀", params: [{ id: "g", label: "步长 g", type: "range", min: 1, max: 9, value: 4 }], build: function (p) { return cyclic(10, p.g); } },
      { label: "Z₉", params: [{ id: "g", label: "步长 g", type: "range", min: 1, max: 8, value: 2 }], build: function (p) { return cyclic(9, p.g); } },
      { label: "Z₇（素数阶）", params: [{ id: "g", label: "步长 g", type: "range", min: 1, max: 6, value: 3 }], build: function (p) { return cyclic(7, p.g); } }
    ]
  };

  /* ---------------- 进阶层 ---------------- */
  function s3List() {
    var S = G.S3(), n = 6;
    var steps = [{ t: "计数：3 × 2 × 1 = 3!", d: "置换就是 {1,2,3} 到自身的双射：1 的像有 3 种选法，2 的像剩 2 种，3 的像只剩 1 种，共 " + U.m("3! = 6") + " 个。一般地 " + U.m("|Sₙ| = n!") + "。" }];
    U.range(n).forEach(function (i) {
      var p = S.elems[i];
      steps.push({ t: "σ" + U.sub(i + 1) + " = " + S.lab(i), d: "两行式 1→" + (p[0] + 1) + "，2→" + (p[1] + 1) + "，3→" + (p[2] + 1) + "；轮换式 " + U.m(S.lab(i)) + "，阶 " + P.order(p) + "，" + (P.even(p) ? "偶置换" : "奇置换") + "。" });
    });
    var ab = S.T[1][2], ba = S.T[2][1];
    steps.push({ t: "S₃ 不交换", d: U.m("(12)(13) = " + S.lab(ab)) + "（先 (13) 后 (12)），" + U.m("(13)(12) = " + S.lab(ba)) + "。S₃ 是最小的非交换群。" });
    return {
      titles: { struct: ["S₃ 运算表", "στ：先 τ 后 σ"], viz: ["当前置换的箭头图", "同色 = 同一轮换"] },
      intro: "对称群 Sₙ = 集合 {1,…,n} 上全体置换在复合下构成的群。先数一数 S₃ 有几个元素。",
      steps: steps,
      struct: function (k) {
        return D.cayley(S, {
          row: function (i) { return k >= 1 && k <= n && i === k - 1 ? "cur" : ""; },
          cell: function (i, j) { if (k === n + 1 && ((i === 1 && j === 2) || (i === 2 && j === 1))) return "cur"; return k >= 1 && k <= n && i > k - 1 ? "dim" : ""; }
        });
      },
      viz: function (k) {
        var i = k >= 1 && k <= n ? k - 1 : k > n ? ab : 4, p = S.elems[i];
        return permRing(p, S.lab(i)) + (k >= 1 && k <= n ? P.twoLine(p) : "");
      },
      verdict: { kind: "info", chip: "|S₃| = 3! = 6", reason: "S₃ 的元素：" + U.m(U.set(U.range(n).map(S.lab))) + "；其中 3 个对换（奇）、2 个 3-轮换与恒等（偶）。",
        insight: "Sₙ 的阶 n! 增长极快：S₁₀ 已有 3628800 个元素。它是「一切有限群的容器」——见凯莱定理。" }
    };
  }
  function permRing(p, name) {
    var cyc = P.cycles(p, true), cls = [], arrows = [];
    cyc.forEach(function (c, ci) { c.forEach(function (x) { cls[x] = c.length > 1 ? "c" + (ci % 6) : ""; arrows.push({ a: x, b: p[x], cls: c.length > 1 ? "c" + (ci % 6) : "dim" }); }); });
    return D.ring({ labels: U.range(p.length).map(function (x) { return x + 1; }), cls: cls, arrows: arrows, center: [name, "阶 " + P.order(p)], height: 300 });
  }

  function dihedral(nn) {
    var S = G.D(nn), n = 2 * nn;
    var steps = U.range(n).map(function (i) {
      var k = i % nn, refl = i >= nn;
      return { t: "对称 " + S.lab(i), d: refl ? "翻折（沿绿色对称轴）：顶点置换 " + U.m(P.str(S.perm(i))) + "。" : i === 0 ? "恒等：什么都不动。" : "旋转 " + k * 360 / nn + "°：顶点置换 " + U.m(P.str(S.perm(i))) + "。" };
    });
    steps.push({ t: "|D" + U.sub(nn) + "| = 2 × " + nn + " = " + n, d: "正 " + nn + " 边形有 " + nn + " 个旋转（含恒等）和 " + nn + " 个翻折。" + U.m("rs = " + S.lab(S.T[1][nn]) + " ≠ sr = " + S.lab(S.T[nn][1])) + "，D" + U.sub(nn) + " 不交换。" });
    return {
      titles: { struct: ["D" + U.sub(nn) + " 运算表", "rᵏs：先 s 后 rᵏ"], viz: ["正" + (nn === 4 ? "方形" : nn + "边形"), "数字=顶点 · 位i=位置"] },
      intro: "二面体群 Dₙ = 正 n 边形的全部对称（旋转 + 翻折）。逐个观看它们如何移动顶点。",
      steps: steps,
      struct: function (k) {
        return D.cayley(S, { row: function (i) { return i === k ? "cur" : ""; },
          cell: function (i, j) { return k === n && ((i === 1 && j === nn) || (i === nn && j === 1)) ? "cur" : ""; } });
      },
      viz: function (k) {
        var i = k >= 0 && k < n ? k : k === n ? S.T[1][nn] : 0, kk = i % nn;
        return D.polygon({ n: nn, perm: S.perm(i), axis: i >= nn ? kk / 2 : null, rot: i < nn ? kk : 0 });
      },
      verdict: { kind: "info", chip: "|D" + U.sub(nn) + "| = " + n, reason: "D" + U.sub(nn) + " 是 " + n + " 阶非交换群；把它看成 " + nn + " 个顶点的置换，它是 S" + U.sub(nn) + "（" + (nn === 4 ? "24" : "6") + " 阶）的子群" + (nn === 3 ? "，且恰好等于 S₃。" : "——并非所有顶点置换都能由刚体运动实现。"),
        insight: "雪花、窗花、分子结构的对称都可以用二面体群描述；化学与晶体学用群来给对称性分类。" }
    };
  }

  function cayleyThm(key) {
    var S = key === "k4" ? G.U(8) : key === "z4" ? G.Zadd(4) : G.S3(), n = S.n;
    var lam = U.range(n).map(function (g) { return S.T[g]; });   // λ_g(x) = g∘x
    var steps = U.range(n).map(function (g) {
      return { t: "λ" + U.sub(g + 1) + "：x ↦ " + S.lab(g) + S.sym + "x", d: "运算表第 " + S.lab(g) + " 行就是一个置换：" + U.range(n).map(function (x) { return U.m(S.lab(x) + "→" + S.lab(lam[g][x])); }).join("，") + "；按元素编号 1…" + n + " 写成 " + U.m(P.str(lam[g])) + "。" };
    });
    steps.push({ t: "g ↦ λ_g 是单同态", d: U.m("λ_g∘λ_h = λ_{gh}") + "（结合律），不同的 g 给出不同的置换，于是 " + U.m(S.name + " ≅ {λ_g} ≤ S" + U.sub(n)) + "。" });
    return {
      titles: { struct: ["左乘置换表", S.name + " 的元素编号 1…" + n], viz: ["左乘映射 x ↦ g∘x", "它是 G 上的双射"] },
      intro: "凯莱定理：每个群都同构于某个置换群。办法是让 g 通过左乘去「重排」G 自己的元素。",
      steps: steps,
      struct: function (k) {
        var rows = U.range(n).map(function (g) { return [U.m(S.lab(g)), k >= g ? U.m(P.str(lam[g])) : "…"]; });
        return D.table(["g", "λ_g（轮换式）"], rows, { rowCls: function (r) { return r === k ? "cur" : ""; } }) +
          D.note("编号：" + U.range(n).map(function (x) { return (x + 1) + "=" + S.lab(x); }).join("，"));
      },
      viz: function (k) {
        var g = k >= 0 && k < n ? k : 1;
        return D.mapping({ L: U.range(n).map(S.lab), R: U.range(n).map(S.lab), map: lam[g], titles: ["x", S.lab(g) + S.sym + "x"], acls: lam[g].map(function () { return "on"; }), boxW: 64 });
      },
      verdict: { kind: "ok", chip: S.name + " ↪ S" + U.sub(n), reason: "映射 " + U.m("g ↦ λ_g") + " 是从 " + S.name + " 到 S" + U.sub(n) + " 的单同态，" + S.name + " 同构于 S" + U.sub(n) + " 的一个 " + n + " 阶子群。",
        insight: "凯莱定理说明对称群是「万能」的：研究有限群，原则上都可以在置换群里进行。" }
    };
  }

  var advanced = {
    legend: [["n!", "Sₙ 的阶"], ["2n", "Dₙ 的阶"], ["rᵏs", "先翻折 s 再旋转 rᵏ"], ["λ_g", "左乘置换 x ↦ gx"], ["στ", "先 τ 后 σ"]],
    caseLabel: "选择主题",
    cases: [
      { label: "对称群 S₃：3! 个置换", build: s3List },
      { label: "二面体群 D₄：正方形的对称", build: function () { return dihedral(4); } },
      { label: "凯莱定理：群 ↪ 置换群", params: [{ id: "g", label: "群", type: "select", value: "k4", options: [["k4", "U(8) = {1,3,5,7}（克莱因四元群）"], ["z4", "⟨Z₄, +⟩"], ["s3", "S₃"]] }],
        build: function (p) { return cayleyThm(p.g); } }
    ]
  };

  /* ---------------- 拓展层 ---------------- */
  function dh(a, b) {
    var p = 23, g = 5, A = U.powmod(g, a, p), B = U.powmod(g, b, p), K = U.powmod(B, a, p), K2 = U.powmod(A, b, p);
    var steps = [
      { t: "公开参数 p = 23，g = 5", d: "5 是模 23 的本原根，⟨5⟩ = Z₂₃*（22 阶循环群）。p、g 对所有人公开。" },
      { t: "甲：私钥 a = " + a + "，发送 A = 5ᵃ", d: U.m("A = 5" + U.sup(a) + " mod 23 = " + A) + "，a 保密。" },
      { t: "乙：私钥 b = " + b + "，发送 B = 5ᵇ", d: U.m("B = 5" + U.sup(b) + " mod 23 = " + B) + "，b 保密。" },
      { t: "甲算 Bᵃ，乙算 Aᵇ", d: U.m("K甲 = " + B + U.sup(a) + " mod 23 = " + K) + "，" + U.m("K乙 = " + A + U.sup(b) + " mod 23 = " + K2) + "。" },
      { t: "双方得到同一密钥", d: U.m("(gᵇ)ᵃ = gᵃᵇ = (gᵃ)ᵇ") + "——循环群中幂运算可交换顺序，共享密钥 " + U.m("K = " + K) + "。" },
      { t: "窃听者看到什么", d: "只有 p、g、A = " + A + "、B = " + B + "；要算 K 需先求离散对数 a 或 b。小例子能穷举，大素数下不可行。" }
    ];
    return {
      titles: { struct: ["密钥交换流程", "p = 23，g = 5"], viz: ["Z₂₃* 上的位置", "红=A · 金=B · 绿=K"] },
      intro: "Diffie–Hellman：双方只交换 gᵃ 与 gᵇ，就能在公开信道上约定出只有彼此知道的 gᵃᵇ。",
      steps: steps,
      struct: function (k) {
        var show = function (s, v) { return k >= s ? U.m(v) : "?"; };
        return '<div class="gl-flow"><div class="gl-party"><h4>甲</h4>' + D.kv([["私钥 a", show(1, a)], ["发送 A", show(1, A)], ["算 Bᵃ", show(3, K)]]) + "</div>" +
          '<div class="gl-chan"><span>公开信道</span><span class="gl-m">p=23, g=5</span>' + (k >= 1 ? '<span class="gl-m">A=' + A + " →</span>" : "") + (k >= 2 ? '<span class="gl-m">← B=' + B + "</span>" : "") + "</div>" +
          '<div class="gl-party"><h4>乙</h4>' + D.kv([["私钥 b", show(2, b)], ["发送 B", show(2, B)], ["算 Aᵇ", show(3, K2)]]) + "</div></div>" +
          (k >= 4 ? D.note("共享密钥 " + U.m("K = 5" + U.sup(a * b % 22 || 22) + " = " + K) + "（指数按模 22 计算）。") : "");
      },
      viz: function (k) {
        var cls = U.range(22).map(function () { return ""; });
        if (k >= 1) cls[A - 1] = "cur";
        if (k >= 2) cls[B - 1] = "on";
        if (k >= 3) cls[K - 1] = "ok";
        var tags = U.range(22).map(function (i) { var t = []; if (k >= 1 && i === A - 1) t.push("A"); if (k >= 2 && i === B - 1) t.push("B"); if (k >= 3 && i === K - 1) t.push("K"); return t.join(","); });
        return D.ring({ labels: U.range(22, 1).map(String), cls: cls, tags: tags, arrows: [], center: ["Z₂₃*", k >= 4 ? "K = " + K : "…"] });
      },
      verdict: { kind: K === K2 ? "ok" : "bad", chip: "共享密钥 K = " + K, reason: "甲、乙各自计算得到 " + U.m("K = " + K) + "；窃听者只掌握 A、B，需要解离散对数。",
        insight: "DH 只解决「约定密钥」，不能单独防止中间人冒充，实际协议还要配合身份认证（数字签名、证书）。" }
    };
  }

  function transCipher(key) {
    var sig = { a: [1, 3, 0, 2], b: [2, 0, 3, 1], c: [1, 0, 3, 2] }[key];   // 第 i 个明文字母放到密文第 σ(i) 位
    var msg = "GROUPSYMMETRY".slice(0, 12), blocks = [msg.slice(0, 4), msg.slice(4, 8), msg.slice(8, 12)];
    var enc = blocks.map(function (b) { var c = []; b.split("").forEach(function (ch, i) { c[sig[i]] = ch; }); return c.join(""); });
    var si = P.inv(sig), ord = P.order(sig);
    var steps = blocks.map(function (b, i) {
      return { t: "第 " + (i + 1) + " 组 " + b + " → " + enc[i], d: "按 σ = " + U.m(P.str(sig)) + " 把第 i 个字母放到第 σ(i) 位：" + b.split("").map(function (ch, j) { return U.m(ch + ":" + (j + 1) + "→" + (sig[j] + 1)); }).join(" ") + "。" };
    });
    steps.push({ t: "用 σ⁻¹ 解密", d: U.m("σ⁻¹ = " + P.str(si)) + "；对每组密文再作 σ⁻¹，得回明文 " + U.m(msg) + "。" });
    steps.push({ t: "重复加密 " + ord + " 次回到明文", d: U.m("ord(σ) = " + ord) + "：连续用同一个密钥加密 " + ord + " 次等于什么都没做。" });
    steps.push({ t: "密钥空间 4! = 24", d: "分组长 4 的全部置换密钥构成 S₄，只有 24 个；两次置换加密 = 一次置换加密（群的封闭性），叠加不会增加密钥空间。" });
    return {
      titles: { struct: ["分组置换加密", "分组长 4，σ = " + P.str(sig)], viz: ["位置置换 σ", "第 i 位 → 第 σ(i) 位"] },
      intro: "置换密码不改字母、只改位置：每组 4 个字母按密钥置换 σ ∈ S₄ 重排。",
      steps: steps,
      struct: function (k) {
        var rows = blocks.map(function (b, i) { return [i + 1, U.m(b), k >= i ? U.m(enc[i]) : "…", k >= 3 ? U.m(b) : ""]; });
        return D.table(["组", "明文", "密文", "解密"], rows, { rowCls: function (r) { return r === k ? "cur" : ""; } }) +
          D.note("密文：" + U.m(k >= 2 ? enc.join(" ") : "……") + "　两行式：") + P.twoLine(sig);
      },
      viz: function (k) {
        var bi = Math.max(0, Math.min(k, 2)), b = blocks[bi], c = enc[bi];
        var inv = k === 3;
        return D.mapping({ L: (inv ? c : b).split("").map(function (ch, i) { return (i + 1) + " " + ch; }), R: (inv ? b : c).split("").map(function (ch, i) { return (i + 1) + " " + ch; }),
          map: inv ? si : sig, acls: [0, 1, 2, 3].map(function (x) { return "c" + x; }), lcls: [0, 1, 2, 3].map(function (x) { return "c" + (inv ? si[x] : x); }), rcls: [0, 1, 2, 3].map(function (x) { return "c" + (inv ? x : si[x]); }),
          titles: inv ? ["密文位置", "σ⁻¹ → 明文"] : ["明文位置", "σ → 密文"], boxW: 64 });
      },
      verdict: { kind: "info", chip: "密文 " + enc.join(""), reason: "置换密码的加密族 {E_σ | σ ∈ S₄} 与 S₄ 同构：可逆性来自逆置换，周期来自置换的阶。",
        insight: "单独的置换（换位）或代换都不安全；现代分组密码把「代换 + 置换」交替迭代多轮（SPN 结构），见 10.8 拓展层。" }
    };
  }

  var extend = {
    legend: [["gᵃ", "公开的「半把钥匙」"], ["gᵃᵇ", "共享密钥"], ["σ", "位置置换密钥"], ["σ⁻¹", "解密置换"], ["ord(σ)", "重复加密回到明文的次数"]],
    caseLabel: "选择方案",
    cases: [
      { label: "Diffie–Hellman 密钥交换", params: [
          { id: "a", label: "甲的私钥 a", type: "range", min: 2, max: 21, value: 6 },
          { id: "b", label: "乙的私钥 b", type: "range", min: 2, max: 21, value: 15 }],
        build: function (p) { return dh(p.a, p.b); } },
      { label: "分组置换密码（S₄）", params: [{ id: "k", label: "密钥 σ", type: "select", value: "a", options: [["a", "σ = (1243)"], ["b", "σ = (1342)"], ["c", "σ = (12)(34)"]] }],
        build: function (p) { return transCipher(p.k); } }
    ]
  };

  GL.define({ basic: basic, advanced: advanced, extend: extend });
})();
