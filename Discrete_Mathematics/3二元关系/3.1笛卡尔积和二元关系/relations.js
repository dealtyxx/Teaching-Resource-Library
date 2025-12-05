/**
 * Red Mathematics - Binary Relations Visualizer
 */

// DOM Elements
const colA = document.getElementById('colA');
const colB = document.getElementById('colB');
const setAMembers = document.getElementById('setAMembers');
const setBMembers = document.getElementById('setBMembers');
const graphSvg = document.getElementById('graphSvg');
const matrixContainer = document.getElementById('matrixContainer');
const toggleProductBtn = document.getElementById('toggleProductBtn');
const resetBtn = document.getElementById('resetBtn');
const insightTitle = document.getElementById('insightTitle');
const insightText = document.getElementById('insightText');

// Data
const SET_A = [
    { id: 'a1', name: '上海', icon: '🏙️' },
    { id: 'a2', name: '浙江', icon: '🏭' },
    { id: 'a3', name: '广东', icon: '🏗️' }
];

const SET_B = [
    { id: 'b1', name: '云南', icon: '🏔️' },
    { id: 'b2', name: '贵州', icon: '⛰️' },
    { id: 'b3', name: '新疆', icon: '🍇' }
];

// State
let relations = new Set(); // Set of "aId-bId" strings
let showCartesian = false;

// Initialization
function init() {
    renderNodes();
    renderMatrix();
    renderLines(); // Initial lines (hidden or faint)
    updateUI();
}

// Rendering
function renderNodes() {
    // Render Set A (Left)
    colA.innerHTML = '';
    setAMembers.innerHTML = '';
    SET_A.forEach(item => {
        // Stage Node
        const node = document.createElement('div');
        node.className = 'node';
        node.id = `node-${item.id}`;
        node.innerHTML = `<span class="node-dot"></span><span>${item.name}</span><span class="node-icon">${item.icon}</span>`;
        colA.appendChild(node);

        // Sidebar Tag
        const tag = document.createElement('div');
        tag.className = 'member-tag';
        tag.textContent = `${item.id}: ${item.name}`;
        setAMembers.appendChild(tag);
    });

    // Render Set B (Right)
    colB.innerHTML = '';
    setBMembers.innerHTML = '';
    SET_B.forEach(item => {
        // Stage Node
        const node = document.createElement('div');
        node.className = 'node';
        node.id = `node-${item.id}`;
        node.innerHTML = `<span class="node-icon">${item.icon}</span><span>${item.name}</span><span class="node-dot"></span>`;
        colB.appendChild(node);

        // Sidebar Tag
        const tag = document.createElement('div');
        tag.className = 'member-tag';
        tag.textContent = `${item.id}: ${item.name}`;
        setBMembers.appendChild(tag);
    });
}

function renderMatrix() {
    // Grid template: Header row + A rows
    // Columns: Header col + B cols
    matrixContainer.style.gridTemplateColumns = `auto repeat(${SET_B.length}, 1fr)`;
    matrixContainer.innerHTML = '';

    // Top-Left Empty
    matrixContainer.appendChild(createMatrixHeader('R'));

    // Top Headers (Set B)
    SET_B.forEach(b => matrixContainer.appendChild(createMatrixHeader(b.id)));

    // Rows
    SET_A.forEach(a => {
        // Row Header (Set A)
        matrixContainer.appendChild(createMatrixHeader(a.id));

        // Cells
        SET_B.forEach(b => {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            cell.id = `cell-${a.id}-${b.id}`;
            cell.textContent = '0';
            cell.addEventListener('click', () => toggleRelation(a.id, b.id));
            matrixContainer.appendChild(cell);
        });
    });
}

function createMatrixHeader(text) {
    const el = document.createElement('div');
    el.className = 'matrix-header';
    el.textContent = text;
    return el;
}

function renderLines() {
    // We need to wait for layout to get positions
    // Use setTimeout to ensure DOM is rendered
    setTimeout(() => {
        // Clear existing lines (except defs)
        const defs = graphSvg.querySelector('defs');
        graphSvg.innerHTML = '';
        graphSvg.appendChild(defs);

        SET_A.forEach(a => {
            SET_B.forEach(b => {
                const nodeA = document.getElementById(`node-${a.id}`);
                const nodeB = document.getElementById(`node-${b.id}`);

                if (!nodeA || !nodeB) return;

                const rectA = nodeA.getBoundingClientRect();
                const rectB = nodeB.getBoundingClientRect();
                const svgRect = graphSvg.getBoundingClientRect();

                // Calculate coordinates relative to SVG
                // Start from right edge of A, End at left edge of B
                const x1 = rectA.right - svgRect.left;
                const y1 = rectA.top + rectA.height / 2 - svgRect.top;
                const x2 = rectB.left - svgRect.left;
                const y2 = rectB.top + rectB.height / 2 - svgRect.top;

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                // Bezier curve for smoother look
                const d = `M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`;

                line.setAttribute('d', d);
                line.setAttribute('class', 'relation-line hidden'); // Default hidden
                line.id = `line-${a.id}-${b.id}`;

                // Click handler
                line.addEventListener('click', () => toggleRelation(a.id, b.id));

                graphSvg.appendChild(line);
            });
        });
        updateUI(); // Apply initial state
    }, 100);
}

// Interaction
function toggleRelation(aId, bId) {
    const key = `${aId}-${bId}`;
    if (relations.has(key)) {
        relations.delete(key);
    } else {
        relations.add(key);
    }
    updateUI();
    updateInsight(aId, bId, relations.has(key));
}

function updateUI() {
    SET_A.forEach(a => {
        SET_B.forEach(b => {
            const key = `${a.id}-${b.id}`;
            const isActive = relations.has(key);

            // Update Matrix
            const cell = document.getElementById(`cell-${key}`);
            if (cell) {
                cell.className = isActive ? 'matrix-cell active' : 'matrix-cell';
                cell.textContent = isActive ? '1' : '0';
            }

            // Update Lines
            const line = document.getElementById(`line-${key}`);
            if (line) {
                if (isActive) {
                    line.setAttribute('class', 'relation-line active');
                } else if (showCartesian) {
                    line.setAttribute('class', 'relation-line faint');
                } else {
                    line.setAttribute('class', 'relation-line hidden');
                }
            }
        });
    });
}

function updateInsight(aId, bId, added) {
    if (added) {
        const a = SET_A.find(i => i.id === aId);
        const b = SET_B.find(i => i.id === bId);
        insightTitle.textContent = "建立协作关系 (Relation Established)";
        insightText.textContent = `有序对 (${a.name}, ${b.name}) 已加入关系集合 R。这意味着 ${a.name} 将向 ${b.name} 提供资源或技术支持，体现了先富带后富的战略思想。`;
    } else {
        insightTitle.textContent = "关系解除";
        insightText.textContent = "该协作关系已从集合 R 中移除。";
    }
}

// Event Listeners
toggleProductBtn.addEventListener('click', () => {
    showCartesian = !showCartesian;
    toggleProductBtn.classList.toggle('active');
    updateUI();

    if (showCartesian) {
        insightTitle.textContent = "笛卡尔积 (A × B)";
        insightText.textContent = "当前视图显示了 A 和 B 之间所有可能的 9 种配对 (虚线)。这是构建具体关系的'可能性空间'。";
    } else {
        insightTitle.textContent = "当前关系 (R)";
        insightText.textContent = "仅显示已建立的协作关系 (实线)。R 是 A × B 的子集。";
    }
});

resetBtn.addEventListener('click', () => {
    relations.clear();
    updateUI();
    insightTitle.textContent = "系统重置";
    insightText.textContent = "所有关系已清空。请重新规划协作路径。";
});

// Handle window resize
window.addEventListener('resize', () => {
    renderLines();
});

// Init
init();
