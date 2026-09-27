## Progress

<div style="margin: 0.6rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">3 of 12 steps done · 1 under way</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 25%; height: 100%; background: var(--accent);"></div></div>

**Goal.** A public dataset of $\delta_\ell(\omega)$ and $S_\ell(\omega)$, with error bars, for $\ell = 2, 3, 4$, axial and polar, $\omega M \in [10^{-3}, 0.2]$, and at least four stars. It is done when the frequency-domain code meets its error budget everywhere, the time-domain code agrees with it, and the data are released.

## Foundations

| step | what | status | check |
|---|---|---|---|
| P0 | Julia package, units, conventions | <span style="color: var(--accent)">✓ done</span> | unit tests |
| P1 | Literature: equations, EOS models, check values | <span style="color: var(--accent)">✓ done</span> | [derivations](#derivations) |
| P2 | EOS + TOV + static Love number $k_2$ | <span style="color: var(--accent)">✓ done</span> | [F1](#results) |
| P0c | Run everything on the cluster | <span style="color: var(--accent-2)">◐ active</span> | P2 checks pass again there |
| P2b | SRO(SLy4), SRO(APR) 3D tables: frozen $\Gamma_1$, buoyancy | <span style="color: var(--muted)">○ open</span> | $M_{\max}$, $R_{1.4}$ vs CompOSE; Gittins & Andersson star |

## Frequency domain (production)

| step | what | status | check |
|---|---|---|---|
| P3a | Define the star-dependent phase, with the amplitudes conventions | <span style="color: var(--muted)">○ open</span> | agreed before production |
| P3 | Axial | <span style="color: var(--muted)">○ open</span> | $\lvert S\rvert - 1 < 10^{-10}$; error budget $10^2$ below the signal at $\omega M = 10^{-3}$; w-mode |
| P4 | Polar, barotropic and with buoyancy | <span style="color: var(--muted)">○ open</span> | f-mode; g-modes of Gittins & Andersson to 1%; $\omega \to 0$ gives $k_2$ |

## Time domain (check)

| step | what | status | check |
|---|---|---|---|
| P5 | Axial | <span style="color: var(--muted)">○ open</span> | agrees with P3 to $10^{-3}$, $\omega M \in [0.02, 0.3]$ |
| P6 | Polar, then with buoyancy | <span style="color: var(--muted)">○ open</span> | agrees with P4; f-mode ringing |

## Data

| step | what | status | check |
|---|---|---|---|
| P7 | Sweep: 4 EOSs × 3–4 masses × $\ell = 2$–$4$ × both parities, $\geq 200$ frequencies, refined at the modes | <span style="color: var(--muted)">○ open</span> | error bar on every point |
| P8 | Dataset with conventions, definitions and error model; Zenodo release | <span style="color: var(--muted)">○ open</span> | — |

## Known difficulties

- At low frequency the star's signal is a correction of relative order $(\omega R)^{2\ell+1}$ times its tidal response. It must be computed directly, never as a difference of two large phases.
- The time-domain code needs a non-uniform grid: the wavelength at $\omega M = 10^{-2}$ is about 900 km, and the stellar surface needs steps of about 0.01 km.
- g-mode resonances are narrow, so the frequency grid adapts around them.
- The published time-domain polar equations are barotropic. With buoyancy we must extend them to evolve the radial displacement.
