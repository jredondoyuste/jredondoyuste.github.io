## Plan v2 (2026-09-24)

These are your requests, numbered as you gave them (there is no item 7), ordered by dependency. The full technical version is in `PLAN.md` in the repo.

> **Findings from preparing the plan.** (i) The current PN + QNEF prior phase-locks all modes to $A_{220}$, which costs 1–2 channels. [Derivations §8](#derivations) has the details and the fix: orientation averaging gives a block-diagonal $\Sigma_A$ with complex loadings. (ii) *Revised after your comments:* mirror modes stay, doubling the mode set in the complex strain. For aligned spins, though, their amplitudes are tied to the prograde ones through $h_{\ell,-m} = (-1)^\ell \bar h_{\ell m}$ and the inclination. That is a pseudo-covariance, so the analysis needs an augmented (real) parametrization. See [derivations §8](#derivations). (iii) The current coloured noise is circulant, i.e. it wraps around at the segment edges, and it drops physical units. Both need fixing before any detector plot.

### Phase A: foundations

| step | what | serves |
|---|---|---|
| A1 | augmented (real) parametrization; mirror modes tied (aligned spin) or free (precession); observation operators: complex two-polarization $h$, a single detector (real projection), networks (H1+L1, ET triangle, ET+CE) | 2, 3, 4, 6 |
| A2 | `DetectorNoise`: Toeplitz ACF from the PSD, physical units. Curves: aLIGO O4, A+, ET-D, ET 10 km, CE 40/20 km (gwfast files), LISA (Robson–Cornish–Liu, from your folder) | 3 |
| A3 | modes to $\ell = 8$, all $m \ne 0$, $n \le 7$; general leading-order PN formula for any $(\ell, m)$; QNEF for $\ell = 8$ (extrapolated, flagged) | 2 |
| A4 | physical amplitude scale: $\sigma_{220} = |A_{220}^{\rm NR}|\,(1+z) M_f / D_L$ | 4, 6 |

### Phase B: the amplitude prior (item 1)

The model is in [derivations §8](#derivations). **Status (2026-09-24):** the priors are implemented and calibrated on NR (finding [F1](#results)). $t_{\rm ref}$ is the merger by definition; only the errors $f_{\ell mn}$ and $k_{\ell m}$ are calibrated, for both the QNEF and the flat prior. The package has been cut to 608 lines.

### Status and open investigations (2026-09-24)

- **Default start: $t_0 = 10\,M_f$** after the peak (`design.DEFAULT_T_START`). Before that the prior overpredicts the NR strain (F1).
- **Open: can we do better before 10 M?** Options: overtone errors that depend on $t_0$; per-mode stability times from jaxqualin; treating pre-10 M non-QNM content as structured noise.
- **Open:** harmonics other than (2,2) stay under-covered at late times (quadratic 220×220 in $h_{44}$ and retrograde content are not modelled).
- **Open:** the zero-mean overtone scale ($a = 1.41$, fitted at 5 M) still trends mildly with spin.

### Phase C: figures

| item | figure |
|---|---|
| 5 | two-mode toy: posterior ellipses in the 0 / 1 / 2-channel regimes, plus a phase diagram in ($\rho$, frequency separation), closed form in [derivations §9](#derivations) |
| 4 | detector ASDs, $\sqrt{f S_n}$, against $2\sqrt f\,|\tilde h(f)|$ for prior draws: GW250114 at 440 Mpc; LISA $10^6 M_\odot$ at $z = 1$ |
| 8 | saturation: $n_{\rm meas}$ against nested model size (add overtones; add $\ell$), plus the principal angles between the measurable subspaces of nested models. With a flat prior, $n_{\rm meas}$ can never decrease (interlacing), so any plateau comes from the prior |
| 6 | money plots: (a) GW250114-like source, $n_{\rm meas}$ per detector, with markers per amplitude assumption and error bars; (b) $n_{\rm meas}$ against redshift per detector, with bands for the prior assumptions; LISA across masses |

### Decisions

1. Complex strain with mirror modes: **yes**, via the augmented parametrization, with single-detector and network projections as variants.
2. jax and jaxqualin: **installed** in the project env.
3. Still open: LISA fiducial source ($10^6 M_\odot$, $q \approx 1$, $z = 1$?).

### First look at the NR scatter (raw, before subtracting any model)

| ratio at peak | runs | median | amplitude scatter | phase scatter |
|---|---|---|---|---|
| 221 / 220 | 468 | 4.0 | 0.17 dex | 0.28 rad |
| 331 / 330 | 264 | 5.3 | 0.18 dex | 0.16 rad |
| (−220) / 220 in $h_{22}$ | 258 | $4\times10^{-4}$ | 0.60 dex | ≈ uniform |
| 220×220 / 440 in $h_{44}$ | 304 | 3.7 | 0.29 dex | 1.36 rad |

NR overtones stop at $n = 1$ (none at $n \ge 2$ in jaxqualin) and harmonics at $\ell = 7$, so the high-$n$ and $\ell = 8$ error model remains an assumption.
