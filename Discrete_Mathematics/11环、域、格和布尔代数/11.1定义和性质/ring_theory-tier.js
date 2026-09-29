/* =====================================================================
 * 11.1 环的定义和性质 —— 基础层 / 拓展层 场景（由 ../ch11-engine.js 驱动）
 *   基础层：在有限环 ⟨Zₙ,+,·⟩ 上逐条核验环公理（加群 → 乘半群 → 分配律 → 结论）
 *   拓展层：有限域——Zₚ 与多项式商环 GF(2²)，判别零因子/逆元，迁移到编码与密码
 * ===================================================================== */
(function () {
  "use strict";
  var H = CH11.H, range = CH11.range, mod = CH11.mod, esc = CH11.esc;

  /* ---------- 基础层：环公理核验 ---------- */
  function ringOf(c) {
    var n = c.n;
    return {
      els: range(n),
      add: function (a, b) { return mod(a + b, n); },
      mul: c.max ? function (a, b) { return Math.max(a, b); } : function (a, b) { return mod(a * b, n); },
      mulSym: c.max ? "max" : "·",
      neg: function (a) { return mod(-a, n); }
    };
  }
  function checkAll(R) {
    var E = R.els, res = { addAssoc: true, mulAssoc: true, dist: true, distBad: null, comm: true, one: null };
    E.forEach(function (a) { E.forEach(function (b) {
      if (R.mul(a, b) !== R.mul(b, a)) res.comm = false;
      E.forEach(function (c) {
        if (R.add(R.add(a, b), c) !== R.add(a, R.add(b, c))) res.addAssoc = false;
        if (R.mul(R.mul(a, b), c) !== R.mul(a, R.mul(b, c))) res.mulAssoc = false;
        var l = R.mul(a, R.add(b, c)), r = R.add(R.mul(a, b), R.mul(a, c));
        var l2 = R.mul(R.add(b, c), a), r2 = R.add(R.mul(b, a), R.mul(c, a));
        if ((l !== r || l2 !== r2) && res.dist) { res.dist = false; res.distBad = [a, b, c, l, r]; }
      });
    }); });
    E.forEach(function (e) { if (res.one == null && E.every(function (x) { return R.mul(e, x) === x && R.mul(x, e) === x; })) res.one = e; });
    return res;
  }

  var basic = {
    stepTitle: "四步公理核验",
    stepHint: "点一步，看运算表、公式项与结论同步高亮",
    mission: "在有限集合 Zₙ 上同时观察加法与乘法：先验证 ⟨R,+⟩ 是阿贝尔群，再验证 ⟨R,·⟩ 是半群，最后检查乘法对加法的分配律——三条都成立才是环。",
    badge: "运算表 · 公理核验",
    caseLabel: "选择代数系统",
    cases: [
      { label: "⟨Z₄, +₄, ·₄⟩ 模 4 剩余类", n: 4 },
      { label: "⟨Z₅, +₅, ·₅⟩ 模 5 剩余类", n: 5 },
      { label: "⟨Z₆, +₆, ·₆⟩ 模 6 剩余类", n: 6 },
      { label: "反例：⟨Z₄, +₄, max⟩ 把乘法换成取大", n: 4, max: true }
    ],
    init: function (st) { st.p.a = 2; st.p.b = 1; st.p.c = 3 % st.c.n; },
    steps: [
      { t: "加法群", s: "⟨R,+⟩ 阿贝尔群", tok: 0 },
      { t: "乘法半群", s: "⟨R,·⟩ 封闭 + 结合", tok: 1 },
      { t: "分配律", s: "a·(b+c)=a·b+a·c", tok: 2 },
      { t: "环的判定", s: "三条公理合取", tok: 3 }
    ],
    tokens: ["⟨R,+⟩ 阿贝尔群", "⟨R,·⟩ 半群", "a(b+c)=ab+ac", "环 ⟨R,+,·⟩"],
    legend: [["key", "零元 0"], ["cur", "当前计算"], ["ok", "成立"], ["bad", "反例"]],
    controls: function (st) {
      var E = range(st.c.n);
      function row(k, lab) {
        return '<div class="ctrl-row"><label>' + lab + '</label><div class="chip-row">' + E.map(function (x) {
          return '<button type="button" class="pick' + (st.p[k] === x ? " on" : "") + '" data-pick="' + k + '" data-val="' + x + '">' + x + "</button>";
        }).join("") + "</div></div>";
      }
      return row("a", "元素 a") + row("b", "元素 b") + row("c", "元素 c <small>分配律用</small>");
    },
    title: function (st) { return st.c.label.replace(/^反例：/, ""); },
    sub: function (st) {
      return ["加法表：每行每列都是一个排列（可逆），0 是零元，a 与 −a 相加得 0。",
        "乘法表：结果仍落在集合里（封闭），且满足结合律，构成半群。",
        "分配律把两种运算联结起来：先加后乘 = 先乘后加。",
        "三条公理全部成立 ⇒ 环；再看乘法是否交换、是否有单位元 1。"][st.step];
    },
    draw: function (st) {
      var R = ringOf(st.c), a = st.p.a, b = st.p.b, c = st.p.c, E = R.els;
      var addT = H.table(E, R.add, function (x, y, v) {
        if (st.step === 0 && x === a && y === R.neg(a)) return "hot";
        if (st.step === 2 && x === b && y === c) return "hot";
        return v === 0 ? "key" : "";
      }, "加法表 " + "+" + (st.c.n), "+");
      var mulT = H.table(E, R.mul, function (x, y) {
        if (st.step === 1 && x === a && y === b) return "hot";
        if (st.step === 2 && x === a && (y === R.add(b, c) || y === b || y === c)) return "hot";
        return "";
      }, "乘法表 " + (st.c.max ? "max" : "·" + st.c.n), R.mulSym);
      if (st.step === 0) return '<div class="tbl-row">' + addT + "</div>" + calc0(st, R);
      if (st.step === 1) return '<div class="tbl-row">' + mulT + "</div>" + calc1(st, R);
      if (st.step === 2) return '<div class="tbl-row">' + addT + mulT + "</div>" + calc2(st, R);
      return checklist(st, R);
    },
    feedback: function (st) {
      var R = ringOf(st.c), K = checkAll(R);
      return [
        "<b>加法群</b>：⟨Z" + sub(st.c.n) + ",+⟩ 封闭、结合，零元为 0，任意 a 的负元 −a = n−a；加法可交换 ⇒ 阿贝尔群。",
        "<b>乘法半群</b>：只要求封闭与结合，" + (K.mulAssoc ? "本例乘法结合律 <span class=\"ok\">成立</span>。" : "<span class=\"bad\">结合律不成立</span>。") + "注意：环不要求乘法可逆。",
        "<b>分配律</b>：" + (K.dist ? "对所有 a,b,c 检验 " + Math.pow(st.c.n, 3) + " 组，全部 <span class=\"ok\">成立</span>。" : "发现反例 a=" + K.distBad[0] + ", b=" + K.distBad[1] + ", c=" + K.distBad[2] + "：左边 " + K.distBad[3] + " ≠ 右边 " + K.distBad[4] + "，<span class=\"bad\">分配律不成立</span>。"),
        "<b>结论</b>：" + (K.dist && K.mulAssoc ? "三条公理都成立，是<b>环</b>；乘法" + (K.comm ? "可交换" : "不交换") + (K.one != null ? "，有单位元 1" : "") + " ⇒ <b>交换含幺环</b>。" : "缺少分配律，两种运算没有被『联结』起来，<b>不是环</b>。")
      ][st.step];
    },
    result: function (st) {
      var R = ringOf(st.c), K = checkAll(R);
      return "<b>当前系统</b>：" + esc(st.c.label.replace(/^反例：/, "")) + "<br>" +
        "加法群 " + H.verdict(K.addAssoc) + "　乘法半群 " + H.verdict(K.mulAssoc) + "<br>" +
        "分配律 " + H.verdict(K.dist) + "　环 " + H.verdict(K.addAssoc && K.mulAssoc && K.dist, "是环", "不是环");
    },
    knowledge: [
      "环 ⟨R,+,·⟩：⟨R,+⟩ 是阿贝尔群，⟨R,·⟩ 是半群，乘法对加法满足左右分配律。",
      "加法单位元记作 0（零元），a 的加法逆元记作 −a（负元）。",
      "乘法可交换 ⇒ 交换环；有乘法单位元 1 ⇒ 含幺环。",
      "由分配律可推出 a·0 = 0·a = 0，(−a)·b = −(a·b)。"
    ],
    insight: {
      title: "🤝 两种运算，一套规则",
      text: "加法与乘法各有自己的规则，分配律把它们联结成一个整体——少了这一条，两种运算就只是『并排放着』，不再构成环。复杂系统中的各个部分也是如此：各自有序之外，更需要一条把它们协调起来的共同规则。",
      badges: ["辩证思维", "协调发展", "系统观念"]
    }
  };
  function sub(n) { return String(n).replace(/\d/g, function (d) { return "₀₁₂₃₄₅₆₇₈₉"[d]; }); }
  function calc0(st, R) {
    var a = st.p.a;
    return '<div class="calc-card">负元：<b>' + a + " + " + R.neg(a) + " ≡ 0</b> (mod " + st.c.n + ")　⇒　−" + a + " = " + R.neg(a) + "<br>交换：" + a + " + " + st.p.b + " = " + R.add(a, st.p.b) + " = " + st.p.b + " + " + a + "</div>";
  }
  function calc1(st, R) {
    var a = st.p.a, b = st.p.b, c = st.p.c;
    var l = R.mul(R.mul(a, b), c), r = R.mul(a, R.mul(b, c));
    return '<div class="calc-card">' + a + " " + R.mulSym + " " + b + " = <b>" + R.mul(a, b) + "</b> ∈ Z" + sub(st.c.n) + "（封闭）<br>结合：(" + a + R.mulSym + b + ")" + R.mulSym + c + " = " + l + "，" + a + R.mulSym + "(" + b + R.mulSym + c + ") = " + r + "　" + (l === r ? '<span class="ok">相等</span>' : '<span class="bad">不等</span>') + "</div>";
  }
  function calc2(st, R) {
    var a = st.p.a, b = st.p.b, c = st.p.c, m = R.mulSym;
    var l = R.mul(a, R.add(b, c)), r = R.add(R.mul(a, b), R.mul(a, c));
    return '<div class="calc-card">左：' + a + " " + m + " (" + b + " + " + c + ") = " + a + " " + m + " " + R.add(b, c) + " = <b>" + l + "</b><br>右：" + a + m + b + " + " + a + m + c + " = " + R.mul(a, b) + " + " + R.mul(a, c) + " = <b>" + r + "</b>　" + (l === r ? '<span class="ok">✓ 相等</span>' : '<span class="bad">✗ 不等</span>') + "</div>";
  }
  function checklist(st, R) {
    var K = checkAll(R), rows = [
      ["⟨R,+⟩ 阿贝尔群", K.addAssoc], ["⟨R,·⟩ 半群", K.mulAssoc], ["分配律", K.dist],
      ["乘法交换", K.comm], ["含单位元 1", K.one != null]
    ];
    var s = "", y = 70;
    s += H.text(360, 40, st.c.label.replace(/^反例：/, "") + " 的公理清单", { size: 18, color: "#d63b1d", weight: 800 });
    rows.forEach(function (r, i) {
      var ok = r[1], yy = y + i * 58;
      s += H.box(170, yy, 250, 42, r[0], i < 3 ? (ok ? "ok" : "bad") : (ok ? "cur" : "dim"), 15);
      s += H.text(470, yy + 27, ok ? "✓ 成立" : "✗ 不成立", { size: 15, color: ok ? "#2f7d57" : "#c0392b", anchor: "start" });
      if (i === 2) s += H.line(150, yy + 52, 570, yy + 52, "dim");
    });
    var isRing = K.addAssoc && K.mulAssoc && K.dist;
    s += H.text(360, 405, isRing ? "前三条成立 ⇒ 环；后两条也成立 ⇒ 交换含幺环" : "分配律缺失 ⇒ 不是环", { size: 15, color: isRing ? "#2f7d57" : "#c0392b", weight: 800 });
    return H.svg(s, 720, 430);
  }

  /* ---------- 拓展层：有限域 ---------- */
  function polyMul(a, b, p) { // GF(2)[x] 次数 <2 的多项式，p 为 3 位模多项式
    var r = 0;
    for (var i = 0; i < 2; i++) if ((b >> i) & 1) r ^= (a << i);
    if (r & 4) r ^= p;
    return r;
  }
  var PL = ["0", "1", "x", "x+1"];
  function fieldOf(c) {
    if (c.poly) return {
      els: [0, 1, 2, 3], add: function (a, b) { return a ^ b; }, mul: function (a, b) { return polyMul(a, b, c.poly); },
      show: function (v) { return PL[v]; }
    };
    return { els: range(c.n), add: function (a, b) { return mod(a + b, c.n); }, mul: function (a, b) { return mod(a * b, c.n); }, show: function (v) { return v; } };
  }
  function analyze(F) {
    var inv = {}, zd = {};
    F.els.forEach(function (a) {
      if (a === 0) return;
      F.els.forEach(function (b) {
        if (b === 0) return;
        if (F.mul(a, b) === 1 && inv[a] == null) inv[a] = b;
        if (F.mul(a, b) === 0 && zd[a] == null) zd[a] = b;
      });
    });
    return { inv: inv, zd: zd, field: F.els.every(function (a) { return a === 0 || inv[a] != null; }) };
  }
  var extend = {
    stepTitle: "四步构造有限域",
    stepHint: "从运算表到逆元，再到工程应用",
    mission: "有限环什么时候是域？比较素数模 Zₚ、合数模 Zₙ 与多项式商环 Z₂[x]/(p(x))：找出零因子与逆元，判定是否为域，并看有限域如何支撑纠错码与密码。",
    badge: "GF(p) · GF(2²)",
    caseLabel: "选择有限环",
    cases: [
      { label: "GF(4) = Z₂[x]/(x²+x+1)（不可约）", poly: 7, name: "Z₂[x]/(x²+x+1)" },
      { label: "Z₂[x]/(x²+1)（可约：x²+1=(x+1)²）", poly: 5, name: "Z₂[x]/(x²+1)" },
      { label: "Z₇（素数模）", n: 7, name: "Z₇" },
      { label: "Z₈（合数模）", n: 8, name: "Z₈" }
    ],
    init: function (st) { st.p.a = 2; },
    steps: [
      { t: "元素与加法", s: "加法群", tok: 0 },
      { t: "乘法表", s: "模 p(x) / 模 n 约化", tok: 1 },
      { t: "逆元与零因子", s: "逐元检查", tok: 2 },
      { t: "判定与应用", s: "域 ⇔ 非零元可逆", tok: 3 }
    ],
    tokens: ["a+b", "a·b mod p(x)", "a·a⁻¹=1", "GF(pⁿ)"],
    legend: [["key", "单位元 1"], ["cur", "当前元素"], ["ok", "可逆"], ["bad", "零因子"]],
    controls: function (st) {
      var F = fieldOf(st.c);
      return '<div class="ctrl-row"><label>考察元素 a</label><div class="chip-row">' + F.els.filter(function (x) { return x !== 0; }).map(function (x) {
        return '<button type="button" class="pick' + (st.p.a === x ? " on" : "") + '" data-pick="a" data-val="' + x + '">' + esc(F.show(x)) + "</button>";
      }).join("") + "</div></div>";
    },
    title: function (st) { return st.c.name + " 的结构"; },
    sub: function (st) {
      return [
        st.c.poly ? "元素是次数 < 2 的 Z₂ 系数多项式；加法逐系数模 2（相当于按位异或）。" : "元素是模 " + st.c.n + " 的剩余类；加法模 " + st.c.n + "。",
        st.c.poly ? "乘法先按多项式相乘，再用 x² = " + (st.c.poly === 7 ? "x+1" : "1") + " 约化（即模 p(x) 取余）。" : "乘法模 " + st.c.n + "；表中 1 所在位置对应一对互逆元。",
        "逐个检查非零元：能乘出 1 的有逆元；能与非零元乘出 0 的是零因子。二者不可兼得。",
        "有限交换含幺环中：无零因子 ⇔ 每个非零元可逆 ⇔ 是域。"
      ][st.step];
    },
    draw: function (st) {
      var F = fieldOf(st.c), A = analyze(F), a = st.p.a;
      if (F.els.indexOf(a) < 0) a = 1;
      var hotRow = st.step >= 1;
      if (st.step === 0) return '<div class="tbl-row">' + H.table(F.els, F.add, function (x, y, v) { return x === a && v === 0 ? "hot" : (v === 0 ? "key" : ""); }, "加法表", "+", F.show) + "</div>" +
        '<div class="calc-card">' + (st.c.poly ? "(x) + (x+1) = 2x + 1 ≡ <b>1</b>（系数模 2）" : "a + (n − a) ≡ <b>0</b>") + "　——加法群是任何环的基础</div>";
      if (st.step === 1 || st.step === 2) {
        var t = H.table(F.els, F.mul, function (x, y, v) {
          if (x === 0 || y === 0) return "dim";
          if (x === a && hotRow) return v === 1 ? "okc" : v === 0 ? "badc" : "hot";
          if (v === 1) return "key";
          if (v === 0) return "badc";
          return "";
        }, "乘法表", "·", F.show);
        var cards = "";
        if (st.step === 2) {
          cards = '<div class="calc-card">' + F.els.filter(function (x) { return x; }).map(function (x) {
            return x + "" === a + "" ? "<b>" + esc(F.show(x)) + "</b>：" + (A.inv[x] != null ? '<span class="ok">逆元 ' + esc(F.show(A.inv[x])) + "</span>" : '<span class="bad">零因子（·' + esc(F.show(A.zd[x])) + "=0）</span>")
              : esc(F.show(x)) + "：" + (A.inv[x] != null ? "逆元 " + esc(F.show(A.inv[x])) : "零因子");
          }).join("　|　") + "</div>";
        } else if (st.c.poly) {
          var pr = F.mul(a, a);
          cards = '<div class="calc-card">' + esc(F.show(a)) + " · " + esc(F.show(a)) + " = " + (a === 2 ? "x²" : a === 3 ? "x²+1" : "1") + " ≡ <b>" + esc(F.show(pr)) + "</b>（用 x² = " + (st.c.poly === 7 ? "x+1" : "1") + " 约化）</div>";
        }
        return '<div class="tbl-row">' + t + "</div>" + cards;
      }
      return summary(st, F, A);
    },
    feedback: function (st) {
      var F = fieldOf(st.c), A = analyze(F), a = F.els.indexOf(st.p.a) < 0 ? 1 : st.p.a;
      return [
        "<b>加法</b>：" + (st.c.poly ? "4 个元素 0,1,x,x+1，每个元素都是自己的负元（2 = 0）。" : "Z" + sub(st.c.n) + " 的加法群是循环群。"),
        "<b>乘法</b>：当前 a = " + esc(F.show(a)) + "，看它所在的行：" + (A.inv[a] != null ? "出现了 1，a 可逆。" : "出现了 0，a 是零因子。"),
        "<b>逆元/零因子</b>：非零元中可逆 " + Object.keys(A.inv).length + " 个，零因子 " + Object.keys(A.zd).length + " 个。" + (st.c.poly === 5 ? "(x+1)² = x²+1 ≡ 0，出现零因子。" : ""),
        "<b>判定</b>：" + (A.field ? st.c.name + " 是<b>域</b>——可以做『除法』，这正是编码与密码运算需要的。" : st.c.name + " <b>不是域</b>：零因子让『除法』失效，消去律也不成立。")
      ][st.step];
    },
    result: function (st) {
      var F = fieldOf(st.c), A = analyze(F);
      return "<b>" + esc(st.c.name) + "</b>　元素数 " + F.els.length + "<br>可逆元：" + H.set(Object.keys(A.inv).map(function (k) { return F.show(+k); })) +
        "<br>零因子：" + (Object.keys(A.zd).length ? H.set(Object.keys(A.zd).map(function (k) { return F.show(+k); })) : "无") + "<br>是否为域：" + H.verdict(A.field, "是域", "不是域");
    },
    knowledge: [
      "域：交换含幺环且每个非零元都有乘法逆元；域一定无零因子（是整环）。",
      "有限整环必是域；Zₙ 是域 ⇔ n 是素数。",
      "p(x) 在 Zₚ 上不可约且次数为 n ⇒ Zₚ[x]/(p(x)) 是 pⁿ 元有限域 GF(pⁿ)。",
      "AES 在 GF(2⁸) 中运算（模 x⁸+x⁴+x³+x+1）；Reed–Solomon 码（二维码、光盘等）也建立在 GF(2⁸) 上。"
    ],
    insight: {
      title: "🔐 可以『除』的世界",
      text: "域的价值在于：每个非零元都能『除』，方程 a·x = b（a≠0）总有唯一解。纠错码的解码、密码算法的逆运算都依赖这一点。把不可约多项式作为模、在有限集合里造出一个完整的域，是基础理论转化为工程能力的典型例子。",
      badges: ["科学精神", "自立自强", "系统观念"]
    }
  };
  function summary(st, F, A) {
    var n = F.els.length, cx = 360, cy = 215, R = 140, s = "";
    s += H.text(360, 34, st.c.name + "：非零元的去向", { size: 17, color: "#d63b1d", weight: 800 });
    var nz = F.els.filter(function (x) { return x; });
    var pos = {};
    nz.forEach(function (x, i) { var t = -Math.PI / 2 + i * 2 * Math.PI / nz.length; pos[x] = [cx + R * Math.cos(t), cy + R * Math.sin(t)]; });
    nz.forEach(function (x) {
      if (A.inv[x] != null && A.inv[x] !== x && x < A.inv[x]) s += H.line(pos[x][0], pos[x][1], pos[A.inv[x]][0], pos[A.inv[x]][1], "ok");
    });
    nz.forEach(function (x) { nz.forEach(function (y) { if (x < y && F.mul(x, y) === 0) s += H.line(pos[x][0], pos[x][1], pos[y][0], pos[y][1], "bad"); }); });
    nz.forEach(function (x) { s += H.node(pos[x][0], pos[x][1], F.show(x), x === st.p.a ? "cur" : A.inv[x] != null ? (x === 1 ? "key" : "ok") : "bad", 24); });
    s += H.text(360, 400, A.field ? "绿线连接互逆元（自逆元无连线）——所有非零元都可逆 ⇒ 域" : "红色虚线连接乘积为 0 的零因子对 ⇒ 不是域", { size: 14, color: A.field ? "#2f7d57" : "#c0392b" });
    return H.svg(s, 720, 420);
  }

  CH11.mount({ basic: basic, extend: extend });
})();
