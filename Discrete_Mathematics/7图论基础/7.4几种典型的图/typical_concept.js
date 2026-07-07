/* ============================================================
   7.4 几种典型的图 · 三层统一交互引擎（每步切换典型图 + 左栏信息卡）
   window.TYPICAL_LEVEL = "basic" | "advanced" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   左栏 #sideInfo：定义与性质 + 当前属性 |V|/|E|（位于步骤选择下方）
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
  // Q3 超立方体：顶点=3位二进制，恰差一位相邻
  function q3Edges() {
    const es = [];
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
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
  // C5 的补图（在 5 个顶点上）：恰是五角星，仍 2-正则
  function complementEdges(n, edges) {
    const es = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++)
      if (!hasEdge(edges, i, j)) es.push([i, j]);
    return es;
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
  const GRAPHS = {
    n6: {
      names: AZ.slice(0, 6), caption: "一个普通的 6 阶图",
      nodes: [{x:.2,y:.2},{x:.6,y:.1},{x:.92,y:.4},{x:.75,y:.85},{x:.35,y:.9},{x:.08,y:.55}],
      edges: [[0,1],[1,2],[2,3],[3,4],[2,5]]
    },
    k4: { names: AZ.slice(0, 4), caption: "完全图 K₄", nodes: ring(4, .38, .5, .5), edges: knEdges(4) },
    k6: { names: AZ.slice(0, 6), caption: "完全图 K₆", nodes: ring(6, .42, .5, .5), edges: knEdges(6) },
    c5: { names: AZ.slice(0, 5), caption: "圈图 C₅（2-正则）", nodes: ring(5, .4, .5, .5), edges: c5Edges },
    c6: { names: AZ.slice(0, 6), caption: "圈图 C₆", nodes: ring(6, .4, .5, .5), edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]] },
    c5comp: {
      names: AZ.slice(0, 5), caption: "C₅ 的补图（五角星）",
      nodes: ring(5, .4, .5, .5), edges: complementEdges(5, c5Edges)
    },
    prism: {
      names: AZ.slice(0, 6), caption: "三棱柱图（3-正则）",
      nodes: [{x:.5,y:.06},{x:.94,y:.84},{x:.06,y:.84},{x:.5,y:.34},{x:.7,y:.68},{x:.3,y:.68}],
      edges: [[0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[0,3],[1,4],[2,5]]
    },
    tour5: {
      names: AZ.slice(0, 5), caption: "5 阶竞赛图（K₅ 定向）", directed: true,
      nodes: ring(5, .4, .5, .5),
      edges: [0,1,2,3,4].flatMap(i => [[i,(i+1)%5],[i,(i+2)%5]])
    },
    petersen: {
      names: ["0","1","2","3","4","5","6","7","8","9"], caption: "彼得森图（10 点 15 边 3-正则）",
      nodes: ring(5, .44, .5, .5).concat(ring(5, .2, .5, .5)),
      edges: [0,1,2,3,4].map(i => [i,(i+1)%5])
        .concat([0,1,2,3,4].map(i => [i, i+5]))
        .concat([0,1,2,3,4].map(i => [5+i, 5+(i+2)%5]))
    },
    q3: {
      names: ["000","001","011","010","100","101","111","110"], caption: "3-立方体图 Q₃（顶点=二进制串）",
      nodes: [
        {x:.14,y:.44},{x:.62,y:.44},{x:.62,y:.94},{x:.14,y:.94},
        {x:.38,y:.06},{x:.86,y:.06},{x:.86,y:.56},{x:.38,y:.56}
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
      names: ["甲", "乙", "丙", "T₁", "T₂", "T₃"], caption: "二部图：员工—任务",
      nodes: [
        {x:.12,y:.15},{x:.12,y:.5},{x:.12,y:.85},
        {x:.88,y:.15},{x:.88,y:.5},{x:.88,y:.85}
      ],
      edges: [[0,3],[0,4],[1,3],[1,5],[2,5]]
    },
    k24: {
      names: ["S₁", "S₂", "L₁", "L₂", "L₃", "L₄"], caption: "两层交换拓扑 K₂,₄（Spine—Leaf）",
      nodes: [
        {x:.32,y:.12},{x:.68,y:.12},
        {x:.08,y:.85},{x:.36,y:.85},{x:.64,y:.85},{x:.92,y:.85}
      ],
      edges: [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5]]
    }
  };

  /* ---------------- 三层步骤数据 ----------------
     每步：graph 选图；icon/defText 渲染左栏信息卡（定义与性质 + 当前属性） */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "从 K₄ 数到 K₆，验证边数公式 n(n-1)/2，再认识“各点同度”的正则图。",
      badge: "Kₙ 与正则图",
      steps: [
        {
          name: "完全图 K₄", graph: "k4", icon: "🌟",
          formula: 'K₄：任意两点都相邻，|E| = <span class="ft hot">4×3/2 = 6</span>',
          badge: "K₄", tone: "",
          defText: "任意两个顶点之间都恰有一条边的简单图称为完全图，记作 Kₙ。",
          text: "4 个人两两握手：每个点都连向其余 3 个点。数一数，恰好 <b>6</b> 条边——这就是完全图 K₄，『人人互联』的最紧密结构。"
        },
        {
          name: "升级到 K₆", graph: "k6", icon: "🌟",
          formula: '|E(K₆)| = <span class="ft hot">6×5/2 = 15</span>',
          badge: "15 条边", tone: "blue",
          defText: "Kₙ 的边数 = C(n,2) = n(n-1)/2，随 n 呈平方级增长。",
          text: "顶点从 4 涨到 6，边数从 6 涨到 <b>15</b>——完全互联的成本是<b>平方级</b>的。这就是为什么大网络不可能人人直连。"
        },
        {
          name: "每点度数 n−1", graph: "k6", icon: "🌟",
          nodes: [0], edges: [[0,1],[0,2],[0,3],[0,4],[0,5]],
          formula: 'K₆ 中每点 deg(v) = <span class="ft hot">n−1 = 5</span>',
          badge: "deg=5", tone: "", viz: "degtable",
          defText: "完全图中每个顶点都与其余 n−1 个顶点相邻。",
          text: "看红色高亮：顶点 A 连向其余 <b>5</b> 个点。每个点都一样——这种“各点同度”的性质，引出下一个概念：<b>正则图</b>。"
        },
        {
          name: "正则图：各点同度", graph: "c5", icon: "⚖️",
          formula: 'C₅ 每点 deg = 2  ⇒  <span class="ft hot-green hot">2-正则图</span>',
          badge: "2-正则", tone: "", viz: "regular",
          defText: "每个顶点度数都等于 k 的图称为 k-正则图。",
          text: "圈图 C₅ 每个点恰好 2 条边，谁也不多谁也不少——<b>2-正则</b>。正则图体现『均衡发展、人人平等』的结构。"
        },
        {
          name: "3-正则：三棱柱", graph: "prism", icon: "⚖️",
          formula: '每点 deg=3 ⇒ 3-正则；|E| = <span class="ft hot">nk/2 = 6×3/2 = 9</span>',
          badge: "3-正则", tone: "blue", viz: "regular",
          defText: "k-正则图的边数 = nk/2（握手定理直接推出）。",
          text: "三棱柱图：外三角 + 内三角 + 三条竖边，每点恰 3 条边。用握手定理心算边数：6×3/2=<b>9</b> ✓。"
        },
        {
          name: "Kₙ 是 (n−1)-正则", graph: "k6", icon: "🌟",
          formula: '完全图 Kₙ 是 <span class="ft hot">(n−1)-正则图</span>（正则图的特例）',
          badge: "特例", tone: "gold", viz: "regular",
          defText: "完全图是正则图的特例：K₆ 即 5-正则图。",
          text: "把两个概念连起来：K₆ 每点度 5，所以它是 <b>5-正则图</b>。完全图 ⊂ 正则图——概念之间也有“结构”。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "逐一识别并构造六类典型图，掌握每类图的参数公式与判定特征。",
      badge: "典型图图鉴",
      steps: [
        {
          name: "n 阶图", graph: "n6", icon: "🏗️",
          formula: '|V| = <span class="ft hot">6</span>  ⇒  6 阶图',
          badge: "n=6", tone: "",
          defText: "具有 n 个顶点的图称为 n 阶图，通常用 |V|=n 表示。",
          text: "“阶”就是顶点个数，代表系统的<b>规模与体量</b>。基础不牢、地动山摇——一切结构分析都从数清规模开始。"
        },
        {
          name: "K-正则图", graph: "prism", icon: "⚖️",
          formula: '∀v: deg(v) = k = 3  ⇒  <span class="ft hot">3-正则</span>，|E| = nk/2 = 9',
          badge: "3-正则", tone: "blue", viz: "regular",
          defText: "各顶点度数均为 k 的图称为 k-正则图；边数 = nk/2。",
          text: "正则图没有“特权节点”，负载天然均衡——对等网络（P2P）的理想形态。判定方法：把度数表扫一遍，全相等即正则。"
        },
        {
          name: "完全图 Kₙ", graph: "k6", icon: "🌟",
          formula: '|E(K₆)| = C(6,2) = <span class="ft hot">15</span>；K₆ 是 (n−1)-正则',
          badge: "K₆", tone: "",
          defText: "任两点均相邻的简单图；边数 n(n-1)/2，是 (n−1)-正则图。",
          text: "完全图是“最稠密”的简单图：任何 n 阶简单图的边数都不超过 n(n-1)/2。它是衡量稠密程度的<b>天花板</b>。"
        },
        {
          name: "二部图", graph: "bip", icon: "🤝",
          nodes: [0,1,2],
          formula: 'V = X ∪ Y，边只跨两部  ⟺  <span class="ft hot">不含奇圈</span>',
          badge: "两分", tone: "blue",
          defText: "顶点可分成两部分，边只在两部分之间。判定：不含奇数长度的圈。",
          text: "左边是员工、右边是任务，边只从左到右——<b>二部图</b>刻画『各尽其责、协作配对』的供需关系。判定口诀：<b>无奇圈 ⟺ 二部</b>。"
        },
        {
          name: "补图", graph: "c5comp", icon: "🔄",
          formula: 'G̅：原图的边不在、原图的非边全在；<span class="ft hot">C₅ 的补图 ≅ C₅</span>',
          badge: "自补!", tone: "gold", viz: "regular",
          defText: "补图 G̅ 与 G 顶点相同，边集互补：{u,v}∈E(G̅) ⟺ {u,v}∉E(G)。",
          text: "把 C₅ 的边全部“取反”得到五角星——上一节刚证过五角星 ≅ C₅！所以 <b>C₅ 是自补图</b>。|E(G)|+|E(G̅)| = n(n-1)/2。"
        },
        {
          name: "圈图与路径", graph: "c6", icon: "🔗",
          formula: 'Cₙ：n 点 n 边、2-正则；<span class="ft hot-blue hot">Pₙ：n 点 n−1 边</span>',
          badge: "Cₙ / Pₙ", tone: "",
          defText: "圈图 Cₙ 首尾相接（n≥3）；路径 Pₙ 是去掉一条边的圈。",
          text: "C₆：每点度 2、恰好一个圈。剪断任意一条边就变成路径 P₆。圈是“冗余环路”，路径是“单线串联”——网络容错的最小对比模型。"
        },
        {
          name: "竞赛图", graph: "tour5", icon: "🏆",
          formula: 'K₅ 每条边定向 ⇒ <span class="ft hot">竞赛图</span>；|E| = C(5,2) = 10',
          badge: "单循环赛", tone: "red",
          defText: "完全图的每条边指定一个方向所得的有向图；模型：单循环赛。",
          text: "5 支队伍单循环赛：每两队恰赛一场，胜者得到指向负者的边。竞赛图必有<b>哈密顿路径</b>——总能排出一个“击败链”名次。"
        },
        {
          name: "彼得森图", graph: "petersen", icon: "⭐",
          formula: '10 点 15 边 <span class="ft hot">3-正则</span>，围长 5',
          badge: "反例之星", tone: "gold", viz: "regular",
          defText: "外五边形 + 内五角星 + 五条辐条；高度对称的 3-正则图。",
          text: "图论中最著名的“反例明星”：许多看似成立的猜想都栽在它手里。结构完美对称，却<b>不是哈密顿图</b>——美而倔强。"
        },
        {
          name: "K-立方体图", graph: "q3", icon: "🧊",
          formula: 'Q₃：顶点 = 3 位二进制串，<span class="ft hot">恰差一位 ⟺ 相邻</span>；|V|=2³, |E|=3·2² =12',
          badge: "Q₃", tone: "blue", viz: "regular",
          defText: "Qₖ：顶点是 k 位二进制串，恰好一位不同的串相邻；k-正则，|V|=2ᵏ。",
          text: "看顶点标号：000—001—011…每走一条边恰好翻转一位。Qₖ 是 <b>k-正则</b>、维度可无限升级的“多维发展”结构，也是并行计算的经典拓扑。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "把二部图匹配用于任务分配，把正则/立方体结构用于数据中心拓扑设计。",
      badge: "匹配 / 拓扑",
      steps: [
        {
          name: "二部图建模", graph: "bip", icon: "🤝",
          formula: '员工 X = {甲,乙,丙}，任务 Y = {T₁,T₂,T₃}，边 = <span class="ft hot">“能胜任”</span>',
          badge: "建模", tone: "",
          defText: "二部图：顶点两分、边只跨部；天然刻画“资源—需求”关系。",
          text: "把“谁能干哪个活”画成二部图：甲会 T₁/T₂，乙会 T₁/T₃，丙只会 T₃。<b>分配问题从此变成图问题</b>。"
        },
        {
          name: "匹配与完美匹配", graph: "bip", icon: "🎯",
          edges: [[0,4],[1,3],[2,5]], nodes: [0,1,2,3,4,5],
          formula: 'M = {<span class="ft hot">甲–T₂, 乙–T₁, 丙–T₃</span>}：两两不共点 ⇒ 完美匹配',
          badge: "完美匹配", tone: "", viz: "matching",
          defText: "匹配：两两不共顶点的边集；饱和所有顶点的匹配称完美匹配。",
          text: "红色三条边人人有活、活活有人，互不冲突——<b>完美匹配</b>。人岗相适的“最优配置”，就是图论里的一个边集。"
        },
        {
          name: "Hall 婚配定理", graph: "bip", icon: "📜",
          nodes: [0,1],
          formula: '存在饱和 X 的匹配 ⟺ ∀S⊆X: <span class="ft hot">|N(S)| ≥ |S|</span>',
          badge: "Hall 条件", tone: "blue",
          defText: "Hall 定理：任意 k 个左部顶点的邻居总数 ≥ k，匹配才存在。",
          text: "什么时候必然“配得齐”？<b>任何一组人的可选任务不能比人少</b>。若甲乙都只会 T₁，则 |N({甲,乙})|=1 < 2，必有人落空——瓶颈一眼可查。"
        },
        {
          name: "数据中心拓扑：Q₃", graph: "q3", icon: "🧊",
          formula: '超立方体网络：直径 = k = <span class="ft hot">log₂|V|</span>，任两点间 k 条不相交路径',
          badge: "超立方", tone: "blue", viz: "regular",
          defText: "Qₖ 用作并行机/集群互连：短直径、强容错、可递归扩展。",
          text: "8 台服务器按 Q₃ 连线：任意两台最多 3 跳可达，且有 <b>3 条完全不相交</b>的备用路径——断一两条线网络照常运转。"
        },
        {
          name: "Spine–Leaf 拓扑", graph: "k24", icon: "🏗️",
          nodes: [0,1], edges: [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5]],
          formula: '完全二部图 K₂,₄：任意两台 Leaf 间恒为 <span class="ft hot">2 跳</span>，带宽均衡',
          badge: "K₂,₄", tone: "",
          defText: "现代数据中心的 Spine-Leaf 架构 = 完全二部图：层内不连、层间全连。",
          text: "上层 Spine、下层 Leaf，跨层全连——这正是<b>完全二部图</b>。任意两台服务器等距（2 跳）、多路径负载均衡，胖树(Fat-tree)就是它的递归版。"
        },
        {
          name: "迁移总结", graph: "q3", icon: "🚀",
          formula: '<span class="ft hot">匹配 = 最优配置，典型拓扑 = 容错与带宽</span>',
          badge: "transfer", tone: "gold", viz: "transferlist",
          defText: "典型图是工程系统的“积木”：选对结构，性能与公平兼得。",
          text: "二部图匹配调度滴滴订单与外卖骑手；正则/立方体/胖树拓扑支撑超算与云。<b>因地制宜选结构，正是“结构之美、社会之理”的工程落地。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, degrees, regularK, completeEdges, knEdges, q3Edges, isTournament, isMatching, complementEdges, hasEdge };
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
    const R = g.nodes.length > 8 ? 15 : 18;
    const padX = 46, padTop = 30, padBot = 50;
    const P = g.nodes.map(nd => ({
      x: padX + nd.x * (size.w - 2 * padX),
      y: padTop + nd.y * (size.h - padTop - padBot)
    }));
    const hlNodes = new Set(st.nodes || []);
    const hlEdges = st.edges || [];
    const anyHl = hlNodes.size > 0 || hlEdges.length > 0;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    g.edges.forEach(e => {
      const hot = edgeIn(hlEdges, e);
      const dim = anyHl && !hot;
      const color = hot ? "#d63b1d" : dim ? "rgba(47,95,159,0.18)" : "rgba(47,95,159,0.6)";
      ctx.strokeStyle = color;
      ctx.lineWidth = hot ? 4 : 2;
      const a = P[e[0]], b = P[e[1]];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const sx = a.x + Math.cos(ang) * R, sy = a.y + Math.sin(ang) * R;
      const ex = b.x - Math.cos(ang) * R, ey = b.y - Math.sin(ang) * R;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      if (g.directed) drawArrowHead(ex, ey, ang, color);
    });

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
      ctx.font = "800 " + (g.names[i].length > 2 ? 10 : 13) + "px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y);
    });

    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.fillText(g.caption, size.w / 2, size.h - 20);
  }

  /* ---- 左栏信息卡：定义与性质 + 当前属性 ---- */
  function renderSideInfo(st) {
    if (!sideInfo) return;
    const g = GRAPHS[st.graph];
    sideInfo.innerHTML =
      '<div class="info-head"><span>' + (st.icon || "📚") + '</span><span>' + esc(st.name) + '</span></div>' +
      '<p class="info-def">' + esc(st.defText || "") + '</p>' +
      '<div class="info-stats">' +
        '<div class="stat-box"><span class="lab">顶点数 |V|</span><span class="val">' + g.nodes.length + '</span></div>' +
        '<div class="stat-box"><span class="lab">边数 |E|</span><span class="val">' + g.edges.length + '</span></div>' +
      '</div>';
  }

  /* ---- 辅助可视化 ---- */
  function degtableHtml(g) {
    const d = degrees(g.nodes.length, g.edges);
    const rows = g.names.map((nm, i) => '<span class="pill">' + nm + '：' + d[i] + '</span>').join("");
    return '<div class="graph-summary"><b>度数表：</b><div class="pill-row">' + rows + '</div></div>';
  }
  function regularHtml(g) {
    const k = regularK(g.nodes.length, g.edges);
    return '<div class="graph-summary"><b>正则性检查：</b>' +
      (k >= 0 ? "各点度数全为 " + k + " ⇒ <b>" + k + "-正则图</b>；|E| = nk/2 = " + g.nodes.length + "×" + k + "/2 = " + g.edges.length + " ✓"
              : "度数不全相等 ⇒ 非正则图") + '</div>';
  }
  function matchingHtml() {
    return '<div class="graph-summary"><b>匹配检验：</b>' +
      '<div class="pill-row"><span class="pill">甲–T₂ ✓</span><span class="pill">乙–T₁ ✓</span><span class="pill">丙–T₃ ✓</span></div>' +
      '三条边两两不共顶点，且饱和全部 6 个顶点 ⇒ <b>完美匹配</b>。</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">网约车/外卖：二部图匹配</span><span class="pill">超算互连：Qₖ 立方体</span><span class="pill">数据中心：Spine-Leaf 二部</span></div>' +
      '选对典型结构，公平、带宽与容错就有了数学保证。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const g = GRAPHS[st.graph];
    let html = "";
    switch (st.viz) {
      case "degtable": html = degtableHtml(g); break;
      case "regular": html = regularHtml(g); break;
      case "matching": html = matchingHtml(); break;
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
      '<div class="step-item" data-i="' + i + '"><span class="num">' + (i + 1) + '</span><span>' + (s.icon ? s.icon + " " : "") + esc(s.name) + '</span></div>'
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
