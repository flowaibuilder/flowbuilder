import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, ChevronRight, ChevronLeft, Check, Sparkles, Globe, Palette, FileText, Rocket, Zap } from 'lucide-react';

const ACCENT = '#d4f000';

// ─── STEP DATA ────────────────────────────────────────────────────────────────

const GOALS = [
  { id: 'leads', label: 'Get customers / leads', icon: '' },
  { id: 'sell', label: 'Sell products', icon: '🛒' },
  { id: 'services', label: 'Showcase services', icon: '' },
  { id: 'portfolio', label: 'Portfolio', icon: '' },
  { id: 'appointments', label: 'Book appointments', icon: '' },
  { id: 'info', label: 'Provide information', icon: '' },
];

const CTAS = [
  { id: 'contact', label: 'Contact us' },
  { id: 'buy', label: 'Buy now' },
  { id: 'consult', label: 'Book a consultation' },
  { id: 'quote', label: 'Request a quote' },
  { id: 'signup', label: 'Sign up' },
  { id: 'call', label: 'Call us' },
];

// CTA suggestions per goal
const CTA_FOR_GOAL = {
  leads: ['contact', 'quote', 'consult'],
  sell: ['buy', 'signup'],
  services: ['contact', 'quote', 'consult'],
  portfolio: ['contact', 'consult'],
  appointments: ['consult', 'call', 'contact'],
  info: ['contact', 'signup'],
};

const ALL_PAGES = [
  { id: 'home', label: 'Home', always: true },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'products', label: 'Products' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
  { id: 'faq', label: 'FAQ' },
];

// AI page recommendations per goal
const PAGES_FOR_GOAL = {
  leads: ['home', 'services', 'about', 'testimonials', 'faq', 'contact'],
  sell: ['home', 'products', 'pricing', 'testimonials', 'contact'],
  services: ['home', 'services', 'about', 'testimonials', 'faq', 'contact'],
  portfolio: ['home', 'portfolio', 'about', 'testimonials', 'contact'],
  appointments: ['home', 'services', 'faq', 'contact'],
  info: ['home', 'about', 'blog', 'faq', 'contact'],
};

const FEELS = [
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'minimal', label: 'Minimal', icon: '◻️' },
  { id: 'luxury', label: 'Luxury', icon: '✨' },
  { id: 'friendly', label: 'Friendly', icon: '😊' },
  { id: 'bold', label: 'Bold', icon: '💥' },
  { id: 'futuristic', label: 'Futuristic', icon: '🚀' },
  { id: 'playful', label: 'Playful', icon: '🎨' },
];

// Themes grouped by feel — each feel has its own curated palette
const THEMES_BY_FEEL = {
  professional: [
    { id: 'pro-corporate', name: 'Corporate', colors: { primary: '#1a56db', secondary: '#374151', background: '#ffffff' } },
    { id: 'pro-slate', name: 'Slate', colors: { primary: '#0f172a', secondary: '#64748b', background: '#f8fafc' } },
    { id: 'pro-navy', name: 'Navy', colors: { primary: '#ffffff', secondary: '#94a3b8', background: '#0f172a' } },
  ],
  minimal: [
    { id: 'min-snow', name: 'Snow', colors: { primary: '#111111', secondary: '#999999', background: '#ffffff' } },
    { id: 'min-cloud', name: 'Cloud', colors: { primary: '#1a1a2e', secondary: '#a0a0b0', background: '#f5f5f7' } },
    { id: 'min-ink', name: 'Ink', colors: { primary: '#e0e0e0', secondary: '#555555', background: '#121212' } },
  ],
  luxury: [
    { id: 'lux-gold', name: 'Gold & Black', colors: { primary: '#d4af37', secondary: '#1a1a1a', background: '#0a0a0a' } },
    { id: 'lux-rose', name: 'Rose Gold', colors: { primary: '#b76e79', secondary: '#2d2d2d', background: '#fdf8f5' } },
    { id: 'lux-royal', name: 'Royal', colors: { primary: '#c9a94e', secondary: '#1e1e3f', background: '#0d0d1a' } },
  ],
  friendly: [
    { id: 'fri-warm', name: 'Warm Sunset', colors: { primary: '#f97316', secondary: '#7c3aed', background: '#fffbf5' } },
    { id: 'fri-fresh', name: 'Fresh Green', colors: { primary: '#16a34a', secondary: '#475569', background: '#f0fdf4' } },
    { id: 'fri-sky', name: 'Sky Blue', colors: { primary: '#0ea5e9', secondary: '#f59e0b', background: '#f0f9ff' } },
  ],
  bold: [
    { id: 'bold-neon', name: 'Dark Bold', colors: { primary: '#d4f000', secondary: '#222222', background: '#080808' } },
    { id: 'bold-brutal', name: 'Neo Brutalism', colors: { primary: '#ff3366', secondary: '#00ccee', background: '#ffcc00' } },
    { id: 'bold-fire', name: 'Fire', colors: { primary: '#ef4444', secondary: '#f97316', background: '#18181b' } },
  ],
  futuristic: [
    { id: 'fut-cyber', name: 'Cyberpunk', colors: { primary: '#00ff00', secondary: '#ff00ff', background: '#0a0a2a' } },
    { id: 'fut-neon', name: 'Neon Glow', colors: { primary: '#06b6d4', secondary: '#8b5cf6', background: '#030712' } },
    { id: 'fut-matrix', name: 'Matrix', colors: { primary: '#22d3ee', secondary: '#10b981', background: '#0c0a09' } },
  ],
  playful: [
    { id: 'play-candy', name: 'Candy Pop', colors: { primary: '#ec4899', secondary: '#8b5cf6', background: '#fdf2f8' } },
    { id: 'play-retro', name: 'Retro', colors: { primary: '#e11d48', secondary: '#0d9488', background: '#fefce8' } },
    { id: 'play-neon', name: 'Party Neon', colors: { primary: '#a855f7', secondary: '#eab308', background: '#1e1b4b' } },
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
  { id: 'modern', label: 'Modern' },
  { id: 'elegant', label: 'Elegant' },
  { id: 'bold', label: 'Bold' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'ai', label: '✨ Let AI decide' },
];

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────

const STEPS = [
  { icon: Zap, label: 'Goal' },
  { icon: Globe, label: 'Sections' },
  { icon: Palette, label: 'Brand' },
  { icon: Rocket, label: 'Generate' },
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
              AI Auto-fill rest of setup
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
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Select Sections</label>
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

// ─── LIVE THEME PREVIEW ────────────────────────────────────────────────────────

// Maps feel to actual CSS font families used in themeHelper.js
const FEEL_FONT_MAP = {
  professional: "'Inter', 'Segoe UI', sans-serif",
  minimal:      "'Inter', 'Segoe UI', sans-serif",
  luxury:       "'Georgia', 'Times New Roman', serif",
  friendly:     "'Inter', 'Segoe UI', sans-serif",
  futuristic:   "'Inter', 'Segoe UI', sans-serif",
  playful:      "'Inter', 'Segoe UI', sans-serif",
  bold:         "'Courier New', 'Courier', monospace",
};

// Maps fontStyle chip selection to explicit font family override
const FONTSTYLE_MAP = {
  modern:  "'Inter', 'Segoe UI', sans-serif",
  elegant: "'Georgia', 'Playfair Display', serif",
  bold:    "'Courier New', monospace",
  minimal: "'Inter', Arial, sans-serif",
};

// Per-feel style parameters to match themeHelper.js output
function getFeelStyle(feel, primary, secondary, background, bgText, bgTextMuted, priText) {
  const seoBright = (hex) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!r) return 128;
    return (parseInt(r[1], 16) * 299 + parseInt(r[2], 16) * 587 + parseInt(r[3], 16) * 114) / 1000;
  };

  const base = {
    headlineFontWeight: 900,
    headlineFontSize: 15,
    headlineTransform: 'none',
    headlineLetterSpacing: 0,
    headlineColor: bgText,
    bodyWeight: 400,
    bodyItalic: false,
    cardBorderRadius: 4,
    cardBorder: `1px solid rgba(255,255,255,0.08)`,
    cardBackground: `${primary}08`,
    cardShadow: 'none',
    btnBorderRadius: 3,
    btnBorder: 'none',
    btnShadow: 'none',
    navBackground: `${primary}18`,
    badgeBorder: `1px solid ${primary}40`,
    badgeBorderRadius: 3,
    taglineTransform: 'uppercase',
    taglineWeight: 700,
    taglineSize: 7.5,
  };

  switch (feel) {
    case 'professional':
      return { ...base, cardBorderRadius: 12, cardShadow: '0 1px 4px rgba(0,0,0,0.15)', btnBorderRadius: 8, headlineFontWeight: 700, headlineLetterSpacing: -0.5, badgeBorderRadius: 999, taglineWeight: 600, bodyWeight: 400 };
    case 'minimal':
      return { ...base, cardBorderRadius: 0, cardBorder: `1px solid ${primary}15`, headlineFontWeight: 300, headlineTransform: 'uppercase', headlineLetterSpacing: 1.5, btnBorderRadius: 0, taglineWeight: 400, bodyWeight: 300 };
    case 'luxury':
      return { ...base, cardBorderRadius: 0, cardBorder: `1px solid ${primary}30`, headlineFontWeight: 600, headlineLetterSpacing: 2, bodyItalic: true, btnBorderRadius: 0, taglineWeight: 400, taglineTransform: 'uppercase', badgeBorderRadius: 0, bodyWeight: 300 };
    case 'friendly':
      return { ...base, cardBorderRadius: 20, cardShadow: '0 4px 12px rgba(0,0,0,0.15)', btnBorderRadius: 999, headlineFontWeight: 900, badgeBorderRadius: 999, bodyWeight: 500 };
    case 'futuristic':
      return { ...base, cardBorderRadius: 6, cardBorder: `1px solid ${primary}30`, cardShadow: `0 0 12px ${primary}15`, btnBorderRadius: 0, headlineFontWeight: 800, headlineTransform: 'uppercase', headlineLetterSpacing: 2, btnShadow: `0 0 8px ${primary}40`, bodyWeight: 300 };
    case 'playful':
      return { ...base, cardBorderRadius: 16, cardBorder: `2px solid ${primary}40`, cardShadow: `3px 3px 0 ${primary}40`, btnBorderRadius: 12, headlineFontWeight: 900, headlineLetterSpacing: -0.5, bodyWeight: 500 };
    case 'bold':
    default:
      return { ...base, cardBorderRadius: 0, cardBorder: `3px solid ${bgText}`, cardShadow: `5px 5px 0 ${bgText}`, btnBorderRadius: 0, btnBorder: `3px solid ${bgText}`, btnShadow: `4px 4px 0 ${bgText}`, headlineFontWeight: 900, headlineTransform: 'uppercase', headlineLetterSpacing: 0, bodyWeight: 700, taglineWeight: 900 };
  }
}

function ThemePreview({ colors, businessName, feel, fontStyle }) {
  const name = businessName || 'Your Business';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const { primary, secondary, background } = colors;

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
  };
  const brightness = ([r, g, b]) => (r * 299 + g * 587 + b * 114) / 1000;
  const bgBright = brightness(hexToRgb(background));
  const priBright = brightness(hexToRgb(primary));
  const secBright = brightness(hexToRgb(secondary));
  const bgText = bgBright > 128 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.92)';
  const bgTextMuted = bgBright > 128 ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)';
  const priText = priBright > 128 ? '#080808' : '#ffffff';
  const secText = secBright > 128 ? '#080808' : '#ffffff';

  // Determine font family — fontStyle chip takes priority, else feel-based
  const fontFamily = (fontStyle && fontStyle !== 'ai' && FONTSTYLE_MAP[fontStyle])
    ? FONTSTYLE_MAP[fontStyle]
    : (FEEL_FONT_MAP[feel] || "'Inter', system-ui, sans-serif");

  const fs = getFeelStyle(feel, primary, secondary, background, bgText, bgTextMuted, priText);

  return (
    <div
      style={{
        background,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        fontFamily,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Navbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px',
        background: fs.navBackground,
        borderBottom: `1px solid ${primary}30`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 22, height: 22, borderRadius: fs.cardBorderRadius / 2,
            background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 900, color: priText,
          }}>
            {initials}
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, color: bgText, letterSpacing: 0.5, fontFamily }}>
            {name.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {['Home', 'About', 'Services'].map(item => (
            <span key={item} style={{ fontSize: 7.5, color: bgTextMuted, fontWeight: 600, fontFamily }}>{item}</span>
          ))}
          <span style={{
            fontSize: 7.5, fontWeight: 800, color: priText,
            background: primary, padding: '2px 7px',
            borderRadius: fs.btnBorderRadius,
            border: fs.btnBorder, fontFamily,
          }}>Contact</span>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        padding: '22px 14px 18px',
        background: feel === 'futuristic'
          ? `linear-gradient(135deg, ${background} 0%, ${primary}20 100%)`
          : feel === 'bold'
            ? background
            : `linear-gradient(135deg, ${background} 0%, ${primary}12 100%)`,
        borderBottom: `1px solid ${primary}20`,
      }}>
        {/* Tagline badge */}
        <div style={{
          display: 'inline-block',
          fontSize: fs.taglineSize, fontWeight: fs.taglineWeight, letterSpacing: 1.5,
          color: primary, textTransform: fs.taglineTransform,
          marginBottom: 7,
          padding: '2px 8px',
          border: fs.badgeBorder,
          borderRadius: fs.badgeBorderRadius,
          fontFamily,
        }}>
          {feel ? `${feel.charAt(0).toUpperCase() + feel.slice(1)} Style` : 'Premium Design'}
        </div>

        <div style={{
          fontSize: fs.headlineFontSize, fontWeight: fs.headlineFontWeight,
          color: fs.headlineColor, lineHeight: 1.2, marginBottom: 7,
          maxWidth: 210, textTransform: fs.headlineTransform,
          letterSpacing: fs.headlineLetterSpacing,
          fontFamily,
          ...(feel === 'bold' ? { border: `3px solid ${bgText}`, padding: '5px 8px', boxShadow: `4px 4px 0 ${bgText}`, transform: 'rotate(-1deg)', display: 'inline-block', background: bgBright > 128 ? '#000' : '#fff', color: bgBright > 128 ? '#fff' : '#000' } : {}),
        }}>
          Grow Your Business with <span style={{ color: primary }}>Confidence</span>
        </div>

        <div style={{
          fontSize: 7.5, color: bgTextMuted, lineHeight: 1.5, maxWidth: 185, marginBottom: 12,
          fontWeight: fs.bodyWeight, fontStyle: fs.bodyItalic ? 'italic' : 'normal', fontFamily,
          ...(feel === 'bold' ? { fontWeight: 700, border: `2px solid ${bgText}`, padding: '4px 6px', boxShadow: '3px 3px 0 rgba(0,0,0,0.5)', background: bgBright > 128 ? '#000' : '#fff', color: bgBright > 128 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' } : {}),
        }}>
          Professional solutions for {name}. We deliver results that matter.
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <div style={{
            background: primary, color: priText,
            fontSize: 8, fontWeight: 800, padding: '5px 12px',
            borderRadius: fs.btnBorderRadius, letterSpacing: 0.5,
            border: fs.btnBorder, boxShadow: fs.btnShadow, fontFamily,
            textTransform: feel === 'minimal' || feel === 'futuristic' || feel === 'bold' ? 'uppercase' : 'none',
          }}>Get Started →</div>
          <div style={{
            border: `1px solid ${primary}50`, color: primary,
            fontSize: 8, fontWeight: 700, padding: '5px 10px',
            borderRadius: fs.btnBorderRadius, fontFamily,
            ...(feel === 'bold' ? { border: `2px solid ${bgText}`, boxShadow: `3px 3px 0 ${bgText}`, color: bgText } : {}),
          }}>Learn More</div>
        </div>
      </div>

      {/* Features Row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: feel === 'bold' ? 4 : 1, padding: feel === 'bold' ? 4 : 1,
        background: feel === 'bold' ? background : `${primary}12`,
        borderBottom: `1px solid ${primary}18`,
      }}>
        {['Fast Results', 'Expert Team', 'Full Support'].map((f) => (
          <div key={f} style={{
            background,
            padding: '9px 7px',
            textAlign: 'center',
            border: fs.cardBorder,
            borderRadius: fs.cardBorderRadius,
            boxShadow: fs.cardShadow,
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: feel === 'friendly' || feel === 'playful' ? '50%' : feel === 'bold' ? 0 : '50%',
              background: `${primary}20`, border: `1.5px solid ${primary}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 4px', fontSize: 8, color: primary,
              ...(feel === 'bold' ? { border: `2px solid ${bgText}`, boxShadow: `2px 2px 0 ${bgText}` } : {}),
            }}>★</div>
            <div style={{ fontSize: 7.5, fontWeight: fs.headlineFontWeight > 700 ? 700 : 600, color: bgText, marginBottom: 2, fontFamily }}>{f}</div>
            <div style={{ fontSize: 6.5, color: bgTextMuted, lineHeight: 1.4, fontFamily }}>Quality for every client.</div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div style={{
        padding: '9px 14px',
        background: `${secondary}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 8.5, fontWeight: 800, color: bgText, fontFamily }}>Ready to get started?</div>
          <div style={{ fontSize: 7, color: bgTextMuted, fontFamily }}>Join hundreds of happy customers.</div>
        </div>
        <div style={{
          background: secondary, color: secText,
          fontSize: 7.5, fontWeight: 800, padding: '4px 10px',
          borderRadius: fs.btnBorderRadius, fontFamily,
          border: feel === 'bold' ? `2px solid ${bgText}` : 'none',
          boxShadow: feel === 'bold' ? `3px 3px 0 ${bgText}` : 'none',
        }}>Contact Us</div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '6px 14px',
        borderTop: `1px solid ${primary}20`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 7, color: bgTextMuted, fontFamily }}>© 2025 {name}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <span key={l} style={{ fontSize: 7, color: `${primary}80`, fontFamily }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STEP BRAND ────────────────────────────────────────────────────────────────

function StepBrand({ data, onChange }) {
  const [customColors, setCustomColors] = useState(
    data.customTheme || { primary: '#6366f1', secondary: '#ec4899', background: '#0f0f0f' }
  );
  const [showCustomPicker, setShowCustomPicker] = useState(data.themeId === 'custom');

  const selectedTheme =
    data.themeId === 'custom'
      ? { id: 'custom', name: 'Custom', colors: customColors }
      : ALL_THEMES.find(t => t.id === (data.themeId || 'bold-neon'))
        || ALL_THEMES.find(t => t.id === (LEGACY_THEME_MAP[data.themeId] || 'bold-neon'))
        || ALL_THEMES[0];

  const previewColors = data.themeId === 'custom' ? customColors : selectedTheme.colors;

  const updateCustomColor = (key, val) => {
    const updated = { ...customColors, [key]: val };
    setCustomColors(updated);
    onChange({ customTheme: updated });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
      {/* ── LEFT: form controls ── */}
      <div className="space-y-7">
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
                <label className="flex flex-col items-center justify-center w-24 h-24 border border-dashed border-white/20 hover:border-white/40 cursor-pointer bg-white/3 transition-all">
                  {data.logo ? (
                    <img src={data.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center text-center p-2">
                      <span className="text-xl mb-1">📁</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Select File</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => onChange({ logo: ev.target.result });
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" />
                </label>
                <div className="text-xs text-white/40">
                  <p className="font-semibold text-white/60 mb-0.5">Upload brand logo</p>
                  <p>Supports PNG, JPG, SVG, or WEBP.</p>
                </div>
              </div>
            )}

            {data.logoSource === 'generate' && data.logo && (
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 border border-white/20 bg-white/3 p-2 flex items-center justify-center">
                  <img src={data.logo} alt="Generated Logo" className="w-full h-full object-contain" />
                </div>
                <div className="text-xs text-white/40">
                  <p className="font-semibold mb-0.5" style={{ color: ACCENT }}>✨ AI Logo Generated</p>
                  <p>Created using business initials & theme colors.</p>
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
              setShowCustomPicker(false);
            }}
          />
        </div>

        {/* Color Theme */}
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
            Color Theme {data.feel ? <span className="normal-case text-white/25">— for {data.feel}</span> : ''}
          </label>
          {!data.feel ? (
            <p className="text-xs text-white/30 italic">Select a website feel above to see matching themes.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {(THEMES_BY_FEEL[data.feel] || []).map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => { onChange({ themeId: theme.id }); setShowCustomPicker(false); }}
                  className="flex items-center gap-2 p-2.5 border transition-all duration-200 text-left"
                  style={{
                    borderColor: data.themeId === theme.id && !showCustomPicker ? ACCENT : 'rgba(255,255,255,0.1)',
                    background: data.themeId === theme.id && !showCustomPicker ? `${ACCENT}12` : 'rgba(255,255,255,0.03)',
                  }}
                >
                  {/* Color swatch row */}
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    {[theme.colors.primary, theme.colors.secondary, theme.colors.background].map((c, ci) => (
                      <div key={ci} style={{
                        width: 12, height: 28, borderRadius: 2,
                        background: c, border: '1px solid rgba(255,255,255,0.12)',
                      }} />
                    ))}
                  </div>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide leading-tight"
                    style={{ color: data.themeId === theme.id && !showCustomPicker ? ACCENT : 'rgba(255,255,255,0.4)' }}
                  >
                    {theme.name}
                  </span>
                </button>
              ))}

              {/* Custom Theme Card */}
              <button
                type="button"
                onClick={() => {
                  setShowCustomPicker(true);
                  onChange({ themeId: 'custom', customTheme: customColors });
                }}
                className="flex items-center gap-2 p-2.5 border transition-all duration-200 col-span-2"
                style={{
                  borderColor: showCustomPicker ? ACCENT : 'rgba(255,255,255,0.1)',
                  background: showCustomPicker ? `${ACCENT}10` : 'rgba(255,255,255,0.02)',
                  borderStyle: 'dashed',
                }}
              >
                <span style={{ fontSize: 16 }}>🎨</span>
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: showCustomPicker ? ACCENT : 'rgba(255,255,255,0.4)' }}>
                  + Create Custom Theme
                </span>
              </button>

              {/* Custom Color Pickers */}
              {showCustomPicker && (
                <div className="col-span-2 p-3 border border-white/10 bg-white/3 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Custom Colors</p>
                  {[
                    { key: 'primary', label: 'Primary / Accent' },
                    { key: 'secondary', label: 'Secondary' },
                    { key: 'background', label: 'Background' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div style={{
                          width: 24, height: 24, borderRadius: 4,
                          background: customColors[key],
                          border: '1px solid rgba(255,255,255,0.2)',
                        }} />
                        <span className="text-xs text-white/60 font-medium">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/30 font-mono">{customColors[key]}</span>
                        <input
                          type="color"
                          value={customColors[key]}
                          onChange={e => updateCustomColor(key, e.target.value)}
                          style={{
                            width: 32, height: 28, borderRadius: 4,
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'transparent', cursor: 'pointer',
                            padding: 2,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
            What makes you different? <span className="normal-case text-white/30">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={data.differentiator || ''}
            onChange={e => onChange({ differentiator: e.target.value })}
            className="w-full px-4 py-3 border border-white/10 bg-white/5 text-white text-sm outline-none focus:border-[#d4f000] transition-all placeholder-white/20 resize-none"
            placeholder="e.g. We build affordable AI solutions for small businesses."
          />
        </div>
      </div>

      {/* ── RIGHT: live preview ── */}
      <div style={{ position: 'sticky', top: 16 }}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Live Preview</span>
          <div className="flex gap-1">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
          </div>
        </div>
        <div style={{
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          overflow: 'hidden',
          background: '#111',
        }}>
          <div style={{
            background: '#1a1a1a',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              flex: 1, background: '#2a2a2a',
              borderRadius: 4, padding: '3px 8px',
              fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace',
            }}>
              yourwebsite.com
            </div>
          </div>
          <ThemePreview
            colors={previewColors}
            businessName={data.name}
            feel={data.feel}
            fontStyle={data.fontStyle}
          />
        </div>
        {/* Color chips legend */}
        <div className="mt-2 flex gap-2 items-center flex-wrap">
          {['primary', 'secondary', 'background'].map((key) => (
            <div key={key} className="flex items-center gap-1">
              <div style={{ width: 10, height: 10, borderRadius: 2, background: previewColors[key], border: '1px solid rgba(255,255,255,0.2)' }} />
              <span className="text-[9px] text-white/30 capitalize">{key}</span>
              <span className="text-[9px] text-white/20 font-mono">{previewColors[key]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepPreview({ data, onGenerate, loading, error }) {
  const theme = data.themeId === 'custom' && data.customTheme
    ? { id: 'custom', name: 'Custom Theme', colors: data.customTheme }
    : ALL_THEMES.find(t => t.id === data.themeId) || ALL_THEMES.find(t => t.id === (LEGACY_THEME_MAP[data.themeId] || 'bold-neon')) || ALL_THEMES[0];
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

export default function Questionnaire({ onWebsiteGenerated, initialData }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: initialData?.name || '',
    industry: initialData?.industry || '',
    goal: initialData?.goal || '',
    audience: initialData?.audience || '',
    cta: initialData?.cta || '',
    pages: initialData?.pages || null,
    themeId: initialData?.themeId || 'bold-neon',
    feel: initialData?.feel || '',
    fontStyle: initialData?.fontStyle || 'ai',
    differentiator: initialData?.differentiator || '',
    logo: initialData?.logo || null,
    logoSource: initialData?.logoSource || 'none',
  });

  useEffect(() => {
    if (initialData) {
      setData(d => ({
        ...d,
        name: initialData.name || d.name,
        industry: initialData.industry || d.industry,
        goal: initialData.goal || d.goal,
        audience: initialData.audience || d.audience,
        cta: initialData.cta || d.cta,
        pages: initialData.pages || d.pages,
        feel: initialData.feel || d.feel,
        fontStyle: initialData.fontStyle || d.fontStyle,
        logo: initialData.logo || d.logo,
      }));
    }
  }, [initialData]);
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

    const theme = data.themeId === 'custom' && data.customTheme
      ? { colors: data.customTheme }
      : ALL_THEMES.find(t => t.id === data.themeId) || ALL_THEMES.find(t => t.id === (LEGACY_THEME_MAP[data.themeId] || 'bold-neon')) || ALL_THEMES[0];

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
                      site.id,
                      site.config?.siteImages
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
