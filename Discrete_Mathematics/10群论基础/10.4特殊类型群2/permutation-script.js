/**
 * 置换群可视化系统 (修复版本 - 显示映射数字)
 * Permutation Groups Visualization (Fixed - Show mapping numbers)
 */

// DOM Elements
const typeButtons = document.querySelectorAll('.type-btn');
const dragArea = document.getElementById('dragArea');
const applyPermBtn = document.getElementById('applyPermBtn');
const exampleBtns = document.querySelectorAll('.example-btn');
const decompDisplay = document.getElementById('decompDisplay');
const conceptTitle = document.getElementById('conceptTitle');
const conceptContent = document.getElementById('conceptContent');
const mainTitle = document.getElementById('mainTitle');
const mainSubtitle = document.getElementById('mainSubtitle');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const ideologyTitle = document.getElementById('ideologyTitle');
const ideologyText = document.getElementById('ideologyText');
const analogyText = document.getElementById('analogyText');
const beforeSeq = document.getElementById('beforeSeq');
const afterSeq = document.getElementById('afterSeq');
const mappingSvg = document.getElementById('mappingSvg');
const arrowsGroup = document.getElementById('arrowsGroup');
const cycleDisplay = document.getElementById('cycleDisplay');
const cycleItems = document.getElementById('cycleItems');
const transpDisplay = document.getElementById('transpDisplay');
const transpSteps = document.getElementById('transpSteps');
const decomposeBtn = document.getElementById('decomposeBtn');
const resetBtn = document.getElementById('resetBtn');

// State
let currentType = 'general';
let currentPerm = [1, 2, 3, 4];

// Type Data
const TYPES = {
    general: {
        name: '置换',
        title: '资源调度',
        quote: '"运筹帷幄之中，决胜千里之外。"',
        author: '— 《史记·高祖本纪》',
        ideology: '置换体现了统筹调度的管理智慧。通过合理安排和优化配置，实现资源利用最大化和工作效率最优化。',
        analogy: '如同生产线的工位调整、人员岗位轮换、物资调度优化，都是置换思想在实际中的应用。',
        conceptInfo: `
            <p><strong>定义:</strong> 集合元素的重新排列。</p>
            <p><strong>核心思想:</strong> 灵活调配资源。</p>
            <p><strong>社会意义:</strong> 优化配置、提高效率。</p>
        `
    },
    odd: {
        name: '奇置换',
        title: '非对称调整',
        quote: '"物极必反，否极泰来。"',
        author: '— 《道德经》',
        ideology: '奇置换需要奇数次对换实现，体现了非对称性调整。有时需要打破平衡才能达到新的更高层次的均衡。',
        analogy: '如同组织改革中的非常规调整，虽然短期打破平衡，但为了长远发展必须进行的变革。',
        conceptInfo: `
            <p><strong>定义:</strong> 由奇数个对换组成的置换。</p>
            <p><strong>符号:</strong> sgn(σ) = -1</p>
            <p><strong>特点:</strong> 不属于交错群。</p>
        `
    },
    even: {
        name: '偶置换',
        title: '平衡调度',
        quote: '"中庸之道，不偏不倚。"',
        author: '— 《中庸》',
        ideology: '偶置换由偶数次对换组成，保持了系统的整体平衡性。体现了在变化中求稳定的智慧。',
        analogy: '如同干部轮岗制度，通过偶数次的岗位对调，保持组织结构的稳定性。',
        conceptInfo: `
            <p><strong>定义:</strong> 由偶数个对换组成的置换。</p>
            <p><strong>符号:</strong> sgn(σ) = +1</p>
            <p><strong>特点:</strong> 构成交错群 Aₙ。</p>
        `
    },
    cycle: {
        name: '轮换',
        title: '循环轮转',
        quote: '"周行而不殆，可以为天下母。"',
        author: '— 《道德经》',
        ideology: '轮换体现了循环轮转的思想。如同四季更替、岗位轮换，在周而复始中实现发展和提高。',
        analogy: '如同值班轮换、干部轮岗、土地轮作，通过有规律的循环实现可持续发展。',
        conceptInfo: `
            <p><strong>定义:</strong> 循环移动若干元素。</p>
            <p><strong>表示:</strong> (a₁ a₂ ... aₖ)</p>
            <p><strong>特点:</strong> 任何置换都可分解为轮换的乘积。</p>
        `
    },
    transposition: {
        name: '对换',
        title: '双向交换',
        quote: '"互通有无，互相学习。"',
        author: '— 合作理念',
        ideology: '对换是最基本的置换，仅交换两个元素。体现了对等交流、互相学习的精神。',
        analogy: '如同干部交流互派、技术人员对调学习、物资对等交换，实现双方共同提高。',
        conceptInfo: `
            <p><strong>定义:</strong> 交换两个元素的置换。</p>
            <p><strong>表示:</strong> (i j)</p>
            <p><strong>基础地位:</strong> 所有置换都可表示为对换的乘积。</p>
        `
    }
};

// Initialize
window.addEventListener('load', () => {
    initDragDrop();
    updateType('general');
    renderPermutation([1, 2, 3, 4]);
    attachEventListeners();
});

// Drag and Drop
function initDragDrop() {
    const items = document.querySelectorAll('.drag-item');

    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
}

function handleDrop(e) {
    e.stopPropagation();

    if (draggedElement !== this) {
        const temp = this.dataset.value;
        this.dataset.value = draggedElement.dataset.value;
        draggedElement.dataset.value = temp;

        this.textContent = this.dataset.value;
        draggedElement.textContent = draggedElement.dataset.value;
    }

    this.classList.remove('drag-over');
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.drag-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

function getCurrentPermutation() {
    const items = document.querySelectorAll('.drag-item');
    return Array.from(items).map(item => parseInt(item.dataset.value));
}

// Update Type
function updateType(type) {
    currentType = type;
    const data = TYPES[type];

    typeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    conceptTitle.textContent = data.title;
    conceptContent.innerHTML = data.conceptInfo;
    mainTitle.textContent = `${data.name} - ${data.title}`;
    mainSubtitle.textContent = data.name;
    quoteText.textContent = data.quote;
    quoteAuthor.textContent = data.author;
    ideologyTitle.textContent = data.name + ' · ' + data.title;
    ideologyText.innerHTML = `<p>${data.ideology}</p>`;
    analogyText.textContent = data.analogy;
}

// Render Permutation
function renderPermutation(perm) {
    currentPerm = perm;

    beforeSeq.innerHTML = '';
    for (let i = 1; i <= perm.length; i++) {
        const div = document.createElement('div');
        div.className = 'seq-item';
        div.textContent = i;
        beforeSeq.appendChild(div);
    }

    afterSeq.innerHTML = '';
    perm.forEach((val) => {
        const div = document.createElement('div');
        div.className = 'seq-item';
        div.textContent = val;
        afterSeq.appendChild(div);
    });

    drawMappingArrows(perm);

    const cycles = decomposeToCycles(perm);
    displayCycles(cycles);
    analyzePermutation(perm, cycles);
}

// 修复后的SVG映射绘制函数
function drawMappingArrows(perm) {
    arrowsGroup.innerHTML = '';

    const WIDTH = mappingSvg.clientWidth || 600;
    const HEIGHT = 250;
    const n = perm.length;
    const spacing = WIDTH / (n + 1);
    const y1 = 50;
    const y2 = 200;

    // Add arrowhead marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', 'var(--accent-red)');

    marker.appendChild(polygon);
    defs.appendChild(marker);
    mappingSvg.insertBefore(defs, arrowsGroup);

    // Draw arrows first
    perm.forEach((target, idx) => {
        const source = idx + 1;
        const x1 = source * spacing;
        const x2 = target * spacing;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const controlY = (y1 + y2) / 2;
        const d = `M ${x1} ${y1 + 22} Q ${(x1 + x2) / 2} ${controlY} ${x2} ${y2 - 22}`;

        path.setAttribute('d', d);
        path.setAttribute('stroke', source === target ? '#ccc' : 'var(--accent-red)');
        path.setAttribute('stroke-width', source === target ? 1 : 2);
        path.setAttribute('opacity', source === target ? 0.3 : 0.7);
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', source === target ? '' : 'url(#arrowhead)');

        arrowsGroup.appendChild(path);
    });

    // Draw source numbers (top)
    for (let i = 1; i <= n; i++) {
        const x = i * spacing;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y1);
        circle.setAttribute('r', 20);
        circle.setAttribute('fill', 'rgba(214, 59, 29, 0.1)');
        circle.setAttribute('stroke', 'var(--accent-red)');
        circle.setAttribute('stroke-width', 2);
        arrowsGroup.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y1 + 6);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '16');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', 'var(--text-primary)');
        text.textContent = i;
        arrowsGroup.appendChild(text);
    }

    // Draw target numbers (bottom)
    perm.forEach((target) => {
        const x = target * spacing;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y2);
        circle.setAttribute('r', 20);
        circle.setAttribute('fill', 'rgba(255, 180, 0, 0.1)');
        circle.setAttribute('stroke', 'var(--accent-gold)');
        circle.setAttribute('stroke-width', 2);
        arrowsGroup.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y2 + 6);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '16');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', 'var(--text-primary)');
        text.textContent = target;
        arrowsGroup.appendChild(text);
    });
}

function decomposeToCycles(perm) {
    const n = perm.length;
    const visited = new Array(n).fill(false);
    const cycles = [];

    for (let i = 0; i < n; i++) {
        if (!visited[i]) {
            const cycle = [];
            let current = i;

            while (!visited[current]) {
                visited[current] = true;
                cycle.push(current + 1);
                current = perm[current] - 1;
            }

            if (cycle.length > 1) {
                cycles.push(cycle);
            }
        }
    }

    return cycles;
}

function displayCycles(cycles) {
    cycleItems.innerHTML = '';

    if (cycles.length === 0) {
        cycleItems.innerHTML = '<span style="color: var(--text-secondary);">恒等置换 (无非平凡轮换)</span>';
    } else {
        cycles.forEach(cycle => {
            const div = document.createElement('div');
            div.className = 'cycle-item';
            div.textContent = `(${cycle.join(' ')})`;
            cycleItems.appendChild(div);
        });
    }
}

function analyzePermutation(perm, cycles) {
    const isIdentity = perm.every((val, idx) => val === idx + 1);

    if (isIdentity) {
        decompDisplay.querySelector('.cycle-notation').textContent = '恒等置换 e';
        decompDisplay.querySelector('.properties-text').innerHTML = `
            <p>类型: 偶置换</p>
            <p>轮换分解: 无非平凡轮换</p>
        `;
        return;
    }

    const transpositions = countTranspositions(perm);
    const isEven = transpositions % 2 === 0;
    const cycleNotation = cycles.map(c => `(${c.join(' ')})`).join('');

    decompDisplay.querySelector('.cycle-notation').textContent = cycleNotation || '恒等';
    decompDisplay.querySelector('.properties-text').innerHTML = `
        <p><strong>类型:</strong> <span style="color: ${isEven ? 'var(--color-even)' : 'var(--color-odd)'};">${isEven ? '偶置换' : '奇置换'}</span></p>
        <p><strong>对换数:</strong> ${transpositions}个</p>
        <p><strong>轮换数:</strong> ${cycles.length}个</p>
    `;
}

function countTranspositions(perm) {
    let count = 0;
    for (let i = 0; i < perm.length; i++) {
        for (let j = i + 1; j < perm.length; j++) {
            if (perm[i] > perm[j]) {
                count++;
            }
        }
    }
    return count;
}

async function decomposeToTranspositions() {
    transpSteps.innerHTML = '';
    transpDisplay.style.display = 'block';

    const cycles = decomposeToCycles(currentPerm);

    if (cycles.length === 0) {
        transpSteps.innerHTML = '<p style="color: var(--text-secondary);">恒等置换无需分解</p>';
        return;
    }

    let stepNum = 1;
    for (const cycle of cycles) {
        if (cycle.length === 2) {
            addTranspositionStep(stepNum++, `(${cycle[0]} ${cycle[1]})`);
        } else if (cycle.length > 2) {
            for (let i = cycle.length - 1; i >= 1; i--) {
                addTranspositionStep(stepNum++, `(${cycle[0]} ${cycle[i]})`);
                await sleep(300);
            }
        }
    }
}

function addTranspositionStep(num, transposition) {
    const div = document.createElement('div');
    div.className = 'transp-step';
    div.innerHTML = `<strong>步骤 ${num}:</strong> ${transposition}`;
    transpSteps.appendChild(div);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event Listeners
function attachEventListeners() {
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => updateType(btn.dataset.type));
    });

    applyPermBtn.addEventListener('click', () => {
        const perm = getCurrentPermutation();
        renderPermutation(perm);
        transpDisplay.style.display = 'none';
    });

    exampleBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const permStr = this.dataset.perm;
            const perm = permStr.split(',').map(Number);

            const items = document.querySelectorAll('.drag-item');
            items.forEach((item, idx) => {
                item.dataset.value = perm[idx];
                item.textContent = perm[idx];
            });

            renderPermutation(perm);
            transpDisplay.style.display = 'none';
        });
    });

    decomposeBtn.addEventListener('click', decomposeToTranspositions);

    resetBtn.addEventListener('click', () => {
        location.reload();
    });
}
