/* ============================================================
   8.5 树的基本概念 · 三层统一交互引擎（树/删边/加边 + 唯一路径 + 并查集）
   window.TREE_LEVEL = "basic" | "advanced" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  function degrees(n, edges) {
    const d = Array(n).fill(0);
    edges.forEach(e => { d[e[0]]++; d[e[1]]++; });
    return d;
  }
  function components(n, edges) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
    const seen = Array(n).fill(false);
    let c = 0;
    for (let i = 0; i < n; i++) if (!seen[i]) {
      c++; const q = [i]; seen[i] = true;
      while (q.length) { const u = q.shift(); adj[u].forEach(v => { if (!seen[v]) { seen[v] = true; q.push(v); } }); }
    }
    return c;
  }
  function connected(n, edges) { return components(n, edges) === 1; }
  function hasCycle(n, edges) {
    // 连通分量视角：边数 ≥ 顶点数（在其分量内）即有圈；用总量判断：E >= V - components +1
    return edges.length > n - components(n, edges);
  }
  function isTree(n, edges) { return connected(n, edges) && edges.length === n - 1; }
  function leaves(n, edges) {
    const d = degrees(n, edges);
    const out = [];
    d.forEach((x, i) => { if (x === 1) out.push(i); });
    return out;
  }
  function pathInTree(n, edges, s, t) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
    const pre = Array(n).fill(-2);
    pre[s] = -1;
    const q = [s];
    while (q.length) {
      const u = q.shift();
      if (u === t) break;
      adj[u].forEach(v => { if (pre[v] === -2) { pre[v] = u; q.push(v); } });
    }
    if (pre[t] === -2) return null;
    const p = [];
    let cur = t;
    while (cur !== -1) { p.push(cur); cur = pre[cur]; }
    return p.reverse();
  }
  function addEdgeCreatesCycle(n, edges, e) {
    return connected(n, edges) ? true : components(n, edges.concat([e])) === components(n, edges);
  }
  // 并查集
  function makeDSU(n) { return Array.from({ length: n }, (_, i) => i); }
  function find(parent, x, compress) {
    const path = [];
    while (parent[x] !== x) { path.push(x); x = parent[x]; }
    if (compress) path.forEach(p => parent[p] = x);
    return { root: x, path };
  }
  function union(parent, a, b) {
    const ra = find(parent, a).root, rb = find(parent, b).root;
    if (ra !== rb) parent[rb] = ra;
    return parent;
  }

  /* ---------------- 图库 ---------------- */
  const NAMES7 = ["A", "B", "C", "D", "E", "F", "G"];
  const treeNodes = [
    { x: 0.5, y: 0.08 },                    // A 根
    { x: 0.24, y: 0.44 }, { x: 0.76, y: 0.44 }, // B C
    { x: 0.1, y: 0.82 }, { x: 0.38, y: 0.82 },  // D E
    { x: 0.62, y: 0.82 }, { x: 0.9, y: 0.82 }   // F G
  ];
  const treeEdges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
  const GRAPHS = {
    tree7: { names: NAMES7, caption: "一棵树（7 点 6 边）", nodes: treeNodes, edges: treeEdges },
    treeCut: {
      names: NAMES7, caption: "删去边 A–C：断成两块", nodes: treeNodes,
      edges: [[0, 1], [1, 3], [1, 4], [2, 5], [2, 6]], removed: [[0, 2]]
    },
    treeCycle: {
      names: NAMES7, caption: "加上边 F–G：出现圈", nodes: treeNodes,
      edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [5, 6]], added: [[5, 6]]
    },
    // 连通图（有一个圈），用于生成树
    graphCyc: {
      names: NAMES7.slice(0, 6), caption: "连通图 G（含一个圈）",
      nodes: [
        { x: 0.15, y: 0.2 }, { x: 0.5, y: 0.08 }, { x: 0.85, y: 0.2 },
        { x: 0.8, y: 0.8 }, { x: 0.5, y: 0.92 }, { x: 0.2, y: 0.8 }
      ],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4]]
    },
    // 并查集森林（有向 child→parent）
    dsu: {
      names: ["0", "1", "2", "3", "4", "5", "6"], caption: "并查集森林（箭头指向父节点）", directed: true,
      nodes: [
        { x: 0.28, y: 0.12 }, { x: 0.12, y: 0.5 }, { x: 0.44, y: 0.5 }, { x: 0.12, y: 0.88 },
        { x: 0.78, y: 0.2 }, { x: 0.64, y: 0.62 }, { x: 0.92, y: 0.62 }
      ],
      edges: [[1, 0], [2, 0], [3, 1], [5, 4], [6, 4]]
    }
  };

  /* ---------------- 三层步骤数据 ---------------- */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "认识“连通又无圈”的树：n 个点恰 n−1 条边，一条不多、一条不少。",
      badge: "连通无圈",
      steps: [
        {
          name: "什么是树",
          graph: "tree7",
          formula: '树 = <span class="ft hot">连通</span> 且 <span class="ft hot-blue hot">无圈</span> 的图',
          badge: "定义", tone: "",
          text: "所有点连成一体（连通），又没有任何回路（无圈）——这就是<b>树</b>。它用最少的连接把大家连起来，不设一处冗余。"
        },
        {
          name: "n 点 n−1 边",
          graph: "tree7", showDeg: false,
          formula: '<span class="ft hot">|V| = 7</span> ⇒ 树恰有 <span class="ft hot-blue hot">|E| = n−1 = 6</span> 条边',
          badge: "6 = 7−1", tone: "blue", viz: "treecheck",
          text: "数一数：7 个顶点、6 条边。<b>n 个点的树恰有 n−1 条边</b>——这是树最醒目的“身份证”。"
        },
        {
          name: "少一条边 → 断",
          graph: "treeCut",
          formula: '删任一条边 ⇒ <span class="ft hot">不再连通</span>（分成 2 块）',
          badge: "断裂", tone: "red", viz: "cutcheck",
          text: "把 A–C 剪掉（红色虚线），图立刻裂成 {A,B,D,E} 和 {C,F,G} 两块。树里<b>每条边都是“桥”</b>，少一条就不连通——这叫“极小连通”。"
        },
        {
          name: "多一条边 → 成圈",
          graph: "treeCycle", added: true,
          formula: '加任一条边 ⇒ <span class="ft hot">出现圈</span>（C–F–G–C）',
          badge: "成圈", tone: "gold", viz: "cyclecheck",
          text: "在两片叶子 F、G 间加一条边（红色），马上冒出一个圈 C→F→G→C。树是<b>“极大无圈”</b>：再加一条边必成圈。"
        },
        {
          name: "叶子与内点",
          graph: "tree7", leaves: true,
          formula: '度为 1 的点 = <span class="ft hot-green hot">叶子</span>（D、E、F、G）；其余为内点',
          badge: "叶子", tone: "",
          text: "只连一条边的顶点是<b>叶子</b>（绿圈：D、E、F、G）；连多条边的是<b>内点</b>（A、B、C）。任何非平凡的树，至少有<b>两片叶子</b>。"
        },
        {
          name: "引子：生成树",
          graph: "graphCyc", edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
          formula: '连通图去掉多余边、<span class="ft hot">保留一棵树</span> = 生成树',
          badge: "生成树", tone: "",
          text: "一张有圈的连通图，去掉圈上多余的边、保留能连通所有点的最少边（红色），就得到它的一棵<b>生成树</b>——下一层的主角。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "掌握树的多种等价刻画：唯一路径、极小连通、极大无圈，并理解生成树。",
      badge: "等价刻画",
      steps: [
        {
          name: "定义回顾",
          graph: "tree7",
          formula: '树：<span class="ft hot">连通 + 无圈</span>；|E| = |V| − 1',
          badge: "起点", tone: "", viz: "treecheck",
          text: "树有五条彼此等价的刻画。它们从不同角度说“同一件事”，是本层要打通的重点。先固定这棵 7 点树作为样例。"
        },
        {
          name: "任两点唯一路径",
          graph: "tree7", path: [3, 1, 0, 2, 6],
          formula: '任意两点间<span class="ft hot">有且仅有一条路径</span>：D→B→A→C→G',
          badge: "唯一路径", tone: "gold", viz: "pathcheck",
          text: "从 D 到 G，只有 D–B–A–C–G 这一条路（金色编号）。<b>“任两点恰有一条路径”⟺ 树</b>：若有两条路径，两条合起来就成圈，矛盾。"
        },
        {
          name: "极小连通",
          graph: "treeCut",
          formula: '连通，但<span class="ft hot">删去任一边即不连通</span> ⇒ 树',
          badge: "极小", tone: "red", viz: "cutcheck",
          text: "树是<b>刚好连通</b>的图：一条边都不能少。这叫“极小连通图”——每条边都是割边（桥）。"
        },
        {
          name: "极大无圈",
          graph: "treeCycle", added: true,
          formula: '无圈，但<span class="ft hot">加任一边即成圈</span> ⇒ 树',
          badge: "极大", tone: "gold", viz: "cyclecheck",
          text: "反过来看，树是<b>刚好无圈</b>的图：一条边都不能多。这叫“极大无圈图”。极小连通与极大无圈，是同一枚硬币的两面。"
        },
        {
          name: "五个等价刻画",
          graph: "tree7", viz: "equivlist",
          formula: '<span class="ft hot">连通无圈 ⟺ n−1边连通 ⟺ n−1边无圈 ⟺ 唯一路径 ⟺ 极小连通 ⟺ 极大无圈</span>',
          badge: "⟺", tone: "blue",
          text: "对 n 个顶点的图，以下彼此等价：①连通无圈；②连通且 n−1 边；③无圈且 n−1 边；④任两点唯一路径；⑤极小连通；⑥极大无圈。<b>知其一即知其全。</b>"
        },
        {
          name: "生成树",
          graph: "graphCyc", edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
          formula: '连通图 G 的生成树：含全部顶点的<span class="ft hot-green hot">极小连通子图</span>',
          badge: "生成树", tone: "",
          text: "去掉圈上任意一条边（这里去掉弦 B–E 与一条环边），保留 5 条红色边连通所有 6 点——一棵<b>生成树</b>。BFS/DFS 遍历天然给出生成树，第 8.6 节将求“最小”的那棵。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "把树用作层级结构（文件/决策）与并查集（森林+路径压缩）。",
      badge: "层级 / 并查集",
      steps: [
        {
          name: "有根树",
          graph: "tree7", nodes: [0],
          formula: '指定一个<span class="ft hot">根</span> ⇒ 父子、层、深度都有了',
          badge: "根 A", tone: "",
          text: "把某个顶点提为<b>根</b>（A），树就有了上下：A 是根，B、C 是子，D…G 是叶。每个点到根的路径长即它的<b>深度</b>。层级由此而生。"
        },
        {
          name: "文件系统 / DOM 树",
          graph: "tree7", path: [3, 1, 0],
          formula: '目录/网页结构 = 有根树：<span class="ft hot">路径唯一</span>（/A/B/D）',
          badge: "层级结构", tone: "blue",
          text: "文件夹、HTML DOM、组织架构都是有根树：从根到任一节点的<b>路径唯一</b>（如 /A/B/D，金色编号）。唯一路径正是“定位”的数学保证。"
        },
        {
          name: "决策树",
          graph: "tree7", leaves: true,
          formula: '内点=判断，边=选择，<span class="ft hot-green hot">叶子=结论</span>',
          badge: "决策", tone: "gold",
          text: "把内点看作“提问”、边看作“回答”、叶子看作“结论”，树就成了<b>决策树</b>：从根一路问到叶，得到分类结果。机器学习的分类器就长这样。"
        },
        {
          name: "并查集 = 森林",
          graph: "dsu",
          formula: '每个集合用一棵树表示，<span class="ft hot">根 = 集合代表</span>',
          badge: "森林", tone: "",
          text: "并查集用<b>树的森林</b>维护“谁和谁同组”：箭头指向父节点，同一棵树的根就是这组的代表。这里有 {0,1,2,3} 与 {4,5,6} 两组。"
        },
        {
          name: "find 与路径压缩",
          graph: "dsu", path: [3, 1, 0], compress: true,
          formula: 'find(3): 3→1→0；<span class="ft hot">路径压缩</span>后 3 直接指向根 0',
          badge: "O(α)", tone: "blue", viz: "dsucheck",
          text: "查 3 属于哪组：顺着箭头 3→1→0 找到根（金色路径）。<b>路径压缩</b>把沿途节点直接挂到根上，下次一步到位——配合按秩合并，几乎是常数时间 O(α(n))。"
        },
        {
          name: "迁移总结",
          graph: "dsu", viz: "transferlist",
          formula: '<span class="ft hot">文件系统 · 决策树 · 并查集 · 最小生成树</span>',
          badge: "transfer", tone: "gold",
          text: "树把“层级、唯一路径、精简连通”落地为工程结构：目录与 DOM、决策与语法树、并查集判连通、Kruskal 建最小生成树。<b>固本强基、不设冗余，好结构一条边都不浪费。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, degrees, components, connected, hasCycle, isTree, leaves, pathInTree, addEdgeCreatesCycle, makeDSU, find, union };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.TREE_LEVEL] || LEVELS.basic;
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
  function pathSteps(seq) {
    if (!seq) return [];
    const out = [];
    for (let i = 0; i + 1 < seq.length; i++) out.push({ u: seq[i], v: seq[i + 1], idx: i + 1 });
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
    ctx.fillStyle = color; ctx.fill();
  }
  function draw() {
    const size = resize();
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    const R = 17;
    const gW = Math.min(size.w * 0.6, size.h * 0.78);
    const ox = (size.w - gW) / 2, oy = size.h * 0.1, gH = size.h * 0.72;
    const P = g.nodes.map(nd => ({ x: ox + nd.x * gW, y: oy + nd.y * gH }));
    const ps = pathSteps(st.path);
    const hlEdges = st.edges || [];
    const leafSet = st.leaves ? new Set(leaves(g.nodes.length, g.edges)) : new Set();
    const hlNodes = new Set(st.nodes || (st.path ? st.path : []));
    const anyHl = hlEdges.length > 0 || ps.length > 0 || (st.nodes && st.nodes.length);
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    // 已删除的边（虚线红）
    (g.removed || []).forEach(e => {
      const a = P[e[0]], b = P[e[1]];
      ctx.setLineDash([6, 6]); ctx.strokeStyle = "rgba(214, 59, 29,0.6)"; ctx.lineWidth = 2.5;
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      ctx.beginPath(); ctx.moveTo(a.x + Math.cos(ang) * R, a.y + Math.sin(ang) * R); ctx.lineTo(b.x - Math.cos(ang) * R, b.y - Math.sin(ang) * R); ctx.stroke();
      ctx.setLineDash([]);
    });

    g.edges.forEach(e => {
      const onPath = ps.some(p => (p.u === e[0] && p.v === e[1]) || (!g.directed && p.u === e[1] && p.v === e[0]));
      const isAdded = st.added && edgeIn(g.added, e);
      const hot = onPath || edgeIn(hlEdges, e) || isAdded;
      const dim = anyHl && !hot;
      ctx.strokeStyle = hot ? "#d63b1d" : dim ? "rgba(47,95,159,0.18)" : "rgba(47,95,159,0.6)";
      ctx.lineWidth = hot ? 4 : 2.2;
      const a = P[e[0]], b = P[e[1]];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const sx = a.x + Math.cos(ang) * R, sy = a.y + Math.sin(ang) * R;
      const ex = b.x - Math.cos(ang) * R, ey = b.y - Math.sin(ang) * R;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      if (g.directed) drawArrowHead(ex, ey, ang, hot ? "#d63b1d" : dim ? "rgba(47,95,159,0.18)" : "rgba(47,95,159,0.6)");
    });

    ps.forEach(p => {
      const a = P[p.u], b = P[p.v];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.beginPath(); ctx.arc(mx, my, 11, 0, Math.PI * 2);
      ctx.fillStyle = "#c58a1f"; ctx.fill();
      ctx.strokeStyle = "#fff8ec"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "800 11px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(p.idx), mx, my);
    });

    P.forEach((p, i) => {
      const isLeaf = leafSet.has(i);
      const hot = hlNodes.has(i);
      const dim = anyHl && !hot && !isLeaf;
      ctx.beginPath();
      ctx.arc(p.x, p.y, hot ? R + 2 : R, 0, Math.PI * 2);
      ctx.fillStyle = hot ? "#d63b1d" : dim ? "#cdbfae" : "#2f7d57";
      ctx.fill();
      if (isLeaf) {
        ctx.strokeStyle = "#2ecc71"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(p.x, p.y, R + 4, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.strokeStyle = "#fff8ec"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "800 12px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y);
    });

    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.fillText(g.caption, size.w / 2, size.h - 16);
  }

  /* ---- 辅助可视化 ---- */
  function treecheckHtml(g) {
    const t = isTree(g.nodes.length, g.edges);
    return '<div class="graph-summary"><b>树判定：</b>连通 ' + (connected(g.nodes.length, g.edges) ? "✓" : "✗") + '，边数 ' + g.edges.length + ' = n−1 = ' + (g.nodes.length - 1) + ' ' + (g.edges.length === g.nodes.length - 1 ? "✓" : "✗") + ' ⇒ ' + (t ? "<b>是树</b>" : "不是树") + '。</div>';
  }
  function cutcheckHtml(g) {
    const c = components(g.nodes.length, g.edges);
    return '<div class="graph-summary"><b>删边影响：</b>删去后连通分量 = <b>' + c + '</b>（' + (c > 1 ? "断裂，说明该边是桥" : "仍连通") + '）。树的每条边都是桥。</div>';
  }
  function cyclecheckHtml(g) {
    return '<div class="graph-summary"><b>加边影响：</b>|E| = ' + g.edges.length + ' &gt; n−1 = ' + (g.nodes.length - 1) + ' ⇒ 必含圈（' + (hasCycle(g.nodes.length, g.edges) ? "已检出圈" : "无圈") + '）。</div>';
  }
  function pathcheckHtml() {
    return '<div class="graph-summary"><b>唯一路径：</b>D 到 G 只有 D–B–A–C–G 一条。若存在第二条路径，两条路径合起来会构成圈，与“无圈”矛盾 ⇒ 树中任两点路径唯一。</div>';
  }
  function equivlistHtml() {
    return '<div class="graph-summary"><b>树的等价刻画：</b>' +
      '<div class="pill-row"><span class="pill">连通无圈</span><span class="pill">连通+n−1边</span><span class="pill">无圈+n−1边</span><span class="pill">任两点唯一路径</span><span class="pill">极小连通</span><span class="pill">极大无圈</span></div></div>';
  }
  function dsucheckHtml(g) {
    const parent = [0, 0, 0, 1, 4, 4, 4]; // 与 dsu 边一致：1→0,2→0,3→1,5→4,6→4
    const r = find(parent, 3, false);
    return '<div class="graph-summary"><b>find(3)：</b>路径 ' + r.path.concat(r.root).map(i => g.names[i]).join(" → ") + '，根 = <b>' + g.names[r.root] + '</b>。路径压缩后这些点直接指向根，后续查询 O(1)。</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">文件系统 / DOM</span><span class="pill">决策树</span><span class="pill">并查集判连通</span><span class="pill">Kruskal 最小生成树</span></div>' +
      '“连通无圈、层级清晰”让树成为最省资源的组织结构。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const g = GRAPHS[st.graph];
    let html = "";
    switch (st.viz) {
      case "treecheck": html = treecheckHtml(g); break;
      case "cutcheck": html = cutcheckHtml(g); break;
      case "cyclecheck": html = cyclecheckHtml(g); break;
      case "pathcheck": html = pathcheckHtml(); break;
      case "equivlist": html = equivlistHtml(); break;
      case "dsucheck": html = dsucheckHtml(g); break;
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
