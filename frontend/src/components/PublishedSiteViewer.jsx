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

        // Track visit with referrer and UTM source info
        const searchParams = new URLSearchParams(window.location.search);
        fetch(`/api/data/track-visit/${subdomain}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referrer: document.referrer || '',
            utmSource: searchParams.get('utm_source') || '',
            utmMedium: searchParams.get('utm_medium') || '',
            utmCampaign: searchParams.get('utm_campaign') || '',
          })
        }).catch(err => console.error('Error tracking visit:', err));
        
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
    <div 
      className="w-full min-h-screen font-sans relative overflow-x-hidden" 
      style={{
        ...themeStyle,
        backgroundColor: 'var(--color-bg-base, #ffffff)',
        color: 'var(--color-text-base, #000000)'
      }}
    >
      <SiteNavbar businessName={businessName} sections={sections} theme={theme} logo={logo} />
      
      <main className="relative">
        {mainSections.map((section) => {
          const Component = SectionComponents[section.type];
          if (!Component) return null;
          
          return (
            <div key={section.id} id={`section-${section.id}`} className="relative">
              {section.content?.customPadding !== undefined && (
                <style>{`
                  #section-${section.id} .py-24,
                  #section-${section.id} .py-20,
                  #section-${section.id} [class*="py-"] {
                    padding-top: ${section.content.customPadding}px !important;
                    padding-bottom: ${section.content.customPadding}px !important;
                  }
                `}</style>
              )}
              <Component content={section.content || {}} feel={feel} />
            </div>
          );
        })}

      </main>

      {footerSection && (
        <div id={`section-${footerSection.id}`}>
          <Footer content={footerSection.content || {}} feel={feel} />
        </div>
      )}

      {/* Floating Layer — fixed overlay so it never causes page overflow/scrollbars */}
      {false && (siteImages || []).length > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 40,
          }}
        >
          {(siteImages || []).map(img => {
            const aspect = (img.type !== 'text' && img.width && img.height) ? `${img.width} / ${img.height}` : 'auto';
            return (
              <div
                key={img.id}
                style={{
                  position: 'absolute',
                  left: `${img.xPercent || 0}%`,
                  top: `${img.y}px`,
                  width: `${img.widthPercent || 20}%`,
                  maxWidth: '100%',
                  aspectRatio: aspect,
                  zIndex: img.zIndex !== undefined ? img.zIndex : 10,
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
                {(!img.type || img.type === 'image') && (
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ borderRadius: `${img.borderRadius || 0}px` }}
                  />
                )}

                {img.type === 'button' && (
                  <a
                    href={img.link || '#'}
                    className="w-full h-full flex items-center justify-center font-bold px-4 text-center select-none"
                    style={{
                      backgroundColor: img.color || '#d4f000',
                      color: img.textColor || '#000000',
                      borderRadius: `${img.borderRadius || 4}px`,
                      fontSize: 'inherit',
                      textDecoration: 'none',
                      pointerEvents: 'auto',
                    }}
                  >
                    {img.text || 'Click Me'}
                  </a>
                )}

                {img.type === 'text' && (
                  <div
                    className="w-full h-full p-2 select-none overflow-visible"
                    style={{
                      color: img.textColor || '#ffffff',
                      fontSize: `${img.fontSize || 16}px`,
                      fontFamily: img.fontFamily || 'Inter, sans-serif',
                      fontWeight: img.fontWeight || '400',
                      textAlign: img.textAlign || 'left',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      pointerEvents: 'auto',
                    }}
                  >
                    {img.text || ''}
                  </div>
                )}

                {img.type === 'shape' && (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: img.color || '#333333',
                      borderRadius: `${img.borderRadius || 0}px`,
                      border: img.borderWidth ? `${img.borderWidth}px solid ${img.borderColor || '#ffffff'}` : 'none',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
