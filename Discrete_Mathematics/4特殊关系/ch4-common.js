/* 第4章 特殊关系 · 进阶层共用小工具：页内提示条（替代 alert），样式见 ch4.css */
(function () {
  'use strict';
  window.ch4Toast = function (msg, kind) {
    var host = document.querySelector('.c4-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'c4-toast-host';
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    var t = document.createElement('div');
    t.className = 'c4-toast' + (kind ? ' ' + kind : '');
    t.textContent = msg;
    host.appendChild(t);
    while (host.children.length > 3) host.removeChild(host.firstChild);
    setTimeout(function () {
      t.classList.add('out');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 260);
    }, 2600);
  };
})();
