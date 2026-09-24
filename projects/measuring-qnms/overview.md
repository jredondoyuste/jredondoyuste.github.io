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

| layer | status |
|---|---|
| modes: Kerr prograde / retrograde / mirror / quadratic (via `qnm`) | done |
| white noise, flat prior, whitened SVD, exact Gaussian posterior | done (v0) |
| PN multipole prior (leading order, to $\ell = 6$) | done (v1) |
| QNEF overtone prior, with the start-time shift | done (v1) |
| prior-uncertainty ensemble and robust flat blend | done (v1) |
| coloured noise (aLIGO analytic PSD), combined PN + QNEF prior | in working tree, **not yet committed** |
| jaxqualin-informed priors; nonmodal content treated as noise | planned (v2) |

## What the numbers say so far

These readings come from the plots in [results](#results). The fixed setup, unless a plot says otherwise: $\chi = 0.7$, $T = 100\,M$, $\Delta t = 0.1\,M$, and the $\ell = m$ set with $\ell \le 4$, $n \le 4$ (15 modes).

- **Growth is logarithmic in SNR.** For white noise and a flat prior, the $\ell = m$ set goes from 7 to 14 measurable channels as $\rho$ goes from $10$ to $10^5$, about 1.5–2 channels per decade. That follows from the singular values falling off roughly geometrically, about half a decade per index.
- **More modes in the model means more channels, but a smaller fraction.** At the same SNRs the full $\ell \le 4$, $n \le 4$ set gives 11 → 21, and adding mirror and quadratic modes gives 25 → 43.
- **Spin helps, mostly near extremality.** $n_{\rm meas}$ is flat up to $\chi \approx 0.4$–$0.7$ and then rises steeply. At $\chi = 0.99$ all 15 channels are measurable for $\rho \ge 10^3$.
- **Longer data stops helping by $T \approx 50\,M$.** The signal has decayed by then, and $n_{\rm meas}$ stays at 11 from $T = 50$ up to $400\,M$.
- **The start time dominates once overtones are weighted realistically.** With the PN + QNEF prior, $n_{\rm meas}$ drops from 12–14 at $t_0 = 0$ to 3 (the fundamentals) by $t_0 \approx 18$–$30\,M$. This is the $e^{\mathrm{Im}\,\omega_n\,\Delta t}$ factor at work.
- **Prior uncertainty costs about ±1 channel.** With a 0.5 dex log-normal spread on each mode's scale, the 5–95% band on $n_{\rm meas}$ is roughly one channel wide.
- **Coloured noise costs about one channel** compared with white noise at the same $\rho_{220}$. At $t_0 = 5\,M$ the PN + QNEF prior no longer beats the flat one at low SNR.

> Caveat: every number above counts *channels*, not named modes. A measurable channel is a combination of amplitudes and need not line up with any single $(\ell, m, n)$.

## Open threads

- Check the net QNEF × time-shift overtone scaling against jaxqualin / NR amplitude fits before trusting the PN + QNEF curves quantitatively.
- Pin down the $r_{44}$ PN coefficient: $(8/9)\sqrt{5/7}$ or $(8/9)\sqrt{10/7}$.
- Map channels back to modes: how much of each channel's weight sits on which $(\ell, m, n)$.
- Model nonmodal content as extra noise, either as a time-dependent variance or as NR residuals.
