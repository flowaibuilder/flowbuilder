import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/hero-image.png';

// Accent color from the yellow-lime glasses in the hero image
const ACCENT = '#d4f000';

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#080808', fontFamily: "'Noto Sans Thai', sans-serif", color: '#fff' }}
    >
      {/* RIGHT BACKGROUND IMAGE */}
      <div className="absolute top-0 right-0 w-full md:w-[55%] h-full z-0 pointer-events-none opacity-20 md:opacity-100">
        <img
          src={heroImage}
          alt="AI-powered creativity"
          className="w-full h-full object-cover object-[center_top]"
        />
        {/* Edge fades to blend image into the #080808 background seamlessly */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/50 to-transparent w-full md:w-64" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#080808] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#080808] to-transparent" />
      </div>

      {/* Subtle yellow glow behind text */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-10"
        style={{ background: ACCENT }}
      />

      {/* Navbar */}
      <header className="relative z-20 w-full px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="text-white text-2xl font-normal" style={{ fontFamily: "'Pacifico', cursive" }}>
          flow
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold px-6 py-2.5 rounded-none transition-colors uppercase tracking-wider"
            style={{ background: ACCENT, color: '#080808' }}
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero — left aligned text */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-8 flex flex-col justify-center pt-8 pb-20">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-light text-white leading-[1.2] tracking-tight mb-6">
            "The tools of the future should{' '}
            <span className="font-bold" style={{ color: ACCENT }}>empower every mind</span>{' '}
            to build what it imagines."
          </h1>

          <p className="text-white/50 text-lg leading-relaxed mb-10">
            Generate production-ready websites and beautiful data dashboards from a single sentence. No code. No complexity. Just results.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-none transition-transform hover:-translate-y-0.5 text-sm uppercase tracking-wider"
              style={{ background: ACCENT, color: '#080808' }}
            >
              Get Started
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-6 mt-12">
            {['AI Website Builder', 'Data Agent', 'Real-time Preview'].map(f => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: ACCENT }} />
                <span className="text-white/40 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="flex items-center gap-1.5">
          © {new Date().getFullYear()} <span className="text-sm text-white/50" style={{ fontFamily: "'Pacifico', cursive", transform: "translateY(-1px)" }}>flow</span> All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
