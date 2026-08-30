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

  useEffect(() => {
    if (siteData) {
      // Set the document title
      if (siteData.businessName) {
        document.title = siteData.businessName;
      }
      
      // Set the favicon dynamically
      if (siteData.logo) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = siteData.logo;
      }
    }
  }, [siteData]);

  const [isMobileScreen, setIsMobileScreen] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const { businessName, sections, theme, logo, feel, siteImages, showBusinessName } = siteData;

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
        color: `var(--color-text-base, ${isLight(theme?.background) ? '#000000' : '#ffffff'})`
      }}
    >
      <SiteNavbar businessName={businessName} sections={sections} theme={theme} logo={logo} feel={feel} showBusinessName={showBusinessName} />
      
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
          <Footer content={footerSection.content || {}} feel={feel} sections={sections} />
        </div>
      )}


    </div>
  );
}
