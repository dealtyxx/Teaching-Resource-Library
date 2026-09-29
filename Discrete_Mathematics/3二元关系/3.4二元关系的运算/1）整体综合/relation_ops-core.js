/**
 * 3.4 二元关系的运算 · 三阶页公共核心
 * 关系用 Set<"i-j"> 表示（i、j 为元素下标 0..n-1），提供集合运算、逆、复合、幂与矩阵/关系图渲染。
 * 复合记号：compose(F, G) 按「先 F 后 G」计算 {(x,z) | ∃y: xFy ∧ yGz}，对应 M_F ⊙ M_G；
 * 页面上用哪种书写次序（R∘S 或 S∘R）由页面自己按约定标注。
 */
(function (global) {
    'use strict';

    function key(i, j) { return i + '-' + j; }
    function parse(k) { var p = k.split('-'); return [+p[0], +p[1]]; }
    function clone(R) { return new Set(R); }
    function fromPairs(pairs) { var s = new Set(); pairs.forEach(function (p) { s.add(key(p[0], p[1])); }); return s; }

    function union(R, S) { var t = clone(R); S.forEach(function (k) { t.add(k); }); return t; }
    function inter(R, S) { var t = new Set(); R.forEach(function (k) { if (S.has(k)) t.add(k); }); return t; }
    function diff(R, S) { var t = new Set(); R.forEach(function (k) { if (!S.has(k)) t.add(k); }); return t; }
    function complement(R, n) { var t = new Set(); for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) if (!R.has(key(i, j))) t.add(key(i, j)); return t; }
    function inverse(R) { var t = new Set(); R.forEach(function (k) { var p = parse(k); t.add(key(p[1], p[0])); }); return t; }
    function identity(n) { var t = new Set(); for (var i = 0; i < n; i++) t.add(key(i, i)); return t; }

    // 先 F 后 G：{(x,z) | ∃y: (x,y)∈F ∧ (y,z)∈G}
    function compose(F, G, n) {
        var t = new Set();
        for (var x = 0; x < n; x++) for (var z = 0; z < n; z++) {
            for (var y = 0; y < n; y++) if (F.has(key(x, y)) && G.has(key(y, z))) { t.add(key(x, z)); break; }
        }
        return t;
    }
    // 中间点列表：返回 y 的数组
    function witnesses(F, G, x, z, n) {
        var ys = [];
        for (var y = 0; y < n; y++) if (F.has(key(x, y)) && G.has(key(y, z))) ys.push(y);
        return ys;
    }
    function power(R, m, n) { var t = identity(n); for (var i = 0; i < m; i++) t = compose(t, R, n); return t; }
    function equal(R, S) { if (R.size !== S.size) return false; var ok = true; R.forEach(function (k) { if (!S.has(k)) ok = false; }); return ok; }
    function sorted(R) { return Array.from(R).map(parse).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }); }
    function domain(R) { var s = {}; R.forEach(function (k) { s[parse(k)[0]] = 1; }); return Object.keys(s).map(Number).sort(function (a, b) { return a - b; }); }
    function range(R) { var s = {}; R.forEach(function (k) { s[parse(k)[1]] = 1; }); return Object.keys(s).map(Number).sort(function (a, b) { return a - b; }); }

    function setText(R, names) {
        var ps = sorted(R);
        if (!ps.length) return '∅';
        return '{' + ps.map(function (p) { return '(' + names[p[0]] + ',' + names[p[1]] + ')'; }).join(', ') + '}';
    }
    function listText(arr, names) { return arr.length ? '{' + arr.map(function (i) { return names[i]; }).join(', ') + '}' : '∅'; }

    /**
     * 渲染关系矩阵
     * opts: { n, names, R, editable, onToggle(i,j), cellClass(i,j,on) -> 额外类名, corner, hdrClass, pending(i,j) }
     */
    function renderMatrix(el, opts) {
        var n = opts.n, names = opts.names;
        el.style.gridTemplateColumns = 'repeat(' + (n + 1) + ', auto)';
        var html = '<div class="mcell corner">' + (opts.corner || '') + '</div>';
        for (var j = 0; j < n; j++) html += '<div class="mcell hdr ' + (opts.hdrClass || '') + '">' + names[j] + '</div>';
        for (var i = 0; i < n; i++) {
            html += '<div class="mcell hdr ' + (opts.hdrClass || '') + '">' + names[i] + '</div>';
            for (var j2 = 0; j2 < n; j2++) {
                var on = opts.R.has(key(i, j2));
                var pend = opts.pending && opts.pending(i, j2);
                var cls = pend ? 'pending' : (on ? 'b1' : 'b0');
                var extra = opts.cellClass ? (opts.cellClass(i, j2, on) || '') : '';
                var tag = opts.editable ? 'button' : 'div';
                html += '<' + tag + (opts.editable ? ' type="button" aria-label="切换 (' + names[i] + ',' + names[j2] + ')"' : '')
                    + ' class="mcell ' + cls + ' ' + extra + '" data-i="' + i + '" data-j="' + j2 + '">' + (pend ? '·' : (on ? 1 : 0)) + '</' + tag + '>';
            }
        }
        el.innerHTML = html;
        if (opts.editable && opts.onToggle) {
            Array.prototype.forEach.call(el.querySelectorAll('button.mcell'), function (c) {
                c.addEventListener('click', function () { opts.onToggle(+c.dataset.i, +c.dataset.j); });
            });
        }
    }

    /**
     * 渲染圆形布局的关系图（SVG 字符串）
     * layers: [{ R, color, width, dash, curve }]，按顺序绘制；同一对 (i,j) 在不同层用不同弧度避免重叠
     */
    var markerSeq = 0;
    function renderGraph(svg, opts) {
        var n = opts.n, names = opts.names, W = opts.width || 260, H = opts.height || 240;
        var cx = W / 2, cy = H / 2 + (opts.dy || 0), rad = Math.min(W, H) / 2 - 46, r = 15;
        var pts = [];
        for (var k = 0; k < n; k++) { var a = -Math.PI / 2 + k * 2 * Math.PI / n; pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]); }
        var uid = 'rg' + (++markerSeq);
        var defs = '<defs>';
        var body = '';
        (opts.layers || []).forEach(function (L, li) {
            var mid = uid + '-m' + li;
            defs += '<marker id="' + mid + '" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="' + L.color + '"/></marker>';
            L.R.forEach(function (kk) {
                var p = parse(kk), i = p[0], j = p[1];
                var P = pts[i], Q = pts[j];
                var style = 'fill="none" stroke="' + L.color + '" stroke-width="' + (L.width || 2) + '"' + (L.dash ? ' stroke-dasharray="' + L.dash + '"' : '') + ' opacity="' + (L.opacity || 0.9) + '" marker-end="url(#' + mid + ')"';
                if (i === j) {
                    var ox = P[0] - cx, oy = P[1] - cy, len = Math.sqrt(ox * ox + oy * oy) || 1;
                    var nx = ox / len, ny = oy / len, tx = -ny, ty = nx;
                    var s1x = P[0] + (nx * 0.7 + tx * 0.7) * r, s1y = P[1] + (ny * 0.7 + ty * 0.7) * r;
                    var e1x = P[0] + (nx * 0.7 - tx * 0.7) * r, e1y = P[1] + (ny * 0.7 - ty * 0.7) * r;
                    var sc = 2.6 + li * 0.5;
                    body += '<path d="M ' + s1x + ' ' + s1y + ' C ' + (P[0] + (nx * sc + tx * 1.6) * r) + ' ' + (P[1] + (ny * sc + ty * 1.6) * r) + ', '
                        + (P[0] + (nx * sc - tx * 1.6) * r) + ' ' + (P[1] + (ny * sc - ty * 1.6) * r) + ', ' + e1x + ' ' + e1y + '" ' + style + '/>';
                } else {
                    var dx = Q[0] - P[0], dy = Q[1] - P[1], dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    var ux = dx / dist, uy = dy / dist;
                    var sx = P[0] + ux * (r + 2), sy = P[1] + uy * (r + 2), ex = Q[0] - ux * (r + 3), ey = Q[1] - uy * (r + 3);
                    var bend = (L.curve != null ? L.curve : 0.12) * dist + li * 10;
                    var mx = (sx + ex) / 2 - uy * bend, my = (sy + ey) / 2 + ux * bend;
                    body += '<path d="M ' + sx + ' ' + sy + ' Q ' + mx + ' ' + my + ' ' + ex + ' ' + ey + '" ' + style + '/>';
                }
            });
        });
        defs += '</defs>';
        var nodes = '';
        for (var m = 0; m < n; m++) {
            var fill = opts.nodeFill ? opts.nodeFill(m) : '#d63b1d';
            nodes += '<circle cx="' + pts[m][0] + '" cy="' + pts[m][1] + '" r="' + r + '" fill="' + fill + '" stroke="#fff" stroke-width="2"/>'
                + '<text x="' + pts[m][0] + '" y="' + (pts[m][1] + 4.5) + '" text-anchor="middle">' + names[m] + '</text>';
        }
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svg.setAttribute('width', W);
        svg.setAttribute('height', H);
        svg.innerHTML = defs + body + nodes;
    }

    global.RelOps = {
        key: key, parse: parse, clone: clone, fromPairs: fromPairs,
        union: union, inter: inter, diff: diff, complement: complement, inverse: inverse, identity: identity,
        compose: compose, witnesses: witnesses, power: power, equal: equal, sorted: sorted,
        domain: domain, range: range, setText: setText, listText: listText,
        renderMatrix: renderMatrix, renderGraph: renderGraph
    };
})(window);
