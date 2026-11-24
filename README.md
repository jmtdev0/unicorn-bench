# Unicorn Bench

A catalog of unicorn websites built by different AI models, to compare how each one interprets the same open request and under what conditions (where it runs, quantization, hardware, reasoning effort, time and tokens).

Live site: https://unicorn-bench.pages.dev

## The rules

Every model gets exactly the same prompt and nothing else:

> Make a website dedicated to unicorns.

No system prompt, no requirements, no follow-ups: one request. The page is taken from the model's answer as it is. Each entry records the model, where it runs, the reasoning effort, the time taken and the tokens generated.

## Layout

```
site/                    ← everything that gets published
├── index.html           ← catalog: comparison table + cards
├── entry.html           ← one entry: conditions, metrics, process, notes (entry.html?id=<id>)
├── app.js, styles.css
├── base-prompt.txt      ← the prompt every model receives
├── data/entries.json    ← all entry data
└── entries/<id>/        ← the generated page (index.html) plus answer, reasoning and stats when available
```

## Adding an entry

1. Send the prompt in `site/base-prompt.txt` to the model in a single request.
2. Save the page as `site/entries/<id>/index.html` (and the full answer and reasoning if you have them).
3. Add an object to `entries` in `site/data/entries.json` (copy an existing one) with the conditions and metrics.
4. Preview locally: `python -m http.server 8766 --directory site`, then open http://localhost:8766.

## Publishing

Cloudflare Pages project `unicorn-bench`:

```
npx wrangler pages deploy site --project-name unicorn-bench --branch main
```

## License

MIT
