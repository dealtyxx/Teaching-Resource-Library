/**
 * Red Mathematics - Hunan Culture Knowledge Graph
 */

// DOM Elements
const resetBtn = document.getElementById('resetBtn');
const compositionBtn = document.getElementById('compositionBtn');
const graphSvg = document.getElementById('graphSvg');
const nodesLayer = document.getElementById('nodesLayer');
const resultsContainer = document.getElementById('resultsContainer');

// Knowledge Graph Data
const PEOPLE = [
    { id: 'p1', name: '毛泽东', desc: '伟大领袖，诗人' },
    { id: 'p2', name: '曾国藩', desc: '湘军统帅，理学家' },
    { id: 'p3', name: '齐白石', desc: '国画大师' }
];

const WORKS = [
    { id: 'w1', name: '沁园春·长沙', desc: '毛泽东诗词代表作' },
    { id: 'w2', name: '《曾国藩家书》', desc: '经典家训文献' },
    { id: 'w3', name: '《虾画》', desc: '齐白石代表画作' },
    { id: 'w4', name: '《岳阳楼记》评注', desc: '曾国藩经典评注' }
];

const LOCATIONS = [
    { id: 'l1', name: '橘子洲', desc: '长沙地标，红色圣地' },
    { id: 'l2', name: '岳阳楼', desc: '江南名楼，文化地标' },
    { id: 'l3', name: '韶山', desc: '毛泽东故居' },
    { id: 'l4', name: '湘江', desc: '湖南母亲河' }
];

// Relations
// R_authorship: People → Works
const R_AUTHORSHIP = [
    ['p1', 'w1'],  // 毛泽东 → 沁园春·长沙
    ['p2', 'w2'],  // 曾国藩 → 家书
    ['p2', 'w4'],  // 曾国藩 → 岳阳楼记评注
    ['p3', 'w3']   // 齐白石 → 虾画
];

// R_description: Works → Locations
const R_DESCRIPTION = [
    ['w1', 'l1'],  // 沁园春·长沙 → 橘子洲
    ['w1', 'l4'],  // 沁园春·长沙 → 湘江
    ['w2', 'l3'],  // 家书 → 韶山 (涉及故乡)
    ['w4', 'l2']   // 岳阳楼记评注 → 岳阳楼
];

// Build maps
const entityMap = {};
[...PEOPLE, ...WORKS, ...LOCATIONS].forEach(e => {
    entityMap[e.id] = e;
});

// State
let selectedEntity = null;
let selectedType = null;
let highlightedNodes = new Set();
let highlightedEdges = new Set();
let nodePositions = {};

// Layout
function calculateLayout() {
    const width = 700;
    const height = 500;
    const colGap = width / 4;
    const startX = colGap;

    // People (left column)
    PEOPLE.forEach((p, i) => {
        const y = height / (PEOPLE.length + 1) * (i + 1) + 30;
        nodePositions[p.id] = { x: startX, y, type: 'people', data: p };
    });

    // Works (middle column)
    WORKS.forEach((w, i) => {
        const y = height / (WORKS.length + 1) * (i + 1) + 30;
        nodePositions[w.id] = { x: startX + colGap, y, type: 'works', data: w };
    });

    // Locations (right column)
    LOCATIONS.forEach((l, i) => {
        const y = height / (LOCATIONS.length + 1) * (i + 1) + 30;
        nodePositions[l.id] = { x: startX + colGap * 2, y, type: 'locations', data: l };
    });
}

// Rendering
function renderGraph() {
    renderNodes();
    renderEdges();
}

function renderNodes() {
    nodesLayer.innerHTML = '';

    Object.entries(nodePositions).forEach(([id, pos]) => {
        const node = document.createElement('div');
        node.className = `entity-node ${pos.type}`;
        node.id = `node-${id}`;
        node.textContent = pos.data.name;

        node.style.left = `${pos.x - 35}px`;
        node.style.top = `${pos.y - 20}px`;

        node.addEventListener('click', () => handleNodeClick(id, pos.type));

        nodesLayer.appendChild(node);
    });
}

function renderEdges() {
    const defs = graphSvg.querySelector('defs');
    graphSvg.innerHTML = '';
    graphSvg.appendChild(defs);

    // Authorship edges
    R_AUTHORSHIP.forEach(([from, to]) => {
        const edge = createEdge(from, to);
        graphSvg.appendChild(edge);
    });

    // Description edges
    R_DESCRIPTION.forEach(([from, to]) => {
        const edge = createEdge(from, to);
        graphSvg.appendChild(edge);
    });
}

function createEdge(fromId, toId) {
    const from = nodePositions[fromId];
    const to = nodePositions[toId];

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    path.setAttribute('d', d);
    path.setAttribute('class', 'graph-edge');
    path.dataset.edgeId = `${fromId}-${toId}`;

    return path;
}

// Interaction
function handleNodeClick(id, type) {
    selectedEntity = id;
    selectedType = type;

    clearHighlights();

    document.querySelectorAll('.entity-node').forEach(n => n.classList.remove('selected'));
    document.getElementById(`node-${id}`).classList.add('selected');

    if (type === 'people') {
        queryAuthorships(id);
        compositionBtn.style.display = 'flex';
    } else if (type === 'works') {
        queryDescriptions(id);
        compositionBtn.style.display = 'none';
    } else {
        compositionBtn.style.display = 'none';
        showMessage('点击人物或作品节点进行查询');
    }
}

// Query Functions
function queryAuthorships(personId) {
    const works = R_AUTHORSHIP.filter(([p]) => p === personId).map(([, w]) => w);

    highlightedNodes.add(personId);
    works.forEach(w => {
        highlightedNodes.add(w);
        highlightedEdges.add(`${personId}-${w}`);
    });

    updateHighlights();

    const person = entityMap[personId];
    const workNames = works.map(w => entityMap[w].name);

    displayResults({
        title: `创作关系查询: ${person.name}`,
        formula: 'R<sub>authorship</sub>',
        sections: [
            {
                label: '创作的作品',
                items: workNames
            }
        ]
    });
}

function queryDescriptions(workId) {
    const locations = R_DESCRIPTION.filter(([w]) => w === workId).map(([, l]) => l);

    highlightedNodes.add(workId);
    locations.forEach(l => {
        highlightedNodes.add(l);
        highlightedEdges.add(`${workId}-${l}`);
    });

    updateHighlights();

    const work = entityMap[workId];
    const locNames = locations.map(l => entityMap[l].name);

    displayResults({
        title: `描述关系查询: ${work.name}`,
        formula: 'R<sub>description</sub>',
        sections: [
            {
                label: '描述的景点',
                items: locNames
            }
        ]
    });
}

function queryComposition() {
    if (!selectedEntity || selectedType !== 'people') return;

    // Find works by person
    const works = R_AUTHORSHIP.filter(([p]) => p === selectedEntity).map(([, w]) => w);

    // Find locations described in those works
    const locations = new Set();
    works.forEach(w => {
        R_DESCRIPTION.filter(([work]) => work === w).forEach(([, loc]) => {
            locations.add(loc);
        });
    });

    // Highlight path
    clearHighlights();
    highlightedNodes.add(selectedEntity);

    works.forEach(w => {
        highlightedNodes.add(w);
        highlightedEdges.add(`${selectedEntity}-${w}`);
    });

    locations.forEach(l => {
        highlightedNodes.add(l);
        works.forEach(w => {
            if (R_DESCRIPTION.some(([work, loc]) => work === w && loc === l)) {
                highlightedEdges.add(`${w}-${l}`);
            }
        });
    });

    updateHighlights();

    const person = entityMap[selectedEntity];
    const workNames = works.map(w => `${entityMap[w].name}`);
    const locNames = Array.from(locations).map(l => entityMap[l].name);

    displayResults({
        title: `间接关联发现: ${person.name} 与景点`,
        formula: 'R<sub>authorship</sub> ∘ R<sub>description</sub>',
        sections: [
            {
                label: '通过作品连接',
                items: workNames
            },
            {
                label: '关联的景点',
                items: locNames
            }
        ],
        insight: `通过关系复合运算，我们发现 ${person.name} 的作品描述了 ${locNames.join('、')} 等地，体现了湖湘文化与地理的深刻联系。`
    });
}

function updateHighlights() {
    document.querySelectorAll('.entity-node').forEach(node => {
        const id = node.id.replace('node-', '');
        if (highlightedNodes.has(id)) {
            node.classList.add('highlighted');
        } else {
            node.classList.remove('highlighted');
        }
    });

    document.querySelectorAll('.graph-edge').forEach(edge => {
        if (highlightedEdges.has(edge.dataset.edgeId)) {
            edge.classList.add('highlighted');
        } else {
            edge.classList.remove('highlighted');
        }
    });
}

function clearHighlights() {
    highlightedNodes.clear();
    highlightedEdges.clear();
    updateHighlights();
}

function displayResults(data) {
    let html = `<div class="result-section">
                    <h4>${data.title} <span class="result-badge">${data.formula}</span></h4>`;

    data.sections.forEach(section => {
        html += `<p style="font-size:0.85rem; margin:8px 0 6px; font-weight:600;">${section.label}:</p>`;
        html += '<ul class="result-list">';
        section.items.forEach(item => {
            html += `<li>${item}</li>`;
        });
        html += '</ul>';
    });

    if (data.insight) {
        html += `<p style="margin-top:12px; padding:12px; background:rgba(197,160,89,0.1); border-radius:6px; font-size:0.85rem; line-height:1.6;">
                    💡 ${data.insight}
                 </p>`;
    }

    html += '</div>';
    resultsContainer.innerHTML = html;
}

function showMessage(msg) {
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <span class="empty-icon">🎭</span>
            <p>${msg}</p>
        </div>
    `;
}

// Event Listeners
compositionBtn.addEventListener('click', queryComposition);

resetBtn.addEventListener('click', () => {
    selectedEntity = null;
    selectedType = null;
    clearHighlights();

    document.querySelectorAll('.entity-node').forEach(n => n.classList.remove('selected'));
    compositionBtn.style.display = 'none';

    showMessage('点击节点开始探索湖湘文化');
});

window.addEventListener('resize', () => {
    calculateLayout();
    renderGraph();
});

// Init
calculateLayout();
renderGraph();
showMessage('点击节点开始探索湖湘文化');
