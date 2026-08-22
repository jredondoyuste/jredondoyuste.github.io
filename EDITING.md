# Editing this website

A short map of where everything lives, so you can change content without
worrying about the structure. The site is hand-written HTML + CSS with a
little vanilla JavaScript — **no build step**. You edit a file, save, and
refresh the browser.

---

## The 60-second version

- **Text and links live in the `.html` files.** Edit them like a document.
- Places where an edit is expected are marked with an **`EDIT-ME`** comment
  in the HTML. Search the project for `EDIT-ME` to find them all.
- **Colours** live in two small token blocks at the top of `style.css`, one
  for light and one for dark. See "Colours and dark mode" below.
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

> **If a change doesn't show up, hard-refresh: Cmd+Shift+R.**
> Browsers cache `.css`, `.js` and `la-sprite.svg` aggressively, and a normal
> reload will happily keep running the old copy. This is the single most
> confusing thing about editing the site — if something you *know* you fixed
> looks broken, hard-refresh before believing it.

When you're happy, **commit and push with git** — GitHub Pages redeploys
the live site automatically.

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
- The **intro paragraph** contains the research themes as Capitalised,
  accent-coloured, clickable words (`stage-link` buttons). Each points at a
  hidden block lower in the file — `<div class="reveal-source" id="src-theme-1">`
  etc. **Write the theme content inside those `reveal-source` blocks.** The
  words "staring at a blackboard" reveal the photo the same way
  (`id="src-photo"`).
- Each theme button also carries `data-hash="nonlinear-dynamics"`, which is
  what **the fold-down menu under [research] in the nav** links to:
  `/research.html#nonlinear-dynamics` opens that theme on arrival. If you add
  a theme, give its button a `data-hash` and add a line to the `nav-menu`
  block — which lives in the nav of *every* page, so change all four.
- **Publications** is the full list from INSPIRE (August 2026), newest
  first, in an `<ol reversed>` — so the numbers count *down* and adding a
  paper at the top renumbers everything by itself. Each paper reads as three
  lines: title, authors (yours in bold ink), and where it appeared. That
  third line — journal (linked to its DOI), arXiv, INSPIRE — stays clickable
  whether or not the paper is folded open; `js/stage.js` catches clicks on
  links inside a `<summary>` so they don't fold the entry instead. Inside sits
  the abstract and an **optional "director's cut" note** (a commented template
  in every paper: uncomment and write). To add a paper, copy a whole
  `<li>…</li>` block.
- **Talks, Code and Teaching** follow the same shape: a first line naming
  the thing, a quieter second line placing it. On talks, each `<li>` carries
  `class="talk-invited"` (◆, accent) or `class="talk-contributed"` (◇, muted);
  the date leads the second line and sits in a fixed column. Link a title to a
  PDF in `/files/talks/` and it grows a small "slides" chip by itself —
  **watch the capitalisation of the filename**, GitHub Pages is case-sensitive.
  On codes, the third line is the arXiv id.
- **Theme extras** (see theme 1 for a live example; themes 2–3 carry a
  commented template):
  - a **figure carousel** (`fig-carousel`): one `<figure class="fig-frame">`
    per figure, arrows walk them. Drop images in `/files/figures/` (keep
    them under ~200 KB; `magick in.png -resize '900x900>' -strip out.png`),
    put `is-on` on exactly one frame, and give each caption an arXiv link.
  - a **papers list** (`theme-papers`) and a **collaborators line**
    (`theme-people`) at the end of the reveal.
- When a section opens on the right, it gets a **title** from its
  `<summary>` text. To show a different title there (say the left bar says
  "Publications" but the stage should say "Selected publications"), add
  `data-stage-title="Selected publications"` to that `<details>`.
- On wide screens the **left column is sticky**: if the right side grows
  taller than the screen (all those abstracts), scrolling moves only the
  right. This relies on the left column fitting one screen — keep it lean.
- **"Questions that keep me up at night"** is the last reveal section, and
  it opens on the right like the others. Questions then surface on their
  own, one every five seconds, scattered at random over the panel; bring
  the cursor near one and it pops (a tap does the same on a phone),
  leaving room for the next. The questions themselves live in
  `js/crazy_idea.js` — add or edit lines in the array there. The three
  numbers at the top of that file set the pace: `SPAWN_MS` (how often a new
  one appears), `MAX_ON_SCREEN`, and `POP_DIST` (how close the cursor has
  to get, in pixels).

### `vault.html` — the Vault
This page alone runs **wide**: `<div class="page page-vault">` lets the floor
spread to 82rem, while the nav, title, filters and notes above it keep the
normal reading measure. `<body class="is-vault">` widens the starfield's quiet
trough to match.

Everything on the vault floor is a `vault-item`. To add one, copy an
existing line and change the text. On "everything", `js/vault.js` packs the
items densely (each drops to the highest free spot, with a small gap and a
tilt) — new items just join the heap, nothing to configure. Picking a
category tidies them into a grid. Two things matter on each item:
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
- **Hover text:** whatever you put in `title="…"` shows as a small dark
  tooltip on hover — the photo captions and the one-line notes on the links
  all come from there. Items with no `title` show nothing, so add one to any
  item you want to annotate.
- **Photos** open in a viewer rather than loading the raw file: arrows (or
  the ← → keys) move through the roll, the cross or Esc closes it, and the
  caption underneath is the item's `title`. That's `js/lightbox.js`; it picks
  up every `.vault-photo` automatically, so new photos need nothing extra.
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

## Colours and dark mode

Every colour on the site derives from **seven tokens** (`--bg`, `--panel`,
`--ink`, `--muted`, `--accent`, `--accent-2`, `--hair`) defined at the top of
`style.css`. There is one paper and one ink, in two variants: a `:root` block
for light and a `:root[data-theme="dark"]` block for dark.

**The paper** is fixed and never varies with the ink:

- light `#FFF8E7`, "Cosmic Latte" — the average colour of all light in the
  universe, from ~200,000 galaxy spectra in the 2dF Galaxy Redshift Survey
  (Glazebrook & Baldry 2002).
- dark `#2C211D` — the measured average colour of the night sky (Benn &
  Ellison 1998, La Palma). `--panel` and `--hair` sit on that same locus at
  brighter exposures, so the dark greys are all the same colour of sky.

**The ink** is El Greco, *El Expolio*, sampled from the painting: crimson
`#C23649` by day, gold `#EFCC64` at night, with the other of the pair as
`--accent-2`. The long comment above the tokens in `style.css` records where
each number came from, and why the night sky is warm rather than blue.

**The visitor picks:** the `[dark]`/`[light]` button in the nav toggles the
theme, and the choice persists in the browser (localStorage). Dark is the
default on a first visit, deliberately — not just when the system asks for it.

**To tweak the colours:** edit the token lines in `style.css`; both blocks are
labelled. Keep an eye on contrast — accent-on-bg should stay above ~4.5:1 so
links remain readable. When in doubt, darken the accent in the light variant
and lighten it in the dark one.

---

### `lists/cities.html` — the Cities list
The city names are in this file. **The vignette text that pops up when you
click a city lives in `lists/js/cities-modal.js`** (the `cityData` object).
To add a city: add a `list-item` line here *and* a matching entry in that
JS file.

### `files/` — assets
- `cv.pdf` — your CV, built from `cv.tex` + `mycv.cls` in the same folder.
  Rebuild and commit all three; the `.aux`/`.log`/`.out` intermediates are
  gitignored.
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
- The `theme.js` script tag in each page's `<head>` loads **without
  `defer`** on purpose — it applies the saved theme before the page paints.
  Moving it or adding `defer` brings back a flash of the wrong colours.
- **File names** of the three pages, and anything in `files/fonts/`.

If you're unsure whether an edit is "content" or "structure": if you're
only changing words between `>` and `<`, you're safe. If you're changing a
tag, a `class`, a `data-…`, or an `id`, pause.

---

## Handy extras

- **A camouflaged (hidden) link**, for a future easter egg: wrap a word in
  `<a class="hidden-link" href="…">word</a>`. It looks like normal text and
  only reveals itself (turns accent-coloured) on hover.
- **Hover text:** anything with a `title="…"` gets a styled tooltip on hover
  (the site draws its own — the browser's native one waits a second and can't
  be themed). Add `title="…"` to any vault item and it just works. Items
  without a `title` simply show nothing.
- **Adding an icon:** only names that are in the sprite render. A name that
  isn't there fails **silently** — no error, just an invisible icon. So don't
  hand-write a new `#la-name`; run:

      tools/add-icon.sh globe utensils     # fetches and adds them
      tools/add-icon.sh --list             # what you already have

  Then **hard-refresh** (Cmd+Shift+R) — see the caching note below.
- **Icons available** in `files/la-sprite.svg` (use as `#la-NAME`):
  `baseball-ball`, `bicycle`, `birthday-cake`, `book`, `bookmark`,
  `camera-retro`, `car-alt`, `car-side`, `compact-disc`, `dungeon`,
  `film`, `glass-whiskey`, `globe`, `hands-helping`, `hat-wizard`,
  `map-marker`, `mountain`, `music`, `podcast`, `record-vinyl`,
  `seedling`, `skull`, `star`, `sun`, `table-tennis`, `tools`,
  `utensils`, `video`, `water`, `wine-bottle`
  Add more with `tools/add-icon.sh` (above) rather than by hand.
- **Hidden pages** that aren't in the menu: the pantry at `/001/`. It's
  marked "noindex" so search engines ignore it.
- **The minigame:** click the nav wiggle three times (each click within
  2.5s of the last) and it escapes into the page as a snake that eats the
  text. Works on any page. Everything lives in `js/wigglegame.js`, which
  only loads at that moment. Players are named for the UTC moment they
  started, in the LVK convention (`GW260822_143512`), and scores ("SNR")
  keep a shared catalog (below). Scoring: a glyph is worth 0.1, a remnant
  snake is worth its whole length — but only if you strike its **head**;
  its body kills you on contact — and every segment a burst cuts off costs
  a full point. Every merger leaves a remnant, up to `MAX_REMNANTS`, and
  its burst sweeps a wedge whose half-angle is drawn at random under a
  ceiling that opens as you score, so a good run has less and less safe
  page. The knobs at the top of the file: `SNR_SCALE` is the one true
  difficulty knob — the score at which mergers come twice as often and the
  wedge is half-open — with `MERGE_T0` and `CONE_MAX` as the two ends it
  interpolates between; `MAX_REMNANTS` is how many rivals may exist at
  once; `GLYPH` sets what the page is worth; `CELL` sets scale, and
  `TICK`/`ETICK` your step and theirs (they must stay slower than you —
  the gap is what makes catching a head possible at all). `REMOTE` points at the Cloudflare Worker in
  `tools/scoreboard-worker.js` (deploy steps in that file's header), which
  is what makes the scoreboard shared between visitors even though the
  site is static. Set `REMOTE` to `null` to go back to a per-browser
  catalog. To wipe the scoreboard, delete the `scores` key in the worker's
  KV namespace from the Cloudflare dashboard. In the console
  mid-game: `WiggleGame.merge()` forces a merger, `WiggleGame.state()`
  shows the numbers.
