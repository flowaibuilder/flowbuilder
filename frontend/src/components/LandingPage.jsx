import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, LineChart, ArrowRight, Sparkles, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans text-slate-900 bg-white flex flex-col">

      {/* Navbar */}
      <header className="w-full border-b border-slate-100 bg-white z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-xl font-bold tracking-tight">FLOW</span>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Docs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link to="/login" className="text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
              Try for Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — two column */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* LEFT: Text content */}
        <div className="flex flex-col justify-center">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm text-slate-600 font-medium">The leading AI builder platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6 text-slate-900">
            AI tools for<br />
            <span className="italic">websites</span> and<br />
            <span className="italic">dashboards</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-slate-500 mb-10 max-w-md leading-relaxed">
            Generate production-ready websites and beautiful data dashboards from a single sentence. No code. No complexity. Just results.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/aibuilder"
              className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-slate-700 transition-colors text-sm"
            >
              Start for free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-slate-800 font-semibold px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
            >
              Get a demo
            </Link>
          </div>
        </div>

        {/* RIGHT: Black box with tool cards */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 p-8 md:p-10 flex flex-col gap-5 min-h-[440px] justify-center">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px)`
            }}
          />
          {/* Soft glow inside */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-white/20">
              <Sparkles size={11} />
              Powered by Groq AI
            </div>
            <p className="text-white/80 text-sm font-medium mb-4 uppercase tracking-widest">Choose a tool</p>

            {/* AI Website Builder Card */}
            <Link to="/aibuilder" className="group block">
              <div className="bg-white rounded-2xl p-5 mb-4 flex items-center justify-between hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Layout size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">AI Website Builder</p>
                    <p className="text-slate-500 text-xs mt-0.5">Generate sites from a sentence</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors text-slate-500">
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* AI Data Agent Card */}
            <Link to="/aidashboardbuilder" className="group block">
              <div className="bg-white rounded-2xl p-5 flex items-center justify-between hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <LineChart size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">AI Data Agent</p>
                    <p className="text-slate-500 text-xs mt-0.5">Upload data, get dashboards instantly</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors text-slate-500">
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-5 px-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} FLOW. All rights reserved.
      </footer>
    </div>
  );
}

