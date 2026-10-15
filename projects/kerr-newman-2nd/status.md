**RN quadratic QNMs done; Kerr–Newman next (2026-10-15).** The RN second-order sources (t05) and the quadratic QNMs (t07) are done: Schwarzschild limit to $6\times10^{-4}$, the $(2,2)\times(2,2)$ couplings against $Q/M$ for every channel and parity content, the second-order EM waveform, the $\ell=1$ sector, and an estimate of the EM ringdown signal ([F5–F9](#results)). Next: the second-order equations on Kerr–Newman (t09).

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

### t05 — RN: second-order equations with explicit quadratic sources · done

Sources grav×grav, grav×EM, EM×EM for the t13 variables, from products of $\ell=2$ QNMs in the glued gauge, $Q/M$ from 0.2 to 0.99.

- **S1** First-order inputs for the $Q$ scan · done
  Glued first-order fields for both $\ell=2$ modes at every charge.
- **S2** The bilinear source operator · done
  The quadratic source as a bilinear operator on two first-order fields, all fourteen components.
- **S3** Sources for the QNM products · done
  Converged in the interior and, after an extended-precision fix of one horizon component, at the horizon. For $Q/M>\sqrt{15}/4$ the master system (in the t04 normalisation) is singular at $r=4Q^2/3M$, outside the horizon: deferred to t12.
- **S4** Result · done

### t07 — RN: quadratic QNMs and GW–EM mixing as functions of $Q/M$ · active

Second-order strain and EM ratios at scri, and ratios at the horizon, for products of the fundamental modes ([F5–F9](#results)).

- **S1** Schwarzschild references and conventions · done
  Bourg et al. and Khera–Ma–Yang values, with their mirror-mode content made explicit.
- **S2** Sources at small charge · done
  $Q/M=0.02,0.05,0.1$, for the $Q\to0$ limit.
- **S3** Second-order solver · done
  Three Chebyshev patches, 30 digits, a complex path near scri that removes the amplification of source round-off.
- **S4** Schwarzschild limit · done
  Agrees with the literature to $6\times10^{-4}$ after fixing the source extrapolation at scri.
- **S5** RN scan of the $(4,4)$ couplings · done
  All three channels, with exact control of the mirror content ([F5](#results)).
- **S6** Results · done
- **S7** Branch-cut channel · done
  Products of a mode with its own conjugate: one-sided limits exist; their average agrees with Bourg et al. within 20%; the jump is unresolved.
- **S8** Second-order EM waveform and couplings · done
  No quadratic correction on shell; GW$\times$EM$\to$EM survives in Schwarzschild ([F7](#results)).
- **S9** Ratios at the horizon · done
  Same order as the numerical-relativity values of Khera et al.; parked at this stage.
- **S10** Parity dependence in 2D · done
  Maps in the variable of Bourg et al. ([F6](#results)).
- **S11** Couplings with the $\ell=1$ EM mode · done
  $XZ$, $YZ$, $ZZ$ ([F8](#results)).

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

### Products of a mode with its own conjugate · open

Their frequency $2i\,\mathrm{Im}\,\omega$ lies on the branch cut, where regularity does not fix the solution: the amplitude depends on how the response is split between mode and tail. A time-domain treatment would settle it; the same issue returns on Kerr–Newman.

### Electromagnetic ringdown signal · paused

Estimated in [F9](#results): not directly observable. To revisit with spin, and with the excitation of the EM-led mode in charged mergers.

### Horizon ratios with an EM normalisation · open

EM-led parents are normalised by the gravitational $\Psi_0$ at the horizon, which inflates them as $Q^{-2}$; normalising by $\phi_0$ would remove that.

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

### Quadratic ratios and mirror content

$R_h=H^{(2)}/(H_1H_2)$ at scri, with $H$ the strain coefficient of ${}_{-2}Y_{\ell m}e^{-i\omega u}$ and $\mathcal A$ that of ${}_{-1}Y_{\ell m}$ in $rA_{\bar m}$. A real first-order mode is a regular mode plus its mirror with ratio $\rho$; we report $R$ as a polynomial in $\rho$, so any parity content can be read off ($\rho=0$ single mode, $\rho=1$ even parity).

