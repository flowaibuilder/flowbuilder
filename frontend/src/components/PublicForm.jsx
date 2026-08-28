import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, Share2, ArrowRight } from 'lucide-react';

export default function PublicForm() {
  const { id } = useParams();
  const [formConfig, setFormConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/form/${id}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to load form');
        setFormConfig(data.form);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchForm();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Data is sent as an array matching the headers
      const orderedData = formConfig.headers.map((_, idx) => formData[idx] || '');

      const res = await fetch(`/api/form/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: orderedData })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit form');

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#080808] font-sans">
        <Loader2 className="animate-spin text-[#d4f000] mb-4" size={32} />
        <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Loading form...</p>
      </div>
    );
  }

  if (error && !formConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808] font-sans p-6">
        <div className="bg-[#111] p-8 shadow-2xl border border-white/10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-white/90 mb-2">Form Not Found</h2>
          <p className="text-white/40 mb-8">{error}</p>
          <Link to="/" className="inline-block bg-transparent border border-white/10 text-white/40 hover:text-white/90 hover:bg-white/5 uppercase tracking-widest text-[11px] font-bold px-6 py-3 transition-colors">
            Go to Flow.ai
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808] font-sans p-6">
        <div className="bg-[#111] p-10 shadow-[0_0_30px_rgba(212,240,0,0.05)] border border-[#d4f000]/20 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#d4f000]" />
          <div className="w-20 h-20 bg-[#d4f000]/10 text-[#d4f000] border border-[#d4f000]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-white/90 mb-3 tracking-tight">Success!</h2>
          <p className="text-white/40 font-medium text-sm mb-10">Your information has been securely submitted.</p>
          
          <button 
            onClick={() => { setSuccess(false); setFormData({}); }}
            className="text-[#d4f000] hover:text-[#e4ff1a] uppercase tracking-widest text-[11px] font-bold transition-colors"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] font-sans py-12 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-10 flex justify-center">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-black/40 border border-[#d4f000]/30 rounded-full shadow-[0_0_20px_rgba(212,240,0,0.05)] backdrop-blur-md">
          <Share2 size={16} className="text-[#d4f000]" />
          <h1 className="text-[12px] font-black text-white/90 uppercase tracking-[0.2em]">Data Collection</h1>
        </div>
      </div>
      
      <div className="bg-[#111] shadow-2xl border border-white/10 w-full max-w-2xl overflow-hidden">
        <div className="bg-[#0a0a0a] border-b border-white/10 p-8 sm:p-10 text-white">
          <h2 className="text-[#d4f000] text-3xl font-black mb-3">{formConfig.dashboard_name || 'Data Entry Form'}</h2>
          <p className="text-white/40 font-medium text-sm">Please fill out the details below. Required fields are marked.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 sm:p-10">
          <div className="space-y-8">
            {formConfig.headers.map((header, idx) => (
              <div key={idx}>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3 ml-1">{header}</label>
                <input
                  type="text"
                  required
                  value={formData[idx] || ''}
                  onChange={(e) => setFormData({ ...formData, [idx]: e.target.value })}
                  className="w-full px-5 py-4 border border-white/10 text-white/90 text-sm bg-black/50 focus:bg-black focus:ring-1 focus:ring-[#d4f000] focus:border-[#d4f000] outline-none transition-all placeholder:text-white/20"
                  placeholder={`Enter ${header}`}
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-8 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-[#d4f000] border border-[#d4f000] hover:bg-[#d4f000] hover:text-[#080808] hover:shadow-[0_0_20px_rgba(212,240,0,0.4)] text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 w-full sm:w-auto overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#d4f000] disabled:hover:shadow-none"
            >
              <div className="absolute inset-0 w-0 bg-white/20 transition-all duration-[400ms] ease-out group-hover:w-full"></div>
              {submitting ? (
                <>
                  <Loader2 className="relative z-10 animate-spin" size={18} />
                  <span className="relative z-10">Submitting...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Submit Response</span>
                  <ArrowRight size={18} className="relative z-10 transition-transform duration-500 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-12 text-white/30 text-[10px] font-bold uppercase tracking-widest">
        Powered by <span className="text-[#d4f000]">Flow.ai</span> Data Engine
      </div>
    </div>
  );
}
