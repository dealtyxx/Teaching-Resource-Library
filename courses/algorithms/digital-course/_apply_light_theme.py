# -*- coding: utf-8 -*-
"""Apply blue-white-red light theme to all chapter interactive HTML pages."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# 蓝白红亮色主题
LIGHT_ROOT = """:root{
  --bg:#f4f7fc; --bg2:#ffffff; --card:#ffffff; --card2:#eef3fb;
  --text:#0f172a; --muted:#5b6b82; --line:#d4e0f0;
  --blue:#2563eb; --orange:#dc2626; --green:#0f766e; --purple:#1d4ed8;
  --pink:#e11d48; --red:#dc2626; --yellow:#b91c1c; --cyan:#1d4ed8;
  --shadow:0 10px 36px rgba(37,99,235,.10);
  --radius:18px;
  --font:'Segoe UI','PingFang SC','Microsoft YaHei',system-ui,sans-serif;
  --mono:ui-monospace,'Cascadia Code','Consolas',monospace;
}"""

# Compact roots in ch2-4 (single line-ish)
LIGHT_ROOT_COMPACT = """:root{
  --bg:#f4f7fc; --bg2:#ffffff; --card:#ffffff; --card2:#eef3fb;
  --text:#0f172a; --muted:#5b6b82; --line:#d4e0f0;
  --blue:#2563eb; --orange:#dc2626; --green:#0f766e; --purple:#1d4ed8;
  --pink:#e11d48; --red:#dc2626; --yellow:#b91c1c; --cyan:#1d4ed8;
  --shadow:0 10px 36px rgba(37,99,235,.10); --radius:18px;
  --font:'Segoe UI','PingFang SC','Microsoft YaHei',system-ui,sans-serif;
  --mono:ui-monospace,'Cascadia Code','Consolas',monospace;
}"""

REPLACEMENTS = [
    # body multi-line dark gradients -> light
    (re.compile(
        r'background:\s*\n\s*radial-gradient\([^;]+;\s*\n\s*radial-gradient\([^;]+;\s*\n\s*radial-gradient\([^;]+;\s*\n\s*var\(--bg\);',
        re.M
    ),
     'background:\n'
     '    radial-gradient(1200px 600px at 8% -10%, rgba(37,99,235,.10), transparent 55%),\n'
     '    radial-gradient(900px 500px at 95% 0%, rgba(220,38,38,.06), transparent 50%),\n'
     '    radial-gradient(800px 400px at 50% 100%, rgba(37,99,235,.05), transparent 50%),\n'
     '    var(--bg);'),
    # single-line body backgrounds (ch2-4)
    (re.compile(
        r'background:radial-gradient\([^)]+\),\s*radial-gradient\([^)]+\),\s*radial-gradient\([^)]+\),\s*var\(--bg\)'
    ),
     'background:radial-gradient(1100px 560px at 8% -8%,rgba(37,99,235,.10),transparent 55%),'
     'radial-gradient(900px 480px at 92% 0%,rgba(220,38,38,.06),transparent 50%),'
     'radial-gradient(700px 380px at 50% 100%,rgba(37,99,235,.05),transparent 45%),var(--bg)'),
    # nav dark glass
    (re.compile(r'background:rgba\(11,15,26,\.?8[25]?\)'), 'background:rgba(255,255,255,.88)'),
    (re.compile(r'background:rgba\(11,15,26,\.?86\)'), 'background:rgba(255,255,255,.88)'),
    # pill active white text on dark -> white on blue
    (re.compile(
        r'\.nav a\.pill:hover,\.nav a\.pill\.active\{\s*color:#fff;\s*border-color:var\(--[a-z]+\);\s*background:rgba\([^)]+\)\s*\}'
    ),
     '.nav a.pill:hover,.nav a.pill.active{color:#fff;border-color:var(--blue);background:var(--blue)}'),
    # card dark gradient
    (re.compile(
        r'background:linear-gradient\(180deg,\s*rgba\(28,37,64,\.?95?\),\s*rgba\(22,29,50,\.?95?\)\)'
    ), 'background:var(--card)'),
    # hero title dark-to-light gradient
    (re.compile(
        r'background:linear-gradient\(120deg,#[0-9a-fA-F]{3,6}[^;]+;'
    ),
     'background:linear-gradient(120deg,#0f172a 10%, #2563eb 55%, #dc2626);'),
    # stage dark
    (re.compile(r'\.stage\{\s*background:rgba\(0,0,0,\.?22\)'), '.stage{\n  background:rgba(37,99,235,.04)'),
    # formula dark
    (re.compile(r'background:rgba\(0,0,0,\.?2[45]?\)'), 'background:rgba(37,99,235,.05)'),
    (re.compile(r'background:rgba\(0,0,0,\.?3\)'), 'background:#f1f5fb'),
    # kbd dark
    (re.compile(r'background:rgba\(255,255,255,\.?06\)'), 'background:#eef3fb'),
    (re.compile(r'color:#cde0ff'), 'color:#1d4ed8'),
    (re.compile(r'color:#d4c8ff'), 'color:#1d4ed8'),
    (re.compile(r'color:#ffd2b0'), 'color:#b91c1c'),
    (re.compile(r'color:#b8f0ff'), 'color:#1d4ed8'),
    # flip back dark
    (re.compile(r'background:linear-gradient\(160deg,var\(--card2\),#10182c\)'),
     'background:linear-gradient(160deg,#f8fafc,#eef3fb)'),
    # formula green text ok on light
    (re.compile(r'color:#c8f7e0'), 'color:#0f766e'),
    # primary buttons with purple -> blue-red
    (re.compile(
        r'\.btn\.primary\{background:linear-gradient\(135deg,var\(--[a-z]+\),var\(--[a-z]+\)\);\s*border:none;\s*color:#[0-9a-fA-F]+\}'
    ),
     '.btn.primary{background:linear-gradient(135deg,var(--blue),#1d4ed8);border:none;color:#fff}'),
    (re.compile(
        r'\.btn\.primary\{background:linear-gradient\(135deg,var\(--orange\),#e34948\);border:none;color:#fff\}'
    ),
     '.btn.primary{background:linear-gradient(135deg,var(--blue),var(--red));border:none;color:#fff}'),
    (re.compile(
        r'\.btn\.primary\{background:linear-gradient\(135deg,var\(--cyan\),var\(--blue\)\);border:none;color:#062\}'
    ),
     '.btn.primary{background:linear-gradient(135deg,var(--blue),var(--red));border:none;color:#fff}'),
    # canvas / js dark fills
    (re.compile(r"#0a0e18"), "#f8fafc"),
    (re.compile(r"#12182a"), "#eef3fb"),
    (re.compile(r"#0b0f1a"), "#f4f7fc"),
    # stack item white text was on blue - fine
    # board squares dark chess
    (re.compile(r'\.sq\.light\{background:#3a3428\}'), '.sq.light{background:#e8eef8}'),
    (re.compile(r'\.sq\.dark\{background:#2a241c\}'), '.sq.dark{background:#d4e0f0}'),
    # cell hit green text #062 is fine
    # stat b white -> dark
    (re.compile(r'\.stat b\{display:block;[^}]*color:#fff'),
     '.stat b{display:block;font-size:1.2rem;color:var(--text)'),
    (re.compile(r'\.stat b\{display:block; font-size:1\.4rem; color:#fff; margin-top:4px\}'),
     '.stat b{display:block; font-size:1.4rem; color:var(--text); margin-top:4px}'),
    (re.compile(r'\.stat b\{display:block;font-size:1\.3rem;color:#fff;margin-top:3px\}'),
     '.stat b{display:block;font-size:1.3rem;color:var(--text);margin-top:3px}'),
    # code blocks
    (re.compile(r'\.code\{[^}]*background:rgba\(0,0,0,\.?3\)'),
     None),  # already handled by general rgba replace
]

# More JS-specific string replacements (after CSS)
JS_REPLACES = [
    ("fillStyle='#e8ecf8'", "fillStyle='#0f172a'"),
    ('fillStyle="#e8ecf8"', 'fillStyle="#0f172a"'),
    ("fillStyle='#fff'", "fillStyle='#fff'"),  # keep white on colored nodes
    ("'#2a3555'", "'#c5d4e8'"),
    ('"#2a3555"', '"#c5d4e8"'),
    ("'#8b95b0'", "'#5b6b82'"),
    ("#c3c2b7", "#94a3b8"),
    # dark card-like inline styles in JS templates
    ("background:rgba(0,0,0,.2)", "background:rgba(37,99,235,.04)"),
    ("background:rgba(0,0,0,.25)", "background:rgba(37,99,235,.04)"),
    ("color:#fff", "color:var(--text)"),  # careful - may break white on blue buttons
]


def replace_root(css_or_html: str) -> str:
    # Match any :root{ ... } block at start of style
    return re.sub(
        r':root\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
        LIGHT_ROOT_COMPACT,
        css_or_html,
        count=1,
        flags=re.S,
    )


def fix_stat_b(html: str) -> str:
    # Ensure stat numbers are dark
    html = re.sub(
        r'(\.stat b\{[^}]*?)color:#fff',
        r'\1color:var(--text)',
        html,
    )
    return html


def fix_primary_buttons(html: str) -> str:
    html = re.sub(
        r'\.btn\.primary\{[^}]+\}',
        '.btn.primary{background:linear-gradient(135deg,var(--blue),#1e40af);border:none;color:#fff}',
        html,
    )
    return html


def fix_pill_active(html: str) -> str:
    html = re.sub(
        r'\.nav a\.pill:hover,\s*\.nav a\.pill\.active\{[^}]+\}',
        '.nav a.pill:hover,.nav a.pill.active{color:#fff;border-color:var(--blue);background:var(--blue)}',
        html,
    )
    return html


def fix_hero_h1(html: str) -> str:
    html = re.sub(
        r'\.hero h1\{[^}]*background:linear-gradient\([^)]+\);[^}]*-webkit-background-clip:text;[^}]*background-clip:text;[^}]*color:transparent;?\}',
        '.hero h1{font-size:clamp(1.45rem,2.8vw,2.3rem);line-height:1.2;margin-bottom:10px;'
        'background:linear-gradient(120deg,#0f172a 5%,#2563eb 50%,#dc2626);'
        '-webkit-background-clip:text;background-clip:text;color:transparent}',
        html,
        flags=re.S,
    )
    # simpler fallback if pattern didn't match multi-line
    html = re.sub(
        r'background:linear-gradient\(120deg,#[^\)]+\);\s*-webkit-background-clip:text;\s*background-clip:text;\s*color:transparent',
        'background:linear-gradient(120deg,#0f172a 5%,#2563eb 50%,#dc2626);'
        '-webkit-background-clip:text;background-clip:text;color:transparent',
        html,
    )
    return html


def fix_canvas_text(html: str) -> str:
    # Chart labels that were light gray on dark -> dark gray on light
    # Don't change white text on colored nodes (fill + white fillText after fillStyle blue)
    return html


def process_html(text: str) -> str:
    text = replace_root(text)
    for pat, repl in REPLACEMENTS:
        if repl is None:
            continue
        text = pat.sub(repl, text)
    text = fix_stat_b(text)
    text = fix_primary_buttons(text)
    text = fix_pill_active(text)
    text = fix_hero_h1(text)

    # JS canvas backgrounds already replaced #0a0e18
    # Fix remaining dark stroke/grid for readability on light canvas
    text = text.replace("'#2a3555'", "'#c5d4e8'")
    text = text.replace('"#2a3555"', '"#c5d4e8"')
    text = text.replace("strokeStyle='#c3c2b7'", "strokeStyle='#94a3b8'")
    text = text.replace('strokeStyle="#c3c2b7"', 'strokeStyle="#94a3b8"')

    # Label text on canvas that was light colored
    text = text.replace("fillStyle='#e8ecf8'", "fillStyle='#0f172a'")
    text = text.replace('fillStyle="#e8ecf8"', 'fillStyle="#0f172a"')
    text = text.replace("fillStyle='#8b95b0'", "fillStyle='#5b6b82'")
    text = text.replace('fillStyle="#8b95b0"', 'fillStyle="#5b6b82"')

    # Inline template dark panels
    text = text.replace('background:rgba(0,0,0,.2)', 'background:rgba(37,99,235,.04)')
    text = text.replace('background:rgba(0,0,0,.25)', 'background:rgba(37,99,235,.04)')
    text = text.replace('background:rgba(0,0,0,.3)', 'background:#f1f5fb')

    # Board/chess dark
    text = text.replace('background:#3a3428', 'background:#e8eef8')
    text = text.replace('background:#2a241c', 'background:#d4e0f0')

    # Nav brand accents stay blue/red per chapter via CSS vars -- already remapped

    # Fix accidental color:var(--text) on primary button text if any double-applied
    # Restore white text inside elements that need it on blue/red fills
    # .cell.hit color #062 is ok; .stack-item.top white ok

    # kbd leftover light colors
    text = text.replace('color:#cde0ff', 'color:#1d4ed8')
    text = text.replace('color:#d4c8ff', 'color:#1d4ed8')
    text = text.replace('color:#ffd2b0', 'color:#b91c1c')
    text = text.replace('color:#b8f0ff', 'color:#1d4ed8')

    # Extra CSS safety: card hover border
    text = text.replace(
        'border-color:rgba(76,141,255,.45)',
        'border-color:rgba(37,99,235,.45)',
    )
    text = text.replace(
        'border-color:rgba(155,123,255,.4)',
        'border-color:rgba(37,99,235,.4)',
    )
    text = text.replace(
        'border-color:rgba(255,138,76,.4)',
        'border-color:rgba(220,38,38,.4)',
    )
    text = text.replace(
        'border-color:rgba(56,217,245,.4)',
        'border-color:rgba(37,99,235,.4)',
    )

    # tip / badge already use CSS vars so ok

    # Ensure body color is dark
    # Add a small override block before </style> if not present
    override = """
/* light theme overrides */
body{color:var(--text)}
.card{background:#fff;box-shadow:var(--shadow)}
.nav{background:rgba(255,255,255,.9);border-bottom:1px solid var(--line)}
.formula{color:#0f766e}
.kbd{color:#1d4ed8;background:#eef3fb}
.stat b{color:var(--text)!important}
.flip-back{background:linear-gradient(160deg,#fff,#eef3fb)!important}
.btn.primary{color:#fff!important}
.nav a.pill.active,.nav a.pill:hover{color:#fff!important;background:var(--blue)!important;border-color:var(--blue)!important}
.cell.hit{color:#fff}
.stack-item.top{color:#fff}
.tree-node.root{color:#fff}
"""
    if '/* light theme overrides */' not in text:
        text = text.replace('</style>', override + '</style>')

    return text


def main():
    files = list(ROOT.glob('**/interactive/*.html'))
    n = 0
    for f in files:
        raw = f.read_text(encoding='utf-8')
        new = process_html(raw)
        if new != raw:
            f.write_text(new, encoding='utf-8')
            n += 1
            print('updated', f.relative_to(ROOT))
        else:
            print('unchanged', f.relative_to(ROOT))
    print(f'done: {n}/{len(files)} files updated')


if __name__ == '__main__':
    main()
