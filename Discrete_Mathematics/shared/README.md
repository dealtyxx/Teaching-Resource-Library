# 离散数学课程资源库 · 共享升级框架（shared/）

> 把每个小节"强化 + 美化"为统一品质的教学案例，而**不改动各节原有的互动核心**。
> 纯静态、零后端，可直接挂 GitHub Pages。
> © 2025-2026 湖南信息学院 · 计算机科学与工程课程资源库建设团队 · 负责人：谢鑫

---

## 一、它做了什么

为任意小节叠加一层非侵入式的「学习助手」悬浮坞（右下角 `✦ 学习助手`），包含四个选项卡：

| 选项卡 | 内容 |
|--------|------|
| 🤖 **AI 助教** | **多轮连续对话**（聊天式气泡，记住上文、可"再讲讲/那如果改成…呢"承上启下追问）+ 四角色快捷引导（情境生成 / 苏格拉底提示 / 错误诊断 / 迁移变式），由 **用户自带的 DeepSeek 密钥** 浏览器直连驱动，**流式打字机输出** + 逐条复制 + 公式渲染 + 新对话清空；对话历史持久化于本浏览器（刷新可恢复）；只引导不代答；无密钥时自动降级为内置高质量引导。 |
| 📚 **分层进阶** | **三阶层次化案例**（参考 alg_base，低门槛·高天花板）：基础层 ●○○ → 进阶层 ●●○ → 拓展层 ●●●，每阶给出本节专属的知识点、目标与「▶ 进入本层 · AI 出题」按钮（按该层难度直接发起多轮对话）；下方保留**六步教学流程**（情境→对象→建模→求解→验证→迁移），每步可勾选完成、带学习进度条。 |
| 🚩 **价值引领** | 价值引领价值点 + 维度标签 + 引语，深化课程资源。 |
| 🔁 **反思迁移** | 反思追问 + 迁移变式卡片。 |
| 📊 **能力雷达** | 仅在**重点案例页**出现：六维（情境理解/对象抽象/数学建模/推理计算/工程解释/迁移应用）能力雷达，随**学习行为轻量打点**自动成长，给出"建模能力指数"。 |

外加顶部居中**面包屑**（章 › 节）、**首次访问引导气泡**（小屏自动缩小，约 8 秒后自动收起）、缺失时兜底注入的**返回课程主页**链接、规范化的**页面标题**、Esc 关闭、记忆上次选项卡。所有组件作用域隔离（`dm-` 前缀 + `#dm-assist-root`），**绝不污染各节原有样式**。

### 六维能力雷达（行为打点）

- **何时出现**：默认在 `section`/`title` 含「案例」的小节自动启用；可用 `SECTION_META.radar: true/false` 强制开/关。
- **如何成长**（仅记录于本浏览器 localStorage，可一键重置）：
  - 勾选六步中第 i 步 → 对应维度 +25（六步与六维一一对应）。
  - 点 AI 角色：情境生成→情境理解、苏格拉底提示→推理计算/数学建模、迁移变式→迁移应用、错误诊断→六维各+、自由提问→数学建模/推理计算。
  - 浏览「价值引领/反思迁移」页签、与本页主舞台交互 → 相应维度小幅 +（节流防刷）。
- **建模能力指数** = 六维按权重（情境15·对象20·建模25·推理20·工程10·迁移10）加权，0–100，分级：入门/进阶/熟练/卓越。

## 二、AI 密钥（BYO-key）说明

- AI 由 **DeepSeek** 大模型驱动，需要**用户自己的 API 密钥**。
- 点击悬浮坞里的「⚙ 配置 AI」→ 按引导去 <https://platform.deepseek.com/api_keys> 申请 → 粘贴保存。
- 密钥**仅保存在用户浏览器的 localStorage**，直接发往 `api.deepseek.com`，**不经过本网站或任何第三方服务器**（本项目是纯静态站，根本没有服务器）。
- 已验证 DeepSeek API 支持浏览器跨域（CORS），故 GitHub Pages 可正常使用。

## 三、如何给一个小节接入

> 完整的页面外壳、命名与验收规范见 [`STYLE-GUIDE.md`](STYLE-GUIDE.md)。下面是接入共享层所需的最小片段。

### 3.1 `<head>`：字体（非阻塞）+ 共享样式 + MathJax

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap"></noscript>
<link rel="stylesheet" href="本单元.css">
<link rel="stylesheet" href="../../shared/discrete-ui.css" data-dm-ui="1">
<script src="../../shared/mathjax-auto.js" data-dm-mathjax="1"></script>
```

- 全站只用这**一个字体 URL**，以 `media="print"` + `onload` 方式非阻塞加载：Google 慢或不通时先用系统字体渲染，不再白屏。
- `<title>`、`description`、Open Graph / Twitter 标签不要手写，由 `tools/dm_normalize.py` 按 `SECTION_META` 生成：
  `<title>{层名} · {层级}｜{N.M 节名} - 离散数学课程资源库</title>`；运行时 `ai-tutor.js` 把 `document.title` 设为同一格式。

### 3.2 `<body>`：返回链接与页脚（每页各恰好一个）

```html
<body>
    <a class="home-link" href="../../index.html#chapterN">← 返回课程主页</a>
    …
    <footer class="site-footer">
        <p>© 2025-2026 湖南信息学院 · 计算机科学与工程课程资源库建设团队</p>
        <p>版权所有 · 项目总负责人：谢鑫</p>
    </footer>
```

- 样式全部来自 `discrete-ui.css` §10：返回链接是左上角深色胶囊（手机端自动缩小、触控高度 ≥40px），页脚两行透明居中。**不要写内联样式**。
- 页面缺 `a.home-link` 时，`ai-tutor.js` 会按目录深度注入标准返回链接兜底（`dm_check` 仍会报错提醒补上）。

### 3.3 `</body>` 前：学习助手框架

在该小节 HTML 的 `</body>` 之前插入：

在该小节 HTML 的 `</body>` 之前插入：

```html
<!-- ===== 共享升级框架：学习助手（AI助教/六步/价值引领/反思）===== -->
<script>
window.SECTION_META = {
  chapter: "第2章 集合及其运算",
  section: "2.1 集合概述",
  title:   "集合的概念与表示",
  grounding: "本节主题：集合是……（喂给AI的知识锚定，约束其只在正确范围引导）",
  steps: [
    { name: "情境引入", desc: "……" },
    { name: "对象抽取", desc: "……" },
    { name: "结构建模", desc: "……" },
    { name: "推理求解", desc: "……" },
    { name: "程序验证", desc: "……" },
    { name: "迁移反思", desc: "……" }
  ],
  ideology: {
    title: "统一战线 · 求同存异",
    text:  "集合的『并』象征大团结……",
    dims:  ["家国情怀", "辩证思维"],
    quote: "（可选）一句点睛引语"
  },
  reflect:  ["反思问题1", "反思问题2"],
  transfer: ["迁移变式1", { t:"标题", d:"描述" }],
  // 三阶层次化（基础/进阶/拓展）；省略时自动从 steps/transfer 推导
  layers: [
    { name:"入门概念", concepts:"最简子概念",       task:"建立直觉" },
    { name:"核心方法", concepts:"定义/方法/定理",   task:"会建模会算" },
    { name:"迁移拓展", concepts:"工程/更一般结构", task:"迁移与挑战" }
  ]
  // 可选 fallback: { hint:[lead,[...]], scenario:[...], ... } 覆盖默认内置引导
  // 可选 radar: true/false 强制开/关六维能力雷达（默认在『案例』节自动开）
};
</script>
<script src="../../shared/ai-tutor.js" defer></script>
```

> 路径说明：小节都在 `第N章/小节/xxx.html`（根下两级），故统一用 `../../shared/`；三级目录页面（如 3.4 的四个子页）用 `../../../shared/`，返回链接同理。
> `section` 只写「N.M 节名」，**不要带「· 基础层」等层级后缀**（框架运行时会自动追加到面包屑）。
> CSS 由 `ai-tutor.js` 自动加载，无需手动引入。
> `SECTION_META` 全部字段都可省略——省略时模块会从标题/路径自动推断并给出通用内容，但建议逐节填好以获得"定制"效果。

## 四、MathJax 本地化

- `shared/vendor/mathjax/` 是 MathJax 3.2.2 的本地副本（约 2.6MB，仅含 `tex-mml-chtml.js`、CHTML woff-v2 字体、TeX 扩展、`ui/` 与 `a11y/assistive-mml.js`；不含 SRE 语音引擎）。
- `mathjax-auto.js` 在页面出现 `$…$`、`\( … \)`、`\[ … \]` 等公式时按需加载：**优先本地副本**（基于自身 `<script src>` 计算路径，两级 / 三级目录都适用），本地加载失败再回退 `cdn.jsdelivr.net`。
- `ai-tutor.js` 渲染 AI 回答中的公式时也走同一加载器。
- 页面**不要**再直接写 `<script src="https://cdn.jsdelivr.net/npm/mathjax@3/…">`。

## 五、工具

| 命令 | 作用 |
|------|------|
| `python3 tools/dm_normalize.py [--check] [--prefix 路径]` | 机械归一化（幂等）：title/description/OG、返回链接、页脚、字体片段、SECTION_META 章名/节名 |
| `python3 tools/dm_check.py --prefix 路径 --out 目录 [--sheet]` | 无头浏览器质检：报错、交互、三视口截图、静态一致性 |

## 六、GitHub Pages 部署

1. 仓库根目录已放 `.nojekyll`（禁用 Jekyll，避免忽略文件 / 中文路径问题）。
2. 仓库 Settings → Pages → Source 选 `main` 分支根目录即可。
3. 访问 `https://<用户名>.github.io/<仓库名>/`，从 `index.html` 进入各节。
4. 全站纯静态，无需任何构建或后端。
