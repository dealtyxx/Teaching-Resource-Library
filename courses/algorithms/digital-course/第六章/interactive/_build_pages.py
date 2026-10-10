# -*- coding: utf-8 -*-
"""
第6章 分支限界法 · 强交互 / 强可视化版
纯 Canvas + CSS 3D，离线可用，适合课堂大屏
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
  --amber:#d97706; --violet:#6d28d9; --cyan:#0891b2;
  --shadow:0 8px 28px rgba(37,99,235,.12); --shadow2:0 22px 50px rgba(37,99,235,.18);
  --r:22px; --rs:14px;
  --font:"Segoe UI","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  --mono:ui-monospace,"Cascadia Code",Consolas,monospace;
  --ease:cubic-bezier(.22,1,.36,1);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{
  font-family:var(--font);color:var(--text);min-height:100vh;overflow-x:hidden;
  background:
    radial-gradient(1100px 560px at 5% -8%,rgba(37,99,235,.16),transparent 55%),
    radial-gradient(900px 480px at 95% 0%,rgba(220,38,38,.09),transparent 50%),
    radial-gradient(700px 400px at 50% 110%,rgba(8,145,178,.07),transparent 45%),
    linear-gradient(180deg,#f7f9fd,#eef3fb 50%,#e8eef8);
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;text-decoration:none}
button,input{font:inherit}
.fx-bg{position:fixed;inset:0;pointer-events:none;z-index:0}
.fx-bg canvas{width:100%;height:100%;display:block;opacity:.55}
.nav,.wrap{position:relative;z-index:1}

.nav{
  position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  padding:11px 18px;background:rgba(255,255,255,.86);backdrop-filter:blur(18px) saturate(1.35);
  border-bottom:1px solid var(--line);box-shadow:0 8px 24px rgba(15,23,42,.05);
}
.nav .brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:14px}
.nav .logo{
  width:34px;height:34px;border-radius:11px;display:grid;place-items:center;
  background:linear-gradient(135deg,#3b82f6,#7c3aed 55%,#dc2626);color:#fff;
  font:800 11px var(--mono);box-shadow:0 6px 16px rgba(37,99,235,.4);
  transform:perspective(200px) rotateY(-8deg);transition:transform .3s var(--ease);
}
.nav .brand:hover .logo{transform:perspective(200px) rotateY(8deg) scale(1.05)}
.nav .brand span{color:var(--blue)}
.nav .links{display:flex;gap:5px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end;max-width:min(100%,860px)}
.nav a.pill{font-size:11.5px;font-weight:700;padding:6px 11px;border-radius:999px;color:var(--muted);border:1px solid transparent;transition:.2s var(--ease)}
.nav a.pill:hover{color:var(--blue);background:var(--blueS);border-color:var(--line)}
.nav a.pill.active{color:#fff;background:linear-gradient(135deg,#3b82f6,var(--blue2));box-shadow:0 4px 14px rgba(37,99,235,.35)}

.wrap{max-width:1160px;margin:0 auto;padding:26px 16px 70px}
.hero{margin-bottom:24px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;color:var(--blue);
  letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:999px;background:var(--blueS);border:1px solid var(--line);margin-bottom:12px}
.hero h1{font-size:clamp(1.6rem,3.4vw,2.45rem);line-height:1.15;font-weight:900;letter-spacing:-.025em;margin-bottom:12px;
  background:linear-gradient(120deg,#0b1220,#1e3a8a 35%,#2563eb 65%,#dc2626);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{color:var(--muted);font-size:1.04rem;max-width:760px;line-height:1.7}
.hero-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:12.5px;font-weight:700;
  background:#fff;border:1px solid var(--line);color:var(--muted);box-shadow:0 2px 8px rgba(15,23,42,.04)}
.chip.blue{background:var(--blueS);color:var(--blue);border-color:rgba(37,99,235,.22)}
.chip.green{background:var(--greenS);color:var(--green)}
.chip.red{background:var(--redS);color:var(--red)}

.grid{display:grid;gap:16px}
.grid-2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.grid-3{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px;box-shadow:var(--shadow);
  position:relative;overflow:hidden;transition:transform .28s var(--ease),box-shadow .28s,border-color .28s}
.card:hover{transform:translateY(-3px);box-shadow:var(--shadow2);border-color:var(--line2)}
.card::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--accent,linear-gradient(90deg,var(--blue),var(--violet)))}
.card h3{font-size:1.08rem;font-weight:800;margin-bottom:8px}
.card p,.desc{color:var(--muted);line-height:1.65;font-size:.94rem}
.badge{display:inline-flex;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;margin-bottom:10px;
  background:var(--blueS);color:var(--blue);border:1px solid rgba(37,99,235,.18)}
.badge.red{background:var(--redS);color:var(--red)}
.badge.green{background:var(--greenS);color:var(--green)}
.badge.amber{background:rgba(217,119,6,.1);color:var(--amber)}

a.feature-card{display:flex;flex-direction:column;min-height:170px;padding:18px;border-radius:var(--r);
  background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);position:relative;overflow:hidden;
  transition:transform .3s var(--ease),box-shadow .3s;transform-style:preserve-3d}
a.feature-card::after{content:attr(data-ico);position:absolute;right:12px;top:10px;font-size:42px;opacity:.14;
  transition:transform .35s var(--ease),opacity .35s;filter:drop-shadow(0 8px 10px rgba(0,0,0,.1))}
a.feature-card:hover{transform:translateY(-8px) rotateX(2deg) scale(1.015);box-shadow:var(--shadow2);
  border-color:color-mix(in srgb,var(--c,#2563eb) 40%,transparent)}
a.feature-card:hover::after{opacity:.28;transform:scale(1.15) rotate(8deg) translateZ(20px)}
a.feature-card .num{font:800 12px var(--mono);color:var(--c,#2563eb);letter-spacing:.06em;margin-bottom:8px}
a.feature-card h3{font-size:1.1rem;margin-bottom:6px}
a.feature-card p{color:var(--muted);font-size:.88rem;line-height:1.55;flex:1}
a.feature-card .go{margin-top:12px;font-size:12.5px;font-weight:800;color:var(--c,#2563eb);
  opacity:0;transform:translateX(-8px);transition:.25s var(--ease)}
a.feature-card:hover .go{opacity:1;transform:none}

.btn{appearance:none;border:1px solid var(--line);background:var(--s2);color:var(--text);
  padding:10px 16px;border-radius:13px;cursor:pointer;font-weight:800;font-size:13.5px;
  transition:.2s var(--ease);display:inline-flex;align-items:center;gap:6px;box-shadow:0 1px 2px rgba(15,23,42,.05)}
.btn:hover{border-color:var(--line2);background:#fff;color:var(--blue);transform:translateY(-1px);box-shadow:0 8px 18px rgba(37,99,235,.14)}
.btn:active{transform:scale(.98)}
.btn.primary{background:linear-gradient(135deg,#3b82f6,var(--blue2));border:none;color:#fff;box-shadow:0 8px 20px rgba(37,99,235,.35)}
.btn.primary:hover{filter:brightness(1.06);color:#fff}
.btn.ghost{background:transparent}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important}
.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0}
.toolbar label{font-size:12.5px;color:var(--muted);font-weight:700}
input[type=range]{width:140px;accent-color:var(--blue);cursor:pointer}
.kbd{font:700 12px var(--mono);background:var(--s3);border:1px solid var(--line);border-radius:8px;padding:3px 8px;color:var(--blue2);min-width:1.8rem;text-align:center}
.speed{display:flex;gap:4px;background:var(--s2);padding:3px;border-radius:11px;border:1px solid var(--line)}
.speed button{border:none;background:transparent;padding:6px 11px;border-radius:8px;font-size:12px;font-weight:800;color:var(--muted);cursor:pointer}
.speed button.on{background:#fff;color:var(--blue);box-shadow:0 1px 4px rgba(15,23,42,.08)}

.tip{margin-top:12px;padding:13px 15px;border-radius:15px;background:linear-gradient(135deg,var(--blueS),rgba(109,40,217,.04));
  border:1px solid var(--line);color:var(--muted);font-size:13.5px;line-height:1.65}
.tip strong{color:var(--text)}
.tip.ok{background:var(--greenS);border-color:rgba(15,118,110,.22)}
.tip.danger{background:var(--redS);border-color:rgba(220,38,38,.2)}
.tip.warn{background:rgba(217,119,6,.1);border-color:rgba(217,119,6,.22)}
.formula{font-family:var(--mono);background:linear-gradient(135deg,#f0fdf9,#eff6ff);border:1px solid rgba(15,118,110,.22);
  border-radius:16px;padding:16px 18px;margin-top:10px;color:var(--green);font-size:15px;line-height:1.55;text-align:center;font-weight:750}
.formula.lg{font-size:clamp(1.15rem,2.6vw,1.55rem);padding:20px}
.code{font-family:var(--mono);font-size:12.5px;line-height:1.7;background:#0f172a;color:#e2e8f0;border-radius:16px;
  padding:15px 16px;overflow:auto;white-space:pre;margin-top:10px;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
.code .cm{color:#64748b}.code .kw{color:#c4b5fd}.code .fn{color:#93c5fd}
.stat-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.stat{flex:1;min-width:104px;background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px;transition:transform .2s}
.stat:hover{transform:translateY(-2px)}
.stat span{font-size:11.5px;color:var(--faint);font-weight:700;letter-spacing:.03em}
.stat b{display:block;font-size:1.35rem;margin-top:4px;font-weight:900;font-variant-numeric:tabular-nums}
.stat b.blue{color:var(--blue)}.stat b.green{color:var(--green)}.stat b.red{color:var(--red)}
.list-step{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;margin:8px 0;border-radius:14px;border:1px solid var(--line);background:#fff}
.list-step .n{flex-shrink:0;width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,var(--blue),var(--violet));color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900}
.list-step .body{flex:1;font-size:.92rem;color:var(--muted);line-height:1.55}
.list-step .body b{color:var(--text)}
table.data{width:100%;border-collapse:separate;border-spacing:0;font-size:13.5px;margin-top:8px;overflow:hidden;border-radius:14px;border:1px solid var(--line)}
table.data th,table.data td{padding:11px 14px;text-align:left;border-bottom:1px solid var(--line)}
table.data th{background:var(--s3);color:var(--muted);font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
table.data tr:last-child td{border-bottom:none}
table.data tr:hover td{background:var(--blueS)}
table.data td.hl{background:rgba(37,99,235,.08);font-weight:800;color:var(--blue2)}

.stage-wrap{position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow);background:#0b1220}
.stage-wrap.light{background:
  linear-gradient(rgba(37,99,235,.045) 1px,transparent 1px),
  linear-gradient(90deg,rgba(37,99,235,.045) 1px,transparent 1px),#f8fafc;
  background-size:22px 22px,22px 22px,auto}
canvas.stage{width:100%;display:block;touch-action:none}
.stage-hud{position:absolute;left:12px;top:12px;right:12px;display:flex;justify-content:space-between;gap:8px;pointer-events:none;flex-wrap:wrap}
.hud-pill{pointer-events:none;padding:6px 11px;border-radius:999px;background:rgba(15,23,42,.72);color:#e2e8f0;
  font:700 12px var(--mono);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1)}
.hud-pill.light{background:rgba(255,255,255,.9);color:var(--text);border-color:var(--line)}

.legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;font-size:12.5px;color:var(--muted);font-weight:700}
.legend i{display:inline-block;width:11px;height:11px;border-radius:4px;margin-right:5px;vertical-align:middle}
.log{max-height:180px;overflow:auto;font:12px/1.65 var(--mono);color:var(--muted);background:var(--s2);
  border:1px solid var(--line);border-radius:15px;padding:12px 14px;margin-top:10px}
.board{display:inline-grid;gap:6px;padding:10px;background:linear-gradient(145deg,#e2e8f0,#f8fafc);border-radius:18px;border:1px solid var(--line);
  box-shadow:inset 0 1px 0 #fff,0 10px 24px rgba(15,23,42,.08);perspective:800px}
.sq{width:58px;height:58px;display:grid;place-items:center;font-size:22px;font-weight:900;border-radius:14px;
  transition:transform .28s var(--ease),box-shadow .28s;transform-style:preserve-3d}
.sq.tile{background:linear-gradient(145deg,#fff,#e8eef8);color:var(--text);
  box-shadow:0 6px 0 #cbd5e1,0 10px 18px rgba(15,23,42,.12);border:1px solid rgba(255,255,255,.8)}
.sq.tile:hover{transform:translateY(-3px) rotateX(8deg)}
.sq.empty{background:rgba(15,23,42,.06);box-shadow:inset 0 2px 8px rgba(15,23,42,.08)}
.sq.move{animation:pop .35s var(--ease)}
@keyframes pop{0%{transform:scale(.92) rotateX(12deg)}60%{transform:scale(1.06)}100%{transform:scale(1)}}

/* 3D flip compare */
.flip3d{perspective:1200px}
.flip-card3d{position:relative;min-height:220px;transform-style:preserve-3d;transition:transform .7s var(--ease);cursor:pointer}
.flip-card3d.flipped{transform:rotateY(180deg)}
.flip-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:var(--r);padding:18px;
  background:#fff;border:1px solid var(--line);box-shadow:var(--shadow);display:flex;flex-direction:column}
.flip-face.back{transform:rotateY(180deg);background:linear-gradient(160deg,#eff6ff,#fdf2f8)}
.flip-hint{margin-top:auto;font-size:12px;font-weight:800;color:var(--blue)}

.compare{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:stretch}
@media(max-width:760px){.compare{grid-template-columns:1fr}.compare .vs{display:none}}
.compare .vs{display:grid;place-items:center;font-weight:900;color:var(--faint);letter-spacing:.1em}

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
.pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 0 rgba(15,118,110,.45);animation:pulse 1.6s infinite;display:inline-block}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(15,118,110,.45)}70%{box-shadow:0 0 0 10px transparent}}
.bar-track{height:14px;border-radius:99px;background:var(--s3);overflow:hidden;border:1px solid var(--line);flex:1;box-shadow:inset 0 1px 2px rgba(15,23,42,.06)}
.bar-fill{height:100%;border-radius:99px;transition:width .45s var(--ease);min-width:2px;position:relative}
.bar-fill::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.35),transparent 55%)}
.scene3d{perspective:900px;display:grid;place-items:center;min-height:280px}
.iso-platform{transform:rotateX(58deg) rotateZ(-32deg);transform-style:preserve-3d;transition:transform .5s var(--ease)}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
"""

# Shared particle background + utilities injected on every page
COMMON_JS = r"""
// ambient particles
(function(){
  const host=document.querySelector('.fx-bg'); if(!host) return;
  const cv=document.createElement('canvas'); host.appendChild(cv);
  const ctx=cv.getContext('2d'); let w,h,parts=[],raf;
  function resize(){ w=cv.width=innerWidth*devicePixelRatio; h=cv.height=innerHeight*devicePixelRatio;
    cv.style.width=innerWidth+'px'; cv.style.height=innerHeight+'px'; ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    parts=Array.from({length:36},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:1+Math.random()*2.2, vx:(Math.random()-.5)*.25, vy:-.15-Math.random()*.35, a:.15+Math.random()*.35}));
  }
  function tick(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; if(p.y<-10){p.y=innerHeight+10;p.x=Math.random()*innerWidth;}
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(37,99,235,${p.a})`; ctx.fill();
    });
    raf=requestAnimationFrame(tick);
  }
  addEventListener('resize',resize); resize(); tick();
})();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
"""

LINKS = [
    ("index.html", "总览"),
    ("01-overview.html", "概述对比"),
    ("02-bound.html", "限界函数"),
    ("03-framework.html", "两种框架"),
    ("04-bfs.html", "广度优先"),
    ("05-sssp.html", "3D迷宫"),
    ("06-knapsack.html", "背包树"),
    ("07-assign-tsp.html", "TSP巡游"),
    ("08-astar.html", "A* 可视"),
    ("09-8puzzle.html", "八数码3D"),
]
CH = "第6章 分支限界法"

def nav(active):
    pills="".join(f'<a class="{"pill active" if h==active else "pill"}" href="{h}">{lab}</a>' for h,lab in LINKS)
    return f'''<div class="fx-bg" aria-hidden="true"></div>
<nav class="nav"><div class="brand"><div class="logo">06</div>算法可视化 · <span>{CH}</span></div>
<div class="links">{pills}</div></nav>'''

def page_nav(prev=None, nxt=None):
    left = f'<a href="{prev[0]}"><span class="dir">← 上一节</span><span class="name">{prev[1]}</span></a>' if prev else '<div></div>'
    right = f'<a href="{nxt[0]}" style="text-align:right"><span class="dir">下一节 →</span><span class="name">{nxt[1]}</span></a>' if nxt else '<div></div>'
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
<div class="footer">算法设计与分析 · <b>{CH}</b> · 强交互可视化版<br/>Canvas / CSS 3D · 建议全屏投影</div>
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

    # ---- INDEX ----
    cards = "".join(f'''
<a class="feature-card" href="{h}" style="--c:{c}" data-ico="{ico}">
  <div class="num">图 {n}</div><h3>{t}</h3><p>{d}</p><div class="go">进入沉浸演示 →</div>
</a>''' for h,n,t,d,c,ico in [
        ("01-overview.html","01","概述与对比","3D 翻转卡片 · 回溯 vs 分支限界","#2563eb","⚖️"),
        ("02-bound.html","02","限界函数实验室","立体仪表盘 · 剪支瞬间高亮","#dc2626","✂️"),
        ("03-framework.html","03","两种框架","队列流水线动画可视化","#1d4ed8","📋"),
        ("04-bfs.html","04","广度优先","粒子波前 · 图上扩散","#b91c1c","🌊"),
        ("05-sssp.html","05","3D 等距迷宫","立体墙体 · 波前爬升","#3b82f6","🗺️"),
        ("06-knapsack.html","06","背包搜索树","动态生长的决策树","#ef4444","🌳"),
        ("07-assign-tsp.html","07","TSP 城市巡游","路径动画 · 限界示意","#1e40af","🧳"),
        ("08-astar.html","08","A* 可视化","f=g+h 三角权衡 · 网格热力","#e11d48","⭐"),
        ("09-8puzzle.html","09","八数码 3D","立体滑块 · A* 回放","#7c3aed","🧩"),
    ])
    write("index.html", page("强交互总览","index.html", f'''
<section class="hero">
  <div class="eyebrow"><span class="pulse-dot"></span> Immersive Lab · Chapter 6</div>
  <h1>分支限界法 · 沉浸式交互实验室</h1>
  <p>不只是说明文字——用<strong>粒子波前、等距 3D 迷宫、生长决策树、立体滑块</strong>把「BFS + 限界剪支」变成看得见的过程。</p>
  <div class="hero-meta">
    <span class="chip blue">🎨 Canvas 动效</span>
    <span class="chip green">🧊 CSS / 等距 3D</span>
    <span class="chip red">🎮 可点可拖可调速</span>
  </div>
</section>
<div class="card" style="--accent:linear-gradient(90deg,#2563eb,#7c3aed,#dc2626);margin-bottom:18px">
  <div class="formula lg">分支限界 ＝ 广度（或优先）搜索 ＋ 限界剪支</div>
  <div class="stage-wrap" style="margin-top:14px;height:160px">
    <canvas class="stage" id="heroCv" width="1100" height="160"></canvas>
    <div class="stage-hud"><span class="hud-pill">LIVE · 解空间搜索示意</span><span class="hud-pill">自动循环</span></div>
  </div>
</div>
<div class="grid grid-2 stagger">{cards}</div>
''', r'''
// hero animated tree search
const cv=heroCv, ctx=cv.getContext('2d');
const nodes=[];
function layout(d=0,x=550,y=24,gap=160,id=0,parent=null){
  const me={id,x,y,d,parent,L:null,R:null,state:0}; nodes.push(me);
  if(d<3){ me.L=layout(d+1,x-gap,y+42,gap*.55,nodes.length,id); me.R=layout(d+1,x+gap,y+42,gap*.55,nodes.length,id); }
  return me.id;
}
layout();
let t=0, order=[], oi=0;
(function dfs(i){ order.push(i); const n=nodes[i]; if(n.L!=null)dfs(n.L); if(n.R!=null)dfs(n.R); })(0);
function draw(){
  const W=cv.width,H=cv.height; ctx.clearRect(0,0,W,H);
  // links
  ctx.lineWidth=2;
  nodes.forEach(n=>{
    [n.L,n.R].forEach(c=>{
      if(c==null) return; const ch=nodes[c];
      ctx.strokeStyle='rgba(148,163,184,.35)';
      ctx.beginPath(); ctx.moveTo(n.x,n.y+10); ctx.lineTo(ch.x,ch.y-10); ctx.stroke();
    });
  });
  nodes.forEach(n=>{
    const active=n.id===order[oi%order.length];
    const g=ctx.createRadialGradient(n.x-4,n.y-4,2,n.x,n.y,14);
    if(active){ g.addColorStop(0,'#fca5a5'); g.addColorStop(1,'#dc2626'); }
    else if(n.d===0){ g.addColorStop(0,'#93c5fd'); g.addColorStop(1,'#2563eb'); }
    else if(n.L==null){ g.addColorStop(0,'#6ee7b7'); g.addColorStop(1,'#0f766e'); }
    else { g.addColorStop(0,'#bfdbfe'); g.addColorStop(1,'#3b82f6'); }
    ctx.beginPath(); ctx.arc(n.x,n.y, active?13:11,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    if(active){ ctx.strokeStyle='rgba(220,38,38,.35)'; ctx.lineWidth=8; ctx.stroke(); }
  });
}
setInterval(()=>{ oi++; draw(); }, 420); draw();
''', None, ("01-overview.html","概述对比")))

    # ---- 01 ----
    write("01-overview.html", page("概述对比","01-overview.html", r'''
<section class="hero">
  <div class="eyebrow">图 1 · 概念对比</div>
  <h1>回溯 vs 分支限界 · 3D 翻转记忆</h1>
  <p>点击卡片翻转背面要点。同一张解空间树，策略不同，擅长的题完全不同。</p>
</section>
<div class="grid grid-2 stagger flip3d">
  <div class="flip-card3d" id="f1">
    <div class="flip-face" style="--accent:#2563eb">
      <div class="badge">Backtracking</div>
      <h3 style="font-size:1.35rem;margin:8px 0">回溯法</h3>
      <p class="desc">深度优先 · 隐式栈 · 适合全部解 / 任一可行解</p>
      <div class="formula">DFS ＋ 剪支</div>
      <div class="flip-hint">点击翻转 ↻</div>
    </div>
    <div class="flip-face back">
      <h3>何时用？</h3>
      <div class="list-step"><div class="n">1</div><div class="body">要枚举<strong>所有</strong>方案</div></div>
      <div class="list-step"><div class="n">2</div><div class="body">空间敏感，深度远小于宽度</div></div>
      <div class="list-step"><div class="n">3</div><div class="body">例：全部路径、全排列、N 皇后所有解</div></div>
      <div class="flip-hint">再点翻回</div>
    </div>
  </div>
  <div class="flip-card3d" id="f2">
    <div class="flip-face" style="--accent:#dc2626">
      <div class="badge red">Branch & Bound</div>
      <h3 style="font-size:1.35rem;margin:8px 0">分支限界</h3>
      <p class="desc">广度 / 最优优先 · 队列 · 适合最优解</p>
      <div class="formula">BFS ＋ 限界剪支</div>
      <div class="flip-hint">点击翻转 ↻</div>
    </div>
    <div class="flip-face back">
      <h3>何时用？</h3>
      <div class="list-step"><div class="n">1</div><div class="body">要<strong>最优</strong>（最短 / 最大价值）</div></div>
      <div class="list-step"><div class="n">2</div><div class="body">可用 ub/lb 估计剪掉整支</div></div>
      <div class="list-step"><div class="n">3</div><div class="body">例：最短迷宫、0/1 背包最优、TSP</div></div>
      <div class="flip-hint">再点翻回</div>
    </div>
  </div>
</div>
<div class="card" style="margin-top:16px">
  <h3>对照表</h3>
  <table class="data">
    <thead><tr><th>维度</th><th>回溯</th><th>分支限界</th></tr></thead>
    <tbody>
      <tr><td>搜索</td><td>DFS</td><td class="hl">BFS / Best-first</td></tr>
      <tr><td>活结点表</td><td>系统栈</td><td class="hl">队列 / 优先队列</td></tr>
      <tr><td>目标</td><td>全解 / 可行解</td><td class="hl">最优解</td></tr>
      <tr><td>迷宫</td><td>所有出路</td><td class="hl">最短出路</td></tr>
    </tbody>
  </table>
  <div class="tip"><strong>金句：</strong>不含限界剪支的 BFS，只是遍历；有了 ub/lb 才是完整的分支限界。</div>
</div>
''', r'''
[f1,f2].forEach(el=>el.onclick=()=>el.classList.toggle('flipped'));
''', ("index.html","总览"), ("02-bound.html","限界函数")))

    # ---- 02 bound with canvas gauge ----
    write("02-bound.html", page("限界函数","02-bound.html", r'''
<section class="hero">
  <div class="eyebrow">图 2 · 限界实验室</div>
  <h1>看见剪支发生的瞬间</h1>
  <p>下方是<strong>立体仪表盘</strong>：ub 指针扫过「已知最优」红线时触发剪支特效。</p>
</section>
<div class="grid grid-2">
  <div class="card" style="--accent:#2563eb"><div class="badge">最大化</div><h3>上界 ub 不增</h3>
    <p class="desc">若 ub ≤ maxV → 剪。本实验采用：ub = 已选 + 乐观剩余。</p></div>
  <div class="card" style="--accent:#dc2626"><div class="badge red">最小化</div><h3>下界 lb 不减</h3>
    <p class="desc">若 lb ≥ minV → 剪。与最大化对称。</p></div>
</div>
<div class="card" style="margin-top:16px;--accent:linear-gradient(90deg,#2563eb,#dc2626)">
  <div class="toolbar">
    <label>已选</label><input type="range" id="got" min="0" max="20" value="8"/><span class="kbd" id="gotV">8</span>
    <label>乐观</label><input type="range" id="hope" min="0" max="20" value="5"/><span class="kbd" id="hopeV">5</span>
    <label>最优</label><input type="range" id="best" min="0" max="30" value="15"/><span class="kbd" id="bestV">15</span>
  </div>
  <div class="stage-wrap light" style="margin-top:8px">
    <canvas class="stage" id="gauge" width="1000" height="280"></canvas>
    <div class="stage-hud"><span class="hud-pill light" id="hud">ub 仪表</span><span class="hud-pill light" id="hud2">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>ub</span><b class="blue" id="ubV">13</b></div>
    <div class="stat"><span>判定</span><b id="cutV">继续</b></div>
  </div>
  <div class="tip" id="tip">拖动滑块，观察指针与剪支火花。</div>
</div>
''', r'''
const cv=gauge, ctx=cv.getContext('2d');
let sparks=[];
function upd(){
  const g=+got.value,h=+hope.value,b=+best.value;
  gotV.textContent=g; hopeV.textContent=h; bestV.textContent=b;
  const ub=g+h; ubV.textContent=ub;
  const cut=ub<=b;
  cutV.textContent=cut?'✂️ 剪支':'✅ 继续'; cutV.className=cut?'red':'green';
  hud2.textContent=cut?'PRUNE':'EXPAND';
  tip.className='tip '+(cut?'danger':'ok');
  tip.innerHTML=cut?`<strong>剪支：</strong>ub=${ub} ≤ 最优 ${b}`:`<strong>保留：</strong>ub=${ub} > 最优 ${b}`;
  if(cut) for(let i=0;i<12;i++) sparks.push({x:500,y:150,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,life:1,col:Math.random()>.5?'#dc2626':'#fbbf24'});
  draw(g,h,ub,b,cut);
}
function draw(g,h,ub,b,cut){
  const W=cv.width,H=cv.height; ctx.clearRect(0,0,W,H);
  // panel
  const maxV=Math.max(ub,b,1)*1.15;
  // 3 bars isometric-ish
  function pillar(x,val,label,col){
    const bh=Math.max(8,(val/maxV)*160), bw=70, baseY=220;
    // side
    ctx.fillStyle=col+'99';
    ctx.beginPath(); ctx.moveTo(x+bw,baseY); ctx.lineTo(x+bw+18,baseY-12); ctx.lineTo(x+bw+18,baseY-12-bh); ctx.lineTo(x+bw,baseY-bh); ctx.fill();
    // top
    ctx.fillStyle=col;
    ctx.beginPath(); ctx.moveTo(x,baseY-bh); ctx.lineTo(x+bw,baseY-bh); ctx.lineTo(x+bw+18,baseY-bh-12); ctx.lineTo(x+18,baseY-bh-12); ctx.fill();
    // front
    const grd=ctx.createLinearGradient(x,0,x+bw,0); grd.addColorStop(0,col); grd.addColorStop(1,col+'cc');
    ctx.fillStyle=grd; ctx.fillRect(x,baseY-bh,bw,bh);
    ctx.fillStyle='#334155'; ctx.font='700 13px Segoe UI'; ctx.textAlign='center';
    ctx.fillText(label, x+bw/2+6, baseY+22);
    ctx.fillText(String(val), x+bw/2+6, baseY-bh-22);
  }
  pillar(120,g,'已选','#2563eb');
  pillar(280,h,'乐观','#7c3aed');
  pillar(440,ub,'ub', cut?'#dc2626':'#0f766e');
  pillar(640,b,'最优','#d97706');
  // threshold line
  const ly=220-(b/maxV)*160;
  ctx.setLineDash([8,6]); ctx.strokeStyle='#dc2626'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(80,ly); ctx.lineTo(780,ly); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#dc2626'; ctx.font='700 12px ui-monospace'; ctx.fillText('best 线', 790, ly+4);
  // sparks
  sparks=sparks.filter(s=>s.life>0);
  sparks.forEach(s=>{
    s.x+=s.vx; s.y+=s.vy; s.life-=.04;
    ctx.globalAlpha=Math.max(0,s.life); ctx.fillStyle=s.col;
    ctx.fillRect(s.x,s.y,3,3); ctx.globalAlpha=1;
  });
  // gauge arc
  ctx.save(); ctx.translate(900,150);
  ctx.beginPath(); ctx.arc(0,0,70,Math.PI*.75,Math.PI*2.25); ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=12; ctx.stroke();
  const ang=Math.PI*.75 + Math.min(1,ub/30)*(Math.PI*1.5);
  ctx.beginPath(); ctx.arc(0,0,70,Math.PI*.75,ang); ctx.strokeStyle=cut?'#dc2626':'#2563eb'; ctx.lineWidth=12; ctx.lineCap='round'; ctx.stroke();
  ctx.rotate(ang); ctx.fillStyle='#0f172a'; ctx.fillRect(0,-3,58,6); ctx.restore();
}
[got,hope,best].forEach(el=>el.oninput=upd);
function loop(){ upd(); requestAnimationFrame(loop); } // keep sparks alive - actually upd clears from input only
// separate anim loop for sparks
function anim(){ const g=+got.value,h=+hope.value,b=+best.value; draw(g,h,g+h,b,g+h<=b); requestAnimationFrame(anim); }
upd(); anim();
''', ("01-overview.html","概述对比"), ("03-framework.html","两种框架")))

    # ---- 03 ----
    write("03-framework.html", page("两种框架","03-framework.html", r'''
<section class="hero">
  <div class="eyebrow">图 3 · 框架动画</div>
  <h1>队列流水线 · 看见扩展顺序</h1>
  <p>下方动画模拟 FIFO 队列中结点的入队 / 出队（扩展）。优先队列则总是取「分数」最高者。</p>
</section>
<div class="grid grid-2">
  <div class="card" style="--accent:#2563eb"><div class="badge">FIFO</div><h3>队列式</h3>
    <p class="desc">先进先出 ＝ BFS。单位权最短路最爱。</p>
    <div class="code"><span class="kw">queue</span>&lt;Node&gt; q;
q.push(root);
<span class="kw">while</span>(!q.empty()){
  u=q.front(); q.pop(); // 扩展
}</div></div>
  <div class="card" style="--accent:#dc2626"><div class="badge red">Best-first</div><h3>优先队列式</h3>
    <p class="desc">按 ub/lb 取顶。更激进地逼近最优。</p>
    <div class="code"><span class="kw">priority_queue</span>&lt;Node&gt; pq;
<span class="kw">while</span>(!pq.empty()){
  u=pq.top(); pq.pop();
}</div></div>
</div>
<div class="card" style="margin-top:16px">
  <div class="toolbar">
    <button class="btn primary" id="runQ">▶ FIFO 动画</button>
    <button class="btn" id="runPQ">▶ 优先队列动画</button>
    <button class="btn ghost" id="reset">重置</button>
  </div>
  <div class="stage-wrap" style="height:220px">
    <canvas class="stage" id="qcv" width="1000" height="220"></canvas>
    <div class="stage-hud"><span class="hud-pill" id="mode">FIFO Queue</span><span class="hud-pill" id="qinfo">—</span></div>
  </div>
  <div class="tip" id="tip">点击播放，观察扩展顺序差异。</div>
</div>
''', r'''
const cv=qcv, ctx=cv.getContext('2d');
let items=[], mode='fifo', anim=false;
function seed(){ items=[{id:0,f:0,label:'根',st:'wait'}]; for(let i=1;i<=6;i++) items.push({id:i,f:Math.round(Math.random()*20+5),label:'N'+i,st:'wait'}); draw(); }
function draw(active=-1){
  const W=cv.width,H=cv.height; ctx.clearRect(0,0,W,H);
  // conveyor
  ctx.fillStyle='rgba(255,255,255,.06)'; ctx.fillRect(40,90,920,50);
  ctx.strokeStyle='rgba(148,163,184,.25)'; ctx.strokeRect(40,90,920,50);
  ctx.fillStyle='#94a3b8'; ctx.font='12px ui-monospace'; ctx.fillText('FRONT →',50,80); ctx.fillText('← BACK',900,80);
  const show=mode==='fifo'?items.filter(x=>x.st!=='done'):items.filter(x=>x.st!=='done').slice().sort((a,b)=>b.f-a.f);
  show.forEach((it,i)=>{
    const x=70+i*110, y=100;
    const on=it.id===active;
    const g=ctx.createLinearGradient(x,y,x,y+40);
    g.addColorStop(0,on?'#fca5a5':'#93c5fd'); g.addColorStop(1,on?'#dc2626':'#2563eb');
    ctx.fillStyle=g; roundRect(ctx,x,y,90,36,10); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 13px Segoe UI'; ctx.textAlign='center';
    ctx.fillText(it.label+(mode==='pq'?` f${it.f}`:''), x+45, y+23);
  });
}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
async function play(m){
  if(anim) return; anim=true; mode=m; mode.textContent=m==='fifo'?'FIFO Queue':'Priority Queue';
  seed(); items.forEach(x=>x.st='wait');
  // simulate expand root then children
  const q=items.slice();
  while(q.length){
    let u;
    if(mode==='fifo') u=q.shift();
    else { q.sort((a,b)=>b.f-a.f); u=q.shift(); }
    u.st='active'; draw(u.id); qinfo.textContent='扩展 '+u.label; tip.textContent='正在扩展 '+u.label+(mode==='pq'?' (f='+u.f+')':'');
    await sleep(550); u.st='done'; draw(); await sleep(200);
  }
  tip.innerHTML='<strong>完成</strong> · FIFO 按到达顺序；PQ 按 f 从大到小。'; anim=false;
}
runQ.onclick=()=>play('fifo'); runPQ.onclick=()=>play('pq'); reset.onclick=()=>{anim=false;seed();tip.textContent='已重置';};
seed();
''', ("02-bound.html","限界函数"), ("04-bfs.html","广度优先")))

    # ---- 04 BFS particles ----
    write("04-bfs.html", page("广度优先","04-bfs.html", r'''
<section class="hero">
  <div class="eyebrow">图 4 · 粒子波前</div>
  <h1>BFS：能量波在图上扩散</h1>
  <p>每次扩展一个结点，向邻边发射粒子。颜色深度表示 dist。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 自动</button>
    <button class="btn" id="step">单步</button>
    <button class="btn ghost" id="reset">重置</button>
    <div class="speed" id="spd"><button data-ms="700">慢</button><button data-ms="380" class="on">中</button><button data-ms="150">快</button></div>
  </div>
  <div class="stage-wrap" style="height:420px">
    <canvas class="stage" id="cv" width="1000" height="420"></canvas>
    <div class="stage-hud"><span class="hud-pill" id="hud">BFS</span><span class="hud-pill" id="hud2">queue []</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>扩展点</span><b class="blue" id="cur">—</b></div>
    <div class="stat"><span>已发现</span><b class="green" id="found">1</b></div>
  </div>
  <div class="log" id="log">就绪</div>
</div>
''', r'''
const POS=[[120,210],[280,90],[520,90],[720,210],[520,330],[280,330]];
const E=[[0,1],[0,5],[1,2],[1,5],[2,3],[2,4],[3,4],[4,5]];
const G=Array.from({length:6},()=>[]); E.forEach(([u,v])=>{G[u].push(v);G[v].push(u);});
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let dist,q,head,done,ms=380,parts=[],expanded;
function init(){
  dist=Array(6).fill(-1); dist[0]=0; q=[0]; head=0; done=false; expanded=new Set(); parts=[];
  cur.textContent='—'; found.textContent='1'; log.textContent='从 0 出发'; draw();
}
function draw(active=-1){
  const W=cv.width,H=cv.height; ctx.clearRect(0,0,W,H);
  // soft vignette
  const vg=ctx.createRadialGradient(W/2,H/2,40,W/2,H/2,500);
  vg.addColorStop(0,'rgba(37,99,235,.08)'); vg.addColorStop(1,'transparent'); ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
  E.forEach(([u,v])=>{
    ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(POS[u][0],POS[u][1]); ctx.lineTo(POS[v][0],POS[v][1]); ctx.stroke();
  });
  // particles
  parts=parts.filter(p=>p.t<1);
  parts.forEach(p=>{
    p.t+=.03; const x=p.x0+(p.x1-p.x0)*p.t, y=p.y0+(p.y1-p.y0)*p.t;
    ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2);
    ctx.fillStyle=`rgba(96,165,250,${1-p.t})`; ctx.fill();
  });
  POS.forEach((p,i)=>{
    const r=26;
    ctx.beginPath(); ctx.arc(p[0],p[1],r+8,0,Math.PI*2);
    if(i===active){ ctx.fillStyle='rgba(220,38,38,.2)'; ctx.fill(); }
    else if(dist[i]>=0){ ctx.fillStyle=`rgba(37,99,235,${0.08+Math.min(dist[i],4)*0.04})`; ctx.fill(); }
    ctx.beginPath(); ctx.arc(p[0],p[1],r,0,Math.PI*2);
    const g=ctx.createRadialGradient(p[0]-6,p[1]-6,3,p[0],p[1],r);
    if(i===active){ g.addColorStop(0,'#fca5a5'); g.addColorStop(1,'#dc2626'); }
    else if(expanded.has(i)){ g.addColorStop(0,'#6ee7b7'); g.addColorStop(1,'#0f766e'); }
    else if(dist[i]>=0){ g.addColorStop(0,'#93c5fd'); g.addColorStop(1,'#2563eb'); }
    else { g.addColorStop(0,'#cbd5e1'); g.addColorStop(1,'#64748b'); }
    ctx.fillStyle=g; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 16px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(i,p[0],p[1]);
    if(dist[i]>=0){ ctx.fillStyle='#e2e8f0'; ctx.font='12px ui-monospace'; ctx.fillText('d='+dist[i],p[0],p[1]+40); }
  });
}
function stepOnce(){
  if(done||head>=q.length){ done=true; log.textContent+='\\n✓ 完成'; return false; }
  const u=q[head++]; expanded.add(u); cur.textContent=u; draw(u);
  let msg=`扩展 ${u}`;
  for(const v of G[u]){
    if(dist[v]<0){
      dist[v]=dist[u]+1; q.push(v); msg+=` → ${v}`;
      parts.push({x0:POS[u][0],y0:POS[u][1],x1:POS[v][0],y1:POS[v][1],t:0});
    }
  }
  found.textContent=dist.filter(x=>x>=0).length;
  hud2.textContent='queue ['+q.slice(head).join(',')+']';
  log.textContent+=(log.textContent?'\\n':'')+msg; log.scrollTop=1e9;
  return head<q.length;
}
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{spd.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');ms=+b.dataset.ms;});
let busy=false;
run.onclick=async()=>{ if(busy)return; busy=true; init(); while(stepOnce()){ for(let i=0;i<8;i++){draw(cur.textContent==='—'?-1:+cur.textContent); await sleep(ms/8);} } busy=false; };
step.onclick=()=>{ if(done) init(); stepOnce(); };
reset.onclick=init;
(function loop(){ draw(cur.textContent==='—'?-1:+cur.textContent); requestAnimationFrame(loop); })();
init();
''', ("03-framework.html","两种框架"), ("05-sssp.html","3D迷宫")))

    # ---- 05 isometric 3D maze ----
    write("05-sssp.html", page("3D迷宫","05-sssp.html", r'''
<section class="hero">
  <div class="eyebrow">图 5 · 等距 3D 迷宫</div>
  <h1>立体迷宫里的最短路波前</h1>
  <p>等距投影墙体 + 高度感访问块。单位权下，波前第一次碰到终点 = 最短路。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">🚀 搜救</button>
    <button class="btn" id="neu">🎲 新迷宫</button>
    <div class="speed" id="spd"><button data-ms="70">慢</button><button data-ms="32" class="on">中</button><button data-ms="10">快</button></div>
  </div>
  <div class="stage-wrap" style="height:480px">
    <canvas class="stage" id="maze" width="1000" height="480"></canvas>
    <div class="stage-hud"><span class="hud-pill">ISOMETRIC MAZE</span><span class="hud-pill" id="mhud">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>最短步数</span><b class="green" id="steps">—</b></div>
    <div class="stat"><span>访问</span><b class="blue" id="visN">0</b></div>
    <div class="stat"><span>队列峰值</span><b id="peak">0</b></div>
  </div>
  <div class="tip" id="tip">金块=起点 · 翠块=终点 · 紫高亮=最短路径</div>
</div>
''', r'''
const N=11; let grid,S=[1,1],E=[9,9],ms=32;
const cv=maze, ctx=cv.getContext('2d');
// isometric helpers
const tileW=36, tileH=18, wallH=16;
function iso(i,j){ // grid row i, col j -> screen
  const x0=cv.width/2, y0=70;
  return {x:x0+(j-i)*(tileW/2), y:y0+(i+j)*(tileH/2)};
}
function drawPrism(i,j, h, top, sideL, sideR){
  const p=iso(i,j), tw=tileW/2, th=tileH/2;
  // order: left, right, top
  ctx.beginPath(); // left
  ctx.moveTo(p.x-tw,p.y); ctx.lineTo(p.x,p.y+th); ctx.lineTo(p.x,p.y+th-h); ctx.lineTo(p.x-tw,p.y-h); ctx.closePath();
  ctx.fillStyle=sideL; ctx.fill();
  ctx.beginPath(); // right
  ctx.moveTo(p.x+tw,p.y); ctx.lineTo(p.x,p.y+th); ctx.lineTo(p.x,p.y+th-h); ctx.lineTo(p.x+tw,p.y-h); ctx.closePath();
  ctx.fillStyle=sideR; ctx.fill();
  ctx.beginPath(); // top
  ctx.moveTo(p.x,p.y-h); ctx.lineTo(p.x+tw,p.y-h); ctx.lineTo(p.x,p.y+th-h); ctx.lineTo(p.x-tw,p.y-h); ctx.closePath();
  ctx.fillStyle=top; ctx.fill();
}
function gen(){
  grid=Array.from({length:N},()=>Array(N).fill(0));
  for(let i=0;i<N;i++) for(let j=0;j<N;j++) if(!i||!j||i===N-1||j===N-1) grid[i][j]=1;
  for(let k=0;k<28;k++){ const r=1+Math.floor(Math.random()*(N-2)),c=1+Math.floor(Math.random()*(N-2)); grid[r][c]=1; }
  S=[1,1]; E=[N-2,N-2]; grid[S[0]][S[1]]=0; grid[E[0]][E[1]]=0; grid[S[0]][S[1]+1]=0; grid[E[0]][E[1]-1]=0;
  steps.textContent='—'; visN.textContent='0'; peak.textContent='0'; tip.textContent='新迷宫就绪';
  render({},[]);
}
function render(vis={}, path=[], cur=null){
  ctx.clearRect(0,0,cv.width,cv.height);
  // draw back-to-front (i+j ascending)
  const cells=[];
  for(let i=0;i<N;i++) for(let j=0;j<N;j++) cells.push([i,j]);
  cells.sort((a,b)=>(a[0]+a[1])-(b[0]+b[1]));
  cells.forEach(([i,j])=>{
    const wall=grid[i][j]===1;
    const onPath=path.some(p=>p[0]===i&&p[1]===j);
    const visited=!!vis[i+','+j];
    const isS=i===S[0]&&j===S[1], isE=i===E[0]&&j===E[1];
    const isCur=cur&&cur[0]===i&&cur[1]===j;
    if(wall){
      drawPrism(i,j, wallH+6, '#334155', '#1e293b', '#0f172a');
    } else {
      let h=6, top='#e2e8f0', L='#cbd5e1', R='#94a3b8';
      if(visited){ h=10; top='#93c5fd'; L='#60a5fa'; R='#3b82f6'; }
      if(onPath){ h=14; top='#c4b5fd'; L='#a78bfa'; R='#7c3aed'; }
      if(isCur){ h=16; top='#fde68a'; L='#fbbf24'; R='#d97706'; }
      if(isS){ h=18; top='#fcd34d'; L='#f59e0b'; R='#b45309'; }
      if(isE){ h=18; top='#6ee7b7'; L='#34d399'; R='#0f766e'; }
      drawPrism(i,j,h,top,L,R);
    }
  });
}
async function bfs(){
  const q=[[...S]], prev={}, vis={}; vis[S.join(',')]=1; prev[S.join(',')]=null;
  const D=[[0,1],[1,0],[0,-1],[-1,0]]; let h=0,found=false,pk=1;
  while(h<q.length){
    const [x,y]=q[h++]; pk=Math.max(pk,q.length-h);
    peak.textContent=pk; visN.textContent=Object.keys(vis).length; mhud.textContent=`expand (${x},${y})`;
    render(vis,[], [x,y]); await sleep(ms);
    if(x===E[0]&&y===E[1]){found=true;break;}
    for(const [dx,dy] of D){
      const nx=x+dx,ny=y+dy,k=nx+','+ny;
      if(nx<0||ny<0||nx>=N||ny>=N||grid[nx][ny]||vis[k]) continue;
      vis[k]=1; prev[k]=[x,y]; q.push([nx,ny]);
    }
  }
  if(!found){ tip.className='tip danger'; tip.textContent='无通路，换一张'; return; }
  let path=[],cur=E; while(cur){path.push(cur);cur=prev[cur.join(',')];} path.reverse();
  // animate path rise
  for(let k=1;k<=path.length;k++){ render(vis, path.slice(0,k)); await sleep(40); }
  steps.textContent=path.length-1;
  tip.className='tip ok'; tip.innerHTML=`<strong>通关！</strong> 最短 ${path.length-1} 步 · 紫色高台为路径`;
}
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{spd.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');ms=+b.dataset.ms;});
neu.onclick=gen; run.onclick=bfs; gen();
''', ("04-bfs.html","广度优先"), ("06-knapsack.html","背包树")))

    # ---- 06 knapsack tree growth ----
    write("06-knapsack.html", page("背包树","06-knapsack.html", r'''
<section class="hero">
  <div class="eyebrow">图 6 · 决策树生长</div>
  <h1>0/1 背包：看着树被限界「修剪」</h1>
  <p>每个结点二分「选 / 不选」。红色 X 表示被 ub 剪支；绿色叶为更新最优。</p>
</section>
<div class="card">
  <p class="desc">w=[2,3,4,5] v=[3,4,5,8] W=10 · 演示深度优先展开 + ub 剪支（便于观察树形；真实 BnB 多用优先队列）</p>
  <div class="toolbar">
    <button class="btn primary" id="run">🌳 生长搜索树</button>
    <button class="btn ghost" id="reset">清空</button>
  </div>
  <div class="stage-wrap light" style="height:440px">
    <canvas class="stage" id="tree" width="1000" height="440"></canvas>
    <div class="stage-hud"><span class="hud-pill light" id="th">decision tree</span><span class="hud-pill light" id="th2">best=0</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>最优 best</span><b class="green" id="bestV">0</b></div>
    <div class="stat"><span>结点数</span><b class="blue" id="nV">0</b></div>
    <div class="stat"><span>剪支次数</span><b class="red" id="cV">0</b></div>
  </div>
  <div class="log" id="log">点击生长搜索树</div>
</div>
''', r'''
const items=[{w:2,v:3},{w:3,v:4},{w:4,v:5},{w:5,v:8}], W=10;
const cv=tree, ctx=cv.getContext('2d');
let nodes=[], best=0, cuts=0;
function bound(i,cw,cvv){
  let left=W-cw, ub=cvv;
  for(let k=i;k<items.length&&left>0;k++){
    if(items[k].w<=left){left-=items[k].w;ub+=items[k].v;}
    else{ub+=items[k].v*(left/items[k].w);break;}
  } return ub;
}
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  // links first
  nodes.forEach(n=>{
    if(n.p==null) return; const p=nodes[n.p];
    ctx.strokeStyle=n.cut?'rgba(220,38,38,.35)':'rgba(37,99,235,.25)';
    ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(p.x,p.y+12); ctx.lineTo(n.x,n.y-12); ctx.stroke();
  });
  nodes.forEach(n=>{
    const r=n.leaf?14:12;
    const g=ctx.createRadialGradient(n.x-4,n.y-4,2,n.x,n.y,r);
    if(n.cut){ g.addColorStop(0,'#fca5a5'); g.addColorStop(1,'#dc2626'); }
    else if(n.best){ g.addColorStop(0,'#6ee7b7'); g.addColorStop(1,'#0f766e'); }
    else if(n.leaf){ g.addColorStop(0,'#fde68a'); g.addColorStop(1,'#d97706'); }
    else { g.addColorStop(0,'#93c5fd'); g.addColorStop(1,'#2563eb'); }
    ctx.beginPath(); ctx.arc(n.x,n.y,r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    if(n.cut){ ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(n.x-5,n.y-5); ctx.lineTo(n.x+5,n.y+5); ctx.moveTo(n.x+5,n.y-5); ctx.lineTo(n.x-5,n.y+5); ctx.stroke(); }
    ctx.fillStyle='#334155'; ctx.font='10px ui-monospace'; ctx.textAlign='center';
    ctx.fillText(`v${n.v}`, n.x, n.y+24);
  });
}
async function grow(){
  nodes=[]; best=0; cuts=0; bestV.textContent=0; cV.textContent=0; nV.textContent=0; log.textContent='';
  async function dfs(i,cw,cvv, depth, x, spread, p){
    const ub=bound(i,cw,cvv);
    const id=nodes.length;
    const node={x,y:40+depth*70,p,v:cvv,cut:false,leaf:false,best:false};
    nodes.push(node); nV.textContent=nodes.length; draw(); await sleep(90);
    if(cw>W){ node.cut=true; cuts++; cV.textContent=cuts; log.textContent+=`超重剪 @d${depth}\\n`; draw(); return; }
    if(ub<=best+1e-9){ node.cut=true; cuts++; cV.textContent=cuts; log.textContent+=`ub剪 ${ub.toFixed(1)}≤${best}\\n`; draw(); return; }
    if(i===items.length){
      node.leaf=true;
      if(cvv>best){ best=cvv; bestV.textContent=best; th2.textContent='best='+best; node.best=true; log.textContent+=`★ best=${best}\\n`; }
      draw(); return;
    }
    // take / skip
    await dfs(i+1,cw+items[i].w,cvv+items[i].v, depth+1, x-spread, spread*.55, id);
    await dfs(i+1,cw,cvv, depth+1, x+spread, spread*.55, id);
  }
  await dfs(0,0,0,0,500,220,null);
  log.textContent+=`\\n完成 · best=${best} · 剪支 ${cuts}`;
}
run.onclick=grow; reset.onclick=()=>{nodes=[];draw();log.textContent='已清空';best=0;cuts=0;bestV.textContent=0;cV.textContent=0;nV.textContent=0;};
draw();
''', ("05-sssp.html","3D迷宫"), ("07-assign-tsp.html","TSP巡游")))

    # ---- 07 TSP ----
    write("07-assign-tsp.html", page("TSP巡游","07-assign-tsp.html", r'''
<section class="hero">
  <div class="eyebrow">图 7 · 城市巡游</div>
  <h1>TSP：路径在城市间生长</h1>
  <p>点击「贪心示意巡游」看最近邻构造；下方说明分支限界如何用 lb 剪掉坏排列。</p>
</section>
<div class="grid grid-2">
  <div class="card"><h3>任务分配</h3><p class="desc">排列树 + 行/列最小元松弛下界。</p></div>
  <div class="card"><h3>TSP 限界</h3><p class="desc">已走代价 + 未访点最小出边估计。</p></div>
</div>
<div class="card" style="margin-top:16px">
  <div class="toolbar">
    <button class="btn primary" id="tour">🛫 最近邻巡游动画</button>
    <button class="btn" id="shuf">🎲 重布城市</button>
  </div>
  <div class="stage-wrap" style="height:400px">
    <canvas class="stage" id="cv" width="1000" height="400"></canvas>
    <div class="stage-hud"><span class="hud-pill">TSP demo</span><span class="hud-pill" id="cost">cost=0</span></div>
  </div>
  <div class="tip">正式 BnB 会在排列树上用优先队列 + lb；这里用最近邻帮助建立空间直觉。</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let cities=[], path=[];
function place(){
  cities=Array.from({length:8},(_,i)=>{
    const ang=i/8*Math.PI*2 + Math.random()*.3;
    const R=120+Math.random()*40;
    return {x:500+Math.cos(ang)*R*1.6, y:200+Math.sin(ang)*R*.7, id:i};
  });
  // jitter
  cities.forEach(c=>{c.x+= (Math.random()-.5)*40; c.y+=(Math.random()-.5)*30;});
  path=[]; draw(); cost.textContent='cost=0';
}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function draw(glow=-1){
  ctx.clearRect(0,0,cv.width,cv.height);
  // soft map
  ctx.fillStyle='rgba(37,99,235,.05)'; ctx.fillRect(0,0,cv.width,cv.height);
  if(path.length>1){
    ctx.strokeStyle='rgba(96,165,250,.85)'; ctx.lineWidth=3; ctx.lineJoin='round';
    ctx.beginPath(); path.forEach((i,k)=>{const c=cities[i]; k?ctx.lineTo(c.x,c.y):ctx.moveTo(c.x,c.y);});
    if(path.length===cities.length){ const c=cities[path[0]]; ctx.lineTo(c.x,c.y); }
    ctx.stroke();
  }
  cities.forEach((c,i)=>{
    const on=path.includes(i), gl=i===glow;
    ctx.beginPath(); ctx.arc(c.x,c.y, gl?16:12,0,Math.PI*2);
    const g=ctx.createRadialGradient(c.x-4,c.y-4,2,c.x,c.y,16);
    if(gl){g.addColorStop(0,'#fde68a');g.addColorStop(1,'#d97706');}
    else if(on){g.addColorStop(0,'#93c5fd');g.addColorStop(1,'#2563eb');}
    else {g.addColorStop(0,'#e2e8f0');g.addColorStop(1,'#64748b');}
    ctx.fillStyle=g; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 12px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(i,c.x,c.y);
  });
}
async function tour(){
  path=[0]; let used=new Set([0]), total=0;
  while(path.length<cities.length){
    const u=path[path.length-1]; let best=-1,bd=1e9;
    cities.forEach((c,i)=>{ if(!used.has(i)){ const d=dist(cities[u],c); if(d<bd){bd=d;best=i;} }});
    // animate dashed grow
    for(let t=0;t<=1;t+=.08){
      draw(best);
      const a=cities[u], b=cities[best];
      ctx.strokeStyle=`rgba(251,191,36,${.4+.6*t})`; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(a.x+(b.x-a.x)*t, a.y+(b.y-a.y)*t); ctx.stroke();
      await sleep(30);
    }
    used.add(best); path.push(best); total+=bd; cost.textContent='cost≈'+total.toFixed(0); draw();
    await sleep(200);
  }
  // return
  total+=dist(cities[path[path.length-1]],cities[path[0]]); path.push(path[0]); draw(); cost.textContent='cost≈'+total.toFixed(0)+' (闭环)';
}
tour.onclick=tour; shuf.onclick=place; place();
''', ("06-knapsack.html","背包树"), ("08-astar.html","A* 可视")))

    # ---- 08 A* heat ----
    write("08-astar.html", page("A*可视","08-astar.html", r'''
<section class="hero">
  <div class="eyebrow">图 8 · A* 热力网格</div>
  <h1>f = g + h 在格子上发光</h1>
  <p>从 S 到 E，A* 优先扩展 f 小的格子。颜色越亮表示越先被扩展。h 为曼哈顿距离。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">⭐ 运行 A*</button>
    <button class="btn" id="reset">重置墙</button>
    <label>点格切换墙</label>
  </div>
  <div class="stage-wrap light" style="height:460px">
    <canvas class="stage" id="cv" width="720" height="460"></canvas>
    <div class="stage-hud"><span class="hud-pill light">A* GRID</span><span class="hud-pill light" id="ah">click walls</span></div>
  </div>
  <div class="formula">f(n)=g(n)+h(n) · h=曼哈顿 · 可采纳 ⇒ 最优</div>
  <div class="stat-row">
    <div class="stat"><span>扩展数</span><b class="blue" id="exp">0</b></div>
    <div class="stat"><span>路径长</span><b class="green" id="plen">—</b></div>
  </div>
</div>
''', r'''
const R=12,C=18, cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const cell=Math.min((cv.width-40)/C,(cv.height-40)/R);
const ox=20, oy=20;
let wall=Array.from({length:R},()=>Array(C).fill(0));
const S=[1,1], E=[R-2,C-2];
// sprinkle walls
function sprinkle(){
  wall=Array.from({length:R},()=>Array(C).fill(0));
  for(let k=0;k<40;k++){ const i=1+Math.floor(Math.random()*(R-2)), j=1+Math.floor(Math.random()*(C-2)); wall[i][j]=1; }
  wall[S[0]][S[1]]=0; wall[E[0]][E[1]]=0;
}
function h(i,j){return Math.abs(i-E[0])+Math.abs(j-E[1]);}
function draw(meta={}){
  ctx.clearRect(0,0,cv.width,cv.height);
  for(let i=0;i<R;i++) for(let j=0;j<C;j++){
    const x=ox+j*cell, y=oy+i*cell;
    let col='#f1f5f9';
    if(wall[i][j]) col='#1e293b';
    if(meta.g && meta.g[i][j]<1e9){
      const t=Math.min(1, meta.order[i][j]/Math.max(1,meta.maxO));
      col=`hsl(${220-t*80} 85% ${88-t*35}%)`;
    }
    if(meta.path && meta.path.has(i+','+j)) col='#a78bfa';
    if(i===S[0]&&j===S[1]) col='#fbbf24';
    if(i===E[0]&&j===E[1]) col='#34d399';
    ctx.fillStyle=col;
    ctx.beginPath(); ctx.roundRect(x+1,y+1,cell-2,cell-2,5); ctx.fill();
  }
}
if(!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);};
}
async function astar(){
  const g=Array.from({length:R},()=>Array(C).fill(1e9));
  const order=Array.from({length:R},()=>Array(C).fill(0));
  const prev=Array.from({length:R},()=>Array(C).fill(null));
  g[S[0]][S[1]]=0; let open=[{i:S[0],j:S[1],f:h(S[0],S[1])}], closed=new Set(), step=0, maxO=1;
  const key=(i,j)=>i+','+j;
  while(open.length){
    open.sort((a,b)=>a.f-b.f||g[a.i][a.j]-g[b.i][b.j]);
    const u=open.shift(); const k=key(u.i,u.j);
    if(closed.has(k)) continue; closed.add(k);
    order[u.i][u.j]=++step; maxO=step; exp.textContent=step;
    draw({g,order,maxO}); await sleep(25);
    if(u.i===E[0]&&u.j===E[1]) break;
    for(const [di,dj] of [[0,1],[1,0],[0,-1],[-1,0]]){
      const ni=u.i+di,nj=u.j+dj; if(ni<0||nj<0||ni>=R||nj>=C||wall[ni][nj]) continue;
      const ng=g[u.i][u.j]+1; if(ng<g[ni][nj]){ g[ni][nj]=ng; prev[ni][nj]=[u.i,u.j]; open.push({i:ni,j:nj,f:ng+h(ni,nj)}); }
    }
  }
  const path=new Set(); let cur=E;
  if(g[E[0]][E[1]]>=1e9){ plen.textContent='∞'; ah.textContent='no path'; return; }
  while(cur){ path.add(cur[0]+','+cur[1]); cur=prev[cur[0]][cur[1]]; }
  plen.textContent=g[E[0]][E[1]]; ah.textContent='path ready';
  draw({g,order,maxO,path});
}
cv.onclick=e=>{
  const r=cv.getBoundingClientRect(), x=(e.clientX-r.left)*cv.width/r.width, y=(e.clientY-r.top)*cv.height/r.height;
  const j=Math.floor((x-ox)/cell), i=Math.floor((y-oy)/cell);
  if(i<0||j<0||i>=R||j>=C) return;
  if((i===S[0]&&j===S[1])||(i===E[0]&&j===E[1])) return;
  wall[i][j]^=1; draw();
};
run.onclick=astar; reset.onclick=()=>{sprinkle();draw();exp.textContent=0;plen.textContent='—';};
sprinkle(); draw();
''', ("07-assign-tsp.html","TSP巡游"), ("09-8puzzle.html","八数码3D")))

    # ---- 09 3D puzzle ----
    write("09-8puzzle.html", page("八数码3D","09-8puzzle.html", r'''
<section class="hero">
  <div class="eyebrow">图 9 · 立体滑块</div>
  <h1>八数码 3D · A* 回放</h1>
  <p>带厚度的滑块棋盘。A*（曼哈顿启发）求最短复原序列并动画播放。</p>
</section>
<div class="card" style="text-align:center">
  <div class="toolbar" style="justify-content:center">
    <button class="btn" id="shuffle">🎲 打乱</button>
    <button class="btn primary" id="solve">✨ A* 求解回放</button>
    <button class="btn ghost" id="goal">目标态</button>
  </div>
  <div class="scene3d">
    <div id="board" class="board" style="grid-template-columns:repeat(3,58px); transform:rotateX(18deg) rotateZ(-2deg)"></div>
  </div>
  <div class="stat-row" style="max-width:480px;margin:16px auto 0">
    <div class="stat"><span>步数</span><b class="blue" id="mv">0</b></div>
    <div class="stat"><span>h</span><b class="red" id="hv">0</b></div>
    <div class="stat"><span>状态</span><b id="st" style="font-size:1rem">就绪</b></div>
  </div>
  <div class="tip" id="tip">目标：123 / 456 / 78□</div>
</div>
''', r'''
const goal=[1,2,3,4,5,6,7,8,0]; let state=goal.slice();
function manh(s){let h=0; for(let i=0;i<9;i++){if(!s[i])continue; const t=s[i]-1; h+=Math.abs((i/3|0)-(t/3|0))+Math.abs(i%3-t%3);} return h;}
function render(moveIdx=-1){
  board.innerHTML=state.map((v,i)=>{
    if(!v) return `<div class="sq empty"></div>`;
    return `<div class="sq tile ${i===moveIdx?'move':''}">${v}</div>`;
  }).join('');
  hv.textContent=manh(state);
}
function neigh(s){
  const z=s.indexOf(0),r=z/3|0,c=z%3,res=[];
  for(const [dr,dc] of [[0,1],[1,0],[0,-1],[-1,0]]){
    const nr=r+dr,nc=c+dc; if(nr<0||nc<0||nr>2||nc>2) continue;
    const nz=nr*3+nc, ns=s.slice(); [ns[z],ns[nz]]=[ns[nz],ns[z]]; res.push(ns);
  } return res;
}
function key(s){return s.join(',');}
function astar(){
  const start=state.slice();
  const open=[{s:start,g:0,f:manh(start),p:null}];
  const seen=new Map([[key(start),0]]);
  while(open.length){
    open.sort((a,b)=>a.f-b.f||a.g-b.g);
    const cur=open.shift();
    if(key(cur.s)===key(goal)){ const path=[]; let x=cur; while(x){path.push(x.s);x=x.p;} return path.reverse(); }
    for(const ns of neigh(cur.s)){
      const g=cur.g+1,k=key(ns); if(seen.has(k)&&seen.get(k)<=g) continue;
      seen.set(k,g); open.push({s:ns,g,f:g+manh(ns),p:cur});
    }
  } return null;
}
shuffle.onclick=()=>{
  state=goal.slice();
  for(let i=0;i<55;i++){const ns=neigh(state); state=ns[Math.floor(Math.random()*ns.length)];}
  mv.textContent=0; st.textContent='已打乱'; render(); tip.textContent='点击 A* 求解回放';
};
goal.onclick=()=>{state=goal.slice();mv.textContent=0;st.textContent='目标态';render();tip.textContent='目标布局';};
solve.onclick=async()=>{
  st.textContent='搜索…'; await sleep(20);
  const path=astar();
  if(!path){st.textContent='失败';return;}
  st.textContent='回放'; tip.textContent=`最优 ${path.length-1} 步`;
  for(let i=0;i<path.length;i++){
    // find moved tile index in new state
    let mi=-1; if(i){ for(let k=0;k<9;k++) if(path[i][k]&&path[i][k]!==path[i-1][k]) mi=k; }
    state=path[i]; mv.textContent=i; render(mi); await sleep(280);
  }
  st.textContent='完成'; tip.innerHTML=`<strong>复原成功</strong> · ${path.length-1} 步`;
};
render();
''', ("08-astar.html","A* 可视"), ("index.html","返回总览")))

    print("\n第6章强交互可视化版完成 →", OUT)

if __name__ == "__main__":
    build()
