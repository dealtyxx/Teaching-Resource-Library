/* =============================================================================
 * site-shell.js —— 离散数学课程资源库 · 全站统一页面外壳
 * -----------------------------------------------------------------------------
 * 每个小节页只需引入这一个脚本，即可获得全站一致的：
 *   1. 「返回课程主页」浮标规范化（文案、样式类统一）；
 *   2. 顶部面包屑补全（章节可点回主页对应章、案例页带「案例」徽标）；
 *   3. 左下角导航坞：上一节 · 课程目录 · 下一节（保持当前所在层：基础/进阶/拓展）；
 *   4. 课程目录抽屉：11 章 122 个小节，案例标记、三阶层直达、筛选、已学足迹；
 *   5. 学习足迹：仅存于浏览器 localStorage（dm_visited_v1），不上传任何数据。
 * 章节数据来自 shared/catalog.js（由 tools/dm/apply_catalog.py 生成），本脚本自动按需加载。
 * 与 ai-tutor.js 互不依赖：有它则复用其面包屑，无则自行创建。
 * © 2025-2026 湖南信息学院 · 计算机科学与工程课程资源库建设团队 · 负责人：谢鑫
 * ========================================================================== */
(function () {
  'use strict';
  if (window.__DM_SHELL__) return;
  window.__DM_SHELL__ = true;

  var TIER_NAMES = ['基础层', '进阶层', '拓展层'];
  var TIER_SHORT = ['基', '进', '拓'];
  var LS_VISITED = 'dm_visited_v1';

  /* ---------- 0. 路径解析 ---------- */
  var selfScript = document.currentScript ||
    (function () { var s = document.querySelectorAll('script[src*="site-shell.js"]'); return s[s.length - 1]; })();
  var SRC = selfScript ? selfScript.src : '';
  var SHARED = SRC.replace(/site-shell\.js(\?.*)?$/, '') || '../../shared/';
  var ROOT = SHARED.replace(/shared\/$/, '');
  var QUERY = (SRC.match(/\?.*$/) || [''])[0];

  function relPath() {
    try {
      var root = decodeURIComponent(new URL(ROOT, location.href).pathname);
      var p = decodeURIComponent(location.pathname);
      if (p.indexOf(root) !== 0) return '';
      p = p.slice(root.length);
      return p === '' || /\/$/.test(p) ? p + 'index.html' : p;
    } catch (e) { return ''; }
  }
  function href(rel) { return ROOT + rel.split('/').map(encodeURIComponent).join('/'); }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---------- 1. 学习足迹 ---------- */
  function readVisited() { try { return JSON.parse(localStorage.getItem(LS_VISITED) || '{}') || {}; } catch (e) { return {}; } }
  function markVisited(uid, tier) {
    try {
      var v = readVisited();
      v[uid] = (v[uid] || 0) | (1 << tier);
      localStorage.setItem(LS_VISITED, JSON.stringify(v));
    } catch (e) { /* 隐私模式等：忽略 */ }
  }

  /* ---------- 2. 目录加载 ---------- */
  function withCatalog(cb) {
    if (window.DM_CATALOG) return cb(window.DM_CATALOG);
    var s = document.createElement('script');
    s.src = SHARED + 'catalog.js' + QUERY;
    s.onload = function () { if (window.DM_CATALOG) cb(window.DM_CATALOG); };
    document.head.appendChild(s);
  }

  function locate(cat, rel) {
    for (var i = 0; i < cat.units.length; i++) {
      var pg = cat.units[i].pages;
      for (var t = 0; t < pg.length; t++) if (pg[t] === rel) return { i: i, t: t };
    }
    return null;
  }
  function unitLabel(u) { return u.num + ' ' + u.name + (u.part ? ' · ' + u.part : ''); }
  function chapterName(cat, n) { for (var i = 0; i < cat.chapters.length; i++) if (cat.chapters[i].n === n) return cat.chapters[i].name; return ''; }

  /* ---------- 3. 「返回课程主页」浮标 ---------- */
  function fixHomeLink() {
    var nodes = document.querySelectorAll('a.home-link, a.mst-home-link, a[title="返回课程主页"]');
    if (!nodes.length) {
      var a = el('a', 'home-link', '← 返回课程主页');
      a.href = ROOT + 'index.html';
      document.body.insertBefore(a, document.body.firstChild);
      nodes = [a];
    }
    Array.prototype.forEach.call(nodes, function (a) {
      a.classList.add('home-link');
      if (a.textContent.replace(/\s+/g, '') !== '←返回课程主页') a.textContent = '← 返回课程主页';
      a.setAttribute('title', '返回课程主页');
    });
  }

  /* ---------- 4. 面包屑 ---------- */
  function fixCrumb(cat, loc) {
    var u = cat.units[loc.i];
    var crumb = document.getElementById('dm-crumb');
    var chHref = ROOT + 'index.html#chapter' + u.ch;
    var label = unitLabel(u) + ' · ' + TIER_NAMES[loc.t];
    if (!crumb) {
      crumb = el('div');
      crumb.id = 'dm-crumb';
      crumb.innerHTML = '<a class="dm-cb-ch"></a><span class="dm-cb-sep">›</span><span class="dm-cb-sec"></span>';
      document.body.insertBefore(crumb, document.body.firstChild);
    }
    var ch = crumb.querySelector('.dm-cb-ch');
    if (ch) {
      if (ch.tagName !== 'A') { var a = el('a', 'dm-cb-ch'); ch.parentNode.replaceChild(a, ch); ch = a; }
      ch.textContent = '第' + u.ch + '章 ' + chapterName(cat, u.ch);
      ch.href = chHref;
      ch.title = '回到课程主页的本章目录';
    }
    var sec = crumb.querySelector('.dm-cb-sec');
    if (sec) sec.textContent = label;
    if (u.case && !crumb.querySelector('.dm-cb-case')) {
      var badge = el('span', 'dm-cb-case', '案例');
      crumb.appendChild(badge);
    }
  }

  /* ---------- 5. 导航坞 + 目录抽屉 ---------- */
  function neighbor(cat, i, step, tier) {
    var j = i + step;
    if (j < 0 || j >= cat.units.length) return null;
    var pg = cat.units[j].pages;
    return { u: cat.units[j], rel: pg[tier] || pg[1] };
  }

  function buildDock(cat, loc) {
    if (document.getElementById('dm-nav')) return;
    var u = cat.units[loc.i];
    var prev = neighbor(cat, loc.i, -1, loc.t), next = neighbor(cat, loc.i, 1, loc.t);
    var nav = el('nav', 'dm-nav');
    nav.id = 'dm-nav';
    nav.setAttribute('aria-label', '章节导航');

    function link(cls, n, ic, tx, word) {
      var a = el('a', 'dm-nav-btn ' + cls);
      if (n) {
        a.href = href(n.rel);
        a.title = word + '：' + unitLabel(n.u);
        a.setAttribute('aria-label', word + '：' + unitLabel(n.u));
      } else {
        a.setAttribute('aria-disabled', 'true');
        a.setAttribute('tabindex', '-1');
        a.title = word === '上一节' ? '已是第一节' : '已是最后一节';
      }
      a.innerHTML = cls.indexOf('prev') > -1
        ? '<span class="dm-nav-ic" aria-hidden="true">' + ic + '</span><span class="dm-nav-tx">' + tx + '</span>'
        : '<span class="dm-nav-tx">' + tx + '</span><span class="dm-nav-ic" aria-hidden="true">' + ic + '</span>';
      return a;
    }
    nav.appendChild(link('dm-nav-prev', prev, '‹', '上一节', '上一节'));
    var toc = el('button', 'dm-nav-btn dm-nav-toc', '<span class="dm-nav-ic" aria-hidden="true">☰</span><span class="dm-nav-tx">目录</span>');
    toc.type = 'button';
    toc.setAttribute('aria-haspopup', 'dialog');
    toc.setAttribute('aria-expanded', 'false');
    toc.title = '打开课程目录';
    nav.appendChild(toc);
    nav.appendChild(link('dm-nav-next', next, '›', '下一节', '下一节'));
    document.body.appendChild(nav);
    var spacer = el('div', 'dm-nav-spacer');   // 手机端给页脚留出导航坞高度，避免遮挡
    spacer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(spacer);

    var drawer = null;
    toc.addEventListener('click', function () {
      if (!drawer) drawer = buildDrawer(cat, loc, toc);
      drawer.open();
    });
  }

  function buildDrawer(cat, loc, opener) {
    var visited = readVisited();
    var mask = el('div', 'dm-toc-mask');
    var box = el('aside', 'dm-toc');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', '课程目录');
    mask.hidden = true; box.hidden = true;

    var head = el('div', 'dm-toc-head',
      '<div><b>课程目录</b><span>11 章 · ' + cat.units.length + ' 个小节 · ' + (cat.units.length * 3) + ' 个三阶页面</span></div>');
    var close = el('button', 'dm-toc-close', '✕');
    close.type = 'button'; close.setAttribute('aria-label', '关闭目录');
    head.appendChild(close);
    box.appendChild(head);

    var search = el('input', 'dm-toc-search');
    search.type = 'search';
    search.placeholder = '筛选小节，如 图、群、案例…';
    search.setAttribute('aria-label', '筛选小节');
    box.appendChild(search);

    var body = el('div', 'dm-toc-body');
    var cur = cat.units[loc.i];
    var doneTotal = 0;
    cat.chapters.forEach(function (c) {
      var det = el('details', 'dm-toc-ch');
      det.open = c.n === cur.ch;
      var units = cat.units.filter(function (u) { return u.ch === c.n; });
      var done = units.filter(function (u) { return visited[u.id]; }).length;
      doneTotal += done;
      var sum = el('summary', '', '<span>第' + c.n + '章 ' + esc(c.name) + '</span><em>' + done + '/' + units.length + '</em>');
      det.appendChild(sum);
      var ul = el('ul');
      units.forEach(function (u) {
        var idx = cat.units.indexOf(u);
        var isCur = idx === loc.i;
        var li = el('li', isCur ? 'dm-toc-cur' : '');
        li.setAttribute('data-q', (u.num + ' ' + u.name + ' ' + (u.part || '') + ' ' + (u.case ? '案例 应用' : '') + ' ' +
          u.tiers.map(function (t) { return t.name + ' ' + t.concepts; }).join(' ')).toLowerCase());
        var main = el('a', 'dm-toc-main', '<span class="dm-toc-num">' + esc(u.num) + '</span><span class="dm-toc-name">' +
          esc(u.name) + (u.part ? '<i> · ' + esc(u.part) + '</i>' : '') + '</span>' + (u.case ? '<em class="dm-toc-case">案例</em>' : ''));
        main.href = href(u.pages[loc.t] || u.pages[1]);
        if (isCur) main.setAttribute('aria-current', 'page');
        li.appendChild(main);
        var tiers = el('span', 'dm-toc-tiers');
        for (var t = 0; t < 3; t++) {
          var a = el('a', 'dm-toc-tier' + ((visited[u.id] || 0) & (1 << t) ? ' done' : '') + (isCur && t === loc.t ? ' cur' : ''), TIER_SHORT[t]);
          a.href = href(u.pages[t]);
          a.title = TIER_NAMES[t] + '：' + (u.tiers[t] ? u.tiers[t].name : '');
          a.setAttribute('aria-label', unitLabel(u) + ' ' + TIER_NAMES[t]);
          tiers.appendChild(a);
        }
        li.appendChild(tiers);
        ul.appendChild(li);
      });
      det.appendChild(ul);
      body.appendChild(det);
    });
    box.appendChild(body);

    var foot = el('div', 'dm-toc-foot');
    foot.innerHTML = '<a href="' + ROOT + 'index.html">← 返回课程主页</a><span>已学 ' + doneTotal + '/' + cat.units.length + ' 节 · 足迹仅保存在本机</span>';
    box.appendChild(foot);

    document.body.appendChild(mask);
    document.body.appendChild(box);

    function applyFilter() {
      var q = search.value.trim().toLowerCase();
      Array.prototype.forEach.call(body.querySelectorAll('details'), function (d) {
        var any = false;
        Array.prototype.forEach.call(d.querySelectorAll('li'), function (li) {
          var hit = !q || li.getAttribute('data-q').indexOf(q) > -1;
          li.hidden = !hit;
          any = any || hit;
        });
        d.hidden = !any;
        if (q && any) d.open = true;
      });
    }
    search.addEventListener('input', applyFilter);

    function focusables() { return box.querySelectorAll('a[href], button, input, summary'); }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); api.close(); return; }
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(focusables(), function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    var api = {
      open: function () {
        mask.hidden = false; box.hidden = false;
        requestAnimationFrame(function () { mask.classList.add('on'); box.classList.add('on'); });
        opener.setAttribute('aria-expanded', 'true');
        document.addEventListener('keydown', onKey);
        var curEl = box.querySelector('.dm-toc-cur');
        if (curEl && curEl.scrollIntoView) curEl.scrollIntoView({ block: 'center' });
        setTimeout(function () { search.focus({ preventScroll: true }); }, 60);
      },
      close: function () {
        mask.classList.remove('on'); box.classList.remove('on');
        opener.setAttribute('aria-expanded', 'false');
        document.removeEventListener('keydown', onKey);
        setTimeout(function () { mask.hidden = true; box.hidden = true; }, 220);
        opener.focus({ preventScroll: true });
      }
    };
    close.addEventListener('click', api.close);
    mask.addEventListener('click', api.close);
    return api;
  }

  /* ---------- 6. 启动 ---------- */
  var booted = false;
  function boot() {
    fixHomeLink();
    var rel = relPath();
    if (!rel || rel === 'index.html') return;
    withCatalog(function (cat) {
      var loc = locate(cat, rel);
      if (!loc) return;
      if (!booted) { booted = true; markVisited(cat.units[loc.i].id, loc.t); }
      fixCrumb(cat, loc);
      buildDock(cat, loc);
    });
  }
  function start() {
    boot();
    // 各小节脚本、ai-tutor.js 可能在稍后才注入浮标/面包屑，补跑两次（操作均幂等）
    window.addEventListener('load', function () { setTimeout(boot, 0); setTimeout(boot, 900); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
