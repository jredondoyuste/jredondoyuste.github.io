Findings under the v2 model (complex strain, tied mirror modes, detector noise), newest first. The v1 plots were retired on 2026-09-24; their numbers remain in the [log](#log).

Each finding is self-contained:

- **Question**: what the figure is meant to answer.
- **Figure**: click to open it at full size.
- **Takeaway**: the one or two sentences to remember.
- **Setup**: source, detector, prior, mode content.
- **Reproduce**: script and commit.

### F3 — A GW250114-like ringdown against the detector sensitivities (2026-09-24)

<figure>
<a href="figs/sensitivity_overlay.png"><img src="figs/sensitivity_overlay.png" alt="Left: characteristic strain of a GW250114-like ringdown from NR, the 220 alone, and QNEF prior draws, against O4, A+, ET-D, CE 40 km and CE 20 km sensitivities. Right: the same amplitudes for a million-solar-mass remnant at redshift 1 against LISA"></a>
<figcaption>$2\sqrt f\,|\tilde h_+(f)|$ against $\sqrt{f S_n(f)}$ (Moore, Cole &amp; Berry convention: the area between the curves sets the SNR). Black: the ringdown from the merger on, with the QNM amplitudes that jaxqualin extracted from SXS:BBH:2085 (equal mass, $\chi_f = 0.684$, the run closest to GW250114); dashed: its 220 alone. Grey: 40 draws from the QNEF prior conditioned on that 220 ($\ell \le 5$, $n \le 1$, the same overtone content as the NR fit). $h_+$ for $F_+ = 1$; the 60° interferometers (ET, LISA) are shown as $\sqrt{f S_n}/\sin 60°$, their best orientation. ρ is the optimal single-detector SNR of the NR signal.</figcaption>
</figure>

**Question.** How does a GW250114-like ringdown sit against current and future detectors, and do our prior's amplitudes look like the real ones?

**Takeaway.**

- The prior draws bracket the NR signal: their rms strain is 0.8–1.5× NR at the merger and 0.7–0.9× NR at $t_0 = 10\,M$.
- Below the peak and above about 600 Hz, the full signal sits well above the 220 alone. That is the 221 (4.3× the 220 at the merger) plus the sharp start at $t = 0$; see the caveats.
- Optimal single-detector SNRs: O4 120, A+ 217, ET-D about 1000, CE 20 km about 1300, CE 40 km about 1900. For a $10^6\,M_\odot$ remnant at $z = 1$, LISA gets about $1.5\times10^4$ per channel.

**Caveats.**

- ρ is an optimal-orientation, from-the-merger number. LVK quote a network SNR of about 40 post-merger for GW250114; real antenna patterns and a later start both lower ours.
- Starting the signal abruptly at $t = 0$ adds broadband power: the $\sqrt f$ rise at low frequency and the slow fall-off at high frequency.
- $\varphi$ (the azimuth) is unknown and set to 0. $\iota = 0.78$ is the folded value.
- $D_L = 405$ Mpc comes from $z = M_f^{\rm det}/M_f - 1 = 0.086$ (Planck 2018); other sources quote about 440 Mpc.
- Draws with $n = 2$ (not calibrated by NR) overshoot NR by about 3× at the merger, so they are left out here.

**Setup.** GW250114: $m_{1,2} = 33.6, 32.2\,M_\odot$, $M_f^{\rm det} = 68.1\,M_\odot$, $\chi_f = 0.68$ (arXiv:2509.08054, 2510.01001); $\iota = 0.78$ (arXiv:2509.08099).

**Reproduce.** `python -m mqnm.experiments.sensitivity_overlay`.

### F2 — Do the calibrated priors actually cover NR? (2026-09-24)

<figure>
<a href="figs/prior_vs_nr.png"><img src="figs/prior_vs_nr.png" alt="Violins of the prior-predictive amplitude ratio per mode for the QNEF and flat priors, with NR values as grey dots; top modulus, bottom phase; percentages of runs inside their own 90 percent interval above each mode"></a>
<figcaption>For each SXS run, both priors are conditioned on that run's own 220 (with $\sigma_{220} = |C_{220}|$, and the run's $\eta$ and $\chi_f$), giving a predicted distribution of $C_j/C_{220}$. Violins pool these predictions over runs; grey dots are the NR values. Numbers: the fraction of runs whose NR modulus falls in *its own* central 90% predictive interval (blue: QNEF, orange: flat); a calibrated prior gives about 90%. Bottom: the phase in the PN frame.</figcaption>
</figure>

**Question.** With the calibrated errors, are the priors' amplitude distributions consistent with NR?

**Takeaway.**

- **QNEF prior, calibrated where it matters:** the 221 (81%), 330 (99%), 331 (96%), 210 (85%) and 211 (85%) are covered, and the 221, 330 and 331 phases are predicted.
- **QNEF prior, miscalibrated for 320 (63%), 440 (54%), 550 (38%) and 660 (12%):** leading-order PN overpredicts these moduli by 2–4×, *systematically*. The calibrated error matches the second moment, but a zero-mean Gaussian centred on the biased prediction puts the NR values in its lower tail. The PN phases of these modes are also poor.
- **Flat prior:** miscalibrated almost everywhere (0–75%). It is wrong by construction except for modes that happen to have the 220's scale.

**Setup.** jaxqualin SXS catalogue, calibration from F1, 400 predictive draws per run, PN at $v = 0.7$.

**Reproduce.** `python -m mqnm.experiments.prior_vs_nr`.

### F1 — Is the analytic prior right, and how wrong is the flat one? (2026-09-24, revised for the conditioned prior)

<figure>
<a href="figs/nr_calibration.png"><img src="figs/nr_calibration.png" alt="Three panels: NR over QNEF overtone ratios in phase and modulus; NR over PN fundamental ratios in phase and modulus; NR amplitude over the 220 per mode"></a>
<figcaption>Each dot is one SXS run; a perfect prediction sits at phase 0, modulus 1. (a) Overtone ratios $C_{\ell m1}/C_{\ell m0}$ over the QNEF $g$. (b) Fundamental ratios $C_{\ell m0}/C_{220}$ over the complex PN $w$, after rotating each run into the PN frame. (c) $|C_{\ell mn}/C_{220}|$, which the flat prior sets to 1; diamonds are the rms values.</figcaption>
</figure>

**Question.** Does the analytic PN × QNEF prior describe NR ringdowns at the merger, in modulus *and phase*, and how large are its errors compared with a flat prior's?

**Takeaway.**

- **Overtones:** the QNEF phase is right. The 221/220 median phase error is $-0.01$ rad, with 0.11 rad scatter over 457 runs, and the modulus is within about 20%. Calibrated errors: $f_{221} = 0.22$, $f_{331} = 0.29$, $f_{211} = 0.90$ (NR is about 1.8× the prediction).
- **Fundamentals:** PN gets the 330 relative to the 220 right in phase ($-0.19$ rad, interquartile range 0.14 rad) and modulus (1.03), so $e_{33} = 0.29$. For the 210, NR is biased by 1.9× and $+0.8$ rad, since leading-order PN has no spin term; $e_{21} = 2.1$. The 440 is barely predictable ($e_{44} = 1.0$, with two phase clusters) and so, in effect, decouples from the 220.
- **Flat prior:** it is off by up to two decades. The 221 is $5\times$ the 220; the 660 is $0.014\times$.

**Setup.** jaxqualin SXS catalogue, 500 runs with $\chi_f \ge 0$, amplitudes at the peak of $|h_{22}|$, spheroidal-corrected, 5σ outlier rejection, PN at $v = 0.7$.

**Reproduce.** `python -m mqnm.experiments.nr_calibration`, which also writes `mqnm/data/nr_calibration.json`.
