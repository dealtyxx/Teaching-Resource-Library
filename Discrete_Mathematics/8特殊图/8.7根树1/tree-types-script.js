(function () {
    "use strict";

    const pageConfig = Object.assign({
        layer: "advanced",
        initialTreeType: "binary",
        initialTraversal: "pre",
        initialNodes: 7,
        mission: "执行遍历、计算节点数与高度。",
        feedback: "当前步骤把结构、公式和图形同步起来：先看访问规则，再看节点与边的高亮变化。"
    }, window.TREE_PAGE_CONFIG || {});

    const svg = document.getElementById("treeSvg");
    const edgesGroup = document.getElementById("edgesGroup");
    const nodesGroup = document.getElementById("nodesGroup");
    const treeTypeSelect = document.getElementById("treeTypeSelect");
    const nodeCount = document.getElementById("nodeCount");
    const nodeCountValue = document.getElementById("nodeCountValue");
    const mAryControl = document.getElementById("mAryControl");
    const mCount = document.getElementById("mCount");
    const mValue = document.getElementById("mValue");
    const generateBtn = document.getElementById("generateBtn");
    const randomBtn = document.getElementById("randomBtn");
    const resetBtn = document.getElementById("resetBtn");
    const statusText = document.getElementById("statusText");
    const nodeCountDisplay = document.getElementById("nodeCountDisplay");
    const treeHeight = document.getElementById("treeHeight");
    const leafCount = document.getElementById("leafCount");
    const degreeDisplay = document.getElementById("degreeDisplay");
    const maxDegree = document.getElementById("maxDegree");
    const typeBadgeText = document.getElementById("typeBadgeText");
    const typeDescription = document.getElementById("typeDescription");
    const traversalMode = document.getElementById("traversalMode");
    const traversalStep = document.getElementById("traversalStep");
    const stepValue = document.getElementById("stepValue");
    const firstStep = document.getElementById("firstStep");
    const prevStep = document.getElementById("prevStep");
    const nextStep = document.getElementById("nextStep");
    const queryControl = document.getElementById("queryControl");
    const queryValue = document.getElementById("queryValue");
    const formulaText = document.getElementById("formulaText");
    const resultValue = document.getElementById("resultValue");
    const resultExtra = document.getElementById("resultExtra");
    const visitSequence = document.getElementById("visitSequence");

    if (!svg || !edgesGroup || !nodesGroup) return;

    const NODE_RADIUS = 26;
    const LEVEL_HEIGHT = 88;
    const LABELS = ["上海", "嘉兴", "南昌", "井冈山", "瑞金", "遵义", "延安", "西柏坡", "北京", "深圳", "浦东", "雄安", "杭州", "武汉", "长沙"];
    const BST_VALUES = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 90];
    const HEAP_VALUES = [96, 83, 79, 65, 71, 62, 54, 28, 41, 58, 60, 47, 50, 35, 39];

    const TREE_DESCRIPTIONS = {
        directed: { title: "有向树", desc: "边有方向，体现从根到分支的层级展开" },
        rooted: { title: "根树", desc: "指定一个根，所有节点按层次组织" },
        binary: { title: "二叉树", desc: "每个节点最多有两个子节点" },
        complete: { title: "完全二叉树", desc: "除最后一层外尽量填满，适合数组存储" },
        "m-ary": { title: "完全 m 叉树", desc: "每个节点最多有 m 个子节点" },
        proper: { title: "正则二叉树", desc: "每个内部节点恰有两个子节点" },
        weighted: { title: "带权二叉树", desc: "节点带有权值，可表达优先级或频率" },
        bst: { title: "二叉搜索树", desc: "左子树较小，右子树较大，用比较缩小范围" },
        heap: { title: "最大堆", desc: "父节点优先级不小于子节点，堆顶最优先" }
    };

    class TreeNode {
        constructor(id, name, value = null, weight = null) {
            this.id = id;
            this.name = name;
            this.value = value;
            this.weight = weight;
            this.children = [];
            this.parent = null;
            this.side = null;
            this.x = 0;
            this.y = 0;
        }

        isLeaf() {
            return this.children.length === 0;
        }

        isRoot() {
            return this.parent === null;
        }
    }

    let nodes = [];
    let edges = [];
    let nodeElements = new Map();
    let edgeElements = new Map();
    let currentTreeType = pageConfig.initialTreeType;

    function createSVGElement(type, attributes = {}) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", type);
        Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
        return el;
    }

    function esc(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        }[ch]));
    }

    function intValue(input, fallback) {
        const value = input ? parseInt(input.value, 10) : NaN;
        return Number.isFinite(value) ? value : fallback;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function nodeLabel(node) {
        if (!node) return "";
        return node.value == null ? node.name : String(node.value);
    }

    function edgeKey(from, to) {
        return from + "-" + to;
    }

    function addChild(parent, child, side = null) {
        child.parent = parent;
        child.side = side;
        parent.children.push(child);
        edges.push({ from: parent.id, to: child.id });
    }

    function orderedChildren(node) {
        if (!node) return [];
        const children = node.children.slice();
        if (children.some(child => child.side)) {
            const left = children.find(child => child.side === "left");
            const right = children.find(child => child.side === "right");
            return [left, right].filter(Boolean);
        }
        return children;
    }

    function generateLevelTree(n, maxChildren, weighted = false) {
        for (let i = 0; i < n; i++) {
            const weight = weighted ? 2 + (i * 7) % 19 : null;
            const node = new TreeNode(i, LABELS[i % LABELS.length], null, weight);
            nodes.push(node);
            if (i > 0) {
                const parentIndex = Math.floor((i - 1) / maxChildren);
                const side = maxChildren === 2 ? (i === parentIndex * 2 + 1 ? "left" : "right") : null;
                addChild(nodes[parentIndex], node, side);
            }
        }
    }

    function generateBinaryTree(n) {
        generateLevelTree(n, 2, false);
        if (statusText) statusText.textContent = "二叉树：每个节点最多两个子节点，适合比较遍历差异。";
    }

    function generateCompleteTree(n) {
        generateLevelTree(n, 2, false);
        if (statusText) statusText.textContent = "完全二叉树：按层从左到右填充，数组下标关系最清晰。";
    }

    function generateRootedTree(n) {
        generateLevelTree(n, 3, false);
        if (statusText) statusText.textContent = "根树：以根节点为起点，层级关系从上向下展开。";
    }

    function generateDirectedTree(n) {
        generateLevelTree(n, 3, false);
        if (statusText) statusText.textContent = "有向树：每条边从父节点指向子节点。";
    }

    function generateMAryTree(n) {
        const m = intValue(mCount, 3);
        generateLevelTree(n, m, false);
        if (statusText) statusText.textContent = "完全 " + m + " 叉树：每个节点最多 " + m + " 个子节点。";
    }

    function generateProperBinaryTree(n) {
        const oddN = n % 2 === 1 ? n : Math.max(3, n - 1);
        generateLevelTree(oddN, 2, false);
        if (statusText) statusText.textContent = "正则二叉树：每个内部节点都有两个子节点。";
    }

    function generateWeightedTree(n) {
        generateLevelTree(n, 2, true);
        if (statusText) statusText.textContent = "带权二叉树：权值随节点显示，可用于频率、代价或优先级。";
    }

    function generateBSTTree(n) {
        const values = BST_VALUES.slice(0, n);
        values.forEach((value, index) => {
            const node = new TreeNode(index, String(value), value, null);
            nodes.push(node);
            if (index === 0) return;
            let cur = nodes[0];
            while (cur) {
                if (value < cur.value) {
                    const left = cur.children.find(child => child.side === "left");
                    if (!left) {
                        addChild(cur, node, "left");
                        break;
                    }
                    cur = left;
                } else {
                    const right = cur.children.find(child => child.side === "right");
                    if (!right) {
                        addChild(cur, node, "right");
                        break;
                    }
                    cur = right;
                }
            }
        });
        if (statusText) statusText.textContent = "二叉搜索树：比较目标值与当前节点，向左或向右缩小范围。";
    }

    function generateHeapTree(n) {
        for (let i = 0; i < n; i++) {
            const value = HEAP_VALUES[i % HEAP_VALUES.length];
            const node = new TreeNode(i, String(value), value, null);
            nodes.push(node);
            if (i > 0) {
                const parentIndex = Math.floor((i - 1) / 2);
                const side = i === parentIndex * 2 + 1 ? "left" : "right";
                addChild(nodes[parentIndex], node, side);
            }
        }
        if (statusText) statusText.textContent = "最大堆：父节点优先级不小于任一子节点，堆顶最优先。";
    }

    function calculatePositions(node, x, y, spread) {
        if (!node) return;
        node.x = x;
        node.y = y;
        const children = orderedChildren(node);
        if (!children.length) return;

        if (children.length === 1 && children[0].side) {
            const dir = children[0].side === "left" ? -1 : 1;
            calculatePositions(children[0], x + dir * Math.max(54, spread * 0.55), y + LEVEL_HEIGHT, spread * 0.55);
            return;
        }

        const startX = x - spread;
        const spacing = (spread * 2) / (children.length + 1);
        children.forEach((child, index) => {
            calculatePositions(child, startX + spacing * (index + 1), y + LEVEL_HEIGHT, spread * 0.55);
        });
    }

    function renderTree() {
        edgesGroup.innerHTML = "";
        nodesGroup.innerHTML = "";
        nodeElements.clear();
        edgeElements.clear();

        edges.forEach(edge => {
            const fromNode = nodes[edge.from];
            const toNode = nodes[edge.to];
            if (!fromNode || !toNode) return;
            const line = createSVGElement("line", {
                x1: fromNode.x,
                y1: fromNode.y,
                x2: toNode.x,
                y2: toNode.y,
                class: currentTreeType === "directed" ? "tree-edge directed" : "tree-edge",
                "data-from": edge.from,
                "data-to": edge.to
            });
            edgesGroup.appendChild(line);
            edgeElements.set(edgeKey(edge.from, edge.to), line);
        });

        nodes.forEach(node => {
            const classes = ["tree-node"];
            if (node.isRoot()) classes.push("root");
            if (node.isLeaf()) classes.push("leaf");
            const g = createSVGElement("g", {
                class: classes.join(" "),
                transform: "translate(" + node.x + ", " + node.y + ")",
                "data-id": node.id
            });
            const circle = createSVGElement("circle", {
                r: NODE_RADIUS,
                class: "tree-node-circle"
            });
            const text = createSVGElement("text", {
                class: "tree-node-text",
                "dy": node.weight ? "-0.2em" : ".35em"
            });
            text.textContent = nodeLabel(node);
            g.appendChild(circle);
            g.appendChild(text);
            if (node.weight) {
                const weightText = createSVGElement("text", {
                    class: "tree-node-weight",
                    "dy": "1.35em"
                });
                weightText.textContent = "(" + node.weight + ")";
                g.appendChild(weightText);
            }
            nodesGroup.appendChild(g);
            nodeElements.set(node.id, g);
        });
    }

    function getTreeHeight(node) {
        if (!node || !node.children.length) return 0;
        return 1 + Math.max(...orderedChildren(node).map(getTreeHeight));
    }

    function updateStats() {
        if (nodeCountDisplay) nodeCountDisplay.textContent = nodes.length;
        const height = getTreeHeight(nodes[0]);
        if (treeHeight) treeHeight.textContent = height;
        if (leafCount) leafCount.textContent = nodes.filter(node => node.isLeaf()).length;
        const degree = nodes.length ? Math.max(...nodes.map(node => node.children.length)) : 0;
        if (maxDegree) maxDegree.textContent = degree;
        if (degreeDisplay) degreeDisplay.style.display = currentTreeType === "m-ary" ? "flex" : "none";
    }

    function traversalPre(node, out = []) {
        if (!node) return out;
        out.push(node);
        orderedChildren(node).forEach(child => traversalPre(child, out));
        return out;
    }

    function traversalIn(node, out = []) {
        if (!node) return out;
        const children = orderedChildren(node);
        if (children[0]) traversalIn(children[0], out);
        out.push(node);
        for (let i = 1; i < children.length; i++) traversalIn(children[i], out);
        return out;
    }

    function traversalPost(node, out = []) {
        if (!node) return out;
        orderedChildren(node).forEach(child => traversalPost(child, out));
        out.push(node);
        return out;
    }

    function traversalLevel(root) {
        if (!root) return [];
        const out = [];
        const queue = [root];
        while (queue.length) {
            const node = queue.shift();
            out.push(node);
            orderedChildren(node).forEach(child => queue.push(child));
        }
        return out;
    }

    function searchPath() {
        const target = queryValue ? parseInt(queryValue.value, 10) : BST_VALUES[Math.min(4, nodes.length - 1)];
        const out = [];
        let cur = nodes[0];
        while (cur) {
            out.push(cur);
            if (cur.value === target) break;
            const nextSide = target < cur.value ? "left" : "right";
            cur = cur.children.find(child => child.side === nextSide);
        }
        return out;
    }

    function currentMode() {
        return traversalMode ? traversalMode.value : pageConfig.initialTraversal;
    }

    function getOrder() {
        const mode = currentMode();
        if (mode === "in") return traversalIn(nodes[0]);
        if (mode === "post") return traversalPost(nodes[0]);
        if (mode === "level" || mode === "heap") return traversalLevel(nodes[0]);
        if (mode === "search") return currentTreeType === "bst" ? searchPath() : traversalPre(nodes[0]);
        return traversalPre(nodes[0]);
    }

    function ancestors(node) {
        const path = [];
        let cur = node;
        while (cur) {
            path.unshift(cur);
            cur = cur.parent;
        }
        return path;
    }

    function clearHighlights() {
        nodeElements.forEach(el => el.classList.remove("visited", "current", "path"));
        edgeElements.forEach(el => el.classList.remove("visited", "current"));
    }

    function markEdge(node, className) {
        if (!node || !node.parent) return;
        const edge = edgeElements.get(edgeKey(node.parent.id, node.id));
        if (edge) edge.classList.add(className);
    }

    function chip(ok, text) {
        return '<span class="truth-chip' + (ok ? "" : " false") + '">' + esc(text) + "</span>";
    }

    function ensureLayerStrip() {
        if (document.querySelector(".tree-layer-strip")) return;
        const app = document.querySelector(".tree-app");
        if (!app) return;
        const pane = document.querySelector(".glass-pane");

        const layers = [
            {
                key: "basic",
                badge: "基础层",
                title: "根树与二叉树",
                focus: "根 / 层次 / 每点≤2子",
                desc: "低门槛 · 建立直觉",
                goal: "理解根、父子关系与叶节点。",
                href: "tree-types-index-basic.html",
                color: "#f2a900",
                dots: 1
            },
            {
                key: "advanced",
                badge: "进阶层",
                title: "遍历与性质",
                focus: "前序 / 中序 / 后序 / 层序",
                desc: "核心掌握 · 建模求解",
                goal: "执行遍历并计算高度、节点上界。",
                href: "tree-types-index.html",
                color: "#d63b1d",
                dots: 2
            },
            {
                key: "extend",
                badge: "拓展层",
                title: "搜索树与堆",
                focus: "BST / 堆 / 优先级路径",
                desc: "高天花板 · 迁移工程",
                goal: "迁移到搜索、排序和优先级队列。",
                href: "tree-types-index-extend.html",
                color: "#d63b1d",
                dots: 3
            }
        ];

        const current = pageConfig.layer;
        const strip = document.createElement("section");
        strip.className = "tree-layer-strip";
        strip.innerHTML = ''
            + '<div class="tree-level-header">'
            + '<div><span class="tree-level-title">📚 三阶层次案例</span> '
            + '<span class="tree-level-subtitle">低门槛 · 高天花板 — 点「进入本层」由 AI 按该难度出题</span></div>'
            + '<button class="tree-level-collapse" type="button">收起</button>'
            + '</div>'
            + '<div class="tree-level-grid">'
            + layers.map(layer => {
                const isCurrent = layer.key === current;
                const dots = Array.from({ length: 3 }, (_, index) => (
                    '<span class="tree-level-dot' + (index < layer.dots ? " is-filled" : "") + '"></span>'
                )).join("");
                return '<a class="tree-level-card' + (isCurrent ? " is-current" : "") + '" href="' + esc(layer.href) + '"'
                    + (isCurrent ? ' aria-current="page"' : '') + ' style="--layer-color:' + esc(layer.color) + '">'
                    + '<div class="tree-level-card-top">'
                    + '<span class="tree-level-badge">' + esc(layer.badge) + '</span>'
                    + '<span class="tree-level-dots">' + dots + '</span>'
                    + (isCurrent ? '<span class="tree-level-current-mark">当前</span>' : '')
                    + '</div>'
                    + '<div><h2>' + esc(layer.title) + '</h2>'
                    + '<strong>' + esc(layer.focus) + '</strong>'
                    + '<p>' + esc(layer.desc) + '</p>'
                    + '<div class="tree-level-goal">🎯 ' + esc(layer.goal) + '</div></div>'
                    + '<div class="tree-level-entry">' + (isCurrent ? '✓ 你在本层' : '▶ 进入本层互动页') + '</div>'
                    + '</a>';
            }).join("")
            + '</div>';

        if (pane) {
            pane.insertBefore(strip, pane.firstElementChild);
        } else {
            app.parentNode.insertBefore(strip, app);
        }
        const collapse = strip.querySelector(".tree-level-collapse");
        collapse.addEventListener("click", () => {
            strip.classList.toggle("is-collapsed");
            collapse.textContent = strip.classList.contains("is-collapsed") ? "展开" : "收起";
        });
    }

    function ensureChapterCrumb() {
        if (document.querySelector(".tree-crumb")) return;
        const app = document.querySelector(".tree-app");
        if (!app) return;
        const crumb = document.createElement("div");
        crumb.className = "tree-crumb";
        crumb.innerHTML = '<span>第8章 特殊图</span><strong>›</strong><b>8.7 根树（一）· 二叉树类型</b>';
        app.parentNode.insertBefore(crumb, app);
    }

    function ensureSidebarChrome() {
        const header = document.querySelector(".sidebar-header");
        if (!header || header.querySelector(".window-controls")) return;
        const dots = document.createElement("div");
        dots.className = "window-controls";
        dots.innerHTML = '<span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>';
        header.insertBefore(dots, header.firstElementChild);
    }

    function formulaTerm(text, hot) {
        return '<span class="formula-term' + (hot ? " is-hot" : "") + '">' + esc(text) + "</span>";
    }

    function traversalFormula(mode) {
        if (mode === "in") {
            return [formulaTerm("L", false), formulaTerm("N", true), formulaTerm("R", false)].join("");
        }
        if (mode === "post") {
            return [formulaTerm("L", false), formulaTerm("R", false), formulaTerm("N", true)].join("");
        }
        if (mode === "level") {
            return [formulaTerm("第 1 层", false), formulaTerm("第 2 层", false), formulaTerm("当前层", true)].join("");
        }
        return [formulaTerm("N", true), formulaTerm("L", false), formulaTerm("R", false)].join("");
    }

    function nodeDepth(node) {
        let depth = 0;
        let cur = node;
        while (cur && cur.parent) {
            depth++;
            cur = cur.parent;
        }
        return depth;
    }

    function renderSequence(order, step) {
        if (!visitSequence) return;
        visitSequence.innerHTML = '<div class="sequence-row">' + order.map((node, index) => {
            const cls = index + 1 === step ? " is-current" : index < step ? " is-visited" : "";
            return '<span class="sequence-chip' + cls + '">' + esc(index + 1 + ":" + nodeLabel(node)) + "</span>";
        }).join("") + "</div>";
    }

    function populateQueryOptions() {
        if (!queryControl || !queryValue) return;
        const show = currentTreeType === "bst" && currentMode() === "search";
        queryControl.style.display = show ? "grid" : "none";
        if (!show) return;
        const old = queryValue.value;
        queryValue.innerHTML = nodes.map(node => '<option value="' + esc(node.value) + '">' + esc(node.value) + "</option>").join("");
        if (old && nodes.some(node => String(node.value) === old)) queryValue.value = old;
        else if (nodes[4]) queryValue.value = String(nodes[4].value);
    }

    function feedbackText(mode, current, step, order) {
        const label = nodeLabel(current);
        const depth = nodeDepth(current);
        if (pageConfig.layer === "basic") {
            return "第 " + step + " 步访问 " + label + "，它位于第 " + (depth + 1) + " 层；蓝色表示已访问，金色表示当前节点。";
        }
        if (mode === "search") {
            const target = queryValue ? parseInt(queryValue.value, 10) : null;
            const relation = target === current.value ? "命中目标" : target < current.value ? "下一步向左子树" : "下一步向右子树";
            return "目标值 " + target + " 与当前节点 " + current.value + " 比较：" + relation + "。红边显示已经走过的搜索路径。";
        }
        if (mode === "heap") {
            const ok = !current.parent || current.parent.value >= current.value;
            return "检查节点 " + label + (current.parent ? " 与父节点 " + nodeLabel(current.parent) + "：" + (ok ? "满足 parent >= child。" : "需要调整。") : "：堆顶拥有最高优先级。");
        }
        const h = getTreeHeight(nodes[0]);
        const bound = Math.pow(2, h + 1) - 1;
        return "当前访问 " + label + "；n=" + nodes.length + "，h=" + h + "，容量上界 max=2^(h+1)-1=" + bound + "。";
    }

    function renderFormula(mode, current, step, order) {
        if (!formulaText || !resultValue || !resultExtra || !current) return;
        const h = getTreeHeight(nodes[0]);
        const bound = Math.pow(2, h + 1) - 1;
        const depth = nodeDepth(current);

        if (mode === "search" && currentTreeType === "bst") {
            const target = queryValue ? parseInt(queryValue.value, 10) : current.value;
            const cmp = target === current.value ? "=" : target < current.value ? "<" : ">";
            formulaText.innerHTML = '<div class="formula-row">'
                + formulaTerm("left < root < right", true)
                + formulaTerm("target " + cmp + " " + current.value, true)
                + formulaTerm("k=" + step + "/" + order.length, false)
                + "</div>";
            resultValue.innerHTML = chip(target === current.value, target === current.value ? "查询命中" : "继续缩小");
            resultExtra.textContent = feedbackText(mode, current, step, order);
            return;
        }

        if (mode === "heap") {
            const ok = !current.parent || current.parent.value >= current.value;
            formulaText.innerHTML = '<div class="formula-row">'
                + formulaTerm("parent >= child", true)
                + formulaTerm(current.parent ? nodeLabel(current.parent) + " >= " + nodeLabel(current) : "root=max", true)
                + formulaTerm("层=" + (depth + 1), false)
                + "</div>";
            resultValue.innerHTML = chip(ok, ok ? "堆序成立" : "需要调整");
            resultExtra.textContent = feedbackText(mode, current, step, order);
            return;
        }

        formulaText.innerHTML = '<div class="formula-row">'
            + traversalFormula(mode)
            + formulaTerm("v_" + step + "=" + nodeLabel(current), true)
            + formulaTerm("n=" + nodes.length, false)
            + formulaTerm("h=" + h, pageConfig.layer !== "basic")
            + formulaTerm("max=2^(h+1)-1=" + bound, pageConfig.layer === "advanced")
            + "</div>";
        resultValue.innerHTML = chip(step === order.length, step === order.length ? "遍历完成" : "第 " + step + " 步");
        resultExtra.textContent = feedbackText(mode, current, step, order);
    }

    function renderInteraction() {
        if (!nodes.length) return;
        populateQueryOptions();
        const order = getOrder();
        const max = Math.max(1, order.length);
        if (traversalStep) {
            traversalStep.max = String(max);
            traversalStep.value = String(clamp(intValue(traversalStep, 1), 1, max));
        }
        const step = traversalStep ? intValue(traversalStep, 1) : 1;
        if (stepValue) stepValue.textContent = step + "/" + max;

        clearHighlights();
        const visited = order.slice(0, step);
        const current = visited[visited.length - 1];
        const path = currentMode() === "search" ? visited : ancestors(current);
        visited.forEach(node => {
            const el = nodeElements.get(node.id);
            if (el) el.classList.add("visited");
            markEdge(node, "visited");
        });
        path.forEach(node => {
            const el = nodeElements.get(node.id);
            if (el) el.classList.add("path");
        });
        if (current) {
            const el = nodeElements.get(current.id);
            if (el) el.classList.add("current");
            markEdge(current, "current");
            if (statusText) statusText.textContent = "第 " + step + " 步：当前节点 " + nodeLabel(current) + "。";
        }

        renderSequence(order, step);
        renderFormula(currentMode(), current, step, order);
    }

    function generateTree() {
        nodes = [];
        edges = [];
        currentTreeType = treeTypeSelect ? treeTypeSelect.value : currentTreeType;
        let n = intValue(nodeCount, pageConfig.initialNodes);

        if (currentTreeType === "proper" && n % 2 === 0) n = Math.max(3, n - 1);
        if (currentTreeType === "bst" || currentTreeType === "heap") n = clamp(n, 5, 15);

        if (currentTreeType === "directed") generateDirectedTree(n);
        else if (currentTreeType === "rooted") generateRootedTree(n);
        else if (currentTreeType === "complete") generateCompleteTree(n);
        else if (currentTreeType === "m-ary") generateMAryTree(n);
        else if (currentTreeType === "proper") generateProperBinaryTree(n);
        else if (currentTreeType === "weighted") generateWeightedTree(n);
        else if (currentTreeType === "bst") generateBSTTree(n);
        else if (currentTreeType === "heap") generateHeapTree(n);
        else generateBinaryTree(n);

        const width = svg.clientWidth || 800;
        calculatePositions(nodes[0], width / 2, 92, width * 0.34);
        renderTree();
        updateStats();
        updateTypeBadge();
        if (traversalStep) traversalStep.value = String(clamp(intValue(traversalStep, 1), 1, nodes.length));
        renderInteraction();
    }

    function updateTypeBadge() {
        const info = TREE_DESCRIPTIONS[currentTreeType] || TREE_DESCRIPTIONS.binary;
        if (typeBadgeText) typeBadgeText.textContent = info.title;
        if (typeDescription) typeDescription.textContent = info.desc;
        if (mAryControl) mAryControl.style.display = currentTreeType === "m-ary" ? "grid" : "none";
    }

    function setTraversalForTree() {
        if (!traversalMode) return;
        const options = Array.from(traversalMode.options).map(option => option.value);
        if (currentTreeType === "bst" && options.includes("search")) traversalMode.value = "search";
        else if (currentTreeType === "heap" && options.includes("heap")) traversalMode.value = "heap";
        else if (!options.includes(traversalMode.value)) traversalMode.value = options[0] || "pre";
    }

    function stepBy(delta) {
        if (!traversalStep) return;
        const max = intValue(traversalStep, 1) + delta;
        traversalStep.value = String(clamp(max, 1, parseInt(traversalStep.max || "1", 10)));
        renderInteraction();
    }

    function randomize() {
        if (treeTypeSelect) {
            const options = Array.from(treeTypeSelect.options).filter(option => option.value);
            const next = options[Math.floor(Math.random() * options.length)];
            if (next) treeTypeSelect.value = next.value;
        }
        if (nodeCount) {
            const min = parseInt(nodeCount.min || "3", 10);
            const max = parseInt(nodeCount.max || "15", 10);
            nodeCount.value = String(min + Math.floor(Math.random() * (max - min + 1)));
            if (nodeCountValue) nodeCountValue.textContent = nodeCount.value;
        }
        currentTreeType = treeTypeSelect ? treeTypeSelect.value : currentTreeType;
        setTraversalForTree();
        generateTree();
    }

    function resetTree() {
        if (treeTypeSelect) treeTypeSelect.value = pageConfig.initialTreeType;
        if (nodeCount) nodeCount.value = String(pageConfig.initialNodes);
        if (nodeCountValue) nodeCountValue.textContent = String(pageConfig.initialNodes);
        if (traversalMode) traversalMode.value = pageConfig.initialTraversal;
        if (traversalStep) traversalStep.value = "1";
        currentTreeType = pageConfig.initialTreeType;
        generateTree();
    }

    function initControls() {
        if (treeTypeSelect && Array.from(treeTypeSelect.options).some(option => option.value === pageConfig.initialTreeType)) {
            treeTypeSelect.value = pageConfig.initialTreeType;
        }
        if (nodeCount) nodeCount.value = String(pageConfig.initialNodes);
        if (nodeCountValue) nodeCountValue.textContent = String(intValue(nodeCount, pageConfig.initialNodes));
        if (mCount && pageConfig.initialM) mCount.value = String(pageConfig.initialM);
        if (mValue && mCount) mValue.textContent = mCount.value;
        if (traversalMode && Array.from(traversalMode.options).some(option => option.value === pageConfig.initialTraversal)) {
            traversalMode.value = pageConfig.initialTraversal;
        }
    }

    function bindEvents() {
        if (treeTypeSelect) {
            treeTypeSelect.addEventListener("change", () => {
                currentTreeType = treeTypeSelect.value;
                setTraversalForTree();
                generateTree();
            });
        }
        if (nodeCount) {
            nodeCount.addEventListener("input", () => {
                if (nodeCountValue) nodeCountValue.textContent = nodeCount.value;
                generateTree();
            });
        }
        if (mCount) {
            mCount.addEventListener("input", () => {
                if (mValue) mValue.textContent = mCount.value;
                generateTree();
            });
        }
        if (generateBtn) generateBtn.addEventListener("click", generateTree);
        if (randomBtn) randomBtn.addEventListener("click", randomize);
        if (resetBtn) resetBtn.addEventListener("click", resetTree);
        if (traversalMode) traversalMode.addEventListener("change", () => {
            if (traversalStep) traversalStep.value = "1";
            renderInteraction();
        });
        if (traversalStep) traversalStep.addEventListener("input", renderInteraction);
        if (queryValue) queryValue.addEventListener("change", () => {
            if (traversalStep) traversalStep.value = "1";
            renderInteraction();
        });
        if (firstStep) firstStep.addEventListener("click", () => {
            if (traversalStep) traversalStep.value = "1";
            renderInteraction();
        });
        if (prevStep) prevStep.addEventListener("click", () => stepBy(-1));
        if (nextStep) nextStep.addEventListener("click", () => stepBy(1));
        window.addEventListener("resize", generateTree);
    }

    ensureSidebarChrome();
    ensureLayerStrip();
    initControls();
    bindEvents();
    generateTree();
})();
