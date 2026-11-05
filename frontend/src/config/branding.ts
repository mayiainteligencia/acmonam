export const brandingConfig = {
  empresa: {
    nombre: "ACAM",
    eslogan: "Auditoría y Monitoreo de Medios",
    logo: "/assets/logosNativos/logoAcam.png",
  },

  colores: {
    primario: "#0284C7",           // Azul corporativo ACAM
    primarioVivo: "#38BDF8",       // Azul celeste / cian luminoso para HUD y números
    primarioOscuro: "#0369A1",     // Azul profundo
    primarioClaro: "rgba(56, 189, 248, 0.12)", // Tinte azul traslúcido

    secundario: "#080F1E",         // Navy oscuro base
    acento: "#38BDF8",             // Acento luminoso sobre fondos oscuros
    acentoOscuro: "#0284C7",

    peligro: "#EF4444",
    advertencia: "#F59E0B",
    exito: "#10B981",

    fondoPrincipal: "#0A1325",      // Fondo Deep Navy elegante
    fondoSecundario: "#101F38",     // Tarjetas Navy Glass con profundidad
    fondoTerciario: "#162847",      // Hovers y elementos secundarios
    fondoClaro: "#101F38",

    textoClaro: "#FFFFFF",         // Texto blanco puro de máximo contraste
    textoMedio: "#CBD5E1",         // Gris claro legible
    textoOscuro: "#94A3B8",         // Metadatos y etiquetas
    textoEnOscuro: "#FFFFFF",

    borde: "rgba(56, 189, 248, 0.16)", // Borde azul neón sutil
    bordeHover: "rgba(56, 189, 248, 0.40)",

    gradientePrimario: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
    gradienteSecundario: "linear-gradient(135deg, #0A1325 0%, #101F38 100%)",
    gradienteAcento: "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(2,132,199,0.05) 100%)",

    fondoGlass: "rgba(16, 31, 56, 0.85)",

    sombra: "0 4px 20px rgba(0, 0, 0, 0.35)",
    sombraMedia: "0 8px 30px rgba(0, 0, 0, 0.45)",
    sombraGrande: "0 14px 40px rgba(2, 132, 199, 0.15), 0 4px 12px rgba(0, 0, 0, 0.4)",
  },

  metricas: {
    empleados: 568,
    departamentos: 9,
    tareasCompletadas: 13,
    progreso: 70,
  },

  ia: {
    nombre: "ACAM IA",
    modelo: "Gemini 2.5 Flash",
    habilitado: true,
  }
};

export type BrandingConfig = typeof brandingConfig;