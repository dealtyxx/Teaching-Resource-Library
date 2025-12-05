/**
 * Chinese Poetry Tokenization Visualizer
 * 中华诗词符号化可视化系统
 */

// DOM Elements
const poemSelect = document.getElementById('poemSelect');
const customInputGroup = document.getElementById('customInputGroup');
const customInput = document.getElementById('customInput');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const statusText = document.getElementById('statusText');
const processedCount = document.getElementById('processedCount');
const totalCount = document.getElementById('totalCount');
const originalText = document.getElementById('originalText');
const tokensDisplay = document.getElementById('tokensDisplay');
const treeSvg = document.getElementById('treeSvg');
const treeGroup = document.getElementById('treeGroup');
const predicateFormulas = document.getElementById('predicateFormulas');

// 经典诗词库
const POEMS = [
    {
        title: "《沁园春·雪》",
        author: "毛泽东",
        content: "北国风光,千里冰封,万里雪飘。望长城内外,惟余莽莽;大河上下,顿失滔滔。山舞银蛇,原驰蜡象,欲与天公试比高。",
        theme: "爱国情怀"
    },
    {
        title: "《春望》",
        author: "杜甫",
        content: "国破山河在,城春草木深。感时花溅泪,恨别鸟惊心。烽火连三月,家书抵万金。",
        theme: "忧国忧民"
    },
    {
        title: "《水调歌头》",
        author: "苏轼",
        content: "明月几时有,把酒问青天。不知天上宫阙,今夕是何年。人有悲欢离合,月有阴晴圆缺,此事古难全。",
        theme: "人生哲理"
    },
    {
        title: "《登高》",
        author: "杜甫",
        content: "风急天高猿啸哀,渚清沙白鸟飞回。无边落木萧萧下,不尽长江滚滚来。万里悲秋常作客,百年多病独登台。",
        theme: "人生感悟"
    }
];

// 简单中文分词规则
const WORD_PATTERNS = [
    // 四字词语
    '千里冰封', '万里雪飘', '长城内外', '惟余莽莽', '大河上下', '顿失滔滔',
    '山舞银蛇', '原驰蜡象', '欲与天公', '试比高',
    '国破山河在', '城春草木深', '感时花溅泪', '恨别鸟惊心', '烽火连三月', '家书抵万金',
    '明月几时有', '把酒问青天', '天上宫阙', '今夕是何年', '悲欢离合', '阴晴圆缺', '此事古难全',
    '风急天高', '猿啸哀', '渚清沙白', '鸟飞回', '无边落木', '萧萧下', '不尽长江', '滚滚来',
    '万里悲秋', '常作客', '百年多病', '独登台',
    // 常见词汇
    '北国', '风光', '望', '内外', '上下', '银蛇', '蜡象', '天公',
    '山河', '草木', '花', '泪', '鸟', '惊心', '家书', '万金',
    '明月', '几时', '青天', '不知', '宫阙', '何年', '悲欢', '离合', '圆缺',
    '天高', '清沙', '飞回', '落木', '长江', '悲秋', '作客', '多病', '登台'
];

// State
let currentPoem = null;
let tokens = [];
let isRunning = false;
let shouldStop = false;
let tokenMode = 'word'; // 'word' or 'char'

// Token分类
const TOKEN_CATEGORIES = {
    noun: { name: '名词', color: '#d63b1d', examples: ['北国', '风光', '长城', '山河', '明月'], predicate: 'N' },
    verb: { name: '动词', color: '#ffb400', examples: ['望', '飘', '舞', '驰', '试'], predicate: 'V' },
    adjective: { name: '形容词', color: '#ff8c75', examples: ['急', '高', '清', '白', '深'], predicate: 'A' },
    quantifier: { name: '量词', color: '#8b0000', examples: ['千里', '万里', '三月', '万金'], predicate: 'Q' },
    other: { name: '其他', color: '#a05a5a', examples: ['在', '下', '来', '去'], predicate: 'O' }
};

// 谓词逻辑模板规则
const PREDICATE_RULES = [
    {
        pattern: ['quantifier', 'noun'],
        formula: (tokens) => `∀x(${tokens[0].predicate}(x) → ${tokens[1].predicate}(x))`,
        description: '全称量词修饰个体域',
        example: '千里冰封 → ∀x(千里(x) → 冰封(x))'
    },
    {
        pattern: ['noun', 'verb'],
        formula: (tokens) => `∃x(${tokens[0].predicate}(x) ∧ ${tokens[1].predicate}(x))`,
        description: '存在个体具有谓词性质',
        example: '山河存在 → ∃x(山河(x) ∧ 存在(x))'
    },
    {
        pattern: ['adjective', 'noun'],
        formula: (tokens) => `∀x(${tokens[1].predicate}(x) → ${tokens[0].predicate}(x))`,
        description: '形容词修饰名词个体',
        example: '美丽花朵 → ∀x(花朵(x) → 美丽(x))'
    },
    {
        pattern: ['noun', 'verb', 'noun'],
        formula: (tokens) => `∃x∃y(${tokens[0].predicate}(x) ∧ ${tokens[1].predicate}(x,y) ∧ ${tokens[2].predicate}(y))`,
        description: '二元谓词关系',
        example: '人望月 → ∃x∃y(人(x) ∧ 望(x,y) ∧ 月(y))'
    }
];

// Helper: 获取延迟时间
function getDelay() {
    const val = parseInt(speedInput.value);
    return Math.max(50, 1000 - (val * 10));
}

// Helper: Sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 简单的中文分词函数
function tokenizeText(text, mode) {
    if (mode === 'char') {
        // 字符级切分
        return text.replace(/[,。;!?、,\s]/g, '').split('').map(char => {
            const type = classifyToken(char);
            return {
                text: char,
                type: type,
                predicate: `${TOKEN_CATEGORIES[type].predicate}("${char}")`
            };
        });
    } else {
        // 词语级切分(最大匹配)
        const result = [];
        let i = 0;
        const cleanText = text.replace(/[,。;!?、,\s]/g, '');

        while (i < cleanText.length) {
            let matched = false;
            // 尝试从最长的词开始匹配
            for (let len = 8; len >= 2; len--) {
                const substr = cleanText.substring(i, i + len);
                if (WORD_PATTERNS.includes(substr)) {
                    const type = classifyToken(substr);
                    result.push({
                        text: substr,
                        type: type,
                        predicate: `${TOKEN_CATEGORIES[type].predicate}("${substr}")`
                    });
                    i += len;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                // 单字
                const type = classifyToken(cleanText[i]);
                result.push({
                    text: cleanText[i],
                    type: type,
                    predicate: `${TOKEN_CATEGORIES[type].predicate}("${cleanText[i]}")`
                });
                i++;
            }
        }

        return result;
    }
}

// 简单的词性分类
function classifyToken(token) {
    // 这里用简单规则,实际应用中会用NLP模型
    const firstChar = token[0];

    // 量词特征
    if (token.includes('千') || token.includes('万') || token.includes('百') ||
        token.includes('里') || token.includes('月') || token.includes('年')) {
        return 'quantifier';
    }

    // 动词特征
    const verbs = ['望', '看', '飘', '舞', '驰', '试', '比', '问', '知', '有', '是', '去', '来', '下', '上'];
    if (verbs.includes(firstChar) || verbs.includes(token)) {
        return 'verb';
    }

    // 形容词特征
    const adjectives = ['急', '高', '清', '白', '深', '哀', '大', '小', '多', '少', '长', '短', '古', '新'];
    if (adjectives.includes(firstChar) || adjectives.includes(token)) {
        return 'adjective';
    }

    // 名词(默认)
    const nouns = ['国', '山', '河', '城', '草', '木', '花', '鸟', '月', '天', '地', '人', '风', '雨', '雪'];
    if (nouns.includes(firstChar) || token.length >= 2) {
        return 'noun';
    }

    return 'other';
}

// 渲染原文
function renderOriginalText(text) {
    const poemLines = originalText.querySelector('.poem-lines');
    poemLines.innerHTML = '';

    // 按标点分句
    const sentences = text.split(/([,。;!?、])/);
    let currentLine = document.createElement('div');
    currentLine.className = 'poem-line';

    sentences.forEach((part, idx) => {
        if (part && part.trim()) {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = part;
            currentLine.appendChild(span);

            // 遇到句号或问号换行
            if (part === '。' || part === '?' || part === '!') {
                poemLines.appendChild(currentLine);
                currentLine = document.createElement('div');
                currentLine.className = 'poem-line';
            }
        }
    });

    if (currentLine.childNodes.length > 0) {
        poemLines.appendChild(currentLine);
    }
}

// 渲染Token
function renderTokens() {
    tokensDisplay.innerHTML = '';

    tokens.forEach((token, idx) => {
        const tokenEl = document.createElement('div');
        tokenEl.className = 'token-item';
        tokenEl.dataset.index = idx;
        tokenEl.dataset.type = token.type;

        const category = TOKEN_CATEGORIES[token.type];
        tokenEl.style.setProperty('--token-color', category.color);

        tokenEl.innerHTML = `
            <div class="token-text">${token.text}</div>
            <div class="token-label">${category.name}</div>
        `;

        tokensDisplay.appendChild(tokenEl);
    });
}

// 动画高亮Token
async function animateTokenization() {
    const tokenElements = tokensDisplay.querySelectorAll('.token-item');

    for (let i = 0; i < tokenElements.length; i++) {
        if (shouldStop) break;

        const tokenEl = tokenElements[i];
        tokenEl.classList.add('active');

        processedCount.textContent = i + 1;
        statusText.textContent = `正在处理: ${tokens[i].text} (${TOKEN_CATEGORIES[tokens[i].type].name})`;

        await sleep(getDelay());

        tokenEl.classList.remove('active');
        tokenEl.classList.add('processed');
    }
}

// 渲染树状图
function renderTree() {
    treeGroup.innerHTML = '';

    const width = treeSvg.clientWidth || 800;
    const height = 300;

    // 统计各类型数量
    const stats = {};
    Object.keys(TOKEN_CATEGORIES).forEach(type => {
        stats[type] = tokens.filter(t => t.type === type).length;
    });

    // 根节点
    const rootX = width / 2;
    const rootY = 40;

    drawTreeNode(rootX, rootY, '符号化结果', '#8b0000', 50);

    // 子节点
    const types = Object.keys(TOKEN_CATEGORIES).filter(type => stats[type] > 0);
    const spacing = Math.min(160, (width - 100) / types.length);
    const startX = rootX - ((types.length - 1) * spacing / 2);

    types.forEach((type, idx) => {
        const category = TOKEN_CATEGORIES[type];
        const x = startX + idx * spacing;
        const y = 160;

        // 绘制连线
        drawTreeEdge(rootX, rootY + 50, x, y - 40, category.color);

        // 绘制节点
        drawTreeNode(x, y, `${category.name}\n(${stats[type]})`, category.color, 40);

        // 示例词
        const examples = tokens.filter(t => t.type === type).slice(0, 3);
        if (examples.length > 0) {
            const exampleY = 250;
            const exampleText = examples.map(t => t.text).join(' ');
            drawTreeLabel(x, exampleY, exampleText, category.color);
        }
    });
}

function drawTreeNode(x, y, text, color, r) {
    const circle = createSVGElement('circle', {
        cx: x,
        cy: y,
        r: r,
        fill: color,
        stroke: '#fff',
        'stroke-width': 3,
        filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))'
    });

    const textLines = text.split('\n');
    const textGroup = createSVGElement('g');

    textLines.forEach((line, idx) => {
        const textEl = createSVGElement('text', {
            x: x,
            y: y + (idx - textLines.length / 2 + 0.5) * 16,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            fill: '#fff',
            'font-size': '14',
            'font-weight': 'bold',
            'font-family': 'Noto Serif SC, sans-serif'
        });
        textEl.textContent = line;
        textGroup.appendChild(textEl);
    });

    treeGroup.appendChild(circle);
    treeGroup.appendChild(textGroup);
}

function drawTreeEdge(x1, y1, x2, y2, color) {
    const path = createSVGElement('path', {
        d: `M ${x1} ${y1} Q ${x1} ${(y1 + y2) / 2} ${x2} ${y2}`,
        stroke: color,
        'stroke-width': 2,
        fill: 'none',
        opacity: 0.6
    });
    treeGroup.appendChild(path);
}

function drawTreeLabel(x, y, text, color) {
    const textEl = createSVGElement('text', {
        x: x,
        y: y,
        'text-anchor': 'middle',
        fill: color,
        'font-size': '12',
        'font-family': 'Noto Serif SC, sans-serif'
    });
    textEl.textContent = text;
    treeGroup.appendChild(textEl);
}

function createSVGElement(type, attributes = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    return el;
}

// 谓词逻辑分析
function analyzePredicateLogic(tokens) {
    const formulas = [];

    // 1. 基础原子公式 - 每个token的原子表示
    const atomicFormulas = {
        title: '原子谓词公式',
        description: '每个词语/字符的基础谓词表示',
        items: tokens.slice(0, 8).map(token => ({
            original: token.text,
            formula: token.predicate,
            color: TOKEN_CATEGORIES[token.type].color
        }))
    };
    formulas.push(atomicFormulas);

    // 2. 量词域的处理
    const quantifierTokens = tokens.filter(t => t.type === 'quantifier');
    if (quantifierTokens.length > 0) {
        formulas.push({
            title: '全称量词域',
            description: '量词表示的个体域范围',
            items: quantifierTokens.slice(0, 3).map(token => ({
                original: token.text,
                formula: `∀x ∈ Domain(${token.text})`,
                color: TOKEN_CATEGORIES.quantifier.color
            }))
        });
    }

    // 3. 存在性谓词
    const nounTokens = tokens.filter(t => t.type === 'noun');
    if (nounTokens.length > 0) {
        formulas.push({
            title: '个体存在性',
            description: '名词表示的个体域',
            items: nounTokens.slice(0, 4).map(token => ({
                original: token.text,
                formula: `∃x(${TOKEN_CATEGORIES.noun.predicate}("${token.text}", x))`,
                color: TOKEN_CATEGORIES.noun.color
            }))
        });
    }

    // 4. 复合谓词关系
    const compositeFormulas = [];
    for (let i = 0; i < tokens.length - 1 && compositeFormulas.length < 3; i++) {
        const pair = [tokens[i], tokens[i + 1]];
        const typePattern = pair.map(t => t.type);

        // 量词+名词
        if (typePattern[0] === 'quantifier' && typePattern[1] === 'noun') {
            compositeFormulas.push({
                original: pair.map(t => t.text).join(''),
                formula: `∀x(${pair[0].predicate.split('(')[0]}(x) → ${pair[1].predicate.split('(')[0]}(x))`,
                color: '#8b0000'
            });
        }
        // 形容词+名词
        else if (typePattern[0] === 'adjective' && typePattern[1] === 'noun') {
            compositeFormulas.push({
                original: pair.map(t => t.text).join(''),
                formula: `∀x(${pair[1].predicate.split('(')[0]}(x) → ${pair[0].predicate.split('(')[0]}(x))`,
                color: '#ff8c75'
            });
        }
        // 名词+动词
        else if (typePattern[0] === 'noun' && typePattern[1] === 'verb') {
            compositeFormulas.push({
                original: pair.map(t => t.text).join(''),
                formula: `∃x(${pair[0].predicate.split('(')[0]}(x) ∧ ${pair[1].predicate.split('(')[0]}(x))`,
                color: '#ffb400'
            });
        }
    }

    if (compositeFormulas.length > 0) {
        formulas.push({
            title: '复合谓词关系',
            description: '词语组合的逻辑关系',
            items: compositeFormulas
        });
    }

    // 5. 完整语句逻辑表达
    if (tokens.length >= 3) {
        const sentence = tokens.slice(0, 5).map(t => t.text).join('');
        const variables = ['x', 'y', 'z', 'w', 'v'];
        const predicates = tokens.slice(0, 5).map((t, idx) =>
            `${TOKEN_CATEGORIES[t.type].predicate}${idx}(${variables[idx]})`
        ).join(' ∧ ');

        formulas.push({
            title: '整句逻辑表达',
            description: '完整语义的谓词逻辑形式化',
            items: [{
                original: sentence,
                formula: `∃x∃y∃z(${predicates.substring(0, 60)}...)`,
                color: '#d63b1d'
            }]
        });
    }

    return formulas;
}

// 渲染谓词公式
async function renderPredicateFormulas(formulas) {
    predicateFormulas.innerHTML = '';

    for (const section of formulas) {
        await sleep(getDelay() * 0.5);

        const sectionEl = document.createElement('div');
        sectionEl.className = 'formula-section';

        const titleEl = document.createElement('div');
        titleEl.className = 'formula-section-title';
        titleEl.textContent = section.title;

        const descEl = document.createElement('div');
        descEl.className = 'formula-section-desc';
        descEl.textContent = section.description;

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'formula-items';

        sectionEl.appendChild(titleEl);
        sectionEl.appendChild(descEl);
        sectionEl.appendChild(itemsContainer);
        predicateFormulas.appendChild(sectionEl);

        // 动画添加每个公式
        for (const item of section.items) {
            await sleep(getDelay() * 0.3);

            const itemEl = document.createElement('div');
            itemEl.className = 'formula-item';
            itemEl.style.setProperty('--formula-color', item.color);

            itemEl.innerHTML = `
                <div class="formula-original">${item.original}</div>
                <div class="formula-arrow">⟹</div>
                <div class="formula-logic">${item.formula}</div>
            `;

            itemsContainer.appendChild(itemEl);

            // 触发动画
            setTimeout(() => itemEl.classList.add('visible'), 10);
        }
    }
}

// 主流程
async function startVisualization() {
    if (isRunning) return;

    isRunning = true;
    shouldStop = false;
    startBtn.disabled = true;
    poemSelect.disabled = true;

    // 获取文本
    let text;
    if (poemSelect.value === 'custom') {
        text = customInput.value.trim();
        if (!text) {
            alert('请输入文本!');
            resetVisualization();
            return;
        }
        currentPoem = { content: text };
    } else {
        currentPoem = POEMS[parseInt(poemSelect.value)];
        text = currentPoem.content;
    }

    // 分词
    statusText.textContent = '正在进行符号化...';
    tokens = tokenizeText(text, tokenMode);
    totalCount.textContent = tokens.length;
    processedCount.textContent = 0;

    // 渲染
    renderOriginalText(text);
    renderTokens();

    await sleep(500);

    // 动画
    await animateTokenization();

    if (!shouldStop) {
        statusText.textContent = '符号化完成! 正在生成谓词逻辑公式...';
        await sleep(500);

        // 生成谓词逻辑公式
        const predicateAnalysis = analyzePredicateLogic(tokens);
        await renderPredicateFormulas(predicateAnalysis);

        statusText.textContent = '谓词分析完成! 正在生成分类树...';
        await sleep(300);
        renderTree();
        statusText.textContent = `完成! 共处理 ${tokens.length} 个符号单元,生成 ${predicateAnalysis.reduce((sum, s) => sum + s.items.length, 0)} 条谓词公式`;
    }

    isRunning = false;
    startBtn.disabled = false;
    poemSelect.disabled = false;
}

function resetVisualization() {
    shouldStop = true;
    isRunning = false;

    originalText.querySelector('.poem-lines').innerHTML = '';
    tokensDisplay.innerHTML = '';
    treeGroup.innerHTML = '';
    predicateFormulas.innerHTML = '';

    processedCount.textContent = '0';
    totalCount.textContent = '0';
    statusText.textContent = '准备开始符号化';

    startBtn.disabled = false;
    poemSelect.disabled = false;
}

// 事件监听
poemSelect.addEventListener('change', () => {
    if (poemSelect.value === 'custom') {
        customInputGroup.style.display = 'flex';
    } else {
        customInputGroup.style.display = 'none';
    }
    resetVisualization();
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        tokenMode = e.target.dataset.mode;
        resetVisualization();
    });
});

startBtn.addEventListener('click', startVisualization);
resetBtn.addEventListener('click', resetVisualization);

// 初始化
window.addEventListener('load', () => {
    currentPoem = POEMS[0];
    renderOriginalText(currentPoem.content);
});
