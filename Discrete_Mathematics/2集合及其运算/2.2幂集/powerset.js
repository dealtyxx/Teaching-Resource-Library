/**
 * Red Mathematics - Power Set Visualizer (Enhanced)
 */

// DOM Elements
const checkboxes = document.querySelectorAll('.checkbox-item input');
const mobilizeBtn = document.getElementById('mobilizeBtn');
const resetBtn = document.getElementById('resetBtn');
const startMissionBtn = document.getElementById('startMissionBtn');
const subsetsContainer = document.getElementById('subsetsContainer');
const nValue = document.getElementById('nValue');
const powersetValue = document.getElementById('powersetValue');
const scoreValue = document.getElementById('scoreValue');
const missionBanner = document.getElementById('missionBanner');
const missionTarget = document.getElementById('missionTarget');
const szTitle = document.getElementById('szTitle');
const szDesc = document.getElementById('szDesc');

// Data
const ELEMENT_MAP = {
    'worker': '👷',
    'farmer': '🌾',
    'soldier': '🪖',
    'scholar': '🎓'
};

const ELEMENT_POWER = {
    'worker': 10,
    'farmer': 10,
    'soldier': 12,
    'scholar': 15
};

const NAMED_COMBOS = {
    'worker,farmer': '工农联盟',
    'worker,soldier': '军民融合',
    'worker,scholar': '产学研结合',
    'farmer,scholar': '乡村振兴',
    'worker,farmer,soldier': '钢铁长城',
    'worker,farmer,scholar': '科教兴国',
    'worker,farmer,soldier,scholar': '民族复兴'
};

const MISSIONS = [
    { title: '需要巩固工农联盟基础', target: ['worker', 'farmer'] },
    { title: '需要推进乡村振兴战略', target: ['farmer', 'scholar'] },
    { title: '需要加强军民融合发展', target: ['worker', 'soldier'] },
    { title: '需要构建钢铁长城', target: ['worker', 'farmer', 'soldier'] },
    { title: '需要实现科教兴国', target: ['worker', 'farmer', 'scholar'] },
    { title: '需要实现中华民族伟大复兴', target: ['worker', 'farmer', 'soldier', 'scholar'] }
];

// State
let selectedForces = [];
let generatedSubsets = [];
let isAnimating = false;
let currentMission = null;
let totalScore = 0;

// Helper Functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateStats() {
    const n = Array.from(checkboxes).filter(cb => cb.checked).length;
    nValue.textContent = n;
    powersetValue.textContent = Math.pow(2, n);
}

function calculateSynergy(subset) {
    if (subset.length === 0) return 0;

    let baseScore = subset.reduce((acc, key) => acc + ELEMENT_POWER[key], 0);

    // Synergy Bonus: (Size - 1) * 20%
    // 1 element: 0% bonus
    // 2 elements: 20% bonus
    // 3 elements: 40% bonus
    // 4 elements: 60% bonus

    let multiplier = 1 + (subset.length - 1) * 0.2;
    return Math.round(baseScore * multiplier);
}

function getComboTitle(subset) {
    if (subset.length === 0) return '基础/零点';
    const key = subset.sort().join(',');
    return NAMED_COMBOS[key] || '联合行动';
}

// Logic
async function mobilizeForces() {
    if (isAnimating) return;
    isAnimating = true;
    mobilizeBtn.disabled = true;
    startMissionBtn.disabled = true;

    // Get selected
    selectedForces = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    const n = selectedForces.length;
    const totalSubsets = Math.pow(2, n);

    subsetsContainer.innerHTML = '';
    generatedSubsets = [];

    // Generate Power Set
    let subsets = [];
    for (let i = 0; i < totalSubsets; i++) {
        let subset = [];
        for (let j = 0; j < n; j++) {
            if ((i >> j) & 1) {
                subset.push(selectedForces[j]);
            }
        }
        subsets.push(subset);
    }

    subsets.sort((a, b) => a.length - b.length);
    generatedSubsets = subsets;

    // Render Animation
    for (let i = 0; i < subsets.length; i++) {
        const subset = subsets[i];
        const power = calculateSynergy(subset);
        const title = getComboTitle(subset);

        const box = document.createElement('div');
        box.className = 'subset-box';
        box.dataset.index = i; // Store index for validation

        // Header
        const header = document.createElement('div');
        header.className = 'subset-header';
        header.innerHTML = `
            <span class="subset-label">方案 ${i + 1}</span>
            <span class="power-badge">⚡${power}</span>
        `;
        box.appendChild(header);

        // Content
        const content = document.createElement('div');
        content.className = 'subset-elements';

        if (subset.length === 0) {
            content.innerHTML = '<span class="empty-set-symbol">∅</span>';
        } else {
            subset.forEach(key => {
                const icon = document.createElement('span');
                icon.className = 'element-icon';
                icon.textContent = ELEMENT_MAP[key];
                content.appendChild(icon);
            });
        }
        box.appendChild(content);

        // Footer Title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'combo-title';
        titleDiv.textContent = title;
        box.appendChild(titleDiv);

        if (subset.length === n && n > 0) {
            box.classList.add('full-set');
        }

        // Click Handler for Mission
        box.addEventListener('click', () => checkMission(i, box));

        subsetsContainer.appendChild(box);

        // Staggered animation
        await sleep(80);
    }

    // Final Message
    szTitle.textContent = '力量倍增';
    szDesc.textContent = `${n}种基础力量，通过统筹组合，衍生出了${totalSubsets}种工作方案。这生动体现了“团结就是力量”的倍增效应（1+1>2），构建了全覆盖的治理体系。`;

    isAnimating = false;
    mobilizeBtn.disabled = false;
    startMissionBtn.disabled = false;
}

function startMission() {
    if (generatedSubsets.length === 0) return;

    // Filter available missions based on selected forces
    const availableMissions = MISSIONS.filter(m => {
        return m.target.every(t => selectedForces.includes(t));
    });

    if (availableMissions.length === 0) {
        alert("当前选择的力量不足以执行高级任务，请增加更多力量！");
        return;
    }

    const mission = availableMissions[Math.floor(Math.random() * availableMissions.length)];
    currentMission = mission;

    missionBanner.classList.remove('hidden', 'success');
    missionTarget.textContent = mission.title;

    szTitle.textContent = '任务发布';
    szDesc.textContent = '上级发布了新的治理任务。请在下方的力量组合中，点击选择最适合该任务的“工作专班”（子集）。';
}

function checkMission(index, boxElement) {
    if (!currentMission) return;

    const subset = generatedSubsets[index];
    const target = currentMission.target;

    // Check if subset matches target (order independent)
    const isMatch = subset.length === target.length &&
        subset.every(val => target.includes(val));

    if (isMatch) {
        // Success
        boxElement.classList.add('correct');
        missionBanner.classList.add('success');
        missionTarget.textContent = '任务完成！';

        const points = calculateSynergy(subset);
        totalScore += points;
        scoreValue.textContent = totalScore;

        currentMission = null;

        szTitle.textContent = '任务完成';
        szDesc.textContent = `祝贺！你正确选择了“${getComboTitle(subset)}”来完成任务。这体现了精准施策、科学调配力量的治理智慧。`;

        setTimeout(() => {
            boxElement.classList.remove('correct');
            missionBanner.classList.add('hidden');
        }, 2000);

    } else {
        // Fail
        boxElement.classList.add('wrong');
        setTimeout(() => boxElement.classList.remove('wrong'), 500);
    }
}

// Event Listeners
checkboxes.forEach(cb => {
    cb.addEventListener('change', updateStats);
});

mobilizeBtn.addEventListener('click', mobilizeForces);
startMissionBtn.addEventListener('click', startMission);

resetBtn.addEventListener('click', () => {
    if (isAnimating) return;
    subsetsContainer.innerHTML = '';
    checkboxes.forEach(cb => {
        if (cb.value === 'worker' || cb.value === 'farmer') cb.checked = true;
        else cb.checked = false;
    });
    updateStats();

    currentMission = null;
    missionBanner.classList.add('hidden');
    totalScore = 0;
    scoreValue.textContent = 0;
    startMissionBtn.disabled = true;

    szTitle.textContent = '系统治理';
    szDesc.textContent = '幂集象征着国家治理体系的丰富性。每一个子集代表一种特定的力量组合（工作专班），通过统筹兼顾，可以形成全方位、多层次的治理效能。';
});

// Init
updateStats();
