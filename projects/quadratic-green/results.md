### F1 — Is the analytical second-order solution correct? (unverified)

Yes, up to fixable errors. main.tex is correct apart from one factor; PT.tex has six errors, all corrected.

| statement (main.tex) | relative error (MEASURED) |
|---|---|
| homogeneous solutions, $A^\pm$, $B^\pm$, $W$, QNMs, Matsubara cancellation, residue identities | $10^{-31}$ – $10^{-25}$ |
| linear windows (Case 1, Case 2) | $\propto N^{-2}$, extrapolated $7\times10^{-6}$ and $5\times10^{-8}$; controls 0.19 – 1.19 |
| $s^{(2)}(\omega)$ (eq:s2final) against quadrature | $\propto N^{-2}$ with joint truncation, $7.4\times10^{-6}$ at $N = 64$; control 0.19 |
| three-window $\psi^{(2)}$, both orderings of $r_S$, $r_{NL}$ | $2.4$ – $3.7\times10^{-4}$ (truncation floor); controls 0.04 – 0.96 |

**main.tex: one correction.** $A^+$ needs $\Gamma(\lambda)\Gamma(\bar\lambda)$ in place of $\lvert\Gamma(\lambda)\rvert^2$; they differ when $4V_0 < \alpha^2$.

**main.tex: clarifications.**

- eq:s2final must be truncated jointly (Matsubara index $k$ with overtone $n = k$); its two sums converge only like $1/N$ separately.
- $s^{(2)}$ is regular at the QNMs (the poles cancel pairwise), so $s^{(2)}(\omega_Q)$ means the value of the whole sum.
- The $\tau_1 < t < \tau_2$ step needs $\psi_{1,U} + \psi_{2,U} = 0$ (shown in PT.tex).
- The QQNM sum runs over all ordered pairs from $\{\omega_Q, \bar\omega_Q\}$.
- $\omega_{Q,n} + \bar\omega_{Q,m} = -i\alpha(n + m + 1)$ lies on the Matsubara lattice.
- Minor: eq:C0 repeats eq:lemma2a; state $A^-B^+ - A^+B^- = 1$; the large-$\omega$ asymptotics hold at fixed $r$; write $\simeq$ in the explicit $\tilde\psi^{(2)}$ forms; typos.

**PT.tex: six errors, corrected** ([§3](#derivations)): the QNM excitation coefficient; the four Matsubara residue formulas (off by a factor $i$); the argument of $\mathcal{C}^\infty_1(0)$; the missing zero-mode plateau in the linear windows (a 119 % error without it); Appendix C's $f(A, B, y)$; the exponent of the $B$ term in the general solution.

**Takeaway.** The analytical solution stands. The time-domain comparison can rely on it, provided the mode sums are truncated jointly and $G$ at QQNM frequencies is taken as a limit.

**Limits.** One parameter point and one or two geometries per configuration; the window checks stop at a $2$–$4\times10^{-4}$ truncation floor; the mixed QQNM pairs are invisible numerically after $\tau_2$; the "Previous version" section of PT.tex was not checked.

**Reproduce.** The checks are scripts in the project's `tasks/t01-check-derivations/` (`S1/`, `S2/`, `S3/`, shared code in `code/pt.py`), with sympy 1.14 and mpmath 1.3. Draft checked at its commit `da925ee`.
