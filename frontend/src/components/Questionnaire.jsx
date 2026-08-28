import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const THEMES = [
  {
    id: 'modern',
    name: 'Modern Minimal',
    colors: { primary: '#000000', secondary: '#666666', background: '#ffffff' },
  },
  {
    id: 'dark',
    name: 'Dark Bold',
    colors: { primary: '#d4f000', secondary: '#222222', background: '#080808' },
  },
  {
    id: 'brutalism',
    name: 'Neo Brutalism',
    colors: { primary: '#ff3366', secondary: '#00ccee', background: '#ffcc00' },
  },
  {
    id: 'elegant',
    name: 'Elegant Edge',
    colors: { primary: '#2c3e50', secondary: '#d35400', background: '#fdfbf7' },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: { primary: '#00ff00', secondary: '#ff00ff', background: '#0a0a2a' },
  }
];

const ACCENT = '#d4f000';

export default function Questionnaire({ onWebsiteGenerated }) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    themeId: 'dark' // default
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const selectedTheme = THEMES.find(t => t.id === formData.themeId).colors;

    try {
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // We pass the actual theme colors to the backend
        body: JSON.stringify({ ...formData, theme: selectedTheme }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate website');
      }

      onWebsiteGenerated(data.spec, selectedTheme);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-10 bg-[#121212] rounded-none border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }} />

      <div className="relative z-10">
        <h2 className="text-3xl font-light text-white mb-2 uppercase tracking-wider">
          Build your <span className="font-bold" style={{ color: ACCENT }}>AI Website</span>
        </h2>
        <p className="text-white/40 mb-10 text-sm">Tell us about your business, choose a theme, and our AI will generate a complete production-ready website.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Business Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-none border border-white/10 outline-none transition-all text-white text-sm bg-white/5 focus:bg-white/10 focus:border-[#d4f000]"
                placeholder="e.g. FLOW Solutions"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Industry</label>
              <input
                required
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-3 rounded-none border border-white/10 outline-none transition-all text-white text-sm bg-white/5 focus:bg-white/10 focus:border-[#d4f000]"
                placeholder="e.g. Tech Startup, Architecture"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Business Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-none border border-white/10 outline-none transition-all text-white text-sm bg-white/5 focus:bg-white/10 focus:border-[#d4f000] resize-none"
              placeholder="What does your business do? Who are your target customers?"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Select Theme</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, themeId: theme.id })}
                  className={`flex flex-col items-center p-4 border transition-all ${
                    formData.themeId === theme.id 
                      ? 'border-[#d4f000] bg-[#d4f000]/10' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div 
                    className="w-full h-16 mb-3 flex relative overflow-hidden border border-white/20"
                    style={{ background: theme.colors.background }}
                  >
                    <div className="absolute top-0 left-0 w-1/3 h-full" style={{ background: theme.colors.primary }} />
                    <div className="absolute top-0 right-0 w-1/3 h-full" style={{ background: theme.colors.secondary }} />
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${formData.themeId === theme.id ? 'text-[#d4f000]' : 'text-white/60'}`}>
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-4 px-4 rounded-none transition-transform flex justify-center items-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 uppercase tracking-wider text-sm"
            style={{ background: ACCENT, color: '#080808' }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin text-[#080808]" size={20} />
                Building your empire...
              </>
            ) : (
              'Generate Website'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
