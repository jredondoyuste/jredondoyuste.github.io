## Progress

<div style="margin: 0.6rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">tasks · 3 of 7 done, 4 under way</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 43%; height: 100%; background: var(--accent);"></div></div>
<div style="margin: 0.9rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">follow-ups · 1 of 6 done</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 17%; height: 100%; background: var(--accent);"></div></div>

## Tasks (2026-09-29)

| task | status | where it stands |
|---|---|---|
| Baseline: prior, noise, channel counts, toy model, saturation | <span style="color: var(--accent)">✓ done</span> | F1–F5 |
| Detector noise: the covariance from the PSD and its numerical choices | <span style="color: var(--accent)">✓ done</span> | $n_{\rm meas}$ robust to within one channel ([F7](#results), [§7](#derivations)) |
| Final figures F1–F3 | <span style="color: var(--accent)">✓ done</span> | F2's axis convention corrected; SNRs unchanged |
| Mode counts over astrophysical populations | <span style="color: var(--accent-2)">◐ active</span> | final counts on GWTC-5 and Klein+16 ([F8](#results), [§12](#derivations)); O3 matches; O4 ringdown events 2.6× high; in owner review |
| GP kernel for what the QNM model misses in NR | <span style="color: var(--accent-2)">◐ active</span> | 434 SXS runs; the base kernel ranks first among the variants tried but under-covers before 20 M; a single kernel from $t = 0$ is being fitted ([§10](#derivations)) |
| Amplitude prior $\Sigma_A$: PN × QNEF | <span style="color: var(--accent-2)">◐ active</span> | in the code; $e, f, \kappa$ calibrated, $a = 1$ ([§8](#derivations)); the final $n_{\rm meas}$ table waits for the GP kernel |
| Noise ladder N1/N2/N3 | <span style="color: var(--accent-2)">◐ active</span> | the white/detector baseline can run now; the science step waits for the GP kernel |

### Noise ladder

The signal prior (§8) and the noise model are chosen independently. N1 white, N2 detector noise, N3 detector noise plus the GP of §10, each crossed with the flat and PN + QNEF priors.

| step | what | status |
|---|---|---|
| 1. Baseline | $n_{\rm meas}(\rho_{220})$ and $n_{\rm meas}(t_0)$ for N1, N2 at matched $\rho_{220}$ | <span style="color: var(--muted)">○ to do</span> |
| 2–3. GP | the residual and its kernel, from SXS | <span style="color: var(--accent-2)">◐ GP-kernel task</span> |
| 4. Science | all 280 modes, $a = 1$, N3: $n_{\rm meas}(t_0)$ and $n_{\rm meas}(\rho_{220})$ per detector against N2; remakes F6 | <span style="color: var(--muted)">○ waits for 2–3</span> |
| 5. Cancellations | a much wider overtone scale, conditioned on NR-sized summed early strain (gives the cancelling correlations exactly) | <span style="color: var(--muted)">○ to do</span> |
| 6. Sensitivity to $a$ | $n_{\rm meas}$ against $a$ | <span style="color: var(--accent-2)">◐ first scan done</span>: $a$ matters only for $t_0 \lesssim 7$–$10\,M$ |

## Follow-ups

| task | status | notes |
|---|---|---|
| Code: private repo, tests, tutorial notebook | <span style="color: var(--accent)">✓ done</span> | github.com/jredondoyuste/mqnm |
| Which modes each measured channel corresponds to | <span style="color: var(--muted)">○ open</span> | project each channel onto the modes |
| Realistic sky positions and antenna patterns (H1/L1 for GW250114) | <span style="color: var(--muted)">○ open</span> | replaces the overhead, co-located idealisation |
| Quadratic 220×220 mode in the signal model | <span style="color: var(--muted)">○ open</span> | |
| $n_{\rm meas}$ against $\rho_{220}$ across 3G detectors, incl. CE 20 km post-merger | <span style="color: var(--muted)">○ open</span> | does the sensitivity shape matter, or only the SNR? Waits on the CE curve version |
| LISA with the exact TDI response, $10^5$–$10^7\,M_\odot$, and one gap case | <span style="color: var(--muted)">○ open</span> | the smooth response is off by up to 30% above 0.1 Hz |

**Open questions.** One pooled error $e$ over-covers (3,3) and under-covers (3,2), (4,3) (F1). Harmonics other than (2,2) are under-covered at late times (quadratic and retrograde content not modelled).

## Dead ends

- **Calibrating the $n \ge 2$ overtone error from NR strain power** (2026-09-24). The prior mean dominates the residual early and unrelated residuals late.
- **First non-modal GP, trusted modes only** (F6, withdrawn 2026-09-25). Replaced by the noise ladder and the GP-kernel task.
- **Very large mode sets ($10^4$–$10^5$ modes)**: dropped by decision on 2026-09-26, not tried.
- **Amplitude prior from a GP on a hyperboloidal slice** (2026-09-27). A zero-mean GP is far too broad for NR's $C_{221}/C_{220}$ ([§8.5](#derivations)).
- **Setting $a$ from an overtone power budget** (2026-09-28). At $t_0 = 0$ the prior's modes overshoot NR, and the fitted scale is not stable in $t_0$. NR instead bounds $a \le 0.38$; we set $a = 1$.
- **An emulator of $n_{\rm meas}$ for populations** (2026-09-27). It missed the orbital-phase dependence; replaced by an exact, reweighted event pool ([§12.4](#derivations)).

## Fixed choices

- **Linear Bayesian model**, $d = G\theta + n$; no Fisher. Observing angles, masses and spin fixed, as from an IMR fit.
- **Default start $t_0 = 10\,M_f$** after the peak of $|h_{22}|$.
- **The analytic prediction is never replaced by NR:** NR only calibrates errors, and nothing is extrapolated beyond the excitation-factor tables.
- From Dyer & Moore (arXiv:2510.11783) we take the GP for what the QNM model misses (§10); their per-mode significance and posterior predictive checks remain options.
