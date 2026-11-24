/* =============================================================
   Unicornis: shared behaviour for every page
   - navigation, header state, reveal-on-scroll
   - twinkling star canvases
   - sparkle bursts, toasts
   - the constellation unicorn (used on the home page and the easter egg)
   Exposes a small toolkit on window.Unicornis.
   ============================================================= */
(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = () => motionQuery.matches;

  /* ---------- Utilities ---------- */

  /** Small, fast seeded PRNG so decorative randomness is stable between visits. */
  function seededRandom(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /** localStorage wrapper that never throws (private mode, blocked storage, previews). */
  const storage = {
    get(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (err) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        return false;
      }
    }
  };

  /* ---------- Header & navigation ---------- */
  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');

  if (header) {
    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  if (header && navToggle) {
    const setOpen = (open) => {
      navToggle.setAttribute('aria-expanded', String(open));
      header.classList.toggle('is-open', open);
    };
    navToggle.addEventListener('click', () => setOpen(navToggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && header.classList.contains('is-open')) {
        setOpen(false);
        navToggle.focus();
      }
    });
    header.querySelectorAll('.site-nav a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  let revealObserver = null;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  }

  function reveal(scope) {
    const els = (scope || document).querySelectorAll('[data-reveal]:not(.is-in)');
    els.forEach((el) => {
      if (!revealObserver || reducedMotion()) el.classList.add('is-in');
      else revealObserver.observe(el);
    });
  }
  reveal(document);

  /* ---------- Twinkling star canvases ---------- */
  const STAR_COLORS = ['#ffffff', '#fff6e0', '#e8e2ff', '#dff2ff', '#ffe4f2'];

  function Starfield(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const density = parseFloat(canvas.dataset.density || '1');
    const allowMeteors = canvas.dataset.meteors !== 'false';
    const horizon = canvas.dataset.horizon === 'true';
    const seed = hashString(canvas.dataset.seed || (location.pathname + '|' + (canvas.className || '')));

    let width = 0;
    let height = 0;
    let stars = [];
    let meteors = [];
    let visible = false;
    let rafId = 0;
    let lastDraw = 0;
    let nextMeteorAt = performance.now() + 1800;

    function build() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rand = seededRandom(seed);
      const count = Math.min(900, Math.round((width * height) / 8200 * density));
      stars = [];
      for (let i = 0; i < count; i++) {
        const big = rand() < 0.055;
        const y = rand() * height;
        let alpha = 0.3 + rand() * 0.7;
        if (horizon) alpha *= 1 - Math.pow(y / height, 2.2) * 0.85;
        stars.push({
          x: rand() * width,
          y,
          r: big ? 1.1 + rand() * 1.1 : 0.3 + rand() * 0.85,
          alpha,
          speed: 0.0005 + rand() * 0.0021,
          phase: rand() * Math.PI * 2,
          color: STAR_COLORS[Math.floor(rand() * STAR_COLORS.length)],
          big
        });
      }
      draw(performance.now());
    }

    function spawnMeteor(now) {
      const fromLeft = Math.random() < 0.3;
      meteors.push({
        x: width * (fromLeft ? 0.1 + Math.random() * 0.3 : 0.45 + Math.random() * 0.5),
        y: height * Math.random() * 0.35,
        vx: (fromLeft ? 1 : -1) * (0.45 + Math.random() * 0.35),
        vy: 0.22 + Math.random() * 0.18,
        born: now,
        life: 900 + Math.random() * 500
      });
      nextMeteorAt = now + 3500 + Math.random() * 6000;
    }

    function draw(now) {
      ctx.clearRect(0, 0, width, height);
      const still = reducedMotion();
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const twinkle = still ? 0.85 : 0.6 + 0.4 * Math.sin(now * s.speed + s.phase);
        ctx.globalAlpha = s.alpha * twinkle;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.big) {
          const len = s.r * 4.2;
          ctx.globalAlpha = s.alpha * twinkle * 0.45;
          ctx.fillRect(s.x - len, s.y - 0.35, len * 2, 0.7);
          ctx.fillRect(s.x - 0.35, s.y - len, 0.7, len * 2);
        }
      }

      if (!still && allowMeteors) {
        if (now > nextMeteorAt) spawnMeteor(now);
        meteors = meteors.filter((m) => now - m.born < m.life);
        meteors.forEach((m) => {
          const age = now - m.born;
          const t = age / m.life;
          const x = m.x + m.vx * age;
          const y = m.y + m.vy * age;
          const tail = 140;
          const grad = ctx.createLinearGradient(x, y, x - m.vx * tail, y - m.vy * tail);
          const a = Math.sin(Math.PI * t);
          grad.addColorStop(0, 'rgba(255,255,255,' + (0.95 * a) + ')');
          grad.addColorStop(0.3, 'rgba(220,205,255,' + (0.45 * a) + ')');
          grad.addColorStop(1, 'rgba(200,180,255,0)');
          ctx.globalAlpha = 1;
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - m.vx * tail, y - m.vy * tail);
          ctx.stroke();
        });
      }
      ctx.globalAlpha = 1;
    }

    function loop(now) {
      if (!visible || reducedMotion()) { rafId = 0; return; }
      if (now - lastDraw > 33) { // ~30 fps is plenty for slow twinkling
        draw(now);
        lastDraw = now;
      }
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (!rafId && visible && !reducedMotion()) rafId = requestAnimationFrame(loop);
    }

    build();

    let resizeTimer = 0;
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(build, 120);
      }).observe(canvas);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) start();
      }).observe(canvas);
    } else {
      visible = true;
      start();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { visible = false; } else {
        const r = canvas.getBoundingClientRect();
        visible = r.bottom > 0 && r.top < window.innerHeight;
        start();
      }
    });
    motionQuery.addEventListener('change', () => { draw(performance.now()); start(); });
  }

  document.querySelectorAll('canvas[data-starfield]').forEach((canvas) => Starfield(canvas));

  /* ---------- Toasts ---------- */
  let toastRegion = null;
  function toast(message) {
    if (!toastRegion) {
      toastRegion = document.createElement('div');
      toastRegion.className = 'toast-region';
      toastRegion.setAttribute('role', 'status');
      toastRegion.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastRegion);
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    toastRegion.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 400);
    }, 2800);
  }

  /* ---------- Sparkle bursts ---------- */
  const SPARK_COLORS = ['#ff9ccf', '#c3a5ff', '#8fd2ff', '#93efc9', '#ffe49c', '#ffffff'];
  function sparkleBurst(x, y, count) {
    if (reducedMotion()) return;
    const n = count || 14;
    for (let i = 0; i < n; i++) {
      const spark = document.createElement('span');
      spark.className = 'spark';
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.6;
      const dist = 28 + Math.random() * 64;
      spark.style.left = x + 'px';
      spark.style.top = y + 'px';
      spark.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      spark.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(1) + 'px');
      spark.style.setProperty('--s', (8 + Math.random() * 12).toFixed(1) + 'px');
      spark.style.setProperty('--c', SPARK_COLORS[i % SPARK_COLORS.length]);
      spark.style.setProperty('--rot', (Math.random() * 180 - 90).toFixed(0) + 'deg');
      spark.style.setProperty('--t', (0.6 + Math.random() * 0.5).toFixed(2) + 's');
      document.body.appendChild(spark);
      spark.addEventListener('animationend', () => spark.remove(), { once: true });
      setTimeout(() => spark.remove(), 1500);
    }
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-sparkle]');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    sparkleBurst(x, y);
  });

  /* ---------- The constellation unicorn ----------
     A prancing unicorn drawn as a constellation, facing left,
     in a 600 x 540 coordinate box. */
  const STARS = {
    hornTip: [92, 34], hornBase: [190, 148], earFront: [222, 136], earTip: [240, 90], poll: [254, 140],
    noseBridge: [158, 196], muzzle: [130, 236], lip: [138, 258], chin: [168, 270], jaw: [206, 258], throat: [236, 238],
    eye: [196, 180],
    crest1: [278, 156], crest2: [308, 188], crest3: [336, 224], withers: [358, 254],
    mane1: [294, 122], mane2: [334, 144], mane3: [366, 180], mane4: [390, 222],
    neck: [246, 292], chest: [264, 338],
    back: [430, 262], loin: [488, 258], croup: [534, 268], tailHead: [552, 288],
    buttock: [562, 330], stifle: [528, 366], flank: [494, 374], belly2: [420, 378], belly1: [330, 368],
    elbowN: [290, 360], kneeN: [242, 392], fetN: [238, 438], hoofN: [220, 456],
    elbowF: [330, 374], kneeF: [322, 438], fetF: [326, 490], hoofF: [308, 508],
    hockN: [554, 434], fetHN: [542, 490], hoofHN: [524, 510],
    thighF: [478, 376], hockF: [498, 440], fetHF: [484, 494], hoofHF: [466, 510],
    tail1: [590, 300], tail2: [608, 346], tail3: [596, 400], tail4: [566, 434],
    tailB1: [568, 318], tailB2: [582, 366], tailB3: [574, 412]
  };

  const STAR_LINES = [
    { pts: ['hornTip', 'hornBase'], step: 0.5 },
    { pts: ['hornBase', 'noseBridge', 'muzzle', 'lip', 'chin', 'jaw', 'throat'] },
    { pts: ['hornBase', 'earFront', 'earTip', 'poll'] },
    { pts: ['poll', 'crest1', 'crest2', 'crest3', 'withers'] },
    { pts: ['poll', 'mane1', 'mane2', 'mane3', 'mane4', 'withers'], soft: true },
    { pts: ['throat', 'neck', 'chest'] },
    { pts: ['withers', 'back', 'loin', 'croup', 'tailHead'] },
    { pts: ['tailHead', 'buttock', 'stifle'] },
    { pts: ['chest', 'belly1', 'belly2', 'flank', 'stifle'] },
    { pts: ['elbowN', 'kneeN', 'fetN', 'hoofN'] },
    { pts: ['elbowF', 'kneeF', 'fetF', 'hoofF'], soft: true },
    { pts: ['stifle', 'hockN', 'fetHN', 'hoofHN'] },
    { pts: ['thighF', 'hockF', 'fetHF', 'hoofHF'], soft: true },
    { pts: ['tailHead', 'tail1', 'tail2', 'tail3', 'tail4'] },
    { pts: ['tailHead', 'tailB1', 'tailB2', 'tailB3'], soft: true }
  ];

  const STAR_SIZES = { hornTip: 4.4, eye: 3.2, withers: 2.8, croup: 2.7, hoofN: 2.6, hoofF: 2.4, hoofHN: 2.6, hoofHF: 2.4, tail4: 2.6, earTip: 2.6, muzzle: 2.5 };

  const SILHOUETTE = ['hornBase', 'earFront', 'earTip', 'poll', 'mane1', 'mane2', 'mane3', 'mane4', 'withers', 'back', 'loin',
    'croup', 'tailHead', 'buttock', 'stifle', 'flank', 'belly2', 'belly1', 'chest', 'neck', 'throat', 'jaw', 'chin', 'lip', 'muzzle', 'noseBridge'];

  function sparklePath(cx, cy, r) {
    const k = r * 0.22;
    return 'M' + cx + ' ' + (cy - r) +
      ' C' + (cx + k) + ' ' + (cy - k) + ' ' + (cx + k) + ' ' + (cy - k) + ' ' + (cx + r) + ' ' + cy +
      ' C' + (cx + k) + ' ' + (cy + k) + ' ' + (cx + k) + ' ' + (cy + k) + ' ' + cx + ' ' + (cy + r) +
      ' C' + (cx - k) + ' ' + (cy + k) + ' ' + (cx - k) + ' ' + (cy + k) + ' ' + (cx - r) + ' ' + cy +
      ' C' + (cx - k) + ' ' + (cy - k) + ' ' + (cx - k) + ' ' + (cy - k) + ' ' + cx + ' ' + (cy - r) + ' Z';
  }

  /**
   * Returns SVG markup for the constellation unicorn.
   * opts.animate  draw the lines one by one
   * opts.idPrefix unique prefix for gradient ids
   * opts.flip     face right instead of left
   * opts.label    accessible label (omit for decorative use)
   */
  function constellationSVG(opts) {
    const o = opts || {};
    const p = o.idPrefix || 'cl-';
    const animate = !!o.animate && !reducedMotion();
    const rand = seededRandom(7);
    let delay = 0.25;
    const nodeDelay = {};
    const order = [];
    const paths = [];

    STAR_LINES.forEach((line) => {
      const d = 'M' + line.pts.map((k) => STARS[k].join(' ')).join(' L');
      const dur = 0.3 + line.pts.length * 0.11;
      paths.push('<path class="seg' + (line.soft ? ' seg--soft' : '') + '" d="' + d + '" pathLength="1" stroke="url(#' + p + 'line)" style="--d:' + delay.toFixed(2) + 's;--dur:' + dur.toFixed(2) + 's"/>');
      line.pts.forEach((k, i) => {
        if (nodeDelay[k] === undefined) {
          nodeDelay[k] = delay + dur * (i / Math.max(1, line.pts.length - 1));
          order.push(k);
        }
      });
      delay += line.step || 0.2;
    });
    nodeDelay.eye = 1.1;
    order.push('eye');

    const nodes = order.map((k) => {
      const [x, y] = STARS[k];
      const r = STAR_SIZES[k] || 1.9;
      const tw = (rand() * 4).toFixed(2);
      const core = k === 'hornTip' ? '#fff3c4' : '#ffffff';
      return '<g class="node-wrap" style="--d:' + nodeDelay[k].toFixed(2) + 's">' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 4.2).toFixed(1) + '" fill="url(#' + p + 'glow)"/>' +
        '<circle class="twinkle" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + core + '" style="--tw:' + tw + 's"/>' +
        '</g>';
    }).join('');

    const tip = STARS.hornTip;
    const sil = 'M' + SILHOUETTE.map((k) => STARS[k].join(' ')).join(' L') + ' Z';
    const hornFill = 'M' + tip.join(' ') + ' L' + STARS.hornBase.join(' ') + ' L' + STARS.earFront.join(' ') + ' Z';
    const silDelay = (delay + 0.4).toFixed(2);
    const flip = o.flip ? ' transform="translate(640 0) scale(-1 1)"' : '';
    const a11y = o.label ? ' role="img" aria-label="' + escapeHTML(o.label) + '"' : ' aria-hidden="true" focusable="false"';

    return '<svg class="constellation ' + (animate ? 'is-animated' : 'is-static') + '" viewBox="0 0 640 540" xmlns="http://www.w3.org/2000/svg"' + a11y + '>' +
      '<defs>' +
        '<linearGradient id="' + p + 'line" x1="80" y1="30" x2="600" y2="520" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#ffe49c"/><stop offset=".28" stop-color="#ff9ccf"/><stop offset=".62" stop-color="#c3a5ff"/><stop offset="1" stop-color="#8fd2ff"/>' +
        '</linearGradient>' +
        '<radialGradient id="' + p + 'glow"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".28" stop-color="#e2d6ff" stop-opacity=".35"/><stop offset="1" stop-color="#b79cff" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="' + p + 'fill" x1="100" y1="40" x2="600" y2="520" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#ffe49c" stop-opacity=".22"/><stop offset=".45" stop-color="#ff9ccf" stop-opacity=".13"/><stop offset="1" stop-color="#8fd2ff" stop-opacity=".08"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<g' + flip + '>' +
        '<path class="silhouette" d="' + sil + '" fill="url(#' + p + 'fill)" style="--d:' + silDelay + 's"/>' +
        '<path class="silhouette" d="' + hornFill + '" fill="url(#' + p + 'fill)" style="--d:' + silDelay + 's"/>' +
        paths.join('') +
        nodes +
        '<g class="node-wrap" style="--d:0.75s"><path class="tip-spark" d="' + sparklePath(tip[0], tip[1], 15) + '" fill="#fff6d6" opacity=".9"/></g>' +
      '</g>' +
    '</svg>';
  }

  /* ---------- Easter egg: type "unicorn" anywhere ---------- */
  let typed = '';
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
    const t = event.target;
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
    typed = (typed + event.key.toLowerCase()).slice(-7);
    if (typed === 'unicorn') {
      typed = '';
      gallop();
    }
  });

  function gallop() {
    if (reducedMotion()) {
      toast('A unicorn just trotted past. Blink and you miss it.');
      return;
    }
    const runner = document.createElement('div');
    runner.className = 'gallop';
    runner.setAttribute('aria-hidden', 'true');
    runner.innerHTML = constellationSVG({ idPrefix: 'gallop' + Date.now() + '-', flip: true });
    document.body.appendChild(runner);
    const trail = setInterval(() => {
      const r = runner.getBoundingClientRect();
      sparkleBurst(r.left + r.width * 0.12, r.top + r.height * 0.55, 3);
    }, 110);
    const finish = () => { clearInterval(trail); runner.remove(); };
    runner.addEventListener('animationend', finish, { once: true });
    setTimeout(finish, 5000);
    toast('You found a unicorn!');
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Public toolkit ---------- */
  window.Unicornis = {
    reducedMotion,
    seededRandom,
    hashString,
    escapeHTML,
    storage,
    toast,
    sparkleBurst,
    sparklePath,
    reveal,
    constellationSVG
  };
})();
