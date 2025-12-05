/**
 * 红色根基 - 树结构可视化
 * Revolutionary Foundation - Tree Structure Visualizer
 */

// DOM Elements
const svg = document.getElementById('treeSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const generateBtn = document.getElementById('generateBtn');
const startTraversal = document.getElementById('startTraversal');
const resetBtn = document.getElementById('resetBtn');
const treeSelect = document.getElementById('treeSelect');
const traversalSelect = document.getElementById('traversalSelect');
const highlightRoot = document.getElementById('highlightRoot');
const highlightParent = document.getElementById('highlightParent');
const highlightLeaf = document.getElementById('highlightLeaf');
const clearHighlight = document.getElementById('clearHighlight');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const nodeCountDisplay = document.getElementById('nodeCount');
const treeHeightDisplay = document.getElementById('treeHeight');
const leafCountDisplay = document.getElementById('leafCount');
const forestCountDisplay = document.getElementById('forestCount');
const traversalList = document.getElementById('traversalList');

// State
let trees = [];  // 支持森林(多棵树)
let allNodes = [];
let isRunning = false;
let shouldStop = false;
let nodeElements = new Map();
let edgeElements = [];

// Constants
const NODE_RADIUS = 26;
const REVOLUTIONARY_LEADERS = [
    "毛泽东", "周恩来", "朱德", "刘少奇", "邓小平",
    "陈云", "彭德怀", "林彪", "刘伯承", "贺龙",
    "陈毅", "罗荣桓", "徐向前", "聂荣臻", "叶剑英"
];

//Tree Node Class
class TreeNode {
    constructor(id, name, x, y) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.children = [];
        this.parent = null;
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDelay() {
    const val = parseInt(speedInput.value);
    return Math.max(100, 1000 - (val * 9));
}

// Tree Generation
function generateTrees() {
    trees = [];
    allNodes = [];
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    nodeElements.clear();
    edgeElements = [];

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;

    const treeType = treeSelect.value;

    switch (treeType) {
        case 'single':
            generateSingleTree(width, height);
            break;
        case 'forest':
            generateForest(width, height);
            break;
        case 'binary':
            generateBinaryTree(width, height);
            break;
        case 'nary':
            generateNaryTree(width, height);
            break;
    }

    renderTree();
    updateStats();
    resetHighlights();
}

// Generate Single Complete Tree
function generateSingleTree(width, height) {
    const root = new TreeNode(0, REVOLUTIONARY_LEADERS[0], width / 2, 80);
    allNodes.push(root);

    buildSubtree(root, width / 2, 80, width * 0.7, 3, 1);
    trees.push(root);
}

// Generate Forest (Multiple Trees)
function generateForest(width, height) {
    const treeCount = 3;
    const spacing = width / (treeCount + 1);

    for (let i = 0; i < treeCount; i++) {
        const x = spacing * (i + 1);
        const root = new TreeNode(allNodes.length, REVOLUTIONARY_LEADERS[allNodes.length % REVOLUTIONARY_LEADERS.length], x, 60);
        allNodes.push(root);

        buildSubtree(root, x, 60, spacing * 0.6, 2, allNodes.length);
        trees.push(root);
    }
}

// Generate Binary Tree
function generateBinaryTree(width, height) {
    const root = new TreeNode(0, REVOLUTIONARY_LEADERS[0], width / 2, 80);
    allNodes.push(root);

    buildBinarySubtree(root, width / 2, 80, width * 0.4, 4, 1);
    trees.push(root);
}

// Generate N-ary Tree
function generateNaryTree(width, height) {
    const root = new TreeNode(0, REVOLUTIONARY_LEADERS[0], width / 2, 80);
    allNodes.push(root);

    buildSubtree(root, width / 2, 80, width * 0.75, 2, 1, 4);
    trees.push(root);
}

// Build Subtree Recursively
function buildSubtree(parent, x, y, horizSpread, depth, startId, maxChildren = 3) {
    if (depth === 0) return startId;

    const childCount = Math.floor(Math.random() * maxChildren) + 1;
    const levelHeight = 120;
    const childY = y + levelHeight;

    const totalWidth = horizSpread;
    const startX = x - totalWidth / 2;
    const spacing = totalWidth / (childCount + 1);

    let currentId = startId;

    for (let i = 0; i < childCount; i++) {
        const childX = startX + spacing * (i + 1);
        const child = new TreeNode(currentId, REVOLUTIONARY_LEADERS[currentId % REVOLUTIONARY_LEADERS.length], childX, childY);
        child.parent = parent;
        parent.children.push(child);
        allNodes.push(child);
        currentId++;

        currentId = buildSubtree(child, childX, childY, totalWidth / (childCount + 1), depth - 1, currentId, maxChildren);
    }

    return currentId;
}

// Build Binary Subtree
function buildBinarySubtree(parent, x, y, horizSpread, depth, startId) {
    if (depth === 0) return startId;

    const levelHeight = 100;
    const childY = y + levelHeight;

    let currentId = startId;

    // Left child
    if (Math.random() > 0.2) {
        const leftX = x - horizSpread / 2;
        const left = new TreeNode(currentId, REVOLUTIONARY_LEADERS[currentId % REVOLUTIONARY_LEADERS.length], leftX, childY);
        left.parent = parent;
        parent.children.push(left);
        allNodes.push(left);
        currentId++;

        currentId = buildBinarySubtree(left, leftX, childY, horizSpread / 2, depth - 1, currentId);
    }

    // Right child
    if (Math.random() > 0.2) {
        const rightX = x + horizSpread / 2;
        const right = new TreeNode(currentId, REVOLUTIONARY_LEADERS[currentId % REVOLUTIONARY_LEADERS.length], rightX, childY);
        right.parent = parent;
        parent.children.push(right);
        allNodes.push(right);
        currentId++;

        currentId = buildBinarySubtree(right, rightX, childY, horizSpread / 2, depth - 1, currentId);
    }

    return currentId;
}

// Rendering
function renderTree() {
    // Render edges first
    allNodes.forEach(node => {
        node.children.forEach(child => {
            const line = createSVGElement('line', {
                x1: node.x, y1: node.y,
                x2: child.x, y2: child.y,
                class: 'tree-edge'
            });
            edgesGroup.appendChild(line);
            edgeElements.push({ line, from: node.id, to: child.id });
        });
    });

    // Render nodes
    allNodes.forEach(node => {
        const g = createSVGElement('g', {
            class: 'tree-node',
            transform: `translate(${node.x}, ${node.y})`,
            'data-id': node.id
        });

        // Determine node type class
        if (node.isRoot()) {
            g.classList.add('root');
        } else if (node.isLeaf()) {
            g.classList.add('leaf');
        } else {
            g.classList.add('parent');
        }

        const circle = createSVGElement('circle', {
            r: NODE_RADIUS,
            class: 'tree-node-circle'
        });

        const text = createSVGElement('text', {
            class: 'tree-node-text',
            'text-anchor': 'middle',
            'dy': '.35em'
        });
        text.textContent = node.name;

        g.appendChild(circle);
        g.appendChild(text);
        nodesGroup.appendChild(g);
        nodeElements.set(node.id, g);
    });
}

// Update Stats
function updateStats() {
    nodeCountDisplay.textContent = allNodes.length;
    forestCountDisplay.textContent = trees.length;

    const leafNodes = allNodes.filter(node => node.isLeaf());
    leafCountDisplay.textContent = leafNodes.length;

    let maxHeight = 0;
    trees.forEach(root => {
        maxHeight = Math.max(maxHeight, getTreeHeight(root));
    });
    treeHeightDisplay.textContent = maxHeight;
}

function getTreeHeight(node) {
    if (node.isLeaf()) return 0;

    let maxChildHeight = 0;
    node.children.forEach(child => {
        maxChildHeight = Math.max(maxChildHeight, getTreeHeight(child));
    });

    return maxChildHeight + 1;
}

// Highlight Functions
function highlightRootNodes() {
    resetHighlights();
    trees.forEach(root => {
        const el = nodeElements.get(root.id);
        el.classList.add('root');
    });
    statusText.textContent = `高亮根节点: ${trees.length}个`;
}

function highlightParentNodes() {
    resetHighlights();
    let count = 0;
    allNodes.forEach(node => {
        if (!node.isRoot() && !node.isLeaf()) {
            const el = nodeElements.get(node.id);
            el.classList.add('parent');
            count++;
        }
    });
    statusText.textContent = `高亮父节点: ${count}个`;
}

function highlightLeafNodes() {
    resetHighlights();
    let count = 0;
    allNodes.forEach(node => {
        if (node.isLeaf()) {
            const el = nodeElements.get(node.id);
            el.classList.add('leaf');
            count++;
        }
    });
    statusText.textContent = `高亮叶节点: ${count}个`;
}

function resetHighlights() {
    allNodes.forEach(node => {
        const el = nodeElements.get(node.id);
        el.className = 'tree-node';

        if (node.isRoot()) {
            el.classList.add('root');
        } else if (node.isLeaf()) {
            el.classList.add('leaf');
        } else {
            el.classList.add('parent');
        }
    });
}

function clearTraversalDisplay() {
    traversalList.innerHTML = '';
}

function addToTraversal(node) {
    const item = document.createElement('div');
    item.className = 'traversal-item';
    item.textContent = node.name;
    traversalList.appendChild(item);
}

// Traversal Algorithms
async function runTraversal() {
    if (isRunning) return;

    isRunning = true;
    shouldStop = false;
    startTraversal.disabled = true;
    generateBtn.disabled = true;

    resetHighlights();
    clearTraversalDisplay();

    const traversalType = traversalSelect.value;

    for (const root of trees) {
        switch (traversalType) {
            case 'preorder':
                await preorderTraversal(root);
                break;
            case 'inorder':
                await inorderTraversal(root);
                break;
            case 'postorder':
                await postorderTraversal(root);
                break;
            case 'levelorder':
                await levelorderTraversal(root);
                break;
        }
    }

    if (!shouldStop) {
        statusText.textContent = '遍历完成!';
    }

    isRunning = false;
    startTraversal.disabled = false;
    generateBtn.disabled = false;
}

// Preorder: Root -> Left -> Right
async function preorderTraversal(node) {
    if (shouldStop || !node) return;

    // Visit root first
    const el = nodeElements.get(node.id);
    el.classList.add('current');
    statusText.textContent = `前序遍历: 访问 ${node.name}`;
    addToTraversal(node);
    await sleep(getDelay());

    el.classList.remove('current');
    el.classList.add('visited');

    // Then children
    for (const child of node.children) {
        await preorderTraversal(child);
    }
}

// Inorder: Left -> Root -> Right (for binary trees)
async function inorderTraversal(node) {
    if (shouldStop || !node) return;

    // Visit left child first
    if (node.children[0]) {
        await inorderTraversal(node.children[0]);
    }

    // Visit root
    const el = nodeElements.get(node.id);
    el.classList.add('current');
    statusText.textContent = `中序遍历: 访问 ${node.name}`;
    addToTraversal(node);
    await sleep(getDelay());

    el.classList.remove('current');
    el.classList.add('visited');

    // Visit remaining children
    for (let i = 1; i < node.children.length; i++) {
        await inorderTraversal(node.children[i]);
    }
}

// Postorder: Left -> Right -> Root
async function postorderTraversal(node) {
    if (shouldStop || !node) return;

    // Visit children first
    for (const child of node.children) {
        await postorderTraversal(child);
    }

    // Then visit root
    const el = nodeElements.get(node.id);
    el.classList.add('current');
    statusText.textContent = `后序遍历: 访问 ${node.name}`;
    addToTraversal(node);
    await sleep(getDelay());

    el.classList.remove('current');
    el.classList.add('visited');
}

// Level-order: BFS
async function levelorderTraversal(root) {
    if (shouldStop || !root) return;

    const queue = [root];

    while (queue.length > 0 && !shouldStop) {
        const node = queue.shift();

        const el = nodeElements.get(node.id);
        el.classList.add('current');
        statusText.textContent = `层序遍历: 访问 ${node.name}`;
        addToTraversal(node);
        await sleep(getDelay());

        el.classList.remove('current');
        el.classList.add('visited');

        // Add children to queue
        node.children.forEach(child => queue.push(child));
    }
}

// Event Listeners
treeSelect.addEventListener('change', generateTrees);
generateBtn.addEventListener('click', generateTrees);

highlightRoot.addEventListener('click', highlightRootNodes);
highlightParent.addEventListener('click', highlightParentNodes);
highlightLeaf.addEventListener('click', highlightLeafNodes);
clearHighlight.addEventListener('click', () => {
    resetHighlights();
    statusText.textContent = '清除高亮';
});

startTraversal.addEventListener('click', runTraversal);

resetBtn.addEventListener('click', () => {
    shouldStop = true;
    setTimeout(() => {
        isRunning = false;
        resetHighlights();
        clearTraversalDisplay();
        startTraversal.disabled = false;
        generateBtn.disabled = false;
        statusText.textContent = '已重置';
    }, 100);
});

// Init
window.addEventListener('load', () => {
    generateTrees();
});
