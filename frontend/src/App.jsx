import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';

import Questionnaire from './components/Questionnaire';
import WebsiteBuilder from './components/WebsiteBuilder';
import DataDashboard from './components/DataDashboard';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import ToolChoice from './components/ToolChoice';
import PublicForm from './components/PublicForm';

import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

function AIBuilderContainer() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const querySiteId = searchParams.get('id') || location.state?.site?.id;

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

  return (
    <div className="flex-1 flex flex-col h-full w-full">
      {!websiteSpec ? (
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h1 className="text-4xl font-light text-white tracking-tight sm:text-5xl uppercase">
              Website <span className="font-bold" style={{ color: '#d4f000' }}>Builder</span>
            </h1>
          </div>
          <Questionnaire onWebsiteGenerated={handleWebsiteGenerated} initialData={initialQuestionnaireData} />
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

function AuthenticatedLayout({ children }) {
  const location = useLocation();
  const [showSignOut, setShowSignOut] = useState(false);
  const isWebBuilder = location.pathname.startsWith('/aibuilder');
  const isDataAgent = location.pathname.startsWith('/aidashboardbuilder');

  const confirmSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: '#080808' }}>
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
      `}</style>
      <nav className="bg-[#080808] border-b border-white/10 px-8 py-6 flex justify-between items-center sticky top-0 z-50">
        <Link to="/tools" className="text-2xl font-normal text-white" style={{fontFamily: "'Pacifico', cursive"}}>
          flow
        </Link>
        <div className="flex space-x-4 items-center p-1">
          <button 
            onClick={() => setShowSignOut(true)}
            className="px-4 py-1.5 rounded-sm border border-red-500/30 text-[11px] uppercase tracking-widest font-bold transition-all text-red-500 hover:text-white hover:bg-red-500/20 hover:border-red-500/50"
          >
            Sign Out
          </button>
        </div>
      </nav>
      <main className="flex-1 w-full h-full">
        {children}
      </main>

      {showSignOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h3 className="text-xl font-bold text-white/90 mb-2">Sign Out</h3>
            <p className="text-white/40 text-sm mb-8">Are you sure you want to sign out of your account?</p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowSignOut(false)}
                className="flex-1 py-3 border border-white/10 text-white/40 hover:text-white/90 hover:bg-white/5 text-[11px] uppercase tracking-widest font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSignOut}
                className="flex-1 py-3 bg-red-500 text-white hover:bg-red-600 text-[11px] uppercase tracking-widest font-bold transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
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
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={session ? <Navigate to="/tools" replace /> : <LandingPage />} />
        <Route path="/login" element={session ? <Navigate to="/tools" replace /> : <Login />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        
        <Route path="/shared-form/:id" element={<PublicForm />} />
        
        <Route 
          path="/tools" 
          element={
            <ProtectedRoute session={session}>
              <ToolChoice />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/aibuilder" 
          element={
            <ProtectedRoute session={session}>
              <AuthenticatedLayout>
                <AIBuilderContainer />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/aidashboardbuilder" 
          element={
            <ProtectedRoute session={session}>
              <AuthenticatedLayout>
                <DataDashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
