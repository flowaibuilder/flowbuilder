import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, ChevronRight, ChevronLeft, Check, Sparkles, Globe, Palette, FileText, Rocket, Zap } from 'lucide-react';

const ACCENT = '#d4f000';

// ─── STEP DATA ────────────────────────────────────────────────────────────────

const GOALS = [
  { id: 'leads',        label: 'Get customers / leads',  icon: '🎯' },
  { id: 'sell',         label: 'Sell products',           icon: '🛒' },
  { id: 'services',     label: 'Showcase services',       icon: '⚡' },
  { id: 'portfolio',    label: 'Portfolio',               icon: '🎨' },
  { id: 'appointments', label: 'Book appointments',       icon: '📅' },
  { id: 'info',         label: 'Provide information',     icon: '📖' },
];

const CTAS = [
  { id: 'contact',  label: 'Contact us' },
  { id: 'buy',      label: 'Buy now' },
  { id: 'consult',  label: 'Book a consultation' },
  { id: 'quote',    label: 'Request a quote' },
  { id: 'signup',   label: 'Sign up' },
  { id: 'call',     label: 'Call us' },
];

// CTA suggestions per goal
const CTA_FOR_GOAL = {
  leads:        ['contact', 'quote', 'consult'],
  sell:         ['buy', 'signup'],
  services:     ['contact', 'quote', 'consult'],
  portfolio:    ['contact', 'consult'],
  appointments: ['consult', 'call', 'contact'],
  info:         ['contact', 'signup'],
};

const ALL_PAGES = [
  { id: 'home',         label: 'Home',         always: true },
  { id: 'about',        label: 'About' },
  { id: 'services',     label: 'Services' },
  { id: 'products',     label: 'Products' },
  { id: 'pricing',      label: 'Pricing' },
  { id: 'portfolio',    label: 'Portfolio' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'blog',         label: 'Blog' },
  { id: 'contact',      label: 'Contact' },
  { id: 'faq',          label: 'FAQ' },
];

// AI page recommendations per goal
const PAGES_FOR_GOAL = {
  leads:        ['home', 'services', 'about', 'testimonials', 'faq', 'contact'],
  sell:         ['home', 'products', 'pricing', 'testimonials', 'contact'],
  services:     ['home', 'services', 'about', 'testimonials', 'faq', 'contact'],
  portfolio:    ['home', 'portfolio', 'about', 'testimonials', 'contact'],
  appointments: ['home', 'services', 'faq', 'contact'],
  info:         ['home', 'about', 'blog', 'faq', 'contact'],
};

const FEELS = [
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'minimal',      label: 'Minimal',      icon: '◻️' },
  { id: 'luxury',       label: 'Luxury',       icon: '✨' },
  { id: 'friendly',     label: 'Friendly',     icon: '😊' },
  { id: 'bold',         label: 'Bold',         icon: '💥' },
  { id: 'futuristic',   label: 'Futuristic',   icon: '🚀' },
  { id: 'playful',      label: 'Playful',      icon: '🎨' },
];

// Themes grouped by feel — each feel has its own curated palette
const THEMES_BY_FEEL = {
  professional: [
    { id: 'pro-corporate',  name: 'Corporate',    colors: { primary: '#1a56db', secondary: '#374151', background: '#ffffff' } },
    { id: 'pro-slate',      name: 'Slate',        colors: { primary: '#0f172a', secondary: '#64748b', background: '#f8fafc' } },
    { id: 'pro-navy',       name: 'Navy',         colors: { primary: '#ffffff', secondary: '#94a3b8', background: '#0f172a' } },
  ],
  minimal: [
    { id: 'min-snow',       name: 'Snow',         colors: { primary: '#111111', secondary: '#999999', background: '#ffffff' } },
    { id: 'min-cloud',      name: 'Cloud',        colors: { primary: '#1a1a2e', secondary: '#a0a0b0', background: '#f5f5f7' } },
    { id: 'min-ink',        name: 'Ink',          colors: { primary: '#e0e0e0', secondary: '#555555', background: '#121212' } },
  ],
  luxury: [
    { id: 'lux-gold',       name: 'Gold & Black', colors: { primary: '#d4af37', secondary: '#1a1a1a', background: '#0a0a0a' } },
    { id: 'lux-rose',       name: 'Rose Gold',    colors: { primary: '#b76e79', secondary: '#2d2d2d', background: '#fdf8f5' } },
    { id: 'lux-royal',      name: 'Royal',        colors: { primary: '#c9a94e', secondary: '#1e1e3f', background: '#0d0d1a' } },
  ],
  friendly: [
    { id: 'fri-warm',       name: 'Warm Sunset',  colors: { primary: '#f97316', secondary: '#7c3aed', background: '#fffbf5' } },
    { id: 'fri-fresh',      name: 'Fresh Green',  colors: { primary: '#16a34a', secondary: '#475569', background: '#f0fdf4' } },
    { id: 'fri-sky',        name: 'Sky Blue',     colors: { primary: '#0ea5e9', secondary: '#f59e0b', background: '#f0f9ff' } },
  ],
  bold: [
    { id: 'bold-neon',      name: 'Dark Bold',    colors: { primary: '#d4f000', secondary: '#222222', background: '#080808' } },
    { id: 'bold-brutal',    name: 'Neo Brutalism', colors: { primary: '#ff3366', secondary: '#00ccee', background: '#ffcc00' } },
    { id: 'bold-fire',      name: 'Fire',         colors: { primary: '#ef4444', secondary: '#f97316', background: '#18181b' } },
  ],
  futuristic: [
    { id: 'fut-cyber',      name: 'Cyberpunk',    colors: { primary: '#00ff00', secondary: '#ff00ff', background: '#0a0a2a' } },
    { id: 'fut-neon',       name: 'Neon Glow',    colors: { primary: '#06b6d4', secondary: '#8b5cf6', background: '#030712' } },
    { id: 'fut-matrix',     name: 'Matrix',       colors: { primary: '#22d3ee', secondary: '#10b981', background: '#0c0a09' } },
  ],
  playful: [
    { id: 'play-candy',     name: 'Candy Pop',    colors: { primary: '#ec4899', secondary: '#8b5cf6', background: '#fdf2f8' } },
    { id: 'play-retro',     name: 'Retro',        colors: { primary: '#e11d48', secondary: '#0d9488', background: '#fefce8' } },
    { id: 'play-neon',      name: 'Party Neon',   colors: { primary: '#a855f7', secondary: '#eab308', background: '#1e1b4b' } },
  ],
};

// Flat list of all themes for lookups
const ALL_THEMES = Object.values(THEMES_BY_FEEL).flat();

// Legacy IDs for backwards compat with AI suggestions
const LEGACY_THEME_MAP = {
  dark: 'bold-neon',
  modern: 'min-snow',
  brutalism: 'bold-brutal',
  elegant: 'lux-rose',
  cyberpunk: 'fut-cyber',
};

const FONTS = [
  { id: 'modern',  label: 'Modern' },
  { id: 'elegant', label: 'Elegant' },
  { id: 'bold',    label: 'Bold' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'ai',      label: '✨ Let AI decide' },
];

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────

const STEPS = [
  { icon: Zap,     label: 'Goal' },
  { icon: Globe,   label: 'Pages' },
  { icon: Palette, label: 'Brand' },
  { icon: Rocket,  label: 'Generate' },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-9 h-9 flex items-center justify-center border-2 transition-all duration-300"
                style={{
                  borderColor: done || active ? ACCENT : 'rgba(255,255,255,0.15)',
                  background: done ? ACCENT : active ? `${ACCENT}22` : 'transparent',
                }}
              >
                {done
                  ? <Check size={14} color="#080808" strokeWidth={3} />
                  : <Icon size={14} color={active ? ACCENT : 'rgba(255,255,255,0.3)'} />
                }
              </div>
              <span className="text-[10px] uppercase tracking-widest" style={{ color: active ? ACCENT : 'rgba(255,255,255,0.3)' }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-12 h-px mb-5 mx-1" style={{ background: i < current ? ACCENT : 'rgba(255,255,255,0.1)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── REUSABLE CHIP SELECTOR ───────────────────────────────────────────────────

function ChipSelector({ options, value, onChange, multi = false }) {
  const isSelected = (id) => multi ? (value || []).includes(id) : value === id;

  const toggle = (id) => {
    if (multi) {
      const cur = value || [];
      onChange(isSelected(id) ? cur.filter(x => x !== id) : [...cur, id]);
    } else {
      onChange(id);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.id}
          type="button"
          onClick={() => toggle(opt.id)}
          className="px-4 py-2 border text-sm font-medium transition-all duration-200 flex items-center gap-2"
          style={{
            borderColor: isSelected(opt.id) ? ACCENT : 'rgba(255,255,255,0.12)',
            background: isSelected(opt.id) ? `${ACCENT}18` : 'rgba(255,255,255,0.03)',
            color: isSelected(opt.id) ? ACCENT : 'rgba(255,255,255,0.6)',
          }}
        >
          {opt.icon && <span>{opt.icon}</span>}
          {opt.label}
          {isSelected(opt.id) && <Check size={12} strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}

// ─── STEP COMPONENTS ─────────────────────────────────────────────────────────

function StepGoal({ data, onChange, onSuggest, suggesting, suggestSuccess }) {
  return (
    <div className="space-y-7">
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Business Name</label>
        <input
          required
          type="text"
          value={data.name || ''}
          onChange={e => onChange({ name: e.target.value })}
          className="w-full px-4 py-3 border border-white/10 bg-white/5 text-white text-sm outline-none focus:border-[#d4f000] focus:bg-white/8 transition-all placeholder-white/20"
          placeholder="e.g. FLOW Solutions"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Industry</label>
        <input
          required
          type="text"
          value={data.industry || ''}
          onChange={e => onChange({ industry: e.target.value })}
          className="w-full px-4 py-3 border border-white/10 bg-white/5 text-white text-sm outline-none focus:border-[#d4f000] focus:bg-white/8 transition-all placeholder-white/20"
          placeholder="e.g. Technology, Architecture, Consulting"
        />
      </div>

      <div className="flex items-center gap-4 py-1">
        <button
          type="button"
          onClick={onSuggest}
          disabled={suggesting || !data.name.trim() || !data.industry.trim()}
          className="flex items-center gap-2 px-4 py-2 border text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
          style={{
            borderColor: ACCENT,
            color: '#080808',
            background: ACCENT,
          }}
        >
          {suggesting ? (
            <>
              <Loader2 size={12} className="animate-spin text-[#080808]" />
              AI Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={12} className="text-[#080808]" />
              ✨ AI Auto-fill rest of setup
            </>
          )}
        </button>
        {suggestSuccess && (
          <span className="text-xs text-[#d4f000] font-bold animate-pulse">
            ✓ Auto-filled branding & settings!
          </span>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Main Goal</label>
        <ChipSelector
          options={GOALS}
          value={data.goal}
          onChange={val => onChange({ goal: val })}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Target Audience</label>
        <input
          type="text"
          value={data.audience || ''}
          onChange={e => onChange({ audience: e.target.value })}
          className="w-full px-4 py-3 border border-white/10 bg-white/5 text-white text-sm outline-none focus:border-[#d4f000] transition-all placeholder-white/20"
          placeholder="e.g. Small business owners in India"
        />
      </div>

      {data.goal && (
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Primary CTA</label>
          <ChipSelector
            options={CTAS}
            value={data.cta}
            onChange={val => onChange({ cta: val })}
          />
        </div>
      )}
    </div>
  );
}

function StepPages({ data, onChange }) {
  const recommended = PAGES_FOR_GOAL[data.goal] || ['home', 'about', 'services', 'contact'];
  const pages = data.pages || recommended;

  const togglePage = (id) => {
    if (id === 'home') return; // always on
    onChange({ pages: pages.includes(id) ? pages.filter(p => p !== id) : [...pages, id] });
  };

  return (
    <div className="space-y-7">
      {/* AI Recommendation Banner */}
      <div
        className="flex items-start gap-3 p-4 border"
        style={{ borderColor: `${ACCENT}40`, background: `${ACCENT}08` }}
      >
        <Sparkles size={16} color={ACCENT} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: ACCENT }}>
            AI Recommended
          </p>
          <p className="text-white/50 text-sm">
            Based on your goal, we suggest: <span className="text-white/80">{recommended.map(id => ALL_PAGES.find(p => p.id === id)?.label).join(', ')}</span>
          </p>
          <button
            type="button"
            onClick={() => onChange({ pages: recommended })}
            className="mt-2 text-xs font-semibold uppercase tracking-widest underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Use recommendation →
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Select Pages</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALL_PAGES.map(page => {
            const selected = pages.includes(page.id);
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => togglePage(page.id)}
                disabled={page.always}
                className="flex items-center justify-between px-4 py-3 border text-sm font-medium transition-all duration-200 text-left disabled:opacity-50"
                style={{
                  borderColor: selected ? ACCENT : 'rgba(255,255,255,0.1)',
                  background: selected ? `${ACCENT}15` : 'rgba(255,255,255,0.03)',
                  color: selected ? ACCENT : 'rgba(255,255,255,0.55)',
                }}
              >
                {page.label}
                {selected && <Check size={13} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepBrand({ data, onChange }) {
  const selectedTheme = ALL_THEMES.find(t => t.id === (data.themeId || 'bold-neon')) || ALL_THEMES.find(t => t.id === (LEGACY_THEME_MAP[data.themeId] || 'bold-neon')) || ALL_THEMES[0];

  return (
    <div className="space-y-8">
      {/* Brand Logo */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Do you have a logo?</label>
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange({ logoSource: 'upload' })}
              className="px-4 py-2.5 border text-sm font-medium transition-all duration-200"
              style={{
                borderColor: data.logoSource === 'upload' ? ACCENT : 'rgba(255,255,255,0.1)',
                background: data.logoSource === 'upload' ? `${ACCENT}12` : 'rgba(255,255,255,0.03)',
                color: data.logoSource === 'upload' ? ACCENT : 'rgba(255,255,255,0.6)',
              }}
            >
              Upload logo
            </button>
            <button
              type="button"
              onClick={() => {
                // Generate a cool SVG logo using the business initials and theme colors
                const initials = (data.name || 'FL').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                const svgString = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23080808" stroke="${encodeURIComponent(selectedTheme.colors.primary)}" stroke-width="6"/><text x="50" y="58" font-family="monospace" font-size="36" font-weight="900" fill="${encodeURIComponent(selectedTheme.colors.primary)}" text-anchor="middle">${initials}</text></svg>`;
                onChange({ logoSource: 'generate', logo: svgString });
              }}
              className="px-4 py-2.5 border text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
              style={{
                borderColor: data.logoSource === 'generate' ? ACCENT : 'rgba(255,255,255,0.1)',
                background: data.logoSource === 'generate' ? `${ACCENT}12` : 'rgba(255,255,255,0.03)',
                color: data.logoSource === 'generate' ? ACCENT : 'rgba(255,255,255,0.6)',
              }}
            >
              ✨ Generate with AI
            </button>
            {data.logoSource !== 'none' && (
              <button
                type="button"
                onClick={() => onChange({ logoSource: 'none', logo: null })}
                className="px-4 py-2.5 text-sm font-medium text-white/40 hover:text-white/60 transition-all"
              >
                Clear
              </button>
            )}
          </div>

          {data.logoSource === 'upload' && (
            <div className="flex items-center gap-4">
              <label className="flex flex-col items-center justify-center w-28 h-28 border border-dashed border-white/20 hover:border-white/40 cursor-pointer bg-white/3 transition-all relative group">
                {data.logo ? (
                  <img src={data.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center text-center p-2">
                    <span className="text-xl mb-1">📁</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Select File</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        onChange({ logo: event.target.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
              <div className="text-xs text-white/40">
                <p className="font-semibold text-white/60 mb-0.5">Upload brand logo</p>
                <p>Supports PNG, JPG, SVG, or WEBP.</p>
              </div>
            </div>
          )}

          {data.logoSource === 'generate' && data.logo && (
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 border border-white/20 bg-white/3 p-2 flex items-center justify-center">
                <img src={data.logo} alt="Generated Logo" className="w-full h-full object-contain" />
              </div>
              <div className="text-xs text-white/40">
                <p className="font-semibold text-white/60 mb-0.5" style={{ color: ACCENT }}>✨ AI Logo Generated</p>
                <p>Created dynamic design using business initials and theme colors.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feel */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Website Feel</label>
        <ChipSelector
          options={FEELS}
          value={data.feel}
          onChange={val => {
            const feelThemes = THEMES_BY_FEEL[val] || [];
            const firstThemeId = feelThemes.length > 0 ? feelThemes[0].id : data.themeId;
            onChange({ feel: val, themeId: firstThemeId });
          }}
        />
      </div>

      {/* Theme — filtered by selected feel */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
          Color Theme {data.feel ? <span className="normal-case text-white/25">— for {data.feel}</span> : ''}
        </label>
        {!data.feel ? (
          <p className="text-xs text-white/30 italic">Select a website feel above to see matching themes.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {(THEMES_BY_FEEL[data.feel] || []).map(theme => (
              <button
                key={theme.id}
                type="button"
                onClick={() => onChange({ themeId: theme.id })}
                className="flex flex-col items-center p-3 border transition-all duration-200"
                style={{
                  borderColor: data.themeId === theme.id ? ACCENT : 'rgba(255,255,255,0.1)',
                  background: data.themeId === theme.id ? `${ACCENT}12` : 'rgba(255,255,255,0.03)',
                }}
              >
                <div className="w-full h-14 mb-2 relative overflow-hidden border border-white/10" style={{ background: theme.colors.background }}>
                  <div className="absolute top-0 left-0 w-1/3 h-full" style={{ background: theme.colors.primary }} />
                  <div className="absolute top-0 right-0 w-1/3 h-full" style={{ background: theme.colors.secondary }} />
                </div>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: data.themeId === theme.id ? ACCENT : 'rgba(255,255,255,0.4)' }}
                >
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Font */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Font Style</label>
        <ChipSelector
          options={FONTS}
          value={data.fontStyle}
          onChange={val => onChange({ fontStyle: val })}
        />
      </div>

      {/* Key differentiator */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">What makes you different? <span className="normal-case text-white/30">(optional)</span></label>
        <textarea
          rows={3}
          value={data.differentiator || ''}
          onChange={e => onChange({ differentiator: e.target.value })}
          className="w-full px-4 py-3 border border-white/10 bg-white/5 text-white text-sm outline-none focus:border-[#d4f000] transition-all placeholder-white/20 resize-none"
          placeholder="e.g. We build affordable AI solutions for small businesses."
        />
      </div>
    </div>
  );
}

function StepPreview({ data, onGenerate, loading, error }) {
  const theme = ALL_THEMES.find(t => t.id === data.themeId) || ALL_THEMES.find(t => t.id === (LEGACY_THEME_MAP[data.themeId] || 'bold-neon')) || ALL_THEMES[0];
  const pages = data.pages || ['home', 'about', 'services', 'contact'];
  const goal = GOALS.find(g => g.id === data.goal);
  const cta = CTAS.find(c => c.id === data.cta);

  const aiWillGenerate = [
    'Website layout & sections',
    'Copy & content per page',
    'Navigation structure',
    'Responsive design',
    'SEO metadata',
    'Micro-animations',
  ];

  return (
    <div className="space-y-6">
      <div
        className="p-6 border"
        style={{ borderColor: `${ACCENT}30`, background: `${ACCENT}06` }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Rocket size={16} color={ACCENT} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Your Website Plan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <Row label="Business" value={data.name || '—'} />
            <Row label="Industry" value={data.industry || '—'} />
            {goal && <Row label="Goal" value={`${goal.icon} ${goal.label}`} />}
            {cta && <Row label="CTA" value={cta.label} />}
            {data.feel && <Row label="Feel" value={data.feel} />}
            <Row label="Theme" value={theme?.name || '—'} />
            {data.fontStyle && <Row label="Font" value={data.fontStyle} />}
            {data.logo && (
              <div className="flex gap-3 items-center pt-1">
                <span className="text-xs text-white/35 uppercase tracking-widest w-16 shrink-0">Logo</span>
                <div className="w-8 h-8 border border-white/10 bg-white/5 p-1">
                  <img src={data.logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Pages</p>
            <div className="flex flex-wrap gap-1.5">
              {pages.map(id => {
                const page = ALL_PAGES.find(p => p.id === id);
                return page ? (
                  <span
                    key={id}
                    className="px-2.5 py-1 text-xs font-medium border"
                    style={{ borderColor: `${ACCENT}40`, color: ACCENT, background: `${ACCENT}10` }}
                  >
                    {page.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">AI will generate</p>
          <div className="grid grid-cols-2 gap-1.5">
            {aiWillGenerate.map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/60">
                <Check size={12} color={ACCENT} strokeWidth={3} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-500/30 bg-red-500/8 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onGenerate}
        disabled={loading}
        className="w-full font-bold py-4 px-6 flex justify-center items-center gap-3 transition-all duration-200 uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
        style={{ background: ACCENT, color: '#080808' }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Building your website...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate My Website
          </>
        )}
      </button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-3">
      <span className="text-xs text-white/35 uppercase tracking-widest w-16 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-white/80 font-medium">{value}</span>
    </div>
  );
}

// ─── MAIN QUESTIONNAIRE ───────────────────────────────────────────────────────

export default function Questionnaire({ onWebsiteGenerated }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '', industry: '', goal: '', audience: '', cta: '',
    pages: null, themeId: 'bold-neon', feel: '', fontStyle: 'ai', differentiator: '',
    logo: null, logoSource: 'none',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  
  const [savedWebsites, setSavedWebsites] = useState([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoadingWebsites(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('saved_websites')
          .select('id, name, updated_at, theme, config, spec')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
          
        if (error) throw error;
        setSavedWebsites(data || []);
      } catch (err) {
        console.error('Error fetching websites:', err);
      } finally {
        setLoadingWebsites(false);
      }
    };
    
    fetchWebsites();
  }, []);

  const handleSuggest = async () => {
    if (!data.name.trim() || !data.industry.trim()) return;
    setSuggesting(true);
    try {
      const response = await fetch('/api/suggest-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, industry: data.industry }),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to get suggestions');
      
      const sugg = resData.suggestions;
      const suggestedFeel = sugg.feel || data.feel;
      // Map legacy theme IDs from AI to new feel-based IDs
      let resolvedThemeId = sugg.themeId || data.themeId;
      if (LEGACY_THEME_MAP[resolvedThemeId]) {
        resolvedThemeId = LEGACY_THEME_MAP[resolvedThemeId];
      }
      // If the resolved theme doesn't exist in the suggested feel, pick the first one
      const feelThemes = THEMES_BY_FEEL[suggestedFeel] || [];
      if (feelThemes.length > 0 && !feelThemes.find(t => t.id === resolvedThemeId)) {
        resolvedThemeId = feelThemes[0].id;
      }
      setData(d => ({
        ...d,
        goal: sugg.goal || d.goal,
        audience: sugg.audience || d.audience,
        cta: sugg.cta || d.cta,
        feel: suggestedFeel,
        themeId: resolvedThemeId,
        fontStyle: sugg.fontStyle || d.fontStyle,
        differentiator: sugg.differentiator || d.differentiator,
      }));
      setSuggestSuccess(true);
      setTimeout(() => setSuggestSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to get AI suggestions: ' + err.message);
    } finally {
      setSuggesting(false);
    }
  };

  // When goal changes, reset pages to AI recommendation
  useEffect(() => {
    if (data.goal && data.pages === null) {
      setData(d => ({ ...d, pages: PAGES_FOR_GOAL[d.goal] || ['home', 'about', 'services', 'contact'] }));
    }
  }, [data.goal]);

  const update = (patch) => setData(d => ({ ...d, ...patch }));

  const canNext = () => {
    if (step === 0) return data.name.trim() && data.industry.trim() && data.goal;
    if (step === 1) return (data.pages || []).length > 0;
    if (step === 2) return true;
    return false;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    const theme = ALL_THEMES.find(t => t.id === data.themeId) || ALL_THEMES.find(t => t.id === (LEGACY_THEME_MAP[data.themeId] || 'bold-neon')) || ALL_THEMES[0];

    const payload = {
      name: data.name,
      industry: data.industry,
      description: [
        data.audience && `Target audience: ${data.audience}`,
        data.goal && `Main goal: ${GOALS.find(g => g.id === data.goal)?.label}`,
        data.cta && `Primary CTA: ${CTAS.find(c => c.id === data.cta)?.label}`,
        data.feel && `Website feel: ${data.feel}`,
        data.fontStyle && data.fontStyle !== 'ai' && `Font style: ${data.fontStyle}`,
        data.differentiator && `Unique value: ${data.differentiator}`,
      ].filter(Boolean).join('. '),
      pages: data.pages || ['home', 'about', 'services', 'contact'],
      feel: data.feel,
      fontStyle: data.fontStyle,
      cta: CTAS.find(c => c.id === data.cta)?.label || '',
      theme: theme.colors,
      logo: data.logo,
    };

    try {
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to generate website');

      onWebsiteGenerated(resData.spec, theme.colors, data.name, data.pages || [], data.logo, data.feel, data.fontStyle);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full max-w-7xl mx-auto">
      {/* Left Column: Saved Projects */}
      <div className="lg:col-span-4 bg-[#0e0e0e] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Globe size={18} className="text-[#d4f000]" /> Saved Projects
        </h3>
        
        {loadingWebsites ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 size={24} className="animate-spin text-[#d4f000]" />
          </div>
        ) : savedWebsites.length > 0 ? (
          <div className="space-y-3">
            {savedWebsites.map(site => (
              <button
                key={site.id}
                onClick={() => {
                  if (onWebsiteGenerated) {
                    onWebsiteGenerated(
                      site.spec,
                      site.theme,
                      site.config?.businessName || site.name,
                      site.config?.pages,
                      site.config?.logo,
                      site.config?.feel,
                      site.config?.fontStyle,
                      site.id
                    );
                  }
                }}
                className="w-full text-left p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-[#d4f000]/30 transition-all rounded-lg group"
              >
                <h4 className="text-sm font-bold text-white mb-1 group-hover:text-[#d4f000] transition-colors">{site.name}</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Updated: {new Date(site.updated_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-white/[0.02] border border-white/5 rounded-lg">
            <p className="text-xs text-white/40">No saved projects yet.</p>
          </div>
        )}
      </div>

      {/* Right Column: Questionnaire */}
      <div className="lg:col-span-8 p-8 sm:p-10 bg-[#0e0e0e] border border-white/10 rounded-xl relative overflow-hidden">
        {/* Accent glow */}
        <div
          className="absolute top-0 right-0 w-[360px] h-[360px] rounded-full blur-3xl opacity-[0.06] pointer-events-none"
          style={{ background: ACCENT }}
        />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-light text-white uppercase tracking-wider">
            Build your <span className="font-bold" style={{ color: ACCENT }}>AI Website</span>
          </h2>
          <p className="text-white/35 text-sm mt-1">Answer a few questions — AI does the rest.</p>
        </div>

        <StepIndicator current={step} />

        {/* Step content */}
        <div className="min-h-[280px]">
          {step === 0 && (
            <StepGoal
              data={data}
              onChange={update}
              onSuggest={handleSuggest}
              suggesting={suggesting}
              suggestSuccess={suggestSuccess}
            />
          )}
          {step === 1 && <StepPages data={data} onChange={update} />}
          {step === 2 && <StepBrand data={data} onChange={update} />}
          {step === 3 && (
            <StepPreview
              data={data}
              onGenerate={handleGenerate}
              loading={loading}
              error={error}
            />
          )}
        </div>

        {/* Navigation */}
        {step < 3 && (
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/8">
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/40 hover:text-white/70 transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft size={16} /> Back
            </button>

            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:-translate-y-0.5"
              style={{ background: canNext() ? ACCENT : 'rgba(255,255,255,0.1)', color: canNext() ? '#080808' : 'rgba(255,255,255,0.4)' }}
            >
              {step === 2 ? 'Preview' : 'Continue'} <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 pt-4 border-t border-white/8">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-sm text-white/35 hover:text-white/60 transition-colors"
            >
              <ChevronLeft size={14} /> Back to Brand
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
