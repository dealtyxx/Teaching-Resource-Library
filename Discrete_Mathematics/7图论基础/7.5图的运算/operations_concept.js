/* ============================================================
   7.5 图的运算 · 三层统一交互引擎（运算前后对照 + 左栏信息卡）
   window.OPS_LEVEL = "basic" | "advanced" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   删点/删边以虚线幽灵态呈现；左栏 #sideInfo：定义与解析 + 运算结果 |V|/|E|
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  function hasEdge(edges, u, v) {
    return edges.some(e => (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u));
  }
  function edgeUnion(a, b) {
    const out = a.slice();
    b.forEach(e => { if (!hasEdge(out, e[0], e[1])) out.push(e); });
    return out;
  }
  function edgeInter(a, b) { return a.filter(e => hasEdge(b, e[0], e[1])); }
  function edgeDiff(a, b) { return a.filter(e => !hasEdge(b, e[0], e[1])); }
  function complementEdges(n, edges) {
    const out = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++)
      if (!hasEdge(edges, i, j)) out.push([i, j]);
    return out;
  }
  // 连通分量：支持删点（连带关联边）与删边
  function componentsCount(n, edges, removedNodes, removedEdges) {
    const rn = new Set(removedNodes || []);
    const re = removedEdges || [];
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => {
      if (rn.has(e[0]) || rn.has(e[1])) return;
      if (re.some(r => (r[0] === e[0] && r[1] === e[1]) || (r[0] === e[1] && r[1] === e[0]))) return;
      adj[e[0]].push(e[1]); adj[e[1]].push(e[0]);
    });
    const seen = Array(n).fill(false);
    rn.forEach(i => { seen[i] = true; });
    let c = 0;
    for (let i = 0; i < n; i++) if (!seen[i]) {
      c++; const q = [i]; seen[i] = true;
      while (q.length) { const u = q.shift(); adj[u].forEach(v => { if (!seen[v]) { seen[v] = true; q.push(v); } }); }
    }
    return c;
  }

  /* ---------------- 图库 ---------------- */
  // 基础层：同顶点集 V={A..E} 上的两张图
  const GE = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]];              // E(G)
  const HE = [[0, 1], [2, 3], [3, 4], [0, 4]];                      // E(H)
  const pent = [0, 1, 2, 3, 4].map(i => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
    return { x: 0.5 + 0.4 * Math.cos(a), y: 0.5 + 0.4 * Math.sin(a) };
  });
  // 进阶层：母图 = 三角形ABC —CD桥— 三角形DEF
  const motherNodes = [
    { x: 0.1, y: 0.25 }, { x: 0.3, y: 0.05 }, { x: 0.34, y: 0.45 },
    { x: 0.64, y: 0.55 }, { x: 0.9, y: 0.3 }, { x: 0.72, y: 0.92 }
  ];
  const motherEdges = [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3]];
  // 拓展层：双环 + 桥
  const netNodes = [
    { x: 0.08, y: 0.2 }, { x: 0.3, y: 0.05 }, { x: 0.36, y: 0.42 }, { x: 0.14, y: 0.6 },
    { x: 0.62, y: 0.6 }, { x: 0.66, y: 0.95 }, { x: 0.92, y: 0.82 }, { x: 0.9, y: 0.42 }
  ];
  const netEdges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [3, 4]];
  const AZ = "ABCDEFGHI".split("");

  const GRAPHS = {
    g5: { names: AZ.slice(0, 5), caption: "图 G（5 点 5 边）", nodes: pent, edges: GE },
    h5: { names: AZ.slice(0, 5), caption: "图 H（同顶点集，4 边）", nodes: pent, edges: HE },
    union5: { names: AZ.slice(0, 5), caption: "并图 G ∪ H", nodes: pent, edges: edgeUnion(GE, HE) },
    diff5: { names: AZ.slice(0, 5), caption: "差图 G − H", nodes: pent, edges: edgeDiff(GE, HE) },
    comp5: { names: AZ.slice(0, 5), caption: "补图 G̅", nodes: pent, edges: complementEdges(5, GE) },
    mother: { names: AZ.slice(0, 6), caption: "母图 G：两个三角形 + 桥 CD", nodes: motherNodes, edges: motherEdges },
    contracted: {
      names: ["A", "B", "C·D", "E", "F"], caption: "收缩 G/CD：C、D 并为一点",
      nodes: [
        { x: 0.12, y: 0.3 }, { x: 0.35, y: 0.06 }, { x: 0.5, y: 0.52 },
        { x: 0.9, y: 0.3 }, { x: 0.72, y: 0.92 }
      ],
      edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2]]
    },
    ladder: {
      names: ["u₁", "u₂", "u₃", "v₁", "v₂", "v₃"], caption: "笛卡尔积 K₂ □ P₃（梯子图）",
      nodes: [
        { x: 0.15, y: 0.22 }, { x: 0.5, y: 0.22 }, { x: 0.85, y: 0.22 },
        { x: 0.15, y: 0.78 }, { x: 0.5, y: 0.78 }, { x: 0.85, y: 0.78 }
      ],
      edges: [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4], [2, 5]]
    },
    net: { names: AZ.slice(0, 8), caption: "网络 G：双环模块 + 桥 D–E", nodes: netNodes, edges: netEdges },
    netfix: {
      names: AZ.slice(0, 8), caption: "加固后：补上备用边 B–G",
      nodes: netNodes, edges: netEdges.concat([[1, 6]])
    },
    grid: {
      names: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], caption: "笛卡尔积 P₃ □ P₃（网格）",
      nodes: [0, 1, 2].flatMap(r => [0, 1, 2].map(c => ({ x: 0.15 + c * 0.35, y: 0.12 + r * 0.38 }))),
      edges: (function () {
        const es = [];
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
          const i = r * 3 + c;
          if (c < 2) es.push([i, i + 1]);
          if (r < 2) es.push([i, i + 3]);
        }
        return es;
      })()
    }
  };

  /* ---------------- 三层步骤数据 ---------------- */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "在同一组顶点上，对两张图做并、交、差、补，逐个看边集怎样变化。",
      badge: "并 / 交 / 差 / 补",
      steps: [
        {
          name: "图 G", graph: "g5", icon: "🅶",
          formula: 'E(G) = {AB, BC, CD, DA, <span class="ft hot">AC</span>},  |E| = 5',
          badge: "|E(G)|=5", tone: "",
          defText: "运算的第一个操作数：顶点集 V={A..E}，边集 E(G)。",
          text: "先认识第一张图 G：四边形 ABCD 加一条对角线 AC。图的运算就是对这些<b>边集合</b>做集合运算。"
        },
        {
          name: "图 H", graph: "h5", icon: "🅷",
          formula: 'E(H) = {AB, CD, <span class="ft hot-blue hot">DE, AE</span>},  |E| = 4',
          badge: "|E(H)|=4", tone: "blue",
          defText: "运算的第二个操作数：与 G 同顶点集，边集不同。",
          text: "第二张图 H 建在<b>同一组顶点</b>上：保留 AB、CD，新增 DE、AE。同顶点集是做并/交/差的前提。"
        },
        {
          name: "并 G ∪ H", graph: "union5", icon: "➕",
          edges: [[3, 4], [0, 4]],
          formula: 'E(G∪H) = E(G) ∪ E(H)，|E| = <span class="ft hot">7</span>（红色为 H 带来的新边）',
          badge: "并图", tone: "",
          defText: "并图：两图边集取并集，顶点集取并集。",
          text: "把两张图<b>叠在一起</b>：G 的 5 条边全保留，H 又贡献了 DE、AE 两条新边（红色高亮），共 7 条。并 = 资源整合。"
        },
        {
          name: "交 G ∩ H", graph: "union5", icon: "✖️",
          edges: [[0, 1], [2, 3]],
          formula: 'E(G∩H) = {<span class="ft hot">AB, CD</span>}，|E| = 2',
          badge: "交图", tone: "gold",
          defText: "交图：只保留两图公共的边。",
          text: "只留<b>两张图都有</b>的边：AB 和 CD（红色），其余淡出。交 = 求同存异中的“同”。"
        },
        {
          name: "差 G − H", graph: "g5", icon: "➖",
          edges: [[1, 2], [3, 0], [0, 2]],
          formula: 'E(G−H) = E(G) \\ E(H) = {<span class="ft hot">BC, DA, AC</span>}，|E| = 3',
          badge: "差图", tone: "red",
          defText: "差图：从 G 中删去与 H 公共的边。",
          text: "从 G 出发，把 H 里也有的 AB、CD <b>剪掉</b>，剩下 BC、DA、AC 三条（红色）。差 = 找出“我有你无”的部分。"
        },
        {
          name: "补 G̅", graph: "comp5", icon: "🌗",
          formula: '|E(G̅)| = C(5,2) − |E(G)| = <span class="ft hot">10 − 5 = 5</span>',
          badge: "补图", tone: "blue",
          defText: "补图 G̅：原图的边全去掉、原图没有的边全补上。",
          text: "把 G <b>整个取反</b>：原有的 5 条边消失，原来“缺”的 5 条边（AE、BD、BE、CE、DE）全部补上。补 = 逆向思维。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "掌握子图/导出子图、删点删边、收缩与笛卡尔积——由小构大、由大拆小。",
      badge: "删·缩·并·积",
      steps: [
        {
          name: "子图与母图", graph: "mother", icon: "🧩",
          nodes: [0, 1, 2], edges: [[0, 1], [1, 2]],
          formula: "V'⊆V 且 E'⊆E  ⇒  G'=(V',E') 是 G 的<span class=\"ft hot\">子图</span>",
          badge: "子图", tone: "",
          defText: "设 G=(V,E)，若 V'⊆V 且 E'⊆E，则 G'=(V',E') 是 G 的子图，G 称母图。",
          text: "红色部分 {A,B,C} 加 2 条边就是一个<b>子图</b>——局部与整体：个体既独立存在，又是母图的有机组成部分。"
        },
        {
          name: "导出子图", graph: "mother", icon: "🧩",
          nodes: [0, 1, 2], edges: [[0, 1], [1, 2], [2, 0]],
          formula: "E' 含 V' 间的<span class=\"ft hot\">全部</span>原边  ⇒  导出子图 G[V']",
          badge: "导出", tone: "blue",
          defText: "若 E' 恰含 V' 中所有在 G 中的边，则 G' 称为 G 的导出子图 G[V']。",
          text: "同样取 {A,B,C}，但把它们之间的边<b>一条不落</b>全带上（三角形 3 条）——这就是<b>导出子图</b>。“选人就得把他们之间的关系全算上”。"
        },
        {
          name: "删边 G − e", graph: "mother", icon: "✂️",
          ghostEdges: [[0, 1]],
          formula: 'G − AB：|E| 7→6，连通分量 <span class="ft hot-green hot">1 → 1</span>（仍连通）',
          badge: "删边", tone: "", viz: "delimpact",
          defText: "删边：仅去掉边本身，顶点保留。",
          text: "剪掉 AB（虚线）：A、B 还能绕 C 相通——环上删一条边<b>不伤连通</b>。冗余环路就是网络的“备胎”。"
        },
        {
          name: "删点 G − v", graph: "mother", icon: "💥",
          ghostNodes: [2],
          formula: 'G − C：连带删去关联边，连通分量 <span class="ft hot">1 → 2</span>！',
          badge: "删点", tone: "red", viz: "delimpact",
          defText: "删点：顶点及其所有关联边一起删除。",
          text: "删掉 C（虚线圈）连带删 3 条关联边——图立刻裂成 {A,B} 和 {D,E,F} 两块！C 是<b>割点</b>，删点的冲击远大于删边。"
        },
        {
          name: "收缩 G / e", graph: "contracted", icon: "🔗",
          nodes: [2],
          formula: '把边 CD 两端点<span class="ft hot">并为一点</span>：|V| 6→5，|E| 7→6',
          badge: "收缩", tone: "gold",
          defText: "收缩：删去边 e 并把两端点合并成一个新顶点，保留其余邻接关系。",
          text: "把桥 CD “捏合”成一个超级节点 C·D（红色）：两个三角形共享一点。收缩是<b>化简网络、提炼骨架</b>的运算（图子式理论的基石）。"
        },
        {
          name: "并图整合", graph: "union5", icon: "🤝",
          edges: [[3, 4], [0, 4]],
          formula: 'G ∪ H：|E| = 5 + 4 − |G∩H| = 5+4−2 = <span class="ft hot">7</span>（容斥）',
          badge: "并图", tone: "",
          defText: "并图边数满足容斥原理：|E(G∪H)| = |E(G)|+|E(H)|−|E(G∩H)|。",
          text: "回到集合运算，但这次用<b>容斥原理</b>算边数：5+4−2=7，与直接数边一致。运算之间是自洽的。"
        },
        {
          name: "差图分析", graph: "g5", icon: "➖",
          edges: [[1, 2], [3, 0], [0, 2]],
          formula: 'G − H 保留 <span class="ft hot">G 独有</span>的 3 条边；注意 G−H ≠ H−G',
          badge: "不对称", tone: "red",
          defText: "差图不满足交换律：G−H 与 H−G 一般不同。",
          text: "G−H 有 3 条边，H−G 只有 2 条（DE、AE）——<b>差运算不对称</b>，方向很重要，就像“改革清单”从谁的角度列大不一样。"
        },
        {
          name: "笛卡尔积 K₂□P₃", graph: "ladder", icon: "✖️",
          edges: [[0, 3], [1, 4], [2, 5]],
          formula: '|V| = 2×3 = 6，|E| = <span class="ft hot">2×|E(P₃)| + 3×|E(K₂)|</span> = 4+3 = 7',
          badge: "积图", tone: "blue",
          defText: "笛卡尔积 G□H：顶点为有序对，(u,v)~(u',v') ⟺ 一坐标相等、另一坐标相邻。",
          text: "两份 P₃ 平行摆放，再按 K₂ 竖着连 3 条“梯档”（红色）——<b>由小图构造规则大图</b>。Q₃ 立方体 = K₂□K₂□K₂，正是上一节的老朋友。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "用删点删边模拟故障与攻击，用补边与积运算做加固与模块化设计。",
      badge: "容错 / 模块化",
      steps: [
        {
          name: "模拟故障：删边", graph: "net", icon: "⚡",
          ghostEdges: [[0, 1]],
          formula: '随机故障 G − AB：连通分量 <span class="ft hot-green hot">1 → 1</span>，网络无恙',
          badge: "容错 ✓", tone: "", viz: "delimpact",
          defText: "鲁棒性测试①：删边模拟链路故障，看连通性是否保持。",
          text: "线路 AB 断了（虚线）：环形模块内自动绕行，服务不中断。<b>环冗余</b>是最朴素的容错设计。"
        },
        {
          name: "模拟攻击：删桥点", graph: "net", icon: "💥",
          ghostNodes: [3],
          formula: '定向攻击 G − D：连通分量 <span class="ft hot">1 → 2</span>，网络断裂！',
          badge: "脆弱 ✗", tone: "red", viz: "delimpact",
          defText: "鲁棒性测试②：删点模拟节点被攻击/宕机，割点是最大软肋。",
          text: "攻击桥头堡 D：两个模块<b>彻底失联</b>。桥（割边）与割点是单点故障源——风险评估必须先找到它们。"
        },
        {
          name: "补边加固", graph: "netfix", icon: "🛠️",
          edges: [[1, 6]],
          formula: '加备用边 B–G 后再删 D：连通分量 <span class="ft hot-green hot">1 → 1</span>，韧性达标',
          badge: "加固 ✓", tone: "", viz: "fiximpact",
          defText: "加固：用“补边”运算添加冗余联结，消除单点故障。",
          text: "补上跨模块备用边 B–G（红色）：现在即使 D 被打掉，流量仍可绕行。<b>破立并举</b>——删是试压，补是筑底。"
        },
        {
          name: "模块化：联合+接口", graph: "netfix", icon: "🧩",
          edges: [[3, 4], [1, 6]],
          formula: '系统 = G₁ ∪ G₂ ∪ <span class="ft hot">接口边</span>（解耦模块 + 最少联结）',
          badge: "模块化", tone: "blue",
          defText: "模块化设计：先做独立模块（子图），再用少量接口边做并运算拼装。",
          text: "两个环各自是<b>高内聚模块</b>，红色接口边（D–E、B–G）把它们松耦合地拼成系统——微服务架构的图论原型。"
        },
        {
          name: "积运算扩展规模", graph: "grid", icon: "✖️",
          formula: 'P₃ □ P₃：|V| = 3×3 = 9，|E| = <span class="ft hot">3×2 + 3×2 = 12</span>，规则可复制',
          badge: "网格", tone: "blue",
          defText: "笛卡尔积按“行×列”批量复制结构，是可扩展拓扑的生成器。",
          text: "3×3 网格 = P₃□P₃：芯片布线、传感器阵列、集群互连都这样“<b>从模板批量生成</b>”。要扩容？把 P₃ 换成 P₁₀ 即可。"
        },
        {
          name: "迁移总结", graph: "netfix", icon: "🚀",
          formula: '<span class="ft hot">删 = 压力测试，补 = 冗余设计，积 = 规模复制</span>',
          badge: "transfer", tone: "gold", viz: "transferlist",
          defText: "图运算是网络工程的“动词”：测试、加固、拼装、扩展。",
          text: "混沌工程删点删边做故障演练；容灾设计补边消除割点；数据中心用积图批量扩展。<b>于变局中开新局，先算清结构的账。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, hasEdge, edgeUnion, edgeInter, edgeDiff, complementEdges, componentsCount };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.OPS_LEVEL] || LEVELS.basic;
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
    const ghostN = new Set(st.ghostNodes || []);
    const ghostE = st.ghostEdges || [];
    const anyHl = hlNodes.size > 0 || hlEdges.length > 0;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    g.edges.forEach(e => {
      const isGhost = ghostN.has(e[0]) || ghostN.has(e[1]) || edgeIn(ghostE, e);
      const hot = !isGhost && edgeIn(hlEdges, e);
      const dim = (anyHl && !hot) || isGhost;
      ctx.strokeStyle = isGhost ? "rgba(214, 59, 29,0.45)" : hot ? "#d63b1d" : dim ? "rgba(47,95,159,0.18)" : "rgba(47,95,159,0.6)";
      ctx.lineWidth = hot ? 4 : 2;
      ctx.setLineDash(isGhost ? [6, 6] : []);
      const a = P[e[0]], b = P[e[1]];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      ctx.beginPath();
      ctx.moveTo(a.x + Math.cos(ang) * R, a.y + Math.sin(ang) * R);
      ctx.lineTo(b.x - Math.cos(ang) * R, b.y - Math.sin(ang) * R);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    P.forEach((p, i) => {
      const hot = hlNodes.has(i);
      const isGhost = ghostN.has(i);
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

  /* ---- 左栏信息卡：定义与解析 + 运算结果（扣除幽灵态后的有效值） ---- */
  function effectiveCounts(st) {
    const g = GRAPHS[st.graph];
    const ghostN = new Set(st.ghostNodes || []);
    const ghostE = st.ghostEdges || [];
    const v = g.nodes.length - ghostN.size;
    const e = g.edges.filter(ed =>
      !ghostN.has(ed[0]) && !ghostN.has(ed[1]) && !edgeIn(ghostE, ed)
    ).length;
    return { v, e };
  }
  function renderSideInfo(st) {
    if (!sideInfo) return;
    const c = effectiveCounts(st);
    sideInfo.innerHTML =
      '<div class="info-head"><span>' + (st.icon || "📚") + '</span><span>' + esc(st.name) + '</span></div>' +
      '<p class="info-def">' + esc(st.defText || "") + '</p>' +
      '<div class="info-stats">' +
        '<div class="stat-box"><span class="lab">当前顶点数</span><span class="val">' + c.v + '</span></div>' +
        '<div class="stat-box"><span class="lab">当前边数</span><span class="val">' + c.e + '</span></div>' +
      '</div>';
  }

  /* ---- 辅助可视化 ---- */
  function delimpactHtml(st) {
    const g = GRAPHS[st.graph];
    const before = componentsCount(g.nodes.length, g.edges);
    const after = componentsCount(g.nodes.length, g.edges, st.ghostNodes, st.ghostEdges);
    return '<div class="graph-summary"><b>连通性冲击：</b>运算前连通分量 = ' + before +
      '，运算后 = <b>' + after + '</b>。' +
      (after > before ? "结构被撕裂——命中割点/桥，需重点防护。" : "仍然连通——冗余路径吸收了这次冲击。") + '</div>';
  }
  function fiximpactHtml() {
    const net = GRAPHS.net, fix = GRAPHS.netfix;
    const brokeOld = componentsCount(net.nodes.length, net.edges, [3]);
    const brokeNew = componentsCount(fix.nodes.length, fix.edges, [3]);
    return '<div class="graph-summary"><b>加固对比：</b>删 D 后连通分量——加固前 = ' + brokeOld +
      '，加固后 = <b>' + brokeNew + '</b>。一条备用边就消除了单点故障。</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">混沌工程：删点删边演练</span><span class="pill">容灾设计：补边除割点</span><span class="pill">集群扩展：笛卡尔积模板</span></div>' +
      '图运算把“改革方案”变成可计算、可验证的结构变换。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    let html = "";
    switch (st.viz) {
      case "delimpact": html = delimpactHtml(st); break;
      case "fiximpact": html = fiximpactHtml(); break;
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
