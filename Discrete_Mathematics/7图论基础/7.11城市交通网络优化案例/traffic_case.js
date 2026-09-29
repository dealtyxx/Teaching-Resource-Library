/* ============================================================
   7.11 城市交通网络优化案例 · 三层统一交互引擎
   window.CASE_LEVEL = "basic" | "advanced" | "extend"
   三层同构：案例六段式（情境背景 → 数学建模 → 交互求解 → 结果解读 → 价值引领 → 迁移思考）
   基础层 认识模型（同顶点集上的慢行网 G1 与机动车网 G2：并 / 交 / 差 / 环和 / 相对补）
   进阶层 求解模型（混行冲突加权 → 最短路切换阈值；桥与割点 = 咽喉道路）
   拓展层 拓展模型（容量网络：最大流 = 最小割；Braess 悖论）
   说明：路网、时间与容量均为教学用虚构数据。
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  const PHASES = ["情境背景", "数学建模", "交互求解", "结果解读", "价值引领", "迁移思考"];
  const NAMES = "ABCDEFGHIJKL".split("");
  const NODES = NAMES.map((k, i) => ({ key: k, x: (i % 4) / 3, y: Math.floor(i / 4) / 2 }));
  const id = k => NAMES.indexOf(k);
  const ekey = (u, v) => Math.min(u, v) + "-" + Math.max(u, v);
  const E = s => { const a = id(s[0]), b = id(s[1]); return ekey(a, b); };
  const kname = k => { const [u, v] = k.split("-").map(Number); return NAMES[u] + NAMES[v]; };

  // 底图 H：3×4 网格上所有可建道路（17 条）
  const GRID = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const i = r * 4 + c;
    if (c < 3) GRID.push(ekey(i, i + 1));
    if (r < 2) GRID.push(ekey(i, i + 4));
  }
  const G1_0 = ["AB", "BC", "CD", "BF", "EF", "FG", "GK"].map(E);                          // 慢行网（自行车道）
  const G2_0 = ["AE", "EI", "EF", "FG", "GH", "IJ", "JK", "KL", "DH", "HL"].map(E);        // 机动车网
  // 机动车通行时间（分钟）
  const TIME = {};
  [["AE", 3], ["EI", 3], ["EF", 4], ["FG", 4], ["GH", 4], ["IJ", 5], ["JK", 5], ["KL", 5], ["DH", 3], ["HL", 3],
   ["AB", 4], ["BC", 4], ["CD", 4], ["BF", 3], ["CG", 3], ["GK", 3], ["FJ", 3]].forEach(([s, w]) => { TIME[E(s)] = w; });
  // 通行能力（辆/小时），FG 因与慢行混行而受限
  const CAP = {};
  [["EF", 1200], ["FG", 800], ["GH", 1500], ["EI", 1000], ["IJ", 1000], ["JK", 900], ["KL", 1000], ["HL", 1100]].forEach(([s, c]) => { CAP[E(s)] = c; });
  const CAP_FG_FIXED = 1200;

  const setOps = {
    union: (a, b) => a.filter(x => true).concat(b.filter(x => !a.includes(x))),
    inter: (a, b) => a.filter(x => b.includes(x)),
    diff: (a, b) => a.filter(x => !b.includes(x)),
    ring: (a, b) => a.filter(x => !b.includes(x)).concat(b.filter(x => !a.includes(x)))
  };
  function ops(g1, g2) {
    const U = setOps.union(g1, g2);
    return {
      union: U, inter: setOps.inter(g1, g2), d12: setOps.diff(g1, g2), d21: setOps.diff(g2, g1),
      ring: setOps.ring(g1, g2), rel: GRID.filter(k => !U.includes(k)),
      complete: NAMES.length * (NAMES.length - 1) / 2 - U.length
    };
  }
  function adjOf(keys, weight) {
    const adj = Array.from({ length: NAMES.length }, () => []);
    keys.forEach(k => {
      const [u, v] = k.split("-").map(Number);
      const w = weight ? weight(k) : 1;
      adj[u].push({ v, w, k }); adj[v].push({ v: u, w, k });
    });
    adj.forEach(l => l.sort((a, b) => a.v - b.v));
    return adj;
  }
  function dijkstra(keys, weight, s) {
    const adj = adjOf(keys, weight), n = NAMES.length;
    const dist = Array(n).fill(Infinity), pre = Array(n).fill(-1), done = Array(n).fill(false);
    dist[s] = 0;
    const order = [];
    for (;;) {
      let u = -1;
      for (let i = 0; i < n; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
      if (u < 0) break;
      done[u] = true; order.push(u);
      adj[u].forEach(({ v, w }) => { if (!done[v] && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pre[v] = u; } });
    }
    return { dist, pre, order };
  }
  function pathTo(pre, t) { const p = []; for (let c = t; c >= 0; c = pre[c]) p.push(c); return p.reverse(); }
  function pathKeys(p) { const o = []; for (let i = 0; i + 1 < p.length; i++) o.push(ekey(p[i], p[i + 1])); return o; }
  function carWeight(p) { const inter = setOps.inter(G1_0, G2_0); return k => TIME[k] + (inter.includes(k) ? p : 0); }
  function carRoute(p) {
    const r = dijkstra(G2_0, carWeight(p), id("A"));
    const path = pathTo(r.pre, id("D"));
    return { dist: r.dist, pre: r.pre, path, time: r.dist[id("D")] };
  }
  function reachable(keys, s) {
    const adj = adjOf(keys), seen = new Set([s]), q = [s];
    while (q.length) { const u = q.shift(); adj[u].forEach(({ v }) => { if (!seen.has(v)) { seen.add(v); q.push(v); } }); }
    return seen;
  }
  function verticesOf(keys) { const s = new Set(); keys.forEach(k => k.split("-").forEach(x => s.add(Number(x)))); return s; }
  function isConnected(keys, vs) {
    const arr = Array.from(vs); if (!arr.length) return true;
    const r = reachable(keys, arr[0]); return arr.every(v => r.has(v));
  }
  function bridges(keys) {
    const vs = verticesOf(keys);
    return keys.filter(k => !isConnected(keys.filter(x => x !== k), vs));
  }
  function cutVertices(keys) {
    const vs = verticesOf(keys);
    return Array.from(vs).filter(v => {
      const rest = keys.filter(k => !k.split("-").map(Number).includes(v));
      const others = new Set(Array.from(vs).filter(x => x !== v));
      return !isConnected(rest, others);
    });
  }
  /* 最大流（Edmonds–Karp，无向路段视为双向容量） */
  function maxflow(capMap, s, t) {
    const n = NAMES.length, c = Array.from({ length: n }, () => Array(n).fill(0));
    Object.keys(capMap).forEach(k => { const [u, v] = k.split("-").map(Number); c[u][v] += capMap[k]; c[v][u] += capMap[k]; });
    const f = Array.from({ length: n }, () => Array(n).fill(0));
    const aug = [];
    let total = 0;
    for (;;) {
      const pre = Array(n).fill(-1); pre[s] = s; const q = [s];
      while (q.length && pre[t] < 0) {
        const u = q.shift();
        for (let v = 0; v < n; v++) if (pre[v] < 0 && c[u][v] - f[u][v] > 0) { pre[v] = u; q.push(v); }
      }
      if (pre[t] < 0) break;
      let b = Infinity; for (let v = t; v !== s; v = pre[v]) b = Math.min(b, c[pre[v]][v] - f[pre[v]][v]);
      const path = []; for (let v = t; v !== s; v = pre[v]) { f[pre[v]][v] += b; f[v][pre[v]] -= b; path.push(v); }
      path.push(s); aug.push({ path: path.reverse(), amount: b }); total += b;
    }
    // 最小割：残量网络中从 s 可达的集合 S
    const S = new Set([s]), q = [s];
    while (q.length) { const u = q.shift(); for (let v = 0; v < n; v++) if (!S.has(v) && c[u][v] - f[u][v] > 0) { S.add(v); q.push(v); } }
    const cut = Object.keys(capMap).filter(k => { const [u, v] = k.split("-").map(Number); return S.has(u) !== S.has(v); });
    return { total, aug, cut, S, cutCap: cut.reduce((a, k) => a + capMap[k], 0) };
  }
  function capFor(fixed) { const m = Object.assign({}, CAP); if (fixed) m[E("FG")] = CAP_FG_FIXED; return m; }
  /* Braess 悖论：N 辆车从 S 到 T；S→P 与 Q→T 用时 x/100（x 为该路段车辆数），P→T 与 S→Q 固定 45 */
  function braess(N, shortcut) {
    if (!shortcut) { const x = N / 2; return { time: x / 100 + 45, split: [x, x, 0] }; }
    // 有捷径 P→Q（用时 0）：S→P→Q→T 的用时 ≤ 其他路线，均衡时全部车辆走它
    const t = N / 100 + 0 + N / 100;
    return { time: t, split: [0, 0, N], alt: N / 100 + 45 };
  }

  const LOGIC = { NAMES, GRID, G1_0, G2_0, TIME, CAP, E, ekey, kname, ops, dijkstra, pathTo, carRoute, bridges, cutVertices, maxflow, capFor, braess };
  if (typeof module !== "undefined" && module.exports) { module.exports = LOGIC; }
  if (typeof document === "undefined") return;

  /* ---------------- 工具 ---------------- */
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  }
  const listK = keys => keys.length ? keys.map(kname).join("、") : "∅";
  const route = p => p.map(i => NAMES[i]).join(" → ");

  /* ---------------- 状态 ---------------- */
  const LEVEL_KEY = window.CASE_LEVEL || "basic";
  let g1 = G1_0.slice(), g2 = G2_0.slice();
  let showOp = null;          // 基础层：用户点选的运算
  let delay = 4;              // 进阶层：混行延误 p（分钟）
  let fixedFG = false;        // 拓展层：FG 机非分离改造
  let shortcut = false;       // 拓展层：Braess 捷径

  /* ---------------- 三层步骤 ----------------
     每步 view(): 返回绘图说明；formula()/text()：随当前状态动态生成，保证数值与图一致 */
  function buildBasic() {
    const O = () => ops(g1, g2);
    const opStep = (phase, name, op, formula, text) => ({ phase, name, op, formula, text });
    return [
      { phase: 0, name: "片区路网与两张网", op: "base",
        formula: () => '同一片区：<span class="ft hot-green hot">慢行网 G1</span> 与 <span class="ft hot">机动车网 G2</span> 共用路口',
        text: () => "某城市片区有 12 个路口（虚构教学数据）。有的路段只修了自行车道，有的只供机动车，也有两者<b>混行</b>的路段。规划部门想回答：哪里冲突？哪里断头？哪里还能补路？" },
      { phase: 1, name: "顶点与底图 H", op: "grid",
        formula: () => 'V = {A, …, L}，<span class="ft hot">|V| = 12</span>；底图 H = 所有可建道路，|E(H)| = ' + GRID.length,
        text: () => "把路口抽象为<b>顶点</b>，把规划范围内所有可以修路的路段画成底图 H（灰色虚线）。之后的每张网都是 H 的<b>生成子图</b>：顶点集相同，只取部分边。" },
      { phase: 1, name: "两张子图 G1、G2", op: "base",
        formula: () => 'G1 = (V, E₁)，<span class="ft hot-green hot">|E₁| = ' + g1.length + '</span>；G2 = (V, E₂)，<span class="ft hot">|E₂| = ' + g2.length + '</span>',
        text: () => "绿色是慢行网 G1 的边，红色是机动车网 G2 的边，金色粗线是两网都有的边。因为顶点集相同，<b>图的运算就归结为边集的集合运算</b>。点击图上的路段可以改变它的归属，下面所有结果会即时重算。" },
      opStep(2, "并：G1 ∪ G2", "union",
        () => 'E(G1 ∪ G2) = E₁ ∪ E₂，|E| = ' + g1.length + ' + ' + g2.length + ' − ' + O().inter.length + ' = <span class="ft hot">' + O().union.length + '</span>',
        () => "并图是片区的<b>综合路网</b>：任何一种交通方式能走的路段都算上。计数用容斥：两网共有的 " + O().inter.length + " 条只算一次。"),
      opStep(2, "交：G1 ∩ G2", "inter",
        () => 'E(G1 ∩ G2) = E₁ ∩ E₂ = {<span class="ft hot">' + listK(O().inter) + '</span>}，共 ' + O().inter.length + ' 条',
        () => "交图就是<b>机非混行路段</b>——自行车与机动车抢同一条路，是安全隐患和拥堵瓶颈的高发处。"),
      opStep(2, "差：G1 − G2 与 G2 − G1", "diff",
        () => 'G1 − G2：<span class="ft hot-green hot">' + O().d12.length + '</span> 条慢行专用；G2 − G1：<span class="ft hot">' + O().d21.length + '</span> 条机动车专用',
        () => "差运算不对称：G1 − G2 = {" + listK(O().d12) + "} 是只能骑行的路段；G2 − G1 = {" + listK(O().d21) + "} 是只供机动车的路段。图中两者同时显示，淡去的是混行路段。"),
      opStep(2, "环和：G1 ⊕ G2", "ring",
        () => 'G1 ⊕ G2 = (G1 ∪ G2) − (G1 ∩ G2)，|E| = ' + O().union.length + ' − ' + O().inter.length + ' = <span class="ft hot">' + O().ring.length + '</span>',
        () => "环和取“恰好属于一张网”的路段，也就是全部<b>专用道</b>。它等于两个差的并：" + O().d12.length + " + " + O().d21.length + " = " + O().ring.length + "。"),
      opStep(3, "相对补：H − (G1 ∪ G2)", "rel",
        () => 'H − (G1 ∪ G2) = {<span class="ft hot">' + listK(O().rel) + '</span>}；而 K₁₂ 中的补图有 ' + O().complete + ' 条边',
        () => "规划上说的“潜在路段”是<b>相对于底图 H 的补</b>：H 中还没修的路段。注意它不是教材里的补图——补图相对完全图 K₁₂，会把相距很远、根本无法直连的路口也连上（" + O().complete + " 条），对规划没有意义。"),
      { phase: 3, name: "读结果：冲突与缺口", op: "inter",
        formula: () => '冲突 <span class="ft hot">' + O().inter.length + '</span> 条 · 慢行专用 ' + O().d12.length + ' · 机动车专用 ' + O().d21.length + ' · 待建 ' + O().rel.length,
        text: () => "四个数字给出片区路网的“体检表”：混行路段要优先考虑隔离或分流；待建路段是打通断头路的候选。<b>同一组边集，换一种运算就回答一个不同的规划问题。</b>", viz: "summary" },
      { phase: 4, name: "价值：路权清晰 · 出行安全", op: "inter",
        formula: () => '交集 = 需要<span class="ft hot">重点保护</span>的骑行者与行人',
        text: () => "把路网拆成集合来看，混行冲突一目了然。优先治理这些路段，让慢行者有安全的路、机动车有顺畅的路——<b>人民城市为人民</b>，体现在每一条被认真对待的路段上。" },
      { phase: 5, name: "迁移：哪条冲突最要紧", op: "union",
        formula: () => '下一步：给边加上<span class="ft hot">通行时间</span>，用最短路与割边找瓶颈',
        text: () => "集合运算只告诉我们“有哪些冲突”，没回答“哪条最影响通行”。进阶层给机动车网加上时间权，用最短路和割边（桥）定量识别瓶颈。想一想：公交专用道网与地铁网能否做同样的并、交分析？" }
    ];
  }

  function buildAdvanced() {
    const inter = setOps.inter(G1_0, G2_0);
    const br = bridges(G2_0), cv = cutVertices(G2_0);
    const R = () => carRoute(delay);
    const up = [0, 4, 5, 6, 7, 3], low = [0, 4, 8, 9, 10, 11, 7, 3];
    const w = carWeight(0);
    const upBase = pathKeys(up).reduce((a, k) => a + w(k), 0);
    const lowBase = pathKeys(low).reduce((a, k) => a + w(k), 0);
    const nShared = pathKeys(up).filter(k => inter.includes(k)).length;
    const threshold = (lowBase - upBase) / nShared;
    return [
      { phase: 0, name: "早高峰：A 到 D", view: "car", setDelay: 4, hot: [0, 3],
        formula: () => '机动车从 <span class="ft hot">A</span> 到 <span class="ft hot">D</span>，走哪条路最快？哪些路段是瓶颈？',
        text: () => "早高峰，车流从片区西北的 A 口进入、从东北的 D 口离开。机动车网 G2 中有两段与自行车混行（EF、FG），混行会让车速下降。" },
      { phase: 1, name: "带权建模", view: "car", setDelay: 4, weights: true,
        formula: () => 'w(e) = 通行时间；若 e ∈ E(G1 ∩ G2)，<span class="ft hot">w′(e) = w(e) + p</span>（p = 混行延误）',
        text: () => "把 G2 的每条边标上平峰通行时间（分钟），混行路段再加上延误 p。<b>用图的交运算找出需要加权的边</b>——这正是基础层结论的用途。当前 p = " + delay + " 分钟，可在左侧拖动。" },
      { phase: 2, name: "找出混行路段", view: "car", setDelay: 4, weights: true, inter: true,
        formula: () => 'E(G1 ∩ G2) = {<span class="ft hot">' + listK(inter) + '</span>}，各加 p = ' + delay,
        text: () => "金色高亮的两段就是交图的边。它们都在上方干道 E–F–G–H 上，下方绕行 E–I–J–K–L–H 没有混行。" },
      { phase: 2, name: "求最短路（Dijkstra）", view: "car", setDelay: 4, weights: true, route: true, table: true,
        formula: () => 'dist(A, D) = <span class="ft hot-green hot">' + R().time + '</span> 分钟：' + route(R().path),
        text: () => "从 A 运行 Dijkstra（下表为各路口最终 dist 与前驱）。上路用时 " + upBase + " + 2p = " + (upBase + 2 * delay) + "，下路用时 " + lowBase + "，当前" + (upBase + 2 * delay <= lowBase ? "<b>上方干道</b>更快" : "<b>下方绕行</b>更快") + "。" },
      { phase: 2, name: "延误变大：路线切换", view: "car", weights: true, route: true, setDelay: 6,
        formula: () => '上路 ' + upBase + ' + 2p，下路 ' + lowBase + ' ⇒ 当 <span class="ft hot">p &gt; ' + threshold + '</span> 时改走下方',
        text: () => "本步把 p 设为 6：上路 " + (upBase + 12) + " 分钟 &gt; 下路 " + lowBase + " 分钟，最短路切换为 " + route(carRoute(6).path) + "，全程 " + carRoute(6).time + " 分钟。拖动左侧 p 观察：<b>最短路随权重变化，存在切换阈值 p = " + threshold + "</b>。" },
      { phase: 2, name: "桥：一断就断", view: "car", weights: true, bridges: true,
        formula: () => 'G2 的桥（割边）：<span class="ft hot">' + listK(br) + '</span>；割点：' + cv.map(i => NAMES[i]).join("、"),
        text: () => "删去一条边就使图不连通，这条边叫<b>桥</b>。A 口只能经 A–E 进出，D 口只能经 D–H 进出：它们一旦封闭，A 或 D 就与整个机动车网断开——这是真正的<b>咽喉道路</b>。E、H 是割点，同理。" },
      { phase: 3, name: "瓶颈画像", view: "car", weights: true, bridges: true, inter: true, route: true, viz: "profile",
        formula: () => '冲突瓶颈 {' + listK(inter) + '} · 结构瓶颈（桥）{' + listK(br) + '} · 阈值 p = ' + threshold,
        text: () => "两类瓶颈性质不同：混行路段让<b>速度</b>下降（改权），靠分离、错峰缓解；桥决定<b>连通</b>（删边即断），只能靠增加冗余道路消除。下表汇总了数值。" },
      { phase: 4, name: "价值：统筹全局", view: "car", weights: true, bridges: true,
        formula: () => '局部改造要看<span class="ft hot">全局</span>：改一条边，最短路和连通性都可能变',
        text: () => "交通治理不是哪里堵就修哪里：先用模型找出真正的瓶颈，再比较方案对全网的影响。用系统观念统筹路网，才能让千万市民的出行更顺畅、更安全。" },
      { phase: 5, name: "迁移：容量与悖论", view: "car", weights: true,
        formula: () => '路段还有<span class="ft hot">通行能力</span>：一小时最多能过多少车？',
        text: () => "最短路只关心单辆车的快慢。高峰期车太多时，要问“路网一小时最多能通过多少车”——这是<b>最大流</b>问题；而“多修一条路反而更堵”的 Braess 悖论也在拓展层等着你。" }
    ];
  }

  function buildExtend() {
    const MF = () => maxflow(capFor(fixedFG), id("E"), id("H"));
    return [
      { phase: 0, name: "高峰：路网能过多少车", view: "flow", setFixed: false,
        formula: () => '从 <span class="ft hot">E 口</span>到 <span class="ft hot">H 口</span>，一小时最多能通过多少辆车？',
        text: () => "晚高峰车流从西侧 E 口涌向东侧 H 口。每条路段有<b>通行能力</b>（辆/小时，图上数字）。FG 段因与自行车混行，能力只有 800。" },
      { phase: 1, name: "容量网络建模", view: "flow", setFixed: false,
        formula: () => '0 ≤ <span class="ft hot">f(e) ≤ c(e)</span>；除 E、H 外，每个路口<span class="ft hot-blue hot">流入 = 流出</span>',
        text: () => "把路段能力记作容量 c(e)，实际车流记作 f(e)。车不会凭空出现或消失，所以中间路口流量守恒。目标：让从 E 流出的总量最大。" },
      { phase: 2, name: "增广路 1：上方干道", view: "flow", setFixed: false, aug: 1,
        formula: () => '沿 ' + route(MF().aug[0].path) + ' 送 <span class="ft hot">' + MF().aug[0].amount + '</span> 辆/时（受最小容量限制）',
        text: () => "找一条还有余量的路径（<b>增广路</b>），能送的量取决于路径上<b>最窄的一段</b>。" },
      { phase: 2, name: "增广路 2：下方绕行", view: "flow", setFixed: false, aug: 2,
        formula: () => '再沿 ' + route(MF().aug[1].path) + ' 送 <span class="ft hot">' + MF().aug[1].amount + '</span>，累计 ' + (MF().aug[0].amount + MF().aug[1].amount),
        text: () => "第二条增广路走下方。此后残量网络中再也找不到从 E 到 H 的增广路，算法停止：<b>最大流 = " + MF().total + " 辆/时</b>。" },
      { phase: 3, name: "最小割 = 瓶颈", view: "flow", setFixed: false, aug: 2, cut: true,
        formula: () => '最小割 {<span class="ft hot">' + listK(MF().cut) + '</span>}，容量 ' + MF().cut.map(k => capFor(fixedFG)[k]).join(" + ") + ' = ' + MF().cutCap + ' = 最大流',
        text: () => "删去这几条路段，E 与 H 就被切断，它们的容量和恰好等于最大流——<b>最大流最小割定理</b>。最小割就是路网通行能力的真正瓶颈：扩容别处无济于事。" },
      { phase: 3, name: "改造瓶颈：机非分离", view: "flow", aug: 2, cut: true, setFixed: true,
        formula: () => 'FG 分离慢行后 c(FG)：800 → ' + CAP_FG_FIXED + '；最大流 <span class="ft hot-green hot">' + MF().total + '</span> 辆/时',
        text: () => "针对割边 FG 做机非分离，容量升到 " + CAP_FG_FIXED + "，最大流升到 " + MF().total + "（+" + (MF().total - maxflow(capFor(false), id("E"), id("H")).total) + "）。新的最小割变为 {" + listK(MF().cut) + "}——<b>瓶颈会转移</b>，治理要持续评估。左侧开关可来回对比。" },
      { phase: 3, name: "Braess 悖论", view: "braess",
        formula: () => '4000 辆车：无捷径 <span class="ft hot-green hot">' + braess(4000, false).time + '</span> 分钟 → 开通捷径 <span class="ft hot">' + braess(4000, true).time + '</span> 分钟',
        text: () => shortcut
          ? "开通零用时捷径 P→Q 后，每位司机都发现 S→P→Q→T 比原来的路线快，于是全部改走它：两段拥堵路各挤进 4000 辆，人人用时 " + braess(4000, true).time + " 分钟——<b>比原来更慢</b>，且谁单独换路都会更慢（" + braess(4000, true).alt + " 分钟），这是纳什均衡。"
          : "经典 Braess 示例（理想化模型）：S→P、Q→T 用时 = 车辆数/100，P→T、S→Q 固定 45 分钟。4000 辆车平分两条路线，各 2000 辆，用时 20 + 45 = " + braess(4000, false).time + " 分钟。打开左侧“开通捷径 P→Q”看看会发生什么。" },
      { phase: 4, name: "价值：科学决策", view: "flow", aug: 2, cut: true,
        formula: () => '先建模、再决策：<span class="ft hot">找准瓶颈</span>，警惕“想当然”的扩建',
        text: () => "最小割告诉我们钱该花在哪里，Braess 悖论提醒我们“多修路不一定更通畅”。用数学模型预先推演，才能让有限的公共资源真正服务于市民出行。" },
      { phase: 5, name: "迁移：智慧交通", view: "flow", aug: 2,
        formula: () => '实时诱导 · 潮汐车道 · 信号配时：<span class="ft hot">动态网络流</span>',
        text: () => "导航的实时诱导相当于不断改变边权；潮汐车道是按时段调整路段两个方向的容量；物流干线、通信网络的带宽规划也都是最大流 / 最小割问题。你能为自己熟悉的一个路口画出容量网络吗？" }
    ];
  }

  /* ---------------- DOM ---------------- */
  const LEVEL_INFO = {
    basic: { label: "基础层", mission: "把片区路网拆成慢行网与机动车网，用并、交、差、环和回答规划问题。", badge: "认识模型 · 图的运算", hint: "点图上路段可切换归属：无 → 慢行 → 机动车 → 混行" },
    advanced: { label: "进阶层", mission: "给机动车网加时间权：用最短路找切换阈值，用桥与割点找咽喉道路。", badge: "求解模型 · 瓶颈识别", hint: "拖动左侧“混行延误 p”，最短路与用时即时重算" },
    extend: { label: "拓展层", mission: "把路段能力纳入模型：最大流 = 最小割找通行瓶颈，再看 Braess 悖论。", badge: "拓展模型 · 网络流", hint: "左侧开关：机非分离改造 / 开通捷径，结果即时重算" }
  };
  const info = LEVEL_INFO[LEVEL_KEY] || LEVEL_INFO.basic;
  const controls = document.getElementById("controls");
  const canvas = document.getElementById("graphCanvas");
  const formulaText = document.getElementById("formulaText");
  const stepStatus = document.getElementById("stepStatus");
  const vizText = document.getElementById("vizText");
  const missionEl = document.getElementById("missionText");
  const badgeEl = document.getElementById("visualBadge");
  const phaseNav = document.getElementById("casePhases");
  const hintEl = document.querySelector(".canvas-hint");
  if (!canvas || !controls) return;
  const ctx = canvas.getContext("2d");
  if (missionEl) missionEl.innerHTML = "<b>互动任务：</b>" + esc(info.mission);
  if (badgeEl) badgeEl.textContent = info.badge;
  if (hintEl) hintEl.textContent = info.hint;

  const C = {
    node: "#d63b1d", cur: "#ffb400", ok: "#1f9d55", ring: "#fff8ec", ink: "#2c1810", muted: "#6b4a38",
    edge: "rgba(107,74,56,0.5)", gone: "rgba(154,138,128,0.8)", bike: "#1f9d55", car: "#d63b1d", both: "#ffb400"
  };
  let R = 16;
  let steps = LEVEL_KEY === "advanced" ? buildAdvanced() : LEVEL_KEY === "extend" ? buildExtend() : buildBasic();
  let step = 0, playTimer = null;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(300, Math.floor(rect.width)), h = Math.max(300, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }
  function legendSpace() {
    const lg = canvas.parentNode && canvas.parentNode.querySelector(".graph-legend");
    return lg && lg.offsetHeight ? lg.offsetTop + lg.offsetHeight : 34;
  }
  function positions(size, nodes) {
    const padX = size.w < 520 ? 36 : 80, padTop = legendSpace() + 34, padBot = size.w < 520 ? 40 : 60;
    return nodes.map(nd => ({ x: padX + nd.x * (size.w - 2 * padX), y: padTop + nd.y * (size.h - padTop - padBot) }));
  }
  function rr(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  function chip(x, y, label, bg, fg, small) {
    ctx.font = "800 " + (small ? 11 : 12) + "px 'JetBrains Mono', Consolas, monospace";
    const tw = ctx.measureText(label).width + (small ? 8 : 10), th = small ? 18 : 20;
    rr(x - tw / 2, y - th / 2, tw, th, 6);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = "rgba(116,55,31,0.2)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, x, y + 0.5);
  }
  function line(a, b, color, width, dash) {
    ctx.save(); if (dash) ctx.setLineDash(dash);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
  }
  function nodeDot(p, label, fill, textColor, r) {
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = C.ring; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = textColor; ctx.font = "800 " + (r < 15 ? 12 : 13) + "px 'JetBrains Mono', Consolas, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, p.x, p.y + 0.5);
  }
  function edgeEnds(P, k) { const [u, v] = k.split("-").map(Number); return [P[u], P[v]]; }

  /* ---- 视图：两网 / 机动车网 / 容量网络 ---- */
  function drawNets(size, P, st) {
    const O = ops(g1, g2);
    const op = showOp || st.op;
    const small = size.w < 520;
    let result = null;
    if (op === "union") result = O.union;
    else if (op === "inter") result = O.inter;
    else if (op === "diff") result = O.d12.concat(O.d21);
    else if (op === "d12") result = O.d12;
    else if (op === "d21") result = O.d21;
    else if (op === "ring") result = O.ring;
    else if (op === "rel") result = O.rel;
    GRID.forEach(k => {
      const [a, b] = edgeEnds(P, k);
      const inB = g1.includes(k), inC = g2.includes(k);
      const inRes = result ? result.includes(k) : true;
      if (op === "grid") { line(a, b, C.gone, 2.5, [7, 6]); return; }
      if (!inB && !inC) {
        line(a, b, op === "rel" ? C.car : C.gone, op === "rel" ? 3 : 2, [7, 6]);
        return;
      }
      ctx.globalAlpha = inRes ? 1 : 0.14;
      if (inB && inC) line(a, b, C.both, 7);
      else line(a, b, inB ? C.bike : C.car, 4.5);
      ctx.globalAlpha = 1;
    });
    P.forEach((p, i) => nodeDot(p, NAMES[i], C.node, "#fff", R));
  }
  function drawCar(size, P, st) {
    const small = size.w < 520;
    const inter = setOps.inter(G1_0, G2_0);
    const rt = carRoute(delay);
    const onPath = st.route ? pathKeys(rt.path) : [];
    const br = st.bridges ? bridges(G2_0) : [];
    GRID.forEach(k => {
      if (G2_0.includes(k)) return;
      const [a, b] = edgeEnds(P, k); line(a, b, "rgba(154,138,128,0.35)", 1.5, [5, 6]);
    });
    G2_0.forEach(k => {
      const [a, b] = edgeEnds(P, k);
      const isInter = inter.includes(k);
      if (onPath.includes(k)) line(a, b, C.ok, 6);
      else if (br.includes(k)) line(a, b, C.car, 6);
      else line(a, b, st.inter && isInter ? C.both : C.edge, st.inter && isInter ? 6 : 3);
      if (st.bridges && br.includes(k) && onPath.includes(k)) line(a, b, C.car, 2, [4, 4]);
      if (st.weights) {
        const w = TIME[k] + (isInter ? delay : 0);
        chip((a.x + b.x) / 2, (a.y + b.y) / 2, isInter ? TIME[k] + "+" + delay : String(w),
          onPath.includes(k) ? C.ok : isInter ? C.both : "rgba(255,251,240,0.96)", onPath.includes(k) ? "#fff" : C.ink, small);
      }
    });
    const cv = st.bridges ? cutVertices(G2_0) : [];
    P.forEach((p, i) => {
      const hot = (st.hot || []).includes(i) || (st.route && (i === 0 || i === 3));
      const inPath = st.route && rt.path.includes(i);
      nodeDot(p, NAMES[i], hot ? C.cur : inPath ? C.ok : C.node, hot ? C.ink : "#fff", R);
      if (cv.includes(i)) { ctx.beginPath(); ctx.arc(p.x, p.y, R + 5, 0, Math.PI * 2); ctx.strokeStyle = C.car; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]); }
      if (st.table && rt.dist[i] < Infinity) chip(p.x + R + 10, p.y - R - 2, String(rt.dist[i]), C.ok, "#fff", true);
    });
  }
  function drawFlow(size, P, st) {
    const small = size.w < 520;
    const cap = capFor(fixedFG);
    const mf = maxflow(cap, id("E"), id("H"));
    const flow = {};
    (mf.aug.slice(0, st.aug || 0)).forEach(a => pathKeys(a.path).forEach(k => { flow[k] = (flow[k] || 0) + a.amount; }));
    const cut = st.cut ? mf.cut : [];
    GRID.forEach(k => {
      if (cap[k]) return;
      const [a, b] = edgeEnds(P, k); line(a, b, "rgba(154,138,128,0.35)", 1.5, [5, 6]);
    });
    Object.keys(cap).forEach(k => {
      const [a, b] = edgeEnds(P, k);
      const f = flow[k] || 0;
      line(a, b, cut.includes(k) ? C.car : f ? C.ok : C.edge, cut.includes(k) ? 7 : f ? 3 + 4 * f / 1500 : 3);
      const label = (f ? f + "/" : "") + cap[k];
      chip((a.x + b.x) / 2, (a.y + b.y) / 2, label, cut.includes(k) ? C.car : f ? C.ok : "rgba(255,251,240,0.96)", cut.includes(k) || f ? "#fff" : C.ink, small);
    });
    P.forEach((p, i) => {
      const end = i === id("E") || i === id("H");
      const used = Object.keys(flow).some(k => k.split("-").map(Number).includes(i));
      const inCap = Object.keys(cap).some(k => k.split("-").map(Number).includes(i));
      nodeDot(p, NAMES[i], end ? C.cur : used ? C.ok : inCap ? C.node : "#eed8cc", end ? C.ink : inCap ? "#fff" : "#9a7a6a", R);
    });
  }
  function drawBraess(size) {
    const small = size.w < 520;
    const nodes = [{ k: "S", x: 0, y: 0.5 }, { k: "P", x: 0.5, y: 0 }, { k: "Q", x: 0.5, y: 1 }, { k: "T", x: 1, y: 0.5 }];
    const P = positions({ w: size.w, h: size.h }, nodes.map(n => ({ x: 0.1 + n.x * 0.8, y: n.y })));
    const b = braess(4000, shortcut);
    const arcs = [
      { u: 0, v: 1, label: "x/100", n: shortcut ? 4000 : 2000 },
      { u: 1, v: 3, label: "45", n: shortcut ? 0 : 2000 },
      { u: 0, v: 2, label: "45", n: shortcut ? 0 : 2000 },
      { u: 2, v: 3, label: "x/100", n: shortcut ? 4000 : 2000 }
    ];
    if (shortcut) arcs.push({ u: 1, v: 2, label: "0", n: 4000, sc: true });
    arcs.forEach(a => {
      const A = P[a.u], B = P[a.v], ang = Math.atan2(B.y - A.y, B.x - A.x);
      const s = { x: A.x + Math.cos(ang) * (R + 4), y: A.y + Math.sin(ang) * (R + 4) };
      const e = { x: B.x - Math.cos(ang) * (R + 6), y: B.y - Math.sin(ang) * (R + 6) };
      const col = a.sc ? C.car : a.n ? C.ok : C.edge;
      line(s, e, col, a.n ? 3 + a.n / 1000 : 2.5, a.n ? null : [6, 6]);
      ctx.beginPath(); ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.x - 13 * Math.cos(ang - 0.4), e.y - 13 * Math.sin(ang - 0.4));
      ctx.lineTo(e.x - 13 * Math.cos(ang + 0.4), e.y - 13 * Math.sin(ang + 0.4));
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      chip(mx, my, a.label + (a.n ? " · " + a.n + "辆" : ""), a.sc ? C.car : a.n ? C.ok : "rgba(255,251,240,0.96)", a.n || a.sc ? "#fff" : C.ink, small);
    });
    P.forEach((p, i) => nodeDot(p, nodes[i].k, i === 0 || i === 3 ? C.cur : C.node, i === 0 || i === 3 ? C.ink : "#fff", R + 2));
    ctx.fillStyle = C.muted; ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif"; ctx.textAlign = "center";
    ctx.fillText("每位司机用时 " + b.time + " 分钟" + (shortcut ? "（捷径开通后）" : "（两条路线各 2000 辆）"), size.w / 2, size.h - 16);
  }
  function draw() {
    const size = resize();
    R = size.w < 520 ? 13 : 16;
    ctx.clearRect(0, 0, size.w, size.h);
    const st = steps[step];
    if (st.view === "braess") { drawBraess(size); return; }
    const P = positions(size, NODES);
    if (LEVEL_KEY === "basic") drawNets(size, P, st);
    else if (st.view === "flow") drawFlow(size, P, st);
    else drawCar(size, P, st);
  }

  /* ---- 讲解区 ---- */
  function summaryHtml() {
    const O = ops(g1, g2);
    const cell = (t, v, list) => '<span class="pill">' + t + '：<b>' + v + '</b> 条<br>' + esc(listK(list)) + '</span>';
    return '<div class="graph-summary"><b>当前两网的运算结果（随点击实时更新）：</b><div class="set-grid">' +
      cell("G1 慢行", g1.length, g1) + cell("G2 机动车", g2.length, g2) + cell("G1 ∪ G2", O.union.length, O.union) +
      cell("G1 ∩ G2", O.inter.length, O.inter) + cell("G1 − G2", O.d12.length, O.d12) + cell("G2 − G1", O.d21.length, O.d21) +
      cell("G1 ⊕ G2", O.ring.length, O.ring) + cell("H − (G1 ∪ G2)", O.rel.length, O.rel) + '</div></div>';
  }
  function distTableHtml() {
    const rt = carRoute(delay);
    const rows = NAMES.map((k, i) => rt.dist[i] < Infinity ? '<tr' + (rt.path.includes(i) ? ' class="is-ok"' : '') + '><td>' + k + '</td><td class="mono">' + rt.dist[i] + '</td><td class="mono">' + (rt.pre[i] >= 0 ? NAMES[rt.pre[i]] : "—") + '</td></tr>' : '').join("");
    return '<div class="graph-summary"><div class="table-scroll"><table class="case-table"><thead><tr><th>路口</th><th>dist(A, ·)（分钟）</th><th>前驱</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }
  function profileHtml() {
    const rows = [0, 2, 4, 6, 8].map(p => { const r = carRoute(p); return '<tr' + (p === delay ? ' class="is-cur"' : '') + '><td class="mono">' + p + '</td><td>' + route(r.path) + '</td><td class="mono">' + r.time + '</td></tr>'; }).join("");
    return '<div class="graph-summary"><div class="table-scroll"><table class="case-table"><thead><tr><th>延误 p</th><th>A→D 最短路</th><th>用时（分钟）</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="pill-row"><span class="pill">桥：' + esc(listK(bridges(G2_0))) + '</span><span class="pill">割点：' + cutVertices(G2_0).map(i => NAMES[i]).join("、") + '</span><span class="pill">混行：' + esc(listK(setOps.inter(G1_0, G2_0))) + '</span></div></div>';
  }
  function flowHtml() {
    const a = maxflow(capFor(false), id("E"), id("H")), b = maxflow(capFor(true), id("E"), id("H"));
    return '<div class="graph-summary"><div class="table-scroll"><table class="case-table"><thead><tr><th>方案</th><th>c(FG)</th><th>最大流（辆/时）</th><th>最小割</th></tr></thead><tbody>' +
      '<tr' + (!fixedFG ? ' class="is-cur"' : '') + '><td>现状（混行）</td><td class="mono">800</td><td class="mono">' + a.total + '</td><td>' + esc(listK(a.cut)) + '</td></tr>' +
      '<tr' + (fixedFG ? ' class="is-cur"' : '') + '><td>机非分离</td><td class="mono">' + CAP_FG_FIXED + '</td><td class="mono">' + b.total + '</td><td>' + esc(listK(b.cut)) + '</td></tr></tbody></table></div></div>';
  }
  function renderViz(st) {
    let html = "";
    if (LEVEL_KEY === "basic" && (st.viz === "summary" || showOp || st.phase === 2 || st.phase === 3)) html = summaryHtml();
    if (LEVEL_KEY === "advanced") html = st.viz === "profile" ? profileHtml() : st.table ? distTableHtml() : "";
    if (LEVEL_KEY === "extend" && st.view === "flow" && st.cut) html = flowHtml();
    vizText.innerHTML = html;
    vizText.style.display = html ? "grid" : "none";
  }

  function renderStep() {
    const st = steps[step];
    let formula = st.formula(), text = st.text(), badge = PHASES[st.phase].slice(0, 2), tone = st.phase === 4 ? "red" : st.phase === 0 || st.phase === 5 ? "gold" : "";
    if (LEVEL_KEY === "basic" && showOp) {
      const O = ops(g1, g2);
      const m = { union: ["G1 ∪ G2", O.union], inter: ["G1 ∩ G2", O.inter], d12: ["G1 − G2", O.d12], d21: ["G2 − G1", O.d21], ring: ["G1 ⊕ G2", O.ring], rel: ["H − (G1 ∪ G2)", O.rel] }[showOp];
      formula = m[0] + ' = {<span class="ft hot">' + esc(listK(m[1])) + '</span>}，共 ' + m[1].length + ' 条';
      text = "自选运算：图上保留结果中的路段，其余淡去。点击路段改变归属，结果与下方汇总即时更新；点任意步骤可回到讲解。";
      badge = "自选"; tone = "gold";
    }
    formulaText.innerHTML = formula;
    stepStatus.innerHTML = '<span class="badge ' + tone + '">' + esc(badge) + '</span><span>' + text + '</span>';
    renderViz(st);
    draw();
    Array.prototype.forEach.call(controls.querySelectorAll(".step-item"), (el, i) => { el.classList.toggle("active", i === step); el.classList.toggle("done", i < step); });
    if (phaseNav) Array.prototype.forEach.call(phaseNav.querySelectorAll(".phase-chip"), (el, i) => {
      el.classList.toggle("active", i === st.phase); el.classList.toggle("done", i < st.phase);
      el.setAttribute("aria-current", i === st.phase ? "step" : "false");
    });
    const fill = controls.querySelector(".progress-fill");
    if (fill) fill.style.width = ((step + 1) / steps.length * 100) + "%";
    const counter = document.getElementById("stepCounter");
    if (counter) counter.textContent = "第 " + (step + 1) + " / " + steps.length + " 步";
    document.getElementById("prevBtn").disabled = step === 0;
    document.getElementById("nextBtn").disabled = step === steps.length - 1;
    syncControls();
  }
  function go(i) {
    step = Math.max(0, Math.min(steps.length - 1, i));
    const st = steps[step];
    showOp = null;
    if (st.setDelay != null) delay = st.setDelay;
    if (st.setFixed != null) fixedFG = st.setFixed;
    renderStep();
  }
  function stopPlay() {
    if (playTimer) { clearTimeout(playTimer); playTimer = null; }
    const b = document.getElementById("playBtn");
    if (b) { b.classList.remove("playing"); b.textContent = "▶ 自动播放"; }
  }
  function speedMs() { const s = document.getElementById("speedRange"); return [3200, 2600, 2000, 1500, 1000][(s ? Number(s.value) : 3) - 1]; }
  function tick() { if (step >= steps.length - 1) { stopPlay(); return; } go(step + 1); playTimer = setTimeout(tick, speedMs()); }
  function togglePlay() {
    if (playTimer) { stopPlay(); return; }
    if (step === steps.length - 1) go(0);
    const b = document.getElementById("playBtn");
    if (b) { b.classList.add("playing"); b.textContent = "⏸ 暂停"; }
    playTimer = setTimeout(tick, speedMs());
  }
  function resetAll() {
    stopPlay();
    g1 = G1_0.slice(); g2 = G2_0.slice(); showOp = null; delay = 4; fixedFG = false; shortcut = false;
    go(0);
  }

  function levelPanel() {
    if (LEVEL_KEY === "basic") {
      const b = (op, t) => '<button type="button" class="step-btn" data-op="' + op + '">' + t + '</button>';
      return '<div class="case-panel"><h4>自选运算 <small>也可点路段改归属</small></h4><div class="case-seg">' +
        b("union", "并 G1 ∪ G2") + b("inter", "交 G1 ∩ G2") + b("d12", "差 G1 − G2") + b("d21", "差 G2 − G1") + b("ring", "环和 G1 ⊕ G2") + b("rel", "待建 H − (G1∪G2)") + '</div></div>';
    }
    if (LEVEL_KEY === "advanced") {
      return '<div class="case-panel"><h4>情境参数 <small>拖动即时重算</small></h4>' +
        '<label class="case-field"><span>混行延误 p = <b id="pVal">' + delay + '</b> 分钟（加在 G1 ∩ G2 的边上）</span><input type="range" id="pRange" min="0" max="8" step="1" value="' + delay + '"></label></div>';
    }
    return '<div class="case-panel"><h4>情境开关 <small>改动后即时重算</small></h4>' +
      '<label class="case-switch"><span>FG 机非分离改造（c：800 → ' + CAP_FG_FIXED + '）</span><input type="checkbox" id="fixSw"></label>' +
      '<label class="case-switch"><span>Braess：开通捷径 P→Q</span><input type="checkbox" id="scSw"></label></div>';
  }
  function syncControls() {
    const pv = document.getElementById("pVal"), pr = document.getElementById("pRange");
    if (pv) pv.textContent = String(delay);
    if (pr) pr.value = String(delay);
    const fx = document.getElementById("fixSw"); if (fx) fx.checked = fixedFG;
    const sc = document.getElementById("scSw"); if (sc) sc.checked = shortcut;
    Array.prototype.forEach.call(controls.querySelectorAll("[data-op]"), b => b.classList.toggle("on", b.dataset.op === showOp));
  }
  function buildControls() {
    const items = steps.map((s, i) => '<button type="button" class="step-item" data-i="' + i + '"><span class="num">' + (i + 1) + '</span><span>' + esc(s.name) + '</span><span class="phase-tag">' + esc(PHASES[s.phase].slice(0, 2)) + '</span></button>').join("");
    controls.innerHTML =
      '<div class="step-controller">' +
        '<div class="step-progress-head"><span id="stepCounter">第 1 / ' + steps.length + ' 步</span><small>' + esc(info.label) + ' · 点一步看变化</small></div>' +
        '<div class="progress-track"><div class="progress-fill"></div></div>' +
        '<div class="step-btns">' +
          '<button type="button" class="step-btn" id="prevBtn">◀ 上一步</button>' +
          '<button type="button" class="step-btn primary" id="nextBtn">下一步 ▶</button>' +
          '<button type="button" class="step-btn" id="playBtn">▶ 自动播放</button>' +
          '<button type="button" class="step-btn" id="resetBtn">↺ 重置</button>' +
        '</div>' +
        '<label class="speed-row"><span>播放速度</span><input type="range" id="speedRange" min="1" max="5" step="1" value="3" aria-label="自动播放速度"><span>快</span></label>' +
      '</div>' + levelPanel() + '<div class="step-list">' + items + '</div>';
    document.getElementById("prevBtn").addEventListener("click", () => { stopPlay(); go(step - 1); });
    document.getElementById("nextBtn").addEventListener("click", () => { stopPlay(); go(step + 1); });
    document.getElementById("playBtn").addEventListener("click", togglePlay);
    document.getElementById("resetBtn").addEventListener("click", resetAll);
    controls.addEventListener("click", ev => {
      const it = ev.target.closest(".step-item");
      if (it) { stopPlay(); go(Number(it.dataset.i)); return; }
      const ob = ev.target.closest("[data-op]");
      if (ob) { stopPlay(); showOp = showOp === ob.dataset.op ? null : ob.dataset.op; renderStep(); }
    });
    const pr = document.getElementById("pRange");
    if (pr) pr.addEventListener("input", () => {
      stopPlay(); delay = Number(pr.value);
      if (!steps[step].route) step = steps.findIndex(s => s.table);
      renderStep();
    });
    const fx = document.getElementById("fixSw");
    if (fx) fx.addEventListener("change", () => {
      stopPlay(); fixedFG = fx.checked;
      step = fixedFG ? steps.findIndex(s => s.setFixed === true) : steps.findIndex(s => s.cut);
      renderStep();
    });
    const sc = document.getElementById("scSw");
    if (sc) sc.addEventListener("change", () => { stopPlay(); shortcut = sc.checked; step = steps.findIndex(s => s.view === "braess"); renderStep(); });
  }
  function buildPhases() {
    if (!phaseNav) return;
    phaseNav.innerHTML = PHASES.map((p, i) => '<button type="button" class="phase-chip" data-p="' + i + '"><span class="pn">' + (i + 1) + '</span>' + esc(p) + '</button>').join("");
    phaseNav.addEventListener("click", ev => {
      const b = ev.target.closest(".phase-chip"); if (!b) return;
      const idx = steps.findIndex(s => s.phase === Number(b.dataset.p));
      if (idx >= 0) { stopPlay(); go(idx); }
    });
  }
  function buildLegend() {
    const board = canvas.parentNode;
    if (!board || board.querySelector(".graph-legend")) return;
    const lg = document.createElement("div");
    lg.className = "graph-legend"; lg.setAttribute("aria-hidden", "true");
    const items = {
      basic: '<span><i class="lg-node"></i>路口</span><span><i class="lg-edge lg-bike"></i>慢行 G1</span><span><i class="lg-edge lg-car"></i>机动车 G2</span><span><i class="lg-edge lg-both"></i>混行 G1∩G2</span><span><i class="lg-edge lg-gone"></i>未建路段</span>',
      advanced: '<span><i class="lg-node"></i>路口</span><span><i class="lg-node lg-cur"></i>起终点</span><span><i class="lg-edge"></i>机动车道</span><span><i class="lg-edge lg-both"></i>混行（+p）</span><span><i class="lg-edge lg-car"></i>桥</span><span><i class="lg-edge lg-res"></i>最短路</span>',
      extend: '<span><i class="lg-node lg-cur"></i>起终口/S,T</span><span><i class="lg-edge"></i>容量 c</span><span><i class="lg-edge lg-res"></i>已用流 f/c</span><span><i class="lg-edge lg-car"></i>最小割 / 捷径</span>'
    };
    lg.innerHTML = items[LEVEL_KEY] || items.basic;
    board.appendChild(lg);
  }
  function hitEdge(ev) {
    const rect = canvas.getBoundingClientRect();
    const P = positions({ w: Math.max(300, Math.floor(rect.width)), h: Math.max(300, Math.floor(rect.height)) }, NODES);
    const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
    let best = null, bd = 14;
    GRID.forEach(k => {
      const [a, b] = edgeEnds(P, k);
      const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1;
      const t = Math.max(0.12, Math.min(0.88, ((x - a.x) * dx + (y - a.y) * dy) / L2));
      const d = Math.hypot(x - (a.x + t * dx), y - (a.y + t * dy));
      if (d < bd) { bd = d; best = k; }
    });
    return best;
  }
  if (LEVEL_KEY === "basic") {
    canvas.addEventListener("click", ev => {
      const k = hitEdge(ev); if (!k) return;
      stopPlay();
      const b = g1.includes(k), c = g2.includes(k);
      // 无 → 慢行 → 机动车 → 混行 → 无
      if (!b && !c) g1.push(k);
      else if (b && !c) { g1 = g1.filter(x => x !== k); g2.push(k); }
      else if (!b && c) g1.push(k);
      else { g1 = g1.filter(x => x !== k); g2 = g2.filter(x => x !== k); }
      if (steps[step].phase < 1 || steps[step].op === "grid") step = 2;
      renderStep();
    });
    canvas.addEventListener("mousemove", ev => { canvas.style.cursor = hitEdge(ev) ? "pointer" : "default"; });
  }

  buildControls();
  buildPhases();
  buildLegend();
  go(0);
  let rz = null;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(draw, 80); });
})();
