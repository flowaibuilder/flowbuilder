import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Shield,
  Globe,
  Edit2,
  Check,
  X,
  Copy,
  ExternalLink,
  Loader2,
  LogOut,
  ArrowLeft,
  Layers,
  Key
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const ACCENT = '#d4f000';

export default function Profile() {
  const navigate = useNavigate();

  // User auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Copy UUID state
  const [copiedId, setCopiedId] = useState(false);

  // User Websites data
  const [websites, setWebsites] = useState([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);

  // Sign out modal
  const [showSignOut, setShowSignOut] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error || !currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser);
      const initialName =
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        currentUser.email?.split('@')[0] ||
        '';
      setNewName(initialName);

      // Fetch user's real projects/websites
      fetchUserWebsites(currentUser.id);
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWebsites = async (userId) => {
    try {
      setLoadingWebsites(true);

      // 1. Live published sites
      const { data: pubSites } = await supabase
        .from('published_sites')
        .select('*')
        .eq('user_id', userId);

      // 2. Draft saved websites
      const { data: draftSites } = await supabase
        .from('saved_websites')
        .select('*')
        .eq('user_id', userId);

      const publishedWebsiteIds = new Set(
        pubSites ? pubSites.map((p) => p.website_id).filter(Boolean) : []
      );

      const combined = [];

      if (pubSites && pubSites.length > 0) {
        pubSites.forEach((p) => {
          combined.push({
            id: p.website_id || p.subdomain,
            name: p.config?.businessName || p.config?.name || p.subdomain || 'Published Website',
            status: 'published',
            subdomain: p.subdomain,
            config: p.config,
            updatedAt: p.published_at || new Date().toISOString(),
          });
        });
      }

      if (draftSites && draftSites.length > 0) {
        draftSites.forEach((d) => {
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
              updatedAt: d.updated_at || new Date().toISOString(),
            });
          }
        });
      }

      // Sort by latest updated
      combined.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setWebsites(combined);
    } catch (err) {
      console.error('Error fetching websites:', err);
    } finally {
      setLoadingWebsites(false);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setSavingName(true);
      setNameError(null);
      setNameSuccess(false);

      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: newName.trim() },
      });

      if (error) throw error;

      if (data?.user) {
        setUser(data.user);
      }
      setIsEditingName(false);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err) {
      setNameError(err.message || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const copyUserId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const confirmSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center text-white/40 gap-3">
        <Loader2 className="animate-spin text-[#d4f000]" size={32} />
        <span className="text-xs uppercase tracking-widest font-bold">Loading Profile...</span>
      </div>
    );
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Flow User';

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'FL';

  const provider =
    user?.app_metadata?.provider ||
    (user?.identities && user?.identities[0]?.provider) ||
    'email';

  const publishedCount = websites.filter((w) => w.status === 'published').length;
  const draftCount = websites.filter((w) => w.status === 'draft').length;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col text-white font-sans" style={{ background: '#080808' }}>
      {/* Header */}
      <header className="w-full px-8 py-6 flex justify-between items-center border-b border-white/10 relative z-20 bg-[#080808]">
        <div className="flex items-center gap-6">
          <Link to="/home" className="text-2xl font-normal text-white" style={{ fontFamily: "'Pacifico', cursive" }}>
            flow
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 border-l border-white/10 pl-6">
            <User size={14} className="text-[#d4f000]" />
            <span>Account Profile</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/home"
            className="px-4 py-1.5 border border-white/10 text-[11px] uppercase tracking-widest font-bold transition-all text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2"
          >
            <ArrowLeft size={13} />
            <span>Dashboard</span>
          </Link>
          <button
            onClick={() => setShowSignOut(true)}
            className="px-4 py-1.5 border border-red-500/30 text-[11px] uppercase tracking-widest font-bold transition-all text-red-500 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 flex items-center gap-1.5"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8">
        {/* Top Profile Banner */}
        <div className="bg-[#0c0c0c] border border-white/10 p-8 lg:p-10 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 border-2 border-[#d4f000] object-cover"
                />
              ) : (
                <div
                  className="w-20 h-20 border-2 border-[#d4f000] flex items-center justify-center font-black text-2xl tracking-wider text-[#080808]"
                  style={{ background: ACCENT }}
                >
                  {initials}
                </div>
              )}
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0c0c0c] bg-[#d4f000]"
                title="Active"
              />
            </div>

            {/* Basic Info */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-white">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 border border-[#d4f000]/40 text-[#d4f000] text-[10px] font-bold uppercase tracking-widest bg-[#d4f000]/10">
                  {provider === 'google' ? 'Google Auth' : 'Verified User'}
                </span>
              </div>
              <p className="text-white/50 text-sm flex items-center gap-2">
                <Mail size={13} className="text-white/40" />
                {user?.email}
              </p>
              <div className="flex items-center gap-4 text-xs text-white/40 mt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-[#d4f000]" />
                  Joined {formatDate(user?.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats in Banner */}
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Total Sites</span>
              <span className="text-2xl font-black text-white">{websites.length}</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10 mx-2" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Published</span>
              <span className="text-2xl font-black text-[#d4f000]">{publishedCount}</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10 mx-2" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Drafts</span>
              <span className="text-2xl font-black text-white/70">{draftCount}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Account Information & Settings */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#0c0c0c] border border-white/10 p-6 lg:p-8 flex flex-col gap-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-[#d4f000]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">Account Details</h2>
                </div>
                {nameSuccess && (
                  <span className="text-[11px] font-bold text-[#d4f000] flex items-center gap-1 uppercase tracking-wider">
                    <Check size={13} /> Updated
                  </span>
                )}
              </div>

              {/* Display Name field */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-widest font-bold text-white/50">
                    Display Name
                  </label>
                  {!isEditingName && (
                    <button
                      onClick={() => {
                        setIsEditingName(true);
                        setNameError(null);
                      }}
                      className="text-xs text-[#d4f000] hover:underline flex items-center gap-1 font-semibold uppercase tracking-wider"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                </div>

                {isEditingName ? (
                  <form onSubmit={handleUpdateName} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/20 px-3 py-2 text-sm text-white focus:border-[#d4f000] focus:bg-white/10 outline-none"
                        placeholder="Enter full name"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={savingName || !newName.trim()}
                        className="px-3 py-2 bg-[#d4f000] text-[#080808] hover:bg-[#b8d000] transition-colors font-bold text-xs uppercase tracking-wider flex items-center gap-1 disabled:opacity-50"
                      >
                        {savingName ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingName(false);
                          setNewName(
                            user?.user_metadata?.full_name ||
                            user?.user_metadata?.name ||
                            user?.email?.split('@')[0] ||
                            ''
                          );
                          setNameError(null);
                        }}
                        className="px-3 py-2 border border-white/10 text-white/50 hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {nameError && <p className="text-red-400 text-xs">{nameError}</p>}
                  </form>
                ) : (
                  <div className="bg-white/5 border border-white/5 px-4 py-3 text-sm text-white font-medium">
                    {displayName}
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-white/50 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-[#d4f000] font-bold uppercase tracking-wider bg-[#d4f000]/10 px-2 py-0.5 border border-[#d4f000]/30">
                    Primary
                  </span>
                </label>
                <div className="bg-white/5 border border-white/5 px-4 py-3 text-sm text-white font-medium flex items-center justify-between">
                  <span className="truncate">{user?.email}</span>
                  <Mail size={14} className="text-white/30 flex-shrink-0" />
                </div>
              </div>

              {/* User ID */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-white/50">
                  User ID (UUID)
                </label>
                <div className="bg-white/5 border border-white/5 px-4 py-2.5 text-xs font-mono text-white/70 flex items-center justify-between">
                  <span className="truncate">{user?.id}</span>
                  <button
                    onClick={copyUserId}
                    className="p-1 hover:text-white text-white/40 transition-colors ml-2 flex-shrink-0"
                    title="Copy UUID"
                  >
                    {copiedId ? <Check size={14} className="text-[#d4f000]" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Sign In Method */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-white/50">
                  Authentication Method
                </label>
                <div className="bg-white/5 border border-white/5 px-4 py-3 text-xs text-white/80 flex items-center justify-between">
                  <span className="uppercase tracking-wider font-semibold">
                    {provider === 'google' ? 'Google OAuth 2.0' : 'Email & Password'}
                  </span>
                  <Key size={14} className="text-[#d4f000]" />
                </div>
              </div>

              {/* Session Information */}
              <div className="border-t border-white/10 pt-4 flex flex-col gap-3 text-xs text-white/40">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-white/30" /> Account Created
                  </span>
                  <span className="text-white/70 font-medium">{formatDate(user?.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} className="text-white/30" /> Last Signed In
                  </span>
                  <span className="text-white/70 font-medium">{formatDateTime(user?.last_sign_in_at)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-[#0c0c0c] border border-white/10 p-6 flex flex-col gap-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Account Actions</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/home"
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-widest text-center transition-colors flex items-center justify-center gap-2"
                >
                  <Layers size={14} /> Open Projects
                </Link>
                <button
                  onClick={() => setShowSignOut(true)}
                  className="flex-1 py-3 px-4 border border-red-500/30 text-red-500 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 font-bold text-xs uppercase tracking-widest text-center transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: User's Projects & Websites */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-[#0c0c0c] border border-white/10 p-6 lg:p-8 flex flex-col shadow-xl min-h-[500px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-[#d4f000]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">Your Flow Websites</h2>
                </div>
                <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">
                  {websites.length} {websites.length === 1 ? 'Project' : 'Projects'}
                </span>
              </div>

              {loadingWebsites ? (
                <div className="flex-1 flex flex-col items-center justify-center text-white/40 gap-3 py-16">
                  <Loader2 className="animate-spin text-[#d4f000]" size={24} />
                  <span className="text-xs uppercase tracking-widest">Loading projects...</span>
                </div>
              ) : websites.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10">
                  <Globe size={36} className="text-white/20 mb-3" />
                  <h3 className="text-base font-bold text-white mb-1 uppercase tracking-wider">No Websites Created Yet</h3>
                  <p className="text-white/40 text-xs max-w-sm mb-6">
                    You haven't built any websites yet. Start generating with Flow AI to create high-converting websites in seconds.
                  </p>
                  <button
                    onClick={() => navigate('/aibuilder')}
                    className="px-6 py-3 bg-[#d4f000] text-[#080808] hover:bg-[#b8d000] font-black text-xs uppercase tracking-widest transition-all"
                  >
                    Build First Website
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[600px] pr-1">
                  {websites.map((site) => {
                    const isPublished = site.status === 'published';
                    return (
                      <div
                        key={site.id}
                        className="bg-white/5 border border-white/10 p-4 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-9 h-9 flex-shrink-0 flex items-center justify-center font-bold text-xs"
                            style={{
                              background: isPublished ? `${ACCENT}20` : 'rgba(255,255,255,0.05)',
                              color: isPublished ? ACCENT : 'rgba(255,255,255,0.6)',
                              border: isPublished ? `1px solid ${ACCENT}40` : '1px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            <Globe size={16} />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-white tracking-wide">{site.name}</span>
                              <span
                                className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
                                  isPublished
                                    ? 'bg-[#d4f000]/10 text-[#d4f000] border-[#d4f000]/30'
                                    : 'bg-white/5 text-white/50 border-white/10'
                                }`}
                              >
                                {isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>

                            {site.subdomain && (
                              <a
                                href={`https://${site.subdomain}.flowbuilder.com`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[#d4f000]/80 hover:text-[#d4f000] flex items-center gap-1 font-mono tracking-tight"
                              >
                                {site.subdomain}.flowbuilder.com
                                <ExternalLink size={10} />
                              </a>
                            )}

                            <span className="text-[11px] text-white/40 mt-0.5">
                              Updated {formatDate(site.updatedAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => navigate('/workspace', { state: { site } })}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center gap-1.5"
                          >
                            <span>Workspace</span>
                            <ExternalLink size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h3 className="text-xl font-bold text-white/90 mb-2">Sign Out</h3>
            <p className="text-white/40 text-sm mb-8">Are you sure you want to sign out of your Flow account?</p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowSignOut(false)}
                className="flex-1 py-3 border border-white/10 text-white/40 hover:text-white/90 hover:bg-white/5 text-[11px] uppercase tracking-widest font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="flex-1 py-3 bg-red-500 text-white hover:bg-red-600 text-[11px] uppercase tracking-widest font-bold transition-colors"
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
