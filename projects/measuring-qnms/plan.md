## Progress

<div style="margin: 0.6rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">original plan (items 1–8) · 7 of 7 done</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 100%; height: 100%; background: var(--accent);"></div></div>
<div style="margin: 0.9rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">follow-ups · 1 of 10 done, 2 under way</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 10%; height: 100%; background: var(--accent);"></div></div>

## Original plan

| # | task | status | where |
|---|---|---|---|
| 1 | Amplitude prior: PN × complex QNEF ratios, conditioned on the observing angles, errors calibrated on NR | <span style="color: var(--accent)">✓ done</span> | [§8](#derivations), F1 |
| 2 | Modes $\ell \le 8$, all $m$, $n \le 7$; spheroidal harmonics; mirror modes tied by symmetry | <span style="color: var(--accent)">✓ done</span> | [§8](#derivations) |
| 3 | Detector noise: O4, A+, ET, CE, LISA; PSD → Toeplitz covariance | <span style="color: var(--accent)">✓ done</span> | [§7](#derivations) |
| 4 | Sensitivity overlay: GW250114-like (real SXS strain) and LISA | <span style="color: var(--accent)">✓ done</span> | F2 |
| 5 | Two-mode toy model: closed form, and prior / posterior for 0, 1, 2 channels | <span style="color: var(--accent)">✓ done</span> | [§9](#derivations), F5 |
| 6 | Channel counts against $\rho_{220}$ and redshift, per detector | <span style="color: var(--accent)">✓ done</span> | F3 |
| 8 | Saturation as overtones and harmonics are added | <span style="color: var(--accent)">✓ done</span> | F4 |

## Follow-ups

| task | status | notes |
|---|---|---|
| Code: private repo, tests, tutorial notebook | <span style="color: var(--accent)">✓ done</span> | github.com/jredondoyuste/mqnm |
| Which modes each measured channel corresponds to | <span style="color: var(--accent-2)">◐ next</span> | project each channel onto the modes |
| Realistic sky positions and antenna patterns (H1/L1 for GW250114) | <span style="color: var(--accent-2)">◐ next</span> | replaces the overhead, co-located idealisation |
| Start before 10 M: non-modal GP noise | <span style="color: var(--accent-2)">◐ active</span> | the noise ladder, below; the first version (F6) used only NR-extractable modes and is withdrawn |
| Amplitude prior $\Sigma_A$ from theory, lightly calibrated on NR | <span style="color: var(--accent-2)">◐ active</span> | started 2026-09-26; plan not yet written |
| Quadratic 220×220 mode in the signal model | <span style="color: var(--muted)">○ open</span> | added 2026-09-26 |
| 221 bias: 1σ coverage only 26% | <span style="color: var(--muted)">○ open</span> | NR sits at 0.8× the QNEF prediction with little scatter |
| Correlated fundamental and overtone errors ((3,3): +0.53) | <span style="color: var(--muted)">○ open</span> | the independent model slightly underestimates the total error |
| Harmonics other than (2,2) under-covered at late times | <span style="color: var(--muted)">○ open</span> | quadratic 220×220 and retrograde content not modelled |
| Mild spin trend of the zero-mean overtone scale $a$ | <span style="color: var(--muted)">○ open</span> | correlation +0.55 with $\chi_f$ |

## Dead ends

- **Calibrating the $n \ge 2$ overtone error from NR strain power** (2026-09-24). The prior mean dominates the residual at early times, and unrelated residuals dominate late, so an error alone cannot be fitted. See the [log](#log).
- **First non-modal GP, trusted modes only** (F6, withdrawn 2026-09-25). The signal kept only the modes NR can extract; replaced by the noise ladder. The kernel and detector projection remain valid.
- **Very large mode sets ($10^4$–$10^5$ modes)**: dropped by decision on 2026-09-26, not tried.

## Noise ladder and the non-modal GP: agreed plan (2026-09-25)

**Principle.** The prior on the amplitudes (signal) and the noise model are chosen independently, each stating what we know.

- **Signal:** all 280 modes ($\ell \le 8$, all $m$, $n \le 7$). Overtones without NR calibration get a zero-mean prior of scale $a\,|g_{\ell m 1}|\,\sigma_{\ell m}$.
  - "We know nothing about them" cannot mean $a \to \infty$. Measurability is defined relative to the prior ($s > 1$), so an infinitely wide prior would make every weakly constrained direction "measurable".
  - The physical ceiling is the largest overtone content the whole NR waveform can accommodate: $a = 1.42$ (fitted to the total NR residual). That is the default; results are also shown as a function of $a$ below it.
- **Noise:** detector noise plus a GP for what the QNM description of NR does *not* explain.

**Noise ladder.** N1 white, N2 detector ACF, N3 detector ACF + GP. Each is crossed with the flat and PN + QNEF priors.

| step | what | status |
|---|---|---|
| **1. Baseline** | $n_{\rm meas}(\rho_{220})$ and $n_{\rm meas}(t_0)$ for N1, N2 × flat, PN + QNEF, at matched $\rho_{220}$ (white vs detector isolates the noise spectrum) | <span style="color: var(--muted)">○ to do</span> |
| **2. GP residual** | Per SXS run and harmonic, the sum of (a) **missing content:** NR strain minus the jaxqualin QNM fit of the *same* run, carried back to early times, where the fit's back-extrapolated amplitudes fail; and (b) **NR resolution error:** the difference between the two highest SXS resolutions. Both on $0 \le t \le 40\,M$ | <span style="color: var(--muted)">○ to do</span> |
| **3. GP kernel** | Fit the kernel (size relative to the 220, early decay, late tail, coherence time, oscillation at $\mathrm{Re}\,\omega_{\ell m 0}$) to those residuals by maximum likelihood, with per-harmonic amplitudes partially pooled. Train on 15 runs and validate on 15: the GP bands must cover the held-out residuals at the nominal rate from $t = 0$ | <span style="color: var(--muted)">○ to do</span> |
| **4. Science** | Signal = all 280 modes at $a = 1.42$; noise = N3. $n_{\rm meas}(t_0)$ and $n_{\rm meas}(\rho_{220})$ per detector (GW250114-like), compared with N2; saturation re-checked | <span style="color: var(--muted)">○ to do</span> |
| **5. Robustness: cancellations** | Large overtone amplitudes that cancel in the sum (as in early-time multi-overtone fits) need anti-correlated amplitudes, which an independent prior never draws. Allow a much larger individual scale ($a \gg 1.42$), but *condition* the prior on the summed early-time strain being NR-sized. That is a linear-Gaussian constraint, so it gives the cancelling correlations exactly. Check whether $n_{\rm meas}$ changes | <span style="color: var(--muted)">○ to do</span> |
| **6. Sensitivity to $a$** | $n_{\rm meas}$ against $a$ below the ceiling, at fixed noise | <span style="color: var(--muted)">○ to do</span> |

**Notes.**

- The GP scales with the source, so channel strengths are no longer proportional to $\rho_{220}$ and each SNR needs its own covariance.
- The GP is correlated across detectors (already implemented).
- The first GP version (F6) restricted the signal to NR-extractable modes and is withdrawn. `nonmodal.py` keeps the kernel and detector projection, which remain valid.

## Fixed choices

- **Linear Bayesian model**, $d = G\theta + n$; no Fisher. The observing angles, masses and spin are fixed (as from an IMR fit).
- **Default start $t_0 = 10\,M_f$** after the peak of $|h_{22}|$, where the prior reproduces NR strain (F1).
- **The analytic prediction is never replaced by NR:** NR only calibrates errors, and there is no extrapolation beyond the excitation-factor tables.

## From Dyer & Moore (arXiv:2510.11783)

They fit QNMs to NR with the same linear-Gaussian structure: real and imaginary amplitudes, Gaussian posterior, spheroidal mixing. Three things to borrow:

1. **A Gaussian-process kernel for what the QNM model misses.** Their kernel is stationary, with a period set by $\mathrm{Re}\,\omega_{\ell m 0}$ and an envelope decaying like $e^{-t/\tau}$ with $\tau = -1/\mathrm{Im}\,\omega_{\ell m 0}$, capped near the merger. Trained on SXS residuals (NR minus our prior mean), the same form could absorb pre-10 M non-QNM content as extra noise, $\Sigma_n \to \Sigma_n + K$. That keeps the model linear and could let us start earlier.
2. **A per-mode significance** (posterior support for $C_\alpha \ne 0$), to put next to our channel counts, which are per-direction.
3. **Posterior predictive checks** as the fit-quality metric instead of mismatch. This is what our F1 coverage test already does.

Their fits also show overtone amplitudes becoming unstable before about 15 M, consistent with our 10 M start.
