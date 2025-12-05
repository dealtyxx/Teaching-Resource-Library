/**
 * 红色密码 - 哈夫曼编码可视化
 * Revolutionary Code - Huffman Encoding Visualizer
 */

// DOM Elements
const svg = document.getElementById('treeSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const messageSelect = document.getElementById('messageSelect');
const customTextGroup = document.getElementById('customTextGroup');
const customText = document.getElementById('customText');
const buildBtn = document.getElementById('buildBtn');
const encodeBtn = document.getElementById('encodeBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const charCount = document.getElementById('charCount');
const totalChars = document.getElementById('totalChars');
const originalBits = document.getElementById('originalBits');
const compressedBits = document.getElementById('compressedBits');
const compressionRatio = document.getElementById('compressionRatio');
const codeTable = document.getElementById('codeTable');

// State
let huffmanTree = null;
let huffmanCodes = new Map();
let frequencyMap = new Map();
let text = '';
let isBuilding = false;

// Constants
const NODE_RADIUS = 30;
const LEVEL_HEIGHT = 100;

const SLOGANS = {
    slogan1: '为人民服务',
    slogan2: '星星之火可以燎原',
    slogan3: '实事求是'
};

// Huffman Node Class
class HuffmanNode {
    constructor(char, freq, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
        this.x = 0;
        this.y = 0;
    }

    isLeaf() {
        return this.left === null && this.right === null;
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
    return Math.max(50, 800 - (val * 7));
}

// Build Frequency Map
function buildFrequencyMap(text) {
    const map = new Map();
    for (const char of text) {
        map.set(char, (map.get(char) || 0) + 1);
    }
    return map;
}

// Build Huffman Tree
async function buildHuffmanTree() {
    if (isBuilding) return;

    isBuilding = true;
    buildBtn.disabled = true;
    encodeBtn.disabled = true;

    // Get text
    if (messageSelect.value === 'custom') {
        text = customText.value.trim();
    } else {
        text = SLOGANS[messageSelect.value];
    }

    if (!text) {
        statusText.textContent = '请输入文本!';
        isBuilding = false;
        buildBtn.disabled = false;
        return;
    }

    // Build frequency map
    frequencyMap = buildFrequencyMap(text);

    if (frequencyMap.size === 0) {
        statusText.textContent = '文本为空!';
        isBuilding = false;
        buildBtn.disabled = false;
        return;
    }

    statusText.textContent = '正在构建哈夫曼树...';

    // Create priority queue (min-heap)
    const queue = [];
    for (const [char, freq] of frequencyMap) {
        queue.push(new HuffmanNode(char, freq));
    }

    // Sort queue by frequency
    queue.sort((a, b) => a.freq - b.freq);

    statusText.textContent = `字符频率统计完成,共${queue.length}种字符`;
    await sleep(getDelay());

    // Build tree
    while (queue.length > 1) {
        queue.sort((a, b) => a.freq - b.freq);

        const left = queue.shift();
        const right = queue.shift();

        const parent = new HuffmanNode(null, left.freq + right.freq, left, right);
        queue.push(parent);

        statusText.textContent = `合并节点: ${left.freq} + ${right.freq} = ${parent.freq}`;
        await sleep(getDelay());
    }

    huffmanTree = queue[0];

    // Calculate positions with auto-fit
    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;

    // Calculate tree depth
    const depth = getTreeDepth(huffmanTree);

    // Adjust vertical spacing based on depth
    const levelHeight = depth > 0 ? Math.min(100, (height - 120) / depth) : 100;

    // Adjust horizontal spread based on width
    const initialSpread = Math.min(width * 0.35, 250);

    calculatePositions(huffmanTree, width / 2, 60, initialSpread, levelHeight);

    // Render tree
    renderTree();

    // Generate codes
    generateCodes();

    // Update stats
    updateStats();

    statusText.textContent = '哈夫曼树构建完成!';

    isBuilding = false;
    buildBtn.disabled = false;
    encodeBtn.disabled = false;
}

// Get Tree Depth
function getTreeDepth(node) {
    if (!node) return 0;
    return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
}

// Calculate Tree Positions with dynamic spacing
function calculatePositions(node, x, y, spread, levelHeight) {
    if (!node) return;

    node.x = x;
    node.y = y;

    if (node.left) {
        calculatePositions(node.left, x - spread, y + levelHeight, spread / 2, levelHeight);
    }

    if (node.right) {
        calculatePositions(node.right, x + spread, y + levelHeight, spread / 2, levelHeight);
    }
}

// Render Huffman Tree
function renderTree() {
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';

    if (!huffmanTree) return;

    renderNode(huffmanTree);
}

function renderNode(node) {
    if (!node) return;

    // Render edges first
    if (node.left) {
        const line = createSVGElement('line', {
            x1: node.x, y1: node.y,
            x2: node.left.x, y2: node.left.y,
            class: 'tree-edge left'
        });
        edgesGroup.appendChild(line);

        // Add "0" label
        const midX = (node.x + node.left.x) / 2;
        const midY = (node.y + node.left.y) / 2;
        const label = createSVGElement('text', {
            x: midX - 10, y: midY,
            class: 'edge-label left',
            'text-anchor': 'middle',
            'dy': '.35em'
        });
        label.textContent = '0';
        edgesGroup.appendChild(label);

        renderNode(node.left);
    }

    if (node.right) {
        const line = createSVGElement('line', {
            x1: node.x, y1: node.y,
            x2: node.right.x, y2: node.right.y,
            class: 'tree-edge right'
        });
        edgesGroup.appendChild(line);

        // Add "1" label
        const midX = (node.x + node.right.x) / 2;
        const midY = (node.y + node.right.y) / 2;
        const label = createSVGElement('text', {
            x: midX + 10, y: midY,
            class: 'edge-label right',
            'text-anchor': 'middle',
            'dy': '.35em'
        });
        label.textContent = '1';
        edgesGroup.appendChild(label);

        renderNode(node.right);
    }

    // Render node
    const g = createSVGElement('g', {
        class: node.isLeaf() ? 'tree-node leaf' : 'tree-node',
        transform: `translate(${node.x}, ${node.y})`
    });

    const circle = createSVGElement('circle', {
        r: NODE_RADIUS,
        class: 'tree-node-circle'
    });

    const textEl = createSVGElement('text', {
        class: 'tree-node-text',
        'text-anchor': 'middle',
        'dy': node.isLeaf() ? '.35em' : '-0.2em'
    });
    textEl.textContent = node.isLeaf() ? node.char : node.freq;

    g.appendChild(circle);
    g.appendChild(textEl);

    // Add frequency below for leaf nodes
    if (node.isLeaf()) {
        const freqText = createSVGElement('text', {
            class: 'tree-node-weight',
            'text-anchor': 'middle',
            'dy': '1.3em'
        });
        freqText.textContent = `(${node.freq})`;
        g.appendChild(freqText);
    }

    nodesGroup.appendChild(g);
}

// Generate Huffman Codes
function generateCodes() {
    huffmanCodes = new Map();
    generateCodesRecursive(huffmanTree, '');

    // Display code table
    codeTable.innerHTML = '';
    const sortedCodes = Array.from(huffmanCodes.entries()).sort((a, b) => {
        const freqA = frequencyMap.get(a[0]);
        const freqB = frequencyMap.get(b[0]);
        return freqB - freqA;
    });

    sortedCodes.forEach(([char, code]) => {
        const entry = document.createElement('div');
        entry.className = 'code-entry';

        const charSpan = document.createElement('span');
        charSpan.className = 'code-char';
        charSpan.textContent = `'${char}' (${frequencyMap.get(char)})`;

        const codeSpan = document.createElement('span');
        codeSpan.className = 'code-bits';
        codeSpan.textContent = code;

        entry.appendChild(charSpan);
        entry.appendChild(codeSpan);
        codeTable.appendChild(entry);
    });
}

function generateCodesRecursive(node, code) {
    if (!node) return;

    if (node.isLeaf()) {
        huffmanCodes.set(node.char, code || '0');
        return;
    }

    generateCodesRecursive(node.left, code + '0');
    generateCodesRecursive(node.right, code + '1');
}

// Update Stats
function updateStats() {
    charCount.textContent = frequencyMap.size;
    totalChars.textContent = text.length;

    const bitsPerChar = Math.ceil(Math.log2(frequencyMap.size));
    const original = text.length * bitsPerChar;
    originalBits.textContent = original;

    let compressed = 0;
    for (const char of text) {
        compressed += huffmanCodes.get(char).length;
    }
    compressedBits.textContent = compressed;

    const ratio = ((1 - compressed / original) * 100).toFixed(1);
    compressionRatio.textContent = ratio + '%';
}

// Encode Text
async function encodeText() {
    if (!huffmanTree) {
        statusText.textContent = '请先构建哈夫曼树!';
        return;
    }

    let encoded = '';
    for (const char of text) {
        encoded += huffmanCodes.get(char);
    }

    statusText.textContent = `编码完成! 原文: "${text}"`;
    await sleep(1000);
    statusText.textContent = `编码结果: ${encoded.substring(0, 50)}${encoded.length > 50 ? '...' : ''}`;
}

// Reset
function reset() {
    huffmanTree = null;
    huffmanCodes = new Map();
    frequencyMap = new Map();
    text = '';

    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';
    codeTable.innerHTML = '';

    charCount.textContent = '0';
    totalChars.textContent = '0';
    originalBits.textContent = '0';
    compressedBits.textContent = '0';
    compressionRatio.textContent = '0%';

    statusText.textContent = '已重置';

    encodeBtn.disabled = true;
}

// Event Listeners
messageSelect.addEventListener('change', () => {
    if (messageSelect.value === 'custom') {
        customTextGroup.style.display = 'flex';
    } else {
        customTextGroup.style.display = 'none';
        customText.value = SLOGANS[messageSelect.value];
    }
});

buildBtn.addEventListener('click', buildHuffmanTree);
encodeBtn.addEventListener('click', encodeText);
resetBtn.addEventListener('click', reset);

// Init
window.addEventListener('load', () => {
    customText.value = '革命理想高于天';
    encodeBtn.disabled = true;
});
