/**
 * Red Mathematics - Set Theory Visualizer
 */

// DOM Elements
const elementPool = document.getElementById('elementPool');
const setA = document.getElementById('setA');
const setB = document.getElementById('setB');
const notationDisplay = document.getElementById('notationDisplay');
const resultBadge = document.getElementById('resultBadge');
const resultText = document.getElementById('resultText');
const szTitle = document.getElementById('szTitle');
const szDesc = document.getElementById('szDesc');
const opBtns = document.querySelectorAll('.op-btn');
const resetBtn = document.getElementById('resetBtn');

// State
let elementsA = new Set();
let elementsB = new Set();
let currentOp = null;

// Element Definitions
const ELEMENT_MAP = {
    'worker': '👷',
    'farmer': '🌾',
    'soldier': '🪖',
    'scholar': '🎓',
    'youth': '🚩'
};

// Drag and Drop Logic
let draggedType = null;

elementPool.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('element-item')) {
        draggedType = e.target.dataset.type;
        e.dataTransfer.effectAllowed = 'copy';
    }
});

[setA, setB].forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        zone.classList.add('highlight');
    });

    zone.addEventListener('dragleave', () => {
        if (currentOp === null) zone.classList.remove('highlight');
        else updateHighlights(); // Restore op highlight
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (currentOp === null) zone.classList.remove('highlight');
        else updateHighlights();

        if (draggedType) {
            const isSetA = zone.id === 'setA';
            const targetSet = isSetA ? elementsA : elementsB;

            if (!targetSet.has(draggedType)) {
                targetSet.add(draggedType);
                renderSets();
                updateNotation();
            }
        }
    });
});

// Rendering
function renderSets() {
    // Clear contents
    setA.querySelector('.set-content').innerHTML = '';
    setB.querySelector('.set-content').innerHTML = '';

    // Render A (excluding intersection for visual clarity in simple venn, 
    // but here we just dump them in. Ideally we'd calculate intersection position)
    // For simplicity in this CSS implementation:
    // Items in A only -> Left side of A
    // Items in B only -> Right side of B
    // Items in both -> Center (we need to handle this visually)

    // Actually, let's just list them. The visual overlap is handled by the circles.
    // To make it look like they are in the intersection, we need to check membership.

    const allTypes = new Set([...elementsA, ...elementsB]);

    allTypes.forEach(type => {
        const inA = elementsA.has(type);
        const inB = elementsB.has(type);
        const icon = ELEMENT_MAP[type];

        const el = document.createElement('div');
        el.className = 'dropped-item';
        el.textContent = icon;

        // Positioning logic (Simulated)
        if (inA && inB) {
            // Intersection - tricky with two divs. 
            // We'll add to both but style them to overlap? 
            // Or just add to the one that visually represents the intersection?
            // Let's add to both for now, but maybe give them a specific class?
            // A better way for this specific visual:
            // Just put them in the circles.

            // For this demo, we will just append to the respective container.
            // The user sees the icon in the circle.
        }

        if (inA) {
            const clone = el.cloneNode(true);
            setA.querySelector('.set-content').appendChild(clone);
        }
        if (inB) {
            const clone = el.cloneNode(true);
            setB.querySelector('.set-content').appendChild(clone);
        }
    });
}

function updateNotation() {
    const arrA = Array.from(elementsA).map(t => ELEMENT_MAP[t]);
    const arrB = Array.from(elementsB).map(t => ELEMENT_MAP[t]);

    let text = `A = {${arrA.join(',')}}, B = {${arrB.join(',')}}`;

    if (currentOp) {
        let res = [];
        if (currentOp === 'union') {
            res = Array.from(new Set([...elementsA, ...elementsB]));
        } else if (currentOp === 'intersection') {
            res = Array.from(elementsA).filter(x => elementsB.has(x));
        } else if (currentOp === 'diffA') {
            res = Array.from(elementsA).filter(x => !elementsB.has(x));
        } else if (currentOp === 'diffB') {
            res = Array.from(elementsB).filter(x => !elementsA.has(x));
        }
        const resIcons = res.map(t => ELEMENT_MAP[t]);
        text += ` => Result = {${resIcons.join(',')}}`;
    }

    notationDisplay.textContent = text;
}

// Operations
opBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Toggle active state
        opBtns.forEach(b => b.classList.remove('active'));

        if (currentOp === btn.dataset.op) {
            currentOp = null; // Toggle off
            resetHighlights();
            resultBadge.classList.add('hidden');
            szTitle.textContent = '统一战线';
            szDesc.textContent = '集合论中的“并集”象征着大团结，将不同的群体（集合元素）团结在党的周围，形成最广泛的统一战线。';
        } else {
            btn.classList.add('active');
            currentOp = btn.dataset.op;
            updateHighlights();
            updateIdeology();
        }
        updateNotation();
    });
});

function updateHighlights() {
    resetHighlights();

    if (currentOp === 'union') {
        setA.classList.add('highlight');
        setB.classList.add('highlight');
    } else if (currentOp === 'intersection') {
        // Visualizing intersection highlight is tricky with CSS circles.
        // We can dim the non-intersecting parts?
        // Or just highlight both and let the user focus on overlap.
        // Let's try a different approach:
        setA.classList.add('highlight');
        setB.classList.add('highlight');
        // Ideally we'd have a specific style for intersection
    } else if (currentOp === 'diffA') {
        setA.classList.add('highlight');
        setB.classList.add('dim');
    } else if (currentOp === 'diffB') {
        setB.classList.add('highlight');
        setA.classList.add('dim');
    }
}

function resetHighlights() {
    setA.classList.remove('highlight', 'dim');
    setB.classList.remove('highlight', 'dim');
}

function updateIdeology() {
    resultBadge.classList.remove('hidden');

    if (currentOp === 'union') {
        resultText.textContent = '大团结';
        szTitle.textContent = '大团结 (并集)';
        szDesc.textContent = '团结一切可以团结的力量，调动一切积极因素，形成推动发展的强大合力。';
    } else if (currentOp === 'intersection') {
        resultText.textContent = '求同存异';
        szTitle.textContent = '求同存异 (交集)';
        szDesc.textContent = '在共同目标（交集）的基础上，尊重差异，寻找最大公约数，画出最大同心圆。';
    } else if (currentOp === 'diffA') {
        resultText.textContent = '保持先进性';
        szTitle.textContent = '先进性 (差集)';
        szDesc.textContent = '保留自身独特的优良品质，剔除不良影响，在比较中彰显自身的先进性和纯洁性。';
    } else if (currentOp === 'diffB') {
        resultText.textContent = '特色发展';
        szTitle.textContent = '特色发展 (差集)';
        szDesc.textContent = '立足自身实际，发挥独特优势，走出一条具有自身特色的发展道路。';
    }
}

resetBtn.addEventListener('click', () => {
    elementsA.clear();
    elementsB.clear();
    currentOp = null;
    opBtns.forEach(b => b.classList.remove('active'));
    resetHighlights();
    renderSets();
    updateNotation();
    resultBadge.classList.add('hidden');
    szTitle.textContent = '统一战线';
    szDesc.textContent = '集合论中的“并集”象征着大团结，将不同的群体（集合元素）团结在党的周围，形成最广泛的统一战线。';
});

// Init
updateNotation();
