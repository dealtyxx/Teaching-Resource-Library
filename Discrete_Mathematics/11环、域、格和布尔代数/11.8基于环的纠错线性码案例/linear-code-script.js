/**
 * 环理论纠错线性码可视化系统
 * Ring Theory Error-Correcting Linear Codes Visualization
 */

// DOM Elements
const stepButtons = document.querySelectorAll('.step-btn');
const nextStepBtn = document.getElementById('nextStepBtn');
const resetBtn = document.getElementById('resetBtn');
const autoPlayBtn = document.getElementById('autoPlayBtn');
const encodeBtn = document.getElementById('encodeBtn');
const inputVector = document.getElementById('inputVector');
const codewordDisplay = document.getElementById('codewordDisplay');
const mainTitle = document.getElementById('mainTitle');
const mainSubtitle = document.getElementById('mainSubtitle');
const visualGroup = document.getElementById('visualGroup');
const distanceTable = document.getElementById('distanceTable');
const comparisonPanel = document.getElementById('comparisonPanel');

// State
let currentStep = 0;
let autoPlayInterval = null;

// Code Parameters
const GENERATOR_MATRIX = [
    [1, 0, 0, 0, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 1],
    [0, 0, 1, 0, 0, 1, 1],
    [0, 0, 0, 1, 1, 1, 1]
];

// Step Data
const STEPS = {
    0: { title: '生成矩阵构造', subtitle: 'Generator Matrix Construction', showDistance: false, showComparison: false },
    1: { title: '编码过程演示', subtitle: 'Encoding Process', showDistance: false, showComparison: false },
    2: { title: '最小距离计算', subtitle: 'Minimum Distance Calculation', showDistance: true, showComparison: false },
    3: { title: '纠错能力分析', subtitle: 'Error-Correcting Capability', showDistance: false, showComparison: true }
};

// Update Step
function updateStep(step) {
    currentStep = step;
    const data = STEPS[step];

    stepButtons.forEach((btn, idx) => {
        btn.classList.remove('active', 'completed');
        if (idx === step) {
            btn.classList.add('active');
        } else if (idx < step) {
            btn.classList.add('completed');
        }
    });

    visualGroup.style.opacity = '0';
    setTimeout(() => {
        mainTitle.textContent = data.title;
        mainSubtitle.textContent = data.subtitle;
        distanceTable.style.display = data.showDistance ? 'block' : 'none';
        comparisonPanel.style.display = data.showComparison ? 'block' : 'none';

        if (step === 0) renderGeneratorMatrix();
        else if (step === 1) renderEncodingProcess();
        else if (step === 2) { renderMinimumDistance(); generateDistanceTable(); }
        else if (step === 3) renderErrorCapability();

        setTimeout(() => visualGroup.style.opacity = '1', 100);

        nextStepBtn.textContent = step < 3 ? '▶ 下一步' : '✓ 完成';
        nextStepBtn.disabled = step >= 3;
    }, 300);
}

// Render Generator Matrix
function renderGeneratorMatrix() {
    visualGroup.innerHTML = '';

    const title = createSVGText(350, 40, '(7,4) 汉明码生成矩阵 G', '#d63b1d', 18, 'bold');
    visualGroup.appendChild(title);

    const matrixY = 95;
    const cellWidth = 42;
    const cellHeight = 38;

    GENERATOR_MATRIX.forEach((row, i) => {
        row.forEach((val, j) => {
            const x = 200 + j * cellWidth;
            const y = matrixY + i * cellHeight;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', cellWidth);
            rect.setAttribute('height', cellHeight);
            rect.setAttribute('fill', j < 4 ? '#e0f2fe' : '#fef3c7');
            rect.setAttribute('stroke', '#374151');
            rect.setAttribute('stroke-width', 1.5);
            visualGroup.appendChild(rect);

            const text = createSVGText(x + cellWidth / 2, y + cellHeight / 2 + 6, val.toString(),
                j < 4 ? '#0369a1' : '#92400e', 16, 'bold');
            visualGroup.appendChild(text);
        });
    });

    const labelI = createSVGText(350, matrixY + 178, '← 信息位 I₄ | 校验位 P →', '#6b7280', 13);
    visualGroup.appendChild(labelI);

    const desc1 = createSVGText(350, 285, '标准型生成矩阵：G = [I₄ | P]', '#8b5cf6', 14);
    const desc2 = createSVGText(350, 310, 'I₄: 4×4 单位矩阵（信息位）', '#3b82f6', 12);
    const desc3 = createSVGText(350, 330, 'P: 4×3 校验矩阵（冗余位）', '#f59e0b', 12);
    visualGroup.appendChild(desc1);
    visualGroup.appendChild(desc2);
    visualGroup.appendChild(desc3);
}

// Render Encoding Process
function renderEncodingProcess() {
    visualGroup.innerHTML = '';

    const u = inputVector.value.split('').map(Number);
    const c = encodeVector(u);

    const title = createSVGText(350, 40, '编码过程：c = u · G (mod 2)', '#d63b1d', 18, 'bold');
    visualGroup.appendChild(title);

    const uText = createSVGText(150, 95, 'u =', '#374151', 16, 'bold');
    visualGroup.appendChild(uText);

    u.forEach((bit, i) => {
        const box = createBitBox(220 + i * 45, 75, bit, '#8b5cf6');
        visualGroup.appendChild(box);
    });

    const times = createSVGText(350, 140, '×', '#d63b1d', 30, 'bold');
    visualGroup.appendChild(times);

    const gLabel = createSVGText(350, 180, 'G', '#3b82f6', 20, 'bold');
    visualGroup.appendChild(gLabel);

    const equals = createSVGText(350, 225, '=', '#d63b1d', 30, 'bold');
    visualGroup.appendChild(equals);

    const cText = createSVGText(150, 275, 'c =', '#374151', 16, 'bold');
    visualGroup.appendChild(cText);

    c.forEach((bit, i) => {
        const color = i < 4 ? '#8b5cf6' : '#10b981';
        const box = createBitBox(220 + i * 45, 255, bit, color);
        visualGroup.appendChild(box);
    });

    const infoLabel = createSVGText(310, 315, '信息位', '#8b5cf6', 12);
    const parityLabel = createSVGText(490, 315, '校验位', '#10b981', 12);
    visualGroup.appendChild(infoLabel);
    visualGroup.appendChild(parityLabel);
}

// Render Minimum Distance
function renderMinimumDistance() {
    visualGroup.innerHTML = '';

    const title = createSVGText(350, 40, '汉明距离计算', '#d63b1d', 18, 'bold');
    visualGroup.appendChild(title);

    const codewords = [
        { label: 'c₁', bits: [0, 0, 0, 0, 0, 0, 0], weight: 0, color: '#9ca3af' },
        { label: 'c₂', bits: [1, 0, 0, 0, 1, 1, 0], weight: 3, color: '#3b82f6' },
        { label: 'c₃', bits: [0, 1, 0, 0, 1, 0, 1], weight: 3, color: '#3b82f6' },
        { label: 'c₄', bits: [1, 1, 0, 0, 0, 1, 1], weight: 4, color: '#10b981' }
    ];

    let yPos = 85;
    codewords.forEach(cw => {
        const label = createSVGText(80, yPos + 25, cw.label, '#374151', 14, 'bold');
        visualGroup.appendChild(label);

        cw.bits.forEach((bit, i) => {
            const box = createBitBox(130 + i * 40, yPos, bit, cw.color);
            visualGroup.appendChild(box);
        });

        const weightLabel = createSVGText(520, yPos + 25, `w(c) = ${cw.weight}`, cw.color, 14, 'bold');
        visualGroup.appendChild(weightLabel);

        yPos += 68;
    });

    const minDist = createSVGText(350, 365, '最小距离 d = min{w(c) : c ≠ 0} = 3', '#d63b1d', 16, 'bold');
    visualGroup.appendChild(minDist);

    const exp = createSVGText(350, 395, '汉明重量：码字中非零位的个数', '#6b7280', 12);
    visualGroup.appendChild(exp);
}

// Render Error Capability
function renderErrorCapability() {
    visualGroup.innerHTML = '';

    const title = createSVGText(350, 40, '纠错能力分析', '#d63b1d', 18, 'bold');
    visualGroup.appendChild(title);

    const formula1 = createSVGText(350, 90, '最小距离 d = 3', '#3b82f6', 16, 'bold');
    const arrow1 = createSVGText(350, 120, '↓', '#d63b1d', 24);
    const formula2 = createSVGText(350, 150, '纠错能力 t = ⌊(d-1)/2⌋ = 1', '#10b981', 16, 'bold');

    visualGroup.appendChild(formula1);
    visualGroup.appendChild(arrow1);
    visualGroup.appendChild(formula2);

    const exampleY = 190;
    const example1 = createSVGText(350, exampleY, '示例：1个错误可纠正', '#374151', 14, 'bold');
    visualGroup.appendChild(example1);

    const sent = [1, 0, 1, 1, 0, 1, 1];
    const sentLabel = createSVGText(100, exampleY + 40, '发送:', '#6b7280', 12);
    visualGroup.appendChild(sentLabel);
    sent.forEach((bit, i) => {
        const box = createBitBox(170 + i * 40, exampleY + 20, bit, '#3b82f6');
        visualGroup.appendChild(box);
    });

    const received = [1, 0, 1, 0, 0, 1, 1];
    const recLabel = createSVGText(100, exampleY + 100, '接收:', '#6b7280', 12);
    visualGroup.appendChild(recLabel);
    received.forEach((bit, i) => {
        const color = i === 3 ? '#ef4444' : '#fbbf24';
        const box = createBitBox(170 + i * 40, exampleY + 80, bit, color);
        visualGroup.appendChild(box);
    });

    const errorMark = createSVGText(310, exampleY + 70, '✗', '#ef4444', 20, 'bold');
    visualGroup.appendChild(errorMark);

    const corrLabel = createSVGText(100, exampleY + 160, '纠正:', '#6b7280', 12);
    visualGroup.appendChild(corrLabel);
    sent.forEach((bit, i) => {
        const color = i === 3 ? '#10b981' : '#3b82f6';
        const box = createBitBox(170 + i * 40, exampleY + 140, bit, color);
        visualGroup.appendChild(box);
    });

    const checkMark = createSVGText(550, exampleY + 160, '✓ 成功纠正', '#10b981', 14, 'bold');
    visualGroup.appendChild(checkMark);
}

// Generate Distance Table
function generateDistanceTable() {
    const distanceContent = document.getElementById('distanceContent');
    distanceContent.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; font-family: 'Courier New', monospace;">
            <tr style="background: #e0f2fe;">
                <th style="padding: 0.5rem; border: 1px solid #94a3b8;">码字</th>
                <th style="padding: 0.5rem; border: 1px solid #94a3b8;">汉明重量</th>
            </tr>
            <tr><td style="padding: 0.5rem; border: 1px solid #cbd5e1; text-align: center;">0000000</td><td style="padding: 0.5rem; border: 1px solid #cbd5e1; text-align: center;">0</td></tr>
            <tr style="background: #fef3c7;"><td style="padding: 0.5rem; border: 1px solid #cbd5e1; text-align: center; color: #3b82f6; font-weight: bold;">1000110</td><td style="padding: 0.5rem; border: 1px solid #cbd5e1; text-align: center; color: #3b82f6; font-weight: bold;">3</td></tr>
            <tr style="background: #fef3c7;"><td style="padding: 0.5rem; border: 1px solid #cbd5e1; text-align: center; color: #3b82f6; font-weight: bold;">0100101</td><td style="padding: 0.5rem; border: 1px solid #cbd5e1; text-align: center; color: #3b82f6; font-weight: bold;">3</td></tr>
            <tr><td style="padding: 0.5rem; border: 1px solid #cbd5e1; text-align: center;">1100011</td><td style="padding: 0.5rem; border: 1px solid #cbd5e1; text-align: center;">4</td></tr>
            <tr><td colspan="2" style="padding: 0.5rem; text-align: center; font-weight: bold; color: #d63b1d;">最小非零重量 = 3</td></tr>
        </table>
    `;
}

// Helper Functions
function encodeVector(u) {
    const c = new Array(7).fill(0);
    for (let i = 0; i < 7; i++) {
        let sum = 0;
        for (let j = 0; j < 4; j++) {
            sum += u[j] * GENERATOR_MATRIX[j][i];
        }
        c[i] = sum % 2;
    }
    return c;
}

function createSVGText(x, y, text, color, size, weight = 'normal') {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    element.setAttribute('x', x);
    element.setAttribute('y', y);
    element.setAttribute('fill', color);
    element.setAttribute('font-size', size);
    element.setAttribute('font-weight', weight);
    element.setAttribute('text-anchor', 'middle');
    element.textContent = text;
    return element;
}

function createBitBox(x, y, value, color) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', 35);
    rect.setAttribute('height', 35);
    rect.setAttribute('fill', 'white');
    rect.setAttribute('stroke', color);
    rect.setAttribute('stroke-width', 2.5);
    rect.setAttribute('rx', 5);
    g.appendChild(rect);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + 17.5);
    text.setAttribute('y', y + 23);
    text.setAttribute('fill', color);
    text.setAttribute('font-size', 16);
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('text-anchor', 'middle');
    text.textContent = value;
    g.appendChild(text);

    return g;
}

// Event Listeners
encodeBtn.addEventListener('click', () => {
    const u = inputVector.value.split('').map(Number);
    if (u.length === 4 && u.every(b => b === 0 || b === 1)) {
        const c = encodeVector(u);
        codewordDisplay.textContent = c.join('');
        if (currentStep === 1) renderEncodingProcess();
    } else {
        alert('请输入4位二进制数（例如：1011）');
    }
});

stepButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
            autoPlayBtn.textContent = '▶ 自动演示';
        }
        updateStep(idx);
    });
});

nextStepBtn.addEventListener('click', () => {
    if (currentStep < 3) {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
            autoPlayBtn.textContent = '▶ 自动演示';
        }
        updateStep(currentStep + 1);
    }
});

resetBtn.addEventListener('click', () => {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    location.reload();
});

autoPlayBtn.addEventListener('click', () => {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        autoPlayBtn.textContent = '▶ 自动演示';
    } else {
        updateStep(0);
        let step = 0;
        autoPlayInterval = setInterval(() => {
            step++;
            if (step <= 3) {
                updateStep(step);
            } else {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
                autoPlayBtn.textContent = '▶ 自动演示';
            }
        }, 3500);
        autoPlayBtn.textContent = '⏸ 暂停';
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && currentStep < 3) {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
            autoPlayBtn.textContent = '▶ 自动演示';
        }
        updateStep(currentStep + 1);
    } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
            autoPlayBtn.textContent = '▶ 自动演示';
        }
        updateStep(currentStep - 1);
    }
});

// Initialize
window.addEventListener('load', () => {
    updateStep(0);
    const u = inputVector.value.split('').map(Number);
    const c = encodeVector(u);
    codewordDisplay.textContent = c.join('');
});
