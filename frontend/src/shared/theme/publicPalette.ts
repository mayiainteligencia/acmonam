/**
 * Paleta de las pantallas públicas (landing y login) para código que dibuja en
 * canvas/WebGL y no puede leer variables CSS. Debe mantenerse alineada con
 * `shared/styles/publicTheme.css`.
 */
export const publicPalette = {
  accent: '#DBF285',
  accentBright: '#EDFBC1',
  accentDeep: '#729013',
  /** Color base del humo WebGL del login. */
  smoke: '#729013',
  /** RGB de acento para componer rgba() en canvas. */
  accentRgb: '219, 242, 133',
  accentDeepRgb: '114, 144, 19',
  textRgb: '226, 232, 240',
} as const;

