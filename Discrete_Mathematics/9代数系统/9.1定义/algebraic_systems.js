(function () {
    const layerConfig = window.ALGEBRA_PAGE_CONFIG || {};
    const layer = layerConfig.layer || "advanced";
    const controls = document.getElementById("controlsArea");
    const typeButtons = Array.from(document.querySelectorAll(".op-btn"));
    const caseSelector = document.getElementById("caseSelector");
    const operationTable = document.getElementById("operationTable");
    const operationDemo = document.getElementById("operationDemo");
    const propertiesDisplay = document.getElementById("propertiesDisplay");
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
    const demoBtn = document.getElementById("demoBtn");
    const resetBtn = document.getElementById("resetBtn");
    const missionText = document.getElementById("missionText");
    const visualBadge = document.getElementById("visualBadge");

    const DEFINITIONS = {
        unary: {
            title: "一元运算",
            content: "一元运算把集合 S 中的一个元素变成 S 中的一个元素。",
            formula: "f:S→S；对任意 a∈S，f(a) 仍在 S 中。",
            focus: "看清“输入一个、输出一个”的映射关系。"
        },
        binary: {
            title: "二元运算",
            content: "二元运算把 S×S 中的一对元素映到 S 中，是代数系统最常见的运算形态。",
            formula: "∘:S×S→S；对任意 a,b∈S，a∘b 必须仍在 S 中。",
            focus: "用运算表逐格检查封闭性。"
        },
        nary: {
            title: "n 元运算",
            content: "n 元运算一次接收 n 个输入，再输出集合中的一个元素。",
            formula: "f:S^n→S；多输入仍要回到同一载体集合。",
            focus: "从二元推广到多元，观察规则是否仍稳定。"
        },
        system: {
            title: "代数系统",
            content: "代数系统由非空集合和定义在其上的一个或多个运算组成。",
            formula: "⟨S,∘⟩ 或 ⟨S,∘1,∘2,...⟩。",
            focus: "把集合、运算和性质放在同一张结构图里检查。"
        }
    };

    const CASES = [
        {
            id: "z4-add",
            layer: "basic",
            type: "binary",
            name: "Z4 加法表",
            short: "基础封闭性",
            set: [0, 1, 2, 3],
            symbol: "+4",
            operation: (a, b) => (a + b) % 4,
            samples: [[0, 1], [1, 2], [2, 3], [3, 3]],
            properties: { closure: true },
            focus: "closure",
            note: "结果每次回到 S={0,1,2,3}，所以这是封闭的二元运算。",
            feedback: "先认载体集合 S，再看 a∘b 是否仍在 S 中。基础层只抓住“集合+运算+封闭”这条主线。"
        },
        {
            id: "z5-sub",
            layer: "basic",
            type: "binary",
            name: "Z5 普通减法",
            short: "反例检查",
            set: [0, 1, 2, 3, 4],
            symbol: "-",
            operation: (a, b) => a - b,
            samples: [[3, 1], [1, 3], [4, 2], [0, 4]],
            properties: { closure: false },
            focus: "closure",
            note: "普通减法会得到负数，某些结果不在 S 中，封闭性失败。",
            feedback: "一个反例就足以说明“在这个集合上”不是封闭运算。"
        },
        {
            id: "cycle-map",
            layer: "advanced",
            type: "unary",
            name: "状态轮转 f",
            short: "一元映射",
            set: ["A", "B", "C"],
            symbol: "f",
            operation: (a) => ({ A: "B", B: "C", C: "A" }[a]),
            samples: [["A"], ["B"], ["C"]],
            properties: { closure: true, identity: false, inverse: true },
            focus: "inverse",
            note: "每个状态都有唯一去向，也能沿反向找回来源。",
            feedback: "进阶层开始把“封闭”与“逆向可恢复”等性质一起观察。"
        },
        {
            id: "z5-add",
            layer: "advanced",
            type: "binary",
            name: "Z5 模加法",
            short: "群结构雏形",
            set: [0, 1, 2, 3, 4],
            symbol: "+5",
            operation: (a, b) => (a + b) % 5,
            samples: [[1, 2], [2, 4], [3, 3], [4, 1]],
            properties: { closure: true, associative: true, commutative: true, identity: true, inverse: true },
            focus: "identity",
            note: "0 是单位元，每个元素都有加法逆元。",
            feedback: "进阶层不仅判断封闭，还要读出单位元、逆元、交换律等结构信息。"
        },
        {
            id: "vote3",
            layer: "advanced",
            type: "nary",
            name: "三票多数决",
            short: "三元运算",
            set: ["同意", "反对"],
            symbol: "maj",
            arity: 3,
            operation: (...args) => args.filter(x => x === "同意").length >= 2 ? "同意" : "反对",
            samples: [["同意", "同意", "反对"], ["同意", "反对", "反对"], ["反对", "同意", "同意"]],
            properties: { closure: true, commutative: true, associative: false },
            focus: "commutative",
            note: "调换投票顺序不改变多数结果，但分批合并可能改变语义。",
            feedback: "n 元运算把“多个输入合成一个输出”，仍要检查结果是否落在同一集合。"
        },
        {
            id: "z6-mul",
            layer: "extend",
            type: "binary",
            name: "Z6 模乘法",
            short: "零因子观察",
            set: [0, 1, 2, 3, 4, 5],
            symbol: "×6",
            operation: (a, b) => (a * b) % 6,
            samples: [[2, 3], [4, 3], [5, 5], [2, 5]],
            properties: { closure: true, associative: true, commutative: true, identity: true, inverse: false },
            focus: "inverse",
            note: "2×3=0 显示零因子现象，不是每个非零元素都有乘法逆元。",
            feedback: "拓展层把封闭性迁移到更细的结构判断：零因子、单位、可逆元素。"
        },
        {
            id: "product-system",
            layer: "extend",
            type: "system",
            name: "积结构 A×B",
            short: "多运算系统",
            set: ["00", "01", "10", "11"],
            symbol: "⊕",
            operation: (a, b) => {
                const x = Number(a[0]) ^ Number(b[0]);
                const y = Number(a[1]) ^ Number(b[1]);
                return `${x}${y}`;
            },
            samples: [["01", "10"], ["11", "01"], ["10", "10"], ["00", "11"]],
            properties: { closure: true, associative: true, commutative: true, identity: true, inverse: true },
            focus: "closure",
            note: "两位状态按位异或后仍是两位状态，局部规则组合成整体规则。",
            feedback: "拓展层强调结构迁移：同一个代数框架可描述状态编码、程序类型与组合系统。"
        },
        {
            id: "parity-hom",
            layer: "extend",
            type: "system",
            name: "奇偶同态",
            short: "结构保持",
            set: [0, 1, 2, 3],
            symbol: "φ",
            operation: (a, b) => (a + b) % 4,
            samples: [[1, 2], [2, 3], [3, 3], [0, 1]],
            properties: { closure: true, homomorphism: true },
            focus: "homomorphism",
            note: "φ(a+b mod 4)=φ(a)+φ(b) mod 2，映射后仍保持加法结构。",
            feedback: "从“能算”走向“保持结构”，这是抽象代数向模型迁移的关键一步。"
        }
    ];

    const typeNames = { unary: "一元运算", binary: "二元运算", nary: "n 元运算", system: "代数系统" };
    const propertyInfo = {
        closure: ["封闭性", "任意合法输入运算后仍在 S 中。"],
        associative: ["结合律", "改变括号位置不改变最终结果。"],
        commutative: ["交换律", "交换输入顺序不改变结果。"],
        identity: ["单位元", "存在 e，使 e∘a=a∘e=a。"],
        inverse: ["逆元", "元素可与某个元素结合回到单位元。"],
        homomorphism: ["同态保持", "映射前后的运算结构保持一致。"]
    };

    let activeCases = [];
    let currentCaseIndex = 0;
    let stepIndex = 0;
    let currentType = layerConfig.initialType || "binary";

    function esc(value) {
        return String(value).replace(/[&<>"']/g, ch => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[ch]));
    }

    function chip(ok, text) {
        return '<span class="truth-chip' + (ok ? "" : " false") + '">' + esc(text) + "</span>";
    }

    function formulaTerm(text, hot) {
        return '<span class="formula-term' + (hot ? " is-hot" : "") + '">' + esc(text) + "</span>";
    }

    function contains(set, value) {
        return set.map(String).includes(String(value));
    }

    function layerAllowed(caseData) {
        if (layer === "basic") return caseData.layer === "basic";
        if (layer === "advanced") return caseData.layer === "advanced";
        return caseData.layer === "extend";
    }

    function casesForType(type) {
        return CASES.filter(c => layerAllowed(c) && c.type === type);
    }

    function currentCase() {
        return activeCases[currentCaseIndex] || activeCases[0] || CASES[0];
    }

    function currentOperands(caseData) {
        const samples = caseData.samples && caseData.samples.length ? caseData.samples : [caseData.set.slice(0, caseData.arity || 2)];
        return samples[stepIndex % samples.length];
    }

    function opResult(caseData, operands) {
        return caseData.operation(...operands);
    }

    function setMission() {
        if (missionText) missionText.innerHTML = "<b>互动任务：</b>" + esc(layerConfig.mission || "选择案例，逐步观察集合、运算与性质如何组成代数系统。");
        if (visualBadge) visualBadge.textContent = layerConfig.badge || "集合 + 运算 + 性质";
        if (philosophyPanel) {
            philosophyPanel.innerHTML = '<b>' + esc(layerConfig.layerLabel || "进阶层") + '</b><br>' + esc(layerConfig.note || "点一步，观察一次输入、运算、输出与性质判断。");
        }
    }

    function updateTypeButtons() {
        const available = new Set(CASES.filter(layerAllowed).map(c => c.type));
        typeButtons.forEach(btn => {
            const type = btn.dataset.type;
            btn.hidden = !available.has(type);
            btn.classList.toggle("active", type === currentType);
        });
        if (!available.has(currentType)) currentType = Array.from(available)[0] || "binary";
    }

    function renderCaseSelector() {
        activeCases = casesForType(currentType);
        if (!activeCases.length) activeCases = CASES.filter(layerAllowed);
        currentCaseIndex = Math.min(currentCaseIndex, Math.max(0, activeCases.length - 1));
        caseSelector.innerHTML = activeCases.map((item, index) => (
            '<option value="' + index + '"' + (index === currentCaseIndex ? " selected" : "") + '>' + esc(item.name) + '</option>'
        )).join("");
    }

    function renderDefinition() {
        const def = DEFINITIONS[currentType] || DEFINITIONS.binary;
        definitionPanel.innerHTML = ''
            + '<h3>' + esc(def.title) + '</h3>'
            + '<p>' + esc(def.content) + '</p>'
            + '<div class="formula-box">' + esc(def.formula) + '</div>'
            + '<p><b>本层关注：</b>' + esc(def.focus) + '</p>';
    }

    function renderExamples() {
        const c = currentCase();
        examplesList.innerHTML = '<div class="example-list">' + activeCases.map((item, index) => (
            '<div class="example-item' + (index === currentCaseIndex ? " is-active" : "") + '" data-case-index="' + index + '">'
            + '<div class="example-title">' + esc(item.name) + '</div>'
            + '<div class="example-desc">' + esc(item.short) + '</div>'
            + '</div>'
        )).join("") + '</div>';
        examplesList.querySelectorAll(".example-item").forEach(item => {
            item.addEventListener("click", () => {
                currentCaseIndex = Number(item.dataset.caseIndex);
                stepIndex = 0;
                renderAll();
            });
        });
        if (philosophyPanel) {
            philosophyPanel.innerHTML = '<b>' + esc(c.name) + '</b><br>' + esc(c.feedback);
        }
    }

    function renderStepPanel() {
        const c = currentCase();
        const total = c.samples.length;
        const number = (stepIndex % total) + 1;
        if (stepLabel) {
            stepLabel.innerHTML = '第 <b>' + number + '</b> / ' + total + ' 步：' + esc(c.note);
        }
        if (stepProgress) {
            stepProgress.style.setProperty("--step-width", Math.round(number / total * 100) + "%");
        }
    }

    function renderTable() {
        const c = currentCase();
        const operands = currentOperands(c);
        if (c.type === "unary") {
            operationTable.innerHTML = '<table><tr><th>x</th><th>' + esc(c.symbol) + '(x)</th></tr>'
                + c.set.map(x => {
                    const hot = String(x) === String(operands[0]);
                    return '<tr><th class="' + (hot ? "row-hot" : "") + '">' + esc(x) + '</th><td class="' + (hot ? "cell-hot" : "") + '">' + esc(c.operation(x)) + '</td></tr>';
                }).join("") + '</table>';
            return;
        }
        if (c.type === "nary") {
            const result = opResult(c, operands);
            operationTable.innerHTML = '<table><tr><th>位置</th><th>输入</th></tr>'
                + operands.map((x, i) => '<tr><th class="row-hot">a' + (i + 1) + '</th><td class="cell-hot">' + esc(x) + '</td></tr>').join("")
                + '<tr><th>输出</th><td>' + esc(result) + '</td></tr></table>';
            return;
        }
        operationTable.innerHTML = '<table><tr><th>' + esc(c.symbol) + '</th>'
            + c.set.map(x => '<th class="' + (String(x) === String(operands[1]) ? "col-hot" : "") + '">' + esc(x) + '</th>').join("")
            + '</tr>' + c.set.map(row => (
                '<tr><th class="' + (String(row) === String(operands[0]) ? "row-hot" : "") + '">' + esc(row) + '</th>'
                + c.set.map(col => {
                    const hot = String(row) === String(operands[0]) && String(col) === String(operands[1]);
                    return '<td class="' + (hot ? "cell-hot" : "") + '">' + esc(c.operation(row, col)) + '</td>';
                }).join("") + '</tr>'
            )).join("") + '</table>';
    }

    function renderMap() {
        const c = currentCase();
        const operands = currentOperands(c);
        const result = opResult(c, operands);
        const ok = contains(c.set, result);
        const inputSet = new Set(operands.map(String));
        const resultText = String(result);
        const tokens = c.set.map(item => {
            const cls = inputSet.has(String(item)) ? " is-input" : resultText === String(item) ? " is-result" : "";
            return '<span class="set-token' + cls + '">' + esc(item) + '</span>';
        }).join("");
        const resultClass = ok ? " is-hot" : " is-fail";
        const flow = operands.map(item => '<span class="operand-token is-hot">' + esc(item) + '</span>').join('<span class="operator-token">' + esc(c.symbol) + '</span>');
        operationDemo.innerHTML = ''
            + '<div class="operation-map">'
            + '<div class="map-title"><b>' + esc(c.name) + '</b><span>' + esc(typeNames[c.type] || "运算") + '</span></div>'
            + '<div class="set-line">' + tokens + (!ok ? '<span class="set-token is-fail">' + esc(result) + '</span>' : '') + '</div>'
            + '<div class="flow-line">' + flow + '<span class="arrow-token">→</span><span class="result-token' + resultClass + '">' + esc(result) + '</span></div>'
            + '<div class="map-caption">' + esc(c.note) + '</div>'
            + '</div>';
    }

    function renderProperties() {
        const c = currentCase();
        propertiesDisplay.innerHTML = '<h4>性质检查</h4><div class="property-list">'
            + Object.entries(c.properties).map(([key, value]) => {
                const info = propertyInfo[key] || [key, ""];
                return '<div class="property-item' + (key === c.focus ? " is-focus" : "") + '">'
                    + '<div class="property-icon ' + (value ? "yes" : "no") + '">' + (value ? "✓" : "×") + '</div>'
                    + '<div><div class="property-name">' + esc(info[0]) + '</div>'
                    + '<div class="property-desc">' + esc(info[1]) + '</div></div>'
                    + '</div>';
            }).join("")
            + '</div>';
    }

    function renderFormula() {
        const c = currentCase();
        const operands = currentOperands(c);
        const result = opResult(c, operands);
        const ok = contains(c.set, result);
        if (c.type === "unary") {
            formulaText.innerHTML = [
                formulaTerm("S={" + c.set.join(",") + "}", false),
                formulaTerm(c.symbol + "(" + operands[0] + ")", true),
                formulaTerm("=" + result, true),
                formulaTerm(result + "∈S", ok)
            ].join("");
        } else if (c.type === "nary") {
            formulaText.innerHTML = [
                formulaTerm("f:S^" + (c.arity || operands.length) + "→S", false),
                formulaTerm(c.symbol + "(" + operands.join(",") + ")", true),
                formulaTerm("=" + result, true),
                formulaTerm(result + "∈S", ok)
            ].join("");
        } else {
            formulaText.innerHTML = [
                formulaTerm("∘:S×S→S", false),
                formulaTerm(operands[0] + " " + c.symbol + " " + operands[1], true),
                formulaTerm("=" + result, true),
                formulaTerm(String(result) + (ok ? "∈S" : "∉S"), true)
            ].join("");
        }
        resultValue.innerHTML = chip(ok, ok ? "本步闭合" : "发现越界");
        resultExtra.textContent = "反馈：" + c.feedback;
    }

    function renderAll() {
        updateTypeButtons();
        renderCaseSelector();
        renderDefinition();
        renderExamples();
        renderStepPanel();
        renderTable();
        renderMap();
        renderProperties();
        renderFormula();
    }

    function loadType(type) {
        currentType = type;
        currentCaseIndex = 0;
        stepIndex = 0;
        renderAll();
    }

    function moveStep(delta) {
        const c = currentCase();
        stepIndex = (stepIndex + delta + c.samples.length) % c.samples.length;
        renderStepPanel();
        renderTable();
        renderMap();
        renderFormula();
    }

    function reset() {
        stepIndex = 0;
        renderAll();
    }

    function bind() {
        typeButtons.forEach(btn => btn.addEventListener("click", () => loadType(btn.dataset.type)));
        caseSelector.addEventListener("change", event => {
            currentCaseIndex = Number(event.target.value);
            stepIndex = 0;
            renderAll();
        });
        prevStepBtn.addEventListener("click", () => moveStep(-1));
        nextStepBtn.addEventListener("click", () => moveStep(1));
        demoBtn.addEventListener("click", () => moveStep(1));
        resetBtn.addEventListener("click", reset);
    }

    function init() {
        setMission();
        currentType = layerConfig.initialType || currentType;
        bind();
        renderAll();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
