/**
 * Red Mathematics - Hash Function Visualizer
 */

// DOM Elements
const voiceInput = document.getElementById('voiceInput');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const bucketsContainer = document.getElementById('bucketsContainer');
const inputDisplay = document.getElementById('inputDisplay');
const inputContent = document.getElementById('inputContent');
const processDisplay = document.getElementById('processDisplay');
const calcFormula = document.getElementById('calcFormula');
const calcResult = document.getElementById('calcResult');
const presetTags = document.querySelectorAll('.tag');

// State
let isProcessing = false;
const BUCKET_COUNT = 5;

// Data
const BUCKET_LABELS = [
    "政治建设", // Political
    "经济建设", // Economic
    "文化建设", // Cultural
    "社会建设", // Social
    "生态文明"  // Ecological
];

// Helper Functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Simple Hash Function: Sum of ASCII codes % 5
function calculateHash(str) {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
        sum += str.charCodeAt(i);
    }
    return {
        sum: sum,
        index: sum % BUCKET_COUNT
    };
}

// Initialize Buckets
function initBuckets() {
    bucketsContainer.innerHTML = '';
    for (let i = 0; i < BUCKET_COUNT; i++) {
        const col = document.createElement('div');
        col.className = 'bucket-column';
        col.innerHTML = `
            <div class="bucket-header" id="header-${i}">
                <div class="bucket-index">Index ${i}</div>
                <div class="bucket-name">${BUCKET_LABELS[i]}</div>
            </div>
            <div class="bucket-list" id="list-${i}"></div>
        `;
        bucketsContainer.appendChild(col);
    }
}

// Animation Logic
async function processHash() {
    const text = voiceInput.value.trim();
    if (!text) return;

    isProcessing = true;
    submitBtn.disabled = true;

    // 1. Show Input
    inputContent.textContent = text;
    inputDisplay.classList.remove('hidden');
    await sleep(600);

    // 2. Calculate
    const hashData = calculateHash(text);
    calcFormula.textContent = `Sum(${text}) = ${hashData.sum}`;
    calcResult.textContent = `${hashData.sum} % 5 = ${hashData.index}`;
    processDisplay.classList.remove('hidden');
    await sleep(1000);

    // 3. Highlight Bucket
    const header = document.getElementById(`header-${hashData.index}`);
    header.classList.add('active');
    await sleep(500);

    // 4. Add to List (Chaining)
    const list = document.getElementById(`list-${hashData.index}`);
    const node = document.createElement('div');
    node.className = 'chain-node';
    node.textContent = text;
    list.appendChild(node);

    // 5. Reset Animation State
    await sleep(800);
    header.classList.remove('active');
    inputDisplay.classList.add('hidden');
    processDisplay.classList.add('hidden');

    isProcessing = false;
    submitBtn.disabled = false;
    voiceInput.value = '';
}

// Event Listeners
submitBtn.addEventListener('click', () => {
    if (!isProcessing) processHash();
});

voiceInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !isProcessing) processHash();
});

resetBtn.addEventListener('click', () => {
    initBuckets();
    inputDisplay.classList.add('hidden');
    processDisplay.classList.add('hidden');
    voiceInput.value = '';
});

presetTags.forEach(tag => {
    tag.addEventListener('click', () => {
        if (!isProcessing) {
            voiceInput.value = tag.dataset.val;
            processHash();
        }
    });
});

// Init
initBuckets();
