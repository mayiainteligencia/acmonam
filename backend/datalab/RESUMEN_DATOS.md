# Resumen de datos — ANALISIS.xlsx

Qué encontré al perfilar y extraer el Excel del cliente, y cómo alimenta cada
sección de la plataforma. Fuente: `uploads/ANALISIS.xlsx` (7 hojas). Pipeline:
`perfilar.py` (diagnóstico) → `extraer.py` (extracción a JSON) → `datos/`.

## Qué hay en el Excel

| Hoja | Veredicto | Uso |
|------|-----------|-----|
| **COMPILADO** | Fuente de datos (la joya) | Resultados electorales municipales de **Oaxaca** |
| **COMITÉ** (tabla izquierda) | Fuente, pero con 2 tablas lado a lado | Representantes + presupuesto por municipio |
| computo dttal, casillas anuladas, CONCENTRADO, MOVILIZACION, REPRESENTANTES | Reportes sucios / muy vacíos | No se importan aún |

### COMPILADO (2,391 filas)
- **Ámbito:** estado de **Oaxaca**, nivel **municipio** (~596 por año).
- **Años:** 1998, 2004, 2010, 2016.
- **Partidos:** PAN, PRD, CONVER, PT, PRI, PVEM, PARMEO, PUP, PNA.
- **Ganador:** NO viene dado (la columna `PARTIDO` está vacía). Se calcula:
  partido con más votos por municipio-año.
- **Calidad:** solo **1998 (594 municipios con ganador)** y **2010 (597)** están
  completos. **2004 (9)** y **2016 (17)** vienen casi vacíos → se ocultan para
  no mostrar huecos. Los NULL se conservan (no se rellenan).

### Hallazgos clave
- **PRI dominante.** Totales históricos: PRI **3,111,988** · PRD 1,911,132 · PAN
  1,399,605 votos.
- **2010:** PRI ganó **431 de 597** municipios (**41.4%** de la votación,
  4.24M votos). PRD 2ª fuerza.
- **1998:** PRI ganó **426 de 596** municipios.
- **Municipios de fotografía** (2010): varios donde el PRI **perdió por 2 votos**
  (San Andrés Solaga, Santiago Apoala vs PRD; San Lucas Camotlán vs PAN).

### COMITE_representantes (571 municipios)
- Representantes de casilla y generales por municipio.
- **Presupuesto total en sobres: $6,086,250 MXN.**
- Ojo: la hoja tenía 2 tablas pegadas + bandas de sección + totales; se extrajo
  solo la tabla izquierda por región (`--cols A:F --desde 6 --hasta 626`) y se
  filtraron subtotales.

---

## Cómo alimenta cada sección de la plataforma

### Comando Central (dashboard principal)
- **KPIs:** municipios del año, municipios ganados por el PRI, % de votación PRI,
  representantes + presupuesto.
- **Mapa de México:** Oaxaca resaltada con datos reales; el resto "sin datos"
  (cuando lleguen más estados, se encienden solos).
- **Alertas y actividad:** derivadas de los datos (plaza fuerte, 2ª fuerza,
  abstención, trazas de ingesta del datalab).

### Resultados Electorales (`/reportes`)
- Selector de año (**1998 / 2010**, los que tienen datos).
- **Votos por partido** (barras), **tendencia del PRI por año** (línea),
  **municipios ganados** (dona), **top municipios** por votación PRI (tabla).

### Focos de Atención (`/alertas`)
- **Oportunidad:** municipios donde el PRI quedó a pocos votos de ganar.
- **Riesgo de movilización:** municipios con mayor abstención.
- **Competencia:** quién es la 2ª fuerza y por cuánto.

### Jarvis (asistente de voz)
Responde con estos datos: cuántos municipios ganó el PRI, % de votación,
abstención, plaza más fuerte, 2ª fuerza, tamaño del padrón. Además navega.

---

## Reglas de datos (heredadas de perfilar.py)
1. Los vacíos se quedan como `null`. Nunca se rellenan ni se inventan.
2. Solo se limpia forma (nombres de columna, espacios), no fondo (no se corrigen
   mayúsculas ni se redondean votos).
3. Un detector automático solo señala; la decisión de qué importar es humana.

## Reproducir
```bash
python perfilar.py uploads/ANALISIS.xlsx          # diagnóstico
python extraer.py --receta receta_ANALISIS.json   # extracción a datos/*.json
```
Los JSON se copian a `frontend/src/data/` (`compilado.json`, `representantes.json`)
y `frontend/src/data/electoral.js` hace todo el cómputo (ganadores, agregados).
