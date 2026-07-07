(function () {
  "use strict";

  const cfg = window.PLANAR_LAYER_CONFIG || {};
  const layer = cfg.layer || document.body.dataset.layer || "basic";
  const controls = document.getElementById("controls");
  const svg = document.getElementById("graphSvg");
  const edgesGroup = document.getElementById("edgesGroup");
  const nodesGroup = document.getElementById("nodesGroup");
  const stepHint = document.getElementById("stepHint");
  const formulaText = document.getElementById("formulaText");
  const resultValue = document.getElementById("resultValue");
  const resultExtra = document.getElementById("resultExtra");
  const boardTitle = document.getElementById("boardTitle");
  const boardSubtitle = document.getElementById("boardSubtitle");

  const palette = ["#d63b1d", "#2f7d57", "#2f5f9f", "#c58a1f"];
  const phaseNames = ["P1", "P2", "P3", "P4"];
  const viewBox = { w: 820, h: 460 };

  const DATA = {
    basic: {
      defaultBudget: 3,
      steps: [
        { title: "1. 识别车流", terms: ["V"], text: "把每一股可独立放行的车流抽象成一个顶点。" },
        { title: "2. 连接冲突", terms: ["E"], text: "相互不能同时放行的车流之间建立冲突边。" },
        { title: "3. 分配相位", terms: ["chi"], text: "同色代表同一信号相位，目标是相邻顶点不同色。" },
        { title: "4. 检查结果", terms: ["bad"], text: "红色边表示仍存在同相冲突，绿色边表示通过本轮检查。" }
      ],
      scenarios: [
        {
          key: "cross",
          name: "十字路口四股车流",
          subtitle: "K4 去一边：基础三相位模型",
          target: 3,
          nodes: [
            { id: 0, icon: "N", label: "北直行", x: 410, y: 82 },
            { id: 1, icon: "S", label: "南直行", x: 410, y: 378 },
            { id: 2, icon: "E", label: "东左转", x: 658, y: 230 },
            { id: 3, icon: "W", label: "西左转", x: 162, y: 230 }
          ],
          edges: [[0, 2], [0, 3], [1, 2], [1, 3], [2, 3]],
          solution: [0, 0, 1, 2]
        },
        {
          key: "school",
          name: "学校门口五股车流",
          subtitle: "增加人行过街，观察约束增长",
          target: 3,
          nodes: [
            { id: 0, icon: "A", label: "北直行", x: 410, y: 70 },
            { id: 1, icon: "B", label: "公交进站", x: 640, y: 170 },
            { id: 2, icon: "C", label: "人行过街", x: 552, y: 380 },
            { id: 3, icon: "D", label: "南直行", x: 268, y: 380 },
            { id: 4, icon: "E", label: "西左转", x: 180, y: 170 }
          ],
          edges: [[0, 1], [0, 4], [1, 2], [1, 4], [2, 3], [2, 4], [3, 4]],
          solution: [0, 1, 0, 1, 2]
        }
      ]
    },
    extend: {
      defaultBudget: 4,
      steps: [
        { title: "1. 抽取网络", terms: ["V", "E"], text: "多股车流与专用相位共同形成更密的冲突图。" },
        { title: "2. 估计压力", terms: ["Delta"], text: "最大度越高，某一车流受到的同时约束越多。" },
        { title: "3. 排列相位", terms: ["budget", "used"], text: "在给定相位上限内运行排相策略，形成候选方案。" },
        { title: "4. 冲突复核", terms: ["bad"], text: "逐边检查同相冲突，观察红绿边的实时变化。" },
        { title: "5. 效率评估", terms: ["score"], text: "在无冲突优先的前提下，比较相位数、冲突数与通行评分。" }
      ],
      scenarios: [
        {
          key: "artery",
          name: "主干道复合路口",
          subtitle: "七股车流，四相位稳态",
          target: 4,
          nodes: [
            { id: 0, icon: "A", label: "北直行", x: 410, y: 58 },
            { id: 1, icon: "B", label: "南直行", x: 410, y: 402 },
            { id: 2, icon: "C", label: "东左转", x: 674, y: 170 },
            { id: 3, icon: "D", label: "西左转", x: 146, y: 170 },
            { id: 4, icon: "E", label: "公交优先", x: 620, y: 330 },
            { id: 5, icon: "F", label: "人行过街", x: 200, y: 330 },
            { id: 6, icon: "G", label: "应急通道", x: 410, y: 230 }
          ],
          edges: [[0, 2], [0, 3], [0, 5], [1, 2], [1, 3], [1, 5], [2, 3], [2, 4], [2, 6], [3, 4], [3, 6], [4, 5], [4, 6], [5, 6]],
          solution: [0, 0, 1, 2, 0, 1, 3]
        },
        {
          key: "hub",
          name: "多路口联动片区",
          subtitle: "八股车流，四相位更稳",
          target: 4,
          nodes: [
            { id: 0, icon: "A", label: "北进主路", x: 410, y: 54 },
            { id: 1, icon: "B", label: "东进主路", x: 664, y: 120 },
            { id: 2, icon: "C", label: "东左转", x: 694, y: 310 },
            { id: 3, icon: "D", label: "南进主路", x: 510, y: 408 },
            { id: 4, icon: "E", label: "西进主路", x: 310, y: 408 },
            { id: 5, icon: "F", label: "西左转", x: 126, y: 310 },
            { id: 6, icon: "G", label: "公交港湾", x: 156, y: 120 },
            { id: 7, icon: "H", label: "人行相位", x: 410, y: 230 }
          ],
          edges: [[0, 1], [0, 2], [0, 6], [0, 7], [1, 2], [1, 3], [1, 7], [2, 3], [2, 4], [2, 7], [3, 4], [3, 5], [4, 5], [4, 6], [4, 7], [5, 6], [5, 7], [6, 7]],
          solution: [1, 2, 3, 0, 1, 3, 2, 0]
        }
      ]
    }
  };

  let state = {
    scenarioKey: DATA[layer].scenarios[0].key,
    step: 0,
    phaseBudget: DATA[layer].defaultBudget,
    strategy: "degree",
    nodes: [],
    edges: [],
    colors: [],
    selected: null,
    drag: null,
    moved: false
  };

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function svgEl(type, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", type);
    Object.entries(attrs || {}).forEach(([key, value]) => el.setAttribute(key, value));
    return el;
  }

  function edgeKey(edge) {
    return edge.u + "-" + edge.v;
  }

  function currentData() {
    return DATA[layer];
  }

  function currentScenario() {
    return currentData().scenarios.find(s => s.key === state.scenarioKey) || currentData().scenarios[0];
  }

  function cloneScenario(scenario) {
    state.nodes = scenario.nodes.map(node => ({ ...node }));
    state.edges = scenario.edges.map(edge => ({ u: edge[0], v: edge[1] }));
    state.colors = Array(state.nodes.length).fill(null);
    state.selected = null;
    state.step = 0;
  }

  function control(label, body, small) {
    return '<div class="control-group"><label><span>' + esc(label) + '</span>' + (small ? '<small>' + esc(small) + '</small>' : '') + '</label>' + body + '</div>';
  }

  function selectControl(id, label, items, selected, small) {
    const options = items.map(item => '<option value="' + esc(item[0]) + '"' + (item[0] === selected ? " selected" : "") + '>' + esc(item[1]) + '</option>').join("");
    return control(label, '<select id="' + id + '">' + options + '</select>', small);
  }

  function rangeControl(id, label, value, min, max, step, small) {
    return control(label, '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '">', small);
  }

  function button(id, icon, text, primary) {
    return '<button type="button" id="' + id + '" class="tool-btn' + (primary ? " primary" : "") + '" title="' + esc(text) + '"><span aria-hidden="true">' + icon + '</span> ' + esc(text) + '</button>';
  }

  function buildControls() {
    const data = currentData();
    const scenarioItems = data.scenarios.map(s => [s.key, s.name]);
    let html = selectControl("scenarioSelect", "规划场景", scenarioItems, state.scenarioKey, currentScenario().subtitle);
    if (layer === "basic") {
      html += selectControl("phaseBudget", "可用相位", [["2", "2 相位"], ["3", "3 相位"]], String(state.phaseBudget), "基础尝试");
    } else {
      html += rangeControl("phaseBudget", "相位上限", state.phaseBudget, 2, 4, 1, "2-4");
      html += selectControl("strategySelect", "排相策略", [["degree", "高冲突优先"], ["natural", "顺序排相"], ["reverse", "逆序排相"]], state.strategy, "拓展比较");
    }
    html += '<div class="layer-meter" style="--step-count:' + data.steps.length + '"><div id="stepTrack" class="step-track"></div><div id="stepTitle" class="step-title"></div></div>';
    html += '<div class="button-row three">' + button("prevStep", "←", "上一步") + button("nextStep", "→", "下一步", true) + button("resetPlan", "↺", "重置") + '</div>';
    html += '<div class="button-row">' + button("applyPlan", "✓", layer === "basic" ? "推荐相位" : "运行排相", true) + button("clearPlan", "○", "清空相位") + '</div>';
    controls.innerHTML = html;

    controls.querySelector("#scenarioSelect").addEventListener("change", event => {
      state.scenarioKey = event.target.value;
      cloneScenario(currentScenario());
      buildControls();
      render();
    });
    controls.querySelector("#phaseBudget").addEventListener("input", event => {
      state.phaseBudget = Number(event.target.value);
      render();
    });
    controls.querySelector("#phaseBudget").addEventListener("change", event => {
      state.phaseBudget = Number(event.target.value);
      render();
    });
    const strategy = controls.querySelector("#strategySelect");
    if (strategy) {
      strategy.addEventListener("change", event => {
        state.strategy = event.target.value;
        render();
      });
    }
    controls.querySelector("#prevStep").addEventListener("click", () => {
      state.step = Math.max(0, state.step - 1);
      render();
    });
    controls.querySelector("#nextStep").addEventListener("click", () => {
      state.step = Math.min(currentData().steps.length - 1, state.step + 1);
      if (state.step >= 2 && state.colors.every(color => color == null)) seedColors();
      render();
    });
    controls.querySelector("#resetPlan").addEventListener("click", () => {
      cloneScenario(currentScenario());
      buildControls();
      render();
    });
    controls.querySelector("#applyPlan").addEventListener("click", () => {
      applyPlan();
      state.step = layer === "basic" ? 3 : 4;
      render();
    });
    controls.querySelector("#clearPlan").addEventListener("click", () => {
      state.colors = Array(state.nodes.length).fill(null);
      render();
    });
  }

  function seedColors() {
    if (layer === "basic") {
      state.colors = Array(state.nodes.length).fill(0);
      return;
    }
    state.colors = greedyColoring(state.phaseBudget, state.strategy);
  }

  function applyPlan() {
    const scenario = currentScenario();
    if (scenario.solution && state.phaseBudget >= scenario.target) {
      state.colors = scenario.solution.slice();
      return;
    }
    state.colors = greedyColoring(state.phaseBudget, state.strategy);
  }

  function degrees() {
    const d = Array(state.nodes.length).fill(0);
    state.edges.forEach(edge => {
      d[edge.u]++;
      d[edge.v]++;
    });
    return d;
  }

  function greedyColoring(limit, strategy) {
    const n = state.nodes.length;
    const d = degrees();
    let order = Array.from({ length: n }, (_, i) => i);
    if (strategy === "degree") order.sort((a, b) => d[b] - d[a] || a - b);
    if (strategy === "reverse") order.reverse();

    const colors = Array(n).fill(null);
    order.forEach(id => {
      const used = new Set();
      state.edges.forEach(edge => {
        const other = edge.u === id ? edge.v : edge.v === id ? edge.u : null;
        if (other != null && colors[other] != null) used.add(colors[other]);
      });
      let chosen = null;
      for (let color = 0; color < limit; color++) {
        if (!used.has(color)) {
          chosen = color;
          break;
        }
      }
      colors[id] = chosen == null ? 0 : chosen;
    });
    return colors;
  }

  function conflictEdges() {
    return state.edges
      .map((edge, index) => ({ edge, index }))
      .filter(({ edge }) => state.colors[edge.u] != null && state.colors[edge.u] === state.colors[edge.v]);
  }

  function visibleEdges() {
    if (state.step === 0) return new Set();
    return new Set(state.edges.map(edgeKey));
  }

  function cycleNode(id) {
    if (state.step < 2) state.step = 2;
    const current = state.colors[id];
    state.colors[id] = current == null ? 0 : (current + 1) % state.phaseBudget;
    state.selected = id;
    render();
  }

  function pointFromEvent(event) {
    const rect = svg.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * viewBox.w / rect.width,
      y: (event.clientY - rect.top) * viewBox.h / rect.height
    };
  }

  function startDrag(event, id) {
    event.preventDefault();
    const point = pointFromEvent(event);
    const node = state.nodes[id];
    state.drag = { id, dx: point.x - node.x, dy: point.y - node.y };
    state.moved = false;
    state.selected = id;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function onDrag(event) {
    if (!state.drag) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    const node = state.nodes[state.drag.id];
    const nx = Math.max(48, Math.min(viewBox.w - 48, point.x - state.drag.dx));
    const ny = Math.max(50, Math.min(viewBox.h - 50, point.y - state.drag.dy));
    if (Math.abs(nx - node.x) + Math.abs(ny - node.y) > 2) state.moved = true;
    node.x = nx;
    node.y = ny;
    renderGraph();
  }

  function endDrag(event) {
    if (!state.drag) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const clickedId = state.drag.id;
    const wasMove = state.moved;
    state.drag = null;
    if (!wasMove) cycleNode(clickedId);
    else render();
  }

  function renderGraph() {
    const activeEdges = visibleEdges();
    const bad = new Set(conflictEdges().map(({ edge }) => edgeKey(edge)));
    edgesGroup.innerHTML = "";
    nodesGroup.innerHTML = "";

    state.edges.forEach(edge => {
      const a = state.nodes[edge.u];
      const b = state.nodes[edge.v];
      const key = edgeKey(edge);
      const colored = state.colors[edge.u] != null && state.colors[edge.v] != null;
      let cls = "edge-line";
      if (activeEdges.has(key)) cls += " is-active";
      if (bad.has(key)) cls += " danger";
      else if (colored && state.step >= 3) cls += " safe";
      const line = svgEl("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: cls });
      edgesGroup.appendChild(line);

      if (state.step >= 1 && layer === "extend") {
        const label = svgEl("text", {
          x: (a.x + b.x) / 2,
          y: (a.y + b.y) / 2 - 6,
          class: "edge-label"
        });
        label.textContent = "×";
        edgesGroup.appendChild(label);
      }
    });

    state.nodes.forEach((node, id) => {
      const color = state.colors[id];
      const selected = state.selected === id;
      const g = svgEl("g", {
        class: "node-group" + (selected ? " is-selected" : ""),
        transform: "translate(" + node.x + " " + node.y + ")",
        tabindex: "0",
        role: "button",
        "aria-label": node.label
      });
      const circle = svgEl("circle", {
        r: selected ? 26 : 23,
        class: "node-circle",
        fill: color == null || state.step < 2 ? "#fffaf2" : palette[color % palette.length]
      });
      const icon = svgEl("text", {
        class: "node-icon",
        fill: color == null || state.step < 2 ? "#d63b1d" : "#fff",
        y: -1
      });
      icon.textContent = node.icon;
      const label = svgEl("text", { class: "node-label", y: 42 });
      label.textContent = node.label;
      const phase = svgEl("text", { class: "node-phase", y: 58 });
      phase.textContent = color == null || state.step < 2 ? "未排相" : phaseNames[color % phaseNames.length];

      g.appendChild(circle);
      g.appendChild(icon);
      g.appendChild(label);
      g.appendChild(phase);
      g.addEventListener("pointerdown", event => startDrag(event, id));
      g.addEventListener("pointermove", onDrag);
      g.addEventListener("pointerup", endDrag);
      g.addEventListener("pointercancel", endDrag);
      g.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          cycleNode(id);
        }
      });
      nodesGroup.appendChild(g);
    });
  }

  function renderStep() {
    const steps = currentData().steps;
    const stepTrack = document.getElementById("stepTrack");
    const stepTitle = document.getElementById("stepTitle");
    stepTrack.innerHTML = steps.map((_, index) => '<span class="step-dot' + (index <= state.step ? " is-active" : "") + '"></span>').join("");
    const step = steps[state.step];
    stepTitle.innerHTML = '<b>' + esc(step.title) + '</b><br>' + esc(step.text);
    stepHint.innerHTML = '<b>' + esc(currentScenario().name) + '：</b>' + esc(step.text);
  }

  function stats() {
    const V = state.nodes.length;
    const E = state.edges.length;
    const F = Math.max(1, E - V + 2);
    const d = degrees();
    const maxDegree = Math.max(...d);
    const conflicts = conflictEdges().length;
    const used = new Set(state.colors.filter(color => color != null)).size;
    const score = Math.max(0, 100 - conflicts * 18 - Math.max(0, used - currentScenario().target) * 7);
    return { V, E, F, maxDegree, conflicts, used, score };
  }

  function formulaChip(key, label, value, hotTerms) {
    return '<div class="formula-chip' + (hotTerms.includes(key) ? " is-hot" : "") + '"><div class="formula-value">' + esc(value) + '</div><div class="formula-label">' + esc(label) + '</div></div>';
  }

  function renderFormula() {
    const s = stats();
    const hotTerms = currentData().steps[state.step].terms;
    const target = currentScenario().target;
    const terms = layer === "basic"
      ? [
        ["V", "车流 V", s.V],
        ["E", "冲突边 E", s.E],
        ["F", "区域 F=E−V+2", s.F],
        ["chi", "目标相位 χ", target],
        ["bad", "同相冲突", s.conflicts]
      ]
      : [
        ["V", "车流 V", s.V],
        ["E", "冲突边 E", s.E],
        ["Delta", "最大度 Δ", s.maxDegree],
        ["budget", "相位上限", state.phaseBudget],
        ["used", "已用相位", s.used || 0],
        ["bad", "同相冲突", s.conflicts],
        ["score", "通行评分", s.score]
      ];
    formulaText.innerHTML = '<div class="formula-grid">' + terms.map(term => formulaChip(term[0], term[1], term[2], hotTerms)).join("") + '</div>';
  }

  function renderResult() {
    const s = stats();
    const scenario = currentScenario();
    const complete = state.colors.every(color => color != null);
    const ok = complete && s.conflicts === 0 && s.used <= state.phaseBudget;
    const near = complete && s.conflicts <= 1;
    const label = ok ? "无冲突" : near ? "接近完成" : "需调整";
    resultValue.innerHTML = '<span class="truth-chip' + (ok ? "" : " false") + '">' + esc(label) + '</span>'
      + '<div>' + esc(scenario.name) + '：' + esc(s.used || 0) + '/' + esc(state.phaseBudget) + ' 相位，冲突 ' + esc(s.conflicts) + ' 条。</div>';

    const selected = state.selected == null ? "" : "当前选中：" + state.nodes[state.selected].label + "，相位 " + (state.colors[state.selected] == null ? "未定" : phaseNames[state.colors[state.selected]]) + "。";
    const feedback = ok
      ? "所有冲突边两端相位不同，方案通过检查。"
      : s.conflicts > 0
        ? "红色边两端仍被安排在同一相位，需要重新分配其中一端。"
        : "还有车流未分配相位，完成后可继续复核。";
    resultExtra.innerHTML = '<b>当前反馈：</b>' + esc(feedback) + (selected ? '<p>' + esc(selected) + '</p>' : "");
  }

  function renderHeader() {
    const scenario = currentScenario();
    boardTitle.textContent = cfg.title || "交通冲突图着色";
    boardSubtitle.textContent = scenario.subtitle;
  }

  function render() {
    renderHeader();
    renderStep();
    renderGraph();
    renderFormula();
    renderResult();
  }

  function init() {
    svg.setAttribute("viewBox", "0 0 " + viewBox.w + " " + viewBox.h);
    cloneScenario(currentScenario());
    buildControls();
    render();
  }

  init();
})();
