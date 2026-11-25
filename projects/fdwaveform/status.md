**Active (2026-11-25).** The simplest NR-free amplitude (leading-order PN matched to the remnant's greybody factor) failed against NR by a factor of 15 ([F1](#results)). The current task replaces the inspiral and the merger bridge. A TaylorT4 inspiral with a merger exponent $p=\tfrac12$, which follows from a constant radiated $dJ/d\Omega$ ([§2](#derivations)), brings the median amplitude mismatch to $1.6\times10^{-3}$, against $3.5\times10^{-4}$ for IMRPhenomXAS ([F2](#results)). The gap between the ISCO and the light ring is what remains. An NR-free EOB plunge is being built to fill it.

## Tasks

### t02 — Resummed SPA inspiral and a matching-frequency scan · active

Better NR-free inspiral amplitudes, the matching frequency scanned between the remnant ISCO and the light ring, and routes through the plunge (EOB, BOB).

- **S1** Formulas from the literature (Taylor PN with spins, factorised modes, NR-free EOB, BOB) · done
  Energy, flux and spin amplitude through 3.5PN, checked against LAL.
- **S2** Formulation: inspiral variants, the $\mathcal J'$ identity, NR-free freeze rules · active
  [§2](#derivations); the rules were fixed before the EOB bridge is scanned.
- **S3** TaylorT1 and TaylorT4 SPA amplitudes · done
  T4 inspiral band $5.3\times10^{-4}$, against $4.2\times10^{-4}$ for IMRPhenomXAS.
- **S4** Matching-frequency scan against 60 SXS cases · active
  The harness reproduces t01 exactly; [F2](#results).
- **S5** NR-free EOB evolution through the plunge · active
  The SEOBNRv5 structure with every NR-fitted coefficient removed (no $a_6$, $d_{\rm SO}$ or NQC corrections).
- **S6** BOB-inspired merger in the frequency domain · active
  A constant $dJ/d\Omega$ gives $p=\tfrac12$ with no NR input.
- **S7** Benchmark against Phenom, SEOBNR and NRSurrogate (accuracy, speed, coverage) · planned
  For the best model of S4–S6.

### t01 — NR-free $(2,2)$ amplitude from PN matched to the remnant greybody factor · done

The thesis fails in its simplest form: median $5.1\times10^{-3}$ against $3.5\times10^{-4}$ for IMRPhenomXAS ([F1](#results)).

- **S1** Literature: the GBF amplitude model, GreyRing, BOB, BKL · done
  The NR-fitted parts of each model were identified.
- **S2** Formulation: $C^0$/$C^1$ matching fixes $(A,p)$ in closed form · done
  [§1](#derivations).
- **S3** Code: Teukolsky reflectivity, PN, BKL remnant, NR processing · done
  The reflectivity was cross-checked against pybhpt.
- **S4** Test against 60 SXS cases and IMRPhenomXAS · done
  The matching forces $p\approx7/6$, so there is no merger plateau.

## Simmering

### Transition and plunge with a numerical FFT · open

Integrate an NR-free plunge to the light ring, Fourier-transform it numerically, and hand over to the greybody factor. Partly in t02 S5.

### Phase, higher modes, precession · open

The roadmap after the $(2,2)$ amplitude: the GreyRing phase matched to PN or EOB; then higher modes and precession, by twisting up.

## Dead ends

### $C^1$ matching of LO PN at the ISCO · failed

It forces $p=7/6+\tfrac12\,d\ln\mathcal R/d\ln\bar\omega\approx7/6$, with no merger plateau ([F1](#results)).

### Re-expanded full PN amplitude near the ISCO · failed

The truncated series steepens and crosses zero between $0.7$ and $0.8\,\omega_{\rm LR}$, so it cannot be matched there.

## Choices and conventions

### NR is for testing, never for calibration · active

At most 2 real NR-calibrated numbers in the whole model; none are used so far. The target is competitiveness with PhenomXPHM, SEOBNR and NRSurrogate in accuracy, speed and coverage.

### Remnant from BKL · active

The Buonanno–Kidder–Lehner spin with $M_f=M$, and a variant that subtracts the ISCO binding energy. The NR-fit remnant is used only to measure what the remnant costs.

### Test metric · active

The amplitude mismatch of $\lvert\tilde h_{22}\rvert$ with a flat PSD (also aLIGO at $60$ and $150\,M_\odot$), on 60 SXS aligned-spin cases with $q\le8$ and $\lvert\chi\rvert\le0.8$. Full, inspiral and ringdown bands.
