#!/usr/bin/env python3
"""
Gera golden.json: resultados do motor ORIGINAL em Python (plugin Revit,
FireUtils.extension/Fire Utils.tab/lib/hidrantes) para vários cenários.
tests/motorHidrantes.test.mjs compara o motor em TypeScript com este arquivo.

Uso (CPython 3, a partir de qualquer pasta):
    python3 gerar_golden.py "<caminho>/Fire Utils.tab/lib"

Depois que o código Python do plugin for removido, golden.json passa a ser a
referência congelada — não regere sem um motivo normativo, e revise o diff.
"""
import json
import os
import random
import sys
import types

lib = sys.argv[1]
sys.path.insert(0, lib)

# calc.py importa sync (HTTP com o site) só para o cache; o motor não usa.
sync = types.ModuleType("sync")
sync.enviar = lambda *a, **k: None
sys.modules["sync"] = sync

from hidrantes import calc, succao, npshd  # noqa: E402

rng = random.Random(20261018)
DNS = [25, 32, 40, 50, 65, 80, 100, 150]


def trecho(n_seg_max=3):
    segs = {}
    for _ in range(rng.randint(1, n_seg_max)):
        d = float(rng.choice(DNS))
        s = segs.setdefault(d, {"L": 0.0, "Leq": 0.0})
        s["L"] += round(rng.uniform(0.3, 60.0), 3)
        s["Leq"] += round(rng.uniform(0.0, 14.0), 3) if rng.random() < 0.8 else 0.0
    segmentos = []
    for d in sorted(segs):
        s = segs[d]
        segmentos.append({
            "d_mm": d, "L": s["L"], "Leq": s["Leq"], "Ltotal": s["L"] + s["Leq"],
            "n_tubos": rng.randint(1, 9), "ids": [rng.randint(1000, 999999) for _ in range(2)],
            "acessorios": [],
        })
    return {"segmentos": segmentos,
            "L": sum(s["L"] for s in segmentos),
            "Leq": sum(s["Leq"] for s in segmentos)}


casos = []
for i in range(40):
    metodo = rng.choice(calc.METODOS_CALCULO)
    cotas = {
        "z_rti": round(rng.uniform(-4.0, 6.0), 3),
        "z_succao": round(rng.uniform(-1.0, 3.0), 3),
        "z_recalque": round(rng.uniform(-1.0, 3.0), 3),
        "z_ponto_a": round(rng.uniform(2.0, 14.0), 3),
        "z_hd01": round(rng.uniform(0.0, 25.0), 3),
        "z_hd02": round(rng.uniform(0.0, 25.0), 3),
    }
    entrada = {
        "trechos": {k: trecho() for k in ("t1", "t2", "t3", "t4")},
        "Qs_lmin": float(rng.choice([100, 150, 200, 300, 600])),
        "Pmin": float(rng.choice([30, 40, 60, 65, 80])),
        "C": float(rng.choice([100, 120, 140, 150])),
        "cotas": cotas,
        "tolerancia_equilibrio_mca": rng.choice([0.5, 0.25, 0.05]),
        "metodo": metodo,
        "mang_dn_mm": float(rng.choice([25, 40, 65])),
        "mang_comp_m": float(rng.choice([15, 30])),
    }
    res = calc.calcular_rede(
        entrada["trechos"], entrada["Qs_lmin"], entrada["Pmin"], entrada["C"],
        cotas, entrada["tolerancia_equilibrio_mca"], metodo=metodo,
        mang_dn_mm=entrada["mang_dn_mm"], mang_comp_m=entrada["mang_comp_m"])
    casos.append({"nome": "rede-%02d" % i, "entrada": entrada, "saida": res})

# Equilíbrio que não converge: tolerância apertada e só 2 iterações (a trava
# max_iter_equilibrio existe exatamente para o caso patológico).
entrada = dict(casos[0]["entrada"])
entrada["tolerancia_equilibrio_mca"] = 1e-9
entrada["max_iter_equilibrio"] = 2
res = calc.calcular_rede(
    entrada["trechos"], entrada["Qs_lmin"], entrada["Pmin"], entrada["C"],
    entrada["cotas"], entrada["tolerancia_equilibrio_mca"], metodo=entrada["metodo"],
    mang_dn_mm=entrada["mang_dn_mm"], mang_comp_m=entrada["mang_comp_m"],
    max_iter_equilibrio=2)
assert not res["equilibrio"]["convergiu"], "o cenário deveria parar na trava de iterações"
casos.append({"nome": "rede-sem-convergencia", "entrada": entrada, "saida": res})

succoes = []
for cota_rti, cota_bomba, q, fator in [
    (3.0, 1.0, 600.0, 1.5), (1.0, 1.0, 600.0, 1.5), (1.0, 1.0009, 600.0, 1.5),
    (1.0, 1.0011, 600.0, 1.5), (-2.5, 1.2, 450.0, 1.5), (-0.4, 2.0, 300.0, 2.0),
]:
    v = succao.verificar_condicao_succao(cota_rti, cota_bomba, q, fator)
    succoes.append({"entrada": [cota_rti, cota_bomba, q, fator], "saida": v})

npshds = []
for alt, temp, hs, hf in [(0, 30, 2.7, 1.1), (500, 25, 3.4, 0.6), (1500, 40, 1.2, 2.2), (1000, 10, 0.4, 0.05)]:
    npshds.append({"entrada": [alt, temp, hs, hf], "saida": npshd.calcular_npshd(alt, temp, hs, hf)})

# Textos das falhas, vindos do plugin (funções puras do bridge, importadas
# com os módulos do Revit substituídos por stubs).
from unittest import mock  # noqa: E402
for nome in ("Autodesk", "Autodesk.Revit", "Autodesk.Revit.DB", "Autodesk.Revit.DB.Plumbing",
             "projeto", "hidrantes.rede", "hidrantes.params", "hidrantes.norm_profiles",
             "family_error_utils"):
    sys.modules[nome] = mock.MagicMock()
import hidrantes_dimensionar_bridge as ponte  # noqa: E402

textos = {
    "velocidade": ponte._resumo_falha_velocidade(
        'Ponto A → HD01', 5.0, [{"d_mm": 50.0, "V": 6.123456}, {"d_mm": 65.0, "V": 5.0004}]),
    "hidrante": ponte._resumo_falha_hidrante(
        "HD02", 28.4567, 291.234, "pressão na válvula", "Ponto A → HD02", 30.0, 300.0),
}

saida = {"casos": casos, "succoes": succoes, "npshds": npshds, "textos": textos}
destino = os.path.join(os.path.dirname(os.path.abspath(__file__)), "golden.json")
with open(destino, "w", encoding="utf-8") as f:
    json.dump(saida, f, ensure_ascii=False, separators=(",", ":"))
print("golden.json:", len(casos), "redes,", len(succoes), "sucções,", len(npshds), "NPSH")
