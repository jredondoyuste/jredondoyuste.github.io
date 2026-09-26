## The question

How many quasinormal modes, or linear combinations of them, can actually be measured in a high-SNR ringdown? And how does that number change as the assumptions get more realistic (priors on the amplitudes, coloured detector noise, a later start time)?

## The model

A single complex time series, uniformly sampled, linear in the mode amplitudes:

$$
h = Z A + n, \qquad Z_{kj} = e^{-i\omega_j t_k}, \qquad A \sim \mathcal{CN}(\mu_A, \Sigma_A), \quad n \sim \mathcal{CN}(0, \Sigma_n).
$$

Units are $G = c = M_f = 1$, and $t = 0$ is the start of the analysis segment. Each column of $Z$ is one mode. It can be a prograde $(\ell, m, n)$ mode, a retrograde or mirror mode ($\omega \to -\bar\omega$), or a quadratic mode at $\omega_1 + \omega_2$. Quadratic modes get free amplitudes, so the model stays linear, and their physical suppression goes into the prior.

## The one object everything reduces to

Every quantity we track is a function of the singular values $s_i$ of the **whitened, prior-weighted design matrix**

$$
\tilde Z = \Sigma_n^{-1/2}\, Z\, \Sigma_A^{1/2} = U\,\mathrm{diag}(s_i)\,W^\dagger .
$$

Each right singular vector is a *channel*: a fixed linear combination of mode amplitudes. We call a channel **measurable** when $s_i > 1$, meaning the data reduce its variance by more than a factor of two relative to the prior. See [derivations](#derivations) for why that threshold is natural. So the headline number is

$$
n_{\rm meas} = \#\{\, i : s_i > 1 \,\}.
$$

With white noise and a flat prior, $s_i = \rho\,\sigma_i(Z)$ with $\rho = \sigma_A/\sigma_n$. The problem is then just the singular spectrum of a Vandermonde-type matrix, cut at $1/\rho$.

## Where things stand (2026-09-26)

- **Baseline done (F1–F5).** From $10\,M_f$ after the peak, with the PN × QNEF prior calibrated on NR: the GW250114-like source at its distance gives O4 5, A+ 6, CE 20 km 10, CE 40 km 11 and ET 14 measurable real channels. Overtones saturate at $n_{\max} = 2$; harmonics saturate under PN + QNEF and never under the flat prior.
- **Starting earlier.** The first non-modal GP (F6) is withdrawn: it kept only the modes NR can extract. The **noise ladder** redoes it with the signal prior and the noise chosen independently: all 280 modes at the overtone ceiling $a = 1.42$, against white, detector and detector + GP noise. The plan is agreed; nothing has run yet.
- **Amplitude prior.** A new task derives the amplitude prior $\Sigma_A$ from theory, lightly calibrated on NR. Its plan is not written yet.
- **Dropped:** very large mode sets ($10^4$–$10^5$ modes).

## Open threads

- **221 bias:** 1σ coverage only 26%; NR sits at 0.8× the QNEF prediction with little scatter.
- **Correlated errors:** fundamental and overtone errors are correlated ((3,3): +0.53), so the independent model slightly underestimates the total error.
- **Late-time harmonics** other than (2,2) are under-covered: the quadratic 220×220 and retrograde content are not modelled. Adding the quadratic mode to the signal is planned.
- Mild spin trend of the overtone scale $a$ (correlation +0.55 with $\chi_f$).
- Pin down the $r_{44}$ PN coefficient: $(8/9)\sqrt{5/7}$ or $(8/9)\sqrt{10/7}$.
- Map channels back to modes: how much of each channel's weight sits on which $(\ell, m, n)$.
- Realistic sky position and antenna patterns (H1/L1 for GW250114).
