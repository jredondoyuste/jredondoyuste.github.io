## Progress

<div style="margin: 0.6rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">original plan (items 1–8) · 7 of 7 done</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 100%; height: 100%; background: var(--accent);"></div></div>
<div style="margin: 0.9rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">follow-ups · 1 of 9 done</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 11%; height: 100%; background: var(--accent);"></div></div>

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
| Start before 10 M: non-modal GP noise | <span style="color: var(--accent-2)">◐ redo</span> | first version (F6) used only NR-extractable modes; redo with the full mode set |
| Very large mode set (10⁴–10⁵ modes) | <span style="color: var(--accent-2)">◐ next</span> | computed in data space; asymptotic frequencies for high ℓ, n |
| 221 bias: 1σ coverage only 26% | <span style="color: var(--muted)">○ open</span> | NR sits at 0.8× the QNEF prediction with little scatter |
| Correlated fundamental and overtone errors ((3,3): +0.53) | <span style="color: var(--muted)">○ open</span> | the independent model slightly underestimates the total error |
| Harmonics other than (2,2) under-covered at late times | <span style="color: var(--muted)">○ open</span> | quadratic 220×220 and retrograde content not modelled |
| Mild spin trend of the zero-mean overtone scale $a$ | <span style="color: var(--muted)">○ open</span> | correlation +0.55 with $\chi_f$ |

## Noise ladder and the non-modal GP: plan (2026-09-25)

**Goal.** Build the noise model step by step, as we did for the prior (flat → PN + QNEF), and study $n_{\rm meas}$ as a function of the start time. The signal is always the full mode set: $\ell \le 8$, all $m$, $n \le 7$ (280 modes).

| noise ↓ / prior → | flat | PN + QNEF |
|---|---|---|
| **N1** white | <span style="color: var(--accent)">✓ exists</span> | <span style="color: var(--accent)">✓ exists</span> |
| **N2** detector ACF (PSD → Toeplitz) | <span style="color: var(--accent)">✓ exists</span> | <span style="color: var(--accent)">✓ exists</span> |
| **N3** ACF + non-modal GP | <span style="color: var(--muted)">○ planned</span> | <span style="color: var(--accent-2)">◐ main target</span> |

**The difficulty.** Near the merger, high overtones in the signal and a GP in the noise can explain the same residual. Today the zero-mean overtone scale $a$ was fitted to the *total* NR residual at 5 M, so the overtones already play the GP's role. Calibrating both on the same residual would be circular. The steps below are designed around this.

| step | what | done when |
|---|---|---|
| **1. Clean ladder N1/N2** | $n_{\rm meas}(\rho_{220})$ and $n_{\rm meas}(t_0)$ for the four existing combinations, at the same $\rho_{220}$, so white vs ACF isolates the spectral shape | one figure, four curves per panel |
| **2. Likelihood without artefacts** | Model the NR strain for $t \ge 0$ as prior predictive + GP, *marginalising* over the 220 instead of conditioning on its fitted value (that fit error broke the first attempt). Normalise the GP by each harmonic's prior-predictive scale $\sigma_{\ell m}\sqrt{1 + e_{\ell m}^2}$; if pooling still fails, use one $\lambda_{\ell m}$ per harmonic with a shared hyperprior | the fit converges inside its bounds on (2,2), (3,3), (3,2), (4,4), (2,1) |
| **3. Joint empirical Bayes** | Fit $a$ and the GP parameters together, over 0–40 M rather than at a single start time. The data share the residual between damped sinusoids at exact QNM frequencies (overtones) and a smooth envelope (GP) | best-fit $a$, GP and their uncertainties |
| **4. Identifiability** | Profile likelihood: for each $a$, the best GP. If it is flat in $a$, the split is degenerate, and results are reported across the degenerate range, not at a point | profile curve and a stated range for $a$ |
| **5. Validation** | Train on 15 SXS runs and test on 15. Compare held-out likelihoods across rungs. Coverage of the NR strain at *every* $t \in [0, 40]$ M, all harmonics | coverage within ±10% of nominal from $t = 0$ |
| **6. Science** | $n_{\rm meas}(t_0)$ for GW250114-like sources in each detector across the ladder; $n_{\rm meas}(\rho_{220})$ at $t_0 = 0$ with N3 against $t_0 = 10$ M with N2; saturation re-checked with N3 | figures replacing F3, F4 and F6 |

**Things to keep in mind.**

- The GP scales with the source, so channel strengths are no longer proportional to $\rho_{220}$: each SNR needs its own covariance (still cheap).
- It is correlated across detectors (they all see the same unmodelled signal), which is already implemented.
- For the flat prior the prior-predictive variance is already huge, so the GP will be close to zero. N3 matters mainly for PN + QNEF.
- If step 4 shows degeneracy, the honest statement is "$n_{\rm meas}$ at early start times depends on how much of the merger we ascribe to overtones". The bracket is then the result.

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
