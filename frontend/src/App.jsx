import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

import Questionnaire from './components/Questionnaire';
import WebsiteBuilder from './components/WebsiteBuilder';
import ProjectWorkspace from './components/ProjectWorkspace';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import ToolChoice from './components/ToolChoice';
import PublicForm from './components/PublicForm';
import Profile from './components/Profile';

// ─── AI Builder Container ─────────────────────────────────────────────────────

function AIBuilderContainer() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Prefer state-based site id (no ID in URL bar), fallback to query param
  const querySiteId =
    location.state?.site?.id ||
    location.state?.site?.subdomain ||
    searchParams.get('id') ||
    null;

  const [websiteSpec, setWebsiteSpec]             = useState(null);
  const [theme, setTheme]                         = useState(null);
  const [businessName, setBusinessName]           = useState('');
  const [pages, setPages]                         = useState([]);
  const [logo, setLogo]                           = useState(null);
  const [feel, setFeel]                           = useState('');
  const [fontStyle, setFontStyle]                 = useState('');
  const [websiteId, setWebsiteId]                 = useState(null);
  const [initialSiteImages, setInitialSiteImages] = useState([]);
  const [loadingSite, setLoadingSite]             = useState(false);
  const [initialQuestionnaireData, setInitialQuestionnaireData] = useState(null);

  // Reset all state when there is no site to load (fresh "Build New Website")
  const resetAll = () => {
    setWebsiteSpec(null);
    setTheme(null);
    setBusinessName('');
    setPages([]);
    setLogo(null);
    setFeel('');
    setFontStyle('');
    setWebsiteId(null);
    setInitialSiteImages([]);
    setInitialQuestionnaireData(null);
    setLoadingSite(false);
  };

  useEffect(() => {
    if (!querySiteId) {
      resetAll();
      return;
    }

    const loadExistingSite = async () => {
      setLoadingSite(true);
      try {
        // 1. Try saved_websites first
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
            // Draft with no generated spec — open questionnaire with pre-filled data
            setWebsiteSpec(null);
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

        // 2. Fall back to published_sites
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

  const handleWebsiteGenerated = (
    spec, themeColors, name, selectedPages,
    selectedLogo, selectedFeel, selectedFont,
    id = null, siteImages = []
  ) => {
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <Loader2 className="animate-spin" style={{ color: '#d4f000' }} size={32} />
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Loading website details...
        </span>
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
          <Questionnaire
            onWebsiteGenerated={handleWebsiteGenerated}
            initialData={initialQuestionnaireData}
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

// ─── Project Workspace Container ───────────────────────────────────────────────

function ProjectWorkspaceContainer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySiteId = location.state?.site?.id || location.state?.site?.subdomain || searchParams.get('id');
  const [siteData, setSiteData] = useState(location.state?.site || null);
  const [loading, setLoading] = useState(!location.state?.site && !!querySiteId);

  useEffect(() => {
    if (siteData || !querySiteId) {
      setLoading(false);
      return;
    }

    const loadSite = async () => {
      setLoading(true);
      try {
        const { data: pub } = await supabase
          .from('published_sites')
          .select('*')
          .or(`subdomain.eq.${querySiteId},website_id.eq.${querySiteId}`)
          .maybeSingle();

        if (pub) {
          setSiteData({
            id: pub.website_id || pub.subdomain,
            name: pub.config?.businessName || pub.config?.name || pub.subdomain || 'Published Website',
            status: 'published',
            subdomain: pub.subdomain,
            spec: pub.config?.spec || pub.config?.sections || null,
            theme: pub.config?.theme || pub.config?.themeColors || null,
            config: pub.config,
            createdAt: pub.published_at
          });
          return;
        }

        const { data: saved } = await supabase
          .from('saved_websites')
          .select('*')
          .eq('id', querySiteId)
          .maybeSingle();

        if (saved) {
          setSiteData({
            id: saved.id,
            name: saved.name || saved.config?.businessName || 'Draft Website',
            status: saved.status || 'draft',
            subdomain: saved.config?.subdomain,
            spec: saved.spec,
            theme: saved.theme,
            config: saved.config,
            createdAt: saved.updated_at
          });
        }
      } catch (err) {
        console.error('Error loading workspace site:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSite();
  }, [querySiteId, siteData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center text-white/40 gap-3">
        <Loader2 className="animate-spin text-[#d4f000]" size={32} />
        <span className="text-xs uppercase tracking-widest font-bold">Loading Workspace...</span>
      </div>
    );
  }

  return (
    <ProjectWorkspace 
      project={siteData} 
      onBack={() => navigate('/home')}
      onUpdateProject={(updated) => setSiteData(updated)}
      onDeleteProject={() => navigate('/home')}
    />
  );
}

// ─── Authenticated Layout (header + sign-out modal) ───────────────────────────

function AuthenticatedLayout({ children }) {
  const [showSignOut, setShowSignOut] = useState(false);

  const confirmSignOut = async () => {
    await supabase.auth.signOut();
    window.location.replace('/');
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
        <Link to="/home" className="text-2xl font-normal text-white" style={{ fontFamily: "'Pacifico', cursive" }}>
          flow
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="px-4 py-1.5 border border-white/10 text-[11px] uppercase tracking-widest font-bold transition-all text-white/70 hover:text-white hover:bg-white/5"
          >
            Profile
          </Link>
          <button
            onClick={() => setShowSignOut(true)}
            className="px-4 py-1.5 border border-red-500/30 text-[11px] uppercase tracking-widest font-bold transition-all text-red-500 hover:text-white hover:bg-red-500/20 hover:border-red-500/50"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {showSignOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h3 className="text-xl font-bold text-white/90 mb-2">Sign Out</h3>
            <p className="text-white/40 text-sm mb-8">Are you sure you want to sign out?</p>
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

// ─── Root App with routing ────────────────────────────────────────────────────

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
        {/* Public landing page — redirect logged-in users straight to /tools */}
        <Route
          path="/"
          element={session ? <Navigate to="/home" replace /> : <LandingPage />}
        />

        {/* Login — redirect logged-in users to /tools */}
        <Route
          path="/login"
          element={session ? <Navigate to="/home" replace /> : <Login />}
        />

        {/* Static public pages */}
        <Route path="/privacy"         element={<PrivacyPolicy />} />
        <Route path="/terms"           element={<TermsOfService />} />
        <Route path="/shared-form/:id" element={<PublicForm />} />

        {/* ── Protected: /tools — Your Websites Dashboard ── */}
        <Route
          path="/home"
          element={
            <ProtectedRoute session={session}>
              <ToolChoice />
            </ProtectedRoute>
          }
        />

        {/* ── Protected: /aibuilder — AI Website Builder ── */}
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

        {/* ── Protected: /workspace — Project Workspace for Published Websites ── */}
        <Route
          path="/workspace"
          element={
            <ProtectedRoute session={session}>
              <ProjectWorkspaceContainer />
            </ProtectedRoute>
          }
        />

        {/* ── Protected: /profile — User Profile & Settings ── */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute session={session}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to={session ? '/home' : '/'} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
