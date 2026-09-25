## The question

A gravitational wave with frequency $\omega$, $\omega M_S \ll 1$, comes in from infinity and scatters off a non-rotating neutron star. How much does the scattered wave know about the star's interior, and about the equation of state (EOS) of dense matter?

## The set-up

- **Background:** a static, spherically symmetric, perfect-fluid star (TOV), $ds^2 = -e^{\nu}dt^2 + e^{\lambda}dr^2 + r^2 d\Omega^2$, with a cold, $\beta$-equilibrium EOS: SLy4, and the analytic nucleonic models of [Hegade K. R. et al. 2026](#references), including one soft/stiff pair.
- **Stars:** $M \approx 1.6$–$2.0\,M_\odot$, $R \approx 12$ km.
- **Perturbations:** linear, $\ell = 2$, axial and polar. Polar perturbations couple to the fluid (f-mode, p-modes, and, with buoyancy, g-modes).
- **Buoyancy:** the fluid composition is frozen on the oscillation time scale, so the perturbation adiabatic index $\Gamma_1$ differs from the slope of the equilibrium EOS. This gives g-modes. The barotropic case ($\Gamma_1 = \Gamma_{\rm eq}$) is kept as a switch.

## What we compute

Far from the star the master function (Regge–Wheeler or Zerilli) behaves as

$$
\Psi \to A_{\rm in}\, e^{-i\omega r_*} + A_{\rm out}\, e^{+i\omega r_*}, \qquad e^{-i\omega t}\ \text{time dependence}.
$$

We report the ratio $S_\ell(\omega) = A_{\rm out}/A_{\rm in}$ and the phase shift $\delta_\ell$, $S_\ell = e^{2i\delta_\ell}$, for $\omega M_S \in [10^{-3}, 0.1]$. Without dissipation $|S_\ell| = 1$ exactly, so all the information is in the phase.

## Two codes

- **Frequency domain:** the regular interior solution is matched at the surface to the exterior equation, and the amplitudes are read off at large $r$.
- **Time domain:** a long wave train with carrier $\omega$ is sent in, and the scattered signal is extracted far away.

Each code is the other's main check.
