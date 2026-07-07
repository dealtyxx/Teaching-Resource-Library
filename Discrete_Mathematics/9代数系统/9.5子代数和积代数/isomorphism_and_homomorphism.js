(function () {
    const config = window.SUBPRODUCT_PAGE_CONFIG || {};
    const layer = config.layer || "advanced";

    const conceptButtons = Array.from(document.querySelectorAll(".concept-btn"));
    const caseSelector = document.getElementById("caseSelector");
    const structureTable = document.getElementById("structureTable");
    const mappingDiagram = document.getElementById("mappingDiagram");
    const propertiesContent = document.getElementById("propertiesContent");
    const definitionPanel = document.getElementById("definitionPanel");
    const examplesList = document.getElementById("examplesList");
    const philosophyPanel = document.getElementById("philosophyPanel");
    const formulaText = document.getElementById("formulaText");
    const resultValue = document.getElementById("resultValue");
    const resultExtra = document.getElementById("resultExtra");
    const stepLabel = document.getElementById("stepLabel");
    const stepProgress = document.getElementById("stepProgress");
    const prevStepBtn = document.getElementById("prevStepBtn");
    const nextStepBtn = document.getElementById("nextStepBtn");
    const showBtn = document.getElementById("showBtn");
    const resetBtn = document.getElementById("resetBtn");
    const missionText = document.getElementById("missionText");
    const visualBadge = document.getElementById("visualBadge");

    const DEFINITIONS = {
        subalgebra: {
            label: "子代数",
            title: "子代数：小集合也要守住原规则",
            content: "若 H 是 A 的非空子集，并且 A 中的运算限制到 H 后仍不跑出 H，则 H 构成 A 的子代数。",
            formula: "H⊆A, H≠∅；任意 a,b∈H，都有 a∘b∈H。",
            focus: "基础层先看闭合；进阶层再同时看特殊元和继承关系。"
        },
        product: {
            label: "积代数",
            title: "积代数：把多个分量按坐标组合",
            content: "若 A、B 上有同类型运算，则 A×B 上可按分量定义运算，每个坐标各守各的规则。",
            formula: "(a,b)◇(c,d)=(a∘A c, b∘B d)。",
            focus: "看清每一维怎么计算，再看整体元素怎么形成。"
        },
        isomorphic: {
            label: "保结构映射",
            title: "同态/同构：换一种表达仍保持运算关系",
            content: "映射 f 若满足 f(a∘b)=f(a)⊙f(b)，就保留了运算结构；若再是一一对应，则是同构。",
            formula: "f(a∘b)=f(a)⊙f(b)。",
            focus: "重点不是名字相同，而是计算关系能不能被映射保持。"
        },
        multisort: {
            label: "多类型系统",
            title: "多类型代数：不同对象按规则协作",
            content: "载体被分成多个类型，运算可以从若干类型取输入，再输出到指定类型。",
            formula: "op:T_i×T_j→T_k。",
            focus: "拓展层关注边界清楚、职责清楚、跨类型关系清楚。"
        }
    };

    const CASES = [
        {
            id: "z6-even",
            layer: "basic",
            concept: "subalgebra",
            name: "Z6 偶数子集 H={0,2,4}",
            short: "只判定 H 是否闭合",
            parentName: "A=(Z6,+6)",
            subsetName: "H={0,2,4}",
            parentSet: [0, 1, 2, 3, 4, 5],
            subset: [0, 2, 4],
            modulus: 6,
            symbol: "+6",
            samples: [[0, 2], [2, 4], [4, 4], [2, 2]],
            degree: "基础层：找 a、b、a+b 三个点，确认结果是否仍在 H。",
            values: "思政融入：可靠的局部先要守住自身规则，才能承担更大系统中的职责。",
            stepHint: "偶数加偶数仍为偶数，图中结果点会回到右侧 H。"
        },
        {
            id: "z6-odd",
            layer: "basic",
            concept: "subalgebra",
            name: "Z6 奇数候选 H={1,3,5}",
            short: "用反例否定闭合",
            parentName: "A=(Z6,+6)",
            subsetName: "H={1,3,5}",
            parentSet: [0, 1, 2, 3, 4, 5],
            subset: [1, 3, 5],
            modulus: 6,
            symbol: "+6",
            samples: [[1, 3], [3, 5], [5, 5], [1, 5]],
            degree: "基础层：只要发现一次结果离开 H，就能判定不是子代数。",
            values: "思政融入：规则检验不能只看愿望，要用可复查的事实说话。",
            stepHint: "当前结果若落到 H 外，右侧会出现红色越界点。"
        },
        {
            id: "z8-four",
            layer: "advanced",
            concept: "subalgebra",
            name: "Z8 中的 H={0,4}",
            short: "同时观察闭合与零元",
            parentName: "A=(Z8,+8)",
            subsetName: "H={0,4}",
            parentSet: [0, 1, 2, 3, 4, 5, 6, 7],
            subset: [0, 4],
            modulus: 8,
            symbol: "+8",
            samples: [[4, 4], [0, 4], [4, 0]],
            degree: "进阶层：除了闭合，还观察 0 是否保留、逆元是否仍在 H。",
            values: "思政融入：局部保持核心规则，才能在整体中稳固地发挥作用。",
            stepHint: "本例每一步都回到 H，并保留加法零元 0。"
        },
        {
            id: "z2-z3-product",
            layer: "advanced",
            concept: "product",
            name: "Z2×Z3 分量加法",
            short: "两个分量同步计算",
            factors: [
                { name: "A=Z2", set: [0, 1], mod: 2, symbol: "+2" },
                { name: "B=Z3", set: [0, 1, 2], mod: 3, symbol: "+3" }
            ],
            samples: [
                { left: [1, 2], right: [1, 1] },
                { left: [0, 2], right: [1, 2] },
                { left: [1, 0], right: [0, 2] }
            ],
            degree: "进阶层：把一个整体元素拆成两个坐标，再逐坐标合成结果。",
            values: "思政融入：协作不是混成一团，而是在共同目标下让每个分量清楚发力。",
            stepHint: "看每一行坐标，两个小规则合成一个积代数规则。"
        },
        {
            id: "parity-hom",
            layer: "advanced",
            concept: "isomorphic",
            name: "Z4 到奇偶系统的保结构映射",
            short: "检查 f(a+b)=f(a)+f(b)",
            leftName: "A=(Z4,+4)",
            rightName: "B=({偶,奇},+2)",
            leftSet: [0, 1, 2, 3],
            rightSet: ["偶", "奇"],
            mapping: { 0: "偶", 1: "奇", 2: "偶", 3: "奇" },
            samples: [[1, 2], [2, 3], [3, 3], [0, 1]],
            degree: "进阶层：不只看集合，还要检查运算关系在映射后是否保持。",
            values: "思政融入：表达方式可以变化，原则关系不能走样；这是从现象看到结构的训练。",
            stepHint: "黄色项先在 A 中相加，再比较映射后的右侧结果。"
        },
        {
            id: "z2-z3-z2-product",
            layer: "extend",
            concept: "product",
            name: "Z2×Z3×Z2 三分量积代数",
            short: "三坐标并行运算",
            factors: [
                { name: "A=Z2", set: [0, 1], mod: 2, symbol: "+2" },
                { name: "B=Z3", set: [0, 1, 2], mod: 3, symbol: "+3" },
                { name: "C=Z2", set: [0, 1], mod: 2, symbol: "+2" }
            ],
            samples: [
                { left: [1, 2, 1], right: [1, 1, 0] },
                { left: [0, 2, 1], right: [1, 2, 1] },
                { left: [1, 0, 0], right: [0, 2, 1] }
            ],
            degree: "拓展层：分量增加后，仍用同一个坐标原则保持整体可计算。",
            values: "思政融入：复杂系统越大，越需要边界明确、责任到位、过程可追踪。",
            stepHint: "逐坐标看高亮项，三条小计算汇成一个整体结果。"
        },
        {
            id: "product-sub",
            layer: "extend",
            concept: "subalgebra",
            name: "积系统中的候选子代数 K",
            short: "在积代数内再判定闭合",
            parentName: "A=Z2×Z2",
            subsetName: "K={(0,0),(1,1)}",
            parentSet: ["(0,0)", "(0,1)", "(1,0)", "(1,1)"],
            subset: ["(0,0)", "(1,1)"],
            tupleMod: [2, 2],
            symbol: "⊕",
            samples: [["(0,0)", "(1,1)"], ["(1,1)", "(1,1)"], ["(1,1)", "(0,0)"]],
            degree: "拓展层：先理解积代数，再在积系统内部检查子结构。",
            values: "思政融入：先分清整体结构，再识别其中稳定单元，是系统治理中的抽象能力。",
            stepHint: "两个二元组按坐标异或，结果若仍在 K，则本步通过。"
        },
        {
            id: "rule-exec-supervision",
            layer: "extend",
            concept: "multisort",
            name: "规则-执行-监督多类型系统",
            short: "跨类型输入与输出",
            types: [
                { name: "规则库 R", set: ["边界", "流程", "责任"] },
                { name: "执行集 E", set: ["受理", "协作", "反馈"] },
                { name: "监督集 S", set: ["检查", "纠偏", "复盘"] }
            ],
            samples: [
                { op: "规范执行", input: ["边界", "受理"], types: [0, 1], output: "检查", outType: 2 },
                { op: "流程协作", input: ["流程", "协作"], types: [0, 1], output: "复盘", outType: 2 },
                { op: "责任反馈", input: ["责任", "反馈"], types: [0, 1], output: "纠偏", outType: 2 }
            ],
            degree: "拓展层：不同类型不能随意混用，运算必须说明输入类型与输出类型。",
            values: "思政融入：权责边界清楚，协作链条才清楚；监督反馈让系统不断校准。",
            stepHint: "黄色项来自不同类型，绿色项输出到监督类型。"
        }
    ];

    let currentConcept = config.initialConcept || "subalgebra";
    let activeCases = [];
    let currentCaseIndex = 0;
    let stepIndex = 0;

    function esc(value) {
        return String(value).replace(/[&<>"']/g, ch => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[ch]));
    }

    function term(text, hot) {
        return '<span class="formula-term' + (hot ? " is-hot" : "") + '">' + esc(text) + "</span>";
    }

    function chip(ok, text) {
        return '<span class="truth-chip' + (ok ? "" : " false") + '">' + esc(text) + "</span>";
    }

    function has(list, value) {
        return list.map(String).includes(String(value));
    }

    function layerAllowed(item) {
        return item.layer === layer;
    }

    function conceptAllowed(concept) {
        return CASES.some(item => layerAllowed(item) && item.concept === concept);
    }

    function casesForConcept(concept) {
        return CASES.filter(item => layerAllowed(item) && item.concept === concept);
    }

    function currentCase() {
        return activeCases[currentCaseIndex] || activeCases[0] || CASES[0];
    }

    function parseTuple(value) {
        if (Array.isArray(value)) return value;
        return String(value).replace(/[()]/g, "").split(",").map(Number);
    }

    function formatTuple(values) {
        return "(" + values.join(",") + ")";
    }

    function subResult(caseData, operands) {
        if (caseData.tupleMod) {
            const a = parseTuple(operands[0]);
            const b = parseTuple(operands[1]);
            return formatTuple(a.map((item, index) => (item + b[index]) % caseData.tupleMod[index]));
        }
        return (Number(operands[0]) + Number(operands[1])) % caseData.modulus;
    }

    function productResult(caseData, sample) {
        return sample.left.map((value, index) => (value + sample.right[index]) % caseData.factors[index].mod);
    }

    function parity(value) {
        return Number(value) % 2 === 0 ? "偶" : "奇";
    }

    function sampleFor(caseData) {
        const total = caseData.samples.length;
        return caseData.samples[stepIndex % total];
    }

    function renderMission() {
        if (missionText) {
            missionText.innerHTML = "<b>互动任务：</b>" + esc(config.mission || "点一步，观察图、表、公式和性质判断如何同步变化。");
        }
        if (visualBadge) visualBadge.textContent = config.badge || "结构关系联动";
        if (philosophyPanel) {
            philosophyPanel.innerHTML = "<b>" + esc(config.layerLabel || "进阶层") + "</b><br>" + esc(config.note || "逐步观察载体、运算、闭合和保结构关系。");
        }
    }

    function ensureConcept() {
        const available = CASES.filter(layerAllowed).map(item => item.concept);
        if (!available.includes(currentConcept)) currentConcept = available[0] || "subalgebra";
    }

    function renderConceptButtons() {
        ensureConcept();
        conceptButtons.forEach(button => {
            const concept = button.dataset.concept;
            const available = conceptAllowed(concept);
            button.hidden = !available;
            button.classList.toggle("active", concept === currentConcept);
        });
    }

    function renderCaseSelector() {
        activeCases = casesForConcept(currentConcept);
        currentCaseIndex = Math.min(currentCaseIndex, Math.max(activeCases.length - 1, 0));
        caseSelector.innerHTML = activeCases.map((item, index) => (
            '<option value="' + index + '"' + (index === currentCaseIndex ? " selected" : "") + ">" + esc(item.name) + "</option>"
        )).join("");
    }

    function renderDefinition() {
        const def = DEFINITIONS[currentConcept] || DEFINITIONS.subalgebra;
        definitionPanel.innerHTML = ""
            + "<h3>" + esc(def.title) + "</h3>"
            + "<p>" + esc(def.content) + "</p>"
            + '<div class="formula-box">' + esc(def.formula) + "</div>"
            + "<p><b>本层关注：</b>" + esc(def.focus) + "</p>";
    }

    function renderExamples() {
        const c = currentCase();
        examplesList.innerHTML = '<div class="example-list">' + activeCases.map((item, index) => (
            '<div class="example-card' + (index === currentCaseIndex ? " is-active" : "") + '" data-index="' + index + '">'
            + '<div class="title">' + esc(item.name) + "</div>"
            + '<div class="desc">' + esc(item.short) + "</div>"
            + "</div>"
        )).join("") + "</div>";

        examplesList.querySelectorAll(".example-card").forEach(card => {
            card.addEventListener("click", () => {
                currentCaseIndex = Number(card.dataset.index);
                stepIndex = 0;
                renderAll();
            });
        });

        if (philosophyPanel) {
            philosophyPanel.innerHTML = "<b>" + esc(c.name) + "</b><br>" + esc(c.degree);
        }
    }

    function renderStepPanel() {
        const c = currentCase();
        const total = c.samples.length;
        const number = (stepIndex % total) + 1;
        stepLabel.innerHTML = "第 <b>" + number + "</b> / " + total + " 步：" + esc(c.stepHint);
        stepProgress.style.setProperty("--step-width", Math.round(number / total * 100) + "%");
    }

    function renderTableSubalgebra(c) {
        const operands = sampleFor(c);
        const subset = c.subset;
        structureTable.innerHTML = "<table><tr><th>" + esc(c.symbol) + "</th>"
            + subset.map(item => '<th class="' + (String(item) === String(operands[1]) ? "col-hot" : "") + '">' + esc(item) + "</th>").join("")
            + "</tr>"
            + subset.map(row => (
                "<tr><th" + (String(row) === String(operands[0]) ? ' class="row-hot"' : "") + ">" + esc(row) + "</th>"
                + subset.map(col => {
                    const result = subResult(c, [row, col]);
                    const hot = String(row) === String(operands[0]) && String(col) === String(operands[1]);
                    const fail = !has(subset, result);
                    return '<td class="' + (hot ? "cell-hot " : "") + (fail ? "cell-fail" : "") + '">' + esc(result) + "</td>";
                }).join("")
                + "</tr>"
            )).join("")
            + "</table>";
    }

    function renderTableProduct(c) {
        const sample = sampleFor(c);
        const result = productResult(c, sample);
        structureTable.innerHTML = "<table><tr><th>分量</th><th>左元</th><th>右元</th><th>本分量结果</th></tr>"
            + c.factors.map((factor, index) => (
                '<tr><th class="row-hot">' + esc(factor.name) + "</th>"
                + '<td class="cell-hot">' + esc(sample.left[index]) + "</td>"
                + '<td class="cell-hot">' + esc(sample.right[index]) + "</td>"
                + '<td class="cell-hot">' + esc(result[index]) + " mod " + esc(factor.mod) + "</td></tr>"
            )).join("")
            + "</table>";
    }

    function renderTableIsomorphic(c) {
        const operands = sampleFor(c);
        const sum = (operands[0] + operands[1]) % 4;
        const leftMapped = parity(sum);
        const rightSum = parity((operands[0] % 2) + (operands[1] % 2));
        structureTable.innerHTML = "<table><tr><th>检查项</th><th>值</th></tr>"
            + '<tr><th class="row-hot">a,b</th><td class="cell-hot">' + esc(operands.join(",")) + "</td></tr>"
            + '<tr><th>a+b mod 4</th><td class="cell-hot">' + esc(sum) + "</td></tr>"
            + '<tr><th>f(a+b)</th><td class="cell-hot">' + esc(leftMapped) + "</td></tr>"
            + '<tr><th>f(a)+f(b)</th><td class="cell-hot">' + esc(rightSum) + "</td></tr>"
            + "</table>";
    }

    function renderTableMultisort(c) {
        const sample = sampleFor(c);
        structureTable.innerHTML = "<table><tr><th>输入类型</th><th>输入元素</th><th>运算</th><th>输出类型</th><th>输出</th></tr>"
            + "<tr>"
            + '<td class="cell-hot">' + esc(c.types[sample.types[0]].name) + " × " + esc(c.types[sample.types[1]].name) + "</td>"
            + '<td class="cell-hot">' + esc(sample.input.join(" , ")) + "</td>"
            + '<td class="cell-hot">' + esc(sample.op) + "</td>"
            + '<td class="cell-hot">' + esc(c.types[sample.outType].name) + "</td>"
            + '<td class="cell-hot">' + esc(sample.output) + "</td>"
            + "</tr></table>";
    }

    function renderTable() {
        const c = currentCase();
        if (c.concept === "subalgebra") renderTableSubalgebra(c);
        if (c.concept === "product") renderTableProduct(c);
        if (c.concept === "isomorphic") renderTableIsomorphic(c);
        if (c.concept === "multisort") renderTableMultisort(c);
    }

    function token(value, classes) {
        return '<span class="element-item ' + (classes || "") + '">' + esc(value) + "</span>";
    }

    function renderDiagramSubalgebra(c) {
        const operands = sampleFor(c);
        const result = subResult(c, operands);
        const inSubset = has(c.subset, result);
        const inputSet = new Set(operands.map(String));
        const parentTokens = c.parentSet.map(item => {
            const cls = inputSet.has(String(item)) ? "is-hot" : String(result) === String(item) ? (inSubset ? "is-result" : "is-fail") : "";
            return token(item, cls);
        }).join("");
        const subsetTokens = c.subset.map(item => {
            const cls = inputSet.has(String(item)) ? "is-hot" : String(result) === String(item) ? "is-result" : "";
            return token(item, cls);
        }).join("") + (inSubset ? "" : token(result, "is-fail"));

        mappingDiagram.innerHTML = ""
            + '<div class="map-title"><b>' + esc(c.name) + "</b><span>" + esc(DEFINITIONS.subalgebra.label) + "</span></div>"
            + '<div class="systems-row">'
            + '<div class="system-box"><div class="title">' + esc(c.parentName) + '</div><div class="elements">' + parentTokens + "</div></div>"
            + '<div class="arrow-section"><div class="relation-edge is-hot">⊇</div><span>候选子结构</span></div>'
            + '<div class="system-box is-focus"><div class="title">' + esc(c.subsetName) + '</div><div class="elements">' + subsetTokens + "</div></div>"
            + "</div>"
            + '<div class="flow-line">'
            + '<span class="operand-token is-hot">' + esc(operands[0]) + "</span>"
            + '<span class="operator-token">' + esc(c.symbol) + "</span>"
            + '<span class="operand-token is-hot">' + esc(operands[1]) + "</span>"
            + '<span class="arrow-token">→</span>'
            + '<span class="result-token ' + (inSubset ? "is-hot" : "is-fail") + '">' + esc(result) + "</span>"
            + "</div>"
            + '<div class="map-caption">' + esc(c.degree) + "</div>";
    }

    function renderDiagramProduct(c) {
        const sample = sampleFor(c);
        const result = productResult(c, sample);
        const factorBoxes = c.factors.map((factor, index) => {
            const elements = factor.set.map(item => {
                const cls = item === sample.left[index] || item === sample.right[index] ? "is-hot" : item === result[index] ? "is-result" : "";
                return token(item, cls);
            }).join("");
            return '<div class="system-box"><div class="title">' + esc(factor.name) + '</div><div class="elements">' + elements + "</div></div>";
        }).join("");

        mappingDiagram.innerHTML = ""
            + '<div class="map-title"><b>' + esc(c.name) + "</b><span>" + esc(DEFINITIONS.product.label) + "</span></div>"
            + '<div class="factor-grid">' + factorBoxes + "</div>"
            + '<div class="flow-line">'
            + '<span class="operand-token is-hot">' + esc(formatTuple(sample.left)) + "</span>"
            + '<span class="operator-token">◇</span>'
            + '<span class="operand-token is-hot">' + esc(formatTuple(sample.right)) + "</span>"
            + '<span class="arrow-token">→</span>'
            + '<span class="result-token is-hot">' + esc(formatTuple(result)) + "</span>"
            + "</div>"
            + '<div class="map-caption">' + esc(c.degree) + "</div>";
    }

    function renderDiagramIsomorphic(c) {
        const operands = sampleFor(c);
        const sum = (operands[0] + operands[1]) % 4;
        const mappedSum = parity(sum);
        const rightSum = parity((operands[0] % 2) + (operands[1] % 2));
        const leftHot = new Set([operands[0], operands[1], sum].map(String));
        const rightHot = new Set([parity(operands[0]), parity(operands[1]), mappedSum, rightSum].map(String));
        const leftTokens = c.leftSet.map(item => token(item, leftHot.has(String(item)) ? (String(item) === String(sum) ? "is-result" : "is-hot") : "")).join("");
        const rightTokens = c.rightSet.map(item => token(item, rightHot.has(String(item)) ? (String(item) === mappedSum ? "is-result" : "is-hot") : "")).join("");
        const lines = c.leftSet.map(item => (
            '<span class="factor-token ' + (leftHot.has(String(item)) ? "is-hot" : "") + '">f(' + esc(item) + ")=" + esc(c.mapping[item]) + "</span>"
        )).join("");

        mappingDiagram.innerHTML = ""
            + '<div class="map-title"><b>' + esc(c.name) + "</b><span>" + esc(DEFINITIONS.isomorphic.label) + "</span></div>"
            + '<div class="systems-row">'
            + '<div class="system-box is-focus"><div class="title">' + esc(c.leftName) + '</div><div class="elements">' + leftTokens + "</div></div>"
            + '<div class="arrow-section"><div class="relation-edge is-hot">f</div><span>保持运算</span></div>'
            + '<div class="system-box"><div class="title">' + esc(c.rightName) + '</div><div class="elements">' + rightTokens + "</div></div>"
            + "</div>"
            + '<div class="flow-line mapping-line">' + lines + "</div>"
            + '<div class="map-caption">' + esc(c.degree) + "</div>";
    }

    function renderDiagramMultisort(c) {
        const sample = sampleFor(c);
        const boxes = c.types.map((type, typeIndex) => {
            const elements = type.set.map(item => {
                const isInput = sample.types.includes(typeIndex) && sample.input.includes(item);
                const isOutput = sample.outType === typeIndex && sample.output === item;
                return token(item, isInput ? "is-hot" : isOutput ? "is-result" : "");
            }).join("");
            return '<div class="system-box ' + (sample.types.includes(typeIndex) || sample.outType === typeIndex ? "is-focus" : "") + '">'
                + '<div class="title">' + esc(type.name) + '</div><div class="elements">' + elements + "</div></div>";
        }).join("");

        mappingDiagram.innerHTML = ""
            + '<div class="map-title"><b>' + esc(c.name) + "</b><span>" + esc(DEFINITIONS.multisort.label) + "</span></div>"
            + '<div class="type-grid">' + boxes + "</div>"
            + '<div class="flow-line">'
            + '<span class="operand-token is-hot">' + esc(sample.input[0]) + "</span>"
            + '<span class="operator-token">' + esc(sample.op) + "</span>"
            + '<span class="operand-token is-hot">' + esc(sample.input[1]) + "</span>"
            + '<span class="arrow-token">→</span>'
            + '<span class="result-token is-hot">' + esc(sample.output) + "</span>"
            + "</div>"
            + '<div class="map-caption">' + esc(c.degree) + "</div>";
    }

    function renderDiagram() {
        const c = currentCase();
        if (c.concept === "subalgebra") renderDiagramSubalgebra(c);
        if (c.concept === "product") renderDiagramProduct(c);
        if (c.concept === "isomorphic") renderDiagramIsomorphic(c);
        if (c.concept === "multisort") renderDiagramMultisort(c);
    }

    function allPairsClosed(c) {
        return c.subset.every(a => c.subset.every(b => has(c.subset, subResult(c, [a, b]))));
    }

    function renderProperties() {
        const c = currentCase();
        let cards = [];

        if (c.concept === "subalgebra") {
            const operands = sampleFor(c);
            const result = subResult(c, operands);
            const stepOk = has(c.subset, result);
            cards = [
                ["H⊆A", "候选元素都来自父系统。", true, false],
                ["H 非空", "至少有一个元素可承载运算。", c.subset.length > 0, false],
                ["本步闭合", operands.join(" " + c.symbol + " ") + " = " + result, stepOk, true],
                ["全表闭合", "H×H 的所有格子都落回 H。", allPairsClosed(c), false]
            ];
        } else if (c.concept === "product") {
            const sample = sampleFor(c);
            cards = [
                ["载体", "整体元素来自 " + c.factors.map(f => f.name).join(" × ") + "。", true, false],
                ["分量运算", "每个坐标只调用本坐标的规则。", true, true],
                ["结果仍合法", formatTuple(productResult(c, sample)) + " 仍是积系统元素。", true, false],
                ["难度提升", "分量越多，越需要表格化追踪。", layer === "extend", layer === "extend"]
            ];
        } else if (c.concept === "isomorphic") {
            const operands = sampleFor(c);
            const sum = (operands[0] + operands[1]) % 4;
            const ok = parity(sum) === parity((operands[0] % 2) + (operands[1] % 2));
            cards = [
                ["映射", "f 把 Z4 元素归入奇偶类型。", true, false],
                ["保运算", "比较 f(a+b) 与 f(a)+f(b)。", ok, true],
                ["非一一", "0 与 2 都映到偶，所以这是同态而非同构。", false, false],
                ["结构视角", "关注关系是否保持，而不只看符号。", true, false]
            ];
        } else {
            const sample = sampleFor(c);
            cards = [
                ["类型边界", "输入来自 " + c.types[sample.types[0]].name + " 与 " + c.types[sample.types[1]].name + "。", true, true],
                ["输出归属", "结果落在 " + c.types[sample.outType].name + "。", true, false],
                ["跨类型规则", "运算名说明两个类型如何发生关系。", true, false],
                ["可追踪", "输入、过程、输出都能回到明确类型。", true, false]
            ];
        }

        propertiesContent.innerHTML = '<h4>关键性质</h4><div class="property-list">'
            + cards.map(([title, desc, ok, focus]) => (
                '<div class="property-card' + (focus ? " is-focus" : "") + '">'
                + '<div class="property-icon ' + (ok ? "" : "no") + '">' + (ok ? "✓" : "×") + "</div>"
                + "<div><div class=\"prop-title\">" + esc(title) + "</div>"
                + '<div class="prop-desc">' + esc(desc) + "</div></div>"
                + "</div>"
            )).join("")
            + "</div>";
    }

    function renderFormula() {
        const c = currentCase();
        let ok = true;
        let status = "本步通过";
        let feedback = c.values;

        if (c.concept === "subalgebra") {
            const operands = sampleFor(c);
            const result = subResult(c, operands);
            ok = has(c.subset, result);
            status = ok ? "留在 H" : "离开 H";
            formulaText.innerHTML = [
                term("H⊆A", false),
                term(operands[0] + "," + operands[1] + "∈H", true),
                term(operands[0] + " " + c.symbol + " " + operands[1] + "=" + result, true),
                term(result + (ok ? "∈H" : "∉H"), true)
            ].join("");
            feedback += ok ? " 本步反馈：结果回到候选集合，闭合性证据增加。" : " 本步反馈：出现越界结果，候选集合需要调整。";
        } else if (c.concept === "product") {
            const sample = sampleFor(c);
            const result = productResult(c, sample);
            formulaText.innerHTML = [
                term("载体=" + c.factors.map(f => f.name).join("×"), false),
                term(formatTuple(sample.left) + "◇" + formatTuple(sample.right), true),
                term("逐坐标计算", true),
                term("=" + formatTuple(result), true)
            ].join("");
            feedback += " 本步反馈：每个坐标独立计算，整体结果由分量共同确定。";
        } else if (c.concept === "isomorphic") {
            const operands = sampleFor(c);
            const sum = (operands[0] + operands[1]) % 4;
            const leftMapped = parity(sum);
            const rightSum = parity((operands[0] % 2) + (operands[1] % 2));
            ok = leftMapped === rightSum;
            status = ok ? "保结构" : "未保持";
            formulaText.innerHTML = [
                term("a=" + operands[0] + ", b=" + operands[1], false),
                term("f(a+b)=" + leftMapped, true),
                term("f(a)+f(b)=" + rightSum, true),
                term(ok ? "相等" : "不相等", true)
            ].join("");
            feedback += " 本步反馈：先算再映射、先映射再算，两条路径得到同一结果。";
        } else {
            const sample = sampleFor(c);
            formulaText.innerHTML = [
                term("op:T_i×T_j→T_k", false),
                term(c.types[sample.types[0]].name + "×" + c.types[sample.types[1]].name, true),
                term(sample.op, true),
                term("输出到 " + c.types[sample.outType].name, true)
            ].join("");
            feedback += " 本步反馈：类型、职责、输出归属同时被标明，复杂关系因此可检查。";
        }

        resultValue.innerHTML = chip(ok, status);
        resultExtra.textContent = feedback;
    }

    function renderAll() {
        renderConceptButtons();
        renderCaseSelector();
        renderDefinition();
        renderExamples();
        renderStepPanel();
        renderTable();
        renderDiagram();
        renderProperties();
        renderFormula();
    }

    function changeConcept(concept) {
        if (!conceptAllowed(concept)) return;
        currentConcept = concept;
        currentCaseIndex = 0;
        stepIndex = 0;
        renderAll();
    }

    function moveStep(delta) {
        const c = currentCase();
        stepIndex = (stepIndex + delta + c.samples.length) % c.samples.length;
        renderStepPanel();
        renderTable();
        renderDiagram();
        renderProperties();
        renderFormula();
    }

    function bind() {
        conceptButtons.forEach(button => {
            button.addEventListener("click", () => changeConcept(button.dataset.concept));
        });
        caseSelector.addEventListener("change", event => {
            currentCaseIndex = Number(event.target.value);
            stepIndex = 0;
            renderAll();
        });
        prevStepBtn.addEventListener("click", () => moveStep(-1));
        nextStepBtn.addEventListener("click", () => moveStep(1));
        showBtn.addEventListener("click", () => moveStep(1));
        resetBtn.addEventListener("click", () => {
            stepIndex = 0;
            renderAll();
        });
    }

    function init() {
        renderMission();
        bind();
        renderAll();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
