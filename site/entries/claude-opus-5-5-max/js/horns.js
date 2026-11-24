/* =============================================================
   Unicornis: procedural horn illustrations
   Every horn on the site is generated from a small spec:
   length, width, curvature, colors, spiral grooves, rings, branches...
   Spiral horns are drawn left-handed (counterclockwise), like a
   narwhal tusk, which is what most "unicorn horns" really were.
   Exposes window.UnicornHorns.
   ============================================================= */
(function () {
  'use strict';

  let uid = 0;

  /* ---------- Vector helpers ---------- */
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, s) => [a[0] * s, a[1] * s];
  const len = (a) => Math.hypot(a[0], a[1]);
  const unit = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
  const r1 = (n) => Math.round(n * 10) / 10;
  const pt = (a) => r1(a[0]) + ' ' + r1(a[1]);

  /* ---------- Width profiles: t = 0 at the base, 1 at the tip ---------- */
  const PROFILES = {
    cone: (t) => Math.pow(1 - t, 0.92),
    slender: (t) => Math.pow(1 - t, 0.78),
    tusk: (t) => 0.4 + 0.6 * Math.pow(1 - t, 0.95) - (t > 0.9 ? (t - 0.9) * 3 : 0),
    rhino: (t) => Math.pow(1 - t, 1.3),
    stub: (t) => 0.25 + 0.75 * Math.pow(1 - t, 0.8)
  };

  /** Samples a quadratic axis from base to tip and offsets it by the width profile. */
  function buildAxis(base, tip, bend, width, profile, samples) {
    const N = samples || 48;
    const chord = sub(tip, base);
    const L = len(chord);
    const dir = unit(chord);
    const leftN = [dir[1], -dir[0]]; // left of the travel direction, on screen
    const ctrl = add(add(base, mul(chord, 0.5)), mul(leftN, bend * L));
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const mt = 1 - t;
      const p = [
        mt * mt * base[0] + 2 * mt * t * ctrl[0] + t * t * tip[0],
        mt * mt * base[1] + 2 * mt * t * ctrl[1] + t * t * tip[1]
      ];
      const d = unit([
        2 * mt * (ctrl[0] - base[0]) + 2 * t * (tip[0] - ctrl[0]),
        2 * mt * (ctrl[1] - base[1]) + 2 * t * (tip[1] - ctrl[1])
      ]);
      const n = [d[1], -d[0]];
      const w = Math.max(0.7, width * profile(t)) / 2;
      pts.push({ t, p, d, n, w, l: add(p, mul(n, w)), r: sub(p, mul(n, w)) });
    }
    return { pts, N, L, width };
  }

  /** Interpolated sample at any t. */
  function at(axis, t) {
    const x = Math.max(0, Math.min(1, t)) * axis.N;
    const i = Math.min(axis.N - 1, Math.floor(x));
    const k = x - i;
    const a = axis.pts[i];
    const b = axis.pts[i + 1];
    const lerp = (u, v) => [u[0] + (v[0] - u[0]) * k, u[1] + (v[1] - u[1]) * k];
    return { p: lerp(a.p, b.p), l: lerp(a.l, b.l), r: lerp(a.r, b.r), n: unit(lerp(a.n, b.n)), d: unit(lerp(a.d, b.d)), w: a.w + (b.w - a.w) * k };
  }

  function outlinePath(axis) {
    const P = axis.pts;
    const N = axis.N;
    let d = 'M' + pt(P[0].l);
    for (let i = 1; i <= N; i++) d += ' L' + pt(P[i].l);
    const last = P[N];
    d += ' Q' + pt(add(last.p, mul(last.d, Math.max(1.4, last.w * 1.7)))) + ' ' + pt(last.r);
    for (let i = N - 1; i >= 0; i--) d += ' L' + pt(P[i].r);
    const first = P[0];
    d += ' Q' + pt(sub(first.p, mul(first.d, first.w * 0.32))) + ' ' + pt(first.l) + ' Z';
    return d;
  }

  /** Spiral grooves: each crosses the visible face like the projection of a helix. */
  function spiralGrooves(axis, count, handed) {
    const out = [];
    const start = 0.05;
    const end = 0.9;
    const span = (end - start) / count;
    const dt = span * 0.92;
    for (let k = 0; k < count; k++) {
      const t0 = start + k * span;
      const a = at(axis, t0);
      const b = at(axis, t0 + dt);
      const from = handed === 'right' ? a.l : a.r;
      const to = handed === 'right' ? b.r : b.l;
      const h = dt * axis.L * 0.45;
      out.push('M' + pt(from) + ' C' + pt(add(from, mul(a.d, h))) + ' ' + pt(sub(to, mul(b.d, h))) + ' ' + pt(to));
    }
    return out;
  }

  function ringLines(axis, count, from, to) {
    const out = [];
    for (let k = 0; k < count; k++) {
      const t = from + (to - from) * (k + 0.5) / count;
      const a = at(axis, t);
      out.push('M' + pt(a.l) + ' Q' + pt(sub(a.p, mul(a.d, a.w * 0.55))) + ' ' + pt(a.r));
    }
    return out;
  }

  function shinePath(axis, from, to, offset) {
    let d = '';
    for (let i = 0; i <= 24; i++) {
      const t = from + (to - from) * (i / 24);
      const a = at(axis, t);
      const q = add(a.p, mul(a.n, a.w * offset));
      d += (i ? ' L' : 'M') + pt(q);
    }
    return d;
  }

  function gradientStops(colors, stops, hard) {
    const n = colors.length;
    if (hard) {
      let s = '';
      colors.forEach((c, i) => {
        const a = i / n;
        const b = (i + 1) / n;
        s += '<stop offset="' + a.toFixed(3) + '" stop-color="' + c + '"/><stop offset="' + b.toFixed(3) + '" stop-color="' + c + '"/>';
      });
      return s;
    }
    return colors.map((c, i) => {
      const o = stops ? stops[i] : (n === 1 ? 0 : i / (n - 1));
      return '<stop offset="' + o + '" stop-color="' + c + '"/>';
    }).join('');
  }

  /** Collect all outline points so a horn can be centered in its frame. */
  function bounds(axes) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    axes.forEach((axis) => axis.pts.forEach((s) => {
      [s.l, s.r].forEach((q) => {
        x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]);
        x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]);
      });
    }));
    return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };
  }

  /**
   * Builds the geometry for a horn (plus optional twin and branches)
   * from a base point toward an angle.
   */
  function geometry(spec, base) {
    const angle = (spec.angle === undefined ? -58 : spec.angle) * Math.PI / 180;
    const L = spec.length || 150;
    const tip = add(base, [Math.cos(angle) * L, Math.sin(angle) * L]);
    const profile = PROFILES[spec.profile] || PROFILES.cone;
    const main = buildAxis(base, tip, spec.bend || 0, spec.width || 30, profile);
    const extra = [];
    let twin = null;
    if (spec.pair) {
      const dir = unit(sub(tip, base));
      const back = [dir[1], -dir[0]];
      const shift = add(mul(back, spec.pair), mul(dir, spec.pair * 0.25));
      twin = buildAxis(add(base, shift), add(tip, add(shift, mul(dir, -L * 0.04))), (spec.bend || 0) * 1.08, (spec.width || 30) * 0.94, profile);
      extra.push(twin);
    }
    const branchAxes = [];
    if (spec.branches) {
      const count = spec.branches;
      for (let k = 0; k < count; k++) {
        const t = 0.16 + 0.7 * k / Math.max(1, count - 1);
        const a = at(main, t);
        const side = k % 2 === 0 ? 1 : -1;
        const edge = side > 0 ? a.l : a.r;
        const ang = 0.95;
        const bdir = unit(add(mul(a.d, Math.cos(ang)), mul(a.n, side * Math.sin(ang))));
        const blen = (spec.width || 30) * (1.0 - t * 0.5);
        const root = sub(edge, mul(a.n, side * a.w * 0.6));
        const btip = add(edge, mul(bdir, blen));
        const axis = buildAxis(root, btip, side * 0.12, Math.max(5, a.w * 0.95), PROFILES.stub, 16);
        axis.side = side;
        branchAxes.push(axis);
      }
    }
    return { main, twin, branchAxes, all: [main].concat(extra, branchAxes) };
  }

  /**
   * Returns { defs, body } markup for a horn at a base point.
   * Used both for standalone illustrations and inside the unicorn builder.
   */
  function hornMarkup(spec, base, idPrefix) {
    const p = idPrefix || ('horn' + (++uid) + '-');
    const g = geometry(spec, base);
    const main = g.main;
    const colors = spec.colors || ['#fffdf7', '#efe4cf', '#d9c7a6'];
    const baseP = main.pts[0].p;
    const tipP = main.pts[main.N].p;
    const mid = at(main, 0.45);

    let defs =
      '<linearGradient id="' + p + 'axis" gradientUnits="userSpaceOnUse" x1="' + r1(baseP[0]) + '" y1="' + r1(baseP[1]) + '" x2="' + r1(tipP[0]) + '" y2="' + r1(tipP[1]) + '">' +
        gradientStops(colors, spec.stops, spec.hard) +
      '</linearGradient>' +
      '<linearGradient id="' + p + 'shade" gradientUnits="userSpaceOnUse" x1="' + r1(mid.l[0]) + '" y1="' + r1(mid.l[1]) + '" x2="' + r1(mid.r[0]) + '" y2="' + r1(mid.r[1]) + '">' +
        '<stop offset="0" stop-color="#fff" stop-opacity="' + (spec.glossy === false ? 0.15 : 0.5) + '"/>' +
        '<stop offset=".38" stop-color="#fff" stop-opacity="0"/>' +
        '<stop offset=".62" stop-color="#000" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#1a0f3d" stop-opacity="' + (spec.dark ? 0.45 : 0.3) + '"/>' +
      '</linearGradient>' +
      '<clipPath id="' + p + 'clip"><path d="' + outlinePath(main) + '"/></clipPath>';

    let body = '';
    const outline = outlinePath(main);
    const edgeColor = spec.edge || 'rgba(40,24,80,.35)';
    const grooveColor = spec.groove || 'rgba(40,20,70,.32)';

    // Twin horn sits behind, a little darker.
    if (g.twin) {
      const twinPath = outlinePath(g.twin);
      body += '<g class="horn-twin"><path d="' + twinPath + '" fill="url(#' + p + 'axis)"/><path d="' + twinPath + '" fill="#160c30" opacity=".32"/>';
      if (spec.rings) {
        body += '<g fill="none" stroke="' + grooveColor + '" stroke-width="1.2" stroke-linecap="round">' +
          ringLines(g.twin, spec.rings, spec.ringFrom || 0.06, spec.ringTo || 0.62).map((d) => '<path d="' + d + '"/>').join('') + '</g>';
      }
      body += '</g>';
    }

    // Branches (the shadhavar's musical horn) sit behind the main shaft.
    g.branchAxes.forEach((axis) => {
      const bp = outlinePath(axis);
      const end = axis.pts[axis.N];
      body += '<path d="' + bp + '" fill="url(#' + p + 'axis)" stroke="' + edgeColor + '" stroke-width="1"/>' +
        '<ellipse cx="' + r1(end.p[0]) + '" cy="' + r1(end.p[1]) + '" rx="' + r1(Math.max(1.4, end.w * 0.85)) + '" ry="' + r1(Math.max(1, end.w * 0.55)) + '" fill="#3a2052" opacity=".55" transform="rotate(' + r1(Math.atan2(end.d[1], end.d[0]) * 180 / Math.PI + 90) + ' ' + r1(end.p[0]) + ' ' + r1(end.p[1]) + ')"/>';
    });

    if (spec.dashed) {
      body += '<path d="' + outline + '" fill="url(#' + p + 'axis)" opacity=".42"/>' +
        '<path d="' + outline + '" fill="none" stroke="' + (spec.dashColor || '#5b4632') + '" stroke-width="2" stroke-dasharray="6 5" stroke-linecap="round"/>';
    } else {
      body += '<path d="' + outline + '" fill="url(#' + p + 'axis)"/>';
      body += '<g clip-path="url(#' + p + 'clip)">';
      body += '<path d="' + outline + '" fill="url(#' + p + 'shade)"/>';
      if (spec.spiral) {
        const grooves = spiralGrooves(main, spec.spiral, spec.handed || 'left');
        const gw = Math.max(1.1, (spec.width || 30) * 0.07);
        body += '<g fill="none" stroke-linecap="round">' +
          grooves.map((d) => '<path d="' + d + '" stroke="' + grooveColor + '" stroke-width="' + r1(gw) + '"/>').join('') +
          grooves.map((d) => '<path d="' + d + '" stroke="#fff" stroke-opacity=".45" stroke-width="' + r1(gw * 0.55) + '" transform="translate(' + r1(main.pts[0].d[0] * gw * 1.1) + ' ' + r1(main.pts[0].d[1] * gw * 1.1) + ')"/>').join('') +
          '</g>';
      }
      if (spec.rings) {
        body += '<g fill="none" stroke="' + grooveColor + '" stroke-width="' + r1(Math.max(1, (spec.width || 30) * 0.06)) + '" stroke-linecap="round">' +
          ringLines(main, spec.rings, spec.ringFrom || 0.06, spec.ringTo || 0.62).map((d) => '<path d="' + d + '"/>').join('') + '</g>';
      }
      if (spec.facets) {
        // Crystal horn: long facet lines plus a bright core.
        body += '<g fill="none" stroke="#fff" stroke-linecap="round">' +
          '<path d="' + shinePath(main, 0, 0.98, 0.1) + '" stroke-opacity=".7" stroke-width="1.2"/>' +
          '<path d="' + shinePath(main, 0, 0.95, -0.45) + '" stroke-opacity=".45" stroke-width="1"/>' +
          '<path d="' + shinePath(main, 0, 0.9, 0.62) + '" stroke-opacity=".5" stroke-width="1"/>' +
          '</g>';
      }
      if (spec.shine !== false) {
        body += '<path d="' + shinePath(main, 0.06, 0.8, 0.5) + '" fill="none" stroke="#fff" stroke-opacity="' + (spec.dark ? 0.35 : 0.55) + '" stroke-width="' + r1(Math.max(1.2, (spec.width || 30) * 0.075)) + '" stroke-linecap="round"/>';
      }
      body += '</g>';
      body += '<path d="' + outline + '" fill="none" stroke="' + edgeColor + '" stroke-width="' + (spec.edgeWidth || 1.2) + '" stroke-linejoin="round"/>';
    }

    return { defs, body, geometry: g, bounds: bounds(g.all), tip: tipP, base: baseP };
  }

  /* ---------- Decorative sparkle ---------- */
  function sparkle(cx, cy, r, color, cls, delay) {
    const k = r * 0.22;
    const d = 'M' + cx + ' ' + (cy - r) +
      ' C' + (cx + k) + ' ' + (cy - k) + ' ' + (cx + k) + ' ' + (cy - k) + ' ' + (cx + r) + ' ' + cy +
      ' C' + (cx + k) + ' ' + (cy + k) + ' ' + (cx + k) + ' ' + (cy + k) + ' ' + cx + ' ' + (cy + r) +
      ' C' + (cx - k) + ' ' + (cy + k) + ' ' + (cx - k) + ' ' + (cy + k) + ' ' + (cx - r) + ' ' + cy +
      ' C' + (cx - k) + ' ' + (cy - k) + ' ' + (cx - k) + ' ' + (cy - k) + ' ' + cx + ' ' + (cy - r) + ' Z';
    return '<path' + (cls ? ' class="' + cls + '"' : '') + ' d="' + d + '" fill="' + (color || '#fff') + '"' + (delay !== undefined ? ' style="--tw:' + delay + 's"' : '') + '/>';
  }

  /**
   * A horn inside a round medallion (bestiary cards, dialogs, quiz).
   * opts.label: accessible label; opts.className: extra class.
   */
  function medallionSVG(spec, opts) {
    const o = opts || {};
    const p = 'm' + (++uid) + '-';
    const horn = hornMarkup(spec, [0, 0], p);
    const b = horn.bounds;
    // Fit the horn into a 150px square in the middle of a 240 frame.
    const scale = Math.min(1, 150 / Math.max(b.w, b.h));
    const tx = 120 - b.cx * scale;
    const ty = 122 - b.cy * scale;
    const bg = spec.bg || ['#f4efff', '#cbbcf7'];
    const sparkColor = spec.sparkColor || '#ffffff';
    const label = o.label ? ' role="img" aria-label="' + o.label.replace(/"/g, '&quot;') + '"' : ' aria-hidden="true" focusable="false"';

    return '<svg class="medal' + (o.className ? ' ' + o.className : '') + '" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg"' + label + '>' +
      '<defs>' +
        '<radialGradient id="' + p + 'bg" cx="42%" cy="34%" r="75%"><stop offset="0" stop-color="' + bg[0] + '"/><stop offset="1" stop-color="' + bg[1] + '"/></radialGradient>' +
        horn.defs +
      '</defs>' +
      '<circle cx="120" cy="120" r="116" fill="url(#' + p + 'bg)"/>' +
      '<circle cx="120" cy="120" r="104" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.4" stroke-dasharray="1.5 6" stroke-linecap="round"/>' +
      '<ellipse cx="120" cy="206" rx="54" ry="7" fill="#1d1642" opacity=".08"/>' +
      sparkle(58, 66, 7, sparkColor, 'u-sparkle', 0) +
      sparkle(40, 126, 4, sparkColor, 'u-sparkle', 0.8) +
      sparkle(184, 178, 6, sparkColor, 'u-sparkle', 1.6) +
      sparkle(200, 118, 3.5, sparkColor, 'u-sparkle', 2.2) +
      '<g transform="translate(' + r1(tx) + ' ' + r1(ty) + ') scale(' + scale.toFixed(3) + ')">' + horn.body + '</g>' +
    '</svg>';
  }

  /** A bare horn, centered in a tall frame (hero decorations). */
  function bareSVG(spec, opts) {
    const o = opts || {};
    const p = 'b' + (++uid) + '-';
    const horn = hornMarkup(Object.assign({}, spec, { angle: -90 + (spec.tilt || 0) }), [0, 0], p);
    const b = horn.bounds;
    const pad = 6;
    const vb = [r1(b.x0 - pad), r1(b.y0 - pad), r1(b.w + pad * 2), r1(b.h + pad * 2)].join(' ');
    const label = o.label ? ' role="img" aria-label="' + o.label.replace(/"/g, '&quot;') + '"' : ' aria-hidden="true" focusable="false"';
    return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg"' + label + '><defs>' + horn.defs + '</defs>' + horn.body + '</svg>';
  }

  window.UnicornHorns = { hornMarkup, medallionSVG, bareSVG, sparkle };
})();
