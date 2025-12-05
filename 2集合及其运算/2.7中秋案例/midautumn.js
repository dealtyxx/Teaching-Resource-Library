/**
 * Red Mathematics - Mid-Autumn Set Theory Visualizer
 */

// DOM Elements
const missionBtns = document.querySelectorAll('.mission-btn');
const insightTitle = document.getElementById('insightTitle');
const insightText = document.getElementById('insightText');
const resetBtn = document.getElementById('resetBtn');
const circleA = document.getElementById('circleA');
const circleB = document.getElementById('circleB');
const circleC = document.getElementById('circleC');
const particlesLayer = document.getElementById('particlesLayer');

// Data & Config
const MISSIONS = {
    1: {
        title: "精神与物质的统一 (Harmony)",
        text: "【A ∩ B】既赏月（精神追求）又吃月饼（物质分享）。这象征着中华文化中精神生活与世俗生活的完美融合，既有仰望星空的诗意，又有脚踏实地的幸福。",
        highlight: ['A', 'B'], // Simplified logic, real intersection handled visually
        mode: 'intersection_AB'
    },
    2: {
        title: "最广泛的文化参与 (Cultural Confidence)",
        text: "【A ∪ B ∪ C】参与任一活动的人群。无论是赏月、吃饼还是提灯，都是对中秋文化的传承。这展现了中华文明强大的凝聚力和包容性，是文化自信的生动体现。",
        highlight: ['A', 'B', 'C'],
        mode: 'union_ABC'
    },
    3: {
        title: "纯粹的审美观照 (Aesthetic Pursuit)",
        text: "【A ∩ Bᶜ ∩ Cᶜ】只赏月，不吃饼也不提灯。这代表了一种超脱物质、专注于自然之美的精神境界，体现了中国文人'清风明月本无价'的高雅情趣。",
        highlight: ['A'],
        mode: 'only_A'
    }
};

// State
let currentMission = null;

// Initialization
function init() {
    // Generate background particles
    generateParticles();
}

// Interaction
missionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // UI Update
        missionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const missionId = btn.dataset.mission;
        const mission = MISSIONS[missionId];
        currentMission = missionId;

        // Update Insight
        insightTitle.textContent = mission.title;
        insightText.textContent = mission.text;

        // Update Visuals
        updateVisuals(mission.mode);
    });
});

resetBtn.addEventListener('click', () => {
    currentMission = null;
    missionBtns.forEach(b => b.classList.remove('active'));
    insightTitle.textContent = "请选择一个任务";
    insightText.textContent = "点击上方按钮，探索集合运算背后的文化内涵。";
    resetVisuals();
});

// Visual Logic
function updateVisuals(mode) {
    resetVisuals();

    // We use SVG manipulation to show specific regions
    // Since simple CSS classes on circles can't show A-only or Intersection perfectly without masks,
    // we will simulate the effect by changing opacity and colors.

    if (mode === 'intersection_AB') {
        // Highlight Intersection A & B
        // Visual trick: Make A and B colored, but maybe use a clip path or just show them both active
        // For a simple implementation without complex SVG paths:
        circleA.style.fill = 'rgba(255, 95, 86, 0.1)';
        circleA.style.stroke = 'rgba(255, 95, 86, 0.3)';
        circleB.style.fill = 'rgba(255, 189, 46, 0.1)';
        circleB.style.stroke = 'rgba(255, 189, 46, 0.3)';

        // We can add a specific particle effect in the intersection area
        spawnParticlesInIntersection(250, 140, 170, 260, 110);

    } else if (mode === 'union_ABC') {
        // Highlight All
        circleA.style.fill = 'rgba(255, 95, 86, 0.2)';
        circleA.style.stroke = '#ff5f56';
        circleB.style.fill = 'rgba(255, 189, 46, 0.2)';
        circleB.style.stroke = '#ffbd2e';
        circleC.style.fill = 'rgba(255, 149, 0, 0.2)';
        circleC.style.stroke = '#ff9500';

    } else if (mode === 'only_A') {
        // Highlight A only
        circleA.style.fill = 'rgba(255, 95, 86, 0.3)';
        circleA.style.stroke = '#ff5f56';
        // Dim others
        circleB.style.opacity = '0.2';
        circleC.style.opacity = '0.2';
    }
}

function resetVisuals() {
    circleA.style.fill = 'rgba(255, 255, 255, 0.3)';
    circleA.style.stroke = 'rgba(139, 0, 0, 0.2)';
    circleA.style.opacity = '1';

    circleB.style.fill = 'rgba(255, 255, 255, 0.3)';
    circleB.style.stroke = 'rgba(139, 0, 0, 0.2)';
    circleB.style.opacity = '1';

    circleC.style.fill = 'rgba(255, 255, 255, 0.3)';
    circleC.style.stroke = 'rgba(139, 0, 0, 0.2)';
    circleC.style.opacity = '1';

    particlesLayer.innerHTML = ''; // Clear special particles
}

// Particle System
function generateParticles() {
    // Add some ambient floating particles (lanterns/stars)
    // ...
}

function spawnParticlesInIntersection(x1, y1, x2, y2, r) {
    // Simple visual indicator for intersection
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.left = '210px'; // Approximate intersection center
    el.style.top = '200px';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.background = 'radial-gradient(circle, gold 0%, transparent 70%)';
    el.style.borderRadius = '50%';
    el.style.boxShadow = '0 0 20px 10px gold';
    el.style.animation = 'pulse 2s infinite';
    particlesLayer.appendChild(el);
}

// Init
init();
