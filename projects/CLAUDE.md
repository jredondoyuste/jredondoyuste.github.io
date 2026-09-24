# Rules for Claude and any subagent touching this website

This repo is Jaime's personal website. Agents may change **exactly one project page and nothing else**.

- **Only edit files under `projects/<slug>/` for the project you are working on.** For measuring_qnms, that is `projects/measuring-qnms/`. Nothing less, nothing more.
- **Never touch anything outside `projects/`.** That covers `index.html`, `style.css`, `js/`, `files/`, `vault.html`, `001/` and so on, even when a fix there looks trivial.
- `projects/index.html` may only be edited to add or update the single `<li>` for a new project. `projects/assets/` (the shared renderer and CSS) and this file are off limits unless Jaime explicitly asks.
- Never commit other people's work-in-progress. Stage with explicit paths (`git add projects/<slug>`), never `git add -A` or `git commit -a`.
- Pushing to `origin master` is allowed whenever the project page has a meaningful update.

A `pre-commit` hook in `.git/hooks/` enforces the first two rules for commits made from Claude Code (`CLAUDECODE=1`). Do not bypass it with `--no-verify`.

## Page conventions

- Sections are markdown files (`overview.md`, `results.md`, `derivations.md`, `log.md`, `references.md`), listed in the page's `data-sections`. Math is `$…$` / `$$…$$` (KaTeX). Figures use raw `<figure><img><figcaption>` HTML, with images in `figs/` as PNG.
- `log.md` is append-only, newest first, with dated `###` entries. It is the priority record: never rewrite past entries; add corrections as new entries.
- The password gate is soft (a SHA-256 hash in `index.html`). Everything here is public in the repo by design.
