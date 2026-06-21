/* =============================================================================
 * ai-tutor.js —— 离散数学课程资源库 · 共享「学习助手」模块（BYO-key 版）
 * -----------------------------------------------------------------------------
 * 一行脚本即可为任意小节叠加：AI 助教（用户自带 DeepSeek 密钥，浏览器直连）
 * + 六步教学流程 + 价值引领 + 反思迁移 + 面包屑导航。
 * 全程纯静态、零后端，可直接挂 GitHub Pages。
 *
 * 设计原则（沿用 alg_base）：
 *   - AI 不是答案机器，而是「情境生成 / 苏格拉底提示 / 错误诊断 / 迁移变式」四角色；
 *     带数学审校护栏，只引导不代答。
 *   - 用户密钥仅存浏览器 localStorage，直连 api.deepseek.com，绝不经过任何第三方服务器。
 *   - 未配置密钥 / 离线 / 出错时，自动降级为内置高质量引导，演示绝不中断。
 *
 * 用法：在小节 HTML 的 </body> 前加
 *   <script>window.SECTION_META = { ...见下方 schema... };</script>
 *   <script src="../../shared/ai-tutor.js" defer></script>
 * © 2025-2026 湖南信息学院 · 计算机科学与工程课程资源库建设团队 · 负责人：谢鑫
 * ========================================================================== */
(function () {
  'use strict';
  if (window.__DM_TUTOR_LOADED__) return;
  window.__DM_TUTOR_LOADED__ = true;

  /* ---------- 0. 解析自身路径，自动加载共享 CSS ---------- */
  var selfScript = document.currentScript ||
    (function () { var s = document.querySelectorAll('script[src*="ai-tutor.js"]'); return s[s.length - 1]; })();
  var SHARED_BASE = selfScript ? selfScript.src.replace(/ai-tutor\.js(\?.*)?$/, '') : '../../shared/';
  (function loadCss() {
    if (document.querySelector('link[data-dm-ui]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = SHARED_BASE + 'discrete-ui.css'; link.setAttribute('data-dm-ui', '1');
    document.head.appendChild(link);
  })();

  var LS_KEY = 'dm_deepseek_key';
  var LS_MODEL = 'dm_deepseek_model';
  var API_URL = 'https://api.deepseek.com/chat/completions';

  /* ---------- 1. 读取/规范 SECTION_META（含路径兜底） ---------- */
  function deriveFromPath() {
    var segs = decodeURIComponent(location.pathname).split('/').filter(Boolean);
    var sec = segs.length >= 2 ? segs[segs.length - 2] : '';
    var ch = segs.length >= 3 ? segs[segs.length - 3] : '';
    return { chapter: ch, section: sec };
  }
  var d = deriveFromPath();
  var META = window.SECTION_META || {};
  META.chapter = META.chapter || d.chapter || '离散数学';
  META.section = META.section || d.section || '';
  META.title = META.title || (document.title || '').split(/[-–|·]/)[0].trim() || META.section;
  META.tier = META.tier || currentTierLabel();
  META.section = normalizeTierText(META.section, META.tier);
  META.title = stripTierText(META.title);
  META.grounding = META.grounding || ('本节主题：' + META.title + '。');
  META.steps = META.steps || DEFAULT_STEPS();
  META.ideology = META.ideology || { title: '价值引领', text: '在严谨的数学推理中体会理性精神与求真态度。', dims: ['科学精神', '严谨求实'] };
  META.reflect = META.reflect || ['本节的核心概念，能否用自己的话讲清它"解决了什么问题"？',
    '若把题目条件改动一处，结论会怎样变化？为什么？',
    '这个方法还能迁移到哪些真实场景？'];
  META.transfer = META.transfer || [];

  function currentTierLabel() {
    var path = decodeURIComponent(location.pathname || '').toLowerCase();
    if (/-basic\.html(?:[?#].*)?$/.test(path)) return '基础层';
    if (/-extend\.html(?:[?#].*)?$/.test(path)) return '拓展层';
    return '进阶层';
  }
  function stripTierText(s) {
    return String(s || '')
      .replace(/\s*[·｜|]\s*(基础层|进阶层|拓展层)\s*/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
  function normalizeTierText(s, tier) {
    var base = stripTierText(s);
    return (base ? base + ' · ' : '') + tier;
  }

  function DEFAULT_STEPS() {
    return [
      { name: '情境引入', desc: '从真实问题出发，激发"为什么要学"的需求。' },
      { name: '对象抽取', desc: '把现实对象抽象成离散数学的研究对象。' },
      { name: '结构建模', desc: '用集合 / 关系 / 逻辑 / 图 / 代数结构刻画规律。' },
      { name: '推理求解', desc: '依据定义与定理进行严格推导或计算。' },
      { name: '程序验证', desc: '用本页交互或代码核验结论，做到可验证。' },
      { name: '迁移反思', desc: '提炼方法，迁移到新结构与新场景。' }
    ];
  }

  /* ---------- 2. AI 角色提示词 + 护栏（移植 alg_base server.py） ---------- */
  var ROLE_LABEL = { scenario: '🎲 情境生成器', hint: '💡 苏格拉底提示器', diagnose: '🔍 错误诊断器', transfer: '🔀 迁移变式生成器', ask: '💬 学习伙伴' };
  var ROLE_PROMPTS = {
    scenario: "你是离散数学课程的『情境生成器』。请围绕本节主题，生成一个贴合该难度的课堂练习场景，包含具体可操作的数据与 3~4 个递进小任务。**只给任务，不给答案**。",
    hint: "你是离散数学课程的『苏格拉底提示器』。学生卡住了。请用 2~4 个递进的引导性问题点拨他，**绝对不要给出最终数值或直接结论**；涉及概念判定时，提醒他回到定义逐条自查。语气鼓励。",
    diagnose: "你是离散数学课程的『错误诊断器』。请按六维评价（情境理解/对象抽象/数学建模/推理计算/工程解释/迁移应用）给出一份自检清单，帮助学生定位本节最可能出错的环节。不要假装看到了学生的具体作答。",
    transfer: "你是离散数学课程的『迁移变式生成器』。请基于本节主题，生成 2~3 个迁移变式题（如改变条件、换更一般的结构、换真实工程场景），引导学生把方法迁移到新结构。**只给题不给解**。",
    ask: "你是离散数学课程的『AI 学习伙伴』。学生就本节提出了一个具体问题。请结合本节知识，用简体中文清晰、准确、循序渐进地解答，必要时给出例子与公式（用 $...$ 或 $$...$$ 包裹 LaTeX）；重在帮助学生真正理解原理。若学生直接索要某道练习的最终数值答案，请讲清方法与步骤、引导其自行算出结果，而非直接报数。"
  };
  var ROLE_TEMP = { scenario: 0.9, hint: 0.6, diagnose: 0.5, transfer: 0.9, ask: 0.5 };
  var GUARD = "重要约束：本节所有数学判定与数值结果，以页面上的确定性交互/教材为权威答案。你的职责是教学引导，不是计算器；请勿编造或断言最终结论与具体数值；如学生问『答案是多少』，请给方法与思路而非直接报数。回答用简体中文，简洁，最多用 4 个小要点。";

  /* ---------- 3. 内置降级引导（无密钥/离线时） ---------- */
  function genericFallback(role) {
    var t = META.title;
    if (META.fallback && META.fallback[role]) {
      var f = META.fallback[role];
      return { lead: f[0], list: f[1] || [] };
    }
    if (role === 'hint') return { lead: '别急着下结论，回到「' + t + '」的定义逐步自检：', list: [
      '这个概念是用来刻画什么现象 / 解决什么问题的？',
      '它成立 / 不成立的判定条件，逐条对照过了吗？',
      '把你的中间步骤写出来，哪一步最没把握？先盯住它。',
      '换一个最简单的小例子手算一遍，结论一致吗？'] };
    if (role === 'scenario') return { lead: '课堂练习（' + t + '）：', list: [
      '① 用本节交互构造一个最小可行实例，记录输入与输出。',
      '② 改动其中一个条件，预测结果会怎样变，再用交互验证。',
      '③ 把你的结论用一句"定义级"的话复述给同桌听。'] };
    if (role === 'transfer') {
      var tlist = (META.transfer && META.transfer.length)
        ? META.transfer.map(function (x) { return typeof x === 'string' ? x : ((x.t ? x.t + '：' : '') + (x.d || '')); })
        : ['把本节对象换成更一般的情形，方法是否仍然成立？',
          '在计算机 / 工程 / 生活中，哪个真实系统正是这个结构的化身？',
          '若规模放大十倍 / 百倍，复杂度与可行性会如何变化？'];
      return { lead: '迁移变式（' + t + '）：', list: tlist };
    }
    return { lead: '错误诊断 · 六维自检清单（对照评价维度定位薄弱环节）：', list: [
      '情境理解(15%)：能说清"为什么需要本节方法"吗？',
      '对象抽象(20%)：现实对象是否正确映射为集合/关系/逻辑/图/代数对象？',
      '数学建模(25%)：用到的定义与定理，前提条件都满足吗？',
      '推理计算(20%)：每一步是否有依据？有没有跳步或臆测？',
      '工程解释(10%)：能否解释结论的现实意义与边界？',
      '迁移应用(10%)：能否把方法迁移到新结构与新场景？'] };
  }

  /* ---------- 4. DeepSeek 调用（浏览器直连，BYO-key） ---------- */
  function getKey() { try { return localStorage.getItem(LS_KEY) || ''; } catch (e) { return ''; } }
  function getModel() { try { return localStorage.getItem(LS_MODEL) || 'deepseek-chat'; } catch (e) { return 'deepseek-chat'; } }
  function hasKey() { return !!getKey(); }

  function buildMessages(role, question) {
    var sys = ROLE_PROMPTS[role] + "\n\n【本节知识锚定】" + META.grounding + "\n\n" + GUARD;
    var user = '课程：' + META.chapter + ' · ' + META.section + '\n本节主题：' + META.title + '。'
      + (currentStep >= 0 ? '\n学生当前处于六步流程第 ' + (currentStep + 1) + ' 步「' + (META.steps[currentStep] || {}).name + '」。' : '');
    if (role === 'ask' && question) user += '\n\n学生的问题是：' + question;
    return [{ role: 'system', content: sys }, { role: 'user', content: user }];
  }

  // 单轮调用（供配置弹窗连接测试用）
  async function callDeepSeek(role, question, onDelta) {
    return callDeepSeekRaw(buildMessages(role, question), ROLE_TEMP[role] || 0.7, role === 'ask' ? 900 : 760, onDelta);
  }

  // 流式调用 DeepSeek（显式 messages，支持多轮）；onDelta(全文) 实时回调
  async function callDeepSeekRaw(messages, temperature, maxTokens, onDelta) {
    var key = getKey();
    if (!key) return { ok: false, reason: 'nokey' };
    var ctrl = new AbortController();
    var to = setTimeout(function () { ctrl.abort(); }, 60000);
    var body = { model: getModel(), messages: messages, temperature: temperature, max_tokens: maxTokens, stream: !!onDelta };
    try {
      var res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify(body), signal: ctrl.signal
      });
      if (res.status === 401) { clearTimeout(to); return { ok: false, reason: 'auth' }; }
      if (!res.ok) { clearTimeout(to); return { ok: false, reason: 'http', detail: res.status }; }

      // 非流式
      if (!onDelta || !res.body || !res.body.getReader) {
        var data = await res.json(); clearTimeout(to);
        var text = (((data.choices || [])[0] || {}).message || {}).content || '';
        if (!text.trim()) return { ok: false, reason: 'empty' };
        return { ok: true, text: text.trim(), usage: data.usage || {}, model: data.model || getModel() };
      }

      // 流式：解析 SSE
      var reader = res.body.getReader(), dec = new TextDecoder(), buf = '', full = '';
      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buf += dec.decode(chunk.value, { stream: true });
        var idx;
        while ((idx = buf.indexOf('\n')) >= 0) {
          var line = buf.slice(0, idx).trim(); buf = buf.slice(idx + 1);
          if (line.indexOf('data:') !== 0) continue;
          var payload = line.slice(5).trim();
          if (payload === '[DONE]' || !payload) continue;
          try {
            var j = JSON.parse(payload);
            var d = (((j.choices || [])[0] || {}).delta || {}).content || '';
            if (d) { full += d; onDelta(full); }
          } catch (e) { /* 忽略不完整片段 */ }
        }
      }
      clearTimeout(to);
      if (!full.trim()) return { ok: false, reason: 'empty' };
      return { ok: true, text: full.trim(), model: getModel() };
    } catch (e) {
      clearTimeout(to);
      return { ok: false, reason: e.name === 'AbortError' ? 'timeout' : 'network' };
    }
  }

  /* ---------- MathJax 自动加载（用于渲染 AI 回答里的公式） ---------- */
  var _mjLoading = false;
  function ensureMathJax(cb) {
    if (window.MathJax && window.MathJax.typesetPromise) { cb && cb(); return; }
    if (_mjLoading) { setTimeout(function () { ensureMathJax(cb); }, 400); return; }
    // 页面已有 MathJax 脚本但尚未就绪：等待
    if (document.querySelector('script[src*="mathjax"]')) {
      _mjLoading = true; var n = 0;
      var iv = setInterval(function () {
        if (window.MathJax && window.MathJax.typesetPromise) { clearInterval(iv); cb && cb(); }
        else if (++n > 25) { clearInterval(iv); cb && cb(); }
      }, 200);
      return;
    }
    // 注入 MathJax
    _mjLoading = true;
    if (!window.MathJax) window.MathJax = { tex: { inlineMath: [['$', '$'], ['\\(', '\\)']], displayMath: [['$$', '$$'], ['\\[', '\\]']] }, svg: { fontCache: 'global' } };
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'; s.async = true;
    s.onload = function () { var n = 0; var iv = setInterval(function () { if (window.MathJax && window.MathJax.typesetPromise) { clearInterval(iv); cb && cb(); } else if (++n > 25) { clearInterval(iv); cb && cb(); } }, 200); };
    s.onerror = function () { cb && cb(); };
    document.head.appendChild(s);
  }

  /* ---------- 5. 极简 markdown → html ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function inlineMd(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>'); }
  function mdToHtml(md) {
    var lines = md.split('\n'), html = '', inUl = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) { if (inUl) { html += '</ul>'; inUl = false; } continue; }
      if (/^[-*•]\s+/.test(line) || /^\d+[.)、]\s*/.test(line)) {
        if (!inUl) { html += '<ul>'; inUl = true; }
        html += '<li>' + inlineMd(line.replace(/^[-*•]\s+/, '').replace(/^\d+[.)、]\s*/, '')) + '</li>';
      } else { if (inUl) { html += '</ul>'; inUl = false; } html += '<p>' + inlineMd(line) + '</p>'; }
    }
    if (inUl) html += '</ul>';
    return html;
  }

  function injectUnifiedFrameStyle() {
    if (window.TWO_BOMBS_TIERED_PAGE) return;
    var css = [
      'body:has(.app-container),body:has(.app-container[data-dm-side-shell]),body:has(.app-container[data-dm-app]),body:has(.app-container>aside.sidebar),body:has(.app-container>.sidebar){display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;box-sizing:border-box!important;min-height:100vh!important;overflow-x:hidden!important;padding-bottom:0!important;}',
      'body:has(.app-container)>.app-container,body:has(.app-container[data-dm-side-shell])>.app-container,body:has(.app-container[data-dm-app])>.app-container,body:has(.app-container>aside.sidebar)>.app-container:has(>aside.sidebar),body:has(.app-container>.sidebar)>.app-container:has(>.sidebar){flex:1 0 auto!important;align-self:center!important;display:grid!important;grid-template-columns:390px minmax(0,1fr)!important;grid-template-areas:"side main"!important;grid-template-rows:minmax(0,1fr)!important;align-items:stretch!important;width:min(94vw,1760px)!important;max-width:none!important;height:auto!important;min-height:calc(100vh - 88px)!important;margin:0 auto!important;padding:12px!important;gap:12px!important;box-sizing:border-box!important;overflow:visible!important;background:rgba(255,252,245,.92)!important;border:1px solid rgba(214,59,29,.16)!important;border-radius:22px!important;box-shadow:0 18px 40px rgba(139,0,0,.10)!important;}',
      'body:has(.app-container[data-dm-side-shell])>.app-container:has(>.insight-footer),body:has(.app-container[data-dm-app])>.app-container:has(>.insight-footer),body:has(.app-container>aside.sidebar)>.app-container:has(>aside.sidebar):has(>.insight-footer),body:has(.app-container>.sidebar)>.app-container:has(>.sidebar):has(>.insight-footer){grid-template-areas:"side main" "side foot"!important;grid-template-rows:minmax(0,1fr) auto!important;}',
      '.app-container>.side-panel,.app-container[data-dm-side-shell]>.sidebar,.app-container[data-dm-app]>:where(header,.app-header,.main-header,.dashboard-header),.app-container:has(>aside.sidebar)>aside.sidebar,.app-container:has(>.sidebar)>.sidebar,.app-container>:where(main,.glass-pane,.visualizer-stage,.main-stage,.comparison-stage,.triad-stage,.main-content,.dashboard-main),.app-container[data-dm-side-shell]>:where(main,.visualizer-stage,.main-stage,.comparison-stage,.triad-stage,.main-content,.dashboard-main),.app-container[data-dm-app]>:where(main,.main-stage,.comparison-stage,.triad-stage,.main-content,.dashboard-main),.app-container:has(>aside.sidebar)>.visualizer-stage,.app-container:has(>.sidebar)>.visualizer-stage{align-self:stretch!important;height:auto!important;min-height:0!important;margin:0!important;box-sizing:border-box!important;}',
      '.app-container>.side-panel,.app-container[data-dm-side-shell]>.sidebar,.app-container[data-dm-app]>:where(header,.app-header,.main-header,.dashboard-header),.app-container:has(>aside.sidebar)>aside.sidebar,.app-container:has(>.sidebar)>.sidebar{grid-area:side!important;}',
      '.app-container>:where(main,.glass-pane,.visualizer-stage,.main-stage,.comparison-stage,.triad-stage,.main-content,.dashboard-main),.app-container[data-dm-side-shell]>:where(main,.visualizer-stage,.main-stage,.comparison-stage,.triad-stage,.main-content,.dashboard-main),.app-container[data-dm-app]>:where(main,.main-stage,.comparison-stage,.triad-stage,.main-content,.dashboard-main),.app-container:has(>aside.sidebar)>.visualizer-stage,.app-container:has(>.sidebar)>.visualizer-stage{grid-area:main!important;overflow:visible!important;}',
      '.app-container>.visualizer-stage:has(>#dm-page-layers),.app-container>main.visualizer-stage:has(>#dm-page-layers),.app-container:has(>aside.sidebar)>.visualizer-stage:has(>#dm-page-layers),.app-container:has(>.sidebar)>.visualizer-stage:has(>#dm-page-layers){display:flex!important;flex-direction:column!important;flex-wrap:nowrap!important;align-items:stretch!important;min-width:0!important;}',
      '.app-container>.visualizer-stage:has(>#dm-page-layers)>.glass-pane,.app-container>main.visualizer-stage:has(>#dm-page-layers)>.glass-pane,.app-container:has(>aside.sidebar)>.visualizer-stage:has(>#dm-page-layers)>.glass-pane,.app-container:has(>.sidebar)>.visualizer-stage:has(>#dm-page-layers)>.glass-pane{flex:1 1 auto!important;min-height:0!important;width:100%!important;min-width:0!important;max-width:100%!important;}',
      '.app-container>:where(main.split-stage.visualizer-stage,.split-stage.visualizer-stage):has(>#dm-page-layers),.app-container:has(>aside.sidebar)>:where(main.split-stage.visualizer-stage,.split-stage.visualizer-stage):has(>#dm-page-layers),.app-container:has(>.sidebar)>:where(main.split-stage.visualizer-stage,.split-stage.visualizer-stage):has(>#dm-page-layers){display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto minmax(260px,1fr) minmax(220px,.8fr)!important;align-content:stretch!important;align-items:stretch!important;gap:2px!important;overflow:visible!important;min-width:0!important;}',
      '.app-container>:where(main.split-stage.visualizer-stage,.split-stage.visualizer-stage):has(>#dm-page-layers)>#dm-page-layers,.app-container:has(>aside.sidebar)>:where(main.split-stage.visualizer-stage,.split-stage.visualizer-stage):has(>#dm-page-layers)>#dm-page-layers,.app-container:has(>.sidebar)>:where(main.split-stage.visualizer-stage,.split-stage.visualizer-stage):has(>#dm-page-layers)>#dm-page-layers{grid-row:1!important;width:100%!important;min-width:0!important;max-width:100%!important;}',
      '.app-container>:where(main.split-stage.visualizer-stage,.split-stage.visualizer-stage):has(>#dm-page-layers)>.graph-panel,.app-container:has(>aside.sidebar)>:where(main.split-stage.visualizer-stage,.split-stage.visualizer-stage):has(>#dm-page-layers)>.graph-panel,.app-container:has(>.sidebar)>:where(main.split-stage.visualizer-stage,.split-stage.visualizer-stage):has(>#dm-page-layers)>.graph-panel{grid-row:2!important;min-height:260px!important;min-width:0!important;}',
      '.app-container>:where(main.split-stage.visualizer-stage,.split-stage.visualizer-stage):has(>#dm-page-layers)>.matrix-panel,.app-container:has(>aside.sidebar)>:where(main.split-stage.visualizer-stage,.split-stage.visualizer-stage):has(>#dm-page-layers)>.matrix-panel,.app-container:has(>.sidebar)>:where(main.split-stage.visualizer-stage,.split-stage.visualizer-stage):has(>#dm-page-layers)>.matrix-panel{grid-row:3!important;min-height:220px!important;min-width:0!important;}',
      'body:has(.app-container)>footer:not(.insight-footer),body:has(.app-container)>footer.site-footer,body:has(.app-container[data-dm-side-shell])>footer:not(.insight-footer),body:has(.app-container[data-dm-side-shell])>footer.site-footer,body:has(.app-container[data-dm-app])>footer:not(.insight-footer),body:has(.app-container[data-dm-app])>footer.site-footer,body:has(.app-container>aside.sidebar)>footer:not(.insight-footer),body:has(.app-container>aside.sidebar)>footer.site-footer,body:has(.app-container>.sidebar)>footer:not(.insight-footer),body:has(.app-container>.sidebar)>footer.site-footer{position:static!important;left:auto!important;right:auto!important;bottom:auto!important;top:auto!important;width:100%!important;flex:0 0 auto!important;margin:12px 0 0!important;}',
      '@media(max-width:1000px){body:has(.app-container[data-dm-side-shell])>.app-container,body:has(.app-container[data-dm-app])>.app-container,body:has(.app-container>aside.sidebar)>.app-container:has(>aside.sidebar),body:has(.app-container>.sidebar)>.app-container:has(>.sidebar){width:min(94vw,760px)!important;grid-template-columns:1fr!important;grid-template-areas:"side" "main"!important;grid-template-rows:auto minmax(0,1fr)!important;}body:has(.app-container[data-dm-side-shell])>.app-container:has(>.insight-footer),body:has(.app-container[data-dm-app])>.app-container:has(>.insight-footer),body:has(.app-container>aside.sidebar)>.app-container:has(>aside.sidebar):has(>.insight-footer),body:has(.app-container>.sidebar)>.app-container:has(>.sidebar):has(>.insight-footer){grid-template-areas:"side" "main" "foot"!important;grid-template-rows:auto minmax(0,1fr) auto!important;}}'
    ].join('');
    var style = document.getElementById('dm-unified-frame-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'dm-unified-frame-style';
      document.head.appendChild(style);
    }
    style.textContent = css;
    try {
      var applyImportant = function (node, prop, value) { if (node) node.style.setProperty(prop, value, 'important'); };
      applyImportant(document.documentElement, 'padding-bottom', '0');
      applyImportant(document.body, 'padding-bottom', '0');
      applyImportant(document.body, 'margin-bottom', '0');
      Array.prototype.forEach.call(document.querySelectorAll('body > footer:not(.insight-footer), body > footer.site-footer'), function (footer) {
        applyImportant(footer, 'position', 'static');
        applyImportant(footer, 'left', 'auto');
        applyImportant(footer, 'right', 'auto');
        applyImportant(footer, 'bottom', 'auto');
        applyImportant(footer, 'top', 'auto');
        applyImportant(footer, 'width', '100%');
        applyImportant(footer, 'flex', '0 0 auto');
        applyImportant(footer, 'margin', '12px 0 0');
      });
      Array.prototype.forEach.call(document.querySelectorAll('.app-container'), function (app) {
        // opt-out：带 data-dm-self-layout 的页面自管布局，跳过统一外壳的内联 important 覆盖（避免反复改写造成加载闪动）
        var managed = !(app.getAttribute('data-dm-self-layout') === '1');
        if (!managed) return;
        var set = function (node, prop, value) { if (node) node.style.setProperty(prop, value, 'important'); };
        [
          ['display', 'grid'],
          ['grid-template-columns', '390px minmax(0, 1fr)'],
          ['align-items', 'stretch'],
          ['width', 'min(94vw, 1760px)'],
          ['max-width', 'none'],
          ['height', 'auto'],
          ['min-height', 'calc(100vh - 88px)'],
          ['margin', '0 auto'],
          ['padding', '12px'],
          ['gap', '12px'],
          ['box-sizing', 'border-box'],
          ['overflow', 'visible'],
          ['background', 'rgba(255,252,245,.92)'],
          ['border', '1px solid rgba(214,59,29,.16)'],
          ['border-radius', '22px'],
          ['box-shadow', '0 18px 40px rgba(139,0,0,.10)']
        ].forEach(function (kv) { set(app, kv[0], kv[1]); });
        var insight = app.querySelector(':scope > .insight-footer');
        set(app, 'grid-template-areas', insight ? '"side main" "side foot"' : '"side main"');
        set(app, 'grid-template-rows', insight ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr)');
        if (insight) {
          set(insight, 'grid-area', 'foot');
          set(insight, 'margin', '0');
          set(insight, 'box-sizing', 'border-box');
        }
        var side = app.querySelector(':scope > .side-panel, :scope > .sidebar, :scope > aside.sidebar, :scope > header, :scope > .app-header, :scope > .main-header, :scope > .dashboard-header');
        if (side) {
          set(side, 'grid-area', 'side');
          set(side, 'align-self', 'stretch');
          set(side, 'height', 'auto');
          set(side, 'min-height', '0');
          set(side, 'margin', '0');
          set(side, 'box-sizing', 'border-box');
        }
        Array.prototype.forEach.call(app.querySelectorAll(':scope > main, :scope > .glass-pane, :scope > .visualizer-stage, :scope > .main-stage, :scope > .comparison-stage, :scope > .triad-stage, :scope > .main-content, :scope > .dashboard-main'), function (main) {
          set(main, 'grid-area', 'main');
          set(main, 'align-self', 'stretch');
          set(main, 'height', 'auto');
          set(main, 'min-height', '0');
          set(main, 'margin', '0');
          set(main, 'box-sizing', 'border-box');
          set(main, 'overflow', 'visible');
          if (main.querySelector(':scope > #dm-page-layers')) {
            if (main.classList.contains('split-stage')) {
              set(main, 'display', 'grid');
              set(main, 'grid-template-columns', 'minmax(0, 1fr)');
              set(main, 'grid-template-rows', 'auto minmax(260px, 1fr) minmax(220px, .8fr)');
              set(main, 'align-content', 'stretch');
              set(main, 'align-items', 'stretch');
              set(main, 'gap', '2px');
              set(main, 'min-width', '0');
              set(main, 'overflow', 'visible');
              var graphPanel = main.querySelector(':scope > .graph-panel');
              var matrixPanel = main.querySelector(':scope > .matrix-panel');
              if (graphPanel) {
                set(graphPanel, 'grid-row', '2');
                set(graphPanel, 'min-height', '260px');
                set(graphPanel, 'min-width', '0');
              }
              if (matrixPanel) {
                set(matrixPanel, 'grid-row', '3');
                set(matrixPanel, 'min-height', '220px');
                set(matrixPanel, 'min-width', '0');
              }
            } else {
              set(main, 'display', 'flex');
              set(main, 'flex-direction', 'column');
              set(main, 'flex-wrap', 'nowrap');
              set(main, 'align-items', 'stretch');
              set(main, 'min-width', '0');
              var pane = main.querySelector(':scope > .glass-pane');
              if (pane) {
                set(pane, 'flex', '1 1 auto');
                set(pane, 'width', '100%');
                set(pane, 'min-width', '0');
                set(pane, 'max-width', '100%');
                set(pane, 'min-height', '0');
              }
            }
          }
        });
      });
    } catch (e) {}
    try {
      clearTimeout(injectUnifiedFrameStyle._resizeTimer);
      injectUnifiedFrameStyle._resizeTimer = setTimeout(function () {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    } catch (e) {}
  }

  /* ---------- 6. 构建 DOM ---------- */
  var currentStep = -1, root, panel, launcher, modalMask, aiStatusEl, onboard;

  /* ---------- 六维能力雷达（仅重点案例页启用） ---------- */
  // META.radar===true 强制开启；===false 强制关闭；默认在「案例」类小节自动开启
  var IS_CASE = (META.radar === true) || (META.radar !== false && (/案例/.test(META.section || '') || /案例/.test(META.title || '')));
  var DIMS = [
    { key: 'context', name: '情境理解', w: 0.15 },
    { key: 'abstract', name: '对象抽象', w: 0.20 },
    { key: 'model', name: '数学建模', w: 0.25 },
    { key: 'reason', name: '推理计算', w: 0.20 },
    { key: 'engineer', name: '工程解释', w: 0.10 },
    { key: 'transfer', name: '迁移应用', w: 0.10 }
  ];
  var RADAR_KEY = 'dm_radar_' + (META.chapter + '|' + META.section);
  function getScores() {
    var d = { context: 0, abstract: 0, model: 0, reason: 0, engineer: 0, transfer: 0 };
    try { var s = JSON.parse(localStorage.getItem(RADAR_KEY) || '{}'); for (var k in d) if (typeof s[k] === 'number') d[k] = s[k]; } catch (e) {}
    return d;
  }
  function bump(deltas) {
    if (!IS_CASE) return;
    var s = getScores(), changed = false;
    for (var k in deltas) { if (s[k] == null) continue; var v = Math.max(0, Math.min(100, s[k] + deltas[k])); if (v !== s[k]) { s[k] = v; changed = true; } }
    if (changed) { try { localStorage.setItem(RADAR_KEY, JSON.stringify(s)); } catch (e) {} drawRadar(); }
  }
  function bumpDim(key, delta) { if (key) { var o = {}; o[key] = delta; bump(o); } }
  function radarIndex(s) { var sum = 0; DIMS.forEach(function (d) { sum += (s[d.key] || 0) * d.w; }); return Math.round(sum); }
  // 六步 ←→ 六维 一一对应（情境引入/对象抽取/结构建模/推理求解/程序验证/迁移反思）
  var STEP_DIM = ['context', 'abstract', 'model', 'reason', 'engineer', 'transfer'];
  var ROLE_DIM = {
    scenario: { context: 22 },
    hint: { reason: 12, model: 8 },
    diagnose: { context: 6, abstract: 6, model: 6, reason: 6, engineer: 6, transfer: 6 },
    transfer: { transfer: 22 },
    ask: { model: 12, reason: 12 }
  };

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* 仅在显式需要时把「价值引领」注入侧栏。
     基础层/拓展层默认不再注入，以保持打开页面时与进阶层首屏风格一致。 */
  function injectIdeologyPanel() {
    if (document.getElementById('dm-ideo-page')) return;
    // 旧的 .value-panel 静态块由 CSS 隐藏；价值内容仍保留在学习助手「价值引领」页签。
    var appHeader = document.querySelector('.app-container > header.main-header, .app-container > .main-header');
    var isTier = META.ideologyPanel === true || !!appHeader;
    if (!isTier) return;
    var io = META.ideology; if (!io) return;
    var host = document.querySelector('.controls-wrapper') || document.querySelector('.sidebar') || appHeader;
    if (!host) { var band = document.getElementById('dm-page-layers'); host = band && band.parentNode ? band.parentNode : null; }
    if (!host) return;
    var grp = el('div', 'control-group'); grp.id = 'dm-ideo-page';
    var extra = io.quote ? esc(io.quote) : ((io.dims || []).join(' · '));
    grp.innerHTML = '<label>价值引领</label>'
      + '<div class="info-panel">'
      + '<h3>🚩 ' + esc(io.title || '价值引领') + '</h3>'
      + '<p>' + esc(io.text || '') + '</p>'
      + (extra ? '<p class="political-text">' + extra + '</p>' : '')
      + '</div>';
    // 侧栏宿主：放到顶部（标题下、控件前）一眼可见
    if (host.classList && (host.classList.contains('controls-wrapper') || host.classList.contains('sidebar'))) {
      host.insertBefore(grp, host.firstChild);
    } else if (host.classList && host.classList.contains('main-header')) {
      // 重排后的页头侧栏：插在「标题(header-content)」之后、「操作按钮(header-controls)」之前
      var ctrls = host.querySelector('.header-controls');
      if (ctrls) host.insertBefore(grp, ctrls); else host.appendChild(grp);
    } else {
      host.appendChild(grp);
    }
  }

  function build() {
    injectUnifiedFrameStyle();
    root = el('div'); root.id = 'dm-assist-root';

    /* 面包屑 */
    var crumb = el('div'); crumb.id = 'dm-crumb';
    crumb.innerHTML = '<span class="dm-cb-ch">' + esc(META.chapter) + '</span>'
      + '<span class="dm-cb-sep">›</span><span class="dm-cb-sec">' + esc(META.section || META.title) + '</span>';
    root.appendChild(crumb);

    /* 启动按钮 */
    launcher = el('button'); launcher.id = 'dm-launcher';
    launcher.innerHTML = '<span class="dm-l-spark">✦</span><span>学习助手</span>';
    launcher.onclick = togglePanel;
    root.appendChild(launcher);

    /* 主面板 */
    panel = el('div', 'dm-hidden'); panel.id = 'dm-panel';
    panel.appendChild(buildHead());
    panel.appendChild(buildTabs());
    panel.appendChild(buildBody());
    root.appendChild(panel);

    /* 配置弹窗 */
    modalMask = buildModal();
    root.appendChild(modalMask);

    /* 首次引导气泡 */
    onboard = buildOnboard();
    root.appendChild(onboard);

    document.body.appendChild(root);
    refreshStatus();

    /* 恢复上次停留的选项卡 */
    try { var lt = localStorage.getItem('dm_last_tab'); if (lt) switchTab(lt); } catch (e) {}

    /* 把三阶层次直接渲染进页面主区（延时一次重注，防各节脚本在初始化后重渲染主区） */
    syncPageTitleWithLayer();
    setTimeout(syncPageTitleWithLayer, 700);
    window.addEventListener('load', syncPageTitleWithLayer);
    injectPageLayers();
    injectUnifiedFrameStyle();
    if (window.TWO_BOMBS_TIERED_PAGE) document.documentElement.classList.remove('two-bombs-booting');
    setTimeout(function () { injectPageLayers(); injectUnifiedFrameStyle(); }, 700);
    window.addEventListener('load', function () { injectPageLayers(); injectUnifiedFrameStyle(); });
    setTimeout(injectUnifiedFrameStyle, 750);
    setTimeout(injectUnifiedFrameStyle, 1500);
    setTimeout(injectUnifiedFrameStyle, 2500);
    window.addEventListener('load', injectUnifiedFrameStyle);

    /* 三阶互动页：在页面侧栏显眼处注入「价值引领」面板（原有页已自带，故跳过） */
    injectIdeologyPanel();
    setTimeout(injectIdeologyPanel, 700);
    window.addEventListener('load', injectIdeologyPanel);

    /* 键盘：Esc 关闭弹窗/面板 */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (modalMask && !modalMask.classList.contains('dm-hidden')) { closeModal(); return; }
      if (panel && !panel.classList.contains('dm-hidden')) togglePanel();
    });

    /* 首次访问：显示引导气泡 */
    try {
      if (!localStorage.getItem('dm_onboard_seen')) {
        setTimeout(function () { if (onboard && panel.classList.contains('dm-hidden')) onboard.classList.remove('dm-hidden'); }, 1200);
      }
    } catch (e) {}

    /* 案例页：与本页交互（点击主舞台）→ 轻量提升推理/工程维度（节流） */
    if (IS_CASE) {
      var _lastTick = 0;
      document.addEventListener('click', function (e) {
        if (root.contains(e.target)) return;            // 忽略助手自身
        if (e.target.closest && e.target.closest('#homeBtn, .site-footer, footer')) return;
        var now = Date.now(); if (now - _lastTick < 1500) return; _lastTick = now;
        bump({ reason: 3, engineer: 3 });
      }, true);
    }
  }

  function buildOnboard() {
    var o = el('div', 'dm-hidden'); o.id = 'dm-onboard';
    o.innerHTML = '<span class="dm-ob-close">✕</span>'
      + '<div class="dm-ob-title">✦ AI 学习助手</div>'
      + '<div>点这里可<b>就本节提问</b>、获取苏格拉底提示、查看六步流程与价值引领 👉</div>';
    o.querySelector('.dm-ob-close').onclick = function (e) { e.stopPropagation(); dismissOnboard(); };
    o.onclick = function () { dismissOnboard(); togglePanel(); };
    return o;
  }
  function dismissOnboard() {
    if (onboard) onboard.classList.add('dm-hidden');
    try { localStorage.setItem('dm_onboard_seen', '1'); } catch (e) {}
  }

  function buildHead() {
    var head = el('div', 'dm-panel-head');
    var left = el('div');
    left.innerHTML = '<div class="dm-ph-title">✦ 学习助手</div><div class="dm-ph-sub">' + esc(META.section || META.title) + '</div>';
    var actions = el('div', 'dm-ph-actions');
    var gear = el('button', 'dm-icon-btn', '⚙'); gear.title = '配置 AI 密钥'; gear.onclick = openModal;
    var close = el('button', 'dm-icon-btn', '✕'); close.title = '收起'; close.onclick = togglePanel;
    actions.appendChild(gear); actions.appendChild(close);
    head.appendChild(left); head.appendChild(actions);
    return head;
  }

  var TABS = [
    { id: 'ai', ic: '🤖', label: 'AI 助教' },
    { id: 'steps', ic: '🪜', label: '六步流程' },
    { id: 'ideo', ic: '🚩', label: '价值引领' },
    { id: 'reflect', ic: '🔁', label: '反思迁移' }
  ];
  if (IS_CASE) TABS.push({ id: 'radar', ic: '📊', label: '能力雷达' });
  function buildTabs() {
    var bar = el('div', 'dm-tabs' + (TABS.length >= 5 ? ' dm-tabs-5' : ''));
    TABS.forEach(function (t, i) {
      var b = el('button', 'dm-tab' + (i === 0 ? ' active' : ''));
      b.innerHTML = '<span class="dm-tab-ic">' + t.ic + '</span><span>' + t.label + '</span>';
      b.dataset.tab = t.id;
      b.onclick = function () { switchTab(t.id); };
      bar.appendChild(b);
    });
    return bar;
  }

  function buildBody() {
    var body = el('div', 'dm-tab-body');
    body.appendChild(buildPaneAI());
    body.appendChild(buildPaneSteps());
    body.appendChild(buildPaneIdeo());
    body.appendChild(buildPaneReflect());
    if (IS_CASE) body.appendChild(buildPaneRadar());
    return body;
  }

  /* ---------- 多轮对话状态 ---------- */
  var convo = [], transcriptEl;
  var CONVO_KEY = 'dm_convo_' + (META.chapter + '|' + META.section);
  function loadConvo() { try { var a = JSON.parse(localStorage.getItem(CONVO_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function saveConvo() { try { localStorage.setItem(CONVO_KEY, JSON.stringify(convo.slice(-16))); } catch (e) {} }
  function clearConvo() { convo = []; saveConvo(); if (transcriptEl) { transcriptEl.innerHTML = ''; showWelcome(); } }
  function showWelcome() {
    if (!transcriptEl) return;
    var w = el('div', 'dm-ai-welcome');
    w.innerHTML = '💬 我是本节的 <b>AI 学习伙伴</b>，支持<b>多轮追问</b>。<br>在下方输入框提问、或点上方按钮发起引导；可继续追问「再讲讲」「那如果改成…呢」。<br><span style="font-size:11.5px">所有数学结论请以本页交互与教材为准。</span>';
    transcriptEl.appendChild(w);
  }
  function clearWelcome() { if (transcriptEl) { var w = transcriptEl.querySelector('.dm-ai-welcome'); if (w) w.remove(); } }
  function scrollTranscript() { if (transcriptEl) transcriptEl.scrollTop = transcriptEl.scrollHeight; }
  function addMsg(role, label) {
    clearWelcome();
    var msg = el('div', 'dm-msg dm-msg-' + role);
    if (role === 'assistant' && label) msg.appendChild(el('div', 'dm-msg-tag', label));
    var body = el('div', 'dm-msg-body');
    msg.appendChild(body); transcriptEl.appendChild(msg);
    return { msg: msg, body: body };
  }
  function attachCopy(msgEl, text) {
    var c = el('div', 'dm-msg-copy', '📋 复制');
    c.onclick = function () { var d = function () { c.textContent = '✅ 已复制'; setTimeout(function () { c.textContent = '📋 复制'; }, 1500); }; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(d, d); else d(); };
    msgEl.appendChild(c);
  }
  function renderTurn(role, content) {
    var m = addMsg(role, role === 'assistant' ? '💬 学习伙伴' : null);
    if (role === 'user') m.body.textContent = content;
    else { m.body.innerHTML = mdToHtml(content); attachCopy(m.msg, content); }
    return m;
  }
  function typesetEl(elm) {
    if (!elm || !/[$\\]/.test(elm.textContent || '')) return;
    if (window.DMMathJax && window.DMMathJax.typeset) {
      window.DMMathJax.typeset(elm);
      return;
    }
    ensureMathJax(function () {
      try {
        if (window.MathJax && window.MathJax.typesetPromise && /(?:\$\$|\$[^$\n]{1,160}\$|\\\(|\\\[|\\begin\{)/.test(elm.textContent || '')) {
          window.MathJax.typesetPromise([elm]);
        }
      } catch (e) {}
    });
  }

  function buildPaneAI() {
    var p = el('div', 'dm-pane active'); p.dataset.pane = 'ai';

    var top = el('div', 'dm-ai-top');
    var bar = el('div', 'dm-ai-statusbar');
    aiStatusEl = el('span', 'dm-ai-status offline', '未配置');
    var right = el('div', 'dm-statusbar-right');
    var newBtn = el('button', 'dm-newchat-btn', '🗑 新对话'); newBtn.title = '清空本节对话'; newBtn.onclick = function () { clearConvo(); };
    var keyBtn = el('button', 'dm-key-btn', '⚙ 配置 AI'); keyBtn.onclick = openModal;
    right.appendChild(newBtn); right.appendChild(keyBtn);
    bar.appendChild(aiStatusEl); bar.appendChild(right);
    top.appendChild(bar);

    top.appendChild(el('div', 'dm-ai-roles-label', '快捷引导 · 点按钮发起或继续对话'));
    var btns = el('div', 'dm-ai-buttons');
    [['scenario', '🎲 情境生成'], ['hint', '💡 苏格拉底提示'], ['diagnose', '🔍 错误诊断'], ['transfer', '🔀 迁移变式']]
      .forEach(function (r) {
        var b = el('button', 'dm-ai-btn', r[1]); b.dataset.role = r[0];
        b.onclick = function () { runRole(r[0]); };
        btns.appendChild(b);
      });
    top.appendChild(btns);
    p.appendChild(top);

    transcriptEl = el('div', 'dm-ai-transcript');
    p.appendChild(transcriptEl);

    var ib = el('div', 'dm-ai-inputbar');
    var askInput = el('input', 'dm-ask-input'); askInput.type = 'text';
    askInput.placeholder = '输入问题或追问…'; askInput.maxLength = 300;
    var askSend = el('button', 'dm-ask-send', '发送');
    var doAsk = function () { var q = askInput.value.trim(); if (q && !_aiBusy) { askInput.value = ''; runAsk(q); } };
    askSend.onclick = doAsk;
    askInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') doAsk(); });
    ib.appendChild(askInput); ib.appendChild(askSend);
    p.appendChild(ib);

    // 恢复历史对话
    convo = loadConvo();
    if (convo.length) { convo.forEach(function (m) { renderTurn(m.role, m.content); }); setTimeout(function () { scrollTranscript(); typesetEl(transcriptEl); }, 0); }
    else showWelcome();
    return p;
  }

  var STEPS_KEY = 'dm_steps_' + (META.chapter + '|' + META.section);
  function getDone() { try { return JSON.parse(localStorage.getItem(STEPS_KEY) || '[]'); } catch (e) { return []; } }
  function setDone(a) { try { localStorage.setItem(STEPS_KEY, JSON.stringify(a)); } catch (e) {} }
  var _pgFill, _pgTxt;
  function updateProgress() {
    var done = getDone(), total = META.steps.length, pct = total ? Math.round(done.length / total * 100) : 0;
    if (_pgFill) _pgFill.style.width = pct + '%';
    if (_pgTxt) _pgTxt.innerHTML = '<span>学习进度</span><span><b style="color:var(--dm-red)">' + done.length + '</b> / ' + total + ' 步 · ' + pct + '%</span>';
  }

  /* ---------- 三阶层次化（基础 / 进阶 / 拓展，低门槛·高天花板） ---------- */
  var LAYER_TAGS = [
    { tag: '基础层', sub: '低门槛 · 建立直觉', dots: '●○○' },
    { tag: '进阶层', sub: '核心掌握 · 建模求解', dots: '●●○' },
    { tag: '拓展层', sub: '高天花板 · 迁移工程', dots: '●●●' }
  ];
  function deriveLayers() {
    var s = META.steps || [];
    function nm(i) { return s[i] ? s[i].name : ''; }
    function ds(i) { return s[i] ? s[i].desc : ''; }
    var t0 = '';
    if (META.transfer && META.transfer[0]) { var x = META.transfer[0]; t0 = typeof x === 'string' ? x : ((x.t ? x.t + '：' : '') + (x.d || '')); }
    return [
      { name: '入门认知', concepts: (nm(0) + ' / ' + nm(1)).replace(/^ \/ | \/ $/g, ''), task: ds(0) || '从真实情境出发认识本节概念，建立直觉。' },
      { name: '核心方法', concepts: (nm(2) + ' / ' + nm(3) + ' / ' + nm(4)).replace(/(^ \/ )|( \/ $)|(\/ \/ )/g, ''), task: ds(2) || '掌握本节定义与方法，独立建模并推理求解。' },
      { name: '迁移拓展', concepts: nm(5) + (t0 ? ' / 工程迁移' : ''), task: t0 || ds(5) || '迁移到真实工程与更一般结构，理解边界与权衡。' }
    ];
  }
  function getLayers() { return (META.layers && META.layers.length === 3) ? META.layers : deriveLayers(); }
  function curFile() { try { return decodeURIComponent(location.pathname).split('/').pop() || ''; } catch (e) { return ''; } }
  function currentLayerIndex() {
    var layers = getLayers();
    var file = curFile();
    for (var i = 0; i < layers.length; i++) {
      var page = layers[i] && layers[i].page ? String(layers[i].page).split('/').pop() : '';
      if (page && page === file) return i;
    }
    if (/-basic\.html(?:[?#].*)?$/i.test(file)) return 0;
    if (/-extend\.html(?:[?#].*)?$/i.test(file)) return 2;
    return 1;
  }
  function currentLayerInfo() {
    var layers = getLayers();
    return layers[currentLayerIndex()] || null;
  }
  function syncPageTitleWithLayer() {
    var layer = currentLayerInfo();
    if (!layer || !layer.name) return;
    var appc = document.querySelector('.app-container') || document.querySelector('.dashboard-container') || document;
    var roots = [
      '.sidebar-header',
      '.main-header .header-content',
      '.app-header .header-content',
      '.header-content',
      '.main-header',
      '.app-header',
      'header'
    ];
    var root = null;
    for (var i = 0; i < roots.length; i++) {
      var cand = appc.querySelector ? appc.querySelector(roots[i]) : null;
      if (cand && cand.querySelector && cand.querySelector('h1')) { root = cand; break; }
    }
    if (!root) return;
    var h1 = root.querySelector('h1');
    if (!h1) return;
    h1.textContent = layer.name;
    h1.setAttribute('data-dm-layer-title', '1');
    var sub = root.querySelector('.subtitle, .header-subtitle');
    if (!sub) {
      sub = document.createElement('p');
      sub.className = 'subtitle';
      if (h1.parentNode) h1.parentNode.insertBefore(sub, h1.nextSibling);
    }
    sub.textContent = layer.concepts || '';
    sub.setAttribute('data-dm-layer-title-sub', '1');
    try { document.title = layer.name + (layer.concepts ? ' — ' + layer.concepts : ''); } catch (e) {}
  }
  function openPanel() {
    if (onboard) dismissOnboard();
    panel.classList.remove('dm-hidden'); launcher.classList.add('dm-hidden');
  }
  function runLayer(i) {
    var L = getLayers()[i];
    var reqs = [
      '我想从【基础层】入门。请用最简单直观的方式讲清「' + L.name + '」（' + (L.concepts || '') + '），并给我一个低门槛的小练习，帮我建立直觉。',
      '我要进阶到【进阶层】。请讲清「' + L.name + '」的关键方法（' + (L.concepts || '') + '），并给我一道需要动手建模/计算的练习（先不给答案）。',
      '我要挑战【拓展层】。请把「' + L.name + '」（' + (L.concepts || '') + '）迁移到真实工程或更一般的结构，给我一个有挑战的拓展问题。'
    ];
    if (IS_CASE) bump(i === 0 ? { context: 8 } : i === 1 ? { model: 8 } : { transfer: 8 });
    openPanel();
    runAsk(reqs[i]);
  }

  /* ---------- 把三阶层次直接渲染到页面主学习区（非悬浮） ---------- */
  function buildTierCard(L, i) {
    var isCur = L.page && L.page.split('/').pop() === curFile();
    var card = el('div', 'dm-tier dm-tier-' + (i + 1) + (isCur ? ' dm-tier-current' : ''));
    card.innerHTML = '<div class="dm-tier-head"><span class="dm-tier-tag">' + LAYER_TAGS[i].tag + '</span>'
      + '<span class="dm-tier-dots">' + LAYER_TAGS[i].dots + '</span>' + (isCur ? '<span class="dm-tier-cur-badge">当前</span>' : '') + '</div>'
      + '<div class="dm-tier-name">' + esc(L.name || '') + '</div>'
      + (L.concepts ? '<div class="dm-tier-concepts">' + esc(L.concepts) + '</div>' : '')
      + '<div class="dm-tier-sub">' + LAYER_TAGS[i].sub + '</div>'
      + '<div class="dm-tier-task">🎯 ' + esc(L.task || '') + '</div>';
    var btn;
    if (L.page) {
      if (isCur) { btn = el('button', 'dm-tier-btn dm-tier-btn-cur', '✓ 你在本层'); btn.disabled = true; }
      else { btn = el('a', 'dm-tier-btn'); btn.href = L.page; btn.textContent = '▶ 进入本层互动页'; }
    } else {
      btn = el('button', 'dm-tier-btn', '▶ 进入本层 · AI 出题');
      btn.onclick = function () { runLayer(i); };
    }
    card.appendChild(btn);
    setTimeout(function () { typesetEl(card); }, 0);
    return card;
  }
  function injectPageLayers() {
    if (document.getElementById('dm-page-layers')) return;
    var wrap = el('section', 'dm-page-layers'); wrap.id = 'dm-page-layers';
    var head = el('div', 'dm-pl-head');
    head.innerHTML = '<div><span class="dm-pl-title">📚 三阶层次案例</span>'
      + '<span class="dm-pl-sub"> 低门槛 · 高天花板 — 点「进入本层」由 AI 按该难度出题</span></div>';
    var toggle = el('button', 'dm-pl-toggle', '收起');
    toggle.onclick = function () { var c = wrap.classList.toggle('dm-collapsed'); toggle.textContent = c ? '展开' : '收起'; };
    head.appendChild(toggle);
    wrap.appendChild(head);
    var ladder = el('div', 'dm-ladder');
    getLayers().forEach(function (L, i) { ladder.appendChild(buildTierCard(L, i)); });
    wrap.appendChild(ladder);

    // 标准侧栏式教学页：把三阶带提升为 app-container 的直接子元素，
    // 与应用式进阶页保持「左侧栏 / 右上三阶带 / 右下主舞台」同一外壳。
    var appc = document.querySelector('.app-container') || document.querySelector('.dashboard-container');
    if (appc && !appc.classList.contains('app-container')) appc.classList.add('app-container');
    function scoped(root, sel, fallback) {
      if (!root) return null;
      try { return root.querySelector(sel); }
      catch (e) { return fallback ? root.querySelector(fallback) : null; }
    }
    var directSide = scoped(appc, ':scope > aside.sidebar, :scope > aside.side-panel, :scope > .side-panel, :scope > aside.matrix-panel, :scope > .matrix-panel', 'aside.sidebar, aside.side-panel, .side-panel, aside.matrix-panel, .matrix-panel');
    var directStage = scoped(appc, ':scope > main.visualizer-stage, :scope > main.glass-pane, :scope > .visualizer-stage, :scope > section.topology-panel, :scope > .topology-panel, :scope > main', 'main.visualizer-stage, main.glass-pane, .visualizer-stage, section.topology-panel, .topology-panel, main');
    if (appc && directSide && directStage && directSide.parentNode === appc && directStage.parentNode === appc) {
      var alreadyStandardSide = directSide.classList.contains('sidebar') && directStage.classList.contains('visualizer-stage');
      directSide.classList.add('sidebar');
      directStage.classList.add('visualizer-stage');
      var directHost = directStage.querySelector('.glass-pane') || directStage;
      if (directHost !== directStage && (directHost.classList.contains('matrix-panel') || directHost.classList.contains('verification-panel') || directHost.querySelector('svg[height="100%"], #graphSvg, .game-overlay'))) directHost = directStage;
      directHost.insertBefore(wrap, directHost.firstChild);
      appc.setAttribute('data-dm-side-shell', '1');
      shiftTopOverlays(directHost, wrap);
      return;
    }

    var mainContent = scoped(appc, ':scope > .main-content, :scope > .comparison-stage, :scope > .main-stage, :scope > .dashboard-main', '.main-content, .comparison-stage, .main-stage, .dashboard-main');
    var nestedSide = scoped(mainContent, ':scope > aside.control-panel, :scope > .control-panel, :scope > aside.side-panel, :scope > .side-panel, :scope > aside.left-panel, :scope > .left-panel', 'aside.control-panel, .control-panel, aside.side-panel, .side-panel, aside.left-panel, .left-panel');
    if (appc && mainContent && mainContent.parentNode === appc && appc.classList.contains('dashboard-container')) {
      var dashboardHost = scoped(mainContent, ':scope > .visualizer-container', '.visualizer-container') || mainContent;
      dashboardHost.insertBefore(wrap, dashboardHost.firstChild);
      return;
    }
    if (appc && mainContent && nestedSide && mainContent.parentNode === appc) {
      var generatedSide = el('aside', 'sidebar dm-generated-sidebar');
      var header = scoped(appc, ':scope > header, :scope > .app-header, :scope > .main-header, :scope > .dashboard-header', 'header, .app-header, .main-header, .dashboard-header');
      if (header && header.parentNode === appc) generatedSide.appendChild(header);
      generatedSide.appendChild(nestedSide);
      appc.insertBefore(generatedSide, mainContent);
      mainContent.classList.add('visualizer-stage');
      mainContent.insertBefore(wrap, mainContent.firstChild);
      appc.setAttribute('data-dm-side-shell', '1');
      shiftTopOverlays(mainContent, wrap);
      return;
    }

    // 兼容非标准外壳的内容面板
    var glass = document.querySelector('.glass-pane') || document.querySelector('.main-content');
    if (glass) {
      var paneHost = ((glass.classList.contains('matrix-panel') || glass.classList.contains('verification-panel')) && glass.parentElement) ? glass.parentElement : glass;
      paneHost.insertBefore(wrap, paneHost.firstChild);
      shiftTopOverlays(paneHost, wrap);
      return;
    }

    // 「应用式」案例页：.app-container 内含网格主区（.main-stage/.comparison-stage/<main>）。
    // 不能塞进网格里（会被挤成单列），而应作为整行兄弟插在主区之前。
    var grid = document.querySelector('.main-stage, .comparison-stage');
    if (!grid && appc) { var m = appc.querySelector(':scope > main'); if (m) grid = m; }
    if (appc && grid && grid.parentNode === appc) {
      grid.insertBefore(wrap, grid.firstChild);
      appc.setAttribute('data-dm-app', '1');   // 供 CSS 解除视口锁定
      shiftTopOverlays(grid, wrap);
      return;
    }

    // 兜底
    var host = grid || document.querySelector('main') || document.querySelector('.visualizer-stage') || appc || document.body;
    if (!host) return;
    host.insertBefore(wrap, host.firstChild);
    shiftTopOverlays(host, wrap);
  }
  // 防重叠：把宿主内「顶部吸附的绝对/固定定位覆盖层」下移一个三阶带高度，避免压住三阶带
  function shiftTopOverlays(host, wrap) {
    setTimeout(function () {
      var h = (wrap.offsetHeight || 0) + 18;
      if (h < 40) return;
      [].forEach.call(host.children, function (ch) {
        if (ch === wrap || ch.dataset.dmShifted) return;
        var cs = getComputedStyle(ch);
        if ((cs.position === 'absolute' || cs.position === 'fixed') && cs.top !== 'auto' && parseFloat(cs.top) < h) {
          ch.style.top = ((parseFloat(cs.top) || 0) + h) + 'px';
          ch.dataset.dmShifted = '1';
        }
      });
    }, 80);
  }

  function buildPaneSteps() {
    var p = el('div', 'dm-pane'); p.dataset.pane = 'steps';
    p.appendChild(el('div', 'dm-section-h', '六步教学流程 · ' + esc(META.title)));

    var prog = el('div', 'dm-progress');
    _pgFill = el('div', 'dm-progress-fill');
    var barWrap = el('div', 'dm-progress-bar'); barWrap.appendChild(_pgFill);
    _pgTxt = el('div', 'dm-progress-txt');
    prog.appendChild(barWrap); prog.appendChild(_pgTxt);
    p.appendChild(prog);

    var ul = el('ul', 'dm-steps');
    META.steps.forEach(function (s, i) {
      var li = el('li', 'dm-step'); li.dataset.idx = i;
      if (getDone().indexOf(i) >= 0) li.classList.add('done');
      li.innerHTML = '<span class="dm-step-num">' + (i + 1) + '</span>'
        + '<div class="dm-step-body"><div class="dm-step-name">' + esc(s.name) + '</div>'
        + '<div class="dm-step-desc">' + esc(s.desc) + '</div></div>';
      var chk = el('button', 'dm-step-check', '✓'); chk.title = '标记完成';
      chk.onclick = function (e) {
        e.stopPropagation();
        var done = getDone(), k = done.indexOf(i);
        if (k >= 0) { done.splice(k, 1); li.classList.remove('done'); bumpDim(STEP_DIM[i], -25); }
        else { done.push(i); li.classList.add('done'); bumpDim(STEP_DIM[i], 25); }
        setDone(done); updateProgress();
      };
      li.appendChild(chk);
      li.onclick = function () {
        currentStep = i;
        ul.querySelectorAll('.dm-step').forEach(function (x) { x.classList.remove('active'); });
        li.classList.add('active');
      };
      ul.appendChild(li);
    });
    p.appendChild(ul);
    setTimeout(updateProgress, 0);
    return p;
  }

  function buildPaneIdeo() {
    var p = el('div', 'dm-pane'); p.dataset.pane = 'ideo';
    var io = META.ideology;
    var card = el('div', 'dm-ideo-card');
    var dims = (io.dims || []).map(function (x) { return '<span class="dm-ideo-chip">' + esc(x) + '</span>'; }).join('');
    card.innerHTML = '<div class="dm-ideo-title">🚩 ' + esc(io.title || '价值引领') + '</div>'
      + '<p class="dm-ideo-text">' + esc(io.text || '') + '</p>'
      + (dims ? '<div class="dm-ideo-dims">' + dims + '</div>' : '')
      + (io.quote ? '<div class="dm-ideo-quote">' + esc(io.quote) + '</div>' : '');
    p.appendChild(card);
    return p;
  }

  function buildPaneReflect() {
    var p = el('div', 'dm-pane'); p.dataset.pane = 'reflect';
    p.appendChild(el('div', 'dm-section-h', '反思追问'));
    var ul = el('ul', 'dm-reflect-list');
    META.reflect.forEach(function (q) { ul.appendChild(el('li', null, esc(q))); });
    p.appendChild(ul);
    if (META.transfer && META.transfer.length) {
      p.appendChild(el('div', 'dm-section-h', '迁移拓展'));
      var grid = el('div', 'dm-transfer-grid');
      META.transfer.forEach(function (t, i) {
        var c = el('div', 'dm-transfer-card');
        if (typeof t === 'string') c.innerHTML = '<div class="dm-tc-t">🔀 变式 ' + (i + 1) + '</div><div class="dm-tc-d">' + esc(t) + '</div>';
        else c.innerHTML = '<div class="dm-tc-t">🔀 ' + esc(t.t || ('变式 ' + (i + 1))) + '</div><div class="dm-tc-d">' + esc(t.d || '') + '</div>';
        grid.appendChild(c);
      });
      p.appendChild(grid);
    }
    setTimeout(function () { typesetEl(p); }, 0);
    return p;
  }

  /* ---------- 六维能力雷达：面板 + 绘制 ---------- */
  var radarCanvas, radarScoreEl;
  function buildPaneRadar() {
    var p = el('div', 'dm-pane'); p.dataset.pane = 'radar';
    p.appendChild(el('div', 'dm-section-h', '建模能力档案 · 六维成长'));
    radarCanvas = el('canvas'); radarCanvas.id = 'dm-radar-canvas'; radarCanvas.width = 264; radarCanvas.height = 238;
    radarCanvas.setAttribute('aria-label', '六维能力雷达图');
    p.appendChild(radarCanvas);
    radarScoreEl = el('div', 'dm-radar-score');
    p.appendChild(radarScoreEl);
    var legend = el('div', 'dm-radar-legend'); legend.id = 'dm-radar-legend';
    p.appendChild(legend);
    p.appendChild(el('div', 'dm-ai-tip', '雷达随你的<b>学习行为</b>自动成长：完成六步、使用 AI 引导、提问、与本页互动，都会提升对应维度（仅记录于本浏览器）。'));
    var reset = el('button', 'dm-out-btn', '↺ 重置本节档案');
    reset.onclick = function () { try { localStorage.removeItem(RADAR_KEY); } catch (e) {} drawRadar(); };
    var rw = el('div', 'dm-out-actions'); rw.appendChild(reset); p.appendChild(rw);
    setTimeout(drawRadar, 0);
    return p;
  }
  function radarLevel(i) { return i >= 80 ? '卓越' : i >= 60 ? '熟练' : i >= 35 ? '进阶' : i > 0 ? '入门' : '待开启'; }
  function drawRadar() {
    if (!radarCanvas) return;
    var s = getScores(), ctx = radarCanvas.getContext('2d'), W = radarCanvas.width, H = radarCanvas.height;
    var cx = W / 2, cy = H / 2 + 2, R = 70, n = DIMS.length;
    ctx.clearRect(0, 0, W, H);
    function pt(i, r) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
    var i, p2;
    for (var ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      for (i = 0; i < n; i++) { p2 = pt(i, R * ring / 4); if (i === 0) ctx.moveTo(p2[0], p2[1]); else ctx.lineTo(p2[0], p2[1]); }
      ctx.closePath(); ctx.strokeStyle = 'rgba(214,59,29,0.14)'; ctx.lineWidth = 1; ctx.stroke();
    }
    for (i = 0; i < n; i++) { var e = pt(i, R); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(e[0], e[1]); ctx.strokeStyle = 'rgba(214,59,29,0.18)'; ctx.stroke(); }
    ctx.beginPath();
    for (i = 0; i < n; i++) { var v = (s[DIMS[i].key] || 0) / 100; p2 = pt(i, R * Math.max(0.04, v)); if (i === 0) ctx.moveTo(p2[0], p2[1]); else ctx.lineTo(p2[0], p2[1]); }
    ctx.closePath();
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,180,0,0.45)'); g.addColorStop(1, 'rgba(214,59,29,0.42)');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#D63B1D'; ctx.lineWidth = 2; ctx.stroke();
    for (i = 0; i < n; i++) { var vv = (s[DIMS[i].key] || 0) / 100; p2 = pt(i, R * Math.max(0.04, vv)); ctx.beginPath(); ctx.arc(p2[0], p2[1], 3, 0, 2 * Math.PI); ctx.fillStyle = '#D63B1D'; ctx.fill(); }
    ctx.font = '11px "Noto Serif SC", serif'; ctx.fillStyle = '#6B4A38'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (i = 0; i < n; i++) { var lp = pt(i, R + 17); ctx.fillText(DIMS[i].name, lp[0], lp[1]); }
    var idx = radarIndex(s);
    if (radarScoreEl) radarScoreEl.innerHTML = '建模能力指数 <b>' + idx + '</b> / 100 <span class="dm-radar-level">' + radarLevel(idx) + '</span>';
    var lg = panel && panel.querySelector('#dm-radar-legend');
    if (lg) lg.innerHTML = DIMS.map(function (d) { return '<span>' + d.name + '：<b>' + (s[d.key] || 0) + '</b></span>'; }).join('');
  }

  /* ---------- 7. 配置弹窗（友好 BYO-key 引导） ---------- */
  function buildModal() {
    var mask = el('div', 'dm-hidden'); mask.id = 'dm-modal-mask';
    mask.onclick = function (e) { if (e.target === mask) closeModal(); };
    var modal = el('div', 'dm-modal');
    modal.innerHTML =
      '<div class="dm-modal-head"><h3>🔑 配置 AI 助教（自带 DeepSeek 密钥）</h3>'
      + '<p>本页的 AI 引导由 DeepSeek 大模型驱动。为保护你的账号安全，需要你<b>填入自己的 API 密钥</b>——它只会保存在<b>你这台设备的浏览器里</b>，直接发往 DeepSeek 官方，<b>不会上传到本网站或任何第三方</b>。</p></div>';
    var bodyEl = el('div', 'dm-modal-body');
    bodyEl.innerHTML =
      '<ol class="dm-steps-guide">'
      + '<li>打开 <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener">platform.deepseek.com</a> 注册 / 登录（新用户通常有免费额度）。</li>'
      + '<li>进入「API Keys」页面，点击「创建 API key」，复制以 <code>sk-</code> 开头的密钥。</li>'
      + '<li>粘贴到下方输入框，点「保存」。之后点 AI 按钮即可获得为本节定制的引导。</li>'
      + '</ol>'
      + '<label class="dm-field-label">你的 DeepSeek API Key</label>'
      + '<div class="dm-key-input-row"><input class="dm-key-input" id="dm-key-input" type="password" placeholder="sk-xxxxxxxxxxxxxxxx" autocomplete="off" spellcheck="false"></div>'
      + '<div class="dm-modal-actions">'
      + '<button class="dm-btn" id="dm-save-key">保存</button>'
      + '<button class="dm-btn ghost" id="dm-test-key">测试连接</button>'
      + '<button class="dm-btn ghost" id="dm-show-key">👁 显示</button>'
      + '<button class="dm-btn ghost" id="dm-clear-key">清除密钥</button>'
      + '</div>'
      + '<div class="dm-test-result" id="dm-test-result"></div>'
      + '<div class="dm-modal-note">🔒 <b>隐私说明</b>：密钥仅存于浏览器 <code>localStorage</code>，刷新/重开仍在，换设备需重填；本项目为纯静态页面（GitHub Pages），<b>没有任何服务器会接触到你的密钥</b>。不想用时点「清除密钥」即可。无密钥也能用，AI 会切换为内置引导。</div>';
    modal.appendChild(bodyEl);
    mask.appendChild(modal);
    // 绑定（延迟到插入后）
    setTimeout(function () {
      var input = mask.querySelector('#dm-key-input');
      input.value = getKey();
      mask.querySelector('#dm-save-key').onclick = function () {
        var v = input.value.trim();
        if (v) { try { localStorage.setItem(LS_KEY, v); } catch (e) {} setTest('ok', '✅ 已保存。AI 助教已就绪！'); }
        else { try { localStorage.removeItem(LS_KEY); } catch (e) {} setTest('err', '已清空密钥。'); }
        refreshStatus();
      };
      mask.querySelector('#dm-clear-key').onclick = function () {
        input.value = ''; try { localStorage.removeItem(LS_KEY); } catch (e) {}
        setTest('err', '已清除密钥，AI 将使用内置引导。'); refreshStatus();
      };
      mask.querySelector('#dm-show-key').onclick = function () {
        input.type = input.type === 'password' ? 'text' : 'password';
      };
      mask.querySelector('#dm-test-key').onclick = async function () {
        var v = input.value.trim();
        if (!v) { setTest('err', '请先填入密钥再测试。'); return; }
        try { localStorage.setItem(LS_KEY, v); } catch (e) {}
        setTest('wait', '⏳ 正在连接 DeepSeek …');
        var r = await callDeepSeek('hint');
        if (r.ok) { setTest('ok', '✅ 连接成功！模型可用。'); refreshStatus(); }
        else if (r.reason === 'auth') setTest('err', '❌ 密钥无效（401）。请检查是否复制完整、账户是否有额度。');
        else if (r.reason === 'timeout') setTest('err', '⌛ 连接超时，请检查网络后重试。');
        else if (r.reason === 'network') setTest('err', '❌ 网络/跨域失败，请检查网络连接。');
        else setTest('err', '❌ 调用失败（' + (r.detail || r.reason) + '）。');
      };
    }, 0);
    return mask;
  }
  function setTest(kind, msg) { var e = modalMask.querySelector('#dm-test-result'); if (e) { e.className = 'dm-test-result ' + kind; e.textContent = msg; } }
  function openModal() { modalMask.classList.remove('dm-hidden'); var i = modalMask.querySelector('#dm-key-input'); if (i) i.value = getKey(); }
  function closeModal() { modalMask.classList.add('dm-hidden'); }

  /* ---------- 8. 交互行为 ---------- */
  function togglePanel() {
    if (onboard) dismissOnboard();
    var open = !panel.classList.contains('dm-hidden');
    if (open) { panel.classList.add('dm-hidden'); launcher.classList.remove('dm-hidden'); }
    else {
      panel.classList.remove('dm-hidden'); launcher.classList.add('dm-hidden');
      var inp = panel.querySelector('.dm-ask-input'); if (inp && window.innerWidth > 480) setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
    }
  }
  function switchTab(id) {
    panel.querySelectorAll('.dm-tab').forEach(function (t) { t.classList.toggle('active', t.dataset.tab === id); });
    panel.querySelectorAll('.dm-pane').forEach(function (p) { p.classList.toggle('active', p.dataset.pane === id); });
    try { localStorage.setItem('dm_last_tab', id); } catch (e) {}
    var activePane = panel.querySelector('.dm-pane.active');
    typesetEl(activePane);
    if (IS_CASE) {
      if (id === 'reflect') bump({ transfer: 5 });
      else if (id === 'ideo') bump({ context: 4 });
      else if (id === 'radar') drawRadar();
    }
  }
  function refreshStatus() {
    if (!aiStatusEl) return;
    if (hasKey()) { aiStatusEl.className = 'dm-ai-status online'; aiStatusEl.textContent = '● 已就绪'; }
    else { aiStatusEl.className = 'dm-ai-status offline'; aiStatusEl.textContent = '未配置（内置引导）'; }
  }

  var _aiBusy = false;
  function setBusy(b) {
    _aiBusy = b;
    panel.querySelectorAll('.dm-ai-btn').forEach(function (x) { x.disabled = b; });
    var send = panel.querySelector('.dm-ask-send'); if (send) send.disabled = b;
  }

  var ROLE_REQ = {
    scenario: "请围绕本节主题，生成一个贴合该难度的课堂练习场景，包含具体可操作的数据与 3~4 个递进小任务。只给任务，不给答案。",
    hint: "我卡住了，请用 2~4 个递进的引导性问题点拨我，不要直接给出最终结论；涉及概念判定时提醒我回到定义自查。",
    diagnose: "请按六维评价（情境理解/对象抽象/数学建模/推理计算/工程解释/迁移应用）给我一份自检清单，帮我定位本节最可能出错的环节。",
    transfer: "请基于本节主题，给我 2~3 个迁移变式题（改变条件 / 换更一般的结构 / 换真实工程场景），只给题不给解。"
  };
  function convoSystem() {
    return "你是离散数学课程「" + META.chapter + " · " + META.section + "」的 AI 学习伙伴。你能扮演情境生成、苏格拉底提示、错误诊断、迁移变式等角色，也能直接解答学生关于本节的问题；这是一场多轮对话，请记住并自然衔接上文。需要时用 $...$ 或 $$...$$ 书写 LaTeX 公式。"
      + "\n\n【本节知识锚定】" + META.grounding + "\n\n" + GUARD;
  }

  function runRole(role) { runAI(role, null); }
  function runAsk(question) { runAI('ask', question); }

  async function runAI(role, question) {
    if (_aiBusy) return;
    switchTab('ai');
    bump(ROLE_DIM[role]);
    var userText = role === 'ask' ? question : ROLE_REQ[role];
    if (!userText) return;

    renderTurn('user', userText);
    scrollTranscript();

    if (!hasKey()) {
      if (role === 'ask') {
        var mq = addMsg('assistant', '💬 学习伙伴');
        mq.body.innerHTML = '<p>自由提问需要 AI 在线作答。请先点「<b>⚙ 配置 AI</b>」填入你的 DeepSeek 密钥（仅存本浏览器）。</p>';
        var cfg = el('div', 'dm-msg-copy', '⚙ 现在配置'); cfg.onclick = openModal; mq.msg.appendChild(cfg);
      } else {
        var f = genericFallback(role);
        var mb = addMsg('assistant', ROLE_LABEL[role] + ' · 内置引导');
        mb.body.innerHTML = '<p>' + esc(f.lead) + '</p><ul>' + f.list.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'
          + '<div class="dm-ai-tip" style="margin-top:8px">💡 配置密钥后即可<b>多轮连续追问</b>、获得为本节定制的解答。</div>';
      }
      scrollTranscript();
      return; // 无密钥不写入 convo（保持上下文为真实模型对话）
    }

    convo.push({ role: 'user', content: userText }); saveConvo();
    setBusy(true);
    var m = addMsg('assistant', ROLE_LABEL[role]);
    m.body.innerHTML = '<div class="dm-loading"><span class="dm-spin"></span>DeepSeek 正在思考…</div>';
    scrollTranscript();

    var messages = [{ role: 'system', content: convoSystem() }].concat(
      convo.slice(-8).map(function (x) { return { role: x.role, content: x.content }; }));
    var onDelta = function (full) { m.body.innerHTML = mdToHtml(full) + '<span class="dm-stream-cursor"></span>'; scrollTranscript(); };
    var r = await callDeepSeekRaw(messages, role === 'ask' ? 0.5 : (ROLE_TEMP[role] || 0.7), role === 'ask' ? 900 : 760, onDelta);
    setBusy(false);

    if (r.ok) {
      m.body.innerHTML = mdToHtml(r.text);
      attachCopy(m.msg, r.text);
      convo.push({ role: 'assistant', content: r.text }); saveConvo();
      typesetEl(m.body); scrollTranscript();
      var inp = panel.querySelector('.dm-ask-input'); if (inp && window.innerWidth > 480) { try { inp.focus(); } catch (e) {} }
    } else if (r.reason === 'auth') {
      m.body.innerHTML = '<p style="color:#C0392B"><b>密钥无效（401）。</b>请点「⚙ 配置 AI」重新填写。</p>';
      openModal(); setTest('err', '❌ 密钥无效，请重新填写。');
    } else {
      m.body.innerHTML = '<p style="color:#C0392B">本次调用失败（' + (r.reason === 'timeout' ? '超时' : r.reason === 'network' ? '网络/跨域' : (r.detail || r.reason)) + '）。请检查网络或密钥后，在下方继续追问即可重试。</p>';
    }
    scrollTranscript();
  }

  /* ---------- 9. 启动 ---------- */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();

  window.DMTutor = { open: function () { panel.classList.remove('dm-hidden'); launcher.classList.add('dm-hidden'); }, config: openModal, meta: META };
})();
