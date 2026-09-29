/* 10.4 特殊类型群（二）· 置换群 —— 三层模块（由 ../group-lab/group-lab.js 渲染）
 *   基础层：置换与轮换分解（逐个追踪 i → σ(i)，得到不相交轮换之积）
 *   进阶层：置换群运算（乘积 στ、阶 = 轮换长度的最小公倍数、奇偶性与交错群 A₄）
 *   拓展层：调度与魔方（完美洗牌的周期、15 数码的奇偶不变量）
 *   约定：στ 表示先作 τ 再作 σ（从右往左）。
 */
(function () {
  "use strict";
  var GL = window.GroupLab, U = GL.U, G = GL.G, D = GL.D, P = GL.P;
  var one = function (arr) { return arr.map(function (x) { return x - 1; }); };   // 1 起的像 → 0 起数组
  var cstr = function (c) { return P.cycleStr(c); };

  function permRing(p, cls, arrows, center, tags) {
    return D.ring({ labels: U.range(p.length).map(function (x) { return x + 1; }), cls: cls, arrows: arrows, center: center, tags: tags, height: 330 });
  }
  function fullRing(p, name) {
    var cyc = P.cycles(p, true), cls = [], arrows = [];
    cyc.forEach(function (c, ci) { c.forEach(function (x) { var k = c.length > 1 ? "c" + (ci % 6) : ""; cls[x] = k; arrows.push({ a: x, b: p[x], cls: c.length > 1 ? k : "dim" }); }); });
    return permRing(p, cls, arrows, [name, "阶 " + P.order(p)]);
  }

  /* ---------------- 基础层：轮换分解 ---------------- */
  var BP = { p1: [3, 4, 5, 2, 1, 6], p2: [2, 3, 1, 5, 4, 6], p3: [2, 1, 4, 3, 6, 5], p4: [4, 6, 1, 3, 2, 5], p5: [2, 3, 4, 5, 6, 1] };
  function decompose(key) {
    var p = one(BP[key]), n = p.length, seen = [], steps = [], cycles = [], trace = [];
    for (var i = 0; i < n; i++) {
      if (seen[i]) continue;
      var c = [], j = i;
      while (!seen[j]) {
        seen[j] = true; c.push(j);
        var nx = p[j];
        trace.push({ a: j, b: nx, ci: cycles.length });
        steps.push({ t: (j + 1) + " → " + (nx + 1), d: "σ(" + (j + 1) + ") = " + (nx + 1) + (nx === c[0] ? "，回到起点 " + (c[0] + 1) + "，得到轮换 " + U.m(cstr(c)) + (c.length === 1 ? "（不动点，通常省略）" : "") + "。" : "，继续追踪 " + (nx + 1) + "。"), ci: cycles.length, closed: nx === c[0], cyc: c.slice() });
        j = nx;
      }
      cycles.push(c);
    }
    var nontriv = cycles.filter(function (c) { return c.length > 1; });
    steps.push({ t: "σ = " + P.str(p), d: "把不相交轮换并排写出：" + U.m("σ = " + P.str(p)) + "；类型 " + U.m("[" + cycles.map(function (c) { return c.length; }).sort(function (a, b) { return b - a; }).join(",") + "]") + "。不相交轮换彼此可交换，写的顺序无关。" });
    return {
      titles: { struct: ["两行式 → 轮换式", "S" + U.sub(n)], viz: ["箭头图 i → σ(i)", "同色 = 同一轮换"] },
      intro: "置换 = 有限集到自身的双射。从最小的未访问元素出发，沿 i → σ(i) 走回起点，就得到一个轮换。",
      steps: steps,
      struct: function (k) {
        var done = steps.slice(0, k + 1).filter(function (s) { return s.closed; }).map(function (s) { return s.cyc; });
        return P.twoLine(p) + D.sets(done.map(function (c, i) { return { name: "轮换 " + (i + 1), body: cstr(c), cls: c.length > 1 ? "c" + (i % 6) : "dim", note: "长度 " + c.length }; })) +
          (k >= steps.length - 1 ? D.note("结果：" + U.m("σ = " + P.str(p)) + "，共 " + nontriv.length + " 个非平凡轮换。") : "");
      },
      viz: function (k) {
        var cls = U.range(n).map(function () { return ""; }), arrows = [];
        trace.forEach(function (t, i) {
          if (i > k) return;
          var col = "c" + (t.ci % 6);
          arrows.push({ a: t.a, b: t.b, cls: i === k ? "cur" : col });
          cls[t.a] = i === k ? "cur" : col;
        });
        return permRing(p, cls, arrows, ["σ", k >= steps.length - 1 ? P.str(p) : "追踪中"]);
      },
      verdict: { kind: "info", chip: "σ = " + P.str(p), reason: "任何置换都能唯一地（不计顺序）写成不相交轮换之积；本例两行式 " + U.m(BP[key].join(" ")) + " 对应 " + U.m(P.str(p)) + "。",
        insight: "轮换式一眼看出结构：谁和谁在「循环换位」、谁没动——这比两行式更利于计算阶与奇偶性。" }
    };
  }
  var basic = {
    legend: [["σ(i)", "i 的像"], ["(a b c)", "a→b→c→a 的轮换"], ["(a b)", "对换"], ["不动点", "σ(i)=i，轮换式中省略"], ['<i class="dot cur"></i>', "当前追踪的箭头"]],
    caseLabel: "选择置换（两行式第二行）",
    cases: Object.keys(BP).map(function (k) {
      return { label: "σ = " + BP[k].join(" "), build: function () { return decompose(k); } };
    })
  };

  /* ---------------- 进阶层 ---------------- */
  var S4P = { a: [[1, 2]], b: [[1, 2, 3]], c: [[1, 3], [2, 4]], d: [[1, 2, 3, 4]], e: [[2, 4]], f: [[1, 4, 3]] };
  var S4O = [["a", "(12)"], ["b", "(123)"], ["c", "(13)(24)"], ["d", "(1234)"], ["e", "(24)"], ["f", "(143)"]];
  function product(sk, tk) {
    var s = P.fromCycles(4, S4P[sk]), t = P.fromCycles(4, S4P[tk]), st = P.compose(s, t), ts = P.compose(t, s);
    var steps = U.range(4).map(function (x) {
      return { t: (x + 1) + " →τ " + (t[x] + 1) + " →σ " + (st[x] + 1), d: "先作 τ：" + U.m("τ(" + (x + 1) + ") = " + (t[x] + 1)) + "；再作 σ：" + U.m("σ(" + (t[x] + 1) + ") = " + (st[x] + 1)) + "。所以 " + U.m("στ(" + (x + 1) + ") = " + (st[x] + 1)) + "。" };
    });
    steps.push({ t: "στ = " + P.str(st), d: "整理成轮换式：" + U.m("στ = " + P.str(s) + "·" + P.str(t) + " = " + P.str(st)) + "。" });
    steps.push({ t: "τσ = " + P.str(ts), d: P.eq(st, ts) ? "本例 " + U.m("στ = τσ") + "，这两个置换可交换。" : "反过来 " + U.m("τσ = " + P.str(ts) + " ≠ στ") + "——置换乘法一般不交换。" });
    return {
      titles: { struct: ["逐点计算 στ", "σ = " + P.str(s) + "，τ = " + P.str(t)], viz: ["两步映射", "x → τ(x) → σ(τ(x))"] },
      intro: "置换乘积就是映射复合：στ(x) = σ(τ(x))，先作右边的 τ，再作左边的 σ。",
      steps: steps,
      struct: function (k) {
        var rows = U.range(4).map(function (x) { return [x + 1, k >= x ? t[x] + 1 : "…", k >= x ? "<b>" + (st[x] + 1) + "</b>" : "…"]; });
        return D.table(["x", "τ(x)", "σ(τ(x))"], rows, { rowCls: function (r) { return r === k ? "cur" : ""; } }) +
          (k >= 4 ? D.sets([{ name: "στ", body: P.str(st), cls: "ok" }, { name: "τσ", body: P.str(ts), cls: k >= 5 ? (P.eq(st, ts) ? "ok" : "bad") : "dim" }]) : "");
      },
      viz: function (k) {
        var x = Math.max(0, Math.min(k, 3));
        var L = [1, 2, 3, 4], lcls = L.map(function (_, i) { return i === x && k < 4 ? "cur" : ""; });
        var html = D.mapping({ L: L, R: L, map: t, titles: ["x", "τ(x)"], lcls: lcls, acls: t.map(function (_, i) { return i === x && k < 4 ? "cur" : "dim"; }), rcls: L.map(function (_, i) { return i === t[x] && k < 4 ? "on" : ""; }), boxW: 44 });
        html += D.mapping({ L: L, R: L, map: s, titles: ["τ(x)", "σ(τ(x))"], lcls: L.map(function (_, i) { return i === t[x] && k < 4 ? "on" : ""; }), acls: s.map(function (_, i) { return i === t[x] && k < 4 ? "cur" : "dim"; }), rcls: L.map(function (_, i) { return i === st[x] && k < 4 ? "ok" : ""; }), boxW: 44 });
        return html;
      },
      verdict: { kind: P.eq(st, ts) ? "ok" : "info", chip: "στ = " + P.str(st), reason: U.m("σ = " + P.str(s) + "，τ = " + P.str(t)) + "：" + U.m("στ = " + P.str(st)) + "，" + U.m("τσ = " + P.str(ts)) + "。",
        insight: "计算习惯因教材而异：有的书约定 στ 表示「先 σ 后 τ」。做题前先确认约定——本资源库统一采用「先右后左」。" }
    };
  }

  var ORD = { a: [[1, 2], [3, 4, 5]], b: [[1, 2, 3, 4], [5, 6]], c: [[1, 2, 3], [4, 5, 6, 7]], d: [[1, 2, 3, 4, 5, 6]], e: [[1, 2], [3, 4], [5, 6, 7]] };
  function orderLcm(key) {
    var cyc = ORD[key], n = key === "c" || key === "e" ? 7 : 6, s = P.fromCycles(n, cyc), m = P.order(s);
    var lens = cyc.map(function (c) { return c.length; });
    var steps = [], cur = s, pows = [s];
    for (var k = 1; k <= m; k++) {
      steps.push({ t: "σ" + U.sup(k) + " = " + P.str(cur), d: P.str(cur) === "e" ? U.ok("回到恒等置换") + "，所以 ord(σ) = " + k + "。" : "每个轮换各自转了 " + k + " 步；长度能整除 " + k + " 的轮换已复位：" + (lens.filter(function (l) { return k % l === 0; }).map(function (l) { return "长 " + l; }).join("、") || "暂无") + "。" });
      cur = P.compose(s, cur); pows.push(cur);
    }
    steps.push({ t: "ord(σ) = lcm(" + lens.join(", ") + ") = " + m, d: "长为 ℓ 的轮换每 ℓ 次复位一次；全部同时复位需要所有 ℓ 的公倍数，最小的就是 " + U.m("lcm(" + lens.join(", ") + ") = " + m) + "。" });
    return {
      titles: { struct: ["σ 的幂", "σ = " + P.str(s)], viz: ["σᵏ 的箭头图", "同色 = 同一轮换"] },
      intro: "反复作用 σ，直到回到恒等。每个轮换以自己的长度为周期复位。",
      steps: steps,
      struct: function (k) {
        var rows = U.range(m).map(function (i) { return [i + 1, i <= k ? U.m(P.str(pows[i])) : "…"]; });
        return D.table(["k", "σᵏ"], rows, { compact: true, rowCls: function (r) { return r === k ? "cur" : ""; } }) + D.note("轮换长度：" + U.m(lens.join(", ")));
      },
      viz: function (k) {
        var p = pows[Math.max(0, Math.min(k, m - 1))];
        return fullRing(p, k < 0 ? "σ" : "σ" + U.sup(Math.min(k + 1, m)));
      },
      verdict: { kind: "ok", chip: "ord(σ) = " + m, reason: U.m("σ = " + P.str(s)) + " 的阶为轮换长度的最小公倍数 " + U.m("lcm(" + lens.join(",") + ") = " + m) + "（不是乘积 " + lens.reduce(function (a, b) { return a * b; }, 1) + "，也不是和）。",
        insight: "轮值、排班、洗牌等周期性调度都可以写成置换：一个方案重复多少轮回到原状，就是它的阶。" }
    };
  }

  var PAR = { a: [[1, 2, 3, 4]], b: [[1, 2, 3], [4, 5]], c: [[1, 3, 5]], d: [[1, 2], [3, 4]], e: [[1, 2, 3, 4, 5]] };
  function parity(key) {
    var cyc = PAR[key], n = 5, s = P.fromCycles(n, cyc), steps = [], all = [];
    cyc.forEach(function (c) {
      var ts = [];
      for (var i = c.length; i >= 2; i--) ts.push("(" + c[0] + c[i - 1] + ")");
      all = all.concat(ts);
      steps.push({ t: cstr(c.map(function (x) { return x - 1; })) + " = " + ts.join(""), d: "长为 " + c.length + " 的轮换可写成 " + (c.length - 1) + " 个对换之积：" + U.m("(a₁…aₖ) = (a₁ aₖ)…(a₁ a₃)(a₁ a₂)") + "（从右往左作用）。" });
    });
    var t = all.length, even = t % 2 === 0;
    steps.push({ t: "共 " + t + " 个对换 → " + (even ? "偶置换" : "奇置换"), d: "对换个数的奇偶性与分解方式无关（逆序数的奇偶性不变）；" + U.m("σ = " + P.str(s)) + " 是" + (even ? U.ok("偶置换") : U.bad("奇置换")) + "，" + U.m("sgn σ = " + (even ? "+1" : "−1")) + "。" });
    var S4 = G.Sn(4), types = {}, tkeys;
    S4.elems.forEach(function (p) { var ty = P.cycles(p).map(function (c) { return c.length; }).sort().join("+") || "e"; (types[ty] = types[ty] || { n: 0, ev: P.even(p) }).n++; });
    tkeys = ["e", "2", "2+2", "3", "4"].filter(function (x) { return types[x]; });
    steps.push({ t: "交错群 A₄：12 个偶置换", d: "S₄ 按轮换类型分类：" + tkeys.map(function (ty) { return U.m(ty === "e" ? "e" : "[" + ty + "]") + "×" + types[ty].n + (types[ty].ev ? "（偶）" : "（奇）"); }).join("，") + "。偶置换恰好一半：" + U.m("|A₄| = 4!/2 = 12") + "，且在乘法下封闭。" });
    return {
      titles: { struct: ["分解为对换", "σ = " + P.str(s)], viz: ["σ 的轮换结构", "长 ℓ 的轮换 = ℓ−1 个对换"] },
      intro: "每个置换都能写成对换之积；对换个数的奇偶性是确定的，由此把置换分成奇、偶两类。",
      steps: steps,
      struct: function (k) {
        var h = D.sets(cyc.map(function (c, i) { return { name: cstr(c.map(function (x) { return x - 1; })), body: k >= i ? steps[i].t.split(" = ")[1] : "…", cls: k >= i ? "c" + (i % 6) : "dim", note: (c.length - 1) + " 个对换" }; }));
        if (k >= cyc.length) h += D.note("对换总数 " + U.m(t) + " → " + (even ? U.ok("偶置换") : U.bad("奇置换")));
        if (k >= cyc.length + 1) h += D.table(["类型", "个数", "奇偶"], tkeys.map(function (ty) { return [U.m(ty === "e" ? "e" : "[" + ty + "]"), types[ty].n, types[ty].ev ? U.ok("偶") : U.bad("奇")]; }), { compact: true });
        return h;
      },
      viz: function () { return fullRing(s, "σ"); },
      verdict: { kind: even ? "ok" : "bad", chip: even ? "偶置换 ∈ A₅" : "奇置换 ∉ A₅", reason: U.m("σ = " + P.str(s)) + " 可写成 " + t + " 个对换之积，是" + (even ? "偶" : "奇") + "置换；偶置换全体构成交错群 Aₙ，|Aₙ| = n!/2。",
        insight: "奇偶性是置换的「不变量」：无论怎样分解都改变不了。下面的拓展层会用它判断 15 数码与魔方的某些状态根本无法复原。" }
    };
  }

  var advanced = {
    legend: [["στ", "先 τ 后 σ"], ["lcm", "轮换长度的最小公倍数"], ["(a b)", "对换：只交换两个元素"], ["sgn", "偶置换 +1，奇置换 −1"], ["Aₙ", "交错群：全体偶置换"]],
    caseLabel: "选择运算",
    cases: [
      { label: "置换乘积 στ", params: [
          { id: "s", label: "σ", type: "select", value: "b", options: S4O },
          { id: "t", label: "τ", type: "select", value: "a", options: S4O }],
        build: function (p) { return product(p.s, p.t); } },
      { label: "置换的阶 = lcm", params: [{ id: "s", label: "σ", type: "select", value: "a", options: [["a", "(12)(345)"], ["b", "(1234)(56)"], ["c", "(123)(4567)"], ["e", "(12)(34)(567)"], ["d", "(123456)"]] }],
        build: function (p) { return orderLcm(p.s); } },
      { label: "奇偶性与交错群", params: [{ id: "s", label: "σ", type: "select", value: "b", options: [["a", "(1234)"], ["b", "(123)(45)"], ["c", "(135)"], ["d", "(12)(34)"], ["e", "(12345)"]] }],
        build: function (p) { return parity(p.s); } }
    ]
  };

  /* ---------------- 拓展层 ---------------- */
  function shuffle(n) {
    var h = n / 2, pi = U.range(n).map(function (i) { return i < h ? 2 * i : 2 * (i - h) + 1; });   // 位置 i 的牌洗后到 π(i)
    var m = P.order(pi), decks = [U.range(n)], steps = [];
    for (var k = 1; k <= m; k++) {
      var prev = decks[k - 1], nd = [];
      prev.forEach(function (card, i) { nd[pi[i]] = card; });
      decks.push(nd);
      steps.push({ t: "第 " + k + " 次洗牌", d: k === m ? U.ok("牌序完全复原") + "！" : "顶牌、底牌始终不动；其余牌按置换 π 移动。" });
    }
    var lens = P.cycles(pi).map(function (c) { return c.length; });
    steps.push({ t: "周期 = lcm(" + lens.join(", ") + ") = " + m, d: "位置置换 " + (n <= 12 ? U.m("π = " + P.str(pi)) : "π 共有 " + lens.length + " 个非平凡轮换") + "，阶为轮换长度的最小公倍数 " + m + "。" });
    var cardLab = function (c) { return String(c + 1); };
    return {
      titles: { struct: ["牌序变化", n + " 张牌 · 完美外洗"], viz: ["位置置换 π", "同色 = 同一轮换"] },
      intro: "完美外洗（out-shuffle）：把牌分成上下两半，严格交错合并，原顶牌仍在顶上。连续洗几次会回到原序？",
      steps: steps,
      struct: function (k) {
        var shown = decks.slice(0, Math.min(k + 2, decks.length));
        return '<div class="gl-sets">' + shown.map(function (d, i) {
          var cls = i === 0 ? "" : i === k + 1 ? "cur" : "";
          return '<div class="gl-set ' + (i === m ? "ok" : cls) + '"><b>' + (i === 0 ? "初始" : "第 " + i + " 次") + '</b><span class="gl-m" style="font-size:' + (n > 20 ? 11 : 13) + 'px;word-break:break-all">' + d.map(cardLab).join(" ") + "</span></div>";
        }).join("") + "</div>";
      },
      viz: function () {
        if (n > 26) {
          return D.table(["轮换长度", "个数"], Object.entries(lens.reduce(function (o, l) { o[l] = (o[l] || 0) + 1; return o; }, {})).map(function (e) { return [e[0], e[1]]; }), { compact: true }) +
            D.note("52 张牌除顶、底两张外分成若干轮换，长度的最小公倍数即周期。");
        }
        return fullRing(pi, "π");
      },
      verdict: { kind: "ok", chip: m + " 次复原", reason: n + " 张牌的完美外洗是一个置换，阶为 " + U.m(m) + "：连续洗 " + m + " 次，牌序回到初始状态。",
        insight: "「越洗越乱」并不绝对：完全规则的洗法是一个确定的置换，重复有限次必定复原——所以魔术师能「洗」出预定顺序，真正的随机需要不规则性。" }
    };
  }

  function fifteen(key) {
    var goal = U.range(15, 1);
    var st = { swap: goal.slice(0, 13).concat([15, 14]), three: goal.slice(0, 12).concat([15, 13, 14]),
      four: [2, 1].concat(goal.slice(2, 12), [14, 13, 15]) }[key];
    var p = st.map(function (v) { return v - 1; });            // 位置 i 上是第 p[i]+1 号牌
    var cyc = P.cycles(p), t = P.transCount(p), even = t % 2 === 0;
    var steps = [
      { t: "把局面看成置换", d: "空格在右下角时，第 i 格放着 " + U.m("st(i)") + " 号牌，这是 {1,…,15} 上的置换：" + U.m(P.str(p)) + "。" },
      { t: "分解为对换", d: cyc.length ? cyc.map(function (c) { return U.m(cstr(c)) + " = " + (c.length - 1) + " 个对换"; }).join("，") + "，共 " + U.m(t) + " 个。" : "恒等置换，0 个对换。" },
      { t: "每滑一次 = 与空格对换", d: "把空格看成第 16 号牌，每次滑动都是一个对换。空格从右下角出发又回到右下角，横向、纵向各走偶数步，所以总步数为偶数。" },
      { t: "不变量：偶置换", d: "于是空格归位时，15 块牌的置换必须是偶置换。本局面是" + (even ? U.ok("偶置换") + "——满足必要条件（实际上也可解）。" : U.bad("奇置换") + "——无论怎么滑都复原不了！") }
    ];
    return {
      titles: { struct: ["15 数码局面", "空格在右下角"], viz: ["牌的置换", "同色 = 同一轮换"] },
      intro: "经典的「14–15 难题」：只把 14、15 两块对调，能滑回原位吗？用置换的奇偶性回答。",
      steps: steps,
      struct: function (k) {
        var cells = st.concat([0]), moved = {};
        cyc.forEach(function (c) { c.forEach(function (x) { moved[x] = 1; }); });
        var rows = [0, 1, 2, 3].map(function (r) { return [0, 1, 2, 3].map(function (c) { var i = r * 4 + c, v = cells[i]; return v ? (k >= 0 && moved[i] ? "<b>" + v + "</b>" : v) : "□"; }); });
        return D.table(["", "", "", ""].map(function (_, i) { return "列" + (i + 1); }), rows, { cls: function (r, c) { var i = r * 4 + c; return i < 15 && moved[i] && k >= 0 ? (even ? "ok" : "bad") : ""; } });
      },
      viz: function () {
        var sub = [], idx = [];
        cyc.forEach(function (c) { c.forEach(function (x) { idx.push(x); }); });
        if (!idx.length) return D.note("已是目标局面。");
        idx.sort(function (a, b) { return a - b; });
        var local = idx.map(function (x) { return idx.indexOf(p[x]); });
        var cls = [], arrows = [];
        P.cycles(local, true).forEach(function (c, ci) { c.forEach(function (x) { cls[x] = "c" + (ci % 6); arrows.push({ a: x, b: local[x], cls: "c" + (ci % 6) }); }); });
        return D.ring({ labels: idx.map(function (x) { return x + 1; }), cls: cls, arrows: arrows, center: ["涉及的格", t + " 个对换"], height: 300 });
      },
      verdict: { kind: even ? "ok" : "bad", chip: even ? "可以复原" : "不可能复原", reason: "局面置换含 " + t + " 个对换，是" + (even ? "偶" : "奇") + "置换。空格归位要求偶置换，所以" + (even ? "它满足可解条件（对 15 数码，这一条件也是充分的）。" : "这个局面永远无法滑回原位。"),
        insight: "魔方同理：角块与棱块的置换奇偶必须一致，因此「只交换两个角块、其余不动」的状态不可能出现。找到不变量，就能判定「做不到」。" }
    };
  }

  var extend = {
    legend: [["π", "一次洗牌对应的位置置换"], ["ord(π)", "复原所需的次数"], ["□", "15 数码的空格"], ["奇/偶", "对换个数的奇偶"], ["不变量", "任何操作都不改变的量"]],
    caseLabel: "选择场景",
    cases: [
      { label: "完美洗牌的周期", params: [{ id: "n", label: "牌数", type: "select", value: 8, options: [[8, "8 张"], [10, "10 张"], [12, "12 张"], [52, "52 张（一副扑克）"]] }],
        build: function (p) { return shuffle(p.n); } },
      { label: "15 数码的奇偶性", params: [{ id: "k", label: "局面", type: "select", value: "swap", options: [["swap", "只对调 14、15"], ["three", "13、14、15 轮换"], ["four", "对调 1、2 与 13、14"]] }],
        build: function (p) { return fifteen(p.k); } }
    ]
  };

  GL.define({ basic: basic, advanced: advanced, extend: extend });
})();
