(function () {
  "use strict";

  const app = document.getElementById("specialElementsApp");
  if (!app) return;

  const LAYERS = {
    basic: {
      tag: "基础层",
      title: "特殊元素入门",
      concept: "单位元 / 零元 / 简单逆元",
      sub: "低门槛 · 建立直觉",
      task: "点选元素，看它是否保持不变、吸收结果或抵消回到基准。",
      dots: "●○○",
      page: "special_elements-basic.html",
      badge: "概念识别"
    },
    advanced: {
      tag: "进阶层",
      title: "特殊元素探测器",
      concept: "幂等 · 单位 · 零 · 逆",
      sub: "核心掌握 · 判定证明",
      task: "按步骤检验公式项，追踪特殊元素在运算图中的高亮变化。",
      dots: "●●○",
      page: "special_elements.html",
      badge: "公式判定"
    },
    extend: {
      tag: "拓展层",
      title: "可逆恢复实验室",
      concept: "恒等映射 / 逆操作 / 可还原",
      sub: "高天花板 · 迁移应用",
      task: "把单位元与逆元迁移到加解密、置换和矩阵恢复场景。",
      dots: "●●●",
      page: "special_elements-extend.html",
      badge: "迁移工程"
    }
  };

  const TYPE_LABELS = {
    identity: "单位元",
    zero: "零元",
    inverse: "逆元",
    idempotent: "幂等元",
    recover: "可逆恢复",
    permute: "置换还原",
    matrix: "单位阵"
  };

  const CASES = {
    basic: [
      {
        id: "z5-add-identity",
        type: "identity",
        title: "Z5 加法中的单位元",
        summary: "在模 5 加法里，找到“加上它不改变任何元素”的基准元素。",
        visual: "元素环 + 单位检验",
        set: ["0", "1", "2", "3", "4"],
        center: "+",
        op: "add",
        n: 5,
        identity: 0,
        special: [0],
        activeStart: 2,
        formula: ["e", "+", "a", "≡", "a", "(mod 5)"],
        definition: {
          title: "单位元",
          text: "若存在 e，使得任意 a 都满足 e∘a=a∘e=a，则 e 是该运算的单位元。"
        },
        properties: ["要同时检查左侧和右侧。", "单位元若存在则唯一。", "加法 mod n 的单位元通常是 0。"],
        steps: [
          { title: "锁定候选", formula: "候选 e=0", activeTerms: [0], focus: [0], feedback: "先把 0 作为候选单位元，观察它是否保持其他元素不变。" },
          { title: "左侧检验", formula: "0 + 2 ≡ 2 (mod 5)", activeTerms: [0, 1, 2, 3, 4], focus: [0, 2], resultIndex: 2, feedback: "左单位成立：0 放在左边时，2 没有被改变。" },
          { title: "右侧检验", formula: "2 + 0 ≡ 2 (mod 5)", activeTerms: [2, 3, 4], focus: [2, 0], resultIndex: 2, feedback: "右单位也成立：0 放在右边时，结果仍是 2。" },
          { title: "形成结论", formula: "∀a∈Z5, 0+a=a+0=a", activeTerms: [0, 2, 4], focus: [0], feedback: "对所有元素都成立，因此 0 是 Z5 加法的单位元。" }
        ]
      },
      {
        id: "z6-mul-zero",
        type: "zero",
        title: "Z6 乘法中的零元",
        summary: "在模 6 乘法里，观察哪个元素会把任意输入吸收到自身。",
        visual: "吸收边高亮",
        set: ["0", "1", "2", "3", "4", "5"],
        center: "×",
        op: "mul",
        n: 6,
        zero: 0,
        special: [0],
        activeStart: 4,
        formula: ["θ", "×", "a", "≡", "θ", "(mod 6)"],
        definition: {
          title: "零元",
          text: "若存在 θ，使得任意 a 都满足 θ∘a=a∘θ=θ，则 θ 是该运算的零元。"
        },
        properties: ["零元表现为吸收性。", "也要左右两侧都成立。", "乘法 mod n 的 0 会吸收所有元素。"],
        steps: [
          { title: "锁定候选", formula: "候选 θ=0", activeTerms: [0], focus: [0], feedback: "把 0 作为吸收元素候选，先观察它与任意元素相乘的结果。" },
          { title: "左吸收", formula: "0 × 4 ≡ 0 (mod 6)", activeTerms: [0, 1, 2, 3, 4], focus: [0, 4], resultIndex: 0, feedback: "0 在左边时，4 被吸收到 0。" },
          { title: "右吸收", formula: "4 × 0 ≡ 0 (mod 6)", activeTerms: [2, 3, 4], focus: [4, 0], resultIndex: 0, feedback: "0 在右边时，结果仍回到 0。" },
          { title: "形成结论", formula: "∀a∈Z6, 0×a=a×0=0", activeTerms: [0, 2, 4], focus: [0], feedback: "对全部元素都成立，所以 0 是 Z6 乘法的零元。" }
        ]
      },
      {
        id: "z6-add-inverse",
        type: "inverse",
        title: "Z6 加法中的逆元配对",
        summary: "以 0 为单位元，寻找能把 2 抵消回 0 的元素。",
        visual: "逆元匹配",
        set: ["0", "1", "2", "3", "4", "5"],
        center: "+",
        op: "add",
        n: 6,
        identity: 0,
        inverseTarget: 2,
        inverseValue: 4,
        special: [0, 2, 4],
        activeStart: 2,
        formula: ["2", "+", "4", "≡", "0", "(mod 6)"],
        definition: {
          title: "逆元",
          text: "在有单位元 e 的运算中，若 a∘b=b∘a=e，则 b 是 a 的逆元。"
        },
        properties: ["逆元总是相对于单位元而言。", "模加法中 a 的逆元是 n-a。", "逆元配对体现操作可撤销。"],
        steps: [
          { title: "确认基准", formula: "单位元 e=0", activeTerms: [4], focus: [0], feedback: "先确认回到哪里：Z6 加法的基准是 0。" },
          { title: "选择元素", formula: "目标元素 a=2", activeTerms: [0], focus: [2], feedback: "现在考察 2 的逆元，需要找一个元素与它相加回到 0。" },
          { title: "匹配逆元", formula: "2 + 4 ≡ 0 (mod 6)", activeTerms: [0, 1, 2, 3, 4], focus: [2, 4], resultIndex: 0, feedback: "4 能抵消 2，因为 2+4 在模 6 下等于 0。" },
          { title: "双向验证", formula: "4 + 2 ≡ 0 (mod 6)", activeTerms: [2, 3, 4], focus: [4, 2], resultIndex: 0, feedback: "左右顺序调换也回到 0，因此 2 与 4 互为逆元。" }
        ]
      }
    ],
    advanced: [
      {
        id: "max-idempotent",
        type: "idempotent",
        title: "max 运算中的幂等元",
        summary: "在有序集合上检查 a∘a=a，理解重复操作为何不改变稳定状态。",
        visual: "幂等回路",
        set: ["0", "1", "2", "3", "4"],
        center: "max",
        op: "max",
        n: 5,
        special: [0, 1, 2, 3, 4],
        activeStart: 3,
        formula: ["a", "∘", "a", "=", "a"],
        definition: {
          title: "幂等元",
          text: "若元素 a 满足 a∘a=a，则 a 称为幂等元。它强调重复作用后状态保持稳定。"
        },
        properties: ["幂等检验只需把元素与自身运算。", "max、min、集合并、集合交都有典型幂等现象。", "不是所有运算都让每个元素幂等。"],
        steps: [
          { title: "选择元素", formula: "取 a=3", activeTerms: [0], focus: [3], feedback: "先选定一个元素，把它同时放在运算的两侧。" },
          { title: "重复作用", formula: "max(3,3)=3", activeTerms: [0, 1, 2], focus: [3], resultIndex: 3, feedback: "3 与自身取最大值仍为 3，重复操作没有改变它。" },
          { title: "推广观察", formula: "∀a∈{0,1,2,3,4}, max(a,a)=a", activeTerms: [0, 4], focus: [0, 1, 2, 3, 4], feedback: "在 max 运算下，每个元素都是幂等元。" },
          { title: "结构判断", formula: "a∘a=a 是稳定性的代数刻画", activeTerms: [3, 4], focus: [3], feedback: "这一步把具体计算提升为幂等元的判定标准。" }
        ]
      },
      {
        id: "z7-add-identity",
        type: "identity",
        title: "Z7 加法单位元判定",
        summary: "同时追踪 e+a 与 a+e，证明 0 是唯一不改变他人的元素。",
        visual: "双向单位检验",
        set: ["0", "1", "2", "3", "4", "5", "6"],
        center: "+",
        op: "add",
        n: 7,
        identity: 0,
        special: [0],
        activeStart: 5,
        formula: ["e", "+", "a", "=", "a", "+", "e", "=", "a"],
        definition: {
          title: "单位元",
          text: "单位元必须对每个元素同时满足左单位与右单位条件。"
        },
        properties: ["左单位：e∘a=a。", "右单位：a∘e=a。", "若 e1、e2 都是单位元，则 e1=e1∘e2=e2。"],
        steps: [
          { title: "候选元素", formula: "e=0", activeTerms: [0], focus: [0], feedback: "在加法结构里，先把 0 作为单位元候选。" },
          { title: "左单位", formula: "0+5≡5 (mod 7)", activeTerms: [0, 1, 2, 3, 4], focus: [0, 5], resultIndex: 5, feedback: "0 在左侧不会改变 5。" },
          { title: "右单位", formula: "5+0≡5 (mod 7)", activeTerms: [4, 5, 6, 7, 8], focus: [5, 0], resultIndex: 5, feedback: "0 在右侧也不会改变 5。" },
          { title: "唯一性", formula: "e1=e1+e2=e2", activeTerms: [0, 3, 8], focus: [0], feedback: "两个单位元若同时存在，互相作用后只能相等，所以单位元唯一。" }
        ]
      },
      {
        id: "z7-mul-zero",
        type: "zero",
        title: "Z7 乘法零元判定",
        summary: "检验 θ·a=a·θ=θ，观察零元如何把不同输入汇聚到同一结果。",
        visual: "吸收路径",
        set: ["0", "1", "2", "3", "4", "5", "6"],
        center: "×",
        op: "mul",
        n: 7,
        zero: 0,
        special: [0],
        activeStart: 6,
        formula: ["θ", "·", "a", "=", "a", "·", "θ", "=", "θ"],
        definition: {
          title: "零元",
          text: "零元的核心是吸收性：无论与谁运算，结果都会回到零元。"
        },
        properties: ["零元和单位元是不同的角色。", "零元判定也要求左右两侧都成立。", "在普通乘法与模乘法中，0 是典型零元。"],
        steps: [
          { title: "候选元素", formula: "θ=0", activeTerms: [0], focus: [0], feedback: "把 0 作为零元候选，准备检验吸收性。" },
          { title: "左吸收", formula: "0·6≡0 (mod 7)", activeTerms: [0, 1, 2, 7, 8], focus: [0, 6], resultIndex: 0, feedback: "0 放在左侧，任何元素都会被吸收到 0。" },
          { title: "右吸收", formula: "6·0≡0 (mod 7)", activeTerms: [4, 5, 6, 7, 8], focus: [6, 0], resultIndex: 0, feedback: "0 放在右侧同样吸收 6。" },
          { title: "全局结论", formula: "∀a∈Z7, 0·a=a·0=0", activeTerms: [0, 2, 8], focus: [0], feedback: "零元把所有运算路径汇聚到同一个结果。" }
        ]
      },
      {
        id: "z7-mul-inverse",
        type: "inverse",
        title: "Z7 乘法逆元判定",
        summary: "以 1 为单位元，验证 3 与 5 在模 7 乘法中互为逆元。",
        visual: "逆元回归单位元",
        set: ["0", "1", "2", "3", "4", "5", "6"],
        center: "×",
        op: "mul",
        n: 7,
        identity: 1,
        inverseTarget: 3,
        inverseValue: 5,
        special: [1, 3, 5],
        activeStart: 3,
        formula: ["3", "·", "5", "≡", "1", "(mod 7)"],
        definition: {
          title: "逆元",
          text: "逆元必须把目标元素带回单位元；在模乘法中，还要求该元素与模数互素。"
        },
        properties: ["3·5=15，15 mod 7 = 1。", "逆元验证需要回到单位元 1。", "0 在乘法模 7 中没有乘法逆元。"],
        steps: [
          { title: "确认单位元", formula: "乘法单位元 e=1", activeTerms: [4], focus: [1], feedback: "乘法逆元的目标不是 0，而是乘法单位元 1。" },
          { title: "选择元素", formula: "a=3", activeTerms: [0], focus: [3], feedback: "选定待求逆元的元素 3。" },
          { title: "尝试候选", formula: "3·5=15", activeTerms: [0, 1, 2], focus: [3, 5], feedback: "候选 5 与 3 相乘得到 15。" },
          { title: "模运算归一", formula: "15≡1 (mod 7)", activeTerms: [3, 4, 5], focus: [3, 5], resultIndex: 1, feedback: "结果回到单位元 1，因此 5 是 3 的乘法逆元。" }
        ]
      }
    ],
    extend: [
      {
        id: "cipher-recover",
        type: "recover",
        title: "模加密的可还原链路",
        summary: "把加密看作加上密钥 k，再用逆操作 -k 把密文还原为明文。",
        visual: "Enc 后接 Dec",
        set: ["m=3", "k=5", "c=8", "-k=8", "m=3"],
        center: "Enc",
        special: [0, 3, 4],
        activeStart: 0,
        formula: ["Dec_k", "(", "Enc_k", "(m)", ")", "=", "m"],
        definition: {
          title: "可逆操作",
          text: "若一个操作后面接上它的逆操作能回到原对象，就可以把该过程理解为可还原链路。"
        },
        properties: ["Enc_k(m)=m+k mod n。", "Dec_k(c)=c-k mod n。", "加密要可用，解密逆操作必须存在。"],
        steps: [
          { title: "明文输入", formula: "m=3", activeTerms: [3, 5], focus: [0], feedback: "先固定明文 m=3，作为需要保护又要能恢复的数据。" },
          { title: "加密平移", formula: "3+5≡8 (mod 13)", activeTerms: [2, 3], focus: [0, 1], resultIndex: 2, feedback: "加上密钥 k=5 后，明文变成密文 c=8。" },
          { title: "逆向抵消", formula: "8+8≡3 (mod 13)", activeTerms: [0, 1, 2, 4], focus: [2, 3], resultIndex: 4, feedback: "在模 13 中，-5 等价于 8，用它抵消密钥作用。" },
          { title: "恢复恒等", formula: "Dec_k(Enc_k(m))=m", activeTerms: [0, 2, 5], focus: [0, 2, 4], resultIndex: 4, feedback: "加密再解密等于恒等操作，信息回到原点。" }
        ],
        probeText: "点选链路节点，观察它在“明文-密钥-密文-逆操作-恢复”的路径中所处位置。"
      },
      {
        id: "permutation-recover",
        type: "permute",
        title: "置换与逆置换",
        summary: "观察四个位置被置换后，如何通过逆置换回到原排列。",
        visual: "位置重排与还原",
        set: ["1", "2", "3", "4"],
        center: "p",
        special: [0, 1, 2, 3],
        activeStart: 1,
        formula: ["p^{-1}", "∘", "p", "=", "id"],
        definition: {
          title: "逆置换",
          text: "置换是双射，因此每个位置都有唯一来源与去向；逆置换会把重排后的对象送回原位。"
        },
        properties: ["p=(1 2 3 4) 表示循环移动。", "p^{-1} 会反方向循环。", "p^{-1}∘p=id 是置换可逆性的核心。"],
        steps: [
          { title: "原始位置", formula: "id: 1,2,3,4", activeTerms: [3], focus: [0, 1, 2, 3], feedback: "恒等置换保持每个位置不动。" },
          { title: "执行置换", formula: "p=(1 2 3 4)", activeTerms: [2], focus: [0, 1], resultIndex: 1, feedback: "位置 1 被送到位置 2，其他位置也按环形移动。" },
          { title: "执行逆置换", formula: "p^{-1}=(1 4 3 2)", activeTerms: [0], focus: [1, 0], resultIndex: 0, feedback: "逆置换沿反方向走，把被移动的位置送回去。" },
          { title: "合成为恒等", formula: "p^{-1}∘p=id", activeTerms: [0, 1, 2, 3], focus: [0, 1, 2, 3], feedback: "先置换再逆置换，整体效果就是恒等映射。" }
        ],
        probeText: "点选任一位置，关注它经过 p 后离开原位，再经过 p^{-1} 回到原位。"
      },
      {
        id: "matrix-identity",
        type: "matrix",
        title: "单位阵与矩阵还原",
        summary: "把单位元迁移到矩阵乘法，观察 I·A=A 与 A·I=A 的双向保持。",
        visual: "矩阵单位元",
        set: ["I", "A", "IA", "AI", "A⁻¹A"],
        center: "·",
        special: [0, 1, 2, 3],
        activeStart: 1,
        formula: ["I", "A", "=", "A", ",", "A", "I", "=", "A"],
        definition: {
          title: "单位阵",
          text: "在矩阵乘法中，单位阵 I 扮演单位元角色：左乘或右乘都不改变原矩阵。"
        },
        properties: ["单位阵是矩阵乘法的基准元素。", "可逆矩阵满足 A^{-1}A=I。", "矩阵乘法通常不交换，因此左右检验更重要。"],
        steps: [
          { title: "确认单位阵", formula: "I 是候选单位元", activeTerms: [0], focus: [0], feedback: "先把单位阵 I 作为矩阵乘法的单位元候选。" },
          { title: "左乘保持", formula: "I·A=A", activeTerms: [0, 1, 2, 3], focus: [0, 1], resultIndex: 2, feedback: "I 放在左边，A 的行列结构保持不变。" },
          { title: "右乘保持", formula: "A·I=A", activeTerms: [5, 6, 7, 8], focus: [1, 0], resultIndex: 3, feedback: "I 放在右边，A 仍然保持不变。" },
          { title: "逆元回基准", formula: "A^{-1}A=I", activeTerms: [0, 2], focus: [4, 0], resultIndex: 0, feedback: "如果 A 可逆，它与逆矩阵相乘会回到单位阵 I。" }
        ],
        probeText: "点选矩阵节点，观察单位阵负责“不改变”，逆矩阵负责“带回基准”。"
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

  function mod(a, n) {
    return ((a % n) + n) % n;
  }

  function uniq(values) {
    return [...new Set(values.filter(v => v !== undefined && v !== null))];
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

  function operate(caseData, a, b) {
    if (caseData.op === "add") return mod(a + b, caseData.n);
    if (caseData.op === "mul") return mod(a * b, caseData.n);
    if (caseData.op === "max") return Math.max(a, b);
    return b;
  }

  function findInverse(caseData, a) {
    if (caseData.inverseTarget === a) return caseData.inverseValue;
    if (caseData.op === "add") return mod(-a, caseData.n);
    if (caseData.op === "mul") {
      for (let x = 0; x < caseData.n; x += 1) {
        if (operate(caseData, a, x) === caseData.identity) return x;
      }
    }
    return null;
  }

  function probeMessage(caseData) {
    const idx = Math.max(0, Math.min(state.activeIndex, caseData.set.length - 1));
    const label = caseData.set[idx];
    if (caseData.probeText) return caseData.probeText;
    if (caseData.type === "identity") {
      const e = caseData.identity;
      const left = operate(caseData, e, idx);
      const right = operate(caseData, idx, e);
      return `点选 a=${label}：${e}∘${label}=${left}，${label}∘${e}=${right}。两个结果都等于 a，说明候选单位元通过该元素检验。`;
    }
    if (caseData.type === "zero") {
      const z = caseData.zero;
      const left = operate(caseData, z, idx);
      const right = operate(caseData, idx, z);
      return `点选 a=${label}：${z}∘${label}=${left}，${label}∘${z}=${right}。两个结果都回到 θ=${z}，表现出吸收性。`;
    }
    if (caseData.type === "inverse") {
      const inv = findInverse(caseData, idx);
      if (inv == null) return `点选 a=${label}：当前元素没有找到能回到单位元的逆元。`;
      const out = operate(caseData, idx, inv);
      return `点选 a=${label}：候选逆元为 ${inv}，${label}∘${inv}=${out}。若结果等于单位元，就完成逆元检验。`;
    }
    if (caseData.type === "idempotent") {
      const out = operate(caseData, idx, idx);
      return `点选 a=${label}：a∘a=${out}。结果仍为 ${label} 时，该元素满足幂等条件。`;
    }
    return `点选节点 ${label}，观察它在当前步骤中的高亮路径。`;
  }

  function renderApp() {
    const layer = LAYERS[state.layer];
    const caseData = currentCase();
    if (state.activeIndex >= caseData.set.length) state.activeIndex = caseData.activeStart || 0;
    const step = currentStep(caseData);
    document.body.dataset.layer = state.layer;
    document.title = `第9章 代数系统 - ${layer.title}（${layer.tag}）`;
    app.className = "special-app";
    app.innerHTML = `
      <aside class="sidebar">
        ${renderSidebar(layer, caseData)}
      </aside>
      <main class="visualizer-stage">
        ${renderTierBoard()}
        <div class="workspace">
          <section class="graph-pane">
            <div class="panel-title">
              <div>
                <h2>${esc(caseData.title)}</h2>
                <p>${esc(caseData.summary)}</p>
              </div>
              <div class="visual-badge">${esc(caseData.visual)}</div>
            </div>
            <div class="orbit-wrap">${renderOrbit(caseData, step)}</div>
            ${renderFormula(caseData, step)}
            ${renderSteps(caseData)}
          </section>
          <div class="info-column">
            ${renderFeedback(caseData, step)}
            ${renderDefinition(caseData)}
            ${renderProperties(caseData)}
          </div>
        </div>
      </main>
    `;
  }

  function renderSidebar(layer, caseData) {
    const list = casesForLayer();
    const types = uniq(list.map(item => item.type));
    return `
      <div class="layer-summary">
        <div class="window-controls" aria-hidden="true"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
        <span class="tier-pill">${esc(layer.tag)} · ${esc(layer.badge)}</span>
        <h1>${esc(layer.title)}</h1>
        <p class="subtitle">${esc(layer.concept)}</p>
        <p class="goal">${esc(layer.sub)}<br>目标：${esc(layer.task)}</p>
      </div>
      <div class="control-stack">
        <div class="control-group">
          <label>元素类型</label>
          <div class="segmented">
            ${types.map(type => `<button type="button" class="${type === caseData.type ? "active" : ""}" data-action="type" data-type="${esc(type)}">${esc(TYPE_LABELS[type] || type)}</button>`).join("")}
          </div>
        </div>
        <div class="control-group">
          <label for="caseSelector">案例</label>
          <select id="caseSelector" data-control="case">
            ${list.map((item, index) => `<option value="${index}" ${index === state.caseIndex ? "selected" : ""}>${esc(item.title)}</option>`).join("")}
          </select>
        </div>
        <div class="control-group">
          <span class="mini-label">点选元素</span>
          <div class="element-picker">
            ${caseData.set.map((label, index) => `<button type="button" class="${index === state.activeIndex ? "active" : ""}" data-node="${index}">${esc(label)}</button>`).join("")}
          </div>
          <p class="sidebar-note">${esc(probeMessage(caseData))}</p>
        </div>
        <div class="control-group">
          <label for="speedControl">自动演示速度</label>
          <input id="speedControl" data-control="speed" type="range" min="420" max="1500" step="60" value="${state.speed}">
        </div>
        <div class="control-group">
          <span class="mini-label">步进控制</span>
          <div class="step-controls">
            <button type="button" data-action="prev">◀ 上一步</button>
            <button type="button" class="primary" data-action="next">下一步 ▶</button>
            <button type="button" data-action="auto">${state.autoTimer ? "暂停" : "自动"}</button>
            <button type="button" data-action="reset">重置</button>
          </div>
        </div>
      </div>
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

  function renderOrbit(caseData, step) {
    const points = getPoints(caseData.set.length);
    const focus = new Set([state.activeIndex, ...(step.focus || [])]);
    const resultIndices = Array.isArray(step.resultIndex) ? step.resultIndex : step.resultIndex == null ? [] : [step.resultIndex];
    const specials = new Set(caseData.special || []);
    const edges = points.map((point, index) => {
      const next = points[(index + 1) % points.length];
      return `<line class="graph-edge" x1="${point.x}" y1="${point.y}" x2="${next.x}" y2="${next.y}"></line>`;
    }).join("");
    const hotToCenter = [...focus].map(index => {
      const point = points[index];
      return point ? `<line class="graph-edge hot" x1="${point.x}" y1="${point.y}" x2="390" y2="200"></line>` : "";
    }).join("");
    const hotToResult = resultIndices.map(index => {
      const point = points[index];
      return point ? `<line class="graph-edge hot" x1="390" y1="200" x2="${point.x}" y2="${point.y}"></line>` : "";
    }).join("");
    const nodes = points.map((point, index) => {
      const classes = [
        "node-button",
        specials.has(index) ? "special" : "",
        focus.has(index) || resultIndices.includes(index) ? "focused" : "",
        index === state.activeIndex ? "picked" : ""
      ].filter(Boolean).join(" ");
      return `
        <g class="${classes}" data-node="${index}" tabindex="0" role="button" aria-label="选择 ${esc(caseData.set[index])}">
          <circle class="node-circle" cx="${point.x}" cy="${point.y}" r="31"></circle>
          <text class="node-text" x="${point.x}" y="${point.y}">${esc(caseData.set[index])}</text>
        </g>
      `;
    }).join("");
    return `
      <svg class="orbit-svg" viewBox="0 0 780 400" role="img" aria-label="${esc(caseData.title)}互动图">
        <defs>
          <linearGradient id="orbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#d63b1d"></stop>
            <stop offset="100%" stop-color="#ffb400"></stop>
          </linearGradient>
        </defs>
        <ellipse class="graph-ring" cx="390" cy="200" rx="275" ry="138"></ellipse>
        ${edges}
        ${hotToCenter}
        ${hotToResult}
        <circle class="center-orb" cx="390" cy="200" r="58"></circle>
        <text class="center-label" x="390" y="193">${esc(caseData.center)}</text>
        <text class="center-label center-sub" x="390" y="224">运算器</text>
        ${nodes}
      </svg>
    `;
  }

  function getPoints(count) {
    const cx = 390;
    const cy = 200;
    const rx = 275;
    const ry = 138;
    const start = -Math.PI / 2;
    return Array.from({ length: count }, (_, index) => {
      const angle = start + index * Math.PI * 2 / count;
      return {
        x: Math.round(cx + Math.cos(angle) * rx),
        y: Math.round(cy + Math.sin(angle) * ry)
      };
    });
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
        <div class="probe-box">${esc(probeMessage(caseData))}</div>
      </section>
    `;
  }

  function renderDefinition(caseData) {
    return `
      <section class="info-card">
        <h3>${esc(caseData.definition.title)}</h3>
        <p>${esc(caseData.definition.text)}</p>
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

  function nextStep() {
    const caseData = currentCase();
    state.step = Math.min(caseData.steps.length - 1, state.step + 1);
  }

  function prevStep() {
    state.step = Math.max(0, state.step - 1);
  }

  function resetCase() {
    stopAuto();
    const caseData = currentCase();
    state.step = 0;
    state.activeIndex = caseData.activeStart || 0;
  }

  function setCase(index) {
    stopAuto();
    state.caseIndex = index;
    state.step = 0;
    state.activeIndex = currentCase().activeStart || 0;
  }

  function setLayerType(type) {
    const index = casesForLayer().findIndex(item => item.type === type);
    if (index >= 0) setCase(index);
  }

  app.addEventListener("click", event => {
    const node = event.target.closest("[data-node]");
    if (node) {
      state.activeIndex = Number(node.dataset.node);
      renderApp();
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.action;
    if (action === "prev") {
      stopAuto();
      prevStep();
    } else if (action === "next") {
      stopAuto();
      nextStep();
    } else if (action === "reset") {
      resetCase();
    } else if (action === "jump") {
      stopAuto();
      state.step = Number(actionButton.dataset.step) || 0;
    } else if (action === "type") {
      setLayerType(actionButton.dataset.type);
    } else if (action === "toggle-tier") {
      state.tierCollapsed = !state.tierCollapsed;
    } else if (action === "auto") {
      if (state.autoTimer) {
        stopAuto();
      } else {
        state.autoTimer = setInterval(() => {
          const caseData = currentCase();
          if (state.step >= caseData.steps.length - 1) {
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
