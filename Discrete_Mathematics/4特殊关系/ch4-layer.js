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
      out += C4.line(xa, ya(p[0]), xb, yb(p[1]), { color: col, width: p[4] || 2.4, dash: p[3], arrow: mk, trim: [22, 24], opacity: 0.9 });
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

/* @@UNITS@@ */

C4.boot();
