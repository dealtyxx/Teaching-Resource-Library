(function () {
  "use strict";

  const isExtend = /-extend\.html(?:$|\?)/.test(location.pathname);
  const oldControls = document.getElementById("controls");
  const viz = document.getElementById("vizArea");
  const formulaText = document.getElementById("formulaText");
  const resultValue = document.getElementById("resultValue");
  const resultExtra = document.getElementById("resultExtra");
  if (!oldControls || !viz || !formulaText || !resultValue || !resultExtra) return;

  if (window.SECTION_META) {
    window.SECTION_META.ideology = { title: "", text: "", dims: [], quote: "" };
  }

  document.querySelectorAll(".value-panel").forEach(el => el.remove());
  const controls = oldControls.cloneNode(false);
  oldControls.replaceWith(controls);

  const state = {
    step: 0,
    scenario: "two-bombs",
    audit: "direct",
    verify: true,
    collab: true,
    risk: isExtend,
    discipline: true,
    evidence: isExtend ? 82 : 70,
    redundancy: isExtend ? 76 : 60
  };

  const scenarios = {
    "two-bombs": {
      title: "两弹一星工程",
      goal: "自主攻关可推进",
      implication: "G -> A",
      transfer: "历史任务",
      variables: {
        verify: "理论与试验验证充分",
        collab: "跨学科协同就绪",
        risk: "风险闭环清楚",
        discipline: "纪律与保密可执行"
      }
    },
    chip: {
      title: "芯片自主攻关",
      goal: "关键技术可立项",
      implication: "G -> T",
      transfer: "当代迁移",
      variables: {
        verify: "工艺路线通过验证",
        collab: "产学研协同到位",
        risk: "供应链风险有备份",
        discipline: "知识产权边界清楚"
      }
    },
    seed: {
      title: "种业安全攻关",
      goal: "核心种源可推广",
      implication: "G -> S",
      transfer: "当代迁移",
      variables: {
        verify: "试验数据稳定",
        collab: "育种与推广协同",
        risk: "生态风险完成评估",
        discipline: "数据留痕与审批规范"
      }
    }
  };

  const conditionDefs = [
    { key: "verify", symbol: "V", short: "验证", role: "尊重规律" },
    { key: "collab", symbol: "C", short: "协同", role: "集体攻关" },
    { key: "risk", symbol: "R", short: "风险", role: "底线思维" },
    { key: "discipline", symbol: "S", short: "纪律", role: "行动边界" }
  ];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[ch]);
  }

  function setImportant(el, name, value) {
    if (!el) return;
    el.style.setProperty(name, value, "important");
  }

  function goReady() {
    const gates = conditionDefs.every(item => !!state[item.key]);
    const evidenceReady = !isExtend || state.evidence >= 70;
    const redundancyReady = !isExtend || state.redundancy >= 70;
    return gates && evidenceReady && redundancyReady;
  }

  function missingItems() {
    const scenario = scenarios[state.scenario];
    const missing = conditionDefs
      .filter(item => !state[item.key])
      .map(item => item.symbol + " " + scenario.variables[item.key]);
    if (isExtend && state.evidence < 70) missing.push("E 证据强度不足");
    if (isExtend && state.redundancy < 70) missing.push("B 备份方案不足");
    return missing;
  }

  function buildControls() {
    controls.className = "bombs-controls";
    const scenarioSelect = isExtend ? `
      <div class="control-group bombs-ui">
        <label><span>迁移情境</span><small>拓展层</small></label>
        <select id="bombScenario">
          <option value="two-bombs">两弹一星工程</option>
          <option value="chip">芯片自主攻关</option>
          <option value="seed">种业安全攻关</option>
        </select>
      </div>` : "";
    const auditSelect = isExtend ? `
      <div class="control-group bombs-ui">
        <label><span>论证视角</span><small>反事实检查</small></label>
        <select id="bombAudit">
          <option value="direct">直接推理：G -> 行动</option>
          <option value="contra">逆否观察：不行动 -> 条件缺口</option>
          <option value="necessary">必要条件：缺一不可</option>
        </select>
      </div>` : "";
    const sliders = isExtend ? `
      <div class="control-group bombs-ui">
        <label><span>证据强度 E</span><small id="evidenceText">${state.evidence}</small></label>
        <input id="bombEvidence" type="range" min="40" max="100" step="1" value="${state.evidence}">
        <label><span>备份冗余 B</span><small id="redundancyText">${state.redundancy}</small></label>
        <input id="bombRedundancy" type="range" min="40" max="100" step="1" value="${state.redundancy}">
      </div>` : "";
    controls.innerHTML = scenarioSelect + auditSelect + `
      <div class="control-group bombs-ui">
        <label><span>任务条件</span><small>${isExtend ? "多条件论证" : "低门槛"}</small></label>
        ${conditionDefs.map(item => `
          <div class="bomb-switch">
            <span><b>${item.symbol}</b> ${item.short}</span>
            <input id="bomb-${item.key}" type="checkbox" ${state[item.key] ? "checked" : ""}>
          </div>`).join("")}
      </div>
      ${sliders}
      <div class="control-group bombs-ui">
        <div class="bomb-actions">
          <button id="bombStep" type="button">推演一步</button>
          <button id="bombAuto" type="button" class="primary">${isExtend ? "优化论证" : "补齐条件"}</button>
          <button id="bombReset" type="button">重置</button>
        </div>
      </div>`;

    const scenarioEl = document.getElementById("bombScenario");
    if (scenarioEl) scenarioEl.value = state.scenario;
    const auditEl = document.getElementById("bombAudit");
    if (auditEl) auditEl.value = state.audit;

    conditionDefs.forEach(item => {
      const el = document.getElementById("bomb-" + item.key);
      if (el) el.addEventListener("change", () => {
        state[item.key] = el.checked;
        state.step = Math.min(state.step, proofRows().length - 1);
        render();
      });
    });
    if (scenarioEl) scenarioEl.addEventListener("change", () => {
      state.scenario = scenarioEl.value;
      state.step = 0;
      render();
    });
    if (auditEl) auditEl.addEventListener("change", () => {
      state.audit = auditEl.value;
      render();
    });
    [["bombEvidence", "evidence", "evidenceText"], ["bombRedundancy", "redundancy", "redundancyText"]].forEach(([id, key, label]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", () => {
        state[key] = Number(el.value);
        const text = document.getElementById(label);
        if (text) text.textContent = state[key];
        render();
      });
    });
    document.getElementById("bombStep").addEventListener("click", () => {
      state.step = Math.min(state.step + 1, proofRows().length - 1);
      render();
    });
    document.getElementById("bombAuto").addEventListener("click", () => {
      state.verify = true;
      state.collab = true;
      state.risk = true;
      state.discipline = true;
      if (isExtend) {
        state.evidence = Math.max(state.evidence, 78);
        state.redundancy = Math.max(state.redundancy, 74);
      }
      state.step = proofRows().length - 1;
      syncControls();
      render();
    });
    document.getElementById("bombReset").addEventListener("click", () => {
      state.step = 0;
      state.scenario = "two-bombs";
      state.audit = "direct";
      state.verify = true;
      state.collab = true;
      state.risk = isExtend;
      state.discipline = true;
      state.evidence = isExtend ? 82 : 70;
      state.redundancy = isExtend ? 76 : 60;
      syncControls();
      render();
    });
  }

  function syncControls() {
    const scenarioEl = document.getElementById("bombScenario");
    if (scenarioEl) scenarioEl.value = state.scenario;
    const auditEl = document.getElementById("bombAudit");
    if (auditEl) auditEl.value = state.audit;
    conditionDefs.forEach(item => {
      const el = document.getElementById("bomb-" + item.key);
      if (el) el.checked = !!state[item.key];
    });
    const evidence = document.getElementById("bombEvidence");
    const redundancy = document.getElementById("bombRedundancy");
    if (evidence) evidence.value = state.evidence;
    if (redundancy) redundancy.value = state.redundancy;
    const evidenceText = document.getElementById("evidenceText");
    const redundancyText = document.getElementById("redundancyText");
    if (evidenceText) evidenceText.textContent = state.evidence;
    if (redundancyText) redundancyText.textContent = state.redundancy;
  }

  function proofRows() {
    const scenario = scenarios[state.scenario];
    const gates = conditionDefs.every(item => !!state[item.key]);
    const ready = goReady();
    const rows = [
      { formula: "V", reason: scenario.variables.verify, ok: state.verify },
      { formula: "C", reason: scenario.variables.collab, ok: state.collab },
      { formula: "R", reason: scenario.variables.risk, ok: state.risk },
      { formula: "S", reason: scenario.variables.discipline, ok: state.discipline },
      { formula: "G = V ∧ C ∧ R ∧ S", reason: "合取判断：条件缺一不可", ok: gates }
    ];
    if (isExtend) {
      rows.push({ formula: "E ≥ 70", reason: "证据强度审计", ok: state.evidence >= 70 });
      rows.push({ formula: "B ≥ 70", reason: "备份冗余审计", ok: state.redundancy >= 70 });
      if (state.audit === "contra") {
        rows.push({ formula: "¬Action -> ¬G ∨ E不足 ∨ B不足", reason: "逆否与反事实观察", ok: !ready || gates });
      } else if (state.audit === "necessary") {
        rows.push({ formula: "Action -> V ∧ C ∧ R ∧ S ∧ E ∧ B", reason: "必要条件审计", ok: ready });
      } else {
        rows.push({ formula: scenario.implication, reason: "由充分条件推出行动结论", ok: ready });
      }
    } else {
      rows.push({ formula: "G -> 行动稳健", reason: "由条件齐备推出可推进", ok: ready });
    }
    return rows;
  }

  function renderCircuit(ready, rows) {
    const active = key => state[key] ? " active" : "";
    const rowActive = index => index <= state.step ? " visited" : "";
    return `
      <svg class="bomb-circuit" viewBox="0 0 920 330" role="img" aria-label="两弹一星命题逻辑推理图">
        <defs>
          <filter id="bombShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#451f0f" flood-opacity="0.18"/>
          </filter>
        </defs>
        <g class="bomb-lines">
          <line x1="160" y1="70" x2="430" y2="150" class="${state.verify ? "on" : ""}${rowActive(0)}"/>
          <line x1="160" y1="140" x2="430" y2="160" class="${state.collab ? "on" : ""}${rowActive(1)}"/>
          <line x1="160" y1="210" x2="430" y2="170" class="${state.risk ? "on" : ""}${rowActive(2)}"/>
          <line x1="160" y1="280" x2="430" y2="180" class="${state.discipline ? "on" : ""}${rowActive(3)}"/>
          <line x1="530" y1="165" x2="725" y2="165" class="${ready ? "on" : ""}${rowActive(rows.length - 1)}"/>
        </g>
        ${node("V", "科学验证", 90, 70, active("verify"), rowActive(0))}
        ${node("C", "协同攻关", 90, 140, active("collab"), rowActive(1))}
        ${node("R", "风险闭环", 90, 210, active("risk"), rowActive(2))}
        ${node("S", "纪律担当", 90, 280, active("discipline"), rowActive(3))}
        <g class="bomb-gate${rows[4].ok ? " active" : ""}${rowActive(4)}" transform="translate(480 165)">
          <rect x="-50" y="-48" width="100" height="96" rx="8" filter="url(#bombShadow)"/>
          <text y="-6">AND</text>
          <text y="24">∧</text>
        </g>
        <g class="bomb-decision${ready ? " go" : ""}" transform="translate(790 165)">
          <circle r="48" filter="url(#bombShadow)"/>
          <text y="-5">${ready ? "GO" : "WAIT"}</text>
          <text y="24">${isExtend ? "审计" : "判断"}</text>
        </g>
      </svg>`;
  }

  function node(symbol, label, x, y, stateClass, visitedClass) {
    return `
      <g class="bomb-node${stateClass}${visitedClass}" transform="translate(${x} ${y})">
        <circle r="30" filter="url(#bombShadow)"/>
        <text class="symbol" y="6">${symbol}</text>
        <text class="label" x="46" y="5">${esc(label)}</text>
      </g>`;
  }

  function render() {
    const scenario = scenarios[state.scenario];
    const rows = proofRows();
    const ready = goReady();
    state.step = Math.min(state.step, rows.length - 1);
    const shownRows = rows.map((row, index) => ({ ...row, unlocked: index <= state.step }));
    const missing = missingItems();

    viz.innerHTML = `
      <div class="bombs-board">
        <div class="bombs-head">
          <div>
            <h2>${esc(isExtend ? "战略论证迁移推演" : "两弹一星条件推演")}</h2>
            <p>${esc(scenario.title)} · ${esc(scenario.transfer)}</p>
          </div>
          <span class="bombs-badge">${esc(isExtend ? "拓展审计" : "基础判断")}</span>
        </div>
        <div class="bombs-canvas">${renderCircuit(ready, rows)}</div>
        <div class="bombs-grid">
          <section class="bombs-panel">
            <h3>前提条件</h3>
            ${conditionDefs.map(item => `
              <button class="bomb-condition ${state[item.key] ? "on" : "off"}" data-key="${item.key}" type="button">
                <span>${item.symbol}</span>
                <strong>${esc(scenario.variables[item.key])}</strong>
                <em>${esc(item.role)}</em>
              </button>`).join("")}
          </section>
          <section class="bombs-panel bombs-proof">
            <h3>推理链</h3>
            <table>
              <thead><tr><th>步</th><th>公式</th><th>理由</th><th>状态</th></tr></thead>
              <tbody>${shownRows.map((row, index) => `
                <tr class="${row.unlocked ? (row.ok ? "ok" : "warn") : "locked"}">
                  <td>${index + 1}</td>
                  <td>${row.unlocked ? esc(row.formula) : "..."}</td>
                  <td>${row.unlocked ? esc(row.reason) : "等待推演"}</td>
                  <td>${row.unlocked ? (row.ok ? "满足" : "缺口") : "-"}</td>
                </tr>`).join("")}</tbody>
            </table>
          </section>
          <section class="bombs-panel">
            <h3>行动判断</h3>
            <div class="bomb-light ${ready ? "go" : "wait"}">${ready ? "GO" : "WAIT"}</div>
            <p>${ready ? esc(scenario.goal + "：条件链已闭合。") : "暂不推进：请先补齐关键前提。"}</p>
            <div class="bomb-gap-list">
              ${(missing.length ? missing : ["全部前提满足"]).map(item => `<span>${esc(item)}</span>`).join("")}
            </div>
          </section>
        </div>
      </div>`;

    viz.querySelectorAll(".bomb-condition").forEach(button => {
      button.addEventListener("click", () => {
        const key = button.dataset.key;
        state[key] = !state[key];
        syncControls();
        render();
      });
    });

    formulaText.textContent = isExtend
      ? `${scenario.title}: G 与 E/B 联合审计`
      : "G = V ∧ C ∧ R ∧ S";
    resultValue.innerHTML = `<span class="truth-chip${ready ? "" : " false"}">${ready ? "可推进" : "待补齐"}</span>`;
    resultExtra.textContent = ready
      ? "条件、证据和行动边界一致，推理链闭合。"
      : "当前缺口：" + missing.join("；");
  }

  function injectStyle() {
    if (document.getElementById("two-bombs-tiered-style")) return;
    const style = document.createElement("style");
    style.id = "two-bombs-tiered-style";
    style.textContent = `
      body { height: auto !important; min-height: 100vh !important; overflow-x: hidden !important; overflow-y: auto !important; }
      .value-panel { display: none !important; }
      .app-container { margin-top: 58px !important; margin-bottom: 24px !important; height: auto !important; min-height: calc(100vh - 116px) !important; }
      .glass-pane { display: grid; grid-template-rows: auto auto minmax(520px, auto) auto; gap: 12px; overflow: visible !important; }
      .glass-pane > #dm-page-layers { grid-row: 1; padding: 12px !important; max-height: none !important; overflow: visible !important; animation: none !important; }
      .glass-pane > #dm-page-layers .dm-pl-head { margin-bottom: 8px !important; }
      .glass-pane > #dm-page-layers .dm-ladder { gap: 10px !important; }
      .glass-pane > #dm-page-layers .dm-tier { padding: 10px 12px !important; min-height: 0 !important; }
      .glass-pane > #dm-page-layers .dm-tier-task { margin: 6px 0 8px !important; font-size: 13px !important; }
      .glass-pane > #dm-page-layers .dm-tier-btn { min-height: 32px !important; padding: 7px 10px !important; }
      .mission-card { grid-row: 2; margin-bottom: 0 !important; padding: 12px 14px !important; }
      .result-card { grid-row: 4; margin-top: 0 !important; padding: 12px !important; }
      .logic-board.bombs-active { grid-row: 3; padding: 14px !important; min-height: 520px !important; overflow: visible !important; }
      .bombs-board { min-height: 100%; display: grid; grid-template-rows: auto minmax(220px, auto) auto; gap: 10px; }
      .bombs-head { display: flex; justify-content: space-between; gap: 14px; align-items: center; }
      .bombs-head h2 { margin: 0; color: #b42318; font: 400 28px "Ma Shan Zheng", "Noto Serif SC", serif; }
      .bombs-head p { margin: 4px 0 0; color: #6c5a52; }
      .bombs-badge { border-radius: 999px; padding: 7px 11px; color: #2f5f9f; background: rgba(47,95,159,.1); font-weight: 800; white-space: nowrap; }
      .bombs-canvas { min-height: 220px; border: 1px solid rgba(116,55,31,.14); border-radius: 8px; background: rgba(255,253,246,.62); overflow: hidden; }
      .bomb-circuit { width: 100%; min-height: 220px; display: block; }
      .bomb-lines line { stroke: rgba(47,95,159,.24); stroke-width: 4; stroke-linecap: round; }
      .bomb-lines line.on { stroke: #2f7d57; }
      .bomb-lines line.visited { stroke-dasharray: 10 7; }
      .bomb-node circle { fill: #fff9e8; stroke: #c58a1f; stroke-width: 3; }
      .bomb-node.active circle { fill: #f4fff2; stroke: #2f7d57; }
      .bomb-node.visited circle { stroke-width: 5; }
      .bomb-node .symbol { text-anchor: middle; fill: #3b2a24; font: 900 18px "JetBrains Mono", Consolas, monospace; }
      .bomb-node .label { fill: #4e362d; font: 800 14px "Noto Serif SC", serif; }
      .bomb-gate rect { fill: #fff; stroke: #b42318; stroke-width: 3; }
      .bomb-gate.active rect { fill: #fff4ed; stroke: #2f7d57; }
      .bomb-gate text, .bomb-decision text { text-anchor: middle; font: 900 18px "JetBrains Mono", Consolas, monospace; fill: #b42318; }
      .bomb-decision circle { fill: #fff2ef; stroke: #b42318; stroke-width: 4; }
      .bomb-decision.go circle { fill: #edf9ef; stroke: #2f7d57; }
      .bomb-decision.go text { fill: #2f7d57; }
      .bombs-grid { min-height: 0; display: grid; grid-template-columns: 1.05fr 1.6fr 1.05fr; gap: 10px; }
      .bombs-panel { min-height: 0; border: 1px solid rgba(116,55,31,.16); border-radius: 8px; background: rgba(255,255,255,.74); padding: 10px; overflow: auto; }
      .bombs-panel h3 { margin: 0 0 8px; color: #b42318; font-size: 15px; }
      .bomb-condition { width: 100%; margin: 0 0 6px; padding: 8px; border-radius: 8px; border: 1px solid rgba(116,55,31,.18); background: rgba(255,250,242,.96); color: #3b2a24; text-align: left; cursor: pointer; display: grid; grid-template-columns: 34px 1fr; gap: 2px 8px; align-items: center; }
      .bomb-condition span { grid-row: span 2; width: 30px; height: 30px; display: grid; place-items: center; border-radius: 50%; background: #fff; border: 2px solid #c58a1f; font: 900 14px "JetBrains Mono", Consolas, monospace; }
      .bomb-condition strong { font-size: 13px; }
      .bomb-condition em { color: #7c6257; font-style: normal; font-size: 12px; }
      .bomb-condition.on { border-color: rgba(47,125,87,.45); background: rgba(47,125,87,.1); }
      .bomb-condition.on span { border-color: #2f7d57; color: #2f7d57; }
      .bomb-condition.off { border-color: rgba(180,35,24,.25); background: rgba(180,35,24,.06); }
      .bombs-proof table { font-size: 11px; }
      .bombs-proof tr.ok td { background: rgba(47,125,87,.09); }
      .bombs-proof tr.warn td { background: rgba(180,35,24,.08); }
      .bombs-proof tr.locked td { color: #9a8b84; }
      .bomb-light { height: 58px; border-radius: 8px; display: grid; place-items: center; margin-bottom: 8px; font: 900 26px "JetBrains Mono", Consolas, monospace; }
      .bomb-light.go { color: #2f7d57; background: rgba(47,125,87,.12); border: 1px solid rgba(47,125,87,.3); }
      .bomb-light.wait { color: #b42318; background: rgba(180,35,24,.1); border: 1px solid rgba(180,35,24,.25); }
      .bomb-gap-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
      .bomb-gap-list span { border-radius: 999px; padding: 6px 9px; background: rgba(197,138,31,.14); color: #6b4a18; font-size: 12px; font-weight: 800; }
      .bomb-switch { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 8px 0; color: #4e362d; }
      .bomb-switch b { color: #b42318; font-family: "JetBrains Mono", Consolas, monospace; }
      .bomb-switch input { width: 18px; height: 18px; accent-color: #2f7d57; }
      .bomb-actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
      .bomb-actions button { min-height: 38px; border-radius: 8px; border: 1px solid rgba(47,125,87,.26); background: rgba(255,250,242,.96); color: #276146; font: 900 13px "Noto Serif SC", serif; cursor: pointer; }
      .bomb-actions button.primary { color: #fff; background: #2f7d57; }
      #resultExtra:empty { display: none; }
      @media (max-width: 920px) {
        .app-container { height: auto !important; margin-top: 56px !important; }
        .glass-pane { display: grid; grid-template-rows: auto auto minmax(520px, auto) auto; overflow: visible !important; }
        .bombs-board { min-height: 720px; grid-template-rows: auto 280px auto; }
        .bombs-grid { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function applyLayout() {
    const desktop = window.innerWidth > 920;
    const app = document.querySelector(".app-container");
    const side = document.querySelector(".side-panel");
    const main = document.querySelector(".glass-pane");
    const board = document.querySelector(".logic-board");
    const layers = document.getElementById("dm-page-layers");
    const mission = document.querySelector(".mission-card");
    const result = document.querySelector(".result-card");

    viz.classList.add("bombs-active");
    setImportant(document.body, "height", "auto");
    setImportant(document.body, "min-height", "100vh");
    setImportant(document.body, "overflow-x", "hidden");
    setImportant(document.body, "overflow-y", "auto");

    if (!app || !side || !main || !board) return;

    if (desktop) {
      setImportant(app, "display", "grid");
      setImportant(app, "grid-template-columns", "minmax(300px, 360px) minmax(0, 1fr)");
      setImportant(app, "grid-template-rows", "minmax(0, 1fr)");
      setImportant(app, "width", "min(1440px, calc(100vw - 40px))");
      setImportant(app, "height", "auto");
      setImportant(app, "min-height", "calc(100vh - 116px)");
      setImportant(app, "margin", "56px auto 0");
      setImportant(app, "padding", "0");
      setImportant(app, "gap", "18px");
      setImportant(app, "overflow", "visible");
      setImportant(app, "background", "transparent");
      setImportant(app, "border", "0");
      setImportant(app, "box-shadow", "none");

      setImportant(side, "height", "auto");
      setImportant(side, "min-height", "0");
      setImportant(side, "overflow", "visible");
      setImportant(side, "border-radius", "8px");
      setImportant(side, "padding", "20px");

      setImportant(main, "display", "grid");
      setImportant(main, "grid-template-rows", "auto auto minmax(520px, auto) auto");
      setImportant(main, "height", "auto");
      setImportant(main, "min-height", "0");
      setImportant(main, "overflow", "visible");
      setImportant(main, "border-radius", "8px");
      setImportant(main, "padding", "16px");
      setImportant(main, "gap", "12px");

      if (layers) {
        setImportant(layers, "grid-row", "1");
        setImportant(layers, "padding", "12px");
        setImportant(layers, "max-height", "none");
        setImportant(layers, "overflow", "visible");
        setImportant(layers, "animation", "none");
      }
      if (mission) {
        setImportant(mission, "grid-row", "2");
        setImportant(mission, "margin", "0");
        setImportant(mission, "padding", "12px 14px");
      }
      setImportant(board, "grid-row", "3");
      setImportant(board, "height", "auto");
      setImportant(board, "min-height", "520px");
      setImportant(board, "overflow", "visible");
      if (result) {
        setImportant(result, "grid-row", "4");
        setImportant(result, "margin", "0");
        setImportant(result, "padding", "12px");
      }
    } else {
      setImportant(app, "display", "grid");
      setImportant(app, "grid-template-columns", "1fr");
      setImportant(app, "grid-template-rows", "auto auto");
      setImportant(app, "width", "min(100vw - 22px, 720px)");
      setImportant(app, "height", "auto");
      setImportant(app, "min-height", "0");
      setImportant(app, "overflow", "visible");
      setImportant(side, "height", "auto");
      setImportant(side, "overflow", "visible");
      setImportant(main, "display", "grid");
      setImportant(main, "grid-template-rows", "auto auto minmax(520px, auto) auto");
      setImportant(main, "height", "auto");
      setImportant(main, "overflow", "visible");
      setImportant(board, "min-height", "520px");
      if (layers) setImportant(layers, "max-height", "none");
    }
  }

  injectStyle();
  applyLayout();
  buildControls();
  render();
  if (document.querySelector('script[src*="ai-tutor.js"]')) {
    setTimeout(() => document.documentElement.classList.remove("two-bombs-booting"), 900);
  } else {
    document.documentElement.classList.remove("two-bombs-booting");
  }
  window.addEventListener("resize", applyLayout);
  window.addEventListener("load", () => {
    applyLayout();
  });
})();
