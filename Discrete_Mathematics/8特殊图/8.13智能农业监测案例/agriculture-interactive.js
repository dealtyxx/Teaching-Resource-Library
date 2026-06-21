(function () {
  "use strict";

  const pageText = document.title + " " + (document.querySelector(".sidebar-header") || { innerText: "" }).innerText;
  const isExtend = /拓展层|覆盖优化|物联网部署/.test(pageText);
  const controls = document.getElementById("controls");
  const vizArea = document.getElementById("vizArea");
  const formulaText = document.getElementById("formulaText");
  const resultValue = document.getElementById("resultValue");
  const resultExtra = document.getElementById("resultExtra");
  if (!controls || !vizArea || !formulaText || !resultValue || !resultExtra) return;

  if (window.SECTION_META) {
    window.SECTION_META.ideology = { title: "", text: "", dims: [], quote: "" };
  }

  const SVG_NS = "http://www.w3.org/2000/svg";
  let layoutScheduled = false;
  let scanTimer = null;

  const state = {
    nodes: [],
    edges: [],
    scanned: new Set(),
    activeNode: null,
    activeEdge: null,
    stations: new Set(),
    sleepers: new Set(),
    alerts: new Set(),
    order: [],
    step: 0,
    mode: isExtend ? "extend" : "basic",
    message: ""
  };

  const BASIC_NODES = [
    { id: "center", name: "监测中心", type: "root", x: 50, y: 14 },
    { id: "fieldA", name: "稻田 A 区", type: "region", x: 25, y: 39 },
    { id: "fieldB", name: "果园 B 区", type: "region", x: 75, y: 39 },
    { id: "s1", name: "土壤湿度", type: "sensor", x: 14, y: 70, value: "低", alert: true },
    { id: "s2", name: "水温", type: "sensor", x: 27, y: 76, value: "正常" },
    { id: "s3", name: "PH", type: "sensor", x: 40, y: 70, value: "正常" },
    { id: "s4", name: "光照", type: "sensor", x: 61, y: 70, value: "正常" },
    { id: "s5", name: "虫情", type: "sensor", x: 75, y: 77, value: "正常" },
    { id: "s6", name: "空气湿度", type: "sensor", x: 88, y: 70, value: "偏高", alert: true }
  ];
  const BASIC_EDGES = [
    ["center", "fieldA", 3], ["center", "fieldB", 4],
    ["fieldA", "s1", 2], ["fieldA", "s2", 2], ["fieldA", "s3", 3],
    ["fieldB", "s4", 2], ["fieldB", "s5", 2], ["fieldB", "s6", 3]
  ];

  const EXTEND_NODES = [
    { id: "center", name: "云端平台", type: "root", x: 50, y: 11 },
    { id: "r1", name: "稻田区", type: "region", x: 18, y: 32 },
    { id: "r2", name: "果园区", type: "region", x: 39, y: 32 },
    { id: "r3", name: "大棚区", type: "region", x: 61, y: 32 },
    { id: "r4", name: "灌溉区", type: "region", x: 82, y: 32 },
    { id: "s1", name: "湿度 1", type: "sensor", x: 10, y: 61, value: "31%", alert: true },
    { id: "s2", name: "水温", type: "sensor", x: 20, y: 72, value: "24C" },
    { id: "s3", name: "PH", type: "sensor", x: 30, y: 61, value: "6.5" },
    { id: "s4", name: "光照", type: "sensor", x: 41, y: 73, value: "45k" },
    { id: "s5", name: "虫情", type: "sensor", x: 51, y: 61, value: "无" },
    { id: "s6", name: "CO2", type: "sensor", x: 62, y: 73, value: "820" },
    { id: "s7", name: "室温", type: "sensor", x: 72, y: 61, value: "29C", alert: true },
    { id: "s8", name: "滴灌", type: "sensor", x: 84, y: 73, value: "开" },
    { id: "s9", name: "风速", type: "sensor", x: 92, y: 61, value: "2m/s" }
  ];
  const EXTEND_EDGES = [
    ["center", "r1", 4], ["center", "r2", 3], ["center", "r3", 4], ["center", "r4", 5],
    ["r1", "s1", 2], ["r1", "s2", 2], ["r1", "s3", 3],
    ["r2", "s3", 2], ["r2", "s4", 2], ["r2", "s5", 3],
    ["r3", "s5", 2], ["r3", "s6", 2], ["r3", "s7", 4],
    ["r4", "s7", 3], ["r4", "s8", 2], ["r4", "s9", 3],
    ["s2", "s4", 4], ["s4", "s6", 3], ["s6", "s8", 3], ["s1", "s3", 2]
  ];

  function init() {
    injectStyle();
    setupStage();
    setupControls();
    resetScenario();
    applyPageLayout();
    window.setTimeout(() => { applyPageLayout(); render(); updateResult(); }, 0);
    window.setTimeout(() => { applyPageLayout(); render(); updateResult(); }, 160);
    window.setTimeout(() => { applyPageLayout(); render(); updateResult(); }, 520);
    window.addEventListener("resize", () => { applyPageLayout(); render(); });
    const app = document.querySelector(".app-container");
    if (app) new MutationObserver(schedulePageLayout).observe(app, { attributes: true, attributeFilter: ["style", "class"] });
    window.__agricultureInteractive = { state, scanStep, autoScan, optimizeDeployment, resetScenario };
  }

  function setupStage() {
    vizArea.classList.add("agri-board");
    vizArea.innerHTML = `
      <div class="agri-stage">
        <div class="farm-bg"></div>
        <div class="agri-graph-title">
          <h2>${isExtend ? "农田覆盖与省能部署" : "农业物联网监测拓扑"}</h2>
          <p>${isExtend ? "coverage + MST + sleep scheduling" : "rooted tree scanning"}</p>
        </div>
        <div class="agri-legend">
          <span><i class="root"></i>中心</span>
          <span><i class="region"></i>区域</span>
          <span><i class="sensor"></i>传感器</span>
          <span><i class="station"></i>监测点</span>
        </div>
        <svg id="agriSvg" viewBox="0 0 1000 360" preserveAspectRatio="xMidYMid meet" aria-label="农业监测网络拓扑">
          <g id="agriEdges"></g>
          <g id="agriCoverage"></g>
          <g id="agriNodes"></g>
        </svg>
      </div>
    `;
    document.getElementById("agriSvg").addEventListener("click", onSvgClick);
  }

  function setupControls() {
    controls.classList.add("agri-controls");
    if (isExtend) {
      controls.innerHTML = `
        <div class="agri-card agri-ui">
          <label for="agriStrategy"><span>部署目标</span><small>拓展建模</small></label>
          <select id="agriStrategy">
            <option value="coverage">覆盖优先</option>
            <option value="energy">省能骨干</option>
            <option value="risk">异常优先</option>
          </select>
        </div>
        <div class="agri-card agri-ui">
          <label for="agriRadius"><span>覆盖半径</span><small id="agriRadiusText">2 格</small></label>
          <input id="agriRadius" type="range" min="1" max="3" step="1" value="2">
          <label for="agriBudget"><span>活跃监测点上限</span><small id="agriBudgetText">4 个</small></label>
          <input id="agriBudget" type="range" min="2" max="6" step="1" value="4">
          <div class="agri-switch"><span>启用分簇休眠</span><input id="agriSleep" type="checkbox" checked></div>
        </div>
        <div class="agri-card agri-ui">
          <div class="agri-actions">
            <button id="agriStep" type="button">巡检一步</button>
            <button id="agriAuto" type="button" class="primary">自动巡检</button>
            <button id="agriOptimize" type="button">优化部署</button>
            <button id="agriReset" type="button">重置</button>
          </div>
        </div>
        <div class="agri-card agri-tip"><b>拓展任务：</b>在覆盖率、通信能耗和休眠调度之间权衡，观察物联网部署方案如何变化。</div>
      `;
    } else {
      controls.innerHTML = `
        <div class="agri-card agri-tip agri-ui"><b>基础任务：</b>从监测中心开始，沿树形拓扑巡检区域与传感器；点击节点可立即读取数据。</div>
        <div class="agri-card agri-ui">
          <label for="agriScanMode"><span>巡检方式</span><small>低门槛</small></label>
          <select id="agriScanMode">
            <option value="bfs">BFS 全局巡检</option>
            <option value="dfs">DFS 深入诊断</option>
          </select>
        </div>
        <div class="agri-card agri-ui">
          <div class="agri-actions">
            <button id="agriStep" type="button">巡检一步</button>
            <button id="agriAuto" type="button" class="primary">自动巡检</button>
            <button id="agriReset" type="button">重置</button>
            <button id="agriOptimize" type="button">标出异常</button>
          </div>
        </div>
      `;
    }

    controls.addEventListener("input", interceptOldRenderer, true);
    controls.addEventListener("change", interceptOldRenderer, true);
    document.getElementById("agriStep").addEventListener("click", scanStep);
    document.getElementById("agriAuto").addEventListener("click", autoScan);
    document.getElementById("agriReset").addEventListener("click", resetScenario);
    document.getElementById("agriOptimize").addEventListener("click", optimizeDeployment);
    ["agriRadius", "agriBudget"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", () => { updateLabels(); render(); updateResult(); });
    });
    const sleep = document.getElementById("agriSleep");
    if (sleep) sleep.addEventListener("change", () => { updateSleepers(); render(); updateResult(); });
  }

  function interceptOldRenderer(event) {
    if (event.target && event.target.closest(".agri-ui")) {
      event.stopImmediatePropagation();
      if (event.type === "input" || event.type === "change") {
        updateLabels();
        updateSleepers();
        render();
        updateResult();
      }
    }
  }

  function resetScenario() {
    stopTimer();
    const nodes = isExtend ? EXTEND_NODES : BASIC_NODES;
    const edges = isExtend ? EXTEND_EDGES : BASIC_EDGES;
    state.nodes = nodes.map(n => Object.assign({}, n));
    state.edges = edges.map(e => ({ a: e[0], b: e[1], w: e[2] || 1 }));
    state.scanned = new Set();
    state.alerts = new Set();
    state.activeNode = null;
    state.activeEdge = null;
    state.stations = new Set(isExtend ? ["s1", "s4", "s7"] : []);
    state.sleepers = new Set();
    state.order = traversalOrder();
    state.step = 0;
    state.message = isExtend ? "点击传感器可切换监测点，或用“优化部署”自动选择覆盖方案。" : "准备从监测中心开始巡检。";
    updateLabels();
    updateSleepers();
    render();
    updateResult();
  }

  function traversalOrder() {
    const mode = document.getElementById("agriScanMode") ? document.getElementById("agriScanMode").value : "bfs";
    const adj = adjacency();
    if (mode === "dfs") {
      const order = [];
      const seen = new Set();
      function dfs(id) {
        seen.add(id);
        order.push(id);
        (adj.get(id) || []).forEach(next => { if (!seen.has(next)) dfs(next); });
      }
      dfs("center");
      return order;
    }
    const order = [];
    const seen = new Set(["center"]);
    const queue = ["center"];
    while (queue.length) {
      const id = queue.shift();
      order.push(id);
      (adj.get(id) || []).forEach(next => {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      });
    }
    return order;
  }

  function adjacency() {
    const map = new Map(state.nodes.map(n => [n.id, []]));
    state.edges.forEach(edge => {
      map.get(edge.a).push(edge.b);
      map.get(edge.b).push(edge.a);
    });
    map.forEach(list => list.sort((a, b) => nodeIndex(a) - nodeIndex(b)));
    return map;
  }

  function nodeIndex(id) {
    return state.nodes.findIndex(node => node.id === id);
  }

  function scanStep(fromTimer) {
    if (fromTimer !== true) stopTimer();
    if (state.step >= state.order.length) {
      state.activeNode = null;
      state.activeEdge = null;
      state.message = "巡检完成，所有可达节点已读取。";
      render();
      updateResult();
      return false;
    }
    const id = state.order[state.step];
    const prev = state.step > 0 ? state.order[state.step - 1] : null;
    state.activeNode = id;
    state.activeEdge = prev ? edgeKey(prev, id) : null;
    state.scanned.add(id);
    const node = findNode(id);
    if (node && node.alert) state.alerts.add(id);
    state.step += 1;
    state.message = node ? "读取 " + node.name + "：" + (node.value || "在线") + "。" : "继续巡检。";
    render();
    updateResult();
    return true;
  }

  function autoScan() {
    stopTimer();
    if (!scanStep(true)) return;
    scanTimer = window.setInterval(() => {
      if (!scanStep(true)) stopTimer();
    }, isExtend ? 520 : 620);
  }

  function optimizeDeployment() {
    stopTimer();
    if (!isExtend) {
      state.alerts = new Set(state.nodes.filter(n => n.alert).map(n => n.id));
      state.scanned = new Set(state.nodes.filter(n => n.type !== "root").map(n => n.id));
      state.message = "已标出异常传感器，便于优先诊断。";
      render();
      updateResult();
      return;
    }
    const strategy = document.getElementById("agriStrategy").value;
    const budget = Number(document.getElementById("agriBudget").value);
    const sensors = state.nodes.filter(n => n.type === "sensor");
    const chosen = [];
    const covered = new Set();
    while (chosen.length < budget && covered.size < sensors.length) {
      let best = null;
      let bestScore = -Infinity;
      sensors.forEach(sensor => {
        if (chosen.includes(sensor.id)) return;
        const cover = coverageOf(sensor.id);
        const newCover = cover.filter(id => !covered.has(id)).length;
        const risk = findNode(sensor.id).alert ? 3 : 0;
        const energy = strategy === "energy" ? -distanceToCenter(sensor.id) / 120 : 0;
        const score = newCover * 10 + (strategy === "risk" ? risk * 8 : 0) + energy;
        if (score > bestScore) {
          bestScore = score;
          best = sensor.id;
        }
      });
      if (!best) break;
      chosen.push(best);
      coverageOf(best).forEach(id => covered.add(id));
    }
    state.stations = new Set(chosen);
    state.scanned = new Set(["center"].concat(chosen));
    state.alerts = new Set(chosen.filter(id => findNode(id).alert));
    state.message = "已按当前目标自动选择 " + chosen.length + " 个活跃监测点。";
    updateSleepers();
    render();
    updateResult();
  }

  function stopTimer() {
    if (scanTimer) {
      window.clearInterval(scanTimer);
      scanTimer = null;
    }
  }

  function onSvgClick(event) {
    const group = event.target.closest("[data-node-id]");
    if (!group) return;
    const id = group.getAttribute("data-node-id");
    const node = findNode(id);
    if (!node) return;
    stopTimer();
    state.activeNode = id;
    state.scanned.add(id);
    if (node.alert) state.alerts.add(id);
    if (isExtend && node.type === "sensor") {
      if (state.stations.has(id)) state.stations.delete(id);
      else state.stations.add(id);
      updateSleepers();
      state.message = (state.stations.has(id) ? "启用 " : "关闭 ") + node.name + " 作为监测点。";
    } else {
      state.message = "手动读取 " + node.name + "：" + (node.value || "在线") + "。";
    }
    render();
    updateResult();
  }

  function findNode(id) {
    return state.nodes.find(node => node.id === id);
  }

  function updateLabels() {
    const radius = document.getElementById("agriRadiusText");
    const budget = document.getElementById("agriBudgetText");
    if (radius) radius.textContent = document.getElementById("agriRadius").value + " 格";
    if (budget) budget.textContent = document.getElementById("agriBudget").value + " 个";
    state.order = traversalOrder();
  }

  function updateSleepers() {
    state.sleepers = new Set();
    if (!isExtend) return;
    const sleep = document.getElementById("agriSleep");
    if (!sleep || !sleep.checked) return;
    state.nodes.forEach(node => {
      if (node.type === "sensor" && !state.stations.has(node.id) && coverageMetrics().covered.has(node.id)) {
        state.sleepers.add(node.id);
      }
    });
  }

  function coverageOf(id) {
    const node = findNode(id);
    const radius = Number(document.getElementById("agriRadius") ? document.getElementById("agriRadius").value : 1);
    if (!node) return [];
    return state.nodes
      .filter(candidate => candidate.type === "sensor" && distance(node, candidate) <= radius * 115)
      .map(candidate => candidate.id);
  }

  function coverageMetrics() {
    const covered = new Set();
    if (isExtend) {
      state.stations.forEach(id => coverageOf(id).forEach(next => covered.add(next)));
    } else {
      state.nodes.filter(n => n.type === "sensor" && state.scanned.has(n.id)).forEach(n => covered.add(n.id));
    }
    const sensors = state.nodes.filter(n => n.type === "sensor");
    const cost = isExtend ? mstCost() : scannedTreeCost();
    return { covered, sensors, cost };
  }

  function scannedTreeCost() {
    return state.edges.reduce((sum, edge) => {
      return sum + (state.scanned.has(edge.a) && state.scanned.has(edge.b) ? edge.w : 0);
    }, 0);
  }

  function mstCost() {
    const stationNodes = ["center"].concat(Array.from(state.stations));
    if (stationNodes.length <= 1) return 0;
    const edges = [];
    for (let i = 0; i < stationNodes.length; i++) {
      for (let j = i + 1; j < stationNodes.length; j++) {
        edges.push({ a: stationNodes[i], b: stationNodes[j], w: Math.max(1, Math.round(distance(findNode(stationNodes[i]), findNode(stationNodes[j])) / 58)) });
      }
    }
    const parent = new Map(stationNodes.map(id => [id, id]));
    function find(x) {
      while (parent.get(x) !== x) {
        parent.set(x, parent.get(parent.get(x)));
        x = parent.get(x);
      }
      return x;
    }
    let cost = 0;
    edges.sort((a, b) => a.w - b.w).forEach(edge => {
      const x = find(edge.a);
      const y = find(edge.b);
      if (x !== y) {
        parent.set(x, y);
        cost += edge.w;
      }
    });
    return cost;
  }

  function distanceToCenter(id) {
    return distance(findNode("center"), findNode(id));
  }

  function distance(a, b) {
    if (!a || !b) return Infinity;
    const ax = a.x * 10, ay = a.y * 4.3;
    const bx = b.x * 10, by = b.y * 4.3;
    return Math.hypot(ax - bx, ay - by);
  }

  function render() {
    const svg = document.getElementById("agriSvg");
    if (!svg) return;
    const edgesGroup = document.getElementById("agriEdges");
    const coverageGroup = document.getElementById("agriCoverage");
    const nodesGroup = document.getElementById("agriNodes");
    edgesGroup.innerHTML = "";
    coverageGroup.innerHTML = "";
    nodesGroup.innerHTML = "";
    renderCoverage(coverageGroup);
    renderEdges(edgesGroup);
    renderNodes(nodesGroup);
  }

  function renderCoverage(group) {
    if (!isExtend) return;
    const radius = Number(document.getElementById("agriRadius") ? document.getElementById("agriRadius").value : 1);
    state.stations.forEach(id => {
      const node = findNode(id);
      if (!node) return;
      group.appendChild(svgEl("circle", {
        cx: x(node), cy: y(node), r: radius * 70,
        class: "agri-cover-ring"
      }));
    });
  }

  function renderEdges(group) {
    state.edges.forEach(edge => {
      const a = findNode(edge.a);
      const b = findNode(edge.b);
      const active = state.activeEdge === edgeKey(edge.a, edge.b);
      const connected = state.scanned.has(edge.a) && state.scanned.has(edge.b);
      group.appendChild(svgEl("line", {
        x1: x(a), y1: y(a), x2: x(b), y2: y(b),
        class: "agri-edge" + (active ? " active" : connected ? " visited" : "")
      }));
      if (isExtend) {
        const label = svgEl("text", {
          x: (x(a) + x(b)) / 2 + 4,
          y: (y(a) + y(b)) / 2 - 4,
          class: "agri-weight"
        });
        label.textContent = edge.w;
        group.appendChild(label);
      }
    });
  }

  function renderNodes(group) {
    const metrics = coverageMetrics();
    state.nodes.forEach(node => {
      const g = svgEl("g", {
        class: "agri-node " + node.type + (state.scanned.has(node.id) ? " scanned" : "") + (state.activeNode === node.id ? " active" : "") + (state.alerts.has(node.id) ? " alert" : "") + (state.stations.has(node.id) ? " station" : "") + (state.sleepers.has(node.id) ? " sleeper" : "") + (metrics.covered.has(node.id) ? " covered" : ""),
        transform: "translate(" + x(node) + "," + y(node) + ")",
        "data-node-id": node.id
      });
      g.appendChild(svgEl("circle", { r: radius(node), class: "agri-node-circle" }));
      const icon = svgEl("text", { class: "agri-node-icon", "text-anchor": "middle", dy: ".35em" });
      icon.textContent = iconFor(node);
      g.appendChild(icon);
      const label = svgEl("text", { class: "agri-node-label", "text-anchor": "middle", y: radius(node) + 22 });
      label.textContent = node.name;
      g.appendChild(label);
      if (node.type === "sensor") {
        const value = svgEl("text", { class: "agri-node-value", "text-anchor": "middle", y: -radius(node) - 13 });
        value.textContent = node.value || "";
        g.appendChild(value);
      }
      group.appendChild(g);
    });
  }

  function x(node) { return 500 + (node.x - 50) * (isExtend ? 10.35 : 10.55); }
  function y(node) { return 32 + node.y * 3; }
  function radius(node) {
    if (node.type === "root") return isExtend ? 25 : 28;
    if (node.type === "region") return isExtend ? 21 : 24;
    return isExtend ? 17 : 20;
  }
  function iconFor(node) {
    if (state.sleepers.has(node.id)) return "Z";
    if (state.stations.has(node.id)) return "M";
    if (node.type === "root") return "C";
    if (node.type === "region") return "R";
    return "S";
  }

  function updateResult() {
    const metrics = coverageMetrics();
    const scannedCount = state.scanned.size;
    const total = state.nodes.length;
    const coveredCount = metrics.covered.size;
    const sensorsCount = metrics.sensors.length;
    const complete = isExtend ? coveredCount === sensorsCount : scannedCount === total;
    formulaText.textContent = isExtend
      ? "目标：用较少活跃节点覆盖传感器，并控制通信能耗"
      : "目标：从中心沿树形拓扑完成一次巡检";
    resultValue.innerHTML = `<span class="truth-chip${complete ? "" : " false"}">${complete ? "覆盖完成" : "推进中"}</span>`;
    resultExtra.textContent = isExtend
      ? `覆盖 ${coveredCount}/${sensorsCount}，活跃监测点 ${state.stations.size}，估计骨干成本 ${metrics.cost}，休眠 ${state.sleepers.size} 个。`
      : `已巡检 ${scannedCount}/${total}，异常 ${state.alerts.size} 个，当前提示：${state.message}`;
  }

  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(key => el.setAttribute(key, attrs[key]));
    return el;
  }

  function edgeKey(a, b) {
    return a < b ? a + "-" + b : b + "-" + a;
  }

  function injectStyle() {
    if (document.getElementById("agri-interactive-style")) return;
    const style = document.createElement("style");
    style.id = "agri-interactive-style";
    style.textContent = `
      .agri-controls { gap: 12px; }
      #dm-page-layers {
        margin-bottom: 10px !important;
      }
      #dm-page-layers .dm-tier {
        padding: 12px 14px !important;
        min-height: 0 !important;
      }
      #dm-page-layers .dm-tier-head {
        margin-bottom: 6px !important;
      }
      #dm-page-layers .dm-tier-name {
        font-size: 17px !important;
        line-height: 1.2 !important;
      }
      #dm-page-layers .dm-tier-concepts,
      #dm-page-layers .dm-tier-sub,
      #dm-page-layers .dm-tier-task {
        line-height: 1.35 !important;
        margin-top: 2px !important;
      }
      #dm-page-layers .dm-tier-btn {
        min-height: 34px !important;
        padding: 8px 12px !important;
        margin-top: 8px !important;
      }
      .agri-card {
        border: 1px solid rgba(116, 55, 31, 0.16);
        border-radius: 8px;
        background: rgba(255,255,255,.68);
        padding: 12px;
        display: grid;
        gap: 9px;
      }
      .agri-card label {
        display: flex;
        justify-content: space-between;
        color: #4e362d;
        font-weight: 900;
      }
      .agri-card label small { color: #8b6b5d; }
      .agri-card select {
        border: 1px solid rgba(116,55,31,.2);
        border-radius: 8px;
        padding: 9px 10px;
        background: rgba(255,253,246,.96);
        color: #321f18;
        font: 800 14px "Noto Serif SC", serif;
      }
      .agri-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .agri-actions button {
        min-height: 40px;
        border: 1px solid rgba(47,125,87,.25);
        border-radius: 8px;
        background: rgba(255,250,242,.96);
        color: #276146;
        font: 900 14px "Noto Serif SC", serif;
        cursor: pointer;
      }
      .agri-actions button.primary {
        background: #2f7d57;
        color: #fff;
      }
      .agri-switch {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #4e362d;
        font-weight: 900;
      }
      .agri-switch input { width: 18px; height: 18px; accent-color: #2f7d57; }
      .agri-tip {
        color: #5e4338;
        line-height: 1.65;
      }
      .agri-tip b { color: #b42318; }
      #vizArea.agri-board {
        display: block !important;
        grid-template-rows: none !important;
        gap: 0 !important;
        min-height: 0;
        overflow: hidden;
      }
      .agri-stage {
        position: relative;
        height: 100%;
        min-height: 0;
        border: 1px solid rgba(116,55,31,.15);
        border-radius: 8px;
        overflow: hidden;
        background:
          linear-gradient(rgba(116,55,31,.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(116,55,31,.045) 1px, transparent 1px),
          rgba(255,253,246,.86);
        background-size: 34px 34px;
      }
      .farm-bg {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(90deg, rgba(47,125,87,.08) 1px, transparent 1px),
          linear-gradient(rgba(197,138,31,.08) 1px, transparent 1px);
        background-size: 72px 54px;
        opacity: .45;
      }
      .agri-graph-title,
      .agri-legend {
        position: absolute;
        z-index: 2;
        border: 1px solid rgba(116,55,31,.16);
        border-radius: 8px;
        background: rgba(255,253,246,.92);
        box-shadow: 0 10px 26px rgba(69,31,15,.1);
      }
      .agri-graph-title {
        left: 16px;
        top: 14px;
        padding: 10px 14px;
      }
      .agri-graph-title h2 {
        margin: 0;
        color: #b42318;
        font: 400 24px "Ma Shan Zheng", "Noto Serif SC", serif;
      }
      .agri-graph-title p {
        margin: 3px 0 0;
        color: #7c6257;
        font-size: 12px;
      }
      .agri-legend {
        right: 16px;
        top: 14px;
        padding: 9px 12px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        max-width: 360px;
      }
      .agri-legend span {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        color: #5e4338;
        font-size: 12px;
        font-weight: 800;
      }
      .agri-legend i {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        display: inline-block;
      }
      .agri-legend .root { background: #1f5138; }
      .agri-legend .region { background: #2f7d57; }
      .agri-legend .sensor { background: #c58a1f; }
      .agri-legend .station { background: #b42318; }
      #agriSvg {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        display: block;
      }
      .agri-edge {
        stroke: rgba(47,95,159,.28);
        stroke-width: 2;
        transition: stroke .2s ease, stroke-width .2s ease;
      }
      .agri-edge.visited {
        stroke: #2f7d57;
        stroke-width: 3;
      }
      .agri-edge.active {
        stroke: #c58a1f;
        stroke-width: 4;
        stroke-dasharray: 8 5;
      }
      .agri-weight {
        fill: #7c6257;
        font: 900 12px "JetBrains Mono", Consolas, monospace;
      }
      .agri-cover-ring {
        fill: rgba(47,125,87,.09);
        stroke: rgba(47,125,87,.3);
        stroke-width: 2;
      }
      .agri-node { cursor: pointer; }
      .agri-node-circle {
        fill: #fff;
        stroke: #2f7d57;
        stroke-width: 3;
        filter: drop-shadow(0 4px 8px rgba(69,31,15,.16));
      }
      .agri-node.root .agri-node-circle { fill: #1f5138; stroke: #1f5138; }
      .agri-node.region .agri-node-circle { fill: #2f7d57; stroke: #2f7d57; }
      .agri-node.sensor .agri-node-circle { fill: #fff9e8; stroke: #c58a1f; }
      .agri-node.scanned .agri-node-circle { stroke: #2f7d57; stroke-width: 4; }
      .agri-node.active .agri-node-circle { stroke: #b42318; stroke-width: 5; }
      .agri-node.alert .agri-node-circle { fill: #fff0ed; stroke: #b42318; }
      .agri-node.station .agri-node-circle { fill: #b42318; stroke: #b42318; }
      .agri-node.sleeper { opacity: .55; }
      .agri-node-icon {
        fill: #fff;
        font: 900 13px "JetBrains Mono", Consolas, monospace;
        pointer-events: none;
      }
      .agri-node.sensor .agri-node-icon { fill: #8a5d0b; }
      .agri-node.station .agri-node-icon { fill: #fff; }
      .agri-node-label {
        fill: #3b2a24;
        font: 800 13px "Noto Serif SC", serif;
        pointer-events: none;
      }
      .agri-node-value {
        fill: #b42318;
        font: 900 11px "JetBrains Mono", Consolas, monospace;
        pointer-events: none;
      }
      #resultExtra:empty { display: none; }
      .result-card {
        align-items: center;
      }
      @media (max-width: 920px) {
        .agri-stage { min-height: 360px; }
        .agri-legend { left: 16px; right: auto; top: 80px; }
      }
    `;
    document.head.appendChild(style);
  }

  function setImportant(el, name, value) {
    if (!el) return;
    if (el.style.getPropertyValue(name) === value && el.style.getPropertyPriority(name) === "important") return;
    el.style.setProperty(name, value, "important");
  }

  function applyPageLayout() {
    layoutScheduled = false;
    const app = document.querySelector(".app-container");
    const side = document.querySelector(".side-panel");
    const main = document.querySelector(".app-container > main.glass-pane");
    const result = document.querySelector(".result-card");
    if (!app || !side || !main) return;
    const compact = window.innerWidth <= 920;
    setImportant(document.body, "display", "block");
    setImportant(document.body, "overflow-x", "hidden");
    setImportant(document.body, "overflow-y", compact ? "auto" : "hidden");
    setImportant(document.body, "padding-bottom", "0");
    setImportant(app, "display", "grid");
    setImportant(app, "width", compact ? "calc(100vw - 24px)" : "min(1440px, calc(100vw - 32px))");
    setImportant(app, "height", compact ? "auto" : "calc(100vh - 124px)");
    setImportant(app, "min-height", compact ? "0" : "640px");
    setImportant(app, "margin", compact ? "54px auto 84px" : "32px auto 0");
    setImportant(app, "padding", "0");
    setImportant(app, "gap", "18px");
    setImportant(app, "grid-template", compact ? "\"side\" auto \"main\" auto / minmax(0, 1fr)" : "\"side main\" minmax(0, 1fr) / minmax(300px, 360px) minmax(0, 1fr)");
    setImportant(app, "background", "transparent");
    setImportant(app, "border", "0");
    setImportant(app, "border-radius", "0");
    setImportant(app, "box-shadow", "none");
    [side, main].forEach(panel => {
      setImportant(panel, "min-height", "0");
      setImportant(panel, "max-height", compact ? "none" : "100%");
      setImportant(panel, "border-radius", "8px");
      setImportant(panel, "border", "1px solid rgba(116,55,31,.18)");
      setImportant(panel, "background", "rgba(255,253,246,.92)");
      setImportant(panel, "box-shadow", "0 18px 50px rgba(69,31,15,.14)");
    });
    setImportant(side, "grid-area", "side");
    setImportant(main, "grid-area", "main");
    setImportant(main, "display", "grid");
    setImportant(main, "grid-template-rows", compact ? "auto auto minmax(380px, 1fr) auto" : "auto auto minmax(330px, 1fr) auto");
    setImportant(main, "gap", "10px");
    setImportant(main, "overflow", "auto");
    setImportant(vizArea, "min-height", compact ? "380px" : "330px");
    setImportant(vizArea, "height", "auto");
    if (result) {
      setImportant(result, "display", "grid");
      setImportant(result, "grid-template-columns", compact ? "1fr" : "minmax(0, 1fr) auto");
      setImportant(result, "gap", "8px");
      setImportant(result, "padding", "8px 14px");
      setImportant(result, "min-height", "0");
    }
  }

  function schedulePageLayout() {
    if (layoutScheduled) return;
    layoutScheduled = true;
    window.requestAnimationFrame(() => { applyPageLayout(); render(); });
  }

  init();
})();
