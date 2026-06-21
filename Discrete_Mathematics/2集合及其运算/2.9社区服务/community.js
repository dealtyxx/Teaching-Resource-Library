/**
 * Red Mathematics - Community Service Data Analysis Visualizer
 */

// DOM Elements
const propagandaSlider = document.getElementById('propagandaSlider');
const difficultySlider = document.getElementById('difficultySlider');
const propagandaVal = document.getElementById('propagandaVal');
const difficultyVal = document.getElementById('difficultyVal');
const simulateBtn = document.getElementById('simulateBtn');
const residentGrid = document.getElementById('residentGrid');
const totalParticipantsEl = document.getElementById('totalParticipants');
const activistParticipantsEl = document.getElementById('activistParticipants');
const vanguardBar = document.getElementById('vanguardBar');
const vanguardRateEl = document.getElementById('vanguardRate');
const insightText = document.getElementById('insightText');
const viewBtns = document.querySelectorAll('.view-btn');
const viewLayers = document.querySelectorAll('.view-layer');

// Config
const TOTAL_RESIDENTS = 100;
const BASE_ACTIVIST_RATE = 0.15; // 15% are naturally activists

// State
let residents = []; // { id, isActivist, isParticipant }
let propagandaLevel = 50;
let difficultyLevel = 50;

// Initialization
function init() {
    generateResidents();
    analyzeData();
}

// Simulation Logic
function generateResidents() {
    residents = [];
    residentGrid.innerHTML = '';

    // 1. Determine Activists (P)
    // Propaganda increases the number of activists slightly (awakening consciousness)
    const effectiveActivistRate = BASE_ACTIVIST_RATE + (propagandaLevel / 100) * 0.15;

    for (let i = 0; i < TOTAL_RESIDENTS; i++) {
        const isActivist = Math.random() < effectiveActivistRate;

        // 2. Determine Participation (A)
        // Activists have high base participation probability
        // Normal residents depend heavily on Propaganda and Difficulty

        let participationProb = 0;

        if (isActivist) {
            participationProb = 0.9 - (difficultyLevel / 100) * 0.2; // Activists are resilient
        } else {
            // Normal residents: High propaganda helps, High difficulty hurts
            participationProb = 0.1 + (propagandaLevel / 100) * 0.6 - (difficultyLevel / 100) * 0.5;
        }

        // Clamp probability
        participationProb = Math.max(0, Math.min(1, participationProb));

        const isParticipant = Math.random() < participationProb;

        residents.push({ id: i, isActivist, isParticipant });

        // Render Dot
        const dot = document.createElement('div');
        dot.className = 'resident-dot';
        if (isActivist) dot.classList.add('activist');
        if (isParticipant) dot.classList.add('participant');
        residentGrid.appendChild(dot);
    }

    analyzeData();
}

function analyzeData() {
    // Calculate Sets
    const P = residents.filter(r => r.isActivist);
    const A = residents.filter(r => r.isParticipant);
    const P_intersect_A = residents.filter(r => r.isActivist && r.isParticipant);

    const countA = A.length;
    const countIntersection = P_intersect_A.length;

    // Calculate Metrics
    const vanguardRate = countA > 0 ? (countIntersection / countA) * 100 : 0;

    // Update Dashboard
    totalParticipantsEl.textContent = countA;
    activistParticipantsEl.textContent = countIntersection;

    vanguardBar.style.width = `${vanguardRate}%`;
    vanguardRateEl.textContent = `${vanguardRate.toFixed(1)}%`;

    // Generate Insight
    generateInsight(countA, vanguardRate);

    // Update Venn Diagram Visuals (Simple scaling)
    updateVenn(P.length, countA, countIntersection);
}

function generateInsight(countA, vanguardRate) {
    let msg = "";

    if (countA < 20) {
        msg = "参与人数过少。建议加大宣传力度，降低活动门槛，动员更多居民参与。";
    } else if (vanguardRate < 20) {
        msg = "先锋贡献率较低。虽然参与人数尚可，但积极分子的带头作用未充分发挥。建议加强骨干培养。";
    } else if (vanguardRate > 60) {
        msg = "先锋贡献率极高！积极分子充分发挥了模范带头作用，社区凝聚力强，是'身先士卒'的典范。";
    } else {
        msg = "社区动员状况良好。积极分子与普通居民形成了良好的互动，活动开展有序。";
    }

    insightText.textContent = msg;
}

function updateVenn(sizeP, sizeA, sizeIntersection) {
    // Visual scaling logic for Venn circles could go here
    // For now, we just rely on the static CSS layout but could animate sizes
}

// Event Listeners
propagandaSlider.addEventListener('input', (e) => {
    propagandaLevel = parseInt(e.target.value);
    propagandaVal.textContent = `${propagandaLevel}%`;
});

difficultySlider.addEventListener('input', (e) => {
    difficultyLevel = parseInt(e.target.value);
    const val = difficultyLevel;
    let text = "中等";
    if (val < 30) text = "简单";
    else if (val > 70) text = "困难";
    difficultyVal.textContent = text;
});

simulateBtn.addEventListener('click', () => {
    // Add loading animation or effect
    simulateBtn.innerHTML = '<span class="btn-icon">⏳</span> 动员中...';
    setTimeout(() => {
        generateResidents();
        simulateBtn.innerHTML = '<span class="btn-icon">🚀</span> 执行新活动';
    }, 500);
});

viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const view = btn.dataset.view;
        viewLayers.forEach(layer => layer.classList.remove('active'));
        document.getElementById(`${view}View`).classList.add('active');
    });
});

// Init
init();
