/* ============================================================
   7.12 智能制造网络分析案例 · 三层统一案例引擎
   页面通过 <body data-layer="basic|advanced|extend"> 区分层级：
   基础层 认识模型：工序→顶点、依赖→有向边、邻接矩阵、出入度、枚举工艺路线找关键路线
   进阶层 求解模型：Warshall 求可达矩阵、ES 顺推求关键路径、瓶颈判定（可编辑邻接矩阵）
   拓展层 拓展模型：Kahn 拓扑排序排产、ES/LS 时差、数字孪生扰动推演、返工回路检测
   ============================================================ */
(function () {
  "use strict";

  const LEVEL = document.body.getAttribute("data-layer") || "advanced";
  const $ = id => document.getElementById(id);
  const controls = $("controls");
  const graphBox = $("graphBox");
  if (!controls || !graphBox) return;

  const SVGNS = "http://www.w3.org/2000/svg";
  const C = {
    red: "#D63B1D", redDeep: "#B8321A", gold: "#FFB400", ink: "#2C1810", muted: "#6B4A38",
    green: "#1F9D55", paper: "#FFFBF0", edge: "rgba(107,74,56,0.42)", grey: "#9B8B80"
  };

  /* ---------- 数据：同一条产线逐层加深 ---------- */
  const ALL_NAMES = ["原料", "粗加工", "钻铣", "热处理", "精加工", "装配", "质检", "入库"];
  const ALL_EDGES = [[0, 1, 2], [0, 2, 3], [1, 3, 4], [2, 3, 2], [2, 4, 3], [3, 5, 3], [4, 5, 2], [4, 6, 4], [5, 6, 2], [6, 7, 1]];
  const CFG = {
    basic: {
      n: 6,
      names: ["原料", "粗加工", "钻铣", "热处理", "精加工", "装配成品"],
      cols: 4,
      pos: [[0, .5], [1, .2], [1, .8], [2, .2], [2, .8], [3, .5]],
      label: "基础层",
      tier: "认识模型",
      stage: "车间工序依赖图",
      mission: "把 6 道工序画成有向图，写出邻接矩阵，再比一比哪条工艺路线最长。",
      badge: "工序 DAG · 0-1 矩阵",
      hint: "点“下一步”：顶点 → 有向边 → 邻接矩阵 → 出入度 → 工艺路线；点击顶点可查看它的前后工序",
      tabs: [["step", "跟随步骤"], ["A", "邻接矩阵 A"]]
    },
    advanced: {
      n: 7,
      names: ALL_NAMES.slice(0, 7),
      cols: 5,
      pos: [[0, .5], [1, .2], [1, .8], [2, .2], [2, .8], [3, .36], [4, .5]],
      label: "进阶层",
      tier: "求解模型",
      stage: "产线网络 · 可达与关键路径",
      mission: "用 Warshall 算法由邻接矩阵求可达矩阵，再顺推最早开始时间，找出关键路径与瓶颈段。",
      badge: "Warshall + 关键路径",
      hint: "点“下一步”看 Warshall 逐个加入中转工序；在「邻接矩阵 A」页签点击上三角单元格可增删依赖",
      tabs: [["step", "跟随步骤"], ["A", "邻接矩阵 A"], ["M", "关联矩阵 M"], ["R", "可达矩阵 R"]]
    },
    extend: {
      n: 8,
      names: ALL_NAMES,
      cols: 6,
      pos: [[0, .5], [1, .2], [1, .8], [2, .2], [2, .8], [3, .36], [4, .5], [5, .5]],
      label: "拓展层",
      tier: "拓展模型",
      stage: "数字孪生排产推演",
      mission: "用拓扑排序排出开工顺序，用 ES/LS 求时差；再模拟设备延误或返工，推演工期与可行性。",
      badge: "拓扑排序 + 时差",
      hint: "左侧可设置扰动工序段、延误时长与返工回路，孪生模型会立即重算全部步骤",
      tabs: [["step", "跟随步骤"], ["A", "邻接矩阵 A"], ["T", "时间参数表"]]
    }
  };
  const cfg = CFG[LEVEL] || CFG.advanced;
  const N = cfg.n;
  const NAMES = cfg.names;

  const state = {
    edges: [],
    step: 0,
    tab: "step",
    timer: null,
    speed: 1,
    picked: null,
    optimized: 0,
    delayKey: "2-4",
    delay: 0,
    rework: false,
    note: ""
  };

  function initialEdges() {
    return ALL_EDGES.filter(e => e[0] < N && e[1] < N).map(e => ({ u: e[0], v: e[1], w: e[2], base: e[2] }));
  }
  state.edges = initialEdges();

  /* ---------- 工具 ---------- */
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  const V = i => "V" + i;
  const key = (u, v) => u + "-" + v;
  const arrow = (u, v) => V(u) + "→" + V(v);
  const ft = (t, cls) => '<span class="ft ' + (cls || "hot") + '">' + t + "</span>";
  const list = arr => arr.length ? arr.join("，") : "无";

  /* 当前生效的边（含拓展层的延误与返工） */
  function effEdges() {
    const E = state.edges.map(e => ({ u: e.u, v: e.v, w: e.w + (LEVEL === "extend" && key(e.u, e.v) === state.delayKey ? state.delay : 0) }));
    if (LEVEL === "extend" && state.rework) E.push({ u: 6, v: 3, w: 1, rework: true });
    return E;
  }
  function adjMatrix(E) {
    const A = Array.from({ length: N }, () => Array(N).fill(0));
    E.forEach(e => { A[e.u][e.v] = 1; });
    return A;
  }
  function warshall(A) {
    const W = A.map(r => r.slice());
    const snaps = [];
    for (let k = 0; k < N; k += 1) {
      const added = [];
      for (let i = 0; i < N; i += 1) {
        if (!W[i][k]) continue;
        for (let j = 0; j < N; j += 1) {
          if (W[k][j] && !W[i][j]) { W[i][j] = 1; added.push([i, j]); }
        }
      }
      snaps.push({ k, W: W.map(r => r.slice()), added });
    }
    const R = W.map((r, i) => r.map((x, j) => (i === j ? 1 : x)));
    return { snaps, R };
  }
  function kahn(E) {
    const indeg = Array(N).fill(0);
    E.forEach(e => { indeg[e.v] += 1; });
    const start = indeg.slice();
    let queue = [];
    for (let i = 0; i < N; i += 1) if (!indeg[i]) queue.push(i);
    const order = [];
    const trace = [];
    while (queue.length) {
      queue.sort((a, b) => a - b);
      const v = queue.shift();
      order.push(v);
      const freed = [];
      E.filter(e => e.u === v).forEach(e => {
        indeg[e.v] -= 1;
        if (indeg[e.v] === 0) freed.push(e.v);
      });
      queue = queue.concat(freed).sort((a, b) => a - b);
      trace.push({ v, freed, queue: queue.slice(), indeg: indeg.slice(), order: order.slice() });
    }
    const rest = [];
    for (let i = 0; i < N; i += 1) if (!order.includes(i)) rest.push(i);
    return { start, order, trace, ok: order.length === N, rest };
  }
  function findCycle(E, rest) {
    const inRest = new Set(rest);
    const color = {};
    const stack = [];
    let found = null;
    function dfs(u) {
      color[u] = 1; stack.push(u);
      for (const e of E) {
        if (found) return;
        if (e.u !== u || !inRest.has(e.v)) continue;
        if (color[e.v] === 1) { found = stack.slice(stack.indexOf(e.v)); return; }
        if (!color[e.v]) dfs(e.v);
      }
      stack.pop(); color[u] = 2;
    }
    for (const r of rest) { if (!color[r] && !found) dfs(r); }
    return found || [];
  }
  function schedule(E, order) {
    const ES = Array(N).fill(0);
    order.forEach(v => E.filter(e => e.v === v).forEach(e => { ES[v] = Math.max(ES[v], ES[e.u] + e.w); }));
    const T = Math.max.apply(null, ES);
    const LS = Array(N).fill(T);
    order.slice().reverse().forEach(u => E.filter(e => e.u === u).forEach(e => { LS[u] = Math.min(LS[u], LS[e.v] - e.w); }));
    const slack = ES.map((x, i) => LS[i] - x);
    const crit = E.filter(e => LS[e.v] - ES[e.u] - e.w === 0 && slack[e.u] === 0);
    const path = [];
    let cur = order.find(v => slack[v] === 0 && ES[v] === 0);
    while (cur != null) {
      path.push(cur);
      const nx = crit.filter(e => e.u === cur).sort((a, b) => a.v - b.v)[0];
      cur = nx ? nx.v : null;
    }
    const pathEdges = [];
    for (let i = 0; i + 1 < path.length; i += 1) pathEdges.push(E.find(e => e.u === path[i] && e.v === path[i + 1]));
    const cps = [];
    (function walk(u, acc) {
      const nx = crit.filter(e => e.u === u);
      if (!nx.length) { if (ES[u] === T) cps.push(acc.slice()); return; }
      nx.forEach(e => { acc.push(e); walk(e.v, acc); acc.pop(); });
    })(path[0], []);
    const common = pathEdges.filter(e => cps.every(p => p.includes(e)));
    const bottleneck = (common.length ? common : pathEdges).reduce((b, e) => (!b || e.w > b.w ? e : b), null);
    return { ES, LS, slack, T, crit, path, pathEdges, bottleneck, nCP: cps.length };
  }
  function allPaths(E, s, t) {
    const out = [];
    (function walk(u, acc) {
      if (u === t) { out.push(acc.slice()); return; }
      E.filter(e => e.u === u).sort((a, b) => a.v - b.v).forEach(e => { acc.push(e.v); walk(e.v, acc); acc.pop(); });
    })(s, [s]);
    return out.map(p => {
      let len = 0;
      const ws = [];
      for (let i = 0; i + 1 < p.length; i += 1) {
        const e = E.find(x => x.u === p[i] && x.v === p[i + 1]);
        ws.push(e.w); len += e.w;
      }
      return { nodes: p, ws, len };
    });
  }
  const pathText = p => p.map(V).join("→");

  /* ---------- 分析：由当前图生成全部步骤 ---------- */
  let MODEL = null;
  let lastW = 0;
  function analyze() {
    const E = effEdges();
    const A = adjMatrix(E);
    const K = kahn(E);
    const M = { E, A, K };
    if (K.ok) M.S = schedule(E, K.order);
    if (LEVEL === "advanced") M.Wr = warshall(A);
    if (LEVEL === "basic") M.paths = allPaths(E, 0, N - 1);
    if (LEVEL === "extend") {
      const base = state.edges.map(e => ({ u: e.u, v: e.v, w: e.w }));
      const K0 = kahn(base);
      M.S0 = schedule(base, K0.order);
      if (!K.ok) M.cycle = findCycle(E, K.rest);
    }
    M.steps = buildSteps(M);
    MODEL = M;
    if (state.step >= M.steps.length) state.step = M.steps.length - 1;
  }

  function nodesIn(edges) {
    const s = new Set();
    edges.forEach(e => { s.add(e.u); s.add(e.v); });
    return s;
  }
  function edgeMap(edges, st) {
    const m = {};
    edges.forEach(e => { m[key(e.u, e.v)] = st; });
    return m;
  }

  function buildSteps(M) {
    if (LEVEL === "basic") return basicSteps(M);
    if (LEVEL === "extend") return extendSteps(M);
    return advancedSteps(M);
  }

  /* ---------- 基础层 ---------- */
  function basicSteps(M) {
    const { E, A, paths } = M;
    const outd = A.map(r => r.reduce((a, b) => a + b, 0));
    const ind = A[0].map((_, j) => A.reduce((a, r) => a + r[j], 0));
    const src = ind.map((d, i) => d === 0 ? i : -1).filter(i => i >= 0);
    const snk = outd.map((d, i) => d === 0 ? i : -1).filter(i => i >= 0);
    const steps = [];
    steps.push({
      name: "工序即顶点", badge: "建模", view: { hideEdges: true },
      formula: "V = {" + NAMES.map((_, i) => V(i)).join(", ") + "}，" + ft("|V| = " + N),
      text: "车间的 " + N + " 道工序各抽象为一个顶点：" + NAMES.map((x, i) => V(i) + " " + x).join("、") + "。先不管顺序，只回答“有哪些对象”。",
      data: "vertices"
    });
    steps.push({
      name: "依赖即有向边", badge: "建模",
      formula: "E = {" + E.slice(0, 3).map(e => "⟨" + V(e.u) + "," + V(e.v) + "⟩").join(", ") + ", …}，" + ft("|E| = " + E.length),
      text: "“粗加工完成后才能热处理”记作有向边 ⟨V1,V3⟩；边上的数字是这一段加工加转运所需时长（h）。有方向：⟨V1,V3⟩ 与 ⟨V3,V1⟩ 含义不同。",
      data: "edges"
    });
    steps.push({
      name: "写邻接矩阵 A", badge: "矩阵",
      formula: "a" + "ᵢⱼ = 1 ⟺ ⟨Vi, Vj⟩ ∈ E；矩阵中 1 的个数 = " + ft("|E| = " + E.length),
      text: "把每条有向边填进 " + N + "×" + N + " 的 0-1 矩阵：第 i 行第 j 列为 1，表示工序 Vi 直接指向 Vj。第 i 行 = Vi 的所有直接后续工序。",
      data: "A"
    });
    steps.push({
      name: "出度与入度", badge: "度", tone: "gold",
      view: { nodes: Object.fromEntries(src.concat(snk).map(i => [i, "cur"])) },
      formula: "d⁺(Vi) = 第 i 行之和，d⁻(Vj) = 第 j 列之和；Σd⁺ = Σd⁻ = " + ft(String(E.length)),
      text: src.map(V).join("、") + " 入度为 0——没有前置工序，是产线起点；" + snk.map(V).join("、") + " 出度为 0——是终点（成品）。每条边给起点贡献 1 个出度、给终点贡献 1 个入度，所以出度和 = 入度和 = 边数。",
      data: "Adeg"
    });
    paths.forEach((p, idx) => {
      const pe = [];
      for (let i = 0; i + 1 < p.nodes.length; i += 1) pe.push({ u: p.nodes[i], v: p.nodes[i + 1] });
      steps.push({
        name: "工艺路线 " + (idx + 1), badge: "路线 " + (idx + 1), tone: "gold",
        view: { nodes: Object.fromEntries(p.nodes.map(i => [i, "cur"])), edges: edgeMap(pe, "hot") },
        formula: pathText(p.nodes) + "：" + p.ws.join(" + ") + " = " + ft(p.len + " h"),
        text: "从 V0 到 V" + (N - 1) + " 的第 " + (idx + 1) + " 条工艺路线（共 " + paths.length + " 条）。装配要等所有前置工序都完成，所以每一条路线都必须走完。",
        data: "paths", hotPath: idx
      });
    });
    const max = Math.max.apply(null, paths.map(p => p.len));
    const crit = paths.filter(p => p.len === max);
    const cp = crit[0];
    const cpe = [];
    for (let i = 0; i + 1 < cp.nodes.length; i += 1) cpe.push(E.find(e => e.u === cp.nodes[i] && e.v === cp.nodes[i + 1]));
    const onAll = cpe.filter(e => crit.every(p => p.nodes.some((x, i) => x === e.u && p.nodes[i + 1] === e.v)));
    const bn = (onAll.length ? onAll : cpe).reduce((b, e) => (!b || e.w > b.w ? e : b), null);
    const nodes = {};
    const edges = {};
    for (let i = 0; i < N; i += 1) nodes[i] = "dim";
    E.forEach(e => { edges[key(e.u, e.v)] = "dim"; });
    crit.forEach(p => {
      p.nodes.forEach(i => { nodes[i] = "done"; });
      for (let i = 0; i + 1 < p.nodes.length; i += 1) edges[key(p.nodes[i], p.nodes[i + 1])] = "res";
    });
    edges[key(bn.u, bn.v)] = "hot";
    steps.push({
      name: "关键路线与瓶颈", badge: "结论", tone: "ok",
      view: { nodes, edges },
      formula: "T = max{" + paths.map(p => p.len).join(", ") + "} = " + ft(max + " h", "ok") + "；瓶颈段 " + ft(arrow(bn.u, bn.v) + "（" + bn.w + " h）"),
      text: (crit.length > 1 ? "有 " + crit.length + " 条并列最长的路线（绿色），它们都是关键路线，共同决定一件产品最快 " + max + " h 完工；各条关键路线共有的最耗时一段 " : "最长的路线 " + pathText(cp.nodes) + "（绿色）叫关键路线，它决定一件产品最快 " + max + " h 完工；关键路线上最耗时的一段 ") +
        arrow(bn.u, bn.v) + "（红色）就是瓶颈。点左侧「优化瓶颈」缩短它，看关键路线会不会换人。",
      data: "paths", hotPath: -1
    });
    M.result = { T: max, crit, bn, count: paths.length };
    return steps;
  }

  /* ---------- 进阶层 ---------- */
  function advancedSteps(M) {
    const { E, A, Wr, S, K } = M;
    const steps = [];
    steps.push({
      name: "建模：工序网络", badge: "建模",
      formula: "D = ⟨V, E⟩，|V| = " + N + "，|E| = " + E.length + "，边权 w = 流转时长 (h)",
      text: "顶点 = 工序，有向边 = “前道完工后道才能开始”。本层用矩阵回答两个问题：① 哪些工序之间存在直接或间接依赖？② 哪条工序链决定完工时间、瓶颈在哪？",
      data: "A"
    });
    steps.push({
      name: "邻接矩阵 A", badge: "A",
      formula: "A = (aᵢⱼ)" + N + "×" + N + "，aᵢⱼ = 1 ⟺ ⟨Vi, Vj⟩ ∈ E，共 " + ft(E.length + " 个 1"),
      text: "A 只记录“一步直达”的依赖，看不出 V0 与 V5 之间隔着几道工序的间接依赖。下面用 Warshall 算法逐个允许中转工序，把间接依赖补全。可在「邻接矩阵 A」页签点击上三角单元格增删依赖（按编号只允许前→后，保证无回路）。",
      data: "A"
    });
    Wr.snaps.forEach(s => {
      const k = s.k;
      const prevW = k === 0 ? A : Wr.snaps[k - 1].W;
      const ins = [];
      const outs = [];
      for (let i = 0; i < N; i += 1) { if (prevW[i][k]) ins.push(i); if (prevW[k][i]) outs.push(i); }
      const nodes = { [k]: "cur" };
      s.added.forEach(p => { if (nodes[p[0]] == null) nodes[p[0]] = "done"; if (nodes[p[1]] == null) nodes[p[1]] = "done"; });
      const edges = {};
      E.forEach(e => { if (e.v === k || e.u === k) edges[key(e.u, e.v)] = "hot"; });
      steps.push({
        name: "Warshall：经 " + V(k) + " 中转", badge: "k = " + V(k), tone: "gold",
        view: { nodes, edges, reach: s.added },
        formula: "wᵢⱼ ← wᵢⱼ ∨ (wᵢ" + "ₖ ∧ wₖⱼ)，k = " + V(k) + "；新增 " + ft(s.added.length + " 个 1", s.added.length ? "gold" : "hot") +
          (s.added.length ? "：" + s.added.map(p => arrow(p[0], p[1])).join("，") : ""),
        text: "能到达 " + V(k) + " 的工序（第 " + V(k) + " 列的 1）：" + list(ins.map(V)) + "；" + V(k) + " 能到达的工序（第 " + V(k) + " 行的 1）：" + list(outs.map(V)) + "。" +
          (s.added.length ? "两两配对后，原来为 0 的位置置 1（金色）；图上金色虚线就是新发现的间接依赖。" : (ins.length && outs.length ? "配对结果都已为 1，本轮没有新增。" : "其中一侧为空，本轮没有新增。")),
        data: "W", k
      });
    });
    const R = Wr.R;
    const down = R.map(r => r.reduce((a, b) => a + b, 0) - 1);
    const mid = [];
    for (let i = 0; i < N; i += 1) if (i !== 0 && down[i] > 0) mid.push(i);
    const top = mid.sort((a, b) => down[b] - down[a] || a - b)[0];
    steps.push({
      name: "可达矩阵 R", badge: "R", tone: "ok",
      view: top != null ? { nodes: { [top]: "cur" } } : {},
      formula: "R = I ∨ W⁽" + N + "⁾ = I ∨ A ∨ A² ∨ … ∨ A" + supN(N - 1) + "，共 " + ft(R.flat().filter(Boolean).length + " 个 1", "ok"),
      text: "按教材约定每个工序可达自身，主对角线补 1。第 i 行 1 的个数 − 1 = Vi 的下游工序数：V0 的下游有 " + down[0] + " 道" +
        (top != null ? "；中间工序里 " + V(top) + " " + NAMES[top] + " 的下游最多（" + down[top] + " 道），它一旦停摆波及面最大" : "") + "。R 只回答“有没有依赖”，不回答“要多久”——完工时间还要看边权。",
      data: "R"
    });
    if (!K.ok || !S) return steps;
    const multi = [];
    for (let v = 0; v < N; v += 1) {
      const ins = E.filter(e => e.v === v);
      if (ins.length >= 2 && !multi.length) multi.push(v, ins);
    }
    const ex = multi.length ? "例如 ES(" + V(multi[0]) + ") = max{" + multi[1].map(e => S.ES[e.u] + "+" + e.w).join(", ") + "} = " + S.ES[multi[0]] + "。" : "";
    steps.push({
      name: "顺推最早开始 ES", badge: "ES", tone: "gold",
      view: { tags: S.ES.map(x => "ES " + x) },
      formula: "ES(Vj) = max{ ES(Vi) + w(Vi, Vj) }，ES(V0) = 0；" + ft("T = " + S.T + " h"),
      text: "按拓扑序（本例编号顺序就是一种拓扑序）逐点顺推：一道工序要等它所有前道工序都到达才能开始，所以取最大值。" + ex,
      data: "ES"
    });
    const cn = {};
    S.path.forEach(i => { cn[i] = "done"; });
    const ce = edgeMap(S.crit, "res");
    steps.push({
      name: "关键路径", badge: "CP", tone: "ok",
      view: { nodes: cn, edges: ce, tags: S.ES.map(x => "ES " + x), dimOthers: true },
      formula: "关键路径 " + ft(pathText(S.path), "ok") + (S.nCP > 1 ? "（共 " + S.nCP + " 条并列，绿色边均为关键边）" : "") + "，长度 " + ft(S.T + " h", "ok"),
      text: "从终点倒推，只保留“取到最大值”的边（ES(Vi) + w = ES(Vj) 且无时差），就得到关键路径。它上面任何一段延误，完工时间都会同步推迟；其余路线有富余时间。",
      data: "ES"
    });
    const bn = S.bottleneck;
    const be = Object.assign({}, ce);
    if (bn) be[key(bn.u, bn.v)] = "hot";
    steps.push({
      name: "瓶颈判定", badge: "瓶颈", tone: "bad",
      view: { nodes: cn, edges: be, dimOthers: true },
      formula: "瓶颈 = " + (S.nCP > 1 ? "各条关键路径共有的" : "关键路径上") + "用时最长的一段：" + ft(bn ? arrow(bn.u, bn.v) + "（" + NAMES[bn.u] + "→" + NAMES[bn.v] + "，" + bn.w + " h）" : "无"),
      text: "缩短非关键路线上的工序并不能缩短工期，应优先给瓶颈段扩能。点击左侧「优化瓶颈」把它缩短 2 h，再看关键路径是否转移——瓶颈消除后，新的瓶颈往往会出现在别处。",
      data: "ES"
    });
    M.result = { T: S.T, path: S.path, bn, down, top, nCP: S.nCP };
    return steps;
  }
  function supN(n) { return String(n).split("").map(d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]).join(""); }

  /* ---------- 拓展层 ---------- */
  function extendSteps(M) {
    const { E, K, S, S0 } = M;
    const steps = [];
    steps.push({
      name: "工序网络与入度", badge: "入度",
      view: { tags: K.start.map(d => "入度 " + d) },
      formula: "|V| = " + N + "，|E| = " + E.length + "；d⁻ = (" + K.start.join(", ") + ")",
      text: "排产首先要回答：按什么顺序开工才不违反依赖？入度为 0 的工序没有前置约束，可以最先开工。拓扑排序（Kahn 算法）反复取出入度为 0 的工序并删去它的出边。" + (state.rework ? "当前已加入返工边 ⟨V6,V3⟩（质检不合格返回热处理）。" : ""),
      data: "Adeg"
    });
    K.trace.forEach((t, idx) => {
      const nodes = {};
      t.order.forEach(i => { nodes[i] = "done"; });
      nodes[t.v] = "cur";
      const edges = {};
      E.filter(e => e.u === t.v).forEach(e => { edges[key(e.u, e.v)] = "hot"; });
      t.order.slice(0, -1).forEach(u => E.filter(e => e.u === u).forEach(e => { edges[key(e.u, e.v)] = "fade"; }));
      steps.push({
        name: "拓扑排序：取出 " + V(t.v), badge: "第 " + (idx + 1) + " 位", tone: "gold",
        view: { nodes, edges, tags: t.indeg.map((d, i) => (t.order.includes(i) ? "" : "入度 " + d)) },
        formula: "取出 " + ft(V(t.v)) + "，删去其出边 → 入度变为 0：" + list(t.freed.map(V)) + "；待选 = [" + t.queue.map(V).join(", ") + "]",
        text: "排产序列：" + t.order.map(i => V(i) + " " + NAMES[i]).join(" → ") + "。" + (idx === 0 ? "同时有多道工序可选时，本页按编号从小到大取，拓扑序并不唯一。" : ""),
        data: "topo", t
      });
    });
    if (!K.ok) {
      const cyc = M.cycle;
      const ce = {};
      for (let i = 0; i < cyc.length; i += 1) ce[key(cyc[i], cyc[(i + 1) % cyc.length])] = "hot";
      const nodes = {};
      K.order.forEach(i => { nodes[i] = "done"; });
      cyc.forEach(i => { nodes[i] = "cur"; });
      steps.push({
        name: "检测到有向回路", badge: "不可行", tone: "bad",
        view: { nodes, edges: ce },
        formula: "剩余 {" + K.rest.map(V).join(", ") + "} 入度均不为 0 ⟹ 存在回路 " + ft(cyc.concat(cyc[0]).map(V).join("→")),
        text: "待选队列已空，但还有 " + K.rest.length + " 道工序没排上——它们的入度始终不为 0。原因是返工边让“热处理 → 装配 → 质检 → 热处理”首尾相接：有向图有回路时不存在拓扑序，排不出一次性工序计划。现实中要把返工拆成独立批次或限定返工次数，恢复为无环图后再排产。",
        data: "topo", t: K.trace[K.trace.length - 1]
      });
      M.result = { cycle: cyc, rest: K.rest };
      return steps;
    }
    steps.push({
      name: "顺推最早开始 ES", badge: "ES", tone: "gold",
      view: { tags: S.ES.map(x => "ES " + x) },
      formula: "按拓扑序：ES(Vj) = max{ ES(Vi) + w(Vi,Vj) }；" + ft("T = ES(V" + (N - 1) + ") = " + S.T + " h"),
      text: "沿刚得到的排产序列顺推，每道工序取所有前道“最晚到达”的时刻。T 是在工序依赖约束下的最短完工时间。",
      data: "T", cols: ["ES"]
    });
    steps.push({
      name: "逆推最迟开始 LS", badge: "LS", tone: "gold",
      view: { tags: S.LS.map(x => "LS " + x) },
      formula: "LS(V" + (N - 1) + ") = T = " + S.T + "；LS(Vi) = min{ LS(Vj) − w(Vi,Vj) }",
      text: "倒过来沿拓扑序逆推：在不推迟总工期的前提下，每道工序最迟什么时候必须开始。例如 LS(V4) = min{" + E.filter(e => e.u === 4).map(e => S.LS[e.v] + "−" + e.w).join(", ") + "} = " + S.LS[4] + "。",
      data: "T", cols: ["ES", "LS"]
    });
    const cn = {};
    for (let i = 0; i < N; i += 1) cn[i] = S.slack[i] === 0 ? "done" : "normal";
    const ce = edgeMap(S.crit, "res");
    const critNodes = [];
    for (let i = 0; i < N; i += 1) if (S.slack[i] === 0) critNodes.push(i);
    steps.push({
      name: "时差与关键工序", badge: "时差", tone: "ok",
      view: { nodes: cn, edges: ce, tags: S.slack.map(x => "时差 " + x) },
      formula: "时差 = LS − ES；时差为 0：" + ft(critNodes.map(V).join(", "), "ok") + " ⟹ 关键路径 " + ft(pathText(S.path), "ok"),
      text: "时差为 0 的工序没有任何缓冲，连成关键路径；时差大于 0 的工序（" + list(S.slack.map((s, i) => s > 0 ? V(i) + " " + s + " h" : null).filter(Boolean)) + "）可以在时差范围内推迟，而不影响总工期。",
      data: "T", cols: ["ES", "LS", "slack"]
    });
    const dk = state.delayKey.split("-").map(Number);
    const baseEdge = S0 && state.edges.find(e => key(e.u, e.v) === state.delayKey);
    const eSlack = baseEdge ? S0.LS[dk[1]] - S0.ES[dk[0]] - baseEdge.w : 0;
    const de = Object.assign({}, ce);
    de[state.delayKey] = "gold";
    const within = state.delay <= eSlack;
    steps.push({
      name: "数字孪生：扰动推演", badge: within ? "工期不变" : "工期推迟", tone: within ? "ok" : "bad",
      view: { nodes: cn, edges: de },
      formula: "扰动 " + ft(arrow(dk[0], dk[1]) + " 延误 Δ = " + state.delay + " h", "gold") + "（该段时差 " + eSlack + " h）⟹ T = " + S0.T + " → " + ft(S.T + " h", within ? "ok" : "hot"),
      text: within
        ? "延误没有超过这一段的时差，总工期保持 " + S.T + " h——时差就是非关键工序的“缓冲”。拖动左侧「延误 Δ」超过 " + eSlack + " h，或把扰动放到关键路径上，再观察孪生模型的推演结果。"
        : "延误超过时差 " + (state.delay - eSlack) + " h，总工期推迟到 " + S.T + " h，关键路径变为 " + pathText(S.path) + "。数字孪生的价值就在这里：先在模型里推演扰动，再决定调度与补救。",
      data: "T", cols: ["ES", "LS", "slack"]
    });
    M.result = { T: S.T, T0: S0.T, path: S.path, eSlack, within };
    return steps;
  }

  /* ---------- 绘图（SVG） ---------- */
  function svgEl(tag, attrs, parent) {
    const el = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(el);
    return el;
  }
  function layout(w, h) {
    const vertical = w < 600;
    const mx = vertical ? 70 : 60;
    const my = vertical ? 50 : 56;
    return cfg.pos.map(p => {
      const a = p[0] / (cfg.cols - 1);
      const b = p[1];
      if (vertical) return { x: mx + b * (w - 2 * mx), y: my + a * (h - 2 * my) };
      return { x: mx + a * (w - 2 * mx), y: my + b * (h - 2 * my) };
    });
  }
  function draw() {
    const st = MODEL.steps[state.step];
    const view = st.view || {};
    lastW = graphBox.clientWidth;
    const w = Math.max(300, lastW || 800);
    const vertical = w < 600;
    const h = vertical ? 100 + 112 * (cfg.cols - 1) : 400;
    graphBox.innerHTML = "";
    const svg = svgEl("svg", { viewBox: "0 0 " + w + " " + h, role: "img", "aria-label": cfg.stage, height: h, style: "height:" + h + "px" }, graphBox);
    const defs = svgEl("defs", {}, svg);
    [["n", C.muted], ["hot", C.red], ["res", C.green], ["gold", "#C58A00"], ["fade", "#C9BBB0"]].forEach(m => {
      const mk = svgEl("marker", { id: "mfg-ar-" + m[0], viewBox: "0 0 10 10", refX: "9", refY: "5", markerUnits: "userSpaceOnUse", markerWidth: "12", markerHeight: "12", orient: "auto-start-reverse" }, defs);
      svgEl("path", { d: "M0,0 L10,5 L0,10 z", fill: m[1] }, mk);
    });
    const P = layout(w, h);
    const r = w < 600 ? 17 : 20;
    const gE = svgEl("g", {}, svg);
    const gL = svgEl("g", {}, svg);
    const gN = svgEl("g", {}, svg);
    const E = MODEL.E;
    if (!view.hideEdges) {
      E.forEach(e => {
        let s = (view.edges && view.edges[key(e.u, e.v)]) || (view.dimOthers ? "fade" : "n");
        if (s === "dim") s = "fade";
        const a = P[e.u];
        const b = P[e.v];
        let d;
        let mid;
        if (e.rework) {
          const cx = (a.x + b.x) / 2 + (w < 600 ? 80 : 0);
          const cy = (a.y + b.y) / 2 + (w < 600 ? 0 : -90);
          const t0 = shorten(a, { x: cx, y: cy }, r + 3);
          const t1 = shorten(b, { x: cx, y: cy }, r + 5);
          d = "M" + t0.x + "," + t0.y + " Q" + cx + "," + cy + " " + t1.x + "," + t1.y;
          mid = { x: (a.x + b.x) / 4 + cx / 2, y: (a.y + b.y) / 4 + cy / 2 };
        } else {
          const t0 = shorten(a, b, r + 2);
          const t1 = shorten(b, a, r + 5);
          d = "M" + t0.x + "," + t0.y + " L" + t1.x + "," + t1.y;
          mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        }
        const stroke = s === "hot" ? C.red : s === "res" ? C.green : s === "gold" ? "#E0A000" : s === "fade" ? "rgba(107,74,56,0.2)" : C.edge;
        const sw = s === "hot" || s === "res" || s === "gold" ? 3.6 : 1.8;
        const mk = s === "hot" ? "hot" : s === "res" ? "res" : s === "gold" ? "gold" : s === "fade" ? "fade" : "n";
        svgEl("path", { d, fill: "none", stroke, "stroke-width": sw, "marker-end": "url(#mfg-ar-" + mk + ")", "stroke-dasharray": e.rework ? "7 5" : "none" }, gE);
        const lab = e.w + " h";
        const bw = 12 + lab.length * 7;
        const col = s === "hot" ? C.red : s === "res" ? C.green : s === "fade" ? "#B9A89B" : C.muted;
        svgEl("rect", { x: mid.x - bw / 2, y: mid.y - 10, width: bw, height: 20, rx: 9, fill: "rgba(255,251,240,0.95)", stroke: col, "stroke-width": s === "n" ? 0.8 : 1.4 }, gL);
        const tx = svgEl("text", { x: mid.x, y: mid.y + 4.5, "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: col, class: "mono" }, gL);
        tx.textContent = lab;
      });
    }
    (view.reach || []).forEach(p => {
      const a = P[p[0]];
      const b = P[p[1]];
      const t0 = shorten(a, b, r + 2);
      const t1 = shorten(b, a, r + 5);
      const cx = (t0.x + t1.x) / 2 + (t1.y - t0.y) * 0.18;
      const cy = (t0.y + t1.y) / 2 - (t1.x - t0.x) * 0.18;
      svgEl("path", { d: "M" + t0.x + "," + t0.y + " Q" + cx + "," + cy + " " + t1.x + "," + t1.y, fill: "none", stroke: "#E0A000", "stroke-width": 2.2, "stroke-dasharray": "6 5", "marker-end": "url(#mfg-ar-gold)" }, gE);
    });
    for (let i = 0; i < N; i += 1) {
      let s = (view.nodes && view.nodes[i]) || (view.dimOthers ? "dim" : "normal");
      if (state.picked === i && s === "normal") s = "cur";
      const p = P[i];
      const g = svgEl("g", { class: "node", tabindex: "0", role: "button", "aria-label": V(i) + " " + NAMES[i], "data-i": i }, gN);
      const fill = s === "cur" ? C.gold : s === "done" ? C.green : C.red;
      svgEl("circle", { cx: p.x, cy: p.y, r, fill, stroke: "#FFFBF0", "stroke-width": 3, opacity: s === "dim" ? 0.35 : 1 }, g);
      const t = svgEl("text", { x: p.x, y: p.y + 4.5, "text-anchor": "middle", "font-size": 13, "font-weight": 800, fill: s === "cur" ? C.ink : "#fff", class: "mono" }, g);
      t.textContent = V(i);
      const side = vertical ? (cfg.pos[i][1] < 0.5 ? -1 : 1) : 0;
      const nm = svgEl("text", side ? { x: p.x + side * (r + 6), y: p.y + 4.5, "text-anchor": side > 0 ? "start" : "end" } : { x: p.x, y: p.y + r + 16, "text-anchor": "middle" }, g);
      nm.setAttribute("font-size", 13);
      nm.setAttribute("font-weight", 700);
      nm.setAttribute("fill", s === "dim" ? "#B9A89B" : C.ink);
      nm.textContent = NAMES[i];
      const tag = view.tags && view.tags[i];
      if (tag) {
        const tw = 12 + Array.from(tag).reduce((a, ch) => a + (ch.charCodeAt(0) > 255 ? 11.5 : 7), 0);
        svgEl("rect", { x: p.x - tw / 2, y: p.y - r - 24, width: tw, height: 19, rx: 9, fill: C.paper, stroke: "#E0A000", "stroke-width": 1.2 }, g);
        const tt = svgEl("text", { x: p.x, y: p.y - r - 10.5, "text-anchor": "middle", "font-size": 11.5, "font-weight": 700, fill: C.ink }, g);
        tt.textContent = tag;
      }
    }
  }
  function shorten(a, b, d) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const L = Math.hypot(dx, dy) || 1;
    return { x: +(a.x + dx / L * d).toFixed(1), y: +(a.y + dy / L * d).toFixed(1) };
  }

  /* ---------- 数据卡 ---------- */
  function matrixHtml(M, opt) {
    opt = opt || {};
    const cols = opt.cols || M[0].map((_, j) => V(j));
    let h = '<div class="scroll-x"><table class="mx"><thead><tr><th></th>';
    cols.forEach((c, j) => { h += '<th class="' + (opt.hotCol === j ? "gold" : "") + '">' + c + "</th>"; });
    if (opt.rowSum) h += "<th>" + opt.rowSum + "</th>";
    h += "</tr></thead><tbody>";
    M.forEach((row, i) => {
      h += '<tr><th class="' + (opt.hotRow === i ? "gold" : "") + '">' + V(i) + "</th>";
      row.forEach((x, j) => {
        let cls = "cell";
        if (opt.cls) cls += " " + opt.cls(i, j, x);
        else if (x) cls += " one";
        const txt = String(x);
        if (opt.edit) {
          const ok = j > i;
          h += '<td><button type="button" class="' + cls + '" data-cell="' + i + "," + j + '"' + (ok ? "" : " disabled") + ' aria-label="' + V(i) + "到" + V(j) + " = " + txt + '" title="' + (ok ? "点击切换依赖 " + arrow(i, j) : "只允许前道指向后道（保持无回路）") + '">' + txt + "</button></td>";
        } else {
          h += '<td><span class="' + cls + '">' + txt + "</span></td>";
        }
      });
      if (opt.rowSum) h += '<td class="sum">' + (row.reduce((a, b) => a + (b === 1 ? 1 : 0), 0) + (opt.rowSumAdj || 0)) + "</td>";
      h += "</tr>";
    });
    if (opt.colSum) {
      h += "<tr><th>" + opt.colSum + "</th>";
      M[0].forEach((_, j) => { h += '<td class="sum">' + M.reduce((a, r) => a + (r[j] === 1 ? 1 : 0), 0) + "</td>"; });
      h += "</tr>";
    }
    return h + "</tbody></table></div>";
  }

  function dataHtml(st) {
    const E = MODEL.E;
    const tab = state.tab;
    const what = tab === "step" ? st.data : tab;
    const A = MODEL.A;
    const editable = LEVEL === "advanced";
    let title = "";
    let body = "";
    let note = "";
    if (what === "vertices") {
      title = "顶点集 V（工序）";
      body = '<table class="tbl"><thead><tr><th>顶点</th><th>工序</th><th>说明</th></tr></thead><tbody>' +
        NAMES.map((x, i) => '<tr><td class="num">' + V(i) + "</td><td>" + x + "</td><td>" + (i === 0 ? "产线入口" : i === N - 1 ? "产线出口" : "中间工序") + "</td></tr>").join("") + "</tbody></table>";
    } else if (what === "edges") {
      title = "有向边集 E（依赖）";
      body = '<table class="tbl"><thead><tr><th>有向边</th><th>含义</th><th>时长</th></tr></thead><tbody>' +
        E.map(e => '<tr><td class="num">⟨' + V(e.u) + "," + V(e.v) + "⟩</td><td>" + NAMES[e.u] + " 完成后才能" + NAMES[e.v] + '</td><td class="num">' + e.w + " h</td></tr>").join("") + "</tbody></table>";
    } else if (what === "A" || what === "Adeg") {
      title = "邻接矩阵 A";
      const sums = what === "Adeg" || tab === "A";
      body = matrixHtml(A, { edit: editable && tab === "A", rowSum: sums ? "d⁺" : null, colSum: sums ? "d⁻" : null });
      note = editable && tab === "A" ? "点击上三角单元格可增删依赖（新依赖默认 2 h）；下三角禁用，因为按编号“后道指向前道”会形成回路。" : "行和 = 出度 d⁺，列和 = 入度 d⁻。";
    } else if (what === "W") {
      const s = MODEL.Wr.snaps[st.k];
      const added = new Set(s.added.map(p => key(p[0], p[1])));
      title = "Warshall 第 " + (st.k + 1) + " 轮：W⁽" + (st.k + 1) + "⁾（k = " + V(st.k) + "）";
      body = matrixHtml(s.W, { hotRow: st.k, hotCol: st.k, cls: (i, j, x) => (added.has(key(i, j)) ? "new" : x ? "one" : "") });
      note = "金色表头 = 第 k 行与第 k 列；金色单元格 = 本轮新增的 1。";
    } else if (what === "R") {
      title = "可达矩阵 R = I ∨ A ∨ A² ∨ … ";
      body = matrixHtml(MODEL.Wr.R, { cls: (i, j, x) => (i === j ? "diag" : x ? "one" : ""), rowSum: "下游数", rowSumAdj: -1 });
      note = "绿色对角线 = 自身可达（教材约定）；“下游数” = 该行 1 的个数 − 1。";
    } else if (what === "M") {
      const cols = E.map((e, j) => "e" + (j + 1));
      const Mi = Array.from({ length: N }, (_, i) => E.map(e => (e.u === i ? 1 : e.v === i ? -1 : 0)));
      title = "关联矩阵 M（" + N + "×" + E.length + "）";
      body = matrixHtml(Mi, { cols, cls: (i, j, x) => (x === 1 ? "one" : x === -1 ? "neg" : "") });
      note = "mᵢⱼ = 1：Vi 是边 eⱼ 的起点；−1：终点。每列恰有一个 1 和一个 −1，所以列和为 0；第 i 行 1 的个数 = 出度，−1 的个数 = 入度。边序：" +
        E.map((e, j) => "e" + (j + 1) + "=" + arrow(e.u, e.v)).join("，") + "。";
    } else if (what === "paths") {
      const ps = MODEL.paths;
      const max = Math.max.apply(null, ps.map(p => p.len));
      title = "V0 → V" + (N - 1) + " 的全部工艺路线";
      body = '<table class="tbl"><thead><tr><th>#</th><th>路线</th><th>时长</th></tr></thead><tbody>' +
        ps.map((p, i) => '<tr class="' + (st.hotPath === i ? "hot" : st.hotPath === -1 && p.len === max ? "ok" : "") + '"><td class="num">' + (i + 1) + '</td><td class="num">' + pathText(p.nodes) + '</td><td class="num">' + p.ws.join("+") + " = " + p.len + " h</td></tr>").join("") + "</tbody></table>";
      note = "最短完工时间 = 最长路线的长度（所有路线都走完，产品才完工）。";
    } else if (what === "ES") {
      const S = MODEL.S;
      title = "最早开始时间 ES（按拓扑序）";
      body = '<table class="tbl"><thead><tr><th>工序</th><th>前道</th><th>ES 计算</th><th>ES</th></tr></thead><tbody>' +
        MODEL.K.order.map(v => {
          const ins = E.filter(e => e.v === v);
          const onCp = S.path.includes(v);
          return '<tr class="' + (onCp && st.name !== "顺推最早开始 ES" ? "ok" : "") + '"><td>' + V(v) + " " + NAMES[v] + '</td><td class="num">' + (ins.map(e => V(e.u)).join(",") || "—") + '</td><td class="num">' + (ins.length ? "max{" + ins.map(e => S.ES[e.u] + "+" + e.w).join(", ") + "}" : "起点") + '</td><td class="num">' + S.ES[v] + "</td></tr>";
        }).join("") + "</tbody></table>";
    } else if (what === "topo") {
      const t = st.t;
      title = "Kahn 拓扑排序";
      body = '<div class="chip-row">' + t.order.map((v, i) => '<span class="chip ' + (i === t.order.length - 1 && st.tone !== "bad" ? "gold" : "ok") + '">' + (i + 1) + ". " + V(v) + " " + NAMES[v] + "</span>").join("") + "</div>" +
        '<table class="tbl"><thead><tr><th>工序</th>' + NAMES.map((_, i) => "<th>" + V(i) + "</th>").join("") + "</tr></thead><tbody>" +
        '<tr><td>剩余入度</td>' + t.indeg.map((d, i) => '<td class="num">' + (t.order.includes(i) ? "✓" : d) + "</td>").join("") + "</tr></tbody></table>";
      note = st.tone === "bad" ? "剩余工序入度都 > 0：图中有回路，拓扑排序失败。" : "✓ = 已排入序列；待选队列 = [" + t.queue.map(V).join(", ") + "]。";
    } else if (what === "T") {
      const S = MODEL.S;
      const cols = tab === "T" ? ["ES", "LS", "slack"] : (st.cols || ["ES", "LS", "slack"]);
      if (!S) {
        title = "时间参数表";
        body = '<p class="data-note">存在回路时无法计算 ES / LS（没有拓扑序）。取消「返工回路」后再查看。</p>';
      } else {
        title = "时间参数表（T = " + S.T + " h）";
        body = '<table class="tbl"><thead><tr><th>工序</th>' + cols.map(c => "<th>" + (c === "slack" ? "时差" : c) + "</th>").join("") + "</tr></thead><tbody>" +
          MODEL.K.order.map(v => '<tr class="' + (cols.includes("slack") && S.slack[v] === 0 ? "ok" : "") + '"><td>' + V(v) + " " + NAMES[v] + "</td>" +
            cols.map(c => '<td class="num">' + (c === "ES" ? S.ES[v] : c === "LS" ? S.LS[v] : S.slack[v]) + "</td>").join("") + "</tr>").join("") + "</tbody></table>";
        note = "时差 = LS − ES；绿色行 = 关键工序。";
      }
    } else if (!what) {
      return dataHtml(Object.assign({}, st, { data: "A" }));
    }
    if (MODEL.K && !MODEL.K.ok && what === "A" && LEVEL === "extend" && state.rework) note += " 返工边 ⟨V6,V3⟩ 位于下三角（后道指向前道）。";
    const tabs = cfg.tabs.map(t => '<button type="button" data-tab="' + t[0] + '" class="' + (state.tab === t[0] ? "on" : "") + '" aria-pressed="' + (state.tab === t[0]) + '">' + t[1] + "</button>").join("");
    return '<div class="data-head"><h3>' + title + '</h3><div class="data-tabs" role="group" aria-label="数据视图">' + tabs + "</div></div>" + body + (note ? '<p class="data-note">' + note + "</p>" : "");
  }

  /* ---------- 案例六段式 ---------- */
  const IDEO = (window.SECTION_META && window.SECTION_META.ideology) || {};
  function flowHtml() {
    const R = MODEL.result || {};
    let items;
    if (LEVEL === "basic") {
      items = [
        ["情境背景", "某零部件车间有 6 道工序：原料 → 粗加工 / 钻铣 → 热处理 / 精加工 → 装配成品。车间主任想知道：一件产品最快多久完工？卡在哪一段？"],
        ["数学建模", "工序 → 顶点；“u 完成后 v 才能开始” → 有向边 ⟨u,v⟩；流转时长 → 边权。得到一个没有回路的有向图，并用 0-1 邻接矩阵存储。"],
        ["交互求解", "点「下一步」依次建立顶点、有向边、邻接矩阵，数出入度，再枚举从 V0 到 V5 的全部工艺路线并求和比较。"],
        ["结果解读", R.crit ? "共 " + R.count + " 条工艺路线，最长 " + R.T + " h" + (R.crit.length > 1 ? "（" + R.crit.length + " 条并列）" : "（" + pathText(R.crit[0].nodes) + "）") + "：一件产品最快 " + R.T + " h 完工，瓶颈段是 " + arrow(R.bn.u, R.bn.v) + "（" + R.bn.w + " h）。" : ""],
        ["价值引领", IDEO.text || ""],
        ["迁移思考", "如果两道工序可以互相等待（出现回路），这张图还能排出先后顺序吗？把“工序”换成“课程先修关系”，同样的模型能回答什么问题？"]
      ];
    } else if (LEVEL === "advanced") {
      items = [
        ["情境背景", "产线扩展到 7 道工序、9 条依赖。设备改造前，工艺科要回答：哪些工序存在间接依赖（牵一发动全身）？整线完工时间由谁决定？该先给哪一段扩能？"],
        ["数学建模", "有向无环图 D = ⟨V,E,w⟩；邻接矩阵 A 刻画直接依赖，可达矩阵 R = I ∨ A ∨ … ∨ A⁶ 刻画间接依赖；最长路（关键路径）刻画完工时间。"],
        ["交互求解", "逐步执行 Warshall 算法（每轮允许一个新的中转工序），得到 R；再按拓扑序顺推 ES，倒推关键路径并判定瓶颈。可编辑邻接矩阵、点「优化瓶颈」重算。"],
        ["结果解读", R.T != null ? "完工时间 T = " + R.T + " h，关键路径 " + pathText(R.path) + (R.nCP > 1 ? " 等 " + R.nCP + " 条" : "") + (R.bn ? "，瓶颈段 " + arrow(R.bn.u, R.bn.v) + "（" + R.bn.w + " h）" : "") + (R.top != null ? "；中间工序中 " + V(R.top) + " " + NAMES[R.top] + " 的下游最多（" + R.down[R.top] + " 道）" : "") + "。" : "请先完成全部步骤。"],
        ["价值引领", IDEO.text || ""],
        ["迁移思考", "可达矩阵还能用来检查什么？（提示：若某 Vi 与 Vj 互相可达，意味着什么？）关键路径长度与“节拍”（相邻两件产品下线的间隔）是一回事吗？"]
      ];
    } else {
      items = [
        ["情境背景", "工业互联网平台为产线建立数字孪生：8 道工序实时映射到模型中。计划员要排出开工顺序，并在设备延误、质检返工时迅速判断工期是否受影响。"],
        ["数学建模", "拓扑排序给出不违反依赖的开工序列；ES/LS 与时差刻画每道工序的缓冲；有向回路 ⟺ 不存在拓扑序，用来检测返工造成的死循环。"],
        ["交互求解", "逐步执行 Kahn 算法，再顺推 ES、逆推 LS、求时差；在左侧设置扰动工序段与延误 Δ，或加入返工回路，孪生模型立即重算。"],
        ["结果解读", R.cycle ? "存在回路 " + R.cycle.concat(R.cycle[0]).map(V).join("→") + "，拓扑排序失败，排产不可行，需先拆解返工。" : (R.T != null ? "基准工期 " + R.T0 + " h，当前扰动下 T = " + R.T + " h；扰动段时差 " + R.eSlack + " h，" + (R.within ? "延误在缓冲之内，工期不变。" : "延误超出缓冲，关键路径变为 " + pathText(R.path) + "。") : "")],
        ["价值引领", IDEO.text || ""],
        ["迁移思考", "同样的“拓扑排序 + 关键路径”还能用于软件构建依赖、项目进度计划（PERT/CPM）、课程先修排课。若工序时长是随机的，关键路径还会唯一吗？"]
      ];
    }
    return '<h3>案例六段式<small>' + cfg.tier + " · 情境背景 → 数学建模 → 交互求解 → 结果解读 → 价值引领 → 迁移思考</small></h3>" +
      '<div class="flow-grid">' + items.map((it, i) =>
        '<div class="flow-item' + (i === 3 ? " result" : i === 4 ? " value" : "") + '"><h4><span class="no">' + (i + 1) + "</span>" + it[0] + (i === 4 && IDEO.title ? " · " + esc(IDEO.title) : "") + "</h4><p>" + (i === 4 ? esc(it[1]) : it[1]) + "</p></div>"
      ).join("") + "</div>";
  }

  /* ---------- 渲染 ---------- */
  function render() {
    const st = MODEL.steps[state.step];
    $("formulaText").innerHTML = st.formula;
    $("stepStatus").innerHTML = state.note
      ? '<span class="badge gold">' + esc(state.noteBadge || "更新") + "</span><span><b>" + esc(state.note) + "</b><br>" + st.text + "</span>"
      : '<span class="badge ' + (st.tone || "") + '">' + esc(st.badge) + "</span><span>" + st.text + "</span>";
    draw();
    $("dataCard").innerHTML = dataHtml(st);
    $("caseFlow").innerHTML = flowHtml();
    renderStepList();
  }
  function renderStepList() {
    const box = $("stepList");
    const steps = MODEL.steps;
    if (box.childElementCount !== steps.length || box.dataset.sig !== steps.map(s => s.name).join("|")) {
      box.dataset.sig = steps.map(s => s.name).join("|");
      box.innerHTML = steps.map((s, i) => '<button type="button" class="step-item" data-i="' + i + '"><span class="num">' + (i + 1) + "</span><span>" + esc(s.name) + "</span></button>").join("");
    }
    Array.prototype.forEach.call(box.children, (el, i) => {
      el.classList.toggle("active", i === state.step);
      el.classList.toggle("done", i < state.step);
      el.setAttribute("aria-current", i === state.step ? "step" : "false");
    });
    $("progressFill").style.width = ((state.step + 1) / steps.length * 100) + "%";
    $("stepCounter").textContent = "第 " + (state.step + 1) + " / " + steps.length + " 步";
    $("prevBtn").disabled = state.step === 0;
    $("nextBtn").disabled = state.step === steps.length - 1;
  }
  function go(i) {
    state.step = Math.max(0, Math.min(MODEL.steps.length - 1, i));
    state.note = "";
    render();
  }
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
  function rebuild(jumpTo, note) {
    analyze();
    if (jumpTo === "last") state.step = MODEL.steps.length - 1;
    else if (typeof jumpTo === "number") state.step = Math.min(jumpTo, MODEL.steps.length - 1);
    state.note = note || "";
    state.noteBadge = "更新";
    render();
  }
  function resetAll() {
    stopPlay();
    state.edges = initialEdges();
    state.step = 0;
    state.tab = "step";
    state.picked = null;
    state.optimized = 0;
    state.delayKey = "2-4";
    state.delay = 0;
    state.rework = false;
    syncInputs();
    rebuild(0);
  }

  /* ---------- 控件 ---------- */
  function buildControls() {
    let scen = "";
    if (LEVEL === "basic") {
      scen = '<div class="ctl-card"><div class="ctl-title"><span>情境操作</span><small>改一个参数看结论变化</small></div>' +
        '<button type="button" class="btn" id="optBtn">优化瓶颈（增开工位 −2 h）</button></div>';
    } else if (LEVEL === "advanced") {
      scen = '<div class="ctl-card"><div class="ctl-title"><span>情境操作</span><small>矩阵与图联动</small></div>' +
        '<button type="button" class="btn" id="optBtn">优化瓶颈（瓶颈段 −2 h）</button>' +
        '<button type="button" class="btn" id="editBtn">编辑依赖（打开邻接矩阵 A）</button></div>';
    } else {
      const opts = state.edges.map(e => '<option value="' + key(e.u, e.v) + '">' + arrow(e.u, e.v) + " " + NAMES[e.u] + "→" + NAMES[e.v] + "（" + e.w + " h）</option>").join("");
      scen = '<div class="ctl-card"><div class="ctl-title"><span>数字孪生情境</span><small>改参数即重算</small></div>' +
        '<label class="ctl-row"><span>扰动工序段</span><select id="delayEdge">' + opts + "</select></label>" +
        '<label class="ctl-row"><span>延误 Δ = <b id="delayVal">0</b> h</span><input type="range" id="delayRange" min="0" max="4" step="1" value="0"></label>' +
        '<label class="ctl-check"><input type="checkbox" id="reworkChk"> 加入返工回路 ⟨V6,V3⟩（质检不合格返回热处理）</label></div>';
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
      "</div>" + scen +
      '<div class="step-list" id="stepList"></div>';

    $("prevBtn").addEventListener("click", () => { stopPlay(); go(state.step - 1); });
    $("nextBtn").addEventListener("click", () => { stopPlay(); go(state.step + 1); });
    $("playBtn").addEventListener("click", togglePlay);
    $("resetBtn").addEventListener("click", resetAll);
    $("speedRange").addEventListener("input", e => {
      state.speed = Number(e.target.value);
      $("speedVal").textContent = state.speed + "×";
      if (state.timer) { stopPlay(); togglePlay(); }
    });
    $("stepList").addEventListener("click", e => {
      const b = e.target.closest(".step-item");
      if (b) { stopPlay(); go(Number(b.dataset.i)); }
    });
    const opt = $("optBtn");
    if (opt) opt.addEventListener("click", optimize);
    const edit = $("editBtn");
    if (edit) edit.addEventListener("click", () => {
      state.tab = "A";
      render();
      $("dataCard").scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    if (LEVEL === "extend") {
      $("delayEdge").value = state.delayKey;
      $("delayEdge").addEventListener("change", e => { stopPlay(); state.delayKey = e.target.value; rebuild("last", "扰动工序段已切换为 " + e.target.value.split("-").map(V).join("→") + "。"); });
      $("delayRange").addEventListener("input", e => {
        stopPlay();
        state.delay = Number(e.target.value);
        $("delayVal").textContent = state.delay;
        rebuild("last", "孪生模型已按延误 Δ = " + state.delay + " h 重算。");
      });
      $("reworkChk").addEventListener("change", e => {
        stopPlay();
        state.rework = e.target.checked;
        rebuild("last", state.rework ? "已加入返工边 ⟨V6,V3⟩，重新拓扑排序。" : "已移除返工边，恢复为无环工序网络。");
      });
    }
  }
  function syncInputs() {
    if (LEVEL !== "extend") return;
    $("delayEdge").value = state.delayKey;
    $("delayRange").value = state.delay;
    $("delayVal").textContent = state.delay;
    $("reworkChk").checked = state.rework;
  }
  function optimize() {
    stopPlay();
    const S = MODEL.S;
    const bn = LEVEL === "basic" ? MODEL.result.bn : S && S.bottleneck;
    if (!bn) return;
    const e = state.edges.find(x => x.u === bn.u && x.v === bn.v);
    if (e.w <= 1) {
      rebuild("last", "瓶颈段 " + arrow(e.u, e.v) + " 已压缩到 1 h，不能再缩短；请看新的关键路径。");
      return;
    }
    const before = e.w;
    e.w = Math.max(1, e.w - 2);
    state.optimized += 1;
    const T0 = LEVEL === "basic" ? MODEL.result.T : S.T;
    analyze();
    const T1 = LEVEL === "basic" ? MODEL.result.T : MODEL.S.T;
    rebuild("last", arrow(e.u, e.v) + " 由 " + before + " h 缩短为 " + e.w + " h：完工时间 " + T0 + " h → " + T1 + " h" + (T0 - T1 < before - e.w ? "（只缩短了 " + (T0 - T1) + " h——关键路径已转移）" : "") + "。");
  }

  /* ---------- 交互：图与矩阵 ---------- */
  graphBox.addEventListener("click", e => {
    const g = e.target.closest(".node");
    if (g) pickNode(Number(g.dataset.i));
  });
  graphBox.addEventListener("keydown", e => {
    const g = e.target.closest(".node");
    if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pickNode(Number(g.dataset.i)); }
  });
  function pickNode(i) {
    state.picked = state.picked === i ? null : i;
    const E = MODEL.E;
    const pre = E.filter(e => e.v === i).map(e => V(e.u));
    const nxt = E.filter(e => e.u === i).map(e => V(e.v));
    let extra = "";
    if (LEVEL === "advanced") {
      const down = [];
      MODEL.Wr.R[i].forEach((x, j) => { if (x && j !== i) down.push(V(j)); });
      extra = "；可达（R 第 " + (i + 1) + " 行）：" + list(down);
    } else if (MODEL.S) {
      extra = "；ES = " + MODEL.S.ES[i] + "，时差 = " + MODEL.S.slack[i];
    }
    state.note = state.picked == null ? "" : V(i) + " " + NAMES[i] + "：前道 " + list(pre) + "；后续 " + list(nxt) + extra + "。";
    state.noteBadge = V(i);
    render();
  }
  $("dataCard").addEventListener("click", e => {
    const t = e.target.closest("[data-tab]");
    if (t) { state.tab = t.dataset.tab; render(); return; }
    const c = e.target.closest("[data-cell]");
    if (!c || c.disabled) return;
    const ij = c.dataset.cell.split(",").map(Number);
    const i = ij[0];
    const j = ij[1];
    const idx = state.edges.findIndex(x => x.u === i && x.v === j);
    let msg;
    if (idx >= 0) {
      if (state.edges.length <= 1) return;
      state.edges.splice(idx, 1);
      msg = "已删除依赖 " + arrow(i, j) + "，矩阵、可达关系与关键路径全部重算。";
    } else {
      const orig = ALL_EDGES.find(x => x[0] === i && x[1] === j);
      const w = orig ? orig[2] : 2;
      state.edges.push({ u: i, v: j, w, base: w });
      state.edges.sort((a, b) => a.u - b.u || a.v - b.v);
      msg = "已新增依赖 " + arrow(i, j) + "（" + w + " h），矩阵、可达关系与关键路径全部重算。";
    }
    stopPlay();
    rebuild(null, msg);
  });

  /* ---------- 启动 ---------- */
  const missionEl = $("missionText");
  if (missionEl) missionEl.innerHTML = "<b>互动任务：</b>" + esc(cfg.mission);
  const badgeEl = $("visualBadge");
  if (badgeEl) badgeEl.textContent = cfg.badge;
  const titleEl = $("stageTitle");
  if (titleEl) titleEl.innerHTML = esc(cfg.stage) + "<small>|V| = " + N + "</small>";
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
