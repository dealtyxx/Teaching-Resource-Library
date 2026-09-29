/**
 * 1.2.4 欧拉函数和费马小定理 · 进阶层：欧拉定理降幂 / 费马小定理
 * 模式一「欧拉定理 · 降幂」：gcd(a,n)=1 时 a^φ(n) ≡ 1 (mod n)，于是 a^k ≡ a^(k mod φ(n)) (mod n)；
 * 模式二「费马小定理」：p 为素数、p ∤ a 时 a^(p−1) ≡ 1 (mod p)，逐项列出 a^i mod p。
 */
const $ = id => document.getElementById(id);
const modeTabs = document.querySelectorAll('.mode-tab');
const area = $('visualizationArea'), resultPanel = $('resultPanel');
const DEF = { mode: 'euler', a: 7, k: '2026', n: 20, fa: 3, fp: '7' };
let mode = DEF.mode;

function gcd(a, b) { while (b) { [a, b] = [b, a % b]; } return a; }
function powMod(a, e, m) { let r = 1n, b = BigInt(a) % BigInt(m), E = BigInt(e), M = BigInt(m); while (E > 0n) { if (E & 1n) r = r * b % M; b = b * b % M; E >>= 1n; } return Number(r); }
function factorize(n) { const f = []; for (let d = 2; d * d <= n; d++) { let k = 0; while (n % d === 0) { n /= d; k++; } if (k) f.push([d, k]); } if (n > 1) f.push([n, 1]); return f; }
function phi(n) { let r = n; factorize(n).forEach(([p]) => { r = r / p * (p - 1); }); return r; }
const fh = f => f.map(([p, k]) => p + (k > 1 ? `<sup>${k}</sup>` : '')).join(' × ');

function setResult(rows) {
    resultPanel.innerHTML = rows.map(([l, v, cls]) => `<div class="result-item"><span class="result-label">${l}</span><span class="result-value ${cls || ''}">${v}</span></div>`).join('');
}

function renderEuler() {
    const a = +$('eulerBase').value, n = +$('eulerMod').value;
    let kStr = ($('eulerExp').value || '').replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 30) || '0';
    $('eulerBaseValue').textContent = a; $('eulerModValue').textContent = n;
    const k = BigInt(kStr), g = gcd(a, n), ph = phi(n), ans = powMod(a, k, n);
    $('vizTitle').textContent = `计算 ${a}^${kStr} mod ${n}`;
    $('vizSubtitle').textContent = '指数再大也不怕：先求 φ(n)，把指数对 φ(n) 取余，再算小幂。';
    let html = `<div class="eu-steps">
        <div class="eu-step"><b>① 互素？</b>gcd(${a}, ${n}) = ${g}，${g === 1 ? '<span class="ok">互素，可用欧拉定理</span>' : '<span class="no">不互素，欧拉定理不适用</span>'}</div>
        <div class="eu-step"><b>② 求 φ(n)</b>${n} = ${fh(factorize(n))}，φ(${n}) = <b>${ph}</b></div>`;
    if (g === 1) {
        const r = Number(k % BigInt(ph));
        html += `<div class="eu-step"><b>③ 降幂</b>${a}<sup>${ph}</sup> ≡ ${powMod(a, ph, n)} (mod ${n})，所以指数只看 ${kStr} mod ${ph} = <b>${r}</b></div>
        <div class="eu-step"><b>④ 小幂</b>${a}<sup>${kStr}</sup> ≡ ${a}<sup>${r}</sup> ≡ <b>${ans}</b> (mod ${n})</div></div>`;
    } else {
        html += `<div class="eu-step"><b>③ 改用快速幂</b>把指数写成二进制，反复平方取模：${a}<sup>${kStr}</sup> ≡ <b>${ans}</b> (mod ${n})</div></div>`;
    }
    const L = g === 1 ? ph : Math.min(24, n);
    let cells = '';
    for (let i = 1; i <= L; i++) {
        const v = powMod(a, i, n), hit = g === 1 && Number(k % BigInt(ph)) === i % ph;
        cells += `<div class="sequence-item${v === 1 && g === 1 ? ' highlight' : ''}${hit ? ' target' : ''}"><span class="seq-exp">${a}<sup>${i}</sup></span><span class="seq-val">${v}</span></div>`;
    }
    html += `<h4 class="eu-sub">${g === 1 ? `一个周期：${a}^1 … ${a}^${ph} (mod ${n})，金框为 ${a}^${kStr} 所落的位置` : `${a} 的前 ${L} 次幂 (mod ${n})：永远不会回到 1`}</h4><div class="fermat-sequence">${cells}</div>`;
    area.innerHTML = html;
    setResult([[`φ(${n})`, ph], ['化简后指数', g === 1 ? `${kStr} mod ${ph} = ${Number(k % BigInt(ph))}` : '—'], [`${a}^${kStr.length > 8 ? kStr.slice(0, 8) + '…' : kStr} mod ${n}`, ans, 'ok']]);
}

function renderFermat() {
    const a = +$('fermatBase').value, p = +$('fermatPrime').value;
    $('fermatBaseValue').textContent = a;
    $('vizTitle').textContent = `费马小定理：${a}^${p - 1} ≡ 1 (mod ${p})？`;
    $('vizSubtitle').textContent = 'p 为素数且 p ∤ a 时，a^(p−1) ≡ 1 (mod p)；它是欧拉定理在 n = p、φ(p) = p − 1 时的特例。';
    if (a % p === 0) {
        area.innerHTML = `<div class="eu-step warn"><b>不适用</b>${p} 整除 ${a}，此时 ${a}^k ≡ 0 (mod ${p})，费马小定理的前提 p ∤ a 不成立。请换一个底数或素数。</div>`;
        setResult([['前提 p ∤ a', '不满足', 'no']]);
        return;
    }
    let cells = '', ord = 0;
    for (let i = 1; i < p; i++) {
        const v = powMod(a, i, p); if (v === 1 && !ord) ord = i;
        cells += `<div class="sequence-item${i === p - 1 ? ' highlight' : (v === 1 ? ' target' : '')}"><span class="seq-exp">${a}<sup>${i}</sup> mod ${p}</span><span class="seq-val">${v}</span></div>`;
    }
    area.innerHTML = `<div class="fermat-sequence">${cells}</div>
        <div class="eu-steps"><div class="eu-step"><b>观察</b>第 ${p - 1} 项必为 1（红框）；${a} 最早在第 <b>${ord}</b> 次幂回到 1（${a} 模 ${p} 的阶），而 ${ord} 整除 ${p - 1}${ord === p - 1 ? `——${a} 是模 ${p} 的原根，幂次取遍 1 ~ ${p - 1}` : '，序列按周期 ' + ord + ' 重复'}。</div>
        <div class="eu-step"><b>用途</b>${a}<sup>100</sup> mod ${p}：100 mod ${p - 1} = ${100 % (p - 1)}，故 ${a}<sup>100</sup> ≡ ${a}<sup>${100 % (p - 1)}</sup> ≡ ${powMod(a, 100, p)} (mod ${p})。</div></div>`;
    setResult([[`${a}^${p - 1} mod ${p}`, powMod(a, p - 1, p), 'ok'], [`${a} 模 ${p} 的阶`, ord]]);
}

function render() {
    $('eulerControls').classList.toggle('hidden', mode !== 'euler');
    $('fermatControls').classList.toggle('hidden', mode !== 'fermat');
    modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    if (mode === 'euler') renderEuler(); else renderFermat();
}
function reset() {
    mode = DEF.mode;
    $('eulerBase').value = DEF.a; $('eulerExp').value = DEF.k; $('eulerMod').value = DEF.n;
    $('fermatBase').value = DEF.fa; $('fermatPrime').value = DEF.fp;
    render();
}
modeTabs.forEach(t => t.addEventListener('click', () => { mode = t.dataset.mode; render(); }));
['eulerBase', 'eulerExp', 'eulerMod', 'fermatBase'].forEach(id => $(id).addEventListener('input', render));
$('fermatPrime').addEventListener('change', render);
$('startBtn').addEventListener('click', () => {
    area.querySelectorAll('.sequence-item').forEach((el, i) => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; el.style.animationDelay = (i * 0.08) + 's'; });
});
$('resetBtn').addEventListener('click', reset);
reset();
