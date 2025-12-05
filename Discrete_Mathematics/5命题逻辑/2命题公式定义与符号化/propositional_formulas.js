/**
 * Propositional Formulas Visualization
 * 命题公式：政策制定的形式化
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function () {
    init();
});

// Initialize
function init() {
    setupTabs();
    setupNaryBuilder();
    setupParsingDemo();
    setupSymbolizer();
}

// Tab switching
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            // Update buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update content
            tabContents.forEach(content => content.classList.remove('active'));

            if (tab === 'bnf') {
                document.getElementById('bnfTab').classList.add('active');
                updateConcepts('bnf');
            } else if (tab === 'nary') {
                document.getElementById('naryTab').classList.add('active');
                updateConcepts('nary');
            } else if (tab === 'hierarchy') {
                document.getElementById('hierarchyTab').classList.add('active');
                updateConcepts('hierarchy');
            } else if (tab === 'symbol') {
                document.getElementById('symbolTab').classList.add('active');
                updateConcepts('symbol');
            }

            // Trigger MathJax rendering
            if (window.MathJax) {
                MathJax.typesetPromise();
            }
        });
    });
}

// Update concept panel based on tab
function updateConcepts(tab) {
    const conceptContent = document.getElementById('conceptContent');

    if (tab === 'bnf') {
        conceptContent.innerHTML = `
            <h4>BNF范式</h4>
            <p>巴科斯-诺尔范式(BNF)是一种用于描述形式语言语法的元语言，通过递归定义生成所有合法公式。</p>
            
            <h4>递归定义</h4>
            <p>命题公式通过原子公式和联结词递归构造，保证了公式集合的完备性和一致性。</p>
        `;
    } else if (tab === 'nary') {
        conceptContent.innerHTML = `
            <h4>n元公式</h4>
            <p>包含n个不同命题变元的公式。变元数量决定了公式的复杂度和真值表的规模(2^n行)。</p>
            
            <h4>政策意义</h4>
            <p>多目标政策（n>2）需要平衡更多利益，决策复杂度呈指数增长，体现治理的精细化要求。</p>
        `;
    } else if (tab === 'hierarchy') {
        conceptContent.innerHTML = `
            <h4>运算符优先级</h4>
            <p>优先级决定了公式的解析顺序，避免歧义。否定>合取>析取>蕴含>等价。</p>
            
            <h4>括号作用</h4>
            <p>括号可以改变优先级，明确运算顺序。在政策表述中相当于"首先"、"其次"等限定词。</p>
        `;
    } else {
        conceptContent.innerHTML = `
            <h4>符号化过程</h4>
            <p>将自然语言陈述转换为符号公式，实现语义的精确化和形式化，便于逻辑推理和机器处理。</p>
            
            <h4>符号体系</h4>
            <p>统一的符号系统消除了自然语言的模糊性，是数学化、法治化的基础。</p>
        `;
    }
}

// N-ary formula builder
function setupNaryBuilder() {
    const slider = document.getElementById('nSlider');
    const nValue = document.getElementById('nValue');

    slider.addEventListener('input', () => {
        const n = parseInt(slider.value);
        nValue.textContent = n;
        updateNaryDisplay(n);
    });

    // Initialize
    updateNaryDisplay(2);
}

function updateNaryDisplay(n) {
    const variablesDisplay = document.getElementById('variablesDisplay');
    const formulaExamples = document.getElementById('formulaExamples');

    // Generate variables
    const variables = [];
    for (let i = 0; i < n; i++) {
        variables.push(String.fromCharCode(112 + i)); // p, q, r, s
    }

    // Display variables
    let varsHTML = '';
    variables.forEach(v => {
        varsHTML += `<div class="var-chip">${v}</div>`;
    });
    variablesDisplay.innerHTML = varsHTML;

    // Generate example formulas
    let examplesHTML = '<h3>示例公式</h3>';

    if (n === 1) {
        examplesHTML += `
            <div class="example-formula">
                <strong>1元公式：</strong>
                <p>$p$ （原子）</p>
                <p>$\\neg p$ （否定）</p>
                <p class="policy-note">政策示例："经济发展"或"不搞一刀切"</p>
            </div>
        `;
    } else if (n === 2) {
        examplesHTML += `
            <div class="example-formula">
                <strong>2元合取：</strong>
                <p>$p \\land q$</p>
                <p class="policy-note">政策："既要发展经济(p)又要保护环境(q)"</p>
            </div>
            <div class="example-formula">
                <strong>2元蕴含：</strong>
                <p>$p \\rightarrow q$</p>
                <p class="policy-note">政策:"如果群众有需求(p)，则政府要回应(q)"</p>
            </div>
        `;
    } else if (n === 3) {
        examplesHTML += `
            <div class="example-formula">
                <strong>3元复合：</strong>
                <p>$(p \\land q) \\rightarrow r$</p>
                <p class="policy-note">政策："如果经济发展(p)且环境保护(q)，则民生改善(r)"</p>
            </div>
            <div class="example-formula">
                <strong>3元分配：</strong>
                <p>$p \\land (q \\lor r)$</p>
                <p class="policy-note">政策："坚持创新(p)并且(采用线上(q)或线下(r)服务)"</p>
            </div>
        `;
    } else {
        examplesHTML += `
            <div class="example-formula">
                <strong>4元复杂公式：</strong>
                <p>$(p \\land q) \\rightarrow (r \\lor s)$</p>
                <p class="policy-note">政策："如果经济发展(p)且环境保护(q)，则通过产业升级(r)或技术创新(s)实现"</p>
            </div>
            <div class="example-formula">
                <strong>复杂度说明：</strong>
                <p>4个变元的真值表有 $2^4 = 16$ 行</p>
                <p class="policy-note">体现多目标政策决策的复杂性</p>
            </div>
        `;
    }

    formulaExamples.innerHTML = examplesHTML;

    // Trigger MathJax
    if (window.MathJax) {
        MathJax.typesetPromise([formulaExamples]);
    }
}

// Parsing demo
function setupParsingDemo() {
    const parseBtn = document.getElementById('parseBtn');
    const formulaInput = document.getElementById('formulaInput');

    parseBtn.addEventListener('click', () => {
        const formula = formulaInput.value.trim();
        if (formula) {
            parseFormula(formula);
        }
    });

    // Set initial example and parse it immediately
    formulaInput.value = 'p ∧ q → r';
    parseFormula('p ∧ q → r');
}

function parseFormula(formula) {
    const parseTree = document.getElementById('parseTree');

    // Improved parsing with better tree visualization
    let html = '<div style="font-size: 0.9rem;"><h4 style="color: #7c3aed; margin-bottom: 12px;">解析结果：</h4>';
    html += '<div style="margin-top: 12px; padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #7c3aed;">';
    html += '<p><strong>输入公式：</strong> <code style="font-family: monospace; background: #f8fafc; padding: 2px 6px; border-radius: 4px;">' + formula + '</code></p>';
    html += '<p style="margin-top: 12px;"><strong>解析树：</strong></p>';
    html += '<pre style="font-family: monospace; margin-top: 8px; line-height: 1.8; background: #faf5ff; padding: 12px; border-radius: 6px;">';

    // Enhanced parsing logic
    if (formula.includes('→')) {
        const parts = formula.split('→');
        html += `→ (蕴含 - 主运算符)\n`;
        html += `├─ 前件: ${parts[0].trim()}\n`;
        html += `└─ 后件: ${parts[1].trim()}\n`;
        html += '</pre>';
        html += '<p style="margin-top: 12px; padding: 10px; background: #f0fdf4; border-radius: 6px; color: #166534;"><strong>政策解读：</strong>"如果' + parts[0].trim() + '，则' + parts[1].trim() + '"</p>';
    } else if (formula.includes('∧') && !formula.includes('→')) {
        const parts = formula.split('∧');
        html += `∧ (合取 - 主运算符)\n`;
        html += `├─ ${parts[0].trim()}\n`;
        html += `└─ ${parts[1].trim()}\n`;
        html += '</pre>';
        html += '<p style="margin-top: 12px; padding: 10px; background: #f0fdf4; border-radius: 6px; color: #166534;"><strong>政策解读：</strong>"既要' + parts[0].trim() + '，又要' + parts[1].trim() + '"</p>';
    } else if (formula.includes('∨')) {
        const parts = formula.split('∨');
        html += `∨ (析取 - 主运算符)\n`;
        html += `├─ ${parts[0].trim()}\n`;
        html += `└─ ${parts[1].trim()}\n`;
        html += '</pre>';
        html += '<p style="margin-top: 12px; padding: 10px; background: #f0fdf4; border-radius: 6px; color: #166534;"><strong>政策解读：</strong>"' + parts[0].trim() + '或' + parts[1].trim() + '"</p>';
    } else if (formula.includes('↔')) {
        const parts = formula.split('↔');
        html += `↔ (等价 - 主运算符)\n`;
        html += `├─ ${parts[0].trim()}\n`;
        html += `└─ ${parts[1].trim()}\n`;
        html += '</pre>';
        html += '<p style="margin-top: 12px; padding: 10px; background: #f0fdf4; border-radius: 6px; color: #166534;"><strong>政策解读：</strong>"' + parts[0].trim() + '当且仅当' + parts[1].trim() + '"</p>';
    } else if (formula.startsWith('¬')) {
        const inner = formula.substring(1).trim();
        html += `¬ (否定 - 主运算符)\n`;
        html += `└─ ${inner}\n`;
        html += '</pre>';
        html += '<p style="margin-top: 12px; padding: 10px; background: #f0fdf4; border-radius: 6px; color: #166534;"><strong>政策解读：</strong>"不' + inner + '"</p>';
    } else {
        html += `原子命题\n`;
        html += `└─ ${formula}\n`;
        html += '</pre>';
        html += '<p style="margin-top: 12px; padding: 10px; background: #fef3c7; border-radius: 6px; color: #92400e;"><strong>提示：</strong>这是一个原子命题。尝试输入包含运算符的公式，如 "p ∧ q"、"p → r"、"p ∨ q" 等</p>';
    }

    html += '</div></div>';
    parseTree.innerHTML = html;
}

// Symbolizer
function setupSymbolizer() {
    const symbolizeBtn = document.getElementById('symbolizeBtn');
    const nlInput = document.getElementById('nlInput');
    const symbolOutput = document.getElementById('symbolOutput');

    // Set initial message
    symbolOutput.innerHTML = '<p style="color: #7c3aed; font-style: italic;">请在上方输入自然语言陈述，然后点击"符号化"按钮...</p>';

    symbolizeBtn.addEventListener('click', () => {
        const text = nlInput.value.trim();
        if (text) {
            symbolizeText(text);
        } else {
            symbolOutput.innerHTML = '<p style="color: #ef4444;">⚠️ 请输入要符号化的文本</p>';
        }
    });
}

function symbolizeText(text) {
    const output = document.getElementById('symbolOutput');

    let html = '<h4 style="color: #7c3aed; margin-bottom: 12px;">符号化结果：</h4>';

    // Enhanced pattern matching with component extraction
    if (text.includes('并且') || text.includes('而且') || text.includes('又要')) {
        const parts = text.split(/并且|而且|又要/);
        html += '<div style="margin-bottom: 12px;"><strong>识别类型：</strong>合取 (∧)</div>';
        html += '<div style="padding: 16px; background: white; border-radius: 8px; border: 2px solid #10b981;">';
        html += '<p><strong>原始陈述：</strong>' + text + '</p>';
        html += '<p style="margin-top: 8px;"><strong>命题分解：</strong></p>';
        html += '<p style="margin-left: 20px;">p: ' + parts[0].replace('既要', '').trim() + '</p>';
        if (parts[1]) {
            html += '<p style="margin-left: 20px;">q: ' + parts[1].trim() + '</p>';
        }
        html += '<div style="margin-top: 12px; padding: 12px; background: #f0fdf4; border-radius: 6px; text-align: center;">';
        html += '<strong>符号化公式：</strong><br>';
        html += '<span style="font-size: 1.5rem; color: #7c3aed; font-family: monospace; font-weight: bold;">p ∧ q</span>';
        html += '</div></div>';
    } else if (text.includes('如果') && (text.includes('则') || text.includes('那么'))) {
        const ifMatch = text.match(/如果(.+?)(则|那么)(.+)/);
        html += '<div style="margin-bottom: 12px;"><strong>识别类型：</strong>蕴含 (→)</div>';
        html += '<div style="padding: 16px; background: white; border-radius: 8px; border: 2px solid #3b82f6;">';
        html += '<p><strong>原始陈述：</strong>' + text + '</p>';
        if (ifMatch) {
            html += '<p style="margin-top: 8px;"><strong>命题分解：</strong></p>';
            html += '<p style="margin-left: 20px;">p (前件): ' + ifMatch[1].trim() + '</p>';
            html += '<p style="margin-left: 20px;">q (后件): ' + ifMatch[3].trim() + '</p>';
        }
        html += '<div style="margin-top: 12px; padding: 12px; background: #eff6ff; border-radius: 6px; text-align: center;">';
        html += '<strong>符号化公式：</strong><br>';
        html += '<span style="font-size: 1.5rem; color: #7c3aed; font-family: monospace; font-weight: bold;">p → q</span>';
        html += '</div></div>';
    } else if (text.includes('当且仅当')) {
        const parts = text.split('当且仅当');
        html += '<div style="margin-bottom: 12px;"><strong>识别类型：</strong>等价 (↔)</div>';
        html += '<div style="padding: 16px; background: white; border-radius: 8px; border: 2px solid #f59e0b;">';
        html += '<p><strong>原始陈述：</strong>' + text + '</p>';
        html += '<p style="margin-top: 8px;"><strong>命题分解：</strong></p>';
        html += '<p style="margin-left: 20px;">p: ' + parts[0].trim() + '</p>';
        html += '<p style="margin-left: 20px;">q: ' + parts[1].trim() + '</p>';
        html += '<div style="margin-top: 12px; padding: 12px; background: #fef3c7; border-radius: 6px; text-align: center;">';
        html += '<strong>符号化公式：</strong><br>';
        html += '<span style="font-size: 1.5rem; color: #7c3aed; font-family: monospace; font-weight: bold;">p ↔ q</span>';
        html += '</div></div>';
    } else if (text.includes('或者') || text.includes('或')) {
        const parts = text.split(/或者|或/);
        html += '<div style="margin-bottom: 12px;"><strong>识别类型：</strong>析取 (∨)</div>';
        html += '<div style="padding: 16px; background: white; border-radius: 8px; border: 2px solid #8b5cf6;">';
        html += '<p><strong>原始陈述：</strong>' + text + '</p>';
        html += '<p style="margin-top: 8px;"><strong>命题分解：</strong></p>';
        html += '<p style="margin-left: 20px;">p: ' + parts[0].trim() + '</p>';
        if (parts[1]) {
            html += '<p style="margin-left: 20px;">q: ' + parts[1].trim() + '</p>';
        }
        html += '<div style="margin-top: 12px; padding: 12px; background: #f5f3ff; border-radius: 6px; text-align: center;">';
        html += '<strong>符号化公式：</strong><br>';
        html += '<span style="font-size: 1.5rem; color: #7c3aed; font-family: monospace; font-weight: bold;">p ∨ q</span>';
        html += '</div></div>';
    } else if (text.includes('不') || text.includes('非') || text.includes('没有')) {
        html += '<div style="margin-bottom: 12px;"><strong>识别类型：</strong>否定 (¬)</div>';
        html += '<div style="padding: 16px; background: white; border-radius: 8px; border: 2px solid #ef4444;">';
        html += '<p><strong>原始陈述：</strong>' + text + '</p>';
        html += '<p style="margin-top: 8px;"><strong>命题分解：</strong></p>';
        html += '<p style="margin-left: 20px;">p: (去掉否定词后的) ' + text.replace(/不|非|没有/g, '').trim() + '</p>';
        html += '<div style="margin-top: 12px; padding: 12px; background: #fef2f2; border-radius: 6px; text-align: center;">';
        html += '<strong>符号化公式：</strong><br>';
        html += '<span style="font-size: 1.5rem; color: #7c3aed; font-family: monospace; font-weight: bold;">¬p</span>';
        html += '</div></div>';
    } else {
        html += '<div style="padding: 16px; background: #fef3c7; border-radius: 8px; border: 2px solid #f59e0b;">';
        html += '<p style="color: #92400e;"><strong>⚠️ 未能识别明显的逻辑联结词</strong></p>';
        html += '<p style="margin-top: 8px; color: #78350f;">请尝试包含以下关键词的陈述：</p>';
        html += '<ul style="margin-top: 8px; margin-left: 20px; color: #78350f;">';
        html += '<li>"既要...又要..." 或 "...并且..." (合取)</li>';
        html += '<li>"如果...则..." 或 "如果...那么..." (蕴含)</li>';
        html += '<li>"...当且仅当..." (等价)</li>';
        html += '<li>"...或..." 或 "...或者..." (析取)</li>';
        html += '<li>"不..." 或 "非..." (否定)</li>';
        html += '</ul></div>';
    }

    output.innerHTML = html;
}
