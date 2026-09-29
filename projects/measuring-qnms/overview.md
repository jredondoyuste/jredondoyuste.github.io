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

## Where things stand (2026-09-29)

- **Baseline done (F1–F5).** From $10\,M_f$ after the peak, with the PN × QNEF prior calibrated on NR: the GW250114-like source at its distance gives O4 5, A+ 6, CE 20 km 8, CE 40 km 9 and ET 12 measurable real channels. Overtones saturate at $n_{\max} = 2$; harmonics saturate under PN + QNEF and never under the flat prior.
- **Detector noise checked (F7).** No numerical choice in the covariance moves $n_{\rm meas}$ by more than one channel; the one choice that matters is the analysis bandwidth.
- **Amplitude prior settled.** 1PN × QNEF at each binary's own $v_{\rm peak}$, with three calibrated numbers ($e, f, \kappa$) and the untied-overtone scale set to $a = 1$ (NR bounds it at 0.38; it matters only for starts before about 10 M). The hyperboloidal-slice GP is dropped ([§8](#derivations)).
- **Non-modal noise.** A GP for what the QNM model misses, trained on 434 SXS runs. The base kernel ranks first among the variants tried but under-covers before 20 M; a single kernel from $t = 0$ is being fitted ([§10](#derivations)). It becomes the top rung of the noise ladder.
- **Populations.** Channel counts become expected numbers of events per detector over the GWTC-5 and Klein+16 populations ([F8](#results)): O5 gives about 55 2+ mode detections in 2 yr, ET and CE 30–40 5+ mode detections a year. O3 is matched; O4 ringdown events are 2.6× high.

## Open threads

- **One pooled error** over-covers (3,3) and under-covers (3,2), (4,3); a per-harmonic $e$ would fix it.
- **Late-time harmonics** other than (2,2) are under-covered: the quadratic 220×220 and retrograde content are not modelled. Adding the quadratic mode to the signal is planned.
- Does $n_{\rm meas}$ depend on $\rho_{220}$ alone, or on the shape of the detector's sensitivity? To test on the 3G curves, including the CE 20 km post-merger tuning.
- LISA with the exact TDI response for $10^5$–$10^7\,M_\odot$, where the smooth approximation we use is off by up to 30%.
- Pin down the $r_{44}$ PN coefficient: $(8/9)\sqrt{5/7}$ or $(8/9)\sqrt{10/7}$.
- Map channels back to modes: how much of each channel's weight sits on which $(\ell, m, n)$.
- Realistic sky position and antenna patterns (H1/L1 for GW250114).
