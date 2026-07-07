(function () {
  "use strict";

  const controls = document.getElementById("controls");
  const canvas = document.getElementById("graphCanvas");
  const vizText = document.getElementById("vizText");
  const formulaText = document.getElementById("formulaText");
  const resultValue = document.getElementById("resultValue");
  const resultExtra = document.getElementById("resultExtra");
  if (!controls || !canvas || !vizText || !formulaText || !resultValue || !resultExtra) return;

  if (window.SECTION_META && window.SECTION_META.ideology) {
    window.SECTION_META.ideology = { title: "", text: "", dims: [], quote: "" };
  }

  const profile = typeof PROFILE !== "undefined" ? PROFILE : { params: { mode: "city" } };
  const isExtend = profile.params && profile.params.mode === "coordination";
  const ctx = canvas.getContext("2d");

  const basicNodes = [
    { id: 0, name: "城市大脑", sub: "Brain", type: "hub", x: 0.50, y: 0.28 },
    { id: 1, name: "交通枢纽", sub: "Traffic", type: "traffic", x: 0.25, y: 0.46 },
    { id: 2, name: "能源站", sub: "Energy", type: "energy", x: 0.42, y: 0.62 },
    { id: 3, name: "政务中心", sub: "Service", type: "service", x: 0.63, y: 0.50 },
    { id: 4, name: "医院", sub: "Health", type: "emergency", x: 0.78, y: 0.34 },
    { id: 5, name: "社区网格", sub: "Community", type: "community", x: 0.74, y: 0.68 }
  ];

  const extendNodes = [
    { id: 0, name: "城市大脑", sub: "Brain", type: "hub", x: 0.50, y: 0.16 },
    { id: 1, name: "交通枢纽", sub: "Traffic", type: "traffic", x: 0.18, y: 0.32 },
    { id: 2, name: "轨道站", sub: "Metro", type: "traffic", x: 0.34, y: 0.38 },
    { id: 3, name: "能源站", sub: "Power", type: "energy", x: 0.65, y: 0.34 },
    { id: 4, name: "水务泵站", sub: "Water", type: "energy", x: 0.82, y: 0.42 },
    { id: 5, name: "政务中心", sub: "Gov", type: "service", x: 0.48, y: 0.48 },
    { id: 6, name: "网格中心", sub: "Grid", type: "service", x: 0.28, y: 0.64 },
    { id: 7, name: "医院", sub: "Hospital", type: "emergency", x: 0.68, y: 0.62 },
    { id: 8, name: "消防站", sub: "Fire", type: "emergency", x: 0.84, y: 0.72 },
    { id: 9, name: "社区", sub: "Community", type: "community", x: 0.44, y: 0.76 },
    { id: 10, name: "通信基站", sub: "Signal", type: "data", x: 0.15, y: 0.78 },
    { id: 11, name: "数据中台", sub: "Data", type: "data", x: 0.56, y: 0.84 }
  ];

  const basicEdges = [
    { u: 0, v: 1, w: 2, kind: "cross" },
    { u: 0, v: 2, w: 2, kind: "cross" },
    { u: 0, v: 3, w: 1, kind: "cross" },
    { u: 1, v: 4, w: 3, kind: "traffic" },
    { u: 2, v: 5, w: 3, kind: "energy" },
    { u: 3, v: 5, w: 2, kind: "service" },
    { u: 4, v: 5, w: 2, kind: "emergency" }
  ];

  const extendEdges = [
    { u: 0, v: 1, w: 2, kind: "cross" }, { u: 0, v: 3, w: 2, kind: "cross" },
    { u: 0, v: 5, w: 1, kind: "cross" }, { u: 0, v: 11, w: 1, kind: "data" },
    { u: 1, v: 2, w: 2, kind: "traffic" }, { u: 1, v: 6, w: 3, kind: "traffic" },
    { u: 2, v: 5, w: 2, kind: "cross" }, { u: 3, v: 4, w: 2, kind: "energy" },
    { u: 3, v: 7, w: 4, kind: "energy" }, { u: 4, v: 8, w: 3, kind: "cross" },
    { u: 5, v: 6, w: 2, kind: "service" }, { u: 5, v: 9, w: 2, kind: "service" },
    { u: 6, v: 10, w: 2, kind: "data" }, { u: 7, v: 8, w: 2, kind: "emergency" },
    { u: 7, v: 9, w: 3, kind: "emergency" }, { u: 8, v: 11, w: 3, kind: "data" },
    { u: 9, v: 10, w: 2, kind: "data" }, { u: 10, v: 11, w: 1, kind: "data" },
    { u: 2, v: 10, w: 4, kind: "cross" }, { u: 4, v: 11, w: 4, kind: "cross" }
  ];

  const colors = {
    hub: "#2f5f9f",
    traffic: "#2f7d57",
    energy: "#c58a1f",
    service: "#7c3aed",
    emergency: "#d63b1d",
    community: "#0f766e",
    data: "#2563eb",
    cross: "#6b4a38"
  };

  const state = {
    view: "overview",
    scenario: isExtend ? "overview" : "simple",
    pressure: isExtend ? 3 : 1,
    coordinated: isExtend,
    incident: isExtend ? 9 : 5,
    selected: isExtend ? 9 : 5,
    activePath: [],
    activeEdges: [],
    last: "",
    timer: null,
    step: 0
  };

  injectStyles();
  document.querySelector("main.glass-pane")?.classList.add("smart-city-stage");
  setupControls();
  canvas.addEventListener("click", handleCanvasClick);
  vizText.addEventListener("click", handlePanelClick);
  window.addEventListener("resize", render);
  render();

  function nodes() {
    return isExtend ? extendNodes : basicNodes;
  }

  function baseEdges() {
    return (isExtend ? extendEdges : basicEdges).map((edge, index) => ({ ...edge, id: "e" + index + "_" + edge.u + "_" + edge.v }));
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[ch]));
  }

  function edgeKey(edge) {
    return edge.u + "-" + edge.v;
  }

  function control(label, body, small) {
    return '<div class="control-group"><label><span>' + esc(label) + '</span>' +
      (small ? '<small>' + esc(small) + '</small>' : "") + "</label>" + body + "</div>";
  }

  function select(id, items, selected) {
    return '<select id="' + id + '">' + items.map(item =>
      '<option value="' + item[0] + '"' + (item[0] === selected ? " selected" : "") + ">" + esc(item[1]) + "</option>"
    ).join("") + "</select>";
  }

  function setupControls() {
    if (!isExtend) {
      controls.innerHTML =
        control("观察方式", select("cityView", [
          ["overview", "城市设施网络"],
          ["route", "联动路径"]
        ], state.view), "先认识节点和连线") +
        '<div class="control-group"><label><span>互动操作</span><small>基础层少步骤</small></label><div class="city-actions simple">' +
        '<button type="button" class="city-action primary" data-city-action="incident">标记事件</button>' +
        '<button type="button" class="city-action" data-city-action="route">联动一步</button>' +
        '<button type="button" class="city-action" data-city-action="reset">重置</button>' +
        '</div></div>';
    } else {
      controls.innerHTML =
        control("城市场景", select("cityView", [
          ["overview", "综合监测"],
          ["traffic", "交通拥堵"],
          ["emergency", "应急救援"],
          ["risk", "级联风险"]
        ], state.view), "多系统联动") +
        control("事件压力", '<input type="range" id="cityPressure" min="1" max="6" step="1" value="' + state.pressure + '">', "压力越高，路径代价越大") +
        control("跨层联动", '<div class="switch-row"><span>数据中台协同</span><input type="checkbox" id="cityCoordinated"' + (state.coordinated ? " checked" : "") + "></div>") +
        '<div class="control-group"><label><span>互动操作</span><small>事件调度 + 风险评估</small></label><div class="city-actions">' +
        '<button type="button" class="city-action primary" data-city-action="incident">扫描事件</button>' +
        '<button type="button" class="city-action" data-city-action="auto">自动巡检</button>' +
        '<button type="button" class="city-action warn" data-city-action="route">协同调度</button>' +
        '<button type="button" class="city-action" data-city-action="reset">重置网络</button>' +
        '</div></div>';
    }
    controls.addEventListener("input", handleControlChange, true);
    controls.addEventListener("change", handleControlChange, true);
    controls.addEventListener("click", handleActionClick, true);
  }

  function handleControlChange(event) {
    const target = event.target;
    if (!target || !["cityView", "cityPressure", "cityCoordinated"].includes(target.id)) return;
    event.stopImmediatePropagation();
    if (target.id === "cityView") state.view = target.value;
    if (target.id === "cityPressure") state.pressure = Number(target.value);
    if (target.id === "cityCoordinated") state.coordinated = target.checked;
    state.last = isExtend ? "场景参数已更新，城市网络重新评估。" : "观察方式已切换。";
    runAnalysis(false);
    render();
  }

  function handleActionClick(event) {
    const button = event.target.closest("[data-city-action]");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const action = button.dataset.cityAction;
    if (action === "incident") nextIncident();
    if (action === "route") runAnalysis(true);
    if (action === "auto") toggleAuto(button);
    if (action === "reset") resetState();
    render();
  }

  function nextIncident() {
    const ids = nodes().filter(node => node.id !== 0).map(node => node.id);
    const currentIndex = Math.max(0, ids.indexOf(state.incident));
    state.incident = ids[(currentIndex + 1) % ids.length];
    state.selected = state.incident;
    state.activePath = [];
    state.activeEdges = [];
    state.last = "已标记事件节点：" + nodeName(state.incident) + "。";
  }

  function toggleAuto(button) {
    if (state.timer) {
      stopAuto();
      return;
    }
    button.textContent = "停止巡检";
    state.timer = window.setInterval(() => {
      nextIncident();
      runAnalysis(true);
      render();
    }, 950);
    nextIncident();
    runAnalysis(true);
  }

  function stopAuto() {
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = null;
    }
    const auto = controls.querySelector('[data-city-action="auto"]');
    if (auto) auto.textContent = "自动巡检";
  }

  function resetState() {
    stopAuto();
    state.view = isExtend ? "overview" : "overview";
    state.pressure = isExtend ? 3 : 1;
    state.coordinated = isExtend;
    state.incident = isExtend ? 9 : 5;
    state.selected = state.incident;
    state.activePath = [];
    state.activeEdges = [];
    state.last = "城市网络已重置。";
    syncControls();
  }

  function syncControls() {
    const view = document.getElementById("cityView");
    const pressure = document.getElementById("cityPressure");
    const coordinated = document.getElementById("cityCoordinated");
    if (view) view.value = state.view;
    if (pressure) pressure.value = state.pressure;
    if (coordinated) coordinated.checked = state.coordinated;
  }

  function nodeName(id) {
    const node = nodes().find(item => item.id === id);
    return node ? "N" + id + " " + node.name : "N" + id;
  }

  function activeEdges() {
    const pressure = Number(state.pressure) || 1;
    const view = state.view;
    return baseEdges().map(edge => {
      let w = edge.w;
      if (isExtend && view === "traffic" && edge.kind === "traffic") w += pressure;
      if (isExtend && view === "emergency" && edge.kind !== "emergency" && edge.kind !== "cross") w += Math.ceil(pressure / 2);
      if (isExtend && view === "risk" && (edge.u === state.incident || edge.v === state.incident)) w += pressure + 1;
      if (state.coordinated && (edge.kind === "cross" || edge.kind === "data")) w = Math.max(1, w - 1);
      return { ...edge, w };
    });
  }

  function runAnalysis(showMessage) {
    const result = dijkstra(0, state.incident, activeEdges());
    state.activePath = result.path;
    state.activeEdges = result.edgeKeys;
    if (showMessage) {
      state.last = "已计算城市大脑到 " + nodeName(state.incident) + " 的联动路径。";
    }
    return result;
  }

  function dijkstra(start, target, edges) {
    const count = nodes().length;
    const dist = Array(count).fill(Infinity);
    const prev = Array(count).fill(null);
    const used = Array(count).fill(false);
    dist[start] = 0;
    for (let loop = 0; loop < count; loop += 1) {
      let u = -1;
      for (let i = 0; i < count; i += 1) {
        if (!used[i] && (u < 0 || dist[i] < dist[u])) u = i;
      }
      if (u < 0 || dist[u] === Infinity) break;
      used[u] = true;
      edges.filter(edge => edge.u === u || edge.v === u).forEach(edge => {
        const v = edge.u === u ? edge.v : edge.u;
        const alt = dist[u] + edge.w;
        if (alt < dist[v]) {
          dist[v] = alt;
          prev[v] = { u, edge };
        }
      });
    }
    const path = [];
    const edgeKeys = [];
    let cur = target;
    while (cur != null && cur >= 0 && dist[cur] < Infinity) {
      path.unshift(cur);
      const item = prev[cur];
      if (!item) break;
      edgeKeys.unshift(edgeKey(item.edge));
      cur = item.u;
    }
    return { dist, path, edgeKeys, value: dist[target] };
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(720, Math.floor(rect.width || 840));
    const height = Math.max(380, Math.floor(rect.height || 420));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: width, h: height };
  }

  function positions(w, h) {
    return nodes().map(node => ({ ...node, px: node.x * w, py: node.y * h }));
  }

  function render() {
    const result = state.activePath.length ? dijkstra(0, state.incident, activeEdges()) : runAnalysis(false);
    draw(result);
    renderPanel(result);
    renderResult(result);
  }

  function draw(result) {
    const { w, h } = resizeCanvas();
    const pos = positions(w, h);
    ctx.clearRect(0, 0, w, h);
    drawMapBackground(w, h);
    const edges = activeEdges();
    edges.forEach(edge => drawEdge(edge, pos));
    pos.forEach(node => drawNode(node));
    drawTitle(w);
  }

  function drawMapBackground(w, h) {
    ctx.save();
    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(214,59,29,.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 34) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 34) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    const bands = isExtend ? ["交通", "能源", "政务", "应急", "数据"] : ["交通", "能源", "政务", "社区"];
    bands.forEach((label, index) => {
      const bw = w / bands.length;
      ctx.fillStyle = index % 2 ? "rgba(47,95,159,.035)" : "rgba(47,125,87,.035)";
      ctx.fillRect(index * bw, 78, bw, h - 108);
      ctx.fillStyle = "#7c2d12";
      ctx.font = "700 12px 'Noto Serif SC', 'Microsoft YaHei', serif";
      ctx.textAlign = "center";
      ctx.fillText(label, index * bw + bw / 2, h - 26);
    });
    ctx.restore();
  }

  function drawEdge(edge, pos) {
    const a = pos.find(node => node.id === edge.u);
    const b = pos.find(node => node.id === edge.v);
    if (!a || !b) return;
    const hot = state.activeEdges.includes(edgeKey(edge)) || state.activeEdges.includes(edge.v + "-" + edge.u);
    const incident = edge.u === state.incident || edge.v === state.incident;
    ctx.save();
    ctx.strokeStyle = hot ? "#d63b1d" : incident && isExtend ? "#f59e0b" : colors[edge.kind] || "#6b4a38";
    ctx.globalAlpha = hot ? 0.95 : 0.52;
    ctx.lineWidth = hot ? 4.5 : edge.kind === "cross" || edge.kind === "data" ? 2.6 : 2;
    if (edge.kind === "data") ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.moveTo(a.px, a.py);
    ctx.lineTo(b.px, b.py);
    ctx.stroke();
    ctx.setLineDash([]);
    if (hot || (isExtend && incident)) drawWeight(edge, a, b, hot);
    ctx.restore();
  }

  function drawWeight(edge, a, b, hot) {
    const mx = (a.px + b.px) / 2;
    const my = (a.py + b.py) / 2;
    ctx.fillStyle = "rgba(255,253,246,.95)";
    roundRect(mx - 18, my - 14, 36, 22, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(214,59,29,.16)";
    ctx.stroke();
    ctx.fillStyle = hot ? "#d63b1d" : "#9a3412";
    ctx.font = "800 12px JetBrains Mono, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(edge.w, mx, my - 2);
  }

  function drawNode(node) {
    const isIncident = node.id === state.incident;
    const isPath = state.activePath.includes(node.id);
    const isSelected = node.id === state.selected;
    const radius = node.type === "hub" ? 25 : isSelected ? 22 : isPath ? 20 : 18;
    ctx.save();
    ctx.beginPath();
    ctx.arc(node.px, node.py, radius, 0, Math.PI * 2);
    ctx.fillStyle = isIncident ? "#d63b1d" : isPath ? "#c58a1f" : colors[node.type] || "#2f7d57";
    ctx.fill();
    ctx.strokeStyle = "#fffdf6";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "900 12px JetBrains Mono, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N" + node.id, node.px, node.py);
    ctx.fillStyle = "#253447";
    ctx.font = "800 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textBaseline = "top";
    ctx.fillText(node.name, node.px, node.py + radius + 6);
    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 10px Outfit, sans-serif";
    ctx.fillText(node.sub, node.px, node.py + radius + 23);
    if (isIncident) {
      ctx.strokeStyle = "rgba(214,59,29,.32)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.px, node.py, radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTitle() {
    ctx.save();
    ctx.fillStyle = "#7c2d12";
    ctx.font = "800 20px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "left";
    ctx.fillText(isExtend ? "城市大脑多系统联动图" : "智慧城市设施网络图", 24, 34);
    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.fillText(isExtend ? "点击节点模拟事件，调节压力观察调度路径变化" : "点一个设施设为事件点，再观察城市大脑如何联动", 24, 58);
    ctx.restore();
  }

  function renderPanel(result) {
    const pathText = result.path.length ? result.path.map(id => "N" + id).join(" -> ") : "未连通";
    const risk = riskScore(result);
    const summary = isExtend ? [
      ["场景", viewLabel()],
      ["事件点", nodeName(state.incident)],
      ["响应代价", result.value < Infinity ? result.value : "∞"],
      ["风险分", risk]
    ] : [
      ["事件点", nodeName(state.incident)],
      ["联动路径", pathText]
    ];
    vizText.innerHTML =
      '<div class="city-panel">' +
      '<div class="city-summary">' + summary.map(item =>
        '<div><b>' + esc(item[0]) + '</b><span>' + esc(String(item[1])) + '</span></div>'
      ).join("") + '</div>' +
      '<div class="city-hint">' + esc(state.last || (isExtend ? "选择城市场景，点击节点设置事件点，再进行协同调度。" : "红色节点是事件点；红色连线是从城市大脑出发的联动路径。")) + '</div>' +
      '<div class="city-node-list">' + nodes().map(node =>
        '<button type="button" data-city-node="' + node.id + '" class="' + (node.id === state.incident ? "hot" : "") + '">' +
        '<span>N' + node.id + '</span><b>' + esc(node.name) + '</b><small>' + esc(typeLabel(node.type)) + '</small></button>'
      ).join("") + '</div>' +
      '</div>';
  }

  function viewLabel() {
    const labels = { overview: "综合监测", traffic: "交通拥堵", emergency: "应急救援", risk: "级联风险", route: "联动路径" };
    return labels[state.view] || "城市网络";
  }

  function typeLabel(type) {
    return {
      hub: "中枢", traffic: "交通", energy: "能源", service: "政务",
      emergency: "应急", community: "社区", data: "数据"
    }[type] || "设施";
  }

  function riskScore(result) {
    if (!isExtend) return 0;
    const pathPenalty = result.value < Infinity ? result.value * 3 : 80;
    const pressurePenalty = Number(state.pressure) * 8;
    const coordinationBonus = state.coordinated ? 18 : 0;
    return Math.max(0, Math.min(99, Math.round(pathPenalty + pressurePenalty - coordinationBonus)));
  }

  function renderResult(result) {
    const connected = result.value < Infinity;
    if (!isExtend) {
      formulaText.textContent = "G_city: |V|=6, |E|=" + basicEdges.length + ", path=" + (result.path.length ? result.path.join("->") : "无");
      resultValue.innerHTML = '<span class="truth-chip">' + esc(connected ? "已联动" : "未连通") + '</span>';
      resultExtra.textContent = "网络观察：节点代表城市设施，边代表联动关系；基础层只需看清“点、线、路径”。";
      return;
    }
    formulaText.textContent = "mode=" + state.view + ", pressure=" + state.pressure + ", dist=" + (connected ? result.value : "∞");
    const score = riskScore(result);
    resultValue.innerHTML = '<span class="truth-chip' + (score > 70 ? " false" : "") + '">' + esc(score > 70 ? "需强化调度" : "协同可控") + '</span>';
    resultExtra.textContent = "网络观察：跨层边和数据中台会降低调度代价；压力升高时，关键枢纽和备用通道更重要。";
  }

  function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const pos = positions(rect.width, rect.height);
    let best = null;
    pos.forEach(node => {
      const d = Math.hypot(node.px - x, node.py - y);
      if (d < 30 && (!best || d < best.d)) best = { node, d };
    });
    if (!best) return;
    state.selected = best.node.id;
    if (best.node.id !== 0) state.incident = best.node.id;
    state.last = "已选择 " + nodeName(best.node.id) + "。";
    runAnalysis(true);
    render();
  }

  function handlePanelClick(event) {
    const button = event.target.closest("[data-city-node]");
    if (!button) return;
    const id = Number(button.dataset.cityNode);
    state.selected = id;
    if (id !== 0) state.incident = id;
    state.last = "已从列表选择 " + nodeName(id) + "。";
    runAnalysis(true);
    render();
  }

  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function injectStyles() {
    if (document.getElementById("smart-city-case-interactive-style")) return;
    const style = document.createElement("style");
    style.id = "smart-city-case-interactive-style";
    style.textContent = `
body .app-container>main.glass-pane.smart-city-stage .logic-board{grid-template-rows:minmax(390px,46vh) auto!important;gap:12px!important}
body .app-container>main.glass-pane.smart-city-stage .graph-canvas{min-height:390px!important;border:1px solid rgba(116,55,31,.16)!important;background:#fffdf6!important}
.city-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.city-actions.simple{grid-template-columns:1fr}
.city-action{min-height:42px;border-radius:8px;border:1px solid rgba(116,55,31,.18);background:rgba(255,255,255,.72);color:#5b463c;font-weight:800;cursor:pointer;font-family:inherit}
.city-action.primary{background:linear-gradient(135deg,#c92a1c,#ea6a2a);border-color:transparent;color:#fff}.city-action.warn{background:rgba(47,95,159,.10);color:#225a9f}
.city-action:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(116,55,31,.12)}
.city-panel{display:grid;gap:10px;color:#253447}.city-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.city-summary>div{min-width:0;border:1px solid rgba(116,55,31,.12);border-radius:8px;background:rgba(255,255,255,.72);padding:9px 10px}
.city-summary b{display:block;color:#9a3412;font-size:.78rem;margin-bottom:4px}.city-summary span{display:block;color:#253447;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.city-hint{padding:10px 12px;border-radius:8px;background:rgba(255,248,237,.86);border:1px solid rgba(214,59,29,.13);color:#6b4a38;font-weight:700}
.city-node-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px}
.city-node-list button{display:grid;grid-template-columns:auto 1fr;gap:2px 8px;text-align:left;border:1px solid rgba(116,55,31,.13);border-radius:8px;background:rgba(255,255,255,.72);padding:8px 10px;color:#253447;cursor:pointer}
.city-node-list span{grid-row:1/3;color:#d63b1d;font:900 13px JetBrains Mono,Consolas}.city-node-list b{font-size:.88rem}.city-node-list small{color:#6b4a38}.city-node-list button.hot{border-color:rgba(214,59,29,.34);background:rgba(214,59,29,.10)}
@media(max-width:920px){.city-summary{grid-template-columns:1fr 1fr}.city-actions{grid-template-columns:1fr}body .app-container>main.glass-pane.smart-city-stage .logic-board{grid-template-rows:340px auto!important}}
`;
    document.head.appendChild(style);
  }
})();
