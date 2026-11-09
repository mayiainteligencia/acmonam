// src/utils/exportAuditsa.ts
// Exportación de testigos en la estructura y presentación AUDITSA / Nestlé.
// Genera un .xlsx REAL (Office Open XML empaquetado en ZIP) directamente en el navegador,
// sin dependencias externas, para que Excel lo abra sin advertencias de formato.

export interface TestigoExportable {
  id?: number;
  emisora_nombre?: string;
  emisora?: string;
  keyword_detectada?: string;
  keyword?: string;
  transcripcion?: string;
  timestamp: string;
  grupo_comercial?: string;
  spot_tipo?: string;
}

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const HEADERS = [
  'Canal', '', '', 'Estación/Canal', 'Grupo Comercial', 'Hora',
  'Seg Truncados', 'Duración Hit', 'Duración Prog', 'Programa',
  'Inicio del Programa', 'Fin del Programa', 'Compañía', 'Agencia',
  'Campaña', 'Tarifa', 'Marca (Keyword)', 'Submarca', 'Producto',
  'Versión', 'Código ACAM', 'Localidad', 'Medio', 'Sector',
  'Sub Sector', 'Categoría', 'Cobertura', 'Testigo', 'Spot tipo', 'Grupo Comercial',
];
const NCOLS = HEADERS.length; // 30

export function extraerSiglas(emisora: string): string {
  if (!emisora) return 'Radio';
  const txt = emisora.trim();
  const lower = txt.toLowerCase();
  if (lower.includes('delfin') || lower.includes('delfín')) return 'Radio Delfín';
  if (lower.includes('exa')) return 'Exa';
  if (lower.includes('la mejor')) return 'La Mejor';
  if (lower.includes('mvs')) return 'MVS Noticias';
  if (lower.includes('disney')) return 'Radio Disney';
  if (lower.includes('los 40') || lower.includes('los40')) return 'Los 40';
  const limpio = txt.replace(/\b\d{2,3}(\.\d)?\s*(FM|AM)?\b/gi, '').trim();
  return limpio || txt.split(' ')[0] || 'Radio';
}

function parseTimestamp(ts: string) {
  const d = new Date(/(Z|[+-]\d\d:?\d\d)$/i.test(ts) ? ts : `${ts}-06:00`);
  const parts = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, day: '2-digit', month: '2-digit', year: 'numeric',
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '00';
  const hourNum = (parseInt(get('hour'), 10) || 0) % 24;
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    d,
    rangoHora: `${pad(hourNum)}:00 - ${pad((hourNum + 1) % 24)}:00`,
    fechaStr: `${get('day')}/${get('month')}/${get('year')}`,
    fechaOrden: `${get('year')}${get('month')}${get('day')}`,
    horaStr: `${pad(hourNum)}:${get('minute')}:${get('second')}`,
  };
}

// ───────────────────────────── ZIP (sin compresión, método "stored") ─────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function crearZip(archivos: { nombre: string; contenido: string }[]): Uint8Array {
  const enc = new TextEncoder();
  const locales: Uint8Array[] = [];
  const centrales: Uint8Array[] = [];
  let offset = 0;

  for (const f of archivos) {
    const nombre = enc.encode(f.nombre);
    const datos = enc.encode(f.contenido);
    const crc = crc32(datos);

    const local = new Uint8Array(30 + nombre.length + datos.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true); // nombres UTF-8
    lv.setUint16(8, 0, true);      // stored
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0x21, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, datos.length, true);
    lv.setUint32(22, datos.length, true);
    lv.setUint16(26, nombre.length, true);
    lv.setUint16(28, 0, true);
    local.set(nombre, 30);
    local.set(datos, 30 + nombre.length);
    locales.push(local);

    const central = new Uint8Array(46 + nombre.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x21, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, datos.length, true);
    cv.setUint32(24, datos.length, true);
    cv.setUint16(28, nombre.length, true);
    cv.setUint32(42, offset, true);
    central.set(nombre, 46);
    centrales.push(central);

    offset += local.length;
  }

  const tamCentral = centrales.reduce((s, c) => s + c.length, 0);
  const fin = new Uint8Array(22);
  const fv = new DataView(fin.buffer);
  fv.setUint32(0, 0x06054b50, true);
  fv.setUint16(8, archivos.length, true);
  fv.setUint16(10, archivos.length, true);
  fv.setUint32(12, tamCentral, true);
  fv.setUint32(16, offset, true);

  const total = new Uint8Array(offset + tamCentral + 22);
  let p = 0;
  for (const b of [...locales, ...centrales, fin]) { total.set(b, p); p += b.length; }
  return total;
}

// ───────────────────────────── XLSX ─────────────────────────────

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const colLetra = (n: number) => {
  let s = '';
  for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

// Índices de estilo (cellXfs en styles.xml)
const S = { header: 1, rango: 2, fecha: 3, detalle: 4, link: 5, total: 6, centro: 7, subtotal: 8 } as const;

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="8">
<font><sz val="10"/><name val="Calibri"/></font>
<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="10"/><color rgb="FF1E293B"/><name val="Calibri"/></font>
<font><b/><sz val="9.5"/><color rgb="FF334155"/><name val="Calibri"/></font>
<font><sz val="9"/><name val="Calibri"/></font>
<font><u/><sz val="9"/><color rgb="FF0044CC"/><name val="Calibri"/></font>
<font><b/><sz val="10"/><color rgb="FF0F172A"/><name val="Calibri"/></font>
<font><b/><sz val="9.5"/><color rgb="FF0F172A"/><name val="Calibri"/></font>
</fonts>
<fills count="5">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF1F2937"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFE2E8F0"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="3">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color rgb="FFCBD5E1"/></left><right style="thin"><color rgb="FFCBD5E1"/></right><top style="thin"><color rgb="FFCBD5E1"/></top><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border>
<border><left/><right/><top style="medium"><color rgb="FF0F172A"/></top><bottom style="double"><color rgb="FF0F172A"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="9">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="4" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="4" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="5" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="6" fillId="0" borderId="2" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="4" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="7" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

const ANCHOS: Record<number, number> = {
  1: 30, 2: 26, 3: 16, 4: 30, 5: 18, 6: 11, 7: 12, 17: 18, 20: 60, 22: 11, 23: 9, 27: 11, 28: 16, 29: 12, 30: 18,
};
const COLS_CENTRO = new Set([3, 5, 6, 7, 8, 9, 11, 12, 21, 22, 23, 27, 29, 30]);

type Celda = { v: string | number; s: number; link?: string };

function construirHoja(testigos: TestigoExportable[], host: string): string {
  const filas: string[] = [];
  let r = 0;

  const fila = (celdas: (Celda | null)[], opts: { altura?: number; nivel?: number; estiloFila?: number } = {}) => {
    r++;
    const attrs = [`r="${r}"`];
    if (opts.altura) attrs.push(`ht="${opts.altura}" customHeight="1"`);
    if (opts.nivel) attrs.push(`outlineLevel="${opts.nivel}"`);
    if (opts.estiloFila !== undefined) attrs.push(`s="${opts.estiloFila}" customFormat="1"`);
    const cs = celdas.map((c, i) => {
      if (!c) return '';
      const ref = `${colLetra(i + 1)}${r}`;
      if (c.link) {
        return `<c r="${ref}" s="${c.s}" t="str"><f>HYPERLINK("${esc(c.link)}","${esc(c.v)}")</f><v>${esc(c.v)}</v></c>`;
      }
      if (typeof c.v === 'number') return `<c r="${ref}" s="${c.s}"><v>${c.v}</v></c>`;
      if (c.v === '') return `<c r="${ref}" s="${c.s}"/>`;
      return `<c r="${ref}" s="${c.s}" t="inlineStr"><is><t xml:space="preserve">${esc(c.v)}</t></is></c>`;
    }).join('');
    filas.push(`<row ${attrs.join(' ')}>${cs}</row>`);
  };

  // Encabezados
  fila(HEADERS.map((h) => ({ v: h, s: S.header })), { altura: 28 });

  // Agrupar Rango Hora → Fecha
  const grupos = new Map<string, Map<string, { orden: string; items: { t: TestigoExportable; p: ReturnType<typeof parseTimestamp> }[] }>>();
  for (const t of testigos) {
    const p = parseTimestamp(t.timestamp);
    if (!grupos.has(p.rangoHora)) grupos.set(p.rangoHora, new Map());
    const g = grupos.get(p.rangoHora)!;
    if (!g.has(p.fechaStr)) g.set(p.fechaStr, { orden: p.fechaOrden, items: [] });
    g.get(p.fechaStr)!.items.push({ t, p });
  }

  let granTotal = 0;
  for (const rango of [...grupos.keys()].sort()) {
    const fechas = grupos.get(rango)!;
    const totalRango = [...fechas.values()].reduce((s, f) => s + f.items.length, 0);
    granTotal += totalRango;

    // Nivel 1: Rango Hora
    fila(Array.from({ length: NCOLS }, (_, i) => ({ v: i === 0 ? `Rango Hora: ${rango}  (Total:${totalRango})` : '', s: S.rango })), { altura: 20 });

    const fechasOrd = [...fechas.entries()].sort((a, b) => a[1].orden.localeCompare(b[1].orden));
    for (const [fecha, { items }] of fechasOrd) {
      // Nivel 2: Fecha
      fila(Array.from({ length: NCOLS }, (_, i) => ({ v: i === 1 ? `Fecha: ${fecha}  (Total:${items.length})` : '', s: S.fecha })), { altura: 19, nivel: 1 });

      items.sort((a, b) => a.p.d.getTime() - b.p.d.getTime());
      for (const { t, p } of items) {
        const emisora = t.emisora_nombre || t.emisora || 'N/D';
        const grupo = t.grupo_comercial || 'N/D';
        const audio = t.id ? `${host.replace(/\/$/, '')}/api/monitor/testigos/${t.id}/audio` : '';
        const valores: (string | number)[] = [
          '', '', extraerSiglas(emisora), emisora, grupo, p.horaStr,
          0, 'N/D', 'N/D', 'N/D', 'N/D', 'N/D', 'N/D', 'N/D',
          'N/D', 'N/D', t.keyword_detectada || t.keyword || 'N/D', 'N/D', 'N/D',
          t.transcripcion || '', 'N/D', 'CDMX', 'Radio', 'N/D',
          'N/D', 'N/D', 'N/D', audio ? 'Escuchar audio' : 'N/D', t.spot_tipo || 'N/D', grupo,
        ];
        fila(valores.map((v, i) => {
          const col = i + 1;
          if (col === 28 && audio) return { v, s: S.link, link: audio };
          return { v, s: COLS_CENTRO.has(col) ? S.centro : S.detalle };
        }), { altura: 18, nivel: 2 });
      }

      // Subtotal por fecha
      fila(Array.from({ length: NCOLS }, (_, i) => (i === 12 ? { v: `Total:${items.length}`, s: S.subtotal } : null)), { altura: 18, nivel: 1 });
    }
  }

  // Gran total
  fila(Array.from({ length: NCOLS }, (_, i) => ({ v: i === 12 ? `Total:${granTotal}` : '', s: S.total })), { altura: 22 });

  const cols = Array.from({ length: NCOLS }, (_, i) =>
    `<col min="${i + 1}" max="${i + 1}" width="${ANCHOS[i + 1] ?? 13}" customWidth="1"/>`).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetPr><outlinePr summaryBelow="0"/></sheetPr>
<dimension ref="A1:${colLetra(NCOLS)}${r}"/>
<sheetViews><sheetView workbookViewId="0" showOutlineSymbols="1"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15" outlineLevelRow="2"/>
<cols>${cols}</cols>
<sheetData>${filas.join('')}</sheetData>
<autoFilter ref="A1:${colLetra(NCOLS)}1"/>
</worksheet>`;
}

export function generarXlsxAuditsa(testigos: TestigoExportable[], host = window.location.origin): Blob {
  const zip = crearZip([
    {
      nombre: '[Content_Types].xml',
      contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    },
    {
      nombre: '_rels/.rels',
      contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      nombre: 'xl/workbook.xml',
      contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Reporte de Testigos" sheetId="1" r:id="rId1"/></sheets>
<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'Reporte de Testigos'!$A$1:$${colLetra(NCOLS)}$1</definedName></definedNames>
</workbook>`,
    },
    {
      nombre: 'xl/_rels/workbook.xml.rels',
      contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    { nombre: 'xl/styles.xml', contenido: STYLES_XML },
    { nombre: 'xl/worksheets/sheet1.xml', contenido: construirHoja(testigos, host) },
  ]);
  return new Blob([zip as BlobPart], { type: XLSX_MIME });
}

function descargarBlob(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Descarga SIEMPRE un .xlsx real.
 * 1) Intenta el endpoint openpyxl del monitor (cruza pautas en el servidor).
 * 2) Si no está disponible o no devuelve un .xlsx válido, lo genera en el navegador. */
export async function descargarReporteAuditsa(
  testigos: TestigoExportable[],
  nombreArchivoBase = 'REPORTE_MONITOREO_ACAM',
) {
  if (!testigos.length) return;
  const nombre = `${nombreArchivoBase}_${new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })}.xlsx`;

  try {
    const ids = testigos.map((t) => t.id).filter(Boolean);
    const res = await fetch('/api/monitor/export/auditsa.xlsx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ids.length ? ids : undefined }),
    });
    const tipo = res.headers.get('content-type') || '';
    if (res.ok && tipo.includes('spreadsheetml')) {
      const blob = await res.blob();
      // Validar firma ZIP ("PK") para no descargar nunca un archivo dañado
      const firma = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
      if (firma[0] === 0x50 && firma[1] === 0x4b) {
        descargarBlob(blob, nombre);
        return;
      }
    }
  } catch {
    // monitor no disponible → generar en el navegador
  }

  descargarBlob(generarXlsxAuditsa(testigos), nombre);
}
