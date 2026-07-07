/* ============================================================
   7.3 图同构 · 三层统一交互引擎（双图对照 + 映射连线）
   window.ISO_LEVEL = "basic" | "advanced" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  function degSeq(n, edges) {
    const d = Array(n).fill(0);
    edges.forEach(e => { d[e[0]]++; d[e[1]]++; });
    return d.slice().sort((a, b) => b - a);
  }
  function sameSeq(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  function hasEdge(edges, u, v) {
    return edges.some(e => (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u));
  }
  // map[i] = G 的顶点 i 映到 H 的顶点 map[i]；检验保相邻双射
  function mappingPreserves(gEdges, hEdges, map) {
    if (gEdges.length !== hEdges.length) return false;
    return gEdges.every(e => hasEdge(hEdges, map[e[0]], map[e[1]]));
  }
  function componentsCount(n, edges) {
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

  /* ---------------- 图对数据 ----------------
     pair = { g:{names,nodes,edges,caption,directed?}, h:{...}, map:[…]|null }
     nodes 坐标为该侧区域内 [0,1] 归一化 */
  const PAIRS = {
    // 基础层：同一图的两种画法（4 点 5 边）
    square: {
      g: {
        names: ["A", "B", "C", "D"], caption: "图 G：方形画法",
        nodes: [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.2 }, { x: 0.8, y: 0.8 }, { x: 0.2, y: 0.8 }],
        edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]]
      },
      h: {
        names: ["1", "2", "3", "4"], caption: "图 H：风筝画法",
        nodes: [{ x: 0.5, y: 0.12 }, { x: 0.5, y: 0.62 }, { x: 0.1, y: 0.5 }, { x: 0.9, y: 0.5 }],
        edges: [[0, 2], [2, 1], [1, 3], [3, 0], [0, 1]]
      },
      map: [0, 2, 1, 3]   // A→1, B→3, C→2, D→4
    },
    // 进阶层：五边形 vs 五角星（C5 的两种画法）
    penta: {
      g: {
        names: ["v₀", "v₁", "v₂", "v₃", "v₄"], caption: "G：五边形 C₅",
        nodes: [0, 1, 2, 3, 4].map(i => {
          const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
          return { x: 0.5 + 0.4 * Math.cos(a), y: 0.5 + 0.4 * Math.sin(a) };
        }),
        edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]
      },
      h: {
        names: ["w₀", "w₁", "w₂", "w₃", "w₄"], caption: "H：五角星画法",
        nodes: [0, 1, 2, 3, 4].map(i => {
          const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
          return { x: 0.5 + 0.4 * Math.cos(a), y: 0.5 + 0.4 * Math.sin(a) };
        }),
        edges: [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]]
      },
      map: [0, 2, 4, 1, 3]  // f(v_i) = w_{2i mod 5}
    },
    // 进阶层反例：C6 vs 两个三角形（度序列相同、不同构）
    noniso: {
      g: {
        names: ["a", "b", "c", "d", "e", "f"], caption: "G：六边形 C₆（连通）",
        nodes: [0, 1, 2, 3, 4, 5].map(i => {
          const a = -Math.PI / 2 + i * 2 * Math.PI / 6;
          return { x: 0.5 + 0.4 * Math.cos(a), y: 0.5 + 0.4 * Math.sin(a) };
        }),
        edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]]
      },
      h: {
        names: ["p", "q", "r", "s", "t", "u"], caption: "H：两个三角形 2C₃（不连通）",
        nodes: [
          { x: 0.25, y: 0.15 }, { x: 0.45, y: 0.5 }, { x: 0.05, y: 0.5 },
          { x: 0.75, y: 0.5 }, { x: 0.95, y: 0.85 }, { x: 0.55, y: 0.85 }
        ],
        edges: [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]]
      },
      map: null
    },
    // 拓展层：正丁烷 vs 异丁烷（同分异构体）
    butane: {
      g: {
        names: ["C₁", "C₂", "C₃", "C₄"], caption: "正丁烷：链状 P₄",
        nodes: [{ x: 0.08, y: 0.5 }, { x: 0.38, y: 0.5 }, { x: 0.66, y: 0.5 }, { x: 0.94, y: 0.5 }],
        edges: [[0, 1], [1, 2], [2, 3]]
      },
      h: {
        names: ["C₁", "C₂", "C₃", "C₄"], caption: "异丁烷：星状 K₁,₃",
        nodes: [{ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.1 }, { x: 0.12, y: 0.82 }, { x: 0.88, y: 0.82 }],
        edges: [[0, 1], [0, 2], [0, 3]]
      },
      map: null
    },
    // 拓展层：子图同构（在大图中找三角形模式）
    pattern: {
      g: {
        names: ["x", "y", "z"], caption: "模式 P：三角形",
        nodes: [{ x: 0.5, y: 0.14 }, { x: 0.13, y: 0.82 }, { x: 0.87, y: 0.82 }],
        edges: [[0, 1], [1, 2], [2, 0]]
      },
      h: {
        names: ["a", "b", "c", "d", "e", "f", "g"], caption: "大图 H：网络数据",
        nodes: [
          { x: 0.5, y: 0.05 }, { x: 0.88, y: 0.28 }, { x: 0.95, y: 0.7 },
          { x: 0.62, y: 0.93 }, { x: 0.22, y: 0.9 }, { x: 0.05, y: 0.5 },
          { x: 0.45, y: 0.5 }
        ],
        edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 6], [3, 6], [1, 3]]
      },
      map: null
    },
    // 拓展层：反欺诈（交易网中的环形转账，有向）
    fraud: {
      g: {
        names: ["①", "②", "③", "④"], caption: "模式 P：环形转账 C₄",
        directed: true,
        nodes: [{ x: 0.5, y: 0.08 }, { x: 0.9, y: 0.5 }, { x: 0.5, y: 0.92 }, { x: 0.1, y: 0.5 }],
        edges: [[0, 1], [1, 2], [2, 3], [3, 0]]
      },
      h: {
        names: ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛"], caption: "交易网络（账户与转账）",
        directed: true,
        nodes: [
          { x: 0.12, y: 0.15 }, { x: 0.5, y: 0.06 }, { x: 0.88, y: 0.18 },
          { x: 0.94, y: 0.6 }, { x: 0.68, y: 0.92 }, { x: 0.3, y: 0.9 },
          { x: 0.06, y: 0.55 }, { x: 0.5, y: 0.5 }
        ],
        edges: [[0, 1], [1, 2], [2, 3], [7, 4], [4, 5], [5, 7], [6, 0], [3, 7], [5, 6], [7, 1]]
      },
      map: null
    }
  };

  /* ---------------- 三层步骤数据 ---------------- */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "跟着映射连线逐边检验：两张画法不同的图，结构是否完全一样。",
      badge: "G ≅ H ?",
      steps: [
        {
          name: "两张图，画法不同",
          pair: "square",
          formula: '<span class="ft hot">G</span> ≟ <span class="ft hot-blue hot">H</span>',
          badge: "G ≟ H", tone: "gold",
          text: "左边是方形，右边像风筝——<b>长得完全不一样</b>。但『画法』只是表象，我们要看的是<b>结构</b>：谁和谁相连。"
        },
        {
          name: "先数点和边",
          pair: "square",
          formula: '|V(G)|=|V(H)|=<span class="ft hot">4</span>,  |E(G)|=|E(H)|=<span class="ft hot-blue hot">5</span>',
          badge: "4点5边", tone: "blue", viz: "invariants",
          text: "第一步先核对最基本的数据：两图都是 4 个顶点、5 条边。<b>点数或边数不同，立刻可以说“不同构”</b>；相同则继续往下查。"
        },
        {
          name: "建立双射 f",
          pair: "square", showMap: true,
          formula: 'f: <span class="ft hot">A→1, B→3, C→2, D→4</span>（一一对应）',
          badge: "双射", tone: "",
          text: "给两图的顶点<b>配对</b>（金色虚线）：每个 G 的顶点对应唯一的 H 顶点，反之亦然——这就是<b>双射</b>。"
        },
        {
          name: "检验一条边",
          pair: "square", showMap: [0, 1],
          gEdges: [[0, 1]], gNodes: [0, 1], hEdges: [[0, 2]], hNodes: [0, 2],
          formula: '{A,B} ∈ E(G)  ⟹  {f(A),f(B)} = <span class="ft hot">{1,3}</span> ∈ E(H) ✓',
          badge: "保相邻", tone: "",
          text: "关键检验：G 中 A、B 相邻，映射过去后 1、3 在 H 中<b>也必须相邻</b>。看图：两条红色高亮边正好对应。"
        },
        {
          name: "逐边全部检验",
          pair: "square", showMap: true,
          gEdges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]], hEdges: [[0, 2], [2, 1], [1, 3], [3, 0], [0, 1]],
          formula: '<span class="ft hot">5 / 5</span> 条边全部保持相邻 ✓',
          badge: "5/5 ✓", tone: "", viz: "mapcheck",
          text: "把 G 的每条边都映射过去检查：5 条边全部落在 H 的边上，一条不多、一条不少。"
        },
        {
          name: "结论：同构",
          pair: "square", showMap: true,
          gNodes: [0, 1, 2, 3], hNodes: [0, 1, 2, 3],
          formula: '<span class="ft hot-green hot">G ≅ H</span>：存在保相邻的双射',
          badge: "同构", tone: "",
          text: "存在这样一个<b>保相邻的双射</b>，就说 G 与 H <b>同构</b>——画法不同，<b>本质相同</b>。这正是“透过现象看本质”。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "用不变量快速排除非同构，用构造双射证明同构，识破『度序列相同』的陷阱。",
      badge: "不变量判别",
      steps: [
        {
          name: "定义回顾",
          pair: "penta",
          formula: 'G ≅ H  ⟺  ∃双射 f：<span class="ft hot">{u,v}∈E(G) ⟺ {f(u),f(v)}∈E(H)</span>',
          badge: "定义", tone: "gold",
          text: "五边形和五角星——它们同构吗？定义说：要找到一个<b>双向保相邻</b>的顶点双射。先别急着找，第一步永远是查<b>不变量</b>。"
        },
        {
          name: "不变量①：点数边数",
          pair: "penta",
          formula: '|V|: <span class="ft hot">5=5</span> ✓,  |E|: <span class="ft hot-blue hot">5=5</span> ✓',
          badge: "初检通过", tone: "blue", viz: "invariants",
          text: "两图都是 5 点 5 边，每个顶点度数都是 2。必要条件全部通过——<b>但这还不能证明同构</b>，只说明“还没被排除”。"
        },
        {
          name: "构造映射 f(vᵢ)=w₂ᵢ",
          pair: "penta", showMap: true,
          formula: 'f(v_i) = <span class="ft hot">w_(2i mod 5)</span>：v₀→w₀, v₁→w₂, v₂→w₄, v₃→w₁, v₄→w₃',
          badge: "隔位映射", tone: "",
          text: "妙招：把 vᵢ 映到 w₂ᵢ（下标模 5）。五边形的“相邻”经过<b>乘 2</b> 变成五角星的“隔位相连”——金色虚线就是这个双射。"
        },
        {
          name: "逐边检验",
          pair: "penta", showMap: true,
          gEdges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]], hEdges: [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]],
          formula: '{vᵢ, vᵢ₊₁} ↦ {w₂ᵢ, w₂ᵢ₊₂}：<span class="ft hot">5/5 保持</span> ⇒ <span class="ft hot-green hot">C₅ ≅ 五角星</span>',
          badge: "同构 ✓", tone: "", viz: "mapcheck",
          text: "每条五边形的边都映到一条五角星的边。<b>五角星就是 C₅ 换个画法</b>——结构不变量（全 2 度、一个 5 圈）完全一致。"
        },
        {
          name: "陷阱：度序列相同",
          pair: "noniso",
          formula: '度序列：G=(2,2,2,2,2,2)，H=<span class="ft hot">(2,2,2,2,2,2)</span> —— 完全相同！',
          badge: "陷阱", tone: "red", viz: "invariants",
          text: "新的一对：六边形 C₆ vs 两个三角形 2C₃。点数、边数、<b>度序列全都相同</b>。它们同构吗？——别被表象骗了。"
        },
        {
          name: "不变量②：连通性",
          pair: "noniso",
          gNodes: [0, 1, 2, 3, 4, 5], hNodes: [0, 1, 2],
          formula: '连通分量：G = <span class="ft hot-green hot">1</span>，H = <span class="ft hot">2</span>  ⇒  G ≇ H',
          badge: "非同构", tone: "red",
          text: "C₆ 是一整块，2C₃ 分成两块——<b>连通分量数是同构不变量</b>，不同即可宣判非同构。圈长也是：G 有 6-圈，H 只有 3-圈。"
        },
        {
          name: "判别流程",
          pair: "noniso",
          formula: '不变量不同 ⇒ <span class="ft hot">必不同构</span>；不变量全同 ⇒ 仍需<span class="ft hot-blue hot">构造双射</span>',
          badge: "方法论", tone: "blue", viz: "checklist",
          text: "记住不对称性：<b>不变量只能否定，不能肯定</b>。排除靠不变量（快），证明靠构造（慢）。这就是“大胆假设、小心求证”。"
        },
        {
          name: "同构判定有多难",
          pair: "penta", showMap: true,
          formula: '图同构 GI：<span class="ft hot">未知多项式算法</span>，也未证 NP-完全（Babai 2016：拟多项式）',
          badge: "GI 问题", tone: "gold",
          text: "一般图的同构判定至今没有多项式算法，但也不像 NP-完全问题那样“看似无望”——它卡在 P 与 NP-完全之间，是复杂性理论的著名悬案。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "把同构迁移到分子识别与反欺诈：同分异构体、子图同构与模式匹配。",
      badge: "结构识别",
      steps: [
        {
          name: "分子就是图",
          pair: "butane",
          formula: '原子 = <span class="ft hot">顶点</span>，化学键 = <span class="ft hot-blue hot">边</span>；两个分子同为 C₄H₁₀',
          badge: "分子图", tone: "gold",
          text: "把碳骨架画成图：正丁烷是一条链 P₄，异丁烷是星形 K₁,₃。<b>分子式相同（C₄H₁₀），图却可能不同</b>——这就要靠同构来分辨。"
        },
        {
          name: "同分异构体",
          pair: "butane",
          gNodes: [1, 2], hNodes: [0],
          formula: '度序列：P₄=<span class="ft hot-green hot">(2,2,1,1)</span> ≠ K₁,₃=<span class="ft hot">(3,1,1,1)</span> ⇒ 不同构',
          badge: "异构体", tone: "red", viz: "invariants",
          text: "链上中间碳的度是 2，星形中心碳的度是 3——<b>度序列不同 ⇒ 图不同构 ⇒ 是两种物质</b>（沸点差 11℃！）。同式不同构，即“同分异构体”。"
        },
        {
          name: "化学信息学",
          pair: "butane",
          formula: '“是否同一分子” = <span class="ft hot">图同构判定</span> ⇒ 规范编码 (canonical SMILES)',
          badge: "去重", tone: "blue",
          text: "化学数据库上亿分子如何去重？给每个分子图算一个<b>规范编码</b>——同构的图编码必相同。PubChem、ChemDraw 每天都在做图同构。"
        },
        {
          name: "子图同构：找模式",
          pair: "pattern",
          gNodes: [0, 1, 2], gEdges: [[0, 1], [1, 2], [2, 0]],
          hNodes: [1, 3, 6], hEdges: [[1, 6], [3, 6], [1, 3]],
          formula: '在大图 H 中寻找与模式 P <span class="ft hot">同构的子图</span> ⇒ 命中 {b, d, g}',
          badge: "命中", tone: "",
          text: "升级问题：不是问“两图是否相同”，而是<b>在大图里找一块与模式同构的子图</b>。红色高亮就是在网络数据中定位到的三角形。"
        },
        {
          name: "NP-完全的边界",
          pair: "pattern",
          formula: '<span class="ft hot">子图同构 ∈ NP-完全</span>；而整图同构 GI 介于 P 与 NPC 之间',
          badge: "复杂性", tone: "red",
          text: "找子图比对整图<b>难得多</b>：子图同构已被证明 NP-完全，大图上只能靠剪枝（VF2 算法）、索引与启发式。工程上要学会“与指数复杂度共处”。"
        },
        {
          name: "反欺诈：环形转账",
          pair: "fraud",
          gNodes: [0, 1, 2, 3], gEdges: [[0, 1], [1, 2], [2, 3], [3, 0]],
          hNodes: [7, 4, 5], hEdges: [[7, 4], [4, 5], [5, 7]],
          formula: '在交易网中匹配<span class="ft hot">环形模式</span> ⇒ 命中 辛→戊→己→辛（资金空转）',
          badge: "风控命中", tone: "red",
          text: "反洗钱系统把账户当顶点、转账当有向边，用<b>子图同构在亿级交易网中匹配“环形转账”模式</b>——红色的资金闭环就是可疑信号。"
        },
        {
          name: "迁移总结",
          pair: "fraud",
          formula: '<span class="ft hot">分子识别 · 指纹比对 · 反欺诈</span> —— 同构 = 结构层面的“相同”',
          badge: "transfer", tone: "gold", viz: "transferlist",
          text: "同构思想贯穿三类工程：化学结构检索、生物指纹/电路验证、金融风控模式匹配。<b>抓住结构不变量，就是在复杂世界中抓住本质。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { PAIRS, LEVELS, degSeq, sameSeq, hasEdge, mappingPreserves, componentsCount };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.ISO_LEVEL] || LEVELS.basic;
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
  const R = 17;

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
  function sidePos(side, which, size) {
    const x0 = which === "g" ? 0.04 : 0.56;
    const regW = 0.40;
    const padTop = 34, padBot = 56;
    return side.nodes.map(nd => ({
      x: (x0 + nd.x * regW) * size.w,
      y: padTop + nd.y * (size.h - padTop - padBot)
    }));
  }
  function edgeIn(list, e) {
    return (list || []).some(p => (p[0] === e[0] && p[1] === e[1]) || (p[0] === e[1] && p[1] === e[0]));
  }
  function drawArrowHead(x, y, ang, color) {
    const L = 10;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - L * Math.cos(ang - Math.PI / 7), y - L * Math.sin(ang - Math.PI / 7));
    ctx.lineTo(x - L * Math.cos(ang + Math.PI / 7), y - L * Math.sin(ang + Math.PI / 7));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  function drawSide(side, P, hlNodes, hlEdges, anyHl) {
    const directed = !!side.directed;
    side.edges.forEach(e => {
      const hot = edgeIn(hlEdges, e);
      const dim = anyHl && !hot;
      const color = hot ? "#d63b1d" : dim ? "rgba(47,95,159,0.2)" : "rgba(47,95,159,0.62)";
      ctx.strokeStyle = color;
      ctx.lineWidth = hot ? 4 : 2.2;
      const a = P[e[0]], b = P[e[1]];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const sx = a.x + Math.cos(ang) * R, sy = a.y + Math.sin(ang) * R;
      const ex = b.x - Math.cos(ang) * R, ey = b.y - Math.sin(ang) * R;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      if (directed) drawArrowHead(ex, ey, ang, color);
    });
    P.forEach((p, i) => {
      const hot = (hlNodes || []).indexOf(i) >= 0;
      const dim = anyHl && !hot;
      ctx.beginPath();
      ctx.arc(p.x, p.y, hot ? R + 2 : R, 0, Math.PI * 2);
      ctx.fillStyle = hot ? "#d63b1d" : dim ? "#cdbfae" : "#2f7d57";
      ctx.fill();
      ctx.strokeStyle = "#fff8ec";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "800 12px 'JetBrains Mono', 'Noto Serif SC', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(side.names[i], p.x, p.y);
    });
  }
  function draw() {
    const size = resize();
    const st = level.steps[step];
    const pair = PAIRS[st.pair];
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";
    const Pg = sidePos(pair.g, "g", size);
    const Ph = sidePos(pair.h, "h", size);
    const anyHl = !!((st.gNodes && st.gNodes.length) || (st.gEdges && st.gEdges.length) ||
                     (st.hNodes && st.hNodes.length) || (st.hEdges && st.hEdges.length));

    // 映射连线（金色虚线）
    if (st.showMap && pair.map) {
      const idxs = Array.isArray(st.showMap) ? st.showMap : pair.map.map((_, i) => i);
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(197,138,31,0.65)";
      ctx.lineWidth = 2;
      idxs.forEach(i => {
        const a = Pg[i], b = Ph[pair.map[i]];
        ctx.beginPath(); ctx.moveTo(a.x + R, a.y); ctx.lineTo(b.x - R, b.y); ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    drawSide(pair.g, Pg, st.gNodes, st.gEdges, anyHl);
    drawSide(pair.h, Ph, st.hNodes, st.hEdges, anyHl);

    // 中缝符号 + 两侧图注
    ctx.fillStyle = "#d63b1d";
    ctx.font = "800 26px 'JetBrains Mono', Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("≅?", size.w * 0.5, size.h * 0.42);
    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.fillText(pair.g.caption, size.w * 0.24, size.h - 22);
    ctx.fillText(pair.h.caption, size.w * 0.76, size.h - 22);
  }

  /* ---- 辅助可视化 ---- */
  function invariantsHtml(pair) {
    const g = pair.g, h = pair.h;
    const dg = degSeq(g.nodes.length, g.edges), dh = degSeq(h.nodes.length, h.edges);
    const cg = componentsCount(g.nodes.length, g.edges), ch = componentsCount(h.nodes.length, h.edges);
    function row(name, a, b, okFn) {
      const ok = okFn(a, b);
      return '<span class="pill" style="' + (ok ? "" : "background:rgba(214, 59, 29,0.14);color:#d63b1d") + '">' +
        name + '：' + a + ' vs ' + b + (ok ? " ✓" : " ✗") + '</span>';
    }
    return '<div class="graph-summary"><b>不变量对照：</b><div class="pill-row">' +
      row("顶点数", g.nodes.length, h.nodes.length, (a, b) => a === b) +
      row("边数", g.edges.length, h.edges.length, (a, b) => a === b) +
      row("度序列", "(" + dg.join(",") + ")", "(" + dh.join(",") + ")", () => sameSeq(dg, dh)) +
      row("连通分量", cg, ch, (a, b) => a === b) +
      '</div></div>';
  }
  function mapcheckHtml(pair) {
    if (!pair.map) return "";
    const rows = pair.g.edges.map(e => {
      const fu = pair.map[e[0]], fv = pair.map[e[1]];
      const ok = hasEdge(pair.h.edges, fu, fv);
      return '<span class="pill">{' + pair.g.names[e[0]] + ',' + pair.g.names[e[1]] + '} → {' +
        pair.h.names[fu] + ',' + pair.h.names[fv] + '} ' + (ok ? "✓" : "✗") + '</span>';
    }).join("");
    const all = mappingPreserves(pair.g.edges, pair.h.edges, pair.map);
    return '<div class="graph-summary"><b>逐边检验：</b><div class="pill-row">' + rows + '</div>' +
      (all ? "全部保持 ⇒ <b>同构成立</b>。" : "存在破坏 ⇒ 该映射不可行。") + '</div>';
  }
  function checklistHtml() {
    return '<div class="graph-summary"><b>判别流程：</b>' +
      '<div class="pill-row"><span class="pill">① 查点数边数</span><span class="pill">② 查度序列</span><span class="pill">③ 查连通性/圈长</span><span class="pill">④ 全过→尝试构造双射</span></div>' +
      '任何一步不同即可判非同构；全部相同仍需第④步才能下“同构”结论。</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">化学：分子查重 = 图同构</span><span class="pill">安全：指纹/电路验证</span><span class="pill">金融：交易模式匹配 = 子图同构</span></div>' +
      '结构不变量是所有这些系统的“防伪码”。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const pair = PAIRS[st.pair];
    let html = "";
    switch (st.viz) {
      case "invariants": html = invariantsHtml(pair); break;
      case "mapcheck": html = mapcheckHtml(pair); break;
      case "checklist": html = checklistHtml(); break;
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
