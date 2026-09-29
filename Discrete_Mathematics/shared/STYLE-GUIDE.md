# 离散数学课程资源库 · 全站统一规范（STYLE-GUIDE）

> 适用范围：`Discrete_Mathematics/` 下除主页 `index.html` 外的全部页面（367 页，11 章）。
> 本规范是后续各章精修会话的共同依据；配套工具：`tools/dm_normalize.py`（机械归一化）与 `tools/dm_check.py`（质检）。
> 共享层接入细节见同目录 [`README.md`](README.md)。

---

## 0 总原则

| 原则 | 要求 |
|------|------|
| **精美优先** | 沿用红金玻璃拟态（主红 + 金 + 纸色 + 网格底纹 + 毛玻璃卡片），**只提升、不另起风格**。改后截图不得比原来难看。 |
| **统一优先** | 同类元素全站只有一种写法：返回链接、页脚、标题、三阶卡、按钮、图例、字体……都按本规范。 |
| **不破坏** | 保留各节互动核心逻辑；**不重命名、不移动已发布的 HTML**（URL 已被课件与微信分享引用）。确需调整时保留原文件，改为跳转页（`<meta http-equiv="refresh">` + 可点击链接）。 |
| **正确优先** | 数学定义、定理、例题数值、算法输出、史实与数据必须准确；存疑宁可删去具体数字。 |

---

## 1 三阶结构

一个知识单元 = 一个目录，内含三阶页：

| 文件 | 层级 | 标记 | 定位 |
|------|------|------|------|
| `X-basic.html` | 基础层 | ●○○ | 低门槛 · 建立直觉：概念直觉 + 最小例子 |
| `X.html` | 进阶层 | ●●○ | 核心掌握 · 建模求解：核心定义/定理/算法的完整操作（**主页入口**） |
| `X-extend.html` | 拓展层 | ●●● | 高天花板 · 迁移工程：工程迁移/综合应用/挑战 |

- 三阶页通过 `SECTION_META.layers[0..2].page` 互链，由 `shared/ai-tutor.js` 在主舞台顶部渲染**三阶卡** `#dm-page-layers`（当前层高亮「✓ 你在本层」）。
- **页面不得再自绘第二套三阶卡 / 层级切换条。**
- 三层递进：尽量沿用**同一情境**逐层加深（例：基础层认识模型 → 进阶层求解模型 → 拓展层拓展模型）。
- 标杆写法：第 5、6 章与 9.3、9.6 的「三层强交互引擎」——一个 JS/CSS 渲染三阶，basic/extend 页为薄壳，只通过 `data-layer` 区分。

---

## 2 页面外壳

### 2.1 `<head>` 顺序

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,…（全站统一内联 SVG favicon，照抄任一已归一化页面）">
    <!-- Open Graph / Twitter（由 dm_normalize.py 按 SECTION_META 生成，勿手改） -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="离散数学课程资源库 · 湖南信息学院">
    <meta property="og:locale" content="zh_CN">
    <meta property="og:title" content="{同 title}">
    <meta property="og:description" content="{同 description}">
    <meta property="og:url" content="https://dealtyxx.github.io/Teaching-Resource-Library/Discrete_Mathematics/{逐段 percent-encode 的本页路径}">
    <meta property="og:image" content="https://dealtyxx.github.io/Teaching-Resource-Library/Discrete_Mathematics/shared/og-cover.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="离散数学课程资源库 · 湖南信息学院">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{同 title}">
    <meta name="twitter:description" content="{同 description}">
    <meta name="twitter:image" content="https://dealtyxx.github.io/Teaching-Resource-Library/Discrete_Mathematics/shared/og-cover.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{层名} · {层级}｜{N.M 节名} - 离散数学课程资源库</title>
    <meta name="description" content="第N章 章名 · N.M 节名 · {层级}：{concepts}。{task}">
    <!-- 统一字体片段（非阻塞） -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap"></noscript>
    <link rel="stylesheet" href="本单元.css">
    <link rel="stylesheet" href="../../shared/discrete-ui.css" data-dm-ui="1">
    <script src="../../shared/mathjax-auto.js" data-dm-mathjax="1"></script>
</head>
```

说明：
- 字体**只用这一个 URL**，不要再引入 Outfit、ZCOOL XiaoWei、Orbitron 等其他 Google 字族，也不要自托管字体。CSS 里若仍写到这些字族，浏览器会按栈回退，精修时请改为规范字体栈。
- 已有页面若 CSS 引用顺序是「shared 在前、本单元在后」，**不要为了对齐顺序而调换**（会改变层叠结果）；新页面按上面顺序写。
- 不要直连 `cdn.jsdelivr.net` 的 MathJax，统一由 `mathjax-auto.js` 加载本地副本（§7）。

### 2.2 `<body>` 结构

```html
<body>
    <!-- ① 返回链接：每页恰好一个，放在 body 开头 -->
    <a class="home-link" href="../../index.html#chapterN">← 返回课程主页</a>

    <!-- ② 主体：左侧控制栏 + 右侧主舞台 -->
    <div class="app-container">
        <aside class="sidebar">                 <!-- 引擎页可用 .side-panel -->
            <div class="sidebar-header">
                <div class="layer-eyebrow">基础层 · 第N章 章名</div>   <!-- 层级眉标 -->
                <h1>…</h1>                        <!-- Ma Shan Zheng；框架同步为 layers[i].name -->
                <p class="subtitle">…</p>         <!-- 核心概念；框架同步为 layers[i].concepts -->
            </div>
            <p class="task">🎯 一句话任务</p>
            <div class="control-group">…控件组…</div>
            <div class="status">…状态/结果…</div>
            <div class="knowledge">…知识要点…</div>
            <!-- 价值引领由框架注入，页面不再手写 .value-panel -->
        </aside>
        <main class="visualizer-stage">
            <!-- 三阶卡 #dm-page-layers 由框架注入到这里的顶部 -->
            <div class="glass-pane">
                <header class="stage-header">舞台标题 + 图例/状态徽标</header>
                <div class="stage-canvas">SVG/Canvas 可视化（加载即有示例内容）</div>
                <section class="stage-explain">步骤讲解 / 结论区</section>
            </div>
        </main>
    </div>

    <!-- ③ 页脚：每页恰好一个 -->
    <footer class="site-footer">
        <p>© 2025-2026 湖南信息学院 · 计算机科学与工程课程资源库建设团队</p>
        <p>版权所有 · 项目总负责人：谢鑫</p>
    </footer>

    <!-- ④ 学习助手框架 -->
    <script>window.SECTION_META = { … };</script>
    <script src="../../shared/ai-tutor.js" defer></script>
</body>
```

- 上面左栏/舞台内部的 class 名（`.layer-eyebrow`、`.task`、`.stage-header` 等）是**示意**，已有页面沿用本单元现有命名即可；外壳层面必须一致的只有 `a.home-link`、`.app-container`、`.sidebar`/`.side-panel`、`footer.site-footer` 与 `SECTION_META`。
- 位于三级目录的页面（如 `3二元关系/3.4二元关系的运算/2）逆运算/inverse.html`）把所有 `../../` 换成 `../../../`。
- 返回链接与页脚的样式全部来自 `discrete-ui.css` §10（深色胶囊固定左上角、手机端缩小；页脚两行透明居中）。**不要写内联 style、onmouseover，也不要另起 class**。
- 返回链接只允许 `a.home-link` 一种写法；`#homeBtn`、「首页」「⌂ 课程主页」「🏠 课程主页」等变体一律不用。页面缺失时框架会兜底注入，但 `dm_check` 会报错。
- `<footer>` 只用于版权页脚。把 `<footer>` 当内容面板用的（如 3.3、3.4 的 `.insight-footer`）请在精修时改成 `<section>`/`<div>`，并保留一个标准页脚。

### 2.3 `SECTION_META` 模板

```js
window.SECTION_META = {
  chapter: "第5章 命题逻辑",            // 规范章名（§3），不写空格变体
  section: "5.1 命题与联结词",           // 「N.M 节名」，不带层级后缀（框架运行时自动追加）
  title:   "命题与联结词",               // 节主题（layers 缺失时用作层名兜底）
  grounding: "本节主题：……（喂给 AI 的知识锚定）",
  steps: [ {name:"情境引入",desc:"…"}, {name:"对象抽取",desc:"…"}, {name:"结构建模",desc:"…"},
           {name:"推理求解",desc:"…"}, {name:"程序验证",desc:"…"}, {name:"迁移反思",desc:"…"} ],
  ideology: { title:"…", text:"…", dims:["…","…"], quote:"…" },
  reflect:  ["…", "…"],
  transfer: ["…", { t:"标题", d:"描述" }],
  layers: [
    { name:"命题与五联结词", concepts:"¬ ∧ ∨ → ↔ / 真值表",         task:"识别命题、认识五个联结词的真值表。", page:"logic_propositions-basic.html" },
    { name:"复合命题真值",   concepts:"蕴含前假则真 / 相容或 / 优先级", task:"据真值表确定复合命题的真假。",       page:"logic_propositions.html" },
    { name:"逻辑门与规则引擎", concepts:"与或非门 / 条件判断 / 业务规则", task:"迁移到数字电路与规则系统。",       page:"logic_propositions-extend.html" }
  ]
};
```

同一单元三个页面的 `chapter / section / layers` 必须完全一致（`layers` 建议三页逐字相同）。

---

## 3 命名

**章名（`SECTION_META.chapter`、description 前缀、眉标）**

| 章 | 规范章名 |
|----|----------|
| 1 | 第1章 计数基础与数论基础 |
| 2 | 第2章 集合及其运算 |
| 3 | 第3章 二元关系 |
| 4 | 第4章 特殊关系 |
| 5 | 第5章 命题逻辑 |
| 6 | 第6章 谓词逻辑 |
| 7 | 第7章 图论基础 |
| 8 | 第8章 特殊图 |
| 9 | 第9章 代数系统 |
| 10 | 第10章 群论基础 |
| 11 | 第11章 环、域、格和布尔代数 |

- **section**：「N.M 节名」（第 1 章用 `1.x.y`），数字与节名之间一个半角空格，**不带层级后缀**。一节拆两个目录的用（一）（二）区分：`8.6 生成树（一）`。
- **layers[i].name**：4–10 字的本层页面主题（例：「量词否定律」「Dijkstra 最短路」）。
- **layers[i].concepts**：用「 / 」（空格 + 斜杠 + 空格）分隔的核心概念。
- **layers[i].task**：一句话目标，句号结尾。
- **`<title>`**：`{层名} · {层级}｜{N.M 节名} - 离散数学课程资源库`
  例：`量词否定律 · 基础层｜6.4 谓词公式之间的关系 - 离散数学课程资源库`
  运行时 `document.title` 由 `ai-tutor.js` 按同一规则设置（不会再改成「层名 — 概念」）。
- **description**：`第N章 章名 · N.M 节名 · {层级}：{concepts}。{task}`
- **og:title = title，og:description = description，og:url = 本页绝对 URL**（路径逐段 percent-encode）。

层名与层级的判定算法（`dm_normalize.py` 与 `ai-tutor.js` 一致）：
1. 本页文件名出现在 `layers[i].page` → 层名 `layers[i].name`，层级为第 i 层；
2. 否则层级按文件名后缀推断（`-basic` 基础层 / `-extend` 拓展层 / 其余进阶层）；`layers` 没写 `page` 时取对应层的 `name`，写了 `page` 却都不匹配时取 `SECTION_META.title`。

> 以上 title / description / OG 均由 `python3 tools/dm_normalize.py` 从 SECTION_META 生成，**改 SECTION_META 后重跑脚本即可，不要手改 head 里的这些标签**。

---

## 4 视觉

**色彩**（只用 `discrete-ui.css` 与主页已有令牌，不引入新主色）

| 令牌 | 值 | 用途 |
|------|----|------|
| 主红 | `#D63B1D` | 主操作、标题、强调 |
| 深红 | `#B8321A` | 渐变终点、悬停 |
| 金 | `#FFB400` | 高亮、当前、提示 |
| 墨 | `#2C1810` | 正文 |
| 次墨 | `#6B4A38` | 次级文字 |
| 纸色 | `#FFFBF0` | 背景（配红金网格底纹） |

语义色：**成立/正确 = 绿**（`#1F9D55` / `#2F7D57`），**不成立/错误 = 红**（`#C0392B`），**提示/当前 = 金**。

**字体**：标题 `'Ma Shan Zheng','Noto Serif SC',cursive`；正文 `'Noto Serif SC','Microsoft YaHei',serif`；代码与符号串 `'JetBrains Mono',Consolas,monospace`。

**按钮**
- 主操作：红色渐变实心（`linear-gradient(135deg,#D63B1D,#B8321A)`，白字）。
- 次操作：白底红边红字。
- 重置：描边样式（透明底 + 细边）。
- 文案**动词开头**（「生成示例」「开始演示」「重置」），同页同类按钮尺寸一致。

**图形**：节点 / 边 / 高亮 / 已访问等状态配色**同章一致**，并在舞台标题栏给出图例。

**响应式**
- ≥1366 宽桌面：首屏可见三阶卡与舞台主体。
- ≤768px：单列、无横向滚动、触控目标 ≥40px。
- 不要在页面里写与共享外壳冲突的 `position:fixed` 页脚、固定视口高度的 `body`。

---

## 5 交互

- 加载即展示有意义的示例，**不留空白舞台**。
- 必有「重置」。
- 分步演示提供 **上一步 / 下一步 / 自动播放 + 速度调节**。
- 每次操作有可见反馈（状态文字、高亮、动画）。
- **不用 `alert` / `confirm` / `prompt`**，改用页内提示条。
- **零控制台报错**。
- 可点击元素一律用 `<button>` 或 `<a>`，并有 `:focus-visible` 焦点样式（共享层已提供默认样式）。

---

## 6 内容

- 数学正确：定义、定理、例题数值、算法输出逐一核对。
- 符号统一：`¬ ∧ ∨ → ↔`、`∀ ∃`、`∈ ⊆ ∪ ∩ −`、`R⁻¹`、`R∘S`、`φ(n)`、`a ≡ b (mod m)`、`⟨G, ∘⟩`。公式用 MathJax（`\( … \)`、`\[ … \]`）或全站统一数学样式。
- 价值引领与数学概念要有**真实类比或应用关系**，自然融入、不喊口号；史实、人物、工程数据必须准确，存疑宁可删去具体数字。
- **案例单元**（名称含「案例」）统一六段式：
  情境背景 → 数学建模（现实对象 → 集合/关系/图/代数结构）→ 交互求解 → 结果解读 → 价值引领 → 迁移思考；
  三阶对应「认识模型 / 求解模型 / 拓展模型」。
- 简体中文、全角标点、术语与教材一致。

---

## 7 性能与依赖

- **不新增外部 CDN**。新增资源放本单元目录或 `shared/`。
- Google Fonts 只保留 §2.1 的一个非阻塞片段（校园网访问 Google 慢或不通时，页面先用系统字体渲染，不再白屏）。
- MathJax 使用 `shared/vendor/mathjax/`（3.2.2 本地副本），由 `mathjax-auto.js` 基于自身路径加载，本地失败才回退 jsdelivr。
- 删除确认无引用的死文件（先 `grep -r 文件名` 全站确认）。

---

## 8 验收（每个单元改完都要做）

```bash
# 1) 机械归一化（幂等，可反复跑；--check 只报告不写）
python3 tools/dm_normalize.py --prefix 5命题逻辑/1命题与联结词

# 2) 质检：无 error；截图过目
python3 tools/dm_check.py --prefix 5命题逻辑/1命题与联结词 --out /tmp/dm-shots --sheet
```

- `dm_check` 无 error（warn 需逐条确认可接受）。
- 桌面 **1440×900**、**1366×768** 与手机 **390×844** 截图过目：外壳一致、无遮挡 / 截断 / 溢出 / 空白。
- 三阶卡三个按钮跳转正确，当前层标记正确。
- 与改前截图对比：只能更好，不能更难看。
