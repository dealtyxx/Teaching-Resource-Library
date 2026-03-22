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

// SVG highlight elements
const hlAB    = document.getElementById('hlAB');
const hlAonly = document.getElementById('hlAonly');
const hlFullA = document.getElementById('hlFullA');
const hlFullB = document.getElementById('hlFullB');
const hlFullC = document.getElementById('hlFullC');

// Visual Logic — uses SVG overlay elements for mathematically correct region highlighting
function setHighlightOpacity(ab, aOnly, fullA, fullB, fullC) {
    hlAB.style.opacity    = ab    ? '1' : '0';
    hlAonly.style.opacity = aOnly ? '1' : '0';
    hlFullA.style.opacity = fullA ? '1' : '0';
    hlFullB.style.opacity = fullB ? '1' : '0';
    hlFullC.style.opacity = fullC ? '1' : '0';
}

function updateVisuals(mode) {
    resetVisuals();

    if (mode === 'intersection_AB') {
        // A ∩ B: show ONLY the lens-shaped overlap of A and B (gold highlight)
        // The SVG hlAB element uses clip-path="url(#mcClipA)" on circle B,
        // which correctly renders only the region in both A and B.
        setHighlightOpacity(true, false, false, false, false);
        spawnParticlesInIntersection();

    } else if (mode === 'union_ABC') {
        // A ∪ B ∪ C: highlight all three circles
        setHighlightOpacity(false, false, true, true, true);

    } else if (mode === 'only_A') {
        // A ∩ Bᶜ ∩ Cᶜ: only the part of A not in B or C
        // The SVG hlAonly element uses a mask that subtracts circles B and C.
        setHighlightOpacity(false, true, false, false, false);
        // Dim B and C base circles to reinforce the visual
        circleB.style.opacity = '0.25';
        circleC.style.opacity = '0.25';
    }
}

function resetVisuals() {
    setHighlightOpacity(false, false, false, false, false);

    // Restore base circle styles
    circleA.style.fill = 'rgba(255, 255, 255, 0.3)';
    circleA.style.stroke = 'rgba(139, 0, 0, 0.2)';
    circleA.style.opacity = '1';
    circleB.style.fill = 'rgba(255, 255, 255, 0.3)';
    circleB.style.stroke = 'rgba(139, 0, 0, 0.2)';
    circleB.style.opacity = '1';
    circleC.style.fill = 'rgba(255, 255, 255, 0.3)';
    circleC.style.stroke = 'rgba(139, 0, 0, 0.2)';
    circleC.style.opacity = '1';

    particlesLayer.innerHTML = '';
}

// Particle System
function generateParticles() {
    // Add some ambient floating particles (lanterns/stars)
    // ...
}

function spawnParticlesInIntersection() {
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
