# -*- coding: utf-8 -*-
"""
将第1–5章 interactive 页面升级为强交互外壳（与第6–12章同级视觉/导航），
保留原有 body 演示逻辑，仅替换 CSS / nav / footer / 粒子背景 / page-nav。
"""
from __future__ import annotations
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent

# chapter config: folder, logo, brand color tokens, chapter title
CHAPTERS = [
    {
        "dir": "第一章",
        "logo": "01",
        "title": "第1章 绪论",
        "accent": "blue",
        "primary": "#2563eb",
        "primary2": "#1d4ed8",
        "grad": "#60a5fa,#2563eb 55%,#7c3aed",
        "rgb": "37,99,235",
        "bg_grad": "linear-gradient(180deg,#f8fafc,#eff6ff 50%,#e0e7ff)",
        "footer_extra": "算法 · 复杂度 · STL",
    },
    {
        "dir": "第二章",
        "logo": "02",
        "title": "第2章 递归算法设计技术",
        "accent": "violet",
        "primary": "#7c3aed",
        "primary2": "#6d28d9",
        "grad": "#a78bfa,#7c3aed 55%,#2563eb",
        "rgb": "124,58,237",
        "bg_grad": "linear-gradient(180deg,#faf5ff,#f5f3ff 50%,#ede9fe)",
        "footer_extra": "递归 · 汉诺塔 · 递推式",
    },
    {
        "dir": "第三章",
        "logo": "03",
        "title": "第3章 穷举法",
        "accent": "teal",
        "primary": "#0f766e",
        "primary2": "#0d9488",
        "grad": "#2dd4bf,#0f766e 55%,#0891b2",
        "rgb": "15,118,110",
        "bg_grad": "linear-gradient(180deg,#f0fdfa,#ecfeff 50%,#e6fffa)",
        "footer_extra": "枚举 · 子集 · 排列",
    },
    {
        "dir": "第四章",
        "logo": "04",
        "title": "第4章 分治法",
        "accent": "cyan",
        "primary": "#0891b2",
        "primary2": "#0e7490",
        "grad": "#22d3ee,#0891b2 55%,#2563eb",
        "rgb": "8,145,178",
        "bg_grad": "linear-gradient(180deg,#ecfeff,#f0f9ff 50%,#e0f2fe)",
        "footer_extra": "快排 · 归并 · 棋盘覆盖",
    },
    {
        "dir": "第五章",
        "logo": "05",
        "title": "第5章 回溯法",
        "accent": "indigo",
        "primary": "#4f46e5",
        "primary2": "#4338ca",
        "grad": "#818cf8,#4f46e5 55%,#2563eb",
        "rgb": "79,70,229",
        "bg_grad": "linear-gradient(180deg,#f8f9ff,#eef2ff 50%,#e0e7ff)",
        "footer_extra": "解空间树 · 剪支 · n皇后",
    },
]


def make_css(c: dict) -> str:
    p, p2, rgb, grad, bg = c["primary"], c["primary2"], c["rgb"], c["grad"], c["bg_grad"]
    return f"""
:root{{
  --bg:#f8fafc; --surface:#fff; --s2:#f1f5f9; --s3:#e2e8f0;
  --text:#0b1220; --muted:#5a6b85; --faint:#8b9bb5;
  --line:rgba({rgb},.15); --line2:rgba({rgb},.28);
  --primary:{p}; --primary2:{p2}; --primaryS:rgba({rgb},.1);
  --blue:#2563eb; --blueS:rgba(37,99,235,.1);
  --green:#059669; --greenS:rgba(5,150,105,.1);
  --red:#dc2626; --redS:rgba(220,38,38,.09);
  --amber:#d97706; --violet:#7c3aed; --cyan:#0891b2;
  --shadow:0 8px 28px rgba({rgb},.12); --shadow2:0 22px 50px rgba({rgb},.18);
  --r:22px;
  --font:"Segoe UI","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  --mono:ui-monospace,"Cascadia Code",Consolas,monospace;
  --ease:cubic-bezier(.22,1,.36,1);
}}
*,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
html{{scroll-behavior:smooth}}
body{{
  font-family:var(--font);color:var(--text);min-height:100vh;overflow-x:hidden;
  background:
    radial-gradient(1100px 560px at 5% -8%,rgba({rgb},.14),transparent 55%),
    radial-gradient(900px 480px at 95% 0%,rgba(37,99,235,.08),transparent 50%),
    {bg};
  -webkit-font-smoothing:antialiased;
}}
a{{color:inherit;text-decoration:none}} button,input,select{{font:inherit}}
.fx-bg{{position:fixed;inset:0;pointer-events:none;z-index:0}}
.fx-bg canvas{{width:100%;height:100%;display:block;opacity:.4}}
.nav,.wrap{{position:relative;z-index:1}}
.nav{{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  padding:11px 18px;background:rgba(255,255,255,.88);backdrop-filter:blur(18px) saturate(1.35);
  border-bottom:1px solid var(--line);box-shadow:0 8px 24px rgba(15,23,42,.05)}}
.nav .brand{{display:flex;align-items:center;gap:10px;font-weight:800;font-size:14px}}
.nav .logo{{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;
  background:linear-gradient(135deg,{grad});color:#fff;
  font:800 11px var(--mono);box-shadow:0 6px 16px rgba({rgb},.4);
  transform:perspective(200px) rotateY(-8deg);transition:transform .3s var(--ease)}}
.nav .brand:hover .logo{{transform:perspective(200px) rotateY(8deg) scale(1.05)}}
.nav .brand span{{color:var(--primary)}}
.nav .links{{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end;max-width:min(100%,920px)}}
.nav a.pill{{font-size:11.5px;font-weight:700;padding:6px 10px;border-radius:999px;color:var(--muted);border:1px solid transparent;transition:.2s var(--ease)}}
.nav a.pill:hover{{color:var(--primary);background:var(--primaryS);border-color:var(--line)}}
.nav a.pill.active{{color:#fff;background:linear-gradient(135deg,{grad});box-shadow:0 4px 14px rgba({rgb},.35)}}
.wrap{{max-width:1160px;margin:0 auto;padding:26px 16px 70px}}
.hero{{margin-bottom:24px}}
.eyebrow,.hero .eyebrow{{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;color:var(--primary);
  letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:999px;background:var(--primaryS);
  border:1px solid rgba({rgb},.22);margin-bottom:12px}}
.hero h1{{font-size:clamp(1.55rem,3.3vw,2.4rem);line-height:1.15;font-weight:900;letter-spacing:-.025em;margin-bottom:12px;
  background:linear-gradient(120deg,#0b1220,{p2} 35%,{p} 70%);
  -webkit-background-clip:text;background-clip:text;color:transparent}}
.hero p{{color:var(--muted);font-size:1.04rem;max-width:780px;line-height:1.7}}
.grid{{display:grid;gap:16px}}
.grid-2{{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}}
.grid-3{{grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}}
.card{{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px;box-shadow:var(--shadow);
  position:relative;overflow:hidden;transition:transform .28s var(--ease),box-shadow .28s,border-color .28s}}
.card:hover{{transform:translateY(-3px);box-shadow:var(--shadow2);border-color:var(--line2)}}
.card::before{{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--accent,linear-gradient(90deg,{grad}))}}
.card h3{{font-size:1.08rem;font-weight:800;margin-bottom:8px}}
.card p{{color:var(--muted);line-height:1.65;font-size:.94rem}}
.badge{{display:inline-flex;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;margin-bottom:10px;
  background:var(--primaryS);color:var(--primary);border:1px solid rgba({rgb},.2)}}
a.card{{display:block;color:inherit}}
.btn{{appearance:none;border:1px solid var(--line);background:var(--s2);color:var(--text);
  padding:10px 16px;border-radius:13px;cursor:pointer;font-weight:800;font-size:13.5px;
  transition:.2s var(--ease);display:inline-flex;align-items:center;gap:6px}}
.btn:hover{{border-color:var(--line2);background:#fff;color:var(--primary);transform:translateY(-1px)}}
.btn.primary{{background:linear-gradient(135deg,{grad});border:none;color:#fff;box-shadow:0 8px 20px rgba({rgb},.32)}}
.btn.primary:hover{{filter:brightness(1.06);color:#fff}}
.btn:disabled{{opacity:.45;cursor:not-allowed;transform:none!important}}
.toolbar{{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0}}
.toolbar label{{font-size:12.5px;color:var(--muted);font-weight:700}}
input[type=range]{{accent-color:var(--primary)}}
input[type=number],select{{background:#fff;border:1px solid var(--line);color:var(--text);border-radius:9px;padding:6px 9px}}
.tip{{margin-top:12px;padding:13px 15px;border-radius:15px;background:linear-gradient(135deg,var(--primaryS),rgba(37,99,235,.05));
  border:1px solid var(--line);color:var(--muted);font-size:13.5px;line-height:1.65}}
.tip strong{{color:var(--text)}}
.formula{{font-family:var(--mono);background:linear-gradient(135deg,#f8fafc,var(--primaryS));border:1px solid rgba({rgb},.22);
  border-radius:16px;padding:16px 18px;margin-top:10px;color:var(--primary2);font-size:15px;line-height:1.55;text-align:center;font-weight:750}}
.code{{font-family:var(--mono);font-size:12.5px;line-height:1.7;background:#0f172a;color:#e2e8f0;border-radius:16px;
  padding:15px 16px;overflow:auto;white-space:pre;margin-top:10px}}
.stat-row{{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}}
.stat{{flex:1;min-width:100px;background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px}}
.stat b{{display:block;font-size:1.25rem;margin-top:4px;font-weight:900}}
.stat span{{font-size:11.5px;color:var(--faint);font-weight:700}}
.list-step{{padding:12px 14px;margin:8px 0;border-radius:14px;border:1px solid var(--line);background:#fff}}
.list-step b{{color:var(--primary)}}
.tabs{{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}}
.tab{{padding:6px 11px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer;font-weight:700;font-size:12.5px}}
.tab.active{{color:#fff;background:var(--primary);border-color:var(--primary)}}
.cells{{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:12px 0}}
.cell{{min-width:44px;min-height:44px;border-radius:12px;display:grid;place-items:center;font-weight:900;font-size:14px;
  border:1.5px solid var(--line);background:#fff;transition:all .25s var(--ease)}}
.cell.on,.cell.live{{border-color:var(--primary);background:var(--primaryS);color:var(--primary);transform:translateY(-3px) scale(1.05)}}
.cell.hit{{border-color:var(--green);background:var(--greenS);color:var(--green)}}
.cell.dead{{border-color:var(--red);background:var(--redS);color:var(--red);opacity:.75}}
.cell.exp{{border-color:var(--red);background:var(--redS);box-shadow:0 0 0 3px rgba(220,38,38,.15)}}
.log{{max-height:170px;overflow:auto;font:12px/1.65 var(--mono);color:var(--muted);background:var(--s2);border:1px solid var(--line);border-radius:15px;padding:12px 14px;margin-top:10px}}
.board{{display:inline-grid;gap:2px;padding:6px;background:var(--s2);border-radius:10px;border:1px solid var(--line)}}
.sq{{width:36px;height:36px;display:grid;place-items:center;font-size:16px}}
.sq.light{{background:#e8eef8}}.sq.dark{{background:#d4e0f0}}
.sq.q{{color:#b91c1c}}.sq.att{{background:rgba(220,38,38,.2)}}
canvas.stage,canvas#treeCv,canvas#gCv,canvas#tspCv{{width:100%;display:block;border-radius:12px}}
table.data,table{{border-collapse:collapse}}
.page-nav{{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:36px;padding-top:22px;border-top:1px solid var(--line)}}
.page-nav a{{display:flex;flex-direction:column;min-width:160px;padding:14px 16px;border-radius:16px;border:1px solid var(--line);
  background:#fff;box-shadow:var(--shadow);transition:.25s var(--ease)}}
.page-nav a:hover{{transform:translateY(-3px);box-shadow:var(--shadow2);border-color:var(--line2)}}
.page-nav .dir{{font-size:11px;font-weight:800;color:var(--faint);letter-spacing:.06em;text-transform:uppercase}}
.page-nav .name{{font-weight:800;margin-top:4px}}
.footer{{margin-top:28px;text-align:center;color:var(--faint);font-size:12.5px;line-height:1.65}}
.footer b{{color:var(--muted)}}
.fade-in{{animation:up .5s var(--ease) both}}
@keyframes up{{from{{opacity:0;transform:translateY(16px)}}to{{opacity:1;transform:none}}}}
.hub-link{{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:12.5px;font-weight:800;color:var(--primary)}}
"""


def make_particle_js(rgb: str) -> str:
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
"""


def extract_links(inter: Path) -> list[tuple[str, str]]:
    """Build ordered nav links from existing html files."""
    files = sorted(inter.glob("*.html"))
    links = [("index.html", "总览")]
    labels = {
        "01": "01", "02": "02", "03": "03", "04": "04", "05": "05",
        "06": "06", "07": "07", "08": "08", "09": "09", "10": "10",
        "11": "11", "12": "12",
    }
    for f in files:
        if f.name == "index.html":
            continue
        # try get short label from title or filename
        stem = f.stem  # 01-overview
        short = stem.split("-", 1)[-1] if "-" in stem else stem
        # better labels from existing nav if present
        text = f.read_text(encoding="utf-8", errors="ignore")
        m = re.search(r"<title>([^·<]+)", text)
        lab = m.group(1).strip() if m else short
        lab = lab.replace("第5章回溯法", "").replace("交互可视化", "").strip() or short
        if len(lab) > 8:
            lab = short[:8]
        links.append((f.name, lab[:10]))
    return links


def extract_body_and_scripts(html: str) -> tuple[str, str]:
    """Return (inner wrap content, external scripts joined)."""
    # body content inside .wrap
    m = re.search(r'<div class="wrap[^"]*"[^>]*>(.*)</div>\s*(?:<script|</body>)', html, re.S)
    if m:
        body = m.group(1)
        # strip old footer
        body = re.sub(r'<div class="footer">.*?</div>\s*$', "", body, flags=re.S)
    else:
        # fallback: everything between </nav> and first <script>
        m2 = re.search(r"</nav>(.*?)<script", html, re.S)
        body = m2.group(1) if m2 else ""
        body = re.sub(r'^\\s*<div class="wrap[^"]*">', "", body)
        body = re.sub(r"</div>\\s*$", "", body)

    scripts = re.findall(r"<script(?:(?!src)[^>])*>(.*?)</script>", html, re.S)
    # filter empty
    js = "\n".join(s for s in scripts if s.strip())
    return body.strip(), js


def build_nav(c: dict, links: list[tuple[str, str]], active: str) -> str:
    pills = "".join(
        f'<a class="{"pill active" if h == active else "pill"}" href="{h}">{lab}</a>'
        for h, lab in links
    )
    return f'''<div class="fx-bg" aria-hidden="true"></div>
<nav class="nav">
  <div class="brand"><div class="logo">{c["logo"]}</div>算法可视化 · <span>{c["title"]}</span></div>
  <div class="links">{pills}</div>
</nav>'''


def page_nav_html(links: list[tuple[str, str]], active: str) -> str:
    names = [h for h, _ in links]
    if active not in names:
        return ""
    i = names.index(active)
    prev = links[i - 1] if i > 0 else None
    nxt = links[i + 1] if i < len(links) - 1 else None
    left = (
        f'<a href="{prev[0]}"><span class="dir">← 上一节</span><span class="name">{prev[1]}</span></a>'
        if prev
        else "<div></div>"
    )
    right = (
        f'<a href="{nxt[0]}" style="text-align:right"><span class="dir">下一节 →</span><span class="name">{nxt[1]}</span></a>'
        if nxt
        else "<div></div>"
    )
    hub = '<a class="hub-link" href="../../index.html">↑ 课程总览</a>' if active == "index.html" else ""
    return f'<div class="page-nav">{left}{right}</div>{hub}'


def upgrade_chapter(c: dict) -> None:
    inter = BASE / c["dir"] / "interactive"
    if not inter.is_dir():
        print("skip missing", c["dir"])
        return
    links = extract_links(inter)
    css = make_css(c)
    part_js = make_particle_js(c["rgb"])
    count = 0
    for f in sorted(inter.glob("*.html")):
        old = f.read_text(encoding="utf-8", errors="ignore")
        body, js = extract_body_and_scripts(old)
        # remove nested wrap if any leftover
        body = re.sub(r'^<div class="wrap[^"]*">\s*', "", body)
        body = re.sub(r'\s*</div>\s*$', "", body)
        # title
        tm = re.search(r"<title>([^<]+)</title>", old)
        title = tm.group(1).split("·")[0].strip() if tm else f.stem
        nav = build_nav(c, links, f.name)
        pnav = page_nav_html(links, f.name)
        html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{title} · {c["title"]}</title>
<style>{css}</style>
</head><body>
{nav}
<div class="wrap fade-in">
{body}
{pnav}
<div class="footer">算法设计与分析 · <b>{c["title"]}</b> · 强交互外壳版<br/>{c["footer_extra"]} · <a href="../../index.html" style="color:var(--primary);font-weight:800">课程总览</a></div>
</div>
<script>
{part_js}
{js}
</script>
</body></html>
"""
        f.write_text(html, encoding="utf-8")
        count += 1
        print("  ✓", f.name, f.stat().st_size)
    print(f"{c['dir']} upgraded {count} pages → {inter}")


def main():
    for c in CHAPTERS:
        print("===", c["dir"], "===")
        upgrade_chapter(c)
    print("\nDone. Open PPT/index.html for course hub.")


if __name__ == "__main__":
    main()
