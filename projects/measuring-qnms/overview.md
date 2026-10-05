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

Each right singular vector is a *channel*: a fixed linear combination of mode amplitudes. We call a channel **measurable** when $s_i > 1$, meaning the data reduce its variance by more than a factor of two relative to the prior. See [derivations](#derivations) for why that threshold is natural. The amplitudes enter as real and imaginary parts, so each mode has two real channels, and the headline number counts modes, a mode counting once both its quadratures are measured:

$$
n_{\rm meas} = \left\lfloor \tfrac12\, \#\{\, i : s_i > 1 \,\} \right\rfloor .
$$

With white noise and a flat prior, $s_i = \rho\,\sigma_i(Z)$ with $\rho = \sigma_A/\sigma_n$. The problem is then just the singular spectrum of a Vandermonde-type matrix, cut at $1/\rho$.

## Where things stand (2026-10-05)

- **Mode counts (F3, F9).** From $10\,M_f$ after the peak, with the PN × QNEF prior calibrated on NR, the GW250114-like source at its distance measures O4 2, A+ 3, CE 20 km 4, CE 40 km 4 and ET 5 modes. In every detector the 220 enters first, then a mode made mostly of the calibrated $n = 1$ overtones, then one made mostly of the fundamental harmonics.
- **Which amplitudes are learned (F10).** O4 pins down the 220 and 221 and about 60% of the 440 and 441; ET adds the 222, 320 and 321. Starting earlier than $10\,M$ adds modes, but they rest on overtones that NR does not support near the peak.
- **Saturation and the prior (F4, F11).** Under PN × QNEF the count saturates at $n_{\max} = 2$ and $\ell_{\max} = 6$. A flat prior counts 3–8× more modes and never saturates.
- **Detector noise checked (F7).** No numerical choice in the covariance moves the count by a mode.
- **Populations (F8, F12).** O5 gives about 55 2+ mode detections in 2 yr, and ET and CE 30–40 5+ mode detections a year. O3 is matched; O4 ringdown events are 2.6× high.
- **Dropped.** The non-modal GP changed the count by at most about one mode and is not used ([§10](#derivations)).

## Open threads

- **One pooled error** over-covers (3,3) and under-covers (3,2), (4,3); a per-harmonic $e$ would fix it.
- **Late-time harmonics** other than (2,2) are under-covered: the quadratic 220×220 and retrograde content are not modelled. Adding the quadratic mode to the signal is planned.
- Does $n_{\rm meas}$ depend on $\rho_{220}$ alone, or on the shape of the detector's sensitivity? To test on the 3G curves, including the CE 20 km post-merger tuning.
- LISA with the exact TDI response for $10^5$–$10^7\,M_\odot$, where the smooth approximation we use is off by up to 30%.
- Pin down the $r_{44}$ PN coefficient: $(8/9)\sqrt{5/7}$ or $(8/9)\sqrt{10/7}$.
- Realistic sky position and antenna patterns (H1/L1 for GW250114).
