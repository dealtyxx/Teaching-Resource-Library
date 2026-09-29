/**
 * Red Mathematics - Checksum Visualizer (ISO 7064 MOD 11-2)
 */

// DOM Elements
const codeInput = document.getElementById('codeInput');
const generateBtn = document.getElementById('generateBtn');
const tamperBtn = document.getElementById('tamperBtn');
const verifyBtn = document.getElementById('verifyBtn');
const resetBtn = document.getElementById('resetBtn');
const codeContainer = document.getElementById('codeContainer');
const calcDetails = document.getElementById('calcDetails');
const sumFormula = document.getElementById('sumFormula');
const modFormula = document.getElementById('modFormula');
const mapFormula = document.getElementById('mapFormula');
const resultStamp = document.getElementById('resultStamp');
const stampText = document.getElementById('stampText');
const szTitle = document.getElementById('szTitle');
const szDesc = document.getElementById('szDesc');

// State
let currentCode = []; // Array of integers
let originalCheckDigit = null;
let isGenerated = false;
let isTampered = false;

const weightFormula = document.getElementById('weightFormula');
const hintBox = document.getElementById('hintBox');
function showHint(t) { hintBox.textContent = t; hintBox.classList.toggle('hidden', !t); }
// 等价的加权和写法：Wᵢ = 2^(n+1−i) mod 11，S = Σ aᵢWᵢ，校验字符 C 满足 S + C ≡ 1 (mod 11)
function weightedView(digits, data) {
    const n = digits.length;
    let S = 0;
    const terms = digits.map((d, i) => { const w = Math.pow(2, n - i) % 11; S += d * w; return `${d}×${w}`; });
    return `S = ${terms.join(' + ')} = ${S}，S mod 11 = ${S % 11}（与递推终止状态一致），C = (12 − ${S % 11}) mod 11 = ${data.checkDigit}`;
}

// Helper Functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateCheckCode(digits) {
    let state = 0;
    const steps = [];

    for (let i = 0; i < digits.length; i++) {
        const prevState = state;
        state = (2 * (state + digits[i])) % 11;
        steps.push({
            index: i + 1,
            digit: digits[i],
            prevState,
            nextState: state
        });
    }

    const checkValue = (12 - state) % 11;
    return {
        checkDigit: checkValue === 10 ? 'X' : String(checkValue),
        finalState: state,
        checkValue,
        steps
    };
}

function renderCode(digits, checkDigit = null) {
    codeContainer.innerHTML = '';

    // Render data digits
    digits.forEach((d, i) => {
        const box = document.createElement('div');
        box.className = 'digit-box';
        if (isGenerated) box.classList.add('editable');
        box.innerHTML = `
            <span class="digit">${d}</span>
            <span class="weight-badge">P${i + 1}</span>
        `;

        // Click to tamper
        box.addEventListener('click', () => {
            if (isGenerated && !box.classList.contains('check-digit')) {
                const newVal = (d + 1) % 10;
                currentCode[i] = newVal;
                renderCode(currentCode, checkDigit); // Re-render
                const newBox = codeContainer.children[i];
                newBox.classList.add('tampered');
                isTampered = true;
                verifyBtn.disabled = false;
                resultStamp.className = 'result-stamp hidden'; // Hide previous result
            }
        });

        codeContainer.appendChild(box);
    });

    // Render check digit
    if (checkDigit !== null) {
        const box = document.createElement('div');
        box.className = 'digit-box check-digit';
        box.innerHTML = `
            <span class="digit">${checkDigit}</span>
            <span class="weight-badge">Check</span>
        `;
        codeContainer.appendChild(box);
    }

    // Show weights if generated
    if (isGenerated) {
        setTimeout(() => {
            document.querySelectorAll('.digit-box').forEach(b => b.classList.add('show-weight'));
        }, 100);
    }
}

async function generateChecksum() {
    const input = codeInput.value.trim();
    if (!/^\d{1,17}$/.test(input)) {
        showHint('请输入 1 ~ 17 位数字作为主体码（身份证本体码为 17 位）。');
        return;
    }
    showHint('');

    currentCode = input.split('').map(Number);
    isGenerated = true;
    isTampered = false;

    // 1. Render initial code
    renderCode(currentCode);

    // 2. Calculate
    const checkData = calculateCheckCode(currentCode);
    originalCheckDigit = checkData.checkDigit;

    // 3. Show calculation details
    calcDetails.classList.remove('hidden');
    const stepSummary = checkData.steps
        .map(step => `P${step.index}=2×(${step.prevState}+${step.digit}) mod 11=${step.nextState}`)
        .join(' → ');

    sumFormula.textContent = `P0=0，${stepSummary}`;
    await sleep(500);

    modFormula.textContent = `P${checkData.steps.length} = ${checkData.finalState}`;
    await sleep(500);

    mapFormula.textContent = `C = (12 − ${checkData.finalState}) mod 11 = ${checkData.checkValue}${checkData.checkValue === 10 ? '，记为 X' : ''}`;
    weightFormula.innerHTML = weightedView(currentCode, checkData);
    await sleep(500);

    // 4. Append Check Digit
    renderCode(currentCode, checkData.checkDigit);

    // Enable actions
    tamperBtn.disabled = false;
    verifyBtn.disabled = false;

    szTitle.textContent = '严谨把关';
    szDesc.textContent = '校验码已生成。主体码按照 ISO 7064 MOD 11-2 的递推规则生成校验字符，用于核验信息是否保持完整。';
}

function tamperCode() {
    if (!isGenerated) return;

    // Randomly change one digit
    const idx = Math.floor(Math.random() * currentCode.length);
    const oldVal = currentCode[idx];
    let newVal = (oldVal + 1) % 10;
    currentCode[idx] = newVal;

    renderCode(currentCode, originalCheckDigit);

    const box = codeContainer.children[idx];
    box.classList.add('tampered');
    isTampered = true;
    resultStamp.className = 'result-stamp hidden';

    szTitle.textContent = '发现偏差';
    szDesc.textContent = `第 ${idx + 1} 位被改动（${oldVal} → ${newVal}）。点击“核验”，看校验字符能否当场发现这处差错。`;
}

async function verifyIntegrity() {
    // Get current displayed check digit
    const displayedCheckDigit = codeContainer.lastElementChild.querySelector('.digit').textContent;

    // Recalculate based on current data digits
    const checkData = calculateCheckCode(currentCode);

    calcDetails.classList.remove('hidden');
    const stepSummary = checkData.steps
        .map(step => `P${step.index}=2×(${step.prevState}+${step.digit}) mod 11=${step.nextState}`)
        .join(' → ');

    sumFormula.textContent = `P0=0，${stepSummary}`;
    modFormula.textContent = `P${checkData.steps.length} = ${checkData.finalState}`;
    mapFormula.textContent = `计算结果: ${checkData.checkDigit} (应为: ${displayedCheckDigit})`;

    await sleep(500);

    if (checkData.checkDigit === displayedCheckDigit) {
        // Success
        resultStamp.className = 'result-stamp visible success';
        stampText.textContent = '核验通过';
        szTitle.textContent = '核验通过';
        szDesc.textContent = '重新计算的校验字符与收到的一致，数据完整无误——一道低成本的模运算关卡守住了信息的准确。';
    } else {
        // Fail
        resultStamp.className = 'result-stamp visible fail';
        stampText.textContent = '核验驳回';
        szTitle.textContent = '差错拦截';
        szDesc.textContent = 'MOD 11-2 能查出任意单个数字错误和相邻两位换位：重算结果与校验字符不符，差错被当场拦下。';
    }
}

// Event Listeners
generateBtn.addEventListener('click', generateChecksum);
tamperBtn.addEventListener('click', tamperCode);
verifyBtn.addEventListener('click', verifyIntegrity);

resetBtn.addEventListener('click', () => {
    isGenerated = false;
    isTampered = false;
    currentCode = [];
    originalCheckDigit = null;
    codeContainer.innerHTML = '';
    calcDetails.classList.add('hidden');
    resultStamp.className = 'result-stamp hidden';
    generateBtn.disabled = false;
    codeInput.disabled = false;
    tamperBtn.disabled = true;
    verifyBtn.disabled = true;
    codeInput.value = '11010519491231002';
    weightFormula.textContent = '';
    showHint('');
    szTitle.textContent = '严谨把关';
    szDesc.textContent = '信息传递必须准确无误，任何微小的偏差都可能导致严重后果。校验字符以一位冗余守住数据的完整性。';
    generateChecksum();
});

// Init
generateChecksum();
