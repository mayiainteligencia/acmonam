# Cómo correr el proyecto

Son **3 procesos** independientes. Hay que tener los 3 corriendo a la vez.

| # | Servicio        | Carpeta              | Puerto | Tecnología        |
|---|-----------------|----------------------|--------|-------------------|
| 1 | Monitor (audio) | `backend/monitorsol` | 8001   | Python / FastAPI  |
| 2 | Backend API     | `backend`            | 3001   | Node / Express    |
| 3 | Frontend        | `frontend`           | 5173   | React / Vite      |

El front (Vite) hace proxy:
- `/api/monitor/*` → `localhost:8001/monitor/*` (servicio Python)
- `/api/chat/*` → `localhost:3001` (Node)
- `/ws/*` → `localhost:8001` (WebSocket, `ws: true` en el proxy)

Todo pasa por el puerto 5173, incluido el WebSocket. Eso permite exponer el
dashboard con un solo túnel (ver "Demos por internet"). `VITE_MONITOR_WS_URL`
sigue existiendo como override, pero ya no hace falta: sin ella el front usa
el mismo origen desde donde se abrió.

---

## 1. Monitor Python (monitorsol) — puerto 8001

```bash
cd backend/monitorsol
source venv/bin/activate
export SSL_CERT_FILE=/Library/Frameworks/Python.framework/Versions/3.12/etc/openssl/cert.pem
export REQUESTS_CA_BUNDLE=/Library/Frameworks/Python.framework/Versions/3.12/etc/openssl/cert.pem
export MONITOR_MAX_SESIONES=12
export MONITOR_WORKERS=6
uvicorn main:app --host 0.0.0.0 --port 8001
```

- **NO uses `--reload`**: el código está como `.pyc` sin fuente (sourceless) y el reloader falla al re-importar.
- Comandos en **líneas separadas**, no todo pegado en una sola línea.
- Verifica: http://localhost:8001/docs debe dar 200.
- Sin las dos variables `MONITOR_*` arranca con los valores viejos: **máximo 3
  emisoras** y la mitad de los cores.

### Variables de entorno

| Variable | Default | Para qué |
|----------|---------|----------|
| `MONITOR_MAX_SESIONES` | 3 | Emisoras simultáneas permitidas |
| `MONITOR_WORKERS` | mitad de los cores | Procesos que transcriben en paralelo. **Cada uno carga su propia copia del modelo (~300 MB)**, así que subirlo cuesta RAM |
| `MONITOR_MODELO` | `base` | Modelo de Whisper. `small` o `medium` transcriben mejor pero consumen mucho más |

En esta MacBook (8 cores, 8 GB) el punto cómodo es **4 emisoras**; con más de 6
la máquina se pone lenta para todo lo demás.

### ⚠️ Casi todo el source `.py` no existe (solo `.pyc`)
El código fuente del monitor nunca se subió a git; solo quedaron los `.pyc` compilados
(Python 3.12). La app fue reconstruida extrayéndolos del commit `44633bd4` como módulos
sourceless. Estructura actual:

```
backend/monitorsol/
├── main.pyc
├── config.py          ← reconstruido, gana sobre config.pyc
├── config.pyc
├── api/{monitor_routes,websocket}.pyc
├── core/transcriber.py   ← reconstruido, gana sobre transcriber.pyc
├── core/{keyword_detector,session_manager,stream_capture,transcriber}.pyc
├── db/{__init__,models,testigos_repo}.pyc + testigos.sqlite
└── venv/
```

**Dos módulos ya tienen fuente `.py`**, reconstruidos desde su bytecode. Python
prefiere el `.py` sobre el `.pyc`, así que esos dos son los que corren; los
`.pyc` quedaron como respaldo. Para volver al comportamiento original basta
**borrar los dos `.py`**.

Qué cambió en ellos:

- `config.py` — mismos valores de siempre, pero leyendo las variables de entorno
  de arriba en vez de tenerlas fijas.
- `core/transcriber.py` — las transcripciones corren en un **pool de procesos**,
  no en hilos. Antes varios hilos usaban el mismo modelo de PyTorch a la vez y
  eso corrompe memoria: con 3 emisoras el backend moría con `SIGSEGV`. Cada
  proceso tiene ahora su propia copia del modelo, y se recicla cada 200 chunks
  para que una fuga no crezca en días.

Si los `.pyc` se borran, recuperarlos así (desde la raíz del repo):

```bash
C=44633bd4
for f in $(git ls-tree -r --name-only $C -- backend/monitorsol | grep 'cpython-312.pyc'); do
  rel=${f#backend/monitorsol/}
  dest="backend/monitorsol/$(echo "$rel" | sed 's#__pycache__/##; s#\.cpython-312##')"
  mkdir -p "$(dirname "$dest")"
  git show "$C:$f" > "$dest"
done
git show "$C:backend/monitorsol/db/testigos.sqlite" > backend/monitorsol/db/testigos.sqlite
```

> Para **editar** el monitor necesitas el `.py` real (de otra máquina/backup). Con `.pyc` solo se ejecuta.

### Rutas que expone (bajo `/monitor`)
`POST /monitor/start` · `DELETE /monitor/stop/{sesion_id}` · `GET /monitor/sessions` · `GET /monitor/testigos` · `WS /ws/{sesion_id}` · `GET /health`

---

## 2. Backend Node (API) — puerto 3001

```bash
cd backend
cp .env.example .env     # solo la primera vez
# editar .env: GEMINI_API_KEY
npm install              # solo la primera vez
npm run dev              # o: npm start
```

`.env` requerido:
```
GEMINI_API_KEY=tu_api_key   # https://aistudio.google.com/app/apikey
PORT=3001
```

> **Ya no usa MySQL.** El Node quedó reducido a una sola ruta, `/api/chat/message`,
> que consume `AsistenteIAChat.tsx`. Se eliminaron `dbService.js`, `config/database.js`,
> las rutas de departamentos y mayia, y la dependencia `mysql2`.
>
> El resto del tablero **no necesita este proceso**: solo el chat del header lo usa.

---

## 3. Frontend — puerto 5173

```bash
cd frontend
npm install              # solo la primera vez
cp .env.example .env     # solo si el monitor no está en localhost:8001
npm run dev
```

Abre http://localhost:5173

El proxy está en `frontend/vite.config.ts`. Si reinicias el front, toma la config nueva.

Las emisoras del catálogo (`EMISORAS_PREDEFINIDAS` en `src/components/TestigosIA.tsx`)
apuntan al endpoint `livestream-redirect` de streamtheworld, que resuelve solo al
servidor vivo. No uses las URLs con número de host (`19313.live.streamtheworld...`):
esos números rotan y las URLs se mueren cada tanto.

> **Las keywords son sensibles a acentos.** `mexico` no detecta "México". Hay que
> escribirlas igual a como Whisper las transcribe, con acento.

---

## Demos por internet (túnel)

Como todo pasa por el 5173, se expone **un solo puerto**:

```bash
ngrok http localhost:5173
```

Y se comparte la URL `https://...ngrok-free.app`. La primera vez el visitante ve
una pantalla de aviso de ngrok y tiene que darle "Visit Site".

- **No reenvíes 3001 ni 8001.** El proxy de Vite ya los alcanza.
- `allowedHosts: true` en `vite.config.ts` es lo que permite que Vite acepte el
  dominio del túnel; sin eso responde "Blocked request".
- Mientras dure la demo la laptop tiene que estar prendida, sin dormirse y con
  los 3 procesos vivos.
- Para cerrar: `pkill -f ngrok`.

---

## Medir consumo

`medir_recursos.py` (en la raíz) muestrea CPU y RAM cada 5 segundos contra las
emisoras activas y lo guarda en `consumo.csv`:

```bash
python3 medir_recursos.py            # muestrea hasta Ctrl-C
python3 medir_recursos.py --resumen  # lee el CSV: promedios, tendencia y capacidad
```

Referencia medida en esta máquina: **1 core y ~350 MB por emisora**. La tendencia
del `--resumen` sirve para detectar fugas al dejarlo días corriendo — si la RAM
sube bloque a bloque, algo está creciendo.

---

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `GEMINI_API_KEY no está configurada` | Falta `.env` en `backend` | `cp .env.example .env` y llenar la key |
| `[vite] http proxy error /api/monitor/... ECONNREFUSED` | El monitor Python (:8001) no está corriendo | Levanta el proceso 1 |
| `[vite] http proxy error /api/chat ECONNREFUSED` | El Node (:3001) no está corriendo | Levanta el proceso 2 (solo afecta al chat del header) |
| El WebSocket no conecta | El proxy `/ws` no está en `vite.config.ts`, o Vite no se reinició | Revisa el bloque `'/ws'` con `ws: true` |
| `Blocked request. This host is not allowed` | Vite rechaza el dominio del túnel | `allowedHosts: true` en `vite.config.ts` |
| `Máximo 3 sesiones simultáneas permitidas` | Arrancaste uvicorn sin `MONITOR_MAX_SESIONES` | Exporta la variable y reinicia |
| `Error opening input file  https://...SC.` | La URL trae un espacio o un punto al final | El front ya lo limpia; si pasa, revisa la URL pegada |
| La Mac se arrastra con varias emisoras | Más emisoras que cores disponibles | Baja a 4 emisoras o `MONITOR_WORKERS` |
| RAM ocupada después de apagar el monitor | Los procesos de transcripción sobreviven al padre | `pkill -f spawn_main` antes de relanzar |
| `uvicorn: Could not import module main` | Faltan los `.pyc` o no activaste el venv | `source venv/bin/activate` y revisa la sección de recuperar `.pyc` |
| uvicorn falla al guardar/recargar | Usaste `--reload` con módulos sourceless | Corre sin `--reload` |
