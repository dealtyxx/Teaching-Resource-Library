/**
 * Typical Graphs Visualization
 * 红色数理 - 几种典型图：结构之美与社会之理
 */

document.addEventListener('DOMContentLoaded', () => {
    init();
});

// ===== State =====
let canvas, ctx;
let currentType = 'n-order';
let graph = { nodes: [], edges: [] };
let canvasResizeObserver = null;
let params = {
    n: 5,
    k: 2,
    dim: 3
};

// ===== Data & Config =====
const GRAPH_TYPES = {
    'n-order': {
        title: 'n阶图 (Order-n Graph)',
        ideology: {
            title: '🏗️ 规模与基础',
            content: 'n阶图是指具有n个顶点的图。顶点数量代表了系统的规模和体量。在社会建设中，庞大的基数既是挑战也是红利，强调了"基础不牢，地动山摇"，必须重视基层建设和规模效应。'
        },
        definition: '具有n个顶点的图称为n阶图。通常用|V|=n表示。',
        controls: [
            { id: 'n', label: '顶点数 n', type: 'number', min: 1, max: 20, value: 6 }
        ]
    },
    'k-regular': {
        title: 'k-正则图 (k-Regular Graph)',
        ideology: {
            title: '⚖️ 公平与均等',
            content: '在k-正则图中，每个顶点的度数都是k。这意味着每个个体拥有完全相同的连接数和资源。这象征着社会追求的"机会均等"和"共同富裕"，体现了社会主义核心价值观中的平等理念。'
        },
        definition: '若一个图中所有顶点的度数都为k，则称该图为k-正则图。',
        controls: [
            { id: 'n', label: '顶点数 n', type: 'number', min: 3, max: 15, value: 8 },
            { id: 'k', label: '度数 k', type: 'number', min: 1, max: 7, value: 3 }
        ]
    },
    'complete': {
        title: '完全图 (Complete Graph)',
        ideology: {
            title: '🌟 民族团结 (Great Unity)',
            content: '完全图Kn中，任意两个顶点之间都有一条边相连。这象征着"万众一心"的民族大团结。每个个体都与其他所有个体紧密相连，信息畅通无阻，力量高度凝聚，是"团结就是力量"的最佳数学模型。'
        },
        definition: '具有n个顶点，且任意两个顶点之间都有边相连的无向简单图，记为Kn。边数为 n(n-1)/2。',
        controls: [
            { id: 'n', label: '顶点数 n', type: 'number', min: 2, max: 12, value: 5 }
        ]
    },
    'tournament': {
        title: '竞赛图 (Tournament Graph)',
        ideology: {
            title: '🏆 竞争与择优',
            content: '竞赛图是基图为完全图的有向图。任意两点间必有且仅有一个方向的连接，模拟了循环赛的结果。它揭示了社会发展中的竞争机制，通过公平竞争实现优胜劣汰，激发活力。'
        },
        definition: '基图为完全图的有向图。即任意两个顶点u,v之间，或者有边u→v，或者有边v→u，二者必居其一。',
        controls: [
            { id: 'n', label: '顶点数 n', type: 'number', min: 2, max: 10, value: 5 }
        ]
    },
    'petersen': {
        title: '彼得森图 (Petersen Graph)',
        ideology: {
            title: '⭐ 结构与稳定',
            content: '彼得森图是一个特殊的3-正则图，具有高度的对称性和美学价值。它常被用作图论中的反例，提醒我们在追求普遍规律时，也要注意特殊的结构性例外，体现了辩证唯物主义的观点。'
        },
        definition: '一个具有10个顶点和15条边的3-正则图。通常画作一个五角星内接于一个五边形，对应顶点相连。',
        controls: [] // Fixed structure
    },
    'k-cube': {
        title: 'k立方体图 (k-Cube Graph)',
        ideology: {
            title: '🧊 多维发展',
            content: 'k立方体图Qk展示了从低维到高维的演进。随着维度k的增加，系统的复杂度和连接能力呈指数级增长。这象征着社会的"多维发展"——经济、政治、文化、社会、生态文明全面进步。'
        },
        definition: '顶点集为所有长度为k的01串，两个顶点相邻当且仅当它们的二进制串恰有一位不同。顶点数2^k，是k-正则图。',
        controls: [
            { id: 'dim', label: '维度 k', type: 'number', min: 1, max: 5, value: 3 }
        ]
    }
};

// ===== Initialization =====
function init() {
    canvas = document.getElementById('graphCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    if ('ResizeObserver' in window) {
        canvasResizeObserver = new ResizeObserver(() => resizeCanvas());
        canvasResizeObserver.observe(canvas.parentElement);
    }

    setupNavigation();
    loadGraphType('n-order');
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const width = Math.max(1, Math.round(container.clientWidth));
    const height = Math.max(1, Math.round(container.clientHeight));
    if (canvas.width === width && canvas.height === height && currentType) return;
    canvas.width = width;
    canvas.height = height;
    if (currentType) generateGraph();
}

function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadGraphType(btn.dataset.type);
        });
    });
}

// ===== Logic =====
function loadGraphType(type) {
    currentType = type;
    const config = GRAPH_TYPES[type];

    // Update UI
    document.getElementById('graphTitle').textContent = config.title;
    document.getElementById('definitionContent').innerHTML = `
        <p>${config.definition}</p>
        <div class="math-formula" id="formulaDisplay"></div>
    `;
    document.getElementById('ideologyBox').innerHTML = `
        <div class="ideology-title">${config.ideology.title}</div>
        <div class="ideology-content">${config.ideology.content}</div>
    `;

    // Setup Controls
    const controlsDiv = document.getElementById('canvasControls');
    controlsDiv.innerHTML = '';
    config.controls.forEach(ctrl => {
        const item = document.createElement('div');
        item.className = 'control-item';
        item.innerHTML = `
            <span class="control-label">${ctrl.label}</span>
            <input type="${ctrl.type}" class="control-input" id="ctrl-${ctrl.id}" 
                   min="${ctrl.min}" max="${ctrl.max}" value="${params[ctrl.id] || ctrl.value}">
        `;
        controlsDiv.appendChild(item);

        // Bind event
        const input = item.querySelector('input');
        input.addEventListener('change', (e) => {
            let val = parseInt(e.target.value);
            if (val < ctrl.min) val = ctrl.min;
            if (val > ctrl.max) val = ctrl.max;
            params[ctrl.id] = val;
            e.target.value = val;
            generateGraph();
        });

        // Update params init
        params[ctrl.id] = ctrl.value;
    });

    // Add Regenerate Button for some types
    if (type === 'n-order' || type === 'tournament') {
        const btn = document.createElement('button');
        btn.className = 'control-btn';
        btn.textContent = '🎲 随机生成';
        btn.onclick = generateGraph;
        controlsDiv.appendChild(btn);
    }

    generateGraph();
}

function generateGraph() {
    const type = currentType;
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.35;

    graph = { nodes: [], edges: [], directed: false };

    if (type === 'n-order') {
        const n = params.n;
        // Generate n nodes in circle
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            graph.nodes.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), label: i + 1 });
        }
        // Random edges
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (Math.random() > 0.5) graph.edges.push({ from: i, to: j });
            }
        }
    }
    else if (type === 'k-regular') {
        const n = params.n;
        const k = params.k;

        if (k >= n || (n * k) % 2 !== 0) {
            alert(`无法构造 n=${n}, k=${k} 的正则图 (nk必须为偶数且k<n)`);
            return;
        }

        // Generate nodes
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            graph.nodes.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), label: i + 1 });
        }

        // Generate edges for k-regular
        // Simple algorithm for circular layout
        // Connect i to i+1, i+2, ... i+(k/2) etc.
        // This is a simplified generator, might not cover all k-regular structures
        const edges = new Set();

        for (let i = 0; i < n; i++) {
            for (let j = 1; j <= k / 2; j++) {
                const target = (i + j) % n;
                addEdgeUnique(edges, i, target);
            }
            if (k % 2 !== 0) {
                if (i < n / 2) {
                    const target = (i + n / 2) % n;
                    addEdgeUnique(edges, i, target);
                }
            }
        }

        edges.forEach(e => {
            const [u, v] = e.split('-').map(Number);
            graph.edges.push({ from: u, to: v });
        });
    }
    else if (type === 'complete') {
        const n = params.n;
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            graph.nodes.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), label: i + 1 });
        }
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                graph.edges.push({ from: i, to: j });
            }
        }
    }
    else if (type === 'tournament') {
        graph.directed = true;
        const n = params.n;
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            graph.nodes.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), label: i + 1 });
        }
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                // Random direction
                if (Math.random() > 0.5) graph.edges.push({ from: i, to: j });
                else graph.edges.push({ from: j, to: i });
            }
        }
    }
    else if (type === 'petersen') {
        // Outer pentagon
        const r1 = r;
        const r2 = r * 0.5;
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
            graph.nodes.push({ x: cx + r1 * Math.cos(angle), y: cy + r1 * Math.sin(angle), label: i + 1 });
        }
        // Inner pentagon (star)
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
            graph.nodes.push({ x: cx + r2 * Math.cos(angle), y: cy + r2 * Math.sin(angle), label: i + 6 });
        }

        // Edges
        // Outer cycle
        for (let i = 0; i < 5; i++) graph.edges.push({ from: i, to: (i + 1) % 5 });
        // Inner star (0-2, 1-3, 2-4, 3-0, 4-1 in inner indices)
        // Indices are 5 to 9
        graph.edges.push({ from: 5, to: 7 });
        graph.edges.push({ from: 6, to: 8 });
        graph.edges.push({ from: 7, to: 9 });
        graph.edges.push({ from: 8, to: 5 });
        graph.edges.push({ from: 9, to: 6 });
        // Spokes
        for (let i = 0; i < 5; i++) graph.edges.push({ from: i, to: i + 5 });
    }
    else if (type === 'k-cube') {
        const k = params.dim;
        const numNodes = Math.pow(2, k);

        // Simple projection for hypercube
        // Recursive layout or simple bit-based layout
        // For visual clarity up to 4D, we can use specific offsets

        const nodes = [];
        for (let i = 0; i < numNodes; i++) {
            // Calculate position based on bits
            let x = cx;
            let y = cy;

            // Basis vectors for projection
            const vectors = [
                { x: 60, y: 0 },
                { x: 0, y: -60 },
                { x: 40, y: 25 }, // Z
                { x: -20, y: 30 }, // W
                { x: 10, y: 10 }   // 5D
            ];

            // Scale down for higher dims
            const scale = 1.5 / (1 + k * 0.2);

            for (let bit = 0; bit < k; bit++) {
                if ((i >> bit) & 1) {
                    x += vectors[bit].x * scale;
                    y += vectors[bit].y * scale;
                } else {
                    x -= vectors[bit].x * scale;
                    y -= vectors[bit].y * scale;
                }
            }

            // Binary label
            let label = i.toString(2).padStart(k, '0');
            graph.nodes.push({ x, y, label });
        }

        // Edges: connect if Hamming distance is 1
        for (let i = 0; i < numNodes; i++) {
            for (let j = i + 1; j < numNodes; j++) {
                // Check if power of 2 (only 1 bit diff)
                const diff = i ^ j;
                if ((diff & (diff - 1)) === 0) {
                    graph.edges.push({ from: i, to: j });
                }
            }
        }
    }

    drawGraph();
    updateStats();
}

function addEdgeUnique(set, u, v) {
    const min = Math.min(u, v);
    const max = Math.max(u, v);
    set.add(`${min}-${max}`);
}

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Edges
    graph.edges.forEach(e => {
        const n1 = graph.nodes[e.from];
        const n2 = graph.nodes[e.to];

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = '#1890ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (graph.directed) {
            drawArrow(n1, n2);
        }
    });

    // Nodes
    graph.nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 18, 0, 2 * Math.PI);
        ctx.fillStyle = '#e6f7ff';
        ctx.fill();
        ctx.strokeStyle = '#1890ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#1890ff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label, n.x, n.y);
    });
}

function drawArrow(from, to) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const r = 18;
    const endX = to.x - r * Math.cos(angle);
    const endY = to.y - r * Math.sin(angle);
    const arrowLen = 10;

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - arrowLen * Math.cos(angle - Math.PI / 6), endY - arrowLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - arrowLen * Math.cos(angle + Math.PI / 6), endY - arrowLen * Math.sin(angle + Math.PI / 6));
    ctx.fillStyle = '#1890ff';
    ctx.fill();
}

function updateStats() {
    const list = document.getElementById('statsList');
    const n = graph.nodes.length;
    const m = graph.edges.length;

    let html = `
        <div class="stat-item">
            <span class="stat-label">顶点数 |V|</span>
            <span class="stat-value">${n}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">边数 |E|</span>
            <span class="stat-value">${m}</span>
        </div>
    `;

    if (currentType === 'complete') {
        html += `
            <div class="stat-item">
                <span class="stat-label">理论边数 n(n-1)/2</span>
                <span class="stat-value">${n * (n - 1) / 2}</span>
            </div>
        `;
    } else if (currentType === 'k-cube') {
        html += `
            <div class="stat-item">
                <span class="stat-label">理论顶点数 2^k</span>
                <span class="stat-value">${Math.pow(2, params.dim)}</span>
            </div>
        `;
    }

    list.innerHTML = html;
}
