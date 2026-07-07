(function () {
    "use strict";

    const tier = document.body.dataset.tier || "basic";
    const $ = (id) => document.getElementById(id);
    const ns = "http://www.w3.org/2000/svg";

    const mod = (x, n) => ((x % n) + n) % n;
    const setFmt = (arr) => "{" + arr.join(",") + "}";
    const union = (a, b) => Array.from(new Set([...a, ...b])).sort();
    const inter = (a, b) => a.filter((x) => b.includes(x)).sort();
    const eqArr = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
    const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

    const DATA = {
        basic: {
            label: "基础层",
            title: "结合与交换定律",
            subtitle: "小集合上逐步验算：换括号、换顺序，结果是否保持一致。",
            intro: "选择一个运算，点击下一步观察图中节点、公式项和运算表同步高亮。",
            cases: [
                {
                    id: "z4-add-assoc",
                    name: "Z4 加法验证结合律",
                    law: "结合律",
                    kind: "assoc",
                    badge: "规则成立",
                    setName: "Z4",
                    symbols: [0, 1, 2, 3],
                    values: { a: 1, b: 2, c: 3 },
                    opLabel: "加法 mod 4",
                    opSymbol: "⊕",
                    op: (x, y) => mod(x + y, 4),
                    summary: "模加法可先合并任意两项，最终余数不变。"
                },
                {
                    id: "max-comm",
                    name: "取最大值验证交换律",
                    law: "交换律",
                    kind: "comm",
                    badge: "顺序可换",
                    setName: "{1,2,3,4}",
                    symbols: [1, 2, 3, 4],
                    values: { a: 2, b: 4 },
                    opLabel: "max",
                    opSymbol: "∨",
                    op: (x, y) => Math.max(x, y),
                    summary: "取最大只看谁更大，与左右顺序无关。"
                },
                {
                    id: "sub-assoc-bad",
                    name: "整数减法寻找结合律反例",
                    law: "结合律",
                    kind: "assoc",
                    badge: "发现反例",
                    setName: "整数样本",
                    symbols: [2, 3, 8],
                    values: { a: 8, b: 3, c: 2 },
                    opLabel: "整数减法",
                    opSymbol: "−",
                    op: (x, y) => x - y,
                    summary: "减法换括号会改变谁被减去，因此一个样本就能暴露不满足结合律。"
                }
            ]
        },
        extend: {
            label: "拓展层",
            title: "定律迁移与表达式化简",
            subtitle: "把定律迁移到集合、消去与并行计算，观察成立条件与反例边界。",
            intro: "拓展层不只算一个结果，还要看定律能否支持化简、分块、消去或发现反例。",
            cases: [
                {
                    id: "set-distribution",
                    name: "集合分配律：交对并",
                    law: "分配律",
                    kind: "distrib",
                    badge: "可化简",
                    values: { a: ["1", "2"], b: ["2", "3"], c: ["1", "3"] },
                    opOuter: "∩",
                    opInner: "∪",
                    summary: "先把 B 与 C 合并再与 A 求交，等价于 A 分别作用后再求并。"
                },
                {
                    id: "set-absorption",
                    name: "集合吸收律：核心保留",
                    law: "吸收律",
                    kind: "absorb",
                    badge: "可吸收",
                    values: { a: ["x", "z"], b: ["z"] },
                    opOuter: "∪",
                    opInner: "∩",
                    summary: "A 已经覆盖 A∩B，外层并集不会再改变 A。"
                },
                {
                    id: "mod6-cancel-bad",
                    name: "模 6 乘法消去律反例",
                    law: "消去律",
                    kind: "cancel",
                    badge: "反例边界",
                    modN: 6,
                    values: { a: 2, b: 1, c: 4 },
                    opSymbol: "×",
                    opLabel: "乘法 mod 6",
                    op: (x, y) => mod(x * y, 6),
                    summary: "2×1 与 2×4 在 mod 6 下同余，但 1≠4，说明不能随意消去 2。"
                },
                {
                    id: "mapreduce-assoc",
                    name: "并行求和依赖结合律",
                    law: "结合律",
                    kind: "assoc",
                    badge: "可分块",
                    setName: "整数求和",
                    symbols: [1, 2, 4, 5, 7],
                    values: { a: 2, b: 5, c: 7 },
                    opLabel: "加法",
                    opSymbol: "+",
                    op: (x, y) => x + y,
                    summary: "分块先算再汇总，与顺序左折得到同一结果，这是并行聚合的前提。"
                }
            ]
        }
    };

    const els = {
        title: $("lawTitle"),
        subtitle: $("lawSubtitle"),
        intro: $("lawIntro"),
        caseSelect: $("caseSelect"),
        stepList: $("stepList"),
        prev: $("prevStep"),
        next: $("nextStep"),
        auto: $("autoStep"),
        reset: $("resetStep"),
        svg: $("lawSvg"),
        formula: $("formulaBox"),
        feedback: $("feedbackBox"),
        table: $("tableBox"),
        badge: $("verdictBadge"),
        lawName: $("lawName"),
        stepCount: $("stepCount"),
        activeValue: $("activeValue"),
        leftResult: $("leftResult"),
        rightResult: $("rightResult"),
        compareResult: $("compareResult")
    };

    let state = {
        caseIndex: 0,
        step: 0,
        steps: [],
        timer: null
    };

    function formatValue(v) {
        return Array.isArray(v) ? setFmt(v) : String(v);
    }

    function computeCase(c) {
        if (c.kind === "assoc") return computeAssoc(c);
        if (c.kind === "comm") return computeComm(c);
        if (c.kind === "distrib") return computeDistrib(c);
        if (c.kind === "absorb") return computeAbsorb(c);
        return computeCancel(c);
    }

    function computeAssoc(c) {
        const { a, b, c: cc } = c.values;
        const ab = c.op(a, b);
        const bc = c.op(b, cc);
        const left = c.op(ab, cc);
        const right = c.op(a, bc);
        const ok = left === right;
        return {
            left,
            right,
            ok,
            leftExpr: [`(${a} ${c.opSymbol} ${b})`, `${c.opSymbol} ${cc}`, `= ${left}`],
            rightExpr: [`${a} ${c.opSymbol}`, `(${b} ${c.opSymbol} ${cc})`, `= ${right}`],
            steps: [
                { title: "建立样本", desc: `在 ${c.setName || "样本集合"} 中取 a=${a}, b=${b}, c=${cc}。`, hot: ["a", "b", "c"], formula: [] },
                { title: "左侧先算 a 与 b", desc: `${a} ${c.opSymbol} ${b} = ${ab}。`, hot: ["a", "b", "left-mid"], edges: ["a-left-mid", "b-left-mid"], formula: ["L0"], cells: [[a, b]] },
                { title: "左侧再与 c 运算", desc: `${ab} ${c.opSymbol} ${cc} = ${left}。`, hot: ["left-mid", "c", "left-out"], edges: ["left-mid-left-out", "c-left-out"], formula: ["L1", "L2"], cells: [[ab, cc]] },
                { title: "右侧先算 b 与 c", desc: `${b} ${c.opSymbol} ${cc} = ${bc}。`, hot: ["b", "c", "right-mid"], edges: ["b-right-mid", "c-right-mid"], formula: ["R1"], cells: [[b, cc]] },
                { title: "右侧再与 a 运算", desc: `${a} ${c.opSymbol} ${bc} = ${right}。`, hot: ["a", "right-mid", "right-out"], edges: ["a-right-out", "right-mid-right-out"], formula: ["R0", "R2"], cells: [[a, bc]] },
                { title: ok ? "比较一致" : "比较出现反例", desc: ok ? `两侧都等于 ${left}，本样本支持${c.law}。` : `左侧 ${left}，右侧 ${right}，该运算不满足${c.law}。`, hot: ["left-out", "right-out", "compare"], edges: ["left-out-compare", "right-out-compare"], formula: ["L2", "R2"] }
            ]
        };
    }

    function computeComm(c) {
        const { a, b } = c.values;
        const left = c.op(a, b);
        const right = c.op(b, a);
        const ok = left === right;
        return {
            left,
            right,
            ok,
            leftExpr: [`${a}`, `${c.opSymbol}`, `${b}`, `= ${left}`],
            rightExpr: [`${b}`, `${c.opSymbol}`, `${a}`, `= ${right}`],
            steps: [
                { title: "建立二元样本", desc: `取 a=${a}, b=${b}，比较 a ${c.opSymbol} b 与 b ${c.opSymbol} a。`, hot: ["a", "b"], formula: [] },
                { title: "按原顺序运算", desc: `${a} ${c.opSymbol} ${b} = ${left}。`, hot: ["a", "b", "left-out"], edges: ["a-left-out", "b-left-out"], formula: ["L0", "L1", "L2", "L3"], cells: [[a, b]] },
                { title: "交换顺序再运算", desc: `${b} ${c.opSymbol} ${a} = ${right}。`, hot: ["a", "b", "right-out"], edges: ["b-right-out", "a-right-out"], formula: ["R0", "R1", "R2", "R3"], cells: [[b, a]] },
                { title: ok ? "顺序不影响结果" : "顺序影响结果", desc: ok ? `两侧同为 ${left}，满足交换律。` : `两侧不同，得到一个交换律反例。`, hot: ["left-out", "right-out", "compare"], edges: ["left-out-compare", "right-out-compare"], formula: ["L3", "R3"] }
            ]
        };
    }

    function computeDistrib(c) {
        const { a, b, c: cc } = c.values;
        const inner = union(b, cc);
        const left = inter(a, inner);
        const ab = inter(a, b);
        const ac = inter(a, cc);
        const right = union(ab, ac);
        const ok = eqArr(left, right);
        return {
            left: formatValue(left),
            right: formatValue(right),
            ok,
            leftExpr: [`A ${c.opOuter}`, `(B ${c.opInner} C)`, `= ${formatValue(left)}`],
            rightExpr: [`(A ${c.opOuter} B)`, `${c.opInner}`, `(A ${c.opOuter} C)`, `= ${formatValue(right)}`],
            steps: [
                { title: "抽取集合", desc: `A=${formatValue(a)}，B=${formatValue(b)}，C=${formatValue(cc)}。`, hot: ["a", "b", "c"], formula: [] },
                { title: "左侧先求 B∪C", desc: `B∪C = ${formatValue(inner)}。`, hot: ["b", "c", "right-mid"], edges: ["b-right-mid", "c-right-mid"], formula: ["L1"] },
                { title: "左侧再与 A 求交", desc: `A∩(B∪C) = ${formatValue(left)}。`, hot: ["a", "right-mid", "left-out"], edges: ["a-left-out", "right-mid-left-out"], formula: ["L0", "L2"] },
                { title: "右侧分别求交", desc: `A∩B=${formatValue(ab)}，A∩C=${formatValue(ac)}。`, hot: ["a", "b", "c", "left-mid", "right-out"], edges: ["a-left-mid", "b-left-mid", "a-right-out", "c-right-out"], formula: ["R0", "R2"] },
                { title: "右侧合并两个结果", desc: `${formatValue(ab)}∪${formatValue(ac)} = ${formatValue(right)}。`, hot: ["left-mid", "right-out", "compare"], edges: ["left-mid-compare", "right-out-compare"], formula: ["R1", "R3"] },
                { title: "定律支撑化简", desc: ok ? "两条路径一致，可安全地展开或因式化集合表达式。" : "结果不同，不能进行该化简。", hot: ["left-out", "compare"], formula: ["L2", "R3"] }
            ]
        };
    }

    function computeAbsorb(c) {
        const { a, b } = c.values;
        const inner = inter(a, b);
        const left = union(a, inner);
        const right = a.slice().sort();
        const ok = eqArr(left, right);
        return {
            left: formatValue(left),
            right: formatValue(right),
            ok,
            leftExpr: [`A ${c.opOuter}`, `(A ${c.opInner} B)`, `= ${formatValue(left)}`],
            rightExpr: [`A`, `= ${formatValue(right)}`],
            steps: [
                { title: "锁定核心集合 A", desc: `A=${formatValue(a)}，B=${formatValue(b)}。`, hot: ["a", "b"], formula: [] },
                { title: "先找 A 与 B 的共同部分", desc: `A∩B = ${formatValue(inner)}。`, hot: ["a", "b", "left-mid"], edges: ["a-left-mid", "b-left-mid"], formula: ["L1"] },
                { title: "再并回 A", desc: `A∪(A∩B) = ${formatValue(left)}。`, hot: ["a", "left-mid", "left-out"], edges: ["a-left-out", "left-mid-left-out"], formula: ["L0", "L2"] },
                { title: "比较核心是否改变", desc: ok ? "结果仍为 A，冗余部分被 A 吸收。" : "结果改变，吸收律不成立。", hot: ["left-out", "right-out", "compare"], edges: ["left-out-compare", "right-out-compare"], formula: ["L2", "R0", "R1"] }
            ]
        };
    }

    function computeCancel(c) {
        const { a, b, c: cc } = c.values;
        const left = c.op(a, b);
        const right = c.op(a, cc);
        const ok = left === right && b === cc;
        return {
            left,
            right,
            ok,
            leftExpr: [`${a} ${c.opSymbol} ${b}`, `= ${left}`],
            rightExpr: [`${a} ${c.opSymbol} ${cc}`, `= ${right}`],
            steps: [
                { title: "构造同左因子样本", desc: `公共因子 a=${a}，比较 b=${b} 与 c=${cc}。`, hot: ["a", "b", "c"], formula: [] },
                { title: "计算左侧", desc: `${a} ${c.opSymbol} ${b} ≡ ${left} (mod ${c.modN})。`, hot: ["a", "b", "left-out"], edges: ["a-left-out", "b-left-out"], formula: ["L0", "L1"], cells: [[a, b]] },
                { title: "计算右侧", desc: `${a} ${c.opSymbol} ${cc} ≡ ${right} (mod ${c.modN})。`, hot: ["a", "c", "right-out"], edges: ["a-right-out", "c-right-out"], formula: ["R0", "R1"], cells: [[a, cc]] },
                { title: "尝试消去公共因子", desc: left === right ? `两侧结果同为 ${left}，但 b=${b}，c=${cc}。` : "两侧结果不同，消去前提不成立。", hot: ["left-out", "right-out", "compare"], edges: ["left-out-compare", "right-out-compare"], formula: ["L1", "R1"] },
                { title: ok ? "消去有效" : "发现消去律反例", desc: ok ? "消去后仍有 b=c，样本没有破坏消去律。" : "结果相同但 b≠c，说明该结构中不能随意消去公共因子。", hot: ["compare"], formula: ["L0", "R0"] }
            ]
        };
    }

    function setCase(index) {
        state.caseIndex = index;
        state.step = 0;
        stopAuto();
        build();
    }

    function currentCase() {
        return DATA[tier].cases[state.caseIndex];
    }

    function build() {
        const c = currentCase();
        const model = computeCase(c);
        state.steps = model.steps;
        state.model = model;
        render();
    }

    function render() {
        const c = currentCase();
        const model = state.model;
        const step = model.steps[state.step];
        els.title.textContent = c.name;
        els.subtitle.textContent = c.summary;
        els.badge.textContent = state.step === model.steps.length - 1 ? (model.ok ? "定律成立" : "反例成立") : c.badge;
        els.badge.className = "law-badge " + (state.step === model.steps.length - 1 ? (model.ok ? "ok" : "fail") : "");
        els.lawName.textContent = c.law;
        els.stepCount.textContent = `${state.step + 1}/${model.steps.length}`;
        els.activeValue.textContent = step.title;
        els.leftResult.textContent = formatValue(model.left);
        els.rightResult.textContent = formatValue(model.right);
        els.compareResult.textContent = model.ok ? "一致" : "不一致";
        renderSteps();
        renderFormula();
        renderFeedback();
        renderTable();
        renderGraph();
        els.prev.disabled = state.step === 0;
        els.next.disabled = state.step === state.steps.length - 1;
    }

    function renderSteps() {
        els.stepList.innerHTML = state.steps.map((s, i) => `
            <button class="law-step-chip${i === state.step ? " is-active" : ""}${i < state.step ? " is-done" : ""}" data-step="${i}" type="button">
                <b>${i + 1}</b><span>${esc(s.title)}</span>
            </button>
        `).join("");
    }

    function renderFormula() {
        const step = state.steps[state.step];
        const hot = new Set(step.formula || []);
        const line = (prefix, parts, side) => `
            <div class="law-formula-line">
                <strong>${prefix}</strong>
                ${parts.map((part, i) => `<span class="law-term${hot.has(side + i) ? " hot" : (state.step === state.steps.length - 1 ? " done" : "")}">${esc(part)}</span>`).join("")}
            </div>`;
        els.formula.innerHTML = `
            <h3>公式项同步高亮</h3>
            <div class="law-formula-lines">
                ${line("左侧", state.model.leftExpr, "L")}
                ${line("右侧", state.model.rightExpr, "R")}
            </div>
        `;
    }

    function renderFeedback() {
        const step = state.steps[state.step];
        els.feedback.innerHTML = `
            <h3>${esc(step.title)}</h3>
            <p>${esc(step.desc)}</p>
            <p class="hint">提示：点击左侧步骤条可回看任意一步；图、公式和运算表会跟随当前步骤同步变化。</p>
        `;
    }

    function renderTable() {
        const c = currentCase();
        const step = state.steps[state.step];
        if (!c.symbols && c.kind !== "cancel") {
            els.table.innerHTML = `<h3>结构观察</h3><p class="law-tier-intro">${esc(c.summary)}</p>`;
            return;
        }
        const symbols = c.symbols || [0, 1, 2, 3, 4, 5];
        const op = c.op || ((x, y) => mod(x * y, c.modN));
        const hotCells = new Set((step.cells || []).map((cell) => cell.join(",")));
        const rows = symbols.map((r) => `<tr><th>${r}</th>${symbols.map((col) => `<td class="${hotCells.has([r, col].join(",")) ? "hot" : ""}">${op(r, col)}</td>`).join("")}</tr>`).join("");
        els.table.innerHTML = `
            <h3>${esc(c.opLabel || "运算表")}</h3>
            <table class="law-table">
                <thead><tr><th>${esc(c.opSymbol || "∘")}</th>${symbols.map((s) => `<th>${s}</th>`).join("")}</tr></thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    function svgEl(name, attrs) {
        const node = document.createElementNS(ns, name);
        Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
        return node;
    }

    function renderGraph() {
        const c = currentCase();
        const step = state.steps[state.step];
        const hot = new Set(step.hot || []);
        const hotEdges = new Set(step.edges || []);
        const rect = els.svg.getBoundingClientRect();
        const w = Math.max(720, rect.width || 720);
        const h = Math.max(320, rect.height || 320);
        els.svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        els.svg.innerHTML = "";
        const nodes = graphNodes(c, w, h);
        const edges = graphEdges(c);
        edges.forEach((edge) => {
            const a = nodes[edge[0]];
            const b = nodes[edge[1]];
            if (!a || !b) return;
            const line = svgEl("line", {
                x1: a.x,
                y1: a.y,
                x2: b.x,
                y2: b.y,
                class: `law-svg-edge ${hotEdges.has(edge.join("-")) ? "hot" : ""}`
            });
            els.svg.appendChild(line);
        });
        Object.entries(nodes).forEach(([id, n]) => {
            const g = svgEl("g", { class: `law-svg-node ${hot.has(id) ? "hot" : ""} ${state.step === state.steps.length - 1 ? "done" : ""}` });
            if (n.round) {
                g.appendChild(svgEl("circle", { cx: n.x, cy: n.y, r: n.r || 36 }));
            } else {
                g.appendChild(svgEl("rect", { x: n.x - n.w / 2, y: n.y - n.h / 2, width: n.w, height: n.h, rx: 8 }));
            }
            const t = svgEl("text", { x: n.x, y: n.y - (n.sub ? 7 : 0) });
            t.textContent = n.label;
            g.appendChild(t);
            if (n.sub) {
                const s = svgEl("text", { x: n.x, y: n.y + 15, class: "sub" });
                s.textContent = n.sub;
                g.appendChild(s);
            }
            els.svg.appendChild(g);
        });
    }

    function graphNodes(c, w, h) {
        const inputY = 58;
        const midY = h * 0.42;
        const outY = h * 0.72;
        const cmpY = h - 48;
        const cx = w / 2;
        const vals = c.values;
        const base = {
            a: { x: w * 0.2, y: inputY, label: "a", sub: formatValue(vals.a), round: true },
            b: { x: cx, y: inputY, label: "b", sub: formatValue(vals.b), round: true },
            c: { x: w * 0.8, y: inputY, label: "c", sub: formatValue(vals.c || ""), round: true },
            "left-mid": { x: w * 0.28, y: midY, label: c.opInner || c.opSymbol || "∘", sub: "先合并", w: 104, h: 54 },
            "right-mid": { x: w * 0.72, y: midY, label: c.opInner || c.opSymbol || "∘", sub: "先合并", w: 104, h: 54 },
            "left-out": { x: w * 0.28, y: outY, label: "左侧", sub: formatValue(state.model.left), w: 112, h: 56 },
            "right-out": { x: w * 0.72, y: outY, label: "右侧", sub: formatValue(state.model.right), w: 112, h: 56 },
            compare: { x: cx, y: cmpY, label: state.model.ok ? "=" : "≠", sub: state.model.ok ? "一致" : "反例", w: 92, h: 50 }
        };
        if (c.kind === "comm") {
            base.a.x = w * 0.34;
            base.b.x = w * 0.66;
            base["left-out"].x = w * 0.32;
            base["right-out"].x = w * 0.68;
            delete base.c;
            delete base["left-mid"];
            delete base["right-mid"];
        }
        if (c.kind === "absorb") {
            delete base.c;
            base.a.x = w * 0.34;
            base.b.x = w * 0.66;
            base["right-out"].label = "A";
            base["right-out"].sub = formatValue(vals.a);
        }
        return base;
    }

    function graphEdges(c) {
        if (c.kind === "comm") {
            return [["a", "left-out"], ["b", "left-out"], ["b", "right-out"], ["a", "right-out"], ["left-out", "compare"], ["right-out", "compare"]];
        }
        if (c.kind === "distrib") {
            return [["b", "right-mid"], ["c", "right-mid"], ["a", "left-out"], ["right-mid", "left-out"], ["a", "left-mid"], ["b", "left-mid"], ["a", "right-out"], ["c", "right-out"], ["left-mid", "compare"], ["right-out", "compare"], ["left-out", "compare"]];
        }
        if (c.kind === "absorb") {
            return [["a", "left-mid"], ["b", "left-mid"], ["a", "left-out"], ["left-mid", "left-out"], ["a", "right-out"], ["left-out", "compare"], ["right-out", "compare"]];
        }
        if (c.kind === "cancel") {
            return [["a", "left-out"], ["b", "left-out"], ["a", "right-out"], ["c", "right-out"], ["left-out", "compare"], ["right-out", "compare"]];
        }
        return [["a", "left-mid"], ["b", "left-mid"], ["left-mid", "left-out"], ["c", "left-out"], ["b", "right-mid"], ["c", "right-mid"], ["a", "right-out"], ["right-mid", "right-out"], ["left-out", "compare"], ["right-out", "compare"], ["left-mid", "compare"], ["right-out", "compare"]];
    }

    function stopAuto() {
        if (state.timer) {
            clearInterval(state.timer);
            state.timer = null;
        }
        if (els.auto) els.auto.textContent = "自动";
    }

    function init() {
        const cfg = DATA[tier];
        document.title = `${cfg.title} - ${cfg.label}`;
        $("tierLabel").textContent = cfg.label;
        $("pageTitle").textContent = cfg.title;
        $("pageSubtitle").textContent = cfg.subtitle;
        els.intro.textContent = cfg.intro;
        els.caseSelect.innerHTML = cfg.cases.map((c, i) => `<option value="${i}">${esc(c.name)}</option>`).join("");
        els.caseSelect.addEventListener("change", (event) => setCase(Number(event.target.value)));
        els.prev.addEventListener("click", () => {
            stopAuto();
            state.step = Math.max(0, state.step - 1);
            render();
        });
        els.next.addEventListener("click", () => {
            stopAuto();
            state.step = Math.min(state.steps.length - 1, state.step + 1);
            render();
        });
        els.reset.addEventListener("click", () => {
            stopAuto();
            state.step = 0;
            render();
        });
        els.auto.addEventListener("click", () => {
            if (state.timer) {
                stopAuto();
                return;
            }
            els.auto.textContent = "暂停";
            state.timer = setInterval(() => {
                if (state.step >= state.steps.length - 1) {
                    stopAuto();
                    return;
                }
                state.step += 1;
                render();
            }, tier === "basic" ? 1050 : 1250);
        });
        els.stepList.addEventListener("click", (event) => {
            const btn = event.target.closest("[data-step]");
            if (!btn) return;
            stopAuto();
            state.step = Number(btn.dataset.step);
            render();
        });
        window.addEventListener("resize", render);
        build();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
