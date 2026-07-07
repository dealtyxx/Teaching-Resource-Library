/* ============================================================
   8.3 二部图 · 基础层/拓展层统一交互引擎（两列布局 + 匹配着色）
   window.BIP_LEVEL = "basic" | "extend"
   交互：下一步 / 上一步 / 自动播放 / 重置 —— 点一步、看反馈、看公式项高亮、看图高亮
   配色与进阶层一致：左=红 右=蓝 匹配=绿 增广=金 冲突=红
   （进阶层 partgraph-index.html 保留原有交互图，不走本引擎）
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 纯逻辑（可被 Node 测试） ---------------- */
  // 一般图 2-染色判定二部性
  function isBipartite(n, edges) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
    const color = Array(n).fill(-1);
    for (let s = 0; s < n; s++) {
      if (color[s] !== -1) continue;
      color[s] = 0;
      const q = [s];
      while (q.length) {
        const u = q.shift();
        for (const v of adj[u]) {
          if (color[v] === -1) { color[v] = color[u] ^ 1; q.push(v); }
          else if (color[v] === color[u]) return { ok: false, color, conflict: [u, v] };
        }
      }
    }
    return { ok: true, color, conflict: null };
  }
  // 二部图最大匹配（Kuhn 增广路），edges=[li,ri]
  function maxMatching(nL, nR, edges) {
    const adj = Array.from({ length: nL }, () => []);
    edges.forEach(e => adj[e[0]].push(e[1]));
    const matchR = Array(nR).fill(-1);
    function tryK(u, seen) {
      for (const v of adj[u]) {
        if (seen[v]) continue;
        seen[v] = true;
        if (matchR[v] === -1 || tryK(matchR[v], seen)) { matchR[v] = u; return true; }
      }
      return false;
    }
    let size = 0;
    for (let u = 0; u < nL; u++) { if (tryK(u, Array(nR).fill(false))) size++; }
    const pairs = [];
    matchR.forEach((u, v) => { if (u !== -1) pairs.push([u, v]); });
    return { size, pairs };
  }
  // 指派问题：小规模暴力求最大权完美匹配（nL===nR）
  function bestAssignment(W) {
    const n = W.length;
    const perm = Array.from({ length: n }, (_, i) => i);
    let best = -Infinity, bestP = null;
    function go(k, used, sum) {
      if (k === n) { if (sum > best) { best = sum; bestP = used.slice(); } return; }
      for (let j = 0; j < n; j++) if (used.indexOf(j) < 0) { used.push(j); go(k + 1, used, sum + W[k][j]); used.pop(); }
    }
    go(0, [], 0);
    return { weight: best, assign: bestP }; // assign[i]=job for worker i
  }
  // Gale-Shapley 稳定匹配（男士求婚），返回 man->woman
  function galeShapley(menPref, womenPref) {
    const n = menPref.length;
    const wRank = womenPref.map(pref => { const r = Array(n).fill(0); pref.forEach((m, i) => r[m] = i); return r; });
    const next = Array(n).fill(0);
    const wPartner = Array(n).fill(-1);
    const free = [];
    for (let m = 0; m < n; m++) free.push(m);
    while (free.length) {
      const m = free.shift();
      const w = menPref[m][next[m]++];
      if (wPartner[w] === -1) wPartner[w] = m;
      else {
        const cur = wPartner[w];
        if (wRank[w][m] < wRank[w][cur]) { wPartner[w] = m; free.push(cur); }
        else free.push(m);
      }
    }
    const manPartner = Array(n).fill(-1);
    wPartner.forEach((m, w) => { if (m !== -1) manPartner[m] = w; });
    return manPartner;
  }
  // 稳定性：是否存在阻塞对
  function isStable(manPartner, menPref, womenPref) {
    const n = menPref.length;
    const womanOf = manPartner;
    const manOf = Array(n).fill(-1);
    womanOf.forEach((w, m) => { if (w >= 0) manOf[w] = m; });
    const wRank = womenPref.map(pref => { const r = Array(n).fill(0); pref.forEach((m, i) => r[m] = i); return r; });
    const mRank = menPref.map(pref => { const r = Array(n).fill(0); pref.forEach((w, i) => r[w] = i); return r; });
    for (let m = 0; m < n; m++) for (let w = 0; w < n; w++) {
      if (womanOf[m] === w) continue;
      const mPrefsW = mRank[m][w] < mRank[m][womanOf[m]];
      const wPrefsM = wRank[w][m] < wRank[w][manOf[w]];
      if (mPrefsW && wPrefsM) return { stable: false, blocking: [m, w] };
    }
    return { stable: true, blocking: null };
  }

  /* ---------------- 图库 ----------------
     kind:"bip" → {Lnames,Rnames,edges:[[li,ri]]}
     kind:"gen" → {names,nodes:[{x,y}],edges:[[u,v]]}  用于奇圈/二染色判定 */
  function ringNodes(n, r, cx, cy) {
    return Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
  }
  const GRAPHS = {
    bipDemo: {
      kind: "bip", caption: "二部图：干部 ↔ 任务",
      Lnames: ["甲", "乙", "丙", "丁"], Rnames: ["T₁", "T₂", "T₃", "T₄"],
      edges: [[0, 0], [0, 1], [1, 0], [1, 2], [2, 2], [2, 3], [3, 3]]
    },
    c4: {
      kind: "gen", caption: "四元环 C₄（偶圈 → 二部图）",
      names: ["A", "B", "C", "D"],
      nodes: [{ x: 0.25, y: 0.2 }, { x: 0.75, y: 0.2 }, { x: 0.75, y: 0.8 }, { x: 0.25, y: 0.8 }],
      edges: [[0, 1], [1, 2], [2, 3], [3, 0]]
    },
    c5: {
      kind: "gen", caption: "五元环 C₅（奇圈 → 非二部图）",
      names: ["A", "B", "C", "D", "E"],
      nodes: ringNodes(5, 0.38, 0.5, 0.52),
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]
    },
    assign: {
      kind: "bip", caption: "指派问题：技能 ↔ 任务（边上为效益分）", weighted: true,
      Lnames: ["译员", "设计", "编程"], Rnames: ["宣讲", "海报", "系统"],
      // 完全二部，权重矩阵 W[worker][job]
      W: [[8, 4, 2], [3, 9, 5], [4, 6, 9]]
    },
    stable: {
      kind: "bip", caption: "稳定匹配：男士 ↔ 女士（含偏好）", stable: true,
      Lnames: ["甲", "乙", "丙"], Rnames: ["A", "B", "C"],
      // 偏好：越靠前越喜欢（下标为对方序号）
      menPref: [[0, 1, 2], [1, 0, 2], [0, 1, 2]],
      womenPref: [[1, 0, 2], [0, 1, 2], [0, 1, 2]]
    }
  };

  /* ---------------- 三层步骤数据 ---------------- */
  const LEVELS = {
    basic: {
      label: "基础层",
      mission: "认识二部图：顶点能两分、边只跨侧；等价判据是『无奇圈』。",
      badge: "两分 / 无奇圈",
      steps: [
        {
          name: "二部图的定义",
          graph: "bipDemo",
          formula: 'V = X ∪ Y，每条边<span class="ft hot">一端在 X、一端在 Y</span>（同侧无边）',
          badge: "定义", tone: "",
          text: "把两类对象放成左右两列：左边是干部 X、右边是任务 Y。<b>边只在两列之间连</b>，同一列内部没有边——这就是二部图。"
        },
        {
          name: "相邻必异色（二染色）",
          graph: "bipDemo", color: true,
          formula: '给两侧<span class="ft hot">染两种颜色</span>：每条边两端颜色必不同',
          badge: "2-染色", tone: "gold", viz: "colorcheck",
          text: "左列染红、右列染蓝。二部图的本质：<b>能用两种颜色染顶点，使每条边两端异色</b>。这为“是不是二部图”提供了可操作的判法。"
        },
        {
          name: "偶圈 → 是二部图",
          graph: "c4", color: true,
          formula: 'C₄ 可交替染色 A红-B蓝-C红-D蓝 ⇒ <span class="ft hot-green hot">二部图</span>',
          badge: "偶圈 ✓", tone: "", viz: "colorcheck",
          text: "四元环沿着圈红蓝交替染，绕一圈正好回到异色——<b>偶数长度的圈总能两染色</b>，所以是二部图。"
        },
        {
          name: "奇圈 → 非二部图",
          graph: "c5", color: true, showConflict: true,
          formula: 'C₅ 交替染色到最后<span class="ft hot">首尾同色冲突</span> ⇒ 非二部图',
          badge: "奇圈 ✗", tone: "red", viz: "colorcheck",
          text: "五元环交替染色，绕一圈后起点与终点<b>被迫同色</b>（红色冲突边）。<b>含奇圈 ⟺ 不是二部图</b>——这是二部图的充要判据。"
        },
        {
          name: "BFS 判定算法",
          graph: "c5", color: true, showConflict: true,
          formula: 'BFS 逐层交替上色，<span class="ft hot">发现同色边即非二部</span>，O(V+E)',
          badge: "算法", tone: "blue",
          text: "工程判定：从任一点开始 BFS，逐层交替上色；一旦遇到“两端同色”的边就判定非二部图。一次遍历即可，线性时间。"
        },
        {
          name: "引子：配对与匹配",
          graph: "bipDemo", matchEdges: [[0, 1], [1, 2], [2, 3]],
          formula: '匹配 = 一组<span class="ft hot-green hot">两两不共顶点</span>的边（人岗一一对应）',
          badge: "匹配", tone: "",
          text: "二部图最大的用处是<b>配对</b>：绿色三条边互不共用顶点，就是一个匹配。让尽可能多的干部有任务、任务有人做——下一层的“最大匹配”登场。"
        }
      ]
    },

    extend: {
      label: "拓展层",
      mission: "从最大匹配走向最优指派（KM）与稳定匹配（Gale-Shapley）。",
      badge: "指派 / 稳定",
      steps: [
        {
          name: "带权匹配：指派问题",
          graph: "assign", weightShow: true,
          formula: '每个配对有<span class="ft hot">效益分</span>，求总分最大的完美匹配 = 指派问题',
          badge: "指派", tone: "",
          text: "现实里配对有优劣：让译员做宣讲(8分)比做系统(2分)更值。给每条边标上<b>效益分</b>，目标从“配得上”升级为<b>“配得最好”</b>。"
        },
        {
          name: "KM 求最大权匹配",
          graph: "assign", weightShow: true, assignBest: true,
          formula: '匈牙利/KM 算法：<span class="ft hot-green hot">总效益最大</span>的一一对应',
          badge: "最优", tone: "", viz: "assigncheck",
          text: "KM（Kuhn-Munkres）算法在多项式时间求出<b>总分最高</b>的指派：译员→宣讲、设计→海报、编程→系统（右卡给出最优分）。人尽其才、物尽其用。"
        },
        {
          name: "稳定匹配问题",
          graph: "stable",
          formula: '双方都有<span class="ft hot">偏好列表</span>，要求匹配后<b>没人想“毁约”</b>',
          badge: "偏好", tone: "gold",
          text: "更难的一类：男女双方各有<b>偏好排序</b>。若存在一对彼此更中意却没配到一起的人，他们会“私奔”——这叫<b>阻塞对</b>。目标是找到<b>没有阻塞对</b>的稳定匹配。"
        },
        {
          name: "Gale-Shapley 求婚-拒绝",
          graph: "stable", matchEdges: "gs",
          formula: '男士按偏好<span class="ft hot">依次求婚</span>，女士留最优、拒其余，直至稳定',
          badge: "GS 算法", tone: "", viz: "gscheck",
          text: "每轮：未婚男士向<b>最心仪且未拒绝</b>的女士求婚；女士暂留当前最优、拒绝其他。绿色即最终匹配。算法必终止、结果必稳定（Gale-Shapley 1962）。"
        },
        {
          name: "稳定性验证",
          graph: "stable", matchEdges: "gs",
          formula: '检查所有配外的男女对：<span class="ft hot-green hot">不存在双方都更满意的阻塞对</span>',
          badge: "稳定 ✓", tone: "", viz: "stablecheck",
          text: "逐对核验：任何没配到一起的男女，至少有一方对现状更满意 ⇒ 没人有动机毁约，匹配<b>稳定</b>。公平的规则，换来稳固的秩序。"
        },
        {
          name: "迁移总结",
          graph: "stable", matchEdges: "gs",
          formula: '<span class="ft hot">高考录取 · 住院医师匹配 · 婚恋平台</span>',
          badge: "transfer", tone: "gold", viz: "transferlist",
          text: "Gale-Shapley 支撑美国住院医师匹配(NRMP)、我国高考平行志愿投档、婚恋/租房撮合；KM 指派用于任务调度与资源分配。<b>让合适的人与需求精准对接，就是公平的算法表达。</b>"
        }
      ]
    }
  };

  /* 供 Node 测试 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GRAPHS, LEVELS, isBipartite, maxMatching, bestAssignment, galeShapley, isStable };
  }
  if (typeof document === "undefined") return;

  /* ---------------- DOM 层 ---------------- */
  const level = LEVELS[window.BIP_LEVEL] || LEVELS.basic;
  const controls = document.getElementById("controls");
  const canvas = document.getElementById("graphCanvas");
  const formulaText = document.getElementById("formulaText");
  const stepStatus = document.getElementById("stepStatus");
  const vizText = document.getElementById("vizText");
  const missionEl = document.getElementById("missionText");
  const badgeEl = document.getElementById("visualBadge");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const COL = { left: "#d63b1d", right: "#4a90e2", matched: "#2ecc71", gold: "#ffb400", faint: "rgba(139,0,0,0.15)", node: "#fff8f0" };
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
  // 计算 bip 图边集 + 节点坐标（左右两列）
  function bipEdges(g) {
    if (g.edges) return g.edges;
    if (g.W) { const es = []; g.W.forEach((row, i) => row.forEach((_, j) => es.push([i, j]))); return es; }
    return [];
  }
  function resolveMatch(st, g) {
    if (!st.matchEdges) return null;
    if (st.matchEdges === "gs") {
      const mp = galeShapley(g.menPref, g.womenPref);
      return mp.map((w, m) => [m, w]).filter(p => p[1] >= 0);
    }
    return st.matchEdges;
  }
  function draw() {
    const size = resize();
    const st = level.steps[step];
    const g = GRAPHS[st.graph];
    const R = 17;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.lineCap = "round";

    if (g.kind === "bip") {
      const L = g.Lnames, Rn = g.Rnames;
      const lx = size.w * 0.32, rx = size.w * 0.68;
      const top = size.h * 0.18, bot = size.h * 0.82;
      const LP = L.map((_, i) => ({ x: lx, y: top + (bot - top) * (L.length === 1 ? 0.5 : i / (L.length - 1)) }));
      const RP = Rn.map((_, i) => ({ x: rx, y: top + (bot - top) * (Rn.length === 1 ? 0.5 : i / (Rn.length - 1)) }));
      const edges = bipEdges(g);
      const match = resolveMatch(st, g);
      if (st.assignBest) { const a = bestAssignment(g.W); var bestPairs = a.assign.map((j, i) => [i, j]); }
      const matchSet = new Set((match || (typeof bestPairs !== "undefined" ? bestPairs : [])).map(p => p[0] + "-" + p[1]));
      const hlSet = new Set((st.edges || []).map(p => p[0] + "-" + p[1]));

      edges.forEach(e => {
        const key = e[0] + "-" + e[1];
        const matched = matchSet.has(key);
        const hot = hlSet.has(key);
        const anyM = matchSet.size > 0 || hlSet.size > 0;
        ctx.strokeStyle = matched ? COL.matched : hot ? COL.gold : anyM ? COL.faint : "rgba(139,0,0,0.35)";
        ctx.lineWidth = matched || hot ? 4 : 2;
        const a = LP[e[0]], b = RP[e[1]];
        ctx.beginPath();
        ctx.moveTo(a.x + R, a.y);
        ctx.lineTo(b.x - R, b.y);
        ctx.stroke();
        if (g.weighted && st.weightShow) {
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 6;
          ctx.fillStyle = matched ? COL.matched : "#b8321a";
          ctx.font = "800 12px 'JetBrains Mono', Consolas, monospace";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(String(g.W[e[0]][e[1]]), mx, my);
        }
      });

      const matchedNodesL = new Set((match || (typeof bestPairs !== "undefined" ? bestPairs : [])).map(p => p[0]));
      const matchedNodesR = new Set((match || (typeof bestPairs !== "undefined" ? bestPairs : [])).map(p => p[1]));
      function node(p, label, side, matched) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
        ctx.fillStyle = matched ? COL.matched : COL.node;
        ctx.fill();
        ctx.strokeStyle = matched ? COL.matched : (side === "L" ? COL.left : COL.right);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = matched ? "#fff" : (side === "L" ? COL.left : COL.right);
        ctx.font = "800 13px 'Noto Serif SC', 'JetBrains Mono', serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(label, p.x, p.y);
      }
      LP.forEach((p, i) => node(p, L[i], "L", matchedNodesL.has(i)));
      RP.forEach((p, i) => node(p, Rn[i], "R", matchedNodesR.has(i)));
      // 列标题
      ctx.fillStyle = COL.left; ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif"; ctx.textAlign = "center";
      ctx.fillText("X 侧", lx, 24);
      ctx.fillStyle = COL.right; ctx.fillText("Y 侧", rx, 24);
    } else {
      // 一般图（奇圈/偶圈染色）—— 居中压缩到较小区域
      const gW = Math.min(size.w * 0.5, size.h * 0.62);
      const ox = (size.w - gW) / 2, oy = size.h * 0.12, gH = size.h * 0.66;
      const P = g.nodes.map(nd => ({ x: ox + nd.x * gW, y: oy + nd.y * gH }));
      const bp = isBipartite(g.nodes.length, g.edges);
      const conflict = st.showConflict && bp.conflict ? bp.conflict : null;
      g.edges.forEach(e => {
        const isConf = conflict && ((e[0] === conflict[0] && e[1] === conflict[1]) || (e[0] === conflict[1] && e[1] === conflict[0]));
        ctx.strokeStyle = isConf ? "#d63b1d" : "rgba(47,95,159,0.6)";
        ctx.lineWidth = isConf ? 5 : 2.4;
        const a = P[e[0]], b = P[e[1]];
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        ctx.beginPath();
        ctx.moveTo(a.x + Math.cos(ang) * R, a.y + Math.sin(ang) * R);
        ctx.lineTo(b.x - Math.cos(ang) * R, b.y - Math.sin(ang) * R);
        ctx.stroke();
      });
      P.forEach((p, i) => {
        const c = st.color ? bp.color[i] : -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
        ctx.fillStyle = c === 0 ? COL.left : c === 1 ? COL.right : "#2f7d57";
        ctx.fill();
        ctx.strokeStyle = "#fff8ec"; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.font = "800 13px 'JetBrains Mono', Consolas, monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(g.names[i], p.x, p.y);
      });
    }

    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.fillText(g.caption, size.w / 2, size.h - 18);
  }

  /* ---- 辅助可视化 ---- */
  function colorcheckHtml(g) {
    const bp = isBipartite(g.nodes ? g.nodes.length : 0, g.edges || []);
    if (!g.edges) return '<div class="graph-summary"><b>二染色：</b>左右两列天然可两染色，是二部图。</div>';
    return '<div class="graph-summary"><b>二染色判定：</b>' + (bp.ok ? "成功两染色、无同色边 ⇒ <b>是二部图</b>。" : "染色出现同色边（" + g.names[bp.conflict[0]] + "–" + g.names[bp.conflict[1]] + "）⇒ <b>非二部图</b>（含奇圈）。") + '</div>';
  }
  function assigncheckHtml(g) {
    const a = bestAssignment(g.W);
    const rows = a.assign.map((j, i) => '<span class="pill">' + g.Lnames[i] + '→' + g.Rnames[j] + '（' + g.W[i][j] + '）</span>').join("");
    return '<div class="graph-summary"><b>最优指派：</b><div class="pill-row">' + rows + '</div>总效益 = <b>' + a.weight + '</b>（已是最大）。</div>';
  }
  function gscheckHtml(g) {
    const mp = galeShapley(g.menPref, g.womenPref);
    const rows = mp.map((w, m) => '<span class="pill">' + g.Lnames[m] + '↔' + g.Rnames[w] + '</span>').join("");
    return '<div class="graph-summary"><b>Gale-Shapley 结果：</b><div class="pill-row">' + rows + '</div></div>';
  }
  function stablecheckHtml(g) {
    const mp = galeShapley(g.menPref, g.womenPref);
    const s = isStable(mp, g.menPref, g.womenPref);
    return '<div class="graph-summary"><b>稳定性：</b>' + (s.stable ? "不存在阻塞对 ⇒ <b>稳定匹配</b> ✓。" : "存在阻塞对 " + g.Lnames[s.blocking[0]] + "–" + g.Rnames[s.blocking[1]] + "。") + '</div>';
  }
  function transferHtml() {
    return '<div class="graph-summary"><b>迁移对照：</b>' +
      '<div class="pill-row"><span class="pill">高考平行志愿</span><span class="pill">住院医师匹配</span><span class="pill">婚恋/租房撮合</span></div>' +
      '稳定匹配与最优指派，把“公平配置”写成了可执行的算法。</div>';
  }
  function renderViz(st) {
    if (!vizText) return;
    const g = GRAPHS[st.graph];
    let html = "";
    switch (st.viz) {
      case "colorcheck": html = colorcheckHtml(g); break;
      case "assigncheck": html = assigncheckHtml(g); break;
      case "gscheck": html = gscheckHtml(g); break;
      case "stablecheck": html = stablecheckHtml(g); break;
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
