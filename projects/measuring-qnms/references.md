## Used in the code

- **E. Berti, V. Cardoso**, *Quasinormal ringing of Kerr black holes: the excitation factors*. [gr-qc/0605118](https://arxiv.org/abs/gr-qc/0605118). QNEF definitions (eqs. 3.8–3.9); the time-shift ambiguity (Sec. III.B, eq. 3.15).
- **E. Berti**, ringdown data page: [pages.jh.edu/eberti2/ringdown](https://pages.jh.edu/eberti2/ringdown/). Source of the tabulated $|B_{\ell m n}|$ used in `mqnm/qnef.py`.
- **R. K. L. Lo, L. Sabani, V. Cardoso**, QNEF tables and plots, PRD 111, 124002. [2504.00084](https://arxiv.org/abs/2504.00084), with plots at [ricokaloklo.github.io/kerr-qnm-qnef](https://ricokaloklo.github.io/kerr-qnm-qnef).
- **S. Borhanian, K. G. Arun, H. P. Pfeiffer, B. S. Sathyaprakash**, [1901.08516](https://arxiv.org/abs/1901.08516). Leading-order PN multipole amplitudes track NR through merger. This is the basis of `PNPrior`.
- **L. E. Kidder**, [0710.0614](https://arxiv.org/abs/0710.0614). Explicit PN mode coefficients.
- **L. Blanchet**, Living Reviews in Relativity, [1310.1528](https://arxiv.org/abs/1310.1528).
- **A. Bohé et al.**, SEOBNRv4, PRD 95, 044028, [1611.03703](https://arxiv.org/abs/1611.03703). NR fit of $M\omega_{22}$ at the peak of $|h_{22}|$ (App. A.3, eqs. A6–A9), which gives each binary's $v$ in the amplitude prior (`mqnm.amplitudes.v_peak`).
- **L. C. Stein**, `qnm`: a Python package for Kerr QNMs, JOSS 2019. [1908.10377](https://arxiv.org/abs/1908.10377).

## Populations and observations (population-counts task)

- **LIGO, Virgo and KAGRA**, GWTC-4.0 population properties, [2508.18083](https://arxiv.org/abs/2508.18083), with its data release ([10.5281/zenodo.16911563](https://doi.org/10.5281/zenodo.16911563)) and the cumulative search sensitivity estimates, which include the O3 reference PSDs ([10.5281/zenodo.16740128](https://doi.org/10.5281/zenodo.16740128)).
- **LIGO, Virgo and KAGRA**, GWTC-3 ([2111.03606](https://arxiv.org/abs/2111.03606)) and its population paper, PRX 13, 011048 ([2111.03634](https://arxiv.org/abs/2111.03634)).
- **A. Klein et al.**, eLISA massive black-hole binaries, [1511.05581](https://arxiv.org/abs/1511.05581), and the PopIII / Q3-delays / Q3-no-delays catalogues (E. Barausse).
- **X. Jiménez-Forteza et al.**, final mass and spin fits for non-precessing binaries (UIB2016), [1611.00332](https://arxiv.org/abs/1611.00332).
- Ringdown observations and forecasts: tests of GR with GWTC-2 ([2010.14529](https://arxiv.org/abs/2010.14529)) and GWTC-3 ([2112.06861](https://arxiv.org/abs/2112.06861)); GW250114 spectroscopy ([2509.08099](https://arxiv.org/abs/2509.08099)); GW190521 (Capano et al. [2105.05238](https://arxiv.org/abs/2105.05238), [2209.00640](https://arxiv.org/abs/2209.00640); Siegel, Isi & Farr [2307.11975](https://arxiv.org/abs/2307.11975)); Berti et al. PRL 117, 101102 ([1605.09286](https://arxiv.org/abs/1605.09286)); Cabero et al. ([1911.01361](https://arxiv.org/abs/1911.01361)); Bhagwat et al. ([2201.00023](https://arxiv.org/abs/2201.00023)).

## Background (cited from memory: verify before quoting in the paper)

- **Y. Hua, T. K. Sarkar**, matrix pencil method, IEEE Trans. ASSP 38 (1990) 814. Source of the optimal pencil range $L \in [m/3, m/2]$.
- **L. London, D. Shoemaker, J. Healy**, *Modeling ringdown: beyond the fundamental QNMs*. [1404.3197](https://arxiv.org/abs/1404.3197). Quadratic-mode amplitude fits (the $c_q$ scale).
- **M. H.-Y. Cheung et al.**, jaxqualin. [2310.04489](https://arxiv.org/abs/2310.04489). Planned source of NR-informed amplitude means and widths (v2).
- **P. Ajith**, [1107.1267](https://arxiv.org/abs/1107.1267). The analytic aLIGO zero-detuned high-power PSD fit ($f_0 = 215$ Hz, $S_0 = 10^{-49}$) used in `noise.py`.
- Adamyan–Arov–Krein theorem and balanced truncation: optimal low-rank Hankel approximation. Relevant to the compression framing from the first version.

## Consulted, not used

- **Dyer, Moore**, GP kernel for NR resolution-difference uncertainty. PRD 113, 104031, [2510.11783](https://arxiv.org/abs/2510.11783). Compared with our non-modal kernel: theirs models numerical error, not non-modal content.
- **Dyer, Moore**, Bayesian greedy QNM model building with a significance threshold and posterior predictive checks. PRL 136, 191403, [2510.13954](https://arxiv.org/abs/2510.13954). Checked for their mode-count and start-time conclusions.
- **Dyer, Chung, Moore**, a direct-wave (horizon-mode) term added to ringdown fits. [2606.25021](https://arxiv.org/abs/2606.25021). A deterministic damped sinusoid for early non-modal content, not a GP.
- **T. Damour, B. R. Iyer, A. Nagar**, factorized PN modes, PRD 79, 064004, [0811.2069](https://arxiv.org/abs/0811.2069); **L. Blanchet**, Living Rev. Rel. 17, 2, [1310.1528](https://arxiv.org/abs/1310.1528) (modes to $\ell = 7$); **Y. Pan et al.**, spinning modes to 1.5PN, [1006.0431](https://arxiv.org/abs/1006.0431). Read for the first PN corrections to the amplitude prior.
- Hyperboloidal slices, for the dropped slice-GP prior: **M. Ansorg, R. P. Macedo**, [1604.02261](https://arxiv.org/abs/1604.02261); **S. R. Green et al.**, [2210.15935](https://arxiv.org/abs/2210.15935); **Minucci et al.**, [2604.13182](https://arxiv.org/abs/2604.13182); **M. Assaad, R. P. Macedo**, [2506.04326](https://arxiv.org/abs/2506.04326); **J. L. Jaramillo, R. P. Macedo, L. Al Sheikh**, PRX 11, 031003, [2004.06434](https://arxiv.org/abs/2004.06434).
- Ringdown likelihood and noise: **M. Isi, W. M. Farr**, [2107.05609](https://arxiv.org/abs/2107.05609) (ACF from the PSD, Eq. 45; truncated likelihood); **E. Finch, C. J. Moore**, [2108.09344](https://arxiv.org/abs/2108.09344); **B. Zackay et al.**, [1908.05644](https://arxiv.org/abs/1908.05644) (inpainting); **R. Cotesta et al.**, [2201.00822](https://arxiv.org/abs/2201.00822) (sampling rate).
- Detector curves: **M. Evans et al.**, CE horizon study, [2109.09882](https://arxiv.org/abs/2109.09882), and the CE-T2000017 curve release; **M. Branchesi et al.**, ET designs, [2303.15923](https://arxiv.org/abs/2303.15923); **F. Iacovelli et al.**, gwfast, [2207.02771](https://arxiv.org/abs/2207.02771).
- LISA: **T. Robson, N. Cornish, C. Liu**, [1803.01944](https://arxiv.org/abs/1803.01944); **S. Babak, M. Hewitson, A. Petiteau**, [2108.01167](https://arxiv.org/abs/2108.01167); gaps: **Q. Baghi et al.**, [1907.04747](https://arxiv.org/abs/1907.04747), **K. Dey et al.**, [2104.12646](https://arxiv.org/abs/2104.12646); LISA Definition Study Report, [2402.07571](https://arxiv.org/abs/2402.07571).
- Population-rate background with no rates we could use: **Hofmann et al.** [1605.01938](https://arxiv.org/abs/1605.01938), **Ota & Chirenti** [1911.00440](https://arxiv.org/abs/1911.00440), **Baibhav et al.** [1710.02156](https://arxiv.org/abs/1710.02156), **Baibhav & Berti** [1809.03500](https://arxiv.org/abs/1809.03500).
