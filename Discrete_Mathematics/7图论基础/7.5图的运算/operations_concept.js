/* ============================================================
   7.5 图的运算 · 三层统一交互引擎（运算前后对照 + 左栏信息卡）
   window.OPS_LEVEL = "basic" | "advanced" | "extend"
   交互：上一步 / 下一步 / 自动播放（可调速）/ 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   全章统一配色：普通顶点=主红白字，本步关注=金，结果=绿；普通边=淡褐灰细线，高亮边=主红加粗，
   运算结果边=绿加粗；被删去/去掉的点与边=灰虚线。左栏 #sideInfo：定义与解析 + 运算后 |V|/|E|
   约定：本页的并、交、差、环和都在同一顶点集 V 上进行，只对边集做集合运算。
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
  // 环和 G⊕H = (G∪H) − (G∩H)
  function edgeRingSum(a, b) { return edgeDiff(edgeUnion(a, b), edgeInter(a, b)); }
  function complementEdges(n, edges) {
    const out = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++)
      if (!hasEdge(edges, i, j)) out.push([i, j]);
    return out;
  }
  // 连通分支数：支持删点（连带关联边）与删边
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
  // 笛卡尔积 G□H：顶点 (i,j) 编号 i*nH+j；返回边集
  function cartesianEdges(nG, eG, nH, eH) {
    const out = [];
    for (let i = 0; i < nG; i++) eH.forEach(e => out.push([i * nH + e[0], i * nH + e[1]]));
    for (let j = 0; j < nH; j++) eG.forEach(e => out.push([e[0] * nH + j, e[1] * nH + j]));
    return out;
  }

  /* ---------------- 图库 ---------------- */
  // 基础层：同顶点集 V={A..E} 上的两张图
  const GE = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]];              // E(G) = {AB, BC, CD, DA, AC}
  const HE = [[0, 1], [2, 3], [3, 4], [0, 4]];                      // E(H) = {AB, CD, DE, AE}
  const pent = [0, 1, 2, 3, 4].map(i => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
    return { x: 0.5 + 0.46 * Math.cos(a), y: 0.52 + 0.5 * Math.sin(a) };
  });
  // 进阶层：母图 = 三角形ABC —CD桥— 三角形DEF
  const motherNodes = [
    { x: 0.1, y: 0.25 }, { x: 0.3, y: 0.02 }, { x: 0.34, y: 0.5 },
    { x: 0.64, y: 0.55 }, { x: 0.9, y: 0.3 }, { x: 0.72, y: 0.98 }
  ];
  const motherEdges = [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3]];
  // 拓展层：双环 + 桥
  const netNodes = [
    { x: 0.08, y: 0.2 }, { x: 0.3, y: 0.02 }, { x: 0.36, y: 0.42 }, { x: 0.14, y: 0.62 },
    { x: 0.62, y: 0.6 }, { x: 0.66, y: 0.98 }, { x: 0.92, y: 0.82 }, { x: 0.9, y: 0.42 }
  ];
  const netEdges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [3, 4]];
  const AZ = "ABCDEFGHI".split("");

  const GRAPHS = {
    g5: { names: AZ.slice(0, 5), caption: "图 G（顶点集 V = {A,B,C,D,E}，5 条边）", nodes: pent, edges: GE },
    h5: { names: AZ.slice(0, 5), caption: "图 H（同一顶点集，4 条边）", nodes: pent, edges: HE },
    union5: { names: AZ.slice(0, 5), caption: "G 与 H 叠放：并图 G ∪ H", nodes: pent, edges: edgeUnion(GE, HE) },
    comp5: { names: AZ.slice(0, 5), caption: "补图 G̅（虚线为 G 原有的边）", nodes: pent, edges: complementEdges(5, GE) },
    mother: { names: AZ.slice(0, 6), caption: "母图 G：两个三角形 + 边 CD", nodes: motherNodes, edges: motherEdges },
    motherPlus: { names: AZ.slice(0, 6), caption: "加边 G ∪ (B,E)", nodes: motherNodes, edges: motherEdges.concat([[1, 4]]) },
    contracted: {
      names: ["A", "B", "C·D", "E", "F"], caption: "收缩 G\\CD：C、D 合并为一个新顶点",
      nodes: [
        { x: 0.12, y: 0.3 }, { x: 0.35, y: 0.02 }, { x: 0.5, y: 0.55 },
        { x: 0.9, y: 0.3 }, { x: 0.72, y: 0.98 }
      ],
      edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2]]
    },
    ladder: {
      names: ["u₁", "u₂", "u₃", "v₁", "v₂", "v₃"], caption: "笛卡尔积 K₂ × P₃（梯子图）",
      nodes: [
        { x: 0.12, y: 0.1 }, { x: 0.5, y: 0.1 }, { x: 0.88, y: 0.1 },
        { x: 0.12, y: 0.9 }, { x: 0.5, y: 0.9 }, { x: 0.88, y: 0.9 }
      ],
      edges: cartesianEdges(2, [[0, 1]], 3, [[0, 1], [1, 2]])
    },
    net: { names: AZ.slice(0, 8), caption: "网络 G：两个环形模块 + 桥 D–E", nodes: netNodes, edges: netEdges },
    netfix: {
      names: AZ.slice(0, 8), caption: "加固后：加上备用边 B–G",
      nodes: netNodes, edges: netEdges.concat([[1, 6]])
    },
    grid: {
      names: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], caption: "笛卡尔积 P₃ × P₃（3×3 网格）",
      nodes: [0, 1, 2].flatMap(r => [0, 1, 2].map(c => ({ x: 0.2 + c * 0.3, y: r * 0.5 }))),
      edges: cartesianEdges(3, [[0, 1], [1, 2]], 3, [[0, 1], [1, 2]])
    }
  };
  const UNION = edgeUnion(GE, HE), INTER = edgeInter(GE, HE);

  /* ---------------- 三层步骤数据 ----------------
     nodes/edges：本步关注（金点/红边）；okEdges：运算结果（绿边）；ghostNodes/ghostEdges：删去或去掉的（灰虚线） */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "在同一组顶点上，对两张图做并、交、差、环和与补，逐条核对边集怎样变化。",
      badge: "并 / 交 / 差 / 环和 / 补",
      steps: [
        {
          name: "图 G", graph: "g5", icon: "🅶",
          formula: 'E(G) = {AB, BC, CD, DA, AC}，|E(G)| = <span class="ft hot">5</span>',
          badge: "|E(G)|=5", tone: "",
          defText: "第一个运算对象：顶点集 V = {A,B,C,D,E}，边集 E(G)。E 暂时是孤立点。",
          text: "先认识第一张图 G：四边形 ABCD 加一条对角线 AC。本页约定两图<b>顶点集相同</b>，图的运算就是对<b>边集合</b>做集合运算。"
        },
        {
          name: "图 H", graph: "h5", icon: "🅷",
          formula: 'E(H) = {AB, CD, DE, AE}，|E(H)| = <span class="ft hot-blue hot">4</span>',
          badge: "|E(H)|=4", tone: "blue",
          defText: "第二个运算对象：与 G 同一顶点集，边集不同。",
          text: "第二张图 H 建在<b>同一组顶点</b>上：与 G 共有 AB、CD，另有 DE、AE。记住这两条“共有边”，后面每一步都会用到。"
        },
        {
          name: "并 G ∪ H", graph: "union5", icon: "➕",
          edges: [[3, 4], [0, 4]],
          formula: 'E(G∪H) = E(G) ∪ E(H)，|E| = 5 + 4 − 2 = <span class="ft hot">7</span>',
          badge: "并图", tone: "", viz: "edgeset",
          defText: "并图 G∪H：边集为 E(G) ∪ E(H)。共有边只算一次，所以 |E(G∪H)| = |E(G)| + |E(H)| − |E(G∩H)|。",
          text: "把两张图<b>叠在一起</b>：G 的 5 条边全保留，H 再带来 DE、AE 两条新边（红色）；共有边 AB、CD 只算一次，共 <b>7</b> 条。"
        },
        {
          name: "交 G ∩ H", graph: "union5", icon: "✖️",
          okEdges: INTER, ghostEdges: edgeDiff(UNION, INTER),
          formula: 'E(G∩H) = E(G) ∩ E(H) = {<span class="ft hot-green hot">AB, CD</span>}，|E| = 2',
          badge: "交图", tone: "gold", viz: "edgeset",
          defText: "交图 G∩H：边集为 E(G) ∩ E(H)，只保留两图的公共边。",
          text: "只留<b>两张图都有</b>的边：AB 和 CD（绿色），其余 5 条变成灰色虚线被去掉。"
        },
        {
          name: "差 G − H", graph: "g5", icon: "➖",
          okEdges: edgeDiff(GE, HE), ghostEdges: INTER,
          formula: 'E(G−H) = E(G) − E(H) = {<span class="ft hot-green hot">BC, DA, AC</span>}，|E| = 3',
          badge: "差图", tone: "red", viz: "edgeset",
          defText: "差图 G−H：边集为 E(G) − E(H)，即从 G 中去掉与 H 公共的边。注意 G−H 与 H−G 一般不同。",
          text: "从 G 出发，把 H 里也有的 AB、CD <b>去掉</b>（灰色虚线），剩下 BC、DA、AC 三条（绿色）。反过来 H−G = {DE, AE} 只有 2 条——<b>差运算不满足交换律</b>。"
        },
        {
          name: "环和 G ⊕ H", graph: "union5", icon: "⭕",
          okEdges: edgeRingSum(GE, HE), ghostEdges: INTER,
          formula: 'G ⊕ H = (G∪H) − (G∩H)：{<span class="ft hot-green hot">BC, DA, AC, DE, AE</span>}，|E| = 7 − 2 = 5',
          badge: "环和", tone: "blue", viz: "edgeset",
          defText: "环和 G⊕H：边集为两图边集的对称差 (E(G)∪E(H)) − (E(G)∩E(H))，即“只属于其中一个图”的边。",
          text: "在并图里再去掉共有边 AB、CD（灰色虚线），剩下的 5 条（绿色）恰好是“G 独有 + H 独有”。也可以验证：G⊕H = (G−H) ∪ (H−G)，3 + 2 = 5 ✓。"
        },
        {
          name: "补图 G̅", graph: "comp5", icon: "🌗",
          okEdges: complementEdges(5, GE), ghostEdges: GE,
          formula: '|E(G̅)| = C(5,2) − |E(G)| = <span class="ft hot">10 − 5 = 5</span>',
          badge: "补图", tone: "gold", viz: "edgeset",
          defText: "补图 G̅：与 G 顶点相同，{u,v} 是 G̅ 的边 ⟺ {u,v} 不是 G 的边；G ∪ G̅ = Kₙ。",
          text: "把 G <b>整个取反</b>：原有的 5 条边（灰色虚线）去掉，原来“缺”的 5 条边 AE、BD、BE、CE、DE（绿色）全部补上。G 与 G̅ 合起来恰好是 K₅ 的 10 条边。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "在同一张母图上取子图、生成子图、导出子图，做删边、删点、收缩与加边，再用笛卡尔积由小图构造大图。",
      badge: "子图 · 删 · 缩 · 加 · 积",
      steps: [
        {
          name: "子图与母图", graph: "mother", icon: "🧩",
          nodes: [0, 1, 2], edges: [[0, 1], [1, 2]],
          formula: "V' ⊆ V 且 E' ⊆ E  ⇒  G' = (V', E') 是 G 的<span class=\"ft hot\">子图</span>",
          badge: "子图", tone: "",
          defText: "设 G = (V,E)，若 V' ⊆ V，E' ⊆ E，且 E' 的边的端点都在 V' 中，则 G' = (V',E') 是 G 的子图，G 为 G' 的母图。",
          text: "金色顶点 {A,B,C} 加上 2 条红色边 AB、BC 就是一个<b>子图</b>——可以只挑一部分边，不必把 A、C 之间的边带上。"
        },
        {
          name: "生成子图", graph: "mother", icon: "🌿",
          nodes: [0, 1, 2, 3, 4, 5], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
          formula: "V' = V 且 E' ⊆ E  ⇒  <span class=\"ft hot\">生成子图</span>（顶点一个不少）",
          badge: "生成", tone: "blue",
          defText: "若子图 G' 满足 V' = V，则称 G' 为 G 的生成子图。",
          text: "保留<b>全部 6 个顶点</b>，只挑 5 条红色边 AB、BC、CD、DE、EF——这是一个生成子图（它恰好还连通且无圈，是第 8 章的“生成树”）。"
        },
        {
          name: "导出子图", graph: "mother", icon: "🧩",
          nodes: [0, 1, 2], edges: [[0, 1], [1, 2], [2, 0]],
          formula: "取 V' 之间在 G 中的<span class=\"ft hot\">全部</span>边  ⇒  导出子图 G[V']",
          badge: "导出", tone: "blue",
          defText: "设 V' ⊆ V 非空，以 V' 为顶点集、以 G 中两端都在 V' 的全部边为边集的子图，称为 V' 的导出子图 G[V']。",
          text: "同样取 {A,B,C}，但把它们之间的边<b>一条不落</b>全带上（三角形 3 条）——这才是<b>导出子图</b> G[{A,B,C}]。"
        },
        {
          name: "删边 G − e", graph: "mother", icon: "✂️",
          ghostEdges: [[0, 1]],
          formula: 'G − AB：|E| 7 → 6，连通分支数 <span class="ft hot-green hot">1 → 1</span>（仍连通）',
          badge: "删边", tone: "", viz: "delimpact",
          defText: "删边 G − e：只去掉边 e，顶点全部保留。",
          text: "删去 AB（灰色虚线）：A、B 还能绕 C 相通——圈上删一条边<b>不破坏连通</b>。冗余环路就是网络的“备份线路”。"
        },
        {
          name: "删点 G − v", graph: "mother", icon: "💥",
          ghostNodes: [2],
          formula: 'G − C：连同 3 条关联边一起删去，连通分支数 <span class="ft hot">1 → 2</span>！',
          badge: "删点", tone: "red", viz: "delimpact",
          defText: "删点 G − v：删去顶点 v 以及与 v 关联的所有边。",
          text: "删掉 C（灰色虚线圈）连带删去 CA、CB、CD——图立刻裂成 {A,B} 和 {D,E,F} 两块！删去后分支数增加的顶点称为<b>割点</b>。"
        },
        {
          name: "收缩 G\\e", graph: "contracted", icon: "🔗",
          nodes: [2],
          formula: '收缩边 CD：两端点<span class="ft hot">合并为一点</span>，|V| 6 → 5，|E| 7 → 6',
          badge: "收缩", tone: "gold",
          defText: "收缩边 e = (u,v)，记作 G\\e：删去 e，并用一个新顶点代替 u、v，使它与 u、v 原来关联的其余边都关联。",
          text: "把边 CD “捏合”成一个新顶点 C·D（金色）：它继承了 CA、CB、DE、DF 四条边，两个三角形共享一点。收缩常用于<b>化简网络、提炼骨架</b>。"
        },
        {
          name: "加边 G ∪ (u,v)", graph: "motherPlus", icon: "➕",
          edges: [[1, 4]],
          formula: '加新边 BE 后再删 C：连通分支数 <span class="ft hot-green hot">1 → 1</span>，C 不再是割点',
          badge: "加边", tone: "", viz: "addimpact",
          defText: "加新边 G ∪ (u,v)：在不相邻的顶点 u、v 之间添加一条边，顶点集不变。",
          text: "在 B、E 之间加一条红色新边：此时即使删去 C，{A,B} 仍可经 B–E 与 {D,E,F} 相通。删与加相互对照，正是网络“找弱点—补弱点”的过程。"
        },
        {
          name: "笛卡尔积 K₂ × P₃", graph: "ladder", icon: "✖️",
          edges: [[0, 3], [1, 4], [2, 5]],
          formula: '|V| = 2×3 = 6，|E| = <span class="ft hot">|V(K₂)|·|E(P₃)| + |V(P₃)|·|E(K₂)|</span> = 2×2 + 3×1 = 7',
          badge: "积图", tone: "blue", viz: "product",
          defText: "笛卡尔积 G×H：顶点为有序对 (u,v)；(u,v) 与 (u',v') 相邻 ⟺ u = u' 且 v 与 v' 在 H 中相邻，或 v = v' 且 u 与 u' 在 G 中相邻。",
          text: "两份 P₃ 平行摆放（横边），再按 K₂ 竖着连 3 条“梯档”（红色）——<b>由小图构造规则的大图</b>。7.4 节的立方体图 Q₃ 正是 K₂ × K₂ × K₂。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "用删点、删边模拟故障与攻击，找出单点故障；再用加边做加固，用并运算拼装模块、用笛卡尔积扩展规模。",
      badge: "容错 / 模块化",
      steps: [
        {
          name: "模拟故障：删边", graph: "net", icon: "⚡",
          ghostEdges: [[0, 1]],
          formula: '链路故障 G − AB：连通分支数 <span class="ft hot-green hot">1 → 1</span>，网络仍连通',
          badge: "容错 ✓", tone: "", viz: "delimpact",
          defText: "鲁棒性测试①：删边模拟链路故障，看连通性是否保持。",
          text: "线路 AB 断了（灰色虚线）：环形模块内可以绕行，服务不中断。<b>环路冗余</b>是最朴素的容错设计。"
        },
        {
          name: "模拟攻击：删割点", graph: "net", icon: "💥",
          ghostNodes: [3],
          formula: '节点失效 G − D：连通分支数 <span class="ft hot">1 → 2</span>，网络断裂！',
          badge: "脆弱 ✗", tone: "red", viz: "delimpact",
          defText: "鲁棒性测试②：删点模拟节点宕机或被攻击；割点与桥是单点故障源。",
          text: "D 失效后两个模块<b>彻底失联</b>：D 是割点，D–E 是桥（删去它也会使分支数增加）。风险评估首先要找出它们。"
        },
        {
          name: "加边加固", graph: "netfix", icon: "🛠️",
          edges: [[1, 6]],
          formula: '加备用边 B–G 后再删 D：连通分支数 <span class="ft hot-green hot">1 → 1</span>，单点故障消除',
          badge: "加固 ✓", tone: "", viz: "fiximpact",
          defText: "加固：用“加边”运算添加跨模块冗余联结，消除割点与桥。",
          text: "加上跨模块备用边 B–G（红色）：即使 D 失效，流量仍可经 B–G 绕行。<b>删是压力测试，加是补齐短板</b>。"
        },
        {
          name: "模块化：并 + 接口边", graph: "netfix", icon: "🧩",
          edges: [[3, 4], [1, 6]],
          formula: '系统 = G₁ ∪ G₂ ∪ {<span class="ft hot">D–E, B–G</span>}（模块内聚、接口精简）',
          badge: "模块化", tone: "blue",
          defText: "模块化设计：先分别设计模块（子图），再用少量接口边做并运算拼装成系统。",
          text: "两个环各自是<b>高内聚模块</b>，红色接口边 D–E、B–G 把它们松耦合地拼成系统——这正是分层、分模块系统设计的图论原型。"
        },
        {
          name: "积运算扩展规模", graph: "grid", icon: "✖️",
          formula: 'P₃ × P₃：|V| = 3×3 = 9，|E| = <span class="ft hot">3×2 + 3×2 = 12</span>，结构可复制',
          badge: "网格", tone: "blue", viz: "product",
          defText: "笛卡尔积按“行 × 列”批量复制结构，是规则拓扑的生成器：|E(G×H)| = |V(G)|·|E(H)| + |V(H)|·|E(G)|。",
          text: "3×3 网格 = P₃ × P₃：芯片布线、传感器阵列、片上网络常这样“<b>由模板批量生成</b>”。要扩容？把 P₃ 换成 P₁₀ 即可。"
        },
        {
          name: "迁移总结", graph: "netfix", icon: "🚀",
          formula: '<span class="ft hot">删 = 压力测试，加 = 冗余设计，并 = 模块拼装，积 = 规模复制</span>',
          badge: "迁移", tone: "gold", viz: "transferlist",
          defText: "图运算是网络工程的“动词”：测试、加固、拼装、扩展。",
          text: "故障演练用删点删边，容灾设计用加边消除割点，系统集成用并运算拼装模块，规则网络用笛卡尔积批量扩展。<b>先算清结构的账，再动手改造。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, hasEdge, edgeUnion, edgeInter, edgeDiff, edgeRingSum, complementEdges, componentsCount, cartesianEdges };
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
  let speed = 1800;
  const C = {
    node: "#d63b1d", cur: "#ffb400", ok: "#1f9d55",
    edge: "rgba(107,74,56,0.5)", edgeDim: "rgba(107,74,56,0.16)", edgeHot: "#d63b1d", edgeOk: "#1f9d55", gone: "#9a8a80",
    text: "#fff", curText: "#2c1810", ring: "#fff8ec"
  };

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  }

  if (missionEl) missionEl.innerHTML = "<b>互动任务：</b>" + esc(level.mission);
  if (badgeEl) badgeEl.textContent = level.badge;

  /* ---- 画布 ---- */
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(240, Math.floor(rect.width));
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
    const R = g.nodes.length > 8 ? 16 : (size.w < 420 ? 17 : 19);
    const padX = 48, padTop = 62, padBot = 58;
    const P = g.nodes.map(nd => ({
      x: padX + nd.x * (size.w - 2 * padX),
      y: padTop + nd.y * (size.h - padTop - padBot)
    }));
    const hlNodes = new Set(st.nodes || []);
    const hlEdges = st.edges || [];
    const okEdges = st.okEdges || [];
    const ghostN = new Set(st.ghostNodes || []);
    const ghostE = st.ghostEdges || [];
    const anyHl = hlEdges.length > 0 || okEdges.length > 0 || hlNodes.size > 0;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    function line(a, b, color, width, dash) {
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash || []);
      ctx.beginPath();
      ctx.moveTo(a.x + Math.cos(ang) * R, a.y + Math.sin(ang) * R);
      ctx.lineTo(b.x - Math.cos(ang) * R, b.y - Math.sin(ang) * R);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // 去掉的边（可能不在当前图中，如补图步骤中原图的边）
    ghostE.forEach(e => line(P[e[0]], P[e[1]], C.gone, 2, [6, 6]));
    g.edges.forEach(e => {
      if (edgeIn(ghostE, e)) return;
      if (ghostN.has(e[0]) || ghostN.has(e[1])) { line(P[e[0]], P[e[1]], C.gone, 2, [6, 6]); return; }
      const ok = edgeIn(okEdges, e);
      const hot = !ok && edgeIn(hlEdges, e);
      const dim = anyHl && !hot && !ok && (hlEdges.length > 0 || okEdges.length > 0);
      line(P[e[0]], P[e[1]], ok ? C.edgeOk : hot ? C.edgeHot : dim ? C.edgeDim : C.edge, ok || hot ? 4 : 2.2);
    });

    P.forEach((p, i) => {
      const hot = hlNodes.has(i);
      const isGhost = ghostN.has(i);
      ctx.beginPath();
      ctx.arc(p.x, p.y, hot ? R + 2 : R, 0, Math.PI * 2);
      if (isGhost) {
        ctx.fillStyle = "rgba(255,251,240,0.9)";
        ctx.fill();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = C.gone;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = C.gone;
      } else {
        ctx.fillStyle = hot ? C.cur : C.node;
        ctx.fill();
        ctx.strokeStyle = C.ring;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = hot ? C.curText : C.text;
      }
      ctx.font = "800 " + (g.names[i].length > 2 ? 10 : 13) + "px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y);
    });

    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(g.caption, size.w / 2, size.h - 18);
  }

  /* ---- 舞台图例（随本步内容显示需要的项） ---- */
  function renderLegend(st) {
    const board = canvas.parentNode;
    if (!board) return;
    let lg = board.querySelector(".graph-legend");
    if (!lg) {
      lg = document.createElement("div");
      lg.className = "graph-legend";
      lg.setAttribute("aria-hidden", "true");
      board.appendChild(lg);
    }
    const items = ['<span><i class="lg-node"></i>顶点</span>'];
    if ((st.nodes || []).length) items.push('<span><i class="lg-node lg-cur"></i>本步关注</span>');
    items.push('<span><i class="lg-edge"></i>边</span>');
    if ((st.edges || []).length) items.push('<span><i class="lg-edge lg-hot"></i>高亮边</span>');
    if ((st.okEdges || []).length) items.push('<span><i class="lg-edge lg-res"></i>运算结果</span>');
    if ((st.ghostNodes || []).length) items.push('<span><i class="lg-node lg-gone-node"></i>删去的点</span>');
    if ((st.ghostEdges || []).length || (st.ghostNodes || []).length) items.push('<span><i class="lg-edge lg-gone"></i>' + (st.graph === "comp5" ? "原图的边" : "去掉的边") + '</span>');
    lg.innerHTML = items.join("");
  }

  /* ---- 左栏信息卡：定义与解析 + 运算结果（扣除删去/去掉的部分） ---- */
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
        '<div class="stat-box"><span class="lab">结果顶点数 |V|</span><span class="val">' + c.v + '</span></div>' +
        '<div class="stat-box"><span class="lab">结果边数 |E|</span><span class="val">' + c.e + '</span></div>' +
      '</div>';
  }

  /* ---- 辅助可视化 ---- */
  function edgeName(g, e) {
    return g.names[e[0]] + g.names[e[1]];
  }
  function edgesetHtml(st) {
    const g = GRAPHS[st.graph];
    const ghostE = st.ghostEdges || [];
    const result = g.edges.filter(e => !edgeIn(ghostE, e));
    const pills = result.map(e => '<span class="pill">' + edgeName(g, e) + '</span>').join("");
    const gone = ghostE.length ? '<br>去掉的边：' + ghostE.map(e => edgeName(g, e)).join("、") : "";
    return '<div class="graph-summary"><b>结果边集（' + result.length + ' 条）：</b><div class="pill-row">' + pills + '</div>' +
      '对照：E(G) = {AB, BC, CD, DA, AC}，E(H) = {AB, CD, DE, AE}' + gone + '</div>';
  }
  function delimpactHtml(st) {
    const g = GRAPHS[st.graph];
    const before = componentsCount(g.nodes.length, g.edges);
    const after = componentsCount(g.nodes.length, g.edges, st.ghostNodes, st.ghostEdges);
    return '<div class="graph-summary"><b>连通性冲击（BFS 计数）：</b>运算前连通分支数 = ' + before +
      '，运算后 = <b>' + after + '</b>。' +
      (after > before ? '<b class="bad-text">结构被撕裂</b>——命中割点或桥，需要重点防护。' : '<b class="ok-text">仍然连通</b>——冗余路径吸收了这次冲击。') + '</div>';
  }
  function addimpactHtml() {
    const m = GRAPHS.mother, mp = GRAPHS.motherPlus;
    const a = componentsCount(m.nodes.length, m.edges, [2]);
    const b = componentsCount(mp.nodes.length, mp.edges, [2]);
    return '<div class="graph-summary"><b>加边前后对比：</b>删去 C 后的连通分支数——加边前 = ' + a +
      '，加边后 = <b>' + b + '</b>。一条新边就让 C 不再是割点。</div>';
  }
  function fiximpactHtml() {
    const net = GRAPHS.net, fix = GRAPHS.netfix;
    const brokeOld = componentsCount(net.nodes.length, net.edges, [3]);
    const brokeNew = componentsCount(fix.nodes.length, fix.edges, [3]);
    return '<div class="graph-summary"><b>加固对比：</b>删去 D 后的连通分支数——加固前 = ' + brokeOld +
      '，加固后 = <b class="ok-text">' + brokeNew + '</b>。一条备用边就消除了单点故障。</div>';
  }
  function productHtml(st) {
    const g = GRAPHS[st.graph];
    const deg = Array(g.nodes.length).fill(0);
    g.edges.forEach(e => { deg[e[0]]++; deg[e[1]]++; });
    return '<div class="graph-summary"><b>结果核对：</b>|V| = ' + g.nodes.length + '，|E| = ' + g.edges.length +
      '；度数和 = ' + deg.reduce((a, b) => a + b, 0) + ' = 2|E| ✓。积图中每个顶点的度 = 它在两个因子图中的度之和。</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">故障演练：删点删边</span><span class="pill">容灾设计：加边消除割点</span><span class="pill">系统集成：并 + 接口边</span><span class="pill">规则扩展：笛卡尔积</span></div>' +
      '图运算把“改造方案”变成可计算、可验证的结构变换。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    let html = "";
    switch (st.viz) {
      case "edgeset": html = edgesetHtml(st); break;
      case "delimpact": html = delimpactHtml(st); break;
      case "addimpact": html = addimpactHtml(); break;
      case "fiximpact": html = fiximpactHtml(); break;
      case "product": html = productHtml(st); break;
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
    renderLegend(st);
    draw();
    Array.prototype.forEach.call(document.querySelectorAll(".step-item"), (el, i) => {
      el.classList.toggle("active", i === step);
      el.classList.toggle("done", i < step);
      if (i === step) el.setAttribute("aria-current", "step"); else el.removeAttribute("aria-current");
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
  function startTimer() {
    if (playTimer) clearInterval(playTimer);
    playTimer = setInterval(() => {
      if (step >= level.steps.length - 1) { stopPlay(); return; }
      go(step + 1);
    }, speed);
  }
  function togglePlay() {
    const b = document.getElementById("playBtn");
    if (playTimer) { stopPlay(); return; }
    if (step === level.steps.length - 1) go(0);
    if (b) { b.classList.add("playing"); b.textContent = "⏸ 暂停"; }
    startTimer();
  }

  /* ---- 构建控件 ---- */
  function buildControls() {
    const listItems = level.steps.map((s, i) =>
      '<button type="button" class="step-item" data-i="' + i + '"><span class="num">' + (i + 1) + '</span><span>' + (s.icon ? s.icon + " " : "") + esc(s.name) + '</span></button>'
    ).join("");
    controls.innerHTML =
      '<div class="step-controller">' +
        '<div class="step-progress-head"><span id="stepCounter">第 1 / ' + level.steps.length + ' 步</span><small>' + esc(level.label) + ' · 点一步看变化</small></div>' +
        '<div class="progress-track"><div class="progress-fill"></div></div>' +
        '<div class="step-btns">' +
          '<button type="button" class="step-btn" id="prevBtn">◀ 上一步</button>' +
          '<button type="button" class="step-btn primary" id="nextBtn">下一步 ▶</button>' +
          '<button type="button" class="step-btn" id="playBtn">▶ 自动播放</button>' +
          '<button type="button" class="step-btn" id="resetBtn">↺ 重置</button>' +
          '<label class="speed-row" for="speedSel"><span>播放速度</span>' +
            '<select id="speedSel"><option value="2800">慢</option><option value="1800" selected>中</option><option value="1000">快</option></select>' +
          '</label>' +
        '</div>' +
      '</div>' +
      '<div class="step-list">' + listItems + '</div>';

    document.getElementById("prevBtn").addEventListener("click", () => { stopPlay(); go(step - 1); });
    document.getElementById("nextBtn").addEventListener("click", () => { stopPlay(); go(step + 1); });
    document.getElementById("playBtn").addEventListener("click", togglePlay);
    document.getElementById("resetBtn").addEventListener("click", () => { stopPlay(); go(0); });
    document.getElementById("speedSel").addEventListener("change", ev => {
      speed = Number(ev.target.value) || 1800;
      if (playTimer) startTimer();
    });
    Array.prototype.forEach.call(document.querySelectorAll(".step-item"), el => {
      el.addEventListener("click", () => { stopPlay(); go(Number(el.dataset.i)); });
    });
  }

  buildControls();
  renderStep();
  window.addEventListener("resize", draw);
})();
