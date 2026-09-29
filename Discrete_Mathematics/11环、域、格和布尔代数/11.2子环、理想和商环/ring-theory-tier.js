/* =====================================================================
 * 11.2 子环、理想和商环 —— 基础层 / 拓展层 场景（由 ../ch11-engine.js 驱动）
 *   基础层：在 ℤ₁₂ 中用子环判定定理（非空 + 减法封闭 + 乘法封闭）检验候选子集
 *   拓展层：商环构造——ℤ/nℤ 与 ℤ₂[x]/(p(x))：陪集划分 → 代表元运算良定义 → 零因子 → 极大理想与域
 * ===================================================================== */
(function () {
  "use strict";
  var H = CH11.H, range = CH11.range, mod = CH11.mod, esc = CH11.esc;
  var N = 12;

  /* ---------- 基础层：子环判定 ---------- */
  function firstBad(S, f) {
    for (var i = 0; i < S.length; i++) for (var j = 0; j < S.length; j++) {
      var v = f(S[i], S[j]); if (S.indexOf(v) < 0) return [S[i], S[j], v];
    }
    return null;
  }
  function judge(S) {
    return {
      has0: S.indexOf(0) >= 0,
      sub: firstBad(S, function (a, b) { return mod(a - b, N); }),
      mul: firstBad(S, function (a, b) { return mod(a * b, N); })
    };
  }
  function circlePos() {
    var pos = {};
    range(N).forEach(function (a) { var t = -Math.PI / 2 + a * 2 * Math.PI / N; pos[a] = [360 + 145 * Math.cos(t), 205 + 145 * Math.sin(t)]; });
    return pos;
  }
  var basic = {
    stepTitle: "四步子环判定",
    stepHint: "逐条检查判定定理的条件，出现反例立即定位",
    mission: "在模 12 剩余类环 ℤ₁₂ 中挑一个子集 S，用子环判定定理检验：S 非空、对减法封闭（a−b ∈ S）、对乘法封闭（ab ∈ S）——三条都满足，S 就是 ℤ₁₂ 的子环。",
    badge: "ℤ₁₂ · 子环判定定理",
    caseLabel: "选择候选子集 S",
    cases: [
      { label: "S = {0, 3, 6, 9}", S: [0, 3, 6, 9] },
      { label: "S = {0, 4, 8}", S: [0, 4, 8] },
      { label: "S = {0, 2, 4, 6, 8, 10}", S: [0, 2, 4, 6, 8, 10] },
      { label: "S = {0, 1, 2, 3}", S: [0, 1, 2, 3] },
      { label: "S = {0, 3, 6}", S: [0, 3, 6] },
      { label: "S = {1, 5, 7, 11}（可逆元）", S: [1, 5, 7, 11] }
    ],
    steps: [
      { t: "非空含零", s: "0 ∈ S", tok: 0 },
      { t: "减法封闭", s: "a − b ∈ S", tok: 1 },
      { t: "乘法封闭", s: "a · b ∈ S", tok: 2 },
      { t: "子环结论", s: "判定定理", tok: 3 }
    ],
    tokens: ["0 ∈ S", "a−b ∈ S", "ab ∈ S", "S ≤ R"],
    legend: [["cur", "S 中元素"], ["norm", "R 中其余元素"], ["ok", "运算结果 ∈ S"], ["bad", "结果 ∉ S（反例）"]],
    title: function (st) { return st.c.label + " ⊆ ℤ₁₂"; },
    sub: function (st) {
      return ["子环首先要是非空子集；由减法封闭可推出 0 = a − a ∈ S，所以不含 0 的子集一定不是子环。",
        "减法封闭 ⇔ ⟨S,+⟩ 是加法子群。下表列出 S 中所有 a − b（mod 12），红色格表示结果落到了 S 外。",
        "乘法封闭：S 中任意两元之积仍在 S 中。",
        "子环判定定理：S 非空，且 ∀a,b ∈ S 有 a − b ∈ S、ab ∈ S ⇔ S 是子环。"][st.step];
    },
    draw: function (st) {
      var S = st.c.S, J = judge(S), pos = circlePos(), s = "";
      var bad = st.step === 1 ? J.sub : st.step === 2 ? J.mul : null;
      s += '<circle cx="360" cy="205" r="145" fill="none" stroke="rgba(116,55,31,.18)" stroke-width="2" stroke-dasharray="4 6"/>';
      if (S.length > 2) s += '<polygon points="' + S.map(function (a) { return pos[a].join(","); }).join(" ") + '" fill="rgba(255,180,0,.12)" stroke="#e0a100" stroke-width="2.2"/>';
      if (bad) {
        s += H.arrow(pos[bad[0]][0], pos[bad[0]][1], pos[bad[2]][0], pos[bad[2]][1], "bad", 21);
      }
      range(N).forEach(function (a) {
        var k = S.indexOf(a) >= 0 ? "cur" : "norm";
        if (bad && a === bad[2]) k = "bad";
        s += H.node(pos[a][0], pos[a][1], a, k, 20);
      });
      var msg = st.step === 0 ? (J.has0 ? "0 ∈ S ✓" : "0 ∉ S ✗ —— 不可能是子环") :
        st.step === 1 ? (J.sub ? "反例：" + bad[0] + " − " + bad[1] + " = " + bad[2] + " ∉ S" : "所有 a − b 都在 S 中 ✓") :
        st.step === 2 ? (J.mul ? "反例：" + bad[0] + " · " + bad[1] + " = " + bad[2] + " ∉ S" : "所有 a · b 都在 S 中 ✓") :
        (isSub(J) ? "S 是 ℤ₁₂ 的子环" : "S 不是 ℤ₁₂ 的子环");
      s += H.text(360, 395, msg, { size: 16, weight: 800, color: /✗|反例|不是/.test(msg) ? "#c0392b" : "#2f7d57" });
      var tbl = "";
      if (st.step === 1 || st.step === 2) {
        var f = st.step === 1 ? function (a, b) { return mod(a - b, N); } : function (a, b) { return mod(a * b, N); };
        tbl = '<div class="tbl-row">' + H.table(S, f, function (a, b, v) { return S.indexOf(v) >= 0 ? "okc" : "badc"; }, st.step === 1 ? "S 内的 a − b（行 a，列 b）" : "S 内的 a · b", st.step === 1 ? "−" : "·") + "</div>";
      }
      return H.svg(s, 720, 415) + tbl;
    },
    feedback: function (st) {
      var J = judge(st.c.S);
      return [
        "<b>非空含零</b>：" + (J.has0 ? "0 ∈ S，继续检查。" : "S 不含 0，<span class=\"bad\">直接否定</span>——子环必含加法零元。"),
        "<b>减法封闭</b>：" + (J.sub ? "<span class=\"bad\">" + J.sub[0] + " − " + J.sub[1] + " ≡ " + J.sub[2] + " ∉ S</span>，⟨S,+⟩ 不是子群。" : "<span class=\"ok\">全部成立</span>，⟨S,+⟩ 是 ⟨ℤ₁₂,+⟩ 的子群。"),
        "<b>乘法封闭</b>：" + (J.mul ? "<span class=\"bad\">" + J.mul[0] + " · " + J.mul[1] + " ≡ " + J.mul[2] + " ∉ S</span>。" : "<span class=\"ok\">全部成立</span>。"),
        "<b>结论</b>：" + (isSub(J) ? "三条全部满足，S 是 ℤ₁₂ 的<b>子环</b>" + (st.c.S.indexOf(1) < 0 ? "（注意：它不含单位元 1，子环不要求含 1）。" : "。") : "至少一条不满足，S <b>不是子环</b>。")
      ][st.step];
    },
    result: function (st) {
      var J = judge(st.c.S);
      return "<b>候选</b> " + esc(st.c.label) + "<br>0 ∈ S " + H.verdict(J.has0) + "　减法封闭 " + H.verdict(!J.sub) + "<br>乘法封闭 " + H.verdict(!J.mul) + "　子环 " + H.verdict(isSub(J), "是子环", "不是子环");
    },
    knowledge: [
      "子环：环 R 的非空子集 S，在 R 的加法与乘法下自身构成环。",
      "判定定理：S ≠ ∅，且 ∀a,b ∈ S：a − b ∈ S，ab ∈ S。",
      "ℤ₁₂ 的子环恰为 ⟨d⟩ = {0, d, 2d, …}（d | 12），共 6 个。",
      "子环不一定含单位元：{0,3,6,9} 中没有 1。"
    ],
    insight: {
      title: "🧩 局部自成体系",
      text: "子环是大环里“自成一体”的一部分：内部做减法、做乘法都不会跑出去。一个反例就足以否定封闭性——判定时既要逐一检查，也要善于寻找反例。",
      badges: ["系统观念", "严谨求实"]
    }
  };
  function isSub(J) { return J.has0 && !J.sub && !J.mul; }

  /* ---------- 拓展层：商环构造 ---------- */
  var COL = ["#d63b1d", "#c58a1f", "#2f7d57", "#8a4b2a", "#b8321a", "#6b4a38", "#9a6a12"];
  function pmul(a, b, p, k) {
    var r = 0;
    for (var i = 0; i < k; i++) if ((b >> i) & 1) r ^= (a << i);
    for (var bit = 2 * k - 2; bit >= k; bit--) if ((r >> bit) & 1) r ^= (p << (bit - k));
    return r;
  }
  function pstr(v) {
    if (!v) return "0";
    var t = [];
    for (var i = 5; i >= 0; i--) if ((v >> i) & 1) t.push(i === 0 ? "1" : i === 1 ? "x" : "x" + "⁰¹²³⁴⁵"[i]);
    return t.join("+");
  }
  function QR(c) {
    if (c.p) {
      var k = c.k, E = range(1 << k);
      return { els: E, add: function (a, b) { return a ^ b; }, mul: function (a, b) { return pmul(a, b, c.p, k); }, show: pstr, size: E.length };
    }
    return { els: range(c.n), add: function (a, b) { return mod(a + b, c.n); }, mul: function (a, b) { return mod(a * b, c.n); }, show: function (v) { return v; }, size: c.n };
  }
  function zeroDivs(Q) {
    var out = [];
    Q.els.forEach(function (a) { Q.els.forEach(function (b) { if (a && b && a <= b && Q.mul(a, b) === 0) out.push([a, b]); }); });
    return out;
  }
  var extend = {
    stepTitle: "四步构造商环",
    stepHint: "从陪集划分到极大理想，看商环何时成为域",
    mission: "商环 R/I 以理想 I 的陪集为元素。分别用整数环 ℤ 模理想 nℤ、多项式环 ℤ₂[x] 模理想 (p(x)) 构造商环：验证代表元运算良定义，寻找零因子，判断商环是否为域。",
    badge: "R/I · 极大理想 ⇔ 域",
    caseLabel: "选择商环",
    cases: [
      { label: "ℤ/5ℤ（理想 5ℤ）", n: 5, name: "ℤ/5ℤ", I: "5ℤ" },
      { label: "ℤ/6ℤ（理想 6ℤ）", n: 6, name: "ℤ/6ℤ", I: "6ℤ" },
      { label: "ℤ/7ℤ（理想 7ℤ）", n: 7, name: "ℤ/7ℤ", I: "7ℤ" },
      { label: "ℤ₂[x]/(x³+x+1)（不可约）", p: 11, k: 3, name: "ℤ₂[x]/(x³+x+1)", I: "(x³+x+1)", rule: "x³ ≡ x + 1" },
      { label: "ℤ₂[x]/(x²+1)（可约）", p: 5, k: 2, name: "ℤ₂[x]/(x²+1)", I: "(x²+1)", rule: "x² ≡ 1" }
    ],
    init: function (st) { st.p.a = st.c.p ? 2 : 2; st.p.b = st.c.p ? 3 : 3; },
    steps: [
      { t: "陪集划分", s: "a + I", tok: 0 },
      { t: "良定义", s: "换代表元结果不变", tok: 1 },
      { t: "乘法与零因子", s: "R/I 的乘法表", tok: 2 },
      { t: "极大理想与域", s: "何时 R/I 是域", tok: 3 }
    ],
    tokens: ["a + I", "a ≡ a′ ⇒ ab ≡ a′b′", "[a][b] = [0]", "I 极大 ⇔ R/I 为域"],
    legend: [["cur", "当前代表元"], ["key", "零类 [0] = I"], ["ok", "可逆"], ["bad", "零因子"]],
    controls: function (st) {
      var Q = QR(st.c);
      function row(k, lab) {
        return '<div class="ctrl-row"><label>' + lab + '</label><div class="chip-row">' + Q.els.filter(function (x) { return x; }).map(function (x) {
          return '<button type="button" class="pick' + (st.p[k] === x ? " on" : "") + '" data-pick="' + k + '" data-val="' + x + '">' + esc(Q.show(x)) + "</button>";
        }).join("") + "</div></div>";
      }
      return row("a", "陪集代表元 a") + row("b", "陪集代表元 b");
    },
    title: function (st) { return st.c.name; },
    sub: function (st) {
      if (st.c.p) return ["ℤ₂[x] 中两多项式同属一个陪集 ⇔ 它们模 p(x) 的余式相同；余式次数 < " + st.c.k + "，共 " + (1 << st.c.k) + " 个陪集。",
        "换一个代表元（加上 p(x) 的倍式），运算结果仍落在同一个陪集——陪集运算与代表元无关。",
        "按 " + st.c.rule + " 约化乘积，得到 R/I 的乘法表。",
        "p(x) 不可约 ⇔ (p(x)) 是极大理想 ⇔ 商环是域（此时是 " + (1 << st.c.k) + " 元有限域）。"][st.step];
      return ["整数按除以 " + st.c.n + " 的余数分成 " + st.c.n + " 个陪集 a + " + st.c.I + "，同色的数属于同一陪集。",
        "从同一陪集中换代表元 a′ = a + " + st.c.n + "、b′ = b − " + 2 * st.c.n + "，和与积仍落在同一陪集——运算良定义，因为 " + st.c.I + " 是理想。",
        "商环 ℤ/" + st.c.n + "ℤ 的乘法表：红色格是零因子乘积。",
        "nℤ 是极大理想 ⇔ n 为素数 ⇔ ℤ/nℤ 是域。"][st.step];
    },
    draw: function (st) {
      var Q = QR(st.c), c = st.c, a = st.p.a, b = st.p.b;
      if (Q.els.indexOf(a) < 0) a = 1; if (Q.els.indexOf(b) < 0) b = 1;
      if (st.step === 0) {
        if (!c.p) {
          var s = "", lo = -10;
          for (var v = -10; v <= 10; v++) {
            var x = 30 + (v - lo) * 33, cls = mod(v, c.n);
            s += '<circle cx="' + x + '" cy="150" r="14" fill="' + (cls === 0 ? "#d63b1d" : "#fff") + '" stroke="' + COL[cls % COL.length] + '" stroke-width="3"/>';
            s += '<text x="' + x + '" y="155" text-anchor="middle" class="m" font-size="11" font-weight="800" fill="' + (cls === 0 ? "#fff" : "#2c1810") + '">' + v + "</text>";
          }
          s += H.line(10, 185, 710, 185, "dim");
          range(c.n).forEach(function (r, i) {
            var y = 225 + Math.floor(i / 4) * 44, xx = 60 + (i % 4) * 165;
            s += '<rect x="' + xx + '" y="' + (y - 20) + '" width="150" height="34" rx="9" fill="#fff" stroke="' + COL[r % COL.length] + '" stroke-width="2.4"/>';
            s += '<text x="' + (xx + 75) + '" y="' + (y + 2) + '" text-anchor="middle" font-size="13" font-weight="800" fill="' + COL[r % COL.length] + '">[' + r + "] = " + r + " + " + c.I + "</text>";
          });
          s += H.text(360, 60, "ℤ 被理想 " + c.I + " 划分成 " + c.n + " 个陪集（不重不漏）", { size: 16, color: "#d63b1d", weight: 800 });
          return H.svg(s, 720, 330);
        }
        var s2 = H.text(360, 40, "ℤ₂[x] 模 " + c.I + "：每个多项式归入它的余式所在陪集", { size: 16, color: "#d63b1d", weight: 800 });
        Q.els.forEach(function (v, i) {
          var xx = 60 + (i % 4) * 155, y = 80 + Math.floor(i / 4) * 60;
          s2 += H.box(xx, y, 140, 42, "[" + pstr(v) + "]", v === 0 ? "key" : v === a ? "cur" : "norm", 14);
        });
        var ex = c.k === 3 ? "x³ ≡ x+1，x⁴ = x·x³ ≡ x²+x" : "x² ≡ 1，x³ = x·x² ≡ x";
        s2 += H.text(360, 80 + Math.ceil(Q.size / 4) * 60 + 30, "约化规则 " + c.rule + "：例如 " + ex, { size: 14, color: "#4e362d" });
        return H.svg(s2, 720, 80 + Math.ceil(Q.size / 4) * 60 + 60);
      }
      if (st.step === 1) {
        var html;
        if (!c.p) {
          var a2 = a + c.n, b2 = b - 2 * c.n;
          html = '<div class="calc-card">代表元 a = ' + a + "，a′ = " + a2 + "（同属 [" + a + "]）；b = " + b + "，b′ = " + b2 + "（同属 [" + b + "]）<br>" +
            "a + b = " + (a + b) + " ∈ [" + mod(a + b, c.n) + "]　　a′ + b′ = " + (a2 + b2) + " ∈ [" + mod(a2 + b2, c.n) + "]　<span class=\"ok\">同类 ✓</span><br>" +
            "a · b = " + a * b + " ∈ [" + mod(a * b, c.n) + "]　　a′ · b′ = " + a2 * b2 + " ∈ [" + mod(a2 * b2, c.n) + "]　<span class=\"ok\">同类 ✓</span></div>" +
            '<div class="calc-card">原因：a′b′ − ab = a′(b′ − b) + (a′ − a)b ∈ ' + c.I + "（理想吸收乘法），所以 [a][b] = [ab] 与代表元的选取无关。</div>";
        } else {
          var a2p = a ^ c.p, raw = 0;
          for (var i = 0; i < c.k + 1; i++) if ((b >> i) & 1) raw ^= (a2p << i);
          html = '<div class="calc-card">代表元 a = ' + pstr(a) + "，a′ = a + p(x) = " + pstr(a2p) + "（同一陪集）<br>" +
            "a · b = (" + pstr(a) + ")(" + pstr(b) + ") ≡ <b>" + pstr(Q.mul(a, b)) + "</b>　　a′ · b = (" + pstr(a2p) + ")(" + pstr(b) + ") = " + pstr(raw) + " ≡ <b>" + pstr(Q.mul(a, b)) + "</b>　<span class=\"ok\">同类 ✓</span></div>" +
            '<div class="calc-card">两者只差 p(x)·b ∈ ' + c.I + "，被理想吸收，所以乘积落在同一陪集。</div>";
        }
        return html;
      }
      if (st.step === 2) {
        var zd = zeroDivs(Q);
        return '<div class="tbl-row">' + H.table(Q.els, Q.mul, function (x, y, v) {
          if (!x || !y) return "dim";
          if (x === a && y === b) return "hot";
          if (v === 0) return "badc";
          if (v === 1) return "okc";
          return "";
        }, "R/I 的乘法表（[·] 省略）", "·", Q.show) + "</div>" +
          '<div class="calc-card">[' + esc(Q.show(a)) + "] · [" + esc(Q.show(b)) + "] = <b>[" + esc(Q.show(Q.mul(a, b))) + "]</b>　｜　" + (zd.length ? '<span class="bad">零因子对：' + zd.slice(0, 4).map(function (p) { return "[" + Q.show(p[0]) + "]·[" + Q.show(p[1]) + "]"; }).join("，") + "</span>" : '<span class="ok">无零因子</span>') + "</div>";
      }
      return summary(st, Q);
    },
    feedback: function (st) {
      var Q = QR(st.c), c = st.c, zd = zeroDivs(Q), field = !zd.length;
      return [
        "<b>陪集划分</b>：R/I 共有 " + Q.size + " 个元素（陪集），零类 [0] 恰好是理想 " + c.I + " 本身。",
        "<b>良定义</b>：因为 " + c.I + " 是<b>理想</b>（吸收乘法），换代表元不改变运算结果——这正是构造商环必须用理想的原因。",
        "<b>零因子</b>：" + (zd.length ? "发现 " + zd.length + " 对零因子，例如 [" + Q.show(zd[0][0]) + "]·[" + Q.show(zd[0][1]) + "] = [0]。" : "非零陪集相乘都不为 [0]，没有零因子。"),
        "<b>结论</b>：" + (field ? c.I + " 是极大理想，" + c.name + " 是<b>域</b>，可用于有限域算术（纠错码、密码）。" : c.I + " 不是极大理想（" + (c.p ? "x²+1 = (x+1)²" : c.n + " = " + smallFactor(c.n) + "·" + c.n / smallFactor(c.n)) + "），" + c.name + " <b>不是域</b>。")
      ][st.step];
    },
    result: function (st) {
      var Q = QR(st.c), zd = zeroDivs(Q);
      return "<b>" + esc(st.c.name) + "</b>　|R/I| = " + Q.size + "<br>零因子对：" + (zd.length ? zd.length : "无") + "<br>是否为域：" + H.verdict(!zd.length, "是域", "不是域");
    },
    knowledge: [
      "商环 R/I = {a + I : a ∈ R}，(a+I)+(b+I) = (a+b)+I，(a+I)(b+I) = ab+I。",
      "运算良定义的关键：I 是理想（吸收乘法），只是子环不够。",
      "ℤ/nℤ 就是模 n 剩余类环 ℤₙ；它是域 ⇔ n 为素数。",
      "交换含幺环中：I 是极大理想 ⇔ R/I 是域；F[x]/(p(x)) 是域 ⇔ p(x) 不可约。"
    ],
    insight: {
      title: "⚙ 从理想到新结构",
      text: "商环把“模掉”理想后剩下的本质差别组成一个新环：钟表时间是 ℤ/12ℤ，计算机的整数溢出是 ℤ/2³²ℤ，AES 所用的 GF(2⁸) 则是 ℤ₂[x] 模一个 8 次不可约多项式的商环。选对理想，就能得到需要的结构。",
      badges: ["抓住本质", "科学精神", "自立自强"]
    }
  };
  function smallFactor(n) { for (var i = 2; i <= n; i++) if (n % i === 0) return i; return n; }
  function summary(st, Q) {
    var c = st.c, zd = zeroDivs(Q), field = !zd.length, s = "";
    s += H.text(360, 38, c.name + "：非零元的去向", { size: 17, color: "#d63b1d", weight: 800 });
    var nz = Q.els.filter(function (x) { return x; }), pos = {}, R = 135, cx = 360, cy = 205;
    nz.forEach(function (x, i) { var t = -Math.PI / 2 + i * 2 * Math.PI / nz.length; pos[x] = [cx + R * Math.cos(t), cy + R * Math.sin(t)]; });
    nz.forEach(function (x) { nz.forEach(function (y) {
      if (x < y && Q.mul(x, y) === 1) s += H.line(pos[x][0], pos[x][1], pos[y][0], pos[y][1], "ok");
      if (x <= y && Q.mul(x, y) === 0 && x !== y) s += H.line(pos[x][0], pos[x][1], pos[y][0], pos[y][1], "bad");
    }); });
    nz.forEach(function (x) {
      var inv = nz.some(function (y) { return Q.mul(x, y) === 1; });
      s += H.node(pos[x][0], pos[x][1], Q.show(x), inv ? (x === 1 ? "key" : "ok") : "bad", c.p ? 27 : 22, c.p ? 11 : null);
    });
    s += H.text(360, 395, field ? "绿线连接互逆元：每个非零陪集都可逆 ⇒ 域" : "红色虚线连接零因子对 ⇒ 不是域", { size: 14, color: field ? "#2f7d57" : "#c0392b" });
    return H.svg(s, 720, 410);
  }

  CH11.mount({ basic: basic, extend: extend });
})();
