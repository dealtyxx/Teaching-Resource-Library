/**
 * Social Network Community Detection Visualization
 * 社区和谐与精准帮扶 - 基于等价关系的社会网络分析
 */

const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');

// Graph State
let nodes = [];
let edges = [];
let communities = [];
let isAnalyzed = false;

// Physics
const REPULSION = 2000;
const SPRING_LENGTH = 80;
const SPRING_K = 0.08;
const DAMPING = 0.85;
const CENTER_GRAVITY = 0.003;

// Interaction
let dragging = null;
let hovering = null;
let connecting = null;
let mouseX = 0, mouseY = 0;

// Colors
const COLORS = ['#00b894', '#0984e3', '#fd79a8', '#6c5ce7', '#fdcb6e', '#e17055', '#00cec9', '#74b9ff'];

// Init
function init() {
    setupCanvas();
    createSampleNetwork();
    setupEvents();
    animate();
}

function setupCanvas() {
    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);
}

function createSampleNetwork() {
    // Community 1: Urban
    const urban = createCluster(200, 150, 6, '城区');
    // Community 2: Rural
    const rural = createCluster(500, 180, 5, '乡村');
    // Community 3: Factory
    const factory = createCluster(350, 400, 7, '工业区');

    // Isolated individuals
    addNode(100, 450, '独居老人');
    addNode(650, 400, '留守儿童');

    updateStats();
}

function createCluster(cx, cy, count, label) {
    const start = nodes.length;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const r = 40 + Math.random() * 30;
        addNode(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, label);
    }

    // Connect within cluster
    for (let i = start; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (Math.random() > 0.5) {
                edges.push({ from: i, to: j });
            }
        }
    }

    return { start, end: nodes.length - 1 };
}

function addNode(x, y, label = '居民') {
    nodes.push({
        x, y, vx: 0, vy: 0,
        id: nodes.length,
        label,
        community: -1
    });
}

// Physics Simulation
function updatePhysics() {
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dSq = dx * dx + dy * dy;
            if (dSq > 1) {
                const dist = Math.sqrt(dSq);
                const force = REPULSION / dSq;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                nodes[i].vx += fx;
                nodes[i].vy += fy;
                nodes[j].vx -= fx;
                nodes[j].vy -= fy;
            }
        }
    }

    // Spring forces
    edges.forEach(e => {
        const a = nodes[e.from];
        const b = nodes[e.to];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            const force = (dist - SPRING_LENGTH) * SPRING_K;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            a.vx += fx;
            a.vy += fy;
            b.vx -= fx;
            b.vy -= fy;
        }
    });

    // Update positions
    nodes.forEach(n => {
        if (n === dragging) return;

        // Gravity to center
        n.vx += (canvas.width / 2 - n.x) * CENTER_GRAVITY;
        n.vy += (canvas.height / 2 - n.y) * CENTER_GRAVITY;

        // Apply velocity
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x += n.vx;
        n.y += n.vy;

        // Boundaries
        const margin = 30;
        n.x = Math.max(margin, Math.min(canvas.width - margin, n.x));
        n.y = Math.max(margin, Math.min(canvas.height - margin, n.y));
    });
}

// Rendering
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Edges
    ctx.lineWidth = 2;
    edges.forEach(e => {
        const a = nodes[e.from];
        const b = nodes[e.to];

        if (isAnalyzed && a.community === b.community && a.community !== -1) {
            ctx.strokeStyle = COLORS[a.community % COLORS.length];
            ctx.globalAlpha = 0.6;
        } else {
            ctx.strokeStyle = '#dfe6e9';
            ctx.globalAlpha = 0.3;
        }

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Connection line
    if (connecting) {
        ctx.strokeStyle = '#636e72';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(connecting.x, connecting.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Nodes
    nodes.forEach(n => {
        let color = '#ffffff';
        if (isAnalyzed && n.community !== -1) {
            color = COLORS[n.community % COLORS.length];
        }

        // Shadow
        ctx.shadowBlur = n === hovering ? 15 : 8;
        ctx.shadowColor = 'rgba(0,0,0,0.2)';

        // Circle
        ctx.fillStyle = color;
        ctx.strokeStyle = n === hovering || n === dragging ? '#2d3436' : '#636e72';
        ctx.lineWidth = n === hovering ? 3 : 2;

        ctx.beginPath();
        ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Icon
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👤', n.x, n.y);
    });
}

function animate() {
    updatePhysics();
    draw();
    requestAnimationFrame(animate);
}

// Community Detection (BFS)
function analyzeCommunities() {
    communities = [];
    const visited = new Set();
    nodes.forEach(n => n.community = -1);

    for (let i = 0; i < nodes.length; i++) {
        if (!visited.has(i)) {
            const component = [];
            const queue = [i];
            visited.add(i);

            while (queue.length > 0) {
                const curr = queue.shift();
                component.push(curr);
                nodes[curr].community = communities.length;

                // Find neighbors
                edges.forEach(e => {
                    let neighbor = -1;
                    if (e.from === curr && !visited.has(e.to)) {
                        neighbor = e.to;
                    } else if (e.to === curr && !visited.has(e.from)) {
                        neighbor = e.from;
                    }

                    if (neighbor !== -1) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                });
            }
            communities.push(component);
        }
    }

    isAnalyzed = true;
    document.getElementById('distributeBtn').disabled = false;
    updateCommunityDisplay();
}

function distributeResources() {
    if (!isAnalyzed) return;

    // Animate resource distribution
    communities.forEach((comm, idx) => {
        setTimeout(() => {
            // Flash community
            const color = COLORS[idx % COLORS.length];
            comm.forEach(nodeIdx => {
                const n = nodes[nodeIdx];
                setTimeout(() => {
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, 30, 0, Math.PI * 2);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 4;
                    ctx.stroke();
                }, Math.random() * 300);
            });
        }, idx * 500);
    });

    setTimeout(() => {
        alert(`精准服务完成！向 ${communities.length} 个社区网格分配了教育、医疗等资源。`);
    }, communities.length * 500 + 500);
}

function connectIsolated() {
    if (!isAnalyzed) {
        alert('请先进行网格摸排分析！');
        return;
    }

    const isolated = communities.filter(c => c.length === 1).map(c => c[0]);
    if (isolated.length === 0) {
        alert('暂无孤岛节点！');
        return;
    }

    // Connect first isolated to largest community
    const largest = communities.reduce((max, c) => c.length > max.length ? c : max, []);
    const target = largest[Math.floor(Math.random() * largest.length)];

    edges.push({ from: isolated[0], to: target });
    analyzeCommunities();
    alert('成功建立融合纽带！孤岛居民已融入社区大家庭。');
}

function updateCommunityDisplay() {
    const isolated = communities.filter(c => c.length === 1).length;

    document.getElementById('communityCount').textContent = communities.length;
    document.getElementById('isolatedCount').textContent = isolated;
    document.getElementById('isolatedStats').style.display = isolated > 0 ? 'flex' : 'none';

    // Legend
    const legend = document.getElementById('legendBox');
    const items = document.getElementById('legendItems');
    items.innerHTML = '';

    communities.forEach((comm, idx) => {
        const div = document.createElement('div');
        div.className = 'legend-item';
        div.innerHTML = `
            <div class="legend-color" style="background: ${COLORS[idx % COLORS.length]}"></div>
            <span>网格 ${idx + 1} (${comm.length}人)</span>
        `;
        items.appendChild(div);
    });

    legend.style.display = 'block';

    // Community list
    const list = document.getElementById('communityList');
    list.innerHTML = '';
    communities.forEach((comm, idx) => {
        const div = document.createElement('div');
        div.className = 'community-item';
        div.style.borderLeftColor = COLORS[idx % COLORS.length];
        div.innerHTML = `
            <strong>社区网格 ${idx + 1}</strong>
            <span>${comm.length} 位居民${comm.length === 1 ? ' (需关注)' : ''}</span>
        `;
        list.appendChild(div);
    });
    document.getElementById('communityPanel').style.display = 'block';
}

// Event Handlers
function setupEvents() {
    canvas.addEventListener('mousedown', e => {
        const { x, y } = getPos(e);
        const node = findNode(x, y);

        if (node) {
            if (e.shiftKey) {
                connecting = node;
            } else {
                dragging = node;
            }
        } else {
            addNode(x, y);
            updateStats();
        }
    });

    canvas.addEventListener('mousemove', e => {
        const { x, y } = getPos(e);
        mouseX = x;
        mouseY = y;
        hovering = findNode(x, y);

        if (dragging) {
            dragging.x = x;
            dragging.y = y;
            dragging.vx = 0;
            dragging.vy = 0;
        }
    });

    canvas.addEventListener('mouseup', e => {
        if (connecting) {
            const target = findNode(mouseX, mouseY);
            if (target && target !== connecting) {
                edges.push({ from: connecting.id, to: target.id });
                updateStats();
                if (isAnalyzed) analyzeCommunities();
            }
            connecting = null;
        }
        dragging = null;
    });

    canvas.addEventListener('contextmenu', e => {
        e.preventDefault();
        const node = findNode(getPos(e).x, getPos(e).y);
        if (node) {
            const idx = node.id;
            nodes.splice(idx, 1);
            edges = edges.filter(e => e.from !== idx && e.to !== idx);
            edges.forEach(e => {
                if (e.from > idx) e.from--;
                if (e.to > idx) e.to--;
            });
            nodes.forEach((n, i) => n.id = i);
            updateStats();
            if (isAnalyzed) analyzeCommunities();
        }
    });

    document.getElementById('analyzeBtn').addEventListener('click', analyzeCommunities);
    document.getElementById('distributeBtn').addEventListener('click', distributeResources);
    document.getElementById('connectIsolatedBtn').addEventListener('click', connectIsolated);
    document.getElementById('resetBtn').addEventListener('click', () => {
        nodes = [];
        edges = [];
        communities = [];
        isAnalyzed = false;
        createSampleNetwork();
        document.getElementById('distributeBtn').disabled = true;
        document.getElementById('legendBox').style.display = 'none';
        document.getElementById('communityPanel').style.display = 'none';
        document.getElementById('isolatedStats').style.display = 'none';
        updateStats();
    });
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function findNode(x, y) {
    return nodes.find(n => {
        const dx = n.x - x;
        const dy = n.y - y;
        return dx * dx + dy * dy < 256; // 16^2
    });
}

function updateStats() {
    document.getElementById('nodeCount').textContent = nodes.length;
    document.getElementById('edgeCount').textContent = edges.length;
}

init();
