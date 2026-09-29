/**
 * 11.2 子环、理想和商环 —— 进阶层「理想与商环」
 * 在 ℤₙ（或整数环 ℤ 的一个窗口）上：
 *   子环 ⟨d⟩ 的封闭性 → 理想的吸收律 r·I ⊆ I → 陪集划分与商环 R/I ≅ ℤ_d → 扩环 R ⊆ R[i]
 * 所有图示由 SVG 即时绘制，加载即展示默认示例（ℤ₁₂，I = ⟨3⟩，理想视图）。
 */
(function () {
    'use strict';

    const $ = (id) => document.getElementById(id);
    const ringType = $('ringType');
    const genSelect = $('idealGen');
    const conceptBtns = {
        subring: $('subringBtn'), ideal: $('idealBtn'), quotient: $('quotientBtn'), extension: $('extensionBtn')
    };
    const input1 = $('input1'), input2 = $('input2'), operation = $('operation');
    const resultValue = $('resultValue');
    const vizArea = $('visualizationArea'), vizTitle = $('vizTitle'), vizSubtitle = $('vizSubtitle');
    const propertiesList = $('propertiesList');
    const ideologyCard = $('ideologyCard');

    const RINGS = {
        z12: { n: 12, name: 'ℤ₁₂', full: '模 12 剩余类环 ℤ₁₂', gens: [1, 2, 3, 4, 6, 12], def: 3 },
        z8: { n: 8, name: 'ℤ₈', full: '模 8 剩余类环 ℤ₈', gens: [1, 2, 4, 8], def: 2 },
        z10: { n: 10, name: 'ℤ₁₀', full: '模 10 剩余类环 ℤ₁₀', gens: [1, 2, 5, 10], def: 5 },
        z: { n: 0, name: 'ℤ', full: '整数环 ℤ（显示 −8 … 8）', gens: [2, 3, 4, 5], def: 3 }
    };
    const COSET_COLORS = ['#d63b1d', '#c58a1f', '#2f7d57', '#8a4b2a', '#b8321a', '#6b4a38'];
    const SUBS = '₀₁₂₃₄₅₆₇₈₉';
    const sub = (k) => String(k).replace(/\d/g, (d) => SUBS[d]);

    let ringKey = 'z12', d = 3, concept = 'ideal', r = 2;

    const ring = () => RINGS[ringKey];
    const mod = (a, n) => ((a % n) + n) % n;
    const norm = (a) => (ring().n ? mod(a, ring().n) : a);
    const els = () => (ring().n ? Array.from({ length: ring().n }, (_, i) => i) : Array.from({ length: 17 }, (_, i) => i - 8));
    const inI = (a) => (ring().n ? mod(a, d) === 0 && (d !== ring().n || mod(a, ring().n) === 0) : mod(a, d) === 0);
    const idealEls = () => els().filter((a) => (ring().n ? (d === ring().n ? a === 0 : a % d === 0) : a % d === 0));
    const Iname = () => (ring().n ? (d === ring().n ? '{0}' : '⟨' + d + '⟩') : d + 'ℤ');
    const quotientSize = () => (ring().n ? (d === ring().n ? ring().n : d) : d);

    /* ---------- 价值元素卡：每个概念一句与数学直接相关的话 ---------- */
    const IDEOLOGY = {
        subring: ['⊆', '子环 · 局部自成体系', '子环对减法和乘法都封闭，自身就是一个完整的环：局部单元既要自洽，又要遵守整体的同一套运算规则。'],
        ideal: ['◁', '理想 · 吸收而不失本色', '理想不仅自身封闭，还能“吸收”环中任意元素的乘法：r·a 仍在 I 中。稳固的核心能接纳外来作用，又保持自身结构不变。'],
        quotient: ['⊘', '商环 · 抓住本质差别', '商环把同一陪集中的元素看作一体，只保留“模 I 的差别”。忽略次要差异、抓住本质区别——钟表只看模 12 的余数就是例子。'],
        extension: ['⊇', '扩环 · 开放而守根本', '扩环引入新元素 i（i² = −1），原环的运算完整保留，又获得新的表达能力：开放拓展以守住根本规则为前提。']
    };
    function updateIdeology() {
        const m = IDEOLOGY[concept];
        ideologyCard.querySelector('.card-icon').textContent = m[0];
        ideologyCard.querySelector('.card-title').textContent = m[1];
        ideologyCard.querySelector('.card-content').textContent = m[2];
    }

    function updateProperties(props) {
        propertiesList.innerHTML = Object.entries(props).map(([k, v]) =>
            `<div class="property-item"><span class="prop-key">${k}</span><span class="prop-value">${v}</span></div>`).join('');
    }

    /* ---------- SVG 绘图 ---------- */
    const K = {
        norm: ['#ffffff', '#6b4a38', '#2c1810'], cur: ['#ffb400', '#c58a1f', '#2c1810'], key: ['#d63b1d', '#b8321a', '#ffffff'],
        ok: ['#2f7d57', '#2f7d57', '#ffffff'], dim: ['#efe4d6', '#d8c6b2', '#a08a78']
    };
    function node(x, y, label, kind, rr, stroke) {
        const k = K[kind] || K.norm; rr = rr || 20;
        return `<g><circle cx="${x}" cy="${y}" r="${rr}" fill="${k[0]}" stroke="${stroke || k[1]}" stroke-width="${stroke ? 4 : 2.4}"/>` +
            `<text x="${x}" y="${y + 5}" text-anchor="middle" class="m" font-size="${String(label).length > 2 ? 12 : 14}" font-weight="800" fill="${k[2]}">${label}</text></g>`;
    }
    function text(x, y, t, size, color, weight, anchor) {
        return `<text x="${x}" y="${y}" text-anchor="${anchor || 'middle'}" font-size="${size || 14}" font-weight="${weight || 700}" fill="${color || '#4e362d'}">${t}</text>`;
    }
    function arrow(x1, y1, x2, y2, color, rr) {
        const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
        const sx = x1 + ux * rr, sy = y1 + uy * rr, ex = x2 - ux * (rr + 3), ey = y2 - uy * (rr + 3);
        const bend = 0.18, mx = (sx + ex) / 2 - uy * L * bend, my = (sy + ey) / 2 + ux * L * bend;
        return `<path d="M${sx},${sy} Q${mx},${my} ${ex},${ey}" fill="none" stroke="${color}" stroke-width="2.6" marker-end="url(#ah)"/>`;
    }
    const DEFS = '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#2f7d57"/></marker></defs>';

    function positions() {
        const E = els(), pos = {};
        if (ring().n) {
            const n = ring().n, R = 150, cx = 360, cy = 215;
            E.forEach((a) => { const t = -Math.PI / 2 + a * 2 * Math.PI / n; pos[a] = [cx + R * Math.cos(t), cy + R * Math.sin(t)]; });
        } else {
            E.forEach((a, i) => { pos[a] = [40 + i * 40, 215]; });
        }
        return pos;
    }

    function drawSubringOrIdeal(isIdeal) {
        const pos = positions(), I = idealEls();
        let s = DEFS;
        if (ring().n) s += `<circle cx="360" cy="215" r="150" fill="none" stroke="rgba(116,55,31,.18)" stroke-width="2" stroke-dasharray="4 6"/>`;
        else s += `<line x1="20" y1="215" x2="700" y2="215" stroke="rgba(116,55,31,.3)" stroke-width="2"/>` + text(700, 245, '…', 18) + text(20, 245, '…', 18);
        if (ring().n && I.length > 2) {
            s += `<polygon points="${I.map((a) => pos[a].join(',')).join(' ')}" fill="rgba(255,180,0,.12)" stroke="#e0a100" stroke-width="2.4"/>`;
        }
        if (isIdeal) {
            const rr = norm(r);
            I.forEach((a) => {
                const b = norm(rr * a);
                if (a !== b && pos[b]) s += ring().n ? arrow(pos[a][0], pos[a][1], pos[b][0], pos[b][1], '#2f7d57', 20)
                    : `<path d="M${pos[a][0]},${pos[a][1] - 22} Q${(pos[a][0] + pos[b][0]) / 2},${130 - Math.abs(pos[b][0] - pos[a][0]) / 6} ${pos[b][0]},${pos[b][1] - 24}" fill="none" stroke="#2f7d57" stroke-width="2.4" marker-end="url(#ah)"/>`;
            });
        }
        els().forEach((a) => { s += node(pos[a][0], pos[a][1], a, I.includes(a) ? 'cur' : 'norm', ring().n ? 20 : 16); });
        if (isIdeal) s += text(360, 405, `绿色箭头：a ↦ ${norm(r)}·a，落点仍是金色元素（在 I 中）⇒ 吸收律 r·I ⊆ I`, 14, '#2f7d57');
        else s += text(360, 405, `金色元素组成 S = ${Iname()}：任取两元，差与积仍是金色 ⇒ 子环`, 14, '#8a5d0b');
        return svgWrap(s);
    }

    function drawQuotient() {
        const pos = positions(), q = quotientSize();
        let s = DEFS;
        const classes = Array.from({ length: q }, (_, c) => els().filter((a) => mod(a, q) === c && (ring().n || true)));
        if (ring().n) {
            s += `<circle cx="360" cy="215" r="150" fill="none" stroke="rgba(116,55,31,.14)" stroke-width="2" stroke-dasharray="4 6"/>`;
            classes.forEach((cls, c) => {
                const col = COSET_COLORS[c % COSET_COLORS.length];
                if (cls.length > 2) s += `<polygon points="${cls.map((a) => pos[a].join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="2.2" stroke-opacity=".7"/>`;
                else if (cls.length === 2) s += `<line x1="${pos[cls[0]][0]}" y1="${pos[cls[0]][1]}" x2="${pos[cls[1]][0]}" y2="${pos[cls[1]][1]}" stroke="${col}" stroke-width="2.2" stroke-opacity=".7"/>`;
            });
        } else {
            s += `<line x1="20" y1="215" x2="700" y2="215" stroke="rgba(116,55,31,.3)" stroke-width="2"/>`;
        }
        els().forEach((a) => {
            const c = mod(a, q);
            s += node(pos[a][0], pos[a][1], a, c === 0 ? 'cur' : 'norm', ring().n ? 20 : 16, c === 0 ? null : COSET_COLORS[c % COSET_COLORS.length]);
        });
        const legend = classes.slice(0, 6).map((_, c) => `<tspan fill="${COSET_COLORS[c % COSET_COLORS.length]}">■ ${c}+I</tspan>`).join('　');
        s += `<text x="360" y="405" text-anchor="middle" font-size="14" font-weight="700">${legend}${q > 6 ? '　…' : ''}</text>`;
        return svgWrap(s) + cosetTables(q);
    }

    function cosetTables(q) {
        if (q > 6) return `<p class="viz-note">R/I 共有 ${q} 个陪集，与 ℤ${sub(q)} 同构（表格略）。</p>`;
        const E = Array.from({ length: q }, (_, i) => i);
        const tbl = (op, f) => '<table class="coset-tbl"><tr><th>' + op + '</th>' + E.map((b) => `<th>[${b}]</th>`).join('') + '</tr>' +
            E.map((a) => `<tr><th>[${a}]</th>` + E.map((b) => { const v = f(a, b); return `<td class="${v === 0 ? 'z' : v === 1 && op === '·' ? 'o' : ''}">[${v}]</td>`; }).join('') + '</tr>').join('') + '</table>';
        return `<div class="coset-row"><div><div class="coset-cap">R/I 的加法</div>${tbl('+', (a, b) => mod(a + b, q))}</div>` +
            `<div><div class="coset-cap">R/I 的乘法</div>${tbl('·', (a, b) => mod(a * b, q))}</div></div>` +
            `<p class="viz-note">记 [a] = a + I。表中运算只依赖陪集而不依赖代表元（良定义），R/I ≅ ℤ${sub(q)}${isPrime(q) ? '，且 ' + q + ' 是素数 ⇒ R/I 是域' : '，' + q + ' 不是素数 ⇒ R/I 有零因子，不是域'}。</p>`;
    }
    function isPrime(k) { if (k < 2) return false; for (let i = 2; i * i <= k; i++) if (k % i === 0) return false; return true; }

    function drawExtension() {
        let s = '';
        const n = ring().n, m = n ? Math.min(n, 12) : 7, lo = n ? 0 : -3;
        const step = n ? Math.min(30, 300 / m) : 44, x0 = 360 - (m - 1) * step / 2, y0 = 60;
        for (let b = 0; b < m; b++) for (let a = 0; a < m; a++) {
            const x = x0 + a * step, y = y0 + (m - 1 - b) * step * (n ? 1 : 1);
            const real = (b + lo) === 0;
            s += `<circle cx="${x}" cy="${y}" r="${real ? 8 : 5}" fill="${real ? '#d63b1d' : '#ffb400'}" stroke="${real ? '#b8321a' : '#c58a1f'}" stroke-width="1.5"/>`;
        }
        const yReal = y0 + (m - 1 - (0 - lo)) * step;
        s += text(x0 - 22, yReal + 5, n ? 'b=0' : 'ℤ', 13, '#d63b1d', 800, 'end');
        s += text(360, 405, n ? `${ring().name}[i] = {a + bi : a, b ∈ ${ring().name}}，i² = −1；红色一行 b = 0 就是原环 ${ring().name}`
            : 'ℤ[i] = {a + bi : a, b ∈ ℤ}（高斯整数），i² = −1；红色一行就是原环 ℤ', 14, '#4e362d');
        return svgWrap(s, 440);
    }
    function svgWrap(inner, h) { return `<svg class="ring-svg" viewBox="0 0 720 ${h || 430}" role="img">${inner}</svg>`; }

    /* ---------- 渲染 ---------- */
    function render() {
        Object.entries(conceptBtns).forEach(([k, b]) => b.classList.toggle('active', k === concept));
        const R = ring(), I = idealEls(), q = quotientSize();
        const Ishow = R.n ? '{' + I.join(', ') + '}' : '{…, ' + [-2 * d, -d, 0, d, 2 * d].join(', ') + ', …}';
        if (concept === 'subring') {
            vizTitle.textContent = `子环 S = ${Iname()} ⊆ ${R.name}`;
            vizSubtitle.textContent = '子环判定：S 非空，且对减法、乘法封闭（a − b ∈ S，ab ∈ S）';
            vizArea.innerHTML = drawSubringOrIdeal(false);
            const a = d, b = 2 * d;
            updateProperties({
                '母环 R': R.name, '子集 S': Ishow, '示例 a−b': `${norm(a)} − ${norm(b)} = ${norm(a - b)} ∈ S`,
                '示例 ab': `${norm(a)}·${norm(b)} = ${norm(a * b)} ∈ S`, '含单位元 1': I.includes(1) ? '是' : '否（子环可以不含 1）'
            });
        } else if (concept === 'ideal') {
            vizTitle.textContent = `理想 I = ${Iname()} ◁ ${R.name}`;
            vizSubtitle.textContent = `理想 = 子环 + 吸收律：∀r ∈ R，r·I ⊆ I。当前 r = ${norm(r)}（可在“元素 a”中输入 r）`;
            vizArea.innerHTML = drawSubringOrIdeal(true);
            updateProperties({
                '环 R': R.name, '理想 I': Ishow, '吸收示例': `${norm(r)}·${d % (R.n || Infinity)} = ${norm(r * d)} ∈ I`,
                '吸收律 r·I ⊆ I': '✓ 成立', '非理想的子环': 'ℤ ⊆ ℚ（½·1 ∉ ℤ）'
            });
        } else if (concept === 'quotient') {
            vizTitle.textContent = `商环 ${R.name} / ${Iname()}`;
            vizSubtitle.textContent = `以 I 的陪集 a + I 为元素：共 ${q} 个陪集，按代表元做加法和乘法`;
            vizArea.innerHTML = drawQuotient();
            updateProperties({
                '商环': `${R.name}/${Iname()}`, '元素个数': q, '同构于': 'ℤ' + sub(q),
                '运算': '(a+I)(b+I) = ab+I', '是否为域': isPrime(q) ? '✓ 是（' + q + ' 为素数）' : '✗ 否'
            });
        } else {
            vizTitle.textContent = `扩环 ${R.name} ⊆ ${R.name}[i]`;
            vizSubtitle.textContent = '扩环 S ⊇ R，且 R 的加法、乘法就是 S 运算在 R 上的限制';
            vizArea.innerHTML = drawExtension();
            updateProperties({
                '原环 R': R.name, '扩环 S': R.name + '[i]', '新元素': 'i，满足 i² = −1',
                '乘法': '(a+bi)(c+di) = (ac−bd)+(ad+bc)i', '包含关系': 'R ⊆ S（b = 0 的元素）'
            });
        }
        updateIdeology();
        calculate(true);
    }

    function fillGens() {
        const R = ring();
        genSelect.innerHTML = R.gens.map((g) => {
            const lab = R.n ? (g === R.n ? `d = ${g}：I = {0}（零理想）` : g === 1 ? `d = 1：I = ${R.name}（整个环）` : `d = ${g}：I = ⟨${g}⟩`) : `d = ${g}：I = ${g}ℤ`;
            return `<option value="${g}"${g === d ? ' selected' : ''}>${lab}</option>`;
        }).join('');
    }

    function calculate(silent) {
        const a = parseInt(input1.value, 10), b = parseInt(input2.value, 10), op = operation.value;
        if (isNaN(a) || isNaN(b)) {
            if (!silent) resultValue.textContent = '请输入两个整数';
            else resultValue.textContent = '—';
            return;
        }
        const raw = op === '+' ? a + b : a * b, v = norm(raw), R = ring();
        let tail = '';
        if (concept === 'ideal' || concept === 'subring') tail = inI(v) ? `　∈ I` : `　∉ I`;
        if (concept === 'quotient') tail = `　即 (${mod(a, quotientSize())}+I) ${op === '+' ? '+' : '·'} (${mod(b, quotientSize())}+I) = ${mod(v, quotientSize())}+I`;
        resultValue.textContent = `${a} ${op === '+' ? '+' : '×'} ${b} = ${R.n ? raw + ' ≡ ' + v + ' (mod ' + R.n + ')' : v}${tail}`;
        if (!silent && concept === 'ideal' && !isNaN(a)) { r = a; }
    }

    /* ---------- 事件 ---------- */
    ringType.addEventListener('change', () => { ringKey = ringType.value; d = ring().def; fillGens(); render(); });
    genSelect.addEventListener('change', () => { d = Number(genSelect.value); render(); });
    Object.entries(conceptBtns).forEach(([k, b]) => b.addEventListener('click', () => { concept = k; render(); }));
    $('calculateBtn').addEventListener('click', () => { calculate(false); if (concept === 'ideal') render(); });
    [input1, input2].forEach((el) => el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { calculate(false); if (concept === 'ideal') render(); } }));
    operation.addEventListener('change', () => calculate(true));
    $('visualizeBtn').addEventListener('click', () => {
        // 逐个演示四个概念
        const order = ['subring', 'ideal', 'quotient', 'extension'];
        concept = order[(order.indexOf(concept) + 1) % order.length];
        render();
    });
    $('resetBtn').addEventListener('click', () => {
        ringKey = 'z12'; ringType.value = 'z12'; d = 3; concept = 'ideal'; r = 2;
        input1.value = '2'; input2.value = '3'; operation.value = '*';
        fillGens(); render();
    });

    input1.value = '2'; input2.value = '3'; operation.value = '*';
    fillGens();
    render();
})();
