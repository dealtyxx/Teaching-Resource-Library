/* ============================================================
   8.4 平面图 · 三层统一交互引擎（欧拉公式 V-E+F=2 + 面标注 + 四色）
   window.PLANAR_LEVEL = "basic" | "advanced" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  function euler(V, E, F) { return V - E + F; }
  function facesFromEuler(V, E) { return 2 - V + E; }           // 连通平面图
  function simplePlanarBoundOK(V, E) { return V < 3 || E <= 3 * V - 6; }
  function bipartitePlanarBoundOK(V, E) { return V < 3 || E <= 2 * V - 4; }
  function greedyColor(n, edges, order) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
    const color = Array(n).fill(-1);
    const seq = order || Array.from({ length: n }, (_, i) => i);
    for (const u of seq) {
      const used = new Set(adj[u].map(v => color[v]).filter(c => c >= 0));
      let c = 0; while (used.has(c)) c++;
      color[u] = c;
    }
    return color;
  }
  function isProperColoring(edges, color) {
    return edges.every(e => color[e[0]] !== color[e[1]]);
  }
  function maxColors(color) { return Math.max.apply(null, color) + 1; }

  /* ---------------- 图库 ----------------
     每个平面图带 V,E,F（已知嵌入）与可选 faceDots（面质心标注，归一化坐标） */
  const AZ = "ABCDEFG".split("");
  function ring(n, r, cx, cy) {
    return Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; });
  }
  const GRAPHS = {
    // K4 平面画法（外三角 + 中心）：V4 E6 F4
    k4plane: {
      names: AZ.slice(0, 4), caption: "K₄ 平面画法（无交叉）", V: 4, E: 6, F: 4,
      nodes: [{ x: 0.5, y: 0.08 }, { x: 0.08, y: 0.88 }, { x: 0.92, y: 0.88 }, { x: 0.5, y: 0.56 }],
      edges: [[0, 1], [1, 2], [2, 0], [0, 3], [1, 3], [2, 3]],
      faceDots: [
        { x: 0.36, y: 0.5, t: "1" }, { x: 0.5, y: 0.78, t: "2" }, { x: 0.64, y: 0.5, t: "3" }, { x: 0.5, y: -0.02, t: "外" }
      ]
    },
    // K4 交叉画法（正方形 + 两对角线相交）：同一个图，画法有交叉
    k4cross: {
      names: AZ.slice(0, 4), caption: "K₄ 交叉画法（对角线相交）", V: 4, E: 6,
      nodes: [{ x: 0.12, y: 0.14 }, { x: 0.88, y: 0.14 }, { x: 0.88, y: 0.86 }, { x: 0.12, y: 0.86 }],
      edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]], crossing: [[0, 2], [1, 3]]
    },
    // 正方形 + 一条对角线：V4 E5 F3
    sqdiag: {
      names: AZ.slice(0, 4), caption: "正方形加一对角线", V: 4, E: 5, F: 3,
      nodes: [{ x: 0.14, y: 0.16 }, { x: 0.86, y: 0.16 }, { x: 0.86, y: 0.84 }, { x: 0.14, y: 0.84 }],
      edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]],
      faceDots: [{ x: 0.62, y: 0.35, t: "1" }, { x: 0.35, y: 0.62, t: "2" }, { x: 0.5, y: -0.02, t: "外" }]
    },
    // K5：完全图，非平面
    k5: {
      names: AZ.slice(0, 5), caption: "K₅（完全图，非平面）", V: 5, E: 10,
      nodes: ring(5, 0.4, 0.5, 0.52),
      edges: (function () { const es = []; for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) es.push([i, j]); return es; })()
    },
    // K3,3：完全二部，非平面
    k33: {
      names: ["A", "B", "C", "1", "2", "3"], caption: "K₃,₃（完全二部，非平面）", V: 6, E: 9, bipartite: true,
      nodes: [
        { x: 0.15, y: 0.12 }, { x: 0.15, y: 0.5 }, { x: 0.15, y: 0.88 },
        { x: 0.85, y: 0.12 }, { x: 0.85, y: 0.5 }, { x: 0.85, y: 0.88 }
      ],
      edges: [[0, 3], [0, 4], [0, 5], [1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5]]
    },
    // 轮图 W5（中心 + C5）：平面，奇轮需 4 色
    wheel: {
      names: ["O", "A", "B", "C", "D", "E"], caption: "轮图 W₅（地图着色示例）", V: 6, E: 10, F: 6,
      nodes: [{ x: 0.5, y: 0.5 }].concat(ring(5, 0.42, 0.5, 0.5)),
      edges: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [2, 3], [3, 4], [4, 5], [5, 1]]
    }
  };

  /* ---------------- 三层步骤数据 ---------------- */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "认识“可铺平、无交叉”的平面图，数出 V、E、F，验证欧拉公式 V−E+F=2。",
      badge: "V−E+F=2",
      steps: [
        {
          name: "什么是平面图",
          graph: "k4plane",
          formula: '平面图 = 能画在平面上<span class="ft hot">任意两边不交叉</span>',
          badge: "定义", tone: "",
          text: "把图画在纸上，若能让所有边<b>互不穿越</b>，就是平面图。电路、地图都追求这种“清晰有序”的无交叉布局。"
        },
        {
          name: "交叉可以消除",
          graph: "k4cross",
          formula: '同一个 K₄：<span class="ft hot">交叉画法</span>只是没摆好，其实可平面',
          badge: "别被画法骗", tone: "gold",
          text: "这张 K₄ 的两条对角线交叉了——但“有交叉”不代表“非平面”。把中间那点挪到三角形内部，交叉就消失了（下一步）。<b>判断平面性要看能否重画，而非当前画法。</b>"
        },
        {
          name: "重画成无交叉",
          graph: "k4plane", nodes: [3],
          formula: '把顶点 D 移到三角形内部 ⇒ <span class="ft hot-green hot">无交叉的平面嵌入</span>',
          badge: "平面 ✓", tone: "",
          text: "同样 4 点 6 边，重新布局后一条交叉都没有——K₄ 确实是平面图。这幅“摊平”的画法叫<b>平面嵌入</b>。"
        },
        {
          name: "面 F（含无界面）",
          graph: "k4plane", faces: true,
          formula: '边把平面分成若干<span class="ft hot">区域 = 面</span>，含 1 个无界外面',
          badge: "F=4", tone: "blue", viz: "count",
          text: "平面嵌入把平面切成一块块<b>面</b>：内部 3 块（①②③）加外部 1 块无界面（外）——共 <b>4 个面</b>。别忘了外面也算一个！"
        },
        {
          name: "数 V、E、F",
          graph: "k4plane", faces: true,
          formula: 'V = <span class="ft hot">4</span>,  E = <span class="ft hot-blue hot">6</span>,  F = <span class="ft hot-green hot">4</span>',
          badge: "4·6·4", tone: "", viz: "count",
          text: "点数 V=4、边数 E=6、面数 F=4。三个数各自都在变，但它们的一个<b>组合</b>永远不变——这就是下一步的主角。"
        },
        {
          name: "欧拉公式 V−E+F=2",
          graph: "sqdiag", faces: true,
          formula: '<span class="ft hot">V − E + F = 2</span>：K₄ 得 4−6+4=2；正方形+对角线 4−5+3=2',
          badge: "= 2", tone: "", viz: "eulercount",
          text: "换一张图（正方形加对角线，V4 E5 F3）再算：4−5+3=<b>2</b>，还是 2！<b>任何连通平面图，V−E+F 恒等于 2</b>——以简驭繁的不变量。"
        }
      ]
    },

    advanced: {
      label: "进阶层",
      mission: "由欧拉公式推出 E≤3V−6，并用它一眼排除 K₅、K₃,₃ 等非平面图。",
      badge: "E≤3V−6",
      steps: [
        {
          name: "欧拉公式回顾",
          graph: "sqdiag", faces: true,
          formula: '连通平面图：<span class="ft hot">V − E + F = 2</span>',
          badge: "V−E+F=2", tone: "", viz: "eulercount",
          text: "起点仍是欧拉公式。接下来把它和“每个面至少 3 条边围、每条边被 2 个面共享”结合，推出一条只看 V、E 的判据。"
        },
        {
          name: "推论 E≤3V−6",
          graph: "k4plane", faces: true,
          formula: '每面 ≥3 边、每边属 2 面 ⇒ 2E ≥ 3F，代入得 <span class="ft hot">E ≤ 3V−6</span>',
          badge: "3V−6", tone: "blue", viz: "boundcount",
          text: "K₄：3V−6 = 3×4−6 = 6 = E，恰好取等（每个面都是三角形）。<b>这条不等式是平面图的“限速”</b>——边太多就一定画不平。"
        },
        {
          name: "K₅ 违反判据",
          graph: "k5",
          formula: 'K₅：E=<span class="ft hot">10</span> &gt; 3V−6 = <span class="ft hot">9</span> ⇒ 非平面',
          badge: "非平面 ✗", tone: "red", viz: "boundcount",
          text: "完全图 K₅ 有 10 条边，但平面图上限只有 9。<b>10 &gt; 9，直接判死</b>——不用尝试画，判据就否决了它。"
        },
        {
          name: "K₃,₃ 要用更强判据",
          graph: "k33",
          formula: '二部图无三角形 ⇒ 每面 ≥4 边 ⇒ <span class="ft hot">E ≤ 2V−4</span>；K₃,₃：9 &gt; 8',
          badge: "非平面 ✗", tone: "red", viz: "boundcount",
          text: "K₃,₃ 有 9 边，而 3V−6=12 并未违反——因为它是二部图<b>无奇圈、每个面至少 4 边</b>，界收紧为 2V−4=8。9 &gt; 8，仍非平面。"
        },
        {
          name: "Kuratowski 定理",
          graph: "k5",
          formula: '图可平面 ⟺ <span class="ft hot">不含 K₅ 或 K₃,₃ 的细分</span>',
          badge: "本质刻画", tone: "gold",
          text: "K₅ 与 K₃,₃ 是“非平面之源”：<b>一个图非平面，当且仅当它内部藏着 K₅ 或 K₃,₃ 的细分</b>（Kuratowski 1930）。判据是充分的，定理是本质的。"
        },
        {
          name: "极大平面图",
          graph: "k4plane", faces: true,
          formula: '不断加边直到 <span class="ft hot-green hot">E = 3V−6</span> ⇒ 每个面都是三角形',
          badge: "三角剖分", tone: "",
          text: "当边数达到上限 3V−6，图被<b>三角剖分</b>——每个面都是三角形，再加任何边都会破坏平面性。这是平面图“最密”的状态。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "把平面性用到 PCB 布线与地图着色，见识“四色足矣”的四色定理。",
      badge: "PCB / 四色",
      steps: [
        {
          name: "布线要“平面化”",
          graph: "k4cross",
          formula: 'PCB 走线<span class="ft hot">交叉</span> ⇒ 需打过孔/加层 ⇒ 尽量平面化省成本',
          badge: "交叉=成本", tone: "red",
          text: "印刷电路板上两条线交叉，就得靠<b>过孔换层</b>才能不短路。平面图理论指导工程师把线路“摊平”，减少层数与过孔——省钱又可靠。"
        },
        {
          name: "重排消除交叉",
          graph: "k4plane", nodes: [3],
          formula: '可平面的网络 ⇒ <span class="ft hot-green hot">单层即可布线</span>，无需换层',
          badge: "单层 ✓", tone: "",
          text: "只要电路对应的图是平面图，就能在<b>一层</b>内布通。芯片、地铁线路图的设计，都在做这件“把交叉重排掉”的事。"
        },
        {
          name: "四色定理",
          graph: "wheel",
          formula: '任何平面图（地图）都可用 <span class="ft hot">≤ 4 种颜色</span>着色，相邻不同色',
          badge: "四色足矣", tone: "gold",
          text: "地图相邻国家要异色，最少几种颜色够用？答案是<b>4</b>——四色定理。它 1976 年由计算机辅助证明，是数学史上第一个<b>机器证明</b>的著名定理。"
        },
        {
          name: "给地图上色",
          graph: "wheel", color: true,
          formula: '贪心/回溯着色轮图 W₅：<span class="ft hot">恰需 4 色</span>（奇轮）',
          badge: "4 色", tone: "", viz: "colorcount",
          text: "轮图外圈是奇圈 C₅，中心与所有点相邻——外圈至少 3 色、中心再加 1 色，<b>正好 4 色</b>。看图：相邻区域颜色互不相同。"
        },
        {
          name: "对偶图与着色",
          graph: "wheel", color: true,
          formula: '地图着色 = 其<span class="ft hot-blue hot">对偶图的顶点着色</span> = 图着色问题',
          badge: "对偶", tone: "blue",
          text: "把每块区域缩成一个顶点、相邻区域连边，得到<b>对偶图</b>；地图着色就变成对偶图的<b>顶点着色</b>。同一套图着色，还用于编译器的<b>寄存器分配</b>。"
        },
        {
          name: "迁移总结",
          graph: "wheel", color: true,
          formula: '<span class="ft hot">PCB 布线 · 地图着色 · 寄存器分配 · 排考</span>',
          badge: "transfer", tone: "gold", viz: "transferlist",
          text: "平面性省下电路板的层与孔；图着色为地图、寄存器、排课与频率分配求最少冲突方案。<b>以简驭繁、把冲突化为可管理的规则，正是科学方法的魅力。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, euler, facesFromEuler, simplePlanarBoundOK, bipartitePlanarBoundOK, greedyColor, isProperColoring, maxColors };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.PLANAR_LEVEL] || LEVELS.basic;
  const controls = document.getElementById("controls");
  const canvas = document.getElementById("graphCanvas");
  const formulaText = document.getElementById("formulaText");
  const stepStatus = document.getElementById("stepStatus");
  const vizText = document.getElementById("vizText");
  const missionEl = document.getElementById("missionText");
  const badgeEl = document.getElementById("visualBadge");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const CCOL = ["#d63b1d", "#4a90e2", "#2ecc71", "#c58a1f", "#8e5aa2"];
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
  function draw() {
    const size = resize();
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    const R = 17;
    // 居中压缩区域
    const gW = Math.min(size.w * 0.56, size.h * 0.74);
    const ox = (size.w - gW) / 2, oy = size.h * 0.12, gH = size.h * 0.66;
    const P = g.nodes.map(nd => ({ x: ox + nd.x * gW, y: oy + nd.y * gH }));
    const hlNodes = new Set(st.nodes || []);
    const crossSet = g.crossing || [];
    const color = st.color ? greedyColor(g.nodes.length, g.edges) : null;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    g.edges.forEach(e => {
      const isCross = crossSet.some(c => (c[0] === e[0] && c[1] === e[1]) || (c[0] === e[1] && c[1] === e[0]));
      ctx.strokeStyle = isCross ? "#d63b1d" : "rgba(47,95,159,0.6)";
      ctx.lineWidth = isCross ? 3.5 : 2.2;
      const a = P[e[0]], b = P[e[1]];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      ctx.beginPath();
      ctx.moveTo(a.x + Math.cos(ang) * R, a.y + Math.sin(ang) * R);
      ctx.lineTo(b.x - Math.cos(ang) * R, b.y - Math.sin(ang) * R);
      ctx.stroke();
    });

    // 面标注
    if (st.faces && g.faceDots) {
      g.faceDots.forEach(fd => {
        const x = ox + fd.x * gW, y = oy + fd.y * gH;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(47,125,87,0.16)";
        ctx.fill();
        ctx.strokeStyle = "#2f7d57"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = "#2f7d57";
        ctx.font = "800 12px 'Noto Serif SC', 'Microsoft YaHei', serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(fd.t, x, y);
      });
    }

    P.forEach((p, i) => {
      const hot = hlNodes.has(i);
      ctx.beginPath();
      ctx.arc(p.x, p.y, hot ? R + 2 : R, 0, Math.PI * 2);
      ctx.fillStyle = color ? CCOL[color[i] % CCOL.length] : hot ? "#d63b1d" : "#2f7d57";
      ctx.fill();
      ctx.strokeStyle = "#fff8ec"; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "800 12px 'JetBrains Mono', 'Noto Serif SC', monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y);
    });

    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.fillText(g.caption, size.w / 2, size.h - 16);
  }

  /* ---- 辅助可视化 ---- */
  function countHtml(g) {
    return '<div class="graph-summary"><b>计数：</b>' +
      '<div class="pill-row"><span class="pill">V = ' + g.V + '</span><span class="pill">E = ' + g.E + '</span><span class="pill">F = ' + g.F + '</span></div></div>';
  }
  function eulercountHtml(g) {
    return '<div class="graph-summary"><b>欧拉公式验证：</b>V−E+F = ' + g.V + '−' + g.E + '+' + g.F + ' = <b>' + euler(g.V, g.E, g.F) + '</b> ✓（恒为 2）。</div>';
  }
  function boundcountHtml(g) {
    const ok = g.bipartite ? bipartitePlanarBoundOK(g.V, g.E) : simplePlanarBoundOK(g.V, g.E);
    const bound = g.bipartite ? (2 * g.V - 4) : (3 * g.V - 6);
    const label = g.bipartite ? "2V−4" : "3V−6";
    return '<div class="graph-summary"><b>平面判据：</b>E = ' + g.E + '，' + label + ' = ' + bound + ' ⇒ ' +
      (ok ? "E ≤ 上限，<b>未被排除</b>（可能平面）。" : "E &gt; 上限，<b>一定非平面</b> ✗。") + '</div>';
  }
  function colorcountHtml(g) {
    const c = greedyColor(g.nodes.length, g.edges);
    return '<div class="graph-summary"><b>着色结果：</b>用了 <b>' + maxColors(c) + '</b> 种颜色，相邻均不同色 ' + (isProperColoring(g.edges, c) ? "✓" : "✗") + '（四色定理保证 ≤4）。</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">PCB 布线</span><span class="pill">地图着色</span><span class="pill">寄存器分配</span><span class="pill">考场/频率分配</span></div>' +
      '平面性与图着色，把“无冲突布局”变成可计算的规则。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const g = GRAPHS[st.graph];
    let html = "";
    switch (st.viz) {
      case "count": html = countHtml(g); break;
      case "eulercount": html = eulercountHtml(g); break;
      case "boundcount": html = boundcountHtml(g); break;
      case "colorcount": html = colorcountHtml(g); break;
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
