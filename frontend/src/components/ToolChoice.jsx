import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Plus, Globe, ExternalLink, Trash2, Search, AlertTriangle, Loader2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import heroImage from '../assets/hero-image.png';

const ACCENT = '#d4f000';

export default function ToolChoice() {
  const navigate = useNavigate();
  const [deleteModalSite, setDeleteModalSite] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [searchQuery, setSearchQuery] = useState('');

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
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="px-3.5 py-1.5 border border-white/10 text-[11px] uppercase tracking-widest font-bold transition-all text-white/80 hover:text-white hover:bg-white/5 hover:border-white/20 flex items-center gap-1.5"
          >
            <User size={13} className="text-[#d4f000]" />
            <span>Profile</span>
          </Link>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden p-6 lg:p-8 gap-8">
        
        {/* LEFT COLUMN: Create / Build New Website Panel */}
        <div className="w-full lg:w-[420px] xl:w-[450px] flex-shrink-0 bg-[#0c0c0c] border border-white/10 p-8 lg:p-10 flex flex-col justify-between relative shadow-2xl overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <img src={heroImage} alt="" className="w-full h-full object-cover grayscale opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/90 to-transparent" />
          </div>

          <div className="relative z-10">
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
                  <div className="w-2 h-2 flex-shrink-0" style={{ background: ACCENT }} />
                  {feat}
                </div>
              ))}
            </div>
          </div>

          {/* Large Action CTA Button */}
          <div className="relative z-10 mt-auto pt-6 border-t border-white/10">
            <button
              onClick={() => navigate('/aibuilder', { state: null })}
              className="w-full py-4.5 px-6 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest bg-[#d4f000] text-[#080808] hover:bg-[#b8d000] transition-all shadow-lg shadow-[#d4f000]/10"
            >
              <Plus size={18} strokeWidth={3} /> Build New Website
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Web Builder Projects (Published & Drafts) */}
        <div className="flex-1 bg-[#0c0c0c] border border-white/10 p-8 lg:p-10 flex flex-col shadow-2xl overflow-y-auto">
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
                  className="w-full bg-white/[0.03] border border-white/10 text-white text-xs pl-9 pr-3.5 py-2.5 outline-none focus:border-[#d4f000] transition-colors"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex border border-white/10 bg-white/[0.02] p-1 gap-1">
                {[
                  { id: 'all', label: 'All', activeClass: 'bg-[#d4f000] text-[#080808]' },
                  { id: 'published', label: 'Published', activeClass: 'bg-emerald-500 text-[#080808] shadow-md shadow-emerald-500/20' },
                  { id: 'draft', label: 'Drafts', activeClass: 'bg-amber-400 text-[#080808] shadow-md shadow-amber-400/20' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilter(t.id)}
                    className={`px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      filter === t.id 
                        ? t.activeClass 
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Projects List Card View */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-16 text-white/30 gap-3">
              <Loader2 className="animate-spin text-[#d4f000]" size={28} />
              <span className="text-xs uppercase tracking-widest font-bold">Loading your websites...</span>
            </div>
          ) : filteredWebsites.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 border border-dashed border-white/10 bg-white/[0.01] text-center my-4">
              <div className="w-14 h-14 border border-white/10 flex items-center justify-center text-white/20 mb-4 bg-black/40">
                <Layout size={24} />
              </div>
              <h3 className="text-base font-bold text-white/80 uppercase tracking-wider mb-2">No Websites Found</h3>
              <p className="text-xs text-white/40 max-w-sm mb-6 leading-relaxed">
                {searchQuery ? `No website matching "${searchQuery}".` : 'You haven\'t created any websites yet. Click below to start building your first site with AI.'}
              </p>
              <button
                onClick={() => navigate('/aibuilder')}
                className="px-6 py-3 border border-[#d4f000] text-[#d4f000] text-xs font-bold uppercase tracking-widest hover:bg-[#d4f000] hover:text-[#080808] transition-colors flex items-center gap-2"
              >
                <Plus size={14} /> Start Building Now
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredWebsites.map((site) => (
                <div 
                  key={site.id}
                  onClick={() => {
                    if (site.status === 'published') {
                      navigate('/workspace', { state: { site } });
                    } else {
                      navigate('/aibuilder', { state: { site } });
                    }
                  }}
                  className="group relative bg-[#111111] hover:bg-[#151515] border border-white/10 hover:border-[#d4f000]/40 transition-all duration-300 p-5 shadow-xl hover:shadow-2xl hover:shadow-[#d4f000]/5 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden cursor-pointer"
                >
                  {/* Left Info Section */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Website Icon Avatar */}
                    <div className="w-12 h-12 border border-white/10 flex items-center justify-center text-[#d4f000] bg-[#080808] flex-shrink-0 group-hover:border-[#d4f000]/30 transition-colors shadow-inner">
                      <Layout size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-black text-white group-hover:text-[#d4f000] transition-colors truncate tracking-tight">
                          {site.name}
                        </h3>
                        {/* Status Tag */}
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest border flex-shrink-0 bg-transparent text-white ${
                          site.status === 'published'
                            ? 'border-emerald-500'
                            : 'border-amber-400'
                        }`}>
                          {site.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        {site.subdomain ? (
                          <div className="inline-flex items-center gap-1.5 text-white/70 font-mono">
                            <Globe size={12} className="text-[#d4f000] flex-shrink-0" />
                            <span className="truncate">{site.subdomain}.flow.devshahid.me</span>
                          </div>
                        ) : (
                          <span className="text-white/30 italic text-[11px]">Unpublished Draft</span>
                        )}
                        <span className="text-white/20">•</span>
                        <span className="text-white/40 text-[11px]">
                          Updated {new Date(site.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Controls */}
                  <div className="flex items-center gap-2.5 self-end md:self-center flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5 w-full md:w-auto justify-end">
                    {site.subdomain && (
                      <a
                        href={`https://${site.subdomain}.flow.devshahid.me`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2.5 border border-white/10 bg-white/5 hover:border-[#d4f000] hover:bg-[#d4f000]/10 text-white/60 hover:text-[#d4f000] transition-all"
                        title="View Live Site"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModalSite(site);
                      }}
                      className="p-2.5 border border-white/10 bg-white/5 hover:border-red-500/50 hover:bg-red-500/10 rounded-xl text-white/40 hover:text-red-500 transition-all"
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
            className="bg-[#111] border border-white/10 p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl"
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
                className="flex-1 py-2.5 border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-[11px] uppercase tracking-widest font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteWebsite(deleteModalSite)}
                className="flex-1 py-2.5 bg-red-500 text-white hover:bg-red-600 text-[11px] uppercase tracking-widest font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
