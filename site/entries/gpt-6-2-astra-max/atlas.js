(() => {
  "use strict";

  const species = [
    {
      id: "moonveil",
      name: "Moonveil Unicorn",
      realm: "Celestial",
      habitat: "Lunevale Highlands",
      hours: "Moonrise to midnight",
      alt: "A silver unicorn with a lavender mane among wild irises in a mountain meadow.",
      description: "In daylight, the Moonveil is the color of river stone. After moonrise, each hair catches a little silver light, until the whole animal looks like a reflection that has wandered away from the water.",
      note: "Watch the far bank of a mountain tarn. A Moonveil always lowers its horn to the surface before it drinks, sending a single, perfectly round ripple across the water."
    },
    {
      id: "mosswhisper",
      name: "Mosswhisper Unicorn",
      realm: "Woodland",
      habitat: "Elderwood Forest",
      hours: "First light",
      alt: "A dun unicorn with leaves caught in its pale mane beside a green forest stream.",
      description: "Lichen-colored and soft-footed, the Mosswhisper follows the oldest streams in Elderwood. The little leaves in its mane come from the low branches it sleeps beneath.",
      note: "Listen for three quiet splashes. A Mosswhisper tests a stepping stone with one hoof, crosses with the next two, and clears the rest of the stream in a single leap."
    },
    {
      id: "embercrest",
      name: "Embercrest Unicorn",
      realm: "Elemental",
      habitat: "Cinderfall Valley",
      hours: "The hour before sunset",
      alt: "A copper-maned unicorn stands against the volcanic cliffs of a firelit valley.",
      description: "The Embercrest picks its way along old lava beds on broad, dark hooves. When the sun sinks behind the valley wall, its copper mane keeps the color of the light for a few moments longer.",
      note: "At dusk, scan the ridge for a bright thread moving against the wind. The last light usually finds the crest of its mane long before the rest of the animal comes into view."
    },
    {
      id: "auroracrest",
      name: "Auroracrest Unicorn",
      realm: "Celestial",
      habitat: "The Northern Tundra",
      hours: "Clear winter nights",
      alt: "A black unicorn outlined by turquoise northern lights above a snowy plain.",
      description: "A winter traveler with a coat as dark as a moonless sky, the Auroracrest crosses the open tundra in small, silent herds. Its pale horn is often the first thing visible above a snowbank.",
      note: "When the northern lights begin to ripple, the herd stops together and turns north. Even the youngest foal holds perfectly still until the color fades."
    },
    {
      id: "briarhorn",
      name: "Briarhorn Unicorn",
      realm: "Woodland",
      habitat: "Bramblewick Thicket",
      hours: "Late autumn afternoons",
      alt: "A chestnut roan unicorn peers through sunlit elderberries and autumn leaves.",
      description: "The smallest woodland unicorn slips through gaps that look scarcely wide enough for a fox. Its russet coat disappears among copper leaves, though its pale muzzle usually gives it away.",
      note: "Look for long strands of auburn hair snagged on the outermost thorns. Birds collect them for their nests, so a single strand may lead you up a tree instead of down the trail."
    },
    {
      id: "tideglass",
      name: "Tideglass Unicorn",
      realm: "Elemental",
      habitat: "The Glasswater Coast",
      hours: "The turning of the tide",
      alt: "A pearl-gray unicorn with a wet blue mane stands in front of breaking waves.",
      description: "The Tideglass walks the waterline with the measured pace of a shorebird. Its pearly horn shifts from green to blue as it turns, like the inside of a shell held up to the sky.",
      note: "A Tideglass comes ashore with the falling tide. Its tracks begin at the edge of the foam and end there again, leaving a long crescent of prints across the wet sand."
    }
  ];

  const tales = [
    {
      speciesId: "moonveil",
      title: "The lake that kept the moon",
      region: "A highland tale",
      cover: "moonveil-night",
      paragraphs: [
        "One winter night, the moon looked down and found its face missing from the lake. A little wind had wrinkled the water so thoroughly that there was nowhere left for a reflection to sit.",
        "A Moonveil came down from the ridge to drink. Seeing the moon search, it stood knee-deep in the shallows and laid its long mane on the water. Inside that silver circle, the ripples quieted. The moon found its face between the floating strands.",
        "Ever since, the people of Lunevale have left a round stone on the bank before the first frost. They say it gives the moon somewhere to rest its chin while it waits for its old friend."
      ]
    },
    {
      speciesId: "mosswhisper",
      title: "The path of quiet feet",
      region: "An Elderwood tale",
      cover: "mosswhisper",
      paragraphs: [
        "The baker’s daughter had crossed Elderwood a hundred times. On the hundred-and-first, a fallen oak covered the path and every turning looked the same. She sat on her empty basket and listened.",
        "From somewhere behind her came the smallest sound, like a page being turned. A pale unicorn was lifting one leaf at a time with the tip of its horn, uncovering a row of nearly hidden stepping stones.",
        "She crossed the stream and found the mill light waiting on the other side. Years later, when her own children lost their way, her advice was always the same. Sit down for a moment. Some paths are much easier to hear."
      ]
    },
    {
      speciesId: "embercrest",
      title: "The last ember",
      region: "A Cinderfall tale",
      cover: "embercrest",
      paragraphs: [
        "There was once a potter whose kiln went cold on the longest night of the year. She stood in her doorway holding a little clay cup, the last piece waiting to be fired.",
        "On the ridge above her workshop, an Embercrest shook the ash from its mane. One copper hair came drifting down. The potter caught it in her cup, where it glowed just warmly enough to wake a coal.",
        "By morning, the kiln was singing. The potter glazed the cup the color of a sunset and set it on the ridge. Travelers still leave a thimbleful of clean water there for any creature carrying the last light home."
      ]
    }
  ];

  const byId = new Map(species.map(entry => [entry.id, entry]));
  const talesBySpecies = new Map(tales.map(tale => [tale.speciesId, tale]));
  const realmIcons = { Celestial: "sparkles", Woodland: "leaf", Elemental: "flame" };
  const storageKey = "unicorn-atlas.journal.v1";
  const grid = document.querySelector("#species-grid");
  const reader = document.querySelector("#reader");
  const content = document.querySelector("#reader-content");
  const toast = document.querySelector("#toast");
  const nav = document.querySelector("#main-nav");
  const menuButton = document.querySelector(".menu-button");
  const filters = [...document.querySelectorAll("[data-filter]")];
  const navLinks = [...nav.querySelectorAll("a")];
  const sections = navLinks.map(link => document.querySelector(link.hash));
  const readerTrail = [];
  let lastDiscovery = "";
  let toastTimer;
  let saved = loadJournal();

  function icon(name, extraClass = "") {
    return `<svg class="icon ${extraClass}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  }

  function loadJournal() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return new Set(Array.isArray(stored) ? stored.filter(id => byId.has(id)) : []);
    } catch {
      return new Set();
    }
  }

  function speciesCard(entry, index) {
    return `<article class="species-card ${entry.realm.toLowerCase()}" data-realm="${entry.realm}">
      <div class="card-picture">
        <img src="assets/art/${entry.id}.webp" width="1050" height="700" alt="${entry.alt}" loading="${index < 3 ? "eager" : "lazy"}" decoding="async">
        <span class="realm-tag">${entry.realm}</span>
      </div>
      <button type="button" class="round-button save-card" data-save="${entry.id}">${icon("bookmark")}</button>
      <div class="card-copy">
        <div class="card-title-row">
          <h3><button type="button" class="card-link" data-species="${entry.id}">${entry.name}</button></h3>
          ${icon("arrow-up-right", "card-arrow")}
        </div>
        <p class="habitat">${icon("pin")}${entry.habitat}</p>
      </div>
    </article>`;
  }

  function taleCard(tale) {
    const entry = byId.get(tale.speciesId);
    return `<article class="tale-card ${entry.realm.toLowerCase()}">
      <span class="tale-emblem">${icon(realmIcons[entry.realm])}</span>
      <div><p class="tale-region">${tale.region}</p>
        <h3><button type="button" data-tale="${entry.id}">${tale.title}</button></h3>
      </div>
      ${icon("arrow-up-right", "tale-arrow")}
    </article>`;
  }

  function fieldNotes(entry) {
    const tale = talesBySpecies.get(entry.id);
    return `<div class="reader-cover"><img src="assets/art/${entry.id}.webp" alt="${entry.alt}"></div>
      <div class="reader-body">
        ${backButton()}
        <p class="eyebrow">${icon(realmIcons[entry.realm])} ${entry.realm} species</p>
        <h2 id="reader-title" tabindex="-1">${entry.name}</h2>
        <p class="reader-lead">${entry.description}</p>
        <dl class="field-facts">
          <div><dt>Habitat</dt><dd>${entry.habitat}</dd></div>
          <div><dt>Active hours</dt><dd>${entry.hours}</dd></div>
        </dl>
        <div class="field-note"><h3>Field note</h3><p>${entry.note}</p></div>
        <div class="reader-actions">
          <button type="button" class="button button-primary" data-save="${entry.id}">${icon("bookmark")}<span></span></button>
          ${tale ? `<button type="button" class="text-button" data-tale="${entry.id}">Read its tale ${icon("arrow-right")}</button>` : ""}
        </div>
      </div>`;
  }

  function story(tale) {
    const entry = byId.get(tale.speciesId);
    const alt = tale.cover === "moonveil-night" ? "The Moonveil beside a moonlit highland lake." : entry.alt;
    return `<div class="reader-cover"><img src="assets/art/${tale.cover}.webp" alt="${alt}"></div>
      <div class="reader-body">
        ${backButton()}
        <p class="eyebrow">${icon("book")} ${tale.region}</p>
        <h2 id="reader-title" tabindex="-1">${tale.title}</h2>
        <div class="story-text">${tale.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join("")}</div>
        <div class="reader-actions"><button type="button" class="button button-secondary" data-species="${entry.id}">Meet the ${entry.name.split(" ")[0]} ${icon("arrow-right")}</button></div>
      </div>`;
  }

  function journal() {
    const entries = [...saved].map(id => byId.get(id));
    const list = entries.map(entry => `<li class="journal-item">
      <button type="button" class="journal-entry" data-species="${entry.id}">
        <img src="assets/art/${entry.id}.webp" alt="" width="62" height="56">
        <span><strong>${entry.name}</strong><small>${entry.realm} · ${entry.habitat}</small></span>
      </button>
      <button type="button" class="round-button" data-save="${entry.id}">${icon("bookmark")}</button>
    </li>`).join("");
    return `<div class="reader-body journal-body">
      <p class="eyebrow section-eyebrow">Saved field notes</p>
      <h2 id="reader-title" tabindex="-1">My journal</h2>
      ${entries.length ? `<ul class="journal-list">${list}</ul>` : `
        <div class="journal-empty">
          ${icon("book")}<h3>Your journal is empty</h3>
          <p>Use the bookmark on a species card to keep its field notes here.</p>
          <button class="button button-primary" type="button" data-browse>Browse species ${icon("arrow-right")}</button>
        </div>`}
    </div>`;
  }

  function backButton() {
    const previous = readerTrail.at(-2);
    if (!previous) return "";
    const names = { journal: "My journal", species: "Field notes", tale: "Back to tale" };
    return `<button class="text-button reader-back" type="button" data-back>${icon("arrow-left")}${names[previous.kind]}</button>`;
  }

  function renderReader() {
    const view = readerTrail.at(-1);
    if (view.kind === "species") content.innerHTML = fieldNotes(byId.get(view.id));
    if (view.kind === "tale") content.innerHTML = story(talesBySpecies.get(view.id));
    if (view.kind === "journal") content.innerHTML = journal();
    content.scrollTop = 0;
    syncBookmarks();
  }

  function showReader(kind, id = "") {
    const existing = readerTrail.findIndex(view => view.kind === kind && view.id === id);
    if (existing >= 0) readerTrail.splice(existing + 1);
    else readerTrail.push({ kind, id });
    setMenu(false);
    renderReader();
    if (!reader.open) {
      reader.showModal();
      document.body.classList.add("reading");
    }
    content.querySelector("#reader-title").focus({ preventScroll: true });
  }

  function syncBookmarks() {
    document.querySelectorAll("[data-save]").forEach(button => {
      const entry = byId.get(button.dataset.save);
      const marked = saved.has(entry.id);
      const label = marked ? `Remove ${entry.name} from journal` : `Save ${entry.name} to journal`;
      button.setAttribute("aria-label", label);
      button.setAttribute("aria-pressed", String(marked));
      button.title = label;
      const caption = button.querySelector("span");
      if (caption) caption.textContent = marked ? "Saved to journal" : "Save to journal";
    });
    const counter = document.querySelector("#journal-count");
    counter.textContent = String(saved.size);
    counter.hidden = saved.size === 0;
    document.querySelector("[data-journal]").setAttribute("aria-label", `My journal, ${saved.size} saved species`);
  }

  function toggleBookmark(id) {
    const wasSaved = saved.has(id);
    if (wasSaved) saved.delete(id);
    else saved.add(id);
    let persisted = true;
    try {
      localStorage.setItem(storageKey, JSON.stringify([...saved]));
    } catch {
      persisted = false;
    }
    if (reader.open && readerTrail.at(-1).kind === "journal") {
      renderReader();
      content.querySelector("[data-save], [data-browse]")?.focus({ preventScroll: true });
    } else {
      syncBookmarks();
    }
    const name = byId.get(id).name;
    toast.textContent = wasSaved ? `${name} removed from journal` : `${name} saved${persisted ? " to journal" : " for this visit"}`;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
  }

  function filterSpecies(realm) {
    filters.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.filter === realm)));
    let count = 0;
    for (const card of grid.children) {
      card.hidden = realm !== "All" && card.dataset.realm !== realm;
      if (!card.hidden) count++;
    }
    document.querySelector("#filter-status").textContent = `${count} ${realm === "All" ? "" : realm + " "}species shown.`;
    updateNavigation();
  }

  function setMenu(open) {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    menuButton.querySelector("use").setAttribute("href", open ? "#i-x" : "#i-menu");
    nav.classList.toggle("open", open);
  }

  function updateNavigation() {
    const marker = document.querySelector(".site-header").offsetHeight + 75;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= marker) active = section;
    }
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      active = sections.at(-1);
    }
    navLinks.forEach(link => {
      if (link.hash === "#" + active.id) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  grid.innerHTML = species.map(speciesCard).join("");
  document.querySelector("#tale-grid").innerHTML = tales.map(taleCard).join("");
  syncBookmarks();
  filters.forEach(button => button.addEventListener("click", () => filterSpecies(button.dataset.filter)));
  document.querySelector("[data-journal]").addEventListener("click", () => showReader("journal"));
  document.querySelector("[data-surprise]").addEventListener("click", () => {
    const candidates = species.filter(entry => entry.id !== lastDiscovery);
    lastDiscovery = candidates[Math.floor(Math.random() * candidates.length)].id;
    showReader("species", lastDiscovery);
  });

  document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-save], [data-species], [data-tale]");
    if (trigger?.dataset.save) toggleBookmark(trigger.dataset.save);
    else if (trigger?.dataset.species) showReader("species", trigger.dataset.species);
    else if (trigger?.dataset.tale) showReader("tale", trigger.dataset.tale);
    if (!event.target.closest(".site-header")) setMenu(false);
  });

  document.querySelector(".reader-close").addEventListener("click", () => reader.close());
  reader.addEventListener("click", event => {
    if (event.target.closest("[data-back]")) {
      readerTrail.pop();
      renderReader();
      content.querySelector("#reader-title").focus({ preventScroll: true });
    } else if (event.target.closest("[data-browse]")) {
      reader.close();
      location.hash = "species";
      filters[0].focus({ preventScroll: true });
      document.querySelector("#species").scrollIntoView();
    } else if (event.target === reader) {
      const box = reader.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) {
        reader.close();
      }
    }
  });
  reader.addEventListener("close", () => {
    readerTrail.length = 0;
    document.body.classList.remove("reading");
    toast.classList.remove("visible");
  });
  window.addEventListener("storage", event => {
    if (event.key !== storageKey && event.key !== null) return;
    saved = loadJournal();
    if (reader.open && readerTrail.at(-1)?.kind === "journal") renderReader();
    else syncBookmarks();
  });
  menuButton.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  document.querySelector(".site-header").addEventListener("click", event => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      setMenu(false);
      menuButton.focus();
    }
  });
  matchMedia("(min-width: 621px)").addEventListener("change", () => setMenu(false));
  let scrollFrame = 0;
  window.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => { updateNavigation(); scrollFrame = 0; });
  }, { passive: true });
  window.addEventListener("resize", updateNavigation);
  updateNavigation();
})();
