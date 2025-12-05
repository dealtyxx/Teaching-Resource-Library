// ============================================
// 全局状态管理
// ============================================
let currentType = 'unary';
let currentCaseIndex = 0;
let isAnimating = false;

// ============================================
// 定义与概念数据
// ============================================
const DEFINITIONS = {
    'unary': {
        title: '一元运算 (Unary Operation)',
        content: '一元运算是从集合A到A的映射，即对集合中的每个元素进行一次变换。',
        formula: 'f: A → A\n对于 ∀a∈A, 存在唯一的 f(a)∈A',
        examples: '取负运算、求补运算、递增递减'
    },
    'binary': {
        title: '二元运算 (Binary Operation)',
        content: '二元运算是从集合A×A到A的映射，将两个元素结合成一个元素。',
        formula: '∘: A×A → A\n对于 ∀a,b∈A, 存在唯一的 a∘b∈A',
        examples: '加法、乘法、取模运算'
    },
    'n-ary': {
        title: 'n元运算 (n-ary Operation)',
        content: 'n元运算是从集合Aⁿ到A的映射，将n个元素结合成一个元素。',
        formula: 'f: Aⁿ → A\n对于 ∀a₁,a₂,...,aₙ∈A, 存在唯一的 f(a₁,a₂,...,aₙ)∈A',
        examples: '投票选举、多数表决、加权平均'
    },
    'system': {
        title: '代数系统 (Algebraic System)',
        content: '代数系统是一个集合与定义在该集合上的若干运算组成的系统，记作<A, ∘₁, ∘₂, ..., ∘ₙ>。',
        formula: '<A, ∘> 其中:\nA是非空集合(载体)\n∘是定义在A上的运算',
        examples: '<ℤ,+>, <ℝ,+,×>, 群、环、域'
    }
};

// ============================================
// 案例数据
// ============================================
const CASES = [
    {
        type: 'unary',
        name: '干部轮岗制 - 一元运算',
        set: ['基层', '中层', '高层'],
        operation: (a) => {
            const rotation = { '基层': '中层', '中层': '高层', '高层': '基层' };
            return rotation[a];
        },
        symbol: 'rotate',
        description: '对干部进行岗位轮换',
        philosophy: '干部轮岗制体现了一元运算的思想:每个岗位都有对应的下一个岗位。这种"映射"保证了干部队伍的流动性和活力。习近平总书记强调"让干部在不同岗位、不同环境中磨练成长"。轮岗不是简单的位置变换,而是能力的全面提升。一元运算的封闭性告诉我们:无论如何轮换,干部都在组织体系内成长,始终服务于人民事业。',
        properties: {
            closure: true,
            associative: false,
            commutative: false,
            identity: false,
            inverse: false
        }
    },
    {
        type: 'unary',
        name: '态度转化 - 补运算',
        set: ['支持', '中立', '反对'],
        operation: (a) => {
            const complement = { '支持': '反对', '中立': '中立', '反对': '支持' };
            return complement[a];
        },
        symbol: '¬',
        description: '意见的对立面',
        philosophy: '补运算揭示了对立统一规律。在民主决策中,我们要听取不同声音,包括反对意见。毛泽东说"兼听则明,偏信则暗"。补运算的特点是两次补运算回到原点——这启示我们:批评与自我批评要适度,过度否定会走向反面。中立的补运算仍是中立,说明客观中立是稳定的基点。',
        properties: {
            closure: true,
            associative: false,
            commutative: false,
            identity: false,
            inverse: true
        }
    },
    {
        type: 'binary',
        name: '民主集中 - 二元运算',
        set: ['个人意见', '集体决议', '上级指示', '群众呼声'],
        operation: (a, b) => {
            // 民主集中:综合两种意见形成决议
            if (a === b) return a;
            if (a === '上级指示' || b === '上级指示') return '集体决议';
            if (a === '群众呼声' || b === '群众呼声') return '集体决议';
            return '集体决议';
        },
        symbol: '⊕',
        description: '将两个意见综合成统一决议',
        philosophy: '民主集中制是我们党的根本组织原则。二元运算"⊕"象征着将不同意见综合成集体决议的过程。运算的封闭性保证了无论有多少不同意见,最终都要形成统一决议。交换律意味着无论谁先发言,都应公平对待。结合律说明可以逐步综合多个意见。这体现了"从群众中来,到群众中去"的工作方法。',
        properties: {
            closure: true,
            associative: true,
            commutative: true,
            identity: false,
            inverse: false
        }
    },
    {
        type: 'binary',
        name: '资源协调 - 最小值运算',
        set: [10, 20, 30, 40, 50],
        operation: (a, b) => Math.min(a, b),
        symbol: 'min',
        description: '两地资源协调,取短板',
        philosophy: '木桶原理告诉我们:决定水桶容量的是最短的那块板。在区域协调发展中,min运算揭示了"短板"思维:两地合作的成效取决于发展较慢的一方。习近平总书记强调"全面建成小康社会,一个不能少"。这个运算提醒我们:要关注薄弱环节,补齐短板,实现共同富裕。最小值运算满足交换律和结合律,说明无论从哪个角度看,短板都是短板。',
        properties: {
            closure: true,
            associative: true,
            commutative: true,
            identity: true,
            inverse: false
        }
    },
    {
        type: 'binary',
        name: '政策叠加 - 模运算',
        set: [0, 1, 2, 3, 4],
        operation: (a, b) => (a + b) % 5,
        symbol: '+₅',
        description: '政策效应叠加(模5)',
        philosophy: '模运算体现了"螺旋式上升"的发展观。政策效应不是线性叠加,而是周期性循环上升。比如五年计划:每个五年都有新起点,但又承接上一个五年。模5运算形成的循环群,象征着发展的周期性和规律性。0是单位元,代表"无为而治"的基准状态。每个元素都有逆元,意味着政策可调整、可纠偏。这是辩证法的数学体现。',
        properties: {
            closure: true,
            associative: true,
            commutative: true,
            identity: true,
            inverse: true
        }
    },
    {
        type: 'n-ary',
        name: '三级审批 - 三元运算',
        set: ['通过', '驳回'],
        operation: (...args) => {
            // 三级审批:至少两级通过才最终通过
            const passCount = args.filter(x => x === '通过').length;
            return passCount >= 2 ? '通过' : '驳回';
        },
        arity: 3,
        symbol: 'approve',
        description: '多级审批系统(三级审批)',
        philosophy: '三级审批制体现了"民主与集中相结合"的原则。三元运算要求至少两级通过,防止了个人专断,也避免了效率过低。这是"少数服从多数"在制度设计中的体现。毛泽东说"一个人说了不算,两个人说了也不一定算,三个人商量着办才靠谱"。n元运算的复杂性提醒我们:决策不是简单的是非判断,而是多方博弈的结果。',
        properties: {
            closure: true,
            associative: false,
            commutative: true,
            identity: false,
            inverse: false
        }
    },
    {
        type: 'n-ary',
        name: '民主投票 - 多数表决',
        set: ['赞成', '反对', '弃权'],
        operation: (...args) => {
            // 统计票数,多数胜出
            const counts = {};
            args.forEach(vote => {
                counts[vote] = (counts[vote] || 0) + 1;
            });
            let maxVote = args[0];
            let maxCount = 0;
            for (let vote in counts) {
                if (counts[vote] > maxCount) {
                    maxCount = counts[vote];
                    maxVote = vote;
                }
            }
            return maxVote;
        },
        arity: 5,
        symbol: 'vote',
        description: '民主投票系统(5人投票)',
        philosophy: '民主投票是n元运算的典型应用。"少数服从多数,多数照顾少数"——这是民主集中制的核心。投票运算满足交换律(无论谁先投,结果相同),但不满足结合律(分批统计可能失真)。这提醒我们:民主程序要一次性、整体性进行,不能分割。弃权票的存在体现了"沉默的权利",但过多弃权会导致决策合法性不足。',
        properties: {
            closure: true,
            associative: false,
            commutative: true,
            identity: false,
            inverse: false
        }
    },
    {
        type: 'system',
        name: '组织体系 - 群结构',
        set: ['书记', '副书记', '委员', '党员'],
        operations: [
            {
                name: '提拔',
                func: (a) => {
                    const promotion = { '党员': '委员', '委员': '副书记', '副书记': '书记', '书记': '书记' };
                    return promotion[a];
                }
            },
            {
                name: '合作',
                func: (a, b) => {
                    const level = { '书记': 4, '副书记': 3, '委员': 2, '党员': 1 };
                    const combined = Math.max(level[a], level[b]);
                    const reverse = { 4: '书记', 3: '副书记', 2: '委员', 1: '党员' };
                    return reverse[combined];
                }
            }
        ],
        description: '党组织层级体系',
        philosophy: '代数系统<A,∘₁,∘₂>完整描述了组织结构。集合A是组织成员,运算∘₁是晋升机制,运算∘₂是协作机制。群的性质——封闭性(干部来自组织)、结合律(逐级晋升)、单位元(党员是基础)、逆元(可降级)——完美映射了组织规律。这不是机械类比,而是揭示了组织运行的数学本质。列宁说"组织是力量的保证",代数系统正是这种"保证"的形式化表达。',
        properties: {
            closure: true,
            associative: true,
            commutative: false,
            identity: true,
            inverse: true
        }
    },
    {
        type: 'system',
        name: '经济系统 - 环结构',
        set: ['生产', '流通', '分配', '消费'],
        operations: [
            {
                name: '加法(扩大)',
                func: (a, b) => {
                    // 循环经济:每个环节都可扩大
                    return `扩大的${a}`;
                }
            },
            {
                name: '乘法(效率)',
                func: (a, b) => {
                    // 效率提升是乘法效应
                    return `高效${a}`;
                }
            }
        ],
        description: '社会主义市场经济体系',
        philosophy: '环结构<A,+,×>是代数系统的高级形式,完美对应经济体系。"+"代表规模扩张(外延),"×"代表效率提升(内涵)。分配律a×(b+c)=a×b+a×c揭示了"先做大蛋糕,再分好蛋糕"的逻辑。环的加法交换律说明生产和消费可以相互转化;乘法分配律说明技术进步(乘法)对各环节均有效。这是马克思政治经济学的数学表达,体现了生产力和生产关系的辩证统一。',
        properties: {
            closure: true,
            associative: true,
            commutative: true,
            identity: true,
            inverse: true
        }
    }
];

// ============================================
// 运算表生成
// ============================================
function generateOperationTable(caseData) {
    const table = document.getElementById('operationTable');

    if (caseData.type === 'unary') {
        // 一元运算表
        let html = '<table><tr><th>元素</th><th>结果</th></tr>';
        caseData.set.forEach(element => {
            const result = caseData.operation(element);
            html += `<tr><td>${element}</td><td>${result}</td></tr>`;
        });
        html += '</table>';
        table.innerHTML = html;
    } else if (caseData.type === 'binary') {
        // 二元运算表
        let html = '<table><tr><th>' + caseData.symbol + '</th>';
        caseData.set.forEach(el => {
            html += `<th>${el}</th>`;
        });
        html += '</tr>';

        caseData.set.forEach(row => {
            html += `<tr><th>${row}</th>`;
            caseData.set.forEach(col => {
                const result = caseData.operation(row, col);
                html += `<td>${result}</td>`;
            });
            html += '</tr>';
        });
        html += '</table>';
        table.innerHTML = html;
    } else if (caseData.type === 'n-ary') {
        // n元运算示例
        table.innerHTML = `<em style="color: var(--text-secondary);">
            ${caseData.arity}元运算，从 ${caseData.set.join(', ')} 中选择${caseData.arity}个元素进行运算
        </em>`;
    } else if (caseData.type === 'system') {
        // 代数系统
        table.innerHTML = `<div style="line-height: 1.6;">
            <strong style="color: var(--accent-red);">载体集合 A:</strong><br>
            {${caseData.set.join(', ')}}<br><br>
            <strong style="color: var(--accent-red);">运算:</strong><br>
            ${caseData.operations.map(op => '• ' + op.name).join('<br>')}
        </div>`;
    }
}

// ============================================
// 运算演示
// ============================================
async function demonstrateOperation(caseData) {
    const demoArea = document.getElementById('operationDemo');

    if (caseData.type === 'unary') {
        // 演示一元运算
        const element = caseData.set[Math.floor(Math.random() * caseData.set.length)];
        const result = caseData.operation(element);

        demoArea.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    一元运算演示
                </div>
                <div class="operation-formula">${caseData.symbol}(${element})</div>
                <div class="operation-arrow">⬇</div>
                <div class="operation-result">${result}</div>
                <div style="margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                    ${caseData.description}
                </div>
            </div>
        `;
    } else if (caseData.type === 'binary') {
        // 演示二元运算
        const a = caseData.set[Math.floor(Math.random() * caseData.set.length)];
        const b = caseData.set[Math.floor(Math.random() * caseData.set.length)];
        const result = caseData.operation(a, b);

        demoArea.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    二元运算演示
                </div>
                <div class="operation-formula">${a} ${caseData.symbol} ${b}</div>
                <div class="operation-arrow">⬇</div>
                <div class="operation-result">${result}</div>
                <div style="margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                    ${caseData.description}
                </div>
            </div>
        `;
    } else if (caseData.type === 'n-ary') {
        // 演示n元运算
        const elements = [];
        for (let i = 0; i < caseData.arity; i++) {
            elements.push(caseData.set[Math.floor(Math.random() * caseData.set.length)]);
        }
        const result = caseData.operation(...elements);

        demoArea.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    ${caseData.arity}元运算演示
                </div>
                <div class="operation-formula">${caseData.symbol}(${elements.join(', ')})</div>
                <div class="operation-arrow">⬇</div>
                <div class="operation-result">${result}</div>
                <div style="margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                    ${caseData.description}
                </div>
            </div>
        `;
    } else if (caseData.type === 'system') {
        // 演示代数系统
        const element = caseData.set[Math.floor(Math.random() * caseData.set.length)];
        const op = caseData.operations[0];
        const result = op.func(element);

        demoArea.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    代数系统演示
                </div>
                <div style="font-size: 1.2rem; color: var(--accent-red); margin-bottom: 0.5rem;">
                    &lt;A, ${caseData.operations.map(o => o.name).join(', ')}&gt;
                </div>
                <div class="operation-formula">${op.name}(${element})</div>
                <div class="operation-arrow">⬇</div>
                <div class="operation-result">${result}</div>
                <div style="margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                    ${caseData.description}
                </div>
            </div>
        `;
    }

    // 显示性质
    displayProperties(caseData);
}

// ============================================
// 性质检验显示
// ============================================
function displayProperties(caseData) {
    const panel = document.getElementById('propertiesDisplay');

    const propertyNames = {
        closure: '封闭性',
        associative: '结合律',
        commutative: '交换律',
        identity: '单位元',
        inverse: '逆元'
    };

    let html = '<h4>运算性质</h4>';

    for (let prop in caseData.properties) {
        const holds = caseData.properties[prop];
        html += `
            <div class="property-item">
                <div class="icon ${holds ? 'yes' : 'no'}">
                    ${holds ? '✓' : '✗'}
                </div>
                <span>${propertyNames[prop]}: ${holds ? '满足' : '不满足'}</span>
            </div>
        `;
    }

    panel.innerHTML = html;
}

// ============================================
// 更新定义面板
// ============================================
function updateDefinitionPanel(type) {
    const def = DEFINITIONS[type];
    const panel = document.getElementById('definitionPanel');

    panel.innerHTML = `
        <h3>${def.title}</h3>
        <p>${def.content}</p>
        <div class="formula-box">${def.formula.replace(/\n/g, '<br>')}</div>
        <p style="font-size: 0.8rem; color: var(--accent-gold);">
            <strong>常见例子:</strong> ${def.examples}
        </p>
    `;
}

// ============================================
// 更新案例列表
// ============================================
function updateExamplesList(type) {
    const examples = CASES.filter(c => c.type === type);
    const list = document.getElementById('examplesList');

    list.innerHTML = examples.map((ex, index) => {
        const globalIndex = CASES.indexOf(ex);
        return `
            <div class="example-item" onclick="loadCase(${globalIndex})">
                <div class="example-title">${ex.name}</div>
                <div class="example-desc">${ex.description}</div>
            </div>
        `;
    }).join('');
}

// ============================================
// 加载案例
// ============================================
function loadCase(index) {
    currentCaseIndex = index;
    const caseData = CASES[index];
    currentType = caseData.type;

    // 更新类型按钮
    document.querySelectorAll('.op-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === currentType);
    });

    // 更新案例选择器
    const selector = document.getElementById('caseSelector');
    selector.innerHTML = CASES.map((c, i) =>
        `<option value="${i}" ${i === index ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    // 更新定义面板
    updateDefinitionPanel(currentType);

    // 更新案例列表
    updateExamplesList(currentType);

    // 生成运算表
    generateOperationTable(caseData);

    // 更新思政内涵
    document.getElementById('philosophyPanel').innerHTML =
        `<p style="font-size: 0.85rem; line-height: 1.6;">${caseData.philosophy}</p>`;

    // 清空演示区
    document.getElementById('operationDemo').innerHTML =
        '<div style="color: var(--text-secondary); font-size: 0.9rem;">点击"演示运算"开始</div>';
    document.getElementById('propertiesDisplay').innerHTML =
        '<h4>运算性质</h4><div style="color: var(--text-secondary); font-size: 0.85rem;">演示后显示性质检验</div>';
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 类型切换
    document.querySelectorAll('.op-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            currentType = type;

            // 更新定义面板
            updateDefinitionPanel(type);

            // 更新案例列表
            updateExamplesList(type);

            // 加载第一个匹配的案例
            const firstCase = CASES.findIndex(c => c.type === type);
            if (firstCase !== -1) {
                loadCase(firstCase);
            }
        });
    });

    // 案例选择
    document.getElementById('caseSelector').addEventListener('change', (e) => {
        loadCase(parseInt(e.target.value));
    });

    // 演示按钮
    document.getElementById('demoBtn').addEventListener('click', () => {
        if (!isAnimating) {
            const caseData = CASES[currentCaseIndex];
            demonstrateOperation(caseData);
        }
    });

    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('operationDemo').innerHTML =
            '<div style="color: var(--text-secondary); font-size: 0.9rem;">点击"演示运算"开始</div>';
        document.getElementById('propertiesDisplay').innerHTML =
            '<h4>运算性质</h4><div style="color: var(--text-secondary); font-size: 0.85rem;">演示后显示性质检验</div>';
    });

    // 初始加载
    loadCase(0);
});
