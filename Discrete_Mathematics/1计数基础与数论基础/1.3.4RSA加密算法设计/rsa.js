/**
 * Red Mathematics - RSA Visualizer
 */

// DOM Elements
const pSelect = document.getElementById('pSelect');
const qSelect = document.getElementById('qSelect');
const genKeyBtn = document.getElementById('genKeyBtn');
const msgInput = document.getElementById('msgInput');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const resetBtn = document.getElementById('resetBtn');

const pubKeyCard = document.getElementById('pubKeyCard');
const privKeyCard = document.getElementById('privKeyCard');
const pubKeyVal = document.getElementById('pubKeyVal');
const privKeyVal = document.getElementById('privKeyVal');

const messageObj = document.getElementById('messageObj');
const msgContent = document.getElementById('msgContent');
const calcLog = document.getElementById('calcLog');
const logStep1 = document.getElementById('logStep1');
const logStep2 = document.getElementById('logStep2');

const szTitle = document.getElementById('szTitle');
const szDesc = document.getElementById('szDesc');

// State
let p, q, n, phi, e, d;
let keysGenerated = false;
let encryptedVal = null;
let originalVal = null;

// Helper Functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function modInverse(e, phi) {
    let m0 = phi, t, q;
    let x0 = 0, x1 = 1;

    if (phi == 1) return 0;

    while (e > 1) {
        q = Math.floor(e / phi);
        t = phi;
        phi = e % phi, e = t;
        t = x0;
        x0 = x1 - q * x0;
        x1 = t;
    }

    if (x1 < 0) x1 += m0;
    return x1;
}

function powerMod(base, exp, mod) {
    let res = 1;
    base = base % mod;
    while (exp > 0) {
        if (exp % 2 === 1) res = (res * base) % mod;
        base = (base * base) % mod;
        exp = Math.floor(exp / 2);
    }
    return res;
}

// Logic
async function generateKeys() {
    p = parseInt(pSelect.value);
    q = parseInt(qSelect.value);

    if (p === q) {
        alert("p 和 q 不能相同！");
        return;
    }

    n = p * q;
    phi = (p - 1) * (q - 1);

    // Choose e
    e = 3;
    while (gcd(e, phi) !== 1) {
        e += 2;
    }

    // Calculate d
    d = modInverse(e, phi);

    // Update UI
    pubKeyVal.textContent = `e=${e}, n=${n}`;
    privKeyVal.textContent = `d=${d}, n=${n}`;

    pubKeyCard.classList.remove('hidden');
    await sleep(200);
    privKeyCard.classList.remove('hidden');

    keysGenerated = true;
    encryptBtn.disabled = false;
    genKeyBtn.disabled = true;
    pSelect.disabled = true;
    qSelect.disabled = true;

    szTitle.textContent = '制度建设';
    szDesc.textContent = `密钥对已生成。公钥(e=${e}, n=${n})如同设立了公开的意见箱，私钥(d=${d}, n=${n})则是开启意见箱的唯一凭证，保障了信息安全。`;
}

async function encryptMessage() {
    const m = parseInt(msgInput.value);
    if (isNaN(m) || m >= n) {
        alert(`请输入小于 n (${n}) 的数字`);
        return;
    }

    originalVal = m;

    // Animation: Move from Sender to Channel
    messageObj.classList.remove('hidden');
    messageObj.style.left = '100px'; // Sender pos
    messageObj.className = 'message-obj'; // Reset style
    msgContent.textContent = m;

    calcLog.classList.remove('hidden');
    logStep1.textContent = `加密计算: ${m}^${e} mod ${n} ...`;
    logStep2.textContent = '';

    await sleep(500);

    // Move to center
    messageObj.style.left = '50%';
    await sleep(1000);

    // Encrypt
    encryptedVal = powerMod(m, e, n);
    logStep1.textContent = `加密计算: ${m}^${e} mod ${n} = ${encryptedVal}`;

    // Change visual
    messageObj.classList.add('encrypted');
    msgContent.textContent = encryptedVal;

    szTitle.textContent = '建言献策';
    szDesc.textContent = '群众将心声（明文）投入红色信箱，经过加密处理（公钥加密），确保在传输过程中即使被截获也无法被解读。';

    encryptBtn.disabled = true;
    decryptBtn.disabled = false;
}

async function decryptMessage() {
    // Move to Receiver
    messageObj.style.left = 'calc(100% - 100px)';

    logStep2.textContent = `解密计算: ${encryptedVal}^${d} mod ${n} ...`;

    await sleep(1000);

    // Decrypt
    const decrypted = powerMod(encryptedVal, d, n);
    logStep2.textContent = `解密计算: ${encryptedVal}^${d} mod ${n} = ${decrypted}`;

    // Change visual back
    messageObj.classList.remove('encrypted');
    msgContent.textContent = decrypted;

    szTitle.textContent = '倾听民意';
    szDesc.textContent = '党组织使用金钥匙（私钥）开启信箱，还原群众心声（解密）。这象征着对人民意见的高度重视和有效反馈。';

    decryptBtn.disabled = true;
}

// Event Listeners
genKeyBtn.addEventListener('click', generateKeys);
encryptBtn.addEventListener('click', encryptMessage);
decryptBtn.addEventListener('click', decryptMessage);

resetBtn.addEventListener('click', () => {
    keysGenerated = false;
    encryptedVal = null;
    originalVal = null;

    pubKeyCard.classList.add('hidden');
    privKeyCard.classList.add('hidden');
    messageObj.classList.add('hidden');
    calcLog.classList.add('hidden');

    genKeyBtn.disabled = false;
    pSelect.disabled = false;
    qSelect.disabled = false;
    encryptBtn.disabled = true;
    decryptBtn.disabled = true;

    messageObj.style.left = '100px';
    msgInput.value = '5';

    szTitle.textContent = '群众路线';
    szDesc.textContent = '红色信箱（公钥）面向广大群众开放，任何人都可以投递建议（加密）；只有党组织掌握金钥匙（私钥），才能开启信箱，倾听心声（解密）。';
});

// Init
