/**
 * Compatibility & equivalence relation visualization.
 */

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

const SVG_NS = 'http://www.w3.org/2000/svg';
const NODE_RADIUS = 22;

const REGIONS = [
    { id: 'r1', name: '华北', color: '#ff7675' },
    { id: 'r2', name: '华东', color: '#74b9ff' },
    { id: 'r3', name: '西南', color: '#55efc4' },
    { id: 'r4', name: '西北', color: '#ffeaa7' }
];

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

let currentMode = 'compatibility';
let nodes = [];
let links = [];
let width = 760;
let height = 480;

function init() {
    setupResize();
    updateLegend();
    updateView();
}

function measureGraph() {
    const container = document.getElementById('graphContainer');
    const rect = container.getBoundingClientRect();
    width = Math.max(520, Math.round(rect.width || container.clientWidth || 760));
    height = Math.max(420, Math.round(rect.height || container.clientHeight || 480));
    graphSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    graphSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
}

function setupData() {
    measureGraph();
    nodes = DELEGATES.map(delegate => ({ ...delegate, x: 0, y: 0 }));
    layoutNodes();
}

function layoutNodes() {
    const padX = NODE_RADIUS + 34;
    const padY = NODE_RADIUS + 34;

    if (currentMode === 'compatibility') {
        const cx = width / 2;
        const cy = height / 2;
        const rx = Math.max(170, width * 0.36);
        const ry = Math.max(130, height * 0.32);

        nodes.forEach((node, index) => {
            const angle = -Math.PI / 2 + (Math.PI * 2 * index) / nodes.length;
            node.x = clamp(cx + Math.cos(angle) * rx, padX, width - padX);
            node.y = clamp(cy + Math.sin(angle) * ry, padY, height - padY);
        });
    } else {
        const clusters = [
            { region: 'r1', x: width * 0.28, y: height * 0.30 },
            { region: 'r2', x: width * 0.72, y: height * 0.30 },
            { region: 'r3', x: width * 0.30, y: height * 0.72 },
            { region: 'r4', x: width * 0.72, y: height * 0.72 }
        ];

        clusters.forEach(cluster => {
            const group = nodes.filter(node => node.region === cluster.region);
            group.forEach((node, index) => {
                const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(3, group.length);
                node.x = clamp(cluster.x + Math.cos(angle) * 54, padX, width - padX);
                node.y = clamp(cluster.y + Math.sin(angle) * 44, padY, height - padY);
            });
        });
    }
}

function updateRelations() {
    links = [];

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            const related = currentMode === 'compatibility'
                ? a.interests.some(interest => b.interests.includes(interest))
                : a.region === b.region;

            if (related) {
                links.push({ source: a, target: b });
            }
        }
    }

    statEdges.textContent = links.length;
    statComponents.textContent = countComponents();
}

function countComponents() {
    const visited = new Set();
    let components = 0;

    nodes.forEach(node => {
        if (visited.has(node.id)) return;
        components++;

        const queue = [node.id];
        visited.add(node.id);

        while (queue.length > 0) {
            const current = queue.shift();
            links.forEach(link => {
                const neighbor = link.source.id === current
                    ? link.target.id
                    : link.target.id === current ? link.source.id : null;

                if (neighbor && !visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            });
        }
    });

    return components;
}

function renderGraph() {
    graphSvg.innerHTML = '';

    links.forEach(link => {
        graphSvg.appendChild(createLink(link));
    });

    nodes.forEach(node => {
        graphSvg.appendChild(createNode(node));
    });
}

function createLink(link) {
    const line = document.createElementNS(SVG_NS, 'line');
    const points = edgeEndpoints(link.source, link.target);

    line.setAttribute('x1', points.start.x);
    line.setAttribute('y1', points.start.y);
    line.setAttribute('x2', points.end.x);
    line.setAttribute('y2', points.end.y);
    line.setAttribute('class', `link ${currentMode === 'compatibility' ? 'compat' : 'equiv'}`);
    line.setAttribute('stroke-width', currentMode === 'compatibility' ? 1.8 : 2.4);

    return line;
}

function createNode(node) {
    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('class', 'node-group');
    group.setAttribute('transform', `translate(${node.x}, ${node.y})`);
    group.addEventListener('mouseenter', event => showTooltip(event, node));
    group.addEventListener('mouseleave', hideTooltip);

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('r', NODE_RADIUS);
    circle.setAttribute('fill', getRegion(node.region).color);
    circle.setAttribute('class', 'node-circle');

    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('dy', 5);
    text.setAttribute('class', 'node-label');
    text.textContent = node.name.replace('代表', '');

    group.appendChild(circle);
    group.appendChild(text);
    return group;
}

function edgeEndpoints(source, target) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;

    return {
        start: {
            x: source.x + ux * (NODE_RADIUS + 2),
            y: source.y + uy * (NODE_RADIUS + 2)
        },
        end: {
            x: target.x - ux * (NODE_RADIUS + 2),
            y: target.y - uy * (NODE_RADIUS + 2)
        }
    };
}

function showTooltip(event, node) {
    const graphRect = document.getElementById('graphContainer').getBoundingClientRect();
    tooltip.style.left = `${Math.min(graphRect.width - 220, node.x + 24)}px`;
    tooltip.style.top = `${Math.max(8, node.y - 28)}px`;
    tooltip.style.opacity = 1;
    tooltip.innerHTML = `
        <h4>${node.name}</h4>
        <p><strong>地区:</strong> ${getRegion(node.region).name}</p>
        <p><strong>兴趣:</strong> ${node.interests.join('、')}</p>
    `;
}

function hideTooltip() {
    tooltip.style.opacity = 0;
}

function updateLegend() {
    legendBar.innerHTML = '';
    REGIONS.forEach(region => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background:${region.color}"></div>
            <span>${region.name}</span>
        `;
        legendBar.appendChild(item);
    });
}

function updateView() {
    setupData();
    updateRelations();

    if (currentMode === 'compatibility') {
        mainHeader.classList.remove('equiv-mode');
        btnCompat.classList.add('active');
        btnEquiv.classList.remove('active');
        graphTitle.textContent = '代表网络 (Delegate Network)';
        graphSub.textContent = '基于共同兴趣的广泛团结 (Unity based on shared interests)';
        propCard.classList.remove('equiv');
        propIcon.textContent = '◎';
        propTitle.textContent = '相容关系 (Compatibility)';
        propDesc.textContent = '只要存在共同兴趣即可建立联系，强调求同存异与开放协作。';
        propMath.textContent = 'x R y ⇔ Interest(x) ∩ Interest(y) ≠ ∅';
        transitiveCheck.classList.remove('satisfied');
        transitiveCheck.innerHTML = '<span class="check-icon">×</span> 传递性 (Transitive)';
        insightText.textContent = '相容关系允许不同背景的人围绕共同议题形成联系，体现开放、包容、协作的网络结构。';
    } else {
        mainHeader.classList.add('equiv-mode');
        btnCompat.classList.remove('active');
        btnEquiv.classList.add('active');
        graphTitle.textContent = '组织结构 (Organizational Structure)';
        graphSub.textContent = '基于地区的严格分组 (Strict organization based on region)';
        propCard.classList.add('equiv');
        propIcon.textContent = '≡';
        propTitle.textContent = '等价关系 (Equivalence)';
        propDesc.textContent = '以相同地区为标准进行分组，同组内互相关联，不同组之间界限清晰。';
        propMath.textContent = 'x R y ⇔ Region(x) = Region(y)';
        transitiveCheck.classList.add('satisfied');
        transitiveCheck.innerHTML = '<span class="check-icon">✓</span> 传递性 (Transitive)';
        insightText.textContent = '等价关系把集合划分为互不重叠的等价类，便于观察分类、归属与组织结构。';
    }

    renderGraph();
}

function setupResize() {
    window.addEventListener('resize', () => {
        updateView();
    });
}

function getRegion(id) {
    return REGIONS.find(region => region.id === id);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

btnCompat.addEventListener('click', () => {
    currentMode = 'compatibility';
    updateView();
});

btnEquiv.addEventListener('click', () => {
    currentMode = 'equivalence';
    updateView();
});

resetBtn.addEventListener('click', updateView);

init();
