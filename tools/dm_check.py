#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
dm_check.py —— 离散数学课程资源库 · 质检工具（无头浏览器 + 静态一致性检查）

对照 Discrete_Mathematics/shared/STYLE-GUIDE.md 检查页面：
  · 运行时：pageerror、console.error、本地资源 4xx/5xx、alert/confirm 使用；
  · 交互：逐页点击可见按钮（跳过学习助手坞 #dm-assist-root、三阶卡 #dm-page-layers 与返回链接）、
          切换下拉框、拖动一次滑块，捕获交互中出现的报错；
  · 截图：1440×900、1366×768、390×844 三个视口首屏截图（预置引导气泡为已看过，避免遮挡）；
  · 静态/DOM 一致性：<title>/description/OG/Twitter、页脚、返回链接、SECTION_META 字段、
          三阶 page 文件存在、统一字体片段、shared 资源引用、横向溢出、空白 canvas/svg、MathJax 渲染。

用法：
  pip install playwright pillow            # 不需要 playwright install（本机已有 Chromium 时自动探测）
  python3 tools/dm_check.py --prefix 5命题逻辑/1命题与联结词 --out /tmp/dm-shots
  python3 tools/dm_check.py --prefix 7图论基础 --out shots --sheet        # 同时生成截图拼图
  python3 tools/dm_check.py --no-shots --no-interact -j 4                  # 全站快速体检（4 进程并行）
  python3 tools/dm_check.py --static-only                                  # 只做静态检查（不启动浏览器）

退出码：存在 error 级问题时为 1。
"""
import argparse
import functools
import glob
import http.server
import json
import os
import re
import signal
import socket
import sys
import threading
import time
import traceback
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
from urllib.parse import quote, unquote, urlparse

REPO = Path(__file__).resolve().parent.parent
ROOT = REPO / 'Discrete_Mathematics'
SITE_BASE = 'https://dealtyxx.github.io/Teaching-Resource-Library/Discrete_Mathematics/'
SITE_NAME = '离散数学课程资源库'
CHAPTERS = {
    1: '第1章 计数基础与数论基础', 2: '第2章 集合及其运算', 3: '第3章 二元关系', 4: '第4章 特殊关系',
    5: '第5章 命题逻辑', 6: '第6章 谓词逻辑', 7: '第7章 图论基础', 8: '第8章 特殊图', 9: '第9章 代数系统',
    10: '第10章 群论基础', 11: '第11章 环、域、格和布尔代数',
}
FONT_URL = ('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng'
            '&family=Noto+Serif+SC:wght@400;600;700;900'
            '&family=JetBrains+Mono:wght@400;700&display=swap')
FOOTER_L1 = '© 2025-2026 湖南信息学院 · 计算机科学与工程课程资源库建设团队'
FOOTER_L2 = '版权所有 · 项目总负责人：谢鑫'
VIEWPORTS = {'1440': (1440, 900, False), '1366': (1366, 768, False), '390': (390, 844, True)}
TITLE_RE = re.compile(r'^.+ · (基础层|进阶层|拓展层)｜\d+(?:\.\d+)+ \S.* - ' + SITE_NAME + '$')


# ---------------------------------------------------------------------------
# 页面收集 / HTTP 服务
# ---------------------------------------------------------------------------
def collect(prefixes, include_home):
    files = sorted(p for p in ROOT.rglob('*.html') if p != ROOT / 'index.html')
    if prefixes:
        bases = []
        for prefix in prefixes:
            base = None
            for c in (Path(prefix), REPO / prefix, ROOT / prefix):
                c = c if c.is_absolute() else Path.cwd() / c
                if c.exists():
                    base = c.resolve()
                    break
            if base is None:
                sys.exit('找不到 --prefix 路径：' + prefix)
            bases.append(str(base))
        files = [f for f in files if any(str(f.resolve()).startswith(b) for b in bases)]
    if include_home:
        files.insert(0, ROOT / 'index.html')
    return files


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


def start_server():
    s = socket.socket()
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    handler = functools.partial(QuietHandler, directory=str(REPO))
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', port), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, port


def url_for(port, f):
    rel = f.relative_to(REPO)
    return 'http://127.0.0.1:%d/%s' % (port, '/'.join(quote(p) for p in rel.parts))


def find_chrome(explicit):
    if explicit:
        return explicit
    if os.environ.get('DM_CHROME'):
        return os.environ['DM_CHROME']
    cands = sorted(glob.glob('/opt/pw-browsers/chromium-*/chrome-linux/chrome'), reverse=True)
    return cands[0] if cands else None


# ---------------------------------------------------------------------------
# 静态检查（读源文件）
# ---------------------------------------------------------------------------
def static_checks(f):
    issues = []

    def err(code, msg):
        issues.append({'level': 'error', 'code': code, 'msg': msg})

    def warn(code, msg):
        issues.append({'level': 'warn', 'code': code, 'msg': msg})

    if f == ROOT / 'index.html':
        return issues
    text = f.read_text(encoding='utf-8')
    rel = f.relative_to(ROOT)
    depth = len(rel.parts) - 1
    prefix = '../' * depth
    head = text[:text.lower().find('</head>')] if '</head>' in text.lower() else text

    # 字体
    gf = re.findall(r'<link\b[^>]*fonts\.googleapis\.com/css[^>]*>', head, re.I)
    if not any('rel="preload"' in x and FONT_URL in x for x in gf) or \
            not any('media="print"' in x and FONT_URL in x for x in gf):
        err('fonts', '缺少统一的非阻塞字体片段（preload + media=print onload）')
    stray = [x for x in gf if FONT_URL not in x]
    if stray:
        err('fonts', '存在零散/阻塞的 Google Fonts 链接 %d 处' % len(stray))
    if 'cdn.jsdelivr.net' in text:
        err('cdn', '页面直连 cdn.jsdelivr.net（MathJax 应由 shared/mathjax-auto.js 加载本地副本）')
    # shared 引用
    for name in ('discrete-ui.css', 'mathjax-auto.js', 'ai-tutor.js'):
        m = re.search(r'(?:href|src)=["\']([^"\']*shared/%s)["\']' % re.escape(name), text)
        if not m:
            (warn if name != 'discrete-ui.css' else err)('shared', '未引用 shared/%s' % name)
        elif m.group(1) != prefix + 'shared/' + name:
            err('shared', 'shared/%s 相对路径应为 %s，实为 %s' % (name, prefix + 'shared/' + name, m.group(1)))
        elif not (f.parent / m.group(1)).resolve().exists():
            err('shared', 'shared/%s 路径不存在' % name)
    if re.search(r'ai-tutor\.js["\'][^>]*>', text) and not re.search(r'ai-tutor\.js["\'][^>]*\bdefer\b', text):
        warn('shared', 'ai-tutor.js 未加 defer')
    # 页脚
    foots = re.findall(r'<footer\b[^>]*>.*?</footer>', text, re.S | re.I)
    cr = [x for x in foots if '©' in x or '版权' in x]
    std = [x for x in cr if re.match(r'<footer class="site-footer">', x)]
    if len(cr) != 1 or len(std) != 1:
        err('footer', '版权页脚应恰好一个 footer.site-footer（现有版权页脚 %d 个，其中规范 %d 个）' % (len(cr), len(std)))
    elif FOOTER_L1 not in std[0] or FOOTER_L2 not in std[0]:
        err('footer', '页脚文案不规范')
    # 返回链接
    hl = re.findall(r'<a\b[^>]*class="home-link"[^>]*>(.*?)</a>', text, re.S)
    if len(hl) != 1:
        err('home-link', 'a.home-link 数量为 %d（应为 1）' % len(hl))
    else:
        m = re.search(r'<a\b[^>]*class="home-link"[^>]*href="([^"]*)"|<a\b[^>]*href="([^"]*)"[^>]*class="home-link"', text)
        href = (m.group(1) or m.group(2)) if m else ''
        cm = re.match(r'(\d+)', rel.parts[0])
        want = '%sindex.html#chapter%s' % (prefix, cm.group(1) if cm else '')
        if href != want:
            err('home-link', '返回链接 href 应为 %s，实为 %s' % (want, href))
        if hl[0].strip() != '← 返回课程主页':
            err('home-link', '返回链接文字应为「← 返回课程主页」')
    if re.search(r'title="返回课程主页"', text):
        err('home-link', '仍有 title="返回课程主页" 内联样式旧版浮标')
    # head 基础
    for pat, code, msg in [(r'<meta\s+charset', 'head', '缺 <meta charset>'),
                           (r'name=["\']viewport["\']', 'head', '缺 viewport'),
                           (r'rel=["\']icon["\']', 'head', '缺 favicon')]:
        if not re.search(pat, head, re.I):
            err(code, msg)
    return issues


def meta_content(head, kind, key):
    m = re.search(r'<meta\b(?=[^>]*\b%s\s*=\s*["\']%s["\'])[^>]*\bcontent\s*=\s*"([^"]*)"' % (kind, re.escape(key)), head, re.I)
    if not m:
        m = re.search(r'<meta\b[^>]*\bcontent\s*=\s*"([^"]*)"[^>]*\b%s\s*=\s*["\']%s["\']' % (kind, re.escape(key)), head, re.I)
    import html as _h
    return _h.unescape(m.group(1)) if m else None


def head_meta_checks(f, runtime_title):
    """<title>/description/OG 与规范、运行时标题一致性。"""
    import html as _h
    issues = []
    if f == ROOT / 'index.html':
        return issues
    text = f.read_text(encoding='utf-8')
    head = text[:text.lower().find('</head>')]
    tm = re.search(r'<title>(.*?)</title>', head, re.S)
    title = _h.unescape(tm.group(1).strip()) if tm else ''
    rel = f.relative_to(ROOT)
    if not TITLE_RE.match(title):
        issues.append({'level': 'error', 'code': 'title', 'msg': '<title> 不符合规范：' + title})
    if runtime_title is not None and runtime_title != title:
        issues.append({'level': 'error', 'code': 'title', 'msg': '运行时 document.title 与 <title> 不一致：' + runtime_title})
    desc = meta_content(head, 'name', 'description')
    if not desc or not re.match(r'^第\d+章 .+ · \d+(?:\.\d+)+ .+ · (基础层|进阶层|拓展层)：', desc or ''):
        issues.append({'level': 'error', 'code': 'description', 'msg': 'description 不符合规范：%s' % desc})
    want_url = SITE_BASE + '/'.join(quote(p, safe='') for p in rel.parts)
    for kind, key, want in [('property', 'og:title', title), ('property', 'og:description', desc),
                            ('property', 'og:url', want_url), ('name', 'twitter:title', title),
                            ('name', 'twitter:description', desc)]:
        v = meta_content(head, kind, key)
        if v != want:
            issues.append({'level': 'error', 'code': 'og', 'msg': '%s 应与规范一致（现为 %s）' % (key, v)})
    for kind, key in [('property', 'og:image'), ('name', 'twitter:card'), ('name', 'twitter:image')]:
        if not meta_content(head, kind, key):
            issues.append({'level': 'error', 'code': 'og', 'msg': '缺 %s' % key})
    return issues


# ---------------------------------------------------------------------------
# 浏览器内检查脚本
# ---------------------------------------------------------------------------
DOM_PROBE = r"""
() => {
  const vis = el => { if (!el || !el.getClientRects().length) return false; const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const out = {};
  out.title = document.title;
  // 真实可横向滚动的距离（兼容根元素 CSS zoom）
  const sy = window.scrollY; window.scrollTo(100000, sy); out.overflowX = Math.round(window.scrollX); window.scrollTo(0, sy);
  const M = window.SECTION_META || null;
  out.meta = M ? { chapter: M.chapter, section: M.section, title: M.title,
    layers: (M.layers || []).map(l => ({ name: l && l.name, concepts: l && l.concepts, task: l && l.task, page: l && l.page })) } : null;
  const hl = [...document.querySelectorAll('a.home-link')];
  out.homeLinks = hl.map(a => ({ href: a.href, text: a.textContent.trim(), injected: a.dataset.dmInjected === '1', visible: vis(a) }));
  out.footers = [...document.querySelectorAll('footer.site-footer')].map(f => f.textContent.replace(/\s+/g, ' ').trim());
  const band = document.getElementById('dm-page-layers');
  out.layers = band ? { count: band.querySelectorAll('.dm-tier').length,
    links: [...band.querySelectorAll('a.dm-tier-btn')].map(a => a.href),
    current: band.querySelectorAll('.dm-tier-current').length,
    top: band.getBoundingClientRect().top } : null;
  out.hasTutor = !!document.getElementById('dm-assist-root');
  // 空白 canvas / svg
  const blanks = [];
  document.querySelectorAll('canvas').forEach((c, i) => {
    if (c.closest('#dm-assist-root') || !vis(c)) return;
    const r = c.getBoundingClientRect(); if (r.width < 60 || r.height < 60) return;
    try { const ctx = c.getContext('2d'); if (!ctx) return; const w = c.width, h = c.height; if (!w || !h) { blanks.push('canvas#' + (c.id || i) + '(0 尺寸)'); return; }
      const d = ctx.getImageData(0, 0, w, h).data; const step = Math.max(1, Math.floor(d.length / 4 / 40000)) * 4; let first = null, same = true;
      for (let k = 0; k < d.length; k += step) { const v = (d[k] << 24) | (d[k + 1] << 16) | (d[k + 2] << 8) | d[k + 3]; if (first === null) first = v; else if (v !== first) { same = false; break; } }
      if (same) blanks.push('canvas#' + (c.id || i)); } catch (e) {}
  });
  document.querySelectorAll('svg').forEach((s, i) => {
    if (s.closest('#dm-assist-root') || s.closest('mjx-container') || !vis(s)) return;
    if (s.parentElement && s.parentElement.closest('svg')) return;
    const r = s.getBoundingClientRect(); if (r.width < 90 || r.height < 70) return;
    const n = s.querySelectorAll('path,circle,rect,line,polyline,polygon,ellipse,text,image,use,foreignObject').length;
    if (!n) blanks.push('svg#' + (s.id || i));
  });
  out.blanks = blanks;
  // MathJax
  const txt = document.body ? document.body.innerText : '';
  out.texLeft = (txt.match(/\\\(|\\\[|\$\$|\\frac|\\in\b|\\forall|\\exists/g) || []).length;
  out.mjx = document.querySelectorAll('mjx-container').length;
  out.onboardVisible = (() => { const o = document.getElementById('dm-onboard'); return !!(o && !o.classList.contains('dm-hidden') && vis(o)); })();
  return out;
}
"""

MARK_CONTROLS = r"""
(max) => {
  const vis = el => { if (!el || !el.getClientRects().length) return false; const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none') return false;
    const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
  const skip = el => el.closest('#dm-assist-root, #dm-page-layers, #dm-crumb, a.home-link, footer.site-footer');
  let n = 0; const res = { buttons: [], selects: [], ranges: [] };
  document.querySelectorAll('button, [role=button], input[type=button], input[type=submit]').forEach(b => {
    if (n >= max || skip(b) || !vis(b) || b.disabled) return;
    b.setAttribute('data-dmc', 'b' + n); res.buttons.push({ id: 'b' + n, text: (b.innerText || b.value || '').trim().slice(0, 30) }); n++;
  });
  document.querySelectorAll('select').forEach((s, i) => { if (skip(s) || !vis(s) || s.disabled || s.options.length < 2) return;
    s.setAttribute('data-dmc', 's' + i); res.selects.push({ id: 's' + i, n: s.options.length, cur: s.selectedIndex }); });
  document.querySelectorAll('input[type=range]').forEach((r, i) => { if (skip(r) || !vis(r) || r.disabled) return;
    r.setAttribute('data-dmc', 'r' + i); res.ranges.push({ id: 'r' + i }); });
  return res;
}
"""

INIT_SCRIPT = r"""
try { localStorage.setItem('dm_onboard_seen', '1'); } catch (e) {}
window.__dmDialogs = [];
"""


# ---------------------------------------------------------------------------
# 浏览器工作进程
# ---------------------------------------------------------------------------
def run_worker(job):
    from playwright.sync_api import sync_playwright
    files, port, opts = job
    results = []
    with sync_playwright() as p:
        launch = {'headless': True, 'args': ['--disable-gpu', '--no-sandbox']}
        if opts.get('chrome'):
            launch['executable_path'] = opts['chrome']
        proxy = (os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')) if opts.get('env_proxy') else None
        if proxy and not opts.get('block_external'):
            launch['proxy'] = {'server': proxy, 'bypass': '127.0.0.1,localhost'}
        browser = p.chromium.launch(**launch)
        ctxs = {}
        for key in opts['viewports']:
            w, h, mobile = VIEWPORTS[key]
            kw = dict(viewport={'width': w, 'height': h}, ignore_https_errors=True)
            if mobile:
                kw.update(is_mobile=True, has_touch=True, device_scale_factor=2)
            ctx = browser.new_context(**kw)
            if not opts.get('show_onboard'):
                ctx.add_init_script(INIT_SCRIPT)

            # 只拦截需要拦截的请求：对全部请求挂 route 会让跨域字体 CSS 在 Chromium 中偶发 ERR_FAILED
            ctx.route(re.compile(r'busuanzi'), lambda route: route.abort())
            if opts.get('block_external'):
                ctx.route(re.compile(r'^https?://(?!127\.0\.0\.1|localhost)'), lambda route: route.abort())
            ctxs[key] = ctx
        for f in files:
            try:
                results.append(check_page(ctxs, f, port, opts))
            except Exception as e:
                results.append({'page': f.relative_to(REPO).as_posix(), 'issues': [
                    {'level': 'error', 'code': 'crash', 'msg': '检查过程异常：%s' % e}], 'trace': traceback.format_exc()})
        browser.close()
    return results


def shot_name(f, key):
    rel = f.relative_to(ROOT).as_posix()
    return re.sub(r'[\\/:*?"<>|\s]+', '__', rel[:-5]) + '@' + key + '.png'


def check_page(ctxs, f, port, opts):
    url = url_for(port, f)
    rel = f.relative_to(REPO).as_posix()
    res = {'page': rel, 'url': url, 'issues': [], 'shots': {}}
    issues = res['issues']
    is_home = f == ROOT / 'index.html'

    def add(level, code, msg):
        issues.append({'level': level, 'code': code, 'msg': msg})

    runtime_title = None
    for key in opts['viewports']:
        page = ctxs[key].new_page()
        phase = ['load']
        seen = set()

        def on_pageerror(e, _key=key):
            m = 'pageerror[%s/%s]: %s' % (phase[0], _key, str(e).split('\n')[0][:300])
            if m not in seen:
                seen.add(m)
                add('error', 'js', m)

        def on_console(msg, _key=key):
            if msg.type != 'error':
                return
            t = msg.text[:300]
            loc = (msg.location or {}).get('url', '')
            external = loc and not loc.startswith('http://127.0.0.1')
            if 'Failed to load resource' in t and (external or not loc):
                return  # 资源失败由 response/requestfailed 处理
            m = 'console.error[%s/%s]: %s' % (phase[0], _key, t)
            if m not in seen:
                seen.add(m)
                add('warn' if external else 'error', 'console', m)

        def on_response(r):
            u = r.url
            if u.startswith('http://127.0.0.1') and r.status >= 400:
                m = '本地资源 %d: %s' % (r.status, unquote(urlparse(u).path))
                if m not in seen:
                    seen.add(m)
                    add('error', '404', m)

        ext_fail = {}

        def on_failed(r):
            u = r.url
            if 'busuanzi' in u or opts.get('block_external') or u.startswith('http://127.0.0.1'):
                return
            host = urlparse(u).netloc
            ext_fail.setdefault(host, [0, r.failure])[0] += 1

        def on_dialog(d):
            add('error', 'dialog', '使用了 %s()：%s' % (d.type, d.message[:80]))
            try:
                d.dismiss()
            except Exception:
                pass

        page.on('pageerror', on_pageerror)
        page.on('console', on_console)
        page.on('response', on_response)
        page.on('requestfailed', on_failed)
        page.on('dialog', on_dialog)
        try:
            page.goto(url, wait_until='domcontentloaded', timeout=opts['timeout'] * 1000)
            try:
                page.wait_for_load_state('load', timeout=opts['timeout'] * 1000)
            except Exception:
                add('warn', 'load', '[%s] load 事件超时（多为外部字体/CDN 过慢）' % key)
        except Exception as e:
            add('error', 'load', '[%s] 页面加载失败：%s' % (key, str(e).split('\n')[0][:200]))
        page.wait_for_timeout(opts['settle'])
        for host, (cnt, why) in sorted(ext_fail.items()):
            add('warn', 'external', '[%s] 外部资源加载失败：%s × %d（%s）' % (key, host, cnt, why))
        ext_fail.clear()
        probe = {}
        try:
            probe = page.evaluate(DOM_PROBE)
        except Exception as e:
            add('error', 'probe', '[%s] DOM 探测失败：%s' % (key, e))
        if probe.get('overflowX', 0) > 1:
            add('error', 'overflow', '[%s] 横向溢出 %dpx' % (key, probe['overflowX']))
        if opts.get('shots_dir'):
            out = Path(opts['shots_dir']) / shot_name(f, key)
            try:
                page.screenshot(path=str(out))
                res['shots'][key] = str(out)
            except Exception as e:
                add('warn', 'shot', '[%s] 截图失败：%s' % (key, e))
        if key == opts['viewports'][0]:
            runtime_title = probe.get('title')
            res['probe'] = probe
            if not is_home:
                dom_checks(f, probe, add)
            if opts.get('interact'):
                phase[0] = 'interact'
                interact(page, add, opts)
        elif key in ('1366', '1440') and not is_home and probe.get('layers') and probe['layers']['top'] > VIEWPORTS[key][1]:
            add('warn', 'layout', '[%s] 首屏看不到三阶卡（top=%d）' % (key, probe['layers']['top']))
        if key == '390' and opts.get('show_onboard') and probe.get('onboardVisible') is False:
            pass
        page.close()
    if not is_home:
        for it in head_meta_checks(f, runtime_title):
            issues.append(it)
    return res


def dom_checks(f, probe, add):
    rel = f.relative_to(ROOT)
    M = probe.get('meta')
    if not M:
        add('error', 'meta', '缺 window.SECTION_META')
    else:
        cm = re.match(r'(\d+)', rel.parts[0])
        want = CHAPTERS.get(int(cm.group(1))) if cm else None
        if want and M.get('chapter') != want:
            add('error', 'meta', 'SECTION_META.chapter 应为「%s」，实为「%s」' % (want, M.get('chapter')))
        sec = str(M.get('section') or '')
        # 框架运行时会给 section 追加「· 层级」，故这里去掉后再判断
        base = re.sub(r'\s*·\s*(基础层|进阶层|拓展层)$', '', sec)
        if re.search(r'(基础层|进阶层|拓展层)', base):
            add('error', 'meta', 'section 带有重复的层级后缀：' + sec)
        if not re.match(r'^\d+(?:\.\d+)+ \S', base):
            add('error', 'meta', 'section 不是「N.M 节名」格式：' + sec)
        layers = M.get('layers') or []
        if len(layers) != 3:
            add('error', 'meta', 'SECTION_META.layers 应为 3 层（现 %d）' % len(layers))
        else:
            for i, L in enumerate(layers):
                for k in ('name', 'concepts', 'task', 'page'):
                    if not L.get(k):
                        add('error', 'meta', 'layers[%d].%s 为空' % (i, k))
                pg = L.get('page')
                if pg and not (f.parent / pg).exists():
                    add('error', 'meta', 'layers[%d].page 指向不存在的文件：%s' % (i, pg))
            pages = [str(L.get('page') or '').split('/')[-1] for L in layers]
            if f.name not in pages:
                add('warn', 'meta', '本页不在 layers[].page 中（三阶卡无法标记「当前」）')
    hl = probe.get('homeLinks') or []
    if len(hl) != 1:
        add('error', 'home-link', '运行时 a.home-link 数量为 %d' % len(hl))
    elif hl[0].get('injected'):
        add('error', 'home-link', '页面缺 a.home-link（由框架兜底注入）')
    elif not hl[0].get('visible'):
        add('warn', 'home-link', '返回链接不可见')
    ft = probe.get('footers') or []
    if len(ft) != 1:
        add('error', 'footer', '运行时 footer.site-footer 数量为 %d' % len(ft))
    L = probe.get('layers')
    if M and probe.get('hasTutor'):
        if not L:
            add('error', 'layers', '未渲染三阶卡 #dm-page-layers')
        else:
            if L['count'] != 3:
                add('error', 'layers', '三阶卡数量为 %d' % L['count'])
            for u in L['links']:
                p = Path(unquote(urlparse(u).path).lstrip('/'))
                if not (REPO / p).exists():
                    add('error', 'layers', '三阶卡链接指向不存在的文件：' + unquote(u))
            if L['current'] != 1 and len(L['links']) == 2:
                pass
    for b in probe.get('blanks') or []:
        add('warn', 'blank', '首屏空白画布：' + b)
    if probe.get('texLeft', 0) > 0 and probe.get('mjx', 0) == 0:
        add('warn', 'mathjax', '页面含 TeX 源码但未渲染出 mjx-container（%d 处）' % probe['texLeft'])


def interact(page, add, opts):
    try:
        ctl = page.evaluate(MARK_CONTROLS, opts['max_clicks'])
    except Exception as e:
        add('warn', 'interact', '无法枚举控件：%s' % e)
        return
    start_url = page.url
    for b in ctl['buttons']:
        loc = page.locator('[data-dmc="%s"]' % b['id'])
        try:
            if loc.count() and loc.first.is_visible() and loc.first.is_enabled():
                loc.first.click(timeout=1200, no_wait_after=True)
                page.wait_for_timeout(opts['click_wait'])
        except Exception:
            pass
        if page.url.split('#')[0] != start_url.split('#')[0]:
            add('warn', 'interact', '按钮「%s」导致跳转到 %s' % (b['text'], unquote(page.url)))
            try:
                page.goto(start_url, wait_until='load', timeout=opts['timeout'] * 1000)
                page.wait_for_timeout(600)
            except Exception:
                return
    for s in ctl['selects']:
        try:
            idx = (s['cur'] + 1) % s['n']
            page.locator('[data-dmc="%s"]' % s['id']).first.select_option(index=idx, timeout=1200)
            page.wait_for_timeout(opts['click_wait'])
        except Exception:
            pass
    for r in ctl['ranges']:
        try:
            loc = page.locator('[data-dmc="%s"]' % r['id']).first
            bb = loc.bounding_box()
            if bb:
                y = bb['y'] + bb['height'] / 2
                page.mouse.move(bb['x'] + bb['width'] * 0.5, y)
                page.mouse.down()
                page.mouse.move(bb['x'] + bb['width'] * 0.8, y, steps=6)
                page.mouse.up()
                page.wait_for_timeout(opts['click_wait'])
        except Exception:
            pass
    page.wait_for_timeout(400)


# ---------------------------------------------------------------------------
# 截图拼图
# ---------------------------------------------------------------------------
def make_sheets(results, out_dir, viewports, per_sheet=24):
    from PIL import Image, ImageDraw, ImageFont
    font = None
    for fp in ['/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc',
               '/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc', '/System/Library/Fonts/PingFang.ttc',
               'C:/Windows/Fonts/msyh.ttc']:
        if os.path.exists(fp):
            font = ImageFont.truetype(fp, 16)
            break
    font = font or ImageFont.load_default()
    sheets = []
    for key in viewports:
        items = [(r['page'], r['shots'].get(key)) for r in results if r.get('shots', {}).get(key)]
        if not items:
            continue
        tw = 360 if key != '390' else 180
        cols = 4 if key != '390' else 8
        for si in range(0, len(items), per_sheet):
            chunk = items[si:si + per_sheet]
            thumbs = []
            for name, path in chunk:
                im = Image.open(path).convert('RGB')
                th = int(im.height * tw / im.width)
                thumbs.append((name, im.resize((tw, th))))
            cell_h = max(t.height for _, t in thumbs) + 40
            rows = (len(thumbs) + cols - 1) // cols
            sheet = Image.new('RGB', (cols * (tw + 12) + 12, rows * cell_h + 12), (255, 251, 240))
            d = ImageDraw.Draw(sheet)
            for i, (name, t) in enumerate(thumbs):
                x = 12 + (i % cols) * (tw + 12)
                y = 12 + (i // cols) * cell_h
                sheet.paste(t, (x, y + 30))
                label = name.replace('Discrete_Mathematics/', '')
                label = label if len(label) <= (38 if key != '390' else 18) else '…' + label[-(37 if key != '390' else 17):]
                d.text((x, y + 6), label, fill=(44, 24, 16), font=font)
            out = Path(out_dir) / ('sheet@%s_%02d.png' % (key, si // per_sheet + 1))
            sheet.save(out)
            sheets.append(str(out))
    return sheets


# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description='离散数学课程资源库 · 质检工具')
    ap.add_argument('--prefix', action='append', help='只检查该路径前缀下的页面（相对仓库根或 Discrete_Mathematics/；可重复多次）')
    ap.add_argument('--out', default='dm-check-out', help='截图与报告输出目录（默认 ./dm-check-out）')
    ap.add_argument('--viewports', default='1440,1366,390', help='视口列表，取自 1440,1366,390（第一个做完整检查与交互）')
    ap.add_argument('--no-shots', action='store_true', help='不截图')
    ap.add_argument('--no-interact', action='store_true', help='不做点击/下拉/滑块交互')
    ap.add_argument('--static-only', action='store_true', help='只做静态检查，不启动浏览器')
    ap.add_argument('--sheet', action='store_true', help='生成截图拼图 sheet@视口_NN.png')
    ap.add_argument('--home', action='store_true', help='同时检查主页 index.html（只做运行时检查）')
    ap.add_argument('--show-onboard', action='store_true', help='不预置引导气泡为已看过（用于检查首次引导）')
    ap.add_argument('--block-external', action='store_true', help='拦截所有外部请求（模拟校园网无法访问 Google/CDN）')
    ap.add_argument('--env-proxy', action='store_true', help='让浏览器使用环境变量 HTTPS_PROXY 作为代理')
    ap.add_argument('--chrome', help='Chromium 可执行文件路径（默认自动探测 /opt/pw-browsers，找不到则用 playwright 默认浏览器）')
    ap.add_argument('-j', '--jobs', type=int, default=1, help='并行进程数')
    ap.add_argument('--max-clicks', type=int, default=40, help='每页最多点击的按钮数')
    ap.add_argument('--click-wait', type=int, default=120, help='每次交互后的等待毫秒')
    ap.add_argument('--settle', type=int, default=2200, help='页面 load 后额外等待毫秒（等框架注入/MathJax）')
    ap.add_argument('--timeout', type=int, default=30, help='页面加载超时秒')
    ap.add_argument('--json', help='JSON 报告路径（默认 <out>/report.json）')
    args = ap.parse_args()

    files = collect(args.prefix, args.home)
    if not files:
        sys.exit('没有匹配的页面')
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    t0 = time.time()

    results = {f: {'page': f.relative_to(REPO).as_posix(), 'issues': static_checks(f), 'shots': {}} for f in files}
    if args.static_only:
        for f in files:
            results[f]['issues'] += head_meta_checks(f, None)
    else:
        vps = [v.strip() for v in args.viewports.split(',') if v.strip() in VIEWPORTS]
        opts = {'viewports': vps, 'shots_dir': None if args.no_shots else str(out), 'interact': not args.no_interact,
                'chrome': find_chrome(args.chrome), 'show_onboard': args.show_onboard,
                'block_external': args.block_external, 'env_proxy': args.env_proxy, 'max_clicks': args.max_clicks,
                'click_wait': args.click_wait, 'settle': args.settle, 'timeout': args.timeout}
        httpd, port = start_server()
        jobs = max(1, min(args.jobs, len(files)))
        chunks = [(files[i::jobs], port, opts) for i in range(jobs)]
        done = []
        if jobs == 1:
            done = run_worker(chunks[0])
        else:
            with ProcessPoolExecutor(max_workers=jobs) as ex:
                for part in ex.map(run_worker, chunks):
                    done.extend(part)
        httpd.shutdown()
        by = {r['page']: r for r in done}
        for f in files:
            r = by.get(f.relative_to(REPO).as_posix())
            if r:
                r['issues'] = results[f]['issues'] + r['issues']
                results[f] = r

    res = [results[f] for f in files]
    for r in res:
        r.pop('probe', None)
    sheets = make_sheets(res, out, [v for v in args.viewports.split(',')]) if args.sheet and not args.no_shots and not args.static_only else []
    n_err = sum(1 for r in res for i in r['issues'] if i['level'] == 'error')
    n_warn = sum(1 for r in res for i in r['issues'] if i['level'] == 'warn')
    bad = [r for r in res if any(i['level'] == 'error' for i in r['issues'])]
    report = {'pages': len(res), 'errors': n_err, 'warnings': n_warn, 'error_pages': [r['page'] for r in bad],
              'sheets': sheets, 'results': res, 'seconds': round(time.time() - t0, 1)}
    jp = Path(args.json) if args.json else out / 'report.json'
    jp.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')

    # 文本报告
    lines = ['dm_check：%d 页，error %d 条（%d 页），warn %d 条，用时 %.0fs' % (len(res), n_err, len(bad), n_warn, report['seconds'])]
    for r in res:
        iss = r['issues']
        if not iss:
            continue
        e = [i for i in iss if i['level'] == 'error']
        w = [i for i in iss if i['level'] == 'warn']
        lines.append('\n%s %s' % ('✗' if e else '△', r['page'].replace('Discrete_Mathematics/', '')))
        for i in e + w:
            lines.append('   [%s:%s] %s' % (i['level'], i['code'], i['msg']))
    if sheets:
        lines.append('\n拼图：' + ', '.join(sheets))
    lines.append('\nJSON 报告：%s' % jp)
    text = '\n'.join(lines)
    (out / 'report.txt').write_text(text, encoding='utf-8')
    print(text)
    sys.exit(1 if n_err else 0)


if __name__ == '__main__':
    if hasattr(signal, 'SIGPIPE'):
        signal.signal(signal.SIGPIPE, signal.SIG_DFL)   # 允许 | head 等管道提前关闭
    main()
