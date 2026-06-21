(function () {
  "use strict";

  let scheduled = false;

  function setImportant(el, name, value) {
    if (!el) return;
    if (el.style.getPropertyValue(name) === value && el.style.getPropertyPriority(name) === "important") return;
    el.style.setProperty(name, value, "important");
  }

  function applyLayout() {
    scheduled = false;
    const app = document.querySelector(".app-container");
    const sidebar = document.querySelector(".sidebar");
    const stage = document.querySelector(".visualizer-stage");
    const pane = document.querySelector(".visualizer-stage > .glass-pane");
    if (!app || !sidebar || !stage || !pane) return;

    const compact = window.innerWidth <= 920;
    setImportant(document.body, "display", "block");
    setImportant(document.body, "overflow-x", "hidden");
    setImportant(document.body, "overflow-y", compact ? "auto" : "hidden");
    setImportant(document.body, "padding-bottom", "0");

    setImportant(app, "display", "grid");
    setImportant(app, "width", compact ? "calc(100vw - 24px)" : "min(1440px, calc(100vw - 32px))");
    setImportant(app, "max-width", "none");
    setImportant(app, "height", compact ? "auto" : "calc(100vh - 166px)");
    setImportant(app, "min-height", compact ? "0" : "640px");
    setImportant(app, "margin", compact ? "68px auto 84px" : "74px auto 0");
    setImportant(app, "padding", "0");
    setImportant(app, "gap", "18px");
    setImportant(app, "grid-template", compact ? "\"side\" auto \"main\" auto / minmax(0, 1fr)" : "\"side main\" minmax(0, 1fr) / minmax(300px, 360px) minmax(0, 1fr)");
    setImportant(app, "align-items", "stretch");
    setImportant(app, "overflow", "visible");
    setImportant(app, "background", "transparent");
    setImportant(app, "border", "0");
    setImportant(app, "border-radius", "0");
    setImportant(app, "box-shadow", "none");

    setImportant(sidebar, "grid-area", "side");
    setImportant(sidebar, "width", "auto");
    setImportant(sidebar, "min-height", "0");
    setImportant(sidebar, "max-height", compact ? "none" : "100%");
    setImportant(sidebar, "border-radius", "8px");
    setImportant(sidebar, "border", "1px solid rgba(116, 55, 31, 0.18)");
    setImportant(sidebar, "background", "rgba(255, 253, 246, 0.92)");
    setImportant(sidebar, "box-shadow", "0 18px 50px rgba(69, 31, 15, 0.14)");

    setImportant(stage, "grid-area", "main");
    setImportant(stage, "display", "flex");
    setImportant(stage, "flex-direction", "column");
    setImportant(stage, "align-items", "stretch");
    setImportant(stage, "justify-content", "stretch");
    setImportant(stage, "gap", "12px");
    setImportant(stage, "padding", "0");
    setImportant(stage, "min-height", "0");
    setImportant(stage, "background", "transparent");

    setImportant(pane, "flex", "1 1 auto");
    setImportant(pane, "min-height", compact ? "520px" : "0");
    setImportant(pane, "width", "100%");
    setImportant(pane, "border-radius", "8px");
    setImportant(pane, "border", "1px solid rgba(116, 55, 31, 0.18)");
    setImportant(pane, "background", "rgba(255, 253, 246, 0.88)");
    setImportant(pane, "box-shadow", "0 18px 50px rgba(69, 31, 15, 0.14)");
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(applyLayout);
  }

  function start() {
    applyLayout();
    window.setTimeout(applyLayout, 0);
    window.setTimeout(applyLayout, 120);
    window.setTimeout(applyLayout, 500);
    window.addEventListener("resize", applyLayout);
    const app = document.querySelector(".app-container");
    if (app) {
      new MutationObserver(scheduleApply).observe(app, { attributes: true, attributeFilter: ["style", "class"] });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
