/**
 * Cultural Heritage GIS Visualization
 * 文化遗产地理信息系统
 */

// Heritage sites data (simplified coordinates)
const heritageSites = [
    { name: '故宫', nameEn: 'Forbidden City', x: 116.4, y: 39.9, color: '#c0392b' },
    { name: '长城', nameEn: 'Great Wall', x: 116.5, y: 40.4, color: '#e67e22' },
    { name: '兵马俑', nameEn: 'Terracotta Army', x: 109.3, y: 34.4, color: '#8b6914' },
    { name: '敦煌', nameEn: 'Dunhuang', x: 94.7, y: 40.1, color: '#27ae60' },
    { name: '布达拉宫', nameEn: 'Potala Palace', x: 91.1, y: 29.7, color: '#2980b9' },
    { name: '苏州园林', nameEn: 'Suzhou Gardens', x: 120.6, y: 31.3, color: '#8e44ad' }
];

// Canvas elements
const originalCanvas = document.getElementById('originalCanvas');
const transformedCanvas = document.getElementById('transformedCanvas');
const originalCtx = originalCanvas.getContext('2d');
const transformedCtx = transformedCanvas.getContext('2d');

// State
let rotation = 30; // degrees
let scale = 1.0;
let sites = JSON.parse(JSON.stringify(heritageSites)); // Deep copy
let transformedSites = [];

// Initialize
function init() {
    setupCanvas();
    setupControls();
    populateHeritageList();
    updateVisualization();
}

function setupCanvas() {
    function resizeCanvas(canvas) {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();

        // Set canvas actual dimensions for rendering
        const dpr = window.devicePixelRatio || 1;
        const width = rect.width - 32; // Account for padding
        const height = 400;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        // Set display size
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        // Scale context for retina displays
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
    }

    resizeCanvas(originalCanvas);
    resizeCanvas(transformedCanvas);

    window.addEventListener('resize', () => {
        resizeCanvas(originalCanvas);
        resizeCanvas(transformedCanvas);
        updateVisualization();
    });
}

function setupControls() {
    const rotationSlider = document.getElementById('rotationSlider');
    const scaleSlider = document.getElementById('scaleSlider');

    rotationSlider.addEventListener('input', e => {
        rotation = parseFloat(e.target.value);
        document.getElementById('rotationValue').textContent = rotation + '°';
        document.getElementById('currentAngle').textContent = rotation + '°';
    });

    scaleSlider.addEventListener('input', e => {
        scale = parseFloat(e.target.value);
        document.getElementById('scaleValue').textContent = scale.toFixed(1);
        document.getElementById('currentScale').textContent = scale.toFixed(1) + '×';
    });

    document.getElementById('applyBtn').addEventListener('click', applyTransform);
    document.getElementById('inverseBtn').addEventListener('click', applyInverse);
    document.getElementById('resetBtn').addEventListener('click', reset);
}

function populateHeritageList() {
    const list = document.getElementById('heritageList');
    list.innerHTML = '';

    sites.forEach((site, index) => {
        const item = document.createElement('div');
        item.className = 'heritage-item';
        item.style.borderLeftColor = site.color;
        item.innerHTML = `
            <strong>${site.name}</strong>
            <span>(${site.x.toFixed(1)}, ${site.y.toFixed(1)})</span>
        `;
        list.appendChild(item);
    });
}

// Coordinate transformation functions
function transform(x, y, theta, s) {
    const rad = theta * Math.PI / 180;
    const newX = s * (x * Math.cos(rad) - y * Math.sin(rad));
    const newY = s * (x * Math.sin(rad) + y * Math.cos(rad));
    return { x: newX, y: newY };
}

function inverseTransform(x, y, theta, s) {
    const rad = theta * Math.PI / 180;
    const newX = (1 / s) * (x * Math.cos(rad) + y * Math.sin(rad));
    const newY = (1 / s) * (-x * Math.sin(rad) + y * Math.cos(rad));
    return { x: newX, y: newY };
}

function applyTransform() {
    transformedSites = sites.map(site => {
        const transformed = transform(site.x, site.y, rotation, scale);
        return {
            ...site,
            x: transformed.x,
            y: transformed.y
        };
    });

    document.getElementById('transformStatus').textContent = '已变换';
    updateVisualization();

    // Show success message
    setTimeout(() => {
        const status = document.getElementById('transformStatus');
        status.style.color = '#00a896';
        setTimeout(() => {
            status.style.color = '';
        }, 1000);
    }, 100);
}

function applyInverse() {
    if (transformedSites.length === 0) {
        alert('请先应用正变换！');
        return;
    }

    const recovered = transformedSites.map(site => {
        const original = inverseTransform(site.x, site.y, rotation, scale);
        return {
            ...site,
            x: original.x,
            y: original.y
        };
    });

    // Check if recovery is accurate
    let maxError = 0;
    recovered.forEach((rec, i) => {
        const orig = sites[i];
        const error = Math.sqrt(Math.pow(rec.x - orig.x, 2) + Math.pow(rec.y - orig.y, 2));
        maxError = Math.max(maxError, error);
    });

    document.getElementById('transformStatus').textContent = `已恢复 (误差: ${maxError.toFixed(6)})`;

    // Update transformed canvas to show recovered coordinates
    transformedSites = recovered;
    updateVisualization();

    // Show success message
    setTimeout(() => {
        const status = document.getElementById('transformStatus');
        status.style.color = '#c0392b';
        setTimeout(() => {
            status.style.color = '';
        }, 1000);
    }, 100);
}

function reset() {
    rotation = 30;
    scale = 1.0;
    transformedSites = [];

    document.getElementById('rotationSlider').value = 30;
    document.getElementById('scaleSlider').value = 1.0;
    document.getElementById('rotationValue').textContent = '30°';
    document.getElementById('scaleValue').textContent = '1.0';
    document.getElementById('currentAngle').textContent = '30°';
    document.getElementById('currentScale').textContent = '1.0×';
    document.getElementById('transformStatus').textContent = '原始';

    updateVisualization();
}

function updateVisualization() {
    drawCoordinateSystem(originalCtx, originalCanvas, sites, '原始坐标');

    if (transformedSites.length > 0) {
        drawCoordinateSystem(transformedCtx, transformedCanvas, transformedSites, '变换后坐标');
    } else {
        drawCoordinateSystem(transformedCtx, transformedCanvas, [], '等待变换');
    }
}

function drawCoordinateSystem(ctx, canvas, points, title) {
    // Get actual display dimensions
    const w = canvas.offsetWidth || parseInt(canvas.style.width) || 400;
    const h = canvas.offsetHeight || parseInt(canvas.style.height) || 400;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const gridSize = 30;

    // Grid
    ctx.save();
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1;

    for (let x = centerX % gridSize; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    for (let y = centerY % gridSize; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
    ctx.restore();

    // Axes
    ctx.save();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(20, centerY);
    ctx.lineTo(w - 20, centerY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX, h - 20);
    ctx.stroke();

    // Arrows
    ctx.fillStyle = '#555';

    // X-axis arrow
    ctx.beginPath();
    ctx.moveTo(w - 20, centerY);
    ctx.lineTo(w - 28, centerY - 4);
    ctx.lineTo(w - 28, centerY + 4);
    ctx.closePath();
    ctx.fill();

    // Y-axis arrow
    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX - 4, 28);
    ctx.lineTo(centerX + 4, 28);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Labels
    ctx.save();
    ctx.fillStyle = '#666';
    ctx.font = '13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('X', w - 35, centerY - 10);
    ctx.textAlign = 'center';
    ctx.fillText('Y', centerX + 15, 35);
    ctx.restore();

    // Title
    ctx.save();
    ctx.fillStyle = '#8b6914';
    ctx.font = 'bold 16px "Noto Serif SC", Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, h - 12);
    ctx.restore();

    // Plot points
    if (points && points.length > 0) {
        ctx.save();

        // Find bounds for auto-scaling
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        points.forEach(p => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });

        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;
        const marginFactor = 0.6; // Use 60% of available space
        const scaleX = (w * marginFactor) / rangeX;
        const scaleY = (h * marginFactor) / rangeY;
        const plotScale = Math.min(scaleX, scaleY);

        const offsetX = (minX + maxX) / 2;
        const offsetY = (minY + maxY) / 2;

        // Calculate all point positions first
        const pointPositions = points.map(site => ({
            site,
            px: centerX + (site.x - offsetX) * plotScale,
            py: centerY - (site.y - offsetY) * plotScale
        }));

        // Draw subtle connection lines between all points
        ctx.strokeStyle = 'rgba(139, 105, 20, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < pointPositions.length; i++) {
            for (let j = i + 1; j < pointPositions.length; j++) {
                ctx.beginPath();
                ctx.moveTo(pointPositions[i].px, pointPositions[i].py);
                ctx.lineTo(pointPositions[j].px, pointPositions[j].py);
                ctx.stroke();
            }
        }

        // Draw points first (so labels can overlay)
        pointPositions.forEach(({ site, px, py }) => {
            // Shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // Point circle
            ctx.fillStyle = site.color;
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(px, py, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        });

        // Draw labels with smart positioning to avoid overlaps
        const labelPositions = [];

        pointPositions.forEach(({ site, px, py }, index) => {
            // Possible label positions (8 directions)
            const labelOffsets = [
                { dx: 0, dy: -40, align: 'center', baseline: 'bottom' },     // top
                { dx: 35, dy: -30, align: 'left', baseline: 'middle' },      // top-right
                { dx: 40, dy: 0, align: 'left', baseline: 'middle' },        // right
                { dx: 35, dy: 30, align: 'left', baseline: 'middle' },       // bottom-right
                { dx: 0, dy: 40, align: 'center', baseline: 'top' },         // bottom
                { dx: -35, dy: 30, align: 'right', baseline: 'middle' },     // bottom-left
                { dx: -40, dy: 0, align: 'right', baseline: 'middle' },      // left
                { dx: -35, dy: -30, align: 'right', baseline: 'middle' }     // top-left
            ];

            ctx.font = 'bold 13px "Noto Serif SC", Arial';
            const metrics = ctx.measureText(site.name);
            const labelWidth = metrics.width + 12;
            const labelHeight = 22;

            // Find best position with least overlap
            let bestOffset = labelOffsets[0];
            let minOverlap = Infinity;

            for (const offset of labelOffsets) {
                const textX = px + offset.dx;
                const textY = py + offset.dy;

                // Calculate label box position
                let labelX, labelY;
                if (offset.align === 'center') {
                    labelX = textX - labelWidth / 2;
                } else if (offset.align === 'right') {
                    labelX = textX - labelWidth - 2;
                } else {
                    labelX = textX + 2;
                }

                if (offset.baseline === 'middle') {
                    labelY = textY - labelHeight / 2;
                } else if (offset.baseline === 'bottom') {
                    labelY = textY - labelHeight;
                } else {
                    labelY = textY;
                }

                // Check overlap with existing labels
                let overlap = 0;
                for (const existing of labelPositions) {
                    const dx = Math.max(0, Math.min(labelX + labelWidth, existing.x + existing.w) - Math.max(labelX, existing.x));
                    const dy = Math.max(0, Math.min(labelY + labelHeight, existing.y + existing.h) - Math.max(labelY, existing.y));
                    overlap += dx * dy;
                }

                // Check overlap with other points
                let pointOverlap = 0;
                pointPositions.forEach((other, otherIndex) => {
                    if (otherIndex !== index) {
                        const dist = Math.sqrt(Math.pow(other.px - labelX - labelWidth / 2, 2) +
                            Math.pow(other.py - labelY - labelHeight / 2, 2));
                        if (dist < 25) {
                            pointOverlap += (25 - dist) * 10;
                        }
                    }
                });

                // Check if label is within canvas bounds
                const outOfBounds = (labelX < 25 || labelX + labelWidth > w - 25 ||
                    labelY < 40 || labelY + labelHeight > h - 35) ? 5000 : 0;

                const totalCost = overlap + pointOverlap + outOfBounds;
                if (totalCost < minOverlap) {
                    minOverlap = totalCost;
                    bestOffset = { ...offset, labelX, labelY, textX, textY };
                }
            }

            // Draw connecting line from point to label
            const lineEndX = bestOffset.textX;
            const lineEndY = bestOffset.textY;

            ctx.strokeStyle = 'rgba(139, 105, 20, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(lineEndX, lineEndY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Label background with rounded corners
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.strokeStyle = site.color;
            ctx.lineWidth = 2;

            const radius = 6;
            const lx = bestOffset.labelX;
            const ly = bestOffset.labelY;
            const lw = labelWidth;
            const lh = labelHeight;

            ctx.beginPath();
            ctx.moveTo(lx + radius, ly);
            ctx.lineTo(lx + lw - radius, ly);
            ctx.quadraticCurveTo(lx + lw, ly, lx + lw, ly + radius);
            ctx.lineTo(lx + lw, ly + lh - radius);
            ctx.quadraticCurveTo(lx + lw, ly + lh, lx + lw - radius, ly + lh);
            ctx.lineTo(lx + radius, ly + lh);
            ctx.quadraticCurveTo(lx, ly + lh, lx, ly + lh - radius);
            ctx.lineTo(lx, ly + radius);
            ctx.quadraticCurveTo(lx, ly, lx + radius, ly);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();

            // Label text
            ctx.fillStyle = '#2d2d2d';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(site.name, lx + lw / 2, ly + lh / 2);

            // Store label position for overlap detection
            labelPositions.push({
                x: bestOffset.labelX,
                y: bestOffset.labelY,
                w: labelWidth,
                h: labelHeight
            });
        });

        ctx.restore();
    } else {
        // No points message
        ctx.save();
        ctx.fillStyle = '#bbb';
        ctx.font = '15px "Noto Serif SC", Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title === '等待变换' ? '等待应用坐标变换...' : '无数据', centerX, centerY);
        ctx.restore();
    }
}

// Start
init();
