/**
 * 3.4 二元关系的运算 · 进阶层：复合运算与关系矩阵
 * 按定义（经中间点 y 的两步路径）与布尔矩阵乘法（逐格「行 ∧ 列 再 ∨」）两种方法计算复合，支持分步演示。
 */
(function () {
    'use strict';
    var $ = function (id) { return document.getElementById(id); };
    var O = RelOps, n = 4, names = ['1', '2', '3', '4'];
    var SAMPLE_R = [[0, 1], [0, 2], [1, 3], [2, 2]];
    var SAMPLE_S = [[1, 0], [2, 3], [3, 1], [3, 3]];
    var R = O.fromPairs(SAMPLE_R), S = O.fromPairs(SAMPLE_S);
    var op = 'RS';           // RS: R∘S，SR: S∘R，RR: R∘R
    var conv = 'right';      // right: R∘S 先 R 后 S；left: R∘S 先 S 后 R
    var step = 0;            // 已计算的格子数（0..n*n）
    var timer = null;

    // 当前复合的「先作用」「后作用」关系与名称
    function operands() {
        var a = op === 'SR' ? 'S' : 'R', b = op === 'RR' ? 'R' : (op === 'SR' ? 'R' : 'S');
        // 书写形式 a∘b；右复合先 a 后 b，左复合先 b 后 a
        var first = conv === 'right' ? a : b, second = conv === 'right' ? b : a;
        return { text: a + '∘' + b, first: first, second: second, F: first === 'R' ? R : S, G: second === 'R' ? R : S };
    }

    function cellIndex(s) { return [Math.floor(s / n), s % n]; }

    function render() {
        var od = operands(), F = od.F, G = od.G, T = O.compose(F, G, n);
        var total = n * n, cur = step > 0 ? cellIndex(step - 1) : null;
        var done = function (i, j) { return i * n + j < step; };
        var ws = cur ? O.witnesses(F, G, cur[0], cur[1], n) : [];

        // 标题与公式
        $('formula').innerHTML = od.text + ' = {(x,z) | ∃y：x ' + od.first + ' y 且 y ' + od.second + ' z}，'
            + 'M<sub>' + od.text + '</sub> = M<sub>' + od.first + '</sub> ⊙ M<sub>' + od.second + '</sub>';
        $('convNote').innerHTML = conv === 'right'
            ? '<b>右复合</b>：R∘S 表示先 R 后 S，矩阵按书写次序相乘 M<sub>R∘S</sub> = M<sub>R</sub> ⊙ M<sub>S</sub>。'
            : '<b>左复合</b>：R∘S 表示先 S 后 R（与函数复合 g∘f 同序），M<sub>R∘S</sub> = M<sub>S</sub> ⊙ M<sub>R</sub>。';

        // 矩阵：先作用 ⊙ 后作用 = 结果
        $('tF').innerHTML = 'M<sub>' + od.first + '</sub>（第一步）';
        $('tG').innerHTML = 'M<sub>' + od.second + '</sub>（第二步）';
        $('tT').innerHTML = 'M<sub>' + od.text + '</sub>';
        O.renderMatrix($('mF'), { n: n, names: names, R: F, editable: true, corner: od.first, hdrClass: od.first === 'S' ? 'alt' : '',
            onToggle: function (i, j) { edit(od.first, i, j); },
            cellClass: function (i, j, on) { if (!cur || i !== cur[0]) return ''; return on && G.has(O.key(j, cur[1])) ? 'hit' : 'hi'; } });
        O.renderMatrix($('mG'), { n: n, names: names, R: G, editable: true, corner: od.second, hdrClass: od.second === 'S' ? 'alt' : '',
            onToggle: function (i, j) { edit(od.second, i, j); },
            cellClass: function (i, j, on) { if (!cur || j !== cur[1]) return ''; return on && F.has(O.key(cur[0], i)) ? 'hit' : 'hi'; } });
        O.renderMatrix($('mT'), { n: n, names: names, R: T, corner: '',
            pending: function (i, j) { return !done(i, j); },
            cellClass: function (i, j) { return cur && i === cur[0] && j === cur[1] ? 'cur' : ''; } });

        // 三层路径图
        drawLayers(od, F, G, cur, ws);

        // 已算出的结果关系图
        var partial = new Set();
        T.forEach(function (k) { var p = O.parse(k); if (done(p[0], p[1])) partial.add(k); });
        O.renderGraph($('gT'), { n: n, names: names, width: 230, height: 220, layers: [{ R: partial, color: '#b8321a', width: 2.4 }], nodeFill: function () { return '#b8321a'; } });

        // 分步文字
        $('stepInfo').textContent = '已计算 ' + step + ' / ' + total + ' 格';
        $('prevBtn').disabled = step <= 0;
        $('nextBtn').disabled = step >= total;
        if (!cur) {
            $('stepTitle').textContent = '准备开始';
            $('stepText').innerHTML = '按「下一步」逐格计算 ' + od.text + '：第 x 行第 z 列的元素 = M<sub>' + od.first + '</sub> 的第 x 行与 M<sub>' + od.second + '</sub> 的第 z 列「对应位置同时为 1」是否发生。';
        } else {
            var x = names[cur[0]], z = names[cur[1]];
            var terms = [];
            for (var y = 0; y < n; y++) terms.push((F.has(O.key(cur[0], y)) ? 1 : 0) + '∧' + (G.has(O.key(y, cur[1])) ? 1 : 0));
            $('stepTitle').textContent = '计算 (' + x + ', ' + z + ') 格';
            $('stepText').innerHTML = '(' + terms.join(') ∨ (') + ') = <b>' + (ws.length ? 1 : 0) + '</b>。'
                + (ws.length ? '中间点 y = ' + ws.map(function (k) { return names[k]; }).join('、') + '：' + ws.map(function (k) { return x + ' → ' + names[k] + ' → ' + z; }).join('，') + '，所以 (' + x + ', ' + z + ') ∈ ' + od.text + '。'
                    : '找不到中间点 y 使 ' + x + ' ' + od.first + ' y 且 y ' + od.second + ' ' + z + '，所以 (' + x + ', ' + z + ') ∉ ' + od.text + '。');
        }
        if (step >= total) {
            $('stepTitle').textContent = '计算完成';
            $('stepText').innerHTML = od.text + ' 共 ' + T.size + ' 个有序对。每个 1 都对应图中至少一条「先 ' + od.first + ' 后 ' + od.second + '」的两步路径。';
        }

        // 集合与性质核对
        var RS = conv === 'right' ? O.compose(R, S, n) : O.compose(S, R, n);   // R∘S
        var SR = conv === 'right' ? O.compose(S, R, n) : O.compose(R, S, n);   // S∘R
        var invRS = O.inverse(RS);
        var SinvRinv = conv === 'right' ? O.compose(O.inverse(S), O.inverse(R), n) : O.compose(O.inverse(R), O.inverse(S), n); // S⁻¹∘R⁻¹
        var paths = [];
        O.sorted(T).forEach(function (p) {
            if (!done(p[0], p[1])) return;
            O.witnesses(F, G, p[0], p[1], n).forEach(function (y) { paths.push('<span class="path-chip">' + names[p[0]] + '→' + names[y] + '→' + names[p[1]] + '</span>'); });
        });
        $('setLine').innerHTML = '<b>R</b> = ' + O.setText(R, names) + '　　<b>S</b> = ' + O.setText(S, names)
            + '<br><b>' + od.text + '</b> = ' + (step >= total ? O.setText(T, names) : '（逐格计算中…）')
            + (paths.length ? '<br>' + paths.join('') : '');
        $('checks').innerHTML = badge(O.equal(RS, SR), 'R∘S = S∘R')
            + badge(O.equal(invRS, SinvRinv), '(R∘S)⁻¹ = S⁻¹∘R⁻¹')
            + '<span class="badge info">dom(' + od.text + ') ⊆ dom ' + od.first + '：' + O.listText(O.domain(T), names) + ' ⊆ ' + O.listText(O.domain(F), names) + '</span>';
    }

    function badge(ok, text) { return '<span class="badge ' + (ok ? 'yes' : 'no') + '">' + (ok ? '✓ ' : '✗ ') + text + '</span>'; }

    function drawLayers(od, F, G, cur, ws) {
        var W = 440, H = 64 + n * 46, xs = [70, 220, 370], y0 = 58, gap = 46, r = 14;
        var Y = function (i) { return y0 + i * gap; };
        var svg = '<defs>'
            + '<marker id="lyF" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="#d63b1d"/></marker>'
            + '<marker id="lyG" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="#c58a1f"/></marker>'
            + '<marker id="lyH" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="#1f9d55"/></marker>'
            + '</defs>';
        svg += '<text class="lbl" x="' + xs[0] + '" y="22" text-anchor="middle">x（起点）</text>'
            + '<text class="lbl" x="' + xs[1] + '" y="22" text-anchor="middle">y（中间点）</text>'
            + '<text class="lbl" x="' + xs[2] + '" y="22" text-anchor="middle">z（终点）</text>'
            + '<text class="lbl" x="' + (xs[0] + xs[1]) / 2 + '" y="40" text-anchor="middle" style="fill:#d63b1d">' + od.first + '</text>'
            + '<text class="lbl" x="' + (xs[1] + xs[2]) / 2 + '" y="40" text-anchor="middle" style="fill:#8a5a00">' + od.second + '</text>';
        function edge(i, j, c0, c1, hot, color, mk) {
            var x1 = xs[c0] + r + 2, y1 = Y(i), x2 = xs[c1] - r - 4, y2 = Y(j);
            svg += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (hot ? '#1f9d55' : color) + '" stroke-width="' + (hot ? 3.2 : 1.8) + '" opacity="' + (cur && !hot ? 0.28 : 0.85) + '" marker-end="url(#' + (hot ? 'lyH' : mk) + ')"/>';
        }
        F.forEach(function (k) { var p = O.parse(k); edge(p[0], p[1], 0, 1, cur && p[0] === cur[0] && ws.indexOf(p[1]) >= 0, '#d63b1d', 'lyF'); });
        G.forEach(function (k) { var p = O.parse(k); edge(p[0], p[1], 1, 2, cur && p[1] === cur[1] && ws.indexOf(p[0]) >= 0, '#c58a1f', 'lyG'); });
        for (var c = 0; c < 3; c++) for (var i = 0; i < n; i++) {
            var on = cur && ((c === 0 && i === cur[0]) || (c === 2 && i === cur[1]) || (c === 1 && ws.indexOf(i) >= 0));
            svg += '<circle cx="' + xs[c] + '" cy="' + Y(i) + '" r="' + r + '" fill="' + (on ? '#1f9d55' : (c === 1 ? '#8a5a00' : '#d63b1d')) + '" stroke="#fff" stroke-width="2"/>'
                + '<text x="' + xs[c] + '" y="' + (Y(i) + 4.5) + '" text-anchor="middle">' + names[i] + '</text>';
        }
        var el = $('gLayers');
        el.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        el.setAttribute('width', W);
        el.setAttribute('height', H);
        el.innerHTML = svg;
    }

    function edit(which, i, j) {
        var X = which === 'R' ? R : S, k = O.key(i, j);
        if (X.has(k)) X.delete(k); else X.add(k);
        render();
    }

    function stop() { if (timer) { clearInterval(timer); timer = null; } $('autoBtn').textContent = '自动播放'; }
    function speed() { return 1700 - (+$('speed').value) * 150; }

    $('nextBtn').addEventListener('click', function () { stop(); if (step < n * n) { step++; render(); } });
    $('prevBtn').addEventListener('click', function () { stop(); if (step > 0) { step--; render(); } });
    $('allBtn').addEventListener('click', function () { stop(); step = n * n; render(); });
    $('resetBtn').addEventListener('click', function () { stop(); step = 0; R = O.fromPairs(SAMPLE_R); S = O.fromPairs(SAMPLE_S); render(); });
    $('autoBtn').addEventListener('click', function () {
        if (timer) { stop(); return; }
        if (step >= n * n) step = 0;
        $('autoBtn').textContent = '暂停';
        timer = setInterval(function () {
            if (step >= n * n) { stop(); return; }
            step++; render();
        }, speed());
    });
    $('speed').addEventListener('input', function () { if (timer) { stop(); $('autoBtn').click(); } });
    Array.prototype.forEach.call(document.querySelectorAll('#opSeg button'), function (b) {
        b.addEventListener('click', function () {
            op = b.dataset.op; step = 0; stop();
            Array.prototype.forEach.call(document.querySelectorAll('#opSeg button'), function (x) { x.classList.toggle('active', x === b); });
            render();
        });
    });
    Array.prototype.forEach.call(document.querySelectorAll('#convSeg button'), function (b) {
        b.addEventListener('click', function () {
            conv = b.dataset.conv; step = 0; stop();
            Array.prototype.forEach.call(document.querySelectorAll('#convSeg button'), function (x) { x.classList.toggle('active', x === b); });
            render();
        });
    });

    render();
})();
