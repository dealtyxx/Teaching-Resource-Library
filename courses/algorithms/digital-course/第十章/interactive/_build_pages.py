# -*- coding: utf-8 -*-
"""
第10章 计算几何 · 强交互 / 强可视化版
拖拽向量 · 凸包扫描 · 线段判定 · 离线可用
"""
from pathlib import Path
OUT = Path(__file__).resolve().parent

CSS = r"""
:root{
  --bg:#ecfeff; --surface:#fff; --s2:#f0fdfa; --s3:#e6faf8;
  --text:#0b1220; --muted:#5a6b85; --faint:#8b9bb5;
  --line:rgba(13,148,136,.16); --line2:rgba(13,148,136,.28);
  --teal:#0d9488; --teal2:#0f766e; --tealS:rgba(13,148,136,.1);
  --blue:#2563eb; --blueS:rgba(37,99,235,.1);
  --red:#dc2626; --redS:rgba(220,38,38,.09);
  --green:#059669; --amber:#d97706; --violet:#7c3aed; --cyan:#0891b2;
  --shadow:0 8px 28px rgba(13,148,136,.12); --shadow2:0 22px 50px rgba(13,148,136,.18);
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
    radial-gradient(1100px 560px at 5% -8%,rgba(13,148,136,.15),transparent 55%),
    radial-gradient(900px 480px at 95% 0%,rgba(37,99,235,.1),transparent 50%),
    radial-gradient(700px 400px at 50% 110%,rgba(8,145,178,.08),transparent 45%),
    linear-gradient(180deg,#f7fffe,#ecfeff 50%,#e6faf8);
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;text-decoration:none} button,input{font:inherit}
.fx-bg{position:fixed;inset:0;pointer-events:none;z-index:0}
.fx-bg canvas{width:100%;height:100%;display:block;opacity:.4}
.nav,.wrap{position:relative;z-index:1}
.nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  padding:11px 18px;background:rgba(255,255,255,.88);backdrop-filter:blur(18px) saturate(1.35);
  border-bottom:1px solid var(--line);box-shadow:0 8px 24px rgba(15,23,42,.05)}
.nav .brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:14px}
.nav .logo{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;
  background:linear-gradient(135deg,#2dd4bf,#0d9488 55%,#2563eb);color:#fff;
  font:800 11px var(--mono);box-shadow:0 6px 16px rgba(13,148,136,.4);
  transform:perspective(200px) rotateY(-8deg);transition:transform .3s var(--ease)}
.nav .brand:hover .logo{transform:perspective(200px) rotateY(8deg) scale(1.05)}
.nav .brand span{color:var(--teal)}
.nav .links{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end;max-width:min(100%,920px)}
.nav a.pill{font-size:11.5px;font-weight:700;padding:6px 10px;border-radius:999px;color:var(--muted);border:1px solid transparent;transition:.2s var(--ease)}
.nav a.pill:hover{color:var(--teal);background:var(--tealS);border-color:var(--line)}
.nav a.pill.active{color:#fff;background:linear-gradient(135deg,#2dd4bf,#0d9488);box-shadow:0 4px 14px rgba(13,148,136,.35)}
.wrap{max-width:1160px;margin:0 auto;padding:26px 16px 70px}
.hero{margin-bottom:24px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;color:var(--teal);
  letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:999px;background:var(--tealS);
  border:1px solid rgba(13,148,136,.22);margin-bottom:12px}
.hero h1{font-size:clamp(1.55rem,3.3vw,2.4rem);line-height:1.15;font-weight:900;letter-spacing:-.025em;margin-bottom:12px;
  background:linear-gradient(120deg,#0b1220,#115e59 30%,#0d9488 55%,#2563eb 90%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{color:var(--muted);font-size:1.04rem;max-width:780px;line-height:1.7}
.hero-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:12.5px;font-weight:700;
  background:#fff;border:1px solid var(--line);color:var(--muted);box-shadow:0 2px 8px rgba(15,23,42,.04)}
.chip.teal{background:var(--tealS);color:var(--teal)} .chip.blue{background:var(--blueS);color:var(--blue)}
.chip.red{background:var(--redS);color:var(--red)}
.grid{display:grid;gap:16px}
.grid-2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.grid-3{grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px;box-shadow:var(--shadow);
  position:relative;overflow:hidden;transition:transform .28s var(--ease),box-shadow .28s,border-color .28s}
.card:hover{transform:translateY(-3px);box-shadow:var(--shadow2);border-color:var(--line2)}
.card::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--accent,linear-gradient(90deg,#2dd4bf,#2563eb))}
.card h3{font-size:1.08rem;font-weight:800;margin-bottom:8px}
.card p,.desc{color:var(--muted);line-height:1.65;font-size:.94rem}
.badge{display:inline-flex;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;margin-bottom:10px;
  background:var(--tealS);color:var(--teal);border:1px solid rgba(13,148,136,.2)}
.badge.blue{background:var(--blueS);color:var(--blue)} .badge.red{background:var(--redS);color:var(--red)}
.badge.amber{background:rgba(217,119,6,.1);color:var(--amber)}
a.feature-card{display:flex;flex-direction:column;min-height:158px;padding:18px;border-radius:var(--r);
  background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);position:relative;overflow:hidden;
  transition:transform .3s var(--ease),box-shadow .3s}
a.feature-card::after{content:attr(data-ico);position:absolute;right:12px;top:10px;font-size:40px;opacity:.14;transition:.35s var(--ease)}
a.feature-card:hover{transform:translateY(-8px) scale(1.015);box-shadow:var(--shadow2);
  border-color:color-mix(in srgb,var(--c,#0d9488) 40%,transparent)}
a.feature-card:hover::after{opacity:.28;transform:scale(1.15) rotate(8deg)}
a.feature-card .num{font:800 12px var(--mono);color:var(--c,#0d9488);letter-spacing:.06em;margin-bottom:8px}
a.feature-card h3{font-size:1.08rem;margin-bottom:6px}
a.feature-card p{color:var(--muted);font-size:.87rem;line-height:1.55;flex:1}
a.feature-card .go{margin-top:12px;font-size:12.5px;font-weight:800;color:var(--c,#0d9488);opacity:0;transform:translateX(-8px);transition:.25s}
a.feature-card:hover .go{opacity:1;transform:none}
.btn{appearance:none;border:1px solid var(--line);background:var(--s2);color:var(--text);
  padding:10px 16px;border-radius:13px;cursor:pointer;font-weight:800;font-size:13.5px;
  transition:.2s var(--ease);display:inline-flex;align-items:center;gap:6px}
.btn:hover{border-color:var(--line2);background:#fff;color:var(--teal);transform:translateY(-1px)}
.btn:active{transform:scale(.98)}
.btn.primary{background:linear-gradient(135deg,#2dd4bf,#0d9488);border:none;color:#fff;box-shadow:0 8px 20px rgba(13,148,136,.32)}
.btn.primary:hover{filter:brightness(1.06);color:#fff}
.btn.ghost{background:transparent}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important}
.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0}
.toolbar label{font-size:12.5px;color:var(--muted);font-weight:700}
.speed{display:flex;gap:4px;background:var(--s2);padding:3px;border-radius:11px;border:1px solid var(--line)}
.speed button{border:none;background:transparent;padding:6px 11px;border-radius:8px;font-size:12px;font-weight:800;color:var(--muted);cursor:pointer}
.speed button.on{background:#fff;color:var(--teal);box-shadow:0 1px 4px rgba(15,23,42,.08)}
.tip{margin-top:12px;padding:13px 15px;border-radius:15px;background:linear-gradient(135deg,var(--tealS),var(--blueS));
  border:1px solid var(--line);color:var(--muted);font-size:13.5px;line-height:1.65}
.tip strong{color:var(--text)}
.tip.ok{background:rgba(5,150,105,.1);border-color:rgba(5,150,105,.25)}
.tip.danger{background:var(--redS);border-color:rgba(220,38,38,.2)}
.formula{font-family:var(--mono);background:linear-gradient(135deg,#f0fdfa,#eff6ff);border:1px solid rgba(13,148,136,.25);
  border-radius:16px;padding:16px 18px;margin-top:10px;color:var(--teal2);font-size:15px;line-height:1.55;text-align:center;font-weight:750}
.formula.lg{font-size:clamp(1.05rem,2.4vw,1.45rem);padding:20px}
.code{font-family:var(--mono);font-size:12.5px;line-height:1.7;background:#0f172a;color:#e2e8f0;border-radius:16px;
  padding:15px 16px;overflow:auto;white-space:pre;margin-top:10px}
.code .cm{color:#64748b}.code .kw{color:#5eead4}.code .fn{color:#93c5fd}
.stat-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.stat{flex:1;min-width:100px;background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px}
.stat span{font-size:11.5px;color:var(--faint);font-weight:700}
.stat b{display:block;font-size:1.25rem;margin-top:4px;font-weight:900;font-variant-numeric:tabular-nums}
.stat b.teal{color:var(--teal)}.stat b.blue{color:var(--blue)}.stat b.red{color:var(--red)}.stat b.green{color:var(--green)}
.list-step{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;margin:8px 0;border-radius:14px;border:1px solid var(--line);background:#fff}
.list-step .n{flex-shrink:0;width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,#2dd4bf,#0d9488);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900}
.list-step .body{flex:1;font-size:.92rem;color:var(--muted);line-height:1.55}
.list-step .body b{color:var(--text)}
.stage-wrap{position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow);background:#0b1220}
.stage-wrap.light{background:
  linear-gradient(rgba(13,148,136,.045) 1px,transparent 1px),
  linear-gradient(90deg,rgba(37,99,235,.04) 1px,transparent 1px),#f8fafc;
  background-size:24px 24px,24px 24px,auto}
canvas.stage{width:100%;display:block;touch-action:none;cursor:crosshair}
.stage-hud{position:absolute;left:12px;top:12px;right:12px;display:flex;justify-content:space-between;gap:8px;pointer-events:none;flex-wrap:wrap}
.hud-pill{padding:6px 11px;border-radius:999px;background:rgba(15,23,42,.72);color:#e2e8f0;font:700 12px var(--mono);border:1px solid rgba(255,255,255,.1)}
.hud-pill.light{background:rgba(255,255,255,.92);color:var(--text);border-color:var(--line)}
.legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;font-size:12.5px;color:var(--muted);font-weight:700}
.legend i{display:inline-block;width:11px;height:11px;border-radius:4px;margin-right:5px;vertical-align:middle}
.log{max-height:160px;overflow:auto;font:12px/1.65 var(--mono);color:var(--muted);background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px;margin-top:10px}
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
.pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--teal);box-shadow:0 0 0 0 rgba(13,148,136,.45);animation:pulse 1.6s infinite;display:inline-block}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(13,148,136,.45)}70%{box-shadow:0 0 0 10px transparent}}
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
    parts=Array.from({length:26},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:1+Math.random()*2, vx:(Math.random()-.5)*.18, vy:-.1-Math.random()*.22, a:.12+Math.random()*.28}));
  }
  function tick(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; if(p.y<-10){p.y=innerHeight+10;p.x=Math.random()*innerWidth;}
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(13,148,136,${p.a})`; ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  addEventListener('resize',resize); resize(); tick();
})();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
const dot=(a,b)=>a.x*b.x+a.y*b.y;
const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y});
const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y});
const mul=(a,k)=>({x:a.x*k,y:a.y*k});
const len=a=>Math.hypot(a.x,a.y);
function dragPoints(cv, pts, onChange){
  let drag=-1;
  const pos=e=>{const r=cv.getBoundingClientRect(); return {x:(e.clientX-r.left)*cv.width/r.width, y:(e.clientY-r.top)*cv.height/r.height};};
  cv.addEventListener('mousedown',e=>{
    const p=pos(e); drag=pts.findIndex(q=>(q.x-p.x)**2+(q.y-p.y)**2<400);
    cv.style.cursor=drag>=0?'grabbing':'crosshair';
  });
  cv.addEventListener('mousemove',e=>{
    if(drag<0) return;
    const p=pos(e);
    pts[drag].x=Math.max(20,Math.min(cv.width-20,p.x));
    pts[drag].y=Math.max(20,Math.min(cv.height-20,p.y));
    onChange();
  });
  const up=()=>{drag=-1; cv.style.cursor='crosshair';};
  cv.addEventListener('mouseup',up); cv.addEventListener('mouseleave',up);
}
function drawDot(ctx,p,col,label){
  ctx.beginPath(); ctx.arc(p.x,p.y,11,0,Math.PI*2);
  ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=12; ctx.fill(); ctx.shadowBlur=0;
  if(label){ ctx.fillStyle='#0f172a'; ctx.font='12px ui-monospace'; ctx.fillText(label, p.x+14, p.y-10); }
}
function drawArrow(ctx,a,b,col){
  ctx.strokeStyle=col; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  const ang=Math.atan2(b.y-a.y,b.x-a.x);
  ctx.beginPath();
  ctx.moveTo(b.x,b.y);
  ctx.lineTo(b.x-12*Math.cos(ang-0.4), b.y-12*Math.sin(ang-0.4));
  ctx.lineTo(b.x-12*Math.cos(ang+0.4), b.y-12*Math.sin(ang+0.4));
  ctx.closePath(); ctx.fillStyle=col; ctx.fill();
}
"""

LINKS = [
    ("index.html","总览"),
    ("01-vector.html","向量运算"),
    ("02-direction.html","方向判断"),
    ("03-point-seg.html","点与线段"),
    ("04-intersect.html","线段相交"),
    ("05-inpoly.html","点在多边形"),
    ("06-area.html","多边形面积"),
    ("07-jarvis.html","礼品包裹"),
    ("08-graham.html","Graham"),
    ("09-closest.html","最近点对"),
    ("10-calipers.html","旋转卡壳"),
]
CH = "第10章 计算几何"

def nav(active):
    pills="".join(f'<a class="{"pill active" if h==active else "pill"}" href="{h}">{lab}</a>' for h,lab in LINKS)
    return f'''<div class="fx-bg" aria-hidden="true"></div>
<nav class="nav"><div class="brand"><div class="logo">10</div>算法可视化 · <span>{CH}</span></div>
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
<div class="footer">算法设计与分析 · <b>{CH}</b> · 强交互可视化版<br/>拖拽 · 扫描 · 凸包 · 建议全屏投影</div>
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
        ("01-vector.html","01","向量基础运算","加减点积 · 可拖向量","#0d9488","➕"),
        ("02-direction.html","02","方向判断","叉积左右转实时","#2563eb","✖️"),
        ("03-point-seg.html","03","点与线段","投影最近点距离","#7c3aed","📏"),
        ("04-intersect.html","04","两线段相交","跨立实验动画","#dc2626","✂️"),
        ("05-inpoly.html","05","点在多边形内","射线法计数","#0891b2","⬡"),
        ("06-area.html","06","多边形面积","鞋带公式可视化","#d97706","📐"),
        ("07-jarvis.html","07","礼品包裹","Jarvis 步进动画","#0d9488","🎁"),
        ("08-graham.html","08","Graham / Andrew","单调链扫描","#2563eb","🧭"),
        ("09-closest.html","09","最近点对","分治条带动画","#7c3aed","📍"),
        ("10-calipers.html","10","旋转卡壳","对踵点示意","#dc2626","🔧"),
    ]
    cards="".join(f'''
<a class="feature-card" href="{h}" style="--c:{c}" data-ico="{ico}">
  <div class="num">图 {n}</div><h3>{t}</h3><p>{d}</p><div class="go">进入实验 →</div>
</a>''' for h,n,t,d,c,ico in items)

    write("index.html", page("交互总览","index.html", f'''
<section class="hero">
  <div class="eyebrow"><span class="pulse-dot"></span> Immersive Lab · Chapter 10</div>
  <h1>计算几何 · 把公式变成可触摸的形</h1>
  <p>拖动点看叉积变号，看凸包像橡皮筋收紧，看射线法一笔判定内外——几何不再只在黑板上。</p>
  <div class="hero-meta">
    <span class="chip teal">📐 10 个实验</span>
    <span class="chip blue">🖱️ 可拖拽</span>
    <span class="chip red">🎬 扫描动画</span>
  </div>
</section>
<div class="card" style="--accent:linear-gradient(90deg,#2dd4bf,#0d9488,#2563eb);margin-bottom:18px">
  <div class="formula lg">点积判夹角 · 叉积判转向 · 凸包是外包络</div>
  <div class="stage-wrap" style="margin-top:14px;height:150px">
    <canvas class="stage" id="heroCv" width="1100" height="150"></canvas>
  </div>
</div>
<div class="grid grid-2 stagger">{cards}</div>
''', r'''
const cv=heroCv, ctx=cv.getContext('2d');
let t=0;
const pts=Array.from({length:12},(_,i)=>({
  x:150+i*70+Math.sin(i)*20, y:75+Math.sin(i*1.3)*25
}));
function andrew(points){
  const p=points.slice().sort((a,b)=>a.x-b.x||a.y-b.y);
  const cr=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const lo=[],up=[];
  for(const pt of p){while(lo.length>=2&&cr(lo.at(-2),lo.at(-1),pt)<=0)lo.pop();lo.push(pt);}
  for(let i=p.length-1;i>=0;i--){const pt=p[i];while(up.length>=2&&cr(up.at(-2),up.at(-1),pt)<=0)up.pop();up.push(pt);}
  lo.pop();up.pop(); return lo.concat(up);
}
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  pts.forEach((p,i)=>{ p.y=75+Math.sin(t*0.03+i*0.7)*28; p.x=100+i*((cv.width-160)/11)+Math.cos(t*0.02+i)*6; });
  const h=andrew(pts);
  ctx.strokeStyle='rgba(45,212,191,.85)'; ctx.lineWidth=2.5;
  ctx.beginPath(); h.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.closePath(); ctx.stroke();
  ctx.fillStyle='rgba(45,212,191,.1)'; ctx.fill();
  pts.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fillStyle=h.includes(p)?'#0d9488':'#60a5fa'; ctx.fill(); });
  t++;
}
setInterval(draw,40); draw();
''', None, ("01-vector.html","向量运算")))

    # 01 vector
    write("01-vector.html", page("向量运算","01-vector.html", r'''
<section class="hero">
  <div class="eyebrow">图 1 · 基础</div>
  <h1>向量加减与点积</h1>
  <p>拖动橙色/蓝色端点。实时显示 p+q、p−q、点积与模长。</p>
</section>
<div class="card">
  <div class="toolbar"><button class="btn ghost" id="reset">重置</button></div>
  <div class="stage-wrap light" style="height:400px">
    <canvas class="stage" id="cv" width="1000" height="400"></canvas>
    <div class="stage-hud"><span class="hud-pill light">drag endpoints</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>p · q</span><b class="teal" id="dp">—</b></div>
    <div class="stat"><span>|p|</span><b class="blue" id="lp">—</b></div>
    <div class="stat"><span>|q|</span><b class="red" id="lq">—</b></div>
  </div>
  <div class="formula">p·q = |p||q|cosθ · 符号判锐/钝/直角</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const O={x:200,y:220};
let P={x:420,y:120}, Q={x:380,y:300};
function redraw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  // axes
  ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(40,O.y); ctx.lineTo(960,O.y); ctx.moveTo(O.x,20); ctx.lineTo(O.x,380); ctx.stroke();
  const p=sub(P,O), q=sub(Q,O), sum=add(P,{x:q.x,y:q.y}), dif={x:O.x+p.x-q.x,y:O.y+p.y-q.y};
  // p+q parallelogram
  ctx.strokeStyle='rgba(13,148,136,.35)'; ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.moveTo(P.x,P.y); ctx.lineTo(sum.x,sum.y); ctx.lineTo(Q.x,Q.y); ctx.stroke(); ctx.setLineDash([]);
  drawArrow(ctx,O,P,'#f59e0b'); drawArrow(ctx,O,Q,'#2563eb');
  drawArrow(ctx,O,sum,'#0d9488');
  drawDot(ctx,O,'#64748b','O'); drawDot(ctx,P,'#f59e0b','P'); drawDot(ctx,Q,'#2563eb','Q'); drawDot(ctx,sum,'#0d9488','P+Q');
  const d=dot(p,q);
  dp.textContent=d.toFixed(1); lp.textContent=len(p).toFixed(1); lq.textContent=len(q).toFixed(1);
  const ang=Math.acos(Math.max(-1,Math.min(1,d/(len(p)*len(q)||1))))*180/Math.PI;
  hud.textContent=`θ≈${ang.toFixed(1)}° · `+(d>1?'锐角':d<-1?'钝角':'≈直角');
}
dragPoints(cv,[P,Q],redraw);
// also allow O fixed - drag only P Q by putting them in array - need O not draggable
// rebind: only P and Q
cv.onmousedown=null; // clear dragPoints partial - rewrite drag
let drag=-1;
const pts=[P,Q];
cv.onmousedown=e=>{
  const r=cv.getBoundingClientRect(), x=(e.clientX-r.left)*cv.width/r.width, y=(e.clientY-r.top)*cv.height/r.height;
  drag=pts.findIndex(q=>(q.x-x)**2+(q.y-y)**2<500);
};
cv.onmousemove=e=>{
  if(drag<0) return;
  const r=cv.getBoundingClientRect();
  pts[drag].x=Math.max(30,Math.min(cv.width-30,(e.clientX-r.left)*cv.width/r.width));
  pts[drag].y=Math.max(30,Math.min(cv.height-30,(e.clientY-r.top)*cv.height/r.height));
  redraw();
};
cv.onmouseup=cv.onmouseleave=()=>drag=-1;
reset.onclick=()=>{P.x=420;P.y=120;Q.x=380;Q.y=300;redraw();};
redraw();
''', ("index.html","总览"), ("02-direction.html","方向判断")))

    # 02 direction
    write("02-direction.html", page("方向判断","02-direction.html", r'''
<section class="hero">
  <div class="eyebrow">图 2 · 叉积</div>
  <h1>左右转 · 拖动就变色</h1>
  <p>d=(P1−P0)×(P2−P0)。d&gt;0 逆时针（左，绿）；d&lt;0 顺时针（右，红）。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn ghost" id="reset">重置</button>
    <button class="btn primary" id="challenge">🎯 挑战：摆成逆时针</button>
  </div>
  <div class="stage-wrap light" style="height:420px">
    <canvas class="stage" id="cv" width="1000" height="420"></canvas>
    <div class="stage-hud"><span class="hud-pill light">cross product</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>叉积 d</span><b id="dv" class="teal">—</b></div>
    <div class="stat"><span>判定</span><b id="dir">—</b></div>
  </div>
  <div class="formula">d = (x1−x0)(y2−y0) − (y1−y0)(x2−x0)</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let pts=[{x:280,y:280},{x:520,y:100},{x:700,y:300}], drag=-1;
function redraw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  const [p0,p1,p2]=pts, d=cross(p0,p1,p2);
  ctx.fillStyle=d>0?'rgba(16,185,129,.12)':'rgba(220,38,38,.12)';
  ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.closePath(); ctx.fill();
  drawArrow(ctx,p0,p1,'#64748b');
  drawArrow(ctx,p0,p2, d>0?'#10b981':'#ef4444');
  drawDot(ctx,p0,'#f59e0b','P0'); drawDot(ctx,p1,'#2563eb','P1'); drawDot(ctx,p2,'#a78bfa','P2');
  dv.textContent=d.toFixed(1); dv.className=d>0?'green':d<0?'red':'teal';
  dir.textContent=d>1?'逆时针(左)':d<-1?'顺时针(右)':'共线';
  dir.className=d>1?'green':d<-1?'red':'teal';
  hud.textContent=dir.textContent;
  return d;
}
cv.onmousedown=e=>{
  const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*cv.width/r.width,y=(e.clientY-r.top)*cv.height/r.height;
  drag=pts.findIndex(p=>(p.x-x)**2+(p.y-y)**2<500);
};
cv.onmousemove=e=>{
  if(drag<0)return;
  const r=cv.getBoundingClientRect();
  pts[drag].x=Math.max(20,Math.min(cv.width-20,(e.clientX-r.left)*cv.width/r.width));
  pts[drag].y=Math.max(20,Math.min(cv.height-20,(e.clientY-r.top)*cv.height/r.height));
  redraw();
};
cv.onmouseup=cv.onmouseleave=()=>drag=-1;
reset.onclick=()=>{pts=[{x:280,y:280},{x:520,y:100},{x:700,y:300}];redraw();};
challenge.onclick=()=>{ const d=redraw(); if(d>50){ alert('成功！逆时针 ✓'); } else alert('再拖 P2，让三角形变绿'); };
redraw();
''', ("01-vector.html","向量运算"), ("03-point-seg.html","点与线段")))

    # 03 point segment
    write("03-point-seg.html", page("点与线段","03-point-seg.html", r'''
<section class="hero">
  <div class="eyebrow">图 3 · 投影</div>
  <h1>点到线段的最近点</h1>
  <p>拖动点 P 与线段 AB。蓝色为投影参数 t∈[0,1] 截断后的最近点。</p>
</section>
<div class="card">
  <div class="stage-wrap light" style="height:400px">
    <canvas class="stage" id="cv" width="1000" height="400"></canvas>
    <div class="stage-hud"><span class="hud-pill light">point-segment</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>参数 t</span><b class="blue" id="tv">—</b></div>
    <div class="stat"><span>距离</span><b class="teal" id="dv">—</b></div>
  </div>
  <div class="formula">t = clamp( (P−A)·(B−A) / |B−A|² , 0, 1 ) · 最近点 = A + t(B−A)</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let A={x:200,y:280}, B={x:750,y:120}, P={x:400,y:100}, drag=-1;
const arr=[A,B,P];
function redraw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  const ab=sub(B,A), ap=sub(P,A);
  let t=dot(ap,ab)/(dot(ab,ab)||1); const tc=Math.max(0,Math.min(1,t));
  const C={x:A.x+ab.x*tc, y:A.y+ab.y*tc};
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y); ctx.stroke();
  // infinite line faint
  ctx.strokeStyle='rgba(148,163,184,.25)'; ctx.setLineDash([6,6]);
  const ext=mul(ab, 2/len(ab)); 
  ctx.beginPath(); ctx.moveTo(A.x-ext.x*80,A.y-ext.y*80); ctx.lineTo(B.x+ext.x*80,B.y+ext.y*80); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(P.x,P.y); ctx.lineTo(C.x,C.y); ctx.stroke(); ctx.setLineDash([]);
  drawDot(ctx,A,'#2563eb','A'); drawDot(ctx,B,'#7c3aed','B'); drawDot(ctx,P,'#f59e0b','P'); drawDot(ctx,C,'#0d9488','C');
  const dist=len(sub(P,C));
  tv.textContent=tc.toFixed(3); dv.textContent=dist.toFixed(1);
  hud.textContent=tc===0?'投影在 A 端':tc===1?'投影在 B 端':'投影在线段内';
}
cv.onmousedown=e=>{
  const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*cv.width/r.width,y=(e.clientY-r.top)*cv.height/r.height;
  drag=arr.findIndex(q=>(q.x-x)**2+(q.y-y)**2<500);
};
cv.onmousemove=e=>{
  if(drag<0)return;
  const r=cv.getBoundingClientRect();
  arr[drag].x=Math.max(20,Math.min(cv.width-20,(e.clientX-r.left)*cv.width/r.width));
  arr[drag].y=Math.max(20,Math.min(cv.height-20,(e.clientY-r.top)*cv.height/r.height));
  redraw();
};
cv.onmouseup=cv.onmouseleave=()=>drag=-1;
redraw();
''', ("02-direction.html","方向判断"), ("04-intersect.html","线段相交")))

    # 04 intersect
    write("04-intersect.html", page("线段相交","04-intersect.html", r'''
<section class="hero">
  <div class="eyebrow">图 4 · 跨立</div>
  <h1>两线段是否相交？</h1>
  <p>拖动四端点。规范相交：互相跨立（叉积异号）。金线表示当前判定为相交。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="rand">🎲 随机</button>
    <button class="btn ghost" id="reset">默认交叉</button>
  </div>
  <div class="stage-wrap light" style="height:400px">
    <canvas class="stage" id="cv" width="1000" height="400"></canvas>
    <div class="stage-hud"><span class="hud-pill light">segment intersection</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row"><div class="stat"><span>判定</span><b id="ans">—</b></div></div>
  <div class="formula">cross(B−A,C−A)×cross(B−A,D−A)&lt;0 且 cross(D−C,A−C)×cross(D−C,B−C)&lt;0</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let A={x:200,y:100}, B={x:700,y:300}, C={x:220,y:300}, D={x:720,y:100}, drag=-1;
const pts=[A,B,C,D];
function inter(a,b,c,d){
  const d1=cross(a,b,c), d2=cross(a,b,d), d3=cross(c,d,a), d4=cross(c,d,b);
  return d1*d2<0 && d3*d4<0;
}
function redraw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  const ok=inter(A,B,C,D);
  ctx.strokeStyle=ok?'#f59e0b':'#2563eb'; ctx.lineWidth=4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y); ctx.stroke();
  ctx.strokeStyle=ok?'#f59e0b':'#dc2626';
  ctx.beginPath(); ctx.moveTo(C.x,C.y); ctx.lineTo(D.x,D.y); ctx.stroke();
  drawDot(ctx,A,'#2563eb','A'); drawDot(ctx,B,'#2563eb','B');
  drawDot(ctx,C,'#dc2626','C'); drawDot(ctx,D,'#dc2626','D');
  ans.textContent=ok?'相交 ✓':'不相交';
  ans.className=ok?'green':'red';
  hud.textContent=ok?'INTERSECT':'DISJOINT';
}
cv.onmousedown=e=>{
  const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*cv.width/r.width,y=(e.clientY-r.top)*cv.height/r.height;
  drag=pts.findIndex(p=>(p.x-x)**2+(p.y-y)**2<500);
};
cv.onmousemove=e=>{
  if(drag<0)return;
  const r=cv.getBoundingClientRect();
  pts[drag].x=Math.max(20,Math.min(cv.width-20,(e.clientX-r.left)*cv.width/r.width));
  pts[drag].y=Math.max(20,Math.min(cv.height-20,(e.clientY-r.top)*cv.height/r.height));
  redraw();
};
cv.onmouseup=cv.onmouseleave=()=>drag=-1;
rand.onclick=()=>{
  pts.forEach(p=>{p.x=80+Math.random()*840; p.y=60+Math.random()*280;}); redraw();
};
reset.onclick=()=>{A.x=200;A.y=100;B.x=700;B.y=300;C.x=220;C.y=300;D.x=720;D.y=100;redraw();};
redraw();
''', ("03-point-seg.html","点与线段"), ("05-inpoly.html","点在多边形")))

    # 05 point in polygon
    write("05-inpoly.html", page("点在多边形","05-inpoly.html", r'''
<section class="hero">
  <div class="eyebrow">图 5 · 射线法</div>
  <h1>点在多边形内吗？</h1>
  <p>从点向右发射水平射线，与边相交奇数次则在内。拖动测试点，看射线与交点计数。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="rand">🎲 随机多边形</button>
  </div>
  <div class="stage-wrap light" style="height:420px">
    <canvas class="stage" id="cv" width="1000" height="420"></canvas>
    <div class="stage-hud"><span class="hud-pill light">ray casting</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>交点数</span><b class="blue" id="cn">0</b></div>
    <div class="stat"><span>判定</span><b id="ans">—</b></div>
  </div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let poly=[], P={x:500,y:210}, drag=-1;
function makePoly(){
  const n=6, cx=500, cy=210, R=120;
  poly=Array.from({length:n},(_,i)=>{
    const a=i/n*Math.PI*2-Math.PI/2 + (Math.random()-.5)*.3;
    const r=R+(Math.random()-.5)*40;
    return {x:cx+Math.cos(a)*r*1.4, y:cy+Math.sin(a)*r};
  });
}
function crossings(p, poly){
  let cnt=0; const n=poly.length;
  const hits=[];
  for(let i=0,j=n-1;i<n;j=i++){
    const a=poly[i], b=poly[j];
    if((a.y>p.y)!==(b.y>p.y)){
      const x=a.x+(b.x-a.x)*(p.y-a.y)/(b.y-a.y);
      if(x>p.x){ cnt++; hits.push({x,y:p.y}); }
    }
  }
  return {cnt, hits};
}
function redraw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  // poly
  ctx.beginPath(); poly.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.closePath();
  ctx.fillStyle='rgba(13,148,136,.1)'; ctx.fill();
  ctx.strokeStyle='#0d9488'; ctx.lineWidth=3; ctx.stroke();
  poly.forEach(p=>drawDot(ctx,p,'#0d9488'));
  // ray
  const {cnt,hits}=crossings(P,poly);
  ctx.strokeStyle='rgba(245,158,11,.7)'; ctx.lineWidth=2; ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.moveTo(P.x,P.y); ctx.lineTo(cv.width-20,P.y); ctx.stroke(); ctx.setLineDash([]);
  hits.forEach(h=>{ ctx.beginPath(); ctx.arc(h.x,h.y,6,0,Math.PI*2); ctx.fillStyle='#f59e0b'; ctx.fill(); });
  drawDot(ctx,P,'#2563eb','P');
  const inside=cnt%2===1;
  cn.textContent=cnt; ans.textContent=inside?'内部 ✓':'外部';
  ans.className=inside?'green':'red';
  hud.textContent=inside?'INSIDE':'OUTSIDE · crossings='+cnt;
}
cv.onmousedown=e=>{
  const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*cv.width/r.width,y=(e.clientY-r.top)*cv.height/r.height;
  if((P.x-x)**2+(P.y-y)**2<600) drag=0;
};
cv.onmousemove=e=>{
  if(drag<0)return;
  const r=cv.getBoundingClientRect();
  P.x=Math.max(20,Math.min(cv.width-20,(e.clientX-r.left)*cv.width/r.width));
  P.y=Math.max(20,Math.min(cv.height-20,(e.clientY-r.top)*cv.height/r.height));
  redraw();
};
cv.onmouseup=cv.onmouseleave=()=>drag=-1;
rand.onclick=()=>{makePoly();redraw();};
makePoly(); redraw();
''', ("04-intersect.html","线段相交"), ("06-area.html","多边形面积")))

    # 06 area
    write("06-area.html", page("多边形面积","06-area.html", r'''
<section class="hero">
  <div class="eyebrow">图 6 · 鞋带</div>
  <h1>鞋带公式 · 面积可视化</h1>
  <p>拖动顶点，面积实时更新。彩色三角形剖分帮助理解求和过程。</p>
</section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="rand">🎲 随机多边形</button></div>
  <div class="stage-wrap light" style="height:400px">
    <canvas class="stage" id="cv" width="1000" height="400"></canvas>
    <div class="stage-hud"><span class="hud-pill light">shoelace</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row"><div class="stat"><span>面积</span><b class="teal" id="area">—</b></div></div>
  <div class="formula">Area = ½ |Σ (xᵢyᵢ₊₁ − xᵢ₊₁yᵢ)|</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let poly=[], drag=-1;
function make(){
  const n=5+Math.floor(Math.random()*3), cx=500, cy=200;
  poly=Array.from({length:n},(_,i)=>{
    const a=i/n*Math.PI*2-Math.PI/2;
    const r=100+Math.random()*50;
    return {x:cx+Math.cos(a)*r*1.5, y:cy+Math.sin(a)*r};
  });
}
function shoelace(p){
  let s=0; for(let i=0;i<p.length;i++){ const j=(i+1)%p.length; s+=p[i].x*p[j].y-p[j].x*p[i].y; }
  return Math.abs(s)/2;
}
function redraw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  const c={x:0,y:0}; poly.forEach(p=>{c.x+=p.x;c.y+=p.y;}); c.x/=poly.length; c.y/=poly.length;
  // fan triangulation from centroid
  const cols=['rgba(45,212,191,.2)','rgba(37,99,235,.15)','rgba(167,139,250,.18)','rgba(251,191,36,.18)','rgba(248,113,113,.15)','rgba(52,211,153,.18)'];
  for(let i=0;i<poly.length;i++){
    const j=(i+1)%poly.length;
    ctx.beginPath(); ctx.moveTo(c.x,c.y); ctx.lineTo(poly[i].x,poly[i].y); ctx.lineTo(poly[j].x,poly[j].y); ctx.closePath();
    ctx.fillStyle=cols[i%cols.length]; ctx.fill();
  }
  ctx.beginPath(); poly.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.closePath();
  ctx.strokeStyle='#0d9488'; ctx.lineWidth=3; ctx.stroke();
  poly.forEach((p,i)=>drawDot(ctx,p,'#0d9488',String(i)));
  drawDot(ctx,c,'#f59e0b','G');
  const a=shoelace(poly); area.textContent=a.toFixed(1); hud.textContent='area≈'+a.toFixed(1);
}
cv.onmousedown=e=>{
  const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*cv.width/r.width,y=(e.clientY-r.top)*cv.height/r.height;
  drag=poly.findIndex(p=>(p.x-x)**2+(p.y-y)**2<500);
};
cv.onmousemove=e=>{
  if(drag<0)return;
  const r=cv.getBoundingClientRect();
  poly[drag].x=Math.max(30,Math.min(cv.width-30,(e.clientX-r.left)*cv.width/r.width));
  poly[drag].y=Math.max(30,Math.min(cv.height-30,(e.clientY-r.top)*cv.height/r.height));
  redraw();
};
cv.onmouseup=cv.onmouseleave=()=>drag=-1;
rand.onclick=()=>{make();redraw();};
make(); redraw();
''', ("05-inpoly.html","点在多边形"), ("07-jarvis.html","礼品包裹")))

    # 07 jarvis
    write("07-jarvis.html", page("礼品包裹","07-jarvis.html", r'''
<section class="hero">
  <div class="eyebrow">图 7 · O(nh)</div>
  <h1>Jarvis 步进 · 礼品包裹</h1>
  <p>从最左点开始，每次选极角最小的下一点，像包装礼物一样绕一圈。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 步进动画</button>
    <button class="btn" id="rand">🎲 随机点</button>
    <div class="speed" id="spd"><button data-ms="700">慢</button><button data-ms="350" class="on">中</button><button data-ms="120">快</button></div>
  </div>
  <div class="stage-wrap light" style="height:420px">
    <canvas class="stage" id="cv" width="1000" height="420"></canvas>
    <div class="stage-hud"><span class="hud-pill light">Jarvis</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row"><div class="stat"><span>凸包顶点数</span><b class="teal" id="hn">0</b></div></div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let pts=[], ms=350;
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{spd.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');ms=+b.dataset.ms;});
function rand(){
  pts=Array.from({length:20},()=>({x:80+Math.random()*840,y:50+Math.random()*320}));
  draw([],-1,-1); hn.textContent=0; hud.textContent='ready';
}
function draw(hull, cur, cand){
  ctx.clearRect(0,0,cv.width,cv.height);
  if(hull.length>1){
    ctx.strokeStyle='#0d9488'; ctx.lineWidth=3;
    ctx.beginPath(); hull.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    if(cur>=0) ctx.lineTo(pts[cur].x,pts[cur].y);
    ctx.stroke();
    ctx.fillStyle='rgba(13,148,136,.08)'; ctx.beginPath();
    hull.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.closePath(); ctx.fill();
  }
  if(cur>=0&&cand>=0){
    ctx.strokeStyle='rgba(245,158,11,.7)'; ctx.lineWidth=2; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(pts[cur].x,pts[cur].y); ctx.lineTo(pts[cand].x,pts[cand].y); ctx.stroke(); ctx.setLineDash([]);
  }
  pts.forEach((p,i)=>{
    const onH=hull.includes(p), onC=i===cand, onU=i===cur;
    ctx.beginPath(); ctx.arc(p.x,p.y, onU||onC?8:5,0,Math.PI*2);
    ctx.fillStyle=onU?'#f59e0b':onC?'#f87171':onH?'#0d9488':'#60a5fa'; ctx.fill();
  });
}
run.onclick=async()=>{
  let start=0; for(let i=1;i<pts.length;i++) if(pts[i].x<pts[start].x) start=i;
  const hull=[pts[start]]; let p=start;
  do{
    let q=(p+1)%pts.length;
    for(let i=0;i<pts.length;i++){
      draw(hull,p,i); await sleep(ms*0.15);
      if(cross(pts[p],pts[q],pts[i])<0) q=i;
    }
    draw(hull,p,q); hud.textContent=`选中下一顶点 ${q}`; await sleep(ms);
    p=q; if(p!==start) hull.push(pts[p]);
    hn.textContent=hull.length;
  }while(p!==start);
  draw(hull,-1,-1); hud.textContent='完成 h='+hull.length;
};
rand.onclick=rand; rand();
''', ("06-area.html","多边形面积"), ("08-graham.html","Graham")))

    # 08 graham/andrew
    write("08-graham.html", page("Graham","08-graham.html", r'''
<section class="hero">
  <div class="eyebrow">图 8 · O(n log n)</div>
  <h1>Andrew 单调链 · 上下包扫描</h1>
  <p>按 x 排序后扫下包再扫上包，弹出破坏左转的点。比 Jarvis 更适合点数多的情形。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 扫描动画</button>
    <button class="btn" id="rand">🎲 随机点</button>
    <div class="speed" id="spd"><button data-ms="400">慢</button><button data-ms="180" class="on">中</button><button data-ms="60">快</button></div>
  </div>
  <div class="stage-wrap light" style="height:420px">
    <canvas class="stage" id="cv" width="1000" height="420"></canvas>
    <div class="stage-hud"><span class="hud-pill light">Andrew chain</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row"><div class="stat"><span>凸包顶点数</span><b class="teal" id="hn">0</b></div></div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let pts=[], ms=180;
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{spd.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');ms=+b.dataset.ms;});
function rand(){ pts=Array.from({length:22},()=>({x:60+Math.random()*880,y:40+Math.random()*340})); draw([]); hn.textContent=0; }
function draw(hull, hi=null){
  ctx.clearRect(0,0,cv.width,cv.height);
  if(hull.length>=2){
    ctx.strokeStyle='#0d9488'; ctx.lineWidth=3; ctx.beginPath();
    hull.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.stroke();
    ctx.fillStyle='rgba(13,148,136,.08)'; ctx.beginPath();
    hull.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.closePath(); ctx.fill();
  }
  pts.forEach(p=>{
    ctx.beginPath(); ctx.arc(p.x,p.y, p===hi?8:5,0,Math.PI*2);
    ctx.fillStyle=hull.includes(p)?'#0d9488':(p===hi?'#f59e0b':'#60a5fa'); ctx.fill();
  });
}
run.onclick=async()=>{
  const p=pts.slice().sort((a,b)=>a.x-b.x||a.y-b.y);
  const cr=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const lo=[];
  hud.textContent='下包 →';
  for(const pt of p){
    while(lo.length>=2&&cr(lo.at(-2),lo.at(-1),pt)<=0){ lo.pop(); draw(lo,pt); await sleep(ms); }
    lo.push(pt); draw(lo,pt); hn.textContent=lo.length; await sleep(ms);
  }
  const up=[];
  hud.textContent='上包 ←';
  for(let i=p.length-1;i>=0;i--){
    const pt=p[i];
    while(up.length>=2&&cr(up.at(-2),up.at(-1),pt)<=0){ up.pop(); draw(lo.slice(0,-1).concat(up),pt); await sleep(ms); }
    up.push(pt); draw(lo.slice(0,-1).concat(up),pt); await sleep(ms);
  }
  lo.pop(); up.pop();
  const hull=lo.concat(up);
  draw(hull); hn.textContent=hull.length; hud.textContent='完成 h='+hull.length;
};
rand.onclick=rand; rand();
''', ("07-jarvis.html","礼品包裹"), ("09-closest.html","最近点对")))

    # 09 closest pair
    write("09-closest.html", page("最近点对","09-closest.html", r'''
<section class="hero">
  <div class="eyebrow">图 9 · 分治</div>
  <h1>最近点对 · 分治条带</h1>
  <p>左右递归得 δ，中线 2δ 条带内检查。动画展示分治中线与当前最优点对。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 分治演示</button>
    <button class="btn" id="brute">暴力对照</button>
    <button class="btn ghost" id="rand">🎲 随机</button>
  </div>
  <div class="stage-wrap light" style="height:420px">
    <canvas class="stage" id="cv" width="1000" height="420"></canvas>
    <div class="stage-hud"><span class="hud-pill light">closest pair</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row"><div class="stat"><span>最近距离</span><b class="teal" id="md">—</b></div></div>
  <div class="formula">T(n)=2T(n/2)+O(n) → O(n log n)</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let pts=[];
function rand(){ pts=Array.from({length:30},()=>({x:50+Math.random()*900,y:40+Math.random()*340})); draw(null,null); md.textContent='—'; }
function draw(pair, mid, delta){
  ctx.clearRect(0,0,cv.width,cv.height);
  if(mid!=null){
    ctx.fillStyle='rgba(13,148,136,.08)';
    ctx.fillRect(mid-delta,0,2*delta,cv.height);
    ctx.strokeStyle='rgba(13,148,136,.5)'; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(mid,0); ctx.lineTo(mid,cv.height); ctx.stroke(); ctx.setLineDash([]);
  }
  if(pair){
    ctx.strokeStyle='#f59e0b'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(pair[0].x,pair[0].y); ctx.lineTo(pair[1].x,pair[1].y); ctx.stroke();
  }
  pts.forEach(p=>{
    const on=pair&&(p===pair[0]||p===pair[1]);
    ctx.beginPath(); ctx.arc(p.x,p.y,on?7:4,0,Math.PI*2);
    ctx.fillStyle=on?'#f59e0b':'#0d9488'; ctx.fill();
  });
}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function bruteForce(P){
  let best=1e18, pair=null;
  for(let i=0;i<P.length;i++) for(let j=i+1;j<P.length;j++){
    const d=dist(P[i],P[j]); if(d<best){best=d; pair=[P[i],P[j]];}
  }
  return {best,pair};
}
async function closest(P){
  if(P.length<=3) return bruteForce(P);
  P=P.slice().sort((a,b)=>a.x-b.x);
  const mid=P.length>>1, midX=P[mid].x;
  const L=P.slice(0,mid), R=P.slice(mid);
  draw(null, midX, 80); hud.textContent='分裂 midX≈'+midX.toFixed(0); await sleep(400);
  const left=await closest(L);
  const right=await closest(R);
  let best=Math.min(left.best,right.best);
  let pair=left.best<right.best?left.pair:right.pair;
  draw(pair, midX, best); md.textContent=best.toFixed(2); await sleep(300);
  const strip=P.filter(p=>Math.abs(p.x-midX)<best).sort((a,b)=>a.y-b.y);
  for(let i=0;i<strip.length;i++) for(let j=i+1;j<strip.length && strip[j].y-strip[i].y<best;j++){
    const d=dist(strip[i],strip[j]);
    if(d<best){ best=d; pair=[strip[i],strip[j]]; }
  }
  draw(pair, midX, best); return {best,pair};
}
run.onclick=async()=>{
  const r=await closest(pts);
  md.textContent=r.best.toFixed(2); draw(r.pair,null,null); hud.textContent='δ='+r.best.toFixed(2);
};
brute.onclick=()=>{
  const r=bruteForce(pts); md.textContent=r.best.toFixed(2); draw(r.pair,null,null); hud.textContent='brute δ='+r.best.toFixed(2);
};
rand.onclick=rand; rand();
''', ("08-graham.html","Graham"), ("10-calipers.html","旋转卡壳")))

    # 10 calipers
    write("10-calipers.html", page("旋转卡壳","10-calipers.html", r'''
<section class="hero">
  <div class="eyebrow">图 10 · 对踵点</div>
  <h1>旋转卡壳 · 直径示意</h1>
  <p>先求凸包，再用平行支撑线旋转找最远点对（直径）。动画展示对踵边推进。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 求直径</button>
    <button class="btn" id="rand">🎲 随机</button>
  </div>
  <div class="stage-wrap light" style="height:420px">
    <canvas class="stage" id="cv" width="1000" height="420"></canvas>
    <div class="stage-hud"><span class="hud-pill light">rotating calipers</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row"><div class="stat"><span>直径</span><b class="teal" id="dia">—</b></div></div>
  <div class="tip">应用：最小宽度、最大距离、凸包支撑相关问题。先凸包 O(n log n)，再卡壳 O(h)。</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let pts=[];
function rand(){ pts=Array.from({length:18},()=>({x:80+Math.random()*840,y:50+Math.random()*320})); draw(null,null); dia.textContent='—'; }
function andrew(points){
  const p=points.slice().sort((a,b)=>a.x-b.x||a.y-b.y);
  const cr=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const lo=[],up=[];
  for(const pt of p){while(lo.length>=2&&cr(lo.at(-2),lo.at(-1),pt)<=0)lo.pop();lo.push(pt);}
  for(let i=p.length-1;i>=0;i--){const pt=p[i];while(up.length>=2&&cr(up.at(-2),up.at(-1),pt)<=0)up.pop();up.push(pt);}
  lo.pop();up.pop(); return lo.concat(up);
}
function draw(hull, pair){
  ctx.clearRect(0,0,cv.width,cv.height);
  if(hull&&hull.length){
    ctx.strokeStyle='#0d9488'; ctx.lineWidth=2.5;
    ctx.beginPath(); hull.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.closePath(); ctx.stroke();
    ctx.fillStyle='rgba(13,148,136,.08)'; ctx.fill();
  }
  if(pair){
    ctx.strokeStyle='#f59e0b'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(pair[0].x,pair[0].y); ctx.lineTo(pair[1].x,pair[1].y); ctx.stroke();
    // caliper lines perpendicular-ish visualization: parallel supports
    const dx=pair[1].x-pair[0].x, dy=pair[1].y-pair[0].y, L=Math.hypot(dx,dy)||1;
    const nx=-dy/L*40, ny=dx/L*40;
    ctx.strokeStyle='rgba(245,158,11,.45)'; ctx.setLineDash([5,4]);
    [[pair[0],nx,ny],[pair[1],nx,ny]].forEach(([p,ax,ay])=>{
      ctx.beginPath(); ctx.moveTo(p.x-ay*8,p.y+ax*8); ctx.lineTo(p.x+ay*8,p.y-ax*8); ctx.stroke();
    });
    ctx.setLineDash([]);
  }
  pts.forEach(p=>{
    const on=pair&&(p===pair[0]||p===pair[1]);
    ctx.beginPath(); ctx.arc(p.x,p.y,on?8:5,0,Math.PI*2);
    ctx.fillStyle=on?'#f59e0b':(hull&&hull.includes(p)?'#0d9488':'#60a5fa'); ctx.fill();
  });
}
run.onclick=async()=>{
  const hull=andrew(pts);
  draw(hull,null); hud.textContent='凸包 h='+hull.length; await sleep(400);
  // diameter by rotating calipers simplified: antipodal pairs O(h^2) for demo clarity with animation
  let best=0, pair=null;
  for(let i=0;i<hull.length;i++){
    for(let j=i+1;j<hull.length;j++){
      const d=Math.hypot(hull[i].x-hull[j].x, hull[i].y-hull[j].y);
      draw(hull,[hull[i],hull[j]]); await sleep(40);
      if(d>best){ best=d; pair=[hull[i],hull[j]]; }
    }
  }
  draw(hull,pair); dia.textContent=best.toFixed(1); hud.textContent='diameter≈'+best.toFixed(1);
};
rand.onclick=rand; rand();
''', ("09-closest.html","最近点对"), ("index.html","返回总览")))

    print("\n第10章强交互可视化版完成 →", OUT)

if __name__ == "__main__":
    build()
