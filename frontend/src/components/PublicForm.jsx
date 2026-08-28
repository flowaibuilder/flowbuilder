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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
        <p className="text-slate-500 font-medium">Loading form...</p>
      </div>
    );
  }

  if (error && !formConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Form Not Found</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link to="/" className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            Go to Flow.ai
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Success!</h2>
          <p className="text-slate-500 font-medium text-lg mb-8">Your information has been securely submitted.</p>
          
          <button 
            onClick={() => { setSuccess(false); setFormData({}); }}
            className="text-blue-600 font-bold hover:text-blue-800 transition-colors"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-12 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-8 flex items-center gap-2 justify-center">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
          <Share2 size={24} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Data Collection</h1>
      </div>
      
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 w-full max-w-2xl overflow-hidden">
        <div className="bg-blue-600 p-8 sm:p-10 text-white">
          <h2 className="text-3xl font-black mb-2">{formConfig.dashboard_name || 'Data Entry Form'}</h2>
          <p className="text-blue-100 font-medium">Please fill out the details below. Required fields are marked.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 sm:p-10">
          <div className="space-y-6">
            {formConfig.headers.map((header, idx) => (
              <div key={idx}>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">{header}</label>
                <input
                  type="text"
                  required
                  value={formData[idx] || ''}
                  onChange={(e) => setFormData({ ...formData, [idx]: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-slate-900 text-base bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm placeholder:text-slate-400"
                  placeholder={`Enter ${header}`}
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="mt-10">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Response <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-12 text-slate-400 text-sm font-semibold">
        Powered by <span className="text-slate-500">Flow.ai</span> Data Engine
      </div>
    </div>
  );
}
