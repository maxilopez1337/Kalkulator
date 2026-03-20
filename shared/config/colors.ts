/**
 * Brand color constants — single source of truth for TypeScript/React code.
 *
 * NOTE: index.html mirrors these values in:
 *   - Tailwind v3 CDN config  (window.tailwind.config)
 *   - Tailwind v4 @theme block
 *   - CSS fallback classes (.bg-brand, .text-brand, …)
 * Keep them in sync when changing brand colors.
 */
export const COLORS = {
  // --- DARK NAVY (brand / nav / dark panels) ---
  brand: '#001433',
  brandHover: '#00245b',

  // --- M365 INTERACTIVE BLUE (buttons, links, active states) ---
  blue: '#0078d4',
  blueHover: '#106ebe',
  blueLight: '#deecf9',
  blueBg: '#eff6fc',

  // --- SEMANTIC: SUCCESS / SAVINGS ---
  success: '#107c10',
  successBg: '#e6f3e6',

  // --- SEMANTIC: WARNING / PROWIZJA ---
  warning: '#d47500',
  warningBg: '#fef3e6',

  // --- SEMANTIC: DANGER / DELETE ---
  danger: '#d83b01',
  dangerBg: '#fde7e2',

  // --- SEMANTIC: ERROR (validation fields) ---
  error: '#a80000',
  errorBg: '#fde7e9',

  // --- NEUTRAL SURFACE ---
  background: '#f3f2f1',
  surface: '#ffffff',
  surfaceSubtle: '#f8f7f6',
  border: '#edebe9',
  borderStrong: '#c8c6c4',

  // --- TEXT ---
  text: '#201f1e',
  textPrimary: '#323130',
  textSecondary: '#605e5c',
  textMuted: '#a19f9d',
  textDisabled: '#c8c6c4',
} as const;
