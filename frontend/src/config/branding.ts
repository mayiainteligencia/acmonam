import logoMayia from '../assets/logo/mayiaEscuchaTrim.png';

export const brandingConfig = {
  empresa: {
    nombre: "MAYIA Escucha",
    eslogan: "Monitoreo inteligente de medios",
    logo: logoMayia,
  },

  colores: {
    primario: "#729013",           // Verde MAYIA
    primarioVivo: "#DBF285",       // Azul celeste / cian luminoso para HUD y números
    primarioOscuro: "#5B7410",     // Azul profundo
    primarioClaro: "rgba(219, 242, 133, 0.12)", // Tinte azul traslúcido

    secundario: "#020503",         // Navy oscuro base
    acento: "#DBF285",             // Acento luminoso sobre fondos oscuros
    acentoOscuro: "#729013",

    peligro: "#EF4444",
    advertencia: "#F59E0B",
    exito: "#10B981",

    fondoPrincipal: "#030704",      // Fondo Deep Navy elegante
    fondoSecundario: "#0A170E",     // Tarjetas Navy Glass con profundidad
    fondoTerciario: "#112417",      // Hovers y elementos secundarios
    fondoClaro: "#0A170E",

    textoClaro: "#FFFFFF",         // Texto blanco puro de máximo contraste
    textoMedio: "#D1D5DB",         // Gris claro legible
    textoOscuro: "#9CA3AF",         // Metadatos y etiquetas
    textoEnOscuro: "#FFFFFF",

    borde: "rgba(219, 242, 133, 0.16)", // Borde azul neón sutil
    bordeHover: "rgba(219, 242, 133, 0.40)",

    gradientePrimario: "linear-gradient(135deg, #729013 0%, #5B7410 100%)",
    gradienteSecundario: "linear-gradient(135deg, #030704 0%, #0A170E 100%)",
    gradienteAcento: "linear-gradient(135deg, rgba(219, 242, 133,0.2) 0%, rgba(114, 144, 19,0.05) 100%)",

    fondoGlass: "rgba(16, 31, 56, 0.85)",

    sombra: "0 4px 20px rgba(0, 0, 0, 0.35)",
    sombraMedia: "0 8px 30px rgba(0, 0, 0, 0.45)",
    sombraGrande: "0 14px 40px rgba(114, 144, 19, 0.15), 0 4px 12px rgba(0, 0, 0, 0.4)",
  },

  metricas: {
    empleados: 568,
    departamentos: 9,
    tareasCompletadas: 13,
    progreso: 70,
  },

  ia: {
    nombre: "MAYIA IA",
    modelo: "Gemini 2.5 Flash",
    habilitado: true,
  }
};

export type BrandingConfig = typeof brandingConfig;