/**
 * Red Mathematics - Checksum Visualizer (Weighted Mod 11)
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
let weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]; // Standard weights
let checkCodeMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
let isGenerated = false;
let isTampered = false;

// Helper Functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateCheckCode(digits) {
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        sum += digits[i] * weights[i];
    }
    const mod = sum % 11;
    return checkCodeMap[mod];
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
            <span class="weight-badge">×${weights[i]}</span>
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
    if (!/^\d{6}$/.test(input)) {
        alert("请输入6位数字指令代码");
        return;
    }

    currentCode = input.split('').map(Number);
    isGenerated = true;
    isTampered = false;

    // 1. Render initial code
    renderCode(currentCode);
    generateBtn.disabled = true;
    codeInput.disabled = true;

    // 2. Calculate
    const checkDigit = calculateCheckCode(currentCode);

    // 3. Show calculation details
    calcDetails.classList.remove('hidden');
    let sumStr = currentCode.map((d, i) => `${d}×${weights[i]}`).join(' + ');
    let sumVal = currentCode.reduce((acc, d, i) => acc + d * weights[i], 0);

    sumFormula.textContent = `${sumStr} = ${sumVal}`;
    await sleep(500);

    modFormula.textContent = `${sumVal} % 11 = ${sumVal % 11}`;
    await sleep(500);

    mapFormula.textContent = `${sumVal % 11} → ${checkDigit}`;
    await sleep(500);

    // 4. Append Check Digit
    renderCode(currentCode, checkDigit);

    // Enable actions
    tamperBtn.disabled = false;
    verifyBtn.disabled = false;

    szTitle.textContent = '铁的纪律';
    szDesc.textContent = '校验码已生成。每一位数字（指令）都承载着特定的责任权重，共同决定了最终的校验结果（执行标准）。';
}

function tamperCode() {
    if (!isGenerated) return;

    // Randomly change one digit
    const idx = Math.floor(Math.random() * currentCode.length);
    const oldVal = currentCode[idx];
    let newVal = (oldVal + 1) % 10;
    currentCode[idx] = newVal;

    renderCode(currentCode, calculateCheckCode(codeInput.value.split('').map(Number))); // Keep original check digit

    const box = codeContainer.children[idx];
    box.classList.add('tampered');
    isTampered = true;
    resultStamp.className = 'result-stamp hidden';

    szTitle.textContent = '发现偏差';
    szDesc.textContent = '指令代码已被篡改！这象征着在执行过程中出现了偏差（形式主义、官僚主义），必须立即纠正。';
}

async function verifyIntegrity() {
    // Get current displayed check digit
    const displayedCheckDigit = codeContainer.lastElementChild.querySelector('.digit').textContent;

    // Recalculate based on current data digits
    const calculatedCheckDigit = calculateCheckCode(currentCode);

    calcDetails.classList.remove('hidden');
    let sumVal = currentCode.reduce((acc, d, i) => acc + d * weights[i], 0);

    sumFormula.textContent = `当前求和: ${sumVal}`;
    modFormula.textContent = `当前取模: ${sumVal % 11}`;
    mapFormula.textContent = `计算结果: ${calculatedCheckDigit} (应为: ${displayedCheckDigit})`;

    await sleep(500);

    if (calculatedCheckDigit === displayedCheckDigit) {
        // Success
        resultStamp.className = 'result-stamp visible success';
        stampText.textContent = '核验通过';
        szTitle.textContent = '政令畅通';
        szDesc.textContent = '经核验，指令完整无误。体现了严格的纪律性和执行力，确保了党中央的决策部署不折不扣地落实。';
    } else {
        // Fail
        resultStamp.className = 'result-stamp visible fail';
        stampText.textContent = '核验驳回';
        szTitle.textContent = '纪律审查';
        szDesc.textContent = '核验失败！检测到指令内容与校验码不符。必须严明纪律，追究责任，确保信息的真实性和准确性。';
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
    codeContainer.innerHTML = '';
    calcDetails.classList.add('hidden');
    resultStamp.className = 'result-stamp hidden';
    generateBtn.disabled = false;
    codeInput.disabled = false;
    tamperBtn.disabled = true;
    verifyBtn.disabled = true;
    codeInput.value = '192107';
    szTitle.textContent = '铁的纪律';
    szDesc.textContent = '革命指令的传达必须准确无误（完整性），任何微小的偏差（错误）都可能导致严重的后果。';
});

// Init
