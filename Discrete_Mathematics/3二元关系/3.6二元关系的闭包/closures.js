/**
 * 3.6 二元关系的闭包 · 进阶层：r(R)、s(R)、t(R) 对照 + Warshall 算法分步演示
 */
(function () {
    'use strict';
    var $ = function (id) { return document.getElementById(id); };
    var O = RelOps, N = 4, names = ['1', '2', '3', '4'];
    var PRESETS = {
        chain: [[0, 1], [1, 2], [2, 3]],
        cycle: [[0, 1], [1, 2], [2, 0], [2, 3]],
        mixed: [[0, 1], [1, 0], [1, 2], [3, 3]]
    };
    var R = O.fromPairs(PRESETS.chain), type = 't', k = 0, timer = null;

    // Warshall：W[0] = M_R，W[k] 为以 1..k 为中转站后的结果；added[k] 为第 k 轮新增的有序对
    function warshall() {
        var W = [O.clone(R)], added = [[]];
        for (var kk = 0; kk < N; kk++) {
            var prev = W[kk], cur = O.clone(prev), add = [];
            for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
                if (!prev.has(O.key(i, j)) && prev.has(O.key(i, kk)) && prev.has(O.key(kk, j))) { cur.add(O.key(i, j)); add.push([i, j]); }
            }
            W.push(cur); added.push(add);
        }
        return { W: W, added: added };
    }
    function closure() {
        if (type === 'r') return O.union(R, O.identity(N));
        if (type === 's') return O.union(R, O.inverse(R));
        return warshall().W[N];
    }
    function isRefl(T) { for (var i = 0; i < N; i++) if (!T.has(O.key(i, i))) return false; return true; }
    function isSym(T) { return O.equal(T, O.inverse(T)); }
    function isTrans(T) { var ok = true; O.compose(T, T, N).forEach(function (x) { if (!T.has(x)) ok = false; }); return ok; }
    function badge(ok, text) { return '<span class="badge ' + (ok ? 'yes' : 'no') + '">' + (ok ? '✓ ' : '✗ ') + text + '</span>'; }

    var INFO = {
        r: { title: '自反闭包 r(R) = R ∪ I<sub>A</sub>', text: '只补上缺少的自环（主对角线上的 0 改为 1），得到包含 R 的<b>最小</b>自反关系——一个不多，一个不少。' },
        s: { title: '对称闭包 s(R) = R ∪ R⁻¹', text: '为每条单向边补上反向边（矩阵与其转置取「或」），得到包含 R 的<b>最小</b>对称关系。' },
        t: { title: '传递闭包 t(R) = R ∪ R² ∪ … ∪ Rⁿ', text: '把所有「间接可达」补成直接关系，得到包含 R 的<b>最小</b>传递关系。Warshall 算法依次以结点 1, 2, …, n 为「中转站」扫描矩阵，共 n 轮，时间 O(n³)。' }
    };

    function render() {
        var isT = type === 't';
        var ws = isT ? warshall() : null;
        var T = isT ? ws.W[k] : closure();
        var final = closure();
        var addedAll = O.diff(T, R);
        var thisStep = {};
        if (isT && k > 0) ws.added[k].forEach(function (p) { thisStep[O.key(p[0], p[1])] = 1; });

        $('closureTitle').innerHTML = INFO[type].title;
        $('closureText').innerHTML = INFO[type].text;
        $('stepCard').style.display = isT ? '' : 'none';
        $('tTitle').innerHTML = isT ? 'Warshall 第 ' + k + ' / ' + N + ' 轮后的矩阵' : (type === 'r' ? 'M<sub>r(R)</sub>' : 'M<sub>s(R)</sub>');
        $('gTitle').innerHTML = isT ? (k < N ? '闭包关系图（计算中）' : 't(R) 的关系图') : (type === 'r' ? 'r(R) 的关系图' : 's(R) 的关系图');

        O.renderMatrix($('mR'), { n: N, names: names, R: R, editable: true, corner: 'R', onToggle: function (i, j) {
            var kk = O.key(i, j); if (R.has(kk)) R.delete(kk); else R.add(kk);
            k = 0; stop(); markCustom(); render();
        } });
        O.renderMatrix($('mT'), { n: N, names: names, R: T, corner: isT ? 'W' + k : '',
            cellClass: function (i, j, on) {
                var c = '';
                if (isT && k > 0 && (i === k - 1 || j === k - 1)) c += ' hi';
                if (on && thisStep[O.key(i, j)]) c += ' gold cur';
                else if (on && !R.has(O.key(i, j))) c += ' gold';
                return c;
            } });
        O.renderGraph($('gR'), { n: N, names: names, width: 240, height: 230, layers: [{ R: R, color: '#d63b1d' }] });
        O.renderGraph($('gT'), { n: N, names: names, width: 240, height: 230, layers: [{ R: R, color: '#d9c6b8', width: 1.8 }, { R: addedAll, color: '#c58a1f', width: 2.6, curve: 0.2 }],
            nodeFill: function (m) { return isT && k > 0 && m === k - 1 ? '#c58a1f' : '#d63b1d'; } });

        $('cntR').textContent = R.size;
        $('cntAdd').textContent = addedAll.size;
        $('cntT').textContent = T.size;

        // Warshall 解说
        if (isT) {
            $('stepInfo').textContent = '第 ' + k + ' / ' + N + ' 轮';
            $('prevBtn').disabled = k <= 0;
            $('nextBtn').disabled = k >= N;
            if (k === 0) {
                $('wNote').innerHTML = 'W<sub>0</sub> = M<sub>R</sub>。按「下一步」以结点 1 为中转站开始扫描。';
                $('insTitle').textContent = '准备开始 Warshall';
                $('insText').innerHTML = '规则：第 k 轮中，若 m<sub>ik</sub> = 1 且 m<sub>kj</sub> = 1，就令 m<sub>ij</sub> = 1（i 经 k 可到 j）。';
            } else {
                var add = ws.added[k], kn = names[k - 1];
                $('wNote').innerHTML = 'k = ' + kn + '：第 ' + kn + ' 行、第 ' + kn + ' 列（金框）中，凡 m<sub>i' + kn + '</sub> = 1 且 m<sub>' + kn + 'j</sub> = 1，就令 m<sub>ij</sub> = 1。';
                $('insTitle').textContent = '第 ' + k + ' 轮：以结点 ' + kn + ' 为中转站';
                $('insText').innerHTML = add.length
                    ? '新增 ' + add.map(function (p) { return '(' + names[p[0]] + ',' + names[p[1]] + ')（' + names[p[0]] + '→' + kn + '→' + names[p[1]] + '）'; }).join('、') + '。'
                    : '本轮没有新增有序对。' + (k === N ? '' : '继续下一轮。');
                if (k === N) $('insText').innerHTML += ' 全部 ' + N + ' 轮完成，得到 t(R)，共新增 ' + addedAll.size + ' 个有序对。';
            }
        } else {
            $('wNote').innerHTML = '';
            $('insTitle').innerHTML = INFO[type].title;
            $('insText').innerHTML = '新增 ' + addedAll.size + ' 个有序对：' + (addedAll.size ? O.setText(addedAll, names) : '无（R 已具备该性质，闭包就是 R 本身）') + '。';
        }

        var pw = new Set(); for (var p = 1; p <= N; p++) O.power(R, p, N).forEach(function (x) { pw.add(x); });
        $('checks').innerHTML = (type === 'r' ? badge(isRefl(final), 'r(R) 自反') : type === 's' ? badge(isSym(final), 's(R) 对称') : badge(isTrans(final), 't(R) 传递') + badge(O.equal(final, pw), 't(R) = R ∪ R² ∪ R³ ∪ R⁴'))
            + badge(O.diff(R, final).size === 0, 'R ⊆ 闭包')
            + (type === 'r' ? badge(isRefl(R), 'R 本身自反') : type === 's' ? badge(isSym(R), 'R 本身对称') : badge(isTrans(R), 'R 本身传递'));
        $('setLine').innerHTML = '<b>R</b> = ' + O.setText(R, names) + '<br><b>' + (type === 'r' ? 'r(R)' : type === 's' ? 's(R)' : (k < N ? 'W' + k : 't(R)')) + '</b> = ' + O.setText(T, names);
    }

    function markCustom() { Array.prototype.forEach.call(document.querySelectorAll('#preset button'), function (x) { x.classList.remove('active'); }); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } $('autoBtn').textContent = '自动播放'; }

    Array.prototype.forEach.call(document.querySelectorAll('#typeSeg button'), function (b) {
        b.addEventListener('click', function () {
            type = b.dataset.t; stop(); k = type === 't' ? 0 : N;
            Array.prototype.forEach.call(document.querySelectorAll('#typeSeg button'), function (x) { x.classList.toggle('active', x === b); });
            if (type === 't') k = 0;
            render();
        });
    });
    Array.prototype.forEach.call(document.querySelectorAll('#preset button'), function (b) {
        b.addEventListener('click', function () {
            R = O.fromPairs(PRESETS[b.dataset.p]); k = 0; stop();
            Array.prototype.forEach.call(document.querySelectorAll('#preset button'), function (x) { x.classList.toggle('active', x === b); });
            render();
        });
    });
    $('nextBtn').addEventListener('click', function () { stop(); if (k < N) { k++; render(); } });
    $('prevBtn').addEventListener('click', function () { stop(); if (k > 0) { k--; render(); } });
    $('allBtn').addEventListener('click', function () { stop(); k = N; render(); });
    $('resetBtn').addEventListener('click', function () {
        stop(); k = 0; type = 't'; R = O.fromPairs(PRESETS.chain);
        Array.prototype.forEach.call(document.querySelectorAll('#typeSeg button'), function (x) { x.classList.toggle('active', x.dataset.t === 't'); });
        Array.prototype.forEach.call(document.querySelectorAll('#preset button'), function (x) { x.classList.toggle('active', x.dataset.p === 'chain'); });
        render();
    });
    $('autoBtn').addEventListener('click', function () {
        if (timer) { stop(); return; }
        if (k >= N) k = 0;
        $('autoBtn').textContent = '暂停';
        render();
        timer = setInterval(function () { if (k >= N) { stop(); return; } k++; render(); }, 2000 - (+$('speed').value) * 150);
    });
    $('speed').addEventListener('input', function () { if (timer) { stop(); $('autoBtn').click(); } });

    render();
})();
