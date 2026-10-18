**Kerr–Newman quadratic couplings mapped (2026-10-18).** The second-order equations, sources and a 2D solver now run on Kerr–Newman (t09, t10); they reproduce both limits, Reissner–Nordström at $a=0$ and Khera–Ma–Yang's Kerr ratios at $Q\to0$. Compiled kernels (t15) cut a parameter point from 30.6 to about 2.4 core-hours, and the scan (t11) maps every quadratic coupling of the two $(2,2,0)$ modes over $a^2+Q^2\le0.9$, with a first physical reading ([F10–F16](#results)). Next: the owner's review of t11, then near-extremality (t08, t12).

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
  Products of a mode with its own conjugate: one-sided limits exist; their average agrees with Bourg et al. within 20%; the jump is unresolved. Accepted by the owner as a diagnostic (2026-10-15).
- **S8** Second-order EM waveform and couplings · done
  No quadratic correction on shell; GW$\times$EM$\to$EM survives in Schwarzschild ([F7](#results)).
- **S9** Ratios at the horizon · done
  Same order as the numerical-relativity values of Khera et al.; parked at this stage.
- **S10** Parity dependence in 2D · done
  Maps in the variable of Bourg et al. ([F6](#results)).
- **S11** Couplings with the $\ell=1$ EM mode · done
  $\mathcal R^{\rm GW}_{{\rm GW\times EM_1}}$, $\mathcal R^{\rm GW}_{{\rm EM\times EM_1}}$, $\mathcal R^{\rm GW}_{{\rm EM_1\times EM_1}}$, with ${\rm EM_1}$ the $\ell=1$ EM-led mode ([F8](#results)).

### t08 — Extremal RN: backreaction of Aretakis-unstable modes · planned

The monopole sector ($\delta M$, $\delta Q$) at second order: towards or away from extremality?

### t09 — KN: second-order equations, formulation and sources · active

The coupled DGS/Weller form of t04/t13 carried to Kerr–Newman, with the first-order QNM field in the glued gauge and the quadratic sources ([F10, F11](#results)). All subtasks are done; the task stays open for the classification of the reconstruction's free functions on KN.

- **S1** Literature on sourced separated KN equations · done
  No sourced or second-order use of Hintz's separation exists; completeness of the angular functions at complex frequency is unproved.
- **S2** The sourced equations in both forms, and the projection test · done
  Hintz's transformations are algebraic, so a source passes through them; projecting on the non-self-adjoint angular functions at complex $\Omega$ converges exponentially.
- **S3** Decision memo · done
  Hintz's form stays separable with a source but is singular as $Q\to0$; the coupled form is the main route, the separated one a possible cross-check.
- **S4** First-order KN field for QNM data in the glued gauge · done
  QNM data for our pair on $(\sigma,x)$, the radiation-gauge reconstruction checked by an independent operator to $3\times10^{-16}$, and the glued gauge, asymptotically flat at scri and regular at the horizon ([F10](#results)). The KN classification of the free functions was not finished.
- **S5** KN bilinear source operator · done
  The quadratic source as a bilinear operator on KN: off-shell identity to $1.7\times10^{-14}$; $a\to0$ gives t05, $Q\to0$ gives Spiers–Pound–Moxon's Kerr source.
- **S6** Sources on the glued QNM fields · done
  All products of the two $(2,2,0)$ modes and their mirrors at $a=0.2$, $Q=0.4$; $a=0$ against t05 to $4\times10^{-7}$ ([F11](#results)).

### t10 — KN: 2D second-order solver in $(\sigma,x)$ and the first KN quadratic QNMs · done

Hyperboloidal spectral solver of the second-order equation on KN, regular at the horizon and at scri; accepted on both limits ([F12, F13](#results)).

- **S1** 2D solver and its checks · done
  Three Chebyshev patches in $\sigma$, Gauss nodes in $x$, complex path near scri; readout error at scri $\lesssim8\times10^{-7}$.
- **S2** RN limit · done
  At $a=0$, $Q=0.4$ every GW and EM coefficient lies within t07's spread.
- **S3** First KN quadratic QNMs · done
  All channels of the $(2,2,0)$ products at $a=0.2$, $Q=0.4$, GW and EM output, $\ell\le8$ ([F13](#results)).
- **S4** Kerr limit · done
  Extrapolated to $Q\to0$, Khera–Ma–Yang's $\mathcal R_{++}$, $\mathcal R_{+-}$ at $a=0.2,0.5,0.7$ within $2.4\times10^{-3}$, inside their 1% fit accuracy ([F12](#results)).
- **S5** Results · done

### t15 — Fast compiled kernels for the KN pipeline · done

The bilinear source as compiled C++, generated from the Python operator, which stays the definition ([F14](#results)).

- **S1** Compiled bilinear source · done
  Equal to the Python reference to rounding; off-shell identity to $1.7\times10^{-14}$; about 50 times faster on one core.
- **S2** Further savings · done
  Right-sized job requests, the background built once per point, the expensive gauge check run on validation points only. A symbolic-in-$(a,Q)$ build was not done.
- **S3** Integration · done
  The new chain reproduces t10 within its rounding floor; a full point costs about 2.4 core-hours instead of 30.6.

### t11 — KN: cost model and scan of the quadratic couplings over $(a/M,Q/M)$ · active

The measured cost per point, the cheapest scan design, the scan itself, and its physics ([F15, F16](#results)).

- **S1** Cost model and scan design · done
  Profiling showed the source dominated (now t15); a 12-point probe was smooth with no frequency crossing; the owner chose a design over the quarter disk.
- **S2** The scan · done
  153 points over $a^2+Q^2\le0.9$, $Q\ge0.05$, with per-point uncertainties and an interpolant; 416 core-hours ([F15](#results)).
- **S3** Physics with the scan · active
  Literature, small-$a$ and small-$Q$ expansions, the decoupling rotation and a helicity selection rule ([F16](#results)); production plots; this page. The owner then decides on closing t11.

### t12 — Near-extremal KN: sources and backreaction of Aretakis and zero-damped modes · planned

t08 at $a=0$; the strongly charged extremal regime of Fang–Giorgi–Wan.

## Simmering

### KN classification of the reconstruction's free functions · open

On RN we know exactly what fixes them; on KN only the Kerr–Newman family itself was identified. It is a 2+1 problem, not separable in this gauge. An exact attempt in t09 (S4) got through the whole hierarchy with no logarithms and passed its $a=0$ controls, but the KN runs were stopped (owner, 2026-10-16); the quadratic ratios at scri do not need it.

### Decoupling the RN 2×2 radial system · open

Not needed for t06, which can evolve the coupled form directly.

### Map from the separated variables to our pair · open

Hintz's separated equations use other variables than $(\varphi_{+2},\varphi_{+1})$. The QNMs agree ([F2](#results)). t09 chose the coupled form for second order, so the map is now only needed for a separated cross-check.

### Zero-frequency sector · open

Our gauge is fully fixed only for modes with $\omega\neq0$. Static or $\ell\le1$ first-order content (tides, shifts of mass and charge) would need the BMS frame fixed by charges.

### Products of a mode with its own conjugate · open

Their frequency $2i\,\mathrm{Im}\,\omega$ lies on the branch cut, where regularity does not fix the solution: the amplitude depends on how the response is split between mode and tail. A time-domain treatment would settle it. The same issue returns on Kerr–Newman: the scan (t11) computes the only off-cut $M=0$ channel, ${\rm GW^*\times EM}$, and leaves the self-conjugate ones out.

### Electromagnetic ringdown signal · paused

Estimated in [F9](#results): not directly observable. To revisit with spin, and with the excitation of the EM-led mode in charged mergers.

### Horizon ratios with an EM normalisation · open

EM-led parents are normalised by the gravitational $\Psi_0$ at the horizon, which inflates them as $Q^{-2}$; normalising by $\phi_0$ would remove that.

### Retrograde $(2,-2)$ mode · open

The independent counter-rotating mode at $\omega_{2,-2,0}$ (not the mirror of $(2,2,0)$) is not computed on KN; products $(2,2)\times(2,-2)$ need it.

### Quadratic horizon fluxes on KN · open

The KN solver reads out at scri only; the horizon side (the plus system) has a near-null mode in double precision near scri and was not used.

### Normalisation of the $\ell=4$ EM output · open

The rotation reading of [F16](#results) assumes the same amplitude normalisation $N_4=\sqrt8$ at $\ell=4$ as measured at $\ell=2$; checking it needs an $\ell=4$ linear run. The EM output normalisation on KN is inferred, not measured (measured on RN).

### Growth of the $M=0$ difference channel with spin · open

$\lvert\mathcal R^{\rm GW}_{{\rm GW^*\times EM},\bar+\,+}/Q\rvert$ grows fivefold along $a$ at small $Q$, while the frequency gap changes by 24% ([F16](#results)). Unexplained.

### Near-extremal Kerr–Newman scan · open

The scan stops at $a^2+Q^2=0.9$; near extremality belongs to t12, which also holds the singular point of the master system for $Q/M>\sqrt{15}/4$.

### A clean public rewrite of the fast kernels · open

The compiled kernels were written for speed (owner, 2026-10-17); a readable public version is a later task.

### Horizon derivatives of $h_{nn}$ · open

Second and third derivatives of one radiation-gauge component at the horizon do not converge, from a degenerate step of the reconstruction. Values and first derivatives are fine; set aside until a second-order source needs more.

## Dead ends

### Global least-squares reconstruction · superseded

Solving all transport equations at once converged only algebraically; marching them one by one, with analyticity at both ends, replaced it.

### t03 — Linear Teukolsky-type system on KN · superseded

Replaced by t04, which takes the Weller/DGS pair as variables and adds reconstruction; its literature notes are reused.

### Hintz's separated form as the second-order route · dropped

Separable with a source, but it divides by $Q$, so the Kerr limit is singular; the coupled form was chosen (t09 S3, 2026-10-15).

### $x$-aliasing as the cause of the glued-field floor on KN · failed

We first attributed the $10^{-8}$ floor of the glued KN field near scri to aliasing in $x$; at finer input grids the floor stayed, so the explanation failed its control. The floor is made in the gauge step; its mechanism is open, and the sources do not inherit it ([F10](#results)).

### Conjugate products alone for the KN ratios · superseded

On KN the reflection does not map a mode to a multiple of itself, so the mode and its mirror span two dimensions and the ratios $\mathcal R_{++}$, $\mathcal R_{+-}$ need the mixed mode–mirror sources as on RN; the earlier ruling was corrected (2026-10-16).

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

The ratio at scri is the second-order amplitude over the product of the parents' amplitudes: $H$ is the strain coefficient of ${}_{-2}Y_{\ell m}e^{-i\omega u}$ (GW) and $\mathcal A$ that of ${}_{-1}Y_{\ell m}$ in $rA_{\bar m}$ (EM). A real first-order mode is a prograde mode plus its mirror with ratio $\rho$; we report each ratio as a polynomial in $\rho$, so any parity content can be read off ($\rho=0$ single mode, $\rho=1$ even parity).

### Notation for the quadratic ratios (owner, 2026-10-18)

$\mathcal R^{\rm out}_{{\rm parents},\pm\pm}$: the superscript is the output, GW or EM; the subscript names the parents, ${\rm GW\times GW}$, ${\rm GW\times EM}$, ${\rm EM\times EM}$ for the gravitationally and electromagnetically led $(2,2,0)$ modes, and ${\rm GW^*\times EM}$ for the $M=0$ difference channel; the signs say whether each parent enters through its prograde ($+$) or mirror ($-$) part, a bar marking a conjugated amplitude (GW sign first). So $\mathcal R^{\rm GW}_{{\rm GW\times GW}}=\mathcal R_{++}+\mathcal R_{+-}\rho+\mathcal R_{--}\rho^2$, with $\mathcal R_{++}$, $\mathcal R_{+-}$ those of Khera–Ma–Yang, and $\mathcal R_{--}=0$.

### Kerr–Newman route

The coupled DGS/Weller form, the RN procedure and gauge carried over (owner, 2026-10-15). Angles in $x=\cos\theta$ or a spin-weighted harmonic basis, not a $\theta$ grid. Scans in double precision, extended precision only where a check shows it is needed. A KN result is accepted only if it reproduces both the RN limit (t07) and the Kerr limit (Khera–Ma–Yang).

### Scan design and interpolation

17 Chebyshev–Lobatto nodes in $u=a/\sqrt{0.9-Q^2}$ times 9 rows in $Q^2$, covering the quarter disk $a^2+Q^2\le0.9$ (owner, 2026-10-17). Channels that vanish at $Q\to0$ are interpolated as $\mathcal R/Q^p$, with $p$ fixed by charge parity and checked by the small-$Q$ slope.

