# CHANGELOG
### 24/11/2026
* Unicorn Bench created: a static catalog that compares unicorn web pages built by different AI models, with conditions, metrics, prompts and notes for each entry.
* First two entries: Inkling 2 Mini Q4_K_M running locally on an RTX 5070 (6 milestones, ~69 min of generation, reasoning effort "none") and Claude Opus 5.5 in Claude Code (one shot, 66 s, effort "medium").
* Published on Cloudflare Pages (project `unicorn-bench`): https://unicorn-bench.pages.dev
* **New rule: one open prompt for everyone** — “Make a website dedicated to unicorns.”, no system prompt, one request. Both entries redone with it: Claude Opus 5.5 (effort medium, 70 s, 337-line “field guide” with a unicorn sketch builder) and Inkling 2 Mini Q4_K_M on LM Studio's runtime 2.82.0 (effort medium, 133 s, 1,614 tokens at 12.2 tok/s, a calm 51-line page). The old milestone-based entries were removed; the entry page now also shows the model's reasoning.
* Public GitHub repository: https://github.com/jmtdev0/unicorn-bench
