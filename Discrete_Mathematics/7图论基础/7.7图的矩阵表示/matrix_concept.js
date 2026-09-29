/* ============================================================
   7.7 图的矩阵表示 · 三层统一交互引擎（图↔矩阵交叉高亮）
   window.MATRIX_LEVEL = "basic" | "advanced" | "extend"
   交互：上一步 / 下一步 / 自动播放（可调速）/ 重置；点步骤清单可跳转。
   图上高亮与右侧矩阵单元格同步；矩阵数值全部由下方纯函数实时计算。
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
  function matAdd(a, b) { return a.map((row, i) => row.map((v, j) => v + b[i][j])); }
  function matPow(a, p) {
    let r = a;
    for (let i = 1; i < p; i++) r = matMul(r, a);
    return r;
  }
  // B_{n-1} = A + A² + … + A^(n-1)（普通加法）
  function powerSum(a) {
    const n = a.length;
    let p = a, s = a;
    for (let k = 2; k < n; k++) { p = matMul(p, a); s = matAdd(s, p); }
    return s;
  }
  // 可达矩阵 P：B_{n-1} 布尔化，并约定主对角线为 1（每个顶点可达自身）
  function reachMatrix(n, edges, directed) {
    const s = powerSum(adjacency(n, edges, directed));
    return s.map((row, i) => row.map((v, j) => (i === j || v > 0) ? 1 : 0));
  }
  // Warshall：求 A 的传递闭包 t(A)，再 ∨ I 即得 P
  function warshall(n, edges, directed) {
    const t = adjacency(n, edges, directed).map(r => r.map(v => (v ? 1 : 0)));
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) if (t[i][k])
      for (let j = 0; j < n; j++) if (t[k][j]) t[i][j] = 1;
    return t.map((row, i) => row.map((v, j) => (i === j ? 1 : v)));
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
  // 对称矩阵特征分解（Jacobi 旋转），返回按特征值升序的 {values, vectors[列]}
  function eigenSym(m) {
    const n = m.length;
    const a = m.map(r => r.slice());
    const v = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    for (let sweep = 0; sweep < 100; sweep++) {
      let off = 0;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p][q] * a[p][q];
      if (off < 1e-20) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-15) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = a[k][p], akq = a[k][q];
          a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p][k], aqk = a[q][k];
          a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = v[k][p], vkq = v[k][q];
          v[k][p] = c * vkp - s * vkq; v[k][q] = s * vkp + c * vkq;
        }
      }
    }
    const order = a.map((row, i) => [row[i], i]).sort((x, y) => x[0] - y[0]);
    return {
      values: order.map(o => Math.abs(o[0]) < 1e-10 ? 0 : o[0]),
      vectors: order.map(o => v.map(row => row[o[1]]))
    };
  }
  // PageRank（列随机 + 阻尼），返回得分数组
  function pagerank(n, dirEdges, d, iters) {
    const out = Array(n).fill(0);
    dirEdges.forEach(e => out[e[0]]++);
    let r = Array(n).fill(1 / n);
    for (let t = 0; t < iters; t++) {
      const nr = Array(n).fill((1 - d) / n);
      dirEdges.forEach(e => { nr[e[1]] += d * r[e[0]] / out[e[0]]; });
      // 无出链页（悬挂节点）按均匀分布分出
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
      names: AZ.slice(0, 5), caption: "无向图 G（5 个顶点、5 条边）",
      nodes: [
        { x: 0.1, y: 0.18 }, { x: 0.55, y: 0.06 }, { x: 0.38, y: 0.55 },
        { x: 0.85, y: 0.5 }, { x: 0.62, y: 0.95 }
      ],
      edges: [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4]]
    },
    dig5: {
      names: AZ.slice(0, 5), caption: "有向图 D（A→B→C→A 成环，C→D→E 单向）", directed: true,
      nodes: [
        { x: 0.1, y: 0.18 }, { x: 0.55, y: 0.06 }, { x: 0.38, y: 0.55 },
        { x: 0.85, y: 0.5 }, { x: 0.62, y: 0.95 }
      ],
      edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4]]
    },
    g4: {
      names: AZ.slice(0, 4), caption: "演示图 G（4 个顶点、4 条边）",
      nodes: [
        { x: 0.12, y: 0.2 }, { x: 0.75, y: 0.08 }, { x: 0.42, y: 0.6 }, { x: 0.9, y: 0.9 }
      ],
      edges: [[0, 1], [1, 2], [2, 3], [0, 2]]
    },
    web4: {
      names: ["A", "B", "C", "D"], caption: "网页链接图（4 个页面，箭头 = 超链接）", directed: true,
      nodes: [
        { x: 0.12, y: 0.2 }, { x: 0.75, y: 0.08 }, { x: 0.42, y: 0.6 }, { x: 0.9, y: 0.9 }
      ],
      edges: [[0, 1], [0, 2], [1, 2], [2, 0], [3, 2]]
    },
    twoCluster: {
      names: AZ.slice(0, 6), caption: "双社区网络（两个三角形由一条弱边 C–D 相连）",
      nodes: [
        { x: 0.06, y: 0.2 }, { x: 0.3, y: 0.05 }, { x: 0.3, y: 0.55 },
        { x: 0.68, y: 0.55 }, { x: 0.7, y: 0.95 }, { x: 0.94, y: 0.62 }
      ],
      edges: [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3], [2, 3]]
    }
  };

  /* ---------------- 三层步骤数据 ----------------
     step.mat: "A"|"A2"|"A3"|"B"|"R"|"W"|"inc"|"L"|"pr" 决定右侧矩阵区内容
     step.hotCells: [[i,j],…] 矩阵高亮格；path/nodes/edges 图高亮 */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "把图翻译成 0-1 矩阵：一条无向边对应两个 1，矩阵对称，行和 = 度数。",
      badge: "0-1 矩阵",
      legend: [["node", "顶点"], ["cur", "当前关注"], ["edge", "边"], ["hot", "高亮边"]],
      steps: [
        {
          name: "从图到矩阵",
          graph: "g5", mat: "A",
          formula: '<span class="ft hot">A[i][j] = 1</span> ⟺ 顶点 i 与 j 相邻，否则为 0',
          badge: "邻接矩阵", tone: "",
          text: "把 5 个顶点的相邻关系填进 5×5 表格：<b>有边填 1、无边填 0</b>。图从此变成计算机能直接存储和计算的数据。"
        },
        {
          name: "一条边 = 两个 1",
          graph: "g5", edges: [[1, 2]], nodes: [1, 2], mat: "A", hotCells: [[1, 2], [2, 1]],
          formula: '边 (B,C) ⇒ <span class="ft hot">A[B][C] = A[C][B] = 1</span>',
          badge: "成对出现", tone: "",
          text: "图上高亮边 BC，矩阵里<b>同时点亮两个格子</b>（B 行 C 列、C 行 B 列）：无向边在矩阵里总是成对出现。"
        },
        {
          name: "对称性 A = Aᵀ",
          graph: "g5", mat: "A", hotCells: [[0, 1], [1, 0], [0, 2], [2, 0], [1, 2], [2, 1], [2, 3], [3, 2], [3, 4], [4, 3]],
          formula: '无向图：<span class="ft hot-blue hot">A = Aᵀ</span>（关于主对角线对称）',
          badge: "对称", tone: "blue",
          text: "所有 1 都<b>关于主对角线成对</b>。简单图没有环，主对角线全为 0。利用对称性只存上三角即可，存储量约减半。"
        },
        {
          name: "行和 = 度数",
          graph: "g5", nodes: [2], mat: "A", hotCells: [[2, 0], [2, 1], [2, 3]],
          formula: 'Σⱼ A[C][j] = 1+1+1 = <span class="ft hot">3 = deg(C)</span>',
          badge: "行和", tone: "gold",
          text: "把 C 那一行加起来：3 个 1，恰为 <b>deg(C)=3</b>。7.2 节的度数，在矩阵里就是<b>一行的和</b>；全部行和相加 = 2|E| = 10，正是握手定理。"
        },
        {
          name: "有向图：不对称",
          graph: "dig5", edges: [[0, 1]], nodes: [0, 1], mat: "A", hotCells: [[0, 1], [1, 0]],
          formula: 'A→B 存在 ⇒ A[A][B]=1，但 <span class="ft hot">A[B][A]=0</span>',
          badge: "单向", tone: "red",
          text: "换成有向图：弧 A→B 只点亮<b>一个格子</b>，(B,A) 处是 0，矩阵一般不再对称。此时<b>行和 = 出度，列和 = 入度</b>。"
        },
        {
          name: "存储的权衡",
          graph: "g5", mat: "A",
          formula: '邻接矩阵占 <span class="ft hot">n²</span> 个单元；稀疏图更适合邻接表 <span class="ft hot-blue hot">O(n+m)</span>',
          badge: "工程取舍", tone: "blue",
          text: "5 个顶点存 25 格没有问题；若顶点数上亿而每点只连几条边，n² 个格子几乎全是 0。<b>稠密图用矩阵、稀疏图用邻接表</b>：数据结构要随图的形态选择。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "用矩阵幂数通路：Aᵏ 的 (i,j) 元 = 从 vᵢ 到 vⱼ 长度为 k 的通路数；再用布尔运算求可达矩阵。",
      badge: "Aᵏ 数通路",
      legend: [["node", "顶点"], ["cur", "当前关注"], ["hot", "通路上的边"], ["seq", "通路步序"]],
      steps: [
        {
          name: "回顾邻接矩阵",
          graph: "g4", mat: "A",
          formula: '4 个顶点的 <span class="ft hot">A</span>：对称 0-1 矩阵，1 的个数 = 2|E| = 8',
          badge: "起点", tone: "",
          text: "本层用一个 4 点小图亲手算出 A²、A³。约定：这里的“通路”<b>允许重复经过顶点和边</b>（与 7.6 节一致），长度 = 经过的边数。"
        },
        {
          name: "A² 数两步通路",
          graph: "g4", path: [0, 2, 3], mat: "A2", hotCells: [[0, 3]],
          formula: '<span class="ft hot">A²[i][j] = Σₖ A[i][k]·A[k][j]</span>；A²[A][D] = 1（A→C→D）',
          badge: "A²", tone: "",
          text: "乘积项 A[i][k]·A[k][j] = 1 当且仅当 i→k→j 是一条两步通路，所以求和恰好在数<b>经过中转点 k 的走法</b>。D 只与 C 相邻，A 到 D 的两步通路只有 A→C→D，对应红格 A²[A][D]=1。"
        },
        {
          name: "对角线 = 度数",
          graph: "g4", nodes: [2], mat: "A2", hotCells: [[2, 2]],
          formula: '<span class="ft hot">A²[C][C] = 3 = deg(C)</span>：C→A→C，C→B→C，C→D→C',
          badge: "对角线", tone: "gold",
          text: "A²[i][i] 数的是“走出去一步再回来”的回路，每个邻居贡献一条，所以<b>A²[i][i] = deg(vᵢ)</b>（简单无向图）。C 有 3 个邻居，A²[C][C]=3。"
        },
        {
          name: "A³ 数三步通路",
          graph: "g4", path: [0, 1, 2, 3], mat: "A3", hotCells: [[0, 3]],
          formula: '<span class="ft hot">A³ = A²·A</span>；A³[A][D] = 1：唯一三步通路 A→B→C→D',
          badge: "A³", tone: "",
          text: "到 D 的最后一步必来自 C，所以要数 A 到 C 的两步通路：只有 A→B→C（A²[A][C]=1）。于是 A³[A][D]=1，金色步序即那条通路。<b>k 步联系由 1 步联系逐次相乘推出。</b>"
        },
        {
          name: "累加 A+A²+A³",
          graph: "g4", mat: "B", hotCells: [[3, 3]],
          formula: '<span class="ft hot">B₃ = A + A² + A³</span>：B₃[i][j] = 长度 1～3 的通路总数',
          badge: "累加", tone: "blue",
          text: "n=4 个顶点时，若 vᵢ 能到 vⱼ（i≠j），必有长度 ≤ n−1 = 3 的通路，所以只需加到 A³。B₃ 中非零元 ⟺ 可达。红格 B₃[D][D] = 0 + 1 + 0 = 1，只来自回路 D→C→D。"
        },
        {
          name: "可达矩阵 P",
          graph: "g4", mat: "R",
          formula: 'P = B(A + A² + A³)，并令 <span class="ft hot">pᵢᵢ = 1</span>；<span class="ft hot-green hot">P 全 1 ⟺ 连通</span>',
          badge: "可达", tone: "",
          text: "只关心“能不能到”而不关心有几条：把 B₃ <b>布尔化</b>（非零记 1），并按约定令主对角线为 1（每点可达自身）。P 全为 1，说明任意两点互相可达，G 连通。"
        },
        {
          name: "有向图的可达矩阵",
          graph: "dig5", nodes: [4], mat: "R", hotCells: [[4, 0], [4, 1], [4, 2], [4, 3]],
          formula: '有向图 D：P 不再对称，<span class="ft hot">E 行除 pₑₑ 外全为 0</span>',
          badge: "有向", tone: "red",
          text: "A、B、C 在同一个有向环上，能到达所有点；D 只能到 E；E 没有出弧，哪里也去不了。有向图中 P[i][j] 与 P[j][i] 可以不同：<b>单向可达 ≠ 互相可达</b>。"
        },
        {
          name: "Warshall 算法",
          graph: "dig5", mat: "W",
          formula: '对 k=1..n：若 t[i][k]=1 则 <span class="ft hot-blue hot">第 i 行 ∨= 第 k 行</span>，O(n³)',
          badge: "算法", tone: "blue",
          text: "逐次相乘代价约 O(n⁴)。Warshall 让中转点 k 逐个加入，三重循环求出 A 的<b>传递闭包 t(A)</b>（第 3 章的老朋友），再并上 I 就是可达矩阵。右表由 Warshall 实时算出，与上一步 P 完全一致。"
        },
        {
          name: "关联矩阵",
          graph: "g4", mat: "inc", hotCells: [[2, 1], [2, 2], [2, 3]],
          formula: '顶点×边 矩阵 M：<span class="ft hot">每列恰两个 1</span>，行和 = 度数',
          badge: "M", tone: "gold",
          text: "另一种表示：行是顶点、列是边，mᵢⱼ=1 表示 vᵢ 是 eⱼ 的端点。每列两个 1 ⇒ 全矩阵 1 的个数 = 2|E|，而按行求和 = Σ deg(v)：<b>握手定理的矩阵版证明</b>。（有向图的关联矩阵用 1 / −1 区分起点与终点。）"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "矩阵化的高光时刻：PageRank 用幂迭代给网页排序，拉普拉斯矩阵的谱把网络切成社区。",
      badge: "PageRank / 谱",
      legend: [["node", "顶点"], ["cur", "当前关注"], ["hot", "高亮边"], ["g1", "社区①"], ["g2", "社区②"]],
      steps: [
        {
          name: "链接矩阵",
          graph: "web4", mat: "A",
          formula: '网页=顶点，超链接=有向边 ⇒ <span class="ft hot">邻接矩阵 A</span>，按出度归一化得转移矩阵 M',
          badge: "建模", tone: "",
          text: "把 Web 抽象成有向图后矩阵化：M[i][j] = 1/出度(j)（若 j 链向 i）。“随机冲浪者”下一步跳到哪个页面，由这个矩阵决定。"
        },
        {
          name: "幂迭代排序",
          graph: "web4", nodes: [2], mat: "pr",
          formula: '<span class="ft hot">r ← M·r</span> 反复迭代 ⇒ 收敛到特征值 1 对应的特征向量 = PageRank',
          badge: "幂迭代", tone: "",
          text: "从均匀分布出发反复乘 M，得分逐轮稳定（图中顶点大小 ∝ 得分）。<b>C 被 A、B、D 三个页面链接，得分最高</b>；A 只被 C 链接，但 C 的“分量”大，A 也排第二——被重要页面链接更有价值。"
        },
        {
          name: "阻尼因子",
          graph: "web4", mat: "pr",
          formula: 'r = <span class="ft hot">d</span>·M·r + <span class="ft hot-blue hot">(1−d)</span>/n，经典取 d = 0.85',
          badge: "d=0.85", tone: "blue",
          text: "纯迭代会被“没有出链的页面”和“只进不出的子网”卡住。以 1−d 的概率随机跳到任意页面后，转移矩阵的元素全为正，由 <b>Perron–Frobenius 定理</b>，得分向量唯一且幂迭代必收敛。"
        },
        {
          name: "拉普拉斯矩阵",
          graph: "twoCluster", mat: "L",
          formula: '<span class="ft hot">L = D − A</span>：对角 = 度数，相邻处 = −1，每行和恒为 0',
          badge: "L", tone: "gold",
          text: "度矩阵减邻接矩阵得到<b>拉普拉斯矩阵</b>。它的特征值（谱）从小到大排列：λ₁ = 0 恒成立（全 1 向量），<b>0 作为特征值的重数 = 连通分支数</b>。本图连通，所以只有一个 0。"
        },
        {
          name: "谱聚类切社区",
          graph: "twoCluster", groups: [[0, 1, 2], [3, 4, 5]], edges: [[2, 3]], mat: "fiedler",
          formula: '第二小特征值 λ₂ 的特征向量（Fiedler 向量）按<span class="ft hot">正负号</span>把图一分为二',
          badge: "谱切割", tone: "",
          text: "λ₂ 称为代数连通度，越小说明图越容易被切开。Fiedler 向量在 {A,B,C} 与 {D,E,F} 上符号相反，<b>自动找出了只需剪断一条边 C–D 的切法</b>。右侧数值由 Jacobi 方法实时计算。"
        },
        {
          name: "迁移总结",
          graph: "web4", mat: "pr",
          formula: '<span class="ft hot">数通路 → 排网页 → 切社区</span>：都从同一个 A 出发',
          badge: "迁移", tone: "gold", viz: "transferlist",
          text: "同一个邻接矩阵：取幂可以数通路、判可达（本节进阶层）；求特征向量可以给网页排序；做谱分解可以切分社区（推荐系统、图像分割）。<b>把网络写成矩阵，就能用线性代数整体地分析它。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, adjacency, matMul, matPow, powerSum, reachMatrix, warshall, incidence, laplacian, eigenSym, pagerank };
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
  const legendEl = document.getElementById("stageLegend");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const LG_CLASS = { node: "lg-node", cur: "lg-node lg-cur", done: "lg-node lg-ok", g1: "lg-node lg-ok", g2: "lg-node lg-cur", seq: "lg-node lg-cur lg-seq",
    soft: "lg-node lg-soft", del: "lg-node lg-del", edge: "lg-edge", hot: "lg-edge lg-hot", path: "lg-edge lg-res", new: "lg-edge lg-new" };

  /* 全章统一配色 */
  const C = {
    red: "#D63B1D", redDark: "#B8321A", gold: "#FFB400", ink: "#2C1810", muted: "#6B4A38",
    green: "#1F9D55", greenDark: "#2F7D57", err: "#C0392B", edge: "rgba(107,74,56,0.42)",
    edgeDim: "rgba(107,74,56,0.16)", paper: "#FFFBF0"
  };
  const GROUP_COLORS = [C.green, C.gold];

  let step = 0;
  let playTimer = null;
  let playDelay = 2000;

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  }

  if (missionEl) missionEl.innerHTML = "<b>互动任务：</b>" + esc(level.mission);
  if (badgeEl) badgeEl.textContent = level.badge;
  if (legendEl) {
    legendEl.innerHTML = level.legend.map(it =>
      '<span><i class="' + (LG_CLASS[it[0]] || "lg-node") + '"></i>' + esc(it[1]) + '</span>').join("");
  }

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
    const L = 12;
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
    const small = size.w < 480;
    const baseR = small ? 16 : 19;
    const padX = small ? 34 : 56, padTop = Math.max(50, (legendEl ? legendEl.offsetHeight + 12 : 0) + 34), padBot = 44;
    const P = g.nodes.map(nd => ({
      x: padX + nd.x * (size.w - 2 * padX),
      y: padTop + nd.y * (size.h - padTop - padBot)
    }));
    // PageRank 步：顶点半径随得分变化
    let radius = () => baseR;
    if (st.mat === "pr") {
      const pr = pagerank(g.nodes.length, g.edges, 0.85, 30);
      radius = i => baseR - 4 + pr[i] * (small ? 34 : 46);
    }
    const ps = pathSteps(st);
    const hlNodes = new Set(st.nodes || (st.path ? st.path : []));
    const hlEdges = st.edges || [];
    const anyHl = hlNodes.size > 0 || hlEdges.length > 0 || ps.length > 0;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    g.edges.forEach(e => {
      const onPath = ps.some(p => (p.u === e[0] && p.v === e[1]) || (!g.directed && p.u === e[1] && p.v === e[0]));
      const hot = onPath || edgeIn(hlEdges, e);
      const g0 = nodeGroup(st, e[0]);
      const grp = st.groups && g0 >= 0 && g0 === nodeGroup(st, e[1]) ? g0 : -1;
      let color = C.edge;
      if (hot) color = C.red;
      else if (grp >= 0) color = GROUP_COLORS[grp % GROUP_COLORS.length];
      else if (anyHl) color = C.edgeDim;
      ctx.strokeStyle = color;
      ctx.lineWidth = hot ? 4.5 : grp >= 0 ? 3 : 2;
      ctx.setLineDash(hot && st.groups ? [9, 6] : []);
      const a = P[e[0]], b = P[e[1]];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const ra = radius(e[0]), rb = radius(e[1]);
      const sx = a.x + Math.cos(ang) * ra, sy = a.y + Math.sin(ang) * ra;
      const ex = b.x - Math.cos(ang) * (rb + (g.directed ? 2 : 0)), ey = b.y - Math.sin(ang) * (rb + (g.directed ? 2 : 0));
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.setLineDash([]);
      if (g.directed) drawArrowHead(ex, ey, ang, color);
    });

    // 通路步序标号（金色）
    ps.forEach(p => {
      const a = P[p.u], b = P[p.v];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.beginPath();
      ctx.arc(mx, my, 12, 0, Math.PI * 2);
      ctx.fillStyle = C.gold;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = C.ink;
      ctx.font = "800 12px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(p.idx), mx, my + 0.5);
    });

    P.forEach((p, i) => {
      const hot = hlNodes.has(i);
      const grp = nodeGroup(st, i);
      const dim = anyHl && !hot && grp < 0;
      const r = radius(i) + (hot ? 2 : 0);
      ctx.globalAlpha = dim ? 0.45 : 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grp >= 0 ? GROUP_COLORS[grp % GROUP_COLORS.length] : hot ? C.gold : C.red;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.stroke();
      if (hot) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,180,0,0.45)";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.fillStyle = (hot || (grp >= 0 && GROUP_COLORS[grp] === C.gold)) ? C.ink : "#fff";
      ctx.font = "800 14px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y + 0.5);
      ctx.globalAlpha = 1;
    });

    ctx.fillStyle = C.muted;
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(g.caption, size.w / 2, size.h - 14);
  }

  /* ---- 矩阵渲染（右侧矩阵面板） ---- */
  function fmt(v) {
    if (typeof v !== "number") return String(v);
    if (Number.isInteger(v)) return v < 0 ? "−" + Math.abs(v) : String(v);
    return (v < 0 ? "−" : "") + Math.abs(v).toFixed(2);
  }
  function matrixHtml(mat, rowNames, colNames, hotCells, title, note) {
    const hot = new Set((hotCells || []).map(c => c[0] + "," + c[1]));
    const cols = colNames.length;
    const head = '<span class="matrix-cell head"></span>' + colNames.map(nm => '<span class="matrix-cell head">' + esc(nm) + '</span>').join("");
    const rows = mat.map((row, i) =>
      '<span class="matrix-cell head">' + esc(rowNames[i]) + '</span>' +
      row.map((v, j) =>
        '<span class="matrix-cell' + (hot.has(i + "," + j) ? " hot" : v ? " one" : "") + '">' + fmt(v) + '</span>'
      ).join("")
    ).join("");
    return '<div class="mx-card"><div class="mx-title">' + title + '</div>' +
      '<div class="matrix-wrap"><div class="matrix-grid" style="grid-template-columns:repeat(' + (cols + 1) + ',minmax(28px,auto))">' + head + rows + '</div></div>' +
      (note ? '<div class="mx-note">' + note + '</div>' : '') + '</div>';
  }
  function prHtml(g) {
    const r = pagerank(g.nodes.length, g.edges, 0.85, 30);
    const order = r.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
    const rows = order.map((p, rank) =>
      '<div class="rank-row' + (rank === 0 ? ' top' : '') + '"><span class="rk">#' + (rank + 1) + '</span><span class="nm">' + g.names[p[1]] +
      '</span><span class="bar"><i style="width:' + (p[0] * 100 / order[0][0]).toFixed(1) + '%"></i></span><span class="sc">' + p[0].toFixed(3) + '</span></div>'
    ).join("");
    return '<div class="mx-card"><div class="mx-title">PageRank 得分（d = 0.85，幂迭代 30 轮）</div>' + rows +
      '<div class="mx-note">得分之和 = ' + r.reduce((s, x) => s + x, 0).toFixed(3) + '（概率分布）。</div></div>';
  }
  function fiedlerHtml(g) {
    const L = laplacian(g.nodes.length, g.edges);
    const eg = eigenSym(L);
    const vec = eg.vectors[1];
    const sgn = vec[0] < 0 ? -1 : 1; // 统一符号，便于阅读
    const vals = '<div class="pill-row">' + eg.values.map((v, i) => '<span class="pill' + (i === 1 ? ' hot' : '') + '">λ' + (i + 1) + ' = ' + fmt(Math.round(v * 1000) / 1000) + '</span>').join("") + '</div>';
    const vrow = '<div class="pill-row">' + vec.map((x, i) => {
      const s = x * sgn;
      return '<span class="pill ' + (s >= 0 ? 'pos' : 'neg') + '">' + g.names[i] + '：' + (s >= 0 ? '+' : '−') + Math.abs(s).toFixed(3) + '</span>';
    }).join("") + '</div>';
    return matrixHtml(L, g.names, g.names, [[2, 3], [3, 2]], "拉普拉斯矩阵 L = D − A") +
      '<div class="mx-card"><div class="mx-title">L 的特征值（升序）</div>' + vals +
      '<div class="mx-title" style="margin-top:8px">Fiedler 向量（λ₂ 的特征向量）</div>' + vrow +
      '<div class="mx-note">正号 → 社区①（绿），负号 → 社区②（金）；被剪断的边 C–D 在矩阵中对应红格。</div></div>';
  }
  function transferHtml() {
    return '<div class="mx-card"><div class="mx-title">迁移对照</div>' +
      '<div class="pill-row"><span class="pill">Aᵏ：通路计数</span><span class="pill">特征向量：PageRank 排序</span><span class="pill">拉普拉斯谱：社区切割</span></div>' +
      '<div class="mx-note">图的矩阵表示是网络科学、搜索引擎与机器学习共同的基础。</div></div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const g = GRAPHS[st.graph];
    const n = g.nodes.length;
    const A = adjacency(n, g.edges, !!g.directed);
    let html = "";
    switch (st.mat) {
      case "A": html = matrixHtml(A, g.names, g.names, st.hotCells, g.directed ? "邻接矩阵 A（有向）" : "邻接矩阵 A",
        g.directed ? "行和 = 出度，列和 = 入度" : "行和 = 度数：" + A.map((r, i) => g.names[i] + "=" + r.reduce((s, x) => s + x, 0)).join("，")); break;
      case "A2": html = matrixHtml(matPow(A, 2), g.names, g.names, st.hotCells, "A²（长度为 2 的通路数）", "对角线 = 各顶点度数"); break;
      case "A3": html = matrixHtml(matPow(A, 3), g.names, g.names, st.hotCells, "A³（长度为 3 的通路数）"); break;
      case "B": html = matrixHtml(powerSum(A), g.names, g.names, st.hotCells, "B₃ = A + A² + A³", "非零元 ⟺ 存在长度 1～3 的通路"); break;
      case "R": html = matrixHtml(reachMatrix(n, g.edges, !!g.directed), g.names, g.names, st.hotCells, "可达矩阵 P", "pᵢⱼ = 1 ⟺ vᵢ 可达 vⱼ（约定 pᵢᵢ = 1）"); break;
      case "W": html = matrixHtml(warshall(n, g.edges, !!g.directed), g.names, g.names, st.hotCells, "Warshall 结果 t(A) ∨ I", "与 B(A + A² + … + Aⁿ⁻¹) 布尔化后结果一致"); break;
      case "inc": {
        const M = incidence(n, g.edges);
        const eNames = g.edges.map((e, k) => "e" + (k + 1));
        const legend = g.edges.map((e, k) => "e" + (k + 1) + "=" + g.names[e[0]] + g.names[e[1]]).join("，");
        html = matrixHtml(M, g.names, eNames, st.hotCells, "关联矩阵 M（行 = 顶点，列 = 边）", legend + "；C 行和 = 3 = deg(C)");
        break;
      }
      case "L": html = matrixHtml(laplacian(n, g.edges), g.names, g.names, st.hotCells, "拉普拉斯矩阵 L = D − A", "每行和 = 0 ⇒ 全 1 向量是特征值 0 的特征向量"); break;
      case "fiedler": html = fiedlerHtml(g); break;
      case "pr": html = prHtml(g); break;
      default: html = "";
    }
    if (st.viz === "transferlist") html += transferHtml();
    vizText.innerHTML = html;
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
