**Paused for review (2026-10-07).** Every planned task is done or closed as a dead end. During the review we added one short task on what the measured modes are made of, how many bits they carry and when a mode is detected (F13–F16). We read through the code and the results together before deciding what comes next.

## Tasks

### Baseline: prior, noise, channel counts, toy model, saturation · done

F1–F5.

### Detector noise: the covariance from the PSD and its numerical choices · done

$n_{\rm meas}$ is robust to within one channel ([F7](#results), [§7](#derivations)).

### Final figures F1–F3 · done

F2's axis convention corrected; SNRs unchanged.

### Amplitude prior $\Sigma_A$: PN × QNEF · done

$e, f, \kappa$ calibrated on NR, overtone scale $a = 1$ (NR bounds $a \le 0.38$) ([§8](#derivations)).

### t07 — Mode counts over astrophysical populations · done

GWTC-5 and Klein+16 ([F8](#results), [F12](#results), [§12](#derivations)). O3 matches; O4 ringdown events come out 2.6× high.

### Which channels are real at early start times · done

From $10\,M$ every measured channel rests on NR-confirmed modes; earlier ones rest on untied overtones.

### t11 — Money plots, counts in modes · done

F1–F4, F7–F12 at $a = 1$, $n_{\rm meas} = \lfloor n_{\rm ch}/2 \rfloor$.

### Code tidied for review · done

github.com/jredondoyuste/mqnm

### t13 — What the measured modes are made of: bits, posteriors, detection · done

F13–F16. ET, GW250114-like, from $10\,M$ and $6\,M$.

- **S1** Physical-mode content of measured modes 1–4 · done
  An exact split of each channel over the modes: the second mode from $10\,M$ is mostly the (2,2,1).
- **S2** Information in bits per channel and per mode · done
  The count threshold is half a bit per channel; the 220 tells at most 0.34 bits about the 440.
- **S3** Posterior correlations and the shape of the 440/220 and 221/220 posteriors · done
  The data trade the prior's ties for an overtone-chain degeneracy; a 221 off its tie stays pulled toward it.
- **S5** When an amplitude excludes zero at $3\sigma$ · done
  2–6× later in $\rho_{220}$ than the count; the 440 at about 200.

## Simmering

### Realistic sky positions and antenna patterns (H1/L1 for GW250114) · paused

Replaces the overhead, co-located idealisation.

### Quadratic 220×220 mode in the signal model · paused

### $n_{\rm meas}$ against $\rho_{220}$ across 3G detectors, incl. CE 20 km post-merger · paused

Does the sensitivity shape matter, or only the SNR?

### LISA with the exact TDI response, $10^5$–$10^7\,M_\odot$, and one gap case · paused

The smooth response is off by up to 30% above 0.1 Hz.

### Open questions

- One pooled error $e$ over-covers (3,3) and under-covers (3,2), (4,3) (F1).
- Harmonics other than (2,2) are under-covered at late times (quadratic and retrograde content not modelled).

## Dead ends

### Calibrating the $n \ge 2$ overtone error from NR strain power · failed

2026-09-24. The prior mean dominates the residual early and unrelated residuals late.

### First non-modal GP, trusted modes only · withdrawn

F6, withdrawn 2026-09-25.

### GP kernel for what the QNM model misses in NR · dropped

2026-10-01. It changes $n_{\rm meas}(t_0)$ by at most one channel in O4 and about two in ET: complexity for little physics ([§10](#derivations)).

### Noise ladder N1/N2/N3 · dropped

2026-10-01, before anything ran. Without the GP there is nothing to compare: detector noise is the model.

### Overtones or non-modal residual: comparing the two readings · abandoned

Closed 2026-10-05. Both sides were settled by the entries above and below.

### Very large mode sets ($10^4$–$10^5$ modes) · dropped

By decision on 2026-09-26, not tried.

### Amplitude prior from a GP on a hyperboloidal slice · failed

2026-09-27. A zero-mean GP is far too broad for NR's $C_{221}/C_{220}$ ([§8.5](#derivations)).

### Setting $a$ from an overtone power budget · failed

2026-09-28. At $t_0 = 0$ the prior's modes overshoot NR, and the fitted scale is not stable in $t_0$. NR instead bounds $a \le 0.38$; we set $a = 1$.

### An emulator of $n_{\rm meas}$ for populations · superseded

2026-09-27. It missed the orbital-phase dependence; replaced by an exact, reweighted event pool ([§12.4](#derivations)).

## Choices and conventions

### Linear Bayesian model

$d = G\theta + n$; no Fisher. Observing angles, masses and spin fixed, as from an IMR fit.

### Start time

Default $t_0 = 10\,M_f$ after the peak of $|h_{22}|$.

### Mode content

All 280 modes ($\ell \le 8$, $n \le 7$) and the PN × QNEF prior with untied-overtone scale $a = 1$ ([§8](#derivations)), unless a result says otherwise.

### Counts are in modes

The amplitudes enter as real and imaginary parts, so every mode has two real channels. We report $n_{\rm meas} = \lfloor n_{\rm ch}/2 \rfloor$, where $n_{\rm ch} = \#\{s_k > 1\}$: a mode counts once both its quadratures are measured.

### NR calibrates, never replaces

The analytic prediction is never replaced by NR: NR only calibrates errors, and nothing is extrapolated beyond the excitation-factor tables.

### Taken from Dyer & Moore

From arXiv:2510.11783 we take the GP for what the QNM model misses ([§10](#derivations)); their per-mode significance and posterior predictive checks remain options.
