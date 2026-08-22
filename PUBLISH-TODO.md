# Before publishing

Short list. Tick as you go. Nothing here is code — see `EDITING.md` for how.

## Open

- [ ] `js/ringdown.js:57` — either build the 5th-click ringdown minigame or
      remove the dead hook and its comment. The last one left.
- [ ] Read the vault end to end once — it's the page most likely to have a
      half-finished sentence in it.
- [ ] Look at the site on a phone in daylight. The dark background is much
      warmer and darker than the old one, and brightness is the one thing the
      physics does *not* settle.

## Nice-to-have (won't block)

- [ ] Fixed bare-text margin index on `research.html`, current section in accent.
- [ ] A vertical marginal line of text (`writing-mode: vertical-rl`) somewhere.
- [ ] ~~Overprint `mix-blend-mode: multiply`~~ — skip this now. It fights the
      star texture; pick one, and the sky is the better of the two.

---

## Done

**Colour.** Light `--bg` is Cosmic Latte `#FFF8E7`; dark `--bg` is the measured
night sky `#2C211D` (Benn & Ellison 1998, La Palma), with `--panel` and `--hair`
on the same locus at brighter exposures. The ink is El Greco, *El Expolio*:
crimson by day, gold at night. Contrast audited — everything ≥ 4.9:1, body text
15.9:1 light and 12.4:1 dark. The five-painter picker is gone, and so is the
dead code behind it. The dust-reddened alternative `#261704` was considered and
dropped: the night sky won because it has one free parameter instead of two.

**Figures.** Nine PNGs in `files/figures/`, one per paper across the two
research threads, each with a two-sentence caption and an arXiv link. The four
originals (`dynamical-ringdown`, `eikonal-ratio`, `large-d-merger`,
`plane-wave-coupling`) were replaced and deleted; they are still in git history
if you want one back. Fixed at the same time: nothing set the initial `is-on`
class, so the first figure of each carousel was invisible until you clicked an
arrow.

**Placeholders.** No `[jaime: …]` spans left anywhere, no dummy
`arXiv:XXXX.XXXXX` links, no literal "Title" entry. The `.todo` CSS rule that
styled them is deleted, so a stray one can never ship looking intentional.

**Scripting off.** `research.html` carries a `<noscript>` block that shows the
theme write-ups inline and stops the reveal buttons looking clickable. Nothing
is permanently hidden any more.

**The sky.** Four drifting layers with real velocity dispersion, own tile set
per theme (a light mark on dark and a dark mark on light need different
opacities for the same contrast — the +0.05 term in the WCAG formula), density
masked down across the text column, and a rare inspiral-and-chirp every
50–150s. 1100px and up only, hidden for `prefers-reduced-motion` and in print.
Type `merger()` in the console to see one.

**Talks.** The three blackboard talks carry a `blackboard` chip, the same
shape as the `slides` chip on the ones with decks behind them, so a talk with
nothing to click no longer reads as an oversight. `nordic.pdf` deleted.

**The sky.** Merger rarity of 50–150s confirmed as right; left alone.

**CV.** Replaced with `files/cv.pdf`, built from `cv.tex` + `mycv.cls`. The two
links that still pointed at the old `cv_jaime_redondo.pdf` (Home and the Cities
colophon) were dead and now point at the new file. LaTeX intermediates are
gitignored. "Present Position" became "Positions", with Johns Hopkins moved up
out of Scientific Visits as a post rather than a visit; still two pages, with
about six lines of slack at the foot of page two. Dropping Scientific Visits
altogether would free six more.

**Not the site.** "Loading all the time" was VS Code's Live Server injecting a
live-reload WebSocket into every page — invisible to
`PerformanceResourceTiming`, which is why the network check came back clean.
Gone under the plain `python3 -m http.server` config in `.claude/launch.json`,
and it will not exist on GitHub Pages.
