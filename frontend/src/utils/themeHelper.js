export function getStyles(feel) {
  // Styles for the section container
  const container = (() => {
    switch (feel) {
      case 'professional':
        return 'bg-bg-base py-24 px-6 border-b border-current/10 font-sans relative overflow-hidden';
      case 'minimal':
        return 'bg-bg-base py-24 px-6 border-b border-current/5 font-sans relative';
      case 'luxury':
        return 'bg-bg-base py-28 px-6 border-b border-primary/20 font-serif relative overflow-hidden transition-colors duration-500';
      case 'friendly':
        return 'bg-bg-base py-24 px-6 border-b border-current/10 rounded-b-[48px] font-sans relative overflow-hidden';
      case 'futuristic':
        return 'bg-bg-base py-24 px-6 border-b border-primary/30 relative overflow-hidden font-mono';
      case 'playful':
        return 'bg-bg-base py-24 px-6 border-b-4 border-current/20 font-sans relative overflow-hidden';
      case 'bold': // Neo Brutalism
      default:
        return 'bg-bg-base py-24 px-6 border-b-4 border-current font-mono relative overflow-hidden';
    }
  })();

  // Styles for headings (headline / title)
  const heading = (() => {
    switch (feel) {
      case 'professional':
        return 'text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-current leading-[1.15]';
      case 'minimal':
        return 'text-3xl sm:text-5xl lg:text-6xl font-light tracking-tighter text-current leading-tight';
      case 'luxury':
        return 'text-4xl sm:text-5xl lg:text-7xl font-extralight tracking-tight font-serif text-current leading-[1.1] italic';
      case 'friendly':
        return 'text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-current leading-tight';
      case 'futuristic':
        return 'text-4xl sm:text-5xl lg:text-6xl font-black tracking-wider uppercase text-current leading-tight';
      case 'playful':
        return 'text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-current leading-tight rotate-[-0.5deg]';
      case 'bold':
      default:
        return 'text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight uppercase border-4 border-current bg-white text-black inline-block px-6 py-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] rotate-[-1deg]';
    }
  })();

  // Styles for secondary headings/taglines
  const subheading = (() => {
    switch (feel) {
      case 'professional':
        return 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary mb-4 border border-primary/20';
      case 'minimal':
        return 'inline-flex items-center gap-1.5 text-xs tracking-[0.2em] uppercase font-mono opacity-60 mb-3';
      case 'luxury':
        return 'inline-flex items-center gap-2 px-4 py-1.5 rounded-none text-[11px] font-medium uppercase tracking-[0.25em] text-primary bg-primary/10 border border-primary/40 mb-6 shadow-sm font-sans';
      case 'friendly':
        return 'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase text-primary bg-primary/15 mb-4 border border-primary/20';
      case 'futuristic':
        return 'inline-flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-mono font-bold tracking-widest uppercase text-primary bg-primary/10 border border-primary/40 mb-4 shadow-[0_0_15px_rgba(34,211,238,0.2)]';
      case 'playful':
        return 'inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-xs font-black tracking-wider uppercase text-primary bg-primary/15 border-2 border-primary/30 mb-4 shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]';
      case 'bold':
      default:
        return 'inline-block text-xs font-black tracking-widest uppercase bg-secondary text-black px-3 py-1.5 border-2 border-current shadow-[3px_3px_0_0_rgba(0,0,0,1)] mb-4';
    }
  })();

  // Styles for paragraph / body text
  const body = (() => {
    switch (feel) {
      case 'professional':
        return 'text-base sm:text-lg opacity-80 leading-relaxed font-sans max-w-2xl font-normal';
      case 'minimal':
        return 'text-sm sm:text-base opacity-75 font-light leading-relaxed max-w-xl';
      case 'luxury':
        return 'text-base sm:text-lg opacity-85 leading-relaxed font-sans font-light max-w-2xl tracking-wide';
      case 'friendly':
        return 'text-base sm:text-lg opacity-85 leading-relaxed font-medium max-w-xl';
      case 'futuristic':
        return 'text-sm sm:text-base opacity-80 leading-relaxed font-sans font-light max-w-xl tracking-wide';
      case 'playful':
        return 'text-base opacity-90 leading-relaxed font-semibold max-w-xl';
      case 'bold':
      default:
        return 'text-lg font-bold leading-8 text-black bg-white border-2 border-current p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] max-w-xl rotate-[0.5deg]';
    }
  })();

  // Card element styles
  const card = (() => {
    switch (feel) {
      case 'professional':
        return 'bg-current/[0.03] hover:bg-current/[0.06] p-6 sm:p-8 rounded-2xl border border-current/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm';
      case 'minimal':
        return 'bg-current/[0.02] hover:bg-current/[0.04] p-6 sm:p-8 rounded-none transition-all duration-300 border border-current/10 hover:border-current/30';
      case 'luxury':
        return 'group bg-gradient-to-b from-current/[0.04] to-current/[0.01] hover:from-current/[0.08] hover:to-current/[0.03] p-6 sm:p-9 border border-primary/30 hover:border-primary/70 rounded-none transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 relative backdrop-blur-md';
      case 'friendly':
        return 'bg-current/[0.04] hover:bg-current/[0.08] p-6 sm:p-8 rounded-3xl shadow-lg shadow-current/[0.03] border border-current/10 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 backdrop-blur-sm';
      case 'futuristic':
        return 'bg-current/[0.02] hover:bg-current/[0.05] p-6 sm:p-8 border border-primary/30 rounded-lg relative overflow-hidden group hover:border-primary hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] transition-all duration-300 backdrop-blur-md';
      case 'playful':
        return 'bg-current/[0.04] hover:bg-current/[0.07] p-6 sm:p-8 border-2 border-current rounded-3xl shadow-[5px_5px_0_0_rgba(0,0,0,0.15)] hover:-translate-y-1.5 hover:shadow-[7px_7px_0_0_rgba(0,0,0,0.2)] transition-all duration-200';
      case 'bold':
      default:
        return 'bg-white p-6 sm:p-8 border-4 border-current shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all text-black';
    }
  })();

  // Primary Button style
  const button = (() => {
    switch (feel) {
      case 'professional':
        return 'inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-xl text-white bg-primary hover:opacity-95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md border border-white/10 cursor-pointer';
      case 'minimal':
        return 'inline-flex items-center justify-center px-8 py-3.5 text-xs tracking-[0.15em] uppercase text-white bg-primary hover:opacity-90 transition-all rounded-none font-medium shadow-xs cursor-pointer';
      case 'luxury':
        return 'inline-flex items-center justify-center px-9 py-4 text-xs font-bold uppercase tracking-[0.2em] text-black bg-primary hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] font-sans transition-all duration-300 rounded-none border border-primary shadow-lg cursor-pointer';
      case 'friendly':
        return 'inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white bg-primary hover:opacity-95 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 rounded-full shadow-lg shadow-primary/25 cursor-pointer';
      case 'futuristic':
        return 'inline-flex items-center justify-center px-8 py-3.5 text-xs tracking-widest font-black uppercase text-black bg-primary hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-sm border border-primary cursor-pointer';
      case 'playful':
        return 'inline-flex items-center justify-center px-8 py-4 text-sm font-black text-white bg-primary hover:opacity-95 border-2 border-current shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] transition-all duration-150 rounded-2xl cursor-pointer';
      case 'bold':
      default:
        return 'rounded-none bg-primary px-9 py-4 text-lg font-black text-black border-4 border-current shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all uppercase cursor-pointer';
    }
  })();

  // Secondary Button style
  const buttonSec = (() => {
    switch (feel) {
      case 'professional':
        return 'inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-xl border border-current/20 hover:bg-current/10 hover:border-current/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 backdrop-blur-sm cursor-pointer';
      case 'minimal':
        return 'inline-flex items-center justify-center px-8 py-3.5 text-xs tracking-[0.15em] uppercase border border-current/25 hover:bg-current/5 transition-all rounded-none font-medium cursor-pointer';
      case 'luxury':
        return 'inline-flex items-center justify-center px-9 py-4 text-xs font-bold uppercase tracking-[0.2em] text-current border border-primary/50 hover:border-primary hover:bg-primary/10 font-sans transition-all duration-300 rounded-none backdrop-blur-md cursor-pointer';
      case 'friendly':
        return 'inline-flex items-center justify-center px-8 py-4 text-sm font-bold bg-current/5 hover:bg-current/10 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 rounded-full cursor-pointer';
      case 'futuristic':
        return 'inline-flex items-center justify-center px-8 py-3.5 text-xs tracking-widest font-bold uppercase border border-primary/50 text-current hover:bg-primary/15 hover:border-primary transition-all duration-200 rounded-sm backdrop-blur-md cursor-pointer';
      case 'playful':
        return 'inline-flex items-center justify-center px-8 py-4 text-sm font-black bg-secondary hover:opacity-95 border-2 border-current shadow-[4px_4px_0_0_rgba(0,0,0,0.15)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all rounded-2xl text-black cursor-pointer';
      case 'bold':
      default:
        return 'rounded-none bg-white px-9 py-4 text-lg font-black text-black border-4 border-current shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all uppercase cursor-pointer';
    }
  })();

  // Badge / Pill style
  const badge = (() => {
    switch (feel) {
      case 'professional':
        return 'inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-xs tracking-wide';
      case 'minimal':
        return 'inline-flex items-center px-3 py-1 text-[10px] tracking-[0.2em] uppercase border border-current/20 opacity-75';
      case 'luxury':
        return 'inline-flex items-center px-4 py-1.5 border border-primary/40 text-[10px] tracking-[0.2em] uppercase text-primary bg-primary/10 rounded-none backdrop-blur-xs font-sans font-medium';
      case 'friendly':
        return 'inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/25';
      case 'futuristic':
        return 'inline-flex items-center px-3 py-1 border border-primary text-[10px] tracking-widest uppercase text-primary bg-primary/10 rounded-sm';
      case 'playful':
        return 'inline-flex items-center px-4 py-1.5 bg-primary/15 text-xs font-black text-primary rounded-2xl border-2 border-primary/30';
      case 'bold':
      default:
        return 'inline-flex items-center px-3 py-1 border-2 border-current bg-secondary text-xs font-black text-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)]';
    }
  })();

  const grid = 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3';

  return {
    container,
    heading,
    subheading,
    body,
    card,
    button,
    buttonSec,
    badge,
    grid,
  };
}
