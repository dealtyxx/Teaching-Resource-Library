/**
 * Red Mathematics - Set Theory Visualizer
 * Fixed: proper SVG-based region highlighting for all set operations
 */

// ── DOM Elements ──────────────────────────────────────────────
const elementPool    = document.getElementById('elementPool');
const setA           = document.getElementById('setA');
const setB           = document.getElementById('setB');
const setIntersect   = document.getElementById('setIntersect');
const notationDisplay = document.getElementById('notationDisplay');
const resultBadge    = document.getElementById('resultBadge');
const resultText     = document.getElementById('resultText');
const szTitle        = document.getElementById('szTitle');
const szDesc         = document.getElementById('szDesc');
const opBtns         = document.querySelectorAll('.op-btn');
const resetBtn       = document.getElementById('resetBtn');
const opLabel        = document.getElementById('opLabel');

// ── SVG Highlight Elements ────────────────────────────────────
const svgHlA   = document.getElementById('svgHlA');   // A-only region   (red)
const svgHlI   = document.getElementById('svgHlI');   // Intersection     (gold)
const svgHlB   = document.getElementById('svgHlB');   // B-only region   (red)
const svgDragA = document.getElementById('svgDragA'); // Drag-over A hint
const svgDragB = document.getElementById('svgDragB'); // Drag-over B hint

// ── State ─────────────────────────────────────────────────────
let elementsA  = new Set();
let elementsB  = new Set();
let currentOp  = null;
let draggedType = null;

// ── Element Definitions ───────────────────────────────────────
const ELEMENT_MAP = {
    worker:  '👷',
    farmer:  '🌾',
    soldier: '🪖',
    scholar: '🎓',
    youth:   '🚩'
};

// ── Drag & Drop ───────────────────────────────────────────────
elementPool.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('element-item')) {
        draggedType = e.target.dataset.type;
        e.dataTransfer.effectAllowed = 'copy';
    }
});

[setA, setB].forEach(zone => {
    const dragEl = zone.id === 'setA' ? svgDragA : svgDragB;

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        dragEl.style.opacity = '1';
    });

    zone.addEventListener('dragleave', () => {
        dragEl.style.opacity = '0';
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        dragEl.style.opacity = '0';

        if (draggedType) {
            const targetSet = zone.id === 'setA' ? elementsA : elementsB;
            if (!targetSet.has(draggedType)) {
                targetSet.add(draggedType);
                renderSets();
                updateNotation();
            }
            draggedType = null;
        }
    });
});

// ── Rendering ─────────────────────────────────────────────────
function renderSets() {
    const contentA = setA.querySelector('.set-content');
    const contentB = setB.querySelector('.set-content');

    contentA.innerHTML = '';
    contentB.innerHTML = '';
    setIntersect.innerHTML = '';

    const allTypes = new Set([...elementsA, ...elementsB]);

    allTypes.forEach(type => {
        const inA  = elementsA.has(type);
        const inB  = elementsB.has(type);
        const icon = ELEMENT_MAP[type];

        const el = document.createElement('div');
        el.className = 'dropped-item';
        el.textContent = icon;
        el.title = type;

        if (inA && inB) {
            // Element is in both sets → show in the intersection zone
            setIntersect.appendChild(el);
        } else if (inA) {
            contentA.appendChild(el);
        } else {
            contentB.appendChild(el);
        }
    });
}

function updateNotation() {
    const iconsA = [...elementsA].map(t => ELEMENT_MAP[t]);
    const iconsB = [...elementsB].map(t => ELEMENT_MAP[t]);
    let text = `A = {${iconsA.join(' ')}}   B = {${iconsB.join(' ')}}`;

    if (currentOp) {
        const [sym, res] = computeResult();
        const resIcons   = res.map(t => ELEMENT_MAP[t]);
        text += `   |   ${sym} = {${resIcons.join(' ')}}`;
    }

    notationDisplay.textContent = text;
}

// Returns [symbol string, result array of types]
function computeResult() {
    if (currentOp === 'union') {
        return ['A ∪ B', [...new Set([...elementsA, ...elementsB])]];
    }
    if (currentOp === 'intersection') {
        return ['A ∩ B', [...elementsA].filter(x => elementsB.has(x))];
    }
    if (currentOp === 'diffA') {
        return ['A ∖ B', [...elementsA].filter(x => !elementsB.has(x))];
    }
    if (currentOp === 'diffB') {
        return ['B ∖ A', [...elementsB].filter(x => !elementsA.has(x))];
    }
    return ['', []];
}

// ── SVG Region Highlighting ───────────────────────────────────
// Each argument = whether to show that region
function setRegions(aOnly, intersect, bOnly) {
    svgHlA.style.opacity = aOnly     ? '1' : '0';
    svgHlI.style.opacity = intersect ? '1' : '0';
    svgHlB.style.opacity = bOnly     ? '1' : '0';
}

function updateHighlights() {
    switch (currentOp) {
        case 'union':
            setRegions(true, true, true);
            opLabel.textContent = 'A ∪ B  ← 并集：包含 A 或 B 中的所有元素';
            break;
        case 'intersection':
            setRegions(false, true, false);          // only the lens-shaped center
            opLabel.textContent = 'A ∩ B  ← 交集：只包含同时属于 A 和 B 的元素（金色区域）';
            break;
        case 'diffA':
            setRegions(true, false, false);          // only A-only region
            opLabel.textContent = 'A ∖ B  ← 差集：属于 A 但不属于 B 的元素（左侧红色区域）';
            break;
        case 'diffB':
            setRegions(false, false, true);          // only B-only region
            opLabel.textContent = 'B ∖ A  ← 差集：属于 B 但不属于 A 的元素（右侧红色区域）';
            break;
        default:
            setRegions(false, false, false);
            opLabel.textContent = '';
    }
    opLabel.classList.toggle('hidden', !currentOp);
}

function resetHighlights() {
    setRegions(false, false, false);
    opLabel.classList.add('hidden');
}

// ── Operation Buttons ─────────────────────────────────────────
opBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        opBtns.forEach(b => b.classList.remove('active'));

        if (currentOp === btn.dataset.op) {
            // Toggle off
            currentOp = null;
            resetHighlights();
            resultBadge.classList.add('hidden');
            resetIdeology();
        } else {
            btn.classList.add('active');
            currentOp = btn.dataset.op;
            updateHighlights();
            updateIdeology();
        }
        updateNotation();
    });
});

function resetIdeology() {
    szTitle.textContent = '统一战线';
    szDesc.textContent  = '集合论中的"并集"象征着大团结，将不同的群体（集合元素）团结在党的周围，形成最广泛的统一战线。';
}

function updateIdeology() {
    resultBadge.classList.remove('hidden');

    const ideology = {
        union:        { badge: '大团结',    title: '大团结 (并集)',        desc: '团结一切可以团结的力量，调动一切积极因素，形成推动发展的强大合力。' },
        intersection: { badge: '求同存异',  title: '求同存异 (交集)',       desc: '在共同目标（交集）的基础上，尊重差异，寻找最大公约数，画出最大同心圆。' },
        diffA:        { badge: '保持先进性', title: '先进性 (差集 A∖B)',    desc: '保留自身独特的优良品质，剔除不良影响，在比较中彰显自身的先进性和纯洁性。' },
        diffB:        { badge: '特色发展',  title: '特色发展 (差集 B∖A)',   desc: '立足自身实际，发挥独特优势，走出一条具有自身特色的发展道路。' },
    };

    const { badge, title, desc } = ideology[currentOp];
    resultText.textContent = badge;
    szTitle.textContent    = title;
    szDesc.textContent     = desc;
}

// ── Reset ─────────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
    elementsA.clear();
    elementsB.clear();
    currentOp = null;
    opBtns.forEach(b => b.classList.remove('active'));
    resetHighlights();
    renderSets();
    updateNotation();
    resultBadge.classList.add('hidden');
    resetIdeology();
});

// ── Init ──────────────────────────────────────────────────────
updateNotation();
