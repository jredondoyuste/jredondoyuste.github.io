Newest first. One entry per working session: what was done, what was learned, and what went wrong.

### 2026-09-25 — literature pulled; formalism chosen

- Polar interior equations: the Lindblom–Detweiler system as written by Zhao et al. (arXiv:2202.01403). The composition enters in one place only: the adiabatic sound speed $c_{\rm ad}^2$ in the $dW/dr$ equation. The same paper gives full-GR g-mode frequencies (104, 241, 324 Hz for $L = 40, 55, 70$ MeV at $1.4\,M_\odot$), which become our g-mode check.
- The three published polar time-domain formulations are all barotropic. With buoyancy the radial displacement must be evolved too, so the time-domain code needs an extension of a published system.
- The Regge–Wheeler far-field recursion printed in arXiv:2308.14823 has two coefficients swapped. We now check every transcribed series against its equation before use.
- SLy4: the CompOSE table has the composition only along $\beta$-equilibrium, so it cannot give the frozen $\Gamma_1$ by itself. The nucleonic models of arXiv:2603.26886 can.
- Soft/stiff pair: the paper's fiducial set ($L = 50$, $K_{\rm sym} = 0$ MeV) and its PREX-II-like set ($L = 120$, $K_{\rm sym} = -50$ MeV).
- Phase shift convention: $e^{2i\delta_\ell} = (-1)^{\ell+1} A_{\rm out}/A_{\rm in}$ (Stratton & Dolan, arXiv:1903.00025).

### 2026-09-25 — project started

- Scope fixed: non-rotating star, $\ell = 2$ axial and polar, $\omega M_S \in [10^{-3}, 0.1]$, $M \approx 1.6$–$2.0\,M_\odot$. Output: $S_\ell = A_{\rm out}/A_{\rm in}$ and the phase shift.
- EOS: SLy4, plus the nucleonic models of Hegade K. R. et al. (arXiv:2603.26886), with one soft/stiff pair.
- Buoyancy and g-modes are included (frozen composition); the barotropic case is a switch.
- Code repository set up (private). Literature pull on the perturbation equations, EOS models and check values started. Julia package skeleton started.
