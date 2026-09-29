/* ============================================================
   7.4 几种典型的图 · 三层统一交互引擎（每步切换典型图 + 左栏信息卡）
   window.TYPICAL_LEVEL = "basic" | "advanced" | "extend"
   交互：上一步 / 下一步 / 自动播放（可调速）/ 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   左栏 #sideInfo：定义与性质 + 当前属性 |V|/|E|
   全章统一配色：普通顶点=主红白字，本步关注=金，结果=绿；普通边=淡褐灰细线，高亮边=主红加粗，
   结果边=绿加粗，去掉的边=灰虚线；二部图两部分用 主红 / 次墨 区分。
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  function degrees(n, edges) {
    const deg = Array(n).fill(0);
    edges.forEach(e => { deg[e[0]]++; deg[e[1]]++; });
    return deg;
  }
  // k-正则返回 k，否则 -1
  function regularK(n, edges) {
    const d = degrees(n, edges);
    return d.every(x => x === d[0]) ? d[0] : -1;
  }
  function completeEdges(n) { return n * (n - 1) / 2; }
  function hasEdge(edges, u, v) {
    return edges.some(e => (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u));
  }
  // 生成 Kn 边集
  function knEdges(n) {
    const es = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) es.push([i, j]);
    return es;
  }
  // 完全二部图 K_{m,n}：前 m 个点为 X，后 n 个点为 Y
  function kmnEdges(m, n) {
    const es = [];
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) es.push([i, m + j]);
    return es;
  }
  // Qk 超立方体：顶点=k 位二进制，恰差一位相邻
  function qkEdges(k) {
    const es = [];
    const N = 1 << k;
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const x = i ^ j;
      if (x && (x & (x - 1)) === 0) es.push([i, j]);
    }
    return es;
  }
  // 竞赛图检查：每对顶点恰有一条有向边
  function isTournament(n, dirEdges) {
    if (dirEdges.length !== n * (n - 1) / 2) return false;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const f = dirEdges.filter(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i)).length;
      if (f !== 1) return false;
    }
    return true;
  }
  // 匹配合法性：边都存在且顶点两两不重复
  function isMatching(edges, M) {
    const used = new Set();
    for (const m of M) {
      if (!hasEdge(edges, m[0], m[1])) return false;
      if (used.has(m[0]) || used.has(m[1])) return false;
      used.add(m[0]); used.add(m[1]);
    }
    return true;
  }
  function complementEdges(n, edges) {
    const es = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++)
      if (!hasEdge(edges, i, j)) es.push([i, j]);
    return es;
  }
  // 二部图判定（沿 DFS 交替二染色）：返回 {ok, parts:[X,Y]} 或 {ok:false, conflict:[u,v]}
  function bipartition(n, edges) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
    adj.forEach(a => a.sort((x, y) => x - y));
    const col = Array(n).fill(-1);
    let conflict = null;
    function dfs(u) {
      for (const v of adj[u]) {
        if (conflict) return;
        if (col[v] < 0) { col[v] = 1 - col[u]; dfs(v); }
        else if (col[v] === col[u]) { conflict = [u, v]; return; }
      }
    }
    for (let s = 0; s < n && !conflict; s++) if (col[s] < 0) { col[s] = 0; dfs(s); }
    if (conflict) return { ok: false, conflict };
    const X = [], Y = [];
    col.forEach((c, i) => (c === 0 ? X : Y).push(i));
    return { ok: true, parts: [X, Y] };
  }
  // Hall 条件逐子集检查：X 为左部顶点下标
  function hallCheck(edges, X) {
    const rows = [];
    for (let mask = 1; mask < (1 << X.length); mask++) {
      const S = X.filter((_, i) => mask & (1 << i));
      const N = new Set();
      S.forEach(u => edges.forEach(e => {
        if (e[0] === u) N.add(e[1]); else if (e[1] === u) N.add(e[0]);
      }));
      rows.push({ S, N: Array.from(N).sort((a, b) => a - b), ok: N.size >= S.length });
    }
    return rows;
  }

  /* ---------------- 图库 ---------------- */
  function ring(n, r, cx, cy) {
    return Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
  }
  const AZ = "ABCDEFGHIJ".split("");
  const c5Edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]];
  const c6Edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]];
  const GRAPHS = {
    k4: { names: AZ.slice(0, 4), caption: "完全图 K₄", nodes: ring(4, .42, .5, .5), edges: knEdges(4) },
    k6: { names: AZ.slice(0, 6), caption: "完全图 K₆", nodes: ring(6, .45, .5, .5), edges: knEdges(6) },
    c5: { names: AZ.slice(0, 5), caption: "圈图 C₅", nodes: ring(5, .44, .5, .52), edges: c5Edges },
    c6: { names: AZ.slice(0, 6), caption: "圈图 C₆", nodes: ring(6, .44, .5, .5), edges: c6Edges },
    c5comp: {
      names: AZ.slice(0, 5), caption: "C₅ 的补图（五角星）",
      nodes: ring(5, .44, .5, .52), edges: complementEdges(5, c5Edges)
    },
    prism: {
      names: AZ.slice(0, 6), caption: "三棱柱图（3-正则）",
      nodes: [{x:.5,y:0},{x:.94,y:1},{x:.06,y:1},{x:.5,y:.36},{x:.7,y:.74},{x:.3,y:.74}],
      edges: [[0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[0,3],[1,4],[2,5]]
    },
    wheel6: {
      names: ["O", "A", "B", "C", "D", "E"], caption: "6 阶轮图 W₆（轮缘 C₅ + 轮心 O）",
      nodes: [{ x: .5, y: .52 }].concat(ring(5, .46, .5, .52)),
      edges: [[1,2],[2,3],[3,4],[4,5],[5,1],[0,1],[0,2],[0,3],[0,4],[0,5]]
    },
    tour5: {
      names: AZ.slice(0, 5), caption: "5 阶竞赛图（K₅ 每边定向）", directed: true,
      nodes: ring(5, .44, .5, .52),
      edges: [0,1,2,3,4].flatMap(i => [[i,(i+1)%5],[i,(i+2)%5]])
    },
    petersen: {
      names: ["0","1","2","3","4","5","6","7","8","9"], caption: "彼得森图（10 点 15 边，3-正则）",
      nodes: ring(5, .48, .5, .52).concat(ring(5, .22, .5, .52)),
      edges: [0,1,2,3,4].map(i => [i,(i+1)%5])
        .concat([0,1,2,3,4].map(i => [i, i+5]))
        .concat([0,1,2,3,4].map(i => [5+i, 5+(i+2)%5]))
    },
    q3: {
      names: ["000","001","011","010","100","101","111","110"], caption: "3 维立方体图 Q₃（顶点 = 3 位二进制串）",
      nodes: [
        {x:.2,y:.36},{x:.6,y:.36},{x:.6,y:1},{x:.2,y:1},
        {x:.4,y:0},{x:.8,y:0},{x:.8,y:.64},{x:.4,y:.64}
      ],
      // 按 names 的二进制值建边：恰差一位相邻
      edges: (function () {
        const vals = [0,1,3,2,4,5,7,6];
        const es = [];
        for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
          const x = vals[i] ^ vals[j];
          if (x && (x & (x - 1)) === 0) es.push([i, j]);
        }
        return es;
      })()
    },
    bip: {
      names: ["甲", "乙", "丙", "T₁", "T₂", "T₃"], caption: "二部图：员工 X —— 任务 Y",
      nodes: [
        {x:.14,y:.05},{x:.14,y:.5},{x:.14,y:.95},
        {x:.86,y:.05},{x:.86,y:.5},{x:.86,y:.95}
      ],
      edges: [[0,3],[0,4],[1,3],[1,5],[2,5]]
    },
    k33: {
      names: ["x₁", "x₂", "x₃", "y₁", "y₂", "y₃"], caption: "完全二部图 K₃,₃",
      nodes: [
        {x:.2,y:.05},{x:.5,y:.05},{x:.8,y:.05},
        {x:.2,y:.95},{x:.5,y:.95},{x:.8,y:.95}
      ],
      edges: kmnEdges(3, 3)
    },
    k24: {
      names: ["S₁", "S₂", "L₁", "L₂", "L₃", "L₄"], caption: "两层交换拓扑 K₂,₄（Spine—Leaf）",
      nodes: [
        {x:.32,y:.05},{x:.68,y:.05},
        {x:.06,y:.95},{x:.36,y:.95},{x:.64,y:.95},{x:.94,y:.95}
      ],
      edges: kmnEdges(2, 4)
    }
  };

  /* ---------------- 三层步骤数据 ----------------
     每步：graph 选图；nodes/edges 本步关注（金点/红边）；okEdges 结果边（绿）；ghostEdges 去掉的边（灰虚线）；
     parts 二部图两部分着色；icon/defText 渲染左栏信息卡 */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "从 K₄ 数到 K₆，验证边数公式 n(n−1)/2，再认识“各点同度”的正则图与边数公式 nk/2。",
      badge: "Kₙ 与正则图",
      steps: [
        {
          name: "完全图 K₄", graph: "k4", icon: "🌟",
          formula: 'K₄：任意两点都相邻，|E| = <span class="ft hot">4×3/2 = 6</span>',
          badge: "K₄", tone: "",
          defText: "任意两个不同顶点之间都恰有一条边的 n 阶简单图称为 n 阶完全图，记作 Kₙ。",
          text: "4 个人两两握手：每个点都连向其余 3 个点。数一数，恰好 <b>6</b> 条边——这就是完全图 K₄，“人人互联”的最紧密结构。"
        },
        {
          name: "升级到 K₆", graph: "k6", icon: "🌟",
          formula: '|E(K₆)| = C(6,2) = <span class="ft hot">6×5/2 = 15</span>',
          badge: "15 条边", tone: "blue",
          defText: "Kₙ 的边数 = C(n,2) = n(n−1)/2：每一对顶点恰好贡献一条边，随 n 呈平方级增长。",
          text: "顶点从 4 涨到 6，边数从 6 涨到 <b>15</b>——完全互联的成本是<b>平方级</b>的。这就是大网络不可能“人人直连”的原因。"
        },
        {
          name: "每点度数 n−1", graph: "k6", icon: "🌟",
          nodes: [0], edges: [[0,1],[0,2],[0,3],[0,4],[0,5]],
          formula: 'K₆ 中每点 deg(v) = <span class="ft hot">n−1 = 5</span>',
          badge: "deg=5", tone: "", viz: "degtable",
          defText: "完全图中每个顶点都与其余 n−1 个顶点相邻。",
          text: "看金色顶点 A：它的 <b>5</b> 条红色边连向其余每个点。每个点都一样——这种“各点同度”的性质，引出下一个概念：<b>正则图</b>。"
        },
        {
          name: "正则图：各点同度", graph: "c5", icon: "⚖️",
          formula: 'C₅ 每点 deg = 2  ⇒  <span class="ft hot-green hot">2-正则图</span>',
          badge: "2-正则", tone: "", viz: "regular",
          defText: "每个顶点度数都等于 k 的无向简单图称为 k-正则图。",
          text: "圈图 C₅ 每个点恰好 2 条边，谁也不多谁也不少——<b>2-正则</b>。正则图里没有“特权节点”，负载天然均衡。"
        },
        {
          name: "3-正则：三棱柱", graph: "prism", icon: "⚖️",
          formula: '每点 deg=3 ⇒ 3-正则；|E| = <span class="ft hot">nk/2 = 6×3/2 = 9</span>',
          badge: "3-正则", tone: "blue", viz: "regular",
          defText: "k-正则图的边数 = nk/2（由握手定理：度数之和 nk = 2|E|）。因此 nk 必为偶数。",
          text: "三棱柱图：外三角 + 内三角 + 三条竖边，每点恰 3 条边。握手定理心算边数：6×3/2 = <b>9</b> ✓。由 nk 必为偶数还可知：<b>不存在 5 阶 3-正则图</b>。"
        },
        {
          name: "Kₙ 是 (n−1)-正则", graph: "k6", icon: "🌟",
          formula: 'Kₙ 是 <span class="ft hot">(n−1)-正则图</span>：nk/2 = 6×5/2 = 15 = n(n−1)/2',
          badge: "特例", tone: "gold", viz: "regular",
          defText: "完全图是正则图的特例：Kₙ 是 (n−1)-正则图，两个边数公式在此重合。",
          text: "把两个概念连起来：K₆ 每点度 5，所以它是 <b>5-正则图</b>；用 nk/2 算出的 15 与 n(n−1)/2 完全一致。概念之间也有“结构”。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "逐一识别二部图、完全二部图、补图、圈图、轮图、竞赛图、立方体图与彼得森图，核对各自的阶数、边数与判定特征。",
      badge: "典型图图鉴",
      steps: [
        {
          name: "二部图", graph: "bip", icon: "🤝",
          parts: [[0,1,2],[3,4,5]],
          formula: 'V = X ∪ Y，X ∩ Y = ∅，<span class="ft hot">每条边一端在 X、一端在 Y</span>',
          badge: "两分", tone: "blue", viz: "bipcheck",
          defText: "若无向图的顶点集能划分为 X、Y 两部分，使每条边的两个端点分属 X 与 Y，则称为二部图（偶图），记作 ⟨X, E, Y⟩。",
          text: "左边红色是员工 X、右边褐色是任务 Y，每条边都<b>跨越两部</b>，同部之间没有边——<b>二部图</b>刻画“供—需”“人—岗”之类的配对关系。"
        },
        {
          name: "偶圈可两分", graph: "c6", icon: "🎨",
          parts: [[0,2,4],[1,3,5]],
          formula: 'C₆：A,C,E ∈ X，B,D,F ∈ Y，<span class="ft hot-green hot">交替染色成功 ⇒ 二部图</span>',
          badge: "二部 ✓", tone: "", viz: "bipcheck",
          defText: "判定方法：从任一点出发沿边交替染两种颜色（DFS/BFS 二染色），若无相邻同色即为二部图。",
          text: "沿 C₆ 交替染色：红、褐、红、褐……走一圈回到 A 时颜色恰好对上——<b>偶圈可以两分</b>。"
        },
        {
          name: "奇圈不可两分", graph: "c5", icon: "⛔",
          parts: [[0,2,4],[1,3]], nodes: [0, 4], edges: [[4, 0]],
          formula: 'C₅：A,C,E 染同色，但 <span class="ft hot">E–A 相邻 ⇒ 矛盾</span>；二部图 ⟺ 无奇圈',
          badge: "二部 ✗", tone: "red", viz: "bipcheck",
          defText: "定理（柯尼希）：n（n ≥ 2）阶无向图 G 是二部图，当且仅当 G 中无长度为奇数的圈。",
          text: "在 C₅ 上交替染色，第 5 个点 E 与起点 A 被迫同色，而 E–A 恰有一条边（红色）——<b>奇圈无法两分</b>。判定口诀：<b>无奇圈 ⟺ 二部图</b>。"
        },
        {
          name: "完全二部图 Kₘ,ₙ", graph: "k33", icon: "🔀",
          parts: [[0,1,2],[3,4,5]],
          formula: 'K₃,₃：X 中每点与 Y 中每点都相邻，|E| = <span class="ft hot">m·n = 3×3 = 9</span>',
          badge: "K₃,₃", tone: "blue", viz: "bipcheck",
          defText: "若二部图 ⟨X, E, Y⟩ 中 X 的每个顶点都与 Y 的每个顶点相邻，则称为完全二部图，记作 Kₘ,ₙ（|X| = m，|Y| = n），边数 m·n。",
          text: "上层 3 点、下层 3 点，层间“全连”、层内不连：共 3×3 = <b>9</b> 条边。K₃,₃ 还是第 8 章判定平面图的关键“禁区”之一。"
        },
        {
          name: "补图", graph: "c5comp", icon: "🔄",
          ghostEdges: c5Edges,
          formula: 'G̅：原图的边去掉、原图没有的边补上；<span class="ft hot">|E(G)| + |E(G̅)| = n(n−1)/2</span> = 5 + 5 = 10',
          badge: "自补", tone: "gold", viz: "regular",
          defText: "补图 G̅ 与 G 顶点相同：{u,v} 是 G̅ 的边 ⟺ {u,v} 不是 G 的边。若 G ≅ G̅，则称 G 为自补图。",
          text: "灰色虚线是 C₅ 原有的 5 条边，把它们“取反”得到五角星（实线）——五角星本身又是一个 5 阶圈，与 C₅ 同构，所以 <b>C₅ 是自补图</b>。"
        },
        {
          name: "圈图 Cₙ 与路径 Pₙ", graph: "c6", icon: "🔗",
          ghostEdges: [[5, 0]],
          formula: 'Cₙ：n 点 n 边、2-正则（n ≥ 3）；<span class="ft hot-blue hot">删去一条边得 Pₙ：n 点 n−1 边</span>',
          badge: "Cₙ / Pₙ", tone: "", viz: "degtable",
          defText: "n（n ≥ 3）阶圈图 Cₙ 由 n 个顶点首尾相连成一个圈；n 阶路径 Pₙ 是 n 个顶点依次相连的一条链（n−1 条边）。",
          text: "C₆ 每点度 2、恰好一个圈；剪断 F–A（灰色虚线）就变成路径 P₆，端点 A、F 的度降为 1。圈是“冗余环路”，路径是“单线串联”。"
        },
        {
          name: "轮图 Wₙ", graph: "wheel6", icon: "🎡",
          nodes: [0], edges: [[0,1],[0,2],[0,3],[0,4],[0,5]],
          formula: 'W₆ = C₅ + 轮心：|V| = 6，|E| = <span class="ft hot">2(n−1) = 10</span>；轮心度 5，轮缘各点度 3',
          badge: "W₆", tone: "blue", viz: "degtable",
          defText: "在 n−1（n ≥ 4）阶圈 Cₙ₋₁ 内放一个顶点，使其与圈上所有顶点相邻，得到 n 阶轮图 Wₙ，边数 2(n−1)。（有的教材以 Cₙ 为轮缘记作 Wₙ，此时为 n+1 阶，阅读时注意约定。）",
          text: "金色轮心 O 用 5 条“辐条”连向轮缘 C₅：5 条轮缘边 + 5 条辐条 = <b>10</b> 条边。轮图不是正则图——中心度 5、其余度 3。"
        },
        {
          name: "竞赛图", graph: "tour5", icon: "🏆",
          nodes: [0,1,2,3,4], edges: [[0,1],[1,2],[2,3],[3,4]],
          formula: 'K₅ 每条边定向 ⇒ <span class="ft hot">竞赛图</span>；|E| = C(5,2) = 10；A→B→C→D→E 是哈密顿通路',
          badge: "单循环赛", tone: "red", viz: "score",
          defText: "n 阶竞赛图：基图为 Kₙ 的有向简单图（每对顶点之间恰有一条有向边）；模型是单循环赛。",
          text: "5 支队伍单循环赛：每两队恰赛一场，胜者指向负者。竞赛图必有<b>哈密顿通路</b>（红色 A→B→C→D→E）——总能排出一条“击败链”。"
        },
        {
          name: "立方体图 Qₖ", graph: "q3", icon: "🧊",
          parts: [[0,2,5,7],[1,3,4,6]],
          formula: 'Q₃：<span class="ft hot">恰差一位 ⟺ 相邻</span>；|V| = 2³ = 8，|E| = 3·2² = 12，3-正则',
          badge: "Q₃", tone: "blue", viz: "bipcheck",
          defText: "k 维立方体图 Qₖ：顶点是全部 k 位二进制串，两串恰好一位不同时相邻；|V| = 2ᵏ，|E| = k·2ᵏ⁻¹，是 k-正则图，也是二部图。",
          text: "沿任意一条边走一步，恰好翻转一位。按串中 1 的个数的奇偶把顶点分成两部（红 / 褐），每条边都跨两部——<b>Qₖ 是二部图</b>。"
        },
        {
          name: "彼得森图", graph: "petersen", icon: "⭐",
          edges: [[0,1],[1,2],[2,3],[3,4],[4,0]], nodes: [0,1,2,3,4],
          formula: '10 点 15 边 <span class="ft hot">3-正则</span>，含 5 圈 ⇒ 非二部图；围长 5',
          badge: "反例之星", tone: "gold", viz: "bipcheck",
          defText: "外五边形 + 内五角星 + 五条辐条；高度对称的 3-正则图，最短圈长度（围长）为 5。",
          text: "图论中最著名的“反例明星”：外圈就是一个 5 圈（红色），所以它<b>不是二部图</b>；它还<b>不是哈密顿图</b>，许多看似成立的猜想都栽在它手里。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "把二部图匹配用于任务分配，把立方体图、完全二部图用于数据中心拓扑设计。",
      badge: "匹配 / 拓扑",
      steps: [
        {
          name: "二部图建模", graph: "bip", icon: "🤝",
          parts: [[0,1,2],[3,4,5]],
          formula: '员工 X = {甲,乙,丙}，任务 Y = {T₁,T₂,T₃}，边 = <span class="ft hot">“能胜任”</span>',
          badge: "建模", tone: "",
          defText: "二部图：顶点两分、边只跨部；天然刻画“资源—需求”关系。",
          text: "把“谁能干哪个活”画成二部图：甲会 T₁/T₂，乙会 T₁/T₃，丙只会 T₃。<b>分配问题从此变成图问题</b>。"
        },
        {
          name: "匹配与完美匹配", graph: "bip", icon: "🎯",
          okEdges: [[0,4],[1,3],[2,5]], okNodes: [0,1,2,3,4,5],
          formula: 'M = {<span class="ft hot-green hot">甲–T₂, 乙–T₁, 丙–T₃</span>}：两两不共点 ⇒ 完美匹配',
          badge: "完美匹配", tone: "", viz: "matching",
          defText: "匹配：两两不相邻（不共顶点）的边的集合；饱和全部顶点的匹配称为完美匹配。",
          text: "绿色三条边人人有活、活活有人，互不冲突——<b>完美匹配</b>。“人岗相适”的配置方案，在图论里就是一个边集。"
        },
        {
          name: "Hall 定理", graph: "bip", icon: "📜",
          nodes: [1, 2], edges: [[1,3],[1,5],[2,5]],
          formula: '存在饱和 X 的匹配 ⟺ ∀S ⊆ X：<span class="ft hot">|N(S)| ≥ |S|</span>',
          badge: "Hall 条件", tone: "blue", viz: "hall",
          defText: "Hall 定理：二部图 ⟨X, E, Y⟩ 中存在饱和 X 的匹配，当且仅当 X 的任意 k 个顶点至少与 Y 中 k 个顶点相邻。",
          text: "什么时候一定“配得齐”？<b>任何一组人的可选任务都不比人少</b>。下方逐一检查 X 的 7 个非空子集，例如 S = {乙,丙}（金色）的邻居 {T₁,T₃} 恰为 2 个，条件成立。若甲、乙都只会 T₁，则 |N({甲,乙})| = 1 < 2，必有人落空。"
        },
        {
          name: "数据中心拓扑：Q₃", graph: "q3", icon: "🧊",
          nodes: [0, 6], okEdges: [[0,1],[1,2],[2,6],[0,3],[3,7],[7,6],[0,4],[4,5],[5,6]],
          formula: 'Qₖ：直径 = k = <span class="ft hot">log₂|V|</span>；000 与 111 之间有 3 条内部不相交的通路',
          badge: "超立方", tone: "blue", viz: "regular",
          defText: "Qₖ 用作并行机/集群互连：直径短（k）、k-正则、任两点间有 k 条内部不相交的通路，便于容错与递归扩展。",
          text: "8 台服务器按 Q₃ 连线：任意两台最多 3 跳可达。000 到 111 的 3 条绿色通路<b>除端点外互不相交</b>——断掉任意两条线路，二者仍然连通。"
        },
        {
          name: "Spine–Leaf 拓扑", graph: "k24", icon: "🏗️",
          parts: [[0,1],[2,3,4,5]], nodes: [2, 5], edges: [[0,2],[0,5],[1,2],[1,5]],
          formula: '完全二部图 K₂,₄：任意两台 Leaf 之间 <span class="ft hot">恰好 2 跳</span>，且有 2 条不同路径',
          badge: "K₂,₄", tone: "",
          defText: "数据中心常见的 Spine-Leaf 两层架构可抽象为完全二部图：层内不连、层间全连。",
          text: "上层 Spine、下层 Leaf，跨层全连——正是<b>完全二部图</b>。L₁ 到 L₄（金色）经 S₁ 或 S₂ 都是 2 跳（红色），多条等长路径便于负载均衡。"
        },
        {
          name: "迁移总结", graph: "q3", icon: "🚀",
          formula: '<span class="ft hot">匹配 = 最优配置，典型拓扑 = 容错与带宽</span>',
          badge: "迁移", tone: "gold", viz: "transferlist",
          defText: "典型图是工程系统的“积木”：选对结构，效率、公平与容错才有数学保证。",
          text: "二部图匹配可用于订单与司机、任务与机器的调度；立方体图、完全二部图等拓扑支撑并行计算与数据中心。<b>因地制宜选结构，正是“结构之美、社会之理”的工程落地。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, degrees, regularK, completeEdges, knEdges, kmnEdges, qkEdges, isTournament, isMatching, complementEdges, hasEdge, bipartition, hallCheck };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.TYPICAL_LEVEL] || LEVELS.basic;
  const controls = document.getElementById("controls");
  const canvas = document.getElementById("graphCanvas");
  const formulaText = document.getElementById("formulaText");
  const stepStatus = document.getElementById("stepStatus");
  const vizText = document.getElementById("vizText");
  const missionEl = document.getElementById("missionText");
  const badgeEl = document.getElementById("visualBadge");
  const sideInfo = document.getElementById("sideInfo");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let step = 0;
  let playTimer = null;
  let speed = 1800;
  // 全章统一配色
  const C = {
    node: "#d63b1d", cur: "#ffb400", ok: "#1f9d55", partY: "#6b4a38", dimNode: "#eed8cc",
    edge: "rgba(107,74,56,0.5)", edgeDim: "rgba(107,74,56,0.16)", edgeHot: "#d63b1d", edgeOk: "#1f9d55", gone: "#9a8a80",
    text: "#fff", curText: "#2c1810", dimText: "#9a7a6a", ring: "#fff8ec"
  };

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  }

  if (missionEl) missionEl.innerHTML = "<b>互动任务：</b>" + esc(level.mission);
  if (badgeEl) badgeEl.textContent = level.badge;

  /* ---- 画布 ---- */
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
  function edgeIn(list, e) {
    return (list || []).some(p => (p[0] === e[0] && p[1] === e[1]) || (p[0] === e[1] && p[1] === e[0]));
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
  function partOf(st, i) {
    if (!st.parts) return -1;
    return st.parts[0].indexOf(i) >= 0 ? 0 : st.parts[1].indexOf(i) >= 0 ? 1 : -1;
  }
  function draw() {
    const size = resize();
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    const R = g.nodes.length > 8 ? 16 : (size.w < 420 ? 17 : 19);
    const padX = 48, padTop = 62, padBot = 58;
    const P = g.nodes.map(nd => ({
      x: padX + nd.x * (size.w - 2 * padX),
      y: padTop + nd.y * (size.h - padTop - padBot)
    }));
    const hlNodes = new Set(st.nodes || []);
    const okNodes = new Set(st.okNodes || []);
    const hlEdges = st.edges || [];
    const okEdges = st.okEdges || [];
    const anyHl = hlEdges.length > 0 || okEdges.length > 0;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    function line(a, b, color, width, dash, arrow) {
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const sx = a.x + Math.cos(ang) * R, sy = a.y + Math.sin(ang) * R;
      const ex = b.x - Math.cos(ang) * R, ey = b.y - Math.sin(ang) * R;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash || []);
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.setLineDash([]);
      if (arrow) drawArrowHead(ex, ey, ang, color);
    }

    // 去掉的边（灰虚线，垫在最底层）
    (st.ghostEdges || []).forEach(e => line(P[e[0]], P[e[1]], C.gone, 2, [6, 6], false));

    g.edges.forEach(e => {
      if (edgeIn(st.ghostEdges, e)) return;
      const ok = edgeIn(okEdges, e);
      const hot = !ok && edgeIn(hlEdges, e);
      const dim = anyHl && !hot && !ok;
      const color = ok ? C.edgeOk : hot ? C.edgeHot : dim ? C.edgeDim : C.edge;
      line(P[e[0]], P[e[1]], color, ok || hot ? 4 : 2.2, null, g.directed);
    });

    P.forEach((p, i) => {
      const hot = hlNodes.has(i);
      const ok = !hot && okNodes.has(i);
      const part = partOf(st, i);
      ctx.beginPath();
      ctx.arc(p.x, p.y, hot ? R + 2 : R, 0, Math.PI * 2);
      ctx.fillStyle = hot ? C.cur : ok ? C.ok : part === 1 ? C.partY : C.node;
      ctx.fill();
      ctx.strokeStyle = C.ring;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = hot ? C.curText : C.text;
      ctx.font = "800 " + (g.names[i].length > 2 ? 10 : 13) + "px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y);
    });

    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(g.caption, size.w / 2, size.h - 18);
  }

  /* ---- 舞台图例（随本步内容显示需要的项） ---- */
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
    const items = [];
    if (st.parts) items.push('<span><i class="lg-node"></i>X 部</span><span><i class="lg-node lg-y"></i>Y 部</span>');
    else items.push('<span><i class="lg-node"></i>顶点</span>');
    if ((st.nodes || []).length) items.push('<span><i class="lg-node lg-cur"></i>本步关注</span>');
    if ((st.okNodes || []).length) items.push('<span><i class="lg-node lg-ok"></i>已匹配</span>');
    items.push('<span><i class="lg-edge"></i>边</span>');
    if ((st.edges || []).length) items.push('<span><i class="lg-edge lg-hot"></i>高亮边</span>');
    if ((st.okEdges || []).length) items.push('<span><i class="lg-edge lg-res"></i>结果边</span>');
    if ((st.ghostEdges || []).length) items.push('<span><i class="lg-edge lg-gone"></i>' + (st.graph === "c5comp" ? "原图的边" : "去掉的边") + '</span>');
    lg.innerHTML = items.join("");
  }

  /* ---- 左栏信息卡：定义与性质 + 当前属性 ---- */
  function renderSideInfo(st) {
    if (!sideInfo) return;
    const g = GRAPHS[st.graph];
    const eCount = g.edges.filter(e => !edgeIn(st.ghostEdges, e)).length;
    sideInfo.innerHTML =
      '<div class="info-head"><span>' + (st.icon || "📚") + '</span><span>' + esc(st.name) + '</span></div>' +
      '<p class="info-def">' + esc(st.defText || "") + '</p>' +
      '<div class="info-stats">' +
        '<div class="stat-box"><span class="lab">顶点数 |V|</span><span class="val">' + g.nodes.length + '</span></div>' +
        '<div class="stat-box"><span class="lab">' + (g.directed ? "有向边数 |E|" : (eCount < g.edges.length ? "剪断后边数 |E|" : "边数 |E|")) + '</span><span class="val">' + eCount + '</span></div>' +
      '</div>';
  }

  /* ---- 辅助可视化 ---- */
  function degtableHtml(g, st) {
    let edges = g.edges;
    if (st.ghostEdges) edges = edges.filter(e => !edgeIn(st.ghostEdges, e));
    const d = degrees(g.nodes.length, edges);
    const rows = g.names.map((nm, i) => '<span class="pill">' + nm + '：' + d[i] + '</span>').join("");
    const sum = d.reduce((a, b) => a + b, 0);
    return '<div class="graph-summary"><b>度数表' + (st.ghostEdges ? "（剪断后的 P₆）" : "") + '：</b><div class="pill-row">' + rows + '</div>' +
      '度数之和 = ' + sum + ' = 2 × ' + edges.length + ' 条边 ✓（握手定理）</div>';
  }
  function regularHtml(g) {
    const k = regularK(g.nodes.length, g.edges);
    return '<div class="graph-summary"><b>正则性检查：</b>' +
      (k >= 0 ? "各点度数全为 " + k + " ⇒ <b>" + k + "-正则图</b>；|E| = nk/2 = " + g.nodes.length + "×" + k + "/2 = " + g.edges.length + " ✓"
              : "度数不全相等 ⇒ 非正则图") + '</div>';
  }
  function bipcheckHtml(g) {
    const r = bipartition(g.nodes.length, g.edges);
    if (r.ok) {
      const nm = arr => "{" + arr.map(i => g.names[i]).join(", ") + "}";
      return '<div class="graph-summary"><b>交替染色检查（DFS）：</b>X = ' + nm(r.parts[0]) + '，Y = ' + nm(r.parts[1]) +
        '，没有同部相邻的顶点 ⇒ <b class="ok-text">是二部图</b>' +
        (g.nodes.length === 8 ? '（|X| = |Y| = 4：1 的个数为偶数 / 奇数）' : '') + '。</div>';
    }
    return '<div class="graph-summary"><b>交替染色检查（DFS）：</b>染色到 ' + g.names[r.conflict[0]] + '–' + g.names[r.conflict[1]] +
      ' 时两端同色，出现矛盾 ⇒ 图中含奇圈，<b class="bad-text">不是二部图</b>。</div>';
  }
  function scoreHtml(g) {
    const out = Array(g.nodes.length).fill(0);
    g.edges.forEach(e => { out[e[0]]++; });
    const rows = g.names.map((nm, i) => '<span class="pill">' + nm + ' 胜 ' + out[i] + ' 场</span>').join("");
    const ok = isTournament(g.nodes.length, g.edges);
    return '<div class="graph-summary"><b>得分（出度）：</b><div class="pill-row">' + rows + '</div>' +
      '出度之和 = ' + out.reduce((a, b) => a + b, 0) + ' = C(5,2) = 场次总数；每对顶点恰一条有向边 ⇒ ' + (ok ? "<b class=\"ok-text\">是竞赛图</b>" : "不是竞赛图") + '。</div>';
  }
  function matchingHtml(g, st) {
    const ok = isMatching(g.edges, st.okEdges);
    const pills = st.okEdges.map(m => '<span class="pill">' + g.names[m[0]] + '–' + g.names[m[1]] + ' ✓</span>').join("");
    return '<div class="graph-summary"><b>匹配检验：</b><div class="pill-row">' + pills + '</div>' +
      (ok ? '三条边都在图中、两两不共顶点，且饱和全部 6 个顶点 ⇒ <b class="ok-text">完美匹配</b>。' : '不是匹配。') + '</div>';
  }
  function hallHtml(g) {
    const X = [0, 1, 2];
    const rows = hallCheck(g.edges, X).map(r =>
      '<span class="pill">S={' + r.S.map(i => g.names[i]).join(",") + '}：|N(S)|=' + r.N.length + ' ≥ ' + r.S.length + (r.ok ? ' ✓' : ' ✗') + '</span>'
    ).join("");
    const all = hallCheck(g.edges, X).every(r => r.ok);
    return '<div class="graph-summary"><b>Hall 条件逐一检查：</b><div class="pill-row">' + rows + '</div>' +
      (all ? '7 个子集全部满足 ⇒ 存在饱和 X 的匹配（上一步已找到）。' : '存在不满足的子集 ⇒ 不存在饱和 X 的匹配。') + '</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">订单—司机：二部图匹配</span><span class="pill">并行计算互连：Qₖ 立方体</span><span class="pill">数据中心：Spine-Leaf 完全二部</span></div>' +
      '选对典型结构，公平、带宽与容错就有了数学保证。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const g = GRAPHS[st.graph];
    let html = "";
    switch (st.viz) {
      case "degtable": html = degtableHtml(g, st); break;
      case "regular": html = regularHtml(g); break;
      case "bipcheck": html = bipcheckHtml(g); break;
      case "score": html = scoreHtml(g); break;
      case "matching": html = matchingHtml(g, st); break;
      case "hall": html = hallHtml(g); break;
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
    renderSideInfo(st);
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
      '<button type="button" class="step-item" data-i="' + i + '"><span class="num">' + (i + 1) + '</span><span>' + (s.icon ? s.icon + " " : "") + esc(s.name) + '</span></button>'
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
