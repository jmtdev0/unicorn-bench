/* =============================================================
   Unicornis: the Atelier (unicorn builder)
   Builds the controls from UnicornArt's option lists, keeps the
   design in localStorage, shares it via the URL hash, exports PNG,
   and manages a small stable of saved unicorns.
   ============================================================= */
(function () {
  'use strict';

  const U = window.Unicornis;
  const A = window.UnicornArt;
  const H = window.UnicornHorns;
  const esc = U.escapeHTML;
  const STORE_KEY = 'unicornis-atelier-v1';
  const STABLE_KEY = 'unicornis-stable-v1';
  const STABLE_MAX = 24;

  const stage = document.querySelector('[data-stage]');
  const form = document.querySelector('[data-controls]');
  if (!stage || !form || !A) return;

  const nameInput = document.querySelector('[data-name]');
  const nameDisplay = document.querySelector('[data-name-display]');
  const summaryEl = document.querySelector('[data-summary]');
  const profileEl = document.querySelector('[data-profile]');
  const stableEl = document.querySelector('[data-stable]');
  const labelOf = (list, id) => (list.find((x) => x.id === id) || list[0]).label;

  /* ---------- Names and personalities ---------- */
  const NAME_A = ['Moon', 'Star', 'Glimmer', 'Velvet', 'Thistle', 'Clover', 'Comet', 'Dawn', 'Frost', 'Honey', 'Opal', 'Pebble', 'Saffron', 'Willow',
    'Zephyr', 'Nimbus', 'Pippin', 'Juniper', 'Marzipan', 'Bramble', 'Lumen', 'Sorrel', 'Tansy', 'Biscuit', 'Aurora', 'Cinder', 'Nova', 'Maple', 'Fennel', 'Hazel'];
  const NAME_B = ['beam', 'hoof', 'mane', 'whisper', 'dancer', 'drift', 'sparkle', 'heart', 'shine', 'dust', 'bloom', 'song', 'glow', 'flake', 'wish',
    'gleam', 'trot', 'tail', 'light', 'feather', 'mist', 'berry'];
  const TITLES = ['Sir', 'Lady', 'Captain', 'Professor', 'Duchess', 'Baron', 'Little', 'Old', 'Madame', 'Doctor'];
  const EPITHETS = ['the Unbothered', 'of the Misty Glen', 'the Thrice-Blessed', 'the Surprisingly Punctual', 'of the Western Meadows', 'the Wanderer',
    'the Gentle', 'Keeper of Lost Socks', 'the Magnificent', 'of the Silver Brook', 'the Moderately Brave', 'Who Naps in Clover', 'the Starlit', 'Friend of Bees'];

  const TEMPERAMENTS = ['Gentle and curious', 'Bold, bordering on dramatic', 'Shy until snacks appear', 'Wise beyond its years', 'Mischievous but well-meaning',
    'Calm as a moonlit lake', 'Fiercely loyal', 'Dreamy and easily distracted', 'Cheerful in all weathers', 'Quietly heroic', 'Polite to a fault', 'Endlessly optimistic'];
  const SNACKS = ['clover honey', 'moonlit dandelions', 'sugar-dusted apples', 'wild strawberries', 'starlight, lightly toasted', 'rainbow sherbet', 'fresh morning dew',
    'oat biscuits', 'violet petals', 'pear slices', 'marzipan carrots', 'cloudberries'];
  const TALENTS = ['purifies streams with a touch of its horn', 'finds lost things', 'hums in perfect harmony', 'predicts the weather (mostly)', 'never gets lost in the woods',
    'makes flowers bloom in its hoofprints', 'dances in the rain', 'hears a whisper a mile away', 'tames dragons with good manners', 'glows softly in the dark',
    'knows every star by name', 'tells excellent bedtime stories'];

  const pick = (list, rand) => list[Math.floor(rand() * list.length)];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function randomName(rand) {
    const r = rand || Math.random;
    const word = () => cap(pick(NAME_A, r) + pick(NAME_B, r));
    let name = word();
    if (r() < 0.45) name += ' ' + word();
    const roll = r();
    if (roll < 0.22) name = pick(TITLES, r) + ' ' + name;
    else if (roll < 0.55 && name.length < 22) name += ' ' + pick(EPITHETS, r);
    return name.slice(0, 48);
  }

  function personality(s) {
    const h = U.hashString(s.name.toLowerCase().trim());
    return {
      temperament: TEMPERAMENTS[h % TEMPERAMENTS.length],
      snack: SNACKS[(h >>> 7) % SNACKS.length],
      talent: TALENTS[(h >>> 14) % TALENTS.length]
    };
  }

  /* ---------- State: URL hash > saved design > default ---------- */
  function readHash() {
    if (location.hash.length < 3) return null;
    const p = new URLSearchParams(location.hash.slice(1));
    if (!p.has('mane')) return null;
    return {
      name: p.get('name'), coat: '#' + (p.get('coat') || ''), mane: p.get('mane'), horn: p.get('horn'), hornLength: p.get('len'),
      hooves: p.get('hooves'), eyes: p.get('eyes'), marking: p.get('mark'), wings: p.get('wings') === '1', crown: p.get('crown') === '1',
      collar: p.get('collar') === '1', bow: p.get('bow') === '1', scene: p.get('scene'), sparkle: p.get('sparkle')
    };
  }

  function shareURL(s) {
    const p = new URLSearchParams({
      name: s.name, coat: s.coat.slice(1), mane: s.mane, horn: s.horn, len: String(s.hornLength), hooves: s.hooves, eyes: s.eyes,
      mark: s.marking, wings: s.wings ? '1' : '0', crown: s.crown ? '1' : '0', collar: s.collar ? '1' : '0', bow: s.bow ? '1' : '0',
      scene: s.scene, sparkle: String(s.sparkle)
    });
    return location.href.split('#')[0] + '#' + p.toString();
  }

  const fromLink = readHash();
  let state = A.sanitize(fromLink || U.storage.get(STORE_KEY, null) || A.defaultState());
  if (fromLink) {
    history.replaceState(null, '', location.pathname + location.search);
    setTimeout(() => U.toast('Meet ' + state.name + ', shared with you.'), 400);
  }

  /* ---------- Build the controls ---------- */
  const host = (key) => form.querySelector('[data-options="' + key + '"]');

  host('coat').innerHTML = A.COATS.map((c) =>
    '<label class="swatch" title="' + c.label + '"><input type="radio" name="coat" value="' + c.color + '"><span class="dot" style="--c:' + c.color + '"></span><span class="visually-hidden">' + c.label + '</span></label>'
  ).join('') +
    '<label class="swatch swatch--custom" title="Pick any color"><input type="color" name="coatCustom" aria-label="Custom coat color"><span class="dot" aria-hidden="true"></span></label>';

  host('mane').innerHTML = A.MANES.map((m) =>
    '<label class="tile"><input type="radio" name="mane" value="' + m.id + '"><span class="face"><span class="preview" style="--g:linear-gradient(90deg,' + m.colors.join(',') + ')"></span>' + m.label + '</span></label>'
  ).join('');

  host('hooves').innerHTML = A.HOOVES.map((h) =>
    '<label class="pill"><input type="radio" name="hooves" value="' + h.id + '"><span><span class="pill-dot" style="background:' + h.color + '"></span>' + h.label + '</span></label>'
  ).join('');

  const rainbow = A.MANES[0].colors;
  host('horn').innerHTML = A.HORNS.map((h) => {
    const spec = Object.assign({ width: 30, length: 120, profile: 'cone' }, h.spec);
    if (h.fromMane) spec.colors = rainbow.slice(0, 5);
    const svg = H.bareSVG(Object.assign({}, spec, { tilt: 18 })).replace('<svg ', '<svg class="preview-svg" ');
    return '<label class="tile"><input type="radio" name="horn" value="' + h.id + '"><span class="face">' + svg + h.label + '</span></label>';
  }).join('');

  host('eyes').innerHTML = A.EYES.map((e) => '<label class="pill"><input type="radio" name="eyes" value="' + e.id + '"><span>' + e.label + '</span></label>').join('');
  host('marking').innerHTML = A.MARKINGS.map((m) => '<label class="pill"><input type="radio" name="marking" value="' + m.id + '"><span>' + m.label + '</span></label>').join('');
  host('scene').innerHTML = A.SCENES.map((s) =>
    '<label class="tile"><input type="radio" name="scene" value="' + s.id + '"><span class="face"><span class="preview" style="--g:' + s.preview + ';height:46px"></span>' + s.label + '</span></label>'
  ).join('');

  /* ---------- Sync controls <-> state ---------- */
  function syncControls() {
    const s = state;
    ['mane', 'horn', 'hooves', 'eyes', 'marking', 'scene'].forEach((key) => {
      form.querySelectorAll('input[name="' + key + '"]').forEach((input) => { input.checked = input.value === s[key]; });
    });
    let presetCoat = false;
    form.querySelectorAll('input[name="coat"]').forEach((input) => {
      input.checked = input.value.toLowerCase() === s.coat.toLowerCase();
      presetCoat = presetCoat || input.checked;
    });
    const custom = form.querySelector('input[name="coatCustom"]');
    custom.value = s.coat;
    const customSwatch = custom.closest('.swatch');
    customSwatch.classList.toggle('is-active', !presetCoat);
    customSwatch.querySelector('.dot').style.background = presetCoat ? '' : s.coat;
    form.querySelector('[name="hornLength"]').value = s.hornLength;
    form.querySelector('[name="sparkle"]').value = s.sparkle;
    ['wings', 'crown', 'collar', 'bow'].forEach((k) => { form.querySelector('[name="' + k + '"]').checked = !!s[k]; });
    if (document.activeElement !== nameInput) nameInput.value = s.name;
    updateValues();
  }

  function updateValues() {
    const s = A.sanitize(state);
    const coat = A.COATS.find((c) => c.color.toLowerCase() === s.coat.toLowerCase());
    const set = (key, text) => form.querySelectorAll('[data-value="' + key + '"]').forEach((el) => { el.textContent = text; });
    set('coat', coat ? coat.label : 'Custom');
    set('mane', labelOf(A.MANES, s.mane));
    set('horn', labelOf(A.HORNS, s.horn));
    set('hornLength', s.hornLength + ' cm');
    set('sparkle', ['None', 'A hint', 'Some', 'Plenty', 'Lots', 'Maximum'][s.sparkle]);
  }

  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (!t.name) return;
    if (t.name === 'coatCustom') state.coat = t.value;
    else if (t.type === 'checkbox') state[t.name] = t.checked;
    else if (t.type === 'range') state[t.name] = Number(t.value);
    else if (t.type === 'radio' && t.checked) state[t.name] = t.value;
    if (t.name === 'coat' || t.name === 'coatCustom') syncControls(); else updateValues();
    render();
  });

  nameInput.addEventListener('input', () => {
    state.name = nameInput.value;
    render();
  });
  nameInput.addEventListener('blur', () => {
    if (!nameInput.value.trim()) {
      state.name = randomName();
      nameInput.value = state.name;
      render();
    }
  });
  document.querySelector('[data-shuffle-name]').addEventListener('click', () => {
    state.name = randomName();
    nameInput.value = state.name;
    render();
  });

  /* ---------- Tabs ---------- */
  const tablist = document.querySelector('[data-tabs]');
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tablist.addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) selectTab(tab, false);
  });
  tablist.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const next = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 }[e.key];
    if (next !== undefined) {
      e.preventDefault();
      selectTab(tabs[next], true);
    }
  });

  /* ---------- Rendering ---------- */
  function describe(s) {
    const parts = [
      labelOf(A.MANES, s.mane).toLowerCase() + ' mane',
      s.hornLength + ' cm ' + labelOf(A.HORNS, s.horn).toLowerCase() + ' horn',
      labelOf(A.EYES, s.eyes).toLowerCase() + ' eyes'
    ];
    if (s.marking !== 'none') parts.push(labelOf(A.MARKINGS, s.marking).toLowerCase() + ' markings');
    if (s.wings) parts.push('wings');
    if (s.crown) parts.push('a flower crown');
    if (s.collar) parts.push('a golden collar');
    if (s.bow) parts.push('a bow on its tail');
    return s.name + ': a unicorn with a ' + parts.join(', ') + ', in a ' + labelOf(A.SCENES, s.scene).toLowerCase() + ' scene.';
  }

  function renderProfile(s) {
    const p = personality(s);
    const horn = labelOf(A.HORNS, s.horn).toLowerCase();
    profileEl.innerHTML =
      '<dt>Temperament</dt><dd>' + esc(p.temperament) + '</dd>' +
      '<dt>Favorite snack</dt><dd>' + esc(cap(p.snack)) + '</dd>' +
      '<dt>Special talent</dt><dd>' + esc(cap(p.talent)) + '</dd>' +
      '<dt>Horn</dt><dd>' + s.hornLength + ' cm of ' + horn + (s.horn === 'crystal' ? '' : ', counterclockwise') + '</dd>' +
      '<dt>Wings</dt><dd>' + (s.wings ? 'Yes, an alicorn in the modern sense' : 'None, and proud of it') + '</dd>';
  }

  let frame = 0;
  function render() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const s = A.sanitize(state);
      stage.innerHTML = A.render(s, { animated: true });
      stage.setAttribute('aria-label', describe(s));
      nameDisplay.textContent = s.name;
      summaryEl.textContent = s.hornLength + ' cm ' + labelOf(A.HORNS, s.horn).toLowerCase() + ' horn · ' + labelOf(A.MANES, s.mane).toLowerCase() + ' mane · ' + labelOf(A.SCENES, s.scene).toLowerCase();
      renderProfile(s);
      U.storage.set(STORE_KEY, s);
    });
  }

  /* ---------- Surprise me ---------- */
  function randomState() {
    const r = Math.random;
    const coat = r() < 0.85 ? pick(A.COATS, r).color : A.mix('#ffffff', ['#ff9ccf', '#8fd2ff', '#93efc9', '#ffe49c', '#c3a5ff'][Math.floor(r() * 5)], 0.25 + r() * 0.3);
    return A.sanitize({
      name: randomName(r),
      coat,
      mane: pick(A.MANES, r).id,
      horn: pick(A.HORNS, r).id,
      hornLength: 28 + Math.round(r() * 60),
      hooves: pick(A.HOOVES, r).id,
      eyes: pick(A.EYES, r).id,
      marking: pick(A.MARKINGS, r).id,
      wings: r() < 0.3,
      crown: r() < 0.45,
      collar: r() < 0.25,
      bow: r() < 0.25,
      scene: pick(A.SCENES, r).id,
      sparkle: 1 + Math.floor(r() * 5)
    });
  }

  document.querySelector('[data-random]').addEventListener('click', () => {
    state = randomState();
    syncControls();
    render();
  });

  /* ---------- Share link ---------- */
  document.querySelector('[data-share]').addEventListener('click', async () => {
    const s = A.sanitize(state);
    const url = shareURL(s);
    try {
      await navigator.clipboard.writeText(url);
      U.toast('Link copied. Anyone who opens it will meet ' + s.name + '.');
    } catch (err) {
      history.replaceState(null, '', url);
      U.toast('Copy the address from your address bar to share ' + s.name + '.');
    }
  });

  /* ---------- Download as PNG (falls back to SVG) ---------- */
  function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    U.toast('Saved ' + filename);
  }

  function captionMarkup(name) {
    const width = Math.min(560, 64 + name.length * 10.5);
    return '<g><rect x="' + (300 - width / 2).toFixed(1) + '" y="452" width="' + width.toFixed(1) + '" height="36" rx="18" fill="#ffffff" fill-opacity=".88"/>' +
      '<text x="300" y="476.5" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="18" font-weight="700" fill="#2b2155">' + esc(name) + '</text></g>';
  }

  document.querySelector('[data-download]').addEventListener('click', () => {
    const s = A.sanitize(state);
    const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unicorn';
    const svg = A.render(s, { animated: false })
      .replace('<svg ', '<svg width="1200" height="1000" ')
      .replace(/<\/svg>$/, captionMarkup(s.name) + '</svg>');
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 1000;
        canvas.getContext('2d').drawImage(img, 0, 0, 1200, 1000);
        canvas.toBlob((png) => {
          URL.revokeObjectURL(url);
          if (png) saveBlob(png, slug + '.png'); else saveBlob(svgBlob, slug + '.svg');
        }, 'image/png');
      } catch (err) {
        URL.revokeObjectURL(url);
        saveBlob(svgBlob, slug + '.svg');
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      saveBlob(svgBlob, slug + '.svg');
    };
    img.src = url;
  });

  /* ---------- The stable ---------- */
  let stable = U.storage.get(STABLE_KEY, []);
  if (!Array.isArray(stable)) stable = [];

  function renderStable() {
    if (!stable.length) {
      stableEl.innerHTML = '<div class="stable-empty" style="grid-column: 1 / -1"><p class="mb-0"><strong>Your stable is empty.</strong> Design a unicorn above and press "Save to stable" to keep it here.</p></div>';
      return;
    }
    stableEl.innerHTML = stable.map((entry, i) => {
      const s = A.sanitize(entry);
      return '<article class="card stable-item">' +
        '<div class="thumb">' + A.render(s, { label: s.name }) + '</div>' +
        '<div class="info"><strong>' + esc(s.name) + '</strong>' +
          '<div class="row">' +
            '<button class="btn btn--soft btn--small" type="button" data-load="' + i + '">Load</button>' +
            '<button class="btn btn--soft btn--small" type="button" data-release="' + i + '" aria-label="Set ' + esc(s.name) + ' free">Set free</button>' +
          '</div></div>' +
      '</article>';
    }).join('');
  }

  document.querySelector('[data-save]').addEventListener('click', (e) => {
    const s = A.sanitize(state);
    stable.unshift(s);
    let note = '';
    if (stable.length > STABLE_MAX) {
      stable = stable.slice(0, STABLE_MAX);
      note = ' (the oldest one wandered off to make room)';
    }
    const saved = U.storage.set(STABLE_KEY, stable);
    renderStable();
    U.toast(saved ? s.name + ' is now in your stable' + note + '.' : s.name + ' is in your stable for this visit (your browser is not keeping data).');
    const r = e.currentTarget.getBoundingClientRect();
    U.sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 12);
  });

  stableEl.addEventListener('click', (e) => {
    const load = e.target.closest('[data-load]');
    const release = e.target.closest('[data-release]');
    if (load) {
      state = A.sanitize(stable[Number(load.dataset.load)]);
      syncControls();
      render();
      stage.scrollIntoView({ behavior: U.reducedMotion() ? 'auto' : 'smooth', block: 'center' });
      U.toast(state.name + ' is back in the studio.');
    } else if (release) {
      const [gone] = stable.splice(Number(release.dataset.release), 1);
      U.storage.set(STABLE_KEY, stable);
      renderStable();
      U.toast(A.sanitize(gone).name + ' trots happily into the sunset.');
    }
  });

  // A shared link pasted into this same tab only changes the hash: load it too.
  window.addEventListener('hashchange', () => {
    const linked = readHash();
    if (!linked) return;
    state = A.sanitize(linked);
    history.replaceState(null, '', location.pathname + location.search);
    syncControls();
    render();
    U.toast('Meet ' + state.name + ', shared with you.');
  });

  /* ---------- Go ---------- */
  syncControls();
  render();
  renderStable();
})();
