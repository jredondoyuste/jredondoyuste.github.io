## Progress

<div style="margin: 0.6rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">tasks · 8 of 8 done · paused for review</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 100%; height: 100%; background: var(--accent);"></div></div>

**Paused for review (2026-10-05).** Every planned task is done or closed as a dead end. We now read through the code and the results together, and think, for about a week before deciding what comes next.

## Tasks (2026-10-05)

| task | status | where it stands |
|---|---|---|
| Baseline: prior, noise, channel counts, toy model, saturation | <span style="color: var(--accent)">✓ done</span> | F1–F5 |
| Detector noise: the covariance from the PSD and its numerical choices | <span style="color: var(--accent)">✓ done</span> | $n_{\rm meas}$ robust to within one channel ([F7](#results), [§7](#derivations)) |
| Final figures F1–F3 | <span style="color: var(--accent)">✓ done</span> | F2's axis convention corrected; SNRs unchanged |
| Amplitude prior $\Sigma_A$: PN × QNEF | <span style="color: var(--accent)">✓ done</span> | $e, f, \kappa$ calibrated on NR, overtone scale $a = 1$ (NR bounds $a \le 0.38$) ([§8](#derivations)) |
| Mode counts over astrophysical populations | <span style="color: var(--accent)">✓ done</span> | GWTC-5 and Klein+16 ([F8](#results), [F12](#results), [§12](#derivations)); O3 matches; O4 ringdown events 2.6× high |
| Which channels are real at early start times | <span style="color: var(--accent)">✓ done</span> | from $10\,M$ every measured channel rests on NR-confirmed modes; earlier ones rest on untied overtones |
| Money plots, counts in modes | <span style="color: var(--accent)">✓ done</span> | F1–F4, F7–F12 at $a = 1$, $n_{\rm meas} = \lfloor n_{\rm ch}/2 \rfloor$ |
| Code tidied for review | <span style="color: var(--accent)">✓ done</span> | github.com/jredondoyuste/mqnm |

## Not pursued

Closed on 2026-10-05; candidates for later work.

| idea | status | notes |
|---|---|---|
| Realistic sky positions and antenna patterns (H1/L1 for GW250114) | <span style="color: var(--muted)">○ not pursued</span> | replaces the overhead, co-located idealisation |
| Quadratic 220×220 mode in the signal model | <span style="color: var(--muted)">○ not pursued</span> | |
| $n_{\rm meas}$ against $\rho_{220}$ across 3G detectors, incl. CE 20 km post-merger | <span style="color: var(--muted)">○ not pursued</span> | does the sensitivity shape matter, or only the SNR? |
| LISA with the exact TDI response, $10^5$–$10^7\,M_\odot$, and one gap case | <span style="color: var(--muted)">○ not pursued</span> | the smooth response is off by up to 30% above 0.1 Hz |

**Open questions.** One pooled error $e$ over-covers (3,3) and under-covers (3,2), (4,3) (F1). Harmonics other than (2,2) are under-covered at late times (quadratic and retrograde content not modelled).

## Dead ends

- **Calibrating the $n \ge 2$ overtone error from NR strain power** (2026-09-24). The prior mean dominates the residual early and unrelated residuals late.
- **First non-modal GP, trusted modes only** (F6, withdrawn 2026-09-25).
- **GP kernel for what the QNM model misses in NR** (dropped 2026-10-01). It changes $n_{\rm meas}(t_0)$ by at most one channel in O4 and about two in ET: complexity for little physics ([§10](#derivations)).
- **Noise ladder N1/N2/N3** (dropped 2026-10-01, before anything ran). Without the GP there is nothing to compare: detector noise is the model.
- **Overtones or non-modal residual: comparing the two readings** (closed 2026-10-05). Both sides were settled by the two entries above and below.
- **Very large mode sets ($10^4$–$10^5$ modes)**: dropped by decision on 2026-09-26, not tried.
- **Amplitude prior from a GP on a hyperboloidal slice** (2026-09-27). A zero-mean GP is far too broad for NR's $C_{221}/C_{220}$ ([§8.5](#derivations)).
- **Setting $a$ from an overtone power budget** (2026-09-28). At $t_0 = 0$ the prior's modes overshoot NR, and the fitted scale is not stable in $t_0$. NR instead bounds $a \le 0.38$; we set $a = 1$.
- **An emulator of $n_{\rm meas}$ for populations** (2026-09-27). It missed the orbital-phase dependence; replaced by an exact, reweighted event pool ([§12.4](#derivations)).

## Fixed choices

- **Linear Bayesian model**, $d = G\theta + n$; no Fisher. Observing angles, masses and spin fixed, as from an IMR fit.
- **Default start $t_0 = 10\,M_f$** after the peak of $|h_{22}|$.
- **The analytic prediction is never replaced by NR:** NR only calibrates errors, and nothing is extrapolated beyond the excitation-factor tables.
- From Dyer & Moore (arXiv:2510.11783) we take the GP for what the QNM model misses (§10); their per-mode significance and posterior predictive checks remain options.
