/* 自动上标 / 下标：把纯文本里的指数与下标写法渲染为真正的 <sup>/<sub>。
   上标：a^k、a^φ(n)、a^(p-1)、5^12 等（^ 记法）。
   下标：S_1、S_i、x_(n+1) 等（_ 记法）。
   覆盖静态内容与动态注入内容（侧栏结果、可视化格子、三阶层次案例、价值说明等）。
   仅处理纯文本，不碰 MathJax(\(...\)) 渲染结果，二者互不冲突。 */
(function () {
  'use strict';
  if (window.__DM_AUTO_SUP__) return;
  window.__DM_AUTO_SUP__ = true;

  // op(^ 或 _) + token：括号组 (….) 或 字母/数字/希腊字母 phi 串，后面可再带一个括号组
  var TOKEN = '([\\^_])\\s*(\\([^)]*\\)|[A-Za-z0-9\\u03c6\\u03d5\\u03a6\\u0278]+(?:\\([^)]*\\))?)';
  var TEST = new RegExp(TOKEN);
  var ALL = new RegExp(TOKEN, 'g');
  var SKIP = { SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1, TEXTAREA: 1, INPUT: 1, OPTION: 1, SELECT: 1, SUP: 1, SUB: 1 };

  function blocked(el) {
    while (el && el.nodeType === 1) {
      if (SKIP[el.tagName]) return true;
      var c = el.className;
      if (c && c.baseVal != null) c = c.baseVal; // SVG className
      if (typeof c === 'string' && /mjx|MathJax|tex2jax_ignore/.test(c)) return true;
      el = el.parentNode;
    }
    return false;
  }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function repl(_m, op, body) {
    return op === '^' ? ('<sup>' + body + '</sup>') : ('<sub>' + body + '</sub>');
  }
  function has(v) { return v && (v.indexOf('^') >= 0 || v.indexOf('_') >= 0); }

  function process(root) {
    if (!root) return;
    if (root.nodeType === 3) { root = root.parentNode; }
    if (!root || root.nodeType !== 1) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var hits = [], n;
    while ((n = walker.nextNode())) {
      var v = n.nodeValue;
      if (has(v) && TEST.test(v) && !blocked(n.parentNode)) hits.push(n);
    }
    for (var i = 0; i < hits.length; i++) {
      var node = hits[i];
      var span = document.createElement('span');
      span.innerHTML = esc(node.nodeValue).replace(ALL, repl);
      if (node.parentNode) node.parentNode.replaceChild(span, node);
    }
  }

  function boot() {
    process(document.body);
    if (window.MutationObserver) {
      new MutationObserver(function (records) {
        for (var i = 0; i < records.length; i++) {
          var r = records[i];
          for (var j = 0; j < r.addedNodes.length; j++) {
            var a = r.addedNodes[j];
            if (a.nodeType === 1) process(a);
            else if (a.nodeType === 3 && has(a.nodeValue)) process(a.parentNode);
          }
          if (r.type === 'characterData' && r.target && has(r.target.nodeValue)) {
            process(r.target.parentNode);
          }
        }
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
