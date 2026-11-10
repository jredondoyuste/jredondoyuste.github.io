**Under way (2026-11-10).** The plan for the first task is approved. We are building AthenaK on CPUs and writing an analytic test bed of exact and perturbed Kerr data. The test bed will validate the map from numerical-relativity data to Kerr coordinates, tetrad and Teukolsky initial data.

## Tasks

### t01 — Kerr-like coordinates and quasi-Kinnersley tetrad from NR data · active

Map 3+1 NR data near the remnant to ingoing Kerr–Schild coordinates and a Kinnersley-type tetrad of the final black hole, with invariant measures of how far the data are from Kerr, and deliver $\Psi_4$ and $\partial_t\Psi_4$ as Teukolsky initial data.

- **S1** AthenaK build and smoke test · active
  Z4c with MPI + OpenMP on CPUs; a regression test, timings, and a reader for the volume ADM data.
- **S2** Analytic test bed · active
  Kerr in ingoing Kerr–Schild form and on a scrambled slice, Brill–Lindquist data with a small second mass $\epsilon$, and a Bowen–York puncture that is not Kerr.
- **S3** Pipeline · planned
  Weyl invariants and the speciality index, the quasi-Kinnersley frame, $r$ and $\theta$ from $\Psi_2$, $t$ and $\phi$ from the Killing spinor, non-Kerrness measures, Teukolsky initial data. On Kerr the errors must converge at 4th order; on the control data the measures must scale as $\epsilon$.
- **S4** Single spinning puncture in AthenaK · planned
  The non-Kerrness must decay as the junk radiation leaves, and the recovered $M$ and $\chi$ must match the asymptotic values to 1%.
- **S5** Binary black hole setup · planned
  Inputs, a cost estimate and a how-to for an equal-mass, non-spinning binary on GPUs; not run in this task.

## Simmering

### Neural-network coordinate fit as a cross-check · open

A direct fit of the NR metric to Kerr (as in arXiv:2611.12857) gives no smallness measure and mixes gauge into the perturbation. We may use it later as a cross-check only.

## Choices and conventions

### Units and signature · done

$G = c = 1$, lengths in units of the final mass $M$, signature $(-,+,+,+)$.

### Newman–Penrose conventions · done

$\Psi_4 = C_{abcd}\, n^a \bar m^b n^c \bar m^d$ in the sign convention of Teukolsky (1973), $Q_{ij} = E_{ij} - i B_{ij}$; pinned by $\Psi_2 = -M/(r - i a\cos\theta)^3$ in the Kinnersley frame of exact Kerr.

### Invariants, not coordinate fits · done

$r$ and $\theta$ come from $\Psi_2$ in the quasi-Kinnersley frame, and $t$ and $\phi$ from the Killing vectors built from the algebraic Killing spinor. The residuals of the same construction say where the data are a small perturbation of Kerr.

### Data source: our own AthenaK runs · done

Public SXS data hold waveforms and horizon quantities but no 3D volume data, so we evolve with AthenaK (Z4c, moving-puncture gauge).
