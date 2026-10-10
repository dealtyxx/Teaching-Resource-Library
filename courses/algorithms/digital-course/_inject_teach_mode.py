# -*- coding: utf-8 -*-
"""
为全部 interactive HTML 注入课堂投影模式：
- F / F11：全屏
- ? / H：快捷键帮助
- ← →：上一节 / 下一节（page-nav）
- Space：触发页面主按钮 .btn.primary
- Esc：退出全屏 / 关闭帮助
幂等：已注入则跳过。
"""
from __future__ import annotations
from pathlib import Path

BASE = Path(__file__).resolve().parent
MARKER = "/* TEACH_MODE_V1 */"

TEACH_CSS = r"""
/* TEACH_MODE_V1 */
.teach-bar{position:fixed;right:14px;bottom:14px;z-index:9999;display:flex;gap:8px;align-items:center;
  padding:8px 10px;border-radius:14px;background:rgba(15,23,42,.88);color:#e2e8f0;font:700 12px system-ui,sans-serif;
  box-shadow:0 10px 30px rgba(0,0,0,.25);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1)}
.teach-bar button{appearance:none;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.08);
  color:#fff;border-radius:10px;padding:6px 10px;cursor:pointer;font:700 12px system-ui,sans-serif}
.teach-bar button:hover{background:rgba(255,255,255,.16)}
.teach-help{position:fixed;inset:0;z-index:10000;display:none;place-items:center;background:rgba(15,23,42,.55);padding:20px}
.teach-help.on{display:grid}
.teach-help .box{max-width:520px;width:100%;background:#fff;border-radius:18px;padding:20px 22px;box-shadow:0 25px 60px rgba(0,0,0,.3)}
.teach-help h3{margin:0 0 12px;font-size:1.15rem}
.teach-help table{width:100%;border-collapse:collapse;font-size:13.5px}
.teach-help td{padding:8px 6px;border-bottom:1px solid #e2e8f0;color:#334155}
.teach-help td:first-child{font-family:ui-monospace,Consolas,monospace;font-weight:800;color:#1d4ed8;width:120px}
.teach-help .close{margin-top:14px;width:100%;padding:10px;border:none;border-radius:12px;background:#2563eb;color:#fff;font-weight:800;cursor:pointer}
body.teach-focus .nav{opacity:.35;transition:.25s}
body.teach-focus .nav:hover{opacity:1}
body.teach-focus .footer,body.teach-focus .page-nav{opacity:.2}
"""

TEACH_JS = r"""
/* TEACH_MODE_V1 */
(function(){
  if(window.__TEACH_MODE__) return; window.__TEACH_MODE__=1;
  const bar=document.createElement('div'); bar.className='teach-bar'; bar.innerHTML=
    '<button type="button" id="teachFs" title="F">⛶ 全屏</button>'+
    '<button type="button" id="teachHelpBtn" title="?">? 帮助</button>'+
    '<button type="button" id="teachFocus" title="专注">专注</button>';
  document.body.appendChild(bar);
  const help=document.createElement('div'); help.className='teach-help'; help.innerHTML=
    '<div class="box"><h3>课堂快捷键</h3><table>'+
    '<tr><td>F / F11</td><td>进入或退出全屏（适合投影）</td></tr>'+
    '<tr><td>← / →</td><td>上一节 / 下一节</td></tr>'+
    '<tr><td>Space</td><td>触发主按钮（▶ 播放 / 运行）</td></tr>'+
    '<tr><td>? / H</td><td>打开或关闭本帮助</td></tr>'+
    '<tr><td>Esc</td><td>关闭帮助 / 退出全屏</td></tr>'+
    '<tr><td>1 / 2 / 4</td><td>若有速度条，切换 1× 2× 4×</td></tr>'+
    '</table><button type="button" class="close" id="teachClose">知道了</button></div>';
  document.body.appendChild(help);
  function toggleFs(){
    if(!document.fullscreenElement){ document.documentElement.requestFullscreen?.(); }
    else document.exitFullscreen?.();
  }
  function showHelp(on){ help.classList.toggle('on', on!==false ? !help.classList.contains('on') : false); if(on===false) help.classList.remove('on'); if(on===true) help.classList.add('on'); }
  function navDir(dir){
    const links=[...document.querySelectorAll('.page-nav a[href]')];
    if(!links.length) return;
    if(dir<0) links[0].click();
    else links[links.length-1].click();
  }
  function firePrimary(){
    const b=document.querySelector('.btn.primary, button.primary, #run, #play, #anim');
    if(b && !b.disabled) b.click();
  }
  function setSpeed(s){
    const btn=[...document.querySelectorAll('.speed button')].find(x=>x.dataset.s===String(s) || x.textContent.trim().startsWith(String(s)));
    if(btn) btn.click();
  }
  teachFs.onclick=toggleFs;
  teachHelpBtn.onclick=()=>showHelp();
  teachClose.onclick=()=>showHelp(false);
  help.onclick=e=>{ if(e.target===help) showHelp(false); };
  teachFocus.onclick=()=>document.body.classList.toggle('teach-focus');
  addEventListener('keydown', e=>{
    const tag=(e.target&&e.target.tagName||'').toLowerCase();
    if(tag==='input'||tag==='textarea'||tag==='select'||e.target.isContentEditable) return;
    if(e.key==='f'||e.key==='F'||e.key==='F11'){ e.preventDefault(); toggleFs(); }
    else if(e.key==='?'||e.key==='h'||e.key==='H'){ e.preventDefault(); showHelp(); }
    else if(e.key==='Escape'){ showHelp(false); if(document.fullscreenElement) document.exitFullscreen?.(); }
    else if(e.key==='ArrowLeft'){ e.preventDefault(); navDir(-1); }
    else if(e.key==='ArrowRight'){ e.preventDefault(); navDir(1); }
    else if(e.key===' ' || e.code==='Space'){ e.preventDefault(); firePrimary(); }
    else if(e.key==='1'||e.key==='2'||e.key==='4'){ setSpeed(e.key); }
  });
})();
"""


def inject(html: str) -> str | None:
    if MARKER in html:
        return None
    out = html
    # CSS
    if "</style>" in out:
        out = out.replace("</style>", TEACH_CSS + "\n</style>", 1)
    else:
        out = out.replace("</head>", f"<style>{TEACH_CSS}</style></head>", 1)
    # JS before last </body>
    if "</body>" in out:
        out = out.replace("</body>", f"<script>\n{TEACH_JS}\n</script>\n</body>", 1)
    else:
        out += f"\n<script>\n{TEACH_JS}\n</script>\n"
    return out


def main():
    n = 0
    skipped = 0
    for html in BASE.rglob("interactive/*.html"):
        # skip non-chapter if any
        text = html.read_text(encoding="utf-8", errors="ignore")
        res = inject(text)
        if res is None:
            skipped += 1
            continue
        html.write_text(res, encoding="utf-8")
        n += 1
        print("✓", html.relative_to(BASE))
    print(f"\n注入完成: {n} 页, 跳过已注入 {skipped}")


if __name__ == "__main__":
    main()
