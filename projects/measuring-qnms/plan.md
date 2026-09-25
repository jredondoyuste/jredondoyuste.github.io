## Progress

<div style="margin: 0.6rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">original plan (items 1–8) · 7 of 7 done</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 100%; height: 100%; background: var(--accent);"></div></div>
<div style="margin: 0.9rem 0 0.2rem; font-variant-caps: small-caps; color: var(--muted);">follow-ups · 1 of 9 done</div>
<div style="background: var(--hair); height: 0.7rem; border-radius: 0.35rem; overflow: hidden;"><div style="width: 11%; height: 100%; background: var(--accent);"></div></div>

## Original plan

| # | task | status | where |
|---|---|---|---|
| 1 | Amplitude prior: PN × complex QNEF ratios, conditioned on the observing angles, errors calibrated on NR | <span style="color: var(--accent)">✓ done</span> | [§8](#derivations), F1 |
| 2 | Modes $\ell \le 8$, all $m$, $n \le 7$; spheroidal harmonics; mirror modes tied by symmetry | <span style="color: var(--accent)">✓ done</span> | [§8](#derivations) |
| 3 | Detector noise: O4, A+, ET, CE, LISA; PSD → Toeplitz covariance | <span style="color: var(--accent)">✓ done</span> | [§7](#derivations) |
| 4 | Sensitivity overlay: GW250114-like (real SXS strain) and LISA | <span style="color: var(--accent)">✓ done</span> | F2 |
| 5 | Two-mode toy model: closed form, and prior / posterior for 0, 1, 2 channels | <span style="color: var(--accent)">✓ done</span> | [§9](#derivations), F5 |
| 6 | Channel counts against $\rho_{220}$ and redshift, per detector | <span style="color: var(--accent)">✓ done</span> | F3 |
| 8 | Saturation as overtones and harmonics are added | <span style="color: var(--accent)">✓ done</span> | F4 |

## Follow-ups

| task | status | notes |
|---|---|---|
| Code: private repo, tests, tutorial notebook | <span style="color: var(--accent)">✓ done</span> | github.com/jredondoyuste/mqnm |
| Which modes each measured channel corresponds to | <span style="color: var(--accent-2)">◐ next</span> | project each channel onto the modes |
| Realistic sky positions and antenna patterns (H1/L1 for GW250114) | <span style="color: var(--accent-2)">◐ next</span> | replaces the overhead, co-located idealisation |
| Start before 10 M: non-modal GP noise | <span style="color: var(--accent-2)">◐ redo</span> | first version (F6) used only NR-extractable modes; redo with the full mode set |
| Very large mode set (10⁴–10⁵ modes) | <span style="color: var(--accent-2)">◐ next</span> | computed in data space; asymptotic frequencies for high ℓ, n |
| 221 bias: 1σ coverage only 26% | <span style="color: var(--muted)">○ open</span> | NR sits at 0.8× the QNEF prediction with little scatter |
| Correlated fundamental and overtone errors ((3,3): +0.53) | <span style="color: var(--muted)">○ open</span> | the independent model slightly underestimates the total error |
| Harmonics other than (2,2) under-covered at late times | <span style="color: var(--muted)">○ open</span> | quadratic 220×220 and retrograde content not modelled |
| Mild spin trend of the zero-mean overtone scale $a$ | <span style="color: var(--muted)">○ open</span> | correlation +0.55 with $\chi_f$ |

## Noise ladder and the non-modal GP: the plan in detail (2026-09-25)

### 1. What the noise covariance is for

Everything we compute comes from $d = G\theta + n$ with $n \sim \mathcal N(0, \Sigma_n)$. The channels are the singular values of $\Sigma_n^{-1/2}\, G\, \Sigma_\theta^{1/2}$. $\Sigma_n$ tells the analysis *which parts of the data to trust*: where it is large, the data are down-weighted. Three levels, of increasing realism:

- **N1, white noise**, $\Sigma_n = \sigma^2 I$: every sample is equally trustworthy. A baseline that isolates the effect of the signal model alone.
- **N2, detector noise**: the PSD turned into a Toeplitz covariance (§7). Some frequencies are noisier than others, which is the real detector.
- **N3, detector noise + unmodelled signal**, $\Sigma_n + K$. $K$ is the covariance of whatever is in the true waveform but *not* in our QNM model. It is what Dyer & Moore do for NR numerical error; here it is waveform-model error.

**Why N3 is needed.** In any linear-Gaussian analysis, content in the data that the model lacks does not disappear: the model's parameters absorb it. Near the merger the waveform is not yet a sum of QNMs. If nothing represents that content, the QNM amplitudes absorb it and are *counted as measured channels*. $K$ gives that content a place to go that does not count.

### 2. The real difficulty: what counts as "unmodelled" depends on the overtone prior

Our signal has 280 modes. Many are overtones: damped sinusoids with frequencies close to the fundamental's and damping rates growing with $n$. At early times, a sum of many overtones with free amplitudes can imitate almost any smooth transient; this is the well-known overtone-overfitting problem. So:

- **large prior amplitudes for the overtones** → they absorb the early transient → $K \approx 0$, and the transient is counted as modes;
- **small prior amplitudes** → the transient is left over → $K$ is large, and it is treated as noise.

Physics does not fix this. Excitation factors are tabulated only to $n \le 3$; even there the mapping to observed amplitudes depends on an arbitrary reference time and on the source; and NR cannot robustly extract amplitudes beyond $n = 1$. **Today, the zero-mean overtone scale $a$ was fitted to the *total* NR residual at 5 M, so the overtones are already sized to absorb the transient: they are currently doing the GP's job.** Calibrating a GP on top of that residual would be circular: whatever the overtones already absorbed, the GP never sees.

The plan below turns "how much of the merger is overtones, and how much is non-modal?" into a question the NR data answer, and reports honestly when they cannot.

### 3. Step by step

**Step 1: the existing ladder (N1, N2) × (flat, PN + QNEF).**
*What:* $n_{\rm meas}$ against $\rho_{220}$ and against $t_0$, with white and detector noise set to the *same* $\rho_{220}$.
*Why:* matching $\rho_{220}$ removes the trivial difference in noise level, so white vs detector isolates the effect of the noise *spectrum* (which frequencies are cheap to measure). It is the baseline every later step is compared against, and it uses only code that exists.

**Step 2: a likelihood for NR waveforms without artefacts.**
*What:* for each SXS run and each loud harmonic, the probability of the NR strain over $0 \le t \le 40\,M$ under our model:

$$
h_{\rm NR} \sim \mathcal{CN}\big(0,\; Z\,\Sigma_A(a)\,Z^\dagger + K(\psi) + \text{floor}\big),
$$

where $Z\Sigma_A Z^\dagger$ is what the QNM prior predicts, $K(\psi)$ is the GP with parameters $\psi$ (size, decay time, coherence time), and the floor covers NR numerical noise. Two fixes relative to the first attempt:

- **Marginalise over the 220** instead of conditioning on its fitted value. Conditioning pins $C_{220}$ exactly, so its 1–2% fit error has nowhere to go and the likelihood inflates the GP to explain it. That is what sent the first fit to its bounds. Treating $C_{220}$ as random with its prior is exact and removes the artefact.
- **Normalise the GP by each harmonic's full prior scale**, $\sigma_{\ell m}\sqrt{1 + e_{\ell m}^2}$, not the bare PN scale. PN is off by up to about 3× for weak harmonics, and near equal mass it predicts almost nothing for odd $m$ while spins still excite them, so normalised residuals exploded. If pooling still fails, give each harmonic its own GP amplitude $\lambda_{\ell m}$ with a shared prior. This is standard partial pooling: harmonics with enough data set their own value, and weak ones shrink to the common one.

**Step 3: fit the overtone scale $a$ and the GP *together* (empirical Bayes).**
*What:* choose $(a, \psi)$ to maximise the product of these likelihoods over all runs and harmonics.
*Why this can separate them:* the two pieces have different *shapes* in time. An overtone contributes a damped sinusoid at an exact QNM frequency and damping rate, fixed by the remnant. The GP contributes a smooth envelope with its own decay and coherence time, and no fixed frequency lattice. The likelihood prefers whichever combination of shapes reproduces the NR residuals *across the whole catalogue and the whole 0–40 M window*. The $\log\det$ term penalises inflating either piece beyond what the data need. This is standard GP hyperparameter learning (Rasmussen & Williams, ch. 5), and the same procedure Dyer & Moore used.
*Why over 0–40 M and not at a start time:* the model should describe the waveform from the merger on. The start time is then an analysis choice we *study* (step 6), not something built into the prior, as it is today with $a$ fitted at 5 M.

**Step 4: check whether the data really separate them.**
*What:* the profile likelihood $L(a) = \max_\psi \log p(h_{\rm NR} \mid a, \psi)$ over a grid of $a$.
*Why:* if $L(a)$ has a clear peak, the data fix how much of the merger is overtones, and we use that $a$. If $L(a)$ is flat, overtones and the GP are interchangeable and no single split is justified. We then take the range of $a$ within $\Delta\log L \approx 2$ of the best, and show $n_{\rm meas}$ across it. In that case the honest result is "$n_{\rm meas}$ at early start times depends on this choice, and here is by how much", which is a result in its own right.

**Step 5: validate on runs the fit has not seen.**
*What:* fit on 15 SXS runs and test on the other 15.
- **Held-out likelihood:** compare the rungs (no GP; GP with the fitted $a$; GP at the ends of the degenerate range).
- **Coverage:** check that the NR strain falls inside the model's 68% and 90% bands at the nominal rate, at *every* time from $t = 0$, for every loud harmonic.

*Why:* hyperparameters fitted to NR can overfit those particular runs. Held-out performance is the standard guard. Coverage from $t = 0$ is the concrete test that fails today (61% and 2% at 5–10 M): the GP model passes only if it fixes it.

**Step 6: the science.**
*What:*
- $n_{\rm meas}$ against start time, for GW250114-like sources in each detector, across the ladder;
- $n_{\rm meas}$ against $\rho_{220}$ at $t_0 = 0$ with N3, compared with $t_0 = 10\,M$ with N2;
- the saturation test (F4) repeated with N3.

*Expected:* with N3, adding the earliest data stops adding channels once the non-modal content dominates, so $n_{\rm meas}(t_0)$ flattens. That plateau is the start-time-independent answer, bracketed by the step-4 range if the split is degenerate.

### 4. Practicalities

- **The GP scales with the source:** its size is set by $\sigma_{220}$. Channel strengths are therefore no longer simply proportional to $\rho_{220}$, and each SNR needs its own covariance. Still cheap.
- **The GP is correlated across detectors**, since they all see the same unmodelled signal. This is already implemented.
- **For the flat prior** the prior-predictive variance is already huge, so the GP will come out close to zero and N3 ≈ N2. We calibrate it anyway, with the same procedure.
- **Cost:** the likelihood for 30 runs × 5 harmonics × about 80 samples each takes seconds per evaluation. The profile over about 15 values of $a$ takes minutes.

## Fixed choices

- **Linear Bayesian model**, $d = G\theta + n$; no Fisher. The observing angles, masses and spin are fixed (as from an IMR fit).
- **Default start $t_0 = 10\,M_f$** after the peak of $|h_{22}|$, where the prior reproduces NR strain (F1).
- **The analytic prediction is never replaced by NR:** NR only calibrates errors, and there is no extrapolation beyond the excitation-factor tables.

## From Dyer & Moore (arXiv:2510.11783)

They fit QNMs to NR with the same linear-Gaussian structure: real and imaginary amplitudes, Gaussian posterior, spheroidal mixing. Three things to borrow:

1. **A Gaussian-process kernel for what the QNM model misses.** Their kernel is stationary, with a period set by $\mathrm{Re}\,\omega_{\ell m 0}$ and an envelope decaying like $e^{-t/\tau}$ with $\tau = -1/\mathrm{Im}\,\omega_{\ell m 0}$, capped near the merger. Trained on SXS residuals (NR minus our prior mean), the same form could absorb pre-10 M non-QNM content as extra noise, $\Sigma_n \to \Sigma_n + K$. That keeps the model linear and could let us start earlier.
2. **A per-mode significance** (posterior support for $C_\alpha \ne 0$), to put next to our channel counts, which are per-direction.
3. **Posterior predictive checks** as the fit-quality metric instead of mismatch. This is what our F1 coverage test already does.

Their fits also show overtone amplitudes becoming unstable before about 15 M, consistent with our 10 M start.
