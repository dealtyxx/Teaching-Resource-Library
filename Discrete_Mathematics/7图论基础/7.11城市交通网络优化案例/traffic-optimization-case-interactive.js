(function () {
  "use strict";

  if (window.SECTION_META) {
    window.SECTION_META.ideology = { title: "", text: "", dims: [], quote: "" };
  }

  const controls = document.getElementById("controls");
  const canvas = document.getElementById("graphCanvas");
  const vizText = document.getElementById("vizText");
  const formulaText = document.getElementById("formulaText");
  const resultValue = document.getElementById("resultValue");
  const resultExtra = document.getElementById("resultExtra");
  if (!controls || !canvas || !vizText) return;

  const ctx = canvas.getContext("2d");
  const isExtend = location.pathname.includes("extend");
  const rows = 5;
  const cols = 6;
  const views = {
    original: { name: "综合路网", formula: "G1 ∪ G2", hint: "显示全部自行车道、汽车道和共用冲突路段。" },
    intersection: { name: "共用冲突", formula: "G1 ∩ G2", hint: "只看两套网络同时占用的路段，适合排查瓶颈。" },
    bike: { name: "慢行专用", formula: "G1 - G2", hint: "只看自行车/步行优先通道。" },
    car: { name: "机动车专用", formula: "G2 - G1", hint: "只看机动车主干通道。" },
    potential: { name: "潜在改造", formula: "~(G1 ∪ G2)", hint: "只看尚未利用、可规划的候选路段。" }
  };

  let nodes = [];
  let allEdges = [];
  let state = null;
  let timer = null;
  let hoverEdge = null;
  let scanIndex = -1;

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[ch]));
  }
  function edgeId(a, b) { return [a, b].sort().join("-"); }
  function injectStyle() {
    if (document.getElementById("traffic-case-interactive-style")) return;
    const style = document.createElement("style");
    style.id = "traffic-case-interactive-style";
    style.textContent = `
.traffic-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.traffic-action{min-height:42px;border:1px solid rgba(116,55,31,.18);border-radius:8px;background:rgba(255,250,242,.92);color:#4e362d;font-weight:800;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}
.traffic-action:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(116,55,31,.14)}
.traffic-action.primary{border-color:rgba(214, 59, 29,.32);background:linear-gradient(135deg,#d63b1d,#ef7d32);color:#fff}
.traffic-action.warn{border-color:rgba(47,95,159,.3);background:rgba(47,95,159,.1);color:#23436e}
.traffic-metrics{width:100%;margin-top:10px;border-collapse:collapse;font-size:.92rem}
.traffic-metrics td{border-bottom:1px dashed rgba(116,55,31,.16);padding:6px 4px}
.traffic-metrics td:last-child{text-align:right;font-family:"JetBrains Mono",Consolas,monospace;color:#d63b1d;font-weight:800}
.traffic-view-chip{display:inline-flex;align-items:center;border-radius:999px;padding:4px 9px;margin:0 5px 5px 0;background:rgba(47,95,159,.09);color:#2f5f9f;font-weight:800}
@media (min-width:1100px){body .app-container>main.glass-pane.visualizer-stage>.logic-board{grid-template-rows:minmax(380px,46vh) auto!important}body .app-container>main.glass-pane.visualizer-stage>.logic-board>.graph-canvas{min-height:380px!important}}
@media (max-width:920px){body .logic-board{grid-template-rows:360px auto!important}body .graph-canvas{min-height:340px!important}}
`;
    document.head.appendChild(style);
  }
  function initNetwork() {
    nodes = [];
    allEdges = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        nodes.push({ id: `n${r}_${c}`, r, c, name: `${r + 1}-${c + 1}` });
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const u = `n${r}_${c}`;
        if (c < cols - 1) allEdges.push({ u, v: `n${r}_${c + 1}`, id: edgeId(u, `n${r}_${c + 1}`), dir: "h" });
        if (r < rows - 1) allEdges.push({ u, v: `n${r + 1}_${c}`, id: edgeId(u, `n${r + 1}_${c}`), dir: "v" });
      }
    }
  }
  function makeSets() {
    const bike = new Set();
    const car = new Set();
    [
      ["n0_0", "n0_1"], ["n0_1", "n0_2"], ["n0_2", "n0_3"],
      ["n2_0", "n2_1"], ["n2_1", "n2_2"], ["n2_2", "n2_3"], ["n2_3", "n2_4"], ["n2_4", "n2_5"],
      ["n0_2", "n1_2"], ["n1_2", "n2_2"], ["n2_2", "n3_2"], ["n3_2", "n4_2"],
      ["n0_4", "n1_4"], ["n1_4", "n2_4"]
    ].forEach(pair => bike.add(edgeId(pair[0], pair[1])));
    [
      ["n4_0", "n4_1"], ["n4_1", "n4_2"], ["n4_2", "n4_3"], ["n4_3", "n4_4"], ["n4_4", "n4_5"],
      ["n2_0", "n2_1"], ["n2_1", "n2_2"], ["n2_2", "n2_3"], ["n2_3", "n2_4"], ["n2_4", "n2_5"],
      ["n0_0", "n1_0"], ["n1_0", "n2_0"], ["n2_0", "n3_0"], ["n3_0", "n4_0"],
      ["n0_5", "n1_5"], ["n1_5", "n2_5"], ["n2_5", "n3_5"], ["n3_5", "n4_5"]
    ].forEach(pair => car.add(edgeId(pair[0], pair[1])));
    if (isExtend) {
      bike.add(edgeId("n1_1", "n1_2"));
      bike.add(edgeId("n1_1", "n2_1"));
      car.add(edgeId("n1_3", "n1_4"));
      car.add(edgeId("n1_3", "n2_3"));
    }
    return { bike, car };
  }
  function edgeType(edge, s) {
    const b = s.bike.has(edge.id);
    const c = s.car.has(edge.id);
    if (b && c) return "shared";
    if (b) return "bike";
    if (c) return "car";
    return "potential";
  }
  function makeState() {
    const sets = makeSets();
    return {
      view: document.getElementById("trafficView")?.value || "original",
      pressure: Number(document.getElementById("trafficPressure")?.value || (isExtend ? 4 : 3)),
      coordinated: !!document.getElementById("trafficCoordinate")?.checked,
      bike: sets.bike,
      car: sets.car,
      last: "已载入城市交通路网。点击道路可改变道路归属，切换视图可观察集合运算结果。"
    };
  }
  function resetState() {
    stopAuto();
    scanIndex = -1;
    state = makeState();
  }
  function ensureState() {
    const view = document.getElementById("trafficView")?.value || "original";
    const pressure = Number(document.getElementById("trafficPressure")?.value || (isExtend ? 4 : 3));
    const coordinated = !!document.getElementById("trafficCoordinate")?.checked;
    if (!state || state.view !== view || state.pressure !== pressure || state.coordinated !== coordinated) {
      const oldBike = state?.bike;
      const oldCar = state?.car;
      state = makeState();
      if (oldBike && oldCar) {
        state.bike = new Set(oldBike);
        state.car = new Set(oldCar);
      }
      state.last = "参数已更新，路网指标已重算。";
    }
    return state;
  }
  function stopAuto() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  function metrics(s) {
    let bike = 0, car = 0, shared = 0, potential = 0, visible = 0, load = 0;
    allEdges.forEach(edge => {
      const type = edgeType(edge, s);
      if (type === "bike") bike++;
      if (type === "car") car++;
      if (type === "shared") shared++;
      if (type === "potential") potential++;
      if (isVisible(edge, s)) visible++;
      load += edgeCost(type, s);
    });
    return {
      bike,
      car,
      shared,
      potential,
      visible,
      score: Math.max(0, Math.round(100 - shared * s.pressure * (s.coordinated ? 5 : 8) + (s.bike.size + s.car.size) * 0.6)),
      avg: (load / allEdges.length).toFixed(1)
    };
  }
  function edgeCost(type, s) {
    if (type === "shared") return 4 + s.pressure * (s.coordinated ? 0.8 : 1.7);
    if (type === "potential") return 2 + (isExtend ? 0.7 : 1.2);
    return 1.5 + s.pressure * 0.18;
  }
  function isVisible(edge, s) {
    const type = edgeType(edge, s);
    if (s.view === "original") return type !== "potential";
    if (s.view === "intersection") return type === "shared";
    if (s.view === "bike") return type === "bike";
    if (s.view === "car") return type === "car";
    if (s.view === "potential") return type === "potential";
    return true;
  }
  function cycleEdge(edge) {
    const s = ensureState();
    const type = edgeType(edge, s);
    if (type === "potential") s.bike.add(edge.id);
    if (type === "bike") { s.bike.delete(edge.id); s.car.add(edge.id); }
    if (type === "car") s.bike.add(edge.id);
    if (type === "shared") { s.bike.delete(edge.id); s.car.delete(edge.id); }
    s.last = `已调整道路 ${edge.u} - ${edge.v}：${typeName(edgeType(edge, s))}。`;
    render();
  }
  function optimizeConflicts() {
    const s = ensureState();
    let changed = 0;
    allEdges.forEach(edge => {
      if (edgeType(edge, s) === "shared" && changed < (isExtend ? 4 : 2)) {
        if (edge.dir === "h") s.bike.delete(edge.id);
        else s.car.delete(edge.id);
        changed++;
      }
    });
    if (isExtend) {
      s.car.add(edgeId("n1_1", "n1_2"));
      s.car.add(edgeId("n1_2", "n1_3"));
    }
    s.last = changed ? `已分流 ${changed} 条共用冲突路段，并重算网络负载。` : "当前没有需要分流的共用冲突路段。";
    render();
  }
  function scanStep() {
    const s = ensureState();
    scanIndex = (scanIndex + 1) % allEdges.length;
    const edge = allEdges[scanIndex];
    const type = edgeType(edge, s);
    s.last = `巡检道路 ${edge.u} - ${edge.v}：${typeName(type)}，通行代价 ${edgeCost(type, s).toFixed(1)}。`;
    render();
  }
  function toggleAuto() {
    if (timer) {
      stopAuto();
      render();
      return;
    }
    scanStep();
    timer = setInterval(scanStep, 650);
    render();
  }
  function typeName(type) {
    return ({ bike: "慢行专用", car: "机动车专用", shared: "共用冲突", potential: "潜在改造" })[type] || type;
  }
  function typeColor(type) {
    return ({ bike: "#2f9e62", car: "#2563eb", shared: "#f97316", potential: "#cbd5e1" })[type] || "#94a3b8";
  }
  function canvasSize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(520, rect.width);
    const height = Math.max(360, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: width, h: height };
  }
  function nodePosition(n, w, h) {
    const padX = Math.max(64, w * 0.08);
    const padY = Math.max(70, h * 0.18);
    const usableW = w - padX * 2;
    const usableH = h - padY * 2;
    return {
      x: padX + n.c * usableW / (cols - 1),
      y: padY + n.r * usableH / (rows - 1)
    };
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  function draw() {
    const s = ensureState();
    const { w, h } = canvasSize();
    const m = metrics(s);
    const pos = new Map(nodes.map(n => [n.id, nodePosition(n, w, h)]));
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.fillStyle = "rgba(255,250,242,0.56)";
    roundRect(12, 12, w - 24, h - 24, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(116,55,31,0.12)";
    ctx.stroke();
    ctx.fillStyle = "#7c2d12";
    ctx.font = "800 18px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "left";
    ctx.fillText(isExtend ? "智慧交通网络流推演" : "城市路网集合建模", 28, 42);
    ctx.fillStyle = "#6b4a38";
    ctx.font = "13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.fillText("绿色=慢行，蓝色=机动车，橙色=共用冲突，灰色=潜在改造；点击道路可切换归属", 28, 64);

    allEdges.forEach((edge, index) => {
      const a = pos.get(edge.u), b = pos.get(edge.v);
      const type = edgeType(edge, s);
      const visible = isVisible(edge, s);
      const active = index === scanIndex || edge.id === hoverEdge;
      ctx.save();
      ctx.globalAlpha = visible ? 1 : 0.16;
      ctx.strokeStyle = active ? "#d63b1d" : typeColor(type);
      ctx.lineWidth = active ? 6 : type === "shared" ? 5 : type === "potential" ? 2 : 4;
      ctx.setLineDash(type === "potential" ? [8, 7] : []);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
      if ((visible && (type === "shared" || active)) || edge.id === hoverEdge) {
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const label = edgeCost(type, s).toFixed(1);
        ctx.font = "800 12px 'JetBrains Mono', Consolas, monospace";
        const tw = ctx.measureText(label).width + 14;
        roundRect(mx - tw / 2, my - 11, tw, 22, 7);
        ctx.fillStyle = active ? "rgba(214, 59, 29,.96)" : "rgba(255,255,255,.94)";
        ctx.fill();
        ctx.strokeStyle = "rgba(116,55,31,.16)";
        ctx.stroke();
        ctx.fillStyle = active ? "#fff" : "#7c2d12";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, mx, my);
      }
    });
    nodes.forEach(n => {
      const p = pos.get(n.id);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#fff7ed";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(116,55,31,.32)";
      ctx.stroke();
      ctx.fillStyle = "#5e4338";
      ctx.font = "800 10px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n.r + 1 + "," + (n.c + 1), p.x, p.y - 16);
    });
    const activeView = views[s.view] || views.original;
    ctx.fillStyle = "rgba(255,255,255,.9)";
    roundRect(w - 238, h - 96, 210, 64, 10);
    ctx.fill();
    ctx.fillStyle = "#5e4338";
    ctx.font = "800 12px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "left";
    ctx.fillText("视图：" + activeView.name + " / " + activeView.formula, w - 222, h - 70);
    ctx.fillStyle = "#d63b1d";
    ctx.fillText("冲突：" + m.shared + "  评分：" + m.score, w - 222, h - 48);
    ctx.restore();
  }
  function hitEdge(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const pos = new Map(nodes.map(n => [n.id, nodePosition(n, rect.width, rect.height)]));
    let best = null;
    let bestDist = 12;
    allEdges.forEach(edge => {
      const a = pos.get(edge.u), b = pos.get(edge.v);
      const dx = b.x - a.x, dy = b.y - a.y;
      const len2 = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / len2));
      const px = a.x + t * dx, py = a.y + t * dy;
      const d = Math.hypot(x - px, y - py);
      if (d < bestDist) {
        bestDist = d;
        best = edge;
      }
    });
    return best;
  }
  function renderSummary() {
    const s = ensureState();
    const m = metrics(s);
    const activeView = views[s.view] || views.original;
    vizText.innerHTML = '<div class="graph-summary"><b>网络推演：</b>' + esc(s.last) +
      '<br><span class="traffic-view-chip">' + esc(activeView.formula) + '</span>' + esc(activeView.hint) +
      '<table class="traffic-metrics"><tr><td>共用冲突</td><td>' + m.shared +
      '</td></tr><tr><td>潜在改造</td><td>' + m.potential +
      '</td></tr><tr><td>平均通行代价</td><td>' + m.avg +
      '</td></tr><tr><td>网络评分</td><td>' + m.score + '</td></tr></table></div>';
    if (formulaText) formulaText.textContent = activeView.formula + " · conflicts=" + m.shared;
    if (resultValue) resultValue.innerHTML = '<span class="truth-chip' + (m.shared <= (isExtend ? 3 : 5) ? "" : " false") + '">' + (m.shared <= (isExtend ? 3 : 5) ? "路网较顺畅" : "存在瓶颈") + "</span>";
    if (resultExtra) resultExtra.innerHTML = "网络观察：通过集合运算识别共用冲突、专用通道与潜在改造路段，再用参数扰动比较优化前后的通行代价。";
    const auto = controls.querySelector('[data-traffic-action="auto"]');
    if (auto) auto.textContent = timer ? "暂停巡检" : "自动巡检";
  }
  function render() {
    draw();
    renderSummary();
  }
  function controlsHtml() {
    return '<div class="control-group"><label><span>网络视图</span><small>对应进阶层集合运算</small></label><select id="trafficView" data-traffic-case>' +
      Object.keys(views).map(key => '<option value="' + key + '">' + esc(views[key].name + " · " + views[key].formula) + "</option>").join("") +
      '</select></div>' +
      '<div class="control-group"><label><span>' + (isExtend ? "交通流压力" : "拥堵压力") + '</span><small>改变共用路段代价</small></label><input id="trafficPressure" data-traffic-case type="range" min="1" max="5" step="1" value="' + (isExtend ? 4 : 3) + '"></div>' +
      '<div class="control-group"><label><span>' + (isExtend ? "网络流协调" : "信号协调") + '</span></label><div class="switch-row"><span>' + (isExtend ? "容量约束 / 分流" : "降低冲突代价") + '</span><input id="trafficCoordinate" data-traffic-case type="checkbox" ' + (isExtend ? "checked" : "") + '></div></div>' +
      '<div class="control-group"><label><span>互动操作</span><small>点击道路也可调整归属</small></label><div class="traffic-actions"><button class="traffic-action primary" type="button" data-traffic-action="scan">巡检一步</button><button class="traffic-action" type="button" data-traffic-action="auto">自动巡检</button><button class="traffic-action warn" type="button" data-traffic-action="optimize">优化冲突</button><button class="traffic-action" type="button" data-traffic-action="reset">重置路网</button></div></div>';
  }

  injectStyle();
  initNetwork();
  controls.innerHTML = controlsHtml();
  resetState();

  controls.addEventListener("input", event => {
    if (!event.target.closest("[data-traffic-case]")) return;
    event.stopImmediatePropagation();
    ensureState();
    render();
  }, true);
  controls.addEventListener("change", event => {
    if (!event.target.closest("[data-traffic-case]")) return;
    event.stopImmediatePropagation();
    ensureState();
    render();
  }, true);
  controls.addEventListener("click", event => {
    const button = event.target.closest("[data-traffic-action]");
    if (!button) return;
    event.preventDefault();
    const action = button.dataset.trafficAction;
    if (action === "scan") scanStep();
    if (action === "auto") toggleAuto();
    if (action === "optimize") optimizeConflicts();
    if (action === "reset") { resetState(); render(); }
  });
  canvas.addEventListener("click", event => {
    const edge = hitEdge(event);
    if (edge) cycleEdge(edge);
  });
  canvas.addEventListener("mousemove", event => {
    const edge = hitEdge(event);
    const id = edge ? edge.id : null;
    if (id === hoverEdge) return;
    hoverEdge = id;
    canvas.style.cursor = edge ? "pointer" : "default";
    render();
  });
  canvas.addEventListener("mouseleave", () => {
    hoverEdge = null;
    canvas.style.cursor = "default";
    render();
  });
  window.addEventListener("resize", render);
  render();
})();
