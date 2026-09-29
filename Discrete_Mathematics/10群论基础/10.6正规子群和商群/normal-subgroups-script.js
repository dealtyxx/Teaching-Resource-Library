/* 10.6 正规子群和商群 —— 三层模块（由 ../group-lab/group-lab.js 渲染）
 *   基础层：正规子群判定（逐个 g 检验 gNg⁻¹ = N，左右陪集是否一致）
 *   进阶层：商群 G/N（陪集乘法良定义检验、商群运算表、自然同态的核；非正规时的反例）
 *   拓展层：模运算与结构分解（Z/nZ、Z₁₂ 的合成列、单群 Z_p 与 A₅）
 */
(function () {
  "use strict";
  var GL = window.GroupLab, U = GL.U, G = GL.G, D = GL.D, P = GL.P;
  var sortN = function (a) { return a.slice().sort(function (x, y) { return x - y; }); };
  var cname = function (S, a, N, nm) { return S.additive ? S.lab(a) + " + " + nm : (a === S.e ? nm : S.lab(a) + nm); };

  var CASES = {
    s3a3: { S: function () { return G.S3(); }, N: [0, 4, 5], nm: "A₃" },
    s3t: { S: function () { return G.S3(); }, N: [0, 1], nm: "H" },
    d4c: { S: function () { return G.D(4); }, N: [0, 2], nm: "N" },
    d4s: { S: function () { return G.D(4); }, N: [0, 4], nm: "H" },
    d4r: { S: function () { return G.D(4); }, N: [0, 1, 2, 3], nm: "N" },
    z6: { S: function () { return G.Zadd(6); }, N: [0, 3], nm: "N" }
  };

  /* ---------------- 基础层 ---------------- */
  function normalTest(key) {
    var c = CASES[key], S = c.S(), N = sortN(c.N), n = S.n, nm = c.nm;
    var inN = function (x) { return N.indexOf(x) >= 0; };
    var rows = U.range(n).map(function (g) { var cj = S.conj(g, N); return { g: g, cj: cj, ok: cj.join() === N.join(), l: S.leftCoset(g, N), r: S.rightCoset(g, N) }; });
    var steps = rows.map(function (r) {
      return { t: "g = " + S.lab(r.g) + "：g" + nm + "g⁻¹ " + (r.ok ? "=" : "≠") + " " + nm,
        d: (S.isAbelian() ? "交换群中 " + U.m("gng⁻¹ = n") + "，自然相等。" : U.m("g" + nm + "g⁻¹ = " + S.set(r.cj))) + "；" + U.m("g" + nm + " = " + S.set(r.l)) + "，" + U.m(nm + "g = " + S.set(r.r)) + "，" + (r.ok ? U.ok("左右陪集相同") : U.bad("左右陪集不同")) + "。" };
    });
    var bad = rows.filter(function (r) { return !r.ok; }), normal = !bad.length;
    steps.push({ t: normal ? nm + " ⊴ " + S.name : nm + " 不是正规子群", d: normal ? "对所有 g 都有 " + U.m("g" + nm + "g⁻¹ = " + nm) + "，等价地 " + U.m("g" + nm + " = " + nm + "g") + "。" : "共有 " + bad.length + " 个 g 使共轭把 " + nm + " 「搬」出了自身，如 " + U.m(S.lab(bad[0].g) + nm + S.lab(bad[0].g) + "⁻¹ = " + S.set(bad[0].cj)) + "。" });
    return {
      titles: { struct: ["共轭检验表", nm + " = " + S.set(N)], viz: [S.name + " 中的 " + nm, "金 = " + nm + " · 红 = 共轭后跑出 " + nm + " 的元素"] },
      intro: "N 是正规子群 ⇔ 对一切 g ∈ G，gNg⁻¹ = N ⇔ 左陪集 gN 等于右陪集 Ng。逐个 g 检验。",
      steps: steps,
      struct: function (k) {
        return D.table(["g", "g" + nm + "g⁻¹", "g" + nm, nm + "g", ""], rows.map(function (r, i) {
          return i <= k ? [U.m(S.lab(r.g)), U.m(S.set(r.cj)), U.m(S.set(r.l)), U.m(S.set(r.r)), r.ok ? "✓" : "✗"] : [U.m(S.lab(r.g)), "…", "", "", ""];
        }), { compact: true, rowCls: function (i) { return i === k ? "cur" : ""; }, cls: function (i, ci) { return ci === 4 && i <= k ? (rows[i].ok ? "ok" : "bad") : ""; } });
      },
      viz: function (k) {
        var cls = U.range(n).map(function (x) { return inN(x) ? "on" : ""; }), arrows = [];
        if (k >= 0 && k < n) {
          var r = rows[k], gi = S.inv(r.g);
          cls[r.g] = cls[r.g] ? "on ring" : "cur";
          N.forEach(function (h) { var y = S.T[S.T[r.g][h]][gi]; if (y !== h) arrows.push({ a: h, b: y, cls: inN(y) ? "ok" : "bad" }); if (!inN(y)) cls[y] = "bad"; });
        }
        return D.ring({ labels: U.range(n).map(S.lab), cls: cls, arrows: arrows, center: [nm + (k >= n ? (normal ? " ⊴ G" : " ⋬ G") : ""), k >= 0 && k < n ? "g = " + S.lab(k) : ""] });
      },
      verdict: normal ? { kind: "ok", chip: "正规子群", reason: nm + " = " + U.m(S.set(N)) + " 在所有共轭下不变，是 " + S.name + " 的正规子群，记作 " + U.m(nm + " ⊴ " + S.name) + "。",
          insight: key === "s3a3" ? "A₃ 是 S₃ 中全体偶置换：共轭不改变置换的奇偶性，所以 A₃ 必然正规。指数为 2 的子群总是正规的。" : S.isAbelian() ? "交换群的每个子群都是正规子群。" : "D₄ 的中心 {e, r²} 与所有元素可交换，中心总是正规子群。" }
        : { kind: "bad", chip: "不是正规子群", reason: "存在 g 使 " + U.m("g" + nm + "g⁻¹ ≠ " + nm) + "（左右陪集不同），所以 " + nm + " 不是正规子群。",
          insight: "正规性是「子群与整个群的相处方式」，与子群自身大小无关：S₃ 中 {e,(12)} 与 A₃ 都是子群，只有后者正规。" }
    };
  }
  var basic = {
    legend: [["gNg⁻¹", "N 被 g 共轭后的像"], ["gN = Ng", "左右陪集相同"], ["N ⊴ G", "N 是正规子群"], ['<i class="dot on"></i>', "子群 N 的元素"], ['<i class="dot bad"></i>', "共轭后跑出 N"]],
    caseLabel: "选择群与子群",
    cases: [
      { label: "S₃ 中 A₃ = {e,(123),(132)}", build: function () { return normalTest("s3a3"); } },
      { label: "S₃ 中 {e,(12)}", build: function () { return normalTest("s3t"); } },
      { label: "D₄ 中心 {e, r²}", build: function () { return normalTest("d4c"); } },
      { label: "D₄ 中 {e, s}", build: function () { return normalTest("d4s"); } },
      { label: "Z₆ 中 {0, 3}", build: function () { return normalTest("z6"); } }
    ]
  };

  /* ---------------- 进阶层：商群 ---------------- */
  function quotient(key) {
    var c = CASES[key], S = c.S(), N = sortN(c.N), nm = c.nm, cs = S.cosets(N), m = cs.reps.length;
    var name = function (i) { return cname(S, cs.reps[i], N, nm); };
    var pairs = [], bad = null;
    for (var i = 0; i < m; i++) for (var j = 0; j < m; j++) {
      var hit = {};
      cs.list[i].forEach(function (x) { cs.list[j].forEach(function (y) { hit[cs.cls[S.T[x][y]]] = [x, y]; }); });
      var ks = Object.keys(hit).map(Number);
      pairs.push({ i: i, j: j, ks: ks, ok: ks.length === 1, ex: hit });
      if (ks.length > 1 && !bad) bad = { i: i, j: j, a: hit[ks[0]], b: hit[ks[1]], ka: ks[0], kb: ks[1] };
    }
    var steps = [{ t: "列出 " + m + " 个陪集", d: cs.list.map(function (l, t) { return U.m(name(t) + " = " + S.set(l)); }).join("；") + "。" }];
    pairs.forEach(function (pr) {
      steps.push({ t: name(pr.i) + " · " + name(pr.j), d: pr.ok ? "任取代表 x ∈ " + name(pr.i) + "、y ∈ " + name(pr.j) + "，乘积 xy 总落在 " + U.m(name(pr.ks[0])) + " " + U.ok("✓ 良定义") + "。"
        : "取不同代表乘积落在不同陪集：" + pr.ks.map(function (kk) { var e = pr.ex[kk]; return U.m(S.lab(e[0]) + "·" + S.lab(e[1]) + " = " + S.lab(S.T[e[0]][e[1]]) + " ∈ " + name(kk)); }).join("，") + " " + U.bad("✗ 不良定义") + "。" });
    });
    if (!bad) {
      steps.push({ t: "商群 " + S.name + "/" + nm, d: "陪集乘法 " + U.m("(a" + nm + ")(b" + nm + ") = (ab)" + nm) + " 良定义，" + m + " 个陪集构成 " + m + " 阶群。" });
      steps.push({ t: "自然同态 π: g ↦ g" + nm, d: U.m("π(ab) = (ab)" + nm + " = π(a)π(b)") + "，" + U.m("Ker π = " + nm) + "——每个正规子群都是某个同态的核。" });
    } else {
      steps.push({ t: "无法构成商群", d: nm + " 不是正规子群，陪集乘法依赖代表的选取，G/" + nm + " 上定义不出运算。" });
    }
    var table = function () {
      return D.table([S.name + "/" + nm].concat(U.range(m).map(name)), U.range(m).map(function (i) {
        return ["<b>" + name(i) + "</b>"].concat(U.range(m).map(function (j) { var pr = pairs[i * m + j]; return pr.ok ? name(pr.ks[0]) : "✗"; }));
      }), { compact: true, cls: function (r, ci) { if (ci === 0) return ""; var pr = pairs[r * m + ci - 1]; return pr.ok ? "c" + (pr.ks[0] % 6) : "bad"; } });
    };
    return {
      titles: { struct: ["陪集乘法表", "按任意代表相乘"], viz: [S.name + " 的陪集", "同色 = 同一陪集"] },
      intro: "商群的元素是陪集，运算是「取代表相乘」。只有当结果与代表的选取无关（良定义）时，商群才存在。",
      steps: steps,
      struct: function (k) {
        if (k <= 0) return D.sets(cs.list.map(function (l, t) { return { name: name(t), body: S.set(l), cls: "c" + (t % 6) }; }));
        var done = Math.min(k, pairs.length);
        var h = D.table(["×"].concat(U.range(m).map(name)), U.range(m).map(function (i) {
          return ["<b>" + name(i) + "</b>"].concat(U.range(m).map(function (j) { var idx = i * m + j, pr = pairs[idx]; return idx < done ? (pr.ok ? name(pr.ks[0]) : "✗") : "…"; }));
        }), { compact: true, cls: function (r, ci) { if (ci === 0) return ""; var idx = r * m + ci - 1, pr = pairs[idx]; if (idx >= done) return ""; return idx === k - 1 ? "hl" : pr.ok ? "" : "bad"; } });
        if (k > pairs.length && !bad) h += D.note("商群 " + U.m(S.name + "/" + nm) + " 的阶 = " + U.m(S.n + "/" + N.length + " = " + m) + (m === 2 ? "，≅ Z₂。" : m === 4 ? (U.range(m).every(function (t) { return pairs[t * m + t].ks[0] === 0; }) ? "，每个元素平方为单位元，≅ 克莱因四元群 K₄。" : "，≅ Z₄。") : "。"));
        return h;
      },
      viz: function (k) {
        var cls = U.range(S.n).map(function (x) { return "c" + (cs.cls[x] % 6); }), arrows = [];
        var pr = k >= 1 && k <= pairs.length ? pairs[k - 1] : null;
        if (pr) {
          cs.list[pr.i].concat(cs.list[pr.j]).forEach(function (x) { cls[x] += " ring"; });
          if (!pr.ok) { var e1 = pr.ex[pr.ks[0]], e2 = pr.ex[pr.ks[1]]; arrows.push({ a: e1[0], b: S.T[e1[0]][e1[1]], cls: "bad" }, { a: e2[0], b: S.T[e2[0]][e2[1]], cls: "bad" }); }
        }
        return D.ring({ labels: U.range(S.n).map(S.lab), cls: cls, arrows: arrows, center: [S.name + "/" + nm, m + " 个陪集"] });
      },
      verdict: bad ? { kind: "bad", chip: "商群不存在", reason: "在 " + name(bad.i) + " 与 " + name(bad.j) + " 中取不同代表：" + U.m(S.lab(bad.a[0]) + "·" + S.lab(bad.a[1]) + " ∈ " + name(bad.ka)) + "，但 " + U.m(S.lab(bad.b[0]) + "·" + S.lab(bad.b[1]) + " ∈ " + name(bad.kb)) + "——陪集乘法不良定义。",
          insight: "这正是要求 N 正规的原因：N 正规 ⇔ 陪集乘法与代表无关 ⇔ G/N 能成为群。" }
        : { kind: "ok", chip: S.name + "/" + nm + " 是 " + m + " 阶群", reason: "陪集乘法对任意代表都给出同一陪集，得到商群；自然同态 π: g ↦ g" + nm + " 的核恰为 " + nm + "。",
          insight: "同态基本定理的另一面：核一定正规，而每个正规子群又都是自然同态的核——「正规子群」与「同态」是一回事的两种说法。" }
    };
  }
  var advanced = {
    legend: [["gN", "商群的元素（陪集）"], ["(aN)(bN)", "= (ab)N，需良定义"], ["π", "自然同态 g ↦ gN"], ["Ker π", "= N"], ["✗", "取不同代表结果不同"]],
    caseLabel: "选择商群",
    cases: [
      { label: "S₃ / A₃", build: function () { return quotient("s3a3"); } },
      { label: "D₄ / {e, r²}", build: function () { return quotient("d4c"); } },
      { label: "D₄ / ⟨r⟩", build: function () { return quotient("d4r"); } },
      { label: "S₃ / {e,(12)}（非正规，反例）", build: function () { return quotient("s3t"); } }
    ]
  };

  /* ---------------- 拓展层 ---------------- */
  function zmodn(n) {
    var ints = U.range(24).map(function (i) { return i - 8; });
    var steps = U.range(n).map(function (r) {
      return { t: "剩余类 [" + r + "] = " + r + " + " + n + "Z", d: "余数为 " + r + " 的全体整数：" + U.m("{…, " + ints.filter(function (x) { return U.mod(x, n) === r; }).join(", ") + ", …}") + "。" };
    });
    steps.push({ t: "[a] + [b] = [a + b]", d: "例：" + U.m("[" + (n - 1) + "] + [2] = [" + (n + 1) + "] = [" + (n + 1) % n + "]") + "；换代表 " + U.m((2 * n - 1) + " + " + (2 - n) + " = " + (n + 1)) + "，结果相同——nZ 是 Z 的正规子群（Z 交换）。" });
    steps.push({ t: "Z / nZ ≅ Zₙ", d: "商群 Z/nZ 的 " + n + " 个元素就是模 " + n + " 的剩余类；「模 n 运算」其实就是在商群里计算。" });
    return {
      titles: { struct: ["整数按余数分类", "−8 … 15 的整数"], viz: ["商群 Z/" + n + "Z", "箭头 = 加 [1]"] },
      intro: "整数加法群 Z 以 nZ 为正规子群，陪集就是剩余类，商群就是模 n 的世界。",
      steps: steps,
      struct: function (k) {
        return '<div class="gl-sets">' + U.range(n).map(function (r) {
          return '<div class="gl-set ' + (r <= k ? "c" + (r % 6) : "dim") + (r === k ? " cur" : "") + '"><b>[' + r + "]</b>" + '<span class="gl-m">' + ints.filter(function (x) { return U.mod(x, n) === r; }).join("  ") + "</span></div>";
        }).join("") + "</div>";
      },
      viz: function (k) {
        var cls = U.range(n).map(function (r) { return r <= k ? "c" + (r % 6) : ""; });
        var arrows = k >= n ? U.range(n).map(function (r) { return { a: r, b: (r + 1) % n, cls: "on" }; }) : [];
        return D.ring({ labels: U.range(n).map(function (r) { return "[" + r + "]"; }), cls: cls, arrows: arrows, center: ["Z/" + n + "Z", "≅ Z" + U.sub(n)] });
      },
      verdict: { kind: "ok", chip: "Z/" + n + "Z ≅ Z" + U.sub(n), reason: "Z 的陪集 r + nZ（r = 0…" + (n - 1) + "）在代表相加下构成 " + n + " 阶循环群。",
        insight: "日历中的星期（模 7）、时钟（模 12）、校验码中的求余，都是在商群 Z/nZ 中计算。" }
    };
  }

  function series() {
    var S = G.Zadd(12), chain = [[0, 2, 4, 6, 8, 10], [0, 4, 8], [0]];
    var names = ["Z₁₂", "⟨2⟩", "⟨4⟩", "{0}"], full = [U.range(12)].concat(chain);
    var steps = [
      { t: "Z₁₂ ⊳ ⟨2⟩：商 ≅ Z₂", d: U.m("⟨2⟩ = {0,2,4,6,8,10}") + "，指数 2，" + U.m("Z₁₂/⟨2⟩ ≅ Z₂") + "（奇偶两类）。" },
      { t: "⟨2⟩ ⊳ ⟨4⟩：商 ≅ Z₂", d: U.m("⟨4⟩ = {0,4,8}") + "，" + U.m("⟨2⟩/⟨4⟩ ≅ Z₂") + "。" },
      { t: "⟨4⟩ ⊳ {0}：商 ≅ Z₃", d: U.m("⟨4⟩ ≅ Z₃") + " 是素数阶群，只有平凡子群，再也分不下去。" },
      { t: "合成因子 Z₂, Z₂, Z₃", d: "12 = 2 × 2 × 3：每一层的商都是素数阶的「单群」。换一条链（如 Z₁₂ ⊳ ⟨3⟩ ⊳ ⟨6⟩ ⊳ {0}）因子顺序可变，但因子的集合不变（若尔当–赫尔德定理）。" }
    ];
    return {
      titles: { struct: ["合成列", "Z₁₂ ⊳ ⟨2⟩ ⊳ ⟨4⟩ ⊳ {0}"], viz: ["逐层缩小的子群", "颜色 = 所在层"] },
      intro: "像把整数分解成素数一样，把群沿正规子群一层层「商」下去，直到每层都是单群。",
      steps: steps,
      struct: function (k) {
        return D.table(["层", "子群", "阶", "商群"], [0, 1, 2].map(function (i) {
          return [i + 1, U.m(names[i] + " ⊳ " + names[i + 1]), full[i].length + " → " + full[i + 1].length, i <= k ? U.m(i === 2 ? "Z₃" : "Z₂") : "…"];
        }), { rowCls: function (r) { return r === k ? "cur" : ""; } }) + (k >= 3 ? D.note("合成因子：" + U.m("Z₂, Z₂, Z₃") + "；阶的乘积 2·2·3 = 12。") : "");
      },
      viz: function (k) {
        var lvl = Math.min(Math.max(k + 1, 0), 3);
        var cls = U.range(12).map(function (x) { for (var i = lvl; i >= 1; i--) if (full[i].indexOf(x) >= 0) return ["", "on", "c3", "ok"][i]; return ""; });
        return D.ring({ labels: U.range(12).map(String), cls: cls, arrows: [], center: [names[lvl], "阶 " + full[lvl].length] });
      },
      verdict: { kind: "info", chip: "12 = 2·2·3", reason: "Z₁₂ 的合成因子为 Z₂、Z₂、Z₃，对应 12 的素因子分解。",
        insight: "单群是群的「素数」：有限单群分类定理把所有有限单群列成了清单，这是 20 世纪数学的一项集体成就。" }
    };
  }

  function simple(key) {
    var S = key === "a5" ? G.An(5) : G.Zadd(7), n = S.n;
    if (key === "z7") {
      var steps7 = U.range(7).map(function (a) { var H = sortN(S.powers(a)); return { t: "⟨" + a + "⟩ = " + (H.length === 1 ? "{0}" : H.length === 7 ? "Z₇" : U.set(H)), d: "阶 " + H.length + (a ? "：非零元都生成整个 Z₇" : "：平凡子群") + "。" }; });
      steps7.push({ t: "Z₇ 是单群", d: "7 是素数，由拉格朗日定理子群阶只能是 1 或 7，所以只有 {0} 与 Z₇ 两个正规子群。" });
      return {
        titles: { struct: ["全部子群", "|Z₇| = 7"], viz: ["生成轨道", "每个非零元都走遍全部"] },
        intro: "单群：除 {e} 和自身外没有别的正规子群。素数阶循环群是最简单的单群。",
        steps: steps7,
        struct: function (k) { return D.table(["a", "⟨a⟩"], U.range(7).map(function (a) { return [a, a <= k ? steps7[a].t.split(" = ")[1] : "…"]; }), { compact: true, rowCls: function (r) { return r === k ? "cur" : ""; } }); },
        viz: function (k) {
          var a = Math.max(0, Math.min(k, 6)), pw = S.powers(a), arrows = [];
          for (var i = 1; i <= pw.length && pw.length > 1; i++) arrows.push({ a: pw[i - 1], b: pw[i % pw.length], cls: "on" });
          return D.ring({ labels: U.range(7).map(String), cls: U.range(7).map(function (x) { return x === a ? "cur" : pw.indexOf(x) >= 0 ? "on" : ""; }), arrows: arrows, center: ["⟨" + a + "⟩", "阶 " + pw.length] });
        },
        verdict: { kind: "ok", chip: "单群", reason: "Z₇ 只有平凡正规子群，是单群；所有交换单群恰好是素数阶循环群。", insight: "非交换的单群要大得多：最小的是 60 阶的 A₅。" }
      };
    }
    /* A₅：共轭类 → 正规子群只能是共轭类之并 */
    var seen = {}, classes = [];
    for (var x = 0; x < n; x++) {
      if (seen[x]) continue;
      var cl = {};
      for (var g = 0; g < n; g++) cl[S.T[S.T[g][x]][S.inv(g)]] = 1;
      var list = Object.keys(cl).map(Number); list.forEach(function (y) { seen[y] = 1; });
      classes.push(list);
    }
    var sizes = classes.map(function (c) { return c.length; });
    var others = sizes.slice(1), sums = [];
    for (var mask = 0; mask < (1 << others.length); mask++) {
      var s = 1; others.forEach(function (z, i) { if (mask & (1 << i)) s += z; });
      if (60 % s === 0 && sums.indexOf(s) < 0) sums.push(s);
    }
    var desc = function (c) { var p = S.elems[c[0]]; return P.cycles(p).map(function (cy) { return cy.length; }).join("+") || "e"; };
    var steps = classes.map(function (c, i) { return { t: "共轭类 " + (i + 1) + "：" + c.length + " 个元素", d: "代表 " + U.m(S.lab(c[0])) + "（类型 " + desc(c) + "），与它共轭的元素共 " + c.length + " 个。" }; });
    steps.push({ t: "正规子群 = 若干共轭类之并", d: "正规子群对共轭封闭，必是含 {e} 的若干共轭类之并，且大小整除 60。可能的大小：1 + 子集和 ∈ " + U.m(U.set(sums)) + "。" });
    steps.push({ t: "A₅ 是单群", d: "只有 1 和 60 同时满足两个条件，所以 A₅ 的正规子群只有 {e} 和 A₅ 本身。" });
    return {
      titles: { struct: ["A₅ 的共轭类", "|A₅| = 60"], viz: ["类的大小", "1 + 15 + 20 + 12 + 12 = 60"] },
      intro: "A₅（S₅ 中 60 个偶置换）是最小的非交换单群。用「共轭类大小」这一计数论证来验证。",
      steps: steps,
      struct: function (k) {
        return D.table(["类", "代表", "类型", "大小"], classes.map(function (c, i) { return [i + 1, i <= k ? U.m(S.lab(c[0])) : "…", i <= k ? desc(c) : "", i <= k ? c.length : ""]; }), { rowCls: function (r) { return r === k ? "cur" : ""; } }) +
          (k >= classes.length ? D.note("含 {e} 的并的大小：" + U.m(U.set(sums)) + "（在 1…60 中整除 60 的只有这些）") : "");
      },
      viz: function (k) {
        var h = '<div class="gl-sets">';
        classes.forEach(function (c, i) {
          var w = Math.round(c.length / 20 * 100);
          h += '<div class="gl-set ' + (i <= k ? "c" + (i % 6) : "dim") + '"><b>类 ' + (i + 1) + '</b><span style="flex:1;min-width:80px;height:12px;border-radius:6px;background:rgba(116,55,31,.1);position:relative"><i style="position:absolute;left:0;top:0;bottom:0;width:' + w + '%;border-radius:6px;background:var(--c' + (i % 6) + ')"></i></span><em>' + c.length + "</em></div>";
        });
        return h + "</div>";
      },
      verdict: { kind: "ok", chip: "A₅ 是单群", reason: "共轭类大小为 " + U.m(sizes.join(", ")) + "；含 1 的部分和中整除 60 的只有 1 与 60。",
        insight: "A₅ 的单性是「五次及以上方程没有一般根式解」的群论根源（伽罗瓦理论）。" }
    };
  }

  var extend = {
    legend: [["[r]", "剩余类 r + nZ"], ["Z/nZ", "模 n 的商群"], ["⊳", "包含正规子群"], ["合成因子", "逐层商得的单群"], ["单群", "只有平凡正规子群"]],
    caseLabel: "选择主题",
    cases: [
      { label: "Z / nZ：模 n 的剩余类", params: [{ id: "n", label: "模数 n", type: "select", value: 5, options: [[3, "3"], [4, "4"], [5, "5"], [6, "6"]] }], build: function (p) { return zmodn(p.n); } },
      { label: "结构分解：Z₁₂ 的合成列", build: series },
      { label: "单群：Z₇ 与 A₅", params: [{ id: "g", label: "群", type: "select", value: "a5", options: [["a5", "A₅（60 阶）"], ["z7", "Z₇（素数阶）"]] }], build: function (p) { return simple(p.g); } }
    ]
  };

  GL.define({ basic: basic, advanced: advanced, extend: extend });
})();
