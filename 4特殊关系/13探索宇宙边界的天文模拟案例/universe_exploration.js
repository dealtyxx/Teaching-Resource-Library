/**
 * Universe Exploration Visualization
 * 探索宇宙边界：无限集合与可观测宇宙
 */

// Canvas setup
const canvas = document.getElementById('universeCanvas');
const ctx = canvas.getContext('2d');

// Chinese Space Missions
const chinaSpaceMissions = [
    { name: '东方红一号', year: 1970, type: '卫星', x: 0.3, y: 0.2, color: '#de2910' },
    { name: '神舟五号', year: 2003, type: '载人', x: 0.6, y: 0.4, color: '#de2910' },
    { name: '嫦娥一号', year: 2007, type: '探月', x: 0.4, y: 0.7, color: '#de2910' },
    { name: '天宫空间站', year: 2021, type: '空间站', x: 0.7, y: 0.3, color: '#de2910' },
    { name: '天问一号', year: 2020, type: '探火', x: 0.5, y: 0.5, color: '#de2910' },
    { name: '北斗导航', year: 2020, type: '导航', x: 0.2, y: 0.6, color: '#de2910' }
];

// State
let stars = [];
let zoom = 1.0;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;
const OBSERVABLE_RADIUS = 0.8; // 80% of canvas

// Initialize
function init() {
    setupCanvas();
    generateStars(500);
    populateMissions();
    setupControls();
    animate();
}

function setupCanvas() {
    function resize() {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();

        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';

        ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize);
}

function generateStars(count) {
    stars = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random();
        stars.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            size: Math.random() * 2 + 0.5,
            brightness: Math.random() * 0.5 + 0.5,
            twinkle: Math.random() * Math.PI * 2
        });
    }
    updateStarCount();
}

function populateMissions() {
    const list = document.getElementById('missionsList');
    list.innerHTML = '';

    chinaSpaceMissions.forEach(mission => {
        const item = document.createElement('div');
        item.className = 'mission-item';
        item.innerHTML = `
            <strong>${mission.name}</strong>
            <span>${mission.year}年 · ${mission.type}</span>
        `;
        list.appendChild(item);
    });
}

function setupControls() {
    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', () => {
        zoom = Math.min(zoom * 1.3, 5.0);
        updateZoomDisplay();
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        zoom = Math.max(zoom / 1.3, 0.3);
        updateZoomDisplay();
    });

    document.getElementById('resetView').addEventListener('click', () => {
        zoom = 1.0;
        offsetX = 0;
        offsetY = 0;
        updateZoomDisplay();
    });

    // Mouse/touch controls
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    // Wheel zoom
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        zoom = Math.max(0.3, Math.min(5.0, zoom * delta));
        updateZoomDisplay();
    });
}

function handleMouseDown(e) {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
}

function handleMouseMove(e) {
    if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        offsetX += dx / zoom;
        offsetY += dy / zoom;
        lastX = e.clientX;
        lastY = e.clientY;
    }
}

function handleMouseUp() {
    isDragging = false;
}

function updateZoomDisplay() {
    document.getElementById('zoomLevel').textContent = zoom.toFixed(1) + '×';
}

function updateStarCount() {
    const visibleStars = stars.filter(star => {
        const dist = Math.sqrt(star.x * star.x + star.y * star.y);
        return dist <= OBSERVABLE_RADIUS;
    }).length;
    document.getElementById('starCount').textContent = visibleStars;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

function draw() {
    const w = canvas.offsetWidth || canvas.width;
    const h = canvas.offsetHeight || canvas.height;

    // Clear and fill background
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, w, h);

    // Add subtle nebula effect
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.05)');
    gradient.addColorStop(0.5, 'rgba(30, 58, 138, 0.03)');
    gradient.addColorStop(1, 'rgba(10, 14, 39, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2 + offsetX;
    const centerY = h / 2 + offsetY;
    const scale = Math.min(w, h) / 2 * zoom;

    // Draw observable universe boundary
    ctx.save();
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, OBSERVABLE_RADIUS * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.restore();

    // Draw stars
    const time = Date.now() / 1000;
    stars.forEach(star => {
        const px = centerX + star.x * scale;
        const py = centerY + star.y * scale;

        // Check if within canvas bounds
        if (px < -50 || px > w + 50 || py < -50 || py > h + 50) return;

        // Check if within observable universe
        const dist = Math.sqrt(star.x * star.x + star.y * star.y);
        const inObservable = dist <= OBSERVABLE_RADIUS;

        // Twinkling effect
        const twinkle = (Math.sin(time * 2 + star.twinkle) + 1) / 2;
        const alpha = star.brightness * (0.7 + twinkle * 0.3);

        ctx.save();
        ctx.globalAlpha = inObservable ? alpha : alpha * 0.3;

        // Star glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, star.size * 3);
        glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
        glow.addColorStop(0.5, 'rgba(200, 220, 255, 0.3)');
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(px - star.size * 3, py - star.size * 3, star.size * 6, star.size * 6);

        // Star core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, star.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });

    // Draw Chinese space missions
    chinaSpaceMissions.forEach(mission => {
        const px = centerX + (mission.x * 2 - 1) * OBSERVABLE_RADIUS * scale * 0.7;
        const py = centerY + (mission.y * 2 - 1) * OBSERVABLE_RADIUS * scale * 0.7;

        // Mission marker
        ctx.save();

        // Pulsing glow
        const pulse = (Math.sin(time * 3) + 1) / 2;
        const glowRadius = 12 + pulse * 4;

        const missionGlow = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
        missionGlow.addColorStop(0, 'rgba(222, 41, 16, 0.8)');
        missionGlow.addColorStop(0.7, 'rgba(222, 41, 16, 0.3)');
        missionGlow.addColorStop(1, 'rgba(222, 41, 16, 0)');
        ctx.fillStyle = missionGlow;
        ctx.beginPath();
        ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Marker body
        ctx.fillStyle = '#de2910';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = 'rgba(10, 14, 39, 0.8)';
        ctx.lineWidth = 3;
        ctx.font = 'bold 11px "Noto Serif SC", Arial';
        ctx.textAlign = 'center';
        ctx.strokeText(mission.name, px, py - 15);
        ctx.fillText(mission.name, px, py - 15);

        ctx.restore();
    });

    // Draw Earth at center
    ctx.save();
    ctx.fillStyle = '#1e3a8a';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Earth label
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px "Noto Serif SC", Arial';
    ctx.textAlign = 'center';
    ctx.fillText('地球', centerX, centerY + 22);
    ctx.restore();
}

// Start
init();
