# Reference fluxes for the point-particle source (tools/plunge/test-source.js),
# from GeneralizedSasakiNakamura.jl's bound-orbit modes: circular orbits
# (e = 0), equatorial and inclined, several polar harmonics k.
#
#     julia tools/plunge/make-reference-source.jl
using GeneralizedSasakiNakamura
using Printf
num(x) = @sprintf("%.17g", x)
cases = [(0.9, 6.0, 1.0, 2, 2, 0), (0.0, 10.0, 1.0, 2, 2, 0),
         (0.7, 7.0, 0.6, 2, 2, -2), (0.7, 7.0, 0.6, 2, 2, -1), (0.7, 7.0, 0.6, 2, 2, 0),
         (0.7, 7.0, 0.6, 2, 2, 1), (0.7, 7.0, 0.6, 2, 2, 2), (0.7, 7.0, 0.6, 3, 1, 1),
         (0.5, 10.0, 0.3, 2, -1, 1), (0.99, 4.0, 0.8, 2, 2, 1), (0.6, 8.0, -0.5, 3, -2, -1)]
open(joinpath(@__DIR__, "reference-source.json"), "w") do io
    println(io, "{\"source\": \"GeneralizedSasakiNakamura.jl $(pkgversion(GeneralizedSasakiNakamura)), Teukolsky_pointparticle_mode, e = 0, N = 256, K = 128\",")
    println(io, " \"modes\": [")
    for (i, (a, p, x, l, m, k)) in enumerate(cases)
        # (x = -1 exactly trips the package's geodesics, so retrograde is tested inclined)
        md = Teukolsky_pointparticle_mode(-2, l, m, 0, k, a, p, 0.0, x; K=128)
        print(io, "  {\"a\":$(num(a)),\"p\":$(num(p)),\"x\":$(num(x)),\"l\":$l,\"m\":$m,\"k\":$k,")
        print(io, "\"omega\":$(num(md.mode.omega)),\"EnergyFlux\":$(num(md.energy_flux)),\"absZ\":$(num(abs(md.amplitude)))}")
        println(io, i < length(cases) ? "," : "")
        @printf("%2d a=%.2f p=%.1f x=%.2f l=%d m=%d k=%d  w=%.6f  Edot=%.6e\n", i, a, p, x, l, m, k, md.mode.omega, md.energy_flux)
    end
    println(io, " ]}")
end
