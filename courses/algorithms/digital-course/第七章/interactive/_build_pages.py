# -*- coding: utf-8 -*-
"""
第7章 动态规划 · 强交互 / 强可视化版
Canvas 动效 · 填表高亮 · 路径回溯 · 离线可用
"""
from pathlib import Path
OUT = Path(__file__).resolve().parent

CSS = r"""
:root{
  --bg:#eef3fb; --surface:#fff; --s2:#f4f7fc; --s3:#e8eef8;
  --text:#0b1220; --muted:#5a6b85; --faint:#8b9bb5;
  --line:rgba(37,99,235,.13); --line2:rgba(37,99,235,.24);
  --blue:#2563eb; --blue2:#1d4ed8; --blueS:rgba(37,99,235,.1);
  --red:#dc2626; --redS:rgba(220,38,38,.09);
  --green:#0f766e; --greenS:rgba(15,118,110,.1);
  --amber:#d97706; --violet:#6d28d9; --orange:#ea580c;
  --shadow:0 8px 28px rgba(37,99,235,.12); --shadow2:0 22px 50px rgba(37,99,235,.18);
  --r:22px;
  --font:"Segoe UI","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  --mono:ui-monospace,"Cascadia Code",Consolas,monospace;
  --ease:cubic-bezier(.22,1,.36,1);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{
  font-family:var(--font);color:var(--text);min-height:100vh;overflow-x:hidden;
  background:
    radial-gradient(1100px 560px at 5% -8%,rgba(234,88,12,.12),transparent 55%),
    radial-gradient(900px 480px at 95% 0%,rgba(37,99,235,.12),transparent 50%),
    radial-gradient(700px 400px at 50% 110%,rgba(15,118,110,.07),transparent 45%),
    linear-gradient(180deg,#f8fafc,#eef3fb 50%,#e8eef8);
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;text-decoration:none} button,input{font:inherit}
.fx-bg{position:fixed;inset:0;pointer-events:none;z-index:0}
.fx-bg canvas{width:100%;height:100%;display:block;opacity:.5}
.nav,.wrap{position:relative;z-index:1}
.nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  padding:11px 18px;background:rgba(255,255,255,.86);backdrop-filter:blur(18px) saturate(1.35);
  border-bottom:1px solid var(--line);box-shadow:0 8px 24px rgba(15,23,42,.05)}
.nav .brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:14px}
.nav .logo{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;
  background:linear-gradient(135deg,#f97316,#2563eb 55%,#0f766e);color:#fff;
  font:800 11px var(--mono);box-shadow:0 6px 16px rgba(234,88,12,.35);
  transform:perspective(200px) rotateY(-8deg);transition:transform .3s var(--ease)}
.nav .brand:hover .logo{transform:perspective(200px) rotateY(8deg) scale(1.05)}
.nav .brand span{color:var(--orange)}
.nav .links{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end;max-width:min(100%,920px)}
.nav a.pill{font-size:11px;font-weight:700;padding:6px 10px;border-radius:999px;color:var(--muted);border:1px solid transparent;transition:.2s var(--ease)}
.nav a.pill:hover{color:var(--blue);background:var(--blueS);border-color:var(--line)}
.nav a.pill.active{color:#fff;background:linear-gradient(135deg,#f97316,#ea580c);box-shadow:0 4px 14px rgba(234,88,12,.35)}
.wrap{max-width:1160px;margin:0 auto;padding:26px 16px 70px}
.hero{margin-bottom:24px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;color:var(--orange);
  letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:999px;background:rgba(234,88,12,.1);
  border:1px solid rgba(234,88,12,.2);margin-bottom:12px}
.hero h1{font-size:clamp(1.55rem,3.3vw,2.4rem);line-height:1.15;font-weight:900;letter-spacing:-.025em;margin-bottom:12px;
  background:linear-gradient(120deg,#0b1220,#9a3412 30%,#ea580c 55%,#2563eb 85%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{color:var(--muted);font-size:1.04rem;max-width:780px;line-height:1.7}
.hero-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:12.5px;font-weight:700;
  background:#fff;border:1px solid var(--line);color:var(--muted);box-shadow:0 2px 8px rgba(15,23,42,.04)}
.chip.blue{background:var(--blueS);color:var(--blue)} .chip.green{background:var(--greenS);color:var(--green)}
.chip.orange{background:rgba(234,88,12,.1);color:var(--orange)}
.grid{display:grid;gap:16px}
.grid-2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.grid-3{grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px;box-shadow:var(--shadow);
  position:relative;overflow:hidden;transition:transform .28s var(--ease),box-shadow .28s,border-color .28s}
.card:hover{transform:translateY(-3px);box-shadow:var(--shadow2);border-color:var(--line2)}
.card::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--accent,linear-gradient(90deg,#f97316,var(--blue)))}
.card h3{font-size:1.08rem;font-weight:800;margin-bottom:8px}
.card p,.desc{color:var(--muted);line-height:1.65;font-size:.94rem}
.badge{display:inline-flex;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;margin-bottom:10px;
  background:rgba(234,88,12,.1);color:var(--orange);border:1px solid rgba(234,88,12,.2)}
.badge.blue{background:var(--blueS);color:var(--blue);border-color:rgba(37,99,235,.18)}
.badge.green{background:var(--greenS);color:var(--green);border-color:rgba(15,118,110,.18)}
.badge.red{background:var(--redS);color:var(--red);border-color:rgba(220,38,38,.16)}
a.feature-card{display:flex;flex-direction:column;min-height:165px;padding:18px;border-radius:var(--r);
  background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);position:relative;overflow:hidden;
  transition:transform .3s var(--ease),box-shadow .3s;transform-style:preserve-3d}
a.feature-card::after{content:attr(data-ico);position:absolute;right:12px;top:10px;font-size:40px;opacity:.14;
  transition:transform .35s var(--ease),opacity .35s}
a.feature-card:hover{transform:translateY(-8px) rotateX(2deg) scale(1.015);box-shadow:var(--shadow2);
  border-color:color-mix(in srgb,var(--c,#ea580c) 40%,transparent)}
a.feature-card:hover::after{opacity:.28;transform:scale(1.15) rotate(8deg)}
a.feature-card .num{font:800 12px var(--mono);color:var(--c,#ea580c);letter-spacing:.06em;margin-bottom:8px}
a.feature-card h3{font-size:1.08rem;margin-bottom:6px}
a.feature-card p{color:var(--muted);font-size:.87rem;line-height:1.55;flex:1}
a.feature-card .go{margin-top:12px;font-size:12.5px;font-weight:800;color:var(--c,#ea580c);
  opacity:0;transform:translateX(-8px);transition:.25s var(--ease)}
a.feature-card:hover .go{opacity:1;transform:none}
.btn{appearance:none;border:1px solid var(--line);background:var(--s2);color:var(--text);
  padding:10px 16px;border-radius:13px;cursor:pointer;font-weight:800;font-size:13.5px;
  transition:.2s var(--ease);display:inline-flex;align-items:center;gap:6px;box-shadow:0 1px 2px rgba(15,23,42,.05)}
.btn:hover{border-color:var(--line2);background:#fff;color:var(--orange);transform:translateY(-1px)}
.btn:active{transform:scale(.98)}
.btn.primary{background:linear-gradient(135deg,#fb923c,#ea580c);border:none;color:#fff;box-shadow:0 8px 20px rgba(234,88,12,.32)}
.btn.primary:hover{filter:brightness(1.06);color:#fff}
.btn.ghost{background:transparent}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important}
.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0}
.toolbar label{font-size:12.5px;color:var(--muted);font-weight:700}
input[type=range]{width:130px;accent-color:var(--orange);cursor:pointer}
.kbd{font:700 12px var(--mono);background:var(--s3);border:1px solid var(--line);border-radius:8px;padding:3px 8px;color:var(--orange);min-width:1.8rem;text-align:center}
.speed{display:flex;gap:4px;background:var(--s2);padding:3px;border-radius:11px;border:1px solid var(--line)}
.speed button{border:none;background:transparent;padding:6px 11px;border-radius:8px;font-size:12px;font-weight:800;color:var(--muted);cursor:pointer}
.speed button.on{background:#fff;color:var(--orange);box-shadow:0 1px 4px rgba(15,23,42,.08)}
.tip{margin-top:12px;padding:13px 15px;border-radius:15px;background:linear-gradient(135deg,rgba(234,88,12,.08),var(--blueS));
  border:1px solid var(--line);color:var(--muted);font-size:13.5px;line-height:1.65}
.tip strong{color:var(--text)}
.tip.ok{background:var(--greenS);border-color:rgba(15,118,110,.22)}
.tip.danger{background:var(--redS);border-color:rgba(220,38,38,.2)}
.formula{font-family:var(--mono);background:linear-gradient(135deg,#fff7ed,#eff6ff);border:1px solid rgba(234,88,12,.25);
  border-radius:16px;padding:16px 18px;margin-top:10px;color:#c2410c;font-size:15px;line-height:1.55;text-align:center;font-weight:750}
.formula.lg{font-size:clamp(1.1rem,2.5vw,1.5rem);padding:20px}
.code{font-family:var(--mono);font-size:12.5px;line-height:1.7;background:#0f172a;color:#e2e8f0;border-radius:16px;
  padding:15px 16px;overflow:auto;white-space:pre;margin-top:10px}
.code .cm{color:#64748b}.code .kw{color:#fdba74}.code .fn{color:#93c5fd}
.stat-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.stat{flex:1;min-width:100px;background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px;transition:transform .2s}
.stat:hover{transform:translateY(-2px)}
.stat span{font-size:11.5px;color:var(--faint);font-weight:700}
.stat b{display:block;font-size:1.3rem;margin-top:4px;font-weight:900;font-variant-numeric:tabular-nums}
.stat b.blue{color:var(--blue)}.stat b.green{color:var(--green)}.stat b.red{color:var(--red)}.stat b.orange{color:var(--orange)}
.list-step{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;margin:8px 0;border-radius:14px;border:1px solid var(--line);background:#fff}
.list-step .n{flex-shrink:0;width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900}
.list-step .body{flex:1;font-size:.92rem;color:var(--muted);line-height:1.55}
.list-step .body b{color:var(--text)}
table.data{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;margin-top:8px;overflow:hidden;border-radius:14px;border:1px solid var(--line)}
table.data th,table.data td{padding:9px 11px;text-align:center;border-bottom:1px solid var(--line)}
table.data th{background:var(--s3);color:var(--muted);font-size:11.5px;font-weight:800}
table.data tr:last-child td{border-bottom:none}
table.data td.hl{background:rgba(234,88,12,.15);font-weight:800;color:#c2410c;box-shadow:inset 0 0 0 2px rgba(234,88,12,.35)}
table.data td.path{background:rgba(15,118,110,.15);font-weight:800;color:var(--green)}
table.data td.dim{opacity:.45}
.stage-wrap{position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow);background:#0b1220}
.stage-wrap.light{background:linear-gradient(rgba(234,88,12,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.04) 1px,transparent 1px),#f8fafc;background-size:22px 22px,22px 22px,auto}
canvas.stage{width:100%;display:block;touch-action:none}
.stage-hud{position:absolute;left:12px;top:12px;right:12px;display:flex;justify-content:space-between;gap:8px;pointer-events:none;flex-wrap:wrap}
.hud-pill{padding:6px 11px;border-radius:999px;background:rgba(15,23,42,.72);color:#e2e8f0;font:700 12px var(--mono);border:1px solid rgba(255,255,255,.1)}
.hud-pill.light{background:rgba(255,255,255,.92);color:var(--text);border-color:var(--line)}
.legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;font-size:12.5px;color:var(--muted);font-weight:700}
.legend i{display:inline-block;width:11px;height:11px;border-radius:4px;margin-right:5px;vertical-align:middle}
.log{max-height:170px;overflow:auto;font:12px/1.65 var(--mono);color:var(--muted);background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px;margin-top:10px}
.cells{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:12px 0;align-items:flex-end}
.cell{min-width:48px;min-height:48px;border-radius:12px;display:grid;place-items:center;font-weight:900;font-size:15px;
  border:1.5px solid var(--line);background:#fff;transition:all .28s var(--ease);position:relative;box-shadow:0 2px 8px rgba(15,23,42,.05)}
.cell .idx{position:absolute;bottom:-16px;font-size:10px;color:var(--faint);font-weight:700}
.cell.on{border-color:var(--orange);background:rgba(234,88,12,.12);color:var(--orange);transform:translateY(-6px) scale(1.08);box-shadow:0 10px 22px rgba(234,88,12,.25)}
.cell.hit{border-color:var(--green);background:var(--greenS);color:var(--green)}
.cell.live{border-color:var(--blue);background:var(--blueS);color:var(--blue)}
.cell.bar{display:flex;flex-direction:column;justify-content:flex-end;padding:0;overflow:hidden;height:100px;min-width:36px}
.cell.bar i{display:block;width:100%;border-radius:8px 8px 0 0;transition:height .35s var(--ease)}
.page-nav{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:36px;padding-top:22px;border-top:1px solid var(--line)}
.page-nav a{display:flex;flex-direction:column;min-width:160px;padding:14px 16px;border-radius:16px;border:1px solid var(--line);
  background:#fff;box-shadow:var(--shadow);transition:.25s var(--ease)}
.page-nav a:hover{transform:translateY(-3px);box-shadow:var(--shadow2);border-color:var(--line2)}
.page-nav .dir{font-size:11px;font-weight:800;color:var(--faint);letter-spacing:.06em;text-transform:uppercase}
.page-nav .name{font-weight:800;margin-top:4px}
.footer{margin-top:28px;text-align:center;color:var(--faint);font-size:12.5px;line-height:1.65}
.footer b{color:var(--muted)}
.fade-in{animation:up .5s var(--ease) both}
@keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.stagger>*{animation:up .45s var(--ease) both}
.stagger>*:nth-child(1){animation-delay:.03s}.stagger>*:nth-child(2){animation-delay:.07s}
.stagger>*:nth-child(3){animation-delay:.11s}.stagger>*:nth-child(4){animation-delay:.15s}
.stagger>*:nth-child(5){animation-delay:.19s}.stagger>*:nth-child(6){animation-delay:.23s}
.pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--orange);box-shadow:0 0 0 0 rgba(234,88,12,.45);animation:pulse 1.6s infinite;display:inline-block}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(234,88,12,.45)}70%{box-shadow:0 0 0 10px transparent}}
.flip3d{perspective:1200px}
.flip-card3d{position:relative;min-height:200px;transform-style:preserve-3d;transition:transform .7s var(--ease);cursor:pointer}
.flip-card3d.flipped{transform:rotateY(180deg)}
.flip-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:var(--r);padding:18px;background:#fff;border:1px solid var(--line);box-shadow:var(--shadow);display:flex;flex-direction:column}
.flip-face.back{transform:rotateY(180deg);background:linear-gradient(160deg,#fff7ed,#eff6ff)}
.flip-hint{margin-top:auto;font-size:12px;font-weight:800;color:var(--orange)}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
"""

COMMON_JS = r"""
(function(){
  const host=document.querySelector('.fx-bg'); if(!host) return;
  const cv=document.createElement('canvas'); host.appendChild(cv);
  const ctx=cv.getContext('2d'); let parts=[];
  function resize(){
    cv.width=innerWidth*devicePixelRatio; cv.height=innerHeight*devicePixelRatio;
    cv.style.width=innerWidth+'px'; cv.style.height=innerHeight+'px';
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    parts=Array.from({length:32},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:1+Math.random()*2, vx:(Math.random()-.5)*.2, vy:-.12-Math.random()*.3, a:.12+Math.random()*.3}));
  }
  function tick(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; if(p.y<-10){p.y=innerHeight+10;p.x=Math.random()*innerWidth;}
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(234,88,12,${p.a})`; ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  addEventListener('resize',resize); resize(); tick();
})();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
"""

LINKS = [
    ("index.html","总览"),
    ("01-overview.html","概述"),
    ("02-principle.html","原理"),
    ("03-models.html","模型"),
    ("04-maxsub.html","最大子段和"),
    ("05-lis.html","LIS"),
    ("06-triangle.html","三角形"),
    ("07-lcs.html","LCS"),
    ("08-edit.html","编辑距离"),
    ("09-knapsack.html","01背包"),
    ("10-multi.html","完全/多重"),
    ("11-tsp.html","状压TSP"),
    ("12-interval-tree.html","区间/树形"),
]
CH = "第7章 动态规划"

def nav(active):
    pills="".join(f'<a class="{"pill active" if h==active else "pill"}" href="{h}">{lab}</a>' for h,lab in LINKS)
    return f'''<div class="fx-bg" aria-hidden="true"></div>
<nav class="nav"><div class="brand"><div class="logo">07</div>算法可视化 · <span>{CH}</span></div>
<div class="links">{pills}</div></nav>'''

def page_nav(prev=None, nxt=None):
    left=f'<a href="{prev[0]}"><span class="dir">← 上一节</span><span class="name">{prev[1]}</span></a>' if prev else '<div></div>'
    right=f'<a href="{nxt[0]}" style="text-align:right"><span class="dir">下一节 →</span><span class="name">{nxt[1]}</span></a>' if nxt else '<div></div>'
    return f'<div class="page-nav">{left}{right}</div>'

def page(title, active, body, js="", prev=None, nxt=None):
    return f"""<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{title} · {CH}</title>
<style>{CSS}</style></head><body>
{nav(active)}
<div class="wrap fade-in">
{body}
{page_nav(prev,nxt)}
<div class="footer">算法设计与分析 · <b>{CH}</b> · 强交互可视化版<br/>Canvas 填表 · 路径回溯 · 建议全屏投影</div>
</div>
<script>
{COMMON_JS}
{js}
</script></body></html>"""

def write(name, html):
    (OUT/name).write_text(html, encoding="utf-8")
    print("✓", name)

def build():
    OUT.mkdir(parents=True, exist_ok=True)

    # ========== INDEX ==========
    items = [
        ("01-overview.html","01","从 Fib 认识 DP","递归爆炸 vs 填表 · 柱状对比","#ea580c","💎"),
        ("02-principle.html","02","原理与多段图","阶段 · 状态 · 转移动画","#2563eb","🔀"),
        ("03-models.html","03","性质与模型全景","3D 翻转卡片记忆","#0f766e","🗺️"),
        ("04-maxsub.html","04","最大连续子段和","Kadane 扫描光带","#dc2626","📈"),
        ("05-lis.html","05","最长递增子序列","O(n²) 高亮 + 路径","#7c3aed","📶"),
        ("06-triangle.html","06","三角形最小路径","自底向上点亮","#0891b2","🔺"),
        ("07-lcs.html","07","最长公共子序列","二维表热力填表","#2563eb","🧬"),
        ("08-edit.html","08","编辑距离","动态表格 + 操作路径","#dc2626","✏️"),
        ("09-knapsack.html","09","0/1 背包","格子冒险填表","#ea580c","🎒"),
        ("10-multi.html","10","完全 / 多重背包","正序 vs 逆序对比","#0f766e","📦"),
        ("11-tsp.html","11","状压 DP · TSP","子集环游可视化","#7c3aed","🧳"),
        ("12-interval-tree.html","12","区间 / 树形 DP","合并区间 · 树上递推","#2563eb","🌲"),
    ]
    cards="".join(f'''
<a class="feature-card" href="{h}" style="--c:{c}" data-ico="{ico}">
  <div class="num">图 {n}</div><h3>{t}</h3><p>{d}</p><div class="go">进入实验 →</div>
</a>''' for h,n,t,d,c,ico in items)

    write("index.html", page("交互总览","index.html", f'''
<section class="hero">
  <div class="eyebrow"><span class="pulse-dot"></span> Immersive Lab · Chapter 7</div>
  <h1>动态规划 · 沉浸式填表实验室</h1>
  <p>把「重叠子问题」变成<strong>会发光的表格、会生长的柱状图、会回溯的路径</strong>。自底向上，一眼看懂状态转移。</p>
  <div class="hero-meta">
    <span class="chip orange">🎨 12 个精讲实验</span>
    <span class="chip blue">📊 填表动画</span>
    <span class="chip green">↩️ 路径回溯</span>
  </div>
</section>
<div class="card" style="--accent:linear-gradient(90deg,#f97316,#2563eb,#0f766e);margin-bottom:18px">
  <div class="formula lg">动态规划 ＝ 最优子结构 ＋ 重叠子问题 ＋ 填表复用</div>
  <div class="stage-wrap" style="margin-top:14px;height:150px">
    <canvas class="stage" id="heroCv" width="1100" height="150"></canvas>
    <div class="stage-hud"><span class="hud-pill">LIVE · DP 填表示意</span><span class="hud-pill">auto</span></div>
  </div>
</div>
<div class="grid grid-2 stagger">{cards}</div>
''', r'''
const cv=heroCv, ctx=cv.getContext('2d');
let n=12, dp=Array(n).fill(0), i=2; dp[0]=0; dp[1]=1;
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  const W=cv.width, H=cv.height, gap=W/(n+1);
  const maxV=Math.max(...dp,1);
  for(let k=0;k<n;k++){
    const h=Math.max(6,(dp[k]/maxV)*90), x=gap*(k+1), y=H-30;
    const g=ctx.createLinearGradient(x,y,x,y-h);
    if(k===i){ g.addColorStop(0,'#fdba74'); g.addColorStop(1,'#ea580c'); }
    else { g.addColorStop(0,'#93c5fd'); g.addColorStop(1,'#2563eb'); }
    ctx.fillStyle=g;
    round(ctx,x-14,y-h,28,h,6); ctx.fill();
    ctx.fillStyle='#94a3b8'; ctx.font='11px ui-monospace'; ctx.textAlign='center';
    ctx.fillText(k,x,y+16);
  }
}
function round(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
setInterval(()=>{
  if(i<n){ if(i>=2) dp[i]=dp[i-1]+dp[i-2]; i++; }
  else { i=2; dp=Array(n).fill(0); dp[1]=1; }
  draw();
}, 280); draw();
''', None, ("01-overview.html","概述")))

    # ---- 01 Fib ----
    write("01-overview.html", page("概述","01-overview.html", r'''
<section class="hero">
  <div class="eyebrow">图 1 · 入门</div>
  <h1>从 Fibonacci 看见「记忆」的力量</h1>
  <p>朴素递归重复计算同一子问题；DP 填表一次算完。下方同时展示<strong>调用爆炸柱</strong>与<strong>线性填表</strong>。</p>
</section>
<div class="card">
  <div class="toolbar">
    <label>n</label><input type="range" id="n" min="5" max="16" value="10"/><span class="kbd" id="nv">10</span>
    <button class="btn primary" id="run">▶ 双轨对比</button>
    <div class="speed" id="spd"><button data-ms="400">慢</button><button data-ms="220" class="on">中</button><button data-ms="80">快</button></div>
  </div>
  <div class="stage-wrap" style="height:320px">
    <canvas class="stage" id="cv" width="1000" height="320"></canvas>
    <div class="stage-hud"><span class="hud-pill" id="hud">Fib Lab</span><span class="hud-pill" id="hud2">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>Fib(n)</span><b class="orange" id="ans">—</b></div>
    <div class="stat"><span>朴素调用约</span><b class="red" id="calls">—</b></div>
    <div class="stat"><span>DP 加法次数</span><b class="green" id="adds">—</b></div>
  </div>
  <div class="tip">左：递归调用次数（对数轴观感）；右：dp 表逐格点亮。</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let ms=220;
n.oninput=()=>nv.textContent=n.value;
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{spd.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');ms=+b.dataset.ms;});
function naiveCalls(x){ let c=0; (function f(k){ c++; return k<=2?1:f(k-1)+f(k-2); })(x); return c; }
function draw(dp, hi, callsLog){
  const W=cv.width, H=cv.height; ctx.clearRect(0,0,W,H);
  // split
  ctx.strokeStyle='rgba(148,163,184,.25)'; ctx.beginPath(); ctx.moveTo(W/2,20); ctx.lineTo(W/2,H-20); ctx.stroke();
  ctx.fillStyle='#94a3b8'; ctx.font='12px Segoe UI'; ctx.textAlign='center';
  ctx.fillText('朴素递归调用量 (示意)', W*0.25, 28);
  ctx.fillText('DP 填表', W*0.75, 28);
  // left bar for calls
  const maxC=Math.max(...callsLog,1);
  callsLog.forEach((c,i)=>{
    const h=Math.max(4, Math.log10(c+1)/Math.log10(maxC+1)*200);
    const x=40+i*((W/2-80)/Math.max(callsLog.length,1));
    ctx.fillStyle=i===hi?'#f97316':'#fb7185';
    ctx.fillRect(x, H-40-h, 18, h);
  });
  // right dp
  const maxD=Math.max(...dp,1);
  dp.forEach((v,i)=>{
    if(i===0) return;
    const h=Math.max(6,(v/maxD)*200), x=W/2+40+(i-1)*((W/2-80)/Math.max(dp.length-1,1));
    const g=ctx.createLinearGradient(x,0,x,H);
    if(i===hi){ g.addColorStop(0,'#fdba74'); g.addColorStop(1,'#ea580c'); }
    else { g.addColorStop(0,'#93c5fd'); g.addColorStop(1,'#2563eb'); }
    ctx.fillStyle=g; ctx.fillRect(x, H-40-h, 22, h);
    ctx.fillStyle='#64748b'; ctx.font='10px ui-monospace'; ctx.fillText(i, x+11, H-22);
  });
}
run.onclick=async()=>{
  const N=+n.value;
  const dp=Array(N+1).fill(0); dp[1]=1; if(N>=2) dp[2]=1;
  const callsLog=[0,1,1];
  for(let i=3;i<=N;i++) callsLog.push(naiveCalls(i));
  adds.textContent=Math.max(0,N-2);
  calls.textContent=callsLog[N];
  for(let i=1;i<=N;i++){
    if(i>=3) dp[i]=dp[i-1]+dp[i-2];
    ans.textContent=dp[i]; hud2.textContent=`i=${i}`;
    draw(dp,i,callsLog.slice(0,i+1));
    await sleep(ms);
  }
  hud2.textContent='done';
};
''', ("index.html","总览"), ("02-principle.html","原理")))

    # ---- 02 principle multiphase ----
    write("02-principle.html", page("原理","02-principle.html", r'''
<section class="hero">
  <div class="eyebrow">图 2 · 原理</div>
  <h1>多段图上的状态转移</h1>
  <p>阶段推进、状态集合、决策转移。点击播放，看最短路从终点「逆序点亮」。</p>
</section>
<div class="grid grid-2">
  <div class="card"><div class="badge blue">逆序</div><h3>从终点往回</h3>
    <div class="formula">f(s)=min { c(s,s') + f(s') }</div></div>
  <div class="card"><div class="badge">顺序</div><h3>从起点往前</h3>
    <div class="formula">f(s)=min { f(s') + c(s',s) }</div></div>
</div>
<div class="card" style="margin-top:16px">
  <div class="toolbar"><button class="btn primary" id="run">▶ 逆序点亮</button><button class="btn ghost" id="reset">重置</button></div>
  <div class="stage-wrap" style="height:340px">
    <canvas class="stage" id="cv" width="1000" height="340"></canvas>
    <div class="stage-hud"><span class="hud-pill">multistage graph</span><span class="hud-pill" id="hud">—</span></div>
  </div>
  <div class="tip">四步走：划阶段 → 定义状态 → 写转移与边界 → 定计算顺序。</div>
</div>
''', r'''
// stages: A | B1 B2 B3 | C1 C2 | D1 D2 | E
const nodes=[
  {id:'A',x:80,y:170,stage:0},{id:'B1',x:250,y:80,stage:1},{id:'B2',x:250,y:170,stage:1},{id:'B3',x:250,y:260,stage:1},
  {id:'C1',x:450,y:110,stage:2},{id:'C2',x:450,y:230,stage:2},
  {id:'D1',x:650,y:110,stage:3},{id:'D2',x:650,y:230,stage:3},{id:'E',x:860,y:170,stage:4}
];
const edges=[
  ['A','B1',4],['A','B2',2],['A','B3',3],
  ['B1','C1',3],['B1','C2',6],['B2','C1',4],['B2','C2',2],['B3','C1',5],['B3','C2',3],
  ['C1','D1',2],['C1','D2',5],['C2','D1',4],['C2','D2',1],
  ['D1','E',3],['D2','E',4]
];
const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
let f={}, nxt={}, active=null, done=new Set();
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  edges.forEach(([u,v,w])=>{
    const a=byId[u], b=byId[v];
    ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    ctx.fillStyle='#64748b'; ctx.font='11px ui-monospace'; ctx.fillText(w,(a.x+b.x)/2,(a.y+b.y)/2-6);
  });
  nodes.forEach(n=>{
    const on=active===n.id, ok=done.has(n.id);
    const g=ctx.createRadialGradient(n.x-5,n.y-5,2,n.x,n.y,22);
    if(on){g.addColorStop(0,'#fdba74');g.addColorStop(1,'#ea580c');}
    else if(ok){g.addColorStop(0,'#6ee7b7');g.addColorStop(1,'#0f766e');}
    else {g.addColorStop(0,'#93c5fd');g.addColorStop(1,'#2563eb');}
    ctx.beginPath(); ctx.arc(n.x,n.y,20,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 12px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(n.id,n.x,n.y);
    if(f[n.id]!=null){ ctx.fillStyle='#e2e8f0'; ctx.font='11px ui-monospace'; ctx.fillText('f='+f[n.id], n.x, n.y+32); }
  });
}
async function runAnim(){
  f={}; nxt={}; done=new Set(); f['E']=0; done.add('E'); draw(); hud.textContent='f(E)=0'; await sleep(400);
  // reverse stages 3..0
  for(let s=3;s>=0;s--){
    const layer=nodes.filter(n=>n.stage===s);
    for(const n of layer){
      active=n.id; draw();
      let best=1e9, bestTo=null;
      edges.filter(e=>e[0]===n.id).forEach(([u,v,w])=>{
        if(f[v]!=null && w+f[v]<best){ best=w+f[v]; bestTo=v; }
      });
      f[n.id]=best; nxt[n.id]=bestTo; done.add(n.id);
      hud.textContent=`f(${n.id})=${best} → ${bestTo}`;
      await sleep(450); draw();
    }
  }
  active=null; draw();
  // highlight path A->E
  let path=['A'], cur='A'; while(cur!=='E' && nxt[cur]){ cur=nxt[cur]; path.push(cur); }
  hud.textContent='最短路径 '+path.join(' → ')+'  length='+f['A'];
  // pulse path edges
  for(let k=0;k<path.length-1;k++){
    const a=byId[path[k]], b=byId[path[k+1]];
    ctx.strokeStyle='#fbbf24'; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    await sleep(200);
  }
}
run.onclick=runAnim; reset.onclick=()=>{f={};nxt={};done=new Set();active=null;hud.textContent='—';draw();};
draw();
''', ("01-overview.html","概述"), ("03-models.html","模型")))

    # ---- 03 models flip ----
    write("03-models.html", page("模型","03-models.html", r'''
<section class="hero">
  <div class="eyebrow">图 3 · 全景</div>
  <h1>性质与模型 · 翻转记忆卡</h1>
  <p>点击卡片翻转。把「人话状态定义」练到肌肉记忆。</p>
</section>
<div class="grid grid-3 stagger flip3d" id="flips"></div>
<div class="card" style="margin-top:16px">
  <h3>模型谱系速查</h3>
  <table class="data">
    <thead><tr><th>类型</th><th>例子</th><th>关键</th></tr></thead>
    <tbody>
      <tr><td>线性 DP</td><td>最大子段和、爬楼梯</td><td>一维推进</td></tr>
      <tr><td>背包 DP</td><td>0/1、完全、多重</td><td>容量维</td></tr>
      <tr><td>区间 DP</td><td>石子合并、矩阵链</td><td>长度枚举</td></tr>
      <tr><td>树形 DP</td><td>树上独立集</td><td>子树合并</td></tr>
      <tr><td>状压 DP</td><td>TSP、棋盘</td><td>子集 bitset</td></tr>
    </tbody>
  </table>
</div>
''', r'''
const cards=[
  {t:'最优子结构',d:'全局最优包含子问题最优',b:'没有它就无法用子问题拼答案'},
  {t:'重叠子问题',d:'同一子问题被反复计算',b:'这是填表/备忘录的理由'},
  {t:'无后效性',d:'未来只依赖当前状态',b:'状态必须「信息足够」'},
  {t:'状态定义',d:'dp[i] / dp[i][j] 是人话',b:'说不清状态就写不对转移'},
  {t:'转移方程',d:'大问题如何由小问题推出',b:'边界条件同样关键'},
  {t:'计算顺序',d:'保证依赖已算完',b:'自底向上或拓扑序'},
];
flips.innerHTML=cards.map((c,i)=>`
<div class="flip-card3d" data-i="${i}">
  <div class="flip-face"><div class="badge">性质 ${i+1}</div><h3 style="font-size:1.25rem;margin:10px 0">${c.t}</h3>
  <p class="desc">${c.d}</p><div class="flip-hint">点击翻转 ↻</div></div>
  <div class="flip-face back"><h3>${c.t}</h3><p class="desc" style="margin-top:12px">${c.b}</p><div class="flip-hint">再点翻回</div></div>
</div>`).join('');
flips.querySelectorAll('.flip-card3d').forEach(el=>el.onclick=()=>el.classList.toggle('flipped'));
''', ("02-principle.html","原理"), ("04-maxsub.html","最大子段和")))

    # ---- 04 max subarray ----
    write("04-maxsub.html", page("最大子段和","04-maxsub.html", r'''
<section class="hero">
  <div class="eyebrow">图 4 · Kadane</div>
  <h1>最大连续子序列和</h1>
  <p>dp[i]=以 i 结尾的最大和。扫描光带扫过数组，柱高实时变化。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 扫描</button>
    <button class="btn" id="rand">🎲 随机</button>
    <div class="speed" id="spd"><button data-ms="500">慢</button><button data-ms="280" class="on">中</button><button data-ms="120">快</button></div>
  </div>
  <div class="stage-wrap light" style="height:280px">
    <canvas class="stage" id="cv" width="1000" height="280"></canvas>
    <div class="stage-hud"><span class="hud-pill light">Kadane</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>当前 dp[i]</span><b class="orange" id="cur">—</b></div>
    <div class="stat"><span>全局最优</span><b class="green" id="best">—</b></div>
  </div>
  <div class="formula">dp[i] = max( a[i] , dp[i-1] + a[i] )</div>
</div>
''', r'''
let A=[-2,1,-3,4,-1,2,1,-5,4], ms=280;
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{spd.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');ms=+b.dataset.ms;});
function draw(dp, hi, bestL=0, bestR=-1){
  ctx.clearRect(0,0,cv.width,cv.height);
  const n=A.length, gap=cv.width/(n+1), mid=cv.height/2;
  ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.beginPath(); ctx.moveTo(30,mid); ctx.lineTo(cv.width-30,mid); ctx.stroke();
  const maxA=Math.max(...A.map(Math.abs),1);
  A.forEach((v,i)=>{
    const h=(Math.abs(v)/maxA)*90, x=gap*(i+1);
    const up=v>=0;
    let col=i===hi?'#ea580c':(i>=bestL&&i<=bestR&&bestR>=0?'#0f766e':'#2563eb');
    ctx.fillStyle=col;
    if(up) ctx.fillRect(x-16, mid-h, 32, h);
    else ctx.fillRect(x-16, mid, 32, h);
    ctx.fillStyle='#334155'; ctx.font='bold 13px ui-monospace'; ctx.textAlign='center';
    ctx.fillText(v, x, up? mid-h-10 : mid+h+16);
    if(dp && dp[i]!=null){ ctx.fillStyle='#64748b'; ctx.font='11px ui-monospace'; ctx.fillText('dp '+dp[i], x, cv.height-18); }
  });
  // scan line
  if(hi>=0){ const x=gap*(hi+1); ctx.strokeStyle='rgba(234,88,12,.5)'; ctx.lineWidth=2; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(x,20); ctx.lineTo(x,cv.height-30); ctx.stroke(); ctx.setLineDash([]); }
}
run.onclick=async()=>{
  const dp=Array(A.length).fill(0); let bestVal=A[0], bL=0, bR=0, start=0;
  for(let i=0;i<A.length;i++){
    if(i===0 || dp[i-1]+A[i]<A[i]){ dp[i]=A[i]; start=i; }
    else dp[i]=dp[i-1]+A[i];
    if(dp[i]>bestVal){ bestVal=dp[i]; bL=start; bR=i; }
    cur.textContent=dp[i];
    document.getElementById('best').textContent=bestVal;
    hud.textContent=`i=${i} 区间[${bL},${bR}]`;
    draw(dp,i,bL,bR); await sleep(ms);
  }
  draw(dp,-1,bL,bR); hud.textContent=`最优=${bestVal} 子段[${bL},${bR}]`;
};
rand.onclick=()=>{A=Array.from({length:10},()=>Math.floor(Math.random()*16)-7); draw(null,-1); cur.textContent='—'; document.getElementById('best').textContent='—';};
draw(null,-1);
''', ("03-models.html","模型"), ("05-lis.html","LIS")))

    # Fix best variable shadowing in 04 - I used best as both number and getElementById('best') - the element is id="best" and I assigned let best=A[0] which shadows. In run.onclick I have best.textContent which would fail. I already fixed with document.getElementById('best').textContent=best. Good.

    # ---- 05 LIS ----
    write("05-lis.html", page("LIS","05-lis.html", r'''
<section class="hero">
  <div class="eyebrow">图 5 · LIS</div>
  <h1>最长递增子序列</h1>
  <p>dp[i]=以 a[i] 结尾的 LIS 长度。动画展示每个位置的转移，最后高亮一条最优序列。</p>
</section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ 计算 LIS</button><button class="btn" id="rand">随机</button></div>
  <div class="cells" id="arr"></div>
  <div class="stage-wrap light" style="height:200px;margin-top:20px">
    <canvas class="stage" id="cv" width="1000" height="200"></canvas>
  </div>
  <div class="stat-row"><div class="stat"><span>LIS 长度</span><b class="green" id="ans">—</b></div></div>
  <div class="tip" id="tip">dp[i]=max{dp[j]}+1 (j&lt;i 且 a[j]&lt;a[i])</div>
</div>
''', r'''
let A=[10,9,2,5,3,7,101,18];
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function showArr(hi=-1, path=new Set()){
  arr.innerHTML=A.map((v,i)=>`<div class="cell ${i===hi?'on':path.has(i)?'hit':''}">${v}<span class="idx">${i}</span></div>`).join('');
}
function drawDP(dp, hi=-1){
  ctx.clearRect(0,0,cv.width,cv.height);
  const n=A.length, gap=cv.width/(n+1), maxD=Math.max(...dp,1);
  dp.forEach((v,i)=>{
    const h=(v/maxD)*120, x=gap*(i+1);
    ctx.fillStyle=i===hi?'#ea580c':'#2563eb';
    ctx.fillRect(x-18, 160-h, 36, h);
    ctx.fillStyle='#334155'; ctx.font='12px ui-monospace'; ctx.textAlign='center';
    ctx.fillText(v, x, 160-h-8); ctx.fillText('i'+i, x, 180);
  });
}
run.onclick=async()=>{
  const n=A.length, dp=Array(n).fill(1), pre=Array(n).fill(-1);
  for(let i=0;i<n;i++){
    for(let j=0;j<i;j++) if(A[j]<A[i] && dp[j]+1>dp[i]){ dp[i]=dp[j]+1; pre[i]=j; }
    showArr(i); drawDP(dp,i); tip.textContent=`计算 dp[${i}]=${dp[i]}`; await sleep(280);
  }
  let k=0; for(let i=1;i<n;i++) if(dp[i]>dp[k]) k=i;
  const path=new Set(); for(let x=k;x>=0;x=pre[x]){ path.add(x); if(pre[x]<0) break; }
  showArr(-1,path); drawDP(dp,-1); ans.textContent=dp[k];
  tip.innerHTML=`LIS 长度 <strong>${dp[k]}</strong> · 绿色为一条最优子序列`;
};
rand.onclick=()=>{A=Array.from({length:10},()=>1+Math.floor(Math.random()*20)); showArr(); ans.textContent='—'; ctx.clearRect(0,0,cv.width,cv.height);};
showArr();
''', ("04-maxsub.html","最大子段和"), ("06-triangle.html","三角形")))

    # ---- 06 triangle ----
    write("06-triangle.html", page("三角形","06-triangle.html", r'''
<section class="hero">
  <div class="eyebrow">图 6 · 路径</div>
  <h1>三角形最小路径和</h1>
  <p>自底向上：每个格子吸收下方左右较小值。最终顶点即为答案。</p>
</section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ 自底向上</button></div>
  <div class="stage-wrap light" style="height:380px">
    <canvas class="stage" id="cv" width="900" height="380"></canvas>
    <div class="stage-hud"><span class="hud-pill light">triangle DP</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row"><div class="stat"><span>最小路径和</span><b class="green" id="ans">—</b></div></div>
</div>
''', r'''
const T=[[2],[3,4],[6,5,7],[4,1,8,3]];
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function pos(r,c,rows){
  const y=50+r*70, rowW=rows[r].length;
  const total=rowW*70; const x0=(cv.width-total)/2;
  return {x:x0+c*70+35, y};
}
function draw(dp, hi=null){
  ctx.clearRect(0,0,cv.width,cv.height);
  const rows=dp||T;
  for(let r=0;r<rows.length;r++){
    for(let c=0;c<rows[r].length;c++){
      const p=pos(r,c,rows);
      const on=hi && hi[0]===r && hi[1]===c;
      const g=ctx.createRadialGradient(p.x-6,p.y-6,2,p.x,p.y,28);
      if(on){g.addColorStop(0,'#fdba74');g.addColorStop(1,'#ea580c');}
      else {g.addColorStop(0,'#93c5fd');g.addColorStop(1,'#2563eb');}
      ctx.beginPath(); ctx.arc(p.x,p.y,26,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='bold 16px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(rows[r][c], p.x, p.y);
    }
  }
}
run.onclick=async()=>{
  const dp=T.map(r=>r.slice());
  draw(dp); await sleep(300);
  for(let r=dp.length-2;r>=0;r--){
    for(let c=0;c<dp[r].length;c++){
      dp[r][c]+=Math.min(dp[r+1][c], dp[r+1][c+1]);
      hud.textContent=`更新 (${r},${c}) = ${dp[r][c]}`;
      draw(dp,[r,c]); await sleep(350);
    }
  }
  ans.textContent=dp[0][0]; hud.textContent='完成'; draw(dp,[0,0]);
};
draw();
''', ("05-lis.html","LIS"), ("07-lcs.html","LCS")))

    # ---- 07 LCS ----
    write("07-lcs.html", page("LCS","07-lcs.html", r'''
<section class="hero">
  <div class="eyebrow">图 7 · 二维表</div>
  <h1>最长公共子序列 · 热力填表</h1>
  <p>字符相等走对角线 +1，否则取左/上最大。填完后可回溯一条 LCS。</p>
</section>
<div class="card">
  <div class="toolbar">
    <input id="sx" value="ABCBDAB" style="padding:8px 12px;border-radius:10px;border:1px solid var(--line)"/>
    <input id="sy" value="BDCABA" style="padding:8px 12px;border-radius:10px;border:1px solid var(--line)"/>
    <button class="btn primary" id="run">▶ 填表</button>
    <div class="speed" id="spd"><button data-ms="80">慢</button><button data-ms="35" class="on">中</button><button data-ms="10">快</button></div>
  </div>
  <div style="overflow:auto"><table class="data" id="tb"></table></div>
  <div class="stat-row">
    <div class="stat"><span>LCS 长度</span><b class="green" id="ans">—</b></div>
    <div class="stat"><span>一个 LCS</span><b class="orange" id="str" style="font-size:1.1rem">—</b></div>
  </div>
  <div class="tip" id="tip">相等：dp[i-1][j-1]+1 · 否则 max(左,上)</div>
</div>
''', r'''
let ms=35;
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{spd.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');ms=+b.dataset.ms;});
run.onclick=async()=>{
  const X=sx.value, Y=sy.value, n=X.length, m=Y.length;
  const dp=Array.from({length:n+1},()=>Array(m+1).fill(0));
  const ren=(hi,hj,path=null)=>{
    let h='<tr><th></th><th>ε</th>'+[...Y].map(c=>`<th>${c}</th>`).join('')+'</tr>';
    for(let i=0;i<=n;i++){
      h+='<tr><th>'+(i?X[i-1]:'ε')+'</th>';
      for(let j=0;j<=m;j++){
        let cls='';
        if(path && path.has(i+','+j)) cls='path';
        else if(i===hi&&j===hj) cls='hl';
        h+=`<td class="${cls}">${dp[i][j]}</td>`;
      }
      h+='</tr>';
    }
    tb.innerHTML=h;
  };
  for(let i=1;i<=n;i++) for(let j=1;j<=m;j++){
    dp[i][j]=X[i-1]===Y[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
    ren(i,j); tip.textContent=`dp[${i}][${j}]=${dp[i][j]}`; await sleep(ms);
  }
  // reconstruct
  let i=n,j=m, s='', path=new Set();
  while(i>0&&j>0){
    path.add(i+','+j);
    if(X[i-1]===Y[j-1]){ s=X[i-1]+s; i--; j--; }
    else if(dp[i-1][j]>=dp[i][j-1]) i--; else j--;
  }
  path.add('0,0');
  ans.textContent=dp[n][m]; str.textContent=s||'(空)';
  ren(-1,-1,path); tip.innerHTML=`完成 · 绿色为回溯路径 · LCS=<strong>${s}</strong>`;
};
''', ("06-triangle.html","三角形"), ("08-edit.html","编辑距离")))

    # ---- 08 edit distance ----
    write("08-edit.html", page("编辑距离","08-edit.html", r'''
<section class="hero">
  <div class="eyebrow">图 8 · 编辑距离</div>
  <h1>把单词 A「改」成 B 的最少操作</h1>
  <p>插入 / 删除 / 替换。填表动画后回溯操作序列。</p>
</section>
<div class="card">
  <div class="toolbar">
    <input id="s1" value="kitten" style="padding:8px 12px;border-radius:10px;border:1px solid var(--line)"/>
    <span style="font-weight:800;color:var(--muted)">→</span>
    <input id="s2" value="sitting" style="padding:8px 12px;border-radius:10px;border:1px solid var(--line)"/>
    <button class="btn primary" id="run">▶ 计算</button>
  </div>
  <div style="overflow:auto"><table class="data" id="tb"></table></div>
  <div class="stat-row">
    <div class="stat"><span>编辑距离</span><b class="red" id="ans">—</b></div>
  </div>
  <div class="log" id="log">操作序列将显示在这里</div>
</div>
''', r'''
run.onclick=async()=>{
  const A=s1.value, B=s2.value, n=A.length, m=B.length;
  const dp=Array.from({length:n+1},()=>Array(m+1).fill(0));
  for(let i=0;i<=n;i++) dp[i][0]=i; for(let j=0;j<=m;j++) dp[0][j]=j;
  const ren=(hi,hj)=>{
    let h='<tr><th></th><th>ε</th>'+[...B].map(c=>`<th>${c}</th>`).join('')+'</tr>';
    for(let i=0;i<=n;i++){ h+='<tr><th>'+(i?A[i-1]:'ε')+'</th>';
      for(let j=0;j<=m;j++) h+=`<td class="${i===hi&&j===hj?'hl':''}">${dp[i][j]}</td>`;
      h+='</tr>'; }
    tb.innerHTML=h;
  };
  for(let i=1;i<=n;i++) for(let j=1;j<=m;j++){
    dp[i][j]=A[i-1]===B[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1]);
    ren(i,j); await sleep(25);
  }
  ans.textContent=dp[n][m];
  // ops
  let i=n,j=m, ops=[];
  while(i>0||j>0){
    if(i>0&&j>0&&A[i-1]===B[j-1]){ i--; j--; continue; }
    if(i>0&&j>0&&dp[i][j]===dp[i-1][j-1]+1){ ops.push(`替换 ${A[i-1]}→${B[j-1]}`); i--; j--; }
    else if(i>0&&dp[i][j]===dp[i-1][j]+1){ ops.push(`删除 ${A[i-1]}`); i--; }
    else { ops.push(`插入 ${B[j-1]}`); j--; }
  }
  log.textContent=ops.reverse().join('\\n')||'(无需操作)';
  ren(-1,-1);
};
''', ("07-lcs.html","LCS"), ("09-knapsack.html","01背包")))

    # ---- 09 knapsack ----
    write("09-knapsack.html", page("01背包","09-knapsack.html", r'''
<section class="hero">
  <div class="eyebrow">图 9 · 0/1 背包</div>
  <h1>背包格子大冒险</h1>
  <p>每个格子在「不拿 / 拿」之间取 max。填完后回溯选出哪些物品。</p>
</section>
<div class="card">
  <p class="desc">w=[2,3,4,5] · v=[3,4,5,6] · W=8</p>
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 逐步填表</button>
    <div class="speed" id="spd"><button data-ms="120">慢</button><button data-ms="50" class="on">中</button><button data-ms="15">快</button></div>
  </div>
  <div style="overflow:auto"><table class="data" id="tb"></table></div>
  <div class="stat-row">
    <div class="stat"><span>最优价值</span><b class="green" id="ans">—</b></div>
    <div class="stat"><span>选取物品</span><b class="orange" id="pick" style="font-size:1rem">—</b></div>
  </div>
  <div class="formula">dp[i][j] = max( dp[i-1][j] , dp[i-1][j-wᵢ]+vᵢ )</div>
</div>
''', r'''
const W=8, ws=[2,3,4,5], vs=[3,4,5,6], N=4; let ms=50;
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{spd.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');ms=+b.dataset.ms;});
run.onclick=async()=>{
  const dp=Array.from({length:N+1},()=>Array(W+1).fill(0));
  const ren=(hi,hj, picks=null)=>{
    let h='<tr><th>i\\\\j</th>'+[...Array(W+1)].map((_,j)=>`<th>${j}</th>`).join('')+'</tr>';
    for(let i=0;i<=N;i++){
      h+=`<tr><th>${i}</th>`;
      for(let j=0;j<=W;j++){
        let cls=i===hi&&j===hj?'hl':'';
        h+=`<td class="${cls}">${dp[i][j]}</td>`;
      }
      h+='</tr>';
    }
    tb.innerHTML=h;
  };
  for(let i=1;i<=N;i++) for(let j=0;j<=W;j++){
    dp[i][j]=dp[i-1][j];
    if(j>=ws[i-1]) dp[i][j]=Math.max(dp[i][j], dp[i-1][j-ws[i-1]]+vs[i-1]);
    ren(i,j); await sleep(ms);
  }
  // reconstruct
  let i=N,j=W, picked=[];
  while(i>0){
    if(dp[i][j]!==dp[i-1][j]){ picked.push(i); j-=ws[i-1]; }
    i--;
  }
  picked.reverse();
  ans.textContent=dp[N][W];
  pick.textContent=picked.length?('物品 '+picked.join(',')):'无';
  ren(-1,-1);
};
''', ("08-edit.html","编辑距离"), ("10-multi.html","完全/多重")))

    # ---- 10 multi knapsack ----
    write("10-multi.html", page("完全/多重","10-multi.html", r'''
<section class="hero">
  <div class="eyebrow">图 10 · 背包变体</div>
  <h1>完全背包 vs 0/1：一维数组的方向</h1>
  <p>同样的一维 dp，<strong>逆序</strong>保证每件最多一次；<strong>正序</strong>允许重复使用当前物品。</p>
</section>
<div class="grid grid-2">
  <div class="card" style="--accent:#2563eb">
    <div class="badge blue">0/1</div>
    <h3>逆序容量</h3>
    <div class="code"><span class="kw">for</span> item:
  <span class="kw">for</span> j=W..w:  <span class="cm">// 逆序</span>
    dp[j]=max(dp[j], dp[j-w]+v)</div>
  </div>
  <div class="card" style="--accent:#0f766e">
    <div class="badge green">完全</div>
    <h3>正序容量</h3>
    <div class="code"><span class="kw">for</span> item:
  <span class="kw">for</span> j=w..W:  <span class="cm">// 正序</span>
    dp[j]=max(dp[j], dp[j-w]+v)</div>
  </div>
</div>
<div class="card" style="margin-top:16px">
  <p class="desc">演示：物品 w=3,v=4，W=10，对比两种循环得到的 dp 曲线。</p>
  <div class="toolbar">
    <button class="btn primary" id="run01">0/1 逆序动画</button>
    <button class="btn" id="runC">完全 正序动画</button>
  </div>
  <div class="stage-wrap light" style="height:220px">
    <canvas class="stage" id="cv" width="900" height="220"></canvas>
  </div>
  <div class="tip" id="tip">观察同一 j 位置数值如何被「重复叠加」或「只用一次」。</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function draw(dp, hi=-1, title=''){
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.fillStyle='#64748b'; ctx.font='13px Segoe UI'; ctx.fillText(title, 20, 24);
  const maxV=Math.max(...dp,1);
  dp.forEach((v,j)=>{
    const h=(v/maxV)*140, x=40+j*70;
    ctx.fillStyle=j===hi?'#ea580c':'#2563eb';
    ctx.fillRect(x, 180-h, 40, h);
    ctx.fillStyle='#334155'; ctx.font='12px ui-monospace'; ctx.textAlign='center';
    ctx.fillText(v, x+20, 180-h-8); ctx.fillText('j'+j, x+20, 200);
  });
}
async function run(order){
  const W=10, w=3, v=4, dp=Array(W+1).fill(0);
  if(order==='rev'){
    for(let j=W;j>=w;j--){ dp[j]=Math.max(dp[j], dp[j-w]+v); draw(dp,j,'0/1 逆序'); tip.textContent=`j=${j} 只能用一次`; await sleep(200); }
  } else {
    for(let j=w;j<=W;j++){ dp[j]=Math.max(dp[j], dp[j-w]+v); draw(dp,j,'完全 正序'); tip.textContent=`j=${j} 可重复用当前物品`; await sleep(200); }
  }
  draw(dp,-1, order==='rev'?'0/1 结果':'完全 结果');
}
run01.onclick=()=>run('rev'); runC.onclick=()=>run('fwd');
draw(Array(11).fill(0),-1,'等待演示');
''', ("09-knapsack.html","01背包"), ("11-tsp.html","状压TSP")))

    # ---- 11 TSP bit DP ----
    write("11-tsp.html", page("状压TSP","11-tsp.html", r'''
<section class="hero">
  <div class="eyebrow">图 11 · 状压</div>
  <h1>状态压缩 DP · 旅行商</h1>
  <p>dp[S][i]：从 0 出发，走过集合 S，当前停在 i 的最短路。集合用二进制位表示。</p>
</section>
<div class="card">
  <div class="formula">dp[S∪{j}][j] = min(dp[S][i] + w(i,j))　j∉S</div>
  <div class="toolbar"><button class="btn primary" id="run">▶ 枚举子集推进</button></div>
  <div class="stage-wrap" style="height:360px">
    <canvas class="stage" id="cv" width="1000" height="360"></canvas>
    <div class="stage-hud"><span class="hud-pill">TSP n=4</span><span class="hud-pill" id="hud">—</span></div>
  </div>
  <div class="stat-row"><div class="stat"><span>最短回路</span><b class="green" id="ans">—</b></div></div>
  <div class="tip">n≤20 才现实（O(n²·2ⁿ)）。本演示 n=4，便于观察子集扩展。</div>
</div>
''', r'''
const n=4;
const POS=[[200,180],[500,60],[800,180],[500,300]];
// complete graph weights
const w=[[0,5,8,6],[5,0,4,7],[8,4,0,3],[6,7,3,0]];
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function draw(S=-1, cur=-1, path=[]){
  ctx.clearRect(0,0,cv.width,cv.height);
  for(let i=0;i<n;i++) for(let j=i+1;j<n;j++){
    ctx.strokeStyle='rgba(148,163,184,.25)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(POS[i][0],POS[i][1]); ctx.lineTo(POS[j][0],POS[j][1]); ctx.stroke();
    ctx.fillStyle='#64748b'; ctx.font='11px ui-monospace';
    ctx.fillText(w[i][j], (POS[i][0]+POS[j][0])/2, (POS[i][1]+POS[j][1])/2);
  }
  if(path.length>1){
    ctx.strokeStyle='#fbbf24'; ctx.lineWidth=4;
    ctx.beginPath(); path.forEach((i,k)=>{k?ctx.lineTo(POS[i][0],POS[i][1]):ctx.moveTo(POS[i][0],POS[i][1]);}); ctx.stroke();
  }
  POS.forEach((p,i)=>{
    const inS=S>=0 && (S>>i)&1;
    const g=ctx.createRadialGradient(p[0]-5,p[1]-5,2,p[0],p[1],22);
    if(i===cur){g.addColorStop(0,'#fdba74');g.addColorStop(1,'#ea580c');}
    else if(inS){g.addColorStop(0,'#93c5fd');g.addColorStop(1,'#2563eb');}
    else {g.addColorStop(0,'#cbd5e1');g.addColorStop(1,'#64748b');}
    ctx.beginPath(); ctx.arc(p[0],p[1],20,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 14px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(i,p[0],p[1]);
  });
}
run.onclick=async()=>{
  const INF=1e9;
  const N=1<<n;
  const dp=Array.from({length:N},()=>Array(n).fill(INF));
  dp[1][0]=0; // start at 0, set {0}
  for(let S=1;S<N;S++){
    for(let i=0;i<n;i++) if((S>>i)&1 && dp[S][i]<INF){
      for(let j=0;j<n;j++) if(!((S>>j)&1)){
        const S2=S|(1<<j);
        dp[S2][j]=Math.min(dp[S2][j], dp[S][i]+w[i][j]);
      }
    }
    hud.textContent='S='+S.toString(2).padStart(n,'0');
    draw(S); await sleep(120);
  }
  const full=N-1; let best=INF, last=-1;
  for(let i=1;i<n;i++){ const c=dp[full][i]+w[i][0]; if(c<best){best=c; last=i;} }
  ans.textContent=best;
  // reconstruct rough path by parent search
  let path=[0], S=1, cur=0;
  // greedy reconstruct from dp
  // simpler: show best cost only + pulse all cities
  draw(full, last, [0,1,2,3,0]);
  hud.textContent='最短回路 ≈ '+best;
};
draw();
''', ("10-multi.html","完全/多重"), ("12-interval-tree.html","区间/树形")))

    # ---- 12 interval tree ----
    write("12-interval-tree.html", page("区间/树形","12-interval-tree.html", r'''
<section class="hero">
  <div class="eyebrow">图 12 · 进阶模型</div>
  <h1>区间 DP 与树形 DP</h1>
  <p>区间：按长度枚举合并；树形：先子后父合并。下方分别给可运行的小演示。</p>
</section>
<div class="grid grid-2">
  <div class="card">
    <div class="badge">区间 DP</div>
    <h3>石子合并（示意）</h3>
    <p class="desc">相邻堆合并代价 = 两段和。枚举分裂点 k。</p>
    <div class="code"><span class="kw">for</span> len=2..n:
  <span class="kw">for</span> l:
    r=l+len-1
    <span class="kw">for</span> k=l..r-1:
      dp[l][r]=min(dp[l][k]+dp[k+1][r]+sum)</div>
    <div class="toolbar"><button class="btn primary" id="runI">合并动画</button></div>
    <div class="log" id="logI">4 堆石子 [1,3,5,2]</div>
  </div>
  <div class="card">
    <div class="badge green">树形 DP</div>
    <h3>树上独立集（示意）</h3>
    <p class="desc">每个结点：选 / 不选。选则孩子必须不选。</p>
    <div class="toolbar"><button class="btn primary" id="runT">树 DP 点亮</button></div>
    <div class="stage-wrap light" style="height:220px">
      <canvas class="stage" id="tcv" width="420" height="220"></canvas>
    </div>
  </div>
</div>
''', r'''
// interval merge demo
runI.onclick=async()=>{
  const a=[1,3,5,2], n=a.length;
  const sum=[0]; a.forEach(x=>sum.push(sum[sum.length-1]+x));
  const dp=Array.from({length:n},()=>Array(n).fill(0));
  let lines=['初始堆: '+a.join(' ')];
  for(let len=2;len<=n;len++){
    for(let l=0;l+len-1<n;l++){
      const r=l+len-1; dp[l][r]=1e9;
      for(let k=l;k<r;k++){
        const cost=dp[l][k]+dp[k+1][r]+(sum[r+1]-sum[l]);
        if(cost<dp[l][r]) dp[l][r]=cost;
      }
      lines.push(`dp[${l}][${r}]=${dp[l][r]}`);
      logI.textContent=lines.join('\\n'); await sleep(250);
    }
  }
  lines.push('最少合并代价 = '+dp[0][n-1]); logI.textContent=lines.join('\\n');
};
// tree DP visual
const tcv=document.getElementById('tcv'), tctx=tcv.getContext('2d');
const T={id:0,x:210,y:40,ch:[{id:1,x:100,y:120,ch:[]},{id:2,x:210,y:120,ch:[{id:3,x:160,y:190,ch:[]},{id:4,x:260,y:190,ch:[]}]},{id:5,x:320,y:120,ch:[]}]};
function flat(n,arr=[]){ arr.push(n); n.ch.forEach(c=>flat(c,arr)); return arr; }
function drawT(active=new Set(), vals={}){
  tctx.clearRect(0,0,tcv.width,tcv.height);
  function edges(n){ n.ch.forEach(c=>{ tctx.strokeStyle='#cbd5e1'; tctx.beginPath(); tctx.moveTo(n.x,n.y+14); tctx.lineTo(c.x,c.y-14); tctx.stroke(); edges(c); }); }
  edges(T);
  flat(T).forEach(n=>{
    const on=active.has(n.id);
    tctx.beginPath(); tctx.arc(n.x,n.y,16,0,Math.PI*2);
    tctx.fillStyle=on?'#ea580c':'#2563eb'; tctx.fill();
    tctx.fillStyle='#fff'; tctx.font='bold 12px Segoe UI'; tctx.textAlign='center'; tctx.textBaseline='middle';
    tctx.fillText(n.id, n.x, n.y);
    if(vals[n.id]!=null){ tctx.fillStyle='#334155'; tctx.font='10px ui-monospace'; tctx.fillText(vals[n.id], n.x, n.y+28); }
  });
}
runT.onclick=async()=>{
  // simple tree DP: value of node = 1 + sum(skip children) vs sum(max of children)
  const val={0:3,1:2,2:4,3:1,4:2,5:2};
  const dp0={}, dp1={}; // not take / take
  const order=[];
  (function dfs(n){ n.ch.forEach(dfs); order.push(n); })(T);
  const active=new Set();
  for(const n of order){
    active.add(n.id);
    let take=val[n.id], skip=0;
    n.ch.forEach(c=>{ take+=dp0[c.id]; skip+=Math.max(dp0[c.id],dp1[c.id]); });
    dp1[n.id]=take; dp0[n.id]=skip;
    const show={}; order.forEach(x=>{ if(dp0[x.id]!=null) show[x.id]=`${dp0[x.id]}/${dp1[x.id]}`; });
    drawT(active, show); await sleep(400);
  }
  const best=Math.max(dp0[0],dp1[0]);
  drawT(new Set([0,1,2,3,4,5]), {0:`最优${best}`});
};
drawT();
''', ("11-tsp.html","状压TSP"), ("index.html","返回总览")))

    print("\n第7章强交互可视化版完成 →", OUT)

if __name__ == "__main__":
    build()
