# -*- coding: utf-8 -*-
"""Generate interactive algorithm teaching course HTML pages."""
import os

BASE = r"E:\360MoveData\Users\谢鑫\Desktop\算法设计与分析\interactive-course"
CH = os.path.join(BASE, "chapters")
os.makedirs(CH, exist_ok=True)

CHAPTERS = [
    {"id": "01", "file": "ch01-intro.html", "title": "绪论", "en": "Introduction",
     "desc": "算法概念、五大特性、渐进复杂度、大O/Ω/Θ、STL工具",
     "topics": ["算法定义", "时间复杂度", "渐进符号", "STL"], "color": "#60a5fa"},
    {"id": "02", "file": "ch02-recursion.html", "title": "递归算法设计技术", "en": "Recursion",
     "desc": "递归模型、递归树、汉诺塔、阶乘、分治递归思维",
     "topics": ["递归三要素", "递归树", "汉诺塔", "尾递归"], "color": "#a78bfa"},
    {"id": "03", "file": "ch03-brute.html", "title": "穷举法", "en": "Brute Force",
     "desc": "枚举框架、前缀和、哈希优化、象棋算式",
     "topics": ["枚举框架", "前缀和", "哈希优化", "剪枝"], "color": "#fbbf24"},
    {"id": "04", "file": "ch04-divide.html", "title": "分治法", "en": "Divide & Conquer",
     "desc": "分治框架、主定理、快速排序、归并思想",
     "topics": ["分治三步", "主定理", "快排", "最大次大"], "color": "#34d399"},
    {"id": "05", "file": "ch05-backtrack.html", "title": "回溯法", "en": "Backtracking",
     "desc": "解空间树、子集树/排列树、N皇后、剪支策略",
     "topics": ["解空间", "子集树", "N皇后", "剪支"], "color": "#f472b6"},
    {"id": "06", "file": "ch06-branch.html", "title": "分支限界法", "en": "Branch & Bound",
     "desc": "BFS+限界、队列式/优先队列式、迷宫最短路",
     "topics": ["限界函数", "BFS", "优先队列", "最短路径"], "color": "#22d3ee"},
    {"id": "07", "file": "ch07-dp.html", "title": "动态规划", "en": "Dynamic Programming",
     "desc": "最优子结构、重叠子问题、0/1背包、状态转移",
     "topics": ["状态转移", "背包", "备忘录", "滚动数组"], "color": "#fb923c"},
    {"id": "08", "file": "ch08-greedy.html", "title": "贪心法", "en": "Greedy",
     "desc": "贪心选择性质、活动安排、区间问题、Huffman",
     "topics": ["贪心选择", "活动安排", "区间", "正确性证明"], "color": "#4ade80"},
    {"id": "09", "file": "ch09-graph.html", "title": "图算法", "en": "Graph Algorithms",
     "desc": "最小生成树Prim/Kruskal、最短路径Dijkstra",
     "topics": ["Prim", "Kruskal", "Dijkstra", "并查集"], "color": "#818cf8"},
    {"id": "10", "file": "ch10-geometry.html", "title": "计算几何", "en": "Computational Geometry",
     "desc": "向量点积叉积、线段相交、凸包Graham扫描",
     "topics": ["向量运算", "叉积", "凸包", "最近点对"], "color": "#2dd4bf"},
    {"id": "11", "file": "ch11-complexity.html", "title": "计算复杂性", "en": "Complexity Theory",
     "desc": "P/NP/NPC、图灵机、归约、难解问题",
     "topics": ["P类", "NP类", "NPC", "归约"], "color": "#e879f9"},
    {"id": "12", "file": "ch12-prob-approx.html", "title": "概率算法与近似算法", "en": "Randomized & Approx",
     "desc": "蒙特卡罗、拉斯维加斯、π估计、近似比",
     "topics": ["蒙特卡罗", "拉斯维加斯", "π估计", "近似比"], "color": "#38bdf8"},
]

def shell_head(title, rel="../"):
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} · 算法设计与分析交互课堂</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{rel}assets/common.css">
</head>
<body>
<button class="menu-toggle" onclick="toggleSidebar()" aria-label="菜单">☰</button>
'''

def sidebar(ch_id, toc_items):
    links = []
    for c in CHAPTERS:
        active = " active" if c["id"] == ch_id else ""
        links.append(f'<a class="nav-link{active}" href="{c["file"]}">{c["id"]} {c["title"]}</a>')
    toc = "\n".join(f'<a class="nav-link toc" href="#{t[0]}">{t[1]}</a>' for t in toc_items)
    return f'''
<div class="app-shell">
<aside class="sidebar">
  <div class="sidebar-brand">
    <a href="../index.html">
      <div class="logo"><span>AD</span>算法设计与分析</div>
      <div class="sub">交互式可视化教学系统</div>
    </a>
  </div>
  <div class="nav-section">本页导航</div>
  {toc}
  <div class="nav-section">全部章节</div>
  {chr(10).join(links)}
  <div class="nav-section">返回</div>
  <a class="nav-link" href="../index.html">← 课程门户</a>
</aside>
'''

def chapter_nav(idx):
    prev_c = CHAPTERS[idx-1] if idx > 0 else None
    next_c = CHAPTERS[idx+1] if idx < len(CHAPTERS)-1 else None
    left = f'''<a href="{prev_c["file"]}"><span class="dir">← 上一章</span><span class="name">第{int(prev_c["id"])}章 {prev_c["title"]}</span></a>''' if prev_c else "<div></div>"
    right = f'''<a href="{next_c["file"]}" style="text-align:right"><span class="dir">下一章 →</span><span class="name">第{int(next_c["id"])}章 {next_c["title"]}</span></a>''' if next_c else "<div></div>"
    return f'<div class="chapter-nav">{left}{right}</div>'

def shell_foot(extra_js=""):
    return f'''
</main>
</div>
<script src="../assets/common.js"></script>
<script>
{extra_js}
</script>
</body>
</html>
'''

# ========== INDEX ==========
def gen_index():
    cards = []
    for c in CHAPTERS:
        tags = "".join(f'<span class="badge badge-primary">{t}</span>' for t in c["topics"][:3])
        cards.append(f'''
<a class="ch-card fade-in" href="chapters/{c["file"]}" style="--c:{c["color"]}">
  <div class="ch-num">CHAPTER {c["id"]}</div>
  <h3>{c["title"]}</h3>
  <p>{c["desc"]}</p>
  <div class="tags">{tags}</div>
</a>''')
    html = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>算法设计与分析 · 交互式可视化教学系统</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/common.css">
<style>
  body {{ margin: 0; }}
  .portal-wrap {{ min-height: 100vh; }}
  .stats {{ display:flex; justify-content:center; gap:2rem; flex-wrap:wrap; margin:1.5rem 0; }}
  .stat .n {{ font-family:var(--font-mono); font-size:1.8rem; font-weight:700; color:var(--primary); }}
  .stat .l {{ font-size:.8rem; color:var(--text-muted); }}
  .footer {{ text-align:center; padding:2rem; color:var(--text-muted); font-size:.85rem; border-top:1px solid var(--border); margin-top:1rem; }}
</style>
</head>
<body>
<div class="portal-wrap">
  <header class="portal-hero fade-in">
    <div class="badge badge-purple" style="margin-bottom:1rem">基于教材 · 李春葆《算法设计与分析》第3版</div>
    <h1>算法设计与分析</h1>
    <p>可视化 · 交互式 · 精美教学系统<br>
    从渐进复杂度到 NP 完全性，在浏览器中「看见」每一个算法</p>
    <div class="stats">
      <div class="stat"><div class="n">12</div><div class="l">核心章节</div></div>
      <div class="stat"><div class="n">30+</div><div class="l">交互演示</div></div>
      <div class="stat"><div class="n">100%</div><div class="l">离线可用</div></div>
    </div>
  </header>
  <section class="chapter-cards">
    {"".join(cards)}
  </section>
  <footer class="footer">
    交互式可视化教学系统 · 适合课堂演示与自学 · 单文件 HTML 无需服务器<br>
    教材：《算法设计与分析》（第3版）李春葆等 · 清华大学出版社
  </footer>
</div>
</body>
</html>'''
    with open(os.path.join(BASE, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    print("index.html OK")

# Helper for chapter wrapper
def write_ch(idx, toc, body, js):
    c = CHAPTERS[idx]
    html = shell_head(f"第{int(c['id'])}章 {c['title']}")
    html += sidebar(c["id"], toc)
    html += f'''
<main class="main">
  <div class="topbar">
    <div class="breadcrumb">
      <a href="../index.html">课程门户</a> <span>/</span>
      <span>第{int(c["id"])}章 {c["title"]}</span>
    </div>
    <span class="badge badge-primary">{c["en"]}</span>
  </div>
  {body}
  {chapter_nav(idx)}
'''
    html += shell_foot(js)
    path = os.path.join(CH, c["file"])
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"{c['file']} OK")

# ========== CH01 ==========
def gen_ch01():
    toc = [("s1","算法概述"),("s2","五大特性"),("s3","复杂度可视化"),("s4","渐进符号"),("s5","课堂测验")]
    body = r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="badge badge-primary">第1章</span>
    <h1 style="margin-top:.5rem">绪论 · 算法与分析基础</h1>
    <p style="color:var(--text-dim);margin-top:.6rem">算法是求解问题的一系列计算步骤——有穷、确定、可行的指令序列，将输入变换为输出。本章建立全课程的「语言」：如何描述算法、如何度量效率。</p>
    <div class="card-grid" style="margin-top:1.2rem">
      <div class="metric"><div class="num">5</div><div class="label">算法特性</div></div>
      <div class="metric"><div class="num">O / Ω / Θ</div><div class="label">渐进符号</div></div>
      <div class="metric"><div class="num">STL</div><div class="label">设计工具</div></div>
    </div>
  </div>

  <section data-section="s2" id="s2">
    <h2>1.1 算法的五大特性</h2>
    <div class="card-grid">
      <div class="card fade-in"><h3>① 有穷性</h3><p style="color:var(--text-dim);font-size:.9rem">有限步后必须结束。无限循环不是算法。</p></div>
      <div class="card fade-in fade-in-d1"><h3>② 确定性</h3><p style="color:var(--text-dim);font-size:.9rem">每条指令含义确切，无二义性。</p></div>
      <div class="card fade-in fade-in-d2"><h3>③ 可行性</h3><p style="color:var(--text-dim);font-size:.9rem">可用基本运算在有限次内完成。</p></div>
      <div class="card fade-in fade-in-d3"><h3>④⑤ 输入 / 输出</h3><p style="color:var(--text-dim);font-size:.9rem">零或多个输入；一个或多个输出。</p></div>
    </div>
    <div class="callout callout-warn">
      <div class="callout-title">反例思考</div>
      <code>while(n%2==0) n+=2;</code> 当 n 为偶数时永不终止 → 违反<strong>有穷性</strong>；
      <code>x=5/y</code> 当 y=0 时不可行 → 违反<strong>可行性</strong>。
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>1.2 时间复杂度增长趋势</h2>
    <p style="color:var(--text-dim)">渐进分析关注：当问题规模 <span class="formula">n → ∞</span> 时，基本操作次数 <span class="formula">f(n)</span> 的增长阶。下图对比常见复杂度（可拖动 n 上限）。</p>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>📈 复杂度曲线实验室</h3>
        <div class="slider-group">
          <label>n 上限</label>
          <input type="range" id="nMax" min="10" max="60" value="40">
          <span class="val" id="nMaxVal">40</span>
        </div>
      </div>
      <div class="demo-body">
        <div class="viz-stage" style="height:340px">
          <canvas id="cpxChart" data-complexity-chart data-nmax="40" style="width:100%;height:100%"></canvas>
        </div>
        <div class="table-wrap" style="margin-top:1rem">
          <table class="data">
            <thead><tr><th>算法的阶</th><th class="num">n!</th><th class="num">2ⁿ</th><th class="num">n³</th><th class="num">n²</th><th class="num">n log n</th><th class="num">n</th></tr></thead>
            <tbody>
              <tr><td>1 秒最大 n（示意）</td><td class="num">11</td><td class="num">26</td><td class="num">464</td><td class="num">10⁴</td><td class="num">4.5×10⁶</td><td class="num">10⁸</td></tr>
              <tr><td>机器快 2 倍后</td><td class="num">11</td><td class="num">27</td><td class="num">584</td><td class="num">1.4×10⁴</td><td class="num">8.6×10⁶</td><td class="num">2×10⁸</td></tr>
            </tbody>
          </table>
        </div>
        <div class="callout callout-info" style="margin-top:1rem">
          <div class="callout-title">教学要点</div>
          指数级与阶乘级几乎不随机器提速而改善；多项式尤其是线性/准线性算法，提速收益明显。这是算法设计追求「多项式时间」的根本原因。
        </div>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>1.2.2 渐进符号 O、Ω、Θ</h2>
    <div class="card-grid">
      <div class="card">
        <span class="badge badge-primary">上界</span>
        <h3 style="margin-top:.5rem">大 O</h3>
        <p style="font-size:.9rem;color:var(--text-dim)"><span class="formula">f(n)=O(g(n))</span>：存在 c,n₀，使 n≥n₀ 时 0≤f(n)≤c·g(n)。「不会比 g 差太多」。</p>
      </div>
      <div class="card">
        <span class="badge badge-accent">下界</span>
        <h3 style="margin-top:.5rem">大 Ω</h3>
        <p style="font-size:.9rem;color:var(--text-dim)"><span class="formula">f(n)=Ω(g(n))</span>：存在 c,n₀，使 f(n)≥c·g(n)。「至少和 g 一样好/坏」。</p>
      </div>
      <div class="card">
        <span class="badge badge-purple">紧界</span>
        <h3 style="margin-top:.5rem">大 Θ</h3>
        <p style="font-size:.9rem;color:var(--text-dim)"><span class="formula">f(n)=Θ(g(n))</span>：同时是 O 与 Ω——同阶，最精确的刻画。</p>
      </div>
    </div>
    <div class="demo-panel">
      <div class="demo-header"><h3>🔢 交互：判断多项式阶</h3></div>
      <div class="demo-body">
        <p style="color:var(--text-dim);margin-bottom:.8rem">输入形如 <code>3n^3+2n+1</code> 的多项式，系统给出 Θ 阶：</p>
        <div class="demo-controls">
          <input id="polyIn" value="3*n**3 + 2*n + 1" style="flex:1;min-width:200px;padding:.5rem .8rem;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-family:var(--font-mono)">
          <button class="btn btn-primary" onclick="analyzePoly()">分析</button>
        </div>
        <div class="status-bar" id="polyOut">点击「分析」查看结果</div>
      </div>
    </div>
    <div class="steps">
      <div class="step"><div class="step-body"><strong>分析问题规模 n</strong>，找出最深层循环中的基本操作，统计次数 f(n)。</div></div>
      <div class="step"><div class="step-body"><strong>忽略低阶项与最高阶系数</strong>，得到渐进阶，用 O/Ω/Θ 表示。</div></div>
      <div class="step"><div class="step-body"><strong>最好 / 平均 / 最坏</strong> 情况分别讨论；通常默认分析最坏情况。</div></div>
    </div>
  </section>

  <section data-section="s5" id="s5">
    <h2>课堂小测</h2>
    <div class="card" data-quiz id="quiz1">
      <p style="font-weight:600;margin-bottom:.6rem">Q1. 下列哪一个算法特性被「死循环」直接破坏？</p>
      <button class="quiz-option" data-correct="0">确定性</button>
      <button class="quiz-option" data-correct="1">有穷性</button>
      <button class="quiz-option" data-correct="0">输入性</button>
      <button class="quiz-option" data-correct="0">输出性</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">
        正确！死循环使过程无法在有限步结束，违反有穷性。
      </div>
    </div>
    <div class="card" data-quiz id="quiz2">
      <p style="font-weight:600;margin-bottom:.6rem">Q2. 若 f(n)=5n²+3n+2，则 f(n) 的紧确界是？</p>
      <button class="quiz-option" data-correct="0">O(n)</button>
      <button class="quiz-option" data-correct="0">O(n³)</button>
      <button class="quiz-option" data-correct="1">Θ(n²)</button>
      <button class="quiz-option" data-correct="0">Ω(n³)</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">
        正确！最高次为 n²，且系数非零，故 f(n)=Θ(n²)。O(n³) 也是上界但不够紧。
      </div>
    </div>
  </section>
'''
    js = r'''
document.getElementById('nMax').addEventListener('input', function(){
  document.getElementById('nMaxVal').textContent = this.value;
  drawComplexityChart('cpxChart', +this.value);
});
function analyzePoly(){
  const s = document.getElementById('polyIn').value.replace(/\s/g,'');
  // crude degree detection
  let deg = 0;
  const m = s.match(/n\*\*(\d+)|n\^(\d+)/g) || [];
  m.forEach(x=>{
    const d = parseInt(x.replace(/n\*\*|^n\^/,''));
    if(d>deg) deg=d;
  });
  if(/n(?![\*\^])/.test(s) && deg===0) deg=1;
  if(deg===0 && /n/.test(s)) deg=1;
  const out = deg===0
    ? '判定为 <strong>Θ(1)</strong>（常数阶）'
    : `判定为 <strong>Θ(n${deg>1?'<sup>'+deg+'</sup>':''})</strong> —— 最高次项次数为 ${deg}`;
  setStatus('#polyOut', out + ' <span style="color:var(--text-muted)">（教学用启发式解析，完整需符号运算）</span>');
}
'''
    write_ch(0, toc, body, js)

# ========== CH02 ==========
def gen_ch02():
    toc = [("s1","递归概述"),("s2","阶乘演示"),("s3","汉诺塔"),("s4","递归三条件"),("s5","测验")]
    body = r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="badge badge-purple">第2章</span>
    <h1 style="margin-top:.5rem">递归算法设计技术</h1>
    <p style="color:var(--text-dim);margin-top:.6rem">「从前有座山，山里有座庙……」——递归既是现象，也是思维：把问题归结为规模更小的同类问题，直到触及边界。</p>
  </div>

  <section data-section="s2" id="s2">
    <h2>2.1 阶乘：看见递归调用栈</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>🧮 n! 递归展开与回溯</h3>
        <div class="demo-controls" style="margin:0">
          <div class="slider-group"><label>n</label>
            <input type="range" id="facN" min="1" max="8" value="5">
            <span class="val" id="facNVal">5</span>
          </div>
          <button class="btn btn-primary" id="facRun">逐步执行</button>
          <button class="btn" id="facReset">重置</button>
        </div>
      </div>
      <div class="demo-body">
        <div class="pre-wrap"><span class="kw">int</span> <span class="fn">fac</span>(<span class="kw">int</span> n) {
  <span class="kw">if</span> (n == <span class="num">1</span>) <span class="kw">return</span> <span class="num">1</span>;  <span class="cm">// 边界条件</span>
  <span class="kw">else return</span> <span class="fn">fac</span>(n-<span class="num">1</span>) * n;  <span class="cm">// 递归式</span>
}</div>
        <div id="facStack" style="display:flex;flex-direction:column-reverse;gap:6px;min-height:200px;align-items:center;padding:1rem"></div>
        <div class="status-bar" id="facStatus">选择 n，点击「逐步执行」观察入栈与返回。</div>
      </div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>2.2 汉诺塔 · 递归分解可视化</h2>
    <p style="color:var(--text-dim)">将 n 盘从 A 移到 C（B 为辅助）：先把 n-1 移到 B，最大盘 A→C，再把 n-1 从 B 移到 C。</p>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>🗼 汉诺塔动画</h3>
        <div class="demo-controls" style="margin:0">
          <div class="slider-group"><label>盘数</label>
            <input type="range" id="hanN" min="1" max="6" value="3">
            <span class="val" id="hanNVal">3</span>
          </div>
          <button class="btn btn-primary" id="hanPlay">自动演示</button>
          <button class="btn" id="hanStep">单步</button>
          <button class="btn" id="hanReset">重置</button>
        </div>
      </div>
      <div class="demo-body">
        <canvas id="hanCanvas" width="700" height="280" style="width:100%;max-width:700px;height:auto;display:block;margin:0 auto;background:#0a0f1c;border-radius:10px;border:1px solid var(--border)"></canvas>
        <div class="status-bar" id="hanStatus">准备就绪。最少步数 = 2ⁿ − 1</div>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>递归适用的三个条件</h2>
    <div class="steps">
      <div class="step"><div class="step-body"><strong>可分解</strong>：问题可转化为一个或多个规模更小、结构相同的子问题。</div></div>
      <div class="step"><div class="step-body"><strong>有限深度</strong>：递归调用次数必须有限。</div></div>
      <div class="step"><div class="step-body"><strong>边界条件</strong>：必须存在明确的终止条件，否则将栈溢出。</div></div>
    </div>
    <div class="callout callout-info">
      <div class="callout-title">三类典型场景</div>
      ① 定义本身递归（阶乘、Fibonacci）；② 数据结构递归（链表、二叉树）；③ 求解过程递归（汉诺塔、回溯）。
    </div>
  </section>

  <section data-section="s5" id="s5">
    <h2>课堂小测</h2>
    <div class="card" data-quiz id="q2">
      <p style="font-weight:600">汉诺塔 n=4 时最少移动次数是？</p>
      <button class="quiz-option" data-correct="0">8</button>
      <button class="quiz-option" data-correct="1">15</button>
      <button class="quiz-option" data-correct="0">16</button>
      <button class="quiz-option" data-correct="0">7</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">2⁴ − 1 = 15。递推：T(n)=2T(n-1)+1，T(1)=1。</div>
    </div>
  </section>
'''
    js = r'''
// Factorial stack viz
let facSteps=[], facI=0, facTimer=null;
function buildFac(n){
  const steps=[];
  for(let i=n;i>=1;i--) steps.push({type:'push', val:i, text:`调用 fac(${i})`});
  let acc=1;
  for(let i=1;i<=n;i++){ acc*=i; steps.push({type:'pop', val:i, res:acc, text:`fac(${i}) 返回 ${acc}`}); }
  return steps;
}
function renderFacStack(stack){
  const el=document.getElementById('facStack');
  el.innerHTML=stack.map((v,i)=>`<div class="cell ${i===stack.length-1?'active':''}" style="width:auto;min-width:100px;padding:0 1rem">fac(${v})</div>`).join('')||'<span style="color:var(--text-muted)">栈空</span>';
}
document.getElementById('facN').oninput=function(){document.getElementById('facNVal').textContent=this.value};
document.getElementById('facReset').onclick=()=>{facI=0;facSteps=[];renderFacStack([]);setStatus('#facStatus','已重置');};
document.getElementById('facRun').onclick=async()=>{
  const n=+document.getElementById('facN').value;
  facSteps=buildFac(n); facI=0;
  let stack=[];
  for(const s of facSteps){
    if(s.type==='push'){stack.push(s.val);renderFacStack(stack);setStatus('#facStatus','↓ '+s.text);}
    else{stack.pop();renderFacStack(stack);setStatus('#facStatus','↑ '+s.text);}
    await sleep(450);
  }
  setStatus('#facStatus',`<strong>${n}! = ${facSteps[facSteps.length-1].res}</strong> 完成`);
};

// Hanoi
const poles=[[],[],[]];
let moves=[], moveI=0, hanAnim=false;
const colors=['#60a5fa','#a78bfa','#34d399','#fbbf24','#f472b6','#22d3ee'];
function hanoiGen(n,a,b,c,out){ if(n===1){out.push([a,c]);return;} hanoiGen(n-1,a,c,b,out); out.push([a,c]); hanoiGen(n-1,b,a,c,out); }
function resetHan(){
  const n=+document.getElementById('hanN').value;
  poles[0]=[];poles[1]=[];poles[2]=[];
  for(let i=n;i>=1;i--) poles[0].push(i);
  moves=[]; moveI=0; hanoiGen(n,0,1,2,moves);
  drawHan();
  setStatus('#hanStatus',`共 ${moves.length} 步（2^${n}-1=${Math.pow(2,n)-1}）`);
}
function drawHan(){
  const cv=document.getElementById('hanCanvas');
  const ctx=cv.getContext('2d');
  const W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);
  const baseY=H-30, names=['A','B','C'];
  for(let p=0;p<3;p++){
    const cx=W/6 + p*W/3;
    ctx.fillStyle='rgba(148,163,184,.3)';
    ctx.fillRect(cx-4, 50, 8, baseY-50);
    ctx.fillRect(cx-70, baseY, 140, 8);
    ctx.fillStyle='#94a3b8'; ctx.font='14px Noto Sans SC'; ctx.textAlign='center';
    ctx.fillText(names[p], cx, H-8);
    poles[p].forEach((disk,i)=>{
      const w=20+disk*18, h=18, y=baseY-12-(i+1)*h;
      ctx.fillStyle=colors[disk-1];
      ctx.beginPath();
      ctx.roundRect(cx-w/2,y,w,h,4);
      ctx.fill();
      ctx.fillStyle='#0b1020'; ctx.font='bold 11px JetBrains Mono';
      ctx.fillText(disk, cx, y+13);
    });
  }
}
async function doMove(){
  if(moveI>=moves.length){setStatus('#hanStatus','<strong>完成！</strong>');return false;}
  const [f,t]=moves[moveI++];
  const d=poles[f].pop(); poles[t].push(d);
  drawHan();
  setStatus('#hanStatus',`步骤 ${moveI}/${moves.length}：盘 ${d} 从 ${'ABC'[f]} → ${'ABC'[t]}`);
  return moveI<moves.length;
}
document.getElementById('hanN').oninput=function(){document.getElementById('hanNVal').textContent=this.value;resetHan();};
document.getElementById('hanReset').onclick=resetHan;
document.getElementById('hanStep').onclick=()=>doMove();
document.getElementById('hanPlay').onclick=async()=>{
  if(hanAnim) return; hanAnim=true;
  if(moveI>=moves.length) resetHan();
  while(await doMove()) await sleep(400);
  hanAnim=false;
};
if(CanvasRenderingContext2D.prototype.roundRect===undefined){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
    this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);
  };
}
resetHan();
'''
    write_ch(1, toc, body, js)

print("Generating chapters 1-2...")
gen_index()
gen_ch01()
gen_ch02()
print("phase1 done")