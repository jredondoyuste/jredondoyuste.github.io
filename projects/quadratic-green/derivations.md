## §1. Linear Green's function

The first-order Green's function of the Pöschl–Teller potential, its QNMs and Matsubara residues, and the two linear time windows. Every equation of main.tex's linear section checks out.

Checked symbolically: the homogeneous solutions $\psi^\pm_\infty$, $\psi^\pm_H$ and their limits; $B^\pm = A^\mp(-\omega)$; the Wronskian; the QNMs as zeros of $A^-$; the Matsubara points as poles of $\psi^\pm_H$ but not of $G_\omega$; the residue identities. Checked numerically: forward Laplace transforms of the Case 1 sum and of the Case 2 three-window result, zero mode and both Matsubara families included. The convergence is $\propto N^{-2}$ near the window edges.

The one correction:

$$ A^+ \ni \Gamma(\lambda)\,\Gamma(\bar\lambda) \quad\text{not}\quad \lvert\Gamma(\lambda)\rvert^2 , $$

which matters when $4V_0 < \alpha^2$, where $\lambda$ is real and $\bar\lambda \neq \lambda^*$.

## §2. Second-order source and solution

The frequency-domain source $s^{(2)}(\omega)$ (eq:s2final) and the three-window second-order field $\psi^{(2)}$. Correct, with clarifications on how the sums are taken.

- $s^{(2)}$ against direct quadrature of the convolution: $\propto N^{-2}$ only when the Matsubara index $k$ and the overtone $n$ are truncated together; each sum alone converges like $1/N$.
- The QNM poles of the two sums cancel pairwise, so $s^{(2)}$ is regular at $\omega_Q$.
- Sums of a QNM and a conjugate QNM land on the Matsubara lattice, $\omega_{Q,n} + \bar\omega_{Q,m} = -i\alpha(n + m + 1)$, so $G$ there is evaluated as a limit.
- The three windows ($t < \tau_1$: zero; $\tau_1 < t < \tau_2$; $t > \tau_2$: QNM × QNM plus $-\mathcal{C}\,s^{(2)}(\omega_Q)$ terms) agree with the forward Laplace transform of $G_\omega s^{(2)}$ to the truncation floor, for both orderings of $r_S$ and $r_{NL}$.

## §3. Corrections to PT.tex

Six errors in material that appears only in PT.tex, each with its correction.

1. **QNM excitation coefficient.**
$$ \mathcal{C}^>(\omega_{Q,n}; x\,\vert\,y) = \frac{\Gamma(1-2\lambda-n)}{2\,n!\,\Gamma(1-n-\lambda)^2}\, e^{i\omega_{Q,n}(x+y)}\; {}_2F_1\big(\lambda, \bar\lambda; 1-n-\lambda; 1-\xi(x)\big)\, {}_2F_1\big(\lambda, \bar\lambda; 1-n-\lambda; 1-\xi(y)\big). $$
PT.tex has $e^{i\omega_Q(x-y)}$ and an extra factor $i(-1)^{n+1}$. Verified to $10^{-39}$.
2. **Matsubara residues.** The four formulas give $\mathrm{Res}$, not $\mathcal{C} = i\,\mathrm{Res}$: multiply each by $i$.
3. **$\mathcal{C}^\infty_1(0)$** takes $1 - \xi$ as argument, not $\xi$.
4. **Linear windows** $\tau^H_1 < t < \tau^H_2$ (and the $\infty$ analogue) omit the zero-mode plateau $-\mathcal{C}_1(0)$; without it the error is 119 %.
5. **Appendix C.**
$$ f(A, B, y) = \frac{\Gamma(A+1)\,\Gamma(B-A)}{\Gamma(B)} - \frac{A}{B-A}\, y^{A-B}\, {}_2F_1\!\left(B, B-A; B-A+1; -\frac{1}{y}\right). $$
6. **General solution.** In the $B$ term the exponent applies to $[\xi(1-\xi)]$; as printed the expression is not a solution.

Also found: a notation clash between two definitions of $B^\pm$; a circular definition of $G^{[i]}$; wrong signs in the window bullets; Appendix B correct in substance but its last line drops a sum. The source for $r_S < 0 < r$ is correct ($\propto N^{-2}$, $3\times10^{-4}$ at $N = 64$).
