/**
 * 群同态与同构可视化系统
 * Group Homomorphism & Isomorphism Visualization
 */

// DOM Elements
const conceptButtons = document.querySelectorAll('.concept-btn');
const mappingSelect = document.getElementById('mappingSelect');
const sourceElements = document.getElementById('sourceElements');
const targetElements = document.getElementById('targetElements');
const sourceTitle = document.getElementById('sourceTitle');
const targetTitle = document.getElementById('targetTitle');
const mappingName = document.getElementById('mappingName');
const propHomomorphism = document.getElementById('propHomomorphism');
const propInjective = document.getElementById('propInjective');
const propSurjective = document.getElementById('propSurjective');
const propIsomorphism = document.getElementById('propIsomorphism');
const kernelValue = document.getElementById('kernelValue');
const kernelDesc = document.getElementById('kernelDesc');
const conceptTitle = document.getElementById('conceptTitle');
const conceptContent = document.getElementById('conceptContent');
const mainTitle = document.getElementById('mainTitle');
const mainSubtitle = document.getElementById('mainSubtitle');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const ideologyTitle = document.getElementById('ideologyTitle');
const ideologyText = document.getElementById('ideologyText');
const analogyText = document.getElementById('analogyText');
const animateBtn = document.getElementById('animateBtn');
const resetBtn = document.getElementById('resetBtn');

// State
let currentConcept = 'homomorphism';
let currentMapping = 'mod6';

// Concept Data
const CONCEPTS = {
    homomorphism: {
        name: '群同态',
        nameEn: 'Homomorphism',
        title: '组织协作',
        quote: '"互学互鉴，交流合作，美美与共，天下大同。"',
        author: '— 现代外交理念',
        ideology: '群同态体现了组织间的协作精神。不同组织虽有各自特色，但通过保持"运算规则"的一致性，可以实现有效沟通和互相学习。',
        analogy: '如同国际合作中的"互学互鉴"，各国保持自身特色的同时，通过共同遵守的规则（保持运算）实现有效交流。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 映射φ:G→H满足φ(ab)=φ(a)φ(b)。</p>
            <p><strong>核心思想:</strong> 保持运算结构的映射。</p>
            <p><strong>社会意义:</strong> 组织间的有效沟通机制。</p>
        `
    },
    monomorphism: {
        name: '单群同态',
        nameEn: 'Monomorphism',
        title: '忠诚传达',
        quote: '"言必信，行必果。"',
        author: '— 《论语·子路》',
        ideology: '单群同态是单射的同态，象征着信息的忠诚传递。每个源信息都有唯一对应的目标，不会产生混淆或失真。',
        analogy: '如同忠实的翻译，准确传达每一个概念，不会将不同的原意翻译成相同的词汇，保证信息的准确性。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 单射的群同态，Ker(φ)={e}。</p>
            <p><strong>核心特征:</strong> 不同元素映射到不同元素。</p>
            <p><strong>社会意义:</strong> 信息无损、忠实传递。</p>
        `
    },
    epimorphism: {
        name: '满群同态',
        nameEn: 'Epimorphism',
        title: '全覆盖服务',
        quote: '"为人民服务，一个都不能少。"',
        author: '— 服务理念',
        ideology: '满群同态是满射的同态，体现了服务的全覆盖性。目标群的每个元素都能被触及，确保没有遗漏。',
        analogy: '如同精准扶贫政策，确保每一个需要帮助的对象都能得到服务，不遗漏任何一个群体。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 满射的群同态，Im(φ)=H。</p>
            <p><strong>核心特征:</strong> 目标群的每个元素都有原像。</p>
            <p><strong>社会意义:</strong> 服务全覆盖，不遗漏。</p>
        `
    },
    isomorphism: {
        name: '群同构',
        nameEn: 'Isomorphism',
        title: '平等伙伴',
        quote: '"求同存异，互利共赢。"',
        author: '— 外交智慧',
        ideology: '群同构是既单又满的同态，代表两个组织本质上相同。虽然表面形式可能不同，但结构完全一致，可以建立平等的伙伴关系。',
        analogy: '如同不同国家间的平等合作，虽然文化背景不同，但在共同价值观和合作机制上达成一致，形成真正的伙伴关系。',
        conceptInfo: `
            <p><strong>数学定义:</strong> 双射的群同态，有逆映射。</p>
            <p><strong>核心特征:</strong> 两个群结构完全相同。</p>
            <p><strong>社会意义:</strong> 平等伙伴关系，互利共赢。</p>
        `
    },
    kernel: {
        name: '同态核',
        nameEn: 'Kernel',
        title: '核心价值观',
        quote: '"守正创新，不忘本来。"',
        author: '— 文化传承理念',
        ideology: '同态核包含所有映射到单位元的元素，象征着在变革中保持不变的核心价值观。无论如何映射，这些核心理念始终如一。',
        analogy: '如同组织变革中的核心价值观，无论外部环境如何变化，始终坚守的根本原则和初心使命。',
        conceptInfo: `
            <p><strong>数学定义:</strong> Ker(φ)={g∈G|φ(g)=e'}。</p>
            <p><strong>核心特征:</strong> 映射到单位元的所有元素。</p>
            <p><strong>社会意义:</strong> 变革中不变的核心理念。</p>
        `
    }
};

// Mapping Examples
const MAPPINGS = {
    mod6: {
        name: 'ℤ → ℤ₆',
        fullName: '整数模6映射',
        sourceGroup: 'ℤ',
        targetGroup: 'ℤ₆',
        sourceElements: [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6],
        targetElements: [0, 1, 2, 3, 4, 5],
        map: (n) => ((n % 6) + 6) % 6,
        isInjective: false,
        isSurjective: true,
        kernel: '6ℤ = {..., -12, -6, 0, 6, 12, ...}',
        kernelDesc: '所有6的倍数'
    },
    sign: {
        name: 'S₃ → {±1}',
        fullName: '符号映射',
        sourceGroup: 'S₃',
        targetGroup: '{+1, -1}',
        sourceElements: ['e', 'r', 'r²', 's', 'sr', 'sr²'],
        targetElements: ['+1', '-1'],
        map: (perm) => {
            const even = ['e', 'r', 'r²'];
            return even.includes(perm) ? '+1' : '-1';
        },
        isInjective: false,
        isSurjective: true,
        kernel: 'A₃ = {e, r, r²}',
        kernelDesc: '所有偶置换（交错群）'
    },
    det: {
        name: 'GL₂ → ℝ*',
        fullName: '行列式映射',
        sourceGroup: 'GL₂(ℝ)',
        targetGroup: 'ℝ*',
        sourceElements: ['A₁', 'A₂', 'A₃', 'A₄', 'A₅'],
        targetElements: ['r₁', 'r₂', 'r₃', 'r₄', 'r₅'],
        map: null,
        isInjective: false,
        isSurjective: true,
        kernel: 'SL₂(ℝ)',
        kernelDesc: '所有行列式为1的矩阵'
    },
    inclusion: {
        name: 'ℤ → ℚ',
        fullName: '包含映射',
        sourceGroup: 'ℤ',
        targetGroup: 'ℚ',
        sourceElements: [-2, -1, 0, 1, 2, 3, 4],
        targetElements: ['...', '-1', '0', '1/2', '1', '3/2', '2', '...'],
        map: (n) => n,
        isInjective: true,
        isSurjective: false,
        kernel: '{0}',
        kernelDesc: '只有单位元（平凡核）'
    }
};

// Initialization
window.addEventListener('load', () => {
    updateMapping('mod6');
    updateConcept('homomorphism');
    attachEventListeners();
});

// Update Mapping
function updateMapping(mappingId) {
    currentMapping = mappingId;
    const mapping = MAPPINGS[mappingId];

    // Update titles
    sourceTitle.textContent = `源群 ${mapping.sourceGroup}`;
    targetTitle.textContent = `目标群 ${mapping.targetGroup}`;
    mappingName.textContent = 'φ';

    // Render elements
    renderMappingVisualization(mapping);

    // Update properties
    updateProperties(mapping);

    // Update kernel
    kernelValue.textContent = mapping.kernel;
    kernelDesc.textContent = mapping.kernelDesc;
}

// Render Mapping Visualization - 根据当前概念类型选择不同的可视化
function renderMappingVisualization(mapping) {
    if (currentConcept === 'homomorphism') {
        renderGeneralHomomorphism(mapping);
    } else if (currentConcept === 'monomorphism') {
        renderMonomorphism(mapping);
    } else if (currentConcept === 'epimorphism') {
        renderEpimorphism(mapping);
    } else if (currentConcept === 'isomorphism') {
        renderIsomorphism(mapping);
    } else if (currentConcept === 'kernel') {
        renderKernelVisualization(mapping);
    }
}

// 一般同态：显示所有映射关系
function renderGeneralHomomorphism(mapping) {
    sourceElements.innerHTML = '';
    targetElements.innerHTML = '';

    mapping.sourceElements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';
        div.textContent = el;
        div.dataset.value = el;
        sourceElements.appendChild(div);
    });

    mapping.targetElements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';
        div.textContent = el;
        div.dataset.value = el;
        targetElements.appendChild(div);
    });

    drawMappingArrows(mapping);
}

// 单同态：强调一对一映射
function renderMonomorphism(mapping) {
    sourceElements.innerHTML = '';
    targetElements.innerHTML = '';

    const sourceSubset = mapping.sourceElements.slice(0, Math.min(mapping.sourceElements.length, 5));

    sourceSubset.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';
        if (mapping.isInjective) {
            div.classList.add('injective-highlight');
        }
        div.textContent = el;
        div.dataset.value = el;
        div.innerHTML = `<strong>${el}</strong><br><small>唯一</small>`;
        sourceElements.appendChild(div);
    });

    mapping.targetElements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';
        div.textContent = el;
        div.dataset.value = el;
        targetElements.appendChild(div);
    });

    drawMappingArrows(mapping, 'injective');
}

// 满同态：强调覆盖所有目标
function renderEpimorphism(mapping) {
    sourceElements.innerHTML = '';
    targetElements.innerHTML = '';

    mapping.sourceElements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';
        div.textContent = el;
        div.dataset.value = el;
        sourceElements.appendChild(div);
    });

    mapping.targetElements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';
        if (mapping.isSurjective) {
            div.classList.add('surjective-highlight');
        }
        div.textContent = el;
        div.dataset.value = el;
        div.innerHTML = `<strong>${el}</strong><br><small>被覆盖</small>`;
        targetElements.appendChild(div);
    });

    drawMappingArrows(mapping, 'surjective');
}

// 同构：双向箭头，突出一一对应
function renderIsomorphism(mapping) {
    sourceElements.innerHTML = '';
    targetElements.innerHTML = '';

    const isIso = mapping.isInjective && mapping.isSurjective;

    mapping.sourceElements.forEach((el, index) => {
        const div = document.createElement('div');
        div.className = 'element-item';
        if (isIso) {
            div.classList.add('iso-highlight');
        }
        div.textContent = el;
        div.dataset.value = el;
        sourceElements.appendChild(div);
    });

    mapping.targetElements.forEach((el, index) => {
        const div = document.createElement('div');
        div.className = 'element-item';
        if (isIso) {
            div.classList.add('iso-highlight');
        }
        div.textContent = el;
        div.dataset.value = el;
        targetElements.appendChild(div);
    });

    if (isIso) {
        drawMappingArrows(mapping, 'bidirectional');
    } else {
        drawMappingArrows(mapping);
    }
}

// 同态核：突出显示核元素
function renderKernelVisualization(mapping) {
    sourceElements.innerHTML = '';
    targetElements.innerHTML = '';

    mapping.sourceElements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';

        let mappedValue = null;
        if (mapping.map) {
            if (currentMapping === 'mod6') {
                mappedValue = mapping.map(parseInt(el));
            } else if (currentMapping === 'sign') {
                mappedValue = mapping.map(el);
            } else if (currentMapping === 'inclusion') {
                mappedValue = mapping.map(el);
            }
        }

        // 判断是否在核中（映射到单位元）
        const isInKernel = (mappedValue === 0 || mappedValue === '+1' || el === 0 || el === 'e');

        if (isInKernel) {
            div.classList.add('kernel-element');
            div.innerHTML = `<strong>${el}</strong><br><small>核元素</small>`;
        } else {
            div.textContent = el;
        }

        div.dataset.value = el;
        sourceElements.appendChild(div);
    });

    // 目标群：突出显示单位元
    mapping.targetElements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';

        const isIdentity = (el === 0 || el === '+1' || el === '0' || el === 'r₁');
        if (isIdentity) {
            div.classList.add('identity-element');
            div.innerHTML = `<strong>${el}</strong><br><small>单位元</small>`;
        } else {
            div.textContent = el;
        }

        div.dataset.value = el;
        targetElements.appendChild(div);
    });

    drawMappingArrows(mapping, 'kernel');
}

// 绘制映射箭头
function drawMappingArrows(mapping, style = 'normal') {
    const arrowsGroup = document.getElementById('arrowsGroup');
    arrowsGroup.innerHTML = '';

    // SVG基本设置
    const svg = document.getElementById('mappingSvg');
    const svgRect = svg.getBoundingClientRect();

    const sourceEls = document.querySelectorAll('#sourceElements .element-item');
    const targetEls = document.querySelectorAll('#targetElements .element-item');

    const COLOR_NORMAL = '#4ecdc4';
    const COLOR_INJECTIVE = '#10b981';
    const COLOR_SURJECTIVE = '#f59e0b';
    const COLOR_ISO = '#8b5cf6';
    const COLOR_KERNEL = '#d63b1d';

    sourceEls.forEach((sourceEl, index) => {
        const sourceValue = sourceEl.dataset.value;

        let targetValue = null;
        if (mapping.map) {
            if (currentMapping === 'mod6') {
                targetValue = mapping.map(parseInt(sourceValue));
            } else if (currentMapping === 'inclusion') {
                targetValue = sourceValue;
            } else if (currentMapping === 'sign') {
                targetValue = mapping.map(sourceValue);
            }
        }

        targetEls.forEach(targetEl => {
            if (targetEl.dataset.value == targetValue) {
                const sourceRect = sourceEl.getBoundingClientRect();
                const targetRect = targetEl.getBoundingClientRect();

                const x1 = sourceRect.left + sourceRect.width / 2 - svgRect.left;
                const y1 = sourceRect.bottom - svgRect.top - 140;
                const x2 = targetRect.left + targetRect.width / 2 - svgRect.left;
                const y2 = targetRect.top - svgRect.top - 140;

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const d = `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - 30} ${x2} ${y2}`;
                path.setAttribute('d', d);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke-width', style === 'kernel' && targetValue === 0 ? '3' : '1.5');

                let strokeColor = COLOR_NORMAL;
                if (style === 'injective') strokeColor = COLOR_INJECTIVE;
                else if (style === 'surjective') strokeColor = COLOR_SURJECTIVE;
                else if (style === 'bidirectional') strokeColor = COLOR_ISO;
                else if (style === 'kernel') strokeColor = targetValue === 0 ? COLOR_KERNEL : COLOR_NORMAL;

                path.setAttribute('stroke', strokeColor);
                path.setAttribute('opacity', '0.6');
                path.setAttribute('marker-end', 'url(#arrowMarker)');

                arrowsGroup.appendChild(path);

                // 同构添加双向箭头
                if (style === 'bidirectional') {
                    const reversePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const rd = `M ${x2} ${y2} Q ${(x1 + x2) / 2 + 20} ${(y1 + y2) / 2 - 30} ${x1} ${y1}`;
                    reversePath.setAttribute('d', rd);
                    reversePath.setAttribute('fill', 'none');
                    reversePath.setAttribute('stroke', strokeColor);
                    reversePath.setAttribute('stroke-width', '1.5');
                    reversePath.setAttribute('opacity', '0.4');
                    reversePath.setAttribute('stroke-dasharray', '5,3');
                    reversePath.setAttribute('marker-end', 'url(#arrowMarker)');
                    arrowsGroup.appendChild(reversePath);
                }
            }
        });
    });

    // 添加箭头标记定义
    if (!document.getElementById('arrowMarker')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowMarker');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '8');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3, 0 6');
        polygon.setAttribute('fill', '#4ecdc4');

        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.insertBefore(defs, svg.firstChild);
    }
}

// Update Properties
function updateProperties(mapping) {
    // Homomorphism (always true for our examples)
    propHomomorphism.classList.add('active');
    propHomomorphism.querySelector('.prop-icon').textContent = '✓';

    // Injective
    if (mapping.isInjective) {
        propInjective.classList.add('active');
        propInjective.classList.remove('inactive');
        propInjective.querySelector('.prop-icon').textContent = '✓';
    } else {
        propInjective.classList.remove('active');
        propInjective.classList.add('inactive');
        propInjective.querySelector('.prop-icon').textContent = '✗';
    }

    // Surjective
    if (mapping.isSurjective) {
        propSurjective.classList.add('active');
        propSurjective.classList.remove('inactive');
        propSurjective.querySelector('.prop-icon').textContent = '✓';
    } else {
        propSurjective.classList.remove('active');
        propSurjective.classList.add('inactive');
        propSurjective.querySelector('.prop-icon').textContent = '✗';
    }

    // Isomorphism
    if (mapping.isInjective && mapping.isSurjective) {
        propIsomorphism.classList.add('active');
        propIsomorphism.classList.remove('inactive');
        propIsomorphism.querySelector('.prop-icon').textContent = '✓';
    } else {
        propIsomorphism.classList.remove('active');
        propIsomorphism.classList.add('inactive');
        propIsomorphism.querySelector('.prop-icon').textContent = '✗';
    }
}

// Update Concept
function updateConcept(conceptId) {
    currentConcept = conceptId;
    const data = CONCEPTS[conceptId];

    // Update buttons
    conceptButtons.forEach(btn => {
        if (btn.dataset.concept === conceptId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update content
    conceptTitle.textContent = data.title;
    conceptContent.innerHTML = data.conceptInfo;
    mainTitle.textContent = `${data.name} - ${data.title}`;
    mainSubtitle.textContent = data.nameEn;
    quoteText.textContent = data.quote;
    quoteAuthor.textContent = data.author;
    ideologyTitle.textContent = data.name + ' · ' + data.title;
    ideologyText.innerHTML = `<p>${data.ideology}</p>`;
    analogyText.textContent = data.analogy;

    // 重新渲染当前映射的可视化
    const mapping = MAPPINGS[currentMapping];
    renderMappingVisualization(mapping);
}

// Animate Mapping
async function animateMapping() {
    const mapping = MAPPINGS[currentMapping];
    const sourceEls = document.querySelectorAll('#sourceElements .element-item');
    const targetEls = document.querySelectorAll('#targetElements .element-item');

    animateBtn.disabled = true;
    animateBtn.textContent = '演示中...';

    for (let i = 0; i < sourceEls.length; i++) {
        const sourceEl = sourceEls[i];
        const sourceValue = sourceEl.dataset.value;

        // Highlight source
        sourceEl.classList.add('highlighted');

        // Find target
        let targetValue;
        if (mapping.map) {
            if (currentMapping === 'mod6') {
                targetValue = mapping.map(parseInt(sourceValue));
            } else if (currentMapping === 'inclusion') {
                targetValue = sourceValue;
            } else if (currentMapping === 'sign') {
                targetValue = mapping.map(sourceValue);
            }
        }

        // Highlight matching target
        targetEls.forEach(tel => {
            if (tel.dataset.value == targetValue) {
                tel.classList.add('highlighted');
            }
        });

        await sleep(600);

        // Remove highlights
        sourceEl.classList.remove('highlighted');
        targetEls.forEach(tel => tel.classList.remove('highlighted'));

        await sleep(200);
    }

    animateBtn.disabled = false;
    animateBtn.textContent = '▶ 演示映射';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event Listeners
function attachEventListeners() {
    conceptButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            updateConcept(btn.dataset.concept);
        });
    });

    mappingSelect.addEventListener('change', (e) => {
        updateMapping(e.target.value);
    });

    animateBtn.addEventListener('click', animateMapping);

    resetBtn.addEventListener('click', () => {
        location.reload();
    });
}
