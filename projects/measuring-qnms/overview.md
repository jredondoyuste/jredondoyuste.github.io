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

## Where things stand (2026-09-27)

- **Baseline done (F1–F5).** From $10\,M_f$ after the peak, with the PN × QNEF prior calibrated on NR: the GW250114-like source at its distance gives O4 5, A+ 6, CE 20 km 10, CE 40 km 11 and ET 14 measurable real channels. Overtones saturate at $n_{\max} = 2$; harmonics saturate under PN + QNEF and never under the flat prior.
- **Detector noise checked (F7).** The covariance built from the PSD is correct, and no numerical choice in it (time step, the PSD beyond its table, the frequency resolution, the noise below $f_{\rm low}$) moves $n_{\rm meas}$ by more than one channel. The published counts stand. The one choice that matters is the analysis bandwidth: cutting at 4096 Hz costs ET two channels. We keep the full Nyquist range.
- **Amplitude prior.** Of the PN × QNEF variants, the one with the 1PN factor wins on held-out NR (fitted $v = 0.544$). The alternative, a GP for the perturbation on a hyperboloidal slice, is dropped: zero-mean, it is far too broad for NR's $C_{221}/C_{220}$. We are finishing the PN × QNEF model with as few parameters as possible.
- **Non-modal noise.** The GP kernel for what the QNM model misses in NR is now its own task, trained on 448 SXS runs (strain and resolution error extracted). It becomes the top rung of the noise ladder.
- **Populations.** A new task turns channel counts into expected numbers of events per detector over the GWTC-4 and LISA massive-black-hole populations, tested against O3.

## Open threads

- **221 bias:** 1σ coverage only 26%; NR sits at 0.8× the QNEF prediction with little scatter.
- **Correlated errors:** fundamental and overtone errors are correlated ((3,3): +0.53), so the independent model slightly underestimates the total error.
- **Late-time harmonics** other than (2,2) are under-covered: the quadratic 220×220 and retrograde content are not modelled. Adding the quadratic mode to the signal is planned.
- Mild spin trend of the overtone scale $a$ (correlation +0.55 with $\chi_f$).
- Does $n_{\rm meas}$ depend on $\rho_{220}$ alone, or on the shape of the detector's sensitivity? To test on the 3G curves, including the CE 20 km post-merger tuning.
- LISA with the exact TDI response for $10^5$–$10^7\,M_\odot$, where the smooth approximation we use is off by up to 30%.
- Pin down the $r_{44}$ PN coefficient: $(8/9)\sqrt{5/7}$ or $(8/9)\sqrt{10/7}$.
- Map channels back to modes: how much of each channel's weight sits on which $(\ell, m, n)$.
- Realistic sky position and antenna patterns (H1/L1 for GW250114).
