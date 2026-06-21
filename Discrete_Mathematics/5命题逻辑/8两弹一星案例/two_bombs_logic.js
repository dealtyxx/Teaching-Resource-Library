/**
 * Two Bombs One Satellite - Logic Inference Visualization
 * 红色数理 - 两弹一星：科技强国的逻辑必然性
 */

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        init();
    }, 100);
});

// --- State ---
let proofSteps = [];
let selectedSteps = [];
let currentHintIndex = 0;

function renderMath(root) {
    root = root || document.body;
    if (window.DMMathJax && window.DMMathJax.typeset) {
        window.DMMathJax.typeset(root);
        return;
    }
    if (window.MathJax && window.MathJax.typesetPromise && /(?:\$\$|\$[^$\n]{1,160}\$|\\\(|\\\[|\\begin\{)/.test(root.textContent || '')) {
        MathJax.typesetPromise([root]).catch(() => {});
    }
}

// --- Expected Proof Sequence ---
const EXPECTED_STEPS = [
    { formula: 'P', reason: '前提' },
    { formula: 'F', reason: '前提' },
    { formula: 'P \\land F', reason: '合取引入 ∧I (1)(2)' },
    { formula: 'P \\land F \\to A', reason: '前提' },
    { formula: 'A', reason: '假言推理 MP (3)(4)' },
    { formula: 'E', reason: '前提' },
    { formula: 'A \\land E \\land F', reason: '合取引入 ∧I (2)(5)(6)' },
    { formula: 'A \\land E \\land F \\to H', reason: '前提' },
    { formula: 'H', reason: '假言推理 MP (7)(8)' },
    { formula: 'H \\land F', reason: '合取引入 ∧I (2)(9)' },
    { formula: 'H \\land F \\to S', reason: '前提' },
    { formula: 'S', reason: '假言推理 MP (10)(11)' },
    { formula: 'A \\land H \\land S', reason: '合取引入 ∧I (5)(9)(12)' }
];

// --- Hints for each step ---
const HINTS = [
    '提示：首先引入所有已知条件（前提）。从 P（科研人员培养）开始。',
    '提示：继续引入前提 F（科研经费投入）。',
    '提示：使用合取引入规则(∧I)，将 P 和 F 组合成 P∧F。',
    '提示：引入前提 P∧F→A（有人才和经费就能研发原子弹）。',
    '提示：使用假言推理(MP)，从 P∧F 和 P∧F→A 推出 A（原子弹研发成功）！',
    '提示：引入前提 E（科研设备建设）。',
    '提示：使用合取引入规则，将 A、E、F 组合成 A∧E∧F。',
    '提示：引入前提 A∧E∧F→H（有原子弹经验、设备和经费就能研发氢弹）。',
    '提示：使用假言推理(MP)，推出 H（氢弹研发成功）！',
    '提示：使用合取引入规则，将 H 和 F 组合成 H∧F。',
    '提示：引入前提 H∧F→S（有氢弹和经费就能研发卫星）。',
    '提示：使用假言推理(MP)，推出 S（人造卫星研发成功）！',
    '提示：最后使用合取引入规则，将 A、H、S 组合成 A∧H∧S，完成证明！'
];

// --- Ideological Messages ---
const IDEOLOGY_MESSAGES = {
    5: { // When A is proven
        title: '🚀 自力更生',
        content: '原子弹研发成功！在人才和经费的支持下，我们依靠自己的力量突破了核技术的封锁，实现了从无到有的飞跃。'
    },
    9: { // When H is proven
        title: '💣 艰苦奋斗',
        content: '氢弹研发成功！在原子弹的基础上，科研团队克服重重困难，仅用2年8个月就完成了从原子弹到氢弹的跨越，创造了世界奇迹。'
    },
    12: { // When S is proven
        title: '🛰️ 勇于登攀',
        content: '人造卫星发射成功！《东方红》响彻太空，标志着中国进入航天时代，向科技高峰又迈进了一大步。'
    },
    13: { // When full proof is complete
        title: '🏆 大力协同',
        content: '两弹一星圆满成功！这是人才培养、设备建设、经费保障三位一体协同发展的必然结果，体现了社会主义制度集中力量办大事的优越性。'
    }
};

// --- Initialize ---
function init() {
    loadPremises();
    updateProofTable();
    updateProgress();
    setupEventListeners();
    renderMath(document.body);
}

function setupEventListeners() {
    document.getElementById('nextStepBtn').addEventListener('click', handleNextStep);
    document.getElementById('hintBtn').addEventListener('click', showHint);
    document.getElementById('resetBtn').addEventListener('click', resetProof);
    document.getElementById('closeModalBtn').addEventListener('click', closeSuccessModal);
}

// --- Load Premises ---
function loadPremises() {
    const premises = [
        { formula: 'P \\land F \\to A', desc: '若有人才和经费，则能研发原子弹' },
        { formula: 'A \\land E \\land F \\to H', desc: '若有原子弹经验、设备和经费，则能研发氢弹' },
        { formula: 'H \\land F \\to S', desc: '若有氢弹和经费，则能研发卫星' },
        { formula: 'P', desc: '已知：科研人员得到培养' },
        { formula: 'E', desc: '已知：科研设备已建设' },
        { formula: 'F', desc: '已知：有足够的科研经费' }
    ];

    const list = document.getElementById('premiseList');
    list.innerHTML = '';

    premises.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'premise-item';
        item.innerHTML = `
            <div style="font-weight:600; margin-bottom:4px;">$${p.formula}$</div>
            <div style="font-size:0.85rem; color:#7f8c8d;">${p.desc}</div>
        `;
        list.appendChild(item);
    });

    renderMath(list);
}

// --- Update Proof Table ---
function updateProofTable() {
    const tbody = document.getElementById('proofTableBody');
    tbody.innerHTML = '';

    proofSteps.forEach((step, index) => {
        const tr = document.createElement('tr');
        if (selectedSteps.includes(index)) {
            tr.classList.add('selected');
        }

        tr.innerHTML = `
            <td>(${step.id})</td>
            <td>$${step.formula}$</td>
            <td>${step.reason}</td>
        `;

        tr.onclick = () => toggleSelection(index);
        tbody.appendChild(tr);
    });

    renderMath(tbody);
}

function toggleSelection(index) {
    const idx = selectedSteps.indexOf(index);
    if (idx > -1) {
        selectedSteps.splice(idx, 1);
    } else {
        if (selectedSteps.length < 3) {
            selectedSteps.push(index);
        } else {
            selectedSteps.shift();
            selectedSteps.push(index);
        }
    }
    updateProofTable();
    updateActionPrompt();
}

function updateActionPrompt() {
    const prompt = document.getElementById('actionPrompt');
    if (selectedSteps.length === 0) {
        prompt.textContent = '选择一个或多个已有步骤，然后点击"下一步"开始推理';
    } else {
        const formulas = selectedSteps.map(i => proofSteps[i].formula).join(', ');
        prompt.innerHTML = `已选择步骤: ${formulas}<br>点击"下一步"应用推理规则`;
    }
}

// --- Handle Next Step ---
function handleNextStep() {
    const nextStepNum = proofSteps.length;
    const expected = EXPECTED_STEPS[nextStepNum];

    if (!expected) {
        alert('证明已完成！');
        return;
    }

    // For simplicity, we'll guide the user through the correct sequence
    addStep(expected.formula, expected.reason);
    selectedSteps = [];
    updateProofTable();
    updateProgress();
    checkAchievements(nextStepNum + 1);

    // Update ideology panel
    if (IDEOLOGY_MESSAGES[nextStepNum + 1]) {
        updateIdeology(IDEOLOGY_MESSAGES[nextStepNum + 1]);
    }

    // Check if proof is complete
    if (nextStepNum + 1 === EXPECTED_STEPS.length) {
        showSuccessModal();
    }
}

function addStep(formula, reason) {
    proofSteps.push({
        id: proofSteps.length + 1,
        formula: formula,
        reason: reason
    });
}

// --- Update Progress ---
function updateProgress() {
    const total = EXPECTED_STEPS.length;
    const current = proofSteps.length;
    const percentage = (current / total) * 100;

    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = `进度: ${current}/${total}`;
}

// --- Check Achievements ---
function checkAchievements(stepNum) {
    if (stepNum >= 5) {
        unlockAchievement('achAtomic', '🚀');
    }
    if (stepNum >= 9) {
        unlockAchievement('achHydrogen', '💣');
    }
    if (stepNum >= 12) {
        unlockAchievement('achSatellite', '🛰️');
    }
}

function unlockAchievement(id, icon) {
    const element = document.getElementById(id);
    if (!element.classList.contains('unlocked')) {
        element.classList.add('unlocked');
        element.querySelector('.achievement-status').textContent = '✅';

        // Visual effect
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 500);
    }
}

// --- Update Ideology Panel ---
function updateIdeology(message) {
    const content = document.getElementById('ideologyContent');
    content.innerHTML = `
        <h4>${message.title}</h4>
        <p>${message.content}</p>
    `;
}

// --- Show Hint ---
function showHint() {
    if (currentHintIndex < HINTS.length) {
        alert(HINTS[proofSteps.length]);
    } else {
        alert('所有步骤都已完成！');
    }
}

// --- Reset Proof ---
function resetProof() {
    if (confirm('确定要重置证明过程吗？')) {
        proofSteps = [];
        selectedSteps = [];
        currentHintIndex = 0;
        updateProofTable();
        updateProgress();

        // Reset achievements
        ['achAtomic', 'achHydrogen', 'achSatellite'].forEach(id => {
            const element = document.getElementById(id);
            element.classList.remove('unlocked');
            element.querySelector('.achievement-status').textContent = '🔒';
        });

        // Reset ideology
        const content = document.getElementById('ideologyContent');
        content.innerHTML = `
            <h4>🌟 两弹一星精神</h4>
            <p>热爱祖国、无私奉献，自力更生、艰苦奋斗，大力协同、勇于登攀。</p>
            <p>通过严密的逻辑推理，我们将证明：在满足人才、设备、经费三个条件下，实现"两弹一星"是科学发展的必然结果。</p>
        `;
    }
}

// --- Success Modal ---
function showSuccessModal() {
    document.getElementById('successModal').classList.remove('hidden');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.add('hidden');
}

// --- Expose functions for HTML onclick ---
window.handleNextStep = handleNextStep;
window.showHint = showHint;
window.resetProof = resetProof;
window.closeSuccessModal = closeSuccessModal;
