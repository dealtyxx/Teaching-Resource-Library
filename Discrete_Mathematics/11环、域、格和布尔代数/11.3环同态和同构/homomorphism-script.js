/**
 * Bridge of Unity - Ring Homomorphism & Isomorphism Visualizer
 * 连心桥 - 环同态与同构可视化
 */

// DOM Elements
const mappingType = document.getElementById('mappingType');
const sourceRing = document.getElementById('sourceRing');
const targetRing = document.getElementById('targetRing');
const mappingRule = document.getElementById('mappingRule');
const verifyBtn = document.getElementById('verifyBtn');
const buildBridgeBtn = document.getElementById('buildBridgeBtn');
const resetBtn = document.getElementById('resetBtn');
const visualizationArea = document.getElementById('visualizationArea');
const vizTitle = document.getElementById('vizTitle');
const vizSubtitle = document.getElementById('vizSubtitle');
const infoContent = document.getElementById('infoContent');
const ideologyCard = document.getElementById('ideologyCard');
const mappedCount = document.getElementById('mappedCount');
const score = document.getElementById('score');

// Check items
const checkAdd = document.getElementById('checkAdd');
const checkMul = document.getElementById('checkMul');
const checkOne = document.getElementById('checkOne');
const checkBijective = document.getElementById('checkBijective');

// State
let currentMapping = 'homomorphism';
let currentSourceRing = 'Z6';
let currentTargetRing = 'Z6';
let currentRule = 'identity';
let mappingData = new Map();
let selectedElements = [];
let gameScore = 0;
let totalMapped = 0;

// Ideological messages
const ideologicalMessages = {
    homomorphism: {
        title: "环同态 - 连通共建",
        message: "同态映射如连心桥，保持结构、传递精神，体现不同组织间的协作共建",
        icon: "⟷"
    },
    isomorphism: {
        title: "环同构 - 等价共融",
        message: "同构映射建立完全对应，展现本质相同、和谐统一的团结境界",
        icon: "≅"
    },
    kernel: {
        title: "核 - 团结核心",
        message: "核Ker(φ)是映射到零的元素集，如组织的核心团队，是稳定的基石",
        icon: "⊚"
    },
    image: {
        title: "像 - 影响范围",
        message: "像Im(φ)展现映射的影响力，体现一个集体对另一集体的覆盖与贡献",
        icon: "⊃"
    }
};

// Ring definitions
const rings = {
    Z: {
        name: "整数环 ℤ",
        elements: Array.from({ length: 10 }, (_, i) => i - 5), // -5 to 4
        modulus: null
    },
    Z6: {
        name: "模6环 ℤ/6ℤ",
        elements: [0, 1, 2, 3, 4, 5],
        modulus: 6
    },
    Z12: {
        name: "模12环 ℤ/12ℤ",
        elements: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        modulus: 12
    },
    R: {
        name: "实数环 ℝ",
        elements: [0, 0.5, 1, 1.5, 2, 2.5, 3, -1, -0.5],
        modulus: null
    }
};

// Mapping rules
const mappingRules = {
    identity: {
        name: "恒等映射",
        func: (x, srcMod, tgtMod) => {
            if (tgtMod) return x % tgtMod;
            return x;
        }
    },
    double: {
        name: "倍映射",
        func: (x, srcMod, tgtMod) => {
            const result = 2 * x;
            if (tgtMod) return result >= 0 ? result % tgtMod : ((result % tgtMod) + tgtMod) % tgtMod;
            return result;
        }
    },
    mod: {
        name: "模映射",
        func: (x, srcMod, tgtMod) => {
            if (tgtMod) return x % tgtMod;
            return x;
        }
    },
    zero: {
        name: "零映射",
        func: (x, srcMod, tgtMod) => 0
    }
};

// Initialize
function init() {
    updateIdeology(currentMapping);
    updateMappingRule();
}

// Update ideology card
function updateIdeology(key) {
    const msg = ideologicalMessages[key];
    if (msg) {
        ideologyCard.querySelector('.card-icon').textContent = msg.icon;
        ideologyCard.querySelector('.card-title').textContent = msg.title;
        ideologyCard.querySelector('.card-content').textContent = msg.message;

        // Add flash animation
        ideologyCard.classList.remove('active');
        setTimeout(() => ideologyCard.classList.add('active'), 10);
    }
}

// Update mapping rule based on rings
function updateMappingRule() {
    const src = rings[currentSourceRing];
    const tgt = rings[currentTargetRing];

    // Auto-select appropriate rule
    if (src.modulus && tgt.modulus && src.modulus > tgt.modulus) {
        mappingRule.value = 'mod';
        currentRule = 'mod';
    } else if (currentSourceRing === currentTargetRing) {
        mappingRule.value = 'identity';
        currentRule = 'identity';
    }
}

// Build the mapping visualization
function buildMapping() {
    const src = rings[currentSourceRing];
    const tgt = rings[currentTargetRing];
    const rule = mappingRules[currentRule];

    vizTitle.textContent = `${src.name} → ${tgt.name}`;
    vizSubtitle.textContent = `${rule.name}: ${getMappingFormula()}`;

    // Build mapping data
    mappingData.clear();
    src.elements.forEach(elem => {
        const mapped = rule.func(elem, src.modulus, tgt.modulus);
        mappingData.set(elem, mapped);
    });

    // Create visualization
    const container = document.createElement('div');
    container.className = 'mapping-container';

    // Source ring
    const sourceSet = createRingSet(src, 'source', true);

    // Target ring
    const targetSet = createRingSet(tgt, 'target', false);

    // SVG for arrows
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'arrow-svg');
    svg.innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#d63b1d" opacity="0.6"/>
            </marker>
        </defs>
    `;

    container.appendChild(svg);
    container.appendChild(sourceSet);
    container.appendChild(targetSet);

    visualizationArea.innerHTML = '';
    visualizationArea.appendChild(container);

    // Draw arrows after DOM update
    setTimeout(() => drawMappingArrows(svg), 100);

    // Update info panel
    updateInfoPanel();

    // Update stats
    totalMapped = 0;
    mappedCount.textContent = totalMapped;
}

// Create ring element set
function createRingSet(ring, type, isSource) {
    const set = document.createElement('div');
    set.className = 'ring-set';

    const title = document.createElement('div');
    title.className = 'ring-title';
    title.textContent = ring.name;

    const elements = document.createElement('div');
    elements.className = `ring-elements ${type}`;
    elements.id = `${type}-elements`;

    ring.elements.forEach((elem, idx) => {
        const item = document.createElement('div');
        item.className = `element-item ${type}`;
        item.textContent = elem;
        item.dataset.value = elem;
        item.dataset.index = idx;

        // Highlight based on mapping type
        if (currentMapping === 'kernel' && isSource) {
            const mapped = mappingData.get(elem);
            if (mapped === 0) {
                item.classList.add('kernel');
            }
        } else if (currentMapping === 'image' && !isSource) {
            const values = Array.from(mappingData.values());
            if (values.includes(elem)) {
                item.classList.add('image');
            }
        }

        // Click handler
        if (isSource) {
            item.addEventListener('click', () => selectSourceElement(elem, item));
        }

        elements.appendChild(item);
    });

    set.appendChild(title);
    set.appendChild(elements);

    return set;
}

// Draw mapping arrows
function drawMappingArrows(svg) {
    const sourceElems = document.querySelectorAll('.element-item.source');
    const targetElems = document.querySelectorAll('.element-item.target');

    let arrowCount = 0;
    const maxArrows = currentMapping === 'homomorphism' || currentMapping === 'isomorphism' ?
        Math.min(5, sourceElems.length) : sourceElems.length;

    sourceElems.forEach((srcElem, idx) => {
        if (arrowCount >= maxArrows) return;

        const srcValue = parseFloat(srcElem.dataset.value);
        const mappedValue = mappingData.get(srcValue);

        // Find target element
        const tgtElem = Array.from(targetElems).find(el =>
            parseFloat(el.dataset.value) === mappedValue
        );

        if (tgtElem) {
            const srcRect = srcElem.getBoundingClientRect();
            const tgtRect = tgtElem.getBoundingClientRect();
            const svgRect = svg.getBoundingClientRect();

            const x1 = srcRect.right - svgRect.left;
            const y1 = srcRect.top + srcRect.height / 2 - svgRect.top;
            const x2 = tgtRect.left - svgRect.left;
            const y2 = tgtRect.top + tgtRect.height / 2 - svgRect.top;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const controlX = (x1 + x2) / 2;
            const controlY = (y1 + y2) / 2 - 30;

            path.setAttribute('class', 'mapping-arrow');
            path.setAttribute('d', `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`);
            path.setAttribute('stroke-dasharray', '5,5');

            svg.appendChild(path);
            arrowCount++;
        }
    });
}

// Select source element
function selectSourceElement(value, elem) {
    const mapped = mappingData.get(value);

    // Highlight
    document.querySelectorAll('.element-item.selected').forEach(el => {
        el.classList.remove('selected');
    });
    elem.classList.add('selected');

    // Find and highlight target
    const targetElems = document.querySelectorAll('.element-item.target');
    targetElems.forEach(tel => {
        tel.classList.remove('selected');
        if (parseFloat(tel.dataset.value) === mapped) {
            tel.classList.add('selected');
        }
    });

    // Update stats
    totalMapped++;
    mappedCount.textContent = totalMapped;

    // Show mapping in info
    infoContent.innerHTML = `
        <div class="info-formula">φ(${value}) = ${mapped}</div>
        <p class="info-text">元素 ${value} 映射到 ${mapped}</p>
    `;
}

// Update info panel
function updateInfoPanel() {
    const src = rings[currentSourceRing];
    const tgt = rings[currentTargetRing];

    let info = `<p class="info-text"><strong>映射:</strong> ${src.name} → ${tgt.name}</p>`;
    info += `<div class="info-formula">${getMappingFormula()}</div>`;

    if (currentMapping === 'kernel') {
        const kernelElems = Array.from(mappingData.entries())
            .filter(([k, v]) => v === 0)
            .map(([k, v]) => k);
        info += `<p class="info-text"><strong>核 Ker(φ):</strong> {${kernelElems.join(', ')}}</p>`;
    } else if (currentMapping === 'image') {
        const imageElems = Array.from(new Set(mappingData.values())).sort((a, b) => a - b);
        info += `<p class="info-text"><strong>像 Im(φ):</strong> {${imageElems.join(', ')}}</p>`;
    }

    infoContent.innerHTML = info;
}

// Get mapping formula
function getMappingFormula() {
    switch (currentRule) {
        case 'identity':
            return 'φ(x) = x';
        case 'double':
            return 'φ(x) = 2x';
        case 'mod':
            const tgt = rings[currentTargetRing];
            return `φ(x) = x mod ${tgt.modulus || 'n'}`;
        case 'zero':
            return 'φ(x) = 0';
        default:
            return 'φ(x)';
    }
}

// Verify properties
function verifyProperties() {
    const src = rings[currentSourceRing];
    const tgt = rings[currentTargetRing];
    const rule = mappingRules[currentRule];

    // Test addition preservation
    const a = src.elements[1] || 1;
    const b = src.elements[2] || 2;

    const φa = rule.func(a, src.modulus, tgt.modulus);
    const φb = rule.func(b, src.modulus, tgt.modulus);

    const lhs = add(φa, φb, tgt.modulus); // φ(a) + φ(b)
    const rhs = rule.func(add(a, b, src.modulus), src.modulus, tgt.modulus); // φ(a+b)

    const addPreserved = Math.abs(lhs - rhs) < 0.001;
    updateCheckItem(checkAdd, addPreserved);

    // Test multiplication preservation
    const lhsMul = mul(φa, φb, tgt.modulus); // φ(a) * φ(b)
    const rhsMul = rule.func(mul(a, b, src.modulus), src.modulus, tgt.modulus); // φ(a*b)

    const mulPreserved = Math.abs(lhsMul - rhsMul) < 0.001;
    updateCheckItem(checkMul, mulPreserved);

    // Test identity preservation
    const φ1 = rule.func(1, src.modulus, tgt.modulus);
    const onePreserved = Math.abs(φ1 - 1) < 0.001 || currentRule === 'zero';
    updateCheckItem(checkOne, onePreserved);

    // Test bijectivity (for isomorphism)
    const imageSize = new Set(mappingData.values()).size;
    const isBijective = imageSize === tgt.elements.length &&
        src.elements.length === tgt.elements.length;
    updateCheckItem(checkBijective, isBijective);

    // Update score
    const validCount = [addPreserved, mulPreserved, onePreserved, isBijective].filter(Boolean).length;
    gameScore += validCount * 10;
    score.textContent = gameScore;

    // Update info
    let resultText = '<p class="info-text"><strong>验证结果:</strong></p>';
    resultText += `<p class="info-text">✓ 加法保持: ${addPreserved ? '是' : '否'}</p>`;
    resultText += `<p class="info-text">✓ 乘法保持: ${mulPreserved ? '是' : '否'}</p>`;
    resultText += `<p class="info-text">✓ 单位元保持: ${onePreserved ? '是' : '否'}</p>`;
    resultText += `<p class="info-text">✓ 双射性: ${isBijective ? '是' : '否'}</p>`;

    if (addPreserved && mulPreserved) {
        resultText += `<div class="info-formula">✓ 环同态性质满足!</div>`;
    }
    if (isBijective && addPreserved && mulPreserved) {
        resultText += `<div class="info-formula">★ 环同构!</div>`;
    }

    infoContent.innerHTML += resultText;
}

// Update check item visual
function updateCheckItem(item, isValid) {
    item.classList.remove('valid', 'invalid');
    const icon = item.querySelector('.check-icon');

    if (isValid) {
        item.classList.add('valid');
        icon.textContent = '✓';
    } else {
        item.classList.add('invalid');
        icon.textContent = '✗';
    }
}

// Helper: Addition
function add(a, b, mod) {
    const result = a + b;
    if (mod) {
        return result >= 0 ? result % mod : ((result % mod) + mod) % mod;
    }
    return result;
}

// Helper: Multiplication
function mul(a, b, mod) {
    const result = a * b;
    if (mod) {
        return result >= 0 ? result % mod : ((result % mod) + mod) % mod;
    }
    return result;
}

// Reset
function reset() {
    visualizationArea.innerHTML = `
        <div class="welcome-state">
            <div class="bridge-animation">
                <svg viewBox="0 0 200 100" class="bridge-svg">
                    <defs>
                        <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#d63b1d;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffb400;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <path d="M 20 80 Q 100 20 180 80" stroke="url(#bridgeGrad)" stroke-width="4" fill="none"
                        class="bridge-path" />
                    <circle cx="20" cy="80" r="8" fill="#d63b1d" class="bridge-point" />
                    <circle cx="180" cy="80" r="8" fill="#ffb400" class="bridge-point" />
                    <text x="20" y="95" text-anchor="middle" class="bridge-label">R₁</text>
                    <text x="180" y="95" text-anchor="middle" class="bridge-label">R₂</text>
                </svg>
            </div>
            <p class="welcome-text">构建连心桥，探索环之间的映射关系</p>
        </div>
    `;

    vizTitle.textContent = '环同态映射可视化';
    vizSubtitle.textContent = '点击"构建桥梁"开始探索';

    infoContent.innerHTML = '<p class="info-text">选择映射类型和环结构开始</p>';

    // Reset check items
    [checkAdd, checkMul, checkOne, checkBijective].forEach(item => {
        item.classList.remove('valid', 'invalid');
        item.querySelector('.check-icon').textContent = '?';
    });

    totalMapped = 0;
    mappedCount.textContent = totalMapped;
}

// Event Listeners
mappingType.addEventListener('change', (e) => {
    currentMapping = e.target.value;
    updateIdeology(currentMapping);
    if (mappingData.size > 0) {
        buildMapping(); // Rebuild to show kernel/image highlights
    }
});

sourceRing.addEventListener('change', (e) => {
    currentSourceRing = e.target.value;
    updateMappingRule();
});

targetRing.addEventListener('change', (e) => {
    currentTargetRing = e.target.value;
    updateMappingRule();
});

mappingRule.addEventListener('change', (e) => {
    currentRule = e.target.value;
});

buildBridgeBtn.addEventListener('click', buildMapping);
verifyBtn.addEventListener('click', verifyProperties);
resetBtn.addEventListener('click', reset);

// Initialize
init();
