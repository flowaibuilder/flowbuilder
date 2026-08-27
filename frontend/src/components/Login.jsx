import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccessMessage(null);
    setName('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) throw error;
        
        if (!data.session) {
          setSuccessMessage(`A verification link has been sent to ${email}. Please verify your email to log in.`);
        } else {
          navigate(from, { replace: true });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const ACCENT = '#d4f000';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-white" style={{ background: '#080808', fontFamily: "'Noto Sans Thai', sans-serif" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden border-r border-white/5">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }} />
        </div>
        <div className="relative z-10">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="text-white text-2xl font-normal" style={{fontFamily: "'Pacifico', cursive"}}>flow</span>
            <span className="text-white/50 text-sm font-medium tracking-wide">AI Builder</span>
          </Link>
        </div>
        <div className="relative z-10 max-w-md">
          <blockquote className="text-white/80 text-3xl font-light leading-tight mb-8">
            "The tools that amplify <span className="font-bold" style={{ color: ACCENT }}>human creativity</span> are the ones that change the world."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none flex items-center justify-center font-bold text-sm" style={{ background: ACCENT, color: '#080808' }}>AI</div>
            <div>
              <p className="font-semibold text-sm">FLOW AI</p>
              <p className="text-white/40 text-xs">Building the future, one prompt at a time</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex gap-6">
          {['AI Website Builder', 'Data Agent', 'Real-time Preview'].map(f => (
            <div key={f} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
              <span className="text-white/40 text-xs uppercase tracking-wider font-semibold">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#080808] relative overflow-y-auto">
        {/* Subtle glow behind form on mobile */}
        <div className="lg:hidden absolute top-0 right-0 w-full h-[300px] rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }} />
        
        <div className="w-full max-w-sm relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-10 transition-colors uppercase tracking-wider font-semibold">
            <ArrowLeft size={14} />
            Back to home
          </Link>

          {successMessage ? (
            <div className="text-center py-10 bg-white/5 border border-white/10 rounded-none p-8">
              <div className="w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-6" style={{ background: `${ACCENT}20`, color: ACCENT }}>
                <MailCheck size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Check your email</h2>
              <p className="text-white/50 mb-8 leading-relaxed text-sm">{successMessage}</p>
              <button
                onClick={() => {
                  setSuccessMessage(null);
                  setIsSignUp(false);
                }}
                className="w-full font-bold py-3.5 px-4 rounded-none transition-transform hover:-translate-y-0.5 uppercase tracking-wider text-sm"
                style={{ background: ACCENT, color: '#080808' }}
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                  {isSignUp ? 'Create an account' : 'Welcome back'}
                </h1>
                <p className="text-white/40 text-sm">
                  {isSignUp ? 'Start building with AI today.' : 'Sign in to continue to your workspace.'}
                </p>
              </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 px-4 rounded-none transition-all flex justify-center items-center gap-3 mb-8 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 uppercase tracking-wider text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-[#080808] text-white/30 uppercase tracking-widest font-semibold">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {/* Name field — signup only */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-none border border-white/10 outline-none transition-all text-white text-sm bg-white/5 focus:bg-white/10 focus:border-[#d4f000]"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-none border border-white/10 outline-none transition-all text-white text-sm bg-white/5 focus:bg-white/10 focus:border-[#d4f000]"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-none border border-white/10 outline-none transition-all text-white text-sm bg-white/5 focus:bg-white/10 focus:border-[#d4f000]"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Confirm Password — signup only */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-none border outline-none transition-all text-white text-sm bg-white/5 focus:bg-white/10 ${
                    confirmPassword && confirmPassword !== password ? 'border-red-500/50' : 'border-white/10 focus:border-[#d4f000]'
                  }`}
                  placeholder="••••••••"
                  required
                />
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-red-400 text-xs mt-2 font-medium">Passwords do not match</p>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-none">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isSignUp && confirmPassword && confirmPassword !== password)}
              className="w-full font-bold py-3.5 px-4 rounded-none transition-transform flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 uppercase tracking-wider text-sm"
              style={{ background: ACCENT, color: '#080808' }}
            >
              {loading ? <Loader2 className="animate-spin text-[#080808]" size={18} /> : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={switchMode}
              className="text-sm text-white/40 hover:text-white transition-colors font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
