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

The integral is evaluated with an inverse FFT on a frequency grid of at least $8N$ points and spacing $\Delta f \le f_{\rm low}/64$, then truncated to the segment. This is the construction of Isi & Farr ([2107.05609](https://arxiv.org/abs/2107.05609), Eq. 45). The fine spacing matters for O4, where 98.5% of the variance on the grid sits within a decade of $f_{\rm low} = 10$ Hz; the earlier $\Delta f \approx f_{\rm low}/5$ left a 2.7% error in $C(0)$. Geometric time converts to seconds with the detector-frame mass, $t_{\rm sec} = t\, (1+z) M_f\, G M_\odot / c^3$. The curves are O4, A+, ET-D (one nested detector of the triangle), CE 40 km and CE 20 km (gwfast, the CE-T2000017-v5 baselines), plus LISA (Robson–Cornish–Liu, one TDI channel). The v1 circulant construction is superseded.

**Outside the tabulated band.**

- *Above the table* (5 kHz; 10 kHz for ET), the PSD continues as the power law of its last decade, up to the Nyquist frequency of the grid. Holding the last value, as before, made the noise unphysically low up to Nyquist; it changes no count ([F7](#results)).
- *Below $f_{\rm low}$*, $S$ is held at $S(f_{\rm low})$. This is optimistic, because the real noise keeps rising. But more noise there has no limit: on a segment of tens of milliseconds, noise below $f_{\rm low}$ is a set of slow trends, and each factor of about 100 makes one more trend uninformative. Channel strengths fall by 1–2% per decade of extra noise, and the covariance becomes numerically singular. We treat it as a systematic of a few percent in strength, at most one channel.

**Truncation, leakage and gaps.** The Toeplitz likelihood on $[t_0, t_0 + T]$ is exact for a finite segment. There is no spectral leakage, and it equals gating plus inpainting (Isi & Farr Sec. III B; Zackay et al. [1908.05644](https://arxiv.org/abs/1908.05644)). It gives a 4–6% lower SNR than the frequency-domain $4\int |\tilde h|^2/S\,df$ for the same signal, because it does not treat the data before $t_0$ as known to be signal-free; those data hold the merger. A data gap would simply remove rows and columns of $\Sigma_n$ and $G$. On the ground, gaps are irrelevant at these durations. For LISA, a ringdown of minutes to hours is either whole or lost, so gaps change rates, not the per-event noise.

**LISA.** One A or E channel with the 60° antenna pattern has noise $P_n(f)\,[1 + 0.6 (f/f_*)^2] + \tfrac{3}{20} S_c(f)$, with $P_n$ and the four-year foreground $S_c$ from Robson, Cornish & Liu ([1803.01944](https://arxiv.org/abs/1803.01944), Eqs. 10–14). The factor $3/20$ is the sky and polarisation average of $F^2$ for a 60° interferometer. The smooth response factor is accurate to 6% at 10 mHz but off by 32% at 0.1 Hz, so it is adequate for $10^6\,M_\odot$ and not yet checked for lighter sources.

## Numerics

- Never form $Z^\dagger Z$. Squaring the condition number throws away half the digits. Take the SVD of the rectangular $\tilde Z$ directly.
- float64 is enough: for $\rho \lesssim 10^4$ only singular values within about 4 decades of the top matter. mpmath stays an optional cross-check.

## 8. The amplitude prior: choosing $\Sigma_C$ and calibrating it

The model is linear and Gaussian throughout, $d = G\theta + n$, with an exact posterior and channels from the SVD. Everything an IMR analysis would give us is **fixed**: the remnant mass and spin (hence the frequencies), the mass ratio, and the observing angles $(\iota, \varphi)$. Only the ringdown amplitudes are uncertain. Their prior, $\Sigma_C = \mathbb E[C C^\dagger]$, is the one modelling choice that NR has to inform. This section says how we choose its form and how few numbers we calibrate.

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

### 8.2 The form: theory mean, relative errors

Every amplitude is tied to the 220 by theory, and NR only tells us how far off that theory is:

$$
C_{\ell m 0} = w_{\ell m}\, A_{220} + \epsilon_{\ell m 0}, \qquad
C_{\ell m n} = g_{\ell m n}\, C_{\ell m 0} + \epsilon_{\ell m n}, \qquad A_{220} \sim \mathcal{CN}(0, \sigma_{220}^2).
$$

- **Harmonic ratio $w_{\ell m}$** (complex): the PN ratio $h_{\ell m}/h_{22}$ at leading order, in the frame where the orbital phase at merger is zero, times the resummed 1PN amplitude factor
  $$ w_{\ell m} = w^{\rm N}_{\ell m}(\eta, v)\; e^{(k_{\ell m}(\eta) - k_{22}(\eta))\, v^2}, $$
  where $k_{\ell m}$ is the $v^2$ coefficient of $|h_{\ell m}|/|h^{\rm N}_{\ell m}|$ for non-spinning binaries (Blanchet, arXiv:1310.1528, eqs. 491–513). $w_{22} = 1$. Harmonics without a tabulated $k_{\ell m}$ stay at leading order.
- **The velocity $v$** at which PN is evaluated. It is not fitted: $v = (M\Omega_{\rm peak})^{1/3}$ per binary, with $\Omega_{\rm peak}$ half the $h_{22}$ frequency at the peak of $|h_{22}|$. See 8.4.
- **Overtone ratio $g_{\ell m n}$** (complex): $(B_{\ell m n}/B_{\ell m 0})\,(\omega_{\ell m 0}/\omega_{\ell m n})^2$. $B$ are the Teukolsky excitation factors, and $(\omega_0/\omega_n)^2$ converts $\psi_4 = \ddot h$ to strain. For the 221 it is multiplied by a factor $\kappa$ (8.3).
- **The errors** are independent and relative:
  $$
  \epsilon_{\ell m 0} \sim \mathcal{CN}\big(0,\ (e\, |w_{\ell m}| \sigma_{220})^2\big), \qquad
  \epsilon_{\ell m n} \sim \mathcal{CN}\big(0,\ (f\, |g_{\ell m n}| \sigma_{\ell m})^2\big),
  $$
  with $\sigma_{\ell m}^2 = \mathbb E|C_{\ell m 0}|^2 = |w_{\ell m}|^2 \sigma_{220}^2 (1 + e^2)$. **One** $e$ serves every harmonic, and **one** $f$ serves every overtone with a tabulated ratio (211, 221, 321, 331, 441). The first missing PN term is $O(v^2)$ relative to the kept one for every harmonic (Blanchet, arXiv:1310.1528), so no harmonic needs its own power of $v$. That is what makes a single pooled $e$ natural.
- **Overtones without a usable ratio** ($n \ge 2$, and $n = 1$ of the other ladders) have zero mean, are independent of the 220, and take the scale of the ladder's first overtone:
  $$ C_{\ell m n} \sim \mathcal{CN}\big(0,\ (a\, |g_{\ell m 1}|\, \sigma_{\ell m})^2\big). $$
  The excitation-factor tables stop at $\ell \le 7$, $n \le 3$; nothing is extrapolated beyond them. For $\ell = 8$ the scale uses the median $|g_{\ell m 1}|$ over the tabulated ladders at the same spin. A variance $\propto |g_{\ell m n}|^2$ is not used because it spans 7 orders of magnitude with spin while NR residuals span about 300×. The QNEF *mean* is not used for $n \ge 2$ because it diverges at the peak.

Substituting into $\Sigma = \mathbb E[C C^\dagger]$ (cross terms vanish because the errors are independent and zero-mean), with $u_j = g_j w_j$:

$$
\Sigma_C = \sigma_{220}^2\, u\, u^\dagger \;+\; \sum_{(\ell, m)} (e\, |w_{\ell m}| \sigma_{220})^2\; g^{(\ell m)} g^{(\ell m)\dagger} \;+\; \mathrm{diag}\big(f |g_j| \sigma_{\ell m}\big)^2 \;+\; \mathrm{diag}\big(a |g_{\ell m 1}| \sigma_{\ell m}\big)^2_{\rm untied}.
$$

The first term ties everything to $A_{220}$. The second lets each $(\ell, m)$ ladder move together away from its PN prediction. The third is each tied overtone's own error, and the fourth is the zero-mean overtones. When a ratio is unpredictable ($e \gtrsim 1$), that ladder decouples from the 220 automatically.

**Why $e$ and $f$ do not double count.** They are errors on *different ratios*: $e$ on $C_{\ell m 0}/C_{220}$, $f$ on $C_{\ell m n}/C_{\ell m 0}$. An overtone relative to the 220 then carries both: $\mathbb E|R/(g w) - 1|^2 = e^2 + f^2 + e^2 f^2$. The two errors are nearly independent in NR: $\mathrm{corr}(\log|R_{\ell m 0}/w|, \log|R_{\ell m 1}/g|)$ is +0.19 for (3,3) (264 runs), −0.07 for (2,1), −0.11 for (3,2) and −0.21 for (4,4) (13 runs). A fitted correlation between them comes out at 0.06 and does not improve the held-out score (8.3). An earlier value of +0.53 for (3,3) used a different definition, which we could not reconstruct; it is withdrawn.

**The flat prior** is the uninformed alternative: $\Sigma_C = \sigma^2 I$, independent modes with a common scale.

### 8.3 Calibration: held-out likelihood of NR amplitude ratios

NR amplitudes never enter the prior mean; NR only sets the few numbers above.

**Data.** jaxqualin fits of 500 SXS runs (arXiv:2310.04489), amplitudes at the peak of $|h_{22}|$, harmonic amplitudes divided by $c_\ell$ to give spheroidal ones. Fundamentals are rotated into the PN frame with the run's own 220 phase; for odd $m$ the branch closest to PN is taken. $5\sigma$ outliers are dropped (19 of 3540 run–mode pairs).

**Likelihood.** For each run, the prior implies a complex Gaussian for the ratios $C_{\ell m n}/C_{220}$ conditioned on that run's 220. The numbers $(e, f, a, \kappa)$ maximise the summed log density over a fixed random 350 training runs. Each variant is then scored on the other 150 runs by

- the held-out log predictive density per run, the quantity we select on, and
- the 1- and 2-σ coverage of $|R|$ per mode, as a check of calibration.

A number stays in the model only if it raises the held-out score.

**Result** (held-out log density per run, relative to the best; ± is the standard error over runs):

| variant | calibrated numbers | Δ log density / run |
|---|---|---|
| per-mode tables (9 $e_{\ell m}$, 5 $f_{\ell m n}$, default $e$, $a$), stored | 16 | −3.2 |
| the same 16, refitted on the training runs | 16 | −3.3 |
| leading-order PN, $v = 0.7$, pooled $e, f, a$ | 3 | −8.8 |
| 1PN, $v = 0.7$, pooled $e, f, a$ | 3 | −0.91 ± 0.36 |
| 1PN, $v$ fitted (0.544), pooled $e, f, a$ | 4 | −0.58 ± 0.08 |
| 1PN, $v = 0.562$ (median $v_{\rm peak}$), pooled $e, f, a$ | 3 | −0.52 ± 0.06 |
| **1PN, $v = 0.562$, pooled $e, f, a$, and $\kappa$** | **4** | **0** |
| the same with $v$ also fitted (0.546) | 5 | −0.05 ± 0.04 |
| flat | 1 | −41 |

**The chosen prior**: 1PN, $v$ from the peak frequency (8.4), and four calibrated numbers (fitted with $v = 0.562$; with per-run $v$ on the 188-run subset they come out as $e = 1.85$, $f = 0.36$, $a = 1.29$, $\kappa = 0.76$),

$$ e = 1.91, \qquad f = 0.34, \qquad a = 1.34, \qquad \kappa = 0.77 . $$

- Three pooled numbers beat sixteen per-mode ones by 2.6 per run, on runs they were not fitted to.
- $\kappa = 0.77$ is the known bias of the 221: NR sits at 0.8 of the QNEF ratio. Without it, the 221 is covered 67% of the time at 1σ; with it, 88%.
- Fitting $v$ instead of taking it from the peak frequency changes nothing (0.546 against 0.562).
- $a$ is **not** constrained by these data: only one training run has an overtone without a tabulated ratio. Its value stays near the earlier strain-power estimate (1.42 from matching residual power after 5 M in 30 runs; that method moved $a$ from 0 to 12 as the start time went from 0 to 20 M). We will replace $a$ by an explicit power budget (8.5).

**Coverage at 1σ** (target 0.68) on the 150 held-out runs:

| 210 | 320 | 330 | 430 | 440 | 550 | 660 | 211 | 221 | 331 |
|---|---|---|---|---|---|---|---|---|---|
| 0.58 | 0.40 | 0.99 | 0.37 | 0.71 | 0.76 | 0.66 | 0.70 | 0.88 | 0.98 |

The single pooled $e$ is too wide for (3,3) and too narrow for (3,2) and (4,3). A per-harmonic $e$ would fix that at the cost of parameters we chose not to spend. (3,1) and (7,7) have 3–6 test runs each and are not judged.

### 8.4 $v$ is a source parameter, like $\eta$

The PN ratios need a velocity. A fixed "merger velocity" $v = 0.7$ is a choice with no data behind it, and fitting one global $v$ is a calibrated number. Instead we take it from the binary, $v = (M\Omega_{\rm peak})^{1/3}$, as we take $\eta$ from it. In NR it is measured at the peak of $|h_{22}|$ (median 0.56, 16–84% range 0.54–0.58 over 272 runs). In an analysis it follows from the fixed IMR parameters.

A per-run $v_{\rm peak}$ does not remove the dependence of the fundamental offsets on $\eta$: the Spearman correlation of $\log|R/w|$ with $\eta$ stays at +0.79 for (3,3) and −0.80 for (4,3). So PN at a better velocity does not account for the whole mass-ratio trend.

**Per-run $v$ against one fixed $v$.** On the 272 runs where $\Omega_{\rm peak}$ is available (188 train, 84 test), with $\kappa$ in both:

| $v$ | calibrated numbers | Δ log density / run |
|---|---|---|
| $v_{\rm peak}$ of each run | 4 | −0.03 ± 0.05 |
| 0.562 for every run | 4 | 0 |

They tie, and the coverage agrees to within 0.02 for every mode except the 211, where the per-run version covers less (0.59 against 0.73, on 22 runs). The reason is that $v_{\rm peak}$ barely varies across the catalogue. We keep $v$ as a source parameter, since it costs no calibrated number and follows the binary where the catalogue is thin.

### 8.5 Not yet in the prior

- **Higher overtones with a power budget.** The zero-mean overtones should be agnostic in their amplitudes, with only their total added power fixed. The budget comes from jaxqualin's sum-of-QNM fits, which describe NR after some $t_0$, extrapolated back to the peak. See §11.
- **Harmonic–harmonic correlations**, retrograde and quadratic modes, and spin corrections to the 1PN factor.

### 8.6 What was tried and dropped

- **A GP for the perturbation on a hyperboloidal slice, projected on the QNM eigenfunctions** (left eigenvectors of the discretised Regge–Wheeler/Zerilli operator). The projection works: the frequencies match `qnm` to $10^{-13}$, $10^{-9}$ and $10^{-6}$ for $n = 0, 1, 2$, and data made of one eigenvector project back to it. But a zero-mean GP gives a far broader $C_{221}/C_{220}$ than NR:
  - spread of $\log|C_{221}/C_{220}|$: 0.58–0.90 against 0.38 in NR;
  - phase coherence across draws (1 means the same phase every time): at most 0.77 against 0.98.

  A mean profile would have to be tuned on NR, and NR constrains only the fundamental and the first overtone. We dropped the route.
- **Calibrating $n \ge 2$ errors from NR strain power**: the answer depended on the start time.

### 8.7 Counting parameters

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

## 11. Overtones or unmodelled effects? (brainstorm, 2026-09-27)

*Ideas, not results. Nothing here has been computed yet.*

Near the merger, NR carries power that the modes we trust do not explain. There are two ways to read it, and they enter $d = G\theta + n$ on **opposite sides**:

- **Higher overtones** (signal). Extra columns in $G$, with an amplitude-agnostic prior $\Sigma_{\rm ov} = s^2 D$ whose scale is fixed by a power budget (§8.5). This reading can only *raise* $n_{\rm meas}$.
- **Non-modal content** (noise). A covariance $K_{\rm nm}$ added to the noise (§10). This reading can only *lower* $n_{\rm meas}$.

With the same power budget, the two readings therefore **bracket** $n_{\rm meas}$. The first thing to compute is the width of that bracket. If it is narrow, the question does not matter for this project.

**The power budget.** Take jaxqualin's sum-of-QNM model, which fits NR after some $t_0$, and extrapolate it back to the peak. The power it predicts at $t = 0$ in modes outside the trusted set is the budget, per harmonic and per run. We will quote it as a fraction of the strain energy (detector-free) and convert it to $\rho^2$ per detector. A natural agnostic shape is $D \propto F_{\rm ov}^{-1}$, the inverse Fisher block of the extra modes: it is isotropic in SNR, so the prior spreads the budget evenly over whatever combinations the detector can see. Then every whitened direction of the block has prior SNR $\rho_b^2/k$, and the block's channels switch on together once $\rho_b^2/k \gtrsim 1$.

**Both readings are zero-mean Gaussians for the residual** $r = h_{\rm NR} - (\text{trusted modes})$. On the same budget they differ only in shape:

$$
K_{\rm ov}(t, t') = \sum_{n} \mathrm{var}_n\, e^{-i\omega_n t}\, \overline{e^{-i\omega_n t'}}
\quad\text{(low rank, fixed Kerr frequencies, a fixed decay ladder)}
$$

against $K_{\rm nm}$ (full rank, no fixed frequency, concentrated near the peak). That suggests four tests, cheapest first.

1. **Distinguishing channels.** Solve $K_{\rm ov} v = \lambda\,(K_{\rm nm} + N)\, v$ in the whitened detector basis. Directions with $\lambda$ far from 1 are where the readings differ; counting them is the analogue of $n_{\rm meas}$. The expected log Bayes factor between the two Gaussians is a KL divergence in closed form. As a function of $\rho_{220}$, it gives the SNR at which a detector can tell the readings apart. It uses only the existing linear-Gaussian code.
2. **Span test on NR.** Project the residual on the span of overtones $n = 2, \dots, N$, and track the fraction of power outside that span as the window start $t_0$ moves. Overtones predict a fraction at the NR error floor for every $t_0$; non-modal content predicts a fraction that grows toward the peak. $N$ must be fixed in advance, because enough overtones fit anything over a short window. White noise of the same power is the control that must fail.
3. **Amplitude stability.** If the residual is overtones, amplitudes fitted at different $t_0$ and propagated back to $t = 0$ agree. The budget above already assumes this. The mismatch between the extrapolated model and NR before the fit's $t_0$ is what the overtone reading leaves unexplained, which is a direct estimate of the non-modal part from the same files.
4. **Frequency content.** Overtones oscillate below $\mathrm{Re}\,\omega_{220}$ (Schwarzschild $\ell = 2$: 0.374, 0.347, 0.301 for $n = 0, 1, 2$) and decay fast. Transients driven by the plunge would track the orbital frequency, near $2\Omega_{\rm peak}$. This test is cheap but qualitative.

**Third readings.** Quadratic ($220 \times 220$) and retrograde modes are modal but are not overtones. A residual at their frequencies would pass the span test with the wrong mode set.

**A theory hint.** On a hyperboloidal slice, the QNM sum is guaranteed to hold only after a finite time, and only for analytic data (Ansorg & Macedo, arXiv:1604.02261). That favours the non-modal reading right at the peak, and allows the overtone reading later.
