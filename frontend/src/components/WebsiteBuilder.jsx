import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Sparkles, Send, Loader2, Menu, X, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Image, Upload, Trash2, Bot, User, Terminal, CheckCircle2, Palette, Grid, Plus } from 'lucide-react';
import FloatingImage from './FloatingImage';

import { EditableContext } from './EditableText';
import { supabase } from '../lib/supabase';

import Hero from './sections/Hero';
import Features from './sections/Features';
import Pricing from './sections/Pricing';
import Footer from './sections/Footer';
import About from './sections/About';
import Portfolio from './sections/Portfolio';
import Testimonials from './sections/Testimonials';
import FAQ from './sections/FAQ';
import Contact from './sections/Contact';

export const SectionComponents = {
  hero: Hero,
  home: Hero,
  about: About,
  features: Features,
  services: Features,
  products: Pricing,
  pricing: Pricing,
  portfolio: Portfolio,
  testimonials: Testimonials,
  faq: FAQ,
  contact: Contact,
  footer: Footer,
  blog: Features, // fallback
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

const THEMES_BY_FEEL = {
  professional: [
    { id: 'pro-corporate', name: 'Corporate Blue', colors: { primary: '#1d4ed8', secondary: '#334155', background: '#ffffff' } },
    { id: 'pro-slate', name: 'Executive Slate', colors: { primary: '#0f172a', secondary: '#2563eb', background: '#f8fafc' } },
    { id: 'pro-emerald', name: 'Emerald Tech', colors: { primary: '#047857', secondary: '#1e293b', background: '#f0fdf4' } },
    { id: 'pro-indigo', name: 'Indigo Premium', colors: { primary: '#4f46e5', secondary: '#0f172a', background: '#faf5ff' } },
    { id: 'pro-charcoal', name: 'Modern Charcoal', colors: { primary: '#18181b', secondary: '#2563eb', background: '#fafafa' } },
  ],
  minimal: [
    { id: 'min-snow', name: 'Snow', colors: { primary: '#111111', secondary: '#999999', background: '#ffffff' } },
    { id: 'min-cloud', name: 'Cloud', colors: { primary: '#1a1a2e', secondary: '#a0a0b0', background: '#f5f5f7' } },
    { id: 'min-ink', name: 'Ink', colors: { primary: '#e0e0e0', secondary: '#555555', background: '#121212' } },
  ],
  luxury: [
    { id: 'lux-gold', name: 'Champagne & Obsidian', colors: { primary: '#d4af37', secondary: '#e5c158', background: '#0a0a0c' } },
    { id: 'lux-emerald', name: 'Emerald Velvet & Gold', colors: { primary: '#d4af37', secondary: '#10b981', background: '#061510' } },
    { id: 'lux-midnight', name: 'Midnight Velvet & Silver', colors: { primary: '#e2e8f0', secondary: '#94a3b8', background: '#090d16' } },
    { id: 'lux-rose', name: 'Rose Gold & Charcoal', colors: { primary: '#e0a96d', secondary: '#f43f5e', background: '#121014' } },
    { id: 'lux-royal', name: 'Royal Crown Gold', colors: { primary: '#c9a959', secondary: '#e2e8f0', background: '#0f0e13' } },
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

const ALL_THEMES = Object.values(THEMES_BY_FEEL).flat();

const AVAILABLE_COMPONENTS = [
  { type: 'hero', label: 'Hero / Banner', description: 'Introduce your site with a large headline, background gradient, and call to action buttons.', icon: 'fa-solid fa-bolt' },
  { type: 'about', label: 'About Us', description: 'Share your company mission, timeline, team, or description text.', icon: 'fa-solid fa-circle-info' },
  { type: 'features', label: 'Features Grid', description: 'Display a clean grid of features, cards, or key benefits of your business.', icon: 'fa-solid fa-star' },
  { type: 'pricing', label: 'Pricing / Plans', description: 'Show comparison tables, subscription cards, and pricing details.', icon: 'fa-solid fa-tag' },
  { type: 'portfolio', label: 'Portfolio Showcase', description: 'Display image cards or projects in a clean grid layout.', icon: 'fa-solid fa-images' },
  { type: 'testimonials', label: 'Testimonials', description: 'Showcase customer reviews and client quotes with author tags.', icon: 'fa-solid fa-comments' },
  { type: 'faq', label: 'FAQ Accordion', description: 'Answer common questions with expandable accordion items.', icon: 'fa-solid fa-circle-question' },
  { type: 'contact', label: 'Contact Info / Form', description: 'Display phone, email, address, and link to a contact form.', icon: 'fa-solid fa-phone' }
];

// ─── UTILS ─────────────────────────────────────────────────────────────────────

export function isLight(hex) {
  if (!hex) return true;
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ─── SITE NAVBAR ─────────────────────────────────────────────────────────────

export function SiteNavbar({ businessName, sections, theme, logo, feel }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const navLinks = sections
    .filter(s => !['footer'].includes(s.type))
    .map(s => ({
      id: s.id,
      label: s.type.charAt(0).toUpperCase() + s.type.slice(1),
      href: `#section-${s.id}`,
      type: s.type,
    }));

  const ctaLink = sections.find(s => ['contact', 'pricing', 'products'].includes(s.type));

  const bg = theme?.background || '#ffffff';
  const primary = theme?.primary || '#000000';
  const textColor = isLight(bg) ? '#000000' : '#ffffff';
  const isDark = !isLight(bg);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
      
      // Determine active section
      const sectionElements = sections.map(s => document.getElementById(`section-${s.id}`)).filter(Boolean);
      let currentActive = '';
      for (const el of sectionElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          currentActive = el.id;
          break;
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger initially
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // Styling properties depending on scroll state
  const navHeightClass = isScrolled ? 'py-3 sm:py-4 shadow-md bg-opacity-95' : 'py-5 bg-opacity-80';
  const navBg = isDark 
    ? (isScrolled ? 'rgba(10, 10, 12, 0.95)' : 'rgba(10, 10, 12, 0.7)')
    : (isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.7)');

  const fontClass = (() => {
    switch (feel) {
      case 'luxury': return 'font-serif italic';
      case 'futuristic': return 'font-mono uppercase tracking-wider';
      case 'bold': return 'font-mono uppercase font-black';
      default: return 'font-sans';
    }
  })();

  const MAX_VISIBLE_LINKS = 4;
  const showMoreDropdown = navLinks.length > MAX_VISIBLE_LINKS;
  const visibleLinks = showMoreDropdown ? navLinks.slice(0, MAX_VISIBLE_LINKS) : navLinks;
  const overflowLinks = showMoreDropdown ? navLinks.slice(MAX_VISIBLE_LINKS) : [];

  return (
    <nav
      style={{
        backgroundColor: navBg,
        borderBottom: isScrolled ? `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}` : '1px solid transparent',
        color: textColor,
      }}
      className={`sticky top-0 z-50 w-full backdrop-blur-xl transition-all duration-300 ${fontClass} ${navHeightClass}`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between gap-6">
        {/* Brand Logo / Title */}
        <a
          href="#section-1"
          className="flex items-center gap-3 text-lg font-bold tracking-tight shrink-0 transition-transform duration-300 hover:scale-[1.01]"
          style={{ color: textColor }}
        >
          {logo ? (
            <img src={logo} alt={businessName} className="h-9 w-auto object-contain max-h-9" />
          ) : (
            <div className="flex items-center gap-2.5">
              <div
                className="w-8.5 h-8.5 rounded-xl flex items-center justify-center font-black text-xs shadow-sm transition-all duration-300 hover:rotate-6"
                style={{
                  backgroundColor: primary,
                  color: isLight(primary) ? '#000000' : '#ffffff',
                }}
              >
                {(businessName || 'B').charAt(0).toUpperCase()}
              </div>
              <span className="font-extrabold tracking-tight text-base sm:text-lg uppercase">
                {businessName || 'Your Brand'}
              </span>
            </div>
          )}
        </a>

        {/* Desktop Navigation Link Items */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center relative">
          {visibleLinks.map(link => {
            const hasDropdown = ['features', 'services', 'pricing', 'products'].includes(link.type);
            const isActive = activeSection === `section-${link.id}`;

            return (
              <div key={link.id} className="relative group/nav py-2">
                <a
                  href={link.href}
                  className={`px-4 py-2 text-sm font-semibold tracking-wide rounded-lg flex items-center gap-1 transition-all duration-200 relative ${
                    isActive ? 'text-primary bg-primary/5' : 'opacity-85 hover:opacity-100 hover:bg-current/5'
                  }`}
                  style={{ color: isActive ? primary : textColor }}
                >
                  <span>{link.label}</span>
                  {hasDropdown && (
                    <ChevronDown className="w-3.5 h-3.5 opacity-70 transition-transform duration-200 group-hover/nav:rotate-180" />
                  )}

                  {/* Active bar visual indicator */}
                  {isActive && (
                    <span 
                      className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full animate-pulse" 
                      style={{ backgroundColor: primary }} 
                    />
                  )}
                </a>

                {/* Dropdowns / Mega Menus */}
                {hasDropdown && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 hidden group-hover/nav:block w-72 sm:w-80 transition-all duration-300 z-50">
                    <div 
                      className="rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl"
                      style={{
                        backgroundColor: isDark ? '#121214' : '#ffffff',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                        color: isDark ? '#ffffff' : '#000000',
                      }}
                    >
                      {/* Pricing / Products Dropdown content */}
                      {['pricing', 'products'].includes(link.type) && (
                        <div className="space-y-3 font-sans">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2" style={{ color: primary }}>
                            Plans & Pricing Tiers
                          </div>
                          <a href={link.href} className="block p-2 rounded-xl hover:bg-current/5 transition-colors">
                            <div className="font-bold text-sm">Starter Plan</div>
                            <div className="text-xs opacity-70">Core tools for small businesses.</div>
                          </a>
                          <a href={link.href} className="block p-2 rounded-xl hover:bg-current/5 transition-colors">
                            <div className="font-bold text-sm">Professional Plan</div>
                            <div className="text-xs opacity-70">Intelligent flows & integrations.</div>
                          </a>
                          <a href={link.href} className="block p-2 rounded-xl hover:bg-current/5 transition-colors">
                            <div className="font-bold text-sm">Enterprise setup</div>
                            <div className="text-xs opacity-70">Dedicated resources & SLA support.</div>
                          </a>
                        </div>
                      )}

                      {/* Services / Features Dropdown content */}
                      {['features', 'services'].includes(link.type) && (
                        <div className="space-y-3 font-sans">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2" style={{ color: primary }}>
                            Intelligent Solutions
                          </div>
                          <a href={link.href} className="block p-2 rounded-xl hover:bg-current/5 transition-colors">
                            <div className="font-bold text-sm">⚡ Lightning Execution</div>
                            <div className="text-xs opacity-70">Zero delay high performance stack.</div>
                          </a>
                          <a href={link.href} className="block p-2 rounded-xl hover:bg-current/5 transition-colors">
                            <div className="font-bold text-sm">🛡️ Bank-Grade Security</div>
                            <div className="text-xs opacity-70">End-to-end asset protection.</div>
                          </a>
                          <a href={link.href} className="block p-2 rounded-xl hover:bg-current/5 transition-colors">
                            <div className="font-bold text-sm">🧩 Modular Customization</div>
                            <div className="text-xs opacity-70">Easy extensions & setups.</div>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* More Dropdown for Overflow Links */}
          {showMoreDropdown && (
            <div className="relative group/more py-2">
              <button
                className="px-4 py-2 text-sm font-semibold tracking-wide rounded-lg flex items-center gap-1 opacity-85 hover:opacity-100 transition-all duration-200 hover:bg-current/5 cursor-pointer"
                style={{ color: textColor }}
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70 transition-transform duration-200 group-hover/more:rotate-180" />
              </button>

              <div className="absolute top-full right-0 pt-3 hidden group-hover/more:block w-48 transition-all duration-300 z-50">
                <div 
                  className="rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl"
                  style={{
                    backgroundColor: isDark ? '#121214' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    color: isDark ? '#ffffff' : '#000000',
                  }}
                >
                  {overflowLinks.map(link => {
                    const isActive = activeSection === `section-${link.id}`;
                    return (
                      <a
                        key={link.id}
                        href={link.href}
                        className={`block px-4 py-2 text-sm font-semibold rounded-xl hover:bg-current/5 transition-colors ${
                          isActive ? 'text-primary' : 'opacity-85'
                        }`}
                        style={{ color: isActive ? primary : undefined }}
                      >
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic CTA Link button */}
        {ctaLink && (
          <a
            href={`#section-${ctaLink.id}`}
            className="hidden md:inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold tracking-wide rounded-xl shadow-sm hover:shadow-lg hover:scale-102 active:scale-98 transition-all duration-300 shrink-0"
            style={{
              backgroundColor: primary,
              color: isLight(primary) ? '#000000' : '#ffffff',
            }}
          >
            {ctaLink.type === 'contact' ? 'Contact Us' : 'Get Started'}
          </a>
        )}

        {/* Mobile Hamburger Drawer Menu Toggle */}
        <button
          className="md:hidden p-2.5 rounded-xl hover:bg-current/10 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: textColor }}
        >
          {menuOpen ? <X size={22} className="transition-transform duration-200 rotate-90" /> : <Menu size={22} className="transition-transform duration-200" />}
        </button>
      </div>

      {/* Mobile Drawer menu with clean dropdown list */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-6 py-5 flex flex-col gap-3 shadow-2xl backdrop-blur-2xl transition-all duration-300"
          style={{ 
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
            backgroundColor: isDark ? '#0d0d0f' : '#ffffff',
          }}
        >
          {navLinks.map(link => (
            <a
              key={link.id}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold py-3 px-4 rounded-xl hover:bg-current/5 transition-colors flex items-center justify-between"
              style={{ color: textColor }}
            >
              <span>{link.label}</span>
              {['features', 'services', 'pricing', 'products'].includes(link.type) && (
                <ChevronRight className="w-4 h-4 opacity-55" />
              )}
            </a>
          ))}
          {ctaLink && (
            <a
              href={`#section-${ctaLink.id}`}
              onClick={() => setMenuOpen(false)}
              className="mt-3 text-center py-3.5 text-sm font-bold rounded-xl transition-all shadow-md active:scale-98"
              style={{
                backgroundColor: primary,
                color: isLight(primary) ? '#000000' : '#ffffff',
              }}
            >
              {ctaLink.type === 'contact' ? 'Contact Us' : 'Get Started'}
            </a>
          )}
        </div>
      )}
    </nav>
  );
}

// ─── SORTABLE SECTION ─────────────────────────────────────────────────────────

function SortableSection({ 
  id, 
  section, 
  feel, 
  isEditingText, 
  isExpanded, 
  onClick, 
  onUpdateText, 
  activeTab, 
  selectedText, 
  onSelectText,
  onMoveSection,
  onDeleteSection,
  isFirst,
  isLast 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const startY = useRef(0);
  const startPadding = useRef(96);

  const handleMouseDownResize = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingHeight(true);
    startY.current = e.clientY;
    startPadding.current = section.content?.customPadding !== undefined ? section.content.customPadding : 96;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingHeight) return;
      const dy = e.clientY - startY.current;
      const newPadding = Math.max(10, Math.min(300, startPadding.current + Math.round(dy)));
      onUpdateText(id, 'customPadding', newPadding);
    };

    const handleMouseUp = () => {
      setIsResizingHeight(false);
    };

    if (isResizingHeight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingHeight, onUpdateText, id]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Component = SectionComponents[section.type];

  if (!Component) {
    // Render a fallback so sections are never invisible
    return (
      <div
        ref={setNodeRef}
        style={style}
        id={`section-${id}`}
        className={`relative group py-16 px-6 border-b-4 border-black bg-white ${isEditingText ? 'cursor-pointer' : ''}`}
        onClick={isEditingText ? onClick : undefined}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black uppercase text-black mb-4">
            {section.content?.title || section.type}
          </h2>
          <p className="text-lg font-bold text-gray-700">
            {section.content?.description || ''}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      id={`section-${id}`} 
      className={`relative group ${isEditingText ? 'cursor-pointer' : ''}`}
      onClick={isEditingText ? onClick : undefined}
    >
      {isEditingText && activeTab !== 'media' && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-1 bg-[#09090b]/90 backdrop-blur-md text-white p-1 rounded-lg border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center gap-1.5 px-2 py-1 cursor-grab active:cursor-grabbing hover:bg-white/10 rounded transition-colors"
            title="Drag to reorder section"
          >
            <GripVertical size={16} className="text-[#d4f000]" />
            <span className="text-[9px] font-black uppercase tracking-wider text-white/90 select-none">
              {section.type}
            </span>
          </div>

          <div className="w-[1px] h-4 bg-white/20 my-auto" />

          {/* Move Section Up */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onMoveSection) onMoveSection('up');
            }}
            disabled={isFirst}
            title="Move Section Up"
            className="p-1 hover:bg-[#d4f000] hover:text-[#080808] text-white/80 rounded transition-colors disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white/80 cursor-pointer"
          >
            <ChevronUp size={15} />
          </button>

          {/* Move Section Down */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onMoveSection) onMoveSection('down');
            }}
            disabled={isLast}
            title="Move Section Down"
            className="p-1 hover:bg-[#d4f000] hover:text-[#080808] text-white/80 rounded transition-colors disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white/80 cursor-pointer"
          >
            <ChevronDown size={15} />
          </button>

          <div className="w-[1px] h-4 bg-white/20 my-auto" />

          {/* Delete Section */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to delete the ${section.type} section?`)) {
                if (onDeleteSection) onDeleteSection();
              }
            }}
            title="Delete Section"
            className="p-1 hover:bg-red-500 hover:text-white text-red-400 rounded transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}

      {/* Scoped override style block for custom section padding */}
      {section.content?.customPadding !== undefined && (
        <style>{`
          #section-${id} .py-24,
          #section-${id} .py-20,
          #section-${id} [class*="py-"] {
            padding-top: ${section.content.customPadding}px !important;
            padding-bottom: ${section.content.customPadding}px !important;
          }
        `}</style>
      )}

      <div 
        className={`transition-all duration-300 relative z-0 ${
          isExpanded 
            ? 'ring-4 ring-[#d4f000] ring-offset-4 ring-offset-black' 
            : 'hover:ring-2 hover:ring-primary hover:ring-inset'
        }`}
        style={{
          ...(section.content?.bgColor ? { backgroundColor: section.content.bgColor } : {}),
          ...(section.content?.textColor ? { color: section.content.textColor } : {}),
        }}
      >
        <EditableContext.Provider value={{ 
          isEditingText, 
          isMediaMode: activeTab === 'media',
          selectedText,
          onSelectText: (path) => onSelectText(id, path),
          updateText: (path, val) => onUpdateText(id, path, val),
          updateImage: (imgData) => onUpdateText(id, 'image', imgData)
        }}>
          <Component content={section.content || {}} feel={feel} />
        </EditableContext.Provider>
      </div>

      {/* Bottom height resizer handle */}
      {isEditingText && activeTab !== 'media' && (
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-0 left-0 right-0 h-2 bg-[#d4f000]/10 hover:bg-[#d4f000] cursor-ns-resize z-40 transition-colors flex items-center justify-center group/resize"
          title="Drag up or down to adjust section padding/height"
        >
          <div className="w-16 h-1 bg-[#d4f000] rounded opacity-0 group-hover/resize:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
}

// ─── WEBSITE BUILDER ──────────────────────────────────────────────────────────

export default function WebsiteBuilder({ initialSpec, theme, businessName, pages, logo, feel, fontStyle, websiteId, onSave, initialSiteImages = [], initialDataHeaders = null, initialDataRows = null }) {
  const navigate = useNavigate();
  const [sections, setSections] = useState(
    (initialSpec || []).map((s, idx) => ({ ...s, id: s.id || `section-${idx}` }))
  );

  const handleMoveSection = (id, direction) => {
    setSections(prevSections => {
      const mainIndex = prevSections.findIndex(s => s.id === id);
      if (mainIndex === -1) return prevSections;
      const targetIndex = direction === 'up' ? mainIndex - 1 : mainIndex + 1;
      if (targetIndex < 0 || targetIndex >= prevSections.length || prevSections[targetIndex].type === 'footer') {
        return prevSections;
      }
      const updated = [...prevSections];
      const [moved] = updated.splice(mainIndex, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
  };

  const handleRemoveSection = (id) => {
    setSections(prev => {
      const isOnlyOne = prev.filter(s => s.type !== 'footer').length <= 1;
      if (isOnlyOne) {
        alert('You must keep at least one section besides the footer.');
        return prev;
      }
      return prev.filter(s => s.id !== id);
    });
  };

  const handleAddSection = (type) => {
    let defaultContent = {};
    if (type === 'hero' || type === 'home') {
      defaultContent = { headline: 'New Hero Section', subheadline: 'This is a new banner section. Double click here to edit text.', ctaText: 'Get Started' };
    } else if (type === 'about') {
      defaultContent = { tagline: 'WHO WE ARE', title: 'Our Story & Background', description: 'We are a dedicated team of professionals providing top-tier services to our clients.' };
    } else if (type === 'features' || type === 'services') {
      defaultContent = { tagline: 'WHAT WE OFFER', title: 'Our Features', items: [{ title: 'Speedy Delivery', description: 'Get results quickly.' }, { title: 'Premium Quality', description: 'Crafted with passion.' }, { title: 'Full Support', description: 'We are here for you 24/7.' }] };
    } else if (type === 'pricing' || type === 'products') {
      defaultContent = { title: 'Simple Pricing Plans', description: 'Select a plan that works for you.', plans: [{ name: 'Starter', price: '$29', description: 'Best for individuals.', popular: false, ctaText: 'Buy Now' }, { name: 'Pro', price: '$79', description: 'Best for growth.', popular: true, ctaText: 'Buy Now' }] };
    } else if (type === 'portfolio') {
      defaultContent = { title: 'Our Work', items: [{ title: 'Project One', description: 'E-commerce platform' }, { title: 'Project Two', description: 'Mobile application' }, { title: 'Project Three', description: 'Branding design' }] };
    } else if (type === 'testimonials') {
      defaultContent = { title: 'Client Testimonials', items: [{ quote: 'This team exceeded all expectations.', author: 'Sarah Connor', role: 'CTO' }, { quote: 'Excellent design and perfect execution.', author: 'John Doe', role: 'Founder' }] };
    } else if (type === 'faq') {
      defaultContent = { title: 'Frequently Asked Questions', items: [{ question: 'How long does setup take?', answer: 'Setup takes less than 5 minutes.' }, { question: 'Can I cancel anytime?', answer: 'Yes, you can cancel your subscription at any time.' }] };
    } else if (type === 'contact') {
      defaultContent = { title: 'Get In Touch', email: 'hello@yourdomain.com', phone: '+1 (555) 012-3456', address: '123 Main St, New York, NY' };
    }

    const newSec = {
      id: `section-added-${Date.now()}`,
      type,
      content: defaultContent
    };

    setSections(prev => {
      const footerIdx = prev.findIndex(s => s.type === 'footer');
      if (footerIdx !== -1) {
        const updated = [...prev];
        updated.splice(footerIdx, 0, newSec);
        return updated;
      }
      return [...prev, newSec];
    });
  };

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const [currentTheme, setCurrentTheme] = useState(theme);
  const [currentFeel, setCurrentFeel] = useState(feel);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(true); // default to true since it starts synchronized
  const [saveError, setSaveError] = useState(false);
  const isInitialMount = useRef(true);
  const [previousHistoryState, setPreviousHistoryState] = useState(null);
  
  // Publish State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [subdomainInput, setSubdomainInput] = useState('');
  const [currentPublishedSubdomain, setCurrentPublishedSubdomain] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishSuccessUrl, setPublishSuccessUrl] = useState(null);
  const [subdomainStatus, setSubdomainStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'yours'
  const subdomainCheckRef = useRef(null);

  // Load existing published subdomain for this website on open
  const openPublishModal = async () => {
    setPublishSuccessUrl(null);
    setPublishError(null);
    setSubdomainStatus(null);
    if (websiteId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('published_sites')
            .select('subdomain')
            .eq('website_id', websiteId)
            .eq('user_id', user.id)
            .maybeSingle();
          if (data?.subdomain) {
            setSubdomainInput(data.subdomain);
            setCurrentPublishedSubdomain(data.subdomain);
            setSubdomainStatus('yours');
          } else {
            setSubdomainInput('');
            setCurrentPublishedSubdomain(null);
          }
        }
      } catch (err) {
        console.error('Failed to load existing subdomain:', err);
      }
    } else {
      setSubdomainInput('');
      setCurrentPublishedSubdomain(null);
    }
    setShowPublishModal(true);
  };

  const checkSubdomainAvailability = async (value) => {
    const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!cleaned || cleaned.length < 2) {
      setSubdomainStatus(null);
      return;
    }
    // If same as currently published, mark as 'yours'
    if (currentPublishedSubdomain && cleaned === currentPublishedSubdomain) {
      setSubdomainStatus('yours');
      return;
    }
    setSubdomainStatus('checking');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('published_sites')
        .select('subdomain, user_id')
        .eq('subdomain', cleaned)
        .maybeSingle();
      if (!data) {
        setSubdomainStatus('available');
      } else if (data.user_id === user?.id) {
        setSubdomainStatus('yours');
        setCurrentPublishedSubdomain(cleaned);
      } else {
        setSubdomainStatus('taken');
      }
    } catch (err) {
      console.error('Check failed:', err);
      setSubdomainStatus(null);
    }
  };

  const handleSubdomainChange = (e) => {
    const raw = e.target.value;
    setSubdomainInput(raw);
    setSubdomainStatus(null);
    if (subdomainCheckRef.current) clearTimeout(subdomainCheckRef.current);
    subdomainCheckRef.current = setTimeout(() => checkSubdomainAvailability(raw), 600);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!subdomainInput.trim()) return;
    if (subdomainStatus === 'taken') return;

    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccessUrl(null);

    const subdomain = subdomainInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to publish.');

      // Auto-save the project first so it appears in the dashboard
      const currentWebsiteId = await handleSaveProject();
      if (!currentWebsiteId) {
        throw new Error('Could not save project to dashboard before publishing.');
      }

      // Final security check — re-verify ownership server-side before upsert
      const { data: existing } = await supabase
        .from('published_sites')
        .select('subdomain, user_id')
        .eq('subdomain', subdomain)
        .maybeSingle();

      if (existing && existing.user_id !== user.id) {
        throw new Error('This subdomain is already claimed by another user.');
      }

      // If user changed domain, delete the old record first
      if (currentPublishedSubdomain && currentPublishedSubdomain !== subdomain) {
        await supabase
          .from('published_sites')
          .delete()
          .eq('subdomain', currentPublishedSubdomain)
          .eq('user_id', user.id);
      }

      const payload = {
        subdomain,
        user_id: user.id,
        website_id: currentWebsiteId,
        config: {
          businessName,
          sections,
          theme: currentTheme || theme,
          logo,
          feel: currentFeel || feel,
          fontStyle,
          siteImages
        },
        published_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('published_sites')
        .upsert(payload, { onConflict: 'subdomain' });

      if (error) throw error;

      setCurrentPublishedSubdomain(subdomain);
      const domainUrl = `https://${subdomain}.flow.devshahid.me`;
      setPublishSuccessUrl(domainUrl);
    } catch (err) {
      console.error('Publish failed:', err);
      setPublishError(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to save.');

      // Strip large base64 data from sections (avatarUrl, imageUrl from portfolio/testimonials)
      const stripBase64 = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(stripBase64);
        const cleaned = {};
        for (const [k, v] of Object.entries(obj)) {
          if (typeof v === 'string' && v.startsWith('data:image/') && v.length > 5000) {
            cleaned[k] = ''; // strip base64 to avoid 500 on large payload
          } else {
            cleaned[k] = stripBase64(v);
          }
        }
        return cleaned;
      };

      const cleanedSections = sections.map(s => ({
        ...s,
        content: stripBase64(s.content)
      }));

      const cleanedSiteImages = siteImages.map(img => ({
        ...img,
        url: (typeof img.url === 'string' && img.url.startsWith('data:image/') && img.url.length > 5000) ? '' : img.url
      }));

      const payload = {
        user_id: user.id,
        name: businessName || 'My Website',
        spec: cleanedSections,
        theme: currentTheme || theme,
        config: { businessName, pages, logo, feel: currentFeel || feel, fontStyle, siteImages: cleanedSiteImages },
        updated_at: new Date().toISOString()
      };

      if (websiteId) {
        const { error } = await supabase
          .from('saved_websites')
          .update(payload)
          .eq('id', websiteId);
        if (error) throw error;
        setSaveSuccess(true);
        setSaveError(false);
        return websiteId;
      } else {
        const { data, error } = await supabase
          .from('saved_websites')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        if (data && onSave) {
          onSave(data.id);
        }
        setSaveSuccess(true);
        setSaveError(false);
        return data?.id;
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
      setSaveError(true);
      setSaveSuccess(false);
      return null;
    } finally {
      setIsSaving(false);
    }
  };


  const [refineSummary, setRefineSummary] = useState(null);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: 'Hello! I am your AI Assistant. Ask me to change background colors (e.g. black & white), add new buttons, update copy, or add new sections!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const chatEndRef = useRef(null);

  const [instruction, setInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isRefining]);

  const [isEditingText, setIsEditingText] = useState(false);
  const [expandedSectionId, setExpandedSectionId] = useState(null);

  const [activeTab, setActiveTab] = useState('refine'); // 'refine', 'text', 'media'
  const [mediaSectionId, setMediaSectionId] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaWidth, setMediaWidth] = useState(400);
  const [mediaBorderRadius, setMediaBorderRadius] = useState(8);
  const [mediaAspectRatio, setMediaAspectRatio] = useState('auto');

  useEffect(() => {
    if (sections.length > 0 && !mediaSectionId) {
      setMediaSectionId(sections[0].id);
    }
  }, [sections, mediaSectionId]);

  const selectedMediaSection = sections.find(s => s.id === mediaSectionId);
  const existingImage = selectedMediaSection?.content?.image;

  useEffect(() => {
    if (existingImage) {
      setMediaUrl(existingImage.url || '');
      setMediaWidth(existingImage.width || 400);
      setMediaBorderRadius(existingImage.borderRadius || 8);
      setMediaAspectRatio(existingImage.aspectRatio || 'auto');
    } else {
      setMediaUrl('');
      setMediaWidth(400);
      setMediaBorderRadius(8);
      setMediaAspectRatio('auto');
    }
  }, [mediaSectionId, existingImage]);

  const handleApplyImage = () => {
    if (!mediaSectionId) return;
    setSections(prevSections =>
      prevSections.map(s => {
        if (s.id !== mediaSectionId) return s;
        return {
          ...s,
          content: {
            ...s.content,
            image: {
              url: mediaUrl,
              width: mediaWidth,
              borderRadius: mediaBorderRadius,
              aspectRatio: mediaAspectRatio
            }
          }
        };
      })
    );
  };

  const handleRemoveImage = () => {
    if (!mediaSectionId) return;
    setSections(prevSections =>
      prevSections.map(s => {
        if (s.id !== mediaSectionId) return s;
        const newContent = { ...s.content };
        delete newContent.image;
        return { ...s, content: newContent };
      })
    );
    setMediaUrl('');
  };

  const [siteImages, setSiteImages] = useState(initialSiteImages || []);
  const [uploadedLibrary, setUploadedLibrary] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [selectedText, setSelectedText] = useState(null);

  // Debounced auto-save hook — only sections/theme/feel/siteImages trigger this
  const handleSaveProjectRef = useRef(handleSaveProject);
  useEffect(() => { handleSaveProjectRef.current = handleSaveProject; });

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      handleSaveProjectRef.current();
    }, 800); // 800ms debounce — generous enough to batch rapid keystrokes

    return () => clearTimeout(timer);
  }, [sections, currentTheme, currentFeel, siteImages]);

  const handlePreviewClick = (e) => {
    if ((activeTab === 'media' || activeTab === 'components') && !e.target.closest('.floating-image-container') && !e.target.closest('button')) {
      setSelectedImageId(null);
    }
    if (!e.target.closest('[contenteditable]') && !e.target.closest('input') && !e.target.closest('select') && !e.target.closest('textarea') && !e.target.closest('button')) {
      setSelectedText(null);
    }
  };

  const handlePreviewDragOver = (e) => {
    if (activeTab === 'media' || activeTab === 'components') {
      e.preventDefault();
    }
  };

  const handlePreviewDrop = (e) => {
    if (activeTab !== 'media' && activeTab !== 'components') return;
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + e.currentTarget.scrollLeft;
    const y = e.clientY - rect.top + e.currentTarget.scrollTop;

    // Check if dragging a floating component template from Components tab
    const componentType = e.dataTransfer.getData('component-type');
    if (componentType) {
      addNewFloatingElement(componentType, x, y);
      return;
    }

    // File drop
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileUrl = reader.result;
        setUploadedLibrary(prev => {
          if (prev.includes(fileUrl)) return prev;
          return [...prev, fileUrl];
        });
        addNewFloatingElement('image', x, y, fileUrl);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Presets URL drop
    const url = e.dataTransfer.getData('text/plain');
    if (url) {
      addNewFloatingElement('image', x, y, url);
    }
  };

  const changeElementLayer = (id, direction) => {
    setSiteImages(prev => {
      // 1. Sort all elements stably by their current zIndex
      const sorted = [...prev].sort((a, b) => {
        const zA = a.zIndex !== undefined ? a.zIndex : 10;
        const zB = b.zIndex !== undefined ? b.zIndex : 10;
        if (zA !== zB) return zA - zB;
        return prev.indexOf(a) - prev.indexOf(b);
      });

      // 2. Normalize z-indexes to be sequentially 10, 11, 12...
      const normalized = sorted.map((item, index) => ({
        ...item,
        zIndex: 10 + index
      }));

      // 3. Find the selected item index
      const idx = normalized.findIndex(item => item.id === id);
      if (idx === -1) return prev;

      // 4. Perform swap if within bounds
      if (direction === 'forward' && idx < normalized.length - 1) {
        const tempZ = normalized[idx].zIndex;
        normalized[idx].zIndex = normalized[idx + 1].zIndex;
        normalized[idx + 1].zIndex = tempZ;
      } else if (direction === 'backward' && idx > 0) {
        const tempZ = normalized[idx].zIndex;
        normalized[idx].zIndex = normalized[idx - 1].zIndex;
        normalized[idx - 1].zIndex = tempZ;
      }

      return normalized;
    });
  };

  const addNewFloatingElement = (type, x, y, customUrl = null) => {
    const previewContainer = document.getElementById('preview-scroll-container');
    const containerWidth = previewContainer ? previewContainer.clientWidth : 800;

    const navbar = document.querySelector('nav.sticky');
    const navHeight = navbar ? navbar.offsetHeight : 70;
    const adjustedY = y - navHeight;

    const widthPercent = ((type === 'text' ? 240 : 200) / containerWidth) * 100;
    const xPercent = ((x - (type === 'text' ? 120 : 100)) / containerWidth) * 100;

    const defaultUrl = customUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop';

    const newElement = {
      id: `float-${type}-${Date.now()}`,
      type,
      xPercent: Math.max(0, Math.min(100 - widthPercent, xPercent)),
      y: Math.max(0, adjustedY - 50),
      widthPercent,
      width: type === 'text' ? 240 : 200,
      height: type === 'text' ? 80 : type === 'button' ? 45 : 150,
      borderRadius: type === 'button' ? 8 : 0,
      text: type === 'button' ? 'Click Me' : type === 'text' ? 'Floating text content' : '',
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: '400',
      textAlign: 'left',
      link: type === 'button' ? '#' : '',
      color: type === 'button' ? '#d4f000' : type === 'shape' ? '#222222' : '',
      textColor: type === 'button' ? '#080808' : type === 'text' ? '#ffffff' : '',
      url: type === 'image' ? defaultUrl : ''
    };
    setSiteImages(prev => [...prev, newElement]);
    setSelectedImageId(newElement.id);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileUrl = reader.result;
        setMediaUrl(fileUrl);
        setUploadedLibrary(prev => {
          if (prev.includes(fileUrl)) return prev;
          return [...prev, fileUrl];
        });
        const previewContainer = document.getElementById('preview-scroll-container');
        if (previewContainer) {
          const rect = previewContainer.getBoundingClientRect();
          const x = rect.width / 2 + previewContainer.scrollLeft;
          const y = rect.height / 2 + previewContainer.scrollTop;
          addNewFloatingElement('image', x, y, fileUrl);
        } else {
          addNewFloatingElement('image', 300, 200, fileUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const stockImages = [
    { label: 'Tech', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80' },
    { label: 'Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80' },
    { label: 'Design', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80' },
    { label: 'Team', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80' }
  ];

  useEffect(() => {
    if (expandedSectionId) {
      const el = document.getElementById(`section-${expandedSectionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [expandedSectionId]);

  const handleContentChange = (sectionId, fieldPath, val) => {
    setSections(prevSections =>
      prevSections.map(s => {
        if (s.id !== sectionId) return s;
        const newContent = { ...s.content };
        
        const parts = fieldPath.split('.');
        let curr = newContent;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (Array.isArray(curr[part])) {
            curr[part] = [...curr[part]];
          } else {
            curr[part] = { ...curr[part] };
          }
          curr = curr[part];
        }
        curr[parts[parts.length - 1]] = val;
        
        return { ...s, content: newContent };
      })
    );
  };

  const renderEditableFields = (sectionId, obj, prefix = '') => {
    if (!obj || typeof obj !== 'object') return null;
    
    return Object.entries(obj).map(([key, val]) => {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      
      const isStyledText = val && typeof val === 'object' && ('text' in val);
      if (typeof val === 'string' || typeof val === 'number' || isStyledText) {
        const textValue = isStyledText ? (val.text || '') : String(val);
        const label = currentPath.split('.').map(p => isNaN(p) ? p : `Item ${Number(p) + 1}`).join(' → ');
        
        // Skip rendering styling fields as nested standalone fields
        if (key === 'image' || key === 'aspectRatio' || key === 'borderRadius' || key === 'width') return null;

        const isSelectedText = selectedText && selectedText.sectionId === sectionId && selectedText.path === currentPath;

        const updateStyle = (styleKey, styleVal) => {
          const currentValObj = isStyledText ? val : { text: String(val) };
          handleContentChange(sectionId, currentPath, {
            ...currentValObj,
            [styleKey]: styleVal
          });
        };

        const isTextArea = textValue.length > 50;

        return (
          <div 
            key={currentPath} 
            className={`flex flex-col gap-1.5 mb-4 p-2.5 rounded transition-all ${
              isSelectedText ? 'bg-[#d4f000]/5 ring-1 ring-[#d4f000]/30' : 'bg-white/[0.01]'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedText({ sectionId, path: currentPath });
            }}
          >
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
                {label.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              {isSelectedText && (
                <span className="text-[8px] font-bold text-[#d4f000] uppercase tracking-wider">
                  Active Element
                </span>
              )}
            </div>

            {isTextArea ? (
              <textarea
                value={textValue}
                onChange={(e) => {
                  if (isStyledText) {
                    updateStyle('text', e.target.value);
                  } else {
                    handleContentChange(sectionId, currentPath, e.target.value);
                  }
                }}
                rows={2}
                className="w-full bg-white/5 border border-white/10 focus:border-[#d4f000] text-white p-2 outline-none text-xs resize-none transition-colors"
              />
            ) : (
              <input
                type="text"
                value={textValue}
                onChange={(e) => {
                  if (isStyledText) {
                    updateStyle('text', e.target.value);
                  } else {
                    handleContentChange(sectionId, currentPath, e.target.value);
                  }
                }}
                className="w-full bg-white/5 border border-white/10 focus:border-[#d4f000] text-white p-2 outline-none text-xs transition-colors"
              />
            )}

            {/* Typography Styles Bar */}
            {isSelectedText && (
              <div className="mt-2.5 space-y-3 pt-2.5 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                {/* Font Size & Alignment Row */}
                <div className="flex gap-4 items-center justify-between">
                  {/* Size */}
                  <div className="flex-1">
                    <div className="flex justify-between text-[9px] font-bold text-white/40 uppercase mb-1">
                      <span>Font Size</span>
                      <span className="text-[#d4f000]">{isStyledText && val.fontSize ? val.fontSize : 16}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      step="1"
                      value={isStyledText && val.fontSize ? val.fontSize : 16}
                      onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
                      className="w-full accent-[#d4f000]"
                    />
                  </div>
                </div>

                {/* Font Family & Alignment Controls */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Font Family</label>
                    <select
                      value={isStyledText && val.fontFamily ? val.fontFamily : 'Inter'}
                      onChange={(e) => updateStyle('fontFamily', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white p-1 text-[10px] outline-none rounded"
                    >
                      <option value="Inter" className="bg-[#121212] text-white font-sans">Sans: Inter</option>
                      <option value="Outfit" className="bg-[#121212] text-white font-sans">Sans: Outfit</option>
                      <option value="'Playfair Display'" className="bg-[#121212] text-white font-serif">Serif: Playfair</option>
                      <option value="'Courier Prime'" className="bg-[#121212] text-white font-mono">Mono: Courier</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Weight</label>
                    <select
                      value={isStyledText && val.fontWeight ? val.fontWeight : '400'}
                      onChange={(e) => updateStyle('fontWeight', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white p-1 text-[10px] outline-none rounded"
                    >
                      <option value="400" className="bg-[#121212] text-white">Regular</option>
                      <option value="600" className="bg-[#121212] text-white">Semibold</option>
                      <option value="800" className="bg-[#121212] text-white">Bold / Black</option>
                    </select>
                  </div>
                </div>

                {/* Alignment buttons */}
                <div>
                  <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Position / Align</label>
                  <div className="grid grid-cols-3 gap-1">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => updateStyle('textAlign', align)}
                        className={`py-1 text-[9px] font-bold uppercase rounded border transition-all ${
                          isStyledText && val.textAlign === align
                            ? 'bg-[#d4f000] text-[#080808] border-[#d4f000]'
                            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
      
      if (Array.isArray(val)) {
        return (
          <div key={currentPath} className="border-l border-white/15 pl-3 mb-4 mt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#d4f000] mb-2">{key}</p>
            {val.map((item, idx) => (
              <div key={idx} className="mb-3 bg-white/5 p-2 rounded border border-white/5">
                <p className="text-[9px] font-bold text-white/30 uppercase mb-2">Item {idx + 1}</p>
                {renderEditableFields(sectionId, item, `${currentPath}.${idx}`)}
              </div>
            ))}
          </div>
        );
      }
      
      if (typeof val === 'object') {
        // Prevent infinite loops on style parameters of objects
        if (key === 'image') return null;
        return (
          <div key={currentPath} className="border-l border-white/15 pl-3 mb-3">
            <p className="text-[10px] font-bold uppercase text-white/40 mb-2">{key}</p>
            {renderEditableFields(sectionId, val, currentPath)}
          </div>
        );
      }
      
      return null;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRefine = async (e) => {
    e.preventDefault();
    const userPrompt = instruction.trim();
    if (!userPrompt) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInstruction('');
    setIsRefining(true);
    setRefineSummary(null);

    try {
      const response = await fetch('/api/refine-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSpec: sections,
          siteImages,
          instruction: userPrompt,
          chatHistory: chatMessages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: typeof m.text === 'string' ? m.text : 'Applied updates.'
          })),
          currentTheme: currentTheme || theme,
          currentFeel: currentFeel || feel,
          businessName
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to refine layout');

      // Save current state for undo/revert before applying data updates
      setPreviousHistoryState({
        sections: [...sections],
        siteImages: [...siteImages],
        theme: currentTheme ? { ...currentTheme } : null,
        feel: currentFeel || null
      });

      if (data.spec && Array.isArray(data.spec)) {
        const newSections = data.spec.map((s, idx) => {
          const existing = sections.find(old => old.id === s.id);
          
          const content = { ...s.content };
          if (existing && existing.content) {
            // Restore main image URL if present
            if (existing.content.image && content.image) {
              content.image.url = existing.content.image.url;
            }
            // Restore list item image/url fields if present
            if (Array.isArray(existing.content.items) && Array.isArray(content.items)) {
              content.items = content.items.map((item, itemIdx) => {
                const existingItem = existing.content.items[itemIdx];
                if (existingItem && (existingItem.url || existingItem.image)) {
                  return { 
                    ...item, 
                    url: existingItem.url || item.url,
                    image: existingItem.image || item.image
                  };
                }
                return item;
              });
            }
          }

          return { 
            ...s, 
            id: existing ? existing.id : `section-new-${Date.now()}-${idx}`,
            content
          };
        });
        setSections(newSections);
      }

      if (data.siteImages && Array.isArray(data.siteImages)) {
        const mergedImages = data.siteImages.map(newImg => {
          const existing = siteImages.find(old => old.id === newImg.id);
          return {
            ...newImg,
            url: existing ? existing.url : (newImg.url || '')
          };
        });
        setSiteImages(mergedImages);
      }

      if (data.theme) {
        setCurrentTheme(data.theme);
      }
      if (data.feel) {
        setCurrentFeel(data.feel);
      }

      const assistantSummary = data.summary || 'Applied requested updates to your website.';
      setRefineSummary(assistantSummary);

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: assistantSummary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Refinement failed:', err);
      
      let userFriendlyMessage = "I couldn't complete that update. Let's try another modification, or try rephrasing your request.";
      const errMsg = String(err.message || '').toLowerCase();
      
      if (errMsg.includes('failed to fetch') || errMsg.includes('networkerror') || errMsg.includes('network')) {
        userFriendlyMessage = "Connection lost. Please check your internet connection and try again.";
      } else if (errMsg.includes('json') || errMsg.includes('unexpected token') || errMsg.includes('parsing')) {
        userFriendlyMessage = "I ran into an issue reading the new design layout. Please try describing your request in a different way or clear the history and retry.";
      } else if (errMsg.includes('limit') || errMsg.includes('too many') || errMsg.includes('429') || errMsg.includes('rate')) {
        userFriendlyMessage = "The service is busy right now. Please wait a moment and try again.";
      } else if (errMsg.includes('logged in') || errMsg.includes('auth') || errMsg.includes('login')) {
        userFriendlyMessage = "Please make sure you are logged in to save and refine your site.";
      }
      
      const errorMsg = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: userFriendlyMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsRefining(false);
    }
  };

  const handleRevert = () => {
    if (!previousHistoryState) return;

    // Apply previous states
    setSections(previousHistoryState.sections);
    setSiteImages(previousHistoryState.siteImages);
    if (previousHistoryState.theme) setCurrentTheme(previousHistoryState.theme);
    if (previousHistoryState.feel) setCurrentFeel(previousHistoryState.feel);

    // Clear history state so they can only undo once
    setPreviousHistoryState(null);

    // Remove the last user prompt and assistant response, then append revert confirmation
    setChatMessages(prev => {
      const cleared = prev.length >= 2 ? prev.slice(0, -2) : prev;
      return [
        ...cleared,
        {
          id: `revert-${Date.now()}`,
          sender: 'assistant',
          text: "Design reverted back to your previous layout.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    });
  };

  if (sections.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No sections to display. Please generate a website first.
      </div>
    );
  }

  // Inject custom theme CSS variables
  const activeTheme = currentTheme || theme;
  const themeStyle = activeTheme ? {
    '--color-primary': activeTheme.primary,
    '--color-secondary': activeTheme.secondary,
    '--color-bg-base': activeTheme.background,
    '--color-text-base': isLight(activeTheme.background) ? '#000000' : '#ffffff',
  } : {};

  // Non-footer sections for the preview area
  const mainSections = sections.filter(s => s.type !== 'footer');
  const footerSection = sections.find(s => s.type === 'footer');

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#080808]" style={themeStyle}>
      {/* Left Sidebar */}
      <div className="w-80 bg-[#121212] border-r border-white/10 flex flex-col shadow-2xl relative z-10 shrink-0">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-white tracking-wide uppercase">Live Preview</h1>
            <p className="text-[10px] text-white/40 tracking-wider">AI Editor & Host</p>
          </div>
          <button
            onClick={() => {
              if (currentPublishedSubdomain || websiteId) {
                navigate(`/workspace?id=${websiteId || currentPublishedSubdomain}`);
              } else {
                navigate('/home');
              }
            }}
            className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded text-[10px] uppercase font-bold tracking-wider transition-all"
          >
            Exit
          </button>
        </div>

        {/* Sidebar Segmented Control Tabs */}
        <div className="relative border-b border-white/10 bg-white/[0.02] flex items-center group/tabs h-10 overflow-hidden">
          {showLeftArrow && (
            <button 
              type="button"
              onClick={() => {
                const el = document.getElementById('sidebar-tabs-scroll');
                if (el) el.scrollLeft -= 80;
              }}
              className="absolute left-0 top-0 bottom-0 px-1 bg-[#121212]/90 hover:bg-[#121212] hover:text-white text-white/50 flex items-center justify-center transition-all z-20 shadow-[2px_0_8px_rgba(0,0,0,0.5)] h-full"
              title="Previous tab"
            >
              <ChevronLeft size={11} />
            </button>
          )}

          <div 
            id="sidebar-tabs-scroll"
            onScroll={(e) => {
              const el = e.currentTarget;
              setShowLeftArrow(el.scrollLeft > 5);
              setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
            }}
            className="flex-1 flex overflow-x-auto scrollbar-none p-1 gap-1 scroll-smooth h-full items-center"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            <button
              onClick={() => {
                setActiveTab('refine');
                setIsEditingText(false);
              }}
              className={`shrink-0 px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 rounded h-[28px] ${
                activeTab === 'refine' ? 'bg-[#d4f000] text-[#080808]' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={10} /> AI Refine
            </button>

            <button
              onClick={() => {
                setActiveTab('theme');
                setIsEditingText(false);
              }}
              className={`shrink-0 px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 rounded h-[28px] ${
                activeTab === 'theme' ? 'bg-[#d4f000] text-[#080808]' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette size={10} /> Theme
            </button>

            <button
              onClick={() => {
                setActiveTab('media');
                setIsEditingText(false);
              }}
              className={`shrink-0 px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 rounded h-[28px] ${
                activeTab === 'media' ? 'bg-[#d4f000] text-[#080808]' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Image size={10} /> Media
            </button>

            <button
              onClick={() => {
                setActiveTab('sections');
                setIsEditingText(false);
              }}
              className={`shrink-0 px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 rounded h-[28px] ${
                activeTab === 'sections' ? 'bg-[#d4f000] text-[#080808]' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Grid size={10} /> Sections
            </button>
          </div>

          {showRightArrow && (
            <button 
              type="button"
              onClick={() => {
                const el = document.getElementById('sidebar-tabs-scroll');
                if (el) el.scrollLeft += 80;
              }}
              className="absolute right-0 top-0 bottom-0 px-1.5 bg-[#121212]/90 hover:bg-[#121212] hover:text-white text-white/50 flex items-center justify-center transition-all z-20 shadow-[-2px_0_8px_rgba(0,0,0,0.5)] h-full"
              title="Next tab"
            >
              <ChevronRight size={11} />
            </button>
          )}
        </div>

        {/* Sidebar Panel Content */}
        <div className="flex-1 flex flex-col min-h-0">


          {activeTab === 'refine' && (
            <div className="flex-1 flex flex-col min-h-0">

              {/* Chat Messages Feed */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3.5 bg-black/40">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 pb-4 rounded-lg text-xs leading-relaxed relative shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-[#d4f000] text-[#080808] font-semibold rounded-tr-none'
                          : 'bg-[#1a1a1a] border border-white/5 text-white/90 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className={`absolute bottom-1 right-2 text-[8px] font-mono select-none ${
                        msg.sender === 'user' ? 'text-[#080808]/50' : 'text-white/30'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                {isRefining && (
                  <div className="flex flex-col items-start gap-1">
                    <div className="bg-[#1a1a1a] border border-white/5 text-white/60 p-3 rounded-lg rounded-tl-none text-xs flex items-center gap-2 animate-pulse">
                      <Loader2 size={12} className="animate-spin text-[#d4f000]" />
                      <span>AI is updating your website...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>


              {previousHistoryState && (
                <div className="p-2.5 bg-[#d4f000]/10 border-t border-[#d4f000]/25 flex items-center justify-between text-xs text-white px-3 gap-2">
                  <span className="text-[10px] text-white/70">Undo last AI update?</span>
                  <button
                    type="button"
                    onClick={handleRevert}
                    className="px-2.5 py-1 bg-[#d4f000] text-[#080808] hover:bg-[#b8d000] font-black uppercase rounded text-[9px] tracking-wide shrink-0 transition-colors"
                  >
                    Revert
                  </button>
                </div>
              )}

              {/* Chat Input Form */}
              <form onSubmit={handleRefine} className="p-3 bg-[#121212] border-t border-white/10 flex flex-col gap-2">
                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (instruction.trim() && !isRefining) {
                        handleRefine(e);
                      }
                    }
                  }}
                  disabled={isRefining}
                  rows={2}
                  placeholder="Ask AI (e.g. 'Change background to black & white and add a secondary button')..."
                  className="w-full bg-white/5 border border-white/10 focus:border-[#d4f000] text-white placeholder-white/20 p-2.5 outline-none text-xs resize-none transition-colors rounded"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-white/30 font-mono">Press Enter to send</span>
                  <button
                    type="submit"
                    disabled={isRefining || !instruction.trim()}
                    className="bg-[#d4f000] text-[#080808] px-4 py-1.5 font-bold uppercase tracking-wider text-[10px] hover:bg-[#b8d000] disabled:bg-white/10 disabled:text-white/30 transition-colors flex items-center gap-1.5 rounded"
                  >
                    {isRefining ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    {isRefining ? 'Thinking...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Current Sections List */}
              <div>
                <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3">
                  Active Sections
                </h3>
                <div className="space-y-1.5">
                  {sections.filter(s => s.type !== 'footer').map((section, idx) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between bg-white/5 border border-white/10 hover:border-white/20 rounded px-3 py-2 group/item transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#d4f000] shrink-0" />
                        <span className="text-xs font-bold uppercase text-white/80 tracking-wider capitalize">
                          {section.type}
                        </span>
                      </div>
                      <button
                        type="button"
                        title="Remove section"
                        onClick={() => {
                          if (window.confirm(`Remove the ${section.type} section?`)) {
                            handleRemoveSection(section.id);
                          }
                        }}
                        className="p-1 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover/item:opacity-100 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {sections.find(s => s.type === 'footer') && (
                    <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded px-3 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                      <span className="text-xs font-bold uppercase text-white/30 tracking-wider">
                        Footer (fixed)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Add New Section */}
              <div>
                <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3">
                  Add a Section
                </h3>
                <div className="space-y-2">
                  {[
                    { type: 'hero', label: 'Hero / Banner', icon: '⚡', desc: 'Large headline & CTA' },
                    { type: 'about', label: 'About Us', icon: 'ℹ️', desc: 'Team, mission, story' },
                    { type: 'features', label: 'Features Grid', icon: '⭐', desc: 'Key features & benefits' },
                    { type: 'pricing', label: 'Pricing Plans', icon: '💰', desc: 'Subscription tiers' },
                    { type: 'portfolio', label: 'Portfolio', icon: '🖼️', desc: 'Project showcase grid' },
                    { type: 'testimonials', label: 'Testimonials', icon: '💬', desc: 'Customer reviews' },
                    { type: 'faq', label: 'FAQ', icon: '❓', desc: 'Accordion questions' },
                    { type: 'contact', label: 'Contact', icon: '📞', desc: 'Contact form & info' },
                  ].map(comp => {
                    const alreadyAdded = sections.some(s => s.type === comp.type);
                    return (
                      <button
                        key={comp.type}
                        type="button"
                        onClick={() => handleAddSection(comp.type)}
                        className={`w-full flex items-center justify-between gap-3 p-2.5 rounded border text-left transition-all ${
                          alreadyAdded
                            ? 'border-[#d4f000]/30 bg-[#d4f000]/5 cursor-pointer hover:bg-[#d4f000]/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base leading-none">{comp.icon}</span>
                          <div>
                            <p className={`text-[11px] font-bold uppercase tracking-wider ${alreadyAdded ? 'text-[#d4f000]' : 'text-white/80'}`}>
                              {comp.label}
                            </p>
                            <p className="text-[9px] text-white/30 mt-0.5">{comp.desc}</p>
                          </div>
                        </div>
                        <div className={`shrink-0 w-5 h-5 rounded flex items-center justify-center ${alreadyAdded ? 'bg-[#d4f000]/20 text-[#d4f000]' : 'bg-white/10 text-white/50'}`}>
                          <Plus size={11} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-5 flex-1 overflow-y-auto p-4">
              {/* Feel Selector */}
              <div>
                <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2.5">
                  Website Feel & Style
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {FEELS.map((f) => {
                    const active = (currentFeel || feel) === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setCurrentFeel(f.id);
                          const presets = THEMES_BY_FEEL[f.id];
                          if (presets && presets.length > 0) {
                            setCurrentTheme(presets[0].colors);
                          }
                        }}
                        className={`p-2 rounded border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all text-left ${
                          active
                            ? 'bg-[#d4f000] text-[#080808] border-[#d4f000]'
                            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span>{f.icon}</span>
                        <span className="truncate">{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Theme Color Palettes */}
              <div>
                <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2.5 flex justify-between items-center">
                  <span>Color Theme Presets</span>
                  <span className="text-[#d4f000] font-mono text-[9px]">
                    {(currentFeel || feel || 'all').toUpperCase()}
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {(THEMES_BY_FEEL[currentFeel || feel] || ALL_THEMES).map((preset) => {
                    const isSelected =
                      currentTheme?.primary === preset.colors.primary &&
                      currentTheme?.background === preset.colors.background;

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setCurrentTheme(preset.colors)}
                        className={`p-2.5 rounded border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-[#d4f000] bg-[#d4f000]/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#d4f000]' : 'text-white/80'}`}>
                          {preset.name}
                        </span>
                        <div className="flex gap-1 items-center">
                          {[preset.colors.primary, preset.colors.secondary, preset.colors.background].map((c, i) => (
                            <div
                              key={i}
                              style={{ backgroundColor: c }}
                              className="w-3.5 h-6 rounded-sm border border-white/20 shadow-sm"
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Palette */}
              <div className="border border-white/10 bg-white/[0.02] p-3 rounded space-y-3">
                <h3 className="text-[10px] font-bold text-[#d4f000] uppercase tracking-widest">
                  Custom Color Palette
                </h3>

                {/* Primary Color */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      style={{ backgroundColor: currentTheme?.primary || '#d4f000' }}
                      className="w-5 h-5 rounded border border-white/20 shrink-0"
                    />
                    <span className="text-xs text-white/70 font-medium">Primary / Accent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40 font-mono">
                      {currentTheme?.primary || '#d4f000'}
                    </span>
                    <input
                      type="color"
                      value={currentTheme?.primary || '#d4f000'}
                      onChange={(e) =>
                        setCurrentTheme((prev) => ({
                          ...(prev || {}),
                          primary: e.target.value,
                        }))
                      }
                      className="w-7 h-6 rounded border border-white/20 bg-transparent cursor-pointer p-0.5"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      style={{ backgroundColor: currentTheme?.secondary || '#222222' }}
                      className="w-5 h-5 rounded border border-white/20 shrink-0"
                    />
                    <span className="text-xs text-white/70 font-medium">Secondary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40 font-mono">
                      {currentTheme?.secondary || '#222222'}
                    </span>
                    <input
                      type="color"
                      value={currentTheme?.secondary || '#222222'}
                      onChange={(e) =>
                        setCurrentTheme((prev) => ({
                          ...(prev || {}),
                          secondary: e.target.value,
                        }))
                      }
                      className="w-7 h-6 rounded border border-white/20 bg-transparent cursor-pointer p-0.5"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      style={{ backgroundColor: currentTheme?.background || '#080808' }}
                      className="w-5 h-5 rounded border border-white/20 shrink-0"
                    />
                    <span className="text-xs text-white/70 font-medium">Canvas Background</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40 font-mono">
                      {currentTheme?.background || '#080808'}
                    </span>
                    <input
                      type="color"
                      value={currentTheme?.background || '#080808'}
                      onChange={(e) =>
                        setCurrentTheme((prev) => ({
                          ...(prev || {}),
                          background: e.target.value,
                        }))
                      }
                      className="w-7 h-6 rounded border border-white/20 bg-transparent cursor-pointer p-0.5"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-5 flex-1 overflow-y-auto p-4">
              {selectedImageId && (
                <div className="border border-[#d4f000]/30 bg-[#d4f000]/5 p-3 rounded mb-4">
                  <h4 className="text-[10px] font-black uppercase text-[#d4f000] tracking-wider mb-2 flex justify-between items-center">
                    <span>Selected Image Inspector</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSiteImages(prev => prev.filter(item => item.id !== selectedImageId));
                        setSelectedImageId(null);
                      }}
                      className="text-red-400 hover:text-red-500 font-bold uppercase text-[9px] hover:scale-105 transition-transform"
                    >
                      Delete
                    </button>
                  </h4>
                  <div className="space-y-4">
                    {/* Layering Controls */}
                    <div>
                      <label className="text-[8px] font-bold uppercase text-white/40 block mb-1.5">Layer Arrangement</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => changeElementLayer(selectedImageId, 'forward')}
                          className="py-1.5 text-[9px] font-bold uppercase rounded border bg-white/5 text-white/80 border-white/10 hover:bg-white/10 transition-colors"
                        >
                          Bring Forward
                        </button>
                                                <button
                          type="button"
                          onClick={() => changeElementLayer(selectedImageId, 'backward')}
                          className="py-1.5 text-[9px] font-bold uppercase rounded border bg-white/5 text-white/80 border-white/10 hover:bg-white/10 transition-colors"
                        >
                          Send Backward
                        </button>
                      </div>
                    </div>

                    {/* Corner Radius */}
                    <div>
                      <div className="flex justify-between text-[9px] font-bold text-white/55 uppercase mb-1">
                        <span>Corner Radius</span>
                        <span className="text-[#d4f000]">
                          {siteImages.find(img => img.id === selectedImageId)?.borderRadius || 0}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        step="2"
                        value={siteImages.find(img => img.id === selectedImageId)?.borderRadius || 0}
                        onChange={(e) => {
                          const rad = Number(e.target.value);
                          setSiteImages(prev => prev.map(item => item.id === selectedImageId ? { ...item, borderRadius: rad } : item));
                        }}
                        className="w-full accent-[#d4f000]"
                      />
                    </div>

                    {/* Opacity */}
                    <div>
                      <div className="flex justify-between text-[9px] font-bold text-white/55 uppercase mb-1">
                        <span>Opacity</span>
                        <span className="text-[#d4f000]">
                          {Math.round((siteImages.find(img => img.id === selectedImageId)?.opacity ?? 1) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={siteImages.find(img => img.id === selectedImageId)?.opacity ?? 1}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSiteImages(prev => prev.map(item => item.id === selectedImageId ? { ...item, opacity: val } : item));
                        }}
                        className="w-full accent-[#d4f000]"
                      />
                    </div>

                    {/* Blur */}
                    <div>
                      <div className="flex justify-between text-[9px] font-bold text-white/55 uppercase mb-1">
                        <span>Blur Effects</span>
                        <span className="text-[#d4f000]">
                          {siteImages.find(img => img.id === selectedImageId)?.blur || 0}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={siteImages.find(img => img.id === selectedImageId)?.blur || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSiteImages(prev => prev.map(item => item.id === selectedImageId ? { ...item, blur: val } : item));
                        }}
                        className="w-full accent-[#d4f000]"
                      />
                    </div>

                    {/* Shadows */}
                    <div>
                      <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Shadow Preset</label>
                      <select
                        value={siteImages.find(img => img.id === selectedImageId)?.shadow || 'none'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSiteImages(prev => prev.map(item => item.id === selectedImageId ? { ...item, shadow: val } : item));
                        }}
                        className="w-full bg-[#121212] border border-white/10 text-white p-1.5 text-[10px] outline-none rounded"
                      >
                        <option value="none">None</option>
                        <option value="soft">Soft Shadow</option>
                        <option value="medium">Medium Shadow</option>
                        <option value="hard">Hard / Dramatic Shadow</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload section */}
              <div>
                <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Add New Image</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-[#d4f000] hover:bg-white/5 p-4 rounded cursor-pointer transition-colors text-xs font-bold text-white/70">
                    <Upload size={14} />
                    <span>Upload Local File</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>

                  <div className="text-[9px] font-bold text-white/20 text-center uppercase">Or Custom URL</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://example.com/image.png"
                      className="flex-1 bg-white/5 border border-white/10 focus:border-[#d4f000] text-white p-2 outline-none text-xs"
                    />
                    {mediaUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          const previewContainer = document.getElementById('preview-scroll-container');
                          const x = previewContainer ? (previewContainer.clientWidth / 2 + previewContainer.scrollLeft) : 300;
                          const y = previewContainer ? (previewContainer.clientHeight / 2 + previewContainer.scrollTop) : 200;
                          addNewFloatingElement('image', x, y, mediaUrl);
                        }}
                        className="bg-[#d4f000] text-[#080808] font-bold text-xs px-3 hover:bg-[#b8d000] rounded transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Uploaded Library */}
              {uploadedLibrary.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Uploaded Library</h3>
                  <p className="text-[9px] text-white/40 mb-2">Drag and drop onto preview, or click to add</p>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {uploadedLibrary.map((url, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', url);
                        }}
                        onClick={() => {
                          const previewContainer = document.getElementById('preview-scroll-container');
                          const x = previewContainer ? (previewContainer.clientWidth / 2 + previewContainer.scrollLeft) : 300;
                          const y = previewContainer ? (previewContainer.clientHeight / 2 + previewContainer.scrollTop) : 200;
                          addNewFloatingElement('image', x, y, url);
                        }}
                        className="relative aspect-[3/2] rounded overflow-hidden border cursor-grab active:cursor-grabbing border-white/10 hover:border-[#d4f000]/50 transition-all group"
                      >
                        <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover pointer-events-none" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedLibrary(prev => prev.filter(item => item !== url));
                            if (mediaUrl === url) setMediaUrl('');
                          }}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 z-10 hover:scale-110 transition-transform"
                        >
                          <Trash2 size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COMPONENTS TAB DISABLED */ false && activeTab === 'components' && (
            <div className="space-y-5 flex-1 overflow-y-auto p-4">
              {/* Selected Floating Widget Inspector */}
              {(() => {
                const selectedElement = siteImages.find(img => img.id === selectedImageId);
                if (!selectedElement) return null;

                const updateElement = (key, val) => {
                  setSiteImages(prev => prev.map(item => item.id === selectedImageId ? { ...item, [key]: val } : item));
                };

                return (
                  <div className="border border-[#d4f000]/30 bg-[#d4f000]/5 p-3 rounded mb-4">
                    <h4 className="text-[10px] font-black uppercase text-[#d4f000] tracking-wider mb-2.5 flex justify-between items-center">
                      <span>Selected Widget: {selectedElement.type === 'text' ? 'Floating Text' : selectedElement.type}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSiteImages(prev => prev.filter(item => item.id !== selectedImageId));
                          setSelectedImageId(null);
                        }}
                        className="text-red-400 hover:text-red-500 font-bold uppercase text-[9px] hover:scale-105 transition-transform"
                      >
                        Delete
                      </button>
                    </h4>
                    <div className="space-y-3.5">
                      {/* Button Text (if button) */}
                      {selectedElement.type === 'button' && (
                        <div>
                          <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Button Text</label>
                          <input
                            type="text"
                            value={selectedElement.text || ''}
                            onChange={(e) => updateElement('text', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-[#d4f000] text-white p-2 outline-none text-xs rounded"
                          />
                        </div>
                      )}

                      {/* Link URL (if button) */}
                      {selectedElement.type === 'button' && (
                        <div>
                          <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Link URL</label>
                          <input
                            type="text"
                            value={selectedElement.link || ''}
                            onChange={(e) => updateElement('link', e.target.value)}
                            placeholder="https://example.com"
                            className="w-full bg-white/5 border border-white/10 focus:border-[#d4f000] text-white p-2 outline-none text-xs rounded"
                          />
                        </div>
                      )}

                      {/* Text Content (if text block) */}
                      {selectedElement.type === 'text' && (
                        <div>
                          <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Text Content</label>
                          <textarea
                            value={selectedElement.text || ''}
                            onChange={(e) => updateElement('text', e.target.value)}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 focus:border-[#d4f000] text-white p-2 outline-none text-xs rounded resize-none"
                          />
                        </div>
                      )}

                      {/* Image URL (if image) */}
                      {selectedElement.type === 'image' && (
                        <div>
                          <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Image URL</label>
                          <input
                            type="text"
                            value={selectedElement.url || ''}
                            onChange={(e) => updateElement('url', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-[#d4f000] text-white p-2 outline-none text-xs rounded"
                          />
                        </div>
                      )}

                      {/* Background Color (if button or shape) */}
                      {(selectedElement.type === 'button' || selectedElement.type === 'shape') && (
                        <div>
                          <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Color / Fill</label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={selectedElement.color || '#d4f000'}
                              onChange={(e) => updateElement('color', e.target.value)}
                              className="w-8 h-7 rounded border border-white/20 bg-transparent cursor-pointer p-0.5"
                            />
                            <span className="text-xs text-white/70 font-mono">{selectedElement.color || '#d4f000'}</span>
                          </div>
                        </div>
                      )}

                      {/* Text Color (if button or text) */}
                      {(selectedElement.type === 'button' || selectedElement.type === 'text') && (
                        <div>
                          <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Text Color</label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={selectedElement.textColor || '#ffffff'}
                              onChange={(e) => updateElement('textColor', e.target.value)}
                              className="w-8 h-7 rounded border border-white/20 bg-transparent cursor-pointer p-0.5"
                            />
                            <span className="text-xs text-white/70 font-mono">{selectedElement.textColor || '#ffffff'}</span>
                          </div>
                        </div>
                      )}

                      {/* Font Size (if text box) */}
                      {selectedElement.type === 'text' && (
                        <div>
                          <div className="flex justify-between text-[9px] font-bold text-white/40 uppercase mb-1">
                            <span>Font Size</span>
                            <span className="text-[#d4f000]">{selectedElement.fontSize || 16}px</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="72"
                            value={selectedElement.fontSize || 16}
                            onChange={(e) => updateElement('fontSize', Number(e.target.value))}
                            className="w-full accent-[#d4f000]"
                          />
                        </div>
                      )}

                      {/* Font Family (if text box) */}
                      {selectedElement.type === 'text' && (
                        <div>
                          <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Font Family</label>
                          <select
                            value={selectedElement.fontFamily || 'Inter'}
                            onChange={(e) => updateElement('fontFamily', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-[#d4f000] text-white p-2 outline-none text-xs rounded"
                          >
                            <option value="Inter" className="bg-[#121212] text-white">Inter (Sans-serif)</option>
                            <option value="Outfit" className="bg-[#121212] text-white">Outfit (Modern)</option>
                            <option value="'Playfair Display'" className="bg-[#121212] text-white">Playfair Display (Serif)</option>
                            <option value="'Courier Prime'" className="bg-[#121212] text-white">Courier Prime (Monospace)</option>
                          </select>
                        </div>
                      )}

                      {/* Text Alignment (if text box) */}
                      {selectedElement.type === 'text' && (
                        <div>
                          <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Text Alignment</label>
                          <div className="flex bg-white/5 border border-white/10 rounded overflow-hidden">
                            {['left', 'center', 'right'].map((align) => (
                              <button
                                key={align}
                                type="button"
                                onClick={() => updateElement('textAlign', align)}
                                className={`flex-1 py-1.5 text-[9px] font-bold uppercase transition-colors ${
                                  (selectedElement.textAlign || 'left') === align
                                    ? 'bg-[#d4f000] text-[#080808]'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                {align}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Border Radius */}
                      {selectedElement.type !== 'text' && (
                        <div>
                          <div className="flex justify-between text-[9px] font-bold text-white/40 uppercase mb-1">
                            <span>Corner Radius</span>
                            <span className="text-[#d4f000]">{selectedElement.borderRadius || 0}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            value={selectedElement.borderRadius || 0}
                            onChange={(e) => updateElement('borderRadius', Number(e.target.value))}
                            className="w-full accent-[#d4f000]"
                          />
                        </div>
                      )}

                      {/* Layering Z-Index */}
                                            <div>
                        <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Z-Index Layering</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => changeElementLayer(selectedImageId, 'forward')}
                            className="py-1.5 text-[9px] font-bold uppercase rounded border bg-white/5 text-white/80 border-white/10 hover:bg-white/10 transition-colors"
                          >
                            Bring Forward
                          </button>
                          <button
                            type="button"
                            onClick={() => changeElementLayer(selectedImageId, 'backward')}
                            className="py-1.5 text-[9px] font-bold uppercase rounded border bg-white/5 text-white/80 border-white/10 hover:bg-white/10 transition-colors"
                          >
                            Send Backward
                          </button>
                        </div>
                      </div>
                      {/* Opacity */}
                      <div>
                        <div className="flex justify-between text-[9px] font-bold text-white/40 uppercase mb-1">
                          <span>Opacity</span>
                          <span className="text-[#d4f000]">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={selectedElement.opacity ?? 1}
                          onChange={(e) => updateElement('opacity', Number(e.target.value))}
                          className="w-full accent-[#d4f000]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3">
                  Drag & Drop Components
                </h3>
                <div className="space-y-3">
                  {[
                    { type: 'text', label: 'Floating Text Box', icon: 'fa-solid fa-font' },
                    { type: 'button', label: 'Interactive Button', icon: 'fa-solid fa-mouse-pointer' },
                    { type: 'shape', label: 'Colored Card / Shape', icon: 'fa-solid fa-shapes' }
                  ].map((comp) => (
                    <div
                      key={comp.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('component-type', comp.type);
                      }}
                      onClick={() => {
                        const previewContainer = document.getElementById('preview-scroll-container');
                        const x = previewContainer ? (previewContainer.clientWidth / 2) : 300;
                        const y = previewContainer ? (previewContainer.clientHeight / 2) : 200;
                        addNewFloatingElement(comp.type, x, y);
                      }}
                      className="w-full border border-white/10 hover:border-[#d4f000]/50 hover:bg-white/[0.04] bg-white/[0.01] rounded-lg p-3 text-left transition-all flex items-start gap-3 cursor-grab active:cursor-grabbing group"
                    >
                      <div className="w-8 h-8 rounded bg-white/5 group-hover:bg-[#d4f000]/10 flex items-center justify-center text-xs shrink-0 transition-colors text-white/70 group-hover:text-[#d4f000]">
                        <i className={comp.icon}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-black uppercase text-white tracking-wide group-hover:text-[#d4f000] transition-colors">
                            {comp.label}
                          </span>
                          <span className="text-[8px] font-bold text-white/35 uppercase tracking-widest flex items-center gap-0.5 border border-white/5 px-1 rounded bg-black/10">
                            DRAG
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-white/40 font-semibold tracking-wider uppercase text-[10px]">Cloud Sync</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-yellow-400 animate-pulse' : saveError ? 'bg-red-400 animate-bounce' : 'bg-emerald-400'}`} />
              <span className={`font-bold transition-all text-[11px] ${isSaving ? 'text-yellow-400' : saveError ? 'text-red-400' : 'text-emerald-400'}`}>
                {isSaving ? 'Saving...' : saveError ? 'Save Failed' : 'Saved'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={openPublishModal}
            className="w-full bg-[#d4f000] hover:bg-[#b8d000] text-[#080808] py-2.5 rounded font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-md">
            {currentPublishedSubdomain ? 'Republish Web App' : 'Publish to Web'}
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div 
        id="preview-scroll-container"
        onDragOver={handlePreviewDragOver}
        onDrop={handlePreviewDrop}
        onMouseDown={handlePreviewClick}
        className="flex-1 overflow-auto relative" 
        style={{ 
          backgroundColor: 'var(--color-bg-base, #ffffff)',
          color: `var(--color-text-base, ${isLight(activeTheme?.background) ? '#000000' : '#ffffff'})`
        }}
      >
        {/* Generated Site Navbar */}
        <SiteNavbar businessName={businessName} sections={sections} theme={currentTheme || theme} logo={logo} feel={feel} />

        {/* Offset parent wrapper for sections and floating images, matching published side */}
        <div className="relative">
          {/* Floating Images Layer */}
          {siteImages.map(img => (
            <FloatingImage
              key={img.id}
              image={img}
              isEditable={activeTab === 'media' || activeTab === 'components'}
              isSelected={selectedImageId === img.id}
              selectedText={selectedText}
              onSelect={() => {
                setSelectedImageId(img.id);
                if (img.type === 'button' || img.type === 'shape' || img.type === 'text') {
                  setActiveTab('components');
                } else if (activeTab !== 'components') {
                  setActiveTab('media');
                }
                setIsEditingText(false);
              }}
              onUpdate={(updated) => {
                setSiteImages(prev => prev.map(item => item.id === img.id ? updated : item));
              }}
              onDelete={() => {
                setSiteImages(prev => prev.filter(item => item.id !== img.id));
                if (selectedImageId === img.id) setSelectedImageId(null);
              }}
            />
          ))}

          {/* Sections */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="min-h-full w-full">
                {mainSections.map((section, idx) => (
                  <SortableSection 
                    key={section.id} 
                    id={section.id} 
                    section={section} 
                    feel={currentFeel || feel} 
                    isEditingText={true}
                    isExpanded={expandedSectionId === section.id}
                    onClick={() => setExpandedSectionId(section.id)}
                    onUpdateText={handleContentChange}
                    activeTab={activeTab}
                    selectedText={selectedText}
                    onSelectText={(sectId, path) => {
                      setSelectedText({ sectionId: sectId, path });
                    }}
                    onMoveSection={(dir) => handleMoveSection(section.id, dir)}
                    onDeleteSection={() => handleRemoveSection(section.id)}
                    isFirst={idx === 0}
                    isLast={idx === mainSections.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Footer always at bottom */}
          {footerSection && (
            <div 
              id={`section-${footerSection.id}`}
              onClick={() => setExpandedSectionId(footerSection.id)}
              className={`transition-all duration-300 relative z-0 cursor-pointer ${
                expandedSectionId === footerSection.id 
                  ? 'ring-4 ring-[#d4f000] ring-offset-4 ring-offset-black' 
                  : 'hover:ring-2 hover:ring-primary hover:ring-inset'
              }`}
            >
              <EditableContext.Provider value={{ 
                isEditingText: true, 
                isMediaMode: activeTab === 'media',
                selectedText,
                onSelectText: (path) => setSelectedText({ sectionId: footerSection.id, path }),
                updateText: (path, val) => handleContentChange(footerSection.id, path, val),
                updateImage: (imgData) => handleContentChange(footerSection.id, 'image', imgData)
              }}>
                <Footer content={footerSection.content || {}} feel={currentFeel || feel} />
              </EditableContext.Provider>
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/10 rounded-xl p-8 max-w-md w-full relative shadow-2xl">
            <button 
              onClick={() => setShowPublishModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Publish Website</h2>
            <p className="text-sm text-white/60 mb-6">Claim your subdomain and go live instantly.</p>
            
            {publishSuccessUrl ? (
              <div className="space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-4 text-center">
                  <p className="text-emerald-400 font-bold mb-2 flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Published Successfully!
                  </p>
                  <a href={publishSuccessUrl} target="_blank" rel="noreferrer" className="text-white hover:text-[#d4f000] transition-colors break-all text-sm block mb-1">
                    {publishSuccessUrl}
                  </a>
                  <p className="text-[10px] text-white/40">It may take a few moments for DNS to propagate.</p>
                </div>
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="w-full bg-[#d4f000] text-[#080808] font-bold uppercase tracking-wider py-3 rounded"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePublish} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Subdomain</label>
                    {subdomainStatus === 'checking' && <span className="text-[10px] text-white/40 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Checking...</span>}
                    {subdomainStatus === 'available' && <span className="text-[10px] text-emerald-400 flex items-center gap-1"><CheckCircle2 size={10} /> Available!</span>}
                    {subdomainStatus === 'taken' && <span className="text-[10px] text-red-400">✗ Already taken</span>}
                    {subdomainStatus === 'yours' && <span className="text-[10px] text-[#d4f000]">✓ Your domain</span>}
                  </div>
                  <div className="flex items-stretch">
                    <input
                      type="text"
                      value={subdomainInput}
                      onChange={handleSubdomainChange}
                      placeholder="my-startup"
                      className={`flex-1 bg-white/5 border border-r-0 rounded-l p-3 text-white focus:outline-none transition-colors ${
                        subdomainStatus === 'taken' ? 'border-red-500/60 focus:border-red-500' :
                        subdomainStatus === 'available' ? 'border-emerald-500/60 focus:border-emerald-500' :
                        subdomainStatus === 'yours' ? 'border-[#d4f000]/50 focus:border-[#d4f000]' :
                        'border-white/10 focus:border-[#d4f000]'
                      }`}
                      required
                    />
                    <span className="bg-white/5 border border-l-0 border-white/10 rounded-r p-3 text-white/40 select-none text-xs flex items-center">
                      .flow.devshahid.me
                    </span>
                  </div>
                </div>

                {publishError && (
                  <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded">{publishError}</p>
                )}

                <button
                  type="submit"
                  disabled={isPublishing || !subdomainInput || subdomainStatus === 'taken' || subdomainStatus === 'checking'}
                  className="w-full bg-[#d4f000] text-[#080808] font-bold uppercase tracking-wider py-3 rounded hover:bg-[#b8d000] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? <Loader2 size={16} className="animate-spin" /> :
                   currentPublishedSubdomain && subdomainInput.trim() === currentPublishedSubdomain ? 'Republish (Update Live Site)' :
                   currentPublishedSubdomain ? 'Publish on New Domain' :
                   'Publish Now'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
