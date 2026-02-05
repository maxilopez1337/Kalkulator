
export const theme = {
  colors: {
    primary: 'slate-900',
    secondary: 'white',
    accent: 'emerald-600',
    background: 'gray-50', // #f3f2f1 equivalent logic
    border: 'slate-200',
    text: {
      primary: 'slate-900',
      secondary: 'slate-600',
      muted: 'slate-400',
      inverted: 'white'
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
    primary: 'bg-[#001433] text-white hover:bg-[#00245b] shadow-sm',
    // Secondary: Biały z wyraźnym borderem
    secondary: 'bg-white text-[#201f1e] border border-[#8a8886] hover:bg-[#f3f2f1] shadow-sm',
    danger: 'bg-[#fdf3f4] text-[#a80000] border border-[#a80000] hover:bg-[#f9e5e8]',
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
      primary: 'bg-[#eff6fc] text-[#0078d4] border-[#c7e0f4]', // Fluent Blue styling
      secondary: 'bg-[#f3f2f1] text-[#323130] border-[#e1dfdd]',
      success: 'bg-[#dff6dd] text-[#107c10] border-[#bad80a]',
      warning: 'bg-[#fff4ce] text-[#797775] border-[#fde7e9] text-amber-800', // Adjusted
      error: 'bg-[#fde7e9] text-[#a80000] border-[#a80000]',
      neutral: 'bg-[#f3f2f1] text-[#605e5c] border-[#edebe9]'
    }
  }
};
