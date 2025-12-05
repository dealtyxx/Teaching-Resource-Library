/**
 * 格论可视化系统
 * Lattice Theory Visualization System
 */

// DOM Elements
const typeButtons = document.querySelectorAll('.type-btn');
const exampleSelect = document.getElementById('exampleSelect');
const orderValue = document.getElementById('orderValue');
const propertyValue = document.getElementById('propertyValue');
const featuresValue = document.getElementById('featuresValue');
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
const latticeSvg = document.getElementById('latticeSvg');
const nodesGroup = document.getElementById('nodesGroup');
const edgesGroup = document.getElementById('edgesGroup');
const demonstrateBtn = document.getElementById('demonstrateBtn');
const resetBtn = document.getElementById('resetBtn');
const joinResult = document.getElementById('joinResult');
const meetResult = document.getElementById('meetResult');

// State
let currentType = 'lattice';
let currentExample = 'b2';
let selectedElements = [];

// Type Data
const TYPES = {
    lattice: {
        name: '格结构',
        nameEn: 'Lattice Structure',
        title: '层次结构',
        quote: '"上下同欲者胜，风雨同舟者兴。"',
        author: '— 《孙子兵法》',
        ideology: '格论体现了层次结构与统筹协调的管理智慧。每个元素在偏序关系中都有明确的位置，而上确界和下确界运算则实现了不同层次的协调统一。',
        analogy: '如同组织的层级结构，上级统筹下级，下级服从上级，通过上下协调实现整体和谐。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 偏序集，任意两元素有上确界和下确界。</p>
            <p><strong>核心思想:</strong> 层次关系与统一框架。</p>
            <p><strong>社会意义:</strong> 组织管理的层级制度。</p>
        `
    },
    sublattice: {
        name: '子格',
        nameEn: 'Sublattice',
        title: '继承与包含',
        quote: '"得其大者可以兼其小。"',
        author: '— 《孟子》',
        ideology: '子格体现了继承与包含的关系。子格保持了母格的运算封闭性，如同组织中的部门继承总体文化，又保持自身特色。',
        analogy: '如同大组织中的小团队，既服从整体规则，又有相对独立的运作方式。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 子集且对格运算封闭的子结构。</p>
            <p><strong>核心思想:</strong> 继承母格性质的子结构。</p>
            <p><strong>社会意义:</strong> 部分与整体的协调统一。</p>
        `
    },
    homomorphism: {
        name: '格同态',
        nameEn: 'Lattice Homomorphism',
        title: '结构保持',
        quote: '"形神兼备，结构相通。"',
        author: '— 中国书法艺术',
        ideology: '格同态体现了结构保持的映射关系。不同格之间虽有差异，但通过同态映射保持了本质的运算结构，如同不同地区的组织虽有地域差异，但保持统一的管理模式。',
        analogy: '如同总部与分公司的关系，分公司虽独立运作，但保持与总部一致的管理结构和运作模式。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 保持格运算的映射 f(a∨b)=f(a)∨f(b)。</p>
            <p><strong>核心思想:</strong> 保持结构的对应关系。</p>
            <p><strong>社会意义:</strong> 统一模式的推广复制。</p>
        `
    }
};

// Example Lattices
const LATTICES = {
    b2: {
        name: 'B₂',
        fullName: '4元布尔格',
        order: 4,
        type: '布尔格',
        features: '有补、分配',
        elements: ['⊥', 'a', 'b', '⊤'],
        positions: {
            '⊥': { x: 250, y: 320 },
            'a': { x: 180, y: 220 },
            'b': { x: 320, y: 220 },
            '⊤': { x: 250, y: 120 }
        },
        order_relation: [
            ['⊥', 'a'], ['⊥', 'b'],
            ['a', '⊤'], ['b', '⊤']
        ],
        join: (x, y) => {
            const table = {
                '⊥': { '⊥': '⊥', 'a': 'a', 'b': 'b', '⊤': '⊤' },
                'a': { '⊥': 'a', 'a': 'a', 'b': '⊤', '⊤': '⊤' },
                'b': { '⊥': 'b', 'a': '⊤', 'b': 'b', '⊤': '⊤' },
                '⊤': { '⊥': '⊤', 'a': '⊤', 'b': '⊤', '⊤': '⊤' }
            };
            return table[x][y];
        },
        meet: (x, y) => {
            const table = {
                '⊥': { '⊥': '⊥', 'a': '⊥', 'b': '⊥', '⊤': '⊥' },
                'a': { '⊥': '⊥', 'a': 'a', 'b': '⊥', '⊤': 'a' },
                'b': { '⊥': '⊥', 'a': '⊥', 'b': 'b', '⊤': 'b' },
                '⊤': { '⊥': '⊥', 'a': 'a', 'b': 'b', '⊤': '⊤' }
            };
            return table[x][y];
        }
    },
    d4: {
        name: 'D₄',
        fullName: '4的除数格',
        order: 3,
        type: '链格',
        features: '全序、分配',
        elements: ['1', '2', '4'],
        positions: {
            '1': { x: 250, y: 300 },
            '2': { x: 250, y: 200 },
            '4': { x: 250, y: 100 }
        },
        order_relation: [
            ['1', '2'], ['2', '4']
        ],
        join: (x, y) => {
            const order = { '1': 0, '2': 1, '4': 2 };
            return order[x] >= order[y] ? x : y;
        },
        meet: (x, y) => {
            const order = { '1': 0, '2': 1, '4': 2 };
            return order[x] <= order[y] ? x : y;
        }
    },
    chain: {
        name: 'C₄',
        fullName: '4元链格',
        order: 4,
        type: '全序格',
        features: '全序、分配',
        elements: ['0', '1', '2', '3'],
        positions: {
            '0': { x: 250, y: 320 },
            '1': { x: 250, y: 240 },
            '2': { x: 250, y: 160 },
            '3': { x: 250, y: 80 }
        },
        order_relation: [
            ['0', '1'], ['1', '2'], ['2', '3']
        ],
        join: (x, y) => Math.max(parseInt(x), parseInt(y)).toString(),
        meet: (x, y) => Math.min(parseInt(x), parseInt(y)).toString()
    },
    diamond: {
        name: 'M₃',
        fullName: '菱形格',
        order: 5,
        type: '模格',
        features: '模格、非分配',
        elements: ['0', 'a', 'b', 'c', '1'],
        positions: {
            '0': { x: 250, y: 340 },
            'a': { x: 150, y: 220 },
            'b': { x: 250, y: 220 },
            'c': { x: 350, y: 220 },
            '1': { x: 250, y: 100 }
        },
        order_relation: [
            ['0', 'a'], ['0', 'b'], ['0', 'c'],
            ['a', '1'], ['b', '1'], ['c', '1']
        ],
        join: (x, y) => {
            if (x === y) return x;
            if (x === '0') return y;
            if (y === '0') return x;
            return '1';
        },
        meet: (x, y) => {
            if (x === y) return x;
            if (x === '1') return y;
            if (y === '1') return x;
            return '0';
        }
    }
};

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
    mainSubtitle.textContent = data.nameEn;
    quoteText.textContent = data.quote;
    quoteAuthor.textContent = data.author;
    ideologyTitle.textContent = data.title;
    ideologyText.textContent = data.ideology;
    analogyText.textContent = data.analogy;

    // 根据类型更新可视化
    const lattice = LATTICES[currentExample];
    if (type === 'lattice') {
        renderLattice(lattice);
    } else if (type === 'sublattice') {
        renderSublattice(lattice);
    } else if (type === 'homomorphism') {
        renderHomomorphism(lattice);
    }
}

// Update Example
function updateExample(exampleId) {
    currentExample = exampleId;
    const lattice = LATTICES[exampleId];

    orderValue.textContent = lattice.order;
    propertyValue.textContent = lattice.type;
    featuresValue.textContent = lattice.features;

    renderElementSelector(lattice);
    renderLattice(lattice);

    selectedElements = [];
    joinResult.textContent = '选择两个元素';
    meetResult.textContent = '选择两个元素';
    resultDisplay.innerHTML = '<p style="color: var(--text-secondary);">💡 选择两个元素查看上确界和下确界</p>';
}

// Render Element Selector
function renderElementSelector(lattice) {
    elementSelector.innerHTML = '';
    lattice.elements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';
        div.textContent = el;
        div.dataset.value = el;
        div.addEventListener('click', () => selectElement(el, lattice));
        elementSelector.appendChild(div);
    });
}

// Render Lattice Structure
function renderLattice(lattice) {
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';

    // Draw edges first (so they appear behind nodes)
    lattice.order_relation.forEach(([from, to]) => {
        const pos1 = lattice.positions[from];
        const pos2 = lattice.positions[to];

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', pos1.x);
        line.setAttribute('y1', pos1.y);
        line.setAttribute('x2', pos2.x);
        line.setAttribute('y2', pos2.y);
        line.setAttribute('class', 'lattice-edge covering');
        edgesGroup.appendChild(line);
    });

    // Draw nodes
    lattice.elements.forEach(el => {
        const pos = lattice.positions[el];

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'lattice-node');
        g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
        g.setAttribute('data-element', el);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', 25);
        circle.setAttribute('fill', 'var(--lattice-blue)');
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', 2);
        circle.setAttribute('filter', 'url(#glow)');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'node-label');
        text.setAttribute('y', 5);
        text.textContent = el;

        g.appendChild(circle);
        g.appendChild(text);
        nodesGroup.appendChild(g);

    });
}

// Render Sublattice (高亮子格)
function renderSublattice(lattice) {
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';

    // 定义子格（根据不同格选择合适的子集）
    let sublatticeElements = [];
    if (lattice.name === 'B₂') {
        sublatticeElements = ['⊥', 'a', '⊤']; // {⊥, a, ⊤}是一个子格
    } else if (lattice.name === 'M₃') {
        sublatticeElements = ['0', 'a', '1']; // {0, a, 1}是一个链子格
    } else if (lattice.name === 'C₄') {
        sublatticeElements = ['0', '1', '2']; // 前三个元素
    } else {
        sublatticeElements = lattice.elements.slice(0, Math.ceil(lattice.elements.length / 2));
    }

    // Draw all edges (dimmed for non-sublattice)
    lattice.order_relation.forEach(([from, to]) => {
        const pos1 = lattice.positions[from];
        const pos2 = lattice.positions[to];

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', pos1.x);
        line.setAttribute('y1', pos1.y);
        line.setAttribute('x2', pos2.x);
        line.setAttribute('y2', pos2.y);

        // 子格内的边高亮
        if (sublatticeElements.includes(from) && sublatticeElements.includes(to)) {
            line.setAttribute('class', 'lattice-edge covering');
            line.setAttribute('stroke', 'var(--sublattice-green)');
            line.setAttribute('stroke-width', '4');
        } else {
            line.setAttribute('class', 'lattice-edge');
            line.setAttribute('opacity', '0.2');
        }
        edgesGroup.appendChild(line);
    });

    // Draw nodes
    lattice.elements.forEach(el => {
        const pos = lattice.positions[el];

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'lattice-node');
        g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
        g.setAttribute('data-element', el);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', 2);
        circle.setAttribute('filter', 'url(#glow)');

        // 子格元素高亮
        if (sublatticeElements.includes(el)) {
            circle.setAttribute('fill', 'var(--sublattice-green)');
            circle.setAttribute('r', 30);
        } else {
            circle.setAttribute('fill', '#ccc');
            circle.setAttribute('r', 25);
            circle.setAttribute('opacity', '0.5');
        }

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'node-label');
        text.setAttribute('y', 5);
        text.textContent = el;

        g.appendChild(circle);
        g.appendChild(text);
        nodesGroup.appendChild(g);

        g.addEventListener('click', () => selectElement(el, lattice));
    });

    // 添加子格标注
    const sublatticeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    sublatticeLabel.setAttribute('x', 250);
    sublatticeLabel.setAttribute('y', 370);
    sublatticeLabel.setAttribute('text-anchor', 'middle');
    sublatticeLabel.setAttribute('fill', 'var(--sublattice-green)');
    sublatticeLabel.setAttribute('font-size', '14');
    sublatticeLabel.setAttribute('font-weight', 'bold');
    sublatticeLabel.textContent = `子格: {${sublatticeElements.join(', ')}}`;
    nodesGroup.appendChild(sublatticeLabel);
}

// Render Homomorphism (显示格同态映射)
function renderHomomorphism(lattice) {
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';

    // 创建两个并排的格：源格和目标格
    const sourceOffset = -120;
    const targetOffset = 120;

    // 绘制源格（左侧）
    lattice.order_relation.forEach(([from, to]) => {
        const pos1 = { x: lattice.positions[from].x + sourceOffset, y: lattice.positions[from].y };
        const pos2 = { x: lattice.positions[to].x + sourceOffset, y: lattice.positions[to].y };

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', pos1.x);
        line.setAttribute('y1', pos1.y);
        line.setAttribute('x2', pos2.x);
        line.setAttribute('y2', pos2.y);
        line.setAttribute('class', 'lattice-edge covering');
        edgesGroup.appendChild(line);
    });

    // 绘制目标格（右侧）
    lattice.order_relation.forEach(([from, to]) => {
        const pos1 = { x: lattice.positions[from].x + targetOffset, y: lattice.positions[from].y };
        const pos2 = { x: lattice.positions[to].x + targetOffset, y: lattice.positions[to].y };

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', pos1.x);
        line.setAttribute('y1', pos1.y);
        line.setAttribute('x2', pos2.x);
        line.setAttribute('y2', pos2.y);
        line.setAttribute('class', 'lattice-edge covering');
        edgesGroup.appendChild(line);
    });

    // 绘制同态映射箭头（虚线）
    lattice.elements.forEach(el => {
        const posSource = { x: lattice.positions[el].x + sourceOffset, y: lattice.positions[el].y };
        const posTarget = { x: lattice.positions[el].x + targetOffset, y: lattice.positions[el].y };

        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        arrow.setAttribute('x1', posSource.x + 25);
        arrow.setAttribute('y1', posSource.y);
        arrow.setAttribute('x2', posTarget.x - 25);
        arrow.setAttribute('y2', posTarget.y);
        arrow.setAttribute('stroke', 'var(--homomorphism-purple)');
        arrow.setAttribute('stroke-width', '2');
        arrow.setAttribute('stroke-dasharray', '5,5');
        arrow.setAttribute('opacity', '0.6');
        arrow.setAttribute('marker-end', 'url(#arrowRed)');
        edgesGroup.appendChild(arrow);
    });

    // 绘制源格节点
    lattice.elements.forEach(el => {
        const pos = { x: lattice.positions[el].x + sourceOffset, y: lattice.positions[el].y };

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'lattice-node');
        g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
        g.setAttribute('data-element', el);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', 25);
        circle.setAttribute('fill', 'var(--lattice-blue)');
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', 2);
        circle.setAttribute('filter', 'url(#glow)');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'node-label');
        text.setAttribute('y', 5);
        text.textContent = el;

        g.appendChild(circle);
        g.appendChild(text);
        nodesGroup.appendChild(g);
    });

    // 绘制目标格节点
    lattice.elements.forEach(el => {
        const pos = { x: lattice.positions[el].x + targetOffset, y: lattice.positions[el].y };

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'lattice-node');
        g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
        g.setAttribute('data-element', el + "'");

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', 25);
        circle.setAttribute('fill', 'var(--homomorphism-purple)');
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', 2);
        circle.setAttribute('filter', 'url(#glow)');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'node-label');
        text.setAttribute('y', 5);
        text.textContent = el + "'";

        g.appendChild(circle);
        g.appendChild(text);
        nodesGroup.appendChild(g);
    });

    // 添加标签
    const sourceLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    sourceLabel.setAttribute('x', 130 + sourceOffset);
    sourceLabel.setAttribute('y', 50);
    sourceLabel.setAttribute('text-anchor', 'middle');
    sourceLabel.setAttribute('fill', 'var(--lattice-blue)');
    sourceLabel.setAttribute('font-size', '16');
    sourceLabel.setAttribute('font-weight', 'bold');
    sourceLabel.textContent = '源格 L';
    nodesGroup.appendChild(sourceLabel);

    const targetLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    targetLabel.setAttribute('x', 130 + targetOffset);
    targetLabel.setAttribute('y', 50);
    targetLabel.setAttribute('text-anchor', 'middle');
    targetLabel.setAttribute('fill', 'var(--homomorphism-purple)');
    targetLabel.setAttribute('font-size', '16');
    targetLabel.setAttribute('font-weight', 'bold');
    targetLabel.textContent = "目标格 L'";
    nodesGroup.appendChild(targetLabel);

    const mappingLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    mappingLabel.setAttribute('x', 250);
    mappingLabel.setAttribute('y', 370);
    mappingLabel.setAttribute('text-anchor', 'middle');
    mappingLabel.setAttribute('fill', 'var(--homomorphism-purple)');
    mappingLabel.setAttribute('font-size', '14');
    mappingLabel.setAttribute('font-weight', 'bold');
    mappingLabel.textContent = '同态映射 f: L → L\'';
    nodesGroup.appendChild(mappingLabel);
}

// Select Element
function selectElement(element, lattice) {
    selectedElements.push(element);

    document.querySelectorAll('.element-item').forEach(item => {
        item.classList.remove('selected');
    });

    if (selectedElements.length === 1) {
        document.querySelector(`[data-value="${element}"]`).classList.add('selected');
        highlightNode(element, 'var(--accent-gold)');
        resultDisplay.innerHTML = `<p>已选择: <strong style="color: var(--accent-red);">${element}</strong></p><p>再选择一个元素进行运算</p>`;
    } else if (selectedElements.length === 2) {
        const [a, b] = selectedElements;
        const join_result = lattice.join(a, b);
        const meet_result = lattice.meet(a, b);

        showOperationDetail(a, b, join_result, meet_result);
        highlightOperation(a, b, join_result, meet_result);

        selectedElements = [];
    }
}

function showOperationDetail(a, b, join_result, meet_result) {
    joinResult.textContent = `${a} ∨ ${b} = ${join_result}`;
    meetResult.textContent = `${a} ∧ ${b} = ${meet_result}`;

    resultDisplay.innerHTML = `
        <p style="font-size: 1rem; margin-bottom: 10px;">
            <strong style="color: var(--accent-red);">${a}</strong> 和 
            <strong style="color: var(--accent-red);">${b}</strong>
        </p>
        <p style="font-size: 0.9rem; color: var(--lattice-blue);">
            上确界（Join）: <strong>${join_result}</strong>
        </p>
        <p style="font-size: 0.9rem; color: var(--sublattice-green);">
            下确界（Meet）: <strong>${meet_result}</strong>
        </p>
    `;
}

function highlightNode(element, color) {
    document.querySelectorAll('.lattice-node').forEach(node => {
        const circle = node.querySelector('circle');
        if (node.dataset.element === element) {
            circle.setAttribute('fill', color);
            circle.setAttribute('r', 30);
        } else {
            circle.setAttribute('fill', 'var(--lattice-blue)');
            circle.setAttribute('r', 25);
        }
    });
}

function highlightOperation(a, b, join_result, meet_result) {
    document.querySelectorAll('.lattice-node').forEach(node => {
        const circle = node.querySelector('circle');
        const el = node.dataset.element;

        if (el === a || el === b) {
            circle.setAttribute('fill', 'var(--accent-red)');
            circle.setAttribute('r', 28);
        } else if (el === join_result) {
            circle.setAttribute('fill', 'var(--lattice-blue)');
            circle.setAttribute('r', 32);
        } else if (el === meet_result) {
            circle.setAttribute('fill', 'var(--sublattice-green)');
            circle.setAttribute('r', 32);
        } else {
            circle.setAttribute('fill', 'var(--lattice-blue)');
            circle.setAttribute('r', 25);
        }
    });
}

// Demonstrate Operation
async function demonstrateOperation() {
    const lattice = LATTICES[currentExample];
    demonstrateBtn.disabled = true;
    demonstrateBtn.textContent = '演示中...';

    const elements = lattice.elements;

    for (let i = 0; i < 3; i++) {
        const a = elements[Math.floor(Math.random() * elements.length)];
        const b = elements[Math.floor(Math.random() * elements.length)];
        const join_result = lattice.join(a, b);
        const meet_result = lattice.meet(a, b);

        showOperationDetail(a, b, join_result, meet_result);
        highlightOperation(a, b, join_result, meet_result);

        await sleep(2000);
    }

    // Reset
    document.querySelectorAll('.lattice-node').forEach(node => {
        node.querySelector('circle').setAttribute('fill', 'var(--lattice-blue)');
        node.querySelector('circle').setAttribute('r', 25);
    });

    joinResult.textContent = '选择两个元素';
    meetResult.textContent = '选择两个元素';
    resultDisplay.innerHTML = '<p style="color: var(--color-abelian);">✓ 演示完成！点击节点探索更多</p>';

    demonstrateBtn.disabled = false;
    demonstrateBtn.textContent = '▶ 演示运算';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event Listeners
typeButtons.forEach(btn => {
    btn.addEventListener('click', () => updateType(btn.dataset.type));
});

exampleSelect.addEventListener('change', (e) => {
    updateExample(e.target.value);
});

demonstrateBtn.addEventListener('click', demonstrateOperation);

resetBtn.addEventListener('click', () => {
    location.reload();
});

// Initialize
window.addEventListener('load', () => {
    updateType('lattice');
    updateExample('b2');
});
