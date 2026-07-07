/* ============================================================
   7.1 图的基本概念 · 三层统一交互引擎
   window.GRAPH_LEVEL = "basic" | "advanced" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  // 无向度数：自环对该顶点计 2
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
    const sum = deg.reduce((a, b) => a + b, 0);
    return sum === 2 * edges.length;
  }
  function adjacency(n, edges, directed) {
    const m = Array.from({ length: n }, () => Array(n).fill(0));
    edges.forEach(e => {
      m[e.u][e.v] += 1;
      if (!directed && e.u !== e.v) m[e.v][e.u] += 1;
    });
    return m;
  }
  function components(n, edges) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { if (e.u !== e.v) { adj[e.u].push(e.v); adj[e.v].push(e.u); } });
    const seen = Array(n).fill(false);
    let c = 0;
    for (let i = 0; i < n; i++) if (!seen[i]) {
      c++; const q = [i]; seen[i] = true;
      while (q.length) { const u = q.shift(); adj[u].forEach(v => { if (!seen[v]) { seen[v] = true; q.push(v); } }); }
    }
    return c;
  }
  function isSimple(edges) {
    const seen = new Set();
    for (const e of edges) {
      if (e.u === e.v) return false;                 // 自环
      const k = e.u < e.v ? e.u + "-" + e.v : e.v + "-" + e.u;
      if (seen.has(k)) return false;                 // 平行边
      seen.add(k);
    }
    return true;
  }

  /* ---------------- 三层数据 ---------------- */
  // 顶点坐标为 [0,1] 归一化；边 {u,v,directed?,off?,w?}；off 用于平行边偏移，u===v 表示自环
  const LEVELS = {
    basic: {
      label: "基础层",
      directed: false,
      mission: "从对象和联系出发建立图模型，理解顶点、边、有向与无向的含义。",
      badge: "图 G=(V,E)",
      names: ["A", "B", "C", "D", "E"],
      nodes: [
        { x: 0.22, y: 0.30 }, { x: 0.50, y: 0.16 }, { x: 0.80, y: 0.30 },
        { x: 0.68, y: 0.80 }, { x: 0.30, y: 0.80 }
      ],
      edges: [
        { u: 0, v: 1 }, { u: 1, v: 2 }, { u: 2, v: 3 }, { u: 3, v: 4 }, { u: 4, v: 0 }, { u: 1, v: 4 }
      ],
      steps: [
        {
          name: "顶点集 V",
          formula: '<span class="ft hot-green hot">V = {A, B, C, D, E}</span>,  |V| = 5',
          nodes: [0, 1, 2, 3, 4], edges: [],
          badge: "|V|=5", tone: "",
          text: "把每个对象抽象成一个<b>顶点(vertex)</b>。5 个个体 → 5 个顶点。顶点是图里最小的“节点”。"
        },
        {
          name: "边集 E",
          formula: 'E = { <span class="ft hot">{A,B}, {B,C}, {C,D}, {D,E}, {E,A}, {B,E}</span> },  |E| = 6',
          nodes: [], edges: [[0,1],[1,2],[2,3],[3,4],[4,0],[1,4]],
          badge: "|E|=6", tone: "blue",
          text: "把每一段<b>联系</b>抽象成一条<b>边(edge)</b>。无向边写成无序对 {u,v}，6 段联系 → 6 条边。"
        },
        {
          name: "图 G=(V,E)",
          formula: '<span class="ft hot">G = (V, E)</span>',
          nodes: [0,1,2,3,4], edges: [[0,1],[1,2],[2,3],[3,4],[4,0],[1,4]],
          badge: "已建图", tone: "",
          text: "顶点集 V 加上边集 E，就构成一个<b>图 G=(V,E)</b>。对象与联系被统一在同一个模型里。"
        },
        {
          name: "关联与相邻",
          formula: '边 <span class="ft hot">e = {A, B}</span> ：A、B <b>相邻</b>，e 与 A、B <b>关联</b>',
          nodes: [0,1], edges: [[0,1]],
          badge: "incident", tone: "gold",
          text: "一条边连接的两个顶点互称<b>相邻(adjacent)</b>；这条边与它的两个端点互称<b>关联(incident)</b>。这是图最基本的两种关系。"
        },
        {
          name: "顶点的度 deg",
          formula: 'deg(B) = <span class="ft hot">3</span>   （与 B 关联的边：{A,B}, {B,C}, {B,E}）',
          nodes: [1], edges: [[0,1],[1,2],[1,4]],
          badge: "deg(B)=3", tone: "",
          viz: "degree", vizFocus: 1,
          text: "一个顶点的<b>度 deg(v)</b> 就是与它关联的边数。B 连了 3 条边，所以 deg(B)=3。度衡量一个节点“连接”的多少。"
        },
        {
          name: "握手定理",
          formula: '<span class="ft hot">Σ deg(v) = 2 |E|</span>  ⇒  2+3+2+2+3 = 12 = 2×6',
          nodes: [0,1,2,3,4], edges: [[0,1],[1,2],[2,3],[3,4],[4,0],[1,4]],
          badge: "12 = 2×6", tone: "",
          viz: "handshake",
          text: "每条边为它的两个端点各贡献 1 度，因此<b>所有顶点度数之和 = 边数的两倍</b>。这也说明：奇度顶点必为偶数个。"
        },
        {
          name: "无向 vs 有向",
          formula: '无向 {u,v} = {v,u}   ⇄   有向 <span class="ft hot">(u,v) ≠ (v,u)</span>',
          nodes: [0,1,2,3,4], edges: [[0,1],[1,2],[2,3],[3,4],[4,0],[1,4]], directed: true,
          badge: "有方向", tone: "blue",
          text: "给边加上<b>方向</b>就得到<b>有向图</b>：(u,v) 表示从 u 指向 v，和 (v,u) 不同。朋友关系是无向的，关注/转账是有向的。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      directed: false,
      mission: "辨识关联、相邻、自环、平行边等基本要素，区分简单图与多重图。",
      badge: "简单图 / 多重图",
      names: ["A", "B", "C", "D"],
      nodes: [
        { x: 0.28, y: 0.28 }, { x: 0.74, y: 0.26 }, { x: 0.76, y: 0.76 }, { x: 0.26, y: 0.76 }
      ],
      edges: [
        { u: 0, v: 1, off: 24 }, { u: 0, v: 1, off: -24 }, { u: 1, v: 2 },
        { u: 2, v: 3 }, { u: 3, v: 0 }, { u: 2, v: 2 }
      ],
      steps: [
        {
          name: "重温 G=(V,E)",
          formula: '<span class="ft hot">G = (V, E)</span>,  V={A,B,C,D},  |E|=6',
          nodes: [0,1,2,3], edges: [[0,1],[1,2],[2,3],[3,0],[2,2]],
          badge: "|V|=4", tone: "",
          text: "同样从顶点集与边集出发。注意这张图里既有<b>平行边</b>也有<b>自环</b>——它不再是“最干净”的简单图。"
        },
        {
          name: "关联(incidence)",
          formula: '<span class="ft hot">e = {B, C}</span> 与端点 B、C <b>关联</b>',
          nodes: [1,2], edges: [[1,2]],
          badge: "incident", tone: "gold",
          text: "边与它端点的“连接”叫<b>关联</b>；关联关系可用<b>关联矩阵</b>（顶点×边）记录。关联刻画“边碰到了哪些点”。"
        },
        {
          name: "相邻(adjacency)",
          formula: 'B、C <span class="ft hot-blue hot">相邻</span>（存在边直接相连）',
          nodes: [1,2], edges: [[1,2]],
          badge: "adjacent", tone: "blue",
          text: "两个顶点之间有边相连即<b>相邻</b>；相邻关系可用<b>邻接矩阵</b>（顶点×顶点）记录。相邻刻画“点与点谁挨着谁”。"
        },
        {
          name: "自环 self-loop",
          formula: '<span class="ft hot">e = {C, C}</span> ：两端点相同  →  deg(C) 计 +2',
          nodes: [2], edges: [[2,2]],
          badge: "loop", tone: "red",
          text: "两个端点是<b>同一个顶点</b>的边叫<b>自环</b>。计算度数时，自环给该顶点贡献 <b>2</b>（进出各一次）。"
        },
        {
          name: "平行边 parallel",
          formula: 'A、B 之间有 <span class="ft hot">2 条边</span> ：平行边(重边)',
          nodes: [0,1], edges: [[0,1]],
          badge: "parallel", tone: "gold",
          text: "连接<b>同一对顶点</b>的多条边叫<b>平行边/重边</b>。平行边表示同一对对象之间的多重联系（如多条航线）。"
        },
        {
          name: "简单图 vs 多重图",
          formula: '含自环或平行边  ⇒  <span class="ft hot">多重图</span>；都没有  ⇒  简单图',
          nodes: [0,1,2,3], edges: [[0,1],[2,2]],
          badge: "多重图", tone: "red",
          viz: "simple",
          text: "本图既有平行边(A-B)又有自环(C)，所以是<b>多重图</b>。去掉它们、每对顶点至多一条边且无自环，才是<b>简单图</b>。"
        },
        {
          name: "度与握手(含自环)",
          formula: '<span class="ft hot">Σ deg(v) = 2|E|</span>  ⇒  3+3+4+2 = 12 = 2×6',
          nodes: [0,1,2,3], edges: [[0,1],[1,2],[2,3],[3,0],[2,2]],
          badge: "12 = 2×6", tone: "",
          viz: "handshake",
          text: "握手定理对多重图仍成立：平行边照常各计 1，自环计 2。deg(C)=4 = 邻边2 + 自环2。"
        },
        {
          name: "邻接矩阵",
          formula: '<span class="ft hot-blue hot">A[i][j]</span> = i,j 间的边数（自环记在对角线）',
          nodes: [], edges: [],
          badge: "matrix", tone: "blue",
          viz: "matrix",
          text: "多重图的邻接矩阵元素可大于 1（平行边），对角线记自环。矩阵把图变成可计算的数据结构。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      directed: true,
      mission: "把普遍联系的观点迁移到真实网络，理解有向图即二元关系。",
      badge: "图 ≅ 二元关系",
      names: ["A", "B", "C", "D", "E", "F"],
      nodes: [
        { x: 0.20, y: 0.26 }, { x: 0.50, y: 0.14 }, { x: 0.80, y: 0.26 },
        { x: 0.82, y: 0.72 }, { x: 0.50, y: 0.84 }, { x: 0.18, y: 0.72 }
      ],
      edges: [
        { u: 0, v: 1, directed: true }, { u: 1, v: 2, directed: true }, { u: 2, v: 3, directed: true },
        { u: 3, v: 4, directed: true }, { u: 4, v: 5, directed: true }, { u: 5, v: 0, directed: true },
        { u: 0, v: 2, directed: true }, { u: 1, v: 4, directed: true }
      ],
      steps: [
        {
          name: "抽象：对象→顶点",
          formula: '真实网络  ⇒  <span class="ft hot">G = (V, E)</span>，V=节点，E=有向联系',
          nodes: [0,1,2,3,4,5], edges: [],
          badge: "|V|=6", tone: "",
          text: "网页、用户、城市……都抽象成<b>顶点</b>；超链接、关注、航班……抽象成<b>有向边</b>。同一套模型刻画不同真实网络。"
        },
        {
          name: "有向图 = 二元关系",
          formula: '<span class="ft hot">(u, v) ∈ E  ⟺  u R v</span>',
          nodes: [0,1], edges: [[0,1]],
          badge: "R ⊆ V×V", tone: "blue",
          text: "一条有向边 (u,v) 恰好对应二元关系里的一个有序对 u R v。<b>有向图与集合上的二元关系是一回事</b>——第3章的关系图正是有向图。"
        },
        {
          name: "邻接矩阵 = 关系矩阵",
          formula: '<span class="ft hot-blue hot">M[i][j] = 1</span>  ⟺  存在有向边 i→j',
          nodes: [], edges: [],
          badge: "matrix", tone: "blue",
          viz: "matrix",
          text: "有向图的邻接矩阵就是关系的<b>关系矩阵</b>：非对称说明关系非对称。矩阵乘法 M² 数的是长度为 2 的路径条数。"
        },
        {
          name: "出度 / 入度 · 中心性",
          formula: 'deg⁺(A)=<span class="ft hot">2</span>（出）,  deg⁻(A)=<span class="ft hot-green hot">1</span>（入）',
          nodes: [0], edges: [[0,1],[0,2],[5,0]],
          badge: "out/in", tone: "gold",
          viz: "degree", vizFocus: 0,
          text: "有向图每点分<b>出度</b>与<b>入度</b>。入度高≈被引用/被关注多，是<b>度中心性</b>的雏形——PageRank 正由此发展而来。"
        },
        {
          name: "可达与连通分量",
          formula: '沿方向可达  ⇒  <span class="ft hot">强/弱连通分量</span>',
          nodes: [0,1,2,3,4,5], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]],
          badge: "connected", tone: "",
          viz: "components",
          text: "顺着有向环 A→B→C→D→E→F→A 彼此可达，构成一个<b>强连通分量</b>。连通性是搜索引擎爬取、交通调度的基础。"
        },
        {
          name: "迁移：三类真实网络",
          formula: '<span class="ft hot">社交网(无向) · 交通网(有向加权) · 知识图谱(有向多重)</span>',
          nodes: [0,1,2,3,4,5], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,2],[1,4]],
          badge: "transfer", tone: "gold",
          viz: "networks",
          text: "同一图模型迁移到不同场景：朋友圈是无向图，地铁线路是有向加权图，知识图谱是带类型的有向多重图。<b>抓住“对象+联系”，万网归一。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { LEVELS, degrees, handshakeOK, adjacency, components, isSimple };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.GRAPH_LEVEL] || LEVELS.basic;
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
    const anyHl = hlNodes.size > 0 || hlEdges.length > 0;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    // edges
    level.edges.forEach(e => {
      const hot = hlEdges.length ? edgeInSet(e, hlEdges) : false;
      const dim = anyHl && !hot;
      if (e.u === e.v) { drawLoop(P[e.u], hot, dim); return; }
      const a = P[e.u], b = P[e.v];
      const color = hot ? "#d63b1d" : dim ? "rgba(47,95,159,0.2)" : "rgba(47,95,159,0.62)";
      ctx.strokeStyle = color;
      ctx.lineWidth = hot ? 4 : 2.2;
      const off = e.off || 0;
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const sx = a.x + Math.cos(ang) * R, sy = a.y + Math.sin(ang) * R;
      const ex = b.x - Math.cos(ang) * R, ey = b.y - Math.sin(ang) * R;
      if (off !== 0) {
        const mx = (sx + ex) / 2 - Math.sin(ang) * off;
        const my = (sy + ey) / 2 + Math.cos(ang) * off;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
        if (directed) drawArrowHead(ex, ey, Math.atan2(ey - my, ex - mx), color);
      } else {
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
        if (directed) drawArrowHead(ex, ey, ang, color);
      }
    });

    // nodes
    P.forEach((p, i) => {
      const hot = hlNodes.has(i);
      const dim = anyHl && !hot;
      ctx.beginPath();
      ctx.arc(p.x, p.y, hot ? R + 2 : R, 0, Math.PI * 2);
      ctx.fillStyle = hot ? "#d63b1d" : dim ? "#cdbfae" : "#2f7d57";
      ctx.fill();
      ctx.strokeStyle = "#fff8ec";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "800 14px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(level.names[i], p.x, p.y);
    });
  }

  /* ---- 辅助可视化（矩阵/度/连通等） ---- */
  function matrixHtml() {
    const directed = level.directed;
    const m = adjacency(N, level.edges, directed);
    const head = '<span class="matrix-cell head"></span>' + level.names.map(nm => '<span class="matrix-cell head">' + nm + '</span>').join("");
    const rows = m.map((row, i) =>
      '<span class="matrix-cell head">' + level.names[i] + '</span>' +
      row.map(v => '<span class="matrix-cell' + (v ? " one" : "") + '">' + v + '</span>').join("")
    ).join("");
    return '<div class="matrix-wrap"><div class="matrix-grid" style="grid-template-columns:repeat(' + (N + 1) + ',26px)">' +
      head + rows + '</div><div class="graph-summary">' +
      (directed ? "有向图的邻接矩阵一般<b>不对称</b>，即关系矩阵。" : "无向图的邻接矩阵<b>对称</b>；平行边使元素 &gt;1，自环记对角线。") +
      '</div></div>';
  }
  function degreeHtml(focus) {
    const directed = level.directed;
    const d = degrees(N, level.edges, directed);
    const rows = level.names.map((nm, i) =>
      '<span class="pill">' + nm + (directed ? "：出" + d.out[i] + " / 入" + d.inn[i] : "：deg " + d.deg[i]) + '</span>'
    ).join("");
    const f = focus != null ? focus : 0;
    return '<div class="graph-summary"><b>度数分布：</b>' +
      (directed ? "deg⁺(" + level.names[f] + ")=" + d.out[f] + "，deg⁻(" + level.names[f] + ")=" + d.inn[f] : "deg(" + level.names[f] + ")=" + d.deg[f]) +
      '<div class="pill-row">' + rows + '</div></div>';
  }
  function handshakeHtml() {
    const d = degrees(N, level.edges, false);
    const sum = d.deg.reduce((a, b) => a + b, 0);
    const odd = d.deg.filter(x => x % 2 === 1).length;
    return '<div class="graph-summary"><b>握手定理：</b>Σdeg(v)=' + sum + '，2|E|=' + (2 * level.edges.length) +
      '，两者相等 ✓。奇度顶点数=' + odd + '（必为偶数）。</div>';
  }
  function simpleHtml() {
    const simple = isSimple(level.edges);
    return '<div class="graph-summary"><b>判定：</b>本图' + (simple ? "无自环、无平行边 → 是<b>简单图</b>。" : "含自环/平行边 → 是<b>多重图</b>。") + '</div>';
  }
  function componentsHtml() {
    const c = components(N, level.edges);
    return '<div class="graph-summary"><b>连通分量数：</b>' + c + '。' + (c === 1 ? "整张网络连成一体，任意两点（弱）可达。" : "网络被分成 " + c + " 块。") + '</div>';
  }
  function networksHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">社交网 = 无向图</span><span class="pill">交通网 = 有向加权图</span><span class="pill">知识图谱 = 有向多重图</span></div>' +
      '同一套 G=(V,E) 覆盖三类真实网络——这正是“普遍联系”的数学表达。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    let html = "";
    switch (st.viz) {
      case "matrix": html = matrixHtml(); break;
      case "degree": html = degreeHtml(st.vizFocus); break;
      case "handshake": html = handshakeHtml(); break;
      case "simple": html = simpleHtml(); break;
      case "components": html = componentsHtml(); break;
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
    // step list
    Array.prototype.forEach.call(document.querySelectorAll(".step-item"), (el, i) => {
      el.classList.toggle("active", i === step);
      el.classList.toggle("done", i < step);
    });
    // progress
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
