
import { COLORS } from './colors';

export const theme = {
  colors: {
    // Fluent neutral border
    borderDefault: '#edebe9',
    borderStrong: '#c8c6c4',
    // Surfaces
    background: '#f3f2f1',
    surface: '#ffffff',
    surfaceSubtle: '#f8f7f6',
    // Brand navy (left nav, dark panels)
    brand: COLORS.brand,
    brandHover: COLORS.brandHover,
    // M365 interactive blue
    blue: COLORS.blue,
    blueHover: COLORS.blueHover,
    blueLight: COLORS.blueLight,
    blueBg: COLORS.blueBg,
    // Semantic
    success: COLORS.success,
    successBg: COLORS.successBg,
    warning: COLORS.warning,
    warningBg: COLORS.warningBg,
    danger: COLORS.danger,
    dangerBg: COLORS.dangerBg,
    error: COLORS.error,
    errorBg: COLORS.errorBg,
    // Text scale
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textSecondary,
      muted: COLORS.textMuted,
      disabled: COLORS.textDisabled,
      inverted: '#ffffff'
    }
  },
  layout: {
    // Tło #f3f2f1 (Dynamics gray), font Segoe/System
    pageContainer: 'min-h-screen font-sans text-[#201f1e] bg-[#f3f2f1] relative overflow-hidden',
    mainContent: 'max-w-[1600px] mx-auto px-4 py-6 md:px-8',
    // Sekcja jako karta z ostrymi rogami i delikatnym borderem
    section: 'p-5 bg-white rounded-md border border-[#edebe9] shadow-sm'
  },
  card: {
    // Fluent UI Elevation (Shadow 4) + ostre rogi (rounded-md = 6px lub rounded-sm = 4px)
    base: 'bg-white rounded-md shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] border border-[#edebe9] overflow-hidden flex flex-col',
    // Płaski nagłówek karty, bez tła, tylko border
    header: 'flex items-center justify-between px-6 py-4 border-b border-[#edebe9] bg-white flex-shrink-0 min-h-[60px]',
    body: 'p-6',
    noPaddingBody: ''
  },
  input: {
    // Ostre rogi (rounded-sm), ciemniejszy border przy focusie, płaski design
    base: 'w-full px-3 py-2 text-[14px] border border-[#8a8886] rounded-sm outline-none bg-white transition-all hover:border-[#323130] focus:border-[#0078d4] focus:border-2 focus:px-[11px] focus:py-[7px] disabled:bg-[#f3f2f1] disabled:text-[#a19f9d] placeholder:text-[#605e5c]',
    error: 'border-[#a80000] focus:border-[#a80000]',
    success: 'border-[#107c10] focus:border-[#107c10]',
    sm: 'px-2 py-1 text-xs',
    search: 'pl-9', 
  },
  button: {
    // Przyciski ostre, techniczne
    base: 'flex items-center justify-center gap-2 font-semibold rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
    // Primary: Dynamics Blue lub Dark Navy (zależnie od brandu, tu Dark Navy dla spójności)
    primary: 'bg-brand text-white hover:bg-brand-hover shadow-sm',
    // Secondary: Biały z wyraźnym borderem
    secondary: 'bg-white text-[#201f1e] border border-[#8a8886] hover:bg-[#f3f2f1] shadow-sm',
    danger: 'bg-[#fde7e2] text-[#d83b01] border border-[#d83b01] hover:bg-[#fbd4c8]',
    sizes: {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm', // Mniejszy padding w pionie (compact)
      lg: 'px-6 py-2.5 text-sm'
    }
  },
  typography: {
    h1: 'text-lg font-bold text-[#201f1e]', // Mniejszy, bardziej techniczny nagłówek
    h2: 'text-base font-bold text-[#323130]',
    label: 'text-[14px] font-semibold text-[#323130] mb-1.5 block',
    hint: 'text-xs text-[#605e5c] mt-1 block'
  },
  badge: {
    base: 'px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wide border',
    variants: {
      primary: 'bg-[#eff6fc] text-[#0078d4] border-[#c7e0f4]',
      secondary: 'bg-[#f3f2f1] text-[#323130] border-[#e1dfdd]',
      success: 'bg-[#e6f3e6] text-[#107c10] border-[#9fd89f]',
      warning: 'bg-[#fef3e6] text-[#d47500] border-[#fde5c4]',
      danger: 'bg-[#fde7e2] text-[#d83b01] border-[#f0937a]',
      error: 'bg-[#fde7e9] text-[#a80000] border-[#c8a0a0]',
      neutral: 'bg-[#f3f2f1] text-[#605e5c] border-[#edebe9]'
    }
  }
};

/** Shared spacing tokens — use instead of ad-hoc p-4/p-5/p-6 values */
export const spacing = {
  cardPadding: 'p-6',
  cardPaddingMobile: 'p-4 md:p-6',
  sectionGap: 'gap-6',
  sectionGapMobile: 'gap-4 md:gap-6',
} as const;

/** Shared animation tokens — standardises duration across components */
export const animations = {
  quick: 'duration-200',
  standard: 'duration-300',
  slow: 'duration-500',
  fadeIn: 'animate-in fade-in zoom-in-95 duration-300',
} as const;

/** Fluent UI shadow tokens — use instead of inline shadow strings */
export const shadow = {
  /** Elevation 4 — cards, tiles */
  elevation4: 'shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)]',
  /** Elevation 8 — dropdowns, menus */
  elevation8: 'shadow-[0_3.2px_7.2px_0_rgba(0,0,0,0.13),0_0.6px_1.8px_0_rgba(0,0,0,0.11)]',
  /** Elevation 16 — modals, dialogs */
  elevation16: 'shadow-[0_6.4px_14.4px_0_rgba(0,0,0,0.13),0_1.2px_3.6px_0_rgba(0,0,0,0.10)]',
} as const;

/** Border-radius tokens — use instead of ad-hoc rounded-* values */
export const radius = {
  /** 4px — badges, tags, inline elements */
  badge: 'rounded-sm',
  /** 6px — cards, panels, inputs */
  card: 'rounded-md',
  /** 9999px — pills, avatars */
  pill: 'rounded-full',
} as const;
