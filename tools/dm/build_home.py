"""重新生成主页（index.html）的课程目录区块，并补全主页 <head> 元数据。
由 apply_catalog.py 调用；数据全部来自 catalog.py，保证主页与各小节页编号、命名、案例标记完全一致。"""
import os, re
import catalog as C

SITE = C.SITE_DIR
CN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一']

def esc(s): return s.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')

def modules_html(info, ids):
    out = []
    for c in C.CHAPTERS:
        n, name, cat = c[0], c[1], c[2]
        units = [(i, u) for i, u in enumerate(C.UNITS) if u['ch'] == n]
        ncase = sum(1 for _, u in units if u['case'])
        out.append('                <div class="module-card" data-category="%s" id="chapter%d">' % (cat, n))
        out.append('                    <div class="module-header" role="button" tabindex="0" aria-expanded="true" aria-controls="chapter%d-body">' % n)
        out.append('                        <span>第%s章 %s<span class="module-count">%d 节</span>%s</span>' % (
            CN[n], esc(name), len(units), ('<span class="module-count module-count-case">%d 案例</span>' % ncase) if ncase else ''))
        out.append('                        <span class="module-toggle" aria-hidden="true">▼</span>')
        out.append('                    </div>')
        out.append('                    <div class="module-body" id="chapter%d-body">' % n)
        out.append('                        <ul class="topic-list">')
        for i, u in units:
            pages = C.tier_paths(u)
            q = ' '.join([u['num'], u['name'], u['part'] or '', '案例 应用' if u['case'] else ''] +
                         ['%s %s' % (t['name'], t['concepts']) for t in info[i]]).lower()
            out.append('                            <li class="topic-item%s" data-uid="%s" data-q="%s">' % (' is-case' if u['case'] else '', ids[i], esc(q)))
            out.append('                                <a href="%s" class="topic-link"><span class="topic-num">%s</span><span class="topic-name">%s%s</span>%s</a>' % (
                pages[1], u['num'], esc(u['name']), ('<i> · %s</i>' % esc(u['part'])) if u['part'] else '',
                '<em class="topic-case">案例</em>' if u['case'] else ''))
            chips = ''.join('<a class="tier-chip" data-tier="%d" href="%s" title="%s：%s" aria-label="%s %s：%s">%s</a>' % (
                t, pages[t], ['基础层', '进阶层', '拓展层'][t], esc(info[i][t]['name']),
                esc(C.section_label(u)), ['基础层', '进阶层', '拓展层'][t], esc(info[i][t]['name']), '基进拓'[t]) for t in range(3))
            out.append('                                <span class="topic-tiers">%s</span>' % chips)
            out.append('                            </li>')
        out.append('                        </ul>')
        out.append('                    </div>')
        out.append('                </div>')
    return '\n'.join(out)

FILTERS = [('all', '全部章节'), ('基础', '基础理论'), ('关系', '关系函数'), ('逻辑', '逻辑推理'), ('图', '图论'), ('代数', '代数系统')]

def section_html(info, ids):
    ncase = sum(1 for u in C.UNITS if u['case'])
    btns = '\n'.join('                <button type="button" class="filter-btn%s" data-cat="%s" aria-pressed="%s">%s</button>' % (
        ' active' if k == 'all' else '', k, 'true' if k == 'all' else 'false', v) for k, v in FILTERS)
    return '''        <!-- 课程模块导航（由 tools/dm/build_home.py 生成，请勿手工修改） -->
        <div class="modules-section" id="modules">
            <h2 class="section-title">课程模块导航</h2>
            <div class="progress-line"><span id="progressText"></span><div class="progress-bar" aria-hidden="true"><i id="progressBar"></i></div></div>
            <div class="filter-buttons" role="group" aria-label="按知识领域筛选">
%s
                <button type="button" class="filter-btn filter-case" id="caseToggle" aria-pressed="false" title="只显示应用案例小节">仅看案例（%d）</button>
            </div>
            <div class="modules-status" id="modulesStatus" role="status" aria-live="polite"></div>
            <div class="modules-grid" id="modulesGrid">
%s
            </div>
            <div class="no-result" id="noResult" hidden>没有找到匹配的小节，试试更短的关键词，例如「图」「群」「密钥」。</div>
        </div>''' % (btns, ncase, modules_html(info, ids))

CSS = '''
        /* DM:HOME-EXT —— 由 tools/dm/build_home.py 维护：编号 / 案例徽标 / 三阶直达 / 搜索状态 */
        .search-input:focus-visible, .filter-btn:focus-visible, .module-header:focus-visible,
        .tier-chip:focus-visible, .topic-link:focus-visible, .quick-link:focus-visible {
            outline: 2px solid var(--accent-gold);
            outline-offset: 2px;
        }
        .search-status, .modules-status {
            min-height: 1.4em;
            margin: 0 0 12px;
            color: var(--ink-soft);
            font-size: 0.86rem;
        }
        .search-status { min-height: 0; margin: 0; }
        .search-status:empty { display: none; }
        .search-status:not(:empty) {
            margin-top: 8px;
            padding: 8px 14px;
            border-radius: var(--radius-sm);
            border: 1px solid var(--line);
            background: rgba(255, 253, 247, 0.96);
            box-shadow: var(--shadow-sm);
        }
        .modules-status:empty { display: none; }
        .search-status a, .modules-status a, .link-btn {
            color: var(--primary-red);
            font-weight: 800;
            text-decoration: none;
            background: none;
            border: 0;
            padding: 0;
            font: inherit;
            font-weight: 800;
            cursor: pointer;
        }
        .search-status a:hover, .modules-status a:hover, .link-btn:hover { text-decoration: underline; }
        .filter-case { border-style: dashed; }
        .filter-case[aria-pressed="true"] {
            background: linear-gradient(135deg, var(--accent-gold), #E39A00);
            color: var(--ink);
            border-style: solid;
        }
        .module-card { scroll-margin-top: 18px; }
        .module-count-case { background: rgba(255, 180, 0, 0.2); color: #8A5D0B; }
        .topic-item { display: flex; align-items: center; gap: 8px; }
        .topic-item[hidden] { display: none; }
        .topic-item .topic-link {
            flex: 1 1 auto;
            min-width: 0;
            grid-template-columns: minmax(2.4em, auto) minmax(0, 1fr) auto;
            gap: 8px;
        }
        .topic-item .topic-link::before { display: none; }
        .topic-num {
            font: 800 0.76rem/1 'JetBrains Mono', Consolas, monospace;
            color: #9A6A10;
        }
        .topic-name i { font-style: normal; color: var(--muted); font-size: 0.82rem; }
        .topic-case {
            font-style: normal;
            font-size: 0.66rem;
            font-weight: 900;
            padding: 1px 8px;
            border-radius: 999px;
            color: #8A5D0B;
            background: rgba(255, 180, 0, 0.22);
            border: 1px solid rgba(214, 59, 29, 0.2);
            white-space: nowrap;
        }
        .topic-item.hit .topic-link {
            background: rgba(255, 180, 0, 0.22);
            border-color: rgba(214, 59, 29, 0.3);
        }
        .topic-tiers { flex: 0 0 auto; display: inline-flex; gap: 4px; }
        .tier-chip {
            width: 26px;
            height: 26px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 0.72rem;
            font-weight: 900;
            color: var(--ink-soft);
            text-decoration: none;
            border: 1px solid rgba(214, 59, 29, 0.22);
            background: rgba(255, 255, 255, 0.86);
            transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .tier-chip:hover { background: var(--primary-red); color: #fff; border-color: var(--primary-red); transform: translateY(-1px); }
        .tier-chip.done { color: #8A5D0B; background: rgba(255, 180, 0, 0.3); border-color: rgba(197, 138, 31, 0.6); }
        .no-result {
            padding: 28px 16px;
            text-align: center;
            color: var(--ink-soft);
            border: 1px dashed var(--line-strong);
            border-radius: var(--radius-md);
            background: rgba(255, 255, 255, 0.6);
        }
        .no-result[hidden] { display: none; }
        .progress-line { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin: -6px 0 16px; color: var(--ink-soft); font-size: 0.84rem; }
        .progress-bar { flex: 0 1 180px; min-width: 96px; height: 8px; border-radius: 999px; background: rgba(214, 59, 29, 0.1); overflow: hidden; }
        .progress-bar > i { display: block; height: 100%; width: 0; border-radius: inherit; background: linear-gradient(90deg, var(--accent-gold), var(--primary-red)); transition: width 0.4s ease; }
        .skip-link {
            position: absolute;
            left: -9999px;
            top: 10px;
            z-index: 300;
            padding: 8px 16px;
            border-radius: 999px;
            background: var(--primary-red);
            color: #fff;
            font-weight: 800;
            text-decoration: none;
        }
        .skip-link:focus { left: 12px; }
        @media (prefers-reduced-motion: reduce) {
            html { scroll-behavior: auto; }
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
        @media (max-width: 720px) {
            .topic-item .topic-link { grid-template-columns: minmax(2.2em, auto) minmax(0, 1fr); }
            .topic-case { display: none; }
            .tier-chip { width: 30px; height: 30px; }
        }
'''

JS = '''
        /* DM:HOME-SCRIPT —— 由 tools/dm/build_home.py 维护 */
        var TOTAL_UNITS = __TOTAL__;
        var state = { cat: 'all', q: '', caseOnly: false };
        var $ = function (s, r) { return (r || document).querySelector(s); };
        var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

        /* ---- 返回顶部 ---- */
        var ticking = false;
        function updateBackToTop() {
            var b = $('#backToTop');
            if (b) b.classList.toggle('visible', (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300));
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { window.requestAnimationFrame(updateBackToTop); ticking = true; }
        }, { passive: true });
        function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

        /* ---- 章节折叠 ---- */
        function toggleModule(header) {
            var card = header.closest('.module-card');
            var collapsed = card.classList.toggle('collapsed');
            header.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        }
        $$('.module-header').forEach(function (h) {
            h.addEventListener('click', function () { toggleModule(h); });
            h.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleModule(h); }
            });
        });

        /* ---- 筛选 + 搜索（统一由 render 计算，互不覆盖） ---- */
        function render() {
            var q = state.q.trim().toLowerCase();
            var shownCards = 0, shownItems = 0;
            $$('.module-card').forEach(function (card) {
                var catOk = state.cat === 'all' || card.dataset.category === state.cat;
                var any = false;
                $$('.topic-item', card).forEach(function (li) {
                    var hit = (!q || li.dataset.q.indexOf(q) > -1) && (!state.caseOnly || li.classList.contains('is-case'));
                    li.hidden = !hit;
                    li.classList.toggle('hit', !!q && hit);
                    if (hit) any = true;
                    if (hit && catOk) shownItems++;
                });
                var visible = catOk && any;
                card.classList.toggle('hidden', !visible);
                if (visible) {
                    shownCards++;
                    if (q || state.caseOnly) { card.classList.remove('collapsed'); var h = $('.module-header', card); if (h) h.setAttribute('aria-expanded', 'true'); }
                }
            });
            $$('.filter-btn[data-cat]').forEach(function (b) {
                var on = b.dataset.cat === state.cat;
                b.classList.toggle('active', on);
                b.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
            var ct = $('#caseToggle');
            if (ct) ct.setAttribute('aria-pressed', state.caseOnly ? 'true' : 'false');
            $('#noResult').hidden = shownCards > 0;
            var st = $('#searchStatus'), ms = $('#modulesStatus');
            var filtered = q || state.caseOnly || state.cat !== 'all';
            var msg = filtered ? ('找到 <b>' + shownItems + '</b> 个小节，分布在 ' + shownCards + ' 个章节 · <button type="button" class="link-btn" id="resetFilters">清除筛选</button>') : '';
            if (st) st.innerHTML = q ? msg : '';
            if (ms) ms.innerHTML = q ? '' : msg;
            var rb = $('#resetFilters');
            if (rb) rb.addEventListener('click', resetFilters);
        }
        function resetFilters() {
            state.cat = 'all'; state.q = ''; state.caseOnly = false;
            $('#searchInput').value = '';
            render();
        }
        function filterModules(category) { state.cat = category; state.q = ''; $('#searchInput').value = ''; render(); }
        function searchContent() {
            state.q = $('#searchInput').value;
            render();
            var first = $('.module-card:not(.hidden)');
            if (state.q && first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        $$('.filter-btn[data-cat]').forEach(function (b) {
            b.addEventListener('click', function () { state.cat = b.dataset.cat; render(); });
        });
        $('#caseToggle').addEventListener('click', function () { state.caseOnly = !state.caseOnly; render(); });
        $('#searchInput').addEventListener('input', function (e) { state.q = e.target.value; render(); });
        $('#searchInput').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') searchContent();
            if (e.key === 'Escape') resetFilters();
        });
        document.addEventListener('keydown', function (e) {
            var t = e.target && e.target.tagName;
            if (e.key === '/' && t !== 'INPUT' && t !== 'TEXTAREA') { e.preventDefault(); $('#searchInput').focus(); }
        });

        /* ---- 学习足迹（与各小节页的 site-shell.js 共用 localStorage: dm_visited_v1） ---- */
        function readVisited() { try { return JSON.parse(localStorage.getItem('dm_visited_v1') || '{}') || {}; } catch (e) { return {}; } }
        function paintProgress() {
            var v = readVisited(), done = 0;
            $$('.topic-item').forEach(function (li) {
                var m = v[li.dataset.uid] || 0;
                if (m) done++;
                $$('.tier-chip', li).forEach(function (c) { c.classList.toggle('done', !!(m & (1 << +c.dataset.tier))); });
            });
            var t = $('#progressText'), bar = $('#progressBar');
            if (t) t.innerHTML = '学习足迹：已访问 <b>' + done + '</b> / ' + TOTAL_UNITS + ' 个小节（仅保存在本机浏览器）' +
                (done ? ' · <button type="button" class="link-btn" id="clearProgress">清除足迹</button>' : '');
            if (bar) bar.style.width = Math.round(done / TOTAL_UNITS * 100) + '%';
            var cp = $('#clearProgress');
            if (cp) cp.addEventListener('click', function () { try { localStorage.removeItem('dm_visited_v1'); } catch (e) {} paintProgress(); });
        }
        window.addEventListener('pageshow', paintProgress);

        document.addEventListener('DOMContentLoaded', function () {
            document.body.classList.add('ready');
            render();
            paintProgress();
            if (location.hash) {
                var card = $(location.hash.replace(/[^#\\w-]/g, ''));
                if (card && card.classList.contains('module-card')) card.classList.remove('collapsed');
            }
        });
'''

def apply(info, ids, check=False):
    p = os.path.join(SITE, 'index.html')
    src = open(p, encoding='utf-8').read()
    html = src

    # 1. head：统一描述与元数据
    total = len(C.UNITS)
    ncase = sum(1 for u in C.UNITS if u['case'])
    desc = '离散数学课程资源库：%d 章 %d 个知识单元、%d 个三阶（基础/进阶/拓展）互动案例页，其中 %d 个应用案例，融合课程思政，%s。' % (
        len(C.CHAPTERS), total, total * 3, ncase, C.ORG)
    title = '离散数学课程思政 - %s' % C.ORG
    for pat in [r'<meta\s+name="description"[^>]*>', r'<meta\s+name="theme-color"[^>]*>', r'<link\s+rel="(?:icon|canonical)"[^>]*>',
                r'<meta\s+(?:property|name)="(?:og|twitter):[^"]*"[^>]*>', r'<!--\s*Open Graph[^>]*?-->']:
        html = re.sub(r'[ \t]*' + pat + r'[ \t]*\n?', '', html, flags=re.S)
    img = C.BASE_URL + 'shared/og-cover.png'
    block = '\n'.join('    ' + l for l in [
        '<meta name="description" content="%s">' % esc(desc),
        '<meta name="theme-color" content="#D63B1D">',
        '<link rel="canonical" href="%s">' % C.BASE_URL,
        '<link rel="icon" type="image/svg+xml" href="shared/favicon.svg">',
        '<!-- Open Graph / 社交分享（微信、钉钉、Telegram 等）。部署域名变更时改 tools/dm/catalog.py 的 BASE_URL 后重新运行 apply_catalog.py -->',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="%s · %s">' % (C.SITE_NAME, C.ORG),
        '<meta property="og:locale" content="zh_CN">',
        '<meta property="og:title" content="%s">' % esc(title),
        '<meta property="og:description" content="%s">' % esc(desc),
        '<meta property="og:url" content="%s">' % C.BASE_URL,
        '<meta property="og:image" content="%s">' % img,
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta property="og:image:alt" content="%s · %s">' % (C.SITE_NAME, C.ORG),
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="%s">' % esc(title),
        '<meta name="twitter:description" content="%s">' % esc(desc),
        '<meta name="twitter:image" content="%s">' % img,
    ]) + '\n'
    m = re.search(r'[ \t]*<meta\s+name="viewport"[^>]*>[ \t]*\n', html)
    assert m
    html = html[:m.start()] + block + html[m.start():]

    # 2. CSS
    if 'DM:HOME-EXT' in html:
        html = re.sub(r'\n        /\* DM:HOME-EXT.*?(?=\n    </style>)', CSS.rstrip('\n'), html, flags=re.S)
    else:
        html = html.replace('\n    </style>', CSS.rstrip('\n') + '\n    </style>', 1)

    # 3. 目录区块
    start = html.index('<!-- 课程模块导航')
    m_end = re.search(r'\n    </(?:div|main)>\n\n    <!-- 页脚版权 -->', html)
    end = m_end.start()
    html = html[:start] + section_html(info, ids).lstrip(' ') + html[end:]

    # 4. 搜索框：无障碍 + 状态行；进度条
    html = re.sub(r'<input type="text" class="search-input" id="searchInput"[^>]*>',
                  '<input type="search" class="search-input" id="searchInput" autocomplete="off" aria-label="搜索章节、案例或知识点" '
                  'placeholder="搜索章节、案例或知识点，例如 容斥、图论、密钥生成…（按 / 快速聚焦）">', html)
    html = html.replace('<button class="search-button" onclick="searchContent()" aria-label="搜索">搜索</button>',
                        '<button type="button" class="search-button" onclick="searchContent()" aria-label="搜索">搜索</button>')
    html = re.sub(r'\n[ \t]*<div class="progress-line"><div class="progress-bar"[^\n]*</div>(?=\n[ \t]*</div>\n\n[ \t]*<!-- 三阶层次导览)', '', html)
    if 'id="searchStatus"' not in html:
        html = html.replace('''            </div>
        </div>

        <!-- 三阶层次导览 -->''', '''            </div>
            <div class="search-status" id="searchStatus" role="status" aria-live="polite"></div>
        </div>

        <!-- 三阶层次导览 -->''', 1)
    assert 'id="searchStatus"' in html

    # 5. 统计数字（静态输出，不再依赖脚本换算）
    html = re.sub(r'(<span class="stat-number" id="caseCount">)\d+(</span>)', r'\g<1>%d\g<2>' % (total * 3), html)
    html = re.sub(r'122 个课程入口统一按基础层', '%d 个课程入口统一按基础层' % total, html)
    html = re.sub(r'共 \d+ 个三阶案例页', '共 %d 个三阶案例页' % (total * 3), html)
    html = re.sub(r'\d+ 个知识单元 × 3 阶层 = \d+ 个案例页', '%d 个知识单元 × 3 阶层 = %d 个案例页' % (total, total * 3), html)

    # 5b. 语义化地标与键盘跳转链接（幂等）
    html = html.replace('<div class="hero-banner">', '<header class="hero-banner">', 1)
    html = re.sub(r'(<header class="hero-banner">.*?\n    </)div(>\n\n    <!-- 主内容区 -->)', r'\g<1>header\g<2>', html, count=1, flags=re.S)
    html = html.replace('<div class="container">', '<main class="container" id="main">', 1)
    html = re.sub(r'\n    </div>\n\n    <!-- 页脚版权 -->', '\n    </main>\n\n    <!-- 页脚版权 -->', html, count=1)
    html = html.replace('<div class="footer">', '<footer class="footer">', 1)
    html = re.sub(r'(<footer class="footer">.*?\n    </)div(>\n\n    <script>)', r'\g<1>footer\g<2>', html, count=1, flags=re.S)
    if 'class="skip-link"' not in html:
        html = html.replace('<body>', '<body>\n    <a class="skip-link" href="#modules">跳到课程目录</a>', 1)

    # 6. 脚本
    js = JS.replace('__TOTAL__', str(total))
    s0 = html.rindex('    <script>')
    s1 = html.rindex('</script>') + len('</script>')
    html = html[:s0] + '    <script>' + js + '    </script>' + html[s1:]

    if html != src:
        if not check:
            open(p, 'w', encoding='utf-8', newline='\n').write(html)
        return True
    return False
