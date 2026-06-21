const memberData = [
    { id: "alg", name: "算法", note: "建模/推理", skills: ["建模", "算法", "论文"] },
    { id: "hw", name: "硬件", note: "感知/测试", skills: ["传感器", "嵌入式", "测试"] },
    { id: "data", name: "数据", note: "采集/分析", skills: ["采集", "清洗", "可视化"] },
    { id: "prod", name: "产品", note: "需求/交互", skills: ["需求", "交互", "汇报"] },
    { id: "sec", name: "安全", note: "合规/风控", skills: ["加密", "风控", "合规"] }
];

const requiredSkills = ["建模", "算法", "传感器", "采集", "可视化", "交互", "合规"];
const positions = [
    { x: 50, y: 14 },
    { x: 82, y: 35 },
    { x: 70, y: 78 },
    { x: 30, y: 78 },
    { x: 18, y: 35 }
];

let selected = new Set(["alg", "hw", "data"]);
let mode = "union";

const $ = id => document.getElementById(id);
const makeSet = xs => new Set(xs);
const arr = s => [...s].sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN"));
const union = (...sets) => makeSet(sets.flatMap(s => [...s]));
const interMany = sets => sets.length ? makeSet([...sets[0]].filter(x => sets.every(s => s.has(x)))) : makeSet([]);
const diff = (a, b) => makeSet([...a].filter(x => !b.has(x)));
const escapeHtml = x => String(x).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const setText = s => s.size ? "{" + arr(s).join(", ") + "}" : "∅";
const pill = (text, cls = "") => `<span class="pill ${cls}">${escapeHtml(text)}</span>`;

function selectedMembers() {
    return memberData.filter(m => selected.has(m.id));
}

function selectedSkillSets() {
    return selectedMembers().map(m => makeSet(m.skills));
}

function metrics() {
    const sets = selectedSkillSets();
    const capability = sets.length ? union(...sets) : makeSet([]);
    const overlap = makeSet([...capability].filter(skill => sets.filter(s => s.has(skill)).length > 1));
    const missing = diff(makeSet(requiredSkills), capability);
    return { capability, overlap, missing };
}

function formulaMarkup(activeMode) {
    return [
        `<span class="formula-token ${activeMode === "union" ? "active" : ""}">并集 ⋃：团队能力</span>`,
        `<span class="formula-token ${activeMode === "overlap" ? "active" : ""}">交集 ⋂：重复技能</span>`,
        `<span class="formula-token ${activeMode === "gap" ? "active" : ""}">差集 \\：关键短板</span>`
    ].join("");
}

function networkHtml() {
    const edges = positions.map((p, i) => {
        const member = memberData[i];
        return `<line class="team-edge ${selected.has(member.id) ? "hot" : ""}" x1="${p.x}%" y1="${p.y}%" x2="50%" y2="50%"></line>`;
    }).join("");

    const nodes = memberData.map((member, i) => {
        const p = positions[i];
        const active = selected.has(member.id);
        const cls = active ? "hot" : "dim";
        return `<button class="network-member ${cls}" data-member="${member.id}" style="left:${p.x}%;top:${p.y}%">${member.name}<span>${member.note}</span></button>`;
    }).join("");

    return `<div class="team-network">
        <svg>${edges}</svg>
        <div class="network-center">创新<br>团队</div>
        ${nodes}
    </div>`;
}

function skillRadarHtml(data) {
    return `<div class="skill-radar">${requiredSkills.map(skill => {
        const cls = data.capability.has(skill) ? "hot" : "warn";
        return `<div class="skill-dot ${cls}">${skill}</div>`;
    }).join("")}</div>`;
}

function panelHtml(title, set, cls = "") {
    const body = arr(set).map(x => pill(x, cls)).join("") || pill("空集", "muted");
    return `<div class="team-panel"><h4>${title}</h4>${body}</div>`;
}

function stepHtml() {
    const steps = [
        ["union", "1", "并集覆盖", "把已选成员技能汇总成团队能力。"],
        ["overlap", "2", "交集冗余", "查看多人共同掌握的重复技能。"],
        ["gap", "3", "差集短板", "目标技能减去团队能力，得到待补齐项。"]
    ];
    return `<div class="formula-steps">${steps.map(([key, no, title, desc]) => (
        `<button class="formula-step ${mode === key ? "active" : ""}" data-mode="${key}"><b>${no}. ${title}</b><span>${desc}</span></button>`
    )).join("")}</div>`;
}

function updateResult(data) {
    const resultMap = {
        union: {
            formula: `团队能力 C = ${selectedMembers().map(m => m.name).join(" ∪ ") || "∅"} = ${setText(data.capability)}`,
            value: `${data.capability.size} / ${requiredSkills.length} 项关键技能已覆盖`,
            extra: "并集越完整，说明跨学科攻关的能力底座越稳。"
        },
        overlap: {
            formula: `冗余技能 R = 已选成员技能的重复项 = ${setText(data.overlap)}`,
            value: `${data.overlap.size} 项技能存在重复储备`,
            extra: "适度冗余能提高可靠性，过度重复会挤占稀缺能力位置。"
        },
        gap: {
            formula: `短板 G = 目标技能 U \\ 团队能力 C = ${setText(data.missing)}`,
            value: data.missing.size ? `${data.missing.size} 项仍需补齐` : "关键短板已清零",
            extra: "差集把“还缺什么”直接显影，便于下一步精准补强。"
        }
    }[mode];

    $("formulaText").innerHTML = formulaMarkup(mode) + `<div style="margin-top:8px">${escapeHtml(resultMap.formula)}</div>`;
    $("resultValue").textContent = resultMap.value;
    $("resultExtra").textContent = resultMap.extra;
}

function render() {
    const data = metrics();
    $("vizArea").innerHTML = [
        networkHtml(),
        skillRadarHtml(data),
        stepHtml(),
        `<div class="team-panels">
            ${panelHtml("团队能力并集", data.capability, "hot")}
            ${panelHtml("重复技能交集", data.overlap, "good")}
            ${panelHtml("关键短板差集", data.missing, "muted")}
        </div>`
    ].join("");

    $("coveredCount").textContent = data.capability.size;
    $("gapCount").textContent = data.missing.size;
    $("totalCount").textContent = selected.size;
    document.querySelectorAll(".scan-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.mode === mode));
    updateResult(data);
}

function mount() {
    document.querySelector(".sidebar-header h1").innerHTML = "团队能力分析 <span class=\"highlight\">进阶层</span>";
    document.querySelector(".sidebar-header .subtitle").textContent = "Union / Intersection / Difference";
    document.querySelector(".controls-wrapper").innerHTML = `
        <div class="control-group">
            <label>点一步：集合运算扫描</label>
            <div class="scan-controls">
                <button class="apple-btn scan-btn" data-mode="union">
                    <span class="btn-icon">∪</span><div class="btn-text"><span>看团队能力并集</span><span class="btn-sub">C = A1 ∪ A2 ∪ ...</span></div>
                </button>
                <button class="apple-btn scan-btn" data-mode="overlap">
                    <span class="btn-icon">∩</span><div class="btn-text"><span>看重复技能交集</span><span class="btn-sub">R = shared skills</span></div>
                </button>
                <button class="apple-btn scan-btn" data-mode="gap">
                    <span class="btn-icon">\\</span><div class="btn-text"><span>看关键短板差集</span><span class="btn-sub">G = U \\ C</span></div>
                </button>
            </div>
        </div>
        <div class="control-group">
            <label>调成员：观察图和公式同步变化</label>
            ${memberData.map(m => `<label class="check-row"><input type="checkbox" class="memberToggle" value="${m.id}" ${selected.has(m.id) ? "checked" : ""}> ${m.name}同学：${m.skills.join("、")}</label>`).join("")}
        </div>
        <div class="control-group">
            <label>即时反馈</label>
            <div class="result-panel">
                <div class="formula-display" id="formulaText"></div>
                <div class="result-display">
                    <span class="result-label">结论</span>
                    <span class="result-value" id="resultValue">--</span>
                </div>
                <p class="result-extra" id="resultExtra"></p>
            </div>
        </div>
        <div class="control-group">
            <label>团队状态</label>
            <div class="status-grid">
                <div class="status-item"><span class="status-label">已选成员</span><span class="status-val" id="totalCount">0</span></div>
                <div class="status-item"><span class="status-label">已覆盖</span><span class="status-val highlight-blue" id="coveredCount">0</span></div>
                <div class="status-item"><span class="status-label">短板</span><span class="status-val highlight-red" id="gapCount">0</span></div>
            </div>
        </div>`;

    document.querySelector(".actions-footer").innerHTML = '<button id="resetBtn" class="apple-btn secondary-btn">重置团队</button>';
    document.querySelector(".glass-pane").innerHTML = `
        <div class="stage-header">
            <h2>团队集合运算指挥台</h2>
            <p>点左侧一步，右侧节点网络、技能雷达、公式项和结论同步高亮。</p>
        </div>
        <div class="visualization-area" id="vizArea"></div>`;

    document.querySelectorAll(".scan-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            mode = btn.dataset.mode;
            render();
        });
    });

    document.querySelectorAll(".memberToggle").forEach(input => {
        input.addEventListener("change", () => {
            if (input.checked) selected.add(input.value);
            else selected.delete(input.value);
            render();
        });
    });

    document.querySelector(".glass-pane").addEventListener("click", event => {
        const node = event.target.closest("[data-member]");
        const step = event.target.closest("[data-mode]");
        if (node) {
            const id = node.dataset.member;
            if (selected.has(id)) selected.delete(id);
            else selected.add(id);
            const toggle = document.querySelector(`.memberToggle[value="${id}"]`);
            if (toggle) toggle.checked = selected.has(id);
            render();
        }
        if (step) {
            mode = step.dataset.mode;
            render();
        }
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
        selected = new Set(["alg", "hw", "data"]);
        mode = "union";
        document.querySelectorAll(".memberToggle").forEach(input => {
            input.checked = selected.has(input.value);
        });
        render();
    });

    render();
}

mount();
