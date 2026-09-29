/**
 * 3.1 笛卡尔积和二元关系 · 进阶层：东西部协作网络（二元关系 R ⊆ A×B）
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
const clearBtn = document.getElementById('clearBtn');
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
// 加载即给出一个示例关系：贵州同时与两地相关，说明关系允许「一对多 / 多对一」
const DEFAULT_RELATION = ['a1-b1', 'a2-b2', 'a3-b2'];
let relations = new Set(DEFAULT_RELATION); // Set of "aId-bId" strings
let showCartesian = false;

// Initialization
function init() {
    renderNodes();
    renderMatrix();
    renderLines(); // 连线在布局完成后生成，生成后再同步状态
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
    matrixContainer.style.gridTemplateColumns = `auto repeat(${SET_B.length}, 40px)`;
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
                // 为接近水平的线条添加垂直弯曲,使其可见
                const yDiff = Math.abs(y1 - y2);
                const isNearHorizontal = yDiff < 5;

                // 计算控制点
                const controlX1 = x1 + (x2 - x1) * 0.3;
                const controlX2 = x2 - (x2 - x1) * 0.3;

                // 对于接近水平的线,添加向下的弯曲
                const bendAmount = isNearHorizontal ? 30 : yDiff * 0.2;
                const controlY1 = y1 + bendAmount;
                const controlY2 = y2 + bendAmount;

                const d = `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`;

                line.setAttribute('d', d);
                line.setAttribute('class', 'relation-line hidden'); // Default hidden
                line.id = `line-${a.id}-${b.id}`;

                // 透明的宽描边作为点击热区（细线难以点中；未建立的关系线不可见时也能点）
                const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                hit.setAttribute('d', d);
                hit.setAttribute('class', 'relation-hit');
                hit.addEventListener('click', () => toggleRelation(a.id, b.id));
                hit.addEventListener('mouseenter', () => line.classList.add('hover'));
                hit.addEventListener('mouseleave', () => line.classList.remove('hover'));
                const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                tip.textContent = `(${a.name}, ${b.name})：点击建立 / 解除`;
                hit.appendChild(tip);

                graphSvg.appendChild(line);
                graphSvg.appendChild(hit);
            });
        });
        lastLayoutSig = layoutSignature();
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
                    line.setAttribute('marker-end', 'url(#arrowhead)');
                    line.setAttribute('stroke', 'url(#gradLine)');
                    line.setAttribute('stroke-width', '3');
                    line.setAttribute('opacity', '1');
                } else {
                    line.removeAttribute('marker-end');
                    line.setAttribute('stroke', '#a8775a');
                    line.setAttribute('stroke-width', '2');
                    if (showCartesian) {
                        line.setAttribute('class', 'relation-line faint');
                        line.setAttribute('opacity', '0.4');
                    } else {
                        line.setAttribute('class', 'relation-line hidden');
                        line.setAttribute('opacity', '0');
                    }
                }
            }
        });
    });
    renderStatus();
}

// 关系的集合写法与规模统计
function renderStatus() {
    const box = document.getElementById('relStatus');
    if (!box) return;
    const name = id => (SET_A.find(x => x.id === id) || SET_B.find(x => x.id === id)).name;
    const pairs = [];
    SET_A.forEach(a => SET_B.forEach(b => {
        if (relations.has(`${a.id}-${b.id}`)) pairs.push(`(${name(a.id)}, ${name(b.id)})`);
    }));
    const total = SET_A.length * SET_B.length;
    box.innerHTML = `<div class="rel-set">R = ${pairs.length ? '{ ' + pairs.join(', ') + ' }' : '∅（空关系）'}</div>`
        + `<div class="rel-stats"><span>|R| = <b>${pairs.length}</b></span>`
        + `<span>|A×B| = ${SET_A.length}×${SET_B.length} = <b>${total}</b></span>`
        + `<span>A 到 B 的关系共 2<sup>${total}</sup> = <b>${Math.pow(2, total)}</b> 个</span></div>`;
}

function updateInsight(aId, bId, added) {
    if (added) {
        const a = SET_A.find(i => i.id === aId);
        const b = SET_B.find(i => i.id === bId);
        insightTitle.textContent = "建立协作关系";
        insightText.textContent = `有序对 (${a.name}, ${b.name}) 已加入关系集合 R。这意味着 ${a.name} 将向 ${b.name} 提供资源或技术支持，体现了先富带后富的战略思想。`;
    } else {
        insightTitle.textContent = "关系解除";
        const a = SET_A.find(i => i.id === aId);
        const b = SET_B.find(i => i.id === bId);
        insightText.textContent = `有序对 (${a.name}, ${b.name}) 已从 R 中移除，但它仍在 A × B 之中——笛卡尔积不变，变的只是我们选出的子集。`;
    }
}

// Event Listeners
toggleProductBtn.addEventListener('click', () => {
    showCartesian = !showCartesian;
    toggleProductBtn.classList.toggle('active');
    updateUI();

    if (showCartesian) {
        insightTitle.textContent = "笛卡尔积 (A × B)";
        insightText.textContent = `虚线给出 A 与 B 之间全部 ${SET_A.length * SET_B.length} 个有序对，这是构建关系的「可能性空间」；实线是已选入 R 的有序对。`;
    } else {
        insightTitle.textContent = "当前关系 (R)";
        insightText.textContent = "仅显示已建立的协作关系（实线）。R 是 A × B 的子集。";
    }
});

resetBtn.addEventListener('click', () => {
    relations = new Set(DEFAULT_RELATION);
    updateUI();
    insightTitle.textContent = "恢复示例关系";
    insightText.textContent = "已恢复示例 R = {(上海, 云南), (浙江, 贵州), (广东, 贵州)}。贵州与两地都有关系——二元关系允许一对多、多对一。";
});

clearBtn.addEventListener('click', () => {
    relations.clear();
    updateUI();
    insightTitle.textContent = "空关系 ∅";
    insightText.textContent = "R = ∅ 也是 A × B 的子集，称为空关系。请点击连线或矩阵格子重新选出有序对。";
});

// 窗口尺寸变化时重算连线；只有布局真的变了才重绘
// （共享框架会在 DOM 变化后派发 resize，无条件重绘会形成「重绘→resize→重绘」循环，连线永远停在淡入起点而不可见）
let lastLayoutSig = '';
function layoutSignature() {
    const r = graphSvg.getBoundingClientRect();
    const ids = ['a1', 'a3', 'b1', 'b3'].map(id => {
        const n = document.getElementById(`node-${id}`);
        const q = n ? n.getBoundingClientRect() : { left: 0, top: 0 };
        return Math.round(q.left - r.left) + ',' + Math.round(q.top - r.top);
    });
    return Math.round(r.width) + 'x' + Math.round(r.height) + ':' + ids.join(';');
}
let resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const sig = layoutSignature();
        if (sig !== lastLayoutSig) renderLines();
    }, 120);
});

// Init
init();
