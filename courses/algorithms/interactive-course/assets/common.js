/* =========================================================
   算法课堂 v2 · 游戏化引擎 + 交互工具
   ========================================================= */
(function () {
  'use strict';

  const XP_KEY = 'algo_course_xp_v2';
  const STAR_KEY = 'algo_course_stars_v2';

  function loadJSON(k, def) {
    try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; }
  }
  function saveJSON(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  }

  // ---------- XP / Level ----------
  const state = {
    xp: loadJSON(XP_KEY, 0) || 0,
    stars: loadJSON(STAR_KEY, {}) || {},
  };

  function levelOf(xp) {
    return Math.floor(Math.sqrt(xp / 50)) + 1;
  }
  function xpForLevel(lv) {
    return (lv - 1) * (lv - 1) * 50;
  }
  function xpProgress() {
    const lv = levelOf(state.xp);
    const cur = xpForLevel(lv);
    const next = xpForLevel(lv + 1);
    const pct = next === cur ? 100 : ((state.xp - cur) / (next - cur)) * 100;
    return { lv, pct: Math.min(100, Math.max(0, pct)), next: next - state.xp };
  }

  function ensureHUD() {
    if (document.querySelector('.game-hud')) return;
    const hud = document.createElement('div');
    hud.className = 'game-hud';
    hud.innerHTML = `
      <div class="xp-ring" data-level="1" style="--xp-pct:0%"></div>
      <div class="xp-info">
        <div><strong id="hud-xp">0</strong> XP</div>
        <div class="stars" id="hud-stars">☆ 收集星星吧</div>
      </div>`;
    document.body.appendChild(hud);
    refreshHUD();
  }

  function refreshHUD() {
    const { lv, pct } = xpProgress();
    const ring = document.querySelector('.game-hud .xp-ring');
    if (ring) {
      ring.dataset.level = String(lv);
      ring.style.setProperty('--xp-pct', pct + '%');
    }
    const xpEl = document.getElementById('hud-xp');
    if (xpEl) xpEl.textContent = state.xp;
    const stars = Object.values(state.stars).reduce((a, b) => a + b, 0);
    const st = document.getElementById('hud-stars');
    if (st) st.textContent = stars ? `★ ${stars} 星已点亮` : '☆ 完成测验得星';
  }

  window.addXP = function (amount, reason) {
    const before = levelOf(state.xp);
    state.xp += amount;
    saveJSON(XP_KEY, state.xp);
    const after = levelOf(state.xp);
    refreshHUD();
    toast(`+${amount} XP${reason ? ' · ' + reason : ''}`, '⚡', amount);
    if (after > before) {
      confetti(80);
      toast(`升级！达到 Lv.${after}`, '🎉', 0);
    }
  };

  window.addStar = function (chapterId, n = 1) {
    state.stars[chapterId] = (state.stars[chapterId] || 0) + n;
    saveJSON(STAR_KEY, state.stars);
    refreshHUD();
    confetti(60);
    toast(`点亮 ${'★'.repeat(n)}`, '🌟', 0);
  };

  // ---------- Toast ----------
  function ensureToastHost() {
    let h = document.querySelector('.toast-host');
    if (!h) {
      h = document.createElement('div');
      h.className = 'toast-host';
      document.body.appendChild(h);
    }
    return h;
  }

  window.toast = function (msg, ico = '✨', xp = 0) {
    const host = ensureToastHost();
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="ico">${ico}</span><span>${msg}</span>${xp ? `<span class="xp-gain">+${xp}</span>` : ''}`;
    host.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 300);
    }, 2600);
  };

  // ---------- Confetti ----------
  window.confetti = function (count = 50) {
    let canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      document.body.appendChild(canvas);
    }
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const colors = ['#7aa2ff', '#c4a1ff', '#ff8ec8', '#3ee8a8', '#ffc14d', '#4de8ff'];
    const parts = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: -20 - Math.random() * 80,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 6,
      vy: 2 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));
    let frame = 0;
    function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.rot += p.vr;
        p.life -= 0.012;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if (frame < 100) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
    tick();
  };

  // ---------- Sidebar ----------
  window.toggleSidebar = function () {
    document.querySelector('.sidebar')?.classList.toggle('open');
  };
  document.addEventListener('click', (e) => {
    if (e.target.closest('.sidebar .nav-link') && innerWidth <= 900) {
      document.querySelector('.sidebar')?.classList.remove('open');
    }
  });

  // ---------- TOC scroll spy ----------
  function initTOC() {
    const sections = document.querySelectorAll('[data-section]');
    const tocLinks = document.querySelectorAll('.nav-link.toc');
    if (!sections.length || !tocLinks.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const id = en.target.getAttribute('data-section');
          tocLinks.forEach((a) => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px' });
    sections.forEach((s) => obs.observe(s));
  }

  // ---------- Helpers ----------
  window.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  window.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  window.renderArray = function (container, arr, states = {}) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;
    container.innerHTML = arr.map((v, i) => {
      const st = states[i] || '';
      return `<div class="cell ${st}" data-i="${i}">${v}<span class="idx">${i}</span></div>`;
    }).join('');
  };

  window.setStatus = function (sel, html) {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = html;
  };

  // Speed control helper
  window.makeSpeed = function (defaultMs = 300) {
    let ms = defaultMs;
    return {
      get ms() { return ms; },
      set(v) { ms = v; },
      bind(root) {
        root?.querySelectorAll('[data-speed]').forEach((btn) => {
          btn.addEventListener('click', () => {
            root.querySelectorAll('[data-speed]').forEach((b) => b.classList.remove('on'));
            btn.classList.add('on');
            ms = +btn.dataset.speed;
          });
        });
      },
    };
  };

  // ---------- Quiz with XP ----------
  window.initQuiz = function (rootSel, opts = {}) {
    const root = document.querySelector(rootSel);
    if (!root) return;
    const chapterId = opts.chapterId || document.body.dataset.chapter || 'ch';
    const letters = ['A', 'B', 'C', 'D', 'E'];
    root.querySelectorAll('.quiz-option').forEach((btn, i) => {
      if (!btn.querySelector('.opt-letter')) {
        const letter = document.createElement('span');
        letter.className = 'opt-letter';
        letter.textContent = letters[i] || String(i + 1);
        btn.prepend(letter);
      }
      btn.addEventListener('click', () => {
        if (root.dataset.locked) return;
        const ok = btn.dataset.correct === '1';
        btn.classList.add(ok ? 'correct' : 'wrong');
        if (ok) {
          root.dataset.locked = '1';
          root.querySelectorAll('.quiz-option').forEach((b) => {
            if (b.dataset.correct === '1') b.classList.add('correct');
            else b.style.opacity = '0.45';
          });
          const fb = root.querySelector('.quiz-feedback');
          if (fb) fb.style.display = 'block';
          const xp = +(root.dataset.xp || 30);
          addXP(xp, '答对啦');
          addStar(chapterId, 1);
        } else {
          toast('再想想看～', '💭');
        }
      });
    });
  };

  // ---------- Complexity chart ----------
  window.drawComplexityChart = function (canvasId, nMax = 40) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 600;
    const h = canvas.clientHeight || 340;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pad = { t: 28, r: 16, b: 38, l: 48 };
    const plotW = w - pad.l - pad.r;
    const plotH = h - pad.t - pad.b;
    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = 'rgba(122,162,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.t + (plotH * i) / 5;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + plotW, y); ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, pad.t + plotH);
    ctx.lineTo(pad.l + plotW, pad.t + plotH);
    ctx.stroke();

    const funcs = [
      { name: 'O(1)', f: () => 1, color: '#94a3b8' },
      { name: 'O(log n)', f: (n) => Math.log2(n + 1), color: '#3ee8a8' },
      { name: 'O(n)', f: (n) => n, color: '#7aa2ff' },
      { name: 'O(n log n)', f: (n) => n * Math.log2(n + 1), color: '#c4a1ff' },
      { name: 'O(n²)', f: (n) => n * n, color: '#ffc14d' },
      { name: 'O(2ⁿ)', f: (n) => Math.pow(2, Math.min(n, 18)), color: '#ff7a90' },
    ];

    let yMax = 0;
    for (let n = 1; n <= nMax; n++) {
      funcs.forEach((fn) => {
        const v = fn.f(n);
        if (isFinite(v) && v < 5e5) yMax = Math.max(yMax, v);
      });
    }
    yMax *= 1.08;

    funcs.forEach((fn) => {
      // glow
      ctx.beginPath();
      ctx.strokeStyle = fn.color;
      ctx.lineWidth = 3.5;
      ctx.globalAlpha = 0.25;
      let started = false;
      for (let n = 1; n <= nMax; n++) {
        let v = fn.f(n);
        if (!isFinite(v) || v > yMax * 1.15) v = yMax * 1.15;
        const x = pad.l + ((n - 1) / (nMax - 1)) * plotW;
        const y = pad.t + plotH - (v / yMax) * plotH;
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // main line
      ctx.beginPath();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2.2;
      started = false;
      for (let n = 1; n <= nMax; n++) {
        let v = fn.f(n);
        if (!isFinite(v) || v > yMax * 1.15) v = yMax * 1.15;
        const x = pad.l + ((n - 1) / (nMax - 1)) * plotW;
        const y = pad.t + plotH - (v / yMax) * plotH;
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#6b7a99';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillText('n →', pad.l + plotW - 28, pad.t + plotH + 28);

    let lx = pad.l;
    funcs.forEach((fn) => {
      ctx.fillStyle = fn.color;
      ctx.beginPath();
      ctx.roundRect?.(lx, 10, 12, 3, 2);
      if (!ctx.roundRect) ctx.fillRect(lx, 10, 12, 3);
      else ctx.fill();
      ctx.fillStyle = '#a5b4d0';
      ctx.font = '10px Noto Sans SC, sans-serif';
      ctx.fillText(fn.name, lx + 16, 14);
      lx += ctx.measureText(fn.name).width + 30;
    });
  };

  // ---------- Chapter progress bar ----------
  function initProgress() {
    const bar = document.querySelector('.progress-track .fill');
    if (!bar) return;
    const sections = document.querySelectorAll('[data-section]');
    if (!sections.length) return;
    const seen = new Set();
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) seen.add(en.target);
        bar.style.width = ((seen.size / sections.length) * 100) + '%';
      });
    }, { threshold: 0.35 });
    sections.forEach((s) => obs.observe(s));
  }

  // ---------- Flip cards ----------
  function initFlipCards() {
    document.querySelectorAll('.flip-card').forEach((c) => {
      c.addEventListener('click', () => c.classList.toggle('flipped'));
    });
  }

  // ---------- Boot ----------
  window.addEventListener('DOMContentLoaded', () => {
    ensureHUD();
    ensureToastHost();
    initTOC();
    initProgress();
    initFlipCards();

    document.querySelectorAll('[data-complexity-chart]').forEach((c) => {
      drawComplexityChart(c.id, +(c.dataset.nmax || 40));
      window.addEventListener('resize', () => drawComplexityChart(c.id, +(c.dataset.nmax || 40)));
    });

    document.querySelectorAll('[data-quiz]').forEach((q) => {
      if (q.id) initQuiz('#' + q.id, { chapterId: document.body.dataset.chapter });
    });

    // First visit tip
    if (!sessionStorage.getItem('algo_greeted')) {
      sessionStorage.setItem('algo_greeted', '1');
      setTimeout(() => toast('欢迎来到算法互动课堂！完成测验可攒 XP 升级', '🚀'), 600);
    }
  });
})();
