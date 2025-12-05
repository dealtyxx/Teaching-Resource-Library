/**
 * 红色谱系 - 二叉树类型可视化
 * Revolutionary Lineage - Binary Tree Types Visualizer
 */

// DOM Elements
const svg = document.getElementById('treeSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const treeTypeSelect = document.getElementById('treeTypeSelect');
const nodeCount = document.getElementById('nodeCount');
const nodeCountValue = document.getElementById('nodeCountValue');
const mAryControl = document.getElementById('mAryControl');
const mCount = document.getElementById('mCount');
const mValue = document.getElementById('mValue');
const generateBtn = document.getElementById('generateBtn');
const randomBtn = document.getElementById('randomBtn');
const resetBtn = document.getElementById('resetBtn');
const statusText = document.getElementById('statusText');
const nodeCountDisplay = document.getElementById('nodeCountDisplay');
const treeHeight = document.getElementById('treeHeight');
const leafCount = document.getElementById('leafCount');
const degreeDisplay = document.getElementById('degreeDisplay');
const maxDegree = document.getElementById('maxDegree');
const typeBadgeText = document.getElementById('typeBadgeText');
const typeDescription = document.getElementById('typeDescription');

// State
let nodes = [];
let edges = [];
let nodeElements = new Map();
let currentTreeType = 'binary';

// Constants
const NODE_RADIUS = 26;
const LEVEL_HEIGHT = 90;
const REVOLUTIONARY_SITES = [
    "上海", "嘉兴", "南昌", "井冈山", "瑞金", "遵义",
    "延安", "西柏坡", "北京", "深圳", "浦东", "雄安", "杭州", "武汉", "长沙"
];

// Tree Type Descriptions
const TREE_DESCRIPTIONS = {
    directed: { title: "有向树", desc: "有明确方向的树结构" },
    rooted: { title: "根树", desc: "以一个节点为根的树" },
    binary: { title: "二叉树", desc: "每个节点最多两个子节点" },
    complete: { title: "完全二叉树", desc: "除最后一层外都是满的" },
    "m-ary": { title: "完全m叉树", desc: "每个节点最多m个子节点" },
    proper: { title: "正则二叉树", desc: "每个节点0或2个子节点" },
    weighted: { title: "带权二叉树", desc: "节点带有权重值" }
};

// Tree Node Class
class TreeNode {
    constructor(id, name, weight = null) {
        this.id = id;
        this.name = name;
        this.weight = weight;
        this.children = [];
        this.parent = null;
        this.x = 0;
        this.y = 0;
    }

    isLeaf() {
        return this.children.length === 0;
    }

    isRoot() {
        return this.parent === null;
    }
}

// Helper Functions
function createSVGElement(type, attributes = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    return el;
}

// Generate Trees
function generateTree() {
    nodes = [];
    edges = [];
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    nodeElements.clear();

    const type = currentTreeType;
    const n = parseInt(nodeCount.value);

    switch (type) {
        case 'directed':
            generateDirectedTree(n);
            break;
        case 'rooted':
            generateRootedTree(n);
            break;
        case 'binary':
            generateBinaryTree(n);
            break;
        case 'complete':
            generateCompleteTree(n);
            break;
        case 'm-ary':
            generateMAryTree(n);
            break;
        case 'proper':
            generateProperBinaryTree(n);
            break;
        case 'weighted':
            generateWeightedTree(n);
            break;
    }

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;
    calculatePositions(nodes[0], width / 2, 80, width * 0.4);

    renderTree();
    updateStats();
}

// Generate Directed Tree
function generateDirectedTree(n) {
    const root = new TreeNode(0, REVOLUTIONARY_SITES[0]);
    nodes.push(root);

    buildRandomTree(root, n - 1, 1);
    statusText.textContent = '有向树: 边都有明确的方向';
}

// Generate Rooted Tree
function generateRootedTree(n) {
    const root = new TreeNode(0, REVOLUTIONARY_SITES[0]);
    nodes.push(root);

    buildRandomTree(root, n - 1, 1);
    statusText.textContent = '根树: 以根节点为起点的树';
}

// Generate Binary Tree
function generateBinaryTree(n) {
    const root = new TreeNode(0, REVOLUTIONARY_SITES[0]);
    nodes.push(root);

    buildBinaryTree(root, n - 1, 1);
    statusText.textContent = '二叉树: 每个节点最多2个子节点';
}

// Generate Complete Binary Tree
function generateCompleteTree(n) {
    // Use level-order construction
    for (let i = 0; i < n; i++) {
        const node = new TreeNode(i, REVOLUTIONARY_SITES[i % REVOLUTIONARY_SITES.length]);
        nodes.push(node);

        if (i > 0) {
            const parentIdx = Math.floor((i - 1) / 2);
            node.parent = nodes[parentIdx];
            nodes[parentIdx].children.push(node);
            edges.push({ from: parentIdx, to: i });
        }
    }

    statusText.textContent = '完全二叉树: 除最后一层外,所有层都填满';
}

// Generate M-ary Tree
function generateMAryTree(n) {
    const m = parseInt(mCount.value);

    for (let i = 0; i < n; i++) {
        const node = new TreeNode(i, REVOLUTIONARY_SITES[i % REVOLUTIONARY_SITES.length]);
        nodes.push(node);

        if (i > 0) {
            const parentIdx = Math.floor((i - 1) / m);
            node.parent = nodes[parentIdx];
            nodes[parentIdx].children.push(node);
            edges.push({ from: parentIdx, to: i });
        }
    }

    statusText.textContent = `完全${m}叉树: 每个节点最多${m}个子节点`;
}

// Generate Proper Binary Tree
function generateProperBinaryTree(n) {
    const root = new TreeNode(0, REVOLUTIONARY_SITES[0]);
    nodes.push(root);

    buildProperTree(root, n - 1, 1);
    statusText.textContent = '正则二叉树(满二叉树): 每个节点0或2个子节点';
}

// Generate Weighted Tree
function generateWeightedTree(n) {
    const root = new TreeNode(0, REVOLUTIONARY_SITES[0], Math.floor(Math.random() * 20) + 1);
    nodes.push(root);

    buildWeightedTree(root, n - 1, 1);
    statusText.textContent = '带权二叉树: 节点带有权重值';
}

// Helper: Build Random Tree
function buildRandomTree(parent, remaining, startId) {
    if (remaining <= 0) return startId;

    const childCount = Math.min(Math.floor(Math.random() * 3) + 1, remaining);
    let currentId = startId;

    for (let i = 0; i < childCount; i++) {
        const child = new TreeNode(currentId, REVOLUTIONARY_SITES[currentId % REVOLUTIONARY_SITES.length]);
        child.parent = parent;
        parent.children.push(child);
        nodes.push(child);
        edges.push({ from: parent.id, to: child.id });
        currentId++;

        if (currentId - startId < remaining) {
            const allocated = Math.floor((remaining - (currentId - startId)) / (childCount - i));
            currentId = buildRandomTree(child, allocated, currentId);
        }
    }

    return currentId;
}

// Helper: Build Binary Tree
function buildBinaryTree(parent, remaining, startId) {
    if (remaining <= 0) return startId;

    const childCount = Math.min(Math.floor(Math.random() * 2) + 1, remaining, 2);
    let currentId = startId;

    for (let i = 0; i < childCount; i++) {
        const child = new TreeNode(currentId, REVOLUTIONARY_SITES[currentId % REVOLUTIONARY_SITES.length]);
        child.parent = parent;
        parent.children.push(child);
        nodes.push(child);
        edges.push({ from: parent.id, to: child.id });
        currentId++;

        if (currentId - startId < remaining) {
            const allocated = Math.floor((remaining - (currentId - startId)) / (childCount - i));
            currentId = buildBinaryTree(child, allocated, currentId);
        }
    }

    return currentId;
}

// Helper: Build Proper Tree (每个节点0或2个子节点)
function buildProperTree(parent, remaining, startId) {
    if (remaining <= 0 || remaining < 2) return startId;

    let currentId = startId;

    // Always add 2 children for proper binary tree
    for (let i = 0; i < 2; i++) {
        const child = new TreeNode(currentId, REVOLUTIONARY_SITES[currentId % REVOLUTIONARY_SITES.length]);
        child.parent = parent;
        parent.children.push(child);
        nodes.push(child);
        edges.push({ from: parent.id, to: child.id });
        currentId++;
    }

    remaining -= 2;

    if (remaining >= 2) {
        const leftAllocation = Math.floor(remaining / 2);
        currentId = buildProperTree(parent.children[0], leftAllocation, currentId);
        currentId = buildProperTree(parent.children[1], remaining - leftAllocation, currentId);
    }

    return currentId;
}

// Helper: Build Weighted Tree
function buildWeightedTree(parent, remaining, startId) {
    if (remaining <= 0) return startId;

    const childCount = Math.min(Math.floor(Math.random() * 2) + 1, remaining, 2);
    let currentId = startId;

    for (let i = 0; i < childCount; i++) {
        const weight = Math.floor(Math.random() * 20) + 1;
        const child = new TreeNode(currentId, REVOLUTIONARY_SITES[currentId % REVOLUTIONARY_SITES.length], weight);
        child.parent = parent;
        parent.children.push(child);
        nodes.push(child);
        edges.push({ from: parent.id, to: child.id });
        currentId++;

        if (currentId - startId < remaining) {
            const allocated = Math.floor((remaining - (currentId - startId)) / (childCount - i));
            currentId = buildWeightedTree(child, allocated, currentId);
        }
    }

    return currentId;
}

// Calculate Positions
function calculatePositions(node, x, y, spread) {
    if (!node) return;

    node.x = x;
    node.y = y;

    const childCount = node.children.length;
    if (childCount === 0) return;

    const totalWidth = spread * 2;
    const startX = x - totalWidth / 2;
    const spacing = totalWidth / (childCount + 1);

    node.children.forEach((child, i) => {
        const childX = startX + spacing * (i + 1);
        calculatePositions(child, childX, y + LEVEL_HEIGHT, spread / 2);
    });
}

// Render Tree
function renderTree() {
    edges.forEach(edge => {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];

        const line = createSVGElement('line', {
            x1: fromNode.x, y1: fromNode.y,
            x2: toNode.x, y2: toNode.y,
            class: currentTreeType === 'directed' ? 'tree-edge directed' : 'tree-edge'
        });
        edgesGroup.appendChild(line);
    });

    nodes.forEach(node => {
        const g = createSVGElement('g', {
            class: node.isRoot() ? 'tree-node root' : (node.isLeaf() ? 'tree-node leaf' : 'tree-node'),
            transform: `translate(${node.x}, ${node.y})`
        });

        const circle = createSVGElement('circle', {
            r: NODE_RADIUS,
            class: 'tree-node-circle'
        });

        const text = createSVGElement('text', {
            class: 'tree-node-text',
            'text-anchor': 'middle',
            'dy': node.weight ? '-0.2em' : '.35em'
        });
        text.textContent = node.name;

        g.appendChild(circle);
        g.appendChild(text);

        // Add weight if exists
        if (node.weight) {
            const weightText = createSVGElement('text', {
                class: 'tree-node-weight',
                'text-anchor': 'middle',
                'dy': '1.2em'
            });
            weightText.textContent = `(${node.weight})`;
            g.appendChild(weightText);
        }

        nodesGroup.appendChild(g);
        nodeElements.set(node.id, g);
    });
}

// Update Stats
function updateStats() {
    nodeCountDisplay.textContent = nodes.length;

    const height = getTreeHeight(nodes[0]);
    treeHeight.textContent = height;

    const leaves = nodes.filter(n => n.isLeaf()).length;
    leafCount.textContent = leaves;

    const maxDeg = Math.max(...nodes.map(n => n.children.length));
    maxDegree.textContent = maxDeg;

    if (currentTreeType === 'm-ary') {
        degreeDisplay.style.display = 'flex';
    } else {
        degreeDisplay.style.display = 'none';
    }
}

function getTreeHeight(node, currentHeight = 0) {
    if (!node || node.children.length === 0) return currentHeight;

    return Math.max(...node.children.map(child => getTreeHeight(child, currentHeight + 1)));
}

// Event Listeners
treeTypeSelect.addEventListener('change', () => {
    currentTreeType = treeTypeSelect.value;

    const info = TREE_DESCRIPTIONS[currentTreeType];
    typeBadgeText.textContent = info.title;
    typeDescription.textContent = info.desc;

    if (currentTreeType === 'm-ary') {
        mAryControl.style.display = 'flex';
    } else {
        mAryControl.style.display = 'none';
    }

    generateTree();
});

nodeCount.addEventListener('input', () => {
    nodeCountValue.textContent = nodeCount.value;
});

mCount.addEventListener('input', () => {
    mValue.textContent = mCount.value;
});

generateBtn.addEventListener('click', generateTree);

randomBtn.addEventListener('click', () => {
    const types = ['directed', 'rooted', 'binary', 'complete', 'm-ary', 'proper', 'weighted'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    treeTypeSelect.value = randomType;
    treeTypeSelect.dispatchEvent(new Event('change'));
});

resetBtn.addEventListener('click', () => {
    nodes = [];
    edges = [];
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    nodeElements.clear();

    nodeCountDisplay.textContent = '0';
    treeHeight.textContent = '0';
    leafCount.textContent = '0';
    maxDegree.textContent = '0';

    statusText.textContent = '已重置';
});

// Init
window.addEventListener('load', () => {
    const info = TREE_DESCRIPTIONS[currentTreeType];
    typeBadgeText.textContent = info.title;
    typeDescription.textContent = info.desc;

    generateTree();
});
