import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, LineChart } from 'lucide-react';

const ACCENT = '#d4f000';

export default function ToolChoice() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row text-white font-sans relative" style={{ background: '#080808', fontFamily: "'Noto Sans Thai', sans-serif" }}>
      {/* Top left logo overlay */}
      <div className="absolute top-6 left-8 z-50">
        <Link to="/" className="text-2xl font-normal text-white drop-shadow-md" style={{ fontFamily: "'Pacifico', cursive" }}>flow</Link>
      </div>

      {/* Left - Website Builder */}
      <Link 
        to="/aibuilder" 
        className="flex-1 relative group overflow-hidden border-b md:border-b-0 md:border-r border-white/10 flex flex-col items-center justify-center p-12 transition-all cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-transparent transition-all duration-500 z-0" />
        <div className="absolute -inset-1/2 bg-blue-500/20 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center transform group-hover:-translate-y-2 transition-transform duration-500">
          <div className="w-24 h-24 rounded-none mb-8 flex items-center justify-center border border-white/10 group-hover:border-blue-400/50 bg-white/5 transition-colors duration-500 text-blue-400 group-hover:text-blue-300 shadow-2xl">
            <Layout size={40} />
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4 uppercase text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200 transition-all">
            Website Builder
          </h2>
          <p className="text-white/40 max-w-sm text-sm leading-relaxed">
            Generate production-ready websites and landing pages from a single prompt. No code required.
          </p>
        </div>
      </Link>

      {/* Right - Data Agent */}
      <Link 
        to="/aidashboardbuilder" 
        className="flex-1 relative group overflow-hidden flex flex-col items-center justify-center p-12 transition-all cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-transparent transition-all duration-500 z-0" />
        <div className="absolute -inset-1/2 rounded-full blur-[120px] opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-700" style={{ background: ACCENT }} />
        
        <div className="relative z-10 flex flex-col items-center text-center transform group-hover:-translate-y-2 transition-transform duration-500">
          <div className="w-24 h-24 rounded-none mb-8 flex items-center justify-center border border-white/10 bg-white/5 transition-colors duration-500 shadow-2xl group-hover:text-[#080808]" style={{ borderColor: 'rgba(255,255,255,0.1)' }} 
             onMouseOver={(e) => { e.currentTarget.style.backgroundColor = ACCENT; e.currentTarget.style.borderColor = ACCENT; }}
             onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          >
            <LineChart size={40} className="transition-colors duration-300" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4 uppercase text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white transition-all" style={{ '--tw-gradient-to': ACCENT }}>
            Data Agent
          </h2>
          <p className="text-white/40 max-w-sm text-sm leading-relaxed">
            Upload Excel or CSV files to instantly generate beautiful, interactive dashboards and insights.
          </p>
        </div>
      </Link>
    </div>
  );
}
