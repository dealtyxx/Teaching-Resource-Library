// ============================================
// 全局状态管理
// ============================================
let currentAlgo = 'dijkstra';
let currentCaseIndex = 0;
let animationSpeed = 1000;
let isAnimating = false;
let currentSource = null;

// ============================================
// 案例数据
// ============================================
const CASES = [
    {
        algo: 'dijkstra',
        name: '精准扶贫最优路径',
        graph: {
            vertices: [
                {id: 'capital', name: '省会', x: 200, y: 80},
                {id: 'city1', name: '市A', x: 120, y: 180},
                {id: 'city2', name: '市B', x: 280, y: 180},
                {id: 'county1', name: '县A', x: 100, y: 280},
                {id: 'county2', name: '县B', x: 200, y: 300},
                {id: 'village', name: '贫困村', x: 200, y: 400}
            ],
            edges: [
                {from: 'capital', to: 'city1', weight: 80},
                {from: 'capital', to: 'city2', weight: 120},
                {from: 'city1', to: 'county1', weight: 50},
                {from: 'city1', to: 'county2', weight: 60},
                {from: 'city2', to: 'county2', weight: 40},
                {from: 'county1', to: 'village', weight: 45},
                {from: 'county2', to: 'village', weight: 30}
            ]
        },
        source: 'capital',
        target: 'village',
        philosophy: 'Dijkstra算法的贪心策略,恰如精准扶贫的核心理念:每一步都选择当前最优解,不走弯路,不浪费资源。算法保证找到的路径是最短的,正如扶贫工作要确保每一分资源都用在最需要的地方。'
    },
    {
        algo: 'dijkstra',
        name: '应急物流配送',
        graph: {
            vertices: [
                {id: 'center', name: '救援中心', x: 200, y: 100},
                {id: 'station1', name: '中转A', x: 120, y: 220},
                {id: 'station2', name: '中转B', x: 280, y: 220},
                {id: 'area1', name: '灾区A', x: 100, y: 340},
                {id: 'area2', name: '核心灾区', x: 200, y: 380},
                {id: 'area3', name: '灾区B', x: 300, y: 340}
            ],
            edges: [
                {from: 'center', to: 'station1', weight: 20},
                {from: 'center', to: 'station2', weight: 25},
                {from: 'station1', to: 'area1', weight: 15},
                {from: 'station1', to: 'area2', weight: 30},
                {from: 'station2', to: 'area2', weight: 18},
                {from: 'station2', to: 'area3', weight: 22},
                {from: 'area1', to: 'area2', weight: 12}
            ]
        },
        source: 'center',
        target: 'area2',
        philosophy: 'Dijkstra算法在应急救援中体现"人民至上、生命至上"的理念。算法的每一次迭代都在寻找更快的路径,正如救援人员争分夺秒挽救生命,体现了效率就是生命的紧迫意识。'
    },
    {
        algo: 'floyd',
        name: '区域协作网络',
        graph: {
            vertices: [
                {id: 'shanghai', name: '上海', x: 250, y: 250},
                {id: 'hangzhou', name: '杭州', x: 180, y: 340},
                {id: 'nanjing', name: '南京', x: 150, y: 180},
                {id: 'suzhou', name: '苏州', x: 220, y: 140},
                {id: 'ningbo', name: '宁波', x: 300, y: 370}
            ],
            edges: [
                {from: 'shanghai', to: 'suzhou', weight: 80},
                {from: 'shanghai', to: 'hangzhou', weight: 180},
                {from: 'shanghai', to: 'ningbo', weight: 200},
                {from: 'suzhou', to: 'nanjing', weight: 200},
                {from: 'hangzhou', to: 'ningbo', weight: 150},
                {from: 'nanjing', to: 'hangzhou', weight: 280}
            ]
        },
        philosophy: 'Floyd-Warshall算法体现"全局思维、系统观念"。算法通过动态规划,系统考虑所有城市对的最优连接,正如区域协调发展战略:构建整体网络,让每个节点都能找到最佳协作路径。'
    },
    {
        algo: 'floyd',
        name: '交通网络规划',
        graph: {
            vertices: [
                {id: 'a', name: '城市A', x: 120, y: 180},
                {id: 'b', name: '城市B', x: 220, y: 140},
                {id: 'c', name: '城市C', x: 280, y: 260},
                {id: 'd', name: '城市D', x: 180, y: 320},
                {id: 'e', name: '城市E', x: 80, y: 280}
            ],
            edges: [
                {from: 'a', to: 'b', weight: 50},
                {from: 'a', to: 'e', weight: 30},
                {from: 'b', to: 'c', weight: 40},
                {from: 'c', to: 'd', weight: 35},
                {from: 'd', to: 'e', weight: 45},
                {from: 'a', to: 'd', weight: 70}
            ]
        },
        philosophy: 'Floyd-Warshall的动态规划思想诠释"统筹兼顾、协调发展"。算法渐进式优化——先直达,再中转,逐步形成高效网络。这种全局观对区域协调发展至关重要。'
    }
];

// ============================================
// 算法实现
// ============================================
function dijkstra(graph, source) {
    const dist = {};
    const prev = {};
    const visited = new Set();
    const steps = [];

    // 初始化
    graph.vertices.forEach(v => {
        dist[v.id] = Infinity;
        prev[v.id] = null;
    });
    dist[source] = 0;

    steps.push({
        type: 'init',
        description: `初始化:源点${source}距离为0,其余为∞`,
        dist: {...dist},
        visited: new Set()
    });

    while (visited.size < graph.vertices.length) {
        // 找到未访问中距离最小的顶点
        let u = null;
        let minDist = Infinity;
        for (let vertex of graph.vertices) {
            if (!visited.has(vertex.id) && dist[vertex.id] < minDist) {
                minDist = dist[vertex.id];
                u = vertex.id;
            }
        }

        if (u === null || minDist === Infinity) break;

        visited.add(u);
        steps.push({
            type: 'select',
            description: `选择未访问中距离最小的顶点: ${u} (距离=${dist[u]})`,
            current: u,
            dist: {...dist},
            visited: new Set(visited)
        });

        // 更新邻居
        const neighbors = graph.edges.filter(e => e.from === u);
        for (let edge of neighbors) {
            const v = edge.to;
            if (!visited.has(v)) {
                const alt = dist[u] + edge.weight;
                if (alt < dist[v]) {
                    dist[v] = alt;
                    prev[v] = u;
                    steps.push({
                        type: 'relax',
                        description: `松弛边(${u},${v}): 距离更新为${alt}`,
                        edge: edge,
                        dist: {...dist},
                        visited: new Set(visited)
                    });
                }
            }
        }
    }

    return {dist, prev, steps};
}

function floydWarshall(graph) {
    const n = graph.vertices.length;
    const dist = Array(n).fill(0).map(() => Array(n).fill(Infinity));
    const next = Array(n).fill(0).map(() => Array(n).fill(null));
    const steps = [];

    // 初始化
    for (let i = 0; i < n; i++) {
        dist[i][i] = 0;
    }

    graph.edges.forEach(edge => {
        const i = graph.vertices.findIndex(v => v.id === edge.from);
        const j = graph.vertices.findIndex(v => v.id === edge.to);
        dist[i][j] = edge.weight;
        next[i][j] = j;
    });

    steps.push({
        type: 'init',
        description: '初始化:直接边权重,对角线为0',
        dist: dist.map(row => [...row])
    });

    // Floyd-Warshall三重循环
    for (let k = 0; k < n; k++) {
        let updated = false;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    next[i][j] = next[i][k];
                    updated = true;
                }
            }
        }
        if (updated) {
            const kName = graph.vertices[k].name;
            steps.push({
                type: 'iterate',
                description: `通过中间节点${kName}更新最短路径`,
                k: k,
                dist: dist.map(row => [...row])
            });
        }
    }

    return {dist, next, steps};
}

// ============================================
// 可视化函数
// ============================================
function renderGraph(caseData) {
    const svg = document.getElementById('graphSvg');
    const edgesGroup = document.getElementById('edgesGroup');
    const nodesGroup = document.getElementById('nodesGroup');

    edgesGroup.innerHTML = '';
    nodesGroup.innerHTML = '';

    // 绘制边
    caseData.graph.edges.forEach(edge => {
        const fromVertex = caseData.graph.vertices.find(v => v.id === edge.from);
        const toVertex = caseData.graph.vertices.find(v => v.id === edge.to);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'edge-line');
        line.setAttribute('data-from', edge.from);
        line.setAttribute('data-to', edge.to);
        line.setAttribute('x1', fromVertex.x);
        line.setAttribute('y1', fromVertex.y);
        line.setAttribute('x2', toVertex.x);
        line.setAttribute('y2', toVertex.y);

        const midX = (fromVertex.x + toVertex.x) / 2;
        const midY = (fromVertex.y + toVertex.y) / 2;

        const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        textBg.setAttribute('class', 'edge-text-bg');
        textBg.setAttribute('x', midX - 15);
        textBg.setAttribute('y', midY - 10);
        textBg.setAttribute('width', 30);
        textBg.setAttribute('height', 18);
        textBg.setAttribute('rx', 4);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'edge-text');
        text.setAttribute('x', midX);
        text.setAttribute('y', midY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.textContent = edge.weight;

        edgesGroup.appendChild(line);
        edgesGroup.appendChild(textBg);
        edgesGroup.appendChild(text);
    });

    // 绘制节点
    caseData.graph.vertices.forEach(vertex => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'node-group');
        group.setAttribute('data-id', vertex.id);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'node-circle');
        circle.setAttribute('cx', vertex.x);
        circle.setAttribute('cy', vertex.y);
        circle.setAttribute('r', 25);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'node-text');
        text.setAttribute('x', vertex.x);
        text.setAttribute('y', vertex.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.textContent = vertex.name;

        group.appendChild(circle);
        group.appendChild(text);
        nodesGroup.appendChild(group);
    });
}

async function animateDijkstra(caseData, source) {
    const result = dijkstra(caseData.graph, source);
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';

    for (let i = 0; i < result.steps.length; i++) {
        const step = result.steps[i];

        // 添加步骤
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item active';
        stepDiv.innerHTML = `<span class="step-num">${i+1}</span>${step.description}`;
        stepsList.appendChild(stepDiv);

        // 更新图形
        if (step.current) {
            document.querySelectorAll('.node-group').forEach(g => {
                g.classList.remove('current');
                if (step.visited.has(g.dataset.id)) {
                    g.classList.add('visited');
                }
            });
            const currentNode = document.querySelector(`[data-id="${step.current}"]`);
            if (currentNode) currentNode.classList.add('current');
        }

        if (step.edge) {
            const edgeLine = document.querySelector(`[data-from="${step.edge.from}"][data-to="${step.edge.to}"]`);
            if (edgeLine) {
                edgeLine.classList.add('visited');
            }
        }

        await sleep(animationSpeed);
        stepDiv.classList.remove('active');
    }

    // 显示结果
    displayDijkstraResult(caseData, source, result);
}

async function animateFloyd(caseData) {
    const result = floydWarshall(caseData.graph);
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';

    for (let i = 0; i < result.steps.length; i++) {
        const step = result.steps[i];

        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item active';
        stepDiv.innerHTML = `<span class="step-num">${i+1}</span>${step.description}`;
        stepsList.appendChild(stepDiv);

        if (step.k !== undefined) {
            const kNode = caseData.graph.vertices[step.k];
            document.querySelectorAll('.node-group').forEach(g => {
                g.classList.remove('current');
            });
            const currentNode = document.querySelector(`[data-id="${kNode.id}"]`);
            if (currentNode) currentNode.classList.add('current');
        }

        await sleep(animationSpeed);
        stepDiv.classList.remove('active');
    }

    // 显示结果
    displayFloydResult(caseData, result);
}

function displayDijkstraResult(caseData, source, result) {
    const resultDisplay = document.getElementById('resultDisplay');
    let html = `<strong>从 ${source} 出发的最短距离:</strong>`;

    caseData.graph.vertices.forEach(v => {
        if (v.id !== source) {
            const dist = result.dist[v.id];
            const path = reconstructPath(result.prev, source, v.id);
            html += `<div style="margin: 0.5rem 0;">
                <code>${v.name}</code>: 距离 <span class="path-highlight">${dist === Infinity ? '∞' : dist}</span>
                ${dist !== Infinity ? `<br>路径: ${path.join(' → ')}` : ''}
            </div>`;
        }
    });

    resultDisplay.innerHTML = html;
}

function displayFloydResult(caseData, result) {
    const resultDisplay = document.getElementById('resultDisplay');
    const n = caseData.graph.vertices.length;

    let html = '<strong>所有节点对最短距离:</strong><div style="font-size: 0.75rem; margin-top: 0.5rem;">';

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const from = caseData.graph.vertices[i].name;
            const to = caseData.graph.vertices[j].name;
            const dist = result.dist[i][j];
            if (dist !== Infinity) {
                html += `<div>${from} ↔ ${to}: <span class="path-highlight">${dist}</span></div>`;
            }
        }
    }

    html += '</div>';
    resultDisplay.innerHTML = html;
}

function reconstructPath(prev, source, target) {
    const path = [];
    let current = target;

    while (current !== null) {
        path.unshift(current);
        current = prev[current];
    }

    return path;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function resetVisualization() {
    document.querySelectorAll('.node-group').forEach(g => {
        g.classList.remove('visited', 'current', 'queue', 'start');
    });
    document.querySelectorAll('.edge-line').forEach(e => {
        e.classList.remove('visited');
    });
    document.getElementById('stepsList').innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">执行算法后显示步骤</p>';
    document.getElementById('resultDisplay').innerHTML = '<em style="color: var(--text-secondary);">执行算法后显示结果</em>';
}

// ============================================
// 事件处理
// ============================================
function loadCase(index) {
    currentCaseIndex = index;
    const caseData = CASES[index];
    currentAlgo = caseData.algo;

    // 更新算法按钮
    document.querySelectorAll('.algo-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.algo === currentAlgo);
    });

    // 更新源节点选择器
    const sourceControl = document.getElementById('sourceControl');
    const sourceSelector = document.getElementById('sourceSelector');

    if (currentAlgo === 'dijkstra') {
        sourceControl.style.display = 'flex';
        sourceSelector.innerHTML = caseData.graph.vertices.map(v =>
            `<option value="${v.id}" ${v.id === caseData.source ? 'selected' : ''}>${v.name}</option>`
        ).join('');
        currentSource = caseData.source;
    } else {
        sourceControl.style.display = 'none';
    }

    // 更新思政内涵
    document.getElementById('philosophyPanel').innerHTML =
        `<p style="font-size: 0.85rem; line-height: 1.6;">${caseData.philosophy}</p>`;

    // 渲染图形
    renderGraph(caseData);
    resetVisualization();
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 算法切换
    document.querySelectorAll('.algo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const algo = btn.dataset.algo;
            currentAlgo = algo;

            // 查找匹配算法的案例
            const matchingIndex = CASES.findIndex(c => c.algo === algo);
            if (matchingIndex !== -1) {
                document.getElementById('caseSelector').value = matchingIndex;
                loadCase(matchingIndex);
            }
        });
    });

    // 案例选择
    document.getElementById('caseSelector').addEventListener('change', (e) => {
        loadCase(parseInt(e.target.value));
    });

    // 源节点选择
    document.getElementById('sourceSelector').addEventListener('change', (e) => {
        currentSource = e.target.value;
    });

    // 速度控制
    document.getElementById('speed').addEventListener('input', (e) => {
        animationSpeed = 2000 - (e.target.value * 18);
    });

    // 执行按钮
    document.getElementById('runBtn').addEventListener('click', async () => {
        if (isAnimating) return;

        isAnimating = true;
        document.getElementById('runBtn').disabled = true;
        resetVisualization();

        const caseData = CASES[currentCaseIndex];

        if (currentAlgo === 'dijkstra') {
            await animateDijkstra(caseData, currentSource);
        } else {
            await animateFloyd(caseData);
        }

        isAnimating = false;
        document.getElementById('runBtn').disabled = false;
    });

    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (!isAnimating) {
            resetVisualization();
        }
    });

    // 初始加载
    loadCase(0);
});
