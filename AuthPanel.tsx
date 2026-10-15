import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Calendar, 
  Image, 
  Info, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  Zap, 
  Shield, 
  Gamepad2, 
  Key, 
  Check, 
  Copy 
} from 'lucide-react';
import { LogoComponent } from './components.tsx';
import { api } from './apiClient.ts';

interface AuthPanelProps {
  onAuthSuccess: (userData: any) => void;
  onCancel?: () => void;
}

export const DEMO_CREDENTIALS = {
  pilot: {
    role: 'pilot' as const,
    name: 'Demo Pilot',
    badge: 'PRO GAMER',
    username: 'demo_pilot',
    email: 'pilot@encarto.gg',
    password: 'EncartoDemo2026!',
    tagline: 'Rank 14 Gladiator • 350.00 M3GA Coins • Arena Pass Unlocked',
    gradient: 'from-purple-900/60 to-cyan-950/60',
    borderColor: 'border-cyan-400/40 hover:border-cyan-300',
    accentColor: 'text-cyan-300',
  },
  admin: {
    role: 'admin' as const,
    name: 'Demo Commander',
    badge: 'SYSTEM ADMIN',
    username: 'demo_admin',
    email: 'admin@encarto.gg',
    password: 'EncartoAdmin2026!',
    tagline: 'Level 99 Commander • 2,500.00 M3GA Coins • Full Control Panel',
    gradient: 'from-purple-950/80 to-indigo-900/60',
    borderColor: 'border-purple-500/40 hover:border-purple-300',
    accentColor: 'text-purple-300',
  },
};

const AuthPanel: React.FC<AuthPanelProps> = ({ onAuthSuccess, onCancel }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'pilot' | 'admin' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedRole, setCopiedRole] = useState<'pilot' | 'admin' | null>(null);
  const [autofillSuccess, setAutofillSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    birthday: '',
    profilePic: '',
    bio: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage(null);
    if (autofillSuccess) setAutofillSuccess(null);
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[e.target.name];
        return copy;
      });
    }
  };

  const handleInstantDemoLogin = async (role: 'pilot' | 'admin') => {
    setDemoLoading(role);
    setErrorMessage(null);
    try {
      const res = await api.loginDemo(role);
      if (res.user) {
        onAuthSuccess(res.user);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo initialization failed. Please try again.');
    } finally {
      setDemoLoading(null);
    }
  };

  const handleAutofillDemo = (role: 'pilot' | 'admin') => {
    const cred = DEMO_CREDENTIALS[role];
    setFormData({
      ...formData,
      username: cred.username,
      email: cred.email,
      password: cred.password,
      confirmPassword: cred.password,
    });
    setErrorMessage(null);
    setAutofillSuccess(`Populated credentials for ${cred.name} (${cred.username}). Click "LOGIN TO STATION" or use Instant Login!`);
    setIsLogin(true);
  };

  const handleCopyCredentials = (role: 'pilot' | 'admin', e: React.MouseEvent) => {
    e.stopPropagation();
    const cred = DEMO_CREDENTIALS[role];
    navigator.clipboard?.writeText(`Username: ${cred.username}\nPassword: ${cred.password}\nEmail: ${cred.email}`);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setValidationErrors({});
    setAutofillSuccess(null);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setErrorMessage("Transmission abort: Passwords do not match.");
      return;
    }

    if (!isLogin && formData.password.length < 8) {
      setErrorMessage("Security standard: Password must contain at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({
          emailOrUsername: formData.email || formData.username,
          password: formData.password,
        });

        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.user) {
          onAuthSuccess(res.user);
        }
      } else {
        const res = await api.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          birthday: formData.birthday || undefined,
          bio: formData.bio || undefined,
          avatarUrl: formData.profilePic || undefined,
        });

        if (res.error) {
          setErrorMessage(res.error);
          if (res.details) {
            const fieldMap: Record<string, string> = {};
            res.details.forEach((d) => {
              fieldMap[d.field] = d.message;
            });
            setValidationErrors(fieldMap);
          }
        } else if (res.user) {
          onAuthSuccess(res.user);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network handshake failed. Please verify server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050010] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-700 relative">
      {/* Background Decorative Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-purple-600/15 blur-[130px] rounded-full animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-cyan-600/15 blur-[130px] rounded-full animate-pulse"
          style={{ animationDelay: '1.2s' }}
        />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-12 glass-panel rounded-[2.5rem] overflow-hidden border border-purple-500/25 shadow-2xl shadow-purple-950/60 relative z-10 backdrop-blur-2xl">
        
        {/* Left Column: Branding & Demo Quick-Pick (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0c0722] via-[#100b2b] to-[#070518] p-8 md:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-purple-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 blur-[90px] rounded-full pointer-events-none" />

          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl p-3 shadow-[0_0_25px_rgba(168,85,247,0.5)] border border-white/20">
                <LogoComponent className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="anime-title text-3xl text-white uppercase tracking-tight flex items-center gap-1.5">
                  <span>ENCARTO</span>
                  <span className="text-cyan-300 font-mono text-sm tracking-normal">.GG</span>
                </h1>
                <p className="text-cyan-300/80 text-[9px] font-black uppercase tracking-[0.3em]">Next-Gen Esports Station</p>
              </div>
            </div>

            <p className="text-gray-300 text-xs font-medium leading-relaxed pt-2">
              Step into the high-stakes arena. Explore tournaments, real-time battle arenas, tactical PvP duels, and team rankings.
            </p>
          </div>

          {/* Quick Demo Access Spotlight Card */}
          <div className="my-6 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.15)] relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={15} className="text-cyan-300 fill-cyan-400" />
                <span className="text-[10px] font-black text-cyan-200 uppercase tracking-widest">
                  Quick Demo Access
                </span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
                READY TO TEST
              </span>
            </div>

            <p className="text-[11px] text-zinc-300 mb-3 leading-snug">
              Instant pre-configured credentials with unlocked funds, rank ratings, and game passes:
            </p>

            <div className="space-y-2.5">
              {/* Demo Player Card */}
              <div className="p-3 rounded-xl bg-black/40 border border-cyan-400/25 hover:border-cyan-400/60 transition-all group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Gamepad2 size={14} className="text-cyan-300" />
                    <span className="text-xs font-black text-white">Pilot (Pro Gamer)</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    PLAYER
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono space-y-0.5 mb-2.5">
                  <p>User: <span className="text-white font-bold">demo_pilot</span></p>
                  <p>Pass: <span className="text-white font-bold">EncartoDemo2026!</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={demoLoading !== null}
                    onClick={() => handleInstantDemoLogin('pilot')}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-[10px] uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {demoLoading === 'pilot' ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} className="fill-black" />}
                    <span>1-Click Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutofillDemo('pilot')}
                    className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 text-[9px] font-bold uppercase transition-all"
                    title="Fill into form inputs"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleCopyCredentials('pilot', e)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-all"
                    title="Copy credentials"
                  >
                    {copiedRole === 'pilot' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              {/* Demo Admin Card */}
              <div className="p-3 rounded-xl bg-black/40 border border-purple-500/25 hover:border-purple-500/60 transition-all group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-purple-300" />
                    <span className="text-xs font-black text-white">Commander (Admin)</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    ADMIN
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono space-y-0.5 mb-2.5">
                  <p>User: <span className="text-white font-bold">demo_admin</span></p>
                  <p>Pass: <span className="text-white font-bold">EncartoAdmin2026!</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={demoLoading !== null}
                    onClick={() => handleInstantDemoLogin('admin')}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_12px_rgba(168,85,247,0.4)] flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {demoLoading === 'admin' ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                    <span>1-Click Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutofillDemo('admin')}
                    className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 border border-white/10 text-[9px] font-bold uppercase transition-all"
                    title="Fill into form inputs"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleCopyCredentials('admin', e)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-all"
                    title="Copy credentials"
                  >
                    {copiedRole === 'admin' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle between Login and Register */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMessage(null);
                setAutofillSuccess(null);
                setValidationErrors({});
              }}
              className="w-full py-3 px-4 bg-purple-950/50 border border-purple-500/30 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-900/60 transition-all flex items-center justify-center gap-2 hover:border-cyan-400/50"
            >
              <span>{isLogin ? 'CREATE NEW LEGION ACCOUNT' : 'LOGIN WITH EXISTING CREDENTIALS'}</span>
              <Sparkles size={14} className="text-cyan-300" />
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Form & Demo Banner (7 Cols) */}
        <div className="lg:col-span-7 p-8 md:p-12 bg-black/65 backdrop-blur-xl flex flex-col justify-center">
          <header className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="anime-title text-3xl md:text-4xl text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  {isLogin ? 'Station Login' : 'Enlist New Pilot'}
                </h2>
                <p className="text-cyan-300/80 text-[10px] font-black uppercase tracking-widest mt-1">
                  {isLogin ? 'Enter your credentials or choose a demo pilot below' : 'Fill in your player profile to join'}
                </p>
              </div>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider"
                >
                  Back
                </button>
              )}
            </div>
          </header>

          {/* Autofill Notification Banner */}
          {autofillSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-400/40 flex items-center gap-2.5 text-cyan-200 text-xs font-medium animate-in fade-in">
              <Check size={16} className="text-cyan-300 shrink-0" />
              <span>{autofillSuccess}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs font-bold animate-in fade-in">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{errorMessage}</p>
                {isLogin && (
                  <p className="text-[11px] font-normal text-red-200/80">
                    Tip: You can use the instant 1-Click Demo buttons on the left or click "Fill" to autofill!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Login / Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors"
                    size={18}
                  />
                  <input
                    name="username"
                    required
                    value={formData.username}
                    placeholder="USERNAME"
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all placeholder:text-gray-600"
                  />
                  {validationErrors.username && (
                    <span className="text-[10px] text-red-400 font-bold ml-2 mt-1 block">
                      {validationErrors.username}
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors"
                    size={18}
                  />
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all uppercase placeholder:text-gray-600"
                  />
                </div>
              </div>
            )}

            {/* Email or Username Input */}
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors"
                size={18}
              />
              <input
                type={isLogin ? 'text' : 'email'}
                name="email"
                required
                value={formData.email}
                placeholder={isLogin ? 'EMAIL OR USERNAME (e.g. demo_pilot)' : 'EMAIL ADDRESS'}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all placeholder:text-gray-600"
              />
              {validationErrors.email && (
                <span className="text-[10px] text-red-400 font-bold ml-2 mt-1 block">
                  {validationErrors.email}
                </span>
              )}
            </div>

            {!isLogin && (
              <>
                <div className="relative group">
                  <Image
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors"
                    size={18}
                  />
                  <input
                    type="url"
                    name="profilePic"
                    value={formData.profilePic}
                    placeholder="AVATAR IMAGE URL (OPTIONAL)"
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all placeholder:text-gray-600"
                  />
                </div>
                <div className="relative group">
                  <Info
                    className="absolute left-4 top-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors"
                    size={18}
                  />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    placeholder="BIO / GAMING TAGLINE (OPTIONAL)"
                    rows={2}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all resize-none placeholder:text-gray-600"
                  />
                </div>
              </>
            )}

            {/* Password Input */}
            <div className="space-y-4">
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors"
                  size={18}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  placeholder="PASSWORD (e.g. EncartoDemo2026!)"
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {!isLogin && (
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    placeholder="CONFIRM PASSWORD"
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all placeholder:text-gray-600"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || demoLoading !== null}
              className="w-full py-4.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-purple-950/50 hover:shadow-cyan-500/30 hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-3 mt-4 border border-white/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-cyan-300" />
                  <span>TRANSMITTING CREDENTIALS...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'LOGIN TO STATION' : 'COMMENCE REGISTRATION'}</span>
                  <ArrowRight size={18} className="text-cyan-300" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Footer Prompt */}
          <div className="mt-6 pt-5 border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-2">
              <Key size={14} className="text-cyan-300" />
              <span>Looking for demo credentials?</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('pilot')}
                className="text-cyan-300 hover:text-white font-bold underline transition"
              >
                Instant Pilot Access
              </button>
              <span className="text-zinc-600">•</span>
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('admin')}
                className="text-purple-300 hover:text-white font-bold underline transition"
              >
                Instant Admin Access
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPanel;
