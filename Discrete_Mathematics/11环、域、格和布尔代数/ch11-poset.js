/* =====================================================================
 * 第11章 格单元（11.4–11.7）共用的有限偏序集 / 格工具（ch11-poset.js）
 * CH11P.make({ els, leq, pos, labels }) → 带 ub/lb/lub/glb/covers/isLattice 的偏序集对象
 * CH11P.hasse(P, H, kinds, ekinds, opts) → Hasse 图 SVG 片段
 * ===================================================================== */
(function (global) {
  "use strict";
  function make(o) {
    var P = { els: o.els, leq: o.leq, pos: o.pos || {}, labels: o.labels || {} };
    P.lab = function (x) { return P.labels[x] != null ? P.labels[x] : String(x); };
    P.ub = function (a, b) { return P.els.filter(function (u) { return P.leq(a, u) && P.leq(b, u); }); };
    P.lb = function (a, b) { return P.els.filter(function (u) { return P.leq(u, a) && P.leq(u, b); }); };
    P.lub = function (a, b) {
      var U = P.ub(a, b), m = U.filter(function (u) { return U.every(function (v) { return P.leq(u, v); }); });
      return m.length ? m[0] : null;
    };
    P.glb = function (a, b) {
      var L = P.lb(a, b), m = L.filter(function (u) { return L.every(function (v) { return P.leq(v, u); }); });
      return m.length ? m[0] : null;
    };
    P.minimal = function (S) { return S.filter(function (u) { return !S.some(function (v) { return v !== u && P.leq(v, u); }); }); };
    P.maximal = function (S) { return S.filter(function (u) { return !S.some(function (v) { return v !== u && P.leq(u, v); }); }); };
    P.covers = function () {
      var E = [];
      P.els.forEach(function (a) { P.els.forEach(function (b) {
        if (a === b || !P.leq(a, b)) return;
        if (!P.els.some(function (m) { return m !== a && m !== b && P.leq(a, m) && P.leq(m, b); })) E.push([a, b]);
      }); });
      return E;
    };
    P.badPair = function () {
      for (var i = 0; i < P.els.length; i++) for (var j = i + 1; j < P.els.length; j++) {
        var a = P.els[i], b = P.els[j];
        if (P.lub(a, b) == null || P.glb(a, b) == null) return [a, b];
      }
      return null;
    };
    P.isLattice = function () { return !P.badPair(); };
    P.bottom = function () { return P.els.filter(function (x) { return P.els.every(function (y) { return P.leq(x, y); }); })[0]; };
    P.top = function () { return P.els.filter(function (x) { return P.els.every(function (y) { return P.leq(y, x); }); })[0]; };
    return P;
  }
  /* kinds{x:kind} 节点状态；ekinds{"a|b":kind} 边状态；opts.flip 上下翻转；opts.r 半径 */
  function hasse(P, H, kinds, ekinds, opts) {
    kinds = kinds || {}; ekinds = ekinds || {}; opts = opts || {};
    var s = "", pos = {}, H0 = opts.h || 400;
    P.els.forEach(function (x) { var p = P.pos[x]; pos[x] = [p[0] + (opts.dx || 0), opts.flip ? (H0 - p[1] + (opts.dy || 0)) : p[1] + (opts.dy || 0)]; });
    P.covers().forEach(function (e) {
      var a = pos[e[0]], b = pos[e[1]];
      s += H.line(a[0], a[1], b[0], b[1], ekinds[e[0] + "|" + e[1]] || "norm");
    });
    P.els.forEach(function (x) { s += H.node(pos[x][0], pos[x][1], P.lab(x), kinds[x] || "norm", opts.r || 22, opts.fs); });
    return s;
  }
  global.CH11P = { make: make, hasse: hasse };
})(window);
