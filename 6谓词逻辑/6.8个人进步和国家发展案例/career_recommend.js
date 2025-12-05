/**
 * Career Recommendation System - Predicate Logic Visualization
 * 红色数理 - 个人成长与国家发展：智能职业推荐系统
 */

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        init();
    }, 100);
});

// ===== Career Database =====
const CAREER_PATHS = {
    '计算机科学-科技创新-编程开发': {
        path: 'AI算法工程师',
        icon: '🤖',
        desc: '专注于人工智能算法研发，推动智能科技创新，为国家科技自立自强贡献力量。',
        contribution: '助力中国在人工智能领域实现技术突破，参与国家重大科技项目。'
    },
    '人工智能-科技创新-算法设计': {
        path: '深度学习研究员',
        icon: '🧠',
        desc: '从事深度学习前沿研究，攻克核心技术难题，为智能产业发展提供技术支撑。',
        contribution: '推动人工智能技术自主创新，服务国家战略科技需求。'
    },
    '航空航天-航天探索-科研创新': {
        path: '航天工程师',
        icon: '🚀',
        desc: '参与航天器设计与研发，投身星辰大海征程，为航天强国梦想添砖加瓦。',
        contribution: '为实现航天强国战略目标、探索宇宙奥秘贡献青春力量。'
    },
    '生物医学-医疗健康-科研创新': {
        path: '生物医药研发专家',
        icon: '🏥',
        desc: '致力于生物医药研发创新，攻克重大疾病，保障人民生命健康。',
        contribution: '为人民健康事业和医药产业发展作出贡献。'
    },
    '环境科学-绿色环保-数据分析': {
        path: '环保科技专家',
        icon: '🌱',
        desc: '运用科技手段治理环境问题，推动绿色低碳发展，建设美丽中国。',
        contribution: '为实现碳达峰碳中和目标、推进生态文明建设贡献力量。'
    },
    '电子工程-智能制造-系统架构': {
        path: '智能制造系统工程师',
        icon: '⚙️',
        desc: '设计智能制造系统，推动工业转型升级，助力制造强国建设。',
        contribution: '为中国制造向中国创造转变提供技术支持。'
    },
    '新能源-绿色环保-工程实施': {
        path: '新能源工程师',
        icon: '⚡',
        desc: '开发清洁能源技术，推动能源革命，保障国家能源安全。',
        contribution: '为实现能源自主可控、绿色低碳发展作出贡献。'
    },
    '材料科学-新材料研发-科研创新': {
        path: '新材料研发工程师',
        icon: '🔬',
        desc: '研发前沿新材料，突破"卡脖子"技术，增强国家科技竞争力。',
        contribution: '为解决关键材料"卡脖子"问题、实现材料自主可控贡献智慧。'
    }
};

// Default fallback career
const DEFAULT_CAREER = {
    path: '科技创新工作者',
    icon: '💡',
    desc: '将个人专长与国家需求相结合，在科技创新领域发挥自己的才能，为国家发展贡献力量。',
    contribution: '立足本职工作，不断学习进步，努力成为国家需要的高素质人才。'
};

// National strategic needs (priority fields)
const NATIONAL_NEEDS = [
    '人工智能', '计算机科学', '航空航天', '生物医学',
    '环境科学', '新能源', '电子工程', '材料科学'
];

// ===== Initialize =====
function init() {
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('analyzeBtn').addEventListener('click', performAnalysis);
}

// ===== Perform Analysis =====
function performAnalysis() {
    // Get input values
    const name = document.getElementById('studentName').value.trim();
    const major = document.getElementById('majorSelect').value;
    const interest = document.getElementById('interestSelect').value;
    const ability = document.getElementById('abilitySelect').value;

    // Validation
    if (!name || !major || !interest || !ability) {
        alert('请填写完整的学生信息！');
        return;
    }

    // Clear previous results
    const stepsContainer = document.getElementById('reasoningSteps');
    stepsContainer.innerHTML = '';

    // Start reasoning process
    showReasoningProcess(name, major, interest, ability);
}

// ===== Show Reasoning Process =====
function showReasoningProcess(name, major, interest, ability) {
    const stepsContainer = document.getElementById('reasoningSteps');
    const steps = [];

    // Step 1: MajorIn(x, y)
    steps.push({
        content: `MajorIn(${name}, ${major})`,
        status: `✅ 确认：学生${name}主修${major}专业`
    });

    // Step 2: InterestIn(x, z)
    steps.push({
        content: `InterestIn(${name}, ${interest})`,
        status: `✅ 确认：学生${name}对${interest}领域有兴趣`
    });

    // Step 3: AbleIn(x, w)
    steps.push({
        content: `AbleIn(${name}, ${ability})`,
        status: `✅ 确认：学生${name}在${ability}方面具备能力`
    });

    // Step 4: NationNeed(y)
    const isNationalNeed = NATIONAL_NEEDS.includes(major);
    steps.push({
        content: `NationNeed(${major})`,
        status: isNationalNeed
            ? `✅ 匹配：${major}是国家战略急需专业`
            : `⚠️ ${major}非优先战略专业，但仍可为国家发展做出贡献`
    });

    // Step 5: Match(y, z, w, p)
    const careerKey = `${major}-${interest}-${ability}`;
    const career = CAREER_PATHS[careerKey] || DEFAULT_CAREER;

    steps.push({
        content: `Match(${major}, ${interest}, ${ability}, ${career.path})`,
        status: `✅ 匹配成功：专业、兴趣、能力与职业路径相匹配`
    });

    // Step 6: Apply the rule and get recommendation
    steps.push({
        content: `Recommend(${name}, ${career.path})`,
        status: `🎯 推荐结果：建议从事 ${career.path}`
    });

    // Display steps with animation
    steps.forEach((step, index) => {
        setTimeout(() => {
            addReasoningStep(index + 1, step.content, step.status);

            // Show final recommendation after all steps
            if (index === steps.length - 1) {
                setTimeout(() => {
                    showRecommendation(name, major, interest, ability, career, isNationalNeed);
                }, 300);
            }
        }, index * 400);
    });
}

// ===== Add Reasoning Step =====
function addReasoningStep(num, content, status) {
    const stepsContainer = document.getElementById('reasoningSteps');

    const stepDiv = document.createElement('div');
    stepDiv.className = 'reasoning-step';
    stepDiv.innerHTML = `
        <div>
            <span class="step-number">${num}</span>
            <span class="step-content">${content}</span>
        </div>
        <div class="step-status success">${status}</div>
    `;

    stepsContainer.appendChild(stepDiv);
}

// ===== Show Recommendation =====
function showRecommendation(name, major, interest, ability, career, isNationalNeed) {
    const resultArea = document.getElementById('resultArea');
    const resultCard = document.getElementById('recommendationResult');

    resultArea.style.display = 'block';

    const nationalMatch = isNationalNeed
        ? '恭喜！您的专业是国家战略急需领域，您将在服务国家中实现个人价值！'
        : '您的专业虽非优先战略领域，但同样可以为国家发展做出重要贡献！';

    resultCard.innerHTML = `
        <div class="recommendation-header">
            <span class="recommendation-icon">${career.icon}</span>
            <h3 class="recommendation-title">职业推荐</h3>
            <p class="recommendation-subtitle">${nationalMatch}</p>
        </div>
        
        <div class="recommendation-body">
            <div class="career-path">${career.path}</div>
            <p class="career-desc">${career.desc}</p>
            
            <div class="match-details">
                <div class="match-item">
                    <span class="match-icon">🎓</span>
                    <span class="match-text"><strong>专业：</strong>${major}</span>
                </div>
                <div class="match-item">
                    <span class="match-icon">❤️</span>
                    <span class="match-text"><strong>兴趣：</strong>${interest}</span>
                </div>
                <div class="match-item">
                    <span class="match-icon">💪</span>
                    <span class="match-text"><strong>能力：</strong>${ability}</span>
                </div>
            </div>
        </div>
        
        <div class="recommendation-footer">
            <p><strong>🇨🇳 国家贡献：</strong>${career.contribution}</p>
            <p style="margin-top:15px; color:#de2910; font-weight:600;">
                "青年兴则国家兴，青年强则国家强。广大青年要坚定理想信念，志存高远，脚踏实地，勇做时代的弄潮儿。"
            </p>
        </div>
    `;

    // Scroll to result
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== Expose functions for debugging =====
window.performAnalysis = performAnalysis;
