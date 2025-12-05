/**
 * Red Mathematics - Function Concepts Visualization
 */

// DOM Elements
const domainContainer = document.getElementById('domainContainer');
const codomainContainer = document.getElementById('codomainContainer');
const mappingSvg = document.getElementById('mappingSvg');
const domainCount = document.getElementById('domainCount');
const codomainCount = document.getElementById('codomainCount');
const conceptTitle = document.getElementById('conceptTitle');
const conceptDesc = document.getElementById('conceptDesc');
const conceptMath = document.getElementById('conceptMath');
const insightText = document.getElementById('insightText');
const btnSingle = document.getElementById('btnSingle');
const btnSet = document.getElementById('btnSet');
const resetBtn = document.getElementById('resetBtn');

// Data: Domain (People)
const PEOPLE = [
    { id: 'p1', name: '贫困户张大爷', role: '脱贫对象', icon: '👴' },
    { id: 'p2', name: '返乡青年小李', role: '创业者', icon: '👨‍🌾' },
    { id: 'p3', name: '留守儿童小花', role: '学生', icon: '👧' },
    { id: 'p4', name: '退休工人老王', role: '城市居民', icon: '👷' },
    { id: 'p5', name: '进城务工大刘', role: '农民工', icon: '🧳' },
    { id: 'p6', name: '科研人员小赵', role: '专家', icon: '👩‍🔬' }
];

// Data: Codomain (Well-being Outcomes)
const OUTCOMES = [
    { id: 'o1', name: '基本医疗保障', type: '医疗', icon: '🏥' },
    { id: 'o2', name: '义务教育免费', type: '教育', icon: '🏫' },
    { id: 'o3', name: '产业扶持资金', type: '经济', icon: '💰' },
    { id: 'o4', name: '养老金发放', type: '社保', icon: '💳' },
    { id: 'o5', name: '技能培训补贴', type: '就业', icon: '🛠️' }
];

// Function: f(Person) -> Outcome
// Note: This is a simplified mapping for demonstration
const MAPPING = {
    'p1': 'o1', // Elderly poor -> Healthcare (also could be subsidy, simplified to 1)
    'p2': 'o3', // Entrepreneur -> Funding
    'p3': 'o2', // Child -> Education
    'p4': 'o4', // Retired -> Pension
    'p5': 'o5', // Migrant worker -> Training
    'p6': 'o3'  // Researcher -> Funding
};

// State
let currentMode = 'single'; // 'single' or 'set'
let selectedDomain = new Set();
let selectedCodomain = new Set();

// Initialization
function init() {
    renderElements();
    renderMappings(); // Draw initial faint lines
    setupInteractions();
    updateView();
}

function renderElements() {
    // Render Domain
    domainContainer.innerHTML = '';
    PEOPLE.forEach(p => {
        const el = document.createElement('div');
        el.className = 'element-item';
        el.dataset.id = p.id;
        el.innerHTML = `
            <div class="elem-icon">${p.icon}</div>
            <div class="elem-info">
                <h4>${p.name}</h4>
                <p>${p.role}</p>
            </div>
        `;
        el.addEventListener('click', () => handleDomainClick(p.id));
        domainContainer.appendChild(el);
    });

    // Render Codomain
    codomainContainer.innerHTML = '';
    OUTCOMES.forEach(o => {
        const el = document.createElement('div');
        el.className = 'element-item';
        el.dataset.id = o.id;
        el.innerHTML = `
            <div class="elem-icon">${o.icon}</div>
            <div class="elem-info">
                <h4>${o.name}</h4>
                <p>${o.type}</p>
            </div>
        `;
        el.addEventListener('click', () => handleCodomainClick(o.id));
        codomainContainer.appendChild(el);
    });
}

function renderMappings() {
    // Clear existing paths (except defs)
    while (mappingSvg.children.length > 1) {
        mappingSvg.lastChild.remove();
    }

    // We need positions. Since elements are in scrollable containers, 
    // we need to calculate positions relative to the SVG container.
    // This requires the layout to be stable.

    // Use requestAnimationFrame to ensure DOM is rendered
    requestAnimationFrame(() => {
        drawPaths();
    });
}

function drawPaths() {
    const svgRect = mappingSvg.getBoundingClientRect();

    PEOPLE.forEach(p => {
        const targetId = MAPPING[p.id];
        if (!targetId) return;

        const sourceEl = domainContainer.querySelector(`[data-id="${p.id}"]`);
        const targetEl = codomainContainer.querySelector(`[data-id="${targetId}"]`);

        if (sourceEl && targetEl) {
            const sRect = sourceEl.getBoundingClientRect();
            const tRect = targetEl.getBoundingClientRect();

            // Calculate coordinates relative to SVG
            const x1 = 0; // Left edge of SVG
            const y1 = sRect.top - svgRect.top + sRect.height / 2;
            const x2 = svgRect.width; // Right edge of SVG
            const y2 = tRect.top - svgRect.top + tRect.height / 2;

            // Bezier Curve
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const cx1 = x1 + (x2 - x1) * 0.5;
            const cx2 = x2 - (x2 - x1) * 0.5;

            const d = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;

            path.setAttribute('d', d);
            path.setAttribute('class', 'mapping-path');
            path.dataset.source = p.id;
            path.dataset.target = targetId;

            mappingSvg.appendChild(path);
        }
    });
}

// Interactions
function handleDomainClick(id) {
    if (currentMode === 'single') {
        selectedDomain.clear();
        selectedDomain.add(id);
        selectedCodomain.clear(); // Clear manual codomain selection
    } else {
        if (selectedDomain.has(id)) selectedDomain.delete(id);
        else selectedDomain.add(id);
        selectedCodomain.clear(); // In set mode, clicking domain clears codomain selection to focus on Image(A)
    }
    updateView();
}

function handleCodomainClick(id) {
    if (currentMode === 'single') {
        // Inverse image of single element
        selectedCodomain.clear();
        selectedCodomain.add(id);
        selectedDomain.clear();
    } else {
        // Inverse image of set
        if (selectedCodomain.has(id)) selectedCodomain.delete(id);
        else selectedCodomain.add(id);
        selectedDomain.clear();
    }
    updateView();
}

function updateView() {
    // 1. Update Selection Styles
    document.querySelectorAll('.element-item').forEach(el => {
        el.classList.remove('selected', 'highlighted');
    });

    selectedDomain.forEach(id => {
        domainContainer.querySelector(`[data-id="${id}"]`).classList.add('selected');
    });

    selectedCodomain.forEach(id => {
        codomainContainer.querySelector(`[data-id="${id}"]`).classList.add('selected');
    });

    // 2. Calculate Highlights & Paths
    document.querySelectorAll('.mapping-path').forEach(p => p.classList.remove('active'));

    let imageSet = new Set();
    let preImageSet = new Set();

    // Case A: Domain Selected -> Show Image f(A)
    if (selectedDomain.size > 0) {
        selectedDomain.forEach(pid => {
            const oid = MAPPING[pid];
            if (oid) {
                imageSet.add(oid);
                // Highlight Path
                const path = mappingSvg.querySelector(`[data-source="${pid}"]`);
                if (path) path.classList.add('active');
            }
        });

        // Highlight Result in Codomain
        imageSet.forEach(oid => {
            codomainContainer.querySelector(`[data-id="${oid}"]`).classList.add('highlighted');
        });

        updateInsightText('image');
    }
    // Case B: Codomain Selected -> Show Inverse Image f^-1(B)
    else if (selectedCodomain.size > 0) {
        selectedCodomain.forEach(oid => {
            // Find all p such that f(p) = oid
            PEOPLE.forEach(p => {
                if (MAPPING[p.id] === oid) {
                    preImageSet.add(p.id);
                    // Highlight Path
                    const path = mappingSvg.querySelector(`[data-source="${p.id}"]`);
                    if (path) path.classList.add('active');
                }
            });
        });

        // Highlight Result in Domain
        preImageSet.forEach(pid => {
            domainContainer.querySelector(`[data-id="${pid}"]`).classList.add('highlighted');
        });

        updateInsightText('inverse');
    } else {
        updateInsightText('default');
    }

    // 3. Update Counts
    domainCount.textContent = `已选: ${selectedDomain.size}`;
    codomainCount.textContent = `已选: ${selectedCodomain.size}`;
}

function updateInsightText(type) {
    if (type === 'image') {
        if (currentMode === 'single') {
            conceptTitle.textContent = '像 (Image)';
            conceptMath.textContent = 'y = f(x)';
            conceptDesc.textContent = '定义域中特定元素对应的唯一值域元素。';
            insightText.textContent = '精准施策要求"因人而异"。对于选定的群众（原像），国家提供特定的政策支持（像），如为贫困户提供医疗保障，为创业者提供资金支持。';
        } else {
            conceptTitle.textContent = '集合的像 (Image of a Set)';
            conceptMath.textContent = 'f(A) = { f(x) | x ∈ A }';
            conceptDesc.textContent = '定义域子集中所有元素的像构成的集合。';
            insightText.textContent = '这代表了"群体获得感"。选定的人群集合（如所有需要帮扶的对象）通过政策映射，获得了一系列民生保障成果的集合。';
        }
    } else if (type === 'inverse') {
        if (currentMode === 'single') {
            conceptTitle.textContent = '原像 (Pre-image)';
            conceptMath.textContent = 'f⁻¹(y) = { x | f(x) = y }';
            conceptDesc.textContent = '映射到特定值域元素的所有定义域元素。';
            insightText.textContent = '这代表了政策的"覆盖面"。例如，享受"义务教育免费"政策的（像），是所有的适龄儿童（原像）。';
        } else {
            conceptTitle.textContent = '集合的逆像 (Inverse Image)';
            conceptMath.textContent = 'f⁻¹(B) = { x | f(x) ∈ B }';
            conceptDesc.textContent = '映射到值域子集的所有定义域元素构成的集合。';
            insightText.textContent = '这反映了"普惠性"。选定的一系列民生福祉（如社保和医疗），其对应的受益人群涵盖了老年人、贫困户等广泛群体，体现了社会主义制度的优越性。';
        }
    } else {
        conceptTitle.textContent = '函数映射 (Mapping)';
        conceptMath.textContent = 'y = f(x)';
        conceptDesc.textContent = '函数描述了从输入到输出的对应关系。在民生领域，这代表了将群众的具体需求映射为精准的政策供给。';
        insightText.textContent = '"民之所盼，政之所向"。精准扶贫、教育公平、医疗保障等政策，就是为了确保每一位群众（原像）都能享受到国家发展的红利（像），实现"一个都不能少"的庄严承诺。';
    }
}

function setupInteractions() {
    btnSingle.addEventListener('click', () => {
        currentMode = 'single';
        btnSingle.classList.add('active');
        btnSet.classList.remove('active');
        resetSelection();
    });

    btnSet.addEventListener('click', () => {
        currentMode = 'set';
        btnSet.classList.add('active');
        btnSingle.classList.remove('active');
        resetSelection();
    });

    resetBtn.addEventListener('click', resetSelection);

    // Handle resize
    window.addEventListener('resize', () => {
        renderMappings();
        updateView();
    });
}

function resetSelection() {
    selectedDomain.clear();
    selectedCodomain.clear();
    updateView();
}

// Start
init();
