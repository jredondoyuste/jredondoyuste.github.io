Newest first. One entry per working session: what was done, what was learned, and what went wrong.

### 2026-10-27 — coupling tables for 15 parent pairs; t19 closed

- The general-parent code ran 15 pairs at 20 points of the $(a,Q)$ plane: 28 648 coefficients with calibrated errors and flags, 207 core-hours, no failed pair ([F19](#results)). With gravitational parents the GW coupling hardly changes over the plane; EM parents and EM output grow with charge.
- We settled the remaining choices: channels with $\lvert{\rm Re}\,W\rvert/\lvert W\rvert<0.15$ are marked unreliable, and the regression against earlier runs is bit-identity on one machine. t19 is done.
- What went wrong: the scan cost three times the estimate (207 against 73 core-hours), because some jobs took up to four hours for reasons we did not find.

### 2026-10-26 — validating couplings of general parents, and an error budget

- Every check of the general-parent couplings passes: Kerr and Schwarzschild references, the Clebsch–Gordan structure on RN, the swap of the two parents.
- Where Khera–Ma–Yang's fits of the difference channel disagree with ours, their $a=0$ values also disagree with the full table of Bucciotti et al., which agrees with ours; we take the fits to be in error.
- An error budget calibrated against runs one step finer in every resolution: the error is below the estimate in 99.1% of 793 rows.
- First overtones as parents: their QNMs match the Kerr tables to $7.5\times10^{-9}$, and their sum couplings are calibrated. Difference channels close to the branch cut are beyond the code.
- A cleaner interface: `knpert.couplings(a, Q, P1, P2)`, with the numbers unchanged to the last bit.
- A literature review on whether the near-horizon AdS$_2$ geometry fixes the near-extremal coupling: one earlier estimate (extremal Kerr), nothing with charge.
- What went wrong: the calibration exposed a $3\times10^{-8}$ error in every parent amplitude since t10, from a fit at scri that silently truncated. It is fixed; the shift is far below the stated errors of the earlier results.

### 2026-10-23 — near-extremal couplings to $\kappa=10^{-3}$

- On the near-Kerr lines $Q=0.1$ and $Q=0.6$ the $(4,4)$ couplings level off down to $\kappa=10^{-3}$ ([F17](#results)); ${\rm GW\times EM}$ at $Q=0.6$ still rises, close to logarithmically.
- The difference channel ${\rm GW^*\times EM}\to(2,0)$ grows as $1/\kappa$ in GW output, with slope $-1.003$ to $-1.006$; its EM output is flat ([F18](#results)). It lies near the branch cut, so the result is provisional.
- We are closing t12 and writing down what worked and what did not; the near-extremal scan moves to a new task on the general code.
- What went wrong: children that are strongly damped in units of $\kappa$ pick up a forbidden solution at the horizon, whose amplitude grows with resolution. This is why pure RN stops at $\kappa\approx0.014$.

### 2026-10-22 — the general-parent code, and exceptional points

- The package couples any list of parents; their QNMs are followed from RN with spin raised in steps that halve when needed. Without halving, a control lands on a wrong root, as it should.
- $\kappa=0.002$ converged on the near-Kerr lines by raising the first-order resolution to 384–512 points.
- A new task on exceptional points of the Kerr–Newman spectrum: a paper of 2026-10-21 finds four, one new, but gives no amplitudes.

### 2026-10-21 — the throat resolved to $\kappa=0.005$

- With near-horizon patches the near-Kerr lines converge at $\kappa=0.005$; $\kappa\le0.002$ failed in the first-order gauge step until the radial resolution was raised.

### 2026-10-20 — one package for the whole pipeline

- `knpert`, run from $(a,Q)$ alone, reproduces every headline number of t06, t07, t10 and t11 within its band, at 0.92 core-hours per point. t17 is done.
- Near-horizon patches added to the package (t18); the default layout gives the same numbers as before.

### 2026-10-19 — near-extremal RN and the first near-extremal KN lines

- The singular point of the RN master system at $r=4Q^2/3M$ is only apparent; we get ratios at $Q=0.99$ through it.
- First lines towards extremal KN, with a map of the nearby zero-damped modes.
- What went wrong: the $m=1$ chain did not converge at $\kappa=0.05$–$0.01$. We traced it to the horizon condition for strongly damped children.

### 2026-10-18 — tasks closed, and a pedagogical note

- t07, t09 and t11 closed; a six-page pedagogical note on the calculation (t16).
- A plan for near extremality (t12), approved the same day.

### 2026-10-18 — a first physical reading of the Kerr–Newman couplings

- The coupling surfaces of [F15](#results) in production plots, and a first reading of where they come from ([F16](#results)). At first order the GW–EM mixing of the two $(2,2,0)$ parents is the RN decoupling rotation by $\theta_2(Q)$, to 6 digits at $a=0$; spin multiplies it by a factor $f(a)$ that is the same at every charge.
- Most of the GW-to-EM conversion at second order follows the same rotation of the child; the directly quadratic part is at most about 8% of the output.
- A helicity selection rule: two co-rotating EM modes do not source the GW mode on a vacuum background, so $\mathcal R^{\rm GW}_{ {\rm EM\times EM},++}\propto Q^2$. It predicts that the EM-sourced Kerr ratio of Aly and Stojkovic vanishes for two prograde $(2,2,0)$ modes.
- At the Schwarzschild corner we reproduce the published ratios of Ma et al. and Bucciotti et al. within 0.3%. One channel, $\mathcal R^{\rm GW}_{ {\rm GW^*\times EM},\bar+\,+}$, grows fivefold with spin at small charge, and we do not know why.
- New notation on the page: $\mathcal R^{\rm out}_{ {\rm parents},\pm\pm}$ ([Choices and conventions](#status)).
- What went wrong: the change of notation came after the plots were made, so every Kerr–Newman figure was relabelled; the figures of [F5–F8](#results) still carry the old labels. Our literature notes had the two modes of Pani, Berti and Gualtieri swapped; the analysis caught it, and a control with the swapped labels fails as it should.

### 2026-10-17 — compiled kernels, and the scan over Kerr–Newman

- The quadratic source is now replayed in compiled code from a recording of the Python operator, which stays the definition. One parameter point fell from 30.6 to about 2.4 core-hours; the compiled source equals the Python one to the rounding floor, and the off-shell identity holds to $1.7\times10^{-14}$ ([F14](#results)). t15 finished.
- A first stage on a coarse design showed no structure, so a second stage filled the quarter disk $a^2+Q^2\le0.9$: 153 points, 416 core-hours, with a per-point uncertainty for every coupling ([F15](#results)).
- Both edges agree with what we know: RN with t07 to $1.2\times10^{-3}$, Kerr with Khera–Ma–Yang inside their 1% fit accuracy. The surfaces are smooth everywhere: the two parent frequencies never cross.
- What went wrong: the first off-shell runs of the compiled kernel failed on a recursion in our test harness (fixed and rerun). The agreement bar for the compiled source had to be redefined as noise-limited: the planned $10^{-12}$ was below the rounding floor of the production inputs.

### 2026-10-16 — the Kerr–Newman solver, and the first Kerr–Newman quadratic QNMs

- The glued first-order field on Kerr–Newman: asymptotically flat and regular at the horizon, with the gauge fixed uniquely by the falloff ([F10](#results)). An input resolution study shows the input is converged; the gauge step leaves a floor of a few $10^{-8}$ near scri.
- Second-order sources on the glued fields, including the products with the mirror modes; at $a=0$ they reproduce the RN sources ([F11](#results)).
- A 2D solver in $(\sigma,x)$, three Chebyshev patches in double precision, readout error below $8\times10^{-7}$. It passes both acceptance tests: the RN limit within t07's spread, and the Kerr limit against Khera–Ma–Yang within $2.1\times10^{-3}$ ([F12](#results)). t10 finished.
- The first Kerr–Newman quadratic QNM ratios, at $a=0.2$, $Q=0.4$ ([F13](#results)).
- What went wrong: we first blamed the $10^{-8}$ floor on aliasing in $x$, but it survived finer grids, so that explanation failed and the mechanism is open. A ruling that only conjugate products were needed was wrong: on Kerr–Newman a mode and its mirror are independent, and the mixed sources had to be added. A $3\times10^{-4}$ gap at $a=0$ came from our old RN reference fields, which were off at the horizon; we recomputed them. An environment bug in the job chain killed two stages of the Kerr runs before we fixed it, and the batch jobs for the free functions of the reconstruction ran out of memory and were stopped.

### 2026-10-15 — Kerr–Newman: route chosen, first-order field, source operator

- t09 started. Hintz's separated form takes a source, but it divides by $Q$, so its Kerr limit is singular; we chose the coupled form, with a side check that the angular projection is sound at complex frequency.
- The KN QNM data written in our invariant pair (residual $10^{-19}$); the radiation-gauge reconstruction on KN, with an independent check to $3\times10^{-16}$ in extended precision.
- The residual gauge of that radiation gauge on KN in closed form: three free functions of $x$, with no obstruction to an asymptotically flat field.
- The quadratic source operator on KN, with the RN and Kerr limits passing and the off-shell identity holding.
- Acceptance for the KN results set: the RN and Kerr limits, the latter against Khera–Ma–Yang with spin.
- What went wrong: the symbolic integration of the free functions of the reconstruction stalled at one transport equation, and then lost runs to an interrupted session; that route was later stopped.

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
