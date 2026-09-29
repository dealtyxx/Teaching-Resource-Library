# MathJax 3.2.2 本地副本

来源：`npm pack mathjax@3.2.2`（Apache-2.0，见 LICENSE），仅保留运行所需部分：

- `es5/tex-mml-chtml.js`：TeX + MathML 输入、CHTML 输出组合包（含右键菜单）
- `es5/output/chtml/fonts/woff-v2/`：CHTML 字体
- `es5/input/tex/extensions/`：TeX 扩展（autoload 按需加载）
- `es5/ui/`、`es5/a11y/assistive-mml.js`

未包含 `sre/`（语音规则引擎）及依赖它的 a11y 探索器/语义增强；这些功能默认关闭。

由 `../../mathjax-auto.js` 按自身路径自动加载；本地加载失败时回退 jsdelivr CDN。
页面不要再直接写 `<script src="https://cdn.jsdelivr.net/npm/mathjax@3/...">`。
