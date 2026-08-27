import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, LineChart, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight">FLOW</h1>
        <Link 
          to="/login" 
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-5xl mx-auto text-center mt-12 mb-24">
        <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
          Build intelligent tools, <br className="hidden md:block"/> at the speed of thought.
        </h2>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-12">
          Leverage the power of AI to instantly generate high-converting websites and deep statistical data dashboards without writing a single line of code.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
          
          <Link to="/aibuilder" className="group block">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all h-full flex flex-col">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Layout size={24} />
              </div>
              <h3 className="text-2xl font-semibold mb-3">AI Website Builder</h3>
              <p className="text-slate-500 mb-8 flex-1">
                Describe your business and instantly generate a beautifully designed, fully responsive website layout. Iterate and refine in real-time.
              </p>
              <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                Start Building <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>

          <Link to="/aidashboardbuilder" className="group block">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all h-full flex flex-col">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <LineChart size={24} />
              </div>
              <h3 className="text-2xl font-semibold mb-3">AI Data Agent</h3>
              <p className="text-slate-500 mb-8 flex-1">
                Upload your CSV or Excel files and let our AI generate dynamic statistical dashboards. Discover insights instantly through natural language.
              </p>
              <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                Analyze Data <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}
