## Used in the code

- **E. Berti, V. Cardoso**, *Quasinormal ringing of Kerr black holes: the excitation factors*. [gr-qc/0605118](https://arxiv.org/abs/gr-qc/0605118). QNEF definitions (eqs. 3.8–3.9); the time-shift ambiguity (Sec. III.B, eq. 3.15).
- **E. Berti**, ringdown data page: [pages.jh.edu/eberti2/ringdown](https://pages.jh.edu/eberti2/ringdown/). Source of the tabulated $|B_{\ell m n}|$ used in `mqnm/qnef.py`.
- **R. K. L. Lo, L. Sabani, V. Cardoso**, QNEF tables and plots, PRD 111, 124002. [2504.00084](https://arxiv.org/abs/2504.00084), with plots at [ricokaloklo.github.io/kerr-qnm-qnef](https://ricokaloklo.github.io/kerr-qnm-qnef).
- **S. Borhanian, K. G. Arun, H. P. Pfeiffer, B. S. Sathyaprakash**, [1901.08516](https://arxiv.org/abs/1901.08516). Leading-order PN multipole amplitudes track NR through merger. This is the basis of `PNPrior`.
- **L. E. Kidder**, [0710.0614](https://arxiv.org/abs/0710.0614). Explicit PN mode coefficients.
- **L. Blanchet**, Living Reviews in Relativity, [1310.1528](https://arxiv.org/abs/1310.1528).
- **L. C. Stein**, `qnm`: a Python package for Kerr QNMs, JOSS 2019. [1908.10377](https://arxiv.org/abs/1908.10377).

## Background (cited from memory: verify before quoting in the paper)

- **Y. Hua, T. K. Sarkar**, matrix pencil method, IEEE Trans. ASSP 38 (1990) 814. Source of the optimal pencil range $L \in [m/3, m/2]$.
- **L. London, D. Shoemaker, J. Healy**, *Modeling ringdown: beyond the fundamental QNMs*. [1404.3197](https://arxiv.org/abs/1404.3197). Quadratic-mode amplitude fits (the $c_q$ scale).
- **M. H.-Y. Cheung et al.**, jaxqualin. [2310.04489](https://arxiv.org/abs/2310.04489). Planned source of NR-informed amplitude means and widths (v2).
- **P. Ajith**, [1107.1267](https://arxiv.org/abs/1107.1267). The analytic aLIGO zero-detuned high-power PSD fit ($f_0 = 215$ Hz, $S_0 = 10^{-49}$) used in `noise.py`.
- Adamyan–Arov–Krein theorem and balanced truncation: optimal low-rank Hankel approximation. Relevant to the compression framing from the first version.
