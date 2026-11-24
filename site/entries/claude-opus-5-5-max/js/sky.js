/* =============================================================
   Unicornis: the Unicorn in the Sky
   An interactive map of Monoceros built from real coordinates
   (J2000 right ascension / declination), with deep-sky objects,
   the Winter Triangle, our own stick figure and a "trace your own"
   mode. Exposes nothing globally.
   ============================================================= */
(function () {
  'use strict';

  const U = window.Unicornis;
  const svg = document.querySelector('[data-sky-svg]');
  if (!svg) return;

  const NS = 'http://www.w3.org/2000/svg';
  const LINES_KEY = 'unicornis-sky-lines-v1';

  /* ---------- Projection: simple equirectangular, east to the left ---------- */
  const RA0 = 105;   // 7h 00m
  const DEC0 = -3;
  const SCALE = 24;  // px per degree
  const proj = (ra, dec) => [480 + (RA0 - ra) * SCALE, 400 - (dec - DEC0) * SCALE];

  /* ---------- Catalogue ---------- */
  const STARS = [
    { id: 'betelgeuse', name: 'Betelgeuse', ra: 88.79, dec: 7.41, mag: 0.5, color: '#ffb58f', kind: 'Red supergiant · Orion', lx: 0, ly: -22, anchor: 'middle', major: true,
      text: "Orion's orange-red shoulder, a supergiant so large that, placed where the Sun is, it would swallow the orbits of the inner planets. One corner of the Winter Triangle.", facts: [['Magnitude', 'about 0.5 (variable)'], ['Distance', 'roughly 550 light-years']] },
    { id: 'procyon', name: 'Procyon', ra: 114.83, dec: 5.22, mag: 0.34, color: '#fff4e0', kind: 'Star · Canis Minor', lx: 0, ly: -22, anchor: 'middle', major: true,
      text: 'The brightest star of the Little Dog, and one of our nearest bright neighbors. Another corner of the Winter Triangle.', facts: [['Magnitude', '0.34'], ['Distance', '11.5 light-years']] },
    { id: 'sirius', name: 'Sirius', ra: 101.29, dec: -16.72, mag: -1.46, color: '#e8f1ff', kind: 'Star · Canis Major', lx: 18, ly: 5, anchor: 'start', major: true,
      text: 'The Dog Star, the brightest star in the night sky, sits just south of the Unicorn. The third corner of the Winter Triangle.', facts: [['Magnitude', '−1.46'], ['Distance', '8.6 light-years']] },
    { id: 'gomeisa', name: 'Gomeisa', ra: 111.79, dec: 8.29, mag: 2.9, color: '#dce8ff', kind: 'Star · Canis Minor', lx: 12, ly: 4, anchor: 'start', minor: true,
      text: "The second star of the Little Dog, a hot blue-white star. Together with Procyon it makes the whole of Canis Minor's stick figure: a single line.", facts: [['Magnitude', '2.9']] },
    { id: 'mirzam', name: 'Mirzam', ra: 95.67, dec: -17.96, mag: 1.98, color: '#d6e4ff', kind: 'Star · Canis Major', lx: 12, ly: 4, anchor: 'start', minor: true,
      text: "Its Arabic-derived name is usually translated as 'the herald': it rises just before Sirius.", facts: [['Magnitude', '2.0']] },

    { id: 'alpha', name: 'α Monocerotis', short: 'α Mon', ra: 115.31, dec: -9.55, mag: 3.93, color: '#ffd9a8', kind: 'Orange giant · Monoceros', lx: 12, ly: 4, anchor: 'start', mon: true,
      text: 'An orange giant star near the eastern edge of the Unicorn. In our drawing it is a hind hoof, kicking off from the Milky Way.', facts: [['Magnitude', '3.9'], ['Distance', 'about 150 light-years']] },
    { id: 'beta', name: 'β Monocerotis', short: 'β Mon', ra: 97.20, dec: -7.03, mag: 3.74, color: '#cfe0ff', kind: 'Triple star · Monoceros', lx: 12, ly: 14, anchor: 'start', mon: true,
      text: "To the naked eye a single star; in a small telescope, three blue-white suns in a tight row. William Herschel, who discovered it in 1781, called it one of the most beautiful sights in the heavens.", facts: [['Magnitude', '3.7 (combined)']] },
    { id: 'gamma', name: 'γ Monocerotis', short: 'γ Mon', ra: 93.71, dec: -6.27, mag: 3.98, color: '#ffcf9e', kind: 'Orange giant · Monoceros', lx: 12, ly: 4, anchor: 'start', mon: true,
      text: 'An orange giant at the western end of the constellation. In our drawing it is a front hoof, reaching toward Orion.', facts: [['Magnitude', '4.0']] },
    { id: 'delta', name: 'δ Monocerotis', short: 'δ Mon', ra: 107.97, dec: -0.49, mag: 4.15, color: '#eef3ff', kind: 'White star · Monoceros', lx: 10, ly: 18, anchor: 'start', mon: true,
      text: 'A white star sitting almost exactly on the celestial equator. In our drawing it is the Unicorn\'s chest, where its neck meets its forelegs.', facts: [['Magnitude', '4.2'], ['Declination', '−0.5°']] },
    { id: 'epsilon', name: 'ε Monocerotis', short: 'ε Mon', ra: 95.94, dec: 4.59, mag: 4.39, color: '#f7f7ff', kind: 'Double star · Monoceros', lx: 12, ly: 12, anchor: 'start', mon: true,
      text: 'A pretty double star, easy to split in a small telescope, just west of the Rosette Nebula. In our drawing it is the tip of the Unicorn\'s nose.', facts: [['Magnitude', '4.4']] },
    { id: 'zeta', name: 'ζ Monocerotis', short: 'ζ Mon', ra: 122.15, dec: -2.98, mag: 4.34, color: '#fff0c8', kind: 'Yellow supergiant · Monoceros', lx: 12, ly: -8, anchor: 'start', mon: true,
      text: 'A yellow supergiant at the far eastern end of the constellation, marking the Unicorn\'s rump in our drawing.', facts: [['Magnitude', '4.3']] },
    { id: 'm13', name: '13 Monocerotis', short: '13 Mon', ra: 98.25, dec: 7.33, mag: 4.5, color: '#eef2ff', kind: 'White supergiant · Monoceros', lx: 12, ly: 2, anchor: 'start', mon: true,
      text: 'A luminous white supergiant. In our drawing it is the very tip of the Unicorn\'s horn.', facts: [['Magnitude', '4.5']] },
    { id: 'm15', name: '15 Monocerotis', short: '15 Mon', ra: 100.25, dec: 9.90, mag: 4.66, color: '#c7d8ff', kind: 'Hot blue star · Monoceros', lx: -12, ly: -2, anchor: 'end', mon: true,
      text: 'Also called S Monocerotis: a hot, massive blue star at the base of the Christmas Tree Cluster, and the brightest member of NGC 2264.', facts: [['Magnitude', '4.7']] },
    { id: 'm18', name: '18 Monocerotis', short: '18 Mon', ra: 101.96, dec: 2.41, mag: 4.47, color: '#ffdcb0', kind: 'Orange giant · Monoceros', lx: -12, ly: 16, anchor: 'end', mon: true,
      text: 'An orange giant that marks the Unicorn\'s head in our drawing, right where the horn begins.', facts: [['Magnitude', '4.5']] },
    { id: 'plaskett', name: "Plaskett's Star", ra: 99.35, dec: 6.13, mag: 6.05, color: '#cfdcff', kind: 'Massive binary · Monoceros', lx: -12, ly: 4, anchor: 'end', mon: true, minor: true,
      text: 'One of the most massive pairs of stars known: two hot giants that whirl around each other every 14 days. John S. Plaskett discovered its double nature in 1922.', facts: [['Magnitude', '6.1'], ['Orbit', 'about 14.4 days']] }
  ];

  const DSOS = [
    { id: 'rosette', name: 'Rosette Nebula', ra: 97.98, dec: 4.94, kind: 'Emission nebula · NGC 2237', lx: 36, ly: -12, anchor: 'start', type: 'rosette',
      text: 'A vast, rose-shaped cloud of glowing hydrogen around the young star cluster NGC 2244, whose fierce light has blown a hollow in its heart. The cluster is easy in binoculars; the rose itself shows best in long-exposure photographs.',
      facts: [['Distance', 'about 5,000 light-years'], ['Size', 'larger than the full Moon']] },
    { id: 'xmas', name: 'Christmas Tree Cluster', ra: 100.25, dec: 9.62, kind: 'Star cluster and nebula · NGC 2264', lx: 16, ly: -14, anchor: 'start', type: 'cluster',
      text: 'A young cluster whose brightest stars outline a Christmas tree, with 15 Monocerotis at its base and the dark, pointed Cone Nebula at its tip. The whole region glows with faint red nebulosity.',
      facts: [['Distance', 'about 2,500 light-years']] },
    { id: 'hubble', name: "Hubble's Variable Nebula", ra: 99.79, dec: 8.73, kind: 'Reflection nebula · NGC 2261', lx: 16, ly: 10, anchor: 'start', type: 'fan',
      text: 'A small, comet-shaped fan of dust lit by the young star R Monocerotis. Its shape and brightness change over weeks as shadows drift across it. It was the first object photographed with the 200-inch Hale Telescope at Palomar, in 1949.',
      facts: [['Lit by', 'R Monocerotis']] },
    { id: 'm50', name: 'Messier 50', ra: 105.70, dec: -8.38, kind: 'Open cluster · NGC 2323', lx: 16, ly: 4, anchor: 'start', type: 'cluster',
      text: 'A rich, heart-shaped open cluster of a few hundred stars, a lovely sight in binoculars or a small telescope. Charles Messier added it to his catalogue in 1772.',
      facts: [['Distance', 'about 3,000 light-years']] },
    { id: 'v838', name: 'V838 Monocerotis', ra: 106.02, dec: -3.85, kind: 'Erupting star', lx: 0, ly: 30, anchor: 'middle', type: 'echo',
      text: 'In early 2002 this unremarkable star suddenly flared to become, for a few weeks, one of the most luminous stars in the Milky Way. The Hubble Space Telescope then watched the flash echo outward through the surrounding dust: a light echo that looked like an expanding cosmic rose.',
      facts: [['Distance', 'about 19,000 light-years'], ['Outburst', 'January 2002']] }
  ];

  // Our tracing: the Unicorn leaps west, toward Orion.
  const FIGURE = [
    ['m18', 'm13'],      // horn
    ['m18', 'epsilon'],  // nose
    ['m18', 'delta'],    // neck
    ['delta', 'zeta'],   // back
    ['zeta', 'alpha'],   // hind leg
    ['delta', 'beta'],   // foreleg
    ['beta', 'gamma']    // hoof
  ];
  // [label, from, to, dx, dy, position along the line]
  const FIGURE_PARTS = [['horn', 'm18', 'm13', -16, 0, 0.5], ['nose', 'm18', 'epsilon', 0, 18, 0.6], ['back', 'delta', 'zeta', 0, -12, 0.5], ['hind leg', 'zeta', 'alpha', -34, 6, 0.5], ['forelegs', 'delta', 'beta', 14, 22, 0.55]];
  const TRIANGLE = ['betelgeuse', 'procyon', 'sirius'];

  const all = STARS.concat(DSOS);
  all.forEach((o) => { o.xy = proj(o.ra, o.dec); });
  const find = (id) => all.find((o) => o.id === id);

  /* ---------- SVG helpers ---------- */
  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
    if (parent) parent.appendChild(node);
    return node;
  }
  const r1 = (n) => Math.round(n * 10) / 10;

  /* ---------- Build the map ---------- */
  const defs = el('defs', {}, svg);
  defs.innerHTML =
    '<radialGradient id="sky-glow"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".25" stop-color="#d9ccff" stop-opacity=".25"/><stop offset="1" stop-color="#b79cff" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="sky-rose"><stop offset="0" stop-color="#ff7aa8" stop-opacity="0"/><stop offset=".38" stop-color="#ff7aa8" stop-opacity=".05"/><stop offset=".62" stop-color="#ff6f9c" stop-opacity=".45"/><stop offset=".85" stop-color="#ff8fb5" stop-opacity=".14"/><stop offset="1" stop-color="#ff8fb5" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="sky-haze"><stop offset="0" stop-color="#ff6f9c" stop-opacity=".35"/><stop offset="1" stop-color="#ff6f9c" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="sky-blue"><stop offset="0" stop-color="#9cc4ff" stop-opacity=".55"/><stop offset="1" stop-color="#9cc4ff" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="sky-echo"><stop offset="0" stop-color="#ffd2a1" stop-opacity="0"/><stop offset=".55" stop-color="#ffb87a" stop-opacity=".0"/><stop offset=".7" stop-color="#ffb87a" stop-opacity=".55"/><stop offset=".82" stop-color="#8fc0ff" stop-opacity=".3"/><stop offset="1" stop-color="#8fc0ff" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="sky-iris" x1="0" y1="0" x2="960" y2="800" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffe49c"/><stop offset=".35" stop-color="#ff9ccf"/><stop offset=".7" stop-color="#c3a5ff"/><stop offset="1" stop-color="#8fd2ff"/></linearGradient>' +
    '<linearGradient id="sky-milkyway" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f7bf0" stop-opacity="0"/><stop offset=".5" stop-color="#8f7bf0" stop-opacity=".16"/><stop offset="1" stop-color="#8f7bf0" stop-opacity="0"/></linearGradient>';

  // Milky Way band (decorative, softly blurred): it runs through Monoceros roughly north-south.
  defs.insertAdjacentHTML('beforeend', '<filter id="sky-soft" x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="38"/></filter>');
  el('path', { d: 'M560 -60 C620 200 600 420 660 860 L820 860 C760 420 790 200 740 -60 Z', fill: '#7d6be6', opacity: '.2', filter: 'url(#sky-soft)', 'aria-hidden': 'true' }, svg);
  el('path', { d: 'M610 -60 C660 220 640 420 700 860 L760 860 C710 420 730 220 690 -60 Z', fill: '#a99cff', opacity: '.12', filter: 'url(#sky-soft)', 'aria-hidden': 'true' }, svg);

  // Coordinate grid
  const grid = el('g', { 'aria-hidden': 'true' }, svg);
  [[90, '6h'], [105, '7h'], [120, '8h']].forEach(([ra, label]) => {
    const x = proj(ra, 0)[0];
    el('line', { class: 'grid-line', x1: x, y1: 0, x2: x, y2: 800 }, grid);
    el('text', { class: 'grid-label', x: x + 6, y: 790 }, grid).textContent = label;
  });
  [[10, '+10°'], [-10, '−10°']].forEach(([dec, label]) => {
    const y = proj(RA0, dec)[1];
    el('line', { class: 'grid-line', x1: 0, y1: y, x2: 960, y2: y }, grid);
    el('text', { class: 'grid-label', x: 8, y: y - 6 }, grid).textContent = label;
  });
  const eqY = proj(RA0, 0)[1];
  el('line', { class: 'equator', x1: 0, y1: eqY, x2: 960, y2: eqY }, grid);
  el('text', { class: 'equator-label', x: 952, y: eqY - 8, 'text-anchor': 'end' }, grid).textContent = 'Celestial equator';

  // Decorative background stars
  const bg = el('g', { 'aria-hidden': 'true' }, svg);
  const rand = U.seededRandom(1612);
  let bgMarkup = '';
  for (let i = 0; i < 320; i++) {
    const x = rand() * 960;
    const y = rand() * 800;
    const r = rand() < 0.08 ? 1.1 + rand() * 0.6 : 0.35 + rand() * 0.6;
    const tw = U.reducedMotion() || rand() > 0.35 ? '' : ' class="twinkle-star" style="--tw:' + (rand() * 4).toFixed(2) + 's;--tw-d:' + (3 + rand() * 3).toFixed(2) + 's"';
    bgMarkup += '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r1(r) + '" fill="#fff" opacity="' + (0.18 + rand() * 0.45).toFixed(2) + '"' + tw + '/>';
  }
  bg.innerHTML = bgMarkup;

  // Layers
  const layers = {
    triangle: el('g', { 'data-layer-group': 'triangle' }, svg),
    figure: el('g', { 'data-layer-group': 'figure' }, svg),
    user: el('g', {}, svg),
    dso: el('g', { 'data-layer-group': 'dso' }, svg),
    stars: el('g', {}, svg),
    labels: el('g', { 'data-layer-group': 'labels', 'aria-hidden': 'true' }, svg)
  };
  const ghost = el('line', { class: 'ghost-line', x1: 0, y1: 0, x2: 0, y2: 0, visibility: 'hidden' }, svg);

  // Winter Triangle
  const tri = TRIANGLE.map((id) => find(id).xy);
  el('path', { class: 'tri-line', d: 'M' + tri.map((p) => p.join(' ')).join(' L') + ' Z' }, layers.triangle);
  // Label along the Procyon-Betelgeuse edge, just above the line.
  const triAngle = Math.atan2(tri[0][1] - tri[1][1], tri[0][0] - tri[1][0]) * 180 / Math.PI;
  const tlx = 330;
  const tly = tri[1][1] + (tri[0][1] - tri[1][1]) * ((tlx - tri[1][0]) / (tri[0][0] - tri[1][0])) - 9;
  el('text', { class: 'tri-label', x: tlx, y: r1(tly), transform: 'rotate(' + r1(triAngle) + ' ' + tlx + ' ' + r1(tly) + ')', 'aria-hidden': 'true' }, layers.triangle).textContent = 'Winter Triangle';

  // Our figure
  function drawFigure(animate) {
    layers.figure.innerHTML = '';
    FIGURE.forEach(([a, b], i) => {
      const A = find(a).xy;
      const B = find(b).xy;
      const line = el('line', { class: 'fig-line' + (animate ? ' is-drawing' : ''), x1: A[0], y1: A[1], x2: B[0], y2: B[1], pathLength: '1' }, layers.figure);
      if (animate) line.style.setProperty('--d', (i * 0.25).toFixed(2) + 's');
    });
    FIGURE_PARTS.forEach(([label, a, b, dx, dy, t]) => {
      const A = find(a).xy;
      const B = find(b).xy;
      el('text', { class: 'fig-part', x: r1(A[0] + (B[0] - A[0]) * t + dx), y: r1(A[1] + (B[1] - A[1]) * t + dy), 'text-anchor': 'middle' }, layers.figure).textContent = label;
    });
  }
  drawFigure(!U.reducedMotion());

  // Deep-sky objects
  DSOS.forEach((o) => {
    const [x, y] = o.xy;
    const g = el('g', { class: 'dso', tabindex: '0', role: 'button', 'aria-label': o.name + ', ' + o.kind, 'data-id': o.id }, layers.dso);
    if (o.type === 'rosette') {
      el('circle', { cx: x, cy: y, r: 30, fill: 'url(#sky-rose)' }, g);
      for (let i = 0; i < 7; i++) {
        const a = i * 0.9;
        el('circle', { cx: r1(x + Math.cos(a) * 4), cy: r1(y + Math.sin(a) * 4), r: 0.9, fill: '#fff' }, g);
      }
    } else if (o.type === 'cluster') {
      el('circle', { cx: x, cy: y, r: o.id === 'xmas' ? 22 : 18, fill: o.id === 'xmas' ? 'url(#sky-haze)' : 'url(#sky-blue)' }, g);
      const cr = U.seededRandom(o.id.length * 97);
      for (let i = 0; i < 14; i++) {
        el('circle', { cx: r1(x + (cr() - 0.5) * 20), cy: r1(y + (cr() - 0.5) * 20), r: r1(0.5 + cr() * 0.8), fill: '#eaf1ff' }, g);
      }
    } else if (o.type === 'fan') {
      el('path', { d: 'M' + x + ' ' + y + ' l12 -5 q4 6 0 12 z', fill: '#bcd2ff', opacity: '.55' }, g);
      el('circle', { cx: x, cy: y, r: 1.4, fill: '#fff' }, g);
    } else if (o.type === 'echo') {
      el('circle', { cx: x, cy: y, r: 13, fill: 'url(#sky-echo)' }, g);
      el('circle', { cx: x, cy: y, r: 1.3, fill: '#ffd9b0' }, g);
    }
    el('circle', { class: 'dso-ring', cx: x, cy: y, r: o.type === 'rosette' ? 32 : 20 }, g);
    el('circle', { class: 'hit', cx: x, cy: y, r: o.type === 'rosette' ? 30 : 16 }, g);
    const t = el('text', { class: 'dso-label', x: x + o.lx, y: y + o.ly, 'text-anchor': o.anchor }, layers.labels);
    t.textContent = o.name;
  });

  // Stars
  STARS.forEach((o) => {
    const [x, y] = o.xy;
    const r = Math.max(1.5, Math.min(9.5, 1.6 + (5.5 - o.mag) * 1.3));
    const g = el('g', { class: 'star', tabindex: '0', role: 'button', 'aria-label': o.name + ', ' + o.kind + ', magnitude ' + o.mag, 'data-id': o.id }, layers.stars);
    el('circle', { cx: x, cy: y, r: r1(r * 4.2), fill: 'url(#sky-glow)', opacity: o.major ? 0.9 : 0.75 }, g);
    if (o.major || o.mag < 2.5) {
      el('path', { d: 'M' + (x - r * 3.4) + ' ' + y + ' H' + (x + r * 3.4) + ' M' + x + ' ' + (y - r * 3.4) + ' V' + (y + r * 3.4), stroke: o.color, 'stroke-opacity': '.35', 'stroke-width': '1' }, g);
    }
    el('circle', { class: 'core', cx: x, cy: y, r: r1(r), fill: o.color }, g);
    el('circle', { class: 'ring', cx: x, cy: y, r: r1(r + 7) }, g);
    el('circle', { class: 'hit', cx: x, cy: y, r: 16 }, g);
    const t = el('text', { class: 'star-label' + (o.minor ? ' minor' : ''), x: x + o.lx, y: y + o.ly, 'text-anchor': o.anchor }, layers.labels);
    t.textContent = o.short || o.name;
  });

  /* ---------- Info panel ---------- */
  const info = document.querySelector('[data-sky-info]');
  const listHost = document.querySelector('[data-object-list]');
  const esc = U.escapeHTML;

  const DEFAULT_INFO =
    '<p class="kind">Constellation</p>' +
    '<h2>Monoceros, the Unicorn</h2>' +
    '<dl>' +
      '<dt>Area</dt><dd>482 square degrees (35th of 88)</dd>' +
      '<dt>Brightest stars</dt><dd>about 4th magnitude</dd>' +
      '<dt>Best seen</dt><dd>January to March, evenings</dd>' +
      '<dt>First charted</dt><dd>c. 1612, by Petrus Plancius</dd>' +
    '</dl>' +
    '<p class="mb-0">Select any star or glowing patch on the map to learn about it, or press <strong>Trace your own</strong> and connect the stars into a unicorn of your own design.</p>';

  function showInfo(o) {
    info.classList.remove('is-changing');
    void info.offsetWidth;
    info.classList.add('is-changing');
    if (!o) { info.innerHTML = DEFAULT_INFO; return; }
    info.innerHTML =
      '<p class="kind">' + esc(o.kind) + '</p>' +
      '<h2>' + esc(o.name) + '</h2>' +
      (o.facts && o.facts.length ? '<dl>' + o.facts.map(([k, v]) => '<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>').join('') + '</dl>' : '') +
      '<p>' + esc(o.text) + '</p>' +
      '<button class="btn btn--small btn--ghost" type="button" data-deselect style="color: var(--moon-1)">Back to the Unicorn</button>';
  }

  let selected = null;
  function select(id, focusMap) {
    selected = id;
    svg.querySelectorAll('.star, .dso').forEach((node) => node.classList.toggle('is-selected', node.dataset.id === id));
    listHost.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', String(b.dataset.id === id)));
    showInfo(id ? find(id) : null);
    if (focusMap && id) {
      const node = svg.querySelector('[data-id="' + id + '"]');
      if (node) node.focus({ preventScroll: true });
    }
  }

  listHost.innerHTML = STARS.filter((s) => s.mon || s.major).concat(DSOS).map((o) =>
    '<button type="button" data-id="' + o.id + '" aria-current="false">' + esc(o.short || o.name) + '</button>'
  ).join('');
  listHost.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-id]');
    if (b) select(b.dataset.id);
  });
  info.addEventListener('click', (e) => { if (e.target.closest('[data-deselect]')) select(null); });

  /* ---------- Trace-your-own mode ---------- */
  const map = document.querySelector('[data-sky-map]');
  const traceBtn = document.querySelector('[data-trace]');
  const tracePanel = document.querySelector('[data-trace-panel]');
  const traceStats = document.querySelector('[data-trace-stats]');
  let tracing = false;
  let armed = null;
  let userLines = U.storage.get(LINES_KEY, []);
  if (!Array.isArray(userLines)) userLines = [];
  userLines = userLines.filter((l) => Array.isArray(l) && find(l[0]) && find(l[1]));

  function drawUserLines() {
    layers.user.innerHTML = '';
    userLines.forEach(([a, b]) => {
      const A = find(a).xy;
      const B = find(b).xy;
      el('line', { class: 'user-line', x1: A[0], y1: A[1], x2: B[0], y2: B[1] }, layers.user);
    });
    const n = userLines.length;
    traceStats.textContent = n === 0
      ? 'No lines yet. Select a star, then another, to connect them.'
      : 'You have drawn ' + n + (n === 1 ? ' line' : ' lines') + '. Astronomers have argued about less.';
    U.storage.set(LINES_KEY, userLines);
  }

  function setArmed(id) {
    armed = id;
    svg.querySelectorAll('.star').forEach((node) => node.classList.toggle('is-armed', node.dataset.id === id));
    if (!id) ghost.setAttribute('visibility', 'hidden');
  }

  function setTracing(on) {
    tracing = on;
    traceBtn.setAttribute('aria-pressed', String(on));
    map.classList.toggle('mode-trace', on);
    tracePanel.hidden = !on;
    setArmed(null);
    if (on) U.toast('Trace mode: connect any two stars.');
  }

  function activate(id) {
    const o = find(id);
    if (!o) return;
    const isStar = STARS.includes(o);
    if (!tracing || !isStar) { select(id); return; }
    if (!armed) { setArmed(id); return; }
    if (armed === id) { setArmed(null); return; }
    const key = [armed, id].sort().join('|');
    if (!userLines.some((l) => l.slice().sort().join('|') === key)) {
      userLines.push([armed, id]);
      drawUserLines();
    }
    setArmed(id);
  }

  svg.addEventListener('click', (e) => {
    const node = e.target.closest('.star, .dso');
    if (node) activate(node.dataset.id);
  });
  svg.addEventListener('keydown', (e) => {
    const node = e.target.closest('.star, .dso');
    if (node && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      activate(node.dataset.id);
    }
    if (e.key === 'Escape' && armed) setArmed(null);
  });
  svg.addEventListener('pointermove', (e) => {
    if (!tracing || !armed) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const A = find(armed).xy;
    ghost.setAttribute('x1', A[0]);
    ghost.setAttribute('y1', A[1]);
    ghost.setAttribute('x2', r1(pt.x));
    ghost.setAttribute('y2', r1(pt.y));
    ghost.setAttribute('visibility', 'visible');
  });
  svg.addEventListener('pointerleave', () => ghost.setAttribute('visibility', 'hidden'));

  traceBtn.addEventListener('click', () => setTracing(!tracing));
  document.querySelector('[data-trace-undo]').addEventListener('click', () => {
    userLines.pop();
    drawUserLines();
  });
  document.querySelector('[data-trace-clear]').addEventListener('click', () => {
    userLines = [];
    setArmed(null);
    drawUserLines();
  });

  /* ---------- Layer toggles ---------- */
  document.querySelectorAll('[data-layer]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      const group = svg.querySelector('[data-layer-group="' + btn.dataset.layer + '"]');
      if (group) group.style.display = on ? '' : 'none';
      if (btn.dataset.layer === 'figure' && on) drawFigure(!U.reducedMotion());
    });
  });

  /* ---------- Treasures ---------- */
  const TREASURE_ART = {
    rosette: '<svg viewBox="0 0 320 180" aria-hidden="true"><defs><radialGradient id="t-rose" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ff6f9c" stop-opacity="0"/><stop offset=".35" stop-color="#ff6f9c" stop-opacity=".1"/><stop offset=".6" stop-color="#ff5f8f" stop-opacity=".75"/><stop offset=".82" stop-color="#ff8fb5" stop-opacity=".25"/><stop offset="1" stop-color="#ff8fb5" stop-opacity="0"/></radialGradient></defs><rect width="320" height="180" fill="#07051c"/><circle cx="160" cy="90" r="86" fill="url(#t-rose)"/><g fill="#fff"><circle cx="152" cy="86" r="1.6"/><circle cx="166" cy="94" r="1.4"/><circle cx="160" cy="80" r="1.2"/><circle cx="170" cy="84" r="1.8"/><circle cx="148" cy="98" r="1.2"/><circle cx="158" cy="100" r="1"/></g></svg>',
    xmas: '<svg viewBox="0 0 320 180" aria-hidden="true"><defs><radialGradient id="t-haze"><stop offset="0" stop-color="#ff5f8f" stop-opacity=".45"/><stop offset="1" stop-color="#ff5f8f" stop-opacity="0"/></radialGradient></defs><rect width="320" height="180" fill="#07051c"/><ellipse cx="160" cy="96" rx="140" ry="80" fill="url(#t-haze)"/><path d="M160 22 L140 64 L180 64 Z" fill="#1a0f1e"/><g fill="#dfe9ff"><circle cx="160" cy="70" r="2.2"/><circle cx="150" cy="88" r="1.8"/><circle cx="172" cy="90" r="2"/><circle cx="140" cy="108" r="1.6"/><circle cx="160" cy="104" r="1.4"/><circle cx="182" cy="112" r="1.8"/><circle cx="130" cy="128" r="1.6"/><circle cx="192" cy="130" r="1.6"/><circle cx="168" cy="124" r="1.2"/></g><circle cx="160" cy="152" r="4" fill="#cfe0ff"/><circle cx="160" cy="152" r="12" fill="#cfe0ff" opacity=".2"/></svg>',
    hubble: '<svg viewBox="0 0 320 180" aria-hidden="true"><defs><linearGradient id="t-fan" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".9"/><stop offset="1" stop-color="#7fa6ff" stop-opacity="0"/></linearGradient></defs><rect width="320" height="180" fill="#07051c"/><path d="M160 150 C120 110 108 60 120 22 C140 40 180 40 200 22 C212 60 200 110 160 150 Z" fill="url(#t-fan)"/><circle cx="160" cy="150" r="4" fill="#fff"/><circle cx="160" cy="150" r="14" fill="#fff" opacity=".15"/></svg>',
    m50: '<svg viewBox="0 0 320 180" aria-hidden="true"><rect width="320" height="180" fill="#07051c"/><g fill="#e9f0ff" data-scatter="m50"></g><circle cx="168" cy="92" r="3" fill="#ffb27a"/></svg>',
    v838: '<svg viewBox="0 0 320 180" aria-hidden="true"><defs><radialGradient id="t-echo"><stop offset="0" stop-color="#ffd2a1" stop-opacity="0"/><stop offset=".45" stop-color="#ffb87a" stop-opacity=".05"/><stop offset=".6" stop-color="#ff9f5a" stop-opacity=".7"/><stop offset=".72" stop-color="#ffd2a1" stop-opacity=".25"/><stop offset=".86" stop-color="#8fc0ff" stop-opacity=".45"/><stop offset="1" stop-color="#8fc0ff" stop-opacity="0"/></radialGradient></defs><rect width="320" height="180" fill="#07051c"/><circle cx="160" cy="90" r="82" fill="url(#t-echo)"/><circle cx="160" cy="90" r="3.4" fill="#ffe2c2"/></svg>',
    beta: '<svg viewBox="0 0 320 180" aria-hidden="true"><defs><radialGradient id="t-b"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="#cfe0ff" stop-opacity=".7"/><stop offset="1" stop-color="#9cc4ff" stop-opacity="0"/></radialGradient></defs><rect width="320" height="180" fill="#07051c"/><circle cx="126" cy="98" r="26" fill="url(#t-b)"/><circle cx="176" cy="80" r="21" fill="url(#t-b)"/><circle cx="200" cy="96" r="19" fill="url(#t-b)"/><circle cx="126" cy="98" r="4.5" fill="#fff"/><circle cx="176" cy="80" r="3.8" fill="#fff"/><circle cx="200" cy="96" r="3.4" fill="#fff"/></svg>'
  };

  const TREASURES = [
    { id: 'rosette', art: 'rosette', title: 'The Rosette Nebula', kind: 'Emission nebula', text: 'A giant rose of glowing hydrogen around a young star cluster, about 5,000 light-years away.' },
    { id: 'xmas', art: 'xmas', title: 'The Christmas Tree Cluster', kind: 'Cluster and nebula', text: 'A young cluster shaped like a tree, with the dark Cone Nebula at its tip.' },
    { id: 'hubble', art: 'hubble', title: "Hubble's Variable Nebula", kind: 'Reflection nebula', text: 'A fan of dust that changes from week to week; first target of the Hale Telescope in 1949.' },
    { id: 'm50', art: 'm50', title: 'Messier 50', kind: 'Open cluster', text: 'A heart-shaped swarm of a few hundred stars, lovely in binoculars.' },
    { id: 'v838', art: 'v838', title: 'V838 Monocerotis', kind: 'Erupting star', text: 'A star that flared in 2002, lighting up the dust around it in an expanding echo.' },
    { id: 'beta', art: 'beta', title: 'Beta Monocerotis', kind: 'Triple star', text: '"One of the most beautiful sights in the heavens," said William Herschel: three suns in a row.' }
  ];

  const treasuresHost = document.querySelector('[data-treasures]');
  if (treasuresHost) {
    treasuresHost.innerHTML = TREASURES.map((t, i) =>
      '<article class="treasure-card" data-reveal style="--reveal-delay:' + ((i % 3) * 0.08).toFixed(2) + 's">' +
        '<div class="pic">' + TREASURE_ART[t.art] + '</div>' +
        '<div class="txt">' +
          '<span class="kind">' + esc(t.kind) + '</span>' +
          '<h3>' + esc(t.title) + '</h3>' +
          '<p>' + esc(t.text) + '</p>' +
          '<button class="btn btn--small btn--ghost find" type="button" data-show="' + t.id + '" style="color: var(--moon-1)">Show on the map</button>' +
        '</div>' +
      '</article>'
    ).join('');
    const scatter = treasuresHost.querySelector('[data-scatter="m50"]');
    if (scatter) {
      const sr = U.seededRandom(50);
      let dots = '';
      for (let i = 0; i < 90; i++) {
        const a = sr() * Math.PI * 2;
        const d = Math.pow(sr(), 0.7) * 70;
        dots += '<circle cx="' + r1(160 + Math.cos(a) * d * 1.3) + '" cy="' + r1(90 + Math.sin(a) * d) + '" r="' + r1(0.6 + sr() * 1.4) + '" opacity="' + (0.5 + sr() * 0.5).toFixed(2) + '"/>';
      }
      scatter.innerHTML = dots;
    }
    U.reveal(treasuresHost);
    treasuresHost.addEventListener('click', (e) => {
      const b = e.target.closest('[data-show]');
      if (!b) return;
      if (tracing) setTracing(false);
      select(b.dataset.show, false);
      map.scrollIntoView({ behavior: U.reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    });
  }

  /* ---------- Go ---------- */
  showInfo(null);
  drawUserLines();
})();
