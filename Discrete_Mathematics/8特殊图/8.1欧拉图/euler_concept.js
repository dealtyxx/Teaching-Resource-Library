/* ============================================================
   8.1 欧拉图 · 基础层/拓展层统一交互引擎（度奇偶判定 + 一笔画编号）
   window.EULER_LEVEL = "basic" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   （进阶层 euler-index.html 保留原有 Fleury/Hierholzer 动画，不走本引擎）
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  // 边 [u,v]，允许平行边（多重图）；自环这里不涉及
  function degrees(n, edges) {
    const d = Array(n).fill(0);
    edges.forEach(e => { d[e[0]]++; d[e[1]]++; });
    return d;
  }
  function oddVertices(n, edges) {
    const d = degrees(n, edges);
    const ids = [];
    d.forEach((x, i) => { if (x % 2 === 1) ids.push(i); });
    return ids;
  }
  function connected(n, edges) {
    if (n === 0) return true;
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
    // 只在有边的顶点集合上判连通
    const has = Array(n).fill(false);
    edges.forEach(e => { has[e[0]] = true; has[e[1]] = true; });
    let start = has.indexOf(true);
    if (start < 0) return true;
    const seen = Array(n).fill(false);
    const q = [start]; seen[start] = true;
    while (q.length) { const u = q.shift(); adj[u].forEach(v => { if (!seen[v]) { seen[v] = true; q.push(v); } }); }
    for (let i = 0; i < n; i++) if (has[i] && !seen[i]) return false;
    return true;
  }
  function eulerType(n, edges) {
    if (!connected(n, edges)) return "disconnected";
    const odd = oddVertices(n, edges).length;
    if (odd === 0) return "circuit";      // 欧拉回路
    if (odd === 2) return "path";         // 欧拉通路（半欧拉）
    return "none";                        // 不可一笔画
  }
  // 有向图：入度/出度
  function dirDeg(n, edges) {
    const out = Array(n).fill(0), inn = Array(n).fill(0);
    edges.forEach(e => { out[e[0]]++; inn[e[1]]++; });
    return { out, inn };
  }
  function dirEulerBalanced(n, edges) {
    const { out, inn } = dirDeg(n, edges);
    let plus = 0, minus = 0;
    for (let i = 0; i < n; i++) {
      const diff = out[i] - inn[i];
      if (diff === 1) plus++;
      else if (diff === -1) minus++;
      else if (diff !== 0) return "none";
    }
    if (plus === 0 && minus === 0) return "circuit";
    if (plus === 1 && minus === 1) return "path";
    return "none";
  }
  // 校验一笔画序列：相邻端点有边、每条边恰用一次、用满全部边
  function validTrail(edges, seq, directed) {
    const used = Array(edges.length).fill(false);
    for (let i = 0; i + 1 < seq.length; i++) {
      const a = seq[i], b = seq[i + 1];
      let k = -1;
      for (let j = 0; j < edges.length; j++) {
        if (used[j]) continue;
        if (directed) { if (edges[j][0] === a && edges[j][1] === b) { k = j; break; } }
        else if ((edges[j][0] === a && edges[j][1] === b) || (edges[j][0] === b && edges[j][1] === a)) { k = j; break; }
      }
      if (k < 0) return false;
      used[k] = true;
    }
    return used.every(Boolean);
  }

  /* ---------------- 图库 ---------------- */
  const AZ = "ABCDEFGH".split("");
  const GRAPHS = {
    // 信封/房子：一笔画经典，恰 2 个奇度顶点（半欧拉）
    envelope: {
      names: AZ.slice(0, 5), caption: "信封图（一笔画经典）",
      nodes: [
        { x: 0.2, y: 0.85 }, { x: 0.8, y: 0.85 }, { x: 0.2, y: 0.42 }, { x: 0.8, y: 0.42 }, { x: 0.5, y: 0.1 }
      ],
      edges: [[0, 1], [1, 3], [3, 2], [2, 0], [0, 3], [1, 2], [2, 4], [3, 4]]
    },
    // 正方形回路：全偶，欧拉回路
    square: {
      names: AZ.slice(0, 4), caption: "四边形 C₄（全偶）",
      nodes: [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.2 }, { x: 0.8, y: 0.8 }, { x: 0.2, y: 0.8 }],
      edges: [[0, 1], [1, 2], [2, 3], [3, 0]]
    },
    // 哥尼斯堡七桥：多重图，4 个奇度顶点，不可一笔画
    konigsberg: {
      names: ["北岸", "南岸", "岛", "西岸"], caption: "哥尼斯堡七桥（4 奇点）",
      nodes: [{ x: 0.5, y: 0.12 }, { x: 0.5, y: 0.88 }, { x: 0.82, y: 0.5 }, { x: 0.18, y: 0.5 }],
      edges: [[0, 2], [0, 2], [0, 3], [1, 2], [1, 2], [1, 3], [2, 3]]
    },
    // 邮路：六边形 + 一条弦，恰 2 奇点
    postman: {
      names: AZ.slice(0, 6), caption: "街道网 G（B、E 为奇点）",
      nodes: [
        { x: 0.15, y: 0.25 }, { x: 0.5, y: 0.08 }, { x: 0.85, y: 0.25 },
        { x: 0.85, y: 0.78 }, { x: 0.5, y: 0.95 }, { x: 0.15, y: 0.78 }
      ],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4]]
    },
    // 邮路加固：复制弦 B–E，全偶，可欧拉回路
    postmanFixed: {
      names: AZ.slice(0, 6), caption: "重复弦 B–E 后：全偶",
      nodes: [
        { x: 0.15, y: 0.25 }, { x: 0.5, y: 0.08 }, { x: 0.85, y: 0.25 },
        { x: 0.85, y: 0.78 }, { x: 0.5, y: 0.95 }, { x: 0.15, y: 0.78 }
      ],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4], [1, 4]]
    },
    // DNA de Bruijn：有向，含重复节点，欧拉通路
    debruijn: {
      names: ["CA", "AT", "TG", "GT"], caption: "de Bruijn 图（有向，边=3-mer）", directed: true,
      nodes: [{ x: 0.12, y: 0.5 }, { x: 0.42, y: 0.18 }, { x: 0.72, y: 0.5 }, { x: 0.42, y: 0.85 }],
      edges: [[0, 1], [1, 2], [2, 1], [1, 3]]
    }
  };

  /* ---------------- 三层步骤数据 ----------------
     showDeg: 画度数徽标；odd: 高亮奇度顶点；trail: 一笔画编号序列 */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "从『一笔画』出发，用顶点度的奇偶判断能不能不重复走遍每条边。",
      badge: "一笔画 / 度判定",
      steps: [
        {
          name: "什么是一笔画",
          graph: "envelope",
          formula: '一笔画 = <span class="ft hot">笔不离纸、每条边恰走一次</span>',
          badge: "问题", tone: "",
          text: "这个“信封”能不能一笔画成（不重复、不遗漏地描完每条边）？图论把它叫作<b>欧拉通路/回路</b>问题。先别急着试，我们找规律。"
        },
        {
          name: "哥尼斯堡七桥",
          graph: "konigsberg",
          formula: '七座桥，能否<span class="ft hot">每桥恰走一次</span>回到原地？',
          badge: "1736", tone: "gold",
          text: "300 年前的名题：一次走遍七桥。欧拉把四块陆地抽象成<b>顶点</b>、七座桥抽象成<b>边</b>（两地间有 2 座桥就是 2 条平行边）——图论由此诞生。"
        },
        {
          name: "顶点的度",
          graph: "konigsberg", showDeg: true,
          formula: '各顶点度：岛=<span class="ft hot">5</span>，其余三地各 <span class="ft hot">3</span>',
          badge: "度数", tone: "blue",
          text: "数每个顶点连了几座桥（金色徽标）。欧拉的关键洞察：能否一笔画，<b>只看度数的奇偶</b>，与桥怎么摆无关。"
        },
        {
          name: "奇度顶点是障碍",
          graph: "konigsberg", odd: [0, 1, 2, 3],
          formula: '<span class="ft hot">4 个奇度顶点</span> ⇒ 七桥无解（不可一笔画）',
          badge: "4 奇点", tone: "red", viz: "eulercheck",
          text: "除起点终点外，每次“进一个点必有一条边出去”，进出成对，要求度为偶。奇度顶点是<b>卡点</b>：一笔画最多容忍 2 个（起点、终点）。七桥有 4 个，故无解。"
        },
        {
          name: "全偶 ⇒ 欧拉回路",
          graph: "square", trail: [0, 1, 2, 3, 0], showDeg: true,
          formula: '所有度为偶 ⇒ 存在<span class="ft hot-green hot">欧拉回路</span>（可回到起点）',
          badge: "回路 ✓", tone: "", viz: "eulercheck",
          text: "四边形每点度都是 2（全偶）——跟着金色编号走：A→B→C→D→A，<b>每条边恰一次并回到起点</b>。这就是欧拉回路。"
        },
        {
          name: "恰2奇 ⇒ 欧拉通路",
          graph: "envelope", trail: [0, 2, 4, 3, 2, 1, 0, 3, 1], odd: [0, 1],
          formula: '恰 2 个奇点 ⇒ 存在<span class="ft hot">欧拉通路</span>（从一奇点走到另一奇点）',
          badge: "通路 ✓", tone: "gold", viz: "eulercheck",
          text: "信封的两个下角 A、B 是奇度（红圈）。从一个奇点出发，跟编号一笔画到另一个奇点——画得成，但<b>回不到起点</b>。这是半欧拉图。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "把欧拉判据用到工程：中国邮路配对奇点、有向欧拉与 DNA 拼接。",
      badge: "邮路 / DNA",
      steps: [
        {
          name: "复习：欧拉回路",
          graph: "square", trail: [0, 1, 2, 3, 0], showDeg: true,
          formula: '连通 + 全偶 ⇒ <span class="ft hot-green hot">欧拉回路</span>（一次巡遍所有边并返程）',
          badge: "回路", tone: "",
          text: "巡检、清扫、布线这类“走遍每条边”的任务，理想情形是<b>欧拉回路</b>：不空跑、不重复、回到起点。现实往往不这么理想——于是有了邮路问题。"
        },
        {
          name: "中国邮路问题",
          graph: "postman", odd: [1, 4], showDeg: true,
          formula: '若有奇点，必须<span class="ft hot">重复走一些边</span>，求总重复最短',
          badge: "奇点=1,4", tone: "red", viz: "eulercheck",
          text: "邮递员要走遍每条街再回邮局。这张街网 B、E 是奇点（红圈）——非欧拉图。<b>中国邮路问题</b>：加最少的重复里程，让它变成能一笔画的欧拉图。"
        },
        {
          name: "配对奇点 · 加边变全偶",
          graph: "postmanFixed", edges: [[1, 4]], showDeg: true,
          formula: '把两奇点间<span class="ft hot">最短路的边复制一遍</span> ⇒ 奇点消失，全偶',
          badge: "全偶 ✓", tone: "", viz: "eulercheck",
          text: "沿 B、E 间最短路把边<b>复制一份</b>（红色重边=重复走一次）：B、E 度数各 +1 变偶，全图变欧拉图。管梅谷 1962 年提出的解法，故称“中国邮路”。"
        },
        {
          name: "有向欧拉图",
          graph: "debruijn", showDeg: true,
          formula: '有向图欧拉通路 ⟺ 至多一点 <span class="ft hot">出度−入度=1</span>、一点 =−1，其余相等',
          badge: "入=出", tone: "blue", viz: "direulercheck",
          text: "单行道网络要看<b>入度与出度</b>：欧拉回路要求每点入度=出度；欧拉通路允许一个起点(出−入=1)和一个终点(入−出=1)。方向让判据更精细。"
        },
        {
          name: "DNA 测序 = 欧拉通路",
          graph: "debruijn", trail: [0, 1, 2, 1, 3],
          formula: '把 k-mer 建成 de Bruijn 图，求<span class="ft hot">欧拉通路</span> ⇒ 拼出原序列',
          badge: "基因组拼接", tone: "gold",
          text: "测序仪打碎 DNA 成小片段(k-mer)：以重叠部分为顶点、片段为有向边建<b>de Bruijn 图</b>，一条欧拉通路（编号路线，经过节点 AT 两次=重复片段）就<b>重建出完整基因组</b>。"
        },
        {
          name: "迁移总结",
          graph: "postmanFixed",
          formula: '<span class="ft hot">巡检邮路 · 电路测试 · 基因拼接</span>——都靠度的奇偶',
          badge: "transfer", tone: "gold", viz: "transferlist",
          text: "扫雪车/洒水车路线、电路板单笔布线测试、生物基因组拼接，本质都是欧拉路径问题。<b>把最朴素的“度数奇偶”摸清，复杂工程便一气呵成、不留遗憾。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, degrees, oddVertices, connected, eulerType, dirDeg, dirEulerBalanced, validTrail };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.EULER_LEVEL] || LEVELS.basic;
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
  function trailSteps(st) {
    if (!st.trail) return [];
    const out = [];
    for (let i = 0; i + 1 < st.trail.length; i++) out.push({ u: st.trail[i], v: st.trail[i + 1], idx: i + 1 });
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
  function draw() {
    const size = resize();
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    const R = 16;
    // 居中压缩到较小区域，图整体缩小
    const gW = Math.min(size.w * 0.62, size.h * 0.78);
    const ox = (size.w - gW) / 2, oy = size.h * 0.1, gH = size.h * 0.72;
    const P = g.nodes.map(nd => ({ x: ox + nd.x * gW, y: oy + nd.y * gH }));
    const ts = trailSteps(st);
    const hlEdges = st.edges || [];
    const oddSet = new Set(st.odd || []);
    const anyHl = hlEdges.length > 0 || ts.length > 0;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    // 平行边偏移计数
    const pairOcc = {};
    g.edges.forEach((e, ei) => {
      const key = g.directed ? e[0] + ">" + e[1] : Math.min(e[0], e[1]) + "-" + Math.max(e[0], e[1]);
      const others = g.edges.filter((x, xi) => xi <= ei && (g.directed ? (x[0] === e[0] && x[1] === e[1]) : (Math.min(x[0], x[1]) === Math.min(e[0], e[1]) && Math.max(x[0], x[1]) === Math.max(e[0], e[1])))).length;
      const total = g.edges.filter(x => (g.directed ? (x[0] === e[0] && x[1] === e[1]) : (Math.min(x[0], x[1]) === Math.min(e[0], e[1]) && Math.max(x[0], x[1]) === Math.max(e[0], e[1])))).length;
      const idx = others - 1;
      const off = total > 1 ? (idx - (total - 1) / 2) * 26 : 0;

      const onTrail = ts.some(p => (p.u === e[0] && p.v === e[1]) || (!g.directed && p.u === e[1] && p.v === e[0]));
      const hot = onTrail || edgeIn(hlEdges, e);
      const dim = anyHl && !hot;
      const color = hot ? "#d63b1d" : dim ? "rgba(47,95,159,0.2)" : "rgba(47,95,159,0.62)";
      ctx.strokeStyle = color;
      ctx.lineWidth = hot ? 4 : 2.4;
      const a = P[e[0]], b = P[e[1]];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const sx = a.x + Math.cos(ang) * R, sy = a.y + Math.sin(ang) * R;
      const ex = b.x - Math.cos(ang) * R, ey = b.y - Math.sin(ang) * R;
      if (off !== 0) {
        const mx = (sx + ex) / 2 - Math.sin(ang) * off;
        const my = (sy + ey) / 2 + Math.cos(ang) * off;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
        if (g.directed) drawArrowHead(ex, ey, Math.atan2(ey - my, ex - mx), color);
      } else {
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
        if (g.directed) drawArrowHead(ex, ey, ang, color);
      }
    });

    // 一笔画编号
    const occ = {};
    ts.forEach(p => {
      const key = Math.min(p.u, p.v) + "-" + Math.max(p.u, p.v);
      occ[key] = (occ[key] || 0);
      const a = P[p.u], b = P[p.v];
      const t = 0.5 + (occ[key] % 2 === 0 ? -1 : 1) * 0.16 * Math.ceil(occ[key] / 2);
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

    const d = degrees(g.nodes.length, g.edges);
    const dd = g.directed ? dirDeg(g.nodes.length, g.edges) : null;

    P.forEach((p, i) => {
      const isOdd = oddSet.has(i);
      const onTrailNode = st.trail && (i === st.trail[0] || i === st.trail[st.trail.length - 1]);
      const dim = anyHl && !onTrailNode && !isOdd && !st.showDeg;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
      ctx.fillStyle = onTrailNode ? "#d63b1d" : dim ? "#cdbfae" : "#2f7d57";
      ctx.fill();
      // 奇度红环
      if (isOdd) {
        ctx.strokeStyle = "#d63b1d";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, R + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = "#fff8ec";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "800 " + (g.names[i].length > 1 ? 10 : 13) + "px 'JetBrains Mono', 'Noto Serif SC', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y);

      // 度数徽标
      if (st.showDeg) {
        const label = g.directed ? (dd.out[i] + "/" + dd.inn[i]) : String(d[i]);
        const bx = p.x + R + 4, by = p.y - R - 2;
        const bw = g.directed ? 30 : 22;
        ctx.fillStyle = (!g.directed && d[i] % 2 === 1) ? "#d63b1d" : "#c58a1f";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx - bw / 2, by - 10, bw, 20, 7); else ctx.rect(bx - bw / 2, by - 10, bw, 20);
        ctx.fill();
        ctx.strokeStyle = "#fff8ec";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.font = "800 10px 'JetBrains Mono', Consolas, monospace";
        ctx.fillText(label, bx, by);
      }
    });

    if (g.directed && level.steps[step].showDeg) {
      ctx.fillStyle = "#6b4a38";
      ctx.font = "700 11px 'Noto Serif SC', 'Microsoft YaHei', serif";
      ctx.textAlign = "left";
      ctx.fillText("徽标 = 出度/入度", 14, 16);
    }
    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.fillText(g.caption, size.w / 2, size.h - 18);
  }

  /* ---- 辅助可视化 ---- */
  function eulercheckHtml(g) {
    const t = eulerType(g.nodes.length, g.edges);
    const odd = oddVertices(g.nodes.length, g.edges);
    const label = { circuit: "欧拉回路（全偶）", path: "欧拉通路（恰2奇点）", none: "不可一笔画", disconnected: "不连通" }[t];
    return '<div class="graph-summary"><b>欧拉判定：</b>奇度顶点 ' + odd.length + ' 个' +
      (odd.length ? '（' + odd.map(i => g.names[i]).join("、") + '）' : '') + ' ⇒ <b>' + label + '</b>。</div>';
  }
  function direulercheckHtml(g) {
    const t = dirEulerBalanced(g.nodes.length, g.edges);
    const { out, inn } = dirDeg(g.nodes.length, g.edges);
    const rows = g.names.map((nm, i) => '<span class="pill">' + nm + '：出' + out[i] + '/入' + inn[i] + '</span>').join("");
    const label = { circuit: "有向欧拉回路", path: "有向欧拉通路", none: "无有向欧拉路" }[t];
    return '<div class="graph-summary"><b>有向欧拉判定：</b><div class="pill-row">' + rows + '</div>⇒ <b>' + label + '</b>。</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">环卫车/邮路：中国邮路</span><span class="pill">电路测试：单笔布线</span><span class="pill">基因组：de Bruijn 拼接</span></div>' +
      '一个“度数奇偶”，撑起了从街道调度到生命科学的路径规划。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const g = GRAPHS[st.graph];
    let html = "";
    switch (st.viz) {
      case "eulercheck": html = eulercheckHtml(g); break;
      case "direulercheck": html = direulercheckHtml(g); break;
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
