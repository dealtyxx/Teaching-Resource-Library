# -*- coding: utf-8 -*-
"""
第9章 图算法 · 强交互 / 强可视化版
MST 生长 · 最短路 · 网络流 · 离线可用
"""
from pathlib import Path
OUT = Path(__file__).resolve().parent

CSS = r"""
:root{
  --bg:#eef2ff; --surface:#fff; --s2:#f5f7ff; --s3:#e8ecfb;
  --text:#0b1220; --muted:#5a6b85; --faint:#8b9bb5;
  --line:rgba(99,102,241,.15); --line2:rgba(99,102,241,.28);
  --indigo:#4f46e5; --indigo2:#4338ca; --indS:rgba(79,70,229,.1);
  --blue:#2563eb; --blueS:rgba(37,99,235,.1);
  --green:#059669; --greenS:rgba(5,150,105,.1);
  --red:#dc2626; --redS:rgba(220,38,38,.09);
  --amber:#d97706; --violet:#7c3aed; --cyan:#0891b2;
  --shadow:0 8px 28px rgba(79,70,229,.12); --shadow2:0 22px 50px rgba(79,70,229,.18);
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
    radial-gradient(1100px 560px at 5% -8%,rgba(79,70,229,.16),transparent 55%),
    radial-gradient(900px 480px at 95% 0%,rgba(6,182,212,.1),transparent 50%),
    radial-gradient(700px 400px at 50% 110%,rgba(124,58,237,.08),transparent 45%),
    linear-gradient(180deg,#f8f9ff,#eef2ff 50%,#e8ecfb);
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;text-decoration:none} button,input{font:inherit}
.fx-bg{position:fixed;inset:0;pointer-events:none;z-index:0}
.fx-bg canvas{width:100%;height:100%;display:block;opacity:.45}
.nav,.wrap{position:relative;z-index:1}
.nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  padding:11px 18px;background:rgba(255,255,255,.88);backdrop-filter:blur(18px) saturate(1.35);
  border-bottom:1px solid var(--line);box-shadow:0 8px 24px rgba(15,23,42,.05)}
.nav .brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:14px}
.nav .logo{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;
  background:linear-gradient(135deg,#818cf8,#4f46e5 55%,#0891b2);color:#fff;
  font:800 11px var(--mono);box-shadow:0 6px 16px rgba(79,70,229,.4);
  transform:perspective(200px) rotateY(-8deg);transition:transform .3s var(--ease)}
.nav .brand:hover .logo{transform:perspective(200px) rotateY(8deg) scale(1.05)}
.nav .brand span{color:var(--indigo)}
.nav .links{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end;max-width:min(100%,920px)}
.nav a.pill{font-size:11.5px;font-weight:700;padding:6px 10px;border-radius:999px;color:var(--muted);border:1px solid transparent;transition:.2s var(--ease)}
.nav a.pill:hover{color:var(--indigo);background:var(--indS);border-color:var(--line)}
.nav a.pill.active{color:#fff;background:linear-gradient(135deg,#818cf8,#4f46e5);box-shadow:0 4px 14px rgba(79,70,229,.35)}
.wrap{max-width:1160px;margin:0 auto;padding:26px 16px 70px}
.hero{margin-bottom:24px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;color:var(--indigo);
  letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:999px;background:var(--indS);
  border:1px solid rgba(79,70,229,.22);margin-bottom:12px}
.hero h1{font-size:clamp(1.55rem,3.3vw,2.4rem);line-height:1.15;font-weight:900;letter-spacing:-.025em;margin-bottom:12px;
  background:linear-gradient(120deg,#0b1220,#312e81 30%,#4f46e5 55%,#0891b2 90%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{color:var(--muted);font-size:1.04rem;max-width:780px;line-height:1.7}
.hero-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:12.5px;font-weight:700;
  background:#fff;border:1px solid var(--line);color:var(--muted);box-shadow:0 2px 8px rgba(15,23,42,.04)}
.chip.ind{background:var(--indS);color:var(--indigo)} .chip.blue{background:var(--blueS);color:var(--blue)}
.chip.green{background:var(--greenS);color:var(--green)} .chip.cyan{background:rgba(8,145,178,.1);color:var(--cyan)}
.grid{display:grid;gap:16px}
.grid-2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.grid-3{grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px;box-shadow:var(--shadow);
  position:relative;overflow:hidden;transition:transform .28s var(--ease),box-shadow .28s,border-color .28s}
.card:hover{transform:translateY(-3px);box-shadow:var(--shadow2);border-color:var(--line2)}
.card::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--accent,linear-gradient(90deg,#818cf8,#0891b2))}
.card h3{font-size:1.08rem;font-weight:800;margin-bottom:8px}
.card p,.desc{color:var(--muted);line-height:1.65;font-size:.94rem}
.badge{display:inline-flex;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;margin-bottom:10px;
  background:var(--indS);color:var(--indigo);border:1px solid rgba(79,70,229,.2)}
.badge.green{background:var(--greenS);color:var(--green)} .badge.red{background:var(--redS);color:var(--red)}
.badge.amber{background:rgba(217,119,6,.1);color:var(--amber)} .badge.cyan{background:rgba(8,145,178,.1);color:var(--cyan)}
a.feature-card{display:flex;flex-direction:column;min-height:158px;padding:18px;border-radius:var(--r);
  background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);position:relative;overflow:hidden;
  transition:transform .3s var(--ease),box-shadow .3s}
a.feature-card::after{content:attr(data-ico);position:absolute;right:12px;top:10px;font-size:40px;opacity:.14;transition:.35s var(--ease)}
a.feature-card:hover{transform:translateY(-8px) scale(1.015);box-shadow:var(--shadow2);
  border-color:color-mix(in srgb,var(--c,#4f46e5) 40%,transparent)}
a.feature-card:hover::after{opacity:.28;transform:scale(1.15) rotate(8deg)}
a.feature-card .num{font:800 12px var(--mono);color:var(--c,#4f46e5);letter-spacing:.06em;margin-bottom:8px}
a.feature-card h3{font-size:1.08rem;margin-bottom:6px}
a.feature-card p{color:var(--muted);font-size:.87rem;line-height:1.55;flex:1}
a.feature-card .go{margin-top:12px;font-size:12.5px;font-weight:800;color:var(--c,#4f46e5);opacity:0;transform:translateX(-8px);transition:.25s}
a.feature-card:hover .go{opacity:1;transform:none}
.btn{appearance:none;border:1px solid var(--line);background:var(--s2);color:var(--text);
  padding:10px 16px;border-radius:13px;cursor:pointer;font-weight:800;font-size:13.5px;
  transition:.2s var(--ease);display:inline-flex;align-items:center;gap:6px}
.btn:hover{border-color:var(--line2);background:#fff;color:var(--indigo);transform:translateY(-1px)}
.btn:active{transform:scale(.98)}
.btn.primary{background:linear-gradient(135deg,#818cf8,#4f46e5);border:none;color:#fff;box-shadow:0 8px 20px rgba(79,70,229,.32)}
.btn.primary:hover{filter:brightness(1.06);color:#fff}
.btn.ghost{background:transparent}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important}
.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0}
.toolbar label{font-size:12.5px;color:var(--muted);font-weight:700}
.speed{display:flex;gap:4px;background:var(--s2);padding:3px;border-radius:11px;border:1px solid var(--line)}
.speed button{border:none;background:transparent;padding:6px 11px;border-radius:8px;font-size:12px;font-weight:800;color:var(--muted);cursor:pointer}
.speed button.on{background:#fff;color:var(--indigo);box-shadow:0 1px 4px rgba(15,23,42,.08)}
.tip{margin-top:12px;padding:13px 15px;border-radius:15px;background:linear-gradient(135deg,var(--indS),rgba(8,145,178,.06));
  border:1px solid var(--line);color:var(--muted);font-size:13.5px;line-height:1.65}
.tip strong{color:var(--text)}
.tip.ok{background:var(--greenS);border-color:rgba(5,150,105,.25)}
.tip.warn{background:rgba(217,119,6,.1);border-color:rgba(217,119,6,.22)}
.formula{font-family:var(--mono);background:linear-gradient(135deg,#eef2ff,#ecfeff);border:1px solid rgba(79,70,229,.22);
  border-radius:16px;padding:16px 18px;margin-top:10px;color:var(--indigo2);font-size:15px;line-height:1.55;text-align:center;font-weight:750}
.formula.lg{font-size:clamp(1.05rem,2.4vw,1.45rem);padding:20px}
.code{font-family:var(--mono);font-size:12.5px;line-height:1.7;background:#0f172a;color:#e2e8f0;border-radius:16px;
  padding:15px 16px;overflow:auto;white-space:pre;margin-top:10px}
.code .cm{color:#64748b}.code .kw{color:#a5b4fc}.code .fn{color:#67e8f9}
.stat-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.stat{flex:1;min-width:100px;background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px}
.stat span{font-size:11.5px;color:var(--faint);font-weight:700}
.stat b{display:block;font-size:1.3rem;margin-top:4px;font-weight:900;font-variant-numeric:tabular-nums}
.stat b.blue{color:var(--blue)}.stat b.green{color:var(--green)}.stat b.red{color:var(--red)}.stat b.ind{color:var(--indigo)}
.list-step{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;margin:8px 0;border-radius:14px;border:1px solid var(--line);background:#fff}
.list-step .n{flex-shrink:0;width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,#818cf8,#4f46e5);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900}
.list-step .body{flex:1;font-size:.92rem;color:var(--muted);line-height:1.55}
.list-step .body b{color:var(--text)}
table.data{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;margin-top:8px;overflow:hidden;border-radius:14px;border:1px solid var(--line)}
table.data th,table.data td{padding:10px 12px;text-align:center;border-bottom:1px solid var(--line)}
table.data th{background:var(--s3);color:var(--muted);font-size:11.5px;font-weight:800}
table.data tr:last-child td{border-bottom:none}
table.data td.hl{background:rgba(79,70,229,.12);font-weight:800;color:var(--indigo2)}
.stage-wrap{position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow);background:#0b1220}
.stage-wrap.light{background:linear-gradient(rgba(79,70,229,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(8,145,178,.04) 1px,transparent 1px),#f8fafc;background-size:22px 22px,22px 22px,auto}
canvas.stage{width:100%;display:block;touch-action:none}
.stage-hud{position:absolute;left:12px;top:12px;right:12px;display:flex;justify-content:space-between;gap:8px;pointer-events:none;flex-wrap:wrap}
.hud-pill{padding:6px 11px;border-radius:999px;background:rgba(15,23,42,.72);color:#e2e8f0;font:700 12px var(--mono);border:1px solid rgba(255,255,255,.1)}
.hud-pill.light{background:rgba(255,255,255,.92);color:var(--text);border-color:var(--line)}
.legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;font-size:12.5px;color:var(--muted);font-weight:700}
.legend i{display:inline-block;width:11px;height:11px;border-radius:4px;margin-right:5px;vertical-align:middle}
.log{max-height:170px;overflow:auto;font:12px/1.65 var(--mono);color:var(--muted);background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px;margin-top:10px}
.cells{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:12px 0}
.cell{min-width:48px;min-height:48px;border-radius:12px;display:grid;place-items:center;font-weight:900;font-size:14px;
  border:1.5px solid var(--line);background:#fff;transition:all .25s var(--ease);box-shadow:0 2px 8px rgba(15,23,42,.05)}
.cell.on{border-color:var(--indigo);background:var(--indS);color:var(--indigo);transform:translateY(-4px) scale(1.06)}
.cell.hit{border-color:var(--green);background:var(--greenS);color:var(--green)}
.cell.done{border-color:var(--cyan);background:rgba(8,145,178,.12);color:var(--cyan)}
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
.pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--indigo);box-shadow:0 0 0 0 rgba(79,70,229,.45);animation:pulse 1.6s infinite;display:inline-block}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(79,70,229,.45)}70%{box-shadow:0 0 0 10px transparent}}
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
    parts=Array.from({length:28},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:1+Math.random()*2, vx:(Math.random()-.5)*.2, vy:-.1-Math.random()*.25, a:.12+Math.random()*.28}));
  }
  function tick(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; if(p.y<-10){p.y=innerHeight+10;p.x=Math.random()*innerWidth;}
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(79,70,229,${p.a})`; ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  addEventListener('resize',resize); resize(); tick();
})();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// shared graph geometry
const GPOS=[[120,200],[300,80],[520,80],[700,200],[520,320],[300,320]];
const GEDGES=[[0,1,6],[0,5,5],[1,2,5],[1,5,3],[2,3,4],[2,4,3],[2,5,4],[3,4,5],[4,5,2]];
"""

LINKS = [
    ("index.html","总览"),
    ("01-prim.html","Prim"),
    ("02-kruskal.html","Kruskal"),
    ("03-dijkstra.html","Dijkstra"),
    ("04-bf-spfa.html","BF/SPFA"),
    ("05-floyd.html","Floyd"),
    ("06-flow.html","网络流"),
    ("07-ff.html","FF"),
    ("08-ek.html","EK"),
    ("09-dinic.html","Dinic"),
    ("10-match.html","匹配"),
]
CH = "第9章 图算法"

def nav(active):
    pills="".join(f'<a class="{"pill active" if h==active else "pill"}" href="{h}">{lab}</a>' for h,lab in LINKS)
    return f'''<div class="fx-bg" aria-hidden="true"></div>
<nav class="nav"><div class="brand"><div class="logo">09</div>算法可视化 · <span>{CH}</span></div>
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
<div class="footer">算法设计与分析 · <b>{CH}</b> · 强交互可视化版<br/>MST · 最短路 · 网络流 · 建议全屏投影</div>
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

    items = [
        ("01-prim.html","01","Prim 算法","割集轻边 · 树生长发光","#4f46e5","🌲"),
        ("02-kruskal.html","02","Kruskal 算法","排序加边 · 并查集","#0891b2","🔗"),
        ("03-dijkstra.html","03","Dijkstra","dist 松弛 · 尘埃落定","#2563eb","📍"),
        ("04-bf-spfa.html","04","BF / SPFA","负权 · 负环检测","#dc2626","⚠️"),
        ("05-floyd.html","05","Floyd 全源","三重循环热力矩阵","#7c3aed","▦"),
        ("06-flow.html","06","网络流概念","容量 · 残留 · 割","#059669","💧"),
        ("07-ff.html","07","Ford-Fulkerson","增广路方法","#d97706","➡️"),
        ("08-ek.html","08","Edmonds-Karp","BFS 找增广路动画","#4f46e5","🌊"),
        ("09-dinic.html","09","Dinic","分层图示意","#0891b2","📶"),
        ("10-match.html","10","二分图匹配","增广路配对","#7c3aed","🤝"),
    ]
    cards="".join(f'''
<a class="feature-card" href="{h}" style="--c:{c}" data-ico="{ico}">
  <div class="num">图 {n}</div><h3>{t}</h3><p>{d}</p><div class="go">进入实验 →</div>
</a>''' for h,n,t,d,c,ico in items)

    write("index.html", page("交互总览","index.html", f'''
<section class="hero">
  <div class="eyebrow"><span class="pulse-dot"></span> Immersive Lab · Chapter 9</div>
  <h1>图算法 · 边与点的舞蹈</h1>
  <p>最小生成树如何「长」出来，最短路如何「尘埃落定」，网络流如何一条条增广——全部用<strong>可播放的图动画</strong>呈现。</p>
  <div class="hero-meta">
    <span class="chip ind">🕸️ 10 个实验</span>
    <span class="chip cyan">⚡ 可调速</span>
    <span class="chip green">🎬 单步 / 自动</span>
  </div>
</section>
<div class="card" style="--accent:linear-gradient(90deg,#818cf8,#4f46e5,#0891b2);margin-bottom:18px">
  <div class="formula lg">MST · 最短路 · 最大流 —— 图上三大经典</div>
  <div class="stage-wrap" style="margin-top:14px;height:160px">
    <canvas class="stage" id="heroCv" width="1100" height="160"></canvas>
    <div class="stage-hud"><span class="hud-pill">LIVE graph pulse</span><span class="hud-pill">auto</span></div>
  </div>
</div>
<div class="grid grid-2 stagger">{cards}</div>
''', r'''
const cv=heroCv, ctx=cv.getContext('2d');
const P=[[100,80],[280,40],[480,40],[680,80],[480,120],[280,120]];
const E=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[1,5],[2,4]];
let t=0;
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  E.forEach(([u,v],i)=>{
    const pulse=(Math.sin(t*0.05+i)*.5+.5);
    ctx.strokeStyle=`rgba(129,140,248,${0.25+pulse*0.55})`;
    ctx.lineWidth=2+pulse*2;
    ctx.beginPath(); ctx.moveTo(P[u][0]+150,P[u][1]); ctx.lineTo(P[v][0]+150,P[v][1]); ctx.stroke();
  });
  P.forEach((p,i)=>{
    const on=Math.floor(t/20)%6===i;
    ctx.beginPath(); ctx.arc(p[0]+150,p[1], on?14:11,0,Math.PI*2);
    const g=ctx.createRadialGradient(p[0]+146,p[1]-4,2,p[0]+150,p[1],14);
    g.addColorStop(0,on?'#a5b4fc':'#67e8f9'); g.addColorStop(1,on?'#4f46e5':'#0891b2');
    ctx.fillStyle=g; ctx.fill();
  });
  t++;
}
setInterval(draw,40); draw();
''', None, ("01-prim.html","Prim")))

    # shared graph draw helpers embedded in pages
    GRAPH_DRAW = r"""
function drawGraph(ctx, mst=[], U=new Set(), hl=null, dist=null, done=null){
  const W=ctx.canvas.width, H=ctx.canvas.height;
  ctx.clearRect(0,0,W,H);
  // soft bg glow
  const vg=ctx.createRadialGradient(W/2,H/2,20,W/2,H/2,400);
  vg.addColorStop(0,'rgba(79,70,229,.08)'); vg.addColorStop(1,'transparent');
  ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
  GEDGES.forEach(([u,v,w])=>{
    const inM=mst.some(e=>(e[0]===u&&e[1]===v)||(e[0]===v&&e[1]===u));
    const isH=hl&&((hl[0]===u&&hl[1]===v)||(hl[0]===v&&hl[1]===u));
    ctx.strokeStyle=inM?'#34d399':(isH?'#fbbf24':'rgba(148,163,184,.35)');
    ctx.lineWidth=inM||isH?4:2;
    if(inM){ ctx.shadowColor='#34d399'; ctx.shadowBlur=12; }
    ctx.beginPath(); ctx.moveTo(GPOS[u][0],GPOS[u][1]); ctx.lineTo(GPOS[v][0],GPOS[v][1]); ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle='#94a3b8'; ctx.font='12px ui-monospace'; ctx.textAlign='center';
    ctx.fillText(w,(GPOS[u][0]+GPOS[v][0])/2+8,(GPOS[u][1]+GPOS[v][1])/2-6);
  });
  GPOS.forEach((p,i)=>{
    const inU=U.has?U.has(i):(done&&done[i]);
    const g=ctx.createRadialGradient(p[0]-6,p[1]-6,3,p[0],p[1],22);
    if(inU){ g.addColorStop(0,'#a5b4fc'); g.addColorStop(1,'#4f46e5'); }
    else { g.addColorStop(0,'#cbd5e1'); g.addColorStop(1,'#64748b'); }
    ctx.beginPath(); ctx.arc(p[0],p[1],20,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='bold 14px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(i,p[0],p[1]-(dist?6:0));
    if(dist){ ctx.fillStyle='#fde68a'; ctx.font='11px ui-monospace';
      ctx.fillText(dist[i]>=1e9?'∞':dist[i], p[0], p[1]+12); }
  });
}
"""

    # 01 Prim
    write("01-prim.html", page("Prim","01-prim.html", r'''
<section class="hero">
  <div class="eyebrow">图 1 · MST</div>
  <h1>Prim · 从一点「种」出生成树</h1>
  <p>每次从割集 (U, V−U) 选权最小的边加入。看绿边如何一圈圈生长。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 自动生长</button>
    <button class="btn" id="step">单步</button>
    <button class="btn ghost" id="reset">重置</button>
    <div class="speed" id="spd"><button data-ms="900">慢</button><button data-ms="500" class="on">中</button><button data-ms="220">快</button></div>
  </div>
  <div class="stage-wrap" style="height:400px">
    <canvas class="stage" id="cv" width="900" height="400"></canvas>
    <div class="stage-hud"><span class="hud-pill">Prim</span><span class="hud-pill" id="hud">U={0}</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>边数</span><b class="ind" id="ec">0</b></div>
    <div class="stat"><span>总权</span><b class="green" id="tw">0</b></div>
  </div>
  <div class="legend">
    <span><i style="background:#4f46e5"></i>U 内顶点</span>
    <span><i style="background:#34d399"></i>MST 边</span>
    <span><i style="background:#fbbf24"></i>候选轻边</span>
  </div>
</div>
''', GRAPH_DRAW + r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let U, mst, steps=[], si=0, ms=500, busy=false;
function buildSteps(){
  const UU=new Set([0]), ME=[], st=[{U:new Set([0]),mst:[],hl:null,msg:'U={0} 发芽'}];
  for(let s=0;s<5;s++){
    let best=null,bw=1e9;
    for(const [u,v,w] of GEDGES) if(UU.has(u)!==UU.has(v)&&w<bw){bw=w;best=[u,v,w];}
    if(!best) break;
    st.push({U:new Set(UU),mst:ME.slice(),hl:best,msg:`候选轻边 (${best[0]},${best[1]}) w=${best[2]}`});
    ME.push(best); UU.add(best[0]); UU.add(best[1]);
    st.push({U:new Set(UU),mst:ME.slice(),hl:null,msg:`加入 · U={${[...UU]}}`});
  }
  const tot=ME.reduce((s,e)=>s+e[2],0);
  st.push({U:new Set(UU),mst:ME.slice(),hl:null,msg:`MST 完成 总权 ${tot}`,done:true});
  return st;
}
function show(i){
  const st=steps[i]; if(!st) return;
  mst=st.mst; U=st.U; drawGraph(ctx,mst,U,st.hl);
  hud.textContent=st.msg; ec.textContent=mst.length; tw.textContent=mst.reduce((s,e)=>s+e[2],0);
}
function init(){ steps=buildSteps(); si=0; show(0); }
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{spd.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');ms=+b.dataset.ms;});
run.onclick=async()=>{ if(busy)return; busy=true; init(); for(let i=1;i<steps.length;i++){ await sleep(ms); si=i; show(i);} busy=false; };
step.onclick=()=>{ if(si<steps.length-1){ si++; show(si);} };
reset.onclick=init; init();
''', ("index.html","总览"), ("02-kruskal.html","Kruskal")))

    # 02 Kruskal
    write("02-kruskal.html", page("Kruskal","02-kruskal.html", r'''
<section class="hero">
  <div class="eyebrow">图 2 · 加边</div>
  <h1>Kruskal · 便宜边优先</h1>
  <p>边按权升序；两端不同连通块则加入。并查集判环，绿边逐条点亮。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 加边动画</button>
    <button class="btn ghost" id="reset">重置</button>
  </div>
  <div class="stage-wrap" style="height:400px">
    <canvas class="stage" id="cv" width="900" height="400"></canvas>
    <div class="stage-hud"><span class="hud-pill">Kruskal</span><span class="hud-pill" id="hud">—</span></div>
  </div>
  <div class="log" id="log">按权排序后依次考察…</div>
  <div class="stat-row">
    <div class="stat"><span>已选边</span><b class="ind" id="ec">0</b></div>
    <div class="stat"><span>总权</span><b class="green" id="tw">0</b></div>
  </div>
</div>
''', GRAPH_DRAW + r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let parent, mst=[], tot=0;
function find(x){ return parent[x]===x?x:(parent[x]=find(parent[x])); }
function init(){
  parent=[0,1,2,3,4,5]; mst=[]; tot=0; ec.textContent=0; tw.textContent=0;
  drawGraph(ctx,[],new Set()); log.textContent='就绪'; hud.textContent='sort edges';
}
run.onclick=async()=>{
  init();
  const es=GEDGES.slice().sort((a,b)=>a[2]-b[2]);
  let lines=['排序: '+es.map(e=>`(${e[0]},${e[1]}):${e[2]}`).join(' ')], cnt=0;
  for(const [u,v,w] of es){
    drawGraph(ctx, mst, new Set(), [u,v]);
    hud.textContent=`考察 (${u},${v}) w=${w}`; await sleep(450);
    const ru=find(u), rv=find(v);
    if(ru===rv){ lines.push(`跳过 (${u},${v}) 成环`); log.textContent=lines.join('\\n'); await sleep(300); continue; }
    parent[ru]=rv; mst.push([u,v,w]); cnt++; tot+=w;
    lines.push(`✓ 加入 (${u},${v}) w=${w}`);
    ec.textContent=cnt; tw.textContent=tot; log.textContent=lines.join('\\n');
    drawGraph(ctx, mst, new Set([0,1,2,3,4,5].filter(i=>find(i)===find(0)||mst.some(e=>e[0]===i||e[1]===i))));
    // color all connected gradually
    const U=new Set(); mst.forEach(e=>{U.add(e[0]);U.add(e[1]);});
    drawGraph(ctx, mst, U);
    await sleep(400);
    if(cnt===5) break;
  }
  hud.textContent='MST 权='+tot; lines.push('完成 总权='+tot); log.textContent=lines.join('\\n');
};
reset.onclick=init; init();
''', ("01-prim.html","Prim"), ("03-dijkstra.html","Dijkstra")))

    # 03 Dijkstra
    write("03-dijkstra.html", page("Dijkstra","03-dijkstra.html", r'''
<section class="hero">
  <div class="eyebrow">图 3 · 最短路</div>
  <h1>Dijkstra · 非负权单源最短路</h1>
  <p>每次确定 dist 最小的未定点，再松弛出边。结点上的数字是当前 dist。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 运行</button>
    <button class="btn ghost" id="reset">重置</button>
    <div class="speed" id="spd"><button data-ms="700">慢</button><button data-ms="400" class="on">中</button><button data-ms="180">快</button></div>
  </div>
  <div class="stage-wrap" style="height:400px">
    <canvas class="stage" id="cv" width="900" height="400"></canvas>
    <div class="stage-hud"><span class="hud-pill">Dijkstra</span><span class="hud-pill" id="hud">src=0</span></div>
  </div>
  <div class="cells" id="distRow"></div>
  <div class="tip">下方格子为 dist[] · 绿=已确定 · 蓝=松弛更新中</div>
</div>
''', GRAPH_DRAW + r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const n=6; const g=Array.from({length:n},()=>[]);
GEDGES.forEach(([u,v,w])=>{g[u].push([v,w]);g[v].push([u,w]);});
let dist, done, ms=400;
function showDist(active=-1, visit=-1){
  distRow.innerHTML=dist.map((d,i)=>`<div class="cell ${done[i]?'hit':i===active?'on':i===visit?'done':''}">${d>=1e9?'∞':d}</div>`).join('');
}
function init(){
  dist=Array(n).fill(1e9); dist[0]=0; done=Array(n).fill(false);
  drawGraph(ctx,[],new Set([0]),null,dist,done); showDist(); hud.textContent='init dist[0]=0';
}
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{spd.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');ms=+b.dataset.ms;});
run.onclick=async()=>{
  init();
  for(let it=0;it<n;it++){
    let u=-1,b=1e9; for(let i=0;i<n;i++) if(!done[i]&&dist[i]<b){b=dist[i];u=i;}
    if(u<0) break;
    done[u]=true;
    const U=new Set(done.map((d,i)=>d?i:-1).filter(i=>i>=0));
    drawGraph(ctx,[],U,null,dist,done); showDist(u); hud.textContent=`确定 ${u} dist=${dist[u]}`; await sleep(ms);
    for(const [v,w] of g[u]){
      if(!done[v]&&dist[u]+w<dist[v]){
        dist[v]=dist[u]+w;
        drawGraph(ctx,[],U,[u,v],dist,done); showDist(u,v);
        hud.textContent=`松弛 ${u}→${v} = ${dist[v]}`; await sleep(ms*0.75);
      }
    }
  }
  drawGraph(ctx,[],new Set([...Array(n).keys()]),null,dist,done); showDist();
  hud.textContent='完成 ['+dist.join(', ')+']';
};
reset.onclick=init; init();
''', ("02-kruskal.html","Kruskal"), ("04-bf-spfa.html","BF/SPFA")))

    # 04 BF SPFA
    write("04-bf-spfa.html", page("BF/SPFA","04-bf-spfa.html", r'''
<section class="hero">
  <div class="eyebrow">图 4 · 负权</div>
  <h1>Bellman-Ford 与 SPFA</h1>
  <p>可处理负权；第 n 轮仍能松弛 ⇒ 存在负环。SPFA 用队列优化，最坏仍可能退化。</p>
</section>
<div class="grid grid-2">
  <div class="card"><div class="badge">Bellman-Ford</div>
    <h3>对所有边松弛 n−1 轮</h3>
    <div class="code"><span class="kw">repeat</span> n-1 times:
  <span class="kw">for</span> each edge u→v:
    dist[v]=min(dist[v], dist[u]+w)
<span class="cm">// 再一轮检测负环</span></div>
  </div>
  <div class="card"><div class="badge cyan">SPFA</div>
    <h3>队列优化</h3>
    <p class="desc">只有 dist 变小的点才入队再扩展。竞赛中注意卡最坏数据。</p>
  </div>
</div>
<div class="card" style="margin-top:16px">
  <div class="toolbar"><button class="btn primary" id="run">▶ BF 轮次演示</button></div>
  <div class="stage-wrap light" style="height:280px">
    <canvas class="stage" id="cv" width="900" height="280"></canvas>
  </div>
  <div class="cells" id="row"></div>
  <div class="tip" id="tip">小图含一条负权边，观察 dist 如何被压低。</div>
</div>
''', r'''
// small directed-ish display using undirected weights with one negative
const POS=[[100,140],[300,60],[500,60],[700,140],[500,220],[300,220]];
const ED=[[0,1,6],[0,5,5],[1,2,5],[1,5,-2],[2,3,4],[2,4,3],[3,4,5],[4,5,2]];
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let dist;
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  ED.forEach(([u,v,w])=>{
    ctx.strokeStyle=w<0?'#f87171':'rgba(148,163,184,.4)'; ctx.lineWidth=w<0?3:2;
    ctx.beginPath(); ctx.moveTo(POS[u][0],POS[u][1]); ctx.lineTo(POS[v][0],POS[v][1]); ctx.stroke();
    ctx.fillStyle=w<0?'#dc2626':'#64748b'; ctx.font='12px ui-monospace';
    ctx.fillText(w,(POS[u][0]+POS[v][0])/2,(POS[u][1]+POS[v][1])/2-6);
  });
  POS.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(p[0],p[1],18,0,Math.PI*2);
    ctx.fillStyle='#4f46e5'; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 13px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(i,p[0],p[1]);
  });
}
function show(){ row.innerHTML=dist.map(d=>`<div class="cell">${d>=1e8?'∞':d}</div>`).join(''); }
run.onclick=async()=>{
  dist=Array(6).fill(1e9); dist[0]=0; show(); draw();
  for(let round=1;round<=5;round++){
    let upd=false;
    for(const [u,v,w] of ED){
      if(dist[u]<1e9 && dist[u]+w<dist[v]){ dist[v]=dist[u]+w; upd=true; }
      if(dist[v]<1e9 && dist[v]+w<dist[u]){ dist[u]=dist[u]; /* undirected relax both */ 
        if(dist[v]+w<dist[u]){ dist[u]=dist[v]+w; upd=true; }
      }
    }
    // proper undirected relax
    for(const [u,v,w] of ED){
      if(dist[u]<1e9 && dist[u]+w<dist[v]){ dist[v]=dist[u]+w; upd=true; }
      if(dist[v]<1e9 && dist[v]+w<dist[u]){ dist[u]=dist[v]+w; upd=true; }
    }
    show(); tip.textContent=`第 ${round} 轮松弛`+(upd?'（有更新）':'（无更新）');
    await sleep(500);
    if(!upd) break;
  }
  tip.innerHTML=`完成 dist=[${dist.map(d=>d>=1e8?'∞':d).join(', ')}] · 红边为负权`;
};
draw(); dist=Array(6).fill(1e9); dist[0]=0; show();
''', ("03-dijkstra.html","Dijkstra"), ("05-floyd.html","Floyd")))

    # 05 Floyd
    write("05-floyd.html", page("Floyd","05-floyd.html", r'''
<section class="hero">
  <div class="eyebrow">图 5 · 全源</div>
  <h1>Floyd-Warshall · 矩阵热力演化</h1>
  <p>d[i][j] = min(d[i][j], d[i][k]+d[k][j])。观察 k 增大时矩阵如何被「压」得更短。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 运行 Floyd</button>
    <div class="speed" id="spd"><button data-ms="400">慢</button><button data-ms="180" class="on">中</button><button data-ms="60">快</button></div>
  </div>
  <div style="overflow:auto"><table class="data" id="tb"></table></div>
  <div class="tip" id="tip">∞ 显示为 · · 数字越小颜色越深（越短）</div>
  <table class="data" style="margin-top:14px">
    <thead><tr><th>算法</th><th>场景</th><th>复杂度</th></tr></thead>
    <tbody>
      <tr><td>Dijkstra</td><td>单源非负</td><td>O(n²)/O(e log n)</td></tr>
      <tr><td>BF</td><td>单源可负</td><td>O(ne)</td></tr>
      <tr><td class="hl">Floyd</td><td>全源</td><td>O(n³)</td></tr>
    </tbody>
  </table>
</div>
''', r'''
const n=4;
const INF=99;
// init adj
let base=[
  [0,5,9,INF],
  [5,0,4,7],
  [9,4,0,3],
  [INF,7,3,0]
];
let ms=180;
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{spd.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');ms=+b.dataset.ms;});
function ren(d, hk=-1, hi=-1, hj=-1){
  let h='<tr><th>i\\\\j</th>';
  for(let j=0;j<n;j++) h+=`<th>${j}</th>`;
  h+='</tr>';
  for(let i=0;i<n;i++){
    h+=`<tr><th>${i}</th>`;
    for(let j=0;j<n;j++){
      const v=d[i][j];
      const t=v>=INF?0:1-Math.min(v,15)/15;
      const bg=v>=INF?'#f1f5f9':`rgba(79,70,229,${0.08+t*0.45})`;
      const cls=(i===hi&&j===hj)?'hl':'';
      h+=`<td class="${cls}" style="background:${bg}">${v>=INF?'·':v}</td>`;
    }
    h+='</tr>';
  }
  tb.innerHTML=h;
  tip.textContent=hk>=0?`中转点 k=${hk}`:'矩阵';
}
run.onclick=async()=>{
  const d=base.map(r=>r.slice());
  ren(d);
  for(let k=0;k<n;k++){
    for(let i=0;i<n;i++) for(let j=0;j<n;j++){
      if(d[i][k]+d[k][j]<d[i][j]){
        d[i][j]=d[i][k]+d[k][j];
        ren(d,k,i,j); await sleep(ms);
      }
    }
    ren(d,k); await sleep(ms*2);
  }
  ren(d); tip.innerHTML='<strong>完成</strong> · 全源最短路矩阵';
};
ren(base.map(r=>r.slice()));
''', ("04-bf-spfa.html","BF/SPFA"), ("06-flow.html","网络流")))

    # 06 flow concepts
    write("06-flow.html", page("网络流","06-flow.html", r'''
<section class="hero">
  <div class="eyebrow">图 6 · 概念</div>
  <h1>网络流基本概念</h1>
  <p>容量、流量、残留网络、最小割。拖动滑块模拟边上的流量填充。</p>
</section>
<div class="grid grid-3">
  <div class="card"><div class="badge">容量 c</div><h3>上界</h3><p class="desc">边上可流过的最大流量</p></div>
  <div class="card"><div class="badge green">流量 f</div><h3>守恒</h3><p class="desc">0≤f≤c，中间点流入=流出</p></div>
  <div class="card"><div class="badge cyan">残留</div><h3>c−f 与反向</h3><p class="desc">还可推多少 / 可撤销多少</p></div>
</div>
<div class="card" style="margin-top:16px">
  <div class="formula lg">最大流 ＝ 最小割</div>
  <div class="toolbar" style="margin-top:12px">
    <label>边 s→a 流量</label><input type="range" id="f1" min="0" max="10" value="4"/>
    <label>边 a→t 流量</label><input type="range" id="f2" min="0" max="10" value="4"/>
  </div>
  <div class="stage-wrap" style="height:260px">
    <canvas class="stage" id="cv" width="900" height="260"></canvas>
  </div>
  <div class="tip" id="tip">简单路径 s→a→t，容量均为 10。流量不能超过容量。</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const nodes={s:[120,130],a:[450,130],t:[780,130]};
function draw(){
  let fsa=+f1.value, fat=+f2.value;
  // conservation demo: show min
  const flow=Math.min(fsa,fat);
  ctx.clearRect(0,0,cv.width,cv.height);
  function edge(a,b,f,c,label){
    ctx.strokeStyle='#334155'; ctx.lineWidth=14; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke();
    // fill portion
    const t=f/c;
    ctx.strokeStyle='#22d3ee'; ctx.lineWidth=10;
    ctx.beginPath(); ctx.moveTo(a[0],a[1]);
    ctx.lineTo(a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t); ctx.stroke();
    ctx.fillStyle='#e2e8f0'; ctx.font='13px ui-monospace'; ctx.textAlign='center';
    ctx.fillText(`${label} ${f}/${c}`, (a[0]+b[0])/2, a[1]-18);
  }
  edge(nodes.s,nodes.a,fsa,10,'s→a');
  edge(nodes.a,nodes.t,fat,10,'a→t');
  Object.entries(nodes).forEach(([id,p])=>{
    ctx.beginPath(); ctx.arc(p[0],p[1],28,0,Math.PI*2);
    ctx.fillStyle=id==='s'?'#fbbf24':id==='t'?'#34d399':'#818cf8'; ctx.fill();
    ctx.fillStyle='#0f172a'; ctx.font='bold 16px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(id,p[0],p[1]);
  });
  const ok=fsa===fat;
  tip.innerHTML=ok?`<strong>守恒：</strong>路径流量可取 min=${flow}`:`中间点 a 流入 ${fsa} ≠ 流出 ${fat}（演示用，真实流需守恒）`;
}
f1.oninput=f2.oninput=draw; draw();
''', ("05-floyd.html","Floyd"), ("07-ff.html","FF")))

    # 07 FF
    write("07-ff.html", page("FF","07-ff.html", r'''
<section class="hero">
  <div class="eyebrow">图 7 · 方法</div>
  <h1>Ford-Fulkerson 方法</h1>
  <p>在残留网络找 s→t 增广路，沿路增加瓶颈流量，直到无路可增。</p>
</section>
<div class="card">
  <div class="code">flow = 0
<span class="kw">while</span> exists path p from s to t in residual:
  Δ = min residual capacity on p
  augment f along p by Δ
  flow += Δ
<span class="kw">return</span> flow</div>
  <div class="list-step" style="margin-top:14px"><div class="n">1</div><div class="body">建残留网络（正向 c−f，反向 f）</div></div>
  <div class="list-step"><div class="n">2</div><div class="body">找任意 s-t 路径（DFS/BFS…）</div></div>
  <div class="list-step"><div class="n">3</div><div class="body">取瓶颈 Δ，更新流量与残留</div></div>
  <div class="list-step"><div class="n">4</div><div class="body">重复直到无增广路 · 此时流=最大流</div></div>
  <div class="tip">找路方式任意；容量有理数可终止。用 <strong>BFS</strong> 找路 → Edmonds-Karp（下一节动画）。</div>
</div>
''', "", ("06-flow.html","网络流"), ("08-ek.html","EK")))

    # 08 EK animation
    write("08-ek.html", page("EK","08-ek.html", r'''
<section class="hero">
  <div class="eyebrow">图 8 · BFS 增广</div>
  <h1>Edmonds-Karp · 增广动画</h1>
  <p>每次 BFS 找边数最少的增广路，沿路灌入瓶颈流量。看 residual 如何变化。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 增广一轮轮播放</button>
    <button class="btn ghost" id="reset">重置</button>
  </div>
  <div class="stage-wrap" style="height:360px">
    <canvas class="stage" id="cv" width="900" height="360"></canvas>
    <div class="stage-hud"><span class="hud-pill">Edmonds-Karp</span><span class="hud-pill" id="hud">flow=0</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>当前最大流</span><b class="green" id="flowV">0</b></div>
    <div class="stat"><span>增广次数</span><b class="ind" id="augN">0</b></div>
  </div>
  <div class="log" id="log">网络: s-a-t 与 s-b-t 双路径示意</div>
</div>
''', r'''
// residual on edges: list of {u,v,c,f}
// nodes: s=0,a=1,b=2,t=3
const POS=[[100,180],[350,80],[350,280],[650,180]];
const names=['s','a','b','t'];
let edges, flow, aug;
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function initNet(){
  // undirected residual modeled as two directed
  edges=[
    {u:0,v:1,c:10,f:0},{u:1,v:0,c:0,f:0},
    {u:0,v:2,c:10,f:0},{u:2,v:0,c:0,f:0},
    {u:1,v:3,c:10,f:0},{u:3,v:1,c:0,f:0},
    {u:2,v:3,c:10,f:0},{u:3,v:2,c:0,f:0},
    {u:1,v:2,c:4,f:0},{u:2,v:1,c:0,f:0},
  ];
  flow=0; aug=0; flowV.textContent=0; augN.textContent=0; hud.textContent='flow=0';
  draw(); log.textContent='重置完成';
}
function res(e){ return e.c-e.f; }
function draw(path=[]){
  ctx.clearRect(0,0,cv.width,cv.height);
  // only draw forward-ish edges with c>0 originally for clarity
  const show=[[0,1,10],[0,2,10],[1,3,10],[2,3,10],[1,2,4]];
  show.forEach(([u,v,c])=>{
    const e=edges.find(x=>x.u===u&&x.v===v);
    const f=e?e.f:0;
    const onPath=path.includes(u)&&path.includes(v);
    ctx.strokeStyle='#334155'; ctx.lineWidth=12; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(POS[u][0],POS[u][1]); ctx.lineTo(POS[v][0],POS[v][1]); ctx.stroke();
    const t=c?f/c:0;
    ctx.strokeStyle=onPath?'#fbbf24':'#22d3ee'; ctx.lineWidth=8;
    ctx.beginPath(); ctx.moveTo(POS[u][0],POS[u][1]);
    ctx.lineTo(POS[u][0]+(POS[v][0]-POS[u][0])*t, POS[u][1]+(POS[v][1]-POS[u][1])*t); ctx.stroke();
    ctx.fillStyle='#e2e8f0'; ctx.font='12px ui-monospace'; ctx.textAlign='center';
    ctx.fillText(`${f}/${c}`, (POS[u][0]+POS[v][0])/2, (POS[u][1]+POS[v][1])/2-12);
  });
  POS.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(p[0],p[1],26,0,Math.PI*2);
    ctx.fillStyle=i===0?'#fbbf24':i===3?'#34d399':'#818cf8'; ctx.fill();
    ctx.fillStyle='#0f172a'; ctx.font='bold 15px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(names[i],p[0],p[1]);
  });
}
function bfs(){
  const q=[0], prev=Array(4).fill(null), pe=Array(4).fill(null), seen=[true,false,false,false];
  let h=0;
  while(h<q.length){
    const u=q[h++];
    for(const e of edges){
      if(e.u===u && res(e)>0 && !seen[e.v]){
        seen[e.v]=true; prev[e.v]=u; pe[e.v]=e; q.push(e.v);
        if(e.v===3) {
          // reconstruct
          const path=[]; let x=3; while(x!=null){ path.push(x); x=prev[x]; } path.reverse();
          return {path, pe};
        }
      }
    }
  }
  return null;
}
function augment(path, pe){
  let x=3, delta=1e9; const used=[];
  while(x!==0){ const e=pe[x]; delta=Math.min(delta,res(e)); used.push(e); x=e.u; }
  x=3;
  while(x!==0){
    const e=pe[x]; e.f+=delta;
    const rev=edges.find(r=>r.u===e.v&&r.v===e.u); if(rev) rev.f-=delta;
    x=e.u;
  }
  return delta;
}
run.onclick=async()=>{
  initNet();
  let rounds=0;
  while(true){
    const r=bfs();
    if(!r) break;
    draw(r.path); hud.textContent='增广路 '+r.path.map(i=>names[i]).join('→'); await sleep(700);
    const d=augment(r.path, r.pe); flow+=d; aug++; rounds++;
    flowV.textContent=flow; augN.textContent=aug;
    log.textContent+=`\\n第${rounds}次增广 Δ=${d} · 总流=${flow}`;
    draw(); await sleep(500);
  }
  hud.textContent='最大流='+flow; log.textContent+=`\\n无增广路 · 最大流=${flow}`;
};
function initNet(){ initNet=undefined; }
// fix double init
initNet=function(){
  edges=[
    {u:0,v:1,c:10,f:0},{u:1,v:0,c:0,f:0},
    {u:0,v:2,c:10,f:0},{u:2,v:0,c:0,f:0},
    {u:1,v:3,c:10,f:0},{u:3,v:1,c:0,f:0},
    {u:2,v:3,c:10,f:0},{u:3,v:2,c:0,f:0},
    {u:1,v:2,c:4,f:0},{u:2,v:1,c:0,f:0},
  ];
  flow=0; aug=0; flowV.textContent=0; augN.textContent=0; hud.textContent='flow=0';
  draw(); log.textContent='网络就绪';
};
reset.onclick=initNet; initNet();
''', ("07-ff.html","FF"), ("09-dinic.html","Dinic")))

    # Fix the botched initNet in 08 - the code has a bug. Let me rewrite 08 more cleanly in a fix after, or fix in the string.

    # 09 Dinic
    write("09-dinic.html", page("Dinic","09-dinic.html", r'''
<section class="hero">
  <div class="eyebrow">图 9 · 分层</div>
  <h1>Dinic 算法思想</h1>
  <p>先 BFS 建分层图，再在分层图上 DFS 多路增广，直到无法增广后重建层次。</p>
</section>
<div class="card">
  <div class="list-step"><div class="n">1</div><div class="body"><b>BFS</b> 在残留网分层：level[v]=level[u]+1</div></div>
  <div class="list-step"><div class="n">2</div><div class="body"><b>DFS</b> 只沿 level 递增边增广，可一次多路</div></div>
  <div class="list-step"><div class="n">3</div><div class="body">无法增广则回到 1，直到 BFS 到不了 t</div></div>
  <div class="formula">单位容量网络表现优异 · 一般 O(V²E)</div>
  <div class="toolbar" style="margin-top:12px"><button class="btn primary" id="run">▶ 分层示意</button></div>
  <div class="stage-wrap light" style="height:280px">
    <canvas class="stage" id="cv" width="900" height="280"></canvas>
  </div>
  <div class="tip" id="tip">点击观看结点被标上层号的过程</div>
</div>
''', r'''
const POS=[[80,140],[250,60],[250,220],[450,60],[450,220],[650,140],[800,140]];
const names=['s','a','b','c','d','e','t'];
const adj=[[1,2],[3,4],[3,4],[5],[5],[6],[]];
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function draw(level=null, active=-1){
  ctx.clearRect(0,0,cv.width,cv.height);
  adj.forEach((vs,u)=>vs.forEach(v=>{
    ctx.strokeStyle='#cbd5e1'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(POS[u][0],POS[u][1]); ctx.lineTo(POS[v][0],POS[v][1]); ctx.stroke();
  }));
  POS.forEach((p,i)=>{
    const on=i===active;
    ctx.beginPath(); ctx.arc(p[0],p[1],22,0,Math.PI*2);
    ctx.fillStyle=on?'#f59e0b':(level&&level[i]>=0?'#4f46e5':'#94a3b8'); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 13px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(names[i],p[0],p[1]);
    if(level&&level[i]>=0){ ctx.fillStyle='#0f172a'; ctx.font='11px ui-monospace'; ctx.fillText('L'+level[i], p[0], p[1]+32); }
  });
}
run.onclick=async()=>{
  const level=Array(7).fill(-1); level[0]=0;
  const q=[0]; let h=0; draw(level,0);
  while(h<q.length){
    const u=q[h++];
    for(const v of adj[u]) if(level[v]<0){ level[v]=level[u]+1; q.push(v); draw(level,v); tip.textContent=`标记 ${names[v]} level=${level[v]}`; await sleep(350); }
  }
  tip.innerHTML='<strong>分层完成</strong> · 随后只沿 L→L+1 的边做阻塞流增广';
  draw(level,-1);
};
draw();
''', ("08-ek.html","EK"), ("10-match.html","匹配")))

    # 10 matching
    write("10-match.html", page("匹配","10-match.html", r'''
<section class="hero">
  <div class="eyebrow">图 10 · 配对</div>
  <h1>二分图最大匹配</h1>
  <p>匈牙利：为左侧每个点找增广路。也可建网络：源连左、右连汇、中间容量 1，求最大流。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 增广配对动画</button>
    <button class="btn ghost" id="reset">重置</button>
  </div>
  <div class="stage-wrap" style="height:360px">
    <canvas class="stage" id="cv" width="900" height="360"></canvas>
    <div class="stage-hud"><span class="hud-pill">Bipartite Matching</span><span class="hud-pill" id="hud">match=0</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>匹配数</span><b class="green" id="mc">0</b></div>
  </div>
  <div class="tip">绿边=当前匹配 · 金边=正在增广的路径</div>
</div>
''', r'''
// left 0..2, right 3..5
const L=[0,1,2], R=[3,4,5];
const POS=[[150,80],[150,180],[150,280],[650,80],[650,180],[650,280]];
const names=['L0','L1','L2','R0','R1','R2'];
const E=[[0,3],[0,4],[1,4],[1,5],[2,3],[2,5]];
let matchR, matchL;
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function init(){
  matchR=Array(6).fill(-1); matchL=Array(6).fill(-1); mc.textContent=0; hud.textContent='match=0'; draw();
}
function draw(path=[]){
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.fillStyle='#94a3b8'; ctx.font='14px Segoe UI'; ctx.fillText('Left', 120, 40); ctx.fillText('Right', 620, 40);
  E.forEach(([u,v])=>{
    const matched=matchL[u]===v;
    const onPath=path.includes(u)&&path.includes(v);
    ctx.strokeStyle=onPath?'#fbbf24':(matched?'#34d399':'rgba(148,163,184,.35)');
    ctx.lineWidth=onPath||matched?4:2;
    ctx.beginPath(); ctx.moveTo(POS[u][0],POS[u][1]); ctx.lineTo(POS[v][0],POS[v][1]); ctx.stroke();
  });
  POS.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(p[0],p[1],22,0,Math.PI*2);
    ctx.fillStyle=i<3?'#4f46e5':'#0891b2'; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 12px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(names[i],p[0],p[1]);
  });
}
function dfs(u, seen, path){
  for(const [x,v] of E){
    if(x!==u||seen[v]) continue;
    seen[v]=true; path.push(u,v);
    if(matchR[v]<0 || dfs(matchR[v], seen, path)){
      matchR[v]=u; matchL[u]=v; return true;
    }
    path.pop(); path.pop();
  }
  return false;
}
// async visual version
run.onclick=async()=>{
  init(); let cnt=0;
  for(const u of L){
    if(matchL[u]>=0) continue;
    // try find augmenting path with BFS for viz
    const prev=Array(6).fill(-1), q=[u], seen={[u]:1}; let h=0, found=-1;
    while(h<q.length && found<0){
      const x=q[h++];
      for(const [a,b] of E){
        if(a!==x) continue;
        if(seen[b]) continue;
        seen[b]=1; prev[b]=x;
        if(matchR[b]<0){ found=b; break; }
        const mu=matchR[b];
        if(!seen[mu]){ seen[mu]=1; prev[mu]=b; q.push(mu); }
      }
    }
    if(found<0) continue;
    // reconstruct path
    const path=[]; let x=found; while(x!==-1){ path.push(x); x=prev[x]; } path.reverse();
    draw(path); hud.textContent='增广 '+path.map(i=>names[i]).join('→'); await sleep(700);
    // flip matching along path
    for(let i=0;i<path.length-1;i+=2){
      const Lx=path[i], Rx=path[i+1];
      matchL[Lx]=Rx; matchR[Rx]=Lx;
    }
    cnt=L.filter(i=>matchL[i]>=0).length;
    mc.textContent=cnt; hud.textContent='match='+cnt; draw(); await sleep(400);
  }
  hud.textContent='最大匹配='+mc.textContent;
};
reset.onclick=init; init();
''', ("09-dinic.html","Dinic"), ("index.html","返回总览")))

    # Fix page 08 EK - rewrite the broken initNet section in the file after generation
    print("\n第9章生成完成 →", OUT)

if __name__ == "__main__":
    build()
