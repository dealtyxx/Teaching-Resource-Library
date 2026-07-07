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
const vennStage = document.getElementById('vennStage');

const countAEl = document.getElementById('countA');
const countBEl = document.getElementById('countB');
const countCEl = document.getElementById('countC');

// State
let population = [];
let activeTerms = new Set(['A', 'B', 'C']); // Default: Just add them all
let setSizes = {};
let challengeStep = 0;
let challengeSolved = false;
let probeEl = null;
let challengePanel = null;
let challengeFeedback = null;
let challengeStepsEl = null;
let challengeTitleEl = null;
let challengeHintEl = null;

// Constants
const TOTAL_PARTICLES = 100;
const CIRCLE_RADIUS = 120;
const CENTERS = {
    A: { x: 250, y: 140 },
    B: { x: 160, y: 260 },
    C: { x: 340, y: 260 }
};

const TERM_META = {
    A: { label: '|A|', name: '党员 A', sets: ['A'], sign: '+', desc: '先把 A 类力量纳入统计。' },
    B: { label: '|B|', name: '志愿者 B', sets: ['B'], sign: '+', desc: '再加入 B 类力量。' },
    C: { label: '|C|', name: '专家 C', sets: ['C'], sign: '+', desc: '再加入 C 类力量。' },
    AB: { label: '|A∩B|', name: 'A 与 B 的重叠', sets: ['A', 'B'], sign: '-', desc: 'A、B 都算过的人已经被重复统计一次。' },
    BC: { label: '|B∩C|', name: 'B 与 C 的重叠', sets: ['B', 'C'], sign: '-', desc: 'B、C 的交叉也要减去重复。' },
    AC: { label: '|A∩C|', name: 'A 与 C 的重叠', sets: ['A', 'C'], sign: '-', desc: 'A、C 的交叉同样需要修正。' },
    ABC: { label: '|A∩B∩C|', name: '三者共同重叠', sets: ['A', 'B', 'C'], sign: '+', desc: '三重交集在前一步被多减了一次，因此要补回来。' }
};

const CHALLENGE_STEPS = [
    {
        title: '第一关：先观察“虚高”',
        terms: ['A', 'B', 'C'],
        hint: '只保留三个单集合，看看同一个人被重复统计了几次。',
        success: '现在结果通常偏大：这正是容斥要解决的“重复统计”。'
    },
    {
        title: '第二关：减去两两重叠',
        terms: ['A', 'B', 'C', 'AB', 'BC', 'AC'],
        hint: '加入三个两两交集修正项，它们在公式里是减号。',
        success: '两两重叠被减掉了，但三重交集的人被减多了一次。'
    },
    {
        title: '第三关：补回三重交集',
        terms: ['A', 'B', 'C', 'AB', 'BC', 'AC', 'ABC'],
        hint: '最后加入 |A∩B∩C|，让每个人最终只被算一次。',
        success: '标准三集合容斥公式完成，真实人数被准确还原。'
    }
];

// Initialization
function init() {
    buildChallengePanel();
    generateData();
    updateCalculation();
    scheduleResponsiveFix();
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

    // Reset equation to default (inflated) and restart the guided challenge.
    challengeStep = 0;
    challengeSolved = false;
    if (challengeFeedback) {
        challengeFeedback.className = 'challenge-feedback';
        challengeFeedback.textContent = '按本步目标切换公式项，再检查结果。';
    }
    clearHighlights();
    setActiveTerms(['A', 'B', 'C'], false);

    updateCalculation();
}

// Visuals
function createParticle(person) {
    const el = document.createElement('div');
    el.className = 'particle';
    el.dataset.id = person.id;
    el.dataset.sets = personSets(person).join('');
    el.title = '属于集合：' + personSets(person).join('、');

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
    else el.style.backgroundColor = '#2f5f9f';

    el.addEventListener('click', event => {
        event.stopPropagation();
        showParticleProbe(person, el);
    });

    particlesLayer.appendChild(el);
}

// Interaction
equationTerms.forEach(term => {
    term.setAttribute('role', 'button');
    term.setAttribute('tabindex', '0');
    term.setAttribute('aria-pressed', term.classList.contains('active') ? 'true' : 'false');
    term.title = (TERM_META[term.dataset.term] || {}).desc || '点击切换该公式项';

    term.addEventListener('click', () => {
        toggleTerm(term.dataset.term);
    });

    term.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggleTerm(term.dataset.term);
    });

    // Hover effects (Highlight region)
    term.addEventListener('mouseenter', () => highlightRegion(term.dataset.term));
    term.addEventListener('mouseleave', () => clearHighlights());
});

function highlightRegion(term) {
    const meta = TERM_META[term];
    if (!meta) return;

    vennStage.dataset.focusTerm = term;
    vennStage.dataset.focusSign = meta.sign;
    equationTerms.forEach(item => item.classList.toggle('preview', item.dataset.term === term));

    document.querySelectorAll('.venn-circle').forEach(circle => {
        const setName = circle.dataset.set;
        circle.classList.toggle('focus', meta.sets.includes(setName));
        circle.classList.toggle('muted', !meta.sets.includes(setName));
    });

    document.querySelectorAll('.particle').forEach(particle => {
        const person = population.find(item => String(item.id) === particle.dataset.id);
        const hit = person && personMatchesTerm(person, term);
        particle.classList.toggle('highlight', hit);
        particle.classList.toggle('dimmed', !hit);
    });
    updateProbe(`${meta.name}：${setSizes[term]} 人`, meta.desc);
}

function clearHighlights() {
    delete vennStage.dataset.focusTerm;
    delete vennStage.dataset.focusSign;
    equationTerms.forEach(item => item.classList.remove('preview'));
    document.querySelectorAll('.venn-circle').forEach(circle => circle.classList.remove('focus', 'muted'));
    document.querySelectorAll('.particle').forEach(particle => particle.classList.remove('highlight', 'dimmed'));
    updateProbe('移入公式项可高亮对应区域', '点击粒子可查看它属于哪些集合。');
}

function personSets(person) {
    const sets = [];
    if (person.inA) sets.push('A');
    if (person.inB) sets.push('B');
    if (person.inC) sets.push('C');
    return sets;
}

function personMatchesTerm(person, term) {
    const meta = TERM_META[term];
    if (!meta) return false;
    return meta.sets.every(setName => person[`in${setName}`]);
}

function toggleTerm(term) {
    if (activeTerms.has(term)) activeTerms.delete(term);
    else activeTerms.add(term);
    syncEquationTerms();
    updateCalculation();
}

function setActiveTerms(terms, shouldUpdate = true) {
    activeTerms = new Set(terms);
    syncEquationTerms();
    if (shouldUpdate) updateCalculation();
}

function syncEquationTerms() {
    equationTerms.forEach(term => {
        const active = activeTerms.has(term.dataset.term);
        term.classList.toggle('active', active);
        term.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
}

function exactTermSet(terms) {
    if (activeTerms.size !== terms.length) return false;
    return terms.every(term => activeTerms.has(term));
}

function buildChallengePanel() {
    const equationBar = document.querySelector('.equation-bar');
    if (!equationBar || challengePanel) return;

    challengePanel = document.createElement('section');
    challengePanel.className = 'challenge-panel';
    challengePanel.innerHTML = `
        <div class="challenge-head">
            <div>
                <div class="challenge-kicker">容斥闯关</div>
                <h3 id="challengeTitle"></h3>
            </div>
            <div class="challenge-steps" id="challengeSteps"></div>
        </div>
        <p class="challenge-hint" id="challengeHint"></p>
        <div class="challenge-actions">
            <button type="button" id="challengeCheck">✓ 检查本步</button>
            <button type="button" id="challengeDemo">▶ 演示本步</button>
            <button type="button" id="challengeNext">→ 下一关</button>
            <button type="button" id="challengeReset">↻ 重来</button>
        </div>
        <div class="challenge-feedback" id="challengeFeedback"></div>
        <div class="probe-panel" id="probePanel">
            <b>移入公式项可高亮对应区域</b>
            <span>点击粒子可查看它属于哪些集合。</span>
        </div>
    `;
    equationBar.insertAdjacentElement('afterend', challengePanel);

    challengeStepsEl = document.getElementById('challengeSteps');
    challengeTitleEl = document.getElementById('challengeTitle');
    challengeHintEl = document.getElementById('challengeHint');
    challengeFeedback = document.getElementById('challengeFeedback');
    probeEl = document.getElementById('probePanel');

    document.getElementById('challengeCheck').addEventListener('click', checkChallengeStep);
    document.getElementById('challengeDemo').addEventListener('click', () => {
        setActiveTerms(CHALLENGE_STEPS[challengeStep].terms);
        checkChallengeStep();
    });
    document.getElementById('challengeNext').addEventListener('click', () => {
        if (!challengeSolved) checkChallengeStep();
        if (challengeSolved && challengeStep < CHALLENGE_STEPS.length - 1) {
            challengeStep++;
            challengeSolved = false;
            renderChallengePanel();
        }
    });
    document.getElementById('challengeReset').addEventListener('click', () => {
        challengeStep = 0;
        challengeSolved = false;
        setActiveTerms(['A', 'B', 'C']);
        renderChallengePanel();
    });

    renderChallengePanel();
}

function renderChallengePanel() {
    if (!challengePanel) return;
    const step = CHALLENGE_STEPS[challengeStep];
    challengeTitleEl.textContent = step.title;
    challengeHintEl.textContent = step.hint;
    challengeStepsEl.innerHTML = CHALLENGE_STEPS.map((item, index) => {
        const cls = index === challengeStep ? 'active' : index < challengeStep ? 'done' : '';
        return `<span class="${cls}">${index + 1}</span>`;
    }).join('');

    const exact = exactTermSet(step.terms);
    challengePanel.classList.toggle('solved', challengeSolved || exact);
    if (!challengeFeedback.textContent) {
        challengeFeedback.textContent = '按本步目标切换公式项，再检查结果。';
    }
}

function checkChallengeStep() {
    const step = CHALLENGE_STEPS[challengeStep];
    const ok = exactTermSet(step.terms);
    challengeSolved = ok;
    if (ok) {
        challengeFeedback.className = 'challenge-feedback success';
        challengeFeedback.textContent = step.success;
    } else {
        challengeFeedback.className = 'challenge-feedback warning';
        challengeFeedback.textContent = `还差一步：本关目标公式项是 ${step.terms.map(term => TERM_META[term].label).join('、')}。`;
    }
    renderChallengePanel();
}

function updateChallengePanel() {
    if (!challengePanel) return;
    const step = CHALLENGE_STEPS[challengeStep];
    if (!challengeSolved && exactTermSet(step.terms)) {
        challengeFeedback.className = 'challenge-feedback success';
        challengeFeedback.textContent = step.success;
    }
    renderChallengePanel();
}

function updateProbe(title, detail) {
    if (!probeEl) return;
    probeEl.innerHTML = `<b>${title}</b><span>${detail}</span>`;
}

function showParticleProbe(person, el) {
    document.querySelectorAll('.particle.selected').forEach(item => item.classList.remove('selected'));
    el.classList.add('selected');
    const sets = personSets(person);
    const terms = Object.keys(TERM_META).filter(term => personMatchesTerm(person, term));
    updateProbe(`样本 ${person.id}：${sets.join('、')}`, `它会影响 ${terms.map(term => TERM_META[term].label).join('、')}。容斥的目标是让它最终只被计数 1 次。`);
}

function applyResponsiveFix() {
    const compact = window.innerWidth <= 760;
    const app = document.querySelector('.app-container');
    const side = document.querySelector('.sidebar');
    const stage = document.querySelector('.visualizer-stage');
    if (!app || !side || !stage) return;
    const set = (node, prop, value) => node.style.setProperty(prop, value, 'important');

    if (compact) {
        set(document.body, 'height', 'auto');
        set(document.body, 'overflow', 'auto');
        set(document.body, 'align-items', 'flex-start');
        set(app, 'display', 'grid');
        set(app, 'grid-template-columns', '1fr');
        set(app, 'grid-template-areas', '"side" "main"');
        set(app, 'grid-template-rows', 'auto auto');
        set(app, 'width', 'min(94vw, 760px)');
        set(app, 'height', 'auto');
        set(app, 'min-height', '0');
        set(side, 'grid-area', 'side');
        set(side, 'width', '100%');
        set(side, 'max-width', '100%');
        set(stage, 'grid-area', 'main');
        set(stage, 'width', '100%');
        set(stage, 'min-width', '0');
    }
}

function scheduleResponsiveFix() {
    applyResponsiveFix();
    [120, 820, 1700, 2800, 3600].forEach(delay => setTimeout(applyResponsiveFix, delay));
    window.addEventListener('load', applyResponsiveFix);
    window.addEventListener('resize', applyResponsiveFix);
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

    updateChallengePanel();
}

// Event Listeners
refreshBtn.addEventListener('click', generateData);

// Init
init();
