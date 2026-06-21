/**
 * Logic System Properties Visualization
 * 红色数理 - 命题推理系统及性质
 */

document.addEventListener('DOMContentLoaded', () => {
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
        init();
    }, 100);
});

// --- State ---
let activeTab = 'reliability';
const state = {
    reliability: { solved: false },
    consistency: { nodes: [], edges: [], solved: false, draw: null },
    completeness: { islands: [], bridges: [], solved: false, draw: null },
    godel: { height: 0, limit: 10, solved: false }
};

// --- Content Data ---
const CONTENT = {
    reliability: {
        insight: `
            <h4>🔍 实事求是 (Seeking Truth)</h4>
            <p>可靠性保证了"真金不怕火炼"。如果前提是真理，通过正确的逻辑推导，结论必然是真理。</p>
            <p>在实践中，我们必须剔除错误的思维方式（诡辩），确保决策依据和推理过程的科学性。</p>
        `,
        concept: `
            <p><strong>定义：</strong>如果 $\\Gamma \\vdash A$，则 $\\Gamma \\vDash A$。</p>
            <p><strong>含义：</strong>语法上可证的，语义上必为真。</p>
            <p><strong>隐喻：</strong>生产线的质量控制。不合格的机器（错误规则）会生产出次品（谬误）。</p>
        `
    },
    consistency: {
        insight: `
            <h4>⚖️ 步调一致 (Unity)</h4>
            <p>一致性是理论大厦稳固的基石。一个包含矛盾的系统（$A$ 和 $\\neg A$ 同时成立）会导致"爆炸"，推导出任何荒谬的结论。</p>
            <p>我们要维护思想的纯洁性和统一性，及时消除内部矛盾。</p>
        `,
        concept: `
            <p><strong>定义：</strong>不存在公式 $A$，使得 $\\vdash A$ 且 $\\vdash \\neg A$。</p>
            <p><strong>含义：</strong>系统内部无逻辑冲突。</p>
            <p><strong>隐喻：</strong>电路短路。矛盾会导致系统崩溃。</p>
        `
    },
    completeness: {
        insight: `
            <h4>🌉 理论自信 (Confidence)</h4>
            <p>完备性意味着我们的理论体系足够强大，能够覆盖所有真理。只要是客观存在的真理，都能被我们的逻辑证明。</p>
            <p>这象征着我们对理论体系解决实际问题的能力充满信心。</p>
        `,
        concept: `
            <p><strong>定义：</strong>如果 $\\Gamma \\vDash A$，则 $\\Gamma \\vdash A$。</p>
            <p><strong>含义：</strong>语义上为真的，语法上必可证。</p>
            <p><strong>隐喻：</strong>桥梁建设。真理岛屿不应成为孤岛。</p>
        `
    },
    godel: {
        insight: `
            <h4>🧗 永无止境 (Endless)</h4>
            <p>哥德尔定理告诉我们，真理是无限的，而任何固定的体系都有其局限性。</p>
            <p>我们不能僵化地守着教条，而必须通过"实践创新"不断引入新知，推动理论体系向更高层次发展。</p>
        `,
        concept: `
            <p><strong>定义：</strong>任何包含算术的足够强的一致形式系统，都存在不可判定命题。</p>
            <p><strong>含义：</strong>系统总有无法自证的真理。</p>
            <p><strong>隐喻：</strong>攀登高峰。每到达一个高度，都能看到更高的风景。</p>
        `
    }
};

function init() {
    setupTabs();
    updateSidebar();

    // Expose global function for onclick
    window.toggleProcessor = toggleProcessor;

    // Initialize games
    initReliabilityGame();
    initConsistencyGame();
    initCompletenessGame();
    initGodelGame();
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.module-section').forEach(m => m.classList.add('hidden'));
            document.getElementById(btn.dataset.tab).classList.remove('hidden');

            activeTab = btn.dataset.tab;
            updateSidebar();

            // Trigger redraw for canvas games when tab becomes visible
            if (activeTab === 'consistency' && state.consistency.draw) {
                requestAnimationFrame(() => state.consistency.draw());
            }
            if (activeTab === 'completeness' && state.completeness.draw) {
                requestAnimationFrame(() => state.completeness.draw());
            }
        });
    });
}

function updateSidebar() {
    const data = CONTENT[activeTab];
    document.getElementById('insightContent').innerHTML = data.insight;
    document.getElementById('conceptContent').innerHTML = data.concept;
    if (window.MathJax) window.MathJax&&window.MathJax.typesetPromise&&MathJax.typesetPromise();
}

// --- Module 1: Reliability (Fallacy Detector) ---
function initReliabilityGame() {
    const container = document.getElementById('reliabilityGame');
    container.innerHTML = `
        <div class="production-line">
            <div class="node input">真理<br>(True)</div>
            <div class="arrow">→</div>
            <div class="node processor" id="proc1" onclick="toggleProcessor('proc1')">规则 A<br>(MP)</div>
            <div class="arrow">→</div>
            <div class="node processor bad" id="proc2" onclick="toggleProcessor('proc2')">诡辩 B<br>(Fallacy)</div>
            <div class="arrow">→</div>
            <div class="node processor" id="proc3" onclick="toggleProcessor('proc3')">规则 C<br>(HS)</div>
            <div class="arrow">→</div>
            <div class="node output" id="relOutput">???</div>
        </div>
        <div style="position:absolute; bottom: 20px; text-align:center; width:100%;">
            <p id="relMsg">点击"诡辩"模块将其移除，确保输出为真。</p>
        </div>
    `;
    checkReliability();
}

function toggleProcessor(id) {
    const el = document.getElementById(id);
    if (el.style.opacity === '0.2') {
        el.style.opacity = '1';
        el.classList.remove('disabled');
    } else {
        el.style.opacity = '0.2';
        el.classList.add('disabled');
    }
    checkReliability();
}

function checkReliability() {
    const p1 = document.getElementById('proc1');
    const p2 = document.getElementById('proc2');
    const p3 = document.getElementById('proc3');
    const output = document.getElementById('relOutput');
    const msg = document.getElementById('relMsg');

    let val = true;
    if (!p1.classList.contains('disabled')) val = val && true;
    if (!p2.classList.contains('disabled')) val = false;
    if (!p3.classList.contains('disabled')) val = val && true;

    if (val) {
        output.innerText = "真理";
        output.style.background = "#e8f5e9";
        output.style.color = "#2e7d32";
        if (p2.classList.contains('disabled')) {
            msg.innerHTML = "<span style='color:green'>🎉 成功！剔除诡辩，保证了推理的可靠性！</span>";
        }
    } else {
        output.innerText = "谬误";
        output.style.background = "#ffebee";
        output.style.color = "#c62828";
        msg.innerText = "警告：输出包含谬误！请检查处理流程。";
    }
}

// --- Module 2: Consistency (Circuit Stabilizer) ---
function initConsistencyGame() {
    const canvas = document.getElementById('consistencyCanvas');
    const ctx = canvas.getContext('2d');

    const nodes = [
        { x: 100, y: 150, label: 'A (前提)', type: 'axiom' },
        { x: 300, y: 100, label: 'B', type: 'var' },
        { x: 300, y: 200, label: '¬B', type: 'var' },
        { x: 500, y: 150, label: '💥 矛盾', type: 'conflict' }
    ];

    const edges = [
        { from: 0, to: 1, active: true, label: '推导1' },
        { from: 0, to: 2, active: true, label: '谣言', isRumor: true },
        { from: 1, to: 3, active: true },
        { from: 2, to: 3, active: true }
    ];

    function draw() {
        if (canvas.parentElement.clientWidth === 0) return;
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        edges.forEach((e) => {
            if (!e.active) return;
            const n1 = nodes[e.from];
            const n2 = nodes[e.to];

            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = e.isRumor ? '#ff9800' : '#ccc';
            ctx.lineWidth = 3;
            ctx.stroke();

            if (e.label) {
                ctx.fillStyle = '#666';
                ctx.font = "12px Arial";
                ctx.fillText(e.label, (n1.x + n2.x) / 2, (n1.y + n2.y) / 2 - 10);
            }
        });

        nodes.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 30, 0, Math.PI * 2);
            ctx.fillStyle = n.type === 'conflict' ? '#f44336' : (n.type === 'axiom' ? '#2196f3' : 'white');
            ctx.fill();
            ctx.strokeStyle = '#666';
            ctx.stroke();
            ctx.fillStyle = n.type === 'conflict' ? 'white' : 'black';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = "12px Arial";
            ctx.fillText(n.label, n.x, n.y);
        });

        if (!edges[1].active) {
            ctx.font = "20px Arial";
            ctx.fillStyle = "green";
            ctx.textAlign = "center";
            ctx.fillText("🎉 系统已恢复一致性！", canvas.width / 2, 50);
        }
    }

    state.consistency.draw = draw;

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const n1 = nodes[0];
        const n2 = nodes[2];
        const cx = (n1.x + n2.x) / 2;
        const cy = (n1.y + n2.y) / 2;

        if (Math.abs(x - cx) < 50 && Math.abs(y - cy) < 30) {
            edges[1].active = false;
            draw();
        }
    });

    draw();
    window.addEventListener('resize', draw);
}

// --- Module 3: Completeness (Bridge Builder) ---
function initCompletenessGame() {
    const canvas = document.getElementById('completenessCanvas');
    const ctx = canvas.getContext('2d');

    const mainland = { x: 100, y: 200, r: 40, label: '公理大陆' };
    const islands = [
        { x: 300, y: 100, r: 25, label: '真理1', connected: false },
        { x: 400, y: 200, r: 25, label: '真理2', connected: false },
        { x: 300, y: 300, r: 25, label: '真理3', connected: false }
    ];

    function draw() {
        if (canvas.parentElement.clientWidth === 0) return;
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        islands.forEach(isl => {
            if (isl.connected) {
                ctx.beginPath();
                ctx.moveTo(mainland.x, mainland.y);
                ctx.lineTo(isl.x, isl.y);
                ctx.strokeStyle = '#4caf50';
                ctx.lineWidth = 4;
                ctx.stroke();
            }
        });

        ctx.beginPath();
        ctx.arc(mainland.x, mainland.y, mainland.r, 0, Math.PI * 2);
        ctx.fillStyle = '#ff9800';
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(mainland.label, mainland.x, mainland.y);

        islands.forEach(isl => {
            ctx.beginPath();
            ctx.arc(isl.x, isl.y, isl.r, 0, Math.PI * 2);
            ctx.fillStyle = isl.connected ? '#4caf50' : '#ccc';
            ctx.fill();
            ctx.strokeStyle = '#666';
            ctx.stroke();
            ctx.fillStyle = 'white';
            ctx.font = "12px Arial";
            ctx.fillText(isl.label, isl.x, isl.y);
        });

        if (islands.every(i => i.connected)) {
            ctx.font = "20px Arial";
            ctx.fillStyle = "green";
            ctx.textAlign = "center";
            ctx.fillText("🎉 完备性得证：所有真理皆可到达！", canvas.width / 2, 50);
        } else {
            ctx.font = "14px Arial";
            ctx.fillStyle = "#666";
            ctx.textAlign = "center";
            ctx.fillText("点击真理岛屿，建立逻辑桥梁", canvas.width / 2, 50);
        }
    }

    state.completeness.draw = draw;

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        islands.forEach(isl => {
            const dx = x - isl.x;
            const dy = y - isl.y;
            if (dx * dx + dy * dy < isl.r * isl.r) {
                isl.connected = true;
                draw();
            }
        });
    });

    draw();
    window.addEventListener('resize', draw);
}

// --- Module 4: Godel (Infinite Climbing) ---
function initGodelGame() {
    const buildBtn = document.getElementById('buildBtn');
    const innovateBtn = document.getElementById('innovateBtn');
    const tower = document.getElementById('tower');
    const heightDisplay = document.getElementById('heightDisplay');
    const star = document.getElementById('star');

    let height = 0;
    let limit = 5;

    function update() {
        tower.style.height = (height * 20) + 'px';
        heightDisplay.innerText = `当前高度: ${height} / 极限: ${limit}`;

        star.style.bottom = (limit * 20 + 50) + 'px';

        if (height >= limit) {
            buildBtn.disabled = true;
            buildBtn.innerText = "已达系统极限";
            innovateBtn.classList.remove('hidden');
        } else {
            buildBtn.disabled = false;
            buildBtn.innerText = "🧱 逻辑推演 (Build)";
            innovateBtn.classList.add('hidden');
        }
    }

    buildBtn.onclick = () => {
        if (height < limit) {
            height++;
            update();
        }
    };

    innovateBtn.onclick = () => {
        limit += 5;
        innovateBtn.classList.add('hidden');
        alert("引入新公理！系统边界已拓展！");
        update();
    };

    update();
}
