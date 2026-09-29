/* 10.3 群同态和同构 —— 三层模块（由 ../group-lab/group-lab.js 渲染）
 *   基础层：群同态判定（逐行验证 f(a∘b)=f(a)∘f(b)，识别单/满/同构）
 *   进阶层：核与像（Ker、Im、Ker 正规、陪集 ↔ 像点、同态基本定理 G/Ker ≅ Im）
 *   拓展层：商与编码（奇偶校验映射、校验子映射与译码、取模压缩）
 */
(function () {
  "use strict";
  var GL = window.GroupLab, U = GL.U, G = GL.G, D = GL.D, P = GL.P;

  function Sign() { return G.Struct("{+1, −1}", [1, -1], function (a, b) { return a * b; }, { sym: "×", label: function (v) { return v > 0 ? "+1" : "−1"; } }); }
  function Zp(m, n) {
    var el = []; for (var a = 0; a < m; a++) for (var b = 0; b < n; b++) el.push([a, b]);
    return G.Struct("Z" + U.sub(m) + "×Z" + U.sub(n), el, function (x, y) { return [(x[0] + y[0]) % m, (x[1] + y[1]) % n]; },
      { key: function (x) { return x.join(); }, label: function (x) { return "(" + x.join(",") + ")"; }, sym: "+", additive: true });
  }
  /* 由原值映射构造下标映射 */
  function mapOf(S, T, fn) { return U.range(S.n).map(function (i) { return T.indexOf(fn(S.elems[i])); }); }

  /* ---------------- 基础层：同态判定 ---------------- */
  var HOMS = {
    m3: { S: function () { return G.Zadd(6); }, T: function () { return G.Zadd(3); }, fn: function (x) { return x % 3; }, name: "f(x) = x mod 3" },
    d2: { S: function () { return G.Zadd(4); }, T: function () { return G.Zadd(4); }, fn: function (x) { return 2 * x % 4; }, name: "f(x) = 2x mod 4" },
    m4: { S: function () { return G.Zadd(6); }, T: function () { return G.Zadd(4); }, fn: function (x) { return x % 4; }, name: "f(x) = x mod 4" },
    ex: { S: function () { return G.Zadd(4); }, T: function () { return G.U(5); }, fn: function (x) { return U.powmod(2, x, 5); }, name: "f(x) = 2ˣ mod 5" },
    sh: { S: function () { return G.Zadd(3); }, T: function () { return G.Zadd(3); }, fn: function (x) { return (x + 1) % 3; }, name: "f(x) = x + 1 mod 3" }
  };
  function homCheck(key) {
    var h = HOMS[key], S = h.S(), T = h.T(), f = mapOf(S, T, h.fn), n = S.n;
    var fail = {}, firstFail = null;
    U.range(n).forEach(function (a) {
      fail[a] = U.range(n).filter(function (b) { return f[S.T[a][b]] !== T.T[f[a]][f[b]]; });
      if (fail[a].length && !firstFail) firstFail = [a, fail[a][0]];
    });
    var hom = !firstFail, img = U.range(T.n).filter(function (y) { return f.indexOf(y) >= 0; });
    var inj = new Set(f).size === n, sur = img.length === T.n;
    var steps = [{ t: "写出映射 " + h.name, d: U.range(n).map(function (x) { return U.m("f(" + S.lab(x) + ")=" + T.lab(f[x])); }).join("，") + "。" }];
    U.range(n).forEach(function (a) {
      var bad = fail[a];
      steps.push({ t: "a = " + S.lab(a) + "：f(a" + S.sym + "b) = f(a)" + T.sym + "f(b)？",
        d: bad.length ? "反例 b = " + S.lab(bad[0]) + "：" + U.m("f(" + S.lab(a) + S.sym + S.lab(bad[0]) + ") = f(" + S.lab(S.T[a][bad[0]]) + ") = " + T.lab(f[S.T[a][bad[0]]])) + "，但 " +
          U.m("f(" + S.lab(a) + ")" + T.sym + "f(" + S.lab(bad[0]) + ") = " + T.lab(f[a]) + T.sym + T.lab(f[bad[0]]) + " = " + T.lab(T.T[f[a]][f[bad[0]]])) + "，" + U.bad("不相等") + "。"
          : "对全部 " + n + " 个 b 都成立 " + U.ok("✓") + "。" });
    });
    steps.push({ t: "单位元与逆元", d: U.m("f(" + S.lab(S.e) + ") = " + T.lab(f[S.e])) + (f[S.e] === T.e ? "，恰为 G′ 的单位元 " + U.ok("✓") : "，而 G′ 的单位元是 " + U.m(T.lab(T.e)) + "，" + U.bad("单位元没有保持") + "——必然不是同态") + "。" +
      (hom ? "同态总有 " + U.m("f(a⁻¹) = f(a)⁻¹") + "。" : "") });
    var kind = hom ? (inj && sur ? "同构" : inj ? "单同态" : sur ? "满同态" : "同态") : "不是同态";
    return {
      titles: { struct: ["保运算检验表", "行 a、列 b：f(a" + S.sym + "b) 与 f(a)" + T.sym + "f(b)"], viz: ["映射图 " + h.name, S.name + " → " + T.name] },
      intro: "同态要求「先算后映 = 先映后算」：f(a∘b) = f(a)∘′f(b)。点「下一步」逐行检验。",
      steps: steps,
      struct: function (k) {
        var rows = U.range(n).map(function (a) {
          return [U.m(S.lab(a))].concat(U.range(n).map(function (b) { return k >= a + 1 ? (fail[a].indexOf(b) >= 0 ? "✗" : "✓") : "·"; }));
        });
        return D.table([S.sym].concat(U.range(n).map(S.lab)), rows, { compact: true,
          rowCls: function (r) { return r + 1 === k ? "cur" : ""; },
          cls: function (r, c) { if (c === 0 || k < r + 1) return ""; return fail[r].indexOf(c - 1) >= 0 ? "bad" : "ok"; } }) +
          D.note("f 的取值：" + U.range(n).map(function (x) { return U.m(S.lab(x) + "↦" + T.lab(f[x])); }).join("　"));
      },
      viz: function (k) {
        var a = k >= 1 && k <= n ? k - 1 : -1, b = a >= 0 && fail[a].length ? fail[a][0] : -1;
        var acls = U.range(n).map(function (x) { return x === a ? "cur" : ""; });
        var lcls = U.range(n).map(function (x) { return x === a ? "cur" : x === b ? "on" : x === S.e && k === n + 1 ? "on" : ""; });
        var rcls = U.range(T.n).map(function (y) { return f.indexOf(y) < 0 ? "dim" : ""; });
        if (b >= 0) { acls[S.T[a][b]] = "bad"; lcls[S.T[a][b]] = "bad"; rcls[T.T[f[a]][f[b]]] = "on"; }
        if (k === n + 1) { rcls[T.e] = "ok"; acls[S.e] = f[S.e] === T.e ? "ok" : "bad"; }
        return D.mapping({ L: U.range(n).map(S.lab), R: U.range(T.n).map(T.lab), map: f, lcls: lcls, rcls: rcls, acls: acls, titles: [S.name, T.name], boxW: 58 });
      },
      verdict: { kind: hom ? "ok" : "bad", chip: kind, reason: hom ? h.name + " 保持运算：" + U.m(S.name + " → " + T.name) + (inj ? "，是单射" : "，不是单射") + (sur ? "、是满射" : "、不是满射") + "。" + (kind === "同构" ? "它是同构，两个群「形异质同」。" : "")
          : "存在 a, b 使 " + U.m("f(a" + S.sym + "b) ≠ f(a)" + T.sym + "f(b)") + "（见第 " + (firstFail[0] + 2) + " 步），所以 " + h.name + " 不是同态。",
        insight: key === "ex" ? "指数映射把「加法」变成「乘法」：2^(a+b) = 2^a · 2^b——对数表、计算尺正是利用了这种同构。" : key === "m4" ? "Z₆ → Z₄ 的「取余」不保持运算：6 不是 4 的倍数，模 6 相等的数模 4 可能不等。" : "同态像保持群的「运算骨架」，映射前后的计算可以相互换算。" }
    };
  }

  var basic = {
    legend: [["f(ab)", "先运算，再映射"], ["f(a)f(b)", "先映射，再运算"], ["单同态", "同态 + 单射"], ["满同态", "同态 + 满射"], ["≅", "同构：同态 + 双射"]],
    caseLabel: "选择映射",
    cases: [
      { label: "Z₆ → Z₃，x mod 3", build: function () { return homCheck("m3"); } },
      { label: "Z₄ → Z₄，2x mod 4", build: function () { return homCheck("d2"); } },
      { label: "Z₄ → U(5)，2ˣ mod 5", build: function () { return homCheck("ex"); } },
      { label: "Z₆ → Z₄，x mod 4（反例）", build: function () { return homCheck("m4"); } },
      { label: "Z₃ → Z₃，x + 1（反例）", build: function () { return homCheck("sh"); } }
    ]
  };

  /* ---------------- 进阶层 / 拓展层：核与像 ---------------- */
  function kerIm(S, T, f, o) {
    o = o || {};
    var n = S.n, K = U.range(n).filter(function (x) { return f[x] === T.e; });
    var img = U.range(T.n).filter(function (y) { return f.indexOf(y) >= 0; });
    var cos = S.cosets(K), normal = S.isNormal(K);
    var cosCls = function (x) { return "c" + (cos.cls[x] % 6); };
    var cName = function (a) { return S.additive ? S.lab(a) + " + K" : S.lab(a) + "K"; };
    var steps = [
      { t: "计算每个 f(x)", d: U.range(n).map(function (x) { return U.m(S.lab(x) + "↦" + T.lab(f[x])); }).join("，") + "。" },
      { t: "核 Ker f = " + S.set(K), d: "映到 G′ 单位元 " + U.m(T.lab(T.e)) + " 的全体元素：" + U.m("Ker f = " + S.set(K)) + "，|Ker f| = " + K.length + "。" },
      { t: "像 Im f = " + T.set(img), d: "所有像点：" + U.m("Im f = " + T.set(img)) + "，|Im f| = " + img.length + (img.length === T.n ? "，f 是满射。" : "，是 G′ 的子群但不是全部。") },
      { t: "Ker f 是正规子群", d: S.abelian() ? "G 是交换群，任何子群都是正规子群。" : "逐个 g 检验 " + U.m("gKg⁻¹ = K") + "：" + U.range(n).map(function (g) { return U.m(S.lab(g)) + (S.conj(g, K).join() === K.join() ? "✓" : "✗"); }).join(" ") + "。一般地 " + U.m("f(gkg⁻¹) = f(g)e′f(g)⁻¹ = e′") + "。" },
      { t: "陪集 ↔ 像点", d: cos.list.map(function (c, i) { return U.m(cName(cos.reps[i]) + " = " + S.set(c)) + " ↦ " + U.m(T.lab(f[c[0]])); }).join("；") + "——同一陪集的元素像相同，不同陪集像不同。" },
      { t: "同态基本定理", d: U.m("|G| / |Ker f| = " + n + " / " + K.length + " = " + n / K.length + " = |Im f|") + "，且 " + U.m("G/Ker f ≅ Im f") + "（aK ↦ f(a)）。" }
    ];
    if (o.extraSteps) steps = steps.concat(o.extraSteps);
    return {
      titles: { struct: [o.structTitle || "核、像与陪集", S.name + " → " + T.name], viz: [o.vizTitle || "映射图", "先绿 = 核；后同色 = 同一陪集"] },
      intro: o.intro || "同态把 G「压缩」到 Im f：被压成单位元的部分就是核，压缩的倍数恰好是 |Ker f|。",
      steps: steps,
      struct: function (k) {
        var h = "";
        if (k >= 1) h += D.sets([{ name: "Ker f", body: S.set(K), cls: "ok", note: "|Ker| = " + K.length }]);
        if (k >= 2) h += D.sets([{ name: "Im f", body: T.set(img), cls: "on", note: "|Im| = " + img.length }]);
        if (k >= 4) h += '<div class="gl-subhead" style="margin-top:10px">Ker f 的陪集</div>' + D.sets(cos.list.map(function (c, i) {
          return { name: cName(cos.reps[i]), body: S.set(c) + " ↦ " + T.lab(f[c[0]]), cls: "c" + (i % 6) };
        }));
        if (k >= 5) h += D.note("基本定理：" + U.m("G/Ker f ≅ Im f") + "，" + U.m(n + " = " + K.length + " × " + img.length) + "。");
        if (o.extraStruct) h += o.extraStruct(k, steps.length - (o.extraSteps || []).length);
        return h || D.note("点「下一步」，先计算每个元素的像。") + D.table(["x"].concat(U.range(n).map(S.lab)), [["f(x)"].concat(U.range(n).map(function (x) { return k >= 0 ? U.m(T.lab(f[x])) : "?"; }))], { compact: true });
      },
      viz: function (k) {
        var lcls = U.range(n).map(function (x) { return k >= 4 ? cosCls(x) : k >= 1 && K.indexOf(x) >= 0 ? "ok" : ""; });
        var acls = U.range(n).map(function (x) { return k >= 4 ? cosCls(x) : k >= 1 && K.indexOf(x) >= 0 ? "ok" : k >= 0 ? "" : "dim"; });
        var rcls = U.range(T.n).map(function (y) { return k >= 2 && f.indexOf(y) < 0 ? "dim" : y === T.e && k >= 1 ? "ok" : k >= 4 && f.indexOf(y) >= 0 ? cosCls(f.indexOf(y)) : ""; });
        if (o.vizHook) { var r = o.vizHook(k, lcls, rcls, acls); if (r) return r; }
        return D.mapping({ L: U.range(n).map(S.lab), R: U.range(T.n).map(T.lab), map: k >= 0 ? f : [], lcls: lcls, rcls: rcls, acls: acls, titles: [S.name, T.name], boxW: o.boxW || 62 });
      },
      verdict: { kind: "ok", chip: K.length === 1 ? (img.length === T.n ? "同构" : "单同态") : "G/Ker ≅ Im", reason: "Ker f = " + U.m(S.set(K)) + "（" + (normal ? "正规子群" : "?") + "），Im f = " + U.m(T.set(img)) + "，" + U.m(S.name + "/Ker f ≅ Im f") + (K.length === 1 ? "；核只有单位元 ⇔ f 是单射。" : "。"),
        insight: o.insight || "核刻画了「映射丢失了什么信息」，像刻画了「保留了什么」；二者满足 |G| = |Ker f|·|Im f|。" }
    };
  }

  var KI = {
    sgn: function () {
      var S = G.S3(), T = Sign(), f = mapOf(S, T, function (p) { return P.even(p) ? 1 : -1; });
      return kerIm(S, T, f, { insight: "符号映射 sgn 把偶置换映到 +1、奇置换映到 −1，核是交错群 A₃ = {e,(123),(132)}——它是 S₃ 的正规子群，S₃/A₃ ≅ Z₂。" });
    },
    z12: function () { var S = G.Zadd(12), T = G.Zadd(12); return kerIm(S, T, mapOf(S, T, function (x) { return 3 * x % 12; }), { insight: "f(x) = 3x 把 Z₁₂「压缩」成 3 的倍数 {0,3,6,9}，被压成 0 的是 {0,4,8}；12 = 3 × 4。" }); },
    crt: function () {
      var S = G.Zadd(6), T = Zp(2, 3);
      return kerIm(S, T, mapOf(S, T, function (x) { return [x % 2, x % 3]; }), { boxW: 66,
        insight: "x ↦ (x mod 2, x mod 3) 是同构 Z₆ ≅ Z₂×Z₃——这正是中国剩余定理：互素模数下「余数组」唯一确定原数。" });
    }
  };
  var advanced = {
    legend: [["Ker f", "{x | f(x) = e′}"], ["Im f", "{f(x) | x ∈ G}"], ["aK", "核的陪集（同色）"], ["G/Ker≅Im", "同态基本定理"], ["sgn", "置换的符号 ±1"]],
    caseLabel: "选择同态",
    cases: [
      { label: "符号映射 sgn：S₃ → {±1}", build: KI.sgn },
      { label: "Z₁₂ → Z₁₂，x ↦ 3x", build: KI.z12 },
      { label: "Z₆ → Z₂×Z₃（中国剩余定理）", build: KI.crt }
    ]
  };

  /* 拓展层 */
  function parityMap() {
    var S = G.Z2k(3), T = G.Z2k(1, "Z₂");
    return kerIm(S, T, mapOf(S, T, function (v) { return U.weight(v) & 1; }), {
      structTitle: "奇偶校验映射", vizTitle: "Z₂³ → Z₂：数 1 的个数的奇偶",
      intro: "f(x₁x₂x₃) = x₁⊕x₂⊕x₃ 是群同态；它的核——全体偶重串——正是偶校验码。",
      insight: "线性码可以看成「校验映射的核」：码字 = 通过校验的串。接收串若不在核中（f(r)=1），就知道出了错。" });
  }
  function syndromeMap(r) {
    var S = G.Z2k(3), T = G.Z2k(2, "Z₂²");
    var syn = function (v) { var b = U.bits(v, 3); return ((+b[0] ^ +b[1]) << 1) | (+b[1] ^ +b[2]); };
    var f = mapOf(S, T, syn), s = syn(r);
    var leaders = { 0: 0, 2: 4, 3: 2, 1: 1 };               // 校验子 → 陪集首（最低重量）
    var e = leaders[s], c = r ^ e;
    var extra = [{ t: "译码：收到 r = " + U.bits(r, 3), d: "校验子 " + U.m("s = (r₁⊕r₂, r₂⊕r₃) = " + U.bits(s, 2)) + "，它标记 r 所在的陪集；该陪集重量最小的元素（陪集首）" + U.m("e = " + U.bits(e, 3)) + "，纠正为 " + U.m("c = r ⊕ e = " + U.bits(c, 3)) + "。" }];
    return kerIm(S, T, f, {
      structTitle: "校验子映射 s = Hrᵀ", vizTitle: "Z₂³ → Z₂²",
      intro: "重复码 C = {000, 111} 是校验子映射 s(r) = (r₁⊕r₂, r₂⊕r₃) 的核；每个校验子对应核的一个陪集。",
      extraSteps: extra,
      extraStruct: function (k, base) {
        if (k < base) return "";
        return '<div class="gl-subhead" style="margin-top:10px">译码</div>' + D.sets([
          { name: "收到 r", body: U.bits(r, 3), cls: "cur" }, { name: "校验子 s", body: U.bits(s, 2), cls: "on" },
          { name: "陪集首 e", body: U.bits(e, 3), cls: e ? "bad" : "ok" }, { name: "译码 c", body: U.bits(c, 3), cls: "ok", note: "∈ Ker = C" }]);
      },
      insight: "「综合征译码」就是同态基本定理的工程版本：G/C ≅ Im s，查校验子即知陪集，再减去陪集首。10.5 拓展层与 10.7 案例把它推广到汉明码。" });
  }
  var extend = {
    legend: [["⊕", "按位异或（Z₂ 上加法）"], ["Ker", "通过校验的码字"], ["s(r)", "校验子 = 陪集标签"], ["陪集首", "陪集中重量最小者"], ["mod", "取模压缩"]],
    caseLabel: "选择场景",
    cases: [
      { label: "奇偶校验映射 Z₂³ → Z₂", build: parityMap },
      { label: "校验子映射与译码", params: [{ id: "r", label: "收到的串 r", type: "select", value: 5, options: U.range(8).map(function (v) { return [v, U.bits(v, 3)]; }) }],
        build: function (p) { return syndromeMap(p.r); } },
      { label: "取模压缩 Z₁₂ → Z₄", build: function () {
        var S = G.Zadd(12), T = G.Zadd(4);
        return kerIm(S, T, mapOf(S, T, function (x) { return x % 4; }), { structTitle: "取余映射", vizTitle: "x ↦ x mod 4",
          intro: "因为 4 整除 12，「只保留模 4 的余数」是同态：信息被压缩，但加法结构完整保留。",
          insight: "压缩要「保结构」才能在压缩后继续计算：对和先取余与对余数求和再取余结果相同——哈希校验、校验和都用到这一点。" }); } }
    ]
  };

  GL.define({ basic: basic, advanced: advanced, extend: extend });
})();
