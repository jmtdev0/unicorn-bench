// Unicorn Bench: renders the catalog (index.html) and entry pages (entry.html) from data/entries.json.

const DATA_URL = "data/entries.json";

// ---------- Formatting helpers ----------

function formatSeconds(seconds) {
  if (seconds == null) return "—";
  if (seconds < 90) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes < 60) return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

const formatNumber = (n) => (n == null ? "—" : n.toLocaleString("en-US"));
const formatSpeed = (n) => (n == null ? "—" : `${n} tok/s`);

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child != null) node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

function factList(target, pairs) {
  target.replaceChildren(...pairs.flatMap(([term, value, note]) => [
    el("dt", {}, term),
    el("dd", {}, value, note ? el("span", { class: "note" }, note) : null),
  ]));
}

async function loadData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Could not load ${DATA_URL} (${response.status})`);
  return response.json();
}

// ---------- Catalog page ----------

function renderCatalog(data) {
  document.getElementById("task-summary").textContent = data.task.summary;
  document.getElementById("base-prompt").href = data.task.basePrompt;

  const rows = data.entries.map((entry) => el("tr", {},
    el("th", { scope: "row" }, el("a", { href: `entry.html?id=${entry.id}` }, entry.title)),
    el("td", {}, entry.conditions["Where it runs"]),
    el("td", {}, entry.conditions["Reasoning effort"].split(" (")[0]),
    el("td", {}, entry.metrics.requests),
    el("td", {}, formatSeconds(entry.metrics.totalSeconds)),
    el("td", {}, entry.metrics.generatedTokens == null ? "≈ (see entry)" : formatNumber(entry.metrics.generatedTokens)),
    el("td", {}, formatSpeed(entry.metrics.tokensPerSecond)),
    el("td", {}, entry.metrics.lines),
  ));
  document.querySelector("#compare-table tbody").replaceChildren(...rows);

  const cards = data.entries.map((entry) => el("article", { class: "card" },
    el("div", { class: "card__preview" },
      el("iframe", { src: entry.page, title: `${entry.title} unicorn page preview`, loading: "lazy", tabindex: "-1", "aria-hidden": "true" })),
    el("div", { class: "card__body" },
      el("p", { class: "eyebrow" }, `${entry.maker} · ${entry.date}`),
      el("h3", {}, entry.title),
      el("p", { class: "muted" }, entry.conditions.Strategy),
      el("ul", { class: "chips" },
        el("li", {}, entry.conditions["Where it runs"]),
        el("li", {}, `Effort: ${entry.conditions["Reasoning effort"].split(" (")[0]}`),
        el("li", {}, formatSeconds(entry.metrics.totalSeconds))),
      el("p", { class: "actions" },
        el("a", { class: "button", href: entry.page, target: "_blank", rel: "noopener" }, "Open page ↗"),
        el("a", { class: "button button--ghost", href: `entry.html?id=${entry.id}` }, "Conditions & process"))),
  ));
  document.getElementById("catalog").replaceChildren(...cards);
}

// ---------- Entry page ----------

async function fetchText(url) {
  const response = await fetch(url);
  return response.ok ? response.text() : `(Could not load ${url})`;
}

function renderEntry(data) {
  const id = new URLSearchParams(location.search).get("id");
  const entry = data.entries.find((e) => e.id === id);
  if (!entry) {
    document.getElementById("entry-title").textContent = "Entry not found";
    return;
  }
  document.title = `${entry.title} · Unicorn Bench`;
  document.getElementById("entry-title").textContent = entry.title;
  document.getElementById("entry-maker").textContent = `${entry.maker} · run on ${entry.date}`;
  document.getElementById("entry-actions").replaceChildren(
    el("a", { class: "button", href: entry.page, target: "_blank", rel: "noopener" }, "Open page ↗"),
    ...entry.variants.map((v) => el("a", { class: "button button--ghost", href: v.page, target: "_blank", rel: "noopener" }, `${v.label} ↗`)));

  factList(document.getElementById("entry-conditions"), Object.entries(entry.conditions));
  const m = entry.metrics;
  factList(document.getElementById("entry-metrics"), [
    ["Requests", m.requests],
    ["Total time", formatSeconds(m.totalSeconds)],
    ["Generated tokens", formatNumber(m.generatedTokens), m.generatedTokensNote],
    ["Average speed", formatSpeed(m.tokensPerSecond)],
    ["Page length", `${m.lines} lines`],
    ["Failed attempts", m.failedAttempts, m.failedAttemptsNote],
  ]);

  const rows = entry.steps.map((step, i) => el("tr", {},
    el("th", { scope: "row" }, el("a", { href: `#step-${i}` }, step.name)),
    el("td", {}, formatSeconds(step.seconds)),
    el("td", {}, formatNumber(step.tokens)),
    el("td", {}, formatSpeed(step.tokensPerSecond)),
    el("td", {}, step.finish === "length" ? "token limit" : "finished"),
  ));
  document.querySelector("#steps-table tbody").replaceChildren(...rows);

  const details = entry.steps.map((step, i) => {
    const box = el("details", { class: "step", id: `step-${i}` },
      el("summary", {}, step.name),
      step.note ? el("p", { class: "note" }, step.note) : null);
    box.addEventListener("toggle", async () => {
      if (!box.open || box.dataset.loaded) return;
      box.dataset.loaded = "1";
      const blocks = [["Prompt", step.prompt], ["Reasoning", step.reasoning], ["Answer", step.answer]].filter(([, url]) => url);
      for (const [label, url] of blocks) {
        box.append(el("h4", {}, label), el("pre", {}, await fetchText(url)));
      }
    });
    return box;
  });
  document.getElementById("steps-detail").replaceChildren(...details);
  document.getElementById("entry-notes").replaceChildren(...entry.notes.map((n) => el("li", {}, n)));
}

// ---------- Boot ----------

loadData()
  .then((data) => (document.getElementById("catalog") ? renderCatalog(data) : renderEntry(data)))
  .catch((error) => {
    const main = document.querySelector("main");
    main.prepend(el("p", { class: "error" }, `Something went wrong: ${error.message}`));
  });
