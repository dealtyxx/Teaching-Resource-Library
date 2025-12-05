/**
 * 对称群S3陪集密码系统
 * S3 Symmetric Group Coset-Based Cryptography
 */

// S3群定义 - 用数组表示排列
const S3 = {
    'e': [0, 1, 2],          // 恒等元
    '(12)': [1, 0, 2],       // 对换(12)
    '(13)': [2, 1, 0],       // 对换(13)
    '(23)': [0, 2, 1],       // 对换(23)
    '(123)': [1, 2, 0],      // 3-循环
    '(132)': [2, 0, 1]       // 3-循环
};

const ELEMENTS = ['e', '(12)', '(13)', '(23)', '(123)', '(132)'];

// 陪集划分
const COSETS = {
    'H': ['e', '(12)'],
    '(13)H': ['(13)', '(132)'],
    '(23)H': ['(23)', '(123)']
};

const COSET_NAMES = ['H', '(13)H', '(23)H'];

// DOM元素
const messageInput = document.getElementById('messageInput');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const reEncryptBtn = document.getElementById('reEncryptBtn');
const resetBtn = document.getElementById('resetBtn');
const groupElements = document.getElementById('groupElements');
const cosetsDisplay = document.getElementById('cosetsDisplay');
const cayleyTable = document.getElementById('cayleyTable');
const originalMessage = document.getElementById('originalMessage');
const numberMapping = document.getElementById('numberMapping');
const cosetSelection = document.getElementById('cosetSelection');
const ciphertext = document.getElementById('ciphertext');
const decryptFlow = document.getElementById('decryptFlow');
const decryptSteps = document.getElementById('decryptSteps');
const processLog = document.getElementById('processLog');
const processTitle = document.getElementById('processTitle');
const processSteps = document.getElementById('processSteps');
const encryptCount = document.getElementById('encryptCount');
const decryptCount = document.getElementById('decryptCount');
const successRate = document.getElementById('successRate');

// 状态
let currentPlaintext = '';
let currentCiphertext = [];
let stats = { encrypt: 0, decrypt: 0, success: 0 };

// 群运算：排列复合
function compose(p1, p2) {
    return [p1[p2[0]], p1[p2[1]], p1[p2[2]]];
}

// 获取元素所属陪集
function getCosetIndex(element) {
    for (let i = 0; i < COSET_NAMES.length; i++) {
        if (COSETS[COSET_NAMES[i]].includes(element)) {
            return i;
        }
    }
    return -1;
}

// 初始化界面
function initialize() {
    renderGroupElements();
    renderCosets();
    renderCayleyTable();
}

// 渲染群元素
function renderGroupElements() {
    groupElements.innerHTML = '';
    ELEMENTS.forEach(elem => {
        const badge = document.createElement('div');
        badge.className = `element-badge coset-${getCosetIndex(elem)}`;
        badge.textContent = elem;
        badge.title = S3[elem].join(',');
        groupElements.appendChild(badge);
    });
}

// 渲染陪集
function renderCosets() {
    cosetsDisplay.innerHTML = '';
    COSET_NAMES.forEach((cosetName, idx) => {
        const div = document.createElement('div');
        div.className = `coset-group coset-${idx}`;

        const h4 = document.createElement('h4');
        h4.textContent = cosetName;
        div.appendChild(h4);

        const members = document.createElement('div');
        members.className = 'coset-members';

        COSETS[cosetName].forEach(member => {
            const span = document.createElement('span');
            span.className = 'coset-member';
            span.style.borderColor = `var(--coset-${idx + 1})`;
            span.textContent = member;
            members.appendChild(span);
        });

        div.appendChild(members);
        cosetsDisplay.appendChild(div);
    });
}

// 渲染凯莱表
function renderCayleyTable() {
    // 创建表头
    let html = '<tr><th>∘</th>';
    ELEMENTS.forEach(elem => {
        html += `<th>${elem}</th>`;
    });
    html += '</tr>';

    // 创建表体
    ELEMENTS.forEach(row => {
        html += `<tr><th>${row}</th>`;
        ELEMENTS.forEach(col => {
            const result = compose(S3[row], S3[col]);
            const resultElem = ELEMENTS.find(e =>
                S3[e][0] === result[0] &&
                S3[e][1] === result[1] &&
                S3[e][2] === result[2]
            );
            const cosetIdx = getCosetIndex(resultElem);
            html += `<td class="coset-${cosetIdx}">${resultElem}</td>`;
        });
        html += '</tr>';
    });

    cayleyTable.innerHTML = html;
}

// 加密消息
function encryptMessage() {
    const message = messageInput.value.toUpperCase();

    // 验证输入
    if (!message) {
        alert('请输入消息！');
        return;
    }

    if (!/^[ABC]+$/.test(message)) {
        alert('只能输入A、B、C字符！');
        return;
    }

    currentPlaintext = message;
    currentCiphertext = [];

    // 显示原始消息
    originalMessage.innerHTML = '';
    message.split('').forEach(char => {
        const badge = document.createElement('span');
        badge.className = 'char-badge';
        badge.textContent = char;
        originalMessage.appendChild(badge);
    });

    // 映射到数字
    const numbers = message.split('').map(char => char.charCodeAt(0) - 'A'.charCodeAt(0));
    numberMapping.innerHTML = '';
    numbers.forEach(num => {
        const badge = document.createElement('span');
        badge.className = 'number-badge';
        badge.textContent = num;
        numberMapping.appendChild(badge);
    });

    // 选择陪集
    const cosetIndices = numbers.map(n => n % 3);
    cosetSelection.innerHTML = '';
    cosetIndices.forEach(idx => {
        const badge = document.createElement('span');
        badge.className = `coset-badge coset-${idx}`;
        badge.textContent = COSET_NAMES[idx];
        cosetSelection.appendChild(badge);
    });

    // 生成密文（在陪集内随机选择）
    ciphertext.innerHTML = '';
    cosetIndices.forEach(idx => {
        const cosetMembers = COSETS[COSET_NAMES[idx]];
        const randomMember = cosetMembers[Math.floor(Math.random() * cosetMembers.length)];
        currentCiphertext.push(randomMember);

        const badge = document.createElement('span');
        badge.className = 'cipher-badge';
        badge.textContent = randomMember;
        ciphertext.appendChild(badge);
    });

    // 更新统计
    stats.encrypt++;
    updateStats();

    // 显示过程
    processLog.style.display = 'block';
    processTitle.textContent = '✓ 加密成功';
    processSteps.innerHTML = `
        <div><strong>步骤1:</strong> 消息 "${message}" 转换为数字 [${numbers.join(', ')}]</div>
        <div><strong>步骤2:</strong> 对3取模得到陪集索引 [${cosetIndices.join(', ')}]</div>
        <div><strong>步骤3:</strong> 映射到陪集 [${cosetIndices.map(i => COSET_NAMES[i]).join(', ')}]</div>
        <div><strong>步骤4:</strong> 在每个陪集内随机选择一个元素作为密文</div>
        <div style="margin-top: 12px; padding: 12px; background: rgba(255, 180, 0, 0.1); border-radius: 6px;">
            <strong>密文:</strong> [${currentCiphertext.join(', ')}]
        </div>
    `;

    decryptBtn.disabled = false;
    reEncryptBtn.disabled = false;
    decryptFlow.style.display = 'none';
}

// 解密消息
function decryptMessage() {
    if (currentCiphertext.length === 0) {
        alert('请先加密消息！');
        return;
    }

    // 解密过程
    const decrypted = currentCiphertext.map(elem => {
        const cosetIdx = getCosetIndex(elem);
        return String.fromCharCode('A'.charCodeAt(0) + cosetIdx);
    }).join('');

    // 显示解密过程
    decryptFlow.style.display = 'block';
    decryptSteps.innerHTML = '';

    currentCiphertext.forEach((elem, i) => {
        const cosetIdx = getCosetIndex(elem);
        const cosetName = COSET_NAMES[cosetIdx];
        const char = String.fromCharCode('A'.charCodeAt(0) + cosetIdx);

        const step = document.createElement('div');
        step.innerHTML = `
            <strong>密文[${i}]:</strong> ${elem} → 
            属于陪集 <span style="color: var(--coset-${cosetIdx + 1}); font-weight: 700;">${cosetName}</span> → 
            陪集索引 ${cosetIdx} → 
            字符 <strong style="color: var(--primary-red);">${char}</strong>
        `;
        decryptSteps.appendChild(step);
    });

    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = 'margin-top: 16px; padding: 16px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; text-align: center;';

    if (decrypted === currentPlaintext) {
        resultDiv.innerHTML = `<strong style="color: var(--success-green); font-size: 1.2rem;">✓ 解密成功！</strong><br>恢复消息: <strong style="font-size: 1.3rem;">${decrypted}</strong>`;
        stats.success++;
    } else {
        resultDiv.innerHTML = `<strong style="color: var(--danger-red);">✗ 解密失败</strong>`;
    }

    decryptSteps.appendChild(resultDiv);

    // 更新统计
    stats.decrypt++;
    updateStats();

    processLog.style.display = 'block';
    processTitle.textContent = '🔓 解密过程';
    processSteps.innerHTML = `
        <div>通过识别每个密文元素所属的陪集，将陪集索引映射回字符</div>
        <div><strong>原始消息:</strong> ${currentPlaintext}</div>
        <div><strong>解密结果:</strong> ${decrypted}</div>
        <div>${decrypted === currentPlaintext ? '<strong style="color: var(--success-green);">验证成功！加密解密互逆。</strong>' : '<strong style="color: var(--danger-red);">验证失败</strong>'}</div>
    `;
}

// 重新加密（展示随机性）
function reEncrypt() {
    if (!currentPlaintext) {
        alert('请先加密消息！');
        return;
    }

    encryptMessage();

    processLog.style.display = 'block';
    processTitle.textContent = '🔄 重新加密 - 随机性展示';
    processSteps.innerHTML = `
        <div>相同的消息 "<strong>${currentPlaintext}</strong>" 可以产生不同的密文</div>
        <div>因为在每个陪集内有2个元素可供选择</div>
        <div>这增加了系统的安全性，使得密文分析更困难</div>
        <div style="margin-top: 12px; padding: 12px; background: rgba(139, 71, 137, 0.1); border-radius: 6px;">
            <strong>新密文:</strong> [${currentCiphertext.join(', ')}]
        </div>
    `;
}

// 更新统计
function updateStats() {
    encryptCount.textContent = stats.encrypt;
    decryptCount.textContent = stats.decrypt;

    if (stats.decrypt > 0) {
        const rate = (stats.success / stats.decrypt * 100).toFixed(0);
        successRate.textContent = `${rate}%`;
    }
}

// 重置
function reset() {
    if (confirm('确定要重置系统吗？')) {
        currentPlaintext = '';
        currentCiphertext = [];
        messageInput.value = '';

        originalMessage.innerHTML = '<div class="empty-hint">等待输入...</div>';
        numberMapping.innerHTML = '<div class="empty-hint">等待加密...</div>';
        cosetSelection.innerHTML = '<div class="empty-hint">等待加密...</div>';
        ciphertext.innerHTML = '<div class="empty-hint">等待加密...</div>';

        decryptFlow.style.display = 'none';
        processLog.style.display = 'none';

        decryptBtn.disabled = true;
        reEncryptBtn.disabled = true;
    }
}

// 事件监听
encryptBtn.addEventListener('click', encryptMessage);
decryptBtn.addEventListener('click', decryptMessage);
reEncryptBtn.addEventListener('click', reEncrypt);
resetBtn.addEventListener('click', reset);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        encryptMessage();
    }
});

// 初始化
window.addEventListener('load', initialize);
