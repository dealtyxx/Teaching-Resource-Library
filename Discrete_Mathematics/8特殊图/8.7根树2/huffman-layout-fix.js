(function () {
    "use strict";

    const css = `
body {
    display: block !important;
    align-items: initial !important;
    justify-content: initial !important;
    overflow: hidden !important;
}
body .app-container {
    width: min(1440px, calc(100vw - 32px)) !important;
    height: calc(100vh - 126px) !important;
    min-height: min(640px, calc(100vh - 126px)) !important;
    max-width: none !important;
    margin: 42px auto 0 !important;
    display: flex !important;
    gap: 18px !important;
    overflow: visible !important;
    background: transparent !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
}
body:has(.app-container) > .app-container,
body:has(.app-container > aside.sidebar) > .app-container:has(> aside.sidebar),
body:has(.app-container > .sidebar) > .app-container:has(> .sidebar) {
    width: min(1440px, calc(100vw - 32px)) !important;
    height: calc(100vh - 126px) !important;
    min-height: min(640px, calc(100vh - 126px)) !important;
    max-width: none !important;
    margin: 42px auto 0 !important;
    flex: none !important;
    align-self: auto !important;
    display: flex !important;
    grid-template: none !important;
    grid-template-areas: none !important;
    grid-template-columns: none !important;
    grid-template-rows: none !important;
    gap: 18px !important;
    overflow: visible !important;
    background: transparent !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
}
body .sidebar {
    width: 360px !important;
    height: 100% !important;
    max-height: none !important;
    padding: 20px !important;
    overflow: auto !important;
    flex: 0 0 360px !important;
    border-radius: 8px !important;
}
body .visualizer-stage {
    min-width: 0 !important;
    height: 100% !important;
    flex: 1 1 auto !important;
    padding: 0 !important;
    display: flex !important;
    align-items: stretch !important;
    justify-content: stretch !important;
    background: transparent !important;
}
body.tier-page .visualizer-stage {
    display: grid !important;
    grid-template-rows: auto minmax(0, 1fr) auto !important;
    gap: 14px !important;
}
body .app-container > .visualizer-stage:has(> #dm-page-layers),
body .app-container > main.visualizer-stage:has(> #dm-page-layers),
body .app-container:has(> aside.sidebar) > .visualizer-stage:has(> #dm-page-layers),
body .app-container:has(> .sidebar) > .visualizer-stage:has(> #dm-page-layers) {
    display: grid !important;
    flex-flow: initial !important;
    grid-template-columns: minmax(0, 1fr) !important;
    grid-template-rows: auto minmax(0, 1fr) !important;
    gap: 14px !important;
    align-items: stretch !important;
}
body .glass-pane {
    min-height: 0 !important;
}
body.tier-page .tier-visual {
    min-height: 0 !important;
}
.visualizer-stage > #dm-page-layers {
    display: block !important;
    grid-row: 1 !important;
    max-height: 250px !important;
    overflow: hidden !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
    margin: 0 !important;
    padding: 10px 12px !important;
    border-radius: 8px !important;
}
.visualizer-stage > #dm-page-layers::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
    display: none !important;
}
body.tier-page .app-container > .visualizer-stage:has(> #dm-page-layers),
body.tier-page .app-container > main.visualizer-stage:has(> #dm-page-layers),
body.tier-page .app-container:has(> aside.sidebar) > .visualizer-stage:has(> #dm-page-layers),
body.tier-page .app-container:has(> .sidebar) > .visualizer-stage:has(> #dm-page-layers) {
    grid-template-rows: auto minmax(0, 1fr) auto !important;
}
body.tier-page .tier-visual {
    grid-row: 2 !important;
}
body.tier-page .detail-dock {
    grid-row: 3 !important;
    max-height: 160px !important;
    min-height: 0 !important;
    overflow: hidden !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
}
body.tier-page .detail-dock::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
    display: none !important;
}
body:not(.tier-page) .visualizer-stage > .glass-pane {
    grid-row: 2 !important;
}
@media (max-width: 980px) {
    body {
        overflow: auto !important;
    }
    body .app-container {
        width: min(100vw - 22px, 720px) !important;
        height: auto !important;
        min-height: 0 !important;
        flex-direction: column !important;
        margin-bottom: 96px !important;
    }
    body .sidebar {
        width: 100% !important;
        height: auto !important;
        flex-basis: auto !important;
    }
    body .visualizer-stage {
        min-height: 720px !important;
    }
}`;

    function install() {
        const old = document.getElementById("huffman-layout-fix");
        if (old) old.remove();
        const style = document.createElement("style");
        style.type = "text/css";
        style.id = "huffman-layout-fix";
        style.textContent = css;
        document.head.appendChild(style);
        applyInlineLayout();
    }

    function set(node, prop, value) {
        if (node) node.style.setProperty(prop, value, "important");
    }

    function applyInlineLayout() {
        const body = document.body;
        const html = document.documentElement;
        const app = document.querySelector(".app-container");
        const side = app && app.querySelector(":scope > .sidebar, :scope > aside.sidebar");
        const stage = app && app.querySelector(":scope > .visualizer-stage, :scope > main.visualizer-stage");
        const footer = document.querySelector("body > footer.footer, body > footer:not(.insight-footer)");
        const layer = stage && stage.querySelector(":scope > #dm-page-layers");

        set(html, "padding-bottom", "0");
        set(html, "overflow-x", "hidden");
        set(html, "overflow-y", "hidden");
        set(body, "display", "block");
        set(body, "flex-direction", "initial");
        set(body, "align-items", "initial");
        set(body, "justify-content", "initial");
        set(body, "padding-top", "0");
        set(body, "padding-bottom", "0");
        set(body, "margin-bottom", "0");
        set(body, "overflow-x", "hidden");
        set(body, "overflow-y", "hidden");

        set(app, "width", "min(1440px, calc(100vw - 32px))");
        set(app, "height", "calc(100vh - 126px)");
        set(app, "min-height", "min(640px, calc(100vh - 126px))");
        set(app, "max-width", "none");
        set(app, "margin", "42px auto 0");
        set(app, "display", "flex");
        set(app, "grid-template", "none");
        set(app, "grid-template-areas", "none");
        set(app, "grid-template-columns", "none");
        set(app, "grid-template-rows", "none");
        set(app, "gap", "18px");
        set(app, "overflow", "hidden");
        set(app, "background", "transparent");
        set(app, "border", "0");
        set(app, "border-radius", "0");
        set(app, "box-shadow", "none");
        set(app, "padding", "0");

        set(side, "width", "360px");
        set(side, "height", "100%");
        set(side, "min-height", "0");
        set(side, "flex", "0 0 360px");
        set(side, "overflow-x", "hidden");
        set(side, "overflow-y", "auto");
        set(side, "align-self", "stretch");
        set(side, "margin", "0");

        set(stage, "height", "100%");
        set(stage, "min-height", "0");
        set(stage, "min-width", "0");
        set(stage, "flex", "1 1 auto");
        set(stage, "padding", "0");
        set(stage, "margin", "0");
        set(stage, "align-self", "stretch");
        set(stage, "overflow", "hidden");
        if (layer) {
            set(stage, "display", "grid");
            set(stage, "grid-template-columns", "minmax(0, 1fr)");
            set(stage, "grid-template-rows", body.classList.contains("tier-page") ? "auto minmax(0, 1fr) auto" : "auto minmax(0, 1fr)");
            set(stage, "gap", "14px");
            set(layer, "display", "block");
            set(layer, "grid-row", "1");
            set(layer, "max-height", "250px");
            set(layer, "overflow-x", "hidden");
            set(layer, "overflow-y", "hidden");
            set(layer, "scrollbar-width", "none");
            set(layer, "-ms-overflow-style", "none");
            set(layer, "margin", "0");
            set(layer, "padding", "10px 12px");
            set(layer, "border-radius", "8px");
            const visual = stage.querySelector(":scope > .tier-visual, :scope > .glass-pane");
            const detail = stage.querySelector(":scope > .detail-dock");
            set(visual, "grid-row", "2");
            set(visual, "min-height", "0");
            set(detail, "grid-row", "3");
            set(detail, "max-height", "160px");
            set(detail, "min-height", "0");
            set(detail, "overflow", "hidden");
            set(detail, "scrollbar-width", "none");
            set(detail, "-ms-overflow-style", "none");
        } else {
            set(stage, "display", "flex");
            set(stage, "align-items", "stretch");
            set(stage, "justify-content", "stretch");
        }
        set(footer, "position", "fixed");
        set(footer, "left", "0");
        set(footer, "right", "0");
        set(footer, "bottom", "0");
        set(footer, "top", "auto");
        set(footer, "width", "100%");
        set(footer, "margin", "0");
        set(footer, "flex", "initial");
        set(footer, "z-index", "9998");
    }

    if (document.readyState === "complete") {
        install();
    } else {
        window.addEventListener("load", install, { once: true });
    }
    window.setTimeout(install, 120);
    window.setTimeout(install, 600);
    window.setTimeout(install, 1600);
    window.setTimeout(install, 2800);
})();

