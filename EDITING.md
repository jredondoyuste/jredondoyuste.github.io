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

- **Timeline entries** are the `timeline-row` blocks — one per stop. Each
  row holds its own coloured bar (`timeline-segment`) plus the title,
  `data-date`, and subtitle. Rows grow to fit whatever you write, so a
  subtitle can run as long as you like. To add a stop, copy a whole
  `timeline-row` and give its bar the next `timeline-segment-N` class
  (that's just which shade of the accent it gets).
- **The interests list** is the `cycler` button: one interest shows at a
  time, and clicking swaps in another. Add or remove
  `<span class="cycle-item">…</span>` lines freely — the order is reshuffled
  on every visit, so nothing is permanently "first".

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

- **Marking a favourite:** add `data-fav` to any item — that's the whole
  thing. It gets a star and an accent-tinted border. Works on any category,
  as many as you like:
  `<span class="vault-item" data-kind="books" data-fav>…</span>`
  (One book is starred right now purely as an example — move it.)
- **A note for one category:** the `vault-note` paragraph above the floor
  shows *only* while its category is selected (the books one explains
  borrowing, and shouts out the bookstores). To write one for another
  category, copy the paragraph and change its `data-kind`.

- **Adding film photos:** see the section below — don't copy scans in by hand.

---

## Adding film photos

**Keep your originals outside this folder.** They're the negatives; the repo
only holds the prints. This matters more than it sounds: git keeps every
version of every file forever, so a 30 MB scan committed once stays in the
repo's history even if you delete it afterwards. (`.gitignore` blocks the
usual scan formats as a safety net.)

1. Run the script on your scans — point it at a whole folder, at specific
   files, or any mix. Folders are searched recursively, and formats can be
   mixed freely (TIFF, PNG, JPEG, RAW, HEIC…):

       tools/add-photos.sh ~/Pictures/scans
       tools/add-photos.sh ~/Pictures/scans/*.tif
       tools/add-photos.sh ~/scans/roll01.tif ~/scans/more-rolls

   Anything that isn't an image is skipped with a note, so a stray `.txt` or
   a Finder file in the folder won't stop the run. It prints a
   `converted / skipped / failed` tally at the end — worth a glance.

   For each one it writes two JPEGs and leaves your original untouched:

   | file | size | used for |
   |---|---|---|
   | `files/photos/NAME.jpg` | 2000px long edge, ~200–400 KB | opens when clicked |
   | `files/photos/thumbs/NAME.jpg` | 400px long edge, ~15–40 KB | the tile on the vault floor |

   It also strips EXIF, so camera and GPS data don't ship with the photo.

   The output name comes from the file name, lowercased
   (`Roll01 Frame 02.TIF` → `roll01-frame-02.jpg`). If two scans would end up
   with the same name — common when every roll folder has an `01.tif` — the
   folder name gets folded in (`roll02-01.jpg`) so neither is lost. Running
   the script again on the same folder updates those files rather than piling
   up copies.

2. Copy the commented `vault-photo` template in `vault.html`, once per
   photo, replacing `NAME` and writing a caption. The tiles scatter, rotate,
   and filter like everything else.

3. Before committing, sanity-check the total: `du -sh files/photos`.
   A whole roll should be a couple of MB, not a couple of hundred.

**On formats:** always JPEG. Chrome and Firefox can't display TIFF at all,
and PNG is lossless — for a photograph that means several times the size for
no visible difference. The script handles this; it takes TIFF/RAW/PNG input
and always writes JPEG.

---

### `lists/cities.html` — the Cities list
The city names are in this file. **The vignette text that pops up when you
click a city lives in `lists/js/cities-modal.js`** (the `cityData` object).
To add a city: add a `list-item` line here *and* a matching entry in that
JS file.

### `files/` — assets
- `cv_jaime_redondo.pdf` — your CV (replace the file, keep the name).
- `myself.jpg`, `sjoerd_photo.jpg` — the portrait and blackboard photos.
- `talks/*.pdf` — slide decks linked from Research.
- `photos/` — web-sized film scans (see "Adding film photos"). Originals
  don't belong here.
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
- **Star a favourite:** add `data-fav` to that item.
- **Add an interest to the rotating list:** add a `cycle-item` span in
  `index.html`.
- **Add a timeline stop:** copy a `timeline-row` in `index.html`.
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
- In a timeline row, keep the `timeline-segment` and the
  `timeline-milestone` as the row's two children — that pairing is what
  makes the bar match the height of the text beside it.
- In the interests list, keep the `cycle-item` spans directly inside the
  `cycler` button.
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
  `compact-disc`, `camera-retro`, `map-marker`, `star`. (Adding a new icon means
  regenerating the sprite — ask for help with that.)
- **Hidden pages** that aren't in the menu: the pantry at `/001/`. It's
  marked "noindex" so search engines ignore it.
