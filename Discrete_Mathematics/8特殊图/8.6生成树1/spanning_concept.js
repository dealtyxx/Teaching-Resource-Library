/* ============================================================
   8.6 生成树（一）· 基础层/拓展层统一交互引擎（生成树 + BFS/DFS + 广播/寻路）
   window.SPAN_LEVEL = "basic" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   配色与进阶层一致：树边=绿 起点=深红 当前=金 已访问=浅红
   （进阶层 bfs-index.html 保留原有 BFS/DFS 动画，不走本引擎）
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  function adjList(n, edges) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
    adj.forEach(a => a.sort((x, y) => x - y));
    return adj;
  }
  function components(n, edges) {
    const adj = adjList(n, edges);
    const seen = Array(n).fill(false);
    let c = 0;
    for (let i = 0; i < n; i++) if (!seen[i]) {
      c++; const q = [i]; seen[i] = true;
      while (q.length) { const u = q.shift(); adj[u].forEach(v => { if (!seen[v]) { seen[v] = true; q.push(v); } }); }
    }
    return c;
  }
  function bfsTree(n, edges, s) {
    const adj = adjList(n, edges);
    const seen = Array(n).fill(false), dist = Array(n).fill(-1), tree = [], order = [];
    seen[s] = true; dist[s] = 0;
    const q = [s];
    while (q.length) {
      const u = q.shift(); order.push(u);
      adj[u].forEach(v => { if (!seen[v]) { seen[v] = true; dist[v] = dist[u] + 1; tree.push([u, v]); q.push(v); } });
    }
    return { tree, order, dist };
  }
  function dfsTree(n, edges, s) {
    const adj = adjList(n, edges);
    const seen = Array(n).fill(false), tree = [], order = [];
    (function dfs(u) {
      seen[u] = true; order.push(u);
      adj[u].forEach(v => { if (!seen[v]) { tree.push([u, v]); dfs(v); } });
    })(s);
    return { tree, order };
  }
  function isSpanningTree(n, edges, treeEdges) {
    if (treeEdges.length !== n - 1) return false;
    const inG = e => edges.some(x => (x[0] === e[0] && x[1] === e[1]) || (x[0] === e[1] && x[1] === e[0]));
    if (!treeEdges.every(inG)) return false;
    return components(n, treeEdges) === 1;
  }
  function nonTreeEdges(edges, treeEdges) {
    const key = e => Math.min(e[0], e[1]) + "-" + Math.max(e[0], e[1]);
    const tset = new Set(treeEdges.map(key));
    return edges.filter(e => !tset.has(key(e)));
  }
  function bfsPath(n, edges, s, t) {
    const adj = adjList(n, edges);
    const pre = Array(n).fill(-2); pre[s] = -1;
    const q = [s];
    while (q.length) { const u = q.shift(); if (u === t) break; adj[u].forEach(v => { if (pre[v] === -2) { pre[v] = u; q.push(v); } }); }
    if (pre[t] === -2) return null;
    const p = []; let cur = t; while (cur !== -1) { p.push(cur); cur = pre[cur]; }
    return p.reverse();
  }

  /* ---------------- 图库 ---------------- */
  const AZ = "ABCDEFGH".split("");
  const g8nodes = [
    { x: 0.1, y: 0.22 }, { x: 0.4, y: 0.08 }, { x: 0.72, y: 0.14 }, { x: 0.92, y: 0.46 },
    { x: 0.76, y: 0.82 }, { x: 0.44, y: 0.92 }, { x: 0.12, y: 0.72 }, { x: 0.5, y: 0.5 }
  ];
  const g8edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [1, 7], [3, 7], [5, 7]];
  const GRAPHS = {
    g8: { names: AZ.slice(0, 8), caption: "连通网络 G（8 点 10 边，含圈）", nodes: g8nodes, edges: g8edges },
    twoComp: {
      names: AZ.slice(0, 6), caption: "两个连通分量",
      nodes: [
        { x: 0.12, y: 0.18 }, { x: 0.4, y: 0.08 }, { x: 0.36, y: 0.5 },
        { x: 0.7, y: 0.55 }, { x: 0.94, y: 0.35 }, { x: 0.78, y: 0.9 }
      ],
      edges: [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]]
    },
    grid: {
      names: ["S", "1", "2", "3", "4", "5", "6", "7", "T"], caption: "迷宫网格（S→T 寻路）",
      nodes: [0, 1, 2].flatMap(r => [0, 1, 2].map(c => ({ x: 0.15 + c * 0.35, y: 0.12 + r * 0.4 }))),
      edges: (function () { const es = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const i = r * 3 + c; if (c < 2) es.push([i, i + 1]); if (r < 2) es.push([i, i + 3]); } return es; })()
    }
  };
  // 预计算生成树
  const BFS0 = bfsTree(8, g8edges, 0);
  const DFS0 = dfsTree(8, g8edges, 0);

  /* ---------------- 三层步骤数据 ---------------- */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "从有圈连通图去掉冗余边，得到覆盖全部顶点的生成树（n−1 边、无圈）。",
      badge: "极小连通子图",
      steps: [
        {
          name: "连通图有冗余",
          graph: "g8",
          formula: '连通图 G：<span class="ft hot">|V|=8, |E|=10</span>，含 3 个圈（有冗余）',
          badge: "有圈", tone: "",
          text: "这张网络有 10 条边、若干回路——要把所有点连通，其实用不了这么多边。<b>去掉冗余、保留骨架</b>，就得到“生成树”。"
        },
        {
          name: "去冗余边 → 生成树",
          graph: "g8", tree: "bfs", showRemoved: true,
          formula: '去掉圈上多余的 <span class="ft hot">3</span> 条边，保留 <span class="ft hot-green hot">7</span> 条（绿）',
          badge: "留 7 去 3", tone: "", viz: "spancheck",
          text: "红色虚线是被去掉的 3 条冗余边；绿色 7 条边连通所有 8 个点、且不含圈——这就是一棵<b>生成树</b>。"
        },
        {
          name: "生成树 = 全顶点 + n−1 边",
          graph: "g8", tree: "bfs",
          formula: '含<span class="ft hot">全部顶点</span> + <span class="ft hot-green hot">n−1=7 条边</span> + 连通无圈',
          badge: "7 = 8−1", tone: "blue", viz: "spancheck",
          text: "生成树是原图的<b>极小连通子图</b>：一个顶点都不少、边数恰好 n−1、连通且无圈。它是上一节“树”的结构，长在原图上。"
        },
        {
          name: "生成树不唯一",
          graph: "g8", tree: "dfs",
          formula: '换一种去法（如 DFS）⇒ <span class="ft hot">另一棵</span>生成树（形态不同）',
          badge: "不唯一", tone: "gold", viz: "spancheck",
          text: "去掉哪几条冗余边，决定了得到哪棵生成树。同一张图可以有<b>很多棵</b>生成树——这棵是深入型（DFS 长链），上一棵是分层型（BFS）。"
        },
        {
          name: "弦与基本回路",
          graph: "g8", tree: "bfs", chord: [3, 7],
          formula: '每条被去掉的<span class="ft hot">弦</span>加回生成树，恰好形成<b>一个圈</b>',
          badge: "弦=1圈", tone: "red",
          text: "把去掉的一条弦（红色 D–H）加回绿色生成树，就会闭合出唯一一个圈。<b>弦的条数 = |E|−(n−1) = 圈的个数</b>——生成树把冗余量化了。"
        },
        {
          name: "怎样系统地生成",
          graph: "g8", tree: "bfs",
          formula: '<span class="ft hot">BFS（按层）</span> 或 <span class="ft hot-blue hot">DFS（深入）</span> 遍历 ⇒ 一棵生成树',
          badge: "搜索生成", tone: "",
          text: "不用手工去边：从任一点做一次<b>广度优先(BFS)</b>或<b>深度优先(DFS)</b>遍历，走过的边自然构成一棵生成树——下一层的主角。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "把搜索生成树迁移到网络广播、连通分量与迷宫寻路。",
      badge: "广播 / 寻路",
      steps: [
        {
          name: "BFS 广播：层层扩散",
          graph: "g8", tree: "bfs", bfsDist: true,
          formula: 'BFS 由近及远，节点标号 = <span class="ft hot">到源的最短跳数</span>',
          badge: "洪泛", tone: "",
          text: "从源 A 广播消息：BFS 一圈圈往外扩（节点上的数字是<b>最短跳数</b>）。洪泛路由、社交传播、最短路都靠这套“<b>由近及远</b>”。"
        },
        {
          name: "DFS 深入：一查到底",
          graph: "g8", tree: "dfs", dfsOrder: true,
          formula: 'DFS 沿一条路走到底再回溯，<span class="ft hot-blue hot">访问序</span>成长链',
          badge: "深入", tone: "blue",
          text: "DFS 认准一条路<b>走到黑</b>再回头（编号是访问顺序）。它天生适合连通分量、拓扑排序、找环、迷宫“是否可达”。"
        },
        {
          name: "连通分量",
          graph: "twoComp", components: true,
          formula: '对每个未访问点各做一次搜索 ⇒ <span class="ft hot">分量数 = 搜索次数</span>',
          badge: "2 块", tone: "gold", viz: "compcheck",
          text: "图不连通时，一次搜索只能覆盖一块。<b>反复从未访问点搜索</b>，做了几次就有几个连通分量——这里 2 次，2 个分量。"
        },
        {
          name: "迷宫最短路 = BFS",
          graph: "grid", path: "st",
          formula: '网格里 BFS 求 <span class="ft hot">S→T 最少步数</span>（金色路线）',
          badge: "最短 4 步", tone: "",
          text: "迷宫/网格地图求最短路，正是无权图 BFS：一层层扩散，<b>第一次碰到终点就是最短</b>（金色编号 4 步）。DFS 只能判“能不能到”，不保证最短。"
        },
        {
          name: "生成树防广播风暴",
          graph: "g8", tree: "bfs",
          formula: '交换网用生成树协议 <span class="ft hot-green hot">STP</span> 阻断冗余环，防广播风暴',
          badge: "STP", tone: "",
          text: "以太网若有环，广播会无限循环成“<b>广播风暴</b>”。生成树协议(STP)在物理环网上<b>逻辑保留一棵生成树</b>、阻断多余边——既连通又无环。"
        },
        {
          name: "迁移总结",
          graph: "g8", tree: "bfs", viz: "transferlist",
          formula: '<span class="ft hot">洪泛广播 · 爬虫 · 连通分量 · 迷宫寻路 · STP</span>',
          badge: "transfer", tone: "gold",
          text: "BFS 管“最短与广播”，DFS 管“可达与分量”，生成树管“无冗余连通”。系统搜索的价值，就在<b>全面覆盖、层层落实、不留死角</b>。"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, components, bfsTree, dfsTree, isSpanningTree, nonTreeEdges, bfsPath };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.SPAN_LEVEL] || LEVELS.basic;
  const controls = document.getElementById("controls");
  const canvas = document.getElementById("graphCanvas");
  const formulaText = document.getElementById("formulaText");
  const stepStatus = document.getElementById("stepStatus");
  const vizText = document.getElementById("vizText");
  const missionEl = document.getElementById("missionText");
  const badgeEl = document.getElementById("visualBadge");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const COL = { tree: "#27c93f", start: "#b8321a", current: "#ffb400", visited: "#ff8c75", node: "#2f7d57", faint: "rgba(139,0,0,0.18)" };
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
  function resolveTree(st, g) {
    if (!st.tree) return null;
    if (st.tree === "bfs") return bfsTree(g.nodes.length, g.edges, 0).tree;
    if (st.tree === "dfs") return dfsTree(g.nodes.length, g.edges, 0).tree;
    return st.tree;
  }
  function edgeIn(list, e) {
    return (list || []).some(p => (p[0] === e[0] && p[1] === e[1]) || (p[0] === e[1] && p[1] === e[0]));
  }
  function draw() {
    const size = resize();
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    const R = 17;
    const gW = Math.min(size.w * 0.6, size.h * 0.78);
    const ox = (size.w - gW) / 2, oy = size.h * 0.1, gH = size.h * 0.72;
    const P = g.nodes.map(nd => ({ x: ox + nd.x * gW, y: oy + nd.y * gH }));
    const tree = resolveTree(st, g);
    const removed = (st.showRemoved && tree) ? nonTreeEdges(g.edges, tree) : [];
    const chord = st.chord ? [st.chord] : [];
    const path = st.path === "st" ? bfsPath(g.nodes.length, g.edges, 0, g.nodes.length - 1) : null;
    const pathSet = path ? path : null;
    const bfsInfo = (st.bfsDist) ? bfsTree(g.nodes.length, g.edges, 0) : null;
    const dfsInfo = (st.dfsOrder) ? dfsTree(g.nodes.length, g.edges, 0) : null;
    const anyTree = !!(tree || path);
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    // 移除边（红虚线）
    removed.forEach(e => {
      const a = P[e[0]], b = P[e[1]];
      ctx.setLineDash([6, 6]); ctx.strokeStyle = "rgba(214, 59, 29,0.55)"; ctx.lineWidth = 2.4;
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      ctx.beginPath(); ctx.moveTo(a.x + Math.cos(ang) * R, a.y + Math.sin(ang) * R); ctx.lineTo(b.x - Math.cos(ang) * R, b.y - Math.sin(ang) * R); ctx.stroke();
      ctx.setLineDash([]);
    });

    g.edges.forEach(e => {
      const isTree = tree && edgeIn(tree, e);
      const isChord = edgeIn(chord, e);
      const onPath = pathSet && (function () { for (let i = 0; i + 1 < pathSet.length; i++) if ((pathSet[i] === e[0] && pathSet[i + 1] === e[1]) || (pathSet[i] === e[1] && pathSet[i + 1] === e[0])) return true; return false; })();
      const isRemovedShown = edgeIn(removed, e);
      if (isRemovedShown) return; // 已用虚线画
      let color, width;
      if (isChord) { color = "#d63b1d"; width = 4; }
      else if (onPath) { color = COL.current; width = 4; }
      else if (isTree) { color = COL.tree; width = 4; }
      else { color = anyTree ? COL.faint : "rgba(47,95,159,0.5)"; width = 2; }
      ctx.strokeStyle = color; ctx.lineWidth = width;
      const a = P[e[0]], b = P[e[1]];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      ctx.beginPath(); ctx.moveTo(a.x + Math.cos(ang) * R, a.y + Math.sin(ang) * R); ctx.lineTo(b.x - Math.cos(ang) * R, b.y - Math.sin(ang) * R); ctx.stroke();
    });

    // 路径编号
    if (pathSet) {
      for (let i = 0; i + 1 < pathSet.length; i++) {
        const a = P[pathSet[i]], b = P[pathSet[i + 1]];
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#c58a1f"; ctx.fill(); ctx.strokeStyle = "#fff8ec"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.font = "800 10px 'JetBrains Mono', Consolas, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(i + 1), mx, my);
      }
    }

    P.forEach((p, i) => {
      const isStart = (tree || bfsInfo || dfsInfo) && i === 0;
      const inPath = pathSet && pathSet.indexOf(i) >= 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
      ctx.fillStyle = isStart ? COL.start : inPath ? COL.current : COL.node;
      ctx.fill();
      ctx.strokeStyle = "#fff8ec"; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "800 12px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y);

      // 距离/访问序徽标
      let badge = null;
      if (bfsInfo) badge = String(bfsInfo.dist[i]);
      else if (dfsInfo) badge = String(dfsInfo.order.indexOf(i) + 1);
      if (badge !== null) {
        const bx = p.x + R + 3, by = p.y - R - 2;
        ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#c58a1f"; ctx.fill(); ctx.strokeStyle = "#fff8ec"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.font = "800 10px 'JetBrains Mono', Consolas, monospace";
        ctx.fillText(badge, bx, by);
      }
    });

    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.fillText(g.caption, size.w / 2, size.h - 16);
  }

  /* ---- 辅助可视化 ---- */
  function spancheckHtml(g, st) {
    const tree = resolveTree(st, g);
    const ok = isSpanningTree(g.nodes.length, g.edges, tree);
    return '<div class="graph-summary"><b>生成树校验：</b>树边 ' + tree.length + ' = n−1 = ' + (g.nodes.length - 1) + '，连通无圈 ' + (ok ? "✓" : "✗") + '；被去掉的弦 ' + nonTreeEdges(g.edges, tree).length + ' 条 = 圈的个数。</div>';
  }
  function compcheckHtml(g) {
    const c = components(g.nodes.length, g.edges);
    return '<div class="graph-summary"><b>连通分量：</b>共做 ' + c + ' 次搜索、覆盖 ' + c + ' 个分量。每个分量各自有一棵生成树，合称<b>生成森林</b>。</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">BFS：广播/最短路</span><span class="pill">DFS：分量/拓扑/找环</span><span class="pill">STP：生成树防环</span></div>' +
      '系统搜索 = 全面覆盖、层层落实、不留死角。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const g = GRAPHS[st.graph];
    let html = "";
    switch (st.viz) {
      case "spancheck": html = spancheckHtml(g, st); break;
      case "compcheck": html = compcheckHtml(g); break;
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
