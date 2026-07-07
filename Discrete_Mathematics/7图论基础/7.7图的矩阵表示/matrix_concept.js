/* ============================================================
   7.7 图的矩阵表示 · 三层统一交互引擎（图↔矩阵交叉高亮）
   window.MATRIX_LEVEL = "basic" | "advanced" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、
   看图高亮，同时矩阵单元格同步高亮
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  function adjacency(n, edges, directed) {
    const m = Array.from({ length: n }, () => Array(n).fill(0));
    edges.forEach(e => { m[e[0]][e[1]] += 1; if (!directed) m[e[1]][e[0]] += 1; });
    return m;
  }
  function matMul(a, b) {
    const n = a.length;
    const c = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) if (a[i][k])
      for (let j = 0; j < n; j++) c[i][j] += a[i][k] * b[k][j];
    return c;
  }
  function matPow(a, p) {
    let r = a;
    for (let i = 1; i < p; i++) r = matMul(r, a);
    return r;
  }
  // 可达矩阵 R = I ∨ A ∨ A² ∨ … ∨ A^(n-1)（布尔）
  function reachMatrix(n, edges, directed) {
    const a = adjacency(n, edges, directed);
    const r = Array.from({ length: n }, (_, i) => a[i].map((v, j) => (i === j || v > 0) ? 1 : 0));
    let p = a;
    for (let k = 2; k < n; k++) {
      p = matMul(p, a);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (p[i][j]) r[i][j] = 1;
    }
    return r;
  }
  // 关联矩阵（无向）：行=顶点，列=边，每列恰两个 1
  function incidence(n, edges) {
    const m = Array.from({ length: n }, () => Array(edges.length).fill(0));
    edges.forEach((e, k) => { m[e[0]][k] = 1; m[e[1]][k] = 1; });
    return m;
  }
  // 拉普拉斯 L = D − A（无向简单图）
  function laplacian(n, edges) {
    const a = adjacency(n, edges, false);
    const l = Array.from({ length: n }, (_, i) => a[i].map(v => -v));
    for (let i = 0; i < n; i++) l[i][i] = a[i].reduce((s, x) => s + x, 0);
    return l;
  }
  // PageRank（列随机 + 阻尼），返回得分数组
  function pagerank(n, dirEdges, d, iters) {
    const out = Array(n).fill(0);
    dirEdges.forEach(e => out[e[0]]++);
    let r = Array(n).fill(1 / n);
    for (let t = 0; t < iters; t++) {
      const nr = Array(n).fill((1 - d) / n);
      dirEdges.forEach(e => { nr[e[1]] += d * r[e[0]] / out[e[0]]; });
      // 无出链页均分（悬挂节点）
      for (let i = 0; i < n; i++) if (out[i] === 0)
        for (let j = 0; j < n; j++) nr[j] += d * r[i] / n;
      r = nr;
    }
    return r;
  }

  /* ---------------- 图库 ---------------- */
  const AZ = "ABCDEF".split("");
  const GRAPHS = {
    g5: {
      names: AZ.slice(0, 5), caption: "无向图 G（5 点 5 边）",
      nodes: [
        { x: 0.15, y: 0.15 }, { x: 0.6, y: 0.06 }, { x: 0.42, y: 0.52 },
        { x: 0.82, y: 0.62 }, { x: 0.55, y: 0.95 }
      ],
      edges: [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4]]
    },
    dig5: {
      names: AZ.slice(0, 5), caption: "有向图 D（同顶点集）", directed: true,
      nodes: [
        { x: 0.15, y: 0.15 }, { x: 0.6, y: 0.06 }, { x: 0.42, y: 0.52 },
        { x: 0.82, y: 0.62 }, { x: 0.55, y: 0.95 }
      ],
      edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4]]
    },
    g4: {
      names: AZ.slice(0, 4), caption: "演示图 G（4 点 4 边）",
      nodes: [
        { x: 0.15, y: 0.2 }, { x: 0.72, y: 0.08 }, { x: 0.45, y: 0.62 }, { x: 0.9, y: 0.85 }
      ],
      edges: [[0, 1], [1, 2], [2, 3], [0, 2]]
    },
    web4: {
      names: ["A", "B", "C", "D"], caption: "网页链接图（4 个页面）", directed: true,
      nodes: [
        { x: 0.15, y: 0.2 }, { x: 0.72, y: 0.08 }, { x: 0.45, y: 0.62 }, { x: 0.9, y: 0.85 }
      ],
      edges: [[0, 1], [0, 2], [1, 2], [2, 0], [3, 2]]
    },
    twoCluster: {
      names: AZ.slice(0, 6), caption: "双社区网络（弱联结）",
      nodes: [
        { x: 0.08, y: 0.2 }, { x: 0.34, y: 0.06 }, { x: 0.28, y: 0.5 },
        { x: 0.66, y: 0.5 }, { x: 0.72, y: 0.94 }, { x: 0.94, y: 0.62 }
      ],
      edges: [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3], [2, 3]]
    }
  };

  /* ---------------- 三层步骤数据 ----------------
     step.mat: "A"|"A2"|"A3"|"R"|"inc"|"L"|"pr" 决定矩阵区内容
     step.hotCells: [[i,j],…] 矩阵高亮格；path/nodes/edges 图高亮 */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "把图翻译成 0-1 矩阵：一条边两个 1、对称、行和=度数。",
      badge: "0-1 矩阵",
      steps: [
        {
          name: "从图到矩阵",
          graph: "g5", mat: "A",
          formula: '<span class="ft hot">A[i][j] = 1</span> ⟺ 顶点 i 与 j 相邻，否则为 0',
          badge: "邻接矩阵", tone: "",
          text: "把 5 个点的相邻关系填进 5×5 表格：<b>有边填 1、无边填 0</b>——图从此变成计算机能算的数据。"
        },
        {
          name: "一条边 = 两个 1",
          graph: "g5", edges: [[1, 2]], nodes: [1, 2], mat: "A", hotCells: [[1, 2], [2, 1]],
          formula: '边 {B,C} ⇒ <span class="ft hot">A[B][C] = A[C][B] = 1</span>',
          badge: "成对出现", tone: "",
          text: "看红色：图上高亮一条边 BC，矩阵里就<b>同时点亮两个格子</b>（B 行 C 列、C 行 B 列）——无向边在矩阵里成对出现。"
        },
        {
          name: "对称性 A = Aᵀ",
          graph: "g5", mat: "A", hotCells: [[0, 1], [1, 0], [0, 2], [2, 0], [1, 2], [2, 1], [2, 3], [3, 2], [3, 4], [4, 3]],
          formula: '无向图：<span class="ft hot-blue hot">A = Aᵀ</span>（沿主对角线镜像对称）',
          badge: "对称", tone: "blue",
          text: "所有 1 都<b>关于对角线成对</b>。对称的好处：只需存一半（上三角），存储与计算都省一半。"
        },
        {
          name: "行和 = 度数",
          graph: "g5", nodes: [2], mat: "A", hotCells: [[2, 0], [2, 1], [2, 3]],
          formula: 'Σⱼ A[C][j] = 1+1+1 = <span class="ft hot">3 = deg(C)</span>',
          badge: "行和", tone: "gold",
          text: "把 C 那一行加起来：3 个 1，恰是 <b>deg(C)=3</b>。7.2 节的度数，在矩阵里就是<b>一行的和</b>——两节知识在此汇合。"
        },
        {
          name: "有向图：不对称",
          graph: "dig5", edges: [[0, 1]], mat: "A", hotCells: [[0, 1], [1, 0]],
          formula: 'A→B 存在 ⇒ A[A][B]=1，但 <span class="ft hot">A[B][A]=0</span>',
          badge: "单向", tone: "red",
          text: "换成有向图：A→B 只点亮 <b>一个格子</b>，(B,A) 处是 0——矩阵立刻不对称。行和=出度，列和=入度。"
        },
        {
          name: "存储的权衡",
          graph: "g5", mat: "A",
          formula: '邻接矩阵占 <span class="ft hot">n²</span> 空间；稀疏图更适合邻接表 <span class="ft hot-blue hot">O(n+m)</span>',
          badge: "工程取舍", tone: "blue",
          text: "5 个点存 25 格没问题；但 10 亿网页存 n² 就是天文数字。<b>稠密用矩阵、稀疏用邻接表</b>——数据结构因图而异。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "用矩阵幂数通路：Aⁿ 的 (i,j) 元 = 长度为 n 的通路数；布尔幂求可达矩阵。",
      badge: "Aⁿ 数通路",
      steps: [
        {
          name: "回顾邻接矩阵",
          graph: "g4", mat: "A",
          formula: '4 点图的 <span class="ft hot">A</span>：对称 0-1 矩阵',
          badge: "起点", tone: "",
          text: "本层用一个 4 点小图，亲手算出 A²、A³。先看 A 本身：4 条边、8 个 1。"
        },
        {
          name: "A² 数两步通路",
          graph: "g4", path: [0, 2, 3], mat: "A2", hotCells: [[0, 3]],
          formula: '<span class="ft hot">A²[i][j] = 长度为 2 的通路数</span>；A²[A][D] = 1（A→C→D）',
          badge: "A²", tone: "",
          text: "矩阵乘法 Σₖ A[i][k]·A[k][j] 恰好在数“<b>经过一个中转点 k</b> 的走法”。金色编号给出唯一那条 A→C→D，对应矩阵红格 A²[A][D]=1。"
        },
        {
          name: "亲手验证一格",
          graph: "g4", nodes: [2], mat: "A2", hotCells: [[2, 2]],
          formula: '<span class="ft hot">A²[C][C] = 3</span>：C→A→C，C→B→C，C→D→C',
          badge: "对角线", tone: "gold",
          text: "对角线元素 A²[i][i] 数的是“出去一步再回来”的走法 = <b>deg(i)</b>。C 有 3 个邻居，所以 A²[C][C]=3——对角线藏着度数！"
        },
        {
          name: "A³ 数三步通路",
          graph: "g4", path: [0, 1, 2, 3], mat: "A3", hotCells: [[0, 3]],
          formula: '<span class="ft hot">A³[A][D] = 1</span>：唯一三步通路 A→B→C→D',
          badge: "A³", tone: "",
          text: "再乘一次：A³=A²·A。金色编号走出那条唯一的三步通路，与红格数值一致。<b>k 步联系由 1 步联系逐层推算</b>——这就是矩阵幂的威力。"
        },
        {
          name: "可达矩阵 R",
          graph: "g4", mat: "R",
          formula: 'R = I ∨ A ∨ A² ∨ A³（布尔或）：<span class="ft hot-green hot">全 1 ⟺ 连通</span>',
          badge: "可达", tone: "",
          text: "只关心“能不能到”不关心几条路：把各次幂<b>按布尔或叠加</b>。R 全为 1，说明任意两点可达——上一节的连通判定有了矩阵算法。"
        },
        {
          name: "计算效率",
          graph: "g4", mat: "R",
          formula: 'Warshall 算法求 R：<span class="ft hot-blue hot">O(n³)</span>，布尔运算免乘法',
          badge: "算法", tone: "blue",
          text: "逐个矩阵乘代价高；Warshall 用“允许中转点逐个加入”的三重循环一次算完可达矩阵，还顺手给出传递闭包——第 3 章关系的老朋友。"
        },
        {
          name: "关联矩阵",
          graph: "g4", mat: "inc",
          formula: '顶点×边 矩阵 M：<span class="ft hot">每列恰两个 1</span>（边有两个端点）',
          badge: "M", tone: "gold",
          text: "另一种矩阵表示：行是顶点、列是边。每列两个 1 ⇒ 全矩阵 1 的个数 = 2|E|——<b>握手定理的矩阵版证明</b>，一眼看穿。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "矩阵化的高光时刻：PageRank 幂迭代排序网页，拉普拉斯谱切开社区。",
      badge: "PageRank / 谱",
      steps: [
        {
          name: "链接矩阵",
          graph: "web4", mat: "A",
          formula: '网页=顶点，超链接=有向边 ⇒ <span class="ft hot">链接矩阵</span>（列归一后为转移矩阵 M）',
          badge: "建模", tone: "",
          text: "把 Web 抽象成有向图后矩阵化：M[i][j] = 1/出度(j)（若 j 链向 i）。“随机冲浪者”下一步去哪，全由这个矩阵决定。"
        },
        {
          name: "幂迭代排序",
          graph: "web4", nodes: [2], mat: "pr",
          formula: '<span class="ft hot">r ← M·r</span> 反复迭代 ⇒ 收敛到主特征向量 = PageRank',
          badge: "幂迭代", tone: "",
          text: "从均匀分布出发反复乘 M，得分逐轮稳定——<b>C 被 3 个页面链接，稳居第一</b>。矩阵幂在 7.7 前半数通路，在 Google 手里排网页。"
        },
        {
          name: "阻尼因子",
          graph: "web4", mat: "pr",
          formula: 'r = <span class="ft hot">0.85</span>·M·r + <span class="ft hot-blue hot">0.15</span>/n（Google 阻尼）',
          badge: "d=0.85", tone: "blue",
          text: "纯迭代会被“死胡同页”和“自环陷阱”卡住。以 15% 概率随机跳转任意页——保证矩阵<b>不可约、迭代必收敛</b>（Perron–Frobenius 定理）。"
        },
        {
          name: "拉普拉斯矩阵",
          graph: "twoCluster", mat: "L",
          formula: '<span class="ft hot">L = D − A</span>：对角=度数，非对角=−1，每行和恒为 0',
          badge: "L", tone: "gold",
          text: "度矩阵减邻接矩阵得到<b>拉普拉斯矩阵</b>。它的特征值序列是图的“声纹”：λ₁=0 恒成立，0 的重数 = 连通分支数。"
        },
        {
          name: "谱聚类切社区",
          graph: "twoCluster", groups: [[0, 1, 2], [3, 4, 5]], mat: "L",
          formula: '第二特征向量（Fiedler 向量）按<span class="ft hot">正负号</span>把图切成两半',
          badge: "谱切割", tone: "",
          text: "λ₂ 越小、社区间联系越弱。Fiedler 向量在 {A,B,C} 取一种符号、{D,E,F} 取另一种——<b>特征向量自动找出了那条最该剪断的弱边</b>。"
        },
        {
          name: "迁移总结",
          graph: "web4", mat: "pr",
          formula: '<span class="ft hot">数通路 → 排网页 → 切社区</span>：一切从 A 出发',
          badge: "transfer", tone: "gold", viz: "transferlist",
          text: "同一个邻接矩阵：取幂数通路（本节），求特征向量排序网页（Google），做谱分解切社区（推荐系统、图像分割）。<b>抓住底层矩阵，就能洞察全局态势。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, adjacency, matMul, matPow, reachMatrix, incidence, laplacian, pagerank };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.MATRIX_LEVEL] || LEVELS.basic;
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
  const GROUP_COLORS = ["#2f7d57", "#2f5f9f", "#c58a1f"];

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
  function nodeGroup(st, i) {
    if (!st.groups) return -1;
    for (let g = 0; g < st.groups.length; g++) if (st.groups[g].indexOf(i) >= 0) return g;
    return -1;
  }
  function draw() {
    const size = resize();
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    const R = 18;
    const padX = 46, padTop = 30, padBot = 50;
    const P = g.nodes.map(nd => ({
      x: padX + nd.x * (size.w - 2 * padX),
      y: padTop + nd.y * (size.h - padTop - padBot)
    }));
    const ps = pathSteps(st);
    const hlNodes = new Set(st.nodes || (st.path ? st.path : []));
    const hlEdges = st.edges || [];
    const anyHl = hlNodes.size > 0 || hlEdges.length > 0 || ps.length > 0;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    g.edges.forEach(e => {
      const onPath = ps.some(p => (p.u === e[0] && p.v === e[1]) || (!g.directed && p.u === e[1] && p.v === e[0]));
      const hot = onPath || edgeIn(hlEdges, e);
      const grp = st.groups ? (nodeGroup(st, e[0]) >= 0 && nodeGroup(st, e[0]) === nodeGroup(st, e[1]) ? nodeGroup(st, e[0]) : -1) : -1;
      let color = "rgba(47,95,159,0.6)";
      if (hot) color = "#d63b1d";
      else if (grp >= 0) color = GROUP_COLORS[grp % GROUP_COLORS.length];
      else if (anyHl || st.groups) color = "rgba(47,95,159,0.18)";
      ctx.strokeStyle = color;
      ctx.lineWidth = hot ? 4 : grp >= 0 ? 3 : 2;
      const a = P[e[0]], b = P[e[1]];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const sx = a.x + Math.cos(ang) * R, sy = a.y + Math.sin(ang) * R;
      const ex = b.x - Math.cos(ang) * R, ey = b.y - Math.sin(ang) * R;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      if (g.directed) drawArrowHead(ex, ey, ang, color);
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
      const hot = hlNodes.has(i);
      const grp = nodeGroup(st, i);
      const dim = (anyHl || st.groups) && !hot && grp < 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, hot ? R + 2 : R, 0, Math.PI * 2);
      ctx.fillStyle = grp >= 0 ? GROUP_COLORS[grp % GROUP_COLORS.length] : hot ? "#d63b1d" : dim ? "#cdbfae" : "#2f7d57";
      ctx.fill();
      ctx.strokeStyle = "#fff8ec";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "800 13px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y);
    });

    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.fillText(g.caption, size.w / 2, size.h - 20);
  }

  /* ---- 矩阵渲染（vizText） ---- */
  function matrixHtml(mat, rowNames, colNames, hotCells, title) {
    const hot = new Set((hotCells || []).map(c => c[0] + "," + c[1]));
    const cols = colNames.length;
    const head = '<span class="matrix-cell head"></span>' + colNames.map(nm => '<span class="matrix-cell head">' + nm + '</span>').join("");
    const rows = mat.map((row, i) =>
      '<span class="matrix-cell head">' + rowNames[i] + '</span>' +
      row.map((v, j) =>
        '<span class="matrix-cell' + (hot.has(i + "," + j) ? " hot" : v ? " one" : "") + '">' + v + '</span>'
      ).join("")
    ).join("");
    return '<div class="graph-summary"><b>' + title + '</b><div class="matrix-wrap" style="margin-top:8px"><div class="matrix-grid" style="grid-template-columns:repeat(' + (cols + 1) + ',26px)">' + head + rows + '</div></div></div>';
  }
  function prHtml(g) {
    const r = pagerank(g.nodes.length, g.edges, 0.85, 30);
    const order = r.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
    const rows = order.map((p, rank) =>
      '<span class="pill"' + (rank === 0 ? ' style="background:rgba(214, 59, 29,0.14);color:#d63b1d"' : '') + '>#' + (rank + 1) + " " + g.names[p[1]] + '：' + p[0].toFixed(3) + '</span>'
    ).join("");
    return '<div class="graph-summary"><b>PageRank 得分（幂迭代 30 轮，d=0.85）：</b><div class="pill-row">' + rows + '</div></div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">Aⁿ：通路计数</span><span class="pill">特征向量：PageRank 排序</span><span class="pill">拉普拉斯谱：社区切割</span></div>' +
      '图的矩阵表示是网络科学、搜索引擎与机器学习共同的地基。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const g = GRAPHS[st.graph];
    const A = adjacency(g.nodes.length, g.edges, !!g.directed);
    let html = "";
    switch (st.mat) {
      case "A": html = matrixHtml(A, g.names, g.names, st.hotCells, "邻接矩阵 A"); break;
      case "A2": html = matrixHtml(matPow(A, 2), g.names, g.names, st.hotCells, "A²（长度 2 通路数）"); break;
      case "A3": html = matrixHtml(matPow(A, 3), g.names, g.names, st.hotCells, "A³（长度 3 通路数）"); break;
      case "R": html = matrixHtml(reachMatrix(g.nodes.length, g.edges, !!g.directed), g.names, g.names, st.hotCells, "可达矩阵 R"); break;
      case "inc": {
        const M = incidence(g.nodes.length, g.edges);
        const eNames = g.edges.map(e => "e" + (g.edges.indexOf(e) + 1));
        html = matrixHtml(M, g.names, eNames, st.hotCells, "关联矩阵 M（行=顶点，列=边）");
        break;
      }
      case "L": html = matrixHtml(laplacian(g.nodes.length, g.edges), g.names, g.names, st.hotCells, "拉普拉斯矩阵 L = D − A"); break;
      case "pr": html = prHtml(g); break;
      default: html = "";
    }
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
