/* =============================================================
   Unicornis: the unicorn illustration engine
   Renders a customizable storybook unicorn as an SVG string.
   Used by the Atelier (builder) and the home page.
   Depends on horns.js. Exposes window.UnicornArt.
   ============================================================= */
(function () {
  'use strict';

  const Horns = window.UnicornHorns;
  const OUTLINE = '#2b2155';
  let uid = 0;

  /* ---------- Options ---------- */
  const COATS = [
    { id: 'pearl', label: 'Pearl', color: '#fdfaff' },
    { id: 'blush', label: 'Blush', color: '#ffd9ea' },
    { id: 'lavender', label: 'Lavender', color: '#e4d7ff' },
    { id: 'mint', label: 'Mint', color: '#d2f6e6' },
    { id: 'butter', label: 'Butter', color: '#fff0bf' },
    { id: 'sky', label: 'Sky', color: '#d3ecff' },
    { id: 'peach', label: 'Peach', color: '#ffdcc7' },
    { id: 'midnight', label: 'Midnight', color: '#3b3277' },
    { id: 'charcoal', label: 'Charcoal', color: '#55506a' }
  ];

  const MANES = [
    { id: 'rainbow', label: 'Rainbow', colors: ['#ff6fa5', '#ffa25e', '#ffd35e', '#6fdc9a', '#5ec3ff', '#a383ff'] },
    { id: 'pastel', label: 'Pastel', colors: ['#ffb3d4', '#ffd6a5', '#fff0a0', '#bff3d6', '#bfe1ff', '#d8c6ff'] },
    { id: 'galaxy', label: 'Galaxy', colors: ['#3a2b8f', '#6a4ce0', '#2f86c9', '#8f6bff', '#24206b', '#5b8cff'], stars: true },
    { id: 'sunset', label: 'Sunset', colors: ['#ff6b6b', '#ff9a62', '#ffc46b', '#ff86b4', '#e7609f', '#ffb38c'] },
    { id: 'ocean', label: 'Ocean', colors: ['#1fb5c9', '#5ad1e6', '#9ff0f5', '#3d8fe0', '#7fd6c2', '#2a6fd0'] },
    { id: 'candy', label: 'Candy', colors: ['#ff8cc6', '#fff4fa', '#c3a5ff', '#ff8cc6', '#fff4fa', '#8fd2ff'] },
    { id: 'meadow', label: 'Meadow', colors: ['#4f9f6a', '#82cc84', '#c2e58f', '#3f8a63', '#a3dba0', '#f2e27a'] },
    { id: 'silver', label: 'Silver', colors: ['#ecebf5', '#c9c6db', '#ffffff', '#b3afca', '#dedbea', '#f7f6fb'] },
    { id: 'flame', label: 'Flame', colors: ['#ff4f4f', '#ff8a3d', '#ffc93d', '#ff6a3d', '#ffd66b', '#e8402e'] }
  ];

  const HORNS = [
    { id: 'pearl', label: 'Pearl', spec: { colors: ['#fffaf3', '#ffe2f0', '#e4daff'], spiral: 7, groove: 'rgba(120,70,140,.30)' } },
    { id: 'gold', label: 'Gold', spec: { colors: ['#fff1b8', '#f2c75a', '#c48a1c'], spiral: 7, groove: 'rgba(110,60,0,.38)', edge: 'rgba(90,50,0,.45)' } },
    { id: 'crystal', label: 'Crystal', spec: { colors: ['#effcff', '#bfe9ff', '#dccfff'], facets: true, edge: 'rgba(70,110,200,.5)' } },
    { id: 'rainbow', label: 'Rainbow', spec: { spiral: 6, hard: true, groove: 'rgba(60,20,90,.25)' }, fromMane: true },
    { id: 'opal', label: 'Opal', spec: { colors: ['#ffe9f5', '#e3f5ff', '#e6fff2', '#fff3d4'], spiral: 9, groove: 'rgba(90,80,160,.28)' } },
    { id: 'obsidian', label: 'Obsidian', spec: { colors: ['#5a4a92', '#2a2052', '#120d26'], spiral: 7, dark: true, groove: 'rgba(0,0,0,.45)', edge: 'rgba(10,5,30,.7)' } }
  ];

  const HOOVES = [
    { id: 'gold', label: 'Gold', color: '#e8bb55', shine: '#fff2c2' },
    { id: 'silver', label: 'Silver', color: '#c8cde0', shine: '#ffffff' },
    { id: 'rose', label: 'Rose', color: '#f4a6c6', shine: '#ffe6f1' },
    { id: 'slate', label: 'Slate', color: '#5b5672', shine: '#a9a4c4' }
  ];

  const EYES = [
    { id: 'bright', label: 'Bright' },
    { id: 'dreamy', label: 'Dreamy' },
    { id: 'starry', label: 'Starry' }
  ];

  const MARKINGS = [
    { id: 'none', label: 'None' },
    { id: 'stars', label: 'Stars' },
    { id: 'hearts', label: 'Hearts' },
    { id: 'moon', label: 'Moon' },
    { id: 'dapples', label: 'Dapples' }
  ];

  const SCENES = [
    { id: 'dawn', label: 'Dawn meadow', preview: 'linear-gradient(180deg,#ffd3e6,#ffe6d6 55%,#a6e0bf 56%)' },
    { id: 'night', label: 'Starry night', preview: 'linear-gradient(180deg,#0f0b31,#3f2a7a 60%,#211a55 61%)' },
    { id: 'clouds', label: 'Cloud kingdom', preview: 'linear-gradient(180deg,#b7e3ff,#e9f7ff 62%,#ffffff 63%)' },
    { id: 'tapestry', label: 'Tapestry', preview: 'radial-gradient(circle at 30% 40%,#f4e9d0 0 2px,transparent 3px) 0 0/12px 12px,radial-gradient(circle at 70% 70%,#d9534f 0 2px,transparent 3px) 0 0/14px 14px,#1d4a3a' }
  ];

  const ACCESSORIES = [
    { id: 'crown', label: 'Flower crown' },
    { id: 'collar', label: 'Golden collar' },
    { id: 'bow', label: 'Tail bow' }
  ];

  const byId = (list, id) => list.find((x) => x.id === id) || list[0];

  /* ---------- Color helpers ---------- */
  function hexToRgb(hex) {
    let h = String(hex).replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(rgb) {
    return '#' + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }
  function mix(a, b, t) {
    const A = hexToRgb(a);
    const B = hexToRgb(b);
    return rgbToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
  }
  function luminance(hex) {
    const c = hexToRgb(hex).map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);

  /* ---------- Geometry helpers ---------- */
  const f = (p) => (Math.round(p[0] * 10) / 10) + ' ' + (Math.round(p[1] * 10) / 10);

  /** A tapered, round-capped ribbon along a cubic Bezier (mane locks, tail strands). */
  function taper(p0, p1, p2, p3, w0, w1, bulge) {
    const N = 26;
    const L = [];
    const R = [];
    const W = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const mt = 1 - t;
      const x = mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0];
      const y = mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1];
      let dx = 3 * mt * mt * (p1[0] - p0[0]) + 6 * mt * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
      let dy = 3 * mt * mt * (p1[1] - p0[1]) + 6 * mt * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
      const l = Math.hypot(dx, dy) || 1;
      dx /= l; dy /= l;
      const w = Math.max(0.8, (w0 + (w1 - w0) * t) * (1 + (bulge || 0) * Math.sin(Math.PI * t))) / 2;
      L.push([x + dy * w, y - dx * w]);
      R.push([x - dy * w, y + dx * w]);
      W.push(w);
    }
    let d = 'M' + f(L[0]);
    for (let i = 1; i <= N; i++) d += ' L' + f(L[i]);
    d += ' A' + W[N].toFixed(1) + ' ' + W[N].toFixed(1) + ' 0 0 1 ' + f(R[N]);
    for (let i = N - 1; i >= 0; i--) d += ' L' + f(R[i]);
    d += ' A' + W[0].toFixed(1) + ' ' + W[0].toFixed(1) + ' 0 0 1 ' + f(L[0]) + ' Z';
    return d;
  }

  function sparkle(cx, cy, r, color, cls, delay) {
    return Horns.sparkle(Math.round(cx * 10) / 10, Math.round(cy * 10) / 10, r, color, cls, delay);
  }

  function heart(cx, cy, s, color) {
    return '<path d="M' + cx + ' ' + (cy + s * 0.9) +
      ' C' + (cx - s * 1.3) + ' ' + (cy + s * 0.1) + ' ' + (cx - s * 0.9) + ' ' + (cy - s * 0.9) + ' ' + cx + ' ' + (cy - s * 0.35) +
      ' C' + (cx + s * 0.9) + ' ' + (cy - s * 0.9) + ' ' + (cx + s * 1.3) + ' ' + (cy + s * 0.1) + ' ' + cx + ' ' + (cy + s * 0.9) + ' Z" fill="' + color + '"/>';
  }

  function flower(cx, cy, r, petal, center) {
    let s = '';
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      s += '<circle cx="' + (cx + Math.cos(a) * r * 0.62).toFixed(1) + '" cy="' + (cy + Math.sin(a) * r * 0.62).toFixed(1) + '" r="' + (r * 0.5).toFixed(1) + '" fill="' + petal + '" stroke="' + OUTLINE + '" stroke-width="1.6"/>';
    }
    return s + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.36).toFixed(1) + '" fill="' + center + '" stroke="' + OUTLINE + '" stroke-width="1.4"/>';
  }

  /* ---------- Unicorn body geometry (local coordinates) ---------- */
  const BODY = 'M196 262 C200 228 250 220 300 224 C330 226 352 226 366 214 C380 196 392 160 410 132 L466 150 C462 190 452 222 446 252 C440 300 436 336 404 354 C360 376 250 376 214 358 C178 340 182 292 196 262 Z';
  const HEAD = 'M412 118 C410 84 438 62 470 64 C500 66 518 86 528 110 C536 128 552 146 554 166 C557 190 536 204 510 202 C486 200 462 192 444 178 C422 162 413 142 412 118 Z';
  const EAR = 'M436 84 C426 58 432 36 448 20 C462 38 468 60 462 82 Z';
  const EAR_INNER = 'M442 76 C437 60 440 46 448 34 C455 47 458 62 455 76 Z';
  /* Feathered wing: a leading edge from the shoulder to the tip,
     then rounded feather lobes along the trailing edge. */
  const WING_ROOT = [328, 252];
  const WING_TIP = [196, 138];
  const WING_TRAIL = [[196, 138], [206, 170], [226, 198], [252, 222], [280, 242], [308, 258], [328, 262]];
  const WING = (function () {
    let d = 'M' + WING_ROOT.join(' ') + ' C306 204 258 156 ' + WING_TIP.join(' ');
    for (let i = 0; i < WING_TRAIL.length - 1; i++) {
      const a = WING_TRAIL[i];
      const b = WING_TRAIL[i + 1];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1;
      const bump = i === WING_TRAIL.length - 2 ? 8 : 15;
      const nx = (-dy / l) * bump;
      const ny = (dx / l) * bump;
      d += ' C' + (a[0] + nx).toFixed(1) + ' ' + (a[1] + ny).toFixed(1) + ' ' + (b[0] + nx).toFixed(1) + ' ' + (b[1] + ny).toFixed(1) + ' ' + b[0] + ' ' + b[1];
    }
    return d + ' Z';
  })();
  const WING_LINES = WING_TRAIL.slice(1, -1).map((q) => 'M' + WING_ROOT.join(' ') + ' Q' + ((WING_ROOT[0] + q[0]) / 2 + 6).toFixed(0) + ' ' + ((WING_ROOT[1] + q[1]) / 2 - 10).toFixed(0) + ' ' + (q[0] + 10) + ' ' + (q[1] - 4)).join(' ');

  // Mane locks from the withers (drawn first) up to the poll (drawn last, on top).
  const MANE_LOCKS = [
    { p: [[370, 222], [346, 222], [314, 246], [322, 280]], w0: 28, w1: 4, bulge: 0.25, k: 5 },
    { p: [[380, 196], [350, 190], [312, 214], [314, 254]], w0: 32, w1: 4, bulge: 0.25, k: 4 },
    { p: [[392, 168], [360, 158], [318, 180], [316, 224]], w0: 34, w1: 4, bulge: 0.25, k: 3 },
    { p: [[402, 142], [370, 128], [328, 146], [324, 192]], w0: 36, w1: 4, bulge: 0.25, k: 2 },
    { p: [[414, 114], [386, 98], [342, 112], [336, 156]], w0: 36, w1: 4, bulge: 0.25, k: 1 },
    { p: [[424, 92], [404, 70], [366, 78], [354, 116]], w0: 34, w1: 4, bulge: 0.25, k: 0 }
  ];

  const FORELOCKS = [
    { p: [[452, 76], [462, 70], [474, 82], [468, 100]], w0: 20, w1: 3, bulge: 0.2, k: 2 },
    { p: [[458, 68], [478, 56], [498, 70], [490, 94]], w0: 26, w1: 3, bulge: 0.25, k: 0 }
  ];

  const TAIL_LOCKS = [
    { p: [[204, 290], [174, 318], [160, 362], [190, 398]], w0: 30, w1: 4, bulge: 0.3, k: 3 },
    { p: [[202, 280], [156, 290], [126, 334], [150, 380]], w0: 34, w1: 4, bulge: 0.3, k: 2 },
    { p: [[202, 268], [150, 256], [104, 296], [124, 344]], w0: 36, w1: 4, bulge: 0.3, k: 1 },
    { p: [[204, 258], [160, 224], [104, 244], [110, 296]], w0: 34, w1: 4, bulge: 0.3, k: 0 }
  ];

  // Legs: x position, far (behind) or near.
  const LEGS = [
    { x: 248, far: true },
    { x: 344, far: true },
    { x: 206, far: false },
    { x: 386, far: false }
  ];

  const HORN_BASE = [498, 78];
  const HORN_ANGLE = -61;

  /* ---------- Default state & sanitizing ---------- */
  function defaultState() {
    return {
      name: 'Moonbeam Thistlewhisper',
      coat: '#fdfaff',
      mane: 'rainbow',
      horn: 'pearl',
      hornLength: 46,
      hooves: 'gold',
      eyes: 'bright',
      marking: 'stars',
      wings: false,
      crown: true,
      collar: false,
      bow: false,
      scene: 'dawn',
      sparkle: 3
    };
  }

  function sanitize(input) {
    const d = defaultState();
    const s = Object.assign({}, d, input || {});
    const oneOf = (list, v, fallback) => (list.some((x) => x.id === v) ? v : fallback);
    s.coat = isHex(s.coat) ? s.coat.toLowerCase() : d.coat;
    s.mane = oneOf(MANES, s.mane, d.mane);
    s.horn = oneOf(HORNS, s.horn, d.horn);
    s.hooves = oneOf(HOOVES, s.hooves, d.hooves);
    s.eyes = oneOf(EYES, s.eyes, d.eyes);
    s.marking = oneOf(MARKINGS, s.marking, d.marking);
    s.scene = oneOf(SCENES, s.scene, d.scene);
    s.hornLength = Math.max(20, Math.min(90, Math.round(Number(s.hornLength) || d.hornLength)));
    s.sparkle = Math.max(0, Math.min(5, Math.round(Number(s.sparkle))));
    if (!Number.isFinite(s.sparkle)) s.sparkle = d.sparkle;
    ['wings', 'crown', 'collar', 'bow'].forEach((k) => { s[k] = s[k] === true || s[k] === 'true' || s[k] === '1' || s[k] === 1; });
    s.name = String(s.name || d.name).replace(/\s+/g, ' ').trim().slice(0, 48) || d.name;
    return s;
  }

  /* ---------- Scenes (600 x 500 view coordinates) ---------- */
  function sceneMarkup(scene, p, rand) {
    let defs = '';
    let back = '';
    let front = '';

    if (scene === 'night') {
      defs += '<linearGradient id="' + p + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0930"/><stop offset=".6" stop-color="#2a1d66"/><stop offset="1" stop-color="#41297d"/></linearGradient>' +
        '<radialGradient id="' + p + 'moonglow"><stop offset="0" stop-color="#fff6d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="' + p + 'halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#b79cff" stop-opacity=".45"/><stop offset="1" stop-color="#b79cff" stop-opacity="0"/></radialGradient>' +
        '<mask id="' + p + 'crescent"><rect width="600" height="500" fill="#fff"/><circle cx="126" cy="96" r="31" fill="#000"/></mask>';
      back += '<rect width="600" height="500" fill="url(#' + p + 'sky)"/>';
      for (let i = 0; i < 70; i++) {
        const x = rand() * 600;
        const y = rand() * 360;
        const r = rand() < 0.1 ? 1.8 : 0.6 + rand() * 0.9;
        back += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="#fff" opacity="' + (0.35 + rand() * 0.6).toFixed(2) + '"/>';
      }
      back += '<circle cx="108" cy="104" r="90" fill="url(#' + p + 'moonglow)"/>' +
        '<circle cx="108" cy="104" r="36" fill="#fff4d2" mask="url(#' + p + 'crescent)"/>' +
        '<ellipse cx="320" cy="300" rx="250" ry="200" fill="url(#' + p + 'halo)"/>' +
        '<path d="M0 380 C120 340 230 352 330 372 S520 346 600 356 L600 500 L0 500 Z" fill="#2b2270"/>' +
        '<path d="M0 434 C150 418 300 424 450 430 S560 426 600 422 L600 500 L0 500 Z" fill="#1f1852"/>' +
        '<path d="M0 434 C150 418 300 424 450 430 S560 426 600 422" fill="none" stroke="#4b3c9a" stroke-width="2"/>';
      for (let i = 0; i < 9; i++) {
        const x = 30 + rand() * 540;
        const y = 380 + rand() * 90;
        front += '<circle class="u-sparkle" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.4" fill="#fff3a8" style="--tw:' + (rand() * 2.5).toFixed(2) + 's"/>';
      }
    } else if (scene === 'clouds') {
      defs += '<linearGradient id="' + p + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9dcff"/><stop offset="1" stop-color="#eef8ff"/></linearGradient>';
      back += '<rect width="600" height="500" fill="url(#' + p + 'sky)"/>';
      const bands = ['#ff7b7b', '#ffb25e', '#ffe066', '#7bdc8f', '#6cc4ff', '#a68bff'];
      bands.forEach((c, i) => {
        const r = 300 - i * 14;
        back += '<path d="M' + (300 - r) + ' 470 A' + r + ' ' + r + ' 0 0 1 ' + (300 + r) + ' 470" fill="none" stroke="' + c + '" stroke-width="14" opacity=".55"/>';
      });
      const cloud = (cx, cy, s, op) => '<g fill="#fff" opacity="' + op + '">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (26 * s) + '"/>' +
        '<circle cx="' + (cx + 30 * s) + '" cy="' + (cy - 12 * s) + '" r="' + (32 * s) + '"/>' +
        '<circle cx="' + (cx + 64 * s) + '" cy="' + cy + '" r="' + (24 * s) + '"/>' +
        '<rect x="' + cx + '" y="' + cy + '" width="' + (64 * s) + '" height="' + (24 * s) + '"/></g>';
      back += cloud(70, 110, 0.9, 0.9) + cloud(430, 70, 0.7, 0.85) + cloud(250, 180, 0.5, 0.7);
      // fluffy cloud floor
      let floor = '';
      for (let i = 0; i < 14; i++) {
        const x = i * 46 - 10;
        floor += '<circle cx="' + x + '" cy="' + (452 + (i % 2) * 10) + '" r="' + (40 + (i % 3) * 8) + '"/>';
      }
      back += '<g fill="#ffffff">' + floor + '<rect x="0" y="460" width="600" height="40"/></g>' +
        '<g fill="#e6f1fb">' + '<rect x="0" y="484" width="600" height="16"/></g>';
    } else if (scene === 'tapestry') {
      defs += '<pattern id="' + p + 'mf" width="56" height="56" patternUnits="userSpaceOnUse">' +
        '<path d="M8 14 q4 -8 8 0 q-4 8 -8 0z M30 40 q4 -8 8 0 q-4 8 -8 0z" fill="#2f7356"/>' +
        '<g fill="#f4e9d0"><circle cx="14" cy="10" r="2.2"/><circle cx="18" cy="12" r="2.2"/><circle cx="16" cy="16" r="2.2"/><circle cx="11" cy="15" r="2.2"/></g><circle cx="14.5" cy="13" r="1.6" fill="#f3c95a"/>' +
        '<g fill="#d9534f"><circle cx="40" cy="34" r="2.4"/><circle cx="44" cy="37" r="2.4"/><circle cx="41" cy="41" r="2.4"/><circle cx="37" cy="38" r="2.4"/></g><circle cx="40.6" cy="37.6" r="1.6" fill="#ffd27a"/>' +
        '<g fill="#e9a6c9"><circle cx="46" cy="10" r="1.8"/><circle cx="49" cy="12" r="1.8"/><circle cx="46" cy="14" r="1.8"/></g>' +
        '<g fill="#9cc7e8"><circle cx="20" cy="44" r="1.8"/><circle cx="23" cy="47" r="1.8"/><circle cx="19" cy="49" r="1.8"/></g>' +
        '</pattern>' +
        '<radialGradient id="' + p + 'vign" cx="50%" cy="45%" r="70%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>';
      back += '<rect width="600" height="500" fill="#1c4636"/><rect width="600" height="500" fill="url(#' + p + 'mf)"/>';
      // The round fence of "The Unicorn Rests in a Garden" (back half only).
      const cx = 316, cy = 404, rx = 252, ry = 78;
      let posts = '';
      for (let i = 0; i <= 12; i++) {
        const a = Math.PI + (Math.PI * i) / 12;
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * ry;
        posts += '<rect x="' + (x - 5).toFixed(1) + '" y="' + (y - 64).toFixed(1) + '" width="10" height="66" rx="3" fill="#a0703a" stroke="#3b2410" stroke-width="2"/>';
      }
      const rail = (dy) => '<path d="M' + (cx - rx) + ' ' + (cy - dy) + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + (cy - dy) + '" fill="none" stroke="#8a5a2b" stroke-width="5"/>';
      back += rail(48) + rail(22) + posts;
      back += '<rect width="600" height="500" fill="url(#' + p + 'vign)"/>';
      front += '<rect x="10" y="10" width="580" height="480" fill="none" stroke="#e3b552" stroke-width="3" opacity=".75"/>' +
        '<rect x="18" y="18" width="564" height="464" fill="none" stroke="#e3b552" stroke-width="1" opacity=".5"/>';
    } else {
      // Dawn meadow (default)
      defs += '<linearGradient id="' + p + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcfe4"/><stop offset=".55" stop-color="#ffe5d4"/><stop offset="1" stop-color="#fff4de"/></linearGradient>' +
        '<radialGradient id="' + p + 'sun"><stop offset="0" stop-color="#fff7cf"/><stop offset=".35" stop-color="#fff1c0" stop-opacity=".8"/><stop offset="1" stop-color="#ffe0c0" stop-opacity="0"/></radialGradient>';
      back += '<rect width="600" height="500" fill="url(#' + p + 'sky)"/>' +
        '<circle cx="108" cy="112" r="110" fill="url(#' + p + 'sun)"/>' +
        '<circle cx="108" cy="112" r="40" fill="#fff6d2"/>' +
        '<g fill="#fff" opacity=".8"><ellipse cx="440" cy="92" rx="56" ry="16"/><ellipse cx="470" cy="82" rx="34" ry="14"/><ellipse cx="236" cy="168" rx="40" ry="10"/></g>' +
        '<path d="M0 372 C110 338 230 350 330 370 S520 344 600 352 L600 500 L0 500 Z" fill="#c6ecd6"/>' +
        '<path d="M0 434 C150 418 300 424 450 430 S560 426 600 422 L600 500 L0 500 Z" fill="#a4dfbd"/>' +
        '<path d="M0 434 C150 418 300 424 450 430 S560 426 600 422" fill="none" stroke="#8ccfa8" stroke-width="2"/>';
      const petals = ['#ff8cc6', '#ffffff', '#ffd35e', '#c3a5ff'];
      for (let i = 0; i < 16; i++) {
        const x = 16 + rand() * 568;
        const y = 448 + rand() * 42;
        const c = petals[Math.floor(rand() * petals.length)];
        front += '<g opacity=".95"><circle cx="' + (x - 2.5).toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.6" fill="' + c + '"/><circle cx="' + (x + 2.5).toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.6" fill="' + c + '"/><circle cx="' + x.toFixed(1) + '" cy="' + (y - 2.5).toFixed(1) + '" r="2.6" fill="' + c + '"/><circle cx="' + x.toFixed(1) + '" cy="' + (y + 2.5).toFixed(1) + '" r="2.6" fill="' + c + '"/><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="1.8" fill="#ffb84d"/></g>';
      }
    }
    return { defs, back, front };
  }

  /* ---------- Main renderer ---------- */
  /**
   * render(state, opts) -> SVG markup string.
   * opts.animated: add idle animations (bobbing, tail sway, blinking)
   * opts.label: accessible label
   * opts.scene: false to render on a transparent background
   */
  function render(input, opts) {
    const o = opts || {};
    const s = sanitize(input);
    const p = 'u' + (++uid) + '-';
    const rand = window.Unicornis ? window.Unicornis.seededRandom(window.Unicornis.hashString(s.name + s.scene)) : Math.random;
    const mane = byId(MANES, s.mane).colors;
    const hoof = byId(HOOVES, s.hooves);
    const coat = s.coat;
    const coatShade = mix(coat, OUTLINE, luminance(coat) > 0.5 ? 0.13 : 0.28);
    const coatFar = mix(coat, OUTLINE, luminance(coat) > 0.5 ? 0.2 : 0.35);
    const coatLight = mix(coat, '#ffffff', 0.55);
    const darkCoat = luminance(coat) < 0.18;
    const anim = !!o.animated;

    const scene = o.scene === false ? { defs: '', back: '', front: '' } : sceneMarkup(s.scene, p, rand);

    // Horn
    const hornDef = byId(HORNS, s.horn);
    const hornSpec = Object.assign({ width: 30, angle: HORN_ANGLE, profile: 'cone', bend: -0.04 }, hornDef.spec);
    if (hornDef.fromMane) hornSpec.colors = mane.slice(0, 5);
    hornSpec.length = 36 + (s.hornLength - 20) * 1.55;
    const horn = Horns.hornMarkup(hornSpec, HORN_BASE, p + 'h-');

    const lock = (L, colorIndex, extraClass) => {
      const c = mane[colorIndex % mane.length];
      return '<path' + (extraClass ? ' class="' + extraClass + '"' : '') + ' d="' + taper(L.p[0], L.p[1], L.p[2], L.p[3], L.w0, L.w1, L.bulge) + '" fill="' + c + '" stroke="' + OUTLINE + '" stroke-width="4" stroke-linejoin="round"/>';
    };

    // Legs
    const leg = (x, far) => {
      const fill = far ? coatFar : coat;
      const hoofFill = far ? mix(hoof.color, OUTLINE, 0.25) : hoof.color;
      return '<g>' +
        '<path d="M' + x + ' 296 L' + (x + 3) + ' 412 L' + (x + 37) + ' 412 L' + (x + 40) + ' 296 Z" fill="' + fill + '" stroke="' + OUTLINE + '" stroke-width="4.5" stroke-linejoin="round"/>' +
        '<path d="M' + (x - 2) + ' 404 L' + (x + 42) + ' 404 L' + (x + 44) + ' 428 Q' + (x + 44) + ' 438 ' + (x + 34) + ' 438 L' + (x + 6) + ' 438 Q' + (x - 4) + ' 438 ' + (x - 4) + ' 428 Z" fill="' + hoofFill + '" stroke="' + OUTLINE + '" stroke-width="4.5" stroke-linejoin="round"/>' +
        (far ? '' : '<path d="M' + (x + 6) + ' 412 L' + (x + 8) + ' 428" stroke="' + hoof.shine + '" stroke-width="3" stroke-linecap="round" opacity=".8"/>') +
        '</g>';
    };

    // Markings on the flank (clipped to the body)
    let markings = '';
    const markColor = darkCoat ? mix(mane[2], '#ffffff', 0.3) : mane[0];
    const markColor2 = darkCoat ? mix(mane[4], '#ffffff', 0.3) : mane[4 % mane.length];
    if (s.marking === 'stars') {
      markings = sparkle(250, 296, 17, markColor) + sparkle(276, 268, 10, markColor2) + sparkle(228, 266, 7, mane[2]);
    } else if (s.marking === 'hearts') {
      markings = heart(252, 300, 13, markColor) + heart(280, 272, 8, markColor2) + heart(230, 272, 6, mane[2]);
    } else if (s.marking === 'moon') {
      markings = '<mask id="' + p + 'mk"><rect x="150" y="200" width="200" height="200" fill="#fff"/><circle cx="262" cy="282" r="17" fill="#000"/></mask>' +
        '<circle cx="250" cy="290" r="20" fill="' + markColor + '" mask="url(#' + p + 'mk)"/>' + sparkle(280, 268, 8, markColor2);
    } else if (s.marking === 'dapples') {
      const dapple = darkCoat ? mix(coat, '#ffffff', 0.18) : mix(coat, OUTLINE, 0.07);
      const spots = [[230, 280, 13], [262, 300, 10], [290, 262, 9], [250, 326, 8], [214, 310, 9], [318, 300, 11], [348, 270, 8], [372, 318, 9], [300, 338, 7], [232, 248, 7]];
      markings = spots.map((q) => '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="' + dapple + '"/>').join('');
    }

    // Eyes
    let eye = '';
    if (s.eyes === 'dreamy') {
      eye = '<path d="M474 118 Q488 130 502 118" fill="none" stroke="' + OUTLINE + '" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M478 122 L470 129 M486 126 L483 135 M495 125 L497 134" stroke="' + OUTLINE + '" stroke-width="3" stroke-linecap="round"/>';
    } else {
      const starry = s.eyes === 'starry';
      eye = '<g' + (anim ? ' class="u-blink"' : '') + '>' +
        '<ellipse cx="488" cy="119" rx="11.5" ry="14.5" fill="' + OUTLINE + '"/>' +
        (starry
          ? sparkle(490, 115, 7.5, '#fff6c2') + '<circle cx="483" cy="127" r="2" fill="#fff"/>'
          : '<circle cx="492" cy="113" r="4.6" fill="#fff"/><circle cx="484" cy="126" r="2.2" fill="#fff"/>') +
        '</g>' +
        '<path d="M479 107 L471 99 M484 104 L481 95 M476 112 L467 108" stroke="' + OUTLINE + '" stroke-width="3" stroke-linecap="round"/>';
    }

    // Wings
    const wingFill = p + 'wing';
    const wingDefs = '<linearGradient id="' + wingFill + '" x1="330" y1="252" x2="200" y2="160" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="' + coat + '"/><stop offset=".55" stop-color="' + mix(coat, mane[4 % mane.length], 0.35) + '"/><stop offset="1" stop-color="' + mix(coat, mane[0], 0.55) + '"/></linearGradient>';
    const wing = (back) => '<g' + (anim ? ' class="u-wing"' : '') + (back ? ' transform="translate(34 -20) rotate(-12 328 252)"' : '') + '>' +
      '<path d="' + WING + '" fill="' + (back ? coatFar : 'url(#' + wingFill + ')') + '" stroke="' + OUTLINE + '" stroke-width="4.5" stroke-linejoin="round"/>' +
      (back ? '' : '<path d="' + WING_LINES + '" fill="none" stroke="' + OUTLINE + '" stroke-opacity=".35" stroke-width="2.5" stroke-linecap="round"/>') +
      '</g>';

    // Accessories
    const collar = s.collar
      ? '<path d="M366 200 C392 226 424 238 454 234 L452 252 C420 256 384 242 360 218 Z" fill="#efc463" stroke="' + OUTLINE + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M374 214 C398 234 424 242 448 240" fill="none" stroke="#fff3c4" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>' +
        '<circle cx="440" cy="262" r="9" fill="#ff8cc6" stroke="' + OUTLINE + '" stroke-width="3.5"/><circle cx="437" cy="259" r="2.6" fill="#fff"/>'
      : '';
    const crown = s.crown
      ? '<path d="M428 96 C440 78 462 66 484 60" fill="none" stroke="#5a9d61" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M446 82 q-6 -8 2 -12 q4 8 -2 12z M470 66 q-2 -10 6 -10 q0 9 -6 10z" fill="#7cc47f" stroke="' + OUTLINE + '" stroke-width="1.6"/>' +
        flower(432, 92, 13, '#ff8cc6', '#ffd35e') + flower(458, 74, 12, '#fff4fa', '#ffb84d') + flower(482, 62, 11, '#c3a5ff', '#ffd35e')
      : '';
    const bow = s.bow
      ? '<g transform="translate(200 266)">' +
          '<path d="M0 0 C-14 -20 -34 -14 -28 2 C-34 18 -14 22 0 0 Z" fill="#ff8cc6" stroke="' + OUTLINE + '" stroke-width="3.5" stroke-linejoin="round"/>' +
          '<path d="M0 0 C14 -20 34 -14 28 2 C34 18 14 22 0 0 Z" fill="#ff8cc6" stroke="' + OUTLINE + '" stroke-width="3.5" stroke-linejoin="round"/>' +
          '<path d="M-4 4 L-12 28 M4 4 L10 28" stroke="#ff8cc6" stroke-width="6" stroke-linecap="round"/>' +
          '<circle r="7" fill="#ffb3d9" stroke="' + OUTLINE + '" stroke-width="3.5"/></g>'
      : '';

    // Galaxy manes get tiny stars
    let maneStars = '';
    if (byId(MANES, s.mane).stars) {
      const spots = [[392, 120], [370, 170], [354, 214], [330, 150], [126, 300], [140, 352], [166, 392], [118, 260], [478, 84], [408, 96]];
      maneStars = spots.map((q, i) => sparkle(q[0], q[1], i % 3 === 0 ? 4.5 : 3, '#ffffff', anim ? 'u-sparkle' : '', (i * 0.37).toFixed(2))).join('');
    }

    // Sparkles around the unicorn (view coordinates)
    const sparkleSpots = [[566, 40], [520, 150], [40, 230], [80, 330], [574, 260], [248, 60], [360, 36], [30, 120], [560, 360], [190, 140], [420, 170], [130, 200], [590, 170], [300, 120], [470, 30], [20, 300], [540, 210], [220, 30], [100, 60], [400, 70], [580, 420], [30, 420], [150, 100], [450, 120], [340, 80], [60, 180]];
    const counts = [0, 4, 8, 12, 18, 26];
    const sparkleColors = s.scene === 'night' || s.scene === 'tapestry' ? ['#fff6c2', '#ffffff', '#ffd6ec'] : ['#ffffff', '#ffe49c', '#ff9ccf', '#a98bff'];
    let sparkles = '';
    for (let i = 0; i < counts[s.sparkle]; i++) {
      const q = sparkleSpots[i];
      sparkles += sparkle(q[0], q[1], 5 + ((i * 7) % 9), sparkleColors[i % sparkleColors.length], anim ? 'u-sparkle' : '', (i * 0.29 % 2.6).toFixed(2));
    }

    const label = o.label ? ' role="img" aria-label="' + String(o.label).replace(/"/g, '&quot;') + '"' : ' aria-hidden="true" focusable="false"';

    return '<svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg"' + label + '>' +
      '<defs>' + scene.defs + horn.defs + wingDefs +
        '<clipPath id="' + p + 'body"><path d="' + BODY + '"/></clipPath>' +
      '</defs>' +
      scene.back +
      '<ellipse cx="290" cy="451" rx="150" ry="13" fill="#1d1642" opacity="' + (s.scene === 'night' ? 0.35 : 0.14) + '"/>' +
      '<g' + (anim ? ' class="u-bob"' : '') + '>' +
      '<g transform="translate(-2 55) scale(.9)">' +
        (s.wings ? wing(true) : '') +
        '<g' + (anim ? ' class="u-tail"' : '') + '>' + TAIL_LOCKS.map((L) => lock(L, L.k + 1)).join('') + '</g>' +
        LEGS.filter((l) => l.far).map((l) => leg(l.x, true)).join('') +
        LEGS.filter((l) => !l.far).map((l) => leg(l.x, false)).join('') +
        '<path d="' + BODY + '" fill="' + coat + '"/>' +
        '<g clip-path="url(#' + p + 'body)">' +
          '<ellipse cx="300" cy="376" rx="170" ry="44" fill="' + coatShade + '" opacity=".75"/>' +
          '<ellipse cx="292" cy="236" rx="86" ry="12" fill="' + coatLight + '" opacity="' + (darkCoat ? 0.25 : 0.6) + '"/>' +
          markings +
        '</g>' +
        '<path d="' + BODY + '" fill="none" stroke="' + OUTLINE + '" stroke-width="4.5" stroke-linejoin="round"/>' +
        (s.wings ? wing(false) : '') +
        collar +
        '<g>' + MANE_LOCKS.map((L) => lock(L, L.k)).join('') + '</g>' +
        bow +
        '<path d="' + HEAD + '" fill="' + coat + '" stroke="' + OUTLINE + '" stroke-width="4.5" stroke-linejoin="round"/>' +
        '<ellipse cx="530" cy="178" rx="24" ry="18" fill="' + coatShade + '" opacity=".55"/>' +
        '<path d="' + EAR + '" fill="' + coat + '" stroke="' + OUTLINE + '" stroke-width="4.5" stroke-linejoin="round"/>' +
        '<path d="' + EAR_INNER + '" fill="#ffb3d4"/>' +
        horn.body +
        FORELOCKS.map((L) => lock(L, L.k)).join('') +
        crown +
        eye +
        '<ellipse cx="514" cy="150" rx="13" ry="8" fill="#ff8cc6" opacity="' + (darkCoat ? 0.65 : 0.5) + '"/>' +
        '<ellipse cx="539" cy="168" rx="3.8" ry="2.6" fill="' + OUTLINE + '" opacity=".7" transform="rotate(-25 539 168)"/>' +
        '<path d="M519 189 Q530 195 541 187" fill="none" stroke="' + OUTLINE + '" stroke-width="3.5" stroke-linecap="round"/>' +
        maneStars +
      '</g>' +
      '</g>' +
      sparkles +
      scene.front +
    '</svg>';
  }

  window.UnicornArt = {
    COATS, MANES, HORNS, HOOVES, EYES, MARKINGS, SCENES, ACCESSORIES,
    defaultState, sanitize, render, mix, luminance
  };
})();
