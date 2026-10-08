**Second-order variables done; RN sources next (2026-10-08).** The linear theory (t01, t02, t04), the RN numerics (t06) and the first-order gauge (t14) are done ([F1–F4](#results)). t13 gave the second-order variables: the linear pieces of the gauge-invariant pair, invariant under second-order gauge, $U(1)$ and frame changes, with their equation and its quadratic source, checked on exact second-order solutions to $10^{-100}$ ([§8](#derivations)). Next: the explicit RN sources (t05).

## Tasks

### t01 — Conventions and a dictionary between Giorgi's tensorial formalism, GHP/spinors and Chandrasekhar/Hintz NP · done

Every Giorgi quantity we need, and her linear gauge invariants, written as GHP scalars and checked on KN ([§1](#derivations)).

- **S1** Literature notes (Giorgi RN and KN papers) · done
  Conventions read off each paper, with the places where they are not stated.
- **S2** Background dictionary · done
  Nineteen of her quantities as NP scalars; her KN frame is Kinnersley spin-rotated, and her charge is $-Q$ in ours.
- **S3** Linear dictionary · done
  Her invariants $A,\mathfrak F,\mathfrak B,\mathfrak X$ are constant multiples of GHP scalars, gauge invariant on KN.

### t02 — sympy GHP/spinor toolkit for type-D Einstein–Maxwell backgrounds · done

Three layers (coordinates, abstract GHP, spinors), each checked against the one below on RN, Kerr and KN ([§1](#derivations)).

- **S1** Coordinate layer: KN in Boyer–Lindquist and hyperboloidal charts · done
  All NP quantities from the metric and potential alone.
- **S2** Spinor layer: the AAB operators · done
  Reproduces the GHP Maxwell and Bianchi equations component by component.
- **S3** GHP layer: field equations and the closed type-D rule set · done
  One sign typo found in the literature (arXiv:2304.02663, A.6d).
- **S4** Cross-check against Hintz 2026 · done
  His integrating-factor identities and the separation $C=R(r)+i\Theta(\theta)$ hold exactly.

### t04 — Linear KN: the coupled system from spinors to coordinates, matched to the literature; radiation-gauge reconstruction · done

The linear problem, end to end, with a tutorial notebook ([§2–§6](#derivations)).

- **S1** Dias–Godazgar–Santos operators · done
  DGS give only the negative-spin pair and no conventions; we read their operators against Weller et al.
- **S2** Spinor → GHP → linearised coupled system · done
  The two first-order quantities and the two master equations, derived rather than assumed.
- **S3** Off-shell identity · done
  Each master equation is a combination of the linearised Einstein–Maxwell equations, to $10^{-100}$ on RN and KN.
- **S4** Coordinate forms · done
  RN radial system per $\ell$; KN in BL and two hyperboloidal charts; falloffs $(\sigma^5,\sigma^6)$ at scri.
- **S5** Comparisons with Weller et al., Hintz, Giorgi · done
  All three match exactly; Hintz's division by $F_-$ is singular outside the horizon for $Q^2/M^2>15/16$.
- **S6** Reconstruction of $h_{ab}$, $A^{(1)}_a$ · done
  Nine transport equations in ingoing radiation gauge; free functions classified on RN.
- **S7** Tutorial notebook · done
  Six sections with exercises; runs headless in about 3 min.

### t06 — RN numerics: spectral code, coupled QNMs, reconstruction for QNM data · done

From GHP equations to Chebyshev arrays on RN hyperboloidal slices; the QNMs of the coupled system; the first-order metric and potential for each QNM ([F1–F3](#results)).

- **S1** Bridge from GHP to spectral arrays · done
  GHP expressions become coordinate operators, then Chebyshev matrices; the hyperboloidal $\ell=2$ system equals t04's after the change of chart, exactly.
- **S2** Reference RN QNM tables · done
  Published coupled values at $Q/M\in\{0.2,0.4,0.6,0.8,0.99\}$, with their units and conventions.
- **S3** Coupled RN QNMs · done
  $\ell=1,2$, $n=0,1$, $Q/M$ up to $0.99$: 25 of 28 published values matched to every printed digit; the other 3 are wrong in the 5th decimal of one table ([F1](#results)).
- **S3b** Reproduce Destounis–Cardoso–Hintz (arXiv:2610.07142) · done
  Our own 40-digit solver of the separated KN equations reproduces their tables and figures; at $a=0$ it equals S3 to $10^{-11}$ ([F2](#results)).
- **S4** Reconstruct $h_{ab}$, $A^{(1)}_a$ for QNM data · done
  Marching the nine transport equations step by step gives the unique radiation-gauge field analytic from scri to the horizon; every field equation holds to $10^{-8}$, confirmed by an independent coordinate operator ([F3](#results)).
- **S5** Plots and results · done
  Reconstruction plots against $\sigma$, with the rescalings at scri stated.

### t14 — Gauge of the first-order field: from radiation gauge to Bondi–Sachs, regular at the horizon · done

Takes the t06 field to an asymptotically flat gauge on the whole slice, and computes its observables at scri and at the horizon ([F3, F4](#results)).

- **S1** Literature: electrovacuum Bondi–Sachs gauges · done
  The perturbative Bondi–Sachs gauge of Spiers, Pound and Moxon, and the radial Maxwell gauge $A_r=0$.
- **S2** Gauge conditions as equations · done
  On RN the radiation-gauge conditions contain the Bondi–Sachs ones exactly; the remaining gauge freedom is closed form, three amplitudes per mode, all fixed by the falloffs at scri.
- **S3** Apply to the QNMs, glued · done
  Bondi–Sachs near scri, radiation gauge near the horizon, a $C^6$ join between; checked by a linearised Einstein–Maxwell operator built independently in coordinates ([F3](#results)).
- **S3b** Fluxes at scri and at the horizon · done
  Strain and news from the metric; GW/EM power split equal to Motohashi's $(L-1)/(L+1)$ to $10^{-9}$; horizon shear and $\phi_0$ from invariant formulas ([F4](#results)).
- **S4** Gauge recommendation · done
  The glued gauge for second-order work; the gauge is fully fixed for every mode of nonzero frequency.

### t13 — Second-order gauge- and frame-invariant variables on KN · done

The second-order variables to evolve: the linear pieces $V^{(2)}_L=V^{(1)}[h_2,a_2]$ of the invariant pair, their equation, and what they give at scri and at the horizon ([§8](#derivations)).

- **S1** Literature: Spiers–Pound–Moxon's linear piece, Campanelli–Lousto, Bruni et al. · done
  The construction carries over to Einstein–Maxwell; no prior gauge-invariant second-order curvature variable on RN or KN.
- **S2** Definitions and transformation laws · done
  $V^{(1)}$ for all four variables is gauge, $U(1)$ and frame invariant for a general perturbation, to $10^{-118}$ on RN and KN; the second-order gauge law checked exactly against a pull-back.
- **S3** The equation and the observables · done
  $\mathcal O[V^{(2)}_L]=-\sum c_V\,\mathrm{Chain}_V[\mathcal A_Q]$, checked on exact second-order solutions to $10^{-100}$; $\Psi_4^{(2)}$ at scri and $\Psi_0^{(2)}$ in radiation gauge are the linear pieces, the electromagnetic channel needs extra quadratic terms.
- **S4** Off-shell check · done
  Covered by the S2 and S3 checks; the coordinate route moves to t05.
- **S5** Result and notes for t05 · done

### t05 — RN: second-order equations with explicit quadratic sources · next

Sources grav×grav, grav×EM, EM×EM, for the t13 variables, from first-order QNMs in the glued gauge; behaviour at the horizon and at scri.

### t07 — RN: quadratic QNMs and GW–EM mixing as functions of $Q/M$ · planned

Schwarzschild quadratic ratios at $Q=0$ as the check.

### t08 — Extremal RN: backreaction of Aretakis-unstable modes · planned

The monopole sector ($\delta M$, $\delta Q$) at second order: towards or away from extremality?

### t09 — KN: second-order equations · planned

$a\to0$ gives t05; $Q\to0$ gives the Kerr second-order Teukolsky equation.

### t10 — KN: hyperboloidal spectral code, 2+1 per azimuthal number · planned

Published KN QNMs, and t06 at $a=0$.

### t11 — KN: quadratic QNMs and GW–EM mixing, extending Kerr · planned

Kerr quadratic-QNM results at $Q=0$.

### t12 — Near-extremal KN: sources and backreaction of Aretakis and zero-damped modes · planned

t08 at $a=0$; the strongly charged extremal regime of Fang–Giorgi–Wan.

## Simmering

### KN classification of the reconstruction's free functions · open

On RN we know exactly what fixes them; on KN only the Kerr–Newman family itself was identified. It is a 2+1 problem, not separable in this gauge.

### Decoupling the RN 2×2 radial system · open

Not needed for t06, which can evolve the coupled form directly.

### Map from the separated variables to our pair · open

Hintz's separated equations use other variables than $(\varphi_{+2},\varphi_{+1})$. The QNMs agree ([F2](#results)); the map between the variables is left for the KN tasks (t10, t11).

### Zero-frequency sector · open

Our gauge is fully fixed only for modes with $\omega\neq0$. Static or $\ell\le1$ first-order content (tides, shifts of mass and charge) would need the BMS frame fixed by charges.

### The electromagnetic waveform at second order · open

At scri the linear piece of $\varphi_{-1}$ mixes $\Psi_3$ and $\phi_2$, and its quadratic part is of the same order; the EM waveform needs a quadratic correction from the Bianchi identity at scri, or the reconstructed second-order potential. Identified in t13, not computed.

### Horizon derivatives of $h_{nn}$ · open

Second and third derivatives of one radiation-gauge component at the horizon do not converge, from a degenerate step of the reconstruction. Values and first derivatives are fine; set aside until a second-order source needs more.

## Dead ends

### Global least-squares reconstruction · superseded

Solving all transport equations at once converged only algebraically; marching them one by one, with analyticity at both ends, replaced it.

### t03 — Linear Teukolsky-type system on KN · superseded

Replaced by t04, which takes the Weller/DGS pair as variables and adds reconstruction; its literature notes are reused.

## Choices and conventions

### Signature and normalisation

$(+,-,-,-)$, $l\cdot n=1$, $m\cdot\bar m=-1$, $G=c=1$; Einstein–Maxwell coupling $\Phi_{ij}=2\phi_i\bar\phi_j$. On KN, $\rho=-1/(r-ia\cos\theta)$ and $\phi_1=-Q\rho^2/2$, so our charge is minus Hintz's and Giorgi's.

### Variables

The gauge-invariant pair $\varphi_{+2}=\Psi_0^{(1)}$, $\varphi_{+1}=2\phi_1\Psi_1^{(1)}-3\Psi_2\phi_0^{(1)}$ (owner's choice, 2026-10-05), not a phantom gauge.

### Gauge for reconstruction

Ingoing radiation gauge for both $h_{ab}$ and $A^{(1)}_a$, with the tetrad perturbation fixed by $l^{(1)}=0$. For second-order work the field is moved to the glued gauge: Bondi–Sachs with $A_r=0$ for $\sigma\le1/4$, radiation gauge for $\sigma\ge3/4$ ([F3](#results)).

### Numerics

Chebyshev collocation in $\sigma\in[0,1]$ from scri to the horizon. Eigenvalues are found in double precision and refined by Newton's method in 40-digit arithmetic (python-flint): in double precision the gravitational-led eigenvalue is ill-conditioned and stalls near $10^{-7}$.

### Charts

Boyer–Lindquist with the Kinnersley tetrad, and minimal-gauge hyperboloidal slices ($\sigma=r_+/r$ or $M/r$) with a Hartle–Hawking tetrad, regular at the future horizon and at scri.
