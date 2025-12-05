// ============================================
// 全局状态管理
// ============================================
let currentMatrixType = 'adjacency';
let currentCaseIndex = 0;
let animationSpeed = 800;
let isAnimating = false;

// ============================================
// 矩阵运算工具函数
// ============================================
class MatrixOps {
    // 矩阵乘法(布尔运算)
    static booleanMultiply(A, B) {
        const n = A.length;
        const m = B[0].length;
        const k = B.length;
        const result = Array(n).fill(0).map(() => Array(m).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                for (let p = 0; p < k; p++) {
                    result[i][j] = result[i][j] || (A[i][p] && B[p][j]);
                }
            }
        }
        return result;
    }

    // 矩阵加法(布尔OR)
    static booleanAdd(A, B) {
        const n = A.length;
        const m = A[0].length;
        const result = Array(n).fill(0).map(() => Array(m).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                result[i][j] = A[i][j] || B[i][j] ? 1 : 0;
            }
        }
        return result;
    }

    // 矩阵幂运算
    static booleanPower(A, n) {
        if (n === 1) return A;
        let result = A;
        for (let i = 2; i <= n; i++) {
            result = this.booleanMultiply(result, A);
        }
        return result;
    }

    // 计算可达矩阵
    static computeReachability(adjacency) {
        const n = adjacency.length;
        let reachability = adjacency.map(row => [...row]);

        for (let i = 2; i <= n; i++) {
            const power = this.booleanPower(adjacency, i);
            reachability = this.booleanAdd(reachability, power);
        }

        // 添加自反性(从自己到自己可达)
        for (let i = 0; i < n; i++) {
            reachability[i][i] = 1;
        }

        return reachability;
    }

    // 矩阵转置
    static transpose(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const result = Array(cols).fill(0).map(() => Array(rows).fill(0));

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                result[j][i] = matrix[i][j];
            }
        }
        return result;
    }
}

// ============================================
// 图数据结构
// ============================================
class GraphData {
    constructor(vertices, edges, directed = true) {
        this.vertices = vertices; // [{id, name, x, y}]
        this.edges = edges; // [{from, to, label}]
        this.directed = directed;
        this.n = vertices.length;
        this.m = edges.length;
    }

    // 构建邻接矩阵
    getAdjacencyMatrix() {
        const n = this.n;
        const matrix = Array(n).fill(0).map(() => Array(n).fill(0));

        this.edges.forEach(edge => {
            const fromIdx = this.vertices.findIndex(v => v.id === edge.from);
            const toIdx = this.vertices.findIndex(v => v.id === edge.to);

            if (fromIdx !== -1 && toIdx !== -1) {
                matrix[fromIdx][toIdx] = 1;
                if (!this.directed) {
                    matrix[toIdx][fromIdx] = 1;
                }
            }
        });

        return matrix;
    }

    // 构建可达矩阵
    getReachabilityMatrix() {
        const adjacency = this.getAdjacencyMatrix();
        return MatrixOps.computeReachability(adjacency);
    }

    // 构建关联矩阵
    getIncidenceMatrix() {
        const n = this.n;
        const m = this.m;
        const matrix = Array(n).fill(0).map(() => Array(m).fill(0));

        this.edges.forEach((edge, edgeIdx) => {
            const fromIdx = this.vertices.findIndex(v => v.id === edge.from);
            const toIdx = this.vertices.findIndex(v => v.id === edge.to);

            if (fromIdx !== -1 && toIdx !== -1) {
                matrix[fromIdx][edgeIdx] = 1;
                matrix[toIdx][edgeIdx] = 1;
            }
        });

        return matrix;
    }
}

// ============================================
// 案例数据 - 思政主题
// ============================================
const CASES = [
    {
        matrixType: 'adjacency',
        name: '党组织架构 - 邻接矩阵表示',
        description: '用邻接矩阵表示党组织的领导关系网络',

        graph: new GraphData(
            [
                {id: 'central', name: '中央', x: 400, y: 100},
                {id: 'provincial', name: '省委', x: 250, y: 200},
                {id: 'municipal', name: '市委', x: 550, y: 200},
                {id: 'county1', name: '县委A', x: 150, y: 320},
                {id: 'county2', name: '县委B', x: 350, y: 320},
                {id: 'township', name: '乡镇', x: 250, y: 440}
            ],
            [
                {from: 'central', to: 'provincial', label: '领导'},
                {from: 'central', to: 'municipal', label: '领导'},
                {from: 'provincial', to: 'county1', label: '领导'},
                {from: 'provincial', to: 'county2', label: '领导'},
                {from: 'municipal', to: 'county2', label: '协调'},
                {from: 'county1', to: 'township', label: '指导'},
                {from: 'county2', to: 'township', label: '指导'}
            ],
            true
        ),

        matrixExplanation: {
            title: '邻接矩阵A[i][j]的含义',
            meaning: 'A[i][j] = 1 表示组织i对组织j有直接领导关系',
            examples: [
                'A[中央][省委] = 1: 中央直接领导省委',
                'A[省委][县委A] = 1: 省委直接领导县委A',
                'A[中央][县委A] = 0: 中央不直接领导县委A(需通过省委)'
            ]
        },

        properties: {
            asymmetric: true,
            reason: '有向图的邻接矩阵不对称,体现了领导关系的单向性',
            outDegree: '每行的和表示该组织直接领导的下级数量',
            inDegree: '每列的和表示该组织的直接上级数量',
            significance: '清晰展示组织架构的层级关系和领导链条'
        },

        historicalContext: '党的组织体系是一个严密的网络结构,从中央到地方形成了完整的领导体系。邻接矩阵能够精确刻画这种直接领导关系,体现了民主集中制原则——既有统一领导,又有层级分工。',

        philosophy: '邻接矩阵揭示了组织关系的本质——直接连接。在党的建设中,每一个领导关系都是明确的、直接的,不存在模糊地带。矩阵的0和1,代表着组织关系的清晰性和确定性。这种精确的数学表达,正是科学管理的基础。民主集中制要求"四个服从",邻接矩阵完美地刻画了这种服从关系的结构化表达。'
    },

    {
        matrixType: 'reachability',
        name: '政策传达网络 - 可达矩阵表示',
        description: '用可达矩阵分析政策信息的传递覆盖范围',

        graph: new GraphData(
            [
                {id: 'center', name: '政策中心', x: 400, y: 100},
                {id: 'media', name: '新闻媒体', x: 250, y: 200},
                {id: 'govt', name: '政府部门', x: 550, y: 200},
                {id: 'community', name: '社区', x: 200, y: 320},
                {id: 'enterprise', name: '企业', x: 400, y: 320},
                {id: 'citizen', name: '公民', x: 600, y: 320}
            ],
            [
                {from: 'center', to: 'media', label: '发布'},
                {from: 'center', to: 'govt', label: '传达'},
                {from: 'media', to: 'community', label: '宣传'},
                {from: 'media', to: 'citizen', label: '报道'},
                {from: 'govt', to: 'enterprise', label: '通知'},
                {from: 'govt', to: 'community', label: '执行'},
                {from: 'community', to: 'citizen', label: '服务'},
                {from: 'enterprise', to: 'citizen', label: '告知'}
            ],
            true
        ),

        matrixExplanation: {
            title: '可达矩阵R[i][j]的含义',
            meaning: 'R[i][j] = 1 表示信息可以从节点i传递到节点j(允许多跳)',
            examples: [
                'R[中心][社区] = 1: 政策可经新闻媒体传达到社区',
                'R[中心][公民] = 1: 政策最终能够到达每一位公民',
                'R[公民][中心] = 0: 公民无法直接影响政策中心(单向传递)'
            ]
        },

        reachabilityComputation: {
            step1: 'A¹ - 一跳可达(直接连接)',
            step2: 'A² - 二跳可达(经过一个中间节点)',
            step3: 'A³ - 三跳可达(经过两个中间节点)',
            final: 'R = A ∨ A² ∨ A³ ∨ ... ∨ Aⁿ (布尔并)',
            meaning: '可达矩阵综合了所有可能的传递路径'
        },

        properties: {
            transitive: true,
            reason: '可达关系具有传递性:若i可达j,j可达k,则i可达k',
            coverage: '可达矩阵展示了政策传达的完整覆盖范围',
            bottleneck: '通过分析可达性,可以发现信息传递的瓶颈节点',
            significance: '确保政策能够传达到每一个角落,不留死角'
        },

        historicalContext: '政策的有效实施,关键在于传达到位。从中央到地方,从政府到群众,需要建立多层次、全覆盖的信息传递网络。可达矩阵帮助我们分析信息传递的完整路径,确保政令畅通。',

        philosophy: '可达矩阵体现了"传递性"思想。政策不仅要发布,更要确保传达。从政策中心到每一位公民,可能需要经过多个中间环节。可达矩阵告诉我们:只要存在路径,信息就能到达。这与我们党"全心全意为人民服务"的宗旨一致——政策要让人民知晓,服务要让人民感受。可达性分析帮助我们识别传递链条中的薄弱环节,确保"最后一公里"畅通无阻。'
    },

    {
        matrixType: 'incidence',
        name: '扶贫项目分配 - 关联矩阵表示',
        description: '用关联矩阵表示扶贫项目与贫困地区的对应关系',

        graph: new GraphData(
            [
                {id: 'region1', name: '山区A', x: 150, y: 150},
                {id: 'region2', name: '山区B', x: 300, y: 150},
                {id: 'region3', name: '平原C', x: 450, y: 150},
                {id: 'region4', name: '边疆D', x: 600, y: 150},
                {id: 'region5', name: '老区E', x: 375, y: 280}
            ],
            [
                {from: 'region1', to: 'region2', label: '教育扶贫', id: 'edu'},
                {from: 'region2', to: 'region3', label: '产业扶贫', id: 'industry'},
                {from: 'region3', to: 'region4', label: '医疗扶贫', id: 'health'},
                {from: 'region1', to: 'region5', label: '基建扶贫', id: 'infra'},
                {from: 'region4', to: 'region5', label: '文化扶贫', id: 'culture'}
            ],
            false
        ),

        // 关联矩阵特殊处理:顶点vs项目
        projects: [
            {id: 'edu', name: '教育扶贫', budget: '500万', regions: ['region1', 'region2']},
            {id: 'industry', name: '产业扶贫', budget: '1000万', regions: ['region2', 'region3']},
            {id: 'health', name: '医疗扶贫', budget: '300万', regions: ['region3', 'region4']},
            {id: 'infra', name: '基建扶贫', budget: '800万', regions: ['region1', 'region5']},
            {id: 'culture', name: '文化扶贫', budget: '200万', regions: ['region4', 'region5']}
        ],

        matrixExplanation: {
            title: '关联矩阵B[i][j]的含义',
            meaning: 'B[地区i][项目j] = 1 表示地区i参与了项目j',
            examples: [
                'B[山区A][教育扶贫] = 1: 山区A参与教育扶贫项目',
                'B[山区A][产业扶贫] = 0: 山区A未参与产业扶贫项目',
                '每个项目涉及2个地区(资源共享、联合攻坚)'
            ]
        },

        properties: {
            bipartite: true,
            reason: '关联矩阵描述地区(顶点)与项目(边)的二部关系',
            rowSum: '每行的和表示该地区参与的项目数量',
            colSum: '每列恰好有2个1,表示每个项目连接2个地区',
            significance: '清晰展示项目分配,避免重复和遗漏'
        },

        historicalContext: '精准扶贫要求因地制宜、精准施策。不同地区的贫困原因不同,需要的扶贫项目也不同。关联矩阵帮助我们科学分配扶贫资源,确保每个地区都能获得适合的帮扶,每个项目都能发挥最大效益。',

        philosophy: '关联矩阵体现了"对应"思想。扶贫不是"大水漫灌",而是"精准滴灌"。矩阵的行代表需求方(贫困地区),列代表供给方(扶贫项目),矩阵元素刻画了供需匹配关系。这种精准对应,正是习近平总书记提出的"精准扶贫"理念的数学表达。通过关联矩阵分析,我们可以发现:哪些地区项目过少需要增援,哪些项目覆盖不足需要调整,从而实现扶贫资源的优化配置,确保"小康路上一个都不能少"。'
    },

    {
        matrixType: 'adjacency',
        name: '"一带一路"合作网络 - 综合案例',
        description: '用三种矩阵全面分析"一带一路"沿线国家的合作关系',

        graph: new GraphData(
            [
                {id: 'china', name: '中国', x: 400, y: 250},
                {id: 'pakistan', name: '巴基斯坦', x: 250, y: 200},
                {id: 'kazakhstan', name: '哈萨克斯坦', x: 300, y: 300},
                {id: 'russia', name: '俄罗斯', x: 500, y: 150},
                {id: 'thailand', name: '泰国', x: 550, y: 300},
                {id: 'italy', name: '意大利', x: 650, y: 200}
            ],
            [
                {from: 'china', to: 'pakistan', label: '经济走廊'},
                {from: 'china', to: 'kazakhstan', label: '能源合作'},
                {from: 'china', to: 'russia', label: '战略协作'},
                {from: 'china', to: 'thailand', label: '铁路建设'},
                {from: 'russia', to: 'italy', label: '天然气'},
                {from: 'pakistan', to: 'kazakhstan', label: '过境'},
                {from: 'thailand', to: 'italy', label: '贸易'}
            ],
            false
        ),

        multiMatrix: {
            adjacency: '展示国家间的直接合作关系',
            reachability: '分析合作网络的连通性和影响力辐射',
            incidence: '展示具体项目与参与国家的对应关系'
        },

        properties: {
            comprehensive: true,
            reason: '三种矩阵从不同角度刻画国际合作网络',
            synergy: '矩阵之间相互补充,形成完整的关系图谱',
            significance: '为"一带一路"建设提供科学的决策支持'
        },

        historicalContext: '"一带一路"倡议是构建人类命运共同体的重要实践。通过基础设施互联互通、经贸合作、人文交流,沿线国家形成了紧密的合作网络。矩阵分析帮助我们理解这一复杂网络的结构特征。',

        philosophy: '三种矩阵的综合应用,体现了全面分析、系统思维的方法论。邻接矩阵看"直接关系",可达矩阵看"间接影响",关联矩阵看"项目落实"。这种多维度、多层次的分析方法,正是辩证唯物主义的体现——既要看现象,又要看本质;既要看局部,又要看全局;既要看当前,又要看长远。通过矩阵分析,"一带一路"不再是抽象概念,而是可量化、可分析、可优化的合作网络,为构建人类命运共同体提供了科学工具。'
    }
];

// ============================================
// 工具函数
// ============================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'none';
        const content = section.querySelector('[id$="Content"]');
        if (content) content.innerHTML = '';
    }
}

function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    }
}

// 创建SVG图
function createGraphSVG(graph, width = 800, height = 500) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('class', 'graph-svg');

    // 绘制边
    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    graph.edges.forEach(edge => {
        const from = graph.vertices.find(v => v.id === edge.from);
        const to = graph.vertices.find(v => v.id === edge.to);

        if (from && to) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', from.x);
            line.setAttribute('y1', from.y);
            line.setAttribute('x2', to.x);
            line.setAttribute('y2', to.y);
            line.setAttribute('class', 'edge-line');
            edgesGroup.appendChild(line);

            // 边标签
            if (edge.label) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', (from.x + to.x) / 2);
                text.setAttribute('y', (from.y + to.y) / 2 - 5);
                text.setAttribute('class', 'edge-label');
                text.setAttribute('text-anchor', 'middle');
                text.textContent = edge.label;
                edgesGroup.appendChild(text);
            }
        }
    });
    svg.appendChild(edgesGroup);

    // 绘制顶点
    const verticesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    graph.vertices.forEach(vertex => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', vertex.x);
        circle.setAttribute('cy', vertex.y);
        circle.setAttribute('r', 25);
        circle.setAttribute('class', 'vertex-circle');
        verticesGroup.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', vertex.x);
        text.setAttribute('y', vertex.y + 5);
        text.setAttribute('class', 'vertex-text');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = vertex.name;
        verticesGroup.appendChild(text);
    });
    svg.appendChild(verticesGroup);

    return svg;
}

// 创建矩阵HTML表格
function createMatrixTable(matrix, rowLabels, colLabels) {
    const table = document.createElement('table');
    table.className = 'matrix-table';

    // 表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); // 左上角空格

    colLabels.forEach(label => {
        const th = document.createElement('th');
        th.textContent = label;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 表体
    const tbody = document.createElement('tbody');
    matrix.forEach((row, i) => {
        const tr = document.createElement('tr');

        // 行标签
        const th = document.createElement('th');
        th.textContent = rowLabels[i];
        tr.appendChild(th);

        // 矩阵元素
        row.forEach((val, j) => {
            const td = document.createElement('td');
            td.textContent = val;
            td.className = val === 1 ? 'cell-one' : 'cell-zero';
            td.setAttribute('data-row', i);
            td.setAttribute('data-col', j);
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
}

// ============================================
// 渲染函数
// ============================================
async function renderCaseDisplay(caseData) {
    const container = document.getElementById('caseContent');
    container.innerHTML = '';

    const descCard = document.createElement('div');
    descCard.className = 'case-description';
    descCard.innerHTML = `
        <div class="desc-icon">📊</div>
        <div class="desc-text">
            <h3>${caseData.description}</h3>
            <p class="historical-context">${caseData.historicalContext}</p>
        </div>
    `;
    container.appendChild(descCard);
    await sleep(animationSpeed * 0.5);
}

async function renderGraphDisplay(caseData) {
    const container = document.getElementById('graphCanvas');
    container.innerHTML = '';

    const svg = createGraphSVG(caseData.graph);
    container.appendChild(svg);
    await sleep(animationSpeed * 0.5);
}

async function renderMatrixConstruction(caseData) {
    const container = document.getElementById('constructionContent');
    container.innerHTML = '';

    // 根据当前选择的矩阵类型显示说明
    let explanationData = caseData.matrixExplanation;

    // 如果当前案例没有对应矩阵类型的说明,显示通用说明
    if (!explanationData) {
        const genericExplanations = {
            'adjacency': {
                title: '邻接矩阵构建说明',
                meaning: 'A[i][j] = 1 表示从顶点i到顶点j存在直接连接',
                examples: ['矩阵元素为1表示有边', '矩阵元素为0表示无边']
            },
            'reachability': {
                title: '可达矩阵构建说明',
                meaning: 'R[i][j] = 1 表示从顶点i到顶点j存在路径(可经过其他顶点)',
                examples: ['通过邻接矩阵的布尔幂运算得到', 'R = A ∨ A² ∨ ... ∨ Aⁿ']
            },
            'incidence': {
                title: '关联矩阵构建说明',
                meaning: 'B[i][j] = 1 表示顶点i与边j关联',
                examples: ['行数=顶点数', '列数=边数', '每列有2个1(无向图)']
            }
        };
        explanationData = genericExplanations[currentMatrixType];
    }

    const explanationBox = document.createElement('div');
    explanationBox.className = 'matrix-explanation-box';
    explanationBox.innerHTML = `
        <h3>${explanationData.title}</h3>
        <p class="meaning">${explanationData.meaning}</p>
        <div class="examples">
            <h4>示例说明:</h4>
            ${explanationData.examples.map(ex => `<p>• ${ex}</p>`).join('')}
        </div>
    `;
    container.appendChild(explanationBox);
    await sleep(animationSpeed);
}

async function renderMatrixDisplay(caseData) {
    const container = document.getElementById('matrixContent');
    container.innerHTML = '';

    let matrix, rowLabels, colLabels;

    // 根据当前选择的矩阵类型显示对应的矩阵
    if (currentMatrixType === 'adjacency') {
        matrix = caseData.graph.getAdjacencyMatrix();
        rowLabels = colLabels = caseData.graph.vertices.map(v => v.name);
    } else if (currentMatrixType === 'reachability') {
        matrix = caseData.graph.getReachabilityMatrix();
        rowLabels = colLabels = caseData.graph.vertices.map(v => v.name);
    } else if (currentMatrixType === 'incidence') {
        matrix = caseData.graph.getIncidenceMatrix();
        rowLabels = caseData.graph.vertices.map(v => v.name);
        colLabels = caseData.graph.edges.map((e, i) => `e${i + 1}`);
    }

    if (matrix && rowLabels && colLabels) {
        const table = createMatrixTable(matrix, rowLabels, colLabels);
        container.appendChild(table);

        // 更新维度信息
        document.getElementById('matrixDim').textContent = `${matrix.length}×${matrix[0].length}`;
    } else {
        container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">矩阵计算中...</p>';
    }

    await sleep(animationSpeed);
}

async function renderMatrixOperations(caseData) {
    const container = document.getElementById('operationsContent');
    container.innerHTML = '';

    const propsBox = document.createElement('div');
    propsBox.className = 'properties-analysis-box';

    let content = '';
    Object.entries(caseData.properties).forEach(([key, value]) => {
        if (typeof value === 'string') {
            content += `<div class="property-row">
                <span class="prop-label">${key}:</span>
                <span class="prop-value">${value}</span>
            </div>`;
        }
    });

    propsBox.innerHTML = content;
    container.appendChild(propsBox);
    await sleep(animationSpeed * 0.5);
}

async function renderPhilosophy(caseData) {
    const container = document.getElementById('philosophyContent');
    container.innerHTML = '';

    const philosophyBox = document.createElement('div');
    philosophyBox.className = 'philosophy-box';
    philosophyBox.innerHTML = `
        <div class="philosophy-icon">🎓</div>
        <div class="philosophy-text">${caseData.philosophy}</div>
    `;
    container.appendChild(philosophyBox);
    await sleep(animationSpeed * 0.5);
}

// ============================================
// 主演示流程
// ============================================
async function runMatrixDemo() {
    if (isAnimating) return;
    isAnimating = true;

    const caseData = CASES[currentCaseIndex];

    clearSection('matricesIntro');

    showSection('caseDisplay');
    document.getElementById('caseTitle').textContent = caseData.name;
    await renderCaseDisplay(caseData);

    showSection('graphDisplay');
    await renderGraphDisplay(caseData);

    showSection('matrixConstruction');
    await renderMatrixConstruction(caseData);

    showSection('matrixDisplay');
    await renderMatrixDisplay(caseData);

    showSection('matrixOperations');
    await renderMatrixOperations(caseData);

    showSection('philosophySection');
    await renderPhilosophy(caseData);

    isAnimating = false;
}

function resetVisualization() {
    isAnimating = false;
    clearSection('caseDisplay');
    clearSection('graphDisplay');
    clearSection('matrixConstruction');
    clearSection('matrixDisplay');
    clearSection('matrixOperations');
    clearSection('philosophySection');
    showSection('matricesIntro');
    document.getElementById('matrixDim').textContent = '-';
}

// ============================================
// 事件监听
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.matrix-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Matrix button clicked:', btn.dataset.matrix);

            document.querySelectorAll('.matrix-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMatrixType = btn.dataset.matrix;

            const matrixNames = {
                'adjacency': '邻接矩阵',
                'reachability': '可达矩阵',
                'incidence': '关联矩阵'
            };

            const matrixInfos = {
                'adjacency': '邻接矩阵表示图中顶点之间的直接连接关系。',
                'reachability': '可达矩阵表示图中顶点之间的可达性(包括间接路径)。',
                'incidence': '关联矩阵表示顶点与边之间的关联关系。'
            };

            document.getElementById('currentMatrix').textContent = matrixNames[currentMatrixType];
            document.getElementById('matrixInfo').textContent = matrixInfos[currentMatrixType];

            resetVisualization();
        });
    });

    document.getElementById('caseSelector').addEventListener('change', (e) => {
        currentCaseIndex = parseInt(e.target.value);
        resetVisualization();
    });

    document.getElementById('speedControl').addEventListener('input', (e) => {
        animationSpeed = parseInt(e.target.value);
        document.getElementById('speedValue').textContent = animationSpeed + 'ms';
    });

    document.getElementById('startBtn').addEventListener('click', () => {
        console.log('Start button clicked, case index:', currentCaseIndex);
        runMatrixDemo();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        console.log('Reset button clicked');
        resetVisualization();
    });

    updateCaseSelector();
});

function updateCaseSelector() {
    const selector = document.getElementById('caseSelector');

    // 显示所有案例,不进行过滤
    selector.innerHTML = CASES.map((c, index) => {
        return `<option value="${index}">${c.name}</option>`;
    }).join('');

    // 设置当前选中的案例
    if (CASES.length > 0) {
        selector.value = currentCaseIndex;
    }
}
