"""Pack the quadratic-coupling table (BlackHoleNonlinearities.jl) for quadratic.html.

    python3 tools/quadratic/pack.py ~/Desktop/qtable_x13_v2.tsv

writes files/quadratic/index.json and one <sector>.bin per parity sector.

Only canonical triples are kept. A sector with equal parent parities keeps
l1 <= l2; the rest follow from parent exchange,
    Qred(l2, l1, l; w2, w1) = (-1)^(l1+l2+l) Qred(l1, l2, l; w1, w2),
which this script checks on every mirrored pair before dropping it. The
mixed sectors (e o *) are kept whole; o e * is read from them the same way.

Each triple is 26 x 26 points, index k1*26 + k2 (k = x/0.05 - 1), and each
point six float32: Re Qin, Im Qin, err_in, Re Qout, Im Qout, err_out.
"""
import json, os, sys
import numpy as np
import pandas as pd

src = os.path.expanduser(sys.argv[1])
out = os.path.join(os.path.dirname(__file__), '..', '..', 'files', 'quadratic')
os.makedirs(out, exist_ok=True)

d = pd.read_csv(src, sep='\t', comment='#')
d['k1'] = (d.x1 / 0.05).round().astype(int) - 1
d['k2'] = (d.x2 / 0.05).round().astype(int) - 1
N = 26
assert d.k1.min() == 0 and d.k1.max() == N - 1 and d.k2.max() == N - 1

# Re w_QNM(l, n=0), as used for x = w / Re w_QNM
wq = {}
for l, g in d.groupby('l1'):
    v = (g.w1 / g.x1).to_numpy()
    assert np.ptp(v) < 1e-12
    wq[int(l)] = float(v[0])

cols = ['ReQin', 'ImQin', 'err_in', 'ReQout', 'ImQout', 'err_out']
manifest = {'n': N, 'dx': 0.05, 'wqnm': wq, 'fields': cols, 'sectors': {}}

def grid(g):
    a = np.full((N, N, 6), np.nan)
    a[g.k1, g.k2] = g[cols].to_numpy()
    assert not np.isnan(a).any()
    return a

for sec, gs in d.groupby('sector'):
    same = sec[0] == sec[1]
    triples, blobs = [], []
    by = {k: grid(g) for k, g in gs.groupby(['l1', 'l2', 'l'])}
    for (l1, l2, l), a in sorted(by.items()):
        if same and l1 > l2:
            b = by[(l2, l1, l)].transpose(1, 0, 2)
            sg = (-1) ** (l1 + l2 + l)
            for re, im in ((0, 1), (3, 4)):
                assert np.allclose(a[..., re], sg * b[..., re], rtol=1e-12, atol=0)
                assert np.allclose(a[..., im], sg * b[..., im], rtol=1e-12, atol=0)
            continue
        triples.append([int(l1), int(l2), int(l)])
        blobs.append(a.reshape(-1, 6).astype('<f4'))
    np.concatenate(blobs).tofile(os.path.join(out, sec + '.bin'))
    manifest['sectors'][sec] = triples
    print(sec, len(triples), 'triples', os.path.getsize(os.path.join(out, sec + '.bin')) // 1024, 'kB')

with open(os.path.join(out, 'index.json'), 'w') as f:
    json.dump(manifest, f, separators=(',', ':'))
