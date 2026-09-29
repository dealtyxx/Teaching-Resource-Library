/* =====================================================================
 * 第10章 群论基础 —— 三层统一交互引擎（群论实验台 GroupLab）
 * ---------------------------------------------------------------------
 * 本章 10 个单元、30 个页面共用本引擎：
 *   - 每个单元目录下的 *-script.js 调用 GroupLab.define({ basic, advanced, extend })
 *     登记三层模块；页面用 window.GROUP_LAB_LEVEL 取层级；
 *   - 模块由若干「案例」组成，案例 build(params) 返回模型：
 *       { titles, steps:[{t,d}], struct(k), viz(k), verdict(k) , scene?, modelHtml? }
 *     引擎负责侧栏控件、逐步播放（上一步/下一步/自动播放/速度/重置）、
 *     推演记录、结论卡与图例。所有数学结果均由运算实时计算，不写死。
 *   - layout:"case" 的模块（10.7–10.9 案例单元）按六段式渲染：
 *     情境背景 → 数学建模 → 交互求解 → 结果解读 → 价值引领 → 迁移思考。
 *
 * 约定：置换乘积 στ 表示「先作 τ，再作 σ」（从右往左，与函数复合 σ∘τ 一致）。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* ------------------------------------------------------------------
   * 1. 通用工具
   * ------------------------------------------------------------------ */
  var U = {};
  U.esc = function (v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  U.mod = function (a, n) { return ((a % n) + n) % n; };
  U.gcd = function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; };
  U.lcm = function (a, b) { return a / U.gcd(a, b) * b; };
  U.range = function (n, s) { s = s || 0; var r = []; for (var i = 0; i < n; i++) r.push(i + s); return r; };
  U.phi = function (n) { var c = 0; for (var k = 1; k <= n; k++) if (U.gcd(k, n) === 1) c++; return c; };
  U.divisors = function (n) { return U.range(n, 1).filter(function (d) { return n % d === 0; }); };
  U.powmod = function (b, e, m) { var r = 1 % m; b = U.mod(b, m); while (e > 0) { if (e & 1) r = r * b % m; b = b * b % m; e >>= 1; } return r; };
  var SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
  var SUB = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
  U.sup = function (x) { return String(x).split("").map(function (c) { return SUP[c] || c; }).join(""); };
  U.sub = function (x) { return String(x).split("").map(function (c) { return SUB[c] || c; }).join(""); };
  U.set = function (arr) { return "{" + arr.join(", ") + "}"; };
  U.m = function (s) { return '<span class="gl-m">' + s + "</span>"; };           // 数学串（等宽）
  U.ok = function (s) { return '<span class="gl-t-ok">' + s + "</span>"; };
  U.bad = function (s) { return '<span class="gl-t-bad">' + s + "</span>"; };
  U.hl = function (s) { return '<span class="gl-t-hl">' + s + "</span>"; };
  U.bits = function (v, len) { var s = v.toString(2); while (s.length < len) s = "0" + s; return s; };
  U.weight = function (v) { var c = 0; while (v) { c += v & 1; v >>= 1; } return c; };

  /* ------------------------------------------------------------------
   * 2. 置换
   *    置换用 0 起的数组表示：p[i] = i 的像；显示时 +1。
   * ------------------------------------------------------------------ */
  var P = {};
  P.id = function (n) { return U.range(n); };
  P.compose = function (p, q) { return q.map(function (x) { return p[x]; }); };   // (pq)(x)=p(q(x))：先 q 后 p
  P.inv = function (p) { var r = []; p.forEach(function (y, x) { r[y] = x; }); return r; };
  P.eq = function (p, q) { return p.join() === q.join(); };
  P.cycles = function (p, keepFixed) {
    var seen = [], out = [];
    for (var i = 0; i < p.length; i++) {
      if (seen[i]) continue;
      var c = [], j = i;
      while (!seen[j]) { seen[j] = true; c.push(j); j = p[j]; }
      if (c.length > 1 || keepFixed) out.push(c);
    }
    return out;
  };
  P.cycleStr = function (c) { return "(" + c.map(function (x) { return x + 1; }).join(c.length > 0 && c.some(function (x) { return x >= 9; }) ? " " : "") + ")"; };
  P.str = function (p) { var cs = P.cycles(p); return cs.length ? cs.map(P.cycleStr).join("") : "e"; };
  P.order = function (p) { return P.cycles(p).reduce(function (a, c) { return U.lcm(a, c.length); }, 1); };
  P.transCount = function (p) { return P.cycles(p).reduce(function (a, c) { return a + c.length - 1; }, 0); };
  P.even = function (p) { return P.transCount(p) % 2 === 0; };
  P.fromCycles = function (n, cycles) {           // cycles 用 1 起编号
    var p = P.id(n);
    cycles.forEach(function (c) { for (var i = 0; i < c.length; i++) p[c[i] - 1] = c[(i + 1) % c.length] - 1; });
    return p;
  };
  P.all = function (n) {
    var out = [];
    (function rec(pre, rest) {
      if (!rest.length) { out.push(pre); return; }
      rest.forEach(function (x, i) { rec(pre.concat([x]), rest.slice(0, i).concat(rest.slice(i + 1))); });
    })([], U.range(n));
    return out;
  };
  P.twoLine = function (p) {
    return '<table class="gl-twoline"><tr>' + p.map(function (_, i) { return "<td>" + (i + 1) + "</td>"; }).join("") +
      "</tr><tr>" + p.map(function (y) { return "<td>" + (y + 1) + "</td>"; }).join("") + "</tr></table>";
  };

  /* ------------------------------------------------------------------
   * 3. 有限代数结构 / 群
   *    Struct(name, elems, f, opt)：elems 为元素原值，f 为二元运算，
   *    opt.key 求键、opt.label 显示名、opt.sym 运算符号。
   *    表 T[i][j] = 运算结果下标，结果不在集合中时为 -1（封闭性失败）。
   * ------------------------------------------------------------------ */
  function Struct(name, elems, f, opt) {
    opt = opt || {};
    var key = opt.key || function (x) { return String(x); };
    var label = opt.label || function (x) { return String(x); };
    var idx = {};
    elems.forEach(function (x, i) { idx[key(x)] = i; });
    var n = elems.length, T = [], R = [];
    for (var i = 0; i < n; i++) {
      T.push([]); R.push([]);
      for (var j = 0; j < n; j++) {
        var v = f(elems[i], elems[j]);
        var k = idx[key(v)];
        T[i].push(k === undefined ? -1 : k);
        R[i].push(v);
      }
    }
    var S = {
      name: name, n: n, elems: elems, T: T, sym: opt.sym || "∘", additive: !!opt.additive,
      lab: function (i) { return label(elems[i]); },
      rawLab: function (i, j) { return label(R[i][j]); },
      op: function (i, j) { return T[i][j]; },
      indexOf: function (x) { var k = idx[key(x)]; return k === undefined ? -1 : k; }
    };
    S.closed = function () {
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) if (T[i][j] < 0) return [i, j];
      return null;
    };
    S.assocFail = function () {
      if (S.closed()) return null;
      for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) for (var c = 0; c < n; c++)
        if (T[T[a][b]][c] !== T[a][T[b][c]]) return [a, b, c];
      return null;
    };
    S.identity = function () {
      for (var e = 0; e < n; e++) {
        var ok = true;
        for (var x = 0; x < n && ok; x++) if (T[e][x] !== x || T[x][e] !== x) ok = false;
        if (ok) return e;
      }
      return -1;
    };
    S.e = S.identity();
    S.inv = function (i) {
      if (S.e < 0) return -1;
      for (var j = 0; j < n; j++) if (T[i][j] === S.e && T[j][i] === S.e) return j;
      return -1;
    };
    S.abelian = function () {
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) if (T[i][j] !== T[j][i]) return [i, j];
      return null;
    };
    S.isAbelian = function () { return !S.abelian(); };
    S.isGroup = function () {
      if (S.closed() || S.assocFail() || S.e < 0) return false;
      for (var i = 0; i < n; i++) if (S.inv(i) < 0) return false;
      return true;
    };
    S.pow = function (i, k) { var r = S.e; for (var t = 0; t < k; t++) r = T[r][i]; return r; };
    S.powers = function (i) { var out = [S.e], cur = i, guard = 0; while (cur !== S.e && guard++ <= n) { out.push(cur); cur = T[cur][i]; } return out; };
    S.order = function (i) { return S.powers(i).length; };
    S.gen = function (list) {                    // 由若干元生成的子群（有限群中闭包即可）
      var H = [S.e], seen = {}; seen[S.e] = 1;
      list.forEach(function (g) { if (!seen[g]) { seen[g] = 1; H.push(g); } });
      for (var p = 0; p < H.length; p++) for (var q = 0; q < H.length; q++) {
        var r = T[H[p]][H[q]]; if (!seen[r]) { seen[r] = 1; H.push(r); }
      }
      return H.sort(function (a, b) { return a - b; });
    };
    S.powLab = function (i, k) { return S.additive ? (k === 1 ? S.lab(i) : k + "·" + S.lab(i)) : S.lab(i) + U.sup(k); };
    S.set = function (arr) { return U.set(arr.map(S.lab)); };
    S.leftCoset = function (a, H) { var s = H.map(function (h) { return T[a][h]; }); return s.slice().sort(function (x, y) { return x - y; }); };
    S.rightCoset = function (a, H) { var s = H.map(function (h) { return T[h][a]; }); return s.slice().sort(function (x, y) { return x - y; }); };
    S.cosets = function (H, right) {
      var cls = new Array(n).fill(-1), reps = [], list = [];
      for (var a = 0; a < n; a++) {
        if (cls[a] >= 0) continue;
        var c = right ? S.rightCoset(a, H) : S.leftCoset(a, H);
        c.forEach(function (x) { cls[x] = reps.length; });
        reps.push(a); list.push(c);
      }
      return { cls: cls, reps: reps, list: list };
    };
    S.cosetName = function (a, H, right) {
      if (S.additive) return S.lab(a) + " + H";
      return right ? "H" + S.lab(a) : S.lab(a) + "H";
    };
    S.conj = function (g, H) { var gi = S.inv(g); return H.map(function (h) { return T[T[g][h]][gi]; }).sort(function (x, y) { return x - y; }); };
    S.isNormal = function (H) {
      for (var g = 0; g < n; g++) if (S.conj(g, H).join() !== H.slice().sort(function (x, y) { return x - y; }).join()) return false;
      return true;
    };
    S.subgroups = function () {                  // 所有子群（由至多两个元生成即可覆盖本章用到的小群）
      var seen = {}, out = [];
      for (var a = 0; a < n; a++) for (var b = a; b < n; b++) {
        var H = S.gen([a, b]), k = H.join();
        if (!seen[k]) { seen[k] = 1; out.push(H); }
      }
      return out.sort(function (x, y) { return x.length - y.length || x.join().localeCompare(y.join()); });
    };
    return S;
  }

  var G = {};
  G.Struct = Struct;
  G.Zadd = function (n) {
    return Struct("⟨Z" + U.sub(n) + ", +" + U.sub(n) + "⟩", U.range(n), function (a, b) { return (a + b) % n; }, { sym: "+", additive: true });
  };
  G.Zmul = function (n, elems, name) {
    elems = elems || U.range(n);
    return Struct(name || "⟨Z" + U.sub(n) + ", ×" + U.sub(n) + "⟩", elems, function (a, b) { return (a * b) % n; }, { sym: "×" });
  };
  G.U = function (n) {
    return G.Zmul(n, U.range(n).filter(function (k) { return k > 0 && U.gcd(k, n) === 1; }), "U(" + n + ")");
  };
  G.perm = function (name, perms) {
    return Struct(name, perms, P.compose, { key: function (p) { return p.join(); }, label: P.str, sym: "∘" });
  };
  G.S3 = function () {
    return G.perm("S₃", [[0, 1, 2], [1, 0, 2], [2, 1, 0], [0, 2, 1], [1, 2, 0], [2, 0, 1]]);
  };
  G.Sn = function (n) {
    var all = P.all(n).sort(function (a, b) {
      return P.order(a) - P.order(b) || P.str(a).length - P.str(b).length || P.str(a).localeCompare(P.str(b));
    });
    return G.perm("S" + U.sub(n), all);
  };
  G.An = function (n) { return G.perm("A" + U.sub(n), G.Sn(n).elems.filter(P.even)); };
  /* 二面体群 Dₙ：正 n 边形顶点 0..n-1 的对称；r=旋转 360°/n，s=过顶点 1 的对称轴翻折；rᵏs = 先 s 后 rᵏ */
  G.D = function (n) {
    var r = U.range(n).map(function (i) { return (i + 1) % n; });
    var s = U.range(n).map(function (i) { return (n - i) % n; });
    var elems = [], names = {};
    var rk = P.id(n);
    for (var k = 0; k < n; k++) {
      names[rk.join()] = k === 0 ? "e" : k === 1 ? "r" : "r" + U.sup(k);
      elems.push(rk);
      rk = P.compose(r, rk);
    }
    rk = P.id(n);
    for (k = 0; k < n; k++) {
      var x = P.compose(rk, s);
      names[x.join()] = k === 0 ? "s" : k === 1 ? "rs" : "r" + U.sup(k) + "s";
      elems.push(x);
      rk = P.compose(r, rk);
    }
    var S = Struct("D" + U.sub(n), elems, P.compose, { key: function (p) { return p.join(); }, label: function (p) { return names[p.join()]; } });
    S.perm = function (i) { return elems[i]; };
    return S;
  };
  G.Z2k = function (k, name) {
    return Struct(name || "⟨Z₂" + U.sup(k) + ", ⊕⟩", U.range(1 << k), function (a, b) { return a ^ b; },
      { sym: "⊕", additive: true, label: function (v) { return U.bits(v, k); } });
  };

  /* ------------------------------------------------------------------
   * 4. 绘图组件（SVG / HTML 字符串）
   *    统一配色：普通节点=纸色描边；cur=主红；on=金；ok=绿；bad=错误红；c0..c5=分类色
   * ------------------------------------------------------------------ */
  var D = {}, uid = 0;
  var ARROW_CLS = ["", "cur", "on", "ok", "bad", "dim", "c0", "c1", "c2", "c3", "c4", "c5"];
  function markers(id) {
    return "<defs>" + ARROW_CLS.map(function (c) {
      return '<marker id="' + id + "-" + (c || "base") + '" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
        '<path d="M0,0 L10,5 L0,10 z" class="gl-mk ' + c + '"/></marker>';
    }).join("") + "</defs>";
  }
  function arrowSvg(id, x1, y1, x2, y2, r1, r2, cls, bend, label) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / L, uy = dy / L;
    var sx = x1 + ux * r1, sy = y1 + uy * r1, ex = x2 - ux * (r2 + 2), ey = y2 - uy * (r2 + 2);
    var mk = ' marker-end="url(#' + id + "-" + (cls || "base").split(" ")[0] + ')"';
    var path, mx, my;
    if (bend) {
      var cx = (sx + ex) / 2 - uy * bend, cy = (sy + ey) / 2 + ux * bend;
      path = "M" + sx.toFixed(1) + "," + sy.toFixed(1) + " Q" + cx.toFixed(1) + "," + cy.toFixed(1) + " " + ex.toFixed(1) + "," + ey.toFixed(1);
      mx = (sx + 2 * cx + ex) / 4; my = (sy + 2 * cy + ey) / 4;
    } else {
      path = "M" + sx.toFixed(1) + "," + sy.toFixed(1) + " L" + ex.toFixed(1) + "," + ey.toFixed(1);
      mx = (sx + ex) / 2; my = (sy + ey) / 2;
    }
    var s = '<path class="gl-a ' + (cls || "") + '" d="' + path + '"' + mk + "/>";
    if (label != null && label !== "") s += '<text class="gl-alab" x="' + (mx - uy * 11).toFixed(1) + '" y="' + (my + ux * 11 + 4).toFixed(1) + '">' + U.esc(label) + "</text>";
    return s;
  }
  function loopSvg(id, x, y, r, cx, cy, cls) {           // 自环：朝外画一个小圈
    var ang = Math.atan2(y - cy, x - cx), d = r + 16;
    var lx = x + Math.cos(ang) * d, ly = y + Math.sin(ang) * d;
    return '<circle class="gl-loop ' + (cls || "") + '" cx="' + lx.toFixed(1) + '" cy="' + ly.toFixed(1) + '" r="' + (r * 0.62).toFixed(1) + '"/>';
  }
  /* 环形图：o = { labels, cls:[], arrows:[{a,b,cls,label}], center:[l1,l2], size }  */
  D.ring = function (o) {
    var id = "glr" + (++uid), n = o.labels.length;
    var W = 460, H = o.height || 360, cx = W / 2, cy = H / 2;
    var r = o.r || (n <= 6 ? 25 : n <= 9 ? 22 : n <= 13 ? 18 : n <= 18 ? 15 : 12);
    var R = Math.min(W, H) / 2 - r - (o.pad || 22);
    var pos = U.range(n).map(function (i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
    });
    var s = '<svg class="gl-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + U.esc(o.aria || "环形示意图") + '">' + markers(id);
    if (o.guide !== false) s += '<circle class="gl-guide" cx="' + cx + '" cy="' + cy + '" r="' + R.toFixed(1) + '"/>';
    var pairs = {};
    (o.arrows || []).forEach(function (a) { pairs[a.a + ">" + a.b] = 1; });
    (o.arrows || []).forEach(function (a) {
      if (a.a === a.b) { s += loopSvg(id, pos[a.a].x, pos[a.a].y, r, cx, cy, a.cls); return; }
      var bend = a.bend != null ? a.bend : (pairs[a.b + ">" + a.a] ? 16 : 0);
      s += arrowSvg(id, pos[a.a].x, pos[a.a].y, pos[a.b].x, pos[a.b].y, r, r, a.cls, bend, a.label);
    });
    if (o.center) {
      s += '<text class="gl-ctr1" x="' + cx + '" y="' + (cy - 4) + '">' + U.esc(o.center[0] || "") + "</text>";
      if (o.center[1]) s += '<text class="gl-ctr2" x="' + cx + '" y="' + (cy + 20) + '">' + U.esc(o.center[1]) + "</text>";
    }
    var fs = r >= 22 ? 14 : r >= 18 ? 12.5 : r >= 15 ? 11 : 10;
    o.labels.forEach(function (lab, i) {
      var c = (o.cls && o.cls[i]) || "";
      var L = String(lab), f = L.length > 4 ? fs - 2.5 : L.length > 3 ? fs - 1.5 : fs;
      s += '<g class="gl-n ' + c + '"><circle cx="' + pos[i].x.toFixed(1) + '" cy="' + pos[i].y.toFixed(1) + '" r="' + r + '"/>' +
        '<text x="' + pos[i].x.toFixed(1) + '" y="' + (pos[i].y + f * 0.36).toFixed(1) + '" style="font-size:' + f + 'px">' + U.esc(L) + "</text>";
      if (o.tags && o.tags[i]) {
        var ang = Math.atan2(pos[i].y - cy, pos[i].x - cx);
        s += '<text class="gl-tag" x="' + (pos[i].x + Math.cos(ang) * (r + 13)).toFixed(1) + '" y="' + (pos[i].y + Math.sin(ang) * (r + 13) + 4).toFixed(1) + '">' + U.esc(o.tags[i]) + "</text>";
      }
      s += "</g>";
    });
    return s + "</svg>";
  };
  /* 映射图：o = { L:[], R:[], map:[j|-1], lcls:[], rcls:[], acls:[], titles:[l,r] } */
  D.mapping = function (o) {
    var id = "glm" + (++uid), nL = o.L.length, nR = o.R.length;
    var W = 460, gap = Math.max(nL, nR) > 8 ? 30 : 38, H = Math.max(nL, nR) * gap + 64;
    var xl = 110, xr = 350, bw = o.boxW || 64, bh = 26;
    var yl = function (i) { return 50 + (i + 0.5) * (H - 64) / nL; };
    var yr = function (j) { return 50 + (j + 0.5) * (H - 64) / nR; };
    var s = '<svg class="gl-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="映射示意图">' + markers(id);
    var t = o.titles || ["G", "G′"];
    s += '<text class="gl-coltitle" x="' + xl + '" y="24">' + U.esc(t[0]) + '</text><text class="gl-coltitle" x="' + xr + '" y="24">' + U.esc(t[1]) + "</text>";
    s += '<rect class="gl-colbg" x="' + (xl - bw / 2 - 12) + '" y="34" width="' + (bw + 24) + '" height="' + (H - 40) + '" rx="14"/>';
    s += '<rect class="gl-colbg" x="' + (xr - bw / 2 - 12) + '" y="34" width="' + (bw + 24) + '" height="' + (H - 40) + '" rx="14"/>';
    o.map.forEach(function (j, i) {
      if (j == null || j < 0) return;
      var c = (o.acls && o.acls[i]) || "";
      var x1 = xl + bw / 2, y1 = yl(i), x2 = xr - bw / 2, y2 = yr(j);
      s += '<path class="gl-a ' + c + '" d="M' + x1 + "," + y1.toFixed(1) + " C" + (x1 + 70) + "," + y1.toFixed(1) + " " + (x2 - 70) + "," + y2.toFixed(1) + " " + (x2 - 3) + "," + y2.toFixed(1) +
        '" marker-end="url(#' + id + "-" + (c || "base").split(" ")[0] + ')"/>';
    });
    function box(x, y, lab, c) {
      return '<g class="gl-b ' + (c || "") + '"><rect x="' + (x - bw / 2) + '" y="' + (y - bh / 2).toFixed(1) + '" width="' + bw + '" height="' + bh + '" rx="9"/>' +
        '<text x="' + x + '" y="' + (y + 4.5).toFixed(1) + '">' + U.esc(lab) + "</text></g>";
    }
    o.L.forEach(function (lab, i) { s += box(xl, yl(i), lab, o.lcls && o.lcls[i]); });
    o.R.forEach(function (lab, j) { s += box(xr, yr(j), lab, o.rcls && o.rcls[j]); });
    return s + "</svg>";
  };
  /* 正多边形对称：o = { n, perm (顶点 v → 位置 perm[v]), cls, axis:k（过顶点 k 的对称轴角序号，可为半整数）, rot:k } */
  D.polygon = function (o) {
    var n = o.n, W = 460, H = 340, cx = W / 2, cy = H / 2 + 6, R = 118;
    var id = "glp" + (++uid);
    var pt = function (i) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R }; };
    var s = '<svg class="gl-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="正多边形的对称">' + markers(id);
    var ghost = U.range(n).map(function (i) { var p = pt(i); return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" ");
    s += '<polygon class="gl-poly-ghost" points="' + ghost + '"/>';
    s += '<polygon class="gl-poly ' + (o.cls || "") + '" points="' + ghost + '"/>';
    if (o.axis != null) {
      var a = -Math.PI / 2 + o.axis * 2 * Math.PI / n;
      s += '<line class="gl-axis" x1="' + (cx - Math.cos(a) * (R + 36)).toFixed(1) + '" y1="' + (cy - Math.sin(a) * (R + 36)).toFixed(1) + '" x2="' + (cx + Math.cos(a) * (R + 36)).toFixed(1) + '" y2="' + (cy + Math.sin(a) * (R + 36)).toFixed(1) + '"/>';
    }
    if (o.rot) {
      var ang = o.rot * 360 / n, rr = 34, a0 = -90, a1 = -90 + ang;
      var p0 = { x: cx + rr * Math.cos(a0 * Math.PI / 180), y: cy + rr * Math.sin(a0 * Math.PI / 180) };
      var p1 = { x: cx + rr * Math.cos(a1 * Math.PI / 180), y: cy + rr * Math.sin(a1 * Math.PI / 180) };
      s += '<path class="gl-a on" d="M' + p0.x.toFixed(1) + "," + p0.y.toFixed(1) + " A" + rr + "," + rr + " 0 " + (ang > 180 ? 1 : 0) + " 1 " + p1.x.toFixed(1) + "," + p1.y.toFixed(1) + '" marker-end="url(#' + id + '-on)"/>';
      s += '<text class="gl-ctr2" x="' + cx + '" y="' + (cy + 5) + '">' + Math.round(ang) + "°</text>";
    }
    U.range(n).forEach(function (v) {
      var p = pt(o.perm ? o.perm[v] : v);
      s += '<g class="gl-n ' + (v === 0 ? "cur" : "on") + '"><circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="19"/><text x="' + p.x.toFixed(1) + '" y="' + (p.y + 5).toFixed(1) + '" style="font-size:14px">' + (v + 1) + "</text></g>";
    });
    U.range(n).forEach(function (i) {
      var p = pt(i), a = -Math.PI / 2 + i * 2 * Math.PI / n;
      s += '<text class="gl-tag" x="' + (p.x + Math.cos(a) * 34).toFixed(1) + '" y="' + (p.y + Math.sin(a) * 34 + 4).toFixed(1) + '">位' + (i + 1) + "</text>";
    });
    return s + "</svg>";
  };
  /* 运算表：o = { cell(i,j)->cls, row(i)->cls, col(j)->cls, rows:[下标], cols:[下标], corner } */
  D.cayley = function (S, o) {
    o = o || {};
    var rows = o.rows || U.range(S.n), cols = o.cols || U.range(S.n);
    var big = cols.length > 8 ? " gl-cayley-sm" : "";
    var h = '<div class="gl-table-wrap"><table class="gl-cayley' + big + '"><thead><tr><th class="gl-corner">' + U.esc(o.corner || S.sym) + "</th>";
    cols.forEach(function (j) { h += '<th class="' + ((o.col && o.col(j)) || "") + '">' + U.esc(S.lab(j)) + "</th>"; });
    h += "</tr></thead><tbody>";
    rows.forEach(function (i) {
      h += '<tr><th class="' + ((o.row && o.row(i)) || "") + '">' + U.esc(S.lab(i)) + "</th>";
      cols.forEach(function (j) {
        var k = S.T[i][j], c = (o.cell && o.cell(i, j, k)) || "";
        h += '<td class="' + c + (k < 0 ? " out" : "") + '">' + U.esc(k < 0 ? S.rawLab(i, j) : S.lab(k)) + "</td>";
      });
      h += "</tr>";
    });
    return h + "</tbody></table></div>";
  };
  /* 通用小表：heads:[], rows:[[...]], cls(r,c) */
  D.table = function (heads, rows, o) {
    o = o || {};
    var h = '<div class="gl-table-wrap"><table class="gl-grid' + (o.compact ? " gl-grid-sm" : "") + '"><thead><tr>' + heads.map(function (x) { return "<th>" + x + "</th>"; }).join("") + "</tr></thead><tbody>";
    rows.forEach(function (r, ri) {
      h += '<tr class="' + ((o.rowCls && o.rowCls(ri)) || "") + '">' + r.map(function (x, ci) { return '<td class="' + ((o.cls && o.cls(ri, ci)) || "") + '">' + x + "</td>"; }).join("") + "</tr>";
    });
    return h + "</tbody></table></div>";
  };
  /* 集合卡片：items:[{name, body, cls, note}] */
  D.sets = function (items) {
    return '<div class="gl-sets">' + items.map(function (it) {
      return '<div class="gl-set ' + (it.cls || "") + '"><b>' + it.name + '</b><span class="gl-m">' + it.body + "</span>" + (it.note ? "<em>" + it.note + "</em>" : "") + "</div>";
    }).join("") + "</div>";
  };
  D.kv = function (pairs) {
    return '<dl class="gl-kv">' + pairs.map(function (p) { return "<dt>" + p[0] + "</dt><dd>" + p[1] + "</dd>"; }).join("") + "</dl>";
  };
  D.note = function (html, cls) { return '<p class="gl-note ' + (cls || "") + '">' + html + "</p>"; };
  D.bits = function (str, cls) {                     // cls: 每位的类名数组
    return '<span class="gl-bits">' + str.split("").map(function (b, i) { return '<i class="' + ((cls && cls[i]) || "") + '">' + b + "</i>"; }).join("") + "</span>";
  };

  /* ------------------------------------------------------------------
   * 5. 页面框架与逐步播放器
   * ------------------------------------------------------------------ */
  var MODS = null;
  function define(mods) { MODS = mods; if (document.readyState !== "loading") boot(); else document.addEventListener("DOMContentLoaded", boot); }

  function boot() {
    var level = global.GROUP_LAB_LEVEL || "advanced";
    var mod = MODS && MODS[level];
    var root = document.getElementById("glRoot");
    if (!mod || !root) return;
    var meta = global.SECTION_META || {};
    var st = { mod: mod, ci: 0, params: {}, model: null, k: -1, timer: null, speed: 1 };

    /* ---- 侧栏控件 ---- */
    var controls = document.getElementById("controls");
    var legend = document.getElementById("legendPanel");
    var caseOpts = mod.cases.map(function (c, i) { return '<option value="' + i + '">' + U.esc(c.label) + "</option>"; }).join("");
    controls.innerHTML =
      '<div class="control-group"><label for="glCase">' + U.esc(mod.caseLabel || "选择案例") + "<small>" + mod.cases.length + " 个案例</small></label>" +
      '<select id="glCase">' + caseOpts + "</select></div>" +
      '<div id="glParams" class="gl-params"></div>' +
      '<div class="control-group"><label>逐步演示<small>← → 键也可</small></label>' +
      '<div class="gl-step-row">' +
      '<button type="button" class="gl-btn" id="glPrev">◀ 上一步</button>' +
      '<button type="button" class="gl-btn gl-primary" id="glNext">下一步 ▶</button>' +
      '<button type="button" class="gl-btn gl-secondary" id="glPlay">▶ 自动播放</button>' +
      '<button type="button" class="gl-btn gl-ghost" id="glReset">重置</button></div>' +
      '<div class="gl-speed"><span>速度</span><input type="range" id="glSpeed" min="0.5" max="2" step="0.25" value="1" aria-label="播放速度"><b id="glSpeedVal">1×</b></div></div>' +
      '<div class="control-group"><label>进度<small id="glProgNum" class="gl-prog-num">0 / 0</small></label>' +
      '<div class="gl-progress"><i id="glProg"></i></div><div class="gl-status" id="glStatus" aria-live="polite"></div></div>';
    if (legend && mod.legend) {
      legend.innerHTML = '<div class="legend-title">符号与图例</div><div class="legend-grid">' + mod.legend.map(function (l) {
        return '<div class="legend-item"><span class="sym">' + l[0] + '</span><span class="desc">' + l[1] + "</span></div>";
      }).join("") + "</div>";
    }

    /* ---- 主舞台骨架 ---- */
    var mission = document.getElementById("glMission");
    if (mission && mod.mission) mission.innerHTML = "<span><b>互动任务：</b>" + mod.mission + '</span><div class="visual-badge">' + U.esc(mod.badge || "") + "</div>";
    var isCase = mod.layout === "case";
    var n0 = 0;
    function card(key, extra) {
      n0++;
      return '<section class="gl-card ' + (extra || "") + '" id="glCard_' + key + '"><div class="gl-card-head"><span class="gl-num">' + n0 +
        '</span><span class="gl-card-title" id="glT_' + key + '"></span><span class="gl-card-hint" id="glH_' + key + '"></span></div><div class="gl-card-body" id="glB_' + key + '"></div></section>';
    }
    var html = "";
    if (isCase) {
      html += '<div class="gl-duo">' + card("scene") + card("model") + "</div>";
      html += '<div class="gl-solve-wrap">' + card("solve", "gl-solve") + "</div>";
      html += card("verdict");
      html += '<div class="gl-duo">' + card("value") + card("transfer") + "</div>";
    } else {
      html += '<div class="gl-duo">' + card("struct") + card("viz") + "</div>";
      html += card("log");
      html += card("verdict");
    }
    root.innerHTML = html;
    if (isCase) {
      var solve = document.getElementById("glB_solve");
      solve.innerHTML = '<div class="gl-duo gl-inner"><div class="gl-sub"><div class="gl-subhead" id="glT_struct"></div><div id="glB_struct"></div></div>' +
        '<div class="gl-sub"><div class="gl-subhead" id="glT_viz"></div><div id="glB_viz"></div></div></div>' +
        '<div class="gl-subhead">推演记录<span id="glH_log"></span></div><div id="glB_log"></div>';
      setHead("solve", "交互求解", "逐步点「下一步」");
      setHead("verdict", "结果解读", "完成全部步骤后给出");
      var io = meta.ideology || {};
      setHead("value", "价值引领", (io.dims || []).join(" · "));
      document.getElementById("glB_value").innerHTML =
        '<div class="gl-value"><h3>' + U.esc(io.title || "价值引领") + "</h3><p>" + U.esc(io.text || "") + "</p>" +
        (io.quote ? '<blockquote>' + U.esc(io.quote) + "</blockquote>" : "") + "</div>";
      setHead("transfer", "迁移思考", "想一想 · 联系工程");
      var tr = (mod.transfer || meta.transfer || []).map(function (t) {
        return typeof t === "string" ? "<li>" + U.esc(t) + "</li>" : "<li><b>" + U.esc(t.t) + "：</b>" + U.esc(t.d) + "</li>";
      }).join("");
      var rf = (mod.reflect || meta.reflect || []).map(function (t) { return "<li>" + U.esc(t) + "</li>"; }).join("");
      document.getElementById("glB_transfer").innerHTML = '<ul class="gl-list">' + tr + "</ul>" + (rf ? '<div class="gl-subhead">思考题</div><ol class="gl-list">' + rf + "</ol>" : "");
    } else {
      setHead("log", "推演记录", "点任一步可回看");
      setHead("verdict", "结论", "完成全部步骤后给出");
    }

    function setHead(key, t, h) {
      var a = document.getElementById("glT_" + key), b = document.getElementById("glH_" + key);
      if (a) a.innerHTML = t || "";
      if (b) b.innerHTML = h || "";
    }

    /* ---- 参数 ---- */
    function buildParams() {
      var c = mod.cases[st.ci], box = document.getElementById("glParams");
      st.params = {};
      box.innerHTML = (c.params || []).map(function (p) {
        st.params[p.id] = p.value;
        if (p.type === "range") {
          return '<div class="control-group"><label for="glp_' + p.id + '">' + U.esc(p.label) + '<small><b class="gl-rv" id="glpv_' + p.id + '">' + U.esc(p.fmt ? p.fmt(p.value) : p.value) + "</b>" + (p.hint ? " · " + U.esc(p.hint) : "") + "</small></label>" +
            '<input type="range" id="glp_' + p.id + '" min="' + p.min + '" max="' + p.max + '" step="' + (p.step || 1) + '" value="' + p.value + '"></div>';
        }
        return '<div class="control-group"><label for="glp_' + p.id + '">' + U.esc(p.label) + (p.hint ? "<small>" + U.esc(p.hint) + "</small>" : "") + "</label>" +
          '<select id="glp_' + p.id + '">' + p.options.map(function (o) {
            return '<option value="' + U.esc(o[0]) + '"' + (String(o[0]) === String(p.value) ? " selected" : "") + ">" + U.esc(o[1]) + "</option>";
          }).join("") + "</select></div>";
      }).join("");
      (c.params || []).forEach(function (p) {
        var el = document.getElementById("glp_" + p.id);
        el.addEventListener(p.type === "range" ? "input" : "change", function () {
          var v = p.type === "range" ? Number(el.value) : (typeof p.value === "number" ? Number(el.value) : el.value);
          st.params[p.id] = v;
          if (p.type === "range") document.getElementById("glpv_" + p.id).textContent = p.fmt ? p.fmt(v) : v;
          rebuild(true);
        });
      });
    }
    function rebuild(keepCase) {
      stop();
      var c = mod.cases[st.ci];
      try { st.model = c.build(st.params); }
      catch (e) { st.model = { steps: [], struct: function () { return D.note("案例构建失败：" + U.esc(e.message), "bad"); }, viz: function () { return ""; } }; }
      var t = st.model.titles || {};
      setHead("struct", (t.struct || ["运算结构"])[0], (t.struct || [])[1]);
      setHead("viz", (t.viz || ["可视化"])[0], (t.viz || [])[1]);
      if (isCase) {
        setHead("scene", "情境背景", (t.scene || [])[1] || "");
        setHead("model", "数学建模", (t.model || [])[1] || "现实对象 → 代数结构");
        document.getElementById("glB_scene").innerHTML = st.model.scene || c.scene || mod.scene || "";
        document.getElementById("glB_model").innerHTML = st.model.modelHtml || "";
      }
      st.k = st.model.startK != null ? st.model.startK : -1;
      render();
    }

    /* ---- 渲染 ---- */
    function render() {
      var m = st.model, N = m.steps.length, k = st.k;
      document.getElementById("glB_struct").innerHTML = m.struct ? m.struct(k) : "";
      document.getElementById("glB_viz").innerHTML = m.viz ? m.viz(k) : "";
      var log = document.getElementById("glB_log");
      log.innerHTML = '<ol class="gl-log">' + m.steps.map(function (s, i) {
        var c = i < k ? "done" : i === k ? "cur" : "todo";
        return '<li class="' + c + '"><button type="button" data-k="' + i + '"><span class="gl-li-n">' + (i + 1) + '</span><span class="gl-li-t">' + s.t + "</span></button>" +
          (i === k && s.d ? '<div class="gl-li-d">' + s.d + "</div>" : "") + "</li>";
      }).join("") + "</ol>";
      var status = document.getElementById("glStatus");
      status.innerHTML = k < 0 ? (m.intro || "点击「下一步」开始逐步推演，或点「自动播放」。") :
        '<b>第 ' + (k + 1) + " 步 · " + m.steps[k].t + "</b><br>" + (m.steps[k].d || "");
      document.getElementById("glProg").style.width = (N ? (k + 1) / N * 100 : 0) + "%";
      document.getElementById("glProgNum").textContent = (k + 1) + " / " + N;
      document.getElementById("glPrev").disabled = k < 0;
      document.getElementById("glNext").disabled = k >= N - 1;
      var vb = document.getElementById("glB_verdict"), done = k >= N - 1;
      var v = typeof m.verdict === "function" ? m.verdict(k) : m.verdict;
      if (!v) { vb.innerHTML = ""; }
      else if (!done) {
        vb.innerHTML = '<div class="gl-verdict pending"><span class="gl-chip">待判定</span><div class="gl-v-reason">' + (v.pending || "完成全部推演步骤后，这里给出结论与依据。") + "</div></div>";
      } else {
        vb.innerHTML = '<div class="gl-verdict k-' + (v.kind || "info") + '"><span class="gl-chip">' + v.chip + '</span><div class="gl-v-reason">' + (v.reason || "") + "</div>" +
          (v.insight ? '<div class="gl-v-insight">' + v.insight + "</div>" : "") + "</div>";
      }
      if (global.MathJax && global.MathJax.typesetPromise && root.querySelector(".gl-tex")) {
        try { global.MathJax.typesetPromise([root]).catch(function () {}); } catch (e) {}
      }
    }
    function go(k) { var N = st.model.steps.length; st.k = Math.max(-1, Math.min(N - 1, k)); render(); }
    function stop() {
      if (st.timer) { clearInterval(st.timer); st.timer = null; }
      var b = document.getElementById("glPlay"); b.textContent = "▶ 自动播放"; b.classList.remove("gl-playing");
    }
    function play() {
      if (st.timer) { stop(); return; }
      if (st.k >= st.model.steps.length - 1) go(-1);
      var b = document.getElementById("glPlay"); b.textContent = "⏸ 暂停"; b.classList.add("gl-playing");
      var tick = function () { if (st.k >= st.model.steps.length - 1) { stop(); return; } go(st.k + 1); };
      tick();
      st.timer = setInterval(tick, 1500 / st.speed);
    }

    document.getElementById("glCase").addEventListener("change", function (e) { st.ci = Number(e.target.value); buildParams(); rebuild(); });
    document.getElementById("glPrev").addEventListener("click", function () { stop(); go(st.k - 1); });
    document.getElementById("glNext").addEventListener("click", function () { stop(); go(st.k + 1); });
    document.getElementById("glPlay").addEventListener("click", play);
    document.getElementById("glReset").addEventListener("click", function () { stop(); go(-1); });
    document.getElementById("glSpeed").addEventListener("input", function (e) {
      st.speed = Number(e.target.value); document.getElementById("glSpeedVal").textContent = st.speed + "×";
      if (st.timer) { stop(); play(); }
    });
    root.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-k]");
      if (b && root.contains(b)) { stop(); go(Number(b.getAttribute("data-k"))); }
    });
    document.addEventListener("keydown", function (e) {
      var t = e.target && e.target.tagName;
      if (t === "INPUT" || t === "SELECT" || t === "TEXTAREA" || (e.target && e.target.isContentEditable)) return;
      if (e.key === "ArrowRight") { stop(); go(st.k + 1); }
      else if (e.key === "ArrowLeft") { stop(); go(st.k - 1); }
    });

    buildParams();
    rebuild();
  }

  global.GroupLab = { U: U, P: P, G: G, D: D, define: define };
})(window);
