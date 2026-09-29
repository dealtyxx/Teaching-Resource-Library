/* 10.1 群定义及性质 —— 三层模块（由 ../group-lab/group-lab.js 渲染）
 *   基础层：群的四公理（逐条判定运算表，给出 广群/半群/独异点/群 分类）
 *   进阶层：群的基本性质（消去律与拉丁方、方程唯一解、单位元与逆元唯一、穿脱原理）
 *   拓展层：对称与可逆（正三角形对称群 D₃、凯撒密码 ⟨Z₂₆,+⟩、异或与奇偶校验）
 */
(function () {
  "use strict";
  var GL = window.GroupLab, U = GL.U, G = GL.G, D = GL.D, P = GL.P;

  /* ---------------- 基础层：四公理 ---------------- */
  var STRUCTS = {
    z5: function () { return G.Zadd(5); },
    u5: function () { return G.Zmul(5, [1, 2, 3, 4], "⟨{1,2,3,4}, ×₅⟩"); },
    z6m: function () { return G.Zmul(6); },
    max: function () { return G.Struct("⟨{0,1,2,3}, max⟩", [0, 1, 2, 3], Math.max, { sym: "max" }); },
    sub: function () { return G.Struct("⟨Z₄, a−b mod 4⟩", [0, 1, 2, 3], function (a, b) { return U.mod(a - b, 4); }, { sym: "−" }); },
    add3: function () { return G.Struct("⟨{0,1,2}, 普通加法⟩", [0, 1, 2], function (a, b) { return a + b; }, { sym: "+" }); }
  };

  function axioms(S) {
    var n = S.n, clo = S.closed(), asf = clo ? null : S.assocFail(), e = clo ? -1 : S.e;
    var invs = U.range(n).map(function (i) { return e < 0 ? -1 : S.inv(i); });
    var allInv = e >= 0 && invs.every(function (x) { return x >= 0; });
    var ab = clo ? null : S.abelian();
    var steps = [];
    steps.push({ t: "封闭性：a∘b 是否都在集合中",
      d: clo ? "发现 " + U.m(S.lab(clo[0]) + " " + S.sym + " " + S.lab(clo[1]) + " = " + S.rawLab(clo[0], clo[1])) + " " + U.bad("不在集合中") + "，封闭性不成立。"
             : "运算表 " + n + "×" + n + " = " + n * n + " 个结果全部落在集合内，" + U.ok("封闭性成立") + "。" });
    if (clo) {
      steps.push({ t: "其余公理无从谈起", d: "运算不封闭时 ⟨S,∘⟩ 连代数系统都不是，结合律、单位元、逆元的检验失去前提。" });
    } else {
      var a = asf;
      steps.push({ t: "结合律：(a∘b)∘c = a∘(b∘c)",
        d: asf ? "反例 a=" + S.lab(a[0]) + ", b=" + S.lab(a[1]) + ", c=" + S.lab(a[2]) + "：" +
                 U.m("(" + S.lab(a[0]) + S.sym + S.lab(a[1]) + ")" + S.sym + S.lab(a[2]) + " = " + S.lab(S.T[S.T[a[0]][a[1]]][a[2]])) + "，而 " +
                 U.m(S.lab(a[0]) + S.sym + "(" + S.lab(a[1]) + S.sym + S.lab(a[2]) + ") = " + S.lab(S.T[a[0]][S.T[a[1]][a[2]]])) + "，" + U.bad("结合律不成立") + "。"
               : "逐一验算全部 " + n + "³ = " + n * n * n + " 组 (a,b,c)，两边处处相等，" + U.ok("结合律成立") + "。" });
      steps.push({ t: "单位元：e∘x = x∘e = x",
        d: e >= 0 ? "第 " + S.lab(e) + " 行、第 " + S.lab(e) + " 列与表头完全相同，单位元 " + U.m("e = " + S.lab(e)) + "。"
                  : U.bad("找不到单位元") + "：没有哪一行和哪一列同时与表头一致。" + (S.sym === "−" ? "注意 a−0=a，但 0−a≠a，0 只是「右单位元」。" : "") });
      if (e >= 0) {
        var lack = U.range(n).filter(function (i) { return invs[i] < 0; });
        steps.push({ t: "逆元：a∘a⁻¹ = a⁻¹∘a = e",
          d: allInv ? "每行、每列恰有一个 " + S.lab(e) + "：" + U.range(n).map(function (i) { return U.m(S.lab(i) + "⁻¹=" + S.lab(invs[i])); }).join("，") + "，" + U.ok("逆元都存在") + "。"
                    : "元素 " + U.m(lack.map(S.lab).join(", ")) + " 的行里找不到单位元 " + S.lab(e) + "，" + U.bad("没有逆元") + "。" });
      } else {
        steps.push({ t: "逆元：依赖单位元", d: "没有单位元，就无法谈论逆元。" });
      }
    }
    var kind, chip;
    if (clo) { kind = "bad"; chip = "不是代数系统"; }
    else if (asf) { kind = "bad"; chip = "只是广群"; }
    else if (e < 0) { kind = "bad"; chip = "半群（非独异点）"; }
    else if (!allInv) { kind = "bad"; chip = "独异点（非群）"; }
    else { kind = "ok"; chip = ab ? "群（非交换）" : "群 · 阿贝尔群"; }
    var reason = {
      "不是代数系统": "运算结果跑出了集合，不满足封闭性。",
      "只是广群": "封闭但不满足结合律——仅构成广群（原群）。",
      "半群（非独异点）": "封闭 + 结合 → 半群；缺单位元。",
      "独异点（非群）": "封闭 + 结合 + 单位元 → 独异点（含幺半群）；但有元素没有逆元，所以不是群。"
    }[chip] || ("四条公理全部满足，" + S.name + " 是 " + n + " 阶群" + (ab ? "；但存在 a∘b≠b∘a，不是交换群。" : "；运算表关于主对角线对称，还是交换群（阿贝尔群）。"));
    return {
      titles: { struct: ["运算表 · " + S.name, "高亮 = 当前检验"], viz: ["元素环 · 公理灯", "绿=通过 · 红=反例"] },
      intro: "选一个代数系统，点「下一步」依次检验 封闭 → 结合 → 单位元 → 逆元。",
      steps: steps,
      struct: function (k) {
        var s = steps[k] ? steps[k].t : "";
        return D.cayley(S, {
          cell: function (i, j, v) {
            if (s.indexOf("封闭") === 0) return clo ? (i === clo[0] && j === clo[1] ? "bad" : "") : "ok";
            if (s.indexOf("结合") === 0 && asf) {
              var a0 = asf[0], a1 = asf[1], a2 = asf[2], ab_ = S.T[a0][a1], bc = S.T[a1][a2];
              if ((i === a0 && j === a1) || (i === ab_ && j === a2)) return "cur";
              if ((i === a1 && j === a2) || (i === a0 && j === bc)) return "hl";
            }
            if (s.indexOf("单位元") === 0 && e >= 0 && (i === e || j === e)) return "hl";
            if (s.indexOf("逆元：a") === 0 && v === e) return invs[i] >= 0 ? "ok" : "";
            if (s.indexOf("逆元：a") === 0 && invs[i] < 0) return "dim";
            return "";
          },
          row: function (i) { return s.indexOf("逆元：a") === 0 && invs[i] < 0 ? "bad" : (s.indexOf("单位元") === 0 && i === e ? "hl" : ""); },
          col: function (j) { return s.indexOf("单位元") === 0 && j === e ? "hl" : ""; }
        }) + axiomLamps(k);
      },
      viz: function (k) {
        var s = steps[k] ? steps[k].t : "", cls = [], arrows = [];
        U.range(n).forEach(function (i) { cls[i] = ""; });
        if (s.indexOf("封闭") === 0 && clo) { cls[clo[0]] = "cur"; cls[clo[1]] = "cur"; }
        else if (s.indexOf("封闭") === 0) U.range(n).forEach(function (i) { cls[i] = "ok"; });
        if (s.indexOf("结合") === 0 && asf) asf.forEach(function (x) { cls[x] = "cur"; });
        if (s.indexOf("单位元") === 0 && e >= 0) cls[e] = "on";
        if (s.indexOf("逆元：a") === 0) {
          cls[e] = "on";
          U.range(n).forEach(function (i) {
            if (invs[i] < 0) { cls[i] = "bad"; return; }
            if (i !== e) cls[i] = "ok";
            if (invs[i] === i) { if (i !== e) arrows.push({ a: i, b: i, cls: "ok" }); }
            else if (i < invs[i]) arrows.push({ a: i, b: invs[i], cls: "ok" }, { a: invs[i], b: i, cls: "ok" });
          });
        }
        return D.ring({ labels: U.range(n).map(S.lab), cls: cls, arrows: arrows, center: [S.name, k < 0 ? "待检验" : ["封闭", "结合", "单位元", "逆元"][Math.min(k, 3)]] });
      },
      verdict: { kind: kind, chip: chip, reason: reason,
        insight: "判定顺序很重要：封闭是前提，结合决定能否写成「连乘」，单位元是基准，逆元让每一步都能撤销——四条缺一不可。" }
    };
    function axiomLamps(k) {
      var names = ["封闭", "结合", "单位元", "逆元"];
      var st = [!clo, !clo && !asf, !clo && e >= 0, allInv];
      return '<div class="gl-sets" style="grid-template-columns:repeat(4,1fr);margin-top:10px">' + names.map(function (nm, i) {
        var done = clo ? k >= Math.min(i, 1) : k >= i;
        return '<div class="gl-set ' + (done ? (st[i] ? "ok" : "bad") : "dim") + '" style="justify-content:center"><b>' + nm + "</b><span>" + (done ? (st[i] ? "✓" : "✗") : "…") + "</span></div>";
      }).join("") + "</div>";
    }
  }

  var basic = {
    legend: [["∘", "集合上的二元运算"], ['<i class="dot ok"></i>', "检验通过 / 互逆元素"], ['<i class="dot cur"></i>', "反例涉及的元素"], ['<i class="dot on"></i>', "单位元 e"], ["a⁻¹", "a 的逆元：a∘a⁻¹=a⁻¹∘a=e"]],
    caseLabel: "选择代数系统",
    cases: [
      { label: "⟨Z₅, +₅⟩ 模 5 加法", build: function () { return axioms(STRUCTS.z5()); } },
      { label: "⟨{1,2,3,4}, ×₅⟩ 模 5 乘法", build: function () { return axioms(STRUCTS.u5()); } },
      { label: "⟨Z₆, ×₆⟩ 模 6 乘法", build: function () { return axioms(STRUCTS.z6m()); } },
      { label: "⟨{0,1,2,3}, max⟩ 取最大", build: function () { return axioms(STRUCTS.max()); } },
      { label: "⟨Z₄, a−b mod 4⟩ 模减法", build: function () { return axioms(STRUCTS.sub()); } },
      { label: "⟨{0,1,2}, 普通加法⟩", build: function () { return axioms(STRUCTS.add3()); } }
    ]
  };

  /* ---------------- 进阶层：基本性质 ---------------- */
  var GROUPS = {
    s3: function () { return G.S3(); },
    z5: function () { return G.Zadd(5); },
    u8: function () { return G.U(8); },
    z6m: function () { return G.Zmul(6); }
  };

  function latin(key) {
    var S = GROUPS[key](), n = S.n, isG = S.isGroup();
    var steps = U.range(n).map(function (a) {
      var row = S.T[a], dup = firstDup(row);
      return { t: "第 " + S.lab(a) + " 行：x ↦ " + S.lab(a) + S.sym + "x",
        d: dup ? U.m(S.lab(a) + S.sym + S.lab(dup[0]) + " = " + S.lab(a) + S.sym + S.lab(dup[1]) + " = " + S.lab(row[dup[0]])) + "，但 " + S.lab(dup[0]) + "≠" + S.lab(dup[1]) + "，" + U.bad("左消去律失败") + "。"
                   : "这一行把 " + n + " 个元素各用了恰好一次——左乘 " + S.lab(a) + " 是 G 到 G 的双射，" + U.ok("可以消去") + "。", dup: dup };
    });
    steps.push({ t: "列检验：右消去律", d: U.range(n).every(function (b) { return !firstDup(U.range(n).map(function (x) { return S.T[x][b]; })); }) ?
      "每一列也各元素恰出现一次，" + U.ok("右消去律成立") + "。" : "有的列出现重复元素，" + U.bad("右消去律失败") + "。" });
    function firstDup(row) {
      for (var x = 0; x < row.length; x++) for (var y = x + 1; y < row.length; y++) if (row[x] === row[y]) return [x, y];
      return null;
    }
    return {
      titles: { struct: ["运算表 · " + S.name, "当前行高亮"], viz: ["左乘映射 x ↦ a∘x", "双射 ⇔ 可消去"] },
      intro: "群的运算表是一个「拉丁方」：每行每列各元素恰好出现一次。点「下一步」逐行检验。",
      steps: steps,
      struct: function (k) {
        var st = steps[k];
        return D.cayley(S, {
          row: function (i) { return k === i ? "cur" : ""; },
          cell: function (i, j) {
            if (k === n) { var col = U.range(n).map(function (x) { return S.T[x][j]; }); return new Set(col).size === n ? "ok" : "bad"; }
            if (i !== k) return k >= 0 && k < n ? "dim" : "";
            return st.dup && (j === st.dup[0] || j === st.dup[1]) ? "bad" : "ok";
          }
        });
      },
      viz: function (k) {
        var a = k >= 0 && k < n ? k : (k === n ? n - 1 : 0), row = S.T[a], dup = steps[a].dup;
        var hits = {}; row.forEach(function (v) { hits[v] = (hits[v] || 0) + 1; });
        return D.mapping({ L: U.range(n).map(S.lab), R: U.range(n).map(S.lab), map: row, titles: ["x", S.lab(a) + " " + S.sym + " x"],
          acls: U.range(n).map(function (x) { return dup && (x === dup[0] || x === dup[1]) ? "bad" : "ok"; }),
          rcls: U.range(n).map(function (y) { return !hits[y] ? "dim" : hits[y] > 1 ? "bad" : "ok"; }), boxW: 70 });
      },
      verdict: isG ? { kind: "ok", chip: "消去律成立", reason: S.name + " 是群：由 " + U.m("a∘x = a∘y") + " 两边左乘 " + U.m("a⁻¹") + " 得 " + U.m("x = y") + "。运算表每行每列都是 G 的一个排列（拉丁方）。",
        insight: "消去律依赖逆元与结合律；它等价于「左乘、右乘都是双射」，这也是凯莱定理（每个群都同构于某个置换群）的出发点。" }
        : { kind: "bad", chip: "消去律失败", reason: S.name + " 不是群：有的元素没有逆元，左乘它不是单射，出现 " + U.m("a∘x = a∘y 但 x ≠ y") + "。",
        insight: "例如在 Z₆ 中 2×1 = 2×4 = 2，不能两边「约去 2」——因为 2 在 ×₆ 下没有逆元。" }
    };
  }

  function equation(p) {
    var S = G.S3(), a = p.a, b = p.b, ai = S.inv(a);
    var x = S.T[ai][b], y = S.T[b][ai];
    var steps = [
      { t: "求 a⁻¹", d: "在第 " + S.lab(a) + " 行找到单位元 e 所在的列：" + U.m(S.lab(a) + "⁻¹ = " + S.lab(ai)) + "。" },
      { t: "左方程 a∘x = b", d: "两边左乘 a⁻¹：" + U.m("x = a⁻¹∘b = " + S.lab(ai) + "∘" + S.lab(b) + " = " + S.lab(x)) + "。验算 " + U.m(S.lab(a) + "∘" + S.lab(x) + " = " + S.lab(S.T[a][x])) + " ✓" },
      { t: "右方程 y∘a = b", d: "两边右乘 a⁻¹：" + U.m("y = b∘a⁻¹ = " + S.lab(b) + "∘" + S.lab(ai) + " = " + S.lab(y)) + "。验算 " + U.m(S.lab(y) + "∘" + S.lab(a) + " = " + S.lab(S.T[y][a])) + " ✓" },
      { t: "唯一性", d: "第 " + S.lab(a) + " 行中 " + S.lab(b) + " 只出现一次，所以 x 唯一；第 " + S.lab(a) + " 列中 " + S.lab(b) + " 只出现一次，所以 y 唯一。" },
      { t: "比较 x 与 y", d: x === y ? "本例 x = y = " + U.m(S.lab(x)) + "。" : "本例 " + U.m("x = " + S.lab(x) + " ≠ y = " + S.lab(y)) + "：S₃ 不交换，左、右方程的解可以不同。" }
    ];
    return {
      titles: { struct: ["S₃ 运算表", "约定 στ：先 τ 后 σ"], viz: ["解的位置", "红：x · 金：y"] },
      intro: "在非交换群 S₃ 中解 a∘x = b 与 y∘a = b。置换乘积约定：στ 表示先作 τ 再作 σ。",
      steps: steps,
      struct: function (k) {
        return D.cayley(S, {
          row: function (i) { return i === a && k >= 0 ? "cur" : ""; },
          col: function (j) { return j === a && k >= 2 ? "hl" : ""; },
          cell: function (i, j) {
            if (k === 0 && i === a && j === ai) return "ok";
            if (k >= 1 && i === a && j === x) return "cur";
            if (k >= 2 && i === y && j === a) return "hl";
            return "";
          }
        });
      },
      viz: function (k) {
        var cls = U.range(6).map(function () { return ""; }), arrows = [];
        cls[a] = "cur"; cls[b] = "ok";
        if (k >= 0) cls[ai] = cls[ai] || "on";
        if (k >= 1) arrows.push({ a: x, b: b, cls: "cur", label: S.lab(a) + "∘x", bend: 18 });
        if (k >= 2) arrows.push({ a: y, b: b, cls: "on", label: "y∘" + S.lab(a), bend: -18 });
        var tags = U.range(6).map(function (i) { var t = []; if (i === a) t.push("a"); if (i === b) t.push("b"); if (k >= 1 && i === x) t.push("x"); if (k >= 2 && i === y) t.push("y"); return t.join("="); });
        return D.ring({ labels: U.range(6).map(S.lab), cls: cls, arrows: arrows, tags: tags, center: ["a∘x = b", k >= 2 ? "x=" + S.lab(x) + "，y=" + S.lab(y) : ""] });
      },
      verdict: { kind: "ok", chip: "唯一解", reason: "群中方程 " + U.m("a∘x=b") + " 有唯一解 " + U.m("x=a⁻¹∘b") + "，" + U.m("y∘a=b") + " 有唯一解 " + U.m("y=b∘a⁻¹") + "。本例 x=" + U.m(S.lab(x)) + "，y=" + U.m(S.lab(y)) + "。",
        insight: "逆元让「除法」在群里有了意义；但在非交换群中必须分清左右——这正是矩阵方程 AX=B 与 XA=B 解不同的原因。" }
    };
  }

  function uniqueness(key) {
    var S = GROUPS[key](), n = S.n, e = S.e;
    var a = key === "s3" ? 1 : 1, b = key === "s3" ? 4 : 2;
    var ab = S.T[a][b], abi = S.inv(ab), ai = S.inv(a), bi = S.inv(b);
    var steps = [
      { t: "单位元唯一", d: "设 e、e′ 都是单位元，则 " + U.m("e = e∘e′ = e′") + "（第一个等号用 e′ 是单位元，第二个用 e 是单位元）。" },
      { t: "逆元唯一", d: "设 b、c 都是 a 的逆元，则 " + U.m("b = b∘e = b∘(a∘c) = (b∘a)∘c = e∘c = c") + "——用到结合律。" },
      { t: "在 " + S.name + " 中核对", d: "每一行恰有一个单位元 " + U.m(S.lab(e)) + "，于是每个元素的逆元唯一：" + U.range(n).map(function (i) { return U.m(S.lab(i) + "⁻¹=" + S.lab(S.inv(i))); }).join("，") + "。" },
      { t: "穿脱原理 (a∘b)⁻¹ = b⁻¹∘a⁻¹", d: "取 a=" + U.m(S.lab(a)) + "，b=" + U.m(S.lab(b)) + "：" + U.m("(a∘b)⁻¹ = " + S.lab(ab) + "⁻¹ = " + S.lab(abi)) + "，" +
          U.m("b⁻¹∘a⁻¹ = " + S.lab(bi) + "∘" + S.lab(ai) + " = " + S.lab(S.T[bi][ai])) + (S.T[ai][bi] !== abi ? "，而 " + U.m("a⁻¹∘b⁻¹ = " + S.lab(S.T[ai][bi])) + " 不相等——顺序要反过来。" : "。") }
    ];
    return {
      titles: { struct: ["运算表 · " + S.name, "绿 = 单位元位置"], viz: ["逆元配对", "互逆双箭头 · 自逆小圈"] },
      intro: "先用两行推理证明唯一性，再在具体群中核对，最后验证「先穿后脱」的逆元公式。",
      steps: steps,
      struct: function (k) {
        return D.cayley(S, {
          cell: function (i, j, v) {
            if (k === 3 && ((i === a && j === b) || (i === bi && j === ai))) return "cur";
            if (k >= 2 && v === e) return "ok";
            return "";
          },
          row: function (i) { return k === 0 && i === e ? "hl" : ""; },
          col: function (j) { return k === 0 && j === e ? "hl" : ""; }
        });
      },
      viz: function (k) {
        var cls = [], arrows = [];
        U.range(n).forEach(function (i) {
          cls[i] = i === e ? "on" : k >= 2 ? "ok" : "";
          var j = S.inv(i);
          if (k >= 1 && i !== e) { if (j === i) arrows.push({ a: i, b: i, cls: "ok" }); else arrows.push({ a: i, b: j, cls: "ok" }); }
        });
        if (k === 3) { cls[a] = "cur"; cls[b] = "cur"; }
        return D.ring({ labels: U.range(n).map(S.lab), cls: cls, arrows: arrows, center: [S.name, "e = " + S.lab(e)] });
      },
      verdict: { kind: "ok", chip: "唯一 · 可逆", reason: "群中单位元唯一、每个元素的逆元唯一，且 " + U.m("(a∘b)⁻¹ = b⁻¹∘a⁻¹") + "、" + U.m("(a⁻¹)⁻¹ = a") + "。",
        insight: "「先穿袜子后穿鞋，脱时先脱鞋后脱袜」：撤销一串操作要按相反顺序逐个撤销。" }
    };
  }

  var advanced = {
    legend: [["拉丁方", "每行每列各元素恰好一次"], ["a⁻¹∘b", "左方程 a∘x=b 的解"], ["b∘a⁻¹", "右方程 y∘a=b 的解"], ["(ab)⁻¹", "= b⁻¹a⁻¹ 穿脱原理"], ["στ", "置换乘积：先 τ 后 σ"]],
    caseLabel: "选择性质",
    cases: [
      { label: "消去律与拉丁方", params: [{ id: "g", label: "代数系统", type: "select", value: "s3", options: [["s3", "S₃（非交换群）"], ["z5", "⟨Z₅,+₅⟩"], ["u8", "U(8)={1,3,5,7}"], ["z6m", "⟨Z₆,×₆⟩（对照：非群）"]] }],
        build: function (p) { return latin(p.g); } },
      { label: "解方程 a∘x=b 与 y∘a=b", params: [
          { id: "a", label: "元素 a", type: "select", value: 1, options: [[0, "e"], [1, "(12)"], [2, "(13)"], [3, "(23)"], [4, "(123)"], [5, "(132)"]] },
          { id: "b", label: "元素 b", type: "select", value: 4, options: [[0, "e"], [1, "(12)"], [2, "(13)"], [3, "(23)"], [4, "(123)"], [5, "(132)"]] }],
        build: equation },
      { label: "单位元、逆元唯一与穿脱原理", params: [{ id: "g", label: "群", type: "select", value: "s3", options: [["s3", "S₃"], ["u8", "U(8)"], ["z5", "⟨Z₅,+₅⟩"]] }],
        build: function (p) { return uniqueness(p.g); } }
    ]
  };

  /* ---------------- 拓展层：对称与可逆 ---------------- */
  function d3() {
    var S = G.D(3), n = 6;
    var steps = U.range(n).map(function (i) {
      var k = i % 3, refl = i >= 3;
      return { t: "对称 " + S.lab(i), d: refl ? "翻折：沿图中绿色对称轴翻转。顶点置换 " + U.m(P.str(S.perm(i))) + "。"
        : i === 0 ? "恒等变换：什么都不动，是单位元。" : "按图中箭头方向旋转 " + k * 120 + "°。顶点置换 " + U.m(P.str(S.perm(i))) + "。" };
    });
    var r = 1, s = 3, rs = S.T[r][s], sr = S.T[s][r];
    steps.push({ t: "合成不交换", d: U.m("r∘s = " + S.lab(rs)) + "（先 s 后 r），" + U.m("s∘r = " + S.lab(sr)) + "（先 r 后 s）——顺序不同结果不同，D₃ 是非交换群。" });
    steps.push({ t: "每个对称都能撤销", d: "旋转 120° 的逆是旋转 240°：" + U.m("r⁻¹ = r²") + "；每个翻折再翻一次就复原：" + U.m("s⁻¹ = s") + "。" });
    return {
      titles: { struct: ["D₃ 运算表", "当前对称的行高亮"], viz: ["正三角形", "数字=顶点，位i=位置"] },
      intro: "正三角形的全部对称：3 个旋转 + 3 个翻折。点「下一步」逐个观看，再看它们如何合成。",
      steps: steps,
      struct: function (k) {
        return D.cayley(S, {
          row: function (i) { return (k < n && i === k) || (k === n && (i === r || i === s)) ? "cur" : ""; },
          cell: function (i, j) {
            if (k === n && ((i === r && j === s) || (i === s && j === r))) return "cur";
            if (k === n + 1 && S.T[i][j] === 0) return "ok";
            return "";
          }
        });
      },
      viz: function (k) {
        var i = k < 0 ? 0 : k < n ? k : k === n ? rs : 0;
        var ki = i % 3;
        return D.polygon({ n: 3, perm: S.perm(i), axis: i >= 3 ? ki / 2 : null, rot: i < 3 ? ki : 0 });
      },
      verdict: { kind: "info", chip: "D₃：6 阶非交换群", reason: "正三角形的 6 个对称在「合成」下封闭、满足结合律，恒等变换为单位元，每个对称可撤销——构成群 D₃。它把 3 个顶点作置换，恰好给出 S₃ 的全部 3! = 6 个置换，所以 " + U.m("D₃ ≅ S₃") + "。",
        insight: "「对称」就是「保持形状不变的可逆变换」，全体对称自然构成群——群论因此成为研究晶体、分子与图案对称的语言。" }
    };
  }

  function caesar(p) {
    var k = p.k, msg = p.msg, A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    var enc = msg.split("").map(function (c) { return A[(A.indexOf(c) + k) % 26]; });
    var steps = msg.split("").map(function (c, i) {
      return { t: "加密 " + c + " → " + enc[i], d: U.m(c + "(" + A.indexOf(c) + ") + " + k + " ≡ " + (A.indexOf(c) + k) % 26 + " (mod 26) → " + enc[i]) };
    });
    steps.push({ t: "用逆元解密", d: "密钥 k 在 ⟨Z₂₆,+⟩ 中的逆元是 " + U.m("−" + k + " ≡ " + (26 - k) % 26) + "；密文每个字母再加 " + (26 - k) % 26 + " 即还原为 " + U.m(msg) + "。" });
    steps.push({ t: "两次加密 = 一次加密", d: "先用 k₁ 再用 k₂，等于用 " + U.m("k₁ + k₂ mod 26") + " 加密一次——加密变换在合成下封闭，构成与 Z₂₆ 同构的循环群。" });
    steps.push({ t: "安全性反思", d: "密钥只有 26 种（含恒等 k=0），逐一尝试即可破解；群结构保证了「能解密」，但「难破解」还需要巨大的密钥空间与更复杂的运算。" });
    var L = msg.length;
    return {
      titles: { struct: ["明文 → 密文", "c ≡ m + k (mod 26)"], viz: ["字母环 Z₂₆", "箭头 = 加 k"] },
      intro: "凯撒密码把字母看作 Z₂₆ 的元素，加密是「加 k」，解密是「加 −k」。",
      steps: steps,
      struct: function (kk) {
        var rows = msg.split("").map(function (c, i) {
          var show = kk >= i;
          return [c, A.indexOf(c), show ? "+" + k : "", show ? (A.indexOf(c) + k) % 26 : "", show ? "<b>" + enc[i] + "</b>" : "…", kk >= L ? c : ""];
        });
        return D.table(["明文", "m", "+k", "c", "密文", "解密"], rows, { rowCls: function (i) { return i === kk ? "cur" : ""; } }) +
          D.note("密钥 k = " + U.m(k) + "，解密密钥 " + U.m("k⁻¹ = " + (26 - k) % 26) + "。");
      },
      viz: function (kk) {
        var cls = A.map(function () { return ""; }), arrows = [];
        var i = kk >= 0 && kk < L ? kk : -1;
        msg.split("").forEach(function (c, j) { if (kk >= j) { cls[A.indexOf(c)] = cls[A.indexOf(c)] || "on"; } });
        if (i >= 0) { var a = A.indexOf(msg[i]), b = A.indexOf(enc[i]); cls[a] = "cur"; cls[b] = "ok"; arrows.push({ a: a, b: b, cls: "cur", bend: 0 }); }
        if (kk === L) msg.split("").forEach(function (c, j) { arrows.push({ a: A.indexOf(enc[j]), b: A.indexOf(c), cls: "ok" }); });
        return D.ring({ labels: A, cls: cls, arrows: arrows, center: ["k = " + k, kk >= L ? "解密：加 " + (26 - k) % 26 : "明文 " + msg] });
      },
      verdict: { kind: "info", chip: "可逆 ≠ 安全", reason: "密文 " + U.m(enc.join("")) + "；凯撒加密族 {E_k} 在合成下构成循环群 ≅ Z₂₆，逆元保证了解密存在。",
        insight: "现代密码同样依赖「可逆」的群运算，但要把密钥空间做到大到无法穷举——这正是后续 10.8、10.9 案例的主题。" }
    };
  }

  function parity(p) {
    var S = G.Z2k(3), m = p.m, eIdx = p.e;
    var c = (m << 1) | (U.weight(m) & 1);   // 两位信息 + 偶校验位
    var r = c ^ eIdx, wr = U.weight(r);
    var cw = U.range(8).filter(function (v) { return U.weight(v) % 2 === 0; });
    var steps = [
      { t: "⟨Z₂³, ⊕⟩ 是群", d: "按位异或封闭、可结合；单位元 " + U.m("000") + "；每个元素都是自己的逆元 " + U.m("x ⊕ x = 000") + "——运算表对角线全为 000。" },
      { t: "编码：加偶校验位", d: "信息 " + U.m(U.bits(m, 2)) + " 后面补一位，使 1 的个数为偶数，码字 " + U.m("c = " + U.bits(c, 3)) + "。偶重码字 " + U.m(U.set(cw.map(function (v) { return U.bits(v, 3); }))) + " 恰好组成一个子群。" },
      { t: "信道噪声：r = c ⊕ e", d: "错误图样 " + U.m("e = " + U.bits(eIdx, 3)) + "（1 表示该位翻转），收到 " + U.m("r = " + U.bits(c, 3) + " ⊕ " + U.bits(eIdx, 3) + " = " + U.bits(r, 3)) + "。" },
      { t: "检错：数 1 的个数", d: "r 的重量 = " + wr + "，" + (wr % 2 ? U.bad("奇数 → 发现错误") : eIdx ? U.hl("偶数 → 未能发现（偶数位出错）") : U.ok("偶数 → 未发现错误")) + "。" },
      { t: "撤销：再异或一次", d: "若已知 e，则 " + U.m("r ⊕ e = c ⊕ e ⊕ e = c ⊕ 000 = c = " + U.bits(c, 3)) + "——e 的逆元就是它自己。" }
    ];
    return {
      titles: { struct: ["⟨Z₂³, ⊕⟩ 运算表", "对角线 = 单位元"], viz: ["码字与传输", "金 = 校验位 · 红 = 出错位"] },
      intro: "比特串按位异或构成群：每个元素自逆，所以「再做一次」就能撤销。",
      steps: steps,
      struct: function (k) {
        return D.cayley(S, {
          cell: function (i, j, v) {
            if (k === 0 && i === j) return "ok";
            if (k === 1 && cw.indexOf(i) >= 0 && cw.indexOf(j) >= 0) return "hl";
            if (k === 2 && i === c && j === eIdx) return "cur";
            if (k === 4 && i === r && j === eIdx) return "ok";
            return "";
          }
        });
      },
      viz: function (k) {
        var bc = U.bits(c, 3), br = U.bits(r, 3), be = U.bits(eIdx, 3);
        var h = '<div class="gl-sets">';
        h += '<div class="gl-set ' + (k >= 1 ? "ok" : "dim") + '"><b>码字 c</b>' + D.bits(bc, ["", "", "p"]) + "<em>信息 " + U.bits(m, 2) + " + 校验位</em></div>";
        h += '<div class="gl-set ' + (k >= 2 ? "bad" : "dim") + '"><b>噪声 e</b>' + D.bits(be, be.split("").map(function (x) { return x === "1" ? "err" : ""; })) + "<em>1 = 翻转</em></div>";
        h += '<div class="gl-set ' + (k >= 2 ? "cur" : "dim") + '"><b>接收 r</b>' + D.bits(br, br.split("").map(function (x, i) { return be[i] === "1" ? "err" : ""; })) + "<em>重量 " + wr + "</em></div>";
        h += '<div class="gl-set ' + (k >= 4 ? "ok" : "dim") + '"><b>r ⊕ e</b>' + D.bits(bc, bc.split("").map(function (x, i) { return be[i] === "1" ? "fix" : ""; })) + "<em>还原</em></div>";
        return h + "</div>" + (k >= 3 ? D.note("检错结论：" + (wr % 2 ? "奇重 → 有错，请求重发。" : eIdx ? "偶数个位出错时奇偶校验无法察觉——需要更强的纠错码（见 10.7）。" : "无错。")) : "");
      },
      verdict: { kind: wr % 2 || !eIdx ? "ok" : "bad", chip: wr % 2 ? "检出错误" : eIdx ? "漏检" : "传输无误",
        reason: "奇偶校验利用「偶重码字构成子群、异或自逆」检测单个错误；本例 e=" + U.m(U.bits(eIdx, 3)) + "，r 的重量 " + wr + "。",
        insight: "异或的「自逆」性让加密（一次一密 c = m ⊕ k）和纠错（r ⊕ e = c）共用同一套群运算。" }
    };
  }

  var extend = {
    legend: [["r / s", "旋转 / 翻折"], ["rᵏs", "先翻折 s，再旋转 rᵏ"], ["+k", "凯撒加密：Z₂₆ 中加 k"], ["⊕", "按位异或，x⊕x=000"], ['<i class="dot cur"></i>', "当前元素 / 出错位"]],
    caseLabel: "选择场景",
    cases: [
      { label: "正三角形的对称群 D₃", build: d3 },
      { label: "凯撒密码 ⟨Z₂₆, +⟩", params: [
          { id: "k", label: "密钥 k", type: "range", min: 1, max: 25, value: 3, hint: "加 k 位" },
          { id: "msg", label: "明文", type: "select", value: "GROUP", options: [["GROUP", "GROUP"], ["CHINA", "CHINA"], ["BEIDOU", "BEIDOU"]] }],
        build: caesar },
      { label: "异或与奇偶校验 ⟨Z₂³, ⊕⟩", params: [
          { id: "m", label: "信息位", type: "select", value: 2, options: [[0, "00"], [1, "01"], [2, "10"], [3, "11"]] },
          { id: "e", label: "错误图样 e", type: "select", value: 1, options: [[0, "000 无错"], [4, "100 第1位错"], [2, "010 第2位错"], [1, "001 第3位错"], [3, "011 两位错"]] }],
        build: parity }
    ]
  };

  GL.define({ basic: basic, advanced: advanced, extend: extend });
})();
