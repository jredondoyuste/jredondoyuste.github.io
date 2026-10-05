Newest first. One entry per working session: what was done, what was learned, and what went wrong.

### 2026-10-05 — all tasks closed; paused for review

- The money-plot task is closed: every figure has a result record with its numbers, the command that made it, and its provenance.
- The code was tidied for reading (shorter comments and docstrings, no behaviour change: tests and a numerical comparison agree) and pushed.
- Plan closed: eight tasks done; the GP kernel, the noise ladder and the overtone-vs-non-modal comparison are dead ends; the sky-position, quadratic-mode, 3G and LISA-TDI follow-ups are not pursued for now.
- Next: a week of reading the code and thinking it through before deciding what comes next.

### 2026-10-05 — results redone at $a = 1$; counts now in modes

- **Counts are now in modes**, $n_{\rm meas} = \lfloor n_{\rm ch}/2 \rfloor$: each mode amplitude has two real channels, and a mode counts once both are measured. Earlier entries and figures counted real channels. The channel counts themselves did not change. GW250114 from $10\,M$: O4 4 → 2 modes, ET 10 → 5, CE 40 km 9 → 4.
- F1–F4, F7 and F8 redone at the current prior ($a = 1$, was 1.30). The old F3 numbers (O4 5, CE 40 km 11, ET 14 channels) were at $a = 1.30$. F3 now also shows the start times $t_0 = 0, 5, 10, 15\,M$.
- F7 rerun: the claim that a 4096 Hz band limit costs ET two channels no longer holds (10 vs 10). It costs O4 and CE 40 km one channel each, which is not a mode.
- New results F9 (the order in which modes enter, and what each is made of), F10 (which amplitudes the data pin down), F11 (flat vs PN × QNEF prior) and F12 (events per run with at least $k$ modes).
- New colours, one per detector, shared by every figure.

### 2026-09-29 — page compacted and re-synced

- Derivations shortened by about half. §10 now describes the current GP training (434 SXS runs, the base kernel, its early under-coverage); the first GP's calibration is marked superseded. §8 gives the adopted numbers once, including $a = 1$ and the NR bound $a \le 0.38$. §12's population choices are unchanged.
- Results: F6 (withdrawn) and F7 (to be rerun with the current prior) reduced to short entries; the other takeaways tightened, with no number changed.
- Plan and overview re-synced with the tasks: seven tasks (three done, four active), the noise-ladder steps, and two new dead ends (the overtone power budget, the $n_{\rm meas}$ emulator). Resolved open threads removed: the 221 bias is fixed by $\kappa$, and the +0.53 error correlation was withdrawn.

### 2026-09-29 — population counts: F8 and §12

- New result F8: expected detections, ringdown events, and 2+ and 5+ mode detections ($n_{\rm meas} \ge 4$, $\ge 10$: a complex mode is two real channels) for O4a+b, O5, ET, CE 40 km and LISA. Full choices in [§12](#derivations).
- Final population: GWTC-5 BP2P with the Madau–Dickinson redshift fit, keeping only draws whose rate falls after the peak (42% of draws rise to $z = 20$ and would give ET millions of events). LISA: Klein+16.
- Runs: O4a+b uses its real noise and 0.891 yr of two-detector time. O5 is the A+ design curve at 2 yr: the LVK has not yet fixed O5's length or start, and a six-month intermediate run (IR1) begins in November 2026. ET and CE run 1 yr, LISA 4 yr.
- Amplitude prior at the untied-overtone scale $a = 1$ (was 1.30). Under GWTC-4, $N(n_{\rm meas} \ge 10)$ for ET drops from 57 to 47 a year.
- Loud-event pools, stratified by network SNR, resolve the high-$k$ tails. Every hyperposterior draw passes the effective-sample-size check.
- Against observations: O3 matches (detections 57 vs 59, ringdown events 11 vs 10, two-mode 0.4 vs 0). O4a+b predicts 1.24× the observed detections and 2.6× the ringdown events. The network-SNR shape matches the catalogue, so the excess most likely comes from the LVK's O4 ringdown selection. We report it and do not tune it away.

### 2026-09-28 — F2 cut moved to $2.5f_{220}$

- The F2 signal curves now stop at $2.5f_{220}$ (625 Hz; 0.021 Hz for LISA); 1.3–1.9% of $\rho^2$ lies above. Panel titles give $M_f$, $\chi_f$ and $D_L$.

### 2026-09-28 — F2 signal curves cut at $3f_{220}$

- F2 now stops the NR strain and the prior band at $3f_{220}$ (750 Hz; 0.026 Hz for LISA), where the window-edge plateau takes over. The noise curves keep the full range, and the SNRs are unchanged (0.8–1.2% of $\rho^2$ lies above the cut).

### 2026-09-28 — the flat tail in F2 is the window start

- The flat high-frequency tail of the corrected F2 comes from starting the signal abruptly at $10\,M$: its level matches $|h_+(t_0)|/\pi$ to 2%, the pure-QNM prior draws show it too (so it is not NR resolution noise), and a 2 M taper removes it. It carries at most 1% of $\rho^2$ (O4 1%, ET and CE below 1%). The entry below overstated its weight for ET and CE.

### 2026-09-28 — F1–F3 redrawn as final figures; F2 axis correction

- **F1** now uses only the 150 runs held out of the calibration, shows the PN + QNEF and flat priors side by side, and adds the (4,3). The coverage numbers moved from the plot to the text.
- **F2 correction.** Earlier versions drew $2\sqrt f\,|\tilde h_+|$ against $\sqrt{fS_n}$, which put the noise curves off by $\sqrt f$ relative to the signal (about 16× too high at 250 Hz, 10× too low in the LISA band). The plot now uses $2f|\tilde h_+|$ against $\sqrt{fS_n}$. The SNRs were computed correctly and are unchanged. The corrected plot shows a flat strain spectrum above about 500 Hz, which comes from the sharp start of the analysis window; for ET and CE it lies above the noise up to 5 kHz. How much of their SNR it carries is not yet quantified.
- **F3** adds LISA remnants of $10^5$ and $10^7\,M_\odot$. The $10^5\,M_\odot$ count rises again beyond $z \approx 3$; at its frequencies our long-wavelength LISA response is not accurate.
- Fixed in the code: the LISA noise model returned NaN above about 3 Hz (only reached by light sources).

### 2026-09-27 — new amplitude prior in the code; figures remade

- **The four-number prior is now the code's prior.** Each binary takes its own $v = (M\Omega_{\rm peak})^{1/3}$ from the SEOBNRv4 NR fit of the peak frequency (Bohé et al., arXiv:1611.03703), which matches 280 SXS runs to 0.56% rms in frequency. Refitted in the code: $e = 1.95$, $f = 0.34$, $a = 1.30$, $\kappa = 0.77$. The non-modal GP was refitted with it ($\lambda_e = 2.21$, $\tau = 4.0\,M$). [Derivations §8, §10](#derivations).
- **Figures F1–F4 and F6 remade.** The 221 is now covered 88% of the time at 1σ (26% before). The counts for GW250114 at its distance drop by two channels in 3G detectors (CE 40 km 11 → 9, ET 14 → 12, LISA 25 → 22); O4 and A+ are unchanged (5, 6). The flat-prior counts are unchanged, as they should be.
- **Found:** with 1PN at $v_{\rm peak}$, NR's (3,3) sits at 1.9× the prediction (1.03 at leading order and $v = 0.7$). The pooled $e$ absorbs it, so (3,3) is over-covered and (3,2), (4,3) under-covered.
- **Not yet redone:** the noise-covariance sweep (F7) and the 30-run strain coverage table in F1 still use the earlier prior.

### 2026-09-27 — amplitude prior settled on four numbers; overtones or unmodelled effects?

- **Amplitude prior.** We use PN at 1PN (resummed), evaluated at each binary's own velocity $v = (M\Omega_{\rm peak})^{1/3}$, like $\eta$. The QNEF overtone ratios stay, and only four numbers are calibrated on NR: $e = 1.91$ (fundamentals), $f = 0.34$ (overtones), $a = 1.34$ (zero-mean overtones) and $\kappa = 0.77$ (the 221). On 150 held-out runs this beats the old 16-number tables by 2.6 in log density per run. The 221 is covered 88% of the time at 1σ, where it was 27% before. (3,3) is over-covered, and (3,2) and (4,3) are under-covered. $a$ is not constrained by the catalogue. Rewrote [derivations §8](#derivations).
- **Per-run $v$ against a fixed $v$.** They tie (−0.03 ± 0.05 per run), because $v_{\rm peak}$ only spans 0.54–0.58.
- **Next.** Replace $a$ with a power budget for the invisible overtones, estimated from jaxqualin fits extrapolated back to the peak. A brainstorm on how to tell "overtones" from "unmodelled effects" is in [derivations §11](#derivations). The two readings put the same power in the signal or in the noise, so they bracket $n_{\rm meas}$.

### 2026-09-27 — detector noise checked; slice-GP prior dropped

- **Detector noise (F7).** The PSD-to-covariance construction is correct, and no numerical choice in it moves $n_{\rm meas}$ by more than one channel. We fixed two details in the code: the ACF now uses a frequency grid fine enough to resolve the steep PSD just above $f_{\rm low}$ (a 2.7% error in the O4 variance), and the PSD tables continue as a power law above their end instead of a flat hold. No published count changes. We keep the full Nyquist range: a 4096 Hz band limit would cost ET two channels. Rewrote [derivations §7](#derivations).
- Deferred from that task: whether $n_{\rm meas}$ depends on $\rho_{220}$ alone across 3G sensitivities (waits on which CE curve version to use), and LISA with the exact TDI response for lighter sources.
- **Amplitude prior.** The GP on a hyperboloidal slice is dropped (see the [plan](#plan), dead ends). We finish the PN × QNEF model with the fewest parameters that fit.
- **Populations.** The population samplers are done (GWTC-4 for the ground, the Klein et al. 2016 catalogues for LISA). The fast emulator of $n_{\rm meas}$ fails its accuracy check: the count depends on the orbital phase, which the emulator ignored. The fix is under way.

### 2026-09-26 — four new tasks

- **The GP kernel becomes its own task.** It trains on the whole filtered SXS catalogue (448 runs), not 30. We extracted the strain to $\ell = 8$ on $-10$ to $60\,M$ and the difference between the two highest resolutions. The median resolution error of $h_{22}$ is $5 \times 10^{-4}$ of its amplitude (90th percentile $3.5 \times 10^{-3}$). Five runs whose second resolution merges 100–600 M later are left out of the resolution term.
- **Amplitude prior, two models.** (A) PN × QNEF with calibrated errors; (B) a GP for the perturbation on a hyperboloidal slice, projected on the QNM eigenfunctions. What the current prior gets wrong: the $\ell = m \ge 4$ and (4,3) fundamentals sit at 0.2–0.4 of leading-order PN at $v = 0.7$; the zero-mean overtone scale carries about 80% of the prior energy at $t_0 = 0$; the 221 is covered 27% of the time. Held out on 150 runs, the 1PN-resummed variants win by a wide margin; the fitted $v$ is 0.544 with the 1PN factor and 0.361 without, and a per-run $v$ adds nothing.
- **Model B** needs a mean profile: zero-mean, it is far too broad for NR's $C_{221}/C_{220}$.
- **Populations.** A new task counts events, $\rho_{220}$ and $n_{\rm meas}$ per detector over astrophysical populations, with error bars, and tests the counts against O3.
- **Detector noise.** A new task audits the noise covariance (F7 above).

### 2026-09-26 — scope decisions; amplitude-prior task started

- **Dropped:** very large mode sets ($10^4$–$10^5$ modes). The noise ladder keeps all 280 modes ($\ell \le 8$, $n \le 7$).
- **Added as later work:** the quadratic 220×220 mode in the signal model.
- **New task:** the amplitude prior $\Sigma_A$ from theory, lightly calibrated on NR. The plan is not written yet.
- Raised for discussion: cleaning up the NR calibration, and the choice of GP kernel.
- Read two more papers by Dyer and collaborators (arXiv:2510.13954, 2606.25021) next to 2510.11783, to compare with our GP kernel. Their GP models NR resolution error, not non-modal content; the closest they come to non-modal early content is a deterministic direct-wave term. None is used yet ([references](#references)).
- The project moved to a new layout; the code is unchanged.

### 2026-09-25 — F6 withdrawn

- Restricting the signal to jaxqualin-extractable modes conflicts with the goal. The signal must be a very large mode set, so that $n_{\rm meas}$ reflects the data and not our truncation. The non-modal GP will be redone on top of that.

### 2026-09-25 — non-modal GP; the count no longer depends on the start time

- Diagnosis: with every overtone in the signal, the prior *over*-predicts the early residual (5% of predicted at $t = 0$). The unseen overtones act as free absorbers of non-modal content and count as channels.
- New model (§10): the signal keeps the trusted modes; everything else is a GP in the noise. The two-term kernel is fitted by maximum likelihood on SXS (2,2) residuals: $\lambda_e = 3.1$, $\tau = 3.9\,M$, $\lambda_l = 0.14$, $\ell_c = 11\,M$. Pooling across harmonics failed (the fit runs to its bounds), so the kernel is calibrated on (2,2) only.
- F6: with the GP, $n_{\rm meas}$ is flat for $t_0 \lesssim 10$–15 M (O4 4, CE 40 km 8, ET 10). Without it, O4 reaches 12 and ET 25 at $t_0 = 0$.
- F5: the left column is now at $\rho = 0.2$, where the posterior is the prior.

### 2026-09-25 — no QNEF extrapolation; e and f checked; toy model; plan redrawn

- **(i) No extrapolation.** Excitation factors are used only inside their tables ($\ell \le 7$, $n \le 3$). Everything else takes the zero-mean model; for $\ell = 8$ its scale uses the median tabulated $|g_{\ell m 1}|$. Recalibrated $a$ and regenerated the figures.
- **(ii) Not double counting.** $e$ and $f$ are errors on different ratios. In NR the overtone-to-220 scatter matches or slightly exceeds $\sqrt{e^2 + f^2 + e^2 f^2}$, because the two errors are positively correlated for (3,3) (+0.53). Table in [derivations §8](#derivations).
- **(iii) Toy model rewritten**, with the exact channel strengths $s_\pm^2 = \rho^2(1 \pm r)(1 \pm c)$ and a figure (F5).
- **(iv) Read Dyer & Moore (arXiv:2510.11783).** Same linear-Gaussian QNM framework, applied to NR. Their GP kernel for model error is the natural route to starting before 10 M. Notes in the [plan](#plan).

### 2026-09-24 — items 6 and 8: channel counts per detector, and saturation

- **F3:** $n_{\rm meas}$ against $\rho_{220}$ and redshift for O4, A+, ET, CE and LISA, flat prior (same total SNR) against PN + QNEF. GW250114 at its distance: O4 5, A+ 6, CE 20 km 10, CE 40 km 11, ET 14 real channels.
- **F4:** overtones saturate at $n_{\max} = 2$ from $10\,M$. Harmonics saturate under PN + QNEF (by $\ell = 4$–6) and never under the flat prior.
- F1 now quotes 1σ coverage. The 221 drops to 26%, a tight bias the 90% number hid.
- New code: `detectors.colocated`, `experiments/setups.py` (shared source and networks), `measurability.py`, `saturation.py`.

### 2026-09-24 — default start 10 M; findings renumbered

- The default analysis start is now $10\,M_f$. How to do better at earlier times is an open item in the [plan](#plan).
- Retired the old F1 (the calibration scatter). The old F2 is now **F1** and the old F3 is now **F2**, both redrawn in publication style from $10\,M$. The earlier log entries use the old numbering.

### 2026-09-24 — zero-mean overtones calibrated on the total strain; start time

- Following your suggestion, overtones jaxqualin does not see now have zero mean and are independent, with scale $a\,|g_{\ell m 1}|\,\sigma_{\ell m}$. $a = 1.41$ is fitted to the residual power of 30 SXS strains from $5\,M$. A QNEF-shaped variance ($\propto |g_{\ell m n}|$) failed: the per-run $a$ was strongly anticorrelated with spin. Details in [derivations §8.3](#derivations).
- **Coverage of the NR strain versus start time** (F2): the prior predicts about 1.8× too much $h_{22}$ at 5–10 M, mostly from the jaxqualin overtones quoted back at the peak, and is consistent from about 10 M. **Recommendation: 10 M as the default start, with 5 M as an optimistic variant.**
- F3 now draws every mode ($\ell \le 8$, $n \le 7$), from 5 M and 10 M.

### 2026-09-24 — real SXS injection; strain-level calibration of $n \ge 2$ does not work as posed

- Installed `sxs`; `mqnm.nr` loads an SXS strain with $t = 0$ at the peak of $|h_{22}|$ and fits the 220 from its tail. For SXS:BBH:0180, $|C_{220}| = 0.961$ against jaxqualin's 0.984. F3 now injects the real strain: O4 ρ = 35 from the peak, in line with LVK's ~40.
- **Tried** calibrating one error $f$ for all overtones without jaxqualin data, by matching the prior-predicted and observed residual power of the NR strain (all $m > 0$ harmonics), conditioned on the fitted 220. Results for SXS:BBH:0180, $\ell \le 8$, $n \le 7$:

| $t_0$ | observed residual | predicted ($f = 0$) | $f$ |
|---|---|---|---|
| 0 | $3.6\times10^6$ | $3.7\times10^6$ | 0 |
| 5 | 5.1 | 5.0 | 0.04 |
| 10 | 0.059 | 0.033 | 0.49 |
| 20 | 0.0063 | 0.0021 | 12 |

  (The NR strain power is about 10.) At early $t_0$ the residual is dominated by the prior *mean*, since the QNEF-predicted $n \ge 2$ overtones diverge at the peak, so the second moments match trivially. At late $t_0$ those overtones have decayed, and $f$ absorbs unrelated residuals. **An error alone cannot calibrate these modes.** Options are in the chat; the code was removed until one is chosen.

### 2026-09-24 — why F3's SNR (120) disagrees with LVK's (~40)

- The injected "NR" signal is the jaxqualin QNM fit evaluated from the peak. The fitted amplitudes are back-extrapolated, so at $t = 0$ they sum to $|r h_{22}/M| = 3.8$, against about 0.4 for the real SXS peak. The O4 optimal SNR drops from 120 ($t_0 = 0$) to 37 ($5\,M$) and 29 ($10\,M$). Antenna patterns and the network matter less: the sky-averaged two-detector value is about 100, from the same injection. The next step is to inject the real SXS strain (the `sxs` package).

### 2026-09-24 — sensitivity overlay (F3)

- GW250114-like NR ringdown (SXS:BBH:2085) plus conditioned QNEF prior draws against O4, A+, ET-D, CE and LISA. See [results](#results).
- **Bug caught.** The first render drew prior samples about 16× too large. I had conditioned on mode index 0 as if it were the 220, but `build_mode_set` starts at (2,1,0). Fixed in the script; the F2 check was not affected (it places the 220 explicitly).
- Added `units.luminosity_distance` (Planck 2018).

### 2026-09-24 — prior predictive check (F2)

- Conditioned both priors on each SXS run's own 220 and compared the predicted $C_j/C_{220}$ with NR. The QNEF prior is calibrated for 221, 330, 331, 210 and 211, but not for 320, 440, 550 and 660, where PN is *biased* rather than noisy. The flat prior is miscalibrated almost everywhere. Open question: calibrate a bias as well as a scatter?

### 2026-09-24 — prior conditioned on the observing angles

- Your correction: the relation should run through the 220, $C_{\ell m n} = g\, w\, A_{220} + \epsilon$. I had averaged over the azimuth, which made different $m$ independent and lost the fact that $|C_{330}|$ tracks $|C_{220}|$. Now $(\iota, \varphi)$ are fixed, like the masses and spins from an IMR fit; $w$ is the complex PN ratio, and every mode couples through $A_{220}$ ([derivations §8](#derivations)).
- **NR check.** The frame-independent phase $\arg C_{\ell m 0} - \tfrac m2 \arg C_{220}$ is coherent for $(2,1)$, $(3,3)$ and $(4,3)$ (0.2–0.5 rad scatter), and much less so for $(4,4)$, $(5,5)$ and $(3,2)$. PN predicts the 330 phase to $-0.19$ rad.
- **Bug caught.** While rotating NR runs into the PN frame, I first used the phase of $h_{22}/h_{22} = 1$ instead of $h_{22}$ itself, which shifted every $m = 3$ residual by $\pi/2$. Fixed; `pn_mode` is now exposed.
- F1 re-run with complex fundamental errors. 106 tests pass.

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
