## §1. Conventions and the toolkit

Everything below is done in GHP, with a sympy toolkit that can drop to spinors above and to coordinates below. Before any physics, we fixed one set of conventions and a dictionary to every paper we compare with.

**Conventions.** Signature $(+,-,-,-)$, $l\cdot n=1$, $m\cdot\bar m=-1$, $\Phi_{ij}=2\phi_i\bar\phi_j$. Kerr–Newman (KN) in Boyer–Lindquist (BL) coordinates with the Kinnersley tetrad has
$$\rho=-\frac1{r-ia\cos\theta},\qquad \Psi_2=\rho^3\big(M+Q^2\bar\rho\big),\qquad \phi_1=-\tfrac12Q\rho^2,$$
and $\kappa=\sigma=\phi_0=\phi_2=\Psi_{0,1,3,4}=0$.

**Toolkit.** It has three layers, each checked against the one below:
- the AAB spinor operators;
- abstract GHP with a closed set of type-D rules;
- coordinates.

Any GHP expression can be pushed to coordinates and checked numerically on RN or KN.

**Dictionary.** Giorgi works in $(-,+,+,+)$ with horizontal tensors and a frame normalised by $g(e_3,e_4)=-2$. Her first components map to GHP as $e_4=l$, $e_3=2n$, $e_1+ie_2=\sqrt2\,m$. On first components her operators are $\nabla_4\to$ þ, $\nabla_3\to2\,$þ$'$, $\mathcal D\widehat\otimes\to\sqrt2\,\eth$. Her charge, like Hintz's, is minus ours.

## §2. The variables: one gauge-invariant pair

On KN a perturbation of $\Psi_0$ and of $\phi_0$ cannot be treated separately: $\phi_1\ne0$, so a null rotation shifts $\phi_0^{(1)}$, and $\Psi_1^{(1)}$ with it. Two combinations are invariant under diffeomorphisms and tetrad rotations:
$$\varphi_{+2}=\Psi_0^{(1)},\qquad \varphi_{+1}=2\phi_1\Psi_1^{(1)}-3\Psi_2\phi_0^{(1)} .$$
Chandrasekhar noticed the second; Dias, Godazgar and Santos (DGS) used the pair for the KN mode problem. Their GHP primes, $\Psi_4^{(1)}$ and $2\phi_1\Psi_3^{(1)}-3\Psi_2\phi_2^{(1)}$, carry the same information for ingoing data.

### The two auxiliary quantities

The derivation needs two first-order quantities built from the pair. With $A_\pm=(3\Psi_2\mp2\Phi_{11})^{-1}$:
$$L_\kappa=A_+\Big[(\eth'-\tau')\varphi_{+2}-(\text{þ}-4\rho)\frac{\varphi_{+1}}{2\phi_1}\Big],\qquad
L_\sigma=A_-\Big[(\text{þ}'-\rho')\varphi_{+2}-(\eth-4\tau)\frac{\varphi_{+1}}{2\phi_1}\Big].$$
On shell these are $L_\kappa=\kappa^{(1)}+(\text{þ}-\rho)f$ and $L_\sigma=\sigma^{(1)}+(\eth-\tau)f$, with $f=\phi_0^{(1)}/(2\phi_1)$. They are gauge-invariant versions of $\kappa^{(1)}$ and $\sigma^{(1)}$, and they are the bridge to every other formulation in §4.

## §3. Derivation of the coupled system

We start from the covariant spinor equations: Maxwell, Bianchi with the Maxwell stress as source, and $\Phi=K\phi\bar\phi$. Component by component they give the GHP Maxwell, Bianchi and Ricci equations.

**Linearising.** We linearise exactly, not term by term. Each quantity is its KN value plus a first-order part. A derivative of a background quantity equals its type-D rule plus a first-order "defect". The Ricci, Bianchi and Maxwell equations fix 21 of the 28 defects. The other 7 are gauge.

**Equations.** The Einstein and Maxwell equations enter only through their residuals $E_{ij}=\Phi_{ij}-2\phi_i\bar\phi_j$ and $J$. So every equation we derive comes as an exact statement: "this combination equals these residuals".

**Result.** Combining $B_1$, $B_3$, the Ricci identity $R_2$ and the commutator $[\text{þ},\eth]\phi_1$ gives the two master equations
$$E_{+2}\equiv(\text{þ}-\rho-\bar\rho)L_\sigma-(\eth-\tau-\bar\tau')L_\kappa-\varphi_{+2}=0,$$
$$E_{+1}\equiv(\text{þ}'+2\rho'-\bar\rho')L_\kappa-(\eth'+2\tau'-\bar\tau)L_\sigma+\frac{\varphi_{+1}}{\phi_1}=0 .$$
With $L_\kappa$, $L_\sigma$ substituted, these are two coupled second-order equations for $(\varphi_{+2},\varphi_{+1})$. Each is an **off-shell identity**: a linear combination of the linearised field equations, with nothing left over. We check this symbolically, and numerically to $10^{-100}$ for a generic metric and potential perturbation on RN and KN.

**Limits.** At $Q=0$ the coupling drops out and $E_{+2}$ is the spin-2 Teukolsky equation. A test Maxwell field gives spin-1 Teukolsky.

## §4. How the equations in the literature differ

All four formulations describe the same physics. They differ in which variables carry it, in whether a gauge is fixed, and in whether the auxiliary quantities are eliminated or kept as unknowns. We matched each one to ours exactly, with a control that breaks every match.

| | variables | gauge | form |
|---|---|---|---|
| DGS 2015, Weller et al. 2026 | the pair $(\varphi_{+2},\varphi_{+1})$, or its prime | none | 2 coupled 2nd-order PDEs |
| Chandrasekhar, Hintz 2026 | $\Psi_0^{(1)}$, $\Psi_1^{(1)}$, $\kappa^{(1)}$, $\sigma^{(1)}$ | phantom: $\phi_0^{(1)}=\phi_2^{(1)}=0$ | 4 first-order PDEs |
| Giorgi 2020: Teukolsky | $A$, $\mathfrak F$, $\mathfrak B$ (+ $\mathfrak X$) | none (invariants) | 3 coupled wave eqs + 1 transport |
| Giorgi 2020: gen. Regge–Wheeler | $\mathfrak p$, $\mathfrak q^{\mathbf F}$ | none | 2 coupled wave eqs, real potentials |

### Dias–Godazgar–Santos and Weller et al.: the pair, nothing else

DGS write the system for the negative-spin pair as
$$(\mathcal O+\Phi_{11}\mathcal P)\varphi+\Phi_{11}\mathcal Q\,\varphi'=0,$$
in NP with a Kinnersley-type tetrad. $\mathcal O$ is Teukolsky's operator; $\mathcal P$ and $\mathcal Q$ carry the charge coupling, with $A_\pm$ inside. They give no derivation beyond a recipe and no conventions, and in places the printed operators do not have consistent GHP weights.

Weller, Li, Wagle, Chen and Yunes give the positive-spin version on KN(–de Sitter), with weighted NP derivatives valid in any tetrad. Their eq. (4) is exactly $A_+^{-1}E_{+2}$ and $-6\Psi_2\phi_1E_{+1}$. They write the system as two first-order equations defining $L_\kappa$, $L_\sigma$ followed by two second-order ones, as we do. DGS's equations are the GHP prime of ours.

**What to watch.** $A_-$ is singular where $3\Psi_2+2\Phi_{11}=0$. At $a=0$ that is $r=4Q^2/(3M)$, outside the horizon once $Q^2/M^2>15/16$. In that form the system has a coefficient that blows up outside the horizon of near-extremal RN.

### Chandrasekhar and Hintz: fix the phantom gauge, keep the spin coefficients

With $\phi_1\ne0$, the two null rotations can set $\phi_0^{(1)}=\phi_2^{(1)}=0$ (the "phantom gauge"). Then $f=0$, so $\varphi_{+1}=2\phi_1\Psi_1^{(1)}$, $L_\kappa=\kappa^{(1)}$ and $L_\sigma=\sigma^{(1)}$. Chandrasekhar's positive-spin system is four first-order equations for $\Psi_0^{(1)}$, $\Psi_1^{(1)}$, $\kappa^{(1)}$, $\sigma^{(1)}$, suitably rescaled. They are our $B_1$, $B_3$, $R_2$ and $E_{+1}$ in that gauge.

Hintz (2026) starts from these four equations, his (1a)–(1d). We match each to ours, times a simple factor, with no remainder. He then:
- forms chiral combinations;
- multiplies by an explicit $2\times2$ matrix $X(r,\theta)$, an integrating factor. The coupling then splits as $R(r)+i\Theta(\theta)$, and the system **separates**.

The angular problem is a coupled, Dirac-type eigenproblem, not a spheroidal ODE. The radial problem is one second-order ODE per chirality. This proves mode stability on the real axis. There is no reconstruction; uniqueness is only announced (KN family plus gauge). His reduction to second order divides by $F_-$, which is our $A_-$ again.

### Giorgi: keep all the invariants, then pass to Regge–Wheeler

Giorgi works with Klainerman–Szeftel horizontal tensors. Her gauge invariants are $A$ ($\Psi_0$), $\mathfrak B$, $\mathfrak F$ and $\mathfrak X$. Through the dictionary:
$$\mathfrak b=-\varphi_{+1},\qquad \mathfrak f=-2\phi_1L_\sigma,\qquad \mathfrak x=2\phi_1L_\kappa .$$
So her $\mathfrak B$ is our $\varphi_{+1}$, and her $\mathfrak F$, $\mathfrak X$ are our auxiliary $L_\sigma$, $L_\kappa$, times $2\phi_1$. Where DGS and Weller eliminate $L_\kappa$, $L_\sigma$, she keeps them as unknowns. Her Teukolsky system has three coupled wave equations for $\mathfrak B$, $\mathfrak F$, $A$, with $\mathfrak X$ closed by a first-order transport equation. We checked her relations (75)–(78) and the $A$-equation (81): they hold modulo our identities and the field equations.

She then applies a **Chandrasekhar transformation**: one $\nabla_3$ derivative (two in vacuum), rescaled:
$$\mathfrak p\propto\nabla_3\mathfrak B+\dots,\qquad \mathfrak q^{\mathbf F}\propto\nabla_3\mathfrak F+\dots$$
The new variables obey a **generalised Regge–Wheeler system**: two wave equations with real potentials $V_1$, $V_2$, coupled at order $Q$ through angular derivatives, plus lower-order terms in $\mathfrak B$, $\mathfrak F$ that are $O(a)$. Because of those terms it is not closed on its own; it is used together with the Teukolsky system. This is the form suited to energy estimates. It is not a different set of degrees of freedom: on RN the gravitational RW variable is built from $A$, and on KN from $\mathfrak B$. We have **not** checked the Regge–Wheeler step, only her Teukolsky-level relations.

## §5. The system in coordinates

Each GHP operator is pushed to BL and to hyperboloidal coordinates and cached.

**RN.** With $\varphi_{+2}\propto{}_2Y_{\ell m}$ and $\varphi_{+1}\propto{}_1Y_{\ell m}$ the system separates into a $2\times2$ radial system. The diagonal terms have the form $a(r)+b(r)\lambda$ and the couplings $\propto Q\sqrt\lambda$, with $\lambda=(\ell-1)(\ell+2)$.

**KN.** The system does not separate in these variables; it is a 2+1 problem per azimuthal number $m$.

**Hyperboloidal slices.** The hyperboloidal operators equal the BL ones after the boost to the horizon-regular tetrad. With $\varphi_{+2}=\sigma^5\psi_2$ and $\varphi_{+1}=\sigma^6\psi_1$ both equations are regular at scri; at the horizon they are regular without rescaling. These are the variables a spectral code should evolve.

## §6. Reconstructing the metric and the potential

The second-order sources need $h_{ab}$ and $A^{(1)}_a$ themselves, not just the pair. On Kerr this is usually done with a Hertz potential (CCK). On KN that route is not available in closed form, so we follow Weller et al. and integrate along $l$ instead.

**Gauge.** Ingoing radiation gauge: $h_{ab}l^b=0$, $h^a{}_a=0$, $A^{(1)}_al^a=0$. Five scalars remain: $h_{nn}$, $h_{nm}$, $h_{mm}$, $A_n$, $A_m$. We fix the tetrad perturbation by $l^{(1)}=0$, $n^{(1)}=-\tfrac12h_{nn}l$, $m^{(1)}=-h_{nm}l+\tfrac12h_{mm}\bar m$. The linearised commutators then give every spin-coefficient perturbation in terms of $h$, and the Ricci identities give every curvature perturbation.

**The hierarchy.** Nine ODEs along $l$, each fed by the pair and by the earlier steps:
$$\varphi_{+2}\xrightarrow{R_2}\sigma^{(1)}\xrightarrow{}h_{mm},\quad
\varphi_{+1}\xrightarrow{B_1}\phi_0^{(1)}\xrightarrow{dA}A_m,\quad
h_{nm}\ (R_4),\quad \phi_1^{(1)}\ (M_1),\quad \Psi_2^{(1)}\ (B_2),\quad h_{nn}\ (R_5),\quad A_n\ (dA).$$
For example, H1 is $(\text{þ}-\rho-\bar\rho)\sigma^{(1)}=\varphi_{+2}$ and H4 is $(\text{þ}-\bar\rho)A_m=\phi_0^{(1)}$.

The hierarchy closes: no step needs anything the pair and the earlier steps do not supply. Each step is again an off-shell identity. We checked them symbolically, on the perturbed spacetime to $10^{-100}$, and in BL and both hyperboloidal charts.

## §7. What the integration functions are

Each step leaves one free function of $(u,\theta,\tilde\phi)$, the integration constant along $l$.

**The KN family.** We wrote $\delta M$, $\delta Q$ and $\delta a$ in this gauge in closed form. Each switches on exactly one free function: $\delta M$ the one of $\Psi_2^{(1)}$, $\delta Q$ the one of $\phi_1^{(1)}$, and $\delta a$ the one of $\phi_0^{(1)}$, with value $-iQ\sin\theta/\sqrt2$.

**What else survives.** On RN we set $\varphi_{+2}=\varphi_{+1}=0$ and imposed every remaining field equation, mode by mode up to $\ell=3$. Everything that survives is residual gauge, except:
- $\ell=0$: $\delta M$ and $\delta Q$. Magnetic charge and NUT are forced to zero.
- $\ell=1$: $\delta a$, and one mode at each of $s=\pm3M/(2Q^2)$.
- $\ell\ge2$: the four algebraically special modes. Their rates are Chandrasekhar's (as quoted by Dotti–Gleiser).

The field equations do not remove the algebraically special modes. Regularity at the horizon and at scri does (Wald 1973).

On KN only the family has been identified. The full classification is a 2+1 problem and remains open.
