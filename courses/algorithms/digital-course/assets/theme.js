/* ============================================================
   算法设计与分析 · 交互课程 统一外壳
   theme.js — 主题切换 / 命令面板 / 学习进度 / 快捷键
   依赖 sitemap.js（window.CC_SITE），无第三方库，离线可用
   ============================================================ */
(function () {
  'use strict';
  if (window.__CC_SHELL__) return;
  window.__CC_SHELL__ = 1;

  /* ---------- 全局访问统计（本机浏览器累计 · 离线 · 无第三方）---------- */
  var CC_VK = 'cc.visits';
  try {
    var __raw = localStorage.getItem(CC_VK);
    var __n = (__raw ? (parseInt(JSON.parse(__raw), 10) || 0) : 0) + 1;
    localStorage.setItem(CC_VK, JSON.stringify(__n));
    window.CC_VISITS = __n;                       // 全局访问统计变量
    var __renderVisits = function () {
      var el = document.getElementById('cc-visits');
      if (el) el.textContent = __n.toLocaleString('zh-CN');
    };
    if (document.readyState !== 'loading') __renderVisits();
    else document.addEventListener('DOMContentLoaded', __renderVisits);
  } catch (e) { window.CC_VISITS = window.CC_VISITS || 1; }

  var SITE = window.CC_SITE || [];
  var doc = document, root = doc.documentElement, body = doc.body;

  /* ---------- 路径推断 ---------- */
  var path = decodeURIComponent(location.pathname.replace(/\\/g, '/'));
  var parts = path.split('/').filter(Boolean);
  var file = parts[parts.length - 1] || 'index.html';
  var dirName = parts.length >= 3 ? parts[parts.length - 3] : '';
  var chapter = null;
  for (var i = 0; i < SITE.length; i++) if (SITE[i].dir === dirName) chapter = SITE[i];
  var isPortal = !chapter;
  var isChapterIndex = !!chapter && file === 'index.html';
  var base = isPortal ? '' : '../../';
  var section = null, secIdx = -1;
  if (chapter && !isChapterIndex) {
    for (var j = 0; j < chapter.secs.length; j++)
      if (chapter.secs[j].f === file) { section = chapter.secs[j]; secIdx = j; }
  }

  /* ---------- 存储 ---------- */
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem('cc.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('cc.' + k, JSON.stringify(v)); } catch (e) { } }
  };

  /* ---------- 主题 ---------- */
  var Theme = {
    get: function () { return LS.get('theme', 'auto'); },
    apply: function (t) {
      var eff = t === 'auto'
        ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : t;
      root.setAttribute('data-theme', eff);
      root.setAttribute('data-theme-pref', t);
    },
    set: function (t) { LS.set('theme', t); Theme.apply(t); },
    cycle: function () {
      var order = ['light', 'dark', 'auto'], cur = Theme.get();
      var next = order[(order.indexOf(cur) + 1) % order.length];
      Theme.set(next);
      toast(next === 'auto' ? '主题：跟随系统' : next === 'dark' ? '主题：深色' : '主题：浅色');
      syncTools();
    }
  };
  Theme.apply(Theme.get());
  try {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (Theme.get() === 'auto') Theme.apply('auto');
    });
  } catch (e) { }

  /* ---------- 学习进度 ---------- */
  var Prog = {
    all: function () { return LS.get('visited', {}); },
    key: function (c, f) { return c + '/' + f; },
    seen: function (c, f) { return !!Prog.all()[Prog.key(c, f)]; },
    mark: function (c, f) { var a = Prog.all(); a[Prog.key(c, f)] = Date.now(); LS.set('visited', a); },
    chapterDone: function (ch) {
      var a = Prog.all(), n = 0;
      for (var i = 0; i < ch.secs.length; i++) if (a[Prog.key(ch.dir, ch.secs[i].f)]) n++;
      return n;
    },
    total: function () { var t = 0; for (var i = 0; i < SITE.length; i++) t += SITE[i].secs.length; return t; },
    doneAll: function () { var t = 0; for (var i = 0; i < SITE.length; i++) t += Prog.chapterDone(SITE[i]); return t; },
    reset: function () { LS.set('visited', {}); }
  };
  if (chapter && section) Prog.mark(chapter.dir, section.f);

  /* ---------- 小工具 ---------- */
  function el(tag, cls, html) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) { toastEl = el('div', 'cc-toast'); body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 1600);
  }
  function href(chDir, f) { return base + (chDir ? encodeURI(chDir) + '/interactive/' + f : 'index.html'); }

  /* ---------- 顶部阅读进度 ---------- */
  var prog = el('div'); prog.id = 'cc-prog'; body.appendChild(prog);
  var nav = doc.querySelector('.nav');
  function onScroll() {
    var h = doc.documentElement.scrollHeight - innerHeight;
    var p = h > 0 ? Math.min(1, scrollY / h) : 0;
    prog.style.width = (p * 100).toFixed(2) + '%';
    if (nav) nav.classList.toggle('cc-stuck', scrollY > 6);
    if (topBtn) topBtn.classList.toggle('on', scrollY > 500);
  }

  /* ---------- 章节面包屑 + 小节进度 ---------- */
  if (chapter && !isChapterIndex) {
    var bar = el('div', 'cc-secbar');
    var crumb = el('div', 'crumb');
    crumb.innerHTML =
      '<a href="' + base + 'index.html">课程总览</a><span class="sp">/</span>' +
      '<a href="' + href(chapter.dir, 'index.html') + '">第' + chapter.n + '章 ' + chapter.name + '</a>' +
      '<span class="sp">/</span><span class="cur">' + (section ? section.label : file) + '</span>';
    bar.appendChild(crumb);
    var cnt = el('span', 'cnt', (secIdx + 1) + ' / ' + chapter.secs.length + ' 节');
    var dots = el('div', 'dots');
    chapter.secs.forEach(function (s, k) {
      var d = el('i');
      d.title = s.label;
      if (k === secIdx) d.className = 'cur';
      else if (Prog.seen(chapter.dir, s.f)) d.className = 'done';
      d.onclick = function () { location.href = href(chapter.dir, s.f); };
      dots.appendChild(d);
    });
    dots.appendChild(cnt);
    bar.appendChild(dots);
    var wrap = doc.querySelector('.wrap');
    if (wrap) wrap.insertBefore(bar, wrap.firstChild);
  }

  /* 章节总览页：面包屑 + 本章进度 + 已学小节打勾 */
  if (isChapterIndex && chapter) {
    var cbar = el('div', 'cc-secbar');
    var cdone = Prog.chapterDone(chapter), ctotal = chapter.secs.length;
    var ccrumb = el('div', 'crumb');
    ccrumb.innerHTML =
      '<a href="' + base + 'index.html">课程总览</a><span class="sp">/</span>' +
      '<span class="cur">第' + chapter.n + '章 ' + chapter.name + '</span>';
    cbar.appendChild(ccrumb);
    var cdots = el('div', 'dots');
    chapter.secs.forEach(function (s) {
      var d = el('i');
      d.title = s.label;
      if (Prog.seen(chapter.dir, s.f)) d.className = 'done';
      d.onclick = function () { location.href = href(chapter.dir, s.f); };
      cdots.appendChild(d);
    });
    cdots.appendChild(el('span', 'cnt', '已学 ' + cdone + ' / ' + ctotal + ' 节'));
    cbar.appendChild(cdots);
    var cwrap = doc.querySelector('.wrap');
    if (cwrap) cwrap.insertBefore(cbar, cwrap.firstChild);

    setTimeout(function () {
      doc.querySelectorAll('a.feature-card[href]').forEach(function (a) {
        var f = a.getAttribute('href').split('/').pop();
        if (Prog.seen(chapter.dir, f)) a.classList.add('cc-done');
      });
    }, 0);
  }
  /* 顶部导航：已学小节标记 */
  if (chapter) {
    doc.querySelectorAll('.nav a.pill[href]').forEach(function (a) {
      var f = a.getAttribute('href').split('/').pop();
      if (f !== 'index.html' && Prog.seen(chapter.dir, f) && !a.classList.contains('active'))
        a.classList.add('cc-done');
    });
  }

  /* ---------- 代码块复制 ---------- */
  doc.querySelectorAll('.code').forEach(function (c) {
    if (c.parentElement && c.parentElement.classList.contains('cc-codewrap')) return;
    var w = el('div', 'cc-codewrap');
    c.parentNode.insertBefore(w, c);
    w.appendChild(c);
    var b = el('button', 'cc-copy', '复制');
    b.type = 'button';
    b.onclick = function () {
      var t = c.innerText;
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast('代码已复制'); });
      else {
        var ta = el('textarea'); ta.value = t; body.appendChild(ta); ta.select();
        try { doc.execCommand('copy'); toast('代码已复制'); } catch (e) { }
        body.removeChild(ta);
      }
    };
    w.appendChild(b);
  });

  /* ---------- 自测题交互 ---------- */
  doc.querySelectorAll('.quiz-item').forEach(function (q) {
    var exp = q.querySelector('.quiz-exp');
    q.querySelectorAll('.quiz-opt').forEach(function (o) {
      o.setAttribute('role', 'button');
      o.setAttribute('tabindex', '0');
      function pick() {
        if (q.dataset.done) return;
        q.dataset.done = '1';
        q.querySelectorAll('.quiz-opt').forEach(function (x) {
          if (x.dataset.ok === '1') x.classList.add('right');
        });
        if (o.dataset.ok !== '1') o.classList.add('wrong');
        if (exp) exp.classList.add('on');
      }
      o.onclick = pick;
      o.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } };
    });
  });

  /* ---------- 回到顶部 ---------- */
  var topBtn = el('button', 'cc-top', '↑');
  topBtn.type = 'button';
  topBtn.title = '回到顶部';
  topBtn.setAttribute('aria-label', '回到顶部');
  topBtn.onclick = function () { scrollTo({ top: 0, behavior: 'smooth' }); };
  body.appendChild(topBtn);

  /* ---------- 工具条 ---------- */
  var tools = el('div', 'cc-tools');
  tools.innerHTML =
    '<button type="button" data-a="search" title="搜索全站 (Ctrl+K)" aria-label="搜索">⌕</button>' +
    '<button type="button" data-a="theme" title="切换主题 (T)" aria-label="切换主题">◐</button>' +
    '<span class="sep"></span>' +
    '<button type="button" data-a="prev" title="上一节 (←)" aria-label="上一节">‹</button>' +
    '<button type="button" data-a="next" title="下一节 (→)" aria-label="下一节">›</button>' +
    '<span class="sep"></span>' +
    '<button type="button" data-a="focus" title="专注模式 (Z)" aria-label="专注模式">◎</button>' +
    '<button type="button" data-a="full" title="全屏投影 (F)" aria-label="全屏">⛶</button>' +
    '<button type="button" data-a="help" title="快捷键 (?)" aria-label="帮助">?</button>';
  body.appendChild(tools);

  function syncTools() {
    var t = Theme.get();
    var tb = tools.querySelector('[data-a="theme"]');
    tb.textContent = t === 'dark' ? '☾' : t === 'light' ? '☀' : '◐';
    tb.title = '主题：' + (t === 'auto' ? '跟随系统' : t === 'dark' ? '深色' : '浅色') + ' (T)';
    tools.querySelector('[data-a="focus"]').classList.toggle('on', body.classList.contains('cc-focus'));
  }

  /* ---------- 上一节 / 下一节 ---------- */
  function neighbour(dir) {
    if (!chapter) {
      return dir > 0 && SITE.length ? href(SITE[0].dir, 'index.html') : null;
    }
    var list = [{ f: 'index.html', label: '章节总览' }].concat(chapter.secs);
    var cur = 0;
    for (var k = 0; k < list.length; k++) if (list[k].f === file) cur = k;
    var t = cur + dir;
    if (t >= 0 && t < list.length) return href(chapter.dir, list[t].f);
    /* 跨章 */
    var ci = SITE.indexOf(chapter);
    if (t < 0) {
      if (ci <= 0) return base + 'index.html';
      var p = SITE[ci - 1];
      return href(p.dir, p.secs.length ? p.secs[p.secs.length - 1].f : 'index.html');
    }
    if (ci >= SITE.length - 1) return base + 'index.html';
    return href(SITE[ci + 1].dir, 'index.html');
  }
  function go(dir) { var u = neighbour(dir); if (u) location.href = u; }

  /* ---------- 全屏 ---------- */
  function toggleFull() {
    if (!doc.fullscreenElement) { if (root.requestFullscreen) root.requestFullscreen(); }
    else if (doc.exitFullscreen) doc.exitFullscreen();
  }

  /* ---------- 帮助 ---------- */
  var help = el('div', 'cc-modal');
  help.innerHTML =
    '<div class="mbox" role="dialog" aria-label="快捷键">' +
    '<h3>课堂快捷键</h3><div class="msub">投影授课与自学通用</div><table>' +
    '<tr><td><span class="kbd">Ctrl</span> <span class="kbd">K</span></td><td>打开全站搜索 · 跳到任意小节</td></tr>' +
    '<tr><td><span class="kbd">←</span> <span class="kbd">→</span></td><td>上一节 / 下一节（跨章自动衔接）</td></tr>' +
    '<tr><td><span class="kbd">Space</span></td><td>运行本页主演示</td></tr>' +
    '<tr><td><span class="kbd">F</span></td><td>全屏投影</td></tr>' +
    '<tr><td><span class="kbd">Z</span></td><td>专注模式（淡化导航）</td></tr>' +
    '<tr><td><span class="kbd">T</span></td><td>浅色 / 深色 / 跟随系统</td></tr>' +
    '<tr><td><span class="kbd">+</span></td><td>投影放大（加大正文字号）</td></tr>' +
    '<tr><td><span class="kbd">1</span> <span class="kbd">2</span> <span class="kbd">4</span></td><td>演示速度 1× 2× 4×</td></tr>' +
    '<tr><td><span class="kbd">G</span></td><td>回到本章总览</td></tr>' +
    '<tr><td><span class="kbd">Esc</span></td><td>关闭浮层 / 退出全屏</td></tr>' +
    '</table><button type="button" class="close">知道了</button></div>';
  body.appendChild(help);
  help.querySelector('.close').onclick = function () { help.classList.remove('on'); };
  help.onclick = function (e) { if (e.target === help) help.classList.remove('on'); };

  /* ---------- 命令面板 ---------- */
  var pal = el('div', 'cc-palette');
  pal.innerHTML =
    '<div class="pbox" role="dialog" aria-label="全站搜索">' +
    '<input type="search" placeholder="搜索小节、算法、关键词…  例：背包、Dijkstra、复杂度" aria-label="搜索" autocomplete="off" spellcheck="false"/>' +
    '<div class="plist"></div>' +
    '<div class="pfoot"><span><kbd>↑↓</kbd>选择</span><span><kbd>Enter</kbd>打开</span><span><kbd>Esc</kbd>关闭</span></div>' +
    '</div>';
  body.appendChild(pal);
  var palInput = pal.querySelector('input'), palList = pal.querySelector('.plist');

  var INDEX = [];
  SITE.forEach(function (c) {
    INDEX.push({
      t: '第' + c.n + '章 · ' + c.name, s: c.sub, ico: c.ico,
      u: href(c.dir, 'index.html'), g: '章节总览',
      k: (c.name + ' ' + c.sub + ' ' + c.kw + ' 第' + c.n + '章').toLowerCase(), ch: c.dir, f: 'index.html'
    });
    c.secs.forEach(function (s) {
      INDEX.push({
        t: s.title, s: '第' + c.n + '章 · ' + c.name + ' · ' + s.label, ico: c.ico,
        u: href(c.dir, s.f), g: '第' + c.n + '章 ' + c.name,
        k: (s.title + ' ' + s.label + ' ' + s.desc + ' ' + c.kw + ' ' + c.name).toLowerCase(),
        ch: c.dir, f: s.f
      });
    });
  });
  var ACTIONS = [
    { t: '课程总览', s: '返回门户首页', ico: '⌂', a: function () { location.href = base + 'index.html'; }, k: '总览 首页 门户 home' },
    { t: '切换深色 / 浅色主题', s: '当前：' + Theme.get(), ico: '◐', a: Theme.cycle, k: '主题 深色 浅色 夜间 theme dark' },
    { t: '全屏投影', s: '进入或退出全屏', ico: '⛶', a: toggleFull, k: '全屏 投影 fullscreen' },
    { t: '专注模式', s: '淡化导航，突出演示', ico: '◎', a: function () { body.classList.toggle('cc-focus'); syncTools(); }, k: '专注 focus 投影' },
    { t: '投影放大', s: '加大正文字号，后排也看得清', ico: '⊕', a: function () { body.classList.toggle('cc-zoom'); }, k: '放大 字号 zoom 投影' },
    { t: '清除学习进度', s: '重置全部已学标记', ico: '↺', a: function () { Prog.reset(); toast('学习进度已清除'); setTimeout(function () { location.reload(); }, 600); }, k: '清除 重置 进度 reset' }
  ];

  function score(item, q) {
    var k = item.k, t = (item.t || '').toLowerCase();
    if (!q) return 1;
    if (t.indexOf(q) === 0) return 100;
    if (t.indexOf(q) >= 0) return 80;
    if (k.indexOf(q) >= 0) return 50;
    /* 松散子序列匹配 */
    var i = 0;
    for (var c = 0; c < k.length && i < q.length; c++) if (k[c] === q[i]) i++;
    return i === q.length ? 10 : 0;
  }
  var palRows = [], palSel = 0;
  function renderPal() {
    var q = palInput.value.trim().toLowerCase();
    var hits = [];
    ACTIONS.forEach(function (a) { var sc = score(a, q); if (sc) hits.push({ o: a, sc: sc + 5, grp: '操作' }); });
    INDEX.forEach(function (o) { var sc = score(o, q); if (sc) hits.push({ o: o, sc: sc, grp: o.g }); });
    hits.sort(function (a, b) { return b.sc - a.sc; });
    hits = hits.slice(0, 40);
    palList.innerHTML = '';
    palRows = [];
    if (!hits.length) {
      palList.innerHTML = '<div class="pempty">没有匹配结果<br/>试试「背包」「最短路」「复杂度」「凸包」</div>';
      return;
    }
    var lastGrp = null;
    hits.forEach(function (h) {
      if (h.grp !== lastGrp) { lastGrp = h.grp; palList.appendChild(el('div', 'pgrp', h.grp)); }
      var done = h.o.ch && Prog.seen(h.o.ch, h.o.f);
      var row = el('div', 'pitem',
        '<span class="pico">' + (h.o.ico || '·') + '</span>' +
        '<span class="ptxt"><b>' + h.o.t + '</b><s>' + (h.o.s || '') + '</s></span>' +
        (done ? '<span class="pkey">已学</span>' : ''));
      row.onclick = function () { runPal(h.o); };
      palList.appendChild(row);
      palRows.push({ el: row, o: h.o });
    });
    palSel = 0;
    hi();
  }
  function hi() {
    palRows.forEach(function (r, i) { r.el.classList.toggle('sel', i === palSel); });
    if (palRows[palSel]) {
      var e = palRows[palSel].el, p = palList;
      if (e.offsetTop < p.scrollTop) p.scrollTop = e.offsetTop - 8;
      else if (e.offsetTop + e.offsetHeight > p.scrollTop + p.clientHeight)
        p.scrollTop = e.offsetTop + e.offsetHeight - p.clientHeight + 8;
    }
  }
  function runPal(o) { closePal(); if (o.a) o.a(); else if (o.u) location.href = o.u; }
  function openPal() {
    pal.classList.add('on');
    palInput.value = '';
    renderPal();
    setTimeout(function () { palInput.focus(); }, 30);
  }
  function closePal() { pal.classList.remove('on'); }
  palInput.addEventListener('input', renderPal);
  pal.onclick = function (e) { if (e.target === pal) closePal(); };
  palInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); palSel = Math.min(palRows.length - 1, palSel + 1); hi(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); palSel = Math.max(0, palSel - 1); hi(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (palRows[palSel]) runPal(palRows[palSel].o); }
    else if (e.key === 'Escape') { e.preventDefault(); closePal(); }
  });

  /* ---------- 主演示按钮 ---------- */
  function firePrimary() {
    var b = doc.querySelector('.btn.primary:not(:disabled), button.primary:not(:disabled), #run, #play, #anim, #start');
    if (b && !b.disabled) { b.click(); return true; }
    return false;
  }
  function setSpeed(s) {
    var list = doc.querySelectorAll('.speed button');
    for (var i = 0; i < list.length; i++) {
      var x = list[i];
      if (x.dataset.s === String(s) || x.textContent.trim().indexOf(String(s)) === 0) { x.click(); return; }
    }
  }

  /* ---------- 工具条动作 ---------- */
  tools.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var a = b.dataset.a;
    if (a === 'search') openPal();
    else if (a === 'theme') Theme.cycle();
    else if (a === 'prev') go(-1);
    else if (a === 'next') go(1);
    else if (a === 'focus') { body.classList.toggle('cc-focus'); syncTools(); }
    else if (a === 'full') toggleFull();
    else if (a === 'help') help.classList.add('on');
  });

  /* ---------- 键盘 ---------- */
  addEventListener('keydown', function (e) {
    var t = e.target, tag = (t && t.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || (t && t.isContentEditable);

    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault(); pal.classList.contains('on') ? closePal() : openPal(); return;
    }
    if (e.key === 'Escape') {
      if (pal.classList.contains('on')) { closePal(); return; }
      if (help.classList.contains('on')) { help.classList.remove('on'); return; }
      if (doc.fullscreenElement && doc.exitFullscreen) doc.exitFullscreen();
      return;
    }
    if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
    if (pal.classList.contains('on')) return;

    switch (e.key) {
      case '/': e.preventDefault(); openPal(); break;
      case 'ArrowLeft': e.preventDefault(); go(-1); break;
      case 'ArrowRight': e.preventDefault(); go(1); break;
      case ' ': if (firePrimary()) e.preventDefault(); break;
      case 'f': case 'F': e.preventDefault(); toggleFull(); break;
      case 'z': case 'Z': e.preventDefault(); body.classList.toggle('cc-focus'); syncTools(); break;
      case 't': case 'T': e.preventDefault(); Theme.cycle(); break;
      case 'g': case 'G': e.preventDefault(); location.href = chapter ? href(chapter.dir, 'index.html') : base + 'index.html'; break;
      case '?': case 'h': case 'H': e.preventDefault(); help.classList.toggle('on'); break;
      case '+': case '=': e.preventDefault(); body.classList.toggle('cc-zoom'); break;
      case '1': case '2': case '4': setSpeed(e.key); break;
    }
  });

  /* ---------- 对外接口（供门户页使用） ---------- */
  window.CC = {
    site: SITE, prog: Prog, theme: Theme, toast: toast,
    openPalette: openPal, href: href, base: base
  };

  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  syncTools();
})();
