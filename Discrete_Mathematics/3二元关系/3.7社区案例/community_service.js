/**
 * Red Mathematics - Community Service Participation System
 */

// DOM Elements
const clearBtn = document.getElementById('clearBtn');
const networkSvg = document.getElementById('networkSvg');
const nodesLayer = document.getElementById('nodesLayer');
const resultsContainer = document.getElementById('resultsContainer');

// Data Model
const RESIDENTS = [
    { id: 'r1', name: '张三' },
    { id: 'r2', name: '李四' },
    { id: 'r3', name: '王五' },
    { id: 'r4', name: '赵六' }
];

const ACTIVITIES = [
    { id: 'a1', name: '环保活动', icon: '🌱' },
    { id: 'a2', name: '助学活动', icon: '📚' },
    { id: 'a3', name: '敬老活动', icon: '🧓' }
];

const ORGANIZERS = [
    { id: 'o1', name: '王书记' },
    { id: 'o2', name: '李主任' },
    { id: 'o3', name: '张队长' }
];

// Relations: [from, to]
// R_participation: Residents → Activities
const R_PARTICIPATION = [
    ['r1', 'a1'], ['r1', 'a2'],  // 张三参与环保和助学
    ['r2', 'a1'], ['r2', 'a3'],  // 李四参与环保和敬老
    ['r3', 'a2'],                // 王五参与助学
    ['r4', 'a3']                 // 赵六参与敬老
];

// R_activity: Activities → Organizers
const R_ACTIVITY = [
    ['a1', 'o1'],  // 环保由王书记组织
    ['a2', 'o2'],  // 助学由李主任组织
    ['a3', 'o3']   // 敬老由张队长组织
];

// State
let nodePositions = {};
let highlightedNodes = new Set();
let highlightedEdges = new Set();

// Layout
function calculateLayout() {
    const container = document.querySelector('.network-panel');
    const width = container.clientWidth;
    const height = container.clientHeight - 100;

    const colGap = width / 4;
    const startX = colGap;

    // Residents (left column)
    RESIDENTS.forEach((r, i) => {
        const y = height / (RESIDENTS.length + 1) * (i + 1) + 30;
        nodePositions[r.id] = { x: startX, y, type: 'resident', data: r };
    });

    // Activities (middle column)
    ACTIVITIES.forEach((a, i) => {
        const y = height / (ACTIVITIES.length + 1) * (i + 1) + 30;
        nodePositions[a.id] = { x: startX + colGap, y, type: 'activity', data: a };
    });

    // Organizers (right column)
    ORGANIZERS.forEach((o, i) => {
        const y = height / (ORGANIZERS.length + 1) * (i + 1) + 30;
        nodePositions[o.id] = { x: startX + colGap * 2, y, type: 'organizer', data: o };
    });
}

// Rendering
function renderNetwork() {
    renderNodes();
    renderEdges();
}

function renderNodes() {
    nodesLayer.innerHTML = '';

    Object.entries(nodePositions).forEach(([id, pos]) => {
        const node = document.createElement('div');
        node.className = `entity-node ${pos.type}`;
        node.id = `node-${id}`;

        let label = pos.data.name;
        if (pos.data.icon) label = `${pos.data.icon} ${label}`;

        node.textContent = label;
        node.style.left = `${pos.x - 40}px`;
        node.style.top = `${pos.y - 20}px`;

        node.addEventListener('click', () => handleNodeClick(id, pos.type));

        nodesLayer.appendChild(node);
    });
}

function renderEdges() {
    const defs = networkSvg.querySelector('defs');
    networkSvg.innerHTML = '';
    networkSvg.appendChild(defs);

    // Participation edges
    R_PARTICIPATION.forEach(([from, to]) => {
        const edge = createEdge(from, to);
        edge.dataset.edgeId = `${from}-${to}`;
        networkSvg.appendChild(edge);
    });

    // Activity edges
    R_ACTIVITY.forEach(([from, to]) => {
        const edge = createEdge(from, to);
        edge.dataset.edgeId = `${from}-${to}`;
        networkSvg.appendChild(edge);
    });
}

function createEdge(fromId, toId) {
    const from = nodePositions[fromId];
    const to = nodePositions[toId];

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    path.setAttribute('d', d);
    path.setAttribute('class', 'network-edge');

    return path;
}

// Query Logic
function handleNodeClick(nodeId, nodeType) {
    clearHighlights();

    if (nodeType === 'activity') {
        // Query 1 & 2: Activity clicked
        queryActivity(nodeId);
    } else if (nodeType === 'organizer') {
        // Query 3: Organizer clicked
        queryOrganizer(nodeId);
    } else {
        showMessage('请点击活动或组织者节点进行查询');
    }
}

function queryActivity(activityId) {
    const activity = nodePositions[activityId].data;

    // Query 1: Find organizer (R_activity^-1)
    const organizer = R_ACTIVITY.find(([a, o]) => a === activityId);

    // Query 2: Find participants (R_participation^-1)
    const participants = R_PARTICIPATION.filter(([r, a]) => a === activityId);

    // Highlight
    highlightedNodes.add(activityId);

    if (organizer) {
        const [, orgId] = organizer;
        highlightedNodes.add(orgId);
        highlightedEdges.add(`${activityId}-${orgId}`);
    }

    participants.forEach(([resId]) => {
        highlightedNodes.add(resId);
        highlightedEdges.add(`${resId}-${activityId}`);
    });

    updateHighlights();

    // Display results
    const orgName = organizer ? nodePositions[organizer[1]].data.name : '无';
    const partNames = participants.map(([r]) => nodePositions[r].data.name);

    displayResults({
        title: `活动查询: ${activity.name}`,
        sections: [
            {
                label: '组织者 (Organizer)',
                items: [orgName],
                formula: 'R<sub>activity</sub><sup>-1</sup>'
            },
            {
                label: '参与者 (Participants)',
                items: partNames,
                formula: 'R<sub>participation</sub><sup>-1</sup>'
            }
        ]
    });
}

function queryOrganizer(organizerId) {
    const organizer = nodePositions[organizerId].data;

    // Find activities organized by this person
    const activities = R_ACTIVITY.filter(([a, o]) => o === organizerId).map(([a]) => a);

    // Find all participants in these activities (Composition)
    const allParticipants = new Set();
    activities.forEach(actId => {
        R_PARTICIPATION
            .filter(([r, a]) => a === actId)
            .forEach(([r]) => allParticipants.add(r));
    });

    // Highlight
    highlightedNodes.add(organizerId);

    activities.forEach(actId => {
        highlightedNodes.add(actId);
        highlightedEdges.add(`${actId}-${organizerId}`);
    });

    allParticipants.forEach(resId => {
        highlightedNodes.add(resId);
        activities.forEach(actId => {
            if (R_PARTICIPATION.some(([r, a]) => r === resId && a === actId)) {
                highlightedEdges.add(`${resId}-${actId}`);
            }
        });
    });

    updateHighlights();

    // Display results
    const actNames = activities.map(a => nodePositions[a].data.name);
    const partNames = Array.from(allParticipants).map(r => nodePositions[r].data.name);

    displayResults({
        title: `组织者影响力: ${organizer.name}`,
        sections: [
            {
                label: '负责活动 (Activities)',
                items: actNames,
                formula: 'R<sub>activity</sub><sup>-1</sup>'
            },
            {
                label: '覆盖参与者 (All Participants)',
                items: partNames,
                formula: 'R<sub>activity</sub><sup>-1</sup> ∘ R<sub>participation</sub>'
            }
        ]
    });
}

function updateHighlights() {
    // Update nodes
    document.querySelectorAll('.entity-node').forEach(node => {
        const nodeId = node.id.replace('node-', '');
        if (highlightedNodes.has(nodeId)) {
            node.classList.add('highlighted');
        } else {
            node.classList.remove('highlighted');
        }
    });

    // Update edges
    document.querySelectorAll('.network-edge').forEach(edge => {
        const edgeId = edge.dataset.edgeId;
        if (highlightedEdges.has(edgeId)) {
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
    let html = `<div class="result-item"><h4>${data.title}</h4>`;

    data.sections.forEach(section => {
        html += `<p style="font-size:0.85rem; color:#7a7a7a; margin:8px 0 4px;">
                    ${section.label} 
                    <span class="result-badge">${section.formula}</span>
                 </p>`;
        html += '<ul class="result-list">';
        section.items.forEach(item => {
            html += `<li>${item}</li>`;
        });
        html += '</ul>';
    });

    html += '</div>';
    resultsContainer.innerHTML = html;
}

function showMessage(msg) {
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <span class="empty-icon">💡</span>
            <p>${msg}</p>
        </div>
    `;
}

// Event Listeners
clearBtn.addEventListener('click', () => {
    clearHighlights();
    showMessage('点击网络图中的节点开始查询');
});

window.addEventListener('resize', () => {
    calculateLayout();
    renderNetwork();
});

// Init
calculateLayout();
renderNetwork();
showMessage('点击网络图中的节点开始查询');
