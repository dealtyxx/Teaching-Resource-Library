(function () {
  "use strict";

  const app = document.getElementById("homoApp");
  if (!app) return;

  const LAYERS = {
    basic: {
      tag: "基础层",
      title: "同态保结构入门",
      concept: "映射 / 保运算 / 反例",
      sub: "低门槛 · 先看懂桥",
      task: "点选元素，比较先运算再映射与先映射再运算是否一致。",
      dots: "●○○",
      page: "homomorphism_isomorphism_system-basic.html",
      badge: "桥梁直觉"
    },
    advanced: {
      tag: "进阶层",
      title: "同态与同构判定台",
      concept: "hom / inj / surj / iso",
      sub: "核心掌握 · 结构判定",
      task: "按步骤检验同态、单射、满射与同构，追踪公式项和图高亮。",
      dots: "●●○",
      page: "homomorphism_isomorphism_system.html",
      badge: "公式判定"
    },
    extend: {
      tag: "拓展层",
      title: "结构迁移实验室",
      concept: "同构迁移 / 商结构 / 编码",
      sub: "高天花板 · 迁移应用",
      task: "把同态与同构用于编码、治理流程和结构复用的迁移分析。",
      dots: "●●●",
      page: "homomorphism_isomorphism_system-extend.html",
      badge: "迁移应用"
    }
  };

  const CASES = {
    basic: [
      {
        id: "parity-shift-fail",
        mode: "反例识别",
        title: "只连通不等于保结构",
        summary: "f(x)=x+1 mod 2 从 Z4 映到 Z2，满射但不保加法结构。",
        visual: "双结构 + 反例高亮",
        domainName: "源结构 A=Z4",
        codomainName: "目标结构 B=Z2",
        domainOp: "+ mod 4",
        codomainOp: "+ mod 2",
        mapLabel: "f",
        domain: ["0", "1", "2", "3"],
        codomain: ["0", "1"],
        mapping: [1, 0, 1, 0],
        pair: [1, 1],
        formula: ["f", "(", "a+b", ")", "=", "f(a)", "+", "f(b)"],
        status: { hom: false, inj: false, surj: true, iso: false },
        resultLabel: "不保结构",
        thought: "思政融入：桥梁不能只追求“连上”，还要守住关键关系不被扭曲；协同治理同样要看流程是否保留规则本意。",
        definition: "同态要求 f(a*b)=f(a)·f(b)。若等式被一个反例击破，就不能称为同态。",
        properties: ["映射覆盖了目标 0 和 1，所以是满射。", "0 与 2 都映到 1，1 与 3 都映到 0，所以不是单射。", "取 a=1,b=1 可直接发现保运算失败。"],
        steps: [
          { title: "观察映射", formula: "f: Z4 -> Z2, f(x)=x+1 mod 2", activeTerms: [0], domainFocus: [0,1,2,3], codomainFocus: [0,1], mapFocus: [0,1,2,3], feedback: "先看桥是否连通：四个源元素都被送入 Z2，目标两个元素都被覆盖。" },
          { title: "左路计算", formula: "f(1+1)=f(2)=1", activeTerms: [0,1,2,3], domainFocus: [1,2], codomainFocus: [1], mapFocus: [2], opFocusDomain: [1,1,2], feedback: "先在源结构中运算，1+1=2，再映射得到 f(2)=1。" },
          { title: "右路计算", formula: "f(1)+f(1)=0+0=0", activeTerms: [4,5,6,7], domainFocus: [1], codomainFocus: [0], mapFocus: [1], opFocusCodomain: [0,0,0], feedback: "先映射再在目标结构中运算，得到 0，与左路结果不同。" },
          { title: "形成判定", formula: "1 != 0, hom=false", activeTerms: [3,4,7], domainFocus: [1,2], codomainFocus: [0,1], mapFocus: [1,2], feedback: "一个反例足以判定不保结构：它是满射映射，但不是同态。" }
        ]
      },
      {
        id: "parity-hom",
        mode: "入门同态",
        title: "奇偶映射保加法结构",
        summary: "f(x)=x mod 2 把 Z4 的加法结构压缩到 Z2，保留奇偶关系。",
        visual: "压缩同态",
        domainName: "源结构 A=Z4",
        codomainName: "目标结构 B=Z2",
        domainOp: "+ mod 4",
        codomainOp: "+ mod 2",
        mapLabel: "f",
        domain: ["0", "1", "2", "3"],
        codomain: ["0", "1"],
        mapping: [0, 1, 0, 1],
        pair: [2, 3],
        formula: ["f", "(", "a+b", ")", "=", "f(a)", "+", "f(b)"],
        status: { hom: true, inj: false, surj: true, iso: false },
        resultLabel: "保结构但不一一",
        thought: "思政融入：把复杂信息压缩成关键结构，既要简化表达，也要保留核心关系；这是数据治理和基层信息汇聚中的结构意识。",
        definition: "同态可以允许多个源元素合并到同一个目标元素，只要运算关系被保留下来。",
        properties: ["奇数映到 1，偶数映到 0。", "映射不是单射，但保留了加法的奇偶结构。", "同态未必是同构，信息可能被压缩。"],
        steps: [
          { title: "观察映射", formula: "0,2 -> 0; 1,3 -> 1", activeTerms: [0], domainFocus: [0,1,2,3], codomainFocus: [0,1], mapFocus: [0,1,2,3], feedback: "奇偶映射把四个元素压缩为两个类别。" },
          { title: "左路计算", formula: "f(2+3)=f(1)=1", activeTerms: [0,1,2,3], domainFocus: [2,3,1], codomainFocus: [1], mapFocus: [1], opFocusDomain: [2,3,1], feedback: "先在 Z4 中加法：2+3=1，再映射为 1。" },
          { title: "右路计算", formula: "f(2)+f(3)=0+1=1", activeTerms: [4,5,6,7], domainFocus: [2,3], codomainFocus: [0,1], mapFocus: [2,3], opFocusCodomain: [0,1,1], feedback: "先映射再在 Z2 中加法，结果同样是 1。" },
          { title: "形成判定", formula: "hom=true, inj=false, surj=true", activeTerms: [0,3,4], domainFocus: [0,2], codomainFocus: [0], mapFocus: [0,2], feedback: "它保结构且满射，但不是单射，因此不是同构。" }
        ]
      }
    ],
    advanced: [
      {
        id: "z6-to-z3",
        mode: "满同态",
        title: "Z6 到 Z3 的模 3 同态",
        summary: "f(x)=x mod 3 保加法结构，满射但压缩了信息。",
        visual: "核合并 + 满同态",
        domainName: "源结构 A=Z6",
        codomainName: "目标结构 B=Z3",
        domainOp: "+ mod 6",
        codomainOp: "+ mod 3",
        mapLabel: "φ",
        domain: ["0", "1", "2", "3", "4", "5"],
        codomain: ["0", "1", "2"],
        mapping: [0, 1, 2, 0, 1, 2],
        pair: [4, 5],
        formula: ["φ", "(", "a+b", ")", "=", "φ(a)", "+", "φ(b)"],
        status: { hom: true, inj: false, surj: true, iso: false },
        resultLabel: "满同态",
        thought: "思政融入：多源信息可以汇聚成共同类别，但汇聚过程必须保持关键规则；这对应“求同而不乱同”的治理方法。",
        definition: "满同态是保运算且覆盖整个目标结构的映射，但它可能把多个源元素合并为同一目标元素。",
        properties: ["核包含 0 与 3，说明信息被压缩。", "目标 0、1、2 都有原像，所以是满射。", "不是单射，因此还不是同构。"],
        steps: [
          { title: "建立映射", formula: "φ(x)=x mod 3", activeTerms: [0], domainFocus: [0,1,2,3,4,5], codomainFocus: [0,1,2], mapFocus: [0,1,2,3,4,5], feedback: "先看整体桥梁：Z6 的六个元素按模 3 分成三类。" },
          { title: "左路计算", formula: "φ(4+5)=φ(3)=0", activeTerms: [0,1,2,3], domainFocus: [4,5,3], codomainFocus: [0], mapFocus: [3], opFocusDomain: [4,5,3], feedback: "先在源结构运算，4+5≡3，再映射到 0。" },
          { title: "右路计算", formula: "φ(4)+φ(5)=1+2≡0", activeTerms: [4,5,6,7], domainFocus: [4,5], codomainFocus: [1,2,0], mapFocus: [4,5], opFocusCodomain: [1,2,0], feedback: "先映射再在目标结构运算，也得到 0。" },
          { title: "判定性质", formula: "hom=true, inj=false, surj=true", activeTerms: [0,3,4], domainFocus: [1,4], codomainFocus: [1], mapFocus: [1,4], feedback: "保结构且满射，但两个不同元素可映到同一点，所以不是同构。" }
        ]
      },
      {
        id: "z4-isomorphism",
        mode: "同构判定",
        title: "Z4 与四阶旋转的同构",
        summary: "把加法 mod 4 映成旋转复合，四个元素一一对应且保运算。",
        visual: "一一保结构",
        domainName: "源结构 A=Z4",
        codomainName: "目标结构 B=R4",
        domainOp: "+ mod 4",
        codomainOp: "旋转复合",
        mapLabel: "ψ",
        domain: ["0", "1", "2", "3"],
        codomain: ["R0", "R90", "R180", "R270"],
        mapping: [0, 1, 2, 3],
        pair: [1, 2],
        formula: ["ψ", "(", "a+b", ")", "=", "ψ(a)", "∘", "ψ(b)"],
        status: { hom: true, inj: true, surj: true, iso: true },
        resultLabel: "同构",
        thought: "思政融入：形态可以不同，结构却能相同；认识问题要透过外在差异把握共同规律，同时尊重不同表达方式。",
        definition: "同构是既单又满的同态。它说明两个系统虽然符号不同，但结构本质一致。",
        properties: ["每个源元素有唯一目标，且目标全部覆盖。", "加法关系对应旋转复合关系。", "同构允许把一个系统中的结论迁移到另一个系统。"],
        steps: [
          { title: "建立对应", formula: "0->R0, 1->R90, 2->R180, 3->R270", activeTerms: [0], domainFocus: [0,1,2,3], codomainFocus: [0,1,2,3], mapFocus: [0,1,2,3], feedback: "四个元素一一对应，没有合并也没有遗漏。" },
          { title: "左路计算", formula: "ψ(1+2)=ψ(3)=R270", activeTerms: [0,1,2,3], domainFocus: [1,2,3], codomainFocus: [3], mapFocus: [3], opFocusDomain: [1,2,3], feedback: "先在 Z4 中运算，1+2=3，再映成 R270。" },
          { title: "右路计算", formula: "ψ(1)∘ψ(2)=R90∘R180=R270", activeTerms: [4,5,6,7], domainFocus: [1,2], codomainFocus: [1,2,3], mapFocus: [1,2], opFocusCodomain: [1,2,3], feedback: "先映射再复合旋转，得到同一个结果。" },
          { title: "同构结论", formula: "hom=true, inj=true, surj=true", activeTerms: [0,3,4], domainFocus: [0,1,2,3], codomainFocus: [0,1,2,3], mapFocus: [0,1,2,3], feedback: "保运算、单射、满射同时成立，因此两个系统同构。" }
        ]
      },
      {
        id: "bad-structure",
        mode: "反例诊断",
        title: "看似顺眼但破坏结构的映射",
        summary: "一个覆盖目标的映射，如果公式两边不一致，就不能承担结构迁移。",
        visual: "失真桥梁诊断",
        domainName: "源结构 A=Z5",
        codomainName: "目标结构 B=Z5",
        domainOp: "+ mod 5",
        codomainOp: "+ mod 5",
        mapLabel: "η",
        domain: ["0", "1", "2", "3", "4"],
        codomain: ["0", "1", "2", "3", "4"],
        mapping: [0, 2, 4, 1, 3],
        pair: [1, 1],
        formula: ["η", "(", "a+b", ")", "=", "η(a)", "+", "η(b)"],
        status: { hom: true, inj: true, surj: true, iso: true },
        resultLabel: "同构",
        thought: "思政融入：真正的迁移不是照搬外形，而是保持关系；把握本质结构，才能实现跨领域互鉴。",
        definition: "η(x)=2x mod 5 是 Z5 加法群的自同构，因为 2 与 5 互素。",
        properties: ["该映射既单又满。", "虽然元素位置被重排，但加法关系不变。", "同构支持把结论无损迁移到重命名后的系统。"],
        steps: [
          { title: "观察重排", formula: "η(x)=2x mod 5", activeTerms: [0], domainFocus: [0,1,2,3,4], codomainFocus: [0,1,2,3,4], mapFocus: [0,1,2,3,4], feedback: "它看起来在重排元素，但每个目标元素都恰好被命中一次。" },
          { title: "左路计算", formula: "η(1+1)=η(2)=4", activeTerms: [0,1,2,3], domainFocus: [1,2], codomainFocus: [4], mapFocus: [2], opFocusDomain: [1,1,2], feedback: "先在源结构加法，1+1=2，再映射到 4。" },
          { title: "右路计算", formula: "η(1)+η(1)=2+2=4", activeTerms: [4,5,6,7], domainFocus: [1], codomainFocus: [2,4], mapFocus: [1], opFocusCodomain: [2,2,4], feedback: "先映射再加法，也得到 4，结构被保留下来。" },
          { title: "同构结论", formula: "hom=true, inj=true, surj=true", activeTerms: [0,3,4], domainFocus: [0,1,2,3,4], codomainFocus: [0,1,2,3,4], mapFocus: [0,1,2,3,4], feedback: "它不只是同态，还是 Z5 到自身的同构。" }
        ]
      }
    ],
    extend: [
      {
        id: "governance-structure",
        mode: "结构迁移",
        title: "流程映射中的保结构迁移",
        summary: "把需求办理流程映到数字平台流程，检查顺序关系是否被保持。",
        visual: "流程同态",
        domainName: "线下流程 A",
        codomainName: "数字平台 B",
        domainOp: "先后衔接",
        codomainOp: "状态流转",
        mapLabel: "T",
        domain: ["受理", "核验", "办理", "反馈"],
        codomain: ["收件", "校验", "办结", "评价"],
        mapping: [0, 1, 2, 3],
        pair: [1, 2],
        formula: ["T", "(", "x∘y", ")", "=", "T(x)", "∘", "T(y)"],
        status: { hom: true, inj: true, surj: true, iso: true },
        resultLabel: "结构可迁移",
        thought: "思政融入：数字化转型不是把线下流程简单搬到线上，而是保持责任链、反馈链和服务链的关键关系。",
        definition: "流程同构强调步骤可重命名、载体可变化，但先后衔接和职责关系不能丢失。",
        properties: ["每个线下环节对应一个线上状态。", "办理顺序被平台状态流转保持。", "同构意味着可以把线下治理经验迁移到数字平台。"],
        steps: [
          { title: "建立对应", formula: "受理->收件, 核验->校验, 办理->办结, 反馈->评价", activeTerms: [0], domainFocus: [0,1,2,3], codomainFocus: [0,1,2,3], mapFocus: [0,1,2,3], feedback: "先看角色对应：流程载体变了，但每一环都有清晰承接。" },
          { title: "左路流程", formula: "T(核验∘办理)=校验∘办结", activeTerms: [0,1,2,3], domainFocus: [1,2], codomainFocus: [1,2], mapFocus: [1,2], opFocusDomain: [1,2,2], feedback: "先在线下流程中衔接核验与办理，再迁移到平台状态。" },
          { title: "右路流程", formula: "T(核验)∘T(办理)=校验∘办结", activeTerms: [4,5,6,7], domainFocus: [1,2], codomainFocus: [1,2], mapFocus: [1,2], opFocusCodomain: [1,2,2], feedback: "先映射到平台，再检查状态流转，结果一致。" },
          { title: "迁移结论", formula: "hom=true, inj=true, surj=true", activeTerms: [0,3,4], domainFocus: [0,1,2,3], codomainFocus: [0,1,2,3], mapFocus: [0,1,2,3], feedback: "责任链没有扭曲，说明结构可以被可信迁移。" }
        ]
      },
      {
        id: "quotient-code",
        mode: "商结构",
        title: "按余数分类的商结构同态",
        summary: "把整数按模 3 余数归类，理解核与信息压缩如何服务编码。",
        visual: "商映射 + 核",
        domainName: "源结构 A=Z6",
        codomainName: "商结构 B=Z3",
        domainOp: "+ mod 6",
        codomainOp: "+ mod 3",
        mapLabel: "q",
        domain: ["0", "1", "2", "3", "4", "5"],
        codomain: ["[0]", "[1]", "[2]"],
        mapping: [0, 1, 2, 0, 1, 2],
        pair: [3, 4],
        formula: ["q", "(", "a+b", ")", "=", "q(a)", "+", "q(b)"],
        status: { hom: true, inj: false, surj: true, iso: false },
        resultLabel: "商映射",
        thought: "思政融入：分类压缩要明确“保留什么、舍弃什么”；公共数据治理同样要在简化和真实之间保持结构底线。",
        definition: "商映射把属于同一核陪集的元素合并，得到更粗但仍保运算的结构。",
        properties: ["0 与 3 同属核类。", "该映射保结构但不单射。", "商结构帮助把复杂系统降维分析。"],
        steps: [
          { title: "分出等价类", formula: "0,3->[0]; 1,4->[1]; 2,5->[2]", activeTerms: [0], domainFocus: [0,3], codomainFocus: [0], mapFocus: [0,3], feedback: "先观察核类：0 和 3 被合并到同一个商元素。" },
          { title: "左路计算", formula: "q(3+4)=q(1)=[1]", activeTerms: [0,1,2,3], domainFocus: [3,4,1], codomainFocus: [1], mapFocus: [1], opFocusDomain: [3,4,1], feedback: "先在源结构相加，3+4=1，再进入商结构。" },
          { title: "右路计算", formula: "q(3)+q(4)=[0]+[1]=[1]", activeTerms: [4,5,6,7], domainFocus: [3,4], codomainFocus: [0,1], mapFocus: [3,4], opFocusCodomain: [0,1,1], feedback: "先分类再相加，结果仍是 [1]。" },
          { title: "迁移判断", formula: "保结构但有压缩", activeTerms: [0,3,4], domainFocus: [0,3], codomainFocus: [0], mapFocus: [0,3], feedback: "它适合降维分析，但不能无损还原每个源元素。" }
        ]
      },
      {
        id: "coding-parity",
        mode: "编码校验",
        title: "奇偶校验的同态视角",
        summary: "把二进制消息映到校验位，观察异或结构如何被保留。",
        visual: "编码同态",
        domainName: "消息空间 A",
        codomainName: "校验空间 B",
        domainOp: "异或",
        codomainOp: "异或",
        mapLabel: "p",
        domain: ["00", "01", "10", "11"],
        codomain: ["0", "1"],
        mapping: [0, 1, 1, 0],
        pair: [1, 2],
        formula: ["p", "(", "u⊕v", ")", "=", "p(u)", "⊕", "p(v)"],
        status: { hom: true, inj: false, surj: true, iso: false },
        resultLabel: "校验同态",
        thought: "思政融入：可靠系统需要可复核的规则。校验位虽然压缩信息，却保留了错误检测所需的关键结构。",
        definition: "奇偶校验把消息向量映到一位校验值，它不是同构，但保留异或结构。",
        properties: ["00 与 11 的校验同为 0。", "01 与 10 的校验同为 1。", "它能辅助发现错误，但不能完整恢复原消息。"],
        steps: [
          { title: "建立校验", formula: "p(00)=0, p(01)=1, p(10)=1, p(11)=0", activeTerms: [0], domainFocus: [0,1,2,3], codomainFocus: [0,1], mapFocus: [0,1,2,3], feedback: "校验位把四种消息压缩成奇偶两类。" },
          { title: "左路计算", formula: "p(01⊕10)=p(11)=0", activeTerms: [0,1,2,3], domainFocus: [1,2,3], codomainFocus: [0], mapFocus: [3], opFocusDomain: [1,2,3], feedback: "先异或两条消息，得到 11，再求校验为 0。" },
          { title: "右路计算", formula: "p(01)⊕p(10)=1⊕1=0", activeTerms: [4,5,6,7], domainFocus: [1,2], codomainFocus: [1,0], mapFocus: [1,2], opFocusCodomain: [1,1,0], feedback: "先取校验再异或，也得到 0。" },
          { title: "应用判断", formula: "hom=true, inj=false, surj=true", activeTerms: [0,3,4], domainFocus: [0,3], codomainFocus: [0], mapFocus: [0,3], feedback: "它保留了错误检测所需结构，但不是无损同构。" }
        ]
      }
    ]
  };

  const state = {
    layer: detectLayer(),
    caseIndex: 0,
    step: 0,
    activeIndex: 0,
    speed: 900,
    autoTimer: null,
    tierCollapsed: false
  };

  function detectLayer() {
    const explicit = app.dataset.layer;
    if (explicit && LAYERS[explicit]) return explicit;
    const path = window.location.pathname;
    if (path.includes("basic")) return "basic";
    if (path.includes("extend")) return "extend";
    return "advanced";
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

  function casesForLayer() {
    return CASES[state.layer] || CASES.advanced;
  }

  function currentCase() {
    const list = casesForLayer();
    return list[state.caseIndex] || list[0];
  }

  function currentStep(caseData) {
    return caseData.steps[Math.min(state.step, caseData.steps.length - 1)];
  }

  function uniq(values) {
    return [...new Set(values.filter(v => v !== undefined && v !== null))];
  }

  function renderApp() {
    const layer = LAYERS[state.layer];
    const caseData = currentCase();
    if (state.activeIndex >= caseData.domain.length) state.activeIndex = caseData.pair[0] || 0;
    const step = currentStep(caseData);
    document.body.dataset.layer = state.layer;
    document.title = `第9章 代数系统 - ${layer.title}（${layer.tag}）`;
    app.className = "homo-app";
    app.innerHTML = `
      <aside class="sidebar">${renderSidebar(layer, caseData)}</aside>
      <main class="visualizer-stage">
        ${renderTierBoard()}
        ${renderMission(caseData)}
        <div class="workspace">
          <section class="graph-pane">
            <div class="homo-pipeline">
              ${renderStage("01", "结构对象 · 映射桥", "源结构 / 目标结构 / 映射线", `
                <div class="panel-title">
                  <div>
                    <h2>${esc(caseData.title)}</h2>
                    <p>${esc(caseData.summary)}</p>
                  </div>
                  <div class="visual-badge">${esc(caseData.visual)}</div>
                </div>
                <div class="mapping-wrap">${renderMapping(caseData, step)}</div>
              `)}
              ${renderStage("02", "公式序列 · 双路比较", "先运算再映射 / 先映射再运算", `
                ${renderFormula(caseData, step)}
                ${renderRouteStrip(caseData, step)}
              `)}
              ${renderStage("03", "性质判定 · 状态归纳", "hom / inj / surj / iso", `
                ${renderSteps(caseData)}
                ${renderStatusStrip(caseData)}
              `)}
              ${renderStage("04", "结构迁移 · 思政融入", "概念提示 / 关键观察 / 价值迁移", `
                ${renderInsightPack(caseData, step)}
              `)}
            </div>
          </section>
        </div>
      </main>
    `;
  }

  function renderSidebar(layer, caseData) {
    const list = casesForLayer();
    const modes = uniq(list.map(item => item.mode));
    return `
      <div class="layer-summary">
        <div class="window-controls" aria-hidden="true"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
        <span class="tier-pill">${esc(layer.tag)} · ${esc(layer.badge)}</span>
        <h1>${esc(layer.title)}</h1>
        <p class="subtitle">${esc(layer.concept)}</p>
        <p class="goal">${esc(layer.sub)}<br>目标：${esc(layer.task)}</p>
      </div>
      ${renderValuePanel()}
      <div class="control-stack">
        <div class="control-group">
          <label>案例类型</label>
          <div class="segmented">
            ${modes.map(mode => `<button type="button" class="${mode === caseData.mode ? "active" : ""}" data-action="mode" data-mode="${esc(mode)}">${esc(mode)}</button>`).join("")}
          </div>
        </div>
        <div class="control-group">
          <label for="caseSelector">案例</label>
          <select id="caseSelector" data-control="case">
            ${list.map((item, index) => `<option value="${index}" ${index === state.caseIndex ? "selected" : ""}>${esc(item.title)}</option>`).join("")}
          </select>
        </div>
        <div class="control-group">
          <span class="mini-label">点选源元素</span>
          <div class="node-picker">
            ${caseData.domain.map((label, index) => `<button type="button" class="${index === state.activeIndex ? "active" : ""}" data-node="${index}">${esc(label)}</button>`).join("")}
          </div>
          <p class="sidebar-note">${esc(probeText(caseData))}</p>
        </div>
        <div class="control-group">
          <label for="speedControl">自动演示速度</label>
          <input id="speedControl" data-control="speed" type="range" min="420" max="1500" step="60" value="${state.speed}">
        </div>
        <div class="control-group">
          <span class="mini-label">步进控制</span>
          <div class="step-controls">
            <button type="button" data-action="prev">上一步</button>
            <button type="button" class="primary" data-action="next">下一步</button>
            <button type="button" data-action="auto">${state.autoTimer ? "暂停" : "自动"}</button>
            <button type="button" data-action="reset">重置</button>
          </div>
        </div>
        ${renderProgress(caseData)}
        ${renderSidebarStatus(caseData, currentStep(caseData))}
      </div>
      ${renderLegend()}
    `;
  }

  function renderValuePanel() {
    return `
      <section class="value-panel">
        <h3>结构互鉴 · 保真迁移</h3>
        <p>把一个系统的关系映到另一个系统时，既要看到共性结构，也要尊重差异表达；同态帮助我们有条件地迁移经验，同构提醒我们何时可以无损互鉴。</p>
        <div class="dim-list"><span>结构意识</span><span>协同互通</span><span>实践迁移</span></div>
      </section>
    `;
  }

  function renderProgress(caseData) {
    const percent = Math.round((state.step + 1) / caseData.steps.length * 100);
    return `
      <div class="control-group progress-group">
        <div class="homo-progress-head">
          <span class="mini-label">推演进度</span>
          <span class="homo-progress-num">${percent}%</span>
        </div>
        <div class="homo-progress-wrap" aria-label="推演进度">
          <i style="width:${percent}%"></i>
        </div>
      </div>
    `;
  }

  function renderSidebarStatus(caseData, step) {
    return `
      <section class="homo-status" aria-live="polite">
        <b>第 ${state.step + 1} 步：${esc(step.title)}</b>
        <span>${esc(step.feedback)}</span>
      </section>
    `;
  }

  function renderLegend() {
    const items = [
      ["A", "源结构：先在这里做原运算"],
      ["f", "映射桥：把元素送到目标结构"],
      ["B", "目标结构：比较映射后的运算"],
      ["红线", "当前被公式调用的映射"],
      ["蓝线", "本步正在检查的运算路径"],
      ["状态", "hom / inj / surj / iso 判定"]
    ];
    return `
      <section class="legend-panel">
        <div class="legend-title">互动图例</div>
        <div class="legend-grid">
          ${items.map(([key, text]) => `
            <div class="legend-item">
              <span class="legend-key">${esc(key)}</span>
              <span class="legend-desc">${esc(text)}</span>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderTierBoard() {
    const collapsed = state.tierCollapsed ? " collapsed" : "";
    return `
      <section class="tier-board${collapsed}">
        <div class="tier-board-head">
          <div class="tier-board-title">三阶层次案例<span class="tier-board-sub">低门槛 · 高天花板 · 一点一点推演</span></div>
          <button class="tier-board-toggle" type="button" data-action="toggle-tier">${state.tierCollapsed ? "展开" : "收起"}</button>
        </div>
        <div class="tier-ladder">
          ${Object.entries(LAYERS).map(([key, item]) => renderTierCard(key, item)).join("")}
        </div>
      </section>
    `;
  }

  function renderTierCard(key, item) {
    const current = key === state.layer;
    return `
      <a class="tier-card ${esc(key)}${current ? " current" : ""}" href="${esc(item.page)}">
        <div class="tier-card-top">
          <span class="tier-tag">${esc(item.tag)}</span>
          <span class="tier-dots">${esc(item.dots)}</span>
        </div>
        <h3>${esc(item.title)}</h3>
        <div class="concept">${esc(item.concept)}</div>
        <p>${esc(item.sub)}</p>
        <p>目标：${esc(item.task)}</p>
        <span class="tier-card-btn">${current ? "你在本层" : "进入本层互动页"}</span>
      </a>
    `;
  }

  function renderMission(caseData) {
    return `
      <section class="mission-card">
        <span><b>互动任务：</b>${esc(caseData.summary)} 按“映射观察 → 双路计算 → 性质判定”推进，观察公式项、映射线与状态标签同步变化。</span>
        <div class="visual-badge">${esc(caseData.visual)}</div>
      </section>
    `;
  }

  function renderStage(num, title, hint, body) {
    return `
      <section class="homo-stage-card">
        <div class="homo-stage-head">
          <span class="homo-stage-num">${esc(num)}</span>
          <span class="homo-stage-title">${esc(title)}</span>
          <span class="homo-stage-hint">${esc(hint)}</span>
        </div>
        <div class="homo-stage-body">${body}</div>
      </section>
    `;
  }

  function probeText(caseData) {
    const i = state.activeIndex;
    const target = caseData.mapping[i];
    const label = caseData.domain[i];
    const image = caseData.codomain[target];
    return `当前点选 ${label}，映射到 ${image}。看红色映射线是否参与本步公式检验。`;
  }

  function renderMapping(caseData, step) {
    const left = getPoints(caseData.domain.length, 176, "domain", caseData);
    const right = getPoints(caseData.codomain.length, 544, "codomain", caseData);
    const domainFocus = new Set([state.activeIndex, ...(step.domainFocus || [])]);
    const codomainFocus = new Set([caseData.mapping[state.activeIndex], ...(step.codomainFocus || [])]);
    const mapFocus = new Set([state.activeIndex, ...(step.mapFocus || [])]);
    const mapLines = caseData.domain.map((_, index) => {
      const a = left[index];
      const b = right[caseData.mapping[index]];
      const hot = mapFocus.has(index) ? " hot" : "";
      return renderMapPath(a, b, index, caseData.domain.length, hot);
    }).join("");
    const opDomain = renderOpLine(left, step.opFocusDomain, "op-line hot");
    const opCodomain = renderOpLine(right, step.opFocusCodomain, "op-line hot");
    const domainNodes = caseData.domain.map((label, index) => renderNode(label, left[index], index, "domain", domainFocus.has(index))).join("");
    const codomainNodes = caseData.codomain.map((label, index) => renderNode(label, right[index], index, "codomain", codomainFocus.has(index))).join("");
    return `
      <svg class="mapping-svg" viewBox="0 0 720 330" role="img" aria-label="${esc(caseData.title)}互动映射图">
        <defs>
          <linearGradient id="systemFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fffdf8"></stop>
            <stop offset="100%" stop-color="#fff7e8"></stop>
          </linearGradient>
          <radialGradient id="nodeFill" cx="42%" cy="30%" r="72%">
            <stop offset="0%" stop-color="#fffaf0"></stop>
            <stop offset="100%" stop-color="#ffe8a8"></stop>
          </radialGradient>
          <linearGradient id="pickedNodeFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ef4a25"></stop>
            <stop offset="100%" stop-color="#bf2d18"></stop>
          </linearGradient>
          <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#d63b1d"></stop>
            <stop offset="100%" stop-color="#ffb400"></stop>
          </linearGradient>
        </defs>
        <rect class="system-box" x="52" y="36" width="250" height="258" rx="12"></rect>
        <rect class="system-box" x="418" y="36" width="250" height="258" rx="12"></rect>
        <text class="system-title" x="176" y="66" text-anchor="middle">${esc(caseData.domainName)}</text>
        <text class="system-title" x="544" y="66" text-anchor="middle">${esc(caseData.codomainName)}</text>
        <text class="op-label" x="176" y="284" text-anchor="middle">${esc(caseData.domainOp)}</text>
        <text class="op-label" x="544" y="284" text-anchor="middle">${esc(caseData.codomainOp)}</text>
        <g class="map-layer">${mapLines}</g>
        <g class="op-layer">${opDomain}${opCodomain}</g>
        <rect class="bridge-halo" x="304" y="123" width="112" height="84" rx="38"></rect>
        <rect class="bridge-pill" x="318" y="136" width="84" height="58" rx="29"></rect>
        <text class="bridge-label" x="360" y="170">${esc(caseData.mapLabel)}</text>
        <g class="node-layer">${domainNodes}${codomainNodes}</g>
      </svg>
    `;
  }

  function renderMapPath(a, b, index, total, hot) {
    const nodeRadius = 22;
    const bridgeLeftX = 318;
    const bridgeRightX = 402;
    const bridgeY = 165;
    const laneStep = total <= 4 ? 7 : 5;
    const lane = (index - (total - 1) / 2) * laneStep;
    const leftLaneY = Math.round(bridgeY + lane);
    const rightLaneY = Math.round(bridgeY + lane * 0.74);
    const sx = Math.round(a.x + nodeRadius + 6);
    const tx = Math.round(b.x - nodeRadius - 6);
    const leftMidX = Math.round((sx + bridgeLeftX) / 2);
    const rightMidX = Math.round((bridgeRightX + tx) / 2);
    const cls = `map-line${hot}`;
    return `
      <path class="${cls}" d="M ${sx} ${a.y} C ${leftMidX} ${a.y}, ${leftMidX} ${leftLaneY}, ${bridgeLeftX} ${leftLaneY}"></path>
      <path class="${cls}" d="M ${bridgeRightX} ${rightLaneY} C ${rightMidX} ${rightLaneY}, ${rightMidX} ${b.y}, ${tx} ${b.y}"></path>
    `;
  }
  function getPoints(count, cx, side, caseData) {
    const labels = side === "domain" ? caseData.domain : caseData.codomain;
    const isTextFlow = labels.some(label => {
      const text = String(label);
      return text.length > 1 && !/^(R\d+|\[?\d+\]?|\d{2})$/.test(text);
    });

    if (isTextFlow && count === 4) {
      return [112, 154, 202, 244].map(y => ({ x: cx, y }));
    }

    if (count === 2) {
      return [
        { x: cx, y: 126 },
        { x: cx, y: 214 }
      ];
    }

    if (count === 3) {
      return [
        { x: cx, y: 118 },
        { x: cx + 62, y: 216 },
        { x: cx - 62, y: 216 }
      ];
    }

    if (count === 4) {
      return [
        { x: cx, y: 112 },
        { x: cx + 66, y: 166 },
        { x: cx, y: 224 },
        { x: cx - 66, y: 166 }
      ];
    }

    if (count === 5) {
      return [
        { x: cx, y: 108 },
        { x: cx + 70, y: 150 },
        { x: cx + 42, y: 224 },
        { x: cx - 42, y: 224 },
        { x: cx - 70, y: 150 }
      ];
    }

    if (count === 6) {
      return [
        { x: cx, y: 106 },
        { x: cx + 62, y: 136 },
        { x: cx + 62, y: 204 },
        { x: cx, y: 234 },
        { x: cx - 62, y: 204 },
        { x: cx - 62, y: 136 }
      ];
    }

    const cy = 166;
    const rx = 72;
    const ry = Math.min(62, 46 + count * 3);
    const start = -Math.PI / 2;
    return Array.from({ length: count }, (_, index) => {
      const angle = start + index * Math.PI * 2 / count;
      return {
        x: Math.round(cx + Math.cos(angle) * rx),
        y: Math.round(cy + Math.sin(angle) * ry)
      };
    });
  }
  function renderOpLine(points, tuple, cls) {
    if (!tuple || tuple.length < 3) return "";
    const [a, b, out] = tuple;
    const p1 = points[a];
    const p2 = points[b];
    const p3 = points[out];
    if (!p1 || !p2 || !p3) return "";
    return `
      <line class="${cls}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"></line>
      <line class="${cls}" x1="${p2.x}" y1="${p2.y}" x2="${p3.x}" y2="${p3.y}"></line>
    `;
  }

  function renderNode(label, point, index, side, focused) {
    const picked = side === "domain" && index === state.activeIndex;
    const classes = ["node-group", focused ? "focus" : "", picked ? "picked" : ""].filter(Boolean).join(" ");
    return `
      <g class="${classes}" data-node="${side === "domain" ? index : ""}">
        <circle class="node-circle" cx="${point.x}" cy="${point.y}" r="22"></circle>
        <text class="node-text" x="${point.x}" y="${point.y}">${esc(label)}</text>
      </g>
    `;
  }

  function renderFormula(caseData, step) {
    const active = new Set(step.activeTerms || []);
    return `
      <section class="formula-card" aria-label="公式项高亮">
        <div class="formula-title">公式项高亮</div>
        <div class="formula-track">
          ${caseData.formula.map((token, index) => `<span class="formula-token ${active.has(index) ? "active" : ""}">${esc(token)}</span>`).join("")}
        </div>
        <div class="formula-note">${esc(step.formula)}</div>
      </section>
    `;
  }

  function renderRouteStrip(caseData, step) {
    const [a, b] = caseData.pair;
    const leftLabel = caseData.domain[a] && caseData.domain[b] ? `${caseData.domain[a]} 与 ${caseData.domain[b]}` : "当前元素对";
    const rightFocus = (step.codomainFocus || []).map(index => caseData.codomain[index]).filter(Boolean).join("、") || "等待比较";
    return `
      <div class="route-strip">
        <div class="route-card ${state.step === 1 ? "active" : ""}">
          <b>左路</b>
          <span>先在 A 中运算：${esc(leftLabel)}</span>
        </div>
        <div class="route-card ${state.step === 2 ? "active" : ""}">
          <b>右路</b>
          <span>先映射到 B：${esc(rightFocus)}</span>
        </div>
        <div class="route-card ${state.step >= 3 ? "active" : ""}">
          <b>判定</b>
          <span>${esc(caseData.resultLabel)}</span>
        </div>
      </div>
    `;
  }

  function renderSteps(caseData) {
    return `
      <div class="operation-steps" aria-label="步进反馈">
        ${caseData.steps.map((step, index) => `
          <button type="button" class="step-card ${index === state.step ? "active" : ""}" data-action="jump" data-step="${index}">
            <span class="index">${String(index + 1).padStart(2, "0")}</span>
            <b>${esc(step.title)}</b>
            <small>${esc(step.formula)}</small>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderFeedback(caseData, step) {
    return `
      <section class="info-card">
        <h3>当前反馈</h3>
        <div class="feedback-main">${esc(step.feedback)}</div>
        <div class="thought-box">${esc(caseData.thought)}</div>
      </section>
    `;
  }

  function renderStatusStrip(caseData) {
    const s = caseData.status;
    return `
      <div class="status-card status-inline">
        <div class="status-row">
          ${statusChip("hom", s.hom)}
          ${statusChip("inj", s.inj)}
          ${statusChip("surj", s.surj)}
          ${statusChip("iso", s.iso)}
        </div>
        <div class="status-label">${esc(caseData.resultLabel)}</div>
      </div>
    `;
  }

  function renderInsightPack(caseData, step) {
    return `
      <div class="insight-pack">
        <div class="feedback-main">${esc(step.feedback)}</div>
        <div class="thought-box">${esc(caseData.thought)}</div>
        <div class="definition-mini">
          <b>概念提示</b>
          <span>${esc(caseData.definition)}</span>
        </div>
        <div class="property-list compact">
          ${caseData.properties.map((item, index) => `
            <div class="property-item">
              <span class="mark">${index + 1}</span>
              <span>${esc(item)}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderStatus(caseData) {
    const s = caseData.status;
    return `
      <section class="info-card">
        <div class="status-card">
          <div class="status-row">
            ${statusChip("hom", s.hom)}
            ${statusChip("inj", s.inj)}
            ${statusChip("surj", s.surj)}
            ${statusChip("iso", s.iso)}
          </div>
          <div class="status-label">${esc(caseData.resultLabel)}</div>
        </div>
      </section>
    `;
  }

  function statusChip(name, value) {
    return `<span class="status-chip ${value ? "" : "false"}">${esc(name)}=${value ? "true" : "false"}</span>`;
  }

  function renderDefinition(caseData) {
    return `
      <section class="info-card">
        <h3>概念提示</h3>
        <p>${esc(caseData.definition)}</p>
        <div class="formula-note">${esc(caseData.formula.join(" "))}</div>
      </section>
    `;
  }

  function renderProperties(caseData) {
    return `
      <section class="info-card">
        <h3>关键观察</h3>
        <div class="property-list">
          ${caseData.properties.map((item, index) => `
            <div class="property-item">
              <span class="mark">${index + 1}</span>
              <span>${esc(item)}</span>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  function stopAuto() {
    if (state.autoTimer) {
      clearInterval(state.autoTimer);
      state.autoTimer = null;
    }
  }

  function resetCase() {
    stopAuto();
    const caseData = currentCase();
    state.step = 0;
    state.activeIndex = caseData.pair[0] || 0;
  }

  function setCase(index) {
    stopAuto();
    state.caseIndex = index;
    const caseData = currentCase();
    state.step = 0;
    state.activeIndex = caseData.pair[0] || 0;
  }

  function setMode(mode) {
    const index = casesForLayer().findIndex(item => item.mode === mode);
    if (index >= 0) setCase(index);
  }

  app.addEventListener("click", event => {
    const node = event.target.closest("[data-node]");
    if (node && node.dataset.node !== "") {
      state.activeIndex = Number(node.dataset.node);
      renderApp();
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.action;
    const caseData = currentCase();
    if (action === "prev") {
      stopAuto();
      state.step = Math.max(0, state.step - 1);
    } else if (action === "next") {
      stopAuto();
      state.step = Math.min(caseData.steps.length - 1, state.step + 1);
    } else if (action === "reset") {
      resetCase();
    } else if (action === "jump") {
      stopAuto();
      state.step = Number(actionButton.dataset.step) || 0;
    } else if (action === "mode") {
      setMode(actionButton.dataset.mode);
    } else if (action === "toggle-tier") {
      state.tierCollapsed = !state.tierCollapsed;
    } else if (action === "auto") {
      if (state.autoTimer) {
        stopAuto();
      } else {
        state.autoTimer = setInterval(() => {
          const activeCase = currentCase();
          if (state.step >= activeCase.steps.length - 1) {
            stopAuto();
          } else {
            state.step += 1;
          }
          renderApp();
        }, state.speed);
      }
    }
    renderApp();
  });

  app.addEventListener("change", event => {
    const control = event.target.closest("[data-control]");
    if (!control) return;
    if (control.dataset.control === "case") {
      setCase(Number(control.value) || 0);
      renderApp();
    }
  });

  app.addEventListener("input", event => {
    const control = event.target.closest("[data-control]");
    if (!control) return;
    if (control.dataset.control === "speed") {
      state.speed = Number(control.value) || 900;
    }
  });

  resetCase();
  renderApp();
})();
