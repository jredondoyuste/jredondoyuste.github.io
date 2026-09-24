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

## 7. Coloured-noise covariance

For stationary noise with one-sided PSD $S(f)$, give each FFT bin (both signs of $f$) an independent $\mathcal{CN}(0, S(|f|)\,\Delta f)$ component:

$$
(\Sigma_n)_{jk} = \sum_{f} S(|f|)\,\Delta f\; e^{2\pi i f (t_j - t_k)} .
$$

Using both signs matters. A one-sided analytic signal would make $\Sigma_n$ rank-deficient, and the whitener would not exist. Geometric time is converted with $t_{\rm sec} = t\, M_f\, G M_\odot/c^3$. The PSD is normalised so that its minimum is 1, which puts it on the same scale as `WhiteNoise(1)`. The aLIGO curve is held flat below 20 Hz so that it stays finite.

## Numerics

- Never form $Z^\dagger Z$. Squaring the condition number throws away half the digits. Take the SVD of the rectangular $\tilde Z$ directly.
- float64 is enough: for $\rho \lesssim 10^4$ only singular values within about 4 decades of the top matter. mpmath stays an optional cross-check.

## 8. How $\Sigma_A$ is built today, and what is wrong with it

### From a relation to a covariance

The relation $A_j = w_j A_{220} + \epsilon_j$ is a **recipe for drawing amplitudes**, not an equation to solve:

1. We don't know the amplitudes before looking at the data: they depend on distance, orientation, mass ratio and so on. The prior is a probability distribution over them. A zero-mean Gaussian is fixed entirely by $\Sigma_{jk} = \mathbb E[A_j \bar A_k]$, and the analysis only uses these second moments.
2. The recipe: draw $A_{220} \sim \mathcal{CN}(0, \sigma^2)$, draw independent errors $\epsilon_j \sim \mathcal{CN}(0, s_j^2)$, and set $A_j = w_j A_{220} + \epsilon_j$.
3. Substitute the recipe into the definition. The cross terms vanish because the errors are independent of $A_{220}$ and have zero mean:

$$
\Sigma_{jk} = \mathbb E\big[(w_j A_{220} + \epsilon_j)(\bar w_k \bar A_{220} + \bar\epsilon_k)\big] = \sigma^2 w_j \bar w_k + s_j^2\,\delta_{jk}.
$$

**Example with two modes.** Take $w = (1,\ 4e^{i\theta})$ for (220, 221), $\sigma = 1$, and a 30% error on the 221 only ($s = 1.2$):

$$
\Sigma = \begin{pmatrix} 1 & 4e^{-i\theta} \\ 4e^{i\theta} & 17.44 \end{pmatrix}, \qquad \text{correlation} = 4/\sqrt{17.44} = 0.96 .
$$

The prior cloud is a thin cigar along $w$: knowing $A_{220}$ fixes $A_{221}$ to within 30%. The error model sets how thin the cigar is, and the phase of $w$ sets its direction in the complex plane. Other unknowns enter the same way, by averaging: a uniform azimuth gives $\mathbb E[e^{i(m - m')\phi}] = \delta_{mm'}$, which removes the correlations between different $m$.

### What the code does today

**The current PN + QNEF prior** (`PNQNEFPrior`) is a one-factor model tied to the 220 amplitude:

$$
A_{\ell m n} = w_{\ell m n}\, A_{220} + \epsilon_{\ell m n}, \qquad
w_{\ell m n} = r_{\ell m}(\eta, v_{\rm ref})\;\Big|\frac{B_{\ell m n}}{B_{\ell m 0}}\Big|\; e^{\mathrm{Im}(\omega_{\ell m n} - \omega_{\ell m 0})(t_0 - t_{\rm ref})}\; s^{\,n},
$$

with $A_{220} \sim \mathcal{CN}(0, \sigma_{220}^2)$ and independent errors $\epsilon_j \sim \mathcal{CN}\big(0, (f\, w_j \sigma_{220})^2\big)$, where $f = 0.3$ is `spread_frac`. Here $r_{\ell m}$ is the leading-order PN ratio $|h_{\ell m}/h_{22}|$ and $s$ is the source-suppression factor. Taking the second moment,

$$
\Sigma_A = \mathbb E[A A^\dagger] = \sigma_{220}^2\, w w^{T} + \sigma_{220}^2 f^2\, \mathrm{diag}(w_j^2).
$$

So the prior is **rank one plus a small diagonal**, and the error model is a 30% complex Gaussian scatter around the scaling, independent between modes.

**Problem 1: the phases are locked.** $w_j$ is real and positive, so every mode is assumed to be *in phase* with $A_{220}$, up to about $\pm 17^\circ$ from $\epsilon$. Physically:

- between overtones of the same $(\ell, m)$, the relative phase is $\arg(B_n/B_0) - \mathrm{Re}(\omega_n - \omega_0)(t_0 - t_{\rm ref})$, plus a source phase. It is known, but it is not zero. The QNEF tables contain it, but v1 used only $|B_n|/|B_0|$ and only the $\mathrm{Im}\,\omega$ part of the time shift. There was no good reason for that; it was a shortcut. NR confirms that the phase is coherent: the 221/220 phase at peak scatters by only 0.28 rad over 468 SXS runs (331/330: 0.16 rad);
- between different $(\ell, m)$, the observed amplitude carries ${}_{-2}Y_{\ell m}(\iota, \phi) \propto e^{im\phi}$, so the relative phase depends on the unknown orientation.

**Checked (2026-09-24)** at $\chi = 0.7$, $\ell = m$ set, white noise: the rank-one structure makes one "template" channel ($s_1/s_2 \approx 40$, against $\approx 7$ for a diagonal prior with the same variances). It costs 1–2 measurable channels at $\rho_{220} = 30$–$1000$, at both $t_0 = 0$ and $5\,M$.

**Fix: average over orientation.** Write the observed amplitude as $A^{\rm obs}_{\ell m n} = A_{\ell m n}\, {}_{-2}Y_{\ell m}(\iota, \phi)$.

- With $\phi$ uniform, $\mathbb E[e^{i(m - m')\phi}] = \delta_{m m'}$. This removes all cross-covariance between different $m$.
- If $\iota$ is also isotropic, orthonormality $\int {}_{-2}Y_{\ell m}\, {}_{-2}Y^*_{\ell' m'}\, d\Omega = \delta_{\ell\ell'}\delta_{mm'}$ gives

$$
\mathbb E\big[A^{\rm obs}_{\ell m n} A^{{\rm obs}\,*}_{\ell' m' n'}\big] = \frac{\delta_{\ell\ell'}\delta_{mm'}}{4\pi}\; \mathbb E\big[A_{\ell m n} A^*_{\ell m n'}\big].
$$

So $\Sigma_A$ is **block-diagonal in $(\ell, m)$**, and all the correlation sits inside each overtone ladder. Within a block the loadings are complex: $w_{\ell m n} \propto r_{\ell m}\,(B_{\ell m n}/B_{\ell m 0})\, e^{-i\omega_{\ell m n}(t_0 - t_{\rm ref})}$. For a specific event with a measured inclination (GW250114), keep $\iota$ fixed and average only over $\phi$: the blocks become per-$m$.

**The error model** should be calibrated, not assumed. Compare $w$ with the jaxqualin NR hyperfits at the same reference time. The scatter of $\ln|A_{\rm NR}/A_{\rm model}|$ and of the phase residual, per $\ell$ and $n$, then replaces $f = 0.3$.

**Mirror modes (corrected 2026-09-24).** The strain $h = h_+ - i h_\times$ is complex, and the mirror frequencies $-\bar\omega$ are distinct in it, so the mode set *is* doubled. For aligned spins, equatorial symmetry $h_{\ell,-m} = (-1)^\ell\, \bar h_{\ell m}$ ties the two amplitudes together:

$$
A_{\ell m n} = C_{\ell m n}\, {}_{-2}Y_{\ell m}(\iota,\phi), \qquad
A^{\rm mirror}_{\ell m n} = (-1)^\ell\, \bar C_{\ell m n}\, {}_{-2}Y_{\ell,-m}(\iota,\phi).
$$

So $\mathbb E[A\,A^{\rm mirror}] \neq 0$. This is a *pseudo*-covariance, and it survives the average over $\phi$ because the two phase factors $e^{\pm im\phi}$ cancel. A circular complex Gaussian cannot represent it, so the analysis moves to an augmented (real) parametrization with two real parameters per $C$. The mirror columns then enter with weight ${}_{-2}Y_{\ell,-m}/{}_{-2}Y_{\ell m}$, which is large away from face-on. With precession the tie breaks and the mirror amplitudes become free.

NR agrees: the *intrinsic* counter-rotating content of $h_{22}$ is tiny (jaxqualin: $A_{-220}/A_{220} \sim 4\times 10^{-4}$ at peak), so the mirror frequencies in the observed strain come from $\bar h_{\ell m}$ through the inclination.

A single detector records only the real projection $\mathrm{Re}[(F_+ + iF_\times)h]$, and in it a mirror term has the same time dependence as its partner. Separating them needs both polarizations, i.e. a network. H1 and L1 are nearly co-aligned, so for GW250114 that is a real limitation; ET's triangle and ET + CE see both.

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
