import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ACCENT = '#d4f000';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen font-sans text-white relative" style={{ background: '#080808', fontFamily: "'Noto Sans Thai', sans-serif" }}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }} />

      <div className="max-w-3xl mx-auto px-8 py-16 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-12 transition-colors uppercase tracking-wider font-semibold">
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-white/40 mb-12 font-medium">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4" style={{ color: ACCENT }}>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4" style={{ color: ACCENT }}>2. Use of Information</h2>
            <p>
              We may use the information we collect about you to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request, and send related information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4" style={{ color: ACCENT }}>3. Sharing of Information</h2>
            <p>
              We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including with third party service providers who need access to such information to carry out work on our behalf.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4" style={{ color: ACCENT }}>4. Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
