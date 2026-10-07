"""Generate js/kerr-gsn-data.js from GeneralizedSasakiNakamura.jl.

    python3 tools/plunge/gen-gsn.py [path/to/GeneralizedSasakiNakamura/<hash>]

Reads the s = -2 expressions of the GSN formalism (Lo 2023, 2306.16469) as
they appear in the Julia package -- the GSN potentials F and U, the
Teukolsky-from-GSN matrix M, eta, and the GSN-to-Teukolsky amplitude
factors -- and writes each one as data: a rational function of r,
   S^k * sum_j N_j r^j / sum_j D_j r^j,   S = sqrt(r^2 + a^2),
whose coefficients N_j, D_j are lists of monomials
   [re, im, e_a, e_m, e_w, e_lam, e_q, e_rp]
in a, m, omega, lambda, q = sqrt(1 - a^2) and rp = 1 + q. The JS
evaluates the coefficients once per mode (omega and lambda may be complex)
and then each function by Horner's rule.

Everything else (asymptotic series at the horizon and at infinity) is
derived in the JS from F and U, so the generated data stays small.
"""
import glob, json, os, re, sys
import sympy as sp

a, m, w, lam, r = sp.symbols('a m w lam r', real=True)
q, rp, S, S2, Dl = sp.symbols('q rp S S2 Dl', positive=True)
VARS = [a, m, w, lam, q, rp]


def package_dir():
    if len(sys.argv) > 1:
        return sys.argv[1]
    hits = sorted(glob.glob(os.path.expanduser('~/.julia/packages/GeneralizedSasakiNakamura/*/src/Homogeneous')),
                  key=os.path.getmtime)
    if not hits:
        sys.exit('GeneralizedSasakiNakamura.jl not found; pass its path')
    return os.path.dirname(os.path.dirname(hits[-1]))


def block_for_s(src, fname, s=-2):
    """The text of the `s == -2` branch of Julia function `fname`."""
    start = src.index('function ' + fname + '(')
    body = src[start:]
    body = body[:re.search(r'\nend\b', body).end()]
    i = re.search(r'(if|elseif) s == ' + re.escape(str(s)) + r'\b', body).end()
    rest = body[i:]
    # the branch ends at the next elseif/else at the same indentation
    j = re.search(r'\n    (elseif|else)\b', rest)
    return rest[:j.start()] if j else rest


def julia_to_sympy(txt):
    txt = txt.replace('(1 + sqrt(1 - a^2))', 'rp').replace('sqrt(1 - a^2)', 'q')
    txt = txt.replace('(a^2 + (-2 + r)*r)', 'Dl').replace('(a^2 + r^2)', 'S2')
    txt = re.sub(r'\blambda\b', 'lam', txt)
    txt = re.sub(r'\bomega\b', 'w', txt)
    txt = re.sub(r'(\d)([a-zA-Z(])', r'\1*\2', txt)
    txt = txt.replace('^', '**')
    loc = dict(a=a, m=m, w=w, lam=lam, r=r, q=q, rp=rp, S2=S2, Dl=Dl, I=sp.I, sqrt=sp.sqrt)
    return sp.sympify(txt, locals=loc)


def begin_blocks(text):
    """name -> expression for every `name = begin ... end` / `return begin ... end`."""
    out = {}
    for mt in re.finditer(r'(\w+) = begin(.*?)\n\s*end\b', text, re.S):
        out[mt.group(1)] = mt.group(2)
    mt = re.search(r'return begin(.*?)\n\s*end\b', text, re.S)
    if mt:
        out['return'] = mt.group(1)
    return out


def scalar_expr(src, fname):
    blk = block_for_s(src, fname)
    bb = begin_blocks(blk)
    if 'return' in bb:
        return julia_to_sympy(bb['return'])
    if 'inv' in bb:
        return 1 / julia_to_sympy(bb['inv'])
    mt = re.search(r'inv = (.+)\n', blk)
    if mt:
        return 1 / julia_to_sympy(mt.group(1))
    mt = re.search(r'return (.+)\n', blk)
    return julia_to_sympy(mt.group(1))


def monomials(expr):
    """expr (polynomial in VARS, possibly with half-integer powers of rp) -> monomial list."""
    out = []
    for t in sp.Add.make_args(sp.expand(expr)):
        if t == 0:
            continue
        pw = t.as_powers_dict()
        ex = [pw.get(v, 0) for v in VARS]
        c = complex(sp.N(t / sp.Mul(*[v ** e for v, e in zip(VARS, ex)]), 20))
        out.append([c.real, c.imag] + [float(e) for e in ex])
    return out


def rational_in_r(expr):
    """S^k * N(r)/D(r): returns k and coefficient lists of N and D in r."""
    expr = expr.subs(S2, S ** 2).subs(Dl, a ** 2 - 2 * r + r ** 2)
    expr = sp.together(expr)
    num, den = sp.fraction(expr)
    parts = []
    for p in (num, den):
        p = sp.expand(p)
        red = sp.rem(sp.Poly(p, S), sp.Poly(S ** 2 - a ** 2 - r ** 2, S))
        even = sp.expand(red.coeff_monomial(1))
        odd = sp.expand(red.coeff_monomial(S))
        if even != 0 and odd != 0:
            raise ValueError('mixed powers of S')
        parts.append((1, odd) if odd != 0 else (0, even))
    k = parts[0][0] - parts[1][0]
    polys = []
    for _, p in parts:
        P = sp.Poly(p, r)
        deg = P.degree()
        polys.append([monomials(P.coeff_monomial(r ** j)) for j in range(deg + 1)])
    return {'k': k, 'num': polys[0], 'den': polys[1]}


def main():
    root = package_dir()
    hom = os.path.join(root, 'src', 'Homogeneous')
    pot = open(os.path.join(hom, 'Potentials.jl')).read()
    sol = open(os.path.join(hom, 'Solutions.jl')).read()
    tra = open(os.path.join(hom, 'Transformation.jl')).read()
    cnv = open(os.path.join(hom, 'ConversionFactors.jl')).read()
    out = {}
    for name in ('sF', 'sU'):
        out[name[1:]] = rational_in_r(scalar_expr(pot, name))
        print(name, 'deg', len(out[name[1:]]['num']) - 1, '/', len(out[name[1:]]['den']) - 1, file=sys.stderr)
    mblk = begin_blocks(block_for_s(sol, 'Teukolsky_radial_function_from_Sasaki_Nakamura_function_conversion_matrix'))
    for name in ('M11', 'M12', 'M21', 'M22'):
        out[name] = rational_in_r(julia_to_sympy(mblk[name]))
        print(name, 'k', out[name]['k'], file=sys.stderr)
    # eta = c0 + c1/r + ... + c4/r^4 = (c0 r^4 + ... + c4)/r^4
    eblk = block_for_s(tra, 'eta_coefficient')
    cs = [julia_to_sympy(x) for x in re.findall(r'return (.+)\n', eblk)][:5]
    out['eta'] = rational_in_r(sum(c * r ** (4 - i) for i, c in enumerate(cs)) / r ** 4)
    for name in ('Btrans', 'Binc', 'Ctrans'):
        out[name] = rational_in_r(scalar_expr(cnv, name))
    ver = re.search(r'version = "(.*?)"', open(os.path.join(root, 'Project.toml')).read()).group(1)
    js = ('// GENERATED by tools/plunge/gen-gsn.py from GeneralizedSasakiNakamura.jl ' + ver + ' -- do not edit.\n'
          '// s = -2 GSN potentials F, U, the Teukolsky-from-GSN matrix M, eta, and the\n'
          '// GSN-to-Teukolsky amplitude factors, as rational functions of r; see the generator.\n'
          '(function (root) {\n  var data = ' + json.dumps(out, separators=(',', ':')) + ';\n'
          "  if (typeof module !== 'undefined' && module.exports) module.exports = data;\n"
          '  else root.KerrGSNData = data;\n})(this);\n')
    dst = os.path.join(os.path.dirname(__file__), '..', '..', 'js', 'kerr-gsn-data.js')
    open(dst, 'w').write(js)
    print('wrote', os.path.normpath(dst), len(js) // 1024, 'kB', file=sys.stderr)


if __name__ == '__main__':
    main()
