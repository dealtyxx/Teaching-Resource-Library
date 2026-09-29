/* =====================================================================
   5.8 两弹一星案例 —— 三层共用小工具（TB 命名空间）
   · TB.toast(msg, type)   页内提示条（替代 alert），type = info | ok | err
   · TB.stepper(opts)      分步演示控件：上一步 / 下一步 / 自动播放 + 速度 / 重置 + 进度 + 当前反馈
   · TB.graph(wrap, spec)  依赖图：填充色节点（未推出 灰 / 当前 金 / 已推出 绿 / 取假·缺失 红虚线），
                           宽屏与窄屏各一套坐标，随容器宽度自动切换
   各页的数学内容与流程写在本页内联脚本中。
   ===================================================================== */
(function (global) {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  /* ---------- 页内提示条 ---------- */
  var toastTimer = null;
  function toast(msg, type, ms) {
    var el = $("tbToast");
    if (!el) return;
    el.className = "tb-toast " + (type || "info");
    el.innerHTML = msg;
    // 强制重排以便重复触发动画
    void el.offsetWidth;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, ms || 3600);
  }

  /* ---------- 分步演示控件 ---------- */
  function stepper(opts) {
    var mount = opts.mount;
    var total = opts.total;               // function () -> 步数
    var state = { i: 0, timer: null };
    var id = opts.id || "tbStep";
    mount.innerHTML =
      '<div class="control-group"><div class="cg-label"><span>' + esc(opts.title || "分步演示") + '</span><small>' + esc(opts.sub || "点一步 · 看反馈") + '</small></div>' +
        '<div class="tb-step-row">' +
          '<button type="button" class="tb-btn" id="' + id + 'Prev">◀ 上一步</button>' +
          '<button type="button" class="tb-btn primary" id="' + id + 'Next">下一步 ▶</button>' +
          '<button type="button" class="tb-btn" id="' + id + 'Auto">⏵ 自动播放</button>' +
          '<button type="button" class="tb-btn ghost" id="' + id + 'Reset">重置</button>' +
        '</div>' +
        '<label class="tb-speed" for="' + id + 'Speed"><span>播放速度</span><select id="' + id + 'Speed">' +
          '<option value="2600">慢</option><option value="1600" selected>中</option><option value="900">快</option></select></label>' +
        (opts.extra || "") +
      '</div>' +
      '<div class="control-group"><div class="cg-label"><span>进度</span></div>' +
        '<div class="tb-progress-wrap"><div class="tb-progress"><i id="' + id + 'Bar"></i></div><span class="tb-progress-num" id="' + id + 'Num">0 / 0</span></div></div>' +
      '<div class="control-group"><div class="cg-label"><span>当前反馈</span></div><div class="tb-status" id="' + id + 'Status" aria-live="polite"></div></div>';

    var prev = $(id + "Prev"), next = $(id + "Next"), auto = $(id + "Auto"), reset = $(id + "Reset"), speed = $(id + "Speed");
    var status = $(id + "Status"), bar = $(id + "Bar"), num = $(id + "Num");

    function stop() {
      if (state.timer) { clearInterval(state.timer); state.timer = null; }
      auto.classList.remove("playing");
      auto.textContent = "⏵ 自动播放";
    }
    function render() {
      var n = total();
      if (state.i > n) state.i = n;
      if (state.i < 0) state.i = 0;
      prev.disabled = state.i <= 0;
      var blockNext = opts.canNext ? !opts.canNext(state.i) : false;
      next.disabled = state.i >= n || blockNext;
      auto.disabled = state.i >= n || (opts.canAuto ? !opts.canAuto() : false);
      bar.style.width = (n ? state.i / n * 100 : 0) + "%";
      num.textContent = state.i + " / " + n;
      var msg = opts.render(state.i);
      if (msg != null) status.innerHTML = msg;
    }
    function go(k) {
      var n = total();
      state.i = Math.max(0, Math.min(n, k));
      render();
      if (state.i >= n) stop();
    }
    prev.addEventListener("click", function () { stop(); go(state.i - 1); });
    next.addEventListener("click", function () {
      stop();
      if (opts.onNext && opts.onNext(state.i) === false) return;
      go(state.i + 1);
    });
    reset.addEventListener("click", function () { stop(); go(0); if (opts.onReset) opts.onReset(); });
    auto.addEventListener("click", function () {
      if (state.timer) { stop(); return; }
      if (state.i >= total()) go(0);
      auto.classList.add("playing");
      auto.textContent = "⏸ 暂停";
      go(state.i + 1);
      state.timer = setInterval(function () {
        if (state.i >= total()) { stop(); return; }
        go(state.i + 1);
      }, +speed.value);
    });
    speed.addEventListener("change", function () { if (state.timer) { stop(); auto.click(); } });

    return {
      get: function () { return state.i; },
      go: go,
      stop: stop,
      refresh: render,
      setStatus: function (html) { status.innerHTML = html; }
    };
  }

  /* ---------- 依赖图 ---------- */
  function graph(wrap, spec) {
    var states = {}, edgeStates = {}, syms = {}, current = null;
    spec.nodes.forEach(function (n) { states[n.id] = "pending"; syms[n.id] = n.sym; });
    spec.edges.forEach(function (e) { edgeStates[e.id] = "pending"; });

    function pick() {
      var narrow = spec.narrow && wrap.clientWidth > 0 && wrap.clientWidth < (spec.breakpoint || 520);
      return narrow ? spec.narrow : spec.wide;
    }
    function trim(cx, cy, tx, ty, w, h, pad) {
      var dx = tx - cx, dy = ty - cy;
      if (!dx && !dy) return [cx, cy];
      var hw = w / 2 + pad, hh = h / 2 + pad;
      var t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
      return [cx + dx * t, cy + dy * t];
    }
    function draw() {
      var L = pick();
      current = L;
      var nw = L.nodeW || 100, nh = L.nodeH || 54;
      var size = {};
      spec.nodes.forEach(function (n) { size[n.id] = [n.w ? (L.scaleW ? n.w * L.scaleW : n.w) : nw, nh]; });
      var svg = document.createElementNS(SVGNS, "svg");
      svg.setAttribute("viewBox", "0 0 " + L.w + " " + L.h);
      svg.setAttribute("class", "tb-graph");
      svg.style.maxWidth = Math.round(L.maxW || L.w * 1.3) + "px";
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", spec.label || "推理依赖图");
      var defs = '<defs>' + ["pending", "cur", "done", "miss"].map(function (s) {
        var c = { pending: "rgba(116,55,31,.45)", cur: "#c58a1f", done: "#2f7d57", miss: "#c0392b" }[s];
        return '<marker id="' + spec.prefix + '-ar-' + s + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="' + c + '"/></marker>';
      }).join("") + '</defs>';
      var edgesSvg = spec.edges.map(function (e) {
        var a = L.pos[e.from], b = L.pos[e.to];
        var sa = size[e.from], sb = size[e.to];
        var ctrl = (L.curve && L.curve[e.id]) || null;
        var d, mid;
        if (ctrl) {
          var p0 = trim(a[0], a[1], ctrl[0], ctrl[1], sa[0], sa[1], 3);
          var p1 = trim(b[0], b[1], ctrl[0], ctrl[1], sb[0], sb[1], 6);
          d = "M" + p0[0].toFixed(1) + " " + p0[1].toFixed(1) + " Q" + ctrl[0] + " " + ctrl[1] + " " + p1[0].toFixed(1) + " " + p1[1].toFixed(1);
          mid = [0.25 * p0[0] + 0.5 * ctrl[0] + 0.25 * p1[0], 0.25 * p0[1] + 0.5 * ctrl[1] + 0.25 * p1[1]];
        } else {
          var q0 = trim(a[0], a[1], b[0], b[1], sa[0], sa[1], 3);
          var q1 = trim(b[0], b[1], a[0], a[1], sb[0], sb[1], 6);
          d = "M" + q0[0].toFixed(1) + " " + q0[1].toFixed(1) + " L" + q1[0].toFixed(1) + " " + q1[1].toFixed(1);
          mid = [(q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2];
        }
        var lab = "";
        if (e.label) {
          var off = (L.labelOff && L.labelOff[e.id]) || [0, -10];
          lab = '<text class="ge-label" data-e="' + e.id + '" x="' + (mid[0] + off[0]).toFixed(1) + '" y="' + (mid[1] + off[1]).toFixed(1) + '" text-anchor="middle">' + esc(e.label) + '</text>';
        }
        return '<path class="ge" data-e="' + e.id + '" d="' + d + '"/>' + lab;
      }).join("");
      var nodesSvg = spec.nodes.map(function (n) {
        var p = L.pos[n.id], s = size[n.id];
        var x = p[0] - s[0] / 2, y = p[1] - s[1] / 2;
        return '<g class="gn' + (n.goal ? " goal" : "") + '" data-n="' + n.id + '">' +
          '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + s[0] + '" height="' + s[1] + '" rx="12"/>' +
          '<text class="gs" x="' + p[0] + '" y="' + (p[1] - 3) + '" text-anchor="middle"></text>' +
          '<text class="gl" x="' + p[0] + '" y="' + (p[1] + 16) + '" text-anchor="middle">' + esc(n.label) + '</text>' +
          '<title>' + esc(n.sym + "：" + n.label) + '</title></g>';
      }).join("");
      svg.innerHTML = defs + '<g class="edges">' + edgesSvg + '</g><g class="nodes">' + nodesSvg + '</g>';
      wrap.innerHTML = "";
      wrap.appendChild(svg);
      paint();
    }
    function paint() {
      var svg = wrap.querySelector("svg");
      if (!svg) return;
      Array.prototype.forEach.call(svg.querySelectorAll(".gn"), function (g) {
        var id = g.getAttribute("data-n");
        g.setAttribute("class", "gn " + states[id] + (g.getAttribute("class").indexOf("goal") >= 0 ? " goal" : ""));
        g.querySelector(".gs").textContent = syms[id];
      });
      Array.prototype.forEach.call(svg.querySelectorAll("path.ge"), function (p) {
        var id = p.getAttribute("data-e"), st = edgeStates[id];
        p.setAttribute("class", "ge " + st);
        p.setAttribute("marker-end", "url(#" + spec.prefix + "-ar-" + st + ")");
      });
    }
    draw();
    var lastMode = current;
    var ro = null;
    function onResize() { if (pick() !== lastMode) { lastMode = pick(); draw(); } }
    if (global.ResizeObserver) { ro = new ResizeObserver(onResize); ro.observe(wrap); }
    else global.addEventListener("resize", onResize);

    return {
      reset: function () {
        spec.nodes.forEach(function (n) { states[n.id] = "pending"; syms[n.id] = n.sym; });
        spec.edges.forEach(function (e) { edgeStates[e.id] = "pending"; });
      },
      node: function (id, st, sym) { states[id] = st; if (sym != null) syms[id] = sym; },
      edge: function (id, st) { edgeStates[id] = st; },
      paint: paint
    };
  }

  global.TB = { $: $, esc: esc, toast: toast, stepper: stepper, graph: graph };
})(window);
