/**
 * 代数结构演化系统
 * Algebraic Structure Evolution System
 */

// DOM Elements
const structureButtons = document.querySelectorAll('.structure-btn');
const propertiesPanel = document.querySelectorAll('.prop-item');
const examplesList = document.getElementById('examplesList');
const conceptInfo = document.getElementById('conceptInfo');
const ideologyTitleShort = document.getElementById('ideologyTitleShort');
const mainTitle = document.getElementById('mainTitle');
const mainSubtitle = document.getElementById('mainSubtitle');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const ideologyTitle = document.getElementById('ideologyTitle');
const ideologyText = document.getElementById('ideologyText');
const analogyText = document.getElementById('analogyText');
const svg = document.getElementById('structureSvg');
const structuresGroup = document.getElementById('structuresGroup');
const relationsGroup = document.getElementById('relationsGroup');
const playEvolutionBtn = document.getElementById('playEvolutionBtn');
const resetBtn = document.getElementById('resetBtn');

// State
let currentLevel = 'group';
let isAnimating = false;

// Structure Data
const STRUCTURES = {
    semigroup: {
        name: '半群',
        nameEn: 'Semigroup',
        icon: '⚙️',
        color: '#10b981',
        properties: ['封闭性', '结合律'],
        mainTitle: '半群 (Semigroup) - 基础团队协作',
        mainSubtitle: 'Foundation of Team Cooperation',
        ideology: {
            titleShort: '团队力量',
            title: '众人拾柴 · 火焰高',
            content: '半群体现了团队协作的基础——封闭性保证了团队内部的稳定性，结合律则体现了做事的有序性。正如"三个臭皮匠，顶个诸葛亮"，集体的力量源于有序的组织。',
            quote: '"单丝不成线，独木不成林。"',
            author: '— 古谚',
            conceptInfoHtml: `
                <p><strong>封闭性:</strong> 团队内部协作产生的成果仍属于团队。</p>
                <p><strong>结合律:</strong> 做事讲究顺序和方法，有条不紊。</p>
                <p><strong>社会意义:</strong> 集体主义精神的数学表达。</p>
            `
        },
        examples: [
            { icon: '➕', name: '正整数加法 (ℕ⁺, +)', desc: '任意两个正整数相加仍是正整数' },
            { icon: '✖️', name: '矩阵乘法', desc: '满足结合律但不一定满足交换律' }
        ],
        analogy: '如同一支基层工作队，成员之间相互配合，遵循既定的工作流程（结合律），共同完成任务（封闭性）。',
        position: { x: 300, y: 100 }
    },
    subsemigroup: {
        name: '子半群',
        nameEn: 'Subsemigroup',
        icon: '🔧',
        color: '#8b5cf6',
        properties: ['封闭性', '结合律'],
        mainTitle: '子半群 (Subsemigroup) - 专业化分工',
        mainSubtitle: 'Specialized Division of Labor',
        ideology: {
            titleShort: '专业分工',
            title: '术业有专攻 · 分工协作',
            content: '子半群体现了专业化分工的思想。在大的团队中，不同的专业小组各司其职，既保持独立运作能力，又服务于整体目标。',
            quote: '"闻道有先后，术业有专攻。"',
            author: '— 韩愈《师说》',
            conceptInfoHtml: `
                <p><strong>子集关系:</strong> 专业团队是整体组织的一部分。</p>
                <p><strong>独立运作:</strong> 保持专业特色和自主性。</p>
                <p><strong>服务整体:</strong> 为组织总目标贡献力量。</p>
            `
        },
        examples: [
            { icon: '🔢', name: '偶数加法 (2ℤ, +)', desc: '偶数集是整数加法群的子半群' },
            { icon: '📊', name: '可逆矩阵乘法', desc: '可逆矩阵是所有矩阵的特殊子集' }
        ],
        analogy: '如同企业中的专业部门，既有自己的专业特色和运作规律，又是整个组织体系的有机组成部分。',
        position: { x: 150, y: 300 }
    },
    monoid: {
        name: '独异点',
        nameEn: 'Monoid',
        icon: '🎯',
        color: '#f59e0b',
        properties: ['封闭性', '结合律', '单位元'],
        mainTitle: '独异点 (Monoid) - 坚守初心',
        mainSubtitle: 'Organization with Core Values',
        ideology: {
            titleShort: '核心价值',
            title: '不忘初心 · 方得始终',
            content: '独异点的单位元象征着组织的"初心"和核心价值观。无论如何发展变化，都要保持这个根基不动摇。正如党的建设始终强调"不忘初心、牢记使命"。',
            quote: '"不忘初心，方得始终。"',
            author: '— 《华严经》',
            conceptInfoHtml: `
                <p><strong>单位元:</strong> 组织的核心价值观和根本使命。</p>
                <p><strong>不变根基:</strong> 无论如何变化始终坚守的原则。</p>
                <p><strong>引领方向:</strong> 指引组织前进的灯塔。</p>
            `
        },
        examples: [
            { icon: '0️⃣', name: '非负整数加法 (ℕ, +)', desc: '单位元: 0，满足 0+n = n+0 = n' },
            { icon: '🔤', name: '字符串连接', desc: '单位元: 空字符串 ""' }
        ],
        analogy: '如同一个有明确使命和价值观的组织，无论外部环境如何变化，始终坚守核心理念（单位元），指引前进方向。',
        position: { x: 450, y: 300 }
    },
    group: {
        name: '群',
        nameEn: 'Group',
        icon: '🌟',
        color: '#4ecdc4',
        properties: ['封闭性', '结合律', '单位元', '逆元'],
        mainTitle: '群 (Group) - 和谐社会组织',
        mainSubtitle: 'The Perfect Social Organization with Mutual Support',
        ideology: {
            titleShort: '志愿精神',
            title: '人人为我 · 我为人人',
            content: '群是最完善的代数结构，逆元的存在体现了"有来有往"的互助精神。在和谐社会中，每个人既是受益者也是贡献者，形成相互支持、共同进步的生态系统。',
            quote: '"己所不欲，勿施于人。己欲立而立人，己欲达而达人。"',
            author: '— 《论语·雍也》',
            conceptInfoHtml: `
                <p><strong>群论基础:</strong> 代数系统的基本结构。</p>
                <p><strong>社会类比:</strong> 组织形式的数学模型。</p>
                <p><strong>核心价值:</strong> 人人为我，我为人人。</p>
            `
        },
        examples: [
            { icon: '📐', name: '整数加法群 (ℤ, +)', desc: '单位元: 0，每个数n的逆元是-n' },
            { icon: '🔄', name: '对称群 S₃', desc: '三角形的6种对称操作构成的群' }
        ],
        analogy: '正如群中每个元素都有逆元，在和谐社会中，每个人既是受益者也是贡献者。通过互帮互助，形成完整的社会支持网络。',
        position: { x: 650, y: 100 }
    }
};

// Relations
const RELATIONS = [
    { from: 'semigroup', to: 'monoid', label: '+单位元' },
    { from: 'monoid', to: 'group', label: '+逆元' },
    { from: 'subsemigroup', to: 'semigroup', label: '子集' }
];

// Initialization
window.addEventListener('load', () => {
    renderStructureDiagram();
    updateDisplay('group');
    attachEventListeners();
});

// Render Structure Diagram
function renderStructureDiagram() {
    const WIDTH = svg.clientWidth || 800;
    const HEIGHT = svg.clientHeight || 500;

    // Adjust positions
    Object.values(STRUCTURES).forEach(s => {
        s.position.x = (s.position.x / 800) * WIDTH;
        s.position.y = (s.position.y / 600) * HEIGHT;
    });

    // Render Relations
    RELATIONS.forEach(rel => {
        const from = STRUCTURES[rel.from].position;
        const to = STRUCTURES[rel.to].position;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2 - 30} ${to.x} ${to.y}`;
        path.setAttribute('d', d);
        path.setAttribute('class', 'relation-line');
        path.setAttribute('marker-end', 'url(#arrowRed)');
        path.setAttribute('data-from', rel.from);
        path.setAttribute('data-to', rel.to);

        relationsGroup.appendChild(path);

        // Label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (from.x + to.x) / 2);
        text.setAttribute('y', (from.y + to.y) / 2 - 35);
        text.setAttribute('class', 'relation-label');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = rel.label;
        relationsGroup.appendChild(text);
    });

    // Render Structures
    Object.entries(STRUCTURES).forEach(([key, data]) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'structure-node');
        g.setAttribute('transform', `translate(${data.position.x}, ${data.position.y})`);
        g.setAttribute('data-level', key);

        // Background circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', 50);
        circle.setAttribute('class', 'node-bg');
        circle.setAttribute('fill', `${data.color}20`);
        circle.setAttribute('stroke', data.color);
        circle.setAttribute('stroke-width', 2);

        // Icon
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        icon.setAttribute('y', -10);
        icon.setAttribute('class', 'node-label');
        icon.setAttribute('font-size', '30');
        icon.textContent = data.icon;

        // Name
        const nameZh = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameZh.setAttribute('y', 20);
        nameZh.setAttribute('class', 'node-label');
        nameZh.textContent = data.name;

        const nameEn = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameEn.setAttribute('y', 35);
        nameEn.setAttribute('class', 'node-sublabel');
        nameEn.textContent = data.nameEn;

        g.appendChild(circle);
        g.appendChild(icon);
        g.appendChild(nameZh);
        g.appendChild(nameEn);
        structuresGroup.appendChild(g);

        g.addEventListener('click', () => updateDisplay(key));
    });
}

// Update Display
function updateDisplay(level) {
    currentLevel = level;
    const data = STRUCTURES[level];

    // Update button states
    structureButtons.forEach(btn => {
        if (btn.dataset.level === level) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update SVG
    document.querySelectorAll('.structure-node').forEach(node => {
        const bg = node.querySelector('.node-bg');
        if (node.dataset.level === level) {
            bg.setAttribute('r', 55);
            bg.setAttribute('stroke-width', 3);
        } else {
            bg.setAttribute('r', 50);
            bg.setAttribute('stroke-width', 2);
        }
    });

    // Update properties
    propertiesPanel.forEach((prop, idx) => {
        if (idx < data.properties.length) {
            prop.classList.add('active');
        } else {
            prop.classList.remove('active');
        }
    });

    // Update examples
    examplesList.innerHTML = '';
    data.examples.forEach(ex => {
        const div = document.createElement('div');
        div.className = 'example-card fade-in';
        div.innerHTML = `
            <div class="ex-icon">${ex.icon}</div>
            <div class="ex-content">
                <strong>${ex.name}</strong>
                <p>${ex.desc}</p>
            </div>
        `;
        examplesList.appendChild(div);
    });

    // Update ideology
    ideologyTitleShort.textContent = data.ideology.titleShort;
    conceptInfo.innerHTML = data.ideology.conceptInfoHtml;
    mainTitle.textContent = data.mainTitle;
    mainSubtitle.textContent = data.mainSubtitle;
    quoteText.textContent = data.ideology.quote;
    quoteAuthor.textContent = data.ideology.author;
    ideologyTitle.textContent = data.ideology.title;
    ideologyText.innerHTML = `<p>${data.ideology.content}</p>`;
    analogyText.textContent = data.analogy;

    // Highlight relations
    document.querySelectorAll('.relation-line').forEach(line => {
        if (line.dataset.from === level || line.dataset.to === level) {
            line.classList.add('active');
        } else {
            line.classList.remove('active');
        }
    });
}

// Evolution Animation
async function playEvolution() {
    if (isAnimating) return;
    isAnimating = true;
    playEvolutionBtn.disabled = true;
    playEvolutionBtn.textContent = '播放中...';

    const sequence = ['semigroup', 'monoid', 'group'];

    for (const level of sequence) {
        updateDisplay(level);
        await sleep(2500);
    }

    isAnimating = false;
    playEvolutionBtn.disabled = false;
    playEvolutionBtn.textContent = '▶ 演化动画';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event Listeners
function attachEventListeners() {
    structureButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const level = btn.dataset.level;
            updateDisplay(level);
        });
    });

    playEvolutionBtn.addEventListener('click', playEvolution);

    resetBtn.addEventListener('click', () => {
        updateDisplay('group');
    });
}
