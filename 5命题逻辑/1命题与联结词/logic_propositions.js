/**
 * Propositional Logic Visualization
 * 命题与联结词：治理的逻辑
 */

// Initialize
function init() {
    setupModeSwitch();
    setupTruthTableBuilder();
}

// Mode switching
function setupModeSwitch() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    const modeContents = document.querySelectorAll('.mode-content');

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;

            // Update buttons
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update content
            modeContents.forEach(content => content.classList.remove('active'));

            if (mode === 'basic') {
                document.getElementById('basicMode').classList.add('active');
                updateKnowledge('basic');
            } else if (mode === 'connectives') {
                document.getElementById('connectivesMode').classList.add('active');
                updateKnowledge('connectives');
            } else if (mode === 'truth') {
                document.getElementById('truthMode').classList.add('active');
                updateKnowledge('truth');
            }
        });
    });
}

// Update knowledge panel based on mode
function updateKnowledge(mode) {
    const knowledgeContent = document.getElementById('knowledgeContent');

    if (mode === 'basic') {
        knowledgeContent.innerHTML = `
            <h4>命题定义</h4>
            <p>命题是能够判断真假的陈述句，具有确定的真值（真或假）。</p>
            
            <h4>分类</h4>
            <ul>
                <li><strong>简单命题：</strong>不包含联结词的命题</li>
                <li><strong>复合命题：</strong>由简单命题通过联结词组合而成</li>
            </ul>
            
            <h4>治理启示</h4>
            <p>政策是否有效、目标是否达成，都需要明确的判断标准，体现了治理的严谨性。</p>
        `;
    } else if (mode === 'connectives') {
        knowledgeContent.innerHTML = `
            <h4>五种基本联结词</h4>
            <ul>
                <li><strong>否定 (¬)：</strong>改变命题真值</li>
                <li><strong>合取 (∧)：</strong>两者都真时为真</li>
                <li><strong>析取 (∨)：</strong>至少一个真时为真</li>
                <li><strong>条件 (→)：</strong>前真后假时为假</li>
                <li><strong>等价 (↔)：</strong>真值相同时为真</li>
            </ul>
            
            <h4>治理应用</h4>
            <p>"既要...又要..."是合取逻辑，"如果...则..."是条件逻辑，体现了政策设计的逻辑思维。</p>
        `;
    } else {
        knowledgeContent.innerHTML = `
            <h4>真值表</h4>
            <p>真值表列出所有可能的真值组合，用于分析复合命题的逻辑性质。</p>
            
            <h4>应用价值</h4>
            <ul>
                <li>验证逻辑推理的正确性</li>
                <li>判断命题是否为重言式（永真）</li>
                <li>判断命题是否为矛盾式（永假）</li>
            </ul>
            
            <h4>治理价值</h4>
            <p>通过真值表分析，确保政策逻辑的严密性，避免自相矛盾的决策。</p>
        `;
    }
}

// Truth table builder
function setupTruthTableBuilder() {
    const buildBtn = document.getElementById('buildTable');
    const connectiveSelect = document.getElementById('connectiveSelect');

    // Update when button clicked
    buildBtn.addEventListener('click', () => {
        const type = connectiveSelect.value;
        buildTruthTable(type);
    });

    // Auto-update when dropdown selection changes
    connectiveSelect.addEventListener('change', () => {
        const type = connectiveSelect.value;
        buildTruthTable(type);
    });

    // Build initial table
    buildTruthTable('and');
}

function buildTruthTable(type) {
    const container = document.getElementById('truthTableContainer');

    let headers, rows, title;

    switch (type) {
        case 'not':
            title = '否定 (¬p)';
            headers = ['p', '¬p'];
            rows = [
                [true, false],
                [false, true]
            ];
            break;

        case 'and':
            title = '合取 (p ∧ q)';
            headers = ['p', 'q', 'p ∧ q'];
            rows = [
                [true, true, true],
                [true, false, false],
                [false, true, false],
                [false, false, false]
            ];
            break;

        case 'or':
            title = '析取 (p ∨ q)';
            headers = ['p', 'q', 'p ∨ q'];
            rows = [
                [true, true, true],
                [true, false, true],
                [false, true, true],
                [false, false, false]
            ];
            break;

        case 'implies':
            title = '条件 (p → q)';
            headers = ['p', 'q', 'p → q'];
            rows = [
                [true, true, true],
                [true, false, false],
                [false, true, true],
                [false, false, true]
            ];
            break;

        case 'iff':
            title = '等价 (p ↔ q)';
            headers = ['p', 'q', 'p ↔ q'];
            rows = [
                [true, true, true],
                [true, false, false],
                [false, true, false],
                [false, false, true]
            ];
            break;
    }

    // Render table
    let html = `<h3>${title}</h3>`;
    html += '<table class="truth-table">';

    // Headers
    html += '<thead><tr>';
    headers.forEach(h => {
        html += `<th>${h}</th>`;
    });
    html += '</tr></thead>';

    // Rows
    html += '<tbody>';
    rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            const className = cell ? 'true' : 'false';
            const text = cell ? 'T' : 'F';
            html += `<td class="${className}">${text}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';

    html += '</table>';

    // Add governance example
    html += '<div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 10px; border-left: 4px solid #2563eb;">';
    html += '<h4 style="color: #2563eb; margin-bottom: 8px;">治理案例分析</h4>';

    switch (type) {
        case 'and':
            html += '<p style="font-size: 0.9rem; color: #64748b; line-height: 1.6;">政策"既要发展经济又要保护环境"：只有两者都实现（都为真）时，政策才算成功（为真）。这体现了可持续发展的合取逻辑。</p>';
            break;
        case 'or':
            html += '<p style="font-size: 0.9rem; color: #64748b; line-height: 1.6;">服务"可以线上办理或线下办理"：至少提供一种方式（至少一个为真），服务就是可用的（为真）。体现了灵活便民的析取逻辑。</p>';
            break;
        case 'implies':
            html += '<p style="font-size: 0.9rem; color: #64748b; line-height: 1.6;">"如果群众有需求，则政府要回应"：只有在群众有需求（前真）但政府不回应（后假）时，政府失职（为假）。体现了以人民为中心的条件逻辑。</p>';
            break;
        case 'iff':
            html += '<p style="font-size: 0.9rem; color: #64748b; line-height: 1.6;">"人民幸福当且仅当国家富强"：两者同真同假，体现了个人命运与国家命运紧密相连的等价逻辑。</p>';
            break;
        case 'not':
            html += '<p style="font-size: 0.9rem; color: #64748b; line-height: 1.6;">对"政策已完善"的否定是"政策未完善"，提醒我们任何政策都有改进空间，体现了持续优化的否定逻辑。</p>';
            break;
    }

    html += '</div>';

    container.innerHTML = html;

    // Trigger MathJax rendering
    if (window.MathJax) {
        MathJax.typesetPromise([container]);
    }
}

// Start
init();
