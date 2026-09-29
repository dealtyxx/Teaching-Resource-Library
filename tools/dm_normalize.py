#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
dm_normalize.py —— 离散数学课程资源库 · 全站机械归一化（幂等，可重复运行）

依据 Discrete_Mathematics/shared/STYLE-GUIDE.md，对 Discrete_Mathematics/ 下除主页
index.html 外的全部 .html 做「只动外壳、不动互动核心」的机械修正：

  1. 由 SECTION_META（按 layers[i].page 找到本页所在层）生成 <title>、meta description、
     og:title / og:description / og:url、twitter:title / twitter:description；
     缺失时补齐整套 Open Graph / Twitter 标签与全站内联 SVG favicon。
  2. 返回主页链接统一为 <a class="home-link" href="../../index.html#chapterN">← 返回课程主页</a>，
     每页一个、放在 <body> 开头（替换 title="返回课程主页" 内联样式版、「首页」「⌂ 课程主页」等变体）。
  3. 版权页脚统一为 footer.site-footer 两行规范文案，每页恰好一个；把 <footer> 当内容面板用的
     （如 .insight-footer）不动，另补标准页脚。
  4. Google Fonts 统一为同一 URL 的非阻塞片段（preconnect×2 + preload + media=print/onload + noscript），
     删除零散的 fonts.googleapis / fonts.gstatic 链接与重复 preconnect；
     删除页面直连 jsdelivr 的 MathJax <script> 与 preconnect（统一由 shared/mathjax-auto.js 加载本地副本）。
  5. SECTION_META.chapter 统一为规范章名；section 去掉「· 基础层/进阶层/拓展层」后缀、修正多余空格
     （只替换这两个字段的值，保留原有格式）。

用法：
  python3 tools/dm_normalize.py                      # 处理全站并写回
  python3 tools/dm_normalize.py --check              # 只报告需要修改的页面，不写回（有待改项时退出码 1）
  python3 tools/dm_normalize.py --prefix 5命题逻辑    # 只处理某章 / 某单元（相对仓库根或 Discrete_Mathematics/ 均可）
  python3 tools/dm_normalize.py --json report.json   # 额外输出 JSON 报告

依赖：Python 3.8+，Node.js（用 vm 安全求值 SECTION_META 对象字面量）。
"""
import argparse
import html
import json
import os
import re
import signal
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote

REPO = Path(__file__).resolve().parent.parent
ROOT = REPO / 'Discrete_Mathematics'
SITE_BASE = 'https://dealtyxx.github.io/Teaching-Resource-Library/Discrete_Mathematics/'
SITE_NAME = '离散数学课程资源库'
OG_IMAGE = SITE_BASE + 'shared/og-cover.png'

CHAPTERS = {
    1: '第1章 计数基础与数论基础',
    2: '第2章 集合及其运算',
    3: '第3章 二元关系',
    4: '第4章 特殊关系',
    5: '第5章 命题逻辑',
    6: '第6章 谓词逻辑',
    7: '第7章 图论基础',
    8: '第8章 特殊图',
    9: '第9章 代数系统',
    10: '第10章 群论基础',
    11: '第11章 环、域、格和布尔代数',
}
TIERS = ['基础层', '进阶层', '拓展层']

FONT_URL = ('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng'
            '&family=Noto+Serif+SC:wght@400;600;700;900'
            '&family=JetBrains+Mono:wght@400;700&display=swap')
FONT_LINES = [
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link rel="preload" as="style" href="%s">' % FONT_URL,
    '<link rel="stylesheet" href="%s" media="print" onload="this.media=\'all\'">' % FONT_URL,
    '<noscript><link rel="stylesheet" href="%s"></noscript>' % FONT_URL,
]

FAVICON = ('<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns=\'http://www.w3.org/2000/svg\''
           '%20viewBox=\'0%200%2032%2032\'%3E%3Crect%20width=\'32\'%20height=\'32\'%20rx=\'7\'%20fill=\'%23D63B1D\'/%3E'
           '%3Cg%20stroke=\'%23FFE7B3\'%20stroke-width=\'1.6\'%20stroke-linecap=\'round\'%3E%3Cline%20x1=\'9\'%20y1=\'11\''
           '%20x2=\'22\'%20y2=\'9\'/%3E%3Cline%20x1=\'9\'%20y1=\'11\'%20x2=\'12\'%20y2=\'23\'/%3E%3Cline%20x1=\'22\'%20y1=\'9\''
           '%20x2=\'23\'%20y2=\'22\'/%3E%3Cline%20x1=\'12\'%20y1=\'23\'%20x2=\'23\'%20y2=\'22\'/%3E%3C/g%3E%3Cg%20fill=\'%23FFB400\''
           '%3E%3Ccircle%20cx=\'9\'%20cy=\'11\'%20r=\'3\'/%3E%3Ccircle%20cx=\'22\'%20cy=\'9\'%20r=\'3\'/%3E%3Ccircle%20cx=\'12\''
           '%20cy=\'23\'%20r=\'3\'/%3E%3Ccircle%20cx=\'23\'%20cy=\'22\'%20r=\'3\'/%3E%3C/g%3E%3C/svg%3E">')

FOOTER_L1 = '© 2025-2026 湖南信息学院 · 计算机科学与工程课程资源库建设团队'
FOOTER_L2 = '版权所有 · 项目总负责人：谢鑫'
HOME_TEXT = '← 返回课程主页'


def footer_html(indent):
    return (indent + '<footer class="site-footer">\n'
            + indent + '    <p>' + FOOTER_L1 + '</p>\n'
            + indent + '    <p>' + FOOTER_L2 + '</p>\n'
            + indent + '</footer>')


# ---------------------------------------------------------------------------
# SECTION_META 读取（括号匹配 + node vm 求值）
# ---------------------------------------------------------------------------
META_START_RE = re.compile(r'SECTION_META\s*=\s*\{')


def scan_js_object(s, i):
    """s[i] == '{'；返回与之匹配的 '}' 下标（跳过字符串、模板串、注释）。另返回每个位置的深度表。"""
    depth = 0
    j = i
    n = len(s)
    q = None
    while j < n:
        c = s[j]
        if q:
            if c == '\\':
                j += 2
                continue
            if c == q:
                q = None
            j += 1
            continue
        if c in '"\'`':
            q = c
        elif c == '/' and j + 1 < n and s[j + 1] == '/':
            k = s.find('\n', j)
            j = n if k < 0 else k
            continue
        elif c == '/' and j + 1 < n and s[j + 1] == '*':
            k = s.find('*/', j + 2)
            j = n if k < 0 else k + 2
            continue
        elif c in '{[':
            depth += 1
        elif c in '}]':
            depth -= 1
            if depth == 0:
                return j
        j += 1
    return -1


def find_meta_span(text):
    m = META_START_RE.search(text)
    if not m:
        return None
    start = m.end() - 1
    end = scan_js_object(text, start)
    if end < 0:
        return None
    return start, end + 1


NODE_EVAL = r"""
const vm = require('vm');
let buf = '';
process.stdin.on('data', d => buf += d);
process.stdin.on('end', () => {
  const items = JSON.parse(buf);
  const out = items.map(src => {
    if (src == null) return null;
    try { return vm.runInNewContext('(' + src + ')', {}, { timeout: 1000 }); }
    catch (e) { return { __error: String(e) }; }
  });
  process.stdout.write(JSON.stringify(out));
});
"""


def eval_metas(literals):
    try:
        r = subprocess.run(['node', '-e', NODE_EVAL], input=json.dumps(literals), capture_output=True,
                           text=True, encoding='utf-8', timeout=120)
    except FileNotFoundError:
        sys.exit('需要 Node.js（用于求值 SECTION_META）。请先安装 node。')
    if r.returncode != 0:
        sys.exit('node 求值失败：' + r.stderr[:500])
    return json.loads(r.stdout)


def depth_map(s):
    """对象字面量内每个字符所在的括号深度（字符串/注释内记为 -1）。"""
    d = [0] * len(s)
    depth = 0
    q = None
    j = 0
    n = len(s)
    while j < n:
        c = s[j]
        if q:
            d[j] = -1
            if c == '\\':
                if j + 1 < n:
                    d[j + 1] = -1
                j += 2
                continue
            if c == q:
                q = None
            j += 1
            continue
        if c in '"\'`':
            q = c
            d[j] = -1
        elif c == '/' and j + 1 < n and s[j + 1] == '/':
            k = s.find('\n', j)
            k = n if k < 0 else k
            for t in range(j, k):
                d[t] = -1
            j = k
            continue
        elif c == '/' and j + 1 < n and s[j + 1] == '*':
            k = s.find('*/', j + 2)
            k = n if k < 0 else k + 2
            for t in range(j, k):
                d[t] = -1
            j = k
            continue
        elif c in '{[':
            depth += 1
            d[j] = depth
            j += 1
            continue
        elif c in '}]':
            d[j] = depth
            depth -= 1
            j += 1
            continue
        d[j] = depth
        j += 1
    return d


def replace_top_field(obj_text, key, new_value):
    """把对象字面量顶层 key 的字符串值替换为 new_value（保留原引号风格）。返回新文本或 None。"""
    dm = depth_map(obj_text)
    pat = re.compile(r'(["\']?)' + re.escape(key) + r'\1\s*:\s*(["\'`])')
    for m in pat.finditer(obj_text):
        if dm[m.start()] != 1:
            continue
        # 前一个非空白字符必须是 { 或 ,（保证是键）
        k = m.start() - 1
        while k >= 0 and obj_text[k] in ' \t\r\n':
            k -= 1
        if k >= 0 and obj_text[k] not in '{,':
            continue
        q = m.group(2)
        vs = m.end()
        j = vs
        while j < len(obj_text):
            if obj_text[j] == '\\':
                j += 2
                continue
            if obj_text[j] == q:
                break
            j += 1
        val = new_value.replace('\\', '\\\\').replace(q, '\\' + q)
        if obj_text[vs:j] == val:
            return obj_text
        return obj_text[:vs] + val + obj_text[j:]
    return None


# ---------------------------------------------------------------------------
# 规范值计算
# ---------------------------------------------------------------------------
TIER_SUFFIX_RE = re.compile(r'\s*[·・｜|]\s*(?:基础层|进阶层|拓展层)\s*')


def clean_section(sec):
    s = str(sec or '')
    prev = None
    while prev != s:
        prev = s
        s = TIER_SUFFIX_RE.sub(' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'^(\d+(?:\.\d+)+)\s*', r'\1 ', s)
    return s.strip()


def strip_tier(s):
    return re.sub(r'\s+', ' ', TIER_SUFFIX_RE.sub(' ', str(s or ''))).strip()


def chapter_no(rel):
    m = re.match(r'(\d+)', rel.parts[0])
    return int(m.group(1)) if m else None


def page_layer(meta, fname):
    """返回 (tierIdx, layer or None, name)；算法与 shared/ai-tutor.js specTitleInfo() 一致。"""
    layers = meta.get('layers') if isinstance(meta.get('layers'), list) else None
    if layers is not None and len(layers) != 3:
        layers = None
    idx = -1
    has_pages = False
    if layers:
        for i, L in enumerate(layers):
            pg = str((L or {}).get('page') or '').split('/')[-1]
            if pg:
                has_pages = True
            if pg and pg == fname and idx < 0:
                idx = i
    if idx >= 0:
        tier = idx
    elif re.search(r'-basic\.html$', fname, re.I):
        tier = 0
    elif re.search(r'-extend\.html$', fname, re.I):
        tier = 2
    else:
        tier = 1
    layer = None
    if layers and idx >= 0:
        layer = layers[idx]
    elif layers and not has_pages:
        layer = layers[tier]
    name = str((layer or {}).get('name') or '').strip() or strip_tier(meta.get('title'))
    return tier, layer, name


def end_punct(s):
    s = s.strip()
    if s and s[-1] not in '。！？!?…':
        s += '。'
    return s


def page_url(rel):
    return SITE_BASE + '/'.join(quote(p, safe='') for p in rel.parts)


def attr(s):
    return html.escape(s, quote=True)


# ---------------------------------------------------------------------------
# 各项归一化
# ---------------------------------------------------------------------------
def set_title(text, title):
    new = '<title>' + html.escape(title, quote=False) + '</title>'
    m = re.search(r'<title\b[^>]*>.*?</title>', text, re.S | re.I)
    if m:
        return text[:m.start()] + new + text[m.end():]
    m = re.search(r'<meta\s+name=["\']viewport["\'][^>]*>', text, re.I)
    at = m.end() if m else re.search(r'<head\b[^>]*>', text, re.I).end()
    return text[:at] + '\n    ' + new + text[at:]


def meta_re(kind, key):
    return re.compile(r'<meta\b(?=[^>]*\b' + kind + r'\s*=\s*["\']' + re.escape(key) + r'["\'])[^>]*>', re.I)


def set_meta_content(text, kind, key, value):
    """更新已有 <meta kind=key> 的 content；返回 (text, found)。"""
    rx = meta_re(kind, key)
    m = rx.search(text)
    if not m:
        return text, False
    tag = m.group(0)
    v = attr(value)
    if re.search(r'\bcontent\s*=', tag):
        new = re.sub(r'\bcontent\s*=\s*("[^"]*"|\'[^\']*\')', lambda _: 'content="' + v + '"', tag, count=1)
    else:
        new = tag[:-1].rstrip('/').rstrip() + ' content="' + v + '">'
    return text[:m.start()] + new + text[m.end():], True


def line_indent(text, pos):
    ls = text.rfind('\n', 0, pos) + 1
    m = re.match(r'[ \t]*', text[ls:pos])
    return m.group(0) if m and text[ls:pos].strip() == '' else '    '


def ensure_meta_block(text, values):
    """values: 有序 [(kind, key, content)]。存在则更新，缺失则插在前一个已存在标签之后。"""
    head_m = re.search(r'<head\b[^>]*>', text, re.I)
    last_end = None
    for kind, key, content in values:
        text, found = set_meta_content(text, kind, key, content)
        m = meta_re(kind, key).search(text)
        if found and m:
            last_end = m.end()
            continue
        if last_end is None:
            anchor = (re.search(r'<link\b[^>]*rel=["\']icon["\'][^>]*>', text, re.I)
                      or re.search(r'<meta\s+charset[^>]*>', text, re.I) or head_m)
            last_end = anchor.end()
        ind = line_indent(text, text.rfind('<', 0, last_end))
        tag = '<meta %s="%s" content="%s">' % (kind, key, attr(content))
        text = text[:last_end] + '\n' + ind + tag + text[last_end:]
        last_end = last_end + 1 + len(ind) + len(tag)
    return text


def fix_favicon(text):
    m = re.search(r'<link\b[^>]*rel=["\'](?:shortcut )?icon["\'][^>]*>', text, re.I)
    if m:
        if 'data:image/svg+xml' in m.group(0):
            return text
        return text[:m.start()] + FAVICON + text[m.end():]
    m = re.search(r'<meta\s+charset[^>]*>', text, re.I) or re.search(r'<head\b[^>]*>', text, re.I)
    ind = line_indent(text, m.start())
    return text[:m.end()] + '\n' + ind + FAVICON + text[m.end():]


FONT_NOSCRIPT_RE = re.compile(r'[ \t]*<noscript>\s*<link\b[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*</noscript>[ \t]*\r?\n?', re.I)
FONT_LINK_RE = re.compile(r'[ \t]*<link\b[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>[ \t]*\r?\n?', re.I)
JSD_LINK_RE = re.compile(r'[ \t]*<link\b[^>]*cdn\.jsdelivr\.net[^>]*>[ \t]*\r?\n?', re.I)
JSD_MJ_RE = re.compile(r'[ \t]*<script\b[^>]*src=["\']https?://cdn\.jsdelivr\.net/npm/mathjax[^"\']*["\'][^>]*>\s*</script>[ \t]*\r?\n?', re.I)


FONT_ANY_RE = re.compile(FONT_NOSCRIPT_RE.pattern + '|' + FONT_LINK_RE.pattern, re.I)


def fix_fonts(text):
    hm = re.search(r'</head>', text, re.I)
    if not hm:
        return text
    head, rest = text[:hm.start()], text[hm.start():]
    first = FONT_ANY_RE.search(head)
    if first:
        ind = re.match(r'[ \t]*', first.group(0)).group(0) or '    '
        cnt = [0]

        def rep(m):
            cnt[0] += 1
            return '\x00' if cnt[0] == 1 else ''
        head = FONT_ANY_RE.sub(rep, head)
    else:
        m = re.search(r'^([ \t]*)<link\b[^>]*rel=["\']stylesheet["\']', head, re.I | re.M)
        if m:
            ind = m.group(1) or '    '
            head = head[:m.start()] + '\x00' + head[m.start():]
        else:
            ind = '    '
            head = head.rstrip() + '\n\x00'
    block = ind + ('\n' + ind).join(FONT_LINES) + '\n'
    return head.replace('\x00', block, 1) + rest


def fix_jsdelivr(text, prefix):
    had_mj = bool(JSD_MJ_RE.search(text))
    text = JSD_LINK_RE.sub('', text)
    if had_mj:
        if 'mathjax-auto.js' in text:
            text = JSD_MJ_RE.sub('', text)
        else:
            text = JSD_MJ_RE.sub(lambda m: re.match(r'[ \t]*', m.group(0)).group(0)
                                 + '<script src="%sshared/mathjax-auto.js" data-dm-mathjax="1"></script>\n' % prefix,
                                 text, count=1)
            text = JSD_MJ_RE.sub('', text)
    return text


A_RE = re.compile(r'[ \t]*<a\b([^>]*)>(.*?)</a>[ \t]*\r?\n?', re.S | re.I)
HOME_COMMENT_RE = re.compile(r'[ \t]*<!--\s*返回主页[^>]*?-->[ \t]*\r?\n?')


def is_home_anchor(attrs, inner):
    href = re.search(r'href\s*=\s*["\']([^"\']*)["\']', attrs)
    if not href or not re.fullmatch(r'(?:\.\./)+index\.html(?:#[\w-]*)?', href.group(1).strip()):
        return False
    cls = re.search(r'class\s*=\s*["\']([^"\']*)["\']', attrs)
    cls = cls.group(1) if cls else ''
    if 'dm-cb-ch' in cls.split():
        return False
    txt = re.sub(r'<[^>]+>', '', inner).strip()
    if re.search(r'(?:^|\s)(?:mst-)?home-link(?:\s|$)', cls) or 'title="返回课程主页"' in attrs:
        return True
    return bool(re.search(r'首页|课程主页|返回', txt)) and len(txt) <= 12


def fix_home_link(text, prefix, chap):
    bm = re.search(r'<body\b[^>]*>', text, re.I)
    if not bm:
        return text
    head, body = text[:bm.end()], text[bm.end():]
    body = HOME_COMMENT_RE.sub('', body)
    body = A_RE.sub(lambda m: '' if is_home_anchor(m.group(1), m.group(2)) else m.group(0), body)
    href = '%sindex.html#chapter%s' % (prefix, chap) if chap else '%sindex.html' % prefix
    nx = re.search(r'\n([ \t]*)\S', body)
    ind = nx.group(1) if nx else '    '
    link = '\n%s<a class="home-link" href="%s">%s</a>' % (ind, href, HOME_TEXT)
    if not body.startswith('\n'):
        link += '\n'
    return head + link + body


FOOTER_RE = re.compile(r'[ \t]*<footer\b[^>]*>.*?</footer>[ \t]*\r?\n?', re.S | re.I)


def is_copyright_footer(block):
    return ('©' in block or '版权' in block or '&copy;' in block) and 'insight-footer' not in block[:200]


def fix_footer(text):
    blocks = [m for m in FOOTER_RE.finditer(text) if is_copyright_footer(m.group(0))]
    if blocks:
        out = []
        last = 0
        for i, m in enumerate(blocks):
            out.append(text[last:m.start()])
            if i == 0:
                ind = re.match(r'[ \t]*', m.group(0)).group(0)
                out.append(footer_html(ind) + '\n')
            last = m.end()
        out.append(text[last:])
        return ''.join(out)
    # 没有版权页脚：插在 </body> 前的尾部脚本块之前
    end = text.lower().rfind('</body>')
    if end < 0:
        return text
    pos = end
    while True:
        seg = text[:pos].rstrip()
        if seg.endswith('</script>'):
            k = seg.lower().rfind('<script')
            if k < 0:
                break
            pos = k
        elif seg.endswith('-->'):
            k = seg.rfind('<!--')
            if k < 0:
                break
            pos = k
        else:
            break
    ls = text.rfind('\n', 0, pos) + 1
    ind = text[ls:pos] if text[ls:pos].strip() == '' else '    '
    return text[:ls] + footer_html(ind) + '\n' + text[ls:]


def fix_meta_fields(text, span, chap_name, section):
    obj = text[span[0]:span[1]]
    new = obj
    if chap_name:
        r = replace_top_field(new, 'chapter', chap_name)
        if r is not None:
            new = r
    if section:
        r = replace_top_field(new, 'section', section)
        if r is not None:
            new = r
    if new == obj:
        return text
    return text[:span[0]] + new + text[span[1]:]


# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------
def collect(prefix):
    files = sorted(p for p in ROOT.rglob('*.html') if p != ROOT / 'index.html')
    if prefix:
        cands = [Path(prefix), REPO / prefix, ROOT / prefix]
        base = None
        for c in cands:
            c = c if c.is_absolute() else (Path.cwd() / c)
            if c.exists():
                base = c.resolve()
                break
        if base is None:
            sys.exit('找不到 --prefix 路径：' + prefix)
        files = [f for f in files if str(f.resolve()).startswith(str(base))]
    return files


def main():
    ap = argparse.ArgumentParser(description='离散数学课程资源库 · 全站机械归一化（幂等）')
    ap.add_argument('--check', action='store_true', help='只报告不修改；有待改项时退出码为 1')
    ap.add_argument('--prefix', help='只处理该路径前缀下的页面（如 5命题逻辑 或 Discrete_Mathematics/8特殊图/8.1欧拉图）')
    ap.add_argument('--json', help='把报告写成 JSON 文件')
    ap.add_argument('-q', '--quiet', action='store_true', help='只输出汇总')
    args = ap.parse_args()

    files = collect(args.prefix)
    texts = {f: f.read_text(encoding='utf-8') for f in files}
    spans = {f: find_meta_span(t) for f, t in texts.items()}
    metas = eval_metas([texts[f][s[0]:s[1]] if s else None for f, s in spans.items()])
    metas = dict(zip(spans.keys(), metas))

    report = {'changed': [], 'unchanged': 0, 'no_meta': [], 'meta_error': [], 'no_tutor': [],
              'page_not_in_layers': [], 'layer_page_missing': [], 'section_nonstandard': [],
              'section_inconsistent': [], 'section_vs_dir': []}
    unit_sections = {}

    for f in files:
        rel = f.relative_to(ROOT)
        relp = rel.as_posix()
        text = orig = texts[f]
        depth = len(rel.parts) - 1
        prefix = '../' * depth
        chap = chapter_no(rel)
        chap_name = CHAPTERS.get(chap, '')
        meta = metas.get(f)
        changes = []

        if meta and '__error' in meta:
            report['meta_error'].append({'page': relp, 'error': meta['__error']})
            meta = None

        # 1) SECTION_META 字段 + 标题 / 描述 / OG
        if meta:
            section = clean_section(meta.get('section'))
            t2 = fix_meta_fields(text, spans[f], chap_name, section)
            if t2 != text:
                changes.append('meta')
                text = t2
            tier, layer, name = page_layer(meta, f.name)
            tier_name = TIERS[tier]
            title = '%s · %s｜%s - %s' % (name, tier_name, section, SITE_NAME) if name else \
                '%s｜%s - %s' % (tier_name, section, SITE_NAME)
            concepts = str((layer or {}).get('concepts') or '').strip().rstrip('。；;，, ') or name
            task = str((layer or {}).get('task') or '').strip()
            desc = '%s · %s · %s：%s' % (chap_name or meta.get('chapter', ''), section, tier_name, end_punct(concepts))
            if task:
                desc += end_punct(task)
            url = page_url(rel)
            t2 = set_title(text, title)
            t2, found = set_meta_content(t2, 'name', 'description', desc)
            if not found:
                tm = re.search(r'</title>', t2, re.I)
                ind = line_indent(t2, t2.rfind('<title', 0, tm.start()))
                t2 = t2[:tm.end()] + '\n' + ind + '<meta name="description" content="%s">' % attr(desc) + t2[tm.end():]
            t2 = ensure_meta_block(t2, [
                ('property', 'og:type', 'website'),
                ('property', 'og:site_name', '离散数学课程资源库 · 湖南信息学院'),
                ('property', 'og:locale', 'zh_CN'),
                ('property', 'og:title', title),
                ('property', 'og:description', desc),
                ('property', 'og:url', url),
            ])
            # 以下只在缺失时补默认值（已有则保留，避免覆盖各页定制封面）
            for kind, key, val in [('property', 'og:image', OG_IMAGE), ('property', 'og:image:width', '1200'),
                                   ('property', 'og:image:height', '630'),
                                   ('property', 'og:image:alt', '离散数学课程资源库 · 湖南信息学院'),
                                   ('name', 'twitter:card', 'summary_large_image')]:
                if not meta_re(kind, key).search(t2):
                    t2 = ensure_meta_block(t2, [('property', 'og:url', url), (kind, key, val)])
            t2 = ensure_meta_block(t2, [('name', 'twitter:card', 'summary_large_image'),
                                        ('name', 'twitter:title', title),
                                        ('name', 'twitter:description', desc)])
            if not meta_re('name', 'twitter:image').search(t2):
                t2 = ensure_meta_block(t2, [('name', 'twitter:description', desc), ('name', 'twitter:image', OG_IMAGE)])
            if t2 != text:
                changes.append('head')
                text = t2

            # 报告：层与页面
            layers = meta.get('layers') if isinstance(meta.get('layers'), list) else []
            pages = [str((L or {}).get('page') or '') for L in layers]
            if len(layers) != 3 or not all(pages):
                report['page_not_in_layers'].append({'page': relp, 'reason': 'layers 不足 3 层或缺 page'})
            elif f.name not in [p.split('/')[-1] for p in pages]:
                report['page_not_in_layers'].append({'page': relp, 'reason': '本页不在 layers[].page 中'})
            for p in pages:
                if p and not (f.parent / p).exists():
                    report['layer_page_missing'].append({'page': relp, 'target': p})
            if not re.fullmatch(r'\d+(?:\.\d+)+ \S.*', section) or re.search(r'[·｜|]', section):
                report['section_nonstandard'].append({'page': relp, 'section': section})
            unit_sections.setdefault(f.parent.relative_to(ROOT).as_posix(), set()).add(section)
            dm = re.match(r'^(?:\d+(?:\.\d+)*\.?)?\s*(.+)$', f.parent.name)
            sm = re.match(r'^\d+(?:\.\d+)+ (.+)$', section)
            def _nm(x):
                return re.sub(r'(?:（[一二三四]）|\d+)$', '', re.sub(r'[·｜|].*$', '', x).strip()).strip()
            if depth == 2 and dm and sm and _nm(dm.group(1)) != _nm(sm.group(1)):
                report['section_vs_dir'].append({'page': relp, 'section': section, 'dir': f.parent.name})
        else:
            report['no_meta'].append(relp)

        if 'ai-tutor.js' not in text:
            report['no_tutor'].append(relp)

        # 1b) favicon（全站内联 SVG）
        t2 = fix_favicon(text)
        if t2 != text:
            changes.append('favicon')
            text = t2
        # 2) 返回链接
        t2 = fix_home_link(text, prefix, chap)
        if t2 != text:
            changes.append('home-link')
            text = t2
        # 3) 页脚
        t2 = fix_footer(text)
        if t2 != text:
            changes.append('footer')
            text = t2
        # 4) 字体 + jsdelivr
        t2 = fix_jsdelivr(fix_fonts(text), prefix)
        if t2 != text:
            changes.append('fonts/cdn')
            text = t2

        if text != orig:
            report['changed'].append({'page': relp, 'changes': changes})
            if not args.check:
                f.write_text(text, encoding='utf-8')
        else:
            report['unchanged'] += 1

    for unit, secs in sorted(unit_sections.items()):
        if len(secs) > 1:
            report['section_inconsistent'].append({'unit': unit, 'sections': sorted(secs)})

    # ---- 输出 ----
    n = len(files)
    verb = '需修改' if args.check else '已修改'
    print('dm_normalize：共 %d 页，%s %d 页，无需改动 %d 页。' % (n, verb, len(report['changed']), report['unchanged']))
    if not args.quiet:
        for c in report['changed']:
            print('  %s %s  [%s]' % ('~' if args.check else '✓', c['page'], ', '.join(c['changes'])))
    labels = [
        ('no_meta', '缺 SECTION_META（标题/描述/OG 未生成，需章会话补齐）'),
        ('meta_error', 'SECTION_META 求值失败'),
        ('no_tutor', '未加载 shared/ai-tutor.js'),
        ('page_not_in_layers', '三阶 layers 不完整或本页不在 layers[].page 中'),
        ('layer_page_missing', 'layers[].page 指向的文件不存在'),
        ('section_nonstandard', 'section 不是「N.M 节名」规范写法'),
        ('section_inconsistent', '同一单元三阶页 section 不一致'),
        ('section_vs_dir', 'section 节名与目录名不一致（供核对主页/目录命名）'),
    ]
    for key, label in labels:
        items = report[key]
        if not items:
            continue
        print('\n【%s】%d 项' % (label, len(items)))
        for it in items:
            print('  - ' + (it if isinstance(it, str) else json.dumps(it, ensure_ascii=False)))
    if args.json:
        Path(args.json).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    if args.check and report['changed']:
        sys.exit(1)


if __name__ == '__main__':
    if hasattr(signal, 'SIGPIPE'):
        signal.signal(signal.SIGPIPE, signal.SIG_DFL)   # 允许 | head 等管道提前关闭
    main()
