(function () {
  "use strict";

  const cfg = window.ALGEBRA_LAYER_CONFIG || {};
  const layer = cfg.layer || document.body.dataset.layer || "basic";
  const controls = document.getElementById("controls");
  const svg = document.getElementById("diagramSvg");
  const diagramGroup = document.getElementById("diagramGroup");
  const stepHint = document.getElementById("stepHint");
  const formulaText = document.getElementById("formulaText");
  const resultValue = document.getElementById("resultValue");
  const resultExtra = document.getElementById("resultExtra");
  const boardTitle = document.getElementById("boardTitle");
  const boardSubtitle = document.getElementById("boardSubtitle");
  const viewBox = { w: 900, h: 470 };

  const DATA = {
    basic: {
      defaultScenario: "group",
      defaultReady: 3,
      steps: [
        { title: "1. 确定载体", hot: ["set"], text: "先确认集合 A 与二元运算是否清楚。" },
        { title: "2. 检查封闭", hot: ["closure"], text: "任取 a,b∈A，运算结果仍要落在 A 中。" },
        { title: "3. 检查结合", hot: ["assoc"], text: "(a*b)*c 与 a*(b*c) 一致时，可进入半群层。" },
        { title: "4. 寻找单位元", hot: ["identity"], text: "存在 e，使 e*a=a*e=a，结构升级为独异点。" },
        { title: "5. 检查逆元", hot: ["inverse"], text: "每个元素都能找到逆元时，结构才达到群。" }
      ],
      scenarios: {
        magma: {
          name: "广群候选",
          formula: "<A, *>",
          target: 1,
          defaultReady: 0,
          axioms: [
            { key: "closure", label: "封闭", note: "a*b∈A" },
            { key: "assoc", label: "结合", note: "(a*b)*c=a*(b*c)" },
            { key: "identity", label: "单位元", note: "存在 e" },
            { key: "inverse", label: "逆元", note: "存在 a⁻¹" },
            { key: "comm", label: "交换", note: "a*b=b*a" }
          ]
        },
        semigroup: {
          name: "半群候选",
          formula: "<A, *>",
          target: 2,
          defaultReady: 1,
          axioms: [
            { key: "closure", label: "封闭", note: "a*b∈A" },
            { key: "assoc", label: "结合", note: "组合顺序不影响结果" },
            { key: "identity", label: "单位元", note: "可选增强" },
            { key: "inverse", label: "逆元", note: "群所需" },
            { key: "comm", label: "交换", note: "可交换群所需" }
          ]
        },
        monoid: {
          name: "独异点候选",
          formula: "<A, *, e>",
          target: 3,
          defaultReady: 2,
          axioms: [
            { key: "closure", label: "封闭", note: "运算不越界" },
            { key: "assoc", label: "结合", note: "可稳定聚合" },
            { key: "identity", label: "单位元", note: "空操作 e" },
            { key: "inverse", label: "逆元", note: "不是必需" },
            { key: "comm", label: "交换", note: "视场景而定" }
          ]
        },
        group: {
          name: "群候选",
          formula: "<G, *, e, a⁻¹>",
          target: 4,
          defaultReady: 3,
          axioms: [
            { key: "closure", label: "封闭", note: "a*b∈G" },
            { key: "assoc", label: "结合", note: "(a*b)*c=a*(b*c)" },
            { key: "identity", label: "单位元", note: "e*a=a" },
            { key: "inverse", label: "逆元", note: "a*a⁻¹=e" },
            { key: "comm", label: "交换", note: "阿贝尔群增强" }
          ]
        }
      }
    },
    extend: {
      defaultScenario: "ring",
      defaultReady: 4,
      steps: [
        { title: "1. 拆成两种运算", hot: ["add", "mul"], text: "环、域、布尔代数都要同时观察加法与乘法结构。" },
        { title: "2. 先守住加法群", hot: ["add"], text: "加法部分必须形成交换群，这是双运算结构的底座。" },
        { title: "3. 检查乘法半群", hot: ["mul"], text: "乘法至少要封闭并结合，才有稳定的组合规则。" },
        { title: "4. 检查分配律", hot: ["dist"], text: "分配律把两套运算连接成一个整体。" },
        { title: "5. 比较增强条件", hot: ["extra"], text: "单位元、乘法逆元、补元等条件决定结构能否升级。" },
        { title: "6. 完成分类判定", hot: ["score"], text: "根据已满足公理数，定位环、域或布尔代数。" }
      ],
      scenarios: {
        ring: {
          name: "环候选",
          formula: "<R, +, ·>",
          target: 4,
          defaultReady: 4,
          axioms: [
            { key: "add", label: "加法交换群", note: "R,+ 有 0 与负元" },
            { key: "mul", label: "乘法半群", note: "R,· 封闭且结合" },
            { key: "dist", label: "分配律", note: "a(b+c)=ab+ac" },
            { key: "identity", label: "乘法单位元", note: "有 1 时更强" },
            { key: "extra", label: "无零因子", note: "整环增强" },
            { key: "field", label: "非零元可逆", note: "域增强" }
          ]
        },
        field: {
          name: "域候选",
          formula: "<F, +, ·>",
          target: 6,
          defaultReady: 5,
          axioms: [
            { key: "add", label: "加法交换群", note: "每个元素有加法逆元" },
            { key: "mul", label: "乘法交换", note: "非零元乘法封闭" },
            { key: "dist", label: "分配律", note: "两运算协调" },
            { key: "identity", label: "0 与 1", note: "两个单位清楚" },
            { key: "extra", label: "无零因子", note: "非零乘积不为 0" },
            { key: "field", label: "非零元可逆", note: "除法可行" }
          ]
        },
        boolean: {
          name: "布尔代数候选",
          formula: "<B, ∨, ∧, ¬>",
          target: 6,
          defaultReady: 4,
          axioms: [
            { key: "add", label: "并/或封闭", note: "a∨b∈B" },
            { key: "mul", label: "交/与封闭", note: "a∧b∈B" },
            { key: "dist", label: "互相分配", note: "∨ 与 ∧ 互配" },
            { key: "identity", label: "0 与 1", note: "有界结构" },
            { key: "extra", label: "补元", note: "a∨a'=1" },
            { key: "field", label: "德摩根", note: "补运算兼容" }
          ]
        }
      }
    }
  };

  let state = {
    scenarioKey: DATA[layer].defaultScenario,
    ready: DATA[layer].defaultReady,
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

  function currentData() {
    return DATA[layer];
  }

  function currentScenario() {
    return currentData().scenarios[state.scenarioKey] || currentData().scenarios[currentData().defaultScenario];
  }

  function control(label, body, small) {
    return '<div class="control-group"><label><span>' + esc(label) + '</span>' + (small ? '<small>' + esc(small) + '</small>' : '') + '</label>' + body + '</div>';
  }

  function selectControl(id, label, items, selected, small) {
    const options = items.map(item => '<option value="' + esc(item[0]) + '"' + (item[0] === selected ? " selected" : "") + '>' + esc(item[1]) + '</option>').join("");
    return control(label, '<select id="' + id + '">' + options + '</select>', small);
  }

  function rangeControl(id, label, value, min, max, step, small) {
    return control(label, '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '">', small);
  }

  function button(id, text, primary) {
    return '<button type="button" id="' + id + '" class="tool-btn' + (primary ? " primary" : "") + '">' + esc(text) + '</button>';
  }

  function buildControls() {
    const data = currentData();
    const scenarioItems = Object.entries(data.scenarios).map(([key, value]) => [key, value.name]);
    const scenario = currentScenario();
    controls.innerHTML =
      selectControl("scenarioSelect", layer === "basic" ? "目标结构" : "结构类型", scenarioItems, state.scenarioKey, scenario.formula)
      + rangeControl("readyRange", "已满足条件数", state.ready, 0, scenario.axioms.length - 1, 1, "逐级点亮")
      + '<div class="step-card" style="--step-count:' + data.steps.length + '"><div id="stepTrack" class="step-track"></div><div id="stepTitle" class="step-title"></div></div>'
      + '<div class="button-row three">' + button("prevStep", "上一步") + button("nextStep", "下一步", true) + button("resetCase", "重置") + '</div>'
      + '<div class="button-row">' + button("completeCase", layer === "basic" ? "补齐条件" : "生成完整结构", true) + button("challengeCase", "制造缺口") + '</div>';

    controls.querySelector("#scenarioSelect").addEventListener("change", event => {
      state.scenarioKey = event.target.value;
      state.ready = currentScenario().defaultReady;
      state.step = 0;
      state.focus = null;
      buildControls();
      render();
    });
    controls.querySelector("#readyRange").addEventListener("input", event => {
      state.ready = Number(event.target.value);
      state.focus = null;
      render();
    });
    controls.querySelector("#prevStep").addEventListener("click", () => {
      state.step = Math.max(0, state.step - 1);
      render();
    });
    controls.querySelector("#nextStep").addEventListener("click", () => {
      state.step = Math.min(currentData().steps.length - 1, state.step + 1);
      state.ready = Math.max(state.ready, Math.min(currentScenario().axioms.length - 1, state.step));
      updateReadyControl();
      render();
    });
    controls.querySelector("#resetCase").addEventListener("click", () => {
      state.ready = currentScenario().defaultReady;
      state.step = 0;
      state.focus = null;
      updateReadyControl();
      render();
    });
    controls.querySelector("#completeCase").addEventListener("click", () => {
      state.ready = currentScenario().target - 1;
      state.step = currentData().steps.length - 1;
      state.focus = "score";
      updateReadyControl();
      render();
    });
    controls.querySelector("#challengeCase").addEventListener("click", () => {
      state.ready = Math.max(0, currentScenario().target - 2);
      state.step = Math.max(1, currentData().steps.length - 2);
      state.focus = currentScenario().axioms[state.ready + 1]?.key || null;
      updateReadyControl();
      render();
    });
  }

  function updateReadyControl() {
    const el = document.getElementById("readyRange");
    if (el) el.value = state.ready;
  }

  function metCount() {
    return Math.min(currentScenario().axioms.length, state.ready + 1);
  }

  function isComplete() {
    return metCount() >= currentScenario().target;
  }

  function missingAxiom() {
    return currentScenario().axioms[metCount()];
  }

  function renderStep() {
    const steps = currentData().steps;
    const step = steps[state.step];
    document.getElementById("stepTrack").innerHTML = steps.map((_, index) => '<span class="step-dot' + (index <= state.step ? " is-active" : "") + '"></span>').join("");
    document.getElementById("stepTitle").innerHTML = '<b>' + esc(step.title) + '</b><br>' + esc(step.text);
    stepHint.innerHTML = '<b>' + esc(currentScenario().name) + '：</b>' + esc(step.text);
  }

  function hotKeys() {
    const step = currentData().steps[state.step];
    const keys = new Set(step.hot || []);
    if (state.focus) keys.add(state.focus);
    const missing = missingAxiom();
    if (missing && state.step >= currentData().steps.length - 2) keys.add(missing.key);
    return keys;
  }

  function drawText(text, x, y, cls, anchor) {
    const t = svgEl("text", { x, y, class: cls || "", "text-anchor": anchor || "middle" });
    t.textContent = text;
    return t;
  }

  function renderDiagram() {
    const scenario = currentScenario();
    const hot = hotKeys();
    diagramGroup.innerHTML = "";

    const shell = svgEl("rect", { x: 520, y: 52, width: 300, height: 180, rx: 16, class: "system-shell" });
    diagramGroup.appendChild(shell);
    diagramGroup.appendChild(drawText(scenario.name, 670, 93, "system-title"));
    diagramGroup.appendChild(drawText(scenario.formula, 670, 132, "system-formula"));
    diagramGroup.appendChild(drawText(isComplete() ? "分类判定：条件已成型" : "分类判定：仍有条件缺口", 670, 170, "system-comment"));
    diagramGroup.appendChild(drawText("满足 " + metCount() + " / " + scenario.axioms.length + " 项", 670, 202, "system-comment"));

    const opNodes = layer === "basic"
      ? [{ label: "A", x: 568, y: 292 }, { label: "*", x: 670, y: 326 }, { label: "A", x: 772, y: 292 }]
      : [{ label: "+", x: 568, y: 286 }, { label: "·", x: 670, y: 332 }, { label: layer === "extend" ? "分配" : "*", x: 772, y: 286 }];
    opNodes.forEach((node, index) => {
      const circle = svgEl("circle", { cx: node.x, cy: node.y, r: index === 1 ? 38 : 32, class: "op-node" + (index === 1 || hot.has("add") || hot.has("mul") || hot.has("dist") ? " is-hot" : "") });
      diagramGroup.appendChild(circle);
      diagramGroup.appendChild(drawText(node.label, node.x, node.y + 1, "op-text"));
    });
    [[0, 1], [1, 2]].forEach(pair => {
      const a = opNodes[pair[0]], b = opNodes[pair[1]];
      diagramGroup.insertBefore(svgEl("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: "connector" + (hot.has("dist") ? " is-hot" : "") }), diagramGroup.firstChild);
    });

    const rowH = Math.min(58, 360 / scenario.axioms.length);
    scenario.axioms.forEach((axiom, index) => {
      const y = 46 + index * rowH;
      const met = index <= state.ready;
      const current = hot.has(axiom.key);
      const g = svgEl("g", {
        class: "axiom-row" + (met ? " is-met" : " is-missing") + (current ? " is-current" : ""),
        tabindex: "0",
        role: "button",
        "aria-label": axiom.label,
        "data-index": index
      });
      g.appendChild(svgEl("rect", { x: 54, y, width: 360, height: rowH - 10, rx: 12, class: "axiom-box" }));
      g.appendChild(drawText((met ? "已满足 " : "待补齐 ") + axiom.label, 82, y + 24, "axiom-label", "start"));
      g.appendChild(drawText(axiom.note, 82, y + 43, "axiom-note", "start"));
      g.addEventListener("click", () => {
        state.ready = index;
        state.focus = axiom.key;
        updateReadyControl();
        render();
      });
      g.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          state.ready = index;
          state.focus = axiom.key;
          updateReadyControl();
          render();
        }
      });
      diagramGroup.appendChild(g);
      if (index < scenario.axioms.length - 1) {
        diagramGroup.appendChild(svgEl("line", {
          x1: 235,
          y1: y + rowH - 10,
          x2: 235,
          y2: y + rowH,
          class: "connector" + (index < state.ready ? " is-hot" : "")
        }));
      }
    });
  }

  function formulaItems() {
    const scenario = currentScenario();
    const count = metCount();
    if (layer === "basic") {
      return [
        ["set", "载体", "A"],
        ["closure", "封闭", count >= 1 ? "✓" : "待查"],
        ["assoc", "结合", count >= 2 ? "✓" : "待查"],
        ["identity", "单位元", count >= 3 ? "e" : "待查"],
        ["inverse", "逆元", count >= 4 ? "a⁻¹" : "待查"],
        ["score", "层级", count + "/" + scenario.axioms.length]
      ];
    }
    return [
      ["add", "加法结构", count >= 1 ? "群" : "待查"],
      ["mul", "乘法结构", count >= 2 ? "半群" : "待查"],
      ["dist", "分配律", count >= 3 ? "✓" : "待查"],
      ["identity", "单位元", count >= 4 ? "0/1" : "待查"],
      ["extra", "增强条件", count >= 5 ? "✓" : "缺口"],
      ["field", "最高条件", count >= 6 ? "✓" : "待查"],
      ["score", "进度", count + "/" + scenario.axioms.length]
    ];
  }

  function renderFormula() {
    const hot = hotKeys();
    formulaText.innerHTML = '<div class="formula-grid">' + formulaItems().map(item => {
      return '<div class="formula-chip' + (hot.has(item[0]) ? " is-hot" : "") + '"><div class="formula-value">' + esc(item[2]) + '</div><div class="formula-label">' + esc(item[1]) + '</div></div>';
    }).join("") + '</div>';
  }

  function renderResult() {
    const scenario = currentScenario();
    const complete = isComplete();
    const missing = missingAxiom();
    resultValue.innerHTML = '<span class="truth-chip' + (complete ? "" : " false") + '">' + esc(complete ? "条件达标" : "继续补条件") + '</span>'
      + '<div>' + esc(scenario.name) + '：满足 ' + metCount() + ' / ' + scenario.axioms.length + ' 项，目标至少 ' + scenario.target + ' 项。</div>';
    resultExtra.innerHTML = '<b>当前反馈：</b>' + esc(complete
      ? "关键公理已经达到目标层级，可以进入案例迁移或与更强结构比较。"
      : "下一步优先检查「" + (missing ? missing.label : "后续条件") + "」，缺一项就会退回较弱结构。");
  }

  function renderHeader() {
    const scenario = currentScenario();
    boardTitle.textContent = cfg.title || "代数系统分类";
    boardSubtitle.textContent = scenario.formula + " · " + scenario.name;
  }

  function render() {
    renderHeader();
    renderStep();
    renderDiagram();
    renderFormula();
    renderResult();
  }

  function init() {
    svg.setAttribute("viewBox", "0 0 " + viewBox.w + " " + viewBox.h);
    state.ready = currentScenario().defaultReady;
    buildControls();
    render();
  }

  init();
})();
