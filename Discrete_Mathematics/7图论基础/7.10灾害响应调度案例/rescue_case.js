/* ============================================================
   7.10 灾害响应调度案例 · 三层统一交互引擎
   window.CASE_LEVEL = "basic" | "advanced" | "extend"
   三层同构：案例六段式（情境背景 → 数学建模 → 交互求解 → 结果解读 → 价值引领 → 迁移思考）
   基础层 认识模型（带权图 + 自选路线）｜进阶层 求解模型（Dijkstra 逐轮）｜拓展层 拓展模型（删边 / 动态权 / 多源 / 多目标）
   说明：路网、灾情与时间均为教学用虚构数据。
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  const PHASES = ["情境背景", "数学建模", "交互求解", "结果解读", "价值引领", "迁移思考"];

  // 0 = 救援中心（源点），1..8 = 受灾区 A..H；坐标为 0..1 归一化
  const NODES = [
    { key: "救", name: "救援中心", desc: "应急指挥调度中心（出发点）", x: 0.5, y: 0.5 },
    { key: "A", name: "A区", desc: "积水严重", x: 0.3, y: 0.24 },
    { key: "B", name: "B区", desc: "电力中断", x: 0.7, y: 0.24 },
    { key: "C", name: "C区", desc: "人员被困", x: 0.06, y: 0.5 },
    { key: "D", name: "D区", desc: "道路受阻", x: 0.94, y: 0.5 },
    { key: "E", name: "E区", desc: "物资短缺", x: 0.3, y: 0.76 },
    { key: "F", name: "F区", desc: "通讯中断", x: 0.7, y: 0.76 },
    { key: "G", name: "G区", desc: "临时安置点", x: 0.5, y: 0.98 },
    { key: "H", name: "H区", desc: "医疗救护点", x: 0.5, y: 0.02 }
  ];
  // w = 通行时间（分钟），r = 道路风险分（1 低 … 4 高），均为虚构教学数据
  const EDGES = [
    { u: 0, v: 1, w: 15, r: 1 }, { u: 0, v: 2, w: 20, r: 1 }, { u: 0, v: 3, w: 25, r: 2 },
    { u: 0, v: 4, w: 30, r: 4 }, { u: 0, v: 5, w: 18, r: 1 }, { u: 0, v: 6, w: 22, r: 2 },
    { u: 1, v: 3, w: 10, r: 2 }, { u: 1, v: 8, w: 12, r: 1 }, { u: 2, v: 4, w: 15, r: 1 },
    { u: 2, v: 8, w: 18, r: 1 }, { u: 3, v: 5, w: 14, r: 2 }, { u: 4, v: 6, w: 16, r: 3 },
    { u: 5, v: 7, w: 20, r: 1 }, { u: 6, v: 7, w: 25, r: 2 }, { u: 1, v: 2, w: 35, r: 1 }
  ];
  const N = NODES.length;

  function ekey(u, v) { return Math.min(u, v) + "-" + Math.max(u, v); }
  function degrees(edges) {
    const d = Array(N).fill(0);
    edges.forEach(e => { d[e.u]++; d[e.v]++; });
    return d;
  }
  /* 情境 → 实际参与计算的边（删边 / 拥堵加时 / 风险折算） */
  function scenarioEdges(sc) {
    sc = sc || {};
    const broken = new Set(sc.broken || []);
    const extra = sc.extra || {};
    const lam = sc.lambda || 0;
    return EDGES.filter(e => !broken.has(ekey(e.u, e.v))).map(e => {
      const add = extra[ekey(e.u, e.v)] || 0;
      const time = e.w + add;
      return { u: e.u, v: e.v, w: e.w, r: e.r, time, add, cost: time + lam * e.r };
    });
  }
  /* Dijkstra（支持多源）：逐轮记录「选点 → 松弛」，平局取编号小者 */
  function dijkstraTrace(edges, sources) {
    const adj = Array.from({ length: N }, () => []);
    edges.forEach(e => {
      const c = e.cost != null ? e.cost : e.w;
      adj[e.u].push({ v: e.v, c });
      adj[e.v].push({ v: e.u, c });
    });
    adj.forEach(list => list.sort((a, b) => a.v - b.v));
    const dist = Array(N).fill(Infinity), pre = Array(N).fill(-1), owner = Array(N).fill(-1), done = Array(N).fill(false);
    sources.forEach(s => { dist[s] = 0; owner[s] = s; });
    const rounds = [];
    for (;;) {
      let u = -1;
      for (let i = 0; i < N; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
      if (u < 0) break;
      done[u] = true;
      const relax = [];
      adj[u].forEach(({ v, c }) => {
        if (done[v]) return;
        const old = dist[v], cand = dist[u] + c;
        const upd = cand < old;
        if (upd) { dist[v] = cand; pre[v] = u; owner[v] = owner[u]; }
        relax.push({ v, c, old, cand, upd });
      });
      rounds.push({ u, du: dist[u], relax, dist: dist.slice(), pre: pre.slice(), done: done.slice() });
    }
    return { rounds, dist, pre, owner };
  }
  function pathTo(pre, t) {
    const p = [];
    for (let c = t; c >= 0; c = pre[c]) p.push(c);
    return p.reverse();
  }
  function pathEdges(path) {
    const out = [];
    for (let i = 0; i + 1 < path.length; i++) out.push([path[i], path[i + 1]]);
    return out;
  }
  function edgeOf(edges, u, v) { return edges.find(e => ekey(e.u, e.v) === ekey(u, v)); }
  function routeTime(edges, route) {
    let s = 0;
    for (let i = 0; i + 1 < route.length; i++) {
      const e = edgeOf(edges, route[i], route[i + 1]);
      if (!e) return NaN;
      s += e.time != null ? e.time : e.w;
    }
    return s;
  }
  function solve(sc) {
    const edges = scenarioEdges(sc);
    const res = dijkstraTrace(edges, (sc && sc.sources) || [0]);
    return { edges, res };
  }

  const LOGIC = { NODES, EDGES, PHASES, ekey, degrees, scenarioEdges, dijkstraTrace, pathTo, routeTime, solve };
  if (typeof module !== "undefined" && module.exports) { module.exports = LOGIC; }
  if (typeof document === "undefined") return;

  /* ---------------- 文本工具 ---------------- */
  const nm = i => NODES[i].name;
  const keyOf = i => NODES[i].key;
  const fmt = d => (d === Infinity ? "∞" : String(d));
  const routeName = p => p.map(nm).join(" → ");
  function sumText(edges, p, field) {
    const parts = [];
    for (let i = 0; i + 1 < p.length; i++) {
      const e = edgeOf(edges, p[i], p[i + 1]);
      parts.push(e ? e[field || "time"] : "?");
    }
    return parts.join(" + ");
  }
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  }

  /* ---------------- 三层步骤 ---------------- */
  const BASE = solve({});
  const ALL_EDGES = EDGES.map(e => [e.u, e.v]);

  function buildBasic() {
    const E0 = BASE.edges;
    const deg = degrees(EDGES);
    const pB = [0, 2, 8], pA = [0, 1, 8];
    return [
      {
        phase: 0, name: "灾情与问题",
        view: { hotNodes: [0] },
        formula: '问题：从<span class="ft hot">救援中心</span>出发，到 8 个受灾区<span class="ft hot">最快</span>各要多少分钟？',
        badge: "情境", tone: "gold",
        text: "暴雨过后，救援中心要向 A–H 八个区派出救援队（虚构教学情境）。道路有的近、有的绕，有的通行慢——先把这张“灾区路网”看清楚，才能谈最快。"
      },
      {
        phase: 1, name: "顶点：地点",
        view: { hotNodes: NODES.map((_, i) => i) },
        formula: 'V = {救, A, B, C, D, E, F, G, H}，<span class="ft hot">|V| = ' + N + '</span>',
        badge: "顶点", tone: "",
        text: "把每个<b>地点</b>（救援中心、各受灾区）抽象为一个<b>顶点</b>。地点的名字、灾情只是标签，建模时关心的是“谁和谁之间有路”。"
      },
      {
        phase: 1, name: "边：可通行道路",
        view: { hotEdges: ALL_EDGES },
        formula: 'E = 可通行道路，<span class="ft hot">|E| = ' + EDGES.length + '</span>；道路双向通行 ⇒ 无向边',
        badge: "边", tone: "",
        text: "两地之间有一条可通行的道路，就连一条<b>边</b>。救援车双向都能走，所以用<b>无向图</b>。",
        viz: "degrees"
      },
      {
        phase: 1, name: "权：通行时间",
        view: { weights: true },
        formula: 'w: E → ℝ⁺，如 <span class="ft hot">w(救, A) = 15</span> 分钟；带权图 G = (V, E, w)',
        badge: "边权", tone: "",
        text: "每条边标上<b>通行时间</b>（分钟）作为权。权可以是距离、时间或费用；救援最关心时间。注意所有权都<b>非负</b>——这是后面 Dijkstra 算法的前提。握手定理核对：Σdeg(v) = " + deg.reduce((a, b) => a + b, 0) + " = 2|E|。",
        viz: "degrees"
      },
      {
        phase: 2, name: "一条路线的耗时",
        view: { weights: true, hotEdges: pathEdges(pB), hotNodes: [0, 8] },
        formula: '路线 救 → B → H：<span class="ft hot">' + sumText(E0, pB) + ' = ' + routeTime(E0, pB) + '</span> 分钟',
        badge: "路径权", tone: "",
        text: "一条<b>路径</b>的权 = 途经各边权之和。经 B 区去 H 区（医疗救护点）要 " + routeTime(E0, pB) + " 分钟。"
      },
      {
        phase: 2, name: "换一条路比一比",
        view: { weights: true, okEdges: pathEdges(pA), hotEdges: pathEdges(pB), okNodes: [8] },
        formula: '救 → A → H：<span class="ft hot-green hot">' + sumText(E0, pA) + ' = ' + routeTime(E0, pA) + '</span> &lt; ' + routeTime(E0, pB) + '（经 B）',
        badge: "比较", tone: "",
        text: "改走 A 区只要 " + routeTime(E0, pA) + " 分钟，比经 B 区快 " + (routeTime(E0, pB) - routeTime(E0, pA)) + " 分钟。<b>“最快”就是在所有路径里找权和最小的那条</b>——这就是<b>最短路径</b>问题。"
      },
      {
        phase: 2, name: "动手规划路线",
        route: true,
        view: { weights: true },
        badge: "动手", tone: "gold",
        formula: "", text: ""
      },
      {
        phase: 3, name: "最短路可能不唯一",
        view: { weights: true, okEdges: [[0, 3], [0, 1], [1, 3]], okNodes: [3] },
        formula: '到 C 区：直达 <span class="ft hot-green hot">25</span> ＝ 经 A 区 <span class="ft hot-green hot">15 + 10 = 25</span>',
        badge: "解读", tone: "",
        text: "两条路线同为 25 分钟，都是最短路。<b>最短距离唯一，最短路径可以不唯一</b>；调度时可按道路安全、载重等次要条件再挑选。"
      },
      {
        phase: 4, name: "分钟里的责任",
        view: { weights: true, okEdges: pathEdges(pA), okNodes: [8] },
        formula: '同一目的地，路线差 <span class="ft hot">' + (routeTime(E0, pB) - routeTime(E0, pA)) + '</span> 分钟',
        badge: "价值", tone: "red",
        text: "模型里的每个权都是真实的等待时间。把路网画成带权图、把“最快”算清楚，救援决策就不再凭经验拍脑袋——<b>人民至上、生命至上</b>，落到调度上就是对每一分钟负责。"
      },
      {
        phase: 5, name: "迁移：让算法来找",
        view: { weights: true },
        formula: '顶点一多，路线数<span class="ft hot">急剧增长</span> ⇒ 需要系统的最短路算法',
        badge: "迁移", tone: "gold",
        text: "9 个地点已能拼出许多条路线，真实城市有成千上万个路口，靠枚举比不过来。进阶层用 <b>Dijkstra 算法</b>一次算出救援中心到所有地点的最快路线；也想一想：快递配送、外卖派单里，顶点、边、权分别是什么？"
      }
    ];
  }

  function buildAdvanced(target) {
    const sol = BASE.res;
    const E0 = BASE.edges;
    const steps = [];
    const tPath = pathTo(sol.pre, target);
    steps.push({
      phase: 0, name: "调度任务",
      view: { weights: true, hotNodes: [0, target] },
      formula: '求救援中心到<span class="ft hot">每个受灾区</span>的最快路线（单源最短路）',
      badge: "情境", tone: "gold",
      text: "指挥部要同时给 8 支队伍下达路线。逐条比较太慢，需要一个<b>一次算完所有目的地</b>的方法。当前关注目标：<b>" + nm(target) + "</b>（可在左侧或点图上顶点更换）。"
    });
    steps.push({
      phase: 1, name: "建模与前提",
      view: { weights: true },
      formula: 'G = (V, E, w)，w(e) ≥ 0；维护 <span class="ft hot">dist(v)</span>、<span class="ft hot-blue hot">pre(v)</span> 与已确定集 S',
      badge: "建模", tone: "",
      text: "dist(v) 记录“目前已知的最快时间”，pre(v) 记录“最后一段从哪来”（用来回溯路线），S 是<b>已确定最短距离</b>的顶点。边权非负，是 Dijkstra 正确的前提。"
    });
    steps.push({
      phase: 2, name: "初始化",
      view: { weights: true, dist: [0].concat(Array(N - 1).fill(Infinity)), pre: Array(N).fill(-1), done: Array(N).fill(false), hotNodes: [0] },
      formula: 'dist(救) = <span class="ft hot-green hot">0</span>，其余 dist = <span class="ft hot">∞</span>，S = ∅',
      badge: "init", tone: "",
      text: "出发点耗时 0；其他地点“还不知道能不能到”，记为 ∞。",
      viz: "table"
    });
    sol.rounds.forEach((r, k) => {
      const upd = r.relax.filter(x => x.upd);
      const keep = r.relax.filter(x => !x.upd);
      const relaxText = r.relax.length
        ? r.relax.map(x => nm(x.v) + "：" + (x.upd ? fmt(x.old) + " → <b>" + x.cand + "</b>" : "候选 " + x.cand + " ≥ " + fmt(x.old) + "，不变")).join("；")
        : "所有邻居都已确定，无需松弛";
      const formula = '选 dist 最小的未定顶点 <span class="ft hot">' + keyOf(r.u) + '（' + r.du + '）</span> 加入 S' +
        (upd.length ? '；松弛：' + upd.map(x => keyOf(x.v) + ' = ' + r.du + ' + ' + x.c + ' = <span class="ft hot-green hot">' + x.cand + '</span>').join('，') : '；本轮无更新');
      let text = "第 " + (k + 1) + " 轮：未确定顶点中 <b>" + nm(r.u) + "</b> 的 dist = " + r.du + " 最小，" +
        (k === 0 ? "它就是出发点。" : "边权非负，绕别处只会更慢，于是它的最快时间<b>就此确定</b>（前驱 " + keyOf(r.pre[r.u]) + "）。") +
        " 用它松弛相邻未定顶点——" + relaxText + "。";
      if (keep.some(x => x.cand === x.old)) text += " 注意：候选值与原值<b>相等</b>时不更新，说明最短路不唯一。";
      steps.push({
        phase: 2, name: "第 " + (k + 1) + " 轮：确定 " + keyOf(r.u),
        view: {
          weights: true, dist: r.dist, pre: r.pre, done: r.done, cur: r.u,
          hotEdges: r.relax.map(x => [r.u, x.v]),
          treeEdges: r.pre.map((p, v) => (p >= 0 && r.done[v] ? [p, v] : null)).filter(Boolean),
          updated: upd.map(x => x.v)
        },
        formula, badge: "第" + (k + 1) + "轮", tone: k === sol.rounds.length - 1 ? "gold" : "",
        text, viz: "table"
      });
    });
    const tree = sol.pre.map((p, v) => (p >= 0 ? [p, v] : null)).filter(Boolean);
    steps.push({
      phase: 3, name: "回溯：最快路线",
      target: true,
      view: { weights: true, dist: sol.dist, pre: sol.pre, done: Array(N).fill(true), treeEdges: tree, okEdges: pathEdges(tPath), okNodes: tPath },
      formula: nm(target) + '：<span class="ft hot-green hot">' + routeName(tPath) + '</span>，' + sumText(E0, tPath) + ' = <span class="ft hot">' + sol.dist[target] + '</span> 分钟',
      badge: sol.dist[target] + "分", tone: "",
      text: "沿 pre 从目标倒推：" + tPath.slice().reverse().map(keyOf).join(" ← ") + "。浅绿色是全部 pre 边组成的<b>最短路径树</b>——每个受灾区的最快路线都在这棵树上；深绿色是当前目标的路线。换个目标，路线立刻从树上读出。",
      viz: "table"
    });
    steps.push({
      phase: 4, name: "定案即最优",
      view: { weights: true, dist: sol.dist, pre: sol.pre, done: Array(N).fill(true), treeEdges: tree },
      formula: '每轮确定的 dist 都是<span class="ft hot-green hot">最终最优值</span>（非负权保证）',
      badge: "价值", tone: "red",
      text: "Dijkstra 的每一次“确定”都有数学保证：不会事后发现更快的路。指挥部因此可以<b>边算边派车</b>——先确定的区先出发。用可证明正确的方法分秒必争，是<b>科学调度、对生命负责</b>的具体体现。",
      viz: "table"
    });
    steps.push({
      phase: 5, name: "迁移：路断了怎么办",
      view: { weights: true, gone: [ekey(5, 7)] },
      formula: '道路中断 = <span class="ft hot">删边</span>，拥堵 = <span class="ft hot">改权</span> ⇒ 重新求解',
      badge: "迁移", tone: "gold",
      text: "若 E–G 道路被冲毁（灰色虚线），G 区的最快路线会怎样变？若某路段拥堵，权重变大又如何？还有多支队伍、兼顾安全……这些都在<b>拓展层</b>展开。医疗急救、消防出警的调度内核同样是最短路。"
    });
    return steps;
  }

  /* 拓展层：每步携带一个情境 scenario，可在左侧开关里继续修改 */
  const SC_BASE = { broken: [], extra: {}, sources: [0], lambda: 0 };
  const SC_BREAK = { broken: [ekey(5, 7)], extra: {}, sources: [0], lambda: 0 };
  const SC_JAM = { broken: [ekey(5, 7)], extra: { [ekey(0, 6)]: 15 }, sources: [0], lambda: 0 };
  const SC_MULTI = { broken: [], extra: {}, sources: [0, 8], lambda: 0 };
  const SC_RISK = { broken: [], extra: {}, sources: [0], lambda: 3 };

  function buildExtend() {
    const s0 = solve(SC_BASE), s1 = solve(SC_BREAK), s2 = solve(SC_JAM), s3 = solve(SC_MULTI), s4 = solve(SC_RISK);
    const p0 = pathTo(s0.res.pre, 7), p1 = pathTo(s1.res.pre, 7), p2 = pathTo(s2.res.pre, 7);
    const pc0 = pathTo(s0.res.pre, 3), pc3 = pathTo(s3.res.pre, 3);
    const pd0 = pathTo(s0.res.pre, 4), pd4 = pathTo(s4.res.pre, 4);
    const own = s3.res.owner;
    const byH = NODES.map((_, i) => i).filter(i => own[i] === 8 && i !== 8);
    const riskOf = p => { let s = 0; for (let i = 0; i + 1 < p.length; i++) s += edgeOf(EDGES, p[i], p[i + 1]).r; return s; };
    return [
      {
        phase: 0, name: "灾情在变化", sc: SC_BASE, target: 7,
        formula: '平时：救 → G 最快 <span class="ft hot-green hot">' + routeName(p0) + '，' + s0.res.dist[7] + '</span> 分钟',
        badge: "情境", tone: "gold",
        text: "真实救援中，道路会被冲毁、路段会拥堵，还可能有多支队伍、需要兼顾安全。<b>图在变，最短路也在变</b>。先记住基准：到 G 区（临时安置点）" + s0.res.dist[7] + " 分钟。"
      },
      {
        phase: 1, name: "动态图建模", sc: SC_BASE, target: 7,
        formula: '中断：<span class="ft hot">G − e</span>；拥堵：<span class="ft hot">w′(e) = w(e) + Δ</span>；多队：<span class="ft hot-blue hot">超级源点</span>；兼顾安全：<span class="ft hot-blue hot">w + λ·r</span>',
        badge: "建模", tone: "",
        text: "四种变化都能化成图的操作：删边、改权、加虚拟源点、把多个指标加权成一个权。模型变了，<b>算法不用变</b>，重算 Dijkstra 即可。"
      },
      {
        phase: 2, name: "道路中断：删边重算", sc: SC_BREAK, target: 7,
        formula: '删去 E–G 后：<span class="ft hot">' + routeName(p1) + '</span> = ' + sumText(s1.edges, p1) + ' = <span class="ft hot">' + s1.res.dist[7] + '</span> 分钟（原 ' + s0.res.dist[7] + '）',
        badge: "删边", tone: "",
        text: "E–G 被冲毁，G 区只能从 F 区进入，最快变为 " + s1.res.dist[7] + " 分钟，多了 " + (s1.res.dist[7] - s0.res.dist[7]) + " 分钟。其他各区不受影响——删边只会让距离<b>不变或变大</b>。"
      },
      {
        phase: 2, name: "路段拥堵：权重上升", sc: SC_JAM, target: 7,
        formula: 'w(救, F)：22 → <span class="ft hot">37</span>；G：' + routeName(p2) + ' = <span class="ft hot">' + s2.res.dist[7] + '</span> 分钟',
        badge: "改权", tone: "",
        text: "在删边基础上，救–F 路段又拥堵 15 分钟。比较经 D 区绕行（" + (30 + 16 + 25) + " 分钟）后，仍是经 F 区最快，共 " + s2.res.dist[7] + " 分钟。<b>实时导航就是“权重一变就重算”</b>。"
      },
      {
        phase: 2, name: "两队协同：多源最短路", sc: SC_MULTI, target: 3,
        formula: '源点集 {救, H}：C 区由 <span class="ft hot-green hot">H 区医疗队</span>出发，' + routeName(pc3) + ' = ' + s3.res.dist[3] + ' &lt; ' + s0.res.dist[3],
        badge: "多源", tone: "",
        text: "H 区医疗点也派出一支队伍。设想一个<b>超级源点</b>，用权为 0 的边连向救援中心和 H 区，跑一次 Dijkstra 就得到“每个区离最近队伍多远”。结果：" + byH.map(keyOf).join("、") + " 区交给 H 区医疗队更快，其余由救援中心负责（下表“负责队伍”列）。",
        viz: "owner"
      },
      {
        phase: 2, name: "兼顾安全：多目标加权", sc: SC_RISK, target: 4,
        formula: 'cost = 时间 + λ·风险，λ = 3：D 区改走 <span class="ft hot">' + routeName(pd4) + '</span>',
        badge: "多目标", tone: "",
        text: "D 区“道路受阻”，救–D 直达路段风险分高（4）。λ = 0 时直达 " + s0.res.dist[4] + " 分钟最快；λ = 3 时直达代价 " + (30 + 3 * 4) + "，经 B 区代价 " + (35 + 3 * riskOf(pd4)) + "，路线切换为经 B 区（用时 " + routeTime(EDGES, pd4) + " 分钟、风险分 " + riskOf(pd4) + "）。<b>λ 表达的是“愿意用几分钟换 1 分风险”</b>，由决策者定。"
      },
      {
        phase: 3, name: "对比四种情境", sc: SC_BASE, target: 7, viz: "compare",
        formula: '情境不同，<span class="ft hot">同一算法</span>给出不同的最优调度',
        badge: "解读", tone: "",
        text: "下表把四种变化的结果放在一起：删边与拥堵让时间变长；增加队伍（多源）让时间变短；多目标不一定最快，但更稳妥。<b>模型的假设决定了“最优”的含义</b>。"
      },
      {
        phase: 4, name: "算法服务应急治理", sc: SC_BASE, target: 7,
        formula: '实时数据 → <span class="ft hot">改图</span> → 重算 → 调度',
        badge: "价值", tone: "red",
        text: "应急指挥平台把道路损毁、拥堵、队伍位置等信息不断写进这张图，再由算法给出调度建议。数学模型越贴近实情，决策越可靠——这正是用科技守护<b>人民生命安全</b>的方式。"
      },
      {
        phase: 5, name: "迁移：急救与消防", sc: SC_BASE, target: 7,
        formula: '120 急救 / 消防出警 / 应急物资配送：<span class="ft hot">动态多源最短路</span>',
        badge: "迁移", tone: "gold",
        text: "急救派车=多源最短路（多辆救护车）；消防出警要考虑车辆类型与道路限高，相当于删去不可通行的边；物资配送还要考虑车辆容量，会走向车辆路径问题（VRP）。试着用左侧开关组合出自己的情境，再看结果如何变化。"
      }
    ];
  }

  /* ---------------- DOM 层 ---------------- */
  const LEVEL_KEY = window.CASE_LEVEL || "basic";
  const LEVEL_INFO = {
    basic: { label: "基础层", mission: "把灾区路网画成带权图，比一比哪条救援路线最快。", badge: "认识模型 · 带权图", hint: "点“下一步”；在「动手规划路线」一步可点图上顶点连线" },
    advanced: { label: "进阶层", mission: "逐轮执行 Dijkstra：选最小 → 确定 → 松弛，读出每个受灾区的最快路线。", badge: "求解模型 · Dijkstra", hint: "点图上受灾区可更换目标；表格同步显示 dist / pre" },
    extend: { label: "拓展层", mission: "让路网“动起来”：删边、改权、多队协同、兼顾安全，重算最优调度。", badge: "拓展模型 · 动态最短路", hint: "左侧开关可自由组合情境，图与结论即时重算" }
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
    node: "#d63b1d", cur: "#ffb400", ok: "#1f9d55", dimNode: "#eed8cc",
    edge: "rgba(107,74,56,0.5)", edgeDim: "rgba(107,74,56,0.16)", edgeHot: "#d63b1d", edgeOk: "#1f9d55",
    tree: "rgba(31,157,85,0.42)", gone: "#9a8a80",
    text: "#fff", curText: "#2c1810", dimText: "#9a7a6a", ring: "#fff8ec", ink: "#2c1810", muted: "#6b4a38"
  };
  let R = 19;

  let target = 7;
  let steps = [];
  let step = 0;
  let playTimer = null;
  let route = [0, 6, 7];            // 基础层「动手规划」默认示例：救 → F → G
  let routeMsg = "";
  let custom = null;                // 拓展层：用户修改后的情境

  function rebuild() {
    steps = LEVEL_KEY === "advanced" ? buildAdvanced(target) : LEVEL_KEY === "extend" ? buildExtend() : buildBasic();
  }

  /* ---- 情境（拓展层） ---- */
  function currentScenario() {
    const st = steps[step];
    return custom || (st && st.sc) || SC_BASE;
  }
  function scenarioView(sc, tgt) {
    const { edges, res } = solve(sc);
    const p = pathTo(res.pre, tgt);
    const reach = res.dist[tgt] < Infinity;
    const tree = res.pre.map((pp, v) => (pp >= 0 ? [pp, v] : null)).filter(Boolean);
    return {
      edges, res, path: reach ? p : [],
      view: {
        weights: true, useCost: (sc.lambda || 0) > 0,
        dist: res.dist, pre: res.pre, done: Array(N).fill(true),
        treeEdges: tree, okEdges: reach ? pathEdges(p) : [], okNodes: reach ? p : [],
        gone: sc.broken || [], jam: Object.keys(sc.extra || {}), sources: sc.sources || [0],
        owner: (sc.sources || [0]).length > 1 ? res.owner : null
      }
    };
  }

  /* ---- 画布 ---- */
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(300, Math.floor(rect.width));
    const h = Math.max(300, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }
  function legendSpace() {
    const lg = canvas.parentNode && canvas.parentNode.querySelector(".graph-legend");
    return lg && lg.offsetHeight ? lg.offsetTop + lg.offsetHeight : 34;
  }
  function positions(size) {
    const padX = size.w < 520 ? 34 : 64, padTop = legendSpace() + 40, padBot = 56;
    return NODES.map(nd => ({ x: padX + nd.x * (size.w - 2 * padX), y: padTop + nd.y * (size.h - padTop - padBot) }));
  }
  function inSet(list, u, v) {
    return (list || []).some(p => (p[0] === u && p[1] === v) || (p[0] === v && p[1] === u));
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }
  function currentView() {
    const st = steps[step];
    if (LEVEL_KEY === "extend") return scenarioView(currentScenario(), target).view;
    if (st.route) {
      const t = route.length > 1 ? route[route.length - 1] : -1;
      return { weights: true, hotEdges: pathEdges(route), curNode: t >= 0 ? t : null, sources: [0] };
    }
    return st.view || {};
  }
  function draw() {
    const size = resize();
    const P = positions(size);
    const v = currentView();
    const small = size.w < 520;
    R = small ? 15 : 19;
    const done = v.done || null;
    const hotNodes = new Set(v.hotNodes || []);
    const okNodes = new Set(v.okNodes || []);
    const updated = new Set(v.updated || []);
    const gone = new Set(v.gone || []);
    const jam = new Set(v.jam || []);
    const sc = LEVEL_KEY === "extend" ? currentScenario() : SC_BASE;
    const shown = LEVEL_KEY === "extend" ? scenarioEdges(Object.assign({}, sc, { broken: [] })) : scenarioEdges({});
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    // 边
    shown.forEach(e => {
      const a = P[e.u], b = P[e.v];
      const k = ekey(e.u, e.v);
      const isGone = gone.has(k);
      const ok = inSet(v.okEdges, e.u, e.v);
      const hot = !ok && inSet(v.hotEdges, e.u, e.v);
      const tree = !ok && !hot && inSet(v.treeEdges, e.u, e.v);
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const sx = a.x + Math.cos(ang) * R, sy = a.y + Math.sin(ang) * R;
      const ex = b.x - Math.cos(ang) * R, ey = b.y - Math.sin(ang) * R;
      ctx.save();
      if (isGone) {
        ctx.setLineDash([7, 6]);
        ctx.strokeStyle = C.gone; ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = ok ? C.edgeOk : hot ? C.edgeHot : tree ? C.tree : C.edge;
        ctx.lineWidth = ok ? 5 : hot ? 4 : tree ? 4 : 2.2;
      }
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.restore();
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      if (isGone) {
        ctx.save();
        ctx.strokeStyle = "#c0392b"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(mx - 7, my - 7); ctx.lineTo(mx + 7, my + 7); ctx.moveTo(mx + 7, my - 7); ctx.lineTo(mx - 7, my + 7); ctx.stroke();
        ctx.restore();
        return;
      }
      if (v.weights) {
        const label = v.useCost ? String(e.cost) : String(e.time);
        ctx.font = "800 " + (small ? 11 : 12) + "px 'JetBrains Mono', Consolas, monospace";
        const tw = ctx.measureText(label).width + 10;
        roundRect(mx - tw / 2, my - 10, tw, 20, 6);
        ctx.fillStyle = ok ? C.edgeOk : hot ? C.edgeHot : jam.has(k) ? C.cur : "rgba(255,251,240,0.95)";
        ctx.fill();
        ctx.strokeStyle = "rgba(116,55,31,0.2)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = ok || hot ? "#fff" : C.ink;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(label, mx, my + 0.5);
      }
    });

    // 顶点
    const sources = new Set(v.sources || [0]);
    P.forEach((p, i) => {
      const isCur = v.cur === i || v.curNode === i;
      const isOk = okNodes.has(i) || (done && done[i] && !isCur);
      const isHot = hotNodes.has(i);
      const dim = (v.hotNodes || v.okNodes) && !done && !isHot && !isOk && !isCur && v.weights === undefined;
      ctx.beginPath();
      ctx.arc(p.x, p.y, isCur || isHot ? R + 2 : R, 0, Math.PI * 2);
      ctx.fillStyle = isCur || isHot ? C.cur : isOk ? C.ok : dim ? C.dimNode : C.node;
      ctx.fill();
      ctx.strokeStyle = C.ring; ctx.lineWidth = 3; ctx.stroke();
      if (sources.has(i)) {
        ctx.beginPath(); ctx.arc(p.x, p.y, R + 6, 0, Math.PI * 2);
        ctx.strokeStyle = isOk ? C.ok : C.node; ctx.lineWidth = 2; ctx.stroke();
      }
      if (v.owner && v.owner[i] === 8 && i !== 8) {
        ctx.beginPath(); ctx.arc(p.x, p.y, R + 6, 0, Math.PI * 2);
        ctx.setLineDash([3, 3]); ctx.strokeStyle = C.cur; ctx.lineWidth = 2.5; ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.fillStyle = isCur || isHot ? C.curText : dim ? C.dimText : C.text;
      ctx.font = "800 14px 'JetBrains Mono', 'Noto Serif SC', Consolas, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(NODES[i].key, p.x, p.y + 0.5);
      // 地点说明（窄屏只标救援中心）
      if (!small) {
        ctx.fillStyle = C.muted;
        ctx.font = "700 " + (small ? 11 : 12) + "px 'Noto Serif SC', 'Microsoft YaHei', serif";
        const label = i === 0 ? "救援中心" : NODES[i].name + " · " + NODES[i].desc;
        if (NODES[i].y > 0.9 || NODES[i].y < 0.1) { ctx.textAlign = "left"; ctx.fillText(label, p.x + R + 10, p.y + 2); ctx.textAlign = "center"; }
        else ctx.fillText(label, p.x, p.y + R + 16);
      }
      // dist 标签
      if (v.dist) {
        const d = v.dist[i];
        const label = d === Infinity ? "∞" : String(d);
        ctx.font = "800 " + (small ? 11 : 12) + "px 'JetBrains Mono', Consolas, monospace";
        const bx = p.x + R + (small ? 5 : 8), by = p.y - R - (small ? 0 : 2);
        const bw = Math.max(small ? 20 : 24, ctx.measureText(label).width + (small ? 8 : 12));
        const bh = small ? 18 : 22;
        roundRect(bx - bw / 2, by - bh / 2, bw, bh, 7);
        const upd = updated.has(i);
        ctx.fillStyle = upd ? C.edgeHot : (done && done[i]) ? C.ok : "#fffbf0";
        ctx.fill();
        ctx.strokeStyle = upd ? C.edgeHot : (done && done[i]) ? C.ok : "rgba(116,55,31,0.35)";
        ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = upd || (done && done[i]) ? "#fff" : C.ink;
        ctx.fillText(label, bx, by + 0.5);
      }
    });
  }

  /* ---- 讲解区辅助内容 ---- */
  function tableHtml(v, opts) {
    opts = opts || {};
    const rows = NODES.map((nd, i) => {
      const d = v.dist ? v.dist[i] : Infinity;
      const p = v.pre ? v.pre[i] : -1;
      const isDone = v.done && v.done[i];
      const cls = v.cur === i ? "is-cur" : (v.updated || []).includes(i) ? "is-upd" : isDone ? "is-ok" : "";
      const status = v.cur === i ? "本轮确定" : isDone ? "已确定" : d === Infinity ? "未到达" : "待定";
      return '<tr class="' + cls + '"><td>' + esc(nd.name) + '</td><td class="mono">' + fmt(d) + '</td><td class="mono">' + (p >= 0 ? esc(NODES[p].key) : "—") + '</td>' +
        (opts.owner ? '<td>' + (v.owner && v.owner[i] >= 0 ? (v.owner[i] === 8 ? "H区医疗队" : "救援中心") : "—") + '</td>' : '<td>' + status + '</td>') + '</tr>';
    }).join("");
    return '<div class="graph-summary"><div class="table-scroll"><table class="case-table"><thead><tr><th>顶点</th><th>dist' + (opts.cost ? "（代价）" : "（分钟）") + '</th><th>前驱 pre</th><th>' + (opts.owner ? "负责队伍" : "状态") + '</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }
  function degreesHtml() {
    const d = degrees(EDGES);
    return '<div class="graph-summary"><b>各顶点的度（连着几条路）：</b><div class="pill-row">' +
      NODES.map((nd, i) => '<span class="pill">deg(' + esc(nd.key) + ') = ' + d[i] + '</span>').join("") +
      '</div>Σdeg(v) = ' + d.reduce((a, b) => a + b, 0) + ' = 2 × ' + EDGES.length + ' ✓（握手定理）</div>';
  }
  function compareHtml() {
    const rows = [
      ["平时（基准）", SC_BASE, 7], ["E–G 中断", SC_BREAK, 7], ["E–G 中断 + 救–F 拥堵", SC_JAM, 7],
      ["两队协同（到 C 区）", SC_MULTI, 3], ["兼顾安全 λ=3（到 D 区）", SC_RISK, 4]
    ].map(([label, sc, t]) => {
      const s = solve(sc);
      const p = pathTo(s.res.pre, t);
      return '<tr><td>' + esc(label) + '</td><td>' + esc(routeName(p)) + '</td><td class="mono">' + routeTime(s.edges, p) + '</td></tr>';
    }).join("");
    return '<div class="graph-summary"><div class="table-scroll"><table class="case-table"><thead><tr><th>情境</th><th>最优路线</th><th>用时（分钟）</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }
  function routeHtml() {
    const E0 = BASE.edges;
    const t = route[route.length - 1];
    const best = BASE.res.dist[t];
    const time = routeTime(E0, route);
    let verdict = "";
    if (route.length > 1) {
      verdict = time === best
        ? '<span class="ok-text">✓ 已是最快路线（' + best + ' 分钟）</span>'
        : '<span class="bad-text">比最快路线慢 ' + (time - best) + ' 分钟</span>（到 ' + esc(nm(t)) + ' 最快 ' + best + ' 分钟）';
    }
    return '<div class="graph-summary"><b>你的路线：</b>' + esc(routeName(route)) +
      (route.length > 1 ? '，用时 <b>' + time + '</b> 分钟。' + verdict : '。点击与路线末端<b>相邻</b>的顶点，逐段延伸路线。') +
      (routeMsg ? '<br>' + routeMsg : '') +
      '<div class="route-tools"><button type="button" class="step-btn" data-route="undo">撤销一段</button><button type="button" class="step-btn ghost" data-route="clear">清空路线</button></div></div>';
  }
  function renderViz(st, v) {
    if (!vizText) return;
    let html = "";
    if (st.route) html = routeHtml();
    else if (st.viz === "degrees") html = degreesHtml();
    else if (st.viz === "table") html = tableHtml(v);
    else if (st.viz === "compare" && !custom) html = compareHtml();
    else if (LEVEL_KEY === "extend") {
      const sc = currentScenario();
      html = tableHtml(v, { owner: (sc.sources || []).length > 1, cost: (sc.lambda || 0) > 0 });
    }
    vizText.innerHTML = html;
    vizText.style.display = html ? "grid" : "none";
  }

  function customText(sc) {
    const sv = scenarioView(sc, target);
    const parts = [];
    if ((sc.broken || []).length) parts.push("E–G 中断");
    if (Object.keys(sc.extra || {}).length) parts.push("救–F 拥堵 +15");
    if ((sc.sources || []).length > 1) parts.push("H 区医疗队出发");
    if (sc.lambda) parts.push("风险系数 λ = " + sc.lambda);
    const reach = sv.path.length > 0;
    const t = reach ? routeTime(sv.edges, sv.path) : Infinity;
    return {
      formula: nm(target) + '：' + (reach && sv.path.length === 1 ? '<span class="ft hot-green hot">本身就是出发队伍所在地</span>，用时 0 分钟' : reach ? '<span class="ft hot-green hot">' + routeName(sv.path) + '</span>，用时 <span class="ft hot">' + t + '</span> 分钟' + (sc.lambda ? '（综合代价 ' + sv.res.dist[target] + '）' : '') : '<span class="ft hot">不可达</span>'),
      text: "自定义情境：" + (parts.length ? parts.join("，") : "与平时相同") + "。图上深绿为到 " + nm(target) + " 的最优路线，浅绿为最短路径树" + ((sc.sources || []).length > 1 ? "，金色虚线圈表示由 H 区医疗队负责的区" : "") + "。改回某一步即可恢复该步的讲解。"
    };
  }

  /* ---- 步骤渲染 ---- */
  function renderStep() {
    const st = steps[step];
    const v = currentView();
    let formula = st.formula, text = st.text, badge = st.badge, tone = st.tone;
    if (st.route) {
      const t = route[route.length - 1];
      formula = route.length > 1
        ? '你的路线：<span class="ft hot">' + routeName(route) + '</span> = ' + (route.length > 2 ? sumText(BASE.edges, route) + ' = ' : '') + '<span class="ft hot">' + routeTime(BASE.edges, route) + '</span> 分钟'
        : '从<span class="ft hot">救援中心</span>出发，点相邻顶点逐段规划路线';
      text = "在图上<b>点击顶点</b>规划一条从救援中心出发的路线（只能走到相邻顶点；点路线末端可退回）。系统会算出路线用时，并和到 " + (route.length > 1 ? nm(t) : "目的地") + " 的最快用时对比。";
    }
    if (LEVEL_KEY === "extend" && custom) {
      const ct = customText(custom);
      formula = ct.formula; text = ct.text; badge = "自定义"; tone = "gold";
    }
    if (formulaText) formulaText.innerHTML = formula;
    if (stepStatus) stepStatus.innerHTML = '<span class="badge ' + (tone || "") + '">' + esc(badge) + '</span><span>' + text + '</span>';
    renderViz(st, v);
    draw();
    Array.prototype.forEach.call(controls.querySelectorAll(".step-item"), (el, i) => {
      el.classList.toggle("active", i === step);
      el.classList.toggle("done", i < step);
    });
    if (phaseNav) {
      Array.prototype.forEach.call(phaseNav.querySelectorAll(".phase-chip"), (el, i) => {
        el.classList.toggle("active", i === st.phase);
        el.classList.toggle("done", i < st.phase);
        el.setAttribute("aria-current", i === st.phase ? "step" : "false");
      });
    }
    const fill = controls.querySelector(".progress-fill");
    if (fill) fill.style.width = ((step + 1) / steps.length * 100) + "%";
    const counter = document.getElementById("stepCounter");
    if (counter) counter.textContent = "第 " + (step + 1) + " / " + steps.length + " 步";
    const prev = document.getElementById("prevBtn"), next = document.getElementById("nextBtn");
    if (prev) prev.disabled = step === 0;
    if (next) next.disabled = step === steps.length - 1;
    syncScenarioControls();
  }
  function go(i) {
    step = Math.max(0, Math.min(steps.length - 1, i));
    if (LEVEL_KEY === "extend") {
      custom = null;
      if (steps[step].target != null) target = steps[step].target;
    }
    renderStep();
  }
  function stopPlay() {
    if (playTimer) { clearTimeout(playTimer); playTimer = null; }
    const b = document.getElementById("playBtn");
    if (b) { b.classList.remove("playing"); b.textContent = "▶ 自动播放"; }
  }
  function speedMs() {
    const s = document.getElementById("speedRange");
    const val = s ? Number(s.value) : 3;
    return [3200, 2600, 2000, 1500, 1000][Math.max(0, Math.min(4, val - 1))];
  }
  function tick() {
    if (step >= steps.length - 1) { stopPlay(); return; }
    go(step + 1);
    playTimer = setTimeout(tick, speedMs());
  }
  function togglePlay() {
    const b = document.getElementById("playBtn");
    if (playTimer) { stopPlay(); return; }
    if (step === steps.length - 1) go(0);
    if (b) { b.classList.add("playing"); b.textContent = "⏸ 暂停"; }
    playTimer = setTimeout(tick, speedMs());
  }
  function resetAll() {
    stopPlay();
    route = [0, 6, 7];
    routeMsg = "";
    custom = null;
    target = 7;
    rebuild();
    const sel = document.getElementById("targetSel");
    if (sel) sel.value = String(target);
    go(0);
  }

  /* ---- 控件 ---- */
  function targetOptions() {
    return NODES.map((nd, i) => i === 0 ? "" : '<option value="' + i + '"' + (i === target ? " selected" : "") + '>' + esc(nd.name + " · " + nd.desc) + '</option>').join("");
  }
  function scenarioPanel() {
    if (LEVEL_KEY !== "extend") return "";
    return '<div class="case-panel" id="scenarioPanel">' +
      '<h4>情境开关 <small>改动后即时重算</small></h4>' +
      '<label class="case-field">关注目标<select id="targetSel">' + targetOptions() + '</select></label>' +
      '<label class="case-switch"><span>E–G 道路中断（删边）</span><input type="checkbox" id="scBreak"></label>' +
      '<label class="case-switch"><span>救–F 拥堵 +15 分钟（改权）</span><input type="checkbox" id="scJam"></label>' +
      '<label class="case-switch"><span>H 区医疗队同时出发（多源）</span><input type="checkbox" id="scMulti"></label>' +
      '<label class="case-field"><span>风险系数 λ = <b id="lamVal">0</b>（cost = 时间 + λ·风险）</span><input type="range" id="scLambda" min="0" max="6" step="1" value="0"></label>' +
      '</div>';
  }
  function targetPanel() {
    if (LEVEL_KEY !== "advanced") return "";
    return '<div class="case-panel"><h4>调度目标 <small>也可点图上顶点</small></h4>' +
      '<label class="case-field">查看哪个区的最快路线<select id="targetSel">' + targetOptions() + '</select></label></div>';
  }
  function syncScenarioControls() {
    if (LEVEL_KEY !== "extend") return;
    const sc = currentScenario();
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
    set("scBreak", (sc.broken || []).length > 0);
    set("scJam", Object.keys(sc.extra || {}).length > 0);
    set("scMulti", (sc.sources || []).length > 1);
    const lam = document.getElementById("scLambda");
    if (lam) lam.value = String(sc.lambda || 0);
    const lv = document.getElementById("lamVal");
    if (lv) lv.textContent = String(sc.lambda || 0);
    const sel = document.getElementById("targetSel");
    if (sel) sel.value = String(target);
  }
  function readScenario() {
    const on = id => { const el = document.getElementById(id); return !!(el && el.checked); };
    const lam = document.getElementById("scLambda");
    return {
      broken: on("scBreak") ? [ekey(5, 7)] : [],
      extra: on("scJam") ? { [ekey(0, 6)]: 15 } : {},
      sources: on("scMulti") ? [0, 8] : [0],
      lambda: lam ? Number(lam.value) : 0
    };
  }
  function buildControls() {
    const listItems = steps.map((s, i) =>
      '<button type="button" class="step-item" data-i="' + i + '"><span class="num">' + (i + 1) + '</span><span>' + esc(s.name) + '</span><span class="phase-tag">' + esc(PHASES[s.phase].slice(0, 2)) + '</span></button>'
    ).join("");
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
      '</div>' +
      targetPanel() + scenarioPanel() +
      '<div class="step-list">' + listItems + '</div>';

    document.getElementById("prevBtn").addEventListener("click", () => { stopPlay(); go(step - 1); });
    document.getElementById("nextBtn").addEventListener("click", () => { stopPlay(); go(step + 1); });
    document.getElementById("playBtn").addEventListener("click", togglePlay);
    document.getElementById("resetBtn").addEventListener("click", resetAll);
    controls.addEventListener("click", ev => {
      const it = ev.target.closest(".step-item");
      if (it && controls.contains(it)) { stopPlay(); go(Number(it.dataset.i)); }
    });
    const sel = document.getElementById("targetSel");
    if (sel) sel.addEventListener("change", () => setTarget(Number(sel.value)));
    if (LEVEL_KEY === "extend") {
      ["scBreak", "scJam", "scMulti", "scLambda"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(id === "scLambda" ? "input" : "change", () => {
          stopPlay();
          custom = readScenario();
          renderStep();
        });
      });
    }
  }
  function buildPhases() {
    if (!phaseNav) return;
    phaseNav.innerHTML = PHASES.map((p, i) => '<button type="button" class="phase-chip" data-p="' + i + '"><span class="pn">' + (i + 1) + '</span>' + esc(p) + '</button>').join("");
    phaseNav.addEventListener("click", ev => {
      const b = ev.target.closest(".phase-chip");
      if (!b) return;
      const p = Number(b.dataset.p);
      const idx = steps.findIndex(s => s.phase === p);
      if (idx >= 0) { stopPlay(); go(idx); }
    });
  }
  function buildLegend() {
    const board = canvas.parentNode;
    if (!board || board.querySelector(".graph-legend")) return;
    const lg = document.createElement("div");
    lg.className = "graph-legend";
    lg.setAttribute("aria-hidden", "true");
    const items = {
      basic: '<span><i class="lg-node"></i>地点</span><span><i class="lg-node lg-cur"></i>本步关注</span><span><i class="lg-node lg-ok"></i>结果</span>' +
        '<span><i class="lg-edge"></i>道路（数字=分钟）</span><span><i class="lg-edge lg-hot"></i>本步路线</span><span><i class="lg-edge lg-res"></i>最快路线</span>',
      advanced: '<span><i class="lg-node"></i>未确定</span><span><i class="lg-node lg-cur"></i>本轮确定</span><span><i class="lg-node lg-ok"></i>已确定</span>' +
        '<span><i class="lg-edge lg-hot"></i>本轮松弛</span><span><i class="lg-edge lg-tree"></i>最短路径树</span><span><i class="lg-edge lg-res"></i>最快路线</span><span><i class="lg-edge lg-gone"></i>中断道路</span>',
      extend: '<span><i class="lg-node lg-src"></i>出发队伍</span><span><i class="lg-node lg-ok"></i>已算出</span><span><i class="lg-edge lg-tree"></i>最短路径树</span>' +
        '<span><i class="lg-edge lg-res"></i>最快路线</span><span><i class="lg-edge lg-gone"></i>中断道路</span><span><i class="lg-jam"></i>拥堵路段</span>'
    };
    lg.innerHTML = items[LEVEL_KEY] || items.basic;
    board.appendChild(lg);
  }

  function setTarget(t) {
    if (!(t > 0 && t < N)) return;
    target = t;
    if (LEVEL_KEY === "advanced") {
      rebuild();
      step = steps.findIndex(s => s.target);
    }
    const sel = document.getElementById("targetSel");
    if (sel) sel.value = String(t);
    renderStep();
  }

  /* ---- 画布点击 ---- */
  function hitNode(ev) {
    const rect = canvas.getBoundingClientRect();
    const P = positions({ w: Math.max(300, Math.floor(rect.width)), h: Math.max(300, Math.floor(rect.height)) });
    const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
    let best = -1, bd = R + 10;
    P.forEach((p, i) => { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  canvas.addEventListener("click", ev => {
    const i = hitNode(ev);
    if (i < 0) return;
    if (LEVEL_KEY === "basic") {
      const ri = steps.findIndex(s => s.route);
      if (step !== ri) { stopPlay(); step = ri; }
      const last = route[route.length - 1];
      if (i === last && route.length > 1) { route.pop(); routeMsg = "已退回一段。"; }
      else if (route.includes(i)) { routeMsg = '<span class="bad-text">' + esc(nm(i)) + " 已在路线中</span>，最短路不会重复经过同一地点。"; }
      else if (edgeOf(EDGES, last, i)) { route.push(i); routeMsg = ""; }
      else { routeMsg = '<span class="bad-text">' + esc(nm(last)) + " 与 " + esc(nm(i)) + " 之间没有直达道路</span>，请选相邻顶点。"; }
      renderStep();
    } else if (i > 0) {
      stopPlay();
      if (LEVEL_KEY === "extend") custom = custom || JSON.parse(JSON.stringify(currentScenario()));
      setTarget(i);
    }
  });
  canvas.addEventListener("mousemove", ev => { canvas.style.cursor = hitNode(ev) >= 0 ? "pointer" : "default"; });
  if (vizText) {
    vizText.addEventListener("click", ev => {
      const b = ev.target.closest("[data-route]");
      if (!b) return;
      if (b.dataset.route === "undo" && route.length > 1) route.pop();
      if (b.dataset.route === "clear") route = [0];
      routeMsg = "";
      renderStep();
    });
  }

  rebuild();
  buildControls();
  buildPhases();
  buildLegend();
  go(0);
  let rz = null;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(draw, 80); });
})();
