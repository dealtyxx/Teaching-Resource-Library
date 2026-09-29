/* ============================================================
   7.8 最短通路 · 三层统一交互引擎
   window.SP_LEVEL = "basic" | "advanced" | "extend"
   BFS / Dijkstra / Floyd / A* 的每一步状态都由下方纯函数实时计算（不手填数值），
   右侧表格同步给出 dist / 前驱 / 状态；Floyd 可逐个选择中转点 k 查看 D⁽ᵏ⁾。
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  function adjList(n, edges) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { adj[e.u].push([e.v, e.w]); adj[e.v].push([e.u, e.w]); });
    adj.forEach(a => a.sort((x, y) => x[0] - y[0]));
    return adj;
  }
  // BFS 逐层快照：layers[k] = {dist, pre, done:[], queue:[]}（第 k 层刚被发现、尚在队列中）
  function bfsTrace(n, edges, s) {
    const adj = adjList(n, edges);
    const dist = Array(n).fill(Infinity), pre = Array(n).fill(-1);
    dist[s] = 0;
    const snaps = [];
    let frontier = [s];
    const done = [];
    while (frontier.length) {
      snaps.push({ dist: dist.slice(), pre: pre.slice(), done: done.slice(), queue: frontier.slice() });
      const next = [];
      frontier.forEach(u => {
        done.push(u);
        adj[u].forEach(([v]) => { if (dist[v] === Infinity) { dist[v] = dist[u] + 1; pre[v] = u; next.push(v); } });
      });
      frontier = next;
    }
    snaps.push({ dist: dist.slice(), pre: pre.slice(), done: done.slice(), queue: [] });
    return snaps;
  }
  function bfsDist(n, edges, s) { const t = bfsTrace(n, edges, s); return t[t.length - 1].dist; }
  // Dijkstra 快照：snaps[0] 为初始化；snaps[k] 为第 k 次“选最小未定点 cur → 定案 → 松弛”之后
  function dijkstraTrace(n, edges, s) {
    const adj = adjList(n, edges);
    const dist = Array(n).fill(Infinity), pre = Array(n).fill(-1), done = Array(n).fill(false);
    dist[s] = 0;
    const snaps = [{ dist: dist.slice(), pre: pre.slice(), done: [], cur: -1, updated: [] }];
    for (let k = 0; k < n; k++) {
      let u = -1;
      for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
      if (u < 0 || dist[u] === Infinity) break;
      done[u] = true;
      const updated = [];
      adj[u].forEach(([v, w]) => {
        if (!done[v] && dist[u] + w < dist[v]) { updated.push({ v: v, from: dist[v], to: dist[u] + w }); dist[v] = dist[u] + w; pre[v] = u; }
      });
      snaps.push({ dist: dist.slice(), pre: pre.slice(), done: done.map((d, i) => d ? i : -1).filter(i => i >= 0), cur: u, updated: updated });
    }
    return snaps;
  }
  function dijkstra(n, edges, s) { const t = dijkstraTrace(n, edges, s); const last = t[t.length - 1]; return { dist: last.dist, pre: last.pre }; }
  function pathTo(pre, t) {
    const p = [];
    let cur = t;
    while (cur >= 0) { p.push(cur); cur = pre[cur]; }
    return p.reverse();
  }
  // Floyd 快照：mats[0] = D⁽⁰⁾（邻接权矩阵），mats[k] = 允许 v1..vk 作中转后的 D⁽ᵏ⁾
  function floydTrace(n, edges) {
    const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 0 : Infinity));
    edges.forEach(e => { d[e.u][e.v] = Math.min(d[e.u][e.v], e.w); d[e.v][e.u] = Math.min(d[e.v][e.u], e.w); });
    const mats = [d.map(r => r.slice())];
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
        if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
      mats.push(d.map(r => r.slice()));
    }
    return mats;
  }
  function floyd(n, edges) { const t = floydTrace(n, edges); return t[t.length - 1]; }
  // 网格寻路：Dijkstra（单位权）与 A*（曼哈顿启发）的展开集合，到终点出队即停
  function gridSearch(grid, useH) {
    const { cols, rows, walls, s, t } = grid;
    const wall = new Set(walls.map(c => c[0] * cols + c[1]));
    const id = (r, c) => r * cols + c;
    const h = i => useH ? Math.abs(Math.floor(i / cols) - t[0]) + Math.abs(i % cols - t[1]) : 0;
    const S = id(s[0], s[1]), T = id(t[0], t[1]);
    const g = new Map([[S, 0]]), pre = new Map([[S, -1]]);
    const closed = [], closedSet = new Set();
    const open = new Set([S]);
    while (open.size) {
      let u = -1;
      open.forEach(i => {
        if (u < 0) { u = i; return; }
        const fi = g.get(i) + h(i), fu = g.get(u) + h(u);
        if (fi < fu || (fi === fu && (h(i) < h(u) || (h(i) === h(u) && i < u)))) u = i;
      });
      open.delete(u);
      closed.push(u); closedSet.add(u);
      if (u === T) break;
      const r = Math.floor(u / cols), c = u % cols;
      [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([rr, cc]) => {
        if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) return;
        const v = id(rr, cc);
        if (wall.has(v) || closedSet.has(v)) return;
        const ng = g.get(u) + 1;
        if (!g.has(v) || ng < g.get(v)) { g.set(v, ng); pre.set(v, u); open.add(v); }
      });
    }
    const path = [];
    for (let cur = T; cur >= 0; cur = pre.get(cur)) path.unshift(cur);
    return { closed, path, len: g.get(T) };
  }

  /* ---------------- 图库 ---------------- */
  const AZ = "ABCDEFGHI".split("");
  const GRID = { cols: 7, rows: 5, walls: [[0, 3], [1, 3], [2, 3], [3, 3]], s: [2, 0], t: [2, 6] };
  const GRAPHS = {
    // 基础层：无权图（BFS 波纹）
    bfsG: {
      names: AZ.slice(0, 6), caption: "无权网络（每条边算 1 跳）", weighted: false,
      nodes: [
        { x: 0.04, y: 0.45 }, { x: 0.34, y: 0.1 }, { x: 0.34, y: 0.85 },
        { x: 0.64, y: 0.3 }, { x: 0.64, y: 0.98 }, { x: 0.96, y: 0.58 }
      ],
      edges: [
        { u: 0, v: 1, w: 1 }, { u: 0, v: 2, w: 1 }, { u: 1, v: 3, w: 1 },
        { u: 2, v: 3, w: 1 }, { u: 2, v: 4, w: 1 }, { u: 3, v: 5, w: 1 }, { u: 4, v: 5, w: 1 }
      ]
    },
    // 进阶层：带权图（Dijkstra 例）
    dijG: {
      names: AZ.slice(0, 6), caption: "带权路网（边上数字 = 通行代价）", weighted: true,
      nodes: [
        { x: 0.04, y: 0.5 }, { x: 0.32, y: 0.1 }, { x: 0.36, y: 0.8 },
        { x: 0.64, y: 0.3 }, { x: 0.68, y: 0.98 }, { x: 0.96, y: 0.56 }
      ],
      edges: [
        { u: 0, v: 1, w: 2 }, { u: 0, v: 2, w: 5 }, { u: 1, v: 2, w: 1 },
        { u: 1, v: 3, w: 4 }, { u: 2, v: 3, w: 2 }, { u: 2, v: 4, w: 4 },
        { u: 3, v: 4, w: 1 }, { u: 3, v: 5, w: 5 }, { u: 4, v: 5, w: 3 }
      ]
    },
    // 拓展层：7×5 网格地图，中间一堵墙（A* 演示，单位权）
    gridG: (function () {
      const { cols, rows, walls, s, t } = GRID;
      const wall = new Set(walls.map(c => c[0] * cols + c[1]));
      const nodes = [], names = [], edges = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        nodes.push({ x: c / (cols - 1), y: r / (rows - 1), wall: wall.has(r * cols + c) });
        names.push(r === s[0] && c === s[1] ? "S" : r === t[0] && c === t[1] ? "T" : "");
      }
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (wall.has(i)) continue;
        if (c + 1 < cols && !wall.has(i + 1)) edges.push({ u: i, v: i + 1, w: 1 });
        if (r + 1 < rows && !wall.has(i + cols)) edges.push({ u: i, v: i + cols, w: 1 });
      }
      return { names, nodes, edges, grid: true, caption: "网格地图（深色方块 = 障碍墙，每步代价 1）", weighted: false };
    })()
  };
  const DIJ = dijkstraTrace(6, GRAPHS.dijG.edges, 0);
  const BFS = bfsTrace(6, GRAPHS.bfsG.edges, 0);
  const FLOYD = floydTrace(6, GRAPHS.dijG.edges);
  const GS_D = gridSearch(GRID, false), GS_A = gridSearch(GRID, true);
  const nm = i => AZ[i];
  function updText(snap) {
    if (!snap.updated.length) return "没有可以变小的邻居";
    return snap.updated.map(u => nm(u.v) + "：" + (u.from === Infinity ? "∞" : u.from) + " → " + u.to).join("，");
  }

  /* ---------------- 三层步骤数据 ---------------- */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "看 BFS 像水波一样一层层扩散，数出 A 到 F 的最少跳数。",
      badge: "BFS 最少跳数",
      legend: [["node", "未发现"], ["cur", "在队列（本层）"], ["done", "已出队"], ["path", "最短路"]],
      steps: [
        {
          name: "问题：最少几跳",
          graph: "bfsG", nodes: [0, 5],
          formula: '无权图中 A 到 F 的<span class="ft hot">最短路 = 边数最少的通路</span>',
          badge: "起点/终点", tone: "",
          text: "消息从 A 传到 F 最少要转发几次？没有权重时，“最短”就是<b>经过的边数最少</b>。工具：<b>广度优先搜索 BFS</b>。"
        },
        {
          name: "第 0 层：起点",
          graph: "bfsG", bfs: 0,
          formula: 'dist(A) = <span class="ft hot-green hot">0</span>，其余全为 ∞；A 入队',
          badge: "第 0 层", tone: "",
          text: "起点距离设为 0，其他点都是“还不知道”（∞）。BFS 用一个<b>先进先出的队列</b>管理待扩散的点。"
        },
        {
          name: "第 1 层：邻居",
          graph: "bfsG", bfs: 1,
          formula: 'A 出队，未发现的邻居 B、C 标 <span class="ft hot">dist = 1</span>，前驱为 A',
          badge: "第 1 层", tone: "",
          text: "水波荡开第一圈：从 A 一步可达的 B、C 距离都是 <b>1</b>。每个点只在<b>第一次被发现</b>时标号，之后不再修改。"
        },
        {
          name: "第 2 层",
          graph: "bfsG", bfs: 2,
          formula: 'B、C 依次出队，新邻居 D、E 标 <span class="ft hot">dist = 2</span>',
          badge: "第 2 层", tone: "",
          text: "D 同时是 B 和 C 的邻居，但 B 先出队，所以 D 由 B 发现（前驱 B），C 再看到 D 时已不再修改。E 由 C 发现。"
        },
        {
          name: "第 3 层：到达 F",
          graph: "bfsG", bfs: 3,
          formula: 'D 出队发现 F：<span class="ft hot">dist(A,F) = 3</span>',
          badge: "3 跳", tone: "",
          text: "第三圈波纹碰到 F，最少 <b>3 跳</b>。BFS 按层扩散保证：<b>第一次到达某点时的层数就是最少跳数</b>。"
        },
        {
          name: "回溯最短路",
          graph: "bfsG", bfs: 4, path: [0, 1, 3, 5],
          formula: '沿前驱回溯 F←D←B←A：<span class="ft hot-green hot">A → B → D → F</span>（3 条边）',
          badge: "回溯", tone: "gold",
          text: "从 F 沿“谁第一个发现我”倒着走回 A，得到绿色路线。最短路<b>不一定唯一</b>（A→C→D→F、A→C→E→F 也是 3 跳），但最少跳数唯一。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "逐步执行 Dijkstra：每轮选出暂定距离最小的未定点 → 定案 → 松弛邻边；再用 Floyd 求全源最短路。",
      badge: "Dijkstra / Floyd",
      legend: [["node", "未定"], ["cur", "本轮定案"], ["done", "已定集合 S"], ["hot", "本轮松弛成功"], ["path", "最短路 / 前驱树"]],
      steps: [
        {
          name: "带权图与问题",
          graph: "dijG", nodes: [0, 5],
          formula: '最短路 = <span class="ft hot">权和最小</span>的通路（不再是边数最少）',
          badge: "带权", tone: "",
          text: "边上有了代价（时间/距离/费用），跳数少的路未必便宜：A→C 直达权 5，绕 A→B→C 只要 3。求单源最短路，用 <b>Dijkstra 算法</b>（要求边权非负）。"
        },
        {
          name: "初始化",
          graph: "dijG", dij: 0,
          formula: 'dist(A)=<span class="ft hot-green hot">0</span>，其余 <span class="ft hot">∞</span>；已定集合 S = ∅',
          badge: "初始化", tone: "",
          text: "与 BFS 一样从 0 与 ∞ 出发。不同的是：每一轮要<b>在所有未定点中挑暂定距离最小的</b>，而不是按队列顺序。"
        },
        {
          name: "第 1 轮：定 A",
          graph: "dijG", dij: 1,
          formula: '选 A(0) 定案；松弛：<span class="ft hot">' + updText(DIJ[1]) + '</span>',
          badge: "松弛", tone: "",
          text: "“松弛”边 (u,v)：若 dist(u)+w(u,v) &lt; dist(v)，就把 dist(v) 改小，并记前驱 pre(v)=u。A 的两条邻边都松弛成功。"
        },
        {
          name: "第 2 轮：定 B",
          graph: "dijG", dij: 2,
          formula: '未定点中 B(2) 最小，定案；<span class="ft hot">' + updText(DIJ[2]) + '</span>',
          badge: "贪心", tone: "gold",
          text: "B 的 2 是未定点中最小的，由于边权非负，不可能再经别的点更快到达 B——<b>贪心定案</b>。经 B 松弛：C 从直达的 5 降为 2+1=3，D 首次得到 2+4=6。"
        },
        {
          name: "第 3 轮：定 C",
          graph: "dijG", dij: 3,
          formula: '定 C(3)；<span class="ft hot">' + updText(DIJ[3]) + '</span>',
          badge: "定 C", tone: "",
          text: "未定点 C=3、D=6、E=∞、F=∞ 中 C 最小。经 C：D 由 6 降为 3+2=5，E 首次得到 3+4=7。"
        },
        {
          name: "第 4 轮：定 D",
          graph: "dijG", dij: 4,
          formula: '定 D(5)；<span class="ft hot">' + updText(DIJ[4]) + '</span>',
          badge: "定 D", tone: "",
          text: "经 D：E 由 7 降为 5+1=6；F 首次得到 5+5=10。已定区像墨迹一样从起点逐步晕开。"
        },
        {
          name: "第 5 轮：定 E",
          graph: "dijG", dij: 5,
          formula: '定 E(6)；<span class="ft hot">' + updText(DIJ[5]) + '</span>',
          badge: "定 E", tone: "",
          text: "经 E：F 由 10 降为 6+3=9。注意 F 的值被改过两次——暂定距离只有在<b>被选中定案时</b>才是最终答案。"
        },
        {
          name: "第 6 轮：定 F，完成",
          graph: "dijG", dij: 6, path: pathTo(DIJ[6].pre, 5),
          formula: 'dist(A,F) = <span class="ft hot-green hot">' + DIJ[6].dist[5] + '</span>；回溯前驱：' + pathTo(DIJ[6].pre, 5).map(nm).join(" → "),
          badge: "完成", tone: "",
          text: "所有点都已定案。沿前驱 F←E←D←C←B←A 回溯得到绿色最短路：2+1+2+1+3 = 9。各点的前驱边合起来构成一棵<b>最短路径树</b>。"
        },
        {
          name: "为什么边权非负",
          graph: "dijG",
          formula: '若有负权边，“<span class="ft hot">已定案 ⇒ 必最短</span>”可能不成立 ⇒ Dijkstra 可能出错',
          badge: "前提", tone: "red",
          text: "贪心定案的依据是：经过其他未定点再绕过来只会更贵。反例（有向图）：A→B 权 2，A→C 权 3，C→B 权 −2。Dijkstra 先把 B 定案为 2，但 A→C→B 只要 1，定案错了。含负权边时改用 <b>Bellman-Ford</b>（无向图中一条负权边来回走就是负权回路，最短路无定义）。"
        },
        {
          name: "Floyd：逐个加入中转点",
          graph: "dijG", floydK: 2,
          formula: '<span class="ft hot-blue hot">D⁽ᵏ⁾[i][j] = min(D⁽ᵏ⁻¹⁾[i][j], D⁽ᵏ⁻¹⁾[i][k] + D⁽ᵏ⁻¹⁾[k][j])</span>',
          badge: "全源 DP", tone: "blue",
          text: "要“任意两点”的最短距离就用 <b>Floyd</b>：D⁽⁰⁾ 是带权邻接矩阵（无边记 ∞），第 k 轮允许经过第 k 个顶点中转。<b>点右侧按钮切换 k</b>，金色格是本轮被改小的元素。"
        },
        {
          name: "Floyd 结果",
          graph: "dijG", floydK: 6, path: pathTo(DIJ[6].pre, 5),
          formula: 'D⁽⁶⁾ 即全源最短距离表；<span class="ft hot">d[A][F] = ' + FLOYD[6][0][5] + '</span>，与 Dijkstra 一致；时间 O(n³)',
          badge: "核对", tone: "gold",
          text: "三重循环 O(n³) 一次得到整张表，可逐格与 Dijkstra 的 dist 行对照：A 行 = 0, 2, 3, 5, 6, 9。Floyd 允许负权边（但不能有负权回路）。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "把最短路装进真实系统：地图导航、OSPF 路由、游戏寻路中的 A*，以及负权与 Bellman-Ford。",
      badge: "导航 / A*",
      legend: [["node", "顶点"], ["cur", "起点/终点"], ["soft", "已展开"], ["path", "最短路 / 最短路径树"]],
      steps: [
        {
          name: "导航 = 最短路",
          graph: "dijG", dij: 6, path: pathTo(DIJ[6].pre, 5), noTable: true,
          formula: '边权 = <span class="ft hot">实时通行时间</span>：路况变了就改权重、重算最短路',
          badge: "导航", tone: "",
          text: "地图导航把路口看作顶点、路段看作边，以预计通行时间为权。路况变化时更新边权并重新计算，就是你看到的“重新规划路线”。"
        },
        {
          name: "OSPF 路由协议",
          graph: "dijG", dij: 6, spt: true,
          formula: '每台路由器以自己为源跑 Dijkstra ⇒ <span class="ft hot">最短路径树 SPT</span>',
          badge: "OSPF", tone: "blue",
          text: "OSPF 是互联网中广泛使用的链路状态路由协议：以链路开销为权，每台路由器以自己为根算出一棵<b>最短路径树</b>（绿色边），再据此生成转发表。"
        },
        {
          name: "Dijkstra：四面扩散",
          graph: "gridG", grid: "dij",
          formula: 'Dijkstra 在网格上按距离一圈圈扩散：到 T 出队前共展开 <span class="ft hot">' + GS_D.closed.length + '</span> 个格子',
          badge: "盲目", tone: "",
          text: "单位权网格上 Dijkstra 就是 BFS：它不知道 T 在哪，向四面八方均匀扩散，连背离终点的左侧格子也要展开。浅绿色为已展开的格子。"
        },
        {
          name: "A*：带方向感的搜索",
          graph: "gridG", grid: "astar",
          formula: '<span class="ft hot">f(n) = g(n) + h(n)</span>，h = 曼哈顿距离：只展开 <span class="ft hot-green hot">' + GS_A.closed.length + '</span> 个格子，路长仍为 ' + GS_A.len,
          badge: "A*", tone: "gold",
          text: "A* 每次展开 f 最小的格子：g 是已走代价，h 是到 T 的估计。它优先探索朝向目标的方向，绕墙时才向下展开，最终路长与 Dijkstra 相同（" + GS_D.len + " 步），展开的格子却少得多。"
        },
        {
          name: "可采纳性保证最优",
          graph: "gridG", grid: "astar",
          formula: '<span class="ft hot-green hot">h(n) ≤ 真实剩余距离</span>（可采纳）⇒ A* 返回最优解；h ≡ 0 时 A* 退化为 Dijkstra',
          badge: "可采纳", tone: "",
          text: "启发函数“只许低估、不许高估”。四方向网格上曼哈顿距离从不超过真实步数，且满足一致性 h(u) ≤ w(u,v)+h(v)，因此每个格子只需展开一次就能保证最优——<b>加速而不牺牲正确性</b>。若 h 高估，A* 可能更快但不保证最短。"
        },
        {
          name: "负权与 Bellman-Ford",
          graph: "dijG",
          formula: '含负权边：<span class="ft hot">Bellman-Ford O(VE)</span>，还能检测负权回路',
          badge: "负权", tone: "red",
          text: "Bellman-Ford 对全部边松弛 V−1 轮；若第 V 轮仍能松弛，说明存在<b>负权回路</b>。例：汇率兑换图取 −log(汇率) 为权，负权回路意味着兑换一圈后资金变多，即套利机会。"
        },
        {
          name: "迁移总结",
          graph: "dijG", path: pathTo(DIJ[6].pre, 5), viz: "transferlist",
          formula: '<span class="ft hot">导航改权重 · 路由建树 · 寻路加启发 · 负权查回路</span>',
          badge: "迁移", tone: "gold",
          text: "同一个“松弛”操作：导航实时改边权、OSPF 每台路由器建树、游戏 A* 加方向感、Bellman-Ford 查负权回路。<b>先把问题建成带权图，再按边权特点选算法。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, GRID, LEVELS, bfsTrace, bfsDist, dijkstraTrace, dijkstra, pathTo, floydTrace, floyd, gridSearch };
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
  const legendEl = document.getElementById("stageLegend");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const LG_CLASS = { node: "lg-node", cur: "lg-node lg-cur", done: "lg-node lg-ok", g1: "lg-node lg-ok", g2: "lg-node lg-cur", seq: "lg-node lg-cur lg-seq",
    soft: "lg-node lg-soft", del: "lg-node lg-del", edge: "lg-edge", hot: "lg-edge lg-hot", path: "lg-edge lg-res", new: "lg-edge lg-new" };

  const C = {
    red: "#D63B1D", gold: "#FFB400", ink: "#2C1810", muted: "#6B4A38",
    green: "#1F9D55", greenDark: "#2F7D57", edge: "rgba(107,74,56,0.42)", edgeDim: "rgba(107,74,56,0.2)",
    soft: "rgba(31,157,85,0.28)"
  };

  let step = 0;
  let playTimer = null;
  let playDelay = 2000;
  let floydK = null; // 用户在 Floyd 步骤中手动选择的 k

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  }
  const fmtD = v => (v === Infinity ? "∞" : String(v));

  if (missionEl) missionEl.innerHTML = "<b>互动任务：</b>" + esc(level.mission);
  if (badgeEl) badgeEl.textContent = level.badge;
  if (legendEl) legendEl.innerHTML = level.legend.map(it => '<span><i class="' + (LG_CLASS[it[0]] || "lg-node") + '"></i>' + esc(it[1]) + '</span>').join("");

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(240, Math.floor(rect.width));
    const h = Math.max(260, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }
  function pathPairs(path) {
    const out = [];
    for (let i = 0; path && i + 1 < path.length; i++) out.push([path[i], path[i + 1]]);
    return out;
  }
  const hasPair = (list, u, v) => list.some(p => (p[0] === u && p[1] === v) || (p[0] === v && p[1] === u));

  // 每步的图状态：顶点分类 + 边分类 + 距离标签
  function stateOf(st) {
    const g = GRAPHS[st.graph];
    const n = g.nodes.length;
    const s = { cls: Array(n).fill("node"), dist: null, updatedV: new Set(), hotEdges: [], greenEdges: [], soft: new Set() };
    if (st.bfs !== undefined) {
      const snap = BFS[Math.min(st.bfs, BFS.length - 1)];
      s.dist = snap.dist;
      snap.done.forEach(i => { s.cls[i] = "done"; });
      snap.queue.forEach(i => { s.cls[i] = "cur"; });
      snap.queue.forEach(v => { if (snap.pre[v] >= 0) s.hotEdges.push([snap.pre[v], v]); });
    }
    if (st.dij !== undefined) {
      const snap = DIJ[st.dij];
      s.dist = snap.dist;
      snap.done.forEach(i => { s.cls[i] = "done"; });
      if (snap.cur >= 0 && st.dij < DIJ.length - 1) s.cls[snap.cur] = "cur";
      snap.updated.forEach(u => { s.updatedV.add(u.v); if (st.dij < DIJ.length - 1) s.hotEdges.push([snap.cur, u.v]); });
      if (st.dij === 0) s.cls[0] = "cur";
      // 已定点的前驱边 = 当前最短路径树
      snap.done.forEach(v => { if (snap.pre[v] >= 0) s.greenEdges.push([snap.pre[v], v]); });
      if (st.dij === DIJ.length - 1 && !st.spt) s.greenEdges = [];
    }
    if (st.path) s.greenEdges = s.greenEdges.concat(pathPairs(st.path));
    if (st.grid) {
      const res = st.grid === "astar" ? GS_A : GS_D;
      res.closed.forEach(i => s.soft.add(i));
      s.greenEdges = pathPairs(res.path);
      res.path.forEach(i => { s.cls[i] = "done"; });
      g.names.forEach((nmv, i) => { if (nmv) s.cls[i] = "cur"; });
    }
    (st.nodes || []).forEach(i => { s.cls[i] = "cur"; });
    if (st.path && !st.grid) { s.cls[st.path[0]] = s.cls[st.path[0]] === "node" ? "done" : s.cls[st.path[0]]; }
    return s;
  }

  function draw() {
    const size = resize();
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    const s = stateOf(st);
    const small = size.w < 480;
    const R = g.grid ? (small ? 10 : 13) : (small ? 16 : 19);
    const padX = g.grid ? (small ? 26 : 50) : (small ? 30 : 56), padTop = Math.max(g.grid ? 70 : 56, (legendEl ? legendEl.offsetHeight + 12 : 0) + (g.grid ? 26 : s.dist ? 50 : 30)), padBot = g.grid ? 40 : 46;
    const P = g.nodes.map(nd => ({ x: padX + nd.x * (size.w - 2 * padX), y: padTop + nd.y * (size.h - padTop - padBot) }));
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    // 网格墙体
    if (g.grid) {
      const cw = (size.w - 2 * padX) / (GRID.cols - 1), ch = (size.h - padTop - padBot) / (GRID.rows - 1);
      g.nodes.forEach((nd, i) => {
        if (!nd.wall) return;
        ctx.fillStyle = "rgba(44,24,16,0.78)";
        const wdt = Math.min(cw, ch) * 0.8;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(P[i].x - wdt / 2, P[i].y - wdt / 2, wdt, wdt, 6); else ctx.rect(P[i].x - wdt / 2, P[i].y - wdt / 2, wdt, wdt);
        ctx.fill();
      });
      // 已展开格子的浅绿底
      s.soft.forEach(i => {
        ctx.fillStyle = C.soft;
        ctx.beginPath(); ctx.arc(P[i].x, P[i].y, R + 7, 0, Math.PI * 2); ctx.fill();
      });
    }

    g.edges.forEach(e => {
      const green = hasPair(s.greenEdges, e.u, e.v);
      const hot = !green && hasPair(s.hotEdges, e.u, e.v);
      ctx.strokeStyle = green ? C.green : hot ? C.red : (g.grid ? C.edgeDim : C.edge);
      ctx.lineWidth = green || hot ? 4.5 : 2;
      const a = P[e.u], b = P[e.v];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      ctx.beginPath();
      ctx.moveTo(a.x + Math.cos(ang) * R, a.y + Math.sin(ang) * R);
      ctx.lineTo(b.x - Math.cos(ang) * R, b.y - Math.sin(ang) * R);
      ctx.stroke();
      if (g.weighted) {
        const mx = (a.x + b.x) / 2 - Math.sin(ang) * 13;
        const my = (a.y + b.y) / 2 + Math.cos(ang) * 13;
        ctx.fillStyle = "rgba(255,251,240,0.92)";
        ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = green ? C.greenDark : hot ? C.red : C.muted;
        ctx.font = "800 13px 'JetBrains Mono', Consolas, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(e.w), mx, my + 0.5);
      }
    });

    P.forEach((p, i) => {
      if (g.nodes[i].wall) return;
      const cls = s.cls[i];
      const inQueue = st.dij !== undefined && s.dist && s.dist[i] !== Infinity && cls === "node";
      ctx.beginPath();
      ctx.arc(p.x, p.y, cls === "cur" ? R + 2 : R, 0, Math.PI * 2);
      ctx.fillStyle = cls === "cur" ? C.gold : cls === "done" ? C.green : (g.grid ? "rgba(214,59,29,0.55)" : C.red);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = g.grid ? 2 : 3;
      ctx.stroke();
      if (inQueue) {
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.arc(p.x, p.y, R + 5, 0, Math.PI * 2);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.setLineDash([]);
      }
      if (g.names[i]) {
        ctx.fillStyle = cls === "cur" ? C.ink : "#fff";
        ctx.font = "800 " + (g.grid ? 12 : 14) + "px 'JetBrains Mono', Consolas, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(g.names[i], p.x, p.y + 0.5);
      }
      // 距离标签
      if (s.dist) {
        const label = "d=" + fmtD(s.dist[i]);
        const bw = label.length * 8 + 10;
        const bx = p.x, by = p.y - R - 15;
        ctx.fillStyle = s.updatedV.has(i) ? C.red : C.ink;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx - bw / 2, by - 10, bw, 20, 8); else ctx.rect(bx - bw / 2, by - 10, bw, 20);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "800 12px 'JetBrains Mono', Consolas, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, bx, by + 0.5);
      }
    });

    ctx.fillStyle = C.muted;
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(g.caption, size.w / 2, size.h - 12);
  }

  /* ---- 右侧表格 ---- */
  function traceTable(snap, opts) {
    const n = snap.dist.length;
    const upd = new Set((snap.updated || []).map(u => u.v));
    const done = new Set(snap.done);
    const queue = new Set(snap.queue || []);
    const rows = [];
    for (let i = 0; i < n; i++) {
      let tag, cls = "";
      if (i === snap.cur && !opts.final) { tag = '<span class="tag cur">本轮定案</span>'; cls = "st-cur"; }
      else if (done.has(i)) { tag = '<span class="tag done">' + (opts.bfs ? "已出队" : "已定") + '</span>'; cls = "st-done"; }
      else if (queue.has(i)) { tag = '<span class="tag cur">在队列</span>'; cls = "st-cur"; }
      else if (snap.dist[i] !== Infinity) tag = '<span class="tag wait">暂定</span>';
      else tag = '<span class="tag wait">未发现</span>';
      rows.push('<tr class="' + cls + '"><td class="nm">' + nm(i) + '</td><td class="' + (upd.has(i) ? "upd" : "") + '">' + fmtD(snap.dist[i]) +
        '</td><td>' + (snap.pre[i] >= 0 ? nm(snap.pre[i]) : "—") + '</td><td>' + tag + '</td></tr>');
    }
    return '<table class="trace-table"><thead><tr><th>顶点</th><th>' + (opts.bfs ? "跳数" : "dist") + '</th><th>前驱</th><th>状态</th></tr></thead><tbody>' + rows.join("") + '</tbody></table>';
  }
  function floydHtml(k, hotAF) {
    const cur = FLOYD[k], prev = FLOYD[Math.max(0, k - 1)];
    const names = GRAPHS.dijG.names;
    const head = '<span class="matrix-cell head"></span>' + names.map(x => '<span class="matrix-cell head">' + x + '</span>').join("");
    const rows = cur.map((row, i) =>
      '<span class="matrix-cell head">' + names[i] + '</span>' + row.map((v, j) => {
        let c = "matrix-cell";
        if (hotAF && i === 0 && j === 5) c += " hot";
        else if (k > 0 && v !== prev[i][j]) c += " chg";
        else if (v === Infinity) c += " inf";
        else if (v) c += " one";
        return '<span class="' + c + '">' + fmtD(v) + '</span>';
      }).join("")
    ).join("");
    const btns = FLOYD.map((m, i) => '<button type="button" class="kbtn' + (i === k ? " on" : "") + '" data-k="' + i + '" aria-pressed="' + (i === k) + '">' + (i === 0 ? "初始" : "k=" + names[i - 1]) + '</button>').join("");
    let changed = 0;
    if (k > 0) cur.forEach((row, i) => row.forEach((v, j) => { if (v !== prev[i][j]) changed++; }));
    const note = k === 0 ? "D<sup>(0)</sup>：有边填权值，无边填 ∞，对角线为 0。"
      : "第 " + k + " 轮以 " + names[k - 1] + " 为中转点，改小了 " + changed + " 个元素（金色，对称成对出现）。";
    return '<div class="mx-card"><div class="mx-title">Floyd 距离矩阵 D<sup>(' + k + ')</sup></div><div class="kbtns" role="group" aria-label="选择中转点轮次">' + btns + '</div>' +
      '<div class="matrix-wrap"><div class="matrix-grid" style="grid-template-columns:repeat(7,minmax(28px,auto))">' + head + rows + '</div></div><div class="mx-note">' + note + '</div></div>';
  }
  function gridHtml() {
    return '<div class="mx-card"><div class="mx-title">展开格子数对比（到 T 出队为止）</div>' +
      '<div class="rank-row"><span class="rk">Dij</span><span class="nm"></span><span class="bar"><i style="width:100%"></i></span><span class="sc">' + GS_D.closed.length + '</span></div>' +
      '<div class="rank-row top"><span class="rk">A*</span><span class="nm"></span><span class="bar"><i style="width:' + (GS_A.closed.length / GS_D.closed.length * 100).toFixed(1) + '%"></i></span><span class="sc">' + GS_A.closed.length + '</span></div>' +
      '<div class="mx-note">两者找到的最短路长度都是 ' + GS_A.len + ' 步。平局时 A* 优先展开 h 较小的格子。</div></div>';
  }
  function transferHtml() {
    return '<div class="mx-card"><div class="mx-title">迁移对照</div>' +
      '<div class="pill-row"><span class="pill">地图导航：实时权重</span><span class="pill">OSPF：最短路径树</span><span class="pill">游戏寻路：A* 启发</span><span class="pill">金融：负权回路 = 套利</span></div>' +
      '<table class="trace-table" style="margin-top:8px"><thead><tr><th>算法</th><th>适用</th><th>复杂度</th></tr></thead><tbody>' +
      '<tr><td>BFS</td><td>无权图</td><td>O(V+E)</td></tr><tr><td>Dijkstra</td><td>非负权 · 单源</td><td>O(E log V)</td></tr>' +
      '<tr><td>Bellman-Ford</td><td>可含负权 · 单源</td><td>O(VE)</td></tr><tr><td>Floyd</td><td>全源（无负权回路）</td><td>O(V³)</td></tr></tbody></table></div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    let html = "";
    if (st.bfs !== undefined) {
      const snap = BFS[Math.min(st.bfs, BFS.length - 1)];
      html = '<div class="mx-card"><div class="mx-title">BFS 状态表</div>' + traceTable(snap, { bfs: true }) +
        '<div class="mx-note">队列：' + (snap.queue.length ? "[ " + snap.queue.map(nm).join(", ") + " ]" : "空（搜索结束）") + '</div></div>';
    } else if (st.dij !== undefined && !st.noTable) {
      const snap = DIJ[st.dij];
      const final = st.dij === DIJ.length - 1;
      html = '<div class="mx-card"><div class="mx-title">' + (st.spt ? "以 A 为根的最短路径树（前驱表）" : "Dijkstra 状态表 · " + (st.dij === 0 ? "初始化" : "第 " + st.dij + " 轮")) + '</div>' +
        traceTable(snap, { final: final }) +
        '<div class="mx-note">已定集合 S = {' + snap.done.map(nm).join(", ") + '}' + (snap.cur >= 0 && !final ? '；本轮松弛：' + updText(snap) : '') + '</div></div>';
    } else if (st.floydK !== undefined) {
      const k = floydK === null ? st.floydK : floydK;
      html = floydHtml(k, st.floydK === 6 && k === 6);
    } else if (st.grid) {
      html = gridHtml();
    }
    if (st.viz === "transferlist") html += transferHtml();
    vizText.innerHTML = html;
    Array.prototype.forEach.call(vizText.querySelectorAll(".kbtn"), b => {
      b.addEventListener("click", () => { stopPlay(); floydK = Number(b.dataset.k); renderViz(level.steps[step]); });
    });
  }

  /* ---- 步骤渲染 ---- */
  function renderStep() {
    const st = level.steps[step];
    if (formulaText) formulaText.innerHTML = st.formula;
    if (stepStatus) stepStatus.innerHTML = '<span class="badge ' + (st.tone || "") + '">' + esc(st.badge || (step + 1)) + '</span><span>' + st.text + '</span>';
    renderViz(st);
    draw();
    Array.prototype.forEach.call(document.querySelectorAll(".step-item"), (el, i) => {
      el.classList.toggle("active", i === step);
      el.classList.toggle("done", i < step);
      el.setAttribute("aria-current", i === step ? "step" : "false");
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
    floydK = null;
    renderStep();
  }
  function stopPlay() {
    if (playTimer) { clearTimeout(playTimer); playTimer = null; }
    const b = document.getElementById("playBtn");
    if (b) { b.classList.remove("playing"); b.textContent = "▶ 自动播放"; }
  }
  function tick() {
    if (step >= level.steps.length - 1) { stopPlay(); return; }
    go(step + 1);
    playTimer = setTimeout(tick, playDelay);
  }
  function togglePlay() {
    const b = document.getElementById("playBtn");
    if (playTimer) { stopPlay(); return; }
    if (step === level.steps.length - 1) go(0);
    if (b) { b.classList.add("playing"); b.textContent = "⏸ 暂停"; }
    playTimer = setTimeout(tick, playDelay);
  }

  function buildControls() {
    const listItems = level.steps.map((s, i) =>
      '<button type="button" class="step-item" data-i="' + i + '"><span class="num">' + (i + 1) + '</span><span>' + esc(s.name) + '</span></button>'
    ).join("");
    controls.innerHTML =
      '<div class="step-controller">' +
        '<div class="step-progress-head"><span id="stepCounter">第 1 / ' + level.steps.length + ' 步</span><small>' + esc(level.label) + ' · 点一步看变化</small></div>' +
        '<div class="progress-track"><div class="progress-fill"></div></div>' +
        '<div class="step-btns">' +
          '<button type="button" class="step-btn" id="prevBtn">◀ 上一步</button>' +
          '<button type="button" class="step-btn primary" id="nextBtn">下一步 ▶</button>' +
          '<button type="button" class="step-btn" id="playBtn">▶ 自动播放</button>' +
          '<button type="button" class="step-btn reset" id="resetBtn">↺ 重置</button>' +
        '</div>' +
        '<label class="speed-row"><span>播放速度</span><input type="range" id="speedRange" min="1" max="5" step="1" value="3" aria-label="自动播放速度"><b id="speedVal">中</b></label>' +
      '</div>' +
      '<div class="step-list">' + listItems + '</div>';
    document.getElementById("prevBtn").addEventListener("click", () => { stopPlay(); go(step - 1); });
    document.getElementById("nextBtn").addEventListener("click", () => { stopPlay(); go(step + 1); });
    document.getElementById("playBtn").addEventListener("click", togglePlay);
    document.getElementById("resetBtn").addEventListener("click", () => { stopPlay(); go(0); });
    const sp = document.getElementById("speedRange"), spv = document.getElementById("speedVal");
    const DELAYS = [3600, 2800, 2000, 1400, 900], NAMES = ["很慢", "慢", "中", "快", "很快"];
    sp.addEventListener("input", () => { playDelay = DELAYS[sp.value - 1]; spv.textContent = NAMES[sp.value - 1]; });
    Array.prototype.forEach.call(document.querySelectorAll(".step-item"), el => {
      el.addEventListener("click", () => { stopPlay(); go(Number(el.dataset.i)); });
    });
  }

  buildControls();
  renderStep();
  let rzTimer = null;
  window.addEventListener("resize", () => { clearTimeout(rzTimer); rzTimer = setTimeout(draw, 80); });
})();
