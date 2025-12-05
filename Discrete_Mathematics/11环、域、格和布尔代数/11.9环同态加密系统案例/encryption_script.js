/**
 * Ring Homomorphic Encryption System
 * 和谐之密 - 环同态加密
 */

// DOM Elements
const paramN = document.getElementById('paramN');
const paramM = document.getElementById('paramM');
const paramK = document.getElementById('paramK');
const inverseDisplay = document.getElementById('inverseDisplay');
const displayN = document.getElementById('displayN');
const displayM = document.getElementById('displayM');

const updateParamsBtn = document.getElementById('updateParamsBtn');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const verifyBtn = document.getElementById('verifyBtn');
const resetBtn = document.getElementById('resetBtn');

const plaintextA = document.getElementById('plaintextA');
const ciphertextA = document.getElementById('ciphertextA');
const ciphertextInput = document.getElementById('ciphertextInput');
const decryptedText = document.getElementById('decryptedText');

const verA = document.getElementById('verA');
const verB = document.getElementById('verB');
const verificationResult = document.getElementById('verificationResult');

const statusText = document.getElementById('statusText');

const plaintextRing = document.getElementById('plaintextRing');
const ciphertextRing = document.getElementById('ciphertextRing');

// System Parameters
let n = 10;  // Plaintext ring Z_n
let m = 17;  // Ciphertext ring Z_m (should be prime for better properties)
let k = 3;   // Key
let kInverse = 6;  // k^-1 mod m

// Initial Setup
const initialParams = { n: 10, m: 17, k: 3 };

/**
 * Extended Euclidean Algorithm
 * Returns [gcd, x, y] where gcd = ax + by
 */
function extendedGCD(a, b) {
    if (b === 0) {
        return [a, 1, 0];
    }

    const [gcd, x1, y1] = extendedGCD(b, a % b);
    const x = y1;
    const y = x1 - Math.floor(a / b) * y1;

    return [gcd, x, y];
}

/**
 * Compute modular multiplicative inverse
 * Returns k^-1 mod m, or null if doesn't exist
 */
function modInverse(k, m) {
    const [gcd, x, _] = extendedGCD(k, m);

    if (gcd !== 1) {
        return null;  // Inverse doesn't exist
    }

    // Make sure result is positive
    return ((x % m) + m) % m;
}

/**
 * Check if two numbers are coprime
 */
function areCoprime(a, b) {
    const [gcd, _, __] = extendedGCD(a, b);
    return gcd === 1;
}

/**
 * Encryption function: E(a) = (a * k) mod m
 */
function encrypt(plaintext, key, modulus) {
    return (plaintext * key) % modulus;
}

/**
 * Decryption function: D(c) = (c * k^-1) mod m
 */
function decrypt(ciphertext, keyInverse, modulus) {
    return (ciphertext * keyInverse) % modulus;
}

/**
 * Update system parameters
 */
function updateParameters() {
    const newN = parseInt(paramN.value);
    const newM = parseInt(paramM.value);
    const newK = parseInt(paramK.value);

    // Validate parameters
    if (newN < 2 || newM < 2 || newK < 1) {
        statusText.textContent = '❌ 参数无效：n, m 必须 ≥ 2，k 必须 ≥ 1';
        statusText.style.color = 'var(--danger-red)';
        return;
    }

    if (newK >= newM) {
        statusText.textContent = '❌ 密钥 k 必须小于模数 m';
        statusText.style.color = 'var(--danger-red)';
        return;
    }

    // Check if k and m are coprime
    if (!areCoprime(newK, newM)) {
        statusText.textContent = `❌ k=${newK} 和 m=${newM} 不互素，无法计算逆元`;
        statusText.style.color = 'var(--danger-red)';
        return;
    }

    // Calculate inverse
    const inverse = modInverse(newK, newM);
    if (inverse === null) {
        statusText.textContent = '❌ 无法计算 k 的逆元';
        statusText.style.color = 'var(--danger-red)';
        return;
    }

    // Update parameters
    n = newN;
    m = newM;
    k = newK;
    kInverse = inverse;

    // Update displays
    inverseDisplay.textContent = kInverse;
    displayN.textContent = n;
    displayM.textContent = m;

    statusText.textContent = `✓ 参数更新成功！k⁻¹ = ${kInverse}`;
    statusText.style.color = 'var(--accent-red)';

    // Clear results
    ciphertextA.textContent = '-';
    decryptedText.textContent = '-';
    verificationResult.innerHTML = '<p class="hint-text">点击"验证同态性"查看结果</p>';

    // Redraw rings
    drawRings();
}

/**
 * Perform encryption
 */
function performEncryption() {
    const a = parseInt(plaintextA.value);

    if (isNaN(a) || a < 0) {
        statusText.textContent = '❌ 请输入有效的明文（≥ 0）';
        statusText.style.color = 'var(--danger-red)';
        return;
    }

    const plainMod = a % n;
    const cipher = encrypt(plainMod, k, m);

    ciphertextA.textContent = cipher;
    ciphertextInput.value = cipher;

    statusText.textContent = `✓ 加密成功：E(${plainMod}) = ${cipher}`;
    statusText.style.color = 'var(--accent-red)';

    // Visualize on rings
    drawRings(plainMod, cipher);
}

/**
 * Perform decryption
 */
function performDecryption() {
    const c = parseInt(ciphertextInput.value);

    if (isNaN(c) || c < 0) {
        statusText.textContent = '❌ 请输入有效的密文（≥ 0）';
        statusText.style.color = 'var(--danger-red)';
        return;
    }

    const cipherMod = c % m;
    const plain = decrypt(cipherMod, kInverse, m);

    // Map back to Z_n
    const plainInN = plain % n;

    decryptedText.textContent = plainInN;

    statusText.textContent = `✓ 解密成功：D(${cipherMod}) = ${plainInN}`;
    statusText.style.color = 'var(--accent-red)';

    // Visualize on rings
    drawRings(plainInN, cipherMod);
}

/**
 * Verify homomorphic property
 */
function verifyHomomorphic() {
    const a = parseInt(verA.value);
    const b = parseInt(verB.value);

    if (isNaN(a) || isNaN(b) || a < 0 || b < 0) {
        statusText.textContent = '❌ 请输入有效的明文值';
        statusText.style.color = 'var(--danger-red)';
        return;
    }

    // Reduce to ring
    const aMod = a % n;
    const bMod = b % n;
    const sumMod = (aMod + bMod) % n;

    // Method 1: E(a+b)
    const encryptSum = encrypt(sumMod, k, m);

    // Method 2: E(a) + E(b)
    const encryptA = encrypt(aMod, k, m);
    const encryptB = encrypt(bMod, k, m);
    const sumEncrypt = (encryptA + encryptB) % m;

    // Check if they're equal
    const isHomomorphic = (encryptSum === sumEncrypt);

    // Display result
    let html = '<div class="result-step"><strong>同态性验证过程：</strong></div>';
    html += `<div class="result-step">明文：a = ${aMod}, b = ${bMod}</div>`;
    html += `<div class="result-step">a + b = ${sumMod} (在 Z<sub>${n}</sub> 中)</div>`;
    html += '<br>';
    html += `<div class="result-step"><strong>方法一：</strong> E(a+b) = E(${sumMod}) = ${encryptSum}</div>`;
    html += '<br>';
    html += `<div class="result-step"><strong>方法二：</strong></div>`;
    html += `<div class="result-step">E(a) = E(${aMod}) = ${encryptA}</div>`;
    html += `<div class="result-step">E(b) = E(${bMod}) = ${encryptB}</div>`;
    html += `<div class="result-step">E(a) + E(b) = ${encryptA} + ${encryptB} = ${sumEncrypt} (在 Z<sub>${m}</sub> 中)</div>`;
    html += '<br>';

    if (isHomomorphic) {
        html += `<div class="result-step success-mark">✓</div>`;
        html += `<div class="result-step"><strong>同态性质成立！</strong> E(a+b) = E(a) + E(b) = ${encryptSum}</div>`;
        statusText.textContent = '✓ 同态性质验证成功！';
        statusText.style.color = 'var(--accent-red)';
    } else {
        html += `<div class="result-step fail-mark">✗</div>`;
        html += `<div class="result-step"><strong>同态性质不成立</strong></div>`;
        statusText.textContent = '⚠ 同态性质验证失败';
        statusText.style.color = 'var(--danger-red)';
    }

    verificationResult.innerHTML = html;
}

/**
 * Reset parameters to initial values
 */
function resetParameters() {
    paramN.value = initialParams.n;
    paramM.value = initialParams.m;
    paramK.value = initialParams.k;
    updateParameters();

    plaintextA.value = 7;
    ciphertextInput.value = 4;
    verA.value = 7;
    verB.value = 5;

    ciphertextA.textContent = '-';
    decryptedText.textContent = '-';
    verificationResult.innerHTML = '<p class="hint-text">点击"验证同态性"查看结果</p>';

    statusText.textContent = '✓ 参数已重置';
    statusText.style.color = 'var(--accent-red)';
}

/**
 * Draw ring structures on canvas
 */
function drawRings(highlightPlaintext = null, highlightCiphertext = null) {
    drawRing(plaintextRing, n, 'Z_' + n, highlightPlaintext, '#d63b1d');
    drawRing(ciphertextRing, m, 'Z_' + m, highlightCiphertext, '#ffb400');
}

/**
 * Draw a single ring on canvas
 */
function drawRing(canvas, size, label, highlight = null, color = '#d63b1d') {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw circle
    ctx.strokeStyle = 'rgba(139, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw elements
    const angleStep = (2 * Math.PI) / size;

    for (let i = 0; i < size; i++) {
        const angle = -Math.PI / 2 + i * angleStep;  // Start from top
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        // Draw element
        ctx.beginPath();
        ctx.arc(x, y, highlight === i ? 12 : 8, 0, 2 * Math.PI);

        if (highlight === i) {
            ctx.fillStyle = color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
        } else {
            ctx.fillStyle = 'rgba(139, 0, 0, 0.3)';
            ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw label
        ctx.fillStyle = '#8b0000';
        ctx.font = '12px "Noto Serif SC"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const labelRadius = radius + 20;
        const labelX = centerX + labelRadius * Math.cos(angle);
        const labelY = centerY + labelRadius * Math.sin(angle);

        ctx.fillText(i.toString(), labelX, labelY);
    }
}

// Event Listeners
updateParamsBtn.addEventListener('click', updateParameters);
encryptBtn.addEventListener('click', performEncryption);
decryptBtn.addEventListener('click', performDecryption);
verifyBtn.addEventListener('click', verifyHomomorphic);
resetBtn.addEventListener('click', resetParameters);

// Initialize
updateParameters();
drawRings();
statusText.textContent = '系统就绪';
