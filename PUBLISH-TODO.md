# Before publishing

Short list. Tick as you go. Nothing here is code — see `EDITING.md` for how.

## Blockers (site is wrong/broken without these)

- [ ] `research.html:117` — `.todo` placeholder: write the real blurb for viscous
      response / gravitational mirrors.
- [ ] `research.html:461` — `.todo` placeholder: list your public codes/repos, or
      delete the whole "code" block if you'd rather not have one.
- [ ] `research.html:126` and `:134` — dummy `arXiv:XXXX.XXXXX` links and a
      literal "Title" entry. Real papers or remove.
- [ ] Commit `files/figures/` — four PNGs are untracked, so the figures are
      currently broken for everyone but you.
      (`dynamical-ringdown`, `eikonal-ratio`, `large-d-merger`, `plane-wave-coupling`)
- [ ] Delete the `.todo` CSS rule from `style.css` once no `.todo` spans remain,
      so a stray one can never ship looking styled-and-intentional.

## Colour rework (decided 2026-08-13, not yet implemented)

- [x] Light `--bg` = Cosmic Latte `#FFF8E7`, shared by everything.
- [x] Dark `--bg` = the measured night sky `#2C211D` (Benn & Ellison 1998
      La Palma, R:G:B = 1 : 0.603 : 0.481). `--panel` and `--hair` sit on the
      same locus at exposures 0.042 and 0.090.
- [x] Ink: El Greco, *El Expolio*, sampled from the painting (untuned).
      Crimson `#C23649` by day, gold `#EFCC64` at night; `#112A48` (Mary's
      blue) and `#C23649` as the second inks. `#244151` (storm sky) unused.
- [x] Retire the five-painter picker. Palettes commented out in `style.css`,
      buttons commented out in `vault.html`, `theme.js` clears stale saved
      palettes. Reviving it is two uncomments.
- [x] Contrast audit — everything ≥ 4.9:1; body text 15.9:1 light / 12.4:1 dark.
- [ ] Update `EDITING.md` §"Colours: palettes and dark mode" — it still
      describes the old swappable three-palette scheme, which no longer exists.
- [ ] Decide on the dust-reddened alternative for dark mode. `#261704` (Cosmic
      Latte behind A_V = 5 of extinction) was the other candidate; the night sky
      won because it has one free parameter instead of two. Nothing to do unless
      you change your mind.
- [ ] Look at the site in daylight and at night before committing to `#2C211D`.
      The brightness is the one thing physics does *not* fix.

## Content

- [ ] Refresh `files/cv_jaime_redondo.pdf` (check it says Princeton, fall 2026).
- [ ] Check every talk in `files/talks/` still has a working slide link.
- [ ] Read the vault end to end once — it's the page most likely to have a
      half-finished sentence in it.

## Polish

- [ ] Add Open Graph / Twitter card tags. Right now a shared link previews with
      no image and no title card on any platform.
- [ ] Test dark mode on a phone in daylight — the new dark bg is much warmer and
      darker than the old one.
- [ ] Check the site with JavaScript disabled: the stage reveals on
      `research.html` must not leave content permanently hidden.
- [ ] `js/ringdown.js:58` — either build the 5th-click ringdown minigame or
      remove the dead hook and its comment.

## The sky (done, worth a look before publishing)

- [x] Drifting star field, `js/starfield.js` + the `.sky` block in `style.css`.
      1100px and up only; hidden for `prefers-reduced-motion` and in print.
      12 KB of SVG raw, 2.2 KB gzipped, no extra requests.
- [x] Light mode dots repainted: was `filter: invert(1)` on the white tiles
      (flat neutral black), then `mask-image` + `background-color: var(--ink)`
      at the dark set's own opacities — still read as dust. Measured why: a
      light mark on a near-black ground and a dark mark on a near-white
      ground need very different opacities for the same contrast ratio (it's
      the +0.05 term in the WCAG formula) — the dark tiles' faintest stars
      landed under 2:1 contrast once ported to light mode, invisible in
      everything but color. Light mode now ships its OWN tiles (fewer stars,
      higher opacity floor, 55–100% vs the dark set's 28–97%), landing
      ~2.2–4:1. Layer opacity raised to 0.85 (was 0.55) to match dark.
      +2.3 KB gz for the extra tile data.
- [x] Density masked down across the text column with a smooth gradient,
      plateau at 33% (was 15%, then earlier a hard-edged 240px ramp).
- [x] Star sizes given real variance (far: r 0.22–1.19, near: r 0.65–2.37,
      both biased toward the small end) instead of a narrow uniform range.
- [x] Dark is now the default theme for a first visit (`js/theme.js`), not
      just when the OS prefers it. The toggle still remembers your choice.
- [x] Rare merger: two stars inspiral (accelerating — the chirp), coalesce, and
      a wavefront crosses the screen at constant speed. Every 50–150s, never
      while the tab is hidden. Type `merger()` in the console to see one.
- [x] Four layers with real velocity dispersion: headings 135° / 150° / 60° /
      208°, speeds 4.0–7.0 px/s. Direction comes from each tile's aspect
      ratio, so every layer still loops seamlessly on one tile of travel.
      Costs ~38 MB of compositor texture, up from 24 MB with two layers —
      drop layer `b` or `c` if that ever matters.
- [x] Mask softened: flat 15% plateau across the text, 741px ramp back to
      full (was a 240px ramp, which read as a hard band).
- [ ] Watch it for a few minutes and decide if 50–150s is the right rarity —
      `GAP_MIN` / `GAP_VAR` at the top of `js/starfield.js`.
- [x] **Resolved: "the site seems to be loading all the time."** Wasn't the
      site — VS Code's Live Server injects a live-reload WebSocket into every
      page it serves, and WebSockets never show up in `PerformanceResourceTiming`
      (why the network check came back clean). Confirmed by loading the same
      files from the plain `python3 -m http.server` config in
      `.claude/launch.json` instead — bar gone. Won't exist on GitHub Pages
      either. The `will-change` removal and pause-on-hidden from investigating
      this are still worth keeping, just weren't the fix.

## Nice-to-have (won't block)

- [ ] Fixed bare-text margin index on `research.html`, current section in accent.
- [ ] A vertical marginal line of text (`writing-mode: vertical-rl`) somewhere.
- [ ] ~~Overprint `mix-blend-mode: multiply`~~ — skip this now. It fights the
      star texture; pick one, and the sky is the better of the two.
