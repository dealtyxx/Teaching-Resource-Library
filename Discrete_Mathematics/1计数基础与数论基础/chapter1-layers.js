/* =============================================================================
 * chapter1-layers.js —— 第1章 计数基础与数论基础 · 基础层 / 拓展层统一交互引擎
 * -----------------------------------------------------------------------------
 * 页面是薄壳：<body class="c1-layer-page" data-kind="…">，左栏 #c1Controls，舞台 #c1Stage。
 * 本引擎按 data-kind 生成控件、结果、知识要点与可视化，并提供「重置」与分步播放。
 * 三阶卡、价值引领由 shared/ai-tutor.js 统一注入，本引擎不再绘制层级导航。
 *
 *   sieve          1.2.2 基础层  埃氏筛 + 点击看唯一分解
 *   factor_rsa     1.2.2 拓展层  相乘容易 / 分解困难（试除）+ 可逆元
 *   linear_congruence 1.2.3 基础层  ax≡b (mod m) 有解判据与解数
 *   crt            1.2.3 拓展层  物不知数：逐个约束筛选 + 构造公式
 *   phi            1.2.4 基础层  欧拉函数计数与公式
 *   fermat_test    1.2.4 拓展层  费马测试 / 伪素数 / 模幂周期
 *   hash_table     1.3.1 基础层  h(k)=k mod m 分桶
 *   hash_avalanche 1.3.1 拓展层  SHA-256 雪崩效应
 *   lcg            1.3.2 基础层  线性同余序列与周期
 *   monte_carlo    1.3.2 拓展层  蒙特卡洛估 π：LCG 与 CSPRNG
 *   checksum       1.3.3 基础层  ISBN-10 / Luhn 校验位与检错
 *   hamming        1.3.3 拓展层  汉明 (7,4) 码纠错
 *   rsa_concept    1.3.4 基础层  公钥锁 / 私钥钥匙 / 单向难度
 *   signature      1.3.4 拓展层  RSA 数字签名与验证
 * ========================================================================== */
(function () {
    'use strict';

    /* ---------------- 数论工具 ---------------- */
    function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
    function egcd(a, b) { if (!b) return [a, 1, 0]; var r = egcd(b, a % b); return [r[0], r[2], r[1] - Math.floor(a / b) * r[2]]; }
    function modInv(a, m) { var r = egcd(((a % m) + m) % m, m); return r[0] === 1 ? ((r[1] % m) + m) % m : null; }
    function modPow(a, e, m) { var r = 1 % m, b = ((a % m) + m) % m; while (e > 0) { if (e & 1) r = (r * b) % m; b = (b * b) % m; e = Math.floor(e / 2); } return r; }
    function isPrime(n) { if (n < 2) return false; for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
    function factorize(n) { var f = [], d = 2; while (d * d <= n) { var k = 0; while (n % d === 0) { n /= d; k++; } if (k) f.push([d, k]); d++; } if (n > 1) f.push([n, 1]); return f; }
    function sup(k) { return k > 1 ? '<sup>' + k + '</sup>' : ''; }
    function factorHtml(f) { return f.map(function (x) { return x[0] + sup(x[1]); }).join(' × '); }
    function phi(n) { var r = n; factorize(n).forEach(function (x) { r = r / x[0] * (x[0] - 1); }); return r; }
    function mulOrder(a, n) { if (gcd(a, n) !== 1) return null; var x = a % n, k = 1; while (x !== 1 % n) { x = (x * a) % n; k++; if (k > n) return null; } return k; }
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function toy32(s) { var h = 2166136261 >>> 0; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995) >>> 0; h ^= h >>> 15; return h >>> 0; }
    function hex(bytes) { return Array.prototype.map.call(bytes, function (b) { return b.toString(16).padStart(2, '0'); }).join(''); }
    function bitsOf(bytes) { var s = ''; for (var i = 0; i < bytes.length; i++) s += bytes[i].toString(2).padStart(8, '0'); return s; }

    /* ---------------- DOM 小工具 ---------------- */
    var $ = function (id) { return document.getElementById(id); };
    var V = {};          // 当前控件值
    var DEF = {};        // 默认值（重置用）
    var player = { step: 0, total: 0, timer: null };

    function num(id) { return +V[id]; }
    function legendHtml(items) {
        return (items || []).map(function (it) { return '<span><i style="background:' + it[0] + '"></i>' + it[1] + '</span>'; }).join('');
    }
    var LG = {
        red: 'linear-gradient(135deg,#D63B1D,#B8321A)', green: 'linear-gradient(135deg,#2FB36B,#1F9D55)',
        gold: 'linear-gradient(135deg,#FFC733,#FFB400)', muted: '#f3ebe4', white: '#fff', soft: 'rgba(255,180,0,.3)', bad: 'rgba(192,57,43,.18)'
    };
    function setResult(formula, value, extra, tone) {
        $('c1Formula').innerHTML = formula;
        var v = $('c1Value'); v.innerHTML = value; v.className = tone || '';
        $('c1Extra').innerHTML = extra || '';
    }
    function setNote(id, html, warn) { var n = $(id + 'Note'); if (!n) return; n.innerHTML = html || ''; n.className = 'c1-note' + (warn ? ' warn' : ''); n.hidden = !html; }
    function viz(html) { $('vizArea').innerHTML = html; }
    function explain(html) { $('c1Explain').innerHTML = html || ''; }

    /* =====================================================================
     * 各互动定义
     * ===================================================================== */
    var KINDS = {};

    /* ---------- 1.2.2 基础层：埃氏筛 + 唯一分解 ---------- */
    KINDS.sieve = {
        title: '埃氏筛与唯一分解',
        lead: '从 2 开始，每找到一个素数就划去它的倍数；剩下的就是素数。点任意一个数，看它唯一的素因子分解。',
        badge: '低门槛 · 建立直觉',
        controls: [{ type: 'range', id: 'n', label: '筛选范围 2 ~ n', min: 20, max: 120, value: 60 }],
        legend: [[LG.gold, '当前素数 p'], [LG.red, '素数'], [LG.muted, '已划去的合数'], [LG.white, '待判定']],
        knowledge: [
            '<b>素数</b>：大于 1，且只有 1 和自身两个正因子的整数；1 既不是素数也不是合数。',
            '<b>埃氏筛</b>：只需用不超过 <code>√n</code> 的素数去划倍数，且可从 <code>p²</code> 开始划。',
            '<b>算术基本定理</b>：每个大于 1 的整数都能写成素数之积，且不计顺序时写法唯一。'
        ],
        steps: function () { var n = num('n'), c = 0; for (var p = 2; p * p <= n; p++) if (isPrime(p)) c++; return c + 1; },
        pick: 0,
        render: function (step) {
            var n = num('n'), total = player.total, primesUsed = [];
            for (var p = 2; p * p <= n; p++) if (isPrime(p)) primesUsed.push(p);
            var done = step >= total - 1, cur = done ? null : primesUsed[step] || null;
            var killer = {};
            primesUsed.slice(0, done ? primesUsed.length : step + 1).forEach(function (q) { for (var m = q * q; m <= n; m += q) if (!killer[m]) killer[m] = q; });
            var pick = this.pick && this.pick <= n ? this.pick : 0, cells = '', cnt = 0;
            for (var i = 2; i <= n; i++) {
                var cls = 'c1-cell', extra = '';
                if (i === cur) cls += ' cur';
                else if (killer[i]) { cls += ' muted'; extra = '<span class="strike">×' + killer[i] + '</span>'; }
                else if (done || i < cur * cur) cls += ' hot';
                if (i === pick) cls += ' sel';
                if (done && !killer[i]) cnt++;
                cells += '<button type="button" class="' + cls + '" data-v="' + i + '" aria-label="' + i + '">' + i + extra + '</button>';
            }
            viz('<div class="c1-grid dense" id="c1SieveGrid">' + cells + '</div>');
            var self = this;
            $('c1SieveGrid').onclick = function (e) { var b = e.target.closest('[data-v]'); if (!b) return; self.pick = +b.dataset.v; self.render(player.step); };
            var line;
            if (done) line = '<p><b>筛选完成</b>：不超过 √' + n + ' ≈ ' + Math.sqrt(n).toFixed(2) + ' 的素数 ' + primesUsed.join('、') + ' 都已用过，剩下的红色格子全是素数。</p>';
            else line = '<p>第 ' + (step + 1) + ' 步：<b>p = ' + cur + '</b> 是素数，从 ' + cur + '² = ' + cur * cur + ' 起划去它的倍数（更小的倍数已被更小的素数划过）。</p>';
            if (pick) {
                var f = factorize(pick);
                line += '<p>你选中了 <b>' + pick + '</b>：' + (isPrime(pick) ? pick + ' 是素数，它自己就是“数的原子”。' : pick + ' = ' + factorHtml(f) + '，这是它唯一的素因子分解。') + '</p>';
            } else line += '<p>提示：点任意一个数，查看它的素因子分解。</p>';
            explain(line);
            if (done) setResult('π(' + n + ') = ' + cnt, cnt + ' 个素数', '划去 ' + (n - 1 - cnt) + ' 个合数，只用了 ' + primesUsed.length + ' 个素数作“筛子”。');
            else setResult('当前筛子 p = ' + cur, '第 ' + (step + 1) + ' / ' + total + ' 步', '继续“下一步”或“自动播放”看完整筛选过程。');
        }
    };

    /* ---------- 1.2.2 拓展层：相乘容易、分解困难 ---------- */
    KINDS.factor_rsa = {
        title: '相乘容易 · 分解困难',
        lead: '已知 p、q 求 n = pq 只要一次乘法；只给 n 想找回 p、q，就得逐个试除——这种“单向难度”支撑着 RSA。',
        badge: '高天花板 · 迁移工程',
        controls: [
            { type: 'select', id: 'p', label: '素数 p', options: [5, 11, 13, 17, 19, 23], value: 11 },
            { type: 'select', id: 'q', label: '素数 q', options: [7, 13, 17, 19, 29, 31], value: 17 }
        ],
        legend: [[LG.muted, '试除失败'], [LG.red, '找到因子'], [LG.gold, '公开 n'], [LG.green, '与 φ(n) 互素的 e']],
        knowledge: [
            '<b>正向</b>：n = p·q，一次乘法。<b>逆向</b>：只知 n，最朴素的做法要试除到 <code>√n</code>。',
            '<b>规模</b>：n 每多 2 位十进制数，<code>√n</code> 约扩大 10 倍；实际 RSA 模数长达数百位，试除完全不可行。',
            '<b>可逆元</b>：gcd(e, φ(n)) = 1 时 e 在模 φ(n) 下可逆，逆元 d 就是私钥——而求 φ(n) 需要先知道 p、q。'
        ],
        render: function () {
            var p = num('p'), q = num('q'), n = p * q, ph = (p - 1) * (q - 1), lim = Math.floor(Math.sqrt(n));
            setNote('q', p === q ? 'p = q 时 n = p²，很容易被开方破解；RSA 要求 p ≠ q。' : '', true);
            var cells = '', found = 0, tries = 0;
            for (var d = 2; d <= lim; d++) {
                var hit = n % d === 0 && !found; if (!found) tries++;
                if (hit) found = d;
                cells += '<div class="c1-cell ' + (hit ? 'hot' : (found ? '' : 'muted')) + '">' + d + '<small>' + (hit ? '整除!' : (found ? '未试' : n % d)) + '</small></div>';
            }
            var e = [3, 5, 7, 11, 13, 17, 19, 23].filter(function (x) { return gcd(x, ph) === 1; })[0], dd = modInv(e, ph);
            viz('<div class="c1-flow">' +
                '<div class="c1-node pri"><b>私密 p</b><span>' + p + '</span></div><div class="c1-arrow">×</div>' +
                '<div class="c1-node pri"><b>私密 q</b><span>' + q + '</span></div><div class="c1-arrow">→</div>' +
                '<div class="c1-node pub"><b>公开 n = pq</b><span>' + n + '</span><em>1 次乘法</em></div>' +
                '<div class="c1-node"><b>φ(n) = (p−1)(q−1)</b><span>' + ph + '</span><em>需知道 p、q</em></div>' +
                '<div class="c1-node ok"><b>e 与逆元 d</b><span>e=' + e + ', d=' + dd + '</span><em>e·d ≡ 1 (mod ' + ph + ')</em></div></div>' +
                '<div class="c1-card"><h4>逆向：从 n = ' + n + ' 试除 d = 2 … ⌊√n⌋ = ' + lim + '（小字为余数 n mod d）</h4><div class="c1-grid dense" style="margin-top:6px">' + cells + '</div></div>');
            explain('<p>试到 <b>d = ' + found + '</b> 才整除，共做了 <b>' + tries + '</b> 次除法：' + n + ' = ' + found + ' × ' + (n / found) + '。</p>' +
                '<p>验证可逆元：' + e + ' × ' + dd + ' = ' + e * dd + ' = ' + Math.floor(e * dd / ph) + ' × ' + ph + ' + 1。攻击者不知道 p、q，就算不出 φ(n)，也就求不出 d。</p>');
            setResult(n + ' = ' + found + ' × ' + n / found, tries + ' 次试除', '正向只需 1 次乘法；逆向要试除到 √n ≈ ' + Math.sqrt(n).toFixed(1) + '。');
        }
    };

    /* ---------- 1.2.3 基础层：一次同余方程 ---------- */
    KINDS.linear_congruence = {
        title: '一次同余方程 ax ≡ b (mod m)',
        lead: '把 x = 0, 1, …, m−1 逐个代入，看 a·x mod m 何时等于 b mod m；再用 gcd(a, m) 预先判断有没有解、有几个解。',
        badge: '低门槛 · 建立直觉',
        controls: [
            { type: 'range', id: 'a', label: 'a', min: 1, max: 20, value: 4 },
            { type: 'range', id: 'b', label: 'b', min: 0, max: 20, value: 2 },
            { type: 'range', id: 'm', label: 'm', min: 3, max: 24, value: 10 }
        ],
        legend: [[LG.gold, '正在代入'], [LG.green, '是解'], [LG.white, '不是解'], [LG.muted, '尚未代入']],
        knowledge: [
            '<b>有解判据</b>：记 g = gcd(a, m)，方程 ax ≡ b (mod m) 有解 ⇔ <code>g | b</code>。',
            '<b>解的个数</b>：有解时，在 0 ~ m−1 中恰有 <b>g</b> 个解，彼此相差 m/g。',
            '<b>唯一解</b>：g = 1 时 a 有模 m 逆元，唯一解 x ≡ a⁻¹·b (mod m)。'
        ],
        steps: function () { return num('m') + 1; },
        render: function (step) {
            var a = num('a'), b = num('b'), m = num('m'), g = gcd(a, m), br = b % m, ok = br % g === 0, cells = '', sols = [];
            for (var x = 0; x < m; x++) {
                var r = (a * x) % m, hit = r === br; if (hit) sols.push(x);
                var cls = x < step ? (hit ? 'good' : '') : (x === step ? 'cur' : 'muted');
                cells += '<div class="c1-cell ' + cls + '">x=' + x + '<small>' + (x <= step ? a + 'x≡' + r : '?') + '</small></div>';
            }
            viz('<div class="c1-grid">' + cells + '</div>');
            var done = step >= m, found = sols.filter(function (x) { return x < step; });
            explain('<p>判据先行：g = gcd(' + a + ', ' + m + ') = <b>' + g + '</b>，b mod m = ' + br + '，' + (ok ? g + ' | ' + br + '，所以<span class="c1-ok">有解</span>，而且恰有 ' + g + ' 个解（相差 ' + m / g + '）。' : g + ' ∤ ' + br + '，所以<span class="c1-no">无解</span>——不用逐个试也能断定。') + '</p>' +
                (g === 1 ? '<p>这里 g = 1：a 的逆元 a⁻¹ ≡ ' + modInv(a, m) + ' (mod ' + m + ')，唯一解 x ≡ ' + modInv(a, m) + ' × ' + br + ' ≡ ' + (modInv(a, m) * br) % m + ' (mod ' + m + ')。</p>' : '') +
                (done ? '' : '<p>正在代入 x = ' + step + '，已找到的解：' + (found.length ? found.join('、') : '暂无') + '。</p>'));
            if (!ok) setResult(a + 'x ≡ ' + b + ' (mod ' + m + ')', '无解', 'gcd(' + a + ', ' + m + ') = ' + g + ' ∤ ' + br, 'no');
            else setResult(a + 'x ≡ ' + b + ' (mod ' + m + ')', done ? 'x ∈ {' + sols.join(', ') + '}' : '有 ' + g + ' 个解', 'gcd(' + a + ', ' + m + ') = ' + g + '，' + g + ' | ' + br + (done ? '' : '；继续代入找出它们'), 'ok');
        }
    };

    /* ---------- 1.2.3 拓展层：中国剩余定理（物不知数） ---------- */
    KINDS.crt = {
        title: '物不知数 · 中国剩余定理',
        lead: '《孙子算经》：“今有物不知其数，三三数之剩二，五五数之剩三，七七数之剩二，问物几何？”逐个加入约束，看 0~104 中的候选如何缩到唯一。',
        badge: '高天花板 · 迁移工程',
        controls: [
            { type: 'select', id: 'r3', label: 'x mod 3 =', options: [0, 1, 2], value: 2 },
            { type: 'select', id: 'r5', label: 'x mod 5 =', options: [0, 1, 2, 3, 4], value: 3 },
            { type: 'select', id: 'r7', label: 'x mod 7 =', options: [0, 1, 2, 3, 4, 5, 6], value: 2 }
        ],
        legend: [[LG.soft, '满足已加入的约束'], [LG.red, '唯一解'], [LG.muted, '被排除']],
        knowledge: [
            '<b>定理</b>：m₁, …, mₖ 两两互素时，方程组 x ≡ rᵢ (mod mᵢ) 在模 M = m₁m₂…mₖ 下<b>有且仅有一个解</b>。',
            '<b>构造</b>：Mᵢ = M/mᵢ，yᵢ ≡ Mᵢ⁻¹ (mod mᵢ)，x ≡ Σ rᵢMᵢyᵢ (mod M)。',
            '<b>工程</b>：RSA 解密用 CRT 把模 n 的大运算拆成模 p、模 q 两个小运算，再合并；大数运算也可按余数分给多路并行计算。'
        ],
        steps: function () { return 4; },
        render: function (step) {
            var r = [num('r3'), num('r5'), num('r7')], mods = [3, 5, 7], M = 105, sol = -1, cells = '';
            for (var x = 0; x < M; x++) if (x % 3 === r[0] && x % 5 === r[1] && x % 7 === r[2]) { sol = x; break; }
            var k = Math.min(step, 3), cand = 0;
            for (x = 0; x < M; x++) {
                var okAll = true; for (var i = 0; i < k; i++) if (x % mods[i] !== r[i]) okAll = false;
                if (okAll) cand++;
                var cls = k === 3 && x === sol ? 'hot' : (k === 0 ? '' : (okAll ? 'soft' : 'muted'));
                cells += '<div class="c1-cell ' + cls + '">' + x + '</div>';
            }
            var Mi = [35, 21, 15], yi = Mi.map(function (v, i) { return modInv(v, mods[i]); });
            var terms = Mi.map(function (v, i) { return r[i] + '×' + v + '×' + yi[i]; }).join(' + '), sum = Mi.reduce(function (s, v, i) { return s + r[i] * v * yi[i]; }, 0);
            viz('<div class="c1-flow">' + mods.map(function (m, i) {
                return '<div class="c1-node' + (i < k ? ' ok' : '') + '"><b>约束 ' + (i + 1) + '</b><span>x ≡ ' + r[i] + ' (mod ' + m + ')</span><em>' + (i < k ? '已加入' : '待加入') + '</em></div>';
            }).join('') + '</div><div class="c1-grid dense">' + cells + '</div>');
            var msg = ['<p>尚未加入约束：0 ~ 104 共 105 个候选。点“下一步”依次加入三个约束。</p>',
                '<p>加入 x ≡ ' + r[0] + ' (mod 3)：剩 <b>' + cand + '</b> 个候选（每 3 个留 1 个）。</p>',
                '<p>再加入 x ≡ ' + r[1] + ' (mod 5)：剩 <b>' + cand + '</b> 个候选，它们相差 15 = 3×5。</p>',
                '<p>三个约束都加入后只剩 <b>x = ' + sol + '</b>。构造公式：x ≡ ' + terms + ' = ' + sum + ' ≡ <b>' + sol + '</b> (mod 105)。</p>' +
                '<p>明代程大位《算法统宗》歌诀：“三人同行七十稀，五树梅花廿一支，七子团圆正半月，除百零五便得知”——70 = 35×2、21 = 21×1、15 = 15×1 正是上式中的 Mᵢyᵢ。</p>'];
            explain(msg[k]);
            setResult('M = 3×5×7 = 105', k === 3 ? 'x ≡ ' + sol + ' (mod 105)' : '候选 ' + cand + ' 个', k === 3 ? '两两互素 ⇒ 模 105 下唯一解；所有解为 ' + sol + ' + 105t。' : '已加入 ' + k + ' / 3 个约束。', k === 3 ? 'ok' : '');
        }
    };

    /* ---------- 1.2.4 基础层：欧拉函数 ---------- */
    KINDS.phi = {
        title: '欧拉函数 φ(n)',
        lead: '在 1 ~ n 中数出与 n 互素的整数——它们构成模 n 的既约剩余系，个数就是 φ(n)。',
        badge: '低门槛 · 建立直觉',
        controls: [{ type: 'range', id: 'n', label: 'n', min: 2, max: 60, value: 18 }],
        legend: [[LG.green, '与 n 互素'], [LG.muted, '与 n 有公因子']],
        knowledge: [
            '<b>定义</b>：φ(n) = |{ k : 1 ≤ k ≤ n, gcd(k, n) = 1 }|。',
            '<b>素数</b>：p 为素数时 φ(p) = p − 1；素数幂 φ(pᵏ) = pᵏ − pᵏ⁻¹。',
            '<b>积性</b>：gcd(m, n) = 1 时 φ(mn) = φ(m)φ(n)；一般地 <code>φ(n) = n ∏(1 − 1/p)</code>，p 取遍 n 的素因子。'
        ],
        render: function () {
            var n = num('n'), c = 0, cells = '';
            for (var i = 1; i <= n; i++) { var g = gcd(i, n), co = g === 1; if (co) c++; cells += '<div class="c1-cell ' + (co ? 'good' : 'muted') + '">' + i + (co ? '' : '<small>gcd ' + g + '</small>') + '</div>'; }
            var f = factorize(n), ps = f.map(function (x) { return x[0]; });
            viz('<div class="c1-grid">' + cells + '</div>');
            explain('<p>分解：' + n + ' = ' + factorHtml(f) + '，公式 φ(' + n + ') = ' + n + ps.map(function (p) { return ' × (1 − 1/' + p + ')'; }).join('') + ' = <b>' + phi(n) + '</b>，与逐个数出的 ' + c + ' 个一致。</p>' +
                (isPrime(n) ? '<p>' + n + ' 是素数，1 ~ ' + (n - 1) + ' 都与它互素，所以 φ(' + n + ') = ' + (n - 1) + '。</p>' : '<p>被划掉的数都与 ' + n + ' 共享素因子 ' + ps.join(' 或 ') + '。</p>'));
            setResult('φ(' + n + ') = ' + n + ps.map(function (p) { return '(1−1/' + p + ')'; }).join(''), c, '绿色的 ' + c + ' 个数构成模 ' + n + ' 的既约剩余系。', 'ok');
        }
    };

    /* ---------- 1.2.4 拓展层：费马测试与伪素数 ---------- */
    KINDS.fermat_test = {
        title: '费马测试 · 伪素数 · 模幂周期',
        lead: '费马小定理：p 为素数且 p ∤ a 时 a^(p−1) ≡ 1 (mod p)。反过来用它测试 n：只要有一个 a 使 a^(n−1) ≢ 1，n 必为合数。',
        badge: '高天花板 · 迁移工程',
        controls: [
            { type: 'select', id: 'n', label: '待测 n', options: [[13, '13'], [97, '97'], [15, '15'], [91, '91 = 7×13'], [341, '341 = 11×31'], [561, '561 = 3×11×17']], value: 341 },
            { type: 'range', id: 'a', label: '观察周期的底数 a', min: 2, max: 20, value: 2 }
        ],
        legend: [[LG.green, 'a^(n−1) ≡ 1'], [LG.red, '≢ 1：合数见证'], [LG.muted, 'gcd(a,n) > 1'], [LG.gold, '回到 1 的位置']],
        knowledge: [
            '<b>欧拉定理</b>：gcd(a, n) = 1 时 a^φ(n) ≡ 1 (mod n)；n 为素数时即费马小定理。',
            '<b>伪素数</b>：341 = 11×31 满足 2³⁴⁰ ≡ 1 (mod 341)，能骗过底数 2；<b>卡迈克尔数</b> 561 能骗过所有与它互素的底数。',
            '<b>RSA 正确性</b>：e·d = 1 + kφ(n)，故 m^(ed) = m·(m^φ(n))ᵏ ≡ m (mod n)。'
        ],
        render: function () {
            var n = num('n'), a = num('a'), top = Math.min(n - 1, 40), cells = '', witness = null, liars = 0, tested = 0;
            for (var b = 2; b <= top; b++) {
                var g = gcd(b, n), v = modPow(b, n - 1, n), cls;
                if (g > 1) cls = 'muted'; else { tested++; if (v === 1) { cls = 'good'; liars++; } else { cls = 'hot'; if (witness === null) witness = b; } }
                cells += '<div class="c1-cell ' + cls + '">' + b + '<small>→ ' + v + '</small></div>';
            }
            var comp = !isPrime(n), ord = mulOrder(a % n, n), row = '', K = ord ? Math.min(Math.max(ord + 1, 12), 42) : 12;
            for (var k = 1; k <= K; k++) { var val = modPow(a, k, n); row += '<div class="c1-cell ' + (val === 1 ? 'cur' : '') + '">' + a + '<sup>' + k + '</sup><small>≡ ' + val + '</small></div>'; }
            viz('<div class="c1-card"><h4>对 a = 2 … ' + top + ' 计算 a^(n−1) mod ' + n + '（小字为结果）</h4><div class="c1-grid dense" style="margin-top:6px">' + cells + '</div></div>' +
                '<div class="c1-card"><h4>底数 a = ' + a + ' 的幂在模 ' + n + ' 下' + (ord ? '以阶 ' + ord + ' 循环' : '（gcd(' + a + ', ' + n + ') ≠ 1，永远回不到 1）') + (ord && ord + 1 > K ? '（只显示前 ' + K + ' 项）' : '') + '</h4><div class="c1-grid dense" style="margin-top:6px">' + row + '</div></div>');
            var verdict, tone;
            if (witness !== null) { verdict = '合数'; tone = 'no'; }
            else if (comp) { verdict = '伪素数！'; tone = 'no'; }
            else { verdict = '可能是素数'; tone = 'ok'; }
            explain(witness !== null ?
                '<p>底数 <b>' + witness + '</b> 使 ' + witness + '^' + (n - 1) + ' ≢ 1 (mod ' + n + ')，它是“合数见证”，n = ' + n + ' 一定是合数' + (liars ? '；但也有 ' + liars + ' 个底数（绿色）会“撒谎”，所以只用一个底数并不可靠。' : '。') + '</p>' :
                (comp ? '<p>所有与 ' + n + ' 互素的底数都通过了测试，可 ' + n + ' = ' + factorHtml(factorize(n)) + ' 是合数——这就是<b>卡迈克尔数</b>。实际系统改用 Miller–Rabin 等更强的概率测试。</p>' :
                    '<p>' + tested + ' 个互素底数全部通过，而 ' + n + ' 确实是素数。费马测试“通过”只说明<b>可能</b>是素数，“不通过”才是确定结论。</p>') +
                (ord ? '<p>a = ' + a + ' 的阶为 ' + ord + '，它整除 φ(' + n + ') = ' + phi(n) + '，这正是欧拉定理的周期来源。</p>' : ''));
            setResult('a^(' + (n - 1) + ') mod ' + n, verdict, witness !== null ? '见证 a = ' + witness + '；' + liars + ' 个底数撒谎。' : (comp ? n + ' 是合数，却骗过了测试。' : '测试 ' + tested + ' 个底数全部通过。'), tone);
        }
    };

    /* ---------- 1.3.1 基础层：哈希分桶 ---------- */
    var HASH_KEYS = [583, 217, 964, 305, 741, 128, 872, 459, 690, 336, 815, 102, 947, 264, 578, 731, 49, 623, 380, 906, 157, 492, 718, 265, 834, 371, 610, 998, 143, 527, 786, 412];
    KINDS.hash_table = {
        title: '哈希映射：键 → 桶',
        lead: '用 h(k) = k mod m 把键放进 m 个桶。改变桶数与键的规律，观察分布是否均匀、哪里发生冲突。',
        badge: '低门槛 · 建立直觉',
        controls: [
            { type: 'range', id: 'm', label: '桶数 m', min: 5, max: 17, value: 7 },
            { type: 'range', id: 'k', label: '键数量', min: 6, max: 32, value: 16 },
            { type: 'select', id: 'set', label: '键的规律', options: [['rand', '随机学号尾号'], ['step10', '10 的倍数（10, 20, 30…）']], value: 'rand' }
        ],
        legend: [[LG.red, '发生冲突的桶内元素'], ['rgba(255,180,0,.3)', '独占一桶']],
        knowledge: [
            '<b>哈希函数</b>：确定性（同一键永远进同一桶）、计算快、分布尽量均匀。',
            '<b>冲突必然</b>：键数 > 桶数时，由鸽巢原理必有两个键落入同一桶。',
            '<b>模数取素数</b>：键常有规律（如都是 10 的倍数），m 与规律有公因子时键会挤进少数几个桶；取素数 m 更均匀。'
        ],
        render: function () {
            var m = num('m'), k = num('k'), keys = [];
            for (var i = 0; i < k; i++) keys.push(V.set === 'step10' ? 10 * (i + 1) : HASH_KEYS[i]);
            var buckets = []; for (i = 0; i < m; i++) buckets.push([]);
            keys.forEach(function (x) { buckets[x % m].push(x); });
            var coll = buckets.filter(function (b) { return b.length > 1; }).length, empty = buckets.filter(function (b) { return !b.length; }).length, maxLen = Math.max.apply(null, buckets.map(function (b) { return b.length; }));
            viz('<div class="c1-buckets">' + buckets.map(function (b, i) {
                return '<div class="c1-bucket' + (b.length > 1 ? ' hit' : '') + '"><h5><span>桶 ' + i + '</span><span>' + b.length + '</span></h5>' + b.map(function (x) { return '<span class="c1-pill' + (b.length > 1 ? ' hot' : '') + '">' + x + '</span>'; }).join('') + '</div>';
            }).join('') + '</div>');
            var g = V.set === 'step10' ? gcd(10, m) : 1;
            explain('<p>' + k + ' 个键放进 ' + m + ' 个桶，装填因子 α = ' + k + '/' + m + ' = <b>' + (k / m).toFixed(2) + '</b>；' + (k > m ? '键数多于桶数，按鸽巢原理<b>必然</b>冲突。' : '键数不超过桶数，冲突仍可能发生，但不是必然。') + '</p>' +
                (V.set === 'step10' ? '<p>键都是 10 的倍数，gcd(10, ' + m + ') = ' + g + '：' + (g > 1 ? '键只能落进 ' + (m / g) + ' 个桶（编号是 ' + g + ' 的倍数），' + empty + ' 个桶空置——m 与键的规律有公因子时分布很差。' : m + ' 与 10 互素，键能铺满各桶。') + '</p>' : '<p>空桶 ' + empty + ' 个，最长的桶有 ' + maxLen + ' 个元素；查找最坏要比较 ' + maxLen + ' 次。</p>'));
            setResult('h(k) = k mod ' + m, coll + ' 个冲突桶', '最长链 ' + maxLen + '，空桶 ' + empty + '，α = ' + (k / m).toFixed(2) + '。', coll ? 'no' : 'ok');
        }
    };

    /* ---------- 1.3.1 拓展层：SHA-256 雪崩效应 ---------- */
    KINDS.hash_avalanche = {
        title: '数字指纹与雪崩效应',
        lead: '密码学哈希把任意长的消息压成固定长度的“指纹”。只改一个字符，输出的 256 位应当约有一半翻转。',
        badge: '高天花板 · 迁移工程',
        controls: [
            { type: 'text', id: 'msgA', label: '消息 A', value: 'DiscreteMath' },
            { type: 'text', id: 'msgB', label: '消息 B（试着只改一个字符）', value: 'DiscreteMath!' }
        ],
        legend: [[LG.red, '两者不同的位'], [LG.white, '相同的位']],
        knowledge: [
            '<b>抗碰撞</b>：输出只有 256 位而输入无穷多，碰撞必然存在（鸽巢原理），安全性在于<b>找不到</b>。',
            '<b>雪崩效应</b>：输入的微小改变使约 50% 的输出位翻转，无法从输出反推输入的相似程度。',
            '<b>应用</b>：文件校验、口令存储（加盐）、数字签名的摘要、区块链区块间的哈希链接。'
        ],
        render: function () {
            var A = V.msgA, B = V.msgB, token = (this._t = (this._t || 0) + 1), self = this;
            var subtle = window.crypto && window.crypto.subtle;
            function show(ha, hb, algo, nb) {
                if (token !== self._t) return;
                var ba = bitsOf(ha), bb = bitsOf(hb), diff = 0, bits = '', xa = hex(ha), xb = hex(hb), hxb = '';
                for (var i = 0; i < ba.length; i++) { var d = ba[i] !== bb[i]; if (d) diff++; bits += '<span class="c1-bit' + (d ? ' diff' : '') + '">' + bb[i] + '</span>'; }
                for (i = 0; i < xb.length; i++) hxb += xa[i] !== xb[i] ? '<span class="d">' + xb[i] + '</span>' : xb[i];
                viz('<div class="c1-row"><div class="c1-card"><h4>' + algo + '(A)</h4><div class="c1-hex">' + xa + '</div></div><div class="c1-card"><h4>' + algo + '(B)（红色为不同的十六进制位）</h4><div class="c1-hex">' + hxb + '</div></div></div>' +
                    '<div class="c1-card"><h4>逐位比较：' + nb + ' 位中有 ' + diff + ' 位不同</h4><div class="c1-bits" style="margin-top:6px' + (nb < 64 ? ';grid-template-columns:repeat(8,minmax(0,1fr));max-width:280px' : '') + '">' + bits + '</div></div>');
                var pct = (100 * diff / nb).toFixed(1);
                explain(A === B ? '<p>两条消息完全相同，哈希也完全相同——哈希函数是<b>确定性</b>的。</p>' :
                    '<p>A 与 B 只差一点点，却有 <b>' + diff + ' / ' + nb + '（' + pct + '%）</b> 位不同，接近理想的 50%。这使得“改一个字而指纹不变”在计算上不可行。</p>' + (algo !== 'SHA-256' ? '<p>当前浏览器不支持 Web Crypto，改用 32 位教学哈希演示；真实系统使用 SHA-256 等标准算法。</p>' : ''));
                setResult(algo + '(A) ⊕ ' + algo + '(B)', diff + ' / ' + nb + ' 位不同', A === B ? '输入相同 ⇒ 输出相同。' : '翻转比例 ' + pct + '%。', A === B ? '' : 'ok');
            }
            function toyBytes(s) { var h = toy32(s); return [h >>> 24, (h >>> 16) & 255, (h >>> 8) & 255, h & 255]; }
            if (subtle && window.TextEncoder) {
                var enc = new TextEncoder();
                Promise.all([subtle.digest('SHA-256', enc.encode(A)), subtle.digest('SHA-256', enc.encode(B))])
                    .then(function (r) { show(new Uint8Array(r[0]), new Uint8Array(r[1]), 'SHA-256', 256); })
                    .catch(function () { show(toyBytes(A), toyBytes(B), '教学哈希', 32); });
            } else show(toyBytes(A), toyBytes(B), '教学哈希', 32);
        }
    };

    /* ---------- 1.3.2 基础层：线性同余发生器 ---------- */
    KINDS.lcg = {
        title: '线性同余发生器 LCG',
        lead: '从种子 X₀ 出发，反复计算 Xₙ₊₁ = (a·Xₙ + c) mod m。序列看似杂乱，其实完全由参数决定，而且迟早会循环。',
        badge: '低门槛 · 建立直觉',
        controls: [
            { type: 'range', id: 'm', label: '模数 m', min: 5, max: 32, value: 16 },
            { type: 'range', id: 'a', label: '乘数 a', min: 1, max: 15, value: 5 },
            { type: 'range', id: 'c', label: '增量 c', min: 0, max: 15, value: 3 },
            { type: 'range', id: 'seed', label: '种子 X₀', min: 0, max: 15, value: 1 }
        ],
        legend: [[LG.gold, '当前项'], [LG.red, '种子'], [LG.green, '重复出现：进入循环']],
        knowledge: [
            '<b>确定性</b>：同样的 a、c、m 与种子，永远生成同样的序列——可复现，便于调试与复查实验。',
            '<b>必然循环</b>：Xₙ 只有 m 种取值，至多 m 步内必出现重复（鸽巢原理），之后周期性重复。',
            '<b>满周期</b>（Hull–Dobell）：c ≠ 0 时周期达到 m ⇔ gcd(c, m) = 1、a−1 被 m 的每个素因子整除、4 | m 时 4 | a−1。'
        ],
        steps: function () { return this.seq().length + 1; },
        seq: function () {
            var m = num('m'), a = num('a'), c = num('c'), x = num('seed') % m, seen = {}, out = [];
            while (seen[x] === undefined) { seen[x] = out.length; out.push(x); x = (a * x + c) % m; }
            out.rep = x; out.start = seen[x]; return out;
        },
        render: function (step) {
            var m = num('m'), a = num('a'), c = num('c'), s = this.seq(), L = s.length, per = L - s.start, done = step >= L;
            var cells = s.map(function (v, i) {
                var cls = i > step ? 'muted' : (i === step ? 'cur' : (i === 0 ? 'hot' : ''));
                if (i === s.start && done) cls = 'good';
                return '<div class="c1-cell ' + cls + '">' + (i <= step ? v : '?') + '<small>X' + i + '</small></div>';
            }).join('') + (done ? '<div class="c1-cell good">' + s.rep + '<small>X' + L + ' 重复</small></div>' : '');
            var fs = factorize(m).map(function (x) { return x[0]; });
            var c1 = gcd(c, m) === 1, c2 = fs.every(function (p) { return (a - 1) % p === 0; }), c3 = m % 4 !== 0 || (a - 1) % 4 === 0;
            viz('<div class="c1-grid">' + cells + '</div>' +
                '<div class="c1-checks"><span class="c1-check ' + (c1 ? 'ok' : 'no') + '">' + (c1 ? '✓' : '✗') + ' gcd(c, m) = ' + gcd(c, m) + '</span>' +
                '<span class="c1-check ' + (c2 ? 'ok' : 'no') + '">' + (c2 ? '✓' : '✗') + ' m 的素因子 ' + fs.join('、') + ' 整除 a−1 = ' + (a - 1) + '</span>' +
                '<span class="c1-check ' + (c3 ? 'ok' : 'no') + '">' + (c3 ? '✓' : '✗') + ' ' + (m % 4 === 0 ? '4 | m，需 4 | a−1' : '4 ∤ m，此条自动满足') + '</span></div>');
            explain(done ? '<p>第 ' + L + ' 项回到了 X' + s.start + ' = ' + s.rep + '，此后序列按周期 <b>' + per + '</b> 循环' + (s.start ? '（前 ' + s.start + ' 项只出现一次，是“尾巴”）' : '') + '。' + (per === m ? '周期等于 m，达到<b>满周期</b>。' : '周期小于 m = ' + m + '，只用到了 ' + per + ' 个值。') + '</p><p>' + (c1 && c2 && c3 && c ? 'Hull–Dobell 三个条件全部满足，所以对任何种子都是满周期。' : 'Hull–Dobell 条件未全部满足，一般达不到满周期（换个种子试试）。') + '</p>'
                : '<p>X' + (step + 1) + ' = (' + a + ' × ' + s[step] + ' + ' + c + ') mod ' + m + ' = ' + (step + 1 < L ? s[step + 1] : s.rep) + '。继续“下一步”，直到某个值第二次出现。</p>');
            setResult('Xₙ₊₁ = (' + a + 'Xₙ + ' + c + ') mod ' + m, done ? '周期 ' + per : '已生成 ' + (step + 1) + ' 项', done ? (per === m ? '满周期：0 ~ ' + (m - 1) + ' 每个值恰好出现一次。' : '只覆盖 ' + per + ' / ' + m + ' 个值。') : '种子 X₀ = ' + s[0] + '。', done ? (per === m ? 'ok' : 'no') : '');
        }
    };

    /* ---------- 1.3.2 拓展层：蒙特卡洛与安全随机 ---------- */
    KINDS.monte_carlo = {
        title: '蒙特卡洛估算 π',
        lead: '在单位正方形内随机撒点，落进四分之一圆的比例约为 π/4。比较可复现的 LCG 与浏览器的密码学安全随机数。',
        badge: '高天花板 · 迁移工程',
        controls: [
            { type: 'select', id: 'src', label: '随机源', options: [['lcg', 'LCG（glibc 参数，可复现）'], ['csprng', 'crypto.getRandomValues（CSPRNG）']], value: 'lcg' },
            { type: 'range', id: 'N', label: '样本数', min: 100, max: 3000, step: 100, value: 800 },
            { type: 'range', id: 'seed', label: '种子（仅 LCG）', min: 1, max: 50, value: 7 }
        ],
        legend: [[LG.red, '落在圆内'], ['#9B7A68', '落在圆外']],
        knowledge: [
            '<b>估计量</b>：π ≈ 4 × 圆内点数 / 总点数；误差大约按 1/√N 缩小。',
            '<b>仿真用随机</b>：要统计性质好、可复现（固定种子），LCG 等 PRNG 即可。',
            '<b>安全用随机</b>：密钥、验证码、抽签洗牌要求<b>不可预测</b>，必须用 CSPRNG；LCG 只要观察到几项输出就能推算后续。'
        ],
        render: function () {
            var N = num('N'), src = V.src, x = num('seed') >>> 0, inside = 0, pts = '', rnd;
            setNote('seed', src === 'csprng' ? 'CSPRNG 不接受种子，每次重算结果都不同。' : '', false);
            if (src === 'csprng' && window.crypto && window.crypto.getRandomValues) {
                var buf = new Uint32Array(2 * N); window.crypto.getRandomValues(buf); var j = 0;
                rnd = function () { return buf[j++] / 4294967296; };
            } else {
                rnd = function () { x = (Math.imul(1103515245, x) + 12345) & 0x7fffffff; return x / 2147483648; };
            }
            for (var i = 0; i < N; i++) {
                var px = rnd(), py = rnd(), hit = px * px + py * py <= 1; if (hit) inside++;
                if (i < 1500) pts += '<circle cx="' + (px * 320).toFixed(1) + '" cy="' + ((1 - py) * 320).toFixed(1) + '" r="2.2" fill="' + (hit ? '#D63B1D' : '#9B7A68') + '" opacity=".72"/>';
            }
            var est = 4 * inside / N, err = Math.abs(est - Math.PI);
            viz('<div class="c1-row" style="align-items:center"><svg class="c1-svg" viewBox="0 0 320 320" role="img" aria-label="蒙特卡洛撒点图"><rect width="320" height="320" fill="rgba(255,255,255,.5)"/><path d="M0 320 A320 320 0 0 1 320 0 L0 0 Z" fill="rgba(255,180,0,.14)"/><path d="M0 320 A320 320 0 0 1 320 0" fill="none" stroke="#D63B1D" stroke-width="2"/>' + pts + '</svg>' +
                '<div class="c1-card"><h4>估计结果</h4><p>圆内 <b>' + inside + '</b> / ' + N + ' 点</p><p>π ≈ 4 × ' + inside + ' / ' + N + ' = <b>' + est.toFixed(4) + '</b></p><p>与 π = 3.1416 相差 ' + err.toFixed(4) + '</p><div class="c1-meter" style="margin-top:8px"><i style="width:' + Math.max(4, 100 - Math.min(100, err * 400)).toFixed(0) + '%"></i></div></div></div>');
            explain(src === 'lcg' ? '<p>LCG 参数 a = 1103515245、c = 12345、m = 2³¹（glibc 的经典参数）。固定种子 ' + num('seed') + '，无论何时何地重算都得到同样的 ' + est.toFixed(4) + '——科学仿真需要这种<b>可复现性</b>。</p><p>但正因为可复现，它不能用来生成密钥或决定抽签结果。</p>'
                : '<p>CSPRNG 从操作系统收集熵，输出不可预测、无法复现——这正是密钥、抽签、洗牌（如 Fisher–Yates 洗牌）需要的“公平”。</p>');
            setResult('π ≈ 4 × ' + inside + ' / ' + N, est.toFixed(4), '误差 ' + err.toFixed(4) + '；样本越多通常越准。', err < 0.05 ? 'ok' : '');
        }
    };

    /* ---------- 1.3.3 基础层：校验位思想 ---------- */
    KINDS.checksum = {
        title: '校验位：一位冗余当场查错',
        lead: '按规则给数字串加一位校验位。抄录时出错（改错一位、相邻两位换位），接收方重算即可发现。点击数字模拟抄错。',
        badge: '低门槛 · 建立直觉',
        controls: [
            { type: 'select', id: 'scheme', label: '校验方案', options: [['isbn', 'ISBN-10（mod 11）'], ['luhn', 'Luhn 算法（mod 10，银行卡）']], value: 'isbn' },
            { type: 'text', id: 'digits', label: '主体数字（ISBN 取前 9 位）', value: '730241805', mono: true }
        ],
        legend: [[LG.red, '校验位'], [LG.gold, '被改动的位'], [LG.white, '主体数字']],
        knowledge: [
            '<b>ISBN-10</b>：权重 10, 9, …, 2 乘前 9 位，校验位 c 使 <code>Σ wᵢdᵢ + c ≡ 0 (mod 11)</code>，c = 10 记作 X。',
            '<b>Luhn</b>：从校验位左边一位起向左每隔一位乘 2（两位数则减 9），总和加校验位 ≡ 0 (mod 10)。',
            '<b>检错能力</b>：ISBN-10 能查出所有单个错误和相邻换位；Luhn 能查出所有单个错误，相邻换位只漏掉 09↔90。'
        ],
        errPos: -1, swapPos: -1, lastKey: '',
        compute: function (scheme, base) {
            var ds = base.split('').map(Number), s = 0, parts = [];
            if (scheme === 'isbn') {
                ds.forEach(function (d, i) { var w = 10 - i; s += w * d; parts.push(d + '×' + w); });
                var c = (11 - s % 11) % 11; return { check: c === 10 ? 'X' : String(c), sum: s, parts: parts, formula: 'S = ' + s + '，c = (11 − S mod 11) mod 11' };
            }
            var rev = ds.slice().reverse();
            rev.forEach(function (d, i) { var v = d; if (i % 2 === 0) { v = d * 2; if (v > 9) v -= 9; } s += v; });
            var cl = (10 - s % 10) % 10; return { check: String(cl), sum: s, formula: 'S = ' + s + '，c = (10 − S mod 10) mod 10' };
        },
        verify: function (scheme, full) {
            var ds = full.split('').map(function (ch) { return ch === 'X' ? 10 : +ch; }), s = 0;
            if (scheme === 'isbn') { ds.forEach(function (d, i) { s += (10 - i) * d; }); return { ok: s % 11 === 0, s: s, m: 11 }; }
            ds.reverse().forEach(function (d, i) { var v = d; if (i % 2 === 1) { v = d * 2; if (v > 9) v -= 9; } s += v; });
            return { ok: s % 10 === 0, s: s, m: 10 };
        },
        render: function () {
            var scheme = V.scheme, raw = String(V.digits).replace(/\D/g, '');
            if (scheme === 'isbn') raw = raw.slice(0, 9).padEnd(9, '0'); else raw = (raw || '0').slice(0, 18);
            var key = scheme + raw;
            if (key !== this.lastKey) { this.errPos = -1; this.swapPos = -1; this.lastKey = key; }
            var r = this.compute(scheme, raw), sent = raw + r.check, recv = sent.split('');
            if (this.errPos >= 0) recv[this.errPos] = String((+recv[this.errPos] + 1) % 10);
            if (this.swapPos >= 0) { var t = recv[this.swapPos]; recv[this.swapPos] = recv[this.swapPos + 1]; recv[this.swapPos + 1] = t; }
            var got = recv.join(''), vr = this.verify(scheme, got), changed = got !== sent;
            var cells = recv.map(function (ch, i) {
                var isCheck = i === recv.length - 1, diff = ch !== sent[i];
                return '<button type="button" class="c1-cell ' + (diff ? 'cur' : (isCheck ? 'hot' : '')) + '" data-i="' + i + '"' + (isCheck ? ' disabled' : '') + '>' + ch + '<small>' + (isCheck ? '校验' : (scheme === 'isbn' ? '×' + (10 - i) : '第' + (i + 1) + '位')) + '</small></button>';
            }).join('');
            viz('<div class="c1-card"><h4>发送方：主体 ' + raw + ' → 校验位 ' + r.check + '（' + r.formula + '）</h4></div>' +
                '<div class="c1-grid" id="c1CkGrid">' + cells + '</div>' +
                '<div class="c1-flow"><button type="button" class="c1-btn secondary" id="c1Swap">⇄ 模拟相邻换位</button><button type="button" class="c1-btn ghost" id="c1Fix">↺ 恢复正确号码</button></div>');
            var self = this;
            $('c1CkGrid').onclick = function (e) { var b = e.target.closest('[data-i]'); if (!b || b.disabled) return; self.swapPos = -1; self.errPos = +b.dataset.i; self.render(); };
            $('c1Swap').onclick = function () {
                self.errPos = -1; var n = raw.length, tries = 0; if (n < 2) return;
                do { self.swapPos = (self.swapPos + 1) % (n - 1); tries++; } while (sent[self.swapPos] === sent[self.swapPos + 1] && tries < n);
                self.render();
            };
            $('c1Fix').onclick = function () { self.errPos = -1; self.swapPos = -1; self.render(); };
            var what = this.errPos >= 0 ? '第 ' + (this.errPos + 1) + ' 位抄错' : (this.swapPos >= 0 ? '第 ' + (this.swapPos + 1) + '、' + (this.swapPos + 2) + ' 位互换' : '');
            explain('<p>接收方收到 <b class="c1-mono">' + got + '</b>，重算加权和 = ' + vr.s + '，' + vr.s + ' mod ' + vr.m + ' = ' + (vr.s % vr.m) + '：' +
                (vr.ok ? (changed ? '<span class="c1-no">校验通过——这次错误没有被发现！</span>（' + what + '）Luhn 对 09↔90 换位无能为力。' : '<span class="c1-ok">校验通过</span>，号码完整。点击任意数字模拟抄错。') :
                    '<span class="c1-no">校验失败</span>，发现了错误（' + what + '）。') + '</p>');
            setResult(scheme === 'isbn' ? 'Σ wᵢdᵢ + c ≡ 0 (mod 11)' : 'Luhn 加权和 ≡ 0 (mod 10)', changed ? (vr.ok ? '漏检' : '发现错误') : '校验通过', '完整号码 ' + sent + (changed ? '，收到 ' + got : ''), changed ? (vr.ok ? 'no' : 'ok') : 'ok');
        }
    };

    /* ---------- 1.3.3 拓展层：汉明 (7,4) 码 ---------- */
    KINDS.hamming = {
        title: '汉明 (7,4) 码：从检错到纠错',
        lead: '4 位数据加 3 位校验位，放在第 1、2、4 位。任意一位出错时，三个校验和组成的“伴随式”恰好指出出错的位置。',
        badge: '高天花板 · 迁移工程',
        controls: [
            { type: 'text', id: 'bits', label: '4 位数据 d₁d₂d₃d₄', value: '1011', maxlength: 4, mono: true },
            { type: 'range', id: 'flip', label: '传输中翻转第几位（0 = 不出错）', min: 0, max: 7, value: 5 }
        ],
        legend: [[LG.gold, '校验位 p₁ p₂ p₄'], [LG.white, '数据位'], [LG.red, '伴随式定位的错误位']],
        knowledge: [
            '<b>校验关系</b>：p₁ 管第 1,3,5,7 位，p₂ 管 2,3,6,7，p₄ 管 4,5,6,7（位号二进制含对应的 1）。',
            '<b>伴随式</b>：s = s₄s₂s₁（二进制），s = 0 表示无错，否则 s 就是出错的位号。',
            '<b>能力边界</b>：最小距离 3，可纠正 1 位错或检出 2 位错（不能同时）；CRC 则用多项式除法只检错不纠错。'
        ],
        render: function () {
            var raw = String(V.bits).replace(/[^01]/g, '').slice(0, 4).padEnd(4, '0'), d = raw.split('').map(Number), flip = num('flip');
            var c = [0, 0, 0, d[0], 0, d[1], d[2], d[3]];
            c[1] = c[3] ^ c[5] ^ c[7]; c[2] = c[3] ^ c[6] ^ c[7]; c[4] = c[5] ^ c[6] ^ c[7];
            var r = c.slice(); if (flip) r[flip] ^= 1;
            var s1 = r[1] ^ r[3] ^ r[5] ^ r[7], s2 = r[2] ^ r[3] ^ r[6] ^ r[7], s4 = r[4] ^ r[5] ^ r[6] ^ r[7], syn = s1 + 2 * s2 + 4 * s4;
            var fixed = r.slice(); if (syn) fixed[syn] ^= 1;
            var name = ['', 'p₁', 'p₂', 'd₁', 'p₄', 'd₂', 'd₃', 'd₄'];
            function row(arr, mark) { var h = ''; for (var i = 1; i <= 7; i++) { var par = i === 1 || i === 2 || i === 4; h += '<div class="c1-cell ' + (mark && i === mark ? 'hot' : (par ? 'soft' : '')) + '">' + arr[i] + '<small>' + i + '·' + name[i] + '</small></div>'; } return '<div class="c1-grid" style="grid-template-columns:repeat(7,minmax(0,1fr))">' + h + '</div>'; }
            viz('<div class="c1-card"><h4>① 发送的码字 ' + c.slice(1).join('') + '</h4>' + row(c, 0) + '</div>' +
                '<div class="c1-card"><h4>② 收到的码字 ' + r.slice(1).join('') + (flip ? '（第 ' + flip + ' 位被翻转）' : '（无错误）') + '</h4>' + row(r, syn) + '</div>' +
                '<div class="c1-flow"><div class="c1-node' + (s1 ? ' no' : ' ok') + '"><b>s₁ = r1⊕r3⊕r5⊕r7</b><span>' + s1 + '</span></div><div class="c1-node' + (s2 ? ' no' : ' ok') + '"><b>s₂ = r2⊕r3⊕r6⊕r7</b><span>' + s2 + '</span></div><div class="c1-node' + (s4 ? ' no' : ' ok') + '"><b>s₄ = r4⊕r5⊕r6⊕r7</b><span>' + s4 + '</span></div><div class="c1-node ' + (syn ? 'pri' : 'ok') + '"><b>伴随式 s₄s₂s₁</b><span>' + s4 + s2 + s1 + '₂ = ' + syn + '</span></div></div>');
            explain(syn ? '<p>伴随式 = ' + s4 + s2 + s1 + '₂ = <b>' + syn + '</b>，于是把第 ' + syn + ' 位（' + name[syn] + '）翻回来，得到 ' + fixed.slice(1).join('') + '，取出数据位 d₁d₂d₃d₄ = <b>' + [fixed[3], fixed[5], fixed[6], fixed[7]].join('') + '</b>，与原数据 ' + raw + ' 一致。</p>'
                : '<p>三个校验和都为 0，没有错误，直接取出数据位 ' + raw + '。把“翻转第几位”调到 1 ~ 7，看看伴随式如何指路。</p>');
            setResult('syndrome = ' + s4 + s2 + s1 + '₂', syn ? '纠正第 ' + syn + ' 位' : '无错误', '编码 ' + raw + ' → ' + c.slice(1).join(''), 'ok');
        }
    };

    /* ---------- 1.3.4 基础层：公钥密码思想 ---------- */
    var RSA_PRESETS = { '5,11': [5, 11, 3, 27], '3,11': [3, 11, 3, 7], '7,13': [7, 13, 5, 29], '11,17': [11, 17, 7, 23] };
    KINDS.rsa_concept = {
        title: '公开的锁 · 私藏的钥匙',
        lead: '公钥 (e, n) 像一把谁都能按下的挂锁，私钥 d 是唯一的钥匙。试试用公钥“再锁一次”能否打开，再看看为什么别人配不出这把钥匙。',
        badge: '低门槛 · 建立直觉',
        controls: [
            { type: 'select', id: 'key', label: '密钥对（小数值演示）', options: [['5,11', 'p=5, q=11 → n=55'], ['3,11', 'p=3, q=11 → n=33'], ['7,13', 'p=7, q=13 → n=91'], ['11,17', 'p=11, q=17 → n=187']], value: '5,11' },
            { type: 'range', id: 'm', label: '明文 m（0 ≤ m < n）', min: 2, max: 54, value: 8 }
        ],
        legend: [[LG.gold, '公开：任何人可见'], [LG.red, '私密：只有接收者知道'], [LG.green, '成功还原']],
        knowledge: [
            '<b>非对称</b>：加密用公钥 (e, n)，解密用私钥 d，两把“钥匙”不同，公钥可以放心公开。',
            '<b>单向难度</b>：由 p、q 算 n 很容易；只给 n 要分解回 p、q 极难——不知道 p、q 就算不出 d。',
            '<b>对比对称密码</b>：对称密码收发双方共用一把密钥，难点在于如何安全地把密钥交给对方。'
        ],
        render: function () {
            var P = RSA_PRESETS[V.key], p = P[0], q = P[1], e = P[2], d = P[3], n = p * q, ph = (p - 1) * (q - 1);
            var slider = $('c1_m'); if (+slider.max !== n - 1) { slider.max = n - 1; if (num('m') > n - 1) { V.m = n - 1; slider.value = n - 1; } syncLabel('m'); }
            var m = num('m'), c = modPow(m, e, n), wrong = modPow(c, e, n), right = modPow(c, d, n), tries = 0;
            for (var t = 2; t <= Math.sqrt(n); t++) { tries++; if (n % t === 0) break; }
            viz('<div class="c1-flow"><div class="c1-node"><b>明文 m</b><span>' + m + '</span></div><div class="c1-arrow">→</div>' +
                '<div class="c1-node pub"><b>🔒 公钥加密</b><span>' + m + '<sup>' + e + '</sup> mod ' + n + '</span><em>公钥 (e, n) = (' + e + ', ' + n + ')</em></div><div class="c1-arrow">→</div>' +
                '<div class="c1-node"><b>密文 c</b><span>' + c + '</span><em>在公开信道传输</em></div></div>' +
                '<div class="c1-row"><div class="c1-node ' + (wrong === m ? 'ok' : 'no') + '" style="max-width:none"><b>窃听者：用公钥再算一次</b><span>' + c + '<sup>' + e + '</sup> mod ' + n + ' = ' + wrong + '</span><em>' + (wrong === m ? '碰巧相等（小数值特例）' : '≠ ' + m + '，打不开') + '</em></div>' +
                '<div class="c1-node ok" style="max-width:none"><b>🔑 接收者：用私钥 d = ' + d + '</b><span>' + c + '<sup>' + d + '</sup> mod ' + n + ' = ' + right + '</span><em>还原明文 ✓</em></div></div>' +
                '<div class="c1-card"><h4>为什么别人配不出钥匙？</h4><p>d 由 e·d ≡ 1 (mod φ(n)) 决定，而 φ(n) = (p−1)(q−1) = ' + ph + ' 需要知道 p、q。n = ' + n + ' 很小，试除 ' + tries + ' 次就分解出 ' + p + ' × ' + q + '；真实 RSA 的 n 有数百位十进制数，目前没有已知的经典算法能在可行时间内分解。</p></div>');
            explain('<p>加密：c = ' + m + '<sup>' + e + '</sup> mod ' + n + ' = <b>' + c + '</b>；解密：' + c + '<sup>' + d + '</sup> mod ' + n + ' = <b>' + right + '</b>。检验 e·d = ' + e + '×' + d + ' = ' + e * d + ' ≡ 1 (mod ' + ph + ')。</p>');
            setResult('c = m^e mod n，m = c^d mod n', right === m ? '解密成功' : '解密失败', 'm = ' + m + ' → c = ' + c + ' → ' + right, right === m ? 'ok' : 'no');
        }
    };

    /* ---------- 1.3.4 拓展层：数字签名 ---------- */
    KINDS.signature = {
        title: 'RSA 数字签名',
        lead: '把 RSA 反过来用：发送者用<b>私钥</b>对消息摘要签名，任何人用<b>公钥</b>验证。改动收到的消息，看验证如何失败。',
        badge: '高天花板 · 迁移工程',
        controls: [
            { type: 'text', id: 'msg', label: '发送的消息', value: '守护数据可信' },
            { type: 'text', id: 'recv', label: '接收方收到的消息（可改动模拟篡改）', value: '守护数据可信' },
            { type: 'select', id: 'p', label: '素数 p', options: [11, 13, 17], value: 11 },
            { type: 'select', id: 'q', label: '素数 q', options: [19, 23, 29], value: 19 }
        ],
        legend: [[LG.red, '私钥运算（签名者）'], [LG.gold, '公钥运算（任何人）'], [LG.green, '验证通过']],
        knowledge: [
            '<b>签名</b>：s = h(M)<sup>d</sup> mod n；<b>验证</b>：检查 s<sup>e</sup> mod n 是否等于 h(M′)。',
            '<b>作用</b>：证明消息确由私钥持有者发出（不可否认）且未被篡改（完整性）；签名不负责保密。',
            '<b>工程实践</b>：混合加密用公钥密码交换会话密钥、对称密码加密数据；大规模量子计算机可用 Shor 算法分解大数，推动后量子密码标准化。'
        ],
        render: function () {
            var p = num('p'), q = num('q'), n = p * q, ph = (p - 1) * (q - 1);
            var e = [3, 5, 7, 11, 13, 17].filter(function (x) { return gcd(x, ph) === 1; })[0], d = modInv(e, ph);
            var h = toy32(V.msg) % n, s = modPow(h, d, n), h2 = toy32(V.recv) % n, v = modPow(s, e, n), ok = v === h2;
            viz('<div class="c1-flow"><div class="c1-node pub"><b>公钥 (e, n)</b><span>(' + e + ', ' + n + ')</span></div><div class="c1-node pri"><b>私钥 d</b><span>' + d + '</span><em>e·d ≡ 1 (mod ' + ph + ')</em></div></div>' +
                '<div class="c1-row"><div class="c1-card"><h4>签名者（持有私钥）</h4><p>消息 M：' + esc(V.msg) + '</p><p>摘要 h(M) = <b class="c1-mono">' + h + '</b></p><p>签名 s = ' + h + '<sup>' + d + '</sup> mod ' + n + ' = <b class="c1-mono">' + s + '</b></p></div>' +
                '<div class="c1-card"><h4>验证者（只用公钥）</h4><p>收到 M′：' + esc(V.recv) + '</p><p>重算摘要 h(M′) = <b class="c1-mono">' + h2 + '</b></p><p>s<sup>e</sup> mod n = ' + s + '<sup>' + e + '</sup> mod ' + n + ' = <b class="c1-mono">' + v + '</b></p></div></div>' +
                '<div class="c1-node ' + (ok ? 'ok' : 'no') + '" style="max-width:none"><b>结论</b><span>' + (ok ? '✓ 验证通过：消息完整、来源可信' : '✗ 验证失败：消息被篡改或签名伪造') + '</span></div>');
            explain('<p>摘要用 32 位教学哈希再取 mod n = ' + n + '（真实系统用 SHA-256 等，n 为 2048 位以上）。' + (V.msg === V.recv ? '试着改动“收到的消息”中的一个字。' : (ok ? '两条消息不同却验证通过：小模数下摘要发生了碰撞，这正是真实系统要用大 n 和强哈希的原因。' : '只改动几个字，摘要就不同，而签名是对原摘要做的，验证随之失败。')) + '</p>');
            setResult('s^e mod n  vs  h(M′)', ok ? '验证通过' : '验证失败', v + (ok ? ' = ' : ' ≠ ') + h2, ok ? 'ok' : 'no');
        }
    };

    /* =====================================================================
     * 引擎：生成控件 / 播放条 / 重置
     * ===================================================================== */
    function syncLabel(id) { var b = $('c1_' + id + 'Val'); if (b) b.textContent = V[id]; }

    function buildControls(K) {
        var host = $('c1Controls');
        var html = '<div class="control-group"><label>参数设置</label>';
        K.controls.forEach(function (c) {
            DEF[c.id] = c.value; V[c.id] = c.value;
            html += '<div class="c1-field">';
            if (c.type === 'range') {
                html += '<div class="c1-field-head"><span>' + c.label + '</span><b id="c1_' + c.id + 'Val">' + c.value + '</b></div>' +
                    '<input type="range" id="c1_' + c.id + '" min="' + c.min + '" max="' + c.max + '" step="' + (c.step || 1) + '" value="' + c.value + '" aria-label="' + c.label + '">';
            } else if (c.type === 'select') {
                html += '<div class="c1-field-head"><span>' + c.label + '</span></div><select id="c1_' + c.id + '" class="c1-select" aria-label="' + c.label + '">' +
                    c.options.map(function (o) { var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; return '<option value="' + v + '"' + (String(v) === String(c.value) ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select>';
            } else {
                html += '<div class="c1-field-head"><span>' + c.label + '</span></div><input type="text" id="c1_' + c.id + '" class="c1-input' + (c.mono ? ' mono' : '') + '" value="' + esc(c.value) + '"' + (c.maxlength ? ' maxlength="' + c.maxlength + '"' : '') + ' aria-label="' + c.label + '">';
            }
            html += '<p class="c1-note" id="' + c.id + 'Note" hidden></p></div>';
        });
        html += '</div>' +
            '<div class="control-group"><label>计算结果</label><div class="c1-result"><div class="c1-result-formula" id="c1Formula">—</div>' +
            '<div class="c1-result-main"><span>即时结论</span><strong id="c1Value">—</strong></div><p class="c1-result-extra" id="c1Extra"></p></div></div>' +
            '<div class="control-group"><label>知识要点</label><div class="c1-knowledge"><ul>' + K.knowledge.map(function (k) { return '<li>' + k + '</li>'; }).join('') + '</ul></div></div>';
        host.innerHTML = html;
        K.controls.forEach(function (c) {
            var el = $('c1_' + c.id);
            var handler = function () { V[c.id] = el.value; syncLabel(c.id); restart(); };
            el.addEventListener(c.type === 'select' ? 'change' : 'input', handler);
        });
    }

    var K = null;
    function stepped() { return typeof K.steps === 'function'; }
    function stopAuto() { if (player.timer) { clearInterval(player.timer); player.timer = null; } var b = $('c1Play'); if (b) b.textContent = '▶ 自动播放'; }
    function draw() {
        K.render(player.step);
        if (stepped()) {
            $('c1Prev').disabled = player.step <= 0;
            $('c1Next').disabled = player.step >= player.total - 1;
            $('c1StepTag').textContent = (player.step + 1) + ' / ' + player.total;
        }
    }
    function restart() {
        stopAuto();
        if (stepped()) { player.total = K.steps(); player.step = player.total - 1; }
        draw();
    }
    function buildPlayer() {
        var bar = $('c1Player');
        if (!stepped()) { bar.hidden = true; return; }
        bar.hidden = false;
        bar.innerHTML = '<button type="button" class="c1-btn secondary" id="c1Prev">◀ 上一步</button>' +
            '<button type="button" class="c1-btn primary" id="c1Play">▶ 自动播放</button>' +
            '<button type="button" class="c1-btn secondary" id="c1Next">下一步 ▶</button>' +
            '<span class="c1-step-tag" id="c1StepTag">1 / 1</span>' +
            '<label class="c1-speed">速度<input type="range" id="c1Speed" min="1" max="5" value="3" aria-label="播放速度"></label>';
        $('c1Prev').onclick = function () { stopAuto(); if (player.step > 0) { player.step--; draw(); } };
        $('c1Next').onclick = function () { stopAuto(); if (player.step < player.total - 1) { player.step++; draw(); } };
        $('c1Play').onclick = function () {
            if (player.timer) { stopAuto(); return; }
            if (player.step >= player.total - 1) player.step = 0;
            draw();
            $('c1Play').textContent = '⏸ 暂停';
            var ms = [1400, 1000, 700, 420, 220][+$('c1Speed').value - 1];
            player.timer = setInterval(function () {
                if (player.step >= player.total - 1) { stopAuto(); return; }
                player.step++; draw();
            }, ms);
        };
        $('c1Speed').oninput = function () { if (player.timer) { stopAuto(); $('c1Play').click(); } };
    }
    function reset() {
        K.controls.forEach(function (c) { V[c.id] = DEF[c.id]; var el = $('c1_' + c.id); el.value = DEF[c.id]; if (c.type === 'range' && c.max) el.max = c.max; syncLabel(c.id); });
        if ('pick' in K) K.pick = 0;
        if ('errPos' in K) { K.errPos = -1; K.swapPos = -1; }
        restart();
    }

    function boot() {
        var kind = document.body.getAttribute('data-kind');
        K = KINDS[kind];
        if (!K) return;
        document.querySelector('.stage-header h2').textContent = K.title;
        document.querySelector('.stage-header p').innerHTML = K.lead;
        $('legendPanel').innerHTML = legendHtml(K.legend);
        var badge = document.querySelector('.c1-badge'); if (badge && K.badge) badge.textContent = K.badge;
        buildControls(K);
        buildPlayer();
        $('resetBtn').onclick = reset;
        restart();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
