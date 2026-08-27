import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ACCENT = '#d4f000';

export default function TermsOfService() {
  return (
    <div className="min-h-screen font-sans text-white relative" style={{ background: '#080808', fontFamily: "'Noto Sans Thai', sans-serif" }}>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }} />

      <div className="max-w-3xl mx-auto px-8 py-16 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-12 transition-colors uppercase tracking-wider font-semibold">
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Terms of Service</h1>
        <p className="text-white/40 mb-12 font-medium">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4" style={{ color: ACCENT }}>1. Acceptance of Terms</h2>
            <p>
              By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4" style={{ color: ACCENT }}>2. Description of Service</h2>
            <p>
              FLOW AI Builder provides users with access to a rich collection of resources, including various communications tools, forums, and personalized content which may be accessed through any various medium or device now known or hereafter developed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4" style={{ color: ACCENT }}>3. User Conduct</h2>
            <p>
              You understand that all information, data, text, software, music, sound, photographs, graphics, video, messages or other materials, whether publicly posted or privately transmitted, are the sole responsibility of the person from which such content originated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4" style={{ color: ACCENT }}>4. Modifications to Service</h2>
            <p>
              We reserve the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
