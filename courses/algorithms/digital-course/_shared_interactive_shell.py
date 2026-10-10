# -*- coding: utf-8 -*-
"""Shared light-theme shell for chapter interactive pages (same style as 第五章)."""
from pathlib import Path

CSS = r"""
:root{
  --bg:#f4f7fc; --bg2:#ffffff; --card:#ffffff; --card2:#eef3fb;
  --text:#0f172a; --muted:#5b6b82; --line:#d4e0f0;
  --blue:#2563eb; --orange:#dc2626; --green:#0f766e; --purple:#1d4ed8;
  --pink:#e11d48; --red:#dc2626; --yellow:#b91c1c; --cyan:#1d4ed8;
  --shadow:0 10px 36px rgba(37,99,235,.10); --radius:18px;
  --font:'Segoe UI','PingFang SC','Microsoft YaHei',system-ui,sans-serif;
  --mono:ui-monospace,'Cascadia Code','Consolas',monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);color:var(--text);min-height:100vh;overflow-x:hidden;
  background:radial-gradient(1100px 560px at 8% -8%,rgba(37,99,235,.12),transparent 55%),
  radial-gradient(900px 480px at 92% 0%,rgba(220,38,38,.07),transparent 50%),
  radial-gradient(700px 380px at 50% 100%,rgba(37,99,235,.05),transparent 45%),var(--bg)}
a{color:inherit;text-decoration:none}
.nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  padding:10px 14px;background:rgba(255,255,255,.9);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.nav .brand{font-weight:700;font-size:13.5px}.nav .brand span{color:var(--blue)}
.nav .links{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto}
.nav a.pill{font-size:11px;padding:5px 8px;border-radius:999px;border:1px solid var(--line);color:var(--muted);transition:.2s}
.nav a.pill:hover,.nav a.pill.active{color:#fff;border-color:var(--blue);background:var(--blue)}
.wrap{max-width:1200px;margin:0 auto;padding:22px 16px 52px}
.hero{margin-bottom:20px}
.hero .eyebrow{font-size:11.5px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
.hero h1{font-size:clamp(1.45rem,2.8vw,2.2rem);line-height:1.2;margin-bottom:8px;
  background:linear-gradient(120deg,#0f172a 5%,#2563eb 50%,#dc2626);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{color:var(--muted);font-size:.96rem;max-width:780px;line-height:1.65}
.grid{display:grid;gap:14px}
.grid-2{grid-template-columns:repeat(auto-fit,minmax(290px,1fr))}
.grid-3{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.card{background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:16px;box-shadow:var(--shadow);
  transition:transform .22s,border-color .22s;position:relative;overflow:hidden}
.card:hover{transform:translateY(-2px);border-color:rgba(37,99,235,.4)}
.card::before{content:'';position:absolute;inset:0 0 auto 0;height:3px;background:var(--accent,var(--blue))}
.card h3{font-size:1.02rem;margin-bottom:6px}
.card p{color:var(--muted);line-height:1.6;font-size:.92rem}
.badge{display:inline-block;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;margin-bottom:8px;
  background:rgba(37,99,235,.1);color:var(--blue);border:1px solid rgba(37,99,235,.25)}
.btn{appearance:none;border:1px solid var(--line);background:var(--card2);color:var(--text);
  padding:8px 13px;border-radius:11px;cursor:pointer;font:inherit;font-weight:600;transition:.2s}
.btn:hover{border-color:var(--blue);background:rgba(37,99,235,.08)}
.btn.primary{background:linear-gradient(135deg,var(--blue),#1e40af);border:none;color:#fff}
.btn:disabled{opacity:.45;cursor:not-allowed}
.toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0}
.toolbar label{font-size:12.5px;color:var(--muted)}
input[type=range]{width:130px;accent-color:var(--blue)}
input[type=number],select{background:#fff;border:1px solid var(--line);color:var(--text);border-radius:9px;padding:6px 9px;font:inherit}
.tip{margin-top:10px;padding:10px 12px;border-radius:11px;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.18);color:var(--muted);font-size:13px;line-height:1.55}
.tip strong{color:var(--text)}
.kbd{font-family:var(--mono);font-size:12px;background:#eef3fb;border:1px solid var(--line);border-radius:6px;padding:2px 6px;color:#1d4ed8}
.formula{font-family:var(--mono);background:rgba(37,99,235,.05);border:1px solid var(--line);border-radius:11px;padding:10px 12px;margin-top:8px;color:#0f766e;font-size:13px;line-height:1.55}
.stat-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.stat{flex:1;min-width:90px;background:#f8fafc;border:1px solid var(--line);border-radius:11px;padding:9px}
.stat b{display:block;font-size:1.2rem;color:var(--text);margin-top:2px}
.stat span{font-size:11px;color:var(--muted)}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.tab{padding:6px 11px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer;font:inherit;font-weight:600;font-size:12.5px}
.tab.active{color:#fff;background:var(--blue);border-color:var(--blue)}
.footer{margin-top:32px;color:var(--muted);font-size:12px;text-align:center}
.fade-in{animation:fadeIn .4s ease both}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.code{font-family:var(--mono);font-size:12.5px;line-height:1.65;background:#f1f5fb;border:1px solid var(--line);border-radius:11px;padding:12px 14px;overflow:auto;white-space:pre}
.cell{min-width:40px;min-height:40px;border-radius:8px;display:grid;place-items:center;font-weight:700;font-size:14px;border:1.5px solid var(--line);background:#fff;transition:.25s;position:relative}
.cell.on{border-color:var(--blue);background:rgba(37,99,235,.12);transform:scale(1.05)}
.cell.hit{border-color:var(--green);background:rgba(15,118,110,.15);color:#0f766e}
.cell.dead{border-color:var(--red);background:rgba(220,38,38,.1);color:var(--red);opacity:.7}
.cell.live{border-color:var(--blue);background:rgba(37,99,235,.1)}
.cell.exp{border-color:var(--red);background:rgba(220,38,38,.15);box-shadow:0 0 0 3px rgba(220,38,38,.15)}
.cells{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:10px 0}
.log{max-height:160px;overflow:auto;font-family:var(--mono);font-size:11.5px;color:var(--muted);line-height:1.55;background:#f8fafc;border:1px solid var(--line);border-radius:10px;padding:10px}
.board{display:inline-grid;gap:2px;padding:6px;background:#eef3fb;border-radius:10px;border:1px solid var(--line)}
.sq{width:36px;height:36px;display:grid;place-items:center;font-size:16px}
.sq.light{background:#e8eef8}.sq.dark{background:#d4e0f0}
table.data{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}
table.data th,table.data td{border:1px solid var(--line);padding:8px 10px;text-align:left}
table.data th{background:#eef3fb;color:var(--muted);font-size:12px}
table.data tr:hover td{background:rgba(37,99,235,.04)}
.list-step{padding:10px 12px;margin:6px 0;border-radius:10px;border:1px solid var(--line);background:#fff}
.list-step b{color:var(--blue)}
canvas.stage{width:100%;background:#f8fafc;border-radius:12px;border:1px solid var(--line);display:block}
"""

def make_nav(chapter_title, links, active):
    pills = "".join(
        f'<a class="{"pill active" if h==active else "pill"}" href="{h}">{lab}</a>'
        for h, lab in links
    )
    return f'<nav class="nav"><div class="brand">算法可视化 · <span>{chapter_title}</span></div><div class="links">{pills}</div></nav>'

def make_page(chapter_title, title, active, links, body, js=""):
    return f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{title} · {chapter_title}</title><style>{CSS}</style></head><body>
{make_nav(chapter_title, links, active)}
<div class="wrap fade-in">{body}
<div class="footer">算法设计与分析 · {chapter_title} · 交互可视化</div></div>
<script>{js}</script></body></html>"""

def write_index(out: Path, chapter_title, chapter_en, intro, items, links):
    body = f"""
<section class="hero">
  <div class="eyebrow">{chapter_en}</div>
  <h1>{chapter_title} · 交互总览</h1>
  <p>{intro}</p>
</section>
<div class="grid grid-2" id="cards"></div>"""
    js = "const items=" + repr(items).replace("'", '"') + """;
cards.innerHTML=items.map(i=>`<a class="card" href="${i.h}" style="--accent:${i.c}"><div class="badge">图 ${i.n}</div><h3>${i.t}</h3><p>${i.d}</p></a>`).join('');
"""
    # fix: items need proper JS object format
    rows = []
    for it in items:
        rows.append(
            "{h:'%s',n:'%s',t:'%s',d:'%s',c:'%s'}" % (it["h"], it["n"], it["t"], it["d"], it["c"])
        )
    js = "const items=[\n  " + ",\n  ".join(rows) + "\n];\n"
    js += "cards.innerHTML=items.map(i=>`<a class=\"card\" href=\"${i.h}\" style=\"--accent:${i.c}\"><div class=\"badge\">图 ${i.n}</div><h3>${i.t}</h3><p>${i.d}</p></a>`).join('');\n"
    html = make_page(chapter_title, f"{chapter_title}交互可视化总览", "index.html", links, body, js)
    out.mkdir(parents=True, exist_ok=True)
    (out / "index.html").write_text(html, encoding="utf-8")

def write_page(out: Path, chapter_title, filename, title, links, body, js=""):
    html = make_page(chapter_title, title, filename, links, body, js)
    (out / filename).write_text(html, encoding="utf-8")
    print(" ", filename)
