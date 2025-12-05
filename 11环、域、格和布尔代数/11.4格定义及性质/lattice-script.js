/**
 * Tower of Order - Lattice Theory Visualizer
 * 秩序之塔 - 格论可视化
 */

// DOM Elements
const latticeType = document.getElementById('latticeType');
const joinBtn = document.getElementById('joinBtn');
const meetBtn = document.getElementById('meetBtn');
const sublatticeBtn = document.getElementById('sublatticeBtn');
const homomorphismBtn = document.getElementById('homomorphismBtn');
const slot1 = document.getElementById('slot1');
const slot2 = document.getElementById('slot2');
const opSymbol = document.getElementById('opSymbol');
const computeBtn = document.getElementById('computeBtn');
const operationResult = document.getElementById('operationResult');
const buildLatticeBtn = document.getElementById('buildLatticeBtn');
const resetBtn = document.getElementById('resetBtn');
const visualizationArea = document.getElementById('visualizationArea');
const vizTitle = document.getElementById('vizTitle');
const vizSubtitle = document.getElementById('vizSubtitle');
const ideologyCard = document.getElementById('ideologyCard');
const elementCount = document.getElementById('elementCount');
const levelCount = document.getElementById('levelCount');
const operationCount = document.getElementById('operationCount');
const score = document.getElementById('score');

// State
let currentLattice = 'divisors12';
let currentMode = 'join'; // join, meet, sublattice, homomorphism
let selectedElements = [null, null];
let latticeData = null;
let gameScore = 0;
let opCount = 0;

// Ideological messages
const ideologicalMessages = {
    lattice: {
        title: "层级秩序",
        message: "格的偏序结构体现组织层级，上下有序、协作有序，展现和谐统一的秩序之美",
        icon: "△"
    },
    join: {
        title: "并运算 - 团结向上",
        message: "并运算寻找最小上界，体现团结协作、共同提升的向上精神",
        icon: "∨"
    },
    meet: {
        title: "交运算 - 共同基础",
        message: "交运算寻找最大下界，象征寻找共识、夯实基础的务实作风",
        icon: "∧"
    },
    sublattice: {
        title: "子格 - 基层单位",
        message: "子格保持母格的运算结构，如基层组织保留整体特质，自成体系",
        icon: "⊆"
    },
    homomorphism: {
        title: "格同态 - 结构映射",
        message: "格同态保持并和交运算，展现不同组织间的结构性协作关系",
        icon: "→"
    }
};

// Lattice definitions
const lattices = {
    divisors12: {
        name: "约数格 D₁₂",
        elements: [1, 2, 3, 4, 6, 12],
        partialOrder: (a, b) => b % a === 0, // a ≤ b if a divides b
        join: (a, b) => lcm(a, b), // 最小公倍数
        meet: (a, b) => gcd(a, b), // 最大公约数
        levels: {
            0: [1],
            1: [2, 3],
            2: [6],
            3: [12]
        }
    },
    divisors30: {
        name: "约数格 D₃₀",
        elements: [1, 2, 3, 5, 6, 10, 15, 30],
        partialOrder: (a, b) => b % a === 0,
        join: (a, b) => lcm(a, b),
        meet: (a, b) => gcd(a, b),
        levels: {
            0: [1],
            1: [2, 3, 5],
            2: [6, 10, 15],
            3: [30]
        }
    },
    powerset: {
        name: "幂集格 2³",
        elements: ['∅', '{a}', '{b}', '{c}', '{a,b}', '{a,c}', '{b,c}', '{a,b,c}'],
        elementSets: [
            new Set(),
            new Set(['a']),
            new Set(['b']),
            new Set(['c']),
            new Set(['a', 'b']),
            new Set(['a', 'c']),
            new Set(['b', 'c']),
            new Set(['a', 'b', 'c'])
        ],
        partialOrder: function (a, b) {
            const setA = this.elementSets[this.elements.indexOf(a)];
            const setB = this.elementSets[this.elements.indexOf(b)];
            return isSubset(setA, setB);
        },
        join: function (a, b) {
            const setA = this.elementSets[this.elements.indexOf(a)];
            const setB = this.elementSets[this.elements.indexOf(b)];
            const union = new Set([...setA, ...setB]);
            const idx = this.elementSets.findIndex(s => setsEqual(s, union));
            return this.elements[idx];
        },
        meet: function (a, b) {
            const setA = this.elementSets[this.elements.indexOf(a)];
            const setB = this.elementSets[this.elements.indexOf(b)];
            const intersection = new Set([...setA].filter(x => setB.has(x)));
            const idx = this.elementSets.findIndex(s => setsEqual(s, intersection));
            return this.elements[idx];
        },
        levels: {
            0: ['∅'],
            1: ['{a}', '{b}', '{c}'],
            2: ['{a,b}', '{a,c}', '{b,c}'],
            3: ['{a,b,c}']
        }
    },
    diamond: {
        name: "钻石格 M₃",
        elements: ['0', 'a', 'b', 'c', '1'],
        partialOrder: function (x, y) {
            const order = {
                '0': ['0', 'a', 'b', 'c', '1'],
                'a': ['a', '1'],
                'b': ['b', '1'],
                'c': ['c', '1'],
                '1': ['1']
            };
            return order[x]?.includes(y) || false;
        },
        join: function (a, b) {
            if (a === b) return a;
            if (a === '0') return b;
            if (b === '0') return a;
            return '1';
        },
        meet: function (a, b) {
            if (a === b) return a;
            if (a === '1') return b;
            if (b === '1') return a;
            return '0';
        },
        levels: {
            0: ['0'],
            1: ['a', 'b', 'c'],
            2: ['1']
        }
    },
    pentagon: {
        name: "五边形格 N₅",
        elements: ['0', 'a', 'b', 'c', '1'],
        partialOrder: function (x, y) {
            const order = {
                '0': ['0', 'a', 'b', 'c', '1'],
                'a': ['a', 'b', 'c', '1'],
                'b': ['b', 'c', '1'],
                'c': ['c', '1'],
                '1': ['1']
            };
            return order[x]?.includes(y) || false;
        },
        join: function (a, b) {
            const levels = [['0'], ['a'], ['b'], ['c'], ['1']];
            const aLevel = levels.findIndex(l => l.includes(a));
            const bLevel = levels.findIndex(l => l.includes(b));

            if (aLevel <= bLevel) return b;
            return a;
        },
        meet: function (a, b) {
            const levels = [['0'], ['a'], ['b'], ['c'], ['1']];
            const aLevel = levels.findIndex(l => l.includes(a));
            const bLevel = levels.findIndex(l => l.includes(b));

            if (aLevel <= bLevel) return a;
            return b;
        },
        levels: {
            0: ['0'],
            1: ['a'],
            2: ['b'],
            3: ['c'],
            4: ['1']
        }
    }
};

// Helper functions
function gcd(a, b) {
    while (b !== 0) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function lcm(a, b) {
    return (a * b) / gcd(a, b);
}

function isSubset(setA, setB) {
    for (const elem of setA) {
        if (!setB.has(elem)) return false;
    }
    return true;
}

function setsEqual(setA, setB) {
    if (setA.size !== setB.size) return false;
    for (const elem of setA) {
        if (!setB.has(elem)) return false;
    }
    return true;
}

// Initialize
function init() {
    updateIdeology('lattice');
    setActiveMode('join');
}

// Update ideology card
function updateIdeology(key) {
    const msg = ideologicalMessages[key];
    if (msg) {
        ideologyCard.querySelector('.card-icon').textContent = msg.icon;
        ideologyCard.querySelector('.card-title').textContent = msg.title;
        ideologyCard.querySelector('.card-content').textContent = msg.message;

        ideologyCard.classList.remove('active');
        setTimeout(() => ideologyCard.classList.add('active'), 10);
    }
}

// Set active mode
function setActiveMode(mode) {
    currentMode = mode;

    // Update button states
    [joinBtn, meetBtn, sublatticeBtn, homomorphismBtn].forEach(btn => {
        btn.classList.remove('active');
    });

    switch (mode) {
        case 'join':
            joinBtn.classList.add('active');
            opSymbol.textContent = '∨';
            break;
        case 'meet':
            meetBtn.classList.add('active');
            opSymbol.textContent = '∧';
            break;
        case 'sublattice':
            sublatticeBtn.classList.add('active');
            break;
        case 'homomorphism':
            homomorphismBtn.classList.add('active');
            break;
    }

    // Reset selection
    selectedElements = [null, null];
    updateSlots();
    clearResultHighlight();
}

// Build lattice visualization
function buildLattice() {
    const lattice = lattices[currentLattice];
    latticeData = lattice;

    vizTitle.textContent = `${lattice.name} - Hasse 图`;
    vizSubtitle.textContent = `${lattice.elements.length} 个元素，${Object.keys(lattice.levels).length} 个层级`;

    // Update stats
    elementCount.textContent = lattice.elements.length;
    levelCount.textContent = Object.keys(lattice.levels).length;

    // Create Hasse diagram
    const container = document.createElement('div');
    container.className = 'hasse-diagram';

    // Create SVG for edges
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'lattice-edge-svg');
    container.appendChild(svg);

    // Calculate positions
    const positions = calculateNodePositions(lattice);

    // Draw edges first
    drawEdges(svg, lattice, positions);

    // Create nodes
    lattice.elements.forEach((elem, idx) => {
        const node = document.createElement('div');
        node.className = 'lattice-node';
        node.textContent = elem;
        node.dataset.element = elem;
        node.dataset.index = idx;

        const pos = positions[idx];
        node.style.left = `${pos.x}px`;
        node.style.top = `${pos.y}px`;

        node.addEventListener('click', () => selectElement(elem, node));

        container.appendChild(node);
    });

    visualizationArea.innerHTML = '';
    visualizationArea.appendChild(container);
}

// Calculate node positions for Hasse diagram
function calculateNodePositions(lattice) {
    const positions = [];
    const levels = lattice.levels;
    const levelCount = Object.keys(levels).length;
    const containerWidth = visualizationArea.clientWidth || 600;
    const containerHeight = visualizationArea.clientHeight || 500;

    const verticalSpacing = Math.min(120, (containerHeight - 100) / (levelCount - 1));
    const startY = 50;

    lattice.elements.forEach((elem) => {
        // Find which level this element is in
        let level = 0;
        for (const [lvl, elems] of Object.entries(levels)) {
            if (elems.includes(elem)) {
                level = parseInt(lvl);
                break;
            }
        }

        const levelElems = levels[level];
        const indexInLevel = levelElems.indexOf(elem);
        const levelSize = levelElems.length;

        const horizontalSpacing = Math.min(100, containerWidth / (levelSize + 1));
        const startX = (containerWidth - (levelSize - 1) * horizontalSpacing) / 2;

        const x = startX + indexInLevel * horizontalSpacing - 25; // -25 for node radius
        const y = containerHeight - startY - level * verticalSpacing - 25;

        positions.push({ x, y });
    });

    return positions;
}

// Draw edges (covering relations)
function drawEdges(svg, lattice, positions) {
    const elements = lattice.elements;

    elements.forEach((lower, lowerIdx) => {
        elements.forEach((upper, upperIdx) => {
            if (lower === upper) return;

            // Check if lower covers upper (lower < upper and no element between)
            const lowerPos = positions[lowerIdx];
            const upperPos = positions[upperIdx];

            if (typeof lattice.partialOrder === 'function') {
                const isLE = lattice.partialOrder(lower, upper);
                if (!isLE || lower === upper) return;

                // Check if it's a covering relation (no element between)
                let isCovering = true;
                for (const mid of elements) {
                    if (mid === lower || mid === upper) continue;
                    if (lattice.partialOrder(lower, mid) && lattice.partialOrder(mid, upper)) {
                        isCovering = false;
                        break;
                    }
                }

                if (isCovering) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('class', 'lattice-edge');
                    line.setAttribute('x1', lowerPos.x + 25);
                    line.setAttribute('y1', lowerPos.y + 25);
                    line.setAttribute('x2', upperPos.x + 25);
                    line.setAttribute('y2', upperPos.y + 25);
                    line.dataset.from = lower;
                    line.dataset.to = upper;
                    svg.appendChild(line);
                }
            }
        });
    });
}

// Select element
function selectElement(elem, node) {
    if (currentMode === 'sublattice' || currentMode === 'homomorphism') {
        // Different behavior for these modes
        return;
    }

    // Add/update selection for join/meet
    if (selectedElements[0] === null) {
        selectedElements[0] = elem;
    } else if (selectedElements[1] === null) {
        selectedElements[1] = elem;
    } else {
        // Replace first element
        selectedElements[0] = selectedElements[1];
        selectedElements[1] = elem;
    }

    updateSlots();
    updateNodeHighlights();
}

// Update slot display
function updateSlots() {
    const slot1Value = slot1.querySelector('.slot-value');
    const slot2Value = slot2.querySelector('.slot-value');

    if (selectedElements[0] !== null) {
        slot1Value.textContent = selectedElements[0];
        slot1.classList.add('filled');
    } else {
        slot1Value.textContent = '—';
        slot1.classList.remove('filled');
    }

    if (selectedElements[1] !== null) {
        slot2Value.textContent = selectedElements[1];
        slot2.classList.add('filled');
    } else {
        slot2Value.textContent = '—';
        slot2.classList.remove('filled');
    }
}

// Update node highlights
function updateNodeHighlights() {
    document.querySelectorAll('.lattice-node').forEach(node => {
        node.classList.remove('selected', 'result');
        const elem = node.dataset.element;
        if (selectedElements.includes(elem)) {
            node.classList.add('selected');
        }
    });
}

// Compute operation
function computeOperation() {
    if (selectedElements[0] === null || selectedElements[1] === null) {
        operationResult.querySelector('.result-value').textContent = '请选择两个元素';
        return;
    }

    const a = selectedElements[0];
    const b = selectedElements[1];
    let result;

    if (currentMode === 'join') {
        result = typeof latticeData.join === 'function' ?
            latticeData.join(a, b) : lcm(a, b);
        operationResult.querySelector('.result-value').textContent = `${a} ∨ ${b} = ${result}`;
    } else if (currentMode === 'meet') {
        result = typeof latticeData.meet === 'function' ?
            latticeData.meet(a, b) : gcd(a, b);
        operationResult.querySelector('.result-value').textContent = `${a} ∧ ${b} = ${result}`;
    }

    // Highlight result node
    highlightResult(result);

    // Update stats
    opCount++;
    operationCount.textContent = opCount;
    gameScore += 10;
    score.textContent = gameScore;
}

// Highlight result
function highlightResult(result) {
    clearResultHighlight();

    const nodes = document.querySelectorAll('.lattice-node');
    nodes.forEach(node => {
        if (node.dataset.element === String(result)) {
            node.classList.add('result');
        }
    });
}

// Clear result highlight
function clearResultHighlight() {
    document.querySelectorAll('.lattice-node.result').forEach(node => {
        node.classList.remove('result');
    });
}

// Reset
function reset() {
    visualizationArea.innerHTML = `
        <div class="welcome-state">
            <div class="tower-animation">
                <svg viewBox="0 0 200 200" class="tower-svg">
                    <defs>
                        <linearGradient id="towerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" style="stop-color:#8b0000;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#d63b1d;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffb400;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <polygon points="100,20 130,60 70,60" fill="url(#towerGrad)" class="tower-level" />
                    <polygon points="100,60 140,100 60,100" fill="url(#towerGrad)" class="tower-level"
                        style="opacity: 0.8" />
                    <polygon points="100,100 150,140 50,140" fill="url(#towerGrad)" class="tower-level"
                        style="opacity: 0.6" />
                    <polygon points="100,140 160,180 40,180" fill="url(#towerGrad)" class="tower-level"
                        style="opacity: 0.4" />
                    <polygon points="100,5 103,15 113,15 105,21 108,31 100,25 92,31 95,21 87,15 97,15"
                        fill="#ffb400" class="tower-star" />
                </svg>
            </div>
            <p class="welcome-text">构建秩序之塔，探索格的层级结构</p>
        </div>
    `;

    vizTitle.textContent = 'Hasse 图可视化';
    vizSubtitle.textContent = '点击"构建格结构"开始探索';

    selectedElements = [null, null];
    updateSlots();

    operationResult.querySelector('.result-value').textContent = '选择两个元素';

    opCount = 0;
    operationCount.textContent = opCount;
}

// Event Listeners
latticeType.addEventListener('change', (e) => {
    currentLattice = e.target.value;
});

joinBtn.addEventListener('click', () => {
    setActiveMode('join');
    updateIdeology('join');
});

meetBtn.addEventListener('click', () => {
    setActiveMode('meet');
    updateIdeology('meet');
});

sublatticeBtn.addEventListener('click', () => {
    setActiveMode('sublattice');
    updateIdeology('sublattice');
    // TODO: Implement sublattice visualization
});

homomorphismBtn.addEventListener('click', () => {
    setActiveMode('homomorphism');
    updateIdeology('homomorphism');
    // TODO: Implement homomorphism visualization
});

computeBtn.addEventListener('click', computeOperation);
buildLatticeBtn.addEventListener('click', buildLattice);
resetBtn.addEventListener('click', reset);

// Initialize
init();
