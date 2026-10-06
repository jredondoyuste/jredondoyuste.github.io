**Linear theory done (2026-10-06).** Foundations (t01, t02) and the full linear Kerr–Newman problem (t04) are done: the coupled system for the gauge-invariant pair, matched to Weller et al., Hintz and Giorgi, and the reconstruction of the metric and potential from that pair. Next is the second-order problem on Reissner–Nordström (t05) or the RN hyperboloidal code (t06).

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

### t05 — RN: second-order equations with explicit quadratic sources · next

Sources grav×grav, grav×EM, EM×EM; gauge dependence; behaviour at the horizon and at scri.

### t06 — RN: hyperboloidal spectral code, 1+1 per multipole · next

First and second order; coupled RN QNMs against published values.

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

## Dead ends

### t03 — Linear Teukolsky-type system on KN · superseded

Replaced by t04, which takes the Weller/DGS pair as variables and adds reconstruction; its literature notes are reused.

## Choices and conventions

### Signature and normalisation

$(+,-,-,-)$, $l\cdot n=1$, $m\cdot\bar m=-1$, $G=c=1$; Einstein–Maxwell coupling $\Phi_{ij}=2\phi_i\bar\phi_j$. On KN, $\rho=-1/(r-ia\cos\theta)$ and $\phi_1=-Q\rho^2/2$, so our charge is minus Hintz's and Giorgi's.

### Variables

The gauge-invariant pair $\varphi_{+2}=\Psi_0^{(1)}$, $\varphi_{+1}=2\phi_1\Psi_1^{(1)}-3\Psi_2\phi_0^{(1)}$ (owner's choice, 2026-10-05), not a phantom gauge.

### Gauge for reconstruction

Ingoing radiation gauge for both $h_{ab}$ and $A^{(1)}_a$, with the tetrad perturbation fixed by $l^{(1)}=0$.

### Charts

Boyer–Lindquist with the Kinnersley tetrad, and minimal-gauge hyperboloidal slices ($\sigma=r_+/r$ or $M/r$) with a Hartle–Hawking tetrad, regular at the future horizon and at scri.
