(function () {
  "use strict";

  const controls = document.getElementById("controls");
  const canvas = document.getElementById("graphCanvas");
  const vizText = document.getElementById("vizText");
  const formulaText = document.getElementById("formulaText");
  const resultValue = document.getElementById("resultValue");
  const resultExtra = document.getElementById("resultExtra");
  if (!controls || !canvas || !vizText) return;

  const ctx = canvas.getContext("2d");
  const isExtend = location.pathname.includes("extend");
  const nodes = [
    { id: 0, name: "救援中心", desc: "应急指挥调度中心", x: 400, y: 300, mark: "救", type: "center" },
    { id: 1, name: "A区", desc: "积水严重", x: 250, y: 150, mark: "A" },
    { id: 2, name: "B区", desc: "电力中断", x: 550, y: 150, mark: "B" },
    { id: 3, name: "C区", desc: "人员被困", x: 150, y: 300, mark: "C" },
    { id: 4, name: "D区", desc: "道路受阻", x: 650, y: 300, mark: "D" },
    { id: 5, name: "E区", desc: "物资短缺", x: 250, y: 450, mark: "E" },
    { id: 6, name: "F区", desc: "通讯中断", x: 550, y: 450, mark: "F" },
    { id: 7, name: "G区", desc: "临时安置点", x: 400, y: 550, mark: "G" },
    { id: 8, name: "H区", desc: "医疗救护点", x: 400, y: 50, mark: "H" }
  ];
  const baseRoads = [
    { u: 0, v: 1, w: 15, risk: 1 },
    { u: 0, v: 2, w: 20, risk: 1 },
    { u: 0, v: 3, w: 25, risk: 2 },
    { u: 0, v: 4, w: 30, risk: 3 },
    { u: 0, v: 5, w: 18, risk: 1 },
    { u: 0, v: 6, w: 22, risk: 2 },
    { u: 1, v: 3, w: 10, risk: 2 },
    { u: 1, v: 8, w: 12, risk: 1 },
    { u: 2, v: 4, w: 15, risk: 3 },
    { u: 2, v: 8, w: 18, risk: 1 },
    { u: 3, v: 5, w: 14, risk: 2 },
    { u: 4, v: 6, w: 16, risk: 3 },
    { u: 5, v: 7, w: 20, risk: 1 },
    { u: 6, v: 7, w: 25, risk: 2 },
    { u: 1, v: 2, w: 35, risk: 1 }
  ];

  let state = null;
  let timer = null;
  let hoverId = null;

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[ch]));
  }
  function node(id) { return nodes.find(item => item.id === Number(id)) || nodes[0]; }
  function edgeKey(a, b) { return Math.min(a, b) + "-" + Math.max(a, b); }
  function readSettings() {
    return {
      target: Number(document.getElementById("rescueTarget")?.value || (isExtend ? 7 : 6)),
      pressure: Number(document.getElementById("rescuePressure")?.value || (isExtend ? 4 : 3)),
      optimize: !!document.getElementById("rescueOptimize")?.checked
    };
  }
  function roadsFor(settings) {
    const pressure = Math.max(0, settings.pressure - 1);
    const roads = baseRoads.map((road, index) => {
      let extra = Math.ceil(road.risk * pressure * (isExtend ? 1.6 : 1));
      if (settings.optimize && [3, 8, 11, 13].includes(index)) extra = Math.max(0, extra - 3);
      return { ...road, w: road.w + extra, dynamic: extra };
    });
    if (settings.optimize) {
      roads.push({ u: 3, v: 7, w: isExtend ? 15 : 18, risk: 1, temp: true });
      roads.push({ u: 2, v: 6, w: isExtend ? 14 : 17, risk: 1, temp: true });
    }
    return roads;
  }
  function makeState() {
    const settings = readSettings();
    const roads = roadsFor(settings);
    const adj = Array.from({ length: nodes.length }, () => []);
    roads.forEach(road => {
      const key = edgeKey(road.u, road.v);
      adj[road.u].push({ to: road.v, w: road.w, key, temp: !!road.temp });
      adj[road.v].push({ to: road.u, w: road.w, key, temp: !!road.temp });
    });
    const dist = Array(nodes.length).fill(Infinity);
    dist[0] = 0;
    return {
      ...settings,
      roads,
      adj,
      dist,
      prev: Array(nodes.length).fill(-1),
      visited: new Set(),
      relaxed: new Set(),
      current: -1,
      done: false,
      log: "等待调度：先从救援中心出发，逐步固定当前最快路口。"
    };
  }
  function resetState() {
    stopAuto();
    state = makeState();
  }
  function ensureState() {
    const settings = readSettings();
    if (!state || state.target !== settings.target || state.pressure !== settings.pressure || state.optimize !== settings.optimize) {
      resetState();
    }
    return state;
  }
  function stopAuto() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  function routeTo(target) {
    const s = ensureState();
    if (!Number.isFinite(s.dist[target])) return [];
    const path = [];
    for (let cur = target; cur !== -1; cur = s.prev[cur]) path.push(cur);
    const route = path.reverse();
    return route[0] === 0 ? route : [];
  }
  function routeEdges(path) {
    const out = new Set();
    for (let i = 0; i < path.length - 1; i++) out.add(edgeKey(path[i], path[i + 1]));
    return out;
  }
  function step() {
    const s = ensureState();
    if (s.done) return;
    let u = -1;
    for (let i = 0; i < s.dist.length; i++) {
      if (!s.visited.has(i) && Number.isFinite(s.dist[i]) && (u < 0 || s.dist[i] < s.dist[u])) u = i;
    }
    s.relaxed = new Set();
    if (u < 0) {
      s.done = true;
      s.log = "所有可达路口都已处理，剩余节点暂不可达。";
      stopAuto();
      render();
      return;
    }
    s.current = u;
    s.visited.add(u);
    s.adj[u].forEach(road => {
      if (s.visited.has(road.to)) return;
      const next = s.dist[u] + road.w;
      if (next < s.dist[road.to]) {
        s.dist[road.to] = next;
        s.prev[road.to] = u;
        s.relaxed.add(road.key);
      }
    });
    s.log = "固定 " + node(u).name + "：当前最短时间 " + s.dist[u] + " 分钟，松弛相邻道路。";
    if (u === s.target) {
      s.done = true;
      s.log = "已抵达 " + node(u).name + "，最快救援路径可以执行。";
      stopAuto();
    }
    render();
  }
  function toggleAuto() {
    if (timer) {
      stopAuto();
      render();
      return;
    }
    step();
    timer = setInterval(() => {
      if (ensureState().done) {
        stopAuto();
        render();
      } else {
        step();
      }
    }, 720);
    render();
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
  function layout(w, h) {
    const padX = Math.max(66, w * 0.08);
    const padY = Math.max(50, h * 0.09);
    const usableW = Math.max(320, w - padX * 2);
    const usableH = Math.max(260, h - padY * 2);
    const out = new Map();
    nodes.forEach(item => {
      out.set(item.id, {
        x: padX + ((item.x - 120) / 560) * usableW,
        y: padY + ((item.y - 40) / 530) * usableH
      });
    });
    return out;
  }
  function hitNode(event) {
    const rect = canvas.getBoundingClientRect();
    const pos = layout(rect.width, rect.height);
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let hit = null;
    let best = 32;
    nodes.forEach(item => {
      const p = pos.get(item.id);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < best) {
        best = d;
        hit = item.id;
      }
    });
    return hit;
  }
  function draw() {
    const s = ensureState();
    const { w, h } = canvasSize();
    const pos = layout(w, h);
    const path = routeTo(s.target);
    const pathEdges = routeEdges(path);
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.fillStyle = "rgba(255,250,242,0.56)";
    roundRect(12, 12, w - 24, h - 24, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(116,55,31,0.12)";
    ctx.stroke();
    ctx.fillStyle = "#7c2d12";
    ctx.font = "800 18px 'Noto Serif SC', serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(isExtend ? "应急物流动态带权路网" : "灾区路网带权图", 28, 42);
    ctx.fillStyle = "#64748b";
    ctx.font = "13px 'Noto Serif SC', serif";
    ctx.fillText("权重=通行时间；橙色为本轮松弛，绿色为当前目标最快路径", 28, 64);
    s.roads.forEach(road => {
      const a = pos.get(road.u);
      const b = pos.get(road.v);
      const key = edgeKey(road.u, road.v);
      const inPath = pathEdges.has(key);
      const active = s.relaxed.has(key);
      ctx.save();
      ctx.strokeStyle = inPath ? "#2f7d57" : active ? "#f97316" : road.temp ? "#2563eb" : "rgba(116,55,31,0.24)";
      ctx.lineWidth = inPath ? 5 : active ? 4 : 2;
      ctx.setLineDash(road.temp && !inPath ? [8, 7] : []);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const label = road.w + "m";
      ctx.font = "800 12px 'JetBrains Mono', Consolas, monospace";
      const tw = ctx.measureText(label).width + 14;
      roundRect(mx - tw / 2, my - 11, tw, 22, 7);
      ctx.fillStyle = inPath ? "rgba(47,125,87,0.96)" : active ? "rgba(249,115,22,0.96)" : "rgba(255,255,255,0.92)";
      ctx.fill();
      ctx.strokeStyle = "rgba(116,55,31,0.14)";
      ctx.stroke();
      ctx.fillStyle = inPath || active ? "#fff" : "#7c2d12";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, mx, my);
    });
    nodes.forEach(item => {
      const p = pos.get(item.id);
      const isCenter = item.type === "center";
      const isTarget = item.id === s.target;
      const isCurrent = item.id === s.current;
      const isVisited = s.visited.has(item.id);
      const isHover = item.id === hoverId;
      const r = isTarget || isCurrent ? 24 : 21;
      ctx.save();
      ctx.shadowColor = isTarget ? "rgba(180,35,24,0.28)" : "rgba(116,55,31,0.14)";
      ctx.shadowBlur = isTarget || isCurrent || isHover ? 18 : 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isCenter ? "#b42318" : isCurrent ? "#f97316" : isVisited ? "#2f7d57" : "#fff7ed";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = isTarget ? 4 : 2;
      ctx.strokeStyle = isTarget ? "#b42318" : isVisited ? "#2f7d57" : "rgba(116,55,31,0.24)";
      ctx.stroke();
      ctx.fillStyle = isCenter || isCurrent || isVisited ? "#fff" : "#7c2d12";
      ctx.font = "900 15px 'Noto Serif SC', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.mark, p.x, p.y);
      ctx.fillStyle = "#2d201b";
      ctx.font = "800 13px 'Noto Serif SC', serif";
      ctx.fillText(item.name, p.x, p.y + r + 17);
      ctx.fillStyle = Number.isFinite(s.dist[item.id]) ? "#b42318" : "#94a3b8";
      ctx.font = "800 11px 'JetBrains Mono', Consolas, monospace";
      ctx.fillText(Number.isFinite(s.dist[item.id]) ? s.dist[item.id] + "m" : "∞", p.x, p.y - r - 12);
      ctx.restore();
    });
    if (hoverId != null) {
      const item = node(hoverId);
      const p = pos.get(item.id);
      const text = item.name + " · " + item.desc;
      ctx.font = "800 13px 'Noto Serif SC', serif";
      const tw = ctx.measureText(text).width + 18;
      const x = Math.min(Math.max(18, p.x - tw / 2), w - tw - 18);
      const y = Math.max(18, p.y - 62);
      roundRect(x, y, tw, 34, 8);
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.fill();
      ctx.strokeStyle = "rgba(180,35,24,0.22)";
      ctx.stroke();
      ctx.fillStyle = "#7c2d12";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x + tw / 2, y + 17);
    }
    const target = node(s.target);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    roundRect(w - 236, h - 86, 208, 54, 10);
    ctx.fill();
    ctx.fillStyle = "#5e4338";
    ctx.font = "800 12px 'Noto Serif SC', serif";
    ctx.textAlign = "left";
    ctx.fillText("目标：" + target.name + " / " + target.desc, w - 220, h - 62);
    ctx.fillStyle = "#b42318";
    ctx.fillText("最快：" + (Number.isFinite(s.dist[s.target]) ? s.dist[s.target] + " 分钟" : "等待计算"), w - 220, h - 42);
    ctx.restore();
  }
  function renderSummary() {
    const s = ensureState();
    const target = node(s.target);
    const path = routeTo(s.target);
    const pathText = path.length ? path.map(id => node(id).name).join(" → ") : "等待算法松弛到目标";
    const fixed = Array.from(s.visited).map(id => node(id).name).join("、") || "尚未固定";
    const distText = Number.isFinite(s.dist[s.target]) ? s.dist[s.target] + " 分钟" : "∞";
    vizText.innerHTML =
      '<div class="graph-summary"><b>调度推演：</b>' + esc(s.log) +
      '<br><b>当前路径：</b>' + esc(pathText) +
      '<br><b>已确认：</b>' + esc(fixed) +
      '<table class="rescue-step-table"><tr><td>已固定路口</td><td>' + s.visited.size + '/' + nodes.length +
      '</td></tr><tr><td>当前目标</td><td>' + esc(target.name) +
      '</td></tr><tr><td>最快估计</td><td>' + esc(distText) + '</td></tr></table></div>';
    if (formulaText) formulaText.textContent = "dist[" + target.name + "] = " + distText;
    if (resultValue) resultValue.innerHTML = '<span class="truth-chip' + (s.done ? "" : " false") + '">' + (s.done ? "路径可执行" : "推演中") + "</span>";
    if (resultExtra) {
      resultExtra.innerHTML = '<b>价值观察：</b>' + (isExtend
        ? "动态权重让同一张图随灾情变化，算法要服务多目标决策。"
        : "先建立带权图直觉，再观察 Dijkstra 如何把最快路径一步步固定下来。");
    }
  }
  function syncButtons() {
    const s = ensureState();
    const stepBtn = controls.querySelector('[data-rescue-action="step"]');
    const autoBtn = controls.querySelector('[data-rescue-action="auto"]');
    if (stepBtn) stepBtn.disabled = s.done;
    if (autoBtn) autoBtn.textContent = timer ? "暂停调度" : "自动调度";
  }
  function render() {
    draw();
    renderSummary();
    syncButtons();
  }
  function controlHtml() {
    const options = nodes.filter(item => item.id !== 0)
      .map(item => '<option value="' + item.id + '"' + (item.id === (isExtend ? 7 : 6) ? " selected" : "") + ">" + esc(item.name + " · " + item.desc) + "</option>")
      .join("");
    return (
      '<div class="control-group"><label><span>' + (isExtend ? "配送优先节点" : "救援目标节点") +
      '</span><small>点击图上节点也可切换</small></label><select id="rescueTarget" data-rescue-case>' + options + '</select></div>' +
      '<div class="control-group"><label><span>' + (isExtend ? "动态路况压力" : "道路风险压力") +
      '</span><small>改变边权，重算路径</small></label><input type="range" id="rescuePressure" data-rescue-case min="1" max="5" step="1" value="' + (isExtend ? 4 : 3) + '"></div>' +
      '<div class="control-group"><label><span>' + (isExtend ? "启用多目标调度" : "启用临时通道") +
      '</span></label><div class="switch-row"><span>蓝色虚线通道</span><input type="checkbox" id="rescueOptimize" data-rescue-case ' + (isExtend ? "checked" : "") + '></div></div>' +
      '<div class="control-group"><label><span>调度操作</span><small>观察固定节点、松弛边与最终路径</small></label>' +
      '<div class="rescue-actions"><button class="rescue-action primary" type="button" data-rescue-action="step">调度一步</button>' +
      '<button class="rescue-action" type="button" data-rescue-action="auto">自动调度</button>' +
      '<button class="rescue-action" type="button" data-rescue-action="reset">重置路网</button>' +
      '<button class="rescue-action warn" type="button" data-rescue-action="pressure">模拟堵塞</button></div></div>'
    );
  }

  controls.innerHTML = controlHtml();
  controls.addEventListener("input", event => {
    if (!event.target.closest("[data-rescue-case]")) return;
    event.stopImmediatePropagation();
    resetState();
    render();
  }, true);
  controls.addEventListener("change", event => {
    if (!event.target.closest("[data-rescue-case]")) return;
    event.stopImmediatePropagation();
    resetState();
    render();
  }, true);
  controls.addEventListener("click", event => {
    const button = event.target.closest("[data-rescue-action]");
    if (!button) return;
    event.preventDefault();
    const action = button.dataset.rescueAction;
    if (action === "step") step();
    if (action === "auto") toggleAuto();
    if (action === "reset") {
      resetState();
      render();
    }
    if (action === "pressure") {
      const pressure = document.getElementById("rescuePressure");
      if (pressure) pressure.value = Math.min(5, Number(pressure.value) + 1);
      resetState();
      render();
    }
  });
  canvas.addEventListener("click", event => {
    const hit = hitNode(event);
    if (hit == null || hit === 0) return;
    const target = document.getElementById("rescueTarget");
    if (target) target.value = String(hit);
    resetState();
    render();
  });
  canvas.addEventListener("mousemove", event => {
    const hit = hitNode(event);
    if (hit === hoverId) return;
    hoverId = hit;
    canvas.style.cursor = hit != null && hit !== 0 ? "pointer" : "default";
    render();
  });
  canvas.addEventListener("mouseleave", () => {
    hoverId = null;
    canvas.style.cursor = "default";
    render();
  });
  window.addEventListener("resize", render);

  resetState();
  render();
})();
