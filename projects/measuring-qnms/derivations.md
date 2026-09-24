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

The model is linear and Gaussian throughout, $d = G\theta + n$, with an exact posterior and channels from the SVD. There are three ingredients.

### 8.1 Amplitudes and angles

Each QNM $j = (\ell, m, n)$ has one complex amplitude $C_j$. The inclination $\iota$ is **fixed** for each scenario: the measured value for a named event, or an axis we scan. QNM $j$ contributes

$$
C_j\, S_j(\iota)\, e^{-i\omega_j t} \;+\; \bar C_j\, \tilde S_j(\iota)\, e^{+i\bar\omega_j t}
$$

to the complex strain $h = h_+ - i h_\times$.

- $S_j = \sum_{\ell'} c^{\,j}_{\ell'}\, {}_{-2}Y_{\ell' m}$ is its spheroidal harmonic, with mixing coefficients $c$ from the `qnm` package.
- The second term is the mirror mode. Equatorial symmetry ($h_{\ell,-m} = (-1)^\ell \bar h_{\ell m}$, aligned spins) fixes it: $\tilde S_j = \sum_{\ell'} (-1)^{\ell'}\, \bar c^{\,j}_{\ell'}\, {}_{-2}Y_{\ell',-m}$. **The mirror adds no parameters.**
- Because $\bar C_j$ appears, $h$ is linear in $\theta = (\mathrm{Re}\,C, \mathrm{Im}\,C)$ rather than in $C$. That is the only reason the parameters are real.
- A detector records $\mathrm{Re}[(F_+ + iF_\times)h]$, which is also linear in $\theta$. This gives $G$.

### 8.2 Prior: analytic ratios

Within each $(\ell, m)$ overtone ladder, the overtones follow the fundamental through the excitation factors carried to the analysis start $t_0$:

$$
C_{\ell m n} = A_{\ell m 0}\, g_{\ell m n} + \epsilon_{\ell m n}, \qquad
g_{\ell m n} = \frac{B_{\ell m n}}{B_{\ell m 0}}\; e^{-i(\omega_{\ell m n} - \omega_{\ell m 0})(t_0 - t_{\rm ref})}, \qquad g_{\ell m 0} = 1 .
$$

Here $B$ is complex, taken straight from the QNEF tables, and $|e^{-i\Delta\omega\,\Delta t}| = e^{\mathrm{Im}\,\Delta\omega\,\Delta t}$ is the overtone suppression when the analysis starts later.

- The fundamental has $A_{\ell m 0} \sim \mathcal{CN}(0, \sigma_{\ell m}^2)$ with $\sigma_{\ell m} = r_{\ell m}(\eta, v)\, \sigma_{220}$, where $r_{\ell m}$ is the leading-order PN ratio.
- The errors are independent: $\epsilon_{\ell m n} \sim \mathcal{CN}(0, s_{\ell m n}^2)$.
- **Different ladders are independent**, because the unknown azimuth makes their relative phase uniform.

Substituting into $\Sigma = \mathbb E[C C^\dagger]$ (the cross terms vanish because $\epsilon$ is independent of $A$ and has zero mean), the covariance is block-diagonal, one block per $(\ell, m)$:

$$
\Sigma_C^{(\ell m)} = \sigma_{\ell m}^2\, g\, g^\dagger + \mathrm{diag}(s^2), \qquad \Sigma_\theta = \tfrac12\begin{pmatrix}\mathrm{Re}\,\Sigma_C & -\mathrm{Im}\,\Sigma_C\\ \mathrm{Im}\,\Sigma_C & \mathrm{Re}\,\Sigma_C\end{pmatrix}.
$$

**Example: the 220 + 221 block.** With $g = (1,\ 4e^{i\theta})$, $\sigma = 1$ and $s_{221} = 0.3 \times 4$:

$$
\Sigma_C = \begin{pmatrix} 1 & 4e^{-i\theta} \\ 4e^{i\theta} & 17.44 \end{pmatrix}.
$$

The correlation is $0.96$: knowing $C_{220}$ fixes $C_{221}$ to within 30%, in modulus *and* phase.

### 8.3 Error: calibrated on NR

NR amplitudes do not enter the model. The jaxqualin SXS extractions (516 runs, amplitudes and phases at the peak) are used only to calibrate the prior:

1. **$t_{\rm ref}$**, the one free constant in $g$: fitted so that $g_{221}$ matches the NR 221/220 ratios.
2. **$s_{\ell m n}$**: the scatter of the NR overtone ratios $C_{\ell m n}/C_{\ell m 0}$ around $g_{\ell m n}$, in modulus and phase. NR only has $n = 1$, so $n \ge 2$ is extrapolated and flagged.
3. **The error on $r_{\ell m}$**: the scatter of NR $|C_{\ell m 0}/C_{220}|$ around the PN ratio, which inflates $\sigma_{\ell m}$.

### 8.4 Counting parameters

220 + 221 gives two complex amplitudes, i.e. 4 real parameters, and the prior correlation carries their predicted ratio. The angles are *handled* rather than fitted: $\iota$ is conditioned on and the azimuth is averaged into the prior.

**Superseded:** v1's rank-one prior with $|B|$ and real loadings, and a Fisher proposal (withdrawn 2026-09-24). Both remain in the git history.

## 9. Two-mode toy model in closed form

For two modes $\omega_j = \omega_{jR} - i\gamma_j$ in white noise, over a long segment, the overlap of the two columns is

$$
\cos^2\theta = \frac{|\langle z_1, z_2\rangle|^2}{\|z_1\|^2\|z_2\|^2} = \frac{4\gamma_1\gamma_2}{(\omega_{1R} - \omega_{2R})^2 + (\gamma_1 + \gamma_2)^2},
$$

and the two channel strengths are

$$
s_{1,2}^2 = \frac{\rho^2}{2}\Big[(a + b) \pm \sqrt{(a - b)^2 + 4ab\cos^2\theta}\Big], \qquad a = \frac{\sigma_1^2}{2\gamma_1},\; b = \frac{\sigma_2^2}{2\gamma_2}.
$$

With discrete sampling, $\rho$ absorbs the $1/\Delta t$. Two resolved channels need $s_2 > 1$, which requires both SNR and a separation $|\Delta\omega_R|$ that is large compared with $\gamma_1 + \gamma_2$. This is a Rayleigh criterion for damped modes. Overtones of one $(\ell, m)$ have similar $\omega_R$ and damping rates that grow with $n$, so $\cos\theta$ stays large and the second channel costs a lot of SNR. This will be item 5 of the plan.
