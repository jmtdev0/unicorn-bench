/* =============================================================
   Unicornis: Legends page
   Millefleurs hero, the sticky era navigation and the narwhal tusk.
   ============================================================= */
(function () {
  'use strict';

  const U = window.Unicornis;

  /* ---------- Millefleurs ("thousand flowers") hero pattern ---------- */
  const field = document.querySelector('[data-millefleurs]');
  if (field) {
    const W = 1440;
    const H = 640;
    const rand = U.seededRandom(1495);
    const petals = ['#f4e9d0', '#e98fb8', '#f3c95a', '#a8c9f0', '#d9534f', '#fff6e6'];
    let out = '';
    for (let i = 0; i < 260; i++) {
      const x = rand() * W;
      const y = rand() * H;
      const r = 2.4 + rand() * 3.6;
      const leafAngle = Math.round(rand() * 360);
      out += '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' q' + (r * 1.2).toFixed(1) + ' ' + (-r * 2.2).toFixed(1) + ' ' + (r * 2.6).toFixed(1) + ' 0 q' + (-r * 1.4).toFixed(1) + ' ' + (r * 2.2).toFixed(1) + ' ' + (-r * 2.6).toFixed(1) + ' 0z" fill="#3c8a66" opacity=".7" transform="rotate(' + leafAngle + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
      if (rand() < 0.75) {
        const c = petals[Math.floor(rand() * petals.length)];
        const n = rand() < 0.5 ? 5 : 4;
        for (let k = 0; k < n; k++) {
          const a = (Math.PI * 2 * k) / n + rand() * 0.3;
          out += '<circle cx="' + (x + Math.cos(a) * r).toFixed(1) + '" cy="' + (y + Math.sin(a) * r).toFixed(1) + '" r="' + (r * 0.72).toFixed(1) + '" fill="' + c + '"/>';
        }
        out += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r * 0.45).toFixed(1) + '" fill="#ffd27a"/>';
      }
    }
    field.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    field.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    field.innerHTML = out;
  }

  /* ---------- Era navigation: highlight the era in view ---------- */
  const links = Array.from(document.querySelectorAll('[data-era-link]'));
  const sections = links.map((a) => document.getElementById(a.dataset.eraLink)).filter(Boolean);
  if (links.length && 'IntersectionObserver' in window) {
    const setActive = (id) => {
      links.forEach((a) => {
        const on = a.dataset.eraLink === id;
        a.classList.toggle('is-active', on);
        if (on) {
          a.setAttribute('aria-current', 'true');
          // Keep the active pill visible on narrow screens without moving the page.
          const bar = a.closest('ol');
          if (bar && bar.scrollWidth > bar.clientWidth) {
            bar.scrollTo({ left: a.offsetLeft - 16, behavior: U.reducedMotion() ? 'auto' : 'smooth' });
          }
        } else {
          a.removeAttribute('aria-current');
        }
      });
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- The narwhal tusk in the hoax feature ---------- */
  const tuskHost = document.querySelector('[data-hoax-tusk]');
  if (tuskHost && window.UnicornHorns && window.BEASTS) {
    const narwhal = window.BEASTS.find((b) => b.id === 'narwhal');
    const spec = Object.assign({}, narwhal.spec, { length: 520, width: 34, angle: -48, spiral: 22 });
    const horn = window.UnicornHorns.hornMarkup(spec, [70, 432], 'hoax-');
    const rand = U.seededRandom(1638);
    let stars = '';
    for (let i = 0; i < 40; i++) {
      stars += '<circle cx="' + (rand() * 500).toFixed(1) + '" cy="' + (rand() * 500).toFixed(1) + '" r="' + (0.5 + rand() * 1.3).toFixed(1) + '" fill="#fff" opacity="' + (0.25 + rand() * 0.6).toFixed(2) + '"/>';
    }
    tuskHost.innerHTML = '<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<defs>' + horn.defs +
        '<radialGradient id="hoax-glow"><stop offset="0" stop-color="#c3a5ff" stop-opacity=".45"/><stop offset="1" stop-color="#c3a5ff" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      stars +
      '<circle cx="250" cy="240" r="220" fill="url(#hoax-glow)"/>' +
      '<g style="filter: drop-shadow(0 18px 24px rgba(0,0,0,.45))">' + horn.body + '</g>' +
      window.UnicornHorns.sparkle(428, 60, 12, '#fff6d6', 'u-sparkle', 0) +
      window.UnicornHorns.sparkle(392, 30, 6, '#ffffff', 'u-sparkle', 1.2) +
      '</svg>';
  }
})();
