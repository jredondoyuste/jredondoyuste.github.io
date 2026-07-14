# Editing this website

A short map of where everything lives, so you can change content without
worrying about the structure. The site is hand-written HTML + CSS with a
little vanilla JavaScript — **no build step**. You edit a file, save, and
refresh the browser.

---

## The 60-second version

- **Text and links live in the `.html` files.** Edit them like a document.
- Spots that still need your words are marked with a highlighted
  **`[jaime: …]`** placeholder. Search the project for `jaime:` (or
  `EDIT-ME`) to find them all. When you replace one, delete the whole
  `<span class="todo">[jaime: …]</span>` wrapper, leaving just your text.
- **To change the accent colour** (teal → anything), edit **one line** in
  `style.css`: `--accent: #1F5765;`. Everything follows automatically.
- **Don't rename files** — the menu links point to `index.html`,
  `research.html`, `vault.html` by name.

---

## Previewing your changes

Two options:

1. **Just open the file** — double-click `index.html`. Most things work,
   but links that start with `/` (and the fonts) expect a server, so:
2. **Run the tiny local server** (recommended). In a terminal, from this
   folder: `python3 -m http.server 8787`, then open
   `http://localhost:8787`. Refresh after each save.

When you're happy, **commit and push with git** — GitHub Pages redeploys
the live site automatically. Fill in every `[jaime: …]` placeholder before
you push.

---

## Where is what

### `index.html` — the Home page
Top to bottom: your **name**, the **pronunciation** line, your **title**
(Associate Research Scholar…), the **intro paragraphs**, the **contact
chips** (email / CV / INSPIRE / …), the **Trajectory** timeline, and the
**surname footnote** at the very bottom. All plain text — edit in place.

- **Timeline entries** are the `timeline-milestone` blocks. Each has a
  title, a `data-date`, and a subtitle. The coloured bars on the left are
  the `timeline-segment` blocks — if you add or remove a milestone, add or
  remove a matching segment so the colours line up.

### `research.html` — the Research page
- The **intro paragraph** contains the three research themes as coloured,
  clickable words (`stage-link` buttons). Each points at a hidden block
  lower in the file — `<div class="reveal-source" id="src-theme-1">` etc.
  **Write the theme content inside those `reveal-source` blocks.** The word
  "blackboard" reveals the photo the same way (`id="src-photo"`).
- **Publications**, **Talks**, and **Code** are the three expandable
  sections. To add a paper, copy one `<li>…</li>` inside `<ul class="pub-list">`
  and edit it. Same for talks inside `<ul class="talk-list">`.
- The "questions that keep me up at night" list lives in
  `js/crazy_idea.js` — add or edit lines in the array there.

### `vault.html` — the Vault
Everything on the vault floor is a `vault-item`. To add one, copy an
existing line and change the text. Two things matter on each item:
- `data-kind="links"` (or `friends`, `books`, `records`, `photos`,
  `places`) — this is what the filter buttons use.
- the icon: `<use href="/files/la-sprite.svg#la-book"/>` — swap `la-book`
  for another icon name (see the list at the bottom of this file).

Use `<a …>` for items that link somewhere, `<span>` for ones that don't
(like books). The **colophon** paragraph at the bottom is plain text.

- **Adding film photos:** drop image files into `files/photos/` (keep each
  under ~200 KB) and copy the commented `vault-photo` template already in
  `vault.html` — one block per photo. They scatter and filter like
  everything else.

### `lists/cities.html` — the Cities list
The city names are in this file. **The vignette text that pops up when you
click a city lives in `lists/js/cities-modal.js`** (the `cityData` object).
To add a city: add a `list-item` line here *and* a matching entry in that
JS file.

### `files/` — assets
- `cv_jaime_redondo.pdf` — your CV (replace the file, keep the name).
- `myself.jpg`, `sjoerd_photo.jpg` — the portrait and blackboard photos.
- `talks/*.pdf` — slide decks linked from Research.
- `fonts/`, `favicon.png`, `la-sprite.svg` — leave these alone.

---

## Common edits, step by step

- **Fix a typo / reword something:** find the text in the `.html` file,
  edit, save, refresh.
- **Add a publication:** in `research.html`, copy an `<li>` in
  `pub-list`, change the title, link, and authors.
- **Flesh out a research theme:** edit inside the matching
  `<div class="reveal-source" id="src-theme-…">`.
- **Add a vault link:** copy a `vault-item` `<a>` line, set its
  `data-kind` and icon.
- **Add a book/record:** copy a `vault-item` `<span>` with
  `data-kind="books"` (or `records`).
- **Try a different accent colour:** change `--accent` in `style.css`.

---

## What is NOT safe to touch

These make the reveal/stage/filter machinery work. Changing text near them
is fine; changing the tags/attributes themselves will break things.

- The **`<head>`** of each page (the `<link>` and `<script>` lines, the
  font preload). Leave as-is.
- On Home/Research: the wrapper `<div class="page with-stage">`, the
  `<div class="spine">`, and the `<aside class="stage">…<div class="stage-body">`
  at the bottom. The right-hand reveal panel depends on all three.
- A **`stage-link`** button's `data-reveal="…"` must match the `id` of a
  `reveal-source` block. If you add a new inline reveal, keep those paired.
- The **`details class="reveal"` → `summary` → `div class="reveal-body"`**
  nesting for Publications/Talks/Code. Put your content inside `reveal-body`.
- Every vault item needs `class="vault-item"` and a `data-kind`, or it
  won't filter.
- The **`ringdown` SVG** in the nav, and all the **`.js` files** — no need
  to edit for content (except `crazy_idea.js` for the questions list, and
  `cities-modal.js` for city vignettes).
- **File names** of the three pages, and anything in `files/fonts/`.

If you're unsure whether an edit is "content" or "structure": if you're
only changing words between `>` and `<`, you're safe. If you're changing a
tag, a `class`, a `data-…`, or an `id`, pause.

---

## Handy extras

- **A camouflaged (hidden) link**, for a future easter egg: wrap a word in
  `<a class="hidden-link" href="…">word</a>`. It looks like normal text and
  only reveals itself (turns accent-coloured) on hover.
- **Icons available** in `files/la-sprite.svg` (use as `#la-NAME`):
  `music`, `bicycle`, `table-tennis`, `sun`, `dungeon`, `mountain`,
  `water`, `car-side`, `skull`, `birthday-cake`, `wine-bottle`, `video`,
  `film`, `seedling`, `bookmark`, `hands-helping`, `tools`, `book`,
  `compact-disc`, `camera-retro`, `map-marker`. (Adding a new icon means
  regenerating the sprite — ask for help with that.)
- **Hidden pages** that aren't in the menu: the pantry at `/001/`. It's
  marked "noindex" so search engines ignore it.
