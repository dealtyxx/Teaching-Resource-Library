(function () {
    "use strict";

    const tier = document.body.dataset.tier || "basic";
    const config = {
        basic: {
            cases: [
                { id: "textbook", name: "教材例题 A-D", items: [["A", 5], ["B", 7], ["C", 2], ["D", 3]] },
                { id: "balanced", name: "接近均衡", items: [["A", 4], ["B", 5], ["C", 6], ["D", 7]] },
                { id: "skewed", name: "差异明显", items: [["A", 9], ["B", 4], ["C", 2], ["D", 1]] }
            ],
            prompt: "先观察优先队列，再逐步合并两个最小权节点。",
            finalLabel: "WPL 最终值"
        },
        extend: {
            cases: [
                { id: "course", name: "课程短句", text: "离散数学树图树图编码" },
                { id: "log", name: "传感日志", text: "AAAABBBCCD" },
                { id: "english", name: "英文样本", text: "HUFFMAN DATA" }
            ],
            prompt: "从真实文本统计频率，比较固定长度、Huffman 平均码长与熵下界。",
            finalLabel: "平均码长与熵"
        }
    };

    const $ = (id) => document.getElementById(id);
    const els = {
        caseSelect: $("caseSelect"),
        weightControls: $("weightControls"),
        sourceText: $("sourceText"),
        prevBtn: $("prevStepBtn"),
        nextBtn: $("nextStepBtn"),
        resetBtn: $("resetBtn"),
        statusText: $("statusText"),
        stepCount: $("stepCount"),
        charCount: $("charCount"),
        totalWeight: $("totalWeight"),
        currentCost: $("currentCost"),
        formulaTrack: $("formulaTrack"),
        queueTrack: $("queueTrack"),
        feedback: $("stepFeedback"),
        codeTable: $("codeTable"),
        svg: $("treeSvg"),
        edgesGroup: $("edgesGroup"),
        nodesGroup: $("nodesGroup")
    };

    let serial = 0;
    let state = null;
    let selectedLabel = "";

    class HuffmanNode {
        constructor(label, freq, left = null, right = null) {
            this.id = "n" + (++serial);
            this.label = label;
            this.freq = freq;
            this.left = left;
            this.right = right;
            this.order = serial;
            this.x = 0;
            this.y = 0;
        }
        isLeaf() {
            return !this.left && !this.right;
        }
    }

    function esc(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        })[ch]);
    }

    function createSvg(type, attrs) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", type);
        Object.entries(attrs || {}).forEach(([key, value]) => el.setAttribute(key, value));
        return el;
    }

    function compareNode(a, b) {
        return a.freq - b.freq || a.order - b.order;
    }

    function sum(items) {
        return items.reduce((acc, item) => acc + item.freq, 0);
    }

    function getInputItems() {
        if (tier === "extend") {
            const text = (els.sourceText.value || "").trim() || config.extend.cases[0].text;
            const counts = new Map();
            Array.from(text).forEach((ch) => counts.set(ch, (counts.get(ch) || 0) + 1));
            return Array.from(counts.entries()).map(([label, freq]) => ({ label, freq }));
        }

        return Array.from(els.weightControls.querySelectorAll("input[type='range']")).map((input) => ({
            label: input.dataset.label,
            freq: Number(input.value)
        }));
    }

    function buildModel(items) {
        serial = 0;
        const leaves = items.map((item) => new HuffmanNode(item.label, item.freq));
        let queue = leaves.slice().sort(compareNode);
        const snapshots = [{
            roots: queue.slice(),
            queue: queue.slice(),
            activeIds: [],
            activeEdges: [],
            merge: null
        }];
        const merges = [];

        while (queue.length > 1) {
            queue = queue.slice().sort(compareNode);
            const left = queue.shift();
            const right = queue.shift();
            const parent = new HuffmanNode(null, left.freq + right.freq, left, right);
            const merge = {
                left,
                right,
                parent,
                cost: parent.freq,
                index: merges.length + 1
            };
            merges.push(merge);
            queue.push(parent);
            queue = queue.slice().sort(compareNode);
            snapshots.push({
                roots: queue.slice(),
                queue: queue.slice(),
                activeIds: [left.id, right.id, parent.id],
                activeEdges: [`${parent.id}-${left.id}`, `${parent.id}-${right.id}`],
                merge
            });
        }

        const root = queue[0] || null;
        const codes = new Map();
        const depths = new Map();
        walkCodes(root, "", 0, codes, depths);

        return {
            items,
            leaves,
            root,
            merges,
            snapshots,
            codes,
            depths,
            total: sum(items),
            step: 0
        };
    }

    function walkCodes(node, code, depth, codes, depths) {
        if (!node) return;
        if (node.isLeaf()) {
            codes.set(node.label, code || "0");
            depths.set(node.label, Math.max(1, depth));
            return;
        }
        walkCodes(node.left, code + "0", depth + 1, codes, depths);
        walkCodes(node.right, code + "1", depth + 1, codes, depths);
    }

    function countLeaves(node) {
        if (!node) return 0;
        return node.isLeaf() ? 1 : countLeaves(node.left) + countLeaves(node.right);
    }

    function depth(node) {
        if (!node) return 0;
        return 1 + Math.max(depth(node.left), depth(node.right));
    }

    function assignPositions(node, left, right, y, gapY) {
        if (!node) return;
        node.x = (left + right) / 2;
        node.y = y;
        if (node.isLeaf()) return;
        const leftLeaves = countLeaves(node.left);
        const rightLeaves = countLeaves(node.right);
        const totalLeaves = Math.max(1, leftLeaves + rightLeaves);
        const mid = left + ((right - left) * leftLeaves / totalLeaves);
        assignPositions(node.left, left, mid, y + gapY, gapY);
        assignPositions(node.right, mid, right, y + gapY, gapY);
    }

    function layoutForest(roots) {
        const width = els.svg.clientWidth || 920;
        const height = els.svg.clientHeight || 520;
        const pad = 52;
        const gap = Math.max(18, width * 0.018);
        const totalLeaves = Math.max(1, roots.reduce((acc, root) => acc + countLeaves(root), 0));
        const maxDepth = Math.max(1, ...roots.map(depth));
        const gapY = Math.min(76, Math.max(30, (height - 62) / Math.max(1, maxDepth - 1)));
        const startY = Math.max(32, Math.min(54, height * 0.15));
        const usable = Math.max(160, width - pad * 2 - gap * Math.max(0, roots.length - 1));
        const minSpan = Math.max(58, Math.min(92, usable / Math.max(1, totalLeaves)));
        let cursor = pad;
        roots.forEach((root) => {
            const span = Math.max(minSpan, usable * countLeaves(root) / totalLeaves);
            assignPositions(root, cursor, cursor + span, startY, gapY);
            cursor += span + gap;
        });
    }

    function pathForLabel(node, label, edges) {
        if (!node) return false;
        if (node.isLeaf()) return node.label === label;
        if (pathForLabel(node.left, label, edges)) {
            edges.push(`${node.id}-${node.left.id}`);
            return true;
        }
        if (pathForLabel(node.right, label, edges)) {
            edges.push(`${node.id}-${node.right.id}`);
            return true;
        }
        return false;
    }

    function renderTree() {
        const snap = state.snapshots[state.step];
        const pathEdges = [];
        if (selectedLabel && state.root) pathForLabel(state.root, selectedLabel, pathEdges);
        const activeIds = new Set(snap.activeIds || []);
        const activeEdges = new Set([...(snap.activeEdges || []), ...pathEdges]);
        const selectedCode = selectedLabel ? state.codes.get(selectedLabel) : "";

        els.nodesGroup.innerHTML = "";
        els.edgesGroup.innerHTML = "";
        layoutForest(snap.roots);
        snap.roots.forEach((root) => renderEdges(root, activeEdges));
        snap.roots.forEach((root) => renderNode(root, activeIds, activeEdges, selectedLabel, selectedCode));
    }

    function renderEdges(node, activeEdges) {
        if (!node || node.isLeaf()) return;
        [[node.left, "left", "0"], [node.right, "right", "1"]].forEach(([child, side, bit]) => {
            if (!child) return;
            const key = `${node.id}-${child.id}`;
            const line = createSvg("line", {
                x1: node.x,
                y1: node.y,
                x2: child.x,
                y2: child.y,
                class: `tree-edge ${side}${activeEdges.has(key) ? " active" : ""}`
            });
            els.edgesGroup.appendChild(line);
            const label = createSvg("text", {
                x: (node.x + child.x) / 2 + (side === "left" ? -10 : 10),
                y: (node.y + child.y) / 2,
                class: `edge-label ${side}${activeEdges.has(key) ? " active" : ""}`,
                "text-anchor": "middle",
                dy: ".35em"
            });
            label.textContent = bit;
            els.edgesGroup.appendChild(label);
            renderEdges(child, activeEdges);
        });
    }

    function renderNode(node, activeIds, activeEdges, selected, code) {
        if (!node) return;
        const isSelected = node.isLeaf() && node.label === selected;
        const cls = [
            "tree-node",
            node.isLeaf() ? "leaf" : "internal",
            activeIds.has(node.id) || isSelected ? "active" : "",
            isSelected ? "selected" : ""
        ].filter(Boolean).join(" ");
        const g = createSvg("g", {
            class: cls,
            transform: `translate(${node.x}, ${node.y})`
        });
        g.dataset.nodeId = node.id;

        const circle = createSvg("circle", { r: node.isLeaf() ? 28 : 30, class: "tree-node-circle" });
        const text = createSvg("text", {
            class: "tree-node-text",
            "text-anchor": "middle",
            dy: node.isLeaf() ? "-0.1em" : "-0.2em"
        });
        text.textContent = node.isLeaf() ? node.label : node.freq;
        g.appendChild(circle);
        g.appendChild(text);

        const weight = createSvg("text", {
            class: "tree-node-weight",
            "text-anchor": "middle",
            dy: node.isLeaf() ? "1.15em" : "1.2em"
        });
        weight.textContent = node.isLeaf() ? `w=${node.freq}` : `sum=${node.freq}`;
        g.appendChild(weight);

        if (isSelected && code) {
            const codeText = createSvg("text", {
                class: "tree-node-code",
                "text-anchor": "middle",
                dy: "2.35em"
            });
            codeText.textContent = code;
            g.appendChild(codeText);
        }

        els.nodesGroup.appendChild(g);
        renderNode(node.left, activeIds, activeEdges, selected, code);
        renderNode(node.right, activeIds, activeEdges, selected, code);
    }

    function renderQueue() {
        const snap = state.snapshots[state.step];
        const active = new Set(snap.activeIds || []);
        els.queueTrack.innerHTML = snap.queue.map((node, index) => {
            const name = node.isLeaf() ? node.label : "合并" + node.freq;
            return `<span class="queue-chip${active.has(node.id) ? " active" : ""}"><b>${index + 1}</b>${esc(name)}:${node.freq}</span>`;
        }).join("");
    }

    function renderFormula() {
        const completed = state.merges.slice(0, state.step);
        const activeIndex = state.step - 1;
        if (!completed.length) {
            els.formulaTrack.innerHTML = `<span class="formula-token active">按权重升序排列</span><span class="formula-token">每一步选择两个最小项</span>`;
            return;
        }
        const tokens = completed.map((merge, index) => {
            const left = merge.left.isLeaf() ? merge.left.label : merge.left.freq;
            const right = merge.right.isLeaf() ? merge.right.label : merge.right.freq;
            return `<span class="formula-token${index === activeIndex ? " active" : ""}">${esc(left)}:${merge.left.freq} + ${esc(right)}:${merge.right.freq} = ${merge.cost}</span>`;
        });
        const partial = completed.reduce((acc, merge) => acc + merge.cost, 0);
        tokens.push(`<span class="formula-token total">${state.step === state.merges.length ? "WPL" : "已累加"} = ${partial}</span>`);

        if (tier === "extend" && state.step === state.merges.length) {
            const metrics = getMetrics();
            tokens.push(`<span class="formula-token metric">H = ${metrics.entropy.toFixed(3)}</span>`);
            tokens.push(`<span class="formula-token metric">L = ${metrics.avgLength.toFixed(3)}</span>`);
        }
        els.formulaTrack.innerHTML = tokens.join("");
    }

    function getMetrics() {
        const total = state.total || 1;
        const symbolCount = state.items.length;
        const fixedLength = Math.max(1, Math.ceil(Math.log2(Math.max(1, symbolCount))));
        let huffmanBits = 0;
        let entropy = 0;
        state.items.forEach((item) => {
            const p = item.freq / total;
            const len = state.codes.get(item.label)?.length || 1;
            huffmanBits += item.freq * len;
            entropy += p > 0 ? -p * Math.log2(p) : 0;
        });
        const fixedBits = total * fixedLength;
        return {
            fixedLength,
            fixedBits,
            huffmanBits,
            avgLength: huffmanBits / total,
            entropy,
            ratio: fixedBits ? (1 - huffmanBits / fixedBits) * 100 : 0
        };
    }

    function renderCodeTable() {
        const final = state.step === state.merges.length;
        const rows = state.items.slice().sort((a, b) => b.freq - a.freq || a.label.localeCompare(b.label));
        els.codeTable.innerHTML = "";
        rows.forEach((item) => {
            const entry = document.createElement("button");
            entry.type = "button";
            entry.className = "code-entry";
            entry.dataset.label = item.label;
            if (selectedLabel === item.label) entry.classList.add("active");
            const left = document.createElement("span");
            left.className = "code-char";
            left.textContent = `${item.label} (${item.freq})`;
            const right = document.createElement("span");
            right.className = "code-bits";
            right.textContent = final ? state.codes.get(item.label) : "待生成";
            entry.appendChild(left);
            entry.appendChild(right);
            els.codeTable.appendChild(entry);
        });
    }

    function renderFeedback() {
        const snap = state.snapshots[state.step];
        const done = state.step === state.merges.length;
        if (!snap.merge) {
            els.statusText.textContent = "准备开始";
            els.feedback.innerHTML = `<strong>第 0 步：建立优先队列</strong><p>${esc(config[tier].prompt)}</p>`;
            return;
        }
        const merge = snap.merge;
        const leftName = merge.left.isLeaf() ? merge.left.label : `子树(${merge.left.freq})`;
        const rightName = merge.right.isLeaf() ? merge.right.label : `子树(${merge.right.freq})`;
        els.statusText.textContent = done ? "构造完成" : "合并推进中";
        els.feedback.innerHTML = `<strong>第 ${state.step} 步：${esc(leftName)} 与 ${esc(rightName)} 合并</strong>
            <p>本步新增权重 ${merge.left.freq} + ${merge.right.freq} = ${merge.cost}。红色高亮显示本步新形成的父节点和两条分支。</p>
            ${done ? `<p>${esc(config[tier].finalLabel)} 已可从公式区和编码表中核对；点击编码表任一项可高亮根到叶路径。</p>` : ""}`;
    }

    function renderStats() {
        const completed = state.merges.slice(0, state.step);
        const partial = completed.reduce((acc, merge) => acc + merge.cost, 0);
        const metrics = getMetrics();
        els.stepCount.textContent = `${state.step}/${state.merges.length}`;
        els.charCount.textContent = state.items.length;
        els.totalWeight.textContent = state.total;
        els.currentCost.textContent = tier === "extend" && state.step === state.merges.length
            ? metrics.avgLength.toFixed(3)
            : partial;
    }

    function render() {
        if (!state) return;
        selectedLabel = state.step === state.merges.length ? selectedLabel : "";
        renderTree();
        renderQueue();
        renderFormula();
        renderCodeTable();
        renderFeedback();
        renderStats();
        els.prevBtn.disabled = state.step === 0;
        els.nextBtn.disabled = state.step === state.merges.length;
    }

    function rebuild() {
        const items = getInputItems().filter((item) => item.label && item.freq > 0);
        state = buildModel(items);
        selectedLabel = "";
        render();
    }

    function setupControls() {
        const cfg = config[tier];
        els.caseSelect.innerHTML = cfg.cases.map((item) => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join("");
        els.caseSelect.addEventListener("change", () => {
            const selected = cfg.cases.find((item) => item.id === els.caseSelect.value) || cfg.cases[0];
            if (tier === "extend") {
                els.sourceText.value = selected.text;
            } else {
                renderWeightSliders(selected.items);
            }
            rebuild();
        });

        if (tier === "extend") {
            els.sourceText.value = cfg.cases[0].text;
            els.sourceText.addEventListener("input", rebuild);
        } else {
            renderWeightSliders(cfg.cases[0].items);
        }

        els.prevBtn.addEventListener("click", () => {
            state.step = Math.max(0, state.step - 1);
            render();
        });
        els.nextBtn.addEventListener("click", () => {
            state.step = Math.min(state.merges.length, state.step + 1);
            render();
        });
        els.resetBtn.addEventListener("click", rebuild);
        els.codeTable.addEventListener("click", (event) => {
            const entry = event.target.closest(".code-entry");
            if (!entry || state.step !== state.merges.length) return;
            selectedLabel = selectedLabel === entry.dataset.label ? "" : entry.dataset.label;
            render();
        });
        window.addEventListener("resize", render);
    }

    function renderWeightSliders(items) {
        els.weightControls.innerHTML = items.map(([label, weight]) => `
            <div class="weight-row">
                <span>${esc(label)}</span>
                <input type="range" min="1" max="12" value="${weight}" data-label="${esc(label)}" aria-label="${esc(label)} 权重">
                <strong data-weight-value="${esc(label)}">${weight}</strong>
            </div>
        `).join("");
        els.weightControls.querySelectorAll("input[type='range']").forEach((input) => {
            input.addEventListener("input", () => {
                const value = els.weightControls.querySelector(`[data-weight-value="${input.dataset.label}"]`);
                if (value) value.textContent = input.value;
                rebuild();
            });
        });
    }

    setupControls();
    rebuild();
})();
