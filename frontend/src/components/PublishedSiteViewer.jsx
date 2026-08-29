import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SiteNavbar, SectionComponents, isLight } from './WebsiteBuilder';
import Footer from './sections/Footer';

export default function PublishedSiteViewer({ subdomain }) {
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const { data, error } = await supabase
          .from('published_sites')
          .select('config')
          .eq('subdomain', subdomain)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Site not found');
        
        setSiteData(data.config);
      } catch (err) {
        console.error('Failed to load published site:', err);
        setError('Website not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [subdomain]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#d4f000]" />
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-black uppercase text-white mb-4">404</h1>
        <p className="text-xl text-white/60 mb-8">{error || 'Website not found'}</p>
        <a href="https://flow.devshahid.me" className="px-6 py-3 bg-[#d4f000] text-[#080808] font-bold uppercase tracking-wider hover:bg-[#b8d000] transition-colors">
          Build Your Own AI Website
        </a>
      </div>
    );
  }

  const { businessName, sections, theme, logo, feel, siteImages } = siteData;

  // Setup CSS variables for the theme
  const themeStyle = theme ? {
    '--color-primary': theme.primary,
    '--color-secondary': theme.secondary,
    '--color-bg-base': theme.background,
    '--color-text-base': isLight(theme.background) ? '#000000' : '#ffffff',
  } : {};

  // Non-footer sections for the preview area
  const mainSections = sections.filter(s => s.type !== 'footer');
  const footerSection = sections.find(s => s.type === 'footer');

  return (
    <div className="w-full min-h-screen font-sans relative overflow-x-hidden" style={themeStyle}>
      <SiteNavbar businessName={businessName} sections={sections} theme={theme} logo={logo} />
      
      <main className="relative">
        {mainSections.map((section) => {
          const Component = SectionComponents[section.type];
          if (!Component) return null;
          
          return (
            <div key={section.id} id={`section-${section.id}`}>
              <Component content={section.content || {}} feel={feel} />
            </div>
          );
        })}

        {/* Floating Images Layer */}
        {(siteImages || []).map(img => {
          const aspect = img.width && img.height ? `${img.width} / ${img.height}` : 'auto';
          return (
            <div
              key={img.id}
              style={{
                position: 'absolute',
                left: `${img.xPercent || 0}%`,
                top: `${img.y}px`,
                width: `${img.widthPercent || 20}%`,
                aspectRatio: aspect,
                zIndex: img.zIndex || 10,
                opacity: img.opacity !== undefined ? img.opacity : 1,
                filter: img.blur ? `blur(${img.blur}px)` : 'none',
                pointerEvents: 'none',
              }}
              className={`floating-image-container ${
                img.shadow === 'soft' ? 'shadow-md' :
                img.shadow === 'medium' ? 'shadow-xl' :
                img.shadow === 'hard' ? 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]' :
                'shadow-none'
              }`}
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
                style={{
                  borderRadius: `${img.borderRadius || 0}px`
                }}
              />
            </div>
          );
        })}
      </main>

      {footerSection && (
        <div id={`section-${footerSection.id}`}>
          <Footer content={footerSection.content || {}} feel={feel} />
        </div>
      )}
    </div>
  );
}
