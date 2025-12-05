// ============================================
// 全局状态管理
// ============================================
let currentConcept = 'path';
let currentCaseIndex = 0;
let animationSpeed = 800;
let isAnimating = false;

// ============================================
// 图数据结构
// ============================================
class Graph {
    constructor(vertices, edges) {
        this.vertices = vertices; // [{id, name, x, y, label}]
        this.edges = edges; // [{from, to, label}]
    }

    // 查找路径
    findPath(start, end, visitedVertices = new Set()) {
        // BFS查找路径
        const queue = [[start]];
        const visited = new Set([start]);

        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];

            if (current === end) {
                return path;
            }

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor) && !visitedVertices.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([...path, neighbor]);
                }
            }
        }
        return null;
    }

    getNeighbors(vertexId) {
        const neighbors = [];
        for (const edge of this.edges) {
            if (edge.from === vertexId) {
                neighbors.push(edge.to);
            }
            if (edge.to === vertexId && !edge.directed) {
                neighbors.push(edge.from);
            }
        }
        return neighbors;
    }

    // 查找所有连通分量
    findComponents() {
        const visited = new Set();
        const components = [];

        for (const vertex of this.vertices) {
            if (!visited.has(vertex.id)) {
                const component = [];
                this.dfs(vertex.id, visited, component);
                components.push(component);
            }
        }
        return components;
    }

    dfs(vertexId, visited, component) {
        visited.add(vertexId);
        component.push(vertexId);

        const neighbors = this.getNeighbors(vertexId);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                this.dfs(neighbor, visited, component);
            }
        }
    }
}

// ============================================
// 案例数据 - 思政主题
// ============================================
const CASES = [
    {
        concept: 'path',
        type: 'elementary',
        name: '万里长征路 - 初级通路示例',
        description: '红军长征从江西瑞金到陕北延安,途经11个省份,是中国革命史上的伟大壮举',

        graph: new Graph(
            [
                {id: 'ruijin', name: '瑞金', x: 150, y: 400, label: '起点'},
                {id: 'yudu', name: '于都', x: 200, y: 380, label: '出发地'},
                {id: 'xiangjiang', name: '湘江', x: 280, y: 350, label: '血战'},
                {id: 'zunyi', name: '遵义', x: 350, y: 320, label: '转折'},
                {id: 'chishui', name: '赤水', x: 400, y: 280, label: '四渡'},
                {id: 'jinsha', name: '金沙江', x: 480, y: 250, label: '巧渡'},
                {id: 'dadu', name: '大渡河', x: 550, y: 220, label: '飞夺'},
                {id: 'jiajin', name: '夹金山', x: 600, y: 180, label: '翻越'},
                {id: 'lazikou', name: '腊子口', x: 650, y: 150, label: '突破'},
                {id: 'wuqi', name: '吴起镇', x: 700, y: 120, label: '会师'},
                {id: 'yanan', name: '延安', x: 750, y: 100, label: '终点'}
            ],
            [
                {from: 'ruijin', to: 'yudu', label: '集结'},
                {from: 'yudu', to: 'xiangjiang', label: '突围'},
                {from: 'xiangjiang', to: 'zunyi', label: '转移'},
                {from: 'zunyi', to: 'chishui', label: '机动'},
                {from: 'chishui', to: 'jinsha', label: '穿插'},
                {from: 'jinsha', to: 'dadu', label: '北上'},
                {from: 'dadu', to: 'jiajin', label: '前进'},
                {from: 'jiajin', to: 'lazikou', label: '挺进'},
                {from: 'lazikou', to: 'wuqi', label: '胜利'},
                {from: 'wuqi', to: 'yanan', label: '到达'}
            ]
        ),

        pathSequence: ['ruijin', 'yudu', 'xiangjiang', 'zunyi', 'chishui', 'jinsha', 'dadu', 'jiajin', 'lazikou', 'wuqi', 'yanan'],

        properties: {
            isElementary: true,
            reason: '除起点瑞金和终点延安外,途经的每个地点都只经过一次',
            length: 10,
            vertices: 11,
            significance: '初级通路确保了行军路线的高效性,避免重复经过同一地点浪费时间和资源'
        },

        historicalContext: '1934年10月至1936年10月,中国工农红军进行了举世闻名的长征。这条长达两万五千里的征程,经过11个省份,翻越18座大山,跨过24条大河,是人类历史上的伟大奇迹。',

        philosophy: '长征路线是一条初级通路,体现了革命的坚定性和目标的明确性。每一步都是向着最终目标前进,不走回头路,不做无用功。这种"一往无前"的精神,正是初级通路概念的完美诠释——目标明确,路径清晰,勇往直前。'
    },

    {
        concept: 'path',
        type: 'simple',
        name: '丝绸之路 - 简单通路示例',
        description: '古代东西方贸易通道,连接长安与罗马,促进了文明交流',

        graph: new Graph(
            [
                {id: 'changan', name: '长安', x: 150, y: 250, label: '起点'},
                {id: 'lanzhou', name: '兰州', x: 250, y: 230, label: '重镇'},
                {id: 'dunhuang', name: '敦煌', x: 350, y: 210, label: '关隘'},
                {id: 'turpan', name: '吐鲁番', x: 450, y: 190, label: '绿洲'},
                {id: 'kashgar', name: '喀什', x: 550, y: 210, label: '枢纽'},
                {id: 'samarkand', name: '撒马尔罕', x: 650, y: 230, label: '名城'},
                {id: 'baghdad', name: '巴格达', x: 750, y: 250, label: '都城'}
            ],
            [
                {from: 'changan', to: 'lanzhou', label: '河西走廊'},
                {from: 'lanzhou', to: 'dunhuang', label: '戈壁通道'},
                {from: 'dunhuang', to: 'turpan', label: '北道'},
                {from: 'dunhuang', to: 'kashgar', label: '南道'},
                {from: 'turpan', to: 'kashgar', label: '天山道'},
                {from: 'kashgar', to: 'samarkand', label: '帕米尔'},
                {from: 'samarkand', to: 'baghdad', label: '波斯道'},
                {from: 'turpan', to: 'samarkand', label: '北线'}
            ]
        ),

        // 两条不同路径(边不重复)
        pathSequence: ['changan', 'lanzhou', 'dunhuang', 'turpan', 'kashgar', 'samarkand', 'baghdad'],
        alternativePath: ['changan', 'lanzhou', 'dunhuang', 'kashgar', 'samarkand', 'baghdad'],

        properties: {
            isSimple: true,
            reason: '存在多条路径,但每条路径上的贸易路线(边)都不重复使用',
            multiplePaths: true,
            significance: '简单通路允许不同的商队选择不同路线,提高了贸易效率和安全性'
        },

        historicalContext: '丝绸之路是古代连接东西方的商业贸易路线,始于西汉时期张骞出使西域。这条路线不仅传播了丝绸、瓷器等商品,更促进了文化、宗教、科技的交流,是人类文明史上的重要纽带。',

        philosophy: '丝绸之路体现了简单通路的灵活性。虽然起点和终点相同,但可以选择不同的路线——北道、南道、天山道。这种"条条大路通罗马"的智慧,告诉我们:达成目标的方式可以多样,关键是找到适合自己的道路。这也体现了"实事求是、因地制宜"的思想。'
    },

    {
        concept: 'circuit',
        type: 'elementary',
        name: '革命根据地巡视 - 初级回路示例',
        description: '红军在根据地建立巡视路线,确保各区域联系',

        graph: new Graph(
            [
                {id: 'center', name: '中央苏区', x: 400, y: 250, label: '中心'},
                {id: 'east', name: '东路', x: 550, y: 250, label: '东区'},
                {id: 'south', name: '南路', x: 475, y: 370, label: '南区'},
                {id: 'west', name: '西路', x: 325, y: 370, label: '西区'},
                {id: 'north', name: '北路', x: 400, y: 150, label: '北区'}
            ],
            [
                {from: 'center', to: 'east', label: '东巡'},
                {from: 'east', to: 'south', label: '转南'},
                {from: 'south', to: 'west', label: '西进'},
                {from: 'west', to: 'north', label: '北上'},
                {from: 'north', to: 'center', label: '回中'}
            ]
        ),

        pathSequence: ['center', 'east', 'south', 'west', 'north', 'center'],

        properties: {
            isElementary: true,
            isCycle: true,
            reason: '从中央苏区出发,巡视各区后回到起点,途中每个区域只经过一次',
            length: 5,
            significance: '初级回路确保了巡视的全面性和效率性,不重复不遗漏'
        },

        historicalContext: '在革命根据地时期,为了加强各区域的联系和指导,建立了定期巡视制度。巡视团从中央出发,走遍各个区域,了解情况、传达指示、解决问题,最后返回中央汇报。',

        philosophy: '初级回路体现了"从群众中来,到群众中去"的工作方法。巡视路线形成闭环,确保信息的上传下达形成完整循环。起点即终点,象征着工作的周期性和持续性。每个节点只经过一次,体现了效率优先、避免重复的原则。这种循环往复、螺旋上升的工作模式,正是我们党群众路线的生动体现。'
    },

    {
        concept: 'circuit',
        type: 'simple',
        name: '经济内循环 - 简单回路示例',
        description: '国内经济大循环,生产-分配-交换-消费形成闭环',

        graph: new Graph(
            [
                {id: 'production', name: '生产', x: 400, y: 150, label: '制造'},
                {id: 'distribution', name: '分配', x: 600, y: 250, label: '分配'},
                {id: 'exchange', name: '交换', x: 500, y: 400, label: '流通'},
                {id: 'consumption', name: '消费', x: 300, y: 400, label: '使用'},
                {id: 'investment', name: '投资', x: 200, y: 250, label: '再投入'}
            ],
            [
                {from: 'production', to: 'distribution', label: '产品分配'},
                {from: 'distribution', to: 'exchange', label: '市场交换'},
                {from: 'exchange', to: 'consumption', label: '商品消费'},
                {from: 'consumption', to: 'investment', label: '资本积累'},
                {from: 'investment', to: 'production', label: '生产投入'},
                {from: 'distribution', to: 'consumption', label: '直接消费'},
                {from: 'consumption', to: 'production', label: '需求拉动'}
            ]
        ),

        pathSequence: ['production', 'distribution', 'exchange', 'consumption', 'investment', 'production'],

        properties: {
            isSimple: true,
            isCycle: true,
            reason: '经济循环中可能存在多条反馈路径,但形成闭环,边不重复',
            hasMultipleLoops: true,
            significance: '简单回路保证了经济循环的畅通,每个环节发挥作用'
        },

        historicalContext: '新发展格局以国内大循环为主体、国内国际双循环相互促进。通过完善生产、分配、流通、消费各环节,形成需求牵引供给、供给创造需求的更高水平动态平衡。',

        philosophy: '经济内循环是一个简单回路,体现了经济运行的系统性和循环性。生产创造价值,分配实现公平,交换促进流通,消费拉动需求,投资推动再生产。这个闭环体现了马克思主义政治经济学的基本原理——社会再生产过程的四个环节相互联系、相互制约。简单回路确保了循环的畅通无阻,任何一个环节的堵塞都会影响整体运行。'
    },

    {
        concept: 'component',
        type: 'connected',
        name: '解放区连片 - 连通分量示例',
        description: '解放战争时期,各解放区逐步连成一片,形成连通的革命根据地',

        graph: new Graph(
            [
                // 东北解放区
                {id: 'neast1', name: '哈尔滨', x: 150, y: 100, label: '东北'},
                {id: 'neast2', name: '长春', x: 200, y: 120, label: '东北'},
                {id: 'neast3', name: '沈阳', x: 250, y: 140, label: '东北'},

                // 华北解放区
                {id: 'north1', name: '延安', x: 400, y: 150, label: '华北'},
                {id: 'north2', name: '石家庄', x: 450, y: 170, label: '华北'},
                {id: 'north3', name: '太原', x: 500, y: 150, label: '华北'},
                {id: 'north4', name: '北平', x: 550, y: 190, label: '华北'},

                // 华东解放区
                {id: 'east1', name: '济南', x: 600, y: 250, label: '华东'},
                {id: 'east2', name: '徐州', x: 650, y: 280, label: '华东'},
                {id: 'east3', name: '南京', x: 700, y: 310, label: '华东'},

                // 中南解放区
                {id: 'central1', name: '武汉', x: 500, y: 350, label: '中南'},
                {id: 'central2', name: '长沙', x: 450, y: 380, label: '中南'},

                // 西北解放区(独立分量)
                {id: 'nwest1', name: '兰州', x: 200, y: 300, label: '西北'},
                {id: 'nwest2', name: '西安', x: 250, y: 320, label: '西北'}
            ],
            [
                // 东北内部连接
                {from: 'neast1', to: 'neast2', label: '控制'},
                {from: 'neast2', to: 'neast3', label: '连接'},

                // 华北内部连接
                {from: 'north1', to: 'north2', label: '连通'},
                {from: 'north2', to: 'north3', label: '连接'},
                {from: 'north2', to: 'north4', label: '连通'},
                {from: 'north3', to: 'north4', label: '连接'},

                // 华东内部连接
                {from: 'east1', to: 'east2', label: '连通'},
                {from: 'east2', to: 'east3', label: '连接'},

                // 中南内部连接
                {from: 'central1', to: 'central2', label: '连通'},

                // 大区之间连接
                {from: 'north4', to: 'east1', label: '贯通'},
                {from: 'north2', to: 'central1', label: '打通'},
                {from: 'east2', to: 'central1', label: '连片'},

                // 西北独立(不连接)
                {from: 'nwest1', to: 'nwest2', label: '孤立'}
            ]
        ),

        components: null, // 将在运行时计算

        properties: {
            totalComponents: 2,
            mainComponent: {
                name: '主解放区',
                size: 12,
                regions: ['东北', '华北', '华东', '中南']
            },
            isolatedComponent: {
                name: '西北解放区',
                size: 2,
                regions: ['西北']
            },
            significance: '连通分量展示了革命力量的分布和联系状态'
        },

        historicalContext: '1945-1949年解放战争期间,人民解放军逐步解放全国。各解放区从分散到连片,最终形成统一的新中国。连通性的增强,标志着革命力量的壮大和胜利的临近。',

        philosophy: '连通分量体现了"星星之火,可以燎原"的革命真理。最初,各个革命根据地相对独立,是图中的不同连通分量。随着革命发展,根据地之间建立联系,分量逐渐合并,最终形成一个大的连通图——全国解放。连通性代表着团结和力量,分量的合并象征着统一和胜利。数学上的连通分量概念,完美诠释了"团结就是力量"的道理。'
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

// ============================================
// SVG图绘制
// ============================================
function createGraphSVG(graph, width = 900, height = 500) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('class', 'graph-svg');

    // 绘制边
    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgesGroup.setAttribute('class', 'edges-group');

    graph.edges.forEach((edge, index) => {
        const fromVertex = graph.vertices.find(v => v.id === edge.from);
        const toVertex = graph.vertices.find(v => v.id === edge.to);

        if (fromVertex && toVertex) {
            // 创建边线
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', fromVertex.x);
            line.setAttribute('y1', fromVertex.y);
            line.setAttribute('x2', toVertex.x);
            line.setAttribute('y2', toVertex.y);
            line.setAttribute('class', 'edge-line');
            line.setAttribute('data-edge-id', `${edge.from}-${edge.to}`);
            edgesGroup.appendChild(line);

            // 创建箭头
            const angle = Math.atan2(toVertex.y - fromVertex.y, toVertex.x - fromVertex.x);
            const arrowSize = 8;
            const distance = Math.sqrt(Math.pow(toVertex.x - fromVertex.x, 2) + Math.pow(toVertex.y - fromVertex.y, 2));
            const arrowX = toVertex.x - 25 * Math.cos(angle);
            const arrowY = toVertex.y - 25 * Math.sin(angle);

            const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${arrowX} ${arrowY}
                       L ${arrowX - arrowSize * Math.cos(angle - Math.PI / 6)} ${arrowY - arrowSize * Math.sin(angle - Math.PI / 6)}
                       L ${arrowX - arrowSize * Math.cos(angle + Math.PI / 6)} ${arrowY - arrowSize * Math.sin(angle + Math.PI / 6)} Z`;
            arrowPath.setAttribute('d', d);
            arrowPath.setAttribute('class', 'edge-arrow');
            arrowPath.setAttribute('data-edge-id', `${edge.from}-${edge.to}`);
            edgesGroup.appendChild(arrowPath);

            // 边标签
            if (edge.label) {
                const midX = (fromVertex.x + toVertex.x) / 2;
                const midY = (fromVertex.y + toVertex.y) / 2;

                const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');

                labelText.setAttribute('x', midX);
                labelText.setAttribute('y', midY);
                labelText.setAttribute('class', 'edge-label');
                labelText.setAttribute('text-anchor', 'middle');
                labelText.setAttribute('dominant-baseline', 'middle');
                labelText.textContent = edge.label;

                edgesGroup.appendChild(labelText);
            }
        }
    });
    svg.appendChild(edgesGroup);

    // 绘制顶点
    const verticesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    verticesGroup.setAttribute('class', 'vertices-group');

    graph.vertices.forEach(vertex => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'vertex-group');
        group.setAttribute('data-vertex-id', vertex.id);

        // 顶点圆圈
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', vertex.x);
        circle.setAttribute('cy', vertex.y);
        circle.setAttribute('r', 20);
        circle.setAttribute('class', 'vertex-circle');
        group.appendChild(circle);

        // 顶点名称
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', vertex.x);
        text.setAttribute('y', vertex.y - 30);
        text.setAttribute('class', 'vertex-name');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = vertex.name;
        group.appendChild(text);

        // 顶点标签
        if (vertex.label) {
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', vertex.x);
            label.setAttribute('y', vertex.y + 40);
            label.setAttribute('class', 'vertex-label');
            label.setAttribute('text-anchor', 'middle');
            label.textContent = vertex.label;
            group.appendChild(label);
        }

        verticesGroup.appendChild(group);
    });
    svg.appendChild(verticesGroup);

    return svg;
}

// ============================================
// 渲染案例展示
// ============================================
async function renderCaseDisplay(caseData) {
    const container = document.getElementById('caseContent');
    container.innerHTML = '';

    // 案例描述
    const descCard = document.createElement('div');
    descCard.className = 'case-description';
    descCard.innerHTML = `
        <div class="desc-icon">📍</div>
        <div class="desc-text">
            <h3>${caseData.description}</h3>
            <p class="historical-context">${caseData.historicalContext}</p>
        </div>
    `;
    container.appendChild(descCard);
    await sleep(animationSpeed * 0.5);

    // 更新路径长度显示
    if (caseData.pathSequence) {
        document.getElementById('pathLength').textContent = caseData.pathSequence.length - 1;
    } else {
        document.getElementById('pathLength').textContent = '-';
    }
}

// ============================================
// 渲染图可视化
// ============================================
async function renderGraphVisualization(caseData) {
    const container = document.getElementById('graphCanvas');
    container.innerHTML = '';

    const svg = createGraphSVG(caseData.graph);
    container.appendChild(svg);
    await sleep(animationSpeed * 0.5);
}

// ============================================
// 渲染路径追踪
// ============================================
async function renderPathTracing(caseData) {
    const container = document.getElementById('tracingContent');
    container.innerHTML = '';

    if (caseData.concept === 'component') {
        // 连通分量特殊处理
        const components = caseData.graph.findComponents();

        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            const componentDiv = document.createElement('div');
            componentDiv.className = 'component-display';
            componentDiv.style.animationDelay = `${i * 0.2}s`;

            const vertices = component.map(id => {
                const v = caseData.graph.vertices.find(vertex => vertex.id === id);
                return v ? v.name : id;
            });

            componentDiv.innerHTML = `
                <h4>连通分量 ${i + 1}</h4>
                <div class="component-info">
                    <div class="info-item">
                        <span class="info-label">包含顶点:</span>
                        <span class="info-value">${vertices.join(', ')}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">顶点数量:</span>
                        <span class="info-value">${component.length}</span>
                    </div>
                </div>
            `;
            container.appendChild(componentDiv);

            // 高亮连通分量
            for (const vertexId of component) {
                const vertexGroup = document.querySelector(`[data-vertex-id="${vertexId}"]`);
                if (vertexGroup) {
                    vertexGroup.classList.add(`component-${i}`);
                }
            }

            await sleep(animationSpeed);
        }
    } else {
        // 路径追踪
        const pathSequence = caseData.pathSequence;

        for (let i = 0; i < pathSequence.length; i++) {
            const vertexId = pathSequence[i];
            const vertex = caseData.graph.vertices.find(v => v.id === vertexId);

            // 创建步骤卡片
            const stepCard = document.createElement('div');
            stepCard.className = 'path-step';
            stepCard.style.animationDelay = `${i * 0.1}s`;
            stepCard.innerHTML = `
                <div class="step-number">${i + 1}</div>
                <div class="step-info">
                    <div class="step-vertex">${vertex.name}</div>
                    <div class="step-label">${vertex.label}</div>
                </div>
                ${i < pathSequence.length - 1 ? '<div class="step-arrow">→</div>' : ''}
            `;
            container.appendChild(stepCard);

            // 高亮当前顶点
            const vertexGroup = document.querySelector(`[data-vertex-id="${vertexId}"]`);
            if (vertexGroup) {
                vertexGroup.classList.add('current-vertex');
                await sleep(animationSpeed * 0.8);
                vertexGroup.classList.remove('current-vertex');
                vertexGroup.classList.add('visited-vertex');
            }

            // 高亮边
            if (i < pathSequence.length - 1) {
                const nextVertexId = pathSequence[i + 1];
                const edgeId = `${vertexId}-${nextVertexId}`;
                const edge = document.querySelector(`[data-edge-id="${edgeId}"]`);
                if (edge) {
                    edge.classList.add('active-edge');
                }
                await sleep(animationSpeed * 0.2);
            }
        }

        // 如果是回路,连接最后一个顶点回到起点
        if (caseData.type === 'elementary' || caseData.type === 'simple') {
            if (caseData.pathSequence[0] === caseData.pathSequence[caseData.pathSequence.length - 1]) {
                const completionDiv = document.createElement('div');
                completionDiv.className = 'circuit-completion';
                completionDiv.innerHTML = `
                    <div class="completion-icon">✓</div>
                    <div class="completion-text">回路完成!起点与终点重合</div>
                `;
                container.appendChild(completionDiv);
            }
        }
    }
}

// ============================================
// 渲染性质分析
// ============================================
async function renderPropertyAnalysis(caseData) {
    const container = document.getElementById('analysisContent');
    container.innerHTML = '';

    const analysisBox = document.createElement('div');
    analysisBox.className = 'property-analysis-box';

    let content = '';

    if (caseData.properties.isElementary) {
        content = `
            <div class="property-item">
                <div class="property-icon">✓</div>
                <div class="property-content">
                    <h4>初级${caseData.concept === 'path' ? '通路' : '回路'}验证</h4>
                    <p><strong>定义:</strong> ${caseData.properties.reason}</p>
                    <p><strong>路径长度:</strong> ${caseData.properties.length}</p>
                    <p><strong>顶点数量:</strong> ${caseData.properties.vertices || caseData.pathSequence.length}</p>
                    <p><strong>意义:</strong> ${caseData.properties.significance}</p>
                </div>
            </div>
        `;
    } else if (caseData.properties.isSimple) {
        content = `
            <div class="property-item">
                <div class="property-icon">✓</div>
                <div class="property-content">
                    <h4>简单${caseData.concept === 'path' ? '通路' : '回路'}验证</h4>
                    <p><strong>定义:</strong> ${caseData.properties.reason}</p>
                    ${caseData.properties.multiplePaths ? '<p><strong>特点:</strong> 存在多条可选路径</p>' : ''}
                    <p><strong>意义:</strong> ${caseData.properties.significance}</p>
                </div>
            </div>
        `;
    } else if (caseData.concept === 'component') {
        content = `
            <div class="property-item">
                <div class="property-icon">◎</div>
                <div class="property-content">
                    <h4>连通分量分析</h4>
                    <p><strong>分量总数:</strong> ${caseData.properties.totalComponents}</p>
                    <div class="component-detail">
                        <h5>主连通分量</h5>
                        <p>名称: ${caseData.properties.mainComponent.name}</p>
                        <p>规模: ${caseData.properties.mainComponent.size} 个顶点</p>
                        <p>区域: ${caseData.properties.mainComponent.regions.join(', ')}</p>
                    </div>
                    <div class="component-detail">
                        <h5>独立分量</h5>
                        <p>名称: ${caseData.properties.isolatedComponent.name}</p>
                        <p>规模: ${caseData.properties.isolatedComponent.size} 个顶点</p>
                        <p>区域: ${caseData.properties.isolatedComponent.regions.join(', ')}</p>
                    </div>
                    <p><strong>意义:</strong> ${caseData.properties.significance}</p>
                </div>
            </div>
        `;
    }

    analysisBox.innerHTML = content;
    container.appendChild(analysisBox);
    await sleep(animationSpeed * 0.5);
}

// ============================================
// 渲染思政启示
// ============================================
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
async function runGraphDemo() {
    if (isAnimating) return;
    isAnimating = true;

    const caseData = CASES[currentCaseIndex];

    // 隐藏介绍
    clearSection('conceptsIntro');

    // 1. 案例展示
    showSection('caseDisplay');
    document.getElementById('caseTitle').textContent = caseData.name;
    await renderCaseDisplay(caseData);

    // 2. 图可视化
    showSection('graphVisualization');
    await renderGraphVisualization(caseData);

    // 3. 路径追踪
    showSection('pathTracing');
    await renderPathTracing(caseData);

    // 4. 性质分析
    showSection('propertyAnalysis');
    await renderPropertyAnalysis(caseData);

    // 5. 思政启示
    showSection('philosophySection');
    await renderPhilosophy(caseData);

    isAnimating = false;
}

// ============================================
// 重置函数
// ============================================
function resetVisualization() {
    isAnimating = false;

    clearSection('caseDisplay');
    clearSection('graphVisualization');
    clearSection('pathTracing');
    clearSection('propertyAnalysis');
    clearSection('philosophySection');

    showSection('conceptsIntro');

    document.getElementById('pathLength').textContent = '-';
}

// ============================================
// 事件监听器
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 概念按钮
    document.querySelectorAll('.concept-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.concept-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentConcept = btn.dataset.concept;

            const conceptNames = {
                'path': '通路',
                'circuit': '回路',
                'component': '连通分量'
            };

            const conceptInfos = {
                'path': '通路是图中从一个顶点到另一个顶点的路径,如同革命征程。',
                'circuit': '回路是起点和终点相同的闭合路径,体现循环往复的过程。',
                'component': '连通分量是图中的极大连通子图,象征团结统一的力量。'
            };

            document.getElementById('currentConcept').textContent = conceptNames[currentConcept];
            document.getElementById('conceptInfo').textContent = conceptInfos[currentConcept];

            updateCaseSelector();
            resetVisualization();
        });
    });

    // 案例选择
    document.getElementById('caseSelector').addEventListener('change', (e) => {
        currentCaseIndex = parseInt(e.target.value);
        resetVisualization();
    });

    // 速度控制
    document.getElementById('speedControl').addEventListener('input', (e) => {
        animationSpeed = parseInt(e.target.value);
        document.getElementById('speedValue').textContent = animationSpeed + 'ms';
    });

    // 开始按钮
    document.getElementById('startBtn').addEventListener('click', () => {
        runGraphDemo();
    });

    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', () => {
        resetVisualization();
    });

    updateCaseSelector();
});

function updateCaseSelector() {
    const selector = document.getElementById('caseSelector');
    const filteredCases = CASES.filter(c => c.concept === currentConcept);

    selector.innerHTML = filteredCases.map((c, index) => {
        const originalIndex = CASES.indexOf(c);
        return `<option value="${originalIndex}">${c.name}</option>`;
    }).join('');

    currentCaseIndex = filteredCases.length > 0 ? CASES.indexOf(filteredCases[0]) : 0;
}
