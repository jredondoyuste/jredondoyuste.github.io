"""Reference values for tools/kerr/test.js, from the `qnm` package (Stein 2019).

  python3 tools/kerr/make-reference.py > tools/kerr/reference.json

Frequencies and separation constants on a grid of (l, m, n, a), plus the
spheroidal harmonic S(theta) reconstructed from qnm's spectral coefficients
with an independent (mpmath, Goldberg-formula) spin-weighted harmonic.
"""
import json, warnings
import numpy as np, mpmath as mp
import qnm
from qnm.radial import leaver_cf_inv_lentz
from qnm.angular import C_and_sep_const_closest

warnings.filterwarnings("ignore")
s = -2

def goldberg(s, l, m, theta):
    # Goldberg et al. (1967); overall sign conventions vary, so the test
    # compares up to one constant phase.
    th = mp.mpf(theta)
    pref = (-1) ** m * mp.sqrt(mp.factorial(l + m) * mp.factorial(l - m) * (2 * l + 1)
                               / (4 * mp.pi * mp.factorial(l + s) * mp.factorial(l - s)))
    tot = 0
    for r in range(0, l - s + 1):
        k = 2 * r + s - m
        if l + s - r - s + m < 0 or r + s - m < 0 or r + s - m > l + s:
            continue
        term = mp.binomial(l - s, r) * mp.binomial(l + s, r + s - m) * (-1) ** (l - r - s)
        tot += term * mp.cos(th / 2) ** k * mp.sin(th / 2) ** (2 * l - k)
    return float(pref * tot)

def polish(w, A, l, m, n, a, l_max):
    # qnm's cached roots carry its default 1e-10 continued-fraction tolerance,
    # which near a = 1 leaves overtones off by ~1e-7. Re-solve with qnm's own
    # routines, converged to machine precision (secant in omega).
    def F(w):
        A1, C1 = C_and_sep_const_closest(A, s, a * w, m, l_max)
        return leaver_cf_inv_lentz(w, a, s, m, A1, n, tol=1e-16, N_max=10**7)[0], A1, C1
    w0, w1 = w, w * (1 + 1e-7)
    f0 = F(w0)[0]
    for _ in range(30):
        f1, A1, C1 = F(w1)
        if abs(f1 - f0) == 0 or abs(w1 - w0) < 1e-15:
            break
        w0, w1, f0 = w1, w1 - f1 * (w1 - w0) / (f1 - f0), f1
    f1, A1, C1 = F(w1)
    return w1, A1, C1

mp.mp.dps = 40
thetas = [0.05, 0.4, 0.9, 1.3, 1.5707963267948966, 2.0, 2.6, 3.05]
out = {"modes": [], "swsh": [], "thetas": thetas}

for l in range(2, 7):
    for m in range(-l, l + 1):
        for n in range(0, 4):
            if l > 4 and abs(m) not in (0, 1, l) and n > 1:
                continue
            seq = qnm.modes_cache(s=s, l=l, m=m, n=n)
            for a in [0.0, 0.3, 0.7, 0.9, 0.99]:
                w, A, C = seq(a=a)
                w, A, C = polish(w, A, l, m, n, a, seq.l_max)
                ells = qnm.angular.ells(s, m, seq.l_max)
                S = [complex(sum(C[j] * goldberg(s, int(ells[j]), m, th) for j in range(len(C))))
                     for th in thetas]
                out["modes"].append({"l": l, "m": m, "n": n, "a": a,
                                     "w": [w.real, w.imag], "A": [A.real, A.imag],
                                     "S": [[z.real, z.imag] for z in S]})

for l in range(2, 12):
    for m in range(-l, l + 1):
        out["swsh"].append({"l": l, "m": m,
                            "Y": [goldberg(s, l, m, th) for th in thetas]})

json.dump(out, open(1 and "/dev/stdout", "w"))
