/* ============================================================
   7.9 连通性进阶 · 三层统一交互引擎（与 7.1–7.8 同一视觉语言）
   window.CUT_LEVEL = "basic" | "advanced" | "extend"
   基础层：割点与桥（删点/删边看连通分支数 ω 变化）
   进阶层：κ ≤ λ ≤ δ（Whitney 不等式）+ AOE 网关键路径
   拓展层：N-1 准则（容错加固）+ CPM 工期压缩
   交互：上一步 / 下一步 / 自动播放（可调速）/ 重置；「自由试验」模式下可直接点图删点、删边，
         AOE 图上可点活动调整工期，结果实时重算。所有数值均由下方纯函数计算。
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  const key = (u, v) => (u < v ? u + "-" + v : v + "-" + u);
  // 连通分支：返回 {comp:[分支编号或 -1(已删)], count}
  function components(n, edges, removedV, removedE) {
    const rv = new Set(removedV || []), re = new Set((removedE || []).map(e => key(e[0], e[1])));
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => {
      if (rv.has(e[0]) || rv.has(e[1]) || re.has(key(e[0], e[1]))) return;
      adj[e[0]].push(e[1]); adj[e[1]].push(e[0]);
    });
    const comp = Array(n).fill(-1);
    let count = 0;
    for (let s = 0; s < n; s++) {
      if (rv.has(s) || comp[s] >= 0) continue;
      const stack = [s]; comp[s] = count;
      while (stack.length) { const u = stack.pop(); adj[u].forEach(v => { if (comp[v] < 0) { comp[v] = count; stack.push(v); } }); }
      count++;
    }
    return { comp, count };
  }
  function degrees(n, edges) { const d = Array(n).fill(0); edges.forEach(e => { d[e[0]]++; d[e[1]]++; }); return d; }
  function cutVertices(n, edges) {
    const base = components(n, edges).count;
    const out = [];
    for (let v = 0; v < n; v++) if (components(n, edges, [v]).count > base) out.push(v);
    return out;
  }
  function bridges(n, edges) {
    const base = components(n, edges).count;
    return edges.filter(e => components(n, edges, [], [e]).count > base);
  }
  function combos(arr, k, cb) {
    const pick = [];
    (function rec(start) {
      if (pick.length === k) return cb(pick.slice());
      for (let i = start; i < arr.length; i++) { pick.push(arr[i]); if (rec(i + 1) === true) return true; pick.pop(); }
      return false;
    })(0);
  }
  // 点连通度 κ：使 G 不连通所需删去的最少顶点数（完全图 Kn 约定为 n−1）；返回 {k, witness}
  function vertexConnectivity(n, edges) {
    if (components(n, edges).count > 1) return { k: 0, witness: [] };
    const ids = Array.from({ length: n }, (_, i) => i);
    for (let k = 1; k <= n - 2; k++) {
      let found = null;
      combos(ids, k, S => { if (components(n, edges, S).count > 1) { found = S; return true; } return false; });
      if (found) return { k: k, witness: found };
    }
    return { k: n - 1, witness: [] };
  }
  // 边连通度 λ：使 G 不连通所需删去的最少边数
  function edgeConnectivity(n, edges) {
    if (components(n, edges).count > 1) return { k: 0, witness: [] };
    for (let k = 1; k <= edges.length; k++) {
      let found = null;
      combos(edges, k, F => { if (components(n, edges, [], F).count > 1) { found = F; return true; } return false; });
      if (found) return { k: k, witness: found };
    }
    return { k: 0, witness: [] };
  }
  // N-1 检查：逐一删去每个顶点、每条边，看剩余图是否连通
  function nMinus1(n, edges) {
    const vs = [], es = [];
    for (let v = 0; v < n; v++) vs.push({ v: v, ok: components(n, edges, [v]).count === 1 });
    edges.forEach(e => es.push({ e: e, ok: components(n, edges, [], [e]).count === 1 }));
    return { vs, es, ok: vs.every(x => x.ok) && es.every(x => x.ok) };
  }
  // AOE 网：acts = [{u,v,w,name}]，顶点按拓扑序编号
  function aoe(n, acts) {
    const ve = Array(n).fill(0);
    const order = topo(n, acts);
    order.forEach(u => acts.forEach(a => { if (a.u === u) ve[a.v] = Math.max(ve[a.v], ve[u] + a.w); }));
    const T = Math.max.apply(null, ve);
    const vl = Array(n).fill(T);
    order.slice().reverse().forEach(u => acts.forEach(a => { if (a.u === u) vl[u] = Math.min(vl[u], vl[a.v] - a.w); }));
    const act = acts.map(a => { const e = ve[a.u], l = vl[a.v] - a.w; return { name: a.name, u: a.u, v: a.v, w: a.w, e: e, l: l, slack: l - e, critical: l === e }; });
    return { ve, vl, act, T, order };
  }
  function topo(n, acts) {
    const indeg = Array(n).fill(0);
    acts.forEach(a => indeg[a.v]++);
    const q = [], out = [];
    for (let i = 0; i < n; i++) if (!indeg[i]) q.push(i);
    while (q.length) { const u = q.shift(); out.push(u); acts.forEach(a => { if (a.u === u && --indeg[a.v] === 0) q.push(a.v); }); }
    return out;
  }
  // 全部关键路径（由关键活动组成的源→汇通路）
  function criticalPaths(n, res) {
    const src = res.order[0], sink = res.order[res.order.length - 1];
    const paths = [];
    (function dfs(u, p) {
      if (u === sink) { paths.push(p.slice()); return; }
      res.act.forEach(a => { if (a.u === u && a.critical) { p.push(a.v); dfs(a.v, p); p.pop(); } });
    })(src, [src]);
    return paths;
  }

  /* ---------------- 图库 ---------------- */
  const AZ = "ABCDEFGH".split("");
  const GRAPHS = {
    net8: {
      names: AZ.slice(0, 8), caption: "通信网络示意（三角形 ABC — 桥 CD — 四边形 DEFG — 悬挂点 H）",
      nodes: [
        { x: 0.03, y: 0.12 }, { x: 0.03, y: 0.88 }, { x: 0.25, y: 0.5 }, { x: 0.5, y: 0.5 },
        { x: 0.7, y: 0.08 }, { x: 0.9, y: 0.45 }, { x: 0.7, y: 0.92 }, { x: 0.97, y: 0.98 }
      ],
      edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3], [6, 7]]
    },
    k4k4: {
      names: AZ.slice(0, 8), caption: "两个 K₄ 由两条边 D–E、D–F 相连（κ < λ < δ 的典型例子）",
      nodes: [
        { x: 0.02, y: 0.16 }, { x: 0.25, y: 0.02 }, { x: 0.06, y: 0.92 }, { x: 0.36, y: 0.58 },
        { x: 0.62, y: 0.26 }, { x: 0.64, y: 0.9 }, { x: 0.97, y: 0.1 }, { x: 0.95, y: 0.74 }
      ],
      edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3], [4, 5], [4, 6], [4, 7], [5, 6], [5, 7], [6, 7], [3, 4], [3, 5]]
    },
    grid7: {
      names: AZ.slice(0, 7), caption: "区域电网示意（顶点 = 变电站，边 = 输电线路）",
      nodes: [
        { x: 0.04, y: 0.14 }, { x: 0.36, y: 0.04 }, { x: 0.42, y: 0.66 }, { x: 0.06, y: 0.9 },
        { x: 0.66, y: 0.56 }, { x: 0.94, y: 0.12 }, { x: 0.95, y: 0.92 }
      ],
      edges: [[0, 1], [1, 2], [2, 3], [3, 0], [2, 4], [4, 5], [5, 6], [6, 4]]
    },
    aoe6: {
      names: ["v1", "v2", "v3", "v4", "v5", "v6"], caption: "AOE 网（顶点 = 事件，有向边 = 活动，权 = 工期/天）", directed: true,
      nodes: [
        { x: 0.02, y: 0.5 }, { x: 0.3, y: 0.1 }, { x: 0.3, y: 0.9 },
        { x: 0.64, y: 0.55 }, { x: 0.66, y: 0.06 }, { x: 0.97, y: 0.5 }
      ],
      acts: [
        { u: 0, v: 1, w: 3, name: "a1" }, { u: 0, v: 2, w: 2, name: "a2" }, { u: 1, v: 3, w: 2, name: "a3" },
        { u: 1, v: 4, w: 3, name: "a4" }, { u: 2, v: 3, w: 4, name: "a5" }, { u: 2, v: 5, w: 3, name: "a6" },
        { u: 3, v: 5, w: 2, name: "a7" }, { u: 4, v: 5, w: 1, name: "a8" }
      ]
    }
  };
  GRAPHS.aoe6.edges = GRAPHS.aoe6.acts.map(a => [a.u, a.v]);
  const BACKUP = [1, 5]; // 拓展层备用线路 B–F
  const gE = id => GRAPHS[id].edges;
  const NET = { cut: cutVertices(8, gE("net8")), br: bridges(8, gE("net8")) };
  const KK = { kappa: vertexConnectivity(8, gE("k4k4")), lambda: edgeConnectivity(8, gE("k4k4")), deg: degrees(8, gE("k4k4")) };
  KK.delta = Math.min.apply(null, KK.deg);
  const AOE0 = aoe(6, GRAPHS.aoe6.acts);
  const withDur = changes => GRAPHS.aoe6.acts.map(a => Object.assign({}, a, changes[a.name] ? { w: changes[a.name] } : {}));
  const AOE_A1 = aoe(6, withDur({ a1: 2 }));
  const AOE_A5 = aoe(6, withDur({ a5: 3 }));
  const G7 = { cut: cutVertices(7, gE("grid7")), br: bridges(7, gE("grid7")) };
  const G7B = gE("grid7").concat([BACKUP]);
  const nmOf = (g, list) => list.map(i => GRAPHS[g].names[i]).join("、");
  const enm = (g, e) => GRAPHS[g].names[e[0]] + "–" + GRAPHS[g].names[e[1]];
  const critStr = res => criticalPaths(6, res).map(p => p.map(i => "v" + (i + 1)).join("→")).join("；");

  /* ---------------- 三层步骤数据 ----------------
     removedV / removedE：删去的点/边；comps：按连通分支着色；mark：标出割点与桥；
     hotE / greenE：红/绿高亮边；added：新增备用边；aoe：{res, show:"ve"|"vl"|"crit"} */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "逐个删去顶点或边，观察连通分支数 ω 是否增加，找出网络中的割点与桥。",
      badge: "割点 / 桥",
      legend: [["node", "顶点"], ["cur", "割点 / 当前关注"], ["del", "已删去"], ["hot", "桥"], ["g1", "另一分支"]],
      steps: [
        {
          name: "连通图与分支数",
          graph: "net8", comps: true, panel: "comp",
          formula: '<span class="ft hot-green hot">ω(G) = 1</span>：任意两点之间都有通路',
          badge: "起点", tone: "",
          text: "ω(G) 表示图 G 的<b>连通分支数</b>。这张 8 个点的网络是连通的，ω(G)=1。下面每次删去一个点或一条边，看 ω 会不会变大。"
        },
        {
          name: "删去普通点 B",
          graph: "net8", removedV: [1], comps: true, panel: "comp",
          formula: 'ω(G − B) = <span class="ft hot-green hot">1</span>：B 不是割点',
          badge: "不变", tone: "",
          text: "删去顶点 B 时要连同与它关联的边一起删去。A 仍可经 C 连到其余各点，网络没有断开，所以 B <b>不是割点</b>。"
        },
        {
          name: "删去割点 C",
          graph: "net8", removedV: [2], comps: true, panel: "comp",
          formula: 'ω(G − C) = <span class="ft hot">2</span> &gt; ω(G) ⇒ C 是<span class="ft hot">割点</span>',
          badge: "断开", tone: "red",
          text: "删去 C 后，A、B 与右边的网络失去联系，分成了 2 个连通分支（不同颜色）。<b>删去后使连通分支数增加的顶点叫割点</b>（也称关节点）。"
        },
        {
          name: "删去圈上的边 A–B",
          graph: "net8", removedE: [[0, 1]], comps: true, panel: "comp",
          formula: 'ω(G − AB) = <span class="ft hot-green hot">1</span>：AB 在圈 A–B–C–A 上，另有绕行通路',
          badge: "不变", tone: "",
          text: "边 AB 断了，A 仍可走 A→C→B 到达 B。一条边只要<b>在某个圈上</b>，删去它总有另一半圈可以绕行，网络不会断开。"
        },
        {
          name: "删去桥 C–D",
          graph: "net8", removedE: [[2, 3]], comps: true, panel: "comp",
          formula: 'ω(G − CD) = <span class="ft hot">2</span> ⇒ CD 是<span class="ft hot">桥</span>（割边）',
          badge: "断开", tone: "red",
          text: "C–D 是左右两部分之间唯一的边，删去它网络一分为二。<b>删去后使连通分支数增加的边叫桥</b>（也称割边）。"
        },
        {
          name: "找出全部割点与桥",
          graph: "net8", mark: true, panel: "cutlist",
          formula: '割点 {<span class="ft hot">' + nmOf("net8", NET.cut) + '</span>}，桥 {<span class="ft hot">' + NET.br.map(e => enm("net8", e)).join("、") + '</span>}',
          badge: "结论", tone: "gold",
          text: "逐个试删每个顶点和每条边（右表由程序实时计算），得到全部割点（金色）与桥（红色粗线）。它们就是网络的<b>单点故障</b>位置。"
        },
        {
          name: "判别方法",
          graph: "net8", mark: true, panel: "rules",
          formula: '<span class="ft hot">e 是桥 ⟺ e 不在任何圈上</span>；v 是割点 ⟺ 存在 u、w 使 u 到 w 的每条通路都经过 v',
          badge: "定理", tone: "blue",
          text: "悬挂点（度为 1 的 H）永远不是割点；桥的端点若度数 ≥ 2 则一定是割点（如 C、D、G）。对大图可用 DFS 在线性时间 O(n+m) 内求出全部割点与桥（Tarjan 算法）。"
        },
        {
          name: "动手试一试",
          graph: "net8", comps: true, panel: "comp", tryIt: true,
          formula: '点左侧「<span class="ft hot">✋ 自由试验</span>」，然后直接点图中的顶点或边删去/恢复',
          badge: "试验", tone: "gold",
          text: "试着回答：至少删去几个顶点能让 E 与 A 断开？至少删去几条边呢？（提示：分别是 1 和 1——因为有割点 D 和桥 CD。）再想想怎样加一条边能消除所有的桥。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "求点连通度 κ、边连通度 λ、最小度 δ，验证 Whitney 不等式 κ ≤ λ ≤ δ；再用 AOE 网求关键路径与工期。",
      badge: "κ ≤ λ ≤ δ / AOE",
      legend: [["node", "顶点/事件"], ["cur", "当前关注"], ["del", "已删去"], ["hot", "删去的边 / 通路①"], ["path", "通路② / 关键活动"]],
      steps: [
        {
          name: "度与最小度 δ",
          graph: "k4k4", nodes: KK.deg.map((d, i) => d === KK.delta ? i : -1).filter(i => i >= 0), panel: "deg",
          formula: '<span class="ft hot">δ(G) = min deg(v) = ' + KK.delta + '</span>，度最小的顶点：' + KK.deg.map((d, i) => d === KK.delta ? GRAPHS.k4k4.names[i] : "").filter(Boolean).join("、"),
          badge: "δ", tone: "gold",
          text: "这张图由两个完全图 K₄ 组成，中间只靠 D–E、D–F 两条边相连。每个点的度见右表，最小度 δ = " + KK.delta + "（金色顶点）。"
        },
        {
          name: "点连通度 κ",
          graph: "k4k4", removedV: KK.kappa.witness, comps: true, panel: "kld",
          formula: '<span class="ft hot">κ(G) = min{|S| : G − S 不连通} = ' + KK.kappa.k + '</span>，删 {' + nmOf("k4k4", KK.kappa.witness) + '} 即断开',
          badge: "κ = " + KK.kappa.k, tone: "red",
          text: "点连通度 κ(G) 是使 G 不连通（或只剩一个点）必须删去的<b>最少顶点数</b>。D 是割点，删去它两个 K₄ 失去联系，所以 κ = 1。κ 越大，越需要同时破坏多个节点才能切断网络。"
        },
        {
          name: "边连通度 λ",
          graph: "k4k4", removedE: KK.lambda.witness, comps: true, panel: "kld",
          formula: '<span class="ft hot">λ(G) = min{|F| : G − F 不连通} = ' + KK.lambda.k + '</span>，删 {' + KK.lambda.witness.map(e => enm("k4k4", e)).join("，") + '}',
          badge: "λ = " + KK.lambda.k, tone: "red",
          text: "边连通度 λ(G) 是使 G 不连通必须删去的<b>最少边数</b>。图中没有桥（删任一条边都不断开），但同时删去 D–E、D–F 就断开了，所以 λ = 2。"
        },
        {
          name: "为什么 λ ≤ δ",
          graph: "k4k4", removedE: [[0, 1], [0, 2], [0, 3]], comps: true, nodes: [0], panel: "kld",
          formula: '删去度最小顶点 A 的全部 <span class="ft hot">δ = ' + KK.delta + '</span> 条关联边，A 就被孤立 ⇒ <span class="ft hot">λ ≤ δ</span>',
          badge: "λ ≤ δ", tone: "",
          text: "任何图都可以这样断开：找一个度最小的顶点，把它的 δ 条边全删掉。所以“最少删几条边”不会超过 δ。"
        },
        {
          name: "Whitney 不等式",
          graph: "k4k4", mark: true, panel: "kld",
          formula: '<span class="ft hot-green hot">κ(G) ≤ λ(G) ≤ δ(G)</span>：本图 ' + KK.kappa.k + ' &lt; ' + KK.lambda.k + ' &lt; ' + KK.delta,
          badge: "定理", tone: "blue",
          text: "κ ≤ λ 的思路：取一个最小边割 F（|F| = λ），在 F 的每条边上删去一个适当的端点，最多删 λ 个点就能把图断开或只剩一个点。本图三个量严格递增，说明三者可以不相等；完全图 Kₙ 则有 κ = λ = δ = n − 1。"
        },
        {
          name: "Menger 定理（了解）",
          graph: "k4k4", hotE: [[0, 3], [3, 4], [4, 6]], greenE: [[0, 1], [1, 3], [3, 5], [5, 6]], nodes: [0, 6], panel: "menger",
          formula: 'A 到 G 最多有 <span class="ft hot">2</span> 条<span class="ft hot">边不重</span>的通路 = 分开 A、G 至少要删的边数',
          badge: "Menger", tone: "",
          text: "红线 A→D→E→G 与绿线 A→B→D→F→G 没有公共边（但都经过 D）。Menger 定理：两点间边不重通路的最大条数 = 分开它们所需删去的最少边数；对点也有类似结论（内部点不交的通路）。因此 λ ≥ 2 等价于任意两点间有两条边不重的通路。"
        },
        {
          name: "AOE 网",
          graph: "aoe6", aoe: { res: AOE0, show: "none" }, panel: "aoeAct",
          formula: '顶点 = <span class="ft hot">事件</span>，有向边 = <span class="ft hot">活动</span>（权 = 所需天数），v1 开工、v6 完工',
          badge: "建模", tone: "",
          text: "工程由若干活动组成，有先后约束：一个事件发生后，从它出发的活动才能开始。AOE 网是<b>无回路的有向带权图</b>，关心的问题是：整个工程最少要多少天？哪些活动一拖延就会耽误总工期？"
        },
        {
          name: "正推最早时间 ve",
          graph: "aoe6", aoe: { res: AOE0, show: "ve" }, panel: "aoeEvt",
          formula: '<span class="ft hot">ve(v1)=0，ve(j) = max{ ve(i) + w(i,j) }</span>（按拓扑序正推）',
          badge: "正推", tone: "",
          text: "事件 j 必须等所有前驱活动都完成才能发生，所以取<b>最大值</b>：ve(v4) = max{3+2, 2+4} = 6，ve(v6) = max{2+3, 6+2, 6+1} = 8。完工事件的 ve 就是<b>最短工期 " + AOE0.T + " 天</b>。"
        },
        {
          name: "逆推最迟时间 vl",
          graph: "aoe6", aoe: { res: AOE0, show: "vl" }, panel: "aoeEvt",
          formula: '<span class="ft hot">vl(v6)=ve(v6)，vl(i) = min{ vl(j) − w(i,j) }</span>（按逆拓扑序）',
          badge: "逆推", tone: "blue",
          text: "在不推迟总工期的前提下，事件 i 最迟何时发生？要给每个后继留足时间，所以取<b>最小值</b>：vl(v3) = min{6−4, 8−3} = 2，vl(v2) = min{6−2, 7−3} = 4。"
        },
        {
          name: "关键活动与关键路径",
          graph: "aoe6", aoe: { res: AOE0, show: "crit" }, panel: "aoeAct",
          formula: '活动 (i,j)：e = ve(i)，l = vl(j) − w；<span class="ft hot-green hot">l = e 为关键活动</span>，关键路径 ' + critStr(AOE0) + '，工期 ' + AOE0.T,
          badge: "关键路径", tone: "gold",
          text: "l − e 是活动的<b>时间余量</b>（总时差）。余量为 0 的活动 a2、a5、a7 一天都不能拖，它们连成的 v1→v3→v4→v6 是最长的源汇通路，即关键路径，长 2+4+2 = " + AOE0.T + " 天。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "用连通度检验电网的 N-1 准则并补强薄弱环节；用关键路径法（CPM）分析如何压缩工期。",
      badge: "N-1 / CPM",
      legend: [["node", "顶点/事件"], ["cur", "薄弱点 / 当前"], ["del", "故障退出"], ["hot", "桥 / 故障线路"], ["new", "新增备用线"], ["path", "关键活动"]],
      steps: [
        {
          name: "N-1 准则",
          graph: "grid7", panel: "n1",
          formula: '<span class="ft hot">N-1</span>：任一元件（一座站点或一条线路）退出后，其余部分仍保持连通',
          badge: "准则", tone: "",
          text: "电力系统规划常用 N-1 准则检验可靠性。用图的语言说：线路层面要求<b>没有桥（λ ≥ 2）</b>，站点层面要求<b>没有割点（κ ≥ 2）</b>。右表逐一模拟每个元件退出。"
        },
        {
          name: "找出薄弱环节",
          graph: "grid7", mark: true, panel: "n1",
          formula: '割点 {<span class="ft hot">' + nmOf("grid7", G7.cut) + '</span>}，桥 {<span class="ft hot">' + G7.br.map(e => enm("grid7", e)).join("、") + '</span>} ⇒ 不满足 N-1',
          badge: "不通过", tone: "red",
          text: "左侧环网 A–B–C–D 和右侧三角网 E–F–G 内部都有备用通路，但两部分之间只靠线路 C–E 相连：C–E 是桥，C、E 是割点，任何一个出故障都会让一片区域失去联系。"
        },
        {
          name: "模拟故障：线路 C–E 断开",
          graph: "grid7", removedE: [[2, 4]], comps: true, panel: "comp",
          formula: 'ω(G − CE) = <span class="ft hot">2</span>：E、F、G 所在区域与 A～D 失去联系',
          badge: "故障", tone: "red",
          text: "单条线路故障就把电网分成两片——这正是 N-1 准则要避免的情形。"
        },
        {
          name: "加一条备用线 B–F",
          graph: "grid7", added: [BACKUP], panel: "n1b",
          formula: '加边 B–F 后 <span class="ft hot-green hot">κ = ' + vertexConnectivity(7, G7B).k + '，λ = ' + edgeConnectivity(7, G7B).k + '</span> ⇒ 通过 N-1',
          badge: "加固", tone: "",
          text: "在桥的两侧之间再架一条线路，C–E 就落在了圈 B–C–E–F–B 上，不再是桥；C、E 也不再是割点。右表复查：任一元件退出，网络都保持连通。加哪条线最划算，还要结合距离与造价综合考虑。"
        },
        {
          name: "CPM：时间余量",
          graph: "aoe6", aoe: { res: AOE0, show: "crit" }, panel: "aoeAct",
          formula: '总时差 = <span class="ft hot">l − e</span>；关键活动余量为 0，工期 = 关键路径长 = ' + AOE0.T + ' 天',
          badge: "CPM", tone: "",
          text: "关键路径法（CPM）是项目管理的基本工具：非关键活动有余量，可以适当推迟或调走资源；关键活动没有余量，是进度管理的重点。"
        },
        {
          name: "压缩非关键活动 a1",
          graph: "aoe6", aoe: { res: AOE_A1, show: "crit" }, panel: "aoeAct", changed: ["a1"],
          formula: 'a1：3 → 2 天，工期仍为 <span class="ft hot">' + AOE_A1.T + '</span> 天',
          badge: "无效", tone: "red",
          text: "a1 本来就有 1 天余量，把它再缩短只会让余量变大，总工期纹丝不动。<b>在非关键活动上投入资源，缩短不了工期。</b>"
        },
        {
          name: "压缩关键活动 a5",
          graph: "aoe6", aoe: { res: AOE_A5, show: "crit" }, panel: "aoeAct", changed: ["a5"],
          formula: 'a5：4 → 3 天，工期 ' + AOE0.T + ' → <span class="ft hot-green hot">' + AOE_A5.T + '</span> 天；关键路径变为 ' + criticalPaths(6, AOE_A5).length + ' 条',
          badge: "有效", tone: "",
          text: "压缩关键活动 a5 后工期缩短 1 天，但此时 " + critStr(AOE_A5) + " 都成了关键路径（绿色）。要再缩短工期，必须<b>同时压缩所有关键路径</b>——关键路径会随压缩而转移，需要重新计算。"
        },
        {
          name: "迁移总结",
          graph: "grid7", added: [BACKUP], panel: "transfer", tryIt: true,
          formula: '<span class="ft hot">找薄弱点 → 补冗余 → 盯关键</span>：κ、λ 与关键路径都在刻画“最薄弱处”',
          badge: "迁移", tone: "gold",
          text: "通信骨干网的双路由、数据中心的冗余链路、供应链的备份供应商，都是在提高 κ 与 λ；项目排期盯关键路径，是在最长的那条链上用力。点「✋ 自由试验」可在当前图上自己删点删边、或在 AOE 步骤里调工期验证。"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, components, degrees, cutVertices, bridges, vertexConnectivity, edgeConnectivity, nMinus1, aoe, criticalPaths };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.CUT_LEVEL] || LEVELS.basic;
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

  const C = {
    red: "#D63B1D", gold: "#FFB400", ink: "#2C1810", muted: "#6B4A38", green: "#1F9D55", greenDark: "#2F7D57",
    err: "#C0392B", edge: "rgba(107,74,56,0.45)", del: "#a89a90"
  };
  const COMP_COLORS = [C.red, C.green, C.gold, "#6B4A38"];

  let step = 0, playTimer = null, playDelay = 2200;
  // 自由试验状态
  let exp = null; // {removedV:Set, removedE:Set(key), dur:{name:w}}
  let lastLayout = null;

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  }
  if (missionEl) missionEl.innerHTML = "<b>互动任务：</b>" + esc(level.mission);
  if (badgeEl) badgeEl.textContent = level.badge;
  if (legendEl) legendEl.innerHTML = level.legend.map(it => '<span><i class="' + (LG_CLASS[it[0]] || "lg-node") + '"></i>' + esc(it[1]) + '</span>').join("");

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(240, Math.floor(rect.width)), h = Math.max(260, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }
  const inList = (list, e) => (list || []).some(p => key(p[0], p[1]) === key(e[0], e[1]));

  // 当前步骤（叠加自由试验）后的有效状态
  function effective() {
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    let edges = g.edges.concat(st.added || []);
    if (exp && !g.directed) {
      const rv = Array.from(exp.removedV);
      const re = edges.filter(e => exp.removedE.has(key(e[0], e[1])));
      return { st, g, edges, removedV: rv, removedE: re, comps: true, mark: false, aoeRes: null, exp: true };
    }
    let aoeRes = st.aoe ? st.aoe.res : null;
    if (exp && g.directed) aoeRes = aoe(6, withDur(exp.dur));
    return { st, g, edges, removedV: st.removedV || [], removedE: st.removedE || [], comps: !!st.comps, mark: !!st.mark, aoeRes, exp: !!exp };
  }

  function draw() {
    const size = resize();
    const E = effective();
    const { st, g } = E;
    const n = g.nodes.length;
    const small = size.w < 480;
    const R = small ? 16 : 20;
    const lgH = legendEl ? legendEl.offsetHeight : 0;
    const showTimes = E.aoeRes && (E.exp || (st.aoe && st.aoe.show !== "none"));
    const padX = small ? 30 : 58, padTop = Math.max(56, lgH + 12 + (showTimes ? 44 : 26)), padBot = 44;
    const P = g.nodes.map(nd => ({ x: padX + nd.x * (size.w - 2 * padX), y: padTop + nd.y * (size.h - padTop - padBot) }));
    lastLayout = { P, R, g, edges: E.edges };
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    const rv = new Set(E.removedV);
    const compInfo = components(n, E.edges, E.removedV, E.removedE);
    const multi = compInfo.count > 1;
    const cutSet = new Set(E.mark ? cutVertices(n, E.edges) : []);
    const brList = E.mark ? bridges(n, E.edges) : [];
    const hl = new Set(st.nodes || []);
    const res = E.aoeRes;
    const show = E.exp ? "crit" : (st.aoe ? st.aoe.show : "");
    const changed = new Set(st.changed || []);

    // 边
    E.edges.forEach((e, idx) => {
      const a = P[e[0]], b = P[e[1]];
      const removed = inList(E.removedE, e) || rv.has(e[0]) || rv.has(e[1]);
      const isNew = inList(st.added, e);
      const act = g.directed ? res.act[idx] : null;
      let color = C.edge, width = 2, dash = [];
      if (removed) { color = C.del; dash = [6, 6]; width = 2; }
      else if (isNew) { color = C.green; dash = [10, 6]; width = 4; }
      else if (inList(brList, e) || inList(st.hotE, e)) { color = C.red; width = 4.5; }
      else if (inList(st.greenE, e)) { color = C.green; width = 4.5; }
      else if (act && show === "crit" && act.critical) { color = C.green; width = 4.5; }
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash);
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const sx = a.x + Math.cos(ang) * R, sy = a.y + Math.sin(ang) * R;
      const ex = b.x - Math.cos(ang) * (R + (g.directed ? 3 : 0)), ey = b.y - Math.sin(ang) * (R + (g.directed ? 3 : 0));
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.setLineDash([]);
      if (g.directed) {
        const L = 12;
        ctx.beginPath(); ctx.moveTo(ex, ey);
        ctx.lineTo(ex - L * Math.cos(ang - Math.PI / 7), ey - L * Math.sin(ang - Math.PI / 7));
        ctx.lineTo(ex - L * Math.cos(ang + Math.PI / 7), ey - L * Math.sin(ang + Math.PI / 7));
        ctx.closePath(); ctx.fillStyle = color; ctx.fill();
      }
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      if (removed && !rv.has(e[0]) && !rv.has(e[1])) {
        // 红叉：被删去的边
        ctx.strokeStyle = C.err; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(mx - 7, my - 7); ctx.lineTo(mx + 7, my + 7); ctx.moveTo(mx + 7, my - 7); ctx.lineTo(mx - 7, my + 7); ctx.stroke();
      }
      if (act) {
        const label = act.name + "=" + act.w;
        const ox = -Math.sin(ang) * 15, oy = Math.cos(ang) * 15;
        ctx.font = "800 " + (small ? 11 : 12.5) + "px 'JetBrains Mono', Consolas, monospace";
        const tw = ctx.measureText(label).width + 10;
        ctx.fillStyle = changed.has(act.name) ? "rgba(255,180,0,0.95)" : "rgba(255,251,240,0.94)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(mx + ox - tw / 2, my + oy - 10, tw, 20, 7); else ctx.rect(mx + ox - tw / 2, my + oy - 10, tw, 20);
        ctx.fill();
        ctx.fillStyle = show === "crit" && act.critical ? C.greenDark : C.ink;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(label, mx + ox, my + oy + 0.5);
      }
    });

    // 顶点
    P.forEach((p, i) => {
      const removed = rv.has(i);
      let fill = C.red, txt = "#fff";
      if (E.comps && multi && !removed) { fill = COMP_COLORS[compInfo.comp[i] % COMP_COLORS.length]; if (fill === C.gold) txt = C.ink; }
      if (cutSet.has(i) || hl.has(i)) { fill = C.gold; txt = C.ink; }
      if (removed) {
        ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,251,240,0.9)"; ctx.fill();
        ctx.strokeStyle = C.del; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.setLineDash([]);
        txt = C.del;
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
        ctx.fillStyle = fill; ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
        if (cutSet.has(i) || hl.has(i)) {
          ctx.beginPath(); ctx.arc(p.x, p.y, R + 5, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,180,0,0.5)"; ctx.lineWidth = 3; ctx.stroke();
        }
      }
      ctx.fillStyle = txt;
      ctx.font = "800 " + (g.directed ? 13 : 14) + "px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y + 0.5);
      // AOE 事件时间标签
      if (showTimes) {
        const parts = [];
        const both = show === "vl" || show === "crit";
        if (small) parts.push(both ? res.ve[i] + "/" + res.vl[i] : "ve=" + res.ve[i]);
        else {
          parts.push("ve=" + res.ve[i]);
          if (both) parts.push("vl=" + res.vl[i]);
        }
        const label = parts.join(" ");
        ctx.font = "800 12px 'JetBrains Mono', Consolas, monospace";
        const tw = ctx.measureText(label).width + 12;
        const by = p.y - R - 16;
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(p.x - tw / 2, by - 10, tw, 20, 8); else ctx.rect(p.x - tw / 2, by - 10, tw, 20);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillText(label, p.x, by + 0.5);
      }
    });

    ctx.fillStyle = C.muted;
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(showTimes && small && !E.exp && (show === "vl" || show === "crit") ? "顶点上方标签 = ve / vl" : E.exp ? (g.directed ? "自由试验：点活动边可缩短 1 天，右表可增减工期" : "自由试验：点顶点或边可删去 / 恢复") : g.caption, size.w / 2, size.h - 12);
  }

  /* ---- 右侧面板 ---- */
  function compHtml(E) {
    const n = E.g.nodes.length;
    const info = components(n, E.edges, E.removedV, E.removedE);
    const groups = [];
    for (let i = 0; i < n; i++) if (info.comp[i] >= 0) (groups[info.comp[i]] = groups[info.comp[i]] || []).push(E.g.names[i]);
    const delV = E.removedV.map(i => E.g.names[i]), delE = E.removedE.map(e => E.g.names[e[0]] + E.g.names[e[1]]);
    return '<div class="mx-card"><div class="mx-title">连通分支（实时计算）</div>' +
      '<div class="big-num ' + (info.count > 1 ? "bad" : "ok") + '">ω = ' + info.count + '</div>' +
      '<div class="pill-row">' + groups.map((gr, k) => '<span class="pill comp c' + (k % 4) + '">分支' + (k + 1) + '：{' + gr.join(", ") + '}</span>').join("") + '</div>' +
      '<div class="mx-note">已删顶点：' + (delV.length ? delV.join("、") : "无") + '；已删边：' + (delE.length ? delE.join("、") : "无") + '</div></div>';
  }
  function cutListHtml(n, edges, names) {
    const cv = cutVertices(n, edges), br = bridges(n, edges);
    const rows = [];
    for (let v = 0; v < n; v++) {
      const w = components(n, edges, [v]).count;
      rows.push('<tr class="' + (w > 1 ? "st-cur" : "") + '"><td class="nm">' + names[v] + '</td><td>' + w + '</td><td>' + (w > 1 ? '<span class="tag cur">割点</span>' : '<span class="tag wait">否</span>') + '</td></tr>');
    }
    return '<div class="mx-card"><div class="mx-title">逐个删点：ω(G − v)</div><table class="trace-table"><thead><tr><th>v</th><th>ω</th><th>结论</th></tr></thead><tbody>' + rows.join("") + '</tbody></table>' +
      '<div class="mx-note">割点：' + cv.map(i => names[i]).join("、") + '；桥：' + br.map(e => names[e[0]] + "–" + names[e[1]]).join("、") + '</div></div>';
  }
  function degHtml() {
    const g = GRAPHS.k4k4;
    return '<div class="mx-card"><div class="mx-title">各顶点的度</div><div class="pill-row">' +
      KK.deg.map((d, i) => '<span class="pill' + (d === KK.delta ? ' hot' : '') + '">deg(' + g.names[i] + ') = ' + d + '</span>').join("") +
      '</div><div class="mx-note">δ(G) = ' + KK.delta + '；度数之和 = ' + KK.deg.reduce((s, x) => s + x, 0) + ' = 2 × ' + g.edges.length + ' 条边。</div></div>';
  }
  function kldHtml(E) {
    const n = E.g.nodes.length;
    const kap = vertexConnectivity(n, E.edges), lam = edgeConnectivity(n, E.edges);
    const deg = degrees(n, E.edges), dl = Math.min.apply(null, deg);
    return compHtml(E) + '<div class="mx-card"><div class="mx-title">三个指标（穷举验证）</div>' +
      '<div class="kld"><div><b>κ</b><span>' + kap.k + '</span><small>删 {' + kap.witness.map(i => E.g.names[i]).join(",") + '}</small></div><em>≤</em>' +
      '<div><b>λ</b><span>' + lam.k + '</span><small>删 {' + lam.witness.map(e => E.g.names[e[0]] + E.g.names[e[1]]).join(",") + '}</small></div><em>≤</em>' +
      '<div><b>δ</b><span>' + dl + '</span><small>最小度</small></div></div>' +
      '<div class="mx-note">程序枚举所有 1 元、2 元……顶点子集与边子集，找到的最小断开集合即见证。</div></div>';
  }
  function mengerHtml() {
    return '<div class="mx-card"><div class="mx-title">A 到 G 的两条边不重通路</div>' +
      '<div class="pill-row"><span class="pill hot">① A → D → E → G</span><span class="pill pos">② A → B → D → F → G</span></div>' +
      '<div class="mx-note">第三条边不重通路不存在：从左边 K₄ 到右边 K₄ 只有 D–E、D–F 两条边可走。因此 λ(A,G) = 2。</div></div>';
  }
  function rulesHtml() {
    return cutListHtml(8, gE("net8"), GRAPHS.net8.names) + '<div class="mx-card"><div class="mx-title">判别要点</div>' +
      '<div class="pill-row"><span class="pill">桥 ⟺ 不在任何圈上</span><span class="pill">悬挂点不是割点</span><span class="pill">桥的非悬挂端点是割点</span><span class="pill">DFS 求割点与桥：O(n+m)</span></div></div>';
  }
  function aoeEvtHtml(res, show) {
    const rows = res.ve.map((v, i) => '<tr class="' + (show !== "ve" && res.ve[i] === res.vl[i] ? "st-done" : "") + '"><td class="nm">v' + (i + 1) + '</td><td>' + v + '</td><td>' + (show === "ve" ? "?" : res.vl[i]) + '</td></tr>').join("");
    return '<div class="mx-card"><div class="mx-title">事件的最早 / 最迟发生时间</div><table class="trace-table"><thead><tr><th>事件</th><th>ve</th><th>vl</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<div class="mx-note">拓扑序：' + res.order.map(i => "v" + (i + 1)).join(" → ") + '；工期 = ve(v6) = ' + res.T + ' 天。' + (show === "vl" ? "ve = vl 的事件（绿底）没有机动时间。" : "") + '</div></div>';
  }
  function aoeActHtml(res, opts) {
    const names = GRAPHS.aoe6.names;
    const rows = res.act.map(a => '<tr class="' + (opts.crit && a.critical ? "st-done" : "") + '"><td class="nm">' + a.name + '</td><td>' + names[a.u] + '→' + names[a.v] + '</td><td>' +
      (opts.edit ? '<span class="dur"><button type="button" class="kbtn sm" data-act="' + a.name + '" data-d="-1" aria-label="' + a.name + ' 工期减 1">−</button>' + a.w + '<button type="button" class="kbtn sm" data-act="' + a.name + '" data-d="1" aria-label="' + a.name + ' 工期加 1">+</button></span>' : a.w) +
      '</td>' + (opts.crit ? '<td>' + a.e + '</td><td>' + a.l + '</td><td>' + (a.critical ? '<span class="tag done">0 关键</span>' : '<span class="tag wait">' + a.slack + '</span>') + '</td>' : '') + '</tr>').join("");
    const head = '<tr><th>活动</th><th>边</th><th>工期</th>' + (opts.crit ? '<th>e</th><th>l</th><th>l−e</th>' : '') + '</tr>';
    return '<div class="mx-card"><div class="mx-title">' + (opts.crit ? "活动的最早 / 最迟开始时间" : "活动一览") + '</div><table class="trace-table"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table>' +
      (opts.crit ? '<div class="mx-note">工期 <b>' + res.T + '</b> 天；关键路径：' + critStr(res) + '</div>' : '') +
      (opts.edit ? '<div class="exp-actions"><button type="button" class="step-btn reset" id="expRestore">↺ 恢复原工期</button></div>' : '') + '</div>';
  }
  function n1Html(edges, title) {
    const g = GRAPHS.grid7;
    const r = nMinus1(7, edges);
    const vrow = r.vs.map(x => '<span class="pill ' + (x.ok ? "pos" : "hot") + '">' + g.names[x.v] + (x.ok ? " ✓" : " ✗") + '</span>').join("");
    const erow = r.es.map(x => '<span class="pill ' + (x.ok ? "pos" : "hot") + '">' + g.names[x.e[0]] + g.names[x.e[1]] + (x.ok ? " ✓" : " ✗") + '</span>').join("");
    return '<div class="mx-card"><div class="mx-title">' + title + '</div>' +
      '<div class="big-num ' + (r.ok ? "ok" : "bad") + '">' + (r.ok ? "通过 N-1" : "不通过 N-1") + '</div>' +
      '<div class="mx-note">站点退出（其余是否连通）：</div><div class="pill-row">' + vrow + '</div>' +
      '<div class="mx-note">线路退出：</div><div class="pill-row">' + erow + '</div>' +
      '<div class="mx-note">κ = ' + vertexConnectivity(7, edges).k + '，λ = ' + edgeConnectivity(7, edges).k + '，δ = ' + Math.min.apply(null, degrees(7, edges)) + '</div></div>';
  }
  function transferHtml() {
    return '<div class="mx-card"><div class="mx-title">迁移对照</div><table class="trace-table"><thead><tr><th>图论概念</th><th>工程含义</th></tr></thead><tbody>' +
      '<tr><td>割点 / 桥</td><td>单点故障</td></tr><tr><td>κ、λ ≥ 2</td><td>N-1 冗余、双路由</td></tr>' +
      '<tr><td>Menger 定理</td><td>不相交备份路径条数</td></tr><tr><td>关键路径</td><td>工期瓶颈、进度管理重点</td></tr><tr><td>时间余量 l−e</td><td>可调配的机动时间</td></tr></tbody></table></div>' +
      n1Html(G7B, "加固后复查");
  }
  function renderViz() {
    if (!vizText) return;
    const E = effective();
    const st = E.st;
    let html = "";
    if (E.exp) {
      if (E.g.directed) html = aoeActHtml(E.aoeRes, { crit: true, edit: true });
      else {
        const n = E.g.nodes.length;
        const cv = cutVertices(n, E.edges).map(i => E.g.names[i]);
        const br = bridges(n, E.edges).map(e => E.g.names[e[0]] + "–" + E.g.names[e[1]]);
        html = compHtml(E) + '<div class="mx-card"><div class="mx-title">原图（不删时）</div><div class="mx-note">割点：' + (cv.join("、") || "无") + '；桥：' + (br.join("、") || "无") +
          '；κ = ' + vertexConnectivity(n, E.edges).k + '，λ = ' + edgeConnectivity(n, E.edges).k + '</div><div class="exp-actions"><button type="button" class="step-btn reset" id="expRestore">↺ 恢复原图</button></div></div>';
      }
    } else {
      switch (st.panel) {
        case "comp": html = compHtml(E); break;
        case "cutlist": html = cutListHtml(E.g.nodes.length, E.edges, E.g.names); break;
        case "rules": html = rulesHtml(); break;
        case "deg": html = degHtml(); break;
        case "kld": html = kldHtml(E); break;
        case "menger": html = mengerHtml(); break;
        case "aoeEvt": html = aoeEvtHtml(st.aoe.res, st.aoe.show); break;
        case "aoeAct": html = aoeActHtml(st.aoe.res, { crit: st.aoe.show === "crit" }); break;
        case "n1": html = n1Html(gE("grid7"), "逐一模拟单个元件退出"); break;
        case "n1b": html = n1Html(G7B, "加备用线 B–F 后复查"); break;
        case "transfer": html = transferHtml(); break;
        default: html = "";
      }
    }
    vizText.innerHTML = html;
    const rs = document.getElementById("expRestore");
    if (rs) rs.addEventListener("click", () => { startExp(); renderAll(); });
    Array.prototype.forEach.call(vizText.querySelectorAll("button[data-act]"), b => {
      b.addEventListener("click", () => {
        const a = GRAPHS.aoe6.acts.find(x => x.name === b.dataset.act);
        const cur = exp.dur[a.name] || a.w;
        exp.dur[a.name] = Math.max(1, Math.min(9, cur + Number(b.dataset.d)));
        renderAll();
      });
    });
  }

  /* ---- 自由试验 ---- */
  function startExp() {
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    const base = st.aoe && st.aoe.res ? st.aoe.res.act : null;
    const dur = {};
    if (g.directed && base) base.forEach(a => { dur[a.name] = a.w; });
    exp = { removedV: new Set(), removedE: new Set(), dur: dur };
  }
  function toggleExp() {
    stopPlay();
    if (exp) exp = null; else startExp();
    renderAll();
  }
  function distToSeg(px, py, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
  }
  canvas.addEventListener("click", ev => {
    if (!exp || !lastLayout) return;
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
    const { P, R, g, edges } = lastLayout;
    if (!g.directed) {
      const vi = P.findIndex(p => Math.hypot(p.x - x, p.y - y) <= R + 6);
      if (vi >= 0) { exp.removedV.has(vi) ? exp.removedV.delete(vi) : exp.removedV.add(vi); renderAll(); return; }
    }
    let best = -1, bd = 12;
    edges.forEach((e, i) => { const d = distToSeg(x, y, P[e[0]], P[e[1]]); if (d < bd) { bd = d; best = i; } });
    if (best < 0) return;
    if (g.directed) {
      const a = GRAPHS.aoe6.acts[best];
      exp.dur[a.name] = Math.max(1, (exp.dur[a.name] || a.w) - 1);
    } else {
      const k = key(edges[best][0], edges[best][1]);
      exp.removedE.has(k) ? exp.removedE.delete(k) : exp.removedE.add(k);
    }
    renderAll();
  });

  /* ---- 渲染 ---- */
  function renderAll() {
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    if (exp) {
      const E = effective();
      if (g.directed) {
        const r = E.aoeRes;
        formulaText.innerHTML = '自由试验：工期 = <span class="ft hot">' + r.T + '</span> 天；关键路径 ' + critStr(r);
      } else {
        const w = components(g.nodes.length, E.edges, E.removedV, E.removedE).count;
        formulaText.innerHTML = '自由试验：删去 ' + E.removedV.length + ' 个点、' + E.removedE.length + ' 条边后 <span class="ft ' + (w > 1 ? "hot" : "hot-green hot") + '">ω = ' + w + '</span>';
      }
      stepStatus.innerHTML = '<span class="badge gold">试验</span><span>' + (g.directed ? "点击图中的活动边可把它的工期减 1 天，也可在右表中用 −/+ 调整；观察总工期和关键路径如何变化。" : "点击顶点或边即可删去，再点一次恢复。试着用最少的删除把网络断开，体会 κ 与 λ 的含义。") + '</span>';
    } else {
      formulaText.innerHTML = st.formula;
      stepStatus.innerHTML = '<span class="badge ' + (st.tone || "") + '">' + esc(st.badge || (step + 1)) + '</span><span>' + st.text + '</span>';
    }
    renderViz();
    draw();
    canvas.classList.toggle("is-exp", !!exp);
    const eb = document.getElementById("expBtn");
    if (eb) { eb.classList.toggle("on", !!exp); eb.setAttribute("aria-pressed", String(!!exp)); eb.textContent = exp ? "✓ 退出自由试验" : "✋ 自由试验"; }
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
  function go(i) { step = Math.max(0, Math.min(level.steps.length - 1, i)); exp = null; renderAll(); }
  function stopPlay() {
    if (playTimer) { clearTimeout(playTimer); playTimer = null; }
    const b = document.getElementById("playBtn");
    if (b) { b.classList.remove("playing"); b.textContent = "▶ 自动播放"; }
  }
  function tick() { if (step >= level.steps.length - 1) { stopPlay(); return; } go(step + 1); playTimer = setTimeout(tick, playDelay); }
  function togglePlay() {
    const b = document.getElementById("playBtn");
    if (playTimer) { stopPlay(); return; }
    if (step === level.steps.length - 1) go(0);
    if (b) { b.classList.add("playing"); b.textContent = "⏸ 暂停"; }
    playTimer = setTimeout(tick, playDelay);
  }
  function buildControls() {
    const items = level.steps.map((s, i) => '<button type="button" class="step-item" data-i="' + i + '"><span class="num">' + (i + 1) + '</span><span>' + esc(s.name) + '</span></button>').join("");
    controls.innerHTML =
      '<div class="step-controller">' +
        '<div class="step-progress-head"><span id="stepCounter">第 1 / ' + level.steps.length + ' 步</span><small>' + esc(level.label) + ' · 点一步看变化</small></div>' +
        '<div class="progress-track"><div class="progress-fill"></div></div>' +
        '<div class="step-btns">' +
          '<button type="button" class="step-btn" id="prevBtn">◀ 上一步</button>' +
          '<button type="button" class="step-btn primary" id="nextBtn">下一步 ▶</button>' +
          '<button type="button" class="step-btn" id="playBtn">▶ 自动播放</button>' +
          '<button type="button" class="step-btn reset" id="resetBtn">↺ 重置</button>' +
          '<button type="button" class="step-btn wide exp-btn" id="expBtn" aria-pressed="false">✋ 自由试验</button>' +
        '</div>' +
        '<label class="speed-row"><span>播放速度</span><input type="range" id="speedRange" min="1" max="5" step="1" value="3" aria-label="自动播放速度"><b id="speedVal">中</b></label>' +
      '</div>' +
      '<div class="step-list">' + items + '</div>';
    document.getElementById("prevBtn").addEventListener("click", () => { stopPlay(); go(step - 1); });
    document.getElementById("nextBtn").addEventListener("click", () => { stopPlay(); go(step + 1); });
    document.getElementById("playBtn").addEventListener("click", togglePlay);
    document.getElementById("resetBtn").addEventListener("click", () => { stopPlay(); go(0); });
    document.getElementById("expBtn").addEventListener("click", toggleExp);
    const sp = document.getElementById("speedRange"), spv = document.getElementById("speedVal");
    const DELAYS = [3800, 3000, 2200, 1500, 1000], NAMES = ["很慢", "慢", "中", "快", "很快"];
    sp.addEventListener("input", () => { playDelay = DELAYS[sp.value - 1]; spv.textContent = NAMES[sp.value - 1]; });
    Array.prototype.forEach.call(document.querySelectorAll(".step-item"), el => el.addEventListener("click", () => { stopPlay(); go(Number(el.dataset.i)); }));
  }

  buildControls();
  renderAll();
  let rz = null;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(draw, 80); });
})();
