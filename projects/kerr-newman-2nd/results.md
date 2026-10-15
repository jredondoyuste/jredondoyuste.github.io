### F9 — Could the electromagnetic ringdown of a charged binary-black-hole remnant be seen? (unverified)

<figure><a href="figs/rn_ringdown_em_signal.png"><img src="figs/rn_ringdown_em_signal.png" alt="Ringdown EM energy and peak flux against Q/M, and ringdown frequency against remnant mass compared with plasma frequencies"></a><figcaption>The EM ringdown carries $\tfrac49(Q/M)^2$ of the GW power, but at frequencies that no galactic plasma lets through.</figcaption></figure>

An order-of-magnitude estimate built on our RN numbers (no spin). The gravitational-led $(2,2,0)$ mode carries its own EM field, a fixed fraction of its strain set by the mode: the power ratio is Motohashi's $(L-1)/(L+1)\to\tfrac49(Q/M)^2$, which our fields reproduce ([F4](#results)). The quadratic $(2,2)\times(2,2)\to(4,4)$ EM response ([F7](#results)) adds $0.10\,(Q/M)^2A_{220}^2$ of the GW power at $2f_{220}$, which is $0.22\,A_{220}^2$ of the linear part. The scale comes from the $(2,2,0)$ amplitude fit of London (arXiv:1801.08208), $\lvert A_{220}\rvert\approx4\eta\approx1$ at the strain peak.

- **(a)** Ringdown EM energy against $Q/M$ for a GW150914-like remnant ($62\,M_\odot$) and a $10^6\,M_\odot$ LISA remnant; solid linear, dashed quadratic; dotted the GW ringdown energy. Bands: Wald charges $Q=2BJ$ (stellar $B=1$–$10^4$ G; supermassive $10^2$–$6\times10^5$ G), the charges proposed for FRB and short-GRB counterparts (Zhang, arXiv:1602.04542), and the ringdown bound $Q/M<0.33$ for GW150914 (Carullo et al., arXiv:2109.13961).
- **(b)** Peak vacuum flux at 400 Mpc, independent of the mass: $\approx50\,(Q/M)^2$ erg s$^{-1}$ cm$^{-2}$ for the linear part.
- **(c)** $f_{220}$ and $2f_{220}$ against remnant mass, with the plasma frequency $f_p=8.98\,\mathrm{kHz}\sqrt{n_e/\mathrm{cm^{-3}}}$ of the intergalactic medium, the hot and warm ionised ISM, the solar wind and the ionosphere (typical densities).

**Takeaway.** The EM ringdown is never more than a fraction $(Q/M)^2$ of the GW one, and the quadratic part changes that by at most about 20%. At Wald charges the energy is below $10^{27}$ erg for stellar remnants. Whatever the charge, the frequency is below the plasma frequency of every galactic medium on the way, so the wave does not reach us; only reprocessed emission in the host could, and that needs a model of its own. To revisit with spin, when the Kerr–Newman frequencies are in hand.

**Reproduce.** `brainstorm/tasks/b02-ringdown-em-signal/S1/`: `linear_content.py`, then `money_plot.py` (seconds).

### F8 — Does the $\ell=1$ electromagnetic mode drive quadratic gravitational waves? (unverified)

<figure><a href="figs/rn_qqnm_l1_couplings.png"><img src="figs/rn_qqnm_l1_couplings.png" alt="Magnitude and phase of the quadratic GW couplings involving the l=1 EM-led mode, against Q/M"></a><figcaption>Couplings with the $\ell=1$ EM-led mode $Z$ follow the $\ell=2$ pattern: GW$\times$EM linear in $Q$, EM$\times$EM finite at $Q\to0$ only through mirror content.</figcaption></figure>

The second-order strain ratio $R_h$ against $Q/M$ for products involving the $\ell=1$, $n=0$ EM-led QNM $Z$ (Schwarzschild frequency $0.248263-0.092488i$, matching the literature to $5\times10^{-9}$): green $XZ\to(3,3)$, pink $YZ\to(3,3)$, orange $ZZ\to(2,2)$. Solid: single-mode parents ($\rho=0$); dashed: even parity ($\rho=1$). Top $\lvert R_h\rvert$, bottom $\arg R_h$.

- $XZ$: $R_h\approx0.35\,Q$.
- $ZZ$: single mode $\propto Q^2$, but the regular$\times$mirror coefficient tends to $-0.096-0.045i$ at $Q\to0$; likewise for $YZ$.
- Unlike $(4,4)$, the mirror$\times$mirror terms do not vanish here.
- Controls: parity exactly, angular doubling to $4\times10^{-15}$, the selection rule for odd $\ell_1+\ell_2+L$. Cost: 79 core-hours.

**Takeaway.** Every EM-led mode with mirror content drives quadratic GWs already in Schwarzschild; the charge adds the single-mode part.

**Reproduce.** `tasks/t07-rn-qqnms/S11/`: `submit_all.sh` (sources, ~80 core-h), `analyse.py`, `plot_qscan_l1.py`.

### F7 — How strongly do two QNMs drive a second-order electromagnetic wave? (unverified)

<figure><a href="figs/rn_qqnm_em_couplings.png"><img src="figs/rn_qqnm_em_couplings.png" alt="Magnitude of the second-order EM coupling ratios against Q/M for XX, XY and YY, targets (4,4) and (2,0)"></a><figcaption>GW$\times$GW$\to$EM and EM$\times$EM$\to$EM grow linearly in $Q$; GW$\times$EM$\to$EM survives in Schwarzschild.</figcaption></figure>

The second-order EM amplitude at scri ($rA_{\bar m}$) of the quadratic QNM, divided by the product of first-order amplitudes, against $Q/M$; left $(4,4)$, right $(2,0)$; blue $XX$, orange $XY$, green $YY$.

- On shell the second-order EM waveform at scri needs no quadratic correction: the quadratic terms of the Bianchi identity there vanish at leading order (to $1.5\times10^{-5}$), so it follows from the second-order Weyl readouts by the first-order map. This settles an open point of t13.
- $XX\to$EM and $YY\to$EM are $\propto Q$; $XY\to$EM tends to $0.197-0.014i$ at $(4,4)$: a gravitational wave scattering an EM wave in Schwarzschild. No literature value to compare with.
- Mirror$\times$mirror terms vanish; parity covariance to $2\times10^{-9}$.

**Takeaway.** The GW$\times$EM channel converts into EM radiation without any background charge; the purely gravitational channel needs the charge.

**Reproduce.** `tasks/t07-rn-qqnms/S8/`: `analyse_em.py` (728 solves, 1.6 core-h), `plot_em.py`.

### F6 — How does the quadratic ratio depend on the parity content of the mode? (unverified)

<figure><a href="figs/rn_qqnm_parity_Q0p8.png"><img src="figs/rn_qqnm_parity_Q0p8.png" alt="Maps of magnitude and phase of the quadratic ratio over the complex plane of x = C^-/C^+, at Q/M = 0.8"></a><figcaption>At $Q/M=0.8$ the EM$\times$EM$\to$GW ratio changes shape; GW$\times$GW and GW$\times$EM barely move.</figcaption></figure>

$R_h$ over the complex plane of $x=C^-/C^+$, the ratio of odd- to even-parity strain amplitudes, the variable of Bourg et al. (arXiv:2405.10270, Fig. 1); $x=0$ is even parity, $x=i$ a single regular mode, $x=-i$ a pole (pure mirror). Columns: GW$\times$GW $\to(4,4)$, the same $\to(4,0)$, EM$\times$EM$\to$GW, GW$\times$EM; top $\lvert R_h\rvert$, bottom $\arg R_h$. Our mirror ratio is $\rho=(1+ix)/(1-ix)$, and $R_h$ is quadratic in $\rho$ ([F5](#results)), so the map is exact.

<figure><a href="figs/rn_qqnm_parity_Q0p02.png"><img src="figs/rn_qqnm_parity_Q0p02.png" alt="The same maps at Q/M = 0.02"></a><figcaption>The same at $Q/M=0.02$: the Schwarzschild picture.</figcaption></figure>

- GW$\times$GW: $0.137$ at a single mode, $0.153$ at even parity, nearly the same at both charges; at $Q\to0$ the published values sit where their parity content puts them: Khera–Ma–Yang's at a single mode, Bucciotti et al.'s at even parity.
- EM$\times$EM$\to$GW: at small $Q$ it is $\approx\beta\rho$ and vanishes at a single mode; at $Q/M=0.8$ the zero moves to $x\approx0.9-0.8i$ and the even-parity value is $0.33$.
- GW$\times$EM: within $\pm4\%$ of $0.43$ at $Q/M=0.8$.

**Takeaway.** The spread of published Schwarzschild ratios is a spread in parity content, and the same map extends it to charged holes.

**Reproduce.** `tasks/t07-rn-qqnms/S10/parity_maps_x.py` (from the F5 coefficients, seconds).

### F5 — How does the quadratic $(2,2)\times(2,2)\to(4,4)$ coupling change with charge? (unverified)

<figure><a href="figs/rn_qqnm_couplings_vs_Q.png"><img src="figs/rn_qqnm_couplings_vs_Q.png" alt="Magnitude and phase of the quadratic GW strain ratio against Q/M for GW x GW, GW x EM and EM x EM -> GW"></a><figcaption>GW$\times$GW barely depends on charge; GW$\times$EM grows linearly; EM$\times$EM$\to$GW is finite at $Q=0$ only with mirror content.</figcaption></figure>

The second-order strain ratio $R_h$ of the $(4,4)$ quadratic QNM driven by two $\ell=2$, $n=0$ modes, against $Q/M\in[0.02,0.8]$: blue GW$\times$GW ($H^{(2)}/H^2$), green GW$\times$EM ($H^{(2)}/H\mathcal A$), orange EM$\times$EM$\to$GW ($H^{(2)}/\mathcal A^2$). Solid: single-mode parents ($\rho=0$); dashed: even parity ($\rho=1$). Black symbols at $Q=0$: the Schwarzschild values of Bourg et al.

How it is computed: the second-order equation of t13 with the t05 sources, solved in the frequency domain on three Chebyshev patches in 30-digit arithmetic, along a complex path near scri. A real first-order mode is a regular mode plus its mirror; adding parity images of each mode gives $R=\alpha+\beta\rho+\gamma\rho^2$ exactly, in the mirror ratio $\rho$. The $m=0$ solve maps to $(4,4)$ by a Clebsch–Gordan ratio.

- **Schwarzschild check.** At $Q/M=0.02$, $\alpha=0.13655-0.01146i$ and $\beta=0.01645+0.00104i$, against Khera–Ma–Yang's $R_{++}=0.13652-0.01146i$, $R_{+-}=0.01648+0.00097i$; with the $(4,0)$ value of Bourg et al. to $6\times10^{-4}$.
- **GW$\times$GW** falls by 4% by $Q/M=0.8$.
- **GW$\times$EM** $\approx(0.745-0.218i)\,Q$, $0.44$ at $Q/M=0.8$.
- **EM$\times$EM$\to$GW**: single mode $\approx(0.650-0.439i)\,Q^2$; the regular$\times$mirror term tends to $0.084$ at $Q=0$.
- $L=2$ targets too: $\lvert\alpha_{XX}\rvert=0.026$ at $(2,0)$, five times weaker than $(4,0)$.
- Not computed: products of a mode with its own conjugate, whose frequency $2i\,\mathrm{Im}\,\omega$ lies on the branch cut, where regularity does not fix the solution. The average of the two one-sided limits agrees with Bourg et al.'s value within our 20% error.

**Takeaway.** A charged ringdown has a quadratic GW tone fed by the EM-led mode, linear in $Q$; and an EM-led mode with mirror content feeds it even at $Q=0$.

**Reproduce.** `tasks/t07-rn-qqnms/`: sources `S5/run_sources.py` (SLURM, ~6 core-h per pair of modes), `S5/analyse.py` (364 solves, 10 min), `S5/plot_qscan.py`.

### F4 — How does the radiation of a charged black hole's ringdown split between gravity and electromagnetism? (unverified)

<figure><a href="figs/rn_composition_ratio.png"><img src="figs/rn_composition_ratio.png" alt="Relative difference between the measured GW/EM power ratio and Motohashi's prediction, against resolution"></a><figcaption>The measured GW/EM power split converges to Motohashi's exact $(L-1)/(L+1)$.</figcaption></figure>

From the first-order metric and potential in the Bondi–Sachs gauge ([F3](#results)) we compute the gravitational power (from $\Psi_4$, and equally from the news of the metric) and the electromagnetic power (from $\phi_2$, read off $A_{\bar m}$) at scri, for the $\ell=2$ fundamental QNMs of RN at $Q/M=0.6$. Motohashi (arXiv:2610.10529) predicts, for real frequencies, that the minority channel carries the fraction $(L-1)/(L+1)$, $L=\sqrt{1+4Q^2(\ell-1)(\ell+2)/(9M^2)}$, here $0.1230473516$.

The figure shows the relative difference between our ratio and the prediction against the Chebyshev resolution: blue the gravitational-led mode ($P_E/P_G$), orange the electromagnetic-led mode ($P_G/P_E$); filled circles the mode itself, open squares its mirror partner, which a real perturbation also contains at scri. At $N=64$ the agreement is $5\times10^{-9}$ and $10^{-9}$.

- The prediction holds at the complex QNM frequency, and for both parts of the real field.
- At the horizon, the shear and the Maxwell scalar $\phi_0$ computed from the metric and potential equal formulas in the gauge-invariant pair $(\Psi_0,\varphi_{+1})$ to $10^{-14}$; the one for $\phi_0$ is new. The energy absorbed by the hole is then $0.40$ (gravitational) $+\ 0.05$ (electromagnetic) of the power at scri for the gravitational-led mode, and $0.04+0.36$ for the electromagnetic-led one, on the same slice.
- With $m=0$ no angular momentum is radiated or absorbed.

**Takeaway.** The ringdown's split between gravitational and electromagnetic waves is fixed by the angular structure alone, and our reconstructed fields reproduce it independently of the separated equations behind the prediction. The horizon fluxes are what the backreaction question (towards or away from extremality) needs at first order.

**Reproduce.** `tasks/t14-bondi-gauge/S3b/`: `fluxes.py` (2 min), then `plot_ratio.py`.

### F3 — Can the first-order field be asymptotically flat at scri and regular at the horizon at the same time? (unverified)

<figure><a href="figs/rn_gauges_components.png"><img src="figs/rn_gauges_components.png" alt="Components of the first-order metric and potential against sigma in three gauges"></a><figcaption>Radiation gauge (left) grows at scri, Bondi–Sachs (middle) blows up at the horizon, the glued gauge (right) is regular at both.</figcaption></figure>

Every nonzero tetrad component of the first-order metric and Maxwell perturbation of the $\ell=2$ fundamental QNMs of RN ($Q/M=0.6$), against $\sigma=r_+/r$ (scri at 0, horizon at 1); top the gravitational-led mode, bottom the electromagnetic-led one; log scale, normalised by $\Psi_0$ at the horizon. The grey band is the gluing region.

- **Left, radiation gauge.** Our reconstruction (t06): unique and analytic on the whole slice, solving every field equation to $10^{-8}$; but $h_{nn},h_{nm}$ grow like $r$ at scri.
- **Middle, Bondi–Sachs.** On RN the radiation-gauge conditions already contain the Bondi–Sachs ones, and a closed-form residual gauge transformation (three amplitudes per mode) makes every component fall off like $1/r$; it carries $(1-\sigma)^{i\omega/\kappa_+}$, so it is singular at the horizon.
- **Right, glued.** Bondi–Sachs for $\sigma\le1/4$, radiation gauge for $\sigma\ge3/4$, joined by a $C^6$ step; in the band the field leaves both gauges (dashed: $h_{ll},h_{ln},h_{lm},A_l$).

The glued field was checked with the linearised Einstein–Maxwell equations written directly in coordinates, independently of our GHP code, on all 14 components: residuals fall with resolution to $\le2\times10^{-8}$ on every patch, and $\Psi_0$ recomputed from it equals the input to $7\times10^{-9}$. The same operator confirms the radiation-gauge field independently.

<figure><a href="figs/rn_reconstruction_fields.png"><img src="figs/rn_reconstruction_fields.png" alt="Rescaled radial functions of the radiation-gauge reconstruction"></a><figcaption>The radiation-gauge reconstruction, rescaled by its powers at scri: smooth from scri to the horizon.</figcaption></figure>

**Takeaway.** For every mode of nonzero frequency the first-order gauge is fully fixed: Bondi–Sachs at scri, regular at the horizon. Then the second-order Weyl scalars are invariant (Spiers–Pound–Moxon), which is the starting point for t13. Second-order sources must accept all fourteen components.

**Reproduce.** `tasks/t14-bondi-gauge/`: `S3/lin_op.py` (1 min), `S3/transform.py` (2 min), `S4/plot_gauges.py`.

### F2 — Do the separated Kerr–Newman equations give the same QNMs as the coupled equations? (unverified)

<figure><a href="figs/kn_separated_vs_pombo.png"><img src="figs/kn_separated_vs_pombo.png" alt="Difference between our separated-equation KN QNMs and Pombo's coupled-system data, against Q/M and a/M"></a><figcaption>Our separated-equation KN frequencies against independent coupled-system data: the differences are the accuracy of that data.</figcaption></figure>

We reproduce Destounis, Cardoso and Hintz (arXiv:2610.07142) with our own solver of Hintz's separated angular and radial equations: a joint Newton solve for $(\omega,\lambda)$ in 40-digit arithmetic.

The figure (our version of their Fig. 1) shows $\lvert M\omega_{\rm separated}-M\omega_{\rm Pombo}\rvert$ on a log scale. Left: against $Q/M$ at $a/M=0.5$. Right: against $a/M$ at $Q/M=0.5$. Modes $\ell=m=2$; blue gravitational-led, orange electromagnetic-led; solid $n=0$, dashed $n=1$; 85 points on the paper's grid. Pombo's data (Zenodo 10.5281/zenodo.21359120) come from a double-precision solver of the coupled equations. The differences are $10^{-9}$–$10^{-6}$ for $n=0$ and $10^{-6}$–$10^{-4}$ for $n=1$, as in the paper. Our values are converged to $\le10^{-13}$, so these differences measure the accuracy of Pombo's data.

<figure><a href="figs/kn_isospectrality.png"><img src="figs/kn_isospectrality.png" alt="Difference between the QNMs of the two spin labels of the separated equations"></a><figcaption>The two spin labels $\varsigma=\pm1$ give the same frequencies to $2\times10^{-15}$.</figcaption></figure>

The separated equations exist in two versions, built from $(\Psi_0,\Psi_1)$ ($\varsigma=+1$) and from $(\Psi_4,\Psi_3)$ ($\varsigma=-1$). Solved independently, they agree to $\le2\times10^{-15}$ at every point ($\ell=m=2$, $n=0$), three to five orders below the paper's $10^{-12}$–$10^{-10}$. Their residual differences are numerical.

- Tables I, III and V of the paper are reproduced to $\le4\times10^{-10}$; Tables II and IV ($Q\to0$) to their reference columns. Three of the paper's own $Q\to0$ entries are off by $\sim2\times10^{-6}$.
- At $a=0$ the separated equations give our coupled Reissner–Nordström QNMs ([F1](#results)) to $10^{-11}$: an independent check of F1.
- A data issue: the `KN_a=0.00` files of Pombo's release are not $a=0$ data; we use the `RN_*` files there.
- Not done: the map between the paper's variables and our pair $(\varphi_{+2},\varphi_{+1})$.

**Takeaway.** Hintz's separation is a practical way to compute KN QNMs at high precision, and it agrees with the coupled equations. It will be our reference for the KN code (t10).

**Reproduce.** `tasks/t06-rn-spectral/S3b/`: `reproduce.py` (tables, 18 min), `figs.py` (figure data, 75 min), `plot_figs.py 2026-10-07`.

### F1 — Does our coupled system give the known Reissner–Nordström QNMs? (unverified)

<figure><a href="figs/rn_qnms_vs_Q.png"><img src="figs/rn_qnms_vs_Q.png" alt="Real part and damping rate of RN QNMs against Q/M, gravitational- and electromagnetic-led, with published values"></a><figcaption>Every published coupled RN QNM lies on the curves from our system.</figcaption></figure>

The coupled linear system for $(\varphi_{+2},\varphi_{+1})$ ([§3, §5](#derivations)), reduced to RN and solved on hyperboloidal slices by Chebyshev collocation in $\sigma\in[0,1]$ (scri to horizon). Time dependence $e^{-i\omega\tau}$, $M=1$.

Left: $\mathrm{Re}\,\omega M$; right: $-\mathrm{Im}\,\omega M$; both against $Q/M\in\{0,0.2,0.3,0.4,0.6,0.8,0.9,0.99\}$. Blue gravitational-led, orange electromagnetic-led; solid $\ell=2$, $n=0$; dashed $\ell=2$, $n=1$; dotted with squares $\ell=1$, $n=0$ (electromagnetic only). Grey crosses: published values (Berti & Kokkotas 2005; Dias, Godazgar & Santos 2022; Kokkotas & Schmidt 1999; Zhou, Ma & Huang 2026). The electromagnetic-led frequencies rise faster with $Q$, and all damping rates drop near extremality.

<figure><a href="figs/rn_qnms_deviation.png"><img src="figs/rn_qnms_deviation.png" alt="Deviation of our RN QNMs from each published table, against Q/M"></a><figcaption>25 of 28 published values agree with ours in every printed digit.</figcaption></figure>

$\lvert\omega_{\rm ours}-\omega_{\rm ref}\rvert M$ for every published row; dotted lines mark half a unit in each source's last digit. The three exceptions are electromagnetic-led $\ell=2$, $n=1$ values of Zhou, Ma & Huang at $Q=0.2,0.8,0.99$, off by one unit in the 5th decimal. The separated solver of [F2](#results) agrees with ours there to $10^{-11}$, so the error is in that table.

- Our values are converged to $\le10^{-10}$ ($N=84$ against $N=100$); grav-led $n=1$ at $Q\ge0.9$ needs $N=140$–$160$.
- Control: switching off the coupling at $Q=0.6$ moves the frequencies by $4\times10^{-3}$ (grav) and $5\times10^{-3}$ (EM), far above the agreement. No modes outside the two families appear.
- A method finding: in double precision the grav-led eigenvalue is ill-conditioned and stalls at $\sim10^{-7}$. A Newton refinement in 40-digit arithmetic (python-flint) restores geometric convergence.

**Takeaway.** The linear system we derived is the right one, numerically as well as symbolically. The spectral code is ready for the reconstruction (t06 S4) and the second-order sources.

**Reproduce.** `tasks/t06-rn-spectral/S3/`: `qnms.py 84 60` (400 s), then `plot_qnms.py`.
