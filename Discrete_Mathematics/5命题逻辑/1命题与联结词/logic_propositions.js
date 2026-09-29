/* =====================================================================
   命题公式可视化内核（本单元三页共用）
   - 公式 AST：构造 / 求值 / 记号（完整括号或按优先级省括号）
   - 表达式树 SVG：T 绿 · F 红 · 待求值暖纸 · 当前节点金环
   - 分步控制器：上一步 / 下一步 / 自动播放 + 速度 / 重置 / 进度条
   页面只写本层特有的步骤生成与面板渲染，通过 window.PropCore 调用。
   ===================================================================== */
(function (global) {
  "use strict";

  const SYM = { not: "¬", and: "∧", or: "∨", implies: "→", iff: "↔" };
  const NAME = { not: "否定", and: "合取", or: "析取", implies: "蕴含", iff: "等价" };
  /* 优先级：¬ > ∧ > ∨ > → > ↔ */
  const PREC = { iff: 1, implies: 2, or: 3, and: 4, not: 5, atom: 6 };
  const COLOR = {
    t: "#2F7D57", tDk: "#1D5E3F", f: "#C0392B", fDk: "#96281B",
    idleOp: "#FFF4E6", idleOpStroke: "#E0A020", idleAtom: "#F3E7DA", idleAtomStroke: "#CBB6A6",
    edge: "#D8C4B4", ring: "#FFB400", ink: "#3A2A22", red: "#D63B1D", gateIdle: "#9A6A3A"
  };

  const A = n => ({ op: "atom", name: n });
  const NOT = c => ({ op: "not", child: c });
  const AND = (l, r) => ({ op: "and", left: l, right: r });
  const OR = (l, r) => ({ op: "or", left: l, right: r });
  const IMP = (l, r) => ({ op: "implies", left: l, right: r });
  const IFF = (l, r) => ({ op: "iff", left: l, right: r });
  const isBin = n => n.op === "and" || n.op === "or" || n.op === "implies" || n.op === "iff";
  const kids = n => n.op === "atom" ? [] : (n.op === "not" ? [n.child] : [n.left, n.right]);

  /* 给每个节点编号，并记录子树包含的全部节点 id（用于高亮） */
  function annotate(root, start) {
    let id = start || 0;
    (function walk(n) {
      n.id = id++;
      n.desc = new Set([n.id]);
      kids(n).forEach(k => { walk(k); k.desc.forEach(d => n.desc.add(d)); });
    })(root);
    root.nextId = id;
    return root;
  }

  function ev(n, e) {
    switch (n.op) {
      case "atom": return !!e[n.name];
      case "not": return !ev(n.child, e);
      case "and": return ev(n.left, e) && ev(n.right, e);
      case "or": return ev(n.left, e) || ev(n.right, e);
      case "implies": return !ev(n.left, e) || ev(n.right, e);
      case "iff": return ev(n.left, e) === ev(n.right, e);
    }
    return false;
  }

  function postorder(n, acc) {
    acc = acc || [];
    kids(n).forEach(k => postorder(k, acc));
    acc.push(n);
    return acc;
  }
  function atomsOf(n) {
    const s = new Set();
    (function w(x) { if (x.op === "atom") s.add(x.name); else kids(x).forEach(w); })(n);
    return [...s].sort();
  }

  /* 记号：mode = "full"（非顶层二元子式一律加括号）或 "min"（按优先级省略括号） */
  function needParen(child, parent, side, mode) {
    if (!isBin(child)) return false;
    if (mode !== "min") return true;
    if (parent.op === "not") return true;
    const pc = PREC[child.op], pp = PREC[parent.op];
    if (pc < pp) return true;
    if (pc > pp) return false;
    /* 同级：∧、∨ 左结合可省；其余（→、↔ 及右侧嵌套）保留括号，避免歧义 */
    return !((child.op === "and" || child.op === "or") && child.op === parent.op && side === "L");
  }
  function toks(n, mode) {
    function wrap(child, parent, side) {
      const inner = t(child);
      return needParen(child, parent, side, mode)
        ? [{ t: "(", nid: child.id }].concat(inner, [{ t: ")", nid: child.id }])
        : inner;
    }
    function t(x) {
      if (x.op === "atom") return [{ t: x.name, nid: x.id }];
      if (x.op === "not") return [{ t: "¬", nid: x.id }].concat(wrap(x.child, x, "R"));
      return wrap(x.left, x, "L").concat([{ t: SYM[x.op], nid: x.id }], wrap(x.right, x, "R"));
    }
    return t(n);
  }
  const strOf = (n, mode) => toks(n, mode).map(x => x.t).join("");

  const tm = v => v ? "T" : "F";
  const tf = v => v ? '<span class="t">真</span>' : '<span class="f">假</span>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  /* 第 m 行解释：变元按字母序，二进制位 1 表示取真（与主范式编号一致） */
  function rowEnv(atoms, m) {
    const e = {};
    atoms.forEach((a, i) => { e[a] = !!(m & (1 << (atoms.length - 1 - i))); });
    return e;
  }
  const bits = (atoms, e) => atoms.map(a => e[a] ? "1" : "0").join("");

  /* 公式 token 渲染：hot = 高亮的节点 id 集合；env = 给原子按真值上色 */
  function formulaHTML(ast, opts) {
    opts = opts || {};
    const hot = opts.hot ? (opts.hot instanceof Set ? opts.hot : new Set(opts.hot)) : null;
    return toks(ast, opts.mode).map(tk => {
      let cls = "il-term";
      if (hot && hot.size) cls += hot.has(tk.nid) ? " hot" : " dim";
      if (opts.env && /^[a-z]$/.test(tk.t)) cls += opts.env[tk.t] ? " tt" : " ff";
      return '<span class="' + cls + '">' + esc(tk.t) + "</span>";
    }).join("");
  }

  /* ---------------- 表达式树 SVG ---------------- */
  const SVGNS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, text) {
    const x = document.createElementNS(SVGNS, tag);
    for (const k in attrs) x.setAttribute(k, attrs[k]);
    if (text != null) x.textContent = text;
    return x;
  }
  function layout(root) {
    const leaves = [], depth = {};
    let maxDepth = 0;
    (function c(n, d) {
      depth[n.id] = d; maxDepth = Math.max(maxDepth, d);
      if (n.op === "atom") leaves.push(n); else kids(n).forEach(k => c(k, d + 1));
    })(root, 0);
    const u = {};
    leaves.forEach((lf, i) => { u[lf.id] = leaves.length === 1 ? 0.5 : i / (leaves.length - 1); });
    (function f(n) {
      if (n.op === "atom") return u[n.id];
      const ks = kids(n).map(f);
      u[n.id] = ks.reduce((a, b) => a + b, 0) / ks.length;
      return u[n.id];
    })(root);
    return { depth, maxDepth, u };
  }

  /* opts: env（解释）, evaluated（Set，缺省 = 全部已求值；null 且无 env = 结构图）, active（当前节点 id）,
           orient "down"（树）| "right"（门电路：输入在左、输出在右）, labels（原子旁说明）, gateText（节点下小字）,
           x0/w（在 SVG 中所占横向区域）, W/H, clear, title */
  /* 窄屏（手机）时改用更窄的画布，节点不至于缩得太小 */
  function isNarrow(svg) {
    const box = svg && svg.parentNode;
    const cw = box ? box.clientWidth : 0;
    return cw > 0 && cw < 560;
  }
  function drawTree(svg, root, opts) {
    opts = opts || {};
    const narrow = isNarrow(svg);
    const W = narrow ? (opts.Wn || 440) : (opts.W || 760), H = narrow ? (opts.Hn || opts.H || 250) : (opts.H || 250);
    if (opts.clear !== false) svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    const x0 = opts.x0 || 0, w = opts.w || W;
    if (opts.clear !== false) svg.innerHTML = "";
    const env = opts.env || null;
    const evd = opts.evaluated === undefined ? (env ? null : new Set()) : opts.evaluated;
    const isEval = id => !!env && (evd === null || evd.has(id));
    const lay = layout(root), pos = {};
    const mx = opts.mx || (narrow ? 34 : 56), my = opts.my || (opts.title ? 56 : 40);
    postorder(root).forEach(n => {
      const dn = lay.maxDepth === 0 ? 0 : lay.depth[n.id] / lay.maxDepth;
      if (opts.orient === "right") {
        pos[n.id] = { x: x0 + mx + (1 - dn) * (w - 2 * mx), y: my + lay.u[n.id] * (H - my - 34) };
      } else {
        pos[n.id] = { x: x0 + mx + lay.u[n.id] * (w - 2 * mx), y: my + dn * (H - my - 40) };
      }
    });
    if (opts.title) svg.appendChild(el("text", { x: x0 + w / 2, y: 22, "text-anchor": "middle", fill: opts.titleColor || COLOR.gateIdle, "font-size": 13, "font-weight": 800 }, opts.title));
    /* 边 */
    postorder(root).forEach(n => kids(n).forEach(k => {
      const a = pos[n.id], b = pos[k.id], lit = isEval(k.id);
      const stroke = lit ? (ev(k, env) ? COLOR.t : COLOR.f) : COLOR.edge;
      const d = opts.orient === "right"
        ? "M " + b.x + " " + b.y + " C " + (a.x + b.x) / 2 + " " + b.y + " " + (a.x + b.x) / 2 + " " + a.y + " " + a.x + " " + a.y
        : "M " + a.x + " " + a.y + " L " + b.x + " " + b.y;
      svg.appendChild(el("path", { d, stroke, "stroke-width": lit ? 3 : 2, fill: "none", opacity: 0.9 }));
    }));
    /* 节点 */
    postorder(root).forEach(n => {
      const p = pos[n.id], done = isEval(n.id), val = done ? ev(n, env) : null;
      if (opts.active === n.id) {
        const ring = n.op === "atom"
          ? el("circle", { cx: p.x, cy: p.y, r: 31, fill: "none", stroke: COLOR.ring, "stroke-width": 4 })
          : el("rect", { x: p.x - 36, y: p.y - 27, width: 72, height: 54, rx: 13, fill: "none", stroke: COLOR.ring, "stroke-width": 4 });
        ring.appendChild(el("animate", { attributeName: "opacity", values: "1;0.35;1", dur: "1.3s", repeatCount: "indefinite" }));
        svg.appendChild(ring);
      }
      const fill = done ? (val ? COLOR.t : COLOR.f) : (n.op === "atom" ? COLOR.idleAtom : COLOR.idleOp);
      const stroke = done ? (val ? COLOR.tDk : COLOR.fDk) : (n.op === "atom" ? COLOR.idleAtomStroke : COLOR.idleOpStroke);
      const shadow = "drop-shadow(0 3px 6px rgba(69,31,15,0.16))";
      if (n.op === "atom") {
        svg.appendChild(el("circle", { cx: p.x, cy: p.y, r: 23, fill, stroke, "stroke-width": 2, filter: shadow }));
        svg.appendChild(el("text", { x: p.x, y: p.y + 6, "text-anchor": "middle", fill: done ? "#fff" : COLOR.ink, "font-size": 17, "font-weight": 800, "font-family": "JetBrains Mono, Consolas, monospace" }, n.name));
        if (done) svg.appendChild(el("text", { x: p.x, y: p.y + 41, "text-anchor": "middle", fill: val ? COLOR.tDk : COLOR.fDk, "font-size": 12, "font-weight": 800, "font-family": "JetBrains Mono, Consolas, monospace" }, tm(val)));
        if (opts.labels && opts.labels[n.name]) {
          const side = opts.orient === "right";
          svg.appendChild(el("text", { x: side ? p.x - 30 : p.x, y: side ? p.y + 4 : p.y - 30, "text-anchor": side ? "end" : "middle", fill: "#7a5c4d", "font-size": 11, "font-weight": 700 }, opts.labels[n.name]));
        }
      } else {
        svg.appendChild(el("rect", { x: p.x - 29, y: p.y - 21, width: 58, height: 42, rx: 10, fill, stroke, "stroke-width": 2, filter: shadow }));
        svg.appendChild(el("text", { x: p.x, y: p.y - 1, "text-anchor": "middle", fill: done ? "#fff" : COLOR.red, "font-size": 17, "font-weight": 800, "font-family": "JetBrains Mono, Consolas, monospace" }, SYM[n.op]));
        const g = opts.gateText ? opts.gateText(n) : NAME[n.op];
        svg.appendChild(el("text", { x: p.x, y: p.y + 14, "text-anchor": "middle", fill: done ? "rgba(255,255,255,.92)" : COLOR.gateIdle, "font-size": 10, "font-weight": 700 }, g));
        if (opts.orient === "right" && n === root && done) {
          svg.appendChild(el("text", { x: p.x + 38, y: p.y + 5, "text-anchor": "start", fill: val ? COLOR.tDk : COLOR.fDk, "font-size": 15, "font-weight": 800, "font-family": "JetBrains Mono, Consolas, monospace" }, "▶" + tm(val)));
        }
      }
    });
    return pos;
  }

  /* ---------------- 分步控制器 ---------------- */
  function Stepper(cfg) {
    const $ = id => document.getElementById(id);
    const prev = $(cfg.prev || "prevBtn"), next = $(cfg.next || "nextBtn"), auto = $(cfg.auto || "autoBtn"),
      reset = $(cfg.reset || "resetBtn"), speed = $(cfg.speed || "speed"),
      bar = $(cfg.bar || "progressBar"), num = $(cfg.num || "progressNum");
    let steps = [], idx = 0, timer = null;
    const AUTO_TXT = "▶ 自动播放", PAUSE_TXT = "❚❚ 暂停";
    function delay() { return Math.max(300, 1600 - Number(speed ? speed.value : 55) * 12); }
    function paint() {
      const n = Math.max(1, steps.length - 1);
      if (bar) bar.style.width = (idx / n * 100) + "%";
      if (num) num.textContent = idx + " / " + (steps.length - 1);
      prev.disabled = idx <= 0;
      next.disabled = idx >= steps.length - 1;
      cfg.render(steps[idx], idx, steps);
    }
    function stop() {
      if (!timer) return;
      clearInterval(timer); timer = null;
      auto.textContent = AUTO_TXT; auto.classList.remove("playing");
    }
    function go(i) { idx = Math.max(0, Math.min(steps.length - 1, i)); paint(); }
    function play() {
      if (timer) { stop(); return; }
      if (idx >= steps.length - 1) go(0);
      auto.textContent = PAUSE_TXT; auto.classList.add("playing");
      timer = setInterval(() => { if (idx >= steps.length - 1) { stop(); return; } go(idx + 1); }, delay());
    }
    auto.textContent = AUTO_TXT;
    prev.addEventListener("click", () => { stop(); go(idx - 1); });
    next.addEventListener("click", () => { stop(); go(idx + 1); });
    reset.addEventListener("click", () => { stop(); go(0); if (cfg.onReset) cfg.onReset(); });
    auto.addEventListener("click", play);
    if (speed) speed.addEventListener("input", () => { if (timer) { stop(); play(); } });
    let rz = null, lastW = window.innerWidth;
    window.addEventListener("resize", () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(rz); rz = setTimeout(() => { if (steps.length) paint(); }, 150);
    });
    return {
      set(list, i) { steps = list; go(i == null ? 0 : i); },
      go, stop,
      get index() { return idx; },
      get steps() { return steps; }
    };
  }

  global.PropCore = {
    SYM, NAME, PREC, COLOR, A, NOT, AND, OR, IMP, IFF, isBin, kids,
    annotate, ev, postorder, atomsOf, toks, strOf, tm, tf, esc, rowEnv, bits,
    formulaHTML, drawTree, isNarrow, Stepper
  };
})(window);
