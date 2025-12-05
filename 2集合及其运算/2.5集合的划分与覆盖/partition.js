/**
 * Red Mathematics - Set Partition & Cover Visualizer (Refined)
 */

// DOM Elements
const modeBtns = document.querySelectorAll('.mode-btn');
const addTeamBtn = document.getElementById('addTeamBtn');
const showExampleBtn = document.getElementById('showExampleBtn');
const teamList = document.getElementById('teamList');
const resetBtn = document.getElementById('resetBtn');
const zoneItems = document.querySelectorAll('.zone-item');
const statusBanner = document.getElementById('statusBanner');
const statusText = document.getElementById('statusText');
const statusIcon = document.querySelector('.status-icon');
const szTitle = document.getElementById('szTitle');
const szDesc = document.getElementById('szDesc');
const stageTitle = document.getElementById('stageTitle');
const stageSubtitle = document.getElementById('stageSubtitle');
const coverageBar = document.getElementById('coverageBar');
const coverageText = document.getElementById('coverageText');

// Data
const TEAM_COLORS = [
    '#ff5f56', // Red
    '#ffbd2e', // Yellow
    '#27c93f', // Green
    '#007aff', // Blue
    '#af52de', // Purple
    '#ff9500'  // Orange
];

const ZONES = [1, 2, 3, 4, 5, 6];

// State
let currentMode = 'partition';
let teams = []; // { id, name, color, zones: [] }
let activeTeamId = null;

// Initialization
function init() {
    createTeam(); // Start with one team
    updateUI();
    validate();
}

// Mode Switching
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;

        // Update Texts & Visuals
        if (currentMode === 'partition') {
            szTitle.textContent = '网格化治理 (Scientific Governance)';
            szDesc.textContent = '划分象征着科学的行政管理。核心在于"边界清晰"，如同行政区划，不能有模糊地带（重叠），也不能有三不管地带（空白）。这是提升治理效能的基础。';
            stageTitle.textContent = '社区网格地图';
            stageSubtitle.textContent = '请分配工作组：确保职责清晰，无缝衔接';
        } else {
            szTitle.textContent = '服务全覆盖 (Comprehensive Care)';
            szDesc.textContent = '覆盖象征着温暖的民生服务。核心在于"兜底保障"，允许服务资源叠加（重叠），但绝不能遗漏任何一个群体（空白）。体现了"一个都不能少"的关怀。';
            stageTitle.textContent = '便民服务网络';
            stageSubtitle.textContent = '请构建服务网：允许资源叠加，确保全覆盖';
        }

        validate();
    });
});

// Team Management
function createTeam() {
    if (teams.length >= TEAM_COLORS.length) {
        alert("工作组数量已达上限！");
        return;
    }

    const id = Date.now();
    const color = TEAM_COLORS[teams.length];
    const name = `工作组 ${String.fromCharCode(65 + teams.length)}`; // A, B, C...

    const newTeam = {
        id: id,
        name: name,
        color: color,
        zones: []
    };

    teams.push(newTeam);
    activeTeamId = id;
    updateUI();
    validate();
}

function deleteTeam(id, e) {
    e.stopPropagation();
    if (teams.length <= 1) {
        alert("至少保留一个工作组！");
        return;
    }

    teams = teams.filter(t => t.id !== id);
    if (activeTeamId === id) {
        activeTeamId = teams[0].id;
    }

    updateUI();
    validate();
}

function setActiveTeam(id) {
    activeTeamId = id;
    updateUI();
}

// Zone Interaction
zoneItems.forEach(zone => {
    zone.addEventListener('click', () => {
        if (!activeTeamId) return;

        const zoneId = parseInt(zone.dataset.id);
        const team = teams.find(t => t.id === activeTeamId);

        if (team.zones.includes(zoneId)) {
            // Remove zone
            team.zones = team.zones.filter(z => z !== zoneId);
        } else {
            // Add zone
            team.zones.push(zoneId);
        }

        updateUI();
        validate();
    });
});

// UI Update
function updateUI() {
    // Render Team List
    teamList.innerHTML = '';
    teams.forEach(team => {
        const div = document.createElement('div');
        div.className = `team-card ${team.id === activeTeamId ? 'active' : ''}`;
        div.onclick = () => setActiveTeam(team.id);

        div.innerHTML = `
            <div class="team-info">
                <div class="team-color-dot" style="background-color: ${team.color}"></div>
                <span class="team-name">${team.name}</span>
                <span class="team-count">${team.zones.length} 区域</span>
            </div>
            <button class="delete-team-btn" onclick="deleteTeam(${team.id}, event)">×</button>
        `;
        teamList.appendChild(div);
    });

    // Render Map Zones
    zoneItems.forEach(zone => {
        const zoneId = parseInt(zone.dataset.id);
        const bg = zone.querySelector('.zone-bg');
        const badgesContainer = zone.querySelector('.zone-badges');
        badgesContainer.innerHTML = '';

        // Find all teams covering this zone
        const coveringTeams = teams.filter(t => t.zones.includes(zoneId));

        if (coveringTeams.length > 0) {
            // Visual feedback based on overlap
            if (coveringTeams.length === 1) {
                // Single team: clean color
                bg.style.background = hexToRgba(coveringTeams[0].color, 0.25);
                zone.style.borderColor = coveringTeams[0].color;
                zone.style.boxShadow = `0 4px 12px ${hexToRgba(coveringTeams[0].color, 0.2)}`;
            } else {
                // Multiple teams: Show overlap visually
                const color1 = coveringTeams[0].color;
                const color2 = coveringTeams[1] ? coveringTeams[1].color : color1;

                if (currentMode === 'partition') {
                    // PARTITION MODE: Overlap is ERROR - show warning pattern
                    bg.style.background = `repeating-linear-gradient(
                        45deg,
                        ${hexToRgba(color1, 0.4)},
                        ${hexToRgba(color1, 0.4)} 10px,
                        ${hexToRgba(color2, 0.4)} 10px,
                        ${hexToRgba(color2, 0.4)} 20px
                    )`;
                    zone.style.borderColor = '#ff3b30'; // Red border for conflict
                    zone.style.boxShadow = '0 0 0 3px rgba(255, 59, 48, 0.2)';
                } else {
                    // COVER MODE: Overlap is OK - show collaboration pattern
                    bg.style.background = `linear-gradient(
                        135deg,
                        ${hexToRgba(color1, 0.4)} 0%,
                        ${hexToRgba(color2, 0.4)} 100%
                    )`;
                    zone.style.borderColor = '#27c93f'; // Green border for good coverage
                    zone.style.boxShadow = '0 0 0 3px rgba(39, 201, 63, 0.2)';
                }
            }

            // Add badges
            coveringTeams.forEach(t => {
                const badge = document.createElement('div');
                badge.className = 'team-badge';
                badge.style.backgroundColor = t.color;
                badgesContainer.appendChild(badge);
            });
        } else {
            // Reset
            bg.style.background = 'transparent';
            zone.style.borderColor = 'rgba(139, 0, 0, 0.1)';
            zone.style.boxShadow = 'none';
        }
    });
}

// Validation Logic
function validate() {
    // 1. Check Coverage (Union = S)
    const coveredZones = new Set();
    teams.forEach(t => t.zones.forEach(z => coveredZones.add(z)));

    const coverageCount = coveredZones.size;
    const allCovered = coverageCount === ZONES.length;
    const missingZones = ZONES.filter(z => !coveredZones.has(z));

    // Update Progress Bar
    const percentage = (coverageCount / ZONES.length) * 100;
    coverageBar.style.width = `${percentage}%`;
    coverageText.textContent = `${coverageCount}/6`;

    if (percentage === 100) {
        coverageBar.style.backgroundColor = '#27c93f';
    } else {
        coverageBar.style.backgroundColor = '#ffb400';
    }

    // 2. Check Overlap (Intersection = Empty) - Only for Partition
    let hasOverlap = false;
    let overlapZones = [];

    if (currentMode === 'partition') {
        const zoneCounts = {};
        teams.forEach(t => t.zones.forEach(z => {
            zoneCounts[z] = (zoneCounts[z] || 0) + 1;
        }));

        for (const [z, count] of Object.entries(zoneCounts)) {
            if (count > 1) {
                hasOverlap = true;
                overlapZones.push(z);
            }
        }
    }

    // Determine Status
    statusBanner.className = 'status-banner';

    if (currentMode === 'partition') {
        if (hasOverlap) {
            statusBanner.classList.add('error');
            statusIcon.textContent = '⚠️';
            statusText.textContent = `职责冲突！区域 ${overlapZones.join(', ')} 存在多头管理。请重新划分。`;
        } else if (!allCovered) {
            statusBanner.classList.add('info');
            statusIcon.textContent = 'ℹ️';
            statusText.textContent = `覆盖不全。区域 ${missingZones.join(', ')} 尚无专人负责。`;
        } else {
            statusBanner.classList.add('success');
            statusIcon.textContent = '✅';
            statusText.textContent = '网格化治理达标！职责清晰，无缝衔接。';
        }
    } else { // Cover Mode
        if (!allCovered) {
            statusBanner.classList.add('info');
            statusIcon.textContent = 'ℹ️';
            statusText.textContent = `服务缺位。区域 ${missingZones.join(', ')} 尚未覆盖。`;
        } else {
            statusBanner.classList.add('success');
            statusIcon.textContent = '✅';
            statusText.textContent = '服务全覆盖达成！织密了民生保障网。';
        }
    }
}

// Example Scenarios
function showExample() {
    teams = [];

    if (currentMode === 'partition') {
        // Partition Example: Non-overlapping, full coverage
        teams.push({ id: 1, name: '工作组 A', color: TEAM_COLORS[0], zones: [1, 2] });
        teams.push({ id: 2, name: '工作组 B', color: TEAM_COLORS[1], zones: [3, 4] });
        teams.push({ id: 3, name: '工作组 C', color: TEAM_COLORS[2], zones: [5, 6] });
        activeTeamId = 1;
    } else {
        // Cover Example: Overlapping zones, full coverage
        teams.push({ id: 1, name: '工作组 A', color: TEAM_COLORS[0], zones: [1, 2, 3] });
        teams.push({ id: 2, name: '工作组 B', color: TEAM_COLORS[1], zones: [3, 4, 5] });
        teams.push({ id: 3, name: '工作组 C', color: TEAM_COLORS[2], zones: [5, 6] });
        activeTeamId = 1;
    }

    updateUI();
    validate();
}

// Helpers
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Event Listeners
addTeamBtn.addEventListener('click', createTeam);
showExampleBtn.addEventListener('click', showExample);

resetBtn.addEventListener('click', () => {
    teams = [];
    createTeam();
});

// Init
init();
