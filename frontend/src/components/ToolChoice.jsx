import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, LineChart, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import heroImage from '../assets/hero-image.png';

const ACCENT = '#d4f000';

export default function ToolChoice() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex flex-col text-white font-sans" style={{ background: '#080808', fontFamily: "'Noto Sans Thai', sans-serif" }}>
      {/* Navbar */}
      <header className="w-full px-8 py-6 flex justify-between items-center border-b border-white/10 relative z-20 bg-[#080808]">
        <Link to="/" className="text-2xl font-normal text-white" style={{ fontFamily: "'Pacifico', cursive" }}>flow</Link>
        <button 
          onClick={handleSignOut}
          className="text-white/50 hover:text-white text-sm font-semibold transition-colors uppercase tracking-wider"
        >
          Sign Out
        </button>
      </header>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Left - Website Builder */}
        <Link 
          to="/aibuilder" 
          className="flex-1 relative group overflow-hidden border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-end p-12 lg:p-20 transition-all cursor-pointer hover:bg-white/[0.02]"
        >
          {/* Background Image */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <img src={heroImage} alt="" className="w-full h-full object-cover object-[right_center] opacity-10 grayscale-[80%] transition-all duration-700 group-hover:opacity-30 group-hover:grayscale-[40%] translate-x-12 scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/90 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col transform transition-transform duration-500">
            <div className="w-16 h-16 rounded-none mb-8 flex items-center justify-center border border-white/10 bg-[#080808] text-white group-hover:border-white/30 transition-colors duration-500">
              <Layout size={24} />
            </div>
            <h2 className="text-4xl lg:text-5xl font-light tracking-tight mb-4 uppercase text-white">
              Website <span className="font-bold">Builder</span>
            </h2>
            <p className="text-white/50 max-w-md text-sm leading-relaxed mb-10">
              Transform a single prompt into a fully functional, beautiful React application. From landing pages to complex SaaS dashboards, built in seconds.
            </p>
            
            <div className="flex flex-col gap-4 mb-12">
              {['Tailwind CSS styling', 'Fully responsive', 'Export source code'].map(f => (
                <div key={f} className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white transition-colors" />
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{f}</span>
                </div>
              ))}
            </div>

            <div className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-white/40 group-hover:text-white transition-colors">
              Launch Builder <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Right - Data Agent */}
        <Link 
          to="/aidashboardbuilder" 
          className="flex-1 relative group overflow-hidden flex flex-col justify-end p-12 lg:p-20 transition-all cursor-pointer hover:bg-white/[0.02]"
        >
          {/* Background Image */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <img src={heroImage} alt="" className="w-full h-full object-cover object-[right_center] opacity-10 grayscale-[80%] transition-all duration-700 group-hover:opacity-40 group-hover:grayscale-0 translate-x-12 scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/90 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col transform transition-transform duration-500">
            <div className="w-16 h-16 rounded-none mb-8 flex items-center justify-center border border-white/10 bg-[#080808] transition-colors duration-500 group-hover:text-[#080808]" 
                 onMouseOver={(e) => { e.currentTarget.style.backgroundColor = ACCENT; e.currentTarget.style.borderColor = ACCENT; }}
                 onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#080808'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            >
              <LineChart size={24} />
            </div>
            <h2 className="text-4xl lg:text-5xl font-light tracking-tight mb-4 uppercase text-white">
              Data <span className="font-bold" style={{ color: ACCENT }}>Agent</span>
            </h2>
            <p className="text-white/50 max-w-md text-sm leading-relaxed mb-10">
              Upload any CSV or Excel file and let our AI instantly analyze, visualize, and extract actionable insights with stunning interactive charts.
            </p>

            <div className="flex flex-col gap-4 mb-12">
              {['Auto data cleansing', 'Interactive charts', 'Exportable reports'].map(f => (
                <div key={f} className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#d4f000] transition-colors" />
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{f}</span>
                </div>
              ))}
            </div>

            <div className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-white/40 group-hover:text-[#d4f000] transition-colors">
              Launch Agent <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
