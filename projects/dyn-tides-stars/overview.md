## The question

How does a neutron star respond, dynamically, to a gravitational wave? We answer this without matching and without an expansion in frequency. We send a gravitational wave of frequency $\omega$ onto a non-rotating neutron star and measure how it scatters.

## Why it matters

Nobody yet knows how to match dynamical tides between post-Newtonian calculations and scattering amplitudes. The amplitudes community has proposals, but they need numerical results to match against. We want to provide that data: phase shifts and reflectivities for many multipoles, frequencies and stars, with error bars.

## What we compute

Far from the star the master function (Regge–Wheeler for axial, Zerilli for polar perturbations) behaves as

$$
\Psi \to A_{\rm in}\, e^{-i\omega r_*} + A_{\rm out}\, e^{+i\omega r_*}, \qquad e^{-i\omega t}\ \text{time dependence}.
$$

We report the reflectivity $S_\ell(\omega) = A_{\rm out}/A_{\rm in}$ and the phase shift $\delta_\ell$, $S_\ell = e^{2i\delta_\ell}$. Without dissipation $|S_\ell| = 1$, so the star's information is in the phase. We also report the star-dependent part of $\delta_\ell$ directly, because at low frequency it is a tiny correction on top of the phase set by the mass alone ([derivations §3](#derivations)). Every number is the full linear-perturbation answer at that $\omega$: nothing is expanded in $\omega$.

## The set-up

- **Stars:** static, spherically symmetric, cold $\beta$-equilibrium matter. EOSs: SRO(SLy4) and SRO(APR) from CompOSE, and a soft/stiff pair of the nucleonic models of [Hegade K. R. et al. 2026](#references). Masses $1.4$–$2.0\,M_\odot$.
- **Buoyancy:** with frozen composition the adiabatic index $\Gamma_1$ differs from the slope of the EOS, and the star has g-modes ([derivations §2](#derivations)). The barotropic case is kept as a check.
- **Perturbations:** $\ell = 2, 3, 4$, axial and polar. Polar perturbations follow the Lindblom–Detweiler equations. The star is spherical, so nothing depends on $m$.
- **Frequencies:** $\omega M \in [10^{-3}, 0.2]$, which covers the g-modes and reaches the f-mode.

## Two codes

- **Frequency domain (production):** the interior solution that is regular at the centre is matched at the surface to the exterior equation. The amplitudes come from a high-order asymptotic series far out.
- **Time domain (check):** a long wave train of carrier $\omega$ is sent in, and the scattered train is extracted far away.

Each code checks the other.

## Where things stand (2026-09-27)

- The EOS, TOV and static Love-number code works and passes its checks ([F1](#results)).
- The project moved to a new layout, and the plan was rewritten around the final dataset ([plan](#plan)).
- Next: run the code on the cluster, then the frequency-domain axial code and the 3D EOS tables in parallel.

## Open threads

- The nucleonic models reach only $M_{\max} \approx 1.96\,M_\odot$, 4% below the paper. The cause is not yet known.
- Which definition of the star-dependent phase the dataset should use, so that the amplitudes community can match it directly.
