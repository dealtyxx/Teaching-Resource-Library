(function () {
  "use strict";

  const profile = window.PROFILE || {};
  const params = profile.params || {};
  const pageText = (document.title + " " + (document.querySelector(".sidebar-header") || { innerText: "" }).innerText);
  const isExtend = params.mode === "preference" || profile.layerLabel === "拓展层" || /拓展层|稳定匹配|偏好|满意度/.test(pageText);
  const controls = document.getElementById("controls");
  const canvas = document.getElementById("graphCanvas");
  const vizText = document.getElementById("vizText");
  const formulaText = document.getElementById("formulaText");
  const resultValue = document.getElementById("resultValue");
  const resultExtra = document.getElementById("resultExtra");

  if (!controls || !canvas || !vizText || !formulaText || !resultValue || !resultExtra) return;

  if (window.SECTION_META) {
    window.SECTION_META.ideology = { title: "", text: "", dims: [], quote: "" };
  }

  const ctx = canvas.getContext("2d");
  const state = {
    volunteers: [],
    posts: [],
    weights: [],
    matchL: [],
    matchR: [],
    activePath: [],
    hoverEdge: null,
    message: "",
    mode: isExtend ? "weighted" : "basic",
    timer: null
  };
  let layoutScheduled = false;

  const BASIC_DATA = {
    volunteers: [
      { id: "V1", name: "小林", tag: "讲解" },
      { id: "V2", name: "小周", tag: "秩序" },
      { id: "V3", name: "小何", tag: "陪伴" },
      { id: "V4", name: "小陈", tag: "宣传" }
    ],
    posts: [
      { id: "P1", name: "社区讲解", tag: "表达" },
      { id: "P2", name: "秩序引导", tag: "组织" },
      { id: "P3", name: "长者陪伴", tag: "耐心" },
      { id: "P4", name: "海报宣传", tag: "设计" }
    ],
    weights: [
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [1, 0, 1, 0],
      [0, 0, 1, 1]
    ]
  };

  const EXTEND_SCENARIOS = {
    balanced: {
      label: "服务覆盖优先",
      volunteers: [
        { id: "V1", name: "林悦", tag: "讲解/组织" },
        { id: "V2", name: "周航", tag: "摄影/宣传" },
        { id: "V3", name: "何雨", tag: "护理/陪伴" },
        { id: "V4", name: "陈可", tag: "数据/调度" },
        { id: "V5", name: "许晴", tag: "外语/接待" }
      ],
      posts: [
        { id: "P1", name: "文明讲解", tag: "表达" },
        { id: "P2", name: "影像记录", tag: "摄影" },
        { id: "P3", name: "助老陪伴", tag: "照护" },
        { id: "P4", name: "物资登记", tag: "数据" },
        { id: "P5", name: "外宾接待", tag: "外语" }
      ],
      weights: [
        [5, 2, 1, 3, 1],
        [2, 5, 1, 2, 2],
        [1, 1, 5, 2, 1],
        [3, 2, 2, 5, 2],
        [2, 3, 1, 2, 5]
      ]
    },
    tight: {
      label: "热门岗位冲突",
      volunteers: [
        { id: "V1", name: "赵明", tag: "讲解" },
        { id: "V2", name: "孙宁", tag: "讲解" },
        { id: "V3", name: "王语", tag: "照护" },
        { id: "V4", name: "李然", tag: "宣传" },
        { id: "V5", name: "唐一", tag: "调度" },
        { id: "V6", name: "顾青", tag: "外语" }
      ],
      posts: [
        { id: "P1", name: "红色讲解", tag: "表达" },
        { id: "P2", name: "路线引导", tag: "秩序" },
        { id: "P3", name: "助老陪伴", tag: "照护" },
        { id: "P4", name: "素材剪辑", tag: "宣传" },
        { id: "P5", name: "外语接待", tag: "接待" }
      ],
      weights: [
        [5, 4, 1, 2, 0],
        [5, 3, 1, 1, 0],
        [1, 2, 5, 1, 0],
        [2, 1, 1, 5, 2],
        [2, 5, 2, 3, 1],
        [0, 2, 1, 2, 5]
      ]
    },
    support: {
      label: "结对帮扶迁移",
      volunteers: [
        { id: "V1", name: "师范队", tag: "辅导" },
        { id: "V2", name: "医护队", tag: "健康" },
        { id: "V3", name: "信息队", tag: "数字" },
        { id: "V4", name: "文体队", tag: "活动" },
        { id: "V5", name: "心理队", tag: "陪伴" }
      ],
      posts: [
        { id: "P1", name: "课业辅导", tag: "教育" },
        { id: "P2", name: "健康咨询", tag: "医疗" },
        { id: "P3", name: "设备维护", tag: "信息" },
        { id: "P4", name: "文体活动", tag: "组织" },
        { id: "P5", name: "心理陪伴", tag: "关怀" }
      ],
      weights: [
        [5, 1, 2, 3, 2],
        [1, 5, 1, 2, 3],
        [2, 1, 5, 2, 1],
        [3, 2, 2, 5, 2],
        [2, 3, 1, 2, 5]
      ]
    }
  };

  function injectStyle() {
    if (document.getElementById("vm-interactive-style")) return;
    const style = document.createElement("style");
    style.id = "vm-interactive-style";
    style.textContent = `
      .side-panel #controls.vm-controls {
        gap: 12px;
      }
      .vm-control-card {
        border: 1px solid rgba(116, 55, 31, 0.16);
        background: rgba(255, 255, 255, 0.68);
        border-radius: 8px;
        padding: 12px;
        display: grid;
        gap: 9px;
      }
      .vm-control-card label {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        color: #4e362d;
        font-weight: 900;
        font-size: 14px;
      }
      .vm-control-card label small {
        color: #9b7b6d;
        font-weight: 700;
      }
      .vm-control-card select,
      .vm-control-card input[type="range"] {
        width: 100%;
      }
      .vm-control-card select {
        border: 1px solid rgba(116, 55, 31, 0.2);
        border-radius: 8px;
        padding: 9px 10px;
        background: rgba(255, 253, 246, 0.96);
        color: #321f18;
        font: 700 14px "Noto Serif SC", "Microsoft YaHei", serif;
      }
      .vm-switch {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        color: #5e4338;
        font-weight: 800;
      }
      .vm-switch input {
        width: 18px;
        height: 18px;
        accent-color: #d63b1d;
      }
      .vm-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .vm-actions.vm-actions-extend {
        grid-template-columns: 1fr 1fr;
      }
      .vm-btn {
        min-height: 40px;
        border: 1px solid rgba(214, 59, 29, 0.22);
        border-radius: 8px;
        background: rgba(255, 250, 242, 0.94);
        color: #7b2417;
        font: 900 14px "Noto Serif SC", "Microsoft YaHei", serif;
        cursor: pointer;
        transition: transform .16s ease, background .16s ease, box-shadow .16s ease;
      }
      .vm-btn:hover {
        transform: translateY(-1px);
        background: #fff;
        box-shadow: 0 8px 20px rgba(69, 31, 15, 0.12);
      }
      .vm-btn.primary {
        background: #d63b1d;
        color: #fff;
      }
      .vm-btn.primary:hover {
        background: #942015;
      }
      .vm-tip {
        color: #5e4338;
        line-height: 1.65;
        font-size: 14px;
      }
      .vm-tip b {
        color: #d63b1d;
      }
      .logic-board.vm-board {
        grid-template-rows: minmax(0, 1fr);
        gap: 12px;
        min-height: 0;
        overflow: hidden;
      }
      .logic-board.vm-board .graph-canvas {
        height: 100%;
        min-height: 0;
        border: 1px solid rgba(116, 55, 31, 0.15);
        background:
          linear-gradient(rgba(116, 55, 31, 0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(116, 55, 31, 0.045) 1px, transparent 1px),
          rgba(255, 253, 246, 0.82);
        background-size: 34px 34px;
        cursor: pointer;
      }
      .logic-board.vm-board #vizText {
        display: none;
      }
      .vm-summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }
      .vm-card {
        border: 1px solid rgba(116, 55, 31, 0.13);
        border-radius: 8px;
        background: rgba(255, 250, 242, 0.8);
        padding: 10px 12px;
      }
      .vm-card span {
        display: block;
        color: #8b6b5d;
        font-size: 12px;
        font-weight: 800;
      }
      .vm-card strong {
        display: block;
        margin-top: 4px;
        color: #d63b1d;
        font: 900 20px "JetBrains Mono", Consolas, monospace;
      }
      .vm-card small {
        display: block;
        margin-top: 4px;
        color: #6b4a38;
        line-height: 1.4;
      }
      .vm-note {
        margin-top: 10px;
        color: #4e362d;
        line-height: 1.65;
      }
      .vm-note b {
        color: #d63b1d;
      }
      .vm-pill-row {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 10px;
      }
      .vm-pill {
        border-radius: 999px;
        border: 1px solid rgba(47, 125, 87, 0.2);
        background: rgba(47, 125, 87, 0.08);
        color: #2f7d57;
        padding: 4px 9px;
        font-size: 12px;
        font-weight: 900;
      }
      #resultExtra:empty {
        display: none;
      }
      @media (max-width: 920px) {
        .logic-board.vm-board {
          grid-template-rows: minmax(0, 1fr);
        }
        .logic-board.vm-board .graph-canvas {
          min-height: 0;
        }
        .vm-summary-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `;
    document.head.appendChild(style);
  }

  function setImportant(el, name, value) {
    if (!el) return;
    if (el.style.getPropertyValue(name) === value && el.style.getPropertyPriority(name) === "important") return;
    el.style.setProperty(name, value, "important");
  }

  function applyPageLayout() {
    layoutScheduled = false;
    const app = document.querySelector(".app-container");
    const side = document.querySelector(".side-panel");
    const main = document.querySelector(".app-container > main.glass-pane");
    const viz = document.getElementById("vizArea");
    const result = document.querySelector(".result-card");
    if (!app || !side || !main) return;
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

    [side, main].forEach(panel => {
      setImportant(panel, "min-height", "0");
      setImportant(panel, "max-height", compact ? "none" : "100%");
      setImportant(panel, "border-radius", "8px");
      setImportant(panel, "border", "1px solid rgba(116, 55, 31, 0.18)");
      setImportant(panel, "background", "rgba(255, 253, 246, 0.92)");
      setImportant(panel, "box-shadow", "0 18px 50px rgba(69, 31, 15, 0.14)");
    });
    setImportant(side, "grid-area", "side");
    setImportant(side, "width", "auto");
    setImportant(main, "grid-area", "main");
    setImportant(main, "overflow", "auto");
    setImportant(main, "display", "grid");
    setImportant(main, "grid-template-rows", "auto auto minmax(0, 1fr) auto");
    setImportant(main, "gap", "12px");

    if (viz) {
      setImportant(viz, "height", "auto");
      setImportant(viz, "min-height", "0");
      setImportant(viz, "overflow", "hidden");
      setImportant(viz, "grid-template-rows", "minmax(0, 1fr)");
    }
    if (result) {
      setImportant(result, "display", "grid");
      setImportant(result, "grid-template-columns", "minmax(0, 1fr) auto");
      setImportant(result, "gap", "8px");
      setImportant(result, "padding", "10px 14px");
      setImportant(result, "min-height", "0");
    }
  }

  function schedulePageLayout() {
    if (layoutScheduled) return;
    layoutScheduled = true;
    window.requestAnimationFrame(() => {
      applyPageLayout();
      render();
    });
  }

  function cloneData(data) {
    return {
      volunteers: data.volunteers.map(item => Object.assign({}, item)),
      posts: data.posts.map(item => Object.assign({}, item)),
      weights: data.weights.map(row => row.slice())
    };
  }

  function currentThreshold() {
    const el = document.getElementById("vmThreshold");
    return el ? Number(el.value) : 1;
  }

  function fairnessOn() {
    const el = document.getElementById("vmFair");
    return !!(el && el.checked);
  }

  function scenarioId() {
    const el = document.getElementById("vmScenario");
    return el ? el.value : "balanced";
  }

  function initState(data) {
    state.volunteers = data.volunteers;
    state.posts = data.posts;
    state.weights = data.weights;
    state.matchL = Array(state.volunteers.length).fill(-1);
    state.matchR = Array(state.posts.length).fill(-1);
    state.activePath = [];
    state.hoverEdge = null;
    state.message = isExtend ? "点击连线可调高偏好分值，也可把高分边降为不可选。" : "点击左右之间的连线，切换“能服务 / 不能服务”。";
  }

  function setupControls() {
    controls.classList.add("vm-controls");
    if (isExtend) {
      controls.innerHTML = `
        <div class="vm-control-card vm-ui">
          <label for="vmScenario"><span>任务场景</span><small>迁移应用</small></label>
          <select id="vmScenario">
            <option value="balanced">服务覆盖优先</option>
            <option value="tight">热门岗位冲突</option>
            <option value="support">结对帮扶迁移</option>
          </select>
        </div>
        <div class="vm-control-card vm-ui">
          <label for="vmThreshold"><span>最低偏好</span><small id="vmThresholdText">3 分以上</small></label>
          <input id="vmThreshold" type="range" min="1" max="5" step="1" value="3">
          <div class="vm-switch">
            <span>公平约束：优先照顾最低满意度</span>
            <input id="vmFair" type="checkbox" checked>
          </div>
        </div>
        <div class="vm-control-card vm-ui">
          <div class="vm-actions vm-actions-extend">
            <button class="vm-btn" id="vmStep" type="button">试配一步</button>
            <button class="vm-btn primary" id="vmAuto" type="button">自动匹配</button>
            <button class="vm-btn" id="vmOptimize" type="button">优化方案</button>
            <button class="vm-btn" id="vmReset" type="button">重置</button>
          </div>
        </div>
        <div class="vm-control-card vm-tip">
          <b>拓展任务：</b>同样先保证覆盖，再比较总偏好、最低偏好和未满足对象，理解“最大匹配”到“最优指派”的迁移。
        </div>
      `;
    } else {
      controls.innerHTML = `
        <div class="vm-control-card vm-tip vm-ui">
          <b>基础任务：</b>左边是志愿者，右边是服务岗位；有线表示“能服务”。点击连线增删关系，再一步步观察配对如何形成。
        </div>
        <div class="vm-control-card vm-ui">
          <div class="vm-actions">
            <button class="vm-btn" id="vmStep" type="button">试配一步</button>
            <button class="vm-btn primary" id="vmAuto" type="button">自动配完</button>
            <button class="vm-btn" id="vmReset" type="button">重置</button>
            <button class="vm-btn" id="vmClear" type="button">清空配对</button>
          </div>
        </div>
      `;
    }

    controls.addEventListener("input", interceptOldRenderer, true);
    controls.addEventListener("change", interceptOldRenderer, true);
    document.getElementById("vmStep").addEventListener("click", stepOnce);
    document.getElementById("vmAuto").addEventListener("click", runAuto);
    document.getElementById("vmReset").addEventListener("click", resetScenario);
    const clearBtn = document.getElementById("vmClear");
    if (clearBtn) clearBtn.addEventListener("click", clearMatching);
    const optimizeBtn = document.getElementById("vmOptimize");
    if (optimizeBtn) optimizeBtn.addEventListener("click", optimizeWeighted);
    const threshold = document.getElementById("vmThreshold");
    if (threshold) threshold.addEventListener("input", updateThresholdLabel);
    const scenario = document.getElementById("vmScenario");
    if (scenario) scenario.addEventListener("change", resetScenario);
    const fair = document.getElementById("vmFair");
    if (fair) fair.addEventListener("change", () => {
      state.message = fair.checked ? "公平约束已开启：同等覆盖下会优先提高最低偏好。" : "公平约束已关闭：同等覆盖下优先追求总满意度。";
      render();
    });
  }

  function interceptOldRenderer(event) {
    if (event.target && event.target.closest(".vm-ui")) {
      event.stopImmediatePropagation();
      if (event.type === "input" && event.target.id === "vmThreshold") {
        updateThresholdLabel();
      } else if (event.type === "change" && event.target.id === "vmScenario") {
        resetScenario();
      } else if (event.type === "change" && event.target.id === "vmFair") {
        state.message = event.target.checked ? "公平约束已开启：同等覆盖下会优先提高最低偏好。" : "公平约束已关闭：同等覆盖下优先追求总满意度。";
        render();
      }
    }
  }

  function updateThresholdLabel() {
    const label = document.getElementById("vmThresholdText");
    if (label) label.textContent = currentThreshold() + " 分以上";
    clearMatching(false);
    state.message = "阈值改变后，低于最低偏好的边暂不参与匹配。";
    render();
  }

  function resetScenario() {
    stopTimer();
    const data = isExtend ? cloneData(EXTEND_SCENARIOS[scenarioId()]) : cloneData(BASIC_DATA);
    initState(data);
    updateThresholdLabelOnly();
    render();
  }

  function updateThresholdLabelOnly() {
    const label = document.getElementById("vmThresholdText");
    if (label) label.textContent = currentThreshold() + " 分以上";
  }

  function clearMatching(shouldRender = true) {
    stopTimer();
    state.matchL = Array(state.volunteers.length).fill(-1);
    state.matchR = Array(state.posts.length).fill(-1);
    state.activePath = [];
    if (shouldRender) {
      state.message = "已清空当前配对，可以从第一步重新观察。";
      render();
    }
  }

  function stopTimer() {
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = null;
    }
  }

  function edgeAllowed(i, j) {
    const weight = state.weights[i] && state.weights[i][j] ? state.weights[i][j] : 0;
    return isExtend ? weight >= currentThreshold() : weight > 0;
  }

  function candidatePosts(i) {
    const items = [];
    for (let j = 0; j < state.posts.length; j++) {
      if (!edgeAllowed(i, j)) continue;
      items.push({ j, weight: state.weights[i][j] });
    }
    items.sort((a, b) => {
      if (!isExtend) return a.j - b.j;
      if (b.weight !== a.weight) return b.weight - a.weight;
      return a.j - b.j;
    });
    return items.map(item => item.j);
  }

  function findAugmentingPath(start, seenPosts, route) {
    const posts = candidatePosts(start);
    for (let k = 0; k < posts.length; k++) {
      const j = posts[k];
      if (seenPosts[j]) continue;
      seenPosts[j] = true;
      const nextRoute = route.concat([{ u: start, j }]);
      const occupiedBy = state.matchR[j];
      if (occupiedBy === -1) return nextRoute;
      const path = findAugmentingPath(occupiedBy, seenPosts, nextRoute);
      if (path) return path;
    }
    return null;
  }

  function applyPath(path) {
    path.forEach(edge => {
      state.matchL[edge.u] = edge.j;
      state.matchR[edge.j] = edge.u;
    });
    state.activePath = path;
  }

  function stepOnce(fromTimer) {
    if (fromTimer !== true) stopTimer();
    const path = findNextPath();
    if (!path) {
      state.activePath = [];
      state.message = "没有新的可增广路径，当前配对已经稳定。";
      render();
      return false;
    }
    applyPath(path);
    const first = state.volunteers[path[0].u].name;
    const last = state.posts[path[path.length - 1].j].name;
    state.message = "本步从 " + first + " 出发，沿可行边调整到 " + last + "。";
    render();
    return true;
  }

  function findNextPath() {
    for (let i = 0; i < state.volunteers.length; i++) {
      if (state.matchL[i] !== -1) continue;
      const path = findAugmentingPath(i, Array(state.posts.length).fill(false), []);
      if (path) return path;
    }
    return null;
  }

  function runAuto() {
    stopTimer();
    const delay = isExtend ? 560 : 650;
    if (!stepOnce(true)) return;
    state.timer = window.setInterval(() => {
      if (!stepOnce(true)) stopTimer();
    }, delay);
  }

  function optimizeWeighted() {
    stopTimer();
    if (!isExtend) {
      runAuto();
      return;
    }
    const best = solveWeighted();
    state.matchL = Array(state.volunteers.length).fill(-1);
    state.matchR = Array(state.posts.length).fill(-1);
    best.pairs.forEach(pair => {
      state.matchL[pair.u] = pair.j;
      state.matchR[pair.j] = pair.u;
    });
    state.activePath = best.pairs.map(pair => ({ u: pair.u, j: pair.j }));
    state.message = "已按覆盖、满意度和公平约束计算优化方案。";
    render();
  }

  function solveWeighted() {
    const threshold = currentThreshold();
    const fair = fairnessOn();
    let best = { pairs: [], count: -1, score: -Infinity, min: -Infinity, spread: Infinity };

    function scorePairs(pairs) {
      if (!pairs.length) return { count: 0, score: 0, min: 0, spread: 0 };
      const scores = pairs.map(pair => state.weights[pair.u][pair.j]);
      const total = scores.reduce((sum, value) => sum + value, 0);
      const min = Math.min.apply(null, scores);
      const max = Math.max.apply(null, scores);
      return { count: pairs.length, score: total, min, spread: max - min };
    }

    function better(a, b) {
      if (a.count !== b.count) return a.count > b.count;
      if (fair && a.min !== b.min) return a.min > b.min;
      if (a.score !== b.score) return a.score > b.score;
      if (fair && a.spread !== b.spread) return a.spread < b.spread;
      return false;
    }

    function dfs(u, usedPosts, pairs) {
      if (u === state.volunteers.length) {
        const current = scorePairs(pairs);
        if (better(current, best)) {
          best = Object.assign({ pairs: pairs.slice() }, current);
        }
        return;
      }
      const candidates = [];
      for (let j = 0; j < state.posts.length; j++) {
        const weight = state.weights[u][j] || 0;
        if (!usedPosts[j] && weight >= threshold) candidates.push({ j, weight });
      }
      candidates.sort((a, b) => b.weight - a.weight || a.j - b.j);
      candidates.forEach(item => {
        usedPosts[item.j] = true;
        pairs.push({ u, j: item.j });
        dfs(u + 1, usedPosts, pairs);
        pairs.pop();
        usedPosts[item.j] = false;
      });
      dfs(u + 1, usedPosts, pairs);
    }

    dfs(0, Array(state.posts.length).fill(false), []);
    return best;
  }

  function currentPairs() {
    const pairs = [];
    for (let i = 0; i < state.matchL.length; i++) {
      if (state.matchL[i] !== -1) pairs.push({ u: i, j: state.matchL[i] });
    }
    return pairs;
  }

  function metrics() {
    const pairs = currentPairs();
    const score = pairs.reduce((sum, pair) => sum + (state.weights[pair.u][pair.j] || 0), 0);
    const scores = pairs.map(pair => state.weights[pair.u][pair.j] || 0);
    const minScore = scores.length ? Math.min.apply(null, scores) : 0;
    const avg = pairs.length ? score / pairs.length : 0;
    const target = Math.min(state.volunteers.length, state.posts.length);
    const unmatchedVolunteers = state.volunteers
      .filter((_, index) => state.matchL[index] === -1)
      .map(item => item.name);
    const unmatchedPosts = state.posts
      .filter((_, index) => state.matchR[index] === -1)
      .map(item => item.name);
    return { pairs, count: pairs.length, target, score, avg, minScore, unmatchedVolunteers, unmatchedPosts };
  }

  function render() {
    resizeCanvas();
    drawScene();
    renderText();
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(560, Math.floor(rect.width || 760));
    const height = Math.max(240, Math.floor(rect.height || 320));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function canvasSize() {
    return {
      w: canvas.width / (window.devicePixelRatio || 1),
      h: canvas.height / (window.devicePixelRatio || 1)
    };
  }

  function layout() {
    const { w, h } = canvasSize();
    const compact = h < 340;
    const top = compact ? 56 : 70;
    const bottom = compact ? 44 : 56;
    const leftX = Math.max(118, w * 0.22);
    const rightX = Math.min(w - 118, w * 0.78);
    return {
      volunteers: state.volunteers.map((_, i) => ({
        x: leftX,
        y: top + i * (h - top - bottom) / Math.max(1, state.volunteers.length - 1)
      })),
      posts: state.posts.map((_, i) => ({
        x: rightX,
        y: top + i * (h - top - bottom) / Math.max(1, state.posts.length - 1)
      }))
    };
  }

  function drawScene() {
    const { w, h } = canvasSize();
    ctx.clearRect(0, 0, w, h);
    drawBackdrop(w, h);
    const pos = layout();
    drawColumnTitle("志愿者 U", pos.volunteers[0].x, 36, "#d63b1d");
    drawColumnTitle(isExtend ? "服务需求 W" : "服务岗位 W", pos.posts[0].x, 36, "#2f7d57");
    drawMiddleTitle(w / 2, 36);
    drawEdges(pos);
    drawNodes(pos.volunteers, state.volunteers, "volunteer");
    drawNodes(pos.posts, state.posts, "post");
    drawHint(w, h);
  }

  function drawBackdrop(w, h) {
    ctx.save();
    ctx.fillStyle = "rgba(255, 253, 246, 0.72)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(116, 55, 31, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 34) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 34) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawColumnTitle(text, x, y, color) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.font = "900 18px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function drawMiddleTitle(x, y) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#7c6257";
    ctx.font = "800 13px 'JetBrains Mono', Consolas, monospace";
    ctx.fillText(isExtend ? "weight + matching" : "can serve -> match", x, y);
    ctx.restore();
  }

  function drawEdges(pos) {
    const matched = new Set(currentPairs().map(pair => pair.u + "-" + pair.j));
    const active = new Set(state.activePath.map(edge => edge.u + "-" + edge.j));
    const box = nodeBox();
    for (let i = 0; i < state.volunteers.length; i++) {
      for (let j = 0; j < state.posts.length; j++) {
        const weight = state.weights[i][j] || 0;
        const isHover = state.hoverEdge && state.hoverEdge.u === i && state.hoverEdge.j === j;
        const isMatched = matched.has(i + "-" + j);
        const isActive = active.has(i + "-" + j);
        if (!weight && !isHover) continue;
        const a = pos.volunteers[i];
        const b = pos.posts[j];
        const allowed = edgeAllowed(i, j);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(a.x + box.w / 2, a.y);
        ctx.bezierCurveTo(a.x + 178, a.y, b.x - 178, b.y, b.x - box.w / 2, b.y);
        if (isMatched) {
          ctx.strokeStyle = "#2f7d57";
          ctx.lineWidth = 4.2;
        } else if (isActive) {
          ctx.strokeStyle = "#c58a1f";
          ctx.lineWidth = 3.4;
          ctx.setLineDash([8, 5]);
        } else if (!allowed) {
          ctx.strokeStyle = "rgba(116, 55, 31, 0.12)";
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 5]);
        } else {
          ctx.strokeStyle = isExtend ? "rgba(47, 95, 159, 0.36)" : "rgba(47, 95, 159, 0.45)";
          ctx.lineWidth = isExtend ? 1.2 + weight * 0.35 : 2;
        }
        if (isHover) {
          ctx.strokeStyle = "#d63b1d";
          ctx.lineWidth = Math.max(ctx.lineWidth, 3.5);
        }
        ctx.stroke();
        ctx.restore();
        if (isExtend && weight) drawWeightLabel(a, b, weight, isMatched || isHover, allowed);
      }
    }
  }

  function drawWeightLabel(a, b, weight, hot, allowed) {
    const x = (a.x + b.x) / 2;
    const y = (a.y + b.y) / 2;
    ctx.save();
    ctx.fillStyle = hot ? "#d63b1d" : allowed ? "#2f5f9f" : "#aa9a91";
    ctx.strokeStyle = "rgba(255, 253, 246, 0.9)";
    ctx.lineWidth = 4;
    ctx.font = "900 12px 'JetBrains Mono', Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(String(weight), x, y);
    ctx.fillText(String(weight), x, y);
    ctx.restore();
  }

  function drawNodes(points, items, type) {
    const box = nodeBox();
    points.forEach((point, index) => {
      const matchedIndex = type === "volunteer" ? state.matchL[index] : state.matchR[index];
      const matched = matchedIndex !== -1;
      const color = type === "volunteer" ? "#d63b1d" : "#2f7d57";
      const soft = type === "volunteer" ? "rgba(214, 59, 29, 0.10)" : "rgba(47, 125, 87, 0.10)";
      const item = items[index];
      const circleX = point.x - box.w / 2 + box.circleOffset;
      const textX = circleX + box.textOffset;
      ctx.save();
      roundRect(point.x - box.w / 2, point.y - box.h / 2, box.w, box.h, 8);
      ctx.fillStyle = matched ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 253, 246, 0.92)";
      ctx.fill();
      ctx.strokeStyle = matched ? color : "rgba(116, 55, 31, 0.14)";
      ctx.lineWidth = matched ? 2.6 : 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(circleX, point.y, box.circle, 0, Math.PI * 2);
      ctx.fillStyle = matched ? color : soft;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = matched ? "#fff" : color;
      ctx.font = "900 " + box.idFont + "px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.id, circleX, point.y);
      ctx.textAlign = "left";
      ctx.fillStyle = "#2f231f";
      ctx.font = "900 " + box.nameFont + "px 'Noto Serif SC', 'Microsoft YaHei', serif";
      ctx.fillText(item.name, textX, point.y - box.nameDy);
      ctx.fillStyle = "#8b6b5d";
      ctx.font = "800 " + box.tagFont + "px 'Noto Serif SC', 'Microsoft YaHei', serif";
      ctx.fillText(item.tag, textX, point.y + box.tagDy);
      ctx.restore();
    });
  }

  function nodeBox() {
    const { h } = canvasSize();
    if (h < 340) {
      return { w: 150, h: 40, circle: 13, circleOffset: 22, textOffset: 20, idFont: 10, nameFont: 13, tagFont: 10, nameDy: 5, tagDy: 10 };
    }
    return { w: 172, h: 52, circle: 17, circleOffset: 27, textOffset: 24, idFont: 12, nameFont: 15, tagFont: 12, nameDy: 7, tagDy: 12 };
  }

  function drawHint(w, h) {
    if (h < 280) return;
    ctx.save();
    const m = metrics();
    const text = isExtend
      ? "点击任意两侧之间的关系线：0 -> 3 -> 4 -> 5 -> 0，调整偏好强度"
      : "点击任意两侧之间的关系线：增删可服务关系";
    ctx.fillStyle = "rgba(255, 250, 242, 0.9)";
    roundRect(18, h - 46, w - 36, 28, 8);
    ctx.fill();
    ctx.fillStyle = m.count === m.target ? "#2f7d57" : "#7c6257";
    ctx.font = "800 13px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h - 32);
    ctx.restore();
  }

  function roundRect(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function renderText() {
    const m = metrics();
    const unmatchedLeft = m.unmatchedVolunteers.length ? m.unmatchedVolunteers.join("、") : "无";
    const unmatchedRight = m.unmatchedPosts.length ? m.unmatchedPosts.join("、") : "无";
    const cards = isExtend
      ? [
          ["已配对", m.count + "/" + m.target, "覆盖优先"],
          ["总偏好", String(m.score), "越高越满意"],
          ["平均偏好", m.avg.toFixed(1), "当前阈值 " + currentThreshold()],
          ["最低偏好", String(m.minScore), fairnessOn() ? "公平约束开启" : "公平约束关闭"]
        ]
      : [
          ["已配对", m.count + "/" + m.target, "看红绿高亮边"],
          ["未配志愿者", String(m.unmatchedVolunteers.length), unmatchedLeft],
          ["空缺岗位", String(m.unmatchedPosts.length), unmatchedRight],
          ["可服务边", String(countAllowedEdges()), "点击图中连线调整"]
        ];
    vizText.innerHTML = `
      <div class="vm-summary-grid">
        ${cards.map(card => `<div class="vm-card"><span>${escapeHtml(card[0])}</span><strong>${escapeHtml(card[1])}</strong><small>${escapeHtml(card[2])}</small></div>`).join("")}
      </div>
      <div class="vm-note"><b>互动反馈：</b>${escapeHtml(state.message)}<div class="vm-pill-row">${currentPairs().map(pair => `<span class="vm-pill">${escapeHtml(state.volunteers[pair.u].name)} -> ${escapeHtml(state.posts[pair.j].name)}</span>`).join("") || '<span class="vm-pill">尚未开始配对</span>'}</div></div>
    `;
    formulaText.textContent = isExtend
      ? "目标：先最大化配对数，再比较偏好得分"
      : "目标：让尽可能多的志愿者与岗位一一配对";
    const done = m.count === m.target;
    resultValue.innerHTML = `<span class="truth-chip${done ? "" : " false"}">${done ? "覆盖完成" : "继续调整"}</span>`;
    resultExtra.textContent = isExtend
      ? "未配志愿者：" + unmatchedLeft + "；空缺需求：" + unmatchedRight + "。"
      : "从“能不能服务”的关系出发，逐步形成二部图匹配。";
  }

  function countAllowedEdges() {
    let count = 0;
    for (let i = 0; i < state.volunteers.length; i++) {
      for (let j = 0; j < state.posts.length; j++) {
        if (edgeAllowed(i, j)) count++;
      }
    }
    return count;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function nearestEdge(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const pos = layout();
    const box = nodeBox();
    let best = null;
    let bestDistance = Infinity;
    for (let i = 0; i < state.volunteers.length; i++) {
      for (let j = 0; j < state.posts.length; j++) {
        const a = pos.volunteers[i];
        const b = pos.posts[j];
        const distance = pointToSegmentDistance(x, y, a.x + box.w / 2, a.y, b.x - box.w / 2, b.y);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = { u: i, j };
        }
      }
    }
    return bestDistance <= 16 ? best : null;
  }

  function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
    const x = x1 + t * dx;
    const y = y1 + t * dy;
    return Math.hypot(px - x, py - y);
  }

  function onCanvasClick(event) {
    stopTimer();
    const edge = nearestEdge(event);
    if (!edge) return;
    const current = state.weights[edge.u][edge.j] || 0;
    if (isExtend) {
      state.weights[edge.u][edge.j] = current === 0 ? 3 : current < 5 ? current + 1 : 0;
      state.message = state.volunteers[edge.u].name + " 与 " + state.posts[edge.j].name + " 的偏好调整为 " + state.weights[edge.u][edge.j] + "。";
    } else {
      state.weights[edge.u][edge.j] = current ? 0 : 1;
      state.message = state.volunteers[edge.u].name + " 与 " + state.posts[edge.j].name + (state.weights[edge.u][edge.j] ? " 已建立可服务关系。" : " 已取消可服务关系。");
    }
    clearMatching(false);
    render();
  }

  function onCanvasMove(event) {
    const edge = nearestEdge(event);
    const same = (!edge && !state.hoverEdge) || (edge && state.hoverEdge && edge.u === state.hoverEdge.u && edge.j === state.hoverEdge.j);
    if (same) return;
    state.hoverEdge = edge;
    render();
  }

  function init() {
    injectStyle();
    document.getElementById("vizArea").classList.add("vm-board");
    setupControls();
    initState(isExtend ? cloneData(EXTEND_SCENARIOS.balanced) : cloneData(BASIC_DATA));
    applyPageLayout();
    window.setTimeout(applyPageLayout, 0);
    window.setTimeout(() => { applyPageLayout(); render(); }, 120);
    window.setTimeout(() => { applyPageLayout(); render(); }, 500);
    canvas.addEventListener("click", onCanvasClick);
    canvas.addEventListener("mousemove", onCanvasMove);
    canvas.addEventListener("mouseleave", () => {
      state.hoverEdge = null;
      render();
    });
    window.addEventListener("resize", () => {
      applyPageLayout();
      render();
    });
    const app = document.querySelector(".app-container");
    if (app) {
      new MutationObserver(schedulePageLayout).observe(app, { attributes: true, attributeFilter: ["style", "class"] });
    }
    render();
    window.__volunteerMatchingInteractive = { state, stepOnce, runAuto, resetScenario, optimizeWeighted };
  }

  init();
})();
