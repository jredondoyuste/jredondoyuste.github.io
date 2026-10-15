Newest first. One entry per working session: what was done, what was learned, and what went wrong.

### 2026-10-15 — the EM ringdown signal, and Kerr–Newman next

- An estimate of the EM ringdown of a charged binary-black-hole remnant ([F9](#results)): a fraction $\tfrac49(Q/M)^2$ of the GW power, plus at most about 20% from the quadratic channel, all at frequencies below the plasma frequency of every galactic medium. Not directly observable; parked until spin is added.
- t07 accepted; the horizon ratios stay at their present stage, and the branch-cut channel stays a diagnostic. Next: second-order equations on Kerr–Newman (t09).
- What went wrong: the EM/GW power ratio of the mode was first presented as new; it is Motohashi's ratio, which we had already reproduced ([F4](#results)).

### 2026-10-14 — quadratic QNMs of RN

- A second-order solver: three Chebyshev patches, 30 digits, and a complex path near scri, which stops source round-off from being amplified by the hyperboloidal resolvent.
- The Schwarzschild limit agrees with Bourg et al. and Khera–Ma–Yang to $6\times10^{-4}$, once the source is made to vanish exactly at scri.
- The $(2,2)\times(2,2)\to(4,4)$ couplings against $Q/M$ for GW$\times$GW, GW$\times$EM and EM$\times$EM$\to$GW, with exact control of the mirror content ([F5](#results)); parity maps in the variable of Bourg et al. ([F6](#results)).
- The second-order EM waveform needs no quadratic correction on shell; GW$\times$EM$\to$EM survives in Schwarzschild ([F7](#results)). Couplings with the $\ell=1$ EM mode ([F8](#results)); ratios at the horizon, of the same order as numerical relativity.
- What went wrong: noisy source fits at scri were amplified up to $10^4$ in the readout (fixed); products of a mode with its own conjugate lie on the branch cut and are not fixed by regularity: the average of the two sides matches the published value within 20%, the jump is unresolved.

### 2026-10-13 — RN second-order sources done

- Sources for all products of the $\ell=2$ modes at every charge, converged at the horizon after an extended-precision fix of one component.
- For $Q/M>\sqrt{15}/4$ the master system in our normalisation is singular outside the horizon, at $r=4Q^2/3M$: moved to the near-extremal task (t12).
- t05 finished; t07 (quadratic QNMs) planned and started with the Schwarzschild references and small-charge sources.

### 2026-10-12 — horizon sources converge

- The second-order sources did not converge at the horizon because of one first-order component with unconverged derivatives; an extended-precision evaluation fixed it.

### 2026-10-08 — second-order variables on Kerr–Newman

- The second-order variables are the first-order invariant pair applied to the second-order fields. They are invariant under second-order gauge, $U(1)$ and frame changes, for perturbations in any gauge, to $10^{-118}$ on RN and KN ([§8](#derivations)).
- Their equation is the first-order coupled operator with a quadratic source built from the Einstein–Maxwell residuals; checked on exact second-order solutions to $10^{-100}$.
- At scri the second-order GW waveform is the linear piece; at the horizon, in radiation gauge, the full $\Psi_0^{(2)}$ is. The electromagnetic channel needs extra quadratic terms at both ends.
- t13 finished; next, the explicit RN sources (t05).
- What went wrong: a sign slip in one tetrad rotation, caught by the normalisation check; building the test fields symbolically took 30 minutes per point until we moved the Lie derivatives onto the Taylor jets (1 minute). Our session-clearing tool did not fire.

### 2026-10-08 — the first-order field in Bondi–Sachs gauge, and its fluxes

- On Reissner–Nordström the radiation-gauge conditions contain the Bondi–Sachs ones; a closed-form gauge transformation makes our first-order field asymptotically flat, and gluing it to the radiation gauge keeps it regular at the horizon ([F3](#results)).
- A linearised Einstein–Maxwell operator written directly in coordinates, independent of our GHP code, confirms both the reconstruction and the glued field.
- Fluxes: the GW/EM split at scri equals Motohashi's exact ratio to $10^{-9}$ at the QNM frequency; the horizon shear and $\phi_0$ follow from gauge-invariant formulas ([F4](#results)).
- t06 and t14 finished; next, the second-order invariant variables (t13).
- What went wrong: a 13th-degree polynomial evaluated in the monomial basis put $10^{-12}$ noise into second derivatives (fixed with a Bernstein form); a wrong normalisation of an angular derivative, caught by the check; and one reconstructed component has unconverged second derivatives at the horizon, set aside for now.

### 2026-10-07 — RN QNMs, and the separated KN QNMs reproduced

- Coupled RN QNMs from our system ($\ell=1,2$, $n=0,1$, $Q/M$ up to $0.99$) match four published tables to every printed digit, except three values of one table, which are wrong ([F1](#results)).
- Destounis, Cardoso and Hintz (arXiv:2610.07142) appeared; we reproduced their KN tables and figures with our own solver of the separated equations, and found their spin-label isospectrality holds to $10^{-15}$ ([F2](#results)).
- What went wrong: double precision stalls the gravitational-led eigenvalue at $10^{-7}$ (fixed with a 40-digit Newton step); the first continuation run lost the mode at small $Q$; the `KN_a=0.00` files of a public dataset are not $a=0$ data.
- Started the reconstruction of the metric and potential for QNM data (t06 S4): it solves, but converges too slowly in the Maxwell part. Two rounds without a mechanism, so we are re-planning with simpler separating tests.

### 2026-10-06 — RN numerics planned; spectral bridge and reference tables

- Two new tasks: the RN numerics (t06) and the second-order gauge- and frame-invariant variables on KN (t13); the second-order sources (t05) come after both.
- The bridge from GHP equations to Chebyshev arrays on hyperboloidal slices, checked exactly against the t04 radial system (t06 S1).
- Published coupled RN QNM tables collected, with their conventions (t06 S2).

### 2026-10-06 — linear theory finished

- The reconstruction hierarchy written in BL and both hyperboloidal charts, and checked there ([§6](#derivations)).
- The tutorial notebook gained its reconstruction section and runs end to end in about 3 minutes.
- t04 done: the linear Kerr–Newman problem is closed.

### 2026-10-05 — the coupled KN system, the comparisons, and reconstruction

- Weller et al. (arXiv:2610.03701) appeared with the same gauge-invariant pair; we switched t03 to t04, built on that pair, and added reconstruction.
- The coupled system derived from the spinor equations, and shown to be a combination of the linearised Einstein–Maxwell equations ([§3](#derivations)).
- Exact matches to Weller et al., Hintz and Giorgi; a new observation: the second-order form divides by a factor that vanishes outside the horizon of near-extremal RN ([§4](#derivations)).
- Coordinate forms: RN separates into a 2×2 radial system per $\ell$; on hyperboloidal slices the fields fall off as $\sigma^5$, $\sigma^6$ at scri ([§5](#derivations)).
- Radiation-gauge reconstruction: nine transport equations, the KN family in that gauge, and what fixes the free functions on RN ([§6–§7](#derivations)).
- What went wrong: a sign of ours in the $\delta Q$ data (caught by the check), and sympy's factorisation over $\mathbb Q(i)$ stalling for hours (we now evaluate at exact points).

### 2026-10-01 — dictionary to Giorgi

- Giorgi's gauge invariants written as GHP scalars and checked to be gauge invariant on KN (t01 done).

### 2026-09-29 — toolkit and conventions

- The GHP/spinor/coordinate toolkit built and checked on RN, Kerr and KN (t02 done); one sign typo found in the literature.
- Hintz 2026 (arXiv:2609.33661) read: separation and mode stability of linear KN; his identities hold exactly in our toolkit.
- Background dictionary to Giorgi's formalism: her charge and Hintz's are minus ours.

### 2026-09-28 — plan

- Twelve tasks in four groups: foundations, linear theory, Reissner–Nordström, Kerr–Newman ([plan](#plan)).
- The main risk is named: reconstructing the first-order metric and Maxwell field in Kerr–Newman, where no separable reconstruction is known (t04).

### 2026-09-27 — project started

- Question, approach and success criteria written down ([overview](#overview)).
- Key sources collected: the Giorgi and Fang–Giorgi–Wan papers on charged black holes, the spinor methods of Andersson, Aksteiner, Bäckdahl and collaborators, and our earlier second-order work ([references](#references)).
