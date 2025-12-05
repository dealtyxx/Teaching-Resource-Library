/**
 * Red Mathematics - Inclusion-Exclusion Principle Visualizer
 */

// DOM Elements
const refreshBtn = document.getElementById('refreshBtn');
const particlesLayer = document.getElementById('particlesLayer');
const equationTerms = document.querySelectorAll('.equation-term');
const equationResult = document.getElementById('equationResult');
const calcValueEl = document.getElementById('calcValue');
const trueValueEl = document.getElementById('trueValue');
const statDiffEl = document.getElementById('statDiff');
const statusBanner = document.getElementById('statusBanner');
const statusText = document.getElementById('statusText');
const statusIcon = document.querySelector('.status-icon');

const countAEl = document.getElementById('countA');
const countBEl = document.getElementById('countB');
const countCEl = document.getElementById('countC');

// State
let population = [];
let activeTerms = new Set(['A', 'B', 'C']); // Default: Just add them all
let setSizes = {};

// Constants
const TOTAL_PARTICLES = 100;
const CIRCLE_RADIUS = 120;
const CENTERS = {
    A: { x: 250, y: 140 },
    B: { x: 160, y: 260 },
    C: { x: 340, y: 260 }
};

// Initialization
function init() {
    generateData();
    updateUI();
}

// Data Generation
function generateData() {
    population = [];
    particlesLayer.innerHTML = '';

    // Generate random particles
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
        // Randomly assign membership to A, B, C
        const inA = Math.random() > 0.4;
        const inB = Math.random() > 0.4;
        const inC = Math.random() > 0.4;

        if (!inA && !inB && !inC) continue; // Must belong to at least one

        const person = { id: i, inA, inB, inC };
        population.push(person);

        // Create visual particle
        createParticle(person);
    }

    // Calculate Set Sizes
    setSizes = {
        A: population.filter(p => p.inA).length,
        B: population.filter(p => p.inB).length,
        C: population.filter(p => p.inC).length,
        AB: population.filter(p => p.inA && p.inB).length,
        BC: population.filter(p => p.inB && p.inC).length,
        AC: population.filter(p => p.inA && p.inC).length,
        ABC: population.filter(p => p.inA && p.inB && p.inC).length,
        Total: population.length
    };

    // Update Badge Counts
    countAEl.textContent = setSizes.A;
    countBEl.textContent = setSizes.B;
    countCEl.textContent = setSizes.C;
    trueValueEl.textContent = setSizes.Total;

    // Reset Equation to default (Inflated)
    activeTerms = new Set(['A', 'B', 'C']);
    equationTerms.forEach(term => {
        const t = term.dataset.term;
        if (['A', 'B', 'C'].includes(t)) {
            term.classList.add('active');
        } else {
            term.classList.remove('active');
        }
    });

    updateCalculation();
}

// Visuals
function createParticle(person) {
    const el = document.createElement('div');
    el.className = 'particle';

    // Determine position based on membership
    // We need to place them in the correct intersection regions
    // Simple approach: Weighted average of centers + noise

    let targetX = 0, targetY = 0, count = 0;

    if (person.inA) { targetX += CENTERS.A.x; targetY += CENTERS.A.y; count++; }
    if (person.inB) { targetX += CENTERS.B.x; targetY += CENTERS.B.y; count++; }
    if (person.inC) { targetX += CENTERS.C.x; targetY += CENTERS.C.y; count++; }

    targetX /= count;
    targetY /= count;

    // Add noise to spread them out
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 40;

    el.style.left = (targetX + Math.cos(angle) * dist) + 'px';
    el.style.top = (targetY + Math.sin(angle) * dist) + 'px';

    // Color based on role (Visual flair)
    if (person.inA) el.style.backgroundColor = '#ff5f56';
    else if (person.inB) el.style.backgroundColor = '#ffbd2e';
    else el.style.backgroundColor = '#007aff';

    particlesLayer.appendChild(el);
}

// Interaction
equationTerms.forEach(term => {
    term.addEventListener('click', () => {
        const t = term.dataset.term;

        if (activeTerms.has(t)) {
            activeTerms.delete(t);
            term.classList.remove('active');
        } else {
            activeTerms.add(t);
            term.classList.add('active');
        }

        updateCalculation();
    });

    // Hover effects (Highlight region)
    term.addEventListener('mouseenter', () => highlightRegion(term.dataset.term));
    term.addEventListener('mouseleave', () => clearHighlights());
});

function highlightRegion(term) {
    // This could be enhanced to dim other particles
    // For now, simple console log or CSS class toggle on circles
}

function clearHighlights() {
    // Reset visuals
}

// Calculation Logic
function updateCalculation() {
    let total = 0;

    // Add Singles
    if (activeTerms.has('A')) total += setSizes.A;
    if (activeTerms.has('B')) total += setSizes.B;
    if (activeTerms.has('C')) total += setSizes.C;

    // Subtract Doubles
    if (activeTerms.has('AB')) total -= setSizes.AB;
    if (activeTerms.has('BC')) total -= setSizes.BC;
    if (activeTerms.has('AC')) total -= setSizes.AC;

    // Add Triple
    if (activeTerms.has('ABC')) total += setSizes.ABC;

    // Update UI
    equationResult.textContent = total;
    calcValueEl.textContent = total;

    const diff = total - setSizes.Total;
    statDiffEl.textContent = diff > 0 ? `误差: +${diff}` : `误差: ${diff}`;

    if (diff === 0) {
        // Success
        statusBanner.className = 'status-banner success';
        statusIcon.textContent = '✅';
        statusText.textContent = '实事求是！数据已挤干水分，反映了真实力量。';
        statDiffEl.className = 'stat-diff success';

        // Check if formula is the standard one
        const isStandard = activeTerms.has('A') && activeTerms.has('B') && activeTerms.has('C') &&
            activeTerms.has('AB') && activeTerms.has('BC') && activeTerms.has('AC') &&
            activeTerms.has('ABC');

        if (isStandard) {
            statusText.textContent += ' (标准容斥公式验证通过)';
        }
    } else {
        // Warning
        statusBanner.className = 'status-banner warning';
        statusIcon.textContent = '⚠️';
        statusText.textContent = diff > 0 ? '数据虚高！存在重复统计，请减去重叠部分。' : '数据缺失！减去过多，请补回三者重叠部分。';
        statDiffEl.className = 'stat-diff';
    }
}

// Event Listeners
refreshBtn.addEventListener('click', generateData);

// Init
init();
