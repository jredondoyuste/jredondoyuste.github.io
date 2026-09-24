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

## Where things stand (2026-09-24)

- **Model:** the complex strain with tied mirror modes and spheroidal harmonics; detector projections and networks; noise for O4, A+, ET, CE and LISA from their PSDs; modes up to $\ell = 8$, $n = 7$.
- **Prior:** conditioned on the observing angles, PN × complex QNEF, with errors calibrated on NR (jaxqualin per mode, SXS strain for the overtones jaxqualin does not see). See [derivations §8](#derivations).
- **Default start: $10\,M_f$** after the peak, where the prior is consistent with NR (F1).
- **Next:** the two-mode toy model, saturation tests, and the per-detector channel counts (the [plan](#plan)).

## Open threads

- Check the net QNEF × time-shift overtone scaling against jaxqualin / NR amplitude fits before trusting the PN + QNEF curves quantitatively.
- Pin down the $r_{44}$ PN coefficient: $(8/9)\sqrt{5/7}$ or $(8/9)\sqrt{10/7}$.
- Map channels back to modes: how much of each channel's weight sits on which $(\ell, m, n)$.
- Model nonmodal content as extra noise, either as a time-dependent variance or as NR residuals.
