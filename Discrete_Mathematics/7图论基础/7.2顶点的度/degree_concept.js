/* ============================================================
   7.2 顶点的度 · 三层统一交互引擎
   window.DEGREE_LEVEL = "basic" | "advanced" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  // 无向度数：自环对该顶点计 2；有向时给出出度/入度
  function degrees(n, edges, directed) {
    const deg = Array(n).fill(0), out = Array(n).fill(0), inn = Array(n).fill(0);
    edges.forEach(e => {
      if (e.u === e.v) { deg[e.u] += 2; out[e.u]++; inn[e.u]++; return; }
      if (directed) { out[e.u]++; inn[e.v]++; deg[e.u]++; deg[e.v]++; }
      else { deg[e.u]++; deg[e.v]++; }
    });
    return { deg, out, inn };
  }
  function handshakeOK(n, edges) {
    const { deg } = degrees(n, edges, false);
    return deg.reduce((a, b) => a + b, 0) === 2 * edges.length;
  }
  function oddVertices(n, edges) {
    const { deg } = degrees(n, edges, false);
    const ids = [];
    deg.forEach((d, i) => { if (d % 2 === 1) ids.push(i); });
    return ids;
  }
  function components(n, edges, removedNode) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => {
      if (e.u === e.v) return;
      if (e.u === removedNode || e.v === removedNode) return;
      adj[e.u].push(e.v); adj[e.v].push(e.u);
    });
    const seen = Array(n).fill(false);
    if (removedNode != null && removedNode >= 0) seen[removedNode] = true;
    let c = 0;
    for (let i = 0; i < n; i++) if (!seen[i]) {
      c++; const q = [i]; seen[i] = true;
      while (q.length) { const u = q.shift(); adj[u].forEach(v => { if (!seen[v]) { seen[v] = true; q.push(v); } }); }
    }
    return c;
  }
  function degreeDistribution(n, edges) {
    const { deg } = degrees(n, edges, false);
    const dist = {};
    deg.forEach(d => { dist[d] = (dist[d] || 0) + 1; });
    return dist;
  }
  // 度序列可图化的两个必要条件：Σ 为偶、max ≤ n-1（简单图）
  function graphicalQuickCheck(seq) {
    const sum = seq.reduce((a, b) => a + b, 0);
    const n = seq.length;
    return { sumEven: sum % 2 === 0, maxOK: Math.max.apply(null, seq) <= n - 1, sum };
  }

  /* ---------------- 三层数据 ---------------- */
  const LEVELS = {
    basic: {
      label: "基础层",
      directed: false,
      mission: "选顶点、数关联边，算出 deg(v)，再用度数表看懂出度与入度。",
      badge: "deg(v) = 关联边数",
      names: ["A", "B", "C", "D", "E"],
      nodes: [
        { x: 0.22, y: 0.30 }, { x: 0.50, y: 0.16 }, { x: 0.80, y: 0.30 },
        { x: 0.68, y: 0.80 }, { x: 0.30, y: 0.80 }
      ],
      // 有向步骤沿存储方向：A→B, B→C, C→D, D→E, E→A, B→E
      edges: [
        { u: 0, v: 1 }, { u: 1, v: 2 }, { u: 2, v: 3 }, { u: 3, v: 4 }, { u: 4, v: 0 }, { u: 1, v: 4 }
      ],
      steps: [
        {
          name: "什么是度",
          formula: 'deg(B) = <span class="ft hot">与 B 关联的边数</span> = 3',
          nodes: [1], edges: [[0,1],[1,2],[1,4]],
          badge: "deg(B)=3", tone: "",
          text: "数一数从 B 出发能摸到几条边：{A,B}、{B,C}、{B,E} 共 <b>3 条</b>，所以 deg(B)=3。<b>度 = 关联边的条数</b>。"
        },
        {
          name: "逐点数度",
          formula: 'deg(A)=<span class="ft hot-green hot">2</span>, deg(B)=<span class="ft hot">3</span>, deg(C)=2, deg(D)=2, deg(E)=<span class="ft hot">3</span>',
          nodes: [0,1,2,3,4], edges: [],
          badge: "度数表", tone: "blue",
          showDeg: "deg", viz: "degree",
          text: "给每个顶点都数一遍关联边。图上每个顶点旁的<b>金色小徽标</b>就是它的度。"
        },
        {
          name: "把度数加起来",
          formula: '<span class="ft hot">Σ deg(v)</span> = 2+3+2+2+3 = 12 = <span class="ft hot-blue hot">2 × |E|</span> = 2×6',
          nodes: [0,1,2,3,4], edges: [[0,1],[1,2],[2,3],[3,4],[4,0],[1,4]],
          badge: "12 = 2×6", tone: "",
          showDeg: "deg", viz: "handshake",
          text: "所有度数之和恰好是边数的两倍！因为<b>每条边有两个端点</b>，给度数和贡献 2。这就是<b>握手定理</b>的雏形。"
        },
        {
          name: "奇度与偶度",
          formula: '奇度顶点：<span class="ft hot">B、E</span>（共 2 个，偶数个）',
          nodes: [1,4], edges: [],
          badge: "2 个奇度", tone: "gold",
          showDeg: "deg",
          text: "度数是奇数的叫<b>奇度顶点</b>。本图 B、E 是奇度（deg=3）。注意：奇度顶点恰好<b>成对出现</b>——这是握手定理的推论。"
        },
        {
          name: "有向图：出度",
          formula: 'deg⁺(B) = <span class="ft hot">2</span>   （B→C, B→E）',
          nodes: [1], edges: [[1,2],[1,4]], directed: true,
          badge: "出度", tone: "blue",
          showDeg: "out",
          text: "边有方向后，从 v <b>射出</b>的边数叫<b>出度 deg⁺(v)</b>。B 射出 2 条边（指向 C 和 E），所以 deg⁺(B)=2。"
        },
        {
          name: "有向图：入度",
          formula: 'deg⁻(B) = <span class="ft hot-green hot">1</span>（A→B）；且 <span class="ft hot">Σdeg⁺ = Σdeg⁻ = |E| = 6</span>',
          nodes: [1], edges: [[0,1]], directed: true,
          badge: "入度", tone: "",
          showDeg: "in", viz: "degree",
          text: "<b>射入</b> v 的边数叫<b>入度 deg⁻(v)</b>。每条有向边贡献 1 个出度和 1 个入度，所以全图出度总和 = 入度总和 = 边数。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      directed: false,
      mission: "用握手定理推算边数、解释奇度顶点推论、判定度序列可图化。",
      badge: "Σdeg = 2|E|",
      names: ["A", "B", "C", "D", "E", "F"],
      nodes: [
        { x: 0.20, y: 0.28 }, { x: 0.50, y: 0.14 }, { x: 0.80, y: 0.28 },
        { x: 0.80, y: 0.74 }, { x: 0.50, y: 0.88 }, { x: 0.20, y: 0.74 }
      ],
      // 8 条边（含 C 的自环）：deg = A2 B3 C4 D2 E3 F2，Σ=16=2×8
      edges: [
        { u: 0, v: 1 }, { u: 1, v: 2 }, { u: 2, v: 3 }, { u: 3, v: 4 },
        { u: 4, v: 5 }, { u: 5, v: 0 }, { u: 1, v: 4 }, { u: 2, v: 2 }
      ],
      steps: [
        {
          name: "最大度与最小度",
          formula: '<span class="ft hot">Δ(G) = 4</span>（顶点 C）,   <span class="ft hot-green hot">δ(G) = 2</span>',
          nodes: [2], edges: [],
          badge: "Δ=4, δ=2", tone: "",
          showDeg: "deg", viz: "degree",
          text: "全图最大的度记作 <b>Δ(G)</b>，最小的记作 <b>δ(G)</b>。C 的度最高（4），是这张网络的“枢纽”。"
        },
        {
          name: "自环计 2",
          formula: 'deg(C) = 相邻边 2 + <span class="ft hot">自环 ×2</span> = 4',
          nodes: [2], edges: [[2,2],[1,2],[2,3]],
          badge: "loop +2", tone: "red",
          showDeg: "deg",
          text: "C 上有一个<b>自环</b>：边的两端都落在 C，进出各算一次，所以给 deg(C) 贡献 <b>2</b>。"
        },
        {
          name: "握手定理为什么成立",
          formula: '每条边有两个端点 ⇒ <span class="ft hot">Σ deg(v) = 2 |E|</span>',
          nodes: [0,1,2,3,4,5], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[1,4],[2,2]],
          badge: "16 = 2×8", tone: "",
          showDeg: "deg", viz: "handshake",
          text: "逐条边看：每条边（含自环）都恰好给度数总和贡献 2。所以 Σdeg=2+3+4+2+3+2=<b>16</b>，而 2|E|=2×8=<b>16</b>，两边相等。"
        },
        {
          name: "用握手定理求边数",
          formula: '已知度序列 (2,3,4,2,3,2)：|E| = <span class="ft hot">Σdeg / 2</span> = 16/2 = <span class="ft hot-blue hot">8</span>',
          nodes: [0,1,2,3,4,5], edges: [],
          badge: "|E|=8", tone: "blue",
          showDeg: "deg",
          text: "握手定理最常用的方向：<b>不用数边，把度数加起来除以 2</b> 就得到边数。考题里给度序列求 |E|，就是这一步。"
        },
        {
          name: "奇度顶点推论",
          formula: 'Σdeg 为偶数 ⇒ <span class="ft hot">奇度顶点个数必为偶数</span>（本图：B、E）',
          nodes: [1, 4], edges: [],
          badge: "奇度成对", tone: "gold",
          showDeg: "deg",
          text: "若奇度顶点有奇数个，度数总和就会是奇数，与 Σdeg=2|E|（偶数）矛盾。所以<b>奇度顶点必成对出现</b>——B 和 E 正好一对。"
        },
        {
          name: "可图化判定 ①",
          formula: '序列 (3,2,1)：Σ=6 偶 ✓，但 <span class="ft hot">max 3 &gt; n−1 = 2</span> ✗',
          nodes: [], edges: [],
          badge: "不可图化", tone: "red",
          viz: "graphical1",
          text: "判断一个度序列能否画成<b>简单图</b>：先查两个必要条件——①Σ 为偶数；②最大度 ≤ n−1。序列 (3,2,1) 只有 3 个点，却要求某点连 3 条边，不可能。"
        },
        {
          name: "可图化判定 ②",
          formula: '序列 (2,2,2,1,1)：Σ=8 偶 ✓，max 2 ≤ 4 ✓ ⇒ <span class="ft hot-green hot">可图化</span>',
          nodes: [], edges: [],
          badge: "可图化", tone: "",
          viz: "graphical2",
          text: "序列 (2,2,2,1,1) 通过两个必要条件，且可以构造出来：一条 5 点路径 P₅ 的度序列正是 (1,2,2,2,1)。严格判定可用 Havel–Hakimi 算法逐步归约。"
        },
        {
          name: "有向图的握手",
          formula: '<span class="ft hot">Σ deg⁺(v) = Σ deg⁻(v) = |E|</span>',
          nodes: [0,1,2,3,4,5], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[1,4],[2,2]], directed: true,
          badge: "出=入=|E|", tone: "blue",
          showDeg: "out", viz: "degree",
          text: "把每条边定向后：每条边贡献恰好 1 个出度、1 个入度。所以出度总和、入度总和都等于边数 8。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      directed: false,
      mission: "把度数迁移到网络科学：度中心性、枢纽、幂律分布与鲁棒性。",
      badge: "度中心性 / 无标度",
      names: ["A", "B", "C", "D", "E", "F", "G", "H"],
      nodes: [
        { x: 0.46, y: 0.50 },                       // A: 枢纽
        { x: 0.18, y: 0.24 }, { x: 0.44, y: 0.12 }, // B C
        { x: 0.16, y: 0.72 }, { x: 0.42, y: 0.88 }, // D E
        { x: 0.74, y: 0.30 }, { x: 0.88, y: 0.58 }, // F G
        { x: 0.78, y: 0.86 }                        // H
      ],
      // 9 条边：deg A5 B2 C2 D2 E2 F2 G2 H1，Σ=18=2×9；移除 A → 3 个分量
      edges: [
        { u: 0, v: 1 }, { u: 0, v: 2 }, { u: 0, v: 3 }, { u: 0, v: 4 }, { u: 0, v: 5 },
        { u: 1, v: 2 }, { u: 3, v: 4 }, { u: 5, v: 6 }, { u: 6, v: 7 }
      ],
      steps: [
        {
          name: "度中心性",
          formula: 'C_D(v) = <span class="ft hot">deg(v) / (n−1)</span>  ⇒  C_D(A) = 5/7 ≈ <span class="ft hot-blue hot">0.71</span>',
          nodes: [0], edges: [[0,1],[0,2],[0,3],[0,4],[0,5]],
          badge: "C_D(A)=0.71", tone: "",
          showDeg: "deg", viz: "centrality",
          text: "把度数除以最大可能连接数 n−1，得到归一化的<b>度中心性</b>——网络分析中最基本的影响力指标。A 与 8 个点中的 5 个直连，中心性遥遥领先。"
        },
        {
          name: "识别枢纽 Hub",
          formula: 'hub = argmax deg(v) = <span class="ft hot">A</span>（deg=5，其余 ≤ 2）',
          nodes: [0], edges: [[0,1],[0,2],[0,3],[0,4],[0,5]],
          badge: "枢纽=A", tone: "gold",
          showDeg: "deg",
          text: "度数远高于平均值的节点是<b>枢纽(hub)</b>。真实网络里：航空网的北上广、社交网的大V、互联网的骨干路由器。"
        },
        {
          name: "度分布 P(k)",
          formula: 'P(k)：<span class="ft hot-green hot">k=1 ×1</span>，<span class="ft hot-blue hot">k=2 ×6</span>，<span class="ft hot">k=5 ×1</span> —— 长尾',
          nodes: [0,1,2,3,4,5,6,7], edges: [],
          badge: "长尾分布", tone: "blue",
          showDeg: "deg", viz: "distribution",
          text: "统计“度为 k 的顶点有几个”得到<b>度分布</b>。本网大量低度节点 + 一个高度枢纽，分布拖着长尾——这是真实网络的普遍形态。"
        },
        {
          name: "无标度网络",
          formula: '<span class="ft hot">P(k) ∼ k^(−γ)</span>，γ ≈ 2~3（幂律）',
          nodes: [0], edges: [],
          badge: "幂律", tone: "red",
          showDeg: "deg",
          text: "互联网、引文网、蛋白质网络的度分布近似<b>幂律</b>：没有“典型度数”（无标度）。成因之一是<b>优先连接</b>——新节点更愿意连向已有的枢纽（马太效应）。"
        },
        {
          name: "鲁棒 vs 脆弱",
          formula: '随机故障：多半删到低度点，网络无恙；定向攻击枢纽 A ⇒ 分量 <span class="ft hot">1 → 3</span>',
          nodes: [0], edges: [],
          badge: "1 → 3 块", tone: "red",
          ghost: [0], viz: "attack",
          text: "无标度网络对<b>随机故障很鲁棒</b>（大概率碰到低度点），却对<b>定向攻击极脆弱</b>：移除枢纽 A，网络立刻碎成 {B,C}、{D,E}、{F,G,H} 三块。关键节点的担当与风险并存。"
        },
        {
          name: "迁移：三个真实网络",
          formula: '<span class="ft hot">航空网 · 互联网 · 引文网</span> —— 都由度分布刻画',
          nodes: [0,1,2,3,4,5,6,7], edges: [[0,1],[0,2],[0,3],[0,4],[0,5],[1,2],[3,4],[5,6],[6,7]],
          badge: "transfer", tone: "gold",
          showDeg: "deg", viz: "networks",
          text: "航空网：少数枢纽机场承担多数中转；互联网：骨干节点需重点防护；引文网：经典论文被大量引用。<b>度数，是理解网络影响力与韧性的第一把尺。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { LEVELS, degrees, handshakeOK, oddVertices, components, degreeDistribution, graphicalQuickCheck };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.DEGREE_LEVEL] || LEVELS.basic;
  const N = level.nodes.length;
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
  const R = 20;

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  }

  if (missionEl) missionEl.innerHTML = "<b>互动任务：</b>" + esc(level.mission);
  if (badgeEl) badgeEl.textContent = level.badge;

  /* ---- 画布 ---- */
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
  function pos(size) {
    const padX = 54, padY = 46;
    return level.nodes.map(nd => ({
      x: padX + nd.x * (size.w - 2 * padX),
      y: padY + nd.y * (size.h - 2 * padY)
    }));
  }
  function edgeInSet(e, set) {
    return set.some(p => (p[0] === e.u && p[1] === e.v) || (p[0] === e.v && p[1] === e.u));
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
  function drawLoop(p, hot, dim) {
    const color = hot ? "#d63b1d" : dim ? "rgba(47,95,159,0.2)" : "rgba(47,95,159,0.62)";
    ctx.strokeStyle = color;
    ctx.lineWidth = hot ? 4 : 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y - R - 12, 14, Math.PI * 0.35, Math.PI * 2.75);
    ctx.stroke();
  }
  function draw() {
    const size = resize();
    const st = level.steps[step] || { nodes: [], edges: [] };
    const P = pos(size);
    const directed = st.directed != null ? st.directed : level.directed;
    const hlNodes = new Set(st.nodes || []);
    const hlEdges = st.edges || [];
    const ghost = new Set(st.ghost || []);
    const anyHl = hlNodes.size > 0 || hlEdges.length > 0;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    // edges
    level.edges.forEach(e => {
      const isGhost = ghost.has(e.u) || ghost.has(e.v);
      const hot = !isGhost && hlEdges.length ? edgeInSet(e, hlEdges) : false;
      const dim = (anyHl && !hot) || isGhost;
      if (e.u === e.v) { drawLoop(P[e.u], hot, dim); return; }
      const a = P[e.u], b = P[e.v];
      const color = hot ? "#d63b1d" : dim ? "rgba(47,95,159,0.16)" : "rgba(47,95,159,0.62)";
      ctx.strokeStyle = color;
      ctx.lineWidth = hot ? 4 : 2.2;
      ctx.setLineDash(isGhost ? [6, 6] : []);
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const sx = a.x + Math.cos(ang) * R, sy = a.y + Math.sin(ang) * R;
      const ex = b.x - Math.cos(ang) * R, ey = b.y - Math.sin(ang) * R;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.setLineDash([]);
      if (directed && !isGhost) drawArrowHead(ex, ey, ang, color);
    });

    // degree badges
    const showDeg = st.showDeg;
    let degData = null;
    if (showDeg) degData = degrees(N, level.edges, showDeg !== "deg");

    // nodes
    P.forEach((p, i) => {
      const hot = hlNodes.has(i);
      const isGhost = ghost.has(i);
      const dim = anyHl && !hot && !isGhost;
      ctx.beginPath();
      ctx.arc(p.x, p.y, hot ? R + 2 : R, 0, Math.PI * 2);
      if (isGhost) {
        ctx.fillStyle = "rgba(214, 59, 29,0.10)";
        ctx.fill();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "#d63b1d";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#d63b1d";
      } else {
        ctx.fillStyle = hot ? "#d63b1d" : dim ? "#cdbfae" : "#2f7d57";
        ctx.fill();
        ctx.strokeStyle = "#fff8ec";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = "#fff";
      }
      ctx.font = "800 14px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(level.names[i], p.x, p.y);

      // 度数徽标（金色）
      if (showDeg && !isGhost) {
        const v = showDeg === "out" ? degData.out[i] : showDeg === "in" ? degData.inn[i] : degData.deg[i];
        const bx = p.x + R + 4, by = p.y - R - 2;
        ctx.beginPath();
        ctx.arc(bx, by, 11, 0, Math.PI * 2);
        ctx.fillStyle = "#c58a1f";
        ctx.fill();
        ctx.strokeStyle = "#fff8ec";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.font = "800 11px 'JetBrains Mono', Consolas, monospace";
        ctx.fillText(String(v), bx, by);
      }
    });
    if (showDeg === "out" || showDeg === "in") {
      ctx.fillStyle = "#6b4a38";
      ctx.font = "700 12px 'Noto Serif SC', 'Microsoft YaHei', serif";
      ctx.textAlign = "left";
      ctx.fillText(showDeg === "out" ? "金色徽标 = 出度 deg⁺" : "金色徽标 = 入度 deg⁻", 14, 18);
    }
  }

  /* ---- 辅助可视化 ---- */
  function degreeHtml() {
    const st = level.steps[step] || {};
    const directed = (st.showDeg === "out" || st.showDeg === "in") || (st.directed != null ? st.directed : level.directed);
    const d = degrees(N, level.edges, directed);
    const rows = level.names.map((nm, i) =>
      '<span class="pill">' + nm + (directed ? "：出" + d.out[i] + " / 入" + d.inn[i] : "：deg " + d.deg[i]) + '</span>'
    ).join("");
    return '<div class="graph-summary"><b>度数表：</b><div class="pill-row">' + rows + '</div></div>';
  }
  function handshakeHtml() {
    const d = degrees(N, level.edges, false);
    const sum = d.deg.reduce((a, b) => a + b, 0);
    const odd = oddVertices(N, level.edges);
    return '<div class="graph-summary"><b>握手定理验证：</b>Σdeg(v)=' + d.deg.join("+") + '=' + sum +
      '，2|E|=2×' + level.edges.length + '=' + (2 * level.edges.length) +
      ' ✓。奇度顶点：' + (odd.length ? odd.map(i => level.names[i]).join("、") : "无") + '（' + odd.length + ' 个，偶数）。</div>';
  }
  function centralityHtml() {
    const d = degrees(N, level.edges, false);
    const rows = level.names.map((nm, i) =>
      '<span class="pill">' + nm + '：' + (d.deg[i] / (N - 1)).toFixed(2) + '</span>'
    ).join("");
    return '<div class="graph-summary"><b>度中心性 C_D(v)=deg(v)/(n−1)：</b><div class="pill-row">' + rows + '</div></div>';
  }
  function distributionHtml() {
    const dist = degreeDistribution(N, level.edges);
    const ks = Object.keys(dist).map(Number).sort((a, b) => a - b);
    const maxC = Math.max.apply(null, ks.map(k => dist[k]));
    const bars = ks.map(k =>
      '<div style="display:flex;align-items:center;gap:8px"><span class="pill" style="min-width:52px;text-align:center">k=' + k + '</span>' +
      '<div style="height:14px;border-radius:7px;background:linear-gradient(90deg,#d63b1d,#c58a1f);width:' + Math.round(dist[k] / maxC * 220) + 'px"></div>' +
      '<b>' + dist[k] + ' 个</b></div>'
    ).join("");
    return '<div class="graph-summary"><b>度分布 P(k)：</b><div style="display:grid;gap:6px;margin-top:8px">' + bars + '</div></div>';
  }
  function attackHtml() {
    const before = components(N, level.edges);
    const after = components(N, level.edges, 0);
    return '<div class="graph-summary"><b>攻击实验：</b>移除枢纽 ' + level.names[0] + ' 前连通分量 = ' + before +
      '；移除后 = <b>' + after + '</b>（{B,C}、{D,E}、{F,G,H}）。虚线表示被移除的节点与失效的边。</div>';
  }
  function graphical1Html() {
    const q = graphicalQuickCheck([3, 2, 1]);
    return '<div class="graph-summary"><b>检查 (3,2,1)：</b>Σ=' + q.sum + '（偶 ' + (q.sumEven ? "✓" : "✗") + '）；max=3 ≤ n−1=2？' + (q.maxOK ? "✓" : "<b>✗ 不满足</b>") + ' ⇒ 不可图化（简单图中一个点最多连 n−1 个点）。</div>';
  }
  function graphical2Html() {
    const q = graphicalQuickCheck([2, 2, 2, 1, 1]);
    return '<div class="graph-summary"><b>检查 (2,2,2,1,1)：</b>Σ=' + q.sum + '（偶 ✓）；max=2 ≤ 4 ✓ ⇒ 通过必要条件，且路径 P₅（端点度1、中间度2）恰好实现它 ⇒ <b>可图化</b>。</div>';
  }
  function networksHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">航空网：枢纽机场</span><span class="pill">互联网：骨干路由</span><span class="pill">引文网：经典论文</span></div>' +
      '高度数节点承担更多连接，也意味着更大的<b>担当与风险</b>——保护枢纽，就是保护整个网络。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    let html = "";
    switch (st.viz) {
      case "degree": html = degreeHtml(); break;
      case "handshake": html = handshakeHtml(); break;
      case "centrality": html = centralityHtml(); break;
      case "distribution": html = distributionHtml(); break;
      case "attack": html = attackHtml(); break;
      case "graphical1": html = graphical1Html(); break;
      case "graphical2": html = graphical2Html(); break;
      case "networks": html = networksHtml(); break;
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
    }, 1700);
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
