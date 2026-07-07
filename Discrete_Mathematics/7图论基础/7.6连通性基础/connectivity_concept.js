/* ============================================================
   7.6 连通性基础 · 三层统一交互引擎（通路步序标号 + 分支/SCC 着色）
   window.CONN_LEVEL = "basic" | "advanced" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
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
  function componentsCount(n, edges) {
    const seen = Array(n).fill(false);
    let c = 0;
    for (let i = 0; i < n; i++) if (!seen[i]) {
      c++;
      const r = reachSet(n, edges, false, i);
      for (let j = 0; j < n; j++) if (r[j]) seen[j] = true;
    }
    return c;
  }
  function isStronglyConnected(n, edges) {
    for (let i = 0; i < n; i++) {
      const r = reachSet(n, edges, true, i);
      if (!r.every(Boolean)) return false;
    }
    return true;
  }
  function isWeaklyConnected(n, edges) { return componentsCount(n, edges) === 1; }
  // 强连通分量（互达等价类，小图直接双向可达判定）
  function sccGroups(n, edges) {
    const reach = [];
    for (let i = 0; i < n; i++) reach.push(reachSet(n, edges, true, i));
    const assigned = Array(n).fill(-1);
    const groups = [];
    for (let i = 0; i < n; i++) if (assigned[i] < 0) {
      const g = [];
      for (let j = 0; j < n; j++) if (assigned[j] < 0 && reach[i][j] && reach[j][i]) { assigned[j] = groups.length; g.push(j); }
      groups.push(g);
    }
    return groups;
  }
  // 通路分类：edgesDistinct=简单通路(trail)，verticesDistinct=初级通路(路径)
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
    return { valid: true, closed, edgesDistinct, verticesDistinct };
  }

  /* ---------------- 图库 ---------------- */
  const AZ = "ABCDEFGH".split("");
  const GRAPHS = {
    // 基础层：可演示重复点/边的无向图
    walkG: {
      names: AZ.slice(0, 5), caption: "演示图：5 点 6 边",
      nodes: [
        { x: 0.14, y: 0.25 }, { x: 0.5, y: 0.08 }, { x: 0.45, y: 0.55 },
        { x: 0.82, y: 0.42 }, { x: 0.82, y: 0.9 }
      ],
      edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [1, 3]]
    },
    // 进阶层：连通 6 点图
    net6: {
      names: AZ.slice(0, 6), caption: "连通网络 G（6 点）",
      nodes: [
        { x: 0.08, y: 0.3 }, { x: 0.36, y: 0.08 }, { x: 0.66, y: 0.22 },
        { x: 0.92, y: 0.52 }, { x: 0.6, y: 0.85 }, { x: 0.25, y: 0.7 }
      ],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 5], [2, 4]]
    },
    // 进阶层：两个分支
    twoComp: {
      names: AZ.slice(0, 7), caption: "非连通图：两个连通分支",
      nodes: [
        { x: 0.1, y: 0.2 }, { x: 0.38, y: 0.1 }, { x: 0.4, y: 0.55 }, { x: 0.1, y: 0.65 },
        { x: 0.72, y: 0.25 }, { x: 0.95, y: 0.6 }, { x: 0.62, y: 0.75 }
      ],
      edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [4, 5], [5, 6], [6, 4]]
    },
    // 进阶层：有向（弱连通非强连通）
    dig: {
      names: AZ.slice(0, 4), caption: "有向图 D：A→B→C→A，C→D", directed: true,
      nodes: [{ x: 0.2, y: 0.18 }, { x: 0.72, y: 0.12 }, { x: 0.5, y: 0.6 }, { x: 0.9, y: 0.85 }],
      edges: [[0, 1], [1, 2], [2, 0], [2, 3]]
    },
    digStrong: {
      names: AZ.slice(0, 4), caption: "补上 D→A 后的有向图", directed: true,
      nodes: [{ x: 0.2, y: 0.18 }, { x: 0.72, y: 0.12 }, { x: 0.5, y: 0.6 }, { x: 0.9, y: 0.85 }],
      edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 0]]
    },
    // 拓展层：网页图（蝴蝶结：两个 SCC + 中转 + 尾巴）
    web: {
      names: AZ.slice(0, 8), caption: "网页链接图（蝴蝶结结构）", directed: true,
      nodes: [
        { x: 0.08, y: 0.2 }, { x: 0.3, y: 0.05 }, { x: 0.28, y: 0.5 },
        { x: 0.52, y: 0.3 },
        { x: 0.72, y: 0.12 }, { x: 0.95, y: 0.35 }, { x: 0.74, y: 0.6 },
        { x: 0.92, y: 0.9 }
      ],
      edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 6], [6, 4], [6, 7]]
    },
    // 拓展层：进程等待图（含死锁环）
    deadlock: {
      names: ["P₁", "P₂", "P₃", "P₄"], caption: "进程等待图（P→Q 表示 P 等 Q 释放资源）", directed: true,
      nodes: [{ x: 0.2, y: 0.15 }, { x: 0.78, y: 0.15 }, { x: 0.5, y: 0.68 }, { x: 0.95, y: 0.75 }],
      edges: [[0, 1], [1, 2], [2, 0], [3, 1]]
    }
  };

  /* ---------------- 三层步骤数据 ----------------
     step.path = 顶点序列（画步序标号）；step.groups = 分支/SCC 着色 */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "沿着编号一步步走：分清通路、回路、简单通路与初级通路（路径）。",
      badge: "walk / trail / path",
      steps: [
        {
          name: "通路 walk",
          graph: "walkG", path: [0, 1, 2, 0, 1],
          formula: '通路：顶点边交替序列 <span class="ft hot">A→B→C→A→B</span>（点、边都可重复）',
          badge: "长度 4", tone: "",
          text: "跟着金色编号走 4 步：边 AB 走了<b>两次</b>、点 A B 也重复了——这都没关系，<b>通路(walk)</b>是最宽松的“走法”。长度 = 边数 = 4。"
        },
        {
          name: "回路 closed walk",
          graph: "walkG", path: [0, 1, 2, 0],
          formula: '起点 = 终点 的通路：<span class="ft hot">A→B→C→A</span> 称为<b>回路</b>',
          badge: "回路", tone: "blue",
          text: "从 A 出发最后又回到 A——<b>起点与终点相同</b>的通路叫回路。走出去，还要走得回来。"
        },
        {
          name: "简单通路（边不重）",
          graph: "walkG", path: [1, 0, 2, 1, 3],
          formula: '<span class="ft hot">B→A→C→B→D</span>：边不重复（点 B 重复了）⇒ 简单通路',
          badge: "trail", tone: "",
          text: "这条走法经过 B 两次，但 4 条边<b>各不相同</b>——<b>边不重复</b>的通路叫<b>简单通路(trail)</b>。"
        },
        {
          name: "初级通路（路径）",
          graph: "walkG", path: [0, 1, 3, 4],
          formula: '<span class="ft hot-green hot">A→B→D→E</span>：顶点全不重复 ⇒ 初级通路（路径）',
          badge: "path", tone: "",
          text: "最严格的走法：<b>顶点一个不重</b>（边自然也不重）——<b>初级通路</b>，也叫<b>路径(path)</b>。不走回头路、不绕圈。"
        },
        {
          name: "初级回路（圈）",
          graph: "walkG", path: [1, 2, 3, 1],
          formula: '<span class="ft hot">B→C→D→B</span>：除首尾外顶点不重 ⇒ 初级回路（圈）',
          badge: "cycle", tone: "gold",
          text: "首尾相同、中间顶点不重复的回路叫<b>初级回路（圈）</b>。它是第 7.4 节圈图 Cₙ 的“运动版”。"
        },
        {
          name: "层级关系",
          graph: "walkG", path: [0, 1, 3, 4],
          formula: '<span class="ft hot-green hot">初级通路</span> ⊂ <span class="ft hot-blue hot">简单通路</span> ⊂ <span class="ft hot">通路</span>',
          badge: "包含链", tone: "blue", viz: "hierarchy",
          text: "三个概念一层套一层：点不重 ⇒ 边必不重 ⇒ 必是通路。<b>越往里要求越严，性质越好</b>——定理里最常用的是初级通路。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "判定可达与连通、求连通分支，辨析有向图的强连通与弱连通。",
      badge: "连通与分支",
      steps: [
        {
          name: "可达性",
          graph: "net6", path: [0, 1, 2, 3],
          formula: 'A 到 D <span class="ft hot-green hot">可达</span> ⟺ 存在 A 到 D 的通路',
          badge: "可达", tone: "",
          text: "“能不能到”翻译成数学：<b>存在通路即可达</b>。金色编号给出一条 A→B→C→D 的见证通路。"
        },
        {
          name: "连通图",
          graph: "net6", nodes: [0, 1, 2, 3, 4, 5],
          formula: '任意两点都可达 ⟺ G <span class="ft hot">连通</span>',
          badge: "连通 ✓", tone: "", viz: "conncheck",
          text: "这张图任取两点都有通路相连——<b>连通图</b>。整个网络是“一整块”，没有孤岛。"
        },
        {
          name: "连通分支",
          graph: "twoComp", groups: [[0, 1, 2, 3], [4, 5, 6]],
          formula: '极大连通子图 = <span class="ft hot">连通分支</span>；本图分支数 = 2',
          badge: "2 个分支", tone: "gold", viz: "compcheck",
          text: "不连通的图按“互达”分块：绿色 {A,B,C,D} 和蓝色 {E,F,G} 各自内部畅通、彼此隔绝——两个<b>连通分支</b>。"
        },
        {
          name: "有向图：可达不对称",
          graph: "dig", path: [2, 3],
          formula: 'C→D <span class="ft hot-green hot">可达</span>，但 D→C <span class="ft hot">不可达</span>！',
          badge: "单行道", tone: "red",
          text: "边有方向后，可达性<b>不再对称</b>：顺着箭头 C 能到 D，但 D 一条出边都没有，回不来。有向世界里“去得了”≠“回得来”。"
        },
        {
          name: "弱连通",
          graph: "dig", nodes: [0, 1, 2, 3],
          formula: '底图（忽略方向）连通 ⇒ <span class="ft hot-blue hot">弱连通</span>',
          badge: "弱连通", tone: "blue", viz: "strongcheck",
          text: "把箭头都擦掉，这张图是连通的——所以它<b>弱连通</b>。但 D 回不到别处，还称不上“强”。"
        },
        {
          name: "强连通",
          graph: "digStrong", path: [3, 0, 1, 2],
          formula: '补上 D→A 后：任意两点<span class="ft hot">双向可达</span> ⇒ 强连通',
          badge: "强连通 ✓", tone: "", viz: "strongcheck",
          text: "加一条 D→A，所有顶点进了同一个大环——任意两点<b>互相可达</b>，这才是<b>强连通</b>。政令下达、民意上传，双向贯通。"
        },
        {
          name: "判定方法",
          graph: "net6",
          formula: '连通分支：<span class="ft hot-blue hot">BFS/DFS</span> 逐点扩散；强连通：正图反图各一遍 DFS',
          badge: "算法", tone: "blue",
          text: "工程判定全靠遍历：从任一点 BFS 染色，染不到的点属于别的分支；有向图把边全反向再遍历一次，两次都全覆盖即强连通（Kosaraju 思想）。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "把连通性迁移到工程：爬虫遍历网页图、SCC 缩点与死锁检测。",
      badge: "遍历 / 死锁",
      steps: [
        {
          name: "爬虫 = 可达性遍历",
          graph: "web", path: [0, 1, 2, 3, 4],
          formula: '从种子页 A 出发，爬虫能抓到的 = <span class="ft hot">A 的可达集</span>',
          badge: "BFS 抓取", tone: "",
          text: "网页是顶点、超链接是有向边。爬虫从种子页沿链接层层扩散——抓取范围恰是<b>可达集</b>。金色编号是一条抓取路线。"
        },
        {
          name: "蝴蝶结结构",
          graph: "web", groups: [[0, 1, 2], [4, 5, 6]],
          formula: 'Web 图 = <span class="ft hot-green hot">入口 SCC</span> → 中转 → <span class="ft hot-blue hot">核心 SCC</span> → 尾部',
          badge: "Bow-tie", tone: "gold", viz: "sccview",
          text: "真实 Web 呈“蝴蝶结”：绿色强连通团互链成圈，经 D 单向流入蓝色核心团，再甩出尾巴 H。<b>SCC 是有向网络的“块”结构</b>。"
        },
        {
          name: "SCC 缩点成 DAG",
          graph: "web", groups: [[0, 1, 2], [4, 5, 6]],
          formula: '每个 SCC 收缩为超点 ⇒ <span class="ft hot">缩点图必为 DAG</span>（无环）',
          badge: "缩点", tone: "blue",
          text: "把每个强连通团“捏”成一个超点：{A,B,C}→{D}→{E,F,G}→{H} 排成一条<b>无环链</b>。缩点后杂乱网页图变成清爽的流水线——分析立刻降维。"
        },
        {
          name: "死锁检测",
          graph: "deadlock", path: [0, 1, 2, 0],
          formula: '等待图中存在<span class="ft hot">有向环 P₁→P₂→P₃→P₁</span> ⟺ 死锁',
          badge: "死锁 !", tone: "red", viz: "deadlockcheck",
          text: "P₁ 等 P₂、P₂ 等 P₃、P₃ 又等 P₁——<b>循环等待</b>，谁也动不了。操作系统检测死锁，就是在等待图里<b>找有向环（大小 &gt;1 的 SCC）</b>。P₄ 只是排队，不在环上。"
        },
        {
          name: "线性时间算法",
          graph: "web", groups: [[0, 1, 2], [4, 5, 6]],
          formula: 'Tarjan / Kosaraju 求全部 SCC：<span class="ft hot">O(V+E)</span>',
          badge: "O(V+E)", tone: "blue",
          text: "亿级网页、上万进程也不怕：Tarjan 一遍 DFS、Kosaraju 两遍 DFS，都在<b>线性时间</b>内切出全部强连通分量——理论优雅、工程实用。"
        },
        {
          name: "迁移总结",
          graph: "web",
          formula: '<span class="ft hot">爬虫=可达集，缩点=降维，死锁=找环</span>',
          badge: "transfer", tone: "gold", viz: "transferlist",
          text: "连通性三件套落地三大场景：搜索引擎抓取、依赖分析（编译顺序、微服务拓扑）、操作系统死锁检测。<b>把“道路是否畅通”算清楚，系统才能行稳致远。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, hasEdge, reachable, componentsCount, isStronglyConnected, isWeaklyConnected, sccGroups, walkClassify };
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
  const GROUP_COLORS = ["#2f7d57", "#2f5f9f", "#c58a1f", "#8e5aa2"];

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
    // path 顶点序列 → [{u,v,idx}]
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
    const R = 18;
    const padX = 46, padTop = 30, padBot = 50;
    const P = g.nodes.map(nd => ({
      x: padX + nd.x * (size.w - 2 * padX),
      y: padTop + nd.y * (size.h - padTop - padBot)
    }));
    const ps = pathSteps(st);
    const hlNodes = new Set(st.nodes || (st.path ? st.path : []));
    const anyHl = hlNodes.size > 0 || ps.length > 0;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    // 底边
    g.edges.forEach(e => {
      const onPath = ps.some(p => (p.u === e[0] && p.v === e[1]) || (!g.directed && p.u === e[1] && p.v === e[0]));
      const grp = st.groups ? (nodeGroup(st, e[0]) >= 0 && nodeGroup(st, e[0]) === nodeGroup(st, e[1]) ? nodeGroup(st, e[0]) : -1) : -1;
      let color = "rgba(47,95,159,0.6)";
      if (onPath) color = "#d63b1d";
      else if (grp >= 0) color = GROUP_COLORS[grp % GROUP_COLORS.length];
      else if (anyHl || st.groups) color = "rgba(47,95,159,0.18)";
      ctx.strokeStyle = color;
      ctx.lineWidth = onPath ? 4 : grp >= 0 ? 3 : 2;
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

    // 顶点
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
      ctx.font = "800 " + (g.names[i].length > 2 ? 10 : 13) + "px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y);
    });

    // 起终点徽标
    if (st.path && st.path.length) {
      const s = P[st.path[0]], t = P[st.path[st.path.length - 1]];
      ctx.fillStyle = "#2f7d57";
      ctx.font = "700 12px 'Noto Serif SC', 'Microsoft YaHei', serif";
      ctx.textAlign = "center";
      ctx.fillText("起", s.x, s.y - R - 10);
      if (st.path[0] !== st.path[st.path.length - 1]) {
        ctx.fillStyle = "#d63b1d";
        ctx.fillText("终", t.x, t.y - R - 10);
      }
    }

    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.fillText(g.caption, size.w / 2, size.h - 20);
  }

  /* ---- 辅助可视化 ---- */
  function hierarchyHtml() {
    return '<div class="graph-summary"><b>三级包含：</b>' +
      '<div class="pill-row"><span class="pill">通路：点边都可重</span><span class="pill">简单通路：边不重</span><span class="pill">初级通路：点不重</span></div>' +
      '重要事实：若 u 到 v 有通路，则必有<b>初级通路</b>（把重复段剪掉即可）。</div>';
  }
  function conncheckHtml(g) {
    const c = componentsCount(g.nodes.length, g.edges);
    return '<div class="graph-summary"><b>连通性检查：</b>连通分支数 = ' + c + (c === 1 ? " ⇒ <b>连通图</b>：任意两点互达。" : " ⇒ 非连通。") + '</div>';
  }
  function compcheckHtml(g) {
    const c = componentsCount(g.nodes.length, g.edges);
    return '<div class="graph-summary"><b>分支统计：</b>连通分支数 = <b>' + c + '</b>。分支之间无任何边，是“各自为政”的极大连通块。</div>';
  }
  function strongcheckHtml(g) {
    const strong = isStronglyConnected(g.nodes.length, g.edges);
    const weak = isWeaklyConnected(g.nodes.length, g.edges);
    return '<div class="graph-summary"><b>强/弱判定：</b>弱连通 ' + (weak ? "✓" : "✗") + '，强连通 ' + (strong ? "✓" : "✗") + '。' +
      (strong ? "任意两点双向可达。" : weak ? "底图连通，但存在单向不可达的点对。" : "底图都不连通。") + '</div>';
  }
  function sccviewHtml(g) {
    const groups = sccGroups(g.nodes.length, g.edges).filter(x => x.length > 0);
    const rows = groups.map(gr => '<span class="pill">{' + gr.map(i => g.names[i]).join(",") + '}</span>').join("");
    return '<div class="graph-summary"><b>强连通分量：</b><div class="pill-row">' + rows + '</div>大小 &gt;1 的分量内部两两互达。</div>';
  }
  function deadlockHtml(g) {
    const groups = sccGroups(g.nodes.length, g.edges);
    const cyc = groups.filter(x => x.length > 1);
    return '<div class="graph-summary"><b>死锁判定：</b>' +
      (cyc.length ? "发现循环等待 {" + cyc[0].map(i => g.names[i]).join("→") + "} ⇒ <b>死锁</b>。解法：终止环上一个进程或抢占其资源。" : "无环 ⇒ 无死锁。") + '</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">搜索引擎：可达集抓取</span><span class="pill">编译/微服务：缩点 DAG 排序</span><span class="pill">操作系统：等待图找环</span></div>' +
      '连通性是一切“网络畅通”问题的底层数学。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const g = GRAPHS[st.graph];
    let html = "";
    switch (st.viz) {
      case "hierarchy": html = hierarchyHtml(); break;
      case "conncheck": html = conncheckHtml(g); break;
      case "compcheck": html = compcheckHtml(g); break;
      case "strongcheck": html = strongcheckHtml(g); break;
      case "sccview": html = sccviewHtml(g); break;
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
    }, 1800);
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
