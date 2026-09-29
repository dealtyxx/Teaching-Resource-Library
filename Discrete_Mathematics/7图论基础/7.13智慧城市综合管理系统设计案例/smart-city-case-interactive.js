/* ============================================================
   7.13 智慧城市综合管理系统设计案例 · 三层统一案例引擎
   页面通过 <body data-layer="basic|advanced|extend"> 区分层级：
   基础层 认识模型：设施→顶点、层内/跨层联动边、度与握手定理、BFS 连通判定、跨层边与“信息孤岛”
   进阶层 求解模型：Dijkstra 最短联动路径、度中心性、割点（关键枢纽）检测与备用联络线
   拓展层 拓展模型：相依网络、级联失效（依赖图可达集）、残余网络连通性与韧性加固对比
   ============================================================ */
(function () {
  "use strict";

  const LEVEL = document.body.getAttribute("data-layer") || "advanced";
  const $ = id => document.getElementById(id);
  const controls = $("controls");
  const graphBox = $("graphBox");
  if (!controls || !graphBox) return;

  const SVGNS = "http://www.w3.org/2000/svg";
  const C = { red: "#D63B1D", gold: "#FFB400", ink: "#2C1810", muted: "#6B4A38", green: "#1F9D55", paper: "#FFFBF0", edge: "rgba(107,74,56,0.42)", grey: "#9B8B80", bad: "#C0392B" };

  /* ---------- 数据：同一座城市逐层加深 ---------- */
  const NODES = [
    { code: "C", name: "城市大脑" }, { code: "T", name: "交通指挥" }, { code: "M", name: "地铁枢纽" },
    { code: "P", name: "变电站" }, { code: "W", name: "水厂" }, { code: "G", name: "政务中心" },
    { code: "H", name: "医院" }, { code: "F", name: "消防站" }, { code: "S", name: "社区网格" }, { code: "B", name: "通信基站" }
  ];
  const LANES = {
    basic: [["交通层", .14], ["中枢", .40], ["能源层", .64], ["民生层", .88]],
    advanced: [["交通层", .12], ["中枢 · 政务", .36], ["能源层", .62], ["民生 · 应急", .88]],
    extend: [["交通层", .12], ["中枢 · 政务", .36], ["能源 · 通信", .62], ["民生 · 应急", .88]]
  };
  const POS = {
    basic: { 0: [.12, .40], 1: [.30, .14], 2: [.72, .14], 3: [.32, .64], 4: [.66, .64], 6: [.36, .88], 8: [.80, .88] },
    advanced: { 0: [.10, .36], 1: [.30, .12], 2: [.68, .12], 5: [.46, .36], 3: [.22, .62], 4: [.44, .62], 7: [.36, .88], 6: [.62, .88], 8: [.88, .88] },
    extend: { 0: [.10, .36], 1: [.30, .12], 2: [.68, .12], 5: [.46, .36], 3: [.24, .62], 4: [.46, .62], 9: [.06, .62], 7: [.36, .88], 6: [.62, .88], 8: [.88, .88] }
  };
  const LINKS = {
    basic: [[1, 2, 1, "in"], [3, 4, 1, "in"], [6, 8, 1, "in"], [0, 1, 1, "x"], [0, 3, 1, "x"], [0, 6, 1, "x"], [2, 8, 1, "x"], [4, 8, 1, "x"]],
    advanced: [[0, 1, 2], [0, 3, 3], [0, 5, 2], [1, 2, 3], [1, 7, 4], [2, 8, 3], [3, 4, 2], [3, 6, 4], [5, 8, 2], [5, 6, 4], [6, 7, 3], [6, 8, 5]],
    extend: [[0, 1, 2], [0, 3, 3], [0, 5, 2], [1, 2, 3], [1, 7, 4], [2, 8, 3], [3, 4, 2], [3, 6, 4], [5, 8, 2], [5, 6, 4], [6, 7, 3], [6, 8, 5], [0, 9, 1], [9, 7, 3]]
  };
  /* 依赖边 ⟨u,v⟩：v 的运行依赖 u 的供给（u 失效 ⟹ v 失效） */
  const DEPS = [[3, 4, "供电"], [3, 2, "供电"], [3, 9, "供电"], [3, 6, "供电"], [9, 1, "通信"], [9, 7, "通信"], [4, 6, "供水"], [4, 8, "供水"]];
  const HARDEN = ["3-9", "3-6", "4-6"];
  const BACKUP = [4, 8, 4];

  const CFG = {
    basic: {
      label: "基础层", tier: "认识模型", stage: "城市设施多层网络",
      mission: "把城市设施画成多层网络，区分层内边与跨层边，数度数、判连通，看看拆掉跨层边会发生什么。",
      badge: "多层网络 · 连通",
      hint: "点“下一步”：顶点 → 层内边 → 跨层边 → 度 → BFS 连通 → 信息孤岛；点击顶点查看它的邻居"
    },
    advanced: {
      label: "进阶层", tier: "求解模型", stage: "城市联动网络 · 最短路与枢纽",
      mission: "用 Dijkstra 求城市大脑到事件点的最短联动路径，再比较度中心性与割点，找出真正的关键枢纽。",
      badge: "Dijkstra + 割点",
      hint: "左侧可切换事件点、加装备用联络线；点击顶点也可设为事件点"
    },
    extend: {
      label: "拓展层", tier: "拓展模型", stage: "城市大脑 · 级联失效推演",
      mission: "在“联动网络 + 依赖网络”的相依模型上推演一处故障如何级联扩散，评估残余网络并比较韧性加固效果。",
      badge: "相依网络 + 可达集",
      hint: "左侧可选择初始故障设施、开启韧性加固；点击顶点也可设为初始故障点"
    }
  };
  const cfg = CFG[LEVEL] || CFG.advanced;
  const IDS = Object.keys(POS[LEVEL]).map(Number).sort((a, b) => a - b);

  const state = { step: 0, timer: null, speed: 1, picked: null, note: "", noteBadge: "", cut: "", target: 6, backup: false, fail: 3, harden: false };

  /* ---------- 工具 ---------- */
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  const code = i => NODES[i].code;
  const nm = i => NODES[i].code + " " + NODES[i].name;
  const ekey = (u, v) => Math.min(u, v) + "-" + Math.max(u, v);
  const ft = (t, cls) => '<span class="ft ' + (cls || "hot") + '">' + t + "</span>";
  const list = arr => arr.length ? arr.join("，") : "无";
  const setTxt = s => "{" + s.map(code).join(", ") + "}";

  function links() {
    let E = LINKS[LEVEL].map(e => ({ u: e[0], v: e[1], w: e[2], kind: e[3] || "" }));
    if (LEVEL === "advanced" && state.backup) E.push({ u: BACKUP[0], v: BACKUP[1], w: BACKUP[2], kind: "backup" });
    if (LEVEL === "basic" && state.cut) E = E.filter(e => ekey(e.u, e.v) !== state.cut);
    return E;
  }
  function deps(harden) { return DEPS.filter(d => !(harden && HARDEN.includes(d[0] + "-" + d[1]))).map(d => ({ u: d[0], v: d[1], what: d[2] })); }
  function nbrs(E, i, alive) { return E.filter(e => (e.u === i || e.v === i)).map(e => (e.u === i ? e.v : e.u)).filter(j => !alive || alive.has(j)); }
  function degree(E, i) { return E.filter(e => e.u === i || e.v === i).length; }
  function bfsLayers(E, s, alive) {
    const seen = new Set([s]);
    const layers = [[s]];
    for (;;) {
      const nx = [];
      layers[layers.length - 1].forEach(u => nbrs(E, u, alive).sort((a, b) => a - b).forEach(v => { if (!seen.has(v)) { seen.add(v); nx.push(v); } }));
      if (!nx.length) break;
      layers.push(nx);
    }
    return { layers, seen };
  }
  function components(E, nodes) {
    const alive = new Set(nodes);
    const left = new Set(nodes);
    const comps = [];
    nodes.forEach(s => {
      if (!left.has(s)) return;
      const r = bfsLayers(E, s, alive).seen;
      r.forEach(x => left.delete(x));
      comps.push(Array.from(r).sort((a, b) => a - b));
    });
    return comps;
  }
  function dijkstra(E, s, alive) {
    const nodes = alive ? IDS.filter(i => alive.has(i)) : IDS;
    const d = {};
    const prev = {};
    nodes.forEach(i => { d[i] = Infinity; });
    d[s] = 0;
    const done = new Set();
    const trace = [];
    while (done.size < nodes.length) {
      let u = null;
      nodes.forEach(i => { if (!done.has(i) && (u === null || d[i] < d[u])) u = i; });
      if (u === null || d[u] === Infinity) break;
      done.add(u);
      const relax = [];
      E.filter(e => (e.u === u || e.v === u)).forEach(e => {
        const v = e.u === u ? e.v : e.u;
        if (!(v in d) || done.has(v)) return;
        if (d[u] + e.w < d[v]) { relax.push([v, d[v], d[u] + e.w]); d[v] = d[u] + e.w; prev[v] = u; }
      });
      trace.push({ u, du: d[u], relax, d: Object.assign({}, d), done: Array.from(done) });
    }
    return { d, prev, trace };
  }
  function pathTo(prev, s, t) {
    const p = [t];
    while (p[0] !== s) { if (prev[p[0]] == null) return []; p.unshift(prev[p[0]]); }
    return p;
  }
  function pathEdges(p) { const m = {}; for (let i = 0; i + 1 < p.length; i += 1) m[ekey(p[i], p[i + 1])] = "res"; return m; }
  function cutVertices(E) {
    const base = components(E, IDS).length;
    return IDS.map(x => {
      const rest = IDS.filter(i => i !== x);
      const comps = components(E.filter(e => e.u !== x && e.v !== x), rest);
      return { x, comps, cut: comps.length > base };
    });
  }
  function cascade(src, harden) {
    const D = deps(harden);
    const failed = new Set([src]);
    const rounds = [[src]];
    for (;;) {
      const nx = [];
      rounds[rounds.length - 1].forEach(u => D.filter(d => d.u === u).forEach(d => { if (!failed.has(d.v)) { failed.add(d.v); nx.push(d.v); } }));
      if (!nx.length) break;
      rounds.push(nx.sort((a, b) => a - b));
    }
    return { rounds, failed, D };
  }

  /* ---------- 分析与步骤 ---------- */
  let MODEL = null;
  let lastW = 0;
  function analyze() {
    const E = links();
    const M = { E };
    M.steps = LEVEL === "basic" ? basicSteps(M) : LEVEL === "extend" ? extendSteps(M) : advancedSteps(M);
    MODEL = M;
    if (state.step >= M.steps.length) state.step = M.steps.length - 1;
  }
  function allNodes(st) { const m = {}; IDS.forEach(i => { m[i] = st; }); return m; }

  function basicSteps(M) {
    const E = M.E;
    const inE = E.filter(e => e.kind === "in");
    const xE = E.filter(e => e.kind === "x");
    const steps = [];
    steps.push({
      name: "设施即顶点", badge: "建模", view: { hide: true },
      formula: "V = " + setTxt(IDS) + "，" + ft("|V| = " + IDS.length),
      text: "把城市里的 " + IDS.length + " 个关键设施各抽象为一个顶点：" + IDS.map(nm).join("、") + "。背景色带表示它们分属交通、能源、民生三个子系统，城市大脑居中统筹。",
      data: "nodes"
    });
    steps.push({
      name: "层内联动边", badge: "层内",
      view: { only: inE, edges: Object.fromEntries(inE.map(e => [ekey(e.u, e.v), "hot"])) },
      formula: "层内边 " + ft(inE.length + " 条") + "：" + inE.map(e => code(e.u) + "–" + code(e.v)).join("，"),
      text: "同一子系统内部的日常联动（如交通指挥调度地铁枢纽）画成无向边。只有层内边时，各子系统各管各的。",
      data: "edges"
    });
    steps.push({
      name: "跨层联动边", badge: "跨层", tone: "gold",
      view: { edges: Object.fromEntries(xE.map(e => [ekey(e.u, e.v), "hot"])) },
      formula: "跨层边 " + ft(xE.length + " 条") + "；G = ⟨V, E⟩，" + ft("|E| = " + E.length),
      text: "城市大脑与各子系统、以及不同子系统之间（如地铁枢纽—社区网格的客流疏导、水厂—社区网格的供水保障）的联动是跨层边（红色）。多层网络 = 各层子图 + 跨层边。" + (state.cut ? "（当前已断开 " + state.cut.split("-").map(Number).map(code).join("–") + "）" : ""),
      data: "edges"
    });
    const degs = IDS.map(i => degree(E, i));
    const maxd = Math.max.apply(null, degs);
    steps.push({
      name: "度与握手定理", badge: "度",
      view: { tags: Object.fromEntries(IDS.map((i, k) => [i, "d=" + degs[k]])), nodes: Object.fromEntries(IDS.filter((i, k) => degs[k] === maxd).map(i => [i, "cur"])) },
      formula: "Σd(v) = " + degs.join("+") + " = " + ft(String(degs.reduce((a, b) => a + b, 0))) + " = 2|E| = 2×" + E.length,
      text: "顶点的度 = 与它相连的联动边数。度最大的是 " + IDS.filter((i, k) => degs[k] === maxd).map(nm).join("、") + "（" + maxd + "）。每条边给两端各贡献 1 度，所以度数之和恰为边数的 2 倍（握手定理）。",
      data: "deg"
    });
    const bf = bfsLayers(E, 0);
    bf.layers.forEach((layer, k) => {
      const nodes = {};
      bf.layers.slice(0, k).flat().forEach(i => { nodes[i] = "done"; });
      layer.forEach(i => { nodes[i] = "cur"; });
      const edges = {};
      if (k > 0) layer.forEach(v => { const u = bf.layers[k - 1].find(x => nbrs(E, x).includes(v)); edges[ekey(u, v)] = "hot"; });
      const reached = bf.layers.slice(0, k + 1).flat();
      const last = k === bf.layers.length - 1;
      steps.push({
        name: "BFS 连通判定 · 第 " + k + " 层", badge: "BFS " + k, tone: last ? (bf.seen.size === IDS.length ? "ok" : "bad") : "gold",
        view: { nodes, edges },
        formula: "第 " + k + " 层：" + setTxt(layer) + "；已到达 " + ft(reached.length + " / " + IDS.length, last ? "ok" : "gold"),
        text: k === 0 ? "从城市大脑 C 出发做广度优先搜索：先访问 C 本身。" :
          (last ? (bf.seen.size === IDS.length ? "再也找不到新顶点，而全部 " + IDS.length + " 个设施都已到达：从 C 出发处处可达，城市网络是连通图。" : "已无新顶点可达，还有 " + (IDS.length - bf.seen.size) + " 个设施到不了：网络不连通。") :
            "访问上一层顶点的全部未访问邻居。"),
        data: "bfs", layers: bf.layers.slice(0, k + 1)
      });
    });
    const inOnly = E.filter(e => e.kind === "in");
    const comps = components(inOnly, IDS);
    const cutMap = {};
    xE.forEach(e => { cutMap[ekey(e.u, e.v)] = "fail"; });
    const tags = {};
    comps.forEach((c, k) => c.forEach(i => { tags[i] = "分支" + "①②③④⑤⑥⑦"[k]; }));
    steps.push({
      name: "拆掉跨层边", badge: "孤岛", tone: "bad",
      view: { edges: cutMap, tags },
      formula: "删去 " + xE.length + " 条跨层边后，连通分支数 " + ft("ω = " + comps.length) + "：" + comps.map(setTxt).join("，"),
      text: "只剩层内边时，网络碎成 " + comps.length + " 块：交通、能源、民生各成孤岛，城市大脑成了孤立点——这就是“信息孤岛”在图上的样子。",
      data: "comps", comps
    });
    steps.push({
      name: "结论：跨层边的价值", badge: "结论", tone: "ok",
      view: { edges: Object.fromEntries(xE.map(e => [ekey(e.u, e.v), "res"])), nodes: allNodes("done") },
      formula: "有跨层边：" + ft(bf.seen.size === IDS.length ? "连通（ω = 1）" : "不连通", "ok") + "；无跨层边：ω = " + comps.length,
      text: "“一网统管”的数学本质是让城市网络连通：跨层边（绿色）把各子系统连成一个整体，数据与指令才能从城市大脑到达每个设施。左侧可以断开一条边，检验网络还连不连通。",
      data: "deg"
    });
    M.result = { connected: bf.seen.size === IDS.length, comps: comps.length, maxd, hubs: IDS.filter((i, k) => degs[k] === maxd) };
    return steps;
  }

  function advancedSteps(M) {
    const E = M.E;
    const steps = [];
    steps.push({
      name: "建模：赋权联动网络", badge: "建模",
      formula: "G = ⟨V, E, w⟩，|V| = " + IDS.length + "，|E| = " + E.length + "，w = 联动响应时间 (min)",
      text: "顶点 = 设施，无向边 = 可直接联动，边权 = 一次联动所需时间。本层回答两个问题：① 城市大脑到事件点最快多久能联动到位？② 哪些设施是“牵一发而动全身”的关键枢纽？" + (state.backup ? "（已加装备用联络线 W–S）" : ""),
      data: "edges"
    });
    const dj = dijkstra(E, 0);
    const inf = IDS.filter(i => i !== 0);
    steps.push({
      name: "Dijkstra 初始化", badge: "初始", tone: "gold",
      view: { nodes: { 0: "cur" }, tags: Object.fromEntries(IDS.map(i => [i, i === 0 ? "0" : "∞"])) },
      formula: "d(C) = 0，d(" + inf.map(code).join(", ") + ") = ∞",
      text: "从城市大脑 C 出发。每一步从“尚未确定”的顶点中选 d 最小者，把它确定下来，再用它去更新（松弛）邻居的 d。边权非负，所以被确定的 d 不会再变小。",
      data: "dist", d: Object.fromEntries(IDS.map(i => [i, i === 0 ? 0 : Infinity])), done: []
    });
    dj.trace.forEach((t, k) => {
      const nodes = {};
      t.done.forEach(i => { nodes[i] = "done"; });
      nodes[t.u] = "cur";
      const edges = {};
      t.done.forEach(v => { if (dj.prev[v] != null && v !== t.u) edges[ekey(v, dj.prev[v])] = "res"; });
      t.relax.forEach(r => { edges[ekey(t.u, r[0])] = "hot"; });
      steps.push({
        name: "确定 " + code(t.u) + "（d = " + t.du + "）", badge: "第 " + (k + 1) + " 个", tone: "gold",
        view: { nodes, edges, tags: Object.fromEntries(IDS.map(i => [i, t.d[i] === Infinity ? "∞" : String(t.d[i])])) },
        formula: "确定 " + ft(code(t.u) + "：d = " + t.du, "gold") + "；松弛 " + (t.relax.length ? t.relax.map(r => code(r[0]) + "：" + (r[1] === Infinity ? "∞" : r[1]) + "→" + r[2]).join("，") : "无更新"),
        text: nm(t.u) + " 是未确定顶点中 d 最小的" + (k === 0 ? "（起点）" : "") + "，它的最短联动时间就是 " + t.du + " min。" + (t.relax.length ? "经 " + code(t.u) + " 转联动更快的邻居被更新（红色边）。" : "它的邻居都没有被改进。"),
        data: "dist", d: t.d, done: t.done, cur: t.u
      });
    });
    const tgt = state.target;
    const p = pathTo(dj.prev, 0, tgt);
    const ws = [];
    for (let i = 0; i + 1 < p.length; i += 1) ws.push(E.find(e => ekey(e.u, e.v) === ekey(p[i], p[i + 1])).w);
    const pn = {};
    p.forEach(i => { pn[i] = "done"; });
    steps.push({
      name: "最短联动路径", badge: code(tgt), tone: "ok",
      view: { nodes: pn, edges: pathEdges(p), dimOthers: true, tags: Object.fromEntries(IDS.map(i => [i, String(dj.d[i])])) },
      formula: "C → " + NODES[tgt].name + "：" + ft(p.map(code).join("→"), "ok") + "，" + ws.join(" + ") + " = " + ft(dj.d[tgt] + " min", "ok"),
      text: "沿前驱指针从事件点倒推回城市大脑，得到最短联动路径。左侧可切换事件点；所有设施的最短联动时间见下方距离表——这张表就是一棵以 C 为根的最短路径树。",
      data: "dist", d: dj.d, done: IDS, path: p
    });
    const degs = {};
    IDS.forEach(i => { degs[i] = degree(E, i); });
    const rank = IDS.slice().sort((a, b) => degs[b] - degs[a] || a - b);
    const maxd = degs[rank[0]];
    steps.push({
      name: "度中心性", badge: "度", tone: "gold",
      view: { tags: Object.fromEntries(IDS.map(i => [i, "d=" + degs[i]])), nodes: Object.fromEntries(rank.filter(i => degs[i] === maxd).map(i => [i, "cur"])) },
      formula: "度排序：" + rank.map(i => code(i) + "(" + degs[i] + ")").join(" ≥ "),
      text: "度中心性看“直接联动的对象多不多”：" + rank.filter(i => degs[i] === maxd).map(nm).join("、") + " 的度最大（" + maxd + "）。但度大就一定最关键吗？下一步用割点检验。",
      data: "deg", degs
    });
    const cv = cutVertices(E);
    const cuts = cv.filter(c => c.cut);
    const cnodes = {};
    const cedges = {};
    cuts.forEach(c => {
      cnodes[c.x] = "cur";
      c.comps.filter(comp => comp.length < IDS.length / 2).forEach(comp => comp.forEach(i => { cnodes[i] = "fail"; }));
      E.filter(e => e.u === c.x || e.v === c.x).forEach(e => { cedges[ekey(e.u, e.v)] = "hot"; });
    });
    steps.push({
      name: "割点：真正的关键枢纽", badge: cuts.length ? "割点" : "无割点", tone: cuts.length ? "bad" : "ok",
      view: { nodes: cnodes, edges: cedges },
      formula: cuts.length ? "删去 " + cuts.map(c => code(c.x)).join("、") + " 后 ω：1 → " + cuts.map(c => c.comps.length).join("、") + " ⟹ " + ft("割点 = " + setTxt(cuts.map(c => c.x))) : "逐个删去顶点，ω 始终为 1 ⟹ " + ft("无割点（2-连通）", "ok"),
      text: cuts.length
        ? cuts.map(c => nm(c.x) + " 删去后分成 " + c.comps.map(setTxt).join(" 与 ")).join("；") + "。它的度只有 " + cuts.map(c => degs[c.x]).join("、") + "，却是水厂联入城市网络的唯一通道——度大不等于关键，割点才是单点故障所在。勾选左侧「备用联络线 W–S」消除它。"
        : "加装备用联络线后，删去任何一个设施，其余设施仍然连通：网络没有单点故障。这正是城市基础设施“双回路 / 环网”设计的图论依据。",
      data: "cut", cv
    });
    M.result = { d: dj.d, path: p, tgt, rank, maxd, cuts: cuts.map(c => c.x) };
    return steps;
  }

  function extendSteps(M) {
    const E = M.E;
    const steps = [];
    const cas = cascade(state.fail, state.harden);
    const other = cascade(state.fail, !state.harden);
    steps.push({
      name: "相依网络模型", badge: "建模",
      view: { deps: cas.D },
      formula: "联动网络 G（无向，|E| = " + E.length + "）+ 依赖网络 D（有向，" + ft("|D| = " + cas.D.length) + "）",
      text: "城市设施之间除了“可以联动”（实线），还有“靠谁运行”（虚线箭头 ⟨u,v⟩：v 依赖 u 的供电 / 供水 / 通信）。u 失效时，依赖它的 v 也随之失效——故障沿依赖网络传播。" + (state.harden ? "已开启韧性加固：基站与医院配备备用电源、医院配备应急储水，对应依赖边被移除。" : ""),
      data: "deps"
    });
    const failedSoFar = [];
    cas.rounds.forEach((r, k) => {
      const nodes = {};
      failedSoFar.forEach(i => { nodes[i] = "fail"; });
      r.forEach(i => { nodes[i] = "cur"; });
      const hot = {};
      if (k > 0) r.forEach(v => { const d = cas.D.find(x => x.v === v && cas.rounds[k - 1].includes(x.u)); if (d) hot[d.u + ">" + d.v] = "hot"; });
      const last = k === cas.rounds.length - 1;
      steps.push({
        name: k === 0 ? "初始故障：" + code(state.fail) : "级联第 " + k + " 轮", badge: "F" + k, tone: k === 0 ? "bad" : "gold",
        view: { nodes, deps: cas.D, depHot: hot },
        formula: k === 0 ? "F₀ = " + ft(setTxt(r)) + "（" + NODES[state.fail].name + "突发故障）" : "F" + "₀₁₂₃₄₅"[k] + " = { v | ⟨u,v⟩ ∈ D，u ∈ F" + "₀₁₂₃₄₅"[k - 1] + " } − 已失效 = " + ft(setTxt(r), "gold"),
        text: k === 0 ? nm(state.fail) + " 停止运行。沿依赖边（虚线箭头）看，谁靠它运行？" :
          r.map(v => { const d = cas.D.find(x => x.v === v && cas.rounds[k - 1].includes(x.u)); return nm(v) + " 失去" + NODES[d.u].name + "的" + d.what; }).join("；") + "。" + (last ? "" : "继续传播……"),
        data: "rounds", upto: k
      });
      r.forEach(i => failedSoFar.push(i));
    });
    const F = Array.from(cas.failed).sort((a, b) => a - b);
    const fn = {};
    F.forEach(i => { fn[i] = "fail"; });
    steps.push({
      name: "级联终止：可达集", badge: F.length + "/" + IDS.length, tone: "bad",
      view: { nodes: fn, deps: cas.D },
      formula: "F = D 中从 " + code(state.fail) + " 出发可达的顶点集 = " + ft(setTxt(F)) + "，失效率 " + F.length + "/" + IDS.length,
      text: "再没有新的失效，级联停止。最终失效集合恰好是依赖图中从故障点出发的可达集——与 7.6 的可达性、7.7 的可达矩阵是同一个数学对象。",
      data: "rounds", upto: cas.rounds.length - 1
    });
    const alive = new Set(IDS.filter(i => !cas.failed.has(i)));
    const aliveArr = Array.from(alive);
    const comps = components(E, aliveArr);
    const dj = alive.has(0) ? dijkstra(E, 0, alive) : null;
    const reachH = dj && alive.has(6) && dj.d[6] < Infinity;
    const p = reachH ? pathTo(dj.prev, 0, 6) : [];
    const sn = Object.assign({}, fn);
    p.forEach(i => { sn[i] = "done"; });
    steps.push({
      name: "残余网络连通性", badge: reachH ? "可救援" : "救援中断", tone: reachH ? "ok" : "bad",
      view: { nodes: sn, edges: pathEdges(p) },
      formula: "残余顶点 " + setTxt(aliveArr) + "，连通分支 ω = " + comps.length + "；C → H：" + (reachH ? ft(p.map(code).join("→") + "，" + dj.d[6] + " min", "ok") : ft(!alive.has(0) ? "城市大脑已失效" : alive.has(6) ? "不可达" : "医院已失效")),
      text: "删去失效设施后，在剩下的联动网络上重新判断连通性，并求城市大脑到医院的最短联动路径。" + (reachH ? "应急救援链仍然畅通。" : (!alive.has(0) ? "城市大脑本身失效，无法统一调度——中枢节点需要异地备份。" : alive.has(6) ? "城市大脑与医院已不在同一连通分支。" : "医院本身已因依赖失效而停摆，救援链中断。")),
      data: "comps", comps
    });
    const a = state.harden ? other : cas;
    const b = state.harden ? cas : other;
    steps.push({
      name: "韧性评估与加固", badge: "对比", tone: "ok",
      view: { nodes: fn, deps: cas.D },
      formula: "未加固：失效 " + ft(a.failed.size + "/" + IDS.length) + "；加固后：失效 " + ft(b.failed.size + "/" + IDS.length, "ok"),
      text: (a.failed.size > b.failed.size
        ? "加固措施（基站、医院备用电源 + 医院应急储水）删去了 3 条依赖边，切断了故障的传播路径：可达集从 " + setTxt(Array.from(a.failed).sort((x, y) => x - y)) + " 缩小到 " + setTxt(Array.from(b.failed).sort((x, y) => x - y)) + "。"
        : "对这个故障点，加固前后失效范围相同：被删去的依赖边不在它的传播路径上。加固要对准可达集最大的故障源。") + "“城市大脑”的数字孪生就是在模型里先做这样的推演，再决定把资金投向哪里。",
      data: "compare", a, b
    });
    M.result = { F, reachH, p, d: dj ? dj.d[6] : null, comps: comps.length, a: a.failed.size, b: b.failed.size };
    return steps;
  }

  /* ---------- 绘图 ---------- */
  function svgEl(tag, attrs, parent) {
    const el = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(el);
    return el;
  }
  function shorten(a, b, d) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const L = Math.hypot(dx, dy) || 1;
    return { x: +(a.x + dx / L * d).toFixed(1), y: +(a.y + dy / L * d).toFixed(1) };
  }
  function draw() {
    const st = MODEL.steps[state.step];
    const view = st.view || {};
    lastW = graphBox.clientWidth;
    const w = Math.max(300, lastW || 800);
    const small = w < 600;
    const h = small ? 430 : 430;
    const mx = small ? 30 : 60;
    const my = 34;
    const P = {};
    IDS.forEach(i => { const q = POS[LEVEL][i]; P[i] = { x: mx + q[0] * (w - 2 * mx), y: my + q[1] * (h - my - 56) }; });
    graphBox.innerHTML = "";
    const svg = svgEl("svg", { viewBox: "0 0 " + w + " " + h, role: "img", "aria-label": cfg.stage, height: h, style: "height:" + h + "px" }, graphBox);
    const defs = svgEl("defs", {}, svg);
    [["d", C.muted], ["hot", C.red], ["fade", "#C9BBB0"]].forEach(m => {
      const mk = svgEl("marker", { id: "sc-ar-" + m[0], viewBox: "0 0 10 10", refX: "9", refY: "5", markerUnits: "userSpaceOnUse", markerWidth: "11", markerHeight: "11", orient: "auto-start-reverse" }, defs);
      svgEl("path", { d: "M0,0 L10,5 L0,10 z", fill: m[1] }, mk);
    });
    const lanes = LANES[LEVEL];
    lanes.forEach((ln, k) => {
      const y = my + ln[1] * (h - my - 56);
      svgEl("rect", { x: 6, y: y - 30, width: w - 12, height: 60, rx: 10, fill: k % 2 ? "rgba(255,180,0,0.07)" : "rgba(214,59,29,0.05)" }, svg);
      const t = svgEl("text", { x: 12, y: y - (small ? 20 : 18), "font-size": small ? 10 : 11, "font-weight": 700, fill: "#9A7B66" }, svg);
      t.textContent = ln[0];
    });
    const r = small ? 16 : 19;
    const gE = svgEl("g", {}, svg);
    const gL = svgEl("g", {}, svg);
    const gN = svgEl("g", {}, svg);
    const E = view.only || (view.hide ? [] : MODEL.E);
    const weighted = LEVEL !== "basic";
    E.forEach(e => {
      let s = (view.edges && view.edges[ekey(e.u, e.v)]) || (view.dimOthers ? "fade" : "n");
      const a = P[e.u];
      const b = P[e.v];
      const t0 = shorten(a, b, r);
      const t1 = shorten(b, a, r);
      const dead = view.nodes && (view.nodes[e.u] === "fail" || view.nodes[e.v] === "fail");
      if (dead && s === "n") s = "fail";
      const stroke = s === "hot" ? C.red : s === "res" ? C.green : s === "fail" ? "#C9BBB0" : s === "fade" ? "rgba(107,74,56,0.18)" : C.edge;
      const sw = s === "hot" || s === "res" ? 3.6 : 1.8;
      const dash = s === "fail" || e.kind === "backup" ? "6 5" : "none";
      svgEl("line", { x1: t0.x, y1: t0.y, x2: t1.x, y2: t1.y, stroke, "stroke-width": sw, "stroke-dasharray": dash, "stroke-linecap": "round" }, gE);
      if (s === "fail" && !dead) {
        const mx2 = (a.x + b.x) / 2;
        const my2 = (a.y + b.y) / 2;
        const x = svgEl("text", { x: mx2, y: my2 + 5, "text-anchor": "middle", "font-size": 15, "font-weight": 800, fill: C.bad }, gL);
        x.textContent = "✕";
      }
      if (weighted) {
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const lab = String(e.w);
        const col = s === "hot" ? C.red : s === "res" ? C.green : s === "fade" || s === "fail" ? "#B9A89B" : C.muted;
        svgEl("rect", { x: mid.x - 11, y: mid.y - 10, width: 22, height: 19, rx: 8, fill: "rgba(255,251,240,0.95)", stroke: col, "stroke-width": s === "n" ? 0.8 : 1.4 }, gL);
        const tx = svgEl("text", { x: mid.x, y: mid.y + 4, "text-anchor": "middle", "font-size": 11.5, "font-weight": 700, fill: col, class: "mono" }, gL);
        tx.textContent = lab;
      }
    });
    (view.deps || []).forEach(d => {
      const a = P[d.u];
      const b = P[d.v];
      const hot = view.depHot && view.depHot[d.u + ">" + d.v];
      const t0 = shorten(a, b, r + 2);
      const t1 = shorten(b, a, r + 4);
      const cx = (t0.x + t1.x) / 2 + (t1.y - t0.y) * 0.22;
      const cy = (t0.y + t1.y) / 2 - (t1.x - t0.x) * 0.22;
      svgEl("path", { d: "M" + t0.x + "," + t0.y + " Q" + cx + "," + cy + " " + t1.x + "," + t1.y, fill: "none", stroke: hot ? C.red : C.muted, "stroke-width": hot ? 3 : 1.5, "stroke-dasharray": "5 4", "marker-end": "url(#sc-ar-" + (hot ? "hot" : "d") + ")", opacity: hot ? 1 : 0.8 }, gE);
    });
    IDS.forEach(i => {
      let s = (view.nodes && view.nodes[i]) || (view.dimOthers ? "dim" : "normal");
      if (state.picked === i && s === "normal") s = "cur";
      const p = P[i];
      const g = svgEl("g", { class: "node", tabindex: "0", role: "button", "aria-label": nm(i), "data-i": i }, gN);
      if (s === "fail") {
        svgEl("circle", { cx: p.x, cy: p.y, r, fill: "#fff", stroke: C.grey, "stroke-width": 2, "stroke-dasharray": "4 3" }, g);
      } else {
        svgEl("circle", { cx: p.x, cy: p.y, r, fill: s === "cur" ? C.gold : s === "done" ? C.green : C.red, stroke: C.paper, "stroke-width": 3, opacity: s === "dim" ? 0.35 : 1 }, g);
      }
      const t = svgEl("text", { x: p.x, y: p.y + 5, "text-anchor": "middle", "font-size": 14, "font-weight": 800, fill: s === "fail" ? C.grey : s === "cur" ? C.ink : "#fff", class: "mono" }, g);
      t.textContent = code(i);
      const n = svgEl("text", { x: p.x, y: p.y + r + 15, "text-anchor": "middle", "font-size": small ? 10.5 : 12.5, "font-weight": 700, fill: s === "fail" || s === "dim" ? "#B9A89B" : C.ink }, g);
      n.textContent = NODES[i].name + (s === "fail" && !small ? " ✕" : "");
      const tag = view.tags && view.tags[i];
      if (tag) {
        const tw = 12 + Array.from(tag).reduce((a, ch) => a + (ch.charCodeAt(0) > 255 ? 11.5 : 7), 0);
        svgEl("rect", { x: p.x + r - 6, y: p.y - r - 14, width: tw, height: 18, rx: 9, fill: C.paper, stroke: "#E0A000", "stroke-width": 1.2 }, g);
        const tt = svgEl("text", { x: p.x + r - 6 + tw / 2, y: p.y - r - 1, "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: C.ink, class: "mono" }, g);
        tt.textContent = tag;
      }
    });
  }

  /* ---------- 数据卡 ---------- */
  function dataHtml(st) {
    const E = MODEL.E;
    let title = "";
    let body = "";
    let note = "";
    const what = st.data;
    if (what === "nodes") {
      title = "顶点集 V（城市设施）";
      body = '<table class="tbl"><thead><tr><th>顶点</th><th>设施</th><th>所属子系统</th></tr></thead><tbody>' +
        IDS.map(i => '<tr><td class="num">' + code(i) + "</td><td>" + NODES[i].name + "</td><td>" + laneOf(i) + "</td></tr>").join("") + "</tbody></table>";
    } else if (what === "edges") {
      title = "边集 E（联动关系）";
      body = '<table class="tbl"><thead><tr><th>边</th><th>联动</th><th>' + (LEVEL === "basic" ? "类型" : "响应时间") + "</th></tr></thead><tbody>" +
        E.map(e => '<tr><td class="num">' + code(e.u) + "–" + code(e.v) + "</td><td>" + NODES[e.u].name + " ↔ " + NODES[e.v].name + '</td><td class="num">' + (LEVEL === "basic" ? (e.kind === "x" ? "跨层" : "层内") : e.w + " min" + (e.kind === "backup" ? "（备用）" : "")) + "</td></tr>").join("") + "</tbody></table>";
    } else if (what === "deg") {
      const degs = IDS.map(i => degree(E, i));
      title = "度数表（Σd = " + degs.reduce((a, b) => a + b, 0) + " = 2 × " + E.length + "）";
      body = '<table class="tbl"><thead><tr><th>顶点</th>' + IDS.map(i => "<th>" + code(i) + "</th>").join("") + '</tr></thead><tbody><tr><td>度 d(v)</td>' + degs.map(d => '<td class="num">' + d + "</td>").join("") + "</tr>" +
        '<tr><td>邻居</td>' + IDS.map(i => '<td class="num">' + nbrs(E, i).map(code).join("") + "</td>").join("") + "</tr></tbody></table>";
    } else if (what === "bfs") {
      title = "BFS 分层（从 C 出发）";
      body = '<div class="chip-row">' + st.layers.map((l, k) => '<span class="chip ' + (k === st.layers.length - 1 ? "gold" : "ok") + '">第 ' + k + " 层：" + l.map(code).join(", ") + "</span>").join("") + "</div>";
      note = "同一层的顶点到 C 的边数（跳数）相同。";
    } else if (what === "comps") {
      title = "连通分支（ω = " + st.comps.length + "）";
      body = '<div class="chip-row">' + st.comps.map((c, k) => '<span class="chip ' + (st.comps.length === 1 ? "ok" : "bad") + '">分支 ' + (k + 1) + "：" + c.map(nm).join("、") + "</span>").join("") + "</div>";
    } else if (what === "dist") {
      title = "Dijkstra 距离表 d(v)（min）";
      body = '<table class="tbl"><thead><tr><th>顶点</th>' + IDS.map(i => "<th>" + code(i) + "</th>").join("") + '</tr></thead><tbody><tr><td>d(v)</td>' +
        IDS.map(i => '<td class="num">' + (st.d[i] === Infinity ? "∞" : st.d[i]) + "</td>").join("") + "</tr><tr><td>状态</td>" +
        IDS.map(i => "<td>" + (st.cur === i ? "当前" : st.done.includes(i) ? "✓" : "—") + "</td>").join("") + "</tr></tbody></table>";
      note = "✓ = 已确定（最短时间不会再变）；— = 仍是临时值。";
    } else if (what === "cut") {
      title = "逐个删去顶点后的连通分支数 ω";
      body = '<table class="tbl"><thead><tr><th>删去</th>' + st.cv.map(c => "<th>" + code(c.x) + "</th>").join("") + '</tr></thead><tbody><tr><td>ω(G − v)</td>' +
        st.cv.map(c => '<td class="num">' + c.comps.length + "</td>").join("") + "</tr></tbody></table>";
      note = "ω(G − v) > ω(G) = 1 的顶点 v 是割点。";
    } else if (what === "deps") {
      const D = deps(state.harden);
      title = "依赖网络 D（|D| = " + D.length + "）";
      body = '<div class="chip-row">' + DEPS.map(d => {
        const on = D.some(x => x.u === d[0] && x.v === d[1]);
        return '<span class="chip ' + (on ? "" : "ok") + '">' + code(d[0]) + " → " + code(d[1]) + " " + d[2] + (on ? "" : "（已加固）") + "</span>";
      }).join("") + "</div>";
      note = "⟨u,v⟩ 读作“v 依赖 u 的供给”。";
    } else if (what === "rounds") {
      const cas = cascade(state.fail, state.harden);
      title = "级联轮次";
      body = '<table class="tbl"><thead><tr><th>轮次</th><th>新失效设施</th></tr></thead><tbody>' +
        cas.rounds.map((r, k) => '<tr class="' + (k === st.upto ? "hot" : k < st.upto ? "bad" : "") + '"><td class="num">F' + "₀₁₂₃₄₅"[k] + "</td><td>" + (k <= st.upto ? r.map(nm).join("、") : "…") + "</td></tr>").join("") + "</tbody></table>";
    } else if (what === "compare") {
      title = "韧性加固对比（初始故障 " + nm(state.fail) + "）";
      body = '<table class="tbl"><thead><tr><th>方案</th><th>失效设施</th><th>失效率</th></tr></thead><tbody>' +
        '<tr class="bad"><td>未加固</td><td>' + Array.from(st.a.failed).sort((x, y) => x - y).map(code).join(", ") + '</td><td class="num">' + st.a.failed.size + "/" + IDS.length + "</td></tr>" +
        '<tr class="ok"><td>加固后</td><td>' + Array.from(st.b.failed).sort((x, y) => x - y).map(code).join(", ") + '</td><td class="num">' + st.b.failed.size + "/" + IDS.length + "</td></tr></tbody></table>";
    }
    return '<div class="data-head"><h3>' + title + "</h3></div>" + body + (note ? '<p class="data-note">' + note + "</p>" : "");
  }
  function laneOf(i) {
    const y = POS[LEVEL][i][1];
    const ln = LANES[LEVEL].find(l => Math.abs(l[1] - y) < 0.05);
    return ln ? ln[0] : "";
  }

  /* ---------- 案例六段式 ---------- */
  const IDEO = (window.SECTION_META && window.SECTION_META.ideology) || {};
  function flowHtml() {
    const R = MODEL.result || {};
    let items;
    if (LEVEL === "basic") {
      items = [
        ["情境背景", "一座城市有交通、能源、民生等子系统，过去各自为政：地铁客流、供水、医疗的信息互不相通。“一网统管”要把它们连成一张网，由城市大脑统筹。"],
        ["数学建模", "设施 → 顶点；可以直接联动 → 无向边；按子系统分层，层内边 + 跨层边 = 多层网络。用度刻画一个设施的联动面，用连通性刻画网络是否“一网”。"],
        ["交互求解", "点「下一步」依次建立顶点、层内边、跨层边，数度数并验证握手定理，从城市大脑出发做 BFS 判定连通，最后拆掉跨层边观察分支数。"],
        ["结果解读", "当前网络" + (R.connected ? "连通（ω = 1）" : "不连通") + "；度最大的是 " + (R.hubs || []).map(nm).join("、") + "（" + R.maxd + "）；拆掉全部跨层边后分裂为 " + R.comps + " 个连通分支——“信息孤岛”一目了然。"],
        ["价值引领", IDEO.text || ""],
        ["迁移思考", "如果只允许保留 2 条跨层边，还能让网络连通吗？最少需要几条边才能把 7 个设施连成一个连通图？（提示：树）"]
      ];
    } else if (LEVEL === "advanced") {
      items = [
        ["情境背景", "城市大脑接到" + NODES[R.tgt].name + "方向的突发事件，需要尽快联动相关设施；同时规划部门想知道：哪个设施一旦停摆，会让其他设施与城市网络失联？"],
        ["数学建模", "赋权无向图 G = ⟨V,E,w⟩，w 为联动响应时间；最快联动 = 单源最短路；关键枢纽 = 割点（删去后连通分支数增加的顶点）。"],
        ["交互求解", "逐步执行 Dijkstra，观察每一步确定哪个设施、松弛哪些边；再比较度中心性与割点。左侧可切换事件点、加装备用联络线。"],
        ["结果解读", "C 到 " + nm(R.tgt) + " 最短联动 " + R.d[R.tgt] + " min（" + R.path.map(code).join("→") + "）；度最大的是 " + code(R.rank[0]) + "，而割点为 " + (R.cuts.length ? setTxt(R.cuts) : "无（已 2-连通）") + "——度大不等于关键。"],
        ["价值引领", IDEO.text || ""],
        ["迁移思考", "若事件同时发生在两处，应怎样调度？若考虑“删去一条边”（割边 / 桥），哪些联络线是单点故障？如何用最少的新增边让网络 2-连通？"]
      ];
    } else {
      items = [
        ["情境背景", "极端天气导致" + NODES[state.fail].name + "停运。电、水、通信彼此依赖，一处故障可能沿依赖链层层扩散，城市大脑需要在数字孪生模型里快速推演影响范围。"],
        ["数学建模", "相依网络 = 联动网络 G（无向）+ 依赖网络 D（有向）。级联失效集合 = D 中从故障点出发的可达集；救援能力 = 残余网络的连通性与最短路。"],
        ["交互求解", "逐轮推演失效传播，得到可达集；删去失效设施后判断残余网络连通分支并求 C → H 最短路；对比加固前后的失效规模。"],
        ["结果解读", "初始故障 " + code(state.fail) + " 最终导致 " + R.F.length + "/" + IDS.length + " 个设施失效；" + (R.reachH ? "城市大脑仍可在 " + R.d + " min 内联动医院。" : "C → H 救援链中断。") + "加固前后失效数：" + R.a + " → " + R.b + "。"],
        ["价值引领", IDEO.text || ""],
        ["迁移思考", "若依赖是“同时失去两个供给才失效”（与关系而非或关系），级联规则该怎样改？电网、交通、通信的真实相依网络还需要考虑哪些因素？"]
      ];
    }
    return '<h3>案例六段式<small>' + cfg.tier + " · 情境背景 → 数学建模 → 交互求解 → 结果解读 → 价值引领 → 迁移思考</small></h3>" +
      '<div class="flow-grid">' + items.map((it, i) =>
        '<div class="flow-item' + (i === 3 ? " result" : i === 4 ? " value" : "") + '"><h4><span class="no">' + (i + 1) + "</span>" + it[0] + (i === 4 && IDEO.title ? " · " + esc(IDEO.title) : "") + "</h4><p>" + (i === 4 ? esc(it[1]) : it[1]) + "</p></div>"
      ).join("") + "</div>";
  }

  /* ---------- 渲染与控件 ---------- */
  function render() {
    const st = MODEL.steps[state.step];
    $("formulaText").innerHTML = st.formula;
    $("stepStatus").innerHTML = state.note
      ? '<span class="badge gold">' + esc(state.noteBadge || "更新") + "</span><span><b>" + esc(state.note) + "</b><br>" + st.text + "</span>"
      : '<span class="badge ' + (st.tone || "") + '">' + esc(st.badge) + "</span><span>" + st.text + "</span>";
    draw();
    $("dataCard").innerHTML = dataHtml(st);
    $("caseFlow").innerHTML = flowHtml();
    const box = $("stepList");
    const sig = MODEL.steps.map(s => s.name).join("|");
    if (box.dataset.sig !== sig) {
      box.dataset.sig = sig;
      box.innerHTML = MODEL.steps.map((s, i) => '<button type="button" class="step-item" data-i="' + i + '"><span class="num">' + (i + 1) + "</span><span>" + esc(s.name) + "</span></button>").join("");
    }
    Array.prototype.forEach.call(box.children, (el, i) => {
      el.classList.toggle("active", i === state.step);
      el.classList.toggle("done", i < state.step);
      el.setAttribute("aria-current", i === state.step ? "step" : "false");
    });
    $("progressFill").style.width = ((state.step + 1) / MODEL.steps.length * 100) + "%";
    $("stepCounter").textContent = "第 " + (state.step + 1) + " / " + MODEL.steps.length + " 步";
    $("prevBtn").disabled = state.step === 0;
    $("nextBtn").disabled = state.step === MODEL.steps.length - 1;
  }
  function go(i) { state.step = Math.max(0, Math.min(MODEL.steps.length - 1, i)); state.note = ""; render(); }
  function stopPlay() {
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
    const b = $("playBtn");
    b.classList.remove("playing");
    b.textContent = "▶ 自动播放";
  }
  function togglePlay() {
    if (state.timer) { stopPlay(); return; }
    if (state.step === MODEL.steps.length - 1) go(0);
    const b = $("playBtn");
    b.classList.add("playing");
    b.textContent = "⏸ 暂停";
    state.timer = setInterval(() => {
      if (state.step >= MODEL.steps.length - 1) { stopPlay(); return; }
      go(state.step + 1);
    }, Math.round(1800 / state.speed));
  }
  function rebuild(jump, note) {
    analyze();
    if (typeof jump === "number") state.step = Math.max(0, Math.min(MODEL.steps.length - 1, jump));
    else if (jump === "last") state.step = MODEL.steps.length - 1;
    state.note = note || "";
    state.noteBadge = "更新";
    render();
  }
  function findStep(prefix) { const k = MODEL.steps.findIndex(s => s.name.indexOf(prefix) === 0); return k < 0 ? "last" : k; }
  function resetAll() {
    stopPlay();
    Object.assign(state, { step: 0, picked: null, cut: "", target: 6, backup: false, fail: 3, harden: false });
    syncInputs();
    rebuild(0);
  }
  function buildControls() {
    let scen = "";
    if (LEVEL === "basic") {
      const opts = '<option value="">不断开（完整网络）</option>' + LINKS.basic.map(e => '<option value="' + ekey(e[0], e[1]) + '">' + code(e[0]) + "–" + code(e[1]) + " " + NODES[e[0]].name + "—" + NODES[e[1]].name + (e[3] === "x" ? "（跨层）" : "（层内）") + "</option>").join("");
      scen = '<div class="ctl-card"><div class="ctl-title"><span>情境操作</span><small>断一条边，看还连不连通</small></div>' +
        '<label class="ctl-row"><span>模拟断开联动边</span><select id="cutSel">' + opts + "</select></label></div>";
    } else if (LEVEL === "advanced") {
      const opts = IDS.filter(i => i !== 0).map(i => '<option value="' + i + '">' + nm(i) + "</option>").join("");
      scen = '<div class="ctl-card"><div class="ctl-title"><span>情境操作</span><small>改参数即重算</small></div>' +
        '<label class="ctl-row"><span>事件点（联动目标）</span><select id="tgtSel">' + opts + "</select></label>" +
        '<label class="ctl-check"><input type="checkbox" id="backupChk"> 新增备用联络线 W–S（水厂—社区网格，4 min）</label></div>';
    } else {
      const opts = [3, 9, 4, 2, 0].map(i => '<option value="' + i + '">' + nm(i) + "</option>").join("");
      scen = '<div class="ctl-card"><div class="ctl-title"><span>数字孪生情境</span><small>改参数即重算</small></div>' +
        '<label class="ctl-row"><span>初始故障设施</span><select id="failSel">' + opts + "</select></label>" +
        '<label class="ctl-check"><input type="checkbox" id="hardenChk"> 韧性加固：基站、医院备用电源 + 医院应急储水</label></div>';
    }
    controls.innerHTML =
      '<div class="step-controller">' +
      '<div class="step-progress-head"><span id="stepCounter">第 1 步</span><small>' + cfg.label + " · 点一步看变化</small></div>" +
      '<div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>' +
      '<div class="step-btns">' +
      '<button type="button" class="btn" id="prevBtn">◀ 上一步</button>' +
      '<button type="button" class="btn primary" id="nextBtn">下一步 ▶</button>' +
      '<button type="button" class="btn" id="playBtn">▶ 自动播放</button>' +
      '<button type="button" class="btn ghost" id="resetBtn">↺ 重置</button>' +
      "</div>" +
      '<label class="ctl-row"><span>播放速度 <b id="speedVal">1×</b></span><input type="range" id="speedRange" min="0.5" max="2" step="0.5" value="1"></label>' +
      "</div>" + scen + '<div class="step-list" id="stepList"></div>';
    $("prevBtn").addEventListener("click", () => { stopPlay(); go(state.step - 1); });
    $("nextBtn").addEventListener("click", () => { stopPlay(); go(state.step + 1); });
    $("playBtn").addEventListener("click", togglePlay);
    $("resetBtn").addEventListener("click", resetAll);
    $("speedRange").addEventListener("input", e => {
      state.speed = Number(e.target.value);
      $("speedVal").textContent = state.speed + "×";
      if (state.timer) { stopPlay(); togglePlay(); }
    });
    $("stepList").addEventListener("click", e => { const b = e.target.closest(".step-item"); if (b) { stopPlay(); go(Number(b.dataset.i)); } });
    if (LEVEL === "basic") {
      $("cutSel").addEventListener("change", e => {
        stopPlay();
        state.cut = e.target.value;
        analyze();
        let k = 0;
        MODEL.steps.forEach((s, i) => { if (s.name.indexOf("BFS") === 0) k = i; });
        rebuild(k,
          state.cut ? "已断开 " + state.cut.split("-").map(Number).map(code).join("–") + "，重新做 BFS 连通判定。" : "已恢复完整网络。");
      });
    } else if (LEVEL === "advanced") {
      $("tgtSel").value = String(state.target);
      $("tgtSel").addEventListener("change", e => { stopPlay(); state.target = Number(e.target.value); analyze(); rebuild(findStep("最短联动路径"), "事件点改为 " + nm(state.target) + "。"); });
      $("backupChk").addEventListener("change", e => { stopPlay(); state.backup = e.target.checked; analyze(); rebuild(findStep("割点"), state.backup ? "已新增备用联络线 W–S，重新检测割点。" : "已拆除备用联络线 W–S。"); });
    } else {
      $("failSel").value = String(state.fail);
      $("failSel").addEventListener("change", e => { stopPlay(); state.fail = Number(e.target.value); rebuild("last", "初始故障改为 " + nm(state.fail) + "，孪生模型已重新推演。"); });
      $("hardenChk").addEventListener("change", e => { stopPlay(); state.harden = e.target.checked; rebuild("last", state.harden ? "已开启韧性加固，重新推演级联。" : "已取消韧性加固。"); });
    }
  }
  function syncInputs() {
    const set = (id, v, prop) => { const el = $(id); if (el) el[prop || "value"] = v; };
    set("cutSel", "");
    set("tgtSel", "6");
    set("backupChk", false, "checked");
    set("failSel", "3");
    set("hardenChk", false, "checked");
  }

  function pickNode(i) {
    stopPlay();
    if (LEVEL === "advanced" && i !== 0) {
      state.target = i;
      $("tgtSel").value = String(i);
      analyze();
      rebuild(findStep("最短联动路径"), "事件点改为 " + nm(i) + "。");
      return;
    }
    if (LEVEL === "extend" && [3, 9, 4, 2, 0].includes(i)) {
      state.fail = i;
      $("failSel").value = String(i);
      rebuild("last", "初始故障改为 " + nm(i) + "，孪生模型已重新推演。");
      return;
    }
    state.picked = state.picked === i ? null : i;
    const nb = nbrs(MODEL.E, i);
    state.note = state.picked == null ? "" : nm(i) + "：度 " + nb.length + "，邻居 " + list(nb.map(nm)) + "。" + (LEVEL === "extend" ? "（可选的初始故障设施：P、B、W、M、C）" : "");
    state.noteBadge = code(i);
    render();
  }
  graphBox.addEventListener("click", e => { const g = e.target.closest(".node"); if (g) pickNode(Number(g.dataset.i)); });
  graphBox.addEventListener("keydown", e => {
    const g = e.target.closest(".node");
    if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pickNode(Number(g.dataset.i)); }
  });

  /* ---------- 启动 ---------- */
  const missionEl = $("missionText");
  if (missionEl) missionEl.innerHTML = "<b>互动任务：</b>" + esc(cfg.mission);
  const badgeEl = $("visualBadge");
  if (badgeEl) badgeEl.textContent = cfg.badge;
  const titleEl = $("stageTitle");
  if (titleEl) titleEl.innerHTML = esc(cfg.stage) + "<small>|V| = " + IDS.length + "</small>";
  const hintEl = $("canvasHint");
  if (hintEl) hintEl.textContent = cfg.hint;
  buildControls();
  analyze();
  render();
  let rz = null;
  window.addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(() => { if (graphBox.clientWidth !== lastW) draw(); }, 120);
  });
})();
