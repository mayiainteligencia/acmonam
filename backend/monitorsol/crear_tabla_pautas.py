"""Migracion aislada: crea la tabla `pautas` en db/testigos.sqlite. No toca `testigos`.

Uso (desde backend/monitorsol):  venv/bin/python crear_tabla_pautas.py
Es idempotente. pauta.py tambien la ejecuta al importarse.
"""
import sqlite3

DB_PATH = "db/testigos.sqlite"

DDL = """
CREATE TABLE IF NOT EXISTS pautas (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    lote_id        TEXT NOT NULL,            -- una subida de Excel = un lote
    marca          TEXT NOT NULL,            -- marca / cliente de la pauta
    keywords       TEXT NOT NULL DEFAULT '', -- keywords de la marca, separadas por coma ('' = cualquiera)
    estacion       TEXT NOT NULL,
    horario_inicio TEXT NOT NULL,            -- 'HH:MM'
    horario_fin    TEXT NOT NULL,            -- 'HH:MM'
    dias           TEXT NOT NULL,            -- 'L-V', etc.
    programa       TEXT,
    formato        TEXT NOT NULL,            -- 'Spoteo' | 'Mención'
    semana         TEXT NOT NULL,            -- fecha de inicio de la semana, 'YYYY-MM-DD'
    requerido      INTEGER NOT NULL,
    activa         INTEGER NOT NULL DEFAULT 0, -- 0 = solo preview, 1 = confirmada
    creado_en      DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pautas_lote ON pautas(lote_id);
"""


def crear(db_path: str = DB_PATH) -> None:
    with sqlite3.connect(db_path) as c:
        c.executescript(DDL)


if __name__ == "__main__":
    crear()
    print("Tabla 'pautas' lista en", DB_PATH)
