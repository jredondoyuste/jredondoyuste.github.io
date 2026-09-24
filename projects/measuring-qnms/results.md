Findings under the v2 model (complex strain, tied mirror modes, detector noise), newest first. The v1 plots were retired on 2026-09-24; their numbers remain in the [log](#log).

Each finding is self-contained:

- **Question**: what the figure is meant to answer.
- **Figure**: click to open it at full size.
- **Takeaway**: the one or two sentences to remember.
- **Setup**: source, detector, prior, mode content.
- **Reproduce**: script and commit.

### F1 — Is the analytic prior right, and how wrong is the flat one? (2026-09-24)

<figure>
<a href="figs/nr_calibration.png"><img src="figs/nr_calibration.png" alt="Three panels: NR over QNEF overtone ratios in modulus and phase; NR over PN fundamental ratios per harmonic; NR amplitude over the 220 per mode"></a>
<figcaption>Grey dots are individual SXS runs; diamonds are the calibrated rms values stored in the prior. (a) NR overtone ratios $C_{\ell m1}/C_{\ell m0}$ over the QNEF prediction $g$: a perfect prediction sits at $(0, 1)$. (b) NR fundamental ratios over the leading-order PN $r_{\ell m}$ at $v = 0.7$. (c) NR $|C_{\ell mn}/C_{220}|$, which the flat prior sets to 1.</figcaption>
</figure>

**Question.** Does the analytic PN × QNEF prior describe NR ringdowns at the merger, and how large are its errors, compared with those of a flat prior?

**Takeaway.**

- The QNEF prediction gets the overtone **phase** right: 221/220 is off by $-0.01$ rad (median), with 0.11 rad scatter over 457 runs. The modulus is within about 20%.
- The calibrated overtone errors are $f_{221} = 0.22$ and $f_{331} = 0.29$. The 211 is the worst, at 0.90: NR is about 1.8× the prediction.
- PN is right for $(3,3)$ and $(3,2)$ ($k \approx 1$). It overpredicts the high-$\ell$ fundamentals by 2–4× ($k_{44} = 0.44$, $k_{66} = 0.26$) and underpredicts $(2,1)$ ($k = 2.5$, where leading-order PN has no spin term).
- The flat prior is off by up to two decades: the 221 is $5\times$ the 220, the 440 is $0.07\times$, the 660 is $0.014\times$.

**Setup.** jaxqualin SXS catalogue, 500 runs with $\chi_f \ge 0$, amplitudes at the peak of $|h_{22}|$, spheroidal-corrected, 5σ outlier rejection.

**Reproduce.** `python -m mqnm.experiments.nr_calibration` (mqnm commit `60bc41c`), which also writes `mqnm/data/nr_calibration.json`.
