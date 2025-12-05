/**
 * Deep Learning Project - Logic Inference Visualization
 * 红色数理 - 深度学习项目：智能科技的逻辑必然
 */

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        init();
    }, 100);
});

// ===== State =====
let proofSteps = [];
let currentStep = 0;

// ===== Expected Proof Sequence =====
const PROOF_SEQUENCE = [
    { formula: 'A', reason: '前提', type: 'premise' },
    { formula: 'B', reason: '前提', type: 'premise' },
    { formula: 'A \\land B', reason: '合取引入 ∧I (1)(2)', type: 'derived' },
    { formula: 'A \\land B \\to H', reason: '前提', type: 'premise' },
    { formula: 'H', reason: '假言推理 MP (3)(4)', type: 'derived', milestone: 'H' },
    { formula: 'E', reason: '前提', type: 'premise' },
    { formula: 'H \\land E', reason: '合取引入 ∧I (5)(6)', type: 'derived' },
    { formula: 'H \\land E \\to F', reason: '前提', type: 'premise' },
    { formula: 'F', reason: '假言推理 MP (7)(8)', type: 'derived', milestone: 'F' },
    { formula: 'F \\to G', reason: '前提', type: 'premise' },
    { formula: 'G', reason: '假言推理 MP (9)(10)', type: 'derived', milestone: 'G' }
];

// ===== Hints =====
const HINTS = [
    '开始引入前提条件。首先添加前提 A（数据的采集和预处理已完成）。',
    '继续引入前提 B（网络结构已选择和设计）。',
    '应用合取引入规则(∧I)，将 A 和 B 组合成 A∧B。',
    '引入前提 A∧B→H（有数据和网络结构就能训练模型）。',
    '🤖 使用假言推理(MP)，从 A∧B 和 A∧B→H 推出 H（模型训练完成）！',
    '引入前提 E（团队能够协同工作）。',
    '应用合取引入规则，将 H 和 E 组合成 H∧E。',
    '引入前提 H∧E→F（模型训练后团队协作能完成结果验证）。',
    '✅ 使用假言推理(MP)，推出 F（实验结果验证完成）！',
    '引入前提 F→G（验证完成就能成功完成项目）。',
    '🎯 最后使用假言推理(MP)，推出 G（项目成功）！证明完成！'
];

// ===== Ideology Messages =====
const IDEOLOGY = {
    5: {
        title: '🤖 数据与算法双驱动',
        content: '模型训练成功！数据是AI的燃料，算法是AI的引擎。在数据预处理和网络设计的基础上，我们成功启动了模型训练，这是深度学习的核心环节。'
    },
    9: {
        title: '✅ 实践是检验真理的唯一标准',
        content: '实验验证完成！通过团队协作进行结果验证和解析，我们确保了模型的可靠性。科学研究必须经得起实践的检验。'
    },
    11: {
        title: '🎯 科技创新驱动发展',
        content: '项目圆满成功！这证明了数据、算法、算力、团队四位一体的科学发展路径。人工智能代表着新一轮科技革命和产业变革的重要驱动力量！'
    }
};

// ===== Stage Info =====
const STAGES = {
    1: { id: 'stageData', name: '数据准备' },
    5: { id: 'stageTrain', name: '模型训练' },
    9: { id: 'stageValidate', name: '结果验证' },
    11: { id: 'stageSuccess', name: '项目完成' }
};

// ===== Initialize =====
function init() {
    loadPremises();
    updateDisplay();
    setupListeners();
    if (window.MathJax) MathJax.typesetPromise();
}

function setupListeners() {
    document.getElementById('autoStepBtn').addEventListener('click', addNextStep);
    document.getElementById('hintBtn').addEventListener('click', showHint);
    document.getElementById('resetBtn').addEventListener('click', resetProof);
    document.getElementById('closeModal').addEventListener('click', closeModal);
}

// ===== Load Premises =====
function loadPremises() {
    const premises = [
        { formula: 'A \\land B \\to H', desc: '有数据和网络→能训练模型' },
        { formula: 'D \\land C \\to H', desc: '有算力和算法→能训练模型' },
        { formula: 'H \\land E \\to F', desc: '训练后团队协作→验证结果' },
        { formula: 'F \\to G', desc: '验证完成→项目成功' },
        { formula: 'A', desc: '已知：数据已准备' },
        { formula: 'B', desc: '已知：网络已设计' },
        { formula: 'D', desc: '已知：有充足算力' },
        { formula: 'C', desc: '已知：算法已选择' },
        { formula: 'E', desc: '已知：团队能协作' }
    ];

    const grid = document.getElementById('premiseGrid');
    grid.innerHTML = '';

    premises.forEach(p => {
        const card = document.createElement('div');
        card.className = 'premise-card';
        card.innerHTML = `
            <div class="premise-formula">$${p.formula}$</div>
            <div class="premise-desc">${p.desc}</div>
        `;
        grid.appendChild(card);
    });

    if (window.MathJax) MathJax.typesetPromise();
}

// ===== Add Next Step =====
function addNextStep() {
    if (currentStep >= PROOF_SEQUENCE.length) {
        return;
    }

    const step = PROOF_SEQUENCE[currentStep];
    proofSteps.push({
        num: currentStep + 1,
        formula: step.formula,
        reason: step.reason
    });

    currentStep++;
    updateDisplay();

    // Check milestones
    if (step.milestone) {
        unlockMilestone(step.milestone);
    }

    // Update ideology
    if (IDEOLOGY[currentStep]) {
        updateIdeology(IDEOLOGY[currentStep]);
    }

    // Update stages
    if (STAGES[currentStep]) {
        updateStage(STAGES[currentStep].id);
    }

    // Check completion
    if (currentStep === PROOF_SEQUENCE.length) {
        setTimeout(showSuccessModal, 500);
    }
}

// ===== Update Display =====
function updateDisplay() {
    updateProofTable();
    updateProgress();
    updateHint();
}

function updateProofTable() {
    const tbody = document.getElementById('proofBody');
    tbody.innerHTML = '';

    proofSteps.forEach(step => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>(${step.num})</td>
            <td>$${step.formula}$</td>
            <td>${step.reason}</td>
        `;
        tbody.appendChild(tr);
    });

    if (window.MathJax) MathJax.typesetPromise();
}

function updateProgress() {
    const total = PROOF_SEQUENCE.length;
    const current = proofSteps.length;
    const percentage = (current / total) * 100;

    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = `推理进度: ${current}/${total}`;
}

function updateHint() {
    const hint = document.querySelector('.hint-text');
    if (currentStep < HINTS.length) {
        hint.textContent = HINTS[currentStep];
    } else {
        hint.textContent = '🎉 证明已完成！';
    }
}

// ===== Milestones =====
function unlockMilestone(id) {
    const milestone = document.getElementById(`milestone${id}`);
    if (milestone && !milestone.classList.contains('achieved')) {
        milestone.classList.add('achieved');
        const status = milestone.querySelector('.milestone-status');
        status.textContent = '✅ 已达成';
        status.style.color = '#00bcd4';
    }
}

// ===== Stages =====
function updateStage(stageId) {
    const stage = document.getElementById(stageId);
    if (stage) {
        stage.classList.add('active');
        stage.querySelector('.stage-check').textContent = '✅';
    }
}

// ===== Ideology =====
function updateIdeology(msg) {
    const box = document.getElementById('ideologyBox');
    box.innerHTML = `
        <h4>${msg.title}</h4>
        <p>${msg.content}</p>
    `;
}

// ===== Show Hint =====
function showHint() {
    if (currentStep < HINTS.length) {
        alert('💡 提示：\n\n' + HINTS[currentStep]);
    } else {
        alert('证明已全部完成！');
    }
}

// ===== Reset =====
function resetProof() {
    if (!confirm('确定要重置证明过程吗？')) return;

    proofSteps = [];
    currentStep = 0;
    updateDisplay();

    // Reset milestones
    ['H', 'F', 'G'].forEach(id => {
        const milestone = document.getElementById(`milestone${id}`);
        milestone.classList.remove('achieved');
        milestone.querySelector('.milestone-status').textContent = '🔒 未达成';
    });

    // Reset stages
    Object.values(STAGES).forEach(stage => {
        const el = document.getElementById(stage.id);
        el.classList.remove('active');
        el.querySelector('.stage-check').textContent = '⭕';
    });

    // Reset ideology
    const box = document.getElementById('ideologyBox');
    box.innerHTML = `
        <h4>🌟 科技创新精神</h4>
        <p>数据驱动、算法优化、算力支撑、团队协作——这是人工智能发展的科学路径。</p>
        <p>通过严密的逻辑推理，我们将证明：在满足数据、算法、算力、团队四大要素时，深度学习项目的成功是必然的。</p>
    `;
}

// ===== Success Modal =====
function showSuccessModal() {
    document.getElementById('successModal').classList.add('show');
}

function closeModal() {
    document.getElementById('successModal').classList.remove('show');
}
