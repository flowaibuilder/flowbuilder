import React, { useState, useRef, useEffect } from 'react';
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
import { GripVertical, Sparkles, Send, Loader2, Menu, X, ChevronDown, ChevronUp, Image, Upload, Trash2, Bot, User, Terminal, CheckCircle2 } from 'lucide-react';
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

export function SiteNavbar({ businessName, sections, theme, logo }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = sections
    .filter(s => !['footer'].includes(s.type))
    .map(s => ({
      id: s.id,
      label: s.type.charAt(0).toUpperCase() + s.type.slice(1),
      href: `#section-${s.id}`,
    }));

  const ctaLink = sections.find(s => ['contact', 'pricing', 'products'].includes(s.type));

  const bg = theme?.background || '#ffffff';
  const primary = theme?.primary || '#000000';
  const textColor = isLight(bg) ? '#000000' : '#ffffff';
  const borderColor = isLight(bg) ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  return (
    <nav
      style={{ background: bg, borderBottom: `2px solid ${primary}`, color: textColor }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        {/* Logo / Brand */}
        <a
          href="#section-1"
          className="flex items-center gap-2 text-xl font-black uppercase tracking-wider shrink-0"
          style={{ color: primary }}
        >
          {logo ? (
            <img src={logo} alt={businessName} className="h-8 w-auto object-contain max-h-8" />
          ) : (
            businessName || 'Your Brand'
          )}
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center flex-wrap">
          {navLinks.map(link => (
            <a
              key={link.id}
              href={link.href}
              className="px-3 py-1 text-sm font-bold uppercase tracking-wider transition-all hover:opacity-70"
              style={{ color: textColor }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA button */}
        {ctaLink && (
          <a
            href={`#section-${ctaLink.id}`}
            className="hidden md:inline-block px-5 py-2 text-sm font-black uppercase tracking-wider border-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] shrink-0"
            style={{
              background: primary,
              color: isLight(primary) ? '#000000' : '#ffffff',
              borderColor: textColor,
            }}
          >
            {ctaLink.type === 'contact' ? 'Contact Us' : 'Get Started'}
          </a>
        )}

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: textColor }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t-2 px-6 py-4 flex flex-col gap-3"
          style={{ borderColor: primary, background: bg }}
        >
          {navLinks.map(link => (
            <a
              key={link.id}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-wider py-1"
              style={{ color: textColor }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── SORTABLE SECTION ─────────────────────────────────────────────────────────

function SortableSection({ id, section, feel, isEditingText, isExpanded, onClick, onUpdateText, activeTab, selectedText, onSelectText }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

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
      {!isEditingText && activeTab !== 'media' && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity border border-gray-200"
        >
          <GripVertical size={20} className="text-gray-500" />
        </div>
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
    </div>
  );
}

// ─── WEBSITE BUILDER ──────────────────────────────────────────────────────────

export default function WebsiteBuilder({ initialSpec, theme, businessName, pages, logo, feel, fontStyle, websiteId, onSave }) {
  const [sections, setSections] = useState(
    (initialSpec || []).map((s, idx) => ({ ...s, id: s.id || `section-${idx}` }))
  );

  const [currentTheme, setCurrentTheme] = useState(theme);
  const [currentFeel, setCurrentFeel] = useState(feel);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
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
        website_id: websiteId || null,
        config: {
          businessName,
          sections,
          theme: currentTheme || theme,
          logo,
          feel: currentFeel || feel,
          fontStyle
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
    setSaveSuccess(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to save.');

      const payload = {
        user_id: user.id,
        name: businessName || 'My Website',
        spec: sections,
        theme: currentTheme || theme,
        config: { businessName, pages, logo, feel: currentFeel || feel, fontStyle },
        updated_at: new Date().toISOString()
      };

      if (websiteId) {
        const { error } = await supabase
          .from('saved_websites')
          .update(payload)
          .eq('id', websiteId);
        if (error) throw error;
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
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save project: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };
  const [refineSummary, setRefineSummary] = useState(null);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: 'Hello! I am your Antigravity AI Assistant. Ask me to change background colors (e.g. black & white), add new buttons, update copy, or add new sections!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      trajectory: ['Initialized website specification listener']
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

  const [siteImages, setSiteImages] = useState([]);
  const [uploadedLibrary, setUploadedLibrary] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [selectedText, setSelectedText] = useState(null);

  const handlePreviewClick = (e) => {
    if (activeTab === 'media' && !e.target.closest('.floating-image-container') && !e.target.closest('button')) {
      setSelectedImageId(null);
    }
    if (activeTab === 'text' && !e.target.closest('[contenteditable]') && !e.target.closest('input') && !e.target.closest('select') && !e.target.closest('textarea')) {
      setSelectedText(null);
    }
  };

  const handlePreviewDragOver = (e) => {
    if (activeTab === 'media') {
      e.preventDefault();
    }
  };

  const handlePreviewDrop = (e) => {
    if (activeTab !== 'media') return;
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + e.currentTarget.scrollLeft;
    const y = e.clientY - rect.top + e.currentTarget.scrollTop;

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
        addNewFloatingImage(fileUrl, x, y);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Presets URL drop
    const url = e.dataTransfer.getData('text/plain');
    if (url) {
      addNewFloatingImage(url, x, y);
    }
  };

  const addNewFloatingImage = (url, x, y) => {
    const previewContainer = document.getElementById('preview-scroll-container');
    const containerWidth = previewContainer ? previewContainer.clientWidth : 800;

    const widthPercent = (200 / containerWidth) * 100;
    const xPercent = ((x - 100) / containerWidth) * 100;

    const newImg = {
      id: `float-img-${Date.now()}`,
      url,
      xPercent: Math.max(0, Math.min(100 - widthPercent, xPercent)),
      y: Math.max(0, y - 75),
      widthPercent,
      width: 200,
      height: 150,
      borderRadius: 0
    };
    setSiteImages(prev => [...prev, newImg]);
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
          addNewFloatingImage(fileUrl, x, y);
        } else {
          addNewFloatingImage(fileUrl, 300, 200);
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

      const trajectorySteps = ['Parsed user instruction & section context'];

      if (data.spec && Array.isArray(data.spec)) {
        const newSections = data.spec.map((s, idx) => {
          const existing = sections.find(old => old.id === s.id);
          return { ...s, id: existing ? existing.id : `section-new-${Date.now()}-${idx}` };
        });
        setSections(newSections);
        trajectorySteps.push(`Updated ${newSections.length} section objects`);
      }

      if (data.siteImages && Array.isArray(data.siteImages)) {
        setSiteImages(data.siteImages);
        trajectorySteps.push(`Controlled canvas floating images layer (${data.siteImages.length} images active)`);
      }

      if (data.theme) {
        setCurrentTheme(data.theme);
        trajectorySteps.push(`Applied theme colors: Primary ${data.theme.primary}, Background ${data.theme.background}`);
      }
      if (data.feel) {
        setCurrentFeel(data.feel);
        trajectorySteps.push(`Adjusted layout style feel to: ${data.feel}`);
      }

      const assistantSummary = data.summary || 'Applied requested updates to your website.';
      setRefineSummary(assistantSummary);

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: assistantSummary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        trajectory: trajectorySteps
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Refinement failed:', err);
      const errorMsg = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: '⚠️ Failed to refine: ' + err.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        trajectory: ['Error encountered during execution']
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsRefining(false);
    }
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
  } : {};

  // Non-footer sections for the preview area
  const mainSections = sections.filter(s => s.type !== 'footer');
  const footerSection = sections.find(s => s.type === 'footer');

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#080808]" style={themeStyle}>
      {/* Left Sidebar */}
      <div className="w-80 bg-[#121212] border-r border-white/10 flex flex-col shadow-2xl relative z-10 shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-white tracking-wide uppercase mb-1">Live Preview</h1>
          <p className="text-xs text-white/50 tracking-wider">Drag sections · AI refine · Publish</p>
        </div>

        {/* Sidebar Segmented Control Tabs */}
        <div className="flex border-b border-white/10 bg-white/[0.02] p-1 gap-1">
          <button
            onClick={() => {
              setActiveTab('refine');
              setIsEditingText(false);
            }}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 rounded ${
              activeTab === 'refine' ? 'bg-[#d4f000] text-[#080808]' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={11} /> AI Refine
          </button>
          <button
            onClick={() => {
              setActiveTab('text');
              setIsEditingText(true);
            }}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 rounded ${
              activeTab === 'text' ? 'bg-[#d4f000] text-[#080808]' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Text Edit
          </button>
          <button
            onClick={() => {
              setActiveTab('media');
              setIsEditingText(false);
            }}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 rounded ${
              activeTab === 'media' ? 'bg-[#d4f000] text-[#080808]' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Image size={11} /> Media
          </button>
        </div>

        {/* Sidebar Panel Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'text' && (
            <div className="space-y-4">
              {selectedText && (
                <div className="border border-[#d4f000]/30 bg-[#d4f000]/5 p-3 rounded mb-4">
                  <h4 className="text-[10px] font-black uppercase text-[#d4f000] tracking-wider mb-2">
                    Selected Text Inspector
                  </h4>
                  {(() => {
                    const { sectionId, path } = selectedText;
                    const section = sections.find(s => s.id === sectionId);
                    if (!section) return null;

                    const parts = path.split('.');
                    let val = section.content;
                    for (const p of parts) {
                      val = val?.[p];
                    }

                    const isStyledText = val && typeof val === 'object' && ('text' in val);
                    const textValue = isStyledText ? (val.text || '') : String(val || '');

                    const updateStyle = (styleKey, styleVal) => {
                      const currentValObj = isStyledText ? val : { text: String(val || '') };
                      handleContentChange(sectionId, path, {
                        ...currentValObj,
                        [styleKey]: styleVal
                      });
                    };

                    return (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-bold text-white/50 uppercase block mb-1">Content</label>
                          <textarea
                            value={textValue}
                            onChange={(e) => {
                              if (isStyledText) {
                                updateStyle('text', e.target.value);
                              } else {
                                handleContentChange(sectionId, path, e.target.value);
                              }
                            }}
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 focus:border-[#d4f000] text-white p-2 outline-none text-xs resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Font Family</label>
                            <select
                              value={isStyledText && val.fontFamily ? val.fontFamily : 'Inter'}
                              onChange={(e) => updateStyle('fontFamily', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 text-white p-1 text-[10px] outline-none rounded"
                            >
                              <option value="Inter" className="bg-[#121212] text-white">Sans: Inter</option>
                              <option value="Outfit" className="bg-[#121212] text-white">Sans: Outfit</option>
                              <option value="'Playfair Display'" className="bg-[#121212] text-white">Serif: Playfair</option>
                              <option value="'Courier Prime'" className="bg-[#121212] text-white">Mono: Courier</option>
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

                        <div>
                          <div className="flex justify-between text-[9px] font-bold text-white/50 uppercase">
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

                        <div>
                          <label className="text-[8px] font-bold uppercase text-white/40 block mb-1">Align</label>
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
                    );
                  })()}
                </div>
              )}
              
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">Edit All Text</p>
              {sections.map(s => {
                const isExpanded = expandedSectionId === s.id;
                return (
                  <div key={s.id} className="border border-white/10 bg-white/[0.02] rounded overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedSectionId(isExpanded ? null : s.id)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-all"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        {s.type}
                      </span>
                      {isExpanded ? <ChevronUp size={14} className="text-white/60" /> : <ChevronDown size={14} className="text-white/60" />}
                    </button>
                    {isExpanded && (
                      <div className="p-3 border-t border-white/10 bg-black/20">
                        {renderEditableFields(s.id, s.content)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'refine' && (
            <div className="flex flex-col h-full -mx-4 -my-4">
              {/* Antigravity AI Chat Header */}
              <div className="p-3 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-[#d4f000]/20 flex items-center justify-center text-[#d4f000] border border-[#d4f000]/40 shadow-[0_0_10px_rgba(212,240,0,0.2)]">
                      <Bot size={14} />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white tracking-wide uppercase flex items-center gap-1.5">
                      Antigravity AI
                      <span className="text-[8px] bg-[#d4f000]/10 text-[#d4f000] border border-[#d4f000]/30 px-1.5 py-0.5 rounded font-bold tracking-widest">
                        AGENT
                      </span>
                    </h3>
                    <p className="text-[9px] text-white/40 font-mono">Live Preview Integration Active</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setChatMessages([
                    {
                      id: 'msg-init',
                      sender: 'assistant',
                      text: 'Chat history cleared. How can I transform your website today?',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      trajectory: ['State reset']
                    }
                  ])}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
                  title="Clear Chat History"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Chat Messages Feed */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3.5 bg-black/40 min-h-[320px] max-h-[500px]">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {msg.sender === 'assistant' ? (
                        <>
                          <Bot size={11} className="text-[#d4f000]" />
                          <span className="text-[9px] font-bold text-[#d4f000] uppercase tracking-wider">Antigravity</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">You</span>
                          <User size={11} className="text-white/50" />
                        </>
                      )}
                      <span className="text-[8px] text-white/30 font-mono">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[92%] p-3 rounded-lg text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#d4f000] text-[#080808] font-semibold rounded-tr-none shadow-lg'
                          : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none shadow-xl'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Trajectory / Execution Steps */}
                      {msg.trajectory && msg.trajectory.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-white/10 text-[9px] font-mono space-y-1">
                          <div className="flex items-center gap-1 text-[#d4f000] font-bold text-[8px] uppercase tracking-widest">
                            <Terminal size={10} /> Execution Trajectory
                          </div>
                          {msg.trajectory.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-1.5 text-white/70">
                              <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isRefining && (
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <Bot size={11} className="text-[#d4f000]" />
                      <span className="text-[9px] font-bold text-[#d4f000] uppercase tracking-wider">Antigravity AI</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 text-white/70 p-3 rounded-lg rounded-tl-none text-xs flex items-center gap-2 animate-pulse">
                      <Loader2 size={14} className="animate-spin text-[#d4f000]" />
                      <span>Processing website transformation...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="p-2 bg-[#121212] border-t border-white/5 flex gap-1.5 overflow-x-auto">
                {[
                  '⚫ Black & White Theme',
                  '🔘 Add Secondary Button',
                  '🏷️ Add 3-Tier Pricing',
                  '💬 Add Testimonials',
                  '🎨 Cyberpunk Theme',
                  '📍 Update Contact Details'
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInstruction(chip.substring(2).trim());
                    }}
                    className="text-[9px] whitespace-nowrap bg-white/5 hover:bg-[#d4f000]/10 hover:border-[#d4f000]/40 hover:text-[#d4f000] text-white/60 px-2 py-1 rounded border border-white/10 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

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
                  placeholder="Ask Antigravity AI (e.g. 'Change background to black & white and add a secondary button')..."
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

          {activeTab === 'media' && (
            <div className="space-y-5">
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
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[9px] font-bold text-white/50 uppercase mb-1">
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
                          addNewFloatingImage(mediaUrl, x, y);
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
                          addNewFloatingImage(url, x, y);
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

              {/* Stock Presets */}
              <div>
                <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Stock Images</h3>
                <p className="text-[9px] text-white/40 mb-2">Drag and drop onto preview, or click to add</p>
                <div className="grid grid-cols-2 gap-2">
                  {stockImages.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', img.url);
                      }}
                      onClick={() => {
                        const previewContainer = document.getElementById('preview-scroll-container');
                        const x = previewContainer ? (previewContainer.clientWidth / 2 + previewContainer.scrollLeft) : 300;
                        const y = previewContainer ? (previewContainer.clientHeight / 2 + previewContainer.scrollTop) : 200;
                        addNewFloatingImage(img.url, x, y);
                      }}
                      className="relative aspect-[3/2] rounded overflow-hidden border cursor-grab active:cursor-grabbing border-white/10 hover:border-[#d4f000]/50 transition-all"
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover pointer-events-none" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[9px] font-black uppercase text-white tracking-widest pointer-events-none">
                        {img.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleSaveProject}
              disabled={isSaving}
              className={`flex-1 ${saveSuccess ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'} px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2`}
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : saveSuccess ? 'Saved!' : 'Save'}
            </button>
            <button 
              onClick={openPublishModal}
              className="flex-1 bg-[#d4f000] hover:bg-[#b8d000] text-[#080808] px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition-colors">
              {currentPublishedSubdomain ? 'Republish' : 'Publish'}
            </button>
          </div>
          <button
            onClick={() => window.location.href = '/tools'}
            className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-white px-6 py-2.5 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Exit Editor
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
        style={{ backgroundColor: 'var(--color-bg-base, #ffffff)' }}
      >
        {/* Generated Site Navbar */}
        <SiteNavbar businessName={businessName} sections={sections} theme={theme} logo={logo} />

        {/* Floating Images Layer */}
        {siteImages.map(img => (
          <FloatingImage
            key={img.id}
            image={img}
            isEditable={activeTab === 'media'}
            isSelected={selectedImageId === img.id}
            onSelect={() => {
              setSelectedImageId(img.id);
              setActiveTab('media');
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
              {mainSections.map((section) => (
                <SortableSection 
                  key={section.id} 
                  id={section.id} 
                  section={section} 
                  feel={currentFeel || feel} 
                  isEditingText={isEditingText}
                  isExpanded={expandedSectionId === section.id}
                  onClick={() => setExpandedSectionId(section.id)}
                  onUpdateText={handleContentChange}
                  activeTab={activeTab}
                  selectedText={selectedText}
                  onSelectText={(sectId, path) => {
                    setSelectedText({ sectionId: sectId, path });
                    setActiveTab('text');
                    setIsEditingText(true);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Footer always at bottom */}
        {footerSection && (
          <div 
            id={`section-${footerSection.id}`}
            onClick={isEditingText ? () => setExpandedSectionId(footerSection.id) : undefined}
            className={`transition-all duration-300 relative z-0 ${isEditingText ? 'cursor-pointer' : ''} ${
              expandedSectionId === footerSection.id 
                ? 'ring-4 ring-[#d4f000] ring-offset-4 ring-offset-black' 
                : 'hover:ring-2 hover:ring-primary hover:ring-inset'
            }`}
          >
            <EditableContext.Provider value={{ 
              isEditingText, 
              isMediaMode: activeTab === 'media',
              selectedText,
              onSelectText: (path) => setSelectedText({ sectionId: footerSection.id, path }),
              updateText: (path, val) => handleContentChange(footerSection.id, path, val),
              updateImage: (imgData) => handleContentChange(footerSection.id, 'image', imgData)
            }}>
              <Footer content={footerSection.content || {}} feel={feel} />
            </EditableContext.Provider>
          </div>
        )}
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
