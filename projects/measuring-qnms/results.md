Findings under the v2 model (complex strain, tied mirror modes, detector noise, NR-calibrated priors), newest first. Every analysis starts at $t_0 = 10\,M_f$ after the peak of $|h_{22}|$ unless stated. The v1 plots and the earlier F1 (the calibration scatter) are retired; their numbers remain in the [log](#log).

### F2 — A GW250114-like ringdown against the detector sensitivities

<figure>
<a href="figs/sensitivity_overlay.png"><img src="figs/sensitivity_overlay.png" alt="Characteristic strain of the real SXS:BBH:0180 ringdown and of QNEF prior draws against O4, A+, ET and Cosmic Explorer (left) and against LISA for a million-solar-mass remnant at redshift 1 (right), from 10 M after the peak"></a>
<figcaption>$2\sqrt f\,|\tilde h_+(f)|$ against $\sqrt{f S_n(f)}$ (Moore, Cole &amp; Berry convention), from $t_0 = 10\,M_f$. Black: the SXS:BBH:0180 strain (equal mass, non-spinning, $\chi_f = 0.686$; all harmonics $\ell \le 8$, $m \ne 0$; $\iota = 0.78$). Grey: 40 draws of every mode ($\ell \le 8$, $n \le 7$) from the QNEF prior conditioned on the fitted 220. (a) GW250114 scaling: $M_f^{\rm det} = 68.1\,M_\odot$, $D_L = 405$ Mpc. (b) $M_f = 10^6\,M_\odot$ at $z = 1$. $h_+$ for $F_+ = 1$; ET and LISA (60° interferometers) at their best orientation. ρ is the optimal single-detector SNR of the NR strain.</figcaption>
</figure>

**Takeaway.**

- The prior draws bracket the real strain.
- Optimal SNRs from $10\,M$: O4 22, A+ 41, ET 187, CE 20 km 223, CE 40 km 326; LISA about 2800 per channel.
- From the peak, O4 gets 35, in line with LVK's network value of about 40 post-merger.

**Caveats.** $\varphi = 0$; $\iota$ is the folded value; $m = 0$ harmonics are left out; $D_L$ comes from $z = M_f^{\rm det}/M_f - 1$.

**Reproduce.** `python -m mqnm.experiments.sensitivity_overlay`.

### F1 — Do the calibrated priors cover NR?

<figure>
<a href="figs/prior_vs_nr.png"><img src="figs/prior_vs_nr.png" alt="(a, b) prior-predictive amplitude ratios per mode versus NR, modulus and phase; (c, d) NR strain versus prior bands with every mode for two SXS runs, from 10 M"></a>
<figcaption>(a, b) For each SXS run, both priors are conditioned on that run's own 220 and predict $C_j/C_{220}$ at the merger. Violins pool the predictions and grey dots are NR (jaxqualin). The numbers give the fraction of runs inside their own 90% interval (blue: QNEF, orange: flat). (c, d) NR strain for SXS:BBH:0180 and SXS:BBH:1437 from $10\,M_f$ against 5–95% bands from draws of every mode ($\ell \le 8$, $n \le 7$). Green: $|h_{22}|$; yellow: rms of all other $m > 0$ harmonics.</figcaption>
</figure>

**Takeaway.**

- **Per mode:** the QNEF prior covers the 221, 330, 331, 210 and 211 (81–99%). It overpredicts the moduli of the 320, 440, 550 and 660, where leading-order PN is biased high. Those modes are weak, and the error is in the optimistic direction. The flat prior is miscalibrated almost everywhere.
- **Total strain, coverage across 30 SXS runs:**

| window after the peak | $h_{22}$ | other harmonics | prior / NR for $\lvert h_{22}\rvert$ |
|---|---|---|---|
| 5–10 M | 61% | 2% | 1.78 |
| 10–15 M | 83% | 33% | 1.06 |
| 15–20 M | 95% | 59% | 0.98 |
| 20–25 M | 72% | 68% | 0.97 |

- **This sets the default start at 10 M.** Earlier, the prior predicts too much strain, mostly because jaxqualin amplitudes are extracted where stable (10–15 M) and quoted back at the peak. Improving on this is an open item in the [plan](#plan).

**Reproduce.** `python -m mqnm.experiments.prior_vs_nr`.
