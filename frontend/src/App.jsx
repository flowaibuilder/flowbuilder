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

function AIBuilderContainer() {
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

  return (
    <div className="flex-1 flex flex-col h-full w-full">
      {!websiteSpec ? (
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h1 className="text-4xl font-light text-white tracking-tight sm:text-5xl uppercase">
              Website <span className="font-bold" style={{ color: '#d4f000' }}>Builder</span>
            </h1>
          </div>
          <Questionnaire onWebsiteGenerated={handleWebsiteGenerated} />
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
  const isWebBuilder = location.pathname.startsWith('/aibuilder');
  const isDataAgent = location.pathname.startsWith('/aidashboardbuilder');

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: '#080808' }}>
      <nav className="bg-[#080808] border-b border-white/10 px-8 py-6 flex justify-between items-center sticky top-0 z-50">
        <Link to="/tools" className="text-2xl font-normal text-white" style={{fontFamily: "'Pacifico', cursive"}}>
          flow
        </Link>
        <div className="flex space-x-4 items-center p-1">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Sign Out
          </button>
        </div>
      </nav>
      <main className="flex-1 w-full h-full">
        {children}
      </main>
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
