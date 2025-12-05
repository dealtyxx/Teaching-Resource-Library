/**
 * Red Mathematics - Set Properties Visualizer (All 11 Laws)
 */

// DOM Elements
const lawBtns = document.querySelectorAll('.law-btn');
const elementPool = document.getElementById('elementPool');
const leftPan = document.getElementById('leftPan');
const rightPan = document.getElementById('rightPan');
const leftEq = document.getElementById('leftEq');
const rightEq = document.getElementById('rightEq');
const leftResult = document.getElementById('leftResult');
const rightResult = document.getElementById('rightResult');
const verifyBtn = document.getElementById('verifyBtn');
const resetBtn = document.getElementById('resetBtn');
const scaleBeam = document.querySelector('.scale-beam');
const leftPanEl = document.querySelector('.left-pan');
const rightPanEl = document.querySelector('.right-pan');
const verificationBadge = document.getElementById('verificationBadge');
const szTitle = document.getElementById('szTitle');
const szDesc = document.getElementById('szDesc');

// Data
const ELEMENT_MAP = {
    'worker': '👷',
    'farmer': '🌾',
    'soldier': '🪖'
};

const UNIVERSAL_SET = ['worker', 'farmer', 'soldier']; // U = all elements

const LAWS = {
    'commutative': {
        name: '交换律',
        leftEq: 'A ∪ B',
        rightEq: 'B ∪ A',
        szTitle: '平等互助',
        szDesc: '交换律象征着平等互助。无论先后顺序如何,工农联盟的性质不变,团结的力量不变。这体现了革命队伍中人人平等的原则。'
    },
    'associative': {
        name: '结合律',
        leftEq: '(A ∪ B) ∪ C',
        rightEq: 'A ∪ (B ∪ C)',
        szTitle: '战略一致',
        szDesc: '结合律象征着战略一致性。无论如何划分战斗小组(括号),整体的革命力量(并集)是恒定不变的,体现了统一指挥的重要性。'
    },
    'distributive': {
        name: '分配律',
        leftEq: 'A ∩ (B ∪ C)',
        rightEq: '(A ∩ B) ∪ (A ∩ C)',
        szTitle: '全面领导',
        szDesc: '分配律象征着党的全面领导。集合A(党组织)与B、C(各界群众)的结合,必须落实到每一个具体群体中,实现全覆盖。'
    },
    'demorgan': {
        name: '德摩根律',
        leftEq: '~(A ∪ B)',
        rightEq: '~A ∩ ~B',
        szTitle: '辩证法则',
        szDesc: '德摩根律体现了辩证法。"既不是A也不是B"等价于"不是A且不是B"。这揭示了否定与肯定的辩证统一关系。'
    },
    'double': {
        name: '双重否定律',
        leftEq: '~(~A)',
        rightEq: 'A',
        szTitle: '否定之否定',
        szDesc: '双重否定律体现了"否定之否定"的哲学思想。经过两次批判性反思,我们回到了本质,但已是螺旋上升的新高度。'
    },
    'contradiction': {
        name: '矛盾律',
        leftEq: 'A ∩ ~A',
        rightEq: '∅',
        szTitle: '矛盾对立',
        szDesc: '矛盾律表明,一个事物不能同时"是"与"不是"。这体现了立场的鲜明性:不能既是革命者又是反革命,必须旗帜鲜明。'
    },
    'excluded': {
        name: '排中律',
        leftEq: 'A ∪ ~A',
        rightEq: 'U',
        szTitle: '非此即彼',
        szDesc: '排中律表明,对于革命事业,要么支持要么反对,没有中间道路。每个人都必须在历史的关键时刻做出选择,覆盖全集。'
    },
    'identity': {
        name: '同一律',
        leftEq: 'A ∪ ∅',
        rightEq: 'A',
        szTitle: '保持本色',
        szDesc: '同一律象征着保持初心。与"空集"(虚无、形式主义)结合,不会改变革命队伍的本质。要警惕空洞口号,坚守实质内容。'
    },
    'idempotent': {
        name: '幂等律',
        leftEq: 'A ∪ A',
        rightEq: 'A',
        szTitle: '不忘初心',
        szDesc: '幂等律体现了"不忘初心"。无论重复强调多少次革命理想,其本质不变。真理经得起千锤百炼,重复不会改变其内涵。'
    },
    'zero': {
        name: '零律',
        leftEq: 'A ∪ U',
        rightEq: 'U',
        szTitle: '融入大局',
        szDesc: '零律表明,个体力量融入全民族大团结(全集)中,体现的是整体利益。局部服从整体,这是革命胜利的保证。'
    },
    'absorption': {
        name: '吸收律',
        leftEq: 'A ∪ (A ∩ B)',
        rightEq: 'A',
        szTitle: '统筹包容',
        szDesc: '吸收律体现了统筹兼顾。A已经包含了A与B的交集,体现了"大团结"吸收"小团结"的包容性,展现治理智慧。'
    }
};

// State
let currentLaw = 'commutative';
let setsData = {
    'A': new Set(),
    'B': new Set(),
    'C': new Set()
};
let isVerified = false;

// Drag and Drop Logic
let draggedType = null;

elementPool.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('element-item')) {
        draggedType = e.target.dataset.type;
        e.dataTransfer.effectAllowed = 'copy';
    }
});

function setupDropZones() {
    const slots = document.querySelectorAll('.set-slot');
    slots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            slot.classList.add('highlight');
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('highlight');
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('highlight');

            const setName = slot.dataset.slot;
            if (draggedType && setName !== 'U' && setName !== '∅') { // Can't drag into universal or empty
                setsData[setName].add(draggedType);
                updateSlotVisuals();
                resetVerification();
            }
        });

        // Click to clear
        slot.addEventListener('click', () => {
            const setName = slot.dataset.slot;
            if (setName !== 'U' && setName !== '∅') {
                setsData[setName].clear();
                updateSlotVisuals();
                resetVerification();
            }
        });
    });
}

function updateSlotVisuals() {
    const slots = document.querySelectorAll('.set-slot');
    slots.forEach(slot => {
        const setName = slot.dataset.slot;

        if (setName === 'U') {
            slot.classList.add('filled');
            slot.textContent = 'U: 全集';
        } else if (setName === '∅') {
            slot.classList.add('filled');
            slot.textContent = '∅';
        } else {
            const set = setsData[setName];
            if (set && set.size > 0) {
                slot.classList.add('filled');
                const icons = Array.from(set).map(t => ELEMENT_MAP[t]).join('');
                slot.textContent = `${setName}: ${icons}`;
            } else {
                slot.classList.remove('filled');
                slot.textContent = setName;
            }
        }
    });
}

// Law Selection
lawBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        lawBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLaw = btn.dataset.law;
        renderScaleContent();
        resetVerification();

        // Update Info
        const info = LAWS[currentLaw];
        szTitle.textContent = info.szTitle;
        szDesc.textContent = info.szDesc;
    });
});

function renderScaleContent() {
    const law = LAWS[currentLaw];
    leftEq.textContent = law.leftEq;
    rightEq.textContent = law.rightEq;

    // Render Slots based on law type
    const leftContent = leftPan.querySelector('.pan-content');
    const rightContent = rightPan.querySelector('.pan-content');

    if (currentLaw === 'commutative') {
        leftContent.innerHTML = `
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∪</div>
            <div class="set-slot" data-slot="B">B</div>
        `;
        rightContent.innerHTML = `
            <div class="set-slot" data-slot="B">B</div>
            <div class="op-symbol">∪</div>
            <div class="set-slot" data-slot="A">A</div>
        `;
    } else if (currentLaw === 'associative') {
        leftContent.innerHTML = `
            <span class="op-symbol">(</span>
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∪</div>
            <div class="set-slot" data-slot="B">B</div>
            <span class="op-symbol">)</span>
            <div class="op-symbol">∪</div>
            <div class="set-slot" data-slot="C">C</div>
        `;
        rightContent.innerHTML = `
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∪</div>
            <span class="op-symbol">(</span>
            <div class="set-slot" data-slot="B">B</div>
            <div class="op-symbol">∪</div>
            <div class="set-slot" data-slot="C">C</div>
            <span class="op-symbol">)</span>
        `;
    } else if (currentLaw === 'distributive') {
        leftContent.innerHTML = `
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∩</div>
            <span class="op-symbol">(</span>
            <div class="set-slot" data-slot="B">B</div>
            <div class="op-symbol">∪</div>
            <div class="set-slot" data-slot="C">C</div>
            <span class="op-symbol">)</span>
        `;
        rightContent.innerHTML = `
            <span class="op-symbol">(</span>
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∩</div>
            <div class="set-slot" data-slot="B">B</div>
            <span class="op-symbol">)</span>
            <div class="op-symbol">∪</div>
            <span class="op-symbol">(</span>
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∩</div>
            <div class="set-slot" data-slot="C">C</div>
            <span class="op-symbol">)</span>
        `;
    } else if (currentLaw === 'demorgan') {
        leftContent.innerHTML = `
            <span class="op-symbol">~(</span>
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∪</div>
            <div class="set-slot" data-slot="B">B</div>
            <span class="op-symbol">)</span>
        `;
        rightContent.innerHTML = `
            <span class="op-symbol">~</span>
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∩</div>
            <span class="op-symbol">~</span>
            <div class="set-slot" data-slot="B">B</div>
        `;
    } else if (currentLaw === 'double') {
        leftContent.innerHTML = `
            <span class="op-symbol">~(~</span>
            <div class="set-slot" data-slot="A">A</div>
            <span class="op-symbol">)</span>
        `;
        rightContent.innerHTML = `
            <div class="set-slot" data-slot="A">A</div>
        `;
    } else if (currentLaw === 'contradiction') {
        leftContent.innerHTML = `
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∩</div>
            <span class="op-symbol">~</span>
            <div class="set-slot" data-slot="A">A</div>
        `;
        rightContent.innerHTML = `
            <div class="set-slot" data-slot="∅">∅</div>
        `;
    } else if (currentLaw === 'excluded') {
        leftContent.innerHTML = `
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∪</div>
            <span class="op-symbol">~</span>
            <div class="set-slot" data-slot="A">A</div>
        `;
        rightContent.innerHTML = `
            <div class="set-slot" data-slot="U">U</div>
        `;
    } else if (currentLaw === 'identity') {
        leftContent.innerHTML = `
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∪</div>
            <div class="set-slot" data-slot="∅">∅</div>
        `;
        rightContent.innerHTML = `
            <div class="set-slot" data-slot="A">A</div>
        `;
    } else if (currentLaw === 'idempotent') {
        leftContent.innerHTML = `
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∪</div>
            <div class="set-slot" data-slot="A">A</div>
        `;
        rightContent.innerHTML = `
            <div class="set-slot" data-slot="A">A</div>
        `;
    } else if (currentLaw === 'zero') {
        leftContent.innerHTML = `
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∪</div>
            <div class="set-slot" data-slot="U">U</div>
        `;
        rightContent.innerHTML = `
            <div class="set-slot" data-slot="U">U</div>
        `;
    } else if (currentLaw === 'absorption') {
        leftContent.innerHTML = `
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∪</div>
            <span class="op-symbol">(</span>
            <div class="set-slot" data-slot="A">A</div>
            <div class="op-symbol">∩</div>
            <div class="set-slot" data-slot="B">B</div>
            <span class="op-symbol">)</span>
        `;
        rightContent.innerHTML = `
            <div class="set-slot" data-slot="A">A</div>
        `;
    }

    setupDropZones();
    updateSlotVisuals();
}

// Verification Logic
function complement(set) {
    return UNIVERSAL_SET.filter(x => !set.includes(x));
}

function union(s1, s2) {
    return Array.from(new Set([...s1, ...s2]));
}

function intersect(s1, s2) {
    return s1.filter(x => s2.includes(x));
}

function calculateResult(lawType) {
    const A = Array.from(setsData['A']);
    const B = Array.from(setsData['B']);
    const C = Array.from(setsData['C']);

    let resLeft, resRight;

    if (lawType === 'commutative') {
        resLeft = union(A, B).sort();
        resRight = union(B, A).sort();
    } else if (lawType === 'associative') {
        resLeft = union(union(A, B), C).sort();
        resRight = union(A, union(B, C)).sort();
    } else if (lawType === 'distributive') {
        resLeft = intersect(A, union(B, C)).sort();
        resRight = union(intersect(A, B), intersect(A, C)).sort();
    } else if (lawType === 'demorgan') {
        resLeft = complement(union(A, B)).sort();
        resRight = intersect(complement(A), complement(B)).sort();
    } else if (lawType === 'double') {
        resLeft = A.sort();
        resRight = A.sort();
    } else if (lawType === 'contradiction') {
        resLeft = []; // Empty
        resRight = []; // Empty
    } else if (lawType === 'excluded') {
        resLeft = UNIVERSAL_SET.slice().sort();
        resRight = UNIVERSAL_SET.slice().sort();
    } else if (lawType === 'identity') {
        resLeft = A.sort();
        resRight = A.sort();
    } else if (lawType === 'idempotent') {
        resLeft = A.sort();
        resRight = A.sort();
    } else if (lawType === 'zero') {
        resLeft = UNIVERSAL_SET.slice().sort();
        resRight = UNIVERSAL_SET.slice().sort();
    } else if (lawType === 'absorption') {
        resLeft = A.sort();
        resRight = A.sort();
    }

    return { resLeft, resRight };
}

verifyBtn.addEventListener('click', () => {
    if (isVerified) return;

    // Calculate results
    const { resLeft, resRight } = calculateResult(currentLaw);

    // Display results
    const formatRes = (arr) => arr.length ? arr.map(t => ELEMENT_MAP[t]).join(' ') : '∅';
    leftResult.textContent = `= { ${formatRes(resLeft)} }`;
    rightResult.textContent = `= { ${formatRes(resRight)} }`;
    leftResult.classList.remove('hidden');
    rightResult.classList.remove('hidden');

    // Compare
    const isEqual = JSON.stringify(resLeft) === JSON.stringify(resRight);

    if (isEqual) {
        // Animate Balance
        scaleBeam.style.transform = 'rotate(0deg)';
        leftPanEl.style.transform = 'rotate(0deg)';
        rightPanEl.style.transform = 'rotate(0deg)';

        verificationBadge.classList.remove('hidden');
        isVerified = true;

        // Glow effect
        setTimeout(() => {
            leftPan.style.borderColor = '#27c93f';
            rightPan.style.borderColor = '#27c93f';
        }, 500);
    }
});

function resetVerification() {
    isVerified = false;
    verificationBadge.classList.add('hidden');
    leftResult.classList.add('hidden');
    rightResult.classList.add('hidden');
    leftPan.style.borderColor = '#ffb400';
    rightPan.style.borderColor = '#ffb400';

    // Random initial tilt
    const tilt = Math.random() > 0.5 ? 5 : -5;
    scaleBeam.style.transform = `rotate(${tilt}deg)`;
    leftPanEl.style.transform = `rotate(${-tilt}deg)`;
    rightPanEl.style.transform = `rotate(${-tilt}deg)`;
}

resetBtn.addEventListener('click', () => {
    setsData['A'].clear();
    setsData['B'].clear();
    setsData['C'].clear();
    updateSlotVisuals();
    resetVerification();
});

// Init
renderScaleContent();
resetVerification();
