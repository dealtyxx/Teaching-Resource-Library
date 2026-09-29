/* =====================================================================
 * 11.3 环同态和同构 —— 基础层 / 拓展层 场景（由 ../ch11-engine.js 驱动）
 *   基础层：小环之间的映射，逐对检验「保加法」「保乘法」，区分环同态与仅保加法的映射
 *   拓展层：中国剩余定理 ℤ_mn ≅ ℤ_m × ℤ_n（m,n 互素）——拆分计算、并行求解与「在像中计算」
 * ===================================================================== */
(function () {
  "use strict";
  var H = CH11.H, range = CH11.range, mod = CH11.mod, gcd = CH11.gcd, esc = CH11.esc;
  function sub(k) { return String(k).replace(/\d/g, function (d) { return "₀₁₂₃₄₅₆₇₈₉"[d]; }); }

  /* ---------- 基础层 ---------- */
  function mapOf(c) { return function (x) { return mod(c.k * x, c.m); }; }
  function check(c) {
    var f = mapOf(c), addBad = null, mulBad = null;
    range(c.n).forEach(function (a) { range(c.n).forEach(function (b) {
      if (!addBad && f(mod(a + b, c.n)) !== mod(f(a) + f(b), c.m)) addBad = [a, b];
      if (!mulBad && f(mod(a * b, c.n)) !== mod(f(a) * f(b), c.m)) mulBad = [a, b];
    }); });
    var img = []; range(c.n).forEach(function (x) { if (img.indexOf(f(x)) < 0) img.push(f(x)); });
    return { addBad: addBad, mulBad: mulBad, inj: img.length === c.n, surj: img.length === c.m, one: f(1) === 1 };
  }
  function twoCol(st, hiL, hiR, badArrows) {
    var c = st.c, f = mapOf(c), s = "", xL = 200, xR = 520;
    var yL = function (i) { return 70 + i * (300 / Math.max(1, c.n - 1)); };
    var yR = function (i) { return 70 + i * (300 / Math.max(1, c.m - 1)); };
    s += H.text(xL, 36, "ℤ" + sub(c.n), { size: 17, color: "#d63b1d", weight: 800 }) + H.text(xR, 36, "ℤ" + sub(c.m), { size: 17, color: "#b8321a", weight: 800 });
    range(c.n).forEach(function (x) {
      var hot = hiL.indexOf(x) >= 0;
      s += H.arrow(xL, yL(x), xR, yR(f(x)), hot ? (badArrows ? "bad" : "cur") : "norm", 21);
    });
    range(c.n).forEach(function (x) { s += H.node(xL, yL(x), x, hiL.indexOf(x) >= 0 ? "cur" : "norm", 19); });
    range(c.m).forEach(function (y) { s += H.node(xR, yR(y), y, hiR.indexOf(y) >= 0 ? (badArrows ? "bad" : "ok") : "norm", 19); });
    s += H.text(360, 410, "φ(x) = " + (c.k === 1 ? "x" : c.k + "x") + " mod " + c.m, { size: 16, weight: 800, color: "#4e362d", mono: true });
    return H.svg(s, 720, 425);
  }
  var basic = {
    stepTitle: "四步判定环同态",
    stepHint: "逐对检验，一个反例就能否定",
    mission: "映射 φ: R₁ → R₂ 要成为环同态，必须同时保持两种运算：φ(a+b) = φ(a)+φ(b)，φ(ab) = φ(a)φ(b)。选择一个映射，挑两个元素试算，再看全部元素对是否都成立。",
    badge: "双运算保持",
    caseLabel: "选择映射",
    cases: [
      { label: "φ: ℤ₆ → ℤ₃，φ(x) = x mod 3", n: 6, m: 3, k: 1 },
      { label: "φ: ℤ₆ → ℤ₂，φ(x) = x mod 2", n: 6, m: 2, k: 1 },
      { label: "φ: ℤ₃ → ℤ₆，φ(x) = 2x mod 6", n: 3, m: 6, k: 2 },
      { label: "φ: ℤ₃ → ℤ₆，φ(x) = 4x mod 6", n: 3, m: 6, k: 4 }
    ],
    init: function (st) { st.p.a = 1; st.p.b = st.c.n > 2 ? 2 : 1; },
    steps: [
      { t: "映射对应", s: "每个元素的像", tok: 0 },
      { t: "保加法", s: "φ(a+b)=φ(a)+φ(b)", tok: 1 },
      { t: "保乘法", s: "φ(ab)=φ(a)φ(b)", tok: 2 },
      { t: "同态结论", s: "单射？满射？", tok: 3 }
    ],
    tokens: ["φ: R₁→R₂", "φ(a+b)=φ(a)+φ(b)", "φ(ab)=φ(a)φ(b)", "环同态"],
    legend: [["cur", "当前元素"], ["ok", "像一致"], ["bad", "像不一致"], ["norm", "其余元素"]],
    controls: function (st) {
      function row(k, lab) {
        return '<div class="ctrl-row"><label>' + lab + '</label><div class="chip-row">' + range(st.c.n).map(function (x) {
          return '<button type="button" class="pick' + (st.p[k] === x ? " on" : "") + '" data-pick="' + k + '" data-val="' + x + '">' + x + "</button>";
        }).join("") + "</div></div>";
      }
      return row("a", "元素 a") + row("b", "元素 b");
    },
    title: function (st) { return st.c.label; },
    sub: function (st) {
      return ["先看映射本身：左边每个元素恰好射出一支箭头。",
        "先在 R₁ 中相加再映射，与先映射再在 R₂ 中相加，结果相同吗？",
        "对乘法做同样的检验。",
        "两条都对所有元素对成立 ⇒ 环同态；再看是否单射、满射。"][st.step];
    },
    draw: function (st) {
      var c = st.c, f = mapOf(c), a = st.p.a % c.n, b = st.p.b % c.n;
      if (st.step === 0) return twoCol(st, [], []);
      if (st.step === 1 || st.step === 2) {
        var add = st.step === 1, ab = add ? mod(a + b, c.n) : mod(a * b, c.n);
        var lhs = f(ab), rhs = add ? mod(f(a) + f(b), c.m) : mod(f(a) * f(b), c.m), op = add ? " + " : " · ";
        return twoCol(st, [a, b, ab], [lhs, rhs], lhs !== rhs) +
          '<div class="calc-card">φ(' + a + op + b + ") = φ(" + ab + ") = <b>" + lhs + "</b>　　φ(" + a + ")" + op + "φ(" + b + ") = " + f(a) + op + f(b) + " = <b>" + rhs + "</b>　" +
          (lhs === rhs ? '<span class="ok">✓ 相等</span>' : '<span class="bad">✗ 不等</span>') + "</div>";
      }
      var K = check(c), s = "";
      var rows = [["保加法", !K.addBad], ["保乘法", !K.mulBad], ["单射", K.inj], ["满射", K.surj], ["φ(1) = 1", K.one]];
      s += H.text(360, 40, st.c.label, { size: 16, color: "#d63b1d", weight: 800 });
      rows.forEach(function (r, i) {
        var y = 70 + i * 58;
        s += H.box(200, y, 220, 42, r[0], i < 2 ? (r[1] ? "ok" : "bad") : (r[1] ? "cur" : "dim"), 15);
        s += H.text(450, y + 27, r[1] ? "✓ 是" : "✗ 否", { size: 15, anchor: "start", color: r[1] ? "#2f7d57" : "#c0392b" });
      });
      var hom = !K.addBad && !K.mulBad;
      s += H.text(360, 390, hom ? "环同态" + (K.inj && K.surj ? "且双射 ⇒ 环同构" : K.inj ? "（单同态）" : K.surj ? "（满同态）" : "") : "只保加法、不保乘法 ⇒ 不是环同态", { size: 16, weight: 800, color: hom ? "#2f7d57" : "#c0392b" });
      return H.svg(s, 720, 410);
    },
    feedback: function (st) {
      var K = check(st.c);
      return [
        "<b>映射</b>：" + esc(st.c.label) + "。模数满足 " + st.c.m + " | " + st.c.k + "·" + st.c.n + "，所以映射与代表元无关（良定义）。",
        "<b>保加法</b>：" + (K.addBad ? '<span class="bad">反例 a=' + K.addBad[0] + ", b=" + K.addBad[1] + "</span>" : '<span class="ok">对全部 ' + st.c.n * st.c.n + " 对都成立</span>") + "。",
        "<b>保乘法</b>：" + (K.mulBad ? '<span class="bad">反例 a=' + K.mulBad[0] + ", b=" + K.mulBad[1] + "：φ(ab) ≠ φ(a)φ(b)</span>" : '<span class="ok">对全部元素对都成立</span>') + "。",
        "<b>结论</b>：" + (!K.addBad && !K.mulBad ? "φ 是环同态" + (K.one ? "，且 φ(1) = 1。" : "；注意 φ(1) = " + mapOf(st.c)(1) + " ≠ 1，按本课程的定义（只要求保持加法与乘法）仍是环同态。") : "φ 只是加法群同态，<b>不是</b>环同态。")
      ][st.step];
    },
    result: function (st) {
      var K = check(st.c), hom = !K.addBad && !K.mulBad;
      return "<b>当前映射</b>：" + esc(st.c.label) + "<br>保加法 " + H.verdict(!K.addBad) + "　保乘法 " + H.verdict(!K.mulBad) + "<br>环同态 " + H.verdict(hom, "是", "不是") + "　单射 " + H.verdict(K.inj, "是", "否");
    },
    knowledge: [
      "环同态：φ(a+b) = φ(a)+φ(b)，φ(ab) = φ(a)φ(b)，对一切 a, b 成立。",
      "同态必把零元映到零元：φ(0) = 0，φ(−a) = −φ(a)。",
      "单射同态叫单同态，满射叫满同态，双射叫同构。",
      "φ(x) = kx mod m（ℤₙ → ℤₘ）保加法 ⇔ 良定义；保乘法还需 k² ≡ k (mod m)。"
    ],
    insight: {
      title: "🌉 两种运算都要守住",
      text: "ℤ₃ → ℤ₆ 的 x ↦ 2x 能保持加法，却在乘法上露出破绽；x ↦ 4x 则两种运算都能保持。检验一条“桥梁”是否可靠，不能只看一个方面——同时满足全部规则才算真正保持了结构。",
      badges: ["严谨求实", "系统观念"]
    }
  };

  /* ---------- 拓展层：中国剩余定理 ---------- */
  function crt(c) { return function (x) { return [mod(x, c.m1), mod(x, c.m2)]; }; }
  var extend = {
    stepTitle: "四步读懂 CRT 同构",
    stepHint: "拆成小模 → 分量运算 → 双射 → 应用",
    mission: "中国剩余定理（《孙子算经》“物不知数”）可以写成环同构：m, n 互素时 ℤ_mn ≅ ℤ_m × ℤ_n，x ↦ (x mod m, x mod n)。把一个大模数上的运算拆成两个小模数上的并行运算，再唯一地拼回去。",
    badge: "ℤ_mn ≅ ℤ_m × ℤ_n",
    caseLabel: "选择模数",
    cases: [
      { label: "ℤ₆ → ℤ₂ × ℤ₃（2, 3 互素）", m1: 2, m2: 3 },
      { label: "ℤ₁₅ → ℤ₃ × ℤ₅（3, 5 互素）", m1: 3, m2: 5 },
      { label: "ℤ₁₂ → ℤ₃ × ℤ₄（3, 4 互素）", m1: 3, m2: 4 },
      { label: "ℤ₄ → ℤ₂ × ℤ₂（2, 2 不互素）", m1: 2, m2: 2 }
    ],
    init: function (st) { var N = st.c.m1 * st.c.m2; st.p.a = Math.min(4, N - 1); st.p.b = Math.min(5, N - 1); },
    steps: [
      { t: "拆成余数对", s: "x ↦ (x mod m, x mod n)", tok: 0 },
      { t: "分量运算", s: "保加法与乘法", tok: 1 },
      { t: "双射判定", s: "gcd(m,n)=1", tok: 2 },
      { t: "工程应用", s: "并行计算 · 同态思想", tok: 3 }
    ],
    tokens: ["φ(x)=(x mod m, x mod n)", "φ(a·b)=φ(a)·φ(b)", "gcd(m,n)=1 ⇒ 双射", "ℤ_mn ≅ ℤ_m×ℤ_n"],
    legend: [["cur", "a 的位置"], ["key", "b 的位置"], ["ok", "运算结果"], ["bad", "撞格（非单射）"]],
    controls: function (st) {
      var N = st.c.m1 * st.c.m2;
      function row(k, lab, cls) {
        return '<div class="ctrl-row"><label>' + lab + '</label><div class="chip-row">' + range(N).map(function (x) {
          return '<button type="button" class="pick' + (st.p[k] === x ? " " + cls : "") + '" data-pick="' + k + '" data-val="' + x + '">' + x + "</button>";
        }).join("") + "</div></div>";
      }
      return row("a", "元素 a", "on2") + row("b", "元素 b", "on");
    },
    title: function (st) { return st.c.label; },
    sub: function (st) {
      var c = st.c;
      return ["网格的行是 x mod " + c.m1 + "，列是 x mod " + c.m2 + "；每个 x 放进它的余数对所在的格子。",
        "在 ℤ" + sub(c.m1 * c.m2) + " 中算 a+b、a·b，与在两个小环中分别算，落在同一个格子。",
        gcd(c.m1, c.m2) === 1 ? "每个格子恰好一个数：φ 是双射，于是是环同构。" : "有的格子挤了两个数、有的格子空着：φ 不是双射。",
        "大模数运算 = 小模数上的并行运算 + 唯一拼回。"][st.step];
    },
    draw: function (st) {
      var c = st.c, N = c.m1 * c.m2, f = crt(c), a = st.p.a % N, b = st.p.b % N;
      var cw = Math.min(96, 520 / c.m2), ch = Math.min(62, 300 / c.m1), x0 = 360 - cw * c.m2 / 2 + 20, y0 = 70;
      var cells = {}, s = "";
      range(N).forEach(function (x) { var k = f(x).join(","); (cells[k] = cells[k] || []).push(x); });
      var sum = mod(a + b, N), prod = mod(a * b, N);
      for (var i = 0; i < c.m1; i++) {
        s += H.text(x0 - 26, y0 + i * ch + ch / 2 + 5, i, { mono: true, size: 14, color: "#b8321a" });
        for (var j = 0; j < c.m2; j++) {
          var xs = cells[i + "," + j] || [], clash = xs.length > 1, empty = !xs.length;
          s += '<rect x="' + (x0 + j * cw) + '" y="' + (y0 + i * ch) + '" width="' + (cw - 6) + '" height="' + (ch - 6) + '" rx="8" fill="' + (empty ? "#f6efe6" : clash && st.step >= 2 ? "#fde8e4" : "#fff") + '" stroke="' + (clash && st.step >= 2 ? "#c0392b" : "rgba(116,55,31,.25)") + '" stroke-width="' + (clash && st.step >= 2 ? 2.4 : 1.4) + '"' + (clash && st.step >= 2 ? ' stroke-dasharray="5 4"' : "") + "/>";
          xs.forEach(function (x, t) {
            var kind = "norm";
            if (st.step >= 1 && (x === sum || x === prod)) kind = "ok";
            if (x === a) kind = "cur";
            if (x === b) kind = "key";
            var cx = x0 + j * cw + (cw - 6) / 2 + (xs.length > 1 ? (t - (xs.length - 1) / 2) * 30 : 0), cy = y0 + i * ch + (ch - 6) / 2;
            s += H.node(cx, cy, x, kind, 14, 12);
          });
        }
      }
      for (var j2 = 0; j2 < c.m2; j2++) s += H.text(x0 + j2 * cw + (cw - 6) / 2, y0 - 12, j2, { mono: true, size: 14, color: "#b8321a" });
      s += H.text(x0 - 26, y0 - 12, "mod " + c.m1 + " \\ mod " + c.m2, { size: 11, color: "#6b4a38", anchor: "end" });
      var yb = y0 + c.m1 * ch + 30;
      if (st.step === 0) s += H.text(360, yb, "φ(" + a + ") = (" + f(a).join(", ") + ")，φ(" + b + ") = (" + f(b).join(", ") + ")", { size: 15, mono: true, color: "#4e362d" });
      if (st.step >= 1) {
        s += H.text(360, yb, "a+b = " + sum + " ↦ (" + f(sum).join(", ") + ") = (" + mod(f(a)[0] + f(b)[0], c.m1) + ", " + mod(f(a)[1] + f(b)[1], c.m2) + ")", { size: 14, mono: true, color: "#2f7d57" });
        s += H.text(360, yb + 26, "a·b = " + prod + " ↦ (" + f(prod).join(", ") + ") = (" + mod(f(a)[0] * f(b)[0], c.m1) + ", " + mod(f(a)[1] * f(b)[1], c.m2) + ")", { size: 14, mono: true, color: "#2f7d57" });
      }
      return H.svg(s, 720, Math.max(330, yb + 50));
    },
    feedback: function (st) {
      var c = st.c, N = c.m1 * c.m2, coprime = gcd(c.m1, c.m2) === 1;
      return [
        "<b>余数对</b>：" + N + " 个元素放进 " + c.m1 + "×" + c.m2 + " = " + N + " 个格子。",
        "<b>分量运算</b>：加法、乘法都按分量在 ℤ" + sub(c.m1) + "、ℤ" + sub(c.m2) + " 中各算各的——φ 是环同态（对任何 m, n 都成立）。",
        "<b>双射</b>：" + (coprime ? '<span class="ok">gcd(' + c.m1 + ", " + c.m2 + ") = 1，每格恰一个数 ⇒ 同构。</span>" : '<span class="bad">gcd = ' + gcd(c.m1, c.m2) + " ≠ 1，出现撞格 ⇒ 不是同构；实际上 ℤ₄ ≇ ℤ₂ × ℤ₂（ℤ₄ 中 1 的加法阶为 4）。</span>"),
        "<b>应用</b>：RSA 解密常把模 N = pq 的幂运算拆成模 p、模 q 两次较小的运算再用 CRT 合并，明显提速；同态加密也利用“保持运算的映射”，在像的一侧完成计算。"
      ][st.step];
    },
    result: function (st) {
      var c = st.c, coprime = gcd(c.m1, c.m2) === 1;
      return "<b>" + esc(c.label) + "</b><br>环同态 " + H.verdict(true, "是") + "　双射 " + H.verdict(coprime, "是", "否") + "<br>ℤ" + sub(c.m1 * c.m2) + " ≅ ℤ" + sub(c.m1) + " × ℤ" + sub(c.m2) + "　" + H.verdict(coprime, "成立", "不成立");
    },
    knowledge: [
      "直积环 R × S：按分量相加、相乘。",
      "φ(x) = (x mod m, x mod n) 总是环同态，核为 lcm(m,n)ℤ。",
      "gcd(m, n) = 1 ⇔ φ 是双射 ⇔ ℤ_mn ≅ ℤ_m × ℤ_n（中国剩余定理）。",
      "“物不知数”问题：x ≡ 2 (mod 3)，x ≡ 3 (mod 5)，x ≡ 2 (mod 7) ⇒ x ≡ 23 (mod 105)。"
    ],
    insight: {
      title: "🏮 古老算法的现代生命",
      text: "《孙子算经》中的“物不知数”问题，经秦九韶在《数书九章》中发展为系统的“大衍求一术”，今天以“中国剩余定理”之名写进各国教材，并在密码学、大整数计算中广泛使用。用环同构的眼光看它，古代算法与现代代数一脉相承。",
      badges: ["文化自信", "科学精神", "传承创新"]
    }
  };

  CH11.mount({ basic: basic, extend: extend });
})();
