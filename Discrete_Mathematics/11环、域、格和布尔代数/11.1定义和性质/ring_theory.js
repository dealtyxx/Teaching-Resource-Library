/**
 * Ring Theory Visualization - Enhanced Version
 * 红色数理 - 环论：代数结构的和谐
 */

document.addEventListener('DOMContentLoaded', () => {
    init();
});

// ===== State =====
let currentMode = 'zn';
let currentN = 5;
let zeroDivisors = [];
let units = [];
let clickedCell = null;

// ===== Mode Configurations =====
const MODES = {
    'zn': {
        title: 'Zn 探索器 (Modular Arithmetic)',
        ideology: {
            title: '🔢 周而复始：有限中的完整秩序',
            content: 'Zₙ 的加法走满 n 步回到 0，如同钟表的时针周而复始；但它不是简单重复——乘法表里隐藏着零因子与可逆元的差别，素数 n 让每个非零元都可逆。看似循环的表象下有更深的结构，认识事物要透过现象抓住本质。'
        },
        definition: `
            <div class="definition-item">
                <strong>模n剩余类环 Zn</strong><br>
                集合: {0, 1, 2, ..., n-1}<br>
                加法: (a + b) mod n<br>
                乘法: (a × b) mod n
            </div>
            <div class="definition-item">
                <strong>可换环 (Commutative Ring)</strong><br>
                ∀ a, b ∈ R: a × b = b × a
            </div>
            <div class="definition-item">
                <strong>域 (Field)</strong><br>
                Z_p 是域当且仅当 p 是素数<br>
                (每个非零元素都有乘法逆元)
            </div>
        `,
        controls: [
            { type: 'label', text: 'n =' },
            { type: 'input', id: 'nInput', value: '5' },
            { type: 'btn', text: '生成', action: 'generateZn', class: '' }
        ],
        instructions: `
            <ul>
                <li>选择模数n（2-12）</li>
                <li>观察加法和乘法运算表</li>
                <li><strong>点击单元格</strong>查看计算详情</li>
                <li>乘法表中：非零元相乘得 0 标红（零因子对），乘积为 1 标绿（互逆对）</li>
                <li>当且仅当 n 为素数时，Zₙ 是域</li>
            </ul>
        `
    },
    'polynomial': {
        title: '多项式环 (Polynomial Ring)',
        ideology: {
            title: '📐 以简驭繁：有限规则生成无穷对象',
            content: '多项式环只用一个变量 x、系数环和加乘两种运算，就生成了无穷多个元素，而且加法、乘法始终封闭。用少数清晰的规则组织无穷的对象，是数学抽象的力量，也是创新思维的写照：立足已有条件，通过组合与创造拓展新的可能。'
        },
        definition: `
            <div class="definition-item">
                <strong>多项式环 R[x]</strong><br>
                形如: a₀ + a₁x + a₂x² + ... + aₙxⁿ<br>
                其中 aᵢ ∈ R (系数环)
            </div>
            <div class="definition-item">
                <strong>加法</strong><br>
                按项合并: (a + bx) + (c + dx) = (a+c) + (b+d)x
            </div>
            <div class="definition-item">
                <strong>乘法</strong><br>
                按分配律展开: (a + bx)(c + dx) = ac + (ad+bc)x + bdx²
            </div>
        `,
        controls: [],
        instructions: `
            <ul>
                <li>输入两个多项式的系数</li>
                <li>点击按钮查看加法和乘法结果</li>
                <li>观察封闭性（结果仍是多项式）</li>
                <li><strong>尝试特殊值</strong>，如全零、单项式</li>
            </ul>
        `
    },
    'properties': {
        title: '性质检验器 (Property Checker)',
        ideology: {
            title: '🔍 严谨治学：逻辑的完整性',
            content: '整环"无零因子"：若 ab = 0，则 a = 0 或 b = 0。正是这条性质保证了消去律（ab = ac 且 a ≠ 0 ⇒ b = c），解方程时才能放心地"约去"非零因子。在 Z₆ 中 2·3 = 0，消去律就失效了。科学推理同样如此：每一步变形都要先确认前提成立，才经得起检验。'
        },
        definition: `
            <div class="definition-item">
                <strong>整环 (Integral Domain)</strong><br>
                无零因子的交换含幺环（1 ≠ 0）:<br>
                ∀ a,b ≠ 0: ab ≠ 0
            </div>
            <div class="definition-item">
                <strong>零因子 (Zero Divisor)</strong><br>
                非零元a使得存在非零b满足 ab = 0
            </div>
            <div class="definition-item">
                <strong>可逆元（单位，Unit）</strong><br>
                有乘法逆元的元素:<br>
                ∃ b: ab = ba = 1
            </div>
        `,
        controls: [
            { type: 'label', text: 'n =' },
            { type: 'input', id: 'nInput', value: '5' },
            { type: 'btn', text: '检验', action: 'generateZn', class: '' }
        ],
        instructions: `
            <ul>
                <li>自动检测当前环的性质</li>
                <li>识别所有零因子（若存在）</li>
                <li>识别所有可逆元（单位）</li>
                <li>判定是否为整环/域</li>
            </ul>
        `
    },
    'hierarchy': {
        title: '结构层次 (Structure Hierarchy)',
        ideology: {
            title: '🏛️ 完整体系：理论的层次性',
            content: '从环到交换环、整环、域，每一层都在上一层基础上增加一条性质：交换律、含幺且无零因子、非零元可逆。条件越多，结构越"好用"，适用的对象也越少。理论体系的建设同样循序渐进：先打牢基础，再逐层完善，每一层都自洽、可检验。'
        },
        definition: `
            <div class="definition-item">
                <strong>层次关系</strong><br>
                环 ⊃ 交换环 ⊃ 整环 ⊃ 域（按对象类包含）
            </div>
            <div class="definition-item">
                <strong>性质累加</strong><br>
                环 → + 乘法交换 → 交换环<br>
                交换环 → + 含幺(1≠0)、无零因子 → 整环<br>
                整环 → + 非零元都可逆 → 域
            </div>
        `,
        controls: [],
        instructions: `
            <ul>
                <li>点击每个结构查看定义</li>
                <li>理解性质的递进关系</li>
                <li>查看典型例子</li>
            </ul>
        `
    }
};

// ===== Initialization =====
function init() {
    setupNavigation();
    loadMode('zn');
}

function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadMode(btn.dataset.mode);
        });
    });
}

// ===== Mode Loading =====
function loadMode(mode) {
    currentMode = mode;
    const config = MODES[mode];

    // Update UI
    document.getElementById('modeTitle').textContent = config.title;
    document.getElementById('definitionContent').innerHTML = config.definition;
    document.getElementById('ideologyBox').innerHTML = `
        <div class="ideology-title">${config.ideology.title}</div>
        <div class="ideology-content">${config.ideology.content}</div>
    `;
    document.getElementById('instructionText').innerHTML = config.instructions;

    // Setup Controls
    const controlsDiv = document.getElementById('canvasControls');
    controlsDiv.innerHTML = '';
    config.controls.forEach(ctrl => {
        if (ctrl.type === 'label') {
            const span = document.createElement('span');
            span.className = 'control-label';
            span.textContent = ctrl.text;
            controlsDiv.appendChild(span);
        } else if (ctrl.type === 'input') {
            const input = document.createElement('input');
            input.type = 'number';
            input.id = ctrl.id;
            input.value = String(currentN);
            input.setAttribute('aria-label', '模数 n');
            input.addEventListener('change', () => executeAction('generateZn'));
            input.min = '2';
            input.max = '12';
            input.className = 'control-input';
            controlsDiv.appendChild(input);
        } else if (ctrl.type === 'btn') {
            const btn = document.createElement('button');
            btn.className = `control-btn ${ctrl.class || ''}`;
            btn.textContent = ctrl.text;
            btn.onclick = () => executeAction(ctrl.action);
            controlsDiv.appendChild(btn);
        } else if (ctrl.type === 'info') {
            const span = document.createElement('span');
            span.style.fontSize = '0.9rem';
            span.style.color = 'var(--text-light)';
            span.textContent = ctrl.text;
            controlsDiv.appendChild(span);
        }
    });

    // Load mode content
    if (mode === 'zn') {
        generateZn();
    } else if (mode === 'polynomial') {
        loadPolynomialMode();
    } else if (mode === 'properties') {
        loadPropertiesMode();
    } else if (mode === 'hierarchy') {
        loadHierarchyMode();
    }
}

// ===== Actions =====
function executeAction(action) {
    if (action === 'generateZn') {
        const input = document.getElementById('nInput');
        currentN = parseInt(input.value) || 5;
        if (currentN < 2) currentN = 2;
        if (currentN > 12) currentN = 12;
        input.value = currentN;
        if (currentMode === 'properties') {
            loadPropertiesMode();
        } else {
            generateZn();
        }
    }
}

// ===== Zn Generator =====
function generateZn() {
    // Analyze properties
    analyzeZn(currentN);

    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="cayley-table-wrapper">
            <h3>加法表 (Addition mod ${currentN})</h3>
            ${generateCayleyTable(currentN, 'add')}
        </div>
        <div class="cayley-table-wrapper">
            <h3>乘法表 (Multiplication mod ${currentN})</h3>
            ${generateCayleyTable(currentN, 'mult')}
        </div>
        <div id="cellDetail" class="cell-detail" style="display: none;"></div>
    `;

    // Add click handlers to cells
    document.querySelectorAll('.cayley-table td').forEach(cell => {
        cell.addEventListener('click', () => showCellDetail(cell));
    });

    // Update properties
    updateProperties();
}

function generateCayleyTable(n, operation) {
    let html = '<table class="cayley-table"><thead><tr><th>⊕/⊗</th>';

    // Header row
    for (let i = 0; i < n; i++) {
        html += `<th>${i}</th>`;
    }
    html += '</tr></thead><tbody>';

    // Data rows
    for (let i = 0; i < n; i++) {
        html += `<tr><th>${i}</th>`;
        for (let j = 0; j < n; j++) {
            let result;
            if (operation === 'add') {
                result = (i + j) % n;
            } else {
                result = (i * j) % n;
            }

            let cellClass = '';
            if (result === 0 && i !== 0 && j !== 0 && operation === 'mult') {
                cellClass = 'zero-divisor';
            } else if (result === 0) {
                cellClass = 'zero';
            } else if (result === 1 && operation === 'mult') {
                cellClass = 'unit';
            }

            html += `<td class="${cellClass}" data-i="${i}" data-j="${j}" data-op="${operation}" data-result="${result}" title="${i} ${operation === 'add' ? '+' : '×'} ${j} = ${result} (mod ${n})">${result}</td>`;
        }
        html += '</tr>';
    }

    html += '</tbody></table>';
    return html;
}

function showCellDetail(cell) {
    const i = cell.dataset.i;
    const j = cell.dataset.j;
    const op = cell.dataset.op;
    const result = cell.dataset.result;

    const detailDiv = document.getElementById('cellDetail');
    const symbol = op === 'add' ? '+' : '×';
    const actualResult = op === 'add' ? (parseInt(i) + parseInt(j)) : (parseInt(i) * parseInt(j));

    detailDiv.innerHTML = `
        <h4 style="color: var(--primary-red); margin-bottom: 10px;">💡 计算详情</h4>
        <p><strong>${i} ${symbol} ${j}</strong> = ${actualResult}</p>
        <p>${actualResult} mod ${currentN} = <strong style="color: var(--ring-blue); font-size: 1.2em;">${result}</strong></p>
        ${parseInt(result) === 0 && i !== '0' && j !== '0' && op === 'mult' ?
            '<p style="color: #c0392b;">⚠️ 这是一对零因子！</p>' : ''}
        ${parseInt(result) === 1 && op === 'mult' ?
            `<p style="color: var(--domain-green);">✓ ${i} 与 ${j} 互为乘法逆元（二者都是可逆元）</p>` : ''}
    `;
    detailDiv.style.display = 'block';

    // Highlight all cells
    document.querySelectorAll('.cayley-table td').forEach(c => c.style.outline = '');
    cell.style.outline = '3px solid var(--ring-blue)';
}

function analyzeZn(n) {
    zeroDivisors = [];
    units = [];

    // Find zero divisors and units
    for (let a = 1; a < n; a++) {
        // Check for zero divisor
        for (let b = 1; b < n; b++) {
            if ((a * b) % n === 0) {
                if (!zeroDivisors.includes(a)) {
                    zeroDivisors.push(a);
                }
            }
        }

        // Check for unit (has inverse)
        for (let b = 1; b < n; b++) {
            if ((a * b) % n === 1) {
                if (!units.includes(a)) {
                    units.push(a);
                }
                break;
            }
        }
    }
}

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}

// ===== Polynomial Mode =====
function loadPolynomialMode() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <h3>多项式 P(x)</h3>
        <div class="polynomial-input">
            <label>P(x) = </label>
            <input type="number" id="p0" class="coefficient-input" value="1" placeholder="a₀"> +
            <input type="number" id="p1" class="coefficient-input" value="2" placeholder="a₁"> x +
            <input type="number" id="p2" class="coefficient-input" value="1" placeholder="a₂"> x²
        </div>
        
        <h3>多项式 Q(x)</h3>
        <div class="polynomial-input">
            <label>Q(x) = </label>
            <input type="number" id="q0" class="coefficient-input" value="1" placeholder="b₀"> +
            <input type="number" id="q1" class="coefficient-input" value="1" placeholder="b₁"> x +
            <input type="number" id="q2" class="coefficient-input" value="0" placeholder="b₂"> x²
        </div>
        
        <div style="margin: 20px 0;">
            <button class="control-btn" onclick="computePolynomialSum()">计算 P(x) + Q(x)</button>
            <button class="control-btn" onclick="computePolynomialProduct()">计算 P(x) × Q(x)</button>
            <button class="control-btn secondary" onclick="randomPolynomial()">🎲 随机多项式</button>
        </div>
        
        <div id="polynomialResult"></div>
    `;

    updateProperties();
}

function randomPolynomial() {
    // Random coefficients between -5 and 5
    ['p0', 'p1', 'p2', 'q0', 'q1', 'q2'].forEach(id => {
        document.getElementById(id).value = Math.floor(Math.random() * 11) - 5;
    });
}

function computePolynomialSum() {
    const p = [
        parseInt(document.getElementById('p0').value) || 0,
        parseInt(document.getElementById('p1').value) || 0,
        parseInt(document.getElementById('p2').value) || 0
    ];
    const q = [
        parseInt(document.getElementById('q0').value) || 0,
        parseInt(document.getElementById('q1').value) || 0,
        parseInt(document.getElementById('q2').value) || 0
    ];

    const sum = [p[0] + q[0], p[1] + q[1], p[2] + q[2]];

    displayPolynomialResult('加法', sum, p, q, '+');
}

function computePolynomialProduct() {
    const p = [
        parseInt(document.getElementById('p0').value) || 0,
        parseInt(document.getElementById('p1').value) || 0,
        parseInt(document.getElementById('p2').value) || 0
    ];
    const q = [
        parseInt(document.getElementById('q0').value) || 0,
        parseInt(document.getElementById('q1').value) || 0,
        parseInt(document.getElementById('q2').value) || 0
    ];

    //  (a0 + a1x + a2x²)(b0 + b1x + b2x²)
    const prod = [
        p[0] * q[0],                           // x^0
        p[0] * q[1] + p[1] * q[0],            // x^1
        p[0] * q[2] + p[1] * q[1] + p[2] * q[0], // x^2
        p[1] * q[2] + p[2] * q[1],            // x^3
        p[2] * q[2]                            // x^4
    ];

    displayPolynomialResult('乘法', prod, p, q, '×');
}

function displayPolynomialResult(operation, coeffs, p, q, symbol) {
    let pPoly = formatPolynomial(p);
    let qPoly = formatPolynomial(q);
    let resultPoly = formatPolynomial(coeffs);

    const resultDiv = document.getElementById('polynomialResult');
    resultDiv.innerHTML = `
        <div class="polynomial-display">
            <p><strong>${operation}过程:</strong></p>
            <p>(${pPoly}) ${symbol} (${qPoly})</p>
            <p style="border-top: 2px solid var(--polynomial-purple); padding-top: 10px; margin-top: 10px; font-size: 1.3em;">
                = <strong>${resultPoly}</strong>
            </p>
            <p style="margin-top: 15px; color: var(--domain-green);">
                ✓ 结果仍是多项式，体现了<strong>封闭性</strong>
            </p>
        </div>
    `;
}

function formatPolynomial(coeffs) {
    let terms = [];
    for (let i = 0; i < coeffs.length; i++) {
        if (coeffs[i] === 0) continue;

        let term = '';
        if (coeffs[i] > 0 && terms.length > 0) term += ' + ';
        if (coeffs[i] < 0) term += ' - ';

        const absCoeff = Math.abs(coeffs[i]);
        if (i === 0) {
            term += absCoeff;
        } else if (i === 1) {
            term += (absCoeff === 1 ? '' : absCoeff) + 'x';
        } else {
            term += (absCoeff === 1 ? '' : absCoeff) + `x<sup>${i}</sup>`;
        }

        terms.push(term);
    }

    return terms.length > 0 ? terms.join('') : '0';
}

// ===== Properties Mode =====
function loadPropertiesMode() {
    analyzeZn(currentN);

    const content = document.getElementById('mainContent');
    const isCommutative = true; // Zn is always commutative
    const isIntegralDomain = zeroDivisors.length === 0;
    const isField = isPrime(currentN);

    content.innerHTML = `
        <h3>Z<sub>${currentN}</sub> 的性质分析</h3>
        
        <div class="definition-item">
            <strong>零因子 (Zero Divisors)</strong><br>
            ${zeroDivisors.length > 0 ? zeroDivisors.join(', ') : '✓ 无零因子'}
        </div>
        
        <div class="definition-item">
            <strong>可逆元 (Units)</strong><br>
            {${units.join(', ')}}
        </div>
        
        <div class="definition-item">
            <strong>素数检验</strong><br>
            ${currentN} ${isPrime(currentN) ? '<span style="color: var(--domain-green);">是素数 ✓</span>' : '<span style="color: #c62828;">不是素数 ✗</span>'}
        </div>
        
        ${!isIntegralDomain ? `
        <div class="definition-item" style="border-left-color: #c62828; background: #ffebee;">
            <strong>零因子示例</strong><br>
            ${zeroDivisors.slice(0, 3).map(a => {
        for (let b = 1; b < currentN; b++) {
            if ((a * b) % currentN === 0) {
                return `${a} × ${b} ≡ 0 (mod ${currentN})`;
            }
        }
    }).join('<br>')}
        </div>
        ` : ''}
        
        ${isField ? `
        <div class="definition-item" style="border-left-color: var(--field-gold); background: #fffbf0;">
            <strong>🌟 Z<sub>${currentN}</sub> 是域！</strong><br>
            因为${currentN}是素数，所以每个非零元素都有乘法逆元。
        </div>
        ` : ''}
    `;

    updateProperties();
}

// ===== Hierarchy Mode =====
function loadHierarchyMode() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="hierarchy-diagram">
            <div class="hierarchy-level">
                <div class="hierarchy-node" onclick="showHierarchyInfo('ring', this)">
                    <h4>环 (Ring)</h4>
                    <p>加法群 + 乘法半群</p>
                </div>
            </div>
            
            <div class="hierarchy-arrow"></div>
            
            <div class="hierarchy-level">
                <div class="hierarchy-node" onclick="showHierarchyInfo('commutative', this)">
                    <h4>可换环 (Commutative Ring)</h4>
                    <p>+ 乘法交换律</p>
                </div>
            </div>
            
            <div class="hierarchy-arrow"></div>
            
            <div class="hierarchy-level">
                <div class="hierarchy-node" onclick="showHierarchyInfo('domain', this)">
                    <h4>整环 (Integral Domain)</h4>
                    <p>+ 含幺、无零因子</p>
                </div>
            </div>
            
            <div class="hierarchy-arrow"></div>
            
            <div class="hierarchy-level">
                <div class="hierarchy-node" onclick="showHierarchyInfo('field', this)">
                    <h4>域 (Field)</h4>
                    <p>+ 所有非零元可逆</p>
                </div>
            </div>
        </div>
        
        <div id="hierarchyInfo" style="margin-top: 30px;"></div>
    `;

    updateProperties();
}

function showHierarchyInfo(type, nodeEl) {
    const info = {
        'ring': {
            title: '环 (Ring)',
            desc: '集合 R 配备加法与乘法：⟨R,+⟩ 是阿贝尔群，⟨R,·⟩ 是半群（结合），乘法对加法满足左右分配律。',
            example: 'Z（整数环）、R[x]（多项式环）'
        },
        'commutative': {
            title: '可换环 (Commutative Ring)',
            desc: '乘法满足交换律：∀a,b ∈ R, ab = ba。反例：n×n 矩阵环（n≥2）乘法不交换。',
            example: 'Zₙ（模 n 剩余类环）、偶数环 2Z（无单位元）'
        },
        'domain': {
            title: '整环 (Integral Domain)',
            desc: '含幺交换且无零因子：若 ab=0，则 a=0 或 b=0，从而满足消去律。',
            example: 'Z（整数环）、Z[x]（整系数多项式环）、Zₚ（p 为素数）'
        },
        'field': {
            title: '域 (Field)',
            desc: '交换含幺环中每个非零元都有乘法逆元，于是可以做除以非零元的"除法"。有限整环必是域。',
            example: 'Q（有理数域）、R（实数域）、Z_p (p为素数)'
        }
    };

    const selected = info[type];
    document.getElementById('hierarchyInfo').innerHTML = `
        <div class="definition-item" style="border-left-width: 5px; border-left-color: var(--field-gold);">
            <h3 style="color: var(--primary-red); margin-bottom: 10px;">${selected.title}</h3>
            <p style="margin-bottom: 10px;">${selected.desc}</p>
            <p><strong>典型例子:</strong> ${selected.example}</p>
        </div>
    `;

    document.querySelectorAll('.hierarchy-node').forEach(node => node.classList.remove('active'));
    if (nodeEl) nodeEl.classList.add('active');
}

// ===== Update Properties Panel =====
function updateProperties() {
    const list = document.getElementById('propertiesList');

    if (currentMode === 'zn' || currentMode === 'properties') {
        const isField = isPrime(currentN);
        const isIntegralDomain = zeroDivisors.length === 0;

        list.innerHTML = `
            <div class="property-badge">
                <span class="property-label">交换环</span>
                <span class="property-status true">✓</span>
            </div>
            <div class="property-badge">
                <span class="property-label">整环</span>
                <span class="property-status ${isIntegralDomain ? 'true' : 'false'}">${isIntegralDomain ? '✓' : '✗'}</span>
            </div>
            <div class="property-badge">
                <span class="property-label">域</span>
                <span class="property-status ${isField ? 'true' : 'false'}">${isField ? '✓' : '✗'}</span>
            </div>
            <div class="property-badge">
                <span class="property-label">零因子数</span>
                <span class="property-status">${zeroDivisors.length}</span>
            </div>
            <div class="property-badge">
                <span class="property-label">可逆元个数</span>
                <span class="property-status">${units.length}</span>
            </div>
        `;
    } else if (currentMode === 'polynomial') {
        list.innerHTML = `
            <div class="property-badge">
                <span class="property-label">环类型</span>
                <span class="property-status">多项式环 R[x]</span>
            </div>
            <div class="property-badge">
                <span class="property-label">可换性</span>
                <span class="property-status true">✓ 可换</span>
            </div>
            <div class="property-badge">
                <span class="property-label">封闭性</span>
                <span class="property-status true">✓ 加法/乘法封闭</span>
            </div>
            <div class="property-badge">
                <span class="property-label">无限性</span>
                <span class="property-status">∞ 无穷多个元素</span>
            </div>
        `;
    } else if (currentMode === 'hierarchy') {
        list.innerHTML = `
            <div class="property-badge">
                <span class="property-label">结构层次</span>
                <span class="property-status">4层</span>
            </div>
            <div class="property-badge">
                <span class="property-label">环</span>
                <span class="property-status">基础结构</span>
            </div>
            <div class="property-badge">
                <span class="property-label">交换环</span>
                <span class="property-status">+ 交换律</span>
            </div>
            <div class="property-badge">
                <span class="property-label">整环</span>
                <span class="property-status">+ 含幺、无零因子</span>
            </div>
            <div class="property-badge">
                <span class="property-label">域</span>
                <span class="property-status">+ 可逆性</span>
            </div>
        `;
    } else {
        list.innerHTML = `
            <div class="property-badge">
                <span class="property-label">当前模式</span>
                <span class="property-status">${MODES[currentMode].title.split('(')[0]}</span>
            </div>
        `;
    }
}
