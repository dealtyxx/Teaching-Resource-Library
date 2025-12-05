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
            title: '🔢 循环往复：社会发展的辩证螺旋',
            content: 'Zn环体现了循环性：加法运算模n后回到起点，如同昼夜交替、四季轮回。这启示我们：社会发展是螺旋上升的过程，每一次"归零"都是新起点。经济周期、历史轮回，都遵循这一规律，但每个周期都包含新的质的飞跃。'
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
                <li>零因子标红🔴，单位元标绿🟢</li>
                <li>当n为素数时，Zn是域✨</li>
            </ul>
        `
    },
    'polynomial': {
        title: '多项式环 (Polynomial Ring)',
        ideology: {
            title: '📐 无限可能：从有限到无限的创造',
            content: '多项式环展示了"有限生成无限"的哲学。从有限的系数和一个变量x，我们可以构建无穷多个多项式。这象征着创新思维：用有限的资源，通过组合和创造，产生无限的价值。社会主义建设正是如此——立足现实条件，创造无限可能。'
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
            content: '整环的"无零因子"性质体现了逻辑的严密性：若ab=0，则a=0或b=0。这意味着没有"逻辑漏洞"——真理不能从虚假推导。科学研究和理论建设都需要这种严谨：每一步推理都要经得起检验，不能有任何"零因子"式的漏洞。'
        },
        definition: `
            <div class="definition-item">
                <strong>整环 (Integral Domain)</strong><br>
                无零因子的可换环:<br>
                ∀ a,b ≠ 0: ab ≠ 0
            </div>
            <div class="definition-item">
                <strong>零因子 (Zero Divisor)</strong><br>
                非零元a使得存在非零b满足 ab = 0
            </div>
            <div class="definition-item">
                <strong>单位 (Unit)</strong><br>
                有乘法逆元的元素:<br>
                ∃ b: ab = 1
            </div>
        `,
        controls: [
            { type: 'label', text: '检验当前环:' },
            { type: 'info', text: `Z_${currentN}` }
        ],
        instructions: `
            <ul>
                <li>自动检测当前环的性质</li>
                <li>识别所有零因子（若存在）</li>
                <li>识别所有单位元</li>
                <li>判定是否为整环/域</li>
            </ul>
        `
    },
    'hierarchy': {
        title: '结构层次 (Structure Hierarchy)',
        ideology: {
            title: '🏛️ 完整体系：理论的层次性',
            content: '从环到可换环、整环、域，展示了代数结构的层层递进。每一层都在上一层基础上增加新性质，最终达到"域"的完美状态。这体现了理论体系的建设规律：从简单到复杂，从基础到完善，最终形成完整的、自洽的理论大厦——如同马克思主义理论体系。'
        },
        definition: `
            <div class="definition-item">
                <strong>层次关系</strong><br>
                Ring ⊃ Commutative Ring ⊃ Integral Domain ⊃ Field
            </div>
            <div class="definition-item">
                <strong>性质累加</strong><br>
                Ring → + 交换律 → Comm. Ring<br>
                Comm. Ring → + 无零因子 → Domain<br>
                Domain → + 逆元存在 → Field
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
            input.value = ctrl.value;
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
        generateZn();
        if (currentMode === 'properties') {
            loadPropertiesMode();
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
        <div id="cellDetail" style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; display: none;"></div>
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
            '<p style="color: #c62828;">⚠️ 这是一对零因子！</p>' : ''}
        ${parseInt(result) === 1 && op === 'mult' ?
            `<p style="color: var(--domain-green);">✓ ${i} 和 ${j} 互为乘法逆元（单位元）</p>` : ''}
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
        <h3>Z_${currentN} 的性质分析</h3>
        
        <div class="definition-item">
            <strong>零因子 (Zero Divisors)</strong><br>
            ${zeroDivisors.length > 0 ? zeroDivisors.join(', ') : '✓ 无零因子'}
        </div>
        
        <div class="definition-item">
            <strong>单位 (Units)</strong><br>
            {1${units.length > 0 ? ', ' + units.join(', ') : ''}}
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
            <strong>🌟 Z_${currentN} 是域！</strong><br>
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
                <div class="hierarchy-node" onclick="showHierarchyInfo('ring')">
                    <h4>环 (Ring)</h4>
                    <p>加法群 + 乘法半群</p>
                </div>
            </div>
            
            <div class="hierarchy-arrow"></div>
            
            <div class="hierarchy-level">
                <div class="hierarchy-node" onclick="showHierarchyInfo('commutative')">
                    <h4>可换环 (Commutative Ring)</h4>
                    <p>+ 乘法交换律</p>
                </div>
            </div>
            
            <div class="hierarchy-arrow"></div>
            
            <div class="hierarchy-level">
                <div class="hierarchy-node" onclick="showHierarchyInfo('domain')">
                    <h4>整环 (Integral Domain)</h4>
                    <p>+ 无零因子</p>
                </div>
            </div>
            
            <div class="hierarchy-arrow"></div>
            
            <div class="hierarchy-level">
                <div class="hierarchy-node" onclick="showHierarchyInfo('field')">
                    <h4>域 (Field)</h4>
                    <p>+ 所有非零元可逆</p>
                </div>
            </div>
        </div>
        
        <div id="hierarchyInfo" style="margin-top: 30px;"></div>
    `;

    updateProperties();
}

function showHierarchyInfo(type) {
    const info = {
        'ring': {
            title: '环 (Ring)',
            desc: '集合R配备两个二元运算（加法和乘法），满足加法交换群、乘法结合性、分配律。',
            example: 'Z（整数环）、R[x]（多项式环）'
        },
        'commutative': {
            title: '可换环 (Commutative Ring)',
            desc: '乘法满足交换律：∀a,b ∈ R, ab = ba。体现平等互惠原则。',
            example: 'Zn（模n剩余类环）、实数域R'
        },
        'domain': {
            title: '整环 (Integral Domain)',
            desc: '无零因子：若ab=0，则a=0或b=0。逻辑严密，无漏洞。',
            example: 'Z（整数环）、Z_p (p为素数)'
        },
        'field': {
            title: '域 (Field)',
            desc: '每个非零元都有乘法逆元。完美的代数结构，所有"除法"都有定义。',
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
    event.target.closest('.hierarchy-node').classList.add('active');
}

// ===== Update Properties Panel =====
function updateProperties() {
    const list = document.getElementById('propertiesList');

    if (currentMode === 'zn' || currentMode === 'properties') {
        const isField = isPrime(currentN);
        const isIntegralDomain = zeroDivisors.length === 0;

        list.innerHTML = `
            <div class="property-badge">
                <span class="property-label">可换环</span>
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
                <span class="property-label">单位数</span>
                <span class="property-status">${units.length + 1}</span>
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
                <span class="property-label">Ring</span>
                <span class="property-status">基础结构</span>
            </div>
            <div class="property-badge">
                <span class="property-label">Comm. Ring</span>
                <span class="property-status">+ 交换律</span>
            </div>
            <div class="property-badge">
                <span class="property-label">Domain</span>
                <span class="property-status">+ 无零因子</span>
            </div>
            <div class="property-badge">
                <span class="property-label">Field</span>
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
