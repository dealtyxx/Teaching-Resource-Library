/**
 * Hall of Lattices - Lattice Classification System
 * 格之殿堂 - 格的分类体系
 */

// DOM Elements
const typeCards = document.querySelectorAll('.type-card');
const exampleSelect = document.getElementById('exampleSelect');
const verifyAllBtn = document.getElementById('verifyAllBtn');
const showLatticeBtn = document.getElementById('showLatticeBtn');
const resetBtn = document.getElementById('resetBtn');
const visualizationArea = document.getElementById('visualizationArea');
const vizTitle = document.getElementById('vizTitle');
const vizSubtitle = document.getElementById('vizSubtitle');
const typeInfo = document.getElementById('typeInfo');
const ideologyCard = document.getElementById('ideologyCard');
const satisfiedProps = document.getElementById('satisfiedProps');
const latticeRank = document.getElementById('latticeRank');

// Verify items
const verifyDist = document.getElementById('verify-dist');
const verifyComplement = document.getElementById('verify-complement');
const verifyComplete = document.getElementById('verify-complete');
const verifyBounded = document.getElementById('verify-bounded');
const verifyChain = document.getElementById('verify-chain');
const verifyModular = document.getElementById('verify-modular');

// State
let currentType = 'distributive';
let currentExample = 'divisors12';
let currentLattice = null;

// Ideological messages
const ideologicalMessages = {
    distributive: {
        title: "分配正义",
        message: "分配格体现资源合理分配，确保公平公正，展现社会主义分配原则",
        icon: "⊕"
    },
    boolean: {
        title: "对立统一",
        message: "布尔格展现矛盾的对立与统一，每个元素都有补元，体现辩证法思想",
        icon: "⊤⊥"
    },
    complete: {
        title: "全面覆盖",
        message: "完全格中任意集合都有上下确界，体现政策全覆盖、不留死角的理念",
        icon: "∪"
    },
    bounded: {
        title: "上下有序",
        message: "有界格有最高领导⊤和群众基础⊥，体现上下一心的组织结构",
        icon: "⊤...⊥"
    },
    chain: {
        title: "线性层级",
        message: "链格中元素全序排列，体现清晰明确的层级晋升通道",
        icon: "↕"
    },
    modular: {
        title: "模块协作",
        message: "模格体现部门间的协调配合，模块化管理、统筹兼顾",
        icon: "⊞"
    }
};

// Type descriptions
const typeDescriptions = {
    distributive: {
        full: "分配格满足分配律：a ∧ (b ∨ c) = (a ∧ b) ∨ (a ∧ c)",
        properties: ["分配律", "模律", "有界性(通常)"],
        examples: ["约数格", "幂集格", "线性序"]
    },
    boolean: {
        full: "布尔格是有补分配格，每个元素都有唯一补元",
        properties: ["分配律", "补元存在", "有界性"],
        examples: ["幂集格 2ⁿ", "布尔代数"]
    },
    complete: {
        full: "完全格中任意子集都有上确界和下确界",
        properties: ["完全性", "有界性"],
        examples: ["[0,1] 区间", "幂集格", "拓扑格"]
    },
    bounded: {
        full: "有界格有最大元⊤和最小元⊥",
        properties: ["有界性"],
        examples: ["所有有限格", "单位区间"]
    },
    chain: {
        full: "链格是全序集，任意两元素可比",
        properties: ["全序性", "分配律", "模律"],
        examples: ["自然数", "实数", "有限链"]
    },
    modular: {
        full: "模格满足模律：a ≤ c 时 a ∨ (b ∧ c) = (a ∨ b) ∧ c",
        properties: ["模律"],
        examples: ["子空间格", "子群格"]
    }
};

// Example lattices
const exampleLattices = {
    divisors12: {
        name: "约数格 D₁₂",
        elements: [1, 2, 3, 4, 6, 12],
        partialOrder: (a, b) => b % a === 0,
        join: (a, b) => lcm(a, b),
        meet: (a, b) => gcd(a, b),
        top: 12,
        bottom: 1,
        type: "distributive"
    },
    powerset3: {
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
            const idx1 = this.elements.indexOf(a);
            const idx2 = this.elements.indexOf(b);
            const setA = this.elementSets[idx1];
            const setB = this.elementSets[idx2];
            return isSubset(setA, setB);
        },
        join: function (a, b) {
            const idx1 = this.elements.indexOf(a);
            const idx2 = this.elements.indexOf(b);
            const setA = this.elementSets[idx1];
            const setB = this.elementSets[idx2];
            const union = new Set([...setA, ...setB]);
            const idx = this.elementSets.findIndex(s => setsEqual(s, union));
            return this.elements[idx];
        },
        meet: function (a, b) {
            const idx1 = this.elements.indexOf(a);
            const idx2 = this.elements.indexOf(b);
            const setA = this.elementSets[idx1];
            const setB = this.elementSets[idx2];
            const intersection = new Set([...setA].filter(x => setB.has(x)));
            const idx = this.elementSets.findIndex(s => setsEqual(s, intersection));
            return this.elements[idx];
        },
        top: '{a,b,c}',
        bottom: '∅',
        type: "boolean"
    },
    chain5: {
        name: "5元链",
        elements: [0, 1, 2, 3, 4],
        partialOrder: (a, b) => a <= b,
        join: (a, b) => Math.max(a, b),
        meet: (a, b) => Math.min(a, b),
        top: 4,
        bottom: 0,
        type: "chain"
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
        top: '1',
        bottom: '0',
        type: "modular"
    },
    pentagon: {
        name: "五边形格 N₅",
        // N5 正确结构: 0 < a < b < 1, 0 < c < 1, a 与 c 不可比，b 与 c 不可比
        // 违反模律: a ≤ b, 但 a∨(c∧b) = a∨0 = a ≠ c = c∧(a∨b) = c∧b ... 验证 a≤b: a∨(c∧b)=a≠c=(a∨c)∧b
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
            if ((a === 'a' && b === 'b') || (a === 'b' && b === 'a')) return 'b';
            return '1';
        },
        meet: function (a, b) {
            if (a === b) return a;
            if (a === '1') return b;
            if (b === '1') return a;
            if (a === '0' || b === '0') return '0';
            if ((a === 'a' && b === 'b') || (a === 'b' && b === 'a')) return 'a';
            return '0';
        },
        top: '1',
        bottom: '0',
        type: "non-modular"
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

// Property verification functions
function checkDistributivity(lattice) {
    const elements = lattice.elements;
    const n = Math.min(elements.length, 6);

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                const a = elements[i];
                const b = elements[j];
                const c = elements[k];

                const lhs = typeof lattice.meet === 'function' ?
                    lattice.meet(a, lattice.join(b, c)) :
                    Math.min(a, Math.max(b, c));

                const rhs = typeof lattice.join === 'function' ?
                    lattice.join(lattice.meet(a, b), lattice.meet(a, c)) :
                    Math.max(Math.min(a, b), Math.min(a, c));

                if (lhs !== rhs) return false;
            }
        }
    }
    return true;
}

function checkComplementation(lattice) {
    if (!lattice.top || !lattice.bottom) return false;

    for (const elem of lattice.elements) {
        let hasComplement = false;
        for (const candidate of lattice.elements) {
            const joinResult = typeof lattice.join === 'function' ?
                lattice.join(elem, candidate) : Math.max(elem, candidate);
            const meetResult = typeof lattice.meet === 'function' ?
                lattice.meet(elem, candidate) : Math.min(elem, candidate);

            if (joinResult === lattice.top && meetResult === lattice.bottom) {
                hasComplement = true;
                break;
            }
        }
        if (!hasComplement) return false;
    }
    return true;
}

function checkCompleteness(lattice) {
    // 所有有限格都是完备格（任意子集有上确界和下确界）
    // 完备格的完备性对有限格自动成立
    return true;
}

function checkBoundedness(lattice) {
    return lattice.top !== undefined && lattice.bottom !== undefined;
}

function checkChain(lattice) {
    const elements = lattice.elements;
    for (let i = 0; i < elements.length; i++) {
        for (let j = 0; j < elements.length; j++) {
            if (i === j) continue;
            const a = elements[i];
            const b = elements[j];

            const aLEb = typeof lattice.partialOrder === 'function' ?
                lattice.partialOrder(a, b) : a <= b;
            const bLEa = typeof lattice.partialOrder === 'function' ?
                lattice.partialOrder(b, a) : b <= a;

            if (!aLEb && !bLEa) return false;
        }
    }
    return true;
}

function checkModularity(lattice) {
    const elements = lattice.elements;
    const n = Math.min(elements.length, 6);

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                const a = elements[i];
                const b = elements[j];
                const c = elements[k];

                const aLEc = typeof lattice.partialOrder === 'function' ?
                    lattice.partialOrder(a, c) : a <= c;

                if (aLEc) {
                    const lhs = typeof lattice.join === 'function' ?
                        lattice.join(a, lattice.meet(b, c)) :
                        Math.max(a, Math.min(b, c));

                    const rhs = typeof lattice.meet === 'function' ?
                        lattice.meet(lattice.join(a, b), c) :
                        Math.min(Math.max(a, b), c);

                    if (lhs !== rhs) return false;
                }
            }
        }
    }
    return true;
}

// Update ideology card
function updateIdeology(type) {
    const msg = ideologicalMessages[type];
    if (msg) {
        ideologyCard.querySelector('.card-icon').textContent = msg.icon;
        ideologyCard.querySelector('.card-title').textContent = msg.title;
        ideologyCard.querySelector('.card-content').textContent = msg.message;
    }
}

// Update type info panel
function updateTypeInfo(type) {
    const desc = typeDescriptions[type];
    if (!desc) return;

    let html = `<p class="info-description">${desc.full}</p>`;
    html += `<div style="margin-top: 0.8rem;"><strong style="font-size: 0.75rem; color: var(--text-secondary);">关键性质:</strong></div>`;
    desc.properties.forEach(prop => {
        html += `<div class="info-property"><span class="prop-badge">${prop}</span></div>`;
    });
    html += `<div style="margin-top: 0.8rem;"><strong style="font-size: 0.75rem; color: var(--text-secondary);">典型示例:</strong></div>`;
    html += `<p class="info-description" style="font-size: 0.75rem;">${desc.examples.join(', ')}</p>`;

    typeInfo.innerHTML = html;
}

// Verify all properties
function verifyAllProperties() {
    if (!currentLattice) {
        alert('请先选择并显示一个格！');
        return;
    }

    const lattice = exampleLattices[currentExample];
    let count = 0;

    const isDist = checkDistributivity(lattice);
    updateVerifyItem(verifyDist, isDist, isDist ? '✓' : '✗');
    if (isDist) count++;

    const hasComp = checkComplementation(lattice);
    updateVerifyItem(verifyComplement, hasComp, hasComp ? '✓' : '✗');
    if (hasComp) count++;

    const isComplete = checkCompleteness(lattice);
    updateVerifyItem(verifyComplete, isComplete, isComplete ? '✓' : '✗');
    if (isComplete) count++;

    const isBounded = checkBoundedness(lattice);
    updateVerifyItem(verifyBounded, isBounded, isBounded ? '✓' : '✗');
    if (isBounded) count++;

    const isChain = checkChain(lattice);
    updateVerifyItem(verifyChain, isChain, isChain ? '✓' : '✗');
    if (isChain) count++;

    const isModular = checkModularity(lattice);
    updateVerifyItem(verifyModular, isModular, isModular ? '✓' : '✗');
    if (isModular) count++;

    satisfiedProps.textContent = `${count}/6`;

    let rank = '基础格';
    if (hasComp && isDist) rank = '布尔格';
    else if (isDist) rank = '分配格';
    else if (isModular) rank = '模格';
    else if (isChain) rank = '链格';

    latticeRank.textContent = rank;
}

function updateVerifyItem(item, satisfied, icon) {
    item.classList.remove('satisfied', 'not-satisfied');
    if (satisfied) {
        item.classList.add('satisfied');
    } else {
        item.classList.add('not-satisfied');
    }
    item.querySelector('.verify-icon').textContent = icon;
}

// Show lattice structure
function showLatticeStructure() {
    const lattice = exampleLattices[currentExample];
    currentLattice = lattice;

    vizTitle.textContent = `${lattice.name} - ${typeDescriptions[currentType]?.properties[0] || '格结构'}`;
    vizSubtitle.textContent = `${lattice.elements.length} 个元素`;

    const container = document.createElement('div');
    container.className = 'lattice-display';

    const title = document.createElement('div');
    title.className = 'lattice-title';
    title.textContent = lattice.name;

    const elements = document.createElement('div');
    elements.className = 'lattice-elements';
    elements.textContent = `元素集: { ${lattice.elements.join(', ')} }`;

    const bounds = document.createElement('div');
    bounds.className = 'lattice-bounds';
    bounds.innerHTML = `<strong>顶元素 ⊤:</strong> ${lattice.top}<br><strong>底元素 ⊥:</strong> ${lattice.bottom}`;

    container.appendChild(title);
    container.appendChild(elements);
    container.appendChild(bounds);

    visualizationArea.innerHTML = '';
    visualizationArea.appendChild(container);
}

// Helper: Show step hint
function showStepHint(step) {
    const hints = {
        welcome: '👋 欢迎！请点击上方格类型卡片开始探索',
        typeSelected: '✓ 已选择格类型！请从下方下拉菜单选择示例格',
        exampleSelected: '✓ 正在加载格结构...',
        structureShown: '✓ 格结构已显示！点击"验证全部性质"查看详细分析',
        verified: '✓ 验证完成！可以选择其他格类型继续探索'
    };

    vizSubtitle.textContent = hints[step] || '';
    vizSubtitle.style.color = 'var(--accent-gold)';
    vizSubtitle.style.fontWeight = '600';
    vizSubtitle.style.fontSize = '0.95rem';
}

// Helper: Pulse element
function pulseElement(element, duration = 1500) {
    element.style.transition = 'all 0.3s ease';
    element.style.transform = 'scale(1.05)';
    element.style.boxShadow = '0 0 20px rgba(255, 180, 0, 0.5)';

    setTimeout(() => {
        element.style.transform = '';
        element.style.boxShadow = '';
    }, duration);
}

// Reset function
function resetVisualization() {
    visualizationArea.innerHTML = `
        <div class="welcome-state">
            <div class="hall-animation">
                <svg viewBox="0 0 300 200" class="hall-svg">
                    <defs>
                        <linearGradient id="pillarsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffb400;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#d63b1d;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect x="40" y="60" width="20" height="120" fill="url(#pillarsGrad)" class="pillar" />
                    <rect x="90" y="60" width="20" height="120" fill="url(#pillarsGrad)" class="pillar" style="animation-delay: 0.2s" />
                    <rect x="140" y="60" width="20" height="120" fill="url(#pillarsGrad)" class="pillar" style="animation-delay: 0.4s" />
                    <rect x="190" y="60" width="20" height="120" fill="url(#pillarsGrad)" class="pillar" style="animation-delay: 0.6s" />
                    <rect x="240" y="60" width="20" height="120" fill="url(#pillarsGrad)" class="pillar" style="animation-delay: 0.8s" />
                    <polygon points="20,60 280,60 260,30 40,30" fill="#8b0000" opacity="0.8" />
                    <rect x="20" y="180" width="260" height="10" fill="#8b0000" />
                </svg>
            </div>
            <p class="welcome-text">步入格之殿堂，探索格的分类奥秘</p>
        </div>
    `;

    vizTitle.textContent = '格的分类体系可视化';
    showStepHint('welcome');

    document.querySelectorAll('.verify-item').forEach(item => {
        item.classList.remove('satisfied', 'not-satisfied');
        item.querySelector('.verify-icon').textContent = '?';
    });

    satisfiedProps.textContent = '0/6';
    latticeRank.textContent = '—';
    currentLattice = null;
}

// Event Listeners
typeCards.forEach(card => {
    card.addEventListener('click', () => {
        typeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        currentType = card.dataset.type;
        updateIdeology(currentType);
        updateTypeInfo(currentType);

        showStepHint('typeSelected');
        pulseElement(exampleSelect, 2000);

        document.querySelectorAll('.verify-item').forEach(item => {
            item.classList.remove('satisfied', 'not-satisfied');
            item.querySelector('.verify-icon').textContent = '?';
        });
        satisfiedProps.textContent = '0/6';
        latticeRank.textContent = '—';
    });
});

exampleSelect.addEventListener('change', (e) => {
    currentExample = e.target.value;

    showStepHint('exampleSelected');

    setTimeout(() => {
        showLatticeStructure();

        setTimeout(() => {
            showStepHint('structureShown');
            pulseElement(verifyAllBtn, 2000);
        }, 300);
    }, 200);
});

verifyAllBtn.addEventListener('click', () => {
    verifyAllProperties();

    setTimeout(() => {
        showStepHint('verified');
    }, 500);
});

showLatticeBtn.addEventListener('click', showLatticeStructure);
resetBtn.addEventListener('click', resetVisualization);

// Initialize
updateIdeology(currentType);
updateTypeInfo(currentType);

setTimeout(() => {
    showStepHint('welcome');

    const gallery = document.querySelector('.type-gallery');
    if (gallery) {
        pulseElement(gallery, 2500);
    }
}, 500);
