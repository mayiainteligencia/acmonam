"""Precomputa agregados electorales -> frontend/src/data/electoral.json
Fuente: datos/COMPILADO.json (resultados municipales Oaxaca) + COMITE_representantes.json.
Ganador se calcula (col PARTIDO viene vacia): partido con mas votos por municipio.
Solo se emiten los anios completos (1998, 2010). Los vacios se conservan como null.
"""
import json, collections, os

BASE = os.path.dirname(__file__)
comp = json.load(open(os.path.join(BASE, "datos/COMPILADO.json")))
reps = json.load(open(os.path.join(BASE, "datos/COMITE_representantes.json")))

PARTIDOS = ["PAN", "PRD", "CONVER", "PT", "PRI", "PVEM", "PARMEO", "PUP", "PNA"]
ANIOS = [1998, 2010]

def es_agregado(nombre):
    n = (nombre or "").strip().upper()
    return n.startswith("TOTAL") or n.startswith("SUBTOTAL")

def votos(r, p):
    v = r.get(p)
    return v if isinstance(v, (int, float)) else 0

def ganador(r):
    pares = [(p, votos(r, p)) for p in PARTIDOS]
    pares.sort(key=lambda x: x[1], reverse=True)
    if pares[0][1] <= 0:
        return None
    return pares[0][0]

out = {"anios": ANIOS, "porAnio": {}}

for anio in ANIOS:
    # "municipios" = filas del Excel (incluye TOTAL/SUBTOTAL); asi el cliente ve los
    # mismos totales que en su hoja (1,755,693 votos PRI / 41.4% en 2010).
    filas = [r for r in comp if r.get("AÑO ELECCIÓN") == anio and r.get("PRI") is not None]
    # solo municipios reales (sin agregados) para oportunidades/riesgo
    munis = [r for r in filas if not es_agregado(r.get("Municipio"))]

    ganados = collections.Counter()
    for r in filas:
        g = ganador(r)
        if g:
            ganados[g] += 1

    votos_partido = {p: sum(votos(r, p) for r in filas) for p in PARTIDOS}
    votos_partido = {p: v for p, v in votos_partido.items() if v > 0}
    total_votos = sum(votos_partido.values())

    # abstencion promedio (solo munis reales con dato)
    absts = [r["% Abst."] for r in munis if isinstance(r.get("% Abst."), (int, float))]
    abst_prom = round(sum(absts) / len(absts), 1) if absts else None

    lista_nom = sum(r["Lista Nominal"] for r in munis if isinstance(r.get("Lista Nominal"), (int, float)))
    casillas = sum(r["TOTAL DE CASILLAS"] for r in munis if isinstance(r.get("TOTAL DE CASILLAS"), (int, float)))

    # top por votos PRI (incluye filas TOTAL/SUBTOTAL, como el cliente lo ve en el Excel)
    top = sorted(filas, key=lambda r: votos(r, "PRI"), reverse=True)[:8]
    top_pri = [{"municipio": r.get("Municipio"), "votosPRI": int(votos(r, "PRI")), "ganador": ganador(r) or "PRI"} for r in top]

    # municipios recuperables: PRI perdio por poco margen
    recuperables = []
    for r in munis:
        g = ganador(r)
        if g and g != "PRI":
            pri = votos(r, "PRI"); win = votos(r, g)
            margen = win - pri
            if 1 <= margen <= 6 and pri > 0:
                recuperables.append({"municipio": r.get("Municipio"), "gano": g, "votosPRI": int(pri), "margen": int(margen)})
    recuperables.sort(key=lambda x: x["margen"])

    # riesgo abstencion: top abstencion
    riesgo = sorted(
        [r for r in munis if isinstance(r.get("% Abst."), (int, float))],
        key=lambda r: r["% Abst."], reverse=True
    )[:8]
    riesgo_abst = [{"municipio": r.get("Municipio"), "abst": round(r["% Abst."], 1)} for r in riesgo]

    total_munis = len(filas)
    pri_win = ganados.get("PRI", 0)
    orden = ganados.most_common()
    segunda = next((p for p, _ in orden if p != "PRI"), None)

    out["porAnio"][anio] = {
        "totalMunicipios": total_munis,
        "ganadosPRI": pri_win,
        "sharePRI": round(votos_partido.get("PRI", 0) / total_votos * 100, 1) if total_votos else 0,
        "votosPRI": int(votos_partido.get("PRI", 0)),
        "totalVotos": int(total_votos),
        "abstProm": abst_prom,
        "listaNominal": int(lista_nom),
        "casillas": int(casillas),
        "segundaFuerza": segunda,
        "ganadosSegunda": ganados.get(segunda, 0) if segunda else 0,
        "ganados": dict(ganados),
        "votosPorPartido": {p: int(v) for p, v in sorted(votos_partido.items(), key=lambda x: x[1], reverse=True)},
        "topPRI": top_pri,
        "recuperables": recuperables[:10],
        "riesgoAbst": riesgo_abst,
    }

# representantes / presupuesto
total_reps = sum(
    (r.get("rep_casilla") or 0) + (r.get("rep_generales") or 0) for r in reps
)
presupuesto = sum(
    (r.get("importe_casilla") or 0) + (r.get("importe_generales") or 0) for r in reps
)
out["representantes"] = {"municipios": len(reps), "total": round(total_reps), "presupuesto": round(presupuesto)}

dest = os.path.join(BASE, "../../frontend/src/data/electoral.json")
json.dump(out, open(dest, "w"), ensure_ascii=False, indent=1)

# verificacion minima (ponytail: unica check que corre)
d10 = out["porAnio"][2010]
assert d10["totalMunicipios"] == 597, d10["totalMunicipios"]
assert d10["votosPRI"] == 1755693, d10["votosPRI"]
assert d10["sharePRI"] == 41.4, d10["sharePRI"]
print("OK ->", dest)
print("2010:", d10["ganadosPRI"], "de", d10["totalMunicipios"], "| share", d10["sharePRI"], "| 2a", d10["segundaFuerza"], d10["ganadosSegunda"])
print("1998:", out["porAnio"][1998]["ganadosPRI"], "de", out["porAnio"][1998]["totalMunicipios"])
print("reps:", out["representantes"])
