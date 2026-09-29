/* 第9章案例单元 · 六段式导览卡（情境背景 → 数学建模 → 交互求解 → 结果解读 → 价值引领 → 迁移思考）
   用法：页面先写 window.CASE_FLOW = { stage:"认识模型", background:"…", model:"…", solve:"…", result:"…", value:"…", transfer:"…" }，
   再以 defer 引入本脚本；卡片插入左侧栏标题之后（找不到侧栏时插到主舞台顶部）。 */
(function () {
  "use strict";
  var PARTS = [
    ["background", "情境背景"],
    ["model", "数学建模"],
    ["solve", "交互求解"],
    ["result", "结果解读"],
    ["value", "价值引领"],
    ["transfer", "迁移思考"]
  ];

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }

  function findHost() {
    var side = document.querySelector(".app-container > .sidebar, .app-container > .side-panel, aside.sidebar, .side-panel, .sidebar");
    if (side) {
      var head = side.querySelector(":scope > .sidebar-header, :scope > .panel-header, :scope > .layer-summary, :scope > header");
      return { parent: side, after: head };
    }
    var stage = document.querySelector("main.visualizer-stage, .visualizer-stage, main");
    if (stage) {
      var band = stage.querySelector(":scope > #dm-page-layers");
      return { parent: stage, after: band };
    }
    return null;
  }

  function render() {
    var flow = window.CASE_FLOW;
    if (!flow || document.getElementById("dm9CaseFlow")) return true;
    var host = findHost();
    if (!host) return false;
    var parts = PARTS.filter(function (p) { return flow[p[0]]; });
    if (!parts.length) return true;

    var card = document.createElement("section");
    card.id = "dm9CaseFlow";
    card.className = "dm9-case-flow";
    card.setAttribute("aria-label", "案例六段式");
    card.innerHTML =
      '<div class="dm9-cf-head"><b>案例六段式</b>' + (flow.stage ? '<span class="dm9-cf-stage">' + esc(flow.stage) + "</span>" : "") + "</div>" +
      '<ol class="dm9-cf-steps">' + parts.map(function (p, i) {
        return '<li><button type="button" data-cf="' + i + '"' + (i === 0 ? ' class="active" aria-pressed="true"' : ' aria-pressed="false"') + ">" +
          '<span class="dm9-cf-num">' + (i + 1) + "</span>" + esc(p[1]) + "</button></li>";
      }).join("") + "</ol>" +
      '<p class="dm9-cf-text" aria-live="polite"></p>';

    var text = card.querySelector(".dm9-cf-text");
    function show(i) {
      text.innerHTML = "<b>" + esc(parts[i][1]) + "：</b>" + esc(flow[parts[i][0]]);
      Array.prototype.forEach.call(card.querySelectorAll("[data-cf]"), function (b) {
        var on = Number(b.getAttribute("data-cf")) === i;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    card.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-cf]") : null;
      if (b) show(Number(b.getAttribute("data-cf")));
    });
    show(0);

    if (host.after && host.after.parentNode === host.parent) {
      host.parent.insertBefore(card, host.after.nextSibling);
      // 侧栏若用 flex order 重排子元素，卡片沿用标题的 order，保证紧跟在标题之后
      try { var ord = getComputedStyle(host.after).order; if (ord && ord !== "0") card.style.order = ord; } catch (e) {}
    } else {
      host.parent.insertBefore(card, host.parent.firstChild);
    }
    return true;
  }

  /* 页内提示条：替代 alert()，不阻塞页面；type 可为 "info" / "warn" / "ok" */
  var toastTimer = null;
  window.dm9Toast = function (msg, type) {
    var box = document.getElementById("dm9Toast");
    if (!box) {
      box = document.createElement("div");
      box.id = "dm9Toast";
      box.className = "dm9-toast";
      box.setAttribute("role", "status");
      box.setAttribute("aria-live", "polite");
      document.body.appendChild(box);
    }
    box.textContent = String(msg == null ? "" : msg);
    box.className = "dm9-toast show " + (type || (/^请|先|至少/.test(String(msg)) ? "warn" : "ok"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { box.classList.remove("show"); }, 3600);
  };

  function boot() {
    var tries = 0;
    (function attempt() {
      if (render() || ++tries > 20) return;
      setTimeout(attempt, 100);
    })();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 0); });
  else setTimeout(boot, 0);
})();
