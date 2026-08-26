import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Questionnaire({ onWebsiteGenerated }) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    theme: {
      primary: '#ff90e8',
      secondary: '#ffc900',
      background: '#fff0d4'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate website');
      }

      onWebsiteGenerated(data.spec, formData.theme);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100 mt-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Build your AI Website</h2>
      <p className="text-gray-500 mb-8">Tell us a bit about your business, and our AI will generate a complete website layout for you.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            placeholder="e.g. FLOW Solutions"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
          <input
            required
            type="text"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            placeholder="e.g. Tech Startup, Local Bakery"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
            placeholder="What does your business do? Who are your customers?"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 border-t pt-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
            <input
              type="color"
              value={formData.theme.primary}
              onChange={(e) => setFormData({ ...formData, theme: { ...formData.theme, primary: e.target.value } })}
              className="w-full h-12 p-1 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
            <input
              type="color"
              value={formData.theme.secondary}
              onChange={(e) => setFormData({ ...formData, theme: { ...formData.theme, secondary: e.target.value } })}
              className="w-full h-12 p-1 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme Background</label>
            <input
              type="color"
              value={formData.theme.background}
              onChange={(e) => setFormData({ ...formData, theme: { ...formData.theme, background: e.target.value } })}
              className="w-full h-12 p-1 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Generating your website...
            </>
          ) : (
            'Generate Website'
          )}
        </button>
      </form>
    </div>
  );
}
