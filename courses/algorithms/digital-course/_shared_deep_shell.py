# -*- coding: utf-8 -*-
"""Shared shell for deepened Ch1–5 interactive pages."""
from __future__ import annotations

THEMES = {
    "01": dict(logo="01", ch="第1章 绪论", primary="#2563eb", primary2="#1d4ed8", rgb="37,99,235",
               grad="#60a5fa,#2563eb 55%,#7c3aed", bg="linear-gradient(180deg,#f8fafc,#eff6ff 50%,#e0e7ff)"),
    "02": dict(logo="02", ch="第2章 递归算法设计技术", primary="#7c3aed", primary2="#6d28d9", rgb="124,58,237",
               grad="#a78bfa,#7c3aed 55%,#2563eb", bg="linear-gradient(180deg,#faf5ff,#f5f3ff 50%,#ede9fe)"),
    "03": dict(logo="03", ch="第3章 穷举法", primary="#0f766e", primary2="#0d9488", rgb="15,118,110",
               grad="#2dd4bf,#0f766e 55%,#0891b2", bg="linear-gradient(180deg,#f0fdfa,#ecfeff 50%,#e6fffa)"),
    "04": dict(logo="04", ch="第4章 分治法", primary="#0891b2", primary2="#0e7490", rgb="8,145,178",
               grad="#22d3ee,#0891b2 55%,#2563eb", bg="linear-gradient(180deg,#ecfeff,#f0f9ff 50%,#e0f2fe)"),
    "05": dict(logo="05", ch="第5章 回溯法", primary="#4f46e5", primary2="#4338ca", rgb="79,70,229",
               grad="#818cf8,#4f46e5 55%,#2563eb", bg="linear-gradient(180deg,#f8f9ff,#eef2ff 50%,#e0e7ff)"),
}


def css(theme: dict) -> str:
    p, p2, rgb, grad, bg = theme["primary"], theme["primary2"], theme["rgb"], theme["grad"], theme["bg"]
    return f"""
:root{{
  --bg:#f8fafc; --surface:#fff; --s2:#f1f5f9; --s3:#e2e8f0;
  --text:#0b1220; --muted:#5a6b85; --faint:#8b9bb5;
  --line:rgba({rgb},.15); --line2:rgba({rgb},.28);
  --primary:{p}; --primary2:{p2}; --primaryS:rgba({rgb},.1);
  --blue:#2563eb; --green:#059669; --greenS:rgba(5,150,105,.1);
  --red:#dc2626; --redS:rgba(220,38,38,.09); --amber:#d97706; --violet:#7c3aed; --cyan:#0891b2;
  --shadow:0 8px 28px rgba({rgb},.12); --shadow2:0 22px 50px rgba({rgb},.18);
  --r:22px; --font:"Segoe UI","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  --mono:ui-monospace,"Cascadia Code",Consolas,monospace; --ease:cubic-bezier(.22,1,.36,1);
}}
*,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
html{{scroll-behavior:smooth}}
body{{font-family:var(--font);color:var(--text);min-height:100vh;overflow-x:hidden;
  background:radial-gradient(1100px 560px at 5% -8%,rgba({rgb},.14),transparent 55%),
  radial-gradient(900px 480px at 95% 0%,rgba(37,99,235,.07),transparent 50%),{bg};
  -webkit-font-smoothing:antialiased}}
a{{color:inherit;text-decoration:none}} button,input,select{{font:inherit}}
.fx-bg{{position:fixed;inset:0;pointer-events:none;z-index:0}}
.fx-bg canvas{{width:100%;height:100%;display:block;opacity:.4}}
.nav,.wrap{{position:relative;z-index:1}}
.nav{{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  padding:11px 18px;background:rgba(255,255,255,.88);backdrop-filter:blur(18px) saturate(1.35);
  border-bottom:1px solid var(--line);box-shadow:0 8px 24px rgba(15,23,42,.05)}}
.nav .brand{{display:flex;align-items:center;gap:10px;font-weight:800;font-size:14px}}
.nav .logo{{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;
  background:linear-gradient(135deg,{grad});color:#fff;font:800 11px var(--mono);
  box-shadow:0 6px 16px rgba({rgb},.4);transform:perspective(200px) rotateY(-8deg);transition:transform .3s var(--ease)}}
.nav .brand:hover .logo{{transform:perspective(200px) rotateY(8deg) scale(1.05)}}
.nav .brand span{{color:var(--primary)}}
.nav .links{{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end;max-width:min(100%,960px)}}
.nav a.pill{{font-size:11.5px;font-weight:700;padding:6px 10px;border-radius:999px;color:var(--muted);border:1px solid transparent;transition:.2s}}
.nav a.pill:hover{{color:var(--primary);background:var(--primaryS);border-color:var(--line)}}
.nav a.pill.active{{color:#fff;background:linear-gradient(135deg,{grad});box-shadow:0 4px 14px rgba({rgb},.35)}}
.wrap{{max-width:1160px;margin:0 auto;padding:26px 16px 70px}}
.hero{{margin-bottom:22px}}
.eyebrow{{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;color:var(--primary);
  letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:999px;background:var(--primaryS);
  border:1px solid rgba({rgb},.22);margin-bottom:12px}}
.hero h1{{font-size:clamp(1.5rem,3.2vw,2.3rem);line-height:1.15;font-weight:900;letter-spacing:-.025em;margin-bottom:10px;
  background:linear-gradient(120deg,#0b1220,{p2} 40%,{p} 80%);-webkit-background-clip:text;background-clip:text;color:transparent}}
.hero p{{color:var(--muted);font-size:1.02rem;max-width:800px;line-height:1.7}}
.hero-meta{{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}}
.chip{{padding:5px 11px;border-radius:999px;font-size:12px;font-weight:700;background:#fff;border:1px solid var(--line);color:var(--muted)}}
.chip.on{{background:var(--primaryS);color:var(--primary)}}
.grid{{display:grid;gap:16px}}
.grid-2{{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}}
.grid-3{{grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}}
.card{{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:18px;box-shadow:var(--shadow);
  position:relative;overflow:hidden;transition:transform .28s var(--ease),box-shadow .28s}}
.card:hover{{transform:translateY(-3px);box-shadow:var(--shadow2)}}
.card::before{{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--accent,linear-gradient(90deg,{grad}))}}
.card h3{{font-size:1.06rem;font-weight:800;margin-bottom:8px}}
.card p,.desc{{color:var(--muted);line-height:1.65;font-size:.93rem}}
.badge{{display:inline-flex;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;margin-bottom:10px;
  background:var(--primaryS);color:var(--primary);border:1px solid rgba({rgb},.2)}}
a.feature-card{{display:flex;flex-direction:column;min-height:150px;padding:18px;border-radius:var(--r);background:#fff;
  border:1px solid var(--line);box-shadow:var(--shadow);position:relative;overflow:hidden;transition:transform .3s}}
a.feature-card::after{{content:attr(data-ico);position:absolute;right:12px;top:10px;font-size:40px;opacity:.14}}
a.feature-card:hover{{transform:translateY(-7px) scale(1.012);box-shadow:var(--shadow2)}}
a.feature-card .num{{font:800 12px var(--mono);color:var(--c,var(--primary));margin-bottom:8px}}
a.feature-card h3{{font-size:1.05rem;margin-bottom:6px}}
a.feature-card p{{color:var(--muted);font-size:.86rem;line-height:1.5;flex:1}}
a.feature-card .go{{margin-top:10px;font-size:12.5px;font-weight:800;color:var(--c,var(--primary));opacity:0;transition:.25s}}
a.feature-card:hover .go{{opacity:1}}
.btn{{appearance:none;border:1px solid var(--line);background:var(--s2);color:var(--text);padding:10px 15px;border-radius:13px;
  cursor:pointer;font-weight:800;font-size:13.5px;transition:.2s;display:inline-flex;align-items:center;gap:6px}}
.btn:hover{{border-color:var(--line2);background:#fff;color:var(--primary);transform:translateY(-1px)}}
.btn.primary{{background:linear-gradient(135deg,{grad});border:none;color:#fff;box-shadow:0 8px 20px rgba({rgb},.3)}}
.btn.primary:hover{{filter:brightness(1.06);color:#fff}}
.btn:disabled{{opacity:.45;cursor:not-allowed;transform:none!important}}
.toolbar{{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0}}
.toolbar label{{font-size:12.5px;color:var(--muted);font-weight:700}}
.speed{{display:flex;gap:4px;background:var(--s2);padding:3px;border-radius:11px;border:1px solid var(--line)}}
.speed button{{border:none;background:transparent;padding:6px 11px;border-radius:8px;font-size:12px;font-weight:800;color:var(--muted);cursor:pointer}}
.speed button.on{{background:#fff;color:var(--primary);box-shadow:0 1px 4px rgba(15,23,42,.08)}}
.tip{{margin-top:12px;padding:13px 15px;border-radius:15px;background:linear-gradient(135deg,var(--primaryS),rgba(37,99,235,.05));
  border:1px solid var(--line);color:var(--muted);font-size:13.5px;line-height:1.65}}
.tip strong{{color:var(--text)}}
.formula{{font-family:var(--mono);background:linear-gradient(135deg,#f8fafc,var(--primaryS));border:1px solid rgba({rgb},.22);
  border-radius:16px;padding:14px 16px;margin-top:10px;color:var(--primary2);font-size:14.5px;line-height:1.55;text-align:center;font-weight:750}}
.code{{font-family:var(--mono);font-size:12.5px;line-height:1.7;background:#0f172a;color:#e2e8f0;border-radius:16px;padding:14px 16px;overflow:auto;white-space:pre;margin-top:10px}}
.stat-row{{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}}
.stat{{flex:1;min-width:100px;background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px}}
.stat span{{font-size:11.5px;color:var(--faint);font-weight:700}}
.stat b{{display:block;font-size:1.22rem;margin-top:4px;font-weight:900;font-variant-numeric:tabular-nums}}
.stat b.p{{color:var(--primary)}}.stat b.g{{color:var(--green)}}.stat b.r{{color:var(--red)}}.stat b.a{{color:var(--amber)}}
.list-step{{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;margin:8px 0;border-radius:14px;border:1px solid var(--line);background:#fff}}
.list-step .n{{flex-shrink:0;width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,{grad});color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900}}
.list-step .body{{flex:1;font-size:.92rem;color:var(--muted);line-height:1.55}}
.list-step .body b{{color:var(--text)}}
.stage-wrap{{position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow);background:#0b1220}}
.stage-wrap.light{{background:linear-gradient(rgba({rgb},.04) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.04) 1px,transparent 1px),#f8fafc;background-size:24px 24px,24px 24px,auto}}
canvas.stage{{width:100%;display:block;touch-action:none}}
.stage-hud{{position:absolute;left:12px;top:12px;right:12px;display:flex;justify-content:space-between;gap:8px;pointer-events:none;flex-wrap:wrap}}
.hud-pill{{padding:6px 11px;border-radius:999px;background:rgba(15,23,42,.72);color:#e2e8f0;font:700 12px var(--mono);border:1px solid rgba(255,255,255,.1)}}
.hud-pill.light{{background:rgba(255,255,255,.92);color:var(--text);border-color:var(--line)}}
.legend{{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;font-size:12.5px;color:var(--muted);font-weight:700}}
.legend i{{display:inline-block;width:11px;height:11px;border-radius:4px;margin-right:5px;vertical-align:middle}}
.log{{max-height:160px;overflow:auto;font:12px/1.65 var(--mono);color:var(--muted);background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px;margin-top:10px}}
.cells{{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:12px 0}}
.cell{{min-width:46px;min-height:46px;border-radius:12px;display:grid;place-items:center;font-weight:900;font-size:14px;
  border:1.5px solid var(--line);background:#fff;transition:all .25s var(--ease)}}
.cell.on{{border-color:var(--primary);background:var(--primaryS);color:var(--primary);transform:translateY(-3px) scale(1.05)}}
.cell.hit{{border-color:var(--green);background:var(--greenS);color:var(--green)}}
.cell.dead{{border-color:var(--red);background:var(--redS);color:var(--red)}}
.cell.piv{{border-color:var(--amber);background:rgba(217,119,6,.12);color:var(--amber)}}
.board{{display:inline-grid;gap:2px;padding:6px;background:var(--s2);border-radius:10px;border:1px solid var(--line)}}
.sq{{width:36px;height:36px;display:grid;place-items:center;font-size:16px}}
.sq.light{{background:#e8eef8}}.sq.dark{{background:#d4e0f0}}.sq.q{{color:#b91c1c}}
.page-nav{{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:36px;padding-top:22px;border-top:1px solid var(--line)}}
.page-nav a{{display:flex;flex-direction:column;min-width:160px;padding:14px 16px;border-radius:16px;border:1px solid var(--line);background:#fff;box-shadow:var(--shadow);transition:.25s}}
.page-nav a:hover{{transform:translateY(-3px);box-shadow:var(--shadow2)}}
.page-nav .dir{{font-size:11px;font-weight:800;color:var(--faint);letter-spacing:.06em;text-transform:uppercase}}
.page-nav .name{{font-weight:800;margin-top:4px}}
.footer{{margin-top:28px;text-align:center;color:var(--faint);font-size:12.5px;line-height:1.65}}
.footer b{{color:var(--muted)}}
.fade-in{{animation:up .5s var(--ease) both}}
@keyframes up{{from{{opacity:0;transform:translateY(16px)}}to{{opacity:1;transform:none}}}}
.pulse-dot{{width:8px;height:8px;border-radius:50%;background:var(--primary);display:inline-block;box-shadow:0 0 0 0 rgba({rgb},.45);animation:pulse 1.6s infinite}}
@keyframes pulse{{0%{{box-shadow:0 0 0 0 rgba({rgb},.45)}}70%{{box-shadow:0 0 0 10px transparent}}}}
@media (prefers-reduced-motion:reduce){{*,*::before,*::after{{animation-duration:.01ms!important;transition-duration:.01ms!important}}}}
"""


def common_js(theme: dict) -> str:
    rgb = theme["rgb"]
    return f"""
(function(){{
  const host=document.querySelector('.fx-bg'); if(!host) return;
  const cv=document.createElement('canvas'); host.appendChild(cv);
  const ctx=cv.getContext('2d'); let parts=[];
  function resize(){{
    cv.width=innerWidth*devicePixelRatio; cv.height=innerHeight*devicePixelRatio;
    cv.style.width=innerWidth+'px'; cv.style.height=innerHeight+'px';
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    parts=Array.from({{length:24}},()=>({{x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:1+Math.random()*2, vx:(Math.random()-.5)*.18, vy:-.1-Math.random()*.22, a:.12+Math.random()*.28}}));
  }}
  function tick(){{
    ctx.clearRect(0,0,innerWidth,innerHeight);
    parts.forEach(p=>{{
      p.x+=p.vx; p.y+=p.vy; if(p.y<-10){{p.y=innerHeight+10;p.x=Math.random()*innerWidth;}}
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba({rgb},${{p.a}})`; ctx.fill();
    }});
    requestAnimationFrame(tick);
  }}
  addEventListener('resize',resize); resize(); tick();
}})();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function barDraw(ctx,W,H,arr,hi={{}}){{
  ctx.clearRect(0,0,W,H);
  const n=arr.length, pad=28, gap=6, bw=Math.max(8,(W-pad*2)/n-gap);
  const mx=Math.max(...arr,1);
  arr.forEach((v,i)=>{{
    const x=pad+i*(bw+gap), h=(H-pad*2)*(v/mx), y=H-pad-h;
    let col=hi.sorted&&hi.sorted.has(i)?'#059669':(hi.pivot===i?'#d97706':(hi.i===i||hi.j===i?'#e11d48':(hi.mid===i?'#7c3aed':(hi.range&&i>=hi.range[0]&&i<=hi.range[1]?'#2563eb':'#64748b'))));
    if(hi.active&&hi.active.has(i)) col='#e11d48';
    if(hi.lo===i||hi.hi===i) col='#0891b2';
    ctx.fillStyle=col; ctx.beginPath();
    const r=6; ctx.moveTo(x+r,y); ctx.arcTo(x+bw,y,x+bw,y+h,r); ctx.arcTo(x+bw,y+h,x,y+h,0); ctx.arcTo(x,y+h,x,y,0); ctx.arcTo(x,y,x+bw,y,r); ctx.fill();
    ctx.fillStyle='#0f172a'; ctx.font='bold 11px ui-monospace'; ctx.textAlign='center';
    ctx.fillText(v, x+bw/2, y-6);
  }});
}}
"""


class PageBuilder:
    def __init__(self, out, theme_key: str, links: list[tuple[str, str]]):
        from pathlib import Path
        self.out = Path(out)
        self.theme = THEMES[theme_key]
        self.links = links
        self.css = css(self.theme)
        self.cjs = common_js(self.theme)
        self.ch = self.theme["ch"]
        self.logo = self.theme["logo"]

    def nav(self, active: str) -> str:
        pills = "".join(
            f'<a class="{"pill active" if h==active else "pill"}" href="{h}">{lab}</a>'
            for h, lab in self.links
        )
        return f'''<div class="fx-bg" aria-hidden="true"></div>
<nav class="nav"><div class="brand"><div class="logo">{self.logo}</div>算法可视化 · <span>{self.ch}</span></div>
<div class="links">{pills}</div></nav>'''

    def page_nav(self, active: str) -> str:
        names = [h for h, _ in self.links]
        if active not in names:
            return ""
        i = names.index(active)
        prev = self.links[i - 1] if i > 0 else None
        nxt = self.links[i + 1] if i < len(self.links) - 1 else None
        left = f'<a href="{prev[0]}"><span class="dir">← 上一节</span><span class="name">{prev[1]}</span></a>' if prev else "<div></div>"
        right = f'<a href="{nxt[0]}" style="text-align:right"><span class="dir">下一节 →</span><span class="name">{nxt[1]}</span></a>' if nxt else "<div></div>"
        return f'<div class="page-nav">{left}{right}</div>'

    def page(self, title: str, active: str, body: str, js: str = "") -> str:
        return f"""<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{title} · {self.ch}</title>
<style>{self.css}</style></head><body>
{self.nav(active)}
<div class="wrap fade-in">
{body}
{self.page_nav(active)}
<div class="footer">算法设计与分析 · <b>{self.ch}</b> · 算法演示加深版<br/>
<a href="../../index.html" style="color:var(--primary);font-weight:800">课程总览</a></div>
</div>
<script>
{self.cjs}
{js}
</script></body></html>"""

    def write(self, name: str, html: str) -> None:
        (self.out / name).write_text(html, encoding="utf-8")
        print("✓", name, (self.out / name).stat().st_size)
