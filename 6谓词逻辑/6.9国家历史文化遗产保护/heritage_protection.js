/**
 * Heritage Protection System - Predicate Logic Visualization
 * 红色数理 - 文化遗产保护：传承中华文明的逻辑守护
 */

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        init();
    }, 100);
});

// ===== Heritage Database =====
const HERITAGE_SITES = [
    {
        id: 1,
        name: '长城',
        icon: '🏯',
        location: '北京等多地',
        unique: true,
        inDanger: false,
        unesco: true,
        description: '世界文化遗产，中华民族的象征，人类建筑史上的奇迹。',
        significance: '长城是中华民族坚韧不拔精神的象征，见证了中华文明的伟大历程。'
    },
    {
        id: 2,
        name: '故宫',
        icon: '🏰',
        location: '北京',
        unique: true,
        inDanger: false,
        unesco: true,
        description: '明清两代皇宫，世界上现存规模最大、保存最完整的木质结构古建筑群。',
        significance: '故宫承载着中华传统建筑艺术的精华，是中华文明的重要见证。'
    },
    {
        id: 3,
        name: '敦煌莫高窟',
        icon: '🎨',
        location: '甘肃敦煌',
        unique: true,
        inDanger: true,
        unesco: true,
        description: '世界最大的佛教艺术宝库，保存着大量精美的壁画和彩塑。',
        significance: '莫高窟是丝绸之路文明交流的见证，体现了中华文化的包容性。'
    },
    {
        id: 4,
        name: '兵马俑',
        icon: '⚔️',
        location: '陕西西安',
        unique: true,
        inDanger: false,
        unesco: true,
        description: '秦始皇陵的陪葬坑，被誉为"世界第八大奇迹"。',
        significance: '兵马俑展现了古代中国的军事实力和工艺水平，震撼世界。'
    },
    {
        id: 5,
        name: '布达拉宫',
        icon: '🏔️',
        location: '西藏拉萨',
        unique: true,
        inDanger: false,
        unesco: true,
        description: '藏传佛教的圣地，世界海拔最高的古代宫堡建筑群。',
        significance: '布达拉宫体现了藏族文化的璀璨成就和中华民族的团结统一。'
    },
    {
        id: 6,
        name: '丽江古城',
        icon: '🌸',
        location: '云南丽江',
        unique: true,
        inDanger: true,
        unesco: true,
        description: '纳西族古城，融合了多民族文化特色，保存完好的传统民居建筑群。',
        significance: '丽江古城展现了中华民族多元一体的文化格局和各民族和谐共生。'
    },
    {
        id: 7,
        name: '都江堰',
        icon: '💧',
        location: '四川成都',
        unique: true,
        inDanger: false,
        unesco: true,
        description: '世界上最古老且仍在使用的水利工程，展现了古代中国的智慧。',
        significance: '都江堰体现了中华民族与自然和谐相处的哲学思想。'
    },
    {
        id: 8,
        name: '苏州古典园林',
        icon: '🌿',
        location: '江苏苏州',
        unique: true,
        inDanger: false,
        unesco: true,
        description: '中国古典园林的代表，体现了"虽由人作，宛自天开"的造园理念。',
        significance: '苏州园林是中华美学思想的具象表达，影响深远。'
    },
    {
        id: 9,
        name: '平遥古城',
        icon: '🏘️',
        location: '山西晋中',
        unique: true,
        inDanger: true,
        unesco: true,
        description: '保存最完整的明清县城，中国古代城市的活化石。',
        significance: '平遥古城见证了晋商文化的辉煌，展现了传统商业文明。'
    },
    {
        id: 10,
        name: '土楼',
        icon: '🏛️',
        location: '福建',
        unique: true,
        inDanger: false,
        unesco: true,
        description: '客家人的独特民居建筑，展现了家族团结和防御智慧。',
        significance: '土楼体现了客家文化的凝聚力和中华民族的家国情怀。'
    }
];

// ===== State =====
let selectedHeritage = null;
let currentFilter = 'all';

// ===== Initialize =====
function init() {
    renderHeritageGrid();
    setupEventListeners();
    updateProtectedCount();
}

function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderHeritageGrid();
        });
    });

    // Modal close
    document.getElementById('closeModal')?.addEventListener('click', closeModal);
    document.querySelector('.modal-overlay')?.addEventListener('click', closeModal);
}

// ===== Render Heritage Grid =====
function renderHeritageGrid() {
    const grid = document.getElementById('heritageGrid');
    grid.innerHTML = '';

    const filteredSites = HERITAGE_SITES.filter(site => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'unesco') return site.unesco;
        if (currentFilter === 'danger') return site.inDanger;
        if (currentFilter === 'priority') return shouldBePriority(site);
        return true;
    });

    filteredSites.forEach(site => {
        const card = createHeritageCard(site);
        grid.appendChild(card);
    });
}

function createHeritageCard(site) {
    const card = document.createElement('div');
    card.className = 'heritage-card';

    if (shouldBePriority(site)) {
        card.classList.add('priority');
    }

    card.innerHTML = `
        <div class="heritage-image">${site.icon}</div>
        <div class="heritage-info">
            <div class="heritage-name">${site.name}</div>
            <div class="heritage-tags">
                ${site.unesco ? '<span class="tag unesco">世界遗产</span>' : ''}
                ${site.unique ? '<span class="tag unique">独一无二</span>' : ''}
                ${site.inDanger ? '<span class="tag danger">濒危</span>' : ''}
                ${shouldBePriority(site) ? '<span class="tag priority">优先保护</span>' : ''}
            </div>
        </div>
    `;

    card.addEventListener('click', () => selectHeritage(site));
    return card;
}

// ===== Logic: Should Be Priority =====
function shouldBePriority(site) {
    // Rule 1: Unique(x) ∧ InDanger(x) → PriorityForProtection(x)
    if (site.unique && site.inDanger) {
        return true;
    }

    // Rule 2: UNESCOHeritage(x) → PriorityForProtection(x)
    if (site.unesco) {
        return true;
    }

    return false;
}

// ===== Select Heritage =====
function selectHeritage(site) {
    selectedHeritage = site;
    showHeritageDetail(site);
    showReasoningProcess(site);
    showProtectionAdvice(site);
}

function showHeritageDetail(site) {
    const detailContainer = document.getElementById('heritageDetail');

    detailContainer.innerHTML = `
        <div class="detail-header">
            <span class="detail-icon">${site.icon}</span>
            <div class="detail-name">${site.name}</div>
            <div class="detail-location">📍 ${site.location}</div>
        </div>
        <div class="detail-body">
            <div class="detail-row">
                <div class="detail-label">遗迹描述</div>
                <div class="detail-value">${site.description}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">文化意义</div>
                <div class="detail-value">${site.significance}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">谓词属性</div>
                <div class="detail-value">
                    Unique(${site.name}): ${site.unique ? '✅ 是' : '❌ 否'}<br>
                    InDanger(${site.name}): ${site.inDanger ? '⚠️ 是' : '✅ 否'}<br>
                    UNESCOHeritage(${site.name}): ${site.unesco ? '🌍 是' : '❌ 否'}
                </div>
            </div>
        </div>
    `;
}

function showReasoningProcess(site) {
    const reasoningContainer = document.getElementById('reasoningProcess');
    const steps = [];

    // Check predicates
    steps.push({
        formula: `Unique(${site.name}) = ${site.unique ? 'True' : 'False'}`,
        result: site.unique ? '✅ 该遗迹具有独一无二的价值' : '信息：该遗迹不具有独特性'
    });

    steps.push({
        formula: `InDanger(${site.name}) = ${site.inDanger ? 'True' : 'False'}`,
        result: site.inDanger ? '⚠️ 该遗迹目前处于濒危状态' : '✅ 该遗迹状态良好'
    });

    steps.push({
        formula: `UNESCOHeritage(${site.name}) = ${site.unesco ? 'True' : 'False'}`,
        result: site.unesco ? '🌍 该遗迹已被列为世界遗产' : '信息：该遗迹未列入世界遗产'
    });

    // Apply rules
    let priority = false;
    let reason = '';

    if (site.unique && site.inDanger) {
        priority = true;
        reason = '规则一：Unique(x) ∧ InDanger(x) → PriorityForProtection(x)';
        steps.push({
            formula: reason,
            result: '🎯 触发规则一：独特且濒危，应优先保护！',
            success: true
        });
    }

    if (site.unesco) {
        priority = true;
        reason = reason || '规则二：UNESCOHeritage(x) → PriorityForProtection(x)';
        steps.push({
            formula: '规则二：UNESCOHeritage(x) → PriorityForProtection(x)',
            result: '🎯 触发规则二：世界遗产，应优先保护！',
            success: true
        });
    }

    if (!priority) {
        steps.push({
            formula: 'PriorityForProtection(x) = False',
            result: '未触发优先保护规则'
        });
    }

    // Render steps
    reasoningContainer.innerHTML = steps.map(step => `
        <div class="reasoning-step">
            <div class="step-formula">${step.formula}</div>
            <div class="step-result ${step.success ? 'success' : ''}">${step.result}</div>
        </div>
    `).join('');
}

function showProtectionAdvice(site) {
    const adviceContainer = document.getElementById('protectionAdvice');
    const isPriority = shouldBePriority(site);

    if (isPriority) {
        let measures = '';

        if (site.unique && site.inDanger) {
            measures = `
                <p><strong>紧急保护措施：</strong></p>
                <ul style="margin-left: 20px; margin-top: 8px; line-height: 1.8;">
                    <li>立即设立专项保护基金</li>
                    <li>加强日常监测和维护</li>
                    <li>限制游客流量，实施预约制</li>
                    <li>开展抢救性修复工作</li>
                    <li>运用现代科技进行数字化保护</li>
                </ul>
                <p style="margin-top: 12px;"><strong>时间要求：</strong>立即执行</p>
            `;
        } else if (site.unesco) {
            measures = `
                <p><strong>世界遗产保护措施：</strong></p>
                <ul style="margin-left: 20px; margin-top: 8px; line-height: 1.8;">
                    <li>严格遵守UNESCO保护标准</li>
                    <li>定期向UNESCO提交保护报告</li>
                    <li>加强国际合作与交流</li>
                    <li>提升公众保护意识</li>
                    <li>建立长效保护机制</li>
                </ul>
                <p style="margin-top: 12px;"><strong>监管级别：</strong>国家一级</p>
            `;
        }

        adviceContainer.innerHTML = `
            <div class="advice-content">
                <div class="advice-title">🚨 优先保护建议</div>
                <div class="advice-text">
                    ${measures}
                    <p style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ff9999; color: #de2910; font-weight: 600;">
                        "保护好文化遗产，就是保护好中华民族的根和魂，让中华文明薪火相传、生生不息。"
                    </p>
                </div>
            </div>
        `;
    } else {
        adviceContainer.innerHTML = `
            <div style="padding: 15px; text-align: center; color: #52c41a;">
                <div style="font-size: 2rem; margin-bottom: 10px;">✅</div>
                <div style="font-weight: 600; margin-bottom: 8px;">状态良好</div>
                <div style="font-size: 0.85rem; color: #666;">
                    该遗迹目前保护状况良好，继续保持常规维护即可。
                </div>
            </div>
        `;
    }
}

// ===== Update Protected Count =====
function updateProtectedCount() {
    const count = HERITAGE_SITES.filter(site => shouldBePriority(site)).length;
    document.getElementById('protectedCount').textContent = count;
}

// ===== Modal =====
function closeModal() {
    document.getElementById('detailModal').classList.remove('show');
}

// ===== Expose functions =====
window.selectHeritage = selectHeritage;
