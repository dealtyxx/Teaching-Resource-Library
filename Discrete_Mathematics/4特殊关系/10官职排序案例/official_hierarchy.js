/**
 * Ancient Chinese Official Hierarchy Visualization
 * 官职等级：偏序关系的传统智慧
 */

// Official Data
const officials = {
    '县令': {
        title: '县令',
        seal: '令',
        grade: '正七品',
        level: 1,
        description: '一县之长，父母官',
        responsibilities: '管理一县之地，负责基层治理、税收、司法、教化等事务。直接面对百姓，是朝廷与民众的桥梁。',
        virtue: '亲民爱民、勤政廉洁',
        historical: [
            '包拯 - 端州知县时执法严明',
            '海瑞 - 淳安知县时清廉刚正',
            '郑板桥 - 范县知县时关心民生'
        ],
        modern: '现代对应：县长、区长'
    },
    '太守': {
        title: '太守',
        seal: '守',
        grade: '正四品',
        level: 2,
        description: '州郡长官，承上启下',
        responsibilities: '管理一州之地，统辖数县。协调地方事务，向中央汇报，确保政令畅通。',
        virtue: '统筹全局、公正无私',
        historical: [
            '范仲淹 - 庆州知府时筑堤防洪',
            '苏轼 - 杭州知府时治理西湖',
            '欧阳修 - 滁州知府时兴办教育'
        ],
        modern: '现代对应：地级市市长、厅局级干部'
    },
    '尚书': {
        title: '尚书',
        seal: '尚',
        grade: '正二品',
        level: 3,
        description: '六部之长，国之栋梁',
        responsibilities: '掌管吏、户、礼、兵、刑、工六部之一，制定国家政策，统筹全国性事务。',
        virtue: '经纶满腹、忠君报国',
        historical: [
            '魏徵 - 礼部尚书，直言敢谏',
            '狄仁杰 - 刑部尚书，明察秋毫',
            '于谦 - 兵部尚书，保卫京师'
        ],
        modern: '现代对应：部长、省长级别'
    },
    '丞相': {
        title: '丞相',
        seal: '相',
        grade: '正一品',
        level: 4,
        description: '百官之首，一人之下',
        responsibilities: '辅佐君主，总理朝政，协调百官，制定国策。为国家发展方向把舵，确保天下太平。',
        virtue: '德才兼备、鞠躬尽瘁',
        historical: [
            '诸葛亮 - 鞠躬尽瘁死而后已',
            '魏徵 - 贞观之治的重要推手',
            '张居正 - 万历新政改革家'
        ],
        modern: '现代对应：总理、国务院总理'
    }
};

// State
let selectedRank = null;
let compareMode = false;
let compareSelection = [];

// Initialize
function init() {
    setupEventListeners();
    animateEntrance();
}

function animateEntrance() {
    const cards = document.querySelectorAll('.rank-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

function setupEventListeners() {
    const cards = document.querySelectorAll('.rank-card');
    cards.forEach(card => {
        card.addEventListener('click', () => handleCardClick(card));
    });

    document.getElementById('showPropertiesBtn').addEventListener('click', showPropertiesDemo);
    document.getElementById('compareBtn').addEventListener('click', toggleCompareMode);
    document.getElementById('resetBtn').addEventListener('click', reset);
}

function handleCardClick(card) {
    const rank = card.dataset.rank;

    if (compareMode) {
        handleCompareSelection(card, rank);
    } else {
        showRankDetail(card, rank);
    }
}

function showRankDetail(card, rank) {
    // Deselect previous
    document.querySelectorAll('.rank-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    selectedRank = rank;
    const data = officials[rank];

    // Update detail panel
    document.getElementById('detailTitle').textContent = data.title;
    const content = document.getElementById('detailContent');

    content.innerHTML = `
        <div style="margin-bottom: 16px;">
            <div style="display: inline-block; padding: 6px 12px; background: rgba(212,175,55,0.1); border-radius: 8px; margin-bottom: 12px;">
                <strong>官品：</strong>${data.grade}
            </div>
        </div>
        
        <h4 style="color: #1e3799; margin-bottom: 8px;">📋 职责范围</h4>
        <p style="margin-bottom: 16px; line-height: 1.7;">${data.responsibilities}</p>
        
        <h4 style="color: #1e3799; margin-bottom: 8px;">⭐ 为官之德</h4>
        <p style="margin-bottom: 16px; padding: 10px; background: #f0f5ff; border-radius: 8px; border-left: 4px solid #1e3799;">
            <strong>${data.virtue}</strong>
        </p>
        
        <h4 style="color: #1e3799; margin-bottom: 8px;">👤 历史名臣</h4>
        <ul style="margin-left: 20px; line-height: 2;">
            ${data.historical.map(h => `<li>${h}</li>`).join('')}
        </ul>
        
        <div style="margin-top: 16px; padding: 12px; background: #e3fdf5; border-radius: 8px; border-left: 4px solid #00a8a8;">
            <strong>💡 现代传承：</strong>${data.modern}
        </div>
    `;
}

function toggleCompareMode() {
    compareMode = !compareMode;
    const btn = document.getElementById('compareBtn');

    if (compareMode) {
        btn.style.background = 'rgba(255, 255, 255, 0.4)';
        btn.innerHTML = '<span class="icon">✓</span><span>选择中...</span>';
        compareSelection = [];

        document.getElementById('detailTitle').textContent = '比较模式';
        document.getElementById('detailContent').innerHTML = `
            <p class="placeholder">请选择两个官职进行等级比较。<br><br>
            将验证偏序关系的三个性质：<br>
            ✓ 自反性<br>
            ✓ 反对称性<br>
            ✓ 传递性</p>
        `;

        document.querySelectorAll('.rank-card').forEach(c => c.classList.remove('selected'));
    } else {
        btn.style.background = 'rgba(255, 255, 255, 0.2)';
        btn.innerHTML = '<span class="icon">⚖️</span><span>比较官职</span>';
        compareSelection = [];
        document.querySelectorAll('.rank-card').forEach(c => c.classList.remove('selected'));
    }
}

function handleCompareSelection(card, rank) {
    if (compareSelection.includes(rank)) {
        compareSelection = compareSelection.filter(r => r !== rank);
        card.classList.remove('selected');
    } else {
        if (compareSelection.length < 2) {
            compareSelection.push(rank);
            card.classList.add('selected');
        }
    }

    if (compareSelection.length === 2) {
        performComparison();
    }
}

function performComparison() {
    const [rank1, rank2] = compareSelection;
    const level1 = officials[rank1].level;
    const level2 = officials[rank2].level;

    let result = '';
    let relation = '';

    if (level1 === level2) {
        relation = `${rank1} = ${rank2}`;
        result = `<div style="padding: 16px; background: #f0f5ff; border-radius: 12px; border: 2px solid #1e3799;">
            <h4 style="color: #1e3799;">等级相同</h4>
            <p>两者处于同一等级，满足 <strong>自反性</strong> 和 <strong>反对称性</strong>。</p>
        </div>`;
    } else if (level1 < level2) {
        relation = `${rank1} < ${rank2}`;
        result = `<div style="padding: 16px; background: #fff5f5; border-radius: 12px; border: 2px solid #c0392b;">
            <h4 style="color: #c0392b;">等级关系确认</h4>
            <p><strong>${rank1}</strong> 职级低于 <strong>${rank2}</strong></p>
            <p style="margin-top: 8px;">满足偏序关系：${rank1} $\\leq$ ${rank2}</p>
        </div>`;
    } else {
        relation = `${rank1} > ${rank2}`;
        result = `<div style="padding: 16px; background: #fff5f5; border-radius: 12px; border: 2px solid #c0392b;">
            <h4 style="color: #c0392b;">等级关系确认</h4>
            <p><strong>${rank1}</strong> 职级高于 <strong>${rank2}</strong></p>
            <p style="margin-top: 8px;">满足偏序关系：${rank2} $\\leq$ ${rank1}</p>
        </div>`;
    }

    document.getElementById('detailContent').innerHTML = result;

    // Trigger MathJax rendering
    if (window.MathJax) {
        window.MathJax&&window.MathJax.typesetPromise&&MathJax.typesetPromise([document.getElementById('detailContent')]);
    }

    setTimeout(() => {
        compareMode = false;
        toggleCompareMode();
    }, 3000);
}

function showPropertiesDemo() {
    const examples = [
        {
            property: '自反性 (Reflexive)',
            example: '县令 ≤ 县令',
            explanation: '任何官职都等于其自身，这是偏序关系的基本性质。'
        },
        {
            property: '反对称性 (Antisymmetric)',
            example: '若 县令 ≤ 太守 且 太守 ≤ 县令，则 县令 = 太守',
            explanation: '但实际上县令 < 太守，因此不存在双向关系，保证了等级的严格性。'
        },
        {
            property: '传递性 (Transitive)',
            example: '县令 ≤ 太守，太守 ≤ 尚书 ⟹ 县令 ≤ 尚书',
            explanation: '等级关系可以传递，确保了整个体系的一致性和完整性。'
        }
    ];

    let currentExample = 0;

    function showExample() {
        const ex = examples[currentExample];
        document.getElementById('detailTitle').textContent = ex.property;
        document.getElementById('detailContent').innerHTML = `
            <div style="padding: 20px; background: linear-gradient(135deg, #fff5f5 0%, white 100%); border-radius: 12px; border: 2px solid #d4af37;">
                <div style="font-size: 1.1rem; font-family: 'JetBrains Mono', monospace; margin-bottom: 16px; padding: 12px; background: white; border-radius: 8px; text-align: center;">
                    ${ex.example}
                </div>
                <p style="line-height: 1.8; color: #555;">${ex.explanation}</p>
                <div style="margin-top: 16px; text-align: center; color: #999;">
                    示例 ${currentExample + 1} / ${examples.length}
                </div>
            </div>
        `;

        currentExample = (currentExample + 1) % examples.length;
    }

    showExample();
    const interval = setInterval(showExample, 4000);

    setTimeout(() => {
        clearInterval(interval);
        reset();
    }, 12000);
}

function reset() {
    selectedRank = null;
    compareMode = false;
    compareSelection = [];

    document.querySelectorAll('.rank-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('detailTitle').textContent = '选择官职查看详情';
    document.getElementById('detailContent').innerHTML = `
        <p class="placeholder">点击左侧官职卡片查看详细信息、历史人物和职责说明。</p>
    `;

    const btn = document.getElementById('compareBtn');
    btn.style.background = 'rgba(255, 255, 255, 0.2)';
    btn.innerHTML = '<span class="icon">⚖️</span><span>比较官职</span>';
}

// Start
init();
