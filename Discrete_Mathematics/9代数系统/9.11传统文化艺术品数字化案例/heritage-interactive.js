(function () {
  "use strict";

  const LEVELS = {
    basic: {
      label: "基础层",
      title: "传统艺术品数字化入门",
      subtitle: "艺术品数字编码台",
      intro: "以少量参数把纹样、材质、年代转成可检索编码，先看清“对象怎样被数学化”。",
      mission: "从单件艺术品出发，完成采集、编码、检索三步，观察每一步怎样改变右侧图形与公式项。",
      badge: "少参数 · 三步闭环",
      map: ["对象识别", "向量编码", "相似检索"],
      controls: [
        { id: "artifact", type: "select", label: "艺术品样本", hint: "对象", value: "bronze", options: [["bronze", "青铜纹样"], ["porcelain", "瓷器缠枝纹"], ["paper", "剪纸团花"]] },
        { id: "motifs", type: "range", label: "纹样元素", hint: "元素数", min: 3, max: 8, step: 1, value: 5 },
        { id: "material", type: "select", label: "材质标签", hint: "属性", value: "metal", options: [["metal", "金属"], ["ceramic", "陶瓷"], ["paper", "纸艺"], ["textile", "织物"]] },
        { id: "era", type: "select", label: "年代区间", hint: "属性", value: "ming", options: [["han", "汉唐"], ["song", "宋元"], ["ming", "明清"], ["modern", "近现代"]] },
        { id: "threshold", type: "range", label: "检索阈值", hint: "θ", min: 45, max: 90, step: 5, value: 65 }
      ],
      steps: [
        {
          title: "采集元素",
          desc: "把一件作品拆成若干可记录的结构点。",
          formula: () => terms(["x", " = {", "纹样", ", ", "材质", ", ", "年代", "}"], ["x", "motif", "material", "era"]),
          focus: "motif"
        },
        {
          title: "生成编码",
          desc: "把结构点写成一个小向量。",
          formula: () => terms(["c(x)", " = (", "p", ", ", "m", ", ", "t", ")"], ["encode", "pattern", "material", "time"]),
          focus: "encode"
        },
        {
          title: "相似检索",
          desc: "用阈值筛出相近作品。",
          formula: () => terms(["sim", "(", "x", ", ", "y", ") ≥ ", "θ"], ["sim", "x", "y", "theta"]),
          focus: "theta"
        }
      ]
    },
    advanced: {
      label: "进阶层",
      title: "变换群刻画纹样结构",
      subtitle: "对称群与同构映射实验台",
      intro: "在基础编码之上加入旋转、翻折与组合运算，观察群结构如何保持纹样风格。",
      mission: "选择变换、组合运算并映射到向量空间；每次调整都会同步高亮公式项和图形结构。",
      badge: "变换群 · 同构映射",
      map: ["纹样对象", "变换群", "组合运算", "同构映射"],
      controls: [
        { id: "artifact", type: "select", label: "纹样对象", hint: "A", value: "porcelain", options: [["bronze", "青铜回纹"], ["porcelain", "瓷器缠枝纹"], ["paper", "剪纸团花"], ["textile", "织锦连续纹"]] },
        { id: "group", type: "select", label: "变换集合", hint: "G", value: "D4", options: [["C4", "C4 旋转群"], ["D4", "D4 方形对称群"]] },
        { id: "opA", type: "select", label: "第一变换 a", hint: "外层", value: "r", options: opOptions() },
        { id: "opB", type: "select", label: "第二变换 b", hint: "内层", value: "s", options: opOptions() },
        { id: "featureWeight", type: "range", label: "结构权重", hint: "α", min: 40, max: 90, step: 5, value: 70 },
        { id: "fidelity", type: "range", label: "风格保持", hint: "ρ", min: 45, max: 100, step: 5, value: 80 }
      ],
      steps: [
        {
          title: "确定对象",
          desc: "把纹样看作待变换的结构对象。",
          formula: () => terms(["A", " = {", "x", " | x 为纹样单元 }"], ["A", "x"]),
          focus: "A"
        },
        {
          title: "定义变换群",
          desc: "列出可保持风格的旋转与翻折。",
          formula: state => {
            const n = state.controls.group === "C4" ? "4" : "4, s²=e";
            return terms(["G", " = < ", "r", ", ", "s", " | r^", n, " >"], ["G", "r", "s"]);
          },
          focus: "G"
        },
        {
          title: "组合变换",
          desc: "先做 b，再做 a，观察合成结果。",
          formula: () => terms(["(", "a", " ∘ ", "b", ")(", "x", ") = ", "a", "(", "b", "(", "x", "))"], ["a", "b", "x", "compose", "a", "b", "x"]),
          focus: "compose"
        },
        {
          title: "同构映射",
          desc: "把图形结构映射到可计算向量。",
          formula: () => terms(["φ", " : (", "A", ", ∘) → (", "V", ", +),  ", "sim", " = cos(φx, φy)"], ["phi", "A", "V", "sim"]),
          focus: "phi"
        }
      ]
    },
    extend: {
      label: "拓展层",
      title: "文物知识图谱与再创闭环",
      subtitle: "开放共享与生成评估工作台",
      intro: "把单件编码扩展为知识网络，再加入生成、传播、评估，让数学模型服务真实应用场景。",
      mission: "构建知识图谱、设置相似边、生成新纹样并评估传播反馈，体验从保存到应用的完整链路。",
      badge: "多指标 · 五步闭环",
      map: ["知识节点", "关系权重", "再创生成", "传播反馈", "闭环评估"],
      controls: [
        { id: "artifact", type: "select", label: "核心藏品", hint: "中心点", value: "textile", options: [["bronze", "青铜纹饰"], ["porcelain", "瓷器纹饰"], ["paper", "民间剪纸"], ["textile", "织锦纹样"]] },
        { id: "nodes", type: "range", label: "知识节点", hint: "|V|", min: 5, max: 10, step: 1, value: 7 },
        { id: "edgeThreshold", type: "range", label: "关系阈值", hint: "θ", min: 35, max: 85, step: 5, value: 60 },
        { id: "openLevel", type: "range", label: "开放等级", hint: "O", min: 30, max: 100, step: 5, value: 75 },
        { id: "reviewBalance", type: "range", label: "审核强度", hint: "R", min: 35, max: 100, step: 5, value: 80 },
        { id: "audience", type: "select", label: "传播场景", hint: "场景", value: "museum", options: [["museum", "博物馆导览"], ["classroom", "课堂研学"], ["creative", "文创设计"], ["archive", "公共档案"]] }
      ],
      steps: [
        {
          title: "构建图谱",
          desc: "把作品、纹样、工艺与出处连成节点。",
          formula: () => terms(["K", " = (", "V", ", ", "E", ", ", "L", ")"], ["K", "V", "E", "L"]),
          focus: "V"
        },
        {
          title: "计算关系",
          desc: "用相似度与传承线索给边赋权。",
          formula: () => terms(["wᵢⱼ", " = α·", "sim", " + β·", "lineage", ",  wᵢⱼ ≥ ", "θ"], ["w", "sim", "lineage", "theta"]),
          focus: "w"
        },
        {
          title: "再创生成",
          desc: "在规则约束下生成新纹样候选。",
          formula: () => terms(["g'", " = ", "τ", "(", "g", "),  ", "review", "(", "g'", ")=1"], ["new", "tau", "g", "review", "new"]),
          focus: "tau"
        },
        {
          title: "传播反馈",
          desc: "不同场景带回不同反馈数据。",
          formula: () => terms(["R", " = ", "channels", " × ", "feedback"], ["R", "channels", "feedback"]),
          focus: "channels"
        },
        {
          title: "闭环评估",
          desc: "平衡守真、创新与公共传播。",
          formula: () => terms(["Q", " = 0.40", "S", " + 0.35", "R", " + 0.25", "C"], ["Q", "S", "R", "C"]),
          focus: "Q"
        }
      ]
    }
  };

  const ART = {
    bronze: { label: "青铜纹饰", color: "#8a6f40", accent: "#2f5f9f", era: 0.78 },
    porcelain: { label: "瓷器纹饰", color: "#2f5f9f", accent: "#d63b1d", era: 0.86 },
    paper: { label: "民间剪纸", color: "#d63b1d", accent: "#c58a1f", era: 0.69 },
    textile: { label: "织锦纹样", color: "#2f7d57", accent: "#c58a1f", era: 0.82 }
  };

  const MATERIAL_SCORE = { metal: 0.82, ceramic: 0.76, paper: 0.64, textile: 0.79 };
  const ERA_SCORE = { han: 0.92, song: 0.84, ming: 0.78, modern: 0.58 };
  const state = {
    level: "",
    step: 0,
    term: "",
    controls: {}
  };

  const TIER_QUIET_KEY = "heritage_layer_nav_quiet_until";
  const TIER_RESTORE_ONBOARD_KEY = "heritage_restore_dm_onboard_seen";
  const DM_ONBOARD_KEY = "dm_onboard_seen";

  installTierNavigationQuieting();

  const app = document.getElementById("heritageApp");
  const levelName = (window.HERITAGE_LEVEL || (app && app.dataset.level) || "advanced").trim();
  const config = LEVELS[levelName] || LEVELS.advanced;
  state.level = levelName in LEVELS ? levelName : "advanced";

  let refs = {};

  function opOptions() {
    return [["e", "e 恒等"], ["r", "r 旋转90°"], ["r2", "r² 旋转180°"], ["r3", "r³ 旋转270°"], ["s", "s 镜像"], ["sr", "sr 镜像后旋转"], ["sr2", "sr² 镜像后旋转"], ["sr3", "sr³ 镜像后旋转"]];
  }

  function terms(parts, ids) {
    let cursor = 0;
    return parts.map(part => {
      if (ids[cursor] && !/^[\s,=():|<>+\-.·×≥]+$/.test(part) && !part.includes("| r^")) {
        const item = { id: ids[cursor], text: part };
        cursor += 1;
        return item;
      }
      return part;
    });
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function init() {
    config.controls.forEach(control => {
      state.controls[control.id] = control.value;
    });

    app.className = "app-container app-shell";
    app.setAttribute("data-dm-side-shell", "1");
    app.innerHTML = [
      '<aside class="side-panel sidebar">',
      '  <div class="sidebar-header">',
      '    <div class="window-controls"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>',
      '    <h1>传统艺术品 <span class="highlight">' + esc(config.label) + '</span></h1>',
      '    <p class="subtitle">' + esc(config.subtitle) + '</p>',
      '  </div>',
      '  <p class="intro">' + esc(config.intro) + '</p>',
      '  <div class="level-map" id="levelMap"></div>',
      '  <div class="step-list" id="stepList"></div>',
      '  <div class="control-stack" id="controls"></div>',
      '</aside>',
      '<main class="stage-panel visualizer-stage">',
      '  <div class="stage-top">',
      '    <section class="mission-card">',
      '      <span><b>互动任务：</b>' + esc(config.mission) + '</span>',
      '      <div class="visual-badge">' + esc(config.badge) + '</div>',
      '    </section>',
      '    <button class="stage-action" id="nextStep" type="button">下一步</button>',
      '  </div>',
      '  <section class="logic-board" id="vizArea">',
      '    <canvas id="graphCanvas" class="graph-canvas" aria-label="艺术品数字化互动图"></canvas>',
      '    <div class="viz-text">',
      '      <div class="formula-card"><strong>当前公式</strong><div class="formula-line" id="formulaLine"></div></div>',
      '      <div class="feedback-card"><strong id="feedbackTitle">反馈</strong><div class="feedback-text" id="feedbackText"></div><div class="chip-row" id="chipRow"></div></div>',
      '    </div>',
      '  </section>',
      '</main>'
    ].join("");

    refs = {
      levelMap: document.getElementById("levelMap"),
      stepList: document.getElementById("stepList"),
      controls: document.getElementById("controls"),
      nextStep: document.getElementById("nextStep"),
      canvas: document.getElementById("graphCanvas"),
      formulaLine: document.getElementById("formulaLine"),
      feedbackTitle: document.getElementById("feedbackTitle"),
      feedbackText: document.getElementById("feedbackText"),
      chipRow: document.getElementById("chipRow"),
      vizArea: document.getElementById("vizArea")
    };

    renderLevelMap();
    renderSteps();
    renderControls();
    bindEvents();
    setStep(0);
    scheduleFrameSync();
  }

  function isQuietNavigation() {
    try {
      return Number(sessionStorage.getItem(TIER_QUIET_KEY) || 0) > Date.now();
    } catch (err) {
      return false;
    }
  }

  function suppressOnboardOnce() {
    try {
      if (!localStorage.getItem(DM_ONBOARD_KEY)) {
        sessionStorage.setItem(TIER_RESTORE_ONBOARD_KEY, "1");
        localStorage.setItem(DM_ONBOARD_KEY, "1");
      }
    } catch (err) {}
  }

  function restoreOnboardFlag() {
    try {
      if (sessionStorage.getItem(TIER_RESTORE_ONBOARD_KEY) === "1") {
        sessionStorage.removeItem(TIER_RESTORE_ONBOARD_KEY);
        localStorage.removeItem(DM_ONBOARD_KEY);
      }
    } catch (err) {}
  }

  function injectTierQuietStyle() {
    let style = document.getElementById("heritage-tier-quiet-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "heritage-tier-quiet-style";
      style.textContent = [
        "@view-transition { navigation: none; }",
        "#dm-assist-root { view-transition-name: none; }",
        "html.heritage-layer-nav-quiet #dm-onboard { display: none !important; }",
        "html.heritage-layer-nav-quiet #dm-assist-root,",
        "html.heritage-layer-nav-quiet #dm-assist-root * {",
        "  animation: none !important;",
        "  transition: none !important;",
        "}"
      ].join("\n");
    }
    document.head.appendChild(style);
  }

  function armTierQuietMode(duration) {
    try {
      sessionStorage.setItem(TIER_QUIET_KEY, String(Date.now() + duration));
    } catch (err) {}
    document.documentElement.classList.add("heritage-layer-nav-quiet");
    suppressOnboardOnce();
    injectTierQuietStyle();
  }

  function installTierNavigationQuieting() {
    injectTierQuietStyle();
    [0, 80, 420, 900].forEach(delay => window.setTimeout(injectTierQuietStyle, delay));

    if (isQuietNavigation()) {
      document.documentElement.classList.add("heritage-layer-nav-quiet");
      suppressOnboardOnce();
      window.setTimeout(function () {
        document.documentElement.classList.remove("heritage-layer-nav-quiet");
        restoreOnboardFlag();
      }, 1800);
    }

    document.addEventListener("click", function (event) {
      const link = event.target && event.target.closest ? event.target.closest("#dm-page-layers a.dm-tier-btn[href]") : null;
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (!href || href.startsWith("#") || link.target) return;
      armTierQuietMode(5000);
    }, true);
  }

  function setImportant(node, prop, value) {
    if (node) node.style.setProperty(prop, value, "important");
  }

  function syncFrameLayout() {
    const mobile = window.matchMedia("(max-width: 1000px)").matches;
    const side = app && app.querySelector(":scope > .sidebar, :scope > .side-panel");
    const stage = app && app.querySelector(":scope > .visualizer-stage");

    setImportant(app, "grid-template-columns", mobile ? "1fr" : "390px minmax(0, 1fr)");
    setImportant(app, "grid-template-areas", mobile ? "\"side\" \"main\"" : "\"side main\"");
    setImportant(app, "grid-template-rows", mobile ? "auto minmax(0, 1fr)" : "minmax(0, 1fr)");
    setImportant(app, "width", mobile ? "min(94vw, 760px)" : "min(94vw, 1760px)");
    setImportant(app, "min-width", "0");

    setImportant(side, "grid-area", "side");
    setImportant(side, "min-width", "0");
    setImportant(stage, "grid-area", "main");
    setImportant(stage, "min-width", "0");
    setImportant(stage, "width", "100%");
  }

  function scheduleFrameSync() {
    syncFrameLayout();
    window.addEventListener("resize", syncFrameLayout);
    window.addEventListener("load", syncFrameLayout);
    setTimeout(syncFrameLayout, 80);
    setTimeout(syncFrameLayout, 360);
  }

  function renderLevelMap() {
    refs.levelMap.innerHTML = '<strong>三阶梯度</strong>' + config.map.map((item, index) => '<span data-map-index="' + index + '">' + esc(item) + '</span>').join("");
  }

  function renderSteps() {
    refs.stepList.innerHTML = config.steps.map((step, index) => [
      '<button class="step-button" type="button" data-step="' + index + '">',
      '  <span class="step-index">' + (index + 1) + '</span>',
      '  <span><span class="step-title">' + esc(step.title) + '</span><span class="step-desc">' + esc(step.desc) + '</span></span>',
      '</button>'
    ].join("")).join("");
  }

  function renderControls() {
    refs.controls.innerHTML = config.controls.map(control => {
      const value = state.controls[control.id];
      const hint = control.type === "range" ? '<small id="' + control.id + 'Out">' + esc(value) + '</small>' : '<small>' + esc(control.hint || "") + '</small>';
      const label = '<label for="' + control.id + '"><span>' + esc(control.label) + '</span>' + hint + '</label>';
      let body = "";
      if (control.type === "select") {
        body = '<select id="' + control.id + '" data-control="' + control.id + '">' + control.options.map(option => '<option value="' + esc(option[0]) + '"' + (option[0] === value ? " selected" : "") + '>' + esc(option[1]) + '</option>').join("") + '</select>';
      } else {
        body = '<input id="' + control.id + '" data-control="' + control.id + '" type="range" min="' + control.min + '" max="' + control.max + '" step="' + control.step + '" value="' + esc(value) + '">';
      }
      return '<div class="control-group">' + label + body + '</div>';
    }).join("");
  }

  function bindEvents() {
    refs.stepList.addEventListener("click", event => {
      const button = event.target.closest("[data-step]");
      if (!button) return;
      setStep(Number(button.dataset.step));
    });

    refs.controls.addEventListener("input", event => {
      const id = event.target.dataset.control;
      if (!id) return;
      state.controls[id] = event.target.type === "range" ? Number(event.target.value) : event.target.value;
      updateRangeOutputs();
      update(false);
    });

    refs.controls.addEventListener("change", event => {
      const id = event.target.dataset.control;
      if (!id) return;
      state.controls[id] = event.target.type === "range" ? Number(event.target.value) : event.target.value;
      update(false);
    });

    refs.formulaLine.addEventListener("click", event => {
      const term = event.target.closest("[data-term]");
      if (!term) return;
      state.term = term.dataset.term;
      update(true);
    });

    refs.nextStep.addEventListener("click", () => {
      setStep((state.step + 1) % config.steps.length);
    });

    window.addEventListener("resize", () => drawCurrent());
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(() => drawCurrent());
      observer.observe(refs.canvas);
    }
  }

  function updateRangeOutputs() {
    config.controls.forEach(control => {
      if (control.type !== "range") return;
      const out = document.getElementById(control.id + "Out");
      if (out) out.textContent = state.controls[control.id];
    });
  }

  function setStep(index) {
    state.step = clamp(index, 0, config.steps.length - 1);
    const step = config.steps[state.step];
    state.term = step.focus || firstTerm(step.formula(state));
    update(true);
  }

  function firstTerm(items) {
    const item = items.find(part => typeof part === "object");
    return item ? item.id : "";
  }

  function update(animate) {
    updateActiveChrome();
    const step = config.steps[state.step];
    const formulaItems = step.formula(state);
    if (!state.term) state.term = firstTerm(formulaItems);
    refs.formulaLine.innerHTML = renderFormula(formulaItems);
    const feedback = getFeedback();
    refs.feedbackTitle.textContent = step.title + "反馈";
    refs.feedbackText.textContent = feedback.text;
    refs.chipRow.innerHTML = feedback.chips.map((chip, index) => '<span class="chip' + (index === 0 ? " hot" : "") + '">' + esc(chip) + '</span>').join("");
    refs.nextStep.textContent = state.step === config.steps.length - 1 ? "回到第一步" : "下一步";
    if (animate) {
      refs.vizArea.classList.remove("pulse");
      void refs.vizArea.offsetWidth;
      refs.vizArea.classList.add("pulse");
    }
    drawCurrent();
  }

  function updateActiveChrome() {
    refs.stepList.querySelectorAll("[data-step]").forEach(button => {
      button.classList.toggle("active", Number(button.dataset.step) === state.step);
    });
    refs.levelMap.querySelectorAll("[data-map-index]").forEach(item => {
      item.classList.toggle("active", Number(item.dataset.mapIndex) === state.step);
    });
  }

  function renderFormula(items) {
    return items.map(item => {
      if (typeof item === "object") {
        return '<button class="formula-term' + (item.id === state.term ? " active" : "") + '" type="button" data-term="' + esc(item.id) + '">' + esc(item.text) + '</button>';
      }
      return '<span class="formula-symbol">' + esc(item) + '</span>';
    }).join("");
  }

  function optionLabel(id, value) {
    const control = config.controls.find(item => item.id === id);
    if (!control || !control.options) return value;
    const item = control.options.find(option => option[0] === value);
    return item ? item[1] : value;
  }

  function getFeedback() {
    if (state.level === "basic") return basicFeedback();
    if (state.level === "extend") return extendFeedback();
    return advancedFeedback();
  }

  function basicFeedback() {
    const c = state.controls;
    const art = ART[c.artifact];
    const coverage = clamp(44 + c.motifs * 7, 0, 100);
    const precision = clamp(Math.round((MATERIAL_SCORE[c.material] + ERA_SCORE[c.era] + art.era) / 3 * 100), 0, 100);
    const recall = clamp(100 - Math.abs(c.threshold - 62), 0, 100);
    const texts = [
      "已把“" + art.label + "”拆为 " + c.motifs + " 个纹样元素，右侧亮色单元就是当前采集对象。",
      "编码向量把纹样数量、材质标签、年代区间压缩到同一个坐标中，公式项与向量格会同步高亮。",
      "检索阈值越高，留下的相似边越少；调节 θ 可以观察网络从宽松到严格的变化。"
    ];
    return {
      text: texts[state.step],
      chips: [config.map[state.step], optionLabel("artifact", c.artifact), "θ=" + c.threshold]
    };
  }

  function advancedFeedback() {
    const c = state.controls;
    const size = c.group === "C4" ? 4 : 8;
    const composed = composeOps(c.opA, c.opB, c.group);
    const mirrorPenalty = c.group === "C4" && (c.opA.startsWith("s") || c.opB.startsWith("s")) ? 18 : 0;
    const closure = c.group === "C4" && composed.ref ? 55 : 96;
    const structure = clamp(c.featureWeight + (size === 8 ? 8 : 0) - mirrorPenalty, 0, 100);
    const restore = clamp(Math.round((c.fidelity * 0.62 + structure * 0.38)), 0, 100);
    const texts = [
      "先固定一个纹样对象，后续所有旋转、翻折都围绕这个对象发生。",
      c.group + " 中可用变换数为 " + size + "；若只用 C4，镜像操作会提示需要扩展结构。",
      "当前合成结果为 " + opName(composed.id) + "，右侧会同时高亮 a、b 与合成后的图形。",
      "同构映射把可见结构转成向量，保留度 ρ 与结构权重 α 共同影响相似度。"
    ];
    return {
      text: texts[state.step],
      chips: [config.map[state.step], "a=" + opName(c.opA), "b=" + opName(c.opB), "a∘b=" + opName(composed.id)]
    };
  }

  function extendFeedback() {
    const c = state.controls;
    const edgeCount = Math.max(3, Math.round(c.nodes * (100 - c.edgeThreshold) / 24));
    const openness = c.openLevel;
    const review = c.reviewBalance;
    const communication = clamp(Math.round((openness * 0.45 + audienceScore(c.audience) * 0.55)), 0, 100);
    const quality = clamp(Math.round(review * 0.4 + openness * 0.35 + communication * 0.25), 0, 100);
    const texts = [
      "图谱把作品、纹样、工艺、出处放进同一个网络，节点数越多，语义层次越丰富。",
      "关系阈值 θ 决定哪些边被保留；阈值升高时，网络会更稀疏但更精确。",
      "再创生成不是任意改写，而是在规则 τ 和审核约束下产生候选图案。",
      "传播场景会改变反馈路径：课堂重理解，博物馆重导览，文创重转化，档案重长期访问。",
      "最终评估同时看守真 S、传播 R、共创 C，任何一项过低都会让总分下降。"
    ];
    return {
      text: texts[state.step],
      chips: [config.map[state.step], "|V|=" + c.nodes, "边≈" + edgeCount, optionLabel("audience", c.audience)]
    };
  }

  function audienceScore(value) {
    return { museum: 84, classroom: 78, creative: 88, archive: 72 }[value] || 75;
  }

  function drawCurrent() {
    if (!refs.canvas) return;
    const info = prepareCanvas();
    if (state.level === "basic") drawBasic(info);
    else if (state.level === "extend") drawExtend(info);
    else drawAdvanced(info);
  }

  function prepareCanvas() {
    const canvas = refs.canvas;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(620, Math.floor((rect.width || 820) * dpr));
    const height = Math.max(320, Math.floor((rect.height || 360) * dpr));
    canvas.width = width;
    canvas.height = height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = width / dpr;
    const h = height / dpr;
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  }

  function drawBasic(info) {
    const step = state.step;
    if (step === 0) drawBasicCollect(info);
    else if (step === 1) drawBasicVector(info);
    else drawBasicSearch(info);
  }

  function drawBasicCollect({ ctx, w, h }) {
    const c = state.controls;
    const art = ART[c.artifact];
    drawCanvasTitle(ctx, "采集样本：" + art.label, "当前高亮项：" + termLabel(state.term));
    const centerX = w * 0.32;
    const centerY = h * 0.52;
    drawMotif(ctx, centerX, centerY, 170, c.artifact, "e", true);
    const startX = w * 0.58;
    const startY = h * 0.28;
    for (let i = 0; i < c.motifs; i += 1) {
      const x = startX + (i % 4) * 72;
      const y = startY + Math.floor(i / 4) * 82;
      const hot = state.term === "motif" || i === 0;
      drawMiniTile(ctx, x, y, 46, art.color, hot, "m" + (i + 1));
    }
    drawArrow(ctx, w * 0.43, centerY, w * 0.54, centerY, state.term === "x" || state.term === "motif");
    drawTag(ctx, w * 0.58, h * 0.72, "材质：" + optionLabel("material", c.material), state.term === "material");
    drawTag(ctx, w * 0.58, h * 0.82, "年代：" + optionLabel("era", c.era), state.term === "era");
  }

  function drawBasicVector({ ctx, w, h }) {
    const c = state.controls;
    const art = ART[c.artifact];
    const values = [
      { id: "pattern", label: "p", value: c.motifs / 10, text: "纹样 " + c.motifs },
      { id: "material", label: "m", value: MATERIAL_SCORE[c.material], text: optionLabel("material", c.material) },
      { id: "time", label: "t", value: ERA_SCORE[c.era], text: optionLabel("era", c.era) }
    ];
    drawCanvasTitle(ctx, "编码成向量 c(x)", "点击公式项可定位到对应分量");
    drawMotif(ctx, w * 0.2, h * 0.55, 128, c.artifact, "e", state.term === "encode");
    drawArrow(ctx, w * 0.3, h * 0.55, w * 0.42, h * 0.55, state.term === "encode");
    const baseX = w * 0.47;
    values.forEach((item, index) => {
      const x = baseX + index * 132;
      const hot = state.term === item.id || (state.term === "encode" && index === 0);
      roundRect(ctx, x, h * 0.34, 106, 132, 8, hot ? "rgba(214, 59, 29,.13)" : "rgba(255,250,242,.9)", hot ? "#d63b1d" : "rgba(116,55,31,.18)");
      ctx.fillStyle = hot ? "#d63b1d" : "#2f5f9f";
      ctx.font = "800 26px JetBrains Mono, Consolas";
      ctx.textAlign = "center";
      ctx.fillText(item.label, x + 53, h * 0.45);
      drawMeter(ctx, x + 18, h * 0.51, 70, 12, item.value, hot);
      ctx.fillStyle = "#5e4338";
      ctx.font = "700 13px Noto Serif SC, serif";
      ctx.fillText(item.text, x + 53, h * 0.64);
      ctx.fillStyle = "#2c1810";
      ctx.font = "800 15px JetBrains Mono, Consolas";
      ctx.fillText(item.value.toFixed(2), x + 53, h * 0.72);
    });
    ctx.textAlign = "left";
  }

  function drawBasicSearch({ ctx, w, h }) {
    const c = state.controls;
    const art = ART[c.artifact];
    drawCanvasTitle(ctx, "相似检索网络", "阈值 θ=" + c.threshold + "，红色边表示被保留");
    const nodes = [
      { id: "Q", label: "查询", x: w * 0.5, y: h * 0.5, color: "#d63b1d", score: 100 },
      { id: "A", label: "纹样A", x: w * 0.25, y: h * 0.32, color: art.color, score: clamp(58 + c.motifs * 4, 0, 100) },
      { id: "B", label: "纹样B", x: w * 0.73, y: h * 0.35, color: "#2f7d57", score: clamp(82 - c.motifs * 2, 0, 100) },
      { id: "C", label: "纹样C", x: w * 0.28, y: h * 0.75, color: "#2f5f9f", score: clamp(48 + c.threshold / 3, 0, 100) },
      { id: "D", label: "纹样D", x: w * 0.72, y: h * 0.72, color: "#c58a1f", score: clamp(96 - c.threshold / 2, 0, 100) }
    ];
    nodes.slice(1).forEach(node => {
      const keep = node.score >= c.threshold;
      drawLine(ctx, nodes[0].x, nodes[0].y, node.x, node.y, keep || state.term === "theta", keep ? "#d63b1d" : "rgba(47,95,159,.24)", keep ? 4 : 2);
      ctx.fillStyle = keep ? "#d63b1d" : "#6b4a38";
      ctx.font = "800 12px JetBrains Mono, Consolas";
      ctx.fillText(Math.round(node.score), (nodes[0].x + node.x) / 2 + 8, (nodes[0].y + node.y) / 2 - 8);
    });
    nodes.forEach(node => drawNode(ctx, node.x, node.y, node.label, node.color, node.id === "Q" || state.term === "x" || state.term === "y"));
  }

  function drawAdvanced(info) {
    const step = state.step;
    if (step === 0) drawAdvancedObject(info);
    else if (step === 1) drawAdvancedGroup(info);
    else if (step === 2) drawAdvancedCompose(info);
    else drawAdvancedMap(info);
  }

  function drawAdvancedObject({ ctx, w, h }) {
    const c = state.controls;
    drawCanvasTitle(ctx, "结构对象 A", optionLabel("artifact", c.artifact));
    drawMotif(ctx, w * 0.5, h * 0.52, Math.min(w, h) * 0.42, c.artifact, "e", state.term === "A" || state.term === "x");
    drawOrbitMarks(ctx, w * 0.5, h * 0.52, Math.min(w, h) * 0.27, ["x", "r(x)", "s(x)", "r²(x)"], state.term);
  }

  function drawAdvancedGroup({ ctx, w, h }) {
    const c = state.controls;
    const ops = c.group === "C4" ? ["e", "r", "r2", "r3"] : ["e", "r", "r2", "r3", "s", "sr", "sr2", "sr3"];
    drawCanvasTitle(ctx, "变换集合 " + c.group, "红色节点为公式当前项相关变换");
    const cx = w * 0.5;
    const cy = h * 0.54;
    const radius = Math.min(w, h) * 0.28;
    ops.forEach((op, index) => {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / ops.length;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      const hot = (state.term === "r" && op.startsWith("r")) || (state.term === "s" && op.startsWith("s")) || state.term === "G";
      drawLine(ctx, cx, cy, x, y, hot, hot ? "#d63b1d" : "rgba(47,95,159,.25)", hot ? 3 : 1.6);
      drawNode(ctx, x, y, opName(op), hot ? "#d63b1d" : "#2f5f9f", hot);
    });
    drawNode(ctx, cx, cy, "G", "#2f7d57", state.term === "G");
  }

  function drawAdvancedCompose({ ctx, w, h }) {
    const c = state.controls;
    const composed = composeOps(c.opA, c.opB, c.group);
    drawCanvasTitle(ctx, "组合变换 a∘b", "先执行 b，再执行 a，结果：" + opName(composed.id));
    const y = h * 0.54;
    const xs = [w * 0.2, w * 0.5, w * 0.8];
    drawMotif(ctx, xs[0], y, 120, c.artifact, c.opB, state.term === "b" || state.term === "x");
    drawMotif(ctx, xs[1], y, 120, c.artifact, c.opA, state.term === "a");
    drawMotif(ctx, xs[2], y, 120, c.artifact, composed.id, state.term === "compose");
    drawArrow(ctx, xs[0] + 75, y, xs[1] - 75, y, state.term === "a" || state.term === "b");
    drawArrow(ctx, xs[1] + 75, y, xs[2] - 75, y, state.term === "compose");
    drawCaption(ctx, xs[0], y + 92, "b(x)=" + opName(c.opB), state.term === "b");
    drawCaption(ctx, xs[1], y + 92, "a(x)=" + opName(c.opA), state.term === "a");
    drawCaption(ctx, xs[2], y + 92, "a∘b=" + opName(composed.id), state.term === "compose");
  }

  function drawAdvancedMap({ ctx, w, h }) {
    const c = state.controls;
    const structure = c.featureWeight / 100;
    const fidelity = c.fidelity / 100;
    const vector = [structure, fidelity, (structure + fidelity) / 2];
    drawCanvasTitle(ctx, "同构映射 φ", "从可见结构到可计算向量");
    const leftX = w * 0.22;
    const rightX = w * 0.68;
    const y = h * 0.52;
    drawMotif(ctx, leftX, y, 130, c.artifact, "e", state.term === "A");
    drawArrow(ctx, leftX + 95, y, rightX - 150, y, state.term === "phi");
    vector.forEach((value, index) => {
      const x = rightX - 90 + index * 86;
      const hot = state.term === "V" || state.term === "sim";
      roundRect(ctx, x, y - 80, 68, 160, 8, hot ? "rgba(214, 59, 29,.12)" : "rgba(255,250,242,.9)", hot ? "#d63b1d" : "rgba(116,55,31,.18)");
      drawMeter(ctx, x + 17, y + 48, 34, 12, value, hot);
      ctx.fillStyle = hot ? "#d63b1d" : "#2f5f9f";
      ctx.font = "800 24px JetBrains Mono, Consolas";
      ctx.textAlign = "center";
      ctx.fillText(["v₁", "v₂", "v₃"][index], x + 34, y - 25);
      ctx.font = "800 13px JetBrains Mono, Consolas";
      ctx.fillText(value.toFixed(2), x + 34, y + 18);
    });
    drawTag(ctx, rightX - 90, h * 0.82, "sim=" + Math.round((vector[0] * 0.45 + vector[1] * 0.55) * 100) + "%", state.term === "sim");
    ctx.textAlign = "left";
  }

  function drawExtend(info) {
    const step = state.step;
    if (step === 0) drawExtendGraph(info);
    else if (step === 1) drawExtendEdges(info);
    else if (step === 2) drawExtendGenerate(info);
    else if (step === 3) drawExtendSpread(info);
    else drawExtendEvaluate(info);
  }

  function graphNodes(w, h) {
    const c = state.controls;
    const labels = ["藏品", "纹样", "工艺", "地域", "年代", "馆藏", "传承", "课程", "文创", "档案"].slice(0, c.nodes);
    const cx = w * 0.5;
    const cy = h * 0.52;
    const r = Math.min(w, h) * 0.3;
    return labels.map((label, index) => {
      if (index === 0) return { label, x: cx, y: cy, color: "#d63b1d" };
      const angle = -Math.PI / 2 + (index - 1) * Math.PI * 2 / Math.max(1, labels.length - 1);
      return { label, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, color: index % 2 ? "#2f5f9f" : "#2f7d57" };
    });
  }

  function drawExtendGraph({ ctx, w, h }) {
    const nodes = graphNodes(w, h);
    drawCanvasTitle(ctx, "知识图谱 K", "节点随 |V| 调整，中心为核心藏品");
    nodes.slice(1).forEach((node, index) => drawLine(ctx, nodes[0].x, nodes[0].y, node.x, node.y, state.term === "E" || index < 2, index < 2 ? "#d63b1d" : "rgba(47,95,159,.28)", index < 2 ? 4 : 2));
    nodes.forEach((node, index) => drawNode(ctx, node.x, node.y, node.label, node.color, state.term === "V" || state.term === "K" || index === 0));
    drawTag(ctx, w * 0.08, h * 0.82, "L: 工艺 / 纹样 / 出处", state.term === "L");
  }

  function drawExtendEdges({ ctx, w, h }) {
    const c = state.controls;
    const nodes = graphNodes(w, h);
    drawCanvasTitle(ctx, "关系权重筛选", "θ=" + c.edgeThreshold + "，达到阈值的边会变红");
    nodes.slice(1).forEach((node, index) => {
      const weight = clamp(92 - index * 9 + (c.openLevel - 60) / 4, 0, 100);
      const keep = weight >= c.edgeThreshold;
      drawLine(ctx, nodes[0].x, nodes[0].y, node.x, node.y, keep || state.term === "theta", keep ? "#d63b1d" : "rgba(47,95,159,.22)", keep ? 4 : 1.8);
      ctx.fillStyle = keep ? "#d63b1d" : "#6b4a38";
      ctx.font = "800 12px JetBrains Mono, Consolas";
      ctx.fillText(Math.round(weight), (nodes[0].x + node.x) / 2 + 6, (nodes[0].y + node.y) / 2 - 6);
    });
    nodes.forEach((node, index) => drawNode(ctx, node.x, node.y, node.label, node.color, state.term === "sim" || state.term === "lineage" || index === 0));
  }

  function drawExtendGenerate({ ctx, w, h }) {
    const c = state.controls;
    drawCanvasTitle(ctx, "规则约束下的再创生成", "开放等级 O=" + c.openLevel + "，审核强度 R=" + c.reviewBalance);
    const y = h * 0.53;
    const xs = [w * 0.18, w * 0.42, w * 0.66, w * 0.86];
    drawMotif(ctx, xs[0], y, 105, c.artifact, "e", state.term === "g");
    drawRuleBox(ctx, xs[1], y, "τ", "变换规则", state.term === "tau");
    drawMotif(ctx, xs[2], y, 105, c.artifact, c.openLevel > 70 ? "r" : "s", state.term === "new");
    drawRuleBox(ctx, xs[3], y, "1", "审核通过", state.term === "review");
    drawArrow(ctx, xs[0] + 66, y, xs[1] - 58, y, state.term === "tau");
    drawArrow(ctx, xs[1] + 58, y, xs[2] - 66, y, state.term === "new");
    drawArrow(ctx, xs[2] + 66, y, xs[3] - 58, y, state.term === "review");
  }

  function drawExtendSpread({ ctx, w, h }) {
    const c = state.controls;
    drawCanvasTitle(ctx, "传播反馈网络", optionLabel("audience", c.audience));
    const hub = { x: w * 0.5, y: h * 0.52 };
    const channels = [
      { label: "博物馆", x: w * 0.22, y: h * 0.3, score: 84 },
      { label: "课堂", x: w * 0.78, y: h * 0.3, score: 78 },
      { label: "文创", x: w * 0.22, y: h * 0.74, score: 88 },
      { label: "档案", x: w * 0.78, y: h * 0.74, score: 72 }
    ];
    channels.forEach(channel => {
      const hot = c.audience === channelId(channel.label) || state.term === "channels";
      drawLine(ctx, hub.x, hub.y, channel.x, channel.y, hot || state.term === "feedback", hot ? "#d63b1d" : "rgba(47,95,159,.26)", hot ? 4 : 2);
      drawNode(ctx, channel.x, channel.y, channel.label, hot ? "#d63b1d" : "#2f5f9f", hot);
      drawMeter(ctx, channel.x - 32, channel.y + 32, 64, 8, channel.score / 100, hot);
    });
    drawNode(ctx, hub.x, hub.y, "R", "#2f7d57", state.term === "R" || state.term === "feedback");
  }

  function drawExtendEvaluate({ ctx, w, h }) {
    const c = state.controls;
    const s = c.reviewBalance;
    const r = Math.round((c.openLevel * 0.45 + audienceScore(c.audience) * 0.55));
    const co = Math.round((100 - Math.abs(c.openLevel - c.reviewBalance)) * 0.82);
    const q = Math.round(s * 0.4 + r * 0.35 + co * 0.25);
    drawCanvasTitle(ctx, "闭环评估 Q", "守真 S、传播 R、共创 C 的加权结果");
    const bars = [
      { id: "S", label: "S 守真", value: s, color: "#2f7d57" },
      { id: "R", label: "R 传播", value: r, color: "#2f5f9f" },
      { id: "C", label: "C 共创", value: co, color: "#c58a1f" },
      { id: "Q", label: "Q 总评", value: q, color: "#d63b1d" }
    ];
    bars.forEach((bar, index) => {
      const x = w * 0.16;
      const y = h * 0.28 + index * 58;
      const hot = state.term === bar.id || state.term === "Q";
      ctx.fillStyle = "#5e4338";
      ctx.font = "800 14px Noto Serif SC, serif";
      ctx.fillText(bar.label, x, y);
      roundRect(ctx, x + 86, y - 15, w * 0.56, 24, 8, "rgba(255,250,242,.9)", "rgba(116,55,31,.16)");
      roundRect(ctx, x + 86, y - 15, w * 0.56 * bar.value / 100, 24, 8, hot ? "#d63b1d" : bar.color, "transparent");
      ctx.fillStyle = hot ? "#d63b1d" : "#2c1810";
      ctx.font = "800 13px JetBrains Mono, Consolas";
      ctx.fillText(bar.value + "%", x + 100 + w * 0.56, y + 3);
    });
    drawTriangle(ctx, w * 0.82, h * 0.5, 72, state.term);
  }

  function channelId(label) {
    return { "博物馆": "museum", "课堂": "classroom", "文创": "creative", "档案": "archive" }[label] || "";
  }

  function termLabel(term) {
    return {
      x: "对象 x",
      motif: "纹样",
      material: "材质",
      era: "年代",
      encode: "编码 c(x)",
      pattern: "纹样分量",
      time: "年代分量",
      theta: "阈值 θ",
      sim: "相似度",
      A: "对象集 A",
      G: "变换群 G",
      r: "旋转 r",
      s: "翻折 s",
      compose: "合成 a∘b",
      phi: "映射 φ",
      V: "向量空间 V",
      K: "图谱 K",
      E: "关系边 E",
      L: "标签 L",
      w: "权重 w",
      lineage: "传承线索",
      tau: "规则 τ",
      review: "审核",
      channels: "传播通道",
      feedback: "反馈",
      Q: "总评 Q",
      S: "守真 S",
      R: "传播 R",
      C: "共创 C"
    }[term] || term || "未选择";
  }

  function opName(id) {
    return {
      e: "e",
      r: "r",
      r2: "r²",
      r3: "r³",
      s: "s",
      sr: "sr",
      sr2: "sr²",
      sr3: "sr³"
    }[id] || id;
  }

  function parseOp(id) {
    if (id === "e") return { k: 0, ref: false };
    if (id === "r") return { k: 1, ref: false };
    if (id === "r2") return { k: 2, ref: false };
    if (id === "r3") return { k: 3, ref: false };
    if (id === "s") return { k: 0, ref: true };
    if (id === "sr") return { k: 1, ref: true };
    if (id === "sr2") return { k: 2, ref: true };
    if (id === "sr3") return { k: 3, ref: true };
    return { k: 0, ref: false };
  }

  function opId(op, group) {
    const k = ((op.k % 4) + 4) % 4;
    if (group === "C4" || !op.ref) return ["e", "r", "r2", "r3"][k];
    return ["s", "sr", "sr2", "sr3"][k];
  }

  function composeOps(a, b, group) {
    const A = parseOp(a);
    const B = parseOp(b);
    const op = {
      k: A.k + (A.ref ? -B.k : B.k),
      ref: A.ref !== B.ref
    };
    if (group === "C4") op.ref = false;
    return { ...op, id: opId(op, group) };
  }

  function transformForOp(op) {
    const parsed = parseOp(op);
    return {
      rotate: parsed.k * Math.PI / 2,
      mirror: parsed.ref
    };
  }

  function drawCanvasTitle(ctx, title, subtitle) {
    ctx.fillStyle = "#2c1810";
    ctx.font = "900 20px Noto Serif SC, serif";
    ctx.textAlign = "left";
    ctx.fillText(title, 24, 34);
    ctx.fillStyle = "#6b4a38";
    ctx.font = "700 13px Noto Serif SC, serif";
    ctx.fillText(subtitle, 24, 58);
  }

  function drawMotif(ctx, cx, cy, size, artifact, op, hot) {
    const art = ART[artifact] || ART.bronze;
    const half = size / 2;
    const transform = transformForOp(op || "e");
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(transform.rotate);
    ctx.scale(transform.mirror ? -1 : 1, 1);
    roundRect(ctx, -half, -half, size, size, 8, hot ? "rgba(214, 59, 29,.13)" : "rgba(255,250,242,.92)", hot ? "#d63b1d" : "rgba(116,55,31,.2)");
    ctx.strokeStyle = art.color;
    ctx.lineWidth = Math.max(2, size / 46);
    ctx.globalAlpha = 0.95;
    for (let i = 0; i < 4; i += 1) {
      ctx.save();
      ctx.rotate(i * Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -half * 0.62);
      ctx.quadraticCurveTo(half * 0.48, -half * 0.35, half * 0.2, 0);
      ctx.quadraticCurveTo(half * 0.06, half * 0.16, 0, half * 0.54);
      ctx.stroke();
      ctx.restore();
    }
    ctx.strokeStyle = art.accent;
    ctx.lineWidth = Math.max(2, size / 60);
    ctx.beginPath();
    ctx.arc(0, 0, half * 0.34, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i += 1) {
      const angle = i * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * half * 0.16, Math.sin(angle) * half * 0.16);
      ctx.lineTo(Math.cos(angle) * half * 0.38, Math.sin(angle) * half * 0.38);
      ctx.stroke();
    }
    if (hot) {
      ctx.strokeStyle = "#d63b1d";
      ctx.lineWidth = 4;
      ctx.strokeRect(-half + 7, -half + 7, size - 14, size - 14);
    }
    ctx.restore();
  }

  function drawMiniTile(ctx, x, y, size, color, hot, label) {
    roundRect(ctx, x, y, size, size, 8, hot ? "rgba(214, 59, 29,.13)" : "rgba(255,250,242,.9)", hot ? "#d63b1d" : "rgba(116,55,31,.18)");
    ctx.strokeStyle = color;
    ctx.lineWidth = hot ? 3 : 2;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size * 0.24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = hot ? "#d63b1d" : "#5e4338";
    ctx.font = "800 11px JetBrains Mono, Consolas";
    ctx.textAlign = "center";
    ctx.fillText(label, x + size / 2, y + size + 17);
    ctx.textAlign = "left";
  }

  function drawLine(ctx, x1, y1, x2, y2, hot, color, width) {
    ctx.strokeStyle = color || (hot ? "#d63b1d" : "rgba(47,95,159,.35)");
    ctx.lineWidth = width || (hot ? 4 : 2);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawArrow(ctx, x1, y1, x2, y2, hot) {
    drawLine(ctx, x1, y1, x2, y2, hot, hot ? "#d63b1d" : "#c58a1f", hot ? 4 : 2.4);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.fillStyle = hot ? "#d63b1d" : "#c58a1f";
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 12 * Math.cos(angle - Math.PI / 6), y2 - 12 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - 12 * Math.cos(angle + Math.PI / 6), y2 - 12 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  function drawNode(ctx, x, y, label, color, hot) {
    ctx.beginPath();
    ctx.arc(x, y, hot ? 27 : 23, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = hot ? "#d63b1d" : "rgba(255,255,255,.92)";
    ctx.lineWidth = hot ? 5 : 3;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "800 13px Noto Serif SC, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y);
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
  }

  function drawTag(ctx, x, y, text, hot) {
    const width = Math.max(130, ctx.measureText(text).width + 28);
    roundRect(ctx, x, y, width, 34, 8, hot ? "rgba(214, 59, 29,.13)" : "rgba(255,250,242,.92)", hot ? "#d63b1d" : "rgba(116,55,31,.18)");
    ctx.fillStyle = hot ? "#d63b1d" : "#5e4338";
    ctx.font = "800 13px Noto Serif SC, serif";
    ctx.fillText(text, x + 14, y + 22);
  }

  function drawCaption(ctx, x, y, text, hot) {
    ctx.fillStyle = hot ? "#d63b1d" : "#5e4338";
    ctx.font = "800 14px JetBrains Mono, Consolas";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
    ctx.textAlign = "left";
  }

  function drawMeter(ctx, x, y, width, height, value, hot) {
    roundRect(ctx, x, y, width, height, height / 2, "rgba(47,95,159,.13)", "transparent");
    roundRect(ctx, x, y, width * clamp(value, 0, 1), height, height / 2, hot ? "#d63b1d" : "#2f7d57", "transparent");
  }

  function drawOrbitMarks(ctx, cx, cy, r, labels, term) {
    labels.forEach((label, index) => {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / labels.length;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const hot = term && label.toLowerCase().includes(term.replace("2", "²"));
      drawNode(ctx, x, y, label, hot ? "#d63b1d" : "#2f5f9f", hot);
    });
  }

  function drawRuleBox(ctx, cx, cy, label, sub, hot) {
    roundRect(ctx, cx - 52, cy - 52, 104, 104, 8, hot ? "rgba(214, 59, 29,.13)" : "rgba(255,250,242,.92)", hot ? "#d63b1d" : "rgba(116,55,31,.18)");
    ctx.fillStyle = hot ? "#d63b1d" : "#2f5f9f";
    ctx.font = "900 30px JetBrains Mono, Consolas";
    ctx.textAlign = "center";
    ctx.fillText(label, cx, cy - 4);
    ctx.fillStyle = "#5e4338";
    ctx.font = "800 13px Noto Serif SC, serif";
    ctx.fillText(sub, cx, cy + 28);
    ctx.textAlign = "left";
  }

  function drawTriangle(ctx, cx, cy, r, term) {
    const points = [
      { id: "S", label: "S", x: cx, y: cy - r },
      { id: "R", label: "R", x: cx - r * 0.9, y: cy + r * 0.62 },
      { id: "C", label: "C", x: cx + r * 0.9, y: cy + r * 0.62 }
    ];
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();
    ctx.fillStyle = "rgba(47,95,159,.08)";
    ctx.fill();
    ctx.strokeStyle = term === "Q" ? "#d63b1d" : "rgba(47,95,159,.5)";
    ctx.lineWidth = term === "Q" ? 4 : 2;
    ctx.stroke();
    points.forEach(point => drawNode(ctx, point.x, point.y, point.label, point.id === term ? "#d63b1d" : "#2f5f9f", point.id === term || term === "Q"));
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill && fill !== "transparent") {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke && stroke !== "transparent") {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  init();
})();
