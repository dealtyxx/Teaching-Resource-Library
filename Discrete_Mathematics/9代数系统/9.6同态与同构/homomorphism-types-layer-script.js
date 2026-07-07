(function () {
  "use strict";

  const cfg = window.HOM_LAYER_CONFIG || {};
  const layer = cfg.layer || document.body.dataset.layer || "basic";
  const controls = document.getElementById("controls");
  const svg = document.getElementById("mappingSvg");
  const formulaText = document.getElementById("formulaText");
  const resultValue = document.getElementById("resultValue");
  const resultExtra = document.getElementById("resultExtra");
  const stepHint = document.getElementById("stepHint");
  const boardTitle = document.getElementById("boardTitle");
  const boardSubtitle = document.getElementById("boardSubtitle");
  const viewBox = { w: 900, h: 430 };

  const DATA = {
    basic: {
      defaultScenario: "parity",
      steps: [
        { title: "1. 明确两端集合", hot: ["domain", "codomain"], text: "先看定义域、值域和箭头方向，确认这是从哪个代数系统到哪个代数系统的映射。" },
        { title: "2. 检查运算保持", hot: ["op", "arrows"], text: "比较 f(a+b) 与 f(a)+f(b)，若运算关系同步，才进入同态分类。" },
        { title: "3. 观察核与压缩", hot: ["ker", "inj"], text: "核中若有多个元素，说明不同元素被压到同一个单位元，单射性会受影响。" },
        { title: "4. 检查像与覆盖", hot: ["image", "surj"], text: "看值域中的每个元素是否都被箭头命中，判断是否覆盖目标系统。" },
        { title: "5. 完成类型判定", hot: ["type"], text: "把运算保持、单射、满射三项合起来，给出同态类型。" }
      ],
      scenarios: {
        parity: {
          name: "奇偶归类映射",
          subtitle: "Z4 → Z2，f(x)=x mod 2",
          domainName: "Z4",
          codomainName: "Z2",
          domain: ["0", "1", "2", "3"],
          codomain: ["0", "1"],
          mapping: { "0": "0", "1": "1", "2": "0", "3": "1" },
          operation: "f(a+b)=f(a)+f(b)",
          operationOK: true,
          injective: false,
          surjective: true,
          kernel: ["0", "2"],
          image: ["0", "1"],
          typeLabel: "满同态",
          civic: "思政联结：分类施策要先守住统一规则，再允许合理归并；数学中的映射判定提醒我们，口径一致才能让治理判断可复核。"
        },
        embed: {
          name: "倍增嵌入映射",
          subtitle: "Z3 → Z6，f(x)=2x",
          domainName: "Z3",
          codomainName: "Z6",
          domain: ["0", "1", "2"],
          codomain: ["0", "1", "2", "3", "4", "5"],
          mapping: { "0": "0", "1": "2", "2": "4" },
          operation: "f(a+b)=f(a)+f(b)",
          operationOK: true,
          injective: true,
          surjective: false,
          kernel: ["0"],
          image: ["0", "2", "4"],
          typeLabel: "单同态",
          civic: "思政联结：精准识别重在不混淆对象。单射把每个来源保留下来，对应工作中尊重差异、准确画像的分析习惯。"
        },
        identity: {
          name: "身份翻译映射",
          subtitle: "Z4 → Z4，f(x)=x",
          domainName: "Z4",
          codomainName: "Z4",
          domain: ["0", "1", "2", "3"],
          codomain: ["0", "1", "2", "3"],
          mapping: { "0": "0", "1": "1", "2": "2", "3": "3" },
          operation: "f(a+b)=f(a)+f(b)",
          operationOK: true,
          injective: true,
          surjective: true,
          kernel: ["0"],
          image: ["0", "1", "2", "3"],
          typeLabel: "同构",
          civic: "思政联结：同构强调形式可变、本质一致。把理论表达转化为实践语言时，也要保持核心逻辑和价值方向一致。"
        },
        broken: {
          name: "扰动映射反例",
          subtitle: "Z3 → Z3，箭头看似完整但运算不同步",
          domainName: "Z3",
          codomainName: "Z3",
          domain: ["0", "1", "2"],
          codomain: ["0", "1", "2"],
          mapping: { "0": "0", "1": "1", "2": "1" },
          operation: "f(1+1) 与 f(1)+f(1) 不一致",
          operationOK: false,
          injective: false,
          surjective: false,
          kernel: ["0"],
          image: ["0", "1"],
          typeLabel: "暂缓归类",
          civic: "思政联结：一个关键关系被扭曲，整体判断就要暂停。严谨求证要求先找反例，再决定能否归入某类。"
        }
      }
    },
    extend: {
      defaultScenario: "quotient",
      steps: [
        { title: "1. 验证同态入口", hot: ["op", "arrows"], text: "先确认映射保持运算，这是讨论核、像和商结构的前提。" },
        { title: "2. 找到核 Ker f", hot: ["ker"], text: "核记录哪些元素被送到单位元，是观察信息压缩的第一把尺子。" },
        { title: "3. 刻画像 Im f", hot: ["image", "surj"], text: "像描述目标系统中真正被触达的部分，决定映射覆盖到哪里。" },
        { title: "4. 按核分成等价类", hot: ["quotient"], text: "把相差一个核元素的对象归到同一类，形成商结构。" },
        { title: "5. 对照 S/Ker 与 Im", hot: ["theorem", "type"], text: "同态基本定理把商结构与像联系起来：压缩后的结构与实际到达的结构对应。" },
        { title: "6. 迁移到纠错与治理", hot: ["transfer"], text: "用核识别无误差空间，用像和综合征定位偏差，让抽象结构服务可靠运行。" }
      ],
      scenarios: {
        quotient: {
          name: "模 3 投影与商结构",
          subtitle: "Z6 → Z3，f(x)=x mod 3",
          domainName: "Z6",
          codomainName: "Z3",
          domain: ["0", "1", "2", "3", "4", "5"],
          codomain: ["0", "1", "2"],
          mapping: { "0": "0", "1": "1", "2": "2", "3": "0", "4": "1", "5": "2" },
          operation: "f(a+b)=f(a)+f(b)",
          operationOK: true,
          injective: false,
          surjective: true,
          kernel: ["0", "3"],
          image: ["0", "1", "2"],
          quotient: [
            { name: "{0,3}", to: "0" },
            { name: "{1,4}", to: "1" },
            { name: "{2,5}", to: "2" }
          ],
          typeLabel: "S/Ker 与 Im 对应",
          transfer: "商去核以后，每个等价类只留下一个有效代表。",
          civic: "思政联结：系统治理常要把纷繁信息归并成可行动类别。关键不是简单压缩，而是说明压缩依据、保留关系和责任边界。"
        },
        hamming: {
          name: "汉明码综合征映射",
          subtitle: "码字空间片段 → 综合征，核为合法码字",
          domainName: "7位向量片段",
          codomainName: "综合征",
          domain: ["0000000", "1010101", "0101010", "1000000", "0010000"],
          codomain: ["000", "101", "011", "110"],
          mapping: { "0000000": "000", "1010101": "000", "0101010": "000", "1000000": "101", "0010000": "011" },
          operation: "H(x+y)=Hx+Hy",
          operationOK: true,
          injective: false,
          surjective: false,
          kernel: ["0000000", "1010101", "0101010"],
          image: ["000", "101", "011"],
          quotient: [
            { name: "合法码字类", to: "000" },
            { name: "第1位偏差", to: "101" },
            { name: "第3位偏差", to: "011" }
          ],
          typeLabel: "核用于识别合法空间",
          transfer: "综合征把错误模式投影出来，核对应无需纠正的码字集合。",
          civic: "思政联结：可靠系统需要预设校验机制。发现偏差、定位偏差、纠正偏差，是数学纠错与治理闭环共同强调的过程意识。"
        },
        automap: {
          name: "可逆重命名映射",
          subtitle: "Z5 → Z5，f(x)=2x",
          domainName: "Z5",
          codomainName: "Z5",
          domain: ["0", "1", "2", "3", "4"],
          codomain: ["0", "1", "2", "3", "4"],
          mapping: { "0": "0", "1": "2", "2": "4", "3": "1", "4": "3" },
          operation: "f(a+b)=f(a)+f(b)",
          operationOK: true,
          injective: true,
          surjective: true,
          kernel: ["0"],
          image: ["0", "1", "2", "3", "4"],
          quotient: [
            { name: "{0}", to: "0" },
            { name: "{1}", to: "2" },
            { name: "{2}", to: "4" },
            { name: "{3}", to: "1" },
            { name: "{4}", to: "3" }
          ],
          typeLabel: "自同构",
          transfer: "核只有单位元，像覆盖全体，因此结构只是被可逆重命名。",
          civic: "思政联结：改革创新不是丢掉根本规则，而是在可逆、可追溯的变换中提升系统活力。"
        }
      }
    }
  };

  let state = {
    scenarioKey: DATA[layer].defaultScenario,
    step: 0,
    focus: null
  };

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function svgEl(type, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", type);
    Object.entries(attrs || {}).forEach(([key, value]) => el.setAttribute(key, value));
    return el;
  }

  function data() {
    return DATA[layer];
  }

  function scenario() {
    return data().scenarios[state.scenarioKey] || data().scenarios[data().defaultScenario];
  }

  function step() {
    return data().steps[state.step] || data().steps[0];
  }

  function includesHot(key) {
    if (step().hot.includes("type") && ["op", "arrows", "ker", "image", "inj", "surj", "type"].includes(key)) {
      return true;
    }
    if (step().hot.includes("transfer") && ["ker", "image", "quotient", "theorem", "transfer"].includes(key)) {
      return true;
    }
    return step().hot.includes(key) || state.focus === key;
  }

  function control(label, body, small) {
    return '<div class="control-group"><label><span>' + esc(label) + '</span>' + (small ? '<small>' + esc(small) + '</small>' : '') + '</label>' + body + '</div>';
  }

  function button(id, text, primary) {
    return '<button type="button" id="' + id + '" class="tool-btn' + (primary ? " primary" : "") + '">' + esc(text) + '</button>';
  }

  function buildControls() {
    const items = Object.entries(data().scenarios).map(([key, value]) => '<option value="' + esc(key) + '"' + (key === state.scenarioKey ? " selected" : "") + '>' + esc(value.name) + '</option>').join("");
    controls.innerHTML =
      control(layer === "basic" ? "判定案例" : "拓展案例", '<select id="scenarioSelect">' + items + '</select>', scenario().subtitle)
      + '<div class="step-card" style="--step-count:' + data().steps.length + '"><div id="stepTrack" class="step-track"></div><div id="stepTitle" class="step-title"></div></div>'
      + '<div class="button-row three">' + button("prevStep", "上一步") + button("nextStep", "下一步", true) + button("resetCase", "重置") + '</div>'
      + '<div class="button-row">' + button("completeCase", layer === "basic" ? "完成判定" : "对照定理", true) + button("challengeCase", layer === "basic" ? "看反例" : "看纠错") + '</div>';

    document.getElementById("scenarioSelect").addEventListener("change", event => {
      state.scenarioKey = event.target.value;
      state.step = 0;
      state.focus = null;
      buildControls();
      render();
    });
    document.getElementById("prevStep").addEventListener("click", () => {
      state.step = Math.max(0, state.step - 1);
      state.focus = null;
      render();
    });
    document.getElementById("nextStep").addEventListener("click", () => {
      state.step = Math.min(data().steps.length - 1, state.step + 1);
      state.focus = null;
      render();
    });
    document.getElementById("resetCase").addEventListener("click", () => {
      state.step = 0;
      state.focus = null;
      render();
    });
    document.getElementById("completeCase").addEventListener("click", () => {
      state.step = data().steps.length - 1;
      state.focus = "type";
      render();
    });
    document.getElementById("challengeCase").addEventListener("click", () => {
      state.scenarioKey = layer === "basic" ? "broken" : "hamming";
      state.step = layer === "basic" ? 1 : 5;
      state.focus = layer === "basic" ? "op" : "transfer";
      buildControls();
      render();
    });
  }

  function updateStepCard() {
    const track = document.getElementById("stepTrack");
    const title = document.getElementById("stepTitle");
    if (!track || !title) return;
    track.innerHTML = data().steps.map((_, index) => '<i class="step-dot' + (index < state.step ? " is-done" : "") + (index === state.step ? " is-current" : "") + '"></i>').join("");
    title.innerHTML = esc(step().title) + '<span>' + esc(step().text) + '</span>';
  }

  function positions(values, x, top, bottom) {
    const gap = values.length <= 1 ? 0 : (bottom - top) / (values.length - 1);
    return Object.fromEntries(values.map((value, index) => [value, { x, y: top + gap * index }]));
  }

  function labelText(parent, x, y, text, className) {
    const t = svgEl("text", { x, y, class: className || "" });
    t.textContent = text;
    parent.appendChild(t);
    return t;
  }

  function roundedRect(parent, x, y, w, h, className, rx) {
    const r = svgEl("rect", { x, y, width: w, height: h, rx: rx || 16, class: className || "" });
    parent.appendChild(r);
    return r;
  }

  function drawNode(parent, value, pos, kind, classes) {
    const g = svgEl("g", {
      class: "map-node " + kind + " " + (classes || ""),
      "data-kind": kind,
      "data-value": value,
      transform: "translate(" + pos.x + " " + pos.y + ")"
    });
    g.appendChild(svgEl("circle", { r: 26 }));
    const text = svgEl("text", {});
    text.textContent = value;
    g.appendChild(text);
    parent.appendChild(g);
  }

  function drawArrow(parent, from, to, classes) {
    const path = svgEl("path", {
      class: "map-arrow " + (classes || ""),
      d: "M " + (from.x + 28) + " " + from.y + " C 350 " + from.y + ", 540 " + to.y + ", " + (to.x - 28) + " " + to.y,
      "marker-end": "url(#arrowHead)"
    });
    parent.appendChild(path);
  }

  function drawFiberBands(parent, sc, src, dst) {
    if (!includesHot("ker") && !includesHot("quotient")) return;
    const groups = {};
    Object.entries(sc.mapping).forEach(([from, to]) => {
      groups[to] = groups[to] || [];
      groups[to].push(from);
    });
    Object.entries(groups).forEach(([to, froms]) => {
      if (froms.length < 2 && !sc.kernel.includes(froms[0])) return;
      const ys = froms.map(v => src[v].y);
      roundedRect(parent, 84, Math.min(...ys) - 38, 132, Math.max(...ys) - Math.min(...ys) + 76, "fiber-band", 26);
      labelText(parent, 228, (Math.min(...ys) + Math.max(...ys)) / 2 + 4, "同纤维 → " + to, "map-note");
      if (dst[to]) {
        drawArrow(parent, { x: 238, y: (Math.min(...ys) + Math.max(...ys)) / 2 }, dst[to], "is-hot");
      }
    });
  }

  function drawQuotient(parent, sc, dst) {
    if (layer !== "extend" || (!includesHot("quotient") && !includesHot("theorem") && !includesHot("transfer"))) return;
    labelText(parent, 430, 62, "按 Ker 分层", "set-title");
    const top = 108;
    const gap = sc.quotient.length <= 1 ? 0 : 210 / (sc.quotient.length - 1);
    sc.quotient.forEach((q, index) => {
      const y = top + gap * index;
      roundedRect(parent, 360, y - 24, 140, 48, "quotient-band", 18);
      labelText(parent, 430, y + 5, q.name, "quotient-text");
      if (dst[q.to]) {
        drawArrow(parent, { x: 502, y }, dst[q.to], includesHot("theorem") || includesHot("transfer") ? "is-hot" : "");
      }
    });
  }

  function renderDiagram() {
    const sc = scenario();
    svg.setAttribute("viewBox", "0 0 " + viewBox.w + " " + viewBox.h);
    svg.innerHTML = '<defs><marker id="arrowHead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#d63b1d"></path></marker></defs>';
    const root = svgEl("g", {});
    svg.appendChild(root);

    roundedRect(root, 40, 56, 230, 318, "set-hull", 22);
    roundedRect(root, 630, 56, 230, 318, "set-hull", 22);
    labelText(root, 155, 38, sc.domainName, "set-title");
    labelText(root, 745, 38, sc.codomainName, "set-title");

    const src = positions(sc.domain, 155, 104, 330);
    const dst = positions(sc.codomain, 745, 104, 330);
    drawFiberBands(root, sc, src, dst);
    drawQuotient(root, sc, dst);

    Object.entries(sc.mapping).forEach(([from, to]) => {
      const focus = state.focus === from || state.focus === to;
      drawArrow(root, src[from], dst[to], (includesHot("arrows") || includesHot("op") || focus) ? "is-hot" : "");
    });

    sc.domain.forEach(value => {
      const classes = [
        (includesHot("domain") || state.focus === value) ? "is-hot" : "",
        sc.kernel.includes(value) && (includesHot("ker") || includesHot("inj") || includesHot("quotient")) ? "is-kernel" : "",
        includesHot("image") && !sc.image.includes(sc.mapping[value]) ? "is-muted" : ""
      ].join(" ");
      drawNode(root, value, src[value], "domain", classes);
    });

    sc.codomain.forEach(value => {
      const classes = [
        (includesHot("codomain") || state.focus === value) ? "is-hot" : "",
        sc.image.includes(value) && (includesHot("image") || includesHot("surj") || includesHot("theorem")) ? "is-image" : "",
        includesHot("image") && !sc.image.includes(value) ? "is-muted" : ""
      ].join(" ");
      drawNode(root, value, dst[value], "codomain", classes);
    });

    labelText(root, 450, 392, sc.operation, "operation-text");
    svg.querySelectorAll(".map-node").forEach(node => {
      node.addEventListener("click", () => {
        state.focus = node.getAttribute("data-value");
        state.step = node.getAttribute("data-kind") === "domain" ? Math.min(2, data().steps.length - 1) : Math.min(3, data().steps.length - 1);
        render();
      });
    });
  }

  function yesNo(v) {
    return v ? "通过" : "未通过";
  }

  function formulaItems() {
    const sc = scenario();
    if (layer === "basic") {
      return [
        ["op", "运算保持", yesNo(sc.operationOK)],
        ["ker", "Ker f", "{" + sc.kernel.join(", ") + "}"],
        ["image", "Im f", "{" + sc.image.join(", ") + "}"],
        ["inj", "单射", yesNo(sc.injective)],
        ["surj", "满射", yesNo(sc.surjective)],
        ["type", "类型", sc.typeLabel]
      ];
    }
    return [
      ["op", "同态入口", yesNo(sc.operationOK)],
      ["ker", "Ker f", "{" + sc.kernel.join(", ") + "}"],
      ["image", "Im f", "{" + sc.image.join(", ") + "}"],
      ["quotient", "S/Ker", sc.quotient.map(q => q.name).join(" ")],
      ["theorem", "S/Ker≈Im", sc.typeLabel],
      ["transfer", "迁移", sc.transfer]
    ];
  }

  function renderFormula() {
    formulaText.innerHTML = formulaItems().map(item => {
      const hot = includesHot(item[0]);
      return '<button type="button" class="formula-chip' + (hot ? " is-hot" : "") + '" data-hot="' + esc(item[0]) + '"><b>' + esc(item[1]) + '</b><span>' + esc(item[2]) + '</span></button>';
    }).join("");
    formulaText.querySelectorAll(".formula-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const key = chip.getAttribute("data-hot");
        const index = data().steps.findIndex(s => s.hot.includes(key));
        state.step = index >= 0 ? index : state.step;
        state.focus = key;
        render();
      });
    });
  }

  function renderResult() {
    const sc = scenario();
    let chipClass = "";
    let chipText = "判定推进中";
    if (!sc.operationOK && state.step >= 1) {
      chipClass = " false";
      chipText = "先修正运算关系";
    } else if (state.step >= data().steps.length - 1) {
      chipClass = "";
      chipText = "判定完成";
    } else {
      chipClass = " warn";
      chipText = "继续检查";
    }

    const checks = layer === "basic"
      ? "运算保持：" + yesNo(sc.operationOK) + "；单射：" + yesNo(sc.injective) + "；满射：" + yesNo(sc.surjective) + "。"
      : "核大小：" + sc.kernel.length + "；像大小：" + sc.image.length + "；当前关注：" + step().title.replace(/^\d+\.\s*/, "") + "。";
    resultValue.innerHTML = '<span class="truth-chip' + chipClass + '">' + esc(chipText) + '</span><div>' + esc(sc.typeLabel + "｜" + checks) + '</div>';
    const civic = String(sc.civic || "").replace(/^思政联结：/, "");
    resultExtra.innerHTML = '<b>当前反馈：</b>' + esc(step().text) + '<br><b>思政联结：</b>' + esc(civic);
    if (stepHint) {
      stepHint.textContent = sc.name + "：" + step().text;
    }
  }

  function renderHeader() {
    const sc = scenario();
    if (boardTitle) boardTitle.textContent = cfg.title || (layer === "basic" ? "同态分类判定台" : "核像商结构导航器");
    if (boardSubtitle) boardSubtitle.textContent = sc.subtitle;
  }

  function render() {
    updateStepCard();
    renderHeader();
    renderDiagram();
    renderFormula();
    renderResult();
  }

  window.addEventListener("resize", renderDiagram);
  buildControls();
  render();
})();
