/* =============================================================
   Unicornis: the Bestiary
   Filterable creature cards, the field-notes dialog, a synthesized
   shadhavar horn, and the "Which unicorn are you?" quiz.
   ============================================================= */
(function () {
  'use strict';

  const U = window.Unicornis;
  const H = window.UnicornHorns;
  const BEASTS = window.BEASTS || [];
  const REGIONS = window.BEAST_REGIONS || [];
  const QUIZ = window.BEAST_QUIZ || [];
  const esc = U.escapeHTML;
  const byId = (id) => BEASTS.find((b) => b.id === id);
  const regionLabel = (id) => (REGIONS.find((r) => r.id === id) || { label: id }).label;
  const stripTags = (html) => String(html).replace(/<[^>]+>/g, '');

  /* ---------- Hero: a row of floating horns ---------- */
  const row = document.querySelector('[data-horn-row]');
  if (row) {
    const picks = ['ctesias', 'maiden', 'qilin', 'narwhal', 'xiezhi', 'shadhavar', 'monoceros'];
    row.innerHTML = picks.map((id, i) => {
      const b = byId(id);
      const svg = H.bareSVG(Object.assign({}, b.spec, { tilt: [-8, -4, 0, 2, 5, 8, 12][i] }));
      const h = Math.round(70 + (b.spec.length / 204) * 150);
      return svg.replace('<svg ', '<svg style="height:' + h + 'px;width:auto" ');
    }).join('');
  }

  /* ---------- Filters and cards ---------- */
  const grid = document.querySelector('[data-beast-grid]');
  const results = document.querySelector('[data-results]');
  const search = document.querySelector('[data-search]');
  const kindGroup = document.querySelector('[data-kind-group]');
  const regionGroup = document.querySelector('[data-region-group]');
  const state = { kind: 'all', region: 'all', q: '' };
  let visible = BEASTS.slice();

  document.querySelectorAll('[data-count-kind]').forEach((el) => {
    const k = el.dataset.countKind;
    el.textContent = String(k === 'all' ? BEASTS.length : BEASTS.filter((b) => b.kind === k).length);
  });

  if (regionGroup) {
    const chips = [{ id: 'all', label: 'Everywhere' }].concat(REGIONS).map((r) => {
      const n = r.id === 'all' ? BEASTS.length : BEASTS.filter((b) => b.region === r.id).length;
      return '<button class="chip" type="button" aria-pressed="' + (r.id === 'all') + '" data-region="' + r.id + '">' + esc(r.label) + ' <span class="count">' + n + '</span></button>';
    }).join('');
    regionGroup.insertAdjacentHTML('beforeend', chips);
  }

  function matches(b) {
    if (state.kind !== 'all' && b.kind !== state.kind) return false;
    if (state.region !== 'all' && b.region !== state.region) return false;
    if (state.q) {
      const hay = [b.name, b.aka, b.place, b.first, b.tagline, b.summary, b.horn, regionLabel(b.region)].join(' ').toLowerCase();
      return state.q.split(/\s+/).every((word) => hay.includes(word));
    }
    return true;
  }

  function cardMarkup(b, i) {
    const label = b.kind === 'real' ? 'Real animal' : 'Legend';
    return '<article class="card card--hover beast-card" id="beast-' + b.id + '" style="--i:' + (i * 0.04).toFixed(2) + 's;--tint-a:' + b.spec.bg[0] + '">' +
      '<div class="beast-medal">' +
        '<span class="badge badge--' + b.kind + '">' + label + '</span>' +
        H.medallionSVG(b.spec, { label: 'Horn of ' + stripTags(b.name) + ': ' + stripTags(b.horn) }) +
      '</div>' +
      '<div class="beast-body">' +
        '<p class="beast-meta">' + esc(b.place) + '</p>' +
        '<h3>' + esc(b.name) + '</h3>' +
        '<p class="beast-tag">' + esc(b.tagline) + '</p>' +
        '<p class="beast-summary">' + esc(b.summary) + '</p>' +
        '<div class="beast-actions"><button class="btn btn--soft btn--small" type="button" data-open="' + b.id + '" aria-haspopup="dialog">Read the field notes</button></div>' +
      '</div>' +
    '</article>';
  }

  function render() {
    visible = BEASTS.filter(matches);
    if (!grid) return;
    if (!visible.length) {
      grid.innerHTML = '<div class="beast-empty"><p><strong>No unicorns here.</strong> They are elusive, after all.</p><button class="btn btn--soft btn--small" type="button" data-reset>Show the whole herd</button></div>';
    } else {
      grid.innerHTML = visible.map(cardMarkup).join('');
    }
    if (results) {
      const total = BEASTS.length;
      results.textContent = visible.length === total
        ? 'Showing all ' + total + ' creatures'
        : 'Showing ' + visible.length + ' of ' + total + ' creatures';
    }
  }

  function setPressed(group, attr, value) {
    if (!group) return;
    group.querySelectorAll('[' + attr + ']').forEach((btn) => btn.setAttribute('aria-pressed', String(btn.getAttribute(attr) === value)));
  }

  if (kindGroup) {
    kindGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-kind]');
      if (!btn) return;
      state.kind = btn.dataset.kind;
      setPressed(kindGroup, 'data-kind', state.kind);
      render();
    });
  }
  if (regionGroup) {
    regionGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-region]');
      if (!btn) return;
      state.region = btn.dataset.region;
      setPressed(regionGroup, 'data-region', state.region);
      render();
    });
  }
  if (search) {
    let t = 0;
    search.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        state.q = search.value.trim().toLowerCase();
        render();
      }, 120);
    });
  }
  if (grid) {
    grid.addEventListener('click', (e) => {
      if (e.target.closest('[data-reset]')) {
        state.kind = 'all';
        state.region = 'all';
        state.q = '';
        if (search) search.value = '';
        setPressed(kindGroup, 'data-kind', 'all');
        setPressed(regionGroup, 'data-region', 'all');
        render();
        return;
      }
      const opener = e.target.closest('[data-open]');
      const card = e.target.closest('.beast-card');
      if (opener) openNotes(opener.dataset.open, opener);
      else if (card && !e.target.closest('a, button')) openNotes(card.id.replace('beast-', ''), card.querySelector('[data-open]'));
    });
  }

  render();

  /* ---------- Field-notes dialog ---------- */
  const dialog = document.querySelector('[data-notes]');
  const content = document.querySelector('[data-notes-content]');
  let current = null;
  let returnFocus = null;

  const meter = (label, value) => {
    let pips = '';
    for (let i = 1; i <= 5; i++) pips += '<span class="pip' + (i <= value ? ' on' : '') + '"></span>';
    return '<div class="meter"><dt>' + label + '</dt><dd role="img" aria-label="' + value + ' out of 5">' + pips + '</dd></div>';
  };

  // Browse within the current filter when possible, otherwise the whole herd.
  const browseList = (b) => (visible.some((x) => x.id === b.id) ? visible : BEASTS);

  function notesMarkup(b) {
    const list = browseList(b);
    const idx = list.findIndex((x) => x.id === b.id);
    const prev = list[(idx - 1 + list.length) % list.length];
    const next = list[(idx + 1) % list.length];
    const label = b.kind === 'real' ? 'Real animal' : 'Legend';
    return '<div class="notes-grid">' +
      '<div class="notes-art" style="--tint-a:' + b.spec.bg[0] + ';--tint-b:' + b.spec.bg[1] + '"><div class="notes-art-inner">' +
        H.medallionSVG(b.spec, { label: 'Horn of ' + stripTags(b.name) + ': ' + stripTags(b.horn) }) +
        '<span class="badge badge--' + b.kind + '">' + label + '</span>' +
        (b.audio ? '<button class="btn btn--small" type="button" data-play-horn><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>Play the horn</button>' : '') +
      '</div></div>' +
      '<div class="notes-body">' +
        '<p class="beast-meta">' + esc(b.place) + '</p>' +
        '<h2 id="notes-title">' + esc(b.name) + '</h2>' +
        '<p class="aka">' + esc(b.aka) + '</p>' +
        b.details.map((p) => '<p>' + p + '</p>').join('') +
        '<dl class="notes-facts">' +
          '<dt>First recorded</dt><dd>' + esc(b.first) + '</dd>' +
          '<dt>Horn</dt><dd>' + esc(b.horn) + '</dd>' +
          '<dt>Region</dt><dd>' + esc(regionLabel(b.region)) + '</dd>' +
        '</dl>' +
        '<dl class="meters">' +
          meter('Horn', b.stats.horn) + meter('Ferocity', b.stats.ferocity) + meter('Elusiveness', b.stats.elusiveness) + meter('Sparkle', b.stats.sparkle) +
        '</dl>' +
        '<p class="notes-fun"><strong>Field note</strong>' + b.fact + '</p>' +
        (list.length > 1
          ? '<div class="notes-nav">' +
              '<button class="btn btn--soft btn--small" type="button" data-goto="' + prev.id + '"><span aria-hidden="true">←</span> ' + esc(prev.name) + '</button>' +
              '<button class="btn btn--soft btn--small" type="button" data-goto="' + next.id + '">' + esc(next.name) + ' <span aria-hidden="true">→</span></button>' +
            '</div>'
          : '') +
      '</div>' +
    '</div>';
  }

  function openNotes(id, opener) {
    const b = byId(id);
    if (!b || !dialog || !content) return;
    current = b;
    content.innerHTML = notesMarkup(b);
    if (!dialog.open) {
      returnFocus = opener || document.activeElement;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    dialog.scrollTop = 0;
    const title = dialog.querySelector('#notes-title');
    if (title) {
      title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: true });
    }
    if (history.replaceState) history.replaceState(null, '', '#beast-' + b.id);
  }

  function closeNotes() {
    if (!dialog || !dialog.open) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  if (dialog) {
    dialog.addEventListener('close', () => {
      stopHorn();
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
      // Return focus to whatever opened the dialog, or to the matching card if that is gone.
      const fallback = current && document.querySelector('#beast-' + current.id + ' [data-open]');
      const back = returnFocus && returnFocus.isConnected ? returnFocus : fallback;
      if (back && typeof back.focus === 'function') back.focus({ preventScroll: true });
      current = null;
    });
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) { closeNotes(); return; } // backdrop click
      if (e.target.closest('[data-close]')) { closeNotes(); return; }
      const go = e.target.closest('[data-goto]');
      if (go) { openNotes(go.dataset.goto); return; }
      if (e.target.closest('[data-play-horn]')) playHorn(e.target.closest('[data-play-horn]'));
    });
    dialog.addEventListener('keydown', (e) => {
      if (!current || e.target.closest('input, textarea')) return;
      const list = browseList(current);
      const idx = list.findIndex((x) => x.id === current.id);
      if (e.key === 'ArrowRight') openNotes(list[(idx + 1) % list.length].id);
      if (e.key === 'ArrowLeft') openNotes(list[(idx - 1 + list.length) % list.length].id);
    });
  }

  /* ---------- The shadhavar's horn, synthesized ---------- */
  let audio = null;
  function stopHorn() {
    if (audio) {
      try { audio.close(); } catch (err) { /* already closed */ }
      audio = null;
    }
  }
  function playHorn(btn) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { U.toast('Your browser cannot play the horn, sadly.'); return; }
    stopHorn();
    const ctx = new AC();
    audio = ctx;
    const now = ctx.currentTime + 0.05;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.32, now + 0.8);
    master.gain.setValueAtTime(0.32, now + 4.2);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 6);
    master.connect(ctx.destination);

    // Wind through the branches: band-passed noise.
    const len = Math.floor(ctx.sampleRate * 6);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.setValueAtTime(600, now);
    band.frequency.linearRampToValueAtTime(1400, now + 3);
    band.frequency.linearRampToValueAtTime(700, now + 6);
    band.Q.value = 0.9;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.08;
    noise.connect(band).connect(windGain).connect(master);
    noise.start(now);
    noise.stop(now + 6);

    // Breathy flute notes on a pentatonic scale, as the wind finds different branches.
    const notes = [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 659.25, 523.25];
    notes.forEach((freq, i) => {
      const t0 = now + 0.25 + i * 0.52 + Math.random() * 0.12;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const vib = ctx.createOscillator();
      vib.frequency.value = 4.5 + Math.random() * 1.5;
      const vibDepth = ctx.createGain();
      vibDepth.gain.value = freq * 0.006;
      vib.connect(vibDepth).connect(osc.frequency);
      const overtone = ctx.createOscillator();
      overtone.type = 'sine';
      overtone.frequency.value = freq * 2;
      const otGain = ctx.createGain();
      otGain.gain.value = 0.25;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.11, t0 + 0.45);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.3);
      osc.connect(g);
      overtone.connect(otGain).connect(g);
      g.connect(master);
      [osc, overtone, vib].forEach((node) => { node.start(t0); node.stop(t0 + 2.4); });
    });

    if (btn) {
      btn.disabled = true;
      const label = btn.lastChild;
      const original = label.textContent;
      label.textContent = 'Playing…';
      setTimeout(() => { btn.disabled = false; label.textContent = original; }, 6000);
    }
    setTimeout(() => { if (audio === ctx) stopHorn(); }, 6400);
  }

  /* ---------- Deep links: bestiary.html#beast-narwhal ---------- */
  const fromHash = () => {
    const m = /^#beast-([a-z-]+)$/.exec(location.hash);
    if (m && byId(m[1])) {
      const card = document.getElementById('beast-' + m[1]);
      if (card) card.scrollIntoView({ block: 'center' });
      openNotes(m[1], card && card.querySelector('[data-open]'));
    }
  };
  fromHash();
  window.addEventListener('hashchange', fromHash);

  /* ---------- Quiz: which unicorn are you? ---------- */
  const quiz = document.querySelector('[data-quiz]');
  const letters = ['A', 'B', 'C', 'D'];
  let step = 0;
  let scores = {};
  let lastScored = {};

  function progress() {
    return '<div class="quiz-progress" aria-hidden="true">' + QUIZ.map((_, i) => '<span' + (i < step ? ' class="done"' : '') + '></span>').join('') + '</div>';
  }

  function renderQuestion(focus) {
    const item = QUIZ[step];
    quiz.innerHTML = '<div class="quiz-panel">' + progress() +
      '<p class="quiz-step">Question ' + (step + 1) + ' of ' + QUIZ.length + '</p>' +
      '<h3 class="quiz-q" tabindex="-1">' + esc(item.q) + '</h3>' +
      '<div class="quiz-options">' +
        item.a.map((a, i) => '<button class="quiz-option" type="button" data-answer="' + i + '"><span class="letter" aria-hidden="true">' + letters[i] + '</span><span>' + esc(a.t) + '</span></button>').join('') +
      '</div></div>';
    if (focus) quiz.querySelector('.quiz-q').focus({ preventScroll: true });
  }

  function renderResult() {
    const ranked = BEASTS.map((b) => ({ b, s: scores[b.id] || 0, last: lastScored[b.id] || -1 }))
      .sort((x, y) => (y.s - x.s) || (y.last - x.last));
    const winner = ranked[0].b;
    const runnerUp = ranked[1].b;
    step = QUIZ.length;
    quiz.innerHTML = '<div class="quiz-panel">' + progress() +
      '<div class="quiz-result">' +
        H.medallionSVG(winner.spec, { label: 'Horn of ' + stripTags(winner.name) }) +
        '<div>' +
          '<p class="quiz-step">You are…</p>' +
          '<h3 tabindex="-1">' + esc(winner.name) + '</h3>' +
          '<p>' + esc(winner.tagline) + '. ' + esc(winner.summary) + '</p>' +
          '<p style="color: var(--moon-3); font-size: .95rem">Runner-up: ' + esc(runnerUp.name) + '.</p>' +
          '<div class="cta-row">' +
            '<button class="btn btn--primary" type="button" data-open-result="' + winner.id + '" data-sparkle>Read your field notes</button>' +
            '<button class="btn btn--ghost" type="button" data-restart style="color: var(--moon-1)">Take it again</button>' +
          '</div>' +
        '</div>' +
      '</div></div>';
    quiz.querySelector('h3').focus({ preventScroll: true });
    const r = quiz.getBoundingClientRect();
    U.sparkleBurst(r.left + r.width / 2, r.top + 80, 22);
  }

  if (quiz && QUIZ.length) {
    renderQuestion(false);
    quiz.addEventListener('click', (e) => {
      const ans = e.target.closest('[data-answer]');
      if (ans) {
        const choice = QUIZ[step].a[Number(ans.dataset.answer)];
        Object.entries(choice.w).forEach(([id, w]) => {
          scores[id] = (scores[id] || 0) + w;
          lastScored[id] = step;
        });
        step += 1;
        if (step < QUIZ.length) renderQuestion(true); else renderResult();
        return;
      }
      if (e.target.closest('[data-restart]')) {
        step = 0;
        scores = {};
        lastScored = {};
        renderQuestion(true);
        return;
      }
      const res = e.target.closest('[data-open-result]');
      if (res) openNotes(res.dataset.openResult, res);
    });
  }
})();
