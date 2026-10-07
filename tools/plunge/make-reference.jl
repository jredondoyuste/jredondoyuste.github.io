# Reference values for tools/plunge/test-gsn.js, from GeneralizedSasakiNakamura.jl.
#
#     julia tools/plunge/make-reference.jl
#
# For each (l, m, a, omega): Teukolsky's lambda, the Teukolsky amplitudes
# B_inc and B_ref of R_in (unit transmission), and R_in, dR_in/dr at a few
# radii. The package defaults (r_* in [-50, 1000], ODE tolerance 1e-12) leave
# B_ref, which can be 1e-9 of B_inc at high frequency, wrong by a few per
# cent; tightened to tolerance 1e-14, r_* in [-50, 300] (3000 below
# omega = 0.2, so that the series at infinity still converges) and series of
# order 10 at the horizon and 20 at infinity, it converges.
using GeneralizedSasakiNakamura
using Printf

const s = -2
cases = Any[]
for a in (0.0, 0.7, 0.99), (l, m) in ((2, 2), (2, -2), (2, 0), (3, 1), (4, 4)), omega in (0.05, 0.3, 1.0, 2.0)
    push!(cases, (l, m, a, omega))
end
push!(cases, (2, 2, 0.9, -0.4))
push!(cases, (2, 1, 0.5, 0.01))

rp(a) = 1 + sqrt(1 - a^2)
cpx(z) = [real(z), imag(z)]
num(x) = @sprintf("%.17g", x)
jc(z) = "[" * num(real(z)) * "," * num(imag(z)) * "]"

open(joinpath(@__DIR__, "reference-gsn.json"), "w") do io
    println(io, "{\"source\": \"GeneralizedSasakiNakamura.jl $(pkgversion(GeneralizedSasakiNakamura)), rsin=-50, rsout=300 (3000 if |omega|<0.2), orders 10/20, tolerance 1e-14\",")
    println(io, " \"modes\": [")
    for (i, (l, m, a, omega)) in enumerate(cases)
        rsout = abs(omega) < 0.2 ? 3000 : 300
        t = @elapsed R = Teukolsky_radial(s, l, m, a, omega, IN, -50, rsout; horizon_expansion_order=10, infinity_expansion_order=20, tolerance=1e-14)
        rs = [rp(a) + 0.01, 1.5 * rp(a), 3.0, 6.0, 10.0, 30.0, 100.0, 500.0]
        vals = [R.Teukolsky_solution(r) for r in rs]
        print(io, "  {\"l\":$l,\"m\":$m,\"a\":$(num(a)),\"omega\":$(num(omega)),\"lambda\":$(num(real(R.mode.lambda))),")
        print(io, "\"Binc\":$(jc(R.incidence_amplitude)),\"Bref\":$(jc(R.reflection_amplitude)),")
        print(io, "\"r\":[" * join(num.(rs), ",") * "],")
        print(io, "\"R\":[" * join([jc(v[1]) for v in vals], ",") * "],")
        print(io, "\"dR\":[" * join([jc(v[2]) for v in vals], ",") * "],")
        print(io, "\"seconds\":$(num(t))}")
        println(io, i < length(cases) ? "," : "")
        @printf("%3d/%d  l=%d m=%d a=%.2f w=%.2f  %.2fs\n", i, length(cases), l, m, a, omega, t)
    end
    println(io, " ]}")
end
