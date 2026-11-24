import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  ListOrdered, 
  HelpCircle, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Lock, 
  User, 
  Mail, 
  ShieldCheck,
  ChevronRight,
  Database,
  Sun,
  Moon
} from 'lucide-react';
import { signupUser, loginUser } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function LandingAuthPage({ onLoginSuccess, onShowToast }) {
  const { theme, toggleTheme } = useTheme();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMode === 'signup') {
        const res = await signupUser({ name, email, password });
        onLoginSuccess(res.user);
        if (onShowToast) onShowToast(`Welcome, ${res.user.name}! Account created.`, 'success');
      } else {
        const res = await loginUser({ email, password });
        onLoginSuccess(res.user);
        if (onShowToast) onShowToast(`Welcome back, ${res.user.name}!`, 'success');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestUserLogin = () => {
    const guestUser = {
      id: "usr_guest_demo",
      name: "Guest Teacher / Evaluator",
      email: "evaluator@test.local",
      created_at: new Date().toISOString()
    };
    onLoginSuccess(guestUser);
    if (onShowToast) onShowToast("Logged in as Demo / Test User! You can now test the dashboard directly.", "success");
  };

  const steps = [
    {
      step: "01",
      title: "Upload or Draw",
      desc: "Upload handwritten document photos, scans, or write directly on our interactive whiteboard canvas.",
      icon: UploadCloud,
      color: "blue"
    },
    {
      step: "02",
      title: "Instant AI Transcription",
      desc: "Multimodal AI accurately decodes cursive, print, and noisy handwriting from top to bottom.",
      icon: Sparkles,
      color: "indigo"
    },
    {
      step: "03",
      title: "AI Analysis & Q&A",
      desc: "Get intelligent document summaries, key points, and instant answers to recommended questions.",
      icon: HelpCircle,
      color: "purple"
    },
    {
      step: "04",
      title: "Save & Multi-Format Export",
      desc: "Save documents to your personal database and export to TXT, Word DOCX, PDF, or JSON.",
      icon: Download,
      color: "emerald"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Top Simple Brand Bar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                Handwriting AI
              </span>
              <p className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                Document Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            {/* Theme Toggle Button on Landing / Auth Page */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-600 transition-colors cursor-pointer mr-1"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-purple-700" />
              )}
            </button>

            <button
              onClick={handleTestUserLogin}
              className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-all font-bold cursor-pointer"
            >
              Demo / Test User
            </button>

            <button
              onClick={() => {
                setAuthMode('login');
                document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-purple-600 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800">
          <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span>Next-Generation Handwriting Intelligence</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
          Turn Handwriting Into Usable Digital Knowledge.
        </h1>

        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Instantly transcribe handwritten notes, letters, assignments, and documents with AI. Understand core themes, extract key insights, and save everything securely to your workspace.
        </p>

        <div className="pt-2 flex justify-center">
          <a
            href="#auth-section"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <span>Start Transcribing Now</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Feature Steps Grid */}
      <section className="py-8 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            How It Works in 4 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            From handwritten scans to searchable digital documents in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black text-slate-300 dark:text-slate-700 font-mono">
                    {st.step}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Auth / Login / Signup Section */}
      <section id="auth-section" className="py-16 px-4 sm:px-6 max-w-md mx-auto">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {authMode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {authMode === 'signup'
                ? 'Sign up to transcribe documents and save them to your database.'
                : 'Sign in to access your transcription dashboard and documents.'}
            </p>
          </div>

          {/* Toggle Pills */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => { setAuthMode('login'); setError(null); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setError(null); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Please wait...' : authMode === 'signup' ? 'Create Account' : 'Sign In to Dashboard'}
            </button>

            <button
              type="button"
              onClick={handleTestUserLogin}
              className="w-full py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <User className="h-3.5 w-3.5" />
              <span>Instant Test / Demo Access</span>
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            {authMode === 'signup' ? (
              <span>Already have an account? <button onClick={() => setAuthMode('login')} className="text-purple-600 dark:text-purple-400 font-bold hover:underline">Sign In</button></span>
            ) : (
              <span>New here? <button onClick={() => setAuthMode('signup')} className="text-purple-600 dark:text-purple-400 font-bold hover:underline">Create an account</button></span>
            )}
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        Handwriting AI • SQLite Persistent Database Protected
      </footer>

    </div>
  );
}
