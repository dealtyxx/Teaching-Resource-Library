/* ===== 屏幕自适配（内容感知）：按可视区域 + 本页实际内容高度等比缩放整页，
   使不同分辨率、不同内容量的页面首屏都尽量整屏贴合、观感一致。
   重内容页（控件/可视化更多）会自动多缩一点以放进一屏，与轻内容页保持一致；
   仍放不下时由整页滚动兜底（见 discrete-ui.css）。仅桌面宽度(≥920px)生效，
   移动端交由各页既有响应式 CSS 处理。先在 <head> 做基准缩放（无跳动），
   内容就绪后再按内容高度精确贴合。===== */
(function () {
  'use strict';
  if (window.__DM_SCREEN_FIT__) return;
  window.__DM_SCREEN_FIT__ = true;

  var BASE_W = 1600, BASE_H = 940;   // 页面布局所基于的桌面基准尺寸
  var MIN = 0.55, MAX = 1.30;        // 缩放下/上限，避免过小或过大
  var MOBILE_BP = 920;               // 与各页 @media(max-width:900px) 对齐
  var FOOTER_PAD = 86;               // 固定页脚 + 顶部按钮的留白

  function apply(measure) {
    var root = document.documentElement;
    var w = window.innerWidth || root.clientWidth || 0;
    var h = window.innerHeight || root.clientHeight || 0;
    if (!w || !h) return;
    if (document.querySelector('.app-container')) { root.style.zoom = ''; return; }
    if (w < MOBILE_BP) { root.style.zoom = ''; return; }   // 移动端不缩放

    var s = Math.min(w / BASE_W, h / BASE_H);              // 基准等比缩放

    // 内容感知：测量本页 .app-container 自然高度，必要时再缩小以放进一屏（只缩不放大）
    if (measure) {
      var app = document.querySelector('.app-container');
      if (app) {
        root.style.zoom = '';                              // 同帧复位测量，避免可见闪动
        var need = Math.max(app.scrollHeight, app.offsetHeight) + FOOTER_PAD;
        if (need > 0) s = Math.min(s, h / need);
      }
    }

    s = Math.max(MIN, Math.min(MAX, s));
    root.style.zoom = String(Math.round(s * 1000) / 1000);
  }

  var rt;
  function relayout() { clearTimeout(rt); rt = setTimeout(function () { apply(true); }, 120); }

  apply(false);                                            // 首屏前：基准缩放，无跳动
  document.addEventListener('DOMContentLoaded', function () { apply(true); });
  window.addEventListener('load', function () { apply(true); });
  // 三阶导航带 / 可视化为异步注入，延时多测几次以稳定贴合
  [250, 700, 1500].forEach(function (d) { setTimeout(function () { apply(true); }, d); });
  window.addEventListener('resize', relayout);
  window.addEventListener('orientationchange', relayout);
})();

(function () {
  'use strict';
  if (window.__DM_MATHJAX_AUTO__) return;
  window.__DM_MATHJAX_AUTO__ = true;

  var SRC = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  var pending = false;
  var waiting = false;
  var observer = null;
  var normalizePending = false;
  var plainScriptRe = /([A-Za-z0-9)\]}]|[α-ωΑ-Ω]|[∅ℤℕℚℝℂ])([\^_])(\{[^{}]{1,24}\}|[-+]?\d+|[A-Za-z][A-Za-z0-9]{0,12}|\([^()]{1,24}\))/g;
  var plainMathProbeRe = /([A-Za-z0-9)\]}]|[α-ωΑ-Ω]|[∅ℤℕℚℝℂ])[\^_](?:\{[^{}]{1,24}\}|[-+]?\d+|[A-Za-z][A-Za-z0-9]{0,12}|\([^()]{1,24}\))/;
  var texDelimiterRe = /(?:\$|\\\(|\\\[|\\begin\{|\\end\{)/;
  var mathjaxMathRe = /(?:\$\$|\\\(|\\\[|\\begin\{|(^|[^\\])\$[^$\n]{1,160}\$)/;
  var skipTagRe = /^(SCRIPT|NOSCRIPT|STYLE|TEXTAREA|PRE|CODE|KBD|SAMP|MATH|MJX-CONTAINER|SVG|CANVAS|SELECT|OPTION|INPUT|BUTTON)$/;

  function mergeConfig() {
    var cfg = window.MathJax || {};
    cfg.tex = cfg.tex || {};
    cfg.tex.inlineMath = cfg.tex.inlineMath || [['\\(', '\\)'], ['$', '$']];
    cfg.tex.displayMath = cfg.tex.displayMath || [['\\[', '\\]'], ['$$', '$$']];
    cfg.tex.processEscapes = true;
    cfg.tex.processEnvironments = true;
    cfg.options = cfg.options || {};
    cfg.options.skipHtmlTags = cfg.options.skipHtmlTags || ['script', 'noscript', 'style', 'textarea', 'pre', 'code'];
    ['math', 'mjx-container', 'svg', 'canvas'].forEach(function (tag) {
      if (cfg.options.skipHtmlTags.indexOf(tag) < 0) cfg.options.skipHtmlTags.push(tag);
    });
    cfg.options.ignoreHtmlClass = cfg.options.ignoreHtmlClass || 'tex2jax_ignore|mathjax_ignore';
    cfg.options.processHtmlClass = cfg.options.processHtmlClass || 'tex2jax_process|mathjax_process';
    cfg.svg = cfg.svg || {};
    cfg.svg.fontCache = cfg.svg.fontCache || 'global';
    cfg.chtml = cfg.chtml || {};
    cfg.chtml.matchFontHeight = false;
    cfg.startup = cfg.startup || {};
    if (cfg.startup.typeset == null) cfg.startup.typeset = false;
    window.MathJax = cfg;
  }

  function hasMathText(root) {
    root = root || document.body || document.documentElement;
    if (!root) return false;
    if (root.nodeType === 3) {
      return !shouldSkipPlainMath(root.parentNode) && mathjaxMathRe.test(root.nodeValue || '');
    }
    if (root.nodeType !== 1 && root.nodeType !== 9) return false;
    if (root.nodeType === 1 && shouldSkipPlainMath(root)) return false;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!mathjaxMathRe.test(node.nodeValue || '')) return NodeFilter.FILTER_REJECT;
        return shouldSkipPlainMath(node.parentNode) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    return !!walker.nextNode();
  }

  function shouldSkipPlainMath(parent) {
    while (parent && parent !== document.body && parent !== document.documentElement) {
      if (skipTagRe.test(parent.tagName || '')) return true;
      if (parent.classList) {
        if (parent.classList.contains('mathjax_ignore') || parent.classList.contains('tex2jax_ignore')) return true;
        if (parent.classList.contains('dm-no-math') || parent.classList.contains('dm-math-normalized')) return true;
      }
      if (parent.isContentEditable) return true;
      parent = parent.parentElement;
    }
    return false;
  }

  function cleanScriptToken(raw) {
    if (!raw) return raw;
    if (raw.charAt(0) === '{' && raw.charAt(raw.length - 1) === '}') return raw.slice(1, -1);
    return raw;
  }

  function normalizeTextNode(node) {
    if (!node || node.nodeType !== 3 || !node.parentNode) return false;
    var text = node.nodeValue || '';
    if (!plainMathProbeRe.test(text) || texDelimiterRe.test(text)) return false;
    if (shouldSkipPlainMath(node.parentNode)) return false;

    plainScriptRe.lastIndex = 0;
    var frag = document.createDocumentFragment();
    var last = 0;
    var changed = false;
    var match;
    while ((match = plainScriptRe.exec(text))) {
      if (match.index > last) frag.appendChild(document.createTextNode(text.slice(last, match.index)));
      frag.appendChild(document.createTextNode(match[1]));
      var script = document.createElement(match[2] === '^' ? 'sup' : 'sub');
      script.className = 'dm-math-script dm-math-normalized';
      script.textContent = cleanScriptToken(match[3]);
      frag.appendChild(script);
      last = match.index + match[0].length;
      changed = true;
    }
    if (!changed) return false;
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
    return true;
  }

  function normalizePlainMath(root) {
    root = root || document.body;
    if (!root) return false;
    if (root.nodeType === 3) return normalizeTextNode(root);
    if (root.nodeType !== 1 && root.nodeType !== 9) return false;
    if (root.nodeType === 1 && shouldSkipPlainMath(root)) return false;
    var changed = false;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var text = node.nodeValue || '';
        if (!plainMathProbeRe.test(text) || texDelimiterRe.test(text)) return NodeFilter.FILTER_REJECT;
        return shouldSkipPlainMath(node.parentNode) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);
    for (var i = 0; i < nodes.length; i++) {
      if (normalizeTextNode(nodes[i])) changed = true;
    }
    return changed;
  }

  function scheduleNormalize(root) {
    if (normalizePending) return;
    normalizePending = true;
    setTimeout(function () {
      normalizePending = false;
      normalizePlainMath(root || document.body);
    }, 50);
  }

  function cleanupNestedMathJax(root) {
    root = root || document.body;
    if (!root || !root.querySelectorAll) return;
    var assistive = root.querySelectorAll('mjx-assistive-mml');
    Array.prototype.forEach.call(assistive, function (box) {
      var nested = box.querySelector('mjx-container');
      if (!nested) return;
      var math = nested.querySelector('mjx-assistive-mml > math');
      box.textContent = '';
      if (math) box.appendChild(math.cloneNode(true));
    });
  }

  function typeset(root) {
    if (!root || !window.MathJax || !window.MathJax.typesetPromise) return;
    if (!hasMathText(root)) return;
    try {
      window.MathJax.typesetPromise([root]).then(function () {
        cleanupNestedMathJax(root || document.body);
      }).catch(function () {
        cleanupNestedMathJax(root || document.body);
      });
    } catch (e) {}
  }

  function scheduleTypeset(root) {
    if (pending) return;
    pending = true;
    setTimeout(function () {
      pending = false;
      typeset(root || document.body);
    }, 80);
  }

  function waitForReady(root) {
    if (waiting) return;
    waiting = true;
    var tries = 0;
    var timer = setInterval(function () {
      if (window.MathJax && window.MathJax.typesetPromise) {
        clearInterval(timer);
        waiting = false;
        scheduleTypeset(root || document.body);
      } else if (++tries > 80) {
        clearInterval(timer);
        waiting = false;
      }
    }, 100);
  }

  function ensureScript() {
    if (window.MathJax && window.MathJax.typesetPromise) {
      scheduleTypeset(document.body);
      return;
    }
    mergeConfig();
    if (document.querySelector('script[src*="mathjax@3"],script[src*="tex-mml-chtml"]')) {
      waitForReady(document.body);
      return;
    }
    var s = document.createElement('script');
    s.id = 'MathJax-script';
    s.async = true;
    s.src = SRC;
    s.onload = function () { waitForReady(document.body); };
    document.head.appendChild(s);
  }

  function observeDynamicMath() {
    if (observer || !window.MutationObserver || !document.body) return;
    observer = new MutationObserver(function (records) {
      var needsNormalize = false;
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.type === 'characterData') {
          var value = r.target.nodeValue || '';
          if (plainMathProbeRe.test(value) && !texDelimiterRe.test(value)) needsNormalize = true;
          if (mathjaxMathRe.test(value)) {
            ensureScript();
            scheduleTypeset(document.body);
          }
          if (needsNormalize) {
            scheduleNormalize(document.body);
            return;
          }
          continue;
        }
        for (var j = 0; j < r.addedNodes.length; j++) {
          var n = r.addedNodes[j];
          if (n.nodeType === 1) {
            if (normalizePlainMath(n)) needsNormalize = false;
            if (hasMathText(n)) {
              ensureScript();
              scheduleTypeset(n);
              return;
            }
          }
          if (n.nodeType === 3) {
            var t = n.nodeValue || '';
            if (plainMathProbeRe.test(t) && !texDelimiterRe.test(t)) needsNormalize = true;
            if (mathjaxMathRe.test(t)) {
              ensureScript();
              scheduleTypeset(document.body);
              return;
            }
          }
        }
        if (needsNormalize) {
          scheduleNormalize(document.body);
          return;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  window.DMMathJax = {
    ensure: ensureScript,
    typeset: function (root) {
      normalizePlainMath(root || document.body);
      ensureScript();
      scheduleTypeset(root || document.body);
    },
    normalize: normalizePlainMath,
    cleanup: cleanupNestedMathJax
  };

  mergeConfig();
  document.addEventListener('DOMContentLoaded', function () {
    observeDynamicMath();
    normalizePlainMath(document.body);
    setTimeout(function () { cleanupNestedMathJax(document.body); }, 500);
    if (hasMathText(document.body)) ensureScript();
  });
  window.addEventListener('load', function () {
    normalizePlainMath(document.body);
    setTimeout(function () { cleanupNestedMathJax(document.body); }, 500);
    if (hasMathText(document.body)) ensureScript();
  });
  [250, 800, 1600, 2800].forEach(function (d) {
    setTimeout(function () {
      normalizePlainMath(document.body);
      cleanupNestedMathJax(document.body);
    }, d);
  });
})();
