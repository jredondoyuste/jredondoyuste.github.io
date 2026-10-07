**Time-domain comparison done; refining the mode sum (2026-10-06).** Evolutions with thin Gaussians in place of the deltas converge to the analytic linear and second-order solutions at all times away from the light-cone edges ([F2–F4](#results)). The second-order mode sum is being pushed from $N = 50$ to $N = 100$ to tighten the late-time comparison. The derivation corrections ([F1](#results)) still need to go into the draft.

## Tasks

### t01 — Check the analytical derivations (main.tex, then PT.tex) · done

Every equation got a verdict (OK, wrong with a correction, or not checked), with sympy and one mpmath check per mode-sum claim; every numerical check has a control that must fail ([F1](#results), [§1–§3](#derivations)).

- **S1** Linear sector of main.tex · done
  Green's function, QNMs, Matsubara residues and the two linear time windows; all correct.
- **S2** Second-order sector of main.tex · done
  $s^{(2)}(\omega)$ against quadrature and the three-window $\psi^{(2)}$ against forward Laplace transforms; correct, with clarifications.
- **S3** Material only in PT.tex · done
  Six errors found and corrected.
- **S4** Report · done
  The merged audit, with the corrections ready to transcribe.

### t02 — Time-domain evolutions against the mode sums · active

Evolve the linear and second-order equations with Gaussians of width $\sigma$ for the deltas, and compare with the analytic mode sums at all times ([F2–F4](#results)).

- **S1** Evolution code · done
  4th-order finite differences + RK4; clean 4th-order convergence, error $\le 6\times10^{-6}$ of the peak at $\Delta r = \sigma/16$.
- **S2** Linear field at all times · done
  Residual $\propto\sigma^2$ off the edges; adding modes lowers it to that floor ([F2](#results)).
- **S3** Second-order field · done
  Regulator error $O(\sigma)$, mechanism confirmed; after extrapolation in $\sigma$ the evolution matches the analytic solution ([F3](#results)).
- **S4** Result and report · done
  The agreement written up as one result.
- **S5** Mode sum at $N = 50$ and $100$; summary figures · active
  $N = 50$ lowers the late-time residual 5.7× to $6\times10^{-5}$; $N = 100$ running ([F3](#results), [F4](#results)).

## Simmering

Nothing yet.

## Dead ends

None yet.

## Choices and conventions

### Units and test point · done

$\alpha = 1$, $V_0 = 1$ ($V_0 = 0.1$ for one check, where $4V_0 < \alpha^2$).

### How a check counts · done

The ground truth for every mode-sum statement comes only from the closed-form $G_\omega$: direct quadrature of the $s^{(2)}$ convolution, or exact forward Laplace transforms of the windowed time-domain formulas. Every check carries a deliberately wrong variant that must fail.

### Mode sums · done

Truncate jointly (Matsubara index $k$ paired with overtone $n = k$); the sums then converge like $N^{-2}$, while each alone converges like $N^{-1}$. Use working precision $\texttt{mp.dps} \ge 0.6\,n + 20$ for overtone $n$. Evaluate $G$ at $\omega_Q + \bar\omega_Q$, which lies on the Matsubara lattice, as a limit.

### The draft is read-only · done

We never edit the Overleaf draft; corrections are written up here and in the project, and transcribed by hand.
