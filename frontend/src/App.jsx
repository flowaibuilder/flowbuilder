import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

import ToolChoice from './components/ToolChoice';
import Questionnaire from './components/Questionnaire';
import WebsiteBuilder from './components/WebsiteBuilder';
import ProjectWorkspace from './components/ProjectWorkspace';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import PublicForm from './components/PublicForm';
import { ArrowLeft } from 'lucide-react';

import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

function AIBuilderContainer() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const querySiteId = searchParams.get('id') || location.state?.site?.id;

  // 'home' (Pic1 - Your Websites Dashboard) | 'builder' (Pic2 - Questionnaire / Website Builder)
  const [viewMode, setViewMode] = useState('home');
  const [activeProject, setActiveProject] = useState(null);
  const [websiteSpec, setWebsiteSpec] = useState(null);
  const [theme, setTheme] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [pages, setPages] = useState([]);
  const [logo, setLogo] = useState(null);
  const [feel, setFeel] = useState('');
  const [fontStyle, setFontStyle] = useState('');
  const [websiteId, setWebsiteId] = useState(null);
  const [initialSiteImages, setInitialSiteImages] = useState([]);
  const [loadingSite, setLoadingSite] = useState(!!querySiteId);
  const [initialQuestionnaireData, setInitialQuestionnaireData] = useState(null);

  useEffect(() => {
    if (!querySiteId) {
      setLoadingSite(false);
      return;
    }

    const loadExistingSite = async () => {
      setLoadingSite(true);
      try {
        // 1. Query saved_websites
        const { data: saved } = await supabase
          .from('saved_websites')
          .select('*')
          .eq('id', querySiteId)
          .maybeSingle();

        if (saved) {
          setWebsiteId(saved.id);
          const name = saved.name || saved.config?.businessName || '';
          setBusinessName(name);
          setTheme(saved.theme || saved.config?.themeColors || null);
          setPages(saved.config?.pages || []);
          setLogo(saved.config?.logo || null);
          setFeel(saved.config?.feel || '');
          setFontStyle(saved.config?.fontStyle || '');
          setInitialSiteImages(saved.config?.siteImages || []);
          
          if (saved.spec && Array.isArray(saved.spec) && saved.spec.length > 0) {
            setWebsiteSpec(saved.spec);
          } else {
            setInitialQuestionnaireData({
              name,
              industry: saved.config?.industry || '',
              goal: saved.config?.goal || '',
              feel: saved.config?.feel || '',
              fontStyle: saved.config?.fontStyle || 'ai',
              pages: saved.config?.pages || null,
              logo: saved.config?.logo || null,
            });
          }
          return;
        }

        // 2. Query published_sites if not in saved_websites
        const { data: pub } = await supabase
          .from('published_sites')
          .select('*')
          .or(`subdomain.eq.${querySiteId}`)
          .maybeSingle();

        if (pub && pub.config) {
          setWebsiteId(pub.website_id || pub.subdomain);
          const name = pub.config.businessName || pub.config.name || pub.subdomain || '';
          setBusinessName(name);
          setWebsiteSpec(pub.config.spec || pub.config.sections || null);
          setTheme(pub.config.theme || pub.config.themeColors || null);
          setPages(pub.config.pages || []);
          setLogo(pub.config.logo || null);
          setFeel(pub.config.feel || '');
          setFontStyle(pub.config.fontStyle || '');
          setInitialSiteImages(pub.config.siteImages || []);
        }
      } catch (err) {
        console.error('Error loading existing website:', err);
      } finally {
        setLoadingSite(false);
      }
    };

    loadExistingSite();
  }, [querySiteId]);

  const handleWebsiteGenerated = (spec, themeColors, name, selectedPages, selectedLogo, selectedFeel, selectedFont, id = null, siteImages = []) => {
    setActiveProject(null);
    setWebsiteSpec(spec);
    setTheme(themeColors);
    setBusinessName(name || '');
    setPages(selectedPages || []);
    setLogo(selectedLogo || null);
    setFeel(selectedFeel || '');
    setFontStyle(selectedFont || '');
    if (id) setWebsiteId(id);
    setInitialSiteImages(siteImages || []);
  };

  if (loadingSite) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-white/40 gap-3">
        <Loader2 className="animate-spin text-[#d4f000]" size={32} />
        <span className="text-xs uppercase tracking-widest font-bold">Loading website details...</span>
      </div>
    );
  }

  const handleOpenProject = (project) => {
    setActiveProject(project);
    setWebsiteSpec(null);
  };

  const handleEditSite = (site) => {
    // When clicking "Edit" on a website card in Pic1:
    // Open the Questionnaire page (Pic2) with this project loaded or open directly
    if (site.spec && site.spec.length > 0) {
      handleWebsiteGenerated(
        site.spec,
        site.theme || site.config?.theme,
        site.config?.businessName || site.name,
        site.config?.pages || [],
        site.config?.logo || null,
        site.config?.feel || '',
        site.config?.fontStyle || '',
        site.id,
        site.config?.siteImages || []
      );
    } else {
      setWebsiteSpec(null);
    }
    setViewMode('builder');
  };

  const handleBuildNewWebsite = () => {
    // Reset any previous draft in builder and open Questionnaire (Pic2)
    setWebsiteSpec(null);
    setActiveProject(null);
    setViewMode('builder');
  };

  if (activeProject) {
    return (
      <ProjectWorkspace
        project={activeProject}
        onBack={() => setActiveProject(null)}
        onUpdateProject={(updated) => setActiveProject(updated)}
        onDeleteProject={() => setActiveProject(null)}
      />
    );
  }

  // If in 'home' mode: Show Pic1 (Your Websites Dashboard)
  if (viewMode === 'home') {
    return (
      <ToolChoice
        onEditSite={handleEditSite}
        onBuildNewWebsite={handleBuildNewWebsite}
      />
    );
  }

  // If in 'builder' mode: Show Pic2 (Website Builder & Questionnaire)
  return (
    <div className="flex-1 flex flex-col h-full w-full">
      {!websiteSpec ? (
        <div className="pt-10 px-4 pb-20 max-w-7xl mx-auto w-full">
          {/* Back button to Home (Pic1) */}
          <div className="mb-6">
            <button
              onClick={() => setViewMode('home')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/10"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          </div>

          <div className="max-w-2xl mx-auto text-center mb-10">
            <h1 className="text-4xl font-light text-white tracking-tight sm:text-5xl uppercase">
              Website <span className="font-bold" style={{ color: '#d4f000' }}>Builder</span>
            </h1>
          </div>

          <Questionnaire onWebsiteGenerated={handleWebsiteGenerated} initialData={initialQuestionnaireData} onOpenProject={handleOpenProject} />

        </div>
      ) : (
        <WebsiteBuilder 
          initialSpec={websiteSpec} 
          theme={theme} 
          businessName={businessName} 
          pages={pages} 
          logo={logo} 
          feel={feel} 
          fontStyle={fontStyle} 
          websiteId={websiteId}
          onSave={(id) => setWebsiteId(id)}
          initialSiteImages={initialSiteImages}
        />
      )}
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#080808] text-white">
        <div className="text-3xl font-normal mb-4" style={{ fontFamily: "'Pacifico', cursive" }}>flow</div>
        <div className="w-6 h-6 border-2 border-[#d4f000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            session ? (
              <AIBuilderContainer />
            ) : (
              <LandingPage />
            )
          } 
        />
        <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/shared-form/:id" element={<PublicForm />} />
        
        {/* Legacy route redirects to new homepage / builder */}
        <Route path="/tools" element={<Navigate to="/" replace />} />
        <Route path="/aibuilder" element={<Navigate to="/" replace />} />
        <Route path="/aidashboardbuilder" element={<Navigate to="/" replace />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;


