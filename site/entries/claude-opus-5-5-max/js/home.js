/* =============================================================
   Unicornis: home page
   Constellation hero, fireflies, counters, explore-card art and
   the crystal orb of facts.
   ============================================================= */
(function () {
  'use strict';

  const U = window.Unicornis;

  /* ---------- Hero constellation + gentle parallax ---------- */
  const art = document.querySelector('[data-hero-art]');
  if (art) {
    art.insertAdjacentHTML('beforeend', U.constellationSVG({
      animate: true,
      idPrefix: 'hero-',
      label: 'A prancing unicorn drawn as a constellation of stars'
    }));

    const hero = art.closest('.hero');
    const moon = hero && hero.querySelector('.hero-moon');
    if (hero && !U.reducedMotion() && window.matchMedia('(pointer: fine)').matches) {
      let raf = 0;
      let px = 0;
      let py = 0;
      art.style.transition = 'transform .8s cubic-bezier(.22,1,.36,1)';
      if (moon) moon.style.transition = 'transform 1s cubic-bezier(.22,1,.36,1)';
      hero.addEventListener('pointermove', (event) => {
        const r = hero.getBoundingClientRect();
        px = (event.clientX - r.left) / r.width - 0.5;
        py = (event.clientY - r.top) / r.height - 0.5;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          art.style.transform = 'translate(' + (px * -16).toFixed(1) + 'px,' + (py * -12).toFixed(1) + 'px)';
          if (moon) moon.style.transform = 'translate(' + (px * 12).toFixed(1) + 'px,' + (py * 9).toFixed(1) + 'px)';
        });
      });
      hero.addEventListener('pointerleave', () => {
        art.style.transform = '';
        if (moon) moon.style.transform = '';
      });
    }
  }

  /* ---------- Fireflies over the hills ---------- */
  const flies = document.querySelector('[data-fireflies]');
  if (flies && !U.reducedMotion()) {
    const rand = U.seededRandom(42);
    for (let i = 0; i < 18; i++) {
      const fly = document.createElement('span');
      fly.className = 'firefly';
      fly.style.left = (rand() * 100).toFixed(1) + '%';
      fly.style.top = (20 + rand() * 70).toFixed(1) + '%';
      fly.style.setProperty('--fx', ((rand() - 0.5) * 80).toFixed(0) + 'px');
      fly.style.setProperty('--fy', (-20 - rand() * 50).toFixed(0) + 'px');
      fly.style.animationDelay = (rand() * 9).toFixed(2) + 's';
      fly.style.animationDuration = (7 + rand() * 6).toFixed(2) + 's';
      flies.appendChild(fly);
    }
  }

  /* ---------- Counting stats ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const formatCount = (el, value) => {
    el.textContent = (el.dataset.prefix || '') + Math.round(value).toLocaleString('en-US') + (el.dataset.suffix || '');
  };
  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    if (U.reducedMotion() || target === 0) { formatCount(el, target); return; }
    const start = performance.now();
    const duration = 1400 + Math.min(800, target / 4);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      formatCount(el, target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    formatCount(el, 0);
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => io.observe(el));
  }

  /* ---------- Explore card art ---------- */
  const hornsArt = document.querySelector('[data-explore-horns]');
  if (hornsArt && window.UnicornHorns && window.BEASTS) {
    const picks = ['maiden', 'karkadann', 'narwhal', 'shadhavar', 'ctesias'];
    const longest = 204;
    const row = picks.map((id) => {
      const beast = window.BEASTS.find((b) => b.id === id);
      const svg = window.UnicornHorns.bareSVG(beast.spec);
      const height = Math.round((beast.spec.length / longest) * 100);
      return svg.replace('<svg ', '<svg style="height:' + height + '%" ');
    }).join('');
    hornsArt.innerHTML = '<div class="art-horns">' + row + '</div>';
  }

  const unicornArt = document.querySelector('[data-explore-unicorn]');
  if (unicornArt && window.UnicornArt) {
    unicornArt.innerHTML = window.UnicornArt.render({
      name: 'Clover Moondancer', coat: '#fdfaff', mane: 'pastel', horn: 'gold', hornLength: 60,
      eyes: 'bright', marking: 'stars', crown: true, scene: 'dawn', sparkle: 3
    }, { scene: false });
  }

  /* ---------- The crystal orb of facts ---------- */
  const FACTS = [
    { t: 'The word "unicorn" comes from the Latin <i>unicornis</i>: <i>unus</i>, "one", plus <i>cornu</i>, "horn".', href: '#intro', more: 'Word origins' },
    { t: "Scotland's national animal is the unicorn.", href: 'legends.html#e-1603', more: 'Legends: the lion and the unicorn' },
    { t: 'Since 1603 the royal coat of arms has paired an English lion with a Scottish unicorn.', href: 'legends.html#e-1603', more: 'Legends: the lion and the unicorn' },
    { t: 'A one-horned animal is the most common motif on the seals of the Indus Valley Civilization, carved more than 4,000 years ago.', href: 'legends.html#e-indus', more: 'Legends: the seal-carvers' },
    { t: 'The Greek physician Ctesias described a unicorn around 400 BCE. Its horn was white, black and crimson.', href: 'bestiary.html#beast-ctesias', more: 'Bestiary: the Indian wild ass' },
    { t: 'Pliny the Elder said the monoceros could never be taken alive.', href: 'bestiary.html#beast-monoceros', more: 'Bestiary: the monoceros' },
    { t: "The King James Bible mentions unicorns nine times, translating the Hebrew <i>re'em</i>, probably the aurochs.", href: 'bestiary.html#beast-reem', more: "Bestiary: the re'em" },
    { t: 'Narwhal tusks are teeth: an elongated canine that spirals counterclockwise.', href: 'bestiary.html#beast-narwhal', more: 'Bestiary: the narwhal' },
    { t: 'Renaissance "unicorn horn" could be worth more than its weight in gold.', href: 'legends.html#hoax', more: 'Legends: the great horn hoax' },
    { t: 'In 1638 the Danish scholar Ole Worm showed that "unicorn horns" came from narwhals.', href: 'legends.html#e-1638', more: 'Legends: the hoax unravels' },
    { t: "Denmark's 17th-century Throne Chair, used to anoint its kings, is made largely of narwhal tusk.", href: 'legends.html#e-throne', more: 'Legends: a throne of tusks' },
    { t: 'Elasmotherium, the "Siberian unicorn", survived until at least 39,000 years ago.', href: 'bestiary.html#beast-elasmotherium', more: 'Bestiary: Elasmotherium' },
    { t: 'The Indian rhinoceros is officially named <i>Rhinoceros unicornis</i>.', href: 'bestiary.html#beast-rhino', more: 'Bestiary: the Indian rhinoceros' },
    { t: 'Marco Polo met rhinoceroses on Sumatra, called them unicorns and found them ugly.', href: 'legends.html#e-polo', more: "Legends: Marco Polo's review" },
    { t: 'Monoceros, the Unicorn constellation, lies largely inside the Winter Triangle of Betelgeuse, Sirius and Procyon.', href: 'sky.html#find', more: 'Night sky: how to find it' },
    { t: 'The Rosette Nebula, the Cone Nebula and the Christmas Tree Cluster all lie in the constellation of the Unicorn.', href: 'sky.html#treasures', more: 'Night sky: treasures of Monoceros' },
    { t: 'The seven Unicorn Tapestries at The Met Cloisters in New York were woven around 1495–1505.', href: 'legends.html#e-tapestries', more: 'Legends: the tapestries' },
    { t: '<cite>The Lady and the Unicorn</cite> tapestries in Paris show the five senses, plus a mysterious sixth: "À mon seul désir".', href: 'legends.html#e-lady', more: 'Legends: the Lady and the Unicorn' },
    { t: 'In 1414 a giraffe arrived at the Ming court and was celebrated as a qilin.', href: 'bestiary.html#beast-qilin', more: 'Bestiary: the qilin' },
    { t: '<i>Kirin</i> is the Japanese word for both the mythical qilin and the giraffe.', href: 'bestiary.html#beast-qilin', more: 'Bestiary: the qilin' },
    { t: 'The Chinese xiezhi could tell the guilty from the innocent, and butted the guilty with its horn.', href: 'bestiary.html#beast-xiezhi', more: 'Bestiary: the xiezhi' },
    { t: 'The shadhavar\'s hollow horn had 42 branches and played music in the wind.', href: 'bestiary.html#beast-shadhavar', more: 'Bestiary: the shadhavar' },
    { t: 'The Arabian oryx was the first animal to go from "Extinct in the Wild" back to "Vulnerable".', href: 'bestiary.html#beast-oryx', more: 'Bestiary: the Arabian oryx' },
    { t: '"Alicorn" originally meant the horn of a unicorn; using it for a winged unicorn is modern.', href: '#faq', more: 'FAQ: unicorn, pegasus or alicorn?' },
    { t: 'In <cite>Through the Looking-Glass</cite> (1871), the Unicorn tells Alice: "if you\'ll believe in me, I\'ll believe in you."', href: 'legends.html#e-carroll', more: 'Legends: a bargain with Alice' },
    { t: 'Aileen Lee coined "unicorn" for billion-dollar startups in 2013.', href: 'legends.html#e-2013', more: 'Legends: a new kind of unicorn' },
    { t: 'The unicorn emoji was approved in 2015, as part of Unicode 8.0.', href: 'legends.html#e-2015', more: 'Legends: unicode unicorns' }
  ];

  const orb = document.querySelector('[data-oracle-btn]');
  const factEl = document.querySelector('[data-oracle-fact]');
  const countEl = document.querySelector('[data-oracle-count]');
  const moreEl = document.querySelector('[data-oracle-more]');
  if (orb && factEl) {
    if (countEl) countEl.textContent = FACTS.length + ' true facts inside';
    let deck = [];
    let shown = 0;
    const shuffle = () => {
      deck = FACTS.map((_, i) => i);
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    };
    orb.addEventListener('click', () => {
      if (!deck.length) shuffle();
      const fact = FACTS[deck.pop()];
      shown += 1;
      orb.classList.remove('is-spinning');
      void orb.offsetWidth; // restart the animation
      orb.classList.add('is-spinning');
      factEl.classList.add('is-changing');
      setTimeout(() => {
        factEl.innerHTML = fact.t;
        if (countEl) countEl.textContent = 'Fact ' + (((shown - 1) % FACTS.length) + 1) + ' of ' + FACTS.length;
        if (moreEl) moreEl.innerHTML = 'Learn more: <a href="' + fact.href + '">' + fact.more + '</a>';
        factEl.classList.remove('is-changing');
      }, U.reducedMotion() ? 0 : 320);
      const label = orb.querySelector('.orb-label');
      if (label) label.textContent = 'Another!';
    });
  }
})();
