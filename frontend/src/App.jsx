import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './lib/supabase';

import Questionnaire from './components/Questionnaire';
import WebsiteBuilder from './components/WebsiteBuilder';
import DataDashboard from './components/DataDashboard';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

function AIBuilderContainer() {
  const [websiteSpec, setWebsiteSpec] = useState(null);
  const [theme, setTheme] = useState(null);

  const handleWebsiteGenerated = (spec, themeColors) => {
    setWebsiteSpec(spec);
    setTheme(themeColors);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full">
      {!websiteSpec ? (
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
              FLOW <span className="text-primary">AI Builder</span>
            </h1>
          </div>
          <Questionnaire onWebsiteGenerated={handleWebsiteGenerated} />
        </div>
      ) : (
        <WebsiteBuilder initialSpec={websiteSpec} theme={theme} />
      )}
    </div>
  );
}

function AuthenticatedLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <Link to="/" className="text-2xl font-bold text-gray-900 tracking-tight">FLOW</Link>
        <div className="flex space-x-4 items-center bg-gray-100 p-1 rounded-lg">
          <Link to="/aibuilder" className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm">Website Builder</Link>
          <Link to="/aidashboardbuilder" className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm">Data Agent</Link>
          <button 
            onClick={() => supabase.auth.signOut()}
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
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
