/**
 * 1.3.1 哈希函数设计 · 进阶层：冲突与处理
 * h(k) = (字符编码之和) mod m；冲突处理可选「链地址法」或「线性探测（开放定址）」；
 * 实时统计装填因子 α、冲突次数与平均查找长度，演示模数取素数与扩容的意义。
 */
const $ = id => document.getElementById(id);
const voiceInput = $('voiceInput'), bucketsContainer = $('bucketsContainer');
const inputDisplay = $('inputDisplay'), inputContent = $('inputContent'), processDisplay = $('processDisplay');
const calcFormula = $('calcFormula'), calcResult = $('calcResult'), statsBox = $('hashStats');
const DEFAULT_KEYS = ['绿水青山', '依法治国', '共同富裕', '文化自信', '科技创新', '乡村振兴'];
let keys = DEFAULT_KEYS.slice();
let lastKey = keys[keys.length - 1];
let notice = '';

function codeSum(s) { let t = 0; for (const ch of s) t += ch.codePointAt(0); return t; }
function hashOf(s, m) { const sum = codeSum(s); return { sum, h: sum % m }; }

// 按当前策略把全部键依次插入，返回表结构与统计
function build(m, method) {
    const table = Array.from({ length: m }, () => []);
    let collisions = 0, probesTotal = 0, overflow = [];
    const probeLog = {};
    keys.forEach(k => {
        const { h } = hashOf(k, m);
        if (method === 'chain') {
            if (table[h].length) collisions++;
            table[h].push(k); probesTotal += table[h].length; probeLog[k] = [h];
        } else {
            let i = h, steps = [h];
            while (table[i].length && steps.length <= m) { i = (i + 1) % m; steps.push(i); }
            if (steps.length > m) { overflow.push(k); return; }
            if (steps.length > 1) collisions++;
            table[i].push(k); probesTotal += steps.length; probeLog[k] = steps;
        }
    });
    const stored = keys.length - overflow.length;
    return { table, collisions, asl: stored ? probesTotal / stored : 0, overflow, probeLog, stored };
}

function render() {
    const m = +$('tableSize').value, method = $('hashMethod').value;
    const B = build(m, method), alpha = B.stored / m;
    bucketsContainer.style.gridTemplateColumns = `repeat(${m}, minmax(0, 1fr))`;
    const lastSlots = lastKey && B.probeLog[lastKey] ? B.probeLog[lastKey] : [];
    bucketsContainer.innerHTML = B.table.map((list, i) => `
        <div class="bucket-column">
            <div class="bucket-header${lastSlots[lastSlots.length - 1] === i ? ' active' : ''}${list.length > 1 ? ' crowded' : ''}">
                <div class="bucket-index">桶 ${i}</div>
                <div class="bucket-name">${method === 'chain' ? list.length + ' 个' : (list.length ? '已占用' : '空')}</div>
            </div>
            <div class="bucket-list">${list.map(k => { const home = hashOf(k, m).h; return `<div class="chain-node${home !== i ? ' moved' : ''}${k === lastKey ? ' latest' : ''}" title="h = ${home}">${k}${home !== i ? `<small>本应在 ${home}</small>` : ''}</div>`; }).join('')}</div>
        </div>`).join('');
    if (lastKey) {
        const { sum, h } = hashOf(lastKey, m);
        inputContent.textContent = lastKey;
        calcFormula.textContent = `编码和 = ${sum}`;
        calcResult.textContent = method === 'chain' ? `${sum} mod ${m} = ${h}` : `${sum} mod ${m} = ${h}` + (lastSlots.length > 1 ? ` → 探测 ${lastSlots.join('→')}` : '');
        inputDisplay.classList.remove('hidden'); processDisplay.classList.remove('hidden');
    } else { inputDisplay.classList.add('hidden'); processDisplay.classList.add('hidden'); }
    const hint = alpha > 0.75 ? `α = ${alpha.toFixed(2)} 已超过 0.75，冲突会迅速增多，工程上此时应<b>扩容</b>（常取约 2 倍的素数表长）并重新散列。`
        : (m % 2 === 0 || m % 5 === 0 ? `表长 m = ${m} 不是素数：若键的编码和有公共规律（如都是偶数），会集中到少数桶，试试素数 7、11、13。` : `表长 m = ${m} 为素数，分布较均匀。`);
    statsBox.innerHTML = `
        <div class="stat"><span>键数 n</span><b>${keys.length}</b></div>
        <div class="stat"><span>装填因子 α = n/m</span><b>${alpha.toFixed(2)}</b></div>
        <div class="stat"><span>发生冲突的插入</span><b class="${B.collisions ? 'no' : 'ok'}">${B.collisions}</b></div>
        <div class="stat"><span>平均查找长度</span><b>${B.asl.toFixed(2)}</b></div>
        <p class="stat-note">${notice || ''}${B.overflow.length ? `表已满，${B.overflow.join('、')} 无处可放——开放定址要求 n ≤ m。` : ''}${keys.length > m && method === 'chain' ? `n = ${keys.length} > m = ${m}，由鸽巢原理必有冲突。` : ''} ${hint}</p>`;
    notice = '';
}

function insert(text) {
    text = (text || '').trim();
    if (!text) { notice = '请输入要插入的关键词。'; render(); return; }
    if (keys.includes(text)) { notice = `“${text}” 已在表中：哈希是确定性的，重复插入会落到同一位置，这里不重复存储。`; lastKey = text; render(); return; }
    if (keys.length >= 20) { notice = '演示最多 20 个键，请先重置。'; render(); return; }
    keys.push(text); lastKey = text; voiceInput.value = ''; render();
}

$('submitBtn').addEventListener('click', () => insert(voiceInput.value));
voiceInput.addEventListener('keydown', e => { if (e.key === 'Enter') insert(voiceInput.value); });
document.querySelectorAll('.tag').forEach(tag => tag.addEventListener('click', () => insert(tag.dataset.val)));
$('hashMethod').addEventListener('change', render);
$('tableSize').addEventListener('change', render);
$('resetBtn').addEventListener('click', () => {
    keys = DEFAULT_KEYS.slice(); lastKey = keys[keys.length - 1];
    $('hashMethod').value = 'chain'; $('tableSize').value = '7'; voiceInput.value = ''; render();
});
render();
