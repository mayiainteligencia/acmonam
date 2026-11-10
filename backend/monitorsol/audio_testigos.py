"""Clips de audio por testigo: [PRE_CHUNKS previos] + [chunk detectado] + [POST_CHUNKS posteriores].

Se engancha por monkeypatch a core.session_manager (compilado, sin fuente) envolviendo
capturar_chunk y guardar_testigo. No toca la deteccion ni Whisper; si algo falla aqui,
se imprime y el pipeline sigue igual. Pon AUDIO_TESTIGOS = False para desactivarlo.
"""
import io
import re
import wave
from collections import deque
from pathlib import Path

import aiosqlite
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse, Response

import core.session_manager as sm
from config import DB_PATH

AUDIO_TESTIGOS = True
PRE_CHUNKS = 2   # chunks (5 s c/u) antes del que detecto
POST_CHUNKS = 2  # chunks despues
AUDIO_DIR = Path(DB_PATH).parent / "audio"

router = APIRouter()
_buffers: dict = {}    # sesion_id -> deque de bytes WAV (los ultimos PRE_CHUNKS+1 chunks)
_pendientes: dict = {}  # sesion_id -> lista de clips esperando chunks posteriores
_ultimo_ts: dict = {}   # sesion_id -> timestamp ya atendido (guardar_testigo llama 1 vez por keyword)


def _seguro(texto: str) -> str:
    return re.sub(r"[^0-9A-Za-z]+", "-", texto)


def _ruta(sesion_id: str, timestamp: str) -> Path:
    return AUDIO_DIR / f"{_seguro(sesion_id)}_{_seguro(timestamp)}.wav"


def _armar_clip(chunks: list, destino: Path):
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    tmp = destino.with_suffix(".part")
    with wave.open(str(tmp), "wb") as out:
        for i, data in enumerate(chunks):
            with wave.open(io.BytesIO(data)) as w:
                if i == 0:
                    out.setparams(w.getparams())
                out.writeframes(w.readframes(w.getnframes()))
    tmp.rename(destino)  # el endpoint nunca ve un archivo a medias


def _nuevo_chunk(sesion_id: str, path: str):
    for s in [s for s in _buffers if s not in sm.sesiones_activas]:  # sesiones detenidas
        _buffers.pop(s, None); _pendientes.pop(s, None); _ultimo_ts.pop(s, None)
    data = Path(path).read_bytes()
    pend = _pendientes.get(sesion_id, [])
    for clip in pend:
        clip["chunks"].append(data)
        clip["faltan"] -= 1
    for clip in [c for c in pend if c["faltan"] <= 0]:
        _armar_clip(clip["chunks"], clip["destino"])
        pend.remove(clip)
    _buffers.setdefault(sesion_id, deque(maxlen=PRE_CHUNKS + 1)).append(data)


def _detectado(sesion_id: str, timestamp: str):
    if _ultimo_ts.get(sesion_id) == timestamp or not _buffers.get(sesion_id):
        return
    _ultimo_ts[sesion_id] = timestamp
    clip = {"chunks": list(_buffers[sesion_id]), "faltan": POST_CHUNKS, "destino": _ruta(sesion_id, timestamp)}
    if clip["faltan"] <= 0:
        _armar_clip(clip["chunks"], clip["destino"])
    else:
        _pendientes.setdefault(sesion_id, []).append(clip)


def _instalar():
    capturar_orig, guardar_orig = sm.capturar_chunk, sm.guardar_testigo

    async def capturar(url, sesion_id, chunk_index):
        path = await capturar_orig(url, sesion_id, chunk_index)
        if path:
            try:
                _nuevo_chunk(sesion_id, path)
            except Exception as e:
                print(f"[audio_testigos] chunk: {e}")
        return path

    async def guardar(*args, **kw):
        res = await guardar_orig(*args, **kw)
        try:
            _detectado(kw["sesion_id"], kw["timestamp"])
        except Exception as e:
            print(f"[audio_testigos] deteccion: {e}")
        return res

    sm.capturar_chunk, sm.guardar_testigo = capturar, guardar


if AUDIO_TESTIGOS:
    _instalar()


@router.api_route("/audio/{sesion_id}/{timestamp}", methods=["GET", "HEAD"])
async def audio_por_timestamp(sesion_id: str, timestamp: str, request: Request):
    ruta = _ruta(sesion_id, timestamp)
    if not ruta.exists():
        raise HTTPException(status_code=404, detail="Audio no disponible")
    # ponytail: Range a mano (starlette 0.37 no lo soporta); Safari/iOS exigen 206. Clips ~1 MB.
    m = re.fullmatch(r"bytes=(\d*)-(\d*)", request.headers.get("range", ""))
    if request.method == "GET" and m and (m[1] or m[2]):
        data = ruta.read_bytes()
        n = len(data)
        ini, fin = (int(m[1]), min(int(m[2] or n - 1), n - 1)) if m[1] else (max(n - int(m[2]), 0), n - 1)
        if ini > fin:
            return Response(status_code=416, headers={"Content-Range": f"bytes */{n}"})
        return Response(data[ini:fin + 1], 206, media_type="audio/wav", headers={
            "Content-Range": f"bytes {ini}-{fin}/{n}", "Accept-Ranges": "bytes"})
    return FileResponse(ruta, media_type="audio/wav", headers={"Accept-Ranges": "bytes"})


@router.api_route("/testigos/{testigo_id}/audio", methods=["GET", "HEAD"])
async def audio_por_id(testigo_id: int, request: Request):
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute("SELECT sesion_id, timestamp FROM testigos WHERE id = ?", (testigo_id,))
        fila = await cur.fetchone()
    if not fila:
        raise HTTPException(status_code=404, detail="Testigo no encontrado")
    return await audio_por_timestamp(fila[0], fila[1], request)
