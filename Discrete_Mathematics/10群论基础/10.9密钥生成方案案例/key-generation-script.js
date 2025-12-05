/**
 * 循环群密钥生成可视化系统
 * Cyclic Group Key Generation Visualization System
 */

// DOM Elements
const primeSelect = document.getElementById('primeSelect');
const groupOrderDisplay = document.getElementById('groupOrderDisplay');
const keySpaceDisplay = document.getElementById('keySpaceDisplay');
const generatorValue = document.getElementById('generatorValue');
const findGeneratorBtn = document.getElementById('findGeneratorBtn');
const generateKeyBtn = document.getElementById('generateKeyBtn');
const batchGenerateBtn = document.getElementById('batchGenerateBtn');
const manualExponent = document.getElementById('manualExponent');
const manualGenerateBtn = document.getElementById('manualGenerateBtn');
const totalKeys = document.getElementById('totalKeys');
const coverageRate = document.getElementById('coverageRate');
const uniqueStatus = document.getElementById('uniqueStatus');
const keyListContainer = document.getElementById('keyListContainer');
const cycleSvg = document.getElementById('cycleSvg');
const cycleGroup = document.getElementById('cycleGroup');
const computationBox = document.getElementById('computationBox');
const formulaText = document.getElementById('formulaText');
const computationSteps = document.getElementById('computationSteps');
const keySpaceMetric = document.getElementById('keySpaceMetric');
const collisionProb = document.getElementById('collisionProb');
const securityLevel = document.getElementById('securityLevel');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const ideologyTitle = document.getElementById('ideologyTitle');
const ideologyText = document.getElementById('ideologyText');
const analogyText = document.getElementById('analogyText');
const resetBtn = document.getElementById('resetBtn');

// State
let currentPrime = 97;
let currentGenerator = null;
let generatedKeys = new Set();
let keyHistory = [];

// Ideological Content
const IDEOLOGY_CONTENT = {
    prime: {
        title: '基石选择 · 根基牢固',
        quote: '"千里之行，始于足下。选对基石，方能行稳致远。"',
        author: '— 老子·《道德经》',
        ideology: '素数如同国家安全体系的基石。选择正确的基础（素数p）至关重要，它决定了整个密钥系统的安全强度。较大的素数带来更大的密钥空间，提供更强的安全保障。',
        analogy: '如同建设国家安全体系必须打牢基础，选择合适的素数是构建安全密钥系统的第一步。基石牢固，安全可靠。'
    },
    generator: {
        title: '源头活水 · 创新驱动',
        quote: '"问渠那得清如许，为有源头活水来。"',
        author: '— 朱熹·《观书有感》',
        ideology: '生成元象征着创新的源泉。一个好的生成元能够通过其不同的幂次生成群中所有元素，体现了"以一生万"的智慧。创新是发展的核心动力。',
        analogy: '如同科技创新是国家发展的核心动力，生成元是密钥生成的创新源泉。找到正确的源头，才能源源不断地创造价值。'
    },
    key: {
        title: '密钥安全 · 守护机密',
        quote: '"守口如瓶，密不透风。忠诚可靠，守护机密。"',
        author: '— 保密纪律',
        ideology: '每个密钥都是独一无二的守护者，承担着保护信息安全的重要使命。密钥的随机性和唯一性确保了系统的安全，体现了"一诺千金"的承诺。',
        analogy: '如同保守国家机密需要绝对忠诚可靠，每个密钥都必须唯一且难以预测。信息安全关乎国家安全，人人有责。'
    },
    security: {
        title: '国家安全 · 人民至上',
        quote: '"安而不忘危，存而不忘亡，治而不忘乱。"',
        author: '— 《周易》',
        ideology: '信息安全是国家安全的重要组成部分。通过数学方法确保密钥的安全性，体现了"未雨绸缪"的智慧。网络安全就是国家安全，关乎每个人的利益。',
        analogy: '如同国家安全需要时刻警惕，信息系统的安全也不能松懈。构建坚固的密码防线，保护人民的信息安全和财产安全。'
    }
};

// Initialization
window.addEventListener('load', () => {
    updatePrimeInfo();
    findGenerator();
    renderCycleVisualization();
    updateIdeology('prime');
    attachEventListeners();
});

// Modular Exponentiation: (base^exp) mod mod
function modPow(base, exp, mod) {
    let result = 1;
    base = base % mod;
    while (exp > 0) {
        if (exp % 2 === 1) {
            result = (result * base) % mod;
        }
        exp = Math.floor(exp / 2);
        base = (base * base) % mod;
    }
    return result;
}

// Check if g is a generator of Z_p*
function isGenerator(g, p) {
    const order = p - 1;
    const generated = new Set();

    for (let k = 1; k <= order; k++) {
        const value = modPow(g, k, p);
        generated.add(value);
    }

    return generated.size === order;
}

// Find a generator for Z_p*
function findGenerator() {
    findGeneratorBtn.disabled = true;
    generatorValue.textContent = '计算中...';

    setTimeout(() => {
        for (let g = 2; g < currentPrime; g++) {
            if (isGenerator(g, currentPrime)) {
                currentGenerator = g;
                generatorValue.textContent = g;
                findGeneratorBtn.disabled = false;
                updateIdeology('generator');
                manualExponent.max = currentPrime - 1;
                return;
            }
        }
        generatorValue.textContent = '未找到';
        findGeneratorBtn.disabled = false;
    }, 100);
}

// Update Prime Info
function updatePrimeInfo() {
    currentPrime = parseInt(primeSelect.value);
    const order = currentPrime - 1;

    groupOrderDisplay.textContent = order;
    keySpaceDisplay.textContent = order;

    // Update security metrics
    keySpaceMetric.textContent = `${order} 位`;

    if (order >= 150) {
        securityLevel.textContent = '🛡️ 高';
        securityLevel.className = 'metric-value security-high';
    } else if (order >= 80) {
        securityLevel.textContent = '⚠️ 中';
        securityLevel.className = 'metric-value security-med';
    } else {
        securityLevel.textContent = '⚡ 低';
        securityLevel.className = 'metric-value security-low';
    }
}

// Generate Key
function generateKey(exponent = null) {
    if (!currentGenerator) {
        alert('请先查找生成元');
        return null;
    }

    let k = exponent;
    if (k === null) {
        // Random exponent
        k = Math.floor(Math.random() * (currentPrime - 2)) + 1;
    }

    const key = modPow(currentGenerator, k, currentPrime);

    return { key, exponent: k, generator: currentGenerator, prime: currentPrime };
}

// Display Key Generation Process
function displayComputation(keyData) {
    const { key, exponent, generator, prime } = keyData;

    computationBox.style.display = 'block';
    formulaText.textContent = `key = ${generator}^${exponent} mod ${prime}`;

    // Show computation steps
    let steps = `<strong>计算过程：</strong><br>`;
    steps += `生成元 g = ${generator}<br>`;
    steps += `随机指数 k = ${exponent}<br>`;
    steps += `素数 p = ${prime}<br>`;
    steps += `<br><strong>计算：</strong> ${generator}^${exponent} mod ${prime} = <strong style="color: var(--accent-gold);">${key}</strong>`;

    computationSteps.innerHTML = steps;
}

// Add Key to List
function addKeyToList(keyData) {
    const { key, exponent } = keyData;

    // Check if duplicate
    if (generatedKeys.has(key)) {
        uniqueStatus.textContent = '⚠️ 有重复';
        uniqueStatus.className = 'stat-value';
        uniqueStatus.style.color = 'var(--danger-red)';
    }

    generatedKeys.add(key);
    keyHistory.push(keyData);

    // Remove empty hint
    if (keyListContainer.querySelector('.empty-hint')) {
        keyListContainer.innerHTML = '';
    }

    // Add to list
    const keyItem = document.createElement('div');
    keyItem.className = 'key-item new';
    keyItem.innerHTML = `
        <strong>Key #${keyHistory.length}:</strong> ${key}<br>
        <small>指数: k = ${exponent}</small>
    `;

    keyListContainer.insertBefore(keyItem, keyListContainer.firstChild);

    // Remove 'new' class after animation
    setTimeout(() => {
        keyItem.classList.remove('new');
    }, 600);

    // Update stats
    updateStats();

    // Update visualization
    updateCycleVisualization(key);
}

// Update Statistics
function updateStats() {
    totalKeys.textContent = keyHistory.length;

    const coverage = (generatedKeys.size / (currentPrime - 1) * 100).toFixed(1);
    coverageRate.textContent = `${coverage}%`;

    // Calculate collision probability
    const n = generatedKeys.size;
    const N = currentPrime - 1;
    const prob = (1 - Math.exp(-n * (n - 1) / (2 * N))) * 100;
    collisionProb.textContent = prob < 0.1 ? '≈ 0%' : `${prob.toFixed(2)}%`;

    // Check uniqueness
    if (generatedKeys.size === keyHistory.length) {
        uniqueStatus.textContent = '✓ 100%';
        uniqueStatus.className = 'stat-value success';
    }
}

// Render Cycle Visualization
function renderCycleVisualization() {
    cycleGroup.innerHTML = '';

    const WIDTH = cycleSvg.clientWidth || 600;
    const HEIGHT = cycleSvg.clientHeight || 400;
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;
    const radius = Math.min(WIDTH, HEIGHT) / 2.5;

    const order = currentPrime - 1;
    const displayCount = Math.min(order, 32); // Limit display for large primes
    const angleStep = (2 * Math.PI) / displayCount;

    // Draw nodes
    for (let i = 0; i < displayCount; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const value = i < order ? (i + 1) : '...';

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'key-node');
        g.setAttribute('transform', `translate(${x}, ${y})`);
        g.dataset.value = value;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', 8);
        circle.setAttribute('fill', '#e0e0e0');
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', 1);

        if (value !== '...') {
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('class', 'key-label');
            label.setAttribute('font-size', '9');
            label.textContent = value;
            g.appendChild(label);
        }

        g.appendChild(circle);
        cycleGroup.appendChild(g);
    }

    // Center label
    const centerLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerLabel.setAttribute('x', centerX);
    centerLabel.setAttribute('y', centerY);
    centerLabel.setAttribute('text-anchor', 'middle');
    centerLabel.setAttribute('dominant-baseline', 'middle');
    centerLabel.setAttribute('font-size', '20');
    centerLabel.setAttribute('font-weight', '700');
    centerLabel.setAttribute('fill', '#d63b1d');
    centerLabel.textContent = `ℤ*${currentPrime}`;
    cycleGroup.appendChild(centerLabel);
}

// Update Cycle Visualization with New Key
function updateCycleVisualization(key) {
    const nodes = cycleGroup.querySelectorAll('.key-node');

    nodes.forEach(node => {
        const value = parseInt(node.dataset.value);
        if (value === key) {
            const circle = node.querySelector('circle');
            if (generatedKeys.size === 1) {
                // First key - highlight as current
                circle.setAttribute('fill', '#4ecdc4');
                circle.setAttribute('r', 10);
                setTimeout(() => {
                    circle.setAttribute('fill', '#10b981');
                    circle.setAttribute('r', 8);
                }, 500);
            } else {
                // Subsequent keys
                circle.setAttribute('fill', '#10b981');
            }
        }
    });
}

// Update Ideology Content
function updateIdeology(type) {
    const content = IDEOLOGY_CONTENT[type];
    if (!content) return;

    ideologyTitle.textContent = content.title;
    quoteText.textContent = content.quote;
    quoteAuthor.textContent = content.author;
    ideologyText.innerHTML = `<p>${content.ideology}</p>`;
    analogyText.textContent = content.analogy;
}

// Event Handlers
function handleGenerateKey() {
    const keyData = generateKey();
    if (keyData) {
        displayComputation(keyData);
        addKeyToList(keyData);
        updateIdeology('key');
    }
}

async function handleBatchGenerate() {
    batchGenerateBtn.disabled = true;
    batchGenerateBtn.textContent = '生成中...';

    for (let i = 0; i < 10; i++) {
        const keyData = generateKey();
        if (keyData) {
            displayComputation(keyData);
            addKeyToList(keyData);
        }
        await sleep(150);
    }

    batchGenerateBtn.disabled = false;
    batchGenerateBtn.textContent = '📦 批量生成 (10个)';
    updateIdeology('security');
}

function handleManualGenerate() {
    const exponent = parseInt(manualExponent.value);

    if (!exponent || exponent < 1 || exponent >= currentPrime) {
        alert(`请输入 1 到 ${currentPrime - 1} 之间的整数`);
        return;
    }

    const keyData = generateKey(exponent);
    if (keyData) {
        displayComputation(keyData);
        addKeyToList(keyData);
        manualExponent.value = '';
    }
}

function handlePrimeChange() {
    updatePrimeInfo();
    findGenerator();
    resetSystem();
    renderCycleVisualization();
    updateIdeology('prime');
}

function resetSystem() {
    generatedKeys.clear();
    keyHistory = [];
    keyListContainer.innerHTML = '<p class="empty-hint">点击"生成密钥"开始生成...</p>';
    computationBox.style.display = 'none';
    uniqueStatus.textContent = '✓ 100%';
    uniqueStatus.className = 'stat-value success';
    updateStats();
    renderCycleVisualization();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event Listeners
function attachEventListeners() {
    primeSelect.addEventListener('change', handlePrimeChange);
    findGeneratorBtn.addEventListener('click', findGenerator);
    generateKeyBtn.addEventListener('click', handleGenerateKey);
    batchGenerateBtn.addEventListener('click', handleBatchGenerate);
    manualGenerateBtn.addEventListener('click', handleManualGenerate);

    manualExponent.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleManualGenerate();
        }
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('确定要重置系统吗？所有已生成的密钥将被清除。')) {
            handlePrimeChange();
        }
    });
}
