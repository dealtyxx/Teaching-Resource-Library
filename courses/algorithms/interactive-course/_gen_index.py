# -*- coding: utf-8 -*-
import os
from _gen_lib import BASE, CHAPTERS

cards = []
for c in CHAPTERS:
    tags = "".join(f'<span class="badge badge-primary">{t}</span>' for t in [
        c["en"], "可交互", "有测验"
    ])
    cards.append(f'''
<a class="ch-card fade-in" href="chapters/{c["file"]}" style="--c:{c["color"]}" data-emoji="{c["emoji"]}">
  <div class="ch-num">CHAPTER {c["id"]}</div>
  <h3>{c["emoji"]} {c["title"]}</h3>
  <p>{c["hook"]}</p>
  <div class="tags">{tags}</div>
  <div class="play-hint">开始探索 →</div>
</a>''')

html = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>算法互动课堂 · 玩中学算法设计与分析</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/common.css">
</head>
<body>
<div class="portal-wrap">
  <nav class="portal-nav">
    <div class="brand"><i>AD</i> 算法互动课堂</div>
    <div style="display:flex;gap:.6rem;align-items:center">
      <span class="badge badge-purple">李春葆 · 第3版</span>
      <button class="btn btn-ghost" onclick="localStorage.clear();location.reload()" title="重置进度">重置 XP</button>
    </div>
  </nav>

  <header class="portal-hero fade-in">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="badge badge-fun" style="margin-bottom:1rem">✨ 不是又一页 PPT · 是能「玩」的算法宇宙</div>
    <h1>算法设计与分析</h1>
    <p class="tagline">
      把抽象复杂度变成<strong style="color:var(--primary-bright)">会动的曲线</strong>，
      把递归变成<strong style="color:var(--purple)">看得见的栈</strong>，
      把回溯变成<strong style="color:var(--pink)">会呼吸的棋盘</strong>。<br>
      做测验攒 XP、点亮星星 —— 学算法也可以上瘾。
    </p>
    <div class="cta-row">
      <a class="btn btn-primary btn-lg" href="chapters/ch01-intro.html">🚀 从第 1 章启航</a>
      <a class="btn btn-lg" href="#chapters">📚 浏览全部章节</a>
    </div>
    <div class="stats-row">
      <div class="stat-pill"><div class="n">12</div><div class="l">精美章节</div></div>
      <div class="stat-pill"><div class="n">40+</div><div class="l">互动实验</div></div>
      <div class="stat-pill"><div class="n">XP</div><div class="l">升级系统</div></div>
      <div class="stat-pill"><div class="n">0</div><div class="l">安装依赖</div></div>
    </div>
  </header>

  <h2 class="section-title" id="chapters">选择你的关卡
    <span>每一章都是独立可玩的小世界 · 建议按序通关</span>
  </h2>
  <section class="chapter-cards">
    {"".join(cards)}
  </section>

  <footer class="portal-footer">
    <p>🎮 完成测验可获得 XP 与星星 · 进度保存在本机浏览器</p>
    <p style="margin-top:.5rem">教材：《算法设计与分析》（第3版）李春葆等 · 清华大学出版社</p>
    <p style="margin-top:.35rem;opacity:.7">单文件 HTML · 课堂投影 / 自学刷题 两相宜</p>
  </footer>
</div>
<script src="assets/common.js"></script>
</body>
</html>'''

with open(os.path.join(BASE, "index.html"), "w", encoding="utf-8") as f:
    f.write(html)
print("index OK")
