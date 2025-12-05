/**
 * Red Mathematics - Compatibility & Equivalence Visualization
 */

// DOM Elements
const btnCompat = document.getElementById('btnCompat');
const btnEquiv = document.getElementById('btnEquiv');
const resetBtn = document.getElementById('resetBtn');
const graphSvg = document.getElementById('graphSvg');
const tooltip = document.getElementById('tooltip');
const legendBar = document.getElementById('legendBar');
const graphTitle = document.getElementById('graphTitle');
const graphSub = document.getElementById('graphSub');
const propCard = document.getElementById('propCard');
const propTitle = document.getElementById('propTitle');
const propDesc = document.getElementById('propDesc');
const propMath = document.getElementById('propMath');
const propIcon = document.getElementById('propIcon');
const transitiveCheck = document.getElementById('transitiveCheck');
const insightText = document.getElementById('insightText');
const statComponents = document.getElementById('statComponents');
const statEdges = document.getElementById('statEdges');
const mainHeader = document.querySelector('.main-header h1');

// Data: Delegates
const REGIONS = [
    { id: 'r1', name: '华北', color: '#ff7675' }, // Red
    { id: 'r2', name: '华东', color: '#74b9ff' }, // Blue
    { id: 'r3', name: '西南', color: '#55efc4' }, // Green
    { id: 'r4', name: '西北', color: '#ffeaa7' }  // Yellow
];

const INTERESTS = ['经济', '文化', '科技', '教育', '环保', '医疗'];

const DELEGATES = [
    { id: 1, name: '代表A', region: 'r1', interests: ['经济', '科技'] },
    { id: 2, name: '代表B', region: 'r1', interests: ['文化', '教育'] },
    { id: 3, name: '代表C', region: 'r2', interests: ['科技', '环保'] },
    { id: 4, name: '代表D', region: 'r2', interests: ['经济', '医疗'] },
    { id: 5, name: '代表E', region: 'r3', interests: ['环保', '文化'] },
    { id: 6, name: '代表F', region: 'r3', interests: ['教育', '医疗'] },
    { id: 7, name: '代表G', region: 'r4', interests: ['科技', '经济'] },
    { id: 8, name: '代表H', region: 'r4', interests: ['文化', '环保'] },
    { id: 9, name: '代表I', region: 'r1', interests: ['医疗', '科技'] },
    { id: 10, name: '代表J', region: 'r2', interests: ['教育', '经济'] }
];

// State
let currentMode = 'compatibility'; // 'compatibility' or 'equivalence'
let nodes = [];
let links = [];
let simulation = null;
let width, height;

// Initialization
function init() {
    setupResize();
    setupData();
    updateLegend();
    startSimulation();
    updateView();
}

function setupData() {
    // Initialize nodes with random positions
    width = document.getElementById('graphContainer').clientWidth;
    height = document.getElementById('graphContainer').clientHeight;

    nodes = DELEGATES.map(d => ({
        ...d,
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0
    }));
}

function updateRelations() {
    links = [];

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            let isRelated = false;

            if (currentMode === 'compatibility') {
                // Compatibility: Share ANY interest
                const common = a.interests.filter(int => b.interests.includes(int));
                if (common.length > 0) isRelated = true;
            } else {
                // Equivalence: Same Region
                if (a.region === b.region) isRelated = true;
            }

            if (isRelated) {
                links.push({ source: a, target: b });
            }
        }
    }

    // Update Stats
    statEdges.textContent = links.length;

    // Count Components (BFS)
    let visited = new Set();
    let components = 0;

    nodes.forEach(node => {
        if (!visited.has(node.id)) {
            components++;
            let queue = [node.id];
            visited.add(node.id);
            while (queue.length > 0) {
                let curr = queue.shift();
                links.forEach(l => {
                    let neighbor = null;
                    if (l.source.id === curr) neighbor = l.target.id;
                    if (l.target.id === curr) neighbor = l.source.id;

                    if (neighbor && !visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                });
            }
        }
    });
    statComponents.textContent = components;
}

// Force Simulation (Simple Custom Implementation)
function startSimulation() {
    if (simulation) cancelAnimationFrame(simulation);

    function step() {
        // 1. Repulsion
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = 5000 / (dist * dist); // Repulsion strength

                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                nodes[i].vx += fx;
                nodes[i].vy += fy;
                nodes[j].vx -= fx;
                nodes[j].vy -= fy;
            }
        }

        // 2. Attraction (Springs)
        links.forEach(link => {
            const dx = link.target.x - link.source.x;
            const dy = link.target.y - link.source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const targetDist = currentMode === 'compatibility' ? 120 : 80; // Tighter for equivalence
            const force = (dist - targetDist) * 0.05;

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            link.source.vx += fx;
            link.source.vy += fy;
            link.target.vx -= fx;
            link.target.vy -= fy;
        });

        // 3. Center Gravity
        nodes.forEach(node => {
            node.vx += (width / 2 - node.x) * 0.01;
            node.vy += (height / 2 - node.y) * 0.01;

            // Damping
            node.vx *= 0.9;
            node.vy *= 0.9;

            // Update Position
            node.x += node.vx;
            node.y += node.vy;

            // Bounds
            node.x = Math.max(20, Math.min(width - 20, node.x));
            node.y = Math.max(20, Math.min(height - 20, node.y));
        });

        renderGraph();
        simulation = requestAnimationFrame(step);
    }

    step();
}

// Rendering
function renderGraph() {
    // Clear SVG
    while (graphSvg.firstChild) {
        graphSvg.removeChild(graphSvg.firstChild);
    }

    // Draw Links
    links.forEach(link => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', link.source.x);
        line.setAttribute('y1', link.source.y);
        line.setAttribute('x2', link.target.x);
        line.setAttribute('y2', link.target.y);
        line.setAttribute('class', `link ${currentMode === 'compatibility' ? 'compat' : 'equiv'}`);
        line.setAttribute('stroke-width', currentMode === 'compatibility' ? 1 : 2);
        graphSvg.appendChild(line);
    });

    // Draw Nodes
    nodes.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        g.style.cursor = 'pointer';

        // Circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', 20);
        const region = REGIONS.find(r => r.id === node.region);
        circle.setAttribute('fill', region.color);
        circle.setAttribute('class', 'node-circle');

        // Label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('dy', 5);
        text.setAttribute('class', 'node-label');
        text.textContent = node.name.replace('代表', '');

        // Events
        g.addEventListener('mouseenter', (e) => showTooltip(e, node));
        g.addEventListener('mouseleave', hideTooltip);

        g.appendChild(circle);
        g.appendChild(text);
        graphSvg.appendChild(g);
    });
}

function showTooltip(e, node) {
    const rect = graphSvg.getBoundingClientRect();
    tooltip.style.left = `${node.x + rect.left + 20}px`;
    tooltip.style.top = `${node.y + rect.top - 20}px`;
    tooltip.style.opacity = 1;

    const regionName = REGIONS.find(r => r.id === node.region).name;

    tooltip.innerHTML = `
        <h4>${node.name}</h4>
        <p><strong>地区:</strong> ${regionName}</p>
        <p><strong>兴趣:</strong> ${node.interests.join(', ')}</p>
    `;
}

function hideTooltip() {
    tooltip.style.opacity = 0;
}

function updateLegend() {
    legendBar.innerHTML = '';
    REGIONS.forEach(r => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background:${r.color}"></div>
            <span>${r.name}</span>
        `;
        legendBar.appendChild(item);
    });
}

function updateView() {
    updateRelations();

    // Update UI Text based on mode
    if (currentMode === 'compatibility') {
        // Header
        mainHeader.classList.remove('equiv-mode');
        btnCompat.classList.add('active');
        btnEquiv.classList.remove('active');

        // Graph Titles
        graphTitle.textContent = '代表网络 (Delegate Network)';
        graphSub.textContent = '基于共同兴趣的广泛团结 (Unity based on shared interests)';

        // Property Card
        propCard.classList.remove('equiv');
        propIcon.textContent = '🌟';
        propTitle.textContent = '相容关系 (Compatibility)';
        propDesc.textContent = '只要有共同点即可建立联系。这是一种"求同存异"的广泛团结，允许差异存在，强调包容性。';
        propMath.textContent = 'x R y ⇔ x ∩ y ≠ ∅';

        // Check List
        transitiveCheck.classList.remove('satisfied');
        transitiveCheck.innerHTML = '<span class="check-icon">✗</span> 传递性 (Transitive)';

        // Insight
        insightText.textContent = '在统一战线工作中，我们强调"大团结、大联合"。相容关系象征着不同背景的人们因为共同的爱国热情和奋斗目标走到一起，形成最广泛的同心圆。';

    } else {
        // Header
        mainHeader.classList.add('equiv-mode');
        btnCompat.classList.remove('active');
        btnEquiv.classList.add('active');

        // Graph Titles
        graphTitle.textContent = '组织结构 (Organizational Structure)';
        graphSub.textContent = '基于地区的严密组织 (Strict organization based on region)';

        // Property Card
        propCard.classList.add('equiv');
        propIcon.textContent = '⚖️';
        propTitle.textContent = '等价关系 (Equivalence)';
        propDesc.textContent = '严格的分类标准。同类元素之间完全互通，不同类之间界限分明。这是组织划分、行政管理的基础。';
        propMath.textContent = 'x R y ⇔ Region(x) = Region(y)';

        // Check List
        transitiveCheck.classList.add('satisfied');
        transitiveCheck.innerHTML = '<span class="check-icon">✓</span> 传递性 (Transitive)';

        // Insight
        insightText.textContent = '等价关系体现了"物以类聚，人以群分"的秩序感。在国家治理中，行政区划、行业分类等都体现了等价关系的应用，确保了管理的规范有序。';
    }
}

function setupResize() {
    window.addEventListener('resize', () => {
        width = document.getElementById('graphContainer').clientWidth;
        height = document.getElementById('graphContainer').clientHeight;
    });
}

// Event Listeners
btnCompat.addEventListener('click', () => {
    currentMode = 'compatibility';
    updateView();
});

btnEquiv.addEventListener('click', () => {
    currentMode = 'equivalence';
    updateView();
});

resetBtn.addEventListener('click', () => {
    setupData(); // Reshuffle positions
    updateView();
});

// Start
init();
