## 1. Conventions

$G = c = 1$, lengths in km, $M_\odot = 1.476625$ km. Time dependence $e^{-i\omega t}$. Tortoise coordinate outside the star, $r_* = r + 2M_S \ln(r/2M_S - 1)$. Frequencies are quoted as $\omega M_S$; for $M_S = 1.8\,M_\odot$, $\omega M_S = 0.1$ is about 1.8 kHz and $\omega M_S = 10^{-3}$ about 18 Hz.

## 2. Barotropic vs frozen composition

The perturbation equations contain one thermodynamic input: how a fluid element's pressure responds to its compression,

$$
\frac{\Delta p}{p} = \Gamma_1 \frac{\Delta n}{n}.
$$

- **Barotropic:** the composition relaxes instantly to $\beta$-equilibrium, so $\Gamma_1 = \Gamma_{\rm eq} = d\ln p/d\ln n$ along the equilibrium EOS. There is no buoyancy and no g-modes.
- **Frozen composition:** weak reactions are slow compared with the oscillation, so $\Gamma_1 = (\partial \ln p/\partial \ln n)_{Y}$ at fixed lepton fractions, and $\Gamma_1 > \Gamma_{\rm eq}$. The difference is buoyancy, measured by the Schwarzschild discriminant, and it supports g-modes at tens to hundreds of Hz, inside our band.

In a cold neutron star the weak-reaction times are much longer than a millisecond, so the frozen case is the physical one at these frequencies. Weak-interaction bulk viscosity is the physics between the two limits.

## 3. Why low frequency is hard

Outside the star everything depends only on $M_S$. At $\omega M_S \ll 1$ the phase shift is dominated by the Newtonian (logarithmic) phase and the Schwarzschild phase shift. The star's structure enters at relative order $(\omega R)^{2\ell+1}$ times its tidal response. At $\omega M_S = 10^{-2}$ and $R \approx 6M$, that is $10^{-4}$–$10^{-5}$ of the phase. The exterior solutions are therefore built to about $10^{-12}$ relative accuracy, and the star-dependent coefficient is computed directly.
