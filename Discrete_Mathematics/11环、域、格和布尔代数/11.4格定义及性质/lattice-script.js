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
        message: "格中任意两个元素都有最小上界与最大下界：再多的差异，也总能找到共同目标（∨）与共同基础（∧）。",
        icon: "△"
    },
    join: {
        title: "并运算 - 团结向上",
        message: "a ∨ b 是同时高于 a、b 的元素中最低的那个——既照顾各方，又不好高骛远。",
        icon: "∨"
    },
    meet: {
        title: "交运算 - 共同基础",
        message: "a ∧ b 是 a、b 共有的最大下界，就像多方共识中的“最大公约数”。",
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
            2: [4, 6],
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
        // N5 正确结构: 0 < a < b < 1, 0 < c < 1, 且 a 与 c 不可比，b 与 c 不可比
        // 这是最小的非模格，其核心特征是存在不可比元素
        elements: ['0', 'a', 'c', 'b', '1'],
        partialOrder: function (x, y) {
            const order = {
                '0': ['0', 'a', 'b', 'c', '1'],
                'a': ['a', 'b', '1'],
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
            if (a === '1' || b === '1') return '1';
            // a∨b=b (since a≤b), a∨c=1, b∨c=1
            if ((a === 'a' && b === 'b') || (a === 'b' && b === 'a')) return 'b';
            return '1';
        },
        meet: function (a, b) {
            if (a === b) return a;
            if (a === '1') return b;
            if (b === '1') return a;
            if (a === '0' || b === '0') return '0';
            // a∧b=a (since a≤b), a∧c=0, b∧c=0
            if ((a === 'a' && b === 'b') || (a === 'b' && b === 'a')) return 'a';
            return '0';
        },
        levels: {
            0: ['0'],
            1: ['a', 'c'],
            2: ['b'],
            3: ['1']
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
    buildLattice();
    // 默认示例：在 D₁₂ 中选 4 与 6，演示 ∨
    selectedElements = ['4', '6'];
    updateSlots();
    updateNodeHighlights();
    computeOperation(true);
}
// 统一用字符串表示所选元素，计算时还原为格中的原始元素
function toElem(s) { return latticeData.elements.find(e => String(e) === String(s)); }
// 穷举检验格的代数性质：吸收律 + 分配律（交换、结合、幂等对任何格都成立）
function checkLaws(L) {
    const E = L.elements, J = (a, b) => L.join(a, b), M = (a, b) => L.meet(a, b);
    let absorb = true, distBad = null;
    for (const a of E) for (const b of E) {
        if (String(J(a, M(a, b))) !== String(a) || String(M(a, J(a, b))) !== String(a)) absorb = false;
        for (const c of E) {
            if (!distBad && String(M(a, J(b, c))) !== String(J(M(a, b), M(a, c)))) distBad = [a, b, c];
        }
    }
    return { absorb, distBad };
}
function coverCount(L) {
    let n = 0;
    for (const a of L.elements) for (const b of L.elements) {
        if (a === b || !L.partialOrder(a, b)) continue;
        if (!L.elements.some(m => m !== a && m !== b && L.partialOrder(a, m) && L.partialOrder(m, b))) n++;
    }
    return n;
}
function updateLawBadges() {
    const L = latticeData, K = checkLaws(L);
    const set = (id, ok, text) => {
        const el = document.getElementById(id);
        el.classList.toggle('ok', ok); el.classList.toggle('no', !ok);
        el.querySelector('.badge-icon').textContent = ok ? '✓' : '✗';
        if (text) el.querySelector('.badge-text').textContent = text;
    };
    set('prop1', true);
    set('prop2', true);
    set('prop3', K.absorb);
    const d = K.distBad;
    set('prop4', !d, d ? `分配律 ✗：${d[0]}∧(${d[1]}∨${d[2]}) ≠ (${d[0]}∧${d[1]})∨(${d[0]}∧${d[2]})` : '分配律 a∧(b∨c)=(a∧b)∨(a∧c)');
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
        node.setAttribute('role', 'button');
        node.setAttribute('tabindex', '0');
        node.setAttribute('aria-label', '元素 ' + elem);
        node.addEventListener('click', () => selectElement(String(elem), node));
        node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectElement(String(elem), node); } });
        container.appendChild(node);
    });
    visualizationArea.innerHTML = '';
    visualizationArea.appendChild(container);
    score.textContent = coverCount(lattice);
    updateLawBadges();
}
// Calculate node positions for Hasse diagram
function calculateNodePositions(lattice) {
    const positions = [];
    const levels = lattice.levels;
    const levelCount = Object.keys(levels).length;
    const containerWidth = Math.min(visualizationArea.clientWidth || 600, 720);
    const containerHeight = 440; // 与 .hasse-diagram 固定高度一致，避免首屏量到 0 高度而溢出
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
// ── Sublattice state ──────────────────────────────────────────────────────────
let sublatticeSelected = new Set();
function runSublatticeVisualization() {
    if (!latticeData) {
        operationResult.querySelector('.result-value').textContent = '请先构建格结构';
        return;
    }
    // Re-draw the Hasse diagram with sublattice toggle support
    buildLattice();
    // Inject "检查子格" button into operationResult area
    operationResult.querySelector('.result-value').innerHTML =
        '点击节点选择元素，然后 <button type="button" id="checkSublatticeBtn" class="inline-btn">检查子格</button>';
    document.getElementById('checkSublatticeBtn').addEventListener('click', checkSublattice);
    vizSubtitle.textContent = '点击节点选择子集，检查是否构成子格';
}
function checkSublattice() {
    const sel = Array.from(sublatticeSelected);
    if (sel.length < 2) {
        operationResult.querySelector('.result-value').textContent = '请至少选择 2 个元素';
        return;
    }
    const lattice = latticeData;
    let isSublattice = true;
    const failures = [];
    for (let i = 0; i < sel.length; i++) {
        for (let j = i + 1; j < sel.length; j++) {
            const a = toElem(sel[i]), b = toElem(sel[j]);
            const joinResult = String(lattice.join(a, b));
            const meetResult = String(lattice.meet(a, b));
            if (!sublatticeSelected.has(joinResult)) {
                isSublattice = false;
                failures.push(`${a} ∨ ${b} = ${joinResult} ∉ 子集`);
            }
            if (!sublatticeSelected.has(meetResult)) {
                isSublattice = false;
                failures.push(`${a} ∧ ${b} = ${meetResult} ∉ 子集`);
            }
        }
    }
    // Color nodes
    document.querySelectorAll('.lattice-node').forEach(node => {
        const el = node.dataset.element;
        if (sublatticeSelected.has(el)) {
            node.style.outline = isSublattice ? '3px solid #2f7d57' : '3px dashed #c0392b';
            node.style.background = isSublattice ? 'rgba(47,125,87,0.18)' : 'rgba(192,57,43,0.12)';
        }
    });
    if (isSublattice) {
        operationResult.querySelector('.result-value').textContent =
            `✓ {${sel.join(', ')}} 是子格！对并和交封闭。`;
    } else {
        operationResult.querySelector('.result-value').textContent =
            `✗ 不是子格：${failures[0]}`;
    }
}
// ── Homomorphism visualization ────────────────────────────────────────────────
function runHomomorphismVisualization() {
    if (!latticeData) {
        operationResult.querySelector('.result-value').textContent = '请先构建格结构';
        return;
    }
    // φ: D₁₂ → D₆ defined by φ(x) = gcd(x, 6)
    const domainLattice = lattices['divisors12'];
    const codomainElems = [1, 2, 3, 6];
    const phi = x => gcd(x, 6);
    vizTitle.textContent = '格同态 φ: D₁₂ → D₆';
    vizSubtitle.textContent = 'φ(x) = gcd(x, 6)，保持 ∨ 和 ∧ 运算';
    const containerW = visualizationArea.clientWidth || 620;
    const containerH = 440;
    const halfW = Math.min(360, containerW / 2 - 10);
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;gap:10px;height:100%;align-items:center;';
    // Build left panel (D₁₂)
    const leftDiv = buildMiniHasse(domainLattice, halfW, containerH - 60, '#d63b1d', 'D₁₂（定义域）');
    // Build right panel (D₆)
    const d6 = {
        name: 'D₆', elements: codomainElems,
        partialOrder: (a, b) => b % a === 0,
        join: (a, b) => lcm(a, b), meet: (a, b) => gcd(a, b),
        levels: { 0: [1], 1: [2, 3], 2: [6] }
    };
    const rightDiv = buildMiniHasse(d6, halfW, containerH - 60, '#c58a1f', 'D₆（值域）');
    wrapper.appendChild(leftDiv);
    wrapper.appendChild(rightDiv);
    visualizationArea.innerHTML = '';
    visualizationArea.appendChild(wrapper);
    // Animate mapping arrows with a small SVG overlay (after DOM renders)
    setTimeout(() => {
        domainLattice.elements.forEach(x => {
            const srcNode = leftDiv.querySelector(`[data-element="${x}"]`);
            const tgtElem = phi(x);
            const tgtNode = rightDiv.querySelector(`[data-element="${tgtElem}"]`);
            if (srcNode && tgtNode) {
                // Pulse animation: temporarily highlight src and target
                srcNode.title = `φ(${x}) = ${tgtElem}`;
                srcNode.textContent = `${x}→${tgtElem}`;
                srcNode.style.fontSize = '0.68rem';
            }
        });
    }, 100);
    operationResult.querySelector('.result-value').textContent =
        '左图节点标出 x→φ(x)；φ(x)=x∧6 保持 ∨ 与 ∧ ✓（D₁₂ 是分配格）';
}
function buildMiniHasse(lattice, w, h, color, label) {
    const div = document.createElement('div');
    div.style.cssText = `position:relative;width:${w}px;height:${h}px;flex-shrink:0;`;
    const title = document.createElement('div');
    title.textContent = label;
    title.style.cssText = `text-align:center;font-size:0.8rem;color:${color};font-weight:bold;margin-bottom:4px;`;
    div.appendChild(title);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `position:absolute;top:20px;left:0;width:100%;height:${h-20}px;pointer-events:none;`;
    div.appendChild(svg);
    const positions = {};
    const levels = lattice.levels;
    const levelKeys = Object.keys(levels).map(Number).sort((a, b) => a - b);
    const levelCount2 = levelKeys.length;
    const vSpacing = (h - 60) / Math.max(levelCount2 - 1, 1);
    lattice.elements.forEach(elem => {
        let level = 0;
        for (const [lvl, elems] of Object.entries(levels)) {
            if (elems.includes(elem)) { level = parseInt(lvl); break; }
        }
        const levelElems = levels[level];
        const idx = levelElems.indexOf(elem);
        const size = levelElems.length;
        const x = (w / (size + 1)) * (idx + 1);
        const y = h - 30 - level * vSpacing;
        positions[elem] = { x, y };
    });
    // Draw edges
    lattice.elements.forEach(lower => {
        lattice.elements.forEach(upper => {
            if (lower === upper) return;
            if (!lattice.partialOrder(lower, upper)) return;
            let covering = true;
            for (const mid of lattice.elements) {
                if (mid === lower || mid === upper) continue;
                if (lattice.partialOrder(lower, mid) && lattice.partialOrder(mid, upper)) {
                    covering = false; break;
                }
            }
            if (covering) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                const lp = positions[lower], up = positions[upper];
                line.setAttribute('x1', lp.x); line.setAttribute('y1', lp.y);
                line.setAttribute('x2', up.x); line.setAttribute('y2', up.y);
                line.setAttribute('stroke', color); line.setAttribute('stroke-width', '2');
                line.setAttribute('opacity', '0.6');
                svg.appendChild(line);
            }
        });
    });
    // Draw nodes
    lattice.elements.forEach(elem => {
        const pos = positions[elem];
        const node = document.createElement('div');
        node.dataset.element = String(elem);
        node.textContent = String(elem);
        node.style.cssText = `position:absolute;width:36px;height:36px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:0.8rem;font-weight:bold;color:#fff;cursor:default;
            background:${color};left:${pos.x - 18}px;top:${pos.y - 18}px;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);transition:background .3s;`;
        div.appendChild(node);
    });
    return div;
}
// Select element
function selectElement(elem, node) {
    if (currentMode === 'sublattice') {
        // Toggle sublattice membership
        if (sublatticeSelected.has(String(elem))) {
            sublatticeSelected.delete(String(elem));
            node.style.outline = '';
            node.style.background = '';
        } else {
            sublatticeSelected.add(String(elem));
            node.style.outline = '3px solid #ffb400';
            node.style.background = 'rgba(255,180,0,0.25)';
        }
        return;
    }
    if (currentMode === 'homomorphism') {
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
        if (selectedElements.map(String).includes(elem)) {
            node.classList.add('selected');
        }
    });
}
// Compute operation
function computeOperation(silent) {
    if (selectedElements[0] === null || selectedElements[1] === null) {
        operationResult.querySelector('.result-value').textContent = '请选择两个元素';
        return;
    }
    const a = toElem(selectedElements[0]);
    const b = toElem(selectedElements[1]);
    let result;
    const j = latticeData.join(a, b), m = latticeData.meet(a, b);
    if (currentMode === 'join') {
        result = j;
        operationResult.querySelector('.result-value').textContent = `${a} ∨ ${b} = ${j}（最小上界）；对偶地 ${a} ∧ ${b} = ${m}`;
    } else if (currentMode === 'meet') {
        result = m;
        operationResult.querySelector('.result-value').textContent = `${a} ∧ ${b} = ${m}（最大下界）；对偶地 ${a} ∨ ${b} = ${j}`;
    } else {
        return;
    }
    // Highlight result node
    highlightResult(result);
    if (!silent) { opCount++; operationCount.textContent = opCount; }
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
    currentLattice = 'divisors12';
    latticeType.value = 'divisors12';
    sublatticeSelected.clear();
    opCount = 0;
    operationCount.textContent = opCount;
    init();
}
// Event Listeners
latticeType.addEventListener('change', (e) => {
    currentLattice = e.target.value;
    sublatticeSelected.clear();
    setActiveMode(currentMode === 'homomorphism' ? 'join' : currentMode);
    buildLattice();
    if (currentMode === 'sublattice') runSublatticeVisualization();
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
    sublatticeSelected.clear();
    setActiveMode('sublattice');
    updateIdeology('sublattice');
    runSublatticeVisualization();
});
homomorphismBtn.addEventListener('click', () => {
    setActiveMode('homomorphism');
    updateIdeology('homomorphism');
    runHomomorphismVisualization();
});
computeBtn.addEventListener('click', () => computeOperation(false));
buildLatticeBtn.addEventListener('click', () => { setActiveMode(currentMode === 'homomorphism' ? 'join' : currentMode); buildLattice(); });
resetBtn.addEventListener('click', reset);
// Initialize
init();
