## 1. Channels from the whitened design matrix

Start from $h = ZA + n$ with $A \sim \mathcal{CN}(\mu_A, \Sigma_A)$ and $n \sim \mathcal{CN}(0, \Sigma_n)$, independent. Standardise both:

$$
A = \mu_A + \Sigma_A^{1/2} a, \qquad \tilde h \equiv \Sigma_n^{-1/2}(h - Z\mu_A) = \tilde Z a + w,
$$

with $a, w \sim \mathcal{CN}(0, I)$ and $\tilde Z = \Sigma_n^{-1/2} Z \Sigma_A^{1/2}$. For a linear-Gaussian model, the posterior covariance of $a$ is

$$
\mathrm{Cov}(a \mid h) = \big(I + \tilde Z^\dagger \tilde Z\big)^{-1} = W\,\mathrm{diag}\!\Big(\frac{1}{1 + s_i^2}\Big)\,W^\dagger,
$$

where $\tilde Z = U\,\mathrm{diag}(s_i)\,W^\dagger$. So the problem splits into independent **channels** $c_i = w_i^\dagger a$. Each starts with unit prior variance and ends with posterior variance

$$
\frac{\mathrm{Var}(c_i \mid h)}{\mathrm{Var}(c_i)} = \frac{1}{1 + s_i^2}.
$$

**Threshold.** $s_i = 1$ is where the data and the prior carry equal weight: the variance is halved. $s_i \gg 1$ means the data pin the channel down; $s_i \ll 1$ means you get the prior back. Hence $n_{\rm meas} = \#\{s_i > 1\}$. The cut is conventional. A different threshold $\tau$ shifts it to $s_i > \tau$, which amounts to rescaling the SNR.

In the original amplitudes the posterior is (the form `analysis.posterior` implements, with the means kept explicit)

$$
\Sigma_{\rm post} = \big(\Sigma_A^{-1} + Z^\dagger \Sigma_n^{-1} Z\big)^{-1}, \qquad
\mu_{\rm post} = \mu_A + \Sigma_{\rm post} Z^\dagger \Sigma_n^{-1}\big(h - Z\mu_A\big).
$$

## 2. Mutual information

For circular complex Gaussians, $I(A; h) = \log\det(I + \tilde Z^\dagger \tilde Z) = \sum_i \log(1 + s_i^2)$ nats. Every measurable channel contributes at least $\log 2$. Channels with $s_i \ll 1$ contribute $\approx s_i^2$, which is negligible.

## 3. White noise and a flat prior: logarithmic growth

With $\Sigma_n = \sigma_n^2 I$ and $\Sigma_A = \sigma_A^2 I$, $\tilde Z = \rho Z$ with $\rho = \sigma_A/\sigma_n$, so

$$
s_i = \rho\,\sigma_i(Z), \qquad n_{\rm meas}(\rho) = \#\{\sigma_i(Z) > 1/\rho\}.
$$

These are the dashed $1/\rho$ lines in the spectra plots. If the spectrum decays geometrically, $\sigma_i \approx \sigma_1 q^{\,i-1}$ with $q < 1$, then

$$
n_{\rm meas} \approx 1 + \frac{\log(\rho\,\sigma_1)}{\log(1/q)}.
$$

At $\chi = 0.7$ the $\ell = m$ spectrum has $\log_{10}(1/q) \approx 0.5$, which predicts about 2 channels per decade of $\rho$. The sweep shows about 1.5–2. Each extra overtone costs a fixed multiplicative factor in SNR, not an additive one.

## 4. Moving the start time rescales amplitudes

A mode written about a reference time, $A^{\rm ref} e^{-i\omega(t - t_{\rm ref})}$, is the same mode as $A(t_0)\,e^{-i\omega(t - t_0)}$ with

$$
A(t_0) = A^{\rm ref}\, e^{-i\omega (t_0 - t_{\rm ref})}, \qquad |A(t_0)| = |A^{\rm ref}|\, e^{\mathrm{Im}\,\omega\,(t_0 - t_{\rm ref})}.
$$

Since $\mathrm{Im}\,\omega_n < 0$ and $|\mathrm{Im}\,\omega_n|$ grows with $n$, starting later suppresses overtones exponentially relative to the fundamental:

$$
\frac{\sigma_n}{\sigma_0}(t_0) = \Big|\frac{B_n}{B_0}\Big|\; e^{\mathrm{Im}(\omega_n - \omega_0)(t_0 - t_{\rm ref})}\;\times\;(\text{source suppression})^n .
$$

This is why the QNEF ratios $|B_n/B_0| \sim 3$–$200$ (which *grow* with $n$, see below) can coexist with NR fits where overtones are subdominant. It is also why $n_{\rm meas}$ collapses with $t_0$. A QNEF prior means nothing until its $t_{\rm ref}$ is stated (Berti & Cardoso 2006, Sec. III.B).

Measured from Berti's tabulated spin-2 data (Teukolsky convention), $|B_n|/|B_0|$ for $\ell = m = 2$:

| $\chi$ | $n=1$ | $n=2$ | $n=3$ |
|---|---|---|---|
| 0.0 | 3.45 | 8.74 | 18.8 |
| 0.5 | 4.92 | 16.2 | 43.5 |
| 0.7 | 6.39 | 26.0 | 85.7 |
| 0.9 | 9.06 | 47.3 | 195.4 |

## 5. Marginalising over prior uncertainty changes nothing

Put an independent log-normal factor on each mode's scale: $\sigma_j' = \sigma_j\,10^{\delta\,\xi_j}$ with $\xi_j \sim \mathcal N(0,1)$ and $\delta$ the spread in dex. Matching second moments,

$$
\mathbb E[\sigma_j'^2] = \sigma_j^2\, \mathbb E\big[e^{2\ln 10\,\delta\,\xi}\big] = \sigma_j^2\, e^{2(\ln 10\,\delta)^2}
\;\Rightarrow\; \sigma_j^{\rm eff} = \sigma_j\, e^{(\ln 10\,\delta)^2}.
$$

The factor is the **same for every mode**, so it amounts to rescaling $\rho$. The relative hierarchy of the prior, and with it the channel structure, is unchanged. Honest error bars therefore come from an **ensemble**: draw $\xi_j$, recompute the SVD, and report the spread of $n_{\rm meas}$. A **robust blend**, $\Sigma_A = (1-w)\Sigma_{\rm model} + w\,\sigma_{220}^2 I$, is the other option, and it does change the relative structure.

## 6. $\rho_{220}$: an SNR you can quote

$$
\rho_{220} = \sigma_{220}\,\big\|\Sigma_n^{-1/2} z_{220}\big\|,
$$

where $z_{220}$ is the 220 column of $Z$. This is the matched-filter SNR of the 220 mode alone at its prior scale. It does not depend on the absolute noise normalisation, which is what makes white and coloured noise comparable. It is smaller than a whole-ringdown SNR.

## 7. Detector noise covariance

Each detector's noise is real, stationary and Gaussian, with one-sided PSD $S(f)$. Its covariance on the time grid is Toeplitz, built from the autocorrelation

$$
C(\tau) = \int_0^{f_{\rm Nyq}} S(f)\, \cos(2\pi f \tau)\, df, \qquad (\Sigma_n)_{jk} = C(t_j - t_k).
$$

The integral is evaluated on a zero-padded frequency grid much longer than the segment, so there is no wrap-around. $S$ is held at $S(f_{\rm low})$ below $f_{\rm low}$. Geometric time converts to seconds with the detector-frame mass, $t_{\rm sec} = t\, (1+z) M_f\, G M_\odot / c^3$. The curves are O4, A+, ET-D, ET-10km, CE-40km and CE-20km (gwfast), plus LISA (Robson–Cornish–Liu, one TDI channel). The v1 circulant construction is superseded.

## Numerics

- Never form $Z^\dagger Z$. Squaring the condition number throws away half the digits. Take the SVD of the rectangular $\tilde Z$ directly.
- float64 is enough: for $\rho \lesssim 10^4$ only singular values within about 4 decades of the top matter. mpmath stays an optional cross-check.

## 8. The amplitude model (v2)

The model is linear and Gaussian throughout, $d = G\theta + n$, with an exact posterior and channels from the SVD. Everything an IMR analysis would give us is **fixed**: the remnant mass and spin (hence the frequencies), the mass ratio, and the observing angles $(\iota, \varphi)$. Only the ringdown amplitudes are uncertain.

### 8.1 Amplitudes, angles and the strain

Each QNM $j = (\ell, m, n)$ has one complex amplitude $C_j$, referenced to the merger ($t = 0$, the peak of $|h_{22}|$). It contributes

$$
C_j\, S_j(\iota, \varphi)\, e^{-i\omega_j t} \;+\; \bar C_j\, \tilde S_j(\iota, \varphi)\, e^{+i\bar\omega_j t}
$$

to $h = h_+ - i h_\times$.

- $S_j = \sum_{\ell'} c^{\,j}_{\ell'}\, {}_{-2}Y_{\ell' m}(\iota, \varphi)$ is its spheroidal harmonic.
- The second term is the mirror mode. Equatorial symmetry fixes it, $\tilde S_j = \sum_{\ell'} (-1)^{\ell'} \bar c^{\,j}_{\ell'}\, {}_{-2}Y_{\ell', -m}$, so it adds **no parameters**.
- $\varphi$ is the observer's azimuth in the frame where the orbital phase at merger is zero.
- $h$ is linear in $\theta = (\mathrm{Re}\,C, \mathrm{Im}\,C)$, and so is the detector output $\mathrm{Re}[(F_+ + iF_\times)h]$. This gives $G$.

A later start time $t_0$ only moves the time grid: the decay is in $e^{-i\omega t}$, and the prior below does not change.

### 8.2 Prior: every mode tied to the 220

$$
C_{\ell m 0} = w_{\ell m}\, A_{220} + \epsilon_{\ell m 0}, \qquad
C_{\ell m n} = g_{\ell m n}\, C_{\ell m 0} + \epsilon_{\ell m n}, \qquad A_{220} \sim \mathcal{CN}(0, \sigma_{220}^2).
$$

- $w_{\ell m} = (h_{\ell m}/h_{22})_{\rm PN}$ is **complex**: leading-order PN, in the same frame (orbital phase zero). $w_{22} = 1$.
- $g_{\ell m n} = (B_{\ell m n}/B_{\ell m 0})\,(\omega_{\ell m 0}/\omega_{\ell m n})^2$ is also complex. $B$ are the Teukolsky excitation factors, and $(\omega_0/\omega_n)^2$ converts $\psi_4 = \ddot h$ to strain.
- The errors are independent and relative:

$$
\epsilon_{\ell m 0} \sim \mathcal{CN}\big(0,\ (e_{\ell m} |w_{\ell m}| \sigma_{220})^2\big), \qquad
\epsilon_{\ell m n} \sim \mathcal{CN}\big(0,\ (f_{\ell m n} |g_{\ell m n}| \sigma_{\ell m})^2\big),
$$

  with $\sigma_{\ell m}^2 = \mathbb E|C_{\ell m 0}|^2 = |w_{\ell m}|^2 \sigma_{220}^2 (1 + e_{\ell m}^2)$.

Substituting into $\Sigma = \mathbb E[C C^\dagger]$ (cross terms vanish because the errors are independent and zero-mean), with $u_j = g_j w_j$:

$$
\Sigma_C = \sigma_{220}^2\, u\, u^\dagger \;+\; \sum_{(\ell, m)} (e_{\ell m} |w_{\ell m}| \sigma_{220})^2\; g^{(\ell m)} g^{(\ell m)\dagger} \;+\; \mathrm{diag}\big(f_j |g_j| \sigma_{\ell m}\big)^2 .
$$

The first term ties everything to $A_{220}$. The second lets each $(\ell, m)$ ladder move together away from its PN prediction. The third is each overtone's own error. When NR shows a ratio is unpredictable ($e \gtrsim 1$), that ladder decouples from the 220 automatically.

**The flat prior** is the uninformed alternative: $\Sigma_C = \sigma^2 I$, independent modes with a common scale.

### 8.3 Errors: calibrated on NR

NR amplitudes do not enter the model; NR sets only the errors.

**Modes jaxqualin sees** (500 SXS runs, amplitudes at the peak of $|h_{22}|$):

- $f_{\ell m n} = \mathrm{rms}\,|R/g - 1|$, with $R = C_{\ell m n}/C_{\ell m 0}$ (frame-independent).
- $e_{\ell m} = \mathrm{rms}\,|R/w - 1|$, with $R = C_{\ell m 0}/C_{220}$ after rotating each run into the PN frame using its own 220. For odd $m$ the branch closest to PN is taken.
- Flat prior: $\mathrm{rms}\,|C_{\ell m n}/C_{220}|$.

The NR harmonic amplitudes are divided by $c_\ell$ to give spheroidal ones, and $5\sigma$ outliers are dropped.

**Overtones jaxqualin does not see** ($n \ge 2$, and $n = 1$ of ladders with fewer than 10 runs) have zero mean, are independent of the 220, and take the scale of the ladder's first overtone:

$$
C_{\ell m n} \sim \mathcal{CN}\big(0,\ (a\, |g_{\ell m 1}|\, \sigma_{\ell m})^2\big).
$$

The excitation-factor tables stop at $\ell \le 7$, $n \le 3$, and **nothing is extrapolated beyond them**. Modes outside the tables always take this zero-mean model. For $\ell = 8$, where even $|g_{\ell m 1}|$ is missing, the scale uses the median of $|g_{\ell m 1}|$ over the tabulated ladders at the same spin.

$a$ is fitted to the **total strain** of 30 SXS runs spanning $q = 1$–8 and $\chi_f = 0$–0.95. The prior's predicted residual power, $\sum_{m>0}\int_{5M}^{85M} |h - \mathbb E[h \mid C_{220}]|^2\,dt$ conditioned on the 220 fitted to each run's strain, is matched to the observed one. This gives $a = 1.42$.

Two alternatives failed:

- A variance $\propto |g_{\ell m n}|^2$ (the QNEF growth with $n$) varied over 7 orders of magnitude with spin while the observed residual varied by about 300×, giving a per-run $a$ anticorrelated with $\chi_f$ ($-0.8$).
- The QNEF *mean* for $n \ge 2$ diverges at the peak, so a zero mean is needed.

With the first-overtone scale, the per-run $a$ scatters by 0.16 dex.

The values are in `mqnm/data/nr_calibration.json`; see F1 in [results](#results).

**Why $e$ and $f$ are not double counting.** They are errors on *different ratios*. $e_{\ell m}$ is the error on the fundamental relative to the 220, $C_{\ell m 0}/C_{220}$. $f_{\ell m n}$ is the error on the overtone relative to its *own* fundamental, $C_{\ell m n}/C_{\ell m 0}$. Each is calibrated on its own NR ratio. An overtone relative to the 220 then carries both: $\mathbb E|R/(g w) - 1|^2 = e^2 + f^2 + e^2 f^2$ if the two are independent.

NR checks this directly:

| ladder | observed rms of $C_{\ell m 1}/(g w\, C_{220}) - 1$ | model | correlation of the two errors |
|---|---|---|---|
| (3,3) | 0.47 | 0.39 | +0.53 |
| (2,1) | 4.0 | 3.0 | +0.08 |
| (3,2) (23 runs) | 1.9 | 1.9 | −0.44 |
| (4,4) (13 runs) | 0.6 | 0.7 | −0.05 |

The hierarchical model, if anything, slightly *under*estimates the total error. When a fundamental overshoots PN, its overtone tends to overshoot with it (correlation +0.53 for the 33).

### 8.4 Counting parameters

220 + 221 gives two complex amplitudes, i.e. 4 real parameters. The prior carries their predicted complex ratio. The angles, masses and spins are fixed, as they would be after an IMR analysis. Populations are handled by ensembles over them, not by averaging inside the prior.

## 9. Two-mode toy model

**Setup.** Two real amplitudes $a = (a_1, a_2)$, with data $d = a_1 z_1 + a_2 z_2 + n$ and white noise $n \sim \mathcal N(0, \sigma^2 I)$ (for coloured noise, replace $\sigma^{-2}$ by $\Sigma_n^{-1}$). Everything the data say about $a$ is in the sufficient statistic

$$
y = Z^{T} d / \sigma^2 \sim \mathcal N(F a,\ F), \qquad F = Z^{T} Z / \sigma^2 \quad \text{(the Fisher matrix)}.
$$

With a Gaussian prior $a \sim \mathcal N(0, \Sigma_a)$, the posterior is Gaussian:

$$
\Sigma_{\rm post} = \big(\Sigma_a^{-1} + F\big)^{-1}, \qquad \mu_{\rm post} = \Sigma_{\rm post}\, y .
$$

**Channels.** Whiten the prior, $a = \Sigma_a^{1/2} b$ with $b \sim \mathcal N(0, I)$. The data then see $b$ through $\tilde Z = \sigma^{-1} Z \Sigma_a^{1/2} = U\,\mathrm{diag}(s_i)\,W^{T}$. In the rotated coordinates $c = W^{T} b$ everything decouples: each $c_i$ has prior variance 1 and posterior variance $1/(1 + s_i^2)$, and its posterior mean is the data estimate shrunk by $s_i^2/(1 + s_i^2)$. Channel $i$ is **measurable** when $s_i > 1$: the data halve its variance.

**Closed form.** Take equal per-mode SNR $\rho$ ($\rho^2 = \sigma_a^2 \lVert z_j\rVert^2/\sigma^2$), overlap $c = \langle z_1, z_2\rangle / (\lVert z_1\rVert\,\lVert z_2\rVert)$, and prior correlation $r$, so that $\Sigma_a = \sigma_a^2 \begin{pmatrix} 1 & r \\ r & 1\end{pmatrix}$. Both $F$ and $\Sigma_a$ are diagonal in the basis $(1, \pm 1)/\sqrt 2$, so exactly

$$
s_\pm^2 = \rho^2\, (1 \pm r)\,(1 \pm c).
$$

- **Flat prior** ($r = 0$): the sum $a_1 + a_2$ is measured first, with $s_+ = \rho\sqrt{1 + c}$. The difference, which is what *resolves* the two modes, needs $\rho > 1/\sqrt{1 - c}$: a Rayleigh criterion for damped modes.
- **Correlated prior** ($r > 0$, like the PN + QNEF prior tying modes together): the difference direction is already constrained by the prior, $s_- = \rho\sqrt{(1 - r)(1 - c)}$, so the data have little to add there. The posterior can then be narrow with only one measurable channel. $n_{\rm meas}$ counts what the *data* teach us, not how narrow the posterior is.

**Overlap of two damped modes.** For a long segment starting at $t = 0$,

$$
c^2 = \frac{4\gamma_1\gamma_2}{(\omega_{1R} - \omega_{2R})^2 + (\gamma_1 + \gamma_2)^2}, \qquad \omega_j = \omega_{jR} - i\gamma_j .
$$

For the 220 and 221 at $\chi_f = 0.686$, $c = 0.864$. The second channel then needs $\rho > 2.7$ with a flat prior and $\rho > 6.1$ with $r = 0.8$. Finding F5 shows the three regimes (0, 1 and 2 channels) for both priors.

**Complex amplitudes.** Each complex amplitude is two real parameters. With circular priors and both polarizations, every $s_i$ appears twice, which is why the counts in F3 and F4 come in pairs for the dominant modes.

## 10. Non-modal content as noise

**Why.** Near the merger the strain is not yet a sum of QNMs. If free overtones are allowed to absorb that content, they are counted as measurable channels, and $n_{\rm meas}$ keeps growing as the start time moves earlier (F6). Following Dyer & Moore (arXiv:2510.11783), we instead model what the QNM model misses as a Gaussian process and add it to the *noise*. The signal keeps only the modes we have evidence for: all fundamentals, plus the overtones NR sees (221, 331, 211, 321, 441).

**Kernel.** For each $m > 0$ harmonic, independently,

$$
k_{\ell m}(t, t') = \sigma_{\ell m}^2 \Big[\lambda_e^2\, e^{-(t + t')/\tau} + \lambda_l^2\, e^{-\gamma_{\ell m 0}(t + t')}\Big]\, e^{-(t - t')^2/2\ell_c^2}\, e^{-i\,\mathrm{Re}\,\omega_{\ell m 0}\,(t - t')},
$$

with $\sigma_{\ell m} = |w_{\ell m}|\,\sigma_{220}$ the PN scale of the harmonic and $\gamma_{\ell m 0} = -\mathrm{Im}\,\omega_{\ell m 0}$.

- The **early term** is the non-modal content near the merger.
- The **late term** is modal content the model leaves out (quadratic, retrograde, mixing), which decays with the harmonic.
- The oscillation at $\mathrm{Re}\,\omega_{\ell m 0}$ is what the NR residuals show (0.8–1.0 × that frequency).

**Projection onto detectors.** The mirror harmonic carries $(-1)^\ell \bar e_{\ell m}$, so a detector reading $\mathrm{Re}[a h]$ sees $\mathrm{Re}[e_{\ell m}\beta]$ with $\beta = a Y_{\ell m} + \overline{a (-1)^\ell Y_{\ell,-m}}$. All detectors see the *same* realisation, so the GP is correlated across detectors:

$$
\mathrm{Cov}(d_i, d_j) \mathrel{+}= \tfrac12\,\mathrm{Re}\big(\beta_i \bar\beta_j\, k_{\ell m}\big).
$$

**Calibration.** Maximum likelihood on the (2,2) residuals of 30 SXS runs, 0–20 M. The residual is modelled as the prior-predictive covariance of the trusted modes, conditioned on the fitted 220 (with a 2% fit uncertainty), plus the GP:

$$
\lambda_e = 3.07, \quad \tau = 3.9\,M, \quad \lambda_l = 0.14, \quad \ell_c = 11\,M .
$$

At the merger the non-modal content is about $3\,\sigma_{22}$, and it has decayed to about 8% by $10\,M$. Only (2,2) is used because the PN scale is too poor a normaliser to pool the weaker harmonics (the fit then runs to its bounds). The same kernel, scaled by each $\sigma_{\ell m}$, is applied to every harmonic. That is a stated limitation.
