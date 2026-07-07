/* ============================================================
   7.8 最短通路 · 三层统一交互引擎（距离标签 + 已定/前沿着色 + 路径编号）
   window.SP_LEVEL = "basic" | "advanced" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  // 边 {u,v,w}（无向）
  function bfsDist(n, edges, s) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { adj[e.u].push(e.v); adj[e.v].push(e.u); });
    const dist = Array(n).fill(Infinity);
    dist[s] = 0;
    const q = [s];
    while (q.length) {
      const u = q.shift();
      adj[u].forEach(v => { if (dist[v] === Infinity) { dist[v] = dist[u] + 1; q.push(v); } });
    }
    return dist;
  }
  function dijkstra(n, edges, s) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { adj[e.u].push([e.v, e.w]); adj[e.v].push([e.u, e.w]); });
    const dist = Array(n).fill(Infinity), pre = Array(n).fill(-1), done = Array(n).fill(false);
    dist[s] = 0;
    for (let k = 0; k < n; k++) {
      let u = -1;
      for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
      if (u < 0 || dist[u] === Infinity) break;
      done[u] = true;
      adj[u].forEach(([v, w]) => {
        if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pre[v] = u; }
      });
    }
    return { dist, pre };
  }
  function pathTo(pre, t) {
    const p = [];
    let cur = t;
    while (cur >= 0) { p.push(cur); cur = pre[cur]; }
    return p.reverse();
  }
  function floyd(n, edges) {
    const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 0 : Infinity));
    edges.forEach(e => { d[e.u][e.v] = Math.min(d[e.u][e.v], e.w); d[e.v][e.u] = Math.min(d[e.v][e.u], e.w); });
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
      if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
    return d;
  }

  /* ---------------- 图库 ---------------- */
  const AZ = "ABCDEFGHI".split("");
  const GRAPHS = {
    // 基础层：无权图（BFS 波纹）
    bfsG: {
      names: AZ.slice(0, 6), caption: "无权网络（每条边跳 1 步）", weighted: false,
      nodes: [
        { x: 0.06, y: 0.45 }, { x: 0.34, y: 0.12 }, { x: 0.34, y: 0.82 },
        { x: 0.62, y: 0.32 }, { x: 0.62, y: 0.95 }, { x: 0.94, y: 0.55 }
      ],
      edges: [
        { u: 0, v: 1, w: 1 }, { u: 0, v: 2, w: 1 }, { u: 1, v: 3, w: 1 },
        { u: 2, v: 3, w: 1 }, { u: 2, v: 4, w: 1 }, { u: 3, v: 5, w: 1 }, { u: 4, v: 5, w: 1 }
      ]
    },
    // 进阶层：带权图（Dijkstra 经典例）
    dijG: {
      names: AZ.slice(0, 6), caption: "带权路网（边上数字 = 通行代价）", weighted: true,
      nodes: [
        { x: 0.06, y: 0.5 }, { x: 0.32, y: 0.12 }, { x: 0.36, y: 0.78 },
        { x: 0.62, y: 0.3 }, { x: 0.68, y: 0.92 }, { x: 0.95, y: 0.55 }
      ],
      edges: [
        { u: 0, v: 1, w: 2 }, { u: 0, v: 2, w: 5 }, { u: 1, v: 2, w: 1 },
        { u: 1, v: 3, w: 4 }, { u: 2, v: 3, w: 2 }, { u: 2, v: 4, w: 4 },
        { u: 3, v: 4, w: 1 }, { u: 3, v: 5, w: 5 }, { u: 4, v: 5, w: 3 }
      ]
    },
    // 拓展层：3×3 网格（A* 演示，单位权）
    gridG: {
      names: ["S", "2", "3", "4", "5", "6", "7", "8", "T"], caption: "网格地图（游戏寻路 / 单位权）", weighted: false,
      nodes: [0, 1, 2].flatMap(r => [0, 1, 2].map(c => ({ x: 0.12 + c * 0.38, y: 0.1 + r * 0.4 }))),
      edges: (function () {
        const es = [];
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
          const i = r * 3 + c;
          if (c < 2) es.push({ u: i, v: i + 1, w: 1 });
          if (r < 2) es.push({ u: i, v: i + 3, w: 1 });
        }
        return es;
      })()
    }
  };

  /* ---------------- 三层步骤数据 ----------------
     step.dist: {i:"0"|"∞"|数}；step.settled / frontier：着色；path：编号通路 */
  const INF = "∞";
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "看 BFS 像水波一样一层层扩散，数出 A 到 F 的最少跳数。",
      badge: "BFS 最少跳数",
      steps: [
        {
          name: "问题：最少几跳",
          graph: "bfsG", nodes: [0, 5],
          formula: '无权图中 A 到 F 的<span class="ft hot">最短路 = 最少跳数</span>（每边算 1 跳）',
          badge: "起点/终点", tone: "",
          text: "消息从 A 传到 F 最少要转发几次？没有权重时，“最短”就是<b>边数最少</b>。工具：<b>广度优先搜索 BFS</b>。"
        },
        {
          name: "第 0 层：起点",
          graph: "bfsG", settled: [0], dist: { 0: 0 },
          formula: 'dist(A) = <span class="ft hot-green hot">0</span>，其余全为 ∞，A 入队',
          badge: "第 0 层", tone: "",
          text: "起点距离设 0（蓝色标签），其他点都是“还不知道”（∞）。BFS 用一个<b>队列</b>管理待扩散的点。"
        },
        {
          name: "第 1 层：邻居",
          graph: "bfsG", settled: [0], frontier: [1, 2], dist: { 0: 0, 1: 1, 2: 1 },
          formula: 'A 的邻居 B、C 全部标 <span class="ft hot">dist = 1</span>',
          badge: "第 1 层", tone: "",
          text: "水波荡开第一圈：从 A 一步可达的 B、C 距离都是 <b>1</b>。注意 BFS <b>整层一起处理</b>，先到先得、不再更新。"
        },
        {
          name: "第 2 层",
          graph: "bfsG", settled: [0, 1, 2], frontier: [3, 4], dist: { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2 },
          formula: 'B、C 的新邻居 D、E 标 <span class="ft hot">dist = 2</span>',
          badge: "第 2 层", tone: "",
          text: "第二圈：D 同时是 B 和 C 的邻居，但只被<b>第一次到达</b>时标号（2），后来者不改。E 也在这一层。"
        },
        {
          name: "第 3 层：到达 F",
          graph: "bfsG", settled: [0, 1, 2, 3, 4], frontier: [5], dist: { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3 },
          formula: 'dist(A,F) = <span class="ft hot">3</span>，BFS 扩散完成',
          badge: "3 跳", tone: "",
          text: "第三圈波纹碰到 F——最少 <b>3 跳</b>。BFS 按层扩散的性质保证：<b>第一次碰到就是最短</b>。"
        },
        {
          name: "回溯最短路",
          graph: "bfsG", path: [0, 1, 3, 5], dist: { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3 },
          formula: '一条最短路：<span class="ft hot">A → B → D → F</span>（3 条边）',
          badge: "回溯", tone: "gold",
          text: "从 F 沿“谁第一个发现我”倒着走回 A，得到金色编号的最短路线。最短路<b>不一定唯一</b>（A→C→D→F 同样是 3 跳），但跳数一定相同。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "一步步执行 Dijkstra：初始化→松弛→步步择优，再用 Floyd 看全源答案。",
      badge: "Dijkstra / Floyd",
      steps: [
        {
          name: "带权图与问题",
          graph: "dijG", nodes: [0, 5],
          formula: '最短路 = <span class="ft hot">权和最小</span>的通路（不再是边数最少）',
          badge: "带权", tone: "",
          text: "边上有了代价（时间/距离/费用），跳数少的路未必便宜：A→C 直达权 5，绕 A→B→C 反而只要 3！这正是 Dijkstra 要解决的问题。"
        },
        {
          name: "初始化",
          graph: "dijG", settled: [], frontier: [0], dist: { 0: 0, 1: INF, 2: INF, 3: INF, 4: INF, 5: INF },
          formula: 'dist(A)=<span class="ft hot-green hot">0</span>，其余 <span class="ft hot">∞</span>；所有点未定',
          badge: "init", tone: "",
          text: "和 BFS 一样从 0 与 ∞ 出发。不同的是：这次每一步要<b>在所有未定点里挑距离最小的</b>，而不是简单排队。"
        },
        {
          name: "松弛 A 的邻边",
          graph: "dijG", settled: [0], frontier: [1, 2], edges: [[0, 1], [0, 2]], dist: { 0: 0, 1: 2, 2: 5, 3: INF, 4: INF, 5: INF },
          formula: '<span class="ft hot">dist(v) ← min(dist(v), dist(u)+w(u,v))</span>：B=2，C=5',
          badge: "松弛", tone: "",
          text: "“松弛”= 试试经过 A 走会不会更近。B 更新为 2、C 更新为 5。<b>松弛是所有最短路算法共同的心跳</b>。"
        },
        {
          name: "步步择优：定 B",
          graph: "dijG", settled: [0, 1], frontier: [2, 3], edges: [[1, 2]], dist: { 0: 0, 1: 2, 2: 3, 3: 6, 4: INF, 5: INF },
          formula: '选最小未定点 B(2) 定案；松弛后 <span class="ft hot">C：5 → 3</span>（经 B 绕行更优！）',
          badge: "贪心", tone: "gold",
          text: "未定点中 B 的 2 最小——<b>贪心定案</b>：不会再有更短的路到 B。用 B 松弛：C 从直达 5 降到 2+1=<b>3</b>。绕路反而更近，这就是松弛的价值。"
        },
        {
          name: "继续扩张：定 C、D",
          graph: "dijG", settled: [0, 1, 2, 3], frontier: [4, 5], edges: [[2, 3], [3, 4]], dist: { 0: 0, 1: 2, 2: 3, 3: 5, 4: 6, 5: 10 },
          formula: '定 C(3)：D=min(6, 3+2)=<span class="ft hot">5</span>；定 D(5)：E=6，F=10',
          badge: "扩张", tone: "",
          text: "每轮“挑最小 → 定案 → 松弛邻居”：D 经 C 从 6 降到 5，E 经 D 得 6，F 暂为 10。<b>已定区像墨迹一样从起点晕开</b>。"
        },
        {
          name: "完成：dist(A,F)=9",
          graph: "dijG", settled: [0, 1, 2, 3, 4, 5], path: [0, 1, 2, 3, 4, 5], dist: { 0: 0, 1: 2, 2: 3, 3: 5, 4: 6, 5: 9 },
          formula: '定 E(6)：F=min(10, 6+3)=<span class="ft hot">9</span>；最短路 A→B→C→D→E→F',
          badge: "9", tone: "",
          text: "最后一次松弛把 F 从 10 压到 <b>9</b>。金色编号是完整最优路线：2+1+2+1+3=9。<b>全局最优，来自每一步的可靠选择。</b>"
        },
        {
          name: "为什么边权非负",
          graph: "dijG", nodes: [3, 5],
          formula: '若有负权边，“<span class="ft hot">已定案 ⇒ 必最优</span>”被打破 ⇒ Dijkstra 失效',
          badge: "前提", tone: "red",
          text: "贪心定案的底气是：绕更远的路只会更贵。一旦存在负权边，后面可能出现“先贵后赚”的路线，定案就定错了——那时要换 Bellman-Ford。"
        },
        {
          name: "Floyd 全源最短路",
          graph: "dijG", mat: "floyd",
          formula: '<span class="ft hot-blue hot">d[i][j] ← min(d[i][j], d[i][k]+d[k][j])</span>，三重循环 O(V³)',
          badge: "全源 DP", tone: "blue",
          text: "要“任意两点”的答案就用 <b>Floyd</b>：允许的中转点 k 逐个加入，动态规划一次算出整张距离表（右表实时计算，验证 d[A][F]=9 ✓）。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "把最短路装进真实系统：地图导航、OSPF 路由、游戏寻路的 A*。",
      badge: "导航 / A*",
      steps: [
        {
          name: "导航 = 最短路",
          graph: "dijG", path: [0, 1, 2, 3, 4, 5], dist: { 0: 0, 1: 2, 2: 3, 3: 5, 4: 6, 5: 9 },
          formula: '边权 = <span class="ft hot">实时通行时间</span>：拥堵改权重，重算即改道',
          badge: "导航", tone: "",
          text: "地图 App 每隔几分钟用实时路况刷新边权，重跑最短路——你看到的“智能改道”，本质是<b>权重变了再算一次 Dijkstra</b>。"
        },
        {
          name: "OSPF 路由协议",
          graph: "dijG", spt: true, dist: { 0: 0, 1: 2, 2: 3, 3: 5, 4: 6, 5: 9 },
          formula: '每台路由器以自己为源跑 Dijkstra ⇒ <span class="ft hot">最短路径树 SPT</span>',
          badge: "OSPF", tone: "blue",
          text: "互联网骨干的 OSPF 协议：链路开销为权，每台路由器都算出一棵<b>最短路径树</b>（红色树边），转发表由此生成。你每个数据包都在走 Dijkstra 的答案。"
        },
        {
          name: "A*：带方向感的搜索",
          graph: "gridG", groups: [[0, 1, 3, 4, 5, 7, 8]], path: [0, 1, 4, 5, 8],
          formula: '<span class="ft hot">f(n) = g(n) + h(n)</span>：已走代价 + 到目标的估计',
          badge: "A*", tone: "",
          text: "Dijkstra 向四面八方均匀扩散；A* 加上启发值 h（如直线/曼哈顿距离），<b>优先探索朝向目标的点</b>（绿色为探索带），少走冤枉路。游戏寻路的标配。"
        },
        {
          name: "可采纳性保证最优",
          graph: "gridG", path: [0, 1, 4, 5, 8],
          formula: '只要 <span class="ft hot-green hot">h(n) ≤ 真实剩余距离</span>（可采纳），A* 必返回最优解',
          badge: "admissible", tone: "gold",
          text: "启发函数“只许乐观、不许高估”：曼哈顿距离永远 ≤ 真实步数，所以网格上的 A* 既快又<b>不牺牲最优性</b>——工程加速与数学严谨兼得。"
        },
        {
          name: "负权与 Bellman-Ford",
          graph: "dijG",
          formula: '含负权：<span class="ft hot">Bellman-Ford O(VE)</span>，还能侦测负环（套利环）',
          badge: "负权", tone: "red",
          text: "汇率兑换图取 −log(汇率) 为权：若存在<b>负环</b>，就意味着换一圈钱变多——套利机会！Bellman-Ford 全边松弛 V−1 轮，第 V 轮仍能松弛即有负环。"
        },
        {
          name: "迁移总结",
          graph: "dijG", path: [0, 1, 2, 3, 4, 5],
          formula: '<span class="ft hot">导航改权重 · 路由建树 · 寻路加启发</span>',
          badge: "transfer", tone: "gold", viz: "transferlist",
          text: "同一套“松弛”内核：导航实时改边权、OSPF 每点建树、游戏 A* 加方向感、金融 BF 查负环。<b>找准方向、步步择优，行稳方能致远。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, bfsDist, dijkstra, pathTo, floyd };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.SP_LEVEL] || LEVELS.basic;
  const controls = document.getElementById("controls");
  const canvas = document.getElementById("graphCanvas");
  const formulaText = document.getElementById("formulaText");
  const stepStatus = document.getElementById("stepStatus");
  const vizText = document.getElementById("vizText");
  const missionEl = document.getElementById("missionText");
  const badgeEl = document.getElementById("visualBadge");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let step = 0;
  let playTimer = null;

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  }

  if (missionEl) missionEl.innerHTML = "<b>互动任务：</b>" + esc(level.mission);
  if (badgeEl) badgeEl.textContent = level.badge;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(360, Math.floor(rect.width));
    const h = Math.max(300, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }
  function pathSteps(st) {
    if (!st.path) return [];
    const out = [];
    for (let i = 0; i + 1 < st.path.length; i++) out.push({ u: st.path[i], v: st.path[i + 1], idx: i + 1 });
    return out;
  }
  function sptEdges(g) {
    const { pre } = dijkstra(g.nodes.length, g.edges, 0);
    const out = [];
    for (let v = 0; v < g.nodes.length; v++) if (pre[v] >= 0) out.push([pre[v], v]);
    return out;
  }
  function draw() {
    const size = resize();
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    const R = 18;
    const padX = 50, padTop = 34, padBot = 52;
    const P = g.nodes.map(nd => ({
      x: padX + nd.x * (size.w - 2 * padX),
      y: padTop + nd.y * (size.h - padTop - padBot)
    }));
    const ps = pathSteps(st);
    const hlEdgePairs = (st.edges || []).concat(st.spt ? sptEdges(g) : []);
    const settled = new Set(st.settled || []);
    const frontier = new Set(st.frontier || []);
    const hlNodes = new Set(st.nodes || []);
    const groupSet = new Set(st.groups ? st.groups.flat() : []);
    const anyHl = hlNodes.size > 0 || ps.length > 0 || hlEdgePairs.length > 0;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    g.edges.forEach(e => {
      const onPath = ps.some(p => (p.u === e.u && p.v === e.v) || (p.u === e.v && p.v === e.u));
      const hot = onPath || hlEdgePairs.some(p => (p[0] === e.u && p[1] === e.v) || (p[0] === e.v && p[1] === e.u));
      const dim = anyHl && !hot;
      const color = hot ? "#d63b1d" : dim ? "rgba(47,95,159,0.2)" : "rgba(47,95,159,0.6)";
      ctx.strokeStyle = color;
      ctx.lineWidth = hot ? 4 : 2;
      const a = P[e.u], b = P[e.v];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      ctx.beginPath();
      ctx.moveTo(a.x + Math.cos(ang) * R, a.y + Math.sin(ang) * R);
      ctx.lineTo(b.x - Math.cos(ang) * R, b.y - Math.sin(ang) * R);
      ctx.stroke();
      // 权重标签
      if (g.weighted) {
        const mx = (a.x + b.x) / 2 - Math.sin(ang) * 12;
        const my = (a.y + b.y) / 2 + Math.cos(ang) * 12;
        ctx.fillStyle = hot ? "#d63b1d" : "#6b4a38";
        ctx.font = "800 13px 'JetBrains Mono', Consolas, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(e.w), mx, my);
      }
    });

    // 步序标号
    ps.forEach(p => {
      const a = P[p.u], b = P[p.v];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.beginPath();
      ctx.arc(mx, my, 11, 0, Math.PI * 2);
      ctx.fillStyle = "#c58a1f";
      ctx.fill();
      ctx.strokeStyle = "#fff8ec";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "800 11px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(p.idx), mx, my);
    });

    P.forEach((p, i) => {
      const isSettled = settled.has(i);
      const isFrontier = frontier.has(i);
      const hot = hlNodes.has(i) || (ps.length && (i === st.path[0] || i === st.path[st.path.length - 1]));
      const inGroup = groupSet.has(i);
      const dim = (anyHl || settled.size || frontier.size || groupSet.size) && !hot && !isSettled && !isFrontier && !inGroup;
      ctx.beginPath();
      ctx.arc(p.x, p.y, hot || isFrontier ? R + 2 : R, 0, Math.PI * 2);
      ctx.fillStyle = isFrontier ? "#d63b1d" : hot ? "#d63b1d" : isSettled ? "#1e5c3f" : inGroup ? "#2f7d57" : dim ? "#cdbfae" : "#2f7d57";
      ctx.fill();
      ctx.strokeStyle = "#fff8ec";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "800 13px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y);

      // 距离标签（蓝色圆角框）
      if (st.dist && st.dist[i] !== undefined) {
        const label = String(st.dist[i]);
        const bx = p.x + R + 6, by = p.y - R - 4;
        const bw = Math.max(22, label.length * 9 + 8);
        ctx.fillStyle = "#2f5f9f";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx - bw / 2, by - 11, bw, 22, 8);
        else ctx.rect(bx - bw / 2, by - 11, bw, 22);
        ctx.fill();
        ctx.strokeStyle = "#fff8ec";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.font = "800 12px 'JetBrains Mono', Consolas, monospace";
        ctx.fillText(label, bx, by);
      }
    });

    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.fillText(g.caption, size.w / 2, size.h - 18);
  }

  /* ---- 辅助可视化 ---- */
  function floydHtml(g) {
    const d = floyd(g.nodes.length, g.edges);
    const head = '<span class="matrix-cell head"></span>' + g.names.map(nm => '<span class="matrix-cell head">' + nm + '</span>').join("");
    const rows = d.map((row, i) =>
      '<span class="matrix-cell head">' + g.names[i] + '</span>' +
      row.map((v, j) => '<span class="matrix-cell' + (i === 0 && j === 5 ? " hot" : v && v !== Infinity ? " one" : "") + '">' + (v === Infinity ? "∞" : v) + '</span>').join("")
    ).join("");
    return '<div class="graph-summary"><b>Floyd 全源距离表 d[i][j]：</b><div class="matrix-wrap" style="margin-top:8px"><div class="matrix-grid" style="grid-template-columns:repeat(' + (g.nodes.length + 1) + ',26px)">' + head + rows + '</div></div>红格 d[A][F]=' + d[0][5] + '，与 Dijkstra 一致 ✓</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">地图导航：实时权重</span><span class="pill">OSPF：最短路径树</span><span class="pill">游戏寻路：A* 启发</span><span class="pill">金融：负环=套利</span></div>' +
      '“松弛”这一个动作，撑起了半个互联网的路径计算。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const g = GRAPHS[st.graph];
    let html = "";
    if (st.mat === "floyd") html = floydHtml(g);
    if (st.viz === "transferlist") html += transferHtml();
    vizText.innerHTML = html;
    vizText.style.display = html ? "grid" : "none";
  }

  /* ---- 步骤渲染 ---- */
  function renderStep() {
    const st = level.steps[step];
    if (formulaText) formulaText.innerHTML = st.formula;
    if (stepStatus) {
      stepStatus.innerHTML = '<span class="badge ' + (st.tone || "") + '">' + esc(st.badge || (step + 1)) + '</span><span>' + st.text + '</span>';
    }
    renderViz(st);
    draw();
    Array.prototype.forEach.call(document.querySelectorAll(".step-item"), (el, i) => {
      el.classList.toggle("active", i === step);
      el.classList.toggle("done", i < step);
    });
    const fill = document.querySelector(".progress-fill");
    if (fill) fill.style.width = ((step + 1) / level.steps.length * 100) + "%";
    const counter = document.getElementById("stepCounter");
    if (counter) counter.textContent = "第 " + (step + 1) + " / " + level.steps.length + " 步";
    const prev = document.getElementById("prevBtn"), next = document.getElementById("nextBtn");
    if (prev) prev.disabled = step === 0;
    if (next) next.disabled = step === level.steps.length - 1;
  }
  function go(i) {
    step = Math.max(0, Math.min(level.steps.length - 1, i));
    renderStep();
  }
  function stopPlay() {
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    const b = document.getElementById("playBtn");
    if (b) { b.classList.remove("playing"); b.textContent = "▶ 自动播放"; }
  }
  function togglePlay() {
    const b = document.getElementById("playBtn");
    if (playTimer) { stopPlay(); return; }
    if (step === level.steps.length - 1) go(0);
    if (b) { b.classList.add("playing"); b.textContent = "⏸ 暂停"; }
    playTimer = setInterval(() => {
      if (step >= level.steps.length - 1) { stopPlay(); return; }
      go(step + 1);
    }, 1900);
  }

  /* ---- 构建控件 ---- */
  function buildControls() {
    const listItems = level.steps.map((s, i) =>
      '<div class="step-item" data-i="' + i + '"><span class="num">' + (i + 1) + '</span><span>' + esc(s.name) + '</span></div>'
    ).join("");
    controls.innerHTML =
      '<div class="step-controller">' +
        '<div class="step-progress-head"><span id="stepCounter">第 1 / ' + level.steps.length + ' 步</span><small>' + esc(level.label) + ' · 点一步看变化</small></div>' +
        '<div class="progress-track"><div class="progress-fill"></div></div>' +
        '<div class="step-btns">' +
          '<button class="step-btn" id="prevBtn">◀ 上一步</button>' +
          '<button class="step-btn primary" id="nextBtn">下一步 ▶</button>' +
          '<button class="step-btn" id="playBtn">▶ 自动播放</button>' +
          '<button class="step-btn" id="resetBtn">↺ 重置</button>' +
        '</div>' +
      '</div>' +
      '<div class="step-list">' + listItems + '</div>';

    document.getElementById("prevBtn").addEventListener("click", () => { stopPlay(); go(step - 1); });
    document.getElementById("nextBtn").addEventListener("click", () => { stopPlay(); go(step + 1); });
    document.getElementById("playBtn").addEventListener("click", togglePlay);
    document.getElementById("resetBtn").addEventListener("click", () => { stopPlay(); go(0); });
    Array.prototype.forEach.call(document.querySelectorAll(".step-item"), el => {
      el.addEventListener("click", () => { stopPlay(); go(Number(el.dataset.i)); });
    });
  }

  buildControls();
  renderStep();
  window.addEventListener("resize", draw);
})();
