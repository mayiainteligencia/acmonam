"""Exportación de testigos e historial en formato jerárquico AUDITSA (.xlsx) usando openpyxl.

Estructura:
- Agrupación Nivel 1: Rango Hora (ej. "Rango Hora: 06:00 - 07:00 (Total:3)")
- Agrupación Nivel 2: Fecha (ej. "Fecha: 20/10/2026 (Total:3)")
- Filas de detalle: 30 columnas idénticas al orden AUDITSA con hipervínculos a audio.
- Subtotales y gran total.
- Esquema colapsable nativo de Excel (outline_level=1 y outline_level=2).
"""
import io
import os
import re
import sqlite3
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Body, Query, Request
from fastapi.responses import StreamingResponse
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from config import DB_PATH
from pathlib import Path
from zoneinfo import ZoneInfo

BASE_DIR = Path(__file__).resolve().parent
DB_FILE = str(Path(DB_PATH) if Path(DB_PATH).is_absolute() else (BASE_DIR / DB_PATH))
TZ_MEXICO = ZoneInfo("America/Mexico_City")

router = APIRouter(prefix="/export", tags=["export"])


def _parse_datetime(ts_str: str) -> datetime:
    """Parsea el timestamp del testigo garantizando siempre la hora de México (UTC-6)."""
    if not ts_str:
        return datetime.now(TZ_MEXICO)
    clean_ts = str(ts_str).strip()
    try:
        if clean_ts.endswith("Z"):
            clean_ts = clean_ts[:-1] + "+00:00"
        dt = datetime.fromisoformat(clean_ts)
        if dt.tzinfo is not None:
            return dt.astimezone(TZ_MEXICO)
        return dt
    except Exception:
        try:
            return datetime.fromisoformat(clean_ts[:19])
        except Exception:
            return datetime.now()


def _extraer_siglas(emisora: str) -> str:
    """Extrae el identificador corto para la columna Canal (ej: 'Exa', 'La Mejor', 'Delfín')."""
    if not emisora:
        return "Radio"
    txt = emisora.strip()
    # Casos comunes
    if "delfin" in txt.lower():
        return "Radio Delfín"
    if "exa" in txt.lower():
        return "Exa"
    if "la mejor" in txt.lower():
        return "La Mejor"
    if "mvs" in txt.lower():
        return "MVS Noticias"
    if "disney" in txt.lower():
        return "Radio Disney"
    if "los 40" in txt.lower() or "los40" in txt.lower():
        return "Los 40"
    # Quitar frecuencias numéricas tipo "102.5 FM"
    limpio = re.sub(r"\b\d{2,3}(\.\d)?\s*(FM|AM)?\b", "", txt, flags=re.IGNORECASE).strip()
    return limpio or txt.split()[0]


def _obtener_datos_testigos(ids: Optional[List[int]] = None, keyword: Optional[str] = None):
    """Consulta testigos y pautas activas en modo de solo lectura."""
    conn = sqlite3.connect(f"file:{DB_FILE}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # Cargar pautas activas para cruce
    pautas = []
    try:
        pautas = c.execute("SELECT * FROM pautas WHERE activa = 1").fetchall()
    except Exception:
        pautas = []

    # Cargar testigos
    query = "SELECT id, sesion_id, emisora_nombre, keyword_detectada, transcripcion, timestamp FROM testigos"
    conds = []
    params = []

    if ids and len(ids) > 0:
        placeholders = ",".join("?" for _ in ids)
        conds.append(f"id IN ({placeholders})")
        params.extend(ids)
    elif keyword:
        conds.append("LOWER(keyword_detectada) LIKE ?")
        params.append(f"%{keyword.lower().strip()}%")

    if conds:
        query += " WHERE " + " AND ".join(conds)

    query += " ORDER BY timestamp ASC"
    testigos = c.execute(query, params).fetchall()
    conn.close()

    return testigos, pautas


def _cruzar_con_pauta(testigo, pautas):
    """Determina si un testigo cruza con una línea de pauta activa."""
    if not pautas:
        return {"grupo_comercial": "N/D", "spot_tipo": "N/D"}

    dt = _parse_datetime(testigo["timestamp"])
    hora_min = dt.strftime("%H:%M")
    kw = (testigo["keyword_detectada"] or "").strip().lower()
    est = (testigo["emisora_nombre"] or "").strip().lower()

    for p in pautas:
        # Cruce por horario
        h_ini = p["horario_inicio"]
        h_fin = p["horario_fin"]
        if not (h_ini <= hora_min < h_fin):
            continue

        # Cruce por estación (frecuencia o nombre)
        p_est = (p["estacion"] or "").strip().lower()
        fp = re.search(r"\d{2,3}\.\d", p_est)
        ft = re.search(r"\d{2,3}\.\d", est)
        misma_est = (fp and ft and fp.group() == ft.group()) or (p_est in est or est in p_est)
        if not misma_est:
            continue

        # Cruce por keyword
        p_kws = [k.strip().lower() for k in (p["keywords"] or "").split(",") if k.strip()]
        if not p_kws or kw in p_kws:
            return {
                "grupo_comercial": p["marca"] or "N/D",
                "spot_tipo": p["formato"] or "Spoteo",
            }

    return {"grupo_comercial": "N/D", "spot_tipo": "N/D"}


def generar_excel_auditsa(testigos, pautas, host_url: str = "") -> bytes:
    """Genera el libro Excel con jerarquía de 2 niveles y 30 columnas exactas."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Reporte de Testigos"

    # Habilitar los símbolos de esquema nativo (+/- en el margen)
    ws.views.sheetView[0].showOutlineSymbols = True

    # 30 Encabezados exactos según AUDITSA
    headers = [
        "Canal", "", "", "Estación/Canal", "Grupo Comercial", "Hora",
        "Seg Truncados", "Duración Hit", "Duración Prog", "Programa",
        "Inicio del Programa", "Fin del Programa", "Compañía", "Agencia",
        "Campaña", "Tarifa", "Marca (Keyword)", "Submarca", "Producto",
        "Versión", "Código ACAM", "Localidad", "Medio", "Sector",
        "Sub Sector", "Categoría", "Cobertura", "Testigo", "Spot tipo", "Grupo Comercial"
    ]

    # Estilos
    font_header = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    fill_header = PatternFill(start_color="1F2937", end_color="1F2937", fill_type="solid") # Dark Charcoal

    font_rango = Font(name="Calibri", size=10, bold=True, color="1E293B")
    fill_rango = PatternFill(start_color="E2E8F0", end_color="E2E8F0", fill_type="solid") # Slate 200

    font_fecha = Font(name="Calibri", size=9.5, bold=True, color="334155")
    fill_fecha = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid") # Slate 100

    font_detalle = Font(name="Calibri", size=9)
    font_link = Font(name="Calibri", size=9, color="0044CC", underline="single")
    font_total = Font(name="Calibri", size=9.5, bold=True, color="0F172A")

    thin_border_side = Side(border_style="thin", color="CBD5E1")
    border_cell = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    border_top_thick = Border(top=Side(border_style="medium", color="0F172A"), bottom=Side(border_style="double", color="0F172A"))

    align_center = Alignment(horizontal="center", vertical="center")
    align_left = Alignment(horizontal="left", vertical="center")

    # Escribir encabezados
    ws.append(headers)
    ws.row_dimensions[1].height = 24
    for col_idx in range(1, 31):
        cell = ws.cell(row=1, column=col_idx)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center

    # Organizar datos por Rango de Hora -> Fecha -> Lista de Testigos
    # Rango de hora: "06:00 - 07:00"
    agrupados = {}
    for t in testigos:
        dt = _parse_datetime(t["timestamp"])
        h = dt.hour
        rango = f"{h:02d}:00 - {h+1:02d}:00"
        fecha_str = dt.strftime("%d/%m/%Y")

        if rango not in agrupados:
            agrupados[rango] = {}
        if fecha_str not in agrupados[rango]:
            agrupados[rango][fecha_str] = []

        agrupados[rango][fecha_str].append((dt, t))

    current_row = 2
    gran_total = 0

    # Iterar rangos ordenados
    for rango in sorted(agrupados.keys()):
        fechas_dict = agrupados[rango]
        total_rango = sum(len(items) for items in fechas_dict.values())
        gran_total += total_rango

        rango_header_row = current_row

        # Fila Nivel 1: Rango Hora (Columna A)
        ws.cell(row=current_row, column=1, value=f"Rango Hora: {rango}  (Total:{total_rango})")
        for c in range(1, 31):
            cell = ws.cell(row=current_row, column=c)
            cell.font = font_rango
            cell.fill = fill_rango
        ws.row_dimensions[current_row].height = 20
        ws.row_dimensions[current_row].outline_level = 0
        current_row += 1

        # Iterar fechas
        for fecha_str in sorted(fechas_dict.keys()):
            items = fechas_dict[fecha_str]
            total_fecha = len(items)

            # Fila Nivel 2: Fecha (Columna B)
            ws.cell(row=current_row, column=2, value=f"Fecha: {fecha_str}  (Total:{total_fecha})")
            for c in range(1, 31):
                cell = ws.cell(row=current_row, column=c)
                cell.font = font_fecha
                cell.fill = fill_fecha
            ws.row_dimensions[current_row].height = 19
            ws.row_dimensions[current_row].outline_level = 1
            current_row += 1

            # Filas de detalle
            for dt, t in sorted(items, key=lambda x: x[0]):
                pauta_info = _cruzar_con_pauta(t, pautas)
                emisora_nombre = t["emisora_nombre"] or "Radio Emisora"
                siglas = _extraer_siglas(emisora_nombre)
                hora_str = dt.strftime("%H:%M:%S")

                # URL absoluta o relativa al endpoint de audio
                testigo_id = t["id"]
                audio_url = f"{host_url.rstrip('/')}/monitor/testigos/{testigo_id}/audio" if host_url else f"/monitor/testigos/{testigo_id}/audio"

                fila_detalle = [
                    "",  # Col 1 Canal (vía para agrupador)
                    "",  # Col 2 (vía para fecha)
                    siglas,  # Col 3 Canal Siglas
                    emisora_nombre,  # Col 4 Estación/Canal
                    pauta_info["grupo_comercial"],  # Col 5 Grupo Comercial
                    hora_str,  # Col 6 Hora
                    0,  # Col 7 Seg Truncados
                    "N/D",  # Col 8 Duración Hit
                    "N/D",  # Col 9 Duración Prog
                    "N/D",  # Col 10 Programa
                    "00:00:00",  # Col 11 Inicio del Programa
                    "00:00:00",  # Col 12 Fin del Programa
                    "N/D",  # Col 13 Compañía
                    "N/D",  # Col 14 Agencia
                    "N/D",  # Col 15 Campaña
                    "N/D",  # Col 16 Tarifa
                    t["keyword_detectada"] or "N/D",  # Col 17 Marca (Keyword)
                    "N/D",  # Col 18 Submarca
                    "N/D",  # Col 19 Producto
                    t["transcripcion"] or "",  # Col 20 Versión
                    "N/D",  # Col 21 Código ACAM
                    "CDMX",  # Col 22 Localidad
                    "Radio",  # Col 23 Medio
                    "N/D",  # Col 24 Sector
                    "N/D",  # Col 25 Sub Sector
                    "N/D",  # Col 26 Categoría
                    "Local",  # Col 27 Cobertura
                    f'=HYPERLINK("{audio_url}", "Escuchar Audio")',  # Col 28 Testigo
                    pauta_info["spot_tipo"],  # Col 29 Spot tipo
                    pauta_info["grupo_comercial"],  # Col 30 Grupo Comercial
                ]

                ws.append(fila_detalle)
                row_idx = current_row
                ws.row_dimensions[row_idx].height = 18
                ws.row_dimensions[row_idx].outline_level = 2

                for col_idx in range(1, 31):
                    cell = ws.cell(row=row_idx, column=col_idx)
                    cell.border = border_cell
                    if col_idx == 28:
                        cell.font = font_link
                        cell.alignment = align_center
                    elif col_idx in (3, 5, 6, 7, 21, 22, 23, 27, 29, 30):
                        cell.font = font_detalle
                        cell.alignment = align_center
                    else:
                        cell.font = font_detalle
                        cell.alignment = align_left

                current_row += 1

            # Fila de subtotal por fecha
            ws.cell(row=current_row, column=13, value=f"Total:{total_fecha}")
            cell_sub = ws.cell(row=current_row, column=13)
            cell_sub.font = font_total
            cell_sub.alignment = align_center
            ws.row_dimensions[current_row].height = 18
            ws.row_dimensions[current_row].outline_level = 1
            current_row += 1

    # Gran Total al final
    ws.cell(row=current_row, column=13, value=f"Total:{gran_total}")
    for c in range(1, 31):
        cell = ws.cell(row=current_row, column=c)
        cell.border = border_top_thick
        cell.font = font_total
    ws.cell(row=current_row, column=13).alignment = align_center
    ws.row_dimensions[current_row].height = 22

    # Ajuste automático del ancho de columnas
    anchos_minimos = {
        1: 28,  # Canal / Rango Hora
        2: 24,  # Fecha
        3: 16,  # Siglas
        4: 32,  # Estación/Canal
        5: 18,  # Grupo Comercial
        6: 12,  # Hora
        7: 14,  # Seg Truncados
        17: 20, # Marca (Keyword)
        20: 55, # Versión (Transcripción)
        22: 12, # Localidad
        23: 10, # Medio
        27: 12, # Cobertura
        28: 18, # Testigo link
        29: 14, # Spot tipo
        30: 18, # Grupo Comercial 2
    }

    for col_idx in range(1, 31):
        col_letter = get_column_letter(col_idx)
        ancho = anchos_minimos.get(col_idx, 14)
        ws.column_dimensions[col_letter].width = ancho

    # Guardar en memoria
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output.getvalue()


@router.get("/auditsa.xlsx")
def exportar_auditsa_get(
    request: Request,
    keyword: Optional[str] = Query(None, description="Filtrar por keyword"),
):
    """Endpoint GET para descargar el reporte XLSX completo de testigos en formato AUDITSA."""
    testigos, pautas = _obtener_datos_testigos(keyword=keyword)
    base_url = str(request.base_url).rstrip("/")
    # Si viene detrás de un proxy o Vite, podemos usar el host solicitado
    host_header = request.headers.get("host") or ""
    if host_header:
        proto = request.headers.get("x-forwarded-proto") or request.url.scheme or "http"
        base_url = f"{proto}://{host_header}"

    excel_bytes = generar_excel_auditsa(testigos, pautas, host_url=base_url)
    nombre_archivo = f"reporte_monitoreo_mayia_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{nombre_archivo}"'},
    )


@router.post("/auditsa.xlsx")
def exportar_auditsa_post(
    request: Request,
    body: dict = Body(default={}),
):
    """Endpoint POST para descargar testigos específicos (por lista de IDs)."""
    ids = body.get("ids")
    keyword = body.get("keyword")
    testigos, pautas = _obtener_datos_testigos(ids=ids, keyword=keyword)

    # Los links de audio del Excel deben apuntar a donde el usuario abre la app (VPN/IP de la VM),
    # no a localhost:8001 (el proxy de Vite reescribe Host). Prioridad: env > base_url del navegador > Host.
    base_url = os.environ.get("MONITOR_PUBLIC_URL") or ""
    cliente = str(body.get("base_url") or "")
    if not base_url and cliente.startswith(("http://", "https://")):
        base_url = cliente
    if not base_url:
        base_url = str(request.base_url).rstrip("/")
        host_header = request.headers.get("host") or ""
        if host_header:
            proto = request.headers.get("x-forwarded-proto") or request.url.scheme or "http"
            base_url = f"{proto}://{host_header}"

    excel_bytes = generar_excel_auditsa(testigos, pautas, host_url=base_url)
    nombre_archivo = f"reporte_monitoreo_mayia_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{nombre_archivo}"'},
    )
