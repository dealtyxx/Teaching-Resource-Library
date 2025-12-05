/**
 * Red Mathematics - Classical Garden Set Theory Visualizer
 */

// DOM Elements
const missionBtns = document.querySelectorAll('.mission-btn');
const insightTitle = document.getElementById('insightTitle');
const insightText = document.getElementById('insightText');
const resetBtn = document.getElementById('resetBtn');
const gardenMap = document.getElementById('gardenMap');

// Data
const PLANTS = [
    { id: 'shaoyao', name: '芍药', icon: '🌺', sets: ['A'], x: 15, y: 20 },
    { id: 'mudan', name: '牡丹', icon: '🏵️', sets: ['A'], x: 25, y: 15 },
    { id: 'chahua', name: '茶花', icon: '🌺', sets: ['A'], x: 10, y: 35 },

    { id: 'guihua', name: '桂花', icon: '🌼', sets: ['A', 'B'], x: 40, y: 30 }, // Intersection A & B

    { id: 'song', name: '松', icon: '🌲', sets: ['B'], x: 60, y: 20 },
    { id: 'mei', name: '梅', icon: '🌸', sets: ['B'], x: 70, y: 30 },

    { id: 'zhu', name: '竹', icon: '🎋', sets: ['B', 'C'], x: 75, y: 50 }, // Intersection B & C

    { id: 'huangzhu', name: '黄竹', icon: '🎋', sets: ['C'], x: 85, y: 60 },
    { id: 'kuzhu', name: '苦竹', icon: '🎋', sets: ['C'], x: 80, y: 70 },

    { id: 'lian', name: '莲', icon: '🪷', sets: ['D'], x: 20, y: 70 },
    { id: 'he', name: '荷', icon: '🍃', sets: ['D'], x: 30, y: 65 },
    { id: 'shuixian', name: '水仙', icon: '🌼', sets: ['D'], x: 40, y: 75 }
];

const MISSIONS = {
    1: {
        title: "德馨流芳 (Fragrance of Virtue)",
        text: "【A ∩ B】既是花卉又是树木。桂花（Osmanthus）集花之香与树之坚于一身，象征着君子'内外兼修'的品格。在园林中，常植于窗前，意为'折桂'，寓意科举高中、德才兼备。",
        filter: (p) => p.sets.includes('A') && p.sets.includes('B')
    },
    2: {
        title: "幽篁独坐 (Secluded Integrity)",
        text: "【C - (A ∪ B ∪ D)】独有的竹类。黄竹与苦竹，虽不如'竹'（Common Bamboo）那样常被归为树木之列，却在幽僻处独自成林。象征着隐士'独善其身'、不随波逐流的高洁情操。",
        filter: (p) => p.sets.includes('C') && !p.sets.includes('B') // "Bamboo" is in B, so exclude it
    },
    3: {
        title: "和而不同 (Harmony in Diversity)",
        text: "【Intersection ≥ 2】跨越类别的植物。桂花（花/树）与竹（树/竹）连接了不同的植物群落。它们体现了园林'虽由人作，宛自天开'的境界，万物相互依存，和而不同。",
        filter: (p) => p.sets.length >= 2
    }
};

// Initialization
function init() {
    renderPlants();
}

function renderPlants() {
    gardenMap.innerHTML = `
        <div class="zone zone-a" title="百花圃 (A)"></div>
        <div class="zone zone-b" title="松风岭 (B)"></div>
        <div class="zone zone-c" title="修竹苑 (C)"></div>
        <div class="zone zone-d" title="映日池 (D)"></div>
    `;

    PLANTS.forEach(plant => {
        const el = document.createElement('div');
        el.className = 'plant-item';
        el.style.left = `${plant.x}%`;
        el.style.top = `${plant.y}%`;
        el.dataset.id = plant.id;

        el.innerHTML = `
            <span class="plant-icon">${plant.icon}</span>
            <span class="plant-name">${plant.name}</span>
        `;

        // Add click handler for individual exploration
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            highlightPlant(plant);
        });

        gardenMap.appendChild(el);
    });
}

// Interaction
missionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // UI Update
        missionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const missionId = btn.dataset.mission;
        const mission = MISSIONS[missionId];

        // Update Insight
        insightTitle.textContent = mission.title;
        insightText.textContent = mission.text;

        // Update Visuals
        applyFilter(mission.filter);
    });
});

resetBtn.addEventListener('click', () => {
    missionBtns.forEach(b => b.classList.remove('active'));
    insightTitle.textContent = "游园初探";
    insightText.textContent = "园林之美，在于草木寄情。请点击上方任务，探寻植物分类背后的哲学意蕴。";
    resetVisuals();
});

// Visual Logic
function applyFilter(filterFn) {
    const plantEls = document.querySelectorAll('.plant-item');

    plantEls.forEach(el => {
        const plant = PLANTS.find(p => p.id === el.dataset.id);
        if (filterFn(plant)) {
            el.className = 'plant-item active';
        } else {
            el.className = 'plant-item dim';
        }
    });
}

function highlightPlant(plant) {
    // Show info for a single plant (optional feature)
    insightTitle.textContent = plant.name;
    insightText.textContent = `类别: ${plant.sets.join(' & ')}。${getPlantDesc(plant.id)}`;

    const plantEls = document.querySelectorAll('.plant-item');
    plantEls.forEach(el => {
        if (el.dataset.id === plant.id) {
            el.className = 'plant-item active';
        } else {
            el.className = 'plant-item dim';
        }
    });
}

function resetVisuals() {
    const plantEls = document.querySelectorAll('.plant-item');
    plantEls.forEach(el => {
        el.className = 'plant-item';
    });
}

function getPlantDesc(id) {
    const descs = {
        'guihua': '金秋送爽，十里飘香。',
        'zhu': '宁可食无肉，不可居无竹。',
        'lian': '出淤泥而不染，濯清涟而不妖。',
        'song': '大雪压青松，青松挺且直。'
    };
    return descs[id] || '园林中的一抹生机。';
}

// Init
init();
