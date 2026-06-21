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

  const profile = typeof PROFILE !== "undefined" ? PROFILE : { params: { mode: "manufacturing" } };
  const isExtend = profile.params && profile.params.mode === "bottleneck";
  const ctx = canvas.getContext("2d");
  const nodeNames = [
    "原料", "粗加工", "钻铣", "热处理", "精加工", "装配", "质检", "入库"
  ];
  const nodeSub = [
    "Raw", "Cut", "Drill", "Heat", "Polish", "Assemble", "Inspect", "Store"
  ];
  const basicNames = ["原料", "粗加工", "钻铣", "热处理", "精加工", "成品"];
  const basicSub = ["Raw", "Cut", "Drill", "Heat", "Polish", "Done"];
  const baseEdges = [
    { u: 0, v: 1, w: 2.0, load: 0.42 },
    { u: 0, v: 2, w: 1.8, load: 0.36 },
    { u: 1, v: 3, w: 3.1, load: 0.72, bottleneck: true },
    { u: 2, v: 3, w: 1.6, load: 0.50 },
    { u: 2, v: 4, w: 2.2, load: 0.56 },
    { u: 3, v: 5, w: 3.4, load: 0.82, bottleneck: true },
    { u: 4, v: 5, w: 2.1, load: 0.58 },
    { u: 5, v: 6, w: 2.8, load: 0.76, bottleneck: true },
    { u: 6, v: 7, w: 1.4, load: 0.44 }
  ];
  const extendEdges = [
    { u: 1, v: 4, w: 2.6, load: 0.48 },
    { u: 3, v: 6, w: 2.5, load: 0.52, digital: true }
  ];

  const state = {
    view: "adjacency",
    pressure: isExtend ? 4 : 3,
    optimized: isExtend,
    edges: cloneEdges(isExtend),
    selectedEdge: null,
    selectedNode: null,
    last: "",
    step: 0,
    timer: null
  };

  injectStyles();
  setupControls();
  document.querySelector("main.glass-pane")?.classList.add("manufacturing-stage");
  canvas.addEventListener("click", handleCanvasClick);
  vizText.addEventListener("click", handleMatrixClick);
  window.addEventListener("resize", render);
  render();

  function cloneEdges(withExtend) {
    return baseEdges.concat(withExtend ? extendEdges : []).map((edge, index) => ({
      ...edge,
      id: "e" + index + "_" + edge.u + "_" + edge.v
    }));
  }

  function nodeCount() {
    return isExtend ? nodeNames.length : basicNames.length;
  }

  function displayName(index) {
    return (isExtend ? nodeNames : basicNames)[index] || ("V" + index);
  }

  function displaySub(index) {
    return (isExtend ? nodeSub : basicSub)[index] || "";
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[ch]));
  }

  function key(edge) {
    return edge.u + "-" + edge.v;
  }

  function stageEdges() {
    const n = nodeCount();
    const pressure = Number(state.pressure) || 1;
    const edges = state.edges.filter(edge => edge.u < n && edge.v < n).map(edge => {
      let w = edge.w + (edge.bottleneck ? pressure * 0.42 : pressure * 0.08);
      let load = Math.min(0.98, edge.load + (edge.bottleneck ? pressure * 0.055 : pressure * 0.018));
      if (state.optimized && edge.bottleneck) {
        w = Math.max(1.1, w - pressure * (isExtend ? 0.55 : 0.36));
        load = Math.max(0.26, load - (isExtend ? 0.22 : 0.14));
      }
      return { ...edge, w: Number(w.toFixed(1)), load };
    });
    if (isExtend && state.optimized && !edges.some(edge => edge.u === 4 && edge.v === 6)) {
      edges.push({
        id: "opt_4_6",
        u: 4,
        v: 6,
        w: Number(Math.max(1.2, 3.2 - pressure * 0.28).toFixed(1)),
        load: 0.34,
        optimized: true
      });
    }
    if (!isExtend && state.optimized && !edges.some(edge => edge.u === 2 && edge.v === 5)) {
      edges.push({
        id: "opt_2_5",
        u: 2,
        v: 5,
        w: 1.9,
        load: 0.32,
        optimized: true
      });
    }
    return edges;
  }

  function setupControls() {
    if (!isExtend) {
      state.view = state.view === "critical" ? "critical" : "adjacency";
      controls.innerHTML =
        control("观察方式", select("mfgView", [
          ["adjacency", "工序图 + 0/1矩阵"],
          ["critical", "关键路线"]
        ], state.view), "先看箭头表示依赖") +
        '<div class="control-group"><label><span>互动操作</span><small>低门槛体验</small></label><div class="mfg-actions simple">' +
        '<button type="button" class="mfg-action primary" data-mfg-action="scan">下一步</button>' +
        '<button type="button" class="mfg-action warn" data-mfg-action="optimize">优化瓶颈</button>' +
        '<button type="button" class="mfg-action" data-mfg-action="reset">重置</button>' +
        '</div></div>';
      controls.addEventListener("input", handleControls, true);
      controls.addEventListener("change", handleControls, true);
      controls.addEventListener("click", handleActionClick, true);
      return;
    }
    controls.innerHTML =
      control("矩阵视图", select("mfgView", [
        ["adjacency", "邻接矩阵 A"],
        ["reach", "可达矩阵 R"],
        ["incidence", "关联矩阵 B"],
        ["critical", "关键路径表"]
      ], state.view), "点击矩阵单元可修改依赖") +
      control("节拍压力", '<input type="range" id="mfgPressure" min="1" max="6" step="1" value="' + state.pressure + '">', "模拟瓶颈负载") +
      control("产线优化", '<div class="switch-row"><span>并行工位 / 数字孪生</span><input type="checkbox" id="mfgOptimize"' + (state.optimized ? " checked" : "") + "></div>") +
      '<div class="control-group"><label><span>互动操作</span><small>图与矩阵联动</small></label><div class="mfg-actions">' +
      '<button type="button" class="mfg-action primary" data-mfg-action="scan">推演一步</button>' +
      '<button type="button" class="mfg-action" data-mfg-action="auto">自动推演</button>' +
      '<button type="button" class="mfg-action warn" data-mfg-action="optimize">优化瓶颈</button>' +
      '<button type="button" class="mfg-action" data-mfg-action="reset">重置产线</button>' +
      '</div></div>';

    controls.addEventListener("input", handleControls, true);
    controls.addEventListener("change", handleControls, true);
    controls.addEventListener("click", handleActionClick, true);
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

  function handleControls(event) {
    const target = event.target;
    if (!target || !["mfgView", "mfgPressure", "mfgOptimize"].includes(target.id)) return;
    event.stopImmediatePropagation();
    if (target.id === "mfgView") state.view = target.value;
    if (target.id === "mfgPressure") state.pressure = Number(target.value);
    if (target.id === "mfgOptimize") state.optimized = target.checked;
    state.last = target.id === "mfgView" ? "切换矩阵视图，重新观察图与矩阵的对应关系。" : "参数已更新，产线节拍重新计算。";
    render();
  }

  function handleActionClick(event) {
    const button = event.target.closest("[data-mfg-action]");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const action = button.dataset.mfgAction;
    if (action === "scan") scanStep();
    if (action === "auto") toggleAuto(button);
    if (action === "optimize") {
      state.optimized = true;
      const opt = document.getElementById("mfgOptimize");
      if (opt) opt.checked = true;
      state.last = "已加入并行工位，瓶颈工序被分流。";
      render();
    }
    if (action === "reset") {
      stopAuto();
      state.view = "adjacency";
      state.pressure = isExtend ? 4 : 3;
      state.optimized = isExtend;
      state.edges = cloneEdges(isExtend);
      state.selectedEdge = null;
      state.selectedNode = null;
      state.last = "产线网络已恢复为初始方案。";
      syncControls();
      render();
    }
  }

  function syncControls() {
    const view = document.getElementById("mfgView");
    const pressure = document.getElementById("mfgPressure");
    const optimize = document.getElementById("mfgOptimize");
    if (view) view.value = state.view;
    if (pressure) pressure.value = state.pressure;
    if (optimize) optimize.checked = state.optimized;
  }

  function scanStep() {
    const metrics = computeMetrics(stageEdges());
    const pathEdges = metrics.pathEdges;
    if (!pathEdges.length) {
      state.last = "当前产线没有从原料到入库的完整路径。";
      render();
      return;
    }
    state.selectedEdge = pathEdges[state.step % pathEdges.length];
    const edge = stageEdges().find(item => key(item) === state.selectedEdge);
    state.selectedNode = edge ? edge.v : null;
    state.step += 1;
    state.last = edge ? "推演到 " + displayName(edge.u) + " -> " + displayName(edge.v) + "，节拍 " + edge.w + "h。" : "";
    render();
  }

  function toggleAuto(button) {
    if (state.timer) {
      stopAuto();
      render();
      return;
    }
    button.textContent = "停止推演";
    state.timer = window.setInterval(scanStep, 900);
    scanStep();
  }

  function stopAuto() {
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = null;
    }
    const auto = controls.querySelector('[data-mfg-action="auto"]');
    if (auto) auto.textContent = "自动推演";
  }

  function render() {
    const edges = stageEdges();
    const metrics = computeMetrics(edges);
    drawGraph(edges, metrics);
    renderMatrix(edges, metrics);
    renderResult(edges, metrics);
  }

  function computeMetrics(edges) {
    const n = nodeCount();
    const dist = Array(n).fill(-Infinity);
    const prev = Array(n).fill(null);
    dist[0] = 0;
    for (let u = 0; u < n; u += 1) {
      edges.filter(edge => edge.u === u).forEach(edge => {
        if (dist[u] > -Infinity && dist[u] + edge.w > dist[edge.v]) {
          dist[edge.v] = dist[u] + edge.w;
          prev[edge.v] = edge;
        }
      });
    }
    let target = n - 1;
    if (dist[target] === -Infinity) {
      target = dist.reduce((best, value, index) => value > dist[best] ? index : best, 0);
    }
    const path = [];
    const pathEdges = [];
    let cur = target;
    while (cur != null && cur >= 0) {
      path.unshift(cur);
      const edge = prev[cur];
      if (!edge) break;
      pathEdges.unshift(key(edge));
      cur = edge.u;
    }
    const criticalEdges = edges.filter(edge => pathEdges.includes(key(edge)));
    const bottleneck = criticalEdges.reduce((best, edge) => !best || edge.w > best.w ? edge : best, null);
    const density = edges.length / (n * (n - 1) / 2);
    const highLoad = edges.filter(edge => edge.load > 0.72).length;
    return {
      path,
      pathEdges,
      duration: dist[target] > -Infinity ? Number(dist[target].toFixed(1)) : 0,
      bottleneck,
      density,
      highLoad
    };
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(720, Math.floor(rect.width || 820));
    const height = Math.max(380, Math.floor(rect.height || 420));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: width, h: height };
  }

  function nodePositions(w, h) {
    if (!isExtend) {
      return [
        { x: w * 0.10, y: h * 0.50 },
        { x: w * 0.28, y: h * 0.35 },
        { x: w * 0.28, y: h * 0.65 },
        { x: w * 0.48, y: h * 0.35 },
        { x: w * 0.48, y: h * 0.65 },
        { x: w * 0.74, y: h * 0.50 }
      ];
    }
    return [
      { x: w * 0.08, y: h * 0.50 },
      { x: w * 0.22, y: h * 0.32 },
      { x: w * 0.22, y: h * 0.68 },
      { x: w * 0.39, y: h * 0.30 },
      { x: w * 0.39, y: h * 0.70 },
      { x: w * 0.58, y: h * 0.50 },
      { x: w * 0.76, y: h * 0.50 },
      { x: w * 0.91, y: h * 0.50 }
    ];
  }

  function drawGraph(edges, metrics) {
    const { w, h } = resizeCanvas();
    const pos = nodePositions(w, h);
    ctx.clearRect(0, 0, w, h);
    drawGrid(w, h);
    drawBands(w, h);

    edges.forEach(edge => drawEdge(edge, pos, metrics));
    pos.forEach((point, index) => drawNode(point, index, metrics));

    ctx.fillStyle = "#7c2d12";
    ctx.font = "800 20px 'Noto Serif SC', serif";
    ctx.textAlign = "left";
    ctx.fillText(isExtend ? "智能制造瓶颈矩阵推演" : "简单工序依赖图", 24, 34);
    ctx.fillStyle = "#64748b";
    ctx.font = "700 13px 'Noto Serif SC', serif";
    ctx.fillText(isExtend ? "点击矩阵切换依赖，点击图中节点/连线高亮对应关系" : "箭头表示先后依赖，红色表示当前关键路线", 24, 58);
  }

  function drawGrid(w, h) {
    ctx.save();
    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(214, 59, 29, 0.07)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBands(w, h) {
    const labels = isExtend ? ["输入", "加工", "处理", "装配", "检测", "交付"] : ["输入", "加工", "处理", "交付"];
    ctx.save();
    labels.forEach((label, index) => {
      const x = w * (0.04 + index * 0.16);
      ctx.fillStyle = index % 2 ? "rgba(47, 95, 159, 0.035)" : "rgba(214, 59, 29, 0.035)";
      ctx.fillRect(x, 78, w * 0.13, h - 110);
      ctx.fillStyle = "#9a3412";
      ctx.font = "700 12px 'Noto Serif SC', serif";
      ctx.textAlign = "center";
      ctx.fillText(label, x + w * 0.065, h - 28);
    });
    ctx.restore();
  }

  function drawEdge(edge, pos, metrics) {
    const a = pos[edge.u];
    const b = pos[edge.v];
    const isCritical = metrics.pathEdges.includes(key(edge));
    const isSelected = state.selectedEdge === key(edge);
    const color = edge.optimized ? "#2563eb" : isSelected ? "#f59e0b" : isCritical ? "#d63b1d" : "#2f7d57";
    const width = isSelected ? 5 : isCritical ? 4 : edge.optimized ? 3.5 : 2.4;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = edge.load > 0.78 || isCritical || isSelected ? 0.96 : 0.64;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    drawArrow(a, b, 22);

    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    if (isCritical || isSelected || edge.optimized || edge.bottleneck) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255, 253, 246, 0.94)";
      roundRect(mx - 22, my - 16, 44, 24, 9);
      ctx.fill();
      ctx.strokeStyle = "rgba(214, 59, 29, 0.18)";
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = "800 12px JetBrains Mono, Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(edge.w + "h", mx, my - 4);
    }
    ctx.restore();
  }

  function drawArrow(a, b, gap) {
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const x = b.x - Math.cos(angle) * gap;
    const y = b.y - Math.sin(angle) * gap;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(angle - 0.45) * 12, y - Math.sin(angle - 0.45) * 12);
    ctx.lineTo(x - Math.cos(angle + 0.45) * 12, y - Math.sin(angle + 0.45) * 12);
    ctx.closePath();
    ctx.fill();
  }

  function drawNode(point, index, metrics) {
    const critical = metrics.path.includes(index);
    const selected = state.selectedNode === index;
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, selected ? 24 : critical ? 22 : 19, 0, Math.PI * 2);
    ctx.fillStyle = selected ? "#f59e0b" : critical ? "#d63b1d" : "#2f7d57";
    ctx.fill();
    ctx.strokeStyle = "#fffdf6";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "900 13px JetBrains Mono, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("V" + index, point.x, point.y);

    ctx.fillStyle = "#253447";
    ctx.font = "800 13px 'Noto Serif SC', serif";
    ctx.textBaseline = "top";
    ctx.fillText(displayName(index), point.x, point.y + 28);
    ctx.fillStyle = "#64748b";
    ctx.font = "700 10px Outfit, sans-serif";
    ctx.fillText(displaySub(index), point.x, point.y + 46);
    ctx.restore();
  }

  function renderMatrix(edges, metrics) {
    const summary = isExtend ? [
      ["关键链", metrics.path.map(index => "V" + index).join(" -> ") || "未连通"],
      ["总节拍", metrics.duration + "h"],
      ["瓶颈边", metrics.bottleneck ? "V" + metrics.bottleneck.u + " -> V" + metrics.bottleneck.v : "无"],
      ["高负载", metrics.highLoad + " 条"]
    ] : [
      ["关键路线", metrics.path.map(index => "V" + index).join(" -> ") || "未连通"],
      ["总节拍", metrics.duration + "h"]
    ];
    let matrix = "";
    if (state.view === "adjacency") matrix = adjacencyHtml(edges);
    if (state.view === "reach") matrix = reachHtml(edges);
    if (state.view === "incidence") matrix = incidenceHtml(edges);
    if (state.view === "critical") matrix = criticalHtml(edges, metrics);
    vizText.innerHTML =
      '<div class="mfg-panel">' +
      '<div class="mfg-summary">' + summary.map(item =>
        '<div><b>' + esc(item[0]) + '</b><span>' + esc(item[1]) + '</span></div>'
      ).join("") + '</div>' +
      '<div class="mfg-hint">' + esc(state.last || (isExtend ? "邻接矩阵中点击 0/1，可增删一道向后的工序依赖；关键链用红色同步高亮。" : "看图：箭头表示工序先后；看矩阵：1 表示有依赖，0 表示没有。")) + '</div>' +
      matrix +
      '</div>';
  }

  function adjacencyHtml(edges) {
    const n = nodeCount();
    const active = new Set(edges.map(key));
    const cells = ['<div class="mfg-matrix-grid" style="grid-template-columns:44px repeat(' + n + ',42px)">'];
    cells.push('<span class="mfg-head"></span>');
    for (let j = 0; j < n; j += 1) cells.push('<span class="mfg-head">V' + j + '</span>');
    for (let i = 0; i < n; i += 1) {
      cells.push('<span class="mfg-head">V' + i + '</span>');
      for (let j = 0; j < n; j += 1) {
        const k = i + "-" + j;
        const on = active.has(k);
        const disabled = j <= i;
        cells.push('<button type="button" class="mfg-cell' + (on ? " hot" : "") + (disabled ? " disabled" : "") + '" data-mfg-cell="adj" data-row="' + i + '" data-col="' + j + '">' + (on ? "1" : "0") + '</button>');
      }
    }
    cells.push("</div>");
    return '<div class="mfg-matrix-wrap"><h3>邻接矩阵 A</h3>' + cells.join("") + "</div>";
  }

  function reachHtml(edges) {
    const n = nodeCount();
    const reach = reachability(edges);
    const cells = ['<div class="mfg-matrix-grid" style="grid-template-columns:44px repeat(' + n + ',42px)">'];
    cells.push('<span class="mfg-head"></span>');
    for (let j = 0; j < n; j += 1) cells.push('<span class="mfg-head">V' + j + '</span>');
    for (let i = 0; i < n; i += 1) {
      cells.push('<span class="mfg-head">V' + i + '</span>');
      for (let j = 0; j < n; j += 1) {
        cells.push('<button type="button" class="mfg-cell' + (reach[i][j] ? " hot" : "") + '" data-mfg-cell="reach" data-row="' + i + '" data-col="' + j + '">' + (reach[i][j] ? "1" : "0") + '</button>');
      }
    }
    cells.push("</div>");
    return '<div class="mfg-matrix-wrap"><h3>可达矩阵 R</h3>' + cells.join("") + "</div>";
  }

  function incidenceHtml(edges) {
    const cells = ['<div class="mfg-matrix-grid incidence" style="grid-template-columns:44px repeat(' + edges.length + ',42px)">'];
    cells.push('<span class="mfg-head"></span>');
    edges.forEach((edge, index) => cells.push('<span class="mfg-head">E' + index + '</span>'));
    for (let i = 0; i < nodeCount(); i += 1) {
      cells.push('<span class="mfg-head">V' + i + '</span>');
      edges.forEach((edge, index) => {
        const value = edge.u === i ? 1 : edge.v === i ? -1 : 0;
        cells.push('<button type="button" class="mfg-cell' + (value ? " hot" : "") + '" data-mfg-cell="inc" data-edge="' + index + '" data-node="' + i + '">' + value + '</button>');
      });
    }
    cells.push("</div>");
    return '<div class="mfg-matrix-wrap"><h3>关联矩阵 B</h3>' + cells.join("") + "</div>";
  }

  function criticalHtml(edges, metrics) {
    const rows = edges.map(edge => {
      const critical = metrics.pathEdges.includes(key(edge));
      return '<button type="button" class="mfg-route-row' + (critical ? " hot" : "") + '" data-mfg-edge="' + esc(key(edge)) + '">' +
        '<span>V' + edge.u + ' -> V' + edge.v + '</span><b>' + edge.w + 'h</b><small>' + (edge.optimized ? "并行优化" : edge.bottleneck ? "瓶颈工序" : "常规依赖") + '</small></button>';
    }).join("");
    return '<div class="mfg-matrix-wrap route"><h3>关键路径表</h3><div class="mfg-route-list">' + rows + "</div></div>";
  }

  function reachability(edges) {
    const n = nodeCount();
    const reach = Array.from({ length: n }, () => Array(n).fill(0));
    edges.forEach(edge => { reach[edge.u][edge.v] = 1; });
    for (let k = 0; k < n; k += 1) {
      for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < n; j += 1) {
          if (reach[i][k] && reach[k][j]) reach[i][j] = 1;
        }
      }
    }
    return reach;
  }

  function handleMatrixClick(event) {
    const route = event.target.closest("[data-mfg-edge]");
    if (route) {
      state.selectedEdge = route.dataset.mfgEdge;
      const edge = stageEdges().find(item => key(item) === state.selectedEdge);
      state.selectedNode = edge ? edge.v : null;
      state.last = edge ? "已选中依赖 V" + edge.u + " -> V" + edge.v + "。" : "";
      render();
      return;
    }
    const cell = event.target.closest("[data-mfg-cell]");
    if (!cell) return;
    event.preventDefault();
    const type = cell.dataset.mfgCell;
    if (type === "adj") {
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      if (col <= row) {
        state.last = "为了保持工序网络无环，只允许添加指向后续工序的依赖。";
      } else {
        toggleDependency(row, col);
      }
    }
    if (type === "reach") {
      state.selectedNode = Number(cell.dataset.col);
      state.last = "可达关系：V" + cell.dataset.row + " 到 V" + cell.dataset.col + " = " + cell.textContent + "。";
    }
    if (type === "inc") {
      const edge = stageEdges()[Number(cell.dataset.edge)];
      if (edge) {
        state.selectedEdge = key(edge);
        state.selectedNode = Number(cell.dataset.node);
        state.last = "关联矩阵列 E" + cell.dataset.edge + " 对应 V" + edge.u + " -> V" + edge.v + "。";
      }
    }
    render();
  }

  function toggleDependency(row, col) {
    const k = row + "-" + col;
    const index = state.edges.findIndex(edge => key(edge) === k);
    if (index >= 0) {
      state.edges.splice(index, 1);
      state.selectedEdge = null;
      state.last = "已删除依赖 V" + row + " -> V" + col + "，观察矩阵和关键链同步变化。";
    } else {
      state.edges.push({
        id: "custom_" + row + "_" + col + "_" + Date.now(),
        u: row,
        v: col,
        w: Number((1.4 + ((row + col) % 4) * 0.55).toFixed(1)),
        load: 0.42,
        custom: true
      });
      state.selectedEdge = k;
      state.last = "已新增依赖 V" + row + " -> V" + col + "，产线拓扑被重新计算。";
    }
  }

  function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const pos = nodePositions(rect.width, rect.height);
    let foundNode = null;
    pos.forEach((point, index) => {
      if (Math.hypot(point.x - x, point.y - y) < 28) foundNode = index;
    });
    if (foundNode != null) {
      state.selectedNode = foundNode;
      state.selectedEdge = null;
      state.last = "已选中工序 V" + foundNode + "：" + displayName(foundNode) + "。";
      render();
      return;
    }
    let best = null;
    stageEdges().forEach(edge => {
      const d = distanceToSegment({ x, y }, pos[edge.u], pos[edge.v]);
      if (d < 14 && (!best || d < best.d)) best = { edge, d };
    });
    if (best) {
      state.selectedEdge = key(best.edge);
      state.selectedNode = best.edge.v;
      state.last = "已选中依赖 V" + best.edge.u + " -> V" + best.edge.v + "，节拍 " + best.edge.w + "h。";
      render();
    }
  }

  function distanceToSegment(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len));
    const x = a.x + t * dx;
    const y = a.y + t * dy;
    return Math.hypot(p.x - x, p.y - y);
  }

  function renderResult(edges, metrics) {
    const label = metrics.highLoad > 2 && !state.optimized ? "瓶颈待优化" : "节拍可控";
    if (!isExtend) {
      formulaText.textContent = "关键路线：" + (metrics.path.map(index => "V" + index).join(" -> ") || "未连通");
      resultValue.innerHTML = '<span class="truth-chip">' + esc(state.optimized ? "已优化" : "已找到路线") + '</span>';
      resultExtra.textContent = "入门观察：1 表示两个工序之间有依赖；红色路线表示当前用时最长、最需要关注的一条工序链。";
      return;
    }
    formulaText.textContent = "A/B 联动 · |V|=" + nodeCount() + " · |E|=" + edges.length + " · CP=" + metrics.duration + "h";
    resultValue.innerHTML = '<span class="truth-chip">' + esc(label) + '</span>';
    resultExtra.textContent = "网络观察：" + (metrics.bottleneck ? "当前瓶颈依赖为 V" + metrics.bottleneck.u + " -> V" + metrics.bottleneck.v + "，可通过并行工位、设备协同或调整工序依赖降低总节拍。" : "当前依赖结构较均衡。");
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
    if (document.getElementById("manufacturing-case-interactive-style")) return;
    const style = document.createElement("style");
    style.id = "manufacturing-case-interactive-style";
    style.textContent = `
body .app-container > main.glass-pane.manufacturing-stage .logic-board{grid-template-rows:minmax(390px,46vh) auto!important;gap:12px!important}
body .app-container > main.glass-pane.manufacturing-stage .graph-canvas{min-height:390px!important;border:1px solid rgba(116,55,31,.16)!important;background:#fffdf6!important}
.mfg-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mfg-actions.simple{grid-template-columns:1fr}
.mfg-action{min-height:42px;border-radius:8px;border:1px solid rgba(116,55,31,.18);background:rgba(255,255,255,.72);color:#5b463c;font-weight:800;cursor:pointer;font-family:inherit}
.mfg-action.primary{background:linear-gradient(135deg,#c92a1c,#ea6a2a);border-color:transparent;color:#fff}
.mfg-action.warn{background:rgba(47,95,159,.10);color:#225a9f}
.mfg-action:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(116,55,31,.12)}
.mfg-panel{display:grid;gap:10px;color:#253447}
.mfg-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.mfg-summary>div{min-width:0;border:1px solid rgba(116,55,31,.12);border-radius:8px;background:rgba(255,255,255,.72);padding:9px 10px}
.mfg-summary b{display:block;color:#9a3412;font-size:.78rem;margin-bottom:4px}
.mfg-summary span{display:block;color:#253447;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mfg-hint{padding:10px 12px;border-radius:8px;background:rgba(255,248,237,.86);border:1px solid rgba(214,59,29,.13);color:#6c5a52;font-weight:700}
.mfg-matrix-wrap{overflow:auto;border:1px solid rgba(116,55,31,.14);border-radius:8px;background:rgba(255,255,255,.78);padding:12px}
.mfg-matrix-wrap h3{margin:0 0 10px;color:#d63b1d;font-family:"Noto Serif SC",serif;font-size:1rem}
.mfg-matrix-grid{display:grid;gap:4px;align-items:center;width:max-content;min-width:100%}
.mfg-head{height:32px;display:grid;place-items:center;color:#7c2d12;font-weight:900;font-size:.75rem}
.mfg-cell{width:38px;height:32px;border:1px solid rgba(116,55,31,.12);border-radius:6px;background:rgba(47,95,159,.06);color:#64748b;font:800 13px JetBrains Mono,Consolas,monospace;cursor:pointer}
.mfg-cell.hot{background:rgba(214,59,29,.14);border-color:rgba(214,59,29,.30);color:#b42318}
.mfg-cell.disabled{opacity:.36;cursor:not-allowed}
.mfg-cell:hover:not(.disabled){transform:scale(1.06);background:rgba(47,95,159,.14)}
.mfg-route-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.mfg-route-row{display:grid;gap:3px;text-align:left;border:1px solid rgba(116,55,31,.13);border-radius:8px;background:rgba(255,255,255,.72);padding:9px 10px;color:#253447;cursor:pointer}
.mfg-route-row span{font-weight:900}
.mfg-route-row b{color:#225a9f}
.mfg-route-row small{color:#64748b}
.mfg-route-row.hot{border-color:rgba(214,59,29,.34);background:rgba(214,59,29,.10)}
@media(max-width:920px){.mfg-summary{grid-template-columns:1fr 1fr}.mfg-actions{grid-template-columns:1fr}body .app-container>main.glass-pane.manufacturing-stage .logic-board{grid-template-rows:340px auto!important}.mfg-cell{width:34px}}
`;
    document.head.appendChild(style);
  }
})();
