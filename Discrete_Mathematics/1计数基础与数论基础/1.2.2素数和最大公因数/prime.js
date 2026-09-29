/**
 * 1.2.2 素数和最大公因数 · 进阶层：欧几里得算法（辗转相除）
 * 模式一「欧几里得算法」：逐步演示 gcd(a,b)=gcd(b, a mod b)，给出扩展欧几里得的贝祖系数与最小公倍数；
 * 模式二「素数分布」：2~N 的素数与合数，点击查看素因子分解（算术基本定理）。
 */

// DOM 元素
const modeTabs = document.querySelectorAll('.mode-tab');
const rangeSlider = document.getElementById('rangeSlider');
const num1Slider = document.getElementById('num1Slider');
const num2Slider = document.getElementById('num2Slider');
const rangeValue = document.getElementById('rangeValue');
const num1Value = document.getElementById('num1Value');
const num2Value = document.getElementById('num2Value');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const vizArea = document.getElementById('vizArea');
const legendPanel = document.getElementById('legendPanel');
const primeControls = document.getElementById('primeControls');
const gcdControls = document.getElementById('gcdControls');
const principleTitle = document.getElementById('principleTitle');
const principleFormula = document.getElementById('principleFormula');
const principleExplanation = document.getElementById('principleExplanation');
const politicalMeaning = document.getElementById('politicalMeaning');
const resultPanel = document.getElementById('resultPanel');
const stageTitle = document.getElementById('stageTitle');
const stageDescription = document.getElementById('stageDescription');

const DEF = { mode: 'gcd', range: 50, a: 252, b: 105 };
let currentMode = DEF.mode;
let maxRange = DEF.range;
let num1 = DEF.a;
let num2 = DEF.b;
let shown = Infinity;      // 欧几里得已展示的步数
let timer = null;
let picked = 0;

/* ---------- 数论工具 ---------- */
function gcd(a, b) { while (b) { [a, b] = [b, a % b]; } return a; }
function isPrime(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
function factorize(n) { const f = []; for (let d = 2; d * d <= n; d++) { let k = 0; while (n % d === 0) { n /= d; k++; } if (k) f.push([d, k]); } if (n > 1) f.push([n, 1]); return f; }
function factorHtml(f) { return f.map(([p, k]) => p + (k > 1 ? `<sup>${k}</sup>` : '')).join(' × '); }
function euclidSteps(a, b) { const s = []; while (b) { s.push({ a, b, q: Math.floor(a / b), r: a % b }); [a, b] = [b, a % b]; } return s; }
function extGcd(a, b) { if (!b) return [a, 1, 0]; const [g, x, y] = extGcd(b, a % b); return [g, y, x - Math.floor(a / b) * y]; }

/* ---------- 左栏说明与结果 ---------- */
function updatePrincipleInfo() {
    if (currentMode === 'gcd') {
        principleTitle.textContent = '欧几里得算法（辗转相除）';
        principleFormula.textContent = 'gcd(a, b) = gcd(b, a mod b)，gcd(a, 0) = a';
        principleExplanation.textContent = '每一步用除数去除余数，余数严格变小，必在有限步内变为 0；最后一个非零余数就是最大公因数。';
        politicalMeaning.textContent = '求同存异：在各自的差异（余数）中不断寻找共同部分，最终得到最大的“公约数”。';
        stageTitle.textContent = `欧几里得算法：gcd(${num1}, ${num2})`;
        stageDescription.textContent = '每行一步：a = q·b + r，下一行用 (b, r) 继续，直到余数为 0。';
    } else {
        principleTitle.textContent = '素数与算术基本定理';
        principleFormula.textContent = '素数：大于 1 且只有 1 和自身两个正因子';
        principleExplanation.textContent = '每个大于 1 的整数都能唯一地（不计顺序）写成素数之积。点击任一合数查看分解。';
        politicalMeaning.textContent = '固本培元：素数是构成一切整数的基本元素。';
        stageTitle.textContent = `素数分布：2 ~ ${maxRange}`;
        stageDescription.textContent = '红色为素数，浅色为合数；点击任意数字查看它的素因子分解。';
    }
}

function updateResults() {
    if (currentMode === 'gcd') {
        const g = gcd(num1, num2), steps = euclidSteps(num1, num2);
        resultPanel.innerHTML = `
            <div class="result-item"><span class="result-label">gcd(${num1}, ${num2})</span><span class="result-value">${g}</span></div>
            <div class="result-item"><span class="result-label">除法步数</span><span class="result-value">${steps.length}</span></div>
            <div class="result-item"><span class="result-label">lcm = ab / gcd</span><span class="result-value">${num1 * num2 / g}</span></div>`;
    } else {
        let c = 0; for (let i = 2; i <= maxRange; i++) if (isPrime(i)) c++;
        resultPanel.innerHTML = `
            <div class="result-item"><span class="result-label">数值范围</span><span class="result-value">2 - ${maxRange}</span></div>
            <div class="result-item"><span class="result-label">素数个数 π(${maxRange})</span><span class="result-value">${c}</span></div>
            <div class="result-item"><span class="result-label">合数个数</span><span class="result-value">${maxRange - 1 - c}</span></div>`;
    }
}

/* ---------- 舞台 ---------- */
function renderGcd() {
    const steps = euclidSteps(num1, num2), g = gcd(num1, num2), n = Math.min(shown, steps.length);
    const max = Math.max(num1, num2);
    let rows = '';
    steps.forEach((s, i) => {
        const vis = i < n, last = i === steps.length - 1;
        rows += `<div class="eu-row${vis ? '' : ' eu-hide'}${vis && i === n - 1 && n < steps.length ? ' eu-cur' : ''}">
            <span class="eu-idx">第 ${i + 1} 步</span>
            <span class="eu-eq">${s.a} = <b>${s.q}</b> × ${s.b} + <em class="${s.r === 0 ? 'zero' : ''}">${s.r}</em></span>
            <span class="eu-bar"><i class="eu-b" style="width:${(s.b * s.q / max * 100).toFixed(1)}%"></i><i class="eu-r" style="width:${(s.r / max * 100).toFixed(1)}%"></i></span>
            <span class="eu-note">${vis ? (last ? `余数为 0 ⇒ gcd = ${s.b}` : `gcd(${s.a}, ${s.b}) = gcd(${s.b}, ${s.r})`) : ''}</span>
        </div>`;
    });
    const done = n >= steps.length;
    const [, x, y] = extGcd(num1, num2);
    const f1 = factorize(num1), f2 = factorize(num2), fg = factorize(g);
    vizArea.innerHTML = `
        <div class="eu-player">
            <button type="button" class="apple-btn secondary-btn" id="euPrev">◀ 上一步</button>
            <button type="button" class="apple-btn action-btn" id="euPlay">${timer ? '⏸ 暂停' : '▶ 自动播放'}</button>
            <button type="button" class="apple-btn secondary-btn" id="euNext">下一步 ▶</button>
            <span class="eu-tag">${n} / ${steps.length}</span>
        </div>
        <div class="eu-table">${rows}</div>
        <div class="eu-cards">
            <div class="eu-card ${done ? 'ok' : ''}"><h4>结论</h4><p>${done ? `gcd(${num1}, ${num2}) = <b>${g}</b>${g === 1 ? '，两数<b>互素</b>' : ''}` : '继续下一步，直到余数为 0。'}</p></div>
            <div class="eu-card"><h4>扩展欧几里得（贝祖等式）</h4><p>${done ? `${g} = ${x} × ${num1} ${y < 0 ? '−' : '+'} ${Math.abs(y)} × ${num2}` : '算完后回代，可把 gcd 写成 a、b 的整数组合。'}</p></div>
            <div class="eu-card"><h4>对照素因子分解</h4><p>${num1} = ${factorHtml(f1)}<br>${num2} = ${factorHtml(f2)}<br>公共部分 ${g === 1 ? '为空，gcd = 1' : '= ' + factorHtml(fg) + ' = ' + g}</p></div>
        </div>`;
    document.getElementById('euPrev').disabled = n <= 1;
    document.getElementById('euNext').disabled = done;
    document.getElementById('euPrev').onclick = () => { stop(); shown = Math.max(1, n - 1); renderGcd(); };
    document.getElementById('euNext').onclick = () => { stop(); shown = n + 1; renderGcd(); };
    document.getElementById('euPlay').onclick = play;
    legendPanel.innerHTML = `
        <div class="legend-item"><div class="legend-color" style="background:#D63B1D"></div><span>q × b（整除部分）</span></div>
        <div class="legend-item"><div class="legend-color" style="background:#FFB400"></div><span>余数 r（进入下一步）</span></div>
        <div class="legend-item eu-legend-note">💡 余数每两步至少减半，所以步数约与数的位数成正比——两千多年前的算法至今仍在密码学中使用。</div>`;
}

function stop() { if (timer) { clearInterval(timer); timer = null; } }
function play() {
    const total = euclidSteps(num1, num2).length;
    if (timer) { stop(); renderGcd(); return; }
    if (shown >= total) shown = 1;
    timer = setInterval(() => {
        if (shown >= total) { stop(); renderGcd(); return; }
        shown++; renderGcd();
    }, 900);
    renderGcd();
}

function renderPrimes() {
    let html = '<div class="number-grid">';
    for (let i = 2; i <= maxRange; i++) {
        const p = isPrime(i);
        html += `<button type="button" class="number-card ${p ? 'prime' : 'composite'}${i === picked ? ' picked' : ''}" data-v="${i}"><div class="card-number">${i}</div><div class="card-label">${p ? '素数' : '合数'}</div></button>`;
    }
    html += '</div>';
    const info = picked ? (isPrime(picked) ? `${picked} 是素数，只有 1 和 ${picked} 两个正因子。` : `${picked} = ${factorHtml(factorize(picked))}（唯一分解）`) : '点击任意数字查看它的素因子分解。';
    vizArea.innerHTML = html + `<div class="eu-card ok" style="margin-top:12px"><h4>算术基本定理</h4><p>${info}</p></div>`;
    vizArea.querySelector('.number-grid').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; picked = +b.dataset.v; renderPrimes(); };
    let c = 0; for (let i = 2; i <= maxRange; i++) if (isPrime(i)) c++;
    legendPanel.innerHTML = `
        <div class="legend-item"><div class="legend-color" style="background:linear-gradient(135deg,#D63B1D,#B8321A)"></div><span>素数（${c} 个）</span></div>
        <div class="legend-item"><div class="legend-color" style="background:#f3ebe4"></div><span>合数（${maxRange - 1 - c} 个）</span></div>
        <div class="legend-item eu-legend-note">💡 素数占比 ${(c / (maxRange - 1) * 100).toFixed(1)}%，范围越大占比越低（素数定理：π(N) ≈ N / ln N）。</div>`;
}

function render() {
    updatePrincipleInfo();
    updateResults();
    if (currentMode === 'gcd') renderGcd(); else renderPrimes();
}

function switchMode() {
    stop();
    primeControls.classList.toggle('hidden', currentMode !== 'prime');
    gcdControls.classList.toggle('hidden', currentMode !== 'gcd');
    modeTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-mode') === currentMode));
    render();
}

function reset() {
    stop();
    currentMode = DEF.mode; maxRange = DEF.range; num1 = DEF.a; num2 = DEF.b; shown = Infinity; picked = 0;
    rangeSlider.value = maxRange; rangeValue.textContent = maxRange;
    num1Slider.value = num1; num1Value.textContent = num1;
    num2Slider.value = num2; num2Value.textContent = num2;
    switchMode();
}

modeTabs.forEach(tab => tab.addEventListener('click', () => { currentMode = tab.getAttribute('data-mode'); switchMode(); }));
rangeSlider.addEventListener('input', () => { maxRange = +rangeSlider.value; rangeValue.textContent = maxRange; picked = 0; render(); });
num1Slider.addEventListener('input', () => { stop(); num1 = +num1Slider.value; num1Value.textContent = num1; shown = Infinity; render(); });
num2Slider.addEventListener('input', () => { stop(); num2 = +num2Slider.value; num2Value.textContent = num2; shown = Infinity; render(); });
visualizeBtn.addEventListener('click', () => { if (currentMode !== 'gcd') { currentMode = 'gcd'; switchMode(); } stop(); shown = 1; play(); });
resetBtn.addEventListener('click', reset);

switchMode();
