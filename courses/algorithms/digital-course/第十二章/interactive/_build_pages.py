# -*- coding: utf-8 -*-
"""
第12章 概率算法和近似算法 · 强交互 / 强可视化版
投点求π · 蒙特卡罗 · 拉斯维加斯 · LPT 调度 · TSP 近似 · 离线可用
"""
from pathlib import Path
OUT = Path(__file__).resolve().parent

CSS = r"""
:root{
  --bg:#fffbeb; --surface:#fff; --s2:#fff7ed; --s3:#ffedd5;
  --text:#0b1220; --muted:#5a6b85; --faint:#8b9bb5;
  --line:rgba(217,119,6,.16); --line2:rgba(217,119,6,.28);
  --amber:#d97706; --amber2:#b45309; --amberS:rgba(217,119,6,.1);
  --orange:#ea580c; --orangeS:rgba(234,88,12,.1);
  --blue:#2563eb; --blueS:rgba(37,99,235,.1);
  --green:#059669; --greenS:rgba(5,150,105,.1);
  --red:#dc2626; --redS:rgba(220,38,38,.09);
  --violet:#7c3aed; --cyan:#0891b2;
  --shadow:0 8px 28px rgba(217,119,6,.12); --shadow2:0 22px 50px rgba(217,119,6,.18);
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
    radial-gradient(1100px 560px at 5% -8%,rgba(217,119,6,.14),transparent 55%),
    radial-gradient(900px 480px at 95% 0%,rgba(234,88,12,.1),transparent 50%),
    radial-gradient(700px 400px at 50% 110%,rgba(5,150,105,.06),transparent 45%),
    linear-gradient(180deg,#fffdf7,#fffbeb 50%,#ffedd5);
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
  background:linear-gradient(135deg,#fbbf24,#d97706 55%,#ea580c);color:#fff;
  font:800 11px var(--mono);box-shadow:0 6px 16px rgba(217,119,6,.4);
  transform:perspective(200px) rotateY(-8deg);transition:transform .3s var(--ease)}
.nav .brand:hover .logo{transform:perspective(200px) rotateY(8deg) scale(1.05)}
.nav .brand span{color:var(--amber)}
.nav .links{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end;max-width:min(100%,920px)}
.nav a.pill{font-size:11.5px;font-weight:700;padding:6px 10px;border-radius:999px;color:var(--muted);border:1px solid transparent;transition:.2s var(--ease)}
.nav a.pill:hover{color:var(--amber);background:var(--amberS);border-color:var(--line)}
.nav a.pill.active{color:#fff;background:linear-gradient(135deg,#fbbf24,#d97706);box-shadow:0 4px 14px rgba(217,119,6,.35)}
.wrap{max-width:1160px;margin:0 auto;padding:26px 16px 70px}
.hero{margin-bottom:24px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;color:var(--amber);
  letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:999px;background:var(--amberS);
  border:1px solid rgba(217,119,6,.22);margin-bottom:12px}
.hero h1{font-size:clamp(1.55rem,3.3vw,2.4rem);line-height:1.15;font-weight:900;letter-spacing:-.025em;margin-bottom:12px;
  background:linear-gradient(120deg,#0b1220,#92400e 30%,#d97706 55%,#ea580c 90%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{color:var(--muted);font-size:1.04rem;max-width:780px;line-height:1.7}
.hero-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:12.5px;font-weight:700;
  background:#fff;border:1px solid var(--line);color:var(--muted);box-shadow:0 2px 8px rgba(15,23,42,.04)}
.chip.amber{background:var(--amberS);color:var(--amber)} .chip.orange{background:var(--orangeS);color:var(--orange)}
.chip.green{background:var(--greenS);color:var(--green)} .chip.blue{background:var(--blueS);color:var(--blue)}
.grid{display:grid;gap:16px}
.grid-2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.grid-3{grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px;box-shadow:var(--shadow);
  position:relative;overflow:hidden;transition:transform .28s var(--ease),box-shadow .28s,border-color .28s}
.card:hover{transform:translateY(-3px);box-shadow:var(--shadow2);border-color:var(--line2)}
.card::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--accent,linear-gradient(90deg,#fbbf24,#ea580c))}
.card h3{font-size:1.08rem;font-weight:800;margin-bottom:8px}
.card p,.desc{color:var(--muted);line-height:1.65;font-size:.94rem}
.badge{display:inline-flex;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;margin-bottom:10px;
  background:var(--amberS);color:var(--amber);border:1px solid rgba(217,119,6,.2)}
.badge.green{background:var(--greenS);color:var(--green)} .badge.blue{background:var(--blueS);color:var(--blue)}
.badge.orange{background:var(--orangeS);color:var(--orange)}
a.feature-card{display:flex;flex-direction:column;min-height:158px;padding:18px;border-radius:var(--r);
  background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);position:relative;overflow:hidden;
  transition:transform .3s var(--ease),box-shadow .3s}
a.feature-card::after{content:attr(data-ico);position:absolute;right:12px;top:10px;font-size:40px;opacity:.14;transition:.35s var(--ease)}
a.feature-card:hover{transform:translateY(-8px) scale(1.015);box-shadow:var(--shadow2);
  border-color:color-mix(in srgb,var(--c,#d97706) 40%,transparent)}
a.feature-card:hover::after{opacity:.28;transform:scale(1.15) rotate(8deg)}
a.feature-card .num{font:800 12px var(--mono);color:var(--c,#d97706);letter-spacing:.06em;margin-bottom:8px}
a.feature-card h3{font-size:1.08rem;margin-bottom:6px}
a.feature-card p{color:var(--muted);font-size:.87rem;line-height:1.55;flex:1}
a.feature-card .go{margin-top:12px;font-size:12.5px;font-weight:800;color:var(--c,#d97706);opacity:0;transform:translateX(-8px);transition:.25s}
a.feature-card:hover .go{opacity:1;transform:none}
.btn{appearance:none;border:1px solid var(--line);background:var(--s2);color:var(--text);
  padding:10px 16px;border-radius:13px;cursor:pointer;font-weight:800;font-size:13.5px;
  transition:.2s var(--ease);display:inline-flex;align-items:center;gap:6px}
.btn:hover{border-color:var(--line2);background:#fff;color:var(--amber);transform:translateY(-1px)}
.btn:active{transform:scale(.98)}
.btn.primary{background:linear-gradient(135deg,#fbbf24,#d97706);border:none;color:#fff;box-shadow:0 8px 20px rgba(217,119,6,.32)}
.btn.primary:hover{filter:brightness(1.06);color:#fff}
.btn.ghost{background:transparent}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important}
.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0}
.toolbar label{font-size:12.5px;color:var(--muted);font-weight:700}
.tip{margin-top:12px;padding:13px 15px;border-radius:15px;background:linear-gradient(135deg,var(--amberS),var(--orangeS));
  border:1px solid var(--line);color:var(--muted);font-size:13.5px;line-height:1.65}
.tip strong{color:var(--text)}
.tip.ok{background:var(--greenS);border-color:rgba(5,150,105,.25)}
.formula{font-family:var(--mono);background:linear-gradient(135deg,#fffbeb,#fff7ed);border:1px solid rgba(217,119,6,.25);
  border-radius:16px;padding:16px 18px;margin-top:10px;color:var(--amber2);font-size:15px;line-height:1.55;text-align:center;font-weight:750}
.formula.lg{font-size:clamp(1.05rem,2.4vw,1.45rem);padding:20px}
.code{font-family:var(--mono);font-size:12.5px;line-height:1.7;background:#0f172a;color:#e2e8f0;border-radius:16px;
  padding:15px 16px;overflow:auto;white-space:pre;margin-top:10px}
.code .cm{color:#64748b}.code .kw{color:#fcd34d}.code .fn{color:#fdba74}
.stat-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.stat{flex:1;min-width:100px;background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px}
.stat span{font-size:11.5px;color:var(--faint);font-weight:700}
.stat b{display:block;font-size:1.25rem;margin-top:4px;font-weight:900;font-variant-numeric:tabular-nums}
.stat b.amber{color:var(--amber)}.stat b.green{color:var(--green)}.stat b.red{color:var(--red)}.stat b.blue{color:var(--blue)}.stat b.orange{color:var(--orange)}
.list-step{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;margin:8px 0;border-radius:14px;border:1px solid var(--line);background:#fff}
.list-step .n{flex-shrink:0;width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,#fbbf24,#d97706);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900}
.list-step .body{flex:1;font-size:.92rem;color:var(--muted);line-height:1.55}
.list-step .body b{color:var(--text)}
.stage-wrap{position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow);background:#0b1220}
.stage-wrap.light{background:
  linear-gradient(rgba(217,119,6,.04) 1px,transparent 1px),
  linear-gradient(90deg,rgba(234,88,12,.04) 1px,transparent 1px),#f8fafc;
  background-size:24px 24px,24px 24px,auto}
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
.cell.on{border-color:var(--amber);background:var(--amberS);color:var(--amber);transform:translateY(-4px) scale(1.06)}
.cell.hit{border-color:var(--green);background:var(--greenS);color:var(--green)}
.cell.dead{border-color:var(--red);background:var(--redS);color:var(--red)}
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
.pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--amber);box-shadow:0 0 0 0 rgba(217,119,6,.45);animation:pulse 1.6s infinite;display:inline-block}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(217,119,6,.45)}70%{box-shadow:0 0 0 10px transparent}}
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
      ctx.fillStyle=`rgba(217,119,6,${p.a})`; ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  addEventListener('resize',resize); resize(); tick();
})();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
"""

LINKS = [
    ("index.html","总览"),
    ("01-prob.html","概率概述"),
    ("02-pi.html","求π"),
    ("03-monte.html","蒙特卡罗"),
    ("04-vegas.html","拉斯维加斯"),
    ("05-sherwood.html","舍伍德"),
    ("06-approx.html","近似概述"),
    ("07-sched.html","多机调度"),
    ("08-knapsack.html","背包近似"),
    ("09-tsp.html","TSP近似"),
]
CH = "第12章 概率算法和近似算法"

def nav(active):
    pills="".join(f'<a class="{"pill active" if h==active else "pill"}" href="{h}">{lab}</a>' for h,lab in LINKS)
    return f'''<div class="fx-bg" aria-hidden="true"></div>
<nav class="nav"><div class="brand"><div class="logo">12</div>算法可视化 · <span>{CH}</span></div>
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
<div class="footer">算法设计与分析 · <b>{CH}</b> · 强交互可视化版<br/>随机 · 近似 · 建议全屏投影</div>
</div>
<script>
{COMMON_JS}
{js}
</script></body></html>"""

def write(name, html):
    (OUT/name).write_text(html, encoding="utf-8")
    print("✓", name)


def build():
    items = [
        ("01-prob.html","01","概率算法概述","随机化三类","🎲","#d97706"),
        ("02-pi.html","02","投点法求 π","数值概率","π","#ea580c"),
        ("03-monte.html","03","蒙特卡罗主元素","高概率正确","🎯","#2563eb"),
        ("04-vegas.html","04","拉斯维加斯 n 皇后","结果对时间飘","♛","#7c3aed"),
        ("05-sherwood.html","05","舍伍德随机选择","抹平最坏输入","🔀","#059669"),
        ("06-approx.html","06","近似算法概述","近似比 ρ","≈","#d97706"),
        ("07-sched.html","07","多机调度 LPT","makespan","⚙️","#ea580c"),
        ("08-knapsack.html","08","背包近似","FPTAS 思想","🎒","#2563eb"),
        ("09-tsp.html","09","度量 TSP 近似","MST 二倍遍历","🗺️","#7c3aed"),
    ]
    cards="".join(
        f'''<a class="feature-card" href="{h}" data-ico="{ico}" style="--c:{c}">
        <div class="num">§ {n}</div><h3>{t}</h3><p>{d}</p><div class="go">进入演示 →</div></a>'''
        for h,n,t,d,ico,c in items
    )
    write("index.html", page("概率与近似总览", "index.html", f'''
<section class="hero">
  <div class="eyebrow"><span class="pulse-dot"></span> Chapter 12 · Randomized & Approximation</div>
  <h1>第12章 概率算法与近似算法</h1>
  <p>面对难解问题：要么<strong>随机化</strong>（高概率/期望正确），要么<strong>近似</strong>（多项式时间 + 质量保证）。</p>
  <div class="hero-meta">
    <span class="chip amber">9 节交互</span>
    <span class="chip orange">投点求 π</span>
    <span class="chip green">LPT 调度</span>
    <span class="chip blue">离线 Canvas</span>
  </div>
</section>
<div class="grid grid-3 stagger">{cards}</div>
''', "", None, ("01-prob.html","概率概述")))

    write("01-prob.html", page("概率概述", "01-prob.html", r'''
<section class="hero">
  <div class="eyebrow">图 1 · 分类</div>
  <h1>概率算法概述</h1>
  <p>用随机性换期望性能、高概率正确，或抹平最坏输入。点击卡片高亮对比四类特征。</p>
</section>
<div class="grid grid-2" id="cards">
  <div class="card kind" data-k="num" style="cursor:pointer"><span class="badge">数值概率</span>
    <h3>Numerical</h3><p>近似解，精度随采样/时间提高（如投点求 π）。</p></div>
  <div class="card kind" data-k="mc" style="cursor:pointer"><span class="badge blue">蒙特卡罗</span>
    <h3>Monte Carlo</h3><p>时间确定；结果<strong>可能错</strong>，错误率可指数下降。</p></div>
  <div class="card kind" data-k="lv" style="cursor:pointer"><span class="badge orange">拉斯维加斯</span>
    <h3>Las Vegas</h3><p>结果正确（或报告失败）；<strong>时间是随机变量</strong>。</p></div>
  <div class="card kind" data-k="sh" style="cursor:pointer"><span class="badge green">舍伍德</span>
    <h3>Sherwood</h3><p>总正确；随机化消除特定最坏输入。</p></div>
</div>
<div class="card" style="margin-top:14px">
  <div class="stage-wrap light" style="height:200px">
    <canvas class="stage" id="cv" width="1000" height="200"></canvas>
  </div>
  <div class="tip" id="tip">点击上方卡片，对比「时间是否确定 / 结果是否一定对」。</div>
</div>
''', r'''
const meta={
  num:{t:'数值概率', time:'随精度变', ok:'近似解', col:'#d97706'},
  mc:{t:'蒙特卡罗', time:'确定', ok:'高概率对', col:'#2563eb'},
  lv:{t:'拉斯维加斯', time:'随机', ok:'一定对/失败', col:'#ea580c'},
  sh:{t:'舍伍德', time:'期望稳', ok:'一定对', col:'#059669'},
};
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function draw(k){
  ctx.clearRect(0,0,cv.width,cv.height);
  const m=meta[k]||meta.mc;
  ctx.fillStyle='#0f172a'; ctx.font='bold 22px sans-serif'; ctx.fillText(m.t, 40, 50);
  // axes labels
  ctx.font='14px sans-serif'; ctx.fillStyle='#64748b';
  ctx.fillText('时间 →', 40, 160); ctx.fillText('正确性 →', 400, 160);
  // markers
  const tx=m.time==='确定'?120:(m.time==='随机'?280:200);
  const ox=m.ok.includes('一定')?720:600;
  ctx.beginPath(); ctx.arc(tx,100,18,0,Math.PI*2); ctx.fillStyle=m.col; ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='bold 11px sans-serif'; ctx.fillText('T', tx-5, 104);
  ctx.beginPath(); ctx.arc(ox,100,18,0,Math.PI*2); ctx.fillStyle=m.col; ctx.fill();
  ctx.fillStyle='#fff'; ctx.fillText('✓', ox-6, 104);
  ctx.fillStyle=m.col; ctx.font='13px sans-serif';
  ctx.fillText('时间：'+m.time, 40, 80); ctx.fillText('结果：'+m.ok, 400, 80);
  tip.innerHTML='<strong>'+m.t+'：</strong>时间 '+m.time+' · 结果 '+m.ok;
}
document.querySelectorAll('.kind').forEach(el=>{
  el.onclick=()=>{
    document.querySelectorAll('.kind').forEach(x=>x.style.outline='');
    el.style.outline='2px solid #d97706';
    draw(el.dataset.k);
  };
});
draw('mc');
''', ("index.html","总览"), ("02-pi.html","求π")))

    write("02-pi.html", page("求π", "02-pi.html", r'''
<section class="hero">
  <div class="eyebrow">图 2 · 数值概率</div>
  <h1>投点法估计 π</h1>
  <p>正方形内切圆：π ≈ 4 × (圆内点数 / 总点数)。点数越多，估计越稳。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">投 1000 点</button>
    <button class="btn" id="mega">投 5000</button>
    <button class="btn" id="reset">清空</button>
  </div>
  <div class="stage-wrap light" style="height:380px;max-width:380px;margin:0 auto">
    <canvas class="stage" id="cv" width="380" height="380"></canvas>
    <div class="stage-hud"><span class="hud-pill light">Monte Carlo π</span><span class="hud-pill light" id="hud">0 pts</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>π 估计</span><b class="amber" id="est">?</b></div>
    <div class="stat"><span>相对误差</span><b class="orange" id="err">—</b></div>
    <div class="stat"><span>圆内 / 总</span><b class="green" id="cnt">0/0</b></div>
  </div>
  <div class="formula">π ≈ 4 · N<sub>in</sub> / N<sub>total</sub></div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let inn=0,tot=0;
const m=30, side=320, cx=m+side/2, cy=m+side/2, r=side/2;
function frame(){
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=2; ctx.strokeRect(m,m,side,side);
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.strokeStyle='#d97706'; ctx.stroke();
  ctx.fillStyle='rgba(217,119,6,.06)'; ctx.fill();
}
function clear(){
  inn=0;tot=0; frame(); est.textContent='?'; err.textContent='—'; cnt.textContent='0/0'; hud.textContent='0 pts';
}
async function throwN(n){
  for(let i=0;i<n;i++){
    const x=m+Math.random()*side, y=m+Math.random()*side;
    const ok=(x-cx)**2+(y-cy)**2<=r*r; tot++; if(ok)inn++;
    ctx.fillStyle=ok?'#059669':'#dc2626'; ctx.fillRect(x-1.2,y-1.2,2.4,2.4);
    if(i%100===0){
      const e=4*inn/tot; est.textContent=e.toFixed(6);
      err.textContent=((Math.abs(e-Math.PI)/Math.PI)*100).toFixed(3)+'%';
      cnt.textContent=inn+'/'+tot; hud.textContent=tot+' pts';
      await sleep(0);
    }
  }
  const e=4*inn/tot; est.textContent=e.toFixed(6);
  err.textContent=((Math.abs(e-Math.PI)/Math.PI)*100).toFixed(3)+'%';
  cnt.textContent=inn+'/'+tot; hud.textContent=tot+' pts';
}
reset.onclick=clear; run.onclick=()=>throwN(1000); mega.onclick=()=>throwN(5000); clear();
''', ("01-prob.html","概率概述"), ("03-monte.html","蒙特卡罗")))

    write("03-monte.html", page("蒙特卡罗", "03-monte.html", r'''
<section class="hero">
  <div class="eyebrow">图 3 · Monte Carlo</div>
  <h1>蒙特卡罗 · 主元素</h1>
  <p>随机抽元素检查是否出现 &gt; n/2 次。返回 true 则一定对（偏真）；false 可能漏。重复 k 次错误率 &lt; 2⁻ᵏ。</p>
</section>
<div class="card">
  <div class="cells" id="arr"></div>
  <div class="toolbar">
    <button class="btn primary" id="run">随机抽 8 次</button>
    <button class="btn" id="reshuf">换数组</button>
  </div>
  <div class="stat-row">
    <div class="stat"><span>命中主元次数</span><b class="green" id="hits">0</b></div>
    <div class="stat"><span>理论错误上界</span><b class="amber" id="bound">2⁻⁸</b></div>
  </div>
  <div class="log" id="log">主元素 = 出现超过 n/2 次的值（此处为 7）。</div>
  <div class="tip">MC：时间稳、可能错；重复独立试验使错误概率指数下降。</div>
</div>
''', r'''
let a=[7,3,7,7,2,7,1,7,7,4,7,5,7];
function show(hi=-1, mode=''){
  arr.innerHTML=a.map((v,j)=>`<div class="cell ${j===hi?(mode||'on'):''}">${v}</div>`).join('');
}
show();
run.onclick=async()=>{
  let lines=[], h=0;
  for(let t=0;t<8;t++){
    const i=Math.floor(Math.random()*a.length), cand=a[i];
    const cnt=a.filter(x=>x===cand).length, ok=cnt>a.length/2;
    if(ok) h++;
    show(i, ok?'hit':'dead');
    lines.push(`#${t+1} 抽 a[${i}]=${cand} 出现 ${cnt} 次 ${ok?'✓ 主元':'✗'}`);
    log.textContent=lines.join('\\n'); hits.textContent=h; await sleep(400);
  }
  lines.push(`8 次中命中主元 ${h} 次 · 若每次失败概率≤1/2，则全错 ≤ 2⁻⁸`);
  log.textContent=lines.join('\\n'); bound.textContent='≤ 2⁻⁸';
};
reshuf.onclick=()=>{
  const maj=5+Math.floor(Math.random()*5);
  a=Array.from({length:13},(_,i)=> i<8?maj:Math.floor(Math.random()*9));
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  show(); log.textContent='新数组主元约为 '+maj+'（出现>6次）'; hits.textContent='0';
};
''', ("02-pi.html","求π"), ("04-vegas.html","拉斯维加斯")))

    write("04-vegas.html", page("拉斯维加斯", "04-vegas.html", r'''
<section class="hero">
  <div class="eyebrow">图 4 · Las Vegas</div>
  <h1>拉斯维加斯 · 随机化 n 皇后</h1>
  <p>随机决定放子顺序；成功则解一定正确；失败则重来。时间是随机变量。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 随机尝试直到成功</button>
    <button class="btn" id="once">只试一次</button>
  </div>
  <div class="stage-wrap light" style="height:360px;max-width:360px;margin:0 auto">
    <canvas class="stage" id="cv" width="360" height="360"></canvas>
    <div class="stage-hud"><span class="hud-pill light">n=8 Queens</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>尝试次数</span><b class="amber" id="tries">0</b></div>
    <div class="stat"><span>状态</span><b class="green" id="st">就绪</b></div>
  </div>
  <div class="formula">结果正确（或报告失败） · 运行时间随机</div>
  <div class="tip">对比蒙特卡罗：MC 时间稳、可能错；LV 结果稳、时间飘。</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const N=8, cell=360/N;
function draw(board, conflict=null){
  ctx.clearRect(0,0,360,360);
  for(let r=0;r<N;r++) for(let c=0;c<N;c++){
    ctx.fillStyle=(r+c)%2? '#ffedd5':'#fff7ed';
    ctx.fillRect(c*cell,r*cell,cell,cell);
  }
  if(board){
    board.forEach((c,r)=>{
      if(c<0) return;
      ctx.font=`${cell*0.6}px serif`; ctx.textAlign='center';
      ctx.fillStyle=(conflict&&conflict.has(r))?'#dc2626':'#b45309';
      ctx.fillText('♛', c*cell+cell/2, r*cell+cell*0.72);
    });
  }
}
function safe(board,row,col){
  for(let r=0;r<row;r++){
    if(board[r]===col||Math.abs(board[r]-col)===row-r) return false;
  }
  return true;
}
function tryOnce(){
  const board=Array(N).fill(-1);
  const order=Array.from({length:N},(_,i)=>i);
  for(let i=N-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; }
  // place row by row with random column perm attempt
  function dfs(row){
    if(row===N) return true;
    const cols=order.slice();
    for(let i=cols.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [cols[i],cols[j]]=[cols[j],cols[i]]; }
    for(const c of cols){
      if(safe(board,row,c)){ board[row]=c; if(dfs(row+1)) return true; board[row]=-1; }
    }
    return false;
  }
  const ok=dfs(0);
  return {ok, board};
}
async function runAll(limit=200){
  let t=0;
  while(t<limit){
    t++; tries.textContent=t;
    const {ok,board}=tryOnce();
    draw(board);
    if(ok){ hud.textContent='成功！'; st.textContent='FOUND'; st.className='green'; return; }
    hud.textContent='失败重试…'; st.textContent='retry'; await sleep(40);
  }
  st.textContent='达上限';
}
run.onclick=()=>runAll();
once.onclick=()=>{
  const {ok,board}=tryOnce();
  draw(board); tries.textContent='1';
  st.textContent=ok?'FOUND':'FAIL'; st.className=ok?'green':'red';
  hud.textContent=ok?'一次成功':'本次失败';
};
draw(null);
''', ("03-monte.html","蒙特卡罗"), ("05-sherwood.html","舍伍德")))

    write("05-sherwood.html", page("舍伍德", "05-sherwood.html", r'''
<section class="hero">
  <div class="eyebrow">图 5 · Sherwood</div>
  <h1>舍伍德 · 随机快速选择</h1>
  <p>随机选 pivot 划分，期望 O(n) 找第 k 小。消除有序输入导致的最坏 O(n²)。</p>
</section>
<div class="card">
  <div class="toolbar">
    <label>k（第 k 小，1-based）= <b id="kv">5</b></label>
    <input type="range" id="kr" min="1" max="12" value="5" style="width:160px;accent-color:#d97706"/>
    <button class="btn primary" id="run">▶ 随机选择</button>
    <button class="btn" id="bad">有序最坏输入</button>
  </div>
  <div class="cells" id="arr"></div>
  <div class="stat-row">
    <div class="stat"><span>结果</span><b class="amber" id="ans">—</b></div>
    <div class="stat"><span>比较次数（示意）</span><b class="orange" id="cmp">0</b></div>
  </div>
  <div class="log" id="log">随机 pivot 使任意固定输入的期望代价平滑。</div>
  <div class="code"><span class="cm">// 随机化 select</span>
random pivot → partition
<span class="kw">if</span> k in left: recurse left
<span class="kw">else if</span> k is pivot: <span class="fn">return</span>
<span class="kw">else</span> recurse right</div>
</div>
''', r'''
let a=[4,1,9,2,7,3,8,6,5,12,10,11];
let cmps=0;
function show(lo,hi,piv=-1,found=-1){
  arr.innerHTML=a.map((v,i)=>{
    let cls='';
    if(i===found) cls='hit';
    else if(i===piv) cls='on';
    else if(i>=lo&&i<=hi) cls='';
    else cls='dead';
    return `<div class="cell ${cls}">${v}</div>`;
  }).join('');
}
function partition(lo,hi,p){
  const pivot=a[p]; [a[p],a[hi]]=[a[hi],a[p]];
  let i=lo;
  for(let j=lo;j<hi;j++){ cmps++; if(a[j]<pivot){ [a[i],a[j]]=[a[j],a[i]]; i++; } }
  [a[i],a[hi]]=[a[hi],a[i]]; return i;
}
async function select(lo,hi,k){ // k 0-based
  if(lo===hi) return a[lo];
  const p=lo+Math.floor(Math.random()*(hi-lo+1));
  show(lo,hi,p); log.textContent=`区间 [${lo},${hi}] pivot=a[${p}]=${a[p]}`; await sleep(450);
  const mid=partition(lo,hi,p);
  show(lo,hi,mid); await sleep(300);
  if(k===mid) return a[mid];
  if(k<mid) return select(lo,mid-1,k);
  return select(mid+1,hi,k);
}
kr.oninput=()=>kv.textContent=kr.value;
run.onclick=async()=>{
  cmps=0; const k=+kr.value-1;
  const v=await select(0,a.length-1,k);
  ans.textContent=v; cmp.textContent=cmps;
  const idx=a.indexOf(v); show(0,a.length-1,-1,idx);
  log.textContent=`第 ${k+1} 小 = ${v} · 比较约 ${cmps} 次`;
};
bad.onclick=()=>{ a=Array.from({length:12},(_,i)=>i+1); show(0,11); log.textContent='已设为有序：确定性 pivot 最坏，随机 pivot 仍期望线性'; ans.textContent='—'; };
show(0,11);
''', ("04-vegas.html","拉斯维加斯"), ("06-approx.html","近似概述")))

    write("06-approx.html", page("近似概述", "06-approx.html", r'''
<section class="hero">
  <div class="eyebrow">图 6 · 近似比</div>
  <h1>近似算法概述</h1>
  <p>对 NP-hard 优化问题，多项式时间给出有保证的次优解。拖动滑块观察 ρ 与解质量。</p>
</section>
<div class="card">
  <div class="grid grid-2">
    <div>
      <div class="list-step"><div class="n">min</div><div class="body"><b>最小化</b> ALG ≤ ρ · OPT（ρ≥1）</div></div>
      <div class="list-step"><div class="n">max</div><div class="body"><b>最大化</b> ALG ≥ OPT / ρ</div></div>
      <div class="toolbar">
        <label>ρ = <b id="rv">1.5</b></label>
        <input type="range" id="rr" min="10" max="30" value="15" style="width:200px;accent-color:#d97706"/>
      </div>
      <div class="tip">ρ 越接近 1 越好。PTAS / FPTAS 可让误差任意小（时间随 1/ε 变差）。</div>
    </div>
    <div class="stage-wrap light" style="height:260px">
      <canvas class="stage" id="cv" width="480" height="260"></canvas>
    </div>
  </div>
  <div class="formula lg" style="margin-top:12px">ρ-近似：解的质量与 OPT 之比有界</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const OPT=100;
function draw(rho){
  rv.textContent=rho.toFixed(1);
  const ALG=OPT*rho; // min problem: ALG can be up to rho*OPT
  ctx.clearRect(0,0,cv.width,cv.height);
  const base=40, maxH=180, scale=maxH/(OPT*3);
  // OPT bar
  const hO=OPT*scale, hA=ALG*scale;
  ctx.fillStyle='#059669'; ctx.fillRect(100,220-hO,80,hO);
  ctx.fillStyle='#d97706'; ctx.fillRect(280,220-hA,80,hA);
  ctx.fillStyle='#0f172a'; ctx.font='bold 13px sans-serif';
  ctx.fillText('OPT', 118, 240); ctx.fillText('ALG≤ρ·OPT', 270, 240);
  ctx.fillText(String(OPT), 120, 210-hO); ctx.fillText(ALG.toFixed(0), 300, 210-hA);
  ctx.strokeStyle='#e11d48'; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(90,220-hO*rho); ctx.lineTo(380,220-hO*rho); ctx.stroke();
  ctx.setLineDash([]); ctx.fillStyle='#e11d48'; ctx.fillText('ρ·OPT 上界', 390, 224-hO*rho);
}
rr.oninput=()=>draw(+rr.value/10); draw(1.5);
''', ("05-sherwood.html","舍伍德"), ("07-sched.html","多机调度")))

    write("07-sched.html", page("多机调度", "07-sched.html", r'''
<section class="hero">
  <div class="eyebrow">图 7 · 调度近似</div>
  <h1>多机调度 · 列表 / LPT</h1>
  <p>n 任务 m 机器，最小化完工时间 makespan。列表调度近似比 2−1/m；LPT 更优。</p>
</section>
<div class="card">
  <div class="toolbar">
    <label>机器 m=3</label>
    <button class="btn" id="list">列表调度（到达序）</button>
    <button class="btn primary" id="lpt">LPT（最长优先）</button>
  </div>
  <div class="stage-wrap light" style="height:320px">
    <canvas class="stage" id="cv" width="1000" height="320"></canvas>
    <div class="stage-hud"><span class="hud-pill light">makespan</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>makespan</span><b class="amber" id="ms">—</b></div>
    <div class="stat"><span>下界 LB</span><b class="green" id="lb">—</b></div>
    <div class="stat"><span>ALG/LB</span><b class="orange" id="ratio">—</b></div>
  </div>
  <div class="tip">LB = max( max pᵢ , Σpᵢ / m )。LPT：先按加工时间降序，再每次放当前负载最小机器。</div>
</div>
''', r'''
const jobs=[9,8,7,6,5,4,3,3,2]; // processing times
const m=3;
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const cols=['#d97706','#ea580c','#f59e0b','#fbbf24','#f97316','#fb923c','#fdba74','#fcd34d','#fde68a'];
function schedule(order){
  const load=Array(m).fill(0), assign=Array.from({length:m},()=>[]);
  order.forEach(ji=>{
    let best=0; for(let i=1;i<m;i++) if(load[i]<load[best]) best=i;
    assign[best].push(ji); load[best]+=jobs[ji];
  });
  return {assign, load, ms:Math.max(...load)};
}
function draw(res){
  ctx.clearRect(0,0,cv.width,cv.height);
  const rowH=70, scale=18, left=80;
  for(let i=0;i<m;i++){
    const y=40+i*rowH;
    ctx.fillStyle='#64748b'; ctx.font='13px sans-serif'; ctx.fillText('M'+(i+1), 20, y+28);
    let x=left;
    res.assign[i].forEach(ji=>{
      const w=jobs[ji]*scale;
      ctx.fillStyle=cols[ji%cols.length];
      ctx.fillRect(x,y,w-3,48);
      ctx.fillStyle='#fff'; ctx.font='bold 12px sans-serif';
      ctx.fillText('J'+(ji+1)+'('+jobs[ji]+')', x+6, y+30);
      x+=w;
    });
    ctx.strokeStyle='#cbd5e1'; ctx.strokeRect(left,y, res.ms*scale, 48);
  }
  hud.textContent='Cmax='+res.ms;
  ms.textContent=res.ms;
  const LB=Math.max(Math.max(...jobs), Math.ceil(jobs.reduce((a,b)=>a+b,0)/m));
  lb.textContent=LB; ratio.textContent=(res.ms/LB).toFixed(2);
}
list.onclick=()=>draw(schedule(jobs.map((_,i)=>i)));
lpt.onclick=()=>{
  const order=jobs.map((p,i)=>[p,i]).sort((a,b)=>b[0]-a[0]).map(x=>x[1]);
  draw(schedule(order));
};
lpt.onclick();
''', ("06-approx.html","近似概述"), ("08-knapsack.html","背包近似")))

    write("08-knapsack.html", page("背包近似", "08-knapsack.html", r'''
<section class="hero">
  <div class="eyebrow">图 8 · FPTAS 思想</div>
  <h1>背包问题的近似</h1>
  <p>对价值缩放后做 DP，用精度换时间，得到 (1−ε) 近似。贪心按价值密度也可给常数近似。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="dens">价值密度贪心</button>
    <button class="btn" id="opt">最优（小实例枚举）</button>
  </div>
  <div id="items"></div>
  <div class="stat-row">
    <div class="stat"><span>容量 W</span><b class="blue">15</b></div>
    <div class="stat"><span>ALG 价值</span><b class="amber" id="alg">—</b></div>
    <div class="stat"><span>OPT 价值</span><b class="green" id="optv">—</b></div>
    <div class="stat"><span>ALG/OPT</span><b class="orange" id="rat">—</b></div>
  </div>
  <div class="formula">缩放价值 → DP 状态数下降 → 误差可控（FPTAS）</div>
  <div class="tip">0/1 背包有 FPTAS；这是伪多项式 DP 的典型用法。</div>
</div>
''', r'''
const items=[{w:2,v:6},{w:3,v:8},{w:4,v:10},{w:5,v:11},{w:6,v:12},{w:7,v:14}];
const W=15;
function render(sel=new Set()){
  document.getElementById('items').innerHTML=items.map((it,i)=>`
    <div class="list-step" style="${sel.has(i)?'border-color:#d97706;background:#fffbeb':''}">
      <div class="n">${i+1}</div>
      <div class="body">物品 ${i+1} · w=${it.w} v=${it.v} · 密度 ${(it.v/it.w).toFixed(2)} ${sel.has(i)?'← 选中':''}</div>
    </div>`).join('');
}
function greedy(){
  const order=items.map((it,i)=>({...it,i,d:it.v/it.w})).sort((a,b)=>b.d-a.d);
  let rem=W, val=0; const sel=new Set();
  for(const it of order){ if(it.w<=rem){ rem-=it.w; val+=it.v; sel.add(it.i);} }
  render(sel); alg.textContent=val; return val;
}
function exact(){
  let best=0, bestS=0, n=items.length;
  for(let m=0;m<(1<<n);m++){
    let w=0,v=0;
    for(let i=0;i<n;i++) if(m>>i&1){ w+=items[i].w; v+=items[i].v; }
    if(w<=W && v>best){ best=v; bestS=m; }
  }
  const sel=new Set(); for(let i=0;i<n;i++) if(bestS>>i&1) sel.add(i);
  render(sel); optv.textContent=best; return best;
}
dens.onclick=()=>{ const a=greedy(); const o=+optv.textContent||exact(); rat.textContent=(a/o).toFixed(3); };
opt.onclick=()=>{ const o=exact(); const a=+alg.textContent||greedy(); rat.textContent=(a/o).toFixed(3); };
render();
''', ("07-sched.html","多机调度"), ("09-tsp.html","TSP近似")))

    write("09-tsp.html", page("TSP近似", "09-tsp.html", r'''
<section class="hero">
  <div class="eyebrow">图 9 · 度量 TSP</div>
  <h1>度量 TSP 近似 · MST 二倍遍历</h1>
  <p>满足三角不等式时：求 MST → 二倍边欧拉环游 → 短路成哈密顿回路，得 2-近似；Christofides ≈1.5。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn" id="mst">① 求 MST</button>
    <button class="btn" id="tour">② 二倍遍历短路</button>
    <button class="btn primary" id="all">一键演示</button>
    <button class="btn" id="rand">随机点</button>
  </div>
  <div class="stage-wrap light" style="height:400px">
    <canvas class="stage" id="cv" width="1000" height="400"></canvas>
    <div class="stage-hud"><span class="hud-pill light">metric TSP</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>MST 权</span><b class="green" id="mw">—</b></div>
    <div class="stat"><span>近似回路</span><b class="amber" id="tw">—</b></div>
  </div>
  <div class="list-step"><div class="n">1</div><div class="body">求最小生成树 MST（权 ≤ OPT）</div></div>
  <div class="list-step"><div class="n">2</div><div class="body">每条树边走两遍 → 欧拉环游（≤ 2·MST ≤ 2·OPT）</div></div>
  <div class="list-step"><div class="n">3</div><div class="body">按首次访问顺序短路成哈密顿回路（三角不等式不增）</div></div>
  <div class="tip">一般 TSP 若 P≠NP 则不存在常数近似比（除非额外假设）。</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let pts=[], mstEdges=[], tour=[];
function rand(){
  pts=Array.from({length:10},()=>({x:60+Math.random()*880,y:40+Math.random()*320}));
  mstEdges=[]; tour=[]; draw(); mw.textContent='—'; tw.textContent='—'; hud.textContent='随机点';
}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function prim(){
  const n=pts.length, inT=new Array(n).fill(false), key=new Array(n).fill(1e18), par=new Array(n).fill(-1);
  key[0]=0;
  for(let it=0;it<n;it++){
    let u=-1;
    for(let i=0;i<n;i++) if(!inT[i]&&(u<0||key[i]<key[u])) u=i;
    inT[u]=true;
    for(let v=0;v<n;v++) if(!inT[v]){ const d=dist(pts[u],pts[v]); if(d<key[v]){ key[v]=d; par[v]=u; } }
  }
  mstEdges=[]; let w=0;
  for(let v=1;v<n;v++){ mstEdges.push([par[v],v]); w+=dist(pts[par[v]],pts[v]); }
  return w;
}
function buildTour(){
  // adjacency from MST
  const adj=Array.from({length:pts.length},()=>[]);
  mstEdges.forEach(([u,v])=>{ adj[u].push(v); adj[v].push(u); });
  const order=[], seen=new Set();
  function dfs(u){ seen.add(u); order.push(u); for(const v of adj[u]) if(!seen.has(v)) dfs(v); }
  dfs(0); tour=order; return order;
}
function tourLen(order){
  let s=0; for(let i=0;i<order.length;i++) s+=dist(pts[order[i]], pts[order[(i+1)%order.length]]);
  return s;
}
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  if(mstEdges.length){
    ctx.strokeStyle='#059669'; ctx.lineWidth=3;
    mstEdges.forEach(([u,v])=>{
      ctx.beginPath(); ctx.moveTo(pts[u].x,pts[u].y); ctx.lineTo(pts[v].x,pts[v].y); ctx.stroke();
    });
  }
  if(tour.length){
    ctx.strokeStyle='#d97706'; ctx.lineWidth=2.5; ctx.setLineDash([6,4]);
    ctx.beginPath(); tour.forEach((i,t)=>{ const p=pts[i]; t?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y); });
    ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
  }
  pts.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(p.x,p.y,9,0,Math.PI*2);
    ctx.fillStyle='#0f172a'; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='10px sans-serif'; ctx.textAlign='center';
    ctx.fillText(i, p.x, p.y+3);
  });
  ctx.textAlign='left';
}
mst.onclick=()=>{ const w=prim(); mw.textContent=w.toFixed(1); tour=[]; draw(); hud.textContent='MST 完成'; };
tour.onclick=()=>{
  if(!mstEdges.length) prim();
  const o=buildTour(); const t=tourLen(o);
  tw.textContent=t.toFixed(1); draw(); hud.textContent='近似回路 '+t.toFixed(1);
};
all.onclick=async()=>{
  const w=prim(); mw.textContent=w.toFixed(1); draw(); hud.textContent='MST…'; await sleep(500);
  const o=buildTour(); const t=tourLen(o); tw.textContent=t.toFixed(1); draw();
  hud.textContent=`2-近似示意 · tour/MST≈${(t/w).toFixed(2)}`;
};
rand.onclick=rand; rand();
''', ("08-knapsack.html","背包近似"), ("index.html","返回总览")))

    print("\n第12章强交互可视化版完成 →", OUT)


if __name__ == "__main__":
    build()
