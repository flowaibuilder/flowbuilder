export function getStyles(feel) {
  // Styles for the section container
  const container = (() => {
    switch (feel) {
      case 'professional':
        return 'bg-bg-base text-slate-800 py-24 px-6 border-b border-current/10 font-sans';
      case 'minimal':
        return 'bg-bg-base text-neutral-900 py-24 px-6 border-b border-current/5 font-sans';
      case 'luxury':
        return 'bg-bg-base text-amber-50 py-24 px-6 border-b border-current/10 font-serif';
      case 'friendly':
        return 'bg-bg-base text-slate-800 py-20 px-6 border-b border-current/5 rounded-b-[40px] font-sans';
      case 'futuristic':
        return 'bg-bg-base text-slate-100 py-20 px-6 border-b border-current/10 relative overflow-hidden font-sans';
      case 'playful':
        return 'bg-bg-base text-indigo-950 py-20 px-6 border-b-2 border-current/10 font-sans';
      case 'bold': // Neo Brutalism
        return 'bg-bg-base text-black py-20 px-6 border-b-4 border-current font-mono';
      default:
        // Default fallback to Neo Brutalism if unspecified
        return 'bg-bg-base text-black py-20 px-6 border-b-4 border-current font-mono';
    }
  })();

  // Styles for headings (headline / title)
  const heading = (() => {
    switch (feel) {
      case 'professional':
        return 'text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl';
      case 'minimal':
        return 'text-3xl font-light tracking-tight text-neutral-950 sm:text-5xl uppercase';
      case 'luxury':
        return 'text-4xl font-semibold tracking-wide text-amber-100 sm:text-6xl italic font-serif';
      case 'friendly':
        return 'text-3xl font-black tracking-tight text-slate-900 sm:text-5xl';
      case 'futuristic':
        return 'text-3xl font-extrabold tracking-widest text-white sm:text-5xl uppercase bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent';
      case 'playful':
        return 'text-3xl font-black tracking-tight text-indigo-950 sm:text-5xl rotate-[-0.5deg]';
      case 'bold':
      default:
        return 'text-4xl font-black tracking-tight text-black sm:text-6xl uppercase border-4 border-current bg-white inline-block px-6 py-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] rotate-[-1deg]';
    }
  })();

  // Styles for secondary headings/taglines
  const subheading = (() => {
    switch (feel) {
      case 'professional':
        return 'text-xs font-semibold tracking-wider uppercase text-primary mb-2';
      case 'minimal':
        return 'text-xs tracking-widest uppercase text-neutral-400 mb-1';
      case 'luxury':
        return 'text-xs tracking-widest uppercase text-amber-400/80 mb-3';
      case 'friendly':
        return 'text-xs font-bold tracking-wider uppercase text-emerald-600 mb-2';
      case 'futuristic':
        return 'text-xs font-semibold tracking-widest uppercase text-primary mb-2';
      case 'playful':
        return 'text-xs font-bold tracking-wider uppercase text-pink-500 mb-2';
      case 'bold':
      default:
        return 'text-xs font-black tracking-wider uppercase text-current mb-2';
    }
  })();

  // Styles for paragraph / body text
  const body = (() => {
    switch (feel) {
      case 'professional':
        return 'text-base text-slate-600 leading-relaxed font-sans max-w-xl';
      case 'minimal':
        return 'text-sm text-neutral-500 font-light leading-relaxed max-w-xl';
      case 'luxury':
        return 'text-sm text-amber-50/60 leading-relaxed font-sans font-light max-w-xl';
      case 'friendly':
        return 'text-base text-slate-600 leading-relaxed font-medium max-w-xl';
      case 'futuristic':
        return 'text-sm text-slate-400 leading-relaxed font-light max-w-xl';
      case 'playful':
        return 'text-sm text-indigo-900/70 leading-relaxed font-medium max-w-xl';
      case 'bold':
      default:
        return 'text-lg font-bold leading-8 text-black bg-white border-2 border-current p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] max-w-xl rotate-[1deg]';
    }
  })();

  // Card element styles
  const card = (() => {
    switch (feel) {
      case 'professional':
        return 'bg-white/80 dark:bg-black/40 p-6 rounded-xl border border-current/10 shadow-sm hover:shadow-md transition-shadow';
      case 'minimal':
        return 'bg-current/[0.01] p-6 rounded-none transition-all hover:bg-current/[0.03] border border-current/5';
      case 'luxury':
        return 'bg-current/[0.02] p-8 border border-current/10 rounded-none transition-all hover:border-primary';
      case 'friendly':
        return 'bg-white/80 dark:bg-black/40 p-8 rounded-3xl shadow-lg shadow-current/[0.02] border border-current/5 hover:scale-[1.01] transition-transform duration-300';
      case 'futuristic':
        return 'bg-current/[0.02] p-6 border border-current/10 rounded-lg relative overflow-hidden group hover:border-primary hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300';
      case 'playful':
        return 'bg-white/90 dark:bg-black/60 p-6 border-2 border-current rounded-2xl shadow-[4px_4px_0_0_rgba(79,70,229,0.3)] hover:-translate-y-1 transition-all duration-200';
      case 'bold':
      default:
        return 'bg-white p-6 border-4 border-current shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all';
    }
  })();

  // Primary Button style
  const button = (() => {
    switch (feel) {
      case 'professional':
        return 'inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg text-white bg-primary hover:opacity-90 transition-all shadow-sm';
      case 'minimal':
        return 'inline-flex items-center justify-center px-6 py-2.5 text-xs tracking-widest uppercase text-white bg-primary hover:opacity-90 transition-colors rounded-none font-medium';
      case 'luxury':
        return 'inline-flex items-center justify-center px-8 py-3 text-xs tracking-widest uppercase text-white bg-primary hover:opacity-90 font-sans font-bold transition-colors rounded-none border border-primary';
      case 'friendly':
        return 'inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-white bg-primary hover:opacity-90 transition-colors rounded-full shadow-md shadow-primary/20';
      case 'futuristic':
        return 'inline-flex items-center justify-center px-6 py-3 text-xs tracking-wider font-bold uppercase text-white bg-primary hover:opacity-90 transition-colors rounded-none border border-primary shadow-[0_0_10px_rgba(255,255,255,0.1)]';
      case 'playful':
        return 'inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-primary hover:opacity-90 border-2 border-current shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] transition-all rounded-xl';
      case 'bold':
      default:
        return 'rounded-none bg-primary px-8 py-3 text-xl font-black text-black border-4 border-current shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all uppercase';
    }
  })();

  // Secondary Button style
  const buttonSec = (() => {
    switch (feel) {
      case 'professional':
        return 'inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg border border-current/25 text-current bg-transparent hover:bg-current/5 transition-all';
      case 'minimal':
        return 'inline-flex items-center justify-center px-6 py-2.5 text-xs tracking-widest uppercase border border-current/20 text-current bg-transparent hover:bg-current/5 transition-colors rounded-none';
      case 'luxury':
        return 'inline-flex items-center justify-center px-8 py-3 text-xs tracking-widest uppercase border border-current/25 text-current bg-transparent hover:bg-current/5 font-sans font-medium transition-colors rounded-none';
      case 'friendly':
        return 'inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-current bg-current/5 hover:bg-current/10 transition-colors rounded-full';
      case 'futuristic':
        return 'inline-flex items-center justify-center px-6 py-3 text-xs tracking-wider font-bold uppercase border border-current/20 text-current bg-transparent hover:bg-current/10 transition-colors rounded-none';
      case 'playful':
        return 'inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-current bg-secondary hover:opacity-90 border-2 border-current shadow-[3px_3px_0_0_rgba(0,0,0,0.1)] transition-all rounded-xl';
      case 'bold':
      default:
        return 'rounded-none bg-white px-8 py-3 text-xl font-black text-black border-4 border-current shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all uppercase';
    }
  })();

  // Badge / Pill style
  const badge = (() => {
    switch (feel) {
      case 'professional':
        return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary';
      case 'minimal':
        return 'inline-flex items-center text-[10px] tracking-widest uppercase opacity-50';
      case 'luxury':
        return 'inline-flex items-center px-3 py-1 border border-primary text-[10px] tracking-widest uppercase text-primary rounded-none';
      case 'friendly':
        return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary';
      case 'futuristic':
        return 'inline-flex items-center px-2 py-0.5 border border-primary text-[10px] tracking-widest uppercase text-primary bg-primary/5';
      case 'playful':
        return 'inline-flex items-center px-3 py-1 bg-primary/10 text-xs font-bold text-primary rounded-full border border-primary/20';
      case 'bold':
      default:
        return 'inline-flex items-center px-3 py-1 border-2 border-current bg-secondary text-xs font-black text-black uppercase';
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
