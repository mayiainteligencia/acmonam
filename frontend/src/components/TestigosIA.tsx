// src/components/TestigosIA.tsx
import { useState, useEffect, useRef } from 'react';
import { brandingConfig } from '../config/branding';
import { Search, RotateCcw, Radio, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download, Activity, Clock } from 'lucide-react';

const { colores } = brandingConfig;

// El backend manda ISO sin zona (hora de su servidor, fijada a Mexico en main.py).
// Mexico no tiene horario de verano desde 2022 -> offset fijo -06:00.
const TZ_MX = 'America/Mexico_City';
export const fechaTestigo = (ts: string) => new Date(/(Z|[+-]\d\d:?\d\d)$/i.test(ts) ? ts : `${ts}-06:00`);
export const horaMX = (ts: string, segundos = true) =>
  fechaTestigo(ts).toLocaleTimeString('es-MX', { timeZone: TZ_MX, hour: '2-digit', minute: '2-digit', ...(segundos && { second: '2-digit' }) });
const diaMX = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: TZ_MX });

// REST y WebSocket van por el proxy de Vite (/api/monitor y /ws), asi que el
// mismo origen sirve en local y detras de un tunel.
const WS_BASE = import.meta.env.VITE_MONITOR_WS_URL ??
  `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;

interface Sesion {
  sesion_id: string;
  emisora_nombre: string;
  emisora_url: string;
  keywords: string[];
  iniciada_en: string;
  total_chunks: number;
  total_detecciones: number;
}

export interface Testigo {
  id?: number;
  sesion_id?: string;
  emisora_nombre?: string;
  emisora?: string;
  keyword_detectada?: string;
  keyword?: string;
  transcripcion?: string;
  timestamp: string;
}

const EMISORAS_PREDEFINIDAS = [
  {
    nombre: 'Radio Amor',
    frecuencia: '95.3 FM',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/XHSHFM_SC',
    imagen: '/assets/emisoras/amor.png',
  },
  {
    nombre: 'Los 40',
    frecuencia: '101.7 FM',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_MEXICO_SC',
    imagen: '/assets/emisoras/los40.png',
  },
  {
    nombre: 'MVS Noticias',
    frecuencia: '102.5 FM',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/XHMVSFM_SC',
    imagen: '/assets/emisoras/mvs.png',
  },
  {
    nombre: 'La Mejor',
    frecuencia: '97.7 FM',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/XERCFM_SC',
    imagen: '/assets/emisoras/lamejor.png',
  },
  {
    nombre: 'Radio Disney',
    frecuencia: '92.1 FM',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/XHFOFMAAC_SC',
    imagen: '/assets/emisoras/disney.png',
  },
];

export const TestigosIA = () => {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [testigos, setTestigos] = useState<Testigo[]>([]);
  const [emisoraUrl, setEmisoraUrl] = useState('');
  const [emisoraNombre, setEmisoraNombre] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [filtroKeyword, setFiltroKeyword] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [formColapsado, setFormColapsado] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [busqEmisora, setBusqEmisora] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'marca' | 'palabra'>('todos');
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [pagina, setPagina] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'envivo' | 'libres'>('todas');
  const carruselRef = useRef<HTMLDivElement>(null);
  const [maxSesiones, setMaxSesiones] = useState<number | null>(null);
  const wsRefs = useRef<Record<string, WebSocket>>({});

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    fetch('/api/monitor/config').then(r => r.json()).then(d => setMaxSesiones(d.max_sesiones)).catch(() => {});
    fetchSesiones();
    fetchTestigos();
    const interval = setInterval(fetchSesiones, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    sesiones.forEach(s => {
      if (!wsRefs.current[s.sesion_id]) conectarWS(s.sesion_id);
    });
  }, [sesiones]);

  const fetchSesiones = async () => {
    try {
      const res = await fetch('/api/monitor/sessions');
      const data = await res.json();
      setSesiones(data.sesiones || []);
    } catch {}
  };

  const fetchTestigos = async () => {
    try {
      const res = await fetch('/api/monitor/testigos');
      const data = await res.json();
      setTestigos(data.testigos || []);
    } catch {}
  };

  const conectarWS = (sesionId: string) => {
    const ws = new WebSocket(`${WS_BASE}/ws/${sesionId}`);
    ws.onmessage = (e) => {
      const alerta: Testigo = JSON.parse(e.data);
      setTestigos(prev => [alerta, ...prev]);
    };
    ws.onclose = () => { delete wsRefs.current[sesionId]; };
    wsRefs.current[sesionId] = ws;
  };

  const iniciarMonitoreo = async () => {
    setError('');
    if (!emisoraUrl.trim()) return setError('Ingresa la URL de la emisora');
    if (!keywordsInput.trim()) return setError('Ingresa al menos una keyword');
    if (maxSesiones !== null && sesiones.length >= maxSesiones) return setError(`Máximo ${maxSesiones} sesiones simultáneas`);
    setCargando(true);
    try {
      const keywords = keywordsInput.split(',').map(k => k.trim()).filter(Boolean);
      const res = await fetch('/api/monitor/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ponytail: URLs pegadas a mano traen espacios y punto final; ffmpeg los toma literal.
        body: JSON.stringify({ emisora_url: emisoraUrl.trim().replace(/[.,;]+$/, ''), emisora_nombre: emisoraNombre || 'Sin nombre', keywords })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Error al iniciar');
      setEmisoraUrl('');
      setEmisoraNombre('');
      setKeywordsInput('');
      await fetchSesiones();
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const detenerSesion = async (sesionId: string) => {
    try {
      await fetch(`/api/monitor/stop/${sesionId}`, { method: 'DELETE' });
      wsRefs.current[sesionId]?.close();
      delete wsRefs.current[sesionId];
      await fetchSesiones();
    } catch {}
  };

  const reiniciarVista = () => {
    setTestigos([]);
    setFiltroKeyword('');
  };

  const exportarCSV = () => {
    const datos = testigosFiltrados;
    if (!datos.length) return;
    const BOM = '\uFEFF';
    const headers = 'ID,Emisora,Keyword,Transcripción,Timestamp\n';
    const rows = datos.map((t, i) =>
      `${t.id ?? i + 1},"${t.emisora_nombre ?? t.emisora ?? ''}","${t.keyword_detectada ?? t.keyword ?? ''}","${(t.transcripcion ?? '').replace(/"/g, '""')}","${t.timestamp}"`
    ).join('\n');
    const blob = new Blob([BOM + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `testigos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const keywordsUnicas = Array.from(new Set(
    testigos.map(t => t.keyword_detectada ?? t.keyword ?? '').filter(Boolean)
  ));

  const seleccionarEmisora = (emisora: typeof EMISORAS_PREDEFINIDAS[0]) => {
  setEmisoraUrl(emisora.url);
  setEmisoraNombre(`${emisora.nombre} ${emisora.frecuencia}`);
  setError('');
};

  // ponytail: el backend no distingue marca/palabra; heurística = empieza en mayúscula → marca.
  const kwDe = (t: Testigo) => t.keyword_detectada ?? t.keyword ?? '';
  const esMarca = (kw: string) => /^[A-ZÁÉÍÓÚÑ]/.test(kw);
  const conteoKw: Record<string, number> = {};
  testigos.forEach(t => { const k = kwDe(t); if (k) conteoKw[k] = (conteoKw[k] ?? 0) + 1; });
  const keywordsVisibles = keywordsUnicas.filter(k => tipoFiltro === 'todos' || (tipoFiltro === 'marca') === esMarca(k));
  const q = busqueda.trim().toLowerCase();
  const testigosFiltrados = testigos.filter(t => {
    const kw = kwDe(t);
    if (filtroKeyword && kw !== filtroKeyword) return false;
    if (tipoFiltro !== 'todos' && (tipoFiltro === 'marca') !== esMarca(kw)) return false;
    return !q || `${kw} ${t.emisora_nombre ?? t.emisora ?? ''} ${t.transcripcion ?? ''}`.toLowerCase().includes(q);
  });
  const hoy = diaMX(new Date());
  const testigosHoy = testigos.filter(t => diaMX(fechaTestigo(t.timestamp)) === hoy).length;
  const ultima = testigos[0];

  // ── Emisoras: carrusel horizontal ────────────────────────────────
  const emisorasFiltradas = EMISORAS_PREDEFINIDAS.filter(e => {
    const enVivo = sesiones.some(s => s.emisora_nombre.startsWith(e.nombre));
    if (filtroEstado === 'envivo' && !enVivo) return false;
    if (filtroEstado === 'libres' && enVivo) return false;
    return e.nombre.toLowerCase().includes(busqEmisora.toLowerCase());
  });
  const scrollCarrusel = (dir: number) => carruselRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  const panelEmisoras = (
    <div style={{ ...cardStyle, padding: '16px 20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: colores.textoClaro, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Radio size={18} color={colores.primarioVivo} /> Emisoras
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', flex: isMobile ? '1 1 100%' : 'none' }}>
          <div style={{ position: 'relative', flex: isMobile ? 1 : 'none' }}>
            <Search size={14} color={colores.textoOscuro} style={{ position: 'absolute', left: 10, top: 10, pointerEvents: 'none' }} />
            <input value={busqEmisora} onChange={e => setBusqEmisora(e.target.value)} placeholder="Buscar emisora..."
              style={{ ...inputStyle, width: isMobile ? '100%' : 220, padding: '8px 12px 8px 30px' }} />
          </div>
          {([['todas', 'Todas'], ['envivo', 'En vivo'], ['libres', 'Sin sesión']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setFiltroEstado(id)} style={chipStyle(filtroEstado === id)}>{label}</button>
          ))}
          {!isMobile && <>
            <button onClick={() => scrollCarrusel(-1)} aria-label="Anterior" style={{ ...btnStyle, padding: 7 }}><ChevronLeft size={16} /></button>
            <button onClick={() => scrollCarrusel(1)} aria-label="Siguiente" style={{ ...btnStyle, padding: 7 }}><ChevronRight size={16} /></button>
          </>}
        </div>
      </div>
      <div ref={carruselRef} style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x proximity', paddingBottom: 6 }}>
        {emisorasFiltradas.length === 0 && <p style={{ fontSize: 13, color: colores.textoOscuro, margin: '12px 0' }}>Sin emisoras con ese filtro</p>}
        {emisorasFiltradas.map(emisora => {
          const seleccionada = emisoraUrl === emisora.url;
          const enVivo = sesiones.some(s => s.emisora_nombre.startsWith(emisora.nombre));
          return (
            <button key={emisora.url} onClick={() => seleccionarEmisora(emisora)} style={{
              flex: '0 0 170px', scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', gap: 10, padding: 10,
              borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              border: seleccionada ? `2px solid ${colores.primarioVivo}` : `1px solid ${colores.borde}`,
              background: seleccionada ? 'rgba(56,189,248,0.15)' : colores.fondoSecundario,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: colores.fondoTerciario, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={emisora.imagen} alt={emisora.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) parent.innerHTML = `<span style="font-size:11px;font-weight:700;color:${colores.textoOscuro}">${emisora.nombre.slice(0, 2).toUpperCase()}</span>`;
                  }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: colores.textoClaro, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emisora.nombre}</div>
                <div style={{ fontSize: 11, color: colores.textoOscuro }}>{emisora.frecuencia}</div>
                {enVivo && <span style={{ fontSize: 11, fontWeight: 600, color: '#34D399', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} /> En vivo
                </span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Nueva sesión ─────────────────────────────────────────────────
  const panelNuevaSesion = (
      <div style={{
        background: colores.fondoClaro, borderRadius: 16,
        border: `1px solid ${colores.borde}`, boxShadow: colores.sombra,
        overflow: 'hidden'
      }}>
        {/* Header colapsable en mobile */}
        <div
          onClick={() => isMobile && setFormColapsado(v => !v)}
          style={{
            padding: '16px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            cursor: isMobile ? 'pointer' : 'default',
            borderBottom: formColapsado ? 'none' : `1px solid ${colores.borde}`,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 600, color: colores.textoClaro, margin: 0 }}>
            Nueva sesión
          </h2>
          {isMobile && (
            formColapsado
              ? <ChevronDown size={18} color={colores.textoOscuro} />
              : <ChevronUp size={18} color={colores.textoOscuro} />
          )}
        </div>

        {!formColapsado && (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>URL de la emisora</label>
              <input value={emisoraUrl} onChange={e => setEmisoraUrl(e.target.value)}
                placeholder="https://streaming.ejemplo.com/radio" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input value={emisoraNombre} onChange={e => setEmisoraNombre(e.target.value)}
                placeholder="Ej: Exa FM 104.9" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Keywords (separadas por coma)</label>
              <input value={keywordsInput} onChange={e => setKeywordsInput(e.target.value)}
                placeholder="Ej: Coca-Cola, Telcel, Oxxo" style={inputStyle} />
            </div>
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#FCA5A5'
              }}>
                {error}
              </div>
            )}
            <button onClick={iniciarMonitoreo} disabled={cargando} style={{
              padding: '12px 0', borderRadius: 10, border: 'none',
              background: brandingConfig.colores.gradientePrimario, color: '#FFFFFF',
              fontWeight: 600, fontSize: 14, cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.6 : 1,
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
            }}>
              {cargando ? 'Iniciando...' : '▶ Iniciar monitoreo'}
            </button>
          </div>
        )}
      </div>
);

  // ── Sesiones activas ─────────────────────────────────────────────
  const panelSesiones = (
      <div style={{
        background: colores.fondoClaro, borderRadius: 16,
        padding: '16px 20px', border: `1px solid ${colores.borde}`, boxShadow: colores.sombra
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: colores.textoClaro, margin: 0 }}>
            Sesiones activas
          </h2>
          <span style={{
            background: sesiones.length > 0 ? 'rgba(16, 185, 129, 0.15)' : colores.fondoSecundario,
            color: sesiones.length > 0 ? '#34D399' : colores.textoOscuro,
            border: `1px solid ${sesiones.length > 0 ? 'rgba(16, 185, 129, 0.3)' : colores.borde}`,
            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999
          }}>
            {sesiones.length}/{maxSesiones ?? '…'}
          </span>
        </div>

        {sesiones.length === 0 ? (
          <p style={{ fontSize: 13, color: colores.textoOscuro, textAlign: 'center', padding: '16px 0', margin: 0 }}>
            No hay sesiones activas
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sesiones.map(s => (
              <div key={s.sesion_id} style={{
                background: colores.fondoSecundario, borderRadius: 10,
                padding: '12px 14px', border: `1px solid ${colores.borde}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#10B981', display: 'inline-block', boxShadow: '0 0 6px #10B981'
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: colores.textoClaro }}>
                        {s.emisora_nombre}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: colores.textoOscuro, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.emisora_url}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {s.keywords.map(kw => (
                        <span key={kw} style={{
                          background: colores.fondoTerciario, color: colores.textoMedio,
                          fontSize: 11, padding: '2px 8px', borderRadius: 999
                        }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: colores.textoOscuro, marginTop: 6 }}>
                      {s.total_detecciones} detecciones · {s.total_chunks} chunks
                    </div>
                  </div>
                  <button onClick={() => detenerSesion(s.sesion_id)} style={{
                    marginLeft: 10, padding: '5px 12px', borderRadius: 6,
                    border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.12)',
                    color: '#F87171', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0
                  }}>
                    Detener
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );

  // ── Paginación del historial ─────────────────────────────────────
  const POR_PAG = 10;
  const totalPaginas = Math.max(1, Math.ceil(testigosFiltrados.length / POR_PAG));
  const pag = Math.min(pagina, totalPaginas);
  const filasPagina = testigosFiltrados.slice((pag - 1) * POR_PAG, pag * POR_PAG);
  const numsPag = Array.from({ length: totalPaginas }, (_, i) => i + 1)
    .filter(n => n === 1 || n === totalPaginas || Math.abs(n - pag) <= 1);

  // ── Panel historial de testigos ──────────────────────────────────
  const colLabel = tipoFiltro === 'marca' ? 'Marca' : tipoFiltro === 'palabra' ? 'Palabra' : 'Marca / Palabra';
  const cols = isMobile ? '64px 1fr 1fr' : '90px minmax(160px,1.2fr) minmax(120px,1fr) 100px';
  const panelTestigos = (
    <div style={{ ...cardStyle, padding: isMobile ? 16 : 24, minHeight: isMobile ? 'auto' : 600 }}>
      {/* Título + acciones */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: colores.textoClaro, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Activity size={20} color={colores.primarioVivo} /> Historial de Testigos Detectados
          <span style={{ fontSize: 12, fontWeight: 500, color: colores.textoOscuro }}>{testigosFiltrados.length} registros</span>
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={reiniciarVista} style={btnStyle}><RotateCcw size={13} /> Reiniciar</button>
          <button onClick={exportarCSV} disabled={testigosFiltrados.length === 0}
            style={{ ...btnStyle, opacity: testigosFiltrados.length === 0 ? 0.5 : 1, cursor: testigosFiltrados.length === 0 ? 'not-allowed' : 'pointer' }}>
            <Download size={13} /> Exportar
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={15} color={colores.textoOscuro} style={{ position: 'absolute', left: 12, top: 12, pointerEvents: 'none' }} />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar palabra, marca o emisora..." style={{ ...inputStyle, paddingLeft: 36, padding: '10px 12px 10px 36px' }} />
      </div>

      {/* Tipo + chips de keywords (clic = filtra y muestra el texto) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        {([['todos', 'Todas'], ['marca', 'Marcas'], ['palabra', 'Palabras']] as const).map(([id, label]) => (
          <button key={id} onClick={() => { setTipoFiltro(id); setFiltroKeyword(''); }} style={chipStyle(tipoFiltro === id)}>{label}</button>
        ))}
        <span style={{ width: 1, height: 20, background: colores.borde }} />
        {keywordsVisibles.map(kw => (
          <button key={kw} onClick={() => setFiltroKeyword(filtroKeyword === kw ? '' : kw)} style={chipStyle(filtroKeyword === kw)}>
            {kw} <span style={{ opacity: 0.6, marginLeft: 4 }}>{conteoKw[kw]}</span>
          </button>
        ))}
      </div>

      {testigosFiltrados.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: isMobile ? 220 : 340, gap: 10 }}>
          <Radio size={40} color={colores.textoOscuro} strokeWidth={1} />
          <p style={{ fontSize: 14, fontWeight: 500, color: colores.textoMedio, margin: 0 }}>
            {filtroKeyword || busqueda ? 'Sin detecciones con ese filtro' : 'Esperando detecciones...'}
          </p>
          <p style={{ fontSize: 12, color: colores.textoOscuro, margin: 0 }}>Inicia una sesión para ver los testigos aquí</p>
        </div>
      ) : (
        <div style={{ borderRadius: 12, border: `1px solid ${colores.borde}`, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 8, padding: '10px 14px', background: colores.fondoSecundario, fontSize: 12, fontWeight: 600, color: colores.textoMedio }}>
            <span>Hora</span><span>{colLabel}</span><span>Emisora</span>{!isMobile && <span>Estado</span>}
          </div>
          <div style={{ maxHeight: isMobile ? '60vh' : 620, overflowY: 'auto' }}>
            {filasPagina.map((t, i) => {
              const kw = kwDe(t);
              const key = String(t.id ?? `${t.timestamp}-${i}`);
              const abierto = !!filtroKeyword || expandidos.has(key);
              return (
                <div key={key} style={{ borderTop: `1px solid ${colores.borde}`, animation: 'fadeIn 0.3s ease' }}>
                  <div onClick={() => setExpandidos(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; })}
                    style={{ display: 'grid', gridTemplateColumns: cols, gap: 8, padding: '12px 14px', alignItems: 'center', cursor: 'pointer', fontSize: 13, color: colores.textoMedio }}>
                    <span>{horaMX(t.timestamp)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, background: colores.textoClaro, color: colores.textoEnOscuro, fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {kw.slice(0, 1).toUpperCase()}
                      </span>
                      <span style={{ fontWeight: 600, color: colores.textoClaro, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kw}</span>
                      <ChevronDown size={14} color={colores.textoOscuro} style={{ flexShrink: 0, transform: abierto ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.emisora_nombre ?? t.emisora}</span>
                    {!isMobile && <span style={{ color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /> Detectado
                    </span>}
                  </div>
                  {abierto && (
                    <div style={{ padding: '4px 14px 14px 14px' }}>
                      <p style={{ margin: 0, padding: '10px 14px', borderRadius: 10, background: colores.fondoSecundario, borderLeft: `3px solid ${colores.primarioVivo}`, fontSize: 13, lineHeight: 1.6, color: colores.textoMedio, fontStyle: 'italic' }}>
                        "{t.transcripcion}"
                      </p>
                      <AudioTestigo t={t} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 6, padding: 10, borderTop: `1px solid ${colores.borde}` }}>
            <button onClick={() => setPagina(Math.max(1, pag - 1))} disabled={pag === 1} aria-label="Página anterior" style={{ ...btnStyle, padding: 7, opacity: pag === 1 ? 0.4 : 1 }}><ChevronLeft size={16} /></button>
            {numsPag.map((n, i) => (
              <span key={n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && n - numsPag[i - 1] > 1 && <span style={{ color: colores.textoOscuro }}>…</span>}
                <button onClick={() => setPagina(n)} style={{ ...chipStyle(n === pag), borderRadius: 8, minWidth: 34 }}>{n}</button>
              </span>
            ))}
            <button onClick={() => setPagina(Math.min(totalPaginas, pag + 1))} disabled={pag === totalPaginas} aria-label="Página siguiente" style={{ ...btnStyle, padding: 7, opacity: pag === totalPaginas ? 0.4 : 1 }}><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: colores.fondoPrincipal,
      padding: isMobile ? '16px' : '32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* Header + KPIs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'stretch', marginBottom: isMobile ? 16 : 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 320px', minWidth: 0 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(56,189,248,0.15)', border: `1px solid ${colores.primarioVivo}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 20px rgba(56,189,248,0.25)' }}>
              <Radio size={26} color={colores.primarioVivo} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 700, color: colores.textoClaro, margin: 0 }}>Testigos IA</h1>
              <p style={{ fontSize: 13, color: colores.textoOscuro, margin: '2px 0 0' }}>Monitoreo en tiempo real de marcas y palabras clave en radio</p>
            </div>
          </div>
          {[
            { label: 'Estaciones activas', valor: `${sesiones.length} / ${maxSesiones ?? '…'}`, color: colores.primarioVivo, Icono: Radio },
            { label: 'Testigos hoy', valor: String(testigosHoy), color: '#A78BFA', Icono: Activity },
            { label: 'Última detección', valor: ultima ? horaMX(ultima.timestamp) : '—', color: '#34D399', Icono: Clock },
          ].map(k => (
            <div key={k.label} style={{ ...cardStyle, flex: '1 1 180px', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${k.color}26`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <k.Icono size={20} color={k.color} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: colores.textoOscuro }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: colores.textoClaro }}>{k.valor}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Layout: emisoras → sesiones (2 columnas) → testigos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {panelEmisoras}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, alignItems: 'start' }}>
            {panelNuevaSesion}
            {panelSesiones}
          </div>
          {panelTestigos}
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: colores.textoMedio, marginBottom: 6
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: `1px solid ${colores.borde}`, background: colores.fondoSecundario,
  color: colores.textoClaro, fontSize: 13, outline: 'none', boxSizing: 'border-box'
};
const cardStyle: React.CSSProperties = {
  background: colores.fondoClaro, borderRadius: 16,
  border: `1px solid ${colores.borde}`, boxShadow: colores.sombra
};

const btnStyle: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 8, border: `1px solid ${colores.borde}`,
  background: colores.fondoSecundario, color: colores.textoMedio, fontSize: 13,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
};

const chipStyle = (activo: boolean): React.CSSProperties => ({
  padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
  border: `1px solid ${activo ? colores.primarioVivo : colores.borde}`,
  background: activo ? colores.primarioVivo : colores.fondoSecundario,
  color: activo ? '#FFFFFF' : colores.textoMedio
});

// Clip de audio del testigo (10 s antes + chunk + 10 s despues). Existe unos segundos
// despues de la deteccion: se sondea con HEAD hasta que el backend lo tiene.
export const urlAudioTestigo = (t: Testigo) => t.id
  ? `/api/monitor/testigos/${t.id}/audio`
  : `/api/monitor/audio/${t.sesion_id}/${encodeURIComponent(t.timestamp)}`;

export const AudioTestigo = ({ t }: { t: Testigo }) => {
  const url = urlAudioTestigo(t);
  const [estado, setEstado] = useState<'preparando' | 'listo' | 'sin'>('preparando');
  useEffect(() => {
    let vivo = true, intentos = 0, timer: ReturnType<typeof setTimeout>;
    const reciente = Date.now() - fechaTestigo(t.timestamp).getTime() < 2 * 60_000;
    const probar = async () => {
      try {
        if ((await fetch(url, { method: 'HEAD' })).ok) return vivo && setEstado('listo');
      } catch {}
      if (!vivo) return;
      // detecciones viejas (o sin sesion_id) no tienen clip: no sondear para siempre
      if (!reciente || ++intentos >= 24) return setEstado('sin');
      timer = setTimeout(probar, 5000);
    };
    probar();
    return () => { vivo = false; clearTimeout(timer); };
  }, [url]);
  const nota: React.CSSProperties = { margin: '8px 0 0', fontSize: 12, color: colores.textoOscuro };
  if (estado === 'listo') return <audio controls preload="none" src={url} style={{ width: '100%', marginTop: 8 }} />;
  return <p style={nota}>{estado === 'preparando' ? '⏳ Preparando audio… (disponible unos segundos después de la detección)' : 'Sin audio para esta detección'}</p>;
};
