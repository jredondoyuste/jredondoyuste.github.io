Newest first. One entry per working session: what was done, what was learned, and what went wrong.

### 2026-10-07 — second-order mode sum to $N = 100$

- The second-order sum at $N = 100$ ($40\,801$ terms per geometry) brings the late-time agreement to $4\times10^{-6}$ of the peak ([F3](#results)). It converges as a power of $N$, unlike the linear sum.
- What went wrong: the first $N = 100$ run used 80 digits and lost precision; the fundamental's late-time coefficient came out wrong by a factor of 5. We now use $2N + 20$ digits above $N = 50$, and check each run by the imaginary part of the field.
- Just after $\tau_2$ the residual stops improving between $N = 50$ and $100$: there the evolution, not the mode sum, sets the error.

### 2026-10-06 — time-domain evolutions agree with the analytic solution

- Evolution code: 4th-order finite differences + RK4, Gaussians of width $\sigma$ for the deltas; checked against a free wave and by self-convergence.
- Linear field: the evolution matches the $N = 100$ mode sum at all times off the light-cone edges, with residual $\propto\sigma^2$ ([F2](#results)).
- Second order: the regulator error is $O(\sigma)$, because the square of a smoothed step is not the smoothed square. Extrapolated in $\sigma$, the evolution matches the three-window solution ([F3](#results)).
- What went wrong: the second-order mode sum was first truncated at $N = 25$ instead of the planned $50$ and $100$, for cost. At $N = 25$ the truncation, not the evolution, set the late-time error. $N = 50$ lowers it 5.7×; $N = 100$ is running.
- Figures redone: the evolution enters extrapolated to $\sigma \to 0$, and the residual is shown against the mode sum at several $N$. The linear sum converges exponentially in $N$, the second-order one as a power, about $N^{-2.5}$ ([F2, F3](#results)).
- The analytic field split by mode family: the families' jumps cancel, and the QQNMs fade twice as fast as the linear QNMs ([F4](#results)).

### 2026-10-01 — derivations checked; the analytical solution stands

- Project set up; the collaborators' draft (PT.tex) and our note (main.tex) are the objects of study.
- main.tex, linear and second-order sections: every equation correct, apart from $\Gamma(\lambda)\Gamma(\bar\lambda)$ in $A^+$. Clarifications: joint truncation of the mode sums, regularity of $s^{(2)}$ at the QNMs, the ordered QQNM pairs.
- PT.tex: six errors found and corrected (QNM and Matsubara residues, $\mathcal{C}^\infty_1(0)$, the zero-mode plateau, Appendix C, the general solution) ([F1](#results)).
- Learned for the next task: mode sums converge like $N^{-2}$ only when truncated jointly; precision $\texttt{mp.dps} \ge 0.6\,n + 20$.
