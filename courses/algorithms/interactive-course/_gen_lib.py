# -*- coding: utf-8 -*-
import os

BASE = r"E:\360MoveData\Users\谢鑫\Desktop\算法设计与分析\interactive-course"
CH = os.path.join(BASE, "chapters")

CHAPTERS = [
    {"id": "01", "file": "ch01-intro.html", "title": "绪论", "en": "Introduction", "emoji": "🚀", "color": "#7aa2ff",
     "hook": "算法是什么？为什么有的程序一秒搞定，有的算到天荒地老？"},
    {"id": "02", "file": "ch02-recursion.html", "title": "递归", "en": "Recursion", "emoji": "🪞", "color": "#c4a1ff",
     "hook": "自己调用自己？栈里装的到底是什么？汉诺塔亲自推给你看。"},
    {"id": "03", "file": "ch03-brute.html", "title": "穷举法", "en": "Brute Force", "emoji": "🔍", "color": "#ffc14d",
     "hook": "暴力也是艺术——会剪枝的暴力，才是优雅的暴力。"},
    {"id": "04", "file": "ch04-divide.html", "title": "分治法", "en": "Divide & Conquer", "emoji": "⚔️", "color": "#3ee8a8",
     "hook": "大事化小，小事化了。看快排如何「分而治之」。"},
    {"id": "05", "file": "ch05-backtrack.html", "title": "回溯法", "en": "Backtracking", "emoji": "♟️", "color": "#ff8ec8",
     "hook": "能进则进，不行就退。N 皇后的试错之旅。"},
    {"id": "06", "file": "ch06-branch.html", "title": "分支限界", "en": "Branch & Bound", "emoji": "🗺️", "color": "#4de8ff",
     "hook": "广搜 + 限界 = 最短路径猎人。迷宫通关挑战！"},
    {"id": "07", "file": "ch07-dp.html", "title": "动态规划", "en": "DP", "emoji": "💎", "color": "#ff9f6b",
     "hook": "记住昨天的答案，今天就不用重算。填表上瘾警告。"},
    {"id": "08", "file": "ch08-greedy.html", "title": "贪心法", "en": "Greedy", "emoji": "🎯", "color": "#34d399",
     "hook": "每一步都选最好的——但先证明你不会选错！"},
    {"id": "09", "file": "ch09-graph.html", "title": "图算法", "en": "Graph", "emoji": "🕸️", "color": "#818cf8",
     "hook": "点与边的舞蹈：最小生成树如何「长」出来。"},
    {"id": "10", "file": "ch10-geometry.html", "title": "计算几何", "en": "Geometry", "emoji": "📐", "color": "#2dd4bf",
     "hook": "拖动点，看叉积变号——几何瞬间变得可触摸。"},
    {"id": "11", "file": "ch11-complexity.html", "title": "计算复杂性", "en": "Complexity", "emoji": "🌌", "color": "#e879f9",
     "hook": "P vs NP：计算机科学最著名的未解之谜。"},
    {"id": "12", "file": "ch12-prob-approx.html", "title": "概率与近似", "en": "Randomized", "emoji": "🎲", "color": "#38bdf8",
     "hook": "抛硬币也能算 π？随机与近似的魅力。"},
]

def shell_head(title, chapter_id=""):
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} · 算法互动课堂</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/common.css">
</head>
<body data-chapter="{chapter_id}">
<button class="menu-toggle" onclick="toggleSidebar()" aria-label="菜单">☰</button>
'''

def sidebar(ch_id, toc_items):
    links = "\n".join(
        f'<a class="nav-link{" active" if c["id"]==ch_id else ""}" href="{c["file"]}"><span class="dot"></span>{c["emoji"]} {c["id"]} {c["title"]}</a>'
        for c in CHAPTERS)
    toc = "\n".join(f'<a class="nav-link toc" href="#{t[0]}">{t[1]}</a>' for t in toc_items)
    return f'''
<div class="app-shell">
<aside class="sidebar">
  <div class="sidebar-brand">
    <a href="../index.html">
      <div class="logo"><span>AD</span>算法互动课堂</div>
      <div class="sub">玩中学 · 看见算法</div>
    </a>
  </div>
  <div class="nav-section">本页导航</div>
  {toc}
  <div class="nav-section">全部章节</div>
  {links}
  <div class="nav-section">返回</div>
  <a class="nav-link" href="../index.html">🏠 课程大厅</a>
</aside>
'''

def chapter_nav(idx):
    prev_c = CHAPTERS[idx-1] if idx > 0 else None
    next_c = CHAPTERS[idx+1] if idx < len(CHAPTERS)-1 else None
    left = f'''<a href="{prev_c["file"]}"><span class="dir">← 上一章</span><span class="name">{prev_c["emoji"]} 第{int(prev_c["id"])}章 {prev_c["title"]}</span></a>''' if prev_c else "<div></div>"
    right = f'''<a href="{next_c["file"]}" style="text-align:right"><span class="dir">下一章 →</span><span class="name">{next_c["emoji"]} 第{int(next_c["id"])}章 {next_c["title"]}</span></a>''' if next_c else "<div></div>"
    return f'<div class="chapter-nav">{left}{right}</div>'

def shell_foot(js):
    return f'''
</main>
</div>
<script src="../assets/common.js"></script>
<script>
{js}
</script>
</body>
</html>
'''

def write_ch(idx, toc, body, js):
    c = CHAPTERS[idx]
    html = shell_head(f"第{int(c['id'])}章 {c['title']}", f"ch{c['id']}")
    html += sidebar(c["id"], toc)
    html += f'''
<main class="main">
  <div class="topbar">
    <div class="breadcrumb">
      <a href="../index.html">课程大厅</a> <span>/</span>
      <span>第{int(c["id"])}章 {c["title"]}</span>
    </div>
    <span class="badge badge-fun">🎮 互动课堂</span>
  </div>
  <div class="progress-track" title="阅读进度"><div class="fill"></div></div>
  {body}
  {chapter_nav(idx)}
'''
    html += shell_foot(js)
    path = os.path.join(CH, c["file"])
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print("OK", c["file"])
