**Derivations checked (2026-10-01).** The analytical second-order solution is correct up to fixable errors: main.tex needs one correction and a few clarifications, and PT.tex has six errors, all corrected ([F1](#results)). The corrections are ready to go into the draft. Next: time-domain evolutions with thin Gaussians, compared with the mode sums.

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

### Time-domain evolutions against the mode sums · next

Evolve the second-order equation with thin Gaussians in place of the deltas, and compare with the analytical solution as more QNMs, Matsubara modes and QQNMs are summed. Not started.

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
