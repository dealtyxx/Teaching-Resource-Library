/* ============================================================
   8.2 哈密顿图 · 基础层/拓展层统一交互引擎（哈密顿回路编号 + TSP 启发式）
   window.HAM_LEVEL = "basic" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   （进阶层 hamiton.html 保留原有交互图，不走本引擎）
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  function hasEdge(edges, u, v) {
    return edges.some(e => (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u));
  }
  function degrees(n, edges) {
    const d = Array(n).fill(0);
    edges.forEach(e => { d[e[0]]++; d[e[1]]++; });
    return d;
  }
  // 哈密顿回路：path 长 n+1，首尾相同，前 n 个是 0..n-1 的排列，相邻有边
  function isHamCycle(n, edges, path) {
    if (path.length !== n + 1) return false;
    if (path[0] !== path[n]) return false;
    const seen = new Set(path.slice(0, n));
    if (seen.size !== n) return false;
    for (let i = 0; i < n; i++) if (!hasEdge(edges, path[i], path[i + 1])) return false;
    return true;
  }
  // 哈密顿通路：path 长 n，是排列，相邻有边
  function isHamPath(n, edges, path) {
    if (path.length !== n) return false;
    if (new Set(path).size !== n) return false;
    for (let i = 0; i + 1 < n; i++) if (!hasEdge(edges, path[i], path[i + 1])) return false;
    return true;
  }
  // 割点：删去后连通分量增加
  function componentsCount(n, edges, removed) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { if (e[0] !== removed && e[1] !== removed) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); } });
    const seen = Array(n).fill(false);
    if (removed != null && removed >= 0) seen[removed] = true;
    let c = 0;
    for (let i = 0; i < n; i++) if (!seen[i]) {
      c++; const q = [i]; seen[i] = true;
      while (q.length) { const u = q.shift(); adj[u].forEach(v => { if (!seen[v]) { seen[v] = true; q.push(v); } }); }
    }
    return c;
  }
  function isCutVertex(n, edges, v) {
    const base = componentsCount(n, edges, -1);
    return componentsCount(n, edges, v) > base;
  }
  // Dirac：最小度 ≥ n/2
  function diracOK(n, edges) {
    const d = degrees(n, edges);
    return Math.min.apply(null, d) >= n / 2;
  }
  // TSP：距离矩阵
  function tourCost(W, tour) {
    let s = 0;
    for (let i = 0; i + 1 < tour.length; i++) s += W[tour[i]][tour[i + 1]];
    return s;
  }
  function nnTour(W, start) {
    const n = W.length;
    const seen = Array(n).fill(false);
    const tour = [start];
    seen[start] = true;
    for (let k = 1; k < n; k++) {
      const u = tour[tour.length - 1];
      let best = -1, bd = Infinity;
      for (let v = 0; v < n; v++) if (!seen[v] && W[u][v] < bd) { bd = W[u][v]; best = v; }
      tour.push(best); seen[best] = true;
    }
    tour.push(start);
    return tour;
  }
  // 2-opt：反复改进直到无提升
  function twoOpt(W, tour0) {
    let tour = tour0.slice();
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 1; i < tour.length - 2; i++) {
        for (let j = i + 1; j < tour.length - 1; j++) {
          const a = tour[i - 1], b = tour[i], c = tour[j], d = tour[j + 1];
          if (W[a][b] + W[c][d] > W[a][c] + W[b][d]) {
            const mid = tour.slice(i, j + 1).reverse();
            tour = tour.slice(0, i).concat(mid, tour.slice(j + 1));
            improved = true;
          }
        }
      }
    }
    return tour;
  }

  /* ---------------- 图库 ---------------- */
  const AZ = "ABCDEFGH".split("");
  const GRAPHS = {
    // 五边形+两弦：有哈密顿回路
    penta: {
      names: AZ.slice(0, 5), caption: "5 城网络（存在哈密顿回路）",
      nodes: [0, 1, 2, 3, 4].map(i => {
        const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
        return { x: 0.5 + 0.4 * Math.cos(a), y: 0.5 + 0.4 * Math.sin(a) };
      }),
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [1, 3]]
    },
    // 蝴蝶结（两三角共享顶点 C）：有哈密顿通路，无哈密顿回路
    bowtie: {
      names: AZ.slice(0, 5), caption: "蝴蝶结图（C 为割点）",
      nodes: [
        { x: 0.12, y: 0.18 }, { x: 0.12, y: 0.82 }, { x: 0.5, y: 0.5 },
        { x: 0.88, y: 0.18 }, { x: 0.88, y: 0.82 }
      ],
      edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2]]
    },
    // TSP：5 城完全图 + 距离矩阵（最近邻会踩坑，2-opt 可改进）
    tsp: {
      names: AZ.slice(0, 5), caption: "旅行商问题（完全图，边上为距离）", complete: true,
      nodes: [
        { x: 0.1, y: 0.5 }, { x: 0.4, y: 0.12 }, { x: 0.86, y: 0.3 },
        { x: 0.8, y: 0.86 }, { x: 0.34, y: 0.82 }
      ],
      W: [
        [0, 2, 9, 10, 1],
        [2, 0, 6, 4, 3],
        [9, 6, 0, 8, 5],
        [10, 4, 8, 0, 7],
        [1, 3, 5, 7, 0]
      ]
    }
  };

  /* ---------------- 三层步骤数据 ---------------- */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "看清哈密顿回路“走遍每个顶点恰一次”，并感受它为什么没有简单判据。",
      badge: "遍历每个顶点",
      steps: [
        {
          name: "什么是哈密顿回路",
          graph: "penta", nodes: [0, 1, 2, 3, 4],
          formula: '哈密顿回路 = <span class="ft hot">经过每个顶点恰一次</span>、再回到起点',
          badge: "定义", tone: "",
          text: "旅行要不重复地游遍 5 座城再回到出发地，存在这样的环线吗？这种“走遍每个<b>顶点</b>”的回路就叫<b>哈密顿回路</b>。"
        },
        {
          name: "欧拉 vs 哈密顿",
          graph: "penta",
          formula: '欧拉：走遍每条<span class="ft hot-blue hot">边</span>　｜　哈密顿：走遍每个<span class="ft hot">顶点</span>',
          badge: "一字之差", tone: "gold",
          text: "上一节欧拉是“边”，本节哈密顿是“点”。一字之差，难度天壤：欧拉有<b>度数奇偶</b>的简洁判据，哈密顿<b>至今没有简单充要条件</b>。"
        },
        {
          name: "找一条哈密顿回路",
          graph: "penta", trail: [0, 1, 2, 3, 4, 0],
          formula: '<span class="ft hot">A→B→C→D→E→A</span>：5 个顶点各一次，成环',
          badge: "回路 ✓", tone: "", viz: "hamcheck",
          text: "跟着金色编号走外圈：每个城市恰去一次，最后回到 A。这条环就是一条哈密顿回路——注意它<b>不必用上所有边</b>（两条弦没走）。"
        },
        {
          name: "哈密顿通路",
          graph: "bowtie", trail: [0, 1, 2, 3, 4],
          formula: '<span class="ft hot">A→B→C→D→E</span>：遍历每个顶点但<b>不回起点</b> = 哈密顿通路',
          badge: "通路 ✓", tone: "blue", viz: "hampathcheck",
          text: "蝴蝶结图能一次穿过全部 5 个顶点（A→B→C→D→E），但走到 E 就回不了 A——这是哈密顿<b>通路</b>而非回路。"
        },
        {
          name: "没有哈密顿回路的图",
          graph: "bowtie", cut: [2], nodes: [2],
          formula: '割点 C 使得回路<span class="ft hot">必须两次经过 C</span> ⇒ 无哈密顿回路',
          badge: "无回路", tone: "red", viz: "cutcheck",
          text: "C 是<b>割点</b>（红圈）：删掉它图裂成两半。任何回路想在左右两个三角之间往返，都得<b>两次穿过 C</b>，违反“每点恰一次”——所以哈密顿回路不存在。"
        },
        {
          name: "为什么这么难",
          graph: "penta",
          formula: '哈密顿判定是 <span class="ft hot">NP 完全</span>问题：无已知多项式算法',
          badge: "NP 完全", tone: "red",
          text: "判断一张图有没有哈密顿回路，目前只能近乎<b>穷举</b>。相似的两个问题——欧拉与哈密顿——难度悬殊，正说明“看起来像”未必“一样难”。硬骨头，要迎难而上。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "面对 NP 难的旅行商问题，用最近邻、2-opt 等启发式求“够好”的解。",
      badge: "TSP / 启发式",
      steps: [
        {
          name: "旅行商问题 TSP",
          graph: "tsp", nodes: [0, 1, 2, 3, 4],
          formula: '带权哈密顿回路中<span class="ft hot">总里程最短</span>的那条 = TSP 最优解',
          badge: "TSP", tone: "",
          text: "给哈密顿回路加上<b>距离权重</b>，要找“最短的那条环线”，就是著名的<b>旅行商问题(TSP)</b>——物流、钻孔、排产的共同内核。"
        },
        {
          name: "暴力枚举会爆炸",
          graph: "tsp",
          formula: 'n 城的不同回路数 = <span class="ft hot">(n−1)!/2</span>：n=15 已超 400 亿',
          badge: "(n-1)!/2", tone: "red",
          text: "枚举所有回路取最短——理论可行，实际不行：城市数一多，方案数<b>阶乘级爆炸</b>。TSP 是 NP 难，必须换思路：用启发式换“够好且够快”。"
        },
        {
          name: "最近邻启发式",
          graph: "tsp", tour: "nn",
          formula: '每步<span class="ft hot">贪心去最近的没去过的城</span> ⇒ 快速得到一条初始回路',
          badge: "贪心", tone: "gold", viz: "nntour",
          text: "从 A 出发，每次跳到<b>最近的未访问城市</b>（金色编号即贪心顺序）。简单快速，但贪心常在最后被迫走一条“大回头路”——得到的不一定是最短。"
        },
        {
          name: "2-opt 局部改进",
          graph: "tsp", tour: "opt",
          formula: '发现路线交叉就<span class="ft hot-green hot">反转一段、解开交叉</span> ⇒ 总长下降',
          badge: "2-opt", tone: "", viz: "opttour",
          text: "检查每两条边：若交换后更短就反转中间一段（“解交叉”）。反复做到无法再改进——<b>2-opt</b> 把最近邻的解显著缩短（右卡对比里程）。"
        },
        {
          name: "近似 vs 最优",
          graph: "tsp", tour: "opt",
          formula: '启发式解 / 最优解 = <span class="ft hot">近似比</span>；工程上“够好”即可交付',
          badge: "gap", tone: "blue", viz: "gaptour",
          text: "我们通常拿不到（也不需要）绝对最优：2-opt、Lin-Kernighan、遗传/蚁群算法给出<b>接近最优</b>的解，且有可控的时间。<b>承认难，但用算法智慧持续逼近。</b>"
        },
        {
          name: "迁移总结",
          graph: "tsp", tour: "opt",
          formula: '<span class="ft hot">物流配送 · 电路钻孔 · 基因排序</span>——皆为 TSP',
          badge: "transfer", tone: "gold", viz: "transferlist",
          text: "快递车路径、PCB 钻孔顺序、DNA 物理图谱排序都建模成 TSP。哈密顿/TSP 是“难而有用”的典范：<b>明知山有虎，偏用智慧向虎山行。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, hasEdge, degrees, isHamCycle, isHamPath, isCutVertex, componentsCount, diracOK, tourCost, nnTour, twoOpt };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.HAM_LEVEL] || LEVELS.basic;
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
  function tourFor(st, g) {
    if (!st.tour) return null;
    if (st.tour === "nn") return nnTour(g.W, 0);
    if (st.tour === "opt") return twoOpt(g.W, nnTour(g.W, 0));
    return st.tour;
  }
  function seqSteps(seq) {
    if (!seq) return [];
    const out = [];
    for (let i = 0; i + 1 < seq.length; i++) out.push({ u: seq[i], v: seq[i + 1], idx: i + 1 });
    return out;
  }
  function draw() {
    const size = resize();
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    const R = 19;
    const padX = 54, padTop = 34, padBot = 52;
    const P = g.nodes.map(nd => ({
      x: padX + nd.x * (size.w - 2 * padX),
      y: padTop + nd.y * (size.h - padTop - padBot)
    }));
    const tour = tourFor(st, g);
    const seq = st.trail || tour;
    const ss = seqSteps(seq);
    const hlNodes = new Set(st.nodes || []);
    const cutSet = new Set(st.cut || []);
    const anyHl = hlNodes.size > 0 || ss.length > 0;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    // 边：完全图(TSP)画全部淡边；普通图画 edges
    const baseEdges = g.complete
      ? (function () { const es = []; for (let i = 0; i < g.nodes.length; i++) for (let j = i + 1; j < g.nodes.length; j++) es.push([i, j]); return es; })()
      : g.edges;
    baseEdges.forEach(e => {
      const onSeq = ss.some(p => (p.u === e[0] && p.v === e[1]) || (p.u === e[1] && p.v === e[0]));
      const dim = anyHl && !onSeq;
      ctx.strokeStyle = onSeq ? "#d63b1d" : dim ? "rgba(47,95,159,0.14)" : "rgba(47,95,159,0.5)";
      ctx.lineWidth = onSeq ? 4 : g.complete ? 1.2 : 2.2;
      const a = P[e[0]], b = P[e[1]];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      ctx.beginPath();
      ctx.moveTo(a.x + Math.cos(ang) * R, a.y + Math.sin(ang) * R);
      ctx.lineTo(b.x - Math.cos(ang) * R, b.y - Math.sin(ang) * R);
      ctx.stroke();
      // TSP 距离标签（仅当前路线边）
      if (g.W && onSeq) {
        const mx = (a.x + b.x) / 2 - Math.sin(ang) * 12, my = (a.y + b.y) / 2 + Math.cos(ang) * 12;
        ctx.fillStyle = "#d63b1d";
        ctx.font = "800 13px 'JetBrains Mono', Consolas, monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(g.W[e[0]][e[1]]), mx, my);
      }
    });

    // 编号
    ss.forEach(p => {
      const a = P[p.u], b = P[p.v];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.beginPath();
      ctx.arc(mx, my, 11, 0, Math.PI * 2);
      ctx.fillStyle = "#c58a1f"; ctx.fill();
      ctx.strokeStyle = "#fff8ec"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "800 11px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(p.idx), mx, my);
    });

    P.forEach((p, i) => {
      const inSeq = seq && seq.indexOf(i) >= 0;
      const hot = hlNodes.has(i);
      const isCut = cutSet.has(i);
      const dim = anyHl && !hot && !inSeq && !isCut;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
      ctx.fillStyle = hot || isCut ? "#d63b1d" : inSeq ? "#2f7d57" : dim ? "#cdbfae" : "#2f7d57";
      ctx.fill();
      if (isCut) {
        ctx.strokeStyle = "#d63b1d"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(p.x, p.y, R + 4, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.strokeStyle = "#fff8ec"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "800 13px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(g.names[i], p.x, p.y);
    });

    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.fillText(g.caption, size.w / 2, size.h - 18);
  }

  /* ---- 辅助可视化 ---- */
  function hamcheckHtml(g) {
    return '<div class="graph-summary"><b>哈密顿回路验证：</b>A→B→C→D→E→A 覆盖全部 ' + g.nodes.length + ' 个顶点各一次并成环 ✓。注意哈密顿回路只用 ' + g.nodes.length + ' 条边，未必用满全图。</div>';
  }
  function hampathcheckHtml() {
    return '<div class="graph-summary"><b>哈密顿通路：</b>A→B→C→D→E 遍历每个顶点一次，但 E 与 A 无直接边，无法闭合 ⇒ 有通路、无回路。</div>';
  }
  function cutcheckHtml(g) {
    const before = componentsCount(g.nodes.length, g.edges, -1);
    const after = componentsCount(g.nodes.length, g.edges, 2);
    return '<div class="graph-summary"><b>割点判定：</b>删去 C 前连通分量 = ' + before + '，删去后 = <b>' + after + '</b>。含割点的图一定<b>没有</b>哈密顿回路。</div>';
  }
  function nntourHtml(g) {
    const t = nnTour(g.W, 0);
    return '<div class="graph-summary"><b>最近邻回路：</b>' + t.map(i => g.names[i]).join(" → ") + '，总里程 = <b>' + tourCost(g.W, t) + '</b>。' +
      '<div class="pill-row"><span class="pill" style="background:rgba(197,138,31,0.14)">贪心快，但可能绕远</span></div></div>';
  }
  function opttourHtml(g) {
    const nn = nnTour(g.W, 0);
    const opt = twoOpt(g.W, nn);
    return '<div class="graph-summary"><b>2-opt 改进：</b>' + opt.map(i => g.names[i]).join(" → ") + '，总里程 <b>' + tourCost(g.W, nn) + ' → ' + tourCost(g.W, opt) + '</b>。' +
      '<div class="pill-row"><span class="pill">解开交叉后更短</span></div></div>';
  }
  function gaptourHtml(g) {
    const nn = nnTour(g.W, 0), opt = twoOpt(g.W, nn);
    const cNN = tourCost(g.W, nn), cOpt = tourCost(g.W, opt);
    return '<div class="graph-summary"><b>近似效果：</b>最近邻 ' + cNN + ' → 2-opt ' + cOpt + '，改进 ' +
      (cNN ? Math.round((cNN - cOpt) / cNN * 100) : 0) + '%。工程上取“够好”的解，兼顾质量与时间。</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">快递路径规划</span><span class="pill">PCB 钻孔顺序</span><span class="pill">DNA 物理图谱</span></div>' +
      'NP 难不等于束手无策——启发式让“难题”落地为“可用方案”。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const g = GRAPHS[st.graph];
    let html = "";
    switch (st.viz) {
      case "hamcheck": html = hamcheckHtml(g); break;
      case "hampathcheck": html = hampathcheckHtml(); break;
      case "cutcheck": html = cutcheckHtml(g); break;
      case "nntour": html = nntourHtml(g); break;
      case "opttour": html = opttourHtml(g); break;
      case "gaptour": html = gaptourHtml(g); break;
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
