/**
 * Red Mathematics - Tech Team Collaboration Visualizer
 */

// DOM Elements
const scanBtns = document.querySelectorAll('.scan-btn');
const logContent = document.getElementById('logContent');
const nodesContainer = document.getElementById('nodesContainer');
const circuitSvg = document.getElementById('circuitSvg');
const totalCountEl = document.getElementById('totalCount');
const coveredCountEl = document.getElementById('coveredCount');
const gapCountEl = document.getElementById('gapCount');
const resetBtn = document.getElementById('resetBtn');

// Config
const MEMBER_COUNT = 12;

// State
let members = []; // { id, role: 'dev'|'research', testedH: bool, testedS: bool, x, y }

// Initialization
function init() {
    generateTeam();
    renderTeam();
    updateStats();
}

// Data Generation
function generateTeam() {
    members = [];
    for (let i = 0; i < MEMBER_COUNT; i++) {
        const role = Math.random() > 0.4 ? 'dev' : 'research';
        // Random testing status
        const testedH = Math.random() > 0.6;
        const testedS = Math.random() > 0.5;

        // Position in a grid-like layout
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 20 + col * 20 + (Math.random() * 5); // %
        const y = 20 + row * 20 + (Math.random() * 5); // %

        members.push({ id: i, role, testedH, testedS, x, y });
    }
}

function renderTeam() {
    nodesContainer.innerHTML = '';
    circuitSvg.innerHTML = '';

    members.forEach(m => {
        // Create Node
        const node = document.createElement('div');
        node.className = `team-node ${m.role}`;
        node.style.left = `${m.x}%`;
        node.style.top = `${m.y}%`;
        node.textContent = m.role === 'dev' ? 'D' : 'R';
        node.dataset.id = m.id;
        node.title = `Role: ${m.role}\nTested HW: ${m.testedH}\nTested SW: ${m.testedS}`;
        nodesContainer.appendChild(node);

        // Draw Connections to Terminals (Visual only)
        // Hardware Terminal is approx bottom left (10%, 90%)
        // Software Terminal is approx bottom right (90%, 90%)

        if (m.testedH) drawLine(m.x, m.y, 10, 90, 'h', m.id);
        if (m.testedS) drawLine(m.x, m.y, 90, 90, 's', m.id);
    });
}

function drawLine(x1, y1, x2, y2, type, id) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', `${x1 + 2}%`); // Offset for node center
    line.setAttribute('y1', `${y1 + 3}%`);
    line.setAttribute('x2', `${x2}%`);
    line.setAttribute('y2', `${y2}%`);
    line.setAttribute('class', `connection-line line-${type}-${id}`);
    circuitSvg.appendChild(line);
}

// Analysis Logic
function runScan(type) {
    resetVisuals();

    if (type === 'coverage') {
        log("Initiating Coverage Scan (H ∪ S)...");

        const covered = members.filter(m => m.testedH || m.testedS);

        covered.forEach(m => {
            const node = document.querySelector(`.team-node[data-id="${m.id}"]`);
            node.classList.add('highlight-blue');

            if (m.testedH) document.querySelector(`.line-h-${m.id}`).classList.add('active-h');
            if (m.testedS) document.querySelector(`.line-s-${m.id}`).classList.add('active-s');
        });

        log(`Scan Complete. ${covered.length} members contributed to testing.`);
        log("Insight: Broad participation ensures quality.");

    } else if (type === 'gap') {
        log("Initiating Blind Spot Detection (De Morgan)...");
        log("Scanning for (H ∪ S)ᶜ ↔ Hᶜ ∩ Sᶜ ...");

        const gaps = members.filter(m => !m.testedH && !m.testedS);

        gaps.forEach(m => {
            const node = document.querySelector(`.team-node[data-id="${m.id}"]`);
            node.classList.add('highlight-red');
        });

        if (gaps.length > 0) {
            log(`ALERT: ${gaps.length} members have not participated in testing.`);
            log("Action Required: Mobilize these resources immediately.");
        } else {
            log("System Secure: No blind spots detected.");
        }

    } else if (type === 'devops') {
        log("Analyzing Developer Impact (Dev ∩ Test)...");

        const devTesters = members.filter(m => m.role === 'dev' && (m.testedH || m.testedS));

        devTesters.forEach(m => {
            const node = document.querySelector(`.team-node[data-id="${m.id}"]`);
            node.classList.add('highlight-gold');
        });

        log(`Found ${devTesters.length} developers active in testing.`);
        log("Insight: DevOps culture is strengthening.");
    }
}

function resetVisuals() {
    document.querySelectorAll('.team-node').forEach(el => {
        el.classList.remove('highlight-blue', 'highlight-red', 'highlight-gold');
    });
    document.querySelectorAll('.connection-line').forEach(el => {
        el.classList.remove('active-h', 'active-s');
    });
}

function updateStats() {
    totalCountEl.textContent = members.length;

    const covered = members.filter(m => m.testedH || m.testedS).length;
    coveredCountEl.textContent = covered;

    const gaps = members.length - covered;
    gapCountEl.textContent = gaps;
}

function log(msg) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = `> ${msg}`;
    logContent.appendChild(line);
    logContent.scrollTop = logContent.scrollHeight;
}

// Event Listeners
scanBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        scanBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        runScan(btn.dataset.scan);
    });
});

resetBtn.addEventListener('click', () => {
    scanBtns.forEach(b => b.classList.remove('active'));
    resetVisuals();
    log("System Reset.");
    generateTeam();
    renderTeam();
    updateStats();
});

// Init
init();
