"""Analisis de Pauta: carga de Excel + cruce contra `testigos`.

Aislado del pipeline de captura. `testigos` solo se LEE (conexion mode=ro); lo unico
que se escribe es la tabla `pautas`.
"""
import io
import re
import sqlite3
import time
import unicodedata
import uuid
from datetime import date, datetime, timedelta

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from config import DB_PATH
from crear_tabla_pautas import crear

router = APIRouter(prefix="/pauta")
crear(DB_PATH)

MESES = {m: i + 1 for i, m in enumerate(
    "enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre".split())}
DIAS = ["l", "ma", "mi", "j", "v", "s", "d"]  # lunes=0
MAX_BYTES = 5 * 1024 * 1024


def _norm(s) -> str:
    s = unicodedata.normalize("NFD", str(s or "")).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", s).strip().lower()


def _dias_set(txt: str) -> set:
    """'L-V' -> {0..4}; 'L,M,V' -> {0,1,4}. 'M' suelto = martes, 'Mi' = miercoles."""
    t = _norm(txt).replace(" ", "")
    idx = lambda x: DIAS.index(x) if x in DIAS else {"m": 1, "x": 2}.get(x)
    if "-" in t:
        a, b = (idx(p) for p in t.split("-", 1))
        if a is None or b is None:
            return set(range(7))
        return set(range(a, b + 1)) if a <= b else set(range(a, 7)) | set(range(0, b + 1))
    s = {idx(p) for p in t.split(",") if idx(p) is not None}
    return s or set(range(7))


# ---------------------------------------------------------------- parser

def parsear_excel(contenido: bytes) -> list[dict]:
    import openpyxl
    try:
        wb = openpyxl.load_workbook(io.BytesIO(contenido), read_only=True, data_only=True)
    except Exception:
        raise HTTPException(400, "No se pudo leer el archivo: ¿es un .xlsx válido?")
    ws = wb["Radio"] if "Radio" in wb.sheetnames else wb.worksheets[0]
    rows = [list(r) for r in ws.iter_rows(values_only=True)]
    filas: list[dict] = []
    hdrs = [i for i, r in enumerate(rows) if any(_norm(c) == "horario" for c in r) and any(_norm(c) == "radio" for c in r)]
    if not hdrs:
        raise HTTPException(400, "No encontré la fila de encabezados (Radio / Horario / Programa…) en la hoja.")
    for h in hdrs:
        hdr, fechas = rows[h], rows[h + 1] if h + 1 < len(rows) else []
        col = {_norm(c): j for j, c in enumerate(hdr) if c is not None}
        try:
            c_radio, c_hor, c_prog, c_dias, c_fmt = col["radio"], col["horario"], col["programa"], col["dias trans"], col["formato"]
        except KeyError as e:
            raise HTTPException(400, f"Falta la columna {e} en los encabezados.")
        c_inv = next((j for k, j in col.items() if k.startswith("inversion")), c_fmt)
        anio = next((int(m.group(1)) for c in hdr if c and (m := re.search(r"(20\d\d)", str(c)))), date.today().year)
        # mes de cada columna = ultimo encabezado de mes a su izquierda (celdas combinadas)
        mes_col, mes = {}, None
        for j in range(c_inv + 1, len(hdr)):
            if hdr[j] is not None and _norm(hdr[j]) in MESES:
                mes = MESES[_norm(hdr[j])]
            mes_col[j] = mes
        semanas = {}
        for j in range(c_inv + 1, len(fechas)):
            v = fechas[j]
            if isinstance(v, (int, float)) and mes_col.get(j):
                try:
                    semanas[j] = date(anio, mes_col[j], int(v))
                except ValueError:
                    pass
        for r in rows[h + 2:]:
            r = r + [None] * (len(hdr) - len(r))
            if _norm(r[c_prog]) == "total" or not r[c_radio]:
                if filas and (_norm(r[c_prog]) == "total" or any(_norm(c) == "radio" for c in r)):
                    break
                continue
            m = re.match(r"\s*(\d{1,2}):(\d\d)\s*[-–]\s*(\d{1,2}):(\d\d)", str(r[c_hor] or ""))
            if not m:
                continue
            ini, fin = f"{int(m[1]):02d}:{m[2]}", f"{int(m[3]):02d}:{m[4]}"
            for j, sem in semanas.items():
                n = r[j] if j < len(r) else None
                if isinstance(n, (int, float)) and n > 0:
                    filas.append(dict(
                        estacion=str(r[c_radio]).strip(), horario_inicio=ini, horario_fin=fin,
                        dias=str(r[c_dias] or "L-D").strip(), programa=str(r[c_prog] or "").strip(),
                        formato=str(r[c_fmt] or "").strip(), semana=sem.isoformat(), requerido=int(n)))
    if not filas:
        raise HTTPException(400, "El archivo no contiene líneas de pauta con requerimientos (>0).")
    return filas


# ---------------------------------------------------------------- db

def _db():
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    return c


def _db_ro():
    # testigos: solo lectura garantizada por SQLite
    c = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    c.row_factory = sqlite3.Row
    return c


def _resumen_lote(c, lote_id: str) -> dict:
    r = c.execute("""SELECT lote_id, marca, keywords, activa, creado_en, COUNT(*) filas, SUM(requerido) total_requerido,
                     MIN(semana) desde, MAX(semana) hasta FROM pautas WHERE lote_id=? GROUP BY lote_id""", (lote_id,)).fetchone()
    if not r:
        raise HTTPException(404, "Lote no encontrado")
    lineas: dict = {}
    for p in c.execute("SELECT * FROM pautas WHERE lote_id=? ORDER BY id", (lote_id,)):
        k = (p["estacion"], p["horario_inicio"], p["horario_fin"], p["formato"])
        l = lineas.setdefault(k, dict(estacion=p["estacion"], horario_inicio=p["horario_inicio"], horario_fin=p["horario_fin"],
                                      dias=p["dias"], programa=p["programa"], formato=p["formato"], semanas=[]))
        l["semanas"].append(dict(semana=p["semana"], requerido=p["requerido"]))
    out = dict(r)
    out["estaciones"] = sorted({k[0] for k in lineas})
    out["lineas"] = list(lineas.values())
    return out


# ---------------------------------------------------------------- endpoints

@router.post("/upload")
async def upload(file: UploadFile = File(...), marca: str = Form(...), keywords: str = Form("")):
    marca = marca.strip()
    if not marca:
        raise HTTPException(400, "Indica la marca / cliente de la pauta.")
    if not (file.filename or "").lower().endswith(".xlsx"):
        raise HTTPException(400, "Solo se acepta .xlsx")
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Archivo mayor a 5 MB")
    filas = parsear_excel(data)
    kws = ",".join(k.strip().lower() for k in keywords.split(",") if k.strip())
    lote = uuid.uuid4().hex[:12]
    with _db() as c:
        c.executemany(
            """INSERT INTO pautas (lote_id, marca, keywords, estacion, horario_inicio, horario_fin, dias, programa, formato, semana, requerido, activa)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,0)""",
            [(lote, marca, kws, f["estacion"], f["horario_inicio"], f["horario_fin"], f["dias"], f["programa"], f["formato"], f["semana"], f["requerido"]) for f in filas])
        return _resumen_lote(c, lote)


@router.get("/lotes")
def lotes():
    with _db() as c:
        return [_resumen_lote(c, r["lote_id"]) | {"lineas": None} for r in
                c.execute("SELECT lote_id FROM pautas GROUP BY lote_id ORDER BY MIN(id) DESC")]


@router.get("/lote/{lote_id}")
def ver_lote(lote_id: str):
    with _db() as c:
        return _resumen_lote(c, lote_id)


@router.post("/{lote_id}/activar")
def activar(lote_id: str):
    with _db() as c:
        if c.execute("UPDATE pautas SET activa=1 WHERE lote_id=?", (lote_id,)).rowcount == 0:
            raise HTTPException(404, "Lote no encontrado")
    return {"ok": True}


@router.delete("/{lote_id}")
def borrar(lote_id: str):
    with _db() as c:
        c.execute("DELETE FROM pautas WHERE lote_id=?", (lote_id,))
    return {"ok": True}


def _misma_estacion(pauta: str, testigo: str) -> bool:
    fp, ft = re.search(r"\d{2,3}\.\d", pauta), re.search(r"\d{2,3}\.\d", testigo or "")
    if fp and ft:
        return fp.group() == ft.group()
    a, b = _norm(pauta), _norm(testigo)
    return bool(a and b and (a in b or b in a))


@router.get("/cumplimiento")
def cumplimiento(lote_id: str | None = None, semana: str | None = None):
    """Por linea de pauta: requerido vs detectado en testigos (solo lectura)."""
    # Los timestamps de testigos son hora local del servidor (main.py fija TZ=Mexico).
    # Si el reloj no es -06:00 (tzdata ausente, main.pyc original...) el cruce saldria desfasado.
    if datetime.now().astimezone().utcoffset() != timedelta(hours=-6):
        raise HTTPException(500, f"Zona horaria del servidor incorrecta (tzname={time.tzname}, "
                                 "se esperaba America/Mexico_City, UTC-6). Instala tzdata y arranca con main.py; "
                                 "el cruce con la pauta saldría desfasado.")
    q, args = "SELECT * FROM pautas WHERE activa=1", []
    if lote_id:
        q += " AND lote_id=?"; args.append(lote_id)
    if semana:
        q += " AND semana=?"; args.append(semana)
    with _db() as c:
        pautas = c.execute(q + " ORDER BY semana, estacion, horario_inicio", args).fetchall()
    if not pautas:
        return {"lineas": [], "resumen": dict(cumplido=0, parcial=0, incumplido=0, sin_datos=0), "semanas": []}

    ini = min(p["semana"] for p in pautas)
    fin = (date.fromisoformat(max(p["semana"] for p in pautas)) + timedelta(days=7)).isoformat()
    with _db_ro() as c:
        tests = c.execute("SELECT id, sesion_id, emisora_nombre, keyword_detectada, transcripcion, timestamp FROM testigos WHERE timestamp >= ? AND timestamp < ?",
                          (ini, fin)).fetchall()
    tests = [(t["emisora_nombre"], (t["keyword_detectada"] or "").strip().lower(), datetime.fromisoformat(t["timestamp"][:19]), t) for t in tests]

    hoy, lineas = datetime.now(), []
    for p in pautas:
        d0 = datetime.fromisoformat(p["semana"])
        d1 = d0 + timedelta(days=7)
        dias = _dias_set(p["dias"])
        kws = {k for k in p["keywords"].split(",") if k}
        en_semana = [t for t in tests if d0 <= t[2] < d1 and _misma_estacion(p["estacion"], t[0])]
        hits = [t for n, k, ts, t in en_semana
                if ts.weekday() in dias and p["horario_inicio"] <= ts.strftime("%H:%M") < p["horario_fin"] and (not kws or k in kws)]
        det = len(hits)
        if det >= p["requerido"]:
            est = "cumplido"
        elif det > 0:
            est = "parcial"
        elif d1 <= hoy and en_semana:
            est = "incumplido"
        else:
            est = "sin_datos"  # semana sin terminar o la estacion no se monitoreó
        lineas.append(dict(id=p["id"], lote_id=p["lote_id"], marca=p["marca"], estacion=p["estacion"],
                           horario_inicio=p["horario_inicio"], horario_fin=p["horario_fin"], dias=p["dias"],
                           programa=p["programa"], formato=p["formato"], semana=p["semana"],
                           requerido=p["requerido"], detectado=det, estado=est,
                           detecciones=[dict(id=t["id"], sesion_id=t["sesion_id"], emisora_nombre=t["emisora_nombre"],
                                             keyword_detectada=t["keyword_detectada"], transcripcion=t["transcripcion"],
                                             timestamp=t["timestamp"]) for t in hits]))
    resumen = {e: sum(1 for l in lineas if l["estado"] == e) for e in ("cumplido", "parcial", "incumplido", "sin_datos")}
    with _db() as c:
        todas = [r[0] for r in c.execute("SELECT DISTINCT semana FROM pautas WHERE activa=1 ORDER BY semana")]
    return {"lineas": lineas, "resumen": resumen, "semanas": todas}
