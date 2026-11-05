import os

# Reconstruido desde config.pyc (los valores originales eran 3/8001/base/5) para
# poder ajustar el limite de sesiones sin recompilar. El .pyc queda como respaldo.
MAX_SESIONES = int(os.environ.get("MONITOR_MAX_SESIONES", 3))
PUERTO = 8001
MODELO_WHISPER = os.environ.get("MONITOR_MODELO", "base")
CHUNK_SEGUNDOS = 5
DB_PATH = "db/testigos.sqlite"

# Procesos que transcriben en paralelo. Cada uno carga su propia copia del modelo
# (~300 MB con 'base'), asi que subirlo cuesta RAM: workers x 300 MB.
WORKERS = int(os.environ.get("MONITOR_WORKERS", max(1, (os.cpu_count() or 2) // 2)))
