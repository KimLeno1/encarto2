import React, { useState } from 'react';
import { Mail, Lock, User, Calendar, Image, Info, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { LogoComponent } from './components';
import { api } from './apiClient';

interface AuthPanelProps {
  onAuthSuccess: (userData: any) => void;
}

const AuthPanel: React.FC<AuthPanelProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[e.target.name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setValidationErrors({});

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
    <div className="min-h-screen bg-[#050010] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-700">
      {/* Background Decorative Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="w-full max-w-4xl grid lg:grid-cols-2 glass-panel rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10 relative z-10">
        {/* Left Side: Branding & Toggle */}
        <div className="bg-gradient-to-br from-indigo-900/40 via-purple-950/20 to-black p-10 flex flex-col items-center justify-center text-center space-y-8 border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
          <div className="absolute w-64 h-64 border border-purple-500/10 rounded-full animate-spin-slow opacity-20" />

          <div className="relative">
            <div className="bg-indigo-600 rounded-2xl p-4 shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-white/20">
              <LogoComponent className="w-24 h-24 text-white" />
            </div>
            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-30 -z-10 animate-pulse" />
          </div>

          <div>
            <h1 className="anime-title text-6xl text-white uppercase tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              ENCARTO
            </h1>
            <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.4em]">The Pro Gaming Hub</p>
          </div>

          <div className="space-y-4 w-full max-w-xs relative z-10">
            <p className="text-gray-300 text-sm font-medium px-4 leading-relaxed">
              {isLogin
                ? 'New to the arena? Join the global legion of pro gamers today.'
                : 'Already a veteran? Sign back in to claim your tournament seats.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMessage(null);
                setValidationErrors({});
              }}
              className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all flex items-center justify-center gap-2 hover:border-indigo-500/50"
            >
              {isLogin ? 'CREATE LEGION ACCOUNT' : 'LOGIN TO STATION'}
              <Sparkles size={14} className="text-purple-400" />
            </button>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-10 md:p-14 bg-black/60 backdrop-blur-xl flex flex-col justify-center border-l border-white/5">
          <header className="mb-8 text-center lg:text-left">
            <h2 className="anime-title text-4xl text-white uppercase tracking-tight">
              {isLogin ? 'Welcome Back' : 'Enlist Now'}
            </h2>
            <p className="text-purple-400/60 text-[10px] font-black uppercase tracking-widest mt-1">
              {isLogin ? 'Identify yourself, Pilot.' : 'Input your vital data to begin.'}
            </p>
          </header>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs font-bold animate-in fade-in">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all placeholder:text-gray-600"
                  />
                  {validationErrors.username && (
                    <span className="text-[10px] text-red-400 font-bold ml-2 mt-1 block">
                      {validationErrors.username}
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors"
                    size={18}
                  />
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all uppercase placeholder:text-gray-600"
                  />
                </div>
              </div>
            )}

            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors"
                size={18}
              />
              <input
                type={isLogin ? 'text' : 'email'}
                name="email"
                required
                value={formData.email}
                placeholder={isLogin ? 'EMAIL OR USERNAME' : 'EMAIL ADDRESS'}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder:text-gray-600"
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
                    placeholder="PROFILE PICTURE URL (OPTIONAL)"
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all placeholder:text-gray-600"
                  />
                </div>
                <div className="relative group">
                  <Info
                    className="absolute left-4 top-4 text-gray-500 group-focus-within:text-blue-400 transition-colors"
                    size={18}
                  />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    placeholder="TELL US ABOUT YOUR GAMING JOURNEY (BIO)"
                    rows={2}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none placeholder:text-gray-600"
                  />
                </div>
              </>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors"
                  size={18}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  placeholder="PASSWORD"
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder:text-gray-600"
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    placeholder="CONFIRM PASSWORD"
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all placeholder:text-gray-600"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-purple-900/30 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4 border border-white/10 disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  {isLogin ? 'LOGIN TO STATION' : 'COMMENCE REGISTRATION'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPanel;
