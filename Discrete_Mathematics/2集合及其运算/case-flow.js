/* =============================================================================
 * case-flow.js —— 第2章 案例单元六段式渲染器
 * 用法：页面放 <div id="cfTop"></div>（交互区之前）与 <div id="cfBottom"></div>（交互区之后），
 *       交互区容器加 id（cfg.solveId），然后调用：
 *   CaseFlow.mount({
 *     tier: '认识模型' | '求解模型' | '拓展模型',
 *     scene: '情境背景（HTML）',
 *     model: [['现实对象', '数学对象'], ...], modelNote: '补充说明（可选）',
 *     solveId: 'vizArea', solve: '③ 交互求解的一句话提示',
 *     read: '结果解读初始 HTML（交互时调用 CaseFlow.read(html) 更新）',
 *     value: '价值引领（HTML；缺省取 SECTION_META.ideology.text）',
 *     transfer: ['迁移思考 1', '迁移思考 2']
 *   });
 * ========================================================================== */
(function () {
  var NAMES = ['情境背景', '数学建模', '交互求解', '结果解读', '价值引领', '迁移思考'];
  function h(n, title, sub) {
    return '<h3><span class="n">' + n + '</span>' + title + (sub ? ' <small>' + sub + '</small>' : '') + '</h3>';
  }
  function mount(cfg) {
    var top = document.getElementById('cfTop');
    var bottom = document.getElementById('cfBottom');
    if (!top || !bottom) return;
    var meta = window.SECTION_META || {};
    var ideo = meta.ideology || {};
    var nav = '<nav class="cf-nav" aria-label="案例六段式">' +
      (cfg.tier ? '<span class="cf-tier">' + cfg.tier + '</span>' : '') +
      NAMES.map(function (t, i) { return '<a href="#cf-' + (i + 1) + '"><i>' + (i + 1) + '</i>' + t + '</a>'; }).join('') +
      '</nav>';
    var map = '<table class="cf-map"><thead><tr><th>现实对象</th><th></th><th>数学对象</th></tr></thead><tbody>' +
      (cfg.model || []).map(function (r) { return '<tr><td>' + r[0] + '</td><td class="arrow">→</td><td>' + r[1] + '</td></tr>'; }).join('') +
      '</tbody></table>' + (cfg.modelNote ? '<p style="margin-top:8px">' + cfg.modelNote + '</p>' : '');
    top.innerHTML = nav +
      '<div class="cf-row">' +
      '<section class="cf-sec" id="cf-1">' + h(1, '情境背景') + cfg.scene + '</section>' +
      '<section class="cf-sec" id="cf-2">' + h(2, '数学建模') + map + '</section>' +
      '</div>';
    var solve = cfg.solveId && document.getElementById(cfg.solveId);
    if (solve && !document.getElementById('cf-3')) {
      var head = document.createElement('div');
      head.className = 'cf-solve-head';
      head.id = 'cf-3';
      head.innerHTML = '<span class="n">3</span>交互求解' + (cfg.solve ? ' <small>' + cfg.solve + '</small>' : '');
      solve.parentNode.insertBefore(head, solve);
    }
    var dims = (ideo.dims || []).map(function (d) { return '<span>' + d + '</span>'; }).join('');
    bottom.innerHTML =
      '<div class="cf-row3">' +
      '<section class="cf-sec cf-read" id="cf-4">' + h(4, '结果解读') + '<div id="cfRead">' + (cfg.read || '') + '</div></section>' +
      '<section class="cf-sec cf-value" id="cf-5">' + h(5, '价值引领', ideo.title || '') + '<p>' + (cfg.value || ideo.text || '') + '</p>' +
      (dims ? '<div class="cf-dims">' + dims + '</div>' : '') + '</section>' +
      '<section class="cf-sec" id="cf-6">' + h(6, '迁移思考') + '<ul>' + (cfg.transfer || []).map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></section>' +
      '</div>';
    top.querySelectorAll('.cf-nav a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var t = document.querySelector(a.getAttribute('href'));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }
  function read(html) {
    var el = document.getElementById('cfRead');
    if (el) el.innerHTML = html;
  }
  window.CaseFlow = { mount: mount, read: read };
})();
