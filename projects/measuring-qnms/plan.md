## Plan v2 (2026-09-24)

These are your requests, numbered as you gave them (there is no item 7), ordered by dependency. The full technical version is in `PLAN.md` in the repo.

> **Findings from preparing the plan.** (i) The current PN + QNEF prior phase-locks all modes to $A_{220}$, which costs 1–2 channels. [Derivations §8](#derivations) has the details and the fix: orientation averaging gives a block-diagonal $\Sigma_A$ with complex loadings. (ii) In a single real detector, a mirror mode is *exactly degenerate* with its prograde partner, so detector runs need a real-valued model. (iii) The current coloured noise is circulant, i.e. it wraps around at the segment edges, and it drops physical units. Both need fixing before any detector plot.

### Phase A: foundations

| step | what | serves |
|---|---|---|
| A1 | real-valued design matrix for detector data; mirror modes folded into their partners | 3, 4, 6 |
| A2 | `DetectorNoise`: Toeplitz ACF from the PSD, physical units. Curves: aLIGO O4, A+, ET-D, ET 10 km, CE 40/20 km (gwfast files), LISA (Robson–Cornish–Liu, from your folder) | 3 |
| A3 | modes to $\ell = 8$, all $m \ne 0$, $n \le 7$; general leading-order PN formula for any $(\ell, m)$; QNEF for $\ell = 8$ (extrapolated, flagged) | 2 |
| A4 | physical amplitude scale: $\sigma_{220} = |A_{220}^{\rm NR}|\,(1+z) M_f / D_L$ | 4, 6 |

### Phase B: the amplitude prior (item 1)

| step | what |
|---|---|
| B1 | orientation-averaged prior: blocks by $(\ell, m)$ (isotropic) or by $m$ (fixed $\iota$); complex coherent overtone loadings from the QNEF phases and the time shift |
| B2 | jaxqualin calibration: install it in a separate env, export its hyperfit amplitudes vs $q$ for the robust modes, compare them with PN × QNEF at a common reference time, and set the error model (dex and phase scatter per $\ell$, $n$) from the residuals |

### Phase C: figures

| item | figure |
|---|---|
| 5 | two-mode toy: posterior ellipses in the 0 / 1 / 2-channel regimes, plus a phase diagram in ($\rho$, frequency separation), closed form in [derivations §9](#derivations) |
| 4 | detector ASDs, $\sqrt{f S_n}$, against $2\sqrt f\,|\tilde h(f)|$ for prior draws: GW250114 at 440 Mpc; LISA $10^6 M_\odot$ at $z = 1$ |
| 8 | saturation: $n_{\rm meas}$ against nested model size (add overtones; add $\ell$), plus the principal angles between the measurable subspaces of nested models. With a flat prior, $n_{\rm meas}$ can never decrease (interlacing), so any plateau comes from the prior |
| 6 | money plots: (a) GW250114-like source, $n_{\rm meas}$ per detector, with markers per amplitude assumption and error bars; (b) $n_{\rm meas}$ against redshift per detector, with bands for the prior assumptions; LISA across masses |

### Decisions pending

1. Real-valued model for all detector runs (recommended), keeping the complex model only for the abstract story?
2. LISA fiducial source: $10^6 M_\odot$, $q \approx 1$, $z = 1$?
3. OK to install jaxqualin (and jax) in a separate environment, so `mqnm` itself gains no dependencies?
