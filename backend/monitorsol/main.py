# Reconstruido desde main.pyc (identico) + endpoint /monitor/config para exponer MAX_SESIONES.
# Python prefiere este .py sobre main.pyc; borrar este archivo restaura el original.
import os, time
# Las marcas de tiempo (datetime.now) salen en hora de Mexico aunque el servidor este en UTC.
os.environ["TZ"] = "America/Mexico_City"
if hasattr(time, "tzset"):
    time.tzset()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import MAX_SESIONES
from db.testigos_repo import init_db
from api.monitor_routes import router as monitor_router
from api.websocket import router as ws_router
from audio_testigos import router as audio_router  # tambien instala los hooks de audio


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("[main] Base de datos inicializada.")
    yield
    print("[main] Apagando servicio.")


app = FastAPI(title="MonitorSol", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(monitor_router, prefix="/monitor")
app.include_router(ws_router)
app.include_router(audio_router, prefix="/monitor")


@app.get("/health")
async def health():
    return {"status": "ok", "servicio": "monitorsol"}


@app.get("/monitor/config")
async def config():
    return {"max_sesiones": MAX_SESIONES}
