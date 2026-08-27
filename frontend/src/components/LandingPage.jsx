import React from 'react';
import { Link } from 'react-router-dom';

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
          src="/src/assets/hero-image.png"
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
        <span className="flex items-baseline gap-2">
          <span className="text-white text-2xl font-normal" style={{ fontFamily: "'Pacifico', cursive" }}>flow</span>
          <span className="text-white/50 text-sm font-medium tracking-wide">AI Builder</span>
        </span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-white/50 hover:text-white text-sm font-medium transition-colors">
            Sign In
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold px-6 py-2.5 rounded-none transition-colors"
            style={{ background: ACCENT, color: '#080808' }}
          >
            Try for Free
          </Link>
        </div>
      </header>

      {/* Hero — left aligned text */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-8 flex flex-col justify-center pt-8 pb-20">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-light text-white leading-[1.2] tracking-tight mb-6">
            "The tools that amplify{' '}
            <span className="font-bold" style={{ color: ACCENT }}>human creativity</span>{' '}
            are the ones that change the world."
          </h1>

          <p className="text-white/50 text-lg leading-relaxed mb-10">
            Generate production-ready websites and beautiful data dashboards from a single sentence. No code. No complexity. Just results.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/aibuilder"
              className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-none transition-transform hover:-translate-y-0.5 text-sm uppercase tracking-wider"
              style={{ background: ACCENT, color: '#080808' }}
            >
              Start for free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-none border-2 text-white text-sm transition-all hover:bg-white/5 hover:-translate-y-0.5 uppercase tracking-wider"
              style={{ borderColor: ACCENT }}
            >
              Get a demo
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
      <footer className="relative z-10 border-t py-5 px-8 text-center text-xs text-white/20" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        © {new Date().getFullYear()} FLOW. All rights reserved.
      </footer>
    </div>
  );
}
