/**
 * Formal Concept Analysis Visualizer
 * 智慧政务服务质量评价系统
 */

// DOM Elements
const matrixBody = document.getElementById('matrixBody');
const latticeSvg = document.getElementById('latticeSvg');
const edgesGroup = document.getElementById('edgesGroup');
const nodesGroup = document.getElementById('nodesGroup');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const statusText = document.getElementById('statusText');
const conceptCount = document.getElementById('conceptCount');
const insightText = document.getElementById('insightText');
const conceptDetails = document.getElementById('conceptDetails');

// Data Structure
const platforms = [
    { id: 'S1', name: '市民之窗' },
    { id: 'S2', name: '掌上办事' },
    { id: 'S3', name: '便民服务中心' },
    { id: 'S4', name: '网上政务大厅' },
    { id: 'S5', name: '社区服务站' }
];

const attributes = [
    { id: 'A1', name: '响应迅速', ideology: '效率优先' },
    { id: 'A2', name: '流程简便', ideology: '以人为本' },
    { id: 'A3', name: '数据安全', ideology: '责任担当' },
    { id: 'A4', name: '服务贴心', ideology: '人民至上' }
];

// Initial formal context (binary relation matrix)
let formalContext = [
    [1, 0, 1, 1],  // S1
    [1, 1, 0, 0],  // S2
    [0, 1, 1, 1],  // S3
    [1, 1, 1, 0],  // S4
    [0, 0, 1, 1]   // S5
];

const initialContext = JSON.parse(JSON.stringify(formalContext));

// State
let concepts = [];
let latticeStructure = [];

// Helper: Create SVG Element
function createSVGElement(type, attributes = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    return el;
}

// Initialize Matrix Display
function renderMatrix() {
    matrixBody.innerHTML = '';

    platforms.forEach((platform, i) => {
        const row = document.createElement('tr');

        // Platform name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = platform.name;
        row.appendChild(nameCell);

        // Attribute cells
        attributes.forEach((attr, j) => {
            const cell = document.createElement('td');
            cell.className = 'cell-interactive';
            cell.dataset.row = i;
            cell.dataset.col = j;

            const value = formalContext[i][j];
            cell.textContent = value ? '●' : '○';
            cell.classList.add(value ? 'filled' : 'empty');

            // Click to toggle
            cell.addEventListener('click', () => toggleCell(i, j));

            row.appendChild(cell);
        });

        matrixBody.appendChild(row);
    });
}

// Toggle matrix cell
function toggleCell(row, col) {
    formalContext[row][col] = formalContext[row][col] ? 0 : 1;
    renderMatrix();

    // Clear concepts when matrix changes
    concepts = [];
    latticeStructure = [];
    clearLattice();
    conceptCount.textContent = '0';
    statusText.textContent = '矩阵已更新，请重新生成概念格';
}

// FCA Core Algorithms

/**
 * Compute the intent of a set of objects
 * Intent(O) = {attributes shared by all objects in O}
 */
function computeIntent(objectSet) {
    if (objectSet.length === 0) return new Set(attributes.map((_, i) => i));

    const intent = new Set();

    for (let attrIdx = 0; attrIdx < attributes.length; attrIdx++) {
        let allHave = true;
        for (const objIdx of objectSet) {
            if (!formalContext[objIdx][attrIdx]) {
                allHave = false;
                break;
            }
        }
        if (allHave) {
            intent.add(attrIdx);
        }
    }

    return intent;
}

/**
 * Compute the extent of a set of attributes
 * Extent(A) = {objects that have all attributes in A}
 */
function computeExtent(attrSet) {
    if (attrSet.size === 0) return new Set(platforms.map((_, i) => i));

    const extent = new Set();

    for (let objIdx = 0; objIdx < platforms.length; objIdx++) {
        let hasAll = true;
        for (const attrIdx of attrSet) {
            if (!formalContext[objIdx][attrIdx]) {
                hasAll = false;
                break;
            }
        }
        if (hasAll) {
            extent.add(objIdx);
        }
    }

    return extent;
}

/**
 * Generate all formal concepts using closure operator
 */
function generateConcepts() {
    concepts = [];
    const processedExtents = new Set();

    // Start with all possible object subsets
    const numObjects = platforms.length;
    const totalSubsets = Math.pow(2, numObjects);

    for (let i = 0; i < totalSubsets; i++) {
        const objectSet = [];
        for (let j = 0; j < numObjects; j++) {
            if (i & (1 << j)) {
                objectSet.push(j);
            }
        }

        // Compute intent of this object set
        const intent = computeIntent(objectSet);

        // Compute extent of this intent (closure)
        const extent = computeExtent(intent);

        // Create unique key for extent
        const extentKey = Array.from(extent).sort().join(',');

        // If this extent hasn't been processed, it's a formal concept
        if (!processedExtents.has(extentKey)) {
            processedExtents.add(extentKey);

            concepts.push({
                extent: Array.from(extent).sort(),
                intent: Array.from(intent).sort(),
                id: concepts.length
            });
        }
    }

    return concepts;
}

/**
 * Build lattice structure (partial order)
 */
function buildLattice() {
    latticeStructure = concepts.map(concept => ({
        ...concept,
        parents: [],
        children: [],
        level: 0
    }));

    // Determine partial order: C1 <= C2 iff Extent(C1) ⊆ Extent(C2)
    for (let i = 0; i < latticeStructure.length; i++) {
        for (let j = 0; j < latticeStructure.length; j++) {
            if (i === j) continue;

            const c1 = latticeStructure[i];
            const c2 = latticeStructure[j];

            // Check if c1.extent ⊆ c2.extent
            const isSubset = c1.extent.every(obj => c2.extent.includes(obj));

            if (isSubset && c1.extent.length < c2.extent.length) {
                // c1 < c2, check if it's a direct subordinate
                let isDirect = true;
                for (let k = 0; k < latticeStructure.length; k++) {
                    if (k === i || k === j) continue;
                    const c3 = latticeStructure[k];

                    const c1SubsetC3 = c1.extent.every(obj => c3.extent.includes(obj));
                    const c3SubsetC2 = c3.extent.every(obj => c2.extent.includes(obj));

                    if (c1SubsetC3 && c3SubsetC2 &&
                        c1.extent.length < c3.extent.length &&
                        c3.extent.length < c2.extent.length) {
                        isDirect = false;
                        break;
                    }
                }

                if (isDirect) {
                    c2.children.push(i);
                    c1.parents.push(j);
                }
            }
        }
    }

    // Assign levels for layout
    assignLevels();
}

/**
 * Assign levels to concepts for hierarchical layout
 * Bottom-up approach: objects with larger extents at bottom
 */
function assignLevels() {
    // Reset all levels
    latticeStructure.forEach(concept => {
        concept.level = -1;
    });

    // Assign levels based on extent size (larger extent = lower level)
    // This creates a proper hierarchical structure
    latticeStructure.forEach(concept => {
        concept.level = platforms.length - concept.extent.length;
    });

    // Verify and adjust based on parent-child relationships
    let changed = true;
    let iterations = 0;
    const maxIterations = 100;

    while (changed && iterations < maxIterations) {
        changed = false;
        iterations++;

        latticeStructure.forEach((concept, idx) => {
            // Ensure all children are at lower levels (larger level number = higher in diagram)
            concept.children.forEach(childIdx => {
                const child = latticeStructure[childIdx];
                if (child.level >= concept.level) {
                    child.level = concept.level - 1;
                    changed = true;
                }
            });

            // Ensure all parents are at higher levels
            concept.parents.forEach(parentIdx => {
                const parent = latticeStructure[parentIdx];
                if (parent.level <= concept.level) {
                    parent.level = concept.level + 1;
                    changed = true;
                }
            });
        });
    }

    // Normalize levels to start from 0
    let minLevel = Infinity;
    latticeStructure.forEach(concept => {
        minLevel = Math.min(minLevel, concept.level);
    });

    if (minLevel !== 0) {
        latticeStructure.forEach(concept => {
            concept.level -= minLevel;
        });
    }
}

/**
 * Render concept lattice as hierarchical graph
 */
function renderLattice() {
    clearLattice();

    if (concepts.length === 0) return;

    const width = latticeSvg.clientWidth || 600;
    const height = latticeSvg.clientHeight || 500;
    const nodeRadius = 25;
    const padding = 60; // Padding from edges

    // Group concepts by level
    const levelGroups = {};
    let maxLevel = 0;

    latticeStructure.forEach(concept => {
        const level = concept.level;
        if (!levelGroups[level]) levelGroups[level] = [];
        levelGroups[level].push(concept);
        maxLevel = Math.max(maxLevel, level);
    });

    // Calculate positions with better spacing
    const usableHeight = height - 2 * padding;
    const levelHeight = usableHeight / (maxLevel + 1);
    const positions = {};

    Object.keys(levelGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(level => {
        const conceptsAtLevel = levelGroups[level];
        const usableWidth = width - 2 * padding;
        const spacing = usableWidth / (conceptsAtLevel.length + 1);

        conceptsAtLevel.forEach((concept, idx) => {
            positions[concept.id] = {
                x: padding + spacing * (idx + 1),
                y: padding + (maxLevel - parseInt(level)) * levelHeight
            };
        });
    });

    // Draw edges first
    latticeStructure.forEach(concept => {
        const pos1 = positions[concept.id];
        if (!pos1) return;

        concept.parents.forEach(parentIdx => {
            const pos2 = positions[parentIdx];
            if (!pos2) return;

            const line = createSVGElement('line', {
                x1: pos1.x,
                y1: pos1.y,
                x2: pos2.x,
                y2: pos2.y,
                class: 'lattice-edge',
                'marker-end': 'url(#arrowhead)'
            });

            edgesGroup.appendChild(line);
        });
    });

    // Draw nodes
    latticeStructure.forEach(concept => {
        const pos = positions[concept.id];
        if (!pos) return;

        const g = createSVGElement('g', {
            class: 'concept-node',
            transform: `translate(${pos.x}, ${pos.y})`,
            'data-id': concept.id
        });

        const circle = createSVGElement('circle', {
            r: nodeRadius,
            class: 'concept-circle'
        });

        const text = createSVGElement('text', {
            class: 'concept-text',
            'text-anchor': 'middle',
            dy: '0.3em'
        });
        text.textContent = `C${concept.id}`;

        g.appendChild(circle);
        g.appendChild(text);

        // Add hover effects
        g.addEventListener('mouseenter', () => showConceptDetails(concept));
        g.addEventListener('mouseleave', () => hideConceptDetails());

        nodesGroup.appendChild(g);
    });
}

/**
 * Show concept details on hover
 */
function showConceptDetails(concept) {
    const extentNames = concept.extent.map(i => platforms[i].name).join(', ');
    const intentNames = concept.intent.map(i => attributes[i].name).join(', ');

    let html = `<div class="detail-title">概念 C${concept.id}</div>`;
    html += `<div class="detail-content">`;
    html += `<div class="detail-section"><strong>对象集合：</strong>${extentNames || '∅'}</div>`;
    html += `<div class="detail-section"><strong>属性集合：</strong>${intentNames || '∅'}</div>`;
    html += `</div>`;

    conceptDetails.innerHTML = html;

    // Highlight node
    const node = nodesGroup.querySelector(`[data-id="${concept.id}"]`);
    if (node) node.classList.add('highlighted');
}

/**
 * Hide concept details
 */
function hideConceptDetails() {
    conceptDetails.innerHTML = '<p class="hint-text">悬停在概念节点上查看详情</p>';

    nodesGroup.querySelectorAll('.concept-node').forEach(node => {
        node.classList.remove('highlighted');
    });
}

/**
 * Clear lattice visualization
 */
function clearLattice() {
    edgesGroup.innerHTML = '';
    nodesGroup.innerHTML = '';
}

/**
 * Generate insights based on concepts
 */
function generateInsights() {
    if (concepts.length === 0) {
        insightText.textContent = '点击"生成概念格"开始分析';
        return;
    }

    // Find concepts with most attributes (high quality)
    let bestConcept = null;
    let maxAttrs = 0;

    concepts.forEach(concept => {
        if (concept.extent.length > 0 && concept.intent.length > maxAttrs) {
            maxAttrs = concept.intent.length;
            bestConcept = concept;
        }
    });

    let insight = '<strong>数据洞察：</strong><br>';

    if (bestConcept && maxAttrs > 0) {
        const platformNames = bestConcept.extent.map(i => platforms[i].name);
        const attrNames = bestConcept.intent.map(i => attributes[i].name);

        insight += `• <strong>${platformNames.join('、')}</strong>在<strong>${attrNames.join('、')}</strong>方面表现优秀<br>`;
        insight += `• 建议将优秀经验推广至其他平台<br>`;
    }

    // Find improvement areas
    const allAttrs = new Set(attributes.map((_, i) => i));
    concepts.forEach(concept => {
        if (concept.extent.length === platforms.length) {
            concept.intent.forEach(attr => allAttrs.delete(attr));
        }
    });

    if (allAttrs.size > 0) {
        const improvementAttrs = Array.from(allAttrs).map(i => attributes[i].name);
        insight += `• <strong>改进方向：</strong>${improvementAttrs.join('、')}需要整体提升`;
    }

    insightText.innerHTML = insight;
}

/**
 * Main: Generate concept lattice
 */
function generateConceptLattice() {
    statusText.textContent = '正在生成形式概念...';
    generateBtn.disabled = true;

    setTimeout(() => {
        // Generate concepts
        generateConcepts();
        conceptCount.textContent = concepts.length;

        statusText.textContent = '正在构建概念格结构...';

        setTimeout(() => {
            // Build lattice
            buildLattice();

            // Render
            renderLattice();

            // Generate insights
            generateInsights();

            statusText.textContent = `分析完成！共生成 ${concepts.length} 个形式概念`;
            generateBtn.disabled = false;
        }, 300);
    }, 200);
}

/**
 * Reset to initial state
 */
function resetData() {
    formalContext = JSON.parse(JSON.stringify(initialContext));
    renderMatrix();

    concepts = [];
    latticeStructure = [];
    clearLattice();

    conceptCount.textContent = '0';
    statusText.textContent = '数据已重置';
    insightText.textContent = '点击"生成概念格"开始分析';
    conceptDetails.innerHTML = '<p class="hint-text">悬停在概念节点上查看详情</p>';
}

// Event Listeners
generateBtn.addEventListener('click', generateConceptLattice);
resetBtn.addEventListener('click', resetData);

window.addEventListener('resize', () => {
    if (concepts.length > 0) {
        renderLattice();
    }
});

// Initialize
renderMatrix();
statusText.textContent = '准备就绪';
