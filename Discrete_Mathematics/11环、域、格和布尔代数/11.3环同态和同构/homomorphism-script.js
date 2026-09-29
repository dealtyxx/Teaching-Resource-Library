/**
 * 11.3 环同态和同构 —— 进阶层「核 = 理想与基本定理」
 * 双运算检查台：选源环、目标环与映射规则 φ(x) = k·x mod m，
 * 穷举检验良定义、保加法、保乘法、φ(1)=1 与单/满射，给出核、像与同态基本定理 R/Ker φ ≅ Im φ。
 * 加载即展示默认示例 ℤ₁₂ → ℤ₄，φ(x) = x mod 4。
 */
(function () {
    'use strict';

    const $ = (id) => document.getElementById(id);
    const mappingType = $('mappingType'), sourceRing = $('sourceRing'), targetRing = $('targetRing');
    const mappingRule = $('mappingRule'), multK = $('multK');
    const vizArea = $('visualizationArea'), vizTitle = $('vizTitle'), vizSubtitle = $('vizSubtitle');
    const infoContent = $('infoContent'), ideologyCard = $('ideologyCard');
    const checks = { add: $('checkAdd'), mul: $('checkMul'), one: $('checkOne'), bij: $('checkBijective') };

    const RINGS = {
        Z: { n: 0, name: 'ℤ', els: Array.from({ length: 13 }, (_, i) => i - 6) },
        Z2: { n: 2, name: 'ℤ₂' }, Z3: { n: 3, name: 'ℤ₃' }, Z4: { n: 4, name: 'ℤ₄' },
        Z6: { n: 6, name: 'ℤ₆' }, Z12: { n: 12, name: 'ℤ₁₂' }
    };
    Object.values(RINGS).forEach((R) => { if (R.n) R.els = Array.from({ length: R.n }, (_, i) => i); });
    const mod = (a, n) => ((a % n) + n) % n;

    const IDEOLOGY = {
        homomorphism: ['⟷', '环同态 · 守住规则的桥梁', '同态同时保持加法与乘法：在一边先算再映射，与先映射再算，结果一致。搭建沟通的桥梁，关键是规则在两端一致。'],
        isomorphism: ['≅', '环同构 · 形异而质同', '同构是双射同态：两个环元素写法不同，运算结构却完全一样。看问题要透过表面形式，识别本质相同的结构。'],
        kernel: ['⊚', '核 · 被“压缩”的部分', 'Ker φ 是映到 0 的元素，它总是理想；商掉核，源环就与像同构。弄清哪些差别被忽略了，才能正确理解一个映射传递了什么。'],
        image: ['⊃', '像 · 映射所能到达的范围', 'Im φ 是目标环的子环。映射的像告诉我们：源结构的信息在目标中保留了多少、覆盖了哪些部分。']
    };

    let S = { view: 'homomorphism', src: 'Z12', tgt: 'Z4', rule: 'mult', k: 1, animate: false };

    const R1 = () => RINGS[S.src], R2 = () => RINGS[S.tgt];
    function phi(x) {
        const m = R2().n, k = S.rule === 'zero' ? 0 : S.k;
        const v = k * x;
        return m ? mod(v, m) : v;
    }
    function wellDefined() {
        // 源为 ℤₙ 时，φ(x)=kx mod m 良定义 ⇔ m | k·n（目标为 ℤ 时仅 k=0 良定义）
        const n = R1().n, m = R2().n, k = S.rule === 'zero' ? 0 : S.k;
        if (!n) return true;
        if (!m) return k === 0;
        return (k * n) % m === 0;
    }
    function opIn(R, a, b, op) { const v = op === '+' ? a + b : a * b; return R.n ? mod(v, R.n) : v; }
    function analyze() {
        const A = R1(), B = R2(), wd = wellDefined();
        let addBad = null, mulBad = null;
        if (wd) {
            for (const a of A.els) for (const b of A.els) {
                const s = opIn(A, a, b, '+'), p = opIn(A, a, b, '*');
                if (!addBad && phi(s) !== opIn(B, phi(a), phi(b), '+')) addBad = [a, b];
                if (!mulBad && phi(p) !== opIn(B, phi(a), phi(b), '*')) mulBad = [a, b];
            }
        }
        const img = [...new Set(A.els.map(phi))].sort((x, y) => x - y);
        const ker = A.els.filter((x) => phi(x) === 0);
        const inj = A.n ? img.length === A.els.length : ker.length === 1 && !!wd;
        const surj = B.n ? img.length === B.n : Math.abs(S.rule === 'zero' ? 0 : S.k) === 1;
        const one = phi(1) === (B.n === 1 ? 0 : 1);
        return { wd, addBad, mulBad, hom: wd && !addBad && !mulBad, img, ker, inj, surj, one };
    }

    function setCheck(el, ok, na) {
        el.classList.remove('valid', 'invalid', 'na');
        el.classList.add(na ? 'na' : ok ? 'valid' : 'invalid');
        el.querySelector('.check-icon').textContent = na ? '–' : ok ? '✓' : '✗';
    }

    function formula() {
        const m = R2().n;
        if (S.rule === 'zero') return 'φ(x) = 0';
        const kx = S.k === 1 ? 'x' : S.k + 'x';
        return m ? `φ(x) = ${kx} mod ${m}` : `φ(x) = ${kx}`;
    }

    /* ---------- SVG：左源环、右目标环、箭头 ---------- */
    function draw(A, info) {
        const L = A.els.length, M = R2().n ? R2().els.length : null;
        const tEls = R2().n ? R2().els : [...new Set(A.els.map(phi))].sort((x, y) => x - y);
        const h = Math.max(L, tEls.length) * 34 + 90, xL = 170, xR = 550;
        const yOf = (i, cnt) => 60 + (i + 0.5) * ((h - 90) / cnt);
        const posL = {}, posR = {};
        A.els.forEach((a, i) => { posL[a] = [xL, yOf(i, L)]; });
        tEls.forEach((b, i) => { posR[b] = [xR, yOf(i, tEls.length)]; });
        let s = `<defs><marker id="ha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="rgba(214,59,29,.7)"/></marker>` +
            `<marker id="hk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#c58a1f"/></marker></defs>`;
        s += `<text x="${xL}" y="34" text-anchor="middle" font-size="16" font-weight="800" fill="#d63b1d">源环 ${R1().name}${R1().n ? '' : '（−6…6）'}</text>`;
        s += `<text x="${xR}" y="34" text-anchor="middle" font-size="16" font-weight="800" fill="#b8321a">目标环 ${R2().name}</text>`;
        const bad = info.addBad || info.mulBad;
        if (info.wd) {
            A.els.forEach((a, i) => {
                const b = phi(a), p = posL[a], q = posR[b];
                if (!q) return;
                const isKer = b === 0;
                const hot = bad && (a === bad[0] || a === bad[1]);
                const col = hot ? '#c0392b' : isKer && S.view === 'kernel' ? '#c58a1f' : 'rgba(214,59,29,.45)';
                const dash = S.animate ? `stroke-dasharray="400" stroke-dashoffset="400" style="animation: hm-draw .6s ease ${i * 0.06}s forwards"` : '';
                s += `<path d="M${p[0] + 20},${p[1]} C${(p[0] + q[0]) / 2},${p[1]} ${(p[0] + q[0]) / 2},${q[1]} ${q[0] - 22},${q[1]}" fill="none" stroke="${col}" stroke-width="${hot ? 3 : 2}" marker-end="url(#${isKer && S.view === 'kernel' ? 'hk' : 'ha'})" ${dash}/>`;
            });
        }
        A.els.forEach((a) => {
            const isKer = info.ker.includes(a) && (S.view === 'kernel');
            const hot = bad && (a === bad[0] || a === bad[1]);
            s += nodeSvg(posL[a], a, hot ? 'bad' : isKer ? 'cur' : 'norm');
        });
        tEls.forEach((b) => {
            const inImg = info.img.includes(b);
            const kind = (S.view === 'image' || S.view === 'isomorphism') && inImg ? 'cur' : b === 0 && S.view === 'kernel' ? 'key' : inImg ? 'norm' : 'dim';
            s += nodeSvg(posR[b], b, kind);
        });
        if (!info.wd) s += `<text x="360" y="${h / 2}" text-anchor="middle" font-size="16" font-weight="800" fill="#c0392b">φ 不是良定义的映射：同一剩余类的不同代表元会得到不同的像</text>`;
        return `<svg class="hm-svg" viewBox="0 0 720 ${h}" role="img">${s}</svg>`;
    }
    function nodeSvg(p, label, kind) {
        const K = { norm: ['#fff', '#6b4a38', '#2c1810'], cur: ['#ffb400', '#c58a1f', '#2c1810'], key: ['#d63b1d', '#b8321a', '#fff'], bad: ['#fde8e4', '#c0392b', '#97180f'], dim: ['#efe4d6', '#d8c6b2', '#a08a78'] }[kind];
        return `<g><circle cx="${p[0]}" cy="${p[1]}" r="15" fill="${K[0]}" stroke="${K[1]}" stroke-width="2.4"${kind === 'bad' ? ' stroke-dasharray="4 3"' : ''}/>` +
            `<text x="${p[0]}" y="${p[1] + 5}" text-anchor="middle" class="m" font-size="13" font-weight="800" fill="${K[2]}">${label}</text></g>`;
    }

    /* ---------- 渲染 ---------- */
    function render() {
        const A = R1(), info = analyze();
        vizTitle.textContent = `${A.name} → ${R2().name}，${formula()}`;
        const sub = {
            homomorphism: '环同态：∀a,b，φ(a+b) = φ(a)+φ(b) 且 φ(ab) = φ(a)φ(b)（逐对穷举检验）',
            isomorphism: '环同构：双射的环同态；金色为像，全部点亮才是满射',
            kernel: '核 Ker φ = {a : φ(a) = 0}（金色）——它总是源环的理想',
            image: '像 Im φ = {φ(a)}（金色）——它总是目标环的子环'
        }[S.view];
        vizSubtitle.textContent = sub;
        vizArea.innerHTML = draw(A, info);

        setCheck(checks.add, info.wd && !info.addBad, !info.wd);
        setCheck(checks.mul, info.wd && !info.mulBad, !info.wd);
        setCheck(checks.one, info.one, !info.wd);
        setCheck(checks.bij, info.inj && info.surj, !info.wd);
        $('kerCount').textContent = info.wd ? (A.n ? info.ker.length : (S.k === 0 || S.rule === 'zero' ? '∞' : info.ker.length === 1 ? 1 : '∞')) : '—';
        $('imgCount').textContent = info.wd ? (R2().n ? info.img.length : '∞') : '—';

        let html = `<div class="info-formula">${formula()}</div>`;
        if (!info.wd) {
            html += `<p class="info-text"><b class="bad">不良定义</b>：在 ${A.name} 中 0 = ${A.n}，但 φ(0) = 0 而 ${S.k}·${A.n} mod ${R2().n || '∞'} = ${R2().n ? mod(S.k * A.n, R2().n) : S.k * A.n} ≠ 0。要求 ${R2().n || 'm'} | k·${A.n}。</p>`;
        } else {
            const bad = (arr, op) => `φ(${arr[0]}${op}${arr[1]}) = ${phi(opIn(A, arr[0], arr[1], op))}，而 φ(${arr[0]})${op}φ(${arr[1]}) = ${opIn(R2(), phi(arr[0]), phi(arr[1]), op)}`;
            html += `<p class="info-text">保加法：${info.addBad ? '<b class="bad">✗ ' + bad(info.addBad, '+') + '</b>' : '<b class="ok">✓ 全部成立</b>'}</p>`;
            html += `<p class="info-text">保乘法：${info.mulBad ? '<b class="bad">✗ ' + bad(info.mulBad, '*').replace(/\*/g, '·') + '</b>' : '<b class="ok">✓ 全部成立</b>'}</p>`;
            html += `<p class="info-text">φ(1) = ${phi(1)}${info.one ? '（保持单位元）' : '（不保持单位元，仍可能是环同态）'}</p>`;
            const kerTxt = A.n ? '{' + info.ker.join(', ') + '}' : (S.k === 0 || S.rule === 'zero' ? 'ℤ' : (R2().n ? (R2().n / gcd(S.k, R2().n)) + 'ℤ' : '{0}'));
            html += `<p class="info-text">Ker φ = ${kerTxt}　Im φ = {${info.img.join(', ')}}</p>`;
            if (info.hom) {
                const q = A.n ? A.n / info.ker.length : null;
                html += `<div class="info-formula">${info.inj && info.surj ? '★ 环同构 ' + A.name + ' ≅ ' + R2().name : '✓ 环同态'}</div>`;
                if (A.n) html += `<p class="info-text">同态基本定理：${A.name}/Ker φ 有 ${A.n}/${info.ker.length} = ${q} 个陪集，恰与 |Im φ| = ${info.img.length} 相等，${A.name}/Ker φ ≅ Im φ。</p>`;
                else html += `<p class="info-text">同态基本定理：ℤ/Ker φ ≅ Im φ。</p>`;
            } else {
                html += `<div class="info-formula bad">✗ 不是环同态</div>`;
            }
        }
        infoContent.innerHTML = html;

        const m = IDEOLOGY[S.view];
        ideologyCard.querySelector('.card-icon').textContent = m[0];
        ideologyCard.querySelector('.card-title').textContent = m[1];
        ideologyCard.querySelector('.card-content').textContent = m[2];
        S.animate = false;
    }
    function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }

    function sync() {
        S.view = mappingType.value; S.src = sourceRing.value; S.tgt = targetRing.value;
        S.rule = mappingRule.value; S.k = Number(multK.value);
        multK.disabled = S.rule === 'zero';
        render();
    }
    [mappingType, sourceRing, targetRing, mappingRule, multK].forEach((el) => el.addEventListener('change', sync));
    $('verifyBtn').addEventListener('click', () => { S.animate = true; render(); });
    $('buildBridgeBtn').addEventListener('click', () => {
        // 推荐示例轮换：典型同态 / 非同态 / 同构 / 不良定义
        const demos = [
            ['homomorphism', 'Z12', 'Z4', 'mult', 1], ['homomorphism', 'Z6', 'Z6', 'mult', 2],
            ['homomorphism', 'Z6', 'Z6', 'mult', 3], ['isomorphism', 'Z6', 'Z6', 'mult', 5], ['isomorphism', 'Z', 'Z', 'mult', 1],
            ['kernel', 'Z', 'Z6', 'mult', 1], ['homomorphism', 'Z4', 'Z6', 'mult', 1], ['homomorphism', 'Z4', 'Z6', 'mult', 3]
        ];
        buildIdx = (buildIdx + 1) % demos.length;
        const d = demos[buildIdx];
        mappingType.value = d[0]; sourceRing.value = d[1]; targetRing.value = d[2]; mappingRule.value = d[3]; multK.value = String(d[4]);
        sync(); S.animate = true; render();
    });
    let buildIdx = 0;
    $('resetBtn').addEventListener('click', () => {
        mappingType.value = 'homomorphism'; sourceRing.value = 'Z12'; targetRing.value = 'Z4'; mappingRule.value = 'mult'; multK.value = '1';
        buildIdx = 0; sync();
    });

    mappingType.value = S.view; sourceRing.value = S.src; targetRing.value = S.tgt; mappingRule.value = S.rule; multK.value = String(S.k);
    sync();
})();
