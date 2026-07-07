(function () {
  "use strict";

  const NODES = [
    { id: 0, name: "长沙", desc: "岳麓书院 · 千年学府", x: 600, y: 200, icon: "🏫", note: "省会枢纽" },
    { id: 1, name: "韶山", desc: "毛泽东故居 · 红色圣地", x: 500, y: 250, icon: "🚩", note: "红色文化" },
    { id: 2, name: "张家界", desc: "武陵源 · 奇峰三千", x: 250, y: 150, icon: "⛰️", note: "自然遗产" },
    { id: 3, name: "湘西", desc: "凤凰古城 · 边城风情", x: 150, y: 250, icon: "🏰", note: "古城文脉" },
    { id: 4, name: "岳阳", desc: "岳阳楼 · 洞庭天下水", x: 650, y: 100, icon: "🏯", note: "江湖门户" },
    { id: 5, name: "衡阳", desc: "南岳衡山 · 五岳独秀", x: 550, y: 400, icon: "🏔️", note: "南线节点" },
    { id: 6, name: "常德", desc: "桃花源 · 世外桃源", x: 400, y: 150, icon: "🌸", note: "西北中继" },
    { id: 7, name: "株洲", desc: "炎帝陵 · 华夏始祖", x: 650, y: 300, icon: "🔥", note: "东南中继" }
  ];

  // Keep the same graph as the original advanced page: nodes, edges, positions and weights.
  const EDGES = [
    { u: 0, v: 1, weight: 80 },
    { u: 0, v: 4, weight: 150 },
    { u: 0, v: 6, weight: 180 },
    { u: 0, v: 7, weight: 60 },
    { u: 1, v: 5, weight: 120 },
    { u: 1, v: 6, weight: 140 },
    { u: 1, v: 7, weight: 90 },
    { u: 2, v: 3, weight: 100 },
    { u: 2, v: 6, weight: 130 },
    { u: 3, v: 6, weight: 200 },
    { u: 4, v: 6, weight: 160 },
    { u: 5, v: 7, weight: 110 },
    { u: 0, v: 5, weight: 170 }
  ];

  const CONFIG = {
    basic: {
      tier: "基础层",
      title: "湖湘遗产数字连接",
      subtitle: "生成树 / 极小连通子图 / n-1 边 / 低门槛 · 建立直觉",
      mission: "把遗产点抽象成顶点，把联网费用抽象成边权，观察 MST 如何让全网连通。",
      visual: "入门观察",
      startFixed: true,
      graphTitle: "湖南省文化遗产联网图",
      graphCaption: "固定从长沙出发；黄色为候选边，红色为已选骨干边。"
    },
    advanced: {
      tier: "进阶层",
      title: "MST 最省联网推演",
      subtitle: "Prim 最小生成树 / 割边候选集 / 贪心选边 / 核心掌握 · 建模求解",
      mission: "每一步从割边候选集中取最小权重，验证最终生成树的总成本。",
      visual: "Prim 步进",
      startFixed: false,
      graphTitle: "湖南省文化遗产分布图",
      graphCaption: "保留原进阶页的 8 个节点、13 条边、位置与权重。"
    },
    extend: {
      tier: "拓展层",
      title: "数字湖湘共享网络",
      subtitle: "冗余链路与韧性 / 非树边 / 可靠性补强 / 高天花板 · 迁移工程",
      mission: "先得到最低成本骨干，再选择少量冗余边，观察“更稳”需要付出的额外成本。",
      visual: "骨干 + 备份",
      startFixed: false,
      graphTitle: "数字文化资源共享网络",
      graphCaption: "红色是最低成本骨干；蓝色虚线是补充的冗余链路。"
    }
  };

  const BACKUP_COPY = {
    "1-7": { label: "韶山-株洲互备", benefit: 15 },
    "1-5": { label: "韶山-衡阳南线", benefit: 12 },
    "4-6": { label: "岳阳-常德北线", benefit: 14 },
    "0-5": { label: "长沙-衡阳直连", benefit: 10 },
    "0-6": { label: "长沙-常德中继", benefit: 9 },
    "3-6": { label: "湘西-常德西线", benefit: 13 }
  };

  const LAYER_CARDS = [
    {
      layer: "basic",
      tag: "基础层",
      title: "生成树",
      concept: "极小连通子图 / n-1 边",
      sub: "低门槛 · 建立直觉",
      task: "理解遗产点、连接边与生成树概念。",
      dots: "●○○",
      page: "hunan-mst-index-basic.html"
    },
    {
      layer: "advanced",
      tag: "进阶层",
      title: "Prim 最小生成树",
      concept: "割边候选集 / 贪心选边",
      sub: "核心掌握 · 建模求解",
      task: "用 Prim 步进推演最省联网方案。",
      dots: "●●○",
      page: "hunan-mst-index.html"
    },
    {
      layer: "extend",
      tag: "拓展层",
      title: "冗余链路与韧性",
      concept: "非树边 / 可靠性补强",
      sub: "高天花板 · 迁移工程",
      task: "在 MST 骨干上比较成本与备份韧性。",
      dots: "●●●",
      page: "hunan-mst-index-extend.html"
    }
  ];

  const state = {
    layer: detectLayer(),
    startId: 0,
    step: 0,
    backupStep: 0,
    backupLimit: 2,
    strategy: "balanced",
    auto: false,
    message: "",
    timer: null
  };

  function detectLayer() {
    const explicit = document.body.dataset.mstLayer || window.HUNAN_MST_LAYER;
    if (explicit) return explicit;
    const path = decodeURIComponent(location.pathname).toLowerCase();
    if (path.includes("-basic")) return "basic";
    if (path.includes("-extend")) return "extend";
    return "advanced";
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

  function edgeId(edge) {
    return `${Math.min(edge.u, edge.v)}-${Math.max(edge.u, edge.v)}`;
  }

  function nodeName(id) {
    return NODES.find(node => node.id === id).name;
  }

  function edgeName(edge) {
    return `${nodeName(edge.u)}-${nodeName(edge.v)}`;
  }

  function oriented(edge, visited) {
    const uIn = visited.has(edge.u);
    const vIn = visited.has(edge.v);
    return {
      ...edge,
      id: edgeId(edge),
      from: uIn && !vIn ? edge.u : edge.v,
      to: uIn && !vIn ? edge.v : edge.u
    };
  }

  function primPlan(startId) {
    const visited = new Set([startId]);
    const steps = [];
    let cost = 0;

    while (visited.size < NODES.length) {
      const candidates = EDGES
        .filter(edge => visited.has(edge.u) !== visited.has(edge.v))
        .map(edge => oriented(edge, visited))
        .sort((a, b) => a.weight - b.weight || a.id.localeCompare(b.id));

      if (!candidates.length) break;

      const best = candidates[0];
      cost += best.weight;
      steps.push({
        before: Array.from(visited),
        candidates,
        edge: best,
        to: best.to,
        cost
      });
      visited.add(best.to);
    }

    return steps;
  }

  function viewModel() {
    const plan = primPlan(state.startId);
    const selectedSteps = plan.slice(0, Math.min(state.step, plan.length));
    const selectedIds = new Set(selectedSteps.map(item => item.edge.id));
    const visited = new Set([state.startId]);
    let cost = 0;

    selectedSteps.forEach(item => {
      visited.add(item.to);
      cost += item.edge.weight;
    });

    const current = state.step < plan.length ? plan[state.step] : null;
    const backups = backupCandidates(selectedIds);
    const chosenBackups = state.layer === "extend" && state.step >= plan.length
      ? backups.slice(0, Math.min(state.backupStep, state.backupLimit))
      : [];
    const currentBackup = state.layer === "extend" && state.step >= plan.length && state.backupStep < state.backupLimit
      ? backups[state.backupStep]
      : null;

    return {
      plan,
      selectedSteps,
      selectedIds,
      visited,
      cost,
      current,
      candidates: current ? current.candidates : [],
      backups,
      chosenBackups,
      currentBackup,
      done: state.step >= plan.length
    };
  }

  function backupCandidates(selectedIds) {
    const items = EDGES
      .filter(edge => !selectedIds.has(edgeId(edge)))
      .map(edge => {
        const id = edgeId(edge);
        const copy = BACKUP_COPY[id] || { label: `${edgeName(edge)}备份`, benefit: Math.max(6, 18 - Math.round(edge.weight / 20)) };
        return { ...edge, id, label: copy.label, benefit: copy.benefit };
      });

    if (state.strategy === "cost") {
      return items.sort((a, b) => a.weight - b.weight || b.benefit - a.benefit);
    }
    if (state.strategy === "resilient") {
      return items.sort((a, b) => b.benefit - a.benefit || a.weight - b.weight);
    }
    return items.sort((a, b) => (b.benefit / b.weight) - (a.benefit / a.weight));
  }

  function buildShell() {
    const app = document.getElementById("mstApp") || document.querySelector(".app-container");
    const config = CONFIG[state.layer];
    const layerInfo = LAYER_CARDS.find(card => card.layer === state.layer) || LAYER_CARDS[1];
    if (!app) return;
    app.className = "app-container";
    app.setAttribute("data-dm-self-layout", "1");
    document.body.dataset.mstLayer = state.layer;
    document.title = `第8章 特殊图 - ${config.title}（${config.tier}）`;
    app.innerHTML = `
      <aside class="mst-sidebar sidebar">
        <div class="mst-header layer-summary">
          <h1>${esc(layerInfo.title)}</h1>
          <p class="summary-concept">${esc(layerInfo.concept)}</p>
          <p class="summary-sub">${esc(layerInfo.sub)}</p>
          <p class="summary-task">🎯 ${esc(layerInfo.task)}</p>
        </div>

        <section class="mission-card">
          <div class="mission-title"><span>互动任务</span><span class="difficulty-chip">${esc(config.visual)}</span></div>
          <div class="mission-text">${esc(config.mission)}</div>
        </section>

        <div id="mstControls" class="controls-wrapper"></div>
        <div id="mstStats" class="stats-grid"></div>

        <section class="formula-card">
          <div class="formula-title">公式项高亮</div>
          <div id="mstFormula" class="formula-list"></div>
        </section>

        <section class="candidate-card">
          <div class="candidate-title">候选边观察</div>
          <div id="candidateList" class="candidate-list"></div>
        </section>

        <section class="feedback-card">
          <div class="feedback-title">即时反馈</div>
          <div id="mstFeedback" class="feedback-body"></div>
        </section>
      </aside>

      <main class="visualizer-stage">
        ${tierBoard()}
        <div class="glass-pane">
          <div class="map-bg"></div>
          <div class="graph-title">
            <h2>${esc(config.graphTitle)}</h2>
            <div class="graph-caption">${esc(config.graphCaption)}</div>
          </div>
          <div class="legend">
            <div class="legend-item"><span class="legend-dot connected"></span><span>已入网</span></div>
            <div class="legend-item"><span class="legend-dot"></span><span>未连接</span></div>
            <div class="legend-item"><span class="legend-line candidate"></span><span>候选连接</span></div>
            <div class="legend-item"><span class="legend-line mst"></span><span>骨干网络</span></div>
            ${state.layer === "extend" ? '<div class="legend-item"><span class="legend-line backup"></span><span>冗余链路</span></div>' : ""}
          </div>
          <div id="nodeInfoPopup" class="node-popup" role="status" aria-live="polite"></div>
          <svg id="graphSvg" viewBox="70 35 680 430" role="img" aria-label="湖南省文化遗产数字化最小生成树交互图">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur"></feGaussianBlur>
                <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
              </filter>
            </defs>
            <g id="edgesGroup"></g>
            <g id="nodesGroup"></g>
          </svg>
          <div class="graph-status">
            <div id="graphSummary" class="graph-summary"></div>
            <div id="formulaMini" class="formula-mini"></div>
          </div>
        </div>
      </main>
    `;
  }

  function tierBoard() {
    return `
      <section class="tier-board" aria-label="三阶层次案例">
        <div class="tier-board-head">
          <div>
            <span class="tier-board-title">📚 三阶层次案例</span>
            <span class="tier-board-sub">低门槛 · 高天花板 — 点「进入本层」切换难度</span>
          </div>
          <button class="tier-board-toggle" type="button" data-action="toggle-tier">收起</button>
        </div>
        <div class="tier-ladder">
          ${LAYER_CARDS.map(card => tierCard(card)).join("")}
        </div>
      </section>
    `;
  }

  function tierCard(card) {
    const current = state.layer === card.layer;
    return `
      <article class="tier-card tier-card-${esc(card.layer)}${current ? " current" : ""}">
        <div class="tier-card-top">
          <span class="tier-card-tag">${esc(card.tag)}</span>
          <span class="tier-dots" aria-hidden="true">${esc(card.dots)}</span>
          ${current ? '<span class="tier-current-badge">当前</span>' : ""}
        </div>
        <h2>${esc(card.title)}</h2>
        <div class="tier-card-concept">${esc(card.concept)}</div>
        <div class="tier-card-sub">${esc(card.sub)}</div>
        <p class="tier-card-task">🎯 ${esc(card.task)}</p>
        ${current
          ? '<button class="tier-card-btn current-btn" type="button" disabled>✓ 你在本层</button>'
          : `<a class="tier-card-btn" href="${esc(card.page)}">▶ 进入本层互动页</a>`}
      </article>
    `;
  }

  function layerLink(layer, label, href) {
    return `<a class="layer-link${state.layer === layer ? " active" : ""}" href="${href}">${label}</a>`;
  }

  function render() {
    const view = viewModel();
    renderControls(view);
    renderStats(view);
    renderFormula(view);
    renderCandidates(view);
    renderFeedback(view);
    renderGraph(view);
    renderGraphSummary(view);
  }

  function renderControls(view) {
    const controls = document.getElementById("mstControls");
    if (!controls) return;
    if (state.layer === "basic") {
      controls.innerHTML = `
        <div class="control-group">
          <label><span>起点</span><small>固定</small></label>
          <select disabled><option>长沙（省会枢纽）</option></select>
        </div>
        <div class="button-row single">
          <button class="mst-btn primary-btn" data-action="step" ${view.done ? "disabled" : ""}>下一步：选择最小候选边</button>
        </div>
        <div class="button-row">
          <button class="mst-btn secondary-btn" data-action="reset">重置</button>
          <button class="mst-btn ghost-btn" data-action="hint">提示</button>
        </div>
      `;
      return;
    }

    const startOptions = NODES.map(node => `<option value="${node.id}"${node.id === state.startId ? " selected" : ""}>从 ${node.name} 开始</option>`).join("");
    if (state.layer === "advanced") {
      controls.innerHTML = `
        <div class="control-group">
          <label><span>连接策略</span><small>Prim 起点</small></label>
          <select data-field="startId">${startOptions}</select>
        </div>
        <div class="button-row">
          <button class="mst-btn primary-btn" data-action="step" ${view.done ? "disabled" : ""}>执行一步</button>
          <button class="mst-btn ghost-btn" data-action="auto" ${view.done ? "disabled" : ""}>${state.auto ? "暂停自动" : "自动推演"}</button>
        </div>
        <div class="button-row single">
          <button class="mst-btn secondary-btn" data-action="reset">重置推演</button>
        </div>
      `;
      return;
    }

    controls.innerHTML = `
      <div class="control-group">
        <label><span>主数据中心</span><small>先建骨干</small></label>
        <select data-field="startId">${startOptions}</select>
      </div>
      <div class="control-group">
        <label><span>冗余策略</span><small>骨干完成后生效</small></label>
        <select data-field="strategy">
          <option value="balanced"${state.strategy === "balanced" ? " selected" : ""}>效益/成本均衡</option>
          <option value="cost"${state.strategy === "cost" ? " selected" : ""}>优先低成本</option>
          <option value="resilient"${state.strategy === "resilient" ? " selected" : ""}>优先韧性提升</option>
        </select>
      </div>
      <div class="control-group">
        <label><span>备份链路数</span><small>1-3 条</small></label>
        <select data-field="backupLimit">
          <option value="1"${state.backupLimit === 1 ? " selected" : ""}>1 条</option>
          <option value="2"${state.backupLimit === 2 ? " selected" : ""}>2 条</option>
          <option value="3"${state.backupLimit === 3 ? " selected" : ""}>3 条</option>
        </select>
      </div>
      <div class="button-row">
        <button class="mst-btn primary-btn" data-action="step" ${extendDone(view) ? "disabled" : ""}>${view.done ? "加入一条备份" : "执行一步"}</button>
        <button class="mst-btn ghost-btn" data-action="auto" ${extendDone(view) ? "disabled" : ""}>${state.auto ? "暂停自动" : "自动推演"}</button>
      </div>
      <div class="button-row single">
        <button class="mst-btn secondary-btn" data-action="reset">重置方案</button>
      </div>
    `;
  }

  function renderStats(view) {
    const stats = document.getElementById("mstStats");
    if (!stats) return;
    const backupCost = view.chosenBackups.reduce((sum, edge) => sum + edge.weight, 0);
    const resilience = state.layer === "extend"
      ? Math.min(100, 62 + view.chosenBackups.reduce((sum, edge) => sum + edge.benefit, 0))
      : Math.round((view.visited.size / NODES.length) * 100);
    const label3 = state.layer === "extend" ? "备份成本" : "候选边数";
    const value3 = state.layer === "extend" ? `${backupCost}` : `${view.candidates.length}`;
    const label4 = state.layer === "extend" ? "韧性指数" : "当前进度";
    const value4 = state.layer === "extend" ? `${resilience}` : `${state.step}/${view.plan.length}`;

    stats.innerHTML = `
      <div class="stat-card"><span>已连接站点</span><strong>${view.visited.size}/${NODES.length}</strong></div>
      <div class="stat-card"><span>骨干成本</span><strong>${view.cost}</strong></div>
      <div class="stat-card"><span>${label3}</span><strong>${value3}</strong></div>
      <div class="stat-card"><span>${label4}</span><strong>${value4}</strong></div>
    `;
  }

  function renderFormula(view) {
    const target = document.getElementById("mstFormula");
    if (!target) return;
    const items = formulaItems(view);
    target.innerHTML = items.map(item => `
      <div class="formula-item${item.active ? " active" : ""}${item.done ? " done" : ""}">
        <span class="formula-symbol">${esc(item.symbol)}</span>
        <span>${esc(item.text)}</span>
      </div>
    `).join("");
  }

  function formulaItems(view) {
    const names = Array.from(view.visited).map(nodeName).join("、");
    const candidateText = view.candidates.length
      ? view.candidates.slice(0, 4).map(edge => `${edgeName(edge)}(${edge.weight})`).join("，")
      : "无";
    const best = view.current ? `${edgeName(view.current.edge)}，w=${view.current.edge.weight}` : "已完成";

    if (state.layer === "basic") {
      return [
        { symbol: "V", text: "8 个遗产点抽象为顶点。", done: true },
        { symbol: "E", text: "两点间数字化连接成本抽象为带权边。", active: state.step === 0, done: state.step > 0 },
        { symbol: "min", text: `本步只比较候选边：${candidateText}`, active: !!view.current },
        { symbol: "Σw", text: `累计成本 = ${view.cost}${view.current ? " + " + view.current.edge.weight : ""}`, active: !!view.current, done: view.done }
      ];
    }

    if (state.layer === "extend" && view.done) {
      const backupCost = view.chosenBackups.reduce((sum, edge) => sum + edge.weight, 0);
      const resilienceGain = view.chosenBackups.reduce((sum, edge) => sum + edge.benefit, 0);
      const nextBackup = view.currentBackup ? `${view.currentBackup.label}(${view.currentBackup.weight})` : "已达到设定条数";
      return [
        { symbol: "T", text: `MST 骨干成本 C_MST = ${view.cost}`, done: true },
        { symbol: "B", text: `从非树边中选择备份：${nextBackup}`, active: !!view.currentBackup },
        { symbol: "C", text: `总成本 C = ${view.cost} + ${backupCost} = ${view.cost + backupCost}`, active: !!view.currentBackup || view.chosenBackups.length > 0 },
        { symbol: "R", text: `韧性提升项 +${resilienceGain}，用于抵消单链路故障风险。`, active: view.chosenBackups.length > 0 }
      ];
    }

    return [
      { symbol: "T_k", text: `已入网集合 T = {${names}}`, active: state.step === 0, done: state.step > 0 },
      { symbol: "C(T)", text: `割边候选集：${candidateText}`, active: !!view.current },
      { symbol: "e*", text: `e* = arg min w(e)：${best}`, active: !!view.current },
      { symbol: "W", text: `W = Σ w(e_i) = ${view.cost}${view.current ? "，下一项 +" + view.current.edge.weight : ""}`, active: !!view.current, done: view.done }
    ];
  }

  function renderCandidates(view) {
    const target = document.getElementById("candidateList");
    if (!target) return;
    if (state.layer === "extend" && view.done) {
      const candidates = view.backups.slice(0, state.backupLimit + 3);
      if (!candidates.length) {
        target.innerHTML = '<div class="candidate-row"><span>暂无可补充链路</span><span>-</span></div>';
        return;
      }
      target.innerHTML = candidates.map((edge, index) => {
        const selected = index < state.backupStep;
        const next = index === state.backupStep && state.backupStep < state.backupLimit;
        return `
          <div class="candidate-row${next ? " next" : ""}">
            <span>${esc(edge.label)} · ${edgeName(edge)} · ${edge.weight} 万元</span>
            <button data-edge="${edge.id}" ${selected || !next ? "disabled" : ""}>${selected ? "已加" : "选择"}</button>
          </div>
        `;
      }).join("");
      return;
    }

    if (!view.current) {
      target.innerHTML = '<div class="candidate-row"><span>所有遗产点已连通，生成树完成。</span><span>OK</span></div>';
      return;
    }

    target.innerHTML = view.candidates.map((edge, index) => `
      <div class="candidate-row${index === 0 ? " next" : ""}">
        <span>${edgeName(edge)} · ${edge.weight} 万元</span>
        <button data-edge="${edge.id}">${index === 0 ? "选它" : "试选"}</button>
      </div>
    `).join("");
  }

  function renderFeedback(view) {
    const target = document.getElementById("mstFeedback");
    if (!target) return;
    if (state.message) {
      target.innerHTML = state.message;
      return;
    }
    if (state.layer === "basic" && view.current) {
      target.innerHTML = `请看黄色候选边，当前最小的是 <b>${edgeName(view.current.edge)}</b>，权重 ${view.current.edge.weight}。点击“下一步”或直接点这条边。`;
      return;
    }
    if (state.layer === "advanced" && view.current) {
      target.innerHTML = `当前已入网 ${view.visited.size} 个节点。Prim 的关键是只在割边候选集中取最小边。`;
      return;
    }
    if (state.layer === "extend" && view.done && view.currentBackup) {
      target.innerHTML = `MST 已完成。现在从非树边里补充 <b>${view.currentBackup.label}</b>，观察成本增加与韧性提升。`;
      return;
    }
    if (state.layer === "extend" && extendDone(view)) {
      target.innerHTML = "骨干和备份链路均已完成。对比红色骨干与蓝色备份，可以看到“更稳”并不等于“更省”。";
      return;
    }
    target.innerHTML = view.done ? "MST 已完成：8 个节点用 7 条边连通，且总成本最低。" : "准备开始。";
  }

  function renderGraphSummary(view) {
    const summary = document.getElementById("graphSummary");
    const mini = document.getElementById("formulaMini");
    if (!summary || !mini) return;
    if (state.layer === "extend" && view.done) {
      const backupCost = view.chosenBackups.reduce((sum, edge) => sum + edge.weight, 0);
      const selectedNames = view.chosenBackups.map(edge => edge.label).join("、") || "暂未补边";
      summary.innerHTML = `骨干成本 <b>${view.cost}</b> 万元；备份链路：${esc(selectedNames)}。`;
      mini.textContent = `C=${view.cost}+${backupCost}`;
      return;
    }
    if (view.current) {
      summary.innerHTML = `第 ${state.step + 1} 步：候选边 ${view.candidates.length} 条，下一条最小边是 <b>${edgeName(view.current.edge)}</b>。`;
      mini.textContent = `min w = ${view.current.edge.weight}`;
      return;
    }
    summary.innerHTML = `生成树完成：选中 ${view.selectedSteps.length} 条边，总成本 <b>${view.cost}</b> 万元。`;
    mini.textContent = `Σw=${view.cost}`;
  }

  function renderGraph(view) {
    const edgesGroup = document.getElementById("edgesGroup");
    const nodesGroup = document.getElementById("nodesGroup");
    if (!edgesGroup || !nodesGroup) return;

    const candidateIds = new Set(view.candidates.map(edge => edge.id));
    const nextId = view.current ? view.current.edge.id : null;
    const backupIds = new Set(view.chosenBackups.map(edge => edge.id));
    const nextBackupId = view.currentBackup ? view.currentBackup.id : null;

    edgesGroup.innerHTML = EDGES.map(edge => {
      const id = edgeId(edge);
      const u = NODES[edge.u];
      const v = NODES[edge.v];
      const midX = (u.x + v.x) / 2;
      const midY = (u.y + v.y) / 2;
      const classes = ["edge-line"];
      if (view.selectedIds.has(id)) classes.push("mst");
      else if (backupIds.has(id)) classes.push("backup");
      else if (id === nextBackupId) classes.push("candidate", "next");
      else if (id === nextId) classes.push("candidate", "next");
      else if (candidateIds.has(id)) classes.push("candidate");
      else if (state.step > 0 || view.done) classes.push("dim");

      const active = view.selectedIds.has(id) || backupIds.has(id) || candidateIds.has(id) || id === nextBackupId;
      return `
        <g>
          <line class="${classes.join(" ")}" x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}"></line>
          <line class="edge-hit" x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}" data-edge="${id}"></line>
          <rect class="edge-label-bg" x="${midX - 17}" y="${midY - 10}" width="34" height="20" rx="5"></rect>
          <text class="edge-label${active ? " active" : ""}" x="${midX}" y="${midY + 4}">${edge.weight}</text>
        </g>
      `;
    }).join("");

    const candidateNodes = new Set();
    view.candidates.forEach(edge => candidateNodes.add(edge.to));
    if (view.currentBackup) {
      candidateNodes.add(view.currentBackup.u);
      candidateNodes.add(view.currentBackup.v);
    }
    view.chosenBackups.forEach(edge => {
      candidateNodes.add(edge.u);
      candidateNodes.add(edge.v);
    });

    nodesGroup.innerHTML = NODES.map(node => {
      const circleClasses = ["node-circle"];
      if (view.visited.has(node.id)) circleClasses.push("connected");
      else if (candidateNodes.has(node.id)) circleClasses.push("candidate");
      if (state.layer === "extend" && view.done && candidateNodes.has(node.id)) circleClasses.push("backup");
      return `
        <g class="node-group" transform="translate(${node.x}, ${node.y})" data-node="${node.id}" tabindex="0">
          <circle class="${circleClasses.join(" ")}" r="21"></circle>
          <text class="node-icon" y="-1">${node.icon}</text>
          <text class="node-text" y="42">${esc(node.name)}</text>
          <text class="node-subtext" y="57">${esc(node.note)}</text>
        </g>
      `;
    }).join("");
  }

  function stepForward() {
    const view = viewModel();
    if (state.layer === "extend" && view.done) {
      if (state.backupStep < state.backupLimit) {
        const next = view.backups[state.backupStep];
        state.backupStep += 1;
        state.message = next ? `已加入 <b>${esc(next.label)}</b>：成本 +${next.weight}，韧性提升 +${next.benefit}。` : "";
      }
      stopAutoIfDone();
      render();
      return;
    }

    if (state.step < view.plan.length) {
      const next = view.plan[state.step].edge;
      state.step += 1;
      state.message = `选中 <b>${esc(edgeName(next))}</b>，本步成本 +${next.weight}。`;
    }
    stopAutoIfDone();
    render();
  }

  function chooseEdge(id) {
    const view = viewModel();
    if (state.layer === "extend" && view.done) {
      const next = view.currentBackup;
      if (!next) return;
      if (id === next.id) {
        stepForward();
      } else {
        state.message = "这条不是当前策略推荐的备份边。先看蓝色候选边与右侧公式中的成本/韧性项。";
        render();
      }
      return;
    }

    if (!view.current) return;
    if (id === view.current.edge.id) {
      stepForward();
    } else {
      const edge = view.candidates.find(item => item.id === id);
      state.message = edge
        ? `你点到了 ${esc(edgeName(edge))}，权重 ${edge.weight}。当前候选集中还有更小的边，请比较黄色边权。`
        : "这条边还不是割边候选，Prim 只能从已入网集合连向未入网节点。";
      render();
    }
  }

  function reset() {
    state.step = 0;
    state.backupStep = 0;
    state.message = "";
    stopAuto();
    render();
  }

  function showHint() {
    const view = viewModel();
    if (view.current) {
      state.message = `提示：先找所有一端在 T、一端不在 T 的边，再比较权重。当前答案就是 ${esc(edgeName(view.current.edge))}。`;
    } else {
      state.message = "已经完成。MST 的边数必须是 n-1，所以 8 个点最终正好选 7 条边。";
    }
    render();
  }

  function toggleTierBoard(button) {
    const board = button.closest(".tier-board");
    if (!board) return;
    const collapsed = board.classList.toggle("collapsed");
    button.textContent = collapsed ? "展开" : "收起";
  }

  function toggleAuto() {
    if (state.auto) {
      stopAuto();
      render();
      return;
    }
    state.auto = true;
    state.timer = window.setInterval(() => {
      const view = viewModel();
      if ((state.layer === "extend" && extendDone(view)) || (state.layer !== "extend" && view.done)) {
        stopAuto();
        render();
        return;
      }
      stepForward();
    }, state.layer === "basic" ? 850 : 950);
    render();
  }

  function stopAuto() {
    if (state.timer) window.clearInterval(state.timer);
    state.timer = null;
    state.auto = false;
  }

  function stopAutoIfDone() {
    const view = viewModel();
    if ((state.layer === "extend" && extendDone(view)) || (state.layer !== "extend" && view.done)) {
      stopAuto();
    }
  }

  function extendDone(view) {
    return state.layer === "extend" && view.done && state.backupStep >= state.backupLimit;
  }

  function bindEvents() {
    document.addEventListener("click", event => {
      const actionButton = event.target.closest("[data-action]");
      if (actionButton) {
        const action = actionButton.dataset.action;
        if (action === "step") stepForward();
        if (action === "reset") reset();
        if (action === "hint") showHint();
        if (action === "auto") toggleAuto();
        if (action === "toggle-tier") toggleTierBoard(actionButton);
        return;
      }
      const edgeButton = event.target.closest("[data-edge]");
      if (edgeButton) chooseEdge(edgeButton.dataset.edge);
    });

    document.addEventListener("change", event => {
      const field = event.target.dataset.field;
      if (!field) return;
      if (field === "startId") state.startId = Number(event.target.value);
      if (field === "strategy") state.strategy = event.target.value;
      if (field === "backupLimit") state.backupLimit = Number(event.target.value);
      state.step = 0;
      state.backupStep = 0;
      state.message = "";
      stopAuto();
      render();
    });

    document.addEventListener("mouseover", event => {
      const group = event.target.closest(".node-group");
      if (group) showPopup(group, event);
    });
    document.addEventListener("mouseout", event => {
      if (event.target.closest(".node-group")) hidePopup();
    });
    document.addEventListener("focusin", event => {
      const group = event.target.closest(".node-group");
      if (group) showPopup(group, event);
    });
    document.addEventListener("focusout", event => {
      if (event.target.closest(".node-group")) hidePopup();
    });
  }

  function showPopup(group, event) {
    const popup = document.getElementById("nodeInfoPopup");
    const svg = document.getElementById("graphSvg");
    if (!popup || !svg) return;
    const node = NODES.find(item => item.id === Number(group.dataset.node));
    if (!node) return;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX ? event.clientX - rect.left : rect.width / 2;
    const y = event.clientY ? event.clientY - rect.top : rect.height / 2;
    popup.innerHTML = `<h3>${esc(node.name)}</h3><p>${esc(node.desc)}<br>${esc(node.note)}</p>`;
    popup.style.left = `${Math.min(Math.max(x + 18, 12), rect.width - 250)}px`;
    popup.style.top = `${Math.min(Math.max(y - 8, 72), rect.height - 110)}px`;
    popup.classList.add("visible");
  }

  function hidePopup() {
    const popup = document.getElementById("nodeInfoPopup");
    if (popup) popup.classList.remove("visible");
  }

  function init() {
    if (!CONFIG[state.layer]) state.layer = "advanced";
    if (state.layer === "basic") state.startId = 0;
    buildShell();
    bindEvents();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
