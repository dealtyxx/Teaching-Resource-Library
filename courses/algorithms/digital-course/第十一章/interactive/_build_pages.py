# -*- coding: utf-8 -*-
"""
第11章 计算复杂性 · 强交互 / 强可视化版
增长曲线 · 图灵机纸带 · 复杂性宇宙 · SAT 赋值 · 团搜索 · 离线可用
"""
from pathlib import Path
OUT = Path(__file__).resolve().parent

CSS = r"""
:root{
  --bg:#fff1f2; --surface:#fff; --s2:#fff5f6; --s3:#ffe4e8;
  --text:#0b1220; --muted:#5a6b85; --faint:#8b9bb5;
  --line:rgba(225,29,72,.15); --line2:rgba(225,29,72,.28);
  --rose:#e11d48; --rose2:#be123c; --roseS:rgba(225,29,72,.1);
  --violet:#7c3aed; --violetS:rgba(124,58,237,.1);
  --blue:#2563eb; --blueS:rgba(37,99,235,.1);
  --green:#059669; --greenS:rgba(5,150,105,.1);
  --amber:#d97706; --red:#dc2626; --redS:rgba(220,38,38,.09);
  --cyan:#0891b2;
  --shadow:0 8px 28px rgba(225,29,72,.12); --shadow2:0 22px 50px rgba(225,29,72,.18);
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
    radial-gradient(1100px 560px at 5% -8%,rgba(225,29,72,.14),transparent 55%),
    radial-gradient(900px 480px at 95% 0%,rgba(124,58,237,.1),transparent 50%),
    radial-gradient(700px 400px at 50% 110%,rgba(37,99,235,.06),transparent 45%),
    linear-gradient(180deg,#fff8f9,#fff1f2 50%,#ffe4e8);
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
  background:linear-gradient(135deg,#fb7185,#e11d48 55%,#7c3aed);color:#fff;
  font:800 11px var(--mono);box-shadow:0 6px 16px rgba(225,29,72,.4);
  transform:perspective(200px) rotateY(-8deg);transition:transform .3s var(--ease)}
.nav .brand:hover .logo{transform:perspective(200px) rotateY(8deg) scale(1.05)}
.nav .brand span{color:var(--rose)}
.nav .links{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end;max-width:min(100%,920px)}
.nav a.pill{font-size:11.5px;font-weight:700;padding:6px 10px;border-radius:999px;color:var(--muted);border:1px solid transparent;transition:.2s var(--ease)}
.nav a.pill:hover{color:var(--rose);background:var(--roseS);border-color:var(--line)}
.nav a.pill.active{color:#fff;background:linear-gradient(135deg,#fb7185,#e11d48);box-shadow:0 4px 14px rgba(225,29,72,.35)}
.wrap{max-width:1160px;margin:0 auto;padding:26px 16px 70px}
.hero{margin-bottom:24px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;color:var(--rose);
  letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:999px;background:var(--roseS);
  border:1px solid rgba(225,29,72,.22);margin-bottom:12px}
.hero h1{font-size:clamp(1.55rem,3.3vw,2.4rem);line-height:1.15;font-weight:900;letter-spacing:-.025em;margin-bottom:12px;
  background:linear-gradient(120deg,#0b1220,#9f1239 30%,#e11d48 55%,#7c3aed 90%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{color:var(--muted);font-size:1.04rem;max-width:780px;line-height:1.7}
.hero-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:12.5px;font-weight:700;
  background:#fff;border:1px solid var(--line);color:var(--muted);box-shadow:0 2px 8px rgba(15,23,42,.04)}
.chip.rose{background:var(--roseS);color:var(--rose)} .chip.violet{background:var(--violetS);color:var(--violet)}
.chip.green{background:var(--greenS);color:var(--green)} .chip.amber{background:rgba(217,119,6,.1);color:var(--amber)}
.grid{display:grid;gap:16px}
.grid-2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.grid-3{grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px;box-shadow:var(--shadow);
  position:relative;overflow:hidden;transition:transform .28s var(--ease),box-shadow .28s,border-color .28s}
.card:hover{transform:translateY(-3px);box-shadow:var(--shadow2);border-color:var(--line2)}
.card::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--accent,linear-gradient(90deg,#fb7185,#7c3aed))}
.card h3{font-size:1.08rem;font-weight:800;margin-bottom:8px}
.card p,.desc{color:var(--muted);line-height:1.65;font-size:.94rem}
.badge{display:inline-flex;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;margin-bottom:10px;
  background:var(--roseS);color:var(--rose);border:1px solid rgba(225,29,72,.2)}
.badge.violet{background:var(--violetS);color:var(--violet)} .badge.green{background:var(--greenS);color:var(--green)}
.badge.amber{background:rgba(217,119,6,.1);color:var(--amber)}
a.feature-card{display:flex;flex-direction:column;min-height:158px;padding:18px;border-radius:var(--r);
  background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);position:relative;overflow:hidden;
  transition:transform .3s var(--ease),box-shadow .3s}
a.feature-card::after{content:attr(data-ico);position:absolute;right:12px;top:10px;font-size:40px;opacity:.14;transition:.35s var(--ease)}
a.feature-card:hover{transform:translateY(-8px) scale(1.015);box-shadow:var(--shadow2);
  border-color:color-mix(in srgb,var(--c,#e11d48) 40%,transparent)}
a.feature-card:hover::after{opacity:.28;transform:scale(1.15) rotate(8deg)}
a.feature-card .num{font:800 12px var(--mono);color:var(--c,#e11d48);letter-spacing:.06em;margin-bottom:8px}
a.feature-card h3{font-size:1.08rem;margin-bottom:6px}
a.feature-card p{color:var(--muted);font-size:.87rem;line-height:1.55;flex:1}
a.feature-card .go{margin-top:12px;font-size:12.5px;font-weight:800;color:var(--c,#e11d48);opacity:0;transform:translateX(-8px);transition:.25s}
a.feature-card:hover .go{opacity:1;transform:none}
.btn{appearance:none;border:1px solid var(--line);background:var(--s2);color:var(--text);
  padding:10px 16px;border-radius:13px;cursor:pointer;font-weight:800;font-size:13.5px;
  transition:.2s var(--ease);display:inline-flex;align-items:center;gap:6px}
.btn:hover{border-color:var(--line2);background:#fff;color:var(--rose);transform:translateY(-1px)}
.btn:active{transform:scale(.98)}
.btn.primary{background:linear-gradient(135deg,#fb7185,#e11d48);border:none;color:#fff;box-shadow:0 8px 20px rgba(225,29,72,.32)}
.btn.primary:hover{filter:brightness(1.06);color:#fff}
.btn.ghost{background:transparent}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important}
.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0}
.toolbar label{font-size:12.5px;color:var(--muted);font-weight:700}
.speed{display:flex;gap:4px;background:var(--s2);padding:3px;border-radius:11px;border:1px solid var(--line)}
.speed button{border:none;background:transparent;padding:6px 11px;border-radius:8px;font-size:12px;font-weight:800;color:var(--muted);cursor:pointer}
.speed button.on{background:#fff;color:var(--rose);box-shadow:0 1px 4px rgba(15,23,42,.08)}
.tip{margin-top:12px;padding:13px 15px;border-radius:15px;background:linear-gradient(135deg,var(--roseS),var(--violetS));
  border:1px solid var(--line);color:var(--muted);font-size:13.5px;line-height:1.65}
.tip strong{color:var(--text)}
.tip.ok{background:var(--greenS);border-color:rgba(5,150,105,.25)}
.tip.warn{background:rgba(217,119,6,.1);border-color:rgba(217,119,6,.22)}
.formula{font-family:var(--mono);background:linear-gradient(135deg,#fff1f2,#f5f3ff);border:1px solid rgba(225,29,72,.22);
  border-radius:16px;padding:16px 18px;margin-top:10px;color:var(--rose2);font-size:15px;line-height:1.55;text-align:center;font-weight:750}
.formula.lg{font-size:clamp(1.05rem,2.4vw,1.45rem);padding:20px}
.code{font-family:var(--mono);font-size:12.5px;line-height:1.7;background:#0f172a;color:#e2e8f0;border-radius:16px;
  padding:15px 16px;overflow:auto;white-space:pre;margin-top:10px}
.code .cm{color:#64748b}.code .kw{color:#fda4af}.code .fn{color:#c4b5fd}
.stat-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.stat{flex:1;min-width:100px;background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px}
.stat span{font-size:11.5px;color:var(--faint);font-weight:700}
.stat b{display:block;font-size:1.25rem;margin-top:4px;font-weight:900;font-variant-numeric:tabular-nums}
.stat b.rose{color:var(--rose)}.stat b.violet{color:var(--violet)}.stat b.green{color:var(--green)}.stat b.amber{color:var(--amber)}
.list-step{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;margin:8px 0;border-radius:14px;border:1px solid var(--line);background:#fff}
.list-step .n{flex-shrink:0;width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,#fb7185,#e11d48);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900}
.list-step .body{flex:1;font-size:.92rem;color:var(--muted);line-height:1.55}
.list-step .body b{color:var(--text)}
.stage-wrap{position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow);background:#0b1220}
.stage-wrap.light{background:
  linear-gradient(rgba(225,29,72,.04) 1px,transparent 1px),
  linear-gradient(90deg,rgba(124,58,237,.04) 1px,transparent 1px),#f8fafc;
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
  border:1.5px solid var(--line);background:#fff;transition:all .25s var(--ease);box-shadow:0 2px 8px rgba(15,23,42,.05);cursor:pointer;user-select:none}
.cell.on{border-color:var(--rose);background:var(--roseS);color:var(--rose);transform:translateY(-4px) scale(1.06)}
.cell.hit{border-color:var(--green);background:var(--greenS);color:var(--green)}
.cell.dead{border-color:var(--red);background:var(--redS);color:var(--red);opacity:.75}
.cell.live{border-color:var(--violet);background:var(--violetS);color:var(--violet)}
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
.pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--rose);box-shadow:0 0 0 0 rgba(225,29,72,.45);animation:pulse 1.6s infinite;display:inline-block}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(225,29,72,.45)}70%{box-shadow:0 0 0 10px transparent}}
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
      ctx.fillStyle=`rgba(225,29,72,${p.a})`; ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  addEventListener('resize',resize); resize(); tick();
})();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
"""

LINKS = [
    ("index.html","总览"),
    ("01-easy-hard.html","易解难解"),
    ("02-decision.html","判定优化"),
    ("03-turing.html","图灵机"),
    ("04-p-np.html","P与NP"),
    ("05-classes.html","类关系"),
    ("06-reduce.html","归约"),
    ("07-npc.html","NPC证明"),
    ("08-sat.html","SAT"),
    ("09-clique.html","团问题"),
]
CH = "第11章 计算复杂性"

def nav(active):
    pills="".join(f'<a class="{"pill active" if h==active else "pill"}" href="{h}">{lab}</a>' for h,lab in LINKS)
    return f'''<div class="fx-bg" aria-hidden="true"></div>
<nav class="nav"><div class="brand"><div class="logo">11</div>算法可视化 · <span>{CH}</span></div>
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
<div class="footer">算法设计与分析 · <b>{CH}</b> · 强交互可视化版<br/>增长 · 归约 · SAT · 建议全屏投影</div>
</div>
<script>
{COMMON_JS}
{js}
</script></body></html>"""

def write(name, html):
    (OUT/name).write_text(html, encoding="utf-8")
    print("✓", name)


def build():
    # index
    items = [
        ("01-easy-hard.html","01","易解与难解","多项式 · 指数 · 不可算","📈","#e11d48"),
        ("02-decision.html","02","判定与优化","优化 ⇄ 判定","⚖️","#7c3aed"),
        ("03-turing.html","03","图灵机","DTM / NTM 纸带","🖥️","#2563eb"),
        ("04-p-np.html","04","P 与 NP","可解 vs 可验证","🔑","#be123c"),
        ("05-classes.html","05","复杂性类关系","可点击宇宙图","🌌","#7c3aed"),
        ("06-reduce.html","06","多项式归约","传递难度","🔗","#e11d48"),
        ("07-npc.html","07","NPC 证明","∈NP + 归约","📜","#2563eb"),
        ("08-sat.html","08","SAT / 3-SAT","Cook-Levin · 赋值","✅","#be123c"),
        ("09-clique.html","09","团等经典 NPC","交互点将台","⬡","#7c3aed"),
    ]
    cards="".join(
        f'''<a class="feature-card" href="{h}" data-ico="{ico}" style="--c:{c}">
        <div class="num">§ {n}</div><h3>{t}</h3><p>{d}</p><div class="go">进入演示 →</div></a>'''
        for h,n,t,d,ico,c in items
    )
    write("index.html", page("计算复杂性总览", "index.html", f'''
<section class="hero">
  <div class="eyebrow"><span class="pulse-dot"></span> Chapter 11 · Complexity Theory</div>
  <h1>第11章 计算复杂性 · 交互总览</h1>
  <p>从「算法好不好」上升到「问题有多难」。P、NP、NPC、归约与经典难解问题——可交互的复杂性宇宙。</p>
  <div class="hero-meta">
    <span class="chip rose">9 节交互</span>
    <span class="chip violet">图灵机纸带</span>
    <span class="chip amber">SAT 赋值</span>
    <span class="chip green">离线 Canvas</span>
  </div>
</section>
<div class="grid grid-3 stagger">{cards}</div>
<div class="card" style="margin-top:18px">
  <span class="badge">路线图</span>
  <h3>学习路径</h3>
  <div class="list-step"><div class="n">1</div><div class="body"><b>增长与模型</b> — 易解/难解 → 判定问题 → 图灵机</div></div>
  <div class="list-step"><div class="n">2</div><div class="body"><b>类与关系</b> — P / NP → 宇宙图 → 归约</div></div>
  <div class="list-step"><div class="n">3</div><div class="body"><b>NPC 核心</b> — 证明套路 → SAT → 团等经典问题</div></div>
</div>
''', "", None, ("01-easy-hard.html","易解难解")))

    # 01 growth curves
    write("01-easy-hard.html", page("易解难解", "01-easy-hard.html", r'''
<section class="hero">
  <div class="eyebrow">图 1 · 时间增长</div>
  <h1>易解 · 难解 · 不可计算</h1>
  <p>拖动 n，对比多项式与指数爆炸。伪多项式（如 O(nW)）在数值很大时仍不「真多项式」。</p>
</section>
<div class="grid grid-2">
  <div class="card">
    <div class="toolbar">
      <label>规模 n = <b id="nv">20</b></label>
      <input type="range" id="nr" min="5" max="60" value="20" style="width:200px;accent-color:#e11d48"/>
    </div>
    <div class="stage-wrap light" style="height:340px">
      <canvas class="stage" id="cv" width="560" height="340"></canvas>
      <div class="stage-hud"><span class="hud-pill light">T(n) 对比（对数纵轴）</span></div>
    </div>
    <div class="legend">
      <span><i style="background:#059669"></i>n²</span>
      <span><i style="background:#2563eb"></i>n³</span>
      <span><i style="background:#d97706"></i>2ⁿ</span>
      <span><i style="background:#e11d48"></i>n!</span>
    </div>
  </div>
  <div class="card">
    <div class="grid" style="gap:12px">
      <div class="list-step"><div class="n">易</div><div class="body"><b>易解</b> — 存在多项式时间算法（排序、最短路、最大流…）</div></div>
      <div class="list-step"><div class="n">难</div><div class="body"><b>难解</b> — 目前仅指数级，或被证明「很难」（NPC 等）</div></div>
      <div class="list-step"><div class="n">∄</div><div class="body"><b>不可计算</b> — 不存在算法（停机问题）</div></div>
    </div>
    <div class="stat-row">
      <div class="stat"><span>n²</span><b class="green" id="s2">—</b></div>
      <div class="stat"><span>2ⁿ</span><b class="amber" id="s2n">—</b></div>
      <div class="stat"><span>n!</span><b class="rose" id="sf">—</b></div>
    </div>
    <div class="tip"><strong>伪多项式：</strong>0/1 背包 O(nW)，W 的二进制位数大时并非真多项式。</div>
  </div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function fact(n){ let r=1; for(let i=2;i<=n;i++){ r*=i; if(r>1e300) return Infinity;} return r; }
function fmt(x){ if(!isFinite(x)) return '∞'; if(x>=1e6) return x.toExponential(2); return Math.round(x).toLocaleString(); }
function draw(n){
  nv.textContent=n;
  s2.textContent=fmt(n*n); s2n.textContent=fmt(Math.pow(2,n)); sf.textContent=fmt(fact(Math.min(n,20)));
  const W=cv.width,H=cv.height, pad=40, plotW=W-pad*2, plotH=H-pad*2;
  ctx.clearRect(0,0,W,H);
  // axes
  ctx.strokeStyle='#cbd5e1'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pad,pad); ctx.lineTo(pad,H-pad); ctx.lineTo(W-pad,H-pad); ctx.stroke();
  const curves=[
    {f:x=>x*x, col:'#059669', name:'n²'},
    {f:x=>x*x*x, col:'#2563eb', name:'n³'},
    {f:x=>Math.pow(2,x), col:'#d97706', name:'2ⁿ'},
    {f:x=>fact(Math.min(x,18)), col:'#e11d48', name:'n!'},
  ];
  const maxN=n, samples=80;
  let ymax=1;
  curves.forEach(c=>{ for(let i=1;i<=samples;i++){ const x=1+(maxN-1)*i/samples; const y=c.f(x); if(isFinite(y)) ymax=Math.max(ymax,y);} });
  const logMax=Math.log10(ymax+1);
  function X(x){ return pad + (x-1)/(maxN-1||1)*plotW; }
  function Y(v){ const lv=Math.log10(Math.max(v,1)); return H-pad - (lv/logMax)*plotH; }
  curves.forEach(c=>{
    ctx.strokeStyle=c.col; ctx.lineWidth=2.5; ctx.beginPath();
    let started=false;
    for(let i=0;i<=samples;i++){
      const x=1+(maxN-1)*i/samples, y=c.f(x);
      if(!isFinite(y)||y<=0) continue;
      const px=X(x), py=Y(y);
      if(!started){ctx.moveTo(px,py); started=true;} else ctx.lineTo(px,py);
    }
    ctx.stroke();
  });
  // vertical marker at n
  ctx.strokeStyle='rgba(225,29,72,.45)'; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(X(n),pad); ctx.lineTo(X(n),H-pad); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#e11d48'; ctx.font='bold 12px ui-monospace'; ctx.fillText('n='+n, X(n)+6, pad+14);
}
nr.oninput=()=>draw(+nr.value); draw(20);
''', ("index.html","总览"), ("02-decision.html","判定优化")))

    # 02 decision
    write("02-decision.html", page("判定优化", "02-decision.html", r'''
<section class="hero">
  <div class="eyebrow">图 2 · 问题形态</div>
  <h1>判定问题与优化问题</h1>
  <p>优化求「最优值」；判定问「是否 ≤K / ≥K」。可对 K 二分，用判定器求解优化。</p>
</section>
<div class="card">
  <div class="toolbar">
    <label>阈值 K = <b id="kv">42</b></label>
    <input type="range" id="kr" min="10" max="100" value="42" style="width:220px;accent-color:#e11d48"/>
    <button class="btn primary" id="ask">询问判定器</button>
  </div>
  <div class="stage-wrap light" style="height:280px">
    <canvas class="stage" id="cv" width="1000" height="280"></canvas>
    <div class="stage-hud">
      <span class="hud-pill light">TSP 示意回路</span>
      <span class="hud-pill light" id="hud">OPT≈—</span>
    </div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>OPT（示意）</span><b class="violet" id="opt">—</b></div>
    <div class="stat"><span>判定结果</span><b class="rose" id="ans">—</b></div>
  </div>
  <div class="grid grid-2" style="margin-top:14px">
    <div class="list-step"><div class="n">优</div><div class="body"><b>TSP 优化</b> 最短哈密顿回路长度？</div></div>
    <div class="list-step"><div class="n">判</div><div class="body"><b>TSP 判定</b> 是否存在长度 ≤ K 的回路？</div></div>
  </div>
  <div class="tip">若判定可高效求解，常用<strong>二分搜索 K</strong>把优化变成多次判定。</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const pts=[{x:120,y:140},{x:280,y:60},{x:480,y:80},{x:680,y:120},{x:820,y:200},{x:600,y:230},{x:360,y:220},{x:200,y:200}];
function tourLen(order){
  let s=0; for(let i=0;i<order.length;i++){ const a=pts[order[i]], b=pts[order[(i+1)%order.length]]; s+=Math.hypot(a.x-b.x,a.y-b.y); }
  return s;
}
// simple nearest-neighbor for demo OPT approx
function nn(){
  const used=new Set([0]); const order=[0]; let cur=0;
  while(used.size<pts.length){
    let best=-1, bd=1e9;
    for(let i=0;i<pts.length;i++) if(!used.has(i)){ const d=Math.hypot(pts[cur].x-pts[i].x,pts[cur].y-pts[i].y); if(d<bd){bd=d;best=i;} }
    used.add(best); order.push(best); cur=best;
  }
  return order;
}
const order=nn();
const OPT=tourLen(order);
opt.textContent=OPT.toFixed(1); hud.textContent='OPT≈'+OPT.toFixed(1);
function draw(K, highlight){
  ctx.clearRect(0,0,cv.width,cv.height);
  // edges of tour
  ctx.strokeStyle=highlight==='yes'?'#059669':(highlight==='no'?'#e11d48':'#7c3aed');
  ctx.lineWidth=3; ctx.beginPath();
  order.forEach((i,t)=>{ const p=pts[i]; t?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y); });
  ctx.closePath(); ctx.stroke();
  pts.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(p.x,p.y,10,0,Math.PI*2);
    ctx.fillStyle='#fff'; ctx.fill();
    ctx.strokeStyle='#0f172a'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='#0f172a'; ctx.font='bold 11px sans-serif'; ctx.fillText(i+1, p.x-4, p.y+4);
  });
  // K bar
  ctx.fillStyle='#64748b'; ctx.font='12px ui-monospace';
  ctx.fillText('判定：∃ 回路 length ≤ K ?   K='+K, 20, 24);
}
function update(){ kv.textContent=kr.value; draw(+kr.value, null); ans.textContent='—'; }
kr.oninput=update;
ask.onclick=()=>{
  const K=+kr.value;
  const yes=OPT<=K;
  ans.textContent=yes?'YES':'NO';
  ans.className=yes?'green':'rose';
  draw(K, yes?'yes':'no');
  hud.textContent=(yes?'YES':'NO')+'  (OPT '+OPT.toFixed(1)+(yes?' ≤ ':' > ')+'K)';
};
update();
''', ("01-easy-hard.html","易解难解"), ("03-turing.html","图灵机")))

    # 03 turing
    write("03-turing.html", page("图灵机", "03-turing.html", r'''
<section class="hero">
  <div class="eyebrow">图 3 · 计算模型</div>
  <h1>图灵机 · 纸带动画</h1>
  <p>无限纸带 + 读写头 + 有限状态。算法 ≈ 对任意输入都停机的<strong>确定性图灵机（DTM）</strong>。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 运行（二元加一示意）</button>
    <button class="btn" id="reset">重置</button>
    <div class="speed" id="spd">
      <button data-s="1" class="on">1×</button><button data-s="2">2×</button><button data-s="4">4×</button>
    </div>
  </div>
  <div class="stage-wrap" style="height:220px">
    <canvas class="stage" id="cv" width="1000" height="220"></canvas>
    <div class="stage-hud">
      <span class="hud-pill" id="state">q₀</span>
      <span class="hud-pill" id="hud">就绪</span>
    </div>
  </div>
  <div class="grid grid-2" style="margin-top:14px">
    <div class="card" style="--accent:linear-gradient(90deg,#2563eb,#0891b2);box-shadow:none">
      <span class="badge" style="background:var(--blueS);color:var(--blue)">DTM</span>
      <h3>确定性图灵机</h3>
      <p>每步唯一转移 · 经典刻画 <b>P</b> 类</p>
    </div>
    <div class="card" style="--accent:linear-gradient(90deg,#e11d48,#7c3aed);box-shadow:none">
      <span class="badge violet">NTM</span>
      <h3>非确定性图灵机</h3>
      <p>可「猜」分支 · 经典刻画 <b>NP</b></p>
    </div>
  </div>
  <div class="tip">复杂度按<strong>最坏输入</strong>下停机步数（时间）/ 使用格数（空间）度量。</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
let tape, head, q, speed=1, busy=false;
function init(){
  tape=Array(24).fill('0');
  // binary 1011 at cells 6..9
  '1011'.split('').forEach((c,i)=>tape[6+i]=c);
  head=9; q='q0';
  draw(); state.textContent=q; hud.textContent='就绪 · 加一示意';
}
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  const cellW=40, startX=40, y=100;
  // tape cells
  for(let i=0;i<tape.length;i++){
    const x=startX+i*cellW;
    ctx.fillStyle=i===head?'rgba(225,29,72,.25)':'rgba(255,255,255,.06)';
    ctx.strokeStyle=i===head?'#fb7185':'#475569';
    ctx.lineWidth=i===head?2.5:1;
    ctx.fillRect(x,y,cellW-4,48);
    ctx.strokeRect(x,y,cellW-4,48);
    ctx.fillStyle='#e2e8f0'; ctx.font='bold 18px ui-monospace';
    ctx.fillText(tape[i], x+12, y+32);
  }
  // head
  const hx=startX+head*cellW+(cellW-4)/2;
  ctx.fillStyle='#e11d48';
  ctx.beginPath(); ctx.moveTo(hx,y-8); ctx.lineTo(hx-10,y-28); ctx.lineTo(hx+10,y-28); ctx.closePath(); ctx.fill();
  ctx.font='12px ui-monospace'; ctx.fillStyle='#fda4af'; ctx.fillText('读写头', hx-18, y-34);
  // control box
  ctx.fillStyle='rgba(124,58,237,.25)'; ctx.strokeStyle='#a78bfa';
  ctx.beginPath(); roundRect(ctx, 40, 20, 160, 48, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#e9d5ff'; ctx.font='bold 14px sans-serif'; ctx.fillText('状态 '+q, 60, 50);
}
function roundRect(ctx,x,y,w,h,r){
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r);
}
// increment binary from rightmost
async function run(){
  if(busy) return; busy=true;
  // move left while 1, flip to 0; when 0 flip to 1 halt
  while(true){
    state.textContent=q; draw(); hud.textContent='读 '+tape[head];
    await sleep(450/speed);
    if(tape[head]==='1'){ tape[head]='0'; q='carry'; head=Math.max(0,head-1); }
    else { tape[head]='1'; q='halt'; draw(); hud.textContent='停机 · 完成加一'; state.textContent=q; break; }
  }
  busy=false;
}
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{
  spd.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); speed=+b.dataset.s;
});
run.onclick=run; reset.onclick=init; init();
''', ("02-decision.html","判定优化"), ("04-p-np.html","P与NP")))

    # 04 p-np
    write("04-p-np.html", page("P与NP", "04-p-np.html", r'''
<section class="hero">
  <div class="eyebrow">图 4 · 核心类</div>
  <h1>P 类与 NP 类</h1>
  <p><strong>P</strong>：确定性多项式时间可解。 <strong>NP</strong>：yes 实例有多项式长证书，可多项式验证。N ≠ Non-polynomial！</p>
</section>
<div class="grid grid-2">
  <div class="card" style="--accent:linear-gradient(90deg,#059669,#0891b2)">
    <span class="badge green">P</span>
    <h3>Polynomial Time</h3>
    <p>存在 DTM 在 poly(n) 步内判定。</p>
    <div class="tip ok">排序 · 最短路 · 最大流 · 线性规划…</div>
  </div>
  <div class="card" style="--accent:linear-gradient(90deg,#e11d48,#7c3aed)">
    <span class="badge">NP</span>
    <h3>Nondeterministic P</h3>
    <p>存在短证书 + 多项式验证器。</p>
    <div class="tip warn">SAT · 团 · 哈密顿 · TSP 判定…</div>
  </div>
</div>
<div class="card" style="margin-top:16px">
  <h3>交互：求解 vs 验证</h3>
  <p class="desc" style="margin-bottom:10px">给定子集和实例：是否存在子集和为 <b>t=15</b>？「求解」穷举；「验证」检查给定证书。</p>
  <div class="cells" id="nums"></div>
  <div class="toolbar">
    <button class="btn" id="solve">🔍 暴力求解</button>
    <button class="btn primary" id="verify">✓ 验证证书 {2,5,8}</button>
  </div>
  <div class="stat-row">
    <div class="stat"><span>求解步骤</span><b class="rose" id="steps">0</b></div>
    <div class="stat"><span>验证步骤</span><b class="green" id="vsteps">0</b></div>
    <div class="stat"><span>结果</span><b class="violet" id="res">—</b></div>
  </div>
  <div class="log" id="log">点击按钮对比「找答案」与「验证书」的代价。</div>
  <div class="formula lg" style="margin-top:14px">公认 P ⊆ NP · P =? NP 未决</div>
</div>
''', r'''
const a=[3,5,2,8,1,7], t=15;
const cells=nums;
function render(hi=new Set(), mode=''){
  cells.innerHTML=a.map((v,i)=>`<div class="cell ${hi.has(i)?(mode||'on'):''}">${v}</div>`).join('');
}
render();
function* subsets(){
  const n=a.length;
  for(let m=0;m<(1<<n);m++){
    const idx=[]; let s=0;
    for(let i=0;i<n;i++) if(m>>i&1){ idx.push(i); s+=a[i]; }
    yield {idx,s,m};
  }
}
solve.onclick=async()=>{
  let count=0; res.textContent='搜索中…';
  for(const {idx,s} of subsets()){
    count++; steps.textContent=count;
    render(new Set(idx),'live');
    log.textContent=`尝试子集和=${s} · 已检查 ${count} 个子集`;
    if(count%3===0) await sleep(40);
    if(s===t){ render(new Set(idx),'hit'); res.textContent='YES'; log.textContent=`找到！和=${t} · 共检查 ${count} 个子集（最坏 2^n）`; return; }
  }
  res.textContent='NO';
};
verify.onclick=async()=>{
  const cert=[1,2,3]; // indices of 5,2,8
  let s=0, c=0;
  for(const i of cert){
    c++; vsteps.textContent=c; s+=a[i];
    render(new Set(cert.slice(0,c)),'on');
    log.textContent=`证书加入 a[${i}]=${a[i]} · 当前和=${s}`;
    await sleep(350);
  }
  const ok=s===t;
  render(new Set(cert), ok?'hit':'dead');
  res.textContent=ok?'YES（证书有效）':'NO';
  log.textContent=`验证完成：Σ=${s} ${ok?'=':'≠'} t · 仅 O(|证书|) 步`;
};
''', ("03-turing.html","图灵机"), ("05-classes.html","类关系")))

    # 05 classes universe
    write("05-classes.html", page("类关系", "05-classes.html", r'''
<section class="hero">
  <div class="eyebrow">图 5 · 宇宙图</div>
  <h1>复杂性类关系 · 点击探索</h1>
  <p>在「P≠NP」常见假想图景下：P ⊂ NP，NPC = NP ∩ NP-Hard。点击区域查看说明。</p>
</section>
<div class="card">
  <div class="stage-wrap light" style="height:420px">
    <canvas class="stage" id="cv" width="900" height="420" style="cursor:pointer"></canvas>
    <div class="stage-hud"><span class="hud-pill light">Complexity Universe</span><span class="hud-pill light" id="hud">点击区域</span></div>
  </div>
  <div class="tip" id="tip"><strong>提示：</strong>点击 P / NP / NPC / NP-Hard 区域。</div>
  <div class="formula">NPC = NP ∩ NP-Hard · 若 P=NP 则图景坍缩</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const cx=450, cy=210;
const zones=[
  {name:'NP-Hard', info:'NP-Hard：至少和 NPC 一样难；未必属于 NP（甚至可能不可判定）。', r:180, col:'rgba(225,29,72,.12)', stroke:'#e11d48', ox:40, oy:0},
  {name:'NP', info:'NP：yes 实例有多项式长证书，可多项式时间验证。', r:130, col:'rgba(245,158,11,.14)', stroke:'#d97706', ox:-20, oy:10},
  {name:'P', info:'P：确定性多项式时间可解的判定问题。', r:70, col:'rgba(5,150,105,.18)', stroke:'#059669', ox:-50, oy:20},
  {name:'NPC', info:'NPC = NP ∩ NP-Hard：NP 中最难的一档；所有 NP 问题都可归约到它。', r:48, col:'rgba(124,58,237,.22)', stroke:'#7c3aed', ox:55, oy:30},
];
function draw(hi=-1){
  ctx.clearRect(0,0,cv.width,cv.height);
  zones.forEach((z,i)=>{
    const x=cx+z.ox, y=cy+z.oy;
    ctx.beginPath(); ctx.arc(x,y,z.r,0,Math.PI*2);
    ctx.fillStyle=z.col; ctx.fill();
    ctx.strokeStyle=z.stroke; ctx.lineWidth=i===hi?4:2.5; ctx.stroke();
    ctx.fillStyle=z.stroke; ctx.font=`bold ${i===0?16:14}px sans-serif`;
    ctx.textAlign='center';
    if(z.name==='NP-Hard') ctx.fillText(z.name, x+90, y-120);
    else if(z.name==='NP') ctx.fillText(z.name, x-70, y-90);
    else ctx.fillText(z.name, x, y+5);
  });
  ctx.textAlign='left';
}
function hit(mx,my){
  // reverse order for topmost
  for(let i=zones.length-1;i>=0;i--){
    const z=zones[i], x=cx+z.ox, y=cy+z.oy;
    if((mx-x)**2+(my-y)**2<=z.r*z.r) return i;
  }
  return -1;
}
cv.onclick=e=>{
  const r=cv.getBoundingClientRect();
  const mx=(e.clientX-r.left)*cv.width/r.width, my=(e.clientY-r.top)*cv.height/r.height;
  const i=hit(mx,my);
  draw(i);
  if(i>=0){ tip.innerHTML='<strong>'+zones[i].name+'：</strong>'+zones[i].info; hud.textContent=zones[i].name; }
};
cv.onmousemove=e=>{
  const r=cv.getBoundingClientRect();
  const mx=(e.clientX-r.left)*cv.width/r.width, my=(e.clientY-r.top)*cv.height/r.height;
  cv.style.cursor=hit(mx,my)>=0?'pointer':'default';
};
draw();
''', ("04-p-np.html","P与NP"), ("06-reduce.html","归约")))

    # 06 reduce
    write("06-reduce.html", page("归约", "06-reduce.html", r'''
<section class="hero">
  <div class="eyebrow">图 6 · 归约</div>
  <h1>多项式时间归约 A ≤ₚ B</h1>
  <p>把 A 的实例<strong>多项式</strong>变成 B 的实例，且 yes↔yes。用于在问题之间<strong>传递难度</strong>。</p>
</section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">▶ 播放归约动画</button>
    <button class="btn" id="reset">重置</button>
  </div>
  <div class="stage-wrap light" style="height:320px">
    <canvas class="stage" id="cv" width="1000" height="320"></canvas>
    <div class="stage-hud"><span class="hud-pill light">A ≤ₚ B</span><span class="hud-pill light" id="hud">就绪</span></div>
  </div>
  <div class="list-step"><div class="n">1</div><div class="body">若 <b>B∈P</b> 且 A≤ₚB，则 <b>A∈P</b></div></div>
  <div class="list-step"><div class="n">2</div><div class="body">若 <b>A 难</b>（如 NPC）且 A≤ₚB，则 <b>B 至少一样难</b></div></div>
  <div class="list-step"><div class="n">3</div><div class="body">证 B∈NPC：先证 B∈NP，再证某已知 NPC ≤ₚ B</div></div>
  <div class="tip">归约方向：<strong>从已知难问题归约到目标问题</strong>，说明目标「至少一样难」。</div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function box(x,y,w,h,title,sub,col){
  ctx.fillStyle='#fff'; ctx.strokeStyle=col; ctx.lineWidth=2.5;
  ctx.beginPath(); round(x,y,w,h,14); ctx.fill(); ctx.stroke();
  ctx.fillStyle=col; ctx.font='bold 16px sans-serif'; ctx.fillText(title,x+16,y+32);
  ctx.fillStyle='#64748b'; ctx.font='13px sans-serif'; ctx.fillText(sub,x+16,y+56);
}
function round(x,y,w,h,r){
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
function arrow(x1,y1,x2,y2,t,col){
  const x=x1+(x2-x1)*t, y=y1+(y2-y1)*t;
  ctx.strokeStyle=col; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x,y); ctx.stroke();
  if(t>0.05){
    const ang=Math.atan2(y2-y1,x2-x1);
    ctx.beginPath(); ctx.moveTo(x,y);
    ctx.lineTo(x-12*Math.cos(ang-.4),y-12*Math.sin(ang-.4));
    ctx.lineTo(x-12*Math.cos(ang+.4),y-12*Math.sin(ang+.4));
    ctx.closePath(); ctx.fillStyle=col; ctx.fill();
  }
}
function draw(t, phase){
  ctx.clearRect(0,0,cv.width,cv.height);
  box(80,100,220,100,'问题 A','实例 x','#e11d48');
  box(700,100,220,100,'问题 B','实例 f(x)','#7c3aed');
  arrow(320,150,680,150,t,'#2563eb');
  ctx.fillStyle='#2563eb'; ctx.font='bold 13px ui-monospace';
  ctx.fillText('多项式变换 f', 420, 130);
  if(phase>=1){
    ctx.fillStyle='#059669'; ctx.font='14px sans-serif';
    ctx.fillText('x ∈ A  ⟺  f(x) ∈ B', 380, 250);
  }
  if(phase>=2){
    ctx.fillStyle='#be123c'; ctx.font='bold 14px sans-serif';
    ctx.fillText('⇒  B 至少与 A 一样难', 380, 280);
  }
}
async function play(){
  for(let i=0;i<=40;i++){ draw(i/40,0); hud.textContent='变换 f 进行中…'; await sleep(30); }
  draw(1,1); hud.textContent='保持 yes/no 等价'; await sleep(600);
  draw(1,2); hud.textContent='难度从 A 传递到 B';
}
run.onclick=play; reset.onclick=()=>{draw(0,0); hud.textContent='就绪';}; draw(0,0);
''', ("05-classes.html","类关系"), ("07-npc.html","NPC证明")))

    # 07 npc
    write("07-npc.html", page("NPC证明", "07-npc.html", r'''
<section class="hero">
  <div class="eyebrow">图 7 · 证明套路</div>
  <h1>NP 完全：定义与证明</h1>
  <p>NPC = NP ∩ NP-Hard。第一个 NPC 问题：<strong>SAT</strong>（Cook-Levin 定理）。</p>
</section>
<div class="card">
  <div class="formula lg">L ∈ NPC  ⟺  L ∈ NP  且  L 是 NP-Hard</div>
  <div class="toolbar" style="margin-top:14px">
    <button class="btn primary" id="step">下一步证明</button>
    <button class="btn" id="reset">重置清单</button>
  </div>
  <div id="steps"></div>
  <div class="tip" id="tip">按「下一步」展开标准证明清单。</div>
</div>
''', r'''
const items=[
  {t:'步骤 ① · 证明 ∈ NP', d:'给出「是」答案的证书格式，并写多项式时间验证算法。'},
  {t:'步骤 ② · 选已知 NPC', d:'常从 3-SAT、顶点覆盖、团、哈密顿等出发。'},
  {t:'步骤 ③ · 构造归约', d:'已知 NPC 问题 A 的任意实例 → 多项式变换为 L 的实例。'},
  {t:'步骤 ④ · 证明等价', d:'x∈A 当且仅当 f(x)∈L；时间必须 poly(|x|)。'},
  {t:'结论', d:'L ∈ NP 且 A ≤ₚ L ⇒ L ∈ NPC。'},
];
let k=0;
function render(){
  steps.innerHTML=items.map((it,i)=>`
    <div class="list-step" style="opacity:${i<k?1:.35};${i===k-1?'border-color:#e11d48;background:#fff1f2':''}">
      <div class="n">${i+1}</div>
      <div class="body"><b>${it.t}</b><br/>${i<k?it.d:'…'}</div>
    </div>`).join('');
  tip.innerHTML=k===0?'按「下一步」展开标准证明清单。':(k<items.length?items[k-1].d:'<strong>完成！</strong> 这就是课本里的 NPC 证明模板。');
}
step.onclick=()=>{ if(k<items.length){ k++; render(); } };
reset.onclick=()=>{ k=0; render(); };
render();
''', ("06-reduce.html","归约"), ("08-sat.html","SAT")))

    # 08 sat
    write("08-sat.html", page("SAT", "08-sat.html", r'''
<section class="hero">
  <div class="eyebrow">图 8 · Cook-Levin</div>
  <h1>SAT 与 3-SAT · 交互赋值</h1>
  <p>布尔可满足性：是否存在 0/1 赋值使公式为真。点击文字切换真值，观察子句点亮。</p>
</section>
<div class="card">
  <div class="formula" id="formula">φ = (x₁ ∨ ¬x₂ ∨ x₃) ∧ (¬x₁ ∨ x₂ ∨ x₄) ∧ (x₂ ∨ x₃ ∨ ¬x₄) ∧ (¬x₁ ∨ ¬x₃ ∨ x₄)</div>
  <div class="toolbar">
    <span class="chip">变量赋值（点击切换）</span>
    <button class="btn" id="rand">随机赋值</button>
    <button class="btn primary" id="search">暴力搜可满足</button>
  </div>
  <div class="cells" id="vars"></div>
  <div class="grid grid-2" style="margin-top:12px">
    <div>
      <h3 style="margin-bottom:8px">子句状态</h3>
      <div id="clauses"></div>
    </div>
    <div>
      <div class="stat-row">
        <div class="stat"><span>满足子句</span><b class="green" id="okn">0/4</b></div>
        <div class="stat"><span>φ 整体</span><b class="rose" id="all">UNSAT</b></div>
      </div>
      <div class="log" id="log">调整赋值，使全部子句为真。</div>
      <div class="tip" style="margin-top:12px">3-SAT：每子句恰 3 文字，仍是 NPC。大量 NPC 证明从 3-SAT 归约出发。</div>
    </div>
  </div>
</div>
''', r'''
// clauses: list of literals {v:0..3, neg:bool}
const C=[
  [{v:0,neg:false},{v:1,neg:true},{v:2,neg:false}],
  [{v:0,neg:true},{v:1,neg:false},{v:3,neg:false}],
  [{v:1,neg:false},{v:2,neg:false},{v:3,neg:true}],
  [{v:0,neg:true},{v:2,neg:true},{v:3,neg:false}],
];
let asg=[false,false,false,false];
function litTrue(L){ return L.neg ? !asg[L.v] : asg[L.v]; }
function clauseOk(cl){ return cl.some(litTrue); }
function render(){
  vars.innerHTML=asg.map((b,i)=>`<div class="cell ${b?'hit':'dead'}" data-i="${i}">x${i+1}=${b?1:0}</div>`).join('');
  vars.querySelectorAll('.cell').forEach(el=>el.onclick=()=>{ asg[+el.dataset.i]=!asg[+el.dataset.i]; render(); });
  let ok=0;
  clauses.innerHTML=C.map((cl,i)=>{
    const good=clauseOk(cl); if(good) ok++;
    const txt=cl.map(L=>(L.neg?'¬':'')+'x'+(L.v+1)).join(' ∨ ');
    return `<div class="list-step" style="border-color:${good?'#059669':'#e11d48'};background:${good?'#ecfdf5':'#fff1f2'}">
      <div class="n" style="background:${good?'#059669':'#e11d48'}">${i+1}</div>
      <div class="body"><b>(${txt})</b> → ${good?'满足':'未满足'}</div></div>`;
  }).join('');
  okn.textContent=ok+'/4';
  const sat=ok===4;
  all.textContent=sat?'SAT':'UNSAT';
  all.className=sat?'green':'rose';
  log.textContent=sat?'🎉 公式可满足！':'还有子句为假，继续调整。';
}
rand.onclick=()=>{ asg=asg.map(()=>Math.random()<.5); render(); };
search.onclick=async()=>{
  for(let m=0;m<16;m++){
    asg=[!!(m&1),!!(m&2),!!(m&4),!!(m&8)];
    render(); log.textContent=`枚举赋值 #${m} · ${asg.map((b,i)=>'x'+(i+1)+'='+(b|0)).join(' ')}`;
    await sleep(120);
    if(C.every(clauseOk)){ log.textContent='找到可满足赋值！'; return; }
  }
  log.textContent='本公式在 16 种赋值下…（应存在解，再试）';
};
render();
''', ("07-npc.html","NPC证明"), ("09-clique.html","团问题")))

    # 09 clique
    write("09-clique.html", page("团问题", "09-clique.html", r'''
<section class="hero">
  <div class="eyebrow">图 9 · 经典 NPC</div>
  <h1>团 · 顶点覆盖 · 哈密顿…</h1>
  <p>在图上找大小 ≥k 的完全子图（团）。判定版是经典 NPC。右侧点将台浏览更多问题。</p>
</section>
<div class="grid grid-2">
  <div class="card">
    <div class="toolbar">
      <label>k = <b id="kv">3</b></label>
      <input type="range" id="kr" min="2" max="5" value="3" style="width:140px;accent-color:#e11d48"/>
      <button class="btn primary" id="run">▶ 搜索 k-团</button>
    </div>
    <div class="stage-wrap light" style="height:360px">
      <canvas class="stage" id="cv" width="480" height="360"></canvas>
      <div class="stage-hud"><span class="hud-pill light">Clique</span><span class="hud-pill light" id="hud">—</span></div>
    </div>
    <div class="tip" id="tip">点击运行，暴力枚举大小为 k 的子集并检查是否两两相邻。</div>
  </div>
  <div class="card">
    <span class="badge violet">点将台</span>
    <div class="list-step"><div class="n">团</div><div class="body"><b>Clique</b> — 是否存在大小 ≥k 的完全子图</div></div>
    <div class="list-step"><div class="n">VC</div><div class="body"><b>顶点覆盖</b> — 是否存在 ≤k 个点盖住所有边</div></div>
    <div class="list-step"><div class="n">HC</div><div class="body"><b>哈密顿回路</b> — 是否存在过每点恰一次的回路</div></div>
    <div class="list-step"><div class="n">TSP</div><div class="body"><b>TSP 判定</b> — 是否存在权 ≤K 的回路</div></div>
    <div class="list-step"><div class="n">色</div><div class="body"><b>图着色</b> — m≥3 着色判定 NPC</div></div>
    <div class="list-step"><div class="n">Σ</div><div class="body"><b>子集和</b> — 是否存在子集和为 t（弱 NPC）</div></div>
    <div class="formula" style="margin-top:12px">独立集 α · 团 ω · 顶点覆盖 β 紧密相关</div>
  </div>
</div>
''', r'''
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const pos=[[240,50],[400,120],[380,260],[100,260],[80,120],[240,180]];
// edges undirected
const edges=[[0,1],[1,2],[2,3],[3,4],[4,0],[0,2],[1,3],[4,1],[0,3],[1,5],[2,5],[3,5],[4,5]];
function hasEdge(a,b){ return edges.some(([u,v])=>(u===a&&v===b)||(u===b&&v===a)); }
function draw(hi=new Set(), bad=new Set()){
  ctx.clearRect(0,0,cv.width,cv.height);
  edges.forEach(([u,v])=>{
    const both=hi.has(u)&&hi.has(v);
    ctx.strokeStyle=both?'#e11d48':'#cbd5e1';
    ctx.lineWidth=both?3.5:1.5;
    ctx.beginPath(); ctx.moveTo(pos[u][0],pos[u][1]); ctx.lineTo(pos[v][0],pos[v][1]); ctx.stroke();
  });
  pos.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(p[0],p[1],16,0,Math.PI*2);
    if(hi.has(i)){ ctx.fillStyle='#e11d48'; }
    else if(bad.has(i)){ ctx.fillStyle='#fbbf24'; }
    else ctx.fillStyle='#64748b';
    ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center';
    ctx.fillText(String.fromCharCode(65+i), p[0], p[1]+4);
  });
  ctx.textAlign='left';
}
function* comb(n,k){
  const c=[];
  function rec(s){
    if(c.length===k){ yield c.slice(); return; }
    for(let i=s;i<n;i++){ c.push(i); yield* rec(i+1); c.pop(); }
  }
  yield* rec(0);
}
async function search(){
  const k=+kr.value; kv.textContent=k;
  for(const S of comb(pos.length,k)){
    const set=new Set(S);
    draw(set);
    hud.textContent='检查 {'+S.map(i=>String.fromCharCode(65+i)).join(',')+'}';
    await sleep(180);
    let ok=true;
    for(let i=0;i<S.length&&ok;i++) for(let j=i+1;j<S.length;j++) if(!hasEdge(S[i],S[j])){ ok=false; break; }
    if(ok){
      draw(set); hud.textContent='找到 '+k+'-团！';
      tip.innerHTML='<strong>成功：</strong>子图诱导为完全图 K<sub>'+k+'</sub>。';
      return;
    }
  }
  hud.textContent='无 '+k+'-团'; tip.textContent='该图不存在大小为 k 的团（或需换 k）。';
}
kr.oninput=()=>{ kv.textContent=kr.value; draw(); };
run.onclick=search; draw();
''', ("08-sat.html","SAT"), ("index.html","返回总览")))

    print("\n第11章强交互可视化版完成 →", OUT)


if __name__ == "__main__":
    build()
