import React, { useState } from 'react';
import { LogIn, UserPlus, Lock, Mail, User, Loader2, Sparkles, CheckCircle2, Briefcase, Target, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMsg('');

    if (mode === 'login') {
      const ok = await login({ email, password });
      if (ok) {
        setSuccessMsg('Successfully signed in!');
      }
    } else {
      const ok = await register({ name, email, password });
      if (ok) {
        setSuccessMsg('Account created successfully!');
      }
    }
  };

  const handleDemoLogin = async () => {
    clearError();
    setSuccessMsg('');
    const demoEmail = 'demo@jobhuntos.com';
    const demoPassword = 'password123';
    const demoName = 'Demo User';

    let ok = await login({ email: demoEmail, password: demoPassword });
    if (!ok) {
      ok = await register({ name: demoName, email: demoEmail, password: demoPassword });
    }

    if (ok) {
      setSuccessMsg('Connected to Demo Account!');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden relative selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Dynamic Ambient Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[160px] pointer-events-none" />

      <div className="flex flex-1 w-full max-w-7xl mx-auto z-10 p-4 sm:p-6 lg:p-12 items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          
          {/* Left Column - Branding & Info */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Job Hunt Operating System
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Master Your Career Search with <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Job Hunt OS
                </span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
                Track applications, organize interview preparation, manage resumes, and visualize metrics—backed by Node.js, Express & MongoDB.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-none backdrop-blur-sm flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-3">
                  <Briefcase size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-200 text-sm">Kanban & Pipeline</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Drag-and-drop job application workflow</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-none backdrop-blur-sm flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
                  <Target size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-200 text-sm">Interview Hub</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Prepare questions & schedule timeline</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-none backdrop-blur-sm flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-200 text-sm">Secure MongoDB API</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">JWT encrypted multi-device cloud storage</p>
              </div>
            </div>
          </div>

          {/* Right Column - Auth Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="relative bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl">
              
              {/* Card Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-xl shadow-cyan-500/25 mb-4">
                  {mode === 'login' ? <LogIn className="w-7 h-7 text-white" /> : <UserPlus className="w-7 h-7 text-white" />}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {mode === 'login' ? 'Sign In to Job Hunt OS' : 'Create Your Account'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {mode === 'login' ? 'Enter credentials to unlock your workspace' : 'Fill details below to register a new account'}
                </p>
              </div>

              {/* Toggle Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-950/80 p-1.5 rounded-2xl mb-6 border border-slate-200 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    clearError();
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    clearError();
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-ping" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 dark:text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all text-sm mt-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Authenticating...
                    </>
                  ) : mode === 'login' ? (
                    'Sign In & Enter'
                  ) : (
                    'Create Account & Enter'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white dark:bg-slate-900 px-3 text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
                  Quick Access
                </span>
              </div>

              {/* Demo Account Button */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                One-Click Demo Account Login
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
