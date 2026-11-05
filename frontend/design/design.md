# Diseño MAYIA Escucha — guía de dashboard

Referencias analizadas: (1) layout bento con rail lateral, (2) catálogo de gráficas estilo HUD, (3) dashboard de KPIs en verde neón sobre negro.
Regla: se toma la **estructura y el tipo de widget** de las referencias; los **colores salen siempre de `src/config/branding.ts`**. No se usa el morado de la ref. 2 ni el verde neón literal de la ref. 3.

---

## 1. Qué aprendimos de cada referencia

### Ref. 1 — Layout bento
- Rail de navegación vertical angosto (iconos) + área principal grande + columna derecha de tarjetas apiladas.
- Un bloque principal dominante (hero / visual) y bloques secundarios de tamaños distintos que encajan como rompecabezas.
- Esquinas muy redondeadas (≈ 20–28 px), separación uniforme (≈ 16 px), una barra de entrada/acción flotante abajo.
- Lección: **jerarquía por tamaño**. Lo más importante ocupa más; nada flota sin alinearse a la cuadrícula.

### Ref. 2 — Catálogo de gráficas
Formas que debe poder pintar el dashboard:
1. Barras horizontales (ranking con % al final), simples y comparativas (2 barras por fila).
2. Barras verticales con valor sobre la barra; la barra destacada lleva el color de acento.
3. Barras apiladas por periodo.
4. Línea, línea con área degradada, y barra + línea combinadas.
5. Dona / anillo con % al centro (versión simple y versión con leyenda y delta por ítem).
6. Dispersión (puntos y burbujas con tamaño).
7. Radar (5 ejes).
8. Medidor circular y medidor semicircular con % al centro.
- Detalles de estilo útiles: cuadrícula tenue, un solo elemento resaltado en acento, etiqueta de valor visible, títulos de panel con barrita de acento.

### Ref. 3 — Dashboard de KPIs
- Orden vertical: **KPI héroe grande** (valor + delta + comparación) → visual principal (flujo) → serie temporal + 3 KPIs apilados → fila de 4 mini-KPIs con icono/mini-gráfica → lista de actividad reciente + dona de desglose → pronóstico + metas con barras de progreso.
- Cada tarjeta: título pequeño en mayúsculas, valor grande, delta con flecha (▲ verde / ▼ rojo) y sub-etiqueta.
- Listas con icono a la izquierda, fecha al centro y monto a la derecha.
- Metas: barra de progreso con `actual / objetivo` y % a la derecha.
- Lección: un dashboard se lee en **capas** (resumen → tendencia → detalle → acción).

---

## 2. Paleta (la de la página, no negociable)

| Token (`brandingConfig.colores`) | Valor | Uso en dashboard |
|---|---|---|
| `primario` | `#4D7C0F` | Acento sobre fondo blanco: barra destacada, línea principal, botón primario, tab activa de acento |
| `primarioVivo` | `#C4F04C` | Acento **solo sobre superficies oscuras** (valor héroe, líneas del HUD, glow) |
| `secundario` / `textoClaro` | `#1A1A1A` / `#0A0A0A` | Superficies oscuras (hero), texto principal, tabs activas |
| `fondoPrincipal` / `fondoClaro` | `#FFFFFF` | Fondo de página y tarjetas |
| `borde` | `#CCCCCC` | Bordes de tarjeta, cuadrícula de gráficas |
| `textoOscuro` | `#6B7280` | Etiquetas, ejes, sub-textos |
| `exito` / `advertencia` / `peligro` | `#10B981` / `#F59E0B` / `#EF4444` | Deltas, estados, semáforos (cumple / cerca / falla) |

Series múltiples (máx. 3–4): `#4D7C0F`, `#0047AB`, `#F58025`, `#8B5CF6` — ya usadas en Radio/TV/Impresos. Más de 4 categorías → agrupar en "Otros".
Regla de contraste: el lima brillante nunca va sobre blanco; el verde `#4D7C0F` nunca sobre negro.

---

## 3. Sistema de tarjetas

- **Superficie clara (default):** fondo blanco, borde `borde`, radio 18, sombra `sombra`. Componente `Panel`.
- **Superficie HUD (oscura):** fondo `gradientePrimario`, texto blanco, acento `primarioVivo`, borde 1 px `primarioVivo` al ~25 % de opacidad, glow radial tenue en una esquina. Solo para: hero de sección, KPI héroe, 1 widget "estrella" por pantalla. Máximo 2 por vista para no saturar.
- Encabezado de tarjeta: título 15 px/700 + icono a la izquierda; acción o estado (`LiveDot`, `Chip`, selector) a la derecha.
- Espaciado: gap 16 px entre tarjetas, padding 20 px dentro (16 px en móvil).
- Animación de entrada `elFadeUp` ya existente; respetar `prefers-reduced-motion`.

---

## 4. Catálogo de widgets

| Widget | Para qué | Estado en código |
|---|---|---|
| **Hero de sección** (`SectionHero`) | Título + subtítulo + panel "MAYIA · análisis" con 2 insights | existe (`shared/ui.tsx`) |
| **KPI** (`Kpi`) | Valor, delta con flecha, sub-etiqueta | existe |
| **KPI héroe HUD** | Valor grande sobre superficie oscura, delta en chip | por crear |
| **Mini-KPI con icono / mini-gráfica** | Fila de 4 métricas compactas (estaciones activas, spots/h, errores…) | por crear |
| **Medidor semicircular** (`Gauge`) | Precisión vs. meta 97.5 % | existe (`shared/viz.tsx`) |
| **Medidor circular / anillo %** | Cobertura (95/100 canales) | por crear |
| **Barra de progreso con meta** | Cobertura pedida vs. lograda, metas | inline en Precisión; extraer |
| **Lista de actividad reciente** | Últimas detecciones: icono · marca/medio · hora · tipo | por crear |
| **Tarjeta de testigo** | Audio (`Waveform`), video (`VideoThumb`), página (`PagePreview`) | existe |
| **Tarjeta de entidad** | Estación, canal, publicación con avatar, estado y mini-dato | existe |
| **Tabla con chips** (`Tabla`, `Chip`) | Spots, inserciones, programación | existe |
| **Parrilla / timeline 24 h** | Programación de TV | existe (Televisión) |
| **Filtros** | Búsqueda, plaza, tipo, grupo, mes | patrón repetido; extraer a `Filtros` |
| **Pestañas** (`Tabs`) | Subvistas por medio | existe |
| **Mapa de plazas** | Radio/TV/Impresos por CDMX · GDL · MTY | opcional, se borró con la geometría vieja |

---

## 5. Qué gráfica usar para qué (mapeo al producto)

| Pregunta del usuario | Gráfica | Notas |
|---|---|---|
| ¿Cumplimos el 97.5 %? | Medidor semicircular + línea de meta | Verde ≥ meta, ámbar < meta |
| ¿Cómo evoluciona la precisión? | Línea multi-serie con `ReferenceLine` en 97.5 | 1 línea por medio |
| ¿Qué tipo de errores hay? | Barras apiladas | Omisión / marca mal asignada / falso positivo |
| ¿Cuánto cubrimos de lo pedido? | Barra de progreso con meta o anillo % | 147/147, 95/100, 70/70 |
| ¿A qué hora salen los spots? | Área apilada por hora | Regular / patrocinio / autopromo |
| ¿Quién anuncia más? | Barras horizontales ordenadas | Destacar el #1 en acento |
| ¿Qué categorías pesan? | Dona con total al centro | Máx. 6 porciones + "Otros" |
| ¿Cómo se reparten los canales / grupos? | Dona o barras horizontales | Color por tipo / grupo |
| ¿Spots por plaza y tipo? | Barras apiladas por plaza | CDMX · GDL · MTY |
| ¿Tarifa vs. tamaño? | Dispersión con burbujas | Color por tipo de impreso |
| ¿Perfil de una estación/marca en varios ejes? | Radar de 5 ejes | Solo si hay ≥ 5 métricas comparables |
| ¿Qué programa salió a qué hora? | Parrilla horizontal 24 h | Color por género |
| Tendencia + volumen a la vez | Barra + línea combinadas | Ref. 2 "柱折图" |
| ¿Cuánto falta para la meta del mes? | Barra de progreso con `actual / objetivo` | Ref. 3 "Goals" |
| Pronóstico | Área con degradado + etiqueta del valor final | Solo cuando haya modelo real |

Reglas de gráfica: máx. 4 series; ejes con `fontSize` 11–12; cuadrícula `borde` punteada; valor visible en lo destacado; leyenda solo con 2+ series; tooltip con `tooltipStyle`; siempre dentro de `ResponsiveContainer` con altura fija (240–320 px).

---

## 6. Layouts por pantalla (bento adaptado)

Orden estándar de cada sección, de arriba abajo:
1. **Hero + análisis MAYIA** (2 columnas desktop).
2. **Fila de 4 KPIs** (1 héroe HUD opcional + 3 normales).
3. **Fila principal:** gráfica grande (≈ 60 %) + columna de 2–3 tarjetas apiladas (≈ 40 %): KPIs, metas, lista de actividad.
4. **Fila de desglose:** dona + barras horizontales + lista.
5. **Pestañas** con el detalle (tablas, catálogos, testigos).

Ejemplo — **Precisión General**: hero → 4 KPIs → 3 medidores → [tendencia 1.4fr | errores 1fr] → barras de progreso de cobertura → lista de últimas correcciones.
Ejemplo — **Radio**: hero → KPIs → [actividad por hora | lista de últimas detecciones] → dona de categorías + ranking → pestañas (en vivo, estaciones, spots, testigos).

---

## 7. Responsive

| Ancho | Comportamiento |
|---|---|
| ≥ 1024 | Cuadrícula completa: 12 columnas lógicas, tarjetas 2–4 por fila; sidebar visible |
| 768–1023 | 2 columnas máximo; gráficas a ancho completo; KPIs 2×2 |
| < 768 | 1 columna; KPIs 2×2; hero y panel de análisis apilados; tablas con scroll horizontal; parrilla con scroll horizontal; navegación inferior (`ResponsiveLayout`) |

- Usar `useIsMobile()` (< 768) y `grid-template-columns: repeat(auto-fill, minmax(Npx, 1fr))` para catálogos (230–280 px por tarjeta).
- Gráficas siempre en `ResponsiveContainer`; en móvil bajar altura a 220 px y ocultar leyenda si estorba.
- Tap targets ≥ 40 px; filtros que hagan wrap, no que desborden.
- Nada de ancho fijo en px salvo la parrilla (con su propio scroll).

---

## 8. Accesibilidad y consistencia

- Contraste ≥ 4.5:1 en texto; estados nunca solo por color (agregar texto o chip: "Cumple", "Bajo la meta").
- Deltas: ▲ `exito` / ▼ `peligro` con signo y unidad.
- Números con `tabular-nums` y separador `es-MX`; moneda `$` MXN; porcentajes con 1 decimal para precisión.
- Títulos de panel en sentence case; etiquetas de KPI cortas (≤ 3 palabras).
- Iconos: `lucide-react`, 15–19 px, color `primario` sobre claro / `primarioVivo` sobre oscuro.
- Estados vacíos y de carga: texto corto + icono; nunca dejar un panel en blanco.

---

## 9. Pendiente para implementar este diseño

1. Extraer a `shared/`: `KpiHero` (HUD), `MiniKpi`, `Progreso`, `Anillo`, `ListaActividad`, `Filtros`.
2. Aplicar el orden de la sección 6 a Precisión, Radio, TV e Impresos (hoy tienen hero + KPIs + pestañas, faltan las filas "principal + columna apilada" y "actividad reciente").
3. Agregar radar y barra + línea donde haya datos que lo justifiquen (no decorativos).
4. Verificar en 375 / 768 / 1280 px.
