#!/usr/bin/env python3
"""按统一目录（catalog.py）批量规范全站页面，并生成 shared/catalog.js。

    python3 tools/dm/apply_catalog.py            # 应用修改
    python3 tools/dm/apply_catalog.py --check    # 只检查是否已规范（CI 用，有差异则退出码 1）

做的事（均可重复运行，结果幂等）：
  1. 统一 <head> 元数据：<title> / description / canonical / Open Graph / Twitter Card / favicon / theme-color；
  2. 统一 window.SECTION_META 的 chapter / section / title / uid / case / radar 字段；
  3. 为共享资源（discrete-ui.css / mathjax-auto.js / ai-tutor.js / site-shell.js）补全引用并统一版本号；
  4. 生成 shared/catalog.js（运行时导航使用）；
  5. 重新生成主页的课程目录区块。
"""
import os, re, sys, json, subprocess, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
import catalog as C

VERSION = '2026.09'          # 共享资源版本号：修改共享 css/js 后递增
SITE = C.SITE_DIR
TIER = ['基础层', '进阶层', '拓展层']
HERE = os.path.dirname(os.path.abspath(__file__))

def read(p):
    with open(os.path.join(SITE, p), encoding='utf-8') as f: return f.read()
def write(p, s):
    with open(os.path.join(SITE, p), 'w', encoding='utf-8', newline='\n') as f: f.write(s)

# ---------------------------------------------------------------- 三阶层信息
def tier_info():
    """{unit_index: [ {name, concepts, task} x3 ]}"""
    out_js = os.path.join(HERE, '.meta_cache.json')
    subprocess.run(['node', os.path.join(HERE, 'extract_meta.js'), SITE, out_js], check=True, stdout=subprocess.DEVNULL)
    metas = json.load(open(out_js, encoding='utf-8'))
    os.remove(out_js)
    info = {}
    for ui, u in enumerate(C.UNITS):
        layers = metas.get(u['path'], {}).get('meta', {}).get('layers')
        if layers and len(layers) == 3:
            info[ui] = [dict(name=l.get('name', ''), concepts=l.get('concepts', ''), task=l.get('task', '')) for l in layers]
        else:
            info[ui] = unified_layers(u)
    return info, metas

def unified_layers(u):
    """9.3 / 9.6 / 8.11 使用自带渲染脚本，层信息从脚本中取。"""
    d = os.path.dirname(u['path'])
    js = next(f for f in os.listdir(os.path.join(SITE, d)) if f.endswith('unified.js'))
    src = read(os.path.join(d, js))
    if 'LAYERS = {' in src:
        blk = src[src.index('LAYERS = {'):]
        blk = blk[:blk.index('const CASES')]
        titles = re.findall(r'\btitle:\s*"([^"]+)"', blk)
        concepts = re.findall(r'\bconcept:\s*"([^"]+)"', blk)
        tasks = re.findall(r'\btask:\s*"([^"]+)"', blk)
    else:  # hunan-mst CONFIG
        blk = src[src.index('const CONFIG = {'):]
        blk = blk[:blk.index('graphTitle', blk.index('extend:'))]
        titles = re.findall(r'\btitle:\s*"([^"]+)"', blk)
        concepts = [s.split(' / 低门槛')[0].split(' / 核心掌握')[0].split(' / 高天花板')[0] for s in re.findall(r'\bsubtitle:\s*"([^"]+)"', blk)]
        tasks = re.findall(r'\bmission:\s*"([^"]+)"', blk)
    assert len(titles) == len(concepts) == len(tasks) == 3, (u['path'], titles, concepts, tasks)
    return [dict(name=a, concepts=b, task=c) for a, b, c in zip(titles, concepts, tasks)]

# ---------------------------------------------------------------- 运行时目录
def unit_ids():
    ids, seen = [], {}
    for u in C.UNITS:
        seen.setdefault(u['num'], []).append(u)
    for u in C.UNITS:
        grp = seen[u['num']]
        ids.append(u['num'] if len(grp) == 1 else u['num'] + 'abcdefgh'[grp.index(u)])
    return ids

def build_catalog_js(info):
    ids = unit_ids()
    data = dict(
        version=VERSION, base=C.BASE_URL, site=C.SITE_NAME,
        chapters=[dict(n=c[0], name=c[1], cat=c[2], domain=c[4]) for c in C.CHAPTERS],
        units=[dict(id=ids[i], ch=u['ch'], num=u['num'], name=u['name'], part=u['part'], case=u['case'],
                    pages=list(C.tier_paths(u)),
                    tiers=[dict(name=t['name'], concepts=t['concepts']) for t in info[i]])
               for i, u in enumerate(C.UNITS)])
    body = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    return ('/* 由 tools/dm/apply_catalog.py 自动生成，请勿手工修改。数据源：tools/dm/catalog.py */\n'
            'window.DM_CATALOG = ' + body + ';\n')

# ---------------------------------------------------------------- 页面 <head>
def esc(s): return s.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
def enc_path(rel): return '/'.join(urllib.parse.quote(seg) for seg in rel.split('/'))

def page_desc(u, ti, layer):
    txt = '%s · %s · %s' % (C.chapter_label(u['ch']), C.section_label(u), TIER[ti]) + '：' + layer['name'] + (('（%s）' % layer['concepts']) if layer['concepts'] else '')
    if layer['task']:
        txt += '。' + layer['task'].rstrip('。')
    return txt + '。' + ('案例互动页面，' if u['case'] else '互动可视化页面，') + C.ORG + '离散数学课程思政资源。'

def head_block(rel, u, ti, layer, depth):
    up = '../' * depth
    t = '%s · %s：%s | %s' % (C.section_label(u), TIER[ti], layer['name'], C.SITE_NAME)
    d = page_desc(u, ti, layer)
    url = C.BASE_URL + enc_path(rel)
    img = C.BASE_URL + 'shared/og-cover.png'
    lines = [
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<title>%s</title>' % esc(t),
        '<meta name="description" content="%s">' % esc(d),
        '<meta name="theme-color" content="#D63B1D">',
        '<link rel="canonical" href="%s">' % url,
        '<link rel="icon" type="image/svg+xml" href="%sshared/favicon.svg">' % up,
        '<!-- Open Graph / 社交分享（微信、钉钉、Telegram 等）。部署域名变更时改 tools/dm/catalog.py 的 BASE_URL 后重新运行 apply_catalog.py -->',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="%s · %s">' % (C.SITE_NAME, C.ORG),
        '<meta property="og:locale" content="zh_CN">',
        '<meta property="og:title" content="%s">' % esc(t),
        '<meta property="og:description" content="%s">' % esc(d),
        '<meta property="og:url" content="%s">' % url,
        '<meta property="og:image" content="%s">' % img,
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta property="og:image:alt" content="%s · %s">' % (C.SITE_NAME, C.ORG),
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="%s">' % esc(t),
        '<meta name="twitter:description" content="%s">' % esc(d),
        '<meta name="twitter:image" content="%s">' % img,
    ]
    return lines

HEAD_STRIP = [
    r'<title>.*?</title>',
    r'<meta\s+name="description"[^>]*>',
    r'<meta\s+name="viewport"[^>]*>',
    r'<meta\s+name="theme-color"[^>]*>',
    r'<meta\s+(?:property|name)="(?:og|twitter):[^"]*"[^>]*>',
    r'<link\s+rel="(?:icon|canonical|shortcut icon)"[^>]*>',
    r'<!--\s*Open Graph[^>]*?-->',
]

def rewrite_head(html, rel, u, ti, layer):
    m = re.search(r'<head[^>]*>(.*?)</head>', html, re.S)
    assert m, rel
    head = m.group(1)
    for pat in HEAD_STRIP:
        head = re.sub(r'[ \t]*' + pat + r'[ \t]*\n?', '', head, flags=re.S)
    depth = rel.count('/')
    cm = re.search(r'([ \t]*)<meta\s+charset="[^"]*">[ \t]*\n?', head)
    indent = cm.group(1) if cm else '    '
    block = ''.join(indent + l + '\n' for l in head_block(rel, u, ti, layer, depth))
    if cm:
        head = head[:cm.end()] + block + head[cm.end():]
    else:
        head = '\n' + indent + '<meta charset="UTF-8">\n' + block + head
    head = re.sub(r'\n{3,}', '\n\n', head)
    return html[:m.start(1)] + head + html[m.end(1):]

# ---------------------------------------------------------------- 共享资源引用
def ensure_shared(html, rel, add_tutor):
    up = '../' * rel.count('/')
    v = '?v=' + VERSION
    def bump(name, html):
        # 已有引用：统一路径版本号
        pat = r'((?:href|src)=")([^"]*shared/%s)(?:\?[^"]*)?(")' % re.escape(name)
        return re.sub(pat, lambda m: m.group(1) + m.group(2) + v + m.group(3), html)
    for n in ['discrete-ui.css', 'mathjax-auto.js', 'ai-tutor.js', 'site-shell.js']:
        html = bump(n, html)
    ind = '    ' if re.search(r'^    <', html, re.M) else '  '
    if 'shared/discrete-ui.css' not in html:
        html = html.replace('</head>', ind + '<link rel="stylesheet" href="%sshared/discrete-ui.css%s" data-dm-ui="1">\n</head>' % (up, v), 1)
    if 'shared/mathjax-auto.js' not in html:
        html = html.replace('</head>', ind + '<script src="%sshared/mathjax-auto.js%s" data-dm-mathjax="1"></script>\n</head>' % (up, v), 1)
    if add_tutor and 'shared/ai-tutor.js' not in html:
        html = html.replace('</body>', ind + '<script src="%sshared/ai-tutor.js%s" defer></script>\n</body>' % (up, v), 1)
    if 'shared/site-shell.js' not in html:
        m = re.search(r'([ \t]*)<script[^>]*shared/ai-tutor\.js[^>]*></script>[ \t]*\n', html)
        tag = (m.group(1) if m else ind) + '<script src="%sshared/site-shell.js%s" defer></script>\n' % (up, v)
        if m: html = html[:m.end()] + tag + html[m.end():]
        else: html = html.replace('</body>', tag + '</body>', 1)
    # 去掉重复的样式表引用（如 4.13 引了两次同一个 css）
    seen, out = set(), []
    for line in html.split('\n'):
        mm = re.match(r'\s*<link rel="stylesheet" href="([^"]+)"[^>]*>\s*$', line)
        if mm:
            if mm.group(1) in seen: continue
            seen.add(mm.group(1))
        out.append(line)
    return '\n'.join(out)

# ---------------------------------------------------------------- SECTION_META
TIER_SUFFIX = re.compile(r'\s*[·｜|]\s*(基础层|进阶层|拓展层)\s*')
def strip_tier(s): return re.sub(r'\s{2,}', ' ', TIER_SUFFIX.sub(' ', s or '')).strip()

def wanted_meta(meta, u, uid):
    """该页 SECTION_META 中需要写成的字段（只列出与规范值有关的键）。"""
    want = {}
    old_section = strip_tier(meta.get('section', ''))
    old_title = strip_tier(meta.get('title', ''))
    want['chapter'] = C.chapter_label(u['ch'])
    want['section'] = C.section_label(u)
    want['uid'] = uid
    dom = C.CH[u['ch']]['domain'] + '应用 · '
    if u['case']:
        short = u['name'][:-2] if u['name'].endswith('案例') else u['name']
        want['title'] = old_title if '应用 · ' in old_title else dom + short
        want['radar'] = True
        want['case'] = True
    else:
        want['title'] = old_title
    # 旧小节标签与新标签不同时，保留旧标签供学习进度（localStorage）迁移
    legacy = meta.get('legacySection') or (old_section if old_section != want['section'] else '')
    if legacy and legacy != want['section']:
        want['legacySection'] = legacy
    return want

def scan_object(lit):
    """扫描 JS 对象字面量的顶层属性，返回 [(key, key_start, val_start, val_end, quoted)]（偏移相对 lit）。"""
    props, i, n = [], 1, len(lit)
    def skip_ws(i):
        while i < n:
            if lit[i].isspace(): i += 1
            elif lit.startswith('//', i): i = lit.index('\n', i)
            elif lit.startswith('/*', i): i = lit.index('*/', i) + 2
            else: break
        return i
    while i < n:
        i = skip_ws(i)
        if lit[i] == '}': break
        if lit[i] == ',': i += 1; continue
        ks = i
        if lit[i] in '"\'':
            q = lit[i]; j = i + 1
            while lit[j] != q:
                j += 2 if lit[j] == '\\' else 1
            key, i, quoted = lit[i + 1:j], j + 1, True
        else:
            j = i
            while j < n and (lit[j].isalnum() or lit[j] in '_$'): j += 1
            key, i, quoted = lit[i:j], j, False
        i = skip_ws(i); assert lit[i] == ':', lit[i - 20:i + 20]
        i = skip_ws(i + 1); vs = i
        depth, q = 0, None
        while i < n:
            c = lit[i]
            if q:
                if c == '\\': i += 1
                elif c == q: q = None
            elif c in '"\'`': q = c
            elif lit.startswith('//', i): i = lit.index('\n', i); continue
            elif lit.startswith('/*', i): i = lit.index('*/', i) + 1
            elif c in '{[(': depth += 1
            elif c in '}])':
                if depth == 0: break
                depth -= 1
            elif c == ',' and depth == 0: break
            i += 1
        ve = i
        while lit[ve - 1].isspace(): ve -= 1
        props.append((key, ks, vs, ve, quoted))
    return props

def find_literal(html):
    key = html.index('window.SECTION_META')
    j = html.index('{', key)
    depth, q, k = 0, None, j
    while k < len(html):
        c = html[k]
        if q:
            if c == '\\': k += 1
            elif c == q: q = None
        elif c in '"\'`': q = c
        elif html.startswith('//', k): k = html.index('\n', k); continue
        elif html.startswith('/*', k): k = html.index('*/', k) + 1
        elif c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: k += 1; break
        k += 1
    return j, k

def rewrite_meta(html, u, uid):
    """只改动需要变化的顶层键，尽量保持原有排版，使 diff 最小。"""
    if 'window.SECTION_META' not in html: return html
    j, k = find_literal(html)
    lit = html[j:k]
    import subprocess
    cur = json.loads(subprocess.run(['node', '-e', 'process.stdout.write(JSON.stringify(eval("(" + require("fs").readFileSync(0, "utf8") + ")")))'],
                                    input=lit, capture_output=True, text=True, check=True).stdout)
    want = wanted_meta(cur, u, uid)
    props = scan_object(lit)
    by = {p[0]: p for p in props}
    edits = []                       # (start, end, text)
    quoted = props[0][4] if props else True
    first_line = lit.rfind('\n', 0, props[0][1]) + 1
    indent = re.match(r'[ \t]*', lit[first_line:props[0][1]]).group(0)
    adds = []
    for key, val in want.items():
        if key in by:
            if cur.get(key) != val:
                edits.append((by[key][2], by[key][3], json.dumps(val, ensure_ascii=False)))
        else:
            adds.append('%s: %s' % (('"%s"' % key) if quoted else key, json.dumps(val, ensure_ascii=False)))
    if adds:
        last = props[-1][3]
        edits.append((last, last, ''.join(',\n' + indent + a for a in adds)))
    for st, en, tx in sorted(edits, reverse=True):
        lit = lit[:st] + tx + lit[en:]
    return html[:j] + lit + html[k:]

# ---------------------------------------------------------------- 主流程
def process_pages(info, metas, check):
    changed = []
    ids = unit_ids()
    for ui, u in enumerate(C.UNITS):
        for ti, rel in enumerate(C.tier_paths(u)):
            src = read(rel)
            html = src
            has_meta = 'window.SECTION_META' in html
            html = rewrite_meta(html, u, ids[ui]) if has_meta else html
            html = rewrite_head(html, rel, u, ti, info[ui][ti])
            has_tutor = 'shared/ai-tutor.js' in html
            html = ensure_shared(html, rel, add_tutor=has_tutor)
            if html != src:
                changed.append(rel)
                if not check: write(rel, html)
    return changed

def main():
    check = '--check' in sys.argv
    info, metas = tier_info()
    changed = process_pages(info, metas, check)
    cat = build_catalog_js(info)
    cp = os.path.join('shared', 'catalog.js')
    old = read(cp) if os.path.exists(os.path.join(SITE, cp)) else ''
    if cat != old:
        changed.append(cp)
        if not check: write(cp, cat)
    try:
        import build_home
        if build_home.apply(info, unit_ids(), check): changed.append('index.html')
    except ImportError:
        pass
    print('%s %d 个文件' % ('需要更新' if check else '已更新', len(changed)))
    if check and changed: sys.exit(1)

if __name__ == '__main__':
    main()
