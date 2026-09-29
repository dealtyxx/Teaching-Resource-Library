/* =====================================================================
 * 第11章 环、域、格和布尔代数 —— 章内统一交互引擎（ch11-engine.js）
 *
 * 1) 三层强交互引擎：11.1–11.7 的基础层 / 拓展层为薄壳页，只写
 *      <script>window.CH11_LEVEL = "basic" | "extend";</script>
 *      <script src="../ch11-engine.js"></script>
 *      <script src="本单元-tier.js"></script>     ← 调用 CH11.mount({ basic:{…}, extend:{…} })
 *    引擎负责：示例选择、参数控件、分步卡（上一步/下一步/自动播放/重置 + 速度 + 进度）、
 *    反馈、公式项高亮、舞台图示、结果区、知识要点与洞见卡。
 *
 * 2) 案例页增强：11.8–11.11 在页面写 window.CH11_CASE = true 并引入本文件，
 *    为已有 .kg-step-lab 追加统一的分步导航，并从 SECTION_META 渲染
 *    「价值引领」「迁移思考」两段（六段式的后两段，避免手写重复内容）。
 *
 * 3) CH11.toast(msg)：页内提示条，替代 alert()。
 * ===================================================================== */
(function (global) {
  "use strict";

  /* ---------------- 小工具 ---------------- */
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function $(id) { return document.getElementById(id); }
  function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }
  function mod(a, n) { return ((a % n) + n) % n; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }

  var toastTimer = null;
  function toast(msg, ms) {
    var el = document.querySelector(".ch11-toast");
    if (!el) { el = document.createElement("div"); el.className = "ch11-toast"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, ms || 2600);
  }

  /* ---------------- SVG 助手（节点配色全章一致） ---------------- */
  var KIND = {
    norm: { fill: "#ffffff", stroke: "#6b4a38", text: "#2c1810" },
    cur:  { fill: "#ffb400", stroke: "#c58a1f", text: "#2c1810" },
    key:  { fill: "#d63b1d", stroke: "#b8321a", text: "#ffffff" },
    ok:   { fill: "#2f7d57", stroke: "#2f7d57", text: "#ffffff" },
    bad:  { fill: "#fde8e4", stroke: "#c0392b", text: "#97180f" },
    dim:  { fill: "#efe4d6", stroke: "#d8c6b2", text: "#a08a78" }
  };
  var EDGE = {
    norm: { c: "rgba(107,74,56,.55)", w: 2 },
    cur:  { c: "#e0a100", w: 4 },
    key:  { c: "#d63b1d", w: 4 },
    ok:   { c: "#2f7d57", w: 4 },
    bad:  { c: "#c0392b", w: 3.2, dash: "7 5" },
    dim:  { c: "rgba(116,55,31,.16)", w: 1.6 }
  };
  var H = {
    esc: esc,
    svg: function (inner, w, h) {
      w = w || 720; h = h || 440;
      return '<svg class="viz" viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="xMidYMid meet" role="img">' + inner + "</svg>";
    },
    text: function (x, y, t, o) {
      o = o || {};
      return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.anchor || "middle") + '"' + (o.mono ? ' class="m"' : "") +
        ' font-size="' + (o.size || 14) + '" font-weight="' + (o.weight || 700) + '" fill="' + (o.color || "#4e362d") + '">' + esc(t) + "</text>";
    },
    line: function (x1, y1, x2, y2, kind) {
      var e = EDGE[kind || "norm"] || EDGE.norm;
      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + e.c + '" stroke-width="' + e.w + '" stroke-linecap="round"' + (e.dash ? ' stroke-dasharray="' + e.dash + '"' : "") + "/>";
    },
    arrow: function (x1, y1, x2, y2, kind, r) {
      var e = EDGE[kind || "norm"] || EDGE.norm; r = r || 0;
      var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
      var sx = x1 + ux * r, sy = y1 + uy * r, ex = x2 - ux * (r + 2), ey = y2 - uy * (r + 2);
      var ax = ex - ux * 10 - uy * 5, ay = ey - uy * 10 + ux * 5, bx = ex - ux * 10 + uy * 5, by = ey - uy * 10 - ux * 5;
      return '<line x1="' + sx + '" y1="' + sy + '" x2="' + ex + '" y2="' + ey + '" stroke="' + e.c + '" stroke-width="' + e.w + '" stroke-linecap="round"' + (e.dash ? ' stroke-dasharray="' + e.dash + '"' : "") + "/>" +
        '<polygon points="' + ex + "," + ey + " " + ax + "," + ay + " " + bx + "," + by + '" fill="' + e.c + '"/>';
    },
    node: function (x, y, label, kind, r, fs) {
      var k = KIND[kind || "norm"] || KIND.norm; r = r || 21;
      var s = String(label);
      var size = fs || (s.length > 4 ? 11 : s.length > 2 ? 13 : 15);
      return '<g><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + k.fill + '" stroke="' + k.stroke + '" stroke-width="2.6"' + (kind === "bad" ? ' stroke-dasharray="4 3"' : "") + "/>" +
        '<text x="' + x + '" y="' + (y + size * 0.36) + '" text-anchor="middle" class="m" font-size="' + size + '" font-weight="800" fill="' + k.text + '">' + esc(s) + "</text></g>";
    },
    box: function (x, y, w, h, label, kind, fs) {
      var k = KIND[kind || "norm"] || KIND.norm;
      return '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="9" fill="' + k.fill + '" stroke="' + k.stroke + '" stroke-width="2.2"/>' +
        '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + (fs || 14) * 0.36) + '" text-anchor="middle" class="m" font-size="' + (fs || 14) + '" font-weight="800" fill="' + k.text + '">' + esc(label) + "</text></g>";
    },
    /* Hasse 图：pos{id:[x,y]}，edges[[lo,hi]]，kinds{id:kind}，ekinds{"lo-hi":kind}，labels{id:text} */
    hasse: function (pos, edges, kinds, ekinds, labels, r) {
      kinds = kinds || {}; ekinds = ekinds || {}; labels = labels || {};
      var s = "";
      edges.forEach(function (e) {
        var a = pos[e[0]], b = pos[e[1]]; if (!a || !b) return;
        s += H.line(a[0], a[1], b[0], b[1], ekinds[e[0] + "-" + e[1]] || "norm");
      });
      Object.keys(pos).forEach(function (id) {
        s += H.node(pos[id][0], pos[id][1], labels[id] != null ? labels[id] : id, kinds[id] || "norm", r);
      });
      return s;
    },
    /* 运算表（HTML）：elems 行列元素，fn(a,b)→值，cls(a,b,v,i,j)→td 类名，cap 标题，op 左上角符号 */
    table: function (elems, fn, cls, cap, op, show) {
      show = show || function (x) { return x; };
      var s = '<div class="tbl-wrap">' + (cap ? '<div class="tbl-cap">' + cap + "</div>" : "") + '<table class="ch11-tbl"><tr><th>' + esc(op || "∘") + "</th>";
      elems.forEach(function (b) { s += "<th>" + esc(show(b)) + "</th>"; });
      s += "</tr>";
      elems.forEach(function (a, i) {
        s += "<tr><th>" + esc(show(a)) + "</th>";
        elems.forEach(function (b, j) {
          var v = fn(a, b), c = cls ? cls(a, b, v, i, j) : "";
          s += "<td" + (c ? ' class="' + c + '"' : "") + ">" + esc(show(v)) + "</td>";
        });
        s += "</tr>";
      });
      return s + "</table></div>";
    },
    verdict: function (ok, yes, no) {
      if (ok == null) return '<span class="verdict wait">待判定</span>';
      return '<span class="verdict ' + (ok ? "yes" : "no") + '">' + esc(ok ? (yes || "成立") : (no || "不成立")) + "</span>";
    },
    set: function (arr) { return "{" + arr.join(", ") + "}"; }
  };

  /* ---------------- 三层强交互引擎 ---------------- */
  var SPEEDS = [["slow", "慢速", 2400], ["mid", "中速", 1500], ["fast", "快速", 850]];

  function mount(def) {
    var level = global.CH11_LEVEL || "basic";
    var L = def[level];
    if (!L) return;
    var st = { level: level, ci: 0, c: null, step: 0, p: {}, maxSeen: 0 };
    var timer = null, speed = "mid";

    function stepsOf() { return typeof L.steps === "function" ? L.steps(st) : L.steps; }
    function initCase(ci) {
      st.ci = ci; st.c = L.cases ? L.cases[ci] : {};
      st.p = {}; if (L.init) L.init(st);
      st.step = 0; st.maxSeen = 0;
    }
    function val(v) { return (v !== "" && !isNaN(v) && /^-?\d+(\.\d+)?$/.test(v)) ? Number(v) : v; }

    function renderStatic() {
      var m = $("ch11Mission"); if (m) m.innerHTML = "<span><b>互动任务：</b>" + L.mission + "</span>" + (L.badge ? '<div class="visual-badge">' + esc(L.badge) + "</div>" : "");
      var k = $("ch11Knowledge");
      if (k) k.innerHTML = L.knowledge ? "<h3>📌 知识要点</h3><ul>" + L.knowledge.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>" : "";
      var ins = $("ch11Insight");
      if (ins && L.insight) ins.innerHTML = '<div class="insight-title">' + L.insight.title + "</div><p>" + L.insight.text + "</p>" +
        (L.insight.badges ? '<div class="badges">' + L.insight.badges.map(function (b) { return '<span class="badge">' + esc(b) + "</span>"; }).join("") + "</div>" : "");
      var lg = $("ch11Legend");
      if (lg) lg.innerHTML = (L.legend || []).map(function (x) { return '<span><i class="l-' + x[0] + '"></i>' + esc(x[1]) + "</span>"; }).join("");
    }

    function renderLab() {
      var steps = stepsOf();
      var lab = $("ch11StepLab");
      var html = '<div class="kg-step-head"><strong>' + esc(L.stepTitle || (steps.length + " 步互动")) + "</strong><span>" + esc(L.stepHint || "点一步，看反馈、公式项与图示同步高亮") + "</span></div>";
      html += '<div class="kg-step-grid">' + steps.map(function (s, i) {
        return '<button type="button" class="kg-step' + (i === st.step ? " active" : "") + (i < st.step || (i <= st.maxSeen && i !== st.step) ? " done" : "") + '" data-step="' + i + '"><b>' + (i + 1) + " " + esc(s.t) + "</b><span>" + esc(s.s || "") + "</span></button>";
      }).join("") + "</div>";
      html += '<div class="ch11-nav">' +
        '<button type="button" class="ch11-btn" data-nav="prev"' + (st.step <= 0 ? " disabled" : "") + ">◀ 上一步</button>" +
        '<button type="button" class="ch11-btn primary" data-nav="next"' + (st.step >= steps.length - 1 ? " disabled" : "") + ">下一步 ▶</button>" +
        '<button type="button" class="ch11-btn' + (timer ? " playing" : "") + '" data-nav="play">' + (timer ? "⏸ 暂停播放" : "▶ 自动播放") + "</button>" +
        '<button type="button" class="ch11-btn ghost" data-nav="reset">重置</button></div>';
      html += '<div class="ch11-speed"><span>播放速度</span><select data-speed="1" aria-label="播放速度">' + SPEEDS.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === speed ? " selected" : "") + ">" + s[1] + "</option>"; }).join("") + "</select></div>";
      var pct = steps.length > 1 ? Math.round(st.step / (steps.length - 1) * 100) : 100;
      html += '<div class="ch11-progress"><div class="bar"><i style="width:' + pct + '%"></i></div><span class="num">' + (st.step + 1) + " / " + steps.length + "</span></div>";
      html += '<div class="kg-feedback" id="ch11Feedback">' + (L.feedback ? L.feedback(st) : "") + "</div>";
      var toks = typeof L.tokens === "function" ? L.tokens(st) : L.tokens;
      if (toks && toks.length) {
        var on = steps[st.step] && steps[st.step].tok;
        html += '<div class="kg-formula-row">' + toks.map(function (t, i) { return '<span class="kg-token' + ((on === i || (on && on.indexOf && on.indexOf(i) >= 0)) ? " on" : "") + '">' + esc(t) + "</span>"; }).join("") + "</div>";
      }
      lab.innerHTML = html;
    }

    function renderCtrl() {
      var box = $("ch11Ctrl"); if (!box) return;
      var html = "";
      if (L.cases && L.cases.length > 1) {
        html += '<div class="ctrl-row"><label for="ch11Case">' + esc(L.caseLabel || "选择示例") + "</label><select id=\"ch11Case\" data-case=\"1\">" +
          L.cases.map(function (c, i) { return '<option value="' + i + '"' + (i === st.ci ? " selected" : "") + ">" + esc(c.label) + "</option>"; }).join("") + "</select></div>";
      }
      if (L.controls) html += L.controls(st, H) || "";
      box.innerHTML = html;
    }

    function renderStage() {
      var t = $("ch11Title"); if (t) t.textContent = typeof L.title === "function" ? L.title(st) : (L.title || "");
      var s = $("ch11Sub"); if (s) s.innerHTML = typeof L.sub === "function" ? L.sub(st) : (L.sub || "");
      var stage = $("ch11Stage"); if (stage) stage.innerHTML = L.draw ? L.draw(st, H) : "";
      var r = $("ch11Result"); if (r) r.innerHTML = L.result ? L.result(st, H) : "";
    }

    function renderAll(withCtrl) {
      if (st.step > st.maxSeen) st.maxSeen = st.step;
      if (withCtrl) renderCtrl();
      renderLab(); renderStage();
      if (global.MathJax && global.MathJax.typesetPromise) { try { global.MathJax.typesetPromise(); } catch (e) {} }
    }

    function go(i) {
      var n = stepsOf().length;
      st.step = Math.max(0, Math.min(n - 1, i));
      renderAll(!!L.ctrlPerStep);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function play() {
      if (timer) { stop(); renderLab(); return; }
      var n = stepsOf().length;
      if (st.step >= n - 1) st.step = 0;
      var ms = SPEEDS.filter(function (s) { return s[0] === speed; })[0][2];
      timer = setInterval(function () {
        if (st.step >= stepsOf().length - 1) { stop(); renderLab(); return; }
        go(st.step + 1);
      }, ms);
      renderAll(!!L.ctrlPerStep);
    }

    document.addEventListener("click", function (ev) {
      var b = ev.target.closest && ev.target.closest("[data-step],[data-nav],[data-pick]");
      if (!b) return;
      if (b.hasAttribute("data-step")) { stop(); go(Number(b.getAttribute("data-step"))); }
      else if (b.hasAttribute("data-nav")) {
        var a = b.getAttribute("data-nav");
        if (a === "prev") { stop(); go(st.step - 1); }
        else if (a === "next") { stop(); go(st.step + 1); }
        else if (a === "play") play();
        else if (a === "reset") { stop(); initCase(st.ci); renderAll(true); }
      } else if (b.hasAttribute("data-pick")) {
        var key = b.getAttribute("data-pick"), v = val(b.getAttribute("data-val"));
        if (L.onPick) L.onPick(st, key, v); else st.p[key] = v;
        renderAll(true);
      }
    });
    document.addEventListener("change", function (ev) {
      var el = ev.target;
      if (el.hasAttribute && el.hasAttribute("data-case")) { stop(); initCase(Number(el.value)); renderAll(true); }
      else if (el.hasAttribute && el.hasAttribute("data-speed")) {
        speed = el.value;
        if (timer) { stop(); play(); }
      } else if (el.hasAttribute && el.hasAttribute("data-set")) {
        var key = el.getAttribute("data-set");
        st.p[key] = el.type === "checkbox" ? el.checked : val(el.value);
        if (L.onSet) L.onSet(st, key);
        renderAll(true);
      }
    });

    initCase(0);
    renderStatic();
    renderAll(true);
    global.CH11_STATE = st;
  }

  /* ---------------- 案例页增强（11.8–11.11） ---------------- */
  function enhanceCase() {
    var lab = document.querySelector(".kg-step-lab");
    var steps = lab ? Array.prototype.slice.call(lab.querySelectorAll(".kg-step")) : [];
    var timer = null, speed = "mid";
    if (lab && steps.length > 1 && !lab.querySelector(".ch11-nav")) {
      var nav = document.createElement("div");
      nav.className = "ch11-nav";
      nav.innerHTML = '<button type="button" class="ch11-btn" data-cnav="prev">◀ 上一步</button>' +
        '<button type="button" class="ch11-btn primary" data-cnav="next">下一步 ▶</button>' +
        '<button type="button" class="ch11-btn" data-cnav="play">▶ 自动播放</button>' +
        '<button type="button" class="ch11-btn ghost" data-cnav="reset">重置</button>';
      var sp = document.createElement("div");
      sp.className = "ch11-speed";
      sp.innerHTML = '<span>播放速度</span><select aria-label="播放速度">' + SPEEDS.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === speed ? " selected" : "") + ">" + s[1] + "</option>"; }).join("") + "</select>";
      var prog = document.createElement("div");
      prog.className = "ch11-progress";
      prog.innerHTML = '<div class="bar"><i></i></div><span class="num"></span>';
      var grid = lab.querySelector(".kg-step-grid");
      grid.parentNode.insertBefore(prog, grid.nextSibling);
      grid.parentNode.insertBefore(sp, grid.nextSibling);
      grid.parentNode.insertBefore(nav, grid.nextSibling);
      var cur = function () { var i = steps.findIndex(function (b) { return b.classList.contains("active"); }); return i < 0 ? 0 : i; };
      var sync = function () {
        var i = cur();
        nav.querySelector('[data-cnav="prev"]').disabled = i <= 0;
        nav.querySelector('[data-cnav="next"]').disabled = i >= steps.length - 1;
        var pb = nav.querySelector('[data-cnav="play"]');
        pb.textContent = timer ? "⏸ 暂停播放" : "▶ 自动播放";
        pb.classList.toggle("playing", !!timer);
        prog.querySelector("i").style.width = Math.round(i / (steps.length - 1) * 100) + "%";
        prog.querySelector(".num").textContent = (i + 1) + " / " + steps.length;
      };
      var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
      var goto = function (i) { i = Math.max(0, Math.min(steps.length - 1, i)); steps[i].click(); sync(); };
      steps.forEach(function (b) { b.addEventListener("click", function () { setTimeout(sync, 0); }); b.addEventListener("pointerdown", function (e) { if (e.isTrusted) stop(); }); });
      nav.addEventListener("click", function (ev) {
        var b = ev.target.closest("[data-cnav]"); if (!b) return;
        var a = b.getAttribute("data-cnav");
        if (a === "prev") { stop(); goto(cur() - 1); }
        else if (a === "next") { stop(); goto(cur() + 1); }
        else if (a === "reset") { stop(); if (typeof global.CH11_CASE_RESET === "function") global.CH11_CASE_RESET(); goto(0); }
        else if (a === "play") {
          if (timer) { stop(); sync(); return; }
          if (cur() >= steps.length - 1) goto(0);
          var ms = SPEEDS.filter(function (s) { return s[0] === speed; })[0][2];
          timer = setInterval(function () { if (cur() >= steps.length - 1) { stop(); sync(); return; } goto(cur() + 1); }, ms);
          sync();
        }
      });
      sp.querySelector("select").addEventListener("change", function () {
        speed = this.value;
        if (timer) { stop(); nav.querySelector('[data-cnav="play"]').click(); }
      });
      sync();
    }

    var meta = global.SECTION_META || {};
    var vEl = $("ch11CaseValue");
    if (vEl && meta.ideology) {
      var io = meta.ideology;
      vEl.innerHTML = '<div class="insight-title">🚩 ' + esc(io.title || "价值引领") + "</div><p>" + esc(io.text || "") + "</p>" +
        (io.quote ? '<p style="margin-top:6px;color:#8a5d0b;font-style:italic">' + esc(io.quote) + "</p>" : "") +
        ((io.dims && io.dims.length) ? '<div class="badges">' + io.dims.map(function (d) { return '<span class="badge">' + esc(d) + "</span>"; }).join("") + "</div>" : "");
    }
    var tEl = $("ch11CaseTransfer");
    if (tEl) {
      var items = [];
      (meta.transfer || []).forEach(function (t) { items.push(typeof t === "string" ? { t: "迁移", d: t } : t); });
      (meta.reflect || []).slice(0, 2).forEach(function (r) { items.push({ t: "思考", d: r }); });
      tEl.innerHTML = '<div class="transfer-list">' + items.map(function (it) { return '<div class="transfer-item"><b>' + esc(it.t) + "</b>" + esc(it.d) + "</div>"; }).join("") + "</div>";
    }
  }

  global.CH11 = { mount: mount, H: H, toast: toast, esc: esc, range: range, mod: mod, gcd: gcd, lcm: lcm };
  if (global.CH11_CASE) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enhanceCase);
    else enhanceCase();
  }
})(window);
