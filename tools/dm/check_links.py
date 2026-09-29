#!/usr/bin/env python3
"""静态检查：所有 HTML 的本地 href/src、SECTION_META 中的层页面引用、目录登记是否都指向真实存在的文件。
    python3 tools/dm/check_links.py      # 有问题时退出码为 1
"""
import os, re, sys, urllib.parse, posixpath, json
sys.path.insert(0, os.path.dirname(__file__))
import catalog as C

SITE = C.SITE_DIR
bad = []
def exists(rel): return os.path.exists(os.path.join(SITE, rel))

pages = [os.path.relpath(os.path.join(d, f), SITE) for d, _, fs in os.walk(SITE) for f in fs if f.endswith('.html')]
for rel in sorted(pages):
    src = open(os.path.join(SITE, rel), encoding='utf-8').read()
    base = posixpath.dirname(rel)
    for m in re.finditer(r'''(?:href|src)=["']([^"'#][^"']*)["']''', src):
        u = m.group(1)
        if re.match(r'^(https?:|data:|mailto:|javascript:|//|\$\{)', u) or '${' in u: continue
        p = urllib.parse.unquote(u.split('#')[0].split('?')[0])
        if not p: continue
        target = posixpath.normpath(posixpath.join(base, p))
        if target.endswith('/'): target += 'index.html'
        if not exists(target): bad.append((rel, u))
    # SECTION_META.layers[].page / 各脚本内的 page: "xxx.html"
    for m in re.finditer(r'''["']?page["']?\s*:\s*["']([^"']+\.html)["']''', src):
        target = posixpath.normpath(posixpath.join(base, m.group(1)))
        if not exists(target): bad.append((rel, 'page:' + m.group(1)))

for p, u, i in C.all_pages():
    if not exists(p): bad.append(('catalog', p))
known = {p for p, _, _ in C.all_pages()} | {'index.html'}
for rel in pages:
    if rel not in known: bad.append(('未登记到 catalog.py', rel))

for b in bad: print('✗', *b)
print('检查 %d 个页面，%d 处问题' % (len(pages), len(bad)))
sys.exit(1 if bad else 0)
