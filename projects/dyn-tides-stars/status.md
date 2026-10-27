**Active (2026-10-26).** Both axial codes work: the frequency-domain code reproduces published axial modes to $1.5\times10^{-5}$, and the time-domain code agrees with it to $3\times10^{-7}$ ([F4](#results), [F5](#results)). The equations of state with buoyancy are in place ([F2](#results)), and the stored star-dependent phase is defined ([F3](#results), [§4](#derivations)). Next is the polar frequency-domain code.

## Tasks

### t01 — FD and TD codes for GW scattering off a cold non-rotating neutron star · active

Two independent Julia codes, frequency domain (production) and time domain (check), for $S_\ell(\omega)$ and $\delta_\ell(\omega)$, then the dataset.

- **P0** Julia package, units, conventions · done
  Unit tests pass.
- **P1** Literature: equations, EOS models, check values · done
  Formalism chosen for each module ([§1](#derivations)–[§3](#derivations)).
- **P2** EOS, TOV and static Love number $k_2$ · done
  Polytrope, SLy4 and nucleonic stars; $k_2$ to $10^{-6}$ ([F1](#results)).
- **P0c** Run everything on the cluster · done
  The checks of P2 pass again on a compute node.
- **P2b** SRO(SLy4) and SRO(APR) tables with frozen-composition $\Gamma_1$ · done
  $M_{\max}$ and $R_{1.4}$ within 0.3% of CompOSE ([F2](#results)).
- **P3a** Definition of the star-dependent phase · done
  Stored as $\delta_\ell$ in double-double precision plus the surface coefficient $q$ and $\delta_{\rm star}$ ([F3](#results)).
- **P3** Frequency-domain axial code · done
  $\lvert S\rvert - 1 \le 3\times10^{-32}$; eight published axial modes to $1.5\times10^{-5}$ ([F4](#results)).
- **P4** Frequency-domain polar code, barotropic and with buoyancy · active
  Interior equations of Zhao et al. (arXiv:2202.01403); checks: f-mode, g-modes of Gittins & Andersson to 1%, $\omega \to 0$ gives $k_2$.
- **P5** Time-domain axial code · done
  Agrees with P3 to $\le 3\times10^{-7}$ over $\omega M \in [0.02, 0.3]$ ([F5](#results)).
- **P6** Time-domain polar code, then with buoyancy · planned
  Needs an extension of a published barotropic system that evolves the radial displacement.
- **P7** Production sweep · planned
  4 EOSs × 3–4 masses × $\ell = 2$–$4$ × both parities, $\ge 200$ frequencies refined at the modes, error bar on every point.
- **P8** Dataset and release · planned
  Conventions, definitions and error model; Zenodo release.

## Simmering

### Interface modes of the uniform-density star · open

The interface axial modes of Blázquez-Salcedo et al. (arXiv:1207.4651, Table I) are not zeros of our ingoing amplitude near the quoted values. They need a density jump at the surface, which realistic stars do not have, so this does not block anything.

### Interior convergence of the time-domain code · open

The interior error converges irregularly for the polytrope and at about second order for SLy4, not at the scheme's fourth order. Suspected cause: the potential is not smooth at the surface and in the crust. Untested; the errors are already $10^3$ below the check's bar.

### Nucleonic models below the paper's maximum mass · open

The nucleonic models reach $M_{\max} \approx 1.96\,M_\odot$, about 4% below the paper's figures. We keep them, with the heaviest reference star at $1.8\,M_\odot$; $2.0\,M_\odot$ stars come from the SRO tables.

## Dead ends

None yet.

## Choices and conventions

### Conventions · done

$G = c = 1$, km; time dependence $e^{-i\omega t}$; $r_* = r + 2M\ln(r/2M - 1)$; $S_\ell = A_{\rm out}/A_{\rm in}$ and $e^{2i\delta_\ell} = (-1)^{\ell+1} S_\ell$ (Stratton & Dolan). Any other convention is converted by the user of the data.

### What the dataset stores · done

$\delta_\ell$ in double-double precision with its error bar, and the star's surface data in one exterior basis ([§4](#derivations)). The star's information is never taken from a difference of two total phases.

### Equations of state · done

SRO(SLy4) and SRO(APR) from the CompOSE 3D tables (frozen composition, g-modes), and the soft/stiff nucleonic pair of arXiv:2603.26886.
