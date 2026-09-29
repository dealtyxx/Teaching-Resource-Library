/**
 * 1.2.3 同余方程 · 进阶层：乘法逆元（扩展欧几里得）与中国剩余定理
 * 模式一：ax ≡ b (mod m) —— 判据 gcd(a,m) | b，扩展欧几里得表求逆元，写出全部解并逐一验证；
 * 模式二：中国剩余定理 —— 两两互素的模数下构造唯一解 x ≡ Σ rᵢMᵢyᵢ (mod M)。
 */
const $ = id => document.getElementById(id);
const modeTabs = document.querySelectorAll('.mode-tab');
const vizArea = $('vizArea'), legendPanel = $('legendPanel'), resultPanel = $('resultPanel');
const stageTitle = $('stageTitle'), stageDescription = $('stageDescription');

const DEF = { mode: 'inv', a: 7, b: 3, m: 20, crt: [[2, 3], [3, 5], [2, 7]] };
let mode = DEF.mode;

function gcd(a, b) { while (b) { [a, b] = [b, a % b]; } return a; }
function modInv(a, m) { const t = extTable(a, m); return t.g === 1 ? ((t.s % m) + m) % m : null; }
// 扩展欧几里得表：从 (m, a mod m) 开始辗转相除，逐行记录余数 r、商 q 与系数 s、t，始终满足 r = s·a + t·m
function extTable(a, m) {
    const rows = [{ r: m, s: 0, t: 1, q: null }, { r: a % m, s: 1, t: 0, q: null }];
    while (rows[rows.length - 1].r !== 0) {
        const p = rows[rows.length - 2], c = rows[rows.length - 1], q = Math.floor(p.r / c.r);
        c.q = q;
        rows.push({ r: p.r - q * c.r, s: p.s - q * c.s, t: p.t - q * c.t, q: null });
    }
    const last = rows[rows.length - 2];
    return { rows, g: last.r, s: last.s, t: last.t };
}
const signed = v => v < 0 ? `(${v})` : `${v}`;

/* ---------- 模式一：逆元与一次同余 ---------- */
function renderInv() {
    const a = +$('aSlider').value, b = +$('bSlider').value, m = +$('mSlider').value;
    $('aDisplay').textContent = a; $('bDisplay').textContent = b; $('mDisplay').textContent = m;
    $('aValue').textContent = a; $('bValue').textContent = b; $('mValue').textContent = m;
    const g = gcd(a, m), ok = b % g === 0, a1 = a / g, b1 = b / g, m1 = m / g;
    stageTitle.textContent = `求解 ${a}x ≡ ${b} (mod ${m})`;
    stageDescription.textContent = '先判可解，再用扩展欧几里得求逆元，最后写出模 m 下的全部解并逐一验证。';
    let html = `<div class="step-card"><div class="step-header"><div class="step-number">1</div><div class="step-title">判断可解性</div></div>
        <div class="step-content">g = gcd(${a}, ${m}) = <b>${g}</b>；${ok ? `${g} | ${b}，方程<b class="ok">有解</b>，在 0 ~ ${m - 1} 中恰有 ${g} 个解。` : `${g} ∤ ${b}，方程<b class="no">无解</b>。`}</div></div>`;
    let sols = [];
    if (ok) {
        const T = extTable(a1, m1), inv = m1 === 1 ? 0 : ((T.s % m1) + m1) % m1;
        const rows = T.rows.map((r, i) => `<tr><td>${i}</td><td>${r.r}</td><td>${r.q === null ? '' : r.q}</td><td>${r.s}</td><td>${r.t}</td></tr>`).join('');
        html += `<div class="step-card"><div class="step-header"><div class="step-number">2</div><div class="step-title">${g > 1 ? `约去 g：${a1}x ≡ ${b1} (mod ${m1})，` : ''}扩展欧几里得求 ${a1} 模 ${m1} 的逆元</div></div>
            <div class="step-content"><table class="ext-table"><thead><tr><th>行</th><th>余数 r</th><th>商 q</th><th>s</th><th>t</th></tr></thead><tbody>${rows}</tbody></table>
            <p class="ext-note">每行满足 r = s·${a1} + t·${m1}（第 0、1 行分别是 ${m1} 与 ${a1 % m1}）；最后一个非零余数 1 所在行给出 ${signed(T.s)}·${a1} + ${signed(T.t)}·${m1} = 1，所以 ${a1}<sup>−1</sup> ≡ ${T.s} ≡ <b>${inv}</b> (mod ${m1})。</p></div></div>`;
        const x0 = (inv * b1) % m1;
        for (let k = 0; k < g; k++) sols.push(x0 + k * m1);
        html += `<div class="step-card"><div class="step-header"><div class="step-number">3</div><div class="step-title">写出全部解</div></div>
            <div class="step-content">x ≡ ${a1}<sup>−1</sup>·${b1} ≡ ${inv} × ${b1} ≡ <b>${x0}</b> (mod ${m1})，回到模 ${m}：x ∈ {<b>${sols.join(', ')}</b>}。</div></div>`;
    }
    let cells = '';
    for (let x = 0; x < m; x++) {
        const l = (a * x) % m, hit = l === b % m;
        cells += `<div class="test-card ${hit ? 'solution' : 'non-solution'}"><div class="test-number">x = ${x}</div><div class="test-label">${a}x ≡ ${l}</div></div>`;
    }
    html += `<div class="step-card"><div class="step-header"><div class="step-number">${ok ? 4 : 2}</div><div class="step-title">逐一验证 x = 0 ~ ${m - 1}（右端 b mod m = ${b % m}）</div></div><div class="solution-grid">${cells}</div></div>`;
    vizArea.innerHTML = `<div class="solution-container">${html}</div>`;
    resultPanel.innerHTML = ok
        ? `<div class="result-item"><span class="result-label">方程状态</span><span class="result-value ok">有解</span></div>
           <div class="result-item"><span class="result-label">解的个数</span><span class="result-value">${g}</span></div>
           <div class="result-item"><span class="result-label">全部解</span><span class="result-value">${sols.join(', ')}</span></div>`
        : `<div class="result-item"><span class="result-label">方程状态</span><span class="result-value no">无解</span></div>
           <div class="result-item"><span class="result-label">原因</span><span class="result-value small">gcd(${a},${m}) = ${g} ∤ ${b}</span></div>`;
    legendPanel.innerHTML = `<div class="legend-item"><div class="legend-color" style="background:linear-gradient(135deg,#2FB36B,#1F9D55)"></div><span>满足方程的 x</span></div>
        <div class="legend-item"><div class="legend-color" style="background:#f3ebe4"></div><span>不满足</span></div>`;
}

/* ---------- 模式二：中国剩余定理 ---------- */
function renderCrt() {
    const eq = [0, 1, 2].map(i => [+$('r' + i).value, +$('m' + i).value]);
    eq.forEach(([r, m], i) => { if (r >= m) { $('r' + i).value = r % m; eq[i][0] = r % m; } });
    stageTitle.textContent = '中国剩余定理：拼出唯一解';
    stageDescription.textContent = '模数两两互素时，令 M = m₁m₂m₃、Mᵢ = M/mᵢ、yᵢ = Mᵢ⁻¹ (mod mᵢ)，则 x ≡ Σ rᵢMᵢyᵢ (mod M)。';
    const pairs = [[0, 1], [0, 2], [1, 2]].map(([i, j]) => ({ i, j, g: gcd(eq[i][1], eq[j][1]) }));
    const coprime = pairs.every(p => p.g === 1);
    let html = `<div class="step-card"><div class="step-header"><div class="step-number">1</div><div class="step-title">方程组与互素检查</div></div><div class="step-content">
        ${eq.map(([r, m]) => `x ≡ ${r} (mod ${m})`).join('；　')}<div class="crt-checks">${pairs.map(p => `<span class="${p.g === 1 ? 'ok' : 'no'}">gcd(${eq[p.i][1]}, ${eq[p.j][1]}) = ${p.g}</span>`).join('')}</div></div></div>`;
    let x = null, M = eq.reduce((s, e) => s * e[1], 1);
    if (coprime) {
        let sum = 0;
        const rows = eq.map(([r, m]) => { const Mi = M / m, yi = modInv(Mi % m, m), term = r * Mi * yi; sum += term; return `<tr><td>${m}</td><td>${r}</td><td>${Mi}</td><td>${Mi % m}</td><td>${yi}</td><td>${term}</td></tr>`; }).join('');
        x = sum % M;
        html += `<div class="step-card"><div class="step-header"><div class="step-number">2</div><div class="step-title">构造：M = ${eq.map(e => e[1]).join(' × ')} = ${M}</div></div><div class="step-content">
            <table class="ext-table"><thead><tr><th>mᵢ</th><th>rᵢ</th><th>Mᵢ = M/mᵢ</th><th>Mᵢ mod mᵢ</th><th>yᵢ = Mᵢ⁻¹</th><th>rᵢMᵢyᵢ</th></tr></thead><tbody>${rows}</tbody></table>
            <p class="ext-note">x ≡ ${sum} ≡ <b>${x}</b> (mod ${M})；逆元 yᵢ 正是用模式一的扩展欧几里得求得。</p></div></div>
            <div class="step-card"><div class="step-header"><div class="step-number">3</div><div class="step-title">验证</div></div><div class="step-content">${eq.map(([r, m]) => `${x} mod ${m} = ${x % m} ${x % m === r ? '✓' : '✗'}`).join('；　')}。全部解为 x = ${x} + ${M}t（t ∈ ℤ）。</div></div>`;
    } else {
        let found = null; const L = eq.reduce((l, e) => l / gcd(l, e[1]) * e[1], 1);
        for (let t = 0; t < L; t++) if (eq.every(([r, m]) => t % m === r)) { found = t; break; }
        html += `<div class="step-card warn"><div class="step-header"><div class="step-number">2</div><div class="step-title">模数不两两互素，定理的构造公式不能直接用</div></div><div class="step-content">
            ${found === null ? `在模 lcm = ${L} 内逐个检验，<b class="no">方程组无解</b>（约束之间互相矛盾）。` : `逐个检验得到 x ≡ <b>${found}</b> (mod ${L})——解仍可能存在，但只在模 lcm = ${L}（而不是乘积 ${M}）下唯一。`}
            <br>试着把模数改成两两互素（如 3、5、7），体会定理的“有且仅有一个解”。</div></div>`;
        x = found; M = L;
    }
    vizArea.innerHTML = `<div class="solution-container">${html}</div>`;
    resultPanel.innerHTML = `<div class="result-item"><span class="result-label">模数两两互素</span><span class="result-value ${coprime ? 'ok' : 'no'}">${coprime ? '是' : '否'}</span></div>
        <div class="result-item"><span class="result-label">解</span><span class="result-value">${x === null ? '无解' : `x ≡ ${x} (mod ${M})`}</span></div>`;
    legendPanel.innerHTML = `<div class="legend-item"><div class="legend-color" style="background:#1F9D55"></div><span>互素 / 验证通过</span></div>
        <div class="legend-item"><div class="legend-color" style="background:#C0392B"></div><span>不互素</span></div>
        <div class="legend-item crt-note">💡 默认示例即《孙子算经》“物不知数”：三三数之剩二，五五数之剩三，七七数之剩二，答案 23。</div>`;
}

function render() {
    $('invControls').classList.toggle('hidden', mode !== 'inv');
    $('crtControls').classList.toggle('hidden', mode !== 'crt');
    modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    if (mode === 'inv') renderInv(); else renderCrt();
}
function reset() {
    mode = DEF.mode;
    $('aSlider').value = DEF.a; $('bSlider').value = DEF.b; $('mSlider').value = DEF.m;
    DEF.crt.forEach(([r, m], i) => { $('r' + i).value = r; $('m' + i).value = m; });
    render();
}
modeTabs.forEach(t => t.addEventListener('click', () => { mode = t.dataset.mode; render(); }));
document.querySelectorAll('#invControls input, #crtControls input, #crtControls select').forEach(el => el.addEventListener('input', render));
document.querySelectorAll('#crtControls select').forEach(el => el.addEventListener('change', render));
$('solveBtn').addEventListener('click', () => { vizArea.querySelectorAll('.step-card').forEach((c, i) => { c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; c.style.animationDelay = (i * 0.25) + 's'; }); });
$('resetBtn').addEventListener('click', reset);
reset();
