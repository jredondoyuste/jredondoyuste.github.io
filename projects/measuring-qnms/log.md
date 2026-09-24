Newest first. One entry per working session: what was done, what was learned, and what went wrong.

### 2026-09-24 — Phase B: priors calibrated on NR; code tightened

- **Implemented** `FlatPrior` and `QNEFPrior`. All amplitudes are referenced to the merger, and $t_0$ is scanned through the time grid. $g$ uses the complex Teukolsky $B$ times $(\omega_0/\omega_n)^2$. Without that $\psi_4 \to$ strain factor, the 221 phase against NR is off by 0.57 rad; with it, by 0.01 rad.
- **Spheroidal harmonics.** Their convention against our $Y_{\ell m}$ was verified by solving the angular Teukolsky equation (residual $10^{-6}$). The 220 at $\chi = 0.68$ mixes 7% into $\ell = 3$; I had wrongly said 0.3% earlier.
- **Calibrated** $k_{\ell m}$, $f_{\ell m n}$ and the flat-prior errors on 500 SXS runs: finding F1.
- **Removed** the v1 code: old priors, circulant noise, complex design path, v1 experiments and the marimo notebook. It remains in git history (`b7cfe5f`). The package is now 608 lines, and 103 tests pass.

### 2026-09-24 — amplitude model restated

- Replaced derivations §8–10 with a single §8: the linear Bayesian model, $\iota$ fixed, mirror modes tied, a PN × complex-QNEF prior block-diagonal in $(\ell, m)$, and NR used only to calibrate the error. The Fisher proposal is withdrawn. §7 now describes the Toeplitz detector noise.

### 2026-09-24 — Pages build fixed; v1 plots retired; parametrization proposal

- The Pages build had been failing since the plan commit. GitHub Pages runs Jekyll with optional front matter, so every `.md` goes through Liquid, and a double opening brace in a LaTeX superscript broke it. Fixed, and the website's pre-commit hook now rejects Liquid delimiters (double brace, brace-percent) in markdown.
- Retired the v1 figures. [Results](#results) restarts under the v2 model, as self-contained findings.
- Proposal for the amplitude model ([derivations §10](#derivations)): parametrize by $A_{220}$, the angles $\iota$ and $\chi$, and the deviations from the predicted complex ratios. Spheroidal harmonics; mirror terms fixed by symmetry; Fisher linearization. Two QNMs give 6 parameters.

### 2026-09-24 — Phase A: complex strain, detectors, noise, $\ell \le 8$

- New `mqnm` modules, each with tests (174 pass):
  - `harmonics`: spin-weighted $Y_{\ell m}$;
  - `strain`: the complex strain as a real-linear map, with mirror modes *tied* (aligned spins), *free* (precession) or *none*;
  - `detectors`: projection onto a detector, networks, antenna patterns;
  - `psd`: O4, A+, ET-D, ET-10km, CE-40/20km from gwfast, and LISA; the covariance comes from the PSD through a Toeplitz ACF, with no wrap-around;
  - `analysis.channels`: one SVD path for everything.
- The PN ratios now use the general leading-order formula (Damour–Iyer–Nagar). It reproduces all 19 hand-typed Kidder entries to $10^{-15}$ and extends to $\ell = 8$.
- The LISA noise matches your Robson–Cornish–Liu code: per channel, it is $0.3\,S_n$.
- **Inclination check.** GW250114-like source, O4 noise on both polarizations, $\ell \le 4$, $n \le 3$, placeholder PN prior:

| $\iota$ | tied mirrors | no mirrors |
|---|---|---|
| 0.3 (face-on) | 8 channels, $s_1 = 63$ | 8, $s_1 = 63$ |
| $\pi/2$ (edge-on) | 8, $s_1 = 26$ | 8, $s_1 = 17$ |
| 2.6 (face-away) | 8, $s_1 = 57$ | **0**, $s_1 = 0.3$ |

  Face-away, the mirror terms carry the whole signal. The numbers are not results yet: the prior is still the placeholder, and Phase B replaces it.
- Added the step from the $A_{\ell mn}/A_{220}$ relation to $\Sigma_A$ at the start of [derivations §8](#derivations).

### 2026-09-24 — corrections: complex loadings, mirror modes; jaxqualin data

- Corrected per Jaime's comments. The QNEF loadings will be complex: the $|B|$ in v1 was a shortcut, not a choice. Mirror modes stay, but for aligned spins they are tied to their prograde partners by equatorial symmetry, which requires an augmented (real) parametrization ([derivations §8](#derivations), corrected in place).
- Committed the pending `mqnm` work (checkpoint 9, 86 tests). Installed jax 0.11.2 and jaxqualin 1.0.0, and vendored the jaxqualin SXS amplitude data.
- First NR numbers: the overtone relative phases are coherent (221/220: 0.28 rad), so the phases matter. The intrinsic mirror content of $h_{22}$ is about $4\times10^{-4}$. Table in [plan](#plan).

### 2026-09-24 — v2 plan; checking how $\Sigma_A$ is built

- Wrote the [plan](#plan) for the new requests: $\Sigma_A$ and jaxqualin calibration, $\ell \ne m$ up to $\ell = 8$, detector noise (O4, A+, ET, CE, LISA), sensitivity overlay, two-mode toy model, per-detector money plots, and saturation tests.
- Found that the PN + QNEF prior is rank one with real loadings, i.e. every mode is phase-locked to $A_{220}$. Compared with a diagonal prior with the same variances, it costs 1–2 channels. Fix proposed in [derivations §8](#derivations).
- Found that mirror modes are exactly degenerate with their prograde partners in a single real detector, and that the coloured-noise covariance is circulant. Both are to be fixed in Phase A.
- Added the closed-form two-mode model ([derivations §9](#derivations)).

### 2026-09-24 — project page

- Started this page. The figures are the current contents of `results/`, rendered from the PDFs.
- **Note:** the working tree has uncommitted changes. These add coloured noise (`ColoredNoise`, the aLIGO zero-detuned high-power analytic PSD, and `normalize_psd`), the combined `PNQNEFPrior`, the `detectability_vs_snr.py` experiment, and extra `test_noise_amp.py` tests. They should be checkpointed.

### 2026-09-08 — coloured noise, detectability vs SNR

- Produced `detectability_vs_snr.pdf`: flat vs PN + QNEF, white vs aLIGO, at $t_0 = 0$ and $5\,M$, against $\rho_{220}$.
- Takeaways: coloured noise costs about one channel. By $t_0 = 5\,M$ the PN + QNEF advantage is gone.

### 2026-08-29 — reboot on the Gaussian-process framing

- Rebuilt the project around $h = ZA + n$ and the whitened design matrix $\tilde Z$ (see `PLAN.md` in the repo). Checkpoints 0–8, all on the same day:
  - **0–2:** interface contracts; modes, design, noise and amplitude modules; analysis layer (whitened SVD, exact posterior with explicit means). 31 tests.
  - **3–4:** v0 experiments (singular spectra, measurability sweeps) and the marimo explorer notebook (static export at `results/qnm_explorer.html`).
  - **5:** leading-order PN multipole prior.
  - **6:** QNEF table and loader; prior-uncertainty machinery (ensemble, robust blend); PN table extended to $\ell = 6$.
  - **7:** `ExcitationOvertones` prior with the QNEF time-shift correction. 73 tests.
  - **8:** v1 complete; notebook controls for $\eta$, $v_{\rm ref}$; prior-comparison experiments.
- Negative result: marginalising a log-normal prior uncertainty is a uniform rescaling, i.e. a change of SNR ([derivations §5](#derivations)).
- Verified that the `qnm` package gives no excitation factors, only $\omega$, separation constants and mixing coefficients. QNEFs come from Berti's tables instead.
- Decisions: complex signal; quadratic modes as free-amplitude columns; a single time series with no spherical–spheroidal mixing; numpy/scipy, with mpmath optional.

### 2026-07-21 — start

- First version of `mqnm`: the effective ε-rank framing (known-frequency amplitudes, blind estimation, compression). It was superseded by the reboot above.
- Numerical lessons carried over:
  - The matrix-pencil length $L$ must stay in $[m/3, m/2]$. Below $m/3$ there is an accuracy cliff.
  - Singular values computed via the Gram matrix only resolve ratios down to about $10^{-\text{dps}/2}$.
  - A single-real-frequency ladder makes the modes nearly degenerate. Use spread real frequencies for the "overtones lost first" story.
