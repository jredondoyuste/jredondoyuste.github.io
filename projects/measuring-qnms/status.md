**Active (2026-10-16).** The review pause is over. No headline number has moved; the new work tests the count under harder conditions and explains it. The count holds over real posteriors and real detector sites to about one mode, and a stricter, Bayes-factor reading of "measured" costs about one mode everywhere ([F17](#results)–[F20](#results)). The channel laws ([§8](#derivations)–[§10](#derivations)) are drafted as theorems for the paper and are with us for review.

## Tasks

### t23 — Order in which modes enter across $(q, \chi_f, \iota, t_0)$ · active

The greedy order of [§8](#derivations) against the SVD channels, ET and LISA.

- **S1** Grid of orders over mass ratio, spin, inclination and start time · active
  Running.
- **S2** Orders, greedy-vs-SVD agreement, figures · planned
  Where the greedy label and the dominant mode of a channel disagree.
- **S3** Results and records · planned
  Result files and site update.

### t22 — Which QNMs LISA's multi-mode ringdowns measure · planned

Why LISA events measure more modes than GW250114-like at the same $\rho_{220}$.

- **S1** Mode content of LISA events with five or more modes · planned
  The contribution split of F13, over the Klein+16 events.
- **S2** Why more than GW250114-like · planned
  Reset mass ratio, spin and inclination one at a time.

### t18 — Channel laws: greedy entry, strength bounds, SNR and parameter scaling · active

Theorems for the paper; [§8](#derivations)–[§10](#derivations).

- **S1** Greedy algorithm and certified bounds; ideal detector; SNR and parameter laws; realistic-range law · done
  The brackets hold in 36 of 36 cases; the count goes as $(\ln\rho)^2$ over the reachable range.
- **S2** Paper section and proof appendix · done
  Draft with us for review.
- **S2b** Rewrite for data analysts · active
  Plain-language version with definitions before theorems; with us for reading.
- **S3** Results and closing · planned
  Result files, and the interface of the greedy rule for the rewrite of the code.

### t16 — Specification of the code for a clean rewrite · active

One spec of the maths, architecture and module interfaces of `mqnm`.

- **S1** Code inventories · done
  Every module and experiment listed with what it computes.
- **S2** Spec, draft 1 · done
  Maths, architecture, interfaces as stubs.
- **S3** Checks · done
  44 checks with 42 controls; draft 2 waits on our decisions.

### t21 — Problem sheet on the framework · done

A study sheet for ourselves: channels, the prior covariance, bits, Bayes factors, mode projection.

### t20 — Measurable modes with $\ln B > 3$, for a workshop slide · done

[F19](#results), [F20](#results). GW250114-like from $10\,M$: O4 1 mode, ET 3.

### t19 — Counts over the LVK posteriors of GW250114 and GW150914 · done

[F18](#results). O4 stays at 2 modes; ET loses one at the real sites; fitting the remnant costs at most one.

### t17 — Unequal-mass and high-spin sources · done

[F17](#results). Both measure 8 modes at $\rho_{220} = 321$ against 5; at $q = 2$ the 330 is the second mode.

### t13 — What the measured modes are made of: bits, posteriors, detection · done

[F13](#results), [F14](#results), [F16](#results). Detection comes 2–6× later in $\rho_{220}$ than the count.

### t11 — Money plots, counts in modes · done

F1–F4, F8, F9, F11 at $a = 1$.

### t07 — Mode counts over astrophysical populations · done

[F8](#results), [§12](#derivations). O3 matches; O4 ringdown events come out 2.6× high.

### Earlier groundwork · done

The baseline (prior, noise, channel counts, toy model, saturation: F1–F5); the noise covariance, robust to within one channel under every numerical choice ([§6](#derivations)); the amplitude prior, calibrated on NR ([§7](#derivations)); which channels are real at early start times (from $10\,M$ all rest on NR-confirmed modes); the code tidied for review (github.com/jredondoyuste/mqnm).

## Simmering

### Rigorous mode counting (brainstorm) · active

Where the theorems of t18 came from; open directions include a vector-weighted bound for two-polarisation networks (ET, LISA).

### Bayes-factor threshold in the money plots · open

Whether $B^\ast = 20$ replaces $s_k > 1$ as the headline definition ([§2](#derivations)).

### Quadratic 220×220 mode in the signal model · paused

### LISA with the exact TDI response, $10^5$–$10^7\,M_\odot$, and one gap case · paused

The smooth response is off by up to 30% above 0.1 Hz.

### Open questions

- One pooled error $e$ over-covers (3,3) and under-covers (3,2), (4,3) (F1).
- Harmonics other than (2,2) are under-covered at late times (quadratic and retrograde content not modelled).
- At $q = 2$ the 221 is harder to detect (F17); we have not tested why.

## Dead ends

### Non-modal content as a GP in the noise · dropped

2026-10-01. A first version (trusted modes only) was withdrawn on 2026-09-25; the rebuilt kernel on 434 SXS runs changed $n_{\rm meas}(t_0)$ by at most one channel in O4 and about two in ET. The noise ladder and the overtones-vs-non-modal comparison built on it were closed with it.

### Calibrating overtone errors from NR strain power · failed

2026-09-24 and 2026-09-28. At $t_0 = 0$ the prior's modes overshoot NR, so the residual is a cancellation, not added power. NR instead bounds $a \le 0.38$; we set $a = 1$.

### Amplitude prior from a GP on a hyperboloidal slice · failed

2026-09-27. A zero-mean GP is far too broad for NR's $C_{221}/C_{220}$ ([§7.5](#derivations)).

### An emulator of $n_{\rm meas}$ for populations · superseded

2026-09-27. It missed the orbital-phase dependence; replaced by an exact, reweighted event pool ([§12.4](#derivations)).

### Very large mode sets ($10^4$–$10^5$ modes) · dropped

By decision on 2026-09-26, not tried.

### Realistic sky positions; $n_{\rm meas}$ against $\rho_{220}$ across 3G detectors · superseded

Both parked on 2026-10-01. Real sites are now in F18; at fixed $\rho_{220}$ the detectors agree within one mode, and [§9](#derivations) explains why.

## Choices and conventions

### Linear Bayesian model

$d = G\theta + n$; no Fisher. Observing angles, masses and spin fixed, as from an IMR fit; F18 tests what fitting the remnant costs.

### Start time

Default $t_0 = 10\,M_f$ after the peak of $|h_{22}|$.

### Mode content

All 280 modes ($\ell \le 8$, $n \le 7$) and the PN × QNEF prior with untied-overtone scale $a = 1$ ([§7](#derivations)), unless a result says otherwise.

### Counts are in modes

The amplitudes enter as real and imaginary parts, so every mode has two real channels. A mode counts once both its channels have $s_k > 1$, $n_{\rm meas} = \lfloor n_{\rm ch}/2 \rfloor$, or, where stated, once the pair's expected $\ln B \ge 3$ ([§2](#derivations)).

### NR calibrates, never replaces

The analytic prediction is never replaced by NR: NR only calibrates errors, and nothing is extrapolated beyond the excitation-factor tables.
