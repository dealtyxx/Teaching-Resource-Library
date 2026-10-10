# -*- coding: utf-8 -*-
"""
第8章 贪心法 · 强交互 / 强可视化版
时间轴 · 扫描线 · 哈夫曼树生长 · 离线可用
"""
from pathlib import Path
OUT = Path(__file__).resolve().parent

CSS = r"""
:root{
  --bg:#eef8f3; --surface:#fff; --s2:#f3faf6; --s3:#e6f4ec;
  --text:#0b1220; --muted:#5a6b85; --faint:#8b9bb5;
  --line:rgba(16,185,129,.16); --line2:rgba(16,185,129,.28);
  --green:#059669; --green2:#047857; --greenS:rgba(16,185,129,.1);
  --blue:#2563eb; --blueS:rgba(37,99,235,.1);
  --red:#dc2626; --redS:rgba(220,38,38,.09);
  --amber:#d97706; --violet:#7c3aed; --orange:#ea580c;
  --shadow:0 8px 28px rgba(5,150,105,.12); --shadow2:0 22px 50px rgba(5,150,105,.18);
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
    radial-gradient(1100px 560px at 5% -8%,rgba(16,185,129,.16),transparent 55%),
    radial-gradient(900px 480px at 95% 0%,rgba(37,99,235,.1),transparent 50%),
    radial-gradient(700px 400px at 50% 110%,rgba(217,119,6,.07),transparent 45%),
    linear-gradient(180deg,#f7fcf9,#eef8f3 50%,#e8f5ee);
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;text-decoration:none} button,input{font:inherit}
.fx-bg{position:fixed;inset:0;pointer-events:none;z-index:0}
.fx-bg canvas{width:100%;height:100%;display:block;opacity:.5}
.nav,.wrap{position:relative;z-index:1}
.nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  padding:11px 18px;background:rgba(255,255,255,.88);backdrop-filter:blur(18px) saturate(1.35);
  border-bottom:1px solid var(--line);box-shadow:0 8px 24px rgba(15,23,42,.05)}
.nav .brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:14px}
.nav .logo{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;
  background:linear-gradient(135deg,#34d399,#059669 55%,#2563eb);color:#fff;
  font:800 11px var(--mono);box-shadow:0 6px 16px rgba(5,150,105,.4);
  transform:perspective(200px) rotateY(-8deg);transition:transform .3s var(--ease)}
.nav .brand:hover .logo{transform:perspective(200px) rotateY(8deg) scale(1.05)}
.nav .brand span{color:var(--green)}
.nav .links{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end;max-width:min(100%,900px)}
.nav a.pill{font-size:11.5px;font-weight:700;padding:6px 10px;border-radius:999px;color:var(--muted);border:1px solid transparent;transition:.2s var(--ease)}
.nav a.pill:hover{color:var(--green);background:var(--greenS);border-color:var(--line)}
.nav a.pill.active{color:#fff;background:linear-gradient(135deg,#34d399,#059669);box-shadow:0 4px 14px rgba(5,150,105,.35)}
.wrap{max-width:1160px;margin:0 auto;padding:26px 16px 70px}
.hero{margin-bottom:24px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;color:var(--green);
  letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:999px;background:var(--greenS);
  border:1px solid rgba(5,150,105,.22);margin-bottom:12px}
.hero h1{font-size:clamp(1.55rem,3.3vw,2.4rem);line-height:1.15;font-weight:900;letter-spacing:-.025em;margin-bottom:12px;
  background:linear-gradient(120deg,#0b1220,#065f46 35%,#059669 60%,#2563eb 90%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{color:var(--muted);font-size:1.04rem;max-width:780px;line-height:1.7}
.hero-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:12.5px;font-weight:700;
  background:#fff;border:1px solid var(--line);color:var(--muted);box-shadow:0 2px 8px rgba(15,23,42,.04)}
.chip.green{background:var(--greenS);color:var(--green)} .chip.blue{background:var(--blueS);color:var(--blue)}
.chip.amber{background:rgba(217,119,6,.1);color:var(--amber)}
.grid{display:grid;gap:16px}
.grid-2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.grid-3{grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px;box-shadow:var(--shadow);
  position:relative;overflow:hidden;transition:transform .28s var(--ease),box-shadow .28s,border-color .28s}
.card:hover{transform:translateY(-3px);box-shadow:var(--shadow2);border-color:var(--line2)}
.card::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--accent,linear-gradient(90deg,#34d399,#2563eb))}
.card h3{font-size:1.08rem;font-weight:800;margin-bottom:8px}
.card p,.desc{color:var(--muted);line-height:1.65;font-size:.94rem}
.badge{display:inline-flex;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;margin-bottom:10px;
  background:var(--greenS);color:var(--green);border:1px solid rgba(5,150,105,.2)}
.badge.blue{background:var(--blueS);color:var(--blue)} .badge.red{background:var(--redS);color:var(--red)}
.badge.amber{background:rgba(217,119,6,.1);color:var(--amber)}
a.feature-card{display:flex;flex-direction:column;min-height:160px;padding:18px;border-radius:var(--r);
  background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);position:relative;overflow:hidden;
  transition:transform .3s var(--ease),box-shadow .3s}
a.feature-card::after{content:attr(data-ico);position:absolute;right:12px;top:10px;font-size:40px;opacity:.14;transition:.35s var(--ease)}
a.feature-card:hover{transform:translateY(-8px) scale(1.015);box-shadow:var(--shadow2);
  border-color:color-mix(in srgb,var(--c,#059669) 40%,transparent)}
a.feature-card:hover::after{opacity:.28;transform:scale(1.15) rotate(8deg)}
a.feature-card .num{font:800 12px var(--mono);color:var(--c,#059669);letter-spacing:.06em;margin-bottom:8px}
a.feature-card h3{font-size:1.08rem;margin-bottom:6px}
a.feature-card p{color:var(--muted);font-size:.87rem;line-height:1.55;flex:1}
a.feature-card .go{margin-top:12px;font-size:12.5px;font-weight:800;color:var(--c,#059669);opacity:0;transform:translateX(-8px);transition:.25s}
a.feature-card:hover .go{opacity:1;transform:none}
.btn{appearance:none;border:1px solid var(--line);background:var(--s2);color:var(--text);
  padding:10px 16px;border-radius:13px;cursor:pointer;font-weight:800;font-size:13.5px;
  transition:.2s var(--ease);display:inline-flex;align-items:center;gap:6px}
.btn:hover{border-color:var(--line2);background:#fff;color:var(--green);transform:translateY(-1px)}
.btn:active{transform:scale(.98)}
.btn.primary{background:linear-gradient(135deg,#34d399,#059669);border:none;color:#fff;box-shadow:0 8px 20px rgba(5,150,105,.32)}
.btn.primary:hover{filter:brightness(1.06);color:#fff}
.btn.danger{background:linear-gradient(135deg,#f87171,#dc2626);border:none;color:#fff}
.btn.ghost{background:transparent}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important}
.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0}
.toolbar label{font-size:12.5px;color:var(--muted);font-weight:700}
input[type=range]{width:130px;accent-color:var(--green);cursor:pointer}
.kbd{font:700 12px var(--mono);background:var(--s3);border:1px solid var(--line);border-radius:8px;padding:3px 8px;color:var(--green2);min-width:1.8rem;text-align:center}
.speed{display:flex;gap:4px;background:var(--s2);padding:3px;border-radius:11px;border:1px solid var(--line)}
.speed button{border:none;background:transparent;padding:6px 11px;border-radius:8px;font-size:12px;font-weight:800;color:var(--muted);cursor:pointer}
.speed button.on{background:#fff;color:var(--green);box-shadow:0 1px 4px rgba(15,23,42,.08)}
.tip{margin-top:12px;padding:13px 15px;border-radius:15px;background:linear-gradient(135deg,var(--greenS),var(--blueS));
  border:1px solid var(--line);color:var(--muted);font-size:13.5px;line-height:1.65}
.tip strong{color:var(--text)}
.tip.ok{background:var(--greenS);border-color:rgba(5,150,105,.25)}
.tip.danger{background:var(--redS);border-color:rgba(220,38,38,.2)}
.tip.warn{background:rgba(217,119,6,.1);border-color:rgba(217,119,6,.22)}
.formula{font-family:var(--mono);background:linear-gradient(135deg,#ecfdf5,#eff6ff);border:1px solid rgba(5,150,105,.25);
  border-radius:16px;padding:16px 18px;margin-top:10px;color:var(--green2);font-size:15px;line-height:1.55;text-align:center;font-weight:750}
.formula.lg{font-size:clamp(1.1rem,2.5vw,1.5rem);padding:20px}
.code{font-family:var(--mono);font-size:12.5px;line-height:1.7;background:#0f172a;color:#e2e8f0;border-radius:16px;
  padding:15px 16px;overflow:auto;white-space:pre;margin-top:10px}
.code .cm{color:#64748b}.code .kw{color:#6ee7b7}.code .fn{color:#93c5fd}
.stat-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.stat{flex:1;min-width:100px;background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px}
.stat span{font-size:11.5px;color:var(--faint);font-weight:700}
.stat b{display:block;font-size:1.3rem;margin-top:4px;font-weight:900;font-variant-numeric:tabular-nums}
.stat b.blue{color:var(--blue)}.stat b.green{color:var(--green)}.stat b.red{color:var(--red)}.stat b.amber{color:var(--amber)}
.list-step{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;margin:8px 0;border-radius:14px;border:1px solid var(--line);background:#fff}
.list-step .n{flex-shrink:0;width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,#34d399,#059669);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900}
.list-step .body{flex:1;font-size:.92rem;color:var(--muted);line-height:1.55}
.list-step .body b{color:var(--text)}
table.data{width:100%;border-collapse:separate;border-spacing:0;font-size:13.5px;margin-top:8px;overflow:hidden;border-radius:14px;border:1px solid var(--line)}
table.data th,table.data td{padding:11px 14px;text-align:left;border-bottom:1px solid var(--line)}
table.data th{background:var(--s3);color:var(--muted);font-size:12px;font-weight:800}
table.data tr:last-child td{border-bottom:none}
table.data tr:hover td{background:var(--greenS)}
table.data td.hl{background:rgba(5,150,105,.12);font-weight:800;color:var(--green2)}
.stage-wrap{position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow);background:#0b1220}
.stage-wrap.light{background:linear-gradient(rgba(16,185,129,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.04) 1px,transparent 1px),#f8fafc;background-size:22px 22px,22px 22px,auto}
canvas.stage{width:100%;display:block;touch-action:none}
.stage-hud{position:absolute;left:12px;top:12px;right:12px;display:flex;justify-content:space-between;gap:8px;pointer-events:none;flex-wrap:wrap}
.hud-pill{padding:6px 11px;border-radius:999px;background:rgba(15,23,42,.72);color:#e2e8f0;font:700 12px var(--mono);border:1px solid rgba(255,255,255,.1)}
.hud-pill.light{background:rgba(255,255,255,.92);color:var(--text);border-color:var(--line)}
.legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;font-size:12.5px;color:var(--muted);font-weight:700}
.legend i{display:inline-block;width:11px;height:11px;border-radius:4px;margin-right:5px;vertical-align:middle}
.log{max-height:180px;overflow:auto;font:12px/1.65 var(--mono);color:var(--muted);background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px;margin-top:10px}
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
.pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 0 rgba(5,150,105,.45);animation:pulse 1.6s infinite;display:inline-block}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(5,150,105,.45)}70%{box-shadow:0 0 0 10px transparent}}
.flip3d{perspective:1200px}
.flip-card3d{position:relative;min-height:200px;transform-style:preserve-3d;transition:transform .7s var(--ease);cursor:pointer}
.flip-card3d.flipped{transform:rotateY(180deg)}
.flip-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:var(--r);padding:18px;background:#fff;border:1px solid var(--line);box-shadow:var(--shadow);display:flex;flex-direction:column}
.flip-face.back{transform:rotateY(180deg);background:linear-gradient(160deg,#ecfdf5,#eff6ff)}
.flip-hint{margin-top:auto;font-size:12px;font-weight:800;color:var(--green)}
.compare{display:grid;grid-template-columns:1fr auto 1fr;gap:14px}
@media(max-width:760px){.compare{grid-template-columns:1fr}.compare .vs{display:none}}
.compare .vs{display:grid;place-items:center;font-weight:900;color:var(--faint);letter-spacing:.1em}
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
    parts=Array.from({length:30},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:1+Math.random()*2, vx:(Math.random()-.5)*.2, vy:-.12-Math.random()*.28, a:.12+Math.random()*.3}));
  }
  function tick(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; if(p.y<-10){p.y=innerHeight+10;p.x=Math.random()*innerWidth;}
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(5,150,105,${p.a})`; ctx.fill();
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
    ("02-activity.html","活动安排"),
    ("03-merge.html","区间合并"),
    ("04-rooms.html","会议室"),
    ("05-fractional.html","分数背包"),
    ("06-tianji.html","田忌赛马"),
    ("07-coin.html","零钱兑换"),
    ("08-huffman.html","哈夫曼"),
    ("09-matroid.html","拟阵"),
    ("10-schedule.html","任务调度"),
]
CH = "第8章 贪心法"

def nav(active):
    pills="".join(f'<a class="{"pill active" if h==active else "pill"}" href="{h}">{lab}</a>' for h,lab in LINKS)
    return f'''<div class="fx-bg" aria-hidden="true"></div>
<nav class="nav"><div class="brand"><div class="logo">08</div>算法可视化 · <span>{CH}</span></div>
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
<div class="footer">算法设计与分析 · <b>{CH}</b> · 强交互可视化版<br/>时间轴 · 扫描线 · 树生长 · 建议全屏投影</div>
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
        ("01-overview.html","01","贪心法概述","两大性质 · 3D 翻转卡","#059669","🎯"),
        ("02-activity.html","02","活动安排","时间轴贪心动画","#2563eb","📅"),
        ("03-merge.html","03","区间合并","排序扫描合并","#7c3aed","🔗"),
        ("04-rooms.html","04","最少会议室","扫描线峰值","#dc2626","🏢"),
        ("05-fractional.html","05","分数背包","性价比装包","#d97706","🎒"),
        ("06-tianji.html","06","田忌赛马","双端贪心配对","#0891b2","🐴"),
        ("07-coin.html","07","零钱兑换","可贪 vs 不可贪","#ea580c","🪙"),
        ("08-huffman.html","08","哈夫曼编码","树生长动画","#059669","🌳"),
        ("09-matroid.html","09","拟阵","贪心正确性框架","#2563eb","📐"),
        ("10-schedule.html","10","任务调度","策略对比","#7c3aed","⏱️"),
    ]
    cards="".join(f'''
<a class="feature-card" href="{h}" style="--c:{c}" data-ico="{ico}">
  <div class="num">图 {n}</div><h3>{t}</h3><p>{d}</p><div class="go">进入实验 →</div>
</a>''' for h,n,t,d,c,ico in items)

    write("index.html", page("交互总览","index.html", f'''
<section class="hero">
  <div class="eyebrow"><span class="pulse-dot"></span> Immersive Lab · Chapter 8</div>
  <h1>贪心法 · 局部最优的艺术</h1>
  <p>每一步都选「当前看起来最好」——但必须证明。用<strong>时间轴、扫描线、哈夫曼树生长</strong>看清策略如何生效，以及何时会翻车。</p>
  <div class="hero-meta">
    <span class="chip green">🎯 10 个实验</span>
    <span class="chip blue">📈 可对比错误策略</span>
    <span class="chip amber">⚠️ 含反例警示</span>
  </div>
</section>
<div class="card" style="--accent:linear-gradient(90deg,#34d399,#2563eb,#7c3aed);margin-bottom:18px">
  <div class="formula lg">贪心 ＝ 局部最优选择 ＋（需证明的）全局最优</div>
  <div class="stage-wrap" style="margin-top:14px;height:140px">
    <canvas class="stage" id="heroCv" width="1100" height="140"></canvas>
    <div class="stage-hud"><span class="hud-pill">LIVE · 贪心选择示意</span><span class="hud-pill">auto</span></div>
  </div>
</div>
<div class="grid grid-2 stagger">{cards}</div>
''', r'''
const cv=heroCv, ctx=cv.getContext('2d');
const acts=[[1,4],[3,5],[0,6],[5,7],[3,9],[5,9],[6,10],[8,11],[8,12],[2,14],[12,16]];
let sel=[], i=0, phase=0;
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  const pad=40, W=cv.width, H=cv.height;
  const x=t=>pad+t/16*(W-2*pad);
  ctx.strokeStyle='rgba(148,163,184,.4)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(pad,H-28); ctx.lineTo(W-pad,H-28); ctx.stroke();
  acts.forEach((a,k)=>{
    const y=18+k*9;
    let col='#475569';
    if(sel.includes(k)) col='#34d399';
    else if(k===i) col='#60a5fa';
    ctx.fillStyle=col;
    ctx.fillRect(x(a[0]),y,Math.max(3,x(a[1])-x(a[0])),7);
  });
}
setInterval(()=>{
  if(phase===0){
    const idx=[...acts.keys()].sort((a,b)=>acts[a][1]-acts[b][1]);
    if(i<idx.length){
      const k=idx[i];
      const end=sel.length?acts[sel[sel.length-1]][1]:-1;
      if(acts[k][0]>=end) sel.push(k);
      i++; draw();
    } else { phase=1; setTimeout(()=>{sel=[];i=0;phase=0;},1200); }
  }
}, 280); draw();
''', None, ("01-overview.html","概述")))

    # 01
    write("01-overview.html", page("概述","01-overview.html", r'''
<section class="hero">
  <div class="eyebrow">图 1 · 总纲</div>
  <h1>贪心何时可信？</h1>
  <p>两大性质是「入场券」。点击卡片翻转；没有证明的贪心，只是直觉。</p>
</section>
<div class="grid grid-2 stagger flip3d">
  <div class="flip-card3d" id="f1">
    <div class="flip-face"><div class="badge">性质 ①</div>
      <h3 style="font-size:1.3rem;margin:10px 0">贪心选择性质</h3>
      <p class="desc">局部最优选择可以扩展成全局最优</p>
      <div class="flip-hint">点击翻转 ↻</div></div>
    <div class="flip-face back"><h3>意味着什么？</h3>
      <p class="desc" style="margin-top:12px">存在一个最优解，包含当前这一步的贪心选择——于是可以「不回头」地做下去。</p>
      <div class="flip-hint">再点翻回</div></div>
  </div>
  <div class="flip-card3d" id="f2">
    <div class="flip-face"><div class="badge">性质 ②</div>
      <h3 style="font-size:1.3rem;margin:10px 0">最优子结构</h3>
      <p class="desc">全局最优包含子问题的最优</p>
      <div class="flip-hint">点击翻转 ↻</div></div>
    <div class="flip-face back"><h3>意味着什么？</h3>
      <p class="desc" style="margin-top:12px">选定贪心步之后，剩下问题的最优解 + 当前选择 = 原问题最优解。</p>
      <div class="flip-hint">再点翻回</div></div>
  </div>
</div>
<div class="card" style="margin-top:16px">
  <h3>标准解题流程</h3>
  <div class="list-step"><div class="n">1</div><div class="body"><b>建模</b>：解是什么？目标函数是什么？</div></div>
  <div class="list-step"><div class="n">2</div><div class="body"><b>提出策略</b>：每一步按什么规则选？</div></div>
  <div class="list-step"><div class="n">3</div><div class="body"><b>证明</b>：贪心选择 + 最优子结构（或举反例推翻）</div></div>
  <div class="tip warn"><strong>反例警示：</strong>0/1 背包不能按性价比贪心；分数背包可以。策略必须匹配问题约束。</div>
</div>
''', r'''
[f1,f2].forEach(el=>el.onclick=()=>el.classList.toggle('flipped'));
''', ("index.html","总览"), ("02-activity.html","活动安排")))

    # 02 activity
    write("02-activity.html", page("活动安排","02-activity.html", r'''
<section class="hero">
  <div class="eyebrow">图 2 · 经典</div>
  <h1>活动安排 · 最早结束优先</h1>
  <p>时间轴上选尽量多的不重叠活动。正确策略 vs 错误策略（最短时长）一键对比。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="runOk">✅ 正确策略</button>
    <button class="btn danger" id="runBad">❌ 最短时长（错误）</button>
    <button class="btn ghost" id="reset">重置</button>
    <div class="speed" id="spd"><button data-ms="600">慢</button><button data-ms="350" class="on">中</button><button data-ms="150">快</button></div>
  </div>
  <div class="stage-wrap light" style="height:340px">
    <canvas class="stage" id="cv" width="1000" height="340"></canvas>
    <div class="stage-hud"><span class="hud-pill light" id="hud">activity</span><span class="hud-pill light" id="hud2">—</span></div>
  </div>
  <div class="legend">
    <span><i style="background:#34d399"></i>选中</span>
    <span><i style="background:#60a5fa"></i>考察中</span>
    <span><i style="background:#f87171"></i>冲突跳过</span>
    <span><i style="background:#cbd5e1"></i>未处理</span>
  </div>
  <div class="stat-row">
    <div class="stat"><span>已选数量</span><b class="green" id="cnt">0</b></div>
    <div class="stat"><span>当前结束线</span><b class="blue" id="endL">—</b></div>
  </div>
  <div class="tip" id="tip">正确策略：按结束时间排序，能放就放。</div>
</div>
''', r'''
const A=[[1,4],[3,5],[0,6],[5,7],[3,9],[5,9],[6,10],[8,11],[8,12],[2,14],[12,16]];
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let ms=350;
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{spd.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');ms=+b.dataset.ms;});
function draw(hl=-1, sel=[], bad=[]){
  ctx.clearRect(0,0,cv.width,cv.height);
  const pad=50, W=cv.width, H=cv.height;
  const x=t=>pad+t/16*(W-2*pad);
  ctx.strokeStyle='#cbd5e1'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(pad,H-36); ctx.lineTo(W-pad,H-36); ctx.stroke();
  for(let t=0;t<=16;t+=2){
    ctx.fillStyle='#64748b'; ctx.font='12px ui-monospace'; ctx.fillText(t, x(t)-4, H-16);
    ctx.strokeStyle='rgba(148,163,184,.15)'; ctx.beginPath(); ctx.moveTo(x(t),20); ctx.lineTo(x(t),H-40); ctx.stroke();
  }
  A.forEach((a,i)=>{
    const y=22+i*24;
    let col='#cbd5e1';
    if(sel.includes(i)) col='#10b981';
    else if(bad.includes(i)) col='#f87171';
    else if(i===hl) col='#3b82f6';
    const g=ctx.createLinearGradient(x(a[0]),0,x(a[1]),0);
    g.addColorStop(0,col); g.addColorStop(1,col+'cc');
    ctx.fillStyle=g;
    const bw=Math.max(6,x(a[1])-x(a[0]));
    roundRect(ctx,x(a[0]),y,bw,16,5); ctx.fill();
    ctx.fillStyle='#0f172a'; ctx.font='bold 11px ui-monospace'; ctx.textAlign='left';
    ctx.fillText('A'+(i+1), x(a[0])+4, y+12);
  });
}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
async function run(orderFn, label){
  const idx=[...A.keys()].sort(orderFn);
  const chosen=[], skipped=[]; let end=-1;
  hud.textContent=label;
  for(const i of idx){
    draw(i, chosen, skipped);
    hud2.textContent=`考察 A${i+1} [${A[i]}]`;
    cnt.textContent=chosen.length; endL.textContent=end<0?'—':end;
    await sleep(ms);
    if(A[i][0]>=end){
      chosen.push(i); end=A[i][1];
      tip.className='tip ok'; tip.innerHTML=`✅ 选择 <strong>A${i+1}</strong> · 结束线 → ${end}`;
    } else {
      skipped.push(i);
      tip.className='tip danger'; tip.textContent=`跳过 A${i+1}（与已选冲突）`;
    }
    draw(-1, chosen, skipped);
    cnt.textContent=chosen.length; endL.textContent=end;
    await sleep(ms*0.55);
  }
  tip.className='tip ok';
  tip.innerHTML=`<strong>${label}</strong> 完成 · 选中 ${chosen.length} 个：`+chosen.map(i=>'A'+(i+1)).join(' ');
  return chosen.length;
}
runOk.onclick=()=>run((i,j)=>A[i][1]-A[j][1]||A[i][0]-A[j][0], '最早结束优先');
runBad.onclick=async()=>{
  const badN=await run((i,j)=>(A[i][1]-A[i][0])-(A[j][1]-A[j][0]), '❌ 最短时长优先');
  await sleep(500);
  const okN=await run((i,j)=>A[i][1]-A[j][1]||A[i][0]-A[j][0], '✅ 最早结束优先');
  tip.innerHTML=`对比：错误策略 <strong class="red">${badN}</strong> 个 vs 正确 <strong>${okN}</strong> 个`+(badN<okN?' · 策略错就少选！':'');
};
reset.onclick=()=>{draw();cnt.textContent=0;endL.textContent='—';tip.className='tip';tip.textContent='已重置';hud2.textContent='—';};
draw();
''', ("01-overview.html","概述"), ("03-merge.html","区间合并")))

    # 03 merge
    write("03-merge.html", page("区间合并","03-merge.html", r'''
<section class="hero">
  <div class="eyebrow">图 3 · 合并</div>
  <h1>区间合并 · 扫描合并动画</h1>
  <p>按左端排序后，能合并就扩展右端，否则开启新段。看色块如何「吸」在一起。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 合并演示</button>
    <button class="btn" id="rand">🎲 随机区间</button>
  </div>
  <div class="stage-wrap light" style="height:280px">
    <canvas class="stage" id="cv" width="1000" height="280"></canvas>
    <div class="stage-hud"><span class="hud-pill light" id="hud">merge</span><span class="hud-pill light" id="hud2">—</span></div>
  </div>
  <div class="log" id="log">等待开始</div>
</div>
''', r'''
let segs=[[1,3],[2,6],[8,10],[15,18],[9,12]];
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function draw(list, cur=null, out=[]){
  ctx.clearRect(0,0,cv.width,cv.height);
  const pad=40, maxT=20, x=t=>pad+t/maxT*(cv.width-2*pad);
  ctx.strokeStyle='#cbd5e1'; ctx.beginPath(); ctx.moveTo(pad,220); ctx.lineTo(cv.width-pad,220); ctx.stroke();
  list.forEach((a,i)=>{
    ctx.fillStyle='rgba(37,99,235,.35)';
    ctx.fillRect(x(a[0]), 40+i*18, Math.max(4,x(a[1])-x(a[0])), 12);
  });
  if(cur){
    ctx.fillStyle='#f59e0b';
    ctx.fillRect(x(cur[0]), 160, Math.max(4,x(cur[1])-x(cur[0])), 18);
    ctx.fillStyle='#0f172a'; ctx.font='12px ui-monospace'; ctx.fillText('current', x(cur[0]), 155);
  }
  out.forEach((a,i)=>{
    ctx.fillStyle='#10b981';
    ctx.fillRect(x(a[0]), 190, Math.max(4,x(a[1])-x(a[0])), 16);
  });
}
run.onclick=async()=>{
  const a=segs.slice().sort((p,q)=>p[0]-q[0]);
  const out=[]; let cur=a[0].slice();
  let lines=['排序: '+JSON.stringify(a)];
  draw(a, cur, out); log.textContent=lines.join('\\n'); await sleep(400);
  for(let i=1;i<a.length;i++){
    hud2.textContent=`看 ${JSON.stringify(a[i])}`;
    if(a[i][0]<=cur[1]){
      lines.push(`合并 ${JSON.stringify(cur)} + ${JSON.stringify(a[i])}`);
      cur[1]=Math.max(cur[1], a[i][1]);
      lines.push('→ '+JSON.stringify(cur));
    } else {
      out.push(cur.slice());
      lines.push('输出 '+JSON.stringify(cur));
      cur=a[i].slice();
    }
    draw(a, cur, out); log.textContent=lines.join('\\n'); await sleep(500);
  }
  out.push(cur); draw(a, null, out);
  lines.push('结果 '+JSON.stringify(out));
  log.textContent=lines.join('\\n'); hud2.textContent='done';
};
rand.onclick=()=>{
  segs=Array.from({length:6},()=>{const s=Math.floor(Math.random()*12); return [s,s+1+Math.floor(Math.random()*5)];});
  draw(segs); log.textContent='新区间: '+JSON.stringify(segs);
};
draw(segs);
''', ("02-activity.html","活动安排"), ("04-rooms.html","会议室")))

    # 04 rooms
    write("04-rooms.html", page("会议室","04-rooms.html", r'''
<section class="hero">
  <div class="eyebrow">图 4 · 扫描线</div>
  <h1>最少会议室 · 事件扫描</h1>
  <p>开始 +1，结束 −1，峰值即最少房间数。看占用曲线如何起伏。</p>
</section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ 扫描线动画</button></div>
  <div class="stage-wrap light" style="height:300px">
    <canvas class="stage" id="cv" width="1000" height="300"></canvas>
    <div class="stage-hud"><span class="hud-pill light">sweep line</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>当前占用</span><b class="blue" id="cur">0</b></div>
    <div class="stat"><span>峰值（答案）</span><b class="green" id="peak">0</b></div>
  </div>
  <div class="log" id="log">会议: [0,30] [5,10] [15,20] [12,25]</div>
</div>
''', r'''
const meetings=[[0,30],[5,10],[15,20],[12,25]];
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
run.onclick=async()=>{
  const ev=[]; meetings.forEach(([s,e])=>{ev.push([s,1,'start']); ev.push([e,-1,'end']);});
  ev.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  let curV=0, peakV=0, hist=[{t:0,v:0}], lines=[];
  const maxT=35;
  function drawSweep(t){
    ctx.clearRect(0,0,cv.width,cv.height);
    const pad=50, x=tt=>pad+tt/maxT*(cv.width-2*pad), y=v=>240-v*40;
    // meetings as bars
    meetings.forEach((m,i)=>{
      ctx.fillStyle='rgba(37,99,235,.2)';
      ctx.fillRect(x(m[0]), 40+i*22, x(m[1])-x(m[0]), 14);
    });
    // curve
    ctx.strokeStyle='#10b981'; ctx.lineWidth=3; ctx.beginPath();
    hist.forEach((h,i)=>{ const X=x(h.t), Y=y(h.v); i?ctx.lineTo(X,Y):ctx.moveTo(X,Y); });
    ctx.stroke();
    // sweep
    ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(x(t),20); ctx.lineTo(x(t),260); ctx.stroke(); ctx.setLineDash([]);
  }
  for(const [t,d,tp] of ev){
    curV+=d; peakV=Math.max(peakV,curV);
    hist.push({t,v:curV});
    cur.textContent=curV; peak.textContent=peakV;
    lines.push(`t=${t} ${tp} → 占用=${curV}`);
    log.textContent=lines.join('\\n'); hud.textContent=`t=${t}`;
    drawSweep(t); await sleep(450);
  }
  hud.textContent='peak='+peakV;
};
''', ("03-merge.html","区间合并"), ("05-fractional.html","分数背包")))

    # 05 fractional knapsack
    write("05-fractional.html", page("分数背包","05-fractional.html", r'''
<section class="hero">
  <div class="eyebrow">图 5 · 可拆分</div>
  <h1>分数背包 · 按性价比灌装</h1>
  <p>物品可拆。按 v/w 降序装，最后一件可装部分。看背包「液面」上涨。</p>
</section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ 装包动画</button></div>
  <div class="stage-wrap" style="height:340px">
    <canvas class="stage" id="cv" width="1000" height="340"></canvas>
    <div class="stage-hud"><span class="hud-pill">fractional knapsack</span><span class="hud-pill" id="hud">W=50</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>已装重量</span><b class="blue" id="ww">0</b></div>
    <div class="stat"><span>总价值</span><b class="green" id="vv">0</b></div>
  </div>
  <div class="tip warn"><strong>对比：</strong>0/1 不可拆时，同策略可能错，必须用 DP。</div>
</div>
''', r'''
const items=[{w:10,v:60,name:'A'},{w:20,v:100,name:'B'},{w:30,v:120,name:'C'}], W=50;
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function draw(filled=0, val=0, highlight=-1, frac=1){
  ctx.clearRect(0,0,cv.width,cv.height);
  // bag
  const bx=120, by=60, bw=120, bh=220;
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=4;
  ctx.strokeRect(bx,by,bw,bh);
  const fh=filled/W*bh;
  const g=ctx.createLinearGradient(0,by+bh,0,by+bh-fh);
  g.addColorStop(0,'#059669'); g.addColorStop(1,'#34d399');
  ctx.fillStyle=g; ctx.fillRect(bx+2, by+bh-fh, bw-4, fh);
  ctx.fillStyle='#e2e8f0'; ctx.font='14px Segoe UI'; ctx.fillText('背包', bx+30, by+bh+28);
  ctx.fillText(filled.toFixed(1)+'/'+W, bx+25, by+bh+48);
  // items
  const sorted=items.map((it,i)=>({...it,r:it.v/it.w,i})).sort((a,b)=>b.r-a.r);
  sorted.forEach((it,k)=>{
    const x=350, y=50+k*80;
    const on=highlight===it.i;
    ctx.fillStyle=on?'#fbbf24':'#334155';
    round(ctx,x,y,200,50,10); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 14px Segoe UI';
    ctx.fillText(`${it.name}  w=${it.w} v=${it.v}  r=${it.r.toFixed(2)}`, x+12, y+30);
    if(on && frac<1){ ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(x,y,200*frac,50); }
  });
  ctx.fillStyle='#e2e8f0'; ctx.font='18px ui-monospace'; ctx.fillText('价值 '+val.toFixed(1), 650, 160);
}
function round(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
run.onclick=async()=>{
  const a=items.map((x,i)=>({...x,r:x.v/x.w,i})).sort((p,q)=>q.r-p.r);
  let left=W, val=0, used=0;
  for(const it of a){
    if(left<=0) break;
    if(it.w<=left){
      for(let t=0;t<=1;t+=.1){ draw(used+it.w*t, val+it.v*t, it.i, t); await sleep(40); }
      left-=it.w; used+=it.w; val+=it.v;
    } else {
      const f=left/it.w;
      for(let t=0;t<=1;t+=.1){ draw(used+left*t, val+it.r*left*t, it.i, f*t); await sleep(40); }
      val+=it.r*left; used+=left; left=0;
    }
    ww.textContent=used.toFixed(1); vv.textContent=val.toFixed(1); hud.textContent='val≈'+val.toFixed(1);
    await sleep(200);
  }
  draw(used,val,-1,1);
};
draw(0,0);
''', ("04-rooms.html","会议室"), ("06-tianji.html","田忌赛马")))

    # 06 tianji
    write("06-tianji.html", page("田忌赛马","06-tianji.html", r'''
<section class="hero">
  <div class="eyebrow">图 6 · 配对</div>
  <h1>田忌赛马式双端贪心</h1>
  <p>双方排序后，能赢用最弱能赢的；否则用最弱耗对方最强。看对战连线逐场生成。</p>
</section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ 对战推演</button></div>
  <div class="stage-wrap" style="height:360px">
    <canvas class="stage" id="cv" width="1000" height="360"></canvas>
    <div class="stage-hud"><span class="hud-pill">Tian Ji</span><span class="hud-pill" id="hud">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>胜</span><b class="green" id="win">0</b></div>
    <div class="stat"><span>负</span><b class="red" id="lose">0</b></div>
  </div>
</div>
''', r'''
// ours vs theirs speeds
let ours=[2,5,8,10], theirs=[3,6,7,11];
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function draw(pairs=[], phase=''){
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.fillStyle='#94a3b8'; ctx.font='14px Segoe UI';
  ctx.fillText('我方 (田忌)', 120, 40); ctx.fillText('对方 (齐王)', 700, 40);
  const o=[...ours].sort((a,b)=>a-b), t=[...theirs].sort((a,b)=>a-b);
  o.forEach((v,i)=>{
    const y=80+i*55;
    ctx.beginPath(); ctx.arc(180,y,22,0,Math.PI*2);
    ctx.fillStyle='#2563eb'; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 14px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(v,180,y);
  });
  t.forEach((v,i)=>{
    const y=80+i*55;
    ctx.beginPath(); ctx.arc(780,y,22,0,Math.PI*2);
    ctx.fillStyle='#dc2626'; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 14px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(v,780,y);
  });
  pairs.forEach(([oi,ti,res])=>{
    const y1=80+oi*55, y2=80+ti*55;
    ctx.strokeStyle=res==='W'?'#34d399':'#f87171'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(210,y1); ctx.lineTo(750,y2); ctx.stroke();
  });
  if(phase){ ctx.fillStyle='#e2e8f0'; ctx.font='16px Segoe UI'; ctx.textAlign='center'; ctx.fillText(phase, 500, 330); }
}
run.onclick=async()=>{
  let o=[...ours].sort((a,b)=>a-b), t=[...theirs].sort((a,b)=>a-b);
  let ol=0, or=o.length-1, tl=0, tr=t.length-1;
  let pairs=[], wins=0, loses=0, oIdx=o.map((_,i)=>i), tIdx=t.map((_,i)=>i);
  // map values to visual indices after sort - use positions by current arrays
  while(ol<=or){
    let oi, ti, res;
    if(o[ol]>t[tl]){ // weakest beats their weakest
      oi=ol; ti=tl; res='W'; wins++; ol++; tl++;
    } else if(o[or]>t[tr]){ // strongest beats their strongest
      oi=or; ti=tr; res='W'; wins++; or--; tr--;
    } else { // sacrifice weakest vs their strongest
      oi=ol; ti=tr; res='L'; loses++; ol++; tr--;
    }
    // visual index: position in full sorted display
    const vo=ours.slice().sort((a,b)=>a-b).indexOf(o[oi]!==undefined? (res==='W'||res==='L'? (oi===ol-1||oi===or+1? null:null) : null));
    // simpler: redraw with pair list of values
    const oVal = res==='W' ? (o[oi]??o[ol-1]) : o[oi];
    // fix pairing display using value match
  }
  // cleaner reimplementation
  o=[...ours].sort((a,b)=>a-b); t=[...theirs].sort((a,b)=>a-b);
  ol=0; or=o.length-1; tl=0; tr=t.length-1; pairs=[]; wins=0; loses=0;
  const oPos=v=>o.indexOf(v), tPos=v=>t.indexOf(v);
  // use copies for remaining
  let O=o.slice(), T=t.slice();
  while(O.length){
    let ov, tv, res;
    if(O[0]>T[0]){ ov=O.shift(); tv=T.shift(); res='W'; wins++; }
    else if(O[O.length-1]>T[T.length-1]){ ov=O.pop(); tv=T.pop(); res='W'; wins++; }
    else { ov=O.shift(); tv=T.pop(); res='L'; loses++; }
    const oi=o.indexOf(ov), ti=t.indexOf(tv);
    // mark used by setting to null carefully - use first match
    pairs.push([oi, ti, res]);
    win.textContent=wins; lose.textContent=loses;
    hud.textContent=`${ov} vs ${tv} → ${res}`;
    draw(pairs, `${ov} vs ${tv} (${res==='W'?'胜':'负'})`);
    await sleep(700);
  }
  hud.textContent=`胜${wins} 负${loses}`;
};
draw();
''', ("05-fractional.html","分数背包"), ("07-coin.html","零钱兑换")))

    # 07 coin
    write("07-coin.html", page("零钱兑换","07-coin.html", r'''
<section class="hero">
  <div class="eyebrow">图 7 · 可贪边界</div>
  <h1>零钱兑换：何时贪心正确？</h1>
  <p>Canonical 币制（如人民币）可贪；否则可能翻车。对比两种币制。</p>
</section>
<div class="grid grid-2">
  <div class="card">
    <div class="badge">Canonical</div>
    <h3>硬币 [1,5,10,25] 凑 41</h3>
    <div class="toolbar"><button class="btn primary" id="runG">贪心演示</button></div>
    <div class="log" id="logG">—</div>
  </div>
  <div class="card">
    <div class="badge red">非 Canonical</div>
    <h3>硬币 [1,3,4] 凑 6</h3>
    <div class="toolbar"><button class="btn danger" id="runB">贪心（错）</button><button class="btn" id="runOpt">最优</button></div>
    <div class="log" id="logB">—</div>
  </div>
</div>
<div class="card" style="margin-top:16px">
  <div class="stage-wrap light" style="height:200px">
    <canvas class="stage" id="cv" width="900" height="200"></canvas>
  </div>
  <div class="tip">贪心：每次取不超过剩余金额的最大面额。非 Canonical 时应用完全背包 DP。</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function greedy(coins, amount){
  const res=[]; let left=amount;
  const c=[...coins].sort((a,b)=>b-a);
  for(const x of c){ while(left>=x){ res.push(x); left-=x; } }
  return res;
}
function drawCoins(list, title){
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.fillStyle='#334155'; ctx.font='16px Segoe UI'; ctx.fillText(title, 20, 30);
  list.forEach((v,i)=>{
    const x=40+i*70, y=100;
    ctx.beginPath(); ctx.arc(x,y,28,0,Math.PI*2);
    const g=ctx.createRadialGradient(x-8,y-8,4,x,y,28);
    g.addColorStop(0,'#fde68a'); g.addColorStop(1,'#d97706');
    ctx.fillStyle=g; ctx.fill();
    ctx.fillStyle='#0f172a'; ctx.font='bold 14px ui-monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(v,x,y);
  });
}
runG.onclick=async()=>{
  const res=greedy([1,5,10,25],41);
  logG.textContent='贪心结果: '+res.join('+')+' = '+res.reduce((a,b)=>a+b,0)+' · 共 '+res.length+' 枚';
  for(let k=1;k<=res.length;k++){ drawCoins(res.slice(0,k), 'Canonical 贪心'); await sleep(200); }
};
runB.onclick=()=>{
  const res=greedy([1,3,4],6);
  logB.textContent='贪心: '+res.join('+')+' → '+res.length+' 枚（次优！）';
  drawCoins(res, '错误贪心 [1,3,4]→6');
};
runOpt.onclick=()=>{
  logB.textContent='最优: 3+3 → 2 枚';
  drawCoins([3,3], '最优解');
};
''', ("06-tianji.html","田忌赛马"), ("08-huffman.html","哈夫曼")))

    # 08 huffman
    write("08-huffman.html", page("哈夫曼","08-huffman.html", r'''
<section class="hero">
  <div class="eyebrow">图 8 · 编码树</div>
  <h1>哈夫曼树生长动画</h1>
  <p>每次合并权最小的两棵，新树权为二者之和。看森林如何收成一棵。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">🌳 生长</button>
    <button class="btn ghost" id="reset">重置</button>
  </div>
  <div class="stage-wrap light" style="height:400px">
    <canvas class="stage" id="cv" width="1000" height="400"></canvas>
    <div class="stage-hud"><span class="hud-pill light">Huffman</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="log" id="log">初始权: 5,9,12,13,16,45</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let forest=[];
function seed(){
  const w=[5,9,12,13,16,45];
  forest=w.map((v,i)=>({w:v, name:String.fromCharCode(65+i), x:80+i*140, y:320, left:null, right:null}));
  draw(); hud.textContent='n='+forest.length;
}
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  function edges(n){
    if(!n) return;
    if(n.left){ ctx.strokeStyle='#94a3b8'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(n.x,n.y-16); ctx.lineTo(n.left.x,n.left.y+16); ctx.stroke(); edges(n.left); }
    if(n.right){ ctx.strokeStyle='#94a3b8'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(n.x,n.y-16); ctx.lineTo(n.right.x,n.right.y+16); ctx.stroke(); edges(n.right); }
  }
  function node(n){
    if(!n) return;
    node(n.left); node(n.right);
    const g=ctx.createRadialGradient(n.x-5,n.y-5,2,n.x,n.y,18);
    g.addColorStop(0,'#6ee7b7'); g.addColorStop(1,'#059669');
    ctx.beginPath(); ctx.arc(n.x,n.y,18,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 11px ui-monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(n.w, n.x, n.y);
    ctx.fillStyle='#334155'; ctx.font='10px Segoe UI'; ctx.fillText(n.name.length>6?n.name.slice(0,5)+'…':n.name, n.x, n.y+28);
  }
  forest.forEach(r=>{ edges(r); node(r); });
}
function layout(){
  // simple layout: leaves on bottom, parents above mid
  const leaves=[];
  function collect(n){ if(!n.left&&!n.right) leaves.push(n); else { if(n.left)collect(n.left); if(n.right)collect(n.right);} }
  forest.forEach(collect);
  // actually re-layout whole tree if single root
  if(forest.length===1){
    const positions=[];
    let leafI=0;
    function place(n, depth){
      if(!n) return;
      if(!n.left&&!n.right){ n.x=80+(leafI++)*90; n.y=340; return; }
      place(n.left, depth+1); place(n.right, depth+1);
      n.x=((n.left?n.left.x:0)+(n.right?n.right.x:0))/2;
      n.y=60+depth*70;
    }
    // count leaves first for spacing
    leafI=0; place(forest[0],0);
  } else {
    forest.forEach((n,i)=>{ n.x=80+i*150; n.y=320; });
  }
}
run.onclick=async()=>{
  seed();
  let lines=['初始: '+forest.map(x=>x.name+':'+x.w).join(' ')];
  while(forest.length>1){
    forest.sort((a,b)=>a.w-b.w);
    const a=forest.shift(), b=forest.shift();
    const p={w:a.w+b.w, name:`(${a.name}+${b.name})`, left:a, right:b, x:0, y:0};
    forest.push(p);
    layout(); draw();
    lines.push(`合并 ${a.name}(${a.w}) + ${b.name}(${b.w}) → ${p.w}`);
    log.textContent=lines.join('\\n'); hud.textContent='剩余 '+forest.length;
    await sleep(700);
  }
  layout(); draw();
  lines.push('完成 Huffman 树'); log.textContent=lines.join('\\n');
};
reset.onclick=seed; seed();
''', ("07-coin.html","零钱兑换"), ("09-matroid.html","拟阵")))

    # 09 matroid
    write("09-matroid.html", page("拟阵","09-matroid.html", r'''
<section class="hero">
  <div class="eyebrow">图 9 · 理论</div>
  <h1>拟阵 · 贪心正确性的「保险箱」</h1>
  <p>若问题可建模为加权拟阵，则「按权降序加入仍独立的元素」一定得到最优。</p>
</section>
<div class="grid grid-3 stagger">
  <div class="card"><div class="badge">遗传性</div><h3>子集封闭</h3><p class="desc">独立集的子集仍独立</p></div>
  <div class="card"><div class="badge blue">交换性</div><h3>可扩充</div><p class="desc">较小独立集可从较大者借入元素</p></div>
  <div class="card"><div class="badge amber">加权贪心</div><h3>定理</div><p class="desc">按权排序 + 保持独立 ⇒ 最优</p></div>
</div>
<div class="card" style="margin-top:16px">
  <h3>经典例子</h3>
  <div class="list-step"><div class="n">1</div><div class="body"><b>图拟阵</b>：无环边子集 → Kruskal 正确性</div></div>
  <div class="list-step"><div class="n">2</div><div class="body"><b>矩阵拟阵</b>：线性无关列子集</div></div>
  <div class="list-step"><div class="n">3</div><div class="body"><b>均匀拟阵</b>：大小 ≤k 的子集</div></div>
  <div class="tip">不是所有贪心题都是拟阵，但拟阵给出了一大类「可证明」的场景。</div>
</div>
<div class="card" style="margin-top:16px">
  <div class="toolbar"><button class="btn primary" id="run">Kruskal 式加边（拟阵视角）</button></div>
  <div class="log" id="log">边按权加入，不成环则独立</div>
</div>
''', r'''
const edges=[[0,1,1],[1,2,2],[0,2,3],[2,3,4],[1,3,5]];
run.onclick=async()=>{
  const parent=[0,1,2,3];
  const find=x=>parent[x]===x?x:(parent[x]=find(parent[x]));
  const es=edges.slice().sort((a,b)=>a[2]-b[2]);
  let lines=[], tot=0;
  for(const [u,v,w] of es){
    const ru=find(u), rv=find(v);
    if(ru===rv){ lines.push(`跳过 (${u},${v}) w=${w} —— 破坏独立（成环）`); }
    else { parent[ru]=rv; tot+=w; lines.push(`加入 (${u},${v}) w=${w} —— 仍独立`); }
    log.textContent=lines.join('\\n'); await sleep(400);
  }
  lines.push('MST 权='+tot+' （拟阵贪心）'); log.textContent=lines.join('\\n');
};
''', ("08-huffman.html","哈夫曼"), ("10-schedule.html","任务调度")))

    # 10 schedule
    write("10-schedule.html", page("任务调度","10-schedule.html", r'''
<section class="hero">
  <div class="eyebrow">图 10 · 调度</div>
  <h1>任务调度 · 策略可视化</h1>
  <p>单机最小化平均完成时间：最短处理时间优先（SPT）。看甘特图如何排布。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="runSPT">✅ SPT 最短优先</button>
    <button class="btn danger" id="runLPT">❌ 最长优先（对比）</button>
  </div>
  <div class="stage-wrap light" style="height:260px">
    <canvas class="stage" id="cv" width="1000" height="260"></canvas>
  </div>
  <div class="stat-row">
    <div class="stat"><span>平均完成时间</span><b class="green" id="avg">—</b></div>
    <div class="stat"><span>总完成时间</span><b class="blue" id="sum">—</b></div>
  </div>
  <div class="tip">任务处理时间 p=[3,1,4,2,5]。SPT 可证最优（交换论证）。</div>
</div>
''', r'''
const tasks=[3,1,4,2,5];
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const colors=['#34d399','#60a5fa','#a78bfa','#fbbf24','#f87171'];
function draw(order, label){
  ctx.clearRect(0,0,cv.width,cv.height);
  let t=0; const seq=order.map(i=>({i,p:tasks[i]}));
  const total=seq.reduce((s,x)=>s+x.p,0);
  const x0=40, y=100, W=cv.width-80, scale=W/total;
  ctx.fillStyle='#334155'; ctx.font='16px Segoe UI'; ctx.fillText(label, 40, 40);
  let sumC=0, time=0;
  seq.forEach((x,k)=>{
    const w=x.p*scale;
    ctx.fillStyle=colors[x.i%colors.length];
    round(ctx,x0+time*scale,y,w,50,8); ctx.fill();
    ctx.fillStyle='#0f172a'; ctx.font='bold 14px ui-monospace'; ctx.textAlign='center';
    ctx.fillText('T'+(x.i+1)+'('+x.p+')', x0+time*scale+w/2, y+30);
    time+=x.p; sumC+=time;
  });
  // axis
  ctx.strokeStyle='#94a3b8'; ctx.beginPath(); ctx.moveTo(x0,y+70); ctx.lineTo(x0+W,y+70); ctx.stroke();
  avg.textContent=(sumC/seq.length).toFixed(2);
  sum.textContent=sumC;
}
function round(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
runSPT.onclick=()=>{
  const order=[...tasks.keys()].sort((a,b)=>tasks[a]-tasks[b]);
  draw(order, 'SPT 最短处理时间优先（最优）');
};
runLPT.onclick=()=>{
  const order=[...tasks.keys()].sort((a,b)=>tasks[b]-tasks[a]);
  draw(order, '最长优先（通常更差）');
};
draw([...tasks.keys()], '原始顺序');
''', ("09-matroid.html","拟阵"), ("index.html","返回总览")))

    print("\n第8章强交互可视化版完成 →", OUT)

if __name__ == "__main__":
    build()
