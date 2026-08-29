import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Plus, Globe, Sparkles, ExternalLink, Trash2, Search, ArrowRight, CheckCircle2, AlertTriangle, Loader2, FileCode, Layers, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';
import heroImage from '../assets/hero-image.png';

const ACCENT = '#d4f000';

export default function ToolChoice() {
  const navigate = useNavigate();
  const [showSignOut, setShowSignOut] = useState(false);
  const [deleteModalSite, setDeleteModalSite] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [searchQuery, setSearchQuery] = useState('');

  const confirmSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const fetchWebsites = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setWebsites([]);
        return;
      }

      // 1. Fetch live published sites for logged-in user
      const { data: pubSites } = await supabase
        .from('published_sites')
        .select('*')
        .eq('user_id', user.id);

      // 2. Fetch saved draft projects for logged-in user
      const { data: draftSites } = await supabase
        .from('saved_websites')
        .select('*')
        .eq('user_id', user.id);

      const publishedWebsiteIds = new Set(
        pubSites ? pubSites.map(p => p.website_id).filter(Boolean) : []
      );

      const combined = [];

      // Published Websites (records in published_sites)
      if (pubSites && pubSites.length > 0) {
        pubSites.forEach(p => {
          combined.push({
            id: p.website_id || p.subdomain,
            name: p.config?.businessName || p.config?.name || p.subdomain || 'Published Website',
            status: 'published',
            subdomain: p.subdomain,
            config: p.config,
            createdAt: p.published_at || new Date().toISOString(),
            table: 'published_sites'
          });
        });
      }

      // Draft Projects (records in saved_websites that are NOT in published_sites)
      if (draftSites && draftSites.length > 0) {
        draftSites.forEach(d => {
          const isPublished = publishedWebsiteIds.has(d.id);
          if (!isPublished) {
            combined.push({
              id: d.id,
              name: d.name || d.config?.businessName || 'Draft Website',
              status: 'draft',
              subdomain: d.config?.subdomain || null,
              config: d.config,
              spec: d.spec,
              theme: d.theme,
              createdAt: d.updated_at || new Date().toISOString(),
              table: 'saved_websites'
            });
          }
        });
      }

      setWebsites(combined);
    } catch (err) {
      console.error('Error fetching websites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleDeleteWebsite = async (site) => {
    try {
      const isPublished = site.table === 'published_sites' || site.status === 'published';
      const table = isPublished ? 'published_sites' : 'saved_websites';
      
      const matchField = isPublished ? 'subdomain' : 'id';
      const matchVal = isPublished ? site.subdomain : site.id;

      const { error } = await supabase
        .from(table)
        .delete()
        .eq(matchField, matchVal);

      if (error) {
        console.error('Error deleting site:', error);
        alert('Failed to delete website: ' + error.message);
        return;
      }

      setWebsites(prev => prev.filter(s => s.id !== site.id));
      setDeleteModalSite(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredWebsites = websites.filter(site => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'published' ? site.status === 'published' :
      site.status === 'draft';

    const matchesSearch = 
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (site.subdomain && site.subdomain.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen w-full flex flex-col text-white font-sans" style={{ background: '#080808' }}>
      {/* Navbar */}
      <header className="w-full px-8 py-6 flex justify-between items-center border-b border-white/10 relative z-20 bg-[#080808]">
        <Link to="/" className="text-2xl font-normal text-white" style={{ fontFamily: "'Pacifico', cursive" }}>flow</Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSignOut(true)}
            className="px-4 py-1.5 rounded-full border border-red-500/30 text-[11px] uppercase tracking-widest font-bold transition-all text-red-500 hover:text-white hover:bg-red-500/20 hover:border-red-500/50"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden p-6 lg:p-8 gap-8">
        
        {/* LEFT COLUMN: Create / Build New Website Panel */}
        <div className="w-full lg:w-[420px] xl:w-[450px] flex-shrink-0 bg-[#0c0c0c] border border-white/10 rounded-2xl p-8 lg:p-10 flex flex-col justify-between relative shadow-2xl overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <img src={heroImage} alt="" className="w-full h-full object-cover grayscale opacity-20 rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/90 to-transparent" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#d4f000]/30 bg-[#d4f000]/10 text-[#d4f000] text-[10px] font-bold uppercase tracking-widest mb-6">
              <Sparkles size={12} /> AI Web Engine
            </div>

            <h1 className="text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-none mb-4">
              Create <span style={{ color: ACCENT }}>Website</span>
            </h1>

            <p className="text-white/50 text-sm leading-relaxed mb-8">
              Build stunning, responsive, production-ready React websites in seconds. Powered by advanced AI layout design and tailored themes.
            </p>

            {/* Features list */}
            <div className="flex flex-col gap-3.5 mb-8">
              {[
                'Instant Full-Page AI Generation',
                'Tailwind CSS & Mobile Responsive',
                'One-Click Custom Subdomain Publishing',
                'Real-Time Live Section Editing'
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs text-white/70 font-semibold uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ACCENT }} />
                  {feat}
                </div>
              ))}
            </div>
          </div>

          {/* Large Action CTA Button */}
          <div className="relative z-10 mt-auto pt-6 border-t border-white/10">
            <button
              onClick={() => navigate('/aibuilder')}
              className="w-full py-4.5 px-6 rounded-xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest bg-[#d4f000] text-[#080808] hover:bg-[#b8d000] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#d4f000]/10"
            >
              <Plus size={18} strokeWidth={3} /> Build New Website
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Web Builder Projects (Published & Drafts) */}
        <div className="flex-1 bg-[#0c0c0c] border border-white/10 rounded-2xl p-8 lg:p-10 flex flex-col shadow-2xl overflow-y-auto">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1">
                Your <span style={{ color: ACCENT }}>Websites</span>
              </h2>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">
                Manage your published sites and draft projects
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Search Bar */}
              <div className="relative w-full md:w-56">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search websites..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl text-white text-xs pl-9 pr-3.5 py-2.5 outline-none focus:border-[#d4f000] transition-colors"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex border border-white/10 bg-white/[0.02] rounded-xl p-1 gap-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'published', label: 'Published' },
                  { id: 'draft', label: 'Drafts' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilter(t.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      filter === t.id 
                        ? 'bg-[#d4f000] text-[#080808]' 
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Grid / List */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-16 text-white/30 gap-3">
              <Loader2 className="animate-spin text-[#d4f000]" size={28} />
              <span className="text-xs uppercase tracking-widest font-bold">Loading your websites...</span>
            </div>
          ) : filteredWebsites.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] text-center my-4">
              <div className="w-14 h-14 border border-white/10 rounded-2xl flex items-center justify-center text-white/20 mb-4 bg-black/40">
                <Layout size={24} />
              </div>
              <h3 className="text-base font-bold text-white/80 uppercase tracking-wider mb-2">No Websites Found</h3>
              <p className="text-xs text-white/40 max-w-sm mb-6 leading-relaxed">
                {searchQuery ? `No website matching "${searchQuery}".` : 'You haven\'t created any websites yet. Click below to start building your first site with AI.'}
              </p>
              <button
                onClick={() => navigate('/aibuilder')}
                className="px-6 py-3 border border-[#d4f000] rounded-xl text-[#d4f000] text-xs font-bold uppercase tracking-widest hover:bg-[#d4f000] hover:text-[#080808] transition-colors flex items-center gap-2"
              >
                <Plus size={14} /> Start Building Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredWebsites.map((site) => (
                <div 
                  key={site.id}
                  className="group relative bg-[#121212] border border-white/10 hover:border-white/25 rounded-2xl transition-all flex flex-col justify-between p-6 shadow-lg overflow-hidden"
                >
                  {/* TOP-RIGHT FLOATING PILL TAG */}
                  <div className="absolute top-3.5 right-3.5 z-10">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-lg backdrop-blur-md transition-all ${
                      site.status === 'published'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${site.status === 'published' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      {site.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="pt-2">
                    <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-[#d4f000] bg-[#080808] mb-4 shadow-inner">
                      <Layout size={18} />
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-[#d4f000] transition-colors truncate mb-1 pr-16">
                      {site.name}
                    </h3>

                    {site.subdomain && (
                      <p className="text-xs text-white/40 truncate mb-4 font-mono">
                        {site.subdomain}.flowbuilder.app
                      </p>
                    )}

                    <p className="text-[11px] text-white/30 uppercase tracking-wider font-semibold">
                      {new Date(site.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate('/aibuilder')}
                      className="flex-1 py-2.5 px-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Pencil size={12} /> Edit
                    </button>

                    {site.subdomain && (
                      <a
                        href={`/shared-form/${site.subdomain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 border border-white/10 hover:border-[#d4f000] rounded-xl text-white/50 hover:text-[#d4f000] transition-colors"
                        title="View Site"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}

                    <button
                      onClick={() => setDeleteModalSite(site)}
                      className="p-2.5 border border-white/10 hover:border-red-500/50 rounded-xl text-white/40 hover:text-red-500 transition-colors"
                      title="Delete Website"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalSite && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setDeleteModalSite(null)}
        >
          <div 
            className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={22} />
            </div>
            <h3 className="text-base font-bold text-white/90 mb-1">Delete Website</h3>
            <p className="text-white/50 text-xs mb-6 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-semibold">"{deleteModalSite.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setDeleteModalSite(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-[11px] uppercase tracking-widest font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteWebsite(deleteModalSite)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 text-[11px] uppercase tracking-widest font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Modal */}
      {showSignOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h3 className="text-xl font-bold text-white/90 mb-2">Sign Out</h3>
            <p className="text-white/40 text-sm mb-8">Are you sure you want to sign out of your account?</p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowSignOut(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white/90 hover:bg-white/5 text-[11px] uppercase tracking-widest font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSignOut}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 text-[11px] uppercase tracking-widest font-bold transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
