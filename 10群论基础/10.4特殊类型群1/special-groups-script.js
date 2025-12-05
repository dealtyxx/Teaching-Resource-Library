/**
 * 特殊类型群可视化系统 - 增强交互版本
 * Special Types of Groups Visualization - Enhanced Interactive Version
 */

// DOM Elements
const typeButtons = document.querySelectorAll('.type-btn');
const subtypeButtons = document.querySelectorAll('.subtype-btn');
const permutationTypes = document.getElementById('permutationTypes');
const exampleSelect = document.getElementById('exampleSelect');
const orderValue = document.getElementById('orderValue');
const propertyValue = document.getElementById('propertyValue');
const elementSelector = document.getElementById('elementSelector');
const resultDisplay = document.getElementById('resultDisplay');
const conceptTitle = document.getElementById('conceptTitle');
const conceptContent = document.getElementById('conceptContent');
const mainTitle = document.getElementById('mainTitle');
const mainSubtitle = document.getElementById('mainSubtitle');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const ideologyTitle = document.getElementById('ideologyTitle');
const ideologyText = document.getElementById('ideologyText');
const analogyText = document.getElementById('analogyText');
const groupSvg = document.getElementById('groupSvg');
const structureGroup = document.getElementById('structureGroup');
const cayleyTable = document.getElementById('cayleyTable');
const demonstrateBtn = document.getElementById('demonstrateBtn');
const resetBtn = document.getElementById('resetBtn');

// State
let currentType = 'abelian';
let currentExample = 'klein';
let selectedElements = [];

// Type Data
const TYPES = {
    abelian: {
        name: '交换群',
        nameEn: 'Abelian Group',
        title: '和谐平等',
        quote: '"和而不同，和实生物，同则不继。"',
        author: '— 《国语·郑语》',
        ideology: '交换群体现了和谐平等的精神。无论运算顺序如何，结果都相同，象征着组织成员地位平等、相互尊重、和谐共处。',
        analogy: '如同民主协商机制，不论先听谁的意见，最终达成的共识是一致的，体现了平等参与、和谐决策的理念。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 满足交换律ab=ba的群。</p>
            <p><strong>核心思想:</strong> 运算顺序不影响结果。</p>
            <p><strong>社会意义:</strong> 和谐平等的组织关系。</p>
        `
    },
    cyclic: {
        name: '循环群',
        nameEn: 'Cyclic Group',
        title: '周而复始',
        quote: '"天行健，君子以自强不息。"',
        author: '— 《周易·乾》',
        ideology: '循环群象征着生生不息、周而复始的发展规律。由一个生成元通过不断运算产生整个群，体现了持续发展和自我完善的精神。',
        analogy: '如同四季轮回、日月更替，遵循自然规律不断循环发展。又如干部轮岗制度，通过有序轮换实现全面发展。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 由单个元素生成的群，G=⟨g⟩。</p>
            <p><strong>核心思想:</strong> 一个元素生成整个群。</p>
            <p><strong>社会意义:</strong> 周而复始、持续发展。</p>
        `
    },
    permutation: {
        name: '置换群',
        nameEn: 'Permutation Group',
        title: '统筹调度',
        quote: '"运筹帷幄之中，决胜千里之外。"',
        author: '— 《史记·高祖本纪》',
        ideology: '置换群体现了统筹调度的管理智慧。通过合理的排列组合，实现资源的优化配置和人员的科学调度。',
        analogy: '如同生产调度系统，根据不同情况灵活调整人员和资源配置，实现效率最大化。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 集合的所有排列构成的群。</p>
            <p><strong>核心思想:</strong> 排列组合与调度优化。</p>
            <p><strong>社会意义:</strong> 统筹兼顾、科学调度。</p>
        `
    }
};

// Permutation Subtypes
const SUBTYPES = {
    general: { name: '置换', desc: '集合元素的重新排列' },
    odd: { name: '奇置换', desc: '由奇数个对换组成' },
    even: { name: '偶置换', desc: '由偶数个对换组成' },
    cycle: { name: '轮换', desc: '循环移动元素' },
    transposition: { name: '对换', desc: '交换两个元素' }
};

// Examples
const EXAMPLES = {
    z4: {
        name: 'ℤ₄',
        fullName: '循环群 ℤ₄',
        order: 4,
        property: '交换的循环群',
        elements: [0, 1, 2, 3],
        operation: (a, b) => (a + b) % 4,
        generator: 1,
        isAbelian: true,
        isCyclic: true
    },
    klein: {
        name: 'V₄',
        fullName: '克莱因四元群 V₄',
        order: 4,
        property: '交换但非循环',
        elements: ['e', 'a', 'b', 'c'],
        operation: (x, y) => {
            const table = {
                'e': { 'e': 'e', 'a': 'a', 'b': 'b', 'c': 'c' },
                'a': { 'e': 'a', 'a': 'e', 'b': 'c', 'c': 'b' },
                'b': { 'e': 'b', 'a': 'c', 'b': 'e', 'c': 'a' },
                'c': { 'e': 'c', 'a': 'b', 'b': 'a', 'c': 'e' }
            };
            return table[x][y];
        },
        generator: null,
        isAbelian: true,
        isCyclic: false
    },
    s3: {
        name: 'S₃',
        fullName: '对称群 S₃',
        order: 6,
        property: '非交换置换群',
        elements: ['e', 'r', 'r²', 's', 'sr', 'sr²'],
        operation: (x, y) => {
            const table = {
                'e': { 'e': 'e', 'r': 'r', 'r²': 'r²', 's': 's', 'sr': 'sr', 'sr²': 'sr²' },
                'r': { 'e': 'r', 'r': 'r²', 'r²': 'e', 's': 'sr', 'sr': 'sr²', 'sr²': 's' },
                'r²': { 'e': 'r²', 'r': 'e', 'r²': 'r', 's': 'sr²', 'sr': 's', 'sr²': 'sr' },
                's': { 'e': 's', 'r': 'sr²', 'r²': 'sr', 's': 'e', 'sr': 'r²', 'sr²': 'r' },
                'sr': { 'e': 'sr', 'r': 's', 'r²': 'sr²', 's': 'r', 'sr': 'e', 'sr²': 'r²' },
                'sr²': { 'e': 'sr²', 'r': 'sr', 'r²': 's', 's': 'r²', 'sr': 'r', 'sr²': 'e' }
            };
            return table[x][y];
        },
        generator: null,
        isAbelian: false,
        isCyclic: false
    },
    a3: {
        name: 'A₃',
        fullName: '交错群 A₃',
        order: 3,
        property: '循环的交换群',
        elements: ['e', 'r', 'r²'],
        operation: (x, y) => {
            const table = {
                'e': { 'e': 'e', 'r': 'r', 'r²': 'r²' },
                'r': { 'e': 'r', 'r': 'r²', 'r²': 'e' },
                'r²': { 'e': 'r²', 'r': 'e', 'r²': 'r' }
            };
            return table[x][y];
        },
        generator: 'r',
        isAbelian: true,
        isCyclic: true
    }
};

// Update Type
function updateType(type) {
    currentType = type;
    const data = TYPES[type];

    typeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    permutationTypes.style.display = type === 'permutation' ? 'block' : 'none';

    conceptTitle.textContent = data.title;
    conceptContent.innerHTML = data.conceptInfo;
    mainTitle.textContent = `${data.name} - ${data.title}`;
    mainSubtitle.textContent = data.nameEn;
    quoteText.textContent = data.quote;
    quoteAuthor.textContent = data.author;
    ideologyTitle.textContent = data.title;
    ideologyText.textContent = data.ideology;
    analogyText.textContent = data.analogy;

    let targetExample = currentExample;
    if (type === 'abelian') {
        targetExample = 'klein';
    } else if (type === 'cyclic') {
        targetExample = 'z4';
    } else if (type === 'permutation') {
        targetExample = 's3';
    }

    exampleSelect.value = targetExample;
    if (targetExample !== currentExample) {
        updateExample(targetExample);
    } else {
        renderStructure(EXAMPLES[currentExample]);
    }
}

// Update Example
function updateExample(exampleId) {
    currentExample = exampleId;
    const example = EXAMPLES[exampleId];

    orderValue.textContent = example.order;
    propertyValue.textContent = example.property;

    renderElementSelector(example);
    renderCayleyTable(example);
    renderStructure(example);

    resultDisplay.innerHTML = '<p style="color: var(--text-secondary);">💡 点击凯莱表单元格或SVG节点查看运算详情</p>';
    selectedElements = [];
}

// Render Element Selector
function renderElementSelector(example) {
    elementSelector.innerHTML = '';
    example.elements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';
        div.textContent = el;
        div.dataset.value = el;
        div.addEventListener('click', () => selectElement(el, example));
        elementSelector.appendChild(div);
    });
}

// Render Cayley Table
function renderCayleyTable(example) {
    cayleyTable.innerHTML = '';
    const elements = example.elements;

    const headerRow = cayleyTable.insertRow();
    headerRow.insertCell().textContent = '*';
    elements.forEach(el => {
        const th = document.createElement('th');
        th.textContent = el;
        headerRow.appendChild(th);
    });

    elements.forEach(rowEl => {
        const row = cayleyTable.insertRow();
        const th = document.createElement('th');
        th.textContent = rowEl;
        row.appendChild(th);

        elements.forEach(colEl => {
            const result = example.operation(rowEl, colEl);
            const cell = row.insertCell();
            cell.textContent = result;

            cell.addEventListener('click', function () {
                selectedElements = [];
                showOperationDetail(rowEl, colEl, result, example);
                highlightCayleyCell(this);
            });

            cell.addEventListener('mouseenter', function () {
                this.style.background = 'rgba(255, 180, 0, 0.4)';
                this.style.transform = 'scale(1.1)';
                this.style.transition = 'all 0.2s';
            });

            cell.addEventListener('mouseleave', function () {
                if (!this.classList.contains('highlighted')) {
                    this.style.background = 'rgba(255, 255, 255, 0.6)';
                    this.style.transform = 'scale(1)';
                }
            });
        });
    });
}

function highlightCayleyCell(cell) {
    document.querySelectorAll('#cayleyTable td').forEach(c => {
        c.classList.remove('highlighted');
        c.style.background = 'rgba(255, 255, 255, 0.6)';
        c.style.transform = 'scale(1)';
    });

    cell.classList.add('highlighted');
    cell.style.background = 'var(--accent-gold)';
    cell.style.fontWeight = 'bold';
}

// Select Element
function selectElement(element, example) {
    selectedElements.push(element);

    document.querySelectorAll('.element-item').forEach(item => {
        item.classList.remove('selected');
    });

    if (selectedElements.length === 1) {
        document.querySelector(`[data-value="${element}"]`).classList.add('selected');
        resultDisplay.innerHTML = `<p>已选择: <strong style="color: var(--accent-red);">${element}</strong></p><p>再选择一个元素进行运算</p>`;
    } else if (selectedElements.length === 2) {
        const [a, b] = selectedElements;
        const result = example.operation(a, b);
        showOperationDetail(a, b, result, example);
        selectedElements = [];
    }
}

function showOperationDetail(a, b, result, example) {
    resultDisplay.innerHTML = `
        <p style="font-size: 1rem; margin-bottom: 10px;">
            <strong style="color: var(--accent-red);">${a}</strong> 
            <span style="color: var(--text-secondary);">*</span> 
            <strong style="color: var(--accent-red);">${b}</strong> 
            = 
            <strong style="color: var(--accent-gold);">${result}</strong>
        </p>
        ${example.isAbelian ? `
            <p style="font-size: 0.85rem; color: var(--color-abelian);">
                ✓ 满足交换律: ${b} * ${a} = ${example.operation(b, a)}
            </p>
        ` : `
            <p style="font-size: 0.85rem; color: var(--text-secondary);">
                非交换: ${b} * ${a} = ${example.operation(b, a)} ${example.operation(b, a) !== result ? '≠ ' + result : ''}
            </p>
        `}
        ${example.isCyclic && example.generator ? `
            <p style="font-size: 0.85rem; color: var(--color-cyclic);">
                🔄 生成元: ${example.generator}
            </p>
        ` : ''}
    `;

    animateOperation(a, b, result, example);
}

// Render Structure
function renderStructure(example) {
    structureGroup.innerHTML = '';
    const arrowsGroup = document.getElementById('arrowsGroup');
    if (arrowsGroup) arrowsGroup.innerHTML = '';

    const WIDTH = groupSvg.clientWidth || 400;
    const HEIGHT = groupSvg.clientHeight || 300;
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;

    if (currentType === 'abelian' && !example.isCyclic) {
        renderAbelianLayout(example, WIDTH, HEIGHT, centerX, centerY);
    } else if (currentType === 'cyclic' || (currentType === 'abelian' && example.isCyclic)) {
        renderCyclicLayout(example, WIDTH, HEIGHT, centerX, centerY);
    } else if (currentType === 'permutation') {
        renderPermutationLayout(example, WIDTH, HEIGHT, centerX, centerY);
    } else {
        renderCircularLayout(example, WIDTH, HEIGHT, centerX, centerY);
    }
}

// 交换群：对称圆形布局（缩小 - 半径更小）
function renderAbelianLayout(example, WIDTH, HEIGHT, centerX, centerY) {
    const radius = Math.min(WIDTH, HEIGHT) / 2.8; // 缩小交换群布局
    const n = example.elements.length;

    example.elements.forEach((el, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        createNode(el, x, y);

        if (i < n / 2) {
            const oppositeIdx = (i + Math.floor(n / 2)) % n;
            const angle2 = (2 * Math.PI * oppositeIdx) / n - Math.PI / 2;
            const x2 = centerX + radius * Math.cos(angle2);
            const y2 = centerY + radius * Math.sin(angle2);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', y);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', 'var(--color-abelian)');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('opacity', '0.2');
            structureGroup.insertBefore(line, structureGroup.firstChild);
        }
    });
}

// 循环群：螺旋布局（扩大 - 半径更大）
function renderCyclicLayout(example, WIDTH, HEIGHT, centerX, centerY) {
    const maxRadius = Math.min(WIDTH, HEIGHT) / 1.7; // 扩大循环群布局
    const n = example.elements.length;

    example.elements.forEach((el, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const radiusFactor = 0.3 + (i / n) * 0.7;
        const x = centerX + maxRadius * radiusFactor * Math.cos(angle);
        const y = centerY + maxRadius * radiusFactor * Math.sin(angle);

        createNode(el, x, y);

        if (i < n - 1) {
            const nextAngle = (2 * Math.PI * (i + 1)) / n - Math.PI / 2;
            const nextRadiusFactor = 0.3 + ((i + 1) / n) * 0.7;
            const x2 = centerX + maxRadius * nextRadiusFactor * Math.cos(nextAngle);
            const y2 = centerY + maxRadius * nextRadiusFactor * Math.sin(nextAngle);

            drawArrow(x, y, x2, y2, 'var(--color-cyclic)', 2);
        } else {
            const firstAngle = -Math.PI / 2;
            const firstRadiusFactor = 0.3;
            const x2 = centerX + maxRadius * firstRadiusFactor * Math.cos(firstAngle);
            const y2 = centerY + maxRadius * firstRadiusFactor * Math.sin(firstAngle);

            drawArrow(x, y, x2, y2, 'var(--color-cyclic)', 2, true);
        }
    });

    if (example.generator !== null && example.generator !== undefined) {
        const genText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        genText.setAttribute('x', centerX);
        genText.setAttribute('y', centerY + maxRadius + 30);
        genText.setAttribute('text-anchor', 'middle');
        genText.setAttribute('fill', 'var(--color-cyclic)');
        genText.setAttribute('font-size', '14');
        genText.setAttribute('font-weight', 'bold');
        genText.textContent = `生成元: ${example.generator}`;
        structureGroup.appendChild(genText);
    }
}

// 置换群：网格变换布局
function renderPermutationLayout(example, WIDTH, HEIGHT, centerX, centerY) {
    const n = example.elements.length;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const spacing = Math.min(WIDTH / (cols + 0.3), HEIGHT / (rows + 0.3));

    example.elements.forEach((el, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = centerX - (cols - 1) * spacing / 2 + col * spacing;
        const y = centerY - (rows - 1) * spacing / 2 + row * spacing;

        createNode(el, x, y);
    });

    for (let i = 0; i <= cols; i++) {
        const x = centerX - (cols - 1) * spacing / 2 + (i - 0.5) * spacing;
        if (i > 0 && i < cols) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', centerY - rows * spacing / 2);
            line.setAttribute('x2', x);
            line.setAttribute('y2', centerY + rows * spacing / 2);
            line.setAttribute('stroke', '#ddd');
            line.setAttribute('stroke-width', '0.5');
            line.setAttribute('opacity', '0.5');
            structureGroup.insertBefore(line, structureGroup.firstChild);
        }
    }
}

// 通用圆形布局
function renderCircularLayout(example, WIDTH, HEIGHT, centerX, centerY) {
    const radius = Math.min(WIDTH, HEIGHT) / 2.2;
    const n = example.elements.length;

    example.elements.forEach((el, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        createNode(el, x, y);
    });
}

// 创建节点
function createNode(el, x, y) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'group-node');
    g.setAttribute('transform', `translate(${x}, ${y})`);
    g.setAttribute('data-element', el);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', 25);
    circle.setAttribute('class', 'node-circle');
    circle.setAttribute('fill', '#d63b1d');
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', 2);
    circle.setAttribute('filter', 'url(#glow)');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'node-label');
    text.setAttribute('y', 5);
    text.textContent = el;

    g.appendChild(circle);
    g.appendChild(text);
    structureGroup.appendChild(g);

    g.addEventListener('click', () => {
        if (selectedElements.length < 2) {
            const example = EXAMPLES[currentExample];
            selectElement(el, example);
            highlightNode(el);
        }
    });
}

// 绘制箭头
function drawArrow(x1, y1, x2, y2, color, strokeWidth = 1.5, dashed = false) {
    const arrowsGroup = document.getElementById('arrowsGroup');
    if (!arrowsGroup) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const shortenDist = 28;

    const newX2 = x2 - (dx / dist) * shortenDist;
    const newY2 = y2 - (dy / dist) * shortenDist;
    const newX1 = x1 + (dx / dist) * shortenDist;
    const newY1 = y1 + (dy / dist) * shortenDist;

    const midX = (newX1 + newX2) / 2;
    const midY = (newY1 + newY2) / 2;

    const d = `M ${newX1} ${newY1} Q ${midX} ${midY} ${newX2} ${newY2}`;
    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', strokeWidth);
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', 'url(#arrowRed)');

    if (dashed) {
        path.setAttribute('stroke-dasharray', '5,5');
        path.setAttribute('opacity', '0.5');
    } else {
        path.setAttribute('opacity', '0.6');
    }

    arrowsGroup.appendChild(path);
}

function highlightNode(element) {
    document.querySelectorAll('.group-node').forEach(node => {
        const circle = node.querySelector('.node-circle');
        if (node.dataset.element === element) {
            circle.setAttribute('fill', 'var(--accent-gold)');
            circle.setAttribute('r', 30);
        } else {
            circle.setAttribute('fill', '#d63b1d');
            circle.setAttribute('r', 25);
        }
    });
}

// Animate Operation (增强版 - 带箭头连接线)
async function animateOperation(a, b, result, example) {
    document.querySelectorAll('.group-node').forEach(node => {
        node.querySelector('.node-circle').setAttribute('fill', '#d63b1d');
        node.querySelector('.node-circle').setAttribute('r', 25);
    });

    const animationGroup = document.getElementById('arrowsGroup');

    await sleep(200);
    const nodeA = document.querySelector(`[data-element="${a}"]`);
    const nodeB = document.querySelector(`[data-element="${b}"]`);
    const nodeResult = document.querySelector(`[data-element="${result}"]`);

    if (!nodeA || !nodeB || !nodeResult) return;

    const transformA = nodeA.getAttribute('transform');
    const transformB = nodeB.getAttribute('transform');
    const transformResult = nodeResult.getAttribute('transform');

    const posA = extractPosition(transformA);
    const posB = extractPosition(transformB);
    const posResult = extractPosition(transformResult);

    if (nodeA) {
        nodeA.querySelector('.node-circle').setAttribute('fill', 'var(--accent-red)');
        nodeA.querySelector('.node-circle').setAttribute('r', 30);
    }

    await sleep(300);

    if (nodeB) {
        nodeB.querySelector('.node-circle').setAttribute('fill', 'var(--accent-red)');
        nodeB.querySelector('.node-circle').setAttribute('r', 30);

        drawAnimatedArrow(posA.x, posA.y, posB.x, posB.y, '#ff6b6b', 'operation-line-1');
    }

    await sleep(500);

    if (nodeResult) {
        nodeResult.querySelector('.node-circle').setAttribute('fill', 'var(--accent-gold)');
        nodeResult.querySelector('.node-circle').setAttribute('r', 35);

        drawAnimatedArrow(posB.x, posB.y, posResult.x, posResult.y, '#ffd93d', 'operation-line-2');

        setTimeout(() => {
            drawAnimatedArrow(posA.x, posA.y, posResult.x, posResult.y, 'var(--accent-gold)', 'operation-line-3', true);
        }, 200);
    }

    await sleep(400);

    if (nodeResult) {
        for (let i = 0; i < 3; i++) {
            await sleep(200);
            nodeResult.querySelector('.node-circle').setAttribute('r', 30);
            await sleep(200);
            nodeResult.querySelector('.node-circle').setAttribute('r', 35);
        }

        await sleep(500);
        nodeResult.querySelector('.node-circle').setAttribute('r', 25);
    }

    await sleep(300);
    if (animationGroup) {
        const animLines = animationGroup.querySelectorAll('[id^="operation-line-"]');
        animLines.forEach(line => {
            line.style.opacity = '0';
            setTimeout(() => line.remove(), 300);
        });
    }
}

function extractPosition(transform) {
    const match = transform.match(/translate\(([\d.]+),\s*([\d.]+)\)/);
    if (match) {
        return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
    }
    return { x: 0, y: 0 };
}

function drawAnimatedArrow(x1, y1, x2, y2, color, id, dashed = false) {
    const arrowsGroup = document.getElementById('arrowsGroup');
    if (!arrowsGroup) return;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const shortenDist = 30;

    const newX1 = x1 + (dx / dist) * shortenDist;
    const newY1 = y1 + (dy / dist) * shortenDist;
    const newX2 = x2 - (dx / dist) * shortenDist;
    const newY2 = y2 - (dy / dist) * shortenDist;

    const controlX = (newX1 + newX2) / 2 + (newY2 - newY1) * 0.2;
    const controlY = (newY1 + newY2) / 2 - (newX2 - newX1) * 0.2;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${newX1} ${newY1} Q ${controlX} ${controlY} ${newX2} ${newY2}`;

    path.setAttribute('id', id);
    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', 'url(#arrowRed)');
    path.setAttribute('opacity', '0');

    if (dashed) {
        path.setAttribute('stroke-dasharray', '8,4');
    }

    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.style.transition = 'stroke-dashoffset 0.6s ease-out, opacity 0.3s';

    arrowsGroup.appendChild(path);

    setTimeout(() => {
        path.setAttribute('opacity', '0.8');
        path.style.strokeDashoffset = '0';
    }, 50);
}

// Demonstrate Operation
async function demonstrateOperation() {
    const example = EXAMPLES[currentExample];
    demonstrateBtn.disabled = true;
    demonstrateBtn.textContent = '演示中...';

    if (example.isCyclic && example.generator) {
        resultDisplay.innerHTML = `
            <p style="font-size: 0.9rem; color: var(--color-cyclic); margin-bottom: 8px;">
                <strong>🔄 循环生成演示</strong>
            </p>
            <p style="font-size: 0.85rem;">生成元: <strong>${example.generator}</strong></p>
        `;

        let current = example.elements[0];
        for (let i = 0; i < example.elements.length; i++) {
            highlightNode(current);
            await sleep(800);

            if (i < example.elements.length - 1) {
                current = example.operation(current, example.generator);
                resultDisplay.innerHTML += `<p style="font-size: 0.8rem; margin: 4px 0;">第${i + 1}步: → <strong style="color: var(--accent-gold);">${current}</strong></p>`;
            }
        }

        await sleep(1000);
    }

    resultDisplay.innerHTML = '<p style="font-size: 0.9rem; color: var(--accent-red);"><strong>🎲 随机运算演示</strong></p>';

    for (let i = 0; i < 3; i++) {
        const a = example.elements[Math.floor(Math.random() * example.elements.length)];
        const b = example.elements[Math.floor(Math.random() * example.elements.length)];
        const result = example.operation(a, b);

        resultDisplay.innerHTML = `
            <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>示例 ${i + 1}:</strong></p>
            <p style="font-size: 1rem;">
                <strong style="color: var(--accent-red);">${a}</strong> * 
                <strong style="color: var(--accent-red);">${b}</strong> = 
                <strong style="color: var(--accent-gold);">${result}</strong>
            </p>
            ${example.isAbelian ? `<p style="font-size: 0.85rem; color: var(--color-abelian);">✓ ${b} * ${a} = ${example.operation(b, a)}</p>` : ''}
        `;

        await animateOperation(a, b, result, example);
        await sleep(1500);
    }

    document.querySelectorAll('.group-node').forEach(node => {
        node.querySelector('.node-circle').setAttribute('fill', '#d63b1d');
        node.querySelector('.node-circle').setAttribute('r', 25);
    });

    resultDisplay.innerHTML = '<p style="color: var(--color-abelian);">✓ 演示完成！点击凯莱表或SVG节点探索更多</p>';

    demonstrateBtn.disabled = false;
    demonstrateBtn.textContent = '▶ 演示运算';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event Listeners
function attachEventListeners() {
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => updateType(btn.dataset.type));
    });

    subtypeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            subtypeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const info = SUBTYPES[this.dataset.subtype];
            resultDisplay.innerHTML = `
                <p><strong style="color: var(--accent-red);">${info.name}</strong></p>
                <p style="color: var(--text-secondary);">${info.desc}</p>
            `;
        });
    });

    exampleSelect.addEventListener('change', (e) => {
        updateExample(e.target.value);
    });

    demonstrateBtn.addEventListener('click', demonstrateOperation);

    resetBtn.addEventListener('click', () => {
        location.reload();
    });
}

// Initialization
window.addEventListener('load', () => {
    updateType('abelian');
    updateExample('klein');
    attachEventListeners();
});
