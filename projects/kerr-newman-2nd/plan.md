## Progress

<div style="margin: 0.6rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">0 of 12 tasks done</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 0%; height: 100%; background: var(--accent);"></div></div>

**Goal.** The second-order Einstein–Maxwell equations on Reissner–Nordström and then Kerr–Newman, in spinor form, with their sources understood near extremality; the backreaction of Aretakis-unstable modes; and quadratic QNM amplitudes with the GW–EM mixing, as functions of $a/M$ and $Q/M$.

**Order.** t01, t02 → t03 → t04 → t05 → {t06 → t07, t08} → t09 → t10 → {t11, t12}. The RN group (t05–t08) ends in a first paper.

## Foundations

| task | what | status | check |
|---|---|---|---|
| t01 | Literature and conventions: one set of conventions; a dictionary between Giorgi's tensorial formalism, GHP and spinors; the Kerr second-order and extremal literature | <span style="color: var(--accent-2)">◐ next</span> | Giorgi's linear equations reproduced through the dictionary |
| t02 | sympy toolkit: GHP/spinor calculus on type-D Einstein–Maxwell backgrounds (RN, KN) | <span style="color: var(--accent-2)">◐ next</span> | KN background equations hold identically; Teukolsky at $Q = 0$ |

## Linear theory

| task | what | status | check |
|---|---|---|---|
| t03 | Linear Penrose wave system for the perturbed Weyl and Maxwell spinors; the Teukolsky-like system for the extreme spin weights | <span style="color: var(--muted)">○ open</span> | equivalent to Giorgi 2020; Teukolsky at $Q = 0$; Chandrasekhar–Moncrief at $a = 0$ |
| t04 | First-order metric and Maxwell field from the curvature variables: standard in RN; in KN compare AAB-type identities, the GCM gauge of Fang–Giorgi–Wan, and evolving the full first-order system | <span style="color: var(--muted)">○ open</span> | reconstructed fields solve linearised Einstein–Maxwell |

## Reissner–Nordström

| task | what | status | check |
|---|---|---|---|
| t05 | Second-order equations with explicit quadratic sources (grav × grav, grav × EM, EM × EM); gauge dependence; behaviour at the horizon and at $\mathscr{I}^+$ | <span style="color: var(--muted)">○ open</span> | $Q \to 0$ gives Schwarzschild; sources regular on hyperboloidal slices |
| t06 | Hyperboloidal spectral code, 1+1 per multipole, first and second order | <span style="color: var(--muted)">○ open</span> | coupled RN QNMs against published values; spectral convergence |
| t07 | Quadratic QNMs and GW–EM mixing as functions of $Q/M$ | <span style="color: var(--muted)">○ open</span> | Schwarzschild quadratic ratios at $Q = 0$; code vs. frequency-domain amplitudes |
| t08 | Extremal RN: second-order sources built from Aretakis-unstable modes; the monopole sector ($\delta M$, $\delta Q$) — towards or away from extremality? | <span style="color: var(--muted)">○ open</span> | first law and horizon fluxes; Aretakis horizon charges |

## Kerr–Newman

| task | what | status | check |
|---|---|---|---|
| t09 | Second-order equations on KN | <span style="color: var(--muted)">○ open</span> | $a \to 0$ gives t05; $Q \to 0$ gives the Kerr second-order Teukolsky equation |
| t10 | Hyperboloidal spectral code, 2+1 per azimuthal number | <span style="color: var(--muted)">○ open</span> | published KN QNMs; t06 at $a = 0$ |
| t11 | Quadratic QNMs and GW–EM mixing in KN, extending Kerr | <span style="color: var(--muted)">○ open</span> | Kerr quadratic-QNM results at $Q = 0$ |
| t12 | Near-extremal KN: the sources near the horizon; backreaction of Aretakis and zero-damped modes | <span style="color: var(--muted)">○ open</span> | t08 at $a = 0$; the strongly charged extremal regime of Fang–Giorgi–Wan 2026 |

## Known difficulties

- In Kerr–Newman the gravitational and electromagnetic Teukolsky equations do not decouple, and the system is not known to separate. The KN code is therefore 2+1, not 1+1.
- The second-order source needs the first-order fields in a gauge that is regular at the horizon and at null infinity, or it diverges there. Hyperboloidal slices help, but the gauge is chosen in t04 and t05, not assumed.
- Near extremality the horizon derivatives of the first-order fields grow (Aretakis). The second-order source contains products of these derivatives, so it must be controlled analytically before it is computed.
