/* =====================================================================
   第4章 特殊关系 · 三层交互引擎（基础层 / 拓展层）
   ---------------------------------------------------------------------
   页面只需提供标准外壳 + SECTION_META，并声明
     <script>window.CH4_LAYER = { unit: 'compat', level: 'basic' };</script>
     <script src="../ch4-layer.js"></script>
   引擎按 unit + level 取出本文件后半部分注册的「单元渲染器」，
   生成左侧控件（下拉 / 滑块 / 按钮 / 逐步演示）、即时结果、知识要点，
   以及右侧编号舞台卡；案例单元自动补齐「⑤ 价值引领 ⑥ 迁移思考」（六段式）。
   样式见同目录 ch4.css；配色只用全站红金令牌。
   ===================================================================== */
(function () {
  'use strict';

  var CFG = window.CH4_LAYER || {};
  var META = window.SECTION_META || {};
  var C4 = window.C4 = { units: {} };

  C4.def = function (key, spec) { C4.units[key] = spec; };

  /* ---------------- 基础工具 ---------------- */
  var $ = function (id) { return document.getElementById(id); };
  var esc = C4.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  C4.COL = {
    red: '#D63B1D', red2: '#B8321A', gold: '#FFB400', goldInk: '#8A5D0B', ink: '#2C1810',
    muted: '#6B4A38', paper: '#FFFBF0', ok: '#1F9D55', bad: '#C0392B', line: 'rgba(116,55,31,.28)'
  };
  /* 等价类 / 社群等分类着色：同章统一，暖色系 + 绿 */
  C4.CLASS = ['#D63B1D', '#E39B0B', '#2F7D57', '#8C4A2F', '#C2185B', '#6B7F1E', '#B8321A', '#A0522D'];
  C4.range = function (n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; };
  C4.fmt = function (x, d) {
    if (!isFinite(x)) return String(x);
    return Number(x).toFixed(d == null ? 2 : d).replace(/\.?0+$/, '');
  };
  C4.sub = function (n) { return String(n).replace(/\d/g, function (d) { return '₀₁₂₃₄₅₆₇₈₉'[d]; }); };

  /* 页内提示条（替代 alert） */
  C4.toast = function (msg, kind) {
    var host = document.querySelector('.c4-toast-host');
    if (!host) { host = document.createElement('div'); host.className = 'c4-toast-host'; host.setAttribute('role', 'status'); host.setAttribute('aria-live', 'polite'); document.body.appendChild(host); }
    var t = document.createElement('div');
    t.className = 'c4-toast' + (kind ? ' ' + kind : '');
    t.textContent = msg;
    host.appendChild(t);
    while (host.children.length > 3) host.removeChild(host.firstChild);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 260); }, 2600);
  };

  /* ---------------- SVG 工具 ---------------- */
  C4.svg = function (w, h, inner, label) {
    return '<svg class="c4-svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(label || '示意图') + '">' +
      '<defs>' +
      '<marker id="c4arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C4.COL.red + '"/></marker>' +
      '<marker id="c4arrGold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C4.COL.gold + '"/></marker>' +
      '<marker id="c4arrOk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C4.COL.ok + '"/></marker>' +
      '<marker id="c4arrBad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C4.COL.bad + '"/></marker>' +
      '<marker id="c4arrMuted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#B9A294"/></marker>' +
      '</defs>' + inner + '</svg>';
  };
  C4.circleLayout = function (n, cx, cy, rx, ry, rot) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var t = 2 * Math.PI * i / n - Math.PI / 2 + (rot || 0);
      pts.push([cx + rx * Math.cos(t), cy + (ry == null ? rx : ry) * Math.sin(t)]);
    }
    return pts;
  };
  /* 把线段两端各缩进 r，便于箭头不压住节点 */
  C4.trim = function (x1, y1, x2, y2, r1, r2) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1;
    return [x1 + dx * r1 / L, y1 + dy * r1 / L, x2 - dx * r2 / L, y2 - dy * r2 / L];
  };
  C4.line = function (x1, y1, x2, y2, o) {
    o = o || {};
    var p = o.trim ? C4.trim(x1, y1, x2, y2, o.trim[0], o.trim[1]) : [x1, y1, x2, y2];
    return '<line x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + p[2].toFixed(1) + '" y2="' + p[3].toFixed(1) +
      '" stroke="' + (o.color || C4.COL.red) + '" stroke-width="' + (o.width || 2) + '"' +
      (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + (o.opacity != null ? ' opacity="' + o.opacity + '"' : '') +
      (o.arrow ? ' marker-end="url(#' + o.arrow + ')"' : '') + ' stroke-linecap="round"/>';
  };
  C4.curve = function (x1, y1, x2, y2, bend, o) {
    o = o || {};
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1;
    var cx = mx - dy / L * bend, cy = my + dx / L * bend;
    return '<path d="M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + x2.toFixed(1) + ',' + y2.toFixed(1) +
      '" fill="none" stroke="' + (o.color || C4.COL.red) + '" stroke-width="' + (o.width || 2) + '"' +
      (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + (o.opacity != null ? ' opacity="' + o.opacity + '"' : '') +
      (o.arrow ? ' marker-end="url(#' + o.arrow + ')"' : '') + '/>';
  };
  /* 圆形节点：o = {r, fill, stroke, sw, text, textFill, size, act, arg, ring, title} */
  C4.node = function (x, y, label, o) {
    o = o || {};
    var r = o.r || 20;
    var attrs = o.act ? ' class="node" data-act="' + o.act + '" data-arg="' + esc(o.arg) + '" tabindex="0" role="button" aria-label="' + esc(o.title || label) + '"' : '';
    return '<g' + attrs + '>' + (o.title ? '<title>' + esc(o.title) + '</title>' : '') +
      (o.ring ? '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r + 6) + '" fill="none" stroke="' + o.ring + '" stroke-width="3" opacity=".9"/>' : '') +
      '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" fill="' + (o.fill || '#fff') + '" stroke="' + (o.stroke || C4.COL.red) + '" stroke-width="' + (o.sw || 2) + '"/>' +
      '<text x="' + x.toFixed(1) + '" y="' + (y + (o.size || 13) * 0.36).toFixed(1) + '" text-anchor="middle" font-size="' + (o.size || 13) + '" font-weight="700" fill="' + (o.textFill || C4.COL.ink) + '"' + (o.mono ? ' class="mono"' : '') + '>' + esc(label) + '</text></g>';
  };
  C4.text = function (x, y, s, o) {
    o = o || {};
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="' + (o.anchor || 'middle') + '" font-size="' + (o.size || 12) + '" fill="' + (o.fill || C4.COL.muted) + '"' +
      (o.weight ? ' font-weight="' + o.weight + '"' : '') + (o.mono ? ' class="mono"' : '') + '>' + esc(s) + '</text>';
  };
  C4.legend = function (items) {
    return '<div class="c4-legend">' + items.map(function (it) {
      return '<span><i' + (it.line ? ' class="line"' : '') + ' style="background:' + it.color + (it.border ? ';border:2px solid ' + it.border : '') + '"></i>' + esc(it.text) + '</span>';
    }).join('') + '</div>';
  };

  /* 二部映射图：A 在左、B 在右；pairs = [[i, j, color?, dash?]]
     o.aState[i] / o.bState[j] ∈ {'', 'bad', 'gold', 'ok', 'dim'}；o.actA 让左侧节点可点击 */
  function pillW(t) { return Math.max(40, String(t).length * 8.5 + 20); }
  C4.mapSvg = function (A, B, pairs, o) {
    o = o || {};
    var n = Math.max(A.length, B.length), gap = o.gap || 50, top = o.top || 58;
    var h = top + (n - 1) * gap + 40, w = o.w || 640, xa = o.xa || 150, xb = w - (o.xa || 150);
    var ya = function (i) { return top + (n - A.length) * gap / 2 + i * gap; };
    var yb = function (j) { return top + (n - B.length) * gap / 2 + j * gap; };
    var out = '';
    out += '<ellipse cx="' + xa + '" cy="' + (top + (n - 1) * gap / 2) + '" rx="62" ry="' + ((n - 1) * gap / 2 + 36) + '" fill="rgba(214,59,29,.05)" stroke="rgba(214,59,29,.25)" stroke-dasharray="5 5"/>';
    out += '<ellipse cx="' + xb + '" cy="' + (top + (n - 1) * gap / 2) + '" rx="62" ry="' + ((n - 1) * gap / 2 + 36) + '" fill="rgba(255,180,0,.07)" stroke="rgba(255,180,0,.5)" stroke-dasharray="5 5"/>';
    out += C4.text(xa, 22, o.aName || 'A（定义域）', { size: 14, weight: 700, fill: C4.COL.red });
    out += C4.text(xb, 22, o.bName || 'B（陪域）', { size: 14, weight: 700, fill: C4.COL.goldInk });
    pairs.forEach(function (p) {
      var col = p[2] || C4.COL.red;
      var mk = col === C4.COL.bad ? 'c4arrBad' : col === C4.COL.ok ? 'c4arrOk' : col === C4.COL.gold ? 'c4arrGold' : col === '#B9A294' ? 'c4arrMuted' : 'c4arr';
      var ra = o.pill ? 12 : (o.r || 19) + 3, rb = (o.r || 19) + 5;
      out += C4.line(xa + (o.pill ? pillW(A[p[0]]) / 2 - 12 : 0), ya(p[0]), xb, yb(p[1]), { color: col, width: p[4] || 2.4, dash: p[3] || (col === C4.COL.bad ? '7 4' : null), arrow: mk, trim: [ra, rb], opacity: 0.9 });
    });
    var st = function (s, side) {
      if (s === 'bad') return { fill: '#FDECEA', stroke: C4.COL.bad, ring: C4.COL.bad };
      if (s === 'gold') return { fill: '#FFF4D6', stroke: C4.COL.gold, ring: C4.COL.gold };
      if (s === 'ok') return { fill: '#E8F6EE', stroke: C4.COL.ok };
      if (s === 'dim') return { fill: '#F4EEE9', stroke: '#C9B8AD' };
      return side === 'A' ? { fill: C4.COL.red, stroke: C4.COL.red2, textFill: '#fff' } : { fill: '#FFF4D6', stroke: C4.COL.gold };
    };
    A.forEach(function (a, i) {
      var s = st((o.aState || [])[i], 'A');
      if (o.pill) {
        var pw = pillW(a);
        out += '<g><rect x="' + (xa - pw / 2) + '" y="' + (ya(i) - 15) + '" width="' + pw + '" height="30" rx="15" fill="' + s.fill + '" stroke="' + s.stroke + '" stroke-width="2"/>' +
          C4.text(xa, ya(i) + 5, a, { size: 13, weight: 700, fill: s.textFill || C4.COL.ink, mono: true }) + '</g>';
        return;
      }
      out += C4.node(xa, ya(i), a, { r: o.r || 19, fill: s.fill, stroke: s.stroke, textFill: s.textFill, ring: s.ring, act: o.actA, arg: i, title: o.actA ? '点击改变 ' + a + ' 的像' : '' });
    });
    B.forEach(function (b, j) {
      var s = st((o.bState || [])[j], 'B');
      out += C4.node(xb, yb(j), b, { r: o.r || 19, fill: s.fill, stroke: s.stroke, textFill: s.textFill, ring: s.ring, act: o.actB, arg: j });
    });
    return C4.svg(w, h, out, o.label || '映射示意图');
  };

  /* 偏序：元素 els、比较 leq(a,b)；返回覆盖关系、层级（最长链高度）与坐标 */
  C4.hasse = function (els, leq, w, h, pad) {
    var n = els.length, lt = function (i, j) { return i !== j && leq(els[i], els[j]); };
    var covers = [];
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) if (lt(i, j)) {
      var c = true;
      for (var k = 0; k < n; k++) if (k !== i && k !== j && lt(i, k) && lt(k, j)) { c = false; break; }
      if (c) covers.push([i, j]);
    }
    var lv = new Array(n).fill(0), changed = true, guard = 0;
    while (changed && guard++ < 50) { changed = false; covers.forEach(function (e) { if (lv[e[1]] < lv[e[0]] + 1) { lv[e[1]] = lv[e[0]] + 1; changed = true; } }); }
    var maxL = Math.max.apply(null, lv.concat([0])), rows = {};
    lv.forEach(function (l, idx) { (rows[l] = rows[l] || []).push(idx); });
    pad = pad || 44;
    var pos = [];
    Object.keys(rows).forEach(function (l) {
      var r = rows[l];
      r.forEach(function (idx, k) {
        var x = w / 2 + (k - (r.length - 1) / 2) * Math.min(160, (w - 2 * pad) / Math.max(1, r.length));
        var y = maxL === 0 ? h / 2 : h - pad - (h - 2 * pad) * (+l) / maxL;
        pos[idx] = [x, y];
      });
    });
    return { covers: covers, level: lv, pos: pos, height: maxL };
  };

  /* 极大团（Bron–Kerbosch，小规模） */
  C4.maxCliques = function (n, adj) {
    var res = [];
    (function bk(R, P, X) {
      if (!P.length && !X.length) { res.push(R.slice().sort(function (a, b) { return a - b; })); return; }
      P.slice().forEach(function (v) {
        bk(R.concat([v]), P.filter(function (u) { return u !== v && adj(u, v); }), X.filter(function (u) { return u !== v && adj(u, v); }));
        P = P.filter(function (u) { return u !== v; }); X = X.concat([v]);
      });
    })([], C4.range(n), []);
    return res.sort(function (a, b) { return b.length - a.length || a[0] - b[0]; });
  };
  /* 连通分量（并查集） */
  C4.components = function (n, edges) {
    var p = C4.range(n);
    var f = function (x) { while (p[x] !== x) { p[x] = p[p[x]]; x = p[x]; } return x; };
    edges.forEach(function (e) { var a = f(e[0]), b = f(e[1]); if (a !== b) p[Math.max(a, b)] = Math.min(a, b); });
    var map = {}, comp = [];
    for (var i = 0; i < n; i++) { var r = f(i); if (!(r in map)) { map[r] = comp.length; comp.push([]); } comp[map[r]].push(i); }
    var of = new Array(n);
    comp.forEach(function (c, k) { c.forEach(function (i) { of[i] = k; }); });
    return { classes: comp, of: of };
  };

  /* ---------------- 状态与渲染 ---------------- */
  var unit, S = { v: {}, step: 0, total: 0, data: {}, level: CFG.level || 'basic' };
  C4.state = S;
  var timer = null;

  function speedMs() { var v = +(S.v.__speed || 3); return [1700, 1300, 950, 650, 420][v - 1] || 950; }

  function controlHTML(c) {
    var h = '';
    if (c.type === 'select') {
      h += '<select class="c4-select" id="c4_' + c.id + '" data-ctl="' + c.id + '" aria-label="' + esc(c.label) + '">' +
        c.options.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(c.value) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>';
    } else if (c.type === 'range') {
      h += '<div class="c4-range"><span>' + esc(c.text || c.label) + '<b id="c4_' + c.id + '_v"></b></span>' +
        '<input type="range" id="c4_' + c.id + '" data-ctl="' + c.id + '" min="' + c.min + '" max="' + c.max + '" step="' + (c.step || 1) + '" value="' + c.value + '" aria-label="' + esc(c.text || c.label) + '"></div>';
    } else if (c.type === 'buttons') {
      h += '<div class="c4-btn-row' + (c.items.length === 1 ? ' one' : c.items.length === 3 ? ' three' : '') + '">' + c.items.map(function (b) {
        return '<button type="button" class="c4-btn ' + (b.cls || '') + '" data-act="' + b.act + '"' + (b.arg != null ? ' data-arg="' + esc(b.arg) + '"' : '') + '>' + esc(b.text) + '</button>';
      }).join('') + '</div>';
    } else if (c.type === 'stepper') {
      h += '<div class="c4-btn-row"><button type="button" class="c4-btn" id="c4Prev">◀ 上一步</button><button type="button" class="c4-btn primary" id="c4Next">下一步 ▶</button>' +
        '<button type="button" class="c4-btn" id="c4Auto">▶ 自动播放</button><button type="button" class="c4-btn ghost" id="c4Reset">↺ 重置</button></div>' +
        '<div class="c4-range"><span>播放速度<b id="c4___speed_v"></b></span><input type="range" id="c4___speed" data-ctl="__speed" min="1" max="5" value="3" aria-label="播放速度"></div>' +
        '<div class="c4-progress"><div class="bar"><i id="c4Bar"></i></div><span class="num" id="c4StepNum">0 / 0</span></div>';
    }
    return h;
  }

  function buildSidebar() {
    var host = $('c4Controls');
    if (!host) return;
    var html = '';
    var hasStepper = false;
    (unit.controls || []).forEach(function (g, gi) {
      var items = g.items || [g];
      if (items.some(function (c) { return c.type === 'stepper'; })) hasStepper = true;
      html += '<div class="control-group" data-gi="' + gi + '"><label>' + esc(g.label || items[0].label) + (g.hint ? '<small>' + esc(g.hint) + '</small>' : '') + '</label>' +
        items.map(controlHTML).join('') + '</div>';
    });
    if (!hasStepper) {
      html += '<div class="control-group"><label>操作</label><div class="c4-btn-row one"><button type="button" class="c4-btn ghost" id="c4Reset">↺ 重置</button></div></div>';
    }
    html += '<div class="control-group"><label>即时结果</label><div class="result-panel c4-result" aria-live="polite">' +
      '<div class="formula" id="c4Formula">—</div><span class="rlabel">判定 / 结论</span><span class="rvalue" id="c4Value">—</span><p class="rextra" id="c4Extra"></p></div></div>';
    if (unit.points && unit.points.length) {
      html += '<div class="control-group"><label>知识要点</label><div class="info-panel"><ul class="c4-points">' +
        unit.points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul></div></div>';
    }
    host.innerHTML = html;
    S.hasStepper = hasStepper;
  }

  function buildStage() {
    var host = $('c4Stage');
    if (!host) return;
    var html = '<section class="c4-mission"><span><b>互动任务：</b>' + unit.mission + '</span><span class="c4-badge">' + esc(unit.badge || '') + '</span></section>';
    var stages = (unit.stages || []).slice();
    if (unit.caseSix) {
      var io = META.ideology || {};
      stages.push({ id: '__value', title: '价值引领', cls: 'c4-value', static: '<h4>🚩 ' + esc(io.title || '价值引领') + '</h4><p>' + esc(io.text || '') + '</p>' +
        (io.dims && io.dims.length ? '<div class="c4-dims">' + io.dims.map(function (d) { return '<span>' + esc(d) + '</span>'; }).join('') + '</div>' : '') +
        (io.quote ? '<div class="quote">' + esc(io.quote) + '</div>' : '') });
      var tr = (unit.transfer || []).concat((META.reflect || []).slice(0, 2).map(function (r) { return '思考：' + esc(r); }));
      stages.push({ id: '__transfer', title: '迁移思考', static: '<ul class="c4-list">' + tr.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' });
    }
    html += '<div class="c4-stages' + (unit.cols === 2 ? ' cols-2' : '') + '">' + stages.map(function (s, i) {
      return '<section class="c4-card ' + (s.cls || '') + (s.wide ? ' wide' : '') + '" id="c4card_' + s.id + '"><div class="c4-head"><span class="c4-num">' + (i + 1) + '</span><span class="c4-title">' + esc(s.title) + '</span>' +
        (s.hint ? '<span class="c4-hint" id="c4hint_' + s.id + '">' + esc(s.hint) + '</span>' : '') + '</div><div id="c4_' + s.id + '">' + (s.static || '') + '</div></section>';
    }).join('') + '</div>';
    host.innerHTML = html;
  }

  S.body = function (id) { return $('c4_' + id); };
  S.set = function (id, html) { var e = $('c4_' + id); if (e) e.innerHTML = html; };
  S.hint = function (id, text) { var e = $('c4hint_' + id); if (e) e.textContent = text; };

  C4.result = function (formula, value, extra) {
    var f = $('c4Formula'), v = $('c4Value'), x = $('c4Extra');
    if (f) f.innerHTML = formula;
    if (v) v.innerHTML = value;
    if (x) x.innerHTML = extra || '';
  };

  function readControls() {
    document.querySelectorAll('[data-ctl]').forEach(function (el) {
      var id = el.getAttribute('data-ctl');
      S.v[id] = el.type === 'range' ? +el.value : el.value;
      var out = $('c4_' + id + '_v');
      if (out) {
        var spec = findCtl(id);
        out.textContent = spec && spec.fmt ? spec.fmt(+el.value) : id === '__speed' ? ['很慢', '慢', '中', '快', '很快'][+el.value - 1] : el.value;
      }
    });
  }
  function findCtl(id) {
    var r = null;
    (unit.controls || []).forEach(function (g) { (g.items || [g]).forEach(function (c) { if (c.id === id) r = c; }); });
    return r;
  }

  function syncStepper() {
    var p = $('c4Prev'), n = $('c4Next'), b = $('c4Bar'), num = $('c4StepNum');
    if (!p) return;
    p.disabled = S.step <= 0;
    n.disabled = S.step >= S.total;
    if (b) b.style.width = (S.total ? (S.step / S.total * 100) : 0) + '%';
    if (num) num.textContent = S.step + ' / ' + S.total;
  }

  function prepare() {
    S.total = 0;
    if (unit.prepare) unit.prepare(S);
    if (S.step > S.total) S.step = S.total;
  }
  function syncVisibility() {
    (unit.controls || []).forEach(function (g, gi) {
      if (g.show) {
        var ge = document.querySelector('#c4Controls [data-gi="' + gi + '"]');
        if (ge) ge.style.display = g.show(S.v) ? '' : 'none';
        return;
      }
      (g.items || [g]).forEach(function (c) {
        if (!c.show || !c.id) return;
        var el = $('c4_' + c.id); if (!el) return;
        var box = el.closest('.c4-range') || el;
        box.style.display = c.show(S.v) ? '' : 'none';
        var grp = box.closest('.control-group');
        if (grp) {
          var vis = Array.prototype.some.call(grp.children, function (ch) { return ch.tagName !== 'LABEL' && ch.style.display !== 'none'; });
          grp.style.display = vis ? '' : 'none';
        }
      });
    });
  }
  var render = C4.render = function () {
    readControls();
    syncVisibility();
    unit.render(S);
    syncStepper();
  };

  function stopAuto() {
    if (timer) { clearInterval(timer); timer = null; }
    var a = $('c4Auto'); if (a) { a.textContent = '▶ 自动播放'; a.classList.remove('playing'); }
  }
  function startAuto() {
    if (S.step >= S.total) { S.step = 0; render(); }
    var a = $('c4Auto'); if (a) { a.textContent = '⏸ 暂停'; a.classList.add('playing'); }
    timer = setInterval(function () {
      if (S.step >= S.total) { stopAuto(); if (unit.onDone) unit.onDone(S); return; }
      S.step++; render();
    }, speedMs());
  }
  function resetAll() {
    stopAuto();
    (unit.controls || []).forEach(function (g) {
      (g.items || [g]).forEach(function (c) {
        var el = c.id && $('c4_' + c.id);
        if (el) el.value = c.value;
      });
    });
    var sp = $('c4___speed'); if (sp) sp.value = 3;
    S.data = {};
    S.step = unit.startStep || 0;
    readControls();
    if (unit.init) unit.init(S);
    prepare();
    if (unit.startAtEnd) S.step = S.total;
    render();
  }

  function bind() {
    document.addEventListener('input', function (e) {
      var id = e.target && e.target.getAttribute && e.target.getAttribute('data-ctl');
      if (!id) return;
      if (id === '__speed') { readControls(); if (timer) { stopAuto(); startAuto(); } return; }
      stopAuto();
      readControls();
      var spec = findCtl(id);
      if (spec && spec.keepStep) { prepare(); } else { S.step = unit.startStep || 0; if (unit.onChange) unit.onChange(S, id); prepare(); if (unit.startAtEnd) S.step = S.total; }
      render();
    });
    document.addEventListener('change', function (e) {
      var el = e.target;
      if (el && el.tagName === 'SELECT' && el.getAttribute('data-ctl')) el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('#c4Prev,#c4Next,#c4Auto,#c4Reset,[data-act]');
      if (!t) return;
      if (t.closest('#dm-assist-root,#dm-page-layers')) return;
      if (t.id === 'c4Prev') { stopAuto(); if (S.step > 0) { S.step--; render(); } return; }
      if (t.id === 'c4Next') { stopAuto(); if (S.step < S.total) { S.step++; render(); if (S.step === S.total && unit.onDone) unit.onDone(S); } return; }
      if (t.id === 'c4Auto') { if (timer) stopAuto(); else startAuto(); return; }
      if (t.id === 'c4Reset') { resetAll(); C4.toast('已重置为初始示例'); return; }
      var act = t.getAttribute('data-act');
      if (act === '__reset') { resetAll(); C4.toast('已重置为初始示例'); return; }
      if (act && unit.act) {
        stopAuto();
        var r = unit.act(S, act, t.getAttribute('data-arg'));
        if (r !== false) { prepare(); render(); }
      }
    });
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.matches && e.target.matches('g.node[data-act]')) {
        e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
  }

  C4.boot = function () {
    unit = C4.units[CFG.unit + '/' + CFG.level];
    if (!unit) { if (window.console) console.warn('[ch4-layer] 未注册单元：' + CFG.unit + '/' + CFG.level); return; }
    document.body.classList.add('c4-layer-page');
    buildSidebar();
    buildStage();
    readControls();
    S.step = unit.startStep || 0;
    if (unit.init) unit.init(S);
    prepare();
    if (unit.startAtEnd) S.step = S.total;
    bind();
    render();
  };
})();

/* =====================================================================
   各单元渲染器（C4.def('单元/层级', spec)）
   spec: badge, mission, controls[], stages[], points[], caseSix, transfer[],
         init(S), prepare(S)（设置 S.total 步数）, render(S), act(S, act, arg)
   ===================================================================== */

/* ---------- 4.1 相容和等价关系 ---------- */
(function () {
  var C = C4.COL, esc = C4.esc;
  var P = ['甲', '乙', '丙', '丁', '戊', '己'];
  var SCN = {
    skill: {
      title: '志愿者「有共同技能」', rule: 'x R y ⇔ x 与 y 至少有一项共同技能',
      attr: [['医疗', '外语'], ['外语', '摄影'], ['摄影', '驾驶'], ['驾驶', '医疗'], ['编程'], ['编程', '外语']],
      rel: function (a, b) { var A = this.attr[a], B = this.attr[b]; return A.some(function (t) { return B.indexOf(t) >= 0; }); },
      tag: function (i) { return this.attr[i].join('·'); }
    },
    age: {
      title: '队员「年龄相差不超过 1 岁」', rule: 'x R y ⇔ |年龄(x) − 年龄(y)| ≤ 1',
      ages: [18, 19, 20, 21, 19, 22],
      rel: function (a, b) { return Math.abs(this.ages[a] - this.ages[b]) <= 1; },
      tag: function (i) { return this.ages[i] + ' 岁'; }
    },
    team: {
      title: '志愿者「在同一服务站」', rule: 'x R y ⇔ x 与 y 属于同一服务站',
      team: ['一站', '二站', '二站', '一站', '三站', '二站'],
      rel: function (a, b) { return this.team[a] === this.team[b]; },
      tag: function (i) { return this.team[i]; }
    }
  };
  function analyse(sc) {
    var n = P.length, R = function (a, b) { return sc.rel(a, b); };
    var refl = true, sym = true, tr = true, cx = null;
    for (var i = 0; i < n; i++) if (!R(i, i)) refl = false;
    for (i = 0; i < n; i++) for (var j = 0; j < n; j++) if (R(i, j) && !R(j, i)) sym = false;
    for (i = 0; i < n && tr; i++) for (j = 0; j < n && tr; j++) for (var k = 0; k < n && tr; k++)
      if (i !== j && j !== k && i !== k && R(i, j) && R(j, k) && !R(i, k)) { tr = false; cx = [i, j, k]; }
    var cliques = C4.maxCliques(n, function (a, b) { return R(a, b); });
    var overlap = false;
    cliques.forEach(function (c1, x) { cliques.forEach(function (c2, y) { if (x < y && c1.some(function (v) { return c2.indexOf(v) >= 0; })) overlap = true; }); });
    return { refl: refl, sym: sym, tr: tr, cx: cx, cliques: cliques, overlap: overlap, R: R };
  }

  C4.def('compat/basic', {
    badge: '关系图 · 极大相容类',
    mission: '选一个场景，看关系是否满足自反、对称、传递；再点「极大相容类」，观察相容类为何可以<b>重叠</b>，而等价类却<b>互不相交</b>。',
    cols: 2,
    controls: [
      { type: 'select', id: 'scn', label: '选择场景', value: 'skill', options: [['skill', '有共同技能（相容关系）'], ['age', '年龄相差 ≤ 1 岁（相容关系）'], ['team', '在同一服务站（等价关系）']] },
      { label: '观察', items: [{ type: 'buttons', items: [{ act: 'cx', text: '标出传递反例', cls: 'primary' }, { act: 'clear', text: '取消高亮' }] }] }
    ],
    stages: [
      { id: 'obj', title: '对象与关系', hint: 'A = {甲, 乙, 丙, 丁, 戊, 己}', wide: true },
      { id: 'graph', title: '简化关系图', hint: '省略自环，无向边表示 xRy 且 yRx' },
      { id: 'mat', title: '关系矩阵', hint: '对角线全 1 = 自反；关于对角线对称 = 对称' },
      { id: 'prop', title: '性质检验', wide: true },
      { id: 'cls', title: '极大相容类', hint: '点击查看各类', wide: true }
    ],
    points: [
      '<b>相容关系</b>：集合 A 上自反且对称的关系。',
      '<b>相容类</b>：任意两元素都相容的子集；不能再添加元素的相容类叫<b>极大相容类</b>。',
      '极大相容类之间可以重叠，全体构成 A 的一个<b>覆盖</b>，不一定是划分。',
      '再加上<b>传递性</b>就是等价关系：此时极大相容类恰为等价类，两两不交。'
    ],
    init: function (S) { S.data.hl = null; },
    onChange: function (S) { S.data.hl = null; },
    act: function (S, act, arg) {
      if (act === 'cx') {
        var a = analyse(SCN[S.v.scn]);
        if (!a.cx) { C4.toast('本场景满足传递性，找不到反例——它是等价关系。', 'ok'); S.data.hl = null; }
        else S.data.hl = 'cx';
      } else if (act === 'clear') S.data.hl = null;
      else if (act === 'cl') S.data.hl = +arg;
    },
    render: function (S) {
      var sc = SCN[S.v.scn], a = analyse(sc), n = P.length, hl = S.data.hl;
      S.set('obj', '<p><b>' + esc(sc.title) + '</b>：' + esc(sc.rule) + '</p><div class="c4-chips">' +
        P.map(function (p, i) { return '<span class="c4-chip">' + p + '<small style="color:#6B4A38">（' + esc(sc.tag(i)) + '）</small></span>'; }).join('') + '</div>');
      var pts = C4.circleLayout(n, 200, 150, 120, 110), out = '';
      var inCl = function (i) { return typeof hl === 'number' && a.cliques[hl].indexOf(i) >= 0; };
      for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) if (a.R(i, j)) {
        var on = typeof hl === 'number' ? (inCl(i) && inCl(j)) : hl === 'cx' ? ((i === a.cx[0] || i === a.cx[1] || i === a.cx[2]) && (j === a.cx[0] || j === a.cx[1] || j === a.cx[2])) : false;
        out += C4.line(pts[i][0], pts[i][1], pts[j][0], pts[j][1], { color: on ? C.red : '#C9A99A', width: on ? 3.5 : 2, opacity: on || hl == null ? 1 : 0.5 });
      }
      if (hl === 'cx') out += C4.line(pts[a.cx[0]][0], pts[a.cx[0]][1], pts[a.cx[2]][0], pts[a.cx[2]][1], { color: C.bad, width: 2.5, dash: '6 5', trim: [22, 22] }) +
        C4.text((pts[a.cx[0]][0] + pts[a.cx[2]][0]) / 2 + 22, (pts[a.cx[0]][1] + pts[a.cx[2]][1]) / 2 + 4, '缺边', { fill: C.bad, weight: 700 });
      P.forEach(function (p, i) {
        var hot = inCl(i) || (hl === 'cx' && a.cx.indexOf(i) >= 0);
        out += C4.node(pts[i][0], pts[i][1], p, { r: 21, fill: hot ? C.red : '#fff', textFill: hot ? '#fff' : C.ink, ring: hl === 'cx' && a.cx.indexOf(i) >= 0 ? C.gold : null, size: 15 });
      });
      S.set('graph', C4.svg(400, 300, out, '简化关系图'));
      var t = '<div class="c4-table-wrap"><table class="c4-table"><tr><th>R</th>' + P.map(function (p) { return '<th>' + p + '</th>'; }).join('') + '</tr>';
      for (i = 0; i < n; i++) {
        t += '<tr><th>' + P[i] + '</th>';
        for (j = 0; j < n; j++) {
          var cl = a.R(i, j) ? 'hit' : '';
          if (typeof hl === 'number' && inCl(i) && inCl(j)) cl = 'soft';
          if (hl === 'cx' && i === a.cx[0] && j === a.cx[2]) cl = 'bad cur';
          t += '<td class="mono ' + cl + '">' + (a.R(i, j) ? 1 : 0) + '</td>';
        }
        t += '</tr>';
      }
      S.set('mat', t + '</table></div>');
      var cxText = a.cx ? P[a.cx[0]] + 'R' + P[a.cx[1]]+ '，' + P[a.cx[1]] + 'R' + P[a.cx[2]] + '，但 ' + P[a.cx[0]] + ' 与 ' + P[a.cx[2]] + ' 不相关' : '对任意 xRy、yRz 都有 xRz';
      S.set('prop', '<div class="c4-verdicts">' +
        '<div class="c4-verdict ' + (a.refl ? 'ok' : 'bad') + '"><b>自反性 ' + (a.refl ? '✓' : '✗') + '</b><span>每个人与自己相关（矩阵对角线全为 1）</span></div>' +
        '<div class="c4-verdict ' + (a.sym ? 'ok' : 'bad') + '"><b>对称性 ' + (a.sym ? '✓' : '✗') + '</b><span>xRy ⇒ yRx（矩阵关于主对角线对称）</span></div>' +
        '<div class="c4-verdict ' + (a.tr ? 'ok' : 'bad') + '"><b>传递性 ' + (a.tr ? '✓' : '✗') + '</b><span>' + esc(cxText) + '</span></div>' +
        '<div class="c4-verdict gold"><b>' + (a.tr ? '等价关系' : '相容关系') + '</b><span>' + (a.tr ? '自反 + 对称 + 传递' : '自反 + 对称，但不传递') + '</span></div></div>');
      S.set('cls', '<div class="c4-chips">' + a.cliques.map(function (c, k) {
        return '<button type="button" class="c4-chip' + (hl === k ? ' hot' : '') + '" data-act="cl" data-arg="' + k + '">{' + c.map(function (x) { return P[x]; }).join(', ') + '}</button>';
      }).join('') + '</div><p class="c4-note" style="margin-top:10px">' + (a.overlap
        ? '这些极大相容类<b>有公共元素</b>（例如某人同时属于两类），它们覆盖了 A，但不是划分——这就是「求同存异」：可以同时属于多个圈子。'
        : '这些类<b>两两不交且并为 A</b>，构成 A 的一个划分：它们正是等价类。') + '</p>');
      C4.result('R 的性质：' + (a.refl ? '自反 ' : '') + (a.sym ? '对称 ' : '') + (a.tr ? '传递' : '（不传递）'),
        (a.tr ? '等价关系' : '相容关系') + ' · ' + a.cliques.length + ' 个极大相容类',
        a.overlap ? '极大相容类有重叠 → 构成覆盖，不是划分。' : '极大相容类两两不交 → 构成划分（商集）。');
    }
  });

  /* ----- 拓展层：等价类的应用 ----- */
  var UF_REC = ['张三·报名表', '李四·报名表', '王五·报名表', '张三·志愿表', '赵六·报名表', '李四·志愿表', '张三·签到表', '王五·签到表'];
  var UF_OPS = [[0, 3], [1, 5], [3, 6], [2, 7], [4, 4], [0, 6]];
  var PTS = [1, 2, 3.2, 6, 7, 7.8, 12, 13.5];

  C4.def('compat/extend', {
    badge: '剩余类 · 并查集 · 聚类',
    mission: '三个工程场景里的「等价类」：按模分类、并查集去重、相似度聚类。用逐步演示观察等价类如何形成，思考「相似」为何不一定是等价关系。',
    startAtEnd: true,
    controls: [
      { type: 'select', id: 'mode', label: '应用场景', value: 'mod', options: [['mod', '模 m 剩余类（按余数分组）'], ['uf', '并查集：多表记录去重'], ['cluster', '相似度阈值聚类（链式合并）']] },
      { label: '参数', items: [
        { type: 'range', id: 'm', text: '模数 m', min: 2, max: 7, value: 3, show: function (v) { return v.mode === 'mod'; } },
        { type: 'range', id: 'eps', text: '相似阈值 ε', min: 0.5, max: 4, step: 0.5, value: 1.5, show: function (v) { return v.mode === 'cluster'; } }
      ] },
      { label: '逐步演示', type: 'stepper' }
    ],
    stages: [
      { id: 'model', title: '模型与规则' },
      { id: 'viz', title: '过程可视化' },
      { id: 'quot', title: '等价类与商集' }
    ],
    points: [
      '等价关系 R 把 A 划分为等价类 [x]<sub>R</sub>，商集 A/R = {[x]<sub>R</sub> | x∈A}。',
      '模 m 同余的商集 ℤ<sub>m</sub> 恰有 m 个剩余类 [0], [1], …, [m−1]。',
      '<b>并查集</b>维护动态等价类：union 合并两类，find 返回类的代表元。',
      '「距离 ≤ ε」只满足自反、对称（相容关系）；取其<b>传递闭包</b>才是等价关系——即单链接聚类的「链式效应」。'
    ],
    prepare: function (S) {
      var m = S.v.mode;
      S.total = m === 'mod' ? 18 : m === 'uf' ? UF_OPS.length : this.pairs(S).length;
    },
    pairs: function (S) {
      var e = [], eps = S.v.eps;
      for (var i = 0; i < PTS.length; i++) for (var j = i + 1; j < PTS.length; j++) if (Math.abs(PTS[i] - PTS[j]) <= eps + 1e-9) e.push([i, j, Math.abs(PTS[i] - PTS[j])]);
      return e.sort(function (a, b) { return a[2] - b[2]; });
    },
    render: function (S) {
      var mode = S.v.mode, k = S.step, C = C4.COL;
      if (mode === 'mod') {
        var m = S.v.m, N = 18;
        S.set('model', '<p class="c4-mono">x ~ y ⇔ x ≡ y (mod ' + m + ') ⇔ ' + m + ' | (x − y)</p><p class="c4-note">把 0～' + (N - 1) + ' 逐个放入它所在的剩余类。同余关系自反、对称、传递，因此是等价关系。</p>');
        var cells = '';
        for (var x = 0; x < N; x++) {
          var col = C4.CLASS[x % m];
          cells += '<span style="' + (x < k ? 'background:' + col + ';color:#fff;border-color:' + col : 'opacity:.35') + (x === k - 1 ? ';outline:3px solid #FFB400' : '') + '">' + x + '</span>';
        }
        S.set('viz', '<div class="c4-seq">' + cells + '</div><p class="c4-note" style="margin-top:8px">' + (k ? '第 ' + k + ' 步：' + (k - 1) + ' ÷ ' + m + ' 余 ' + ((k - 1) % m) + ' → 放入 [' + ((k - 1) % m) + ']' : '点击「下一步」逐个归类') + '</p>');
        var q = '';
        for (var r = 0; r < m; r++) {
          var mem = []; for (x = r; x < k; x += m) mem.push(x);
          q += '<div class="c4-verdict" style="border-top-color:' + C4.CLASS[r] + '"><b style="color:' + C4.CLASS[r] + '">[' + r + ']</b><span class="c4-mono">{' + (mem.join(', ') || ' ') + (k >= N ? ', …' : '') + '}</span></div>';
        }
        S.set('quot', '<div class="c4-verdicts">' + q + '</div><p class="c4-note" style="margin-top:8px">商集 ℤ<sub>' + m + '</sub> = {' + C4.range(m).map(function (r) { return '[' + r + ']'; }).join(', ') + '}，共 ' + m + ' 个等价类，两两不交、并为全体整数。</p>');
        C4.result('ℤ / ≡<sub>' + m + '</sub>', m + ' 个剩余类', '已归类 ' + k + ' / ' + N + ' 个整数。第 1 章的同余与这里的等价类是同一件事。');
      } else if (mode === 'uf') {
        var p = C4.range(UF_REC.length), logs = [];
        var find = function (x) { while (p[x] !== x) x = p[x]; return x; };
        for (var s = 0; s < k; s++) {
          var o = UF_OPS[s], ra = find(o[0]), rb = find(o[1]);
          if (o[0] === o[1]) logs.push('R' + (o[0] + 1) + ' 无匹配记录，自成一类');
          else if (ra === rb) logs.push('R' + (o[0] + 1) + ' 与 R' + (o[1] + 1) + ' 已同类，跳过');
          else { p[rb] = ra; logs.push('union(R' + (o[0] + 1) + ', R' + (o[1] + 1) + ')：身份证号相同，合并'); }
        }
        S.set('model', '<p>8 条来自不同表格的记录，<b>「身份证号相同」</b>是等价关系。依次读入匹配对，用并查集合并。</p><div class="c4-chips">' +
          UF_REC.map(function (r, i) { return '<span class="c4-chip mono">R' + (i + 1) + ' ' + esc(r) + '</span>'; }).join('') + '</div>');
        var ord = [0, 3, 6, 1, 5, 2, 7, 4], cl8 = C4.circleLayout(8, 300, 125, 230, 95), pts = []; ord.forEach(function (r, k) { pts[r] = cl8[k]; }); var out = '';
        p.forEach(function (par, i) { if (par !== i) out += C4.line(pts[i][0], pts[i][1], pts[par][0], pts[par][1], { color: C.red, width: 2.4, arrow: 'c4arr', trim: [22, 25] }); });
        var comp = {}; C4.range(8).forEach(function (i) { var r = find(i); (comp[r] = comp[r] || []).push(i); });
        var roots = Object.keys(comp).map(Number);
        C4.range(8).forEach(function (i) {
          var ci = roots.indexOf(find(i)), col = C4.CLASS[ci % C4.CLASS.length], isRoot = p[i] === i;
          out += C4.node(pts[i][0], pts[i][1], 'R' + (i + 1), { r: 21, fill: isRoot ? col : '#fff', stroke: col, sw: 3, textFill: isRoot ? '#fff' : C.ink, mono: true });
        });
        S.set('viz', C4.svg(600, 250, out, '并查集森林') + '<p class="c4-note">箭头指向父节点，实心节点是类的代表元（根）。' + (logs.length ? '<br>最近一步：<b>' + esc(logs[logs.length - 1]) + '</b>' : '') + '</p>');
        S.set('quot', '<div class="c4-verdicts">' + roots.map(function (r, i) {
          return '<div class="c4-verdict" style="border-top-color:' + C4.CLASS[i % C4.CLASS.length] + '"><b>类 ' + (i + 1) + '（代表 R' + (r + 1) + '）</b><span>' + comp[r].map(function (x) { return esc(UF_REC[x]); }).join('、') + '</span></div>';
        }).join('') + '</div>');
        C4.result('已处理 ' + k + ' / ' + UF_OPS.length + ' 个匹配对', roots.length + ' 个等价类（' + roots.length + ' 个不同的人）', '去重结果 = 商集：每一类只保留一个代表元。');
      } else {
        var eps = S.v.eps, E = this.pairs(S), used = E.slice(0, k);
        var cc = C4.components(PTS.length, used);
        var all = this.pairs(S), adj = function (a, b) { return a === b || Math.abs(PTS[a] - PTS[b]) <= eps + 1e-9; }, cx = null;
        for (var a = 0; a < PTS.length && !cx; a++) for (var b = 0; b < PTS.length && !cx; b++) for (var c = 0; c < PTS.length && !cx; c++)
          if (a !== b && b !== c && a !== c && adj(a, b) && adj(b, c) && !adj(a, c)) cx = [a, b, c];
        S.set('model', '<p class="c4-mono">x ≈ y ⇔ |x − y| ≤ ε = ' + eps + '</p><p class="c4-note">「足够接近」自反、对称，但' + (cx ? '<b>不传递</b>：' + PTS[cx[0]] + '≈' + PTS[cx[1]] + '、' + PTS[cx[1]] + '≈' + PTS[cx[2]] + '，但 |' + PTS[cx[0]] + '−' + PTS[cx[2]] + '| > ε。' : '在当前 ε 下恰好传递。') + '按距离从小到大加边并合并（取传递闭包），得到等价类。</p>');
        var W = 640, X = function (v) { return 40 + (v - 0) / 14 * (W - 80); }, out2 = '<line x1="30" y1="120" x2="' + (W - 20) + '" y2="120" stroke="#C9A99A" stroke-width="2"/>';
        for (var t = 0; t <= 14; t += 2) out2 += C4.text(X(t), 145, String(t), { mono: true });
        all.forEach(function (e, i) {
          var on = i < k, x1 = X(PTS[e[0]]), x2 = X(PTS[e[1]]);
          out2 += '<path d="M' + x1 + ',112 Q' + ((x1 + x2) / 2) + ',' + (112 - 26 - (x2 - x1) * 0.18) + ' ' + x2 + ',112" fill="none" stroke="' + (on ? C.red : '#D9C4B8') + '" stroke-width="' + (on ? 2.6 : 1.5) + '"' + (on ? '' : ' stroke-dasharray="4 4"') + '/>';
        });
        PTS.forEach(function (v, i) { var col = C4.CLASS[cc.of[i] % C4.CLASS.length]; out2 += C4.node(X(v), 120, 'p' + (i + 1), { r: 14, fill: col, stroke: col, textFill: '#fff', size: 11, mono: true }); });
        S.set('viz', '<div class="c4-svg-wrap">' + C4.svg(W, 165, out2, '一维数据点聚类') + '</div>' + '<p class="c4-note">实线：已加入的相似对；虚线：待加入。颜色相同 = 同一等价类。</p>');
        S.set('quot', '<div class="c4-verdicts">' + cc.classes.map(function (cl, i) {
          return '<div class="c4-verdict" style="border-top-color:' + C4.CLASS[i % C4.CLASS.length] + '"><b>簇 ' + (i + 1) + '</b><span class="c4-mono">{' + cl.map(function (x) { return PTS[x]; }).join(', ') + '}</span></div>';
        }).join('') + '</div><p class="c4-note" style="margin-top:8px">ε 调大时，远处的点也可能被「链」进同一簇——相似不传递，闭包却强行传递。</p>');
        C4.result('已加入 ' + k + ' / ' + all.length + ' 条相似边', cc.classes.length + ' 个簇（等价类）', cx ? '原始相似关系是相容关系，不是等价关系。' : '当前 ε 下相似关系恰为等价关系。');
      }
    }
  });
})();
/* @@END */

/* ---------- 4.2 偏序关系 ---------- */
(function () {
  var C = C4.COL, esc = C4.esc;
  function divisors(n) { var d = []; for (var i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; }
  function subsets(base) {
    var r = [];
    for (var m = 0; m < (1 << base.length); m++) r.push(base.filter(function (_, i) { return m & (1 << i); }));
    return r.sort(function (a, b) { return a.length - b.length || a.join('').localeCompare(b.join('')); });
  }
  var setLabel = function (s) { return s.length ? '{' + s.join(',') + '}' : '∅'; };
  var POS = {
    d12: { name: '⟨D₁₂, |⟩：12 的正因子，整除', els: divisors(12), leq: function (a, b) { return b % a === 0; }, lab: String, rel: 'a | b' },
    d24: { name: '⟨D₂₄, |⟩：24 的正因子，整除', els: divisors(24), leq: function (a, b) { return b % a === 0; }, lab: String, rel: 'a | b' },
    p3: { name: '⟨P({a,b,c}), ⊆⟩：幂集，包含', els: subsets(['a', 'b', 'c']), leq: function (a, b) { return a.every(function (x) { return b.indexOf(x) >= 0; }); }, lab: setLabel, rel: 'A ⊆ B' },
    n5: { name: '非格示例：{a, b, c, d, e}', els: ['a', 'b', 'c', 'd', 'e'],
      leq: function (x, y) { if (x === y) return true; var up = { a: ['c', 'd', 'e'], b: ['c', 'd', 'e'], c: ['e'], d: ['e'], e: [] }; return up[x].indexOf(y) >= 0; }, lab: String, rel: 'x ≼ y' }
  };

  function drawPoset(p, H, opt) {
    opt = opt || {};
    var els = p.els, n = els.length, pos = H.pos, out = '', r = opt.r || 20, step = opt.step == null ? 3 : opt.step;
    var coverSet = {}; H.covers.forEach(function (e) { coverSet[e[0] + '-' + e[1]] = 1; });
    if (step < 3) {
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) if (i !== j && p.leq(els[i], els[j])) {
        var isCover = coverSet[i + '-' + j];
        if (step >= 2 && !isCover) continue;
        var bend = isCover ? 0 : 26;
        var q = C4.trim(pos[i][0], pos[i][1], pos[j][0], pos[j][1], r + 2, r + 5);
        out += C4.curve(q[0], q[1], q[2], q[3], bend, { color: isCover ? C.red : (step === 1 ? '#D9A08F' : '#C9A99A'), width: isCover ? 2.2 : 1.4, arrow: isCover ? 'c4arr' : 'c4arrMuted', opacity: isCover ? 1 : 0.8, dash: !isCover && step === 1 ? '5 4' : null });
      }
      if (step === 0) for (i = 0; i < n; i++) out += '<circle cx="' + pos[i][0] + '" cy="' + (pos[i][1] - r - 9) + '" r="9" fill="none" stroke="#C9A99A" stroke-width="1.5"/>';
    } else {
      H.covers.forEach(function (e) {
        var hot = opt.hlEdge && opt.hlEdge(e);
        out += C4.line(pos[e[0]][0], pos[e[0]][1], pos[e[1]][0], pos[e[1]][1], { color: hot ? C.red : '#C98F7C', width: hot ? 3.2 : 2.2 });
      });
    }
    els.forEach(function (x, i) {
      var st = opt.nodeStyle ? opt.nodeStyle(i) : {};
      out += C4.node(pos[i][0], pos[i][1], p.lab(x), { r: r, fill: st.fill || '#fff', stroke: st.stroke || C.red, textFill: st.textFill, ring: st.ring, act: opt.act, arg: i, size: p.lab(x).length > 4 ? 10 : 13, mono: true, title: opt.act ? '点击选择 ' + p.lab(x) : '' });
    });
    return out;
  }

  var STEP_TXT = [
    '第 0 步 · 完整关系图：每个元素都有自环（自反），x≼y 就画一条 x→y 的有向边。',
    '第 1 步 · 去掉自环：自反性对每个元素都成立，省略不画。',
    '第 2 步 · 去掉可由传递性推出的边：只保留「覆盖」——y 盖住 x 当且仅当 x≺y 且中间没有别的元素（虚线边被删除）。',
    '第 3 步 · 去掉箭头：约定「小的在下、大的在上」，得到哈斯图。'
  ];

  C4.def('hasse/basic', {
    badge: '关系图 → 哈斯图',
    mission: '用三步把一个偏序的关系图化简成哈斯图；再点选任意两个元素，判断它们<b>可比</b>还是<b>不可比</b>——偏序允许「部分可比」。',
    controls: [
      { type: 'select', id: 'ps', label: '选择偏序集', value: 'd12', options: [['d12', 'D₁₂ 上的整除关系'], ['d24', 'D₂₄ 上的整除关系'], ['p3', '幂集 P({a,b,c}) 上的 ⊆']] },
      { label: '化简步骤', type: 'stepper' },
      { label: '可比性', items: [{ type: 'buttons', items: [{ act: 'clearSel', text: '清除选择' }] }] }
    ],
    stages: [
      { id: 'def', title: '偏序集与三条性质' },
      { id: 'draw', title: '从关系图到哈斯图', hint: '按「下一步」逐步化简' },
      { id: 'cmp', title: '可比与不可比', hint: '在上图点选两个元素' }
    ],
    points: [
      '<b>偏序</b>：自反、反对称、传递的关系，记作 ≼；⟨A, ≼⟩ 称为偏序集。',
      'x 与 y <b>可比</b>：x≼y 或 y≼x；否则不可比。偏序中允许存在不可比元素。',
      '<b>覆盖</b>：x≺y 且不存在 z 使 x≺z≺y，称 y 覆盖 x。',
      '<b>哈斯图</b>只画覆盖关系：省略自环、省略传递边、省略箭头（大者在上）。'
    ],
    init: function (S) { S.data.sel = []; },
    onChange: function (S) { S.data.sel = []; },
    prepare: function (S) { S.total = 3; },
    act: function (S, act, arg) {
      if (act === 'clearSel') { S.data.sel = []; return; }
      if (act === 'pick') {
        var i = +arg, sel = S.data.sel, k = sel.indexOf(i);
        if (k >= 0) sel.splice(k, 1); else { sel.push(i); if (sel.length > 2) sel.shift(); }
      }
    },
    render: function (S) {
      var p = POS[S.v.ps], H = C4.hasse(p.els, p.leq, 560, 330), n = p.els.length, sel = S.data.sel;
      var pairs = 0; for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) if (p.leq(p.els[i], p.els[j])) pairs++;
      S.set('def', '<p><b>' + esc(p.name) + '</b>，关系 x ≼ y ⇔ <span class="c4-mono">' + esc(p.rel.replace('a', 'x').replace('b', 'y').replace('A', 'x').replace('B', 'y')) + '</span></p>' +
        '<div class="c4-verdicts"><div class="c4-verdict ok"><b>自反 ✓</b><span>每个元素 x ≼ x</span></div><div class="c4-verdict ok"><b>反对称 ✓</b><span>x≼y 且 y≼x ⇒ x = y</span></div><div class="c4-verdict ok"><b>传递 ✓</b><span>x≼y 且 y≼z ⇒ x≼z</span></div>' +
        '<div class="c4-verdict gold"><b>|≼| = ' + pairs + ' 个有序对</b><span>哈斯图只需 ' + H.covers.length + ' 条覆盖边</span></div></div>');
      var svg = drawPoset(p, H, {
        step: S.step, act: 'pick',
        nodeStyle: function (i) { return sel.indexOf(i) >= 0 ? { fill: C.red, textFill: '#fff', ring: C.gold } : {}; }
      });
      S.set('draw', C4.svg(560, 360, svg, '偏序关系图') + '<p class="c4-note">' + STEP_TXT[S.step] + '</p>');
      var msg = '先在上图点选两个元素。';
      if (sel.length === 2) {
        var a = p.els[sel[0]], b = p.els[sel[1]], la = p.lab(a), lb = p.lab(b);
        var ab = p.leq(a, b), ba = p.leq(b, a);
        msg = ab || ba ? '<span class="c4-chip ok">可比</span> ' + esc(ab ? la + ' ≼ ' + lb : lb + ' ≼ ' + la) + '：在哈斯图中可沿线段一路向上从 ' + esc(ab ? la : lb) + ' 走到 ' + esc(ab ? lb : la) + '。'
          : '<span class="c4-chip bad">不可比</span> ' + esc(la) + ' 与 ' + esc(lb) + ' 互不 ≼：它们之间没有「一路向上」的路径。';
      } else if (sel.length === 1) msg = '已选 ' + esc(p.lab(p.els[sel[0]])) + '，再选一个。';
      var inc = 0; for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) if (!p.leq(p.els[i], p.els[j]) && !p.leq(p.els[j], p.els[i])) inc++;
      S.set('cmp', '<p>' + msg + '</p><p class="c4-note">本偏序集共有 ' + (n * (n - 1) / 2) + ' 对不同元素，其中 <b>' + inc + '</b> 对不可比——所以它不是全序（线序）。</p>');
      C4.result('第 ' + S.step + ' / 3 步', S.step === 3 ? '哈斯图：' + H.covers.length + ' 条覆盖边' : '关系图化简中', inc + ' 对元素不可比，「部分可比」正是偏序的特点。');
    }
  });

  /* ----- 拓展层：调度·依赖·格 ----- */
  var COURSES = ['高等数学', '程序设计', '离散数学', '线性代数', '数据结构', '算法设计', '操作系统', '机器学习'];
  var PRE = [[0, 3], [1, 4], [2, 4], [2, 5], [4, 5], [4, 6], [3, 7], [5, 7]];
  var reach = (function () {
    var n = COURSES.length, R = [];
    for (var i = 0; i < n; i++) { R.push([]); for (var j = 0; j < n; j++) R[i].push(i === j); }
    PRE.forEach(function (e) { R[e[0]][e[1]] = true; });
    for (var k = 0; k < n; k++) for (i = 0; i < n; i++) for (j = 0; j < n; j++) if (R[i][k] && R[k][j]) R[i][j] = true;
    return R;
  })();
  var COURSE_POS = { els: C4.range(COURSES.length), leq: function (a, b) { return reach[a][b]; }, lab: function (i) { return COURSES[i]; } };
  function kahn() {
    var n = COURSES.length, indeg = new Array(n).fill(0), done = [], rem = C4.range(n), order = [], frontier = [];
    PRE.forEach(function (e) { indeg[e[1]]++; });
    while (rem.length) {
      var avail = rem.filter(function (v) { return indeg[v] === 0; });
      frontier.push(avail.slice());
      var v = avail[0];
      order.push(v); rem = rem.filter(function (x) { return x !== v; });
      PRE.forEach(function (e) { if (e[0] === v) indeg[e[1]]--; });
    }
    return { order: order, frontier: frontier };
  }

  C4.def('hasse/extend', {
    badge: '拓扑排序 · 格',
    mission: '场景一：按先修关系安排 8 门课程，逐步取出<b>极小元</b>完成拓扑排序；场景二：在偏序集中点选两元素求<b>最小上界 / 最大下界</b>，判断它是否为<b>格</b>。',
    controls: [
      { type: 'select', id: 'mode', label: '场景', value: 'topo', options: [['topo', '课程先修 → 拓扑排序'], ['lattice', '偏序集 → 是否为格']] },
      { type: 'select', id: 'ps', label: '偏序集（格判定）', value: 'd12', options: [['d12', 'D₁₂ 上的整除'], ['d24', 'D₂₄ 上的整除'], ['p3', 'P({a,b,c}) 上的 ⊆'], ['n5', '非格示例 {a,b,c,d,e}']], show: function (v) { return v.mode === 'lattice'; } },
      { label: '逐步拓扑排序', type: 'stepper', show: function (v) { return v.mode === 'topo'; } },
      { label: '操作', items: [{ type: 'buttons', items: [{ act: 'clearSel', text: '清除选择' }, { act: '__reset', text: '↺ 重置', cls: 'ghost' }] }], show: function (v) { return v.mode === 'lattice'; } }
    ],
    stages: [
      { id: 'model', title: '模型' },
      { id: 'draw', title: '哈斯图' },
      { id: 'out', title: '结果' }
    ],
    points: [
      '<b>拓扑排序</b>：把偏序扩展成一个全序（线性化），每一步取出当前的一个<b>极小元</b>。',
      '有限偏序集一定有极小元，因此拓扑排序总能完成；同层元素两两不可比，可并行安排。',
      '<b>格</b>：任意两元素都有最小上界 a∨b 与最大下界 a∧b 的偏序集。',
      '⟨D<sub>n</sub>, |⟩ 是格：a∨b = lcm(a, b)，a∧b = gcd(a, b)。'
    ],
    init: function (S) { S.data.sel = []; },
    onChange: function (S) { S.data.sel = []; },
    prepare: function (S) { S.total = S.v.mode === 'topo' ? COURSES.length : 0; },
    act: function (S, act, arg) {
      if (act === 'clearSel') { S.data.sel = []; return; }
      if (act === 'pick') { var i = +arg, sel = S.data.sel, k = sel.indexOf(i); if (k >= 0) sel.splice(k, 1); else { sel.push(i); if (sel.length > 2) sel.shift(); } }
    },
    render: function (S) {
      if (S.v.mode === 'topo') return this.topo(S);
      return this.lattice(S);
    },
    topo: function (S) {
      var K = kahn(), k = S.step, done = K.order.slice(0, k), avail = k < COURSES.length ? K.frontier[k] : [];
      var H = C4.hasse(COURSE_POS.els, COURSE_POS.leq, 600, 330, 40);
      var XS = [110, 300, 490, 110, 395, 300, 490, 205]; H.pos = H.pos.map(function (p, i) { return [XS[i], p[1]]; });
      S.set('model', '<p>课程集合 A 上的先修关系「x 必须不晚于 y 修读」是偏序（自反、反对称、传递）。给出的先修对：</p><div class="c4-chips">' +
        PRE.map(function (e) { var red = !H.covers.some(function (c) { return c[0] === e[0] && c[1] === e[1]; }); return '<span class="c4-chip' + (red ? ' gold' : '') + '">' + COURSES[e[0]] + ' → ' + COURSES[e[1]] + (red ? '（可由传递推出）' : '') + '</span>'; }).join('') + '</div>');
      var svg = '';
      H.covers.forEach(function (e) { svg += C4.line(H.pos[e[0]][0], H.pos[e[0]][1], H.pos[e[1]][0], H.pos[e[1]][1], { color: done.indexOf(e[0]) >= 0 ? C.ok : '#C98F7C', width: 2.2, arrow: done.indexOf(e[0]) >= 0 ? 'c4arrOk' : 'c4arrMuted', trim: [20, 23] }); });
      COURSES.forEach(function (c, i) {
        var d = done.indexOf(i) >= 0, av = avail.indexOf(i) >= 0, cur = K.order[k - 1] === i;
        var x = H.pos[i][0], y = H.pos[i][1];
        svg += '<g><rect x="' + (x - 44) + '" y="' + (y - 17) + '" width="88" height="34" rx="10" fill="' + (d ? '#E8F6EE' : av ? '#FFF4D6' : '#fff') + '" stroke="' + (d ? C.ok : av ? C.gold : C.red) + '" stroke-width="' + (cur ? 3.5 : 2) + '"/>' +
          C4.text(x, y + 5, c, { size: 13, weight: 700, fill: C.ink }) + (d ? C4.text(x + 38, y - 20, '#' + (done.indexOf(i) + 1), { size: 11, weight: 700, fill: C.ok, mono: true }) : '') + '</g>';
      });
      S.set('draw', C4.svg(600, 360, svg, '课程先修哈斯图') + C4.legend([{ color: '#E8F6EE', border: C.ok, text: '已排入' }, { color: '#FFF4D6', border: C.gold, text: '当前极小元（可选）' }, { color: '#fff', border: C.red, text: '待排' }]));
      var levels = {}; H.level.forEach(function (l, i) { (levels[l] = levels[l] || []).push(COURSES[i]); });
      S.set('out', '<p><b>拓扑序列：</b></p><div class="c4-flow">' + (done.length ? done.map(function (v, i) { return (i ? '<span class="arrow">→</span>' : '') + '<span class="box ok">' + COURSES[v] + '</span>'; }).join('') : '<span class="c4-note">点「下一步」取出第一个极小元</span>') + '</div>' +
        '<p class="c4-note" style="margin-top:10px"><b>按层并行（最少 ' + Object.keys(levels).length + ' 个学期）：</b>' + Object.keys(levels).map(function (l) { return '第' + (+l + 1) + '学期：' + levels[l].join('、'); }).join('；') + '。同一学期内的课程两两不可比。</p>');
      C4.result('已排 ' + k + ' / ' + COURSES.length + ' 门', k < COURSES.length ? '当前极小元：' + avail.map(function (v) { return COURSES[v]; }).join('、') : '拓扑排序完成', '每一步都从剩余课程中取一个极小元（没有未完成的先修课）。');
    },
    lattice: function (S) {
      var p = POS[S.v.ps], H = C4.hasse(p.els, p.leq, 560, 320), n = p.els.length, sel = S.data.sel;
      var lub = function (i, j) {
        var ub = C4.range(n).filter(function (k) { return p.leq(p.els[i], p.els[k]) && p.leq(p.els[j], p.els[k]); });
        var least = ub.filter(function (k) { return ub.every(function (u) { return p.leq(p.els[k], p.els[u]); }); });
        return { set: ub, v: least.length ? least[0] : null };
      };
      var glb = function (i, j) {
        var lb = C4.range(n).filter(function (k) { return p.leq(p.els[k], p.els[i]) && p.leq(p.els[k], p.els[j]); });
        var great = lb.filter(function (k) { return lb.every(function (u) { return p.leq(p.els[u], p.els[k]); }); });
        return { set: lb, v: great.length ? great[0] : null };
      };
      var bad = null;
      for (var i = 0; i < n && !bad; i++) for (var j = i + 1; j < n && !bad; j++) if (lub(i, j).v == null || glb(i, j).v == null) bad = [i, j];
      var L = sel.length === 2 ? lub(sel[0], sel[1]) : null, G = sel.length === 2 ? glb(sel[0], sel[1]) : null;
      S.set('model', '<p><b>' + esc(p.name) + '</b>。点选两个元素，求它们的上界集、下界集以及最小上界（上确界）、最大下界（下确界）。</p>');
      var svg = drawPoset(p, H, {
        step: 3, act: 'pick',
        nodeStyle: function (k) {
          if (sel.indexOf(k) >= 0) return { fill: C.red, textFill: '#fff', ring: C.gold };
          if (L && L.v === k) return { fill: '#FFF4D6', stroke: C.gold, ring: C.gold };
          if (G && G.v === k) return { fill: '#E8F6EE', stroke: C.ok, ring: C.ok };
          if ((L && L.set.indexOf(k) >= 0) || (G && G.set.indexOf(k) >= 0)) return { fill: '#FDF1EC' };
          return {};
        }
      });
      S.set('draw', C4.svg(560, 350, svg, '偏序集哈斯图') + C4.legend([{ color: C.red, text: '已选元素' }, { color: '#FFF4D6', border: C.gold, text: '最小上界' }, { color: '#E8F6EE', border: C.ok, text: '最大下界' }, { color: '#FDF1EC', border: C.red, text: '其他上 / 下界' }]));
      var lab = function (k) { return esc(p.lab(p.els[k])); };
      var body = '';
      if (L) {
        body += '<div class="c4-verdicts"><div class="c4-verdict ' + (L.v != null ? 'ok' : 'bad') + '"><b>' + lab(sel[0]) + ' ∨ ' + lab(sel[1]) + ' = ' + (L.v != null ? lab(L.v) : '不存在') + '</b><span>上界集 {' + (L.set.map(lab).join(', ') || ' ') + '}' + (L.v == null && L.set.length ? '，其中没有最小者' : '') + '</span></div>' +
          '<div class="c4-verdict ' + (G.v != null ? 'ok' : 'bad') + '"><b>' + lab(sel[0]) + ' ∧ ' + lab(sel[1]) + ' = ' + (G.v != null ? lab(G.v) : '不存在') + '</b><span>下界集 {' + (G.set.map(lab).join(', ') || ' ') + '}' + (G.v == null && G.set.length ? '，其中没有最大者' : '') + '</span></div></div>';
      } else body += '<p class="c4-note">请在哈斯图中点选两个元素。</p>';
      body += '<p style="margin-top:10px">' + (bad ? '<span class="c4-chip bad">不是格</span> 例如 ' + lab(bad[0]) + ' 与 ' + lab(bad[1]) + ' 缺少最小上界或最大下界。' : '<span class="c4-chip ok">是格</span> 任意两元素都有最小上界与最大下界' + (S.v.ps !== 'p3' ? '（即 lcm 与 gcd）' : '（即 ∪ 与 ∩）') + '。') + '</p>';
      S.set('out', body);
      C4.result(L ? lab(sel[0]) + ' 与 ' + lab(sel[1]) : '待选择两个元素', bad ? '不是格' : '是格', bad ? '只要有一对元素缺上确界或下确界，就不是格。' : '格是第 11 章「格与布尔代数」的起点。');
    }
  });
})();
/* @@END */

/* ---------- 4.3 全序、良序和拟序 ---------- */
(function () {
  var C = C4.COL, esc = C4.esc;
  var setLab = function (s) { return s.length ? '{' + s.join(',') + '}' : '∅'; };
  var ORD = {
    le: { name: '⟨{1,2,3,4,5,6}, ≤⟩', rule: 'x ≼ y ⇔ x ≤ y（数的大小）', els: [1, 2, 3, 4, 5, 6], leq: function (a, b) { return a <= b; }, lab: String },
    div: { name: '⟨{1,2,3,4,6,12}, |⟩', rule: 'x ≼ y ⇔ x 整除 y', els: [1, 2, 3, 4, 6, 12], leq: function (a, b) { return b % a === 0; }, lab: String },
    lex: { name: '⟨{a, ab, abc, b, ba}, 字典序⟩', rule: 'x ≼ y ⇔ x 在词典中不排在 y 之后', els: ['a', 'ab', 'abc', 'b', 'ba'], leq: function (a, b) { return a <= b; }, lab: String },
    sub: { name: '⟨P({a,b}), ⊆⟩', rule: 'x ≼ y ⇔ x ⊆ y', els: [[], ['a'], ['b'], ['a', 'b']], leq: function (a, b) { return a.every(function (t) { return b.indexOf(t) >= 0; }); }, lab: setLab }
  };

  C4.def('order/basic', {
    badge: '哈斯图 · 可比矩阵',
    mission: '比较四个偏序集：看哈斯图是不是「一条链」，再看可比矩阵里有没有<b>不可比</b>格子——没有，就是全序（线序），可以唯一地排成一队。',
    cols: 2,
    controls: [
      { type: 'select', id: 'o', label: '选择偏序集', value: 'div', options: [['div', '{1,2,3,4,6,12} 上的整除'], ['le', '{1,…,6} 上的 ≤'], ['lex', '单词上的字典序'], ['sub', 'P({a,b}) 上的 ⊆']] },
      { label: '可比性', items: [{ type: 'buttons', items: [{ act: 'clearSel', text: '清除选择' }] }] }
    ],
    stages: [
      { id: 'def', title: '偏序集', wide: true },
      { id: 'hasse', title: '哈斯图', hint: '点选两个元素' },
      { id: 'mat', title: '可比矩阵', hint: '∥ 表示不可比' },
      { id: 'out', title: '结论', wide: true }
    ],
    points: [
      '<b>全序（线序）</b>：偏序 + 任意两元素可比，即 ∀x,y (x≼y ∨ y≼x)。',
      '全序的哈斯图是一条<b>链</b>；有分叉就说明存在不可比元素。',
      '≤、字典序是全序；整除、⊆ 一般只是偏序。',
      '有限全序集可以唯一地排成 x₁ ≺ x₂ ≺ … ≺ xₙ，这就是「排队排名」的数学本质。'
    ],
    init: function (S) { S.data.sel = []; },
    onChange: function (S) { S.data.sel = []; },
    act: function (S, act, arg) {
      if (act === 'clearSel') S.data.sel = [];
      if (act === 'pick') { var i = +arg, sel = S.data.sel, k = sel.indexOf(i); if (k >= 0) sel.splice(k, 1); else { sel.push(i); if (sel.length > 2) sel.shift(); } }
    },
    render: function (S) {
      var p = ORD[S.v.o], els = p.els, n = els.length, sel = S.data.sel, H = C4.hasse(els, p.leq, 360, 330, 36);
      var inc = [];
      for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) if (!p.leq(els[i], els[j]) && !p.leq(els[j], els[i])) inc.push([i, j]);
      var total = inc.length === 0;
      S.set('def', '<p><b>' + esc(p.name) + '</b>：' + esc(p.rule) + '。它自反、反对称、传递，是偏序。</p>');
      var svg = '';
      H.covers.forEach(function (e) { svg += C4.line(H.pos[e[0]][0], H.pos[e[0]][1], H.pos[e[1]][0], H.pos[e[1]][1], { color: '#C98F7C', width: 2.4 }); });
      els.forEach(function (x, k) {
        var on = sel.indexOf(k) >= 0;
        svg += C4.node(H.pos[k][0], H.pos[k][1], p.lab(x), { r: 20, fill: on ? C.red : '#fff', textFill: on ? '#fff' : C.ink, ring: on ? C.gold : null, act: 'pick', arg: k, mono: true, size: p.lab(x).length > 3 ? 11 : 13, title: '点击选择 ' + p.lab(x) });
      });
      S.set('hasse', C4.svg(360, 360, svg, '哈斯图'));
      var t = '<div class="c4-table-wrap"><table class="c4-table"><tr><th></th>' + els.map(function (x) { return '<th>' + esc(p.lab(x)) + '</th>'; }).join('') + '</tr>';
      for (i = 0; i < n; i++) {
        t += '<tr><th>' + esc(p.lab(els[i])) + '</th>';
        for (j = 0; j < n; j++) {
          var a = p.leq(els[i], els[j]), b = p.leq(els[j], els[i]), sym = i === j ? '=' : a ? '≼' : b ? '≽' : '∥';
          var cur = sel.length === 2 && ((sel[0] === i && sel[1] === j) || (sel[1] === i && sel[0] === j));
          t += '<td class="mono ' + (sym === '∥' ? 'bad' : i === j ? 'soft' : 'ok') + (cur ? ' cur' : '') + '">' + sym + '</td>';
        }
        t += '</tr>';
      }
      S.set('mat', t + '</table></div>');
      var pick = '';
      if (sel.length === 2) {
        var x = els[sel[0]], y = els[sel[1]], lx = esc(p.lab(x)), ly = esc(p.lab(y));
        pick = p.leq(x, y) || p.leq(y, x) ? '<p><span class="c4-chip ok">可比</span> ' + (p.leq(x, y) ? lx + ' ≼ ' + ly : ly + ' ≼ ' + lx) + '</p>' : '<p><span class="c4-chip bad">不可比</span> ' + lx + ' 与 ' + ly + ' 谁也不 ≼ 谁。</p>';
      }
      var line = total ? els.slice().sort(function (a, b) { return p.leq(a, b) ? -1 : 1; }).map(function (x) { return '<span class="box ok">' + esc(p.lab(x)) + '</span>'; }).join('<span class="arrow">≺</span>') : '';
      S.set('out', pick + (total
        ? '<p><span class="c4-chip ok">全序</span> 任意两元素可比，哈斯图是一条链，唯一的排队方式：</p><div class="c4-flow">' + line + '</div>'
        : '<p><span class="c4-chip bad">不是全序</span> 共有 ' + inc.length + ' 对不可比，例如 ' + inc.slice(0, 3).map(function (q) { return esc(p.lab(els[q[0]])) + ' ∥ ' + esc(p.lab(els[q[1]])); }).join('，') + '。哈斯图出现了分叉。</p>'));
      C4.result(esc(p.name), total ? '全序（线序）' : '偏序，但不是全序', total ? '哈斯图是一条链。' : inc.length + ' 对元素不可比。');
    }
  });

  /* ----- 拓展层：排序与归纳 ----- */
  var LISTS = {
    num: { name: '整数，按 ≤', items: [5, 2, 9, 1, 7, 3], key: function (x) { return x; }, cmp: function (a, b) { return a - b; }, lab: String },
    lex: { name: '拼音串，按字典序', items: ['shu', 'li', 'san', 'lisan', 'ai', 'shuxue'], cmp: function (a, b) { return a < b ? -1 : a > b ? 1 : 0; }, lab: String },
    pair: { name: '成绩单，按（总分降序，学号升序）', items: [[88, 3], [95, 1], [88, 1], [72, 2], [95, 4], [88, 2]],
      cmp: function (a, b) { return b[0] - a[0] || a[1] - b[1]; }, lab: function (r) { return r[0] + '分·' + r[1] + '号'; } }
  };
  function insertionTrace(L) {
    var a = L.items.slice(), tr = [{ a: a.slice(), i: -1, j: -1, sorted: 1, msg: '初始：第 1 个元素自成有序段。' }];
    for (var i = 1; i < a.length; i++) {
      var j = i;
      tr.push({ a: a.slice(), i: i, j: j, sorted: i, msg: '取出 ' + L.lab(a[i]) + '，准备插入前面的有序段。' });
      while (j > 0 && L.cmp(a[j - 1], a[j]) > 0) {
        var t = a[j - 1]; a[j - 1] = a[j]; a[j] = t;
        tr.push({ a: a.slice(), i: i, j: j - 1, sorted: i, msg: '比较：' + L.lab(a[j]) + ' ≻ ' + L.lab(a[j - 1]) + '，交换。' });
        j--;
      }
      tr.push({ a: a.slice(), i: i, j: j, sorted: i + 1, msg: j > 0 ? '比较：' + L.lab(a[j - 1]) + ' ≼ ' + L.lab(a[j]) + '，停在这里。' : '已到最前面。' });
    }
    tr.push({ a: a.slice(), i: -1, j: -1, sorted: a.length, msg: '排序完成：任意两元素都可比较，结果唯一。' });
    return tr;
  }
  function gcdTrace(a, b) {
    var tr = [[a, b]];
    while (b !== 0) { var r = a % b; a = b; b = r; tr.push([a, b]); }
    return tr;
  }

  C4.def('order/extend', {
    badge: '插入排序 · 递降终止',
    mission: '场景一：比较排序只依赖一个<b>全序</b>——并列的分数要用学号打破平局，才能排出唯一结果；场景二：辗转相除的余数在 ℕ 中严格递减，<b>良序</b>保证它必然停下。',
    controls: [
      { type: 'select', id: 'mode', label: '场景', value: 'sort', options: [['sort', '插入排序（全序）'], ['gcd', '辗转相除必终止（良序）']] },
      { type: 'select', id: 'L', label: '待排序数据', value: 'pair', options: [['pair', '成绩单：总分降序、同分学号升序'], ['num', '整数：按 ≤'], ['lex', '拼音串：字典序']], show: function (v) { return v.mode === 'sort'; } },
      { label: '参数', items: [
        { type: 'range', id: 'a', text: '被除数 a', min: 20, max: 300, value: 252, show: function (v) { return v.mode === 'gcd'; } },
        { type: 'range', id: 'b', text: '除数 b', min: 2, max: 200, value: 105, show: function (v) { return v.mode === 'gcd'; } }
      ] },
      { label: '逐步演示', type: 'stepper' }
    ],
    stages: [
      { id: 'model', title: '模型' },
      { id: 'viz', title: '过程' },
      { id: 'why', title: '为什么一定成功' }
    ],
    points: [
      '比较排序需要一个<b>全序</b>：任意两元素可比，结果才唯一；并列时用字典序（总分, 学号）补全。',
      '<b>良序原理</b>：ℕ 的任意非空子集都有最小元 ⇒ ℕ 中不存在无限严格递降链。',
      '辗转相除 gcd(a, b) 的余数 b > r₁ > r₂ > … ≥ 0，良序保证有限步终止。',
      '良序原理与<b>数学归纳法</b>等价：若有反例，则取最小反例导出矛盾。'
    ],
    prepare: function (S) {
      if (S.v.mode === 'sort') { S.data.tr = insertionTrace(LISTS[S.v.L]); S.total = S.data.tr.length - 1; }
      else { S.data.g = gcdTrace(S.v.a, S.v.b); S.total = S.data.g.length - 1; }
    },
    render: function (S) {
      if (S.v.mode === 'sort') {
        var L = LISTS[S.v.L], st = S.data.tr[S.step];
        S.set('model', '<p><b>' + esc(L.name) + '</b></p><p class="c4-note">' + (S.v.L === 'pair'
          ? '只按总分比较时，88 分的三人彼此「并列」——关系不反对称，不是全序，排序结果不唯一；加上「同分按学号升序」后成为字典序，是全序。'
          : '这个比较关系是全序，任意两项都能比较。') + '</p>');
        var cells = st.a.map(function (x, k) {
          var cls = k === st.j ? 'gold' : k < st.sorted ? 'ok' : '';
          return '<span class="' + cls + '" style="min-width:64px">' + esc(L.lab(x)) + '</span>';
        }).join('');
        S.set('viz', '<div class="c4-seq">' + cells + '</div><p class="c4-note" style="margin-top:10px">第 ' + S.step + ' 步：' + esc(st.msg) + '</p>' +
          C4.legend([{ color: 'rgba(31,157,85,.15)', border: C.ok, text: '已有序段' }, { color: 'rgba(255,180,0,.3)', border: C.gold, text: '正在插入的元素' }]));
        S.set('why', '<p>插入排序每次把新元素与有序段比较，只用到 ≼ 的<b>可比性</b>与<b>传递性</b>：可比保证每次比较都有答案，传递保证插入后整段仍有序。</p>');
        C4.result('插入排序 · ' + esc(L.name), S.step === S.total ? '排序完成' : '进行中 ' + S.step + ' / ' + S.total, esc(st.msg));
      } else {
        var g = S.data.g, k = S.step, cur = g[k], mx = Math.max(S.v.a, S.v.b);
        S.set('model', '<p class="c4-mono">gcd(a, b) = gcd(b, a mod b)，直到 b = 0</p><p class="c4-note">每一步的新除数是余数 r = a mod b，满足 0 ≤ r < b。</p>');
        var bars = g.slice(0, k + 1).map(function (p, i) {
          return '<div class="bar-row" style="display:grid;grid-template-columns:90px 1fr 56px;gap:8px;align-items:center;margin:4px 0"><span class="c4-mono" style="font-size:.85rem">(' + p[0] + ', ' + p[1] + ')</span>' +
            '<div style="height:18px;border-radius:9px;background:rgba(116,55,31,.08);overflow:hidden"><i style="display:block;height:100%;width:' + Math.max(1, p[1] / mx * 100) + '%;background:linear-gradient(90deg,#D63B1D,#FFB400)"></i></div><b class="c4-mono" style="color:' + (i === k ? '#D63B1D' : '#6B4A38') + '">b=' + p[1] + '</b></div>';
        }).join('');
        S.set('viz', bars + (cur[1] === 0 ? '<p style="margin-top:8px"><span class="c4-chip ok">终止</span> gcd(' + S.v.a + ', ' + S.v.b + ') = <b>' + cur[0] + '</b>，共 ' + (g.length - 1) + ' 步。</p>' : ''));
        S.set('why', '<p>除数序列 ' + g.slice(0, k + 1).map(function (p) { return p[1]; }).join(' > ') + (cur[1] ? ' > …' : '') + ' 是 ℕ 中的<b>严格递降链</b>。</p><p class="c4-note">若它永不终止，集合 {b₀, b₁, b₂, …} 就没有最小元，与 ⟨ℕ, ≤⟩ 是良序矛盾。反观 ⟨ℤ, ≤⟩ 或 ⟨ℚ⁺, ≤⟩，都存在无限递降链（如 1, 1/2, 1/3, …），它们不是良序。</p>');
        C4.result('gcd(' + S.v.a + ', ' + S.v.b + ')', cur[1] === 0 ? '= ' + cur[0] + '（' + (g.length - 1) + ' 步终止）' : '当前 (' + cur[0] + ', ' + cur[1] + ')', '余数严格递减且非负，良序保证必然终止。');
      }
    }
  });
})();
/* @@END */

/* ---------- 4.4 函数基本概念 ---------- */
(function () {
  var C = C4.COL, esc = C4.esc;
  var A = ['a', 'b', 'c', 'd'], B = ['1', '2', '3'];
  var PRE = {
    func: [[0, 0], [1, 1], [2, 1], [3, 2]],
    multi: [[0, 0], [0, 1], [1, 1], [2, 2], [3, 2]],
    missing: [[0, 0], [1, 2], [2, 1]],
    const1: [[0, 1], [1, 1], [2, 1], [3, 1]]
  };
  function analyse(R) {
    var out = A.map(function (_, i) { return R.filter(function (p) { return p[0] === i; }).map(function (p) { return p[1]; }); });
    var single = out.every(function (o) { return o.length <= 1; }), total = out.every(function (o) { return o.length >= 1; });
    return { out: out, single: single, total: total };
  }

  C4.def('functions/basic', {
    badge: '关系矩阵 · 箭头图',
    mission: '函数是一种特殊的关系：A 中<b>每个</b>元素恰好射出<b>一支</b>箭头。点关系矩阵的格子增删有序对，看「单值」「全定义」两个条件何时同时满足。',
    cols: 2,
    controls: [
      { type: 'select', id: 'pre', label: '示例关系', value: 'func', options: [['func', '示例 1：是函数（多对一）'], ['multi', '示例 2：a 对应两个值'], ['missing', '示例 3：d 没有像'], ['const1', '示例 4：常函数']] },
      { label: '编辑', items: [{ type: 'buttons', items: [{ act: 'clear', text: '清空关系' }, { act: 'fix', text: '修正为函数', cls: 'primary' }] }] }
    ],
    stages: [
      { id: 'mat', title: '关系矩阵', hint: '点格子增删有序对' },
      { id: 'map', title: '箭头图', hint: 'A → B' },
      { id: 'pairs', title: '关系 R ⊆ A × B', wide: true },
      { id: 'judge', title: '判定', wide: true }
    ],
    points: [
      'f ⊆ A×B 是从 A 到 B 的<b>函数</b>，当且仅当：<b>全定义</b>（每个 x∈A 都有像）且<b>单值</b>（像唯一）。',
      '在关系矩阵中：函数的<b>每一行恰有一个 1</b>。',
      '<b>多对一允许，一对多禁止</b>：不同的 x 可以有相同的像。',
      '从 A 到 B 的函数共有 |B|<sup>|A|</sup> 个，记作 B<sup>A</sup>；本例为 3⁴ = 81 个。'
    ],
    init: function (S) { S.data.R = PRE[S.v.pre].map(function (p) { return p.slice(); }); },
    onChange: function (S) { this.init(S); },
    act: function (S, act, arg) {
      var R = S.data.R;
      if (act === 'cell') {
        var ij = arg.split(','), i = +ij[0], j = +ij[1], k = R.findIndex(function (p) { return p[0] === i && p[1] === j; });
        if (k >= 0) R.splice(k, 1); else R.push([i, j]);
      } else if (act === 'clear') S.data.R = [];
      else if (act === 'fix') {
        var an = analyse(R), fixed = [];
        an.out.forEach(function (o, i) { fixed.push([i, o.length ? o[0] : 0]); });
        S.data.R = fixed;
        C4.toast('已保留每行第一个像、为空行补上像：现在每行恰有一个 1。', 'ok');
      }
    },
    render: function (S) {
      var R = S.data.R, an = analyse(R);
      var t = '<div class="c4-table-wrap"><table class="c4-table"><tr><th>R</th>' + B.map(function (b) { return '<th>' + b + '</th>'; }).join('') + '<th>行和</th></tr>';
      A.forEach(function (a, i) {
        var n = an.out[i].length;
        t += '<tr><th>' + a + '</th>' + B.map(function (b, j) {
          var on = an.out[i].indexOf(j) >= 0;
          return '<td class="' + (on ? (n > 1 ? 'bad' : 'hit') : '') + '"><button type="button" class="cell" data-act="cell" data-arg="' + i + ',' + j + '" aria-label="切换 &lt;' + a + ',' + b + '&gt;">' + (on ? 1 : 0) + '</button></td>';
        }).join('') + '<td class="mono ' + (n === 1 ? 'ok' : 'bad') + '">' + n + '</td></tr>';
      });
      S.set('mat', t + '</table></div><p class="c4-note" style="margin-top:8px">行和 = 1 才合格：行和 0 违反全定义，行和 ≥ 2 违反单值。</p>');
      var pairs = [], aState = [];
      an.out.forEach(function (o, i) {
        aState[i] = o.length === 0 ? 'gold' : o.length > 1 ? 'bad' : '';
        o.forEach(function (j) { pairs.push([i, j, o.length > 1 ? C.bad : C.red]); });
      });
      S.set('map', C4.mapSvg(A, B, pairs, { aState: aState, w: 420, xa: 100, gap: 54, aName: 'A', bName: 'B' }) +
        C4.legend([{ color: C.red, text: '合格' }, { color: '#FDECEA', border: C.bad, text: '一对多（虚线箭头，违反单值）' }, { color: '#FFF4D6', border: C.gold, text: '无像（违反全定义）' }]));
      S.set('pairs', '<p class="c4-mono">R = {' + R.slice().sort(function (p, q) { return p[0] - q[0] || p[1] - q[1]; }).map(function (p) { return '&lt;' + A[p[0]] + ',' + B[p[1]] + '&gt;'; }).join(', ') + '}</p><p class="c4-note">|A × B| = 12，R 是它的一个子集——任何子集都是关系，但只有少数是函数。</p>');
      var isF = an.single && an.total;
      var badS = A.filter(function (_, i) { return an.out[i].length > 1; }), badT = A.filter(function (_, i) { return an.out[i].length === 0; });
      S.set('judge', '<div class="c4-verdicts">' +
        '<div class="c4-verdict ' + (an.total ? 'ok' : 'bad') + '"><b>全定义 ' + (an.total ? '✓' : '✗') + '</b><span>' + (an.total ? '每个元素都有像' : badT.join('、') + ' 没有像') + '</span></div>' +
        '<div class="c4-verdict ' + (an.single ? 'ok' : 'bad') + '"><b>单值 ' + (an.single ? '✓' : '✗') + '</b><span>' + (an.single ? '每个元素至多一个像' : badS.join('、') + ' 有多个像') + '</span></div>' +
        '<div class="c4-verdict ' + (isF ? 'ok' : 'bad') + '"><b>' + (isF ? 'R 是函数 f: A→B' : 'R 不是函数') + '</b><span>' + (isF ? A.map(function (a, i) { return 'f(' + a + ')=' + B[an.out[i][0]]; }).join('，') : '两个条件缺一不可') + '</span></div></div>');
      C4.result('单值 ' + (an.single ? '✓' : '✗') + ' · 全定义 ' + (an.total ? '✓' : '✗'), isF ? '是函数' : '不是函数', isF ? '值域 ran f = {' + B.filter(function (_, j) { return an.out.some(function (o) { return o[0] === j; }); }).join(', ') + '}' : '点「修正为函数」看看怎样最少改动。');
    }
  });

  /* ----- 拓展层：纯函数与映射表 ----- */
  var KEYS = ['zhang', 'wang', 'li', 'zhao', 'chen', 'liu', 'yang', 'huang'];
  var hsum = function (k) { var s = 0; for (var i = 0; i < k.length; i++) s += k.charCodeAt(i); return s; };

  C4.def('functions/extend', {
    badge: '哈希函数 · 纯函数',
    mission: '场景一：哈希函数 h(k) = (各字符编码之和) mod m 把键映射到桶——它是函数，但通常<b>不是单射</b>（会冲突）。场景二：反复调用两段程序，辨别谁才是数学意义上的函数。',
    controls: [
      { type: 'select', id: 'mode', label: '场景', value: 'hash', options: [['hash', '哈希表：键 → 桶'], ['pure', '纯函数 vs 有副作用的「函数」']] },
      { type: 'range', id: 'm', label: '桶数 m', text: '桶数 m', min: 3, max: 11, value: 5, show: function (v) { return v.mode === 'hash'; } },
      { label: '调用程序', items: [{ type: 'buttons', items: [{ act: 'callF', text: '调用 f(3)', cls: 'primary' }, { act: 'callG', text: '调用 g(3)' }] }], show: function (v) { return v.mode === 'pure'; } }
    ],
    stages: [
      { id: 'model', title: '模型' },
      { id: 'viz', title: '映射' },
      { id: 'out', title: '结论' }
    ],
    points: [
      '哈希函数 h: 键集 → {0, …, m−1} 是<b>函数</b>：同一个键永远落在同一个桶。',
      '键多于桶（|K| > m）时由鸽巢原理必然<b>冲突</b>，h 不是单射；但冲突不影响它是函数。',
      '<b>纯函数</b>：输出只由输入决定、无副作用——正是数学函数。',
      '依赖外部状态的程序，对同一输入可能给出不同输出，把它看成 x 的「函数」就违反了单值性；它其实是 (x, 状态) 的函数。'
    ],
    init: function (S) { S.data.log = []; S.data.counter = 0; },
    onChange: function (S) { this.init(S); },
    act: function (S, act) {
      if (act === 'callF') S.data.log.push(['f', 3, 3 * 3 + 1]);
      if (act === 'callG') { S.data.counter++; S.data.log.push(['g', 3, 3 + S.data.counter]); }
      if (S.data.log.length > 8) S.data.log.shift();
    },
    render: function (S) {
      if (S.v.mode === 'hash') {
        var m = S.v.m, hv = KEYS.map(function (k) { return hsum(k) % m; });
        S.set('model', '<p class="c4-mono">h(k) = (Σ 字符编码) mod ' + m + '</p><p class="c4-note">例：h("li") = (108 + 105) mod ' + m + ' = ' + (213 % m) + '。</p>');
        var pairs = KEYS.map(function (k, i) { var clash = hv.filter(function (x) { return x === hv[i]; }).length > 1; return [i, hv[i], clash ? C.bad : C.red]; });
        var bState = C4.range(m).map(function (j) { var c = hv.filter(function (x) { return x === j; }).length; return c > 1 ? 'bad' : c === 0 ? 'dim' : ''; });
        S.set('viz', '<div class="c4-svg-wrap">' + C4.mapSvg(KEYS, C4.range(m).map(String), pairs, { bState: bState, w: 560, xa: 130, gap: 40, r: 17, pill: true, aName: '键 K', bName: '桶 0…' + (m - 1) }) + '</div>' +
          C4.legend([{ color: C.red, line: true, text: '无冲突' }, { color: C.bad, line: true, text: '冲突（虚线：多个键进同一桶）' }, { color: '#F4EEE9', border: '#C9B8AD', text: '空桶（不在值域中）' }]));
        var used = {}; hv.forEach(function (x) { used[x] = (used[x] || 0) + 1; });
        var coll = Object.keys(used).filter(function (k) { return used[k] > 1; });
        var inj = coll.length === 0, sur = Object.keys(used).length === m;
        S.set('out', '<div class="c4-verdicts"><div class="c4-verdict ok"><b>是函数 ✓</b><span>每个键恰好一个桶</span></div>' +
          '<div class="c4-verdict ' + (inj ? 'ok' : 'bad') + '"><b>单射 ' + (inj ? '✓' : '✗') + '</b><span>' + (inj ? '无冲突' : '冲突桶：' + coll.join('、')) + '</span></div>' +
          '<div class="c4-verdict ' + (sur ? 'ok' : 'gold') + '"><b>值域 ' + Object.keys(used).length + ' / ' + m + ' 个桶</b><span>' + (sur ? '满射：每个桶都被用到' : '有空桶，值域 ⊊ 陪域') + '</span></div></div>' +
          '<p class="c4-note" style="margin-top:8px">' + (KEYS.length > m ? '8 个键放进 ' + m + ' 个桶，由鸽巢原理一定有冲突。' : '即使桶够多，简单哈希也可能冲突，工程上用链地址法或开放寻址解决。') + '</p>');
        C4.result('h: K → Z<sub>' + m + '</sub>', inj ? '函数，且无冲突' : '函数，但有 ' + coll.length + ' 个冲突桶', '冲突说明 h 不是单射，查表时需在桶内再比较键。');
      } else {
        var log = S.data.log;
        S.set('model', '<p class="c4-mono">f(x) = x² + 1</p><p class="c4-mono">g(x) = x + counter；counter = counter + 1（每次调用都修改全局变量）</p>');
        S.set('viz', log.length ? '<div class="c4-table-wrap"><table class="c4-table"><tr><th>#</th><th>调用</th><th>输出</th></tr>' + log.map(function (r, i) {
          return '<tr><td class="mono">' + (i + 1) + '</td><td class="mono">' + r[0] + '(' + r[1] + ')</td><td class="mono ' + (r[0] === 'g' ? 'soft' : 'ok') + '">' + r[2] + '</td></tr>';
        }).join('') + '</table></div>' : '<p class="c4-note">点左侧按钮多次调用 f(3) 与 g(3)，比较输出。</p>');
        var gOut = log.filter(function (r) { return r[0] === 'g'; }).map(function (r) { return r[2]; });
        var gDiff = gOut.filter(function (v, i, a) { return a.indexOf(v) === i; }).length > 1;
        S.set('out', '<div class="c4-verdicts"><div class="c4-verdict ok"><b>f 是纯函数 ✓</b><span>f(3) 永远等于 10</span></div>' +
          '<div class="c4-verdict ' + (gDiff ? 'bad' : 'gold') + '"><b>g ' + (gDiff ? '不满足单值 ✗' : '再调用几次看看') + '</b><span>' + (gDiff ? '同一输入 3 得到了 ' + gOut.filter(function (v, i, a) { return a.indexOf(v) === i; }).join('、') : '目前 g(3) 输出：' + (gOut.join('、') || '尚未调用')) + '</span></div></div>');
        C4.result('调用记录 ' + log.length + ' 条', gDiff ? 'g 不是 x 的函数' : 'f(3) = 10', '纯函数便于测试、缓存与并行，这正是函数式编程推崇它的原因。');
      }
    }
  });
})();
/* @@END */

/* ---------- 4.5 三种类型函数 ---------- */
(function () {
  var C = C4.COL, esc = C4.esc;
  function judge(f, nB) {
    var cnt = new Array(nB).fill(0);
    f.forEach(function (y) { cnt[y]++; });
    return { cnt: cnt, inj: cnt.every(function (c) { return c <= 1; }), sur: cnt.every(function (c) { return c >= 1; }) };
  }

  C4.def('funcprop/basic', {
    badge: '点节点改像 · 即时判定',
    mission: '点左侧 A 中的元素，把它的箭头依次改指向 B 的下一个元素；观察<b>单射</b>（不同输入不撞车）与<b>满射</b>（每个目标都被覆盖）何时成立。',
    controls: [
      { label: '集合大小', items: [
        { type: 'range', id: 'na', text: '|A|', min: 2, max: 6, value: 4 },
        { type: 'range', id: 'nb', text: '|B|', min: 2, max: 6, value: 4 }
      ] },
      { label: '一键生成', items: [{ type: 'buttons', items: [{ act: 'inj', text: '尽量单射' }, { act: 'sur', text: '尽量满射' }, { act: 'rand', text: '随机函数', cls: 'primary' }] }] }
    ],
    stages: [
      { id: 'map', title: '映射 f : A → B', hint: '点 A 中元素改变它的像' },
      { id: 'judge', title: '判定' },
      { id: 'why', title: '规律：看集合大小' }
    ],
    points: [
      '<b>单射</b>：x₁ ≠ x₂ ⇒ f(x₁) ≠ f(x₂)（不同输入不撞车）。',
      '<b>满射</b>：ran f = B，B 中每个元素都有原像（不漏）。',
      '<b>双射</b>：既单又满，即一一对应。',
      '有限集：单射 ⇒ |A| ≤ |B|；满射 ⇒ |A| ≥ |B|；|A| = |B| 时单射 ⇔ 满射。'
    ],
    init: function (S) { S.data.f = [0, 1, 1, 3]; },
    onChange: function (S) { var a = S.v.na, b = S.v.nb; S.data.f = C4.range(a).map(function (i) { return i % b; }); },
    act: function (S, act, arg) {
      var a = S.v.na, b = S.v.nb;
      if (act === 'cyc') { var i = +arg; S.data.f[i] = (S.data.f[i] + 1) % b; }
      if (act === 'inj') { S.data.f = C4.range(a).map(function (i) { return Math.min(i, b - 1); }); if (a > b) C4.toast('|A| > |B|：由鸽巢原理，不可能是单射。', 'bad'); }
      if (act === 'sur') { S.data.f = C4.range(a).map(function (i) { return i % b; }); if (a < b) C4.toast('|A| < |B|：像最多 ' + a + ' 个，不可能覆盖 B，不可能是满射。', 'bad'); }
      if (act === 'rand') S.data.f = C4.range(a).map(function () { return Math.floor(Math.random() * b); });
    },
    render: function (S) {
      var a = S.v.na, b = S.v.nb, f = S.data.f;
      if (f.length !== a || f.some(function (y) { return y >= b; })) { f = S.data.f = C4.range(a).map(function (i) { return (f[i] || 0) % b; }); }
      var J = judge(f, b);
      var A = C4.range(a).map(function (i) { return 'x' + C4.sub(i + 1); }), B = C4.range(b).map(function (j) { return 'y' + C4.sub(j + 1); });
      var pairs = f.map(function (y, i) { return [i, y, J.cnt[y] > 1 ? C.bad : C.red]; });
      var bState = J.cnt.map(function (c) { return c > 1 ? 'bad' : c === 0 ? 'gold' : 'ok'; });
      S.set('map', C4.mapSvg(A, B, pairs, { actA: 'cyc', bState: bState, w: 560, gap: 50 }) +
        C4.legend([{ color: '#FDECEA', border: C.bad, text: '被多个元素击中（破坏单射）' }, { color: '#FFF4D6', border: C.gold, text: '无原像（破坏满射）' }, { color: '#E8F6EE', border: C.ok, text: '恰一个原像' }]));
      var hit = J.cnt.map(function (c, j) { return c > 1 ? B[j] : null; }).filter(Boolean), miss = J.cnt.map(function (c, j) { return c === 0 ? B[j] : null; }).filter(Boolean);
      var type = J.inj && J.sur ? '双射' : J.inj ? '单射（非满射）' : J.sur ? '满射（非单射）' : '既非单射也非满射';
      S.set('judge', '<div class="c4-verdicts">' +
        '<div class="c4-verdict ' + (J.inj ? 'ok' : 'bad') + '"><b>单射 ' + (J.inj ? '✓' : '✗') + '</b><span>' + (J.inj ? '没有两个元素撞到同一个像' : hit.join('、') + ' 被重复击中') + '</span></div>' +
        '<div class="c4-verdict ' + (J.sur ? 'ok' : 'bad') + '"><b>满射 ' + (J.sur ? '✓' : '✗') + '</b><span>' + (J.sur ? 'B 的每个元素都有原像' : miss.join('、') + ' 没有原像') + '</span></div>' +
        '<div class="c4-verdict gold"><b>' + type + '</b><span>|ran f| = ' + J.cnt.filter(function (c) { return c; }).length + '，|B| = ' + b + '</span></div></div>');
      S.set('why', '<p>' + (a > b ? '|A| = ' + a + ' > |B| = ' + b + '：' + a + ' 支箭头射向 ' + b + ' 个目标，由<b>鸽巢原理</b>必有两支撞在一起——<b>不可能是单射</b>。'
        : a < b ? '|A| = ' + a + ' < |B| = ' + b + '：至多 ' + a + ' 个像，覆盖不了 B——<b>不可能是满射</b>。'
          : '|A| = |B| = ' + a + '：此时单射 ⇔ 满射 ⇔ 双射。试着点节点消除所有冲突，你会发现遗漏也同时消失。') + '</p>');
      C4.result('f = {' + f.map(function (y, i) { return A[i] + '→' + B[y]; }).join(', ') + '}', type, J.inj && J.sur ? '一一对应：它有逆函数 f⁻¹。' : '点 A 中的元素继续调整。');
    }
  });

  /* ----- 拓展层：编码与基数 ----- */
  var fact = function (n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; };
  var stir = function (m, n) { var t = [[1]]; for (var i = 1; i <= m; i++) { t[i] = []; for (var k = 0; k <= i; k++) t[i][k] = (k === 0 ? 0 : (t[i - 1][k - 1] || 0)) + k * (t[i - 1][k] || 0); } return t[m][n] || 0; };
  var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var TEXTS = { a: 'DISCRETE', b: 'HUNAN', c: 'FUNCTION' };

  C4.def('funcprop/extend', {
    badge: '计数 · 凯撒密码 · 压缩',
    mission: '场景一：数一数从 m 元集到 n 元集有多少个函数、单射、满射、双射；场景二：凯撒移位是字母表上的<b>双射</b>，所以能解密；「字母 mod 5」压缩不是单射，信息就再也还原不回来。',
    controls: [
      { type: 'select', id: 'mode', label: '场景', value: 'count', options: [['count', '计数：函数 / 单射 / 满射 / 双射'], ['cipher', '编码：凯撒移位 vs 取模压缩']] },
      { label: '集合大小', show: function (v) { return v.mode === 'count'; }, items: [
        { type: 'range', id: 'm', text: '|A| = m', min: 1, max: 6, value: 3 },
        { type: 'range', id: 'n', text: '|B| = n', min: 1, max: 6, value: 3 }
      ] },
      { label: '编码参数', show: function (v) { return v.mode === 'cipher'; }, items: [
        { type: 'select', id: 'txt', label: '明文', value: 'a', options: [['a', '明文 DISCRETE'], ['b', '明文 HUNAN'], ['c', '明文 FUNCTION']] },
        { type: 'range', id: 'k', text: '移位密钥 k', min: 1, max: 25, value: 3 }
      ] }
    ],
    stages: [
      { id: 'model', title: '模型' },
      { id: 'viz', title: '结果' },
      { id: 'out', title: '结论' }
    ],
    points: [
      '|A| = m，|B| = n：函数 nᵐ 个；单射 n(n−1)…(n−m+1) 个（m ≤ n）；满射 n!·S(m, n) 个（S 为第二类斯特林数）；双射 n! 个（m = n）。',
      '<b>可逆 ⇔ 双射</b>：加密函数必须是双射，解密就是它的逆函数。',
      '凯撒密码 E(x) = (x + k) mod 26 是 ℤ₂₆ 上的双射，逆为 D(y) = (y − k) mod 26。',
      '哈希、取模压缩把大集合映到小集合，<b>不是单射</b>，只能校验不能还原。'
    ],
    render: function (S) {
      if (S.v.mode === 'count') {
        var m = S.v.m, n = S.v.n, all = Math.pow(n, m), inj = m <= n ? fact(n) / fact(n - m) : 0, sur = m >= n ? fact(n) * stir(m, n) : 0, bij = m === n ? fact(n) : 0;
        S.set('model', '<p>A = {1, …, ' + m + '}，B = {1, …, ' + n + '}。每个元素独立选像 ⇒ 函数有 n<sup>m</sup> 个；要求不撞车 ⇒ 依次有 n, n−1, … 种选法。</p>');
        var mx = Math.max(all, 1), rows = [['全部函数', all, 'n^m = ' + n + '^' + m], ['单射', inj, m <= n ? 'P(n, m) = ' + n + '!/' + (n - m) + '!' : 'm > n，为 0'], ['满射', sur, m >= n ? 'n!·S(m, n) = ' + n + '!×' + stir(m, n) : 'm < n，为 0'], ['双射', bij, m === n ? 'n! = ' + n + '!' : 'm ≠ n，为 0']];
        S.set('viz', rows.map(function (r) {
          return '<div style="display:grid;grid-template-columns:78px 1fr 64px;gap:10px;align-items:center;margin:6px 0"><b style="color:#D63B1D">' + r[0] + '</b><div style="height:22px;border-radius:11px;background:rgba(116,55,31,.08);overflow:hidden"><i style="display:block;height:100%;width:' + (r[1] ? Math.max(2, Math.log(r[1] + 1) / Math.log(mx + 1) * 100) : 0) + '%;background:linear-gradient(90deg,#D63B1D,#FFB400)"></i></div><b class="c4-mono">' + r[1] + '</b></div><div class="c4-note" style="margin:-4px 0 4px 88px">' + r[2] + '</div>';
        }).join('') + '<p class="c4-note">条形长度按对数刻度。</p>');
        S.set('out', '<p>' + (m === n ? '|A| = |B| 时单射数 = 满射数 = 双射数 = ' + bij + '——再次印证有限等势集上「单 ⇔ 满」。' : m < n ? 'm < n：没有满射，也没有双射——两集合不等势。' : 'm > n：没有单射——鸽巢原理。') + '</p>');
        C4.result('m = ' + m + '，n = ' + n, '函数 ' + all + '，单射 ' + inj + '，满射 ' + sur + '，双射 ' + bij, '只有 m = n 时才存在双射（等势）。');
      } else {
        var k = S.v.k, P = TEXTS[S.v.txt];
        var enc = P.split('').map(function (c) { return ALPHA[(ALPHA.indexOf(c) + k) % 26]; }).join('');
        var dec = enc.split('').map(function (c) { return ALPHA[(ALPHA.indexOf(c) - k + 26) % 26]; }).join('');
        var h = P.split('').map(function (c) { return ALPHA.indexOf(c) % 5; });
        var pre = {}; ALPHA.split('').forEach(function (c, i) { (pre[i % 5] = pre[i % 5] || []).push(c); });
        S.set('model', '<p class="c4-mono">E(x) = (x + ' + k + ') mod 26，D(y) = (y − ' + k + ') mod 26</p><p class="c4-mono">h(x) = x mod 5</p><p class="c4-note">字母按 A=0, B=1, …, Z=25 编号；h 把 26 个字母压缩成 5 个数字。</p>');
        S.set('viz', '<div class="c4-kv"><div><span>明文</span><b>' + P + '</b></div><div><span>凯撒密文 E</span><b>' + enc + '</b></div><div><span>用 D 解密</span><b style="color:#1F9D55">' + dec + '</b></div><div><span>压缩 h</span><b>' + h.join('') + '</b></div></div>' +
          '<p class="c4-note" style="margin-top:10px">h 的「原像」：' + [0, 1, 2, 3, 4].map(function (r) { return r + ' ← {' + pre[r].join('') + '}'; }).join('；') + '</p>');
        S.set('out', '<div class="c4-verdicts"><div class="c4-verdict ok"><b>E 是双射 ✓</b><span>解密结果与明文完全一致</span></div><div class="c4-verdict bad"><b>h 不是单射 ✗</b><span>数字「' + h[0] + '」可能来自 ' + pre[h[0]].join('、') + ' 中任一字母，无法唯一还原</span></div></div>');
        C4.result('k = ' + k, P + ' → ' + enc + ' → ' + dec, '可逆编码必须是双射；有损压缩必然丢失信息。');
      }
    }
  });
})();
/* @@END */

/* ---------- 4.6 特殊类型的函数 ---------- */
(function () {
  var C = C4.COL, esc = C4.esc;
  var A = ['1', '2', '3', '4'];
  var F = {
    shift: { name: 'f(x) = x mod 4 + 1（循环右移）', f: [1, 2, 3, 0] },
    swap: { name: 'f：交换 1、2，其余不动', f: [1, 0, 2, 3] },
    sq: { name: 'f(x) = ⌈x/2⌉', f: [0, 0, 1, 1] }
  };

  C4.def('special/basic', {
    badge: '常函数 · 恒等函数 · 复合',
    mission: '在 A = {1,2,3,4} 上比较两种特殊函数：<b>常函数</b>把一切压成一点，<b>恒等函数</b> I<sub>A</sub> 让每个元素保持原样。再把 I<sub>A</sub> 与任意 f 复合，验证 f∘I<sub>A</sub> = I<sub>A</sub>∘f = f。',
    cols: 2,
    controls: [
      { type: 'select', id: 'kind', label: '选择函数', value: 'id', options: [['id', '恒等函数 I_A'], ['const', '常函数 c(x) = c']] },
      { type: 'range', id: 'c', label: '常数 c', text: '常数 c', min: 1, max: 4, value: 2, show: function (v) { return v.kind === 'const'; } },
      { type: 'select', id: 'g', label: '与之复合的函数 f', value: 'shift', options: [['shift', 'f(x) = x mod 4 + 1'], ['swap', '交换 1、2'], ['sq', 'f(x) = ⌈x/2⌉']] }
    ],
    stages: [
      { id: 'map', title: '映射图', hint: 'A → A' },
      { id: 'prop', title: '性质' },
      { id: 'comp', title: '与 f 复合', wide: true }
    ],
    points: [
      '<b>常函数</b>：∀x∈A，f(x) = c；值域 {c}。',
      '<b>恒等函数</b> I<sub>A</sub>(x) = x，是 A 上的双射，且 I<sub>A</sub><sup>−1</sup> = I<sub>A</sub>。',
      'I<sub>A</sub> 是复合运算的<b>单位元</b>：f∘I<sub>A</sub> = f，I<sub>B</sub>∘f = f（f : A→B）。',
      '常函数与任何函数复合：c∘f 仍是常函数 c；f∘c 是常函数 f(c)。'
    ],
    render: function (S) {
      var isId = S.v.kind === 'id', c = S.v.c - 1;
      var h = A.map(function (_, i) { return isId ? i : c; });
      var pairs = h.map(function (y, i) { return [i, y]; });
      S.set('map', C4.mapSvg(A, A, pairs, { w: 420, xa: 100, gap: 54, aName: 'A', bName: 'A', bState: A.map(function (_, j) { return h.indexOf(j) >= 0 ? 'ok' : 'dim'; }) }));
      S.set('prop', '<div class="c4-verdicts">' +
        '<div class="c4-verdict ' + (isId ? 'ok' : 'bad') + '"><b>单射 ' + (isId ? '✓' : '✗') + '</b><span>' + (isId ? '不同元素像不同' : '4 个元素都映到 ' + A[c]) + '</span></div>' +
        '<div class="c4-verdict ' + (isId ? 'ok' : 'bad') + '"><b>满射 ' + (isId ? '✓' : '✗') + '</b><span>值域 {' + (isId ? A.join(',') : A[c]) + '}</span></div>' +
        '<div class="c4-verdict gold"><b>' + (isId ? '双射，可逆' : '不可逆') + '</b><span>' + (isId ? 'I⁻¹ = I' : '信息被压缩成一点') + '</span></div></div>');
      var f = F[S.v.g].f;
      var hf = f.map(function (y) { return h[y]; }), fh = h.map(function (y) { return f[y]; });
      var row = function (lab, arr) { return '<tr><th>' + lab + '</th>' + arr.map(function (v, i) { return '<td class="mono' + (v === f[i] ? ' ok' : '') + '">' + A[v] + '</td>'; }).join('') + '</tr>'; };
      S.set('comp', '<p class="c4-note">' + esc(F[S.v.g].name) + '。表中绿色格子表示与 f 的结果相同。</p><div class="c4-table-wrap"><table class="c4-table"><tr><th>x</th>' + A.map(function (a) { return '<th>' + a + '</th>'; }).join('') + '</tr>' +
        '<tr><th>f(x)</th>' + f.map(function (v) { return '<td class="mono soft">' + A[v] + '</td>'; }).join('') + '</tr>' +
        row(isId ? '(I∘f)(x)' : '(c∘f)(x)', hf) + row(isId ? '(f∘I)(x)' : '(f∘c)(x)', fh) + '</table></div>' +
        '<p style="margin-top:8px">' + (isId ? '<span class="c4-chip ok">f∘I = I∘f = f</span> 恒等函数像数字乘法里的 1。' : '<span class="c4-chip gold">c∘f ≡ ' + A[c] + '，f∘c ≡ ' + A[f[c]] + '</span> 与常函数复合，结果仍是常函数。') + '</p>');
      C4.result(isId ? 'I_A(x) = x' : 'c(x) = ' + A[c], isId ? '恒等函数：双射' : '常函数：非单射非满射', isId ? 'I_A 是复合的单位元。' : '常函数「以不变应万变」。');
    }
  });

  /* ----- 拓展层：编码与离散化 ----- */
  var CITY = ['长沙', '株洲', '湘潭', '衡阳', '岳阳'];
  var SCORES = [58, 61, 73, 79, 85, 90, 96, 44, 67, 88];

  C4.def('special/extend', {
    badge: '独热编码 · 分桶离散化',
    mission: '场景一：<b>独热编码</b>把每个类别 k 编成特征函数向量 (χ<sub>{k}</sub>(c₁), …)——恰有一个 1；场景二：<b>分桶</b>是一个单调不减的阶梯函数，把连续分数离散成等级，保序但不单射。',
    controls: [
      { type: 'select', id: 'mode', label: '场景', value: 'onehot', options: [['onehot', '独热编码（特征函数向量）'], ['bucket', '成绩分桶（单调阶梯函数）']] },
      { type: 'select', id: 'city', label: '选择类别', value: '2', options: CITY.map(function (c, i) { return [String(i), c]; }), show: function (v) { return v.mode === 'onehot'; } },
      { type: 'range', id: 'w', label: '桶宽', text: '桶宽（分）', min: 5, max: 20, step: 5, value: 10, show: function (v) { return v.mode === 'bucket'; } }
    ],
    stages: [
      { id: 'model', title: '模型' },
      { id: 'viz', title: '编码结果' },
      { id: 'out', title: '性质' }
    ],
    points: [
      '独热编码：类别集合 K 中每个 k 对应向量 e(k) = (χ<sub>{k}</sub>(k₁), …, χ<sub>{k}</sub>(kₙ))，e 是单射。',
      '子集 S ⊆ K 的「多热」向量就是特征函数 χ<sub>S</sub> 的取值表。',
      '分桶 b(x) = ⌊x / w⌋ 单调不减（保序）：x ≤ y ⇒ b(x) ≤ b(y)。',
      '分桶不是单射：同桶的不同分数被合并，以损失精度换取稳健与可解释。'
    ],
    render: function (S) {
      if (S.v.mode === 'onehot') {
        var k = +S.v.city;
        S.set('model', '<p>类别集 K = {' + CITY.join('，') + '}，e(k)ᵢ = χ<sub>{k}</sub>(kᵢ)。</p>');
        var t = '<div class="c4-table-wrap"><table class="c4-table"><tr><th>类别</th>' + CITY.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr>';
        CITY.forEach(function (c, i) {
          t += '<tr><th>' + c + '</th>' + CITY.map(function (_, j) { return '<td class="mono ' + (i === j ? 'hit' : '') + (i === k ? ' cur' : '') + '">' + (i === j ? 1 : 0) + '</td>'; }).join('') + '</tr>';
        });
        S.set('viz', t + '</table></div><p style="margin-top:8px">e(' + CITY[k] + ') = <b class="c4-mono">(' + CITY.map(function (_, j) { return j === k ? 1 : 0; }).join(', ') + ')</b></p>');
        S.set('out', '<div class="c4-verdicts"><div class="c4-verdict ok"><b>e 是单射 ✓</b><span>不同类别的向量不同</span></div><div class="c4-verdict gold"><b>每行恰一个 1</b><span>各分量是单点集的特征函数</span></div></div><p class="c4-note" style="margin-top:8px">为何不直接编成 1,2,3,…？那会引入「长沙 &lt; 株洲」这样并不存在的顺序。</p>');
        C4.result('e(' + CITY[k] + ')', '独热向量，第 ' + (k + 1) + ' 位为 1', '类别之间没有大小关系，独热编码不引入虚假序。');
      } else {
        var w = S.v.w, b = function (x) { return Math.floor(x / w); };
        var sorted = SCORES.slice().sort(function (p, q) { return p - q; });
        S.set('model', '<p class="c4-mono">b(x) = ⌊x / ' + w + '⌋</p>');
        var groups = {}; sorted.forEach(function (x) { (groups[b(x)] = groups[b(x)] || []).push(x); });
        S.set('viz', '<div class="c4-verdicts">' + Object.keys(groups).map(function (g, i) {
          return '<div class="c4-verdict" style="border-top-color:' + C4.CLASS[i % 8] + '"><b>桶 ' + g + '：[' + g * w + ', ' + (g * w + w) + ')</b><span class="c4-mono">' + groups[g].join(', ') + '</span></div>';
        }).join('') + '</div>');
        var mono = sorted.every(function (x, i) { return i === 0 || b(sorted[i - 1]) <= b(x); });
        var merged = Object.keys(groups).filter(function (g) { return groups[g].length > 1; }).length;
        S.set('out', '<div class="c4-verdicts"><div class="c4-verdict ' + (mono ? 'ok' : 'bad') + '"><b>单调不减 ✓</b><span>排序后桶号不下降</span></div><div class="c4-verdict ' + (merged ? 'bad' : 'ok') + '"><b>单射 ' + (merged ? '✗' : '✓') + '</b><span>' + merged + ' 个桶里合并了多个分数</span></div></div>');
        C4.result('桶宽 ' + w, Object.keys(groups).length + ' 个非空桶', '桶越宽，离散越粗，信息损失越大。');
      }
    }
  });
})();
/* @@END */

/* @@UNITS@@ */

C4.boot();
