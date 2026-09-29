Findings, newest first. Unless stated, every analysis starts at $t_0 = 10\,M_f$ after the peak of $|h_{22}|$ and uses all 280 modes ($\ell \le 8$, $n \le 7$). Retired plots and superseded numbers remain in the [log](#log).

### F8 — How many 2+ and 5+ mode detections will each detector generation see? (unverified)

<figure><a href="figs/money_ladder.png"><img src="figs/money_ladder.png" alt="Expected detections, ringdown events, and 2+ and 5+ mode detections per run for O4a+b, O5, ET, CE 40 km and three LISA populations"></a><figcaption>Events per run on a log scale. Outline bar: detections (network SNR ≥ 9). Filled bar: ringdown events (SNR ≥ 8 in both the inspiral and the post-inspiral part, the LVK's pSEOBNR selection). Markers: expected numbers of ringdown events with $n_{\rm meas} \ge 4$ (2+ mode detections, squares) and $n_{\rm meas} \ge 10$ (5+ mode detections, diamonds), with 90% intervals over population draws and Poisson scatter. A complex mode is two real channels ([§12.1](#derivations)). A marker is missing when its count is below 0.1, like O5's 5+ mode detections, which no pool event reaches. The black lines on O4a+b are the observed detections (190 BBH with FAR &lt; 1/yr) and the observed ringdown events (21 analysed with pSEOBNR). Ground: GWTC-5 BP2P with a Madau–Dickinson redshift history (draws whose rate falls after the peak). LISA: Klein+16 catalogues. Runs: O4a+b 0.891 yr of real two-detector time and real noise; O5 = LIGO A+ design curve, 2 yr; ET and CE 40 km 1 yr; LISA 4 yr. All choices are in [§12](#derivations).</figcaption></figure>

| run | detections (SNR ≥ 8) | ringdown events | 2+ mode ($n_{\rm meas} \ge 4$) | 5+ mode ($n_{\rm meas} \ge 10$) |
|---|---|---|---|---|
| O4a+b, 0.891 yr | 329 [283, 377] | 54 [41, 69] | 2.9 [0, 6] | 0 (no pool event) |
| O5 (A+), 2 yr | 4960 [3740, 6330] | 882 [734, 1037] | 55 [39, 75] | 0 (no pool event) |
| ET, 1 yr | $8.4\times10^4$ [$2.7\times10^4$, $1.9\times10^5$] | $2.4\times10^4$ | 7900 [3000, 16000] | 29 [16, 47] |
| CE 40 km, 1 yr | $8.9\times10^4$ [$2.6\times10^4$, $2.1\times10^5$] | $2.8\times10^4$ | 8500 [2900, 19300] | 39 [17, 76] |
| LISA popIII, 4 yr | 192 | 7.3 [3, 12] | 7.3 [3, 12] | 6.9 [3, 11] |
| LISA Q3-d, 4 yr | 32 | 29 [20, 38] | 28 [20, 37] | 26.5 [18, 35] |
| LISA Q3-nod, 4 yr | 474 | 387 [354, 419] | 365 [334, 396] | 245 [219, 271] |

**Takeaway.**

- **O5 should see 55 [39, 75] 2+ mode detections in 2 yr.** O4a+b expects 2.9 [0, 6], consistent with the one observed (GW250114). No ground detector before the next generation reaches five modes.
- **ET and CE 40 km give 30–40 5+ mode detections a year**, and thousands of 2+ mode detections. The factor 5–10 width of their intervals comes from the uncertain high-redshift rate.
- **LISA's heavy-seed populations measure five or more modes in almost every ringdown it sees.** Light seeds (popIII) give a handful, because their ringdowns mostly lie above the LISA band.
- **Against observations:** O3 matches (detections 57 vs 59, ringdown events 11 vs 10, two-mode events 0.4 vs 0). O4a+b predicts 1.24× the observed detections and 2.6× the ringdown events; the excess most likely comes from the LVK's stricter O4 ringdown selection ([§12.6](#derivations)).

**Reproduce.** `python tasks/t07-population-counts/S7/counts.py <pools> <GWTC-5 MD hyperposterior> gwtc5md S7 <loud pools>`, then `S7/figures.py <pools> S7/counts_gwtc5md.json S7`, with the `mqnm` package. The pools come from `S7/submit_s7.sh` and `S7/submit_loud.sh`.

### F7 — Does the count depend on how the noise covariance is built? (unverified; to be rerun)

> **To be rerun** with the current amplitude prior. The numbers below used the earlier prior.

We changed one choice at a time in the covariance of [§7](#derivations), for the GW250114-like source (O4, CE 40 km, ET) and a $10^6\,M_\odot$ LISA source at $z = 1$: the time step ($0.05$, $0.1$, $0.2\,M$), the PSD above its table, the frequency resolution of the ACF, and the noise below $f_{\rm low}$.

- **No numerical choice moves $n_{\rm meas}$ by more than one channel**, at the source or at $\rho_{220} = 100$ and $1000$.
- **The analysis bandwidth is the one choice that matters.** Cutting at 4096 Hz costs ET two channels (14 → 12), because the damped overtones have broad spectra. We keep the full Nyquist range of the $0.1\,M$ grid.
- **The noise below $f_{\rm low}$ has no correct value.** More noise there lowers every channel strength by 1–2% per decade without converging. We hold the PSD flat there, a mildly optimistic default.
- The covariance passes checks against white noise, direct quadrature and simulated coloured noise; a doubled covariance is rejected at more than 100σ (the control).

**Reproduce.** `python tasks/t08-detector-noise/S2/sweep.py` and `S1/acf_checks.py`, with the `mqnm` package.

### F6 — How does the count depend on the start time? A non-modal GP

> **Withdrawn (2026-09-25).** This version kept in the signal only the modes NR can extract (about 40), while the goal is the maximum out of the full mode set. It found that with a GP for the non-modal content, $n_{\rm meas}$ stops growing as $t_0$ moves before 10 M. The GP is being rebuilt from 434 SXS runs ([§10](#derivations)), and the start-time study will be remade with it.

### F5 — Two-mode toy model: what 0, 1 and 2 measurable channels look like

<figure>
<a href="figs/toy_two_modes.png"><img src="figs/toy_two_modes.png" alt="Prior and posterior ellipses of two real amplitudes for three SNRs, flat prior on top and correlated prior below"></a>
<figcaption>Prior (dashed, 1σ and 2σ) and posterior (filled, 1σ and 2σ) of two real amplitudes $(a_1, a_2)$ for per-mode SNR $\rho = 0.2, 2, 8$ (columns). The data overlap is $c = 0.864$, the 220–221 value at $\chi_f = 0.686$. Top: flat prior. Bottom: correlated prior, $r = 0.8$. The star is the true value, and each panel gives the channel strengths $s_\pm$, with $s_\pm^2 = \rho^2 (1 \pm r)(1 \pm c)$ exactly ([derivations §9](#derivations)).</figcaption>
</figure>

**Takeaway.**

- **Flat prior:** no channel at $\rho = 0.2$; one at $\rho = 2$ (the sum $a_1 + a_2$); both at $\rho = 8$. Resolving two overlapping damped modes needs $\rho > 1/\sqrt{1 - c} = 2.7$.
- **Correlated prior:** the prior already ties $a_1$ to $a_2$, so resolving the difference needs $\rho > 6.1$. At $\rho = 2$ the posterior is compact with only one measurable channel: $n_{\rm meas}$ counts what the *data* teach us.

**Reproduce.** `python -m mqnm.experiments.toy_two_modes`.

### F4 — Does the number of channels saturate as modes are added?

<figure>
<a href="figs/saturation.png"><img src="figs/saturation.png" alt="Measurable channels versus the highest overtone (left) and the highest harmonic (right) included in the model, for three values of the 220 SNR, flat prior on top and PN plus QNEF prior below"></a>
<figcaption>$n_{\rm meas}$ (real channels) for nested mode sets: left, overtones $n \le n_{\max}$ with all $\ell \le 8$; right, harmonics $\ell \le \ell_{\max}$ with all $n \le 7$. GW250114-like source (equal mass, $\chi_f = 0.686$, $\iota = 0.78$), CE 40 km, from $t_0 = 10\,M_f$. Shades: $\rho_{220} = 30, 300, 3000$. Top: flat prior, with its scale fixed so that the full model has the same expected total SNR as the PN + QNEF prior. Bottom: PN + QNEF prior.</figcaption>
</figure>

**Takeaway.**

- **Overtones saturate early:** with the PN + QNEF prior the count stops at $n_{\max} = 1$–2 (one more channel at $n_{\max} = 4$ for $\rho_{220} = 300$). From $10\,M$ the higher overtones have decayed below reach.
- **Harmonics saturate with the PN + QNEF prior** (by $\ell_{\max} = 2$ at $\rho_{220} = 30$, by 6 at 3000), **but grow linearly without limit under a flat prior.** Saturation comes from the physical amplitude hierarchy, not from the noise.

**Reproduce.** `python -m mqnm.experiments.saturation`.

### F3 — How many channels can be measured? Per detector, vs SNR and redshift

<figure>
<a href="figs/measurability.png"><img src="figs/measurability.png" alt="Measurable channels versus the 220 SNR and versus redshift for O4, A+, ET, Cosmic Explorer and LISA, flat prior on top and PN plus QNEF prior below"></a>
<figcaption>$n_{\rm meas}$ (real channels; each complex mode amplitude has two, so the 220 alone counts as 2) from $t_0 = 10\,M_f$, every mode $\ell \le 8$, $n \le 7$. (a, d) Against the 220's expected optimal SNR $\rho_{220}$, for the GW250114-like source (LISA: $10^6\,M_\odot$ at $z = 1$). (b, e) The GW250114-like source moved in redshift; the grey line is GW250114 ($z = 0.086$). (c, f) LISA remnants of $10^5$ (dotted), $10^6$ (solid) and $10^7\,M_\odot$ (dashed) against their redshift. Top: flat prior with the same expected total SNR as the PN + QNEF prior. Bottom: PN + QNEF prior. In (a, d) CE 40 km (dashed) coincides with O4, and LISA (dashed) with ET: the count depends only on $\rho_{220}$ and on whether one or both polarizations are seen. Networks: O4 and A+ as two co-aligned LIGO detectors (one polarization); ET as a triangle of three 60° interferometers; CE as a single L; LISA as the A and E channels. The source is overhead, $\psi = 0$.</figcaption>
</figure>

**Takeaway.**

- **GW250114 at its distance, PN + QNEF prior:** O4 5, A+ 6, CE 20 km 8, CE 40 km 9, ET 12 real channels: the 220 plus 3 (O4) to 10 (ET).
- **Growth with SNR is roughly logarithmic:** 2 channels at $\rho_{220} = 10$, 6 at 100, 12–16 at 1000, 22–28 at $10^4$. Networks that see both polarizations (ET, LISA) pull ahead above $\rho_{220} \approx 500$.
- **Third-generation detectors keep 4–6 channels out to $z \sim 5$**; O4 and A+ drop to the 220 alone by $z \approx 1$. **LISA** keeps about 20 channels for a $10^6\,M_\odot$ remnant from $z \approx 1$ to 10.
- **At equal total SNR, a flat prior gives 3–5× more channels** (O4 19, ET 56). The count depends strongly on what we know about the amplitudes.

**Caveats.** Overhead source, co-located detectors, untied-overtone scale $a = 1.30$ (now 1, [§8](#derivations)). The prior under-covers (3,2) and (4,3) and over-covers (3,3) (F1). Channels are combinations of amplitudes, not named modes.

**Reproduce.** `python -m mqnm.experiments.measurability`.

### F2 — A GW250114-like ringdown against the detector sensitivities

<figure>
<a href="figs/sensitivity_overlay.png"><img src="figs/sensitivity_overlay.png" alt="Characteristic strain of the real SXS:BBH:0180 ringdown and of QNEF prior draws against O4, A+, ET and Cosmic Explorer (left) and against LISA for a million-solar-mass remnant at redshift 1 (right), from 10 M after the peak"></a>
<figcaption>Characteristic strain $2f\,|\tilde h_+(f)|$ of the ringdown against the noise amplitude $\sqrt{f S_n(f)}$ (Moore, Cole &amp; Berry convention: both dimensionless, and $\rho^2 = \int (2f|\tilde h|/\sqrt{fS_n})^2\,d\ln f$), from $t_0 = 10\,M_f$. Black: the SXS:BBH:0180 strain (equal mass, non-spinning, $\chi_f = 0.686$; all harmonics $\ell \le 8$, $m \ne 0$; $\iota = 0.78$). Grey: 5–95% band of 200 draws of every mode ($\ell \le 8$, $n \le 7$) from the PN + QNEF prior conditioned on the fitted 220. Panel titles give the detector-frame remnant mass, spin and luminosity distance. (a) GW250114 scaling. (b) $M_f = 10^6\,M_\odot$ in the source frame at $z = 1$, one LISA channel. $h_+$ for $F_+ = 1$; ET and LISA (60° interferometers) at their best orientation. The signal curves stop at $2.5f_{220}$ (625 Hz; 0.021 Hz for LISA): above it the spectrum is the window edge, not ringdown content. Optimal single-detector SNR of the NR strain from $10\,M$ (full band): O4 22, A+ 41, ET 187, CE 20 km 223, CE 40 km 326, LISA 2789.</figcaption>
</figure>

**Takeaway.**

- The prior band brackets the real strain.
- Optimal SNRs from $10\,M$: O4 22, A+ 41, ET 187, CE 20 km 223, CE 40 km 326; LISA about 2800 per channel. From the peak, O4 gets 35, in line with the LVK's network value of about 40 post-merger.
- Above $2.5f_{220}$ the spectrum is the flat tail $|h(t_0)|/\pi$ of a signal switched on at $t_0$ (it drops 20-fold with a $2\,M$ taper). It holds 1.3–1.9% of $\rho^2$.
- *Correction (2026-09-28):* earlier versions drew the noise curves off by $\sqrt f$; the SNRs were always correct.

**Reproduce.** `python -m mqnm.experiments.sensitivity_overlay`.

### F1 — Do the calibrated priors cover NR?

<figure>
<a href="figs/prior_vs_nr.png"><img src="figs/prior_vs_nr.png" alt="Prior-predictive amplitude ratios per mode, modulus and phase, for the PN plus QNEF prior and the flat prior, against NR on held-out runs"></a>
<figcaption>Amplitude ratios $C_j/C_{220}$ at the merger, (a) modulus and (b) phase. For each SXS run the prior is conditioned on that run's own 220 and predicts the ratio; violins pool these predictions over runs. Blue: the PN + QNEF prior (1PN at the run's own $v_{\rm peak}$, four calibrated numbers, [derivations §8](#derivations)). Orange: the flat prior (every mode independent with the 220's scale; its phase is uniform and not shown). Dots: NR (jaxqualin). Only the 150 runs held out of the calibration are used, so the prior never saw these data.</figcaption>
</figure>

**Takeaway.**

- **The PN + QNEF prior tracks NR mode by mode.** 1σ coverage of $|C_j/C_{220}|$ (target 68%): 221 87%, 440 70%, 550 74%, 660 68%, 211 62%, 210 59%. The flat prior covers 0–2%.
- **One pooled error $e$ is too wide for (3,3)** (99%) **and too narrow for (3,2) and (4,3)** (41%, 37%). NR's (3,3) sits at 1.9× the 1PN prediction ([§8](#derivations)).
- **Phases:** the 221 is tight and matches NR. The 210, 211 and 331 sit 0.5–1 rad off the prior's mean; for the 320, 440 and 660, NR splits into two groups the prior does not resolve.

**Reproduce.** `python -m mqnm.experiments.prior_vs_nr`.
