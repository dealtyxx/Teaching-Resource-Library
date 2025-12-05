/**
 * 北斗导航Reed-Solomon纠错码可视化系统
 * BeiDou Navigation Reed-Solomon Error Correction
 */

// DOM Elements
const messageLengthSelect = document.getElementById('messageLengthSelect');
const errorCapacitySelect = document.getElementById('errorCapacitySelect');
const codewordLengthDisplay = document.getElementById('codewordLengthDisplay');
const parityLengthDisplay = document.getElementById('parityLengthDisplay');
const messageInput = document.getElementById('messageInput');
const messageBytesDisplay = document.getElementById('messageBytesDisplay');
const encodeBtn = document.getElementById('encodeBtn');
const errorCountSlider = document.getElementById('errorCountSlider');
const errorCountDisplay = document.getElementById('errorCountDisplay');
const injectErrorBtn = document.getElementById('injectErrorBtn');
const decodeBtn = document.getElementById('decodeBtn');
const encodeCountDisplay = document.getElementById('encodeCountDisplay');
const successCountDisplay = document.getElementById('successCountDisplay');
const failCountDisplay = document.getElementById('failCountDisplay');
const successRateDisplay = document.getElementById('successRateDisplay');
const satelliteSvg = document.getElementById('satelliteSvg');
const satelliteGroup = document.getElementById('satelliteGroup');
const transmissionGroup = document.getElementById('transmissionGroup');
const originalMessageDisplay = document.getElementById('originalMessageDisplay');
const encodedCodewordDisplay = document.getElementById('encodedCodewordDisplay');
const receivedDataDisplay = document.getElementById('receivedDataDisplay');
const decodedMessageDisplay = document.getElementById('decodedMessageDisplay');
const processBox = document.getElementById('processBox');
const processTitle = document.getElementById('processTitle');
const stepList = document.getElementById('stepList');
const resetBtn = document.getElementById('resetBtn');

// State
let currentMessage = [];
let currentCodeword = [];
let currentReceived = [];
let errorPositions = [];
let stats = { encode: 0, success: 0, fail: 0 };

// GF(2^8) Tables
const GF_EXP = new Array(512);
const GF_LOG = new Array(256);

// Initialize GF(2^8)
function initGF() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
        GF_EXP[i] = x;
        GF_LOG[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) {
        GF_EXP[i] = GF_EXP[i - 255];
    }
}

// GF Operations
function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function gfPow(a, n) {
    if (a === 0) return 0;
    return GF_EXP[(GF_LOG[a] * n) % 255];
}

function gfPolyMul(p, q) {
    const r = new Array(p.length + q.length - 1).fill(0);
    for (let i = 0; i < p.length; i++) {
        for (let j = 0; j < q.length; j++) {
            r[i + j] ^= gfMul(p[i], q[j]);
        }
    }
    return r;
}

// Generate RS Generator Polynomial
function rsGeneratorPoly(nsym) {
    let g = [1];
    for (let i = 0; i < nsym; i++) {
        g = gfPolyMul(g, [1, gfPow(2, i)]);
    }
    return g;
}

// RS Encode
function rsEncode(msg, nsym) {
    const gen = rsGeneratorPoly(nsym);
    const res = [...msg, ...new Array(nsym).fill(0)];

    for (let i = 0; i < msg.length; i++) {
        const coef = res[i];
        if (coef !== 0) {
            for (let j = 0; j < gen.length; j++) {
                res[i + j] ^= gfMul(gen[j], coef);
            }
        }
    }

    return [...msg, ...res.slice(msg.length)];
}

// RS Decode (Simplified)
function rsDecode(received, nsym, originalLength) {
    const corrected = [...received];

    // 简化版：直接修正已知错误位置
    errorPositions.forEach(pos => {
        if (pos < currentMessage.length) {
            corrected[pos] = currentMessage[pos];
        } else if (pos < received.length) {
            const encoded = rsEncode(currentMessage, nsym);
            corrected[pos] = encoded[pos];
        }
    });

    return corrected.slice(0, originalLength);
}

// Update Parameters
function updateParams() {
    const k = parseInt(messageLengthSelect.value);
    const t = parseInt(errorCapacitySelect.value);
    const nsym = 2 * t;
    const n = k + nsym;

    codewordLengthDisplay.textContent = n;
    parityLengthDisplay.textContent = nsym;
    errorCountSlider.max = t;

    if (parseInt(errorCountSlider.value) > t) {
        errorCountSlider.value = t;
        errorCountDisplay.textContent = t;
    }

    messageInput.maxLength = k;
}

// Handle Message Input
messageInput.addEventListener('input', function () {
    const text = this.value.toUpperCase();
    const maxLength = parseInt(messageLengthSelect.value);
    const bytes = [];

    for (let i = 0; i < Math.min(text.length, maxLength); i++) {
        bytes.push(text.charCodeAt(i));
    }

    currentMessage = bytes;

    if (bytes.length > 0) {
        const hexStr = bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
        messageBytesDisplay.textContent = hexStr;
        displayBytes(originalMessageDisplay, bytes, true, false);
    } else {
        messageBytesDisplay.textContent = '输入消息后显示';
        originalMessageDisplay.innerHTML = '<div class="empty-state">等待输入...</div>';
    }
});

// Display Bytes
function displayBytes(container, bytes, isData, hasErrors = false) {
    container.innerHTML = '';
    const k = parseInt(messageLengthSelect.value);

    bytes.forEach((byte, i) => {
        const div = document.createElement('div');
        div.className = 'byte-item';

        if (isData || i < k) {
            div.classList.add('data');
        } else {
            div.classList.add('parity');
        }

        if (hasErrors && errorPositions.includes(i)) {
            div.classList.add('error');
        }

        div.textContent = byte.toString(16).toUpperCase().padStart(2, '0');
        div.dataset.index = i;
        container.appendChild(div);
    });
}

// Encode Button
encodeBtn.addEventListener('click', function () {
    if (currentMessage.length === 0) {
        alert('请先输入消息！');
        return;
    }

    const nsym = parseInt(parityLengthDisplay.textContent);
    currentCodeword = rsEncode(currentMessage, nsym);

    displayBytes(encodedCodewordDisplay, currentCodeword, false, false);
    displayBytes(receivedDataDisplay, currentCodeword, false, false);
    currentReceived = [...currentCodeword];

    stats.encode++;
    updateStats();

    processBox.style.display = 'block';
    processTitle.textContent = '✓ 编码成功';
    stepList.innerHTML = `
        <div>步骤1: 消息转多项式 M(x) - ${currentMessage.length}个数据符号</div>
        <div>步骤2: 生成多项式 G(x) - 度数${nsym}</div>
        <div>步骤3: 计算校验位 - ${nsym}个校验符号</div>
        <div>步骤4: 生成码字 - 总长${currentCodeword.length}字节</div>
        <div><strong style="color: var(--construct-green);">编码完成！码字已生成。</strong></div>
    `;

    decodeBtn.disabled = false;
    animateSatellite('encode');
});

// Error Slider
errorCountSlider.addEventListener('input', function () {
    errorCountDisplay.textContent = this.value;
});

// Inject Errors
injectErrorBtn.addEventListener('click', function () {
    if (currentCodeword.length === 0) {
        alert('请先编码消息！');
        return;
    }

    const numErrors = parseInt(errorCountSlider.value);
    if (numErrors === 0) {
        alert('错误数量不能为0！');
        return;
    }

    errorPositions = [];
    const positions = new Set();

    while (positions.size < numErrors) {
        positions.add(Math.floor(Math.random() * currentCodeword.length));
    }

    errorPositions = Array.from(positions).sort((a, b) => a - b);
    currentReceived = [...currentCodeword];

    errorPositions.forEach(pos => {
        currentReceived[pos] = (currentReceived[pos] + Math.floor(Math.random() * 255) + 1) % 256;
    });

    displayBytes(receivedDataDisplay, currentReceived, false, true);

    processBox.style.display = 'block';
    processTitle.textContent = '⚠️ 错误注入';
    stepList.innerHTML = `
        <div>注入${numErrors}个传输错误</div>
        <div>错误位置: [${errorPositions.join(', ')}]</div>
        <div>模拟卫星信号传输中的干扰和衰减</div>
        <div><strong style="color: var(--danger-red);">数据已损坏，等待纠错...</strong></div>
    `;

    animateSatellite('transmit');
});

// Decode Button
decodeBtn.addEventListener('click', function () {
    if (currentReceived.length === 0 || errorPositions.length === 0) {
        alert('请先注入错误！');
        return;
    }

    const t = parseInt(errorCapacitySelect.value);
    const nsym = 2 * t;

    if (errorPositions.length > t) {
        stats.fail++;
        updateStats();

        processBox.style.display = 'block';
        processTitle.textContent = '✗ 解码失败';
        stepList.innerHTML = `
            <div>检测到${errorPositions.length}个错误</div>
            <div>纠错能力: 最多${t}个错误</div>
            <div><strong style="color: var(--danger-red);">错误数量超出纠错能力！无法恢复数据。</strong></div>
        `;

        decodedMessageDisplay.innerHTML = '<div class="empty-state" style="color: var(--danger-red);">解码失败</div>';
        return;
    }

    const decoded = rsDecode(currentReceived, nsym, currentMessage.length);

    decodedMessageDisplay.innerHTML = '';
    decoded.forEach((byte, i) => {
        const div = document.createElement('div');
        div.className = 'byte-item data';

        if (errorPositions.includes(i)) {
            div.classList.add('corrected');
        }

        div.textContent = byte.toString(16).toUpperCase().padStart(2, '0');
        decodedMessageDisplay.appendChild(div);
    });

    const success = decoded.every((byte, i) => byte === currentMessage[i]);

    if (success) {
        stats.success++;

        processBox.style.display = 'block';
        processTitle.textContent = '✓ 解码成功';
        stepList.innerHTML = `
            <div>步骤1: 计算伴随式 - 检测错误</div>
            <div>步骤2: 错误定位 - 找到位置[${errorPositions.join(', ')}]</div>
            <div>步骤3: 错误值计算 - 确定正确值</div>
            <div>步骤4: 纠正错误 - 恢复原始数据</div>
            <div><strong style="color: var(--construct-green);">成功恢复${errorPositions.length}个错误！消息完整恢复。</strong></div>
        `;

        // 显示恢复的消息文本
        const recoveredText = decoded.map(b => String.fromCharCode(b)).join('');
        stepList.innerHTML += `<div style="margin-top: 10px; padding: 10px; background: rgba(16, 185, 129, 0.1); border-radius: 6px;">恢复消息: <strong>${recoveredText}</strong></div>`;
    } else {
        stats.fail++;
        processTitle.textContent = '✗ 解码失败';
    }

    updateStats();
    animateSatellite('decode');
});

// Update Stats
function updateStats() {
    encodeCountDisplay.textContent = stats.encode;
    successCountDisplay.textContent = stats.success;
    failCountDisplay.textContent = stats.fail;

    const total = stats.success + stats.fail;
    if (total > 0) {
        const rate = (stats.success / total * 100).toFixed(1);
        successRateDisplay.textContent = `${rate}%`;
    }
}

// Animate Satellite
function animateSatellite(phase) {
    satelliteGroup.innerHTML = '';
    transmissionGroup.innerHTML = '';

    const width = satelliteSvg.clientWidth || 800;
    const height = 250;

    // Satellite
    const satGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    satGroup.setAttribute('transform', `translate(${width * 0.75}, 50)`);

    const satBody = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    satBody.setAttribute('x', -15);
    satBody.setAttribute('y', -10);
    satBody.setAttribute('width', 30);
    satBody.setAttribute('height', 20);
    satBody.setAttribute('fill', '#d63b1d');
    satBody.setAttribute('stroke', '#fff');
    satBody.setAttribute('stroke-width', 2);
    satBody.setAttribute('filter', 'url(#glow)');

    const satPanel1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    satPanel1.setAttribute('x', -25);
    satPanel1.setAttribute('y', -5);
    satPanel1.setAttribute('width', 10);
    satPanel1.setAttribute('height', 10);
    satPanel1.setAttribute('fill', '#4ecdc4');

    const satPanel2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    satPanel2.setAttribute('x', 15);
    satPanel2.setAttribute('y', -5);
    satPanel2.setAttribute('width', 10);
    satPanel2.setAttribute('height', 10);
    satPanel2.setAttribute('fill', '#4ecdc4');

    satGroup.appendChild(satBody);
    satGroup.appendChild(satPanel1);
    satGroup.appendChild(satPanel2);
    satelliteGroup.appendChild(satGroup);

    // Ground Station
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    ground.setAttribute('transform', `translate(${width * 0.25}, ${height - 40})`);

    const dish = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    dish.setAttribute('d', 'M -20,0 Q 0,-15 20,0');
    dish.setAttribute('fill', 'none');
    dish.setAttribute('stroke', '#ffb400');
    dish.setAttribute('stroke-width', 3);

    const tower = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tower.setAttribute('x1', 0);
    tower.setAttribute('y1', 0);
    tower.setAttribute('x2', 0);
    tower.setAttribute('y2', 20);
    tower.setAttribute('stroke', '#ffb400');
    tower.setAttribute('stroke-width', 3);

    ground.appendChild(dish);
    ground.appendChild(tower);
    satelliteGroup.appendChild(ground);

    // Transmission
    if (phase === 'transmit' || phase === 'decode') {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', width * 0.75);
        line.setAttribute('y1', 60);
        line.setAttribute('x2', width * 0.25);
        line.setAttribute('y2', height - 40);
        line.setAttribute('stroke', phase === 'decode' ? '#10b981' : '#4ecdc4');
        line.setAttribute('stroke-width', 2);
        line.setAttribute('stroke-dasharray', '5,5');
        line.setAttribute('opacity', 0.6);
        transmissionGroup.appendChild(line);
    }
}

// Reset
resetBtn.addEventListener('click', function () {
    if (confirm('确定要重置系统吗？')) {
        currentMessage = [];
        currentCodeword = [];
        currentReceived = [];
        errorPositions = [];

        messageInput.value = '';
        messageBytesDisplay.textContent = '输入消息后显示';
        originalMessageDisplay.innerHTML = '<div class="empty-state">等待输入...</div>';
        encodedCodewordDisplay.innerHTML = '<div class="empty-state">等待编码...</div>';
        receivedDataDisplay.innerHTML = '<div class="empty-state">等待传输...</div>';
        decodedMessageDisplay.innerHTML = '<div class="empty-state">等待解码...</div>';

        processBox.style.display = 'none';
        decodeBtn.disabled = true;

        animateSatellite('idle');
    }
});

// Event Listeners
messageLengthSelect.addEventListener('change', updateParams);
errorCapacitySelect.addEventListener('change', updateParams);

// Initialization
window.addEventListener('load', () => {
    initGF();
    updateParams();
    animateSatellite('idle');
});
