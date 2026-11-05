# 🧪 datalab — Laboratorio de Datos de AgroMayia

Bitácora viva de la preparación de datos del proyecto. Aquí se documenta **lo que se va haciendo**: hoy solo perfila, mañana también importa.

> **En qué fase estamos:** **descubrimiento y perfilado de datos** (*data discovery & data profiling*) — la etapa que va **antes de construir nada**, donde entiendes qué datos tienes de verdad antes de tocarlos.
> Frase de una línea: *"estoy haciendo el **data profiling** previo al diseño del esquema."*

Todo esto vive dentro de la **ingeniería de datos** (*data engineering*), **no** "análisis de datos": aquí se construyen las **tuberías**; el análisis viene después, encima de lo que dejamos limpio.

---

## 🧭 Modelo mental que amarra todo

**ETL — Extract, Transform, Load:**
- **Extract:** sacar el dato del Excel.
- **Transform:** limpiarlo y validarlo.
- **Load:** cargarlo a MySQL.

Todo lo que hay en `datalab/` hoy es la **preparación del ETL**.

**Arquitectura en tres capas** (cada dato tiene **un solo dueño** y **un solo lugar donde se escribe**):

```
ingesta (ETL)  ──►  datos (MySQL)  ──►  inteligencia (Gemini / MAYIA)
   datalab/            backend BD           backend IA
```

---

## 📋 Paso por paso: qué se hizo, cómo se llama y por qué

### 1. Clasificar las hojas por tipo
Separar **catálogos** (**dimensiones**), **registros** (**hechos** / *facts*) y **resúmenes** (**pivotes/reportes**).
- Esto es **modelado dimensional**; el patrón objetivo es el **esquema estrella** (*star schema*): una dimensión al centro (ej. `BD-LOTES`) y los hechos alrededor.
- **Por qué:** no todo Excel es dato importable — los **pivotes** son *dibujos* de datos que viven en otro lado; importarlos ensucia todo.

### 2. Perfilar cada archivo
Contar filas, columnas, tipos, **vacíos** y **llaves**.
- Esto es **data profiling**.
- **Por qué:** una base nunca se diseña "de memoria" ni sobre un solo archivo — se diseña sobre **evidencia**. *Mide dos veces, corta una.*

### 3. Construir una herramienta para hacerlo solo
El script [`perfilar.py`](perfilar.py).
- Esto es **tooling** (construir tus herramientas internas).
- **Por qué:** el cliente mandará decenas de archivos; hacerlo a mano **no escala**. Esta herramienta es la **semilla del importador** — se reúsa buena parte del trabajo.

### 4. Cruzar los archivos
Buscar qué se repite y qué no coincide entre ellos. Aparecen dos problemas con nombre propio:
- **Sinónimos** — cosas **iguales con distinto nombre** (`CAMPO-ID` / `ID-LOTE`). Se resuelven con un **diccionario de alias**; el proceso de unificar se llama **canonicalización** (dejar **un solo nombre oficial**).
- **Homónimos** — cosas que **se parecen pero son distintas** (ej. "tallo 1" azul vs verde).
- **Por qué importa:** fusionar un homónimo por error **envenena todos los reportes** sin que se note. Por eso el diccionario es una **propuesta que confirma un experto del dominio**, nunca una fusión automática.

### 5. Detectar calidad y riesgos
- **Vacíos** (**NULL**), inconsistencias de mayúsculas (**casing**) y datos personales (**PII**, protegidos por la **LFPDPPP**).
- **Por qué:** un **vacío es información**, no basura — por eso **nunca se rellena con "-"** en el dato (eso es solo maquillaje del frontend, al final). Y la **PII nunca va a Git**.

### 6. Documentar las preguntas antes de construir
El documento de dudas al cliente.
- Es el **contrato de datos** en formación: el acuerdo de **qué significa cada dato** y **cómo debe entregarse**.
- **Por qué:** construir sobre suposiciones es la forma **más cara** de equivocarse.

---

## 🛠️ Herramientas y por qué

| Herramienta | Para qué | Concepto clave |
|-------------|----------|----------------|
| **Python + pandas + openpyxl** | Leer y domar Excel caótico (por eso **no** se hizo en Node) | herramienta estándar del área |
| **Entorno virtual (`venv`)** | "Cajita privada" de librerías del proyecto, sin choques entre proyectos | **reproducibilidad** (recrear el entorno con `requirements.txt`) |
| **Git + `.gitignore`** | Versionar el **código**, nunca los **datos** del cliente | el dato del cliente **no** se versiona |

---

## 📂 Estructura de la carpeta

```
datalab/
├── perfilar.py         # Perfilador de Excel (data profiling)
├── requirements.txt    # Dependencias Python (el "package.json" de este rincón)
├── README.md           # Esta bitácora
├── uploads/            # Excel reales del cliente — NUNCA a Git (PII)
└── reportes/           # Diagnósticos generados — fuera de Git
```

> `uploads/` y `reportes/` están en `.gitignore`. Lo que entra a Git es el **script**, no los **datos**.

---

## ▶️ Uso

```bash
# 1) Crear el entorno virtual (una sola vez)
python3 -m venv venv
source venv/bin/activate          # macOS/Linux

# 2) Instalar dependencias
pip install -r requirements.txt

# 3) Perfilar un archivo
python perfilar.py uploads/REG-FENOLOGICO_2026.xlsx
# El diagnóstico se imprime y se guarda en reportes/
```

---

## ✅ Estado y siguiente paso

Resumen de una línea (para cuando pregunten en qué andas):

> *"Estoy en la fase de **perfilado de datos** —*data profiling*— antes de diseñar el esquema. Ya clasifiqué las hojas en **dimensiones** y **hechos**, construí un **script de perfilado**, crucé los archivos para armar el **diccionario de alias**, y saqué las **dudas para el cliente**. El siguiente paso es el **diseño del esquema** de la base, ya con las respuestas confirmadas."*

**Siguiente:** diseño del **esquema de la base** (MySQL) con las respuestas del cliente confirmadas → luego el **importador** (ETL completo) reutilizando `perfilar.py`.
