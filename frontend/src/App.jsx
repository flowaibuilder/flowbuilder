import { useState } from 'react';
import Questionnaire from './components/Questionnaire';
import WebsiteBuilder from './components/WebsiteBuilder';
import DataDashboard from './components/DataDashboard';

function App() {
  const [mode, setMode] = useState('website'); // 'website' or 'data'
  const [websiteSpec, setWebsiteSpec] = useState(null);
  const [theme, setTheme] = useState(null);

  const handleWebsiteGenerated = (spec, themeColors) => {
    setWebsiteSpec(spec);
    setTheme(themeColors);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">FLOW</h1>
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setMode('website')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'website' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Website Builder
          </button>
          <button 
            onClick={() => setMode('data')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'data' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Data Agent
          </button>
        </div>
      </nav>

      <main className="flex-1">
        {mode === 'website' ? (
          !websiteSpec ? (
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
          )
        ) : (
          <DataDashboard />
        )}
      </main>
    </div>
  );
}

export default App;
