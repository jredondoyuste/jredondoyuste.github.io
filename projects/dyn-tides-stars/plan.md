## Progress

<div style="margin: 0.6rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">campaign 1: build and validate the codes · 3 of 9 done</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 33%; height: 100%; background: var(--accent);"></div></div>

## Campaign 1 — frequency- and time-domain codes

| # | task | status | notes |
|---|---|---|---|
| P0 | Julia package skeleton, units, conventions | <span style="color: var(--accent)">✓ done</span> | `DynTides.jl` |
| P1 | Literature: equations, EOS models, check values | <span style="color: var(--accent)">✓ done</span> | [log](#log) |
| P2 | EOS (SLy4 table, nucleonic model, soft/stiff pair) + TOV + static Love number $k_2$ | <span style="color: var(--accent)">✓ done</span> | checks: polytrope M, R; SLy4 $M_{\max}$; paper's M–R curve; $k_2$ |
| P2b | SRO(SLy4), SRO(APR) 3D tables: frozen $\Gamma_1$ | <span style="color: var(--muted)">○ open</span> | g-mode check: Gittins & Andersson |
| P3 | Frequency domain, axial | <span style="color: var(--muted)">○ open</span> | checks: $\lvert S\rvert = 1$, convergence, w-mode |
| P4 | Frequency domain, polar (with buoyancy) | <span style="color: var(--muted)">○ open</span> | checks: f-mode, g-modes, $\omega \to 0$ limit vs $k_2$, the paper's dynamical tide |
| P5 | Time domain, axial | <span style="color: var(--muted)">○ open</span> | check against P3 |
| P6 | Time domain, polar | <span style="color: var(--muted)">○ open</span> | check against P4 |
| P7 | Production: $S_2(\omega)$, $\delta_2(\omega)$ for 3 EOS × 3 masses | <span style="color: var(--muted)">○ open</span> | $\omega M_S \in [10^{-3}, 0.1]$ |

## Known difficulties

- At $\omega M_S \ll 1$ the star's signal is a small correction, of relative order $(\omega R)^{5} k_2$ for $\ell = 2$, on top of the phase set by the mass alone. The code must compute it directly, not as a difference of two large phases.
- The time-domain code needs a non-uniform grid: the wavelength at $\omega M = 10^{-2}$ is about 900 km, but the stellar surface needs steps of about 0.01 km.
- With buoyancy, g-mode resonances in the band are narrow, so the $\omega$ grid must be adaptive near them.

## Open decisions

- MIT bag (quark-star) model: out of scope for now.
- How low in $\omega$ the time-domain code must go.
