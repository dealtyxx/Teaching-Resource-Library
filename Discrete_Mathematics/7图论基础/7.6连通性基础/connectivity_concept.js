/* ============================================================
   7.6 连通性基础 · 三层统一交互引擎（通路步序标号 + 分支/强连通分量着色）
   window.CONN_LEVEL = "basic" | "advanced" | "extend"
   交互：上一步 / 下一步 / 自动播放（可调速）/ 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   全章统一配色：普通顶点=主红白字，途经/关注=金，结果=绿；普通边=淡褐灰细线，所走通路=主红加粗，
   化简后的结果通路=绿加粗；连通分支 / 强连通分量用 绿 / 次墨 / 暗金 / 墨色 区分并在图例中列出。
   术语与屈婉玲《离散数学》一致：通路、回路、简单通路、初级通路（路径）、初级回路（圈）、连通分支、
   强连通 / 单向连通 / 弱连通。
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  function hasEdge(edges, u, v, directed) {
    return edges.some(e => (e[0] === u && e[1] === v) || (!directed && e[0] === v && e[1] === u));
  }
  function reachSet(n, edges, directed, s) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { adj[e[0]].push(e[1]); if (!directed) adj[e[1]].push(e[0]); });
    const seen = Array(n).fill(false);
    seen[s] = true;
    const q = [s];
    while (q.length) { const u = q.shift(); adj[u].forEach(v => { if (!seen[v]) { seen[v] = true; q.push(v); } }); }
    return seen;
  }
  function reachable(n, edges, directed, s, t) { return reachSet(n, edges, directed, s)[t]; }
  // BFS 距离（无向）：返回 s 到各点的最短通路长度，不可达为 Infinity
  function distances(n, edges, s) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
    const d = Array(n).fill(Infinity);
    d[s] = 0;
    const q = [s];
    while (q.length) { const u = q.shift(); adj[u].forEach(v => { if (d[v] === Infinity) { d[v] = d[u] + 1; q.push(v); } }); }
    return d;
  }
  // 连通分支（忽略方向）
  function componentGroups(n, edges) {
    const seen = Array(n).fill(false);
    const groups = [];
    for (let i = 0; i < n; i++) if (!seen[i]) {
      const r = reachSet(n, edges, false, i);
      const g = [];
      for (let j = 0; j < n; j++) if (r[j]) { seen[j] = true; g.push(j); }
      groups.push(g);
    }
    return groups;
  }
  function componentsCount(n, edges) { return componentGroups(n, edges).length; }
  function reachMatrix(n, edges) {
    const R = [];
    for (let i = 0; i < n; i++) R.push(reachSet(n, edges, true, i));
    return R;
  }
  function isStronglyConnected(n, edges) {
    const R = reachMatrix(n, edges);
    return R.every(row => row.every(Boolean));
  }
  // 单向连通：任意两点至少一个方向可达
  function isUnilateral(n, edges) {
    const R = reachMatrix(n, edges);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (!R[i][j] && !R[j][i]) return false;
    return true;
  }
  function isWeaklyConnected(n, edges) { return componentsCount(n, edges) === 1; }
  // 强连通分量（互达等价类）
  function sccGroups(n, edges) {
    const reach = reachMatrix(n, edges);
    const assigned = Array(n).fill(-1);
    const groups = [];
    for (let i = 0; i < n; i++) if (assigned[i] < 0) {
      const g = [];
      for (let j = 0; j < n; j++) if (assigned[j] < 0 && reach[i][j] && reach[j][i]) { assigned[j] = groups.length; g.push(j); }
      groups.push(g);
    }
    return groups;
  }
  // 通路分类：edgesDistinct=简单通路，verticesDistinct=初级通路（回路时除首尾外）
  function walkClassify(path, edges, directed) {
    for (let i = 0; i + 1 < path.length; i++)
      if (!hasEdge(edges, path[i], path[i + 1], directed)) return { valid: false };
    const closed = path[0] === path[path.length - 1];
    const eKeys = [];
    for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i], b = path[i + 1];
      eKeys.push(directed ? a + ">" + b : Math.min(a, b) + "-" + Math.max(a, b));
    }
    const edgesDistinct = new Set(eKeys).size === eKeys.length;
    const inner = closed ? path.slice(0, -1) : path;
    const verticesDistinct = new Set(inner).size === inner.length;
    return { valid: true, closed, edgesDistinct, verticesDistinct: verticesDistinct && edgesDistinct, length: path.length - 1 };
  }
  // 删去通路中的回路段，得到同起止点的初级通路
  function reduceWalk(path) {
    const out = [];
    path.forEach(v => {
      const k = out.indexOf(v);
      if (k >= 0) out.length = k + 1; else out.push(v);
    });
    return out;
  }

  /* ---------------- 图库 ---------------- */
  const AZ = "ABCDEFGH".split("");
  const digNodes = [{ x: 0.2, y: 0.08 }, { x: 0.72, y: 0.02 }, { x: 0.46, y: 0.62 }, { x: 0.9, y: 0.95 }];
  const GRAPHS = {
    // 基础层：可演示重复点/边的无向图
    walkG: {
      names: AZ.slice(0, 5), caption: "演示图 G：5 个顶点、6 条边",
      nodes: [
        { x: 0.12, y: 0.2 }, { x: 0.5, y: 0.02 }, { x: 0.42, y: 0.62 },
        { x: 0.82, y: 0.42 }, { x: 0.86, y: 0.98 }
      ],
      edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [1, 3]]
    },
    // 进阶层：连通 6 点图
    net6: {
      names: AZ.slice(0, 6), caption: "连通图 G（6 个顶点、8 条边）",
      nodes: [
        { x: 0.08, y: 0.3 }, { x: 0.36, y: 0.02 }, { x: 0.66, y: 0.14 },
        { x: 0.92, y: 0.52 }, { x: 0.6, y: 0.95 }, { x: 0.25, y: 0.72 }
      ],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 5], [2, 4]]
    },
    // 进阶层：两个分支
    twoComp: {
      names: AZ.slice(0, 7), caption: "非连通图：p(G) = 2",
      nodes: [
        { x: 0.08, y: 0.12 }, { x: 0.38, y: 0.02 }, { x: 0.4, y: 0.6 }, { x: 0.08, y: 0.72 },
        { x: 0.72, y: 0.18 }, { x: 0.95, y: 0.62 }, { x: 0.62, y: 0.9 }
      ],
      edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [4, 5], [5, 6], [6, 4]]
    },
    // 进阶层：弱连通但非单向连通
    digWeak: {
      names: AZ.slice(0, 4), caption: "有向图 D₁：A→B，C→B，C→D", directed: true,
      nodes: [{ x: 0.1, y: 0.1 }, { x: 0.5, y: 0.7 }, { x: 0.9, y: 0.1 }, { x: 0.9, y: 0.95 }],
      edges: [[0, 1], [2, 1], [2, 3]]
    },
    // 进阶层：单向连通非强连通
    dig: {
      names: AZ.slice(0, 4), caption: "有向图 D₂：A→B→C→A，C→D", directed: true,
      nodes: digNodes,
      edges: [[0, 1], [1, 2], [2, 0], [2, 3]]
    },
    digStrong: {
      names: AZ.slice(0, 4), caption: "有向图 D₃：在 D₂ 上加 D→A", directed: true,
      nodes: digNodes,
      edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 0]]
    },
    // 拓展层：网页图（简化的蝴蝶结结构）
    web: {
      names: AZ.slice(0, 8), caption: "网页链接图（简化的蝴蝶结结构）", directed: true,
      nodes: [
        { x: 0.06, y: 0.14 }, { x: 0.28, y: 0.02 }, { x: 0.26, y: 0.56 },
        { x: 0.5, y: 0.34 },
        { x: 0.72, y: 0.1 }, { x: 0.95, y: 0.36 }, { x: 0.74, y: 0.64 },
        { x: 0.92, y: 0.98 }
      ],
      edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 6], [6, 4], [6, 7]]
    },
    // 拓展层：进程等待图（含死锁环）
    deadlock: {
      names: ["P₁", "P₂", "P₃", "P₄"], caption: "进程等待图（P→Q：P 在等 Q 释放资源）", directed: true,
      nodes: [{ x: 0.2, y: 0.05 }, { x: 0.76, y: 0.05 }, { x: 0.48, y: 0.7 }, { x: 0.95, y: 0.8 }],
      edges: [[0, 1], [1, 2], [2, 0], [3, 1]]
    }
  };

  /* ---------------- 三层步骤数据 ----------------
     path = 顶点序列（画步序标号，边为主红）；pathOk = 结果通路（绿）；
     nodes = 本步关注（金）；groups = 连通分支 / 强连通分量着色；groupLabel = 图例前缀 */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "沿着金色编号一步步走：分清通路、回路、简单通路、初级通路（路径）与初级回路（圈）。",
      badge: "通路 / 回路",
      steps: [
        {
          name: "通路",
          graph: "walkG", path: [0, 1, 2, 0, 1],
          formula: '通路：顶点与边交替的序列 <span class="ft hot">A→B→C→A→B</span>，长度 = 边数 = 4',
          badge: "长度 4", tone: "", viz: "classify",
          text: "跟着金色编号走 4 步：边 AB 走了<b>两次</b>，顶点 A、B 也重复了——都允许。<b>通路</b>只要求相邻两点之间有边；其中所含边的条数叫<b>长度</b>。"
        },
        {
          name: "回路",
          graph: "walkG", path: [0, 1, 2, 0],
          formula: '起点 = 终点的通路：<span class="ft hot">A→B→C→A</span> 称为<b>回路</b>',
          badge: "回路", tone: "blue", viz: "classify",
          text: "从 A 出发最后又回到 A——<b>起点与终点相同</b>的通路叫回路。下方程序判定显示：这条回路的顶点也不重复，它还是后面要讲的初级回路。"
        },
        {
          name: "简单通路（边不重复）",
          graph: "walkG", path: [1, 0, 2, 1, 3],
          formula: '<span class="ft hot">B→A→C→B→D</span>：4 条边各不相同（顶点 B 重复）⇒ 简单通路',
          badge: "简单", tone: "", viz: "classify",
          text: "这条走法经过 B 两次，但 4 条边 BA、AC、CB、BD <b>各不相同</b>——所有边互不相同的通路叫<b>简单通路</b>（首尾相同时叫简单回路）。"
        },
        {
          name: "初级通路（路径）",
          graph: "walkG", path: [0, 1, 3, 4],
          formula: '<span class="ft hot-green hot">A→B→D→E</span>：顶点全不重复 ⇒ 初级通路（路径）',
          badge: "初级", tone: "", viz: "classify",
          text: "最严格的走法：<b>顶点一个不重</b>（边自然也不重）——<b>初级通路</b>，也叫<b>路径</b>。不走回头路、不绕圈。"
        },
        {
          name: "初级回路（圈）",
          graph: "walkG", path: [1, 2, 3, 1],
          formula: '<span class="ft hot">B→C→D→B</span>：除首尾外顶点不重复 ⇒ 初级回路（圈）',
          badge: "圈", tone: "gold", viz: "classify",
          text: "首尾相同、其余顶点互不相同的回路叫<b>初级回路</b>，也叫<b>圈</b>，长度为 3 的圈是三角形。它就是 7.4 节圈图 Cₙ 在图中的“一段路”。"
        },
        {
          name: "剪掉回路得路径",
          graph: "walkG", path: [0, 1, 3], pathOk: true,
          formula: 'A→B→C→A→B→D <span class="ft hot-green hot">剪去回路段 A→B→C→A</span> ⇒ A→B→D',
          badge: "化简", tone: "", viz: "reduce",
          text: "通路 A→B→C→A→B→D 在 A 处绕了一圈。把这段回路剪掉，得到绿色的初级通路 A→B→D。所以：<b>若 u 到 v 有通路，就一定有 u 到 v 的初级通路</b>，且在 n 阶图中其长度 ≤ n−1。"
        },
        {
          name: "层级关系",
          graph: "walkG", path: [0, 1, 3, 4],
          formula: '<span class="ft hot-green hot">初级通路</span> ⊂ <span class="ft hot-blue hot">简单通路</span> ⊂ <span class="ft hot">通路</span>',
          badge: "包含链", tone: "blue", viz: "hierarchy",
          text: "三个概念一层套一层：顶点不重 ⇒ 边必不重 ⇒ 必是通路。<b>越往里要求越严</b>——定理与算法里最常用的是初级通路。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "判定可达与连通、数出连通分支，辨析有向图的强连通、单向连通与弱连通，并求强连通分量。",
      badge: "连通性判定",
      steps: [
        {
          name: "可达与距离",
          graph: "net6", path: [0, 1, 2, 3],
          formula: 'A 与 D <span class="ft hot-green hot">连通</span> ⟺ 存在 A 到 D 的通路；最短通路长度 d(A,D) = 3',
          badge: "可达", tone: "", viz: "dist",
          text: "“能不能到”翻译成数学：<b>存在通路即连通（可达）</b>。编号给出一条见证通路 A→B→C→D；A 到 D 的最短通路长度叫<b>距离</b> d(A,D)，这里是 3。"
        },
        {
          name: "连通图",
          graph: "net6", nodes: [0, 1, 2, 3, 4, 5],
          formula: '任意两点都连通 ⟺ G 是<span class="ft hot">连通图</span>，p(G) = 1',
          badge: "连通 ✓", tone: "", viz: "conncheck",
          text: "这张图任取两点都有通路相连——<b>连通图</b>。从任意一点出发做一次 BFS/DFS，若能到达全部顶点即可判定。"
        },
        {
          name: "连通分支",
          graph: "twoComp", groups: [[0, 1, 2, 3], [4, 5, 6]], groupLabel: "分支",
          formula: '连通关系是等价关系，每个等价类导出的子图 = <span class="ft hot">连通分支</span>；p(G) = 2',
          badge: "p(G)=2", tone: "gold", viz: "compcheck",
          text: "无向图中的连通关系是等价关系，按它把顶点分块：绿色 {A,B,C,D} 与褐色 {E,F,G} 各自内部连通、彼此之间没有边——两个<b>连通分支</b>，记 p(G) = 2。"
        },
        {
          name: "有向图：可达不对称",
          graph: "dig", path: [2, 3],
          formula: 'C→D <span class="ft hot-green hot">可达</span>，但 D→C <span class="ft hot">不可达</span>',
          badge: "单行道", tone: "red",
          text: "边有方向后，可达性<b>不再对称</b>：顺着箭头 C 能到 D，但 D 没有出边，回不来。有向图里“去得了”≠“回得来”，于是连通性要分三种强弱。"
        },
        {
          name: "弱连通",
          graph: "digWeak", nodes: [0, 2],
          formula: '基图（去掉方向）连通 ⇒ <span class="ft hot-blue hot">弱连通</span>；但 A、C 互不可达',
          badge: "弱连通", tone: "blue", viz: "connkind",
          text: "擦掉箭头后 A–B–C–D 连成一片，所以 D₁ <b>弱连通</b>。可是金色的 A 与 C：A 到不了 C，C 也到不了 A——任何一个方向都不通，所以它<b>不是单向连通</b>。"
        },
        {
          name: "单向连通",
          graph: "dig", path: [0, 1, 2, 3],
          formula: '任意两点<span class="ft hot">至少一个方向可达</span> ⇒ 单向连通；A→B→C→D 经过全部顶点',
          badge: "单向连通", tone: "gold", viz: "connkind",
          text: "D₂ 中任取两点，总有一个能到另一个（例如 D 虽回不去，但 A、B、C 都能到 D），所以 D₂ <b>单向连通</b>。判定定理：单向连通 ⟺ 存在经过每个顶点至少一次的通路（编号所示）。"
        },
        {
          name: "强连通",
          graph: "digStrong", path: [0, 1, 2, 3, 0],
          formula: '加上 D→A 后：任意两点<span class="ft hot">互相可达</span> ⇒ 强连通',
          badge: "强连通 ✓", tone: "", viz: "connkind",
          text: "加一条 D→A，回路 A→B→C→D→A 经过了每个顶点——任意两点<b>互相可达</b>，这才是<b>强连通</b>。判定定理：强连通 ⟺ 存在经过每个顶点至少一次的回路。强连通 ⇒ 单向连通 ⇒ 弱连通。"
        },
        {
          name: "强连通分量",
          graph: "dig", groups: [[0, 1, 2], [3]], groupLabel: "强连通分量",
          formula: '互相可达是等价关系 ⇒ D₂ 的强连通分量：<span class="ft hot-green hot">{A,B,C}</span> 与 <span class="ft hot-blue hot">{D}</span>',
          badge: "SCC", tone: "blue", viz: "sccview",
          text: "有向图中“互相可达”是等价关系，每个等价类导出的子图叫<b>强连通分量</b>。D₂ 中 A、B、C 在同一个有向圈上，彼此互达；D 只进不出，单独成为一个分量。"
        },
        {
          name: "判定方法",
          graph: "net6",
          formula: '连通分支：<span class="ft hot-blue hot">BFS/DFS</span> 逐块扩散；强连通：原图与反向图各做一次遍历',
          badge: "算法", tone: "blue",
          text: "工程判定全靠遍历：无向图从任一未访问点 BFS，每启动一次就多一个分支；有向图从某点 v 出发在原图和“所有边反向”的图上各遍历一次，两次都覆盖全部顶点 ⟺ 强连通。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "把连通性迁移到工程：爬虫遍历网页图、强连通分量缩点与死锁检测。",
      badge: "遍历 / 缩点 / 死锁",
      steps: [
        {
          name: "爬虫 = 可达集",
          graph: "web", path: [0, 1, 2, 3, 4],
          formula: '从种子页 A 出发，爬虫能抓到的页面 = <span class="ft hot">A 的可达集</span>',
          badge: "BFS 抓取", tone: "", viz: "reachset",
          text: "网页是顶点、超链接是有向边。爬虫从种子页沿链接层层扩散——抓取范围恰是<b>可达集</b>。编号是一条抓取路线。"
        },
        {
          name: "蝴蝶结结构",
          graph: "web", groups: [[0, 1, 2], [3], [4, 5, 6], [7]], groupLabel: "SCC",
          formula: '<span class="ft hot-green hot">IN 区</span> → <span class="ft hot-blue hot">核心强连通分量</span> → OUT 区',
          badge: "Bow-tie", tone: "gold", viz: "sccview",
          text: "大规模网页图的宏观结构常被描述为“蝴蝶结”：中间是一个巨大的强连通核心，一侧是只能<b>流入</b>核心的 IN 区，另一侧是只能从核心<b>流出</b>的 OUT 区。本例把 {E,F,G} 当作核心，{A,B,C}、D 在 IN 区，H 在 OUT 区。"
        },
        {
          name: "缩点成 DAG",
          graph: "web", groups: [[0, 1, 2], [3], [4, 5, 6], [7]], groupLabel: "SCC",
          formula: '每个强连通分量收缩为一点 ⇒ <span class="ft hot">缩点图必无有向回路（DAG）</span>',
          badge: "缩点", tone: "blue", viz: "condense",
          text: "把每个强连通分量“捏”成一个超点：{A,B,C}→{D}→{E,F,G}→{H} 排成一条<b>无环链</b>。缩点后可以做拓扑排序——编译顺序、任务依赖分析都靠它。"
        },
        {
          name: "死锁检测",
          graph: "deadlock", path: [0, 1, 2, 0],
          formula: '等待图中存在<span class="ft hot">有向回路 P₁→P₂→P₃→P₁</span> ⇒ 这些进程死锁',
          badge: "死锁 !", tone: "red", viz: "deadlockcheck",
          text: "P₁ 等 P₂、P₂ 等 P₃、P₃ 又等 P₁——<b>循环等待</b>，谁也动不了。在每类资源只有一个实例时，等待图中有回路 ⟺ 死锁；检测就是找<b>含 2 个以上顶点的强连通分量</b>。P₄ 只是在排队，不在环上。"
        },
        {
          name: "线性时间算法",
          graph: "web", groups: [[0, 1, 2], [3], [4, 5, 6], [7]], groupLabel: "SCC",
          formula: 'Tarjan / Kosaraju 求全部强连通分量：<span class="ft hot">O(|V|+|E|)</span>',
          badge: "O(V+E)", tone: "blue", viz: "sccview",
          text: "海量网页、成千上万个进程也不怕：Tarjan 算法做一遍 DFS、Kosaraju 算法做两遍 DFS，都能在<b>线性时间</b>内切出全部强连通分量。"
        },
        {
          name: "迁移总结",
          graph: "web",
          formula: '<span class="ft hot">爬虫 = 可达集，缩点 = 降维，死锁 = 找回路</span>',
          badge: "迁移", tone: "gold", viz: "transferlist",
          text: "连通性三件套落地三大场景：搜索引擎抓取、依赖分析（编译顺序、服务调用拓扑）、操作系统死锁检测。<b>把“道路是否畅通”算清楚，系统才能行稳致远。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, hasEdge, reachable, distances, componentGroups, componentsCount, isStronglyConnected, isUnilateral, isWeaklyConnected, sccGroups, walkClassify, reduceWalk };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.CONN_LEVEL] || LEVELS.basic;
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
  let speed = 1800;
  const C = {
    node: "#d63b1d", cur: "#ffb400", ok: "#1f9d55",
    edge: "rgba(107,74,56,0.5)", edgeDim: "rgba(107,74,56,0.16)", edgeHot: "#d63b1d", edgeOk: "#1f9d55",
    text: "#fff", curText: "#2c1810", ring: "#fff8ec"
  };
  const GROUP_COLORS = ["#1f9d55", "#6b4a38", "#c58a1f", "#2c1810"];
  const GROUP_CLASS = ["lg-g0", "lg-g1", "lg-g2", "lg-g3"];

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  }

  if (missionEl) missionEl.innerHTML = "<b>互动任务：</b>" + esc(level.mission);
  if (badgeEl) badgeEl.textContent = level.badge;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(240, Math.floor(rect.width));
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
  function drawArrowHead(x, y, ang, color) {
    const L = 11;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - L * Math.cos(ang - Math.PI / 7), y - L * Math.sin(ang - Math.PI / 7));
    ctx.lineTo(x - L * Math.cos(ang + Math.PI / 7), y - L * Math.sin(ang + Math.PI / 7));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  function nodeGroup(st, i) {
    if (!st.groups) return -1;
    for (let g = 0; g < st.groups.length; g++) if (st.groups[g].indexOf(i) >= 0) return g;
    return -1;
  }
  function draw() {
    const size = resize();
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    const R = size.w < 420 ? 17 : 19;
    const padX = 48, padTop = 70, padBot = 58;
    const P = g.nodes.map(nd => ({
      x: padX + nd.x * (size.w - 2 * padX),
      y: padTop + nd.y * (size.h - padTop - padBot)
    }));
    const ps = pathSteps(st);
    const pathColor = st.pathOk ? C.edgeOk : C.edgeHot;
    const hlNodes = new Set(st.nodes || (st.path ? st.path : []));
    const anyHl = hlNodes.size > 0 || ps.length > 0;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    g.edges.forEach(e => {
      const onPath = ps.some(p => (p.u === e[0] && p.v === e[1]) || (!g.directed && p.u === e[1] && p.v === e[0]));
      const ga = nodeGroup(st, e[0]);
      const grp = st.groups && ga >= 0 && ga === nodeGroup(st, e[1]) ? ga : -1;
      let color = C.edge;
      if (onPath) color = pathColor;
      else if (grp >= 0) color = GROUP_COLORS[grp % GROUP_COLORS.length];
      else if (ps.length || st.groups) color = C.edgeDim;
      ctx.strokeStyle = color;
      ctx.lineWidth = onPath ? 4 : grp >= 0 ? 3 : 2.2;
      const a = P[e[0]], b = P[e[1]];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const sx = a.x + Math.cos(ang) * R, sy = a.y + Math.sin(ang) * R;
      const ex = b.x - Math.cos(ang) * R, ey = b.y - Math.sin(ang) * R;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      if (g.directed) drawArrowHead(ex, ey, ang, color);
    });

    // 步序标号（同一条边重复经过时沿边错开）
    const occ = {};
    ps.forEach(p => {
      const key = Math.min(p.u, p.v) + "-" + Math.max(p.u, p.v);
      occ[key] = (occ[key] || 0);
      const a = P[p.u], b = P[p.v];
      const t = 0.5 + (occ[key] % 2 === 0 ? -1 : 1) * 0.13 * Math.ceil(occ[key] / 2);
      occ[key]++;
      const mx = a.x + (b.x - a.x) * t, my = a.y + (b.y - a.y) * t;
      ctx.beginPath();
      ctx.arc(mx, my, 11, 0, Math.PI * 2);
      ctx.fillStyle = C.cur;
      ctx.fill();
      ctx.strokeStyle = C.ring;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = C.curText;
      ctx.font = "800 11px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(p.idx), mx, my);
    });

    // 顶点
    P.forEach((p, i) => {
      const hot = hlNodes.has(i);
      const grp = nodeGroup(st, i);
      ctx.beginPath();
      ctx.arc(p.x, p.y, hot ? R + 2 : R, 0, Math.PI * 2);
      let fill = C.node, txt = C.text;
      if (grp >= 0) fill = GROUP_COLORS[grp % GROUP_COLORS.length];
      else if (hot) { fill = st.pathOk ? C.ok : C.cur; txt = st.pathOk ? C.text : C.curText; }
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = C.ring;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = txt;
      ctx.font = "800 " + (g.names[i].length > 2 ? 10 : 13) + "px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y);
    });

    // 起终点徽标
    if (st.path && st.path.length) {
      const s = P[st.path[0]], t = P[st.path[st.path.length - 1]];
      ctx.font = "700 12px 'Noto Serif SC', 'Microsoft YaHei', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = C.ok;
      ctx.fillText(st.path[0] === st.path[st.path.length - 1] ? "起/终" : "起", s.x, s.y - R - 8);
      if (st.path[0] !== st.path[st.path.length - 1]) {
        ctx.fillStyle = C.edgeHot;
        ctx.fillText("终", t.x, t.y - R - 8);
      }
    }

    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(g.caption, size.w / 2, size.h - 18);
  }

  /* ---- 舞台图例 ---- */
  function renderLegend(st) {
    const board = canvas.parentNode;
    if (!board) return;
    let lg = board.querySelector(".graph-legend");
    if (!lg) {
      lg = document.createElement("div");
      lg.className = "graph-legend";
      lg.setAttribute("aria-hidden", "true");
      board.appendChild(lg);
    }
    const g = GRAPHS[st.graph];
    const items = [];
    if (st.groups) {
      st.groups.forEach((gr, k) => items.push('<span><i class="lg-node ' + GROUP_CLASS[k % 4] + '"></i>' +
        esc(st.groupLabel || "分组") + ' {' + gr.map(i => g.names[i]).join(",") + '}</span>'));
    } else {
      items.push('<span><i class="lg-node"></i>顶点</span>');
      if (st.path && !st.pathOk) items.push('<span><i class="lg-node lg-cur"></i>途经顶点 / 步序</span><span><i class="lg-edge lg-hot"></i>所走的边</span>');
      if (st.pathOk) items.push('<span><i class="lg-node lg-ok"></i>结果通路顶点</span><span><i class="lg-edge lg-res"></i>结果通路</span>');
      if (st.nodes && !st.path) items.push('<span><i class="lg-node lg-cur"></i>本步关注</span>');
      items.push('<span><i class="lg-edge"></i>' + (g.directed ? "有向边" : "边") + '</span>');
    }
    lg.innerHTML = items.join("");
  }

  /* ---- 辅助可视化 ---- */
  function seqName(g, path) { return path.map(i => g.names[i]).join("→"); }
  function classifyLine(g, path) {
    const r = walkClassify(path, g.edges, g.directed);
    if (!r.valid) return "不是通路";
    const kind = r.closed
      ? (r.verticesDistinct ? "初级回路（圈）" : r.edgesDistinct ? "简单回路" : "回路（有重复边，称复杂回路）")
      : (r.verticesDistinct ? "初级通路（路径）" : r.edgesDistinct ? "简单通路" : "通路（有重复边，称复杂通路）");
    return "长度 " + r.length + "，" + (r.closed ? "闭" : "开") + "，边" + (r.edgesDistinct ? "不重复" : "有重复") +
      "，顶点" + (r.verticesDistinct ? "不重复" : "有重复") + " ⇒ <b>" + kind + "</b>";
  }
  function classifyHtml(st) {
    const g = GRAPHS[st.graph];
    return '<div class="graph-summary"><b>程序判定 ' + seqName(g, st.path) + '：</b>' + classifyLine(g, st.path) + '。</div>';
  }
  function reduceHtml() {
    const g = GRAPHS.walkG;
    const walk = [0, 1, 2, 0, 1, 3];
    const red = reduceWalk(walk);
    return '<div class="graph-summary"><b>化简前后：</b><div class="pill-row">' +
      '<span class="pill">' + seqName(g, walk) + '：' + classifyLine(g, walk).replace(/<\/?b>/g, "") + '</span>' +
      '<span class="pill">' + seqName(g, red) + '：' + classifyLine(g, red).replace(/<\/?b>/g, "") + '</span></div>' +
      '做法：沿通路前进，一旦回到走过的顶点，就把中间那段回路整段删去。</div>';
  }
  function hierarchyHtml() {
    const g = GRAPHS.walkG;
    const rows = [[0, 1, 2, 0, 1], [1, 0, 2, 1, 3], [0, 1, 3, 4], [1, 2, 3, 1]].map(p =>
      '<span class="pill">' + seqName(g, p) + '：' + classifyLine(g, p).split("⇒ ")[1].replace(/<\/?b>/g, "") + '</span>').join("");
    return '<div class="graph-summary"><b>本页走过的例子：</b><div class="pill-row">' + rows + '</div>' +
      '定理：n 阶图中若 u 到 v（u ≠ v）有通路，则必有长度 ≤ n−1 的初级通路；若有过 v 的回路，则必有长度 ≤ n 的初级回路。</div>';
  }
  function distHtml(g) {
    const d = distances(g.nodes.length, g.edges, 0);
    const rows = g.names.map((nm, i) => '<span class="pill">d(A,' + nm + ') = ' + d[i] + '</span>').join("");
    return '<div class="graph-summary"><b>从 A 出发 BFS 求距离：</b><div class="pill-row">' + rows + '</div>全部有限 ⇒ A 与每个顶点都连通。</div>';
  }
  function conncheckHtml(g) {
    const c = componentsCount(g.nodes.length, g.edges);
    return '<div class="graph-summary"><b>连通性检查：</b>从 A 做一次 BFS 即到达全部 ' + g.nodes.length + ' 个顶点，连通分支数 p(G) = ' + c +
      (c === 1 ? ' ⇒ <b class="ok-text">连通图</b>。' : ' ⇒ 非连通。') + '</div>';
  }
  function compcheckHtml(g) {
    const groups = componentGroups(g.nodes.length, g.edges);
    const rows = groups.map(gr => '<span class="pill">{' + gr.map(i => g.names[i]).join(",") + '}</span>').join("");
    return '<div class="graph-summary"><b>BFS 逐块扩散：</b><div class="pill-row">' + rows + '</div>共启动 ' + groups.length +
      ' 次 BFS ⇒ 连通分支数 p(G) = <b>' + groups.length + '</b>。</div>';
  }
  function connkindHtml(g) {
    const n = g.nodes.length;
    const s = isStronglyConnected(n, g.edges), u = isUnilateral(n, g.edges), w = isWeaklyConnected(n, g.edges);
    const mark = b => b ? '<b class="ok-text">✓</b>' : '<b class="bad-text">✗</b>';
    const kind = s ? "强连通图" : u ? "单向连通图（非强连通）" : w ? "弱连通图（非单向连通）" : "非连通";
    return '<div class="graph-summary"><b>三种连通性判定（程序计算可达矩阵）：</b>强连通 ' + mark(s) + '　单向连通 ' + mark(u) + '　弱连通 ' + mark(w) +
      ' ⇒ <b>' + kind + '</b>。</div>';
  }
  function sccviewHtml(g) {
    const groups = sccGroups(g.nodes.length, g.edges);
    const rows = groups.map(gr => '<span class="pill">{' + gr.map(i => g.names[i]).join(",") + '}</span>').join("");
    return '<div class="graph-summary"><b>强连通分量（程序求出 ' + groups.length + ' 个）：</b><div class="pill-row">' + rows +
      '</div>同一分量内任意两点互相可达；不同分量之间最多单向可达。</div>';
  }
  function condenseHtml(g) {
    const groups = sccGroups(g.nodes.length, g.edges);
    const idx = Array(g.nodes.length);
    groups.forEach((gr, k) => gr.forEach(i => { idx[i] = k; }));
    const arcs = [];
    g.edges.forEach(e => {
      const a = idx[e[0]], b = idx[e[1]];
      if (a !== b && !arcs.some(x => x[0] === a && x[1] === b)) arcs.push([a, b]);
    });
    const nm = k => "{" + groups[k].map(i => g.names[i]).join(",") + "}";
    return '<div class="graph-summary"><b>缩点图：</b><div class="pill-row">' +
      arcs.map(a => '<span class="pill">' + nm(a[0]) + ' → ' + nm(a[1]) + '</span>').join("") +
      '</div>' + groups.length + ' 个超点、' + arcs.length + ' 条弧，没有有向回路 ⇒ DAG，可拓扑排序。</div>';
  }
  function reachsetHtml(g) {
    const r = reachSet(g.nodes.length, g.edges, true, 0);
    const got = g.names.filter((_, i) => r[i]);
    return '<div class="graph-summary"><b>A 的可达集：</b>{' + got.join(", ") + '}，共 ' + got.length + ' 个页面' +
      (got.length === g.nodes.length ? '——种子页 A 能抓到全部页面。' : '。') + '若把种子换成 E，只能抓到 {E, F, G, H}。</div>';
  }
  function deadlockHtml(g) {
    const groups = sccGroups(g.nodes.length, g.edges);
    const cyc = groups.filter(x => x.length > 1);
    return '<div class="graph-summary"><b>死锁判定：</b>' +
      (cyc.length ? '含 2 个以上顶点的强连通分量 {' + cyc[0].map(i => g.names[i]).join(", ") + '} ⇒ <b class="bad-text">存在循环等待（死锁）</b>。常见处理：终止环上一个进程或抢占其资源。' : "无有向回路 ⇒ 无死锁。") + '</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">搜索引擎：可达集抓取</span><span class="pill">编译 / 服务依赖：缩点 DAG 排序</span><span class="pill">操作系统：等待图找回路</span></div>' +
      '连通性是一切“网络畅通”问题的底层数学。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const g = GRAPHS[st.graph];
    let html = "";
    switch (st.viz) {
      case "classify": html = classifyHtml(st); break;
      case "reduce": html = reduceHtml(); break;
      case "hierarchy": html = hierarchyHtml(); break;
      case "dist": html = distHtml(g); break;
      case "conncheck": html = conncheckHtml(g); break;
      case "compcheck": html = compcheckHtml(g); break;
      case "connkind": html = connkindHtml(g); break;
      case "sccview": html = sccviewHtml(g); break;
      case "condense": html = condenseHtml(g); break;
      case "reachset": html = reachsetHtml(g); break;
      case "deadlockcheck": html = deadlockHtml(g); break;
      case "transferlist": html = transferHtml(); break;
      default: html = "";
    }
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
    renderLegend(st);
    draw();
    Array.prototype.forEach.call(document.querySelectorAll(".step-item"), (el, i) => {
      el.classList.toggle("active", i === step);
      el.classList.toggle("done", i < step);
      if (i === step) el.setAttribute("aria-current", "step"); else el.removeAttribute("aria-current");
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
  function startTimer() {
    if (playTimer) clearInterval(playTimer);
    playTimer = setInterval(() => {
      if (step >= level.steps.length - 1) { stopPlay(); return; }
      go(step + 1);
    }, speed);
  }
  function togglePlay() {
    const b = document.getElementById("playBtn");
    if (playTimer) { stopPlay(); return; }
    if (step === level.steps.length - 1) go(0);
    if (b) { b.classList.add("playing"); b.textContent = "⏸ 暂停"; }
    startTimer();
  }

  /* ---- 构建控件 ---- */
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
          '<button type="button" class="step-btn" id="resetBtn">↺ 重置</button>' +
          '<label class="speed-row" for="speedSel"><span>播放速度</span>' +
            '<select id="speedSel"><option value="2800">慢</option><option value="1800" selected>中</option><option value="1000">快</option></select>' +
          '</label>' +
        '</div>' +
      '</div>' +
      '<div class="step-list">' + listItems + '</div>';

    document.getElementById("prevBtn").addEventListener("click", () => { stopPlay(); go(step - 1); });
    document.getElementById("nextBtn").addEventListener("click", () => { stopPlay(); go(step + 1); });
    document.getElementById("playBtn").addEventListener("click", togglePlay);
    document.getElementById("resetBtn").addEventListener("click", () => { stopPlay(); go(0); });
    document.getElementById("speedSel").addEventListener("change", ev => {
      speed = Number(ev.target.value) || 1800;
      if (playTimer) startTimer();
    });
    Array.prototype.forEach.call(document.querySelectorAll(".step-item"), el => {
      el.addEventListener("click", () => { stopPlay(); go(Number(el.dataset.i)); });
    });
  }

  buildControls();
  renderStep();
  window.addEventListener("resize", draw);
})();
