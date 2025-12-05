/**
 * 布尔代数逻辑电路优化系统 - 完整版
 * Boolean Algebra Logic Circuit Optimization System - Complete Version
 * 每一步都有对应的图形变化
 */

// DOM Elements
const stepButtons = document.querySelectorAll('.step-btn');
const nextStepBtn = document.getElementById('nextStepBtn');
const resetBtn = document.getElementById('resetBtn');
const autoPlayBtn = document.getElementById('autoPlayBtn');
const gateCount = document.getElementById('gateCount');
const inputCount = document.getElementById('inputCount');
const complexity = document.getElementById('complexity');
const expressionDisplay = document.getElementById('expressionDisplay');
const optimizationDesc = document.getElementById('optimizationDesc');
const mainTitle = document.getElementById('mainTitle');
const mainSubtitle = document.getElementById('mainSubtitle');
const circuitSvg = document.getElementById('circuitSvg');
const circuitGroup = document.getElementById('circuitGroup');
const simplificationSteps = document.getElementById('simplificationSteps');
const stepsContent = document.getElementById('stepsContent');
const comparisonPanel = document.getElementById('comparisonPanel');

// State
let currentStep = 0;
let autoPlayInterval = null;

// Step Data
const STEPS = {
    0: {
        title: '原始电路',
        subtitle: 'Original Circuit',
        expression: '((P∧Q∧R)∨(P∧Q∧S))∧((P∧R)∨(P∧S))',
        gateCount: 7,
        complexity: '高',
        description: '原始电路使用7个逻辑门，结构复杂，包含多个AND门和OR门的组合',
        showSimplification: false,
        showComparison: false
    },
    1: {
        title: '抽象化表达',
        subtitle: 'Boolean Expression',
        expression: '((P∧Q∧R)∨(P∧Q∧S))∧((P∧R)∨(P∧S))',
        gateCount: 7,
        complexity: '高',
        description: '将电路图转换为布尔代数表达式，识别不同部分的逻辑关系',
        showSimplification: false,
        showComparison: false
    },
    2: {
        title: '等值演算化简',
        subtitle: 'Simplification Process',
        expression: 'P∧Q∧(R∨S)',
        gateCount: 2,
        complexity: '低',
        description: '通过布尔代数运算法则进行化简，应用分配律和吸收律',
        showSimplification: true,
        showComparison: false
    },
    3: {
        title: '优化电路',
        subtitle: 'Optimized Circuit',
        expression: 'P∧Q∧(R∨S)',
        gateCount: 2,
        complexity: '低',
        description: '根据简化后的表达式重新设计电路，仅需1个OR门和1个AND门',
        showSimplification: false,
        showComparison: true
    }
};

// Simplification Steps Content
const SIMPLIFICATION_CONTENT = [
    {
        title: '步骤 1: 提取公因子',
        expression: '((P∧Q∧R)∨(P∧Q∧S))∧((P∧R)∨(P∧S))',
        explanation: '观察原表达式，识别可提取的公共项'
    },
    {
        title: '步骤 2: 应用分配律',
        expression: '(P∧Q∧(R∨S))∧(P∧(R∨S))',
        explanation: '使用分配律 X∧Y ∨ X∧Z = X∧(Y∨Z) 简化两个括号'
    },
    {
        title: '步骤 3: 应用吸收律',
        expression: 'P∧Q∧(R∨S)',
        explanation: '使用吸收律 X∧(X∧Y) = X∧Y，消除冗余项 P∧(R∨S)'
    }
];

// Update Step
function updateStep(step) {
    currentStep = step;
    const data = STEPS[step];

    // Update button states with animation
    stepButtons.forEach((btn, idx) => {
        btn.classList.remove('active', 'completed');
        if (idx === step) {
            btn.classList.add('active');
            btn.style.transform = 'scale(1.05)';
            setTimeout(() => btn.style.transform = 'scale(1)', 200);
        } else if (idx < step) {
            btn.classList.add('completed');
        }
    });

    // Fade out current content
    circuitGroup.style.opacity = '0';
    setTimeout(() => {
        // Update info
        mainTitle.textContent = data.title;
        mainSubtitle.textContent = data.subtitle;

        // Animate expression change
        expressionDisplay.style.transform = 'scale(0.95)';
        expressionDisplay.style.opacity = '0.5';
        setTimeout(() => {
            expressionDisplay.textContent = data.expression;
            expressionDisplay.style.transform = 'scale(1)';
            expressionDisplay.style.opacity = '1';
        }, 150);

        gateCount.textContent = data.gateCount;
        complexity.textContent = data.complexity;
        optimizationDesc.innerHTML = `<p>${data.description}</p>`;

        // Update complexity color with pulse
        if (data.complexity === '低') {
            complexity.style.color = 'var(--signal-active)';
            complexity.style.animation = 'pulse 0.5s ease-out';
        } else {
            complexity.style.color = 'var(--danger-red)';
            complexity.style.animation = 'none';
        }

        // Show/hide panels with animation
        if (data.showSimplification) {
            simplificationSteps.style.display = 'block';
            setTimeout(() => simplificationSteps.style.opacity = '1', 50);
        } else {
            simplificationSteps.style.opacity = '0';
            setTimeout(() => simplificationSteps.style.display = 'none', 300);
        }

        if (data.showComparison) {
            comparisonPanel.style.display = 'block';
            setTimeout(() => comparisonPanel.style.opacity = '1', 50);
        } else {
            comparisonPanel.style.opacity = '0';
            setTimeout(() => comparisonPanel.style.display = 'none', 300);
        }

        // Render circuit - 每一步显示不同的可视化
        if (step === 0) {
            renderOriginalCircuit();
        } else if (step === 1) {
            renderAnnotatedCircuit();
        } else if (step === 2) {
            renderSimplifyingCircuit();
            renderSimplificationSteps();
        } else if (step === 3) {
            renderOptimizedCircuit();
        }

        setTimeout(() => {
            circuitGroup.style.opacity = '1';
        }, 100);

        // Update button text
        if (step < 3) {
            nextStepBtn.textContent = '▶ 下一步';
            nextStepBtn.disabled = false;
        } else {
            nextStepBtn.textContent = '✓ 完成';
            nextStepBtn.disabled = true;
        }
    }, 300);
}

// Render Original Circuit (步骤0 - 原始电路)
function renderOriginalCircuit() {
    circuitGroup.innerHTML = '';

    const inputs = [
        { label: 'P', x: 60, y: 100 },
        { label: 'Q', x: 60, y: 160 },
        { label: 'R', x: 60, y: 220 },
        { label: 'S', x: 60, y: 280 }
    ];

    inputs.forEach(input => {
        drawInputPort(input.x, input.y, input.label);
    });

    // 第一层AND门
    drawANDGate(180, 130, 'AND');
    drawANDGate(180, 250, 'AND');
    drawWire(100, 97, 160, 120);
    drawWire(100, 157, 160, 130);
    drawWire(100, 217, 160, 140);
    drawWire(100, 97, 160, 240);
    drawWire(100, 157, 160, 250);
    drawWire(100, 277, 160, 260);

    // 第一个OR门
    drawORGate(340, 190, 'OR');
    drawWire(260, 130, 320, 180);
    drawWire(260, 250, 320, 200);

    // 第二层AND门
    drawANDGate(180, 340, 'AND');
    drawANDGate(180, 390, 'AND');
    drawWire(100, 97, 160, 330);
    drawWire(100, 217, 160, 350);
    drawWire(100, 97, 160, 380);
    drawWire(100, 277, 160, 400);

    // 第二个OR门
    drawORGate(340, 365, 'OR');
    drawWire(260, 340, 320, 355);
    drawWire(260, 390, 320, 375);

    // 最终AND门
    drawANDGate(500, 277, 'AND');
    drawWire(420, 190, 480, 267);
    drawWire(420, 365, 480, 287);

    drawWire(580, 277, 620, 277);
    drawOutputPort(630, 277, 'Y');
}

// Render Annotated Circuit (步骤1 - 带标注的电路)
function renderAnnotatedCircuit() {
    circuitGroup.innerHTML = '';

    const inputs = [
        { label: 'P', x: 60, y: 100 },
        { label: 'Q', x: 60, y: 160 },
        { label: 'R', x: 60, y: 220 },
        { label: 'S', x: 60, y: 280 }
    ];

    inputs.forEach(input => {
        drawInputPort(input.x, input.y, input.label);
    });

    // 第一组：绘制并标注 (P∧Q∧R) 和 (P∧Q∧S)
    drawANDGate(180, 130, 'AND', '#8b5cf6');
    drawANDGate(180, 250, 'AND', '#8b5cf6');
    drawWire(100, 97, 160, 120);
    drawWire(100, 157, 160, 130);
    drawWire(100, 217, 160, 140);
    drawWire(100, 97, 160, 240);
    drawWire(100, 157, 160, 250);
    drawWire(100, 277, 160, 260);

    addAnnotation(180, 180, '(P∧Q∧R)∨(P∧Q∧S)', '#8b5cf6');
    drawORGate(340, 190, 'OR', '#8b5cf6');
    drawWire(260, 130, 320, 180);
    drawWire(260, 250, 320, 200);

    // 第二组：绘制并标注 (P∧R) 和 (P∧S)
    drawANDGate(180, 340, 'AND', '#f59e0b');
    drawANDGate(180, 390, 'AND', '#f59e0b');
    drawWire(100, 97, 160, 330);
    drawWire(100, 217, 160, 350);
    drawWire(100, 97, 160, 380);
    drawWire(100, 277, 160, 400);

    addAnnotation(180, 435, '(P∧R)∨(P∧S)', '#f59e0b');
    drawORGate(340, 365, 'OR', '#f59e0b');
    drawWire(260, 340, 320, 355);
    drawWire(260, 390, 320, 375);

    // 最终AND门
    drawANDGate(500, 277, 'AND', '#d63b1d');
    drawWire(420, 190, 480, 267);
    drawWire(420, 365, 480, 287);
    drawWire(580, 277, 620, 277);
    drawOutputPort(630, 277, 'Y');

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', 325);
    title.setAttribute('y', 40);
    title.setAttribute('fill', 'var(--accent-red)');
    title.setAttribute('font-size', '16');
    title.setAttribute('font-weight', 'bold');
    title.setAttribute('text-anchor', 'middle');
    title.textContent = '抽象为布尔表达式：识别电路结构';
    circuitGroup.appendChild(title);
}

// Render Simplifying Circuit (步骤2 - 正在简化的电路)
function renderSimplifyingCircuit() {
    circuitGroup.innerHTML = '';

    const inputs = [
        { label: 'P', x: 60, y: 140 },
        { label: 'Q', x: 60, y: 200 },
        { label: 'R', x: 60, y: 260 },
        { label: 'S', x: 60, y: 320 }
    ];

    inputs.forEach(input => {
        drawInputPort(input.x, input.y, input.label);
    });

    // P∧Q 部分
    drawANDGate(200, 170, 'P∧Q', '#10b981');
    drawWire(100, 137, 180, 160, true);
    drawWire(100, 197, 180, 180, true);

    // R∨S 部分  
    drawORGate(200, 290, 'R∨S', '#10b981');
    drawWire(100, 257, 180, 280, true);
    drawWire(100, 317, 180, 300, true);

    // 最终AND门
    drawANDGate(400, 230, '最终', '#10b981');
    drawWire(280, 170, 380, 220, true);
    drawWire(280, 290, 380, 240, true);

    drawWire(480, 230, 550, 230, true);
    drawOutputPort(560, 230, 'Y');

    // 标注
    addAnnotation(200, 80, '提取公因子P∧Q', '#8b5cf6');
    addAnnotation(200, 375, '提取公因子R∨S', '#f59e0b');

    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    arrow.setAttribute('x', 325);
    arrow.setAttribute('y', 230);
    arrow.setAttribute('fill', 'var(--signal-active)');
    arrow.setAttribute('font-size', '30');
    arrow.setAttribute('text-anchor', 'middle');
    arrow.textContent = '→';
    circuitGroup.appendChild(arrow);

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', 325);
    title.setAttribute('y', 40);
    title.setAttribute('fill', 'var(--signal-active)');
    title.setAttribute('font-size', '16');
    title.setAttribute('font-weight', 'bold');
    title.setAttribute('text-anchor', 'middle');
    title.textContent = '化简中：应用分配律和吸收律';
    circuitGroup.appendChild(title);
}

// Render Optimized Circuit (步骤3 - 优化电路)
function renderOptimizedCircuit() {
    circuitGroup.innerHTML = '';

    const inputs = [
        { label: 'P', x: 80, y: 150 },
        { label: 'Q', x: 80, y: 210 },
        { label: 'R', x: 80, y: 270 },
        { label: 'S', x: 80, y: 330 }
    ];

    inputs.forEach(input => {
        drawInputPort(input.x, input.y, input.label, true);
    });

    // OR门 (R∨S)
    drawORGate(240, 300, 'R∨S', 'var(--signal-active)');
    drawWire(120, 267, 220, 290, true);
    drawWire(120, 327, 220, 310, true);

    // AND门 (P∧Q∧(R∨S))
    drawANDGate(440, 230, 'P∧Q∧(R∨S)', 'var(--signal-active)');
    drawWire(120, 147, 420, 215, true);
    drawWire(120, 207, 420, 230, true);
    drawWire(320, 300, 420, 245, true);

    drawWire(520, 230, 570, 230, true);
    drawOutputPort(580, 230, 'Y');

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', 325);
    label.setAttribute('y', 50);
    label.setAttribute('fill', 'var(--signal-active)');
    label.setAttribute('font-size', '18');
    label.setAttribute('font-weight', 'bold');
    label.setAttribute('text-anchor', 'middle');
    label.textContent = '✓ 优化完成：逻辑门从 7 → 2';
    circuitGroup.appendChild(label);
}

// Helper Functions
function drawInputPort(x, y, label, active = false) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 5);
    text.setAttribute('class', 'input-label');
    text.setAttribute('text-anchor', 'end');
    text.textContent = label;
    circuitGroup.appendChild(text);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x + 10);
    line.setAttribute('y1', y);
    line.setAttribute('x2', x + 40);
    line.setAttribute('y2', y);
    line.setAttribute('class', active ? 'wire active' : 'wire');
    circuitGroup.appendChild(line);
}

function drawOutputPort(x, y, label) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + 10);
    text.setAttribute('y', y + 5);
    text.setAttribute('class', 'output-label');
    text.textContent = label;
    circuitGroup.appendChild(text);
}

function drawANDGate(x, y, label, fillColor = 'var(--gate-color)') {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'logic-gate');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${x} ${y - 25} L ${x + 45} ${y - 25} Q ${x + 80} ${y - 25} ${x + 80} ${y} Q ${x + 80} ${y + 25} ${x + 45} ${y + 25} L ${x} ${y + 25} Z`);
    path.setAttribute('class', 'gate-body');
    path.setAttribute('fill', fillColor);
    g.appendChild(path);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + 40);
    text.setAttribute('y', y + 5);
    text.setAttribute('class', 'gate-label');
    text.textContent = 'AND';
    g.appendChild(text);

    g.addEventListener('mouseenter', function () {
        path.style.transform = 'scale(1.1)';
        path.style.transformOrigin = 'center';
        path.style.transition = 'transform 0.2s';
        path.setAttribute('filter', 'url(#glow)');
    });

    g.addEventListener('mouseleave', function () {
        path.style.transform = 'scale(1)';
        path.removeAttribute('filter');
    });

    circuitGroup.appendChild(g);
}

function drawORGate(x, y, label, fillColor = 'var(--gate-color)') {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'logic-gate');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${x} ${y - 25} Q ${x + 35} ${y - 25} ${x + 55} ${y - 12} Q ${x + 80} ${y} ${x + 55} ${y + 12} Q ${x + 35} ${y + 25} ${x} ${y + 25} Q ${x + 18} ${y} ${x} ${y - 25}`);
    path.setAttribute('class', 'gate-body');
    path.setAttribute('fill', fillColor);
    g.appendChild(path);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + 40);
    text.setAttribute('y', y + 5);
    text.setAttribute('class', 'gate-label');
    text.textContent = 'OR';
    g.appendChild(text);

    g.addEventListener('mouseenter', function () {
        path.style.transform = 'scale(1.1)';
        path.style.transformOrigin = 'center';
        path.style.transition = 'transform 0.2s';
        path.setAttribute('filter', 'url(#glow)');
    });

    g.addEventListener('mouseleave', function () {
        path.style.transform = 'scale(1)';
        path.removeAttribute('filter');
    });

    circuitGroup.appendChild(g);
}

function drawWire(x1, y1, x2, y2, active = false) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', active ? 'wire active' : 'wire');
    circuitGroup.appendChild(line);
}

function addAnnotation(x, y, text, color) {
    const annotation = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    annotation.setAttribute('x', x);
    annotation.setAttribute('y', y);
    annotation.setAttribute('fill', color);
    annotation.setAttribute('font-size', '12');
    annotation.setAttribute('font-weight', 'bold');
    annotation.setAttribute('text-anchor', 'middle');
    annotation.textContent = text;
    circuitGroup.appendChild(annotation);
}

function renderSimplificationSteps() {
    stepsContent.innerHTML = '';

    SIMPLIFICATION_CONTENT.forEach(step => {
        const div = document.createElement('div');
        div.className = 'step-item';
        div.innerHTML = `
            <h4>${step.title}</h4>
            <div class="expression">${step.expression}</div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
                ${step.explanation}
            </p>
        `;
        stepsContent.appendChild(div);
    });
}

// Control Functions
function nextStep() {
    if (currentStep < 3) {
        updateStep(currentStep + 1);
    }
}

function startAutoPlay() {
    if (autoPlayInterval) return;

    updateStep(0);
    let step = 0;

    autoPlayInterval = setInterval(() => {
        step++;
        if (step <= 3) {
            updateStep(step);
        } else {
            stopAutoPlay();
        }
    }, 3000);
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && currentStep < 3) {
        stopAutoPlay();
        nextStep();
    } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        stopAutoPlay();
        updateStep(currentStep - 1);
    } else if (e.key === ' ') {
        e.preventDefault();
        if (autoPlayInterval) {
            stopAutoPlay();
            autoPlayBtn.textContent = '▶ 自动演示';
        } else {
            startAutoPlay();
            autoPlayBtn.textContent = '⏸ 暂停';
        }
    }
});

// Event Listeners
stepButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
        stopAutoPlay();
        autoPlayBtn.textContent = '▶ 自动演示';
        updateStep(idx);
    });
});

nextStepBtn.addEventListener('click', () => {
    stopAutoPlay();
    autoPlayBtn.textContent = '▶ 自动演示';
    nextStep();
});

resetBtn.addEventListener('click', () => {
    stopAutoPlay();
    location.reload();
});

autoPlayBtn.addEventListener('click', () => {
    if (autoPlayInterval) {
        stopAutoPlay();
        autoPlayBtn.textContent = '▶ 自动演示';
    } else {
        startAutoPlay();
        autoPlayBtn.textContent = '⏸ 暂停';
    }
});

// Initialize
window.addEventListener('load', () => {
    updateStep(0);
});
