# Rules for Claude and any subagent touching this website

This repo is Jaime's personal website. Agents may change **exactly one project page and nothing else**.

- **Only edit files under `projects/<slug>/` for the project you are working on.** For measuring_qnms, that is `projects/measuring-qnms/`. Nothing less, nothing more.
- **Never touch anything outside `projects/`.** That covers `index.html`, `style.css`, `js/`, `files/`, `vault.html`, `001/` and so on, even when a fix there looks trivial.
- `projects/index.html` may only be edited to add or update the single `<li>` for a new project. `projects/assets/` (the shared renderer and CSS) and this file are off limits unless Jaime explicitly asks.
- Never commit other people's work-in-progress. Stage with explicit paths (`git add projects/<slug>`), never `git add -A` or `git commit -a`.
- Pushing to `origin master` is allowed whenever the project page has a meaningful update.

A `pre-commit` hook in `.git/hooks/` enforces the first two rules for commits made from Claude Code (`CLAUDECODE=1`). Do not bypass it with `--no-verify`.

## Page format

Write plain markdown; the shared renderer (`assets/project.js`) does all layout. Headings are
the structure: each item shows its heading and a short part on the left, and its detail opens
on the right-hand stage (inline on phones). Never write layout HTML, inline styles or progress
bars. Math is `$…$` / `$$…$$` (KaTeX).

A page is `projects/<slug>/index.html` (the shell: copy an existing one, change title, slug,
hash, `data-sections`) plus these files, in this order of `data-sections`:

| file | written by | format |
|---|---|---|
| `overview.md` | **the owner only** | One or two short paragraphs: the project's question, a little more than the open-science `PROJECT.md` description. If missing, ask the owner; you may offer a draft for them to rewrite. |
| `status.md` | agent | First a paragraph `**<State> (<YYYY-MM-DD>).** <2–3 sentences>`; the beads above it come from the card. Then the groups `## Tasks`, `## Simmering`, `## Dead ends`, `## Choices and conventions`. Inside each, one `### <id> — <title> · <status>` per item (open-science task id, e.g. `t07`), then one line, then its subtasks as `- **S1** <what> · <status>` with a line of description each. |
| `results.md` | agent | No preamble. One `### F<n> — <question the figure answers>` per result, newest first; then the `<figure>` with a **one-sentence** `<figcaption>`; then the detail (full caption, `**Takeaway.**`, `**Reproduce.**`), which opens on the stage. |
| `derivations.md` | agent | One `## §<n>. <title>` per derivation; the first paragraph is its short description; the rest (equations, `###` subsections) opens on the stage. |
| `log.md` | agent | **Closed projects only.** Append-only, newest first, `### <YYYY-MM-DD> — <gist>` entries; entries of one day are grouped and drawn on a timeline. Never rewrite past entries; correct with a new entry. |
| `references.bib` | copied | `citations/used.bib` of the open-science project, verbatim (its `usage` field is shown). Optional `consulted.md`, copied from `citations/consulted.md`. Without a `.bib`, `references.md` with `##` groups is used. |

- **Statuses** are a trailing ` · <word>` on a heading or subtask line: `done`, `active`,
  `next`, `open`, `paused`, `planned`, `failed`, `abandoned`, `superseded`, `dropped`,
  `withdrawn`. The renderer colours them.
- **Figures**: `<figure><a href="figs/x.png"><img src="figs/x.png" alt="…"></a><figcaption>…</figcaption></figure>`,
  PNG in `figs/`, under ~1 MB. A moving figure may be `<video src="figs/x.mp4" controls loop muted playsinline>`
  or an interactive page `<iframe src="figs/x.html" loading="lazy"></iframe>` (one self-contained HTML file in `figs/`).
- **Links between sections**: `[F7](#results)`, `[§8](#derivations)`.
- **Open projects** (published, no password): `data-access="open"` on `<main>`, no `data-hash`, no `log.md`.

## The card on `projects/index.html`

The card is the single source of the title, collaborators, one-line description and progress;
the page reads its subtitle from it. One `<li>` per project, newest first:

```html
<li>
    <a href="/projects/<slug>/"><svg class="la-icon proj-access" role="img" aria-label="password-protected"><title>password-protected</title><use href="/files/la-sprite.svg#la-lock"/></svg>Title</a>
    <span class="proj-people">with A. Person, B. Person</span>
    <span class="muted">One line, written by the owner.</span>
    <span class="proj-progress" …beads…></span>
</li>
```

An open project uses `la-lock-open` and `open` in place of `password-protected`. Leave out
`.proj-people` when there are no collaborators.

The password gate is soft (a SHA-256 hash in `index.html`). Everything here is public in the repo by design.
