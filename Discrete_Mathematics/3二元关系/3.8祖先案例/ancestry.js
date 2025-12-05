/**
 * Red Mathematics - Family Ancestry Tracing System
 */

// DOM Elements
const resetBtn = document.getElementById('resetBtn');
const treeSvg = document.getElementById('treeSvg');
const nodesLayer = document.getElementById('nodesLayer');
const selectedMember = document.getElementById('selectedMember');
const queryButtons = document.getElementById('queryButtons');
const resultsContainer = document.getElementById('resultsContainer');

// Family Data (4 generations)
const FAMILY = [
    // Generation 1 (1920s - Revolutionary Era)
    { id: 'g1-1', name: '李建国', gen: 1, era: '1920s 抗战时期', story: '投身革命，为新中国奋斗终生', parents: [] },
    { id: 'g1-2', name: '王秀英', gen: 1, era: '1920s 抗战时期', story: '巾帼英雄，抗战时期地下工作者', parents: [] },

    // Generation 2 (1950s - Nation Building)
    { id: 'g2-1', name: '李卫东', gen: 2, era: '1950s 建国初期', story: '建国后投身工业建设，大国工匠', parents: ['g1-1', 'g1-2'] },
    { id: 'g2-2', name: '张春梅', gen: 2, era: '1950s 建国初期', story: '人民教师，培育新中国栋梁', parents: [] },

    // Generation 3 (1980s - Reform & Opening)
    { id: 'g3-1', name: '李明', gen: 3, era: '1980s 改革开放', story: '改革开放后下海经商，民营企业家', parents: ['g2-1', 'g2-2'] },
    { id: 'g3-2', name: '刘芳', gen: 3, era: '1980s 改革开放', story: '高校教授，科研工作者', parents: [] },

    // Generation 4 (2010s - New Era)
    { id: 'g4-1', name: '李思源', gen: 4, era: '2010s 新时代', story: '新时代青年，科技创业者', parents: ['g3-1', 'g3-2'] },
    { id: 'g4-2', name: '李思远', gen: 4, era: '2010s 新时代', story: '新时代青年，基层公务员', parents: ['g3-1', 'g3-2'] }
];

// Build relation map
const familyMap = {};
FAMILY.forEach(member => {
    familyMap[member.id] = member;
});

// State
let selectedMemberId = null;
let highlightedMembers = new Set();
let highlightedEdges = new Set();
let nodePositions = {};

// Layout
function calculateLayout() {
    const width = 700;
    const height = 600;
    const genCount = 4;
    const levelHeight = height / (genCount + 1);

    // Group by generation
    const generations = {};
    FAMILY.forEach(m => {
        if (!generations[m.gen]) generations[m.gen] = [];
        generations[m.gen].push(m);
    });

    // Position each generation
    Object.entries(generations).forEach(([gen, members]) => {
        const y = levelHeight * parseInt(gen);
        const memberWidth = width / (members.length + 1);

        members.forEach((member, idx) => {
            nodePositions[member.id] = {
                x: memberWidth * (idx + 1),
                y: y
            };
        });
    });
}

// Rendering
function renderTree() {
    renderNodes();
    renderEdges();
}

function renderNodes() {
    nodesLayer.innerHTML = '';

    FAMILY.forEach(member => {
        const pos = nodePositions[member.id];
        const node = document.createElement('div');
        node.className = `member-node gen${member.gen}`;
        node.id = `node-${member.id}`;

        node.innerHTML = `
            <div class="member-name">${member.name}</div>
            <div class="member-era">${member.era}</div>
        `;

        node.style.left = `${pos.x - 50}px`;
        node.style.top = `${pos.y - 30}px`;

        node.addEventListener('click', () => handleMemberClick(member.id));

        nodesLayer.appendChild(node);
    });
}

function renderEdges() {
    const defs = treeSvg.querySelector('defs');
    treeSvg.innerHTML = '';
    treeSvg.appendChild(defs);

    FAMILY.forEach(member => {
        member.parents.forEach(parentId => {
            const edge = createEdge(parentId, member.id);
            treeSvg.appendChild(edge);
        });
    });
}

function createEdge(fromId, toId) {
    const from = nodePositions[fromId];
    const to = nodePositions[toId];

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${from.x} ${from.y + 30} L ${to.x} ${to.y - 30}`;
    path.setAttribute('d', d);
    path.setAttribute('class', 'tree-edge');
    path.dataset.edgeId = `${fromId}-${toId}`;

    return path;
}

// Interaction
function handleMemberClick(memberId) {
    selectedMemberId = memberId;
    const member = familyMap[memberId];

    // Update selection display
    selectedMember.innerHTML = `
        <div class="member-card">
            <h4>${member.name}</h4>
            <div class="member-info">
                <p><strong>时代:</strong> ${member.era}</p>
                <p><strong>事迹:</strong> ${member.story}</p>
            </div>
        </div>
    `;

    queryButtons.style.display = 'flex';

    // Update visual state
    document.querySelectorAll('.member-node').forEach(node => {
        node.classList.remove('selected');
    });
    document.getElementById(`node-${memberId}`).classList.add('selected');

    // Clear previous highlights
    clearHighlights();
}

// Query Functions
function findDirectAncestors(memberId) {
    const member = familyMap[memberId];
    return member.parents.map(pid => familyMap[pid]);
}

function findAllAncestors(memberId) {
    // DFS traversal for transitive closure
    const visited = new Set();
    const ancestors = [];
    const path = []; // For DFS visualization

    function dfs(id) {
        if (visited.has(id)) return;
        visited.add(id);

        const member = familyMap[id];
        if (id !== memberId) {
            ancestors.push(member);
            path.push(id);
        }

        member.parents.forEach(parentId => {
            dfs(parentId);
        });
    }

    const member = familyMap[memberId];
    member.parents.forEach(parentId => dfs(parentId));

    return { ancestors, path };
}

function queryDirect() {
    const ancestors = findDirectAncestors(selectedMemberId);

    // Highlight
    highlightedMembers.clear();
    highlightedEdges.clear();

    ancestors.forEach(a => {
        highlightedMembers.add(a.id);
        highlightedEdges.add(`${a.id}-${selectedMemberId}`);
    });

    updateHighlights();
    displayResults(ancestors, '直接祖先 (Direct Ancestors)', 'R - 父母关系');
}

function queryAll() {
    const { ancestors, path } = findAllAncestors(selectedMemberId);

    // Highlight
    highlightedMembers.clear();
    highlightedEdges.clear();

    // Highlight all ancestors and their connections
    function highlightPath(memberId) {
        const member = familyMap[memberId];
        member.parents.forEach(parentId => {
            highlightedMembers.add(parentId);
            highlightedEdges.add(`${parentId}-${memberId}`);
            highlightPath(parentId);
        });
    }

    highlightPath(selectedMemberId);
    updateHighlights();
    displayResults(ancestors, '所有祖先 (All Ancestors)', 't(R) - 传递闭包 (DFS遍历)');
}

function updateHighlights() {
    // Nodes
    document.querySelectorAll('.member-node').forEach(node => {
        const id = node.id.replace('node-', '');
        if (highlightedMembers.has(id)) {
            node.classList.add('highlighted');
        } else {
            node.classList.remove('highlighted');
        }
    });

    // Edges
    document.querySelectorAll('.tree-edge').forEach(edge => {
        if (highlightedEdges.has(edge.dataset.edgeId)) {
            edge.classList.add('highlighted');
        } else {
            edge.classList.remove('highlighted');
        }
    });
}

function clearHighlights() {
    highlightedMembers.clear();
    highlightedEdges.clear();
    updateHighlights();
}

function displayResults(ancestors, title, formula) {
    if (ancestors.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📜</span>
                <p>该成员无${title}</p>
            </div>
        `;
        return;
    }

    let html = `<h4 style="margin-bottom:12px;">${title} <span style="font-size:0.75rem;color:#c5a059;">(${formula})</span></h4>`;
    html += '<ul class="ancestor-list">';

    ancestors.forEach(a => {
        html += `
            <li class="ancestor-item gen${a.gen}">
                <h5>${a.name}</h5>
                <p><strong>${a.era}</strong></p>
                <p>${a.story}</p>
            </li>
        `;
    });

    html += '</ul>';
    resultsContainer.innerHTML = html;
}

// Event Listeners
document.querySelectorAll('.query-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode === 'direct') queryDirect();
        else if (mode === 'all') queryAll();
    });
});

resetBtn.addEventListener('click', () => {
    selectedMemberId = null;
    clearHighlights();

    document.querySelectorAll('.member-node').forEach(node => {
        node.classList.remove('selected');
    });

    selectedMember.innerHTML = `
        <div class="empty-state">
            <span class="empty-icon">👤</span>
            <p>点击家族成员查看其祖先</p>
        </div>
    `;

    queryButtons.style.display = 'none';

    resultsContainer.innerHTML = `
        <div class="empty-state">
            <span class="empty-icon">📜</span>
            <p>开始追溯后，这里将显示祖先信息</p>
        </div>
    `;
});

window.addEventListener('resize', () => {
    calculateLayout();
    renderTree();
});

// Init
calculateLayout();
renderTree();
