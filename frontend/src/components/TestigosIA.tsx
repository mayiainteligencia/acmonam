// src/components/TestigosIA.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { brandingConfig } from '../config/branding';
import { Search, RotateCcw, Radio, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download, Activity, Clock, Play, Square, Volume2, VolumeX, Sparkles, Check } from 'lucide-react';
import { ESTACIONES_147, type EstacionOficial } from '../data/catalogo147';
import { descargarReporteAuditsa } from '../utils/exportAuditsa';

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

const LogoEmisoraCircular = ({ emisora }: { emisora: EstacionOficial }) => {
  const [imgError, setImgError] = useState(false);
  const dialNumero = emisora.dial.replace(/[^0-9.]/g, '');
  const texto = dialNumero || emisora.siglas.replace(/-(AM|FM)$/, '').slice(0, 4);

  return (
    <div style={{
      width: 42,
      height: 42,
      borderRadius: '50%',
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
      border: '1.5px solid rgba(255, 255, 255, 0.9)'
    }}>
      {!imgError ? (
        <img
          src={`/assets/emisoras/${emisora.siglas.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`}
          alt={emisora.nombre}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }}
        />
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1.05,
          color: '#0f172a'
        }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a' }}>
            {texto.slice(0, 4)}
          </span>
          <span style={{ fontSize: 7.5, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
            {emisora.dial.includes('FM') ? 'FM' : 'AM'}
          </span>
        </div>
      )}
    </div>
  );
};

interface TestigosIAProps {
  initialEmisora?: { nombre: string; url: string };
}

export const TestigosIA = ({ initialEmisora }: TestigosIAProps = {}) => {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [testigos, setTestigos] = useState<Testigo[]>([]);
  const [emisoraUrl, setEmisoraUrl] = useState(initialEmisora?.url || '');
  const [emisoraNombre, setEmisoraNombre] = useState(initialEmisora?.nombre || '');
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
  const [maxSesiones, setMaxSesiones] = useState<number | null>(null);
  const wsRefs = useRef<Record<string, WebSocket>>({});

  // Filtros avanzados para el catálogo de 147 estaciones
  const [filtroPlaza, setFiltroPlaza] = useState<'Todas' | 'CDMX' | 'Guadalajara' | 'Monterrey'>('Todas');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [soloConAudio, setSoloConAudio] = useState(false);
  const [pagEmisoras, setPagEmisoras] = useState(1);
  const [verTodasEmisoras, setVerTodasEmisoras] = useState(false);

  // Reproductor embebido de preview en vivo
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewNombre, setPreviewNombre] = useState<string>('');
  const [previewMute, setPreviewMute] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (initialEmisora?.url) {
      setEmisoraUrl(initialEmisora.url);
      setEmisoraNombre(initialEmisora.nombre);
    }
  }, [initialEmisora]);

  useEffect(() => {
    const handlePreselect = (e: Event) => {
      const detail = (e as CustomEvent<{ nombre: string; url: string }>).detail;
      if (detail?.url) {
        setEmisoraUrl(detail.url);
        setEmisoraNombre(detail.nombre);
        setFormColapsado(false);
      }
    };
    window.addEventListener('testigos:preseleccionar', handlePreselect);
    return () => window.removeEventListener('testigos:preseleccionar', handlePreselect);
  }, []);

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

  const [exportando, setExportando] = useState(false);

  const exportarReporte = async () => {
    const datos = testigosFiltrados;
    if (!datos.length || exportando) return;
    setExportando(true);
    try {
      await descargarReporteAuditsa(datos, 'REPORTE_MONITOREO_ACAM_NESTLE');
    } catch (err) {
      console.error('[Export Error]', err);
    } finally {
      setExportando(false);
    }
  };

  const keywordsUnicas = Array.from(new Set(
    testigos.map(t => t.keyword_detectada ?? t.keyword ?? '').filter(Boolean)
  ));

  const seleccionarEmisora = (emisora: EstacionOficial) => {
    setEmisoraUrl(emisora.streamUrl || '');
    setEmisoraNombre(`${emisora.nombre} ${emisora.dial}`);
    setError('');
    if (isMobile) setFormColapsado(false);
  };

  const handleTogglePreview = (e: React.MouseEvent, est: EstacionOficial) => {
    e.stopPropagation();
    if (!est.streamUrl) return;
    if (previewUrl === est.streamUrl) {
      setPreviewUrl(null);
      setPreviewNombre('');
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current.src = '';
      }
    } else {
      setPreviewUrl(est.streamUrl);
      setPreviewNombre(`${est.nombre} (${est.dial} · ${est.plaza})`);
      if (audioPreviewRef.current) {
        audioPreviewRef.current.src = est.streamUrl;
        audioPreviewRef.current.play().catch(() => {});
      }
    }
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

  // ── Emisoras: Catálogo 147 en cuadrícula de 4 columnas (fiel a la referencia) ──
  const categoriasUnicas = useMemo(() => {
    const s = new Set<string>();
    ESTACIONES_147.forEach(e => { if (e.categoria) s.add(e.categoria); });
    return Array.from(s).sort();
  }, []);

  const emisorasFiltradas = useMemo(() => {
    const qEm = busqEmisora.trim().toLowerCase();
    return ESTACIONES_147.filter(e => {
      if (filtroPlaza !== 'Todas' && e.plaza !== filtroPlaza) return false;
      if (filtroCategoria !== 'todas' && e.categoria !== filtroCategoria) return false;
      if (soloConAudio && !e.streamUrl) return false;
      const enVivo = sesiones.some(s => s.emisora_nombre.includes(e.siglas) || s.emisora_nombre.includes(e.nombre));
      if (filtroEstado === 'envivo' && !enVivo) return false;
      if (filtroEstado === 'libres' && enVivo) return false;

      if (!qEm) return true;
      const hay = `${e.siglas} ${e.nombre} ${e.dial} ${e.grupo} ${e.plaza} ${e.categoria} ${e.ciudad}`.toLowerCase();
      return hay.includes(qEm);
    });
  }, [busqEmisora, filtroPlaza, filtroCategoria, soloConAudio, filtroEstado, sesiones]);

  const EMISORAS_POR_PAG = 20; // 4 columnas x 5 filas
  const totalPagsEmisoras = Math.max(1, Math.ceil(emisorasFiltradas.length / EMISORAS_POR_PAG));
  const pagEmisoraActual = Math.min(pagEmisoras, totalPagsEmisoras);
  const emisorasVisibles = verTodasEmisoras
    ? emisorasFiltradas
    : emisorasFiltradas.slice((pagEmisoraActual - 1) * EMISORAS_POR_PAG, pagEmisoraActual * EMISORAS_POR_PAG);

  const panelEmisoras = (
    <div style={{ ...cardStyle, padding: isMobile ? '16px' : '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Audio oculto para preview */}
      <audio
        ref={audioPreviewRef}
        muted={previewMute}
        onEnded={() => { setPreviewUrl(null); setPreviewNombre(''); }}
        onError={() => {}}
      />

      {/* Barra de Reproducción Activa si el usuario está escuchando un stream */}
      {previewUrl && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(219, 242, 133, 0.15) 0%, rgba(17, 24, 39, 0.95) 100%)',
          border: `1px solid ${colores.primarioVivo}`,
          borderRadius: 14,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(219, 242, 133, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colores.primarioVivo
            }}>
              <Radio size={18} className="animate-pulse" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 800, background: colores.primarioVivo, color: '#0f172a', padding: '2px 6px', borderRadius: 4 }}>
                  EN VIVO
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF' }}>
                  {previewNombre}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: '#94A3B8' }}>
                Reproducción de audio en tiempo real desde el servidor de transmisión
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setPreviewMute(!previewMute)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                borderRadius: 8,
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11.5,
                fontWeight: 600
              }}
            >
              {previewMute ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {previewMute ? 'Desmutear' : 'Silencio'}
            </button>
            <button
              onClick={() => {
                setPreviewUrl(null);
                setPreviewNombre('');
                if (audioPreviewRef.current) {
                  audioPreviewRef.current.pause();
                  audioPreviewRef.current.src = '';
                }
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                color: '#F87171',
                borderRadius: 8,
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11.5,
                fontWeight: 700
              }}
            >
              <Square size={12} fill="currentColor" /> Detener
            </button>
          </div>
        </div>
      )}

      {/* Encabezado: Título + Buscador */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: colores.textoClaro, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Radio size={19} color={colores.primarioVivo} /> Emisoras On-Air
          </h2>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: colores.primarioVivo,
            background: 'rgba(219, 242, 133, 0.15)',
            border: '1px solid rgba(219, 242, 133, 0.3)',
            padding: '2px 9px',
            borderRadius: 999
          }}>
            {emisorasFiltradas.length} de 147
          </span>
        </div>

        {/* Input de búsqueda */}
        <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '0 1 320px' }}>
          <Search size={14} color={colores.textoOscuro} style={{ position: 'absolute', left: 12, top: 11, pointerEvents: 'none' }} />
          <input
            value={busqEmisora}
            onChange={e => { setBusqEmisora(e.target.value); setPagEmisoras(1); }}
            placeholder="Buscar por nombre, dial o siglas..."
            style={{
              ...inputStyle,
              width: '100%',
              padding: '9px 12px 9px 34px',
              borderRadius: 10,
              fontSize: 13
            }}
          />
          {busqEmisora && (
            <button
              onClick={() => { setBusqEmisora(''); setPagEmisoras(1); }}
              style={{
                position: 'absolute',
                right: 10,
                top: 9,
                background: 'none',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Fila de Filtros: Plazas, Audio en Vivo, Categoría */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        paddingTop: 8,
        borderTop: `1px solid ${colores.borde}`
      }}>
        {/* Plazas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11.5, color: colores.textoOscuro, fontWeight: 600, marginRight: 2 }}>Plaza:</span>
          {(['Todas', 'CDMX', 'Guadalajara', 'Monterrey'] as const).map(p => {
            const count = p === 'Todas' ? 147 : p === 'CDMX' ? 62 : p === 'Guadalajara' ? 45 : 40;
            const activo = filtroPlaza === p;
            return (
              <button
                key={p}
                onClick={() => { setFiltroPlaza(p); setPagEmisoras(1); }}
                style={{
                  padding: '4px 11px',
                  borderRadius: 999,
                  fontSize: 11.5,
                  fontWeight: activo ? 700 : 500,
                  cursor: 'pointer',
                  border: activo ? `1px solid ${colores.primarioVivo}` : `1px solid ${colores.borde}`,
                  background: activo ? 'rgba(219, 242, 133, 0.2)' : colores.fondoSecundario,
                  color: activo ? colores.primarioVivo : colores.textoMedio,
                  transition: 'all 0.15s'
                }}
              >
                {p} ({count})
              </button>
            );
          })}
        </div>

        {/* Formatos y Filtros de Audio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Botón solo con audio en vivo */}
          <button
            onClick={() => { setSoloConAudio(!soloConAudio); setPagEmisoras(1); }}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              border: soloConAudio ? '1px solid #34D399' : `1px solid ${colores.borde}`,
              background: soloConAudio ? 'rgba(52, 211, 153, 0.18)' : colores.fondoSecundario,
              color: soloConAudio ? '#34D399' : colores.textoMedio,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: soloConAudio ? '#34D399' : '#64748B' }} />
            Con audio en vivo
          </button>

          {/* Formato / Categoría */}
          <select
            value={filtroCategoria}
            onChange={e => { setFiltroCategoria(e.target.value); setPagEmisoras(1); }}
            style={{
              padding: '5px 10px',
              borderRadius: 8,
              fontSize: 11.5,
              cursor: 'pointer',
              border: `1px solid ${colores.borde}`,
              background: colores.fondoSecundario,
              color: colores.textoClaro,
              outline: 'none'
            }}
          >
            <option value="todas">Todos los formatos</option>
            {categoriasUnicas.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cuadrícula de 4 Columnas Fiel al Diseño de Referencia */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
        gap: 12
      }}>
        {emisorasVisibles.map(est => {
          const seleccionada = (est.streamUrl && emisoraUrl === est.streamUrl) || emisoraNombre.startsWith(est.nombre);
          const enVivo = sesiones.some(s => s.emisora_nombre.includes(est.siglas) || s.emisora_nombre.includes(est.nombre));
          const estaReproduciendoEste = previewUrl === est.streamUrl;

          return (
            <div
              key={est.id}
              onClick={() => seleccionarEmisora(est)}
              style={{
                background: seleccionada
                  ? 'rgba(219, 242, 133, 0.12)'
                  : 'rgba(17, 24, 39, 0.75)',
                border: seleccionada
                  ? `1.5px solid ${colores.primarioVivo}`
                  : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: seleccionada
                  ? '0 0 16px rgba(219, 242, 133, 0.22)'
                  : '0 4px 12px rgba(0, 0, 0, 0.25)',
                borderRadius: 14,
                padding: '11px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.18s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Logo circular con contenedor blanco idéntico a la referencia */}
              <LogoEmisoraCircular emisora={est} />

              {/* Información: Nombre y Frecuencia arriba, Categoría abajo */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  letterSpacing: '-0.01em'
                }} title={`${est.nombre} ${est.dial}`}>
                  {est.nombre} {est.dial}
                </div>
                <div style={{
                  fontSize: 11.5,
                  color: '#94A3B8',
                  textTransform: 'lowercase',
                  marginTop: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>{est.categoria}</span>
                  {enVivo && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#34D399',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
                      on-air
                    </span>
                  )}
                </div>
              </div>

              {/* Botón de reproducción en vivo en tarjeta si tiene stream */}
              {est.streamUrl && (
                <button
                  onClick={(e) => handleTogglePreview(e, est)}
                  title={estaReproduciendoEste ? 'Detener transmisión' : 'Escuchar transmisión en vivo'}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: estaReproduciendoEste ? '#DC2626' : 'rgba(219, 242, 133, 0.15)',
                    border: estaReproduciendoEste ? '1px solid #EF4444' : '1px solid rgba(219, 242, 133, 0.35)',
                    color: estaReproduciendoEste ? '#FFFFFF' : colores.primarioVivo,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s'
                  }}
                >
                  {estaReproduciendoEste ? <Square size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" style={{ marginLeft: 1 }} />}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Sin resultados */}
      {emisorasVisibles.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '36px 16px',
          color: colores.textoOscuro
        }}>
          <Radio size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: colores.textoClaro }}>
            No se encontraron emisoras con esos filtros
          </div>
          <button
            onClick={() => {
              setBusqEmisora('');
              setFiltroPlaza('Todas');
              setFiltroCategoria('todas');
              setSoloConAudio(false);
              setFiltroEstado('todas');
              setPagEmisoras(1);
            }}
            style={{
              marginTop: 10,
              padding: '6px 14px',
              borderRadius: 8,
              border: `1px solid ${colores.borde}`,
              background: colores.fondoSecundario,
              color: colores.primarioVivo,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Restablecer filtros
          </button>
        </div>
      )}

      {/* Paginación y control de visualización */}
      {emisorasFiltradas.length > EMISORAS_POR_PAG && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingTop: 10,
          borderTop: `1px solid ${colores.borde}`
        }}>
          <div style={{ fontSize: 12, color: colores.textoOscuro }}>
            Mostrando {verTodasEmisoras ? `1 - ${emisorasFiltradas.length}` : `${(pagEmisoraActual - 1) * EMISORAS_POR_PAG + 1} - ${Math.min(pagEmisoraActual * EMISORAS_POR_PAG, emisorasFiltradas.length)}`} de {emisorasFiltradas.length} estaciones
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setVerTodasEmisoras(!verTodasEmisoras)}
              style={{
                ...btnStyle,
                padding: '5px 12px',
                fontSize: 11.5,
                background: verTodasEmisoras ? 'rgba(219, 242, 133, 0.15)' : colores.fondoSecundario,
                color: verTodasEmisoras ? colores.primarioVivo : colores.textoMedio,
                borderColor: verTodasEmisoras ? colores.primarioVivo : colores.borde
              }}
            >
              {verTodasEmisoras ? 'Mostrar en páginas de 20' : 'Ver todas (147)'}
            </button>

            {!verTodasEmisoras && (
              <>
                <button
                  onClick={() => setPagEmisoras(p => Math.max(1, p - 1))}
                  disabled={pagEmisoraActual === 1}
                  aria-label="Página anterior"
                  style={{ ...btnStyle, padding: 6, opacity: pagEmisoraActual === 1 ? 0.35 : 1 }}
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from({ length: totalPagsEmisoras }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPagEmisoras(n)}
                    style={{
                      ...chipStyle(n === pagEmisoraActual),
                      borderRadius: 8,
                      minWidth: 30,
                      padding: '4px 8px',
                      fontSize: 11.5
                    }}
                  >
                    {n}
                  </button>
                ))}

                <button
                  onClick={() => setPagEmisoras(p => Math.min(totalPagsEmisoras, p + 1))}
                  disabled={pagEmisoraActual === totalPagsEmisoras}
                  aria-label="Página siguiente"
                  style={{ ...btnStyle, padding: 6, opacity: pagEmisoraActual === totalPagsEmisoras ? 0.35 : 1 }}
                >
                  <ChevronRight size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
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
              boxShadow: '0 4px 14px rgba(114, 144, 19, 0.35)',
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
          <button onClick={exportarReporte} disabled={testigosFiltrados.length === 0 || exportando}
            style={{ ...btnStyle, opacity: (testigosFiltrados.length === 0 || exportando) ? 0.5 : 1, cursor: (testigosFiltrados.length === 0 || exportando) ? 'not-allowed' : 'pointer' }}>
            <Download size={13} /> {exportando ? 'Exportando…' : 'Exportar'}
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
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(219, 242, 133,0.15)', border: `1px solid ${colores.primarioVivo}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 20px rgba(219, 242, 133,0.25)' }}>
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
