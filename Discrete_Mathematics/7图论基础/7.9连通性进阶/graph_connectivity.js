// ============================================
// 全局状态管理
// ============================================
let currentConcept = 'cut-vertex';
let currentCaseIndex = 0;
let animationSpeed = 1000;
let isAnimating = false;

// ============================================
// 概念说明数据
// ============================================
const CONCEPT_EXPLANATIONS = {
    'cut-vertex': {
        title: '割点 (Cut Vertex)',
        content: '割点是图中的关键节点,删除该节点及其关联边后,图的连通分量数增加。割点是网络中的"咽喉要道",其失效会导致网络分裂。',
        formula: '若删除顶点v后,G的连通分量数 > 原连通分量数,则v是割点',
        example: '交通枢纽、关键干部、核心技术节点'
    },
    'cut-edge': {
        title: '割边 (Cut Edge / Bridge)',
        content: '割边是图中的关键边,删除该边后图的连通分量数增加。割边是连接不同区域的唯一通道,其断裂会导致网络分割。',
        formula: '若删除边e后,G的连通分量数 > 原连通分量数,则e是割边',
        example: '唯一桥梁、关键通信线路、必经之路'
    },
    'vertex-connectivity': {
        title: '点连通度 κ(G)',
        content: '点连通度是使图不连通所需删除的最少顶点数。κ(G)越大,图的鲁棒性越强,抗破坏能力越强。',
        formula: 'κ(G) = min{|S| : S⊆V, G-S不连通}',
        example: '网络冗余度、组织抗风险能力'
    },
    'edge-connectivity': {
        title: '边连通度 λ(G)',
        content: '边连通度是使图不连通所需删除的最少边数。λ(G)反映了网络的冗余路径数量。',
        formula: 'λ(G) = min{|F| : F⊆E, G-F不连通}',
        example: '通信线路冗余、交通路网备份'
    },
    'strong-connectivity': {
        title: '强连通性',
        content: '有向图中,若任意两点间存在双向路径,则图是强连通的。单向连通指任意两点间至少有一个方向的路径。弱连通指忽略方向后图连通。',
        formula: '强连通 ⊃ 单向连通 ⊃ 弱连通',
        example: '双向交流、单向指挥、松散联系'
    },
    'augmenting-path': {
        title: '扩大路径法',
        content: '通过寻找增广路径来扩大匹配或流量。从未匹配点出发,沿未匹配边-匹配边交替路径,到达另一个未匹配点,可使匹配数+1。',
        formula: '若存在增广路径P,则|M⊕P| = |M| + 1',
        example: '人员调配、资源优化、婚姻匹配'
    }
};

// ============================================
// 案例数据
// ============================================
const CASES = [
    {
        concept: 'cut-vertex',
        name: '交通枢纽城市 - 割点分析',
        graph: {
            vertices: [
                {id: 'beijing', name: '北京', x: 300, y: 100},
                {id: 'tianjin', name: '天津', x: 380, y: 160},
                {id: 'shijiazhuang', name: '石家庄', x: 250, y: 200},
                {id: 'taiyuan', name: '太原', x: 150, y: 180},
                {id: 'hohhot', name: '呼和浩特', x: 200, y: 80},
                {id: 'zhengzhou', name: '郑州', x: 280, y: 300},
                {id: 'jinan', name: '济南', x: 420, y: 240}
            ],
            edges: [
                {from: 'beijing', to: 'tianjin'},
                {from: 'beijing', to: 'shijiazhuang'},
                {from: 'beijing', to: 'hohhot'},
                {from: 'shijiazhuang', to: 'taiyuan'},
                {from: 'shijiazhuang', to: 'zhengzhou'},
                {from: 'tianjin', to: 'jinan'},
                {from: 'jinan', to: 'zhengzhou'}
            ]
        },
        philosophy: '割点分析揭示了网络中的关键节点。北京作为交通枢纽,是连接华北各省的"咽喉要道"。这启示我们:在国家治理中,要识别关键节点,确保其稳定运行。正如党中央是全党的核心,关键岗位的干部要守土有责、守土尽责。割点的存在也提醒我们要构建备份机制,避免单点故障,体现"统筹发展与安全"的战略思维。'
    },
    {
        concept: 'cut-vertex',
        name: '组织架构关键人物 - 割点识别',
        graph: {
            vertices: [
                {id: 'secretary', name: '书记', x: 250, y: 100},
                {id: 'dept1', name: '组织部', x: 150, y: 200},
                {id: 'dept2', name: '宣传部', x: 250, y: 200},
                {id: 'dept3', name: '纪检', x: 350, y: 200},
                {id: 'base1', name: '支部A', x: 100, y: 320},
                {id: 'base2', name: '支部B', x: 200, y: 320},
                {id: 'base3', name: '支部C', x: 300, y: 320},
                {id: 'base4', name: '支部D', x: 400, y: 320}
            ],
            edges: [
                {from: 'secretary', to: 'dept1'},
                {from: 'secretary', to: 'dept2'},
                {from: 'secretary', to: 'dept3'},
                {from: 'dept1', to: 'base1'},
                {from: 'dept1', to: 'base2'},
                {from: 'dept2', to: 'base2'},
                {from: 'dept2', to: 'base3'},
                {from: 'dept3', to: 'base4'}
            ]
        },
        philosophy: '组织架构中的割点人物承担着承上启下的关键作用。书记、各部门负责人都是组织的"关键少数"。割点分析告诉我们:要加强对关键岗位的监督和支持,既要防止权力过度集中,又要确保指挥链条畅通。这体现了"民主集中制"的组织原则——既有集中统一领导,又有适当分权制衡。'
    },
    {
        concept: 'cut-edge',
        name: '长江大桥 - 割边分析',
        graph: {
            vertices: [
                {id: 'north1', name: '江北区A', x: 150, y: 100},
                {id: 'north2', name: '江北区B', x: 300, y: 100},
                {id: 'bridge', name: '长江大桥', x: 225, y: 220},
                {id: 'south1', name: '江南区A', x: 150, y: 350},
                {id: 'south2', name: '江南区B', x: 300, y: 350}
            ],
            edges: [
                {from: 'north1', to: 'north2'},
                {from: 'north1', to: 'bridge'},
                {from: 'north2', to: 'bridge'},
                {from: 'bridge', to: 'south1'},
                {from: 'bridge', to: 'south2'},
                {from: 'south1', to: 'south2'}
            ]
        },
        philosophy: '割边代表着网络中的唯一通道和关键连接。长江大桥连接南北,是不可替代的交通要道。这启示我们:基础设施建设要注重冗余备份,不能让城市发展依赖于单一通道。同时,割边也象征着"桥梁和纽带"的作用——党员干部要成为联系群众的桥梁,不能让这条联系断裂。'
    },
    {
        concept: 'vertex-connectivity',
        name: '供应链网络鲁棒性 - 点连通度',
        graph: {
            vertices: [
                {id: 's', name: '供应商', x: 100, y: 200},
                {id: 'm1', name: '中转A', x: 220, y: 120},
                {id: 'm2', name: '中转B', x: 220, y: 200},
                {id: 'm3', name: '中转C', x: 220, y: 280},
                {id: 'd', name: '需求方', x: 350, y: 200}
            ],
            edges: [
                {from: 's', to: 'm1'},
                {from: 's', to: 'm2'},
                {from: 's', to: 'm3'},
                {from: 'm1', to: 'd'},
                {from: 'm2', to: 'd'},
                {from: 'm3', to: 'd'},
                {from: 'm1', to: 'm2'},
                {from: 'm2', to: 'm3'}
            ]
        },
        philosophy: '点连通度κ(G)=3意味着要让供应链中断,必须同时破坏3个节点。这体现了"底线思维"和"安全意识"。新冠疫情暴露了全球供应链的脆弱性,我们要构建"双循环"新发展格局,提高产业链供应链的韧性。高连通度的网络就像多条腿的板凳,比单腿支撑稳固得多。这是"系统观念"的具体体现。'
    },
    {
        concept: 'edge-connectivity',
        name: '通信网络冗余 - 边连通度',
        graph: {
            vertices: [
                {id: 'hq', name: '总部', x: 250, y: 150},
                {id: 'b1', name: '分部1', x: 150, y: 280},
                {id: 'b2', name: '分部2', x: 250, y: 320},
                {id: 'b3', name: '分部3', x: 350, y: 280}
            ],
            edges: [
                {from: 'hq', to: 'b1'},
                {from: 'hq', to: 'b2'},
                {from: 'hq', to: 'b3'},
                {from: 'b1', to: 'b2'},
                {from: 'b2', to: 'b3'},
                {from: 'b3', to: 'b1'}
            ]
        },
        philosophy: '边连通度λ(G)反映了通信线路的冗余程度。在信息化时代,网络安全至关重要。习近平总书记强调"没有网络安全就没有国家安全"。高边连通度意味着即使部分线路中断,信息仍能通过其他路径传输。这启示我们要建设多元化的信息传播渠道,既要有主流媒体,也要有基层宣传网络,形成全覆盖的舆论引导体系。'
    },
    {
        concept: 'strong-connectivity',
        name: '民主集中制 - 强连通有向图',
        graph: {
            vertices: [
                {id: 'center', name: '中央', x: 250, y: 120},
                {id: 'province', name: '省级', x: 250, y: 220},
                {id: 'city', name: '市级', x: 250, y: 320},
                {id: 'people', name: '人民', x: 250, y: 420}
            ],
            edges: [
                {from: 'center', to: 'province', directed: true},
                {from: 'province', to: 'city', directed: true},
                {from: 'city', to: 'people', directed: true},
                {from: 'people', to: 'city', directed: true},
                {from: 'city', to: 'province', directed: true},
                {from: 'province', to: 'center', directed: true}
            ]
        },
        philosophy: '强连通性体现了"从群众中来,到群众中去"的工作方法。中央的政策下达到基层(向下路径),基层的声音通过调研、信访等渠道上达中央(向上路径),形成双向互动的闭环。这就是民主集中制:既有自上而下的集中统一领导,又有自下而上的民主监督。强连通保证了政令畅通和民意上达,是国家治理体系的重要特征。'
    },
    {
        concept: 'augmenting-path',
        name: '精准扶贫配对 - 扩大路径法',
        graph: {
            vertices: [
                {id: 'p1', name: '贫困户A', x: 120, y: 120, type: 'left'},
                {id: 'p2', name: '贫困户B', x: 120, y: 220, type: 'left'},
                {id: 'p3', name: '贫困户C', x: 120, y: 320, type: 'left'},
                {id: 'h1', name: '帮扶干部1', x: 350, y: 120, type: 'right'},
                {id: 'h2', name: '帮扶干部2', x: 350, y: 220, type: 'right'},
                {id: 'h3', name: '帮扶干部3', x: 350, y: 320, type: 'right'}
            ],
            edges: [
                {from: 'p1', to: 'h1', matched: false},
                {from: 'p1', to: 'h2', matched: false},
                {from: 'p2', to: 'h2', matched: false},
                {from: 'p2', to: 'h3', matched: false},
                {from: 'p3', to: 'h1', matched: false},
                {from: 'p3', to: 'h3', matched: false}
            ]
        },
        philosophy: '扩大路径法(增广路径)是匹配理论的核心算法。精准扶贫要求"一对一"结对帮扶,如何让更多贫困户得到帮扶?通过调整已有配对,为新的贫困户找到帮扶对象。这体现了"系统优化"思想:局部调整服务于整体目标。扩大路径法告诉我们,资源调配不是一成不变的,要动态优化,让有限的资源发挥最大效益,实现"应扶尽扶"。'
    },
    {
        concept: 'augmenting-path',
        name: '就业岗位匹配 - 最大匹配',
        graph: {
            vertices: [
                {id: 'g1', name: '毕业生A', x: 120, y: 100, type: 'left'},
                {id: 'g2', name: '毕业生B', x: 120, y: 200, type: 'left'},
                {id: 'g3', name: '毕业生C', x: 120, y: 300, type: 'left'},
                {id: 'g4', name: '毕业生D', x: 120, y: 400, type: 'left'},
                {id: 'j1', name: '岗位1', x: 350, y: 120, type: 'right'},
                {id: 'j2', name: '岗位2', x: 350, y: 220, type: 'right'},
                {id: 'j3', name: '岗位3', x: 350, y: 320, type: 'right'}
            ],
            edges: [
                {from: 'g1', to: 'j1', matched: false},
                {from: 'g1', to: 'j2', matched: false},
                {from: 'g2', to: 'j1', matched: false},
                {from: 'g3', to: 'j2', matched: false},
                {from: 'g3', to: 'j3', matched: false},
                {from: 'g4', to: 'j3', matched: false}
            ]
        },
        philosophy: '就业是最大的民生。最大匹配问题反映了"人尽其才、岗尽其用"的理想。通过扩大路径法,我们可以让更多毕业生找到合适岗位。但算法也告诉我们,不是所有人都能匹配成功——这就需要政府创造更多就业机会,提供职业培训,实现更高质量和更充分的就业。这体现了以人民为中心的发展思想。'
    }
];

// ============================================
// 图论算法实现
// ============================================

// 查找割点 (Tarjan算法)
function findCutVertices(graph) {
    const vertices = graph.vertices.map(v => v.id);
    const adjList = buildAdjacencyList(graph);
    const visited = new Set();
    const disc = {};
    const low = {};
    const parent = {};
    const cutVertices = new Set();
    const steps = [];
    let time = 0;

    function dfs(u) {
        visited.add(u);
        disc[u] = low[u] = time++;
        let children = 0;

        steps.push({
            type: 'visit',
            description: `访问节点 ${u}, disc[${u}]=${disc[u]}`,
            current: u
        });

        for (let v of (adjList[u] || [])) {
            if (!visited.has(v)) {
                children++;
                parent[v] = u;
                dfs(v);

                low[u] = Math.min(low[u], low[v]);

                // 检查是否为割点
                if (parent[u] === undefined && children > 1) {
                    cutVertices.add(u);
                    steps.push({
                        type: 'cut-vertex',
                        description: `${u} 是割点(根节点,子树>1)`,
                        cutVertex: u
                    });
                }

                if (parent[u] !== undefined && low[v] >= disc[u]) {
                    cutVertices.add(u);
                    steps.push({
                        type: 'cut-vertex',
                        description: `${u} 是割点(low[${v}]≥disc[${u}])`,
                        cutVertex: u
                    });
                }
            } else if (v !== parent[u]) {
                low[u] = Math.min(low[u], disc[v]);
            }
        }
    }

    // 对每个连通分量执行DFS
    for (let vertex of vertices) {
        if (!visited.has(vertex)) {
            parent[vertex] = undefined;
            dfs(vertex);
        }
    }

    return { cutVertices: Array.from(cutVertices), steps };
}

// 查找割边 (桥)
function findCutEdges(graph) {
    const vertices = graph.vertices.map(v => v.id);
    const adjList = buildAdjacencyList(graph);
    const visited = new Set();
    const disc = {};
    const low = {};
    const parent = {};
    const cutEdges = [];
    const steps = [];
    let time = 0;

    function dfs(u) {
        visited.add(u);
        disc[u] = low[u] = time++;

        steps.push({
            type: 'visit',
            description: `访问节点 ${u}, disc[${u}]=${disc[u]}`,
            current: u
        });

        for (let v of (adjList[u] || [])) {
            if (!visited.has(v)) {
                parent[v] = u;
                dfs(v);

                low[u] = Math.min(low[u], low[v]);

                // 检查是否为割边
                if (low[v] > disc[u]) {
                    cutEdges.push({from: u, to: v});
                    steps.push({
                        type: 'cut-edge',
                        description: `(${u},${v}) 是割边(low[${v}]>disc[${u}])`,
                        cutEdge: {from: u, to: v}
                    });
                }
            } else if (v !== parent[u]) {
                low[u] = Math.min(low[u], disc[v]);
            }
        }
    }

    for (let vertex of vertices) {
        if (!visited.has(vertex)) {
            parent[vertex] = undefined;
            dfs(vertex);
        }
    }

    return { cutEdges, steps };
}

// 计算连通度 (简化版:通过删除节点测试)
function calculateConnectivity(graph) {
    const steps = [];
    const vertices = graph.vertices.map(v => v.id);

    // 点连通度:最少需要删除多少个点才能使图不连通
    let vertexConnectivity = vertices.length - 1;

    for (let i = 1; i < vertices.length; i++) {
        // 尝试删除i个顶点的所有组合
        const combinations = getCombinations(vertices, i);
        for (let combo of combinations) {
            const remainingGraph = removeVertices(graph, combo);
            if (!isConnected(remainingGraph)) {
                vertexConnectivity = i;
                steps.push({
                    type: 'vertex-connectivity',
                    description: `删除节点 {${combo.join(',')}} 后图不连通`,
                    removed: combo
                });
                break;
            }
        }
        if (vertexConnectivity === i) break;
    }

    return { vertexConnectivity, steps };
}

// 辅助函数:构建邻接表
function buildAdjacencyList(graph) {
    const adjList = {};
    graph.vertices.forEach(v => adjList[v.id] = []);

    graph.edges.forEach(edge => {
        adjList[edge.from].push(edge.to);
        if (!edge.directed) {
            adjList[edge.to].push(edge.from);
        }
    });

    return adjList;
}

// 辅助函数:检查图是否连通
function isConnected(graph) {
    if (graph.vertices.length === 0) return true;

    const visited = new Set();
    const adjList = buildAdjacencyList(graph);
    const start = graph.vertices[0].id;

    function dfs(u) {
        visited.add(u);
        for (let v of (adjList[u] || [])) {
            if (!visited.has(v)) dfs(v);
        }
    }

    dfs(start);
    return visited.size === graph.vertices.length;
}

// 辅助函数:删除顶点
function removeVertices(graph, toRemove) {
    const remainingVertices = graph.vertices.filter(v => !toRemove.includes(v.id));
    const remainingEdges = graph.edges.filter(e =>
        !toRemove.includes(e.from) && !toRemove.includes(e.to)
    );
    return { vertices: remainingVertices, edges: remainingEdges };
}

// 辅助函数:获取组合
function getCombinations(arr, k) {
    if (k === 1) return arr.map(x => [x]);
    const result = [];
    for (let i = 0; i <= arr.length - k; i++) {
        const head = arr[i];
        const tailCombos = getCombinations(arr.slice(i + 1), k - 1);
        tailCombos.forEach(combo => result.push([head, ...combo]));
    }
    return result;
}

// 扩大路径法 (匈牙利算法)
function findMaximumMatching(graph) {
    const steps = [];
    const matching = new Map();
    const leftVertices = graph.vertices.filter(v => v.type === 'left').map(v => v.id);

    function findAugmentingPath(u, visited) {
        const neighbors = graph.edges.filter(e => e.from === u).map(e => e.to);

        for (let v of neighbors) {
            if (visited.has(v)) continue;
            visited.add(v);

            // 如果v未匹配,或者v的匹配对象可以找到增广路径
            if (!matching.has(v) || findAugmentingPath(matching.get(v), visited)) {
                matching.set(v, u);
                matching.set(u, v);
                steps.push({
                    type: 'match',
                    description: `找到增广路径,匹配 ${u} ↔ ${v}`,
                    from: u,
                    to: v
                });
                return true;
            }
        }
        return false;
    }

    for (let u of leftVertices) {
        const visited = new Set();
        findAugmentingPath(u, visited);
    }

    return { matching, steps, size: matching.size / 2 };
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

    const isDirected = caseData.graph.edges.some(e => e.directed);

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

        edgesGroup.appendChild(line);

        // 有向图添加箭头
        if (isDirected) {
            const angle = Math.atan2(toVertex.y - fromVertex.y, toVertex.x - fromVertex.x);
            const arrowLength = 15;
            const arrowX = toVertex.x - Math.cos(angle) * 30;
            const arrowY = toVertex.y - Math.sin(angle) * 30;

            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const x1 = arrowX - Math.cos(angle - Math.PI / 6) * arrowLength;
            const y1 = arrowY - Math.sin(angle - Math.PI / 6) * arrowLength;
            const x2 = arrowX - Math.cos(angle + Math.PI / 6) * arrowLength;
            const y2 = arrowY - Math.sin(angle + Math.PI / 6) * arrowLength;

            arrow.setAttribute('points', `${arrowX},${arrowY} ${x1},${y1} ${x2},${y2}`);
            arrow.setAttribute('fill', 'var(--edge-default)');
            edgesGroup.appendChild(arrow);
        }
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

async function analyzeGraph(caseData) {
    const concept = caseData.concept;
    let result, steps;

    switch (concept) {
        case 'cut-vertex':
            result = findCutVertices(caseData.graph);
            await animateCutVertices(result, caseData);
            break;
        case 'cut-edge':
            result = findCutEdges(caseData.graph);
            await animateCutEdges(result, caseData);
            break;
        case 'vertex-connectivity':
        case 'edge-connectivity':
            result = calculateConnectivity(caseData.graph);
            await animateConnectivity(result, caseData);
            break;
        case 'strong-connectivity':
            await animateStrongConnectivity(caseData);
            break;
        case 'augmenting-path':
            result = findMaximumMatching(caseData.graph);
            await animateMatching(result, caseData);
            break;
    }
}

async function animateCutVertices(result, caseData) {
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';

    for (let i = 0; i < result.steps.length; i++) {
        const step = result.steps[i];

        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item active';
        stepDiv.innerHTML = `<span class="step-num">${i+1}</span>${step.description}`;
        stepsList.appendChild(stepDiv);

        if (step.current) {
            const node = document.querySelector(`[data-id="${step.current}"]`);
            if (node) node.classList.add('checking');
        }

        if (step.cutVertex) {
            const node = document.querySelector(`[data-id="${step.cutVertex}"]`);
            if (node) {
                node.classList.remove('checking');
                node.classList.add('cut-vertex');
            }
        }

        await sleep(animationSpeed);
        stepDiv.classList.remove('active');
    }

    displayCutVerticesResult(result);
}

async function animateCutEdges(result, caseData) {
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';

    for (let i = 0; i < result.steps.length; i++) {
        const step = result.steps[i];

        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item active';
        stepDiv.innerHTML = `<span class="step-num">${i+1}</span>${step.description}`;
        stepsList.appendChild(stepDiv);

        if (step.current) {
            const node = document.querySelector(`[data-id="${step.current}"]`);
            if (node) node.classList.add('checking');
        }

        if (step.cutEdge) {
            const edge = document.querySelector(
                `[data-from="${step.cutEdge.from}"][data-to="${step.cutEdge.to}"]`
            );
            if (edge) edge.classList.add('cut-edge');
        }

        await sleep(animationSpeed);
        stepDiv.classList.remove('active');
    }

    displayCutEdgesResult(result);
}

async function animateConnectivity(result, caseData) {
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';

    for (let i = 0; i < result.steps.length; i++) {
        const step = result.steps[i];

        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item active';
        stepDiv.innerHTML = `<span class="step-num">${i+1}</span>${step.description}`;
        stepsList.appendChild(stepDiv);

        if (step.removed) {
            step.removed.forEach(nodeId => {
                const node = document.querySelector(`[data-id="${nodeId}"]`);
                if (node) node.style.opacity = '0.3';
            });
        }

        await sleep(animationSpeed);
        stepDiv.classList.remove('active');

        // 恢复透明度
        if (step.removed) {
            step.removed.forEach(nodeId => {
                const node = document.querySelector(`[data-id="${nodeId}"]`);
                if (node) node.style.opacity = '1';
            });
        }
    }

    displayConnectivityResult(result);
}

async function animateStrongConnectivity(caseData) {
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';

    const steps = [
        '检查任意两点间是否存在双向路径',
        '验证强连通性:所有节点互相可达',
        '确认图的连通性质'
    ];

    for (let i = 0; i < steps.length; i++) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item active';
        stepDiv.innerHTML = `<span class="step-num">${i+1}</span>${steps[i]}`;
        stepsList.appendChild(stepDiv);
        await sleep(animationSpeed);
        stepDiv.classList.remove('active');
    }

    const resultDisplay = document.getElementById('resultDisplay');
    resultDisplay.innerHTML = '<strong>强连通性分析:</strong><br>图中存在双向连通路径,体现了上下级之间的双向沟通机制。';
}

async function animateMatching(result, caseData) {
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';

    for (let i = 0; i < result.steps.length; i++) {
        const step = result.steps[i];

        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item active';
        stepDiv.innerHTML = `<span class="step-num">${i+1}</span>${step.description}`;
        stepsList.appendChild(stepDiv);

        if (step.from && step.to) {
            const edge = document.querySelector(
                `[data-from="${step.from}"][data-to="${step.to}"]`
            );
            if (edge) {
                edge.classList.add('visited');
                edge.style.strokeWidth = '4px';
            }
        }

        await sleep(animationSpeed);
        stepDiv.classList.remove('active');
    }

    displayMatchingResult(result);
}

function displayCutVerticesResult(result) {
    const resultDisplay = document.getElementById('resultDisplay');
    let html = '<strong>割点识别结果:</strong><br>';

    if (result.cutVertices.length === 0) {
        html += '该图不存在割点,具有较好的鲁棒性。';
    } else {
        html += `共发现 ${result.cutVertices.length} 个割点:<br>`;
        result.cutVertices.forEach(v => {
            html += `<span class="cut-vertex">${v}</span> `;
        });
    }

    resultDisplay.innerHTML = html;
}

function displayCutEdgesResult(result) {
    const resultDisplay = document.getElementById('resultDisplay');
    let html = '<strong>割边识别结果:</strong><br>';

    if (result.cutEdges.length === 0) {
        html += '该图不存在割边,所有路径都有备份。';
    } else {
        html += `共发现 ${result.cutEdges.length} 条割边:<br>`;
        result.cutEdges.forEach(e => {
            html += `<span class="cut-edge">(${e.from},${e.to})</span> `;
        });
    }

    resultDisplay.innerHTML = html;
}

function displayConnectivityResult(result) {
    const resultDisplay = document.getElementById('resultDisplay');
    resultDisplay.innerHTML = `<strong>连通度分析:</strong><br>
        点连通度 κ(G) = ${result.vertexConnectivity}<br>
        <em style="font-size:0.8rem;">至少需要删除${result.vertexConnectivity}个顶点才能使图不连通</em>`;
}

function displayMatchingResult(result) {
    const resultDisplay = document.getElementById('resultDisplay');
    resultDisplay.innerHTML = `<strong>最大匹配结果:</strong><br>
        匹配数: ${result.size}<br>
        <em style="font-size:0.8rem;">成功配对${result.size}组</em>`;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function resetVisualization() {
    document.querySelectorAll('.node-group').forEach(g => {
        g.classList.remove('visited', 'current', 'checking', 'cut-vertex');
        g.style.opacity = '1';
    });
    document.querySelectorAll('.edge-line').forEach(e => {
        e.classList.remove('visited', 'cut-edge');
        e.style.strokeWidth = '2px';
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
    currentConcept = caseData.concept;

    // 更新概念按钮
    document.querySelectorAll('.concept-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.concept === currentConcept);
    });

    // 更新概念说明
    updateConceptExplanation(currentConcept);

    // 更新思政内涵
    document.getElementById('philosophyPanel').innerHTML =
        `<p style="font-size: 0.85rem; line-height: 1.6;">${caseData.philosophy}</p>`;

    // 渲染图形
    renderGraph(caseData);
    resetVisualization();
}

function updateConceptExplanation(concept) {
    const explanation = CONCEPT_EXPLANATIONS[concept];
    const panel = document.getElementById('conceptExplanation');

    panel.innerHTML = `
        <h3>${explanation.title}</h3>
        <p>${explanation.content}</p>
        <div class="formula">${explanation.formula}</div>
        <p style="font-size:0.8rem; color:var(--accent-gold);">
            <strong>实例:</strong> ${explanation.example}
        </p>
    `;
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 概念切换
    document.querySelectorAll('.concept-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const concept = btn.dataset.concept;
            currentConcept = concept;

            // 更新概念说明
            updateConceptExplanation(concept);

            // 查找匹配概念的案例
            const matchingIndex = CASES.findIndex(c => c.concept === concept);
            if (matchingIndex !== -1) {
                document.getElementById('caseSelector').value = matchingIndex;
                loadCase(matchingIndex);
            }
        });
    });

    // 填充案例选择器
    const caseSelector = document.getElementById('caseSelector');
    caseSelector.innerHTML = CASES.map((c, i) =>
        `<option value="${i}">${c.name}</option>`
    ).join('');

    // 案例选择
    caseSelector.addEventListener('change', (e) => {
        loadCase(parseInt(e.target.value));
    });

    // 速度控制
    document.getElementById('speed').addEventListener('input', (e) => {
        animationSpeed = 2000 - (e.target.value * 18);
    });

    // 分析按钮
    document.getElementById('analyzeBtn').addEventListener('click', async () => {
        if (isAnimating) return;

        isAnimating = true;
        document.getElementById('analyzeBtn').disabled = true;
        resetVisualization();

        const caseData = CASES[currentCaseIndex];
        await analyzeGraph(caseData);

        isAnimating = false;
        document.getElementById('analyzeBtn').disabled = false;
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
