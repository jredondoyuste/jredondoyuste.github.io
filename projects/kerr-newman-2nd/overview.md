## The question

What does the dynamics of a charged black hole look like at second order in perturbation theory, and what changes close to extremality? We perturb Kerr–Newman with coupled gravitational and electromagnetic fields, expand the Einstein–Maxwell equations to second order, and study the structure of the equations that come out:

- How do the second-order sources behave, at the horizon, at null infinity, and as the black hole approaches extremality?
- What is the backreaction of the (near-)Aretakis-unstable modes of extremal black holes? Do perturbations push a black hole towards extremality, or away from it?
- How are quadratic quasinormal modes excited in Kerr–Newman, extending what is known for Kerr, and how do gravitationally and electromagnetically driven modes mix?

The last question is the practical one: how gravitational and electromagnetic waves couple around a charged black hole in the nonlinear regime.

## The set-up

The background is Kerr–Newman with mass $M$, spin $a$ and charge $Q$, horizons at

$$
r_\pm = M \pm \sqrt{M^2 - a^2 - Q^2},
$$

and extremality at $M^2 = a^2 + Q^2$. It is of Petrov type D, with an aligned Maxwell field: in a principal frame only $\Psi_2$ and $\phi_1$ are nonzero. We expand

$$
g = g_0 + \epsilon\, h^{(1)} + \epsilon^2 h^{(2)}, \qquad F = F_0 + \epsilon\, F^{(1)} + \epsilon^2 F^{(2)} .
$$

At each order the perturbed Weyl and Maxwell spinors obey the same linear system; at second order it has a source quadratic in the first-order fields,

$$
\mathcal{T}\big[\Psi^{(2)}, \phi^{(2)}\big] = \mathcal{S}\big[h^{(1)}, F^{(1)}\big].
$$

Because the background carries a Maxwell field, gravitational and electromagnetic perturbations are coupled already at first order, and at second order gravitational waves source electromagnetic ones and vice versa. The object of the project is $\mathcal{S}$: its structure, and what it does.

## The approach

- **Analytical first.** We build on Giorgi's derivation of the linear Teukolsky system for Kerr–Newman and extend it to second order. We work in spinor form as much as possible, starting from the Penrose wave equation for the Weyl spinor, following Andersson, Aksteiner and Bäckdahl.
- **Two steps.** Reissner–Nordström ($a = 0$) first, where the linear problem is under control; then Kerr–Newman.
- **Symbolic.** A sympy toolkit for the GHP/spinor calculus on type-D Einstein–Maxwell backgrounds carries the algebra, and checks every limit ($Q \to 0$: Kerr; $a \to 0$: RN).
- **Numerical.** Hyperboloidal slicings with spectral discretisation: 1+1 per multipole for RN, 2+1 per azimuthal number for KN.

## Where things stand (2026-09-28)

- The project is set up and the key sources are collected ([references](#references)).
- The plan is twelve tasks in four groups ([plan](#plan)). None is started.
- Next: the conventions and literature dictionary (t01) and the symbolic toolkit (t02), in parallel.

## Open threads

- **Reconstruction in Kerr–Newman.** The second-order source needs the first-order metric and Maxwell field. In Kerr these come from a Hertz potential; in Kerr–Newman no separable reconstruction is known. This is the main risk, and task t04 decides how we handle it.
