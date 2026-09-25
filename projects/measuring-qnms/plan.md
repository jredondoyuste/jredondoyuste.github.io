## Progress

<div style="margin: 0.6rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">original plan (items 1–8) · 7 of 7 done</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 100%; height: 100%; background: var(--accent);"></div></div>
<div style="margin: 0.9rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">follow-ups · 2 of 8 done</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 25%; height: 100%; background: var(--accent);"></div></div>

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
| Start before 10 M: non-modal GP noise | <span style="color: var(--accent)">✓ first version</span> | [§10](#derivations), F6. The count is flat for any start before ~10–15 M. Next: calibrate beyond (2,2); decide whether it replaces the 10 M default |
| 221 bias: 1σ coverage only 26% | <span style="color: var(--muted)">○ open</span> | NR sits at 0.8× the QNEF prediction with little scatter |
| Correlated fundamental and overtone errors ((3,3): +0.53) | <span style="color: var(--muted)">○ open</span> | the independent model slightly underestimates the total error |
| Harmonics other than (2,2) under-covered at late times | <span style="color: var(--muted)">○ open</span> | quadratic 220×220 and retrograde content not modelled |
| Mild spin trend of the zero-mean overtone scale $a$ | <span style="color: var(--muted)">○ open</span> | correlation +0.55 with $\chi_f$ |

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
