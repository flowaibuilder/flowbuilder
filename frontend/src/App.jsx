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

function AIBuilderContainer() {
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

  const handleWebsiteGenerated = (spec, themeColors, name, selectedPages, selectedLogo, selectedFeel, selectedFont, id = null, siteImages = []) => {
    setActiveProject(null);
    setWebsiteSpec(spec);
    setTheme(themeColors);
    setBusinessName(name || '');
    setPages(selectedPages || []);
    setLogo(selectedLogo || null);
    setFeel(selectedFeel || '');
    setFontStyle(selectedFont || '');
    setWebsiteId(id);
    setInitialSiteImages(siteImages || []);
  };

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
          <Questionnaire
            onWebsiteGenerated={handleWebsiteGenerated}
            onOpenProject={handleOpenProject}
          />
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


