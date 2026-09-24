Newest first. One entry per working session: what was done, what was learned, and what went wrong.

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
